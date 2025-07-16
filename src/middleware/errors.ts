import { Request, Response, NextFunction } from 'express';
import config from '../config/default';
import AppError from '../lib/api/app-error';

export default function errorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  console.log(error);
  const meta: any = {};
  let statusCode = 500;
  let message = 'A problem with our server, please try again later';
  let errors = undefined;

  if (error instanceof AppError) {
    const err = error;
    statusCode = err.statusCode;
    message = err.message;
    meta.status_code = statusCode;
    meta.error = { code: statusCode, message: err.message };
    if (err.errors) {
      meta.error.messages = err.errors;
      errors = err.errors;
    }
  } else if (error instanceof Error) {
    statusCode = (error as any).status || 500;
    message = error.message;
    meta.status_code = statusCode;
    meta.error = { 
      code: statusCode, 
      message: error.message 
    };
    meta.developer_message = error;
  } else {
    meta.status_code = statusCode;
    meta.error = { 
      code: statusCode, 
      message
    };
    meta.developer_message = error;
  }

  if (config.app.environment !== 'production') {
    console.log('error >>>>>>>>>>>>>>> ', error);
  }

  console.log('meta ', meta);
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    meta
  });
} 