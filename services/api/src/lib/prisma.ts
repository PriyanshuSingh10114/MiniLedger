import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger.js';

// Global BigInt serialization patch for JSON.stringify
declare global {
  interface BigInt {
    toJSON(): number;
  }
}

(BigInt.prototype as unknown as { toJSON: () => number }).toJSON = function () {
  const num = Number(this);
  if (!Number.isSafeInteger(num)) {
    return this.toString() as unknown as number;
  }
  return num;
};

export const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'error' },
          { emit: 'event', level: 'warn' },
        ]
      : [{ emit: 'event', level: 'error' }],
});

if (process.env.NODE_ENV === 'development') {
  prisma.$on('error' as never, (e: { message: string }) => {
    logger.error({ error: e }, 'Prisma database error');
  });
}
