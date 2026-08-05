import type {
  PageCmsCatalogSourceType,
  PageCmsSourceType,
  PageScopeType,
  PageSectionLayoutVariant,
} from "@/lib/api/page-cms";

export type SourceSelectionContext = {
  sourceType: PageCmsSourceType;
  layoutVariant: PageSectionLayoutVariant;
  scopeType: PageScopeType;
  scopeId: string | null;
};

export type SourceSelectionWithContext = {
  selectionContext?: SourceSelectionContext;
};

export type SourceSelection = SourceSelectionWithContext & {
  sourceType: PageCmsSourceType;
  sourceId: string;
};

export type SelectableSource = {
  selectable: boolean;
};

export function isCatalogSearchableSourceType(
  sourceType: PageCmsSourceType,
  catalogSourceTypes: readonly PageCmsCatalogSourceType[],
): sourceType is PageCmsCatalogSourceType {
  return (catalogSourceTypes as readonly PageCmsSourceType[]).includes(sourceType);
}

export function selectionMatchesContext(
  value: SourceSelectionWithContext,
  context: SourceSelectionContext,
) {
  const selectionContext = value.selectionContext;
  return Boolean(
    selectionContext
      && selectionContext.sourceType === context.sourceType
      && selectionContext.layoutVariant === context.layoutVariant
      && selectionContext.scopeType === context.scopeType
      && selectionContext.scopeId === context.scopeId,
  );
}

export function selectionInvalidationKey(
  value: SourceSelection,
  context: SourceSelectionContext,
) {
  if (selectionMatchesContext(value, context)) return null;

  return JSON.stringify([
    value.sourceType,
    value.sourceId,
    value.selectionContext ?? null,
    context,
  ]);
}

export function shouldNotifySelectionInvalidation(
  value: SourceSelection,
  context: SourceSelectionContext,
  previousInvalidationKey: string | null,
) {
  const invalidationKey = selectionInvalidationKey(value, context);
  return invalidationKey !== null && invalidationKey !== previousInvalidationKey;
}

export function nextSelectableIndex(
  sources: readonly SelectableSource[],
  currentIndex: number,
  direction: 1 | -1,
) {
  const selectableIndexes = sources
    .map((source, index) => (source.selectable ? index : -1))
    .filter((index) => index >= 0);

  if (selectableIndexes.length === 0) return -1;

  if (direction === 1) {
    return selectableIndexes.find((index) => index > currentIndex)
      ?? selectableIndexes[selectableIndexes.length - 1];
  }

  return [...selectableIndexes].reverse().find((index) => index < currentIndex)
    ?? selectableIndexes[0];
}
