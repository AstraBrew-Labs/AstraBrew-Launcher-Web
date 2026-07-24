import { NextResponse } from 'next/server'
import {
  getCachedReleasePayload,
  ReleaseApiError,
} from '@/lib/github-releases.server'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const proxyEnabled = new URL(request.url).searchParams.get('proxy') === '1'
    const data = await getCachedReleasePayload(proxyEnabled)

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    const releaseError = error instanceof ReleaseApiError
      ? error
      : new ReleaseApiError('发布信息接口暂时不可用。', 'api')

    return NextResponse.json(
      { error: releaseError.message, kind: releaseError.kind },
      { status: 502 },
    )
  }
}
