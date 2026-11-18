/** The published Windows artifacts supported by the site. */
export type ReleaseSource = 'github' | 'gitcode'
export type ReleaseRegion = 'cn' | 'international'
export type AssetKind = 'installer' | 'msi' | 'portable'
export type ReleaseCategory = 'stable' | 'beta' | 'preview'

export interface ReleaseAsset {
  name: string
  size: number | null
  url: string
  kind: AssetKind
  source: ReleaseSource
}

export interface Release {
  tag: string
  title: string
  version: string
  channel: string | null
  channelNumber: number | null
  publishedAt: string | null
  notes: string
  url: string
  source: ReleaseSource
  assets: ReleaseAsset[]
}

export interface SourceStatus {
  source: ReleaseSource
  status: 'ok' | 'stale' | 'error'
  reason?: 'network' | 'rate-limit' | 'invalid-response'
}

export interface ReleasesResult {
  releases: Release[]
  sources: SourceStatus[]
  fetchedAt: string
}

export interface ParsedVersion {
  version: string
  channel: string | null
  channelNumber: number | null
}

/** Supports beta-v0.3.0, v0.3.0-beta.0, and plain v0.3.0. */
export function parseReleaseVersion(tag: string): ParsedVersion | null {
  const match = tag.trim().match(/^(?:([a-z]+)-)?v?(\d+\.\d+\.\d+)(?:-([a-z]+)(?:\.(\d+))?)?$/i)
  if (!match || (match[1] && match[3])) return null
  return {
    version: match[2],
    channel: (match[1] || match[3] || '').toLowerCase() || null,
    channelNumber: match[4] !== undefined ? Number(match[4]) : null,
  }
}

/** Classify recognized stable and beta names; unknown prerelease names stay in preview. */
export function getReleaseCategory(channel: string | null): ReleaseCategory {
  const normalized = channel?.trim().toLowerCase() ?? ''
  if (!normalized || ['stable', 'release', 'final', 'ga'].includes(normalized)) return 'stable'
  if (['beta', 'test', 'testing'].includes(normalized)) return 'beta'
  return 'preview'
}

/** Source archives and auxiliary release files are not application downloads. */
export function classifyReleaseAsset(name: string, type?: string): AssetKind | null {
  const lower = name.toLowerCase()
  if (type === 'source' || !lower.includes('astrabrew')) return null
  if (lower.endsWith('.msi')) return 'msi'
  if (lower.endsWith('.exe')) return lower.includes('portable') ? 'portable' : 'installer'
  if (lower.endsWith('.zip')) return 'portable'
  return null
}

export function compareReleases(a: Release, b: Release): number {
  const av = a.version.split('.').map(Number)
  const bv = b.version.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    if (av[i] !== bv[i]) return bv[i] - av[i]
  }
  const aStable = getReleaseCategory(a.channel) === 'stable'
  const bStable = getReleaseCategory(b.channel) === 'stable'
  if (aStable !== bStable) return aStable ? -1 : 1
  if (a.channel !== b.channel) {
    const rank: Record<string, number> = { alpha: 0, preview: 0, beta: 1, test: 1, testing: 1, rc: 2 }
    const delta = (rank[b.channel ?? ''] ?? -1) - (rank[a.channel ?? ''] ?? -1)
    if (delta) return delta
    return (b.channel ?? '').localeCompare(a.channel ?? '')
  }
  return (b.channelNumber ?? 0) - (a.channelNumber ?? 0)
}

/** Pick the highest stable version independently of newer prerelease channels. */
export function getLatestStableRelease(releases: Release[]): Release | undefined {
  return releases.filter((release) => getReleaseCategory(release.channel) === 'stable').sort(compareReleases)[0]
}
