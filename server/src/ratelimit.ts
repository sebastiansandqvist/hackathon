export function createLimiter({ limit, windowDuration }: { limit: number; windowDuration: number }) {
  const store = new Map<string, { count: number; windowStart: Date }>();

  // (given limit = 10, windowDuration = 24h)
  // hit('user-001'); { limited: false }
  // hit('user-001'); { limited: false }
  // ... 8 more times ...
  // hit('user-001'); { limited: true, retryAfter: 24h }
  return function hit(id: string) {
    const now = new Date();
    const record = store.get(id);

    const timeElapsed = record ? now.getTime() - record.windowStart.getTime() : 0;

    // if no record or it expired, set a new one
    if (!record || timeElapsed > windowDuration) {
      store.set(id, { count: 1, windowStart: now });
      return { limited: false };
    }

    // increment the counter if it's within the limit
    if (record.count < limit) {
      record.count += 1;
      return { limited: false };
    }

    return {
      limited: true, // the request has been rate limited
      retryAfter: windowDuration - timeElapsed,
    };
  };
}
