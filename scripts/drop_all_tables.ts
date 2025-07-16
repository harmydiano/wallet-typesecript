const knex = require('knex');
const config = require('../knexfile.ts');

const environment = process.env.NODE_ENV || 'development';
const dbConfig = config[environment];

async function dropAllTables() {
  const db = knex(dbConfig);
  try {
    console.log('Connected to database:', dbConfig.connection);
    const tables = await db.raw(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public';
    `);
    if (!tables.rows.length) {
      console.log('No tables found.');
    } else {
      console.log('Tables found:', tables.rows.map((r: { tablename: string }) => r.tablename));
    }
    for (const row of tables.rows) {
      await db.raw(`DROP TABLE IF EXISTS "${row.tablename}" CASCADE;`);
      console.log(`Dropped table: ${row.tablename}`);
    }
    console.log('All tables dropped.');
  } catch (err) {
    console.error('Error dropping tables:', err);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

dropAllTables(); 