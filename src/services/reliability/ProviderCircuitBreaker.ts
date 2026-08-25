'use client';

export class ProviderCircuitBreaker {
  private static failures: Map<string, number> = new Map();
  private static openCircuits: Map<string, number> = new Map(); // provider -> expiryTimestamp
  private static MAX_FAILURES = 3;
  private static RESET_TIMEOUT_MS = 30000; // 30 seconds cooldown

  public static isCircuitOpen(providerId: string): boolean {
    const expiry = ProviderCircuitBreaker.openCircuits.get(providerId);
    if (!expiry) return false;

    if (Date.now() > expiry) {
      // Cooldown expired, reset circuit to half-open
      ProviderCircuitBreaker.openCircuits.delete(providerId);
      ProviderCircuitBreaker.failures.set(providerId, 0);
      return false;
    }
    return true;
  }

  public static recordSuccess(providerId: string): void {
    ProviderCircuitBreaker.failures.set(providerId, 0);
    ProviderCircuitBreaker.openCircuits.delete(providerId);
  }

  public static recordFailure(providerId: string): void {
    const count = (ProviderCircuitBreaker.failures.get(providerId) || 0) + 1;
    ProviderCircuitBreaker.failures.set(providerId, count);

    if (count >= ProviderCircuitBreaker.MAX_FAILURES) {
      ProviderCircuitBreaker.openCircuits.set(providerId, Date.now() + ProviderCircuitBreaker.RESET_TIMEOUT_MS);
    }
  }
}
