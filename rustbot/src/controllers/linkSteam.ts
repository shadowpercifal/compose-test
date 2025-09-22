import { ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType } from 'discord.js';
import { sendMessage } from '../lib/responses.js';
import { getAuthUrl, registerCallback, startSteamAuthService } from '../services/steamAuth.js';
import { linkSteam as linkSteamDb } from '../services/members.js';
import { logAudit } from '../services/audit.js';
import { client } from '../lib/discord.js';

export async function handleLinkSteam(i: ChatInputCommandInteraction) {
  startSteamAuthService(Number(process.env.PORT || 3000));
  const { url, state } = await getAuthUrl({ discordId: i.user.id });
  const btn = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Войти через Steam').setURL(url);
  await sendMessage(i, { content: 'Свяжите аккаунт Steam для доступа к функциям.', components: [{ type: ComponentType.ActionRow, components: [btn] }], ephemeral: true });

  // При желании можно регистрировать колбек для завершения процесса
  await registerCallback(state, async ({ steamId }) => {
    await linkSteamDb(i.user.id, steamId);
    await logAudit('link_steam', { discordId: i.user.id, steamId });
    try {
      const user = await client.users.fetch(i.user.id);
      await user.send(`Ваш аккаунт Steam (${steamId}) успешно связан с Discord.`);
    } catch {}
  });
}
