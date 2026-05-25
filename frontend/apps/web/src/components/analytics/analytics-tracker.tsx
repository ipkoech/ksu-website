"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { analyticsApi } from "@ksu/api-client";

function trackingDisabled() {
  return (
    process.env.NEXT_PUBLIC_ANALYTICS_DISABLED === "true" ||
    (typeof navigator !== "undefined" && navigator.doNotTrack === "1")
  );
}

function getSessionHash() {
  const key = "ksu_analytics_session";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const value = window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(key, value);
  return value;
}

function referrerHost(referrer: string) {
  if (!referrer) return null;
  try {
    return new URL(referrer).host;
  } catch {
    return null;
  }
}

function deviceType() {
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || trackingDisabled()) return;

    analyticsApi.ingestEvents([
      {
        event_type: "page_view",
        source_app: "web",
        path: `${pathname}${window.location.search}`,
        referrer: document.referrer || null,
        referrer_host: referrerHost(document.referrer),
        session_hash: getSessionHash(),
        user_agent: navigator.userAgent,
        device_type: deviceType(),
        occurred_at: new Date().toISOString(),
      },
    ]).catch(() => {
      // Analytics must never interrupt the public browsing experience.
    });
  }, [pathname]);

  return null;
}
