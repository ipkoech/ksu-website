"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { MainScopePicker } from "@/components/relationships";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { hasChangedPayload, pickChangedPayload, type PayloadFieldMap } from "@/lib/changed-fields";
import { Button, Card, CardContent, CardHeader, CardTitle, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Switch } from "@ksu/ui/components";
import { toast } from "@ksu/ui";
import { useCreateSliderGroup, useSliderGroup, useUpdateSliderGroup } from "@ksu/api-client";
import type { SliderGroup } from "@ksu/api-client";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  slug: z.string().optional(),
  location: z.string().optional(),
  max_slides: z.coerce.number().int().min(1).optional().or(z.literal("")),
  auto_play_duration: z.coerce.number().int().min(0).optional().or(z.literal("")),
  transition_effect: z.string().optional(),
  scope_type: z.string().max(32).optional(),
  scope_id: z.string().uuid().optional().or(z.literal("")),
  is_main: z.boolean(),
  is_public: z.boolean(),
  is_active: z.boolean(),
  auto_play: z.boolean(),
  show_navigation_dots: z.boolean(),
  show_arrows: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const sliderGroupPayloadFieldMap = {
  name: ["name"],
  slug: ["slug"],
  location: ["location"],
  max_slides: ["max_slides"],
  auto_play_duration: ["auto_play_duration"],
  transition_effect: ["transition_effect"],
  scope_type: ["scope_type"],
  scope_id: ["scope_id"],
  is_main: ["is_main"],
  is_public: ["is_public"],
  is_active: ["is_active"],
  auto_play: ["auto_play"],
  show_navigation_dots: ["show_navigation_dots"],
  show_arrows: ["show_arrows"],
} satisfies PayloadFieldMap<Partial<SliderGroup>>;

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function SliderGroupEditorPage() {
  const router = useRouter();
  const id = useParams().id as string;
  const isNew = id === "new";
  const groupQuery = useSliderGroup(isNew ? "" : id, { enabled: !isNew });
  const createGroup = useCreateSliderGroup();
  const updateGroup = useUpdateSliderGroup();
  const group = groupQuery.data?.data;
  const isPending = createGroup.isPending || updateGroup.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      location: "",
      max_slides: "",
      auto_play_duration: "",
      transition_effect: "fade",
      scope_type: "",
      scope_id: "",
      is_main: false,
      is_public: true,
      is_active: true,
      auto_play: false,
      show_navigation_dots: true,
      show_arrows: true,
    },
    values: group
      ? {
          name: group.name ?? "",
          slug: group.slug ?? "",
          location: group.location ?? "",
          max_slides: group.max_slides ?? "",
          auto_play_duration: group.auto_play_duration ?? "",
          transition_effect: group.transition_effect ?? "fade",
          scope_type: group.scope_type ?? "",
          scope_id: group.scope_id ?? "",
          is_main: group.is_main ?? false,
          is_public: group.is_public ?? true,
          is_active: group.is_active ?? true,
          auto_play: group.auto_play ?? false,
          show_navigation_dots: group.show_navigation_dots ?? true,
          show_arrows: group.show_arrows ?? true,
        }
      : undefined,
  });

  const onSubmit = async (values: FormValues) => {
    const payload: Partial<SliderGroup> = {
      name: values.name,
      slug: values.slug || slugify(values.name),
      location: values.location || null,
      max_slides: values.max_slides === "" ? null : Number(values.max_slides),
      auto_play_duration: values.auto_play_duration === "" ? null : Number(values.auto_play_duration),
      transition_effect: values.transition_effect || null,
      scope_type: values.scope_type || null,
      scope_id: values.scope_id || null,
      is_main: values.is_main,
      is_public: values.is_public,
      is_active: values.is_active,
      auto_play: values.auto_play,
      show_navigation_dots: values.show_navigation_dots,
      show_arrows: values.show_arrows,
    };

    try {
      if (isNew) {
        await createGroup.mutateAsync(payload);
        toast.success("Slider group created successfully");
      } else {
        const patch = pickChangedPayload(payload, form.formState.dirtyFields as Record<string, unknown>, sliderGroupPayloadFieldMap);
        if (!hasChangedPayload(patch)) {
          toast.info("No changes to save");
          return;
        }
        await updateGroup.mutateAsync({ id: group!.id, data: patch });
        toast.success("Slider group updated successfully");
      }
      router.push("/content/sliders");
    } catch {
      toast.error(isNew ? "Failed to create slider group" : "Failed to update slider group");
    }
  };

  if (groupQuery.isLoading) return <LoadingSkeleton rows={8} />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title={isNew ? "Create Slider Group" : "Edit Slider Group"} description={isNew ? "Create a slider group" : `Editing: ${group?.name}`} backHref="/content/sliders" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Group Details</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Name *</FormLabel><FormControl><Input placeholder="Homepage Hero" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="slug" render={({ field }) => (
                <FormItem><FormLabel>Slug</FormLabel><FormControl><Input placeholder="homepage-hero" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="home.hero" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="transition_effect" render={({ field }) => (
                <FormItem><FormLabel>Transition Effect</FormLabel><FormControl><Input placeholder="fade" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="max_slides" render={({ field }) => (
                <FormItem><FormLabel>Max Slides</FormLabel><FormControl><Input type="number" min={1} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="auto_play_duration" render={({ field }) => (
                <FormItem><FormLabel>Autoplay Duration (ms)</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="scope_type" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <MainScopePicker
                    label="Relationship"
                    description="Scope this slider group to a school, department, programme, division, or intake."
                    typeValue={field.value}
                    idValue={form.watch("scope_id")}
                    onChange={(value) => {
                      form.setValue("scope_type", value.type, { shouldDirty: true, shouldValidate: true });
                      form.setValue("scope_id", value.id, { shouldDirty: true, shouldValidate: true });
                    }}
                  />
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Display Controls</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(["is_main", "is_public", "is_active", "auto_play", "show_navigation_dots", "show_arrows"] as const).map((name) => (
                <FormField key={name} control={form.control} name={name} render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <FormLabel className="cursor-pointer">{name.replace(/_/g, " ")}</FormLabel>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
              ))}
            </CardContent>
          </Card>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : isNew ? "Create Group" : "Save Changes"}</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/content/sliders")}>Cancel</Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}
