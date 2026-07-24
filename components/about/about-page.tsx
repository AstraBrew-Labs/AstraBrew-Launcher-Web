'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, RefreshCw, UsersRound } from 'lucide-react'
import { Alert, Avatar, Button, Chip, Modal, Skeleton } from '@heroui/react'
import {
  Star, Heart, Wrench,
  GithubLogo, Chat, ArrowSquareOut, CoffeeBean,
  Sparkle
} from '@phosphor-icons/react'
import { useSitePreferences } from '@/components/site-preferences'
import { useContributors } from '@/hooks/use-contributors'
import type { ContributorInfo } from '@/lib/contributors'

// ---- 数据 ----
const milestones = [
  { year: '项目起源', event: '项目原为“酒馆启动器 GUI”，目标是让新手也能轻松使用 SillyTavern', eventEn: 'The project began as SillyTavern Launcher GUI, focused on making SillyTavern approachable for beginners.' },
  { year: 'Rust + egui', event: '使用 Rust 和 egui 构建轻量、快速、实时响应的原生桌面体验', eventEn: 'Rust and egui provide a lightweight, fast, and responsive native desktop experience.' },
  { year: 'Windows', event: 'Windows 版本提供环境配置、一键启动、版本管理和免安装版本', eventEn: 'The Windows edition provides environment setup, one-click launch, version management, and a portable build.' },
  { year: 'macOS', event: 'macOS 版本提供原生安装体验与酒馆实例管理能力', eventEn: 'The macOS edition provides native installation and SillyTavern instance management.' },
  { year: '持续迭代', event: '围绕实例、扩展、资源和环境管理持续完善跨平台体验', eventEn: 'The project continues to improve instance, extension, resource, and environment management across platforms.' },
]

const communities = [
  {
    icon: Chat,
    platform: '星酿启动器交流群',
    platformEn: 'QQ SillyTavern Group',
    id: '1091959450',
    href: 'https://qm.qq.com/q/9Iduf52Vj4',
    action: '加入群聊',
    actionEn: 'Join group',
    color: 'oklch(0.74 0.10 212)',
  },
  {
    icon: GithubLogo,
    platform: 'AstraBrew-Labs（星酿工坊）',
    platformEn: 'AstraBrew-Labs',
    id: 'github.com/AstraBrew-Labs',
    href: 'https://github.com/AstraBrew-Labs',
    action: '访问主页',
    actionEn: 'Visit profile',
    color: 'oklch(0.70 0.12 188)',
  },
]

const sponsors = {
  platinum: [
    { name: 'SillyTavern', avatar: 'S', amount: '上游项目', amountEn: 'Upstream project' },
    { name: 'Rust', avatar: 'R', amount: '核心语言', amountEn: 'Core language' },
  ],
  gold: [
    { name: 'egui', avatar: 'e' },
    { name: 'eframe', avatar: 'E' },
    { name: 'Serde', avatar: 'S' },
    { name: 'reqwest', avatar: 'r' },
  ],
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
}

type Translate = (zh: string, en: string) => string

function ContributorCard({
  contributor,
  index,
  language,
  t,
}: {
  contributor: ContributorInfo
  index: number
  language: 'zh' | 'en'
  t: Translate
}) {
  return (
    <motion.a
      href={contributor.profileUrl}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index, 8) * 0.06 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="group glass-card flex min-h-40 flex-col rounded-2xl p-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      aria-label={t(`访问 ${contributor.login} 的 GitHub 主页`, `Visit ${contributor.login} on GitHub`)}
    >
      <div className="flex items-center gap-4">
        <Avatar className="size-14 shrink-0 ring-1 ring-border">
          <Avatar.Image
            src={contributor.avatarUrl}
            alt={contributor.login}
            loading="lazy"
          />
          <Avatar.Fallback>{contributor.login.slice(0, 2).toUpperCase()}</Avatar.Fallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-bold text-base text-foreground">{contributor.login}</h3>
            <ExternalLink className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {language === 'zh'
              ? `共 ${contributor.totalContributions} 次贡献`
              : `${contributor.totalContributions} contribution${contributor.totalContributions === 1 ? '' : 's'}`}
          </p>
        </div>
      </div>
      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        {contributor.platforms.map((platform) => (
          <Chip
            key={platform}
            size="sm"
            variant="soft"
            color={platform === 'windows' ? 'accent' : 'success'}
          >
            {platform === 'windows' ? 'Windows' : 'macOS'} · {contributor.contributions[platform]}
          </Chip>
        ))}
      </div>
    </motion.a>
  )
}

function contributorGridClass(itemCount: number): string {
  if (itemCount === 1) return 'mx-auto max-w-sm'
  if (itemCount === 2) return 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mx-auto lg:max-w-2xl'
  if (itemCount === 3) return 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'
  return 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'
}

export default function AboutPage() {
  const [contributorsModalOpen, setContributorsModalOpen] = useState(false)
  const { language, ready, t, githubProxyEnabled } = useSitePreferences()
  const {
    data: contributorData,
    error: contributorError,
    isLoading: contributorsLoading,
    isRefreshing: contributorsRefreshing,
    isUsingFallback: contributorsUsingFallback,
    reload: reloadContributors,
  } = useContributors({ enabled: ready, proxyEnabled: githubProxyEnabled })

  const contributors = contributorData?.contributors ?? []
  const hasMoreContributors = contributors.length > 4
  const visibleContributors = hasMoreContributors ? contributors.slice(0, 3) : contributors
  const visibleContributorItems = visibleContributors.length + (hasMoreContributors ? 1 : 0)
  const contributorErrorDescription = contributorError
    ? language === 'zh'
      ? contributorError
      : 'The contributor API request failed or the network is unavailable. Please try again.'
    : null

  return (
    <div className="min-h-screen pt-16 pb-24">

      {/* ── Hero ── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-section-gradient" />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, oklch(0.73 0.11 210 / 0.5), transparent 70%)' }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-medium"
              style={{ background: 'oklch(0.74 0.10 212 / 0.1)', border: '1px solid oklch(0.74 0.10 212 / 0.3)', color: 'var(--brand-blue-text)' }}
            >
              <Sparkle weight="fill" className="w-3.5 h-3.5" />
              {t('关于星酿', 'About AstraBrew')}
            </div>
            <h1 className="text-5xl sm:text-6xl font-black mb-6 text-balance">
              {language === 'zh' ? (
                <>让<span className="text-gradient">酒馆安装</span><br />简单一点</>
              ) : (
                <><span className="text-gradient">SillyTavern</span>,<br />made simpler</>
              )}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto text-pretty">
              {t(
                '星酿启动器原为“酒馆启动器 GUI”，是一款面向新手的 SillyTavern 启动与管理工具。它基于 Rust 和 egui 构建，把环境配置、实例管理、版本更新与一键启动集中到清晰易用的桌面界面中。',
                'Originally known as SillyTavern Launcher GUI, AstraBrew is a beginner-friendly launcher and manager built with Rust and egui. It brings environment setup, instance management, updates, and one-click launch into a clear desktop interface.',
              )}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">

        {/* ── 产品理念 ── */}
        <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: Wrench,
                title: '新手友好',
                titleEn: 'Beginner Friendly',
                desc: '把依赖安装、环境选择和实例配置整理成更容易理解的操作流程。',
                descEn: 'Turn dependency setup, environment selection, and instance configuration into understandable workflows.',
                color: 'oklch(0.74 0.10 212)',
              },
              {
                icon: Star,
                title: '轻快原生',
                titleEn: 'Native and Lightweight',
                desc: '基于 Rust 与 egui，兼顾快速响应、稳定性能和较低资源占用。',
                descEn: 'Built with Rust and egui for responsive interactions, stable performance, and low resource usage.',
                color: 'oklch(0.70 0.12 188)',
              },
              {
                icon: Heart,
                title: '社区共建',
                titleEn: 'Community Built',
                desc: '完全开源，拥抱社区的每一份贡献。你的每一个建议，都有机会成为下一版功能。',
                descEn: 'Open source and shaped by contributions, with community ideas guiding future releases.',
                color: 'oklch(0.74 0.10 212)',
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="glass-card rounded-2xl p-6"
                  style={{ border: `1px solid ${item.color.replace(')', ' / 0.25)')}` }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${item.color.replace(')', ' / 0.12)')}` }}
                  >
                    <Icon weight="fill" className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <h3 className="font-bold text-base text-foreground mb-2">{t(item.title, item.titleEn)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(item.desc, item.descEn)}</p>
                </div>
              )
            })}
          </div>
        </motion.section>

        {/* ── 发展历程 ── */}
        <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black mb-2 text-balance">{t('发展', 'Our ')}<span className="text-gradient">{t('历程', 'Journey')}</span></h2>
            <p className="text-muted-foreground text-sm">{t('从酒馆启动器 GUI 到跨平台原生应用', 'From SillyTavern Launcher GUI to native cross-platform editions')}</p>
          </div>
          <div className="relative">
            {/* 时间线竖线 */}
            <div
              className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-px"
              style={{ background: 'linear-gradient(to bottom, transparent, oklch(0.74 0.10 212 / 0.4), oklch(0.70 0.12 188 / 0.4), transparent)' }}
            />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <motion.div
                  key={m.year}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`flex gap-6 md:gap-0 items-start md:items-center ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  {/* 内容 */}
                  <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right md:pr-10' : 'md:text-left md:pl-10'} pl-16 md:pl-0`}>
                    <div
                      className="inline-block glass-card rounded-xl px-4 py-3"
                      style={{ border: '1px solid oklch(0.30 0.04 218 / 0.45)' }}
                    >
                      <div
                        className="text-[10px] font-bold font-mono mb-1"
                        style={{ color: i % 2 === 0 ? 'oklch(0.80 0.09 212)' : 'oklch(0.76 0.11 188)' }}
                      >
                        {m.year}
                      </div>
                      <p className="text-sm text-foreground">{t(m.event, m.eventEn)}</p>
                    </div>
                  </div>

                  {/* 圆点 */}
                  <div
                    className="absolute left-5 md:left-1/2 md:-translate-x-1/2 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{
                      background: i % 2 === 0 ? 'oklch(0.74 0.10 212)' : 'oklch(0.70 0.12 188)',
                      boxShadow: `0 0 12px ${i % 2 === 0 ? 'oklch(0.74 0.10 212 / 0.5)' : 'oklch(0.70 0.12 188 / 0.5)'}`,
                    }}
                  >
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>

                  {/* 占位 */}
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── 项目贡献者 ── */}
        <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black mb-2 text-balance">{t('项目', 'Project ')}<span className="text-gradient">{t('贡献者', 'Contributors')}</span></h2>
            <p className="text-muted-foreground text-sm">{t('感谢每一位为 Windows 和 macOS 版本作出贡献的开发者', 'Thanks to everyone contributing to the Windows and macOS editions')}</p>
          </div>

          {contributorData && contributorError && contributorsUsingFallback && (
            <Alert status="warning" className="glass-card rounded-xl mb-5">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>{t('正在显示缓存的贡献者数据', 'Showing cached contributor data')}</Alert.Title>
                <Alert.Description>{contributorErrorDescription}</Alert.Description>
              </Alert.Content>
              <Button onPress={reloadContributors} size="sm" variant="outline">
                <RefreshCw className="size-4" />
                {t('重新加载', 'Reload')}
              </Button>
            </Alert>
          )}

          {!ready || contributorsLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-label={t('正在加载贡献者', 'Loading contributors')}>
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="glass-card rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="size-14 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-5 w-28 rounded" />
                      <Skeleton className="h-3 w-36 rounded" />
                    </div>
                  </div>
                  <div className="mt-5 flex gap-2">
                    <Skeleton className="h-7 w-28 rounded-full" />
                    <Skeleton className="h-7 w-24 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : contributorError && !contributorData ? (
            <Alert status="danger" className="glass-card rounded-xl">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>{t('无法加载贡献者', 'Unable to load contributors')}</Alert.Title>
                <Alert.Description>{contributorErrorDescription}</Alert.Description>
              </Alert.Content>
              <Button onPress={reloadContributors} size="sm" variant="outline">
                <RefreshCw className="size-4" />
                {t('重新加载', 'Reload')}
              </Button>
            </Alert>
          ) : contributors.length ? (
            <div
              className={contributorGridClass(visibleContributorItems)}
              aria-busy={contributorsRefreshing}
            >
              {visibleContributors.map((contributor, index) => (
                <ContributorCard
                  key={contributor.id}
                  contributor={contributor}
                  index={index}
                  language={language}
                  t={t}
                />
              ))}
              {hasMoreContributors && (
                <Button
                  onPress={() => setContributorsModalOpen(true)}
                  variant="ghost"
                  className="group glass-card flex h-full min-h-40 w-full flex-col gap-3 rounded-2xl border border-border/60 p-6 text-center hover:border-accent/50 hover:bg-accent/5"
                  aria-label={t('查看所有贡献者', 'View all contributors')}
                >
                  <span className="flex size-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-transform group-hover:scale-105">
                    <UsersRound className="size-6" />
                  </span>
                  <span className="font-semibold text-foreground">{t('查看所有贡献者', 'View all contributors')}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {t(`共 ${contributors.length} 位`, `${contributors.length} contributors`)}
                  </span>
                </Button>
              )}
            </div>
          ) : (
            <Alert status="warning" className="glass-card rounded-xl">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>{t('暂无贡献者数据', 'No contributor data')}</Alert.Title>
                <Alert.Description>{t('请稍后重新加载贡献者列表。', 'Reload the contributor list later.')}</Alert.Description>
              </Alert.Content>
              <Button onPress={reloadContributors} size="sm" variant="outline">
                <RefreshCw className="size-4" />
                {t('重新加载', 'Reload')}
              </Button>
            </Alert>
          )}
        </motion.section>

        <Modal.Backdrop
          isOpen={contributorsModalOpen}
          onOpenChange={setContributorsModalOpen}
          variant="blur"
        >
          <Modal.Container size="cover" placement="center">
            <Modal.Dialog>
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Icon className="bg-accent-soft text-accent-soft-foreground">
                  <UsersRound className="size-5" />
                </Modal.Icon>
                <Modal.Heading>{t('所有项目贡献者', 'All Project Contributors')}</Modal.Heading>
                <p className="text-sm text-muted-foreground">
                  {t(`共 ${contributors.length} 位贡献者`, `${contributors.length} contributors in total`)}
                </p>
              </Modal.Header>
              <Modal.Body className="max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  {contributors.map((contributor, index) => (
                    <ContributorCard
                      key={contributor.id}
                      contributor={contributor}
                      index={index}
                      language={language}
                      t={t}
                    />
                  ))}
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button slot="close" variant="secondary">
                  {t('关闭', 'Close')}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>

        {/* ── 社群 ── */}
        <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black mb-2 text-balance">{t('加入', 'Join the ')}<span className="text-gradient">{t('社群', 'Community')}</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {communities.map((c) => {
              const Icon = c.icon
              return (
                <a
                  key={c.platform}
                  href={c.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group glass-card rounded-2xl p-5 flex flex-col items-center text-center gap-3 hover:border-[oklch(0.74_0.10_212/0.5)] transition-all duration-200 hover:-translate-y-1"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${c.color.replace(')', ' / 0.12)')}`, border: `1px solid ${c.color.replace(')', ' / 0.25)')}` }}
                  >
                    <Icon weight="fill" className="w-6 h-6" style={{ color: c.color }} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{t(c.platform, c.platformEn)}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">{c.id}</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium mt-auto" style={{ color: c.color }}>
                    {t(c.action, c.actionEn)}
                    <ArrowSquareOut weight="bold" className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </a>
              )
            })}
          </div>
        </motion.section>

        {/* ── 赞助商 ── */}
        <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black mb-2 text-balance"><span className="text-gradient">{t('开源项目', 'Open Source')}</span>{t('致谢', ' Acknowledgements')}</h2>
            <p className="text-muted-foreground text-sm">{t('感谢 SillyTavern 与构成启动器技术基础的开源生态', 'Thanks to SillyTavern and the open-source ecosystem behind AstraBrew')}</p>
          </div>

          {/* 铂金 */}
          <div className="mb-6">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">{t('核心项目', 'Core Projects')}</p>
            <div className="flex flex-wrap justify-center gap-4">
              {sponsors.platinum.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center gap-3 px-6 py-3.5 rounded-xl glass-card"
                  style={{ border: '1px solid oklch(0.74 0.10 212 / 0.4)' }}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm text-white bg-brand-gradient">
                    {s.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{s.name}</div>
                    <div className="text-[10px] text-[oklch(0.74_0.10_212)]">{t(s.amount, s.amountEn)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 黄金 */}
          <div className="mb-10">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">{t('重要依赖', 'Key Dependencies')}</p>
            <div className="flex flex-wrap justify-center gap-3">
              {sponsors.gold.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card"
                  style={{ border: '1px solid oklch(0.70 0.12 188 / 0.3)' }}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ background: 'oklch(0.70 0.12 188 / 0.7)' }}>
                    {s.avatar}
                  </div>
                  <span className="text-sm font-medium text-foreground">{s.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <div
              className="inline-flex flex-col items-center gap-4 px-8 py-6 rounded-2xl glass-card"
              style={{ border: '1px solid oklch(0.74 0.10 212 / 0.25)' }}
            >
              <p className="text-sm text-muted-foreground">
                {t('你的赞助将直接支持启动器的持续开发与服务器运维', 'Your sponsorship directly supports continued development and infrastructure.')}
              </p>
              <a
                href="#"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-gradient text-white text-sm font-semibold shadow-md hover:shadow-[0_0_20px_oklch(0.73_0.11_212/0.4)] transition-all duration-300 hover:-translate-y-0.5"
              >
                <CoffeeBean weight="fill" className="w-4 h-4" />
                {t('赞助我们', 'Sponsor us')}
              </a>
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  )
}
