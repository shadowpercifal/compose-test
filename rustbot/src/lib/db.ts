import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';

export const prisma = new PrismaClient({
  log: [{ emit: 'event', level: 'error' }, { emit: 'event', level: 'warn' }],
});

prisma.$on('error', (e) => logger.error(e as any, 'Prisma error'));
prisma.$on('warn', (e) => logger.warn(e as any, 'Prisma warn'));

export async function healthcheck() {
  await prisma.$queryRaw`SELECT 1`;
}
