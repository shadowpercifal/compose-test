import LRUCache from 'lru-cache';

const apiKey = process.env.BATTLEMETRICS_API_KEY || '';
const serverId = process.env.BATTLEMETRICS_SERVER_ID || '';

type Session = { id: string; attributes: { start: string; stop: string | null } };

const cache = new LRUCache<string, Session[]>({ max: Number(process.env.CACHE_MAX_ITEMS || 500), ttl: Number(process.env.CACHE_TTL_SECONDS || 60) * 1000 });

export async function fetchSessions(steamId: string): Promise<Session[]> {
  const key = `sess:${steamId}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const url = `https://api.battlemetrics.com/players?filter[search]=${steamId}&include=session&fields[session]=start,stop`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
  if (!r.ok) return [];
  const json = await r.json();
  const sessions: Session[] = json.included?.filter((x: any) => x.type === 'session') ?? [];
  cache.set(key, sessions);
  return sessions;
}

export async function recentPlaytimeHours(steamId: string, withinHours = 48): Promise<number> {
  const sessions = await fetchSessions(steamId);
  const now = Date.now();
  const window = withinHours * 3600_000;
  let totalMs = 0;
  for (const s of sessions) {
    const start = new Date(s.attributes.start).getTime();
    const stop = s.attributes.stop ? new Date(s.attributes.stop).getTime() : now;
    const overlap = Math.max(0, Math.min(stop, now) - Math.max(start, now - window));
    totalMs += overlap;
  }
  return totalMs / 3600_000;
}
