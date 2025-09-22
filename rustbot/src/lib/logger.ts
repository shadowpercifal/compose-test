import pino from 'pino';

const level = process.env.LOG_LEVEL || 'info';

export const logger = pino({
  level,
  base: undefined, // don't include pid/hostname
  redact: {
    paths: ['req.headers.authorization', 'password', 'token'],
    remove: true,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export function childLogger(bindings: Record<string, any>) {
  return logger.child(bindings);
}
