"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { BootLogo } from "./boot-logo";
import { bootDockMs, bootDrawName, bootEntryMs, bootExitBufferMs, bootHoldMs, bootRevealMs, bootStartMark } from "./boot-intro-timing";
import { affectsPage, bootStartEvent, findPage } from "./page-elements";
import { warmDestination } from "./page-ready";

gsap.registerPlugin(useGSAP);

const PAGE_DEADLINE_MS = 2000;
const REVEAL_MASK = "radial-gradient(circle farthest-corner at var(--boot-reveal-origin), transparent calc(var(--boot-reveal-radius) - 1px), black var(--boot-reveal-radius))";

export function ReloadIntro({ locale }: { locale: "zh" | "en" }) {
  const root = useRef<HTMLDivElement>(null);
  const lockup = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  useGSAP((_, contextSafe) => {
    const html = document.documentElement;
    const screen = root.current;
    const mark = lockup.current;
    const curtain = backdrop.current;
    if (!screen || !mark || !curtain || !contextSafe) return;
    let dispose: (() => void) | undefined;
    const start = contextSafe(() => {
      if (dispose || !html.classList.contains("reload-intro-active")) return;
      const abort = new AbortController();
      const options = { signal: abort.signal };
      const path = location.pathname;
      const startedAt = performance.getEntriesByName(bootStartMark, "mark").at(-1)?.startTime ?? performance.now();
      let ready = false, loadingBeatComplete = false;
      let holdTimer: number | undefined, exitTimer: number | undefined;
      let exit: gsap.core.Timeline | undefined;

      const cleanup = () => {
        abort.abort();
        window.clearTimeout(holdTimer);
        window.clearTimeout(exitTimer);
        window.clearTimeout(deadline);
        delete screen.dataset.running;
      };
      const finish = () => {
        html.classList.remove("reload-intro-active");
        cleanup();
      };
      const beginExit = contextSafe(() => {
        const from = mark.getBoundingClientRect();
        const to = document.querySelector<HTMLImageElement>(".site-logo img")?.getBoundingClientRect();
        const dock = to && from.width > 0 && from.height > 0 && to.width > 0 && to.height > 0 && to.top >= 0 && to.bottom <= innerHeight ? to : null;
        screen.dataset.phase = "exit";
        exit = gsap.timeline({ onComplete: finish })
          .to(mark, {
            x: dock ? dock.left - from.left : 0,
            y: dock ? dock.top - from.top : -6,
            scaleX: dock ? dock.width / from.width : 1,
            scaleY: dock ? dock.height / from.height : 1,
            opacity: dock ? 1 : 0,
            transformOrigin: "0 0", duration: bootDockMs / 1000, ease: "power3.inOut",
          }, 0);

        // Open a hole in the mask only after the logo has landed. Keep the mark
        // above the reveal so it hands off to the header without disappearing.
        if (CSS.supports("mask-image", REVEAL_MASK)) {
          exit.set(curtain, {
            maskImage: REVEAL_MASK,
            "--boot-reveal-origin": () => {
              const logo = mark.getBoundingClientRect();
              const bounds = curtain.getBoundingClientRect();
              return `${logo.left + logo.width / 2 - bounds.left}px ${logo.top + logo.height / 2 - bounds.top}px`;
            },
            "--boot-reveal-radius": "0%",
          }).to(curtain, { "--boot-reveal-radius": "101%", duration: bootRevealMs / 1000, ease: "power2.inOut" });
        } else {
          exit.to(curtain, { opacity: 0, duration: .12, ease: "power2.out" });
        }
      });
      const maybeExit = () => {
        if (!ready || !loadingBeatComplete || abort.signal.aborted || exitTimer !== undefined) return;
        exitTimer = window.setTimeout(beginExit, bootExitBufferMs);
      };
      const onReady = () => {
        ready = true;
        observer.disconnect();
        window.clearTimeout(deadline);
        maybeExit();
      };
      const observer = new MutationObserver(records => {
        if (records.some(affectsPage) && findPage(path)) onReady();
      });
      const afterDraw = () => {
        if (abort.signal.aborted) return;
        screen.dataset.phase = "loading";
        holdTimer = window.setTimeout(() => {
          loadingBeatComplete = true;
          maybeExit();
        }, bootHoldMs);
      };
      const deadline = window.setTimeout(onReady, Math.max(0, startedAt + PAGE_DEADLINE_MS - performance.now()));
      const skip = () => { exit?.kill(); finish(); };
      dispose = cleanup;
      if (screen.dataset.phase !== "entry") screen.dataset.phase = "entry";
      screen.dataset.running = "";
      // Wait for the SVG's actual finish, not just the time since the class was set.
      const draws = mark.getAnimations?.({ subtree: true }).filter(animation =>
        "animationName" in animation && animation.animationName === bootDrawName) ?? [];
      if (draws.length) void Promise.allSettled(draws.map(animation => animation.finished)).then(afterDraw);
      else holdTimer = window.setTimeout(afterDraw, Math.max(0, startedAt + bootEntryMs - performance.now()));
      document.addEventListener("keydown", event => {
        if (event.key === "Escape" || event.key === "Tab") skip();
      }, options);
      window.addEventListener("pagehide", skip, options);
      window.addEventListener("popstate", skip, options);
      matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", event => { if (event.matches) skip(); }, options);
      abort.signal.addEventListener("abort", () => observer.disconnect(), { once: true });
      // Warm eligible data in parallel; don't hold the logo for optional resources.
      void warmDestination(path);
      if (findPage(path)) onReady();
      else observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "style", "data-transit-path"] });
    });
    document.addEventListener(bootStartEvent, start, { once: true });
    start();
    return () => {
      document.removeEventListener(bootStartEvent, start);
      dispose?.();
      // Strict Mode cleans up and reattaches effects without removing the screen.
      // Only a real removal should release a curtain that never completed.
      queueMicrotask(() => {
        if (dispose && !screen.isConnected && !document.querySelector(".boot-screen[data-running]")) {
          html.classList.remove("reload-intro-active");
        }
      });
    };
  }, { scope: root });

  return (
    <div ref={root} className="boot-screen" data-phase="entry" role="status" aria-label={locale === "zh" ? "正在准备首屏" : "Preparing your workspace"}>
      <div ref={backdrop} className="boot-backdrop" aria-hidden="true" />
      <div ref={lockup} className="boot-lockup"><BootLogo locale={locale} /></div>
    </div>
  );
}
