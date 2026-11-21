import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BackToTop } from "@/components/site/back-to-top";
import { PageMotion } from "@/components/site/page-motion";
import { RouteSeoContent } from "@/components/site/route-seo-content";
import { isLocale, localizedPath } from "@/lib/i18n";
import { siteMetadata } from "@/lib/site-metadata";
import { updates } from "./entries";
import { TimelineMotion } from "./timeline-motion";
import "./changelog.css";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return siteMetadata(lang, "changelog");
}

export default function ChangelogPage({ params }: Props) {
  return <Suspense fallback={<div className="site-loading" aria-busy="true" data-intro-pending />}><ChangelogContent params={params} /></Suspense>;
}

const categories = {
  website: { zh: "网站", en: "Website" },
  experience: { zh: "体验", en: "Experience" },
  maintenance: { zh: "优化", en: "Improvements" },
};

async function ChangelogContent({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = (zh: string, en: string) => lang === "zh" ? zh : en;
  const formatDate = new Intl.DateTimeFormat(t("zh-CN", "en-US"), { dateStyle: "long", timeZone: "UTC" });
  const path = localizedPath(lang, "/changelog");
  const stations = updates.map((update, index) => ({
    id: update.id,
    number: String(index + 1).padStart(2, "0"),
    date: formatDate.format(new Date(`${update.date}T00:00:00Z`)),
    title: update.title[lang],
  }));

  return <main id="main-content" className="changelog-page" data-transit-path={path}>
    <PageMotion page="changelog" />
    <header className="changelog-hero">
      <div>
        <p className="changelog-kicker">{t("星酿启动器 / 官网档案", "AstraBrew Launcher / Website archive")}</p>
        <RouteSeoContent path={path}><h1>{t("更新日志", "Changelog")}</h1></RouteSeoContent>
        <p className="changelog-lead">{t("沿着时间线，回看星酿启动器官网是怎样一步步变成现在的样子。", "Follow the timeline to see how the AstraBrew Launcher website took shape.")}</p>
      </div>
      <a href="#log-timeline" className="changelog-index-link">
        <span>{t("浏览记录", "Explore the log")}</span><ArrowDownRight size={20} aria-hidden="true" />
      </a>
    </header>
    <TimelineMotion stations={stations} labels={{ title: t("时间线", "Timeline"), newest: t("最新", "Newest"), oldest: t("最早", "Oldest") }}>
      <ol className="log-entries" role="list" aria-label={t("网站更新记录（从新到旧）", "Website updates, newest first")}>
        {updates.map((update, index) => {
          const station = stations[index];
          const [year, month, day] = update.date.split("-");
          const startsDay = update.date !== updates[index - 1]?.date;
          return <li key={update.id} id={update.id} className="log-entry" data-log-entry>
            <div className="log-entry-index" aria-hidden="true">
              <span className="log-entry-number">{station.number}</span>
              {startsDay && <div className="log-day"><span>{year}</span><strong>{month}<i>.</i>{day}</strong></div>}
            </div>
            <span className="log-node" aria-hidden="true" />
            <article className="log-story" aria-labelledby={`${update.id}-title`}>
              <div className="log-meta">
                <time dateTime={update.date}>{station.date}</time>
                <span className="log-category">{categories[update.kind][lang]}</span>
              </div>
              <h2 id={`${update.id}-title`}>{station.title}</h2>
              <ul>{update.notes.map((note) => <li key={note.en}>{note[lang]}</li>)}</ul>
            </article>
            <span className="log-sweep" aria-hidden="true" />
          </li>;
        })}
      </ol>
    </TimelineMotion>
    <div className="changelog-end">
      <p>{t("在找启动器的发行版本？", "Looking for launcher releases?")}</p>
      <Link href={localizedPath(lang, "/download")}>{t("查看版本下载", "Browse downloads")} <ArrowUpRight aria-hidden="true" size={16} /></Link>
    </div>
    <BackToTop locale={lang} />
  </main>;
}
