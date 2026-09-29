"use client";
import { useState, type ReactNode } from "react";
import { Button } from "./button";
import { Input } from "./input";

export interface WorkspaceFieldSpec {
  key: string; label: string; kind: string; required: boolean; nullable: boolean;
  max_length: number | null; enum_values?: Array<string | number | boolean>;
  json_shape?: "array" | "object" | null; item_kind?: string | null; help?: string;
}
/** Shared field rendering; service adapters own payload and permission validation. */
export function WorkspaceField({ field, value, onChange, errors, disabled, trailing, idPrefix = "rw" }:
  { field: WorkspaceFieldSpec; value: string | boolean; onChange: (value: string | boolean) => void;
    errors?: string[]; disabled?: boolean; trailing?: ReactNode; idPrefix?: string }) {
  const id = `${idPrefix}-${field.key}`, [formatError, setFormatError] = useState("");
  const help = field.help || (field.kind === "uuid" ? "Choose an existing authorized record or enter its UUID." :
    field.kind === "date-time" ? "UTC date and time; the saved value includes an explicit Z timezone." :
    field.kind === "decimal" ? "Exact decimal amount, without separators or exponent notation." :
    field.kind === "json" ? `Native ${field.json_shape ?? "structured"} JSON. Nested values are validated by the service.` :
    field.key === "slug" ? "Lowercase letters, numbers and hyphens. Leave blank on creation to derive from the record name." : "");
  const describedBy = [`${id}-help`, errors?.length ? `${id}-error` : ""].filter(Boolean).join(" ");
  const common = { id, name: field.key, disabled, required: field.required, "aria-invalid": Boolean(errors?.length), "aria-describedby": describedBy };
  const type = field.kind === "date" ? "date" : field.kind === "date-time" ? "datetime-local" : field.kind === "email" ? "email" : field.kind === "uri" ? "url" : "text";
  let items: string[] | null = null;
  if (field.kind === "json" && field.json_shape === "array" && ["uuid", "string"].includes(field.item_kind ?? "")) {
    try { const parsed: unknown = value ? JSON.parse(String(value)) : []; if (Array.isArray(parsed) && parsed.every(item => typeof item === "string")) items = parsed; } catch { /* Show the JSON editor without discarding invalid input. */ }
  }
  const change = (next: string | boolean) => { setFormatError(""); onChange(next); };
  return <div className={field.kind === "text" || field.kind === "json" ? "rw-field rw-field-wide" : "rw-field"}>
    <label htmlFor={id}>{field.label}{field.required && <span className="rw-required">Required</span>}</label>
    {field.enum_values?.length ? <select {...common} value={String(value)} onChange={event => change(field.kind === "boolean" ? event.target.value === "" ? "" : event.target.value === "true" : event.target.value)}>
      <option value="">Choose a value</option>{field.enum_values.map(option => <option key={String(option)} value={String(option)}>{String(option).replace(/_/g, " ")}</option>)}</select> :
    field.kind === "boolean" ? <select {...common} value={value === "" ? "" : String(value)} onChange={event => change(event.target.value === "" ? "" : event.target.value === "true")}>
      {field.nullable && <option value="">Not recorded</option>}<option value="false">No</option><option value="true">Yes</option></select> :
    items !== null ? <div id={id} tabIndex={-1} role="group" aria-label={field.label} aria-describedby={describedBy} className="rw-array-editor">
      {items.map((item, index) => <div key={index} className="rw-array-row"><Input value={item} disabled={disabled} aria-label={`${field.label}, item ${index + 1}`}
        onChange={event => change(JSON.stringify(items!.map((value, position) => position === index ? event.target.value : value)))} />
        <Button type="button" variant="outline" disabled={disabled} aria-label={`Remove ${field.label}, item ${index + 1}`} onClick={() => change(JSON.stringify(items!.filter((_, position) => position !== index)))}>Remove</Button></div>)}
      {!items.length && <p className="rw-help">No items entered.</p>}
      <Button type="button" variant="outline" disabled={disabled} onClick={() => change(JSON.stringify([...items!, ""]))}>Add item</Button>
    </div> : field.kind === "text" || field.kind === "json" ? <>
      <textarea {...common} rows={field.kind === "json" ? 7 : 5} className={field.kind === "json" ? "rw-json-editor" : undefined} value={String(value)}
        maxLength={field.max_length ?? undefined} onChange={event => change(event.target.value)} />
      {field.kind === "json" && <Button type="button" variant="outline" disabled={disabled || !value} onClick={() => {
        try { change(JSON.stringify(JSON.parse(String(value)), null, 2)); } catch { setFormatError("Correct the JSON syntax before formatting."); }
      }}>Format JSON</Button>}
    </> : <Input {...common} type={type} value={String(value)} onChange={event => change(event.target.value)} maxLength={field.max_length ?? undefined}
      inputMode={["number", "integer", "decimal"].includes(field.kind) ? "decimal" : undefined} />}
    {trailing}<p id={`${id}-help`} className="rw-help">{help}</p>
    {errors?.length ? <p role="alert" className="rw-field-error" id={`${id}-error`}>{errors.join(" ")}</p> : null}
    {formatError && <p role="alert" className="rw-field-error">{formatError}</p>}
  </div>;
}
