import { Request, Response, NextFunction } from 'express';

export default function apiAuth(req: Request, res: Response, next: NextFunction): void {
  // API authentication middleware
  // In the original, this was empty but could be extended for API key validation
  return next();
} 