/**
 * User Schema
 */
import { db } from '../../../setup/database';
import AppModel from '../_core/app.model';
import UserProcessor from './user.processor';

class User extends AppModel {
  public tableName: string = 'users';
  public fillables: string[] = ['email', 'phone', 'first_name', 'last_name', 'password_hash', 'bvn'];
  public updateFillables: string[] = ['first_name', 'last_name', 'phone'];
  public uniques: string[] = ['email', 'phone', 'bvn'];

  // Schema definition
  public schema = {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: 'integer',
    },
    email: {
      type: 'string',
      allowNull: false,
      maxLength: 255,
      unique: true
    },
    phone: {
      type: 'string',
      allowNull: false,
      maxLength: 20,
      unique: true
    },
    first_name: {
      type: 'string',
      allowNull: false,
      maxLength: 100
    },
    last_name: {
      type: 'string',
      allowNull: false,
      maxLength: 100
    },
    password_hash: {
      type: 'string',
      allowNull: false,
      maxLength: 255
    },
    bvn: {
      type: 'string',
      allowNull: false,
      maxLength: 11,
      unique: true
    },
    is_blacklisted: {
      type: 'boolean',
      defaultValue: false
    },
    blacklist_reason: {
      type: 'string',
      maxLength: 500
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
  
  async findById(id: string) {
    return this.findOne({ id });
  }

  async findByEmail(email: string) {
    return this.findOne({ email });
  }

  async findByPhone(phone: string) {
    return this.findOne({ phone });
  }

  async markAsBlacklisted(id: number, reason: string) {
    return this.update(id, { is_blacklisted: true, blacklist_reason: reason });
  }
}

const userModel = new User();

/**
 * @param {Model} model required for response
 * @return {Object} The processor class instance object
 */
userModel.getProcessor = (model: any) => {
  return new UserProcessor(model);
};

/**
 * @typedef User
 */
export default userModel; 