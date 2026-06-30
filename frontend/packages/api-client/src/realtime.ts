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
      type: "notification.created";
      notification: RealtimeNotification;
    }
  | {
      type: "heartbeat";
      ts: string;
      unread_notifications?: RealtimeNotification[];
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
  private listeners = new Set<Listener>();
  private statusListeners = new Set<StatusListener>();

  constructor(
    private readonly options: {
      baseUrl?: string;
      tokenProvider?: () => string | undefined;
      maxReconnectDelayMs?: number;
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

    const token = (this.options.tokenProvider ?? getStoredAccessToken)();
    if (!token) {
      this.emitStatus("idle");
      return;
    }

    this.closedByClient = false;
    this.emitStatus("connecting");
    const url = this.buildUrl(token);
    this.socket = new WebSocket(url);

    this.socket.addEventListener("open", () => {
      this.reconnectAttempts = 0;
      this.emitStatus("connected");
    });

    this.socket.addEventListener("message", (message) => {
      const event = parseRealtimeEvent(message.data);
      if (event) {
        this.listeners.forEach((listener) => listener(event));
      }
    });

    this.socket.addEventListener("close", () => {
      this.socket = null;
      this.emitStatus("disconnected");
      this.scheduleReconnect();
    });

    this.socket.addEventListener("error", () => {
      this.emitStatus("error");
    });
  }

  disconnect() {
    this.closedByClient = true;
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

  private buildUrl(token: string) {
    const baseUrl = this.options.baseUrl ?? getMainApiBaseUrl();
    const url = new URL("/api/v1/realtime", baseUrl);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.searchParams.set("access_token", token);
    return url.toString();
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
    if (!["connected", "notification.created", "heartbeat", "error"].includes(event.type)) return null;
    return event as RealtimeEvent;
  } catch {
    return null;
  }
}
