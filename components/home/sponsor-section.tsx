'use client'

import { Heart as HeartP, CoffeeBean } from '@phosphor-icons/react'
import { useSitePreferences } from '@/components/site-preferences'

const sponsors = {
  platinum: [
    { name: 'SillyTavern', avatar: 'S', desc: '上游项目', descEn: 'Upstream project' },
    { name: 'Rust', avatar: 'R', desc: '核心语言', descEn: 'Core language' },
  ],
  gold: [
    { name: 'egui', avatar: 'e' },
    { name: 'eframe', avatar: 'E' },
    { name: 'Serde', avatar: 'S' },
    { name: 'reqwest', avatar: 'r' },
  ],
  individual: [
    'Node.js', 'Git', 'cargo-packager', 'Phosphor Icons', 'Serde JSON',
    'Serde YAML', 'jwalk', 'zip', 'qrcode', 'rfd',
  ],
}

export default function SponsorSection() {
  const { t } = useSitePreferences()

  return (
    <section className="defer-render relative py-24 overflow-hidden">

      {/* 顶部分隔线 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, oklch(0.74 0.10 212 / 0.4), oklch(0.70 0.12 188 / 0.4), transparent)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 标题 */}
        <div className="text-center mb-14">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-medium"
            style={{
              background: 'oklch(0.70 0.12 188 / 0.1)',
              border: '1px solid oklch(0.70 0.12 188 / 0.3)',
              color: 'var(--brand-green-text)',
            }}
          >
            <HeartP weight="fill" className="w-3 h-3" />
            {t('开源致谢', 'Open Source')}
          </div>
          <h2 className="text-3xl font-black mb-3 text-balance">
            <span className="text-gradient">{t('站在开源项目', 'Built on open source')}</span>{t('的肩膀上', '')}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-pretty">
            {t(
              '感谢 SillyTavern 以及构成星酿启动器技术基础的每一个开源项目。',
              'Thanks to SillyTavern and every open-source project that makes AstraBrew Launcher possible.',
            )}
          </p>
        </div>

        {/* 铂金赞助商 */}
        <div className="mb-8">
          <div className="text-center mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('核心项目', 'Core Projects')}</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {sponsors.platinum.map((s) => (
              <div
                key={s.name}
                className="flex items-center gap-3 px-6 py-3 rounded-xl glass-card"
                style={{ border: '1px solid oklch(0.74 0.10 212 / 0.4)' }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm text-white"
                  style={{ background: 'linear-gradient(135deg, oklch(0.73 0.11 210), oklch(0.69 0.13 185))' }}
                >
                  {s.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{s.name}</div>
                  <div className="text-[10px] text-[oklch(0.74_0.10_212)]">{t(s.desc, s.descEn)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 黄金赞助商 */}
        <div className="mb-8">
          <div className="text-center mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('重要依赖', 'Key Dependencies')}</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {sponsors.gold.map((s) => (
              <div
                key={s.name}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl glass-card"
                style={{ border: '1px solid oklch(0.70 0.12 188 / 0.3)' }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                  style={{ background: 'oklch(0.70 0.12 188 / 0.7)' }}
                >
                  {s.avatar}
                </div>
                <span className="text-sm font-medium text-foreground">{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 个人赞助者 */}
        <div className="mb-10">
          <div className="text-center mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('工具与生态', 'Tools and Ecosystem')}</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {sponsors.individual.map((name) => (
              <span
                key={name}
                className="px-3 py-1 rounded-full text-xs text-muted-foreground"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                {name}
              </span>
            ))}
            <span
              className="px-3 py-1 rounded-full text-xs text-muted-foreground"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              {t('以及更多...', 'And more...')}
            </span>
          </div>
        </div>

        {/* 赞助 CTA */}
        <div className="text-center">
          <div
            className="inline-flex flex-col items-center gap-4 px-8 py-6 rounded-2xl glass-card"
            style={{ border: '1px solid oklch(0.74 0.10 212 / 0.25)' }}
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CoffeeBean weight="fill" className="w-4 h-4 text-[oklch(0.74_0.10_212)]" />
              {t('买杯咖啡，支持开发团队继续前行', 'Buy the team a coffee and support continued development')}
            </div>
            <a
              href="#"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-gradient text-white text-sm font-semibold shadow-md hover:shadow-[0_0_20px_oklch(0.73_0.11_212/0.4)] transition-all duration-300 hover:-translate-y-0.5"
            >
              <HeartP weight="fill" className="w-4 h-4" />
              {t('赞助星酿启动器', 'Sponsor AstraBrew')}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
