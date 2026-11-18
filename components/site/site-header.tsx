"use client";

import { Button } from "@heroui/react";
import { ThemeToggle } from "./theme-toggle";
import { Globe2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { navigateWithTransition } from "@/components/site/route-transition";
import { isLocale, LOCALE_COOKIE, LOCALE_STORAGE_KEY, localizedPath, REGION_COOKIE, regionFromBrowser, saveBrowserRegion, saveLocalePreference, type Locale } from "@/lib/i18n";

export function SiteHeader({ locale }: { locale: Locale }) {
  const en = locale === "en";
  const router = useRouter();
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
      router.refresh();
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
    <Link href={`/${locale}`} className="site-logo" aria-label={en ? "AstraBrew Launcher home" : "星酿启动器首页"}><Image src="/brand/launcher-lockup-color.svg" alt="" width={166} height={44} priority /></Link>
    <nav className="site-nav" aria-label={en ? "Main navigation" : "主导航"}>
      <Link href={`/${locale}`}>{en ? "Features" : "产品介绍"}</Link>
      <Link href={`/${locale}/download`}>{en ? "Downloads" : "版本下载"}</Link>
      <Link href={`/${locale}/docs`}>{en ? "User guide" : "使用文档"}</Link>
      <Link href={`/${locale}/license`}>{en ? "License" : "开源协议"}</Link>
    </nav>
    <div className="site-actions"><Button variant="ghost" className="site-language" aria-label={en ? "Switch to Chinese" : "Switch to English"} onPress={switchLanguage}><Globe2 size={17} aria-hidden="true" /><span className="site-language-label">{en ? "中文" : "EN"}</span></Button><Link className="site-header-cta" href={`/${locale}/download`}>{en ? "Get Launcher" : "获取启动器"}</Link><ThemeToggle locale={locale} /></div>
  </div></header>;
}
