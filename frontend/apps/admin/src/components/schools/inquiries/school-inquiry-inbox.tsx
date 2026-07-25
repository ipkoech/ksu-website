"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  schoolPortalApi,
  schoolPortalQueryKeys,
  type SchoolInquiry,
} from "@ksu/api-client";
import {
  AlertTriangle,
  ArrowRight,
  CircleCheck,
  Clock3,
  Inbox,
  Mail,
  MessageCircleMore,
  Search,
  Siren,
  Tag,
  UserRound,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from "@ksu/ui/components";
import { useSchoolPortal } from "@/components/schools/school-portal-provider";
import { SchoolTeamSelect } from "@/components/schools/shared/school-reference-selectors";
import {
  SchoolFilterBar,
  SchoolMetricGrid,
  SchoolWorkspace,
  SchoolWorkspaceHeader,
} from "@/components/schools/shared/school-workspace";
import { InquiryConversation } from "./inquiry-conversation";

const STATUS_OPTIONS = ["all", "new", "open", "in_progress", "waiting_for_requester", "replied", "resolved", "closed", "spam"];
const PRIORITY_OPTIONS = ["all", "low", "normal", "high", "urgent"];

function slaState(inquiry: SchoolInquiry) {
  if (inquiry.first_response_at || ["resolved", "closed", "spam"].includes(inquiry.status)) {
    return { label: "Responded", overdue: false };
  }
  const hours = (Date.now() - new Date(inquiry.created_at).getTime()) / 3_600_000;
  if (hours >= 24) return { label: `${Math.floor(hours - 24)}h overdue`, overdue: true };
  return { label: `${Math.max(1, Math.ceil(24 - hours))}h SLA left`, overdue: false };
}

export function SchoolInquiryInbox() {
  const { school } = useSchoolPortal();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const page = Number(params.get("page") || 1);
  const inquiryId = params.get("inquiry");
  const status = params.get("status") || "all";
  const assigned_to_user_id = params.get("assigned_to_user_id") || "";
  const category = params.get("category") || "";
  const priority = params.get("priority") || "all";
  const created_from = params.get("created_from") || "";
  const created_to = params.get("created_to") || "";
  const inboxQuery = useQuery({
    queryKey: [
      ...schoolPortalQueryKeys.inquiries(school.id),
      { page, status, assigned_to_user_id, category, priority, created_from, created_to },
    ],
    queryFn: () =>
      schoolPortalApi.inquiries.list({
        page,
        per_page: 20,
        status: status === "all" ? undefined : status,
        assigned_to_user_id: assigned_to_user_id || undefined,
        category: category || undefined,
        priority: priority === "all" ? undefined : priority,
        created_from: created_from || undefined,
        created_to: created_to || undefined,
      }),
  });
  const teamQuery = useQuery({
    queryKey: [...schoolPortalQueryKeys.team(school.id), { purpose: "inquiry-assignee-labels" }],
    queryFn: () => schoolPortalApi.team.list({ page: 1, per_page: 100, status: "active" }),
    staleTime: 5 * 60 * 1000,
  });
  const assigneeNames = new Map(
    (teamQuery.data?.data ?? [])
      .filter((member) => member.user_id)
      .map((member) => [member.user_id!, member.full_name || member.email || "School team member"]),
  );
  const updateUrl = (key: string, value?: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== "page" && key !== "inquiry") next.delete("page");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <SchoolWorkspace>
      <SchoolWorkspaceHeader
        eyebrow="School support"
        title="Inquiry inbox"
        description="Keep requester conversations moving, clarify ownership, and protect the school’s first-response service level."
        schoolName={school.name}
        icon={Inbox}
      />
      <SchoolMetricGrid items={[
        { label: "Matching inquiries", value: inboxQuery.data?.meta.total ?? 0, detail: "Across current filters", icon: Inbox },
        { label: "New", value: inboxQuery.data?.data.filter((item) => item.status === "new").length ?? 0, detail: "Waiting to be opened", icon: MessageCircleMore, tone: "info" },
        { label: "Resolved", value: inboxQuery.data?.data.filter((item) => ["resolved", "closed"].includes(item.status)).length ?? 0, detail: "Completed on this page", icon: CircleCheck, tone: "success" },
        { label: "Urgent", value: inboxQuery.data?.data.filter((item) => item.priority === "urgent").length ?? 0, detail: "Requires priority handling", icon: Siren, tone: "danger" },
      ]} />
      <section aria-label="Inquiry queues" className="flex gap-2 overflow-x-auto pb-1">
        {[
          { value: "all", label: "All conversations" },
          { value: "new", label: "New" },
          { value: "open", label: "Open" },
          { value: "in_progress", label: "In progress" },
          { value: "waiting_for_requester", label: "Waiting" },
          { value: "resolved", label: "Resolved" },
        ].map((queue) => (
          <button
            key={queue.value}
            type="button"
            className={`shrink-0 cursor-pointer rounded-full border px-3 py-2 text-xs font-medium transition-colors duration-200 ${status === queue.value ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:border-primary/30 hover:bg-muted"}`}
            onClick={() => updateUrl("status", queue.value)}
          >
            {queue.label}
          </button>
        ))}
      </section>
      <SchoolFilterBar label="Filter conversations">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Select value={status} onValueChange={(value) => updateUrl("status", value)}><SelectTrigger aria-label="Inquiry status"><SelectValue /></SelectTrigger><SelectContent>{STATUS_OPTIONS.map((item) => <SelectItem key={item} value={item}>{item.replaceAll("_", " ")}</SelectItem>)}</SelectContent></Select>
        <label className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="pl-9" defaultValue={category} placeholder="Category — press Enter" aria-label="Inquiry category" onKeyDown={(event) => event.key === "Enter" && updateUrl("category", event.currentTarget.value.trim())} /></label>
        <Select value={priority} onValueChange={(value) => updateUrl("priority", value)}><SelectTrigger aria-label="Inquiry priority"><SelectValue /></SelectTrigger><SelectContent>{PRIORITY_OPTIONS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
        <SchoolTeamSelect
          valueMode="user"
          value={assigned_to_user_id}
          placeholder="Filter by assignee"
          onChange={(value) => updateUrl("assigned_to_user_id", value || undefined)}
        />
        <div className="space-y-1"><Label htmlFor="inquiry-from" className="text-xs">Created from</Label><Input id="inquiry-from" type="date" value={created_from} onChange={(event) => updateUrl("created_from", event.target.value)} /></div>
        <div className="space-y-1"><Label htmlFor="inquiry-to" className="text-xs">Created to</Label><Input id="inquiry-to" type="date" value={created_to} onChange={(event) => updateUrl("created_to", event.target.value)} /></div>
      </section>
      </SchoolFilterBar>
      {inboxQuery.error ? <Alert variant="destructive"><AlertDescription>{inboxQuery.error.message}</AlertDescription></Alert> : null}
      {inboxQuery.isPending ? (
        <div className="space-y-3">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-28" />)}</div>
      ) : (
        <section className="overflow-hidden rounded-xl border bg-background shadow-sm">
          <header className="flex items-center justify-between border-b bg-muted/20 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold">Conversation queue</h2>
              <p className="text-xs text-muted-foreground">{inboxQuery.data?.meta.total ?? 0} matching inquiries</p>
            </div>
            <Badge variant="outline" className="capitalize">{status.replaceAll("_", " ")}</Badge>
          </header>
          {inboxQuery.data?.data.map((inquiry) => {
            const sla = slaState(inquiry);
            const unread = inquiry.status === "new" || inquiry.meta_data?.unread === true;
            const priorityTone = inquiry.priority === "urgent"
              ? "border-l-destructive"
              : inquiry.priority === "high"
                ? "border-l-amber-500"
                : "border-l-transparent";
            return (
              <button
                key={inquiry.id}
                type="button"
                className={`group flex w-full cursor-pointer gap-3 border-b border-l-4 p-4 text-left transition-colors duration-200 last:border-b-0 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${priorityTone}`}
                onClick={() => updateUrl("inquiry", inquiry.id)}
              >
                <span className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${unread ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {inquiry.sender_name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || <Mail className="size-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <strong className={unread ? "font-semibold" : "font-medium"}>{inquiry.subject}</strong>
                    {unread ? <Badge>Unread</Badge> : null}
                    {inquiry.priority !== "normal" ? <Badge variant={inquiry.priority === "urgent" ? "destructive" : "outline"}>{inquiry.priority}</Badge> : null}
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">{inquiry.sender_name} · {inquiry.reference_number}</span>
                  <span className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 capitalize"><Tag className="size-3" />{inquiry.category}</span>
                    <span className="flex items-center gap-1"><UserRound className="size-3" />{inquiry.assigned_to_user_id ? assigneeNames.get(inquiry.assigned_to_user_id) || "Assigned" : "Unassigned"}</span>
                    <span className={`flex items-center gap-1 ${sla.overdue ? "font-medium text-destructive" : ""}`}>
                      {sla.overdue ? <AlertTriangle className="size-3" /> : <Clock3 className="size-3" />}
                      {sla.label}
                    </span>
                    <span>{new Date(inquiry.last_message_at || inquiry.created_at).toLocaleString()}</span>
                  </span>
                </span>
                <ArrowRight className="mt-3 size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            );
          })}
          {inboxQuery.data?.data.length === 0 ? <div className="p-12 text-center text-sm text-muted-foreground">No inquiries match the selected filters.</div> : null}
        </section>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => updateUrl("page", String(page - 1))}>Previous</Button>
        <Button variant="outline" size="sm" disabled={page >= (inboxQuery.data?.meta.pages ?? 1)} onClick={() => updateUrl("page", String(page + 1))}>Next</Button>
      </div>
      <InquiryConversation inquiryId={inquiryId} open={Boolean(inquiryId)} onOpenChange={(open) => !open && updateUrl("inquiry")} />
    </SchoolWorkspace>
  );
}
