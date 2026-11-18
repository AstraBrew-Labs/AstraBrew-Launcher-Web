import { isRegion } from '@/lib/i18n'
import { releaseStore } from '@/lib/release-store'
import { affectsPage, findPage, isOnScreen } from './page-elements'

/** Start only destination-critical work. Next owns route chunks; the browser owns fonts/images. */
export function warmDestination(path: string) {
  const segment = path.split('/')[2] || 'home'
  const region = document.querySelector<HTMLElement>('[data-request-region]')?.dataset.requestRegion
  if (isRegion(region) && (segment === 'download' || (segment === 'home' && /windows/i.test(navigator.userAgent)))) {
    const store = releaseStore(region)
    const fresh = store.sync()
    if (!store.snapshot().data) return fresh
  }
  return Promise.resolve()
}

/** Wait for the visible destination, not a retained page or a streaming placeholder. */
export function whenPageReady(path: string, dataReady: Promise<void>, signal: AbortSignal, ready: () => void, previous?: HTMLElement) {
  let page: HTMLElement | undefined, assetsReady = false, finished = false
  let deadline: ReturnType<typeof setTimeout> | undefined
  const dispose = () => { finished = true; observer.disconnect(); clearTimeout(deadline); signal.removeEventListener('abort', dispose) }
  const finish = () => { if (!finished) { dispose(); ready() } }
  function check() {
    if (finished || location.pathname.replace(/\/$/, '') !== path.replace(/\/$/, '')) return
    const current = findPage(path, document, previous)
    if (!current) return
    if (page !== current) {
      page = current
      assetsReady = false
      clearTimeout(deadline)
      deadline = setTimeout(finish, 1200)
      const images = [...document.querySelectorAll<HTMLImageElement>('.site-logo img'), ...page.querySelectorAll('img')].filter(isOnScreen)
      void Promise.allSettled([dataReady, document.fonts.ready, ...images.map(img => img.decode())]).then(() => {
        if (page !== current) return
        assetsReady = true
        check()
      })
    }
    if (assetsReady && !current.querySelector('[data-intro-pending]')) finish()
  }
  const observer = new MutationObserver(records => { if (records.some(affectsPage)) check() })
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'style', 'data-transit-path', 'data-intro-pending'] })
  signal.addEventListener('abort', dispose, { once: true }); check()
}
