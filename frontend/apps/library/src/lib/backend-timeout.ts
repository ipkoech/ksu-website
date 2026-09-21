/**
 * Resolve a degraded-state fallback at a bounded deadline while releasing the
 * timer as soon as the backend request settles. The API transport owns aborting
 * the underlying request; this helper owns the page-level fallback boundary.
 */
export function withBackendTimeout<T>(
  request: PromiseLike<T>,
  fallback: T,
  timeoutMs: number,
  onTimeout?: () => void,
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((resolve) => {
    timeoutId = setTimeout(() => {
      onTimeout?.();
      resolve(fallback);
    }, timeoutMs);
  });

  return Promise.race([Promise.resolve(request), timeout]).finally(() => {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  });
}
