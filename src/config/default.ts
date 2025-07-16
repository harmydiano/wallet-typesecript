import dotenv from 'dotenv';

dotenv.config();

export default {
  app: {
    environment: process.env.NODE_ENV || 'development',
    superSecret: process.env.JWT_SECRET || 'your-secret-key',
    port: parseInt(process.env.PORT || '3010'),
    baseUrl: `http://${process.env.HOST || 'localhost'}:${process.env.PORT || '3010'}`
  },
  databases: {
    sql: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      name: process.env.DB_NAME || 'sms_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password'
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined
    }
  },
  server: {
    port: parseInt(process.env.PORT || '3000'),
    host: process.env.HOST || 'localhost'
  }
}; 