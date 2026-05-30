import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | PrismaClient;
}

function resolveDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_POSTGRES_URL ||
    process.env.PRISMA_DATABASE_URL
  )?.trim();
}

const prismaClientSingleton = () => {
  const url = resolveDatabaseUrl();
  if (!url) {
    console.warn(
      'No reporting DATABASE_URL (or POSTGRES_URL) set; report email config may be unavailable'
    );
    return new PrismaClient();
  }

  return new PrismaClient({
    datasources: { db: { url } },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
};

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
