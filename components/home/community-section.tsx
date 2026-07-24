'use client'

import { motion } from 'framer-motion'
import { Chat, GithubLogo, ArrowSquareOut } from '@phosphor-icons/react'
import { useSitePreferences } from '@/components/site-preferences'

const communities = [
  {
    icon: Chat,
    platform: '星酿启动器交流群',
    platformEn: 'QQ SillyTavern Group',
    id: '1091959450',
    description: '与其他酒馆用户交流配置经验、分享使用技巧并获取最新资讯。',
    descriptionEn: 'Exchange setup advice, share practical tips, and follow project updates with other SillyTavern users.',
    action: '加入群聊',
    actionEn: 'Join group',
    href: 'https://qm.qq.com/q/9Iduf52Vj4',
    color: 'oklch(0.74 0.10 212)',
    bg: 'oklch(0.74 0.10 212 / 0.08)',
    badge: '活跃',
    badgeEn: 'Active',
  },
  {
    icon: GithubLogo,
    platform: 'AstraBrew-Labs（星酿工坊）',
    platformEn: 'AstraBrew-Labs',
    id: 'github.com/AstraBrew-Labs',
    description: '查看星酿工坊旗下的开源项目、版本仓库和最新开发动态。',
    descriptionEn: 'Explore AstraBrew Labs projects, release repositories, and current development work.',
    action: '访问 GitHub',
    actionEn: 'Visit GitHub',
    href: 'https://github.com/AstraBrew-Labs',
    color: 'oklch(0.70 0.12 188)',
    bg: 'oklch(0.70 0.12 188 / 0.08)',
    badge: '开源',
    badgeEn: 'Open source',
  },
]

export default function CommunitySection() {
  const { t } = useSitePreferences()

  return (
    <section className="relative py-24 overflow-hidden">

      {/* 背景装饰 */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, oklch(0.70 0.12 188), transparent 70%)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">

          {/* 左侧标题 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="lg:w-72 flex-shrink-0 text-center lg:text-left"
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-medium"
              style={{
                background: 'oklch(0.74 0.10 212 / 0.1)',
                border: '1px solid oklch(0.74 0.10 212 / 0.3)',
                color: 'var(--brand-blue-text)',
              }}
            >
              {t('加入我们', 'Join Us')}
            </div>
            <h2 className="text-3xl sm:text-4xl font-black mb-4 text-balance">
              {t('与', 'Connect with ')}<span className="text-gradient">{t('酒馆用户', 'SillyTavern users')}</span>
              <br />
              {t('一起交流', 'and contributors')}
            </h2>
            <p className="text-muted-foreground leading-relaxed text-pretty">
              {t(
                '在社区中交流安装配置、获取使用帮助，并参与启动器的开源改进。',
                'Share setup advice, get help, and take part in improving the open-source launcher.',
              )}
            </p>
          </motion.div>

          {/* 右侧卡片网格 */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {communities.map((community, i) => {
              const Icon = community.icon
              return (
                <motion.a
                  key={community.platform}
                  href={community.href}
                  target="_blank"
                  rel="noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="group glass-card rounded-2xl p-5 block hover:border-[oklch(0.74_0.10_212/0.5)] transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: community.bg, border: `1px solid ${community.color.replace(')', ' / 0.25)')}` }}
                    >
                      <Icon weight="fill" className="w-5 h-5" style={{ color: community.color }} />
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: `${community.color.replace(')', ' / 0.12)')}`,
                        color: community.color,
                        border: `1px solid ${community.color.replace(')', ' / 0.25)')}`,
                      }}
                    >
                      {t(community.badge, community.badgeEn)}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-foreground mb-1">{t(community.platform, community.platformEn)}</h3>
                  <p className="text-xs text-muted-foreground font-mono mb-3">{community.id}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">{t(community.description, community.descriptionEn)}</p>

                  <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: community.color }}>
                    {t(community.action, community.actionEn)}
                    <ArrowSquareOut weight="bold" className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-150" />
                  </div>
                </motion.a>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
