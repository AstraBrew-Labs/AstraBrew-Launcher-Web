import 'server-only'

import { unstable_cache } from 'next/cache'
import type {
  ReleaseAsset,
  ReleaseInfo,
  ReleasePlatform,
  ReleasesPayload,
} from '@/lib/releases'

const RELEASE_CACHE_SECONDS = 24 * 60 * 60
const RELEASES_PER_PAGE = 100
const MAX_RELEASE_PAGES = 10
const GITHUB_PROXY_PREFIX = 'https://gh-proxy.org/'

const REPOSITORIES: Record<ReleasePlatform, string> = {
  mac: 'AstraBrew-Labs/AstraBrew-Launcher-Mac',
  windows: 'AstraBrew-Labs/AstraBrew-Launcher-Win',
}

interface GitHubAsset {
  id: number
  name: string
  size: number
  content_type: string
  browser_download_url: string
}

interface GitHubRelease {
  id: number
  tag_name: string
  name: string | null
  body: string | null
  html_url: string
  published_at: string | null
  created_at: string
  draft: boolean
  assets: GitHubAsset[]
}

export class ReleaseApiError extends Error {
  constructor(
    message: string,
    readonly kind: 'api' | 'network',
  ) {
    super(message)
    this.name = 'ReleaseApiError'
  }
}

function githubHeaders(includeToken = true): HeadersInit {
  const token = process.env.GITHUB_TOKEN

  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(includeToken && token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function withGitHubProxy(url: string, proxyEnabled: boolean): string {
  return proxyEnabled ? `${GITHUB_PROXY_PREFIX}${url}` : url
}

async function fetchGitHubPage(url: string, proxyEnabled: boolean): Promise<Response> {
  const requestUrl = withGitHubProxy(url, proxyEnabled)
  const response = await fetch(requestUrl, {
    headers: githubHeaders(!proxyEnabled),
    cache: 'no-store',
    signal: AbortSignal.timeout(12_000),
  })

  if (proxyEnabled && (response.status === 403 || response.status === 429)) {
    return fetchGitHubPage(url, false)
  }

  if (!proxyEnabled && process.env.GITHUB_TOKEN && (response.status === 401 || response.status === 403)) {
    return fetch(requestUrl, {
      headers: githubHeaders(false),
      cache: 'no-store',
      signal: AbortSignal.timeout(12_000),
    })
  }

  return response
}

function releaseNotes(body: string | null, title: string): string[] {
  const lines = (body ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line
      .replace(/^#{1,6}\s+/, '')
      .replace(/^[-*+]\s+/, '')
      .replace(/^\d+[.)]\s+/, '')
      .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
      .replace(/[`*_~]/g, '')
      .trim())
    .filter((line) => line.length > 2 && !line.startsWith('<!--'))

  return (lines.length ? lines : [title]).slice(0, 6)
}

function normalizeRelease(
  platform: ReleasePlatform,
  release: GitHubRelease,
  proxyEnabled: boolean,
): ReleaseInfo {
  const title = release.name?.trim() || release.tag_name
  const isBeta = /beta/i.test(release.tag_name) || /beta/i.test(release.name ?? '')
  const assets: ReleaseAsset[] = release.assets.map((asset) => ({
    id: asset.id,
    name: asset.name,
    size: asset.size,
    contentType: asset.content_type,
    downloadUrl: withGitHubProxy(asset.browser_download_url, proxyEnabled),
  }))

  return {
    id: release.id,
    platform,
    version: release.tag_name,
    title,
    publishedAt: release.published_at ?? release.created_at,
    isBeta,
    htmlUrl: release.html_url,
    notes: releaseNotes(release.body, title),
    assets,
  }
}

async function fetchRepositoryReleases(
  platform: ReleasePlatform,
  proxyEnabled: boolean,
): Promise<ReleaseInfo[]> {
  const releases: GitHubRelease[] = []

  try {
    for (let page = 1; page <= MAX_RELEASE_PAGES; page += 1) {
      const repository = REPOSITORIES[platform]
      const response = await fetchGitHubPage(
        `https://api.github.com/repos/${repository}/releases?per_page=${RELEASES_PER_PAGE}&page=${page}`,
        proxyEnabled,
      )

      if (!response.ok) {
        const rateLimited = response.status === 403 || response.status === 429
        throw new ReleaseApiError(
          rateLimited
            ? proxyEnabled
              ? '国内加速节点请求额度受限，请稍后重试。'
              : 'GitHub API 请求额度受限，请稍后重试或检查 GITHUB_TOKEN。'
            : `GitHub API 请求失败（${response.status}）。`,
          'api',
        )
      }

      const pageReleases = await response.json() as GitHubRelease[]
      releases.push(...pageReleases)

      if (pageReleases.length < RELEASES_PER_PAGE) break
    }
  } catch (error) {
    if (error instanceof ReleaseApiError) throw error
    throw new ReleaseApiError('无法连接 GitHub API，请检查服务器网络。', 'network')
  }

  return releases
    .filter((release) => !release.draft)
    .map((release) => normalizeRelease(platform, release, proxyEnabled))
}

async function fetchReleasePayload(proxyEnabled: boolean): Promise<ReleasesPayload> {
  const [windows, mac] = await Promise.all([
    fetchRepositoryReleases('windows', proxyEnabled),
    fetchRepositoryReleases('mac', proxyEnabled),
  ])

  return {
    fetchedAt: new Date().toISOString(),
    ttlSeconds: RELEASE_CACHE_SECONDS,
    latest: {
      windows: windows.find((release) => !release.isBeta) ?? null,
      mac: mac.find((release) => !release.isBeta) ?? null,
    },
    latestBeta: {
      windows: windows.find((release) => release.isBeta) ?? null,
      mac: mac.find((release) => release.isBeta) ?? null,
    },
    releases: { windows, mac },
  }
}

const getDirectReleasePayload = unstable_cache(
  () => fetchReleasePayload(false),
  ['astrabrew-github-releases-v3'],
  { revalidate: RELEASE_CACHE_SECONDS, tags: ['astrabrew-releases'] },
)

const getProxyReleasePayload = unstable_cache(
  () => fetchReleasePayload(true),
  ['astrabrew-github-releases-proxy-v3'],
  { revalidate: RELEASE_CACHE_SECONDS, tags: ['astrabrew-releases-proxy'] },
)

export function getCachedReleasePayload(proxyEnabled = false): Promise<ReleasesPayload> {
  return proxyEnabled ? getProxyReleasePayload() : getDirectReleasePayload()
}
