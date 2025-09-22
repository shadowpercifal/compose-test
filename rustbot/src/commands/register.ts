import { REST, Routes } from 'discord.js';
import { commands } from './definitions.js';

export async function registerCommands({ guildId, clientId }: { guildId: string; clientId: string }) {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);
  await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
}
