"use client";

export type PayloadFieldMap<TPayload extends object> = Record<string, readonly (keyof TPayload)[]>;

function isDirtyField(value: unknown): boolean {
  if (value === true) return true;
  if (!value || typeof value !== "object") return false;
  return Object.values(value as Record<string, unknown>).some(isDirtyField);
}

export function pickChangedPayload<TPayload extends object>(
  payload: TPayload,
  dirtyFields: Record<string, unknown>,
  fieldMap: PayloadFieldMap<TPayload>,
): Partial<TPayload> {
  const patch: Partial<TPayload> = {};

  for (const [formField, payloadFields] of Object.entries(fieldMap)) {
    if (!isDirtyField(dirtyFields[formField])) continue;

    for (const payloadField of payloadFields) {
      const value = payload[payloadField];
      if (value !== undefined) {
        patch[payloadField] = value;
      }
    }
  }

  return patch;
}

function normalizeComparableValue(value: unknown) {
  if (value === undefined || value === null || value === "") return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    if (/^\d{4}-\d{2}-\d{2}(?:[T\s]|$)/.test(trimmed)) {
      const timestamp = Date.parse(trimmed);
      if (!Number.isNaN(timestamp)) {
        return new Date(timestamp).toISOString();
      }
    }

    return trimmed.replace(/\s+/g, " ");
  }

  if (Array.isArray(value) || typeof value === "object") {
    return JSON.stringify(value);
  }

  return value;
}

function valuesMatch(left: unknown, right: unknown) {
  return normalizeComparableValue(left) === normalizeComparableValue(right);
}

export function pickChangedPayloadWithRecord<TPayload extends object>(
  payload: TPayload,
  dirtyFields: Record<string, unknown>,
  fieldMap: PayloadFieldMap<TPayload>,
  currentRecord?: Partial<TPayload> | null,
): Partial<TPayload> {
  const patch = pickChangedPayload(payload, dirtyFields, fieldMap);

  if (!currentRecord) {
    return patch;
  }

  for (const [formField, payloadFields] of Object.entries(fieldMap)) {
    const isDirty = isDirtyField(dirtyFields[formField]);
    const differsFromRecord = payloadFields.some((payloadField) => {
      const value = payload[payloadField];
      if (value === undefined) return false;
      return !valuesMatch(value, currentRecord[payloadField]);
    });

    if (!isDirty && !differsFromRecord) continue;

    for (const payloadField of payloadFields) {
      const value = payload[payloadField];
      if (value !== undefined) {
        patch[payloadField] = value;
      }
    }
  }

  return patch;
}

export function hasChangedPayload(payload: object) {
  return Object.keys(payload).length > 0;
}
