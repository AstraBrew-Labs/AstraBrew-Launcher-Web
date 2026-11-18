"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "gsap";
import { findPage, routeRevealEvent } from "./page-elements";
import { warmDestination, whenPageReady } from "./page-ready";
import { isLocaleExchange } from "@/lib/i18n";
import { cancelLocaleExchange, playLocaleExchange, resetLocaleMotion } from "./locale-exchange";
import { TransitScene } from "./transit-scene";
import "./transit.css";

const sectors = {
  home: ["01", "启动中心", "Launch Center"], download: ["02", "版本下载", "Downloads"],
  docs: ["05", "使用文档", "User Guide"],
  license: ["03", "开源协议", "License"], preview: ["04", "界面预览", "Preview"],
} as const;
let cancelTransit: (() => void) | undefined;

const isDocsPath = (path: string) => /^\/(?:en|zh)\/docs(?:\/|$)/.test(path);
const isWithinDocs = (from: string, to: string) => isDocsPath(from) && isDocsPath(to);

export function navigateWithTransition(href: string, navigate: () => void, prefetch?: () => void) {
  if (cancelTransit) return;
  const from = location.pathname;
  const path = new URL(href, location.href).pathname;
  if (isLocaleExchange(from, path)) playLocaleExchange(path, navigate, prefetch);
  else {
    resetLocaleMotion();
    if (isWithinDocs(from, path)) navigate();
    else startTransition(path, navigate, prefetch);
  }
}

/** The small scene lives outside the locale layout so a language change can't cut the shot. */
function startTransition(path: string, navigate?: () => void, prefetch?: () => void) {
  if (cancelTransit) return;
  cancelLocaleExchange();
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const template = document.querySelector<HTMLDialogElement>("dialog[data-transit-template]");
  if (motion.matches || !template?.showModal) { navigate?.(); return; }

  const [, lang, segment = "home"] = path.split("/");
  const en = lang === "en";
  const sector = Object.hasOwn(sectors, segment) ? sectors[segment as keyof typeof sectors] : ["—", "新航区", "New Sector"];
  const outgoing = location.pathname !== path ? findPage(location.pathname) : undefined;
  const scene = template.cloneNode(true) as HTMLDialogElement;
  scene.removeAttribute("data-transit-template");
  scene.dataset.transitPhase = "depart";
  scene.lang = en ? "en" : "zh-CN";
  const select = gsap.utils.selector(scene);
  select("[data-seq]")[0].textContent = sector[0];
  select("[data-destination]")[0].textContent = sector[en ? 2 : 1];
  select("[data-status]")[0].textContent = en ? "IN TRANSIT" : "航线接驳中";
  scene.setAttribute("aria-label", (en ? "Loading: " : "正在加载：") + sector[en ? 2 : 1]);
  document.body.append(scene);
  scene.showModal();
  document.documentElement.classList.add("route-transition-active");

  prefetch?.();
  const dataReady = warmDestination(path);
  let sent = false, armed = false, prepared = false, leaving = false;
  const send = () => { if (!sent) { sent = true; navigate?.(); } };
  const abort = new AbortController();
  const options = { signal: abort.signal };
  let exit: gsap.core.Timeline;
  const releasePage = () => {
    if (scene.dataset.transitPhase === "reveal") return;
    scene.dataset.transitPhase = "reveal";
    document.documentElement.classList.remove("route-transition-active");
    document.dispatchEvent(new Event(routeRevealEvent));
  };
  const cleanup = () => {
    abort.abort(); clearTimeout(timer);
    ctx.revert(); scene.close(); scene.remove();
    cancelTransit = undefined;
    releasePage();
  };
  const reveal = () => {
    if (!armed || !prepared || leaving) return;
    leaving = true;
    scene.dataset.transitPhase = "open";
    exit.play();
  };
  const timer = window.setTimeout(() => { send(); cleanup(); }, 6500);
  cancelTransit = cleanup;
  const skip = () => { send(); cleanup(); };
  scene.addEventListener("cancel", e => { e.preventDefault(); skip(); }, options);
  motion.addEventListener("change", e => { if (e.matches) skip(); }, options);
  window.addEventListener("pagehide", cleanup, options);

  const ctx = gsap.context(() => {
    const slats = select(".transit-slats i");
    const edge = gsap.utils.wrap([-101, 101]);
    const stage = select(".transit-frame, .transit-field");
    gsap.set(stage, { autoAlpha: 0 });
    gsap.set(slats, { xPercent: edge });
    gsap.to(".transit-dial", { rotation: 360, svgOrigin: "120 120", duration: 14, repeat: -1, ease: "none" });
    gsap.fromTo(".transit-meter i", { xPercent: -100 }, { xPercent: 245, duration: 1.15, repeat: -1, ease: "power1.inOut" });
    const trails = select(".transit-trails path");
    const departure = gsap.timeline({ defaults: { ease: "power3.out" } }).addLabel("depart", 0);
    if (outgoing) departure.to(outgoing, { opacity: .42, duration: .24, ease: "power2.inOut" }, "depart");
    departure.to(slats, { xPercent: 0, duration: .27, stagger: { amount: .07, from: "center" }, ease: "power3.inOut" }, "depart")
      .addLabel("sealed", .34)
      .call(() => { scene.dataset.transitPhase = "hold"; send(); }, [], "sealed")
      .addLabel("lock", .29).to(stage, { autoAlpha: 1, duration: .17 }, "lock")
      .fromTo(trails, { strokeDashoffset: 1 }, { strokeDashoffset: -1, duration: .46, stagger: { amount: .09 }, ease: "power2.out" }, "lock")
      .from(".transit-scope", { scale: 1.36, duration: .44 }, "lock")
      .from(".transit-orbit", { rotation: -100, svgOrigin: "120 120", duration: .5 }, "lock")
      .from(".transit-title, .transit-kicker", { y: 14, autoAlpha: 0, stagger: .04, duration: .24 }, "lock+=.05")
      .call(() => { armed = true; reveal(); }, [], "lock+=.40");
    exit = gsap.timeline({ paused: true, onComplete: cleanup, defaults: { ease: "power3.inOut" } })
      .fromTo(trails, { strokeDashoffset: 1 }, { strokeDashoffset: -1, immediateRender: false, duration: .24, ease: "power2.in" }, 0)
      .to(stage, { autoAlpha: 0, duration: .18 }, .06)
      .to(".transit-scope", { scale: .8, duration: .2 }, 0)
      .addLabel("unseal", .085)
      .to(slats, { xPercent: i => -edge(i), stagger: { amount: .08, from: "edges" }, duration: .32 }, "unseal")
      .call(releasePage, [], "unseal+=.16");
  }, scene);
  whenPageReady(path, dataReady, abort.signal, () => { prepared = true; reveal(); }, outgoing);
}

export function RouteTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const committedPath = useRef(pathname);
  useEffect(() => { committedPath.current = pathname; }, [pathname]);
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname === location.pathname || !/^\/(en|zh)(\/|$)/.test(url.pathname)) return;
      // Let Fumadocs handle its own links, including closing the mobile sidebar.
      if (isWithinDocs(location.pathname, url.pathname) && !isLocaleExchange(location.pathname, url.pathname)) { resetLocaleMotion(); return; }
      event.preventDefault();
      const href = url.pathname + url.search + url.hash;
      const localeOnly = isLocaleExchange(location.pathname, url.pathname);
      navigateWithTransition(href, () => router.push(href, { scroll: !localeOnly }), () => router.prefetch(href));
    };
    const traverse = (from: string, path: string) => {
      if (from === path || !/^\/(en|zh)(\/|$)/.test(path)) return;
      cancelTransit?.();
      cancelLocaleExchange();
      if (isLocaleExchange(from, path)) playLocaleExchange(path);
      else {
        resetLocaleMotion();
        if (!isWithinDocs(from, path)) startTransition(path);
      }
    };
    // Observe the departure before Next commits the history entry. Don't intercept browser history.
    const navigation = (window as Window & { navigation?: EventTarget }).navigation;
    const onTraverse = (event: Event) => {
      const { destination, navigationType, hasUAVisualTransition } = event as Event & {
        destination: { url: string; sameDocument: boolean };
        navigationType: string;
        hasUAVisualTransition?: boolean;
      };
      if (!event.defaultPrevented && navigationType === "traverse" && destination.sameDocument && !hasUAVisualTransition) {
        traverse(location.pathname, new URL(destination.url).pathname);
      }
    };
    const onPop = () => traverse(committedPath.current, location.pathname);
    document.addEventListener("click", onClick, true);
    if (navigation) navigation.addEventListener("navigate", onTraverse);
    else window.addEventListener("popstate", onPop, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      if (navigation) navigation.removeEventListener("navigate", onTraverse);
      else window.removeEventListener("popstate", onPop, true);
    };
  }, [router]);
  return <TransitScene />;
}
