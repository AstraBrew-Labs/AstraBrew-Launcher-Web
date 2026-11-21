"use client";

import { useRef } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { themeBootstrap } from "@/lib/theme";
import { bootDrawName, bootExitBufferMs, bootFallbackRevealMs, bootHoldMs, bootStartMark } from "./boot-intro-timing";
import { bootStartEvent, pageSelector } from "./page-elements";

// Give the home opening a brand beat once per tab and on an explicit reload.
// Elsewhere only show the intro if the server is still streaming the page.
const introBootstrap = `try {
  if (window.__astrabrewIntroInitialized) return;
  window.__astrabrewIntroInitialized = true;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const navigationType = performance.getEntriesByType('navigation')[0]?.type;
  if (navigationType === 'back_forward' || motion.matches) return;
  const home = ['/zh', '/en', '/zh/', '/en/'].includes(location.pathname) && !location.hash;
  const seenKey = 'astrabrew.boot-seen';
  let playOnOpen = home;
  try { playOnOpen = home && (navigationType === 'reload' || !sessionStorage.getItem(seenKey)); } catch {}
  const root = document.documentElement;
  const pending = new AbortController();
  let observer;
  const timer = playOnOpen ? undefined : setTimeout(check, 240);
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
    if (motion.matches || (!playOnOpen && document.querySelector('${pageSelector}'))) return cancel();
    const screen = document.querySelector('.boot-screen');
    if (!screen) {
      if (!observer) {
        observer = new MutationObserver(check);
        observer.observe(root, { childList: true, subtree: true });
      }
      return;
    }
    cancel();
    if (home) { try { sessionStorage.setItem(seenKey, '1'); } catch {} }
    root.classList.add('reload-intro-active');
    const startedAt = performance.mark('${bootStartMark}').startTime;
    document.dispatchEvent(new Event('${bootStartEvent}'));
    // Never leave an overlay over usable HTML if the client bundle fails.
    if (screen.hasAttribute('data-running')) return;
    const fallback = new AbortController();
    let revealTimer;
    let revealAt;
    const bailout = setTimeout(release, 2600);
    const handoff = new MutationObserver(checkHandoff);
    function cleanup() {
      handoff.disconnect();
      clearTimeout(revealTimer);
      clearTimeout(bailout);
      fallback.abort();
    }
    function release() {
      cleanup();
      if (!screen.hasAttribute('data-running')) root.classList.remove('reload-intro-active');
    }
    function checkHandoff() {
      if (screen.hasAttribute('data-running')) return cleanup();
      if (revealAt === undefined || revealTimer !== undefined || !contentPresent()) return;
      revealTimer = setTimeout(release, Math.max(0, revealAt - performance.now()));
    }
    for (const event of ['pagehide', 'popstate']) {
      window.addEventListener(event, release, { capture: true, signal: fallback.signal });
    }
    window.addEventListener('keydown', event => {
      if (event.key === 'Escape' || event.key === 'Tab') release();
    }, { capture: true, signal: fallback.signal });
    motion.addEventListener('change', event => { if (event.matches) release(); }, { signal: fallback.signal });
    handoff.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['hidden', 'style', 'data-running'] });
    const paths = screen.querySelector('.boot-lockup');
    const draws = paths?.getAnimations?.({ subtree: true }).filter(animation => animation.animationName === '${bootDrawName}') || [];
    Promise.allSettled(draws.map(animation => animation.finished)).then(() => {
      if (fallback.signal.aborted) return;
      revealAt = Math.max(startedAt + ${bootFallbackRevealMs}, performance.now() + (draws.length ? ${bootHoldMs + bootExitBufferMs} : 0));
      checkHandoff();
    });
  }
  for (const event of ['pointerdown', 'keydown', 'pagehide', 'popstate']) {
    window.addEventListener(event, cancel, { capture: true, signal: pending.signal });
  }
  // Arm the homepage curtain before the browser paints the streamed content.
  if (playOnOpen) check();
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
