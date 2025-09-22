import type {
  ButtonInteraction,
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
} from 'discord.js';

export type CommandHandler = (i: ChatInputCommandInteraction) => Promise<void> | void;
export type ButtonHandler = (i: ButtonInteraction, params: Record<string, string>) => Promise<void> | void;
export type ModalHandler = (i: ModalSubmitInteraction, params: Record<string, string>) => Promise<void> | void;

export type HandlerKind = 'command' | 'button' | 'modal';
