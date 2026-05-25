"use client";

import * as React from "react";
import { useAuth, usePermissions } from "@ksu/auth";
import { Badge, Button, Checkbox, DataTable, DeleteConfirmDialog, FormDialog, Input, Label, PageHeader, StatusBadge } from "@ksu/ui/components";
import { useCreateWebhook, useDeleteWebhook, useUpdateWebhook, useWebhooks } from "@ksu/api-client/hooks/admin";
import type { Webhook } from "@ksu/api-client/types/admin";
import { webhookSchema } from "../../_lib/schemas";
import { canManageWebhooks } from "../../_lib/access";

const defaultEvents = ["users.created", "users.updated", "roles.updated", "settings.updated"];

export default function WebhooksPage() {
  const { user } = useAuth();
  const { hasScope } = usePermissions();
  const webhooks = useWebhooks();
  const createWebhook = useCreateWebhook();
  const updateWebhook = useUpdateWebhook();
  const deleteWebhook = useDeleteWebhook();
  const [open, setOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Webhook | null>(null);
  const [editing, setEditing] = React.useState<Webhook | null>(null);
  const [customEvent, setCustomEvent] = React.useState("");
  const [form, setForm] = React.useState({ name: "", url: "", secret: "", events: [] as string[], is_active: true });
  const canManage = canManageWebhooks(user, hasScope);

  const openEditor = (webhook?: Webhook) => {
    if (webhook) {
      setEditing(webhook);
      setForm({ name: webhook.name, url: webhook.url, secret: webhook.secret ?? "", events: webhook.events, is_active: webhook.is_active });
    } else {
      setEditing(null);
      setForm({ name: "", url: "", secret: "", events: [], is_active: true });
    }
    setCustomEvent("");
    setOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Webhooks"
        description="Deliver outbound system events to external services."
        breadcrumbs={[{ label: "System", href: "/system" }, { label: "Settings", href: "/system/settings" }, { label: "Webhooks" }]}
        primaryAction={canManage ? { label: "Create webhook", onClick: () => openEditor() } : undefined}
      />
      <div className="p-6">
        <DataTable<Webhook>
          columns={[
            { key: "url", header: "URL", accessor: "url" },
            { key: "events", header: "Events", cell: (row) => <div className="flex flex-wrap gap-2">{row.events.map((event) => <Badge key={event} variant="secondary">{event}</Badge>)}</div> },
            { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.is_active ? "active" : "inactive"} variant={row.is_active ? "success" : "error"} /> },
            { key: "last_triggered_at", header: "Last triggered", cell: (row) => row.last_triggered_at ? new Date(row.last_triggered_at).toLocaleString() : "Never" },
            {
              key: "actions",
              header: "Actions",
              cell: (row) => (
                <div className="flex gap-2">
                  <Button disabled={!canManage} variant="ghost" onClick={() => openEditor(row)}>Edit</Button>
                  <Button disabled={!canManage} variant="ghost" onClick={() => setDeleteTarget(row)}>Delete</Button>
                </div>
              ),
            },
          ]}
          data={webhooks.data ?? []}
          pagination={{ page: 1, limit: webhooks.data?.length ?? 10, total: webhooks.data?.length ?? 0, totalPages: 1 }}
          onPaginationChange={() => undefined}
          isLoading={webhooks.isLoading}
        />
      </div>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit webhook" : "Create webhook"}
        onSubmit={async () => {
          const parsed = webhookSchema.safeParse(form);
          if (!parsed.success) {
            throw new Error(parsed.error.issues[0]?.message ?? "Invalid webhook");
          }
          const payload = { ...parsed.data, secret: parsed.data.secret || null };
          if (editing) {
            await updateWebhook.mutateAsync({ id: editing.id, data: payload });
          } else {
            await createWebhook.mutateAsync(payload);
          }
          setOpen(false);
        }}
        isSubmitting={createWebhook.isPending || updateWebhook.isPending}
      >
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Webhook URL</Label>
          <Input value={form.url} onChange={(event) => setForm((current) => ({ ...current, url: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Signing secret</Label>
          <Input
            value={form.secret}
            onChange={(event) => setForm((current) => ({ ...current, secret: event.target.value }))}
            placeholder="Optional shared secret"
          />
        </div>
        <label className="flex items-center gap-3 text-sm">
          <Checkbox checked={form.is_active} onCheckedChange={(checked) => setForm((current) => ({ ...current, is_active: Boolean(checked) }))} />
          Active webhook
        </label>
        <div className="space-y-2">
          <Label>Events</Label>
          <div className="flex flex-wrap gap-2">
            {defaultEvents.map((eventName) => {
              const selected = form.events.includes(eventName);
              return (
                <button
                  key={eventName}
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      events: selected ? current.events.filter((value) => value !== eventName) : [...current.events, eventName],
                    }))
                  }
                >
                  <Badge variant={selected ? "default" : "secondary"}>{eventName}</Badge>
                </button>
              );
            })}
          </div>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <Input
              value={customEvent}
              onChange={(event) => setCustomEvent(event.target.value)}
              placeholder="content.published"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const eventName = customEvent.trim();
                if (!eventName) return;
                setForm((current) => ({
                  ...current,
                  events: current.events.includes(eventName) ? current.events : [...current.events, eventName],
                }));
                setCustomEvent("");
              }}
            >
              Add event
            </Button>
          </div>
        </div>
      </FormDialog>

      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(openState) => !openState && setDeleteTarget(null)}
        itemName={deleteTarget?.url ?? "webhook"}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteWebhook.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        isDeleting={deleteWebhook.isPending}
      />
    </div>
  );
}
