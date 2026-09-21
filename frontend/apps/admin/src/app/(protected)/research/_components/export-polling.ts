export function waitForResearchExportPoll(signal: AbortSignal, delayMs = 2000) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason ?? new DOMException("Export cancelled", "AbortError"));
      return;
    }

    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, delayMs);
    const abort = () => {
      clearTimeout(timer);
      reject(signal.reason ?? new DOMException("Export cancelled", "AbortError"));
    };
    signal.addEventListener("abort", abort, { once: true });
  });
}
