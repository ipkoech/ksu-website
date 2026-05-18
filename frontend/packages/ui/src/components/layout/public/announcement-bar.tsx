"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "../../../lib/utils";

type AnnouncementVariant = "info" | "warning" | "urgent" | "success";

interface AnnouncementBarProps {
  id: string;
  message: string;
  linkText?: string;
  linkHref?: string;
  variant?: AnnouncementVariant;
  dismissible?: boolean;
  expiresAt?: string;
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
  className,
}: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const styles = variantStyles[variant];
  const Icon = styles.icon;

  useEffect(() => {
    if (typeof window === "undefined") return;

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
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(styles.bg, "text-white", className)}
        >
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-center gap-3 text-sm">
              <Icon className="w-4 h-4 flex-shrink-0" />

              <span className="text-center">
                {message}
                {linkText && linkHref && (
                  <Link
                    href={linkHref}
                    className="ml-2 font-semibold underline underline-offset-2 hover:no-underline"
                  >
                    {linkText} →
                  </Link>
                )}
              </span>

              {dismissible && (
                <button
                  onClick={handleDismiss}
                  className="ml-auto p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0"
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
}

interface AnnouncementsProps {
  announcements: Announcement[];
  className?: string;
}

export function Announcements({ announcements, className }: AnnouncementsProps) {
  if (!announcements.length) return null;

  return (
    <div className={cn("announcement-stack", className)}>
      {announcements.map((announcement) => (
        <AnnouncementBar key={announcement.id} {...announcement} />
      ))}
    </div>
  );
}
