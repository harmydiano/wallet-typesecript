import { Application } from 'express';
import config from '../config/default';
import apiAuth from './middleware/api';
import errorHandler from './middleware/errors';
import { NOT_FOUND } from './utils/constants';
import AppError from './lib/api/app-error';
import apiV1 from './v1';

const prefix = config.api.prefix;

/**
 * The routes will add all the application defined routes
 * @param {Application} app The main is an instance of an express application
 * @return {Promise<void>}
 */
export default async (app: Application): Promise<void> => {
  // check if api key is present
  app.use(prefix, apiAuth);
  
  // load version 1 routes
  app.use('/api/v1', apiV1);
  
  // check url for state codes and api version
  app.use((req, res, next) => {
    const err = new Error('Not Found');
    (err as any).status = 405;
    next(err);
  });

  // check if url contains empty request
  app.use('*', (req, res, next) => {
    return next(new AppError('not found', NOT_FOUND));
  });
  
  // load the error middleware
  app.use(errorHandler);
}; 