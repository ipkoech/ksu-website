"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ksu/ui/components";
import { pageCmsApi, type PageCmsSectionDefinition, type PageScopeType } from "@/lib/api/page-cms";
import { supportsPageScope } from "@/lib/page-cms/section-definitions";

export type SectionTemplatePickerProps = {
  scopeType: PageScopeType;
  onSelect: (definition: PageCmsSectionDefinition) => void;
  definitions?: PageCmsSectionDefinition[];
  allowedScopes?: readonly PageScopeType[];
  disabled?: boolean;
};

export function SectionTemplatePicker({
  scopeType,
  onSelect,
  definitions: providedDefinitions,
  allowedScopes,
  disabled,
}: SectionTemplatePickerProps) {
  const [loadedDefinitions, setLoadedDefinitions] = useState<PageCmsSectionDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(!providedDefinitions);
  const [error, setError] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string>("");

  useEffect(() => {
    if (providedDefinitions) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const loadDefinitions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await pageCmsApi.definitions();
        if (!cancelled) setLoadedDefinitions(response.data ?? []);
      } catch {
        if (!cancelled) setError("Section templates could not be loaded.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    void loadDefinitions();
    return () => { cancelled = true; };
  }, [providedDefinitions]);

  const definitions = providedDefinitions ?? loadedDefinitions;
  const availableDefinitions = useMemo(
    () => definitions.filter((definition) => supportsPageScope(definition, scopeType))
      .filter(() => !allowedScopes || allowedScopes.includes(scopeType)),
    [allowedScopes, definitions, scopeType],
  );
  const selectedDefinition = availableDefinitions.find((definition) => definition.key === selectedKey);

  useEffect(() => {
    if (selectedDefinition) return;
    setSelectedKey(availableDefinitions[0]?.key ?? "");
  }, [availableDefinitions, selectedDefinition]);

  return (
    <section aria-label="Section template" className="space-y-3 border-b border-border pb-4">
      <div>
        <h2 className="text-sm font-semibold">Create section</h2>
        <p className="mt-1 text-sm text-muted-foreground">Choose a template available for this page scope.</p>
      </div>
      {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-56 flex-1">
          <Select value={selectedKey} onValueChange={setSelectedKey} disabled={disabled || isLoading || !availableDefinitions.length}>
            <SelectTrigger aria-label="Section template">
              <SelectValue placeholder={isLoading ? "Loading templates..." : "Choose a template"} />
            </SelectTrigger>
            <SelectContent>
              {availableDefinitions.map((definition) => (
                <SelectItem key={definition.key} value={definition.key}>{definition.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="button" onClick={() => selectedDefinition && onSelect(selectedDefinition)} disabled={disabled || !selectedDefinition}>
          Create section
        </Button>
      </div>
      {!isLoading && !error && !availableDefinitions.length ? (
        <p className="text-sm text-muted-foreground">No section templates are available for this scope.</p>
      ) : null}
      {selectedDefinition ? <p className="text-xs text-muted-foreground">{selectedDefinition.description}</p> : null}
    </section>
  );
}
