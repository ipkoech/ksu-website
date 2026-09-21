import {
  CalendarDays,
  FileCheck2,
  FileText,
  Image,
  Megaphone,
  Newspaper,
  Send,
  Settings2,
  Users,
  Bell,
} from "lucide-react";
import type { WorkspaceConfiguration } from "./types";

/** Canonical Communications workspace metadata used by the authenticated shell. */
export const communicationsWorkspace: WorkspaceConfiguration = {
  identity: { key: "corporate-communication", title: "Communications", shortTitle: "Comms", baseHref: "/corporate-communication" },
  scopes: [],
  requiredPolicies: [],
  defaultRoute: "/corporate-communication",
  featureFlags: {},
  realtime: { enabled: true, channels: ["notifications", "content-workflow", "social-delivery"] },
  navigation: [
    { title: "Overview", href: "/corporate-communication", icon: Settings2, navKey: "communications.overview" },
    { title: "Editorial work", href: "/corporate-communication/editorial-work", icon: Newspaper, navKey: "communications.editorial" },
    { title: "Review queue", href: "/corporate-communication/review-queue", icon: FileCheck2, navKey: "communications.review" },
    { title: "Publishing calendar", href: "/corporate-communication/publishing-calendar", icon: CalendarDays, navKey: "communications.calendar" },
    { title: "Website & navigation", href: "/corporate-communication/website-navigation", icon: FileText, navKey: "communications.website" },
    { title: "Media library", href: "/corporate-communication/media-library", icon: Image, navKey: "communications.media" },
    { title: "Social publishing", href: "/corporate-communication/social-publishing", icon: Send, navKey: "communications.social" },
    { title: "Newsletters & audience", href: "/corporate-communication/newsletters-audience", icon: Users, navKey: "communications.newsletters" },
    { title: "VC & institutional voice", href: "/corporate-communication/vc-institutional-voice", icon: Megaphone, navKey: "communications.voice" },
    { title: "Reports", href: "/corporate-communication/reports", icon: FileText, navKey: "communications.reports" },
    { title: "Notifications", href: "/corporate-communication/notifications", icon: Bell, navKey: "communications.notifications" },
  ],
};
