import request from 'supertest';
import app from '../src/app';
import { db } from '../src/setup/database';
import bcrypt from 'bcryptjs';

describe('User API', () => {
  beforeAll(async () => {
    // Run migrations and seeds
    await db.migrate.latest();
    await db.seed.run();
  });

  afterAll(async () => {
    await db.destroy();
  });

  beforeEach(async () => {
    // Clear users table before each test
    await db('transactions').del();
    await db('wallets').del();
    await db('users').del();
  });

  describe('POST /api/v1/users/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        phone: '+2348012345678',
        first_name: 'Test',
        last_name: 'User',
        password: 'password123',
        bvn: '12345678901'
      };

      const response = await request(app)
        .post('/api/v1/users/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.first_name).toBe(userData.first_name);
      expect(response.body.data.user.last_name).toBe(userData.last_name);
      expect(response.body.data.wallet).toBeDefined();
      expect(response.body.data.wallet.account_number).toBeDefined();
      expect(response.body.data.wallet.balance).toBe(0);
      expect(response.body.data.token).toBeDefined();
    });

    it('should return error for invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        phone: '+2348012345678',
        first_name: 'Test',
        last_name: 'User',
        password: 'password123',
        bvn: '12345678901'
      };

      const response = await request(app)
        .post('/api/v1/users/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Email must be a valid email address');
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        phone: '+2348012345678',
        first_name: 'Test',
        last_name: 'User',
        password: 'password123',
        bvn: '12345678901'
      };

      // Register first user
      await request(app)
        .post('/api/v1/users/register')
        .send(userData)
        .expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/api/v1/users/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('User with this email already exists');
    });

    it('should return error for duplicate phone', async () => {
      const userData1 = {
        email: 'test1@example.com',
        phone: '+2348012345678',
        first_name: 'Test',
        last_name: 'User',
        password: 'password123',
        bvn: '12345678901'
      };

      const userData2 = {
        email: 'test2@example.com',
        phone: '+2348012345678',
        first_name: 'Test',
        last_name: 'User',
        password: 'password123',
        bvn: '12345678902'
      };

      // Register first user
      await request(app)
        .post('/api/v1/users/register')
        .send(userData1)
        .expect(201);

      // Try to register with same phone
      const response = await request(app)
        .post('/api/v1/users/register')
        .send(userData2)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('User with this phone number already exists');
    });
  });

  describe('POST /api/v1/users/login', () => {
    beforeEach(async () => {
      // Create a test user
      const passwordHash = await bcrypt.hash('password123', 10);
      await db('users').insert({
        email: 'test@example.com',
        phone: '+2348012345678',
        first_name: 'Test',
        last_name: 'User',
        password_hash: passwordHash,
        is_blacklisted: false,
        bvn: '12345678901'
      });
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/users/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.token).toBeDefined();
    });

    it('should return error for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/users/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email or password');
    });

    it('should return error for invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/v1/users/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email or password');
    });

    // it('should return error for blacklisted user', async () => {
    //   // Mark user as blacklisted
    //   await db('users')
    //     .where({ email: 'test@example.com' })
    //     .update({ is_blacklisted: true });

    //   const loginData = {
    //     email: 'test@example.com',
    //     password: 'password123'
    //   };

    //   const response = await request(app)
    //     .post('/api/v1/users/login')
    //     .send(loginData)
    //     .expect(400);

    //   expect(response.body.success).toBe(false);
    //   expect(response.body.message).toContain('Account is suspended');
    // });
  });

  describe('GET /api/v1/users/profile', () => {
    let authToken: string;

    beforeEach(async () => {
      // Create a test user and wallet
      const passwordHash = await bcrypt.hash('password123', 10);
      const [user] = await db('users').insert({
        email: 'test@example.com',
        phone: '+2348012345678',
        first_name: 'Test',
        last_name: 'User',
        password_hash: passwordHash,
        is_blacklisted: false,
        bvn: '12345678901'
      }).returning('*');

      await db('wallets').insert({
        user_id: user.id,
        account_number: 'WAL1234567890',
        balance: 1000.00,
        currency: 'NGN',
        is_active: true
      });

      // Get auth token
      const loginResponse = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      authToken = loginResponse.body.data.token;
    });

    it('should get user profile successfully', async () => {
      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.user.first_name).toBe('Test');
      expect(response.body.data.user.last_name).toBe('User');
      expect(response.body.data.wallet).toBeDefined();
      expect(response.body.data.wallet.account_number).toBe('WAL1234567890');
      expect(response.body.data.wallet.balance).toBe(1000);
    });

    it('should return error without authentication token', async () => {
      const response = await request(app)
        .get('/api/v1/users/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No token provided');
    });
  });
}); 