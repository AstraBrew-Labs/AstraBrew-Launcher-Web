import { describe, expect, test } from 'bun:test'
import { classifyReleaseAsset, compareReleases, getLatestStableRelease, getReleaseCategory, parseReleaseVersion } from '../lib/releases.ts'

describe('Windows release parsing', () => {
  test('accepts both tag conventions and rejects unrelated tags', () => {
    expect(parseReleaseVersion('Beta-v0.3.0')).toEqual({ version: '0.3.0', channel: 'beta', channelNumber: null })
    expect(parseReleaseVersion('v0.3.0-Beta.0')).toEqual({ version: '0.3.0', channel: 'beta', channelNumber: 0 })
    expect(parseReleaseVersion('v1.0.0')).toEqual({ version: '1.0.0', channel: null, channelNumber: null })
    expect(parseReleaseVersion('release-2026')).toBeNull()
  })

  test('classifies stable, test, and preview channels from both tag formats', () => {
    const category = (tag) => getReleaseCategory(parseReleaseVersion(tag).channel)
    expect(category('v1.0.0')).toBe('stable')
    expect(category('Release-v1.0.0')).toBe('stable')
    expect(category('v1.0.0-Stable')).toBe('stable')
    expect(category('Beta-v1.0.0')).toBe('beta')
    expect(category('v1.0.0-Beta.2')).toBe('beta')
    expect(category('Preview-v1.0.0')).toBe('preview')
    expect(category('v1.0.0-RC.1')).toBe('preview')
    expect(category('v1.0.0-custom.1')).toBe('preview')
  })

  test('selects only the latest stable release for the pinned spot', () => {
    const releases = [{ version: '2.0.0', channel: 'beta' }, { version: '1.0.0', channel: null }, { version: '1.2.0', channel: 'stable' }]
    expect(getLatestStableRelease(releases)?.version).toBe('1.2.0')
    expect(getLatestStableRelease([releases[0]])).toBeUndefined()
    expect(getLatestStableRelease([])).toBeUndefined()
  })

  test('recognizes historical artifacts and excludes source and metadata', () => {
    expect(classifyReleaseAsset('AstraBrewLauncher-0.3.0-Beta.0-win-x64-setup.exe')).toBe('installer')
    expect(classifyReleaseAsset('AstraBrewLauncher-0.3.0-Beta.0-win-x64.msi')).toBe('msi')
    expect(classifyReleaseAsset('AstraBrew.Launcher_0.0.5-beta_x64_portable.zip')).toBe('portable')
    expect(classifyReleaseAsset('beta-v0.3.0.zip', 'source')).toBeNull()
    expect(classifyReleaseAsset('SHA256SUMS.txt')).toBeNull()
  })

  test('orders numeric versions and prereleases correctly', () => {
    const release = (version, channel, channelNumber = null) => ({ version, channel, channelNumber })
    const sorted = [release('0.3.0', 'beta', 1), release('0.10.0', 'beta'), release('0.3.0', null), release('0.3.0', 'beta', 2)].sort(compareReleases)
    expect(sorted.map((item) => [item.version, item.channel, item.channelNumber])).toEqual([
      ['0.10.0', 'beta', null], ['0.3.0', null, null], ['0.3.0', 'beta', 2], ['0.3.0', 'beta', 1],
    ])
    const sameVersion = [release('1.0.0', 'preview'), release('1.0.0', 'beta'), release('1.0.0', 'stable')].sort(compareReleases)
    expect(sameVersion.map((item) => item.channel)).toEqual(['stable', 'beta', 'preview'])
    const stages = [release('1.0.0', 'beta'), release('1.0.0', 'rc'), release('1.0.0', 'alpha'), release('1.0.0', null)].sort(compareReleases)
    expect(stages.map((item) => item.channel)).toEqual([null, 'rc', 'beta', 'alpha'])
  })
})
