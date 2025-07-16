/**
 * Transaction Schema
 */
import { db } from '../../../setup/database';
import AppModel from '../_core/app.model';
import TransactionProcessor from './transaction.processor';

class Transaction extends AppModel {
  public tableName: string = 'transactions';
  public fillables: string[] = ['reference', 'wallet_id', 'recipient_wallet_id', 'type', 'status', 'amount', 'fee', 'balance_before', 'balance_after', 'description', 'metadata'];
  public updateFillables: string[] = ['status', 'description', 'metadata'];
  public uniques: string[] = ['reference'];

  // Schema definition
  public schema = {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: 'integer',
    },
    reference: {
      type: 'string',
      allowNull: false,
      maxLength: 50,
      unique: true
    },
    wallet_id: {
      type: 'integer',
      allowNull: false,
      references: {
        table: 'wallets',
        field: 'id'
      }
    },
    recipient_wallet_id: {
      type: 'integer',
      references: {
        table: 'wallets',
        field: 'id'
      }
    },
    type: {
      type: 'enum',
      values: ['funding', 'transfer', 'withdrawal'],
      allowNull: false
    },
    status: {
      type: 'enum',
      values: ['pending', 'completed', 'failed', 'cancelled'],
      allowNull: false,
      defaultValue: 'pending'
    },
    amount: {
      type: 'decimal',
      allowNull: false
    },
    fee: {
      type: 'decimal',
      allowNull: false,
      defaultValue: 0.00
    },
    balance_before: {
      type: 'decimal',
      allowNull: false
    },
    balance_after: {
      type: 'decimal',
      allowNull: false
    },
    description: {
      type: 'text'
    },
    metadata: {
      type: 'jsonb'
    },
    created_at: {
      type: 'timestamp',
      defaultValue: 'now()'
    },
    updated_at: {
      type: 'timestamp',
      defaultValue: 'now()'
    }
  };

  // Database operations
  async findAll(query: any = {}) {
    return db(this.tableName).where(query);
  }

  async findOne(query: any) {
    const result = await db(this.tableName).where(query).first();
    return result || null;
  }

  async create(data: any) {
    const [result] = await db(this.tableName).insert(data).returning('*');
    return result;
  }

  async update(id: number, data: any) {
    const [result] = await db(this.tableName)
      .where({ id })
      .update(data)
      .returning('*');
    return result || null;
  }

  async count(query: any = {}) {
    const result = await db(this.tableName).where(query).count('* as count').first();
    return parseInt(result?.count as string) || 0;
  }

  async findByWalletId(walletId: number, limit: number = 50, offset: number = 0) {
    return db(this.tableName)
      .where({ wallet_id: walletId })
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  async findByReference(reference: string) {
    return this.findOne({ reference });
  }

  async getTransactionWithDetails(transactionId: number) {
    return db(this.tableName)
      .join('wallets as sender_wallet', 'transactions.wallet_id', 'sender_wallet.id')
      .join('users as sender_user', 'sender_wallet.user_id', 'sender_user.id')
      .leftJoin('wallets as recipient_wallet', 'transactions.recipient_wallet_id', 'recipient_wallet.id')
      .leftJoin('users as recipient_user', 'recipient_wallet.user_id', 'recipient_user.id')
      .where('transactions.id', transactionId)
      .select(
        'transactions.*',
        'sender_wallet.account_number as sender_account_number',
        'sender_user.first_name as sender_first_name',
        'sender_user.last_name as sender_last_name',
        'sender_user.email as sender_email',
        'recipient_wallet.account_number as recipient_account_number',
        'recipient_user.first_name as recipient_first_name',
        'recipient_user.last_name as recipient_last_name',
        'recipient_user.email as recipient_email'
      )
      .first();
  }

  async getTransactionHistory(walletId: number, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    
    const transactions = await db(this.tableName)
      .where({ wallet_id: walletId })
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const total = await this.count({ wallet_id: walletId });

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}

const transactionModel = new Transaction();

/**
 * @param {Model} model required for response
 * @return {Object} The processor class instance object
 */
transactionModel.getProcessor = (model: any) => {
  return new TransactionProcessor(model);
};

/**
 * @typedef Transaction
 */
export default transactionModel; 