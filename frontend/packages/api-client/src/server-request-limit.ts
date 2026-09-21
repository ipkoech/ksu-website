type WaitingRequest = { start: () => void; abort: () => void };
type RequestPool = { active: number; queue: WaitingRequest[] };

// Scheduling state only: never stores credentials, responses or user caches.
// Idle origins are removed. Each queued caller keeps its original deadline.
const pools = new Map<string, RequestPool>();

export function acquireServerRequest(
  origin: string,
  signal: AbortSignal,
): Promise<() => void> {
  signal.throwIfAborted();
  const configured = Number(process.env.KSU_API_MAX_CONCURRENT_REQUESTS);
  const limit =
    Number.isInteger(configured) && configured > 0
      ? Math.min(configured, 16)
      : 4;
  let pool = pools.get(origin);
  if (!pool) {
    pool = { active: 0, queue: [] };
    pools.set(origin, pool);
  }
  const current = pool;
  const removeIdlePool = () => {
    if (
      current.active === 0 &&
      current.queue.length === 0 &&
      pools.get(origin) === current
    )
      pools.delete(origin);
  };
  return new Promise((resolve, reject) => {
    const waiter: WaitingRequest = {
      start: () => {
        signal.removeEventListener("abort", waiter.abort);
        current.active++;
        let released = false;
        resolve(() => {
          if (released) return;
          released = true;
          current.active--;
          current.queue.shift()?.start();
          removeIdlePool();
        });
      },
      abort: () => {
        const index = current.queue.indexOf(waiter);
        if (index !== -1) current.queue.splice(index, 1);
        removeIdlePool();
        reject(signal.reason);
      },
    };
    if (current.active < limit) waiter.start();
    else {
      current.queue.push(waiter);
      signal.addEventListener("abort", waiter.abort, { once: true });
    }
  });
}
