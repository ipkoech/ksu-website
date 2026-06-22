"use client";

import { useMemo } from "react";
import { EditableServiceResourcePage } from "@/components/dashboard/editable-service-resource-page";
import { getPortalResource } from "@/lib/portals/registry";
import type { PortalPayload, PortalResourceConfig } from "@/lib/portals/types";
import { usePortalAccess, type PortalAccess } from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ksu/ui/components";
import { PageHeader } from "@/components/layout";

interface PortalResourcePageProps {
  portalKey: string;
  resourceKey: string;
}

export function PortalResourcePage({ portalKey, resourceKey }: PortalResourcePageProps) {
  const { hasAnyScope } = usePermissions();
  const portalAccessQuery = usePortalAccess();
  const resource = getPortalResource(portalKey, resourceKey);

  const lockedAccess = useMemo(() => {
    const binding = resource?.portalScope;
    if (!binding) return null;

    const scoped = (portalAccessQuery.data?.data.portals ?? []).filter((access) => {
      if (access.key !== portalKey || !access.locked_scope) return false;
      if (access.scope_type === "global" || access.scope_type === "profile") return false;
      return !binding.allowedScopeTypes || binding.allowedScopeTypes.includes(access.scope_type);
    });

    return scoped.length === 1 ? scoped[0] : null;
  }, [portalAccessQuery.data?.data.portals, portalKey, resource?.portalScope]);

  const scopedResource = useMemo(
    () => (resource && lockedAccess ? lockResourceToPortalScope(resource, lockedAccess) : resource),
    [lockedAccess, resource],
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
      title={scopedResource.title}
      description={
        lockedAccess
          ? `${scopedResource.description} Showing ${lockedAccess.scope_label}.`
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
      emptyMessage={scopedResource.emptyMessage}
      buildPayload={scopedResource.buildPayload}
      validate={scopedResource.validate}
      canCreate={canCreate}
      canEdit={canEdit}
      canDelete={canDelete}
      readOnlyMessage={scopedResource.readOnlyMessage}
    />
  );
}

function lockResourceToPortalScope(
  resource: PortalResourceConfig<any, any>,
  access: PortalAccess,
): PortalResourceConfig<any, any> {
  if (!resource.portalScope) return resource;

  const { typeField, idField } = resource.portalScope;
  const stampScope = (values: PortalPayload = {}) => ({
    ...values,
    [typeField]: access.scope_type,
    [idField]: access.scope_type === "university" ? null : access.scope_id,
  });
  const isLockedField = (field: { name: string; type?: string; entityRecord?: { typeName: string; idName: string } }) =>
    field.name === typeField ||
    field.name === idField ||
    (field.type === "entity-record" &&
      field.entityRecord?.typeName === typeField &&
      field.entityRecord?.idName === idField);

  return {
    ...resource,
    queryKey: [...resource.queryKey, "portal-scope", access.scope_type, access.scope_id ?? "university"],
    fields: resource.fields.filter((field) => !isLockedField(field)),
    listFilters: resource.listFilters?.filter((field) => !isLockedField(field)),
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
