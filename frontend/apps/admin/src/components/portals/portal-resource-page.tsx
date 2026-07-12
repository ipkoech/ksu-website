"use client";

import { useEffect, useMemo, useState } from "react";
import { EditableServiceResourcePage } from "@/components/dashboard/editable-service-resource-page";
import { getPortalResource } from "@/lib/portals/registry";
import type { PortalPayload, PortalResourceConfig } from "@/lib/portals/types";
import { usePortalAccess, type PortalAccess } from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ksu/ui/components";
import { PageHeader } from "@/components/layout";

interface PortalResourcePageProps {
  portalKey: string;
  resourceKey: string;
}

export function PortalResourcePage({ portalKey, resourceKey }: PortalResourcePageProps) {
  const { hasAnyScope } = usePermissions();
  const portalAccessQuery = usePortalAccess();
  const resource = getPortalResource(portalKey, resourceKey);
  const [selectedScopeKey, setSelectedScopeKey] = useState<string>("");
  const portalAccess = useMemo(
    () => portalAccessQuery.data?.data.portals ?? [],
    [portalAccessQuery.data?.data.portals],
  );

  const lockedAccessOptions = useMemo(() => {
    const binding = resource?.portalScope;
    if (!binding) return [];

    return portalAccess.filter((access) => {
      if (access.key !== portalKey || !access.locked_scope) return false;
      if (access.scope_type === "global" || access.scope_type === "profile") return false;
      return !binding.allowedScopeTypes || binding.allowedScopeTypes.includes(access.scope_type);
    });
  }, [portalAccess, portalKey, resource?.portalScope]);

  const hasGlobalPortalAccess = useMemo(
    () =>
      portalAccess.some(
        (access) =>
          access.key === portalKey &&
          !access.locked_scope &&
          access.scope_type === "global",
      ),
    [portalAccess, portalKey],
  );

  const selectedLockedAccess = useMemo(() => {
    if (lockedAccessOptions.length === 0) return null;
    return (
      lockedAccessOptions.find((access) => accessKey(access) === selectedScopeKey) ??
      lockedAccessOptions[0]
    );
  }, [lockedAccessOptions, selectedScopeKey]);

  useEffect(() => {
    if (!resource?.portalScope || lockedAccessOptions.length === 0) {
      if (selectedScopeKey) setSelectedScopeKey("");
      return;
    }

    const hasSelection = lockedAccessOptions.some(
      (access) => accessKey(access) === selectedScopeKey,
    );
    if (!hasSelection) {
      setSelectedScopeKey(accessKey(lockedAccessOptions[0]));
    }
  }, [lockedAccessOptions, resource?.portalScope, selectedScopeKey]);

  const scopedResource = useMemo(
    () =>
      resource && selectedLockedAccess
        ? lockResourceToPortalScope(resource, selectedLockedAccess)
        : resource,
    [selectedLockedAccess, resource],
  );

  if (!resource) {
    return (
      <div>
        <PageHeader title="Resource not found" description="This portal section is not configured." backHref={`/${portalKey}`} />
        <div className="p-4 sm:p-6">
          <Card>
            <CardHeader>
              <CardTitle>Unknown resource</CardTitle>
              <CardDescription>
                Check the portal navigation or choose another section from the dashboard.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (resource.portalScope && portalAccessQuery.isLoading) {
    return (
      <div>
        <PageHeader title={resource.title} description={resource.description} backHref={resource.backHref} />
        <div className="p-4 sm:p-6">
          <Card>
            <CardHeader>
              <CardTitle>Loading office scope</CardTitle>
              <CardDescription>
                Checking which office owns this workspace before loading records.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (resource.portalScope && portalAccessQuery.isError) {
    return (
      <div>
        <PageHeader title={resource.title} description={resource.description} backHref={resource.backHref} />
        <div className="p-4 sm:p-6">
          <Card>
            <CardHeader>
              <CardTitle>Office scope unavailable</CardTitle>
              <CardDescription>
                The portal could not confirm your assigned office scope. Retry after the access service is available.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (resource.portalScope && !selectedLockedAccess && !hasGlobalPortalAccess) {
    return (
      <div>
        <PageHeader title={resource.title} description={resource.description} backHref={resource.backHref} />
        <div className="p-4 sm:p-6">
          <Card>
            <CardHeader>
              <CardTitle>No assigned office scope</CardTitle>
              <CardDescription>
                This resource is managed through an assigned office, library, research, school, or department scope.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                Ask a system administrator to attach your user to the correct unit before managing this section.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!scopedResource) return null;

  const canView = hasAnyScope(scopedResource.viewScopes);
  const canManage = hasAnyScope(scopedResource.manageScopes);
  const canCreate = canManage && scopedResource.canCreate !== false;
  const canEdit = canManage && scopedResource.canEdit !== false;
  const canDelete =
    hasAnyScope(scopedResource.deleteScopes ?? scopedResource.manageScopes) &&
    scopedResource.canDelete !== false;

  if (!canView) {
    return (
      <div>
        <PageHeader title={scopedResource.title} description={scopedResource.description} backHref={scopedResource.backHref} />
        <div className="p-4 sm:p-6">
          <Card>
            <CardHeader>
              <CardTitle>Access required</CardTitle>
              <CardDescription>
                Your current role can access this portal, but not this resource.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                Required scopes: {scopedResource.viewScopes.join(", ")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <EditableServiceResourcePage
      key={selectedLockedAccess ? accessKey(selectedLockedAccess) : "unscoped"}
      title={scopedResource.title}
      description={
        selectedLockedAccess
          ? `${scopedResource.description} Showing ${selectedLockedAccess.scope_label}.`
          : scopedResource.description
      }
      backHref={scopedResource.backHref}
      queryKey={scopedResource.queryKey}
      fields={scopedResource.fields}
      listFilters={scopedResource.listFilters}
      list={scopedResource.list}
      create={scopedResource.create}
      update={scopedResource.update}
      delete={scopedResource.delete}
      getRecordTitle={scopedResource.getRecordTitle}
      getRecordMeta={scopedResource.getRecordMeta}
      getRecordDetailHref={scopedResource.getRecordDetailHref}
      getRecordWorkflowActions={scopedResource.getRecordWorkflowActions}
      hasAnyWorkflowScope={hasAnyScope}
      emptyMessage={scopedResource.emptyMessage}
      buildPayload={scopedResource.buildPayload}
      validate={scopedResource.validate}
      canCreate={canCreate}
      canEdit={canEdit}
      canDelete={canDelete}
      readOnlyMessage={scopedResource.readOnlyMessage}
      primaryActionLabel={primaryActionLabel(scopedResource)}
      toolbarSlot={
        resource.portalScope && lockedAccessOptions.length > 1 ? (
          <ScopeSelector
            accessOptions={lockedAccessOptions}
            value={accessKey(selectedLockedAccess)}
            onChange={setSelectedScopeKey}
          />
        ) : selectedLockedAccess ? (
          <Badge variant="secondary">{selectedLockedAccess.scope_label}</Badge>
        ) : resource.portalScope && hasGlobalPortalAccess ? (
          <Badge variant="secondary">All scopes</Badge>
        ) : null
      }
    />
  );
}

function primaryActionLabel(resource: PortalResourceConfig<any, any>) {
  if (resource.key === "submissions") return "Submit Publication";
  if (/(review|validation)/.test(resource.key)) return "Review Records";
  if (resource.key.includes("media")) return "Attach Media";
  return "Create Record";
}

function accessKey(access: PortalAccess | null) {
  if (!access) return "";
  return `${access.scope_type}:${access.scope_id ?? "university"}`;
}

function ScopeSelector({
  accessOptions,
  value,
  onChange,
}: {
  accessOptions: PortalAccess[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2 sm:min-w-72">
      <p className="text-xs font-medium text-muted-foreground">Active scope</p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Choose assigned scope" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {accessOptions.map((access) => (
              <SelectItem key={accessKey(access)} value={accessKey(access)}>
                {access.scope_label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function lockResourceToPortalScope(
  resource: PortalResourceConfig<any, any>,
  access: PortalAccess,
): PortalResourceConfig<any, any> {
  if (!resource.portalScope) return resource;

  const { typeField, idField, stampPayload = true } = resource.portalScope;
  const stampScope = (values: PortalPayload = {}) => ({
    ...values,
    ...(stampPayload && typeField ? { [typeField]: access.scope_type } : {}),
    ...(stampPayload && idField
      ? { [idField]: access.scope_type === "university" ? null : access.scope_id }
      : {}),
  });
  const isLockedField = (field: { name: string; type?: string; entityRecord?: { typeName: string; idName: string } }) =>
    (typeField ? field.name === typeField : false) ||
    (idField ? field.name === idField : false) ||
    (field.type === "entity-record" &&
      (!typeField || field.entityRecord?.typeName === typeField) &&
      (!idField || field.entityRecord?.idName === idField));

  return {
    ...resource,
    queryKey: [...resource.queryKey, "portal-scope", access.scope_type, access.scope_id ?? "university"],
    fields: resource.fields.filter((field) => !isLockedField(field)),
    listFilters: resource.listFilters?.filter((field) => !isLockedField(field)),
    canCreate: resource.portalScope.lockedCanCreate ?? resource.canCreate,
    list: (filters) => resource.list(stampScope(filters)),
    create: (payload) => resource.create(stampScope(payload)),
    update: (id, payload) => resource.update(id, stampScope(payload)),
    buildPayload: (values, editingRecord) =>
      resource.buildPayload
        ? resource.buildPayload(stampScope(values), editingRecord)
        : stampScope(values),
    validate: (values, editingRecord) =>
      resource.validate?.(stampScope(values), editingRecord) ?? {},
  };
}
