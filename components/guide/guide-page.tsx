'use client'

import { useState } from 'react'
import { ChevronRight, X } from 'lucide-react'
import {
  DownloadSimple, Warning, CheckCircle, Info, ArrowRight, List
} from '@phosphor-icons/react'
import { Button } from '@heroui/react'
import { HelpContent, HelpTip } from '@/components/help-content'
import { useSitePreferences } from '@/components/site-preferences'
import { getInstallationFaqItems } from '@/lib/installation-faq'

// ---- 数据 ----
const chapters = [
  {
    id: 'install',
    icon: DownloadSimple,
    title: '安装启动器',
    steps: [
      {
        title: '下载安装包',
        content: `前往 <strong>下载页面</strong>，根据你的操作系统选择对应的安装包：
        <ul>
          <li><strong>Windows：</strong>下载 <code>.exe</code> 安装程序（推荐）或带有 <code>portable</code> 的免安装版压缩包</li>
          <li><strong>macOS：</strong>下载 <code>.dmg</code> 安装镜像，并根据发布附件选择适合设备的版本</li>
        </ul>`,
        image: false,
        imageAlt: '',
        imageDesc: '',
      },
      {
        title: '在 Windows 上安装',
        content: `双击下载的 <code>AstraBrew Launcher_&lt;version&gt;_x64-setup.exe</code>，按照安装向导完成安装：
        <ol>
          <li>若系统弹出 SmartScreen 提示，点击「更多信息」→「仍要运行」</li>
          <li>确认安装位置与快捷方式选项</li>
          <li>点击「安装」，完成后从开始菜单或桌面启动星酿启动器</li>
          <li>若下载的是免安装版，解压 ZIP 后直接运行其中的程序即可</li>
        </ol>`,
        image: false,
        imageAlt: '',
        imageDesc: '',
      },
      {
        title: '在 macOS 上安装',
        content: `打开下载的 <code>.dmg</code> 文件，将星酿启动器拖入 Applications 文件夹：
        <ol>
          <li>双击 <code>.dmg</code> 文件挂载磁盘镜像</li>
          <li>将 AstraBrew Launcher 拖到 Applications 文件夹</li>
          <li>从「应用程序」中启动；若首次打开被系统阻止，请右键应用并选择「打开」</li>
        </ol>`,
        image: false,
        imageAlt: '',
        imageDesc: '',
      },
    ],
  },
  {
    id: 'troubleshoot',
    icon: Warning,
    title: '常见问题',
    steps: [
      ...getInstallationFaqItems('zh').map((item) => ({
        ...item,
        image: false,
        imageAlt: '',
        imageDesc: '',
      })),
      {
        title: '支持 Linux 或移动设备吗？',
        content: `目前官网仅提供 <strong>Windows</strong> 和 <strong>macOS</strong> 版本。Linux、Android 和 iOS 暂无官方安装包。`,
        image: false,
        imageAlt: '',
        imageDesc: '',
      },
    ],
  },
]

const chaptersEn = [
  {
    id: 'install',
    icon: DownloadSimple,
    title: 'Install the Launcher',
    steps: [
      {
        title: 'Download an installer',
        content: `Open the <strong>download page</strong> and choose the package for your operating system:
        <ul>
          <li><strong>Windows:</strong> download the recommended <code>.exe</code> installer or the portable <code>.zip</code> archive</li>
          <li><strong>macOS:</strong> download the <code>.dmg</code> disk image and choose the appropriate release asset for your Mac</li>
        </ul>`,
        image: false,
        imageAlt: '',
        imageDesc: '',
      },
      {
        title: 'Install on Windows',
        content: `Double-click <code>AstraBrew Launcher_&lt;version&gt;_x64-setup.exe</code> and complete the setup wizard:
        <ol>
          <li>If SmartScreen appears, select "More info" and then "Run anyway"</li>
          <li>Confirm the installation location and shortcut options</li>
          <li>Choose "Install", then launch AstraBrew from the Start menu or desktop</li>
          <li>For the portable build, extract the ZIP and run the application directly</li>
        </ol>`,
        image: false,
        imageAlt: '',
        imageDesc: '',
      },
      {
        title: 'Install on macOS',
        content: `Open the downloaded <code>.dmg</code> and move AstraBrew Launcher into Applications:
        <ol>
          <li>Double-click the <code>.dmg</code> to mount it</li>
          <li>Drag AstraBrew Launcher into the Applications folder</li>
          <li>Launch it from Applications; if Gatekeeper blocks the first launch, right-click the app and choose "Open"</li>
        </ol>`,
        image: false,
        imageAlt: '',
        imageDesc: '',
      },
    ],
  },
  {
    id: 'troubleshoot',
    icon: Warning,
    title: 'Frequently Asked Questions',
    steps: [
      ...getInstallationFaqItems('en').map((item) => ({
        ...item,
        image: false,
        imageAlt: '',
        imageDesc: '',
      })),
      {
        title: 'Are Linux and mobile devices supported?',
        content: `The official website currently provides builds for <strong>Windows</strong> and <strong>macOS</strong> only. There are no official Linux, Android, or iOS packages.`,
        image: false,
        imageAlt: '',
        imageDesc: '',
      },
    ],
  },
]

// ---- 组件 ----
function StepImage({ alt, desc }: { alt: string; desc: string }) {
  const { t } = useSitePreferences()

  return (
    <div
      className="mt-4 mb-2 w-full max-w-full overflow-hidden rounded-xl"
      style={{ border: '1px solid oklch(0.30 0.04 218 / 0.5)' }}
    >
      <div
        className="w-full h-44 flex flex-col items-center justify-center gap-3"
        style={{ background: 'var(--card)' }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: 'oklch(0.74 0.10 212 / 0.12)', border: '1px solid oklch(0.74 0.10 212 / 0.25)' }}
        >
          <Info weight="fill" className="w-6 h-6 text-[oklch(0.74_0.10_212)]" />
        </div>
        <span className="text-xs text-muted-foreground">{t('实际截图将在正式版中显示', 'Screenshots will be added in a stable release')}</span>
      </div>
      <div
        className="px-4 py-2 text-xs text-muted-foreground border-t"
        style={{ borderColor: 'oklch(0.30 0.04 218 / 0.4)' }}
      >
        {desc}
      </div>
    </div>
  )
}

export default function GuidePage() {
  const { language, t } = useSitePreferences()
  const localizedChapters = language === 'zh' ? chapters : chaptersEn
  const [activeChapter, setActiveChapter] = useState(chapters[0].id)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const chapter = localizedChapters.find((c) => c.id === activeChapter)!
  const chapterIndex = localizedChapters.findIndex((c) => c.id === activeChapter)
  const prevChapter = chapterIndex > 0 ? localizedChapters[chapterIndex - 1] : null
  const nextChapter = chapterIndex < localizedChapters.length - 1 ? localizedChapters[chapterIndex + 1] : null

  return (
    <div className="min-h-screen max-w-full overflow-x-clip pt-16">

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40 py-10 sm:py-16">
        <div className="absolute inset-0 bg-section-gradient opacity-60" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-medium"
              style={{ background: 'oklch(0.70 0.12 188 / 0.1)', border: '1px solid oklch(0.70 0.12 188 / 0.3)', color: 'var(--brand-green-text)' }}
            >
              {t('使用指南', 'User Guide')}
            </div>
            <h1 className="mb-3 text-3xl font-black text-balance sm:text-4xl">
              <span className="text-gradient">{t('星酿启动器', 'AstraBrew Launcher')}</span> {t('使用说明', 'Guide')}
            </h1>
            <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t('查看 Windows 与 macOS 安装方法，以及安装和启动时的常见问题。', 'Install AstraBrew on Windows or macOS and find answers to common setup questions.')}
            </p>
          </div>
        </div>
      </section>

      {/* 主体布局 */}
      <div className="mx-auto w-full max-w-7xl px-3 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:gap-8">

          {/* 侧边栏 · 桌面 */}
          <aside className="hidden w-60 shrink-0 lg:block">
            <div className="sticky top-24">
              <nav className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 mb-3">{t('章节目录', 'Contents')}</p>
                {localizedChapters.map((c) => {
                  const Icon = c.icon
                  const isActive = c.id === activeChapter
                  return (
                    <Button
                      key={c.id}
                      fullWidth
                      onPress={() => setActiveChapter(c.id)}
                      variant="ghost"
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all duration-200 ${
                        isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-white/4'
                      }`}
                      style={isActive ? { background: 'oklch(0.74 0.10 212 / 0.12)', border: '1px solid oklch(0.74 0.10 212 / 0.3)' } : {}}
                    >
                      <Icon weight="fill" className="w-4 h-4 flex-shrink-0" style={{ color: isActive ? 'oklch(0.74 0.10 212)' : undefined }} />
                      <span>{c.title}</span>
                      {isActive && <ArrowRight weight="bold" className="w-3 h-3 ml-auto text-[oklch(0.74_0.10_212)]" />}
                    </Button>
                  )
                })}
              </nav>
            </div>
          </aside>

          {/* 移动侧边栏触发 */}
          <div className="w-full min-w-0 lg:hidden">
            <Button
              fullWidth
              onPress={() => setSidebarOpen(!sidebarOpen)}
              variant="outline"
              className="glass-card flex w-full min-w-0 items-center justify-start gap-2 rounded-xl px-4 py-2.5 text-sm font-medium"
              aria-expanded={sidebarOpen}
              aria-controls="guide-mobile-chapters"
            >
              {sidebarOpen ? <X className="size-4 shrink-0" /> : <List weight="bold" className="size-4 shrink-0" />}
              <span className="min-w-0 flex-1 truncate text-left">{chapter.title}</span>
              <ChevronRight className={`ml-auto size-4 shrink-0 transition-transform ${sidebarOpen ? 'rotate-90' : ''}`} />
            </Button>
            {sidebarOpen && (
                <div id="guide-mobile-chapters" className="menu-enter overflow-hidden">
                  <nav className="mt-2 glass-card rounded-xl p-2 space-y-1">
                    {localizedChapters.map((c) => {
                      const Icon = c.icon
                      return (
                        <Button
                          key={c.id}
                          fullWidth
                          onPress={() => { setActiveChapter(c.id); setSidebarOpen(false) }}
                          variant="ghost"
                          className={`flex w-full min-w-0 items-center justify-start gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                            c.id === activeChapter ? 'text-foreground bg-[oklch(0.74_0.10_212/0.1)]' : 'text-muted-foreground'
                          }`}
                        >
                          <Icon weight="fill" className="size-3.5 shrink-0" />
                          <span className="min-w-0 flex-1 truncate">{c.title}</span>
                        </Button>
                      )
                    })}
                  </nav>
                </div>
            )}
          </div>

          {/* 内容区 */}
          <main className="w-full min-w-0 flex-1">
              <div key={activeChapter} className="page-enter">
                {/* 章节头 */}
                <div className="mb-7 flex min-w-0 items-center gap-3 sm:mb-8">
                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: 'oklch(0.74 0.10 212 / 0.12)', border: '1px solid oklch(0.74 0.10 212 / 0.3)' }}
                  >
                    {(() => { const Icon = chapter.icon; return <Icon weight="fill" className="w-5 h-5 text-[oklch(0.74_0.10_212)]" /> })()}
                  </div>
                  <div className="min-w-0">
                    <h2 className="break-words text-xl font-black text-foreground sm:text-2xl">{chapter.title}</h2>
                    <p className="text-xs text-muted-foreground">
                      {chapter.steps.length} {chapter.id === 'troubleshoot' ? t('个问题', 'questions') : t('个步骤', 'steps')}
                    </p>
                  </div>
                </div>

                {/* 步骤列表 */}
                <div className="space-y-8">
                  {chapter.steps.map((step, i) => (
                    <div
                      key={step.title}
                      className="relative min-w-0 pl-9 sm:pl-10"
                    >
                      {/* 步骤序号线 */}
                      <div className="absolute left-0 top-0 flex flex-col items-center">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: 'oklch(0.73 0.11 210)', color: 'white' }}
                        >
                          {i + 1}
                        </div>
                        {i < chapter.steps.length - 1 && (
                          <div className="w-px flex-1 mt-2 min-h-[20px]" style={{ background: 'oklch(0.30 0.04 218 / 0.4)' }} />
                        )}
                      </div>

                      <div className="min-w-0 pb-4">
                        <h3 className="mb-3 break-words text-base font-bold text-foreground">{step.title}</h3>
                        <HelpContent html={step.content} />
                        {step.image && <StepImage alt={step.imageAlt} desc={step.imageDesc} />}
                        {'tip' in step && step.tip && <HelpTip type={step.tip.type} text={step.tip.text} />}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 章节导航 */}
                <div className="mt-10 flex flex-col gap-3 border-t border-border/40 pt-6 sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
                  {prevChapter ? (
                    <Button
                      onPress={() => setActiveChapter(prevChapter.id)}
                      variant="ghost"
                      className="group flex w-full min-w-0 items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:w-auto"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
                      <span>{prevChapter.title}</span>
                    </Button>
                  ) : <div className="hidden sm:block" />}
                  {nextChapter ? (
                    <Button
                      onPress={() => setActiveChapter(nextChapter.id)}
                      variant="ghost"
                      className="group flex w-full min-w-0 items-center justify-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-[var(--brand-blue-text)] sm:w-auto"
                    >
                      <span>{nextChapter.title}</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  ) : (
                    <div className="flex w-full items-center justify-center gap-2 text-sm text-[oklch(0.70_0.12_188)] sm:w-auto sm:justify-start">
                      <CheckCircle weight="fill" className="w-4 h-4" />
                      {t('已浏览全部内容', 'End of guide')}
                    </div>
                  )}
                </div>
              </div>
          </main>
        </div>
      </div>
    </div>
  )
}
