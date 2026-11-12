import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { ApiResponse } from '../types/api-response';

export class AppError extends Error {
  public statusCode: number;
  public errors?: any;

  constructor(message: string, statusCode = 400, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  // Default values
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: any = undefined;

  // Custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }
  // Zod Validation Error
  else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }
  // Prisma Known Request Errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        statusCode = 409;
        const target = (err.meta?.target as string[]) || [];
        message = `Unique constraint violation on field: ${target.join(', ')}`;
        break;
      }
      case 'P2025': {
        statusCode = 404;
        message = (err.meta?.cause as string) || 'Record not found';
        break;
      }
      case 'P2003': {
        statusCode = 400;
        message = 'Foreign key constraint violation. Referenced record does not exist or is protected by relation.';
        break;
      }
      default: {
        statusCode = 400;
        message = `Database operation error (${err.code})`;
        break;
      }
    }
  }
  // SyntaxError (e.g. malformed JSON in request body)
  else if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON in request body';
  } else if (err.message) {
    message = err.message;
    if (err.statusCode && typeof err.statusCode === 'number') {
      statusCode = err.statusCode;
    }
  }

  // Ensure database credentials or passwords are never exposed
  if (typeof message === 'string') {
    message = message.replace(/postgresql:\/\/[^@]+@/gi, 'postgresql://***:***@');
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
};
