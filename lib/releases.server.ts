import 'server-only'
import {
  classifyReleaseAsset,
  compareReleases,
  parseReleaseVersion,
  type Release,
  type ReleaseAsset,
  type ReleaseRegion,
  type ReleaseSource,
  type ReleasesResult,
  type SourceStatus,
} from './releases'

const ENDPOINTS: Record<ReleaseSource, string> = {
  github: 'https://api.github.com/repos/AstraBrew-Labs/AstraBrew-Launcher-Win/releases',
  gitcode: 'https://api.gitcode.com/api/v5/repos/AstraBrew-Labs/AstraBrew-Launcher-Win/releases',
}
const REPOSITORIES: Record<ReleaseSource, string> = {
  github: 'https://github.com/AstraBrew-Labs/AstraBrew-Launcher-Win',
  gitcode: 'https://gitcode.com/AstraBrew-Labs/AstraBrew-Launcher-Win',
}
const CACHE_MS = 5 * 60_000
const RETRY_MS = 30_000
const MAX_STALE_MS = 24 * 60 * 60_000
const MAX_PAGES = 10
const PAGE_SIZE = 100

type JsonObject = Record<string, unknown>
type SourceResult = { releases: Release[]; status: SourceStatus }
type CacheEntry = { result: SourceResult; expires: number; lastSuccess?: number; inflight?: Promise<SourceResult> }
const cache = new Map<ReleaseSource, CacheEntry>()

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function safeDownloadUrl(value: unknown, source: ReleaseSource): string | null {
  const url = text(value)
  try {
    const parsed = new URL(url)
    const expectedHost = source === 'github' ? 'github.com' : 'gitcode.com'
    const expectedPath = '/astrabrew-labs/astrabrew-launcher-win/releases/download/'
    return parsed.protocol === 'https:' && parsed.hostname === expectedHost && parsed.pathname.toLowerCase().startsWith(expectedPath)
      ? parsed.href : null
  } catch {
    return null
  }
}

function normalizeAsset(value: unknown, source: ReleaseSource): ReleaseAsset | null {
  if (!isObject(value)) return null
  const name = text(value.name)
  const kind = classifyReleaseAsset(name, text(value.type))
  const url = safeDownloadUrl(value.browser_download_url, source)
  if (!kind || !url) return null
  return {
    name,
    kind,
    url,
    size: typeof value.size === 'number' && Number.isFinite(value.size) && value.size >= 0 ? value.size : null,
    source,
  }
}

function normalizeRelease(value: unknown, source: ReleaseSource): Release | null {
  if (!isObject(value) || value.draft === true) return null
  const tag = text(value.tag_name)
  const parsed = parseReleaseVersion(tag)
  if (!parsed) return null
  const assets = (Array.isArray(value.assets) ? value.assets : [])
    .map((asset) => normalizeAsset(asset, source))
    .filter((asset): asset is ReleaseAsset => asset !== null)
  return {
    ...parsed,
    tag,
    title: text(value.name).trim() || tag,
    publishedAt: text(value.published_at) || text(value.created_at) || null,
    notes: text(value.body),
    url: `${REPOSITORIES[source]}/releases/tag/${encodeURIComponent(tag)}`,
    source,
    assets,
  }
}

async function loadSource(source: ReleaseSource): Promise<Release[]> {
  const releases: Release[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = new URL(ENDPOINTS[source])
    url.searchParams.set('per_page', String(PAGE_SIZE))
    url.searchParams.set('page', String(page))
    const response = await fetch(url, {
      headers: { Accept: 'application/json', ...(source === 'github' ? { 'User-Agent': 'AstraBrew-Launcher-Website' } : {}) },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) throw new SourceError(response.status === 403 || response.status === 429 ? 'rate-limit' : 'network')
    let body: unknown
    try { body = await response.json() } catch { throw new SourceError('invalid-response') }
    if (!Array.isArray(body)) throw new SourceError('invalid-response')
    releases.push(...body.map((item) => normalizeRelease(item, source)).filter((item): item is Release => item !== null))
    if (body.length < PAGE_SIZE) break
  }
  return releases
}

class SourceError extends Error {
  constructor(readonly reason: NonNullable<SourceStatus['reason']>) { super(reason) }
}

async function fetchSource(source: ReleaseSource, refresh: boolean): Promise<SourceResult> {
  const now = Date.now()
  const previous = cache.get(source)
  if (previous && previous.expires > now && (!refresh || previous.result.status.status !== 'ok' || now - (previous.lastSuccess ?? 0) < 10_000)) return previous.result
  if (previous?.inflight) return previous.inflight

  const inflight = (async (): Promise<SourceResult> => {
    try {
      const releases = await loadSource(source)
      const result: SourceResult = { releases, status: { source, status: 'ok' } }
      cache.set(source, { result, expires: Date.now() + CACHE_MS, lastSuccess: Date.now() })
      return result
    } catch (error) {
      const reason = error instanceof SourceError ? error.reason : 'network'
      const canUseStale = !!previous?.lastSuccess && Date.now() - previous.lastSuccess <= MAX_STALE_MS
      const result: SourceResult = {
        releases: canUseStale ? previous!.result.releases : [],
        status: { source, status: canUseStale ? 'stale' : 'error', reason },
      }
      cache.set(source, { result, expires: Date.now() + RETRY_MS, lastSuccess: previous?.lastSuccess })
      return result
    }
  })()
  cache.set(source, { result: previous?.result ?? { releases: [], status: { source, status: 'error' } }, expires: 0, lastSuccess: previous?.lastSuccess, inflight })
  return inflight
}

/** Merge equivalent tags and exact file names while keeping each download's true origin. */
function mergeReleases(primary: Release[], fallback: Release[]): Release[] {
  const releases = new Map<string, Release>()
  for (const release of [...primary, ...fallback]) {
    const key = `${release.version}|${release.channel ?? ''}|${release.channelNumber ?? 0}`
    const existing = releases.get(key)
    if (!existing) {
      releases.set(key, { ...release, assets: [...release.assets] })
      continue
    }
    const names = new Set(existing.assets.map((asset) => asset.name.toLowerCase()))
    for (const asset of release.assets) {
      if (!names.has(asset.name.toLowerCase())) {
        existing.assets.push(asset)
        names.add(asset.name.toLowerCase())
      }
    }
  }
  return [...releases.values()].sort(compareReleases)
}

/** The explicit region argument avoids sharing a user-specific result between requests. */
export async function getWindowsReleases(region: ReleaseRegion, refresh = false): Promise<ReleasesResult> {
  const preferred: ReleaseSource = region === 'cn' ? 'gitcode' : 'github'
  const fallback: ReleaseSource = preferred === 'gitcode' ? 'github' : 'gitcode'
  const [first, second] = await Promise.all([fetchSource(preferred, refresh), fetchSource(fallback, refresh)])
  return {
    releases: mergeReleases(first.releases, second.releases),
    sources: [first.status, second.status],
    fetchedAt: new Date().toISOString(),
  }
}
