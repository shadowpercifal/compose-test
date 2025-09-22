import { SlashCommandBuilder } from 'discord.js';

export const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Проверка отклика бота'),
  new SlashCommandBuilder()
    .setName('linksteam')
    .setDescription('Связать аккаунт Discord со Steam через авторизацию'),
  new SlashCommandBuilder()
    .setName('sessions')
    .setDescription('Показать недавнюю активность игрока на серверах (за 48 часов)'),
].map(c => c.toJSON());
