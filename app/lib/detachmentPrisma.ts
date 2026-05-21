import { PrismaClient } from '@/generated/detachment-client';

declare global {
  // eslint-disable-next-line no-var
  var detachmentPrismaGlobal: PrismaClient | undefined;
}

function createDetachmentPrisma(): PrismaClient | null {
  const url = process.env.DETACHMENT_DATABASE_URL?.trim();
  if (!url) return null;

  return new PrismaClient({
    datasources: { db: { url } },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

/** Prisma client for detachment-florida `squadron` table; null if DETACHMENT_DATABASE_URL is unset. */
export function getDetachmentPrisma(): PrismaClient | null {
  if (!process.env.DETACHMENT_DATABASE_URL?.trim()) {
    return null;
  }

  if (process.env.NODE_ENV !== 'production') {
    if (!globalThis.detachmentPrismaGlobal) {
      globalThis.detachmentPrismaGlobal = createDetachmentPrisma() ?? undefined;
    }
    return globalThis.detachmentPrismaGlobal ?? null;
  }

  return createDetachmentPrisma();
}

export function isDetachmentLookupConfigured(): boolean {
  return Boolean(process.env.DETACHMENT_DATABASE_URL?.trim());
}
