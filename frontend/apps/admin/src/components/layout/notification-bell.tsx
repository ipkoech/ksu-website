"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Bell, Check, ExternalLink, Settings } from "lucide-react";
import { Button, Switch } from "@ksu/ui/components";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@ksu/ui/components";
import { cn } from "@ksu/ui/lib/utils";
import { getMainApiBaseUrl, getStoredAccessToken, refreshStoredAccessToken } from "@ksu/api-client";
import { useRealtime } from "@/components/realtime/realtime-provider";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  notification_type?: string;
  action_url?: string | null;
  is_read: boolean;
  created_at: string;
};

type NotificationsResponse = {
  data: NotificationItem[];
  meta?: { total: number };
};

function useNotifications() {
  return useQuery({
    queryKey: ["current-user", "notifications", "unread"],
    queryFn: async () => {
      let token = getStoredAccessToken();
      if (!token) return { data: [], meta: { total: 0 } };
      const baseUrl = getMainApiBaseUrl();
      let response = await fetch(`${baseUrl}/api/v1/notifications?per_page=5&unread_only=true`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        const refreshed = await refreshStoredAccessToken(baseUrl);
        token = getStoredAccessToken();
        if (refreshed && token) {
          response = await fetch(`${baseUrl}/api/v1/notifications?per_page=5&unread_only=true`, {
            credentials: "include",
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          window.dispatchEvent(new CustomEvent("ksu:session-expired"));
          return { data: [], meta: { total: 0 } };
        }
      }
      if (!response.ok) return { data: [], meta: { total: 0 } };
      return response.json() as Promise<NotificationsResponse>;
    },
    refetchInterval: 30_000,
  });
}

function useUnreadCount() {
  return useQuery({
    queryKey: ["current-user", "notifications", "unread-count"],
    queryFn: async () => {
      const response = await notificationRequest("/api/v1/notifications/unread-count");
      return (await response.json()) as { data: { count: number } };
    },
    refetchInterval: 30_000,
  });
}

function useNotificationPreferences() {
  return useQuery({
    queryKey: ["current-user", "notifications", "preferences"],
    queryFn: async () => {
      const response = await notificationRequest("/api/v1/notifications/preferences");
      return (await response.json()) as {
        data: { in_app: boolean; email: boolean; sms: boolean; push: boolean };
      };
    },
  });
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  const now = Date.now();
  const diff = now - date.getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(date);
}

async function markAsRead(notificationId: string) {
  let token = getStoredAccessToken();
  if (!token) return;
  const baseUrl = getMainApiBaseUrl();
  let response = await fetch(`${baseUrl}/api/v1/notifications/${notificationId}/read`, {
    method: "PATCH",
    credentials: "include",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.status === 401) {
    const refreshed = await refreshStoredAccessToken(baseUrl);
    token = getStoredAccessToken();
    if (refreshed && token) {
      response = await fetch(`${baseUrl}/api/v1/notifications/${notificationId}/read`, {
        method: "PATCH",
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      window.dispatchEvent(new CustomEvent("ksu:session-expired"));
    }
  }
}

async function notificationRequest(path: string, init?: RequestInit) {
  let token = getStoredAccessToken();
  const baseUrl = getMainApiBaseUrl();
  let response = await fetch(`${baseUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (response.status === 401) {
    const refreshed = await refreshStoredAccessToken(baseUrl);
    token = getStoredAccessToken();
    if (refreshed && token) {
      response = await fetch(`${baseUrl}${path}`, {
        ...init,
        credentials: "include",
        headers: {
          ...(init?.body ? { "Content-Type": "application/json" } : {}),
          Authorization: `Bearer ${token}`,
          ...init?.headers,
        },
      });
    }
  }
  if (!response.ok) throw new Error("Notification request failed");
  return response;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const queryClient = useQueryClient();
  const {
    notifications: liveNotifications,
    status,
    markNotificationRead,
    markAllNotificationsRead,
  } = useRealtime();
  const { data, isLoading } = useNotifications();
  const unreadQuery = useUnreadCount();
  const preferencesQuery = useNotificationPreferences();
  const notifications = mergeNotifications(liveNotifications, data?.data ?? []).slice(0, 5);
  const unreadCount = unreadQuery.data?.data.count ?? notifications.filter((n) => !n.is_read).length;
  const hasUnread = unreadCount > 0;

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    markNotificationRead(id);
    queryClient.invalidateQueries({ queryKey: ["current-user", "notifications"] });
  };
  const handleMarkAllRead = async () => {
    await notificationRequest("/api/v1/notifications/read-all", { method: "POST" });
    markAllNotificationsRead();
    await queryClient.invalidateQueries({ queryKey: ["current-user", "notifications"] });
  };
  const updatePreference = async (
    key: "in_app" | "email" | "sms" | "push",
    checked: boolean,
  ) => {
    const current = preferencesQuery.data?.data;
    if (!current) return;
    await notificationRequest("/api/v1/notifications/preferences", {
      method: "PUT",
      body: JSON.stringify({ ...current, [key]: checked }),
    });
    await preferencesQuery.refetch();
  };
  const liveLabel =
    status === "connected"
      ? "Live"
      : status === "connecting"
        ? "Connecting"
        : status === "error" || status === "disconnected"
          ? "Offline"
          : "Idle";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Notifications">
          <Bell size={20} />
          {hasUnread ? (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {hasUnread ? (
            <span className="text-xs text-muted-foreground">
              {unreadCount} unread
            </span>
          ) : null}
          <span className={cn("text-xs", status === "connected" ? "text-emerald-600" : "text-muted-foreground")}>{liveLabel}</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <Bell className="h-8 w-8 text-muted-foreground/50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="max-h-[360px] overflow-y-auto">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "group relative border-b border-border/50 px-4 py-3 transition-colors last:border-b-0",
                  !item.is_read && "bg-primary/[0.03]",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm leading-snug", !item.is_read && "font-semibold")}>
                      {item.title}
                    </p>
                    {item.message ? (
                      <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {item.message}
                      </p>
                    ) : null}
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">
                        {formatTime(item.created_at)}
                      </span>
                      {item.action_url ? (
                        <Link
                          href={item.action_url}
                          onClick={() => setOpen(false)}
                          className="inline-flex items-center gap-0.5 text-[10px] font-medium text-primary hover:text-primary/80"
                        >
                          View
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                  {!item.is_read ? (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(item.id)}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Mark as read"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>
                {!item.is_read ? (
                  <span className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary" />
                ) : null}
              </div>
            ))}
          </div>
        )}

        {showPreferences && preferencesQuery.data ? (
          <div className="space-y-2 border-t px-4 py-3">
            {(["in_app", "email", "sms", "push"] as const).map((key) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-xs capitalize">{key.replaceAll("_", " ")}</span>
                <Switch
                  checked={preferencesQuery.data.data[key]}
                  onCheckedChange={(checked) => updatePreference(key, checked)}
                  aria-label={`${key} notifications`}
                />
              </div>
            ))}
          </div>
        ) : null}
        {notifications.length > 0 ? (
          <div className="flex items-center gap-1 border-t px-2 py-2">
            <Button variant="ghost" size="sm" className="text-xs" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setShowPreferences((current) => !current)}>
              <Settings className="mr-1 size-3" /> Preferences
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-xs text-muted-foreground"
              asChild
            >
              <Link href="/system/notifications" onClick={() => setOpen(false)}>
                View all notifications
              </Link>
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

function mergeNotifications(primary: NotificationItem[], fallback: NotificationItem[]) {
  const byId = new Map<string, NotificationItem>();
  for (const item of [...primary, ...fallback]) {
    byId.set(item.id, item);
  }
  return Array.from(byId.values()).sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
