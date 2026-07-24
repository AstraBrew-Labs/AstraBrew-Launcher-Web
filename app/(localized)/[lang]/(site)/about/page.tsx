import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import AboutPage from '@/components/about/about-page'
import { createPageMetadata, isSiteLanguage, type SiteLanguage } from '@/lib/site-i18n'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  if (!isSiteLanguage(lang)) notFound()
  return createPageMetadata(lang as SiteLanguage, 'about')
}

export default function AboutRoute() {
  return <AboutPage />
}
