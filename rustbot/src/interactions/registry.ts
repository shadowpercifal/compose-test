import { client } from '../lib/discord.js';
import { logger } from '../lib/logger.js';
import type { ButtonHandler, CommandHandler, ModalHandler } from './types.js';

const commandHandlers = new Map<string, CommandHandler>();
const buttonHandlers = new Map<string, ButtonHandler>();
const modalHandlers = new Map<string, ModalHandler>();

export function registerCommand(name: string, handler: CommandHandler) {
  commandHandlers.set(name, handler);
}
export function registerButton(key: string, handler: ButtonHandler) {
  buttonHandlers.set(key, handler);
}
export function registerModal(key: string, handler: ModalHandler) {
  modalHandlers.set(key, handler);
}

function parseCustomId(customId: string): { key: string; params: Record<string, string> } {
  // Format: namespace:action?k=v&x=y
  const [head, query] = customId.split('?');
  const key = head;
  const params: Record<string, string> = {};
  if (query) new URLSearchParams(query).forEach((v, k) => (params[k] = v));
  return { key, params };
}

client.on('interactionCreate', async (i) => {
  try {
    if (i.isChatInputCommand()) {
      const handler = commandHandlers.get(i.commandName);
      if (handler) return handler(i);
    }
    if (i.isButton()) {
      const { key, params } = parseCustomId(i.customId);
      const handler = buttonHandlers.get(key);
      if (handler) return handler(i, params);
    }
    if (i.isModalSubmit()) {
      const { key, params } = parseCustomId(i.customId);
      const handler = modalHandlers.get(key);
      if (handler) return handler(i, params);
    }
  } catch (err) {
    logger.error({ err }, 'Ошибка маршрутизации интеракции');
    if (i.isRepliable() && !i.replied && !i.deferred) await i.reply({ content: 'Произошла ошибка.', ephemeral: true });
  }
});
