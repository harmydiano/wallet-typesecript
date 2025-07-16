import { Knex } from 'knex';
import config from './default';

const knexConfig: { [key: string]: Knex.Config } = {
  development: {
    client: 'postgresql',
    connection: {
      host: config.databases.sql.host,
      port: config.databases.sql.port,
      database: config.databases.sql.name,
      user: config.databases.sql.user,
      password: config.databases.sql.password,
    },
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
  },

  test: {
    client: 'postgresql',
    connection: {
      host: config.databases.sql.host,
      port: config.databases.sql.port,
      database: config.databases.sql.name + '_test',
      user: config.databases.sql.user,
      password: config.databases.sql.password,
    },
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
  },

  production: {
    client: 'postgresql',
    connection: {
      host: config.databases.sql.host,
      port: config.databases.sql.port,
      database: config.databases.sql.name,
      user: config.databases.sql.user,
      password: config.databases.sql.password,
    },
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
  }
};

export default knexConfig; 