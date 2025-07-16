import { Knex } from 'knex';
import config from './default';

// SSL configuration for cloud databases
const sslConfig = {
  rejectUnauthorized: false, // Set to true in production if you have proper SSL certificates
  ssl: true
};

// Base configuration for all environments
const baseConfig = {
  client: 'postgresql',
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './src/database/migrations'
  },
  seeds: {
    directory: './src/database/seeds'
  }
};

const knexConfig: { [key: string]: Knex.Config } = {
  development: {
    ...baseConfig,
    connection: process.env.DATABASE_URL || {
      host: config.databases.sql.host,
      port: config.databases.sql.port,
      database: config.databases.sql.name,
      user: config.databases.sql.user,
      password: config.databases.sql.password,
      ...sslConfig
    }
  },

  test: {
    ...baseConfig,
    connection: process.env.DATABASE_URL || {
      host: config.databases.sql.host,
      port: config.databases.sql.port,
      database: config.databases.sql.name + '_test',
      user: config.databases.sql.user,
      password: config.databases.sql.password,
      ...sslConfig
    }
  },

  production: {
    ...baseConfig,
    connection: process.env.DATABASE_URL || {
      host: config.databases.sql.host,
      port: config.databases.sql.port,
      database: config.databases.sql.name,
      user: config.databases.sql.user,
      password: config.databases.sql.password,
      ...sslConfig
    }
  }
};

export default knexConfig; 