"use client";

import type { ComponentProps } from "react";
import { CompactRecord } from "./library-ui";

type CompactRecordIcon = ComponentProps<typeof CompactRecord>["icon"];

export type LibraryRecordDto = {
  id: string;
  icon: CompactRecordIcon;
  eyebrow: string;
  title: string;
  body: string;
  meta: string[];
  href?: string | null;
  action?: string;
};

export function LibraryRecordsDisplay({ records, marker }: { records: LibraryRecordDto[]; marker: string }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2" data-server-data-display={marker}>
      {records.map((record) => (
        <CompactRecord
          key={record.id}
          icon={record.icon}
          eyebrow={record.eyebrow}
          title={record.title}
          body={record.body}
          meta={record.meta}
          href={record.href}
          action={record.action}
        />
      ))}
    </div>
  );
}
