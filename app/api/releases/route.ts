import { isRegion } from '@/lib/i18n'
import { getWindowsReleases } from '@/lib/releases.server'

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const region = params.get('region')
  if (!isRegion(region)) return Response.json({ error: 'Unknown region' }, { status: 400 })
  const result = await getWindowsReleases(region, params.get('refresh') === '1')
  return Response.json(result, { headers: { 'Cache-Control': 'private, no-store' } })
}
