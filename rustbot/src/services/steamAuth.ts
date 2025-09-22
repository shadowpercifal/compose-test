import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { logger } from '../lib/logger.js';

type Callback = (data: { steamId: string; discordId?: string }) => Promise<void> | void;
const callbacks = new Map<string, { discordId?: string; cb: Callback }>();

let server: import('http').Server | null = null;

export async function getAuthUrl(ctx: { discordId?: string }): Promise<{ url: string; state: string }> {
  const base = process.env.PUBLIC_BASE_URL || 'https://auth.example.com';
  const state = crypto.randomBytes(16).toString('hex');
  // remember callback if set later via registerCallback
  callbacks.set(state, { discordId: ctx.discordId, cb: async () => {} });
  // Steam OpenID 2.0 — use direct URL and carry state in return_to
  const returnTo = `${base}/steam/callback?state=${encodeURIComponent(state)}`;
  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': returnTo,
    'openid.realm': base,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  });
  return { url: `https://steamcommunity.com/openid/login?${params.toString()}`, state };
}

export async function registerCallback(stateOrDiscordId: string, cb: Callback) {
  const existing = callbacks.get(stateOrDiscordId);
  if (existing) callbacks.set(stateOrDiscordId, { ...existing, cb });
  else callbacks.set(stateOrDiscordId, { cb });
}

export function startSteamAuthService(port = 3000) {
  if (server) return;
  const app = express();
  app.get('/steam/callback', async (req: Request, res: Response) => {
    try {
      const params = req.query as Record<string, string>;
      const verify = new URLSearchParams(params as any);
      verify.set('openid.mode', 'check_authentication');
      const r = await fetch('https://steamcommunity.com/openid/login', { method: 'POST', body: verify });
      const txt = await r.text();
      if (!txt.includes('is_valid:true')) return res.status(400).send('invalid');
      const claimed = params['openid.claimed_id'];
      const steamId = claimed?.split('/').pop() || '';
  const state = params['state'];
  const entry = state ? callbacks.get(state) : undefined;
      if (entry?.cb) await entry.cb({ steamId, discordId: entry.discordId });
      return res.send('Успешная авторизация Steam. Можно закрыть окно.');
    } catch (err) {
      logger.error({ err }, 'Steam OpenID ошибка');
      return res.status(500).send('Ошибка авторизации');
    }
  });
  server = app.listen(port, () => logger.info({ port }, 'Steam auth service запущен'));
}

export function stopSteamAuthService() {
  if (!server) return;
  server.close();
  server = null;
}
