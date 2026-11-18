import { RouteSeoContent } from "@/components/site/route-seo-content";
import { PageMotion } from "@/components/site/page-motion";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ArrowDown, ArrowUpRight, Check, CircleSlash, FileText, Info, ListChecks, Scale } from "lucide-react";
import { Suspense } from "react";
import type { Metadata } from "next";
import { siteMetadata } from "@/lib/site-metadata";
import { LicenseReader } from "./license-reader";
import "./license.css";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return siteMetadata(lang === "en" ? "en" : "zh", "license");
}

export default function LicensePage({ params }: Props) {
  return <Suspense fallback={<div className="license-page" aria-busy="true" data-intro-pending />}><LicenseContent params={params} /></Suspense>;
}

async function LicenseContent({ params }: Props) {
  const { lang } = await params;
  const en = lang === "en";
  const license = await readFile(path.join(process.cwd(), "content/windows-license.txt"), "utf8");
  const t = (zh: string, english: string) => en ? english : zh;
  const groups = [
    { title: t("权限", "Permissions"), kind: "allowed", Icon: Check, items: [
      t("商业使用", "Commercial use"), t("修改代码", "Modification"), t("分发副本", "Distribution"),
      t("私人使用", "Private use"), t("专利使用（限第 3 条授权范围）", "Patent use within the scope of section 3"),
    ] },
    { title: t("条件", "Conditions"), kind: "required", Icon: ListChecks, items: [
      t("分发时附上协议副本", "Include the license when distributing"),
      t("在修改过的文件中标明变更", "Mark files you have changed"),
      t("保留适用的版权及其他声明；如有 NOTICE，保留其中适用的署名信息", "Keep applicable notices and relevant attributions from any NOTICE file"),
    ] },
    { title: t("限制", "Limitations"), kind: "limited", Icon: CircleSlash, items: [
      t("不授予商标使用权（第 6 条所列情形除外）", "No trademark rights beyond the exceptions in section 6"),
      t("不提供担保", "No warranty"), t("贡献者责任受限", "Limited contributor liability"),
    ] },
  ];
  return (
    <main data-transit-path={`/${lang}/license`} id="main-content" className="license-page">
      <PageMotion page="license" />
      <div className="license-shell">
        <header className="license-intro">
          <span className="license-kicker">AstraBrew Launcher / Windows</span>
          <RouteSeoContent path={`/${lang}/license`}><h1>{t("开源协议", "Open-source license")}</h1></RouteSeoContent>
        </header>
        <article className="license-document" aria-labelledby="license-name">
          <div className="license-filebar">
            <span><FileText size={17} aria-hidden="true" /> LICENSE.txt</span>
            <a href="https://github.com/AstraBrew-Labs/AstraBrew-Launcher-Win/blob/v2/LICENSE.txt" target="_blank" rel="noopener noreferrer">
              {t("在 GitHub 查看", "View on GitHub")} <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
          <div className="license-overview">
            <h2 id="license-name"><Scale size={26} aria-hidden="true" /> Apache License 2.0</h2>
            <p className="license-description">{t(
              "星酿启动器 Windows 版采用这份宽松的开源协议。你可以在商业或私人项目中使用和修改它，也可以分发原版或修改版；分发时须保留相关声明。",
              "AstraBrew Launcher for Windows uses this permissive license. You can use and adapt it for personal or commercial projects, and share original or modified copies as long as you keep the required notices."
            )}</p>
            <div className="license-groups">
              {groups.map(({ title, kind, Icon, items }) => (
                <section key={kind} className={`license-group license-group--${kind}`}>
                  <h3>{title}</h3>
                  <ul>{items.map(item => <li key={item}><Icon size={16} aria-hidden="true" /><span>{item}</span></li>)}</ul>
                </section>
              ))}
            </div>
            <div className="license-note"><Info size={16} aria-hidden="true" />
              <p>{t("此摘要仅供速览，不替代下方的协议原文。", "This summary is a reading aid, not a substitute for the license text.")}</p>
              <a href="#license-text">{t("阅读原文", "Read full text")} <ArrowDown size={14} aria-hidden="true" /></a>
            </div>
          </div>
          <section id="license-text" aria-labelledby="license-text-heading" tabIndex={-1}>
            <h2 id="license-text-heading" className="license-document-heading">{t("协议原文", "Original license text")}</h2>
            <LicenseReader text={license} en={en} />
          </section>
        </article>
      </div>
    </main>
  );
}
