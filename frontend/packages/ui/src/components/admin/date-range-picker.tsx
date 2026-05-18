"use client";

import * as React from "react";
import { format, startOfDay, subDays, startOfMonth, endOfMonth } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { Button, Calendar, Popover, PopoverContent, PopoverTrigger } from "../ui";

export interface DateRangePickerProps {
  value?: { from: Date; to: Date } | null;
  onChange: (range: { from: Date; to: Date } | null) => void;
  presets?: { label: string; from: Date; to: Date }[];
  disabled?: boolean;
}

const defaultPresets = [
  { label: "Today", from: startOfDay(new Date()), to: startOfDay(new Date()) },
  { label: "Last 7 days", from: startOfDay(subDays(new Date(), 6)), to: startOfDay(new Date()) },
  { label: "Last 30 days", from: startOfDay(subDays(new Date(), 29)), to: startOfDay(new Date()) },
  { label: "This month", from: startOfMonth(new Date()), to: endOfMonth(new Date()) },
];

export function DateRangePicker({
  value = null,
  onChange,
  presets = defaultPresets,
  disabled = false,
}: DateRangePickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" disabled={disabled}>
            <CalendarIcon className="h-4 w-4" />
            {value ? `${format(value.from, "MMM d, yyyy")} - ${format(value.to, "MMM d, yyyy")}` : "Select range"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col gap-4 p-4 md:flex-row">
            <div className="space-y-2">
              {presets.map((preset) => (
                <Button key={preset.label} type="button" variant="ghost" className="w-full justify-start" onClick={() => onChange({ from: preset.from, to: preset.to })}>
                  {preset.label}
                </Button>
              ))}
            </div>
            <Calendar
              mode="range"
              selected={value ? { from: value.from, to: value.to } : undefined}
              onSelect={(range) => {
                if (range?.from && range.to) {
                  onChange({ from: range.from, to: range.to });
                }
              }}
              numberOfMonths={2}
            />
          </div>
        </PopoverContent>
      </Popover>
      {value ? (
        <Button type="button" variant="ghost" size="icon-sm" onClick={() => onChange(null)} disabled={disabled}>
          <X className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}
