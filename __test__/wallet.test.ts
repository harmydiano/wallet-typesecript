import request from 'supertest';
import app from '../src/app';
import { db } from '../src/setup/database';
import bcrypt from 'bcryptjs';

describe('Wallet API', () => {
  let authToken: string;
  let userWallet: any;
  let recipientWallet: any;

  beforeAll(async () => {
    // Run migrations and seeds
    await db.migrate.latest();
    await db.seed.run();
  });

  afterAll(async () => {
    await db.destroy();
  });

  beforeEach(async () => {
    // Clear data
    await db('transactions').del();
    await db('wallets').del();
    await db('users').del();

    // Create test users and wallets
    const passwordHash = await bcrypt.hash('password123', 10);
    
    const [user1] = await db('users').insert({
      email: 'user1@example.com',
      phone: '+2348012345678',
      first_name: 'User',
      last_name: 'One',
      password_hash: passwordHash,
      is_blacklisted: false,
      bvn: '12345678901'
    }).returning('*');

    const [user2] = await db('users').insert({
      email: 'user2@example.com',
      phone: '+2348098765432',
      first_name: 'User',
      last_name: 'Two',
      password_hash: passwordHash,
      is_blacklisted: false,
      bvn: '12345678902'
    }).returning('*');

    [userWallet] = await db('wallets').insert({
      user_id: user1.id,
      account_number: 'WAL1234567890',
      balance: 1000.00,
      currency: 'NGN',
      is_active: true
    }).returning('*');

    [recipientWallet] = await db('wallets').insert({
      user_id: user2.id,
      account_number: 'WAL0987654321',
      balance: 500.00,
      currency: 'NGN',
      is_active: true
    }).returning('*');

    // Get auth token
    const loginResponse = await request(app)
      .post('/api/v1/users/login')
      .send({
        email: 'user1@example.com',
        password: 'password123'
      });

    authToken = loginResponse.body.data.token;
  });

  describe('POST /api/v1/wallet/fund', () => {
    it('should fund wallet successfully', async () => {
      const fundData = {
        amount: 500,
        description: 'Test funding'
      };

      const response = await request(app)
        .post('/api/v1/wallet/fund')
        .set('Authorization', `Bearer ${authToken}`)
        .send(fundData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.new_balance).toBe(1500);
      expect(response.body.data.transaction.type).toBe('funding');
      expect(response.body.data.transaction.status).toBe('completed');
      expect(Number(response.body.data.transaction.amount)).toBe(500);
    });

    it('should return error for negative amount', async () => {
      const fundData = {
        amount: -100,
        description: 'Test funding'
      };

      const response = await request(app)
        .post('/api/v1/wallet/fund')
        .set('Authorization', `Bearer ${authToken}`)
        .send(fundData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Amount must be greater than 0');
    });

    it('should return error without authentication', async () => {
      const fundData = {
        amount: 500,
        description: 'Test funding'
      };

      const response = await request(app)
        .post('/api/v1/wallet/fund')
        .send(fundData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No token provided');
    });
  });

  describe('POST /api/v1/wallet/transfer', () => {
    it('should transfer funds successfully', async () => {
      const transferData = {
        to_account_number: recipientWallet.account_number,
        amount: 200,
        description: 'Test transfer'
      };

      const response = await request(app)
        .post('/api/v1/wallet/transfer')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transferData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.new_balance).toBe(800);
      expect(response.body.data.debit_transaction.type).toBe('transfer');
      expect(response.body.data.credit_transaction.type).toBe('transfer');

      // Check recipient wallet balance
      const updatedRecipientWallet = await db('wallets')
        .where({ id: recipientWallet.id })
        .first();
      expect(parseFloat(updatedRecipientWallet.balance)).toBe(700);
    });

    it('should return error for insufficient balance', async () => {
      const transferData = {
        to_account_number: recipientWallet.account_number,
        amount: 2000,
        description: 'Test transfer'
      };

      const response = await request(app)
        .post('/api/v1/wallet/transfer')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transferData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Insufficient balance');
    });

    it('should return error for invalid account number', async () => {
      const transferData = {
        to_account_number: 'INVALID123',
        amount: 200,
        description: 'Test transfer'
      };

      const response = await request(app)
        .post('/api/v1/wallet/transfer')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transferData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Destination wallet not found');
    });

    it('should return error for transfer to same wallet', async () => {
      const transferData = {
        to_account_number: userWallet.account_number,
        amount: 200,
        description: 'Test transfer'
      };

      const response = await request(app)
        .post('/api/v1/wallet/transfer')
        .set('Authorization', `Bearer ${authToken}`)
        .send(transferData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Cannot transfer to same wallet');
    });
  });

  describe('POST /api/v1/wallet/withdraw', () => {
    it('should withdraw funds successfully', async () => {
      const withdrawData = {
        amount: 300,
        description: 'Test withdrawal'
      };

      const response = await request(app)
        .post('/api/v1/wallet/withdraw')
        .set('Authorization', `Bearer ${authToken}`)
        .send(withdrawData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.new_balance).toBe(700);
      expect(response.body.data.transaction.type).toBe('withdrawal');
      expect(response.body.data.transaction.status).toBe('completed');
      expect(Number(response.body.data.transaction.amount)).toBe(-300);
    });

    it('should return error for insufficient balance', async () => {
      const withdrawData = {
        amount: 2000,
        description: 'Test withdrawal'
      };

      const response = await request(app)
        .post('/api/v1/wallet/withdraw')
        .set('Authorization', `Bearer ${authToken}`)
        .send(withdrawData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Insufficient balance');
    });

    it('should return error for negative amount', async () => {
      const withdrawData = {
        amount: -100,
        description: 'Test withdrawal'
      };

      const response = await request(app)
        .post('/api/v1/wallet/withdraw')
        .set('Authorization', `Bearer ${authToken}`)
        .send(withdrawData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Amount must be greater than 0');
    });
  });

  describe('GET /api/v1/wallet/balance', () => {
    it('should get wallet balance successfully', async () => {
      const response = await request(app)
        .get('/api/v1/wallet/balance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.wallet.account_number).toBe('WAL1234567890');
      expect(response.body.data.wallet.balance).toBe(1000);
      expect(response.body.data.wallet.currency).toBe('NGN');
      expect(response.body.data.wallet.is_active).toBe(true);
    });

    it('should return error without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/wallet/balance')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No token provided');
    });
  });

  describe('GET /api/v1/wallet/transactions', () => {
    beforeEach(async () => {
      // Create some test transactions
      await db('transactions').insert([
        {
          reference: 'TXN1234567890',
          wallet_id: userWallet.id,
          type: 'funding',
          status: 'completed',
          amount: 1000.00,
          fee: 0.00,
          balance_before: 0.00,
          balance_after: 1000.00,
          description: 'Initial funding',
          metadata: { source: 'external' }
        },
        {
          reference: 'TXN1234567891',
          wallet_id: userWallet.id,
          type: 'transfer',
          status: 'completed',
          amount: -200.00,
          fee: 0.00,
          balance_before: 1000.00,
          balance_after: 800.00,
          description: 'Transfer to WAL0987654321',
          metadata: { transfer_reference: 'TXN1234567891' }
        }
      ]);
    });

    it('should get transaction history successfully', async () => {
      const response = await request(app)
        .get('/api/v1/wallet/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.transactions).toHaveLength(2);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.total).toBe(2);
    });

    it('should get transaction history with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/wallet/transactions?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.transactions).toHaveLength(1);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(1);
    });

    it('should return error without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/wallet/transactions')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No token provided');
    });
  });
}); 