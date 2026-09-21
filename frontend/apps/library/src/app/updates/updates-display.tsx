"use client";

import { RecordListItem } from "../../components/library-ui";

export type LibraryUpdateRecordDto = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  meta: string[];
  href: string;
  action: string;
};

export function LibraryUpdatesDisplay({ records }: { records: LibraryUpdateRecordDto[] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2" data-server-data-display="library-updates-list">
      {records.map((record) => (
        <RecordListItem
          key={record.id}
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
