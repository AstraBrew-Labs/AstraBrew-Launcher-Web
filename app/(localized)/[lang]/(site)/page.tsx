import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import HeroSection from '@/components/home/hero-section'
import FeaturesSection from '@/components/home/features-section'
import CommunitySection from '@/components/home/community-section'
import SponsorSection from '@/components/home/sponsor-section'

import { createPageMetadata, isSiteLanguage, type SiteLanguage } from '@/lib/site-i18n'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  if (!isSiteLanguage(lang)) notFound()
  return createPageMetadata(lang as SiteLanguage, 'home')
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <CommunitySection />
      <SponsorSection />
    </>
  )
}
