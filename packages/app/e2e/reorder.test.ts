import { expect, type Locator, type Page, test } from '@playwright/test';

const APP_PATH = '/lebenslauf-anschreiben-creator/';
const DRAG_LABEL = /Drag to reorder|Zum Sortieren ziehen/;
const FIRST = 'Senior Software Engineer';
const SECOND = 'Full-Stack Developer';
const OVER_FIRST_POSITION = /Position 1 (of|von) 2/i;

function entrySummary(page: Page, title: string): Locator {
  return page.locator('span.truncate', { hasText: title });
}

function dragHandleOf(page: Page, title: string): Locator {
  return entrySummary(page, title).locator('..').getByRole('button', { name: DRAG_LABEL });
}

async function previewEntryTitles(page: Page): Promise<string[]> {
  const iframe = await page.waitForSelector('iframe[title="CV render"]');
  const frame = await iframe.contentFrame();
  if (!frame) return [];
  return frame
    .locator('.pagedjs_page .cv-entry-title')
    .filter({ hasText: new RegExp(`${FIRST}|${SECOND}`) })
    .allInnerTexts()
    .catch(() => []);
}

async function expectOverFirstPosition(page: Page) {
  await expect(page.getByRole('status').filter({ hasText: OVER_FIRST_POSITION })).toHaveCount(1);
}

async function summaryTop(page: Page, title: string): Promise<number> {
  const box = await entrySummary(page, title).boundingBox();
  if (!box) throw new Error(`No summary rendered for ${title}`);
  return box.y;
}

test.beforeEach(async ({ page }) => {
  await page.goto(APP_PATH);
  await page.getByRole('button', { name: /^(Main|Hauptbereich)$/ }).click();
  await expect(entrySummary(page, SECOND)).toBeVisible();
  await expect.poll(() => previewEntryTitles(page), { timeout: 15_000 }).toEqual([FIRST, SECOND]);
});

test('dragging an entry by its handle reorders the section', async ({ page }) => {
  await dragHandleOf(page, SECOND).scrollIntoViewIfNeeded();
  const handle = await dragHandleOf(page, SECOND).boundingBox();
  const target = await dragHandleOf(page, FIRST).boundingBox();
  if (!handle || !target) throw new Error('Drag handles not rendered');

  await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
  await page.mouse.down();
  await page.mouse.move(handle.x + handle.width / 2, target.y, { steps: 12 });
  await page.mouse.move(handle.x + handle.width / 2, target.y - 4, { steps: 4 });
  await expectOverFirstPosition(page);
  await page.mouse.up();

  await expect
    .poll(async () => (await summaryTop(page, SECOND)) < (await summaryTop(page, FIRST)))
    .toBe(true);
  await expect.poll(() => previewEntryTitles(page), { timeout: 15_000 }).toEqual([SECOND, FIRST]);
});

test('entries can be reordered with the keyboard', async ({ page }) => {
  await dragHandleOf(page, SECOND).focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowUp');
  await expectOverFirstPosition(page);
  await page.keyboard.press('Space');

  await expect
    .poll(async () => (await summaryTop(page, SECOND)) < (await summaryTop(page, FIRST)))
    .toBe(true);
  await expect.poll(() => previewEntryTitles(page), { timeout: 15_000 }).toEqual([SECOND, FIRST]);
});

test('clicking a drag handle does not toggle the entry', async ({ page }) => {
  const card = entrySummary(page, SECOND).locator('xpath=ancestor::div[@role="button"]/..');
  const contentBefore = await card.locator('> div').nth(1).getAttribute('class');
  await dragHandleOf(page, SECOND).click();
  await expect(card.locator('> div').nth(1)).toHaveAttribute('class', contentBefore ?? '');
});
