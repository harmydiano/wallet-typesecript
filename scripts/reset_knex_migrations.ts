#!/usr/bin/env ts-node

const knex = require('knex');
const config = require('../src/config/knexfile').default || require('../src/config/knexfile');

const environment = process.env.NODE_ENV || 'development';
const dbConfig = config[environment];

async function resetKnexMigrations() {
  const db = knex(dbConfig);
  try {
    await db.raw('DROP TABLE IF EXISTS knex_migrations_lock CASCADE');
    await db.raw('DROP TABLE IF EXISTS knex_migrations CASCADE');
    console.log('Successfully dropped knex_migrations and knex_migrations_lock tables.');
  } catch (err) {
    console.error('Error resetting migration tables:', err);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

resetKnexMigrations(); 