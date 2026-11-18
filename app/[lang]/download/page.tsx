import { Suspense } from "react";
import { requestRegion } from "@/lib/request-region";
import { connection } from "next/server";
import { DownloadPage } from "@/components/download/download-page";
import { isLocale } from "@/lib/i18n";
import { siteMetadata } from "@/lib/site-metadata";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return siteMetadata(lang === "en" ? "en" : "zh", "download");
}

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<{ platform?: string | string[] }> };
export default function Page({ params, searchParams }: Props) {
  return <Suspense fallback={<div className="dl_loading" role="status" data-intro-pending>Loading… / 正在加载…</div>}><DownloadContent params={params} searchParams={searchParams} /></Suspense>;
}

async function DownloadContent({ params, searchParams }: Props) {
  await connection();
  const [{ lang }, query, region] = await Promise.all([params, searchParams, requestRegion()]);
  const locale = isLocale(lang) ? lang : "en";
  const initialPlatform = query.platform === "windows" || query.platform === "mac" ? query.platform : null;
  return <DownloadPage locale={locale} region={region} initialPlatform={initialPlatform} />;
}
