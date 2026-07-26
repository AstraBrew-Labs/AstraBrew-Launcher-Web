import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import {
  isSiteLanguage,
  openGraphImage,
  SITE_LANGUAGES,
  siteName,
  type SiteLanguage,
} from '@/lib/site-i18n'
import '../../globals.css'

export const dynamicParams = false

export function generateStaticParams() {
  return SITE_LANGUAGES.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  if (!isSiteLanguage(lang)) notFound()

  const language = lang as SiteLanguage
  const title = siteName(language)
  const description = language === 'zh'
    ? '星酿启动器 —— 面向新手的 SillyTavern 一站式启动与管理工具，支持 Windows 与 macOS。'
    : 'A beginner-friendly SillyTavern launcher and manager for Windows and macOS.'
  const image = openGraphImage(language)

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://launcher.astrabrew.cn'),
    title: {
      default: title,
      template: '%s',
    },
    description,
    keywords: language === 'zh'
      ? ['星酿启动器', '酒馆启动器', 'SillyTavern', '环境配置', '实例管理', 'Windows', 'macOS']
      : ['AstraBrew Launcher', 'SillyTavern launcher', 'instance manager', 'Windows', 'macOS'],
    authors: [{ name: language === 'zh' ? '星酿团队' : 'AstraBrew Team' }],
    creator: language === 'zh' ? '星酿团队' : 'AstraBrew Team',
    openGraph: {
      type: 'website',
      title,
      description,
      url: `/${language}`,
      locale: language === 'zh' ? 'zh_CN' : 'en_US',
      alternateLocale: language === 'zh' ? ['en_US'] : ['zh_CN'],
      siteName: title,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    icons: {
      icon: [
        { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
        { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
        { url: '/images/logo.png', type: 'image/png' },
      ],
      shortcut: '/icon-light-32x32.png',
      apple: '/apple-icon.png',
    },
  }
}

export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0D1520' },
    { media: '(prefers-color-scheme: light)', color: '#F4F8FA' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default async function LocalizedRootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ lang: string }>
}>) {
  const { lang } = await params
  if (!isSiteLanguage(lang)) notFound()

  const language = lang as SiteLanguage

  return (
    <html
      lang={language === 'zh' ? 'zh-CN' : 'en'}
      className="dark bg-background"
      data-theme="dark"
      data-language={language}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className="font-sans antialiased bg-background text-foreground"
        suppressHydrationWarning
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
