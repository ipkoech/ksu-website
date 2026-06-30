"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RealtimeClient, type RealtimeNotification, type RealtimeStatus } from "@ksu/api-client";

type RealtimeContextValue = {
  status: RealtimeStatus;
  notifications: RealtimeNotification[];
};

const RealtimeContext = createContext<RealtimeContextValue>({
  status: "idle",
  notifications: [],
});

export function RealtimeProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<RealtimeStatus>("idle");
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const client = useMemo(() => new RealtimeClient(), []);

  useEffect(() => {
    const invalidateResearchForNotification = (notification: RealtimeNotification) => {
      const payload = notification.payload;
      if (
        payload?.event === "import.completed" &&
        typeof payload.resource === "string" &&
        payload.resource.startsWith("research-")
      ) {
        queryClient.invalidateQueries({ queryKey: ["research"] });
      }
    };

    const unsubscribeStatus = client.subscribeStatus(setStatus);
    const unsubscribeEvents = client.subscribe((event) => {
      if (event.type === "connected") {
        setNotifications(event.notifications);
        queryClient.invalidateQueries({ queryKey: ["current-user", "notifications"] });
        event.notifications.forEach(invalidateResearchForNotification);
      }
      if (event.type === "notification.created") {
        setNotifications((current) => [event.notification, ...current.filter((item) => item.id !== event.notification.id)]);
        queryClient.invalidateQueries({ queryKey: ["current-user", "notifications"] });
        invalidateResearchForNotification(event.notification);
      }
      if (event.type === "heartbeat" && event.unread_notifications) {
        setNotifications(event.unread_notifications);
        queryClient.invalidateQueries({ queryKey: ["current-user", "notifications"] });
        event.unread_notifications.forEach(invalidateResearchForNotification);
      }
    });

    return () => {
      unsubscribeEvents();
      unsubscribeStatus();
    };
  }, [client, queryClient]);

  useEffect(() => {
    if (!enabled) {
      client.disconnect();
      setNotifications([]);
      return;
    }

    client.connect();
    return () => client.disconnect();
  }, [client, enabled]);

  const value = useMemo(() => ({ status, notifications }), [status, notifications]);

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
