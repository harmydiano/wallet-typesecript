import AppProcessor from '../_core/app.processor';
import AppResponse from '../../../lib/api/app-response';
import AppError from '../../../lib/api/app-error';
import lang from '../../lang';
import { BAD_REQUEST, NOT_FOUND, OK } from '../../../utils/constants';
import _ from 'lodash';

/**
 * The TransactionProcessor class
 */
class TransactionProcessor extends AppProcessor {
  /**
   * Validate transaction amount
   * @param {number} amount The transaction amount
   * @return {Object} returns the api error if amount is invalid
   */
  static async validateAmount(amount: number) {
    if (amount <= 0) {
      return new AppError('Amount must be greater than 0', BAD_REQUEST);
    }
    return true;
  }

  /**
   * Format transaction for response
   * @param {Object} transaction The transaction object
   * @return {Object} returns formatted transaction
   */
  static formatTransaction(transaction: any) {
    return {
      id: transaction.id,
      reference: transaction.reference,
      type: transaction.type,
      status: transaction.status,
      amount: parseFloat(transaction.amount),
      fee: parseFloat(transaction.fee),
      balance_before: parseFloat(transaction.balance_before),
      balance_after: parseFloat(transaction.balance_after),
      description: transaction.description,
      metadata: transaction.metadata,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at
    };
  }

  /**
   * Format transaction with details for response
   * @param {Object} transaction The transaction object with details
   * @return {Object} returns formatted transaction with details
   */
  static formatTransactionWithDetails(transaction: any) {
    return {
      id: transaction.id,
      reference: transaction.reference,
      type: transaction.type,
      status: transaction.status,
      amount: parseFloat(transaction.amount),
      fee: parseFloat(transaction.fee),
      balance_before: parseFloat(transaction.balance_before),
      balance_after: parseFloat(transaction.balance_after),
      description: transaction.description,
      metadata: transaction.metadata,
      sender: {
        account_number: transaction.sender_account_number,
        first_name: transaction.sender_first_name,
        last_name: transaction.sender_last_name,
        email: transaction.sender_email
      },
      recipient: transaction.recipient_account_number ? {
        account_number: transaction.recipient_account_number,
        first_name: transaction.recipient_first_name,
        last_name: transaction.recipient_last_name,
        email: transaction.recipient_email
      } : null,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at
    };
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

export default TransactionProcessor; 