export const routeRevealEvent = "astrabrew:route-reveal";
const pageSelector = "[data-transit-path], main[data-transit-message]";
const normalize = (path: string) => path.replace(/\/$/, "");

export function findPage(path: string, scope: ParentNode = document, previous?: HTMLElement) {
  const destination = normalize(path);
  return Array.from(scope.querySelectorAll<HTMLElement>(pageSelector)).find(page => {
    const route = page.dataset.transitPath;
    return (route ? normalize(route) === destination : page !== previous) && page.getClientRects().length > 0;
  });
}

export function isOnScreen(element: Element) {
  const { top, bottom, width, height } = element.getBoundingClientRect();
  return width > 0 && height > 0 && bottom > 0 && top < innerHeight;
}

export function affectsPage({ attributeName, target }: MutationRecord) {
  // React's retained Offscreen elements can become visible via an inline display change.
  return attributeName !== "style" || (target instanceof HTMLElement &&
    (target.matches(pageSelector) || target.querySelector(pageSelector) !== null));
}
