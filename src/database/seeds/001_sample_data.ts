import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data
  await knex('sms_messages').del();

  // Insert sample data
  await knex('sms_messages').insert([
    {
      to: '1234567890',
      from: '0987654321',
      text: 'Hello, this is a sample SMS message'
    },
    {
      to: '5555555555',
      from: '1111111111',
      text: 'Another sample message for testing'
    }
  ]);
} 