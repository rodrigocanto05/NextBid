export class RateLimiter {
  constructor({ capacity = 10, refillRate = 1, refillInterval = 1000 } = {}) {
    this.capacity = capacity;       
    this.refillRate = refillRate;   
    this.refillInterval = refillInterval;
    this.buckets = new Map();      
  }

  _getBucket(key) {
    if (!this.buckets.has(key)) {
      this.buckets.set(key, {
        tokens: this.capacity,
        lastRefill: Date.now(),
        violations: 0,
      });
    }
    return this.buckets.get(key);
  }

  _refill(bucket) {
    const now = Date.now();
    const elapsed = now - bucket.lastRefill;
    const tokensToAdd = Math.floor(elapsed / this.refillInterval) * this.refillRate;
    if (tokensToAdd > 0) {
      bucket.tokens = Math.min(this.capacity, bucket.tokens + tokensToAdd);
      bucket.lastRefill = now;
    }
  }

  /**
   * @returns {{ allowed: boolean, remaining: number, violations: number }}
   */
  consume(userId, auctionId) {
    const key = `${userId}:${auctionId}`;
    const bucket = this._getBucket(key);
    this._refill(bucket);

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return { allowed: true, remaining: bucket.tokens, violations: bucket.violations };
    }

    bucket.violations += 1;
    return { allowed: false, remaining: 0, violations: bucket.violations };
  }

  remove(userId, auctionId) {
    this.buckets.delete(`${userId}:${auctionId}`);
  }

  cleanup() {
    const staleThreshold = 5 * 60 * 1000;
    const now = Date.now();
    for (const [key, bucket] of this.buckets) {
      if (now - bucket.lastRefill > staleThreshold) {
        this.buckets.delete(key);
      }
    }
  }
}