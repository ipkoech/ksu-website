import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import {
  Badge,
  Card,
  CardContent,
} from "@ksu/ui/components";

type Tone = "primary" | "success" | "warning" | "danger" | "info";

const TONES: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
};

export function SchoolWorkspace({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-h-full bg-muted/20 p-4 sm:p-6 lg:p-8 ${className}`}>
      <div className="mx-auto max-w-[1600px] space-y-5">{children}</div>
    </div>
  );
}

export function SchoolWorkspaceHeader({
  eyebrow,
  title,
  description,
  schoolName,
  icon: Icon,
  actions,
  meta,
}: {
  eyebrow: string;
  title: string;
  description: string;
  schoolName?: string;
  icon: LucideIcon;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden rounded-2xl border bg-background shadow-sm">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-emerald-500 to-amber-400" />
      <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span className="mt-0.5 rounded-2xl bg-primary/10 p-3 text-primary ring-1 ring-primary/15">
            <Icon className="size-6" />
          </span>
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
              {schoolName ? (
                <Badge variant="outline" className="max-w-full gap-1 font-normal">
                  <CheckCircle2 className="size-3 text-emerald-600" />
                  <span className="truncate">{schoolName}</span>
                </Badge>
              ) : null}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
            {meta ? <div className="mt-3">{meta}</div> : null}
          </div>
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">{actions}</div> : null}
      </div>
    </header>
  );
}

export type SchoolMetric = {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  icon: LucideIcon;
  tone?: Tone;
};

export function SchoolMetricGrid({ items }: { items: SchoolMetric[] }) {
  return (
    <section aria-label="At a glance" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ label, value, detail, icon: Icon, tone = "primary" }) => (
        <Card key={label} className="overflow-hidden shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <span className={`rounded-xl p-2.5 ${TONES[tone]}`}><Icon className="size-5" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-2xl font-semibold tracking-tight">{value}</span>
              <span className="block truncate text-sm font-medium">{label}</span>
              {detail ? <span className="mt-0.5 block truncate text-xs text-muted-foreground">{detail}</span> : null}
            </span>
            <ArrowUpRight className="size-4 self-start text-muted-foreground/50" />
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

export function SchoolFilterBar({
  children,
  label = "Find and filter",
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <section aria-label={label} className="rounded-xl border bg-background p-3 shadow-sm sm:p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      {children}
    </section>
  );
}

export function SchoolEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-background px-6 py-12 text-center">
      <span className="mb-3 rounded-full bg-muted p-3 text-muted-foreground"><Icon className="size-6" /></span>
      <p className="font-medium">{title}</p>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
