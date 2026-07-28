"use client";

import { TabSet } from "../../components/library-page-sections";

export function AboutTabs({
  items,
}: {
  items: Array<{ label: string; value: string | null | undefined }>;
}) {
  const tabs = items
    .filter((item) => item.value?.trim())
    .map((item) => ({
      id: item.label.toLowerCase().replace(/\s+/g, "-"),
      label: item.label,
      content: <p>{item.value}</p>,
    }));

  return <TabSet tabs={tabs} />;
}
