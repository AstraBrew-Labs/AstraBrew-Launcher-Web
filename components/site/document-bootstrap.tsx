"use client";

import { useRef } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { themeBootstrap } from "@/lib/theme";
import { bootStartEvent, pageSelector } from "./page-elements";

// Give streamed HTML time to paint before showing a curtain. No hydration,
// font, or data dependency is required to decide whether it is needed.
const introBootstrap = `try {
  if (window.__astrabrewIntroInitialized) return;
  window.__astrabrewIntroInitialized = true;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (performance.getEntriesByType('navigation')[0]?.type === 'back_forward' || motion.matches) return;
  const root = document.documentElement;
  const pending = new AbortController();
  let observer;
  const timer = setTimeout(check, 240);
  const deadline = setTimeout(cancel, 4500);
  function cancel() {
    clearTimeout(timer);
    clearTimeout(deadline);
    observer?.disconnect();
    pending.abort();
  }
  function contentPresent() {
    return Array.from(document.querySelectorAll('${pageSelector}')).some(node =>
      !node.closest('[hidden], [style*="display:none"], [style*="display: none"]'));
  }
  function check() {
    // A streamed Suspense subtree can already be in the HTML but still be hidden
    // for a frame while React reveals it. Don't cover it in that case either.
    if (document.querySelector('${pageSelector}') || motion.matches) return cancel();
    const screen = document.querySelector('.boot-screen');
    if (!screen) {
      if (!observer) {
        observer = new MutationObserver(check);
        observer.observe(root, { childList: true, subtree: true });
      }
      return;
    }
    cancel();
    root.classList.add('reload-intro-active');
    document.dispatchEvent(new Event('${bootStartEvent}'));
    // Never leave an overlay over usable HTML if the client bundle fails.
    if (screen.hasAttribute('data-running')) return;
    const handoff = new MutationObserver(() => {
      if (screen.hasAttribute('data-running')) return handoff.disconnect();
      if (contentPresent()) {
        handoff.disconnect();
        setTimeout(release, 180);
      }
    });
    function release() {
      handoff.disconnect();
      if (!screen.hasAttribute('data-running')) root.classList.remove('reload-intro-active');
    }
    handoff.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['hidden', 'style', 'data-running'] });
    setTimeout(release, 4500);
  }
  for (const event of ['pointerdown', 'keydown', 'pagehide', 'popstate']) {
    window.addEventListener(event, cancel, { capture: true, signal: pending.signal });
  }
} catch {}`;

/** Parser-time setup only. Soft navigation must not mount an executable script. */
export function DocumentBootstrap({ intro = false }: { intro?: boolean }) {
  const inserted = useRef(false);
  useServerInsertedHTML(() => {
    if (inserted.current) return null;
    inserted.current = true;
    return <script dangerouslySetInnerHTML={{ __html: `(()=>{${themeBootstrap};${intro ? introBootstrap : ""}})()` }} />;
  });
  return null;
}
