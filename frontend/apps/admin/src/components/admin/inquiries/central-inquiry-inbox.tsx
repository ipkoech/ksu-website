"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  centralInquiryApi,
  centralInquiryQueryKeys,
  type CentralInquiryFilters,
  type SchoolInquiry,
} from "@ksu/api-client";
import {
  AlertTriangle,
  Building2,
  CircleCheck,
  Clock3,
  Inbox,
  Mail,
  MessageCircleMore,
  Search,
  Siren,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from "@ksu/ui/components";
import { PageHeader } from "@/components/layout";
import { CentralInquiryConversation } from "./central-inquiry-conversation";

const STATUS_OPTIONS = [
  "all",
  "new",
  "open",
  "in_progress",
  "waiting_for_requester",
  "replied",
  "resolved",
  "closed",
  "spam",
];
const PRIORITY_OPTIONS = ["all", "low", "normal", "high", "urgent"];
const ENTITY_OPTIONS = [
  "all",
  "university",
  "department",
  "office",
  "person",
];

function slaState(inquiry: SchoolInquiry) {
  if (
    inquiry.first_response_at ||
    ["resolved", "closed", "spam"].includes(inquiry.status)
  ) {
    return { label: "Responded", overdue: false };
  }
  const hours =
    (Date.now() - new Date(inquiry.created_at).getTime()) / 3_600_000;
  if (hours >= 24) {
    return { label: `${Math.floor(hours - 24)}h overdue`, overdue: true };
  }
  return {
    label: `${Math.max(1, Math.ceil(24 - hours))}h SLA left`,
    overdue: false,
  };
}

export function CentralInquiryInbox() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const page = Math.max(1, Number(params.get("page") || 1));
  const inquiryId = params.get("inquiry");
  const status = params.get("status") || "all";
  const priority = params.get("priority") || "all";
  const targetEntityType = params.get("entity") || "all";
  const search = params.get("search") || "";
  const createdFrom = params.get("created_from") || "";
  const createdTo = params.get("created_to") || "";
  const filters: CentralInquiryFilters = {
    page,
    per_page: 20,
    status: status === "all" ? undefined : status,
    priority: priority === "all" ? undefined : priority,
    target_entity_type:
      targetEntityType === "all" ? undefined : targetEntityType,
    search: search || undefined,
    created_from: createdFrom || undefined,
    created_to: createdTo || undefined,
  };
  const inboxQuery = useQuery({
    queryKey: centralInquiryQueryKeys.list(filters),
    queryFn: () => centralInquiryApi.list(filters),
    placeholderData: (previous) => previous,
  });
  const inquiries = inboxQuery.data?.data ?? [];

  function updateUrl(key: string, value?: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page" && key !== "inquiry") next.delete("page");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  return (
    <div>
      <PageHeader
        title="University inquiry inbox"
        description="Manage public conversations routed to the university, departments, offices and people."
      />

      <div className="space-y-6 p-4 sm:p-6">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Matching inquiries",
              value: inboxQuery.data?.meta.total ?? 0,
              detail: "Across current filters",
              icon: Inbox,
            },
            {
              label: "New",
              value: inquiries.filter((item) => item.status === "new").length,
              detail: "On this page",
              icon: MessageCircleMore,
            },
            {
              label: "Resolved",
              value: inquiries.filter((item) =>
                ["resolved", "closed"].includes(item.status),
              ).length,
              detail: "Completed on this page",
              icon: CircleCheck,
            },
            {
              label: "Urgent",
              value: inquiries.filter((item) => item.priority === "urgent")
                .length,
              detail: "Requires priority handling",
              icon: Siren,
            },
          ].map((metric) => (
            <Card key={metric.label}>
              <CardContent className="flex items-start justify-between gap-4 p-5">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-tight">
                    {metric.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {metric.detail}
                  </p>
                </div>
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <metric.icon className="size-5" aria-hidden />
                </span>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card>
          <CardContent className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-5">
            <label className="relative xl:col-span-2">
              <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input
                className="pl-9"
                value={search}
                placeholder="Search sender, subject, reference or entity"
                aria-label="Search inquiries"
                onChange={(event) => updateUrl("search", event.target.value)}
              />
            </label>
            <Select
              value={status}
              onValueChange={(value) => updateUrl("status", value)}
            >
              <SelectTrigger aria-label="Inquiry status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item.replaceAll("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={targetEntityType}
              onValueChange={(value) => updateUrl("entity", value)}
            >
              <SelectTrigger aria-label="Target entity type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_OPTIONS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item === "all" ? "All entities" : item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={priority}
              onValueChange={(value) => updateUrl("priority", value)}
            >
              <SelectTrigger aria-label="Inquiry priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="space-y-1">
              <Label htmlFor="central-inquiry-from" className="text-xs">
                Created from
              </Label>
              <Input
                id="central-inquiry-from"
                type="date"
                value={createdFrom}
                onChange={(event) =>
                  updateUrl("created_from", event.target.value)
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="central-inquiry-to" className="text-xs">
                Created to
              </Label>
              <Input
                id="central-inquiry-to"
                type="date"
                value={createdTo}
                onChange={(event) =>
                  updateUrl("created_to", event.target.value)
                }
              />
            </div>
          </CardContent>
        </Card>

        {inboxQuery.error ? (
          <Alert variant="destructive">
            <AlertDescription>{inboxQuery.error.message}</AlertDescription>
          </Alert>
        ) : null}

        {inboxQuery.isPending ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-28" />
            ))}
          </div>
        ) : (
          <section className="overflow-hidden rounded-lg border bg-background">
            {inquiries.map((inquiry) => {
              const sla = slaState(inquiry);
              const unread =
                inquiry.status === "new" ||
                inquiry.meta_data?.unread === true;
              return (
                <button
                  key={inquiry.id}
                  type="button"
                  className="flex w-full cursor-pointer gap-3 border-b p-4 text-left transition-colors last:border-0 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  onClick={() => updateUrl("inquiry", inquiry.id)}
                >
                  <span
                    className={`mt-1 rounded-full p-2 ${
                      unread
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Mail className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <strong
                        className={unread ? "font-semibold" : "font-medium"}
                      >
                        {inquiry.subject}
                      </strong>
                      {unread ? <Badge>Unread</Badge> : null}
                      <Badge variant="secondary" className="capitalize">
                        {inquiry.target_entity_type}
                      </Badge>
                      <Badge variant="outline">{inquiry.priority}</Badge>
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {inquiry.sender_name} · {inquiry.reference_number}
                    </span>
                    <span className="mt-1 flex items-center gap-1 text-sm font-medium">
                      <Building2 className="size-3.5 text-muted-foreground" />
                      {inquiry.target_entity_name || "Kisii University"}
                    </span>
                    <span className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="capitalize">
                        {inquiry.status.replaceAll("_", " ")}
                      </span>
                      <span
                        className={`flex items-center gap-1 ${
                          sla.overdue ? "font-medium text-destructive" : ""
                        }`}
                      >
                        {sla.overdue ? (
                          <AlertTriangle className="size-3" />
                        ) : (
                          <Clock3 className="size-3" />
                        )}
                        {sla.label}
                      </span>
                      <span>
                        {new Date(
                          inquiry.last_message_at || inquiry.created_at,
                        ).toLocaleString()}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
            {inquiries.length === 0 ? (
              <div className="p-12 text-center">
                <Inbox className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">
                  No inquiries match these filters
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Clear one or more filters to broaden the queue.
                </p>
              </div>
            ) : null}
          </section>
        )}

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Page {page} of {inboxQuery.data?.meta.pages ?? 1}
          </p>
          <div className="flex gap-2">
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
              disabled={page >= (inboxQuery.data?.meta.pages ?? 1)}
              onClick={() => updateUrl("page", String(page + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <CentralInquiryConversation
        inquiryId={inquiryId}
        open={Boolean(inquiryId)}
        onOpenChange={(open) => !open && updateUrl("inquiry")}
      />
    </div>
  );
}
