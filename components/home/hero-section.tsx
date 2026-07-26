'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Download, ArrowRight, ChevronDown } from 'lucide-react'
import { Star, MusicNote, Sparkle } from '@phosphor-icons/react'
import { Button, Card, buttonVariants } from '@heroui/react'
import { useReleases } from '@/hooks/use-releases'
import { selectPrimaryAsset } from '@/lib/releases'
import { useSitePreferences } from '@/components/site-preferences'
import { localizedPath } from '@/lib/site-i18n'

type OS = 'windows' | 'mac' | 'unknown'

function detectOS(): OS {
  if (typeof window === 'undefined') return 'unknown'
  const ua = window.navigator.userAgent
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) return 'unknown'
  if (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1) return 'unknown'
  if (ua.includes('Windows')) return 'windows'
  if (ua.includes('Mac OS')) return 'mac'
  return 'unknown'
}

// 浮动粒子（减少数量，合并 keyframe，willChange 确保 GPU 合成）
function FloatingParticle({
  x, y, size, delay, duration, color
}: { x: number; y: number; size: number; delay: number; duration: number; color: string }) {
  return (
    <div
      className="hero-particle absolute rounded-full pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: color, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
    />
  )
}

// 装饰音符
function FloatingNote({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <div
      className="hero-note absolute pointer-events-none text-[oklch(0.74_0.10_212/0.25)]"
      style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${delay}s` }}
    >
      <MusicNote weight="fill" className="w-5 h-5" />
    </div>
  )
}

// 启动器图标装饰
function LauncherOrb() {
  return (
    <div className="relative w-48 h-48 sm:w-64 sm:h-64">
      {/* 外层静态光环（CSS animation，不占 JS 线程） */}
      <div
        className="absolute inset-0 rounded-full pulse-ring"
        style={{ background: 'oklch(0.74 0.10 212 / 0.06)', border: '1px solid oklch(0.74 0.10 212 / 0.18)' }}
      />
      <div
        className="absolute inset-4 rounded-full"
        style={{ background: 'oklch(0.70 0.12 188 / 0.06)', border: '1px solid oklch(0.70 0.12 188 / 0.15)' }}
      />

      {/* 中心核心 — GPU rotate，无 JS 函数 */}
      <div
        className="spin-continuous absolute inset-10 rounded-full bg-brand-gradient shadow-2xl"
        style={{
          boxShadow: '0 0 60px oklch(0.73 0.11 210 / 0.5), 0 0 120px oklch(0.70 0.12 188 / 0.3)',
          animationDuration: '20s',
        }}
      />

      {/* 星形图标 */}
      <div className="absolute inset-10 flex items-center justify-center">
        <Star weight="fill" className="w-14 h-14 sm:w-20 sm:h-20 text-white drop-shadow-lg" />
      </div>

      {/* 轨道小球 — 用旋转包裹层 + 固定偏移，全程 GPU transform，无 transformTemplate */}
      {([
        { angle: 0,   radius: 70,  duration: 6,  color: 'oklch(0.74 0.10 212)' },
        { angle: 120, radius: 85,  duration: 8,  color: 'oklch(0.70 0.12 188)' },
        { angle: 240, radius: 100, duration: 10, color: 'oklch(0.74 0.10 212)' },
      ] as const).map((orbit, i) => (
        <div
          key={i}
          className="spin-continuous absolute inset-0"
          style={{ animationDuration: `${orbit.duration}s`, animationDelay: `${-(orbit.angle / 60)}s` }}
        >
          <div
            className="absolute w-2.5 h-2.5 rounded-full top-1/2 -mt-[5px]"
            style={{
              background: orbit.color,
              left: `calc(50% + ${orbit.radius}px)`,
              boxShadow: `0 0 6px ${orbit.color}`,
            }}
          />
        </div>
      ))}
    </div>
  )
}

export default function HeroSection() {
  const [os, setOs] = useState<OS>('unknown')
  const { ready, language, t, githubProxyEnabled } = useSitePreferences()
  const { data, error, isLoading } = useReleases({
    enabled: ready && os !== 'unknown',
    proxyEnabled: githubProxyEnabled,
  })

  useEffect(() => {
    setOs(detectOS())
  }, [])

  const platformLabel = os === 'mac' ? 'macOS' : 'Windows'
  const latestRelease = os === 'unknown' ? null : data?.latest[os]
  const primaryAsset = os === 'unknown' ? null : selectPrimaryAsset(latestRelease, os)
  const latestVersionLabel = latestRelease?.version ?? t('最新正式版', 'Latest stable release')

  // 减少并发动画数量以降低 JS 主线程压力
  const particles = [
    { x: 8,  y: 22, size: 3, delay: 0,   duration: 4.5, color: 'oklch(0.74 0.10 212 / 0.55)' },
    { x: 88, y: 18, size: 4, delay: 0.8, duration: 3.8, color: 'oklch(0.74 0.10 212 / 0.45)' },
    { x: 90, y: 68, size: 2, delay: 1.6, duration: 5.0, color: 'oklch(0.70 0.12 188 / 0.55)' },
    { x: 18, y: 75, size: 3, delay: 2.4, duration: 4.2, color: 'oklch(0.70 0.12 188 / 0.45)' },
    { x: 52, y: 6,  size: 2, delay: 3.2, duration: 4.8, color: 'oklch(0.74 0.10 212 / 0.4)' },
  ]

  const notes = [
    { x: 12, y: 32, delay: 0 },
    { x: 78, y: 28, delay: 2 },
    { x: 28, y: 72, delay: 4 },
  ]

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">

      {/* 背景效果 */}
      <div className="absolute inset-0 starfield opacity-60" />
      <div className="absolute inset-0 bg-section-gradient" />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, oklch(0.73 0.11 210 / 0.4) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-[500px] h-[400px] rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, oklch(0.70 0.12 188 / 0.4) 0%, transparent 70%)' }}
      />

      {/* 粒子 */}
      {particles.map((p, i) => <FloatingParticle key={i} {...p} />)}
      {notes.map((n, i) => <FloatingNote key={i} {...n} />)}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">

          {/* 左侧文字区 */}
          <div className="flex-1 text-center lg:text-left max-w-2xl">

            {/* 徽章 */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
              style={{
                background: 'oklch(0.74 0.10 212 / 0.1)',
                border: '1px solid oklch(0.74 0.10 212 / 0.3)',
              }}
            >
              <Sparkle weight="fill" className="w-3.5 h-3.5 text-[oklch(0.74_0.10_212)]" />
              <span className="text-xs font-medium text-[var(--brand-blue-text)]">
                {t(`${latestVersionLabel} 现已发布`, `${latestVersionLabel} is available`)}
              </span>
              <ArrowRight className="w-3 h-3 text-[oklch(0.74_0.10_212)]" />
            </div>

            {/* 主标题 */}
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-4 text-balance"
            >
              <span className="text-gradient">{t('星酿', 'AstraBrew')}</span>
              <br />
              <span className="text-foreground">{t('启动器', 'Launcher')}</span>
            </h1>

            {/* 副标题 */}
            <p
              className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8 text-pretty max-w-lg mx-auto lg:mx-0"
            >
              {t('专为新手打造的 SillyTavern 一站式启动与管理工具。', 'A beginner-friendly launcher and manager for SillyTavern.')}
              <br className="hidden sm:block" />
              {t(
                '简化环境配置、实例管理与版本更新，让酒馆开箱即用。',
                'Set up environments, manage instances, and update versions without the usual complexity.',
              )}
            </p>

            {/* CTA 按钮组 */}
            <div
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              {os === 'unknown' ? (
                <Link
                  href={localizedPath(language, '/download')}
                  className={buttonVariants({
                    size: 'lg',
                    className: 'flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-brand-gradient text-white font-semibold text-sm shadow-lg hover:shadow-[0_0_30px_oklch(0.73_0.11_212/0.5)] transition-all duration-300 hover:-translate-y-1',
                  })}
                >
                  <ArrowRight className="w-4 h-4" />
                  {t('前往下载', 'Go to downloads')}
                </Link>
              ) : !data && (isLoading || !error) ? (
                <Button
                  isDisabled
                  isPending
                  size="lg"
                  className="px-6 py-3.5 rounded-xl bg-brand-gradient text-white font-semibold text-sm"
                >
                  {t(`正在获取 ${platformLabel} 最新版`, `Loading the latest ${platformLabel} release`)}
                </Button>
              ) : primaryAsset ? (
                <a
                  href={primaryAsset.downloadUrl}
                  download
                  className={buttonVariants({
                    size: 'lg',
                    className: 'group relative flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-brand-gradient text-white font-semibold text-sm shadow-lg hover:shadow-[0_0_30px_oklch(0.73_0.11_212/0.5)] transition-all duration-300 hover:-translate-y-1',
                  })}
                >
                  <Download className="w-4 h-4" />
                  {t(`下载 ${platformLabel} 最新版`, `Download latest for ${platformLabel}`)}
                  <span className="max-w-28 truncate text-white/70 text-xs font-normal ml-1">
                    {latestRelease?.version}
                  </span>
                </a>
              ) : (
                <Link
                  href={localizedPath(language, '/download')}
                  className={buttonVariants({
                    size: 'lg',
                    className: 'flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-brand-gradient text-white font-semibold text-sm shadow-lg hover:shadow-[0_0_30px_oklch(0.73_0.11_212/0.5)] transition-all duration-300 hover:-translate-y-1',
                  })}
                >
                  <ArrowRight className="w-4 h-4" />
                  {t(`前往 ${platformLabel} 下载`, `View ${platformLabel} downloads`)}
                </Link>
              )}
              <Link
                  href={localizedPath(language, '/guide')}
                className={buttonVariants({
                  size: 'lg',
                  variant: 'outline',
                  className: 'flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-medium text-foreground transition-all duration-200 hover:-translate-y-0.5',
                })}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                {t('查看使用说明', 'Read the guide')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* 版本信息 */}
            <p
              className="mt-5 text-xs text-muted-foreground"
            >
              {latestRelease?.version ?? t('持续更新', 'Continuously updated')} · {t('支持', 'Supports')} Windows 10+ / macOS 12+
              {os !== 'unknown' && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{ background: 'oklch(0.74 0.10 212 / 0.15)', color: 'var(--brand-blue-text)' }}>
                  {t('已检测到', 'Detected')} {os === 'mac' ? 'macOS' : 'Windows'}
                </span>
              )}
            </p>
          </div>

          {/* 右侧装饰 */}
          <div className="flex-shrink-0 float-animation">
            <LauncherOrb />
          </div>
        </div>

        {/* 统计数据条 */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { value: 'Rust', label: t('高性能核心', 'Performance core') },
            { value: 'egui', label: t('原生响应界面', 'Native responsive UI') },
            { value: '2', label: t('支持平台', 'Platforms') },
            { value: 'MIT', label: t('开源许可', 'Open-source license') },
          ].map((stat) => (
            <Card
              key={stat.label}
              variant="transparent"
              className="glass-card rounded-xl p-0 text-center"
            >
              <Card.Content className="p-4">
                <div className="text-2xl font-black text-gradient mb-1">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </Card.Content>
            </Card>
          ))}
        </div>
      </div>

      {/* 滚动指示器 */}
      <div className="scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-xs text-muted-foreground">{t('向下滚动', 'Scroll down')}</span>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </div>
    </section>
  )
}
