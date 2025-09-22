import { prisma } from '../lib/db.js';

export async function logAudit(action: string, metadata?: any, actorId?: number) {
  await prisma.auditLog.create({ data: { action, metadata, actorId } });
}
