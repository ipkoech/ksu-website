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
import {
  RealtimeClient,
  schoolPortalQueryKeys,
  type RealtimeNotification,
  type RealtimeStatus,
} from "@ksu/api-client";
import { toast } from "@ksu/ui";

type RealtimeContextValue = {
  status: RealtimeStatus;
  notifications: RealtimeNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
};

const RealtimeContext = createContext<RealtimeContextValue>({
  status: "idle",
  notifications: [],
  markNotificationRead: () => undefined,
  markAllNotificationsRead: () => undefined,
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
  const seenNotificationIds = useMemo(() => new Set<string>(), []);

  useEffect(() => {
    const replaceNotifications = (items: RealtimeNotification[]) => {
      const unique = items.filter((item) => {
        if (seenNotificationIds.has(item.id)) return false;
        seenNotificationIds.add(item.id);
        return true;
      });
      setNotifications((current) => {
        const byId = new Map(
          [...unique, ...current].map((item) => [item.id, item]),
        );
        return Array.from(byId.values()).sort(
          (left, right) =>
            new Date(right.created_at).getTime() -
            new Date(left.created_at).getTime(),
        );
      });
    };

    const invalidateSchoolEvent = (eventType: string, schoolId: string) => {
      const root = schoolPortalQueryKeys.root(schoolId);
      const targets: Array<readonly unknown[]> = [];
      if (eventType.startsWith("school.profile.")) targets.push(schoolPortalQueryKeys.profile(schoolId));
      if (eventType.startsWith("school.team.")) targets.push(schoolPortalQueryKeys.team(schoolId));
      if (eventType.startsWith("school.department.")) targets.push(schoolPortalQueryKeys.departments(schoolId));
      if (eventType.startsWith("school.programme.")) targets.push(schoolPortalQueryKeys.programmes(schoolId));
      if (eventType.startsWith("school.content.")) targets.push(schoolPortalQueryKeys.content(schoolId));
      if (eventType.startsWith("school.publication.")) targets.push(schoolPortalQueryKeys.publications(schoolId));
      if (eventType.startsWith("school.inquiry.")) targets.push(schoolPortalQueryKeys.inquiries(schoolId));
      if (eventType.startsWith("school.upload.")) targets.push(schoolPortalQueryKeys.media(schoolId));
      targets.push(schoolPortalQueryKeys.audit(schoolId));
      targets.push([...root, "dashboard"]);
      targets.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
    };

    const announce = (eventType: string) => {
      const messages: Record<string, string> = {
        "school.inquiry.created": "A new school inquiry arrived.",
        "school.inquiry.reply_failed": "An inquiry reply could not be delivered.",
        "school.inquiry.reply_dead_lettered": "An inquiry reply needs manual recovery.",
        "school.content.changes_requested": "CoCMS requested content changes.",
        "school.content.published": "School content was published.",
        "school.upload.completed": "School media processing completed.",
      };
      if (messages[eventType]) toast.info(messages[eventType]);
    };

    const unsubscribeStatus = client.subscribeStatus(setStatus);
    const unsubscribeEvents = client.subscribe((event) => {
      if (event.type === "connected") {
        replaceNotifications(event.notifications);
        queryClient.invalidateQueries({ queryKey: ["current-user", "notifications"] });
      }
      if (event.type === "event") {
        const eventType = event.event.type;
        const schoolId =
          event.event.scope?.type === "school" ? event.event.scope.id : undefined;
        if (schoolId) invalidateSchoolEvent(eventType, schoolId);
        if (eventType === "notification.created") {
          queryClient.invalidateQueries({ queryKey: ["current-user", "notifications"] });
        }
        if (eventType.startsWith("research.")) {
          queryClient.invalidateQueries({ queryKey: ["research"] });
        }
        announce(eventType);
      }
      if (event.type === "sync.required") {
        queryClient.invalidateQueries({ queryKey: ["school-portal"] });
        queryClient.invalidateQueries({ queryKey: ["current-user", "notifications"] });
        queryClient.invalidateQueries({ queryKey: ["research"] });
        toast.info("Live updates were resynchronized after the connection was interrupted.");
      }
    });

    return () => {
      unsubscribeEvents();
      unsubscribeStatus();
    };
  }, [client, queryClient, seenNotificationIds]);

  useEffect(() => {
    if (!enabled) {
      client.disconnect();
      setNotifications([]);
      return;
    }

    const connectTimer = setTimeout(() => client.connect(), 0);
    return () => {
      clearTimeout(connectTimer);
      client.disconnect();
    };
  }, [client, enabled]);

  const value = useMemo(
    () => ({
      status,
      notifications,
      markNotificationRead: (id: string) =>
        setNotifications((current) =>
          current.map((item) =>
            item.id === id
              ? { ...item, is_read: true, read_at: new Date().toISOString() }
              : item,
          ),
        ),
      markAllNotificationsRead: () =>
        setNotifications((current) =>
          current.map((item) => ({
            ...item,
            is_read: true,
            read_at: item.read_at ?? new Date().toISOString(),
          })),
        ),
    }),
    [status, notifications],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
