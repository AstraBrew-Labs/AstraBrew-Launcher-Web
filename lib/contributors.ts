export const CONTRIBUTOR_CACHE_TTL_MS = 24 * 60 * 60 * 1000

export type ContributorPlatform = 'windows' | 'mac'

export interface ContributorInfo {
  id: number
  login: string
  avatarUrl: string
  profileUrl: string
  contributions: Record<ContributorPlatform, number>
  totalContributions: number
  platforms: ContributorPlatform[]
}

export interface ContributorsPayload {
  fetchedAt: string
  ttlSeconds: number
  contributors: ContributorInfo[]
}

export function isContributorCacheFresh(data: ContributorsPayload): boolean {
  const fetchedAt = Date.parse(data.fetchedAt)
  return Number.isFinite(fetchedAt) && Date.now() - fetchedAt < CONTRIBUTOR_CACHE_TTL_MS
}

function isContributor(value: unknown): value is ContributorInfo {
  if (!value || typeof value !== 'object') return false

  const contributor = value as Partial<ContributorInfo>
  return (
    typeof contributor.id === 'number' &&
    typeof contributor.login === 'string' &&
    typeof contributor.avatarUrl === 'string' &&
    typeof contributor.profileUrl === 'string' &&
    typeof contributor.totalContributions === 'number' &&
    !!contributor.contributions &&
    typeof contributor.contributions.windows === 'number' &&
    typeof contributor.contributions.mac === 'number' &&
    Array.isArray(contributor.platforms) &&
    contributor.platforms.every((platform) => platform === 'windows' || platform === 'mac')
  )
}

export function isContributorsPayload(value: unknown): value is ContributorsPayload {
  if (!value || typeof value !== 'object') return false

  const payload = value as Partial<ContributorsPayload>
  return (
    typeof payload.fetchedAt === 'string' &&
    typeof payload.ttlSeconds === 'number' &&
    Array.isArray(payload.contributors) &&
    payload.contributors.every(isContributor)
  )
}
