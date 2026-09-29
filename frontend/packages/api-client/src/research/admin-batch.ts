/** Sequential, per-record editorial commands. Never infer all-or-nothing success. */
import { rwId, rwAttemptProblem, rwResource } from "./admin-contract";
import type { RWProblem, RWRow, RWTransition } from "./admin-contract";
export interface RWBatchItem { id: string; title: string; key: string; status: "waiting" | "running" | "confirmed" | "failed" | "uncertain"; problem?: RWProblem }
export interface RWBatchSnapshot { running: boolean; paused: boolean; items: readonly RWBatchItem[] }
export class RWBatchController {
  private value: RWBatchSnapshot = { running: false, paused: false, items: [] };
  private listeners = new Set<() => void>();
  private stopped = false;
  private request: ((id: string, key: string) => Promise<unknown>) | null = null;
  getSnapshot = () => this.value;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private publish(change: Partial<RWBatchSnapshot>) { this.value = { ...this.value, ...change }; this.listeners.forEach(listener => listener()); }
  private update(index: number, patch: Partial<RWBatchItem>) { this.publish({ items: this.value.items.map((item, i) => i === index ? { ...item, ...patch } : item) }); }
  start = async (resource: string, action: RWTransition, rows: RWRow[], request: (id: string, key: string) => Promise<unknown>) => {
    if (this.value.items.length || this.value.running) throw new Error("A batch is already captured");
    rwResource(resource);
    if (!["submit", "approve", "reject", "unpublish"].includes(action) || rows.length < 1 || rows.length > 50 || new Set(rows.map(row => rwId(row.id))).size !== rows.length || rows.some(row => !row.actions[action])) throw new Error("Select 1–50 records authorized for the same action");
    this.request = request; this.stopped = false;
    this.publish({ items: rows.map(row => ({ id: rwId(row.id), title: row.title, key: globalThis.crypto.randomUUID(), status: "waiting" })), paused: false });
    await this.run();
  };
  pause = () => { this.stopped = true; if (!this.value.running) this.publish({ paused: this.value.items.some(item => item.status === "waiting" || item.status === "uncertain") }); };
  resume = async () => { if (this.value.running || !this.request) return; this.stopped = false; await this.run(); };
  private async run() {
    if (!this.request || this.value.running) return;
    this.publish({ running: true, paused: false });
    try {
      for (let index = 0; index < this.value.items.length; index++) {
        const item = this.value.items[index];
        if (!["waiting", "uncertain"].includes(item.status)) continue;
        if (this.stopped) break;
        this.update(index, { status: "running", problem: undefined });
        try { await this.request(item.id, item.key); this.update(index, { status: "confirmed", problem: undefined }); }
        catch (error) {
          const problem = rwAttemptProblem(error, item.status === "uncertain");
          this.update(index, { status: problem.uncertain ? "uncertain" : "failed", problem });
          if (problem.uncertain || problem.kind === "session" || problem.kind === "forbidden") { this.stopped = true; break; }
        }
      }
    } finally { this.publish({ running: false, paused: this.value.items.some(item => ["waiting", "uncertain"].includes(item.status)) }); }
  }
}
