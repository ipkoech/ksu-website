"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type ResearchGenericRecord, type ResearchGenericPayload } from "@ksu/api-client";
import { toast } from "@ksu/ui";
import {
  Button,
  Input,
  RichTextEditor,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Switch,
} from "@ksu/ui/components";
import { ChevronDown, Edit3, Eye, EyeOff, Star, StarOff, Trash2 } from "lucide-react";
import { MediaPicker } from "@/components/media";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type CoreDetailResource = {
  update: (id: string, data: Partial<ResearchGenericPayload>) => Promise<{ data: ResearchGenericRecord }>;
  delete: (id: string) => Promise<void>;
};

type CoreActionConfirmation = {
  title: string;
  description: string;
  confirmText: string;
  variant?: "default" | "warning" | "destructive" | "success";
  payload?: Partial<ResearchGenericPayload>;
  deleteRecord?: boolean;
};

export function ResearchCoreDetailActions({
  record,
  resource,
  resourceLabel,
  listHref,
}: {
  record: ResearchGenericRecord;
  resource: CoreDetailResource;
  resourceLabel: string;
  listHref: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirmation, setConfirmation] = useState<CoreActionConfirmation | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const editableFields = useMemo(() => getEditableFields(record), [record]);
  const fieldGroups = useMemo(() => groupEditableFields(editableFields), [editableFields]);
  const [editValues, setEditValues] = useState<Record<string, string | boolean>>(() => buildEditValues(record, editableFields));
  const id = String(record.id);
  const uploadEntityType = useMemo(() => getUploadEntityType(resourceLabel), [resourceLabel]);
  const isActive = record.is_active !== false;
  const isFeatured = Boolean(record.is_featured);

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<ResearchGenericPayload>) => resource.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["research-detail"] });
      setEditOpen(false);
      toast.success(`${resourceLabel} updated`);
    },
    onError: () => toast.error(`Failed to update ${resourceLabel.toLowerCase()}`),
  });

  const deleteMutation = useMutation({
    mutationFn: () => resource.delete(id),
    onSuccess: () => {
      toast.success(`${resourceLabel} deleted`);
      router.push(listHref);
      router.refresh();
    },
    onError: () => toast.error(`Failed to delete ${resourceLabel.toLowerCase()}`),
  });

  const busy = updateMutation.isPending || deleteMutation.isPending;
  const openEdit = () => {
    setEditValues(buildEditValues(record, editableFields));
    setEditOpen(true);
  };
  const submitEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateMutation.mutate(buildPayload(editValues, editableFields));
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button type="button" variant="outline" disabled={busy} onClick={openEdit}>
          <Edit3 className="mr-2 h-4 w-4" />
          Edit {resourceLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => setConfirmation({
            title: isActive ? `Deactivate ${resourceLabel.toLowerCase()}` : `Activate ${resourceLabel.toLowerCase()}`,
            description: isActive ? "Hide this record from active research workflows without deleting it." : "Return this record to active research workflows.",
            confirmText: isActive ? "Deactivate" : "Activate",
            variant: isActive ? "warning" : "success",
            payload: { is_active: !isActive },
          })}
        >
          {isActive ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
          {isActive ? "Deactivate" : "Activate"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => setConfirmation({
            title: isFeatured ? `Remove featured ${resourceLabel.toLowerCase()}` : `Feature ${resourceLabel.toLowerCase()}`,
            description: isFeatured ? "Remove this record from featured research displays." : "Mark this record as featured for research displays.",
            confirmText: isFeatured ? "Remove featured" : "Feature",
            payload: { is_featured: !isFeatured },
          })}
        >
          {isFeatured ? <StarOff className="mr-2 h-4 w-4" /> : <Star className="mr-2 h-4 w-4" />}
          {isFeatured ? "Unfeature" : "Feature"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="text-destructive hover:text-destructive"
          disabled={busy}
          onClick={() => setConfirmation({
            title: `Delete ${resourceLabel.toLowerCase()}`,
            description: "Delete this record permanently. This should only be used when the backend has no dependent records that need to remain linked.",
            confirmText: "Delete",
            variant: "destructive",
            deleteRecord: true,
          })}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>
      <Sheet open={editOpen} onOpenChange={(open) => !busy && setEditOpen(open)}>
        <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
          <SheetHeader className="border-b px-6 py-5">
            <SheetTitle>Edit {resourceLabel}</SheetTitle>
            <SheetDescription>Update fields provided by the backend. Relationship mapping stays in the tabs below.</SheetDescription>
          </SheetHeader>
          <form onSubmit={submitEdit} className="flex min-h-0 flex-1 flex-col">
            <CoreEditSheetForm
              groups={fieldGroups}
              values={editValues}
              disabled={busy}
              recordId={id}
              uploadEntityType={uploadEntityType}
              setValues={setEditValues}
            />
            <SheetFooter className="border-t px-6 py-4">
              <Button type="button" variant="outline" disabled={busy} onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={busy}>{updateMutation.isPending ? "Saving..." : "Save changes"}</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
      <ConfirmDialog
        open={Boolean(confirmation)}
        onOpenChange={(open) => !open && setConfirmation(null)}
        title={confirmation?.title ?? "Confirm action"}
        description={confirmation?.description ?? ""}
        confirmText={confirmation?.confirmText ?? "Confirm"}
        variant={confirmation?.variant}
        isLoading={busy}
        onConfirm={() => {
          if (confirmation?.deleteRecord) {
            deleteMutation.mutate();
          } else if (confirmation?.payload) {
            updateMutation.mutate(confirmation.payload);
          }
          setConfirmation(null);
        }}
      />
    </>
  );
}

type EditableField = {
  name: string;
  label: string;
  kind: "text" | "richtext" | "number" | "boolean" | "json" | "media";
};

type EditableFieldGroup = {
  title: string;
  description: string;
  fields: EditableField[];
};

const HIDDEN_EDIT_FIELDS = new Set([
  "id",
  "created_at",
  "updated_at",
  "deleted_at",
]);

function getEditableFields(record: ResearchGenericRecord): EditableField[] {
  return Object.entries(record)
    .filter(([key, value]) => !HIDDEN_EDIT_FIELDS.has(key) && (isMediaField(key) || (value !== null && typeof value !== "object")))
    .map(([key, value]) => ({
      name: key,
      label: key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
      kind: isMediaField(key) ? "media" : typeof value === "boolean" ? "boolean" : typeof value === "number" ? "number" : isRichTextField(key, value) ? "richtext" : "text",
    }));
}

function CoreEditSheetForm({
  groups,
  values,
  disabled,
  recordId,
  uploadEntityType,
  setValues,
}: {
  groups: EditableFieldGroup[];
  values: Record<string, string | boolean>;
  disabled: boolean;
  recordId: string;
  uploadEntityType: string;
  setValues: (updater: (current: Record<string, string | boolean>) => Record<string, string | boolean>) => void;
}) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map((group, index) => [group.title, index < 2])),
  );

  const setField = (field: EditableField, value: string | boolean) => {
    setValues((current) => ({ ...current, [field.name]: value }));
  };

  return (
    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-5">
      {groups.map((group) => (
        <section key={group.title} className="rounded-md border bg-card">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
            onClick={() => setOpenGroups((current) => ({ ...current, [group.title]: !current[group.title] }))}
            aria-expanded={Boolean(openGroups[group.title])}
          >
            <span>
              <span className="block text-sm font-semibold">{group.title}</span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">{group.description}</span>
            </span>
            <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${openGroups[group.title] ? "rotate-180" : ""}`} />
          </button>
          {openGroups[group.title] ? (
            <div className="grid gap-4 border-t p-4 md:grid-cols-2">
              {group.fields.map((field) => (
                <CoreEditFieldControl
                  key={field.name}
                  field={field}
                  value={values[field.name]}
                  disabled={disabled}
                  recordId={recordId}
                  uploadEntityType={uploadEntityType}
                  onChange={(value) => setField(field, value)}
                />
              ))}
            </div>
          ) : null}
        </section>
      ))}
    </div>
  );
}

function CoreEditFieldControl({
  field,
  value,
  disabled,
  recordId,
  uploadEntityType,
  onChange,
}: {
  field: EditableField;
  value: string | boolean | undefined;
  disabled: boolean;
  recordId: string;
  uploadEntityType: string;
  onChange: (value: string | boolean) => void;
}) {
  const label = <span>{field.label}</span>;

  if (field.kind === "boolean") {
    return (
      <label className="flex min-h-20 items-center justify-between gap-4 rounded-md border px-3 py-2 text-sm font-medium">
        <span>
          {label}
          <span className="mt-1 block text-xs font-normal leading-5 text-muted-foreground">{value ? "Enabled" : "Disabled"}</span>
        </span>
        <Switch checked={Boolean(value)} disabled={disabled} onCheckedChange={(checked) => onChange(Boolean(checked))} />
      </label>
    );
  }

  if (field.kind === "richtext") {
    return (
      <div className="space-y-2 text-sm font-medium md:col-span-2">
        {label}
        <RichTextEditor
          toolbar="simple"
          minHeight="150px"
          maxHeight="28rem"
          value={typeof value === "string" ? value : ""}
          disabled={disabled}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          onChange={onChange}
        />
      </div>
    );
  }

  if (field.kind === "media") {
    return (
      <div className="space-y-2 text-sm font-medium md:col-span-2">
        {label}
        <MediaPicker
          value={typeof value === "string" ? value : ""}
          onChange={(nextValue) => onChange(nextValue || "")}
          mediaType="image"
          accept="image/*"
          label={field.label}
          helperText={field.name === "cover_image_id" ? "Upload or choose the cover image for this record." : "Upload or choose an image for this record."}
          uploadEntityType={uploadEntityType}
          uploadEntityId={recordId}
          uploadRole={field.name === "cover_image_id" ? "cover_image" : field.name.replace(/_id$/, "")}
          uploadLabel={value ? "Reupload" : "Upload"}
          allowUpload
          allowClear
          disabled={disabled}
        />
      </div>
    );
  }

  if (field.kind === "json") {
    return (
      <label className="space-y-2 text-sm font-medium md:col-span-2">
        {label}
        <textarea
          className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={String(value ?? "")}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    );
  }

  return (
    <label className="space-y-2 text-sm font-medium">
      {label}
      <Input
        type={field.kind === "number" ? "number" : "text"}
        value={String(value ?? "")}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function groupEditableFields(fields: EditableField[]): EditableFieldGroup[] {
  const groups = [
    {
      title: "Identity",
      description: "Core naming, classification, and display identifiers.",
      names: new Set(["title", "name", "slug", "code", "acronym", "center_type", "status", "icon", "color"]),
    },
    {
      title: "Content",
      description: "Narrative fields shown in admin and public research pages.",
      names: new Set(["about", "summary", "description", "objectives", "mission", "vision", "mandate", "research_areas", "expected_outcomes", "methodology"]),
    },
    {
      title: "Organization",
      description: "Backend references to people, schools, departments, centers, and programs.",
      names: new Set(["school_id", "department_id", "director_id", "lead_id", "center_id", "program_id"]),
    },
    {
      title: "Timeline and Ordering",
      description: "Dates, ordering, and sequencing fields.",
      names: new Set(["established_date", "start_date", "end_date", "display_order"]),
    },
    {
      title: "Location and Contact",
      description: "Location, contact, and external URL fields.",
      names: new Set(["location", "address", "gps_latitude", "gps_longitude", "email", "phone", "website"]),
    },
    {
      title: "Media and SEO",
      description: "Media references and search metadata.",
      names: new Set(["cover_image_id", "logo_id", "photo_id", "thumbnail_image_id", "meta_title", "meta_description", "keywords"]),
    },
    {
      title: "Visibility",
      description: "Publication and admin visibility flags.",
      names: new Set(["is_active", "is_featured", "is_public"]),
    },
  ];
  const assigned = new Set<string>();
  const grouped = groups
    .map((group) => {
      const groupFields = fields.filter((field) => group.names.has(field.name));
      groupFields.forEach((field) => assigned.add(field.name));
      return { title: group.title, description: group.description, fields: groupFields };
    })
    .filter((group) => group.fields.length > 0);
  const remaining = fields.filter((field) => !assigned.has(field.name));
  if (remaining.length > 0) {
    grouped.push({
      title: "Additional Fields",
      description: "Other backend-provided fields for this record.",
      fields: remaining,
    });
  }
  return grouped;
}

function isRichTextField(key: string, value: unknown) {
  const richTextFields = new Set(["about", "summary", "description", "objectives", "mission", "vision", "mandate", "research_areas", "expected_outcomes", "methodology", "meta_description"]);
  return richTextFields.has(key) || String(value ?? "").length > 140;
}

function isMediaField(key: string) {
  return ["cover_image_id", "logo_id", "photo_id", "thumbnail_image_id"].includes(key);
}

function getUploadEntityType(resourceLabel: string) {
  const normalized = resourceLabel.trim().toLowerCase().replace(/\s+/g, "_");
  if (normalized === "center") return "research_center";
  if (normalized === "program") return "research_program";
  if (normalized === "theme") return "research_theme";
  return `research_${normalized}`;
}

function buildEditValues(record: ResearchGenericRecord, fields: EditableField[]) {
  return fields.reduce<Record<string, string | boolean>>((values, field) => {
    const value = record[field.name];
    values[field.name] = typeof value === "boolean" ? value : value == null ? "" : String(value);
    return values;
  }, {});
}

function buildPayload(values: Record<string, string | boolean>, fields: EditableField[]) {
  return fields.reduce<Partial<ResearchGenericPayload>>((payload, field) => {
    const value = values[field.name];
    if (field.kind === "boolean") {
      payload[field.name] = Boolean(value);
      return payload;
    }
    if (field.kind === "number") {
      payload[field.name] = value === "" ? null : Number(value);
      return payload;
    }
    payload[field.name] = value === "" ? null : value;
    return payload;
  }, {});
}
