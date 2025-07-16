import AppValidation from '../_core/app.validation';
import AppError from '../../../lib/api/app-error';
import Joi from 'joi';

export interface WalletFundingRequest {
  amount: number;
  description?: string;
}

export interface WalletTransferRequest {
  to_account_number: string;
  amount: number;
  description?: string;
}

export interface WalletWithdrawalRequest {
  amount: number;
  description?: string;
}

export default class WalletValidation extends AppValidation {
  /**
   * Validate funding operation
   */
  async funding(obj: WalletFundingRequest): Promise<{ passed: boolean; errors?: any[] }> {
    const schema = Joi.object({
      amount: Joi.number().positive().required().messages({
        'number.base': 'Amount must be a number',
        'number.positive': 'Amount must be greater than 0',
        'any.required': 'Amount is required'
      }),
      description: Joi.string().max(500).optional().messages({
        'string.max': 'Description cannot exceed 500 characters'
      })
    });

    try {
      await schema.validateAsync(obj);
      return { passed: true };
    } catch (error: any) {
      return AppError.formatInputError(error);
    }
  }

  /**
   * Validate transfer operation
   */
  async transfer(obj: WalletTransferRequest): Promise<{ passed: boolean; errors?: any[] }> {
    const schema = Joi.object({
      to_account_number: Joi.string().required().messages({
        'any.required': 'Destination account number is required'
      }),
      amount: Joi.number().positive().required().messages({
        'number.base': 'Amount must be a number',
        'number.positive': 'Amount must be greater than 0',
        'any.required': 'Amount is required'
      }),
      description: Joi.string().max(500).optional().messages({
        'string.max': 'Description cannot exceed 500 characters'
      })
    });

    try {
      await schema.validateAsync(obj);
      return { passed: true };
    } catch (error: any) {
      return AppError.formatInputError(error);
    }
  }

  /**
   * Validate withdrawal operation
   */
  async withdrawal(obj: WalletWithdrawalRequest): Promise<{ passed: boolean; errors?: any[] }> {
    const schema = Joi.object({
      amount: Joi.number().positive().required().messages({
        'number.base': 'Amount must be a number',
        'number.positive': 'Amount must be greater than 0',
        'any.required': 'Amount is required'
      }),
      description: Joi.string().max(500).optional().messages({
        'string.max': 'Description cannot exceed 500 characters'
      })
    });

    try {
      await schema.validateAsync(obj);
      return { passed: true };
    } catch (error: any) {
      return AppError.formatInputError(error);
    }
  }
} 