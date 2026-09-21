/** Environment-neutral research display helpers for client feature components. */
export function compactText(value?: unknown) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

export function formatLabel(value?: unknown) {
  return compactText(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatDate(value?: unknown) {
  const text = compactText(value);
  if (!text) return "";
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export type ResearchDisplayValue = string | number | boolean | null | undefined;

export type ResearchRecordDisplayDto = {
  id: string;
  slug?: string | null;
  title?: string | null;
  name?: string | null;
  code?: string | null;
  summary?: string | null;
  description?: string | null;
  status?: string | null;
  is_active?: boolean | null;
  is_featured?: boolean | null;
  [key: string]: ResearchDisplayValue;
};

/**
 * Project a backend record into a JSON-safe DTO for a Client Component.
 * Relationship objects are deliberately omitted; public listing displays use
 * their stable foreign-key values and separately loaded label maps.
 */
export function toResearchRecordDisplayDto(record: Record<string, unknown>): ResearchRecordDisplayDto {
  const dto: Record<string, ResearchDisplayValue> = { id: String(record.id ?? "") };
  for (const [key, value] of Object.entries(record)) {
    if (value === null || value === undefined || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      dto[key] = value as ResearchDisplayValue;
      continue;
    }
    if (Array.isArray(value)) {
      const scalarValues = value.filter((item): item is string | number | boolean => ["string", "number", "boolean"].includes(typeof item));
      if (scalarValues.length) dto[key] = scalarValues.join(", ");
    }
  }
  return dto as ResearchRecordDisplayDto;
}
