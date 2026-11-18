import 'server-only'
import { cache } from 'react'
import { cookies, headers } from 'next/headers'
import { getCountry, REGION_COOKIE, resolveRegion } from './i18n'

export const requestRegion = cache(async () => {
  const [requestHeaders, jar] = await Promise.all([headers(), cookies()])
  return resolveRegion({ country: getCountry(requestHeaders), browserRegion: jar.get(REGION_COOKIE)?.value, acceptLanguage: requestHeaders.get('accept-language') })
})
