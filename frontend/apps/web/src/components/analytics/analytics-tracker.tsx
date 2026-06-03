"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { analyticsApi } from "@ksu/api-client";

function trackingDisabled() {
  return (
    process.env.NEXT_PUBLIC_ANALYTICS_DISABLED === "true" ||
    (typeof navigator !== "undefined" && navigator.doNotTrack === "1") ||
    (typeof window !== "undefined" &&
      window.localStorage.getItem("ksu_analytics_consent") !== "granted")
  );
}

function getSessionHash() {
  const key = "ksu_analytics_session";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const value =
    window.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
  const [consent, setConsent] = useState<string | null>(null);

  useEffect(() => {
    const syncConsent = () => {
      setConsent(window.localStorage.getItem("ksu_analytics_consent"));
    };

    syncConsent();
    window.addEventListener("storage", syncConsent);
    window.addEventListener("ksu-analytics-consent", syncConsent);
    return () => {
      window.removeEventListener("storage", syncConsent);
      window.removeEventListener("ksu-analytics-consent", syncConsent);
    };
  }, []);

  useEffect(() => {
    if (!pathname || consent !== "granted" || trackingDisabled()) return;

    analyticsApi
      .ingestEvents([
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
      ])
      .catch(() => {
        // Analytics must never interrupt the public browsing experience.
      });
  }, [consent, pathname]);

  return null;
}

export function AnalyticsConsentBanner() {
  const [preference, setPreference] = useState<string | null>(null);
  const [isPreferencePanelOpen, setIsPreferencePanelOpen] = useState(false);

  useEffect(() => {
    setPreference(window.localStorage.getItem("ksu_analytics_consent"));
    const openPreferences = () => setIsPreferencePanelOpen(true);

    window.addEventListener("ksu-open-analytics-preferences", openPreferences);
    return () => {
      window.removeEventListener(
        "ksu-open-analytics-preferences",
        openPreferences,
      );
    };
  }, []);

  if (preference && !isPreferencePanelOpen) return null;

  const setConsent = (value: "granted" | "denied") => {
    window.localStorage.setItem("ksu_analytics_consent", value);
    window.dispatchEvent(new Event("ksu-analytics-consent"));
    setPreference(value);
    setIsPreferencePanelOpen(false);
  };

  return (
    <section
      aria-labelledby="analytics-consent-title"
      aria-describedby="analytics-consent-summary"
      role="dialog"
      aria-modal="false"
      className="fixed inset-x-3 bottom-3 z-[1080] mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-3 text-slate-950 shadow-xl sm:inset-x-4 sm:bottom-4 sm:p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p
            id="analytics-consent-title"
            className="text-sm font-semibold text-slate-950"
          >
            Analytics preferences
          </p>
          <p
            id="analytics-consent-summary"
            className="mt-1 text-sm leading-5 text-slate-700 sm:leading-6"
          >
            We use privacy-conscious analytics to improve public services. You
            can continue without analytics.
          </p>
          <p className="mt-1 hidden text-xs leading-5 text-slate-600 sm:block">
            Records: page path, device type, referrer host, and a random session
            ID. No form fields or payment details.
          </p>
        </div>
        <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex sm:flex-row">
          <button
            type="button"
            onClick={() => setConsent("denied")}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => setConsent("granted")}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            Allow analytics
          </button>
        </div>
      </div>
    </section>
  );
}
