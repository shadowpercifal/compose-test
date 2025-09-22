import { ChatInputCommandInteraction } from 'discord.js';
import { sendMessage } from '../lib/responses.js';

export async function handlePing(i: ChatInputCommandInteraction) {
  await sendMessage(i, { content: 'Понг!', ephemeral: true });
}
