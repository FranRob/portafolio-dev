import { type Request, type Response, type NextFunction } from 'express';
import { logger } from './logger.js';

/**
 * Request logging middleware
 * Logs all HTTP requests with method, path, status, and duration
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = Date.now();

  // Log on response finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    };

    if (res.statusCode >= 500) {
      logger.error(logData, '✗ Request failed');
    } else if (res.statusCode >= 400) {
      logger.warn(logData, '✗ Request error');
    } else {
      logger.info(logData, '✓ Request');
    }
  });

  next();
}

export default logger;