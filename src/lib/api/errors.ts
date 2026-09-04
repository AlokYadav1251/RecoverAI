export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode: number = 400, errorCode: string = 'BAD_REQUEST', details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(message, 400, 'BAD_REQUEST', details);
  }

  static notFound(message: string = 'Resource not found') {
    return new AppError(message, 404, 'NOT_FOUND');
  }

  static conflict(message: string, details?: unknown) {
    return new AppError(message, 409, 'CONFLICT', details);
  }

  static unprocessable(message: string, details?: unknown) {
    return new AppError(message, 422, 'UNPROCESSABLE_ENTITY', details);
  }

  static internal(message: string = 'An unexpected internal error occurred') {
    return new AppError(message, 500, 'INTERNAL_SERVER_ERROR');
  }
}
