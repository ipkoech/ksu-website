"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  corporateCommSettingsApi,
  corporateCommSettingsQueryKeys,
  type CorporateCommTeamMember,
  type CorporateOfficeChannels,
  type CorporateSocialLinks,
} from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";
import { toast } from "@ksu/ui";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Skeleton,
} from "@ksu/ui/components";
import { cn } from "@ksu/ui/lib/utils";
import {
  AlertCircle,
  ArrowUpRight,
  BadgeInfo,
  Building2,
  Clock3,
  Globe2,
  Link2,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Settings2,
  ShieldAlert,
  UserRound,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  PortalEmptyState,
  PortalWorkspace,
  PortalWorkspaceHeader,
} from "@/components/portals/portal-workspace";
import { SocialAccountsPanel } from "@/components/corporate/social-accounts-panel";

const EMPTY_OFFICE: CorporateOfficeChannels = {
  email: null,
  phone: null,
  physical_office: null,
  service_hours: null,
  escalation_contact: null,
};

const EMPTY_SOCIAL: CorporateSocialLinks = {
  facebook: null,
  twitter: null,
  instagram: null,
  linkedin: null,
  youtube: null,
};

const OFFICE_FIELDS: {
  name: keyof CorporateOfficeChannels;
  label: string;
  icon: LucideIcon;
  type?: string;
  placeholder: string;
}[] = [
  {
    name: "email",
    label: "Office email",
    icon: Mail,
    type: "email",
    placeholder: "corporatecomms@kisiiuniversity.ac.ke",
  },
  {
    name: "phone",
    label: "Office phone",
    icon: Phone,
    type: "tel",
    placeholder: "+254 7XX XXX XXX",
  },
  {
    name: "physical_office",
    label: "Physical office",
    icon: Building2,
    placeholder: "Administration Block, 2nd Floor",
  },
  {
    name: "service_hours",
    label: "Service hours",
    icon: Clock3,
    placeholder: "Mon–Fri, 8:00 am – 5:00 pm",
  },
  {
    name: "escalation_contact",
    label: "Escalation contact",
    icon: ShieldAlert,
    placeholder: "Director, Corporate Communication — +254 7XX XXX XXX",
  },
];

const SOCIAL_FIELDS: {
  name: keyof CorporateSocialLinks;
  label: string;
  placeholder: string;
}[] = [
  { name: "facebook", label: "Facebook page", placeholder: "https://facebook.com/kisiiuniversity" },
  { name: "twitter", label: "X (Twitter) profile", placeholder: "https://x.com/kisiiuniversity" },
  { name: "instagram", label: "Instagram profile", placeholder: "https://instagram.com/kisiiuniversity" },
  { name: "linkedin", label: "LinkedIn page", placeholder: "https://linkedin.com/school/kisiiuniversity" },
  { name: "youtube", label: "YouTube channel", placeholder: "https://youtube.com/@kisiiuniversity" },
];

function SectionCard({
  icon: Icon,
  title,
  description,
  badge,
  children,
  contentClassName,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  contentClassName?: string;
}) {
  return (
    <Card className="overflow-hidden shadow-sm">
      <CardContent className="p-0">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b bg-muted/30 px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
              <Icon className="size-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
          {badge}
        </div>
        <div className={cn("p-5", contentClassName)}>{children}</div>
      </CardContent>
    </Card>
  );
}

function ReadOnlyHint() {
  return (
    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <ShieldAlert className="size-3.5" aria-hidden />
      You can view these settings, but saving requires a content or homepage
      manager role.
    </p>
  );
}

export function CorporateSettingsWorkspace() {
  const queryClient = useQueryClient();
  const { hasScope } = usePermissions();

  const settingsQuery = useQuery({
    queryKey: corporateCommSettingsQueryKeys.settings,
    queryFn: async () => (await corporateCommSettingsApi.getSettings()).data,
    staleTime: 30_000,
  });
  const settings = settingsQuery.data;
  const canManage = settings?.can_manage ?? false;

  const [office, setOffice] = React.useState<CorporateOfficeChannels>(EMPTY_OFFICE);
  const [social, setSocial] = React.useState<CorporateSocialLinks>(EMPTY_SOCIAL);
  const [officeDirty, setOfficeDirty] = React.useState(false);
  const [socialDirty, setSocialDirty] = React.useState(false);

  React.useEffect(() => {
    if (settings) {
      setOffice({ ...EMPTY_OFFICE, ...(settings.office_channels ?? {}) });
      setSocial({ ...EMPTY_SOCIAL, ...(settings.social_links ?? {}) });
      setOfficeDirty(false);
      setSocialDirty(false);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: (payload: Parameters<typeof corporateCommSettingsApi.updateSettings>[0]) =>
      corporateCommSettingsApi.updateSettings(payload),
    onSuccess: (response) => {
      queryClient.setQueryData(
        corporateCommSettingsQueryKeys.settings,
        response.data,
      );
      toast.success("Settings saved");
    },
    onError: (error: unknown) => {
      toast.error("Could not save settings", {
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  const normalize = <T extends object>(values: T): T =>
    Object.fromEntries(
      Object.entries(values).map(([key, value]) => [
        key,
        typeof value === "string" && value.trim() === "" ? null : value,
      ]),
    ) as T;

  const teamQuery = useQuery({
    queryKey: corporateCommSettingsQueryKeys.team,
    queryFn: async () =>
      (await corporateCommSettingsApi.listTeam()).data.members,
    staleTime: 60_000,
  });

  if (settingsQuery.isLoading) {
    return (
      <PortalWorkspace>
        <PortalWorkspaceHeader
          eyebrow="Corporate Communication"
          title="Portal Settings"
          description="Office channels, public social links, platform credentials, and the portal team."
          icon={Settings2}
        />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-48 rounded-xl" />
          ))}
        </div>
      </PortalWorkspace>
    );
  }

  if (settingsQuery.isError) {
    return (
      <PortalWorkspace>
        <PortalWorkspaceHeader
          eyebrow="Corporate Communication"
          title="Portal Settings"
          description="Office channels, public social links, platform credentials, and the portal team."
          icon={Settings2}
        />
        <PortalEmptyState
          icon={AlertCircle}
          title="Settings are unavailable"
          description="The settings service did not respond. Retry, or contact system administrators if the problem persists."
          action={
            <Button
              variant="outline"
              onClick={() => void settingsQuery.refetch()}
            >
              <RefreshCw data-icon="inline-start" /> Retry
            </Button>
          }
        />
      </PortalWorkspace>
    );
  }

  return (
    <PortalWorkspace>
      <PortalWorkspaceHeader
        eyebrow="Corporate Communication"
        title="Portal Settings"
        description="How the public reaches the communication office, the university's official social presence, connected posting credentials, and who runs this portal."
        icon={Settings2}
        meta={!canManage ? <ReadOnlyHint /> : null}
      />

      <SectionCard
        icon={Phone}
        title="Office communication channels"
        description="Contact details for the Corporate Communication office itself — shown to teams and used for escalation."
      >
        <form
          aria-label="Office communication channels"
          onSubmit={(event) => {
            event.preventDefault();
            saveMutation.mutate(
              { office_channels: normalize(office) },
              { onSuccess: () => setOfficeDirty(false) },
            );
          }}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {OFFICE_FIELDS.map(({ name, label, icon: Icon, type, placeholder }) => (
              <div key={name} className="space-y-1.5">
                <Label
                  htmlFor={`office-${name}`}
                  className="flex items-center gap-1.5 text-xs font-medium"
                >
                  <Icon className="size-3.5 text-muted-foreground" aria-hidden />
                  {label}
                </Label>
                <Input
                  id={`office-${name}`}
                  type={type ?? "text"}
                  value={office[name] ?? ""}
                  placeholder={placeholder}
                  disabled={!canManage}
                  onChange={(event) => {
                    setOffice((prev) => ({ ...prev, [name]: event.target.value }));
                    setOfficeDirty(true);
                  }}
                />
              </div>
            ))}
          </div>
          {canManage ? (
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!officeDirty || saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                ) : null}
                Save office channels
              </Button>
            </div>
          ) : null}
        </form>
      </SectionCard>

      <SectionCard
        icon={Globe2}
        title="Public social media links"
        description="Official page URLs for the university's public social presence."
        badge={
          <Badge variant="outline" className="gap-1 font-normal text-muted-foreground">
            <BadgeInfo className="size-3" aria-hidden />
            Footer currently hardcoded
          </Badge>
        }
      >
        <form
          aria-label="Public social media links"
          onSubmit={(event) => {
            event.preventDefault();
            saveMutation.mutate(
              { social_links: normalize(social) },
              { onSuccess: () => setSocialDirty(false) },
            );
          }}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {SOCIAL_FIELDS.map(({ name, label, placeholder }) => (
              <div key={name} className="space-y-1.5">
                <Label htmlFor={`social-${name}`} className="text-xs font-medium">
                  {label}
                </Label>
                <Input
                  id={`social-${name}`}
                  type="url"
                  inputMode="url"
                  value={social[name] ?? ""}
                  placeholder={placeholder}
                  disabled={!canManage}
                  onChange={(event) => {
                    setSocial((prev) => ({ ...prev, [name]: event.target.value }));
                    setSocialDirty(true);
                  }}
                />
              </div>
            ))}
          </div>
          <p className="text-xs leading-5 text-muted-foreground">
            These links are stored as public site settings
            (<code className="rounded bg-muted px-1 py-0.5">corporate_communication.social_links</code>).
            The public website footer still uses hardcoded URLs — its next
            release should read this setting instead.
          </p>
          {canManage ? (
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!socialDirty || saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                ) : null}
                Save social links
              </Button>
            </div>
          ) : null}
        </form>
      </SectionCard>

      <section aria-label="Social platform credentials" className="space-y-2">
        <div className="overflow-hidden rounded-xl border shadow-sm">
          <SocialAccountsPanel />
        </div>
      </section>

      <SectionCard
        icon={Users}
        title="Portal team"
        description="Everyone holding a Corporate Communication role. Membership is managed from the admin users screen."
        badge={
          hasScope("users:read") ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/system/users" aria-label="Manage users in system administration">
                Manage users
                <ArrowUpRight data-icon="inline-end" />
              </Link>
            </Button>
          ) : undefined
        }
        contentClassName="p-0"
      >
        {teamQuery.isLoading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : teamQuery.isError ? (
          <div className="p-5">
            <PortalEmptyState
              icon={AlertCircle}
              title="Team roster unavailable"
              description="The roster could not be loaded right now."
              action={
                <Button variant="outline" onClick={() => void teamQuery.refetch()}>
                  <RefreshCw data-icon="inline-start" /> Retry
                </Button>
              }
            />
          </div>
        ) : (teamQuery.data?.length ?? 0) === 0 ? (
          <div className="p-5">
            <PortalEmptyState
              icon={Users}
              title="No portal team members found"
              description="No active users currently hold a Corporate Communication role. Roles are assigned from system administration."
            />
          </div>
        ) : (
          <ul className="divide-y" aria-label="Portal team members">
            {(teamQuery.data ?? []).map((member: CorporateCommTeamMember) => (
              <li
                key={member.id}
                className="flex flex-wrap items-center gap-3 px-5 py-3"
              >
                <span className="rounded-full bg-muted p-2 text-muted-foreground">
                  <UserRound className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {member.full_name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {member.email}
                    {member.last_login_at
                      ? ` · last active ${new Date(member.last_login_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                      : ""}
                  </span>
                </span>
                <span className="flex flex-wrap justify-end gap-1">
                  {member.roles.map((role) => (
                    <Badge key={role} variant="secondary" className="font-normal">
                      {role}
                    </Badge>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link2 className="size-3.5" aria-hidden />
        Credential linking and posting health live in the Connected Accounts
        panel above; performance numbers live on the portal dashboard&apos;s
        Reach panel.
      </p>
    </PortalWorkspace>
  );
}
