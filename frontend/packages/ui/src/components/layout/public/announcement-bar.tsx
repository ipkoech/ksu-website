"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  Bell,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Pause,
  Play,
} from "lucide-react";
import { cn } from "../../../lib/utils";

type AnnouncementVariant = "info" | "warning" | "urgent" | "success";
type AnnouncementBackground = "variant" | "secondary";

interface AnnouncementBarProps {
  id: string;
  message: string;
  linkText?: string;
  linkHref?: string;
  variant?: AnnouncementVariant;
  dismissible?: boolean;
  expiresAt?: string;
  background?: AnnouncementBackground;
  className?: string;
}

const variantStyles: Record<
  AnnouncementVariant,
  {
    bg: string;
    icon: React.ComponentType<{ className?: string }>;
    iconClass: string;
    linkClass: string;
  }
> = {
  info: {
    bg: "bg-primary",
    icon: Bell,
    iconClass: "text-white/90",
    linkClass: "text-white",
  },
  warning: {
    bg: "bg-primary",
    icon: AlertTriangle,
    iconClass: "text-secondary",
    linkClass: "text-secondary",
  },
  urgent: {
    bg: "bg-red-700",
    icon: AlertCircle,
    iconClass: "text-white",
    linkClass: "text-white",
  },
  success: {
    bg: "bg-primary",
    icon: CheckCircle,
    iconClass: "text-emerald-300",
    linkClass: "text-white",
  },
};

export function AnnouncementBar({
  id,
  message,
  linkText,
  linkHref,
  variant = "info",
  dismissible = true,
  expiresAt,
  background = "variant",
  className,
}: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(!dismissible && !expiresAt);
  const styles = variantStyles[variant];
  const backgroundClass =
    background === "secondary" ? "bg-primary" : styles.bg;
  const Icon = styles.icon;

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!dismissible) {
      if (!expiresAt || new Date(expiresAt) >= new Date()) {
        setIsVisible(true);
      }
      return;
    }

    let dismissedAnnouncements: string[] = [];
    try {
      dismissedAnnouncements = JSON.parse(
        localStorage.getItem("dismissedAnnouncements") || "[]",
      );
    } catch {
      dismissedAnnouncements = [];
    }

    if (dismissedAnnouncements.includes(id)) {
      return;
    }

    if (expiresAt && new Date(expiresAt) < new Date()) {
      return;
    }

    setIsVisible(true);
  }, [dismissible, expiresAt, id]);

  const handleDismiss = () => {
    setIsVisible(false);
    let dismissed: string[] = [];
    try {
      dismissed = JSON.parse(
        localStorage.getItem("dismissedAnnouncements") || "[]",
      );
    } catch {
      dismissed = [];
    }
    localStorage.setItem(
      "dismissedAnnouncements",
      JSON.stringify(Array.from(new Set([...dismissed, id]))),
    );
  };

  return (
    <>
      {isVisible ? (
        <div
          className={cn(
            backgroundClass,
            "border-b border-white/10 text-white shadow-[inset_0_-1px_rgba(255,255,255,0.08)]",
            className,
          )}
          role={variant === "urgent" ? "alert" : "region"}
          aria-label="University announcement"
        >
          <div className="mx-auto w-full px-4 py-1.5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
            <div className="flex items-center justify-center gap-2.5 pr-10 text-xs sm:pr-0 sm:text-sm">
              <Icon
                className={cn("w-4 h-4 flex-shrink-0", styles.iconClass)}
                aria-hidden
              />

              <span className="text-center font-medium leading-5 text-white/90">
                {message}
                {linkText && linkHref && (
                  <Link
                    href={linkHref}
                    className={cn(
                      "ml-2 inline-flex min-h-8 items-center font-bold underline underline-offset-2 hover:no-underline",
                      styles.linkClass,
                    )}
                  >
                    {linkText}
                    <span aria-hidden> -&gt;</span>
                  </Link>
                )}
              </span>

              {dismissible && (
                <button
                  onClick={handleDismiss}
                  className="ml-auto flex h-8 w-8 flex-shrink-0 items-center justify-center rounded transition-colors hover:bg-white/15"
                  aria-label="Dismiss announcement"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

// Container for multiple announcements
interface Announcement {
  id: string;
  message: string;
  linkText?: string;
  linkHref?: string;
  variant?: AnnouncementVariant;
  dismissible?: boolean;
  expiresAt?: string;
  background?: AnnouncementBackground;
}

interface AnnouncementsProps {
  announcements: Announcement[];
  className?: string;
  rotating?: boolean;
  intervalMs?: number;
  background?: AnnouncementBackground;
}

export function Announcements({
  announcements,
  className,
  rotating = false,
  intervalMs = 6000,
  background = "variant",
}: AnnouncementsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const shouldRotate = rotating && announcements.length > 1 && !isPaused;

  useEffect(() => {
    if (!shouldRotate) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % announcements.length);
    }, intervalMs);
    return () => window.clearInterval(interval);
  }, [announcements.length, intervalMs, shouldRotate]);

  useEffect(() => {
    if (activeIndex >= announcements.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, announcements.length]);

  if (!announcements.length) return null;

  if (rotating && announcements.length > 1) {
    const activeAnnouncement = announcements[activeIndex] ?? announcements[0]!;
    return (
      <div className={cn("announcement-stack", className)}>
        <div key={activeAnnouncement.id} className="relative">
          <div aria-live={isPaused ? "polite" : "off"} aria-atomic="true">
            <AnnouncementBar {...activeAnnouncement} background={background} />
          </div>
          <button
            type="button"
            onClick={() => setIsPaused((paused) => !paused)}
            className="absolute right-12 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
            aria-label={
              isPaused ? "Resume announcements" : "Pause announcements"
            }
          >
            {isPaused ? (
              <Play className="h-4 w-4" aria-hidden />
            ) : (
              <Pause className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("announcement-stack", className)}>
      {announcements.map((announcement) => (
        <AnnouncementBar
          key={announcement.id}
          {...announcement}
          background={background}
        />
      ))}
    </div>
  );
}
