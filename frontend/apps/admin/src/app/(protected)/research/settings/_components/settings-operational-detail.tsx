"use client";

import type { ResearchGenericRecord } from "@ksu/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@ksu/ui/components";
import { ResearchDetailRelationshipTabs } from "../../_components/research-admin-detail-page";

type SettingsOperationalKind = "service" | "resource" | "guideline" | "slider";

export function SettingsOperationalDetail({
  record,
  kind,
}: {
  record: ResearchGenericRecord;
  kind: SettingsOperationalKind;
}) {
  return (
    <ResearchDetailRelationshipTabs
      defaultValue="status"
      tabs={[
        {
          value: "status",
          label: "Operational Status",
          content: (
            <SettingsOperationalCard
              title="Operational Status"
              facts={[
                ["Status", record.status ?? activeLabel(record)],
                ["Active", booleanLabel(record.is_active)],
                ["Public", booleanLabel(record.is_public)],
                ["Featured", booleanLabel(record.is_featured)],
                ["Sort Order", record.display_order],
              ]}
            />
          ),
        },
        {
          value: "access",
          label: "Access And Ownership",
          content: (
            <SettingsOperationalCard
              title="Access And Ownership"
              facts={accessFacts(record, kind)}
            />
          ),
        },
        {
          value: "publication",
          label: "Publication And Review",
          content: (
            <SettingsOperationalCard
              title="Publication And Review"
              facts={publicationFacts(record, kind)}
            />
          ),
        },
      ]}
    />
  );
}

function SettingsOperationalCard({
  title,
  facts,
}: {
  title: string;
  facts: Array<[string, unknown]>;
}) {
  const visibleFacts = facts.filter(([, value]) => value !== undefined && value !== null && value !== "");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {visibleFacts.length ? (
          <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visibleFacts.map(([label, value]) => (
              <div key={label} className="rounded-lg border bg-background p-3">
                <dt className="text-xs font-medium uppercase text-muted-foreground">{label}</dt>
                <dd className="mt-1 break-words text-sm font-medium">{formatValue(value)}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">No operational metadata was returned for this record.</p>
        )}
      </CardContent>
    </Card>
  );
}

function accessFacts(record: ResearchGenericRecord, kind: SettingsOperationalKind): Array<[string, unknown]> {
  if (kind === "slider") {
    return [
      ["Group", record.slider_group_id],
      ["Desktop Media", record.desktop_media_id],
      ["Mobile Media", record.mobile_media_id],
      ["CTA Text", record.link_text],
      ["CTA URL", record.external_url],
    ];
  }
  if (kind === "guideline") {
    return [
      ["Document", record.document_name],
      ["Document URL", record.document_url],
      ["Approved By", record.approved_by],
      ["Contact", record.contact_email],
      ["Scope", record.scope],
    ];
  }
  return [
    ["Center", record.center_id],
    ["Department", record.department_id],
    ["Owner/Manager", record.manager_id ?? record.contact_name],
    ["Contact Email", record.contact_email],
    ["Contact Phone", record.contact_phone],
    ["Access URL", record.access_url ?? record.request_url ?? record.booking_url],
  ];
}

function publicationFacts(record: ResearchGenericRecord, kind: SettingsOperationalKind): Array<[string, unknown]> {
  if (kind === "guideline") {
    return [
      ["Version", record.version],
      ["Effective Date", record.effective_date],
      ["Review Date", record.review_date],
      ["Approval Date", record.approval_date],
      ["Status", record.status],
    ];
  }
  if (kind === "slider") {
    return [
      ["Main Slider", booleanLabel(record.is_main)],
      ["Public", booleanLabel(record.is_public)],
      ["Active", booleanLabel(record.is_active)],
      ["Sort Order", record.display_order],
      ["Updated", record.updated_at],
    ];
  }
  return [
    ["Eligibility", record.eligibility],
    ["Availability", record.availability],
    ["Operating Hours", record.operating_hours],
    ["Fee Structure", record.fee_structure],
    ["Updated", record.updated_at],
  ];
}

function activeLabel(record: ResearchGenericRecord) {
  if (typeof record.is_active === "boolean") return record.is_active ? "active" : "inactive";
  return "";
}

function booleanLabel(value: unknown): string {
  if (typeof value !== "boolean") return value === undefined || value === null ? "" : String(value);
  return value ? "Yes" : "No";
}

function formatValue(value: unknown): string {
  if (typeof value === "boolean") return booleanLabel(value);
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  if (typeof value === "object" && value) return JSON.stringify(value);
  return String(value);
}
