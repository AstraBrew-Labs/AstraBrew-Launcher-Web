import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import DownloadPage from '@/components/download/download-page'
import { createPageMetadata, isSiteLanguage, type SiteLanguage } from '@/lib/site-i18n'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  if (!isSiteLanguage(lang)) notFound()
  return createPageMetadata(lang as SiteLanguage, 'download')
}

export default function Page() {
  return <DownloadPage />
}
