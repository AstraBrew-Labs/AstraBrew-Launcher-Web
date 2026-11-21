"use client";

import { ThemeToggle } from "./theme-toggle";
import { IconTooltip } from "./icon-tooltip";
import "./site-header-actions.css";
import { Globe2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { ActiveChangelogLink, ChangelogLink, SiteNavigation, SiteNavLinks } from "./site-navigation";
import { navigateWithTransition } from "@/components/site/route-transition";
import { launcherLockup, launcherLockupSize } from "@/lib/launcher-brand";
import { isLocale, LOCALE_COOKIE, LOCALE_STORAGE_KEY, localizedPath, REGION_COOKIE, regionFromBrowser, saveBrowserRegion, saveLocalePreference, type Locale } from "@/lib/i18n";

export function SiteHeader({ locale }: { locale: Locale }) {
  const en = locale === "en";
  const router = useRouter();
  const languageHint = en ? "Switch to Chinese" : "切换到英文";
  useEffect(() => {
    const cookies = document.cookie.split("; ").map((part) => part.split("="));
    if (!cookies.some(([key]) => key === LOCALE_COOKIE)) {
      try {
        const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
        if (isLocale(saved)) document.cookie = `${LOCALE_COOKIE}=${saved}; Path=/; Max-Age=31536000; SameSite=Lax`;
      } catch { /* storage may be disabled */ }
    }
    if (!cookies.some(([key]) => key === REGION_COOKIE)) {
      saveBrowserRegion(regionFromBrowser(navigator.language, Intl.DateTimeFormat().resolvedOptions().timeZone));
      // Only refresh when the current page needs region-specific releases immediately.
      if (/^\/(?:en|zh)\/download\/?$/.test(location.pathname) ||
        (/^\/(?:en|zh)\/?$/.test(location.pathname) && /windows/i.test(navigator.userAgent))) router.refresh();
    }
  }, [router]);
  const other: Locale = en ? "zh" : "en";
  function switchLanguage() {
    saveLocalePreference(other);
    const { pathname, search, hash } = window.location;
    const href = `${localizedPath(other, pathname)}${search}${hash}`;
    navigateWithTransition(href, () => router.push(href, { scroll: false }), () => router.prefetch(href));
  }
  return <header className="site-header"><div className="site-header-inner">
    <Link href={`/${locale}`} className="site-logo" aria-label={en ? "AstraBrew Launcher home" : "星酿启动器首页"}><Image src={launcherLockup[locale].src} alt="" {...launcherLockupSize} priority /></Link>
    <Suspense fallback={<SiteNavLinks locale={locale} />}><SiteNavigation locale={locale} /></Suspense>
    <div className="site-actions">
      <Suspense fallback={<ChangelogLink locale={locale} />}><ActiveChangelogLink locale={locale} /></Suspense>
      <IconTooltip label={languageHint}>
        <button type="button" className="site-language" aria-label={`${en ? "中文" : "EN"} — ${languageHint}`} onClick={switchLanguage}>
          <Globe2 size={17} aria-hidden="true" /><span className="site-language-label">{en ? "中文" : "EN"}</span>
        </button>
      </IconTooltip>
      <Link className="site-header-cta" href={`/${locale}/download`}>{en ? "Get Launcher" : "获取启动器"}</Link>
      <ThemeToggle locale={locale} />
    </div>
  </div></header>;
}
