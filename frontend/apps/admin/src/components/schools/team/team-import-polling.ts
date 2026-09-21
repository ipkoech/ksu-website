export function waitForTeamImportPoll(signal: AbortSignal, delayMs = 1500) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason ?? new DOMException("Import polling cancelled", "AbortError"));
      return;
    }

    const timer = window.setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, delayMs);
    const abort = () => {
      window.clearTimeout(timer);
      reject(signal.reason ?? new DOMException("Import polling cancelled", "AbortError"));
    };
    signal.addEventListener("abort", abort, { once: true });
  });
}
