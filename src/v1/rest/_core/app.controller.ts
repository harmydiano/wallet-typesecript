import { Request, Response, NextFunction } from 'express';
import AppError from '../../../lib/api/app-error';
import { BAD_REQUEST, CONFLICT, CREATED, NOT_FOUND, OK } from '../../../utils/constants';
import lang from '../../lang/index';

export interface BaseModel {
  tableName: string;
  uniques?: string[];
  returnDuplicate?: boolean;
  fillables?: string[];
  updateFillables?: string[];
  hiddenFields?: string[];
  getValidator(): any;
  getProcessor(model?: any): any;
}

export interface RequestWithObject extends Request {
  object?: any;
  response?: any;
}

export default abstract class AppController {
  protected model?: BaseModel;
  protected lang?: any;

  constructor(model?: BaseModel) {
    if (new.target === AppController) {
      throw new TypeError('Cannot construct Abstract instances directly');
    }
    if (model) {
      this.model = model;
      this.lang = lang.get(model.tableName);
    }
  }

  /**
   * Find one record
   */
  async findOne(req: RequestWithObject, res: Response, next: NextFunction): Promise<void> {
    const object = req.object;
    req.response = {
      model: this.model,
      code: OK,
      value: object
    };
    next();
  }

  /**
   * Create new record
   */
  async create(req: RequestWithObject, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!this.model) {
        throw new AppError('Model not defined', BAD_REQUEST);
      }

      const processor = this.model.getProcessor();
      const validate = await this.model.getValidator().create(req.body);
      
      if (!validate.passed) {
        return next(new AppError(lang.get('error').inputs, BAD_REQUEST, validate.errors));
      }

      const obj = await processor.prepareBodyObject(req);
      let object = await processor.retrieveExistingResource(this.model, obj);
      
      if (object) {
        const returnIfFound = this.model.returnDuplicate;
        if (returnIfFound) {
          req.response = {
            message: this.lang?.created,
            model: this.model,
            code: CREATED,
            value: object
          };
          return next();
        } else {
          const messageObj = this.model.uniques?.map(m => ({ [m]: `${m} must be unique` })) || [];
          const appError = new AppError(lang.get('error').resource_already_exist, CONFLICT, messageObj);
          return next(appError);
        }
      } else {
        let checkError = await processor.validateCreate(obj);
        if (checkError) {
          return next(checkError);
        }
        object = await processor.createNewObject(obj);
      }

      req.response = {
        message: this.lang?.created,
        model: this.model,
        code: CREATED,
        value: await object
      };
      
      await processor.postCreateResponse(object);
      next();
    } catch (err) {
      next(err);
    }
  }

  /**
   * Find records with pagination
   */
  async find(req: RequestWithObject, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!this.model) {
        throw new AppError('Model not defined', BAD_REQUEST);
      }

      const processor = this.model.getProcessor();
      const { value, count } = await processor.buildModelQueryObject(req.query);
      
      req.response = {
        model: this.model,
        code: OK,
        value,
        count
      };
      next();
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update record
   */
  async update(req: RequestWithObject, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!this.model) {
        throw new AppError('Model not defined', BAD_REQUEST);
      }

      const processor = this.model.getProcessor();
      let object = req.object;
      const obj = await processor.prepareBodyObject(req);
      const validate = await this.model.getValidator().update(obj);
      
      if (!validate.passed) {
        const error = new AppError(lang.get('error').inputs, BAD_REQUEST, validate.errors);
        return next(error);
      }

      if (this.model.uniques && this.model.uniques.length > 0) {
        let found = await processor.retrieveExistingResource(this.model, obj);
        if (found) {
          const messageObj = this.model.uniques.map(m => ({ [m]: `${m} must be unique` }));
          const appError = new AppError(lang.get('error').resource_already_exist, CONFLICT, messageObj);
          return next(appError);
        }
      }

      let canUpdateError = await processor.validateUpdate(object, obj);
      if (canUpdateError) {
        return next(canUpdateError);
      }

      object = await processor.updateObject(this.model, object, obj);
      req.response = {
        model: this.model,
        code: OK,
        message: this.lang?.updated,
        value: object
      };

      const postUpdate = await processor.postUpdateResponse(object, req.response);
      if (postUpdate) {
        req.response = Object.assign({}, req.response, postUpdate);
      }
      next();
    } catch (err) {
      next(err);
    }
  }
} 