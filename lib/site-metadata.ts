import type { Metadata } from "next";
import { locales, localizedPath, type Locale } from "./i18n";
import { launcherReleaseStatus } from "./launcher-copy";

/** Local audits get complete metadata without using a request-controlled Host header. */
export function siteOrigin(): string | null {
  const development = process.env.NODE_ENV === "development";
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) {
    if (!development) {
      return process.env.VERCEL_ENV === "production" ? "https://launcher.astrabrew.cn" : null;
    }
    const port = Number(process.env.PORT);
    return `http://localhost:${Number.isInteger(port) && port > 0 && port <= 65535 ? port : 3000}`;
  }

  try {
    const url = new URL(configured);
    if (url.username || url.password) return null;
    const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname.replace(/\.$/, ""));
    if (loopback) {
      return development && ["http:", "https:"].includes(url.protocol) ? url.origin : null;
    }
    return url.protocol === "https:" ? url.origin : null;
  } catch {
    return null;
  }
}

const sections = { home: "/", download: "/download", license: "/license", about: "/about", changelog: "/changelog" } as const;
export type SitePage = keyof typeof sections;
type ShareSection = SitePage | "docs";
export type LocalizedPaths = Partial<Record<Locale, string>>;
export const sitePages = ["home", "download", "license", "about", "changelog"] as const satisfies readonly SitePage[];

const brand = { zh: "星酿启动器", en: "AstraBrew Launcher" };
const ogLocales = { zh: "zh_CN", en: "en_US" };
// Keep existing subpage titles stable when the home page title changes.
const subpageTitleSuffix = {
  zh: "星酿启动器｜SillyTavern 酒馆启动与管理工具",
  en: "AstraBrew Launcher — SillyTavern Launcher",
} as const;
const copy = {
  zh: {
    home: {
      title: "星酿启动器 (AstraBrew Launcher) · 简单易用的 SillyTavern 酒馆启动器",
      description: `星酿启动器是一款面向新手的 SillyTavern 工具，将环境配置、酒馆启动、实例管理和版本更新集中在一处。${launcherReleaseStatus.zh}`,
    },
    download: {
      title: "Windows 版下载",
      description: "查看星酿启动器 Windows 版的稳定版、测试版与历史发行版本，选择所需的安装包。macOS 版尚未发布。",
    },
    license: {
      title: "Apache 2.0 开源协议",
      description: "查看星酿启动器 Windows 版的 Apache 2.0 协议原文，以及商业使用、修改和分发的权限、条件与限制。",
    },
    changelog: {
      title: "更新日志",
      description: "沿时间线查看星酿启动器官网的新功能、设计调整和体验改进。",
    },
    about: {
      title: "关于我们",
      description: "认识星酿（AstraBrew Labs），了解我们为什么开发 SillyTavern 启动器，以及如何查看 Windows 版源码和提交反馈。",
    },
  },
  en: {
    home: {
      title: "AstraBrew Launcher (星酿启动器) · A simpler way to run SillyTavern",
      description: `Set up, launch, and manage SillyTavern with AstraBrew Launcher. ${launcherReleaseStatus.en}`,
    },
    download: {
      title: "Download for Windows",
      description: "Find Windows installers for stable, beta, and previous releases of AstraBrew Launcher. The macOS version is not yet available.",
    },
    license: {
      title: "Apache 2.0 License",
      description: "Read the Apache 2.0 license for AstraBrew Launcher on Windows, with a summary of permissions, conditions, and limitations.",
    },
    changelog: {
      title: "Website Changelog",
      description: "Browse a timeline of new features, design changes, and improvements to the AstraBrew Launcher website.",
    },
    about: {
      title: "About AstraBrew Labs",
      description: "Meet AstraBrew Labs, learn why we build tools for SillyTavern, and find out how to explore the Windows launcher source or share feedback.",
    },
  },
} as const;

export function formatSiteTitle(locale: Locale, pageTitle: string): string {
  return `${pageTitle} | ${subpageTitleSuffix[locale]}`;
}

type ImageSection = Exclude<ShareSection, "changelog">;
const imageAlt: Record<ImageSection, Record<Locale, string>> = {
  home: { zh: "星酿启动器：一站式启动与管理 SillyTavern", en: "AstraBrew Launcher: set up and manage SillyTavern" },
  download: { zh: "星酿启动器 Windows 版下载", en: "Download AstraBrew Launcher for Windows" },
  license: { zh: "星酿启动器 Windows 版：Apache 2.0 开源协议", en: "AstraBrew Launcher for Windows: Apache 2.0 license" },
  about: { zh: "关于我们：星酿 AstraBrew Labs", en: "About us: AstraBrew Labs" },
  docs: { zh: "星酿启动器使用文档：从安装到启动", en: "AstraBrew Launcher user guide: from installation to launch" },
};

const artworkFor = (section: ShareSection): ImageSection => section === "changelog" ? "home" : section;

export function shareImagePath(section: ShareSection, locale: Locale) {
  return `/brand/og/${artworkFor(section)}-${locale}-v1.png`;
}

export function sitePagePaths(page: SitePage): Record<Locale, string> {
  return { zh: localizedPath("zh", sections[page]), en: localizedPath("en", sections[page]) };
}

/** Only advertise locales where this exact page exists. */
export function absoluteLocaleUrls(paths: LocalizedPaths, origin = siteOrigin()): LocalizedPaths {
  const urls: LocalizedPaths = {};
  if (origin) {
    for (const locale of locales) {
      const path = paths[locale];
      if (path) urls[locale] = `${origin}${path}`;
    }
  }
  return urls;
}

export function languageAlternates(urls: LocalizedPaths) {
  if (!urls.zh || !urls.en) return undefined;
  return { zh: urls.zh, en: urls.en, "x-default": urls.en };
}

export function localizedMetadata({ locale, paths, section, title: pageTitle, description }: {
  locale: Locale;
  paths: LocalizedPaths;
  section: ShareSection;
  title: string;
  description: string;
}): Metadata {
  const title = section === "home" ? pageTitle : formatSiteTitle(locale, pageTitle);
  const origin = siteOrigin();
  const urls = absoluteLocaleUrls(paths, origin);
  const canonical = urls[locale];
  const image = origin ? { url: origin + shareImagePath(section, locale), width: 1200, height: 630, alt: imageAlt[artworkFor(section)][locale], type: "image/png" } : undefined;
  const alternateLocale = locales.filter(other => other !== locale && paths[other]).map(other => ogLocales[other]);
  return {
    title,
    description,
    ...(canonical ? { alternates: { canonical, languages: languageAlternates(urls) } } : {}),
    openGraph: {
      type: "website",
      title,
      description,
      siteName: brand[locale],
      locale: ogLocales[locale],
      alternateLocale,
      url: canonical,
      images: image ? [image] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [{ url: image.url, alt: image.alt }] : undefined,
    },
  };
}

export function siteMetadata(locale: Locale, page: SitePage): Metadata {
  return localizedMetadata({ locale, paths: sitePagePaths(page), section: page, ...copy[locale][page] });
}

export function launcherStructuredData(locale: Locale) {
  const origin = siteOrigin();
  if (!origin) return null;
  const baseUrl = origin + sitePagePaths("home").en;
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${baseUrl}#launcher`,
    name: brand[locale],
    alternateName: brand[locale === "zh" ? "en" : "zh"],
    description: copy[locale].home.description,
    operatingSystem: "Windows",
    applicationCategory: "UtilitiesApplication",
    url: origin + sitePagePaths("home")[locale],
    installUrl: origin + sitePagePaths("download")[locale],
    image: origin + shareImagePath("home", locale),
  };
}
