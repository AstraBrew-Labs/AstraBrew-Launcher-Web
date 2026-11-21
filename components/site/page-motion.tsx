"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { isLocaleMotionPage } from "./locale-exchange";
import { affectsPage, findPage, isOnScreen, routeRevealEvent } from "./page-elements";

gsap.registerPlugin(useGSAP);

const entries = {
  home: { copy: ".home-name, .home-lead", surface: ".home-actions", visual: ".home-visual-inner" },
  download: { copy: ".dl_kicker, .dl_intro > p:last-child", surface: ".dl_sync, .dl_platformBar" },
  license: { copy: ".license-kicker", surface: ".license-filebar, .license-overview" },
  preview: { copy: ".pv_name, .pv_copy > p:first-of-type", surface: ".pv_actions, .pv_platform", visual: ".pv_visual" },
  about: { copy: ".about-eyebrow, .about-lead", surface: ".about-mission, .about-card", visual: ".about-art" },
  changelog: { copy: ".changelog-kicker, .changelog-lead", surface: ".changelog-index-link" },
  docs: { copy: "[data-docs-description]", surface: "[data-docs-body] > :first-child" },
  message: { copy: ":scope > p", surface: ":scope > a, :scope > button" },
} satisfies Record<string, { copy: string; surface: string; visual?: string }>;

type Page = keyof typeof entries;

/** A streamed article can hydrate later than the docs layout containing PageMotion. */
export function DocsMotionReady() {
  const ready = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = ready.current;
    if (!node) return;
    node.dataset.docsMotionReady = "";
    delete node.dataset.introPending;
    return () => { delete node.dataset.docsMotionReady; node.dataset.introPending = ""; };
  }, []);
  return <span ref={ready} hidden data-intro-pending />;
}

/** The docs marker lives in the shared layout so changing articles doesn't replay the entrance. */
export function PageMotion({ page }: { page: Page }) {
  const marker = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", context => {
      const html = document.documentElement;
      const scope = marker.current?.closest<HTMLElement>(page === "docs" ? "#nd-docs-layout" : "[data-transit-path], main[data-transit-message]");
      if (!scope) return;
      const path = scope.dataset.transitPath ?? location.pathname;
      if (isLocaleMotionPage(path)) return;
      // A direct page load can paint its server HTML immediately. Stage entrances
      // only when a curtain is already covering the destination.
      if (!html.classList.contains("route-transition-active")) return;
      const observer = new MutationObserver(records => { if (records.some(affectsPage)) play(); });
      const stop = () => {
        observer.disconnect();
        document.removeEventListener(routeRevealEvent, play);
      };
      let intro: gsap.core.Timeline | undefined;
      const play = () => {
        const root = page === "docs" ? findPage(path, scope) : scope;
        if (!root || !root.getClientRects().length) return;
        if (isLocaleMotionPage(path) || (page === "docs" && !root.dataset.transitPath)) { stop(); return; }
        if (page === "docs" && !root.querySelector("[data-docs-motion-ready]")) return;

        // Stage the first frame behind the curtain; don't paint visible text and then hide it.
        if (!intro) context.add(() => {
          const profile: { copy: string; surface: string; visual?: string } = entries[page];
          const q = (selector: string) => Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(isOnScreen);
          const title = q("h1").slice(0, 1);
          const copy = q(profile.copy);
          const surfaces = q(profile.surface);
          const visual = profile.visual ? q(profile.visual) : [];
          if (!title.length && !copy.length && !surfaces.length && !visual.length) return;
          intro = gsap.timeline({ paused: true, defaults: {
            ease: "power3.out", immediateRender: true, clearProps: "transform,opacity,clipPath",
          } }).addLabel("arrive", 0);
          if (title.length) intro.fromTo(title,
            { clipPath: "inset(0 -8px 100% -8px)", opacity: .45, y: 14 },
            { clipPath: "inset(0 -8px 0% -8px)", opacity: 1, y: 0, duration: .49 }, "arrive");
          if (copy.length) intro.from(copy, { y: 9, opacity: .42, stagger: .035, duration: .34 }, "arrive+=.04");
          if (surfaces.length) intro.from(surfaces, { y: 11, opacity: .55, stagger: .045, duration: .39 }, "arrive+=.1");
          if (visual.length) intro.from(visual, { x: 16, scale: .983, opacity: .58, duration: .56 }, "arrive+=.04");
        });

        if (document.querySelector(".transit[open][data-transit-phase]:not([data-transit-phase=reveal])")) return;
        stop();
        intro?.play();
      };
      observer.observe(html, { attributes: true, attributeFilter: ["class"] });
      if (page === "docs") observer.observe(scope, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "style", "data-transit-path", "data-docs-motion-ready"] });
      document.addEventListener(routeRevealEvent, play);
      play();
      return stop;
    });
    return () => media.revert();
  }, { dependencies: [page], revertOnUpdate: true });

  if (page === "docs") return <div ref={marker} hidden />;
  return <div ref={marker} className="page-scroll-progress" aria-hidden="true"><span /></div>;
}
