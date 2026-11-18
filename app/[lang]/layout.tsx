import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { RouteTransition } from "@/components/site/route-transition";
import { BootScreenStyles } from "@/components/site/boot-screen-styles";
import { ReloadIntro } from "@/components/site/reload-intro";
import { SiteFooter } from "@/components/site/site-footer";
import { requestRegion } from "@/lib/request-region";
import { isLocale } from "@/lib/i18n";
import { DocumentBootstrap } from "@/components/site/document-bootstrap";
import "../globals.css";
import "../theme.css";

async function RegionHint() { return <span hidden data-request-region={await requestRegion()} />; }

export function generateStaticParams() { return [{ lang: "zh" }, { lang: "en" }]; }
export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <html lang={lang === "zh" ? "zh-CN" : "en"} data-theme="light" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <BootScreenStyles />
        <link rel="preload" as="font" type="font/woff2" href="/fonts/ZCOOLKuaiLe-subset.woff2" crossOrigin="anonymous" />
        <link rel="preload" as="font" type="font/woff2" href="/fonts/Nunito-Latin-Variable.woff2" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>
        <DocumentBootstrap intro />
        <a className="skip-link" href="#main-content">{lang === "zh" ? "跳到主要内容" : "Skip to main content"}</a>
        <Suspense fallback={null}><RegionHint /></Suspense>
        <ReloadIntro locale={lang} />
        <Suspense fallback={null}><RouteTransition /></Suspense>
        <SiteHeader locale={lang} />
        {children}
        <SiteFooter locale={lang} />
      </body>
    </html>
  );
}
