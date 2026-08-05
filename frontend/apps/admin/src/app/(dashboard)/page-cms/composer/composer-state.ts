import type { PageCmsSectionDefinition, PageScopeType, PageSectionPayload } from "@/lib/api/page-cms";

export type ComposerLocation = {
  scopeType: PageScopeType;
  scopeId: string | null;
  sectionId: string | null;
};

export type ScopeSelection = Pick<ComposerLocation, "scopeType" | "scopeId">;
export type ValidationDisplayState = "unvalidated" | "loading" | "validated" | "error";

type NavigationIntent = {
  dirty: boolean;
  href: string;
  currentOrigin: string;
  button: number;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  target?: string | null;
  download?: boolean;
};

type ScopedDefinition = Pick<PageCmsSectionDefinition, "key" | "allowed_scopes" | "label" | "settings_schema">;

type CreateSectionContext = {
  pageKey: string;
  scopeType: PageScopeType;
  scopeId: string | null;
  nextDisplayOrder: number;
  existingSectionKeys?: readonly string[];
};

function defaultSettings(schema: Record<string, unknown> | undefined) {
  return Object.fromEntries(
    Object.entries(schema ?? {}).flatMap(([key, value]) => (
      value && typeof value === "object" && "default" in value
        ? [[key, (value as { default: unknown }).default]]
        : []
    )),
  );
}

function nextSectionKey(definitionKey: string, existingSectionKeys: readonly string[]) {
  const base = definitionKey.replace(/_/g, "-");
  if (!existingSectionKeys.includes(base)) return base;

  let suffix = 2;
  while (existingSectionKeys.includes(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

export function composerHref(pageKey: string, location: ComposerLocation) {
  const query = new URLSearchParams({ scope_type: location.scopeType });
  if (location.scopeId) query.set("scope_id", location.scopeId);
  if (location.sectionId) query.set("section", location.sectionId);
  return `/page-cms/composer/${encodeURIComponent(pageKey)}?${query.toString()}`;
}

export function isScopeComplete(scope: ScopeSelection) {
  return scope.scopeType === "university" || Boolean(scope.scopeId);
}

export function createRequestSequence() {
  let sequence = 0;
  let activeController: AbortController | null = null;

  return {
    begin() {
      activeController?.abort();
      activeController = new AbortController();
      const id = ++sequence;
      return { id, signal: activeController.signal };
    },
    isCurrent(id: number) {
      return id === sequence;
    },
    cancel() {
      activeController?.abort();
      activeController = null;
      sequence += 1;
    },
  };
}

export function validationDisplayState({
  validation,
  isLoading,
  error,
}: {
  validation: { issues: unknown[] } | null;
  isLoading: boolean;
  error: string | null;
}): ValidationDisplayState {
  if (isLoading) return "loading";
  if (error) return "error";
  return validation ? "validated" : "unvalidated";
}

export function composerCapabilities(hasAnyPermission: (permissions: string[]) => boolean) {
  const managePermissions = [
    "page_sections.manage",
    "homepage.manage",
    "school_homepage.manage",
    "research_homepage.manage",
    "library_homepage.manage",
  ];

  return {
    canCreate: hasAnyPermission(["page_sections.create", ...managePermissions]),
    canUpdate: hasAnyPermission(["page_sections.update", ...managePermissions]),
  };
}

export function shouldConfirmComposerNavigation(intent: NavigationIntent) {
  if (!intent.dirty || intent.button !== 0 || intent.altKey || intent.ctrlKey || intent.metaKey || intent.shiftKey) return false;
  if (intent.target && intent.target !== "_self") return false;
  if (intent.download) return false;

  const target = new URL(intent.href, intent.currentOrigin);
  return target.origin === intent.currentOrigin;
}

export function filterDefinitionsForScope<T extends ScopedDefinition>(definitions: readonly T[], scopeType: PageScopeType) {
  return definitions.filter((definition) => definition.allowed_scopes.includes(scopeType));
}

export function createSectionPayloadFromDefinition(definition: ScopedDefinition, context: CreateSectionContext): PageSectionPayload {
  return {
    page_key: context.pageKey,
    scope_type: context.scopeType,
    scope_id: context.scopeId,
    section_key: nextSectionKey(definition.key, context.existingSectionKeys ?? []),
    title: definition.label ?? definition.key.replace(/_/g, " "),
    layout_variant: definition.key,
    settings: defaultSettings(definition.settings_schema),
    display_order: context.nextDisplayOrder,
    is_enabled: true,
  };
}

export function isReloadRequiredConflict(error: unknown) {
  return Boolean(
    error
    && typeof error === "object"
    && "response" in error
    && (error as { response?: { status?: unknown } }).response?.status === 409,
  );
}
