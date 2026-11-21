import type { Locale } from "./i18n";

export const launcherReleaseStatus = {
  zh: "Windows 版现已发布，macOS 版尚未发布。",
  en: "The Windows edition is available now. The macOS edition has not yet been released.",
} satisfies Record<Locale, string>;
