import type { Metadata } from 'next'

export const SITE_LANGUAGES = ['zh', 'en'] as const
export type SiteLanguage = (typeof SITE_LANGUAGES)[number]
export const DEFAULT_SITE_LANGUAGE: SiteLanguage = 'zh'

export function isSiteLanguage(value: string): value is SiteLanguage {
  return SITE_LANGUAGES.includes(value as SiteLanguage)
}

export function localizedPath(language: SiteLanguage, path = '/') {
  const normalizedPath = path === '/' ? '' : `/${path.replace(/^\/+/, '')}`
  return `/${language}${normalizedPath}`
}

export function withoutLanguage(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  return isSiteLanguage(segments[0] ?? '')
    ? `/${segments.slice(1).join('/')}` || '/'
    : pathname || '/'
}

const PAGE_METADATA = {
  home: {
    zh: {
      title: '星酿启动器 (AstraBrew Launcher) · 简单易用的 SillyTavern 酒馆启动器',
      description: '星酿启动器是面向新手的 SillyTavern 一站式启动与管理工具，支持 Windows 与 macOS。',
    },
    en: {
      title: 'AstraBrew Launcher (星酿启动器) · A simpler way to run SillyTavern',
      description: 'A beginner-friendly SillyTavern launcher and manager for Windows and macOS.',
    },
  },
  download: {
    zh: {
      title: '下载 · 星酿启动器 (AstraBrew Launcher)',
      description: '下载适用于 Windows 和 macOS 的最新版星酿启动器。',
    },
    en: {
      title: 'Download · AstraBrew Launcher (星酿启动器)',
      description: 'Download the latest AstraBrew Launcher for Windows and macOS.',
    },
  },
  guide: {
    zh: {
      title: '使用说明 · 星酿启动器 (AstraBrew Launcher)',
      description: '星酿启动器的 Windows 与 macOS 安装说明和常见问题。',
    },
    en: {
      title: 'Guide · AstraBrew Launcher (星酿启动器)',
      description: 'Installation instructions and frequently asked questions for AstraBrew Launcher on Windows and macOS.',
    },
  },
  about: {
    zh: {
      title: '关于 · 星酿启动器 (AstraBrew Launcher)',
      description: '了解星酿启动器如何简化 SillyTavern 的环境配置、实例管理与一键启动。',
    },
    en: {
      title: 'About · AstraBrew Launcher (星酿启动器)',
      description: 'Learn how AstraBrew simplifies SillyTavern setup, instance management, and launch workflows.',
    },
  },
} as const

export type SitePage = keyof typeof PAGE_METADATA

const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://xingniang.app'

export function createPageMetadata(language: SiteLanguage, page: SitePage): Metadata {
  const content = PAGE_METADATA[page][language]
  const pagePath = page === 'home' ? '/' : `/${page}`

  return {
    title: content.title,
    description: content.description,
    alternates: {
      canonical: localizedPath(language, pagePath),
      languages: {
        'zh-CN': localizedPath('zh', pagePath),
        en: localizedPath('en', pagePath),
        'x-default': localizedPath('zh', pagePath),
      },
    },
    openGraph: {
      locale: language === 'zh' ? 'zh_CN' : 'en_US',
      title: content.title,
      description: content.description,
      url: new URL(localizedPath(language, pagePath), siteOrigin),
    },
  }
}

export function siteUrl(path: string) {
  return new URL(path, siteOrigin).toString()
}
