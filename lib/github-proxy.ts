export const GITHUB_PROXY_PREFERENCE_KEY = 'astrabrew:github-proxy-preference:v1'
export const LEGACY_GITHUB_PROXY_PREFERENCE_KEY = 'astrabrew:download-proxy-preference:v1'

export function resolveInitialGitHubProxyEnabled(
  savedPreference: string | null,
  language: string,
): boolean {
  if (savedPreference === 'on') return true
  if (savedPreference === 'off') return false
  return language.toLowerCase().startsWith('zh')
}
