import { getStoredAccessToken } from "./auth-tokens";
import { getMainApiBaseUrl, getResearchApiBaseUrl } from "./service-urls";

export type RealtimeNotification = {
  id: string;
  user_id: string;
  template_id?: string | null;
  title: string;
  subject?: string | null;
  message: string;
  notification_type: string;
  priority: string;
  action_url?: string | null;
  scope_type?: string | null;
  scope_id?: string | null;
  channels: string[];
  payload?: Record<string, unknown> | null;
  is_read: boolean;
  read_at?: string | null;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type RealtimeEvent =
  | {
      type: "connected";
      user_id: string;
      notifications: RealtimeNotification[];
    }
  | {
      type: "event";
      cursor: string;
      event: {
        id?: string;
        type: string;
        scope?: { type?: string; id?: string };
        data?: Record<string, unknown>;
        occurred_at?: string;
      };
    }
  | {
      type: "ping";
      ts: string;
    }
  | {
      type: "sync.required";
      reason: string;
    }
  | {
      type: "error";
      message: string;
    };

export type RealtimeStatus = "idle" | "connecting" | "connected" | "disconnected" | "error";

export type ResearchRealtimeConfig = {
  scope_type: "research";
  websocket_path: string;
  heartbeat_seconds: number;
  channels: string[];
  events: string[];
};

export const realtimeApi = {
  ticket: () => {
    const token = getStoredAccessToken();
    return fetch(new URL("/api/v1/realtime/ticket", getMainApiBaseUrl()), {
      method: "POST",
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || error.message || "Realtime ticket request failed");
      }
      return response.json() as Promise<{
        data: { ticket: string; expires_in: number };
      }>;
    });
  },
  researchConfig: () => {
    const token = getStoredAccessToken();
    return fetch(new URL("/api/v1/realtime/research/config", getResearchApiBaseUrl()), {
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || error.message || "Realtime config request failed");
      }
      return response.json() as Promise<{ data: ResearchRealtimeConfig }>;
    });
  },
};

type Listener = (event: RealtimeEvent) => void;
type StatusListener = (status: RealtimeStatus) => void;

export class RealtimeClient {
  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private closedByClient = false;
  private connectionGeneration = 0;
  private listeners = new Set<Listener>();
  private statusListeners = new Set<StatusListener>();
  private seenEventIds = new Set<string>();
  private readonly cursorStorageKey = "ksu:realtime:last-event-id";

  constructor(
    private readonly options: {
      baseUrl?: string;
      maxReconnectDelayMs?: number;
      ticketProvider?: () => Promise<{ ticket: string; expires_in: number }>;
    } = {}
  ) {}

  connect() {
    if (typeof window === "undefined") return;
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)
    ) {
      return;
    }

    this.closedByClient = false;
    this.emitStatus("connecting");
    const generation = ++this.connectionGeneration;
    void this.openSocket(generation);
  }

  private async openSocket(generation: number) {
    try {
      const ticketResponse = this.options.ticketProvider
        ? await this.options.ticketProvider()
        : (await realtimeApi.ticket()).data;
      if (this.closedByClient || generation !== this.connectionGeneration) return;
      const lastEventId = this.getLastEventId();
      const url = this.buildUrl(ticketResponse.ticket, lastEventId);
      this.socket = new WebSocket(url);

    this.socket.addEventListener("open", () => {
      this.reconnectAttempts = 0;
      this.emitStatus("connected");
      if (lastEventId) {
        this.sendControl({ type: "resume", last_event_id: lastEventId });
      }
    });

    this.socket.addEventListener("message", (message) => {
      const event = parseRealtimeEvent(message.data);
      if (!event) return;
      if (event.type === "ping") {
        this.sendControl({ type: "pong", ts: event.ts });
        return;
      }
      if (event.type === "event") {
        const eventId = event.event.id || event.cursor;
        if (this.seenEventIds.has(eventId)) {
          this.sendControl({ type: "ack", cursor: event.cursor });
          return;
        }
        this.seenEventIds.add(eventId);
        if (this.seenEventIds.size > 1000) {
          this.seenEventIds.delete(this.seenEventIds.values().next().value as string);
        }
        this.setLastEventId(event.cursor);
        this.listeners.forEach((listener) => listener(event));
        this.sendControl({ type: "ack", cursor: event.cursor });
        return;
      }
      this.listeners.forEach((listener) => listener(event));
    });

    this.socket.addEventListener("close", () => {
      this.socket = null;
      this.emitStatus("disconnected");
      this.scheduleReconnect();
    });

    this.socket.addEventListener("error", () => {
      this.emitStatus("error");
    });
    } catch {
      if (this.closedByClient || generation !== this.connectionGeneration) return;
      this.emitStatus("error");
      this.scheduleReconnect();
    }
  }

  disconnect() {
    this.closedByClient = true;
    this.connectionGeneration += 1;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.socket?.close();
    this.socket = null;
    this.emitStatus("idle");
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  subscribeStatus(listener: StatusListener) {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  private buildUrl(ticket: string, lastEventId: string | null) {
    const baseUrl = this.options.baseUrl ?? getMainApiBaseUrl();
    const url = new URL("/api/v1/realtime", baseUrl);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.searchParams.set("ticket", ticket);
    if (lastEventId) url.searchParams.set("last_event_id", lastEventId);
    return url.toString();
  }

  private sendControl(message: Record<string, unknown>) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  private getLastEventId() {
    try {
      return window.localStorage.getItem(this.cursorStorageKey);
    } catch {
      return null;
    }
  }

  private setLastEventId(cursor: string) {
    try {
      window.localStorage.setItem(this.cursorStorageKey, cursor);
    } catch {
      // Resume remains best-effort when storage is unavailable.
    }
  }

  private scheduleReconnect() {
    if (this.closedByClient) return;
    const maxDelay = this.options.maxReconnectDelayMs ?? 30_000;
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, maxDelay);
    const jitter = Math.round(delay * 0.2 * Math.random());
    this.reconnectAttempts += 1;
    this.reconnectTimer = setTimeout(() => this.connect(), delay + jitter);
  }

  private emitStatus(status: RealtimeStatus) {
    this.statusListeners.forEach((listener) => listener(status));
  }
}

function parseRealtimeEvent(raw: unknown): RealtimeEvent | null {
  if (typeof raw !== "string") return null;
  try {
    const event = JSON.parse(raw) as Partial<RealtimeEvent>;
    if (!event || typeof event.type !== "string") return null;
    if (!["connected", "event", "ping", "sync.required", "error"].includes(event.type)) return null;
    return event as RealtimeEvent;
  } catch {
    return null;
  }
}
