import { ActionRowBuilder, APIEmbed, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, InteractionReplyOptions, Message, MessageCreateOptions, MessageEditOptions } from 'discord.js';

export async function sendMessage(target: ChatInputCommandInteraction | Message, options: MessageCreateOptions | InteractionReplyOptions) {
  if ('reply' in target) return target.reply(options as InteractionReplyOptions);
  return (target as Message).reply(options as MessageCreateOptions);
}

export async function editMessage(target: ChatInputCommandInteraction | Message, options: MessageEditOptions) {
  if ('editReply' in target) return (target as ChatInputCommandInteraction).editReply(options);
  return (target as Message).edit(options);
}

export function embed(data: APIEmbed): APIEmbed { return data; }

export function buttons(...defs: { id: string; label: string; style?: ButtonStyle }[]) {
  const row = new ActionRowBuilder<ButtonBuilder>();
  defs.forEach(d => row.addComponents(new ButtonBuilder().setCustomId(d.id).setLabel(d.label).setStyle(d.style ?? ButtonStyle.Primary)));
  return [row];
}
