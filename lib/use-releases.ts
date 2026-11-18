'use client'
import { useSyncExternalStore } from 'react'
import type { ReleaseRegion } from './releases'
import { releaseStore } from './release-store'

export function useReleases(region: ReleaseRegion) {
  const store = releaseStore(region)
  return { ...useSyncExternalStore(store.subscribe, store.snapshot, store.serverSnapshot), refresh: () => store.sync(true) }
}
