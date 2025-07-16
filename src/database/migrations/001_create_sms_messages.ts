import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('sms_messages', (table) => {
    table.increments('id').primary();
    table.string('to', 16).notNullable();
    table.string('from', 16).notNullable();
    table.text('text').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['to']);
    table.index(['from']);
    table.index(['created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('sms_messages');
} 