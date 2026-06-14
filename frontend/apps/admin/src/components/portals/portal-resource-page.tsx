"use client";

import { EditableServiceResourcePage } from "@/components/dashboard/editable-service-resource-page";
import { getPortalResource } from "@/lib/portals/registry";
import { usePermissions } from "@ksu/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ksu/ui/components";
import { PageHeader } from "@/components/layout";

interface PortalResourcePageProps {
  portalKey: string;
  resourceKey: string;
}

export function PortalResourcePage({ portalKey, resourceKey }: PortalResourcePageProps) {
  const { hasAnyScope } = usePermissions();
  const resource = getPortalResource(portalKey, resourceKey);

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

  const canView = hasAnyScope(resource.viewScopes);
  const canManage = hasAnyScope(resource.manageScopes);
  const canCreate = canManage && resource.canCreate !== false;
  const canEdit = canManage && resource.canEdit !== false;
  const canDelete =
    hasAnyScope(resource.deleteScopes ?? resource.manageScopes) &&
    resource.canDelete !== false;

  if (!canView) {
    return (
      <div>
        <PageHeader title={resource.title} description={resource.description} backHref={resource.backHref} />
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
                Required scopes: {resource.viewScopes.join(", ")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <EditableServiceResourcePage
      title={resource.title}
      description={resource.description}
      backHref={resource.backHref}
      queryKey={resource.queryKey}
      fields={resource.fields}
      listFilters={resource.listFilters}
      list={resource.list}
      create={resource.create}
      update={resource.update}
      delete={resource.delete}
      getRecordTitle={resource.getRecordTitle}
      getRecordMeta={resource.getRecordMeta}
      getRecordDetailHref={resource.getRecordDetailHref}
      getRecordWorkflowActions={resource.getRecordWorkflowActions}
      emptyMessage={resource.emptyMessage}
      buildPayload={resource.buildPayload}
      validate={resource.validate}
      canCreate={canCreate}
      canEdit={canEdit}
      canDelete={canDelete}
      readOnlyMessage={resource.readOnlyMessage}
    />
  );
}
