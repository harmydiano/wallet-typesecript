import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3010;

export default {
  app: {
    appName: process.env.APP_NAME || 'TypeScript SMS API',
    environment: process.env.NODE_ENV || 'dev',
    superSecret: process.env.SERVER_SECRET || 'ipa-BUhBOJAm',
    baseUrl: `http://localhost:${PORT}`,
    port: PORT,
    domain: process.env.APP_DOMAIN || 'app.com',
  },
  api: {
    lang: 'en',
    prefix: '^/api/v[1-9]',
    versions: [1],
    patch_version: '1.0.0',
    pagination: {
      itemsPerPage: 10
    }
  },
  databases: {
    sql: {
      name: process.env.DB_NAME || 'sms_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432')
    }
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  },
  options: {
    errors: {
      wrap: {
        label: ''
      }
    }
  }
}; 