"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "../../lib/utils";

export interface Leader {
  id: string;
  name: string;
  title: string;
  image?: string | null;
  message?: string | null;
  slug?: string;
}

interface LeaderMessageProps {
  leader: Leader;
  variant?: "card" | "inline" | "featured";
  showImage?: boolean;
  showMessage?: boolean;
  messageLength?: "short" | "medium" | "full";
  linkHref?: string;
  linkText?: string;
  className?: string;
}

export function LeaderMessage({
  leader,
  variant = "card",
  showImage = true,
  showMessage = true,
  messageLength = "short",
  linkHref,
  linkText = "Read full message",
  className,
}: LeaderMessageProps) {
  const truncatedMessage = leader.message
    ? truncateMessage(leader.message, messageLength)
    : null;

  if (variant === "featured") {
    return (
      <div className={cn("flex flex-col h-full", className)}>
        <FeaturedLayout
          leader={leader}
          truncatedMessage={truncatedMessage}
          showImage={showImage}
          showMessage={showMessage}
          linkHref={linkHref}
          linkText={linkText}
        />
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <InlineLayout
          leader={leader}
          showImage={showImage}
        />
      </div>
    );
  }

  // Default card variant
  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl bg-slate-950 p-5 sm:p-6 text-white shadow-lg h-full",
        className
      )}
    >
      <CardLayout
        leader={leader}
        truncatedMessage={truncatedMessage}
        showImage={showImage}
        showMessage={showMessage}
        linkHref={linkHref}
        linkText={linkText}
      />
    </div>
  );
}

function CardLayout({
  leader,
  truncatedMessage,
  showImage,
  showMessage,
  linkHref,
  linkText,
}: {
  leader: Leader;
  truncatedMessage: string | null;
  showImage: boolean;
  showMessage: boolean;
  linkHref?: string;
  linkText: string;
}) {
  return (
    <>
      <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
        {leader.title}
      </span>

      {showMessage && truncatedMessage && (
        <blockquote className="mt-3 sm:mt-4 flex-1 font-[family-name:var(--font-display)] text-lg sm:text-xl leading-snug">
          "{truncatedMessage}"
        </blockquote>
      )}

      <div className="mt-4 flex items-center gap-3 sm:gap-4">
        {showImage && (
          <LeaderAvatar leader={leader} size="md" />
        )}
        <div>
          <p className="text-sm font-semibold">{leader.name}</p>
          <p className="text-xs text-slate-400">{leader.title}</p>
        </div>
      </div>

      {linkHref && (
        <Link
          href={linkHref}
          className="mt-4 inline-flex items-center text-sm font-semibold text-secondary hover:text-white transition-colors"
        >
          {linkText} →
        </Link>
      )}
    </>
  );
}

function FeaturedLayout({
  leader,
  truncatedMessage,
  showImage,
  showMessage,
  linkHref,
  linkText,
}: {
  leader: Leader;
  truncatedMessage: string | null;
  showImage: boolean;
  showMessage: boolean;
  linkHref?: string;
  linkText: string;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
      {showImage && (
        <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20">
          {leader.image ? (
            <Image
              src={leader.image}
              alt={leader.name}
              width={400}
              height={500}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-white/20">
              <span className="text-lg">Photo</span>
            </div>
          )}
        </div>
      )}

      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-secondary">
          {leader.title}'s Message
        </p>

        {showMessage && truncatedMessage && (
          <blockquote className="mt-6 font-[family-name:var(--font-display)] text-3xl leading-tight text-white sm:text-4xl">
            "{truncatedMessage}"
          </blockquote>
        )}

        <div className="mt-8">
          <p className="text-lg font-semibold text-white">{leader.name}</p>
          <p className="text-slate-400">{leader.title}</p>
        </div>

        {linkHref && (
          <div className="mt-8">
            <Link
              href={linkHref}
              className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-secondary/90"
            >
              {linkText}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function InlineLayout({
  leader,
  showImage,
}: {
  leader: Leader;
  showImage: boolean;
}) {
  return (
    <>
      {showImage && <LeaderAvatar leader={leader} size="sm" />}
      <div>
        <p className="font-semibold text-slate-950">{leader.name}</p>
        <p className="text-sm text-slate-500">{leader.title}</p>
      </div>
    </>
  );
}

function LeaderAvatar({
  leader,
  size = "md",
}: {
  leader: Leader;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "h-10 w-10",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  if (leader.image) {
    return (
      <Image
        src={leader.image}
        alt={leader.name}
        width={size === "lg" ? 64 : size === "md" ? 48 : 40}
        height={size === "lg" ? 64 : size === "md" ? 48 : 40}
        className={cn("rounded-full object-cover flex-shrink-0", sizeClasses[size])}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex-shrink-0",
        sizeClasses[size]
      )}
    />
  );
}

function truncateMessage(
  message: string,
  length: "short" | "medium" | "full"
): string {
  if (length === "full") return message;

  const maxLength = length === "short" ? 120 : 250;

  if (message.length <= maxLength) return message;

  return message.slice(0, maxLength).trim() + "...";
}

// Export avatar for standalone use
export { LeaderAvatar };
