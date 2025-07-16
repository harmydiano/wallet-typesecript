import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('transactions', (table) => {
    table.increments('id').primary();
    table.string('reference', 50).notNullable().unique();
    table.integer('wallet_id').notNullable().unsigned().references('id').inTable('wallets').onDelete('CASCADE');
    table.integer('recipient_wallet_id').unsigned().references('id').inTable('wallets').onDelete('CASCADE');
    table.enum('type', ['funding', 'transfer', 'withdrawal']).notNullable();
    table.enum('status', ['pending', 'completed', 'failed', 'cancelled']).notNullable().defaultTo('pending');
    table.decimal('amount', 15, 2).notNullable();
    table.decimal('fee', 15, 2).notNullable().defaultTo(0.00);
    table.decimal('balance_before', 15, 2).notNullable();
    table.decimal('balance_after', 15, 2).notNullable();
    table.text('description');
    table.jsonb('metadata');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['reference']);
    table.index(['wallet_id']);
    table.index(['recipient_wallet_id']);
    table.index(['type']);
    table.index(['status']);
    table.index(['created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('transactions');
} 