import { ArrowRight, ArrowUpRight, Code2, MessagesSquare } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageMotion } from "@/components/site/page-motion";
import { RouteSeoContent } from "@/components/site/route-seo-content";
import { isLocale, localizedPath } from "@/lib/i18n";
import { siteMetadata } from "@/lib/site-metadata";
import { launcherReleaseStatus } from "@/lib/launcher-copy";
import "./about.css";

type Props = { params: Promise<{ lang: string }> };
const repository = "https://github.com/AstraBrew-Labs/AstraBrew-Launcher-Win";
const originalRepository = "https://github.com/al01cn/sillyTavern-launcher";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return siteMetadata(lang, "about");
}

export default function AboutPage({ params }: Props) {
  return <Suspense fallback={<div className="site-loading" aria-busy="true" data-intro-pending />}><AboutContent params={params} /></Suspense>;
}

async function AboutContent({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = (zh: string, en: string) => lang === "zh" ? zh : en;
  const href = (path: string) => localizedPath(lang, path);
  const path = href("/about");

  return (
    <main id="main-content" className="about-page" data-transit-path={path}>
      <PageMotion page="about" />
      <header className="about-hero">
        <div className="about-intro">
          <p className="about-eyebrow">AstraBrew Labs</p>
          <RouteSeoContent path={path}><h1>{t("关于我们", "About us")}</h1></RouteSeoContent>
          <p className="about-lead">
            {t("我们是", "We’re ")}<a href="https://www.astrabrew.cn">{t("星酿工坊", "AstraBrew Labs")}</a>{t(
              "（AstraBrew Labs）。我们为 SillyTavern 制作工具，希望让第一次打开酒馆、以及之后的每一次使用，都更简单。",
              ". We build tools for SillyTavern to make it easier to open your tavern for the first time—and to keep it running after that."
            )}
          </p>
        </div>
        <div className="about-art" aria-hidden="true">
          <span className="about-orbit about-orbit--outer" />
          <span className="about-orbit about-orbit--inner" />
          <span className="about-mark"><Image src="/brand/launcher-icon-color.svg" width={112} height={112} alt="" /></span>
          <span className="about-art-label">ASTRABREW / LAUNCHER</span>
        </div>
      </header>

      <section className="about-mission" aria-labelledby="about-mission-title">
        <h2 id="about-mission-title">{t("为什么做星酿启动器？", "Why build AstraBrew Launcher?")}</h2>
        <div>
          <p>{t(
            "第一次用 SillyTavern（酒馆）时，我发现还没打开酒馆，就得先配置运行环境、安装本体。在中国大陆访问 GitHub 也不总是顺畅。光是这些准备工作，就可能让想试试酒馆的人望而却步。于是我做了「",
            "The first time I tried SillyTavern, I had to configure the runtime and install the app before I could even open it. GitHub wasn’t always easy to access from mainland China, either. That’s a lot to ask of someone who just wants to try SillyTavern, so I built "
          )}<a href={originalRepository}>{t("酒馆启动器 GUI", "SillyTavern Launcher GUI")}</a>{t("」，也就是星酿启动器的初版。", ", the first version of AstraBrew Launcher.")}</p>
          <p>{t(
            "后来，我发现初版有兼容性问题，一些设计用起来也不够顺手，于是用原生技术栈从头重做，做出了现在的星酿启动器（AstraBrew Launcher）：Windows 端采用 C# 和 WinUI 3，macOS 端采用 Swift 和 SwiftUI。",
            "Over time, I ran into compatibility issues and found that some parts of the original design were awkward to use. So I rebuilt it from scratch as AstraBrew Launcher, using C# and WinUI 3 on Windows, and Swift and SwiftUI on macOS."
          )}{lang === "en" ? " " : ""}{launcherReleaseStatus[lang]}</p>
          <p>{t(
            "希望星酿启动器能让你少花一点时间折腾配置，轻轻松松开起自己的酒馆。",
            "I hope AstraBrew Launcher helps you spend less time on setup and makes opening your own tavern a little more fun."
          )}</p>
          <Link className="about-action" href={href("/docs")}>{t("阅读使用文档", "Read the user guide")} <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
      </section>

      <section className="about-community" aria-labelledby="about-community-title">
        <h2 id="about-community-title">{t("开源与反馈", "Open source and feedback")}</h2>
        <div className="about-community-grid">
          <article className="about-card">
            <span className="about-card-icon"><Code2 size={21} aria-hidden="true" /></span>
            <h3>{t("查看源码", "Explore the source")}</h3>
            <p>{t("Windows 版采用 Apache 2.0 开源协议。你可以查看实现，也可以先了解协议的权限与条件。", "The Windows edition is open source under Apache 2.0. Explore the implementation or read the license to learn what it allows and requires.")}</p>
            <div className="about-card-links">
              <a href={repository}>GitHub <ArrowUpRight size={16} aria-hidden="true" /></a>
              <Link href={href("/license")}>{t("开源协议", "Read the license")} <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
          </article>
          <article className="about-card">
            <span className="about-card-icon about-card-icon--mint"><MessagesSquare size={21} aria-hidden="true" /></span>
            <h3>{t("告诉我们哪里可以做得更好", "Tell us what could work better")}</h3>
            <p>{t("遇到问题，或有想要的功能？欢迎到 GitHub 提交反馈。报告问题时，可附上启动器版本和复现步骤。", "Found a bug or have an idea? Share it on GitHub. If you’re reporting a bug, include your launcher version and steps to reproduce it.")}</p>
            <div className="about-card-links">
              <a href={`${repository}/issues`}>{t("提交反馈", "Open an issue")} <ArrowUpRight size={16} aria-hidden="true" /></a>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
