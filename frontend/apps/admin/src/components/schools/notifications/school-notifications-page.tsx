"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  schoolPortalApi,
  schoolPortalQueryKeys,
} from "@ksu/api-client";
import {
  Archive,
  Bell,
  BellDot,
  CheckCheck,
  CircleCheck,
  ExternalLink,
  Inbox,
  Search,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Switch,
} from "@ksu/ui/components";
import { useSchoolPortal } from "@/components/schools/school-portal-provider";
import {
  SchoolMetricGrid,
  SchoolWorkspace,
  SchoolWorkspaceHeader,
} from "@/components/schools/shared/school-workspace";
import { useState } from "react";

export function SchoolNotificationsPage() {
  const { school, can } = useSchoolPortal();
  const queryClient = useQueryClient();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("all");
  const queryKey = [...schoolPortalQueryKeys.notifications(school.id), { unreadOnly }];
  const notifications = useQuery({
    queryKey,
    queryFn: () => schoolPortalApi.notifications.list({ page: 1, per_page: 50, unread_only: unreadOnly }),
  });
  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: schoolPortalQueryKeys.notifications(school.id) });
    await queryClient.invalidateQueries({ queryKey: ["current-user", "notifications"] });
  };
  const markRead = useMutation({
    mutationFn: (id: string) => schoolPortalApi.notifications.markRead(id),
    onSuccess: refresh,
  });
  const markAll = useMutation({
    mutationFn: () => schoolPortalApi.notifications.markAllRead(),
    onSuccess: refresh,
  });
  const archive = useMutation({
    mutationFn: (id: string) => schoolPortalApi.notifications.archive(id),
    onSuccess: refresh,
  });
  const allItems = notifications.data?.data ?? [];
  const items = allItems.filter((item) => {
    const text = `${item.title} ${item.message} ${item.notification_type}`.toLowerCase();
    return (!search || text.includes(search.toLowerCase())) && (priority === "all" || item.priority === priority);
  });
  const unread = allItems.filter((item) => !item.is_read).length;
  const urgent = allItems.filter((item) => ["high", "urgent"].includes(item.priority)).length;
  const actionable = allItems.filter((item) => Boolean(item.action_url)).length;

  return (
    <SchoolWorkspace>
      <SchoolWorkspaceHeader
        eyebrow="School updates"
        title="Notifications"
        description="Review workflow updates, inquiry alerts, import results and other activity for this school."
        schoolName={school.name}
        icon={Bell}
        actions={
          <Button variant="outline" disabled={!unread || markAll.isPending} onClick={() => markAll.mutate()}>
            <CheckCheck className="mr-2 size-4" /> Mark all read
          </Button>
        }
      />
      <SchoolMetricGrid items={[
        { label: "Notifications", value: notifications.data?.meta.total ?? items.length, detail: "School-scoped updates", icon: Inbox },
        { label: "Unread", value: unread, detail: "Still awaiting review", icon: BellDot, tone: "info" },
        { label: "Priority", value: urgent, detail: "High or urgent updates", icon: Bell, tone: "warning" },
        { label: "Actionable", value: actionable, detail: "Linked to portal work", icon: CircleCheck, tone: "success" },
      ]} />
      <div className="grid gap-3 rounded-xl border bg-background p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_12rem_auto] md:items-center">
        <label className="relative">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input className="pl-9" value={search} placeholder="Search notifications" aria-label="Search notifications" onChange={(event) => setSearch(event.target.value)} />
        </label>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger aria-label="Notification priority"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center justify-between gap-3 md:justify-end">
          <div>
            <p className="text-sm font-medium">Unread only</p>
            <p className="text-xs text-muted-foreground">Focus on new updates</p>
          </div>
          <Switch checked={unreadOnly} onCheckedChange={setUnreadOnly} aria-label="Show unread notifications only" />
        </div>
      </div>

      {notifications.error ? <Alert variant="destructive"><AlertDescription>{notifications.error.message}</AlertDescription></Alert> : null}
      {notifications.isPending ? (
        <div className="space-y-3">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-24" />)}</div>
      ) : (
        <section className="overflow-hidden rounded-xl border bg-background shadow-sm">
          {items.map((notification) => (
            <article
              key={notification.id}
              className={`group flex gap-3 border-b p-4 transition-colors duration-200 last:border-0 hover:bg-muted/30 ${notification.is_read ? "" : "bg-primary/[0.035]"}`}
            >
              <span className={`mt-0.5 rounded-full p-2 ${notification.is_read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                {notification.is_read ? <Bell className="size-4" /> : <BellDot className="size-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold">{notification.title}</h2>
                  {!notification.is_read ? <Badge>New</Badge> : null}
                  <Badge variant="outline" className="capitalize">{notification.notification_type.replaceAll("_", " ")}</Badge>
                  {notification.priority !== "normal" ? <Badge variant="outline">{notification.priority}</Badge> : null}
                </div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{notification.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">{new Date(notification.created_at).toLocaleString()}</p>
              </div>
              <div className="flex shrink-0 items-start gap-1">
                {!notification.is_read ? (
                  <Button size="icon" variant="ghost" aria-label={`Mark ${notification.title} as read`} onClick={() => markRead.mutate(notification.id)}>
                    <CheckCheck className="size-4" />
                  </Button>
                ) : null}
                {notification.action_url ? (
                  <Button asChild size="icon" variant="ghost">
                    <Link href={notification.action_url} aria-label={`Open ${notification.title}`}><ExternalLink className="size-4" /></Link>
                  </Button>
                ) : null}
                {can("school.notifications.manage") ? (
                  <Button size="icon" variant="ghost" aria-label={`Archive ${notification.title}`} onClick={() => archive.mutate(notification.id)}>
                    <Archive className="size-4" />
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
          {!items.length ? (
            <div className="px-6 py-16 text-center">
              <CircleCheck className="mx-auto size-8 text-emerald-600" />
              <p className="mt-3 font-medium">You are all caught up</p>
              <p className="mt-1 text-sm text-muted-foreground">There are no school notifications in this view.</p>
            </div>
          ) : null}
        </section>
      )}
    </SchoolWorkspace>
  );
}
