import type { Locale } from "./i18n";

export const launcherLockup = {
  zh: { src: "/brand/launcher-lockup-color.svg", name: "星酿启动器" },
  en: { src: "/brand/launcher-lockup-en-color.svg", name: "AstraBrew Launcher" },
} satisfies Record<Locale, { src: string; name: string }>;

// Both lockups use the same canvas so the boot logo docks without stretching.
export const launcherLockupSize = { width: 338, height: 112 } as const;
