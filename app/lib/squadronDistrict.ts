import { getDetachmentPrisma, isDetachmentLookupConfigured } from '@/app/lib/detachmentPrisma';
import { squadronLookupNumber } from '@/app/lib/squadronInput';

export type SquadronDistrictLookup =
  | {
      configured: true;
      found: true;
      sq_number: number;
      dist_number: number;
      location: string;
    }
  | {
      configured: true;
      found: false;
      sq_number: number;
    }
  | {
      configured: false;
    };

/**
 * Resolve district from squadron number (same query as detachment-florida
 * portrait-awards lookup-org: squadron.sq_number → dist_number).
 */
export async function lookupSquadronDistrict(
  rawSquadronNumber: string
): Promise<SquadronDistrictLookup> {
  if (!isDetachmentLookupConfigured()) {
    return { configured: false };
  }

  const digits = rawSquadronNumber.replace(/\D/g, '');
  const n = squadronLookupNumber(digits);
  if (!digits || !Number.isFinite(n) || n <= 0) {
    return { configured: true, found: false, sq_number: NaN };
  }

  const prisma = getDetachmentPrisma();
  if (!prisma) {
    return { configured: false };
  }

  try {
    const sq = await prisma.squadron.findUnique({
      where: { sq_number: n },
      select: {
        sq_number: true,
        sq_name: true,
        location_alias: true,
        phy_city: true,
        dist_number: true,
      },
    });

    if (!sq) {
      return { configured: true, found: false, sq_number: n };
    }

    const location = (
      sq.location_alias ||
      sq.phy_city ||
      sq.sq_name ||
      `Squadron ${sq.sq_number}`
    ).trim();

    return {
      configured: true,
      found: true,
      sq_number: sq.sq_number,
      dist_number: sq.dist_number,
      location,
    };
  } catch (error) {
    console.error('Squadron district lookup failed:', error);
    return { configured: true, found: false, sq_number: n };
  }
}
