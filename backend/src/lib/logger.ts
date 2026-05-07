import pino from 'pino';
import 'dotenv/config';

const isDev = process.env.NODE_ENV !== 'production';

// Simple JSON logger - no transport needed
export const logger = pino({
  level: isDev ? 'debug' : 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
});

// Logger shortcuts for common operations
export const log = {
  info: (msg: string, data?: object) => logger.info(data, msg),
  warn: (msg: string, data?: object) => logger.warn(data, msg),
  error: (msg: string, data?: object) => logger.error(data, msg),
  debug: (msg: string, data?: object) => logger.debug(data, msg),
  
  // HTTP logging helpers
  request: (req: { method: string; url: string; ip?: string }) => 
    logger.info({ method: req.method, url: req.url, ip: req.ip }, '→'),
  
  response: (req: { method: string; url: string }, statusCode: number, duration: number) =>
    logger.info({ method: req.method, url: req.url, statusCode, duration }, '←'),
};

export default logger;