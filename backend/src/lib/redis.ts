/**
 * TokenBlacklist — in-memory token blacklist implementation.
 * Stores { token -> expiresAt (ms timestamp) } and auto-cleans expired entries.
 */
export class TokenBlacklist {
  private readonly store = new Map<string, number>()
  private readonly cleanupInterval: ReturnType<typeof setInterval>

  constructor(cleanupIntervalMs = 5 * 60 * 1000) {
    // Periodically purge expired entries to prevent unbounded memory growth
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, cleanupIntervalMs)

    // Allow the Node.js event loop to exit even if this timer is active
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref()
    }
  }

  /** Add a token to the blacklist until the given expiry timestamp (ms). */
  add(token: string, expiresAtMs: number): void {
    this.store.set(token, expiresAtMs)
  }

  /** Returns true if the token is blacklisted and not yet expired. */
  has(token: string): boolean {
    const expiresAt = this.store.get(token)
    if (expiresAt === undefined) return false
    if (Date.now() > expiresAt) {
      this.store.delete(token)
      return false
    }
    return true
  }

  /** Remove all expired entries. */
  private cleanup(): void {
    const now = Date.now()
    for (const [token, expiresAt] of this.store.entries()) {
      if (now > expiresAt) {
        this.store.delete(token)
      }
    }
  }

  /** Stop the cleanup timer (call during graceful shutdown). */
  destroy(): void {
    clearInterval(this.cleanupInterval)
  }
}

// Singleton instance shared across the application
export const tokenBlacklist = new TokenBlacklist()
