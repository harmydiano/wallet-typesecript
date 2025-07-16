import AppProcessor from '../_core/app.processor';
import AppResponse from '../../../lib/api/app-response';
import AppError from '../../../lib/api/app-error';
import lang from '../../lang';
import { BAD_REQUEST, NOT_FOUND, OK } from '../../../utils/constants';
import _ from 'lodash';
import { db } from '../../../setup/database';
import Transaction from '../transaction/transaction.model';

/**
 * The WalletProcessor class
 */
class WalletProcessor extends AppProcessor {
  /**
   * Check if wallet can perform transaction
   * @param {Object} wallet The wallet object
   * @param {number} amount The transaction amount
   * @return {Object} returns the api error if transaction cannot be performed
   */
  static async canPerformTransaction(wallet: any, amount: number) {
    if (!wallet) {
      return new AppError('Wallet not found', NOT_FOUND);
    }

    if (!wallet.is_active) {
      return new AppError('Wallet is inactive', BAD_REQUEST);
    }

    if (amount <= 0) {
      return new AppError('Amount must be greater than 0', BAD_REQUEST);
    }

    return true;
  }

  /**
   * Check if wallet has sufficient balance
   * @param {Object} wallet The wallet object
   * @param {number} amount The transaction amount
   * @return {Object} returns the api error if insufficient balance
   */
  static async hasSufficientBalance(wallet: any, amount: number) {
    if (parseFloat(wallet.balance) < amount) {
      return new AppError('Insufficient balance', BAD_REQUEST);
    }
    return true;
  }

  /**
   * Generate transaction reference
   * @return {string} returns a unique transaction reference
   */
  static generateTransactionReference(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TXN${timestamp.slice(-8)}${random}`;
  }

  /**
   * Process wallet funding
   * @param {number} walletId The wallet ID
   * @param {number} amount The amount to fund
   * @param {string} description The transaction description
   * @return {Promise<Object>} returns the transaction result
   */
  static async processFunding(walletId: number, amount: number, description: string = 'Wallet funding') {
    const wallet = await db('wallets').where({ id: walletId }).first();
    if (!wallet) {
      throw new AppError('Wallet not found', NOT_FOUND);
    }

    const canPerform = await this.canPerformTransaction(wallet, amount);
    if (canPerform instanceof AppError) {
      throw canPerform;
    }

    const reference = this.generateTransactionReference();
    const balanceBefore = parseFloat(wallet.balance);
    const balanceAfter = balanceBefore + amount;

    // Use transaction for atomicity
    return await db.transaction(async (trx) => {
      // Create transaction record
      const transactionData = {
        reference,
        wallet_id: walletId,
        type: 'funding',
        status: 'completed',
        amount,
        fee: 0.00,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description,
        metadata: { source: 'external' }
      };

      const [transaction] = await trx('transactions').insert(transactionData).returning('*');

      // Update wallet balance
      await trx('wallets').where({ id: walletId }).update({ balance: balanceAfter });

      return {
        transaction,
        newBalance: balanceAfter
      };
    });
  }

  /**
   * Process wallet transfer
   * @param {number} fromWalletId The source wallet ID
   * @param {string} toAccountNumber The destination account number
   * @param {number} amount The amount to transfer
   * @param {string} description The transaction description
   * @return {Promise<Object>} returns the transaction result
   */
  static async processTransfer(fromWalletId: number, toAccountNumber: string, amount: number, description: string = 'Wallet transfer') {
    const fromWallet = await db('wallets').where({ id: fromWalletId }).first();
    if (!fromWallet) {
      throw new AppError('Source wallet not found', NOT_FOUND);
    }

    const toWallet = await db('wallets').where({ account_number: toAccountNumber }).first();
    if (!toWallet) {
      throw new AppError('Destination wallet not found', NOT_FOUND);
    }

    if (fromWallet.id === toWallet.id) {
      throw new AppError('Cannot transfer to same wallet', BAD_REQUEST);
    }

    const canPerform = await this.canPerformTransaction(fromWallet, amount);
    if (canPerform instanceof AppError) {
      throw canPerform;
    }

    const hasBalance = await this.hasSufficientBalance(fromWallet, amount);
    if (hasBalance instanceof AppError) {
      throw hasBalance;
    }

    const canReceive = await this.canPerformTransaction(toWallet, amount);
    if (canReceive instanceof AppError) {
      throw canReceive;
    }

    const reference = this.generateTransactionReference();
    const fee = 0.00; // No fee for internal transfers
    const fromBalanceBefore = parseFloat(fromWallet.balance);
    const fromBalanceAfter = fromBalanceBefore - amount - fee;
    const toBalanceBefore = parseFloat(toWallet.balance);
    const toBalanceAfter = toBalanceBefore + amount;

    // Use database transaction to ensure consistency
    return await db.transaction(async (trx) => {
      // Create debit transaction
      const debitTransaction = await trx('transactions').insert({
        reference: `${reference}_DEBIT`,
        wallet_id: fromWalletId,
        recipient_wallet_id: toWallet.id,
        type: 'transfer',
        status: 'completed',
        amount: -amount,
        fee: -fee,
        balance_before: fromBalanceBefore,
        balance_after: fromBalanceAfter,
        description: `Transfer to ${toAccountNumber}`,
        metadata: { transfer_reference: reference }
      }).returning('*');

      // Create credit transaction
      const creditTransaction = await trx('transactions').insert({
        reference: `${reference}_CREDIT`,
        wallet_id: toWallet.id,
        recipient_wallet_id: fromWalletId,
        type: 'transfer',
        status: 'completed',
        amount,
        fee: 0.00,
        balance_before: toBalanceBefore,
        balance_after: toBalanceAfter,
        description: `Transfer from ${fromWallet.account_number}`,
        metadata: { transfer_reference: reference }
      }).returning('*');

      // Update wallet balances
      await trx('wallets').where({ id: fromWalletId }).update({ balance: fromBalanceAfter });
      await trx('wallets').where({ id: toWallet.id }).update({ balance: toBalanceAfter });

      return {
        debitTransaction: debitTransaction[0],
        creditTransaction: creditTransaction[0],
        newBalance: fromBalanceAfter
      };
    });
  }

  /**
   * Process wallet withdrawal
   * @param {number} walletId The wallet ID
   * @param {number} amount The amount to withdraw
   * @param {string} description The transaction description
   * @return {Promise<Object>} returns the transaction result
   */
  static async processWithdrawal(walletId: number, amount: number, description: string = 'Wallet withdrawal') {
    const wallet = await db('wallets').where({ id: walletId }).first();
    if (!wallet) {
      throw new AppError('Wallet not found', NOT_FOUND);
    }

    const canPerform = await this.canPerformTransaction(wallet, amount);
    if (canPerform instanceof AppError) {
      throw canPerform;
    }

    const hasBalance = await this.hasSufficientBalance(wallet, amount);
    if (hasBalance instanceof AppError) {
      throw hasBalance;
    }

    const reference = this.generateTransactionReference();
    const balanceBefore = parseFloat(wallet.balance);
    const balanceAfter = balanceBefore - amount;

    // Use transaction for atomicity
    return await db.transaction(async (trx) => {
      // Create transaction record
      const transactionData = {
        reference,
        wallet_id: walletId,
        type: 'withdrawal',
        status: 'completed',
        amount: -amount,
        fee: 0.00,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description,
        metadata: { destination: 'external' }
      };

      const [transaction] = await trx('transactions').insert(transactionData).returning('*');

      // Update wallet balance
      await trx('wallets').where({ id: walletId }).update({ balance: balanceAfter });

      return {
        transaction,
        newBalance: balanceAfter
      };
    });
  }

  /**
   * @param {Object} options required for response
   * @return {Promise<Object>}
   */
  static async getResponse({ model, value, code, message, count, token, email }: any) {
    try {
      const meta = AppResponse.getSuccessMeta();
      if (token) {
        meta.token = token;
      }
      _.extend(meta, { status_code: code });
      if (message) {
        meta.message = message;
      }
      return AppResponse.format(meta, value);
    } catch (e) {
      throw e;
    }
  }
}

export default WalletProcessor; 