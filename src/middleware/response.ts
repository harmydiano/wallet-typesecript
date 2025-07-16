import { Request, Response, NextFunction } from 'express';
import QueryParser from '../lib/api/query-parser';
import { RequestWithObject } from '../v1/rest/_core/app.controller';

export default async function response(req: RequestWithObject, res: Response, next: NextFunction): Promise<Response | void> {
  if (req.response) {
    const queryParser = new QueryParser(Object.assign({}, req.query));
    const obj = req.response;
    const processor = obj.model.getProcessor();
    const response = await processor.getApiClientResponse({ ...obj, queryParser });
    return res.status(obj.code).json(response);
  }
  
  next();
} 