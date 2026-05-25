"use client";

import * as React from "react";
import { useAuth, usePermissions } from "@ksu/auth";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, PageHeader, Switch, Tabs, TabsContent, TabsList, TabsTrigger } from "@ksu/ui/components";
import { useSettings, useUpdateSettings } from "@ksu/api-client/hooks/admin";
import { canManageSettings } from "../_lib/access";

type SettingFormState = Record<string, string>;

function normalizeCategoryLabel(category: string) {
  return category.replace(/[_-]+/g, " ");
}

function coerceSettingValue(rawValue: string, valueType: string) {
  const normalizedType = valueType.toLowerCase();
  if (["bool", "boolean"].includes(normalizedType)) return rawValue === "true";
  if (["int", "integer", "number"].includes(normalizedType)) {
    const parsed = Number.parseInt(rawValue, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  if (["float", "decimal"].includes(normalizedType)) {
    const parsed = Number.parseFloat(rawValue);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  if (normalizedType === "json") {
    try {
      return JSON.parse(rawValue);
    } catch {
      return rawValue;
    }
  }
  return rawValue;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { hasScope } = usePermissions();
  const settings = useSettings();
  const updateSettings = useUpdateSettings();
  const [formState, setFormState] = React.useState<SettingFormState>({});
  const [activeCategory, setActiveCategory] = React.useState("site");
  const canManage = canManageSettings(user, hasScope);

  React.useEffect(() => {
    if (!settings.data) return;
    setFormState(
      settings.data.reduce<SettingFormState>((acc, setting) => {
        acc[setting.key] = String(setting.value ?? "");
        return acc;
      }, {})
    );
  }, [settings.data]);

  const categories = React.useMemo(() => {
    const values = Array.from(new Set((settings.data ?? []).map((setting) => setting.category))).filter(Boolean).sort();
    return values.length > 0 ? values : ["site"];
  }, [settings.data]);

  React.useEffect(() => {
    if (!categories.includes(activeCategory)) {
      setActiveCategory(categories[0] ?? "site");
    }
  }, [activeCategory, categories]);

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Update operational settings grouped by category. Changes should be captured by audit logging."
        breadcrumbs={[{ label: "System", href: "/system" }, { label: "Settings" }]}
      />
      <div className="p-6">
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {normalizeCategoryLabel(category)}
              </TabsTrigger>
            ))}
          </TabsList>
          {categories.map((category) => {
            const categorySettings = (settings.data ?? []).filter((setting) => setting.category === category);
            return (
              <TabsContent key={category} value={category}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="capitalize">{normalizeCategoryLabel(category)}</CardTitle>
                    <Button
                      disabled={!canManage}
                      onClick={() => {
                        const changedSettings = categorySettings
                          .filter((setting) => formState[setting.key] !== String(setting.value ?? ""))
                          .map((setting) => ({
                            key: setting.key,
                            value: coerceSettingValue(formState[setting.key] ?? "", setting.value_type),
                          }));
                        if (changedSettings.length === 0) return;
                        void updateSettings.mutateAsync({ settings: changedSettings });
                      }}
                      loading={updateSettings.isPending}
                    >
                      Save {category}
                    </Button>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    {categorySettings.map((setting) => {
                      const rawValue = String(setting.value ?? "");
                      const isBoolean = ["bool", "boolean"].includes(setting.value_type.toLowerCase()) || ["maintenance_mode", "require_2fa"].includes(setting.key) || ["true", "false"].includes(rawValue);
                      return (
                        <div key={setting.key} className="space-y-2 rounded-lg border p-4">
                          <Label>{setting.description || setting.key}</Label>
                          {isBoolean ? (
                            <label className="flex items-center gap-3">
                              <Switch
                                checked={formState[setting.key] === "true"}
                                disabled={!canManage}
                                onCheckedChange={(checked) => setFormState((current) => ({ ...current, [setting.key]: String(checked) }))}
                              />
                              <span className="text-sm text-muted-foreground">{setting.key}</span>
                            </label>
                          ) : (
                              <Input
                              disabled={!canManage}
                              value={formState[setting.key] ?? ""}
                              onChange={(event) => setFormState((current) => ({ ...current, [setting.key]: event.target.value }))}
                            />
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}
