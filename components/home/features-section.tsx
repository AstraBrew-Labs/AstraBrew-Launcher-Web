'use client'

import { motion } from 'framer-motion'
import { Lightning, ShieldCheck, Stack, Cpu, Package, Translate } from '@phosphor-icons/react'
import { Card } from '@heroui/react'
import { useSitePreferences } from '@/components/site-preferences'

const features = [
  {
    icon: Lightning,
    title: '一键启动',
    titleEn: 'One-click Launch',
    description: '完成配置后即可快速启动 SillyTavern，减少重复的命令行操作。',
    descriptionEn: 'Launch SillyTavern quickly after setup without repeating command-line steps.',
    color: 'oklch(0.74 0.10 212)',
    glow: 'oklch(0.74 0.10 212 / 0.15)',
  },
  {
    icon: Stack,
    title: '实例与版本管理',
    titleEn: 'Instances and Versions',
    description: '集中配置和管理酒馆实例，并在一个界面中完成版本维护。',
    descriptionEn: 'Configure and manage SillyTavern instances and maintain their versions from one interface.',
    color: 'oklch(0.70 0.12 188)',
    glow: 'oklch(0.70 0.12 188 / 0.15)',
  },
  {
    icon: ShieldCheck,
    title: '环境隔离',
    titleEn: 'Isolated Environments',
    description: '支持内置或系统 Git、Node.js 环境切换，减少环境冲突和手动配置。',
    descriptionEn: 'Switch between bundled and system Git or Node.js environments to reduce conflicts and manual setup.',
    color: 'oklch(0.74 0.10 212)',
    glow: 'oklch(0.74 0.10 212 / 0.15)',
  },
  {
    icon: Package,
    title: '扩展与资源',
    titleEn: 'Extensions and Resources',
    description: '在启动器中统一管理扩展和资源，让酒馆维护更集中。',
    descriptionEn: 'Manage extensions and resources in the launcher for a more organized SillyTavern setup.',
    color: 'oklch(0.70 0.12 188)',
    glow: 'oklch(0.70 0.12 188 / 0.15)',
  },
  {
    icon: Translate,
    title: '双语与主题',
    titleEn: 'Languages and Themes',
    description: '支持中文、英文以及深色、浅色主题，适配不同使用习惯。',
    descriptionEn: 'Use Chinese or English with light and dark themes to match your preferences.',
    color: 'oklch(0.74 0.10 212)',
    glow: 'oklch(0.74 0.10 212 / 0.15)',
  },
  {
    icon: Cpu,
    title: '轻量原生',
    titleEn: 'Lightweight and Native',
    description: '基于 Rust 和 egui 构建，界面响应迅速并保持较低资源占用。',
    descriptionEn: 'Built with Rust and egui for a responsive native interface with low resource usage.',
    color: 'oklch(0.70 0.12 188)',
    glow: 'oklch(0.70 0.12 188 / 0.15)',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

export default function FeaturesSection() {
  const { t } = useSitePreferences()

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-section-gradient opacity-60" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 标题区 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-medium"
            style={{
              background: 'oklch(0.70 0.12 188 / 0.1)',
              border: '1px solid oklch(0.70 0.12 188 / 0.3)',
              color: 'var(--brand-green-text)',
            }}
          >
            {t('核心功能', 'Core Features')}
          </div>
          <h2 className="text-3xl sm:text-4xl font-black mb-4 text-balance">
            {t('让', 'SillyTavern ')}<span className="text-gradient">{t('酒馆安装与管理', 'setup and management')}</span>
            <br />
            {t('更简单', 'made simpler')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto text-pretty leading-relaxed">
            {t(
              '从环境准备到实例启动，把繁琐配置收进一个清晰、易用的桌面界面。',
              'From environment setup to instance launch, AstraBrew brings the complex steps into one clear desktop interface.',
            )}
          </p>
        </motion.div>

        {/* 功能卡片网格 */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <Card variant="transparent" className="group relative h-full glass-card rounded-2xl p-0 cursor-default">
                  {/* 悬浮时背景光效 */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: feature.glow }}
                  />

                  <Card.Content className="relative z-10 p-6">
                    {/* 图标 */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                      style={{
                        background: `${feature.color.replace(')', ' / 0.15)')}`,
                        border: `1px solid ${feature.color.replace(')', ' / 0.3)')}`,
                      }}
                    >
                      <Icon weight="fill" className="w-5 h-5" style={{ color: feature.color }} />
                    </div>

                    <Card.Title className="font-bold text-base text-foreground mb-2">{t(feature.title, feature.titleEn)}</Card.Title>
                    <Card.Description className="text-sm text-muted-foreground leading-relaxed">{t(feature.description, feature.descriptionEn)}</Card.Description>
                  </Card.Content>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
