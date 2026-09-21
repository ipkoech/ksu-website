import { beforeEach } from "vitest";

// Node 26 exposes an incomplete global localStorage implementation unless a
// --localstorage-file is supplied. The UI tests need the jsdom storage owned by
// the test window instead of that process-level placeholder.
const memoryStorage = () => {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => Array.from(values.keys())[index] ?? null,
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => values.set(key, String(value)),
  };
};

beforeEach(() => {
  const storage = typeof window !== "undefined" && window.localStorage
    ? window.localStorage
    : memoryStorage();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: storage,
  });
});
