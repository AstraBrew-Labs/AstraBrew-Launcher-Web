'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { localizedPath, withoutLanguage, type SiteLanguage } from '@/lib/site-i18n'
import {
  GITHUB_PROXY_PREFERENCE_KEY,
  LEGACY_GITHUB_PROXY_PREFERENCE_KEY,
  resolveInitialGitHubProxyEnabled,
} from '@/lib/github-proxy'

export type { SiteLanguage } from '@/lib/site-i18n'
export type SiteTheme = 'light' | 'dark'

const THEME_KEY = 'astrabrew:site-theme:v1'

interface SitePreferencesValue {
  ready: boolean
  language: SiteLanguage
  theme: SiteTheme
  githubProxyEnabled: boolean
  setLanguage: (language: SiteLanguage) => void
  setTheme: (theme: SiteTheme) => void
  toggleTheme: () => void
  setGithubProxyEnabled: (enabled: boolean) => void
  toggleGithubProxy: () => void
  t: (zh: string, en: string) => string
}

const SitePreferencesContext = createContext<SitePreferencesValue | null>(null)

function applyLanguage(language: SiteLanguage) {
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'
  document.documentElement.dataset.language = language
}

function applyTheme(theme: SiteTheme) {
  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(theme)
  document.documentElement.dataset.theme = theme
}

function applyGithubProxy(enabled: boolean) {
  document.documentElement.dataset.githubProxy = enabled ? 'enabled' : 'disabled'
}

export function SitePreferencesProvider({
  children,
  language: routeLanguage,
}: {
  children: ReactNode
  language: SiteLanguage
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [language, setLanguageState] = useState<SiteLanguage>(routeLanguage)
  const [theme, setThemeState] = useState<SiteTheme>('dark')
  const [githubProxyEnabled, setGithubProxyEnabledState] = useState(routeLanguage === 'zh')
  const githubProxyEnabledRef = useRef(routeLanguage === 'zh')
  const githubProxyManuallySetRef = useRef(false)

  useEffect(() => {
    setLanguageState(routeLanguage)
    applyLanguage(routeLanguage)
    setThemeState(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')

    let savedProxyPreference: string | null = null
    try {
      savedProxyPreference = window.localStorage.getItem(GITHUB_PROXY_PREFERENCE_KEY)
      if (!savedProxyPreference) {
        savedProxyPreference = window.localStorage.getItem(LEGACY_GITHUB_PROXY_PREFERENCE_KEY)
        if (savedProxyPreference === 'on' || savedProxyPreference === 'off') {
          window.localStorage.setItem(GITHUB_PROXY_PREFERENCE_KEY, savedProxyPreference)
        }
      }
    } catch {
      // The route language remains a usable default when storage is unavailable.
    }

    const hasSavedProxyPreference = savedProxyPreference === 'on' || savedProxyPreference === 'off'
    if (hasSavedProxyPreference) githubProxyManuallySetRef.current = true
    const resolvedProxyEnabled = hasSavedProxyPreference
      ? savedProxyPreference === 'on'
      : githubProxyManuallySetRef.current
        ? githubProxyEnabledRef.current
        : resolveInitialGitHubProxyEnabled(null, routeLanguage)
    githubProxyEnabledRef.current = resolvedProxyEnabled
    setGithubProxyEnabledState(resolvedProxyEnabled)
    applyGithubProxy(resolvedProxyEnabled)
    setReady(true)
  }, [routeLanguage])

  const setLanguage = useCallback((nextLanguage: SiteLanguage) => {
    if (nextLanguage === language) return
    router.push(localizedPath(nextLanguage, withoutLanguage(pathname)))
  }, [language, pathname, router])

  const setTheme = useCallback((nextTheme: SiteTheme) => {
    setThemeState(nextTheme)
    applyTheme(nextTheme)
    try {
      window.localStorage.setItem(THEME_KEY, nextTheme)
    } catch {
      // The selection still applies for the current page when storage is unavailable.
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [setTheme, theme])

  const setGithubProxyEnabled = useCallback((enabled: boolean) => {
    githubProxyManuallySetRef.current = true
    githubProxyEnabledRef.current = enabled
    setGithubProxyEnabledState(enabled)
    applyGithubProxy(enabled)
    try {
      window.localStorage.setItem(GITHUB_PROXY_PREFERENCE_KEY, enabled ? 'on' : 'off')
    } catch {
      // The selection still applies for the current page when storage is unavailable.
    }
  }, [])

  const toggleGithubProxy = useCallback(() => {
    setGithubProxyEnabled(!githubProxyEnabled)
  }, [githubProxyEnabled, setGithubProxyEnabled])

  const t = useCallback(
    (zh: string, en: string) => language === 'zh' ? zh : en,
    [language],
  )

  const preferencesReady = ready && language === routeLanguage
  const value = useMemo<SitePreferencesValue>(() => ({
    ready: preferencesReady,
    language,
    theme,
    githubProxyEnabled,
    setLanguage,
    setTheme,
    toggleTheme,
    setGithubProxyEnabled,
    toggleGithubProxy,
    t,
  }), [
    githubProxyEnabled,
    language,
    preferencesReady,
    setGithubProxyEnabled,
    setLanguage,
    setTheme,
    t,
    theme,
    toggleGithubProxy,
    toggleTheme,
  ])

  return (
    <SitePreferencesContext.Provider value={value}>
      {children}
    </SitePreferencesContext.Provider>
  )
}

export function useSitePreferences(): SitePreferencesValue {
  const value = useContext(SitePreferencesContext)
  if (!value) throw new Error('useSitePreferences must be used inside SitePreferencesProvider')
  return value
}
