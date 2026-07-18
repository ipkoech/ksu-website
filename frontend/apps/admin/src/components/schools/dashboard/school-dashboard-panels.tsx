import Link from "next/link";
import type { SchoolPortalDashboardResponse } from "@ksu/api-client";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleUserRound,
  Clock3,
  FilePenLine,
  GraduationCap,
  Info,
  Plus,
  UploadCloud,
  UserPlus,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
} from "@ksu/ui/components";

type DistributionItem = SchoolPortalDashboardResponse["distributions"][string][number];
type AttentionItem = SchoolPortalDashboardResponse["attention_items"][number];
type ActivityItem = SchoolPortalDashboardResponse["recent_activity"][number];
type QuickAction = SchoolPortalDashboardResponse["quick_actions"][number];

const CHART_COLORS = ["#16a34a", "#f59e0b", "#0ea5e9", "#f97316", "#94a3b8", "#8b5cf6"];

export function SchoolActivityPanel({
  dashboard,
}: {
  dashboard: SchoolPortalDashboardResponse;
}) {
  const summary = dashboard.activity_summary;
  return (
    <Card className="h-full shadow-sm">
      <CardHeader className="flex-row items-start justify-between gap-4 pb-2">
        <div>
          <CardTitle className="text-base">School activity</CardTitle>
          <CardDescription>Public school-page engagement</CardDescription>
        </div>
        <Info className="size-4 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-2 border-b pb-3">
          <ActivityTotal
            label="Total page views"
            value={summary.page_views}
            change={summary.page_views_change_percent}
            className="text-emerald-700 dark:text-emerald-400"
          />
          <ActivityTotal
            label="Unique visitors"
            value={summary.visitors}
            change={summary.visitors_change_percent}
            className="text-amber-600 dark:text-amber-400"
          />
        </div>
        <SchoolActivityChart points={dashboard.trends} />
      </CardContent>
    </Card>
  );
}

function ActivityTotal({
  label,
  value,
  change,
  className,
}: {
  label: string;
  value: number;
  change: number | null;
  className: string;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-semibold ${className}`}>
        {value.toLocaleString()}
        {change !== null ? (
          <span className="ml-2 text-xs font-medium">
            {change > 0 ? "↑" : change < 0 ? "↓" : "–"} {Math.abs(change).toFixed(1)}%
          </span>
        ) : null}
      </p>
    </div>
  );
}

function SchoolActivityChart({
  points,
}: {
  points: SchoolPortalDashboardResponse["trends"];
}) {
  if (!points.length) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed text-center">
        <Clock3 className="mb-2 size-5 text-muted-foreground" />
        <p className="text-sm font-medium">No traffic in this period</p>
        <p className="mt-1 text-xs text-muted-foreground">Views and visitors will appear as people explore the school page.</p>
      </div>
    );
  }

  const width = 720;
  const height = 210;
  const max = Math.max(...points.flatMap((point) => [point.value, point.visitors]), 1);
  const xAt = (index: number) => points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
  const yAt = (value: number) => height - (value / max) * (height - 28) - 8;
  const path = points.map((point, index) => `${index ? "L" : "M"} ${xAt(index)} ${yAt(point.value)}`).join(" ");
  const barWidth = Math.max(5, Math.min(18, width / points.length / 2.2));

  return (
    <figure>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-52 w-full overflow-visible" role="img" aria-label={`${summaryOf(points)}. Green line shows page views and amber bars show unique visitors.`} preserveAspectRatio="none">
        {[0.25, 0.5, 0.75, 1].map((line) => (
          <line key={line} x1="0" x2={width} y1={height * line} y2={height * line} className="stroke-border" strokeDasharray="4 6" />
        ))}
        {points.map((point, index) => {
          const barHeight = height - yAt(point.visitors);
          return <rect key={point.bucket} x={xAt(index) - barWidth / 2} y={height - barHeight} width={barWidth} height={barHeight} rx="2" className="fill-amber-400/75" />;
        })}
        <path d={`${path} L ${width} ${height} L 0 ${height} Z`} className="fill-primary/5" />
        <path d={path} fill="none" stroke="currentColor" strokeWidth="3" vectorEffect="non-scaling-stroke" className="text-primary" />
        {points.map((point, index) => (
          <circle key={`${point.bucket}-view`} cx={xAt(index)} cy={yAt(point.value)} r="3.5" className="fill-background stroke-primary" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <figcaption className="mt-1 flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>{formatBucket(points[0].bucket)}</span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" /> Page views</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-amber-400" /> Visitors</span>
        </span>
        <span>{formatBucket(points.at(-1)?.bucket ?? "")}</span>
      </figcaption>
    </figure>
  );
}

function summaryOf(points: SchoolPortalDashboardResponse["trends"]) {
  return `${points.length} activity periods, ${points.reduce((sum, point) => sum + point.value, 0)} page views and ${points.reduce((sum, point) => sum + point.visitors, 0)} visitor entries`;
}

function formatBucket(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function SchoolDistributionPanel({
  title,
  description,
  items,
  href,
  actionLabel,
}: {
  title: string;
  description: string;
  items: DistributionItem[];
  href: string;
  actionLabel: string;
}) {
  const visible = items.filter((item) => item.value > 0);
  const total = visible.reduce((sum, item) => sum + item.value, 0);
  let consumed = 0;
  const segments = visible.map((item, index) => {
    const percent = total ? (item.value / total) * 100 : 0;
    const segment = { ...item, percent, offset: -consumed, color: CHART_COLORS[index % CHART_COLORS.length] };
    consumed += percent;
    return segment;
  });

  return (
    <Card className="flex h-full flex-col shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {total ? (
          <div className="grid flex-1 items-center gap-4 sm:grid-cols-[9rem_1fr] xl:grid-cols-1 2xl:grid-cols-[9rem_1fr]">
            <div className="relative mx-auto size-36">
              <svg viewBox="0 0 42 42" className="-rotate-90" role="img" aria-label={`${title}: ${total} total`}>
                <circle cx="21" cy="21" r="15.9" fill="none" className="stroke-muted" strokeWidth="5" />
                {segments.map((item) => (
                  <circle
                    key={item.key}
                    cx="21"
                    cy="21"
                    r="15.9"
                    fill="none"
                    stroke={item.color}
                    strokeWidth="5"
                    strokeDasharray={`${item.percent} ${100 - item.percent}`}
                    strokeDashoffset={item.offset}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <strong className="text-2xl">{total}</strong>
                <span className="text-xs text-muted-foreground">Total</span>
              </div>
            </div>
            <div className="space-y-2.5">
              {segments.map((item) => (
                <div key={item.key} className="flex items-center gap-2 text-xs">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  <strong>{item.value}</strong>
                  <span className="w-12 text-right text-muted-foreground">{item.percent.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex min-h-48 flex-1 flex-col items-center justify-center rounded-lg border border-dashed text-center">
            <CheckCircle2 className="mb-2 size-5 text-emerald-600" />
            <p className="text-sm font-medium">No records yet</p>
            <p className="mt-1 text-xs text-muted-foreground">This distribution will populate as work begins.</p>
          </div>
        )}
        <Button asChild variant="link" className="mt-2 h-auto justify-start px-0 text-xs">
          <Link href={href}>{actionLabel} <ArrowRight className="ml-1 size-3.5" /></Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function SchoolAttentionPanel({
  items,
  profile,
}: {
  items: AttentionItem[];
  profile: SchoolPortalDashboardResponse["profile_completeness"];
}) {
  return (
    <Card className="h-full shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Needs attention</CardTitle>
        <CardDescription>Priority work across the school</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length ? items.map((item) => (
          <Link key={item.key} href={item.href} className="group flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:border-primary/30 hover:bg-muted/40">
            <span className={`rounded-lg p-2 ${item.severity === "critical" ? "bg-destructive/10 text-destructive" : item.severity === "warning" ? "bg-amber-500/10 text-amber-700 dark:text-amber-400" : "bg-sky-500/10 text-sky-700 dark:text-sky-400"}`}>
              {item.severity === "critical" ? <AlertTriangle className="size-4" /> : <Info className="size-4" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{item.label}</span>
              <span className="block text-xs text-muted-foreground">Open the relevant workspace</span>
            </span>
            <Badge variant={item.severity === "critical" ? "destructive" : "secondary"}>{item.count}</Badge>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        )) : (
          <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
            <CheckCircle2 className="size-5" />
            <div><p className="text-sm font-medium">You are all caught up</p><p className="text-xs opacity-80">Nothing currently requires urgent action.</p></div>
          </div>
        )}
        <Link href="/schools/profile" className="mt-3 block rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium">Profile completeness</span>
            <strong>{profile.percent}%</strong>
          </div>
          <Progress value={profile.percent} className="h-1.5" />
        </Link>
      </CardContent>
    </Card>
  );
}

export function SchoolRecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <Card className="h-full shadow-sm">
      <CardHeader className="flex-row items-center justify-between pb-2">
        <div><CardTitle className="text-base">Recent activity</CardTitle><CardDescription>Latest school changes</CardDescription></div>
        <Button asChild variant="link" size="sm" className="px-0"><Link href="/schools/audit">View all <ArrowRight className="ml-1 size-3.5" /></Link></Button>
      </CardHeader>
      <CardContent className="space-y-1">
        {items.length ? items.slice(0, 5).map((item) => (
          <div key={item.id} className="flex gap-3 border-b py-2.5 first:pt-0 last:border-0 last:pb-0">
            <span className="rounded-full bg-primary/10 p-2 text-primary"><FilePenLine className="size-4" /></span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{humanize(item.summary)}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.actor_name ? `By ${item.actor_name}` : "System activity"} · {new Date(item.occurred_at).toLocaleString()}</p>
            </div>
          </div>
        )) : <p className="py-10 text-center text-sm text-muted-foreground">No recent school activity.</p>}
      </CardContent>
    </Card>
  );
}

export function SchoolQuickActions({ actions }: { actions: QuickAction[] }) {
  const icons = {
    add_staff: UserPlus,
    new_content: Plus,
    upload_media: UploadCloud,
    add_programme: GraduationCap,
    edit_profile: CircleUserRound,
  };
  return (
    <Card className="h-full shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="text-base">Quick actions</CardTitle><CardDescription>Start common school tasks</CardDescription></CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {actions.slice(0, 4).map((action, index) => {
          const Icon = icons[action.key as keyof typeof icons] ?? BookOpen;
          const color = index % 2 ? "bg-amber-500/10 text-amber-700 dark:text-amber-400" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
          return (
            <Link key={action.key} href={action.href} className="group flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:border-primary/30 hover:bg-muted/40">
              <span className={`rounded-xl p-2.5 ${color}`}><Icon className="size-5" /></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{action.label}</span><span className="block truncate text-xs text-muted-foreground">{action.description}</span></span>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          );
        })}
        {!actions.length ? <p className="col-span-full py-10 text-center text-sm text-muted-foreground">No actions are available for your current role.</p> : null}
      </CardContent>
    </Card>
  );
}

function humanize(value: string) {
  const cleaned = value.replaceAll(".", " ").replaceAll("_", " ").trim();
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : "School record updated";
}
