import 'server-only'

import { unstable_cache } from 'next/cache'
import type {
  ContributorInfo,
  ContributorPlatform,
  ContributorsPayload,
} from '@/lib/contributors'

const CONTRIBUTOR_CACHE_SECONDS = 24 * 60 * 60
const CONTRIBUTORS_PER_PAGE = 100
const MAX_CONTRIBUTOR_PAGES = 10
const GITHUB_PROXY_PREFIX = 'https://gh-proxy.org/'

const REPOSITORIES: Record<ContributorPlatform, string> = {
  windows: 'AstraBrew-Labs/AstraBrew-Launcher-Win',
  mac: 'AstraBrew-Labs/AstraBrew-Launcher-Mac',
}

interface GitHubContributor {
  id: number
  login: string
  avatar_url: string
  html_url: string
  contributions: number
}

export class ContributorApiError extends Error {
  constructor(
    message: string,
    readonly kind: 'api' | 'network',
  ) {
    super(message)
    this.name = 'ContributorApiError'
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

async function fetchGitHubPage(url: string, proxyEnabled: boolean): Promise<Response> {
  const requestUrl = withGitHubProxy(url, proxyEnabled)
  const response = await fetch(requestUrl, {
    headers: githubHeaders(!proxyEnabled),
    cache: 'no-store',
  })

  if (proxyEnabled && (response.status === 403 || response.status === 429)) {
    return fetchGitHubPage(url, false)
  }

  if (!proxyEnabled && process.env.GITHUB_TOKEN && (response.status === 401 || response.status === 403)) {
    return fetch(requestUrl, {
      headers: githubHeaders(false),
      cache: 'no-store',
    })
  }

  return response
}

function withGitHubProxy(url: string, proxyEnabled: boolean): string {
  return proxyEnabled ? `${GITHUB_PROXY_PREFIX}${url}` : url
}

function isGitHubContributor(value: unknown): value is GitHubContributor {
  if (!value || typeof value !== 'object') return false

  const contributor = value as Partial<GitHubContributor>
  return (
    typeof contributor.id === 'number' &&
    typeof contributor.login === 'string' &&
    typeof contributor.avatar_url === 'string' &&
    typeof contributor.html_url === 'string' &&
    typeof contributor.contributions === 'number'
  )
}

async function fetchRepositoryContributors(
  platform: ContributorPlatform,
  proxyEnabled: boolean,
): Promise<GitHubContributor[]> {
  const contributors: GitHubContributor[] = []

  try {
    for (let page = 1; page <= MAX_CONTRIBUTOR_PAGES; page += 1) {
      const repository = REPOSITORIES[platform]
      const response = await fetchGitHubPage(
        `https://api.github.com/repos/${repository}/contributors?per_page=${CONTRIBUTORS_PER_PAGE}&page=${page}`,
        proxyEnabled,
      )

      if (!response.ok) {
        const rateLimited = response.status === 403 || response.status === 429
        throw new ContributorApiError(
          rateLimited
            ? proxyEnabled
              ? '国内加速节点请求额度受限，请稍后重试。'
              : 'GitHub API 请求额度受限，请稍后重试或检查 GITHUB_TOKEN。'
            : `GitHub 贡献者接口请求失败（${response.status}）。`,
          'api',
        )
      }

      const responseData: unknown = await response.json()
      if (!Array.isArray(responseData)) {
        throw new ContributorApiError('GitHub 贡献者接口返回了无效数据。', 'api')
      }

      const pageContributors = responseData.filter(isGitHubContributor)
      contributors.push(...pageContributors)

      if (responseData.length < CONTRIBUTORS_PER_PAGE) break
    }
  } catch (error) {
    if (error instanceof ContributorApiError) throw error
    throw new ContributorApiError('无法连接 GitHub 贡献者接口，请检查服务器网络。', 'network')
  }

  return contributors
}

function mergeContributors(
  platformContributors: Record<ContributorPlatform, GitHubContributor[]>,
  proxyEnabled: boolean,
): ContributorInfo[] {
  const merged = new Map<string, ContributorInfo>()

  for (const platform of ['windows', 'mac'] as const) {
    for (const contributor of platformContributors[platform]) {
      const key = Number.isFinite(contributor.id)
        ? `id:${contributor.id}`
        : `login:${contributor.login.toLowerCase()}`
      const current = merged.get(key) ?? {
        id: contributor.id,
        login: contributor.login,
        avatarUrl: withGitHubProxy(contributor.avatar_url, proxyEnabled),
        profileUrl: contributor.html_url,
        contributions: { windows: 0, mac: 0 },
        totalContributions: 0,
        platforms: [],
      }

      current.contributions[platform] += contributor.contributions
      current.totalContributions = current.contributions.windows + current.contributions.mac
      if (!current.platforms.includes(platform)) current.platforms.push(platform)
      merged.set(key, current)
    }
  }

  return [...merged.values()].sort((left, right) => (
    right.totalContributions - left.totalContributions || left.login.localeCompare(right.login)
  ))
}

async function fetchContributorPayload(proxyEnabled: boolean): Promise<ContributorsPayload> {
  const [windows, mac] = await Promise.all([
    fetchRepositoryContributors('windows', proxyEnabled),
    fetchRepositoryContributors('mac', proxyEnabled),
  ])

  return {
    fetchedAt: new Date().toISOString(),
    ttlSeconds: CONTRIBUTOR_CACHE_SECONDS,
    contributors: mergeContributors({ windows, mac }, proxyEnabled),
  }
}

const getDirectContributorPayload = unstable_cache(
  () => fetchContributorPayload(false),
  ['astrabrew-github-contributors-v2'],
  { revalidate: CONTRIBUTOR_CACHE_SECONDS, tags: ['astrabrew-contributors'] },
)

const getProxyContributorPayload = unstable_cache(
  () => fetchContributorPayload(true),
  ['astrabrew-github-contributors-proxy-v2'],
  { revalidate: CONTRIBUTOR_CACHE_SECONDS, tags: ['astrabrew-contributors-proxy'] },
)

export function getCachedContributorPayload(proxyEnabled = false): Promise<ContributorsPayload> {
  return proxyEnabled ? getProxyContributorPayload() : getDirectContributorPayload()
}
