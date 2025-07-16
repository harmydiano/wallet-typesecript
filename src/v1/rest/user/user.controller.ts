import { Request, Response, NextFunction } from 'express';
import AppController, { RequestWithObject as BaseRequestWithObject } from '../_core/app.controller';
import AppError from '../../../lib/api/app-error';
import UserValidation, { UserCreateRequest, UserUpdateRequest } from './user.validation';
import UserProcessor from './user.processor';
import User from './user.model';
import Wallet from '../wallet/wallet.model';
import lang from '../../lang';
import { BAD_REQUEST, OK, CREATED, NOT_FOUND } from '../../../utils/constants';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Extend RequestWithObject to include userId
export interface RequestWithObject extends BaseRequestWithObject {
  userId?: any;
}

export default class UserController extends AppController {
  constructor() {
    super(User);
  }

  /**
   * Handle user registration
   */
  async register(req: RequestWithObject, res: Response, next: NextFunction): Promise<void> {
    try {
      const obj = req.body as UserCreateRequest;
      
      // Validate request
      const validator = await new UserValidation().create(obj);
      if (!validator.passed) {
        const firstError = validator.errors && validator.errors.length > 0 ? Object.values(validator.errors[0])[0] : lang.get('error').inputs;
        return next(new AppError(firstError, BAD_REQUEST, validator.errors));
      }

      // Centralized business logic checks in processor
      const canCreate = await UserProcessor.canCreate({ ...obj, model: User });
      if (canCreate instanceof AppError) {
        return next(canCreate);
      }

      // Hash password and create user data
      const userData = await UserProcessor.createUserData(obj);
      const user = await User.create(userData);
      // Create wallet for user
      const walletData = UserProcessor.createWalletData(user);
      const wallet = await Wallet.create(walletData);

      // Generate JWT token
      const token = UserProcessor.generateToken(user);
      // Format user and wallet response
      const value = UserProcessor.formatUserWalletResponse(user, wallet);
      // Get response
      const response = await UserProcessor.getResponse({
        code: CREATED,
        message: lang.users.created,
        value,
        token
      });

      res.status(CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle user login
   */
  async login(req: RequestWithObject, res: Response, next: NextFunction): Promise<void> {
    try {
      const obj = req.body;
      // Validate input using Joi
      const validator = await new UserValidation().login(obj);
      if (!validator.passed) {
        const firstError = validator.errors && validator.errors.length > 0 ? Object.values(validator.errors[0])[0] : lang.get('error').inputs;
        return next(new AppError(firstError, BAD_REQUEST, validator.errors));
      }
      const user = await User.findByEmail?.(obj.email);
      // Centralized business logic checks in processor
      const userOrError = await UserProcessor.canLogin({ email: obj.email, password: obj.password, user });
      if (userOrError instanceof AppError) {
        return next(userOrError);
      }
      // Generate JWT token
      const token = UserProcessor.generateToken(user);
      // Get user's wallet
      const wallet = await Wallet.findByUserId(user.id);
       // Format response inline
      const value = UserProcessor.formatUserWalletResponse(user, wallet);
      // Get response
      const response = await UserProcessor.getResponse({
        code: OK,
        message: lang.users.login_success,
        value,
        token
      });
      res.status(OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user profile
   */
  async profile(req: RequestWithObject, res: Response, next: NextFunction): Promise<void> {
    try {
      // Use req.userId directly
      const userId = req.userId;
      const user = await User.findOne({ id: userId });
      // Centralized business logic checks in processor
      const canGetError = await UserProcessor.canGet(user);
      if (canGetError instanceof AppError) {
        return next(canGetError);
      }
      const wallet = await Wallet.findByUserId(userId);
       // Format user and wallet response
       const value = UserProcessor.formatUserWalletResponse(user, wallet);
      const response = await UserProcessor.getResponse({
        code: OK,
        message: lang.users.profile_retrieved,
        value
      });
      res.status(OK).json(response);
    } catch (error) {
      next(error);
    }
  }
} 