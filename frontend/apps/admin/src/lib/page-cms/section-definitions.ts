import type {
  PageCmsSectionDefinition,
  PageCmsSourceType,
  PageScopeType,
  SectionItemType,
} from "@/lib/api/page-cms";

export type SectionDefinitionIndex = ReadonlyMap<string, PageCmsSectionDefinition>;

export function indexSectionDefinitions(definitions: PageCmsSectionDefinition[]): SectionDefinitionIndex {
  return new Map(definitions.map((definition) => [definition.key, definition]));
}

export function supportsPageScope(definition: PageCmsSectionDefinition, scopeType: PageScopeType) {
  return definition.allowed_scopes.includes(scopeType);
}

export function supportsSourceType(definition: PageCmsSectionDefinition, sourceType: PageCmsSourceType) {
  return definition.allowed_source_types.includes(sourceType);
}

export function supportsItemType(definition: PageCmsSectionDefinition, itemType: SectionItemType) {
  return definition.allowed_item_types.includes(itemType);
}
