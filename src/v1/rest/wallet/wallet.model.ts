/**
 * Wallet Schema
 */
import { db } from '../../../setup/database';
import AppModel from '../_core/app.model';
import WalletProcessor from './wallet.processor';

class Wallet extends AppModel {
  public tableName: string = 'wallets';
  public fillables: string[] = ['user_id', 'account_number', 'balance', 'currency', 'is_active'];
  public updateFillables: string[] = ['balance', 'is_active'];
  public uniques: string[] = ['account_number'];

  // Schema definition
  public schema = {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: 'integer',
    },
    user_id: {
      type: 'integer',
      allowNull: false,
      references: {
        table: 'users',
        field: 'id'
      }
    },
    account_number: {
      type: 'string',
      allowNull: false,
      maxLength: 20,
      unique: true
    },
    balance: {
      type: 'decimal',
      allowNull: false,
      defaultValue: 0.00
    },
    currency: {
      type: 'string',
      allowNull: false,
      maxLength: 3,
      defaultValue: 'NGN'
    },
    is_active: {
      type: 'boolean',
      defaultValue: true
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

  async findByUserId(userId: number) {
    return this.findOne({ user_id: userId });
  }

  async findByAccountNumber(accountNumber: string) {
    return this.findOne({ account_number: accountNumber });
  }

  async updateBalance(id: number, newBalance: number) {
    return this.update(id, { balance: newBalance });
  }

  async getWalletWithUser(walletId: number) {
    return db(this.tableName)
      .join('users', 'wallets.user_id', 'users.id')
      .where('wallets.id', walletId)
      .select(
        'wallets.*',
        'users.first_name',
        'users.last_name',
        'users.email',
        'users.phone'
      )
      .first();
  }
}

const walletModel = new Wallet();

/**
 * @param {Model} model required for response
 * @return {Object} The processor class instance object
 */
walletModel.getProcessor = (model: any) => {
  return new WalletProcessor(model);
};

/**
 * @typedef Wallet
 */
export default walletModel; 