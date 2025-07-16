import { Request, Response, NextFunction } from 'express';
import AppController, { RequestWithObject } from '../_core/app.controller';
import AppError from '../../../lib/api/app-error';
import WalletValidation, { WalletFundingRequest, WalletTransferRequest, WalletWithdrawalRequest } from './wallet.validation';
import WalletProcessor from './wallet.processor';
import Wallet from './wallet.model';
import Transaction from '../transaction/transaction.model';
import TransactionProcessor from '../transaction/transaction.processor';
import lang from '../../lang';
import { BAD_REQUEST, OK, CREATED, NOT_FOUND } from '../../../utils/constants';

export default class WalletController extends AppController {
  constructor() {
    super(Wallet);
  }

  /**
   * Handle wallet funding
   */
  async fund(req: RequestWithObject, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return next(new AppError('User not authenticated', BAD_REQUEST));
      }

      const obj = req.body as WalletFundingRequest;
      
      // Validate request
      const validator = await new WalletValidation().funding(obj);
      if (!validator.passed) {
        return next(new AppError(lang.get('error').inputs, BAD_REQUEST, validator.errors));
      }

      // Get user's wallet
      const wallet = await Wallet.findByUserId(userId);
      if (!wallet) {
        return next(new AppError('Wallet not found', NOT_FOUND));
      }

      // Process funding
      const result = await WalletProcessor.processFunding(
        wallet.id,
        obj.amount,
        obj.description || 'Wallet funding'
      );

      // Get response
      const response = await WalletProcessor.getResponse({
        code: OK,
        message: 'Wallet funded successfully',
        value: {
          transaction: result.transaction,
          new_balance: result.newBalance,
          wallet: {
            id: wallet.id,
            account_number: wallet.account_number,
            balance: result.newBalance,
            currency: wallet.currency
          }
        }
      });

      res.status(OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle wallet transfer
   */
  async transfer(req: RequestWithObject, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return next(new AppError('User not authenticated', BAD_REQUEST));
      }

      const obj = req.body as WalletTransferRequest;
      
      // Validate request
      const validator = await new WalletValidation().transfer(obj);
      if (!validator.passed) {
        return next(new AppError(lang.get('error').inputs, BAD_REQUEST, validator.errors));
      }

      // Get user's wallet
      const wallet = await Wallet.findByUserId(userId);
      if (!wallet) {
        return next(new AppError('Wallet not found', NOT_FOUND));
      }

      // Process transfer
      const result = await WalletProcessor.processTransfer(
        wallet.id,
        obj.to_account_number,
        obj.amount,
        obj.description || 'Wallet transfer'
      );

      // Get response
      const response = await WalletProcessor.getResponse({
        code: OK,
        message: 'Transfer completed successfully',
        value: {
          debit_transaction: result.debitTransaction,
          credit_transaction: result.creditTransaction,
          new_balance: result.newBalance,
          wallet: {
            id: wallet.id,
            account_number: wallet.account_number,
            balance: result.newBalance,
            currency: wallet.currency
          }
        }
      });

      res.status(OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle wallet withdrawal
   */
  async withdraw(req: RequestWithObject, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return next(new AppError('User not authenticated', BAD_REQUEST));
      }

      const obj = req.body as WalletWithdrawalRequest;
      
      // Validate request
      const validator = await new WalletValidation().withdrawal(obj);
      if (!validator.passed) {
        return next(new AppError(lang.get('error').inputs, BAD_REQUEST, validator.errors));
      }

      // Get user's wallet
      const wallet = await Wallet.findByUserId(userId);
      if (!wallet) {
        return next(new AppError('Wallet not found', NOT_FOUND));
      }

      // Process withdrawal
      const result = await WalletProcessor.processWithdrawal(
        wallet.id,
        obj.amount,
        obj.description || 'Wallet withdrawal'
      );

      // Get response
      const response = await WalletProcessor.getResponse({
        code: OK,
        message: 'Withdrawal completed successfully',
        value: {
          transaction: result.transaction,
          new_balance: result.newBalance,
          wallet: {
            id: wallet.id,
            account_number: wallet.account_number,
            balance: result.newBalance,
            currency: wallet.currency
          }
        }
      });

      res.status(OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get wallet balance
   */
  async balance(req: RequestWithObject, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return next(new AppError('User not authenticated', BAD_REQUEST));
      }

      const wallet = await Wallet.findByUserId(userId);
      if (!wallet) {
        return next(new AppError('Wallet not found', NOT_FOUND));
      }

      const response = await WalletProcessor.getResponse({
        code: OK,
        message: 'Wallet balance retrieved successfully',
        value: {
          wallet: {
            id: wallet.id,
            account_number: wallet.account_number,
            balance: parseFloat(wallet.balance),
            currency: wallet.currency,
            is_active: wallet.is_active
          }
        }
      });

      res.status(OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get transaction history
   */
  async transactions(req: RequestWithObject, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return next(new AppError('User not authenticated', BAD_REQUEST));
      }

      const wallet = await Wallet.findByUserId(userId);
      if (!wallet) {
        return next(new AppError('Wallet not found', NOT_FOUND));
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const history = await Transaction.getTransactionHistory(wallet.id, page, limit);

      const response = await WalletProcessor.getResponse({
        code: OK,
        message: 'Transaction history retrieved successfully',
        value: {
          transactions: history.transactions.map(TransactionProcessor.formatTransaction),
          pagination: history.pagination
        }
      });

      res.status(OK).json(response);
    } catch (error) {
      next(error);
    }
  }
} 