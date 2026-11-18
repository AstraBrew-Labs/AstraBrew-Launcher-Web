import { Suspense } from "react";
import Link from "next/link";
import { Boxes, FolderCog, RefreshCw, ArrowUpRight, Download, Settings2, Play, Monitor, Apple, Code2 } from "lucide-react";
import { PageMotion } from "@/components/site/page-motion";
import { WorkspaceShowcase } from "@/components/home/workspace-showcase";
import { HomeHero } from "@/components/home/home-hero";
import { WindowsDownloads, WindowsDownloadsLoading } from "@/components/home/windows-downloads";
import { isLocale, type Locale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import "@/components/home/home.css";
import { launcherStructuredData, siteMetadata } from "@/lib/site-metadata";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return siteMetadata(lang === "en" ? "en" : "zh", "home");
}

export function generateStaticParams() {
  return [{ lang: "zh" }, { lang: "en" }];
}

export default function Home({ params }: { params: Promise<{ lang: string }> }) {
  return <Suspense fallback={<div className="home-loading" aria-busy="true" data-intro-pending />}><LocalizedHome params={params} /></Suspense>;
}

async function LocalizedHome({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const structuredData = launcherStructuredData(lang);
  return <>
    {structuredData && <script type="application/ld+json" dangerouslySetInnerHTML={{
      __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
    }} />}
    <HomeContent locale={lang} />
  </>;
}

function HomeContent({ locale }: { locale: Locale }) {
  const en = locale === "en";
  const features = en ? [
    { icon: FolderCog, title: "Set up your environment", body: "Bring the pieces needed to get started together in one place." },
    { icon: Boxes, title: "Manage your instances", body: "Keep your SillyTavern instances and their settings organized." },
    { icon: RefreshCw, title: "Keep versions in view", body: "Find and manage versions as your setup evolves." },
  ] : [
    { icon: FolderCog, title: "整理运行环境", body: "把开始使用所需的环境配置集中到一处。" },
    { icon: Boxes, title: "管理酒馆实例", body: "在一个熟悉的地方整理你的酒馆实例与配置。" },
    { icon: RefreshCw, title: "查看和管理版本", body: "随着使用需求变化，查看并管理酒馆版本。" },
  ];
  return <main data-transit-path={`/${locale}`} id="main-content" className="home-page">
    <PageMotion page="home" />
    <HomeHero locale={locale} windowsDownloads={<Suspense fallback={<WindowsDownloadsLoading locale={locale} />}><WindowsDownloads locale={locale} /></Suspense>} />
    <div className="home-feature-strip"><span>{en ? "Environment setup" : "环境配置"}</span><span>{en ? "Instance management" : "实例管理"}</span><span>{en ? "Version management" : "版本管理"}</span><span>{en ? "Open source" : "开源开放"}</span></div>
    <section className="home-features" id="features" aria-labelledby="features-title">
      <div className="home-features-heading"><div><p className="home-section-label">{en ? "A little less setup" : "从准备到启动"}</p><h2 id="features-title">{en ? <>More room for<br />your stories.</> : <>把繁琐留给我们，<br />把时间留给故事。</>}</h2></div><p>{en ? "A clear starting point for the everyday work of running your tavern." : "把繁琐的准备工作收进一个清晰的工作台，让每次打开酒馆都更从容。"}</p></div>
      <div className="home-feature-list">{features.map(({ icon: Icon, title, body }) => <article key={title}><span className="home-feature-icon"><Icon size={21} strokeWidth={1.6} aria-hidden="true" /></span><div><h3>{title}</h3><p>{body}</p></div></article>)}</div>
    </section>
    <WorkspaceShowcase locale={locale} />
    <section className="home-path" aria-labelledby="path-title">
      <div className="home-path-heading"><div><p className="home-section-label">{en ? "Getting started" : "开始使用"}</p><h2 id="path-title">{en ? <>A little preparation.<br />A lot more possibility.</> : <>准备就绪，<br />从容出发。</>}</h2></div><p>{en ? "New to SillyTavern? Start with the " : "刚开始使用 SillyTavern？先阅读"}<Link className="home-guide-link" href={`/${locale}/docs/installation`} prefetch={false}>{en ? "Windows installation guide" : "Windows 安装指南"}</Link>{en ? "." : "。"}</p></div>
      <div className="home-path-steps">{(en ? [
        { icon: Download, title: "Choose a release", body: "Find a Windows package that suits your needs on the downloads page." },
        { icon: Settings2, title: "Set things up", body: "Open the launcher and configure the environment and tavern instance." },
        { icon: Play, title: "Start your tavern", body: "Launch and manage your setup from your workspace." },
      ] : [
        { icon: Download, title: "选择版本", body: "在下载页找到适合自己的 Windows 安装包。" },
        { icon: Settings2, title: "完成配置", body: "打开启动器，整理运行环境与酒馆实例。" },
        { icon: Play, title: "启动酒馆", body: "从工作台出发，启动和管理你的酒馆。" },
      ]).map(({ icon: Icon, title, body }, index) => <article key={title} className="home-path-step"><div className="home-path-step-top"><span>0{index + 1}</span><Icon size={22} strokeWidth={1.5} aria-hidden="true" /></div><h3>{title}</h3><p>{body}</p></article>)}</div>
    </section>
    <section className="home-platforms" aria-labelledby="platforms-title"><div className="home-platforms-inner"><div className="home-platforms-intro"><p className="home-section-label">{en ? "Made for your desktop" : "为桌面而来"}</p><h2 id="platforms-title">{en ? <>A familiar place<br />to begin.</> : <>熟悉的桌面，<br />全新的起点。</>}</h2><p>{en ? "Built for each platform with its own native technology." : "为不同平台采用各自的原生技术构建。"}</p></div><div className="home-platform-cards"><article><Monitor size={25} strokeWidth={1.5} aria-hidden="true"/><span className="home-platform-status">{en ? "Available" : "已发布"}</span><h3>Windows</h3><p>C# + WinUI 3</p><Link href={`/${locale}/download?platform=windows`}>{en ? "Explore Windows releases" : "查看 Windows 版本"}<ArrowUpRight size={16} aria-hidden="true" /></Link></article><article><Apple size={25} strokeWidth={1.5} aria-hidden="true"/><span className="home-platform-status home-platform-status--muted">{en ? "Not yet released" : "暂未发布"}</span><h3>macOS</h3><p>Swift + SwiftUI</p><Link href={`/${locale}/download?platform=mac`}>{en ? "About the Mac version" : "了解 Mac 版本"}<ArrowUpRight size={16} aria-hidden="true" /></Link></article></div></div><div className="home-open-source"><div><Code2 size={21} aria-hidden="true"/><span>{en ? "Open source, built in the open." : "开源构建，与社区一起完善。"}</span></div><Link href={`/${locale}/license`}>{en ? "Open-source license" : "查看开源协议"}<ArrowUpRight size={16} aria-hidden="true" /></Link></div></section>
    <section className="home-end"><div><p>{en ? "Ready when you are" : "随时准备好，等你出发"}</p><h2>{en ? "Start with AstraBrew Launcher." : "从星酿启动器，开启你的酒馆旅程。"}</h2></div><Link href={`/${locale}/download`}>{en ? "Explore downloads" : "查看下载"}<ArrowUpRight size={18} aria-hidden="true" /></Link></section>
  </main>;
}
