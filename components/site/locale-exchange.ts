import "./locale-exchange.css";

const normalizePath = (path: string) => path.replace(/\/$/, "");
const motionPaths = new Set<string>();
let cancel: (() => void) | undefined;

/** A locale visit stays a locale visit even if a streamed component mounts after the effect. */
export function isLocaleMotionPage(path = location.pathname) {
  return motionPaths.has(normalizePath(path));
}

export function cancelLocaleExchange() { cancel?.(); }

export function resetLocaleMotion() {
  cancelLocaleExchange();
  motionPaths.clear();
}

function visible(element: HTMLElement) {
  const { top, bottom, width, height } = element.getBoundingClientRect();
  return width > 0 && height > 0 && bottom > 0 && top < innerHeight;
}

function textTargets(page: HTMLElement | undefined) {
  const heading = Array.from(page?.querySelectorAll<HTMLElement>("h1, h2") ?? []).find(visible);
  const lead = heading?.nextElementSibling;
  return [
    ["locale-title", heading],
    ["locale-lead", lead instanceof HTMLElement && lead.matches("p") && visible(lead) ? lead : undefined],
    ["locale-label", document.querySelector<HTMLElement>(".site-language-label") ?? undefined],
  ] as const;
}

function snapshotNames(page: HTMLElement | undefined) {
  // Store only these properties; React still owns and renders all of the real content.
  const restore = textTargets(page).flatMap(([name, element]) => {
    if (!element) return [];
    const previous = element.style.viewTransitionName;
    element.style.viewTransitionName = name;
    return [() => { element.style.viewTransitionName = previous; }];
  });
  return () => restore.forEach(fn => fn());
}

const pageSelector = "[data-transit-path], main.site-message";

export function playLocaleExchange(path: string, navigate?: () => void, prefetch?: () => void) {
  if (cancel) return;
  const destination = normalizePath(path);
  // History can restore the previous locale before the layout listener is reattached.
  motionPaths.add(normalizePath(location.pathname));
  motionPaths.add(destination);
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  if (motion.matches) { navigate?.(); return; }

  const outgoing = Array.from(document.querySelectorAll<HTMLElement>(pageSelector)).find(page => page.getClientRects().length);
  const button = document.querySelector<HTMLButtonElement>(".site-language");
  const restoreFocus = button !== null && button === document.activeElement;
  const controller = new AbortController();
  const { signal } = controller;
  let transition: ViewTransition | undefined;
  let restoreNames: (() => void) | undefined;
  let sent = false;
  let incoming: HTMLElement | undefined;
  let fallbackAnimations: Animation[] = [];
  let resolveCommit!: () => void;
  const committed = new Promise<void>(resolve => { resolveCommit = resolve; });
  const send = () => { if (!sent) { sent = true; navigate?.(); } };
  const observer = new MutationObserver(records => {
    // Ignore GSAP and hover style changes; Offscreen can reveal a retained subtree via display.
    if (records.some(record => record.attributeName !== "style" ||
      (record.target instanceof HTMLElement &&
        (record.target.matches(pageSelector) || record.target.querySelector(pageSelector))))) checkCommit();
  });
  const deadline = window.setTimeout(() => { send(); finish(); }, 1200);
  cancel = finish;

  function finish() {
    if (signal.aborted) return;
    observer.disconnect();
    controller.abort();
    clearTimeout(deadline);
    restoreNames?.();
    transition?.skipTransition();
    fallbackAnimations.forEach(animation => animation.cancel());
    resolveCommit();
    cancel = undefined;
  }

  function checkCommit() {
    if (normalizePath(location.pathname) !== destination) return;
    incoming = Array.from(document.querySelectorAll<HTMLElement>(pageSelector)).find(page =>
      ((!!page.dataset.transitPath && normalizePath(page.dataset.transitPath) === destination) || (page !== outgoing && page.matches("main.site-message"))) && page.getClientRects().length);
    if (!incoming) return;
    observer.disconnect();
    clearTimeout(deadline);
    if (restoreFocus && (document.activeElement === document.body || document.activeElement === button)) {
      document.querySelector<HTMLButtonElement>(".site-language")?.focus({ preventScroll: true });
    }
    resolveCommit();
  }

  function update() {
    if (signal.aborted) return;
    restoreNames?.();
    restoreNames = undefined;
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "style", "data-transit-path"] });
    send();
    checkCommit();
    return committed;
  }

  prefetch?.();
  motion.addEventListener("change", event => { if (event.matches) { send(); finish(); } }, { signal });
  window.addEventListener("pagehide", finish, { signal });

  if (document.startViewTransition && !document.documentElement.hasAttribute("data-theme-reveal")) {
    restoreNames = snapshotNames(outgoing);
    transition = document.startViewTransition(async () => {
      await update();
      if (!signal.aborted) restoreNames = snapshotNames(incoming);
    });
    void transition.finished.then(() => { if (!signal.aborted) finish(); }, () => { if (!signal.aborted) finish(); });
    return;
  }

  // Browsers without snapshots can still reveal the real incoming text in place.
  void update()?.then(() => {
    if (signal.aborted) return;
    fallbackAnimations = textTargets(incoming).flatMap(([name, element]) => element?.animate ? [element.animate(
      name === "locale-label"
        ? [{ opacity: .45, transform: "translateY(4px)" }, { opacity: 1, transform: "translateY(0)" }]
        : [{ opacity: .65, clipPath: "inset(0 70% 0 0)" }, { opacity: 1, clipPath: "inset(0)" }],
      { duration: 280, easing: "cubic-bezier(.22, 1, .36, 1)" },
    )] : []);
    void Promise.allSettled(fallbackAnimations.map(animation => animation.finished)).then(() => { if (!signal.aborted) finish(); });
  });
}
