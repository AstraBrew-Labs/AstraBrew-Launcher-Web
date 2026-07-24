'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, CircleHelp, RefreshCw } from 'lucide-react'
import { Accordion, Alert, Button, Skeleton, Tabs } from '@heroui/react'
import {
  AppleLogo,
  CheckCircle,
  Clock,
  DeviceMobile,
  DownloadSimple,
  FileZip,
  Monitor,
  WindowsLogo,
} from '@phosphor-icons/react'
import { useReleases } from '@/hooks/use-releases'
import { HelpContent, HelpTip } from '@/components/help-content'
import { useSitePreferences } from '@/components/site-preferences'
import { getInstallationFaqItems } from '@/lib/installation-faq'
import {
  describeReleaseAsset,
  formatFileSize,
  formatReleaseDate,
  getDownloadAssets,
  type ReleaseInfo,
  type ReleasePlatform,
} from '@/lib/releases'

const platforms = [
  {
    os: 'windows' as const,
    label: 'Windows',
    icon: WindowsLogo,
    requirement: 'Windows 10 或更高版本 (64-bit)',
    requirementEn: 'Windows 10 or later (64-bit)',
  },
  {
    os: 'mac' as const,
    label: 'macOS',
    icon: AppleLogo,
    requirement: 'macOS 12 Monterey 或更高版本',
    requirementEn: 'macOS 12 Monterey or later',
  },
]

type TabType = 'latest' | 'all'

function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Mobile/i.test(window.navigator.userAgent)
}

function ReleaseLoading() {
  const { t } = useSitePreferences()

  return (
    <div className="space-y-5" aria-label={t('正在加载发布信息', 'Loading release information')}>
      <div className="glass-card rounded-2xl p-6 space-y-5">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32 rounded-lg" />
          <Skeleton className="h-3 w-44 rounded" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-full rounded" />
          ))}
        </div>
      </div>
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="glass-card flex items-center gap-4 rounded-xl px-5 py-4">
          <Skeleton className="size-9 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/5 rounded" />
            <Skeleton className="h-3 w-2/5 rounded" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  )
}

function ReleaseError({
  message,
  isRefreshing,
  onReload,
}: {
  message: string
  isRefreshing: boolean
  onReload: () => void
}) {
  const { t } = useSitePreferences()

  return (
    <Alert status="danger" className="glass-card rounded-xl">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{t('无法获取发布信息', 'Unable to load releases')}</Alert.Title>
        <Alert.Description>{message}</Alert.Description>
      </Alert.Content>
      <Button
        isPending={isRefreshing}
        onPress={onReload}
        size="sm"
        variant="danger"
      >
        <RefreshCw className="size-4" />
        {t('重新加载', 'Reload')}
      </Button>
    </Alert>
  )
}

function LatestReleaseSection({
  release,
  platform,
  platformLabel,
  requirement,
  type,
  onReload,
}: {
  release: ReleaseInfo | null
  platform: ReleasePlatform
  platformLabel: string
  requirement: string
  type: 'formal' | 'beta'
  onReload: () => void
}) {
  const { language, t } = useSitePreferences()
  const isBeta = type === 'beta'
  const typeLabel = isBeta ? t('测试版', 'Beta') : t('正式版', 'Stable')
  const assets = getDownloadAssets(release, platform)

  return (
    <motion.section
      key={`${type}-${platform}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <h2 className="text-lg font-bold text-foreground">{t(`最新${typeLabel}`, `Latest ${typeLabel}`)}</h2>

      {release ? (
        <>
          <div
            className="glass-card rounded-2xl p-6"
            style={{
              border: isBeta
                ? '1px solid oklch(0.74 0.10 212 / 0.3)'
                : '1px solid oklch(0.70 0.12 188 / 0.3)',
            }}
          >
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="mb-1 flex items-center gap-3">
                  <span className="text-2xl font-black text-gradient">{release.version}</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                    style={isBeta
                      ? {
                          background: 'oklch(0.74 0.10 212 / 0.12)',
                          color: 'var(--brand-blue-text)',
                          border: '1px solid oklch(0.74 0.10 212 / 0.25)',
                        }
                      : {
                          background: 'oklch(0.70 0.12 188 / 0.15)',
                          color: 'var(--brand-green-text)',
                          border: '1px solid oklch(0.70 0.12 188 / 0.3)',
                        }}
                  >
                    {typeLabel}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock weight="fill" className="size-3.5" />
                  {t('发布于', 'Released')} {formatReleaseDate(release.publishedAt, language === 'zh' ? 'zh-CN' : 'en-US')}
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('更新亮点', 'Highlights')}</h3>
              <ul className="space-y-2">
                {release.notes.map((item, index) => (
                  <li key={`${item}-${index}`} className="flex items-start gap-2.5 text-sm text-foreground">
                    <CheckCircle weight="fill" className="mt-0.5 size-4 shrink-0 text-[oklch(0.70_0.12_188)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">{t('系统要求', 'System requirements')}: {requirement}</p>
            {assets.length ? assets.map((asset) => (
              <a
                key={asset.id}
                href={asset.downloadUrl}
                download
                className="group flex items-center justify-between gap-4 glass-card rounded-xl px-5 py-4 hover:border-[oklch(0.74_0.10_212/0.5)] transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: 'oklch(0.74 0.10 212 / 0.12)', border: '1px solid oklch(0.74 0.10 212 / 0.2)' }}
                  >
                    <FileZip weight="fill" className="size-4 text-[oklch(0.74_0.10_212)]" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-mono text-sm font-medium text-foreground">{asset.name}</div>
                    <div className="text-xs text-muted-foreground">{describeReleaseAsset(asset, platform, language)}</div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <span className="hidden font-mono text-xs text-muted-foreground sm:block">{formatFileSize(asset.size, language)}</span>
                  <div className="flex items-center gap-1.5 rounded-lg bg-brand-gradient px-3 py-1.5 text-xs font-semibold text-white group-hover:shadow-md">
                    <DownloadSimple weight="bold" className="size-3.5" />
                    {t('下载', 'Download')}
                  </div>
                </div>
              </a>
            )) : (
              <Alert status="warning" className="rounded-xl">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>{t('该版本暂无安装附件', 'No installer assets for this release')}</Alert.Title>
                  <Alert.Description>{t('可前往 GitHub Releases 页面查看完整发布信息。', 'Open the GitHub Releases page for complete release details.')}</Alert.Description>
                </Alert.Content>
              </Alert>
            )}
          </div>

          <div
            className="flex flex-wrap items-center gap-2.5 rounded-xl px-4 py-3 text-xs text-muted-foreground"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <CheckCircle weight="fill" className="size-4 shrink-0 text-[oklch(0.70_0.12_188)]" />
            {t('安装包来自官方 GitHub Release，完整校验信息可在', 'Installers come from the official GitHub Release. View complete verification details on the')}
            <a
              href={release.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[oklch(0.74_0.10_212)] hover:underline"
            >
              {t('发布页面', 'release page')}
            </a>
            {t('查询。', '.')}
          </div>
        </>
      ) : (
        <Alert status="warning" className="glass-card rounded-xl">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{t(`暂无 ${platformLabel} ${typeLabel}`, `No ${platformLabel} ${typeLabel} release`)}</Alert.Title>
            <Alert.Description>{t('请切换平台或稍后重新加载发布数据。', 'Switch platforms or reload the release data later.')}</Alert.Description>
          </Alert.Content>
          <Button onPress={onReload} size="sm" variant="outline">{t('重新加载', 'Reload')}</Button>
        </Alert>
      )}
    </motion.section>
  )
}

function InstallationFaqSection({ platform }: { platform: ReleasePlatform }) {
  const { language, t } = useSitePreferences()
  const items = getInstallationFaqItems(language, platform)
  const platformLabel = platform === 'windows' ? 'Windows' : 'macOS'

  return (
    <motion.section
      key={`installation-faq-${platform}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-14"
    >
      <div className="mb-5 flex items-start gap-3">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: 'oklch(0.74 0.10 212 / 0.12)', border: '1px solid oklch(0.74 0.10 212 / 0.3)' }}
        >
          <CircleHelp className="size-5 text-[oklch(0.74_0.10_212)]" />
        </div>
        <div>
          <h2 className="text-xl font-black text-foreground">
            {t(`${platformLabel} 安装常见问题`, `${platformLabel} installation FAQ`)}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('下载前了解安装包选择、系统安全提示和启动问题。', 'Review package choices, system security prompts, and launch issues before downloading.')}
          </p>
        </div>
      </div>

      <Accordion className="glass-card w-full overflow-hidden rounded-2xl" variant="surface">
        {items.map((item) => (
          <Accordion.Item key={item.id} id={item.id}>
            <Accordion.Heading>
              <Accordion.Trigger className="text-left font-semibold text-foreground hover:bg-white/3">
                <span className="min-w-0 flex-1">{item.title}</span>
                <Accordion.Indicator className="shrink-0 text-muted-foreground [&>svg]:size-4">
                  <ChevronDown />
                </Accordion.Indicator>
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
              <Accordion.Body className="pb-5">
                <HelpContent html={item.content} />
                {item.tip && <HelpTip type={item.tip.type} text={item.tip.text} />}
              </Accordion.Body>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </motion.section>
  )
}

export default function DownloadPage() {
  const { language, ready, t, githubProxyEnabled } = useSitePreferences()
  const [activeOS, setActiveOS] = useState<ReleasePlatform>('windows')
  const [activeTab, setActiveTab] = useState<TabType>('latest')
  const [showAll, setShowAll] = useState(false)
  const [mobile, setMobile] = useState(false)
  const {
    data,
    error,
    isLoading,
    isRefreshing,
    isUsingFallback,
    reload,
  } = useReleases({ enabled: ready, proxyEnabled: githubProxyEnabled })

  useEffect(() => {
    setMobile(isMobile())
  }, [])

  useEffect(() => {
    setShowAll(false)
  }, [activeOS])

  const currentPlatform = platforms.find((platform) => platform.os === activeOS)!
  const currentRelease = data?.latest[activeOS] ?? null
  const currentBetaRelease = data?.latestBeta[activeOS] ?? null
  const platformReleases = data?.releases[activeOS] ?? []
  const displayVersions = showAll ? platformReleases : platformReleases.slice(0, 7)

  if (mobile) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center px-6">
        <div className="absolute inset-0 bg-section-gradient" />
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, oklch(0.73 0.11 210 / 0.5), transparent 70%)' }}
        />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-sm w-full text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'oklch(0.74 0.10 212 / 0.12)', border: '1px solid oklch(0.74 0.10 212 / 0.25)' }}
            >
              <DeviceMobile weight="fill" className="w-7 h-7 text-[oklch(0.74_0.10_212)]" />
            </div>
            <div className="text-muted-foreground text-2xl font-thin select-none">→</div>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'oklch(0.70 0.12 188 / 0.12)', border: '1px solid oklch(0.70 0.12 188 / 0.25)' }}
            >
              <Monitor weight="fill" className="w-7 h-7 text-[oklch(0.70_0.12_188)]" />
            </div>
          </div>

          <h1 className="text-2xl font-black mb-3 text-balance">
            {language === 'zh' ? (
              <>请在 <span className="text-gradient">桌面端</span> 打开下载</>
            ) : (
              <>Open downloads on a <span className="text-gradient">desktop</span></>
            )}
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            {language === 'zh' ? (
              <>星酿启动器仅支持在 <span className="text-foreground font-medium">Windows</span> 和 <span className="text-foreground font-medium">macOS</span> 上运行。请在电脑浏览器中打开本页面以下载安装包。</>
            ) : (
              <>AstraBrew Launcher supports <span className="text-foreground font-medium">Windows</span> and <span className="text-foreground font-medium">macOS</span>. Open this page in a desktop browser to download an installer.</>
            )}
          </p>

          <div className="flex items-center justify-center gap-3 mb-8">
            {platforms.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-foreground"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <Icon weight="fill" className="w-4 h-4 text-muted-foreground" />
                {label}
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            {t('在电脑浏览器中访问', 'Visit on your desktop')}
            <span
              className="mx-1 px-2 py-0.5 rounded font-mono text-[oklch(0.74_0.10_212)]"
              style={{ background: 'oklch(0.74 0.10 212 / 0.08)' }}
            >
              xingniang.app/{language}/download
            </span>
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16 pb-24">
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-section-gradient" />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, oklch(0.73 0.11 210 / 0.5), transparent 70%)' }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-xs font-medium"
              style={{
                background: 'oklch(0.74 0.10 212 / 0.1)',
                border: '1px solid oklch(0.74 0.10 212 / 0.3)',
                color: 'var(--brand-blue-text)',
              }}
            >
              <CheckCircle weight="fill" className="w-3.5 h-3.5" />
              {currentRelease
                ? t(`最新正式版 ${currentRelease.version}`, `Latest stable ${currentRelease.version}`)
                : t('正在同步最新版本', 'Syncing latest releases')}
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-4 text-balance">
              {t('下载', 'Download ')}<span className="text-gradient">{t('星酿启动器', 'AstraBrew Launcher')}</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
              {t(
                '选择适合你的操作系统，一键下载安装，开启虚拟歌姬创作之旅。',
                'Choose your operating system and download the latest installer.',
              )}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {data && error && isUsingFallback && (
          <Alert status="warning" className="glass-card rounded-xl mb-6">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>{t('正在显示缓存数据', 'Showing cached data')}</Alert.Title>
              <Alert.Description>
                {language === 'zh' ? error : 'The release service could not be refreshed. Cached data is shown.'}
              </Alert.Description>
            </Alert.Content>
            <Button
              isPending={isRefreshing}
              onPress={() => void reload()}
              size="sm"
              variant="outline"
            >
              <RefreshCw className="size-4" />
              {t('重新加载', 'Reload')}
            </Button>
          </Alert>
        )}

        {!data ? (
          !ready || isLoading ? (
            <ReleaseLoading />
          ) : (
            <ReleaseError
              message={language === 'zh'
                ? error ?? '暂时没有可显示的发布数据。'
                : error
                  ? 'The release service is unavailable. Check your connection and try again.'
                  : 'No release data is currently available.'}
              isRefreshing={isRefreshing}
              onReload={() => void reload()}
            />
          )
        ) : (
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as TabType)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6 w-fit mx-auto"
            >
              <Tabs.ListContainer>
                <Tabs.List
                  aria-label={t('下载版本', 'Download versions')}
                  className="flex gap-1 p-1 rounded-xl w-fit"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  {[
                    { key: 'latest', label: t('最新版本', 'Latest') },
                    { key: 'all', label: t('所有版本', 'All versions') },
                  ].map((tab) => (
                    <Tabs.Tab
                      key={tab.key}
                      id={tab.key}
                      className="relative h-auto w-auto px-5 py-2 rounded-lg text-sm font-medium text-muted-foreground data-[selected=true]:text-white"
                    >
                      <span className="relative z-10">{tab.label}</span>
                      <Tabs.Indicator className="rounded-lg bg-brand-gradient shadow-md" />
                    </Tabs.Tab>
                  ))}
                </Tabs.List>
              </Tabs.ListContainer>
            </motion.div>

            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="flex gap-2">
                {platforms.map((platform) => {
                  const Icon = platform.icon
                  const isActive = activeOS === platform.os
                  return (
                    <Button
                      key={platform.os}
                      onPress={() => setActiveOS(platform.os)}
                      variant={isActive ? 'secondary' : 'outline'}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${
                        isActive ? 'text-foreground' : 'glass-card text-muted-foreground hover:text-foreground'
                      }`}
                      style={isActive ? {
                        background: 'oklch(0.74 0.10 212 / 0.15)',
                        border: '1px solid oklch(0.74 0.10 212 / 0.4)',
                      } : {}}
                    >
                      <Icon weight="fill" className="w-4 h-4" />
                      {platform.label}
                    </Button>
                  )
                })}
              </div>
              <span className="hidden sm:block text-[11px] text-muted-foreground">
                {isRefreshing
                  ? t('正在同步…', 'Syncing...')
                  : t(
                      `缓存更新于 ${formatReleaseDate(data.fetchedAt, 'zh-CN')}`,
                      `Cached ${formatReleaseDate(data.fetchedAt, 'en-US')}`,
                    )}
              </span>
            </div>

            <Tabs.Panel id="latest" className="p-0">
              <div className="space-y-12">
                <LatestReleaseSection
                  release={currentRelease}
                  platform={activeOS}
                  platformLabel={currentPlatform.label}
                  requirement={t(currentPlatform.requirement, currentPlatform.requirementEn)}
                  type="formal"
                  onReload={() => void reload()}
                />
                <LatestReleaseSection
                  release={currentBetaRelease}
                  platform={activeOS}
                  platformLabel={currentPlatform.label}
                  requirement={t(currentPlatform.requirement, currentPlatform.requirementEn)}
                  type="beta"
                  onReload={() => void reload()}
                />
              </div>
            </Tabs.Panel>

            <Tabs.Panel id="all" className="p-0">
              <motion.div
                key={`all-${activeOS}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="glass-card rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-border/50">
                    <h3 className="font-bold text-sm text-foreground">{t(`${currentPlatform.label} 历史版本`, `${currentPlatform.label} release history`)}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{t('数据来自官方 GitHub Releases', 'Data from official GitHub Releases')}</p>
                  </div>

                  {displayVersions.length ? (
                    <div className="divide-y divide-border/40">
                      {displayVersions.map((release, index) => {
                        const assets = getDownloadAssets(release, activeOS)

                        return (
                          <motion.div
                            key={release.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.04 }}
                            className="px-5 py-4 transition-colors hover:bg-white/3"
                          >
                            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                              <div className="flex min-w-0 flex-wrap items-center gap-2.5">
                                <span className="font-mono text-sm font-bold text-foreground">{release.version}</span>
                                <span
                                  className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                                  style={release.isBeta
                                    ? { background: 'oklch(0.74 0.10 212 / 0.12)', color: 'var(--brand-blue-text)', border: '1px solid oklch(0.74 0.10 212 / 0.25)' }
                                    : { background: 'oklch(0.70 0.12 188 / 0.12)', color: 'var(--brand-green-text)', border: '1px solid oklch(0.70 0.12 188 / 0.25)' }}
                                >
                                  {release.isBeta ? t('测试版', 'Beta') : t('正式版', 'Stable')}
                                </span>
                                {release.title !== release.version && (
                                  <span className="min-w-0 break-words text-xs text-muted-foreground">{release.title}</span>
                                )}
                              </div>
                              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                                {formatReleaseDate(release.publishedAt, language === 'zh' ? 'zh-CN' : 'en-US')}
                              </span>
                            </div>

                            {assets.length ? (
                              <div className="mt-3 divide-y divide-border/40 border-t border-border/40">
                                {assets.map((asset) => (
                                  <div key={asset.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex min-w-0 items-start gap-3">
                                      <div
                                        className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg"
                                        style={{ background: 'oklch(0.74 0.10 212 / 0.12)', border: '1px solid oklch(0.74 0.10 212 / 0.2)' }}
                                      >
                                        <FileZip weight="fill" className="size-3.5 text-[oklch(0.74_0.10_212)]" />
                                      </div>
                                      <div className="min-w-0">
                                        <div className="break-all font-mono text-sm font-medium text-foreground">{asset.name}</div>
                                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                                          <span>{describeReleaseAsset(asset, activeOS, language)}</span>
                                          <span aria-hidden="true">·</span>
                                          <span className="font-mono">{formatFileSize(asset.size, language)}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <a
                                      href={asset.downloadUrl}
                                      download
                                      aria-label={t(`下载 ${asset.name}`, `Download ${asset.name}`)}
                                      className="flex w-full shrink-0 items-center justify-center gap-1.5 rounded-lg bg-brand-gradient px-3 py-2 text-xs font-semibold text-white transition-shadow hover:shadow-md sm:w-auto"
                                    >
                                      <DownloadSimple weight="bold" className="size-3.5" />
                                      {t('下载', 'Download')}
                                    </a>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <a
                                href={release.htmlUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 flex items-center gap-1 border-t border-border/40 pt-3 text-xs font-medium transition-colors"
                                style={{ color: 'oklch(0.74 0.10 212)' }}
                              >
                                {t('该版本暂无安装附件，查看发布页面', 'No installer assets. View release page')}
                              </a>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-5">
                      <Alert status="warning">
                        <Alert.Indicator />
                        <Alert.Content>
                          <Alert.Title>{t('暂无历史版本', 'No release history')}</Alert.Title>
                          <Alert.Description>{t('该平台当前没有可显示的 GitHub Release。', 'There are no GitHub Releases available for this platform.')}</Alert.Description>
                        </Alert.Content>
                      </Alert>
                    </div>
                  )}

                  {platformReleases.length > 7 && (
                    <Button
                      fullWidth
                      onPress={() => setShowAll((value) => !value)}
                      variant="ghost"
                      className="w-full flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground hover:text-foreground border-t border-border/40"
                    >
                      {showAll ? (
                        <>{t('收起版本历史', 'Collapse release history')} <ChevronUp className="w-3.5 h-3.5" /></>
                      ) : (
                        <>{t('展开全部版本', 'Show all versions')} ({platformReleases.length}) <ChevronDown className="w-3.5 h-3.5" /></>
                      )}
                    </Button>
                  )}
                </div>
              </motion.div>
            </Tabs.Panel>
          </Tabs>
        )}

        <InstallationFaqSection platform={activeOS} />
      </div>
    </div>
  )
}
