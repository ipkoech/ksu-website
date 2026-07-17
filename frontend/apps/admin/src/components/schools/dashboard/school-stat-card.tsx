import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card, CardContent } from "@ksu/ui/components";
import type { SchoolPortalDashboardResponse } from "@ksu/api-client";

type SummaryCard = SchoolPortalDashboardResponse["summary_cards"][number];

export function SchoolStatCard({ card }: { card: SummaryCard }) {
  const change = card.change_percent;
  const ChangeIcon =
    change === null || change === 0
      ? Minus
      : change > 0
        ? ArrowUpRight
        : ArrowDownRight;
  const content = (
    <Card
      className={
        card.href
          ? "h-full cursor-pointer transition-colors hover:border-primary/40 hover:bg-muted/30"
          : "h-full"
      }
    >
      <CardContent className="flex h-full flex-col justify-between gap-3 p-4">
        <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
        <div className="flex items-end justify-between gap-3">
          <p className="text-2xl font-semibold tracking-tight">{card.value.toLocaleString()}</p>
          {change !== null ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <ChangeIcon className="size-3.5" aria-hidden="true" />
              {Math.abs(change).toFixed(1)}%
            </span>
          ) : null}
        </div>
        {card.collection_started_after_deployment ? (
          <p className="text-xs text-muted-foreground">Collecting from portal launch</p>
        ) : null}
      </CardContent>
    </Card>
  );

  return card.href ? <Link href={card.href}>{content}</Link> : content;
}
