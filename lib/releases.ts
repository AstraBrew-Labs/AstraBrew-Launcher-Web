export const RELEASE_CACHE_TTL_MS = 24 * 60 * 60 * 1000

export type ReleasePlatform = 'windows' | 'mac'

export interface ReleaseAsset {
  id: number
  name: string
  size: number
  contentType: string
  downloadUrl: string
}

export interface ReleaseInfo {
  id: number
  platform: ReleasePlatform
  version: string
  title: string
  publishedAt: string
  isBeta: boolean
  htmlUrl: string
  notes: string[]
  assets: ReleaseAsset[]
}

export interface ReleasesPayload {
  fetchedAt: string
  ttlSeconds: number
  latest: Record<ReleasePlatform, ReleaseInfo | null>
  latestBeta: Record<ReleasePlatform, ReleaseInfo | null>
  releases: Record<ReleasePlatform, ReleaseInfo[]>
}

export function isReleaseCacheFresh(data: ReleasesPayload): boolean {
  const fetchedAt = Date.parse(data.fetchedAt)
  return Number.isFinite(fetchedAt) && Date.now() - fetchedAt < RELEASE_CACHE_TTL_MS
}

export function formatReleaseDate(value: string, locale = 'zh-CN'): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value.slice(0, 10)

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function formatFileSize(bytes: number, language: 'zh' | 'en' = 'zh'): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return language === 'zh' ? '未知大小' : 'Unknown size'

  const megabytes = bytes / 1024 / 1024
  return `${megabytes >= 10 ? megabytes.toFixed(1) : megabytes.toFixed(2)} MB`
}

export function describeReleaseAsset(
  asset: ReleaseAsset,
  platform: ReleasePlatform,
  language: 'zh' | 'en' = 'zh',
): string {
  const name = asset.name.toLowerCase()
  const label = (zh: string, en: string) => language === 'zh' ? zh : en

  if (platform === 'windows') {
    if (name.includes('portable')) return label('Windows 免安装版压缩包', 'Windows portable archive')
    if (name.endsWith('.msi')) return label('Windows 安装包', 'Windows installer package')
    if (name.endsWith('.msix') || name.endsWith('.msixbundle') || name.endsWith('.appx') || name.endsWith('.appxbundle')) {
      return label('Windows 应用安装包', 'Windows app package')
    }
    if (name.endsWith('.exe')) return label('Windows 安装程序', 'Windows installer')
    if (name.endsWith('.zip')) return label('Windows 压缩包', 'Windows archive')
  }

  if (name.includes('universal')) return label('macOS 通用版本', 'macOS universal build')
  if (name.includes('arm64') || name.includes('aarch64') || name.includes('apple-silicon')) {
    return label('Apple Silicon 版本', 'Apple Silicon build')
  }
  if (name.includes('x64') || name.includes('x86_64') || name.includes('intel')) return label('Intel Mac 版本', 'Intel Mac build')
  if (name.endsWith('.dmg')) return label('macOS 安装镜像', 'macOS disk image')

  return label('发布附件', 'Release asset')
}

export function getDownloadAssets(
  release: ReleaseInfo | null | undefined,
  platform: ReleasePlatform,
): ReleaseAsset[] {
  if (!release?.assets.length) return []

  const supportedExtensions = platform === 'windows'
    ? ['.exe', '.msi', '.msix', '.msixbundle', '.appx', '.appxbundle', '.zip']
    : ['.dmg']
  const downloads = release.assets.filter((asset) => {
    const name = asset.name.toLowerCase()
    return supportedExtensions.some((extension) => name.endsWith(extension))
  })

  return downloads
}

export function selectPrimaryAsset(
  release: ReleaseInfo | null | undefined,
  platform: ReleasePlatform,
): ReleaseAsset | null {
  const downloadAssets = getDownloadAssets(release, platform)
  if (!downloadAssets.length) return null

  const scoreAsset = (asset: ReleaseAsset) => {
    const name = asset.name.toLowerCase()

    if (platform === 'windows') {
      if (name.endsWith('.exe') && name.includes('setup')) return 100
      if (name.endsWith('.exe') && !name.includes('portable')) return 90
      if (name.endsWith('.msi')) return 80
      if (name.endsWith('.exe')) return 70
      if (name.endsWith('.zip')) return 50
      return 0
    }

    if (name.includes('universal') && name.endsWith('.dmg')) return 100
    if ((name.includes('arm64') || name.includes('aarch64')) && name.endsWith('.dmg')) return 90
    if (name.endsWith('.dmg')) return 80
    if (name.endsWith('.pkg')) return 70
    if (name.endsWith('.zip')) return 50
    return 0
  }

  return [...downloadAssets].sort((left, right) => scoreAsset(right) - scoreAsset(left))[0] ?? null
}

export function isReleasesPayload(value: unknown): value is ReleasesPayload {
  if (!value || typeof value !== 'object') return false

  const data = value as Partial<ReleasesPayload>
  return (
    typeof data.fetchedAt === 'string' &&
    !!data.latest &&
    !!data.latestBeta &&
    !!data.releases &&
    Array.isArray(data.releases.windows) &&
    Array.isArray(data.releases.mac)
  )
}
