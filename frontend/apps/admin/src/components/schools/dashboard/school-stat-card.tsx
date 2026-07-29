import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Building2,
  FilePenLine,
  GraduationCap,
  HelpCircle,
  Minus,
  UsersRound,
} from "lucide-react";
import { Card, CardContent } from "@ksu/ui/components";
import type { SchoolPortalDashboardResponse } from "@ksu/api-client";

type SummaryCard = SchoolPortalDashboardResponse["summary_cards"][number];

export function SchoolStatCard({ card }: { card: SummaryCard }) {
  const change = card.change_percent;
  const ChangeIcon =
    change === null || change === 0
      ? Minus
      : change > 0
        ? ArrowUp
        : ArrowDown;
  const visual = {
    team: { icon: UsersRound, className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
    departments: { icon: Building2, className: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
    programmes: { icon: GraduationCap, className: "bg-primary/10 text-primary" },
    content: { icon: FilePenLine, className: "bg-orange-500/10 text-orange-700 dark:text-orange-400" },
    inquiries: { icon: HelpCircle, className: "bg-destructive/10 text-destructive" },
    publications: { icon: BookOpen, className: "bg-sky-500/10 text-sky-700 dark:text-sky-400" },
  }[card.key] ?? { icon: BookOpen, className: "bg-muted text-muted-foreground" };
  const Icon = visual.icon;
  const content = (
    <Card
      className={
        card.href
          ? "group h-full cursor-pointer shadow-sm transition-colors duration-200 hover:border-primary/40 hover:bg-muted/20"
          : "h-full"
      }
    >
      <CardContent className="flex h-full min-h-28 flex-col justify-between gap-3 p-3 sm:min-h-32 sm:p-4">
        <div className="flex items-center gap-3">
          <span className={`rounded-xl p-2 sm:p-2.5 ${visual.className}`}>
            <Icon className="size-4 sm:size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-xl font-semibold tracking-tight sm:text-2xl">{card.value.toLocaleString()}</p>
            <p className="text-xs font-medium sm:text-sm">{card.label}</p>
          </div>
        </div>
        <p className="flex min-h-4 items-center gap-1 text-xs text-muted-foreground">
          {change !== null ? (
            <>
              <ChangeIcon className={`size-3.5 ${change > 0 ? "text-emerald-600" : change < 0 ? "text-destructive" : ""}`} aria-hidden="true" />
              <span>{Math.abs(change).toFixed(1)}% vs previous period</span>
            </>
          ) : <span>Current school total</span>}
        </p>
      </CardContent>
    </Card>
  );

  return card.href ? <Link href={card.href}>{content}</Link> : content;
}
