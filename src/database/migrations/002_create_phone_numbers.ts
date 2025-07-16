import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('phone_number', (table) => {
    table.increments('id').primary();
    table.string('number', 16).notNullable().unique();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['number']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('phone_number');
} 