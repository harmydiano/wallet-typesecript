import AppProcessor from '../_core/app.processor';
import AppResponse from '../../../lib/api/app-response';
import AppError from '../../../lib/api/app-error';
import lang from '../../lang';
import { BAD_REQUEST, NOT_FOUND, OK } from '../../../utils/constants';
import _ from 'lodash';
import axios from 'axios';

/**
 * The UserProcessor class
 */
class UserProcessor extends AppProcessor {
  /**
   * Check if user can be created (not blacklisted, not duplicate)
   * @param {Object} object The object properties
   * @return {Object|true} returns AppError if user cannot be created, otherwise true
   */
  static async canCreate(object: any) {
    // Check if user already exists by email
    const existingUser = await object.model.findByEmail?.(object.email);
    if (existingUser) {
      return new AppError(lang.users.email_exists, BAD_REQUEST);
    }
    // Check if user already exists by phone
    const existingPhone = await object.model.findByPhone?.(object.phone);
    if (existingPhone) {
      return new AppError(lang.users.phone_exists, BAD_REQUEST);
    }
    // Check if user already exists by bvn
    const existingBvn = await object.model.findOne?.({ bvn: object.bvn });
    if (existingBvn) {
      return new AppError('User with this BVN already exists', BAD_REQUEST);
    }
    // Check if user is in Lendsqr Adjutor Karma blacklist
    const isBlacklisted = await this.checkBlacklist(object.bvn);
    if (isBlacklisted) {
      return new AppError(lang.users.blacklisted, BAD_REQUEST);
    }
    return true;
  }

  /**
   * Check if user exists by email
   * @param {string} email The email to check
   * @return {Object} returns the user object or null
   */
  static async userExists(email: string) {
    // This will be implemented by the model
    return null;
  }

  /**
   * Check if user exists by phone
   * @param {string} phone The phone to check
   * @return {Object} returns the user object or null
   */
  static async userExistsByPhone(phone: string) {
    // This will be implemented by the model
    return null;
  }

  /**
   * Check Lendsqr Adjutor Karma blacklist
   * @param {string} bvn The BVN to check
   * @return {boolean} returns true if user is blacklisted
   */
  static async checkBlacklist(bvn: string): Promise<boolean> {
    if (process.env.NODE_ENV === 'test') {
      return false; // Always allow in test mode
    }
    try {
      const apiKey = process.env.LENDSQR_API_KEY;
      if (!apiKey) {
        console.error('LENDSQR_API_KEY is not set');
        return false;
      }
      const url = `https://adjutor.lendsqr.com/v2/verification/karma/${encodeURIComponent(bvn)}`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      const data = response.data && response.data.data;
      // Only return true if identity_type is 'BVN', matches BVN, and default_date and reporting_entity are present
      if (
        data &&
        data.karma_identity_type &&
        data.karma_identity_type.identity_type === 'BVN' &&
        data.karma_identity &&
        data.karma_identity === bvn &&
        data.default_date &&
        data.reporting_entity
      ) {
        return true;
      }
      // If any required field is missing, not blacklisted
      return false;
    } catch (error: any) {
      // If API is not available, log the error but don't block user creation
      console.error('Error checking blacklist:', error?.response?.data || error.message);
      return false;
    }
  }

  /**
   * Check if user can login (exists, not blacklisted, password correct)
   */
  static async canLogin({ email, password, user }: { email: string; password: string; user: any }) {
    if (!user) {
      return new AppError(lang.users.invalid_credentials, BAD_REQUEST);
    }
    if (user.is_blacklisted) {
      return new AppError(lang.users.suspended, BAD_REQUEST);
    }
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return new AppError(lang.users.invalid_credentials, BAD_REQUEST);
    }
    return user;
  }

  /**
   * Check if user can be retrieved (userId present and user exists)
   * @param {Object} object The object properties
   * @return {Object|true} returns AppError if user cannot be retrieved, otherwise true
   */
  static async canGet(user : { user: any }) {
    if (!user) {
      return new AppError(lang.users.not_authenticated, BAD_REQUEST);
    }
    return true;
  }

  /**
   * Generate account number for wallet
   * @return {string} returns a unique account number
   */
  static generateAccountNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `WAL${timestamp.slice(-8)}${random}`;
  }

  /**
   * Hash password and construct user data object
   */
  static async createUserData(obj: any) {
    const saltRounds = 10;
    const passwordHash = await require('bcryptjs').hash(obj.password, saltRounds);
    return {
      email: obj.email,
      phone: obj.phone,
      first_name: obj.first_name,
      last_name: obj.last_name,
      password_hash: passwordHash,
      bvn: obj.bvn
    };
  }

  /**
   * Construct wallet data object for a user
   */
  static createWalletData(user: any) {
    const accountNumber = this.generateAccountNumber();
    return {
      user_id: user.id,
      account_number: accountNumber,
      balance: 0,
      currency: 'NGN',
      is_active: true
    };
  }

  /**
   * Format user and wallet response object
   */
  static formatUserWalletResponse(user: any, wallet: any) {
    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        first_name: user.first_name,
        last_name: user.last_name
      },
      wallet: wallet ? {
        id: wallet.id,
        account_number: wallet.account_number,
        balance: typeof wallet.balance === 'string' ? parseFloat(wallet.balance) : wallet.balance,
        currency: wallet.currency
      } : null
    };
  }

  /**
   * Generate JWT token for user
   */
  static generateToken(user: any) {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
  }

  /**
   * @param {Object} options required for response
   * @return {Promise<Object>}
   */
  static async getResponse({ model, value, code, message, count, token, email }: any) {
    try {
      const meta = AppResponse.getSuccessMeta();
      _.extend(meta, { status_code: code });
      if (message) {
        meta.message = message;
      }
      // Always put token inside data
      let data = value;
      if (token) {
        data = { ...value, token };
      }
      return {
        success: true,
        data,
        message: meta.message,
        ...('status_code' in meta ? { status_code: meta.status_code } : {})
      };
    } catch (e) {
      throw e;
    }
  }
}

export default UserProcessor; 