import { ChatInputCommandInteraction } from 'discord.js';
import { sendMessage } from '../lib/responses.js';
import { recentPlaytimeHours } from '../services/battlemetrics.js';
import { getSteamIdByDiscord } from '../services/members.js';

export async function handleSessions(i: ChatInputCommandInteraction) {
  await i.deferReply({ ephemeral: true });
  const steamId = await getSteamIdByDiscord(i.user.id);
  if (!steamId) return sendMessage(i, { content: 'Сначала свяжите аккаунт Steam командой /linksteam.', ephemeral: true });
  const hours = await recentPlaytimeHours(steamId, 48);
  const msg = hours > 2 ? `Игрок был онлайн более ${hours.toFixed(1)} ч. за последние 48 часов.` : `Игрок провёл ${hours.toFixed(1)} ч. за последние 48 часов.`;
  await sendMessage(i, { content: msg, ephemeral: true });
}
