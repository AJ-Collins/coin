import Redis from 'ioredis';

// Single shared connection. BullMQ requires maxRetriesPerRequest: null on
// the connection it uses for queues/workers, so we set that globally here
// rather than maintaining two separate clients.
export const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
});

redis.on('error', (err) => {
  console.error('[Redis] Connection error:', err.message);
});

redis.on('connect', () => {
  console.log('[Redis] Connected');
});