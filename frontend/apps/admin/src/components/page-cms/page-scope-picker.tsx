"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ksu/ui/components";
import { EntityPicker } from "@/components/relationships/entity-picker";
import {
  libraryBranchRelationshipAdapter,
  researchCenterRelationshipAdapter,
  schoolRelationshipAdapter,
  type RelationshipAdapter,
  type RelationshipFilters,
  type RelationshipOption,
} from "@/components/relationships/relationship-adapters";
import { PAGE_SCOPE_TYPES, type PageScopeType } from "@/lib/api/page-cms";

export type PageScopePickerValue = {
  scopeType: PageScopeType;
  scopeId: string | null;
  scopeLabel: string;
};

export type PageScopePickerProps = {
  value: PageScopePickerValue;
  onChange: (value: PageScopePickerValue) => void;
  allowedScopes?: readonly PageScopeType[];
  disabled?: boolean;
  label?: string;
};

const scopeLabels: Record<PageScopeType, string> = {
  university: "University",
  school: "School",
  research: "Research centre",
  library: "Library branch",
};

function isActiveScopeOption(option: RelationshipOption) {
  const raw = option.raw;
  return !raw
    || typeof raw !== "object"
    || !("is_active" in raw)
    || (raw as { is_active?: boolean }).is_active !== false;
}

function createActiveScopeAdapter<TFilters extends RelationshipFilters>(
  adapter: RelationshipAdapter<TFilters>,
  activeFilters: TFilters,
): RelationshipAdapter {
  return {
    ...adapter,
    key: `page-cms-active-${adapter.key}`,
    requiredFilterMessage: typeof adapter.requiredFilterMessage === "string"
      ? adapter.requiredFilterMessage
      : undefined,
    search: async ({ search, limit }) => (
      await adapter.search({ search, filters: activeFilters, limit })
    ).filter(isActiveScopeOption),
    get: async (id) => {
      const option = await adapter.get(id, activeFilters);
      return option && isActiveScopeOption(option) ? option : null;
    },
  };
}

const scopeAdapters: Partial<Record<PageScopeType, RelationshipAdapter>> = {
  school: createActiveScopeAdapter(schoolRelationshipAdapter, { is_active: true }),
  research: createActiveScopeAdapter(researchCenterRelationshipAdapter, { is_active: true }),
  library: createActiveScopeAdapter(libraryBranchRelationshipAdapter, { active_only: true }),
};

function labelForScope(scopeType: PageScopeType, option?: RelationshipOption | null) {
  return scopeType === "university" ? scopeLabels.university : option?.label ?? "";
}

export function PageScopePicker({
  value,
  onChange,
  allowedScopes = PAGE_SCOPE_TYPES,
  disabled,
  label = "Page scope",
}: PageScopePickerProps) {
  const adapter = scopeAdapters[value.scopeType];

  const handleScopeTypeChange = (nextScopeType: PageScopeType) => {
    onChange({
      scopeType: nextScopeType,
      scopeId: null,
      scopeLabel: labelForScope(nextScopeType),
    });
  };

  const handleScopeRecordChange = (scopeId: string, option?: RelationshipOption | null) => {
    onChange({
      scopeType: value.scopeType,
      scopeId: scopeId || null,
      scopeLabel: labelForScope(value.scopeType, option),
    });
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium" htmlFor="page-scope-type">{label}</label>
      <Select value={value.scopeType} onValueChange={(next) => handleScopeTypeChange(next as PageScopeType)} disabled={disabled}>
        <SelectTrigger id="page-scope-type" aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {allowedScopes.map((scopeType) => (
            <SelectItem key={scopeType} value={scopeType}>{scopeLabels[scopeType]}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {adapter ? (
        <EntityPicker
          adapter={adapter}
          value={value.scopeId}
          onChange={handleScopeRecordChange}
          label={`Select ${scopeLabels[value.scopeType].toLowerCase()}`}
          placeholder={`Choose ${scopeLabels[value.scopeType].toLowerCase()}`}
          disabled={disabled}
          required
        />
      ) : null}
    </div>
  );
}
