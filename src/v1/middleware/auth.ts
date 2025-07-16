import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../../../config/default';
import AppError from '../../lib/api/app-error';
import { UNAUTHORIZED } from '../../utils/constants';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export default function auth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    console.log(req.header);
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return next(new AppError('No token provided', UNAUTHORIZED));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || config.app.superSecret);
      req.user = decoded;
      if (decoded && typeof decoded === 'object' && 'userId' in decoded) {
        (req as any).userId = decoded.userId;
      }
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return next(new AppError('Invalid token', UNAUTHORIZED));
      } else {
        return next(error);
      }
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', UNAUTHORIZED));
    } else {
      next(error);
    }
  }
} 