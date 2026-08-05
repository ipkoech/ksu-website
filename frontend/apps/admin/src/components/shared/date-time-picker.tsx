"use client";

import { CalendarIcon, Clock, X } from "lucide-react";
import { Button, Calendar, Input, Popover, PopoverContent, PopoverTrigger } from "@ksu/ui/components";
import { cn } from "@ksu/ui/lib";

type DateTimePickerMode = "date" | "datetime-local";

interface DateTimePickerProps {
  value?: string | null;
  onChange: (value: string) => void;
  mode?: DateTimePickerMode;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  ariaInvalid?: boolean;
  ariaDescribedby?: string;
  className?: string;
}

function parseLocalValue(value?: string | null) {
  if (!value) return null;
  const dateValue = value.length === 10 ? `${value}T00:00` : value.slice(0, 16);
  const parsed = new Date(dateValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateInputValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toTimeInputValue(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toPickerValue(date: Date, mode: DateTimePickerMode) {
  const datePart = toDateInputValue(date);
  if (mode === "date") return datePart;
  return `${datePart}T${toTimeInputValue(date)}`;
}

function formatDisplay(value: string | null | undefined, mode: DateTimePickerMode) {
  const parsed = parseLocalValue(value);
  if (!parsed) return "";
  const date = parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  if (mode === "date") return date;
  return `${date}, ${toTimeInputValue(parsed)}`;
}

export function DateTimePicker({
  value,
  onChange,
  mode = "date",
  placeholder,
  disabled,
  required,
  id,
  ariaInvalid,
  ariaDescribedby,
  className,
}: DateTimePickerProps) {
  const selected = parseLocalValue(value);
  const displayValue = formatDisplay(value, mode);

  const updateDate = (date?: Date) => {
    if (!date) return;
    const next = new Date(date);
    if (selected && mode === "datetime-local") {
      next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    }
    onChange(toPickerValue(next, mode));
  };

  const updateTime = (timeValue: string) => {
    const [hours = "0", minutes = "0"] = timeValue.split(":");
    const next = selected ? new Date(selected) : new Date();
    next.setHours(Number(hours), Number(minutes), 0, 0);
    onChange(toPickerValue(next, mode));
  };

  return (
    <div className={cn("flex gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedby}
            className={cn("min-h-10 flex-1 justify-start gap-2 px-3 text-left font-normal", !displayValue && "text-muted-foreground")}
          >
            <CalendarIcon className="size-4 text-muted-foreground" />
            <span className="truncate">{displayValue || placeholder || (mode === "date" ? "Select date" : "Select date and time")}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <div className="border-b p-3">
            <p className="text-sm font-semibold">{mode === "date" ? "Choose date" : "Choose date and time"}</p>
            <p className="text-xs text-muted-foreground">Use the calendar for accurate scheduling.</p>
          </div>
          <Calendar
            mode="single"
            selected={selected ?? undefined}
            onSelect={updateDate}
            initialFocus
          />
          {mode === "datetime-local" ? (
            <div className="flex items-center gap-2 border-t p-3">
              <Clock className="size-4 text-muted-foreground" />
              <Input
                type="time"
                value={selected ? toTimeInputValue(selected) : ""}
                onChange={(event) => updateTime(event.target.value)}
                disabled={disabled}
                className="w-32"
              />
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-2 border-t p-3">
            <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => onChange(toPickerValue(new Date(), mode))}>
              Today
            </Button>
            {!required ? (
              <Button type="button" variant="ghost" size="sm" disabled={disabled || !value} onClick={() => onChange("")}>
                Clear
              </Button>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
      {!required && value ? (
        <Button type="button" variant="outline" size="icon" disabled={disabled} onClick={() => onChange("")} aria-label="Clear date">
          <X data-icon />
        </Button>
      ) : null}
    </div>
  );
}
