import type { ReleaseRegion, ReleasesResult } from './releases'

export const RELEASE_TTL = 30 * 60_000
const RETRY = 60_000
const EMPTY = { data: null, syncing: false, failed: false } as Snapshot
interface Snapshot { data: ReleasesResult | null; syncing: boolean; failed: boolean }

// Storage can contain old schemas or partial writes. Never render unverified download links.
function validResult(value: ReleasesResult): boolean {
  const source = (s: string) => s === 'github' || s === 'gitcode'
  const url = (s: string, host: string, part: string) => typeof s === 'string' && s.toLowerCase().startsWith(`https://${host}.com/astrabrew-labs/astrabrew-launcher-win/releases/${part}/`)
  return value && Number.isFinite(Date.parse(value.fetchedAt)) && Array.isArray(value.sources) && value.sources.length === 2 &&
    value.sources.every(s => source(s.source) && ['ok','stale','error'].includes(s.status)) &&
    Array.isArray(value.releases) && value.releases.every(r => source(r.source) && url(r.url, r.source, 'tag') &&
      [r.tag,r.version,r.title,r.notes].every(s => typeof s === 'string') && (r.channel === null || typeof r.channel === 'string') &&
      Array.isArray(r.assets) && r.assets.every(a => source(a.source) && url(a.url, a.source, 'download') && typeof a.name === 'string' && ['installer','msi','portable'].includes(a.kind)))
}

export function createReleaseStore(region: ReleaseRegion) {
  const key = `astrabrew:releases:v1:${region}`
  const listeners = new Set<() => void>()
  let snapshot = EMPTY, expires = 0, read = false
  let pending: Promise<void> | undefined, timer: ReturnType<typeof setTimeout> | undefined
  const publish = (next: Snapshot) => { snapshot = next; listeners.forEach(fn => fn()) }
  function restore() {
    read = true
    try {
      const entry = JSON.parse(localStorage.getItem(key) ?? 'null')
      if (entry && Number.isFinite(entry.expires) && entry.expires <= Date.now() + RELEASE_TTL && validResult(entry.data)) {
        expires = entry.expires; publish({ data: entry.data, syncing: false, failed: false })
      }
    } catch { /* Storage unavailable or corrupt: continue in memory. */ }
  }
  function schedule() {
    clearTimeout(timer)
    if (listeners.size && !document.hidden) timer = setTimeout(() => void sync(), Math.max(0, expires - Date.now()))
  }
  function sync(force = false): Promise<void> {
    if (!read) restore()
    if (pending) return pending
    if (!force && Date.now() < expires) { schedule(); return Promise.resolve() }
    publish({ ...snapshot, syncing: true })
    pending = Promise.resolve().then(async () => {
      const response = await fetch(`/api/releases?region=${region}${force ? '&refresh=1' : ''}`, { cache: 'no-store', signal: AbortSignal.timeout(12000) })
      if (!response.ok) throw new Error('Release sync failed')
      const data: ReleasesResult = await response.json()
      if (!validResult(data) || data.sources.every(s => s.status === 'error')) throw new Error('No usable release source')
      expires = Date.now() + (data.sources.every(s => s.status === 'ok') ? RELEASE_TTL : RETRY)
      try { localStorage.setItem(key, JSON.stringify({ data, expires })) } catch { /* quota/private mode */ }
      publish({ data, syncing: false, failed: false })
    }).catch(() => {
      expires = Date.now() + RETRY
      publish({ ...snapshot, syncing: false, failed: true })
    }).finally(() => { pending = undefined; schedule() })
    return pending
  }
  const resume = () => { if (!document.hidden) void sync(); else clearTimeout(timer) }
  const storage = (e: StorageEvent) => { if (e.key === key && !pending) { restore(); resume() } }
  function subscribe(fn: () => void) {
    listeners.add(fn)
    if (listeners.size === 1) {
      document.addEventListener('visibilitychange', resume); window.addEventListener('online', resume); window.addEventListener('storage', storage)
      if (!read) restore()
      void sync()
    }
    return () => {
      listeners.delete(fn)
      if (!listeners.size) {
        clearTimeout(timer); document.removeEventListener('visibilitychange', resume); window.removeEventListener('online', resume); window.removeEventListener('storage', storage)
      }
    }
  }
  return { subscribe, sync, snapshot: () => snapshot, serverSnapshot: () => EMPTY }
}

const stores = { cn: createReleaseStore('cn'), international: createReleaseStore('international') }
export const releaseStore = (region: ReleaseRegion) => stores[region]
