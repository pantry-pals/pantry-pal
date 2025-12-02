import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Match your old global pattern as closely as possible
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

// eslint-disable-next-line import/prefer-default-export, operator-linebreak
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ['query'], // same logging as before
  });

// Same behavior: only cache on global in *development*
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
