import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('wallets', (table) => {
    table.increments('id').primary();
    table.integer('user_id').notNullable().unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.string('account_number', 20).notNullable().unique();
    table.decimal('balance', 15, 2).notNullable().defaultTo(0.00);
    table.string('currency', 3).notNullable().defaultTo('NGN');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['user_id']);
    table.index(['account_number']);
    table.index(['is_active']);
    table.index(['created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('wallets');
} 