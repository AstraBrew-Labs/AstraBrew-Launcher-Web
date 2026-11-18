"use client";

import { useState, useSyncExternalStore } from "react";
import { Apple, ArrowDownToLine, Archive, Box, ChevronDown, ExternalLink, Monitor, PackageCheck } from "lucide-react";
import { PageMotion } from "@/components/site/page-motion";
import type { Locale, Region } from "@/lib/i18n";
import { compareReleases, getLatestStableRelease, getReleaseCategory, type AssetKind, type Release, type ReleaseAsset, type ReleaseCategory } from "@/lib/releases";
import { useReleases } from "@/lib/use-releases";
import "./download.css";

type Platform = "windows" | "mac" | "other";

function detectPlatform(): Platform {
  const ua = navigator.userAgent.toLowerCase();
  if (/windows/.test(ua)) return "windows";
  if (/macintosh|mac os x/.test(ua) && !/iphone|ipad|ipod/.test(ua)) return "mac";
  return "other";
}

const subscribePlatform = () => () => {};
const serverPlatform = (): Platform => "other";

const sourceName = (source: string) => source === "gitcode" ? "GitCode" : "GitHub";

function sizeText(bytes: number | null) {
  if (bytes === null) return null;
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function AssetLink({ asset, locale }: { asset: ReleaseAsset; locale: Locale }) {
  const zh = locale === "zh";
  const names: Record<AssetKind, [string, string]> = {
    installer: ["安装程序", "Installer"],
    msi: ["MSI 安装包", "MSI installer"],
    portable: ["便携版", "Portable"],
  };
  const Icon = asset.kind === "portable" ? Archive : asset.kind === "msi" ? Box : PackageCheck;
  const size = sizeText(asset.size);
  return <a className="dl_asset" href={asset.url}>
    <span className="dl_assetIcon"><Icon size={18} aria-hidden="true" /></span>
    <span className="dl_assetCopy"><strong>{names[asset.kind][zh ? 0 : 1]}</strong><small>{asset.name}</small></span>
    <span className="dl_assetMeta">{size && <span>{size}</span>}<span>{sourceName(asset.source)}</span></span>
    <ArrowDownToLine className="dl_assetArrow" size={18} aria-hidden="true" />
  </a>;
}


function categoryLabel(category: ReleaseCategory, zh: boolean) {
  if (category === "stable") return zh ? "正式版（稳定版）" : "Stable";
  if (category === "beta") return zh ? "测试版" : "Beta";
  return zh ? "预览版" : "Preview";
}

function ReleaseCard({ release, locale, latest = false, pinned = false }: { release: Release; locale: Locale; latest?: boolean; pinned?: boolean }) {
  const zh = locale === "zh";
  const category = getReleaseCategory(release.channel);
  const date = release.publishedAt && !Number.isNaN(Date.parse(release.publishedAt)) ? new Intl.DateTimeFormat(zh ? "zh-CN" : "en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(release.publishedAt)) : null;
  return <details className="dl_release" open={latest ? true : undefined}>
    <summary><span className="dl_releaseVersion"><strong>{release.tag}</strong><span className={`dl_channel dl_channel--${category}`}>{categoryLabel(category, zh)}</span>{latest && <span className="dl_latest">{pinned ? (zh ? "最新正式版" : "Latest stable") : (zh ? "此分类最新" : "Latest in channel")}</span>}</span><span className="dl_releaseSummary">{date && <time dateTime={release.publishedAt ?? undefined}>{date}</time>}<ChevronDown size={20} aria-hidden="true" /></span></summary>
    <div className="dl_releaseBody">{release.assets.length > 0 ? <div className="dl_assets">{release.assets.map((asset) => <AssetLink key={`${asset.name}-${asset.source}`} asset={asset} locale={locale} />)}</div> : <p className="dl_noAssets">{zh ? "此版本暂无可用的 Windows 安装文件。" : "No Windows installation files are available for this release."}</p>}
      <a className="dl_releaseLink" href={release.url} target="_blank" rel="noopener noreferrer">{zh ? "查看发布说明" : "View release notes"} <ExternalLink size={14} aria-hidden="true" /></a>
    </div>
  </details>;
}

function ReleaseList({ releases, locale, uncertain }: { releases: Release[]; locale: Locale; uncertain: boolean }) {
  const zh = locale === "zh";
  const latestStable = getLatestStableRelease(releases);
  const categories: ReleaseCategory[] = ["stable", "beta", "preview"];
  const descriptions: Record<ReleaseCategory, string> = zh ? {
    stable: "面向日常使用的正式发布版本，侧重稳定性。",
    beta: "用于测试与反馈的版本，可以提前体验功能，使用中可能遇到问题。",
    preview: "用于提前体验尚在开发中的内容，功能和表现可能变化。",
  } : {
    stable: "Formal releases intended for everyday use, with a focus on stability.",
    beta: "Releases for testing and feedback. You can try features early, but may encounter issues.",
    preview: "An early look at work in progress; features and behavior may change.",
  };
  return <div className="dl_releaseList">
    {latestStable && <div id="latest-windows-release"><ReleaseCard release={latestStable} locale={locale} latest pinned /></div>}
    <div className="dl_releaseGroups">{categories.map((category) => {
      const [latest, ...older] = releases.filter((release) => getReleaseCategory(release.channel) === category).sort(compareReleases);
      return <section className="dl_releaseGroup" key={category} aria-labelledby={`release-category-${category}`}>
        <div className="dl_categoryHeader"><div><h3 id={`release-category-${category}`}><span className={`dl_categoryDot dl_categoryDot--${category}`} aria-hidden="true" />{categoryLabel(category, zh)}</h3><p>{descriptions[category]}</p></div>
          {!latest && <span className="dl_categoryEmpty">{uncertain ? (zh ? "暂无法确认" : "Status unavailable") : (zh ? "暂未发布" : "Not yet released")}</span>}
        </div>
        {latest && <div className="dl_categoryFeatured"><ReleaseCard release={latest} locale={locale} latest /></div>}
        {older.length > 0 && <details className="dl_moreReleases">
          <summary><span>{zh ? "查看更多版本" : "View more releases"} <small>({older.length})</small></span><ChevronDown size={19} aria-hidden="true" /></summary>
          <div className="dl_releaseList">{older.map((release) => <ReleaseCard key={`${release.version}-${release.channel}-${release.channelNumber}`} release={release} locale={locale} />)}</div>
        </details>}
      </section>;
    })}</div>
  </div>;
}

function WindowsFaq({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  const questions = zh ? [
    { question: "应该下载哪一种安装包？", answer: "如果希望通过安装向导完成安装，可以选择安装程序（.exe）或 MSI 安装包；如果希望使用便携包，可以选择 .zip。具体提供的文件请以各版本的下载列表和发布说明为准。" },
    { question: "下载了 ZIP 便携包，接下来怎么做？", answer: "先将压缩包完整解压到文件夹，再按照该版本的发布说明启动。请不要直接在压缩包预览窗口中运行程序。" },
    { question: "Windows 显示安全提示怎么办？", answer: "先核对文件是否来自本页链接的官方发布源，并仔细阅读 Windows 显示的提示。如果无法确认文件来源或安全性，请先不要运行；可以到项目仓库查看发布信息或寻求帮助。" },
    { question: "下载失败或安装后无法打开怎么办？", answer: "可以重试下载，检查网络、文件是否完整，以及该版本发布说明中的系统要求。如果仍有问题，请记录版本号和完整错误提示，在项目仓库反馈。" },
  ] : [
    { question: "Which package should I download?", answer: "For a guided installation, choose an installer (.exe) or MSI package. For a portable package, choose the .zip file. Available files vary by release; check its download list and release notes." },
    { question: "What should I do with the portable ZIP?", answer: "Extract the entire archive to a folder first, then follow that release's instructions to start the app. Avoid running it directly from the archive preview." },
    { question: "What if Windows shows a security warning?", answer: "First check that the file came from an official release source linked on this page, and read the Windows message carefully. If you cannot verify its origin or safety, do not run it yet; check the release information or ask for help in the project repository." },
    { question: "What if the download fails or the app does not open?", answer: "Try downloading again and check your connection, whether the file downloaded completely, and the system requirements in the release notes. If the problem persists, include the version and full error message when reporting it in the project repository." },
  ];
  return <section className="dl_faq" aria-labelledby="windows-faq-title">
    <div className="dl_faqHeading"><p className="dl_overline">{zh ? "安装帮助" : "Installation help"}</p><h2 id="windows-faq-title">{zh ? "Windows 安装常见问题" : "Windows installation FAQ"}</h2><p>{zh ? "安装前后遇到疑问，可以先从这里找找答案。" : "Answers to common questions before and after installation."}</p></div>
    <div className="dl_faqList">{questions.map(({ question, answer }) => <details className="dl_faqItem" key={question}><summary><span>{question}</span><ChevronDown size={19} aria-hidden="true" /></summary><p>{answer}</p></details>)}</div>
    <p className="dl_faqHelp">{zh ? "没有找到答案？" : "Still need help?"} <a href="https://github.com/AstraBrew-Labs/AstraBrew-Launcher-Win/issues" target="_blank" rel="noopener noreferrer">{zh ? "前往项目仓库反馈" : "Report an issue in the repository"} <ExternalLink size={14} aria-hidden="true" /></a></p>
  </section>;
}

export function DownloadPage({ locale, region, initialPlatform }: { locale: Locale; region: Region; initialPlatform: "windows" | "mac" | null }) {
  const zh = locale === "zh";
  const detectedPlatform = useSyncExternalStore(subscribePlatform, detectPlatform, serverPlatform);
  const [selectedPlatform, setPlatform] = useState<Platform | null>(initialPlatform);
  const platform = selectedPlatform ?? detectedPlatform;
  const { data: result, failed, syncing, refresh } = useReleases(region);
  const hasError = !result && failed;
  const degraded = result?.sources.some((source) => source.status !== "ok");
  const releases = result?.releases ?? [];
  const source = region === "cn" ? "GitCode" : "GitHub";

  return <main data-transit-path={`/${locale}/download`} id="main-content" className="dl_page" data-release-region={region}>
    <PageMotion page="download" />
    <div className="dl_intro">
      <p className="dl_kicker">AstraBrew Launcher</p>
      <h1>{zh ? "下载星酿启动器" : "Download AstraBrew Launcher"}</h1>
      <p>{zh ? "选择适合你的系统，开始管理 SillyTavern。" : "Choose your platform and get started with SillyTavern."}</p>
    </div>
    <div className="dl_sync">
      <span role="status" data-intro-pending={!result && !failed && platform === "windows" ? true : undefined}>{syncing ? (zh ? "同步版本中…" : "Syncing releases…") : failed ? (result ? (zh ? "同步失败，已保留上次的列表" : "Sync failed · showing saved releases") : (zh ? "暂时无法同步版本" : "Releases unavailable")) : result ? (zh ? "版本列表已同步" : "Release list synced") : (zh ? "准备版本列表" : "Preparing releases")}</span>
      <button type="button" disabled={syncing} onClick={refresh}>{zh ? "刷新列表" : "Refresh list"}</button>
    </div>
    <noscript><a href="https://github.com/AstraBrew-Labs/AstraBrew-Launcher-Win/releases">GitHub Releases ↗</a></noscript>
    <div className="dl_platformBar" role="group" aria-label={zh ? "选择操作系统" : "Choose operating system"}>
      <button type="button" className={platform === "windows" ? "is-active" : ""} aria-pressed={platform === "windows"} onClick={() => setPlatform("windows")}><Monitor size={19} aria-hidden="true" /> Windows</button>
      <button type="button" className={platform === "mac" ? "is-active" : ""} aria-pressed={platform === "mac"} onClick={() => setPlatform("mac")}><Apple size={19} aria-hidden="true" /> macOS</button>
    </div>
    {platform === "other" ? <section className="dl_state" aria-live="polite"><Monitor aria-hidden="true" size={27}/><h2>{zh ? "选择你的操作系统" : "Choose your operating system"}</h2><p>{zh ? "请选择 Windows 或 macOS，查看对应版本。" : "Select Windows or macOS to see the available versions."}</p></section>
      : platform === "mac" ? <section className="dl_state dl_mac" aria-live="polite"><span className="dl_stateIcon"><Apple size={27} aria-hidden="true" /></span><p className="dl_stateLabel">AstraBrew Launcher for macOS</p><h2>{zh ? "Mac 版本尚未发布" : "The Mac version is not yet available"}</h2><p>{zh ? "Mac 版使用 Swift 和 SwiftUI 原生开发，发布后将在这里提供下载。" : "Built natively with Swift and SwiftUI. Downloads will appear here when available."}</p><button type="button" onClick={() => setPlatform("windows")}>{zh ? "查看 Windows 版本" : "See Windows versions"}</button></section>
      : <section className="dl_versions" aria-live="polite">
        <div className="dl_sectionHeading"><div><p className="dl_overline">Windows</p><h2>{zh ? "选择一个版本" : "Choose a release"}</h2><p>{zh ? `当前地区优先使用 ${source}，其他来源用于补全。` : `${source} is preferred for your region; the other source fills any gaps.`}</p></div><span className="dl_native">C# + WinUI 3</span></div>
        {hasError ? <div className="dl_message" role="status"><strong>{zh ? "暂时无法获取版本" : "Versions are temporarily unavailable"}</strong><p>{zh ? "两个发布源目前均无法连接，请稍后重试，或前往仓库查看。" : "Neither release source could be reached. Try again later or visit a repository."}</p><div className="dl_repositoryLinks"><a href="https://github.com/AstraBrew-Labs/AstraBrew-Launcher-Win/releases">GitHub <ExternalLink size={14} aria-hidden="true"/></a><a href="https://gitcode.com/AstraBrew-Labs/AstraBrew-Launcher-Win/releases">GitCode <ExternalLink size={14} aria-hidden="true"/></a></div></div>
        : degraded && <p className="dl_notice">{zh ? "部分发布源暂时不可用或显示缓存数据，列表可能不完整。" : "Some sources are unavailable or using cached data; the list may be incomplete."}</p>}
        {result && <ReleaseList releases={releases} locale={locale} uncertain={!!degraded || failed} />}
        <WindowsFaq locale={locale} />
      </section>}
  </main>;
}
