"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Badge, Button } from "@ksu/ui/components";
import type { SectionItem } from "@/lib/api/page-cms";

export type SortableOutlineRecord = {
  id: string;
  display_order: number;
};

type SortableOutlineListProps<T extends SortableOutlineRecord> = {
  items: T[];
  selectedItemId?: string | null;
  onSelect: (id: string) => void;
  onOrderChange: (items: T[]) => void;
  entityName: string;
  getLabel: (item: T) => string;
  getDescription?: (item: T) => string | null | undefined;
};

type SortableOutlineRowProps<T extends SortableOutlineRecord> = {
  item: T;
  index: number;
  isSelected: boolean;
  label: string;
  description?: string | null;
  onSelect: (id: string) => void;
};

function sortByDisplayOrder<T extends SortableOutlineRecord>(items: T[]) {
  return [...items].sort((left, right) => left.display_order - right.display_order);
}

export function normalizeDisplayOrders<T extends SortableOutlineRecord>(items: T[]) {
  return items.map((item, index) => ({ ...item, display_order: (index + 1) * 10 }));
}

function SortableOutlineRow<T extends SortableOutlineRecord>({
  item,
  index,
  isSelected,
  label,
  description,
  onSelect,
}: SortableOutlineRowProps<T>) {
  const { attributes, listeners, setActivatorNodeRef, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex min-h-16 items-center gap-2 rounded-lg border bg-background p-2 ${
        isDragging ? "z-10 border-primary shadow-sm" : isSelected ? "border-primary bg-primary/5" : "border-border"
      }`}
      role="listitem"
    >
      <Button
        ref={setActivatorNodeRef}
        type="button"
        variant="ghost"
        size="icon"
        className="h-11 w-11 shrink-0 cursor-grab touch-none active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${label}`}
      >
        <GripVertical aria-hidden="true" />
      </Button>
      <button
        type="button"
        className="min-w-0 flex-1 rounded-md px-2 py-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={() => onSelect(item.id)}
        aria-current={isSelected ? "true" : undefined}
      >
        <span className="block truncate text-sm font-medium">{label}</span>
        {description ? <span className="mt-0.5 block truncate text-xs text-muted-foreground">{description}</span> : null}
      </button>
      <span className="w-8 shrink-0 text-right text-xs tabular-nums text-muted-foreground" aria-label={`Position ${index + 1}`}>
        {index + 1}
      </span>
    </div>
  );
}

export function SortableOutlineList<T extends SortableOutlineRecord>({
  items,
  selectedItemId,
  onSelect,
  onOrderChange,
  entityName,
  getLabel,
  getDescription,
}: SortableOutlineListProps<T>) {
  const incomingItems = useMemo(() => normalizeDisplayOrders(sortByDisplayOrder(items)), [items]);
  const [serverItems, setServerItems] = useState<T[]>(incomingItems);
  const [orderedItems, setOrderedItems] = useState<T[]>(incomingItems);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setServerItems(incomingItems);
    setOrderedItems(incomingItems);
    setIsDirty(false);
  }, [incomingItems]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const labelForId = useCallback(
    (id: UniqueIdentifier) => {
      const item = orderedItems.find((candidate) => candidate.id === id);
      return item ? getLabel(item) : null;
    },
    [getLabel, orderedItems],
  );

  const announcements = useMemo<Announcements>(
    () => ({
      onDragStart({ active }) {
        return `Picked up ${labelForId(active.id) ?? entityName}.`;
      },
      onDragOver({ active, over }) {
        if (!over) return;
        return `${labelForId(active.id) ?? entityName} is over ${labelForId(over.id) ?? entityName}.`;
      },
      onDragEnd({ active, over }) {
        if (!over) return `${labelForId(active.id) ?? entityName} was returned to its original position.`;
        return `${labelForId(active.id) ?? entityName} was placed in position ${orderedItems.findIndex((item) => item.id === over.id) + 1}.`;
      },
      onDragCancel({ active }) {
        return `Reordering ${labelForId(active.id) ?? entityName} was cancelled.`;
      },
    }),
    [entityName, labelForId, orderedItems],
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    setOrderedItems((current) => {
      const oldIndex = current.findIndex((item) => item.id === active.id);
      const newIndex = current.findIndex((item) => item.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return current;
      return normalizeDisplayOrders(arrayMove(current, oldIndex, newIndex));
    });
    setIsDirty(true);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleSaveOrder = () => {
    const normalizedItems = normalizeDisplayOrders(orderedItems);
    onOrderChange(normalizedItems);
    setServerItems(normalizedItems);
    setOrderedItems(normalizedItems);
    setIsDirty(false);
  };

  const handleCancelOrder = () => {
    setOrderedItems(serverItems);
    setIsDirty(false);
  };

  const activeLabel = activeId ? labelForId(activeId) : null;

  return (
    <div className="space-y-3">
      <div className="flex min-h-11 flex-wrap items-center justify-between gap-2">
        {isDirty ? <Badge variant="warning">Unsaved order</Badge> : <span className="text-sm text-muted-foreground">Order saved</span>}
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleCancelOrder} disabled={!isDirty}>
            Cancel Order
          </Button>
          <Button type="button" onClick={handleSaveOrder} disabled={!isDirty}>
            Save Order
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        accessibility={{
          announcements: announcements,
          screenReaderInstructions: {
            draggable: "To reorder, press Space or Enter to pick up an item. Use the arrow keys to move it, then press Space or Enter to drop it.",
          },
        }}
      >
        <SortableContext items={orderedItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <div className="min-h-16 space-y-2" role="list" aria-label={`${entityName} order`}>
            {orderedItems.map((item, index) => {
              const label = getLabel(item);
              return (
                <SortableOutlineRow
                  key={item.id}
                  item={item}
                  index={index}
                  isSelected={item.id === selectedItemId}
                  label={label}
                  description={getDescription?.(item)}
                  onSelect={onSelect}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
      <p className="sr-only" aria-live="polite">
        {activeLabel ? `Reordering ${activeLabel}.` : ""}
      </p>
    </div>
  );
}

export type SortableItemListProps = {
  items: SectionItem[];
  selectedItemId?: string | null;
  onSelect: (id: string) => void;
  onOrderChange: (items: SectionItem[]) => void;
};

export function SortableItemList({ items, selectedItemId, onSelect, onOrderChange }: SortableItemListProps) {
  return (
    <SortableOutlineList
      items={items}
      selectedItemId={selectedItemId}
      onSelect={onSelect}
      onOrderChange={onOrderChange}
      entityName="section item"
      getLabel={(item) => item.title?.trim() || `${item.item_type.replace(/_/g, " ")} item`}
      getDescription={(item) => item.subtitle?.trim() || "Content item"}
    />
  );
}
