const redis = require('redis');
const logger = require('../middlewares/logger');

class RedisConfig {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  /**
   * Initialize Redis connection
   */
  async connect() {
    try {
      this.client = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            logger.error('Redis server connection refused');
            return new Error('Redis server connection refused');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            logger.error('Redis retry time exhausted');
            return new Error('Redis retry time exhausted');
          }
          if (options.attempt > 10) {
            logger.error('Redis retry attempts exhausted');
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      this.client.on('connect', () => {
        logger.info('Redis client connected');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        logger.error('Redis client error:', err);
        this.isConnected = false;
      });

      this.client.on('end', () => {
        logger.info('Redis client disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
      
      // Test connection
      await this.client.ping();
      logger.info('Redis connection established');
      
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.disconnect();
      logger.info('Redis client disconnected');
    }
  }

  /**
   * Get Redis client
   */
  getClient() {
    return this.client;
  }

  /**
   * Check if Redis is connected
   */
  isRedisConnected() {
    return this.isConnected;
  }

  /**
   * Set key-value pair
   */
  async set(key, value, ttl = null) {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }
    
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await this.client.setEx(key, ttl, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
    } catch (error) {
      logger.error('Redis SET error:', error);
      throw error;
    }
  }

  /**
   * Get value by key
   */
  async get(key) {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }
    
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis GET error:', error);
      throw error;
    }
  }

  /**
   * Delete key
   */
  async del(key) {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }
    
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error('Redis DEL error:', error);
      throw error;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key) {
    if (!this.isConnected) {
      return false;
    }
    
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error:', error);
      return false;
    }
  }

  /**
   * Set TTL for key
   */
  async expire(key, ttl) {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }
    
    try {
      await this.client.expire(key, ttl);
    } catch (error) {
      logger.error('Redis EXPIRE error:', error);
      throw error;
    }
  }

  /**
   * Get TTL for key
   */
  async ttl(key) {
    if (!this.isConnected) {
      return -1;
    }
    
    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error('Redis TTL error:', error);
      return -1;
    }
  }

  /**
   * Increment value
   */
  async incr(key) {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }
    
    try {
      return await this.client.incr(key);
    } catch (error) {
      logger.error('Redis INCR error:', error);
      throw error;
    }
  }

  /**
   * Decrement value
   */
  async decr(key) {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }
    
    try {
      return await this.client.decr(key);
    } catch (error) {
      logger.error('Redis DECR error:', error);
      throw error;
    }
  }

  /**
   * Add member to set
   */
  async sadd(key, member) {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }
    
    try {
      await this.client.sAdd(key, member);
    } catch (error) {
      logger.error('Redis SADD error:', error);
      throw error;
    }
  }

  /**
   * Remove member from set
   */
  async srem(key, member) {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }
    
    try {
      await this.client.sRem(key, member);
    } catch (error) {
      logger.error('Redis SREM error:', error);
      throw error;
    }
  }

  /**
   * Check if member exists in set
   */
  async sismember(key, member) {
    if (!this.isConnected) {
      return false;
    }
    
    try {
      return await this.client.sIsMember(key, member);
    } catch (error) {
      logger.error('Redis SISMEMBER error:', error);
      return false;
    }
  }

  /**
   * Get all members of set
   */
  async smembers(key) {
    if (!this.isConnected) {
      return [];
    }
    
    try {
      return await this.client.sMembers(key);
    } catch (error) {
      logger.error('Redis SMEMBERS error:', error);
      return [];
    }
  }

  /**
   * Add member to sorted set
   */
  async zadd(key, score, member) {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }
    
    try {
      await this.client.zAdd(key, { score, value: member });
    } catch (error) {
      logger.error('Redis ZADD error:', error);
      throw error;
    }
  }

  /**
   * Get range from sorted set
   */
  async zrange(key, start, stop) {
    if (!this.isConnected) {
      return [];
    }
    
    try {
      return await this.client.zRange(key, start, stop);
    } catch (error) {
      logger.error('Redis ZRANGE error:', error);
      return [];
    }
  }

  /**
   * Remove member from sorted set
   */
  async zrem(key, member) {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }
    
    try {
      await this.client.zRem(key, member);
    } catch (error) {
      logger.error('Redis ZREM error:', error);
      throw error;
    }
  }

  /**
   * Clear all keys
   */
  async flushall() {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }
    
    try {
      await this.client.flushAll();
    } catch (error) {
      logger.error('Redis FLUSHALL error:', error);
      throw error;
    }
  }
}

// Create singleton instance
const redisConfig = new RedisConfig();

module.exports = redisConfig;
