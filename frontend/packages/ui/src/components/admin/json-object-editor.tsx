"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button, Input, Switch } from "../ui";
import { cn } from "../../lib";

export type JsonEditorFieldType = "text" | "number" | "boolean" | "date" | "url" | "select";

export interface JsonEditorOption {
  label: string;
  value: string;
}

export interface JsonEditorField {
  key: string;
  label: string;
  type?: JsonEditorFieldType;
  placeholder?: string;
  options?: JsonEditorOption[];
}

export interface JsonObjectEditorProps {
  value?: unknown;
  onChange: (value: unknown) => void;
  mode?: "object" | "array";
  fields?: JsonEditorField[];
  itemLabel?: string;
  addLabel?: string;
  emptyLabel?: string;
  disabled?: boolean;
  allowCustomFields?: boolean;
  className?: string;
}

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function objectValue(value: unknown) {
  return isObject(value) ? value : {};
}

function arrayValue(value: unknown) {
  return Array.isArray(value) ? value.filter(isObject) : [];
}

function defaultForField(field: JsonEditorField) {
  if (field.type === "boolean") return false;
  if (field.type === "number") return "";
  return "";
}

function defaultItem(fields?: JsonEditorField[]) {
  if (!fields?.length) return { label: "", value: "" };
  return Object.fromEntries(fields.map((field) => [field.key, defaultForField(field)]));
}

function moveItem<T>(items: T[], from: number, to: number) {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function FieldControl({
  field,
  value,
  onChange,
  disabled,
}: {
  field: JsonEditorField;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
}) {
  if (field.type === "boolean") {
    return (
      <div className="flex h-10 items-center justify-between rounded-md border px-3">
        <span className="text-sm text-muted-foreground">{field.placeholder ?? field.label}</span>
        <Switch checked={Boolean(value)} onCheckedChange={onChange} disabled={disabled} />
      </div>
    );
  }

  if (field.type === "select" && field.options?.length) {
    return (
      <select
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      >
        <option value="">Select</option>
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <Input
      type={field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "url" ? "url" : "text"}
      value={value === null || value === undefined || typeof value === "boolean" ? "" : String(value)}
      placeholder={field.placeholder}
      onChange={(event) => {
        const nextValue = event.target.value;
        onChange(field.type === "number" && nextValue !== "" ? Number(nextValue) : nextValue);
      }}
      disabled={disabled}
    />
  );
}

function CustomObjectRows({
  value,
  onChange,
  disabled,
}: {
  value: JsonObject;
  onChange: (value: JsonObject) => void;
  disabled?: boolean;
}) {
  const rows = Object.entries(value).map(([key, rowValue]) => ({ key, value: rowValue === null || rowValue === undefined ? "" : String(rowValue) }));

  const updateRow = (index: number, patch: { key?: string; value?: string }) => {
    const nextRows = rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row));
    onChange(Object.fromEntries(nextRows.filter((row) => row.key.trim()).map((row) => [row.key.trim(), row.value])));
  };

  const removeRow = (index: number) => {
    onChange(Object.fromEntries(rows.filter((_, rowIndex) => rowIndex !== index).filter((row) => row.key.trim()).map((row) => [row.key.trim(), row.value])));
  };

  return (
    <div className="space-y-3">
      {rows.map((row, index) => (
        <div key={`${row.key}-${index}`} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <Input value={row.key} placeholder="Field name" onChange={(event) => updateRow(index, { key: event.target.value })} disabled={disabled} />
          <Input value={row.value} placeholder="Value" onChange={(event) => updateRow(index, { value: event.target.value })} disabled={disabled} />
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeRow(index)} disabled={disabled}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Remove field</span>
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...value, "": "" })} disabled={disabled}>
        <Plus className="h-4 w-4" />
        Add field
      </Button>
    </div>
  );
}

export function JsonObjectEditor({
  value,
  onChange,
  mode = "object",
  fields,
  itemLabel = "Item",
  addLabel,
  emptyLabel = "No items added yet.",
  disabled = false,
  allowCustomFields = false,
  className,
}: JsonObjectEditorProps) {
  if (mode === "array") {
    const items = arrayValue(value);

    return (
      <div className={cn("space-y-3", className)}>
        {items.length ? (
          items.map((item, index) => (
            <div key={index} className="space-y-3 rounded-lg border p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">
                  {itemLabel} {index + 1}
                </p>
                <div className="flex items-center gap-1">
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => onChange(moveItem(items, index, index - 1))} disabled={disabled || index === 0}>
                    <ArrowUp className="h-4 w-4" />
                    <span className="sr-only">Move up</span>
                  </Button>
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => onChange(moveItem(items, index, index + 1))} disabled={disabled || index === items.length - 1}>
                    <ArrowDown className="h-4 w-4" />
                    <span className="sr-only">Move down</span>
                  </Button>
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} disabled={disabled}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove item</span>
                  </Button>
                </div>
              </div>
              {fields?.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {fields.map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
                      <FieldControl
                        field={field}
                        value={item[field.key]}
                        disabled={disabled}
                        onChange={(nextValue) => {
                          const nextItems = [...items];
                          nextItems[index] = { ...item, [field.key]: nextValue };
                          onChange(nextItems);
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <CustomObjectRows
                  value={item}
                  disabled={disabled}
                  onChange={(nextItem) => {
                    const nextItems = [...items];
                    nextItems[index] = nextItem;
                    onChange(nextItems);
                  }}
                />
              )}
            </div>
          ))
        ) : (
          <p className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">{emptyLabel}</p>
        )}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, defaultItem(fields)])} disabled={disabled}>
          <Plus className="h-4 w-4" />
          {addLabel ?? `Add ${itemLabel.toLowerCase()}`}
        </Button>
      </div>
    );
  }

  const item = objectValue(value);

  if (!fields?.length || allowCustomFields) {
    return (
      <div className={cn("space-y-3", className)}>
        <CustomObjectRows value={item} onChange={onChange} disabled={disabled} />
      </div>
    );
  }

  return (
    <div className={cn("grid gap-3 md:grid-cols-2", className)}>
      {fields.map((field) => (
        <div key={field.key} className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
          <FieldControl
            field={field}
            value={item[field.key]}
            disabled={disabled}
            onChange={(nextValue) => onChange({ ...item, [field.key]: nextValue })}
          />
        </div>
      ))}
    </div>
  );
}
