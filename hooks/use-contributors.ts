'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  isContributorCacheFresh,
  isContributorsPayload,
  type ContributorsPayload,
} from '@/lib/contributors'

type ContributorMode = 'direct' | 'proxy'

const CONTRIBUTOR_CACHE_KEYS: Record<ContributorMode, string> = {
  direct: 'astrabrew:contributors:v2',
  proxy: 'astrabrew:contributors:proxy:v2',
}

const memoryData: Record<ContributorMode, ContributorsPayload | null> = {
  direct: null,
  proxy: null,
}

const pendingRequests: Record<ContributorMode, Promise<ContributorsPayload> | null> = {
  direct: null,
  proxy: null,
}

interface ContributorState {
  mode: ContributorMode
  data: ContributorsPayload | null
  error: string | null
  isLoading: boolean
  isRefreshing: boolean
  isUsingFallback: boolean
}

interface UseContributorsOptions {
  enabled?: boolean
  proxyEnabled?: boolean
}

function readCachedData(mode: ContributorMode): ContributorsPayload | null {
  if (memoryData[mode]) return memoryData[mode]
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(CONTRIBUTOR_CACHE_KEYS[mode])
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    if (!isContributorsPayload(parsed)) {
      window.localStorage.removeItem(CONTRIBUTOR_CACHE_KEYS[mode])
      return null
    }

    memoryData[mode] = parsed
    return parsed
  } catch {
    try {
      window.localStorage.removeItem(CONTRIBUTOR_CACHE_KEYS[mode])
    } catch {
      // Storage may be unavailable in private browsing modes.
    }
    return null
  }
}

function writeCachedData(mode: ContributorMode, data: ContributorsPayload) {
  memoryData[mode] = data
  try {
    window.localStorage.setItem(CONTRIBUTOR_CACHE_KEYS[mode], JSON.stringify(data))
  } catch {
    // The in-memory cache still prevents duplicate requests in this tab.
  }
}

async function requestContributorData(mode: ContributorMode): Promise<ContributorsPayload> {
  if (!pendingRequests[mode]) {
    pendingRequests[mode] = fetch(mode === 'proxy' ? '/api/contributors?proxy=1' : '/api/contributors', {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
      .then(async (response) => {
        const payload: unknown = await response.json()

        if (!response.ok) {
          const message = payload && typeof payload === 'object' && 'error' in payload
            ? String(payload.error)
            : `贡献者接口请求失败（${response.status}）。`
          throw new Error(message)
        }

        if (!isContributorsPayload(payload)) throw new Error('贡献者接口返回了无效数据。')
        return payload
      })
      .catch((error: unknown) => {
        if (error instanceof TypeError) throw new Error('网络错误，无法获取贡献者信息。')
        if (error instanceof Error) throw error
        throw new Error('网络错误，无法获取贡献者信息。')
      })
      .finally(() => {
        pendingRequests[mode] = null
      })
  }

  return pendingRequests[mode]
}

export function useContributors({ enabled = true, proxyEnabled = false }: UseContributorsOptions = {}) {
  const mode: ContributorMode = proxyEnabled ? 'proxy' : 'direct'
  const initialData = memoryData[mode]
  const [state, setState] = useState<ContributorState>({
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
    requestMode: ContributorMode,
    fallbackData: ContributorsPayload | null = readCachedData(requestMode),
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
      const data = await requestContributorData(requestMode)
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

      const message = error instanceof Error ? error.message : '无法获取贡献者信息。'
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

    if (!cachedData || !isContributorCacheFresh(cachedData)) void refresh(mode, cachedData)
  }, [enabled, mode, refresh])

  const currentState: ContributorState = state.mode === mode
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
