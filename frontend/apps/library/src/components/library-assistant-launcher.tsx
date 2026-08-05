"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";

export function LibraryAssistantLauncher() {
  const pathname = usePathname();
  if (pathname === "/ask") return null;

  const sourceUrl = pathname || "/";
  const sourceTitle = typeof document === "undefined" ? "Library page" : document.title;
  const href = `/ask?source_url=${encodeURIComponent(sourceUrl)}&source_title=${encodeURIComponent(sourceTitle)}`;

  return (
    <Link
      href={href}
      aria-label="Ask the Library about this page"
      className="fixed bottom-5 right-5 z-40 inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-secondary/40 sm:bottom-7 sm:right-7"
    >
      <MessageCircle aria-hidden className="h-5 w-5 text-secondary" />
      <span className="hidden sm:inline">Ask the Library</span>
    </Link>
  );
}
