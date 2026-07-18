"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApiClientError,
  resolveMainMediaUrl,
  schoolPortalApi,
  schoolPortalQueryKeys,
  usePersons,
  type Person,
  type SchoolPortalMediaSummary,
  type SchoolPortalProfile,
  type SchoolPortalProfileUpdate,
} from "@ksu/api-client";
import { toast } from "@ksu/ui";
import {
  AlertCircle,
  ArrowRight,
  BookOpenText,
  Building2,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  Eye,
  FileText,
  Globe2,
  ImageIcon,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Quote,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Undo2,
  UserRound,
  X,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ImageRenderer,
  Input,
  Label,
  Progress,
  RichTextEditor,
  RichTextRenderer,
  sanitizeRichText,
  Skeleton,
  Switch,
} from "@ksu/ui/components";
import { useSchoolPortal } from "@/components/schools/school-portal-provider";
import {
  SchoolMediaPicker,
  schoolProfileDraftFrom,
  type SchoolProfileDraft,
} from "./school-profile-dialogs";

const PROFILE_FIELDS: Array<keyof SchoolPortalProfileUpdate> = [
  "establishment_date",
  "about",
  "head_message",
  "mission",
  "vision",
  "mandate",
  "core_values",
  "email",
  "phone",
  "office_location",
  "website",
  "is_public",
];

const RICH_TEXT_PROFILE_FIELDS = new Set<keyof SchoolPortalProfileUpdate>([
  "about",
  "head_message",
  "mission",
  "vision",
  "mandate",
  "core_values",
]);

type CompletenessItem = {
  key: string;
  label: string;
  section: string;
  complete: boolean;
};

function personName(person: Person) {
  return (
    person.full_name ||
    [person.title, person.first_name, person.middle_name, person.last_name]
      .filter(Boolean)
      .join(" ")
  );
}

function sameDraft(
  draft: SchoolProfileDraft,
  baseline: SchoolProfileDraft,
  galleryIds: string[],
  baselineGalleryIds: string[],
) {
  return (
    JSON.stringify(draft) === JSON.stringify(baseline) &&
    JSON.stringify(galleryIds) === JSON.stringify(baselineGalleryIds)
  );
}

function profilePayload(draft: SchoolProfileDraft): SchoolPortalProfileUpdate {
  return Object.fromEntries(
    PROFILE_FIELDS.map((key) => {
      const value = draft[key];
      const normalizedValue =
        typeof value === "string" && RICH_TEXT_PROFILE_FIELDS.has(key)
          ? sanitizeRichText(value)
          : value;
      return [
        key,
        typeof normalizedValue === "string" && normalizedValue.trim() === ""
          ? null
          : normalizedValue,
      ];
    }),
  ) as SchoolPortalProfileUpdate;
}

function completenessItems(profile: SchoolPortalProfile): CompletenessItem[] {
  return [
    {
      key: "about",
      label: "About the school",
      section: "about",
      complete: Boolean(profile.about?.trim()),
    },
    {
      key: "message",
      label: "Dean’s message",
      section: "message",
      complete: Boolean(profile.head_message?.trim()),
    },
    {
      key: "purpose",
      label: "Mission, vision & mandate",
      section: "purpose",
      complete: Boolean(
        profile.mission?.trim() &&
        profile.vision?.trim() &&
        profile.mandate?.trim(),
      ),
    },
    {
      key: "contact",
      label: "Contact & location",
      section: "contact",
      complete: Boolean(
        profile.email?.trim() &&
        profile.phone?.trim() &&
        profile.office_location?.trim(),
      ),
    },
    {
      key: "leadership",
      label: "Leadership",
      section: "leadership",
      complete: Boolean(profile.dean_id),
    },
    {
      key: "logo",
      label: "School logo",
      section: "media",
      complete: Boolean(profile.logo_image_id),
    },
    {
      key: "cover",
      label: "Cover image",
      section: "media",
      complete: Boolean(profile.cover_image_id),
    },
    {
      key: "brochure",
      label: "School brochure",
      section: "media",
      complete: Boolean(profile.brochure_id),
    },
    {
      key: "gallery",
      label: "Gallery",
      section: "media",
      complete: profile.gallery.length > 0,
    },
  ];
}

function ProfileSkeleton() {
  return (
    <div className="space-y-5 bg-muted/20 p-4 sm:p-6 lg:p-8">
      <Skeleton className="h-12 w-80" />
      <Skeleton className="h-56 w-full" />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(20rem,0.75fr)]">
        <div className="space-y-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-52" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-64" />
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  id,
  title,
  description,
  icon: Icon,
  complete,
  children,
}: {
  id: string;
  title: string;
  description: string;
  icon: typeof Building2;
  complete?: boolean;
  children: ReactNode;
}) {
  return (
    <Card
      id={id}
      className="scroll-mt-24 overflow-hidden border-border/80 shadow-sm"
    >
      <CardHeader className="border-b bg-muted/20 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
              <CardDescription className="mt-1">{description}</CardDescription>
            </div>
          </div>
          {typeof complete === "boolean" ? (
            <Badge
              variant={complete ? "secondary" : "outline"}
              className="shrink-0"
            >
              {complete ? (
                <Check className="mr-1 size-3" />
              ) : (
                <AlertCircle className="mr-1 size-3" />
              )}
              {complete ? "Complete" : "Needs content"}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="p-5 sm:p-6">{children}</CardContent>
    </Card>
  );
}

function ProfileField({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  helper,
  error,
}: {
  id: string;
  label: string;
  value?: string | null;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  helper?: string;
  error?: string[];
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
      />
      {helper ? (
        <p className="text-xs text-muted-foreground">{helper}</p>
      ) : null}
      {error ? (
        <p className="text-xs text-destructive">{error.join(" ")}</p>
      ) : null}
    </div>
  );
}

function ProfileArea({
  id,
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  rows = 5,
  error,
}: {
  id: string;
  label: string;
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  error?: string[];
}) {
  const [, startTransition] = useTransition();
  return (
    <div className="space-y-2">
      <Label id={`${id}-label`} htmlFor={id}>
        {label}
      </Label>
      <RichTextEditor
        editorId={id}
        ariaLabelledby={`${id}-label`}
        value={value ?? ""}
        toolbar="simple"
        minHeight={`${Math.max(rows, 4) * 1.75}rem`}
        maxHeight="32rem"
        placeholder={placeholder}
        ariaInvalid={Boolean(error)}
        sanitizeOnChange={false}
        onChange={(html) => startTransition(() => onChange(html))}
      />
      {maxLength ? (
        <p className="text-xs text-muted-foreground">
          Recommended maximum: {maxLength.toLocaleString()} characters.
        </p>
      ) : null}
      {error ? (
        <p className="text-xs text-destructive">{error.join(" ")}</p>
      ) : null}
    </div>
  );
}

function ReadText({
  value,
  fallback,
}: {
  value?: string | null;
  fallback: string;
}) {
  return value?.trim() ? (
    <RichTextRenderer
      content={value}
      className="prose-sm text-sm leading-7 text-foreground/90"
    />
  ) : (
    <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
      {fallback}
    </div>
  );
}

function MediaThumb({
  media,
  label,
  icon: Icon = ImageIcon,
}: {
  media?: SchoolPortalMediaSummary | null;
  label: string;
  icon?: typeof ImageIcon;
}) {
  const url = resolveMainMediaUrl(media?.url);
  return (
    <div className="min-w-0">
      <ImageRenderer
        src={url}
        alt={media?.alt_text || label}
        className="h-24 rounded-xl"
        imageClassName="h-full w-full object-cover"
        emptyFallback={
          <div className="flex h-24 items-center justify-center rounded-xl border border-dashed bg-muted/30">
            <Icon className="size-6 text-muted-foreground" />
          </div>
        }
      />
      <p className="mt-2 truncate text-xs font-medium">{label}</p>
      <p className="text-xs text-muted-foreground">
        {media ? "Ready" : "Missing"}
      </p>
      {media?.description ? (
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
          {media.description}
        </p>
      ) : null}
    </div>
  );
}

function DeanSelector({
  value,
  search,
  onSearchChange,
  onChange,
}: {
  value?: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onChange: (person: Person) => void;
}) {
  const peopleQuery = usePersons({
    search: search || undefined,
    status: "active",
    per_page: 12,
  });
  const people = peopleQuery.data?.data ?? [];
  return (
    <div className="space-y-3">
      <Label htmlFor="dean-search">Search and select dean</Label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="dean-search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name or email"
          className="pl-9"
        />
      </div>
      <div className="max-h-60 overflow-y-auto rounded-xl border bg-background">
        {people.length ? (
          people.map((person) => {
            const selected = value === person.id;
            return (
              <button
                key={person.id}
                type="button"
                className={`flex w-full cursor-pointer items-center justify-between gap-3 border-b p-3 text-left text-sm transition-colors last:border-0 ${
                  selected ? "bg-primary/10" : "hover:bg-muted/60"
                }`}
                onClick={() => onChange(person)}
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">
                    {personName(person)}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {person.email}
                  </span>
                </span>
                {selected ? <Badge>Selected</Badge> : null}
              </button>
            );
          })
        ) : (
          <p className="p-4 text-sm text-muted-foreground">
            {peopleQuery.isFetching
              ? "Searching university people…"
              : "No matching active person found."}
          </p>
        )}
      </div>
    </div>
  );
}

export function SchoolProfileWorkspace() {
  const { school, can } = useSchoolPortal();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<SchoolProfileDraft | null>(null);
  const [galleryIds, setGalleryIds] = useState<string[]>([]);
  const [deanSearch, setDeanSearch] = useState("");
  const [selectedDeanName, setSelectedDeanName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const profileQuery = useQuery({
    queryKey: schoolPortalQueryKeys.profile(school.id),
    queryFn: async () => (await schoolPortalApi.profile.get()).data,
  });
  const profile = profileQuery.data;
  const canEdit = can("school.profile.manage");
  const baselineDraft = useMemo(
    () => (profile ? schoolProfileDraftFrom(profile) : null),
    [profile],
  );
  const baselineGalleryIds = useMemo(
    () => profile?.gallery.map((item) => item.id) ?? [],
    [profile],
  );
  const isDirty = Boolean(
    editing &&
    draft &&
    baselineDraft &&
    !sameDraft(draft, baselineDraft, galleryIds, baselineGalleryIds),
  );

  useEffect(() => {
    if (params.get("edit") !== "true" || !canEdit || !profile || editing) return;
    setDraft(schoolProfileDraftFrom(profile));
    setGalleryIds(profile.gallery.map((item) => item.id));
    setDeanSearch(school.dean?.display_name ?? "");
    setSelectedDeanName(school.dean?.display_name ?? "");
    setFieldErrors({});
    setEditing(true);
    const next = new URLSearchParams(params);
    next.delete("edit");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [canEdit, editing, params, pathname, profile, router, school.dean?.display_name]);

  useEffect(() => {
    if (!editing || !isDirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const interceptNavigation = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.href === window.location.href
      )
        return;
      if (
        !window.confirm(
          "You have unsaved profile changes. Leave without saving?",
        )
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", interceptNavigation, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", interceptNavigation, true);
    };
  }, [editing, isDirty]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!profile || !draft) throw new Error("Profile is not ready");
      let result = (await schoolPortalApi.profile.update(profilePayload(draft)))
        .data;

      if (draft.dean_id && draft.dean_id !== profile.dean_id) {
        result = (await schoolPortalApi.profile.setDean(draft.dean_id)).data;
      }

      const singletonSlots = [
        ["logo", "logo_image_id", "logo_image"],
        ["cover", "cover_image_id", "cover_image"],
        ["brochure", "brochure_id", "brochure"],
      ] as const;
      for (const [role, idKey, mediaKey] of singletonSlots) {
        const nextId = draft[idKey];
        const currentMedia = profile[mediaKey];
        if (!nextId && currentMedia?.link_id) {
          result = (
            await schoolPortalApi.profile.unlinkMedia(currentMedia.link_id)
          ).data;
        } else if (nextId && nextId !== profile[idKey]) {
          result = (await schoolPortalApi.profile.linkMedia(nextId, role, 0))
            .data;
        }
      }

      const nextGallery = new Set(galleryIds);
      for (const item of profile.gallery) {
        if (!nextGallery.has(item.id) && item.link_id) {
          result = (await schoolPortalApi.profile.unlinkMedia(item.link_id))
            .data;
        }
      }
      for (const [index, mediaId] of galleryIds.entries()) {
        result = (
          await schoolPortalApi.profile.linkMedia(mediaId, "gallery", index)
        ).data;
      }
      const selectedMediaIds = new Set(
        [
          draft.logo_image_id,
          draft.cover_image_id,
          draft.brochure_id,
          ...galleryIds,
        ].filter((id): id is string => Boolean(id)),
      );
      const baselineDescriptions = baselineDraft?.media_descriptions ?? {};
      const nextDescriptions = draft.media_descriptions ?? {};
      await Promise.all(
        [...selectedMediaIds]
          .filter(
            (mediaId) =>
              (nextDescriptions[mediaId] ?? "") !==
              (baselineDescriptions[mediaId] ?? ""),
          )
          .map((mediaId) =>
            schoolPortalApi.media.update(mediaId, {
              description: nextDescriptions[mediaId]?.trim() || null,
            }),
          ),
      );
      return result;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: schoolPortalQueryKeys.profile(school.id),
        }),
        queryClient.invalidateQueries({
          queryKey: schoolPortalQueryKeys.root(school.id),
        }),
        queryClient.invalidateQueries({
          queryKey: schoolPortalQueryKeys.bootstrap,
        }),
      ]);
      setEditing(false);
      setDraft(null);
      setGalleryIds([]);
      setFieldErrors({});
      toast.success("School profile saved");
    },
    onError: (error) => {
      setFieldErrors(
        error instanceof ApiClientError && error.errors
          ? error.errors
          : {
              form: [
                error instanceof Error
                  ? error.message
                  : "Unable to save the school profile",
              ],
            },
      );
      toast.error("Profile changes could not be saved");
    },
  });

  if (profileQuery.isPending) return <ProfileSkeleton />;
  if (profileQuery.error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Alert variant="destructive">
          <AlertTitle>Profile unavailable</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-3">
            <span>{profileQuery.error.message}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => profileQuery.refetch()}
            >
              <RefreshCw className="mr-2 size-4" /> Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  if (!profile) return null;

  const values = editing && draft ? draft : schoolProfileDraftFrom(profile);
  const currentProfile =
    editing && draft
      ? {
          ...profile,
          ...profilePayload(draft),
          dean_id: draft.dean_id ?? profile.dean_id,
          logo_image_id: draft.logo_image_id ?? null,
          cover_image_id: draft.cover_image_id ?? null,
          brochure_id: draft.brochure_id ?? null,
          is_public: draft.is_public ?? profile.is_public,
          gallery: galleryIds
            .map((id) => profile.gallery.find((item) => item.id === id))
            .filter(Boolean) as SchoolPortalMediaSummary[],
        }
      : profile;
  const completion = completenessItems(currentProfile);
  const completedCount = completion.filter((item) => item.complete).length;
  const completionPercent = Math.round(
    (completedCount / completion.length) * 100,
  );
  const coverUrl = resolveMainMediaUrl(profile.cover_image?.url);
  const logoUrl = resolveMainMediaUrl(profile.logo_image?.url);

  const beginEdit = () => {
    const nextDraft = schoolProfileDraftFrom(profile);
    setDraft(nextDraft);
    setGalleryIds(baselineGalleryIds);
    setDeanSearch(school.dean?.display_name ?? "");
    setSelectedDeanName(school.dean?.display_name ?? "");
    setFieldErrors({});
    setEditing(true);
  };
  const discard = () => {
    if (isDirty && !window.confirm("Discard all unsaved profile changes?"))
      return;
    setEditing(false);
    setDraft(null);
    setGalleryIds([]);
    setFieldErrors({});
  };
  const setField = <Key extends keyof SchoolProfileDraft>(
    key: Key,
    value: SchoolProfileDraft[Key],
  ) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  };

  return (
    <main className="min-h-full bg-muted/20 pb-28">
      <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Link
                href="/schools"
                className="cursor-pointer transition-colors hover:text-primary"
              >
                School Portal
              </Link>
              <ArrowRight className="size-3.5" />
              <span>School Profile</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {profile.name}
              </h1>
              <Badge variant={values.is_public ? "default" : "secondary"}>
                {values.is_public ? "Public" : "Hidden"}
              </Badge>
              <Badge
                variant="outline"
                className="border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
              >
                {completionPercent}% complete
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="cursor-pointer">
              <a
                href={`/schools/${profile.slug}`}
                target="_blank"
                rel="noreferrer"
              >
                <Eye className="mr-2 size-4" /> Preview public page
              </a>
            </Button>
            {canEdit && !editing ? (
              <Button className="cursor-pointer" onClick={beginEdit}>
                <Pencil className="mr-2 size-4" /> Edit profile
              </Button>
            ) : null}
            {editing ? (
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={discard}
              >
                <X className="mr-2 size-4" /> Exit edit mode
              </Button>
            ) : null}
          </div>
        </header>

        <section className="relative min-h-56 overflow-hidden rounded-2xl border bg-primary text-primary-foreground shadow-sm">
          {coverUrl ? (
            <ImageRenderer
              src={coverUrl}
              alt={`${profile.name} cover`}
              className="absolute inset-0 h-full rounded-none border-0"
              imageClassName="h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary-foreground)/0.18),transparent_45%),linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary)/0.78))]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
          <div className="relative flex min-h-56 flex-col justify-end gap-5 p-5 sm:flex-row sm:items-end sm:p-7">
            <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg sm:size-28">
              {logoUrl ? (
                <ImageRenderer
                  src={logoUrl}
                  alt={`${profile.name} logo`}
                  className="h-full w-full rounded-none border-0"
                  imageClassName="h-full w-full object-contain p-2"
                />
              ) : (
                <Building2 className="size-10 text-primary" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-3xl font-bold tracking-tight sm:text-4xl">
                {profile.code}
              </p>
              <p className="mt-1 max-w-3xl text-base text-white/90 sm:text-lg">
                {profile.name}
              </p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/85">
                <span className="flex items-center gap-2">
                  <MapPin className="size-4" />{" "}
                  {values.office_location || "Add office location"}
                </span>
                <span className="flex items-center gap-2">
                  <Phone className="size-4" /> {values.phone || "Add phone"}
                </span>
                <span className="flex items-center gap-2">
                  <Mail className="size-4" /> {values.email || "Add email"}
                </span>
                <span className="flex items-center gap-2">
                  <Globe2 className="size-4" />{" "}
                  {values.website || "Add website"}
                </span>
              </div>
            </div>
            {editing ? (
              <Badge className="border-white/30 bg-white/15 text-white backdrop-blur-sm">
                <Pencil className="mr-1 size-3" /> Editing profile
              </Badge>
            ) : null}
          </div>
        </section>

        {fieldErrors.form ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Profile was not saved</AlertTitle>
            <AlertDescription>{fieldErrors.form.join(" ")}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(20rem,0.75fr)]">
          <div className="space-y-5">
            <SectionCard
              id="about"
              title="About the school"
              description="Introduce the school’s purpose, history, and academic contribution."
              icon={BookOpenText}
              complete={Boolean(values.about)}
            >
              {editing ? (
                <div className="space-y-5">
                  <ProfileArea
                    id="profile-about"
                    label="School overview"
                    value={values.about}
                    onChange={(value) => setField("about", value)}
                    placeholder="Describe the school, its academic focus, and what distinguishes it."
                    maxLength={2000}
                    rows={7}
                    error={fieldErrors.about}
                  />
                  <ProfileField
                    id="profile-establishment-date"
                    label="Establishment date"
                    type="date"
                    value={values.establishment_date}
                    onChange={(value) => setField("establishment_date", value)}
                    helper="Used in the school history and public profile."
                    error={fieldErrors.establishment_date}
                  />
                </div>
              ) : (
                <div className="space-y-5">
                  <ReadText
                    value={values.about}
                    fallback="Add an overview to help students and visitors understand this school."
                  />
                  <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-3 text-sm">
                    <CalendarDays className="size-4 text-primary" />
                    <span className="text-muted-foreground">Established</span>
                    <strong>
                      {values.establishment_date || "Not provided"}
                    </strong>
                  </div>
                </div>
              )}
            </SectionCard>

            <SectionCard
              id="message"
              title="Dean’s message"
              description="Share the school’s direction, priorities, and welcome message."
              icon={Quote}
              complete={Boolean(values.head_message)}
            >
              {editing ? (
                <ProfileArea
                  id="profile-head-message"
                  label="Message from the dean"
                  value={values.head_message}
                  onChange={(value) => setField("head_message", value)}
                  placeholder="Write a welcoming message in the dean’s voice."
                  maxLength={2500}
                  rows={8}
                  error={fieldErrors.head_message}
                />
              ) : (
                <ReadText
                  value={values.head_message}
                  fallback="No dean’s message has been added yet."
                />
              )}
            </SectionCard>

            <SectionCard
              id="purpose"
              title="Mission, vision & mandate"
              description="Define the principles and direction that guide the school."
              icon={Target}
              complete={Boolean(
                values.mission && values.vision && values.mandate,
              )}
            >
              {editing ? (
                <div className="grid gap-5 lg:grid-cols-3">
                  <ProfileArea
                    id="profile-mission"
                    label="Mission"
                    value={values.mission}
                    onChange={(value) => setField("mission", value)}
                    maxLength={1000}
                    rows={7}
                    placeholder="What the school does and for whom."
                    error={fieldErrors.mission}
                  />
                  <ProfileArea
                    id="profile-vision"
                    label="Vision"
                    value={values.vision}
                    onChange={(value) => setField("vision", value)}
                    maxLength={1000}
                    rows={7}
                    placeholder="The future the school is working toward."
                    error={fieldErrors.vision}
                  />
                  <ProfileArea
                    id="profile-mandate"
                    label="Mandate"
                    value={values.mandate}
                    onChange={(value) => setField("mandate", value)}
                    maxLength={1000}
                    rows={7}
                    placeholder="The school’s formal academic mandate."
                    error={fieldErrors.mandate}
                  />
                  <div className="lg:col-span-3">
                    <ProfileArea
                      id="profile-core-values"
                      label="Core values"
                      value={values.core_values}
                      onChange={(value) => setField("core_values", value)}
                      maxLength={1200}
                      rows={4}
                      placeholder="List the values that guide the school’s work."
                      error={fieldErrors.core_values}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-3">
                  {[
                    ["Mission", values.mission],
                    ["Vision", values.vision],
                    ["Mandate", values.mandate],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-xl border bg-muted/20 p-4"
                    >
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">
                        {label}
                      </p>
                      <ReadText
                        value={value as string | null | undefined}
                        fallback={`${label} has not been provided.`}
                      />
                    </div>
                  ))}
                  <div className="rounded-xl border bg-muted/20 p-4 lg:col-span-3">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">
                      Core values
                    </p>
                    <ReadText
                      value={values.core_values}
                      fallback="Core values have not been provided."
                    />
                  </div>
                </div>
              )}
            </SectionCard>

            <SectionCard
              id="contact"
              title="Contact & location"
              description="Keep the public contact details accurate and easy to use."
              icon={MapPin}
              complete={Boolean(
                values.email && values.phone && values.office_location,
              )}
            >
              {editing ? (
                <div className="grid gap-5 sm:grid-cols-2">
                  <ProfileField
                    id="profile-email"
                    label="Public email"
                    type="email"
                    value={values.email}
                    onChange={(value) => setField("email", value)}
                    placeholder="school@kisiiuniversity.ac.ke"
                    error={fieldErrors.email}
                  />
                  <ProfileField
                    id="profile-phone"
                    label="Public phone"
                    value={values.phone}
                    onChange={(value) => setField("phone", value)}
                    placeholder="+254 700 000 000"
                    error={fieldErrors.phone}
                  />
                  <ProfileField
                    id="profile-office"
                    label="Office location"
                    value={values.office_location}
                    onChange={(value) => setField("office_location", value)}
                    placeholder="Building, floor, room, campus"
                    error={fieldErrors.office_location}
                  />
                  <ProfileField
                    id="profile-website"
                    label="Website"
                    type="url"
                    value={values.website}
                    onChange={(value) => setField("website", value)}
                    placeholder="https://www.kisiiuniversity.ac.ke/…"
                    error={fieldErrors.website}
                  />
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { icon: Mail, label: "Email", value: values.email },
                    { icon: Phone, label: "Phone", value: values.phone },
                    {
                      icon: MapPin,
                      label: "Office",
                      value: values.office_location,
                    },
                    { icon: Globe2, label: "Website", value: values.website },
                  ].map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="flex gap-3 rounded-xl border bg-muted/20 p-4"
                    >
                      <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="mt-1 break-words text-sm font-medium">
                          {value || "Not provided"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            {editing && draft ? (
              <SectionCard
                id="media"
                title="Brand & media"
                description="Manage the logo, cover, brochure, and ordered public gallery."
                icon={Camera}
                complete={Boolean(
                  values.logo_image_id && values.cover_image_id,
                )}
              >
                <SchoolMediaPicker
                  profile={profile}
                  draft={draft}
                  onDraftChange={setDraft}
                  galleryIds={galleryIds}
                  onGalleryChange={setGalleryIds}
                  saving={saveMutation.isPending}
                  failed={saveMutation.isError}
                />
              </SectionCard>
            ) : null}
          </div>

          <aside className="space-y-5 xl:sticky xl:top-6">
            <Card className="overflow-hidden border-border/80 shadow-sm">
              <CardHeader className="border-b bg-muted/20">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">
                      Profile completeness
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Strengthen the public school profile.
                    </CardDescription>
                  </div>
                  <div className="flex size-14 items-center justify-center rounded-full border-[5px] border-primary/20 text-sm font-bold text-primary">
                    {completionPercent}%
                  </div>
                </div>
                <Progress value={completionPercent} className="mt-3" />
              </CardHeader>
              <CardContent className="space-y-2 p-5">
                {completion.map((item) => (
                  <a
                    key={item.key}
                    href={`#${item.section}`}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
                  >
                    {item.complete ? (
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                    ) : (
                      <span className="size-4 shrink-0 rounded-full border-2 border-muted-foreground/40" />
                    )}
                    <span
                      className={item.complete ? "" : "text-muted-foreground"}
                    >
                      {item.label}
                    </span>
                  </a>
                ))}
                {!editing && canEdit && completionPercent < 100 ? (
                  <Button
                    variant="ghost"
                    className="mt-2 w-full cursor-pointer justify-between text-primary"
                    onClick={beginEdit}
                  >
                    Complete missing items <ArrowRight className="size-4" />
                  </Button>
                ) : null}
              </CardContent>
            </Card>

            <Card
              id="leadership"
              className="scroll-mt-24 overflow-hidden border-border/80 shadow-sm"
            >
              <CardHeader className="border-b bg-muted/20">
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserRound className="size-4 text-primary" /> Leadership
                </CardTitle>
                <CardDescription>
                  The school’s principal academic leader.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                {editing && draft ? (
                  <DeanSelector
                    value={draft.dean_id}
                    search={deanSearch}
                    onSearchChange={setDeanSearch}
                    onChange={(person) => {
                      setField("dean_id", person.id);
                      setDeanSearch(personName(person));
                      setSelectedDeanName(personName(person));
                    }}
                  />
                ) : (
                  <div className="flex items-center gap-3 rounded-xl border bg-muted/20 p-4">
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <UserRound className="size-6" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {school.dean?.display_name || "No dean assigned"}
                      </p>
                      <p className="text-sm text-muted-foreground">Dean</p>
                    </div>
                  </div>
                )}
                {editing && selectedDeanName ? (
                  <p className="mt-3 rounded-lg bg-primary/5 p-3 text-sm">
                    Selected dean: <strong>{selectedDeanName}</strong>
                  </p>
                ) : null}
              </CardContent>
            </Card>

            {!editing ? (
              <Card
                id="media"
                className="scroll-mt-24 overflow-hidden border-border/80 shadow-sm"
              >
                <CardHeader className="border-b bg-muted/20">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ImageIcon className="size-4 text-primary" /> Brand & media
                  </CardTitle>
                  <CardDescription>
                    Public visual identity and downloads.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 p-5">
                  <MediaThumb media={profile.logo_image} label="Logo" />
                  <MediaThumb media={profile.cover_image} label="Cover" />
                  <MediaThumb
                    media={profile.brochure}
                    label="Brochure"
                    icon={FileText}
                  />
                  <div className="flex h-24 flex-col items-center justify-center rounded-xl border bg-muted/20">
                    <ImageIcon className="size-6 text-primary" />
                    <strong className="mt-1 text-lg">
                      {profile.gallery.length}
                    </strong>
                    <span className="text-xs text-muted-foreground">
                      Gallery images
                    </span>
                  </div>
                  {profile.gallery.length ? (
                    <div className="col-span-2 space-y-2 border-t pt-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Gallery
                      </p>
                      {profile.gallery.map((media, index) => (
                        <div
                          key={media.id}
                          className="flex gap-3 rounded-lg border bg-muted/20 p-2"
                        >
                          <ImageRenderer
                            src={resolveMainMediaUrl(media.url)}
                            alt={
                              media.alt_text || `Gallery image ${index + 1}`
                            }
                            className="h-16 w-20 shrink-0 rounded-md"
                            imageClassName="h-full w-full object-cover"
                          />
                          <div className="min-w-0 py-1">
                            <p className="truncate text-xs font-medium">
                              {media.title ||
                                media.alt_text ||
                                `Gallery image ${index + 1}`}
                            </p>
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                              {media.description || "No description provided."}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {canEdit ? (
                    <Button
                      variant="outline"
                      className="col-span-2 cursor-pointer"
                      onClick={beginEdit}
                    >
                      <Camera className="mr-2 size-4" /> Manage media
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}

            <Card className="overflow-hidden border-border/80 shadow-sm">
              <CardHeader className="border-b bg-muted/20">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="size-4 text-primary" /> Publishing
                  status
                </CardTitle>
                <CardDescription>
                  Control public visibility for this profile.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">Public school profile</p>
                    <p className="text-xs text-muted-foreground">
                      Visitors can discover this school online.
                    </p>
                  </div>
                  {editing ? (
                    <Switch
                      checked={values.is_public ?? false}
                      onCheckedChange={(checked) =>
                        setField("is_public", checked)
                      }
                    />
                  ) : (
                    <Badge variant={values.is_public ? "default" : "secondary"}>
                      {values.is_public ? "Published" : "Hidden"}
                    </Badge>
                  )}
                </div>
                <div className="rounded-lg bg-primary/5 p-3 text-xs leading-5 text-muted-foreground">
                  <Sparkles className="mr-2 inline size-4 text-primary" />
                  Preview the public page before publishing major content or
                  media changes.
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {editing ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-amber-300 bg-background/95 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md lg:left-[var(--sidebar-width,0px)]">
          <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div
                className={`flex size-9 items-center justify-center rounded-full ${isDirty ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}
              >
                {isDirty ? (
                  <AlertCircle className="size-5" />
                ) : (
                  <CheckCircle2 className="size-5" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {isDirty ? "Unsaved changes" : "No unsaved changes"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isDirty
                    ? "Review your changes, then save the complete profile."
                    : "Make an edit to enable saving."}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 cursor-pointer sm:flex-none"
                onClick={discard}
                disabled={saveMutation.isPending}
              >
                <Undo2 className="mr-2 size-4" /> Discard
              </Button>
              <Button
                className="flex-1 cursor-pointer sm:min-w-40 sm:flex-none"
                onClick={() => saveMutation.mutate()}
                disabled={!isDirty || saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Save className="mr-2 size-4" />
                )}
                Save profile
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
