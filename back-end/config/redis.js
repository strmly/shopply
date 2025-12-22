/**
 * Redis Client Configuration for Session Management
 * Used for fast session storage and conversation state
 */

import Redis from 'ioredis';

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  /**
   * Initialize Redis connection
   */
  async connect() {
    if (this.isConnected) {
      return this.client;
    }

    const config = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB) || 0,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    };

    try {
      this.client = new Redis(config);

      this.client.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis connection error:', err);
        this.isConnected = false;
      });

      this.client.on('close', () => {
        console.log('⚠️ Redis connection closed');
        this.isConnected = false;
      });

      // Test connection
      await this.client.ping();
      
      return this.client;
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      // Fall back to in-memory store if Redis unavailable
      return this.createMockClient();
    }
  }

  /**
   * Mock client for development without Redis
   */
  createMockClient() {
    const store = new Map();
    
    return {
      set: async (key, value, ...args) => {
        store.set(key, value);
        return 'OK';
      },
      get: async (key) => {
        return store.get(key) || null;
      },
      del: async (key) => {
        return store.delete(key) ? 1 : 0;
      },
      exists: async (key) => {
        return store.has(key) ? 1 : 0;
      },
      expire: async (key, seconds) => {
        // Mock expiration (not implemented in simple mock)
        return 1;
      },
      ttl: async (key) => {
        return store.has(key) ? 3600 : -2;
      },
      keys: async (pattern) => {
        return Array.from(store.keys()).filter(k => k.includes(pattern.replace('*', '')));
      },
      pipeline: () => {
        const commands = [];
        return {
          set: (...args) => { commands.push(['set', ...args]); return this; },
          get: (...args) => { commands.push(['get', ...args]); return this; },
          exec: async () => commands.map(cmd => [null, 'OK']),
        };
      },
    };
  }

  /**
   * Get the Redis client instance
   */
  getClient() {
    return this.client;
  }

  /**
   * Close Redis connection
   */
  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      if (!this.client) {
        return { status: 'disconnected', message: 'Client not initialized' };
      }
      
      const result = await this.client.ping();
      return { 
        status: 'healthy', 
        message: 'Redis is responding',
        response: result 
      };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        message: error.message 
      };
    }
  }
}

// Singleton instance
const redisClient = new RedisClient();

export default redisClient;

