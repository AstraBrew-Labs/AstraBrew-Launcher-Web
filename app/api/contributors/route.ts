import { NextResponse } from 'next/server'
import {
  ContributorApiError,
  getCachedContributorPayload,
} from '@/lib/github-contributors.server'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const proxyEnabled = new URL(request.url).searchParams.get('proxy') === '1'
    const data = await getCachedContributorPayload(proxyEnabled)

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    const contributorError = error instanceof ContributorApiError
      ? error
      : new ContributorApiError('贡献者接口暂时不可用。', 'api')

    return NextResponse.json(
      { error: contributorError.message, kind: contributorError.kind },
      { status: 502 },
    )
  }
}
