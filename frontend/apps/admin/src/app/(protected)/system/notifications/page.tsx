"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth, usePermissions } from "@ksu/auth";
import { useCreateNotificationTemplate, useDeleteNotificationTemplate, useNotificationTemplates, useUpdateNotificationTemplate } from "@ksu/api-client/hooks/admin";
import type { NotificationTemplate } from "@ksu/api-client/types/admin";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  DeleteConfirmDialog,
  FormDialog,
  Input,
  Label,
  PageHeader,
  RichTextEditor,
  richTextToPlainText,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ksu/ui/components";
import { canManageNotifications, canSendNotifications, canViewNotifications } from "../_lib/access";

const emptyTemplateForm = {
  code: "",
  name: "",
  description: "",
  title: "",
  subject: "",
  body: "",
  channel: "email",
  is_active: true,
};

const channelOptions = [
  { value: "email", label: "Email" },
  { value: "in_app", label: "In app" },
  { value: "sms", label: "SMS" },
  { value: "push", label: "Push" },
];

function codeFromName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const { hasScope } = usePermissions();
  const canManage = canManageNotifications(user, hasScope);
  const canSend = canSendNotifications(user, hasScope);
  const canView = canViewNotifications(user, hasScope);
  const templates = useNotificationTemplates({ enabled: canView });
  const createTemplate = useCreateNotificationTemplate();
  const updateTemplate = useUpdateNotificationTemplate();
  const deleteTemplate = useDeleteNotificationTemplate();
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<NotificationTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<NotificationTemplate | null>(null);
  const [form, setForm] = React.useState(emptyTemplateForm);

  const openEditor = (template?: NotificationTemplate) => {
    if (template) {
      setEditing(template);
      setForm({
        code: template.code,
        name: template.name,
        description: template.description ?? "",
        title: template.title_template ?? template.name,
        subject: template.subject_template ?? "",
        body: template.message_template ?? "",
        channel: template.channels[0] ?? "email",
        is_active: template.is_active,
      });
    } else {
      setEditing(null);
      setForm(emptyTemplateForm);
    }
    setOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Manage reusable notification templates and send ad hoc announcements."
        breadcrumbs={[{ label: "System", href: "/system" }, { label: "Notifications" }]}
        primaryAction={canManage ? { label: "New template", onClick: () => openEditor() } : undefined}
        secondaryActions={canSend ? [{ label: "Send notification", href: "/system/notifications/send" }] : undefined}
      />
      <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
        {!canView ? <p className="col-span-full text-sm text-muted-foreground">You can send notifications, but you do not have access to view templates.</p> : null}
        {(templates.data ?? []).map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{template.name}</CardTitle>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {template.channels.map((channel) => <Badge key={channel} variant="secondary">{channel}</Badge>)}
                    <Badge variant={template.is_active ? "default" : "outline"}>{template.is_active ? "Active" : "Inactive"}</Badge>
                  </div>
                </div>
                {canManage ? (
                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => openEditor(template)}>Edit</Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setDeleteTarget(template)}>Delete</Button>
                  </div>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{template.subject_template || template.title_template || "No subject"}</p>
              <p className="line-clamp-4 text-sm">{template.message_template || "No body provided."}</p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/system/notifications/send">Use template</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit template" : "Create template"}
        onSubmit={async () => {
          const message = richTextToPlainText(form.body);
          if (editing) {
            await updateTemplate.mutateAsync({
              id: editing.id,
              data: {
                name: form.name,
                description: form.description || null,
                title_template: form.title || form.name,
                subject_template: form.subject || null,
                message_template: message,
                channels: [form.channel],
                is_active: form.is_active,
              },
            });
          } else {
            const code = form.code.trim() || codeFromName(form.name);
            await createTemplate.mutateAsync({
              code: code || `template_${Date.now()}`,
              name: form.name,
              description: form.description || null,
              title_template: form.title || form.name,
              subject_template: form.subject || null,
              message_template: message,
              channels: [form.channel],
              is_active: form.is_active,
            });
          }
          setOpen(false);
        }}
        isSubmitting={createTemplate.isPending || updateTemplate.isPending}
      >
        {!editing ? (
          <div className="space-y-2">
            <Label>Code</Label>
            <Input value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} placeholder="leave blank to generate from name" />
          </div>
        ) : null}
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Input value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Subject</Label>
          <Input value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Body</Label>
          <RichTextEditor value={form.body} onChange={(body) => setForm((current) => ({ ...current, body }))} toolbar="simple" minHeight="160px" />
        </div>
        <div className="space-y-2">
          <Label>Channel</Label>
          <Select
            value={form.channel}
            onValueChange={(value) => setForm((current) => ({ ...current, channel: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {channelOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <label className="flex items-center gap-3 text-sm">
          <Checkbox checked={form.is_active} onCheckedChange={(checked) => setForm((current) => ({ ...current, is_active: Boolean(checked) }))} />
          Active template
        </label>
      </FormDialog>

      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(nextOpen) => !nextOpen && setDeleteTarget(null)}
        itemName={deleteTarget?.name ?? "template"}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteTemplate.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        isDeleting={deleteTemplate.isPending}
      />
    </div>
  );
}
