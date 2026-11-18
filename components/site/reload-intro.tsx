"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { warmDestination, whenPageReady } from "./page-ready";

gsap.registerPlugin(useGSAP);

// Seconds on the visual timeline, milliseconds for the readiness gate.
const SETTLE_AFTER_ENTRY = .16;
const MIN_LOADING = .32;
const SETTLE_BEFORE_EXIT_MS = 200;

export function ReloadIntro({ locale }: { locale: "zh" | "en" }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const html = document.documentElement;
    const screen = root.current;
    if (!screen || !html.classList.contains("reload-intro-active")) return;
    const mark = screen.querySelector<HTMLImageElement>(".boot-lockup img");
    if (!mark) return;
    const abort = new AbortController();
    const options = { signal: abort.signal };
    let ready = false, loadingBeatComplete = false;
    let buffer: ReturnType<typeof setTimeout> | undefined;
    let from: DOMRect, to: DOMRect;
    let dock = false;
    const finish = () => {
      abort.abort();
      clearTimeout(buffer);
      clearTimeout(deadline);
      html.classList.remove("reload-intro-active");
    };
    const exit = gsap.timeline({ paused: true, onComplete: finish })
      .to(".boot-caption, .boot-signature, .boot-signal", { opacity: 0, duration: .18 }, 0)
      .to(".boot-orbits", { scale: 1.12, opacity: 0, duration: .5, ease: "power2.out" }, 0)
      .to(".boot-backdrop", { opacity: 0, duration: .64, ease: "power2.inOut" }, .14)
      .to(mark, {
        x: () => dock ? to.left - from.left : 0,
        y: () => dock ? to.top - from.top : -8,
        scaleX: () => dock ? to.width / from.width : 1,
        scaleY: () => dock ? to.height / from.height : 1,
        opacity: () => dock ? 1 : 0,
        transformOrigin: "0 0", duration: .84, ease: "power3.inOut",
      }, .04);
    const maybeExit = () => {
      if (!ready || !loadingBeatComplete || abort.signal.aborted || buffer !== undefined) return;
      buffer = setTimeout(() => {
        const target = document.querySelector<HTMLImageElement>(".site-logo img");
        from = mark.getBoundingClientRect();
        if (target) {
          to = target.getBoundingClientRect();
          dock = !!(from.width && from.height && to.width && to.height && to.top >= 0 && to.bottom <= innerHeight);
        }
        screen.dataset.phase = "exit";
        exit.play();
      }, SETTLE_BEFORE_EXIT_MS);
    };
    const entry = gsap.timeline({ defaults: { ease: "power3.out" } })
      .to(".boot-flare", { scale: 1.45, rotation: 90, duration: .24 }, 0)
      .to(".boot-flare", { scale: .25, opacity: 0, duration: .2 }, .23)
      .to(".boot-axis", { scaleX: 1, duration: .38 }, .14)
      .to(".boot-axis", { opacity: 0, duration: .22 }, .49)
      .to(".boot-orbits", { opacity: 1, duration: .52 }, .16)
      .to(mark, { clipPath: "inset(0% 0% 0% 0%)", duration: .48, ease: "power2.inOut" }, .22)
      .to(".boot-caption, .boot-signature", { opacity: 1, y: 0, stagger: .06, duration: .24 }, .44)
      .addLabel("assembled")
      .call(() => { screen.dataset.phase = "loading" }, [], `assembled+=${SETTLE_AFTER_ENTRY}`)
      .call(() => { loadingBeatComplete = true; maybeExit() }, [], `>+=${MIN_LOADING}`);
    const skip = () => { entry.pause(); exit.pause(); finish() };
    const onReady = () => { ready = true; maybeExit() };
    const deadline = setTimeout(onReady, 2300);
    screen.dataset.running = "";
    document.addEventListener('keydown', skip, options);
    document.addEventListener('pointerdown', skip, options);
    window.addEventListener('pagehide', skip, options);
    window.addEventListener('resize', () => { if (exit.isActive()) skip() }, options);
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', skip, options);
    const dataReady = warmDestination(location.pathname);
    whenPageReady(location.pathname, dataReady, abort.signal, onReady);
    return () => { delete screen.dataset.running; screen.dataset.phase = "entry"; abort.abort(); clearTimeout(buffer); clearTimeout(deadline) };
  }, { scope: root });

  return <div ref={root} className="boot-screen" data-phase="entry" role="status" aria-label={locale === 'zh' ? '正在准备首屏' : 'Preparing your workspace'}>
    <div className="boot-backdrop" aria-hidden="true" />
    <div className="boot-orbits" aria-hidden="true"><i /><i /><i /></div>
    <div className="boot-ignition" aria-hidden="true"><i className="boot-axis" /><i className="boot-flare" /></div>
    <div className="boot-lockup" aria-hidden="true"><span className="boot-caption">ASTRABREW LABS　/　LAUNCH SYSTEM</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/launcher-lockup-color.svg" alt="" width="338" height="112" fetchPriority="high" />
      <small className="boot-signature">{locale === 'zh' ? '星 酿　／　启 航' : 'ORBITAL DEPARTURE'}</small>
      <div className="boot-signal"><i /><i /><i /></div>
    </div>
  </div>;
}
