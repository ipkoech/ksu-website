"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userNotificationsApi } from "@ksu/api-client";
import type { UserNotification } from "@ksu/api-client";
import {
  Archive,
  Bell,
  BellDot,
  CheckCheck,
  CircleCheck,
  ExternalLink,
  Inbox,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  Skeleton,
  Switch,
} from "@ksu/ui/components";

type Tone = "primary" | "success" | "warning" | "danger" | "info";

const TONES: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
};

type CorporateMetric = {
  label: string;
  value: React.ReactNode;
  detail?: React.ReactNode;
  icon: typeof Bell;
  tone?: Tone;
};

function CorporateWorkspace({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-h-full bg-muted/20 p-4 sm:p-6 lg:p-8 ${className}`}>
      <div className="mx-auto max-w-[1600px] space-y-5">{children}</div>
    </div>
  );
}

function CorporateWorkspaceHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: typeof Bell;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 hidden rounded-xl bg-primary/10 p-2.5 text-primary sm:inline-flex">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
          {actions}
        </div>
      ) : null}
    </header>
  );
}

function CorporateMetricGrid({ items }: { items: CorporateMetric[] }) {
  return (
    <section
      aria-label="At a glance"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {items.map(({ label, value, detail, icon: Icon, tone = "primary" }) => (
        <Card key={label} className="overflow-hidden shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <span className={`rounded-xl p-2.5 ${TONES[tone]}`}>
              <Icon className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-2xl font-semibold tracking-tight">
                {value}
              </span>
              <span className="block truncate text-sm font-medium">
                {label}
              </span>
              {detail ? (
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {detail}
                </span>
              ) : null}
            </span>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

export function CorporateNotificationsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const page = Number(searchParams.get("page") || 1);
  const unreadOnly = searchParams.get("unread_only") === "true";

  const updateUrl = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const notificationsQuery = useQuery({
    queryKey: ["corporate-notifications", { page, unreadOnly }],
    queryFn: () =>
      userNotificationsApi.list({
        page,
        per_page: 25,
        unread_only: unreadOnly,
      }),
  });

  const unreadCountQuery = useQuery({
    queryKey: ["corporate-notifications", "unread-count"],
    queryFn: () => userNotificationsApi.unreadCount(),
  });

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["corporate-notifications"] });
    // Invalidate the global notification bell's query key
    await queryClient.invalidateQueries({ queryKey: ["current-user", "notifications", "unread"] });
    await queryClient.invalidateQueries({ queryKey: ["current-user", "notifications", "unread-count"] });
  };

  const markRead = useMutation({
    mutationFn: (id: string) => userNotificationsApi.markRead(id),
    onSuccess: invalidateAll,
  });

  const markAllRead = useMutation({
    mutationFn: () => userNotificationsApi.markAllRead(),
    onSuccess: invalidateAll,
  });

  const archive = useMutation({
    mutationFn: (id: string) => userNotificationsApi.archive(id),
    onSuccess: invalidateAll,
  });

  const items: UserNotification[] = notificationsQuery.data?.data ?? [];
  const totalCount = notificationsQuery.data?.meta?.total ?? items.length;
  const unreadCount = unreadCountQuery.data?.data.count ?? 0;
  const urgent = items.filter((item) =>
    ["high", "urgent"].includes(item.priority)
  ).length;
  const actionable = items.filter((item) => Boolean(item.action_url)).length;

  return (
    <CorporateWorkspace>
      <CorporateWorkspaceHeader
        eyebrow="Portal updates"
        title="Notifications"
        description="Review workflow updates, content alerts, and other activity across the Corporate Communication portal."
        icon={Bell}
        actions={
          <Button
            variant="outline"
            disabled={!unreadCount || markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            <CheckCheck className="mr-2 size-4" /> Mark all read
          </Button>
        }
      />
      <CorporateMetricGrid
        items={[
          {
            label: "Notifications",
            value: totalCount,
            detail: "Total in inbox",
            icon: Inbox,
          },
          {
            label: "Unread",
            value: unreadCount,
            detail: "Still awaiting review",
            icon: BellDot,
            tone: "info",
          },
          {
            label: "Priority",
            value: urgent,
            detail: "High or urgent on page",
            icon: Bell,
            tone: "warning",
          },
          {
            label: "Actionable",
            value: actionable,
            detail: "Linked to portal work",
            icon: CircleCheck,
            tone: "success",
          },
        ]}
      />

      <div className="flex items-center justify-between gap-3 rounded-xl border bg-background p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm font-medium">Unread only</p>
            <p className="text-xs text-muted-foreground">Focus on new updates</p>
          </div>
          <Switch
            checked={unreadOnly}
            onCheckedChange={(checked) =>
              updateUrl("unread_only", checked ? "true" : "")
            }
            aria-label="Show unread notifications only"
          />
        </div>
      </div>

      {notificationsQuery.error ? (
        <Alert variant="destructive">
          <AlertDescription>{notificationsQuery.error.message}</AlertDescription>
        </Alert>
      ) : null}

      {notificationsQuery.isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-24" />
          ))}
        </div>
      ) : (
        <section className="overflow-hidden rounded-xl border bg-background shadow-sm">
          {items.map((notification) => (
            <article
              key={notification.id}
              className={`group flex gap-3 border-b p-4 transition-colors duration-200 last:border-0 hover:bg-muted/30 ${notification.is_read ? "" : "bg-primary/[0.035]"}`}
            >
              <span
                className={`mt-0.5 rounded-full p-2 ${notification.is_read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}
              >
                {notification.is_read ? (
                  <Bell className="size-4" />
                ) : (
                  <BellDot className="size-4" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold">{notification.title}</h2>
                  {!notification.is_read ? <Badge>New</Badge> : null}
                  <Badge variant="outline" className="capitalize">
                    {notification.notification_type.replaceAll("_", " ")}
                  </Badge>
                  {notification.priority !== "normal" ? (
                    <Badge variant="outline">{notification.priority}</Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {notification.message}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex shrink-0 items-start gap-1">
                {!notification.is_read ? (
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Mark ${notification.title} as read`}
                    disabled={markRead.isPending}
                    onClick={() => markRead.mutate(notification.id)}
                  >
                    <CheckCheck className="size-4" />
                  </Button>
                ) : null}
                {notification.action_url ? (
                  <Button asChild size="icon" variant="ghost">
                    <Link
                      href={notification.action_url}
                      aria-label={`Open ${notification.title}`}
                    >
                      <ExternalLink className="size-4" />
                    </Link>
                  </Button>
                ) : null}
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Archive ${notification.title}`}
                  disabled={archive.isPending}
                  onClick={() => archive.mutate(notification.id)}
                >
                  <Archive className="size-4" />
                </Button>
              </div>
            </article>
          ))}
          {!items.length ? (
            <div className="px-6 py-16 text-center">
              <CircleCheck className="mx-auto size-8 text-emerald-600" />
              <p className="mt-3 font-medium">You are all caught up</p>
              <p className="mt-1 text-sm text-muted-foreground">
                There are no notifications in this view.
              </p>
            </div>
          ) : null}
        </section>
      )}

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => updateUrl("page", String(page - 1))}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= (notificationsQuery.data?.meta?.pages ?? 1)}
          onClick={() => updateUrl("page", String(page + 1))}
        >
          Next
        </Button>
      </div>
    </CorporateWorkspace>
  );
}
