"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";
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
  { bg: string; icon: React.ComponentType<{ className?: string }> }
> = {
  info: { bg: "bg-primary", icon: Bell },
  warning: { bg: "bg-secondary", icon: AlertTriangle },
  urgent: { bg: "bg-red-600", icon: AlertCircle },
  success: { bg: "bg-green-600", icon: CheckCircle },
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
  const backgroundClass = background === "secondary" ? "bg-secondary" : styles.bg;
  const Icon = styles.icon;

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!dismissible) {
      if (!expiresAt || new Date(expiresAt) >= new Date()) {
        setIsVisible(true);
      }
      return;
    }

    const dismissedAnnouncements = JSON.parse(
      localStorage.getItem("dismissedAnnouncements") || "[]"
    );

    if (dismissedAnnouncements.includes(id)) {
      return;
    }

    if (expiresAt && new Date(expiresAt) < new Date()) {
      return;
    }

    setIsVisible(true);
  }, [id, expiresAt]);

  const handleDismiss = () => {
    setIsVisible(false);
    const dismissed = JSON.parse(
      localStorage.getItem("dismissedAnnouncements") || "[]"
    );
    localStorage.setItem(
      "dismissedAnnouncements",
      JSON.stringify([...dismissed, id])
    );
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={dismissible ? { height: 0, opacity: 0 } : false}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(backgroundClass, "text-white", className)}
        >
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-center gap-3 text-sm">
              <Icon className="w-4 h-4 flex-shrink-0" />

              <span className="text-center">
                {message}
                {linkText && linkHref && (
                  <Link
                    href={linkHref}
                    className="ml-2 inline-flex min-h-8 items-center font-semibold underline underline-offset-2 hover:no-underline"
                  >
                    {linkText} →
                  </Link>
                )}
              </span>

              {dismissible && (
                <button
                  onClick={handleDismiss}
                  className="ml-auto flex h-9 w-9 flex-shrink-0 items-center justify-center rounded transition-colors hover:bg-white/20"
                  aria-label="Dismiss announcement"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
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

  useEffect(() => {
    if (!rotating || announcements.length < 2) return;
    const interval = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % announcements.length);
    }, intervalMs);
    return () => window.clearInterval(interval);
  }, [announcements.length, intervalMs, rotating]);

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
        <AnimatePresence mode="wait">
          <motion.div
            key={activeAnnouncement.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
          >
            <AnnouncementBar {...activeAnnouncement} background={background} />
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={cn("announcement-stack", className)}>
      {announcements.map((announcement) => (
        <AnnouncementBar key={announcement.id} {...announcement} background={background} />
      ))}
    </div>
  );
}
