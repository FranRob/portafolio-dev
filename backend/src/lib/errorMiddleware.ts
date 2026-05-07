import { type Request, type Response, type NextFunction } from 'express';
import { ZodError, type ZodIssue } from 'zod';
import { AppError } from './errors.js';
import { logger } from './logger.js';

/**
 * Error middleware for Express
 * Converts all errors to clear JSON responses in Spanish
 */
export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error({ err: err.message, stack: err.stack }, 'Application error');

  // AppError and subclasses - return as-is
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    const messages = err.issues.map(zodIssueToMessage);
    return res.status(400).json({ error: messages.join('. ') });
  }

  // Prisma errors
  const prismaErr = err as { name?: string; code?: string; meta?: { modelName?: string } };
  if (prismaErr.name === 'PrismaClientKnownRequestError') {
    if (prismaErr.code === 'P2025') {
      const model = prismaErr.meta?.modelName || 'recurso';
      return res.status(404).json({ error: `El ${model} no fue encontrado` });
    }
  }

  // Generic error
  res.status(500).json({ error: 'Error interno del servidor' });
}

function zodIssueToMessage(issue: ZodIssue): string {
  const path = issue.path.join('.');
  const pathLabel = path || 'campo';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyIssue = issue as any;

  switch (issue.code) {
    case 'invalid_type':
      return `El campo '${pathLabel}' es requerido`;
    case 'too_small':
      return `El campo '${pathLabel}' debe tener al menos ${anyIssue.minimum} caracteres`;
    case 'too_big':
      return `El campo '${pathLabel}' no puede tener más de ${anyIssue.maximum} caracteres`;
    case 'invalid_format':
    case 'invalid_value':
    case 'invalid_union':
    case 'invalid_key':
    case 'invalid_element':
    case 'unrecognized_keys':
    case 'not_multiple_of':
      return `El valor de '${pathLabel}' no es válido`;
    case 'custom':
      return anyIssue.message || `Error en '${pathLabel}'`;
    default:
      return anyIssue.message || `Error en '${pathLabel}'`;
  }
}

/**
 * Async handler wrapper
 * Automatically catches errors and passes to error middleware
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}