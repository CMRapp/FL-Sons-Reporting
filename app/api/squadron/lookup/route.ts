import { NextRequest, NextResponse } from 'next/server';
import { lookupSquadronDistrict } from '@/app/lib/squadronDistrict';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Public lookup for report submission portal (mirrors detachment-florida
 * GET /api/admin/portrait-awards/lookup-org).
 */
export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('number') ?? '';
  const result = await lookupSquadronDistrict(raw);

  if (!result.configured) {
    return NextResponse.json({ configured: false });
  }

  if (!result.found) {
    const sq = Number.isFinite(result.sq_number) ? result.sq_number : null;
    return NextResponse.json({
      configured: true,
      found: false,
      ...(sq != null ? { sq_number: sq } : {}),
    });
  }

  return NextResponse.json({
    configured: true,
    found: true,
    sq_number: result.sq_number,
    dist_number: result.dist_number,
    location: result.location,
  });
}
