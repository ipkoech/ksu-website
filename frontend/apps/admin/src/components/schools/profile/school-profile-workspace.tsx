"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  schoolPortalApi,
  schoolPortalQueryKeys,
  type SchoolPortalProfile,
} from "@ksu/api-client";
import {
  Building2,
  Eye,
  FileImage,
  Globe2,
  Mail,
  MapPin,
  Pencil,
  Quote,
  RefreshCw,
  Target,
  UserRound,
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
  Skeleton,
} from "@ksu/ui/components";
import { useSchoolPortal } from "@/components/schools/school-portal-provider";
import {
  SchoolProfileDialog,
  type ProfileDialogSection,
} from "./school-profile-dialogs";

type ProfileCardProps = {
  title: string;
  description: string;
  icon: typeof Building2;
  section: ProfileDialogSection;
  children: React.ReactNode;
  onEdit: (section: ProfileDialogSection) => void;
};

function ProfileCard({
  title,
  description,
  icon: Icon,
  section,
  children,
  onEdit,
}: ProfileCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div className="flex gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary"><Icon className="size-4" /></div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="cursor-pointer"
          aria-label={`Edit ${title}`}
          onClick={() => onEdit(section)}
        >
          <Pencil className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="text-sm">{children}</CardContent>
    </Card>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-5 p-4 sm:p-6 lg:p-8">
      <Skeleton className="h-12 w-80" />
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-52" />)}
      </div>
    </div>
  );
}

export function SchoolProfileWorkspace() {
  const { school, can } = useSchoolPortal();
  const [editing, setEditing] = useState<ProfileDialogSection | null>(null);
  const profileQuery = useQuery({
    queryKey: schoolPortalQueryKeys.profile(school.id),
    queryFn: async () => (await schoolPortalApi.profile.get()).data,
  });
  const profile = profileQuery.data;
  const canEdit = can("school.profile.edit");

  if (profileQuery.isPending) return <ProfileSkeleton />;
  if (profileQuery.error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Alert variant="destructive">
          <AlertTitle>Profile unavailable</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-3">
            <span>{profileQuery.error.message}</span>
            <Button variant="outline" size="sm" onClick={() => profileQuery.refetch()}>
              <RefreshCw className="mr-2 size-4" /> Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  if (!profile) return null;

  const edit = (section: ProfileDialogSection) => {
    if (canEdit) setEditing(section);
  };

  return (
    <main className="space-y-5 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">School Profile</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{profile.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {profile.code} · {profile.school_type}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={profile.is_public ? "default" : "secondary"}>
            {profile.is_public ? "Public" : "Hidden"}
          </Badge>
          <Button asChild variant="outline" size="sm" className="cursor-pointer">
            <a href={`/schools/${profile.slug}`} target="_blank" rel="noreferrer">
              <Eye className="mr-2 size-4" /> Preview
            </a>
          </Button>
        </div>
      </header>

      {!canEdit ? (
        <Alert>
          <AlertTitle>Read-only profile</AlertTitle>
          <AlertDescription>Your role can view this profile but cannot change it.</AlertDescription>
        </Alert>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <ProfileCard title="Overview" description="Identity and establishment" icon={Building2} section="overview" onEdit={edit}>
          <dl className="grid grid-cols-2 gap-3">
            <div><dt className="text-muted-foreground">Established</dt><dd className="font-medium">{profile.establishment_date || "Not set"}</dd></div>
            <div><dt className="text-muted-foreground">Departments</dt><dd className="font-medium">{school.departments.length}</dd></div>
          </dl>
        </ProfileCard>
        <ProfileCard title="Leadership" description="School academic leadership" icon={UserRound} section="leadership" onEdit={edit}>
          <p className="font-medium">{school.dean?.display_name || "No dean assigned"}</p>
          <p className="mt-1 text-muted-foreground">Dean</p>
        </ProfileCard>
        <ProfileCard title="Message & About" description="The school's public story" icon={Quote} section="story" onEdit={edit}>
          <p className="line-clamp-3 whitespace-pre-line">{profile.head_message || "No dean's message yet."}</p>
          <p className="mt-3 line-clamp-3 whitespace-pre-line text-muted-foreground">{profile.about || "No school overview yet."}</p>
        </ProfileCard>
        <ProfileCard title="Mission & Vision" description="Purpose, mandate, and values" icon={Target} section="purpose" onEdit={edit}>
          <p className="line-clamp-2"><strong>Mission:</strong> {profile.mission || "Not set"}</p>
          <p className="mt-2 line-clamp-2"><strong>Vision:</strong> {profile.vision || "Not set"}</p>
          <p className="mt-2 line-clamp-2 text-muted-foreground"><strong>Mandate:</strong> {profile.mandate || "Not set"}</p>
        </ProfileCard>
        <ProfileCard title="Contacts" description="Public contact information" icon={Mail} section="contacts" onEdit={edit}>
          <div className="space-y-2">
            <p>{profile.email || "No email"}</p>
            <p>{profile.phone || "No phone"}</p>
            <p className="flex gap-2 text-muted-foreground"><MapPin className="size-4" /> {profile.office_location || "No office location"}</p>
            <p className="flex gap-2 text-muted-foreground"><Globe2 className="size-4" /> {profile.website || "No website"}</p>
          </div>
        </ProfileCard>
        <ProfileCard title="Media" description="Logo, cover, brochure, and gallery" icon={FileImage} section="media" onEdit={edit}>
          <div className="grid grid-cols-2 gap-3">
            <p>Logo: <strong>{profile.logo_image ? "Ready" : "Missing"}</strong></p>
            <p>Cover: <strong>{profile.cover_image ? "Ready" : "Missing"}</strong></p>
            <p>Brochure: <strong>{profile.brochure ? "Ready" : "Missing"}</strong></p>
            <p>Gallery: <strong>{profile.gallery.length}</strong></p>
          </div>
        </ProfileCard>
        <ProfileCard title="Visibility" description="Public publishing state" icon={Eye} section="visibility" onEdit={edit}>
          <p>{profile.is_public ? "The school profile is visible publicly." : "The school profile is hidden from visitors."}</p>
        </ProfileCard>
        <Card className="h-full border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Preview</CardTitle>
            <CardDescription>Review the public presentation after saving changes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="cursor-pointer">
              <a href={`/schools/${profile.slug}`} target="_blank" rel="noreferrer">
                Open public preview
              </a>
            </Button>
          </CardContent>
        </Card>
      </section>

      {editing ? (
        <SchoolProfileDialog
          section={editing}
          profile={profile as SchoolPortalProfile}
          open
          onOpenChange={(open) => !open && setEditing(null)}
        />
      ) : null}
    </main>
  );
}
