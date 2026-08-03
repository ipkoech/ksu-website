"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  EditableServiceResourcePage,
  type EditableRecordColumn,
} from "@/components/dashboard/editable-service-resource-page";
import { getPortalResource } from "@/lib/portals/registry";
import type { PortalPayload, PortalResourceConfig } from "@/lib/portals/types";
import { recordRecoveryApi, usePortalAccess, useUploadMedia, type PortalAccess } from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";
import {
  Badge,
  Button,
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
  ImageRenderer,
} from "@ksu/ui/components";
import { toast } from "@ksu/ui";
import { CalendarDays, FileText, Globe2, Image as ImageIcon, Loader2, UploadCloud } from "lucide-react";
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
  const displayOptions = corporateResourceDisplayOptions(portalKey, scopedResource);

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
      viewInEditor={scopedResource.viewInEditor}
      primaryActionLabel={primaryActionLabel(scopedResource)}
      hideHeader={portalKey === "corporate-communication"}
      recordColumns={displayOptions.recordColumns}
      tableLayout={displayOptions.tableLayout}
      actionsInMenuOnly={displayOptions.actionsInMenuOnly}
      editorMode={displayOptions.editorMode}
      supportsRecovery={scopedResource.supportsRecovery}
      recoveryStates={scopedResource.recoveryStates}
      restoreRecord={
        scopedResource.supportsRecovery && scopedResource.recoveryContentType
          ? (record: { id: string }) =>
              recordRecoveryApi.restore(scopedResource.recoveryContentType!, record.id)
          : undefined
      }
      toolbarSlot={
        <>
          {scopedResource.key === "media-assets" && canManage ? (
            <MediaAssetsUploadButton queryKey={scopedResource.queryKey} />
          ) : null}
          {resource.portalScope && lockedAccessOptions.length > 1 ? (
            <ScopeSelector
              accessOptions={lockedAccessOptions}
              value={accessKey(selectedLockedAccess)}
              onChange={setSelectedScopeKey}
            />
          ) : selectedLockedAccess ? (
            <Badge variant="secondary">{selectedLockedAccess.scope_label}</Badge>
          ) : resource.portalScope && hasGlobalPortalAccess ? (
            <Badge variant="secondary">All scopes</Badge>
          ) : null}
        </>
      }
    />
  );
}

function corporateResourceDisplayOptions(
  portalKey: string,
  resource: PortalResourceConfig<any, any>,
): {
  recordColumns?: Array<EditableRecordColumn<any>>;
  tableLayout?: "default" | "compact";
  actionsInMenuOnly?: boolean;
  editorMode?: "dialog" | "sheet" | "auto";
} {
  if (portalKey !== "corporate-communication") return {};

  const visualResources = new Set([
    "news",
    "press-releases",
    "events",
    "homepage-features",
    "sliders",
    "media-assets",
    "testimonials",
  ]);

  return {
    tableLayout: "compact",
    actionsInMenuOnly: true,
    editorMode: "sheet",
    recordColumns: visualResources.has(resource.key)
      ? visualCorporateColumns(resource)
      : textCorporateColumns(resource),
  };
}

function visualCorporateColumns(resource: PortalResourceConfig<any, any>): Array<EditableRecordColumn<any>> {
  if (resource.key === "media-assets") {
    return [
      {
        key: "asset",
        label: "Asset",
        className: "min-w-[360px]",
        render: (record) => <MediaRecordCell record={record} title={resource.getRecordTitle(record)} />,
      },
      {
        key: "classification",
        label: "Classification",
        render: (record) => (
          <div className="space-y-1">
            <Badge variant="secondary" className="capitalize">{String(record.media_type ?? "file")}</Badge>
            <p className="text-xs text-muted-foreground">{record.mime_type ?? "Unknown MIME"}</p>
          </div>
        ),
      },
      {
        key: "visibility",
        label: "Visibility",
        render: (record) => <VisibilityBadges record={record} />,
      },
      {
        key: "updated",
        label: "Uploaded",
        render: (record) => <DateCell value={record.created_at ?? record.updated_at} />,
      },
    ];
  }

  return [
    {
      key: "story",
      label: resource.key === "sliders" ? "Slide" : "Content",
      className: "min-w-[380px]",
      render: (record) => <MediaRecordCell record={record} title={resource.getRecordTitle(record)} meta={resource.getRecordMeta?.(record)} />,
    },
    {
      key: "status",
      label: "Status",
      render: (record) => <VisibilityBadges record={record} />,
    },
    {
      key: "placement",
      label: resource.key === "homepage-features" ? "Placement" : "Channel",
      render: (record) => (
        <div className="space-y-1 text-sm">
          <p className="font-medium capitalize">{String(record.location ?? record.category ?? record.page_key ?? record.testimonial_type ?? "Main site").replace(/_/g, " ")}</p>
          <p className="text-xs text-muted-foreground">
            {record.slug ? `/${record.slug}` : record.display_order !== undefined ? `Order ${record.display_order}` : "Corporate communication"}
          </p>
        </div>
      ),
    },
    {
      key: "updated",
      label: "Activity",
      render: (record) => <DateCell value={record.published_at ?? record.updated_at ?? record.created_at} />,
    },
  ];
}

function textCorporateColumns(resource: PortalResourceConfig<any, any>): Array<EditableRecordColumn<any>> {
  return [
    {
      key: "record",
      label: "Record",
      className: "min-w-[360px]",
      render: (record) => (
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border bg-primary/10 text-primary shadow-sm">
            <FileText className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold tracking-tight">{resource.getRecordTitle(record)}</p>
            <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
              {resource.getRecordMeta?.(record) ?? record.description ?? record.summary ?? record.answer ?? "Corporate communication record"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (record) => (
        <div className="space-y-1">
          <Badge variant="secondary" className="capitalize">
            {String(record.contact_type ?? record.category ?? record.status ?? resource.key).replace(/_/g, " ")}
          </Badge>
          {record.scope_type ? <p className="text-xs text-muted-foreground capitalize">{String(record.scope_type).replace(/_/g, " ")}</p> : null}
        </div>
      ),
    },
    {
      key: "visibility",
      label: "Visibility",
      render: (record) => <VisibilityBadges record={record} />,
    },
    {
      key: "updated",
      label: "Activity",
      render: (record) => <DateCell value={record.updated_at ?? record.created_at} />,
    },
  ];
}

function MediaRecordCell({ record, title, meta }: { record: Record<string, any>; title: string; meta?: string }) {
  const media = record.media ?? record.featured_media ?? record.featured_image ?? record.cover_image ?? record.image ?? record.logo ?? record.photo ?? record.thumbnail ?? record;
  const url = mediaUrl(media);
  const isImage = String(media?.media_type ?? record.media_type ?? media?.mime_type ?? record.mime_type ?? "").includes("image");

  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-muted shadow-sm">
        {url && isImage ? (
          <ImageRenderer src={url} alt={title} className="h-full border-0" imageClassName="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <ImageIcon className="size-5" />
            <span className="text-[10px] font-medium uppercase">{String(record.media_type ?? "content")}</span>
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold tracking-tight">{title}</p>
        <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
          {meta ?? record.summary ?? record.description ?? record.caption ?? record.original_filename ?? "Corporate communication item"}
        </p>
      </div>
    </div>
  );
}

function VisibilityBadges({ record }: { record: Record<string, any> }) {
  const status = record.workflow_status ?? record.status;
  return (
    <div className="flex flex-wrap gap-1.5">
      {status ? <Badge variant={String(status) === "published" ? "default" : "secondary"} className="capitalize">{String(status).replace(/_/g, " ")}</Badge> : null}
      {typeof record.is_published === "boolean" ? <Badge variant={record.is_published ? "default" : "outline"}>{record.is_published ? "Published" : "Unpublished"}</Badge> : null}
      {typeof record.is_active === "boolean" ? <Badge variant={record.is_active ? "default" : "secondary"}>{record.is_active ? "Active" : "Inactive"}</Badge> : null}
      {typeof record.is_public === "boolean" ? <Badge variant="outline"><Globe2 className="mr-1 size-3" />{record.is_public ? "Public" : "Private"}</Badge> : null}
      {typeof record.is_main === "boolean" && record.is_main ? <Badge variant="outline">Main site</Badge> : null}
    </div>
  );
}

function DateCell({ value }: { value?: string | null }) {
  if (!value) return <span className="text-sm text-muted-foreground">Not set</span>;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return <span className="text-sm text-muted-foreground">{value}</span>;
  return (
    <div className="flex items-start gap-2 text-sm">
      <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="font-medium">{date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</p>
        <p className="text-xs text-muted-foreground">{date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</p>
      </div>
    </div>
  );
}

function mediaUrl(media?: Record<string, any> | null) {
  if (!media) return "";
  return media.thumbnail_url ?? media.public_url ?? media.cdn_url ?? media.url ?? "";
}

function primaryActionLabel(resource: PortalResourceConfig<any, any>) {
  if (resource.key === "submissions") return "Submit Publication";
  if (/(review|validation)/.test(resource.key)) return "Review Records";
  if (resource.key === "media-assets") return "Upload Media";
  if (resource.key.includes("media")) return "Attach Media";
  return `Create ${resource.title}`;
}

function MediaAssetsUploadButton({ queryKey }: { queryKey: readonly unknown[] }) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMedia = useUploadMedia();
  const queryClient = useQueryClient();

  const uploadFile = async (file?: File | null) => {
    if (!file) return;
    try {
      await uploadMedia.mutateAsync({
        file,
        isPublic: false,
      });
      await queryClient.invalidateQueries({ queryKey });
      toast.success("Media uploaded");
    } catch {
      toast.error("Failed to upload media");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        className="hidden"
        disabled={uploadMedia.isPending}
        onChange={(event) => void uploadFile(event.target.files?.[0])}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={uploadMedia.isPending}
        onClick={() => inputRef.current?.click()}
      >
        {uploadMedia.isPending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <UploadCloud data-icon="inline-start" />}
        Upload Media
      </Button>
    </>
  );
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
