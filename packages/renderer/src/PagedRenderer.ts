import { registerBreakAfterAvoid } from './breakAfterAvoid.js';
import { PRINT_ROOT_ATTRIBUTE } from './print.js';

/**
 *
 */
export interface PagedRendererOptions {
  pagedPolyfillUrl: string;
}

/**
 *
 */
export interface RenderResult {
  pageCount: number;
  sidebarOverflow: boolean;
}

/**
 * Renders HTML+CSS inside a fully-isolated iframe using Paged.js for
 * pagination. The iframe is displayed directly as the preview and can
 * be printed via the browser's native print dialog for vector PDF output.
 */
export class PagedRenderer {
  private readonly host: HTMLElement;
  private readonly options: PagedRendererOptions;
  private iframe: HTMLIFrameElement | null = null;
  private renderSeq = 0;

  constructor(host: HTMLElement, options: PagedRendererOptions) {
    this.host = host;
    this.host.setAttribute(PRINT_ROOT_ATTRIBUTE, '');
    this.options = options;
  }

  /**
   *
   * @param html
   * @param css
   * @returns Render result with page count
   */
  async render(html: string, css: string): Promise<RenderResult> {
    const seq = ++this.renderSeq;
    const doc = this.buildDocument(css, html);

    const iframe = document.createElement('iframe');
    iframe.title = 'CV render';
    Object.assign(iframe.style, {
      display: 'block',
      width: '210mm',
      height: '500mm', // tall enough for Paged.js layout computation
      border: '0',
    } satisfies Partial<CSSStyleDeclaration>);
    iframe.srcdoc = doc;

    this.host.replaceChildren(iframe);
    this.iframe = iframe;

    // Wait for Paged.js to finish. The load event fires after all scripts
    // (including the Paged.js polyfill) have run.
    await new Promise<void>((resolve) => {
      iframe.addEventListener(
        'load',
        () => {
          resolve();
        },
        { once: true },
      );
    });

    if (seq !== this.renderSeq) return { pageCount: 0, sidebarOverflow: false };

    await waitForPagination(iframe);

    if (seq !== this.renderSeq) return { pageCount: 0, sidebarOverflow: false };

    const pageCount = iframe.contentDocument?.querySelectorAll('.pagedjs_page').length ?? 0;
    const sidebarOverflow =
      iframe.contentDocument?.querySelector('.cv-slot-sidebar[data-split-from]') != null;

    // Resize iframe to fit the actual content so the parent can scroll naturally
    const contentHeight = iframe.contentDocument?.documentElement.scrollHeight;
    if (contentHeight) {
      iframe.style.height = `${contentHeight}px`;
    }

    return { pageCount, sidebarOverflow };
  }

  /**
   *
   */
  print(): void {
    const win = this.iframe?.contentWindow;
    if (!win) return;
    win.focus();
    win.print();
  }

  /**
   *
   */
  dispose(): void {
    this.host.replaceChildren();
    this.iframe = null;
  }

  private buildDocument(stylesheet: string, bodyHTML: string): string {
    const baseHref = `${window.location.origin}${window.location.pathname}`;
    return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <base href="${baseHref}" />
    <title>CV render</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap" />
    <style>${stylesheet}</style>
    <style>${PAGEDJS_INTERFACE_CSS}</style>
    <script>
      window.PagedConfig = {
        auto: true,
        after: function () {
          window.${PAGINATION_DONE_FLAG} = true;
          window.dispatchEvent(new Event('${PAGINATION_DONE_EVENT}'));
        },
      };
    </script>
    <script src="${this.options.pagedPolyfillUrl}"></script>
    <script>(${registerBreakAfterAvoid.toString()})(window.Paged);</script>
  </head>
  <body>${bodyHTML}</body>
</html>`;
  }
}

const PAGINATION_DONE_FLAG = '__cvPaginationDone';
const PAGINATION_DONE_EVENT = 'cv-pagination-done';
const PAGINATION_TIMEOUT_MS = 10_000;

function waitForPagination(iframe: HTMLIFrameElement): Promise<void> {
  const win = iframe.contentWindow as (Window & Record<string, unknown>) | null;
  if (!win || win[PAGINATION_DONE_FLAG] === true) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => {
      window.clearTimeout(timer);
      win.removeEventListener(PAGINATION_DONE_EVENT, done);
      resolve();
    };
    const timer = window.setTimeout(done, PAGINATION_TIMEOUT_MS);
    win.addEventListener(PAGINATION_DONE_EVENT, done);
  });
}

const PAGEDJS_INTERFACE_CSS = `
  :root { color-scheme: light; }
  html, body {
    background: #e2e8f0;
    margin: 0;
    padding: 0;
  }
  .pagedjs_pages {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 24px 0;
  }
  .pagedjs_page {
    background: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);
  }
  @media print {
    html, body {
      background: transparent;
    }
    .pagedjs_pages {
      gap: 0;
      padding: 0;
    }
    .pagedjs_page {
      box-shadow: none;
    }
  }
`;
