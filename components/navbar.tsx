'use client'

import { useState, useEffect, type Key } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Cloud, CloudOff, Menu, X, Download, Languages, Moon, Sun } from 'lucide-react'
import { Button, Dropdown, Label, Tooltip, buttonVariants } from '@heroui/react'
import { useSitePreferences, type SiteLanguage } from '@/components/site-preferences'
import { localizedPath } from '@/lib/site-i18n'

const navLinks = [
  { href: '/', zh: '主页', en: 'Home' },
  { href: '/download', zh: '下载', en: 'Download' },
  { href: '/guide', zh: '使用说明', en: 'Guide' },
  { href: '/about', zh: '关于', en: 'About' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const {
    ready,
    language,
    setLanguage,
    t,
    theme,
    toggleTheme,
    githubProxyEnabled,
    toggleGithubProxy,
  } = useSitePreferences()

  const selectLanguage = (key: Key) => {
    if (key === 'zh' || key === 'en') setLanguage(key as SiteLanguage)
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <>
      <header
        className={`nav-enter fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'glass-card border-b border-border/50'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href={localizedPath(language, '/')} className="flex items-center gap-2.5 group">
              <div className="relative w-8 h-8">
                <Image
                  src="/images/logo.png"
                  alt={t('星酿启动器 Logo', 'AstraBrew Launcher logo')}
                  width={32}
                  height={32}
                  sizes="32px"
                  priority
                  className="rounded-lg shadow-lg group-hover:shadow-[0_0_16px_oklch(0.74_0.10_212/0.5)] transition-shadow duration-300"
                />
              </div>
              <div className="flex min-w-0 flex-col leading-none">
                <span className="whitespace-nowrap text-[14px] font-bold tracking-normal text-gradient">
                  {t('星酿启动器', 'AstraBrew Launcher')}
                </span>
                <span className="mt-0.5 whitespace-nowrap text-[9px] font-medium tracking-normal text-muted-foreground">
                  {t('AstraBrew Launcher', '星酿启动器')}
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const href = localizedPath(language, link.href)
                const isActive = pathname === href
                return (
                  <Link
                    key={link.href}
                    href={href}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                    }`}
                  >
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 rounded-lg"
                        style={{
                          background: 'oklch(0.74 0.10 212 / 0.12)',
                          border: '1px solid oklch(0.74 0.10 212 / 0.3)',
                        }}
                      />
                    )}
                    <span className="relative z-10">{t(link.zh, link.en)}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="flex items-center gap-1.5">
              <Button
                isIconOnly
                onPress={toggleTheme}
                size="sm"
                variant="ghost"
                className="min-w-0 size-9 rounded-lg text-muted-foreground hover:text-foreground"
                aria-label={t('切换主题', 'Toggle theme')}
              >
                {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Button>

              <Tooltip delay={250}>
                <Button
                  isIconOnly
                  onPress={toggleGithubProxy}
                  isDisabled={!ready}
                  size="sm"
                  variant="ghost"
                  className={`min-w-0 size-9 rounded-lg transition-colors ${
                    githubProxyEnabled
                      ? 'text-accent hover:bg-accent/10 hover:text-accent'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  aria-label={githubProxyEnabled
                    ? t('关闭 GitHub 国内加速', 'Disable GitHub proxy')
                    : t('开启 GitHub 国内加速', 'Enable GitHub proxy')}
                  aria-pressed={githubProxyEnabled}
                >
                  {githubProxyEnabled ? <Cloud className="size-4" /> : <CloudOff className="size-4" />}
                </Button>
                <Tooltip.Content showArrow placement="bottom">
                  <Tooltip.Arrow />
                  <p>{githubProxyEnabled
                    ? t('GitHub 国内加速已开启', 'GitHub proxy enabled')
                    : t('GitHub 国内加速已关闭', 'GitHub proxy disabled')}</p>
                </Tooltip.Content>
              </Tooltip>

              <Dropdown>
                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  className="min-w-0 size-9 rounded-lg text-muted-foreground hover:text-foreground"
                  aria-label={t('切换语言', 'Change language')}
                >
                  <Languages className="size-4" />
                </Button>
                <Dropdown.Popover className="min-w-40">
                  <Dropdown.Menu
                    aria-label={t('选择语言', 'Select language')}
                    selectedKeys={new Set([language])}
                    selectionMode="single"
                    onAction={selectLanguage}
                  >
                    <Dropdown.Item id="zh" textValue="简体中文">
                      <Dropdown.ItemIndicator />
                      <Label>简体中文</Label>
                    </Dropdown.Item>
                    <Dropdown.Item id="en" textValue="English">
                      <Dropdown.ItemIndicator />
                      <Label>English</Label>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>

              <Link
                href={localizedPath(language, '/download')}
                className={buttonVariants({
                  size: 'sm',
                  className: 'hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-gradient text-white text-sm font-semibold shadow-md hover:shadow-[0_0_20px_oklch(0.73_0.11_212/0.4)] transition-all duration-300 hover:-translate-y-0.5',
                })}
              >
                <Download className="w-4 h-4" />
                {t('立即下载', 'Download')}
              </Link>

              <Button
                isIconOnly
                onPress={() => setMobileOpen((v) => !v)}
                size="sm"
                variant="ghost"
                className="lg:hidden min-w-0 w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5"
                aria-label={t('切换导航菜单', 'Toggle navigation menu')}
                aria-expanded={mobileOpen}
                aria-controls="mobile-navigation"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
          <div
            id="mobile-navigation"
            className="menu-enter fixed top-16 left-0 right-0 z-40 glass-card border-b border-border/50 lg:hidden"
          >
            <nav className="flex flex-col p-4 gap-1">
              {navLinks.map((link) => {
                const href = localizedPath(language, link.href)
                const isActive = pathname === href
                return (
                  <Link
                    key={link.href}
                    href={href}
                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-foreground bg-[oklch(0.74_0.10_212/0.12)] border border-[oklch(0.74_0.10_212/0.3)]'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                    }`}
                  >
                    {t(link.zh, link.en)}
                  </Link>
                )
              })}
              <div className="mt-2 pt-2 border-t border-border/50">
                <Link
                  href={localizedPath(language, '/download')}
                  className={buttonVariants({
                    className: 'flex w-full items-center justify-center gap-2 px-4 py-3 rounded-lg bg-brand-gradient text-white text-sm font-semibold',
                  })}
                >
                  <Download className="w-4 h-4" />
                  {t('立即下载', 'Download now')}
                </Link>
              </div>
            </nav>
          </div>
      )}
    </>
  )
}
