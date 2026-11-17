import { expect, type Page, test } from '@playwright/test';
import { sampleResume } from '@cv/core';

const APP_PATH = '/lebenslauf-anschreiben-creator/';
const RESUME_STORAGE_KEY = 'cv-creator/resume/v1';
const FILLER_SENTENCE =
  'Verantwortlich für Architekturentscheidungen, Code-Reviews und die kontinuierliche Verbesserung der Entwicklungsprozesse im Team. ';

async function renderResume(page: Page, summarySentences: number) {
  const resume = {
    ...sampleResume,
    basics: {
      ...sampleResume.basics,
      summary: `${sampleResume.basics.summary} ${FILLER_SENTENCE.repeat(summarySentences)}`,
    },
    work: sampleResume.work.map((entry, index) =>
      index === 0 ? { ...entry, summary: FILLER_SENTENCE.repeat(6) } : entry,
    ),
  };
  await page.evaluate(
    ([key, value]) => {
      localStorage.setItem(key, value);
    },
    [RESUME_STORAGE_KEY, JSON.stringify({ state: { resume }, version: 0 })] as const,
  );
  await page.reload();
  const iframe = await page.waitForSelector('iframe[title="CV render"]');
  const frame = await iframe.contentFrame();
  if (!frame) throw new Error('CV render iframe has no frame');
  await frame.waitForFunction(() => '__cvPaginationDone' in window, null, { timeout: 15_000 });
  return frame;
}

test('section titles stay on the page of their first entry', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto(APP_PATH);

  for (let sentences = 0; sentences <= 16; sentences++) {
    const frame = await renderResume(page, sentences);
    const orphanedTitles = await frame.evaluate(() =>
      [...document.querySelectorAll('.pagedjs_page .cv-section-title')]
        .filter(
          (title) =>
            title.closest('.cv-section')?.textContent?.trim() === title.textContent?.trim(),
        )
        .map((title) => title.textContent),
    );
    expect(orphanedTitles, `summary padded with ${sentences} sentences`).toEqual([]);
  }
});
