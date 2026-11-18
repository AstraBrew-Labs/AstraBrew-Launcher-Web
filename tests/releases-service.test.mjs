import { afterAll, describe, expect, mock, test } from 'bun:test'

mock.module('server-only', () => ({}))
const { getWindowsReleases } = await import('../lib/releases.server.ts')
const originalFetch = globalThis.fetch
const file = (source, tag, name, type = 'attach') => ({
  name, type, size: 123,
  browser_download_url: `https://${source}.com/AstraBrew-Labs/AstraBrew-Launcher-Win/releases/download/${tag}/${name}`,
})
const release = (tag, assets) => ({ tag_name: tag, name: tag, created_at: '2026-01-01T00:00:00Z', assets })

afterAll(() => { globalThis.fetch = originalFetch })

describe('release mirrors', () => {
  test('prefers the regional mirror and fills missing assets and versions from the other source', async () => {
    const tag = 'beta-v0.3.0'
    const exe = 'AstraBrewLauncher-0.3.0-Beta.0-win-x64-setup.exe'
    const zip = 'AstraBrewLauncher-0.3.0-Beta.0-win-x64.zip'
    globalThis.fetch = async (url) => {
      const github = String(url).includes('api.github.com')
      return Response.json(github
        ? [release(tag, [file('github', tag, exe), file('github', tag, zip)]), release('beta-v0.0.5', [file('github', 'beta-v0.0.5', 'AstraBrew-0.0.5-setup.exe')])]
        : [release(tag, [file('gitcode', tag, exe), file('gitcode', tag, 'beta-v0.3.0.zip', 'source')])])
    }
    const china = await getWindowsReleases('cn')
    expect(china.releases).toHaveLength(2)
    expect(china.releases[0].source).toBe('gitcode')
    expect(china.releases[0].assets.map((asset) => [asset.name, asset.source])).toEqual([[exe, 'gitcode'], [zip, 'github']])
    expect(china.releases[1].source).toBe('github')
    const international = await getWindowsReleases('international')
    expect(international.releases[0].assets[0].source).toBe('github')
    expect(international.sources.every((source) => source.status === 'ok')).toBe(true)
  })
})

describe('release source failures', () => {
  test('uses the other source when a mirror is rate limited', async () => {
    const { getWindowsReleases: getFresh } = await import('../lib/releases.server.ts?single-failure')
    globalThis.fetch = async (url) => String(url).includes('api.gitcode.com')
      ? new Response('', { status: 429 })
      : Response.json([release('beta-v0.0.5', [file('github', 'beta-v0.0.5', 'AstraBrew-0.0.5-setup.exe')])])
    const result = await getFresh('cn')
    expect(result.sources.map((source) => source.status)).toEqual(['error', 'ok'])
    expect(result.sources[0].reason).toBe('rate-limit')
    expect(result.releases[0].source).toBe('github')
  })

  test('reports both sources failing without inventing releases', async () => {
    const { getWindowsReleases: getFresh } = await import('../lib/releases.server.ts?both-failure')
    globalThis.fetch = async () => { throw new Error('offline') }
    const result = await getFresh('international')
    expect(result.releases).toEqual([])
    expect(result.sources.map((source) => source.status)).toEqual(['error', 'error'])
  })
})
