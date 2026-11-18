import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { ProductDemo } from "@/components/product-demo/product-demo";
import { PageMotion } from "@/components/site/page-motion";
import "./preview.css";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === "en" ? "Design preview | AstraBrew Launcher" : "设计预览｜星酿启动器",
    robots: { index: false, follow: true },
  };
}

export function generateStaticParams() {
  return [{ lang: "zh" }, { lang: "en" }];
}

export default function Preview({ params }: { params: Promise<{ lang: string }> }) {
  return (
    <Suspense fallback={<div className="pv_page" aria-busy="true" data-intro-pending />}>
      <LocalizedPreview params={params} />
    </Suspense>
  );
}

async function LocalizedPreview({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = lang === "en" ? "en" : "zh";
  const en = locale === "en";
  return <div data-transit-path={`/${locale}/preview`} className="pv_page">
    <PageMotion page="preview" />
    <div className={"pv_banner"}>{en ? "Homepage design preview · Download links are not connected yet" : "首屏设计预览　·　布局为设计预览，下载链接尚未接入"}</div>
    <header className={"pv_header"}><span className={"pv_logo"}><Image src="/brand/launcher-lockup-color.svg" alt="星酿启动器" width={166} height={44} /></span><nav aria-label={en ? "Navigation preview" : "导航预览"}><span>{en ? "Product" : "产品介绍"}</span><span>{en ? "Downloads" : "版本下载"}</span><span>{en ? "License" : "开源协议"}</span><span className={"pv_headerButton"}>{en ? "Get Launcher" : "获取启动器"}</span></nav></header>
    <main id="main-content" className={"pv_hero"}><div className={"pv_copy"}><div className={"pv_name"}>AstraBrew Launcher</div><h1>{en ? <>Your tavern,<br/>ready to go.</> : <>打开酒馆，<br/>从这里开始。</>}</h1><p>{en ? "A beginner-friendly way to set up, launch, and manage SillyTavern in one place." : "专为新手打造的 SillyTavern 一站式启动与管理工具。环境配置、实例管理与版本更新，都可以从这里开始。"}</p><div className={"pv_actions"}><span className={"pv_primary"}>{en ? "Download for Windows" : "下载 Windows 版"}</span><span className={"pv_secondary"}>{en ? "View all versions" : "查看所有版本"}</span></div><p className={"pv_platform"}>{en ? "Available for Windows · macOS is not yet released" : "Windows 可用　·　macOS 版本尚未发布"}</p></div><div className={"pv_visual"}><div className={"pv_orbit"}/><ProductDemo locale={locale}/></div></main>
    <div className={"pv_features"}>{(en ? ["Environment setup", "Instance management", "Version updates", "Open source"] : ["环境配置", "实例管理", "版本更新", "开源构建"]).map(item => <span key={item}>{item}</span>)}</div>
  </div>;
}
