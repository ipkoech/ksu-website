import { CalendarDays, CheckCircle2, RefreshCw } from "lucide-react";
import {
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ksu/ui/components";
import type { SchoolPortalDashboardRange } from "@ksu/api-client";

const RANGE_DAYS: Record<SchoolPortalDashboardRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "12m": 365,
};

function greeting(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function dateRange(endValue: string, range: SchoolPortalDashboardRange) {
  const end = new Date(endValue);
  const start = new Date(end);
  start.setDate(start.getDate() - RANGE_DAYS[range] + 1);
  const format = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: start.getFullYear() === end.getFullYear() ? undefined : "numeric",
  });
  return `${format.format(start)} – ${format.format(end)}`;
}

export function SchoolDashboardHeader({
  userName,
  schoolName,
  generatedAt,
  range,
  fetching,
  onRangeChange,
}: {
  userName: string;
  schoolName: string;
  generatedAt: string;
  range: SchoolPortalDashboardRange;
  fetching: boolean;
  onRangeChange: (range: SchoolPortalDashboardRange) => void;
}) {
  const generated = new Date(generatedAt);
  const firstName = userName.trim().split(/\s+/)[0] || "School Admin";

  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-primary">{schoolName}</p>
          <Badge variant="outline" className="gap-1.5 border-emerald-200 bg-emerald-50 font-normal text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="size-3.5" />
            Live · Connected
          </Badge>
          {fetching ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <RefreshCw className="size-3 animate-spin" /> Updating
            </span>
          ) : null}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {greeting(generated)}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what is happening in your school today.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
        <Select value={range} onValueChange={(value) => onRangeChange(value as SchoolPortalDashboardRange)}>
          <SelectTrigger aria-label="Dashboard date range" className="w-[14rem] bg-background">
            <SelectValue>{dateRange(generatedAt, range)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="12m">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}
