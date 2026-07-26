'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  isReleaseCacheFresh,
  isReleasesPayload,
  type ReleasesPayload,
} from '@/lib/releases'

type ReleaseMode = 'direct' | 'proxy'

const RELEASE_CACHE_KEYS: Record<ReleaseMode, string> = {
  direct: 'astrabrew:releases:v3',
  proxy: 'astrabrew:releases:proxy:v3',
}

const memoryData: Record<ReleaseMode, ReleasesPayload | null> = {
  direct: null,
  proxy: null,
}

const pendingRequests: Record<ReleaseMode, Promise<ReleasesPayload> | null> = {
  direct: null,
  proxy: null,
}

interface ReleaseState {
  mode: ReleaseMode
  data: ReleasesPayload | null
  error: string | null
  isLoading: boolean
  isRefreshing: boolean
  isUsingFallback: boolean
}

interface UseReleasesOptions {
  enabled?: boolean
  proxyEnabled?: boolean
}

function readCachedData(mode: ReleaseMode): ReleasesPayload | null {
  if (memoryData[mode]) return memoryData[mode]
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(RELEASE_CACHE_KEYS[mode])
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    if (!isReleasesPayload(parsed)) {
      window.localStorage.removeItem(RELEASE_CACHE_KEYS[mode])
      return null
    }

    memoryData[mode] = parsed
    return parsed
  } catch {
    try {
      window.localStorage.removeItem(RELEASE_CACHE_KEYS[mode])
    } catch {
      // Storage may be fully disabled in privacy mode.
    }
    return null
  }
}

function writeCachedData(mode: ReleaseMode, data: ReleasesPayload) {
  memoryData[mode] = data
  try {
    window.localStorage.setItem(RELEASE_CACHE_KEYS[mode], JSON.stringify(data))
  } catch {
    // Memory cache still prevents duplicate requests when storage is unavailable.
  }
}

async function requestReleaseData(mode: ReleaseMode): Promise<ReleasesPayload> {
  if (!pendingRequests[mode]) {
    pendingRequests[mode] = fetch(mode === 'proxy' ? '/api/releases?proxy=1' : '/api/releases', {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(30_000),
    })
      .then(async (response) => {
        const payload: unknown = await response.json()

        if (!response.ok) {
          const message = payload && typeof payload === 'object' && 'error' in payload
            ? String(payload.error)
            : `发布信息接口请求失败（${response.status}）。`
          throw new Error(message)
        }

        if (!isReleasesPayload(payload)) throw new Error('发布信息接口返回了无效数据。')
        return payload
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'TimeoutError') {
          throw new Error('请求超时，请检查网络后重试。')
        }
        if (error instanceof TypeError) throw new Error('网络错误，无法获取发布信息。')
        if (error instanceof Error) throw error
        throw new Error('网络错误，无法获取发布信息。')
      })
      .finally(() => {
        pendingRequests[mode] = null
      })
  }

  return pendingRequests[mode]
}

export function useReleases({ enabled = true, proxyEnabled = false }: UseReleasesOptions = {}) {
  const mode: ReleaseMode = proxyEnabled ? 'proxy' : 'direct'
  const initialData = memoryData[mode]
  const [state, setState] = useState<ReleaseState>({
    mode,
    data: initialData,
    error: null,
    isLoading: enabled && !initialData,
    isRefreshing: false,
    isUsingFallback: false,
  })
  const mountedRef = useRef(false)
  const modeRef = useRef(mode)
  modeRef.current = mode

  const refresh = useCallback(async (
    requestMode: ReleaseMode,
    fallbackData: ReleasesPayload | null = readCachedData(requestMode),
  ) => {
    if (modeRef.current !== requestMode) return

    setState((current) => ({
      mode: requestMode,
      data: current.mode === requestMode ? current.data ?? fallbackData : fallbackData,
      error: null,
      isLoading: !(current.mode === requestMode ? current.data : null) && !fallbackData,
      isRefreshing: !!((current.mode === requestMode ? current.data : null) ?? fallbackData),
      isUsingFallback: false,
    }))

    try {
      const data = await requestReleaseData(requestMode)
      writeCachedData(requestMode, data)

      if (mountedRef.current && modeRef.current === requestMode) {
        setState({
          mode: requestMode,
          data,
          error: null,
          isLoading: false,
          isRefreshing: false,
          isUsingFallback: false,
        })
      }
    } catch (error) {
      if (!mountedRef.current || modeRef.current !== requestMode) return

      const message = error instanceof Error ? error.message : '无法获取发布信息。'
      setState((current) => ({
        mode: requestMode,
        data: current.mode === requestMode ? current.data ?? fallbackData : fallbackData,
        error: message,
        isLoading: false,
        isRefreshing: false,
        isUsingFallback: !!((current.mode === requestMode ? current.data : null) ?? fallbackData),
      }))
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      setState({
        mode,
        data: readCachedData(mode),
        error: null,
        isLoading: false,
        isRefreshing: false,
        isUsingFallback: false,
      })
      return
    }

    const cachedData = readCachedData(mode)
    setState({
      mode,
      data: cachedData,
      error: null,
      isLoading: !cachedData,
      isRefreshing: false,
      isUsingFallback: false,
    })

    if (!cachedData || !isReleaseCacheFresh(cachedData)) void refresh(mode, cachedData)
  }, [enabled, mode, refresh])

  const currentState: ReleaseState = state.mode === mode
    ? state
    : {
        mode,
        data: memoryData[mode],
        error: null,
        isLoading: enabled && !memoryData[mode],
        isRefreshing: false,
        isUsingFallback: false,
      }
  const reload = useCallback(
    () => refresh(mode, currentState.data ?? readCachedData(mode)),
    [currentState.data, mode, refresh],
  )

  return { ...currentState, reload }
}
