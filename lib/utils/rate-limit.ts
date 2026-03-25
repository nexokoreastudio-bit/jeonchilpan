type RateLimitRecord = {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitRecord>()

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const current = rateLimitStore.get(key)

  if (!current || current.resetAt <= now) {
    const next: RateLimitRecord = { count: 1, resetAt: now + windowMs }
    rateLimitStore.set(key, next)
    return { allowed: true, remaining: limit - 1, resetAt: next.resetAt }
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt }
  }

  current.count += 1
  rateLimitStore.set(key, current)
  return { allowed: true, remaining: limit - current.count, resetAt: current.resetAt }
}

// 간단한 메모리 정리 (오래된 키 누적 방지)
let lastCleanupAt = 0
export function cleanupExpiredRateLimits(maxIntervalMs: number = 60_000): void {
  const now = Date.now()
  if (now - lastCleanupAt < maxIntervalMs) return
  lastCleanupAt = now

  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt <= now) {
      rateLimitStore.delete(key)
    }
  }
}
