"use client";

import { RouteSeoContent } from "@/components/site/route-seo-content";
import Link from "next/link";
import { ArrowDownToLine, Apple, Monitor, ArrowUpRight } from "lucide-react";
import { useRef, useState, useSyncExternalStore } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ProductDemo } from "@/components/product-demo/product-demo";
import type { Locale } from "@/lib/i18n";
import { launcherReleaseStatus } from "@/lib/launcher-copy";
import "./home.css";

type Platform = "windows" | "mac" | "other";

const subscribePlatform = () => () => {};
function getPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) return "windows";
  if (/Macintosh|Mac OS X/i.test(ua) && !/iPhone|iPad|iPod/i.test(ua)) return "mac";
  return "other";
}
const getServerPlatform = (): Platform => "other";

export function HomeHero({ locale, windowsDownloads }: { locale: Locale; windowsDownloads: React.ReactNode }) {
  const en = locale === "en";
  const detectedPlatform = useSyncExternalStore(subscribePlatform, getPlatform, getServerPlatform);
  const [selectedPlatform, setPlatform] = useState<Platform | null>(null);
  const platform = selectedPlatform ?? detectedPlatform;
  const platformContent = useRef<HTMLDivElement>(null);
  const previousPlatform = useRef(platform);
  useGSAP(() => {
    const changed = previousPlatform.current !== platform;
    previousPlatform.current = platform;
    if (!changed || selectedPlatform === null) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(platformContent.current, { y: 10, opacity: 0, duration: 0.42, ease: "power2.out", clearProps: "transform,opacity" });
    });
    return () => media.revert();
  }, { dependencies: [platform, selectedPlatform], scope: platformContent, revertOnUpdate: true });
  return <section className="home-hero">
    <div className="home-copy">
      <div className="home-name">AstraBrew Launcher</div>
      <RouteSeoContent path={`/${locale}`}><h1>{en ? <>SillyTavern,<br />ready to go.</> : <>一键启动酒馆<br />即刻沉浸。</>}</h1></RouteSeoContent>
      <p className="home-lead">{en ? "A beginner-friendly way to set up, launch and manage SillyTavern in one place." : "简化繁琐的 SillyTavern 环境配置，将环境管理、多实例掌控与版本更新集中于此，让你的酒馆时刻处于最佳状态。"}</p>
      {platform === "windows" ? windowsDownloads : <div className="home-actions">
        <Link href={`/${locale}/download${platform === "other" ? "" : `?platform=${platform}`}`} className="home-action-primary">
          {platform === "mac" ? <Apple aria-hidden="true" size={18} /> : <ArrowDownToLine aria-hidden="true" size={18} />}
          {platform === "mac" ? (en ? "Explore macOS" : "了解 macOS 版") : (en ? "Explore downloads" : "查看下载")}
        </Link>
        <Link href={`/${locale}/download`} className="home-action-secondary">{en ? "All versions" : "查看所有版本"}</Link>
      </div>}
      {platform === "windows" && <p className="home-system-requirement">{en ? "The Windows edition requires Windows 10 version 1809 or later." : "Windows 版需要 Windows 10 1809 或更高版本。"}</p>}
      <p className="home-platform-note">{launcherReleaseStatus[locale]}</p>
    </div>
    <div className="home-visual">
      <div className="home-orbit" aria-hidden="true" />
      <div className="home-visual-inner">
        <div className="home-platform-switch" role="group" aria-label={en ? "Choose a platform to explore" : "选择展示平台"}>
          <button type="button" className="tab-hover" aria-pressed={platform === "windows"} onClick={() => setPlatform("windows")}><Monitor size={15} aria-hidden="true" /> Windows</button>
          <button type="button" className="tab-hover" aria-pressed={platform === "mac"} onClick={() => setPlatform("mac")}><Apple size={15} aria-hidden="true" /> macOS</button>
        </div>
        <div ref={platformContent} className="home-platform-content">
        {platform === "windows" ? <ProductDemo locale={locale} /> : platform === "other" ? <div className="home-mac-placeholder">
          <div className="home-mac-symbol"><Monitor aria-hidden="true" size={29} /></div>
          <p className="home-mac-kicker">AstraBrew Launcher</p>
          <h2>{en ? "Choose your platform." : "选择你的平台。"}</h2>
          <p>{en ? "Explore the Windows interface or learn about the macOS edition." : "查看 Windows 版界面，或了解尚未发布的 macOS 版。"}</p>
          <button type="button" onClick={() => setPlatform("windows")}>{en ? "Explore Windows" : "查看 Windows 版"}<ArrowUpRight size={16} aria-hidden="true" /></button>
        </div> : <div className="home-mac-placeholder">
          <div className="home-mac-symbol"><Apple aria-hidden="true" size={29} /></div>
          <p className="home-mac-kicker">AstraBrew Launcher for macOS</p>
          <h2>{en ? "Made for Mac." : "为 Mac 而来。"}</h2>
          <p>{en ? "The native Swift and SwiftUI version is not yet released. Explore the Windows edition in the meantime." : "基于 Swift 与 SwiftUI 构建的原生版本尚未发布。你可以先了解 Windows 版本。"}</p>
          <button type="button" onClick={() => setPlatform("windows")}>{en ? "Explore Windows" : "查看 Windows 版"}<ArrowUpRight size={16} aria-hidden="true" /></button>
        </div>}
        </div>
      </div>
    </div>
  </section>;
}
