import type { MetadataRoute } from 'next'
import { localizedPath, SITE_LANGUAGES, siteUrl } from '@/lib/site-i18n'

const SITE_PAGES = ['/', '/download', '/guide', '/about'] as const

export default function sitemap(): MetadataRoute.Sitemap {
  return SITE_LANGUAGES.flatMap((language) => SITE_PAGES.map((path) => ({
    url: siteUrl(localizedPath(language, path)),
    changeFrequency: 'weekly' as const,
    priority: path === '/' ? 1 : 0.8,
    alternates: {
      languages: {
        'zh-CN': siteUrl(localizedPath('zh', path)),
        en: siteUrl(localizedPath('en', path)),
        'x-default': siteUrl(localizedPath('zh', path)),
      },
    },
  })))
}
