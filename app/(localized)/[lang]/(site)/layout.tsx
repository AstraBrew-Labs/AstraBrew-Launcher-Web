import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import PageTransition from '@/components/page-transition'
import { isSiteLanguage, type SiteLanguage } from '@/lib/site-i18n'
import { SitePreferencesProvider } from '@/components/site-preferences'

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!isSiteLanguage(lang)) return null

  return (
    <SitePreferencesProvider language={lang as SiteLanguage}>
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
      </div>
    </SitePreferencesProvider>
  )
}
