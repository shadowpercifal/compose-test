import { prisma } from '../lib/db.js';

export async function ensureMember(discordId: string) {
  const existing = await prisma.member.findUnique({ where: { discordId } });
  if (existing) return existing;
  return prisma.member.create({ data: { discordId } });
}

export async function linkSteam(discordId: string, steamId: string) {
  return prisma.member.upsert({
    where: { discordId },
    update: { steamId },
    create: { discordId, steamId },
  });
}

export async function getSteamIdByDiscord(discordId: string) {
  const m = await prisma.member.findUnique({ where: { discordId }, select: { steamId: true } });
  return m?.steamId || null;
}
