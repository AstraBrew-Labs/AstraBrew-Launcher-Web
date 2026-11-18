"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isLocaleMotionPage } from "./locale-exchange";
import { affectsPage, findPage, isOnScreen, routeRevealEvent } from "./page-elements";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const entries = {
  home: { copy: ".home-name, .home-lead", surface: ".home-actions", visual: ".home-visual-inner" },
  download: { copy: ".dl_kicker, .dl_intro > p:last-child", surface: ".dl_sync, .dl_platformBar" },
  license: { copy: ".license-kicker", surface: ".license-filebar, .license-overview" },
  preview: { copy: ".pv_name, .pv_copy > p:first-of-type", surface: ".pv_actions, .pv_platform", visual: ".pv_visual" },
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
export function PageMotion({ page, platform }: { page: Page; platform?: string }) {
  const marker = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", context => {
      const html = document.documentElement;
      const scope = marker.current?.closest<HTMLElement>(page === "docs" ? "#nd-docs-layout" : "[data-transit-path], main[data-transit-message]");
      if (!scope) return;
      const path = scope.dataset.transitPath ?? location.pathname;
      if (isLocaleMotionPage(path)) return;
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

        if (html.classList.contains("reload-intro-active") ||
          document.querySelector(".transit[open][data-transit-phase]:not([data-transit-phase=reveal])")) return;
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

  useGSAP(() => {
    if (page === "docs") return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const root = marker.current?.closest<HTMLElement>("[data-transit-path], main[data-transit-message]");
      if (!root) return;
      // Reattach scrubbed effects at their current scroll position, without easing in from zero.
      const localeVisit = isLocaleMotionPage(root.dataset.transitPath);
      // Animate meaningful content blocks, not nested controls or long-form text.
      const groups = page === "home"
        ? [".home-feature-strip", ".home-features-heading", ".home-feature-list article", ".home-workspace-heading", ".home-workspace-copy", ".home-workspace-art", ".home-path-heading", ".home-path-step", ".home-platforms-intro", ".home-platform-cards article", ".home-open-source", ".home-end"]
        : page === "download"
          ? [".dl_state", ".dl_sectionHeading", "#latest-windows-release", ".dl_notice", ".dl_message", ".dl_releaseGroup", ".dl_faqHeading", ".dl_faqItem", ".dl_faqHelp"]
          : page === "license" ? [".license-document-heading"] : [];
      const targets = groups.length ? Array.from(root.querySelectorAll<HTMLElement>(groups.join(", "))) : [];
      const footer = document.querySelector<HTMLElement>(".site-footer-inner");
      if (footer) targets.push(footer);
      targets.forEach((element) => {
        element.classList.add("scroll-motion-item");
        gsap.timeline({
          scrollTrigger: {
            trigger: element,
            start: "top bottom",
            end: "bottom top",
            scrub: localeVisit || 0.35,
            invalidateOnRefresh: true,
          },
        })
          .fromTo(element, { y: 18, opacity: 0.72 }, { y: 0, opacity: 1, duration: 0.16, ease: "none" })
          .to(element, { y: 0, opacity: 1, duration: 0.68, ease: "none" })
          .to(element, { y: -18, opacity: 0.72, duration: 0.16, ease: "none" });
      });
      if (page === "home") {
        const artwork = root.querySelector<HTMLElement>(".home-workspace-art");
        const floating = artwork?.querySelector<HTMLElement>(".home-workspace-floating");
        const glow = artwork?.querySelector<HTMLElement>(".home-workspace-glow");
        if (artwork && floating && glow) {
          gsap.fromTo(floating, { y: 20 }, { y: -20, ease: "none", scrollTrigger: { trigger: artwork, start: "top bottom", end: "bottom top", scrub: localeVisit || 0.8 } });
          gsap.fromTo(glow, { x: -35, scale: 0.9 }, { x: 35, scale: 1.1, ease: "none", scrollTrigger: { trigger: artwork, start: "top bottom", end: "bottom top", scrub: localeVisit || 1 } });
        }
      }
      const progress = marker.current?.firstElementChild;
      if (progress) {
        gsap.fromTo(progress, { scaleX: 0 }, {
          scaleX: 1, ease: "none",
          scrollTrigger: { trigger: document.documentElement, start: "top top", end: "bottom bottom", scrub: localeVisit || 0.2 },
        });
      }
      if (localeVisit) ScrollTrigger.refresh();
      let frame = 0;
      const refresh = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => ScrollTrigger.refresh());
      };
      const resize = new ResizeObserver(refresh);
      resize.observe(root);
      document.addEventListener("toggle", refresh, true);
      return () => {
        cancelAnimationFrame(frame);
        resize.disconnect();
        document.removeEventListener("toggle", refresh, true);
        targets.forEach((element) => element.classList.remove("scroll-motion-item"));
      };
    });
    return () => media.revert();
  }, { dependencies: [page, platform], revertOnUpdate: true });

  if (page === "docs") return <div ref={marker} hidden />;
  return <div ref={marker} className="page-scroll-progress" aria-hidden="true"><span /></div>;
}
