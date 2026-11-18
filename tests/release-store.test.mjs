import { afterEach, beforeEach, expect, mock, test } from 'bun:test'
import { createReleaseStore, RELEASE_TTL } from '../lib/release-store.ts'

const original = Object.fromEntries(['fetch','localStorage','document','window'].map(k => [k, Object.getOwnPropertyDescriptor(globalThis,k)]))
const result = { releases: [], sources: [{source:'github',status:'ok'},{source:'gitcode',status:'ok'}], fetchedAt: '2026-11-18T00:00:00Z' }
let disk, fetcher
beforeEach(() => {
  disk = new Map(); fetcher = mock(async () => Response.json(result))
  for (const [k,v] of Object.entries({ fetch:fetcher, localStorage:{getItem:k=>disk.get(k)??null,setItem:(k,v)=>disk.set(k,v)},document:new EventTarget(),window:new EventTarget() })) {
    Object.defineProperty(globalThis,k,{value:v,configurable:true,writable:true})
  }
})
afterEach(() => {
  for (const [k,d] of Object.entries(original)) { if(d) Object.defineProperty(globalThis,k,d); else delete globalThis[k] }
})

test('one cold fetch; fresh persisted data is shared across mounts but not regions', async () => {
  const s = createReleaseStore('cn'); await Promise.all([s.sync(),s.sync()]);
  const restored = createReleaseStore('cn'); await restored.sync()
  expect(restored.snapshot().data).toEqual(result); expect(fetcher).toHaveBeenCalledTimes(1)
  await createReleaseStore('international').sync(); expect(fetcher).toHaveBeenCalledTimes(2)
  await restored.sync(true); expect(fetcher.mock.calls.at(-1)[0]).toContain('refresh=1')
})

test('expired data remains readable while refreshing and after network failure', async () => {
  disk.set('astrabrew:releases:v1:cn',JSON.stringify({expires:Date.now()-1,data:result}))
  fetcher.mockRejectedValue(new Error('offline')); const s=createReleaseStore('cn'); const pending=s.sync()
  expect(s.snapshot()).toMatchObject({data:result,syncing:true}); await pending
  expect(s.snapshot()).toMatchObject({data:result,failed:true,syncing:false}); await s.sync(); expect(fetcher).toHaveBeenCalledTimes(1)
})

test('mounted consumers update automatically on expiry without needing navigation', async () => {
  disk.set('astrabrew:releases:v1:cn',JSON.stringify({expires:Date.now()+50,data:result}))
  const s=createReleaseStore('cn'); let done
  const synced=new Promise(resolve=>{done=resolve}); const unsub=s.subscribe(()=>{if(fetcher.mock.calls.length && !s.snapshot().syncing) done()})
  try { await synced; expect(fetcher).toHaveBeenCalledTimes(1) } finally {unsub()}
})

test('malformed local data falls back to the API', async () => {
  disk.set('astrabrew:releases:v1:cn',JSON.stringify({expires:Date.now()+RELEASE_TTL,data:{...result,releases:[{}]}}))
  const s=createReleaseStore('cn'); await s.sync(); expect(fetcher).toHaveBeenCalledTimes(1); expect(s.snapshot().data).toEqual(result)
})
