import { Queue } from 'bullmq';
import IORedis from 'ioredis';

// Separate connections — BullMQ queue connection and pub/sub must never share
export const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || 'redis',
  port: 6379,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// Dedicated publish connection — never used for BullMQ or subscribe
export const redisPub = new IORedis({
  host: process.env.REDIS_HOST || 'redis',
  port: 6379,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

export const tradeQueue = new Queue('pro-bot-trades', {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 500,
    removeOnFail: 200,
    attempts: 1,        // No retries — a failed trade should not auto-retry
    backoff: { type: 'exponential', delay: 2000 },
  },
});