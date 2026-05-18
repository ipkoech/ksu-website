"use client";

import * as React from "react";
import { Copy, Eye, EyeOff, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useAuth, usePermissions } from "@ksu/auth";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Checkbox, ConfirmDialog, DataTable, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, FormDialog, Input, Label, PageHeader, Textarea } from "@ksu/ui/components";
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from "@ksu/api-client/hooks/admin";
import type { ApiKey } from "@ksu/api-client/types/admin";
import { canManageApiKeys } from "../../_lib/access";

const AVAILABLE_SCOPES = [
  { value: "programmes:read", label: "Read Programmes", description: "View programmes list and details" },
  { value: "settings:read", label: "Read Settings", description: "View public settings" },
  { value: "schools:read", label: "Read Schools", description: "View schools and departments" },
  { value: "news:read", label: "Read News", description: "View news and announcements" },
  { value: "events:read", label: "Read Events", description: "View events and calendars" },
  { value: "admissions:read", label: "Read Admissions", description: "View admission information" },
  { value: "staff:read", label: "Read Staff", description: "View staff directory" },
];

interface CreateFormState {
  name: string;
  description: string;
  scopes: string[];
  expires_at: string;
  rate_limit: string;
}

export default function ApiKeysPage() {
  const { user } = useAuth();
  const { hasScope } = usePermissions();
  const apiKeys = useApiKeys();
  const createApiKey = useCreateApiKey();
  const revokeApiKey = useRevokeApiKey();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [viewTarget, setViewTarget] = React.useState<ApiKey | null>(null);
  const [showKeyTarget, setShowKeyTarget] = React.useState<{ name: string; key: string } | null>(null);
  const [revokeTarget, setRevokeTarget] = React.useState<ApiKey | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<ApiKey | null>(null);
  const [createdSecret, setCreatedSecret] = React.useState<{ name: string; key: string } | null>(null);
  const [form, setForm] = React.useState<CreateFormState>({ name: "", description: "", scopes: [], expires_at: "", rate_limit: "1000" });
  const canManage = canManageApiKeys(user, hasScope);

  const handleScopeToggle = (scope: string) => {
    setForm((prev) => ({
      ...prev,
      scopes: prev.scopes.includes(scope) ? prev.scopes.filter((s) => s !== scope) : [...prev.scopes, scope],
    }));
  };

  const handleCreate = async () => {
    try {
      const response = await createApiKey.mutateAsync({
        name: form.name,
        description: form.description,
        scopes: form.scopes,
        expires_at: form.expires_at || null,
        rate_limit: parseInt(form.rate_limit, 10) || 1000,
      });
      setCreatedSecret({ name: form.name, key: response.data?.api_key ?? "" });
      setForm({ name: "", description: "", scopes: [], expires_at: "", rate_limit: "1000" });
      setCreateOpen(false);
    } catch (error) {
      console.error("Failed to create API key:", error);
    }
  };

  return (
    <div>
      <PageHeader
        title="API keys"
        description="Issue scoped machine credentials for external developers. Full secrets are shown only once at creation time."
        breadcrumbs={[{ label: "System", href: "/system" }, { label: "Settings", href: "/system/settings" }, { label: "API keys" }]}
        primaryAction={canManage ? { label: "Create API key", onClick: () => setCreateOpen(true) } : undefined}
      />
      <div className="space-y-4 p-6">
        {createdSecret && (
          <Card className="border-green-500 bg-green-50/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <CardTitle className="text-base text-green-800">API Key Created Successfully</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-700 mb-3">
                The API key for <strong>"{createdSecret.name}"</strong> has been created. Copy it now — it will never be shown again.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-muted p-3 text-sm font-mono">{createdSecret.key}</code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(createdSecret.key);
                  }}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCreatedSecret(null)}>
                  Done
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        <DataTable<ApiKey>
          columns={[
            { key: "name", header: "Name", accessor: "name" },
            { key: "description", header: "Description", cell: (row) => row.description || "-" },
            { key: "scopes", header: "Scopes", cell: (row) => <div className="flex flex-wrap gap-1 max-w-[200px]">{(row.scopes || []).slice(0, 3).map((scope: string) => <Badge key={scope} variant="secondary" className="text-xs">{scope}</Badge>)}{(row.scopes || []).length > 3 && <Badge variant="outline" className="text-xs">+{row.scopes.length - 3}</Badge>}</div> },
            { key: "rate_limit", header: "Rate", cell: (row) => `${row.rate_limit}/hr` },
            { key: "expires_at", header: "Expires", cell: (row) => row.expires_at ? new Date(row.expires_at).toLocaleDateString() : "Never" },
            { key: "last_used_at", header: "Last used", cell: (row) => row.last_used_at ? new Date(row.last_used_at).toLocaleString() : "Never" },
            { key: "status", header: "Status", cell: (row) => <Badge variant={row.is_active ? "default" : "destructive"}>{row.is_active ? "Active" : "Revoked"}</Badge> },
            { key: "actions", header: "Actions", cell: (row) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setViewTarget(row)}>Details</Button>
                {canManage && row.is_active && (
                  <Button variant="ghost" size="sm" onClick={() => setRevokeTarget(row)}>Revoke</Button>
                )}
                {canManage && (
                  <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(row)}>Delete</Button>
                )}
              </div>
            )},
          ]}
          data={apiKeys.data ?? []}
          pagination={{ page: 1, limit: apiKeys.data?.length ?? 10, total: apiKeys.data?.length ?? 0, totalPages: 1 }}
          onPaginationChange={() => undefined}
          isLoading={apiKeys.isLoading}
        />
      </div>

      <FormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Create API key"
        description="Generate a new API key for external developers. The secret will be shown once."
        onSubmit={handleCreate}
        isSubmitting={createApiKey.isPending}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="e.g., Mobile App Integration"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Describe the purpose of this key..."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Permissions / Scopes *</Label>
            <div className="grid grid-cols-1 gap-2 rounded-lg border p-3 max-h-[200px] overflow-y-auto">
              {AVAILABLE_SCOPES.map((scope) => (
                <label key={scope.value} className="flex items-start gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded">
                  <Checkbox
                    checked={form.scopes.includes(scope.value)}
                    onCheckedChange={() => handleScopeToggle(scope.value)}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="text-sm font-medium">{scope.label}</span>
                    <p className="text-xs text-muted-foreground">{scope.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expires_at">Expiry date</Label>
              <Input
                id="expires_at"
                type="date"
                value={form.expires_at}
                onChange={(event) => setForm((current) => ({ ...current, expires_at: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate_limit">Rate limit (/hour)</Label>
              <Input
                id="rate_limit"
                type="number"
                value={form.rate_limit}
                onChange={(event) => setForm((current) => ({ ...current, rate_limit: event.target.value }))}
                min={100}
                max={10000}
              />
            </div>
          </div>
        </div>
      </FormDialog>

      <Dialog open={Boolean(viewTarget)} onOpenChange={(open) => !open && setViewTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>API Key Details</DialogTitle>
            <DialogDescription>Complete information about this API key.</DialogDescription>
          </DialogHeader>
          {viewTarget && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4 space-y-3">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="col-span-2 font-medium">{viewTarget.name}</span>
                  <span className="text-muted-foreground">Description:</span>
                  <span className="col-span-2">{viewTarget.description || "-"}</span>
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={viewTarget.is_active ? "default" : "destructive"} className="w-fit">{viewTarget.is_active ? "Active" : "Revoked"}</Badge>
                  <span className="text-muted-foreground">Rate limit:</span>
                  <span className="col-span-2">{viewTarget.rate_limit}/hour</span>
                  <span className="text-muted-foreground">Expires:</span>
                  <span className="col-span-2">{viewTarget.expires_at ? new Date(viewTarget.expires_at).toLocaleDateString() : "Never"}</span>
                  <span className="text-muted-foreground">Created:</span>
                  <span className="col-span-2">{viewTarget.created_at ? new Date(viewTarget.created_at).toLocaleString() : "Unknown"}</span>
                  <span className="text-muted-foreground">Last used:</span>
                  <span className="col-span-2">{viewTarget.last_used_at ? new Date(viewTarget.last_used_at).toLocaleString() : "Never"}</span>
                  <span className="text-muted-foreground">ID:</span>
                  <code className="col-span-2 text-xs">{viewTarget.id}</code>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Scopes</Label>
                <div className="flex flex-wrap gap-2">
                  {(viewTarget.scopes || []).map((s) => (
                    <Badge key={s} variant="outline" className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(revokeTarget)}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
        title="Revoke API Key"
        description={`Are you sure you want to revoke "${revokeTarget?.name}"? This will immediately deactivate the key and all requests using it will fail.`}
        confirmLabel="Revoke Key"
        onConfirm={async () => {
          if (!revokeTarget) return;
          await revokeApiKey.mutateAsync(revokeTarget.id);
          setRevokeTarget(null);
        }}
        isLoading={revokeApiKey.isPending}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete API Key"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={async () => {
          if (!deleteTarget) return;
          await revokeApiKey.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        isLoading={revokeApiKey.isPending}
      />
    </div>
  );
}
