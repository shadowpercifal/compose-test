import 'dotenv/config';
import { logger } from './lib/logger.js';
import { prisma, healthcheck } from './lib/db.js';
import { client } from './lib/discord.js';
import './interactions/registry.js';
import { registerAllHandlers } from './interactions/registerAll.js';
import { registerCommands } from './commands/register.js';
import { startSteamAuthService } from './services/steamAuth.js';

async function main() {
  logger.info({ env: process.env.NODE_ENV }, 'RustBot запускается...');
  // База данных
  await healthcheck();
  logger.info('Подключение к БД успешно');

  // Запустить сервис авторизации Steam (обрабатывает /steam/callback)
  const port = Number(process.env.PORT || 3000);
  startSteamAuthService(port);

  // Discord
  client.once('ready', async () => {
    logger.info({ user: client.user?.tag }, 'Бот подключён к Discord');
  });
  await client.login(process.env.DISCORD_TOKEN);

  // Регистрация команд (по ID сервера)
  if (process.env.DISCORD_GUILD_ID && process.env.DISCORD_CLIENT_ID) {
    await registerCommands({
      guildId: process.env.DISCORD_GUILD_ID,
      clientId: process.env.DISCORD_CLIENT_ID,
    });
    logger.info('Слэш-команды зарегистрированы');
  }

  // Регистрация обработчиков интеракций в реестре
  registerAllHandlers();
}

main().catch((err) => {
  logger.error({ err }, 'Критическая ошибка запуска');
  process.exit(1);
});
