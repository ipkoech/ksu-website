"use client";

import * as React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage, Button, Skeleton } from "../ui";
import { formatRelativeTime } from "../../lib/utils";

export interface ActivityItem {
  id: string;
  user: { name: string; avatar?: string };
  action: string;
  target?: { type: string; name: string; href?: string };
  timestamp: Date;
}

export interface ActivityFeedProps {
  items: ActivityItem[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ActivityFeed({ items, isLoading = false, hasMore = false, onLoadMore }: ActivityFeedProps) {
  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      {isLoading ? (
        Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))
      ) : (
        items.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={item.user.avatar} />
              <AvatarFallback>{initials(item.user.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 text-sm">
              <p>
                <span className="font-medium">{item.user.name}</span> {item.action}{" "}
                {item.target?.href ? (
                  <Link href={item.target.href} className="font-medium text-primary hover:underline">
                    {item.target.name}
                  </Link>
                ) : item.target ? (
                  <span className="font-medium">{item.target.name}</span>
                ) : null}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{formatRelativeTime(item.timestamp)}</p>
            </div>
          </div>
        ))
      )}
      {hasMore && onLoadMore ? (
        <Button type="button" variant="outline" className="w-full" onClick={onLoadMore}>
          Load more
        </Button>
      ) : null}
    </div>
  );
}
