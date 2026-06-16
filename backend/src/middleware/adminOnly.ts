import { Response, NextFunction } from 'express'
import { createClient } from 'redis'

// Initialise Redis Client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6374'
})

redisClient.on('error', (err) => console.error('Redis Rate Limiter Error:', err))

// Self-executing connection link
let isRedisConnected = false;
(async () => {
  try {
    await redisClient.connect()
    isRedisConnected = true
    console.log('Rate limiter successfully hooked into Redis Cache.')
  } catch (err) {
    console.error('Failed to connect to Redis, falling back to open access:', err)
  }
})()

/**
 * Redis-backed sliding window check.
 */
async function slidingWindowCheck(
  key: string,
  windowMs: number,
  max: number
): Promise<{ allowed: boolean; remaining: number; resetAfterMs: number }> {
  const now = Date.now()
  const windowStart = now - windowMs
  const redisKey = `ratelimit:${key}`

  // Atomic operation pipeline: clean old requests and count remaining active ones
  const [_, currentCount] = await redisClient
    .multi()
    .zRemRangeByScore(redisKey, '-inf', windowStart)
    .zCard(redisKey)
    .exec() as unknown as [number, number]

  if (currentCount >= max) {
    // Fetch the score of the oldest active request in the window to calculate precise reset time
    const oldestEntry = await redisClient.zRangeWithScores(redisKey, 0, 0)
    const oldestTs = oldestEntry.length > 0 ? oldestEntry[0].score : now
    const resetAfterMs = oldestTs + windowMs - now

    return { allowed: false, remaining: 0, resetAfterMs }
  }

  // Generate a unique value identifier to allow identical millisecond entries
  const uniqueMember = `${now}:${Math.random()}`

  // Log the current hit and extend the sliding cache lifecycle
  await redisClient
    .multi()
    .zAdd(redisKey, { score: now, value: uniqueMember })
    .expire(redisKey, Math.ceil(windowMs / 1000))
    .exec()

  return {
    allowed: true,
    remaining: max - (currentCount + 1),
    resetAfterMs: windowMs,
  }
}

interface SlidingWindowOptions {
  windowMs: number
  max: number
  message: { error: string }
  /** Derive a unique key per request (defaults to IP) */
  keyGenerator?: (req: any) => string
  /** Return true to skip rate limiting for this request */
  skip?: (req: any) => boolean
}

function createSlidingWindowLimiter(opts: SlidingWindowOptions) {
  const {
    windowMs,
    max,
    message,
    keyGenerator = (req) => req.ip ?? 'unknown',
    skip,
  } = opts

  // Notice the middleware function signature is now async
  return async (req: any, res: Response, next: NextFunction): Promise<void> => {
    if (skip && skip(req)) {
      return next()
    }

    // Fail-safe: If Redis goes down, don't crash your server or lock users out
    if (!isRedisConnected) {
      return next()
    }

    try {
      const key = keyGenerator(req)
      const { allowed, remaining, resetAfterMs } = await slidingWindowCheck(key, windowMs, max)

      // Standard rate-limit headers
      res.setHeader('RateLimit-Limit', max)
      res.setHeader('RateLimit-Remaining', remaining)
      res.setHeader('RateLimit-Reset', Math.ceil(resetAfterMs / 1000))

      if (!allowed) {
        res.status(429).json(message)
        return
      }

      next()
    } catch (error) {
      console.error('Rate limiting processing error:', error)
      next() // Bypass on internal failure to safeguard availability
    }
  }
}

/**
 * Admin routes – 5 req / 15 min per IP.
 * Authenticated users are skipped.
 */
export const adminLimiter = createSlidingWindowLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many requests.' },
  skip: (req) => !!req.user,
})

/**
 * Auth (registration / password reset) – 3 req / 6 h per IP.
 */
export const authLimiter = createSlidingWindowLimiter({
  windowMs: 6 * 60 * 60 * 1000,
  max: 3,
  message: { error: 'Too many attempts, please try again shortly.' },
})

/**
 * Login – 10 req / 15 min per IP.
 */
export const loginLimiter = createSlidingWindowLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, please try again shortly.' },
})

export const adminOnly = (...roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' })
    }
    next()
  }
}