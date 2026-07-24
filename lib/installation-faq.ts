import type { ReleasePlatform } from '@/lib/releases'

type Language = 'zh' | 'en'

interface InstallationFaqSource {
  id: string
  platform: ReleasePlatform
  title: Record<Language, string>
  content: Record<Language, string>
  tip?: {
    type: 'info' | 'warning'
    text: Record<Language, string>
  }
}

export interface InstallationFaqItem {
  id: string
  platform: ReleasePlatform
  title: string
  content: string
  tip?: {
    type: 'info' | 'warning'
    text: string
  }
}

const installationFaqs: InstallationFaqSource[] = [
  {
    id: 'windows-package',
    platform: 'windows',
    title: {
      zh: 'Windows 应该下载哪个文件？',
      en: 'Which Windows package should I download?',
    },
    content: {
      zh: '<code>.exe</code> 是推荐的安装版本，会创建开始菜单入口并提供卸载程序。文件名带有 <code>portable</code> 的 ZIP 是免安装版本，解压后即可运行，适合临时使用或放在移动存储设备中。',
      en: 'The <code>.exe</code> installer is recommended and creates Start menu entries plus an uninstaller. A ZIP with <code>portable</code> in its name is the portable build; extract it and run the application directly.',
    },
    tip: {
      type: 'info',
      text: {
        zh: '正式版与测试版会在下载页面分开显示，日常使用建议选择最新正式版。',
        en: 'Stable and beta releases are listed separately. Choose the latest stable release for everyday use.',
      },
    },
  },
  {
    id: 'windows-smartscreen',
    platform: 'windows',
    title: {
      zh: 'Windows 提示“已保护你的电脑”怎么办？',
      en: 'What should I do when Windows SmartScreen appears?',
    },
    content: {
      zh: `这是 Windows SmartScreen 的安全提示。确认文件来自星酿启动器官方 GitHub Release 后：
        <ol>
          <li>点击「更多信息」</li>
          <li>核对应用名称与发布来源</li>
          <li>点击「仍要运行」继续安装</li>
        </ol>`,
      en: `After confirming the file came from the official AstraBrew GitHub Release:
        <ol>
          <li>Choose "More info"</li>
          <li>Verify the application name and release source</li>
          <li>Choose "Run anyway" to continue</li>
        </ol>`,
    },
    tip: {
      type: 'warning',
      text: {
        zh: '不要运行来自第三方转载或来源不明的安装包。',
        en: 'Do not run installers reposted by third parties or downloaded from an unknown source.',
      },
    },
  },
  {
    id: 'mac-package',
    platform: 'mac',
    title: {
      zh: 'Mac 应该下载 M 芯片版还是通用版？',
      en: 'Should I download the Apple Silicon or universal Mac build?',
    },
    content: {
      zh: '使用 M1、M2、M3、M4 等 Apple 芯片的 Mac，优先下载文件名带有 <code>aarch64</code> 或 <code>arm64</code> 的版本。无法确定芯片型号，或需要兼容 Intel Mac 时，请下载文件名带有 <code>universal</code> 的通用版本。',
      en: 'For a Mac with an M1, M2, M3, M4, or another Apple chip, prefer the build with <code>aarch64</code> or <code>arm64</code> in its filename. Choose the <code>universal</code> build when you are unsure which chip you have or need Intel Mac compatibility.',
    },
    tip: {
      type: 'info',
      text: {
        zh: '可在「苹果菜单 → 关于本机」中查看芯片型号。',
        en: 'You can find the chip model under Apple menu, About This Mac.',
      },
    },
  },
  {
    id: 'mac-gatekeeper',
    platform: 'mac',
    title: {
      zh: 'macOS 提示无法验证开发者怎么办？',
      en: 'What if macOS cannot verify the developer?',
    },
    content: {
      zh: '确认应用来自官方发布页后，在 Applications 文件夹中右键 AstraBrew Launcher 并选择「打开」。如果仍被阻止，可前往「系统设置 → 隐私与安全性」查看并允许本次打开。',
      en: 'After confirming the app came from the official release page, right-click AstraBrew Launcher in Applications and choose "Open". If it is still blocked, review the prompt under System Settings, Privacy & Security and allow this launch.',
    },
    tip: {
      type: 'warning',
      text: {
        zh: '仅在确认下载来源和文件名称无误时允许打开。',
        en: 'Only allow the app after verifying its download source and filename.',
      },
    },
  },
  {
    id: 'windows-launch',
    platform: 'windows',
    title: {
      zh: 'Windows 上启动器无法正常启动怎么办？',
      en: 'What if the launcher does not start on Windows?',
    },
    content: {
      zh: `请先重新下载并确认安装包完整，然后尝试以下检查：
        <ol>
          <li>确认系统为 Windows 10 或更高版本（64 位）</li>
          <li>尝试以管理员身份运行启动器</li>
          <li>检查安装目录是否具有读写权限</li>
          <li>仍无法启动时，请携带日志信息前往项目 Issue 或交流群</li>
        </ol>`,
      en: `Download the installer again to rule out an incomplete file, then check the following:
        <ol>
          <li>Confirm the system is 64-bit Windows 10 or later</li>
          <li>Try running the launcher as administrator</li>
          <li>Confirm the installation directory has read and write permissions</li>
          <li>If the issue remains, include logs when opening an Issue or asking in the community group</li>
        </ol>`,
    },
    tip: {
      type: 'info',
      text: {
        zh: '反馈时请注明系统版本、启动器版本以及问题出现前的操作。',
        en: 'Include the operating system version, launcher version, and the action that preceded the problem.',
      },
    },
  },
  {
    id: 'mac-launch',
    platform: 'mac',
    title: {
      zh: 'macOS 上启动器无法正常启动怎么办？',
      en: 'What if the launcher does not start on macOS?',
    },
    content: {
      zh: `请先重新下载并确认安装镜像完整，然后尝试以下检查：
        <ol>
          <li>确认系统为 macOS 12 Monterey 或更高版本</li>
          <li>确认启动器已移动到 Applications 文件夹</li>
          <li>右键应用并选择「打开」，检查「隐私与安全性」中的系统提示</li>
          <li>仍无法启动时，请携带日志信息前往项目 Issue 或交流群</li>
        </ol>`,
      en: `Download the disk image again to rule out an incomplete file, then check the following:
        <ol>
          <li>Confirm the system is macOS 12 Monterey or later</li>
          <li>Confirm the launcher has been moved into Applications</li>
          <li>Right-click the app and choose "Open", then review prompts under Privacy & Security</li>
          <li>If the issue remains, include logs when opening an Issue or asking in the community group</li>
        </ol>`,
    },
    tip: {
      type: 'info',
      text: {
        zh: '反馈时请注明 Mac 芯片型号、系统版本、启动器版本以及问题出现前的操作。',
        en: 'Include the Mac chip model, system version, launcher version, and the action that preceded the problem.',
      },
    },
  },
]

export function getInstallationFaqItems(
  language: Language,
  platform?: ReleasePlatform,
): InstallationFaqItem[] {
  return installationFaqs
    .filter((item) => !platform || item.platform === platform)
    .map((item) => ({
      id: item.id,
      platform: item.platform,
      title: item.title[language],
      content: item.content[language],
      tip: item.tip
        ? { type: item.tip.type, text: item.tip.text[language] }
        : undefined,
    }))
}
