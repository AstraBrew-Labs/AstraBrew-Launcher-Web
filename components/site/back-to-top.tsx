"use client";

import { ArrowUp } from "lucide-react";
import { useSyncExternalStore } from "react";
import type { Locale } from "@/lib/i18n";
import { IconTooltip } from "./icon-tooltip";
import "./back-to-top.css";

const minScroll = 120;
const maxThreshold = 440;

function subscribe(onScroll: () => void) {
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  };
}

function isPastThreshold() {
  const { scrollY } = window;
  if (scrollY < minScroll) return false;
  if (scrollY >= maxThreshold) return true;
  // Short docs still need the control before readers reach the end of the page.
  const root = document.scrollingElement;
  const scrollable = root ? root.scrollHeight - root.clientHeight : 0;
  return scrollY >= Math.max(minScroll, scrollable * 0.6);
}
const getServerSnapshot = () => false;

export function BackToTop({ locale }: { locale: Locale }) {
  const visible = useSyncExternalStore(subscribe, isPastThreshold, getServerSnapshot);
  const label = locale === "zh" ? "回到顶部" : "Back to top";

  return <IconTooltip label={label} placement="left" className="back-to-top-position" inactive={!visible}>
    <button type="button" className="back-to-top" aria-label={label} tabIndex={visible ? 0 : -1}
      onClick={event => {
        if (!visible) return;
        // Keep keyboard focus at the destination rather than on a disappearing control.
        if (event.detail === 0) document.querySelector<HTMLAnchorElement>(".site-header .site-logo")?.focus({ preventScroll: true });
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" });
      }}>
      <ArrowUp size={20} aria-hidden="true" />
    </button>
  </IconTooltip>;
}
