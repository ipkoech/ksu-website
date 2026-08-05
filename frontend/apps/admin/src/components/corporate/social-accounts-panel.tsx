"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApiClientError,
  socialPostsApi,
  socialQueryKeys,
  SOCIAL_PLATFORM_LIMITS,
  type SocialPlatform,
  type SocialPlatformAccount,
} from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";
import { toast } from "@ksu/ui";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Skeleton,
} from "@ksu/ui/components";
import { cn } from "@ksu/ui/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Link2,
  Loader2,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import {
  PortalEmptyState,
  PortalWorkspace,
  PortalWorkspaceHeader,
} from "@/components/portals/portal-workspace";

type LinkState = "linked" | "error" | "unverified";

function linkState(account: SocialPlatformAccount): LinkState {
  if (account.last_error) return "error";
  if (account.last_validated_at) return "linked";
  return "unverified";
}

const LINK_BADGES: Record<
  LinkState,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  linked: {
    label: "Linked",
    className:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-transparent",
    icon: CheckCircle2,
  },
  error: {
    label: "Connection error",
    className: "bg-destructive/10 text-destructive border-transparent",
    icon: AlertCircle,
  },
  unverified: {
    label: "Not yet validated",
    className: "bg-muted text-muted-foreground border-transparent",
    icon: HelpCircle,
  },
};

function formatWhen(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function AccountCard({
  account,
  isAdmin,
}: {
  account: SocialPlatformAccount;
  isAdmin: boolean;
}) {
  const queryClient = useQueryClient();
  const validateMutation = useMutation({
    mutationFn: () => socialPostsApi.validateAccount(account.id),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: socialQueryKeys.accounts });
      if (result.data?.valid) {
        toast.success(`${account.name} is connected`);
      } else {
        toast.error(result.data?.error ?? "Credentials check failed");
      }
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Could not check the connection",
      ),
  });

  const state = linkState(account);
  const badge = LINK_BADGES[state];
  const BadgeIcon = badge.icon;
  const providerLabel =
    SOCIAL_PLATFORM_LIMITS[account.provider as SocialPlatform]?.label ??
    account.provider;
  const validated = formatWhen(account.last_validated_at);
  const lastUsed = formatWhen(account.last_used_at);

  return (
    <Card className={cn("shadow-sm", !account.is_active && "opacity-70")}>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{account.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {providerLabel} · {account.account_ref}
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1.5">
            {!account.is_active ? (
              <Badge variant="outline" className="font-normal">
                Inactive
              </Badge>
            ) : null}
            <Badge className={cn("gap-1 font-normal", badge.className)}>
              <BadgeIcon className="size-3" />
              {badge.label}
            </Badge>
          </span>
        </div>

        {state === "error" && account.last_error ? (
          <p
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive"
          >
            {account.last_error}
          </p>
        ) : null}

        <p className="text-xs text-muted-foreground">
          {validated ? `Last validated ${validated}` : "Never validated"}
          {lastUsed ? ` · Last used ${lastUsed}` : ""}
        </p>

        {isAdmin ? (
          <div className="flex justify-end border-t pt-3">
            <Button
              size="sm"
              variant="outline"
              disabled={validateMutation.isPending}
              onClick={() => validateMutation.mutate()}
            >
              {validateMutation.isPending ? (
                <Loader2
                  data-icon="inline-start"
                  className="size-4 animate-spin"
                />
              ) : (
                <RefreshCw data-icon="inline-start" className="size-4" />
              )}
              Check connection
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function SocialAccountsPanel() {
  const { hasScope } = usePermissions();
  const isAdmin = hasScope("admin:*");

  const accountsQuery = useQuery({
    queryKey: socialQueryKeys.accounts,
    queryFn: async () => (await socialPostsApi.listAccounts()).data ?? [],
    staleTime: 30_000,
  });
  const accounts = accountsQuery.data ?? [];

  return (
    <PortalWorkspace>
      <PortalWorkspaceHeader
        eyebrow="Social Media"
        title="Connected Accounts"
        description="Platform accounts used to deliver social posts, with their live credential status."
        icon={Link2}
        meta={
          !isAdmin ? (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldAlert className="size-3.5" />
              Credentials are managed by system administrators — contact them to
              link, relink, or remove an account.
            </p>
          ) : null
        }
      />

      {accountsQuery.isLoading ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <PortalEmptyState
          icon={Link2}
          title="No platform accounts connected"
          description={
            isAdmin
              ? "Connect X, Facebook, Instagram, or LinkedIn accounts via the social accounts API to start publishing."
              : "No accounts have been linked yet. System administrators manage platform credentials."
          }
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} isAdmin={isAdmin} />
          ))}
        </div>
      )}
    </PortalWorkspace>
  );
}
