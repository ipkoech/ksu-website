"use client";

import type { PageSection } from "@/lib/api/page-cms";
import { SortableOutlineList } from "./sortable-item-list";

export type SortableSectionOutlineProps = {
  sections: PageSection[];
  selectedSectionId?: string | null;
  onSelect: (id: string) => void;
  onOrderChange: (sections: PageSection[]) => void;
};

export function SortableSectionOutline({
  sections,
  selectedSectionId,
  onSelect,
  onOrderChange,
}: SortableSectionOutlineProps) {
  return (
    <SortableOutlineList
      items={sections}
      selectedItemId={selectedSectionId}
      onSelect={onSelect}
      onOrderChange={onOrderChange}
      entityName="page section"
      getLabel={(section) => section.title?.trim() || "Untitled section"}
      getDescription={(section) => `${section.page_key.replace(/_/g, " ")} · ${section.layout_variant.replace(/_/g, " ")}`}
    />
  );
}
