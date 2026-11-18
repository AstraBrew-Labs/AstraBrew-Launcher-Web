"use client";

import { Moon, Sun } from "lucide-react";
import { useLayoutEffect, useSyncExternalStore } from "react";
import type { Locale } from "@/lib/i18n";
import { THEME_STORAGE_KEY } from "@/lib/theme";

const isDark = () => document.documentElement.dataset.theme === "dark";
const serverIsDark = () => false;
const changeEvent = "astrabrew:theme";

function subscribe(notify: () => void) {
  function sync(event: StorageEvent) {
    if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;
    document.documentElement.dataset.theme = event.newValue === "dark" ? "dark" : "light";
    notify();
  }
  window.addEventListener("storage", sync);
  window.addEventListener(changeEvent, notify);
  return () => {
    window.removeEventListener("storage", sync);
    window.removeEventListener(changeEvent, notify);
  };
}

function toggle(button: HTMLButtonElement) {
  const root = document.documentElement;
  if (root.hasAttribute("data-theme-reveal")) return;
  const theme = isDark() ? "light" : "dark";
  function apply() {
    root.dataset.theme = theme;
    try { localStorage.setItem(THEME_STORAGE_KEY, theme); } catch { /* Session-only theme. */ }
    window.dispatchEvent(new Event(changeEvent));
  }
  if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    apply();
    return;
  }
  const { left, top, width, height } = button.getBoundingClientRect();
  const x = left + width / 2, y = top + height / 2;
  root.style.setProperty("--theme-origin", `${x}px ${y}px`);
  root.style.setProperty("--theme-radius", `${Math.ceil(Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)))}px`);
  root.dataset.themeReveal = "";
  const cleanup = () => {
    delete root.dataset.themeReveal;
    root.style.removeProperty("--theme-origin");
    root.style.removeProperty("--theme-radius");
  };
  try { void document.startViewTransition(apply).finished.then(cleanup, cleanup); }
  catch { cleanup(); apply(); }
}

export function ThemeToggle({ locale }: { locale: Locale }) {
  const dark = useSyncExternalStore(subscribe, isDark, serverIsDark);
  // A client-side locale change replaces the document layout without a new first paint script.
  useLayoutEffect(() => {
    try {
      document.documentElement.dataset.theme = localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
      window.dispatchEvent(new Event(changeEvent));
    } catch { /* Keep the current in-memory selection. */ }
  }, [locale]);
  const en = locale === "en";
  return <button type="button" className="site-theme-toggle" aria-pressed={dark}
    aria-label={en ? "Dark theme" : "暗色主题"}
    title={dark ? (en ? "Switch to light theme" : "切换到亮色主题") : (en ? "Switch to dark theme" : "切换到暗色主题")}
    onClick={event => toggle(event.currentTarget)}>
    <Moon className="theme-moon" size={19} aria-hidden="true" />
    <Sun className="theme-sun" size={19} aria-hidden="true" />
  </button>;
}
