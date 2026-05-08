/**
 * Custom Error Classes for portafolio-dev
 * Provides clear, descriptive error messages in Spanish
 */

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return { error: this.message };
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const msg = identifier
      ? `El recurso '${resource}' con id '${identifier}' no fue encontrado`
      : `El recurso '${resource}' no fue encontrado`;
    super(msg, 404);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(errors: string | string[]) {
    const messages = Array.isArray(errors) ? errors.join(', ') : errors;
    super(messages, 400);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Demasiadas solicitudes. Intenta más tarde.') {
    super(message, 429);
    this.name = 'TooManyRequestsError';
  }
}