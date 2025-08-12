import { createClient } from 'redis';
import config from '../config/config.js';

const redisClient = createClient({
  url: config.redis.url || 'redis://redis:6379',
  socket: {
    reconnectStrategy: (retries) => {
      const delay = Math.min(retries * 100, 5000);
      console.log(`Redis reconnecting attempt ${retries}, next try in ${delay}ms`);
      return delay;
    }
  }
});

redisClient
  .on('connect', () => {
    console.log('Redis: Connecting to server...');
  })
  .on('ready', () => {
    console.log('Redis: Connected and ready to use');
  })
  .on('reconnecting', () => {
    console.log('Redis: Reconnecting...');
  })
  .on('error', (err) => {
    console.error('Redis Client Error:', err.message);
  })
  .on('end', () => {
    console.log('Redis: Connection closed');
  });

process.on('SIGINT', async () => {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
  process.exit(0);
});

export { redisClient };
