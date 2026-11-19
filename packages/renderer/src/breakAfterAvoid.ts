interface PagedApi {
  Handler: new (...args: never[]) => object;
  registerHandlers(...handlers: (new (...args: never[]) => object)[]): void;
}

export function registerBreakAfterAvoid(paged: PagedApi): void {
  const hasVisibleContent = (range: Range): boolean =>
    range.toString().trim() !== '' || range.cloneContents().querySelector('img, svg') !== null;

  const keeperBefore = (rendered: HTMLElement, breakPoint: Range): Element | undefined => {
    const candidates = [...rendered.querySelectorAll('[data-break-after="avoid"]')].reverse();
    const keeper = candidates.find((el) => breakPoint.comparePoint(el, el.childNodes.length) <= 0);
    if (!keeper) return undefined;
    const gap = keeper.ownerDocument.createRange();
    gap.setStartAfter(keeper);
    gap.setEnd(breakPoint.startContainer, breakPoint.startOffset);
    return hasVisibleContent(gap) ? undefined : keeper;
  };

  const leadsPage = (rendered: HTMLElement, element: Element): boolean => {
    const before = element.ownerDocument.createRange();
    before.setStart(rendered, 0);
    before.setEndBefore(element);
    return !hasVisibleContent(before);
  };

  paged.registerHandlers(
    class extends paged.Handler {
      onOverflow(overflow: Range | undefined, rendered: HTMLElement): Range | undefined {
        if (!overflow || !rendered.lastChild) return undefined;
        const breakPoint = overflow.cloneRange();
        breakPoint.collapse(true);
        let moved = false;
        for (
          let keeper = keeperBefore(rendered, breakPoint);
          keeper && !leadsPage(rendered, keeper);
          keeper = keeperBefore(rendered, breakPoint)
        ) {
          breakPoint.setStartBefore(keeper);
          breakPoint.collapse(true);
          moved = true;
        }
        if (!moved) return undefined;
        breakPoint.setEndAfter(rendered.lastChild);
        return breakPoint;
      }
    },
  );
}
