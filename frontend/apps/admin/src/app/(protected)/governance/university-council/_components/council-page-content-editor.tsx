"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { toast } from "@ksu/ui";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Textarea } from "@ksu/ui/components";
import { MediaPicker } from "@/components/media";
import { councilGovernanceProfile, type CouncilPageContent, type GovernanceWorkspaceProfile } from "@/lib/api/organization";

const baseDefaults: Partial<CouncilPageContent> = {
  title: "",
  intro: "",
  breadcrumb_label: "",
  hero_image_id: "",
  hero_focal_point: "center center",
  overlay_intensity: 45,
  mandate_label: "Our Mandate",
  mandate_heading: "",
  mandate_body: "",
  document_cta_url: "",
};

function defaultsForProfile(profile: GovernanceWorkspaceProfile): Partial<CouncilPageContent> {
  return {
    ...baseDefaults,
    document_cta_label: profile.defaultDocumentCtaLabel,
  };
}

function contentPayload(values: Partial<CouncilPageContent>): Partial<CouncilPageContent> {
  return {
    ...values,
    hero_image_id: values.hero_image_id || null,
    overlay_intensity: Number(values.overlay_intensity ?? 0),
  };
}

export function CouncilPageContentEditor({ profile = councilGovernanceProfile }: { profile?: GovernanceWorkspaceProfile }) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<Partial<CouncilPageContent>>(() => defaultsForProfile(profile));

  const contentQuery = useQuery({
    queryKey: ["governance", profile.key, "page-content"],
    queryFn: () => profile.api.getPageContent(),
  });

  useEffect(() => {
    if (contentQuery.data?.data) {
      setValues({
        ...defaultsForProfile(profile),
        ...contentQuery.data.data,
        overlay_intensity: contentQuery.data.data.overlay_intensity ?? baseDefaults.overlay_intensity,
      });
    }
  }, [contentQuery.data?.data, profile]);

  const updateMutation = useMutation({
    mutationFn: () =>
      profile.api.updatePageContent(contentPayload(values)),
    onSuccess: async () => {
      toast.success(`${profile.badgeLabel} page content saved`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["governance", profile.key, "page-content"] }),
        queryClient.invalidateQueries({ queryKey: ["governance", profile.key, "preview"] }),
      ]);
    },
    onError: () => toast.error(`Unable to save ${profile.badgeLabel} page content`),
  });

  const setField = <K extends keyof CouncilPageContent>(key: K, value: CouncilPageContent[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <Card>
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Hero And Mandate</CardTitle>
            <CardDescription>
              Manage public {profile.badgeLabel} page content, including hero imagery, mandate copy, and document CTA.
            </CardDescription>
          </div>
          <Button type="button" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
            <Save className="size-4" />
            {updateMutation.isPending ? "Saving..." : "Save Content"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-5">
          {contentQuery.isLoading ? (
            <StateMessage label={`Loading ${profile.badgeLabel} page content...`} />
          ) : null}
          {contentQuery.isError ? (
            <StateMessage label={`${profile.badgeLabel} page content could not be loaded. You can retry after the connection is restored.`} tone="error" />
          ) : null}
          <div className="grid gap-4 lg:grid-cols-2">
            <TextField label="Title" value={values.title} onChange={(value) => setField("title", value)} />
            <TextField label="Breadcrumb label" value={values.breadcrumb_label} onChange={(value) => setField("breadcrumb_label", value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Intro</label>
            <Textarea rows={4} value={values.intro ?? ""} onChange={(event) => setField("intro", event.target.value)} />
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
            <MediaPicker
              value={values.hero_image_id ?? ""}
              onChange={(value) => setField("hero_image_id", value)}
              mediaType="image"
              accept="image/*"
              label="Hero background image"
              helperText={`Select the public image used behind the ${profile.badgeLabel} page hero.`}
            />
            <div className="space-y-4">
              <TextField label="Image focal point" value={values.hero_focal_point} onChange={(value) => setField("hero_focal_point", value)} />
              <label className="space-y-2 text-sm font-medium">
                <span>Overlay intensity</span>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={values.overlay_intensity ?? 0}
                  onChange={(event) => setField("overlay_intensity", Number(event.target.value))}
                />
              </label>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <TextField label="Mandate label" value={values.mandate_label} onChange={(value) => setField("mandate_label", value)} />
            <TextField label="Mandate heading" value={values.mandate_heading} onChange={(value) => setField("mandate_heading", value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Our Mandate</label>
            <Textarea rows={7} value={values.mandate_body ?? ""} onChange={(event) => setField("mandate_body", event.target.value)} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <TextField label="Document CTA label" value={values.document_cta_label} onChange={(value) => setField("document_cta_label", value)} />
            <TextField label="Document CTA URL" value={values.document_cta_url} onChange={(value) => setField("document_cta_url", value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview strip</CardTitle>
          <CardDescription>Quickly inspect the public hero and mandate copy before saving.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <div
              className="min-h-48 bg-primary p-6 text-primary-foreground"
              style={{ backgroundPosition: values.hero_focal_point ?? "center center" }}
            >
              <div
                className="rounded-md p-4"
                style={{ backgroundColor: `rgb(0 0 0 / ${Math.min(Number(values.overlay_intensity ?? 0), 100) / 100})` }}
              >
                <p className="text-xs font-semibold uppercase">{values.breadcrumb_label || profile.badgeLabel}</p>
                <h3 className="mt-3 text-2xl font-semibold">{values.title || profile.badgeLabel}</h3>
                <p className="mt-2 text-sm opacity-90">{values.intro || "Council page introduction will appear here."}</p>
              </div>
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold uppercase text-primary">{values.mandate_label || "Our Mandate"}</p>
              <h4 className="mt-2 font-semibold">{values.mandate_heading || "Mandate heading"}</h4>
              <p className="mt-2 text-sm text-muted-foreground">{values.mandate_body || "Mandate body copy will appear here."}</p>
              <Button type="button" variant="outline" size="sm" className="mt-4">
                {values.document_cta_label || profile.defaultDocumentCtaLabel}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string | null;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2 text-sm font-medium">
      <span>{label}</span>
      <Input value={value ?? ""} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function StateMessage({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "error" }) {
  return (
    <p className={`rounded-md border p-4 text-sm ${tone === "error" ? "border-destructive/30 bg-destructive/5 text-destructive" : "bg-muted/20 text-muted-foreground"}`}>
      {label}
    </p>
  );
}
