import { Request } from 'express';
import AppResponse from '../../../lib/api/app-response';
import { BaseModel } from './app.controller';

export const CREATE = 'create';
export const UPDATE = 'update';
export const DELETE = 'delete';

export default class AppProcessor {
  protected model: BaseModel;

  constructor(model: BaseModel) {
    this.model = model;
  }

  /**
   * Validate update operation
   */
  async validateUpdate(current: any, obj: any): Promise<any> {
    return null;
  }

  /**
   * Validate create operation
   */
  async validateCreate(obj: any): Promise<any> {
    return null;
  }

  /**
   * Post create response handler
   */
  async postCreateResponse(obj: any): Promise<boolean> {
    return false;
  }

  /**
   * Post update response handler
   */
  async postUpdateResponse(obj: any, response: any): Promise<any> {
    return false;
  }

  /**
   * Get API client response
   */
  async getApiClientResponse({ 
    model, 
    value, 
    code, 
    message, 
    count, 
    token, 
    email 
  }: {
    model?: any;
    value?: any;
    code: number;
    message?: string;
    count?: number;
    token?: string;
    email?: string;
  }): Promise<any> {
    const meta = AppResponse.getSuccessMeta();
    if (token) {
      meta.token = token;
    }
    Object.assign(meta, { status_code: code });
    if (message) {
      meta.message = message;
    }

    return AppResponse.format(meta, value);
  }

  /**
   * Build model query object
   */
  async buildModelQueryObject(query: any = null): Promise<{ value: any; count: number }> {
    // This will be implemented by specific processors
    return {
      value: [],
      count: 0
    };
  }

  /**
   * Create new object
   */
  async createNewObject(obj: any): Promise<any> {
    // This will be implemented by specific processors
    return obj;
  }

  /**
   * Update object
   */
  async updateObject(model: BaseModel, current: any, obj: any): Promise<any> {
    Object.assign(current, obj);
    return current;
  }

  /**
   * Prepare body object from request
   */
  async prepareBodyObject(req: Request): Promise<any> {
    const obj = Object.assign({}, req.body, req.params);
    return obj;
  }

  /**
   * Retrieve existing resource
   */
  async retrieveExistingResource(model: BaseModel, obj: any): Promise<any> {
    if (model.uniques && model.uniques.length > 0) {
      const uniqueKeys = model.uniques;
      const query: any = {};
      for (const key of uniqueKeys) {
        query[key] = obj[key];
      }
      // This will be implemented by specific processors
      return null;
    }
    return null;
  }
} 