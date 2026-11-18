"use client";
import Link from "next/link";
import { ArrowDownToLine } from "lucide-react";
import { useReleases } from "@/lib/use-releases";
import type { Region, Locale } from "@/lib/i18n";
import { compareReleases, getReleaseCategory, type Release } from "@/lib/releases";

export function WindowsDownloadsLoading({ locale }: { locale: Locale }) {
  const en = locale === "en";
  return <div className="home-downloads" role="status" data-intro-pending><div className="home-actions"><Link className="home-action-primary" href={`/${locale}/download?platform=windows`}><ArrowDownToLine size={18} aria-hidden="true" />{en ? "See Windows downloads" : "查看 Windows 下载"}</Link></div><p className="home-download-meta">{en ? "Checking available installers…" : "正在获取可用安装包…"}</p></div>;
}

export function WindowsReleaseLinks({ locale, region }: { locale: Locale; region: Region }) {
  const { data, failed } = useReleases(region);
  if (!data && !failed) return <WindowsDownloadsLoading locale={locale} />;
  const releases = data?.releases ?? [];
  const sources = data?.sources ?? [];
  const uncertain = failed || sources.some((source) => source.status !== "ok");
  const stable = releases.filter((release) => getReleaseCategory(release.channel) === "stable").sort(compareReleases)[0];
  const beta = releases.filter((release) => getReleaseCategory(release.channel) === "beta").sort(compareReleases)[0];
  const en = locale === "en";
  return <div className="home-downloads">
    <DownloadChannel locale={locale} release={stable} channel="stable" uncertain={uncertain} />
    <DownloadChannel locale={locale} release={beta} channel="beta" uncertain={uncertain} />
    <p className="home-download-meta"><Link href={`/${locale}/download?platform=windows`}>{en ? "All versions" : "查看所有版本"} →</Link></p>
  </div>;
}

function DownloadChannel({ locale, release, channel, uncertain }: { locale: Locale; release?: Release; channel: "stable" | "beta"; uncertain: boolean }) {
  const en = locale === "en";
  const stable = channel === "stable";
  const exe = release?.assets.find((asset) => asset.kind === "installer");
  const msi = release?.assets.find((asset) => asset.kind === "msi");
  return <div className={`home-download-channel home-download-channel--${channel}`}>
    <p className="home-download-channel-label">{stable ? (en ? "Stable release" : "正式版（稳定版）") : (en ? "Beta release" : "测试版")} {release && <span>· {release.tag}</span>}</p>
    {release ? <div className="home-actions">
      {exe ? <a className={stable ? "home-action-primary" : "home-action-secondary"} href={exe.url}><ArrowDownToLine size={18} aria-hidden="true" />{en ? "Download EXE" : "下载 EXE 安装包"}</a> : <span className="home-action-unavailable">{en ? "EXE unavailable" : "EXE 暂不可用"}</span>}
      {msi ? <a className="home-action-secondary" href={msi.url}>{en ? "Download MSI" : "下载 MSI 安装包"}</a> : <span className="home-action-unavailable">{en ? "MSI unavailable" : "MSI 暂不可用"}</span>}
    </div> : <p className="home-download-channel-empty">{uncertain ? (en ? "Release status unavailable" : "暂无法确认发布状态") : (en ? "Not yet released" : "暂未发布")}</p>}
  </div>;
}
