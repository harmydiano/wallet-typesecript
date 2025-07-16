import { createClient } from 'redis';
import config from '../../../config/default';

class AppStorage {
  private client: any;

  constructor() {
    console.log('Redis config:', {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password ? '***' : undefined
    });
    
    this.client = createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port,
        connectTimeout: 10000,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('Redis connection failed after 10 retries');
            return false;
          }
          return Math.min(retries * 100, 3000);
        }
      },
      password: config.redis.password
    });

    this.client.on('error', (err: any) => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('Redis client connected');
    });

    this.client.on('ready', () => {
      console.log('Redis client ready');
    });

    this.client.connect();
  }

  /**
   * Save data to storage
   */
  async saveToStorage(key: string, value: any): Promise<void> {
    try {
      await this.client.set(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to storage:', error);
      throw error;
    }
  }

  /**
   * Get data from storage
   */
  async getFromStorage(key: string): Promise<any> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error getting from storage:', error);
      return null;
    }
  }

  /**
   * Check if key exists in storage
   */
  async existInStorage(key: string): Promise<any> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error checking storage:', error);
      return null;
    }
  }

  /**
   * Delete data from storage
   */
  async deleteFromStorage(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Error deleting from storage:', error);
      throw error;
    }
  }
}

export default new AppStorage(); 