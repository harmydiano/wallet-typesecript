import AppValidation from '../_core/app.validation';
import AppError from '../../../lib/api/app-error';
import Joi from 'joi';

export interface UserCreateRequest {
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  password: string;
  bvn: string;
}

export interface UserUpdateRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export default class UserValidation extends AppValidation {
  /**
   * Validate create operation
   */
  async create(obj: UserCreateRequest): Promise<{ passed: boolean; errors?: any[] }> {
    const schema = Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': 'Email must be a valid email address',
        'any.required': 'Email is required'
      }),
      phone: Joi.string().pattern(/^[+]?\d{10,15}$/).required().messages({
        'string.pattern.base': 'Phone must be a valid phone number',
        'any.required': 'Phone is required'
      }),
      first_name: Joi.string().min(2).max(100).required().messages({
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name cannot exceed 100 characters',
        'any.required': 'First name is required'
      }),
      last_name: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name cannot exceed 100 characters',
        'any.required': 'Last name is required'
      }),
      password: Joi.string().min(8).required().messages({
        'string.min': 'Password must be at least 8 characters long',
        'any.required': 'Password is required'
      }),
      bvn: Joi.string().pattern(/^\d{11}$/).required().messages({
        'string.pattern.base': 'BVN must be exactly 11 digits',
        'any.required': 'BVN is required'
      })
    });

    try {
      await schema.validateAsync(obj);
      return { passed: true };
    } catch (error: any) {
      return AppError.formatInputError({ error });
    }
  }

  /**
   * Validate update operation
   */
  async update(obj: UserUpdateRequest): Promise<{ passed: boolean; errors?: any[] }> {
    const schema = Joi.object({
      first_name: Joi.string().min(2).max(100).optional().messages({
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name cannot exceed 100 characters'
      }),
      last_name: Joi.string().min(2).max(100).optional().messages({
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name cannot exceed 100 characters'
      }),
      phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional().messages({
        'string.pattern.base': 'Phone must be a valid phone number'
      })
    });

    try {
      await schema.validateAsync(obj);
      return { passed: true };
    } catch (error: any) {
      return AppError.formatInputError({ error });
    }
  }

  /**
   * Validate login operation
   */
  async login(obj: { email: string; password: string }): Promise<{ passed: boolean; errors?: any[] }> {
    const schema = Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': 'Email must be a valid email address',
        'any.required': 'Email is required'
      }),
      password: Joi.string().min(8).required().messages({
        'string.min': 'Password must be at least 8 characters long',
        'any.required': 'Password is required'
      })
    });
    try {
      await schema.validateAsync(obj);
      return { passed: true };
    } catch (error: any) {
      return AppError.formatInputError({ error });
    }
  }
} 