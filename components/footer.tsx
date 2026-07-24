'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, GithubLogo } from '@phosphor-icons/react'
import { useSitePreferences } from '@/components/site-preferences'
import { localizedPath } from '@/lib/site-i18n'

export default function Footer() {
  const { language, t } = useSitePreferences()
  const footerLinks: Record<string, { label: string; href: string }[]> = language === 'zh'
    ? {
        产品: [
          { label: '主页', href: '/' },
          { label: '下载', href: '/download' },
          { label: '使用说明', href: '/guide' },
          { label: '关于', href: '/about' },
        ],
        社区: [
          { label: 'QQ 交流群', href: 'https://qm.qq.com/q/9Iduf52Vj4' },
          { label: '星酿工坊 GitHub', href: 'https://github.com/AstraBrew-Labs' },
        ],
        支持: [
          { label: '问题反馈', href: '#' },
          { label: '功能建议', href: '#' },
          { label: '赞助我们', href: '#' },
        ],
      }
    : {
        Product: [
          { label: 'Home', href: '/' },
          { label: 'Download', href: '/download' },
          { label: 'Guide', href: '/guide' },
          { label: 'About', href: '/about' },
        ],
        Community: [
          { label: 'QQ Group', href: 'https://qm.qq.com/q/9Iduf52Vj4' },
          { label: 'AstraBrew-Labs', href: 'https://github.com/AstraBrew-Labs' },
        ],
        Support: [
          { label: 'Report an issue', href: '#' },
          { label: 'Suggest a feature', href: '#' },
          { label: 'Sponsor us', href: '#' },
        ],
      }

  return (
    <footer className="relative border-t border-border/40 bg-background">

      {/* 顶部渐变分隔线 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[oklch(0.74_0.10_212/0.5)] to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href={localizedPath(language, '/')} className="flex items-center gap-2.5 group mb-4">
              <Image
                src="/images/logo.png"
                alt={t('星酿启动器 Logo', 'AstraBrew Launcher logo')}
                width={32}
                height={32}
                className="rounded-lg shadow-lg"
              />
              <span className="flex flex-col leading-tight">
                <span className="font-bold text-base text-gradient">{t('星酿启动器', 'AstraBrew Launcher')}</span>
                <span className="text-[10px] font-medium tracking-normal text-muted-foreground">
                  {t('AstraBrew Launcher', '星酿启动器')}
                </span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-xs">
              {t(
                '面向新手的 SillyTavern 一站式启动与管理工具，让安装、配置和更新更简单。',
                'A beginner-friendly SillyTavern launcher that simplifies setup, management, and updates.',
              )}
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/AstraBrew-Labs"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-card border border-border hover:border-[oklch(0.74_0.10_212/0.5)] text-muted-foreground hover:text-foreground transition-all duration-200"
                aria-label="GitHub"
              >
                <GithubLogo weight="fill" className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-foreground mb-3">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href.startsWith('/') ? localizedPath(language, link.href) : link.href}
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()}{' '}
            <a
              href="https://github.com/AstraBrew-Labs"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline-offset-4 transition-colors hover:text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {t('星酿工坊', 'AstraBrew-Labs')}
            </a>
            {t('。保留所有权利。', '. All rights reserved.')}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            {t('用', 'Built with')}
            <Heart weight="fill" className="w-3 h-3 text-[oklch(0.70_0.12_188)]" />
            {t('为酒馆用户打造', 'for SillyTavern users')}
          </p>
        </div>
      </div>
    </footer>
  )
}
