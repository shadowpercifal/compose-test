import { registerCommand, registerButton, registerModal } from './registry.js';
import { handlePing } from '../controllers/ping.js';
import { handleLinkSteam } from '../controllers/linkSteam.js';
import { handleSessions } from '../controllers/sessions.js';

export function registerAllHandlers() {
  // Commands
  registerCommand('ping', handlePing);
  registerCommand('linksteam', handleLinkSteam);
  registerCommand('sessions', handleSessions);

  // Buttons (example: linksteam:start?x=1)
  registerButton('linksteam:start', (i) => handleLinkSteam(i as any));

  // Modals can be added similarly
}
