import { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data
  await knex('transactions').del();
  await knex('wallets').del();
  await knex('users').del();

  // Hash passwords
  const passwordHash = await bcrypt.hash('password123', 10);

  // Insert sample users
  const users = await knex('users').insert([
    {
      email: 'john.doe@example.com',
      phone: '+2348012345678',
      first_name: 'John',
      last_name: 'Doe',
      password_hash: passwordHash,
      is_blacklisted: false,
      bvn: '12345678901'
    },
    {
      email: 'jane.smith@example.com',
      phone: '+2348098765432',
      first_name: 'Jane',
      last_name: 'Smith',
      password_hash: passwordHash,
      is_blacklisted: false,
      bvn: '12345678902'
    },
    {
      email: 'bob.wilson@example.com',
      phone: '+2348055555555',
      first_name: 'Bob',
      last_name: 'Wilson',
      password_hash: passwordHash,
      is_blacklisted: false,
      bvn: '12345678903'
    }
  ]).returning('*');

  // Insert sample wallets
  const wallets = await knex('wallets').insert([
    {
      user_id: users[0].id,
      account_number: 'WAL1234567890',
      balance: 10000.00,
      currency: 'NGN',
      is_active: true
    },
    {
      user_id: users[1].id,
      account_number: 'WAL0987654321',
      balance: 5000.00,
      currency: 'NGN',
      is_active: true
    },
    {
      user_id: users[2].id,
      account_number: 'WAL5555555555',
      balance: 2500.00,
      currency: 'NGN',
      is_active: true
    }
  ]).returning('*');

  // Insert sample transactions
  await knex('transactions').insert([
    {
      reference: 'TXN1234567890',
      wallet_id: wallets[0].id,
      type: 'funding',
      status: 'completed',
      amount: 10000.00,
      fee: 0.00,
      balance_before: 0.00,
      balance_after: 10000.00,
      description: 'Initial wallet funding',
      metadata: { source: 'external' }
    },
    {
      reference: 'TXN0987654321',
      wallet_id: wallets[1].id,
      type: 'funding',
      status: 'completed',
      amount: 5000.00,
      fee: 0.00,
      balance_before: 0.00,
      balance_after: 5000.00,
      description: 'Initial wallet funding',
      metadata: { source: 'external' }
    },
    {
      reference: 'TXN5555555555',
      wallet_id: wallets[2].id,
      type: 'funding',
      status: 'completed',
      amount: 2500.00,
      fee: 0.00,
      balance_before: 0.00,
      balance_after: 2500.00,
      description: 'Initial wallet funding',
      metadata: { source: 'external' }
    }
  ]);
} 