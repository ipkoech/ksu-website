"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@ksu/auth";
import { analyticsApi } from "@ksu/api-client";

function trackingDisabled() {
  return (
    process.env.NEXT_PUBLIC_ANALYTICS_DISABLED === "true" ||
    (typeof navigator !== "undefined" && navigator.doNotTrack === "1")
  );
}

function getSessionHash() {
  const key = "ksu_admin_analytics_session";
  const existing = window.sessionStorage.getItem(key);
  if (existing) return existing;
  const value = window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.sessionStorage.setItem(key, value);
  return value;
}

function deviceType() {
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

export function AdminAnalyticsTracker() {
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    if (!pathname || !user || trackingDisabled()) return;

    analyticsApi.ingestEvents([
      {
        event_type: "page_view",
        source_app: "admin",
        path: `${pathname}${window.location.search}`,
        session_hash: getSessionHash(),
        user_agent: navigator.userAgent,
        device_type: deviceType(),
        occurred_at: new Date().toISOString(),
      },
    ]).catch(() => {
      // Analytics collection must not interfere with back-office work.
    });
  }, [pathname, user]);

  return null;
}
