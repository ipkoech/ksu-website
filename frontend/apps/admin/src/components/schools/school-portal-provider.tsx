"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  schoolPortalApi,
  schoolPortalQueryKeys,
  type SchoolPortalContextResponse,
  type SchoolPortalNavigationKey,
} from "@ksu/api-client";
import {
  Bell,
  BookOpen,
  Building2,
  FileText,
  GraduationCap,
  History,
  ImageIcon,
  LayoutDashboard,
  Mail,
  Newspaper,
  Users,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle, Skeleton } from "@ksu/ui/components";
import { PortalShell } from "@/components/portals/portal-shell";

type SchoolPortalContextValue = SchoolPortalContextResponse & {
  can: (permission: string) => boolean;
};

const SchoolPortalContext = createContext<SchoolPortalContextValue | null>(null);

const SCHOOL_PORTAL_NAVIGATION = [
  { key: "dashboard", title: "Dashboard", href: "/schools", icon: LayoutDashboard },
  { key: "profile", title: "School Profile", href: "/schools/profile", icon: GraduationCap },
  { key: "team", title: "Team", href: "/schools/team", icon: Users },
  { key: "departments", title: "Departments", href: "/schools/departments", icon: Building2 },
  { key: "programmes", title: "Programmes", href: "/schools/programmes", icon: BookOpen },
  { key: "publications", title: "Publications", href: "/schools/publications", icon: FileText },
  { key: "content", title: "Content Studio", href: "/schools/content", icon: Newspaper },
  { key: "media", title: "Media", href: "/schools/media", icon: ImageIcon },
  { key: "inquiries", title: "Inquiries", href: "/schools/inquiries", icon: Mail },
  { key: "notifications", title: "Notifications", href: "/schools/notifications", icon: Bell },
  { key: "audit", title: "Audit Log", href: "/schools/audit", icon: History },
] satisfies Array<{
  key: SchoolPortalNavigationKey;
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
}>;

function PortalBootstrapSkeleton() {
  return (
    <div className="grid min-h-screen grid-cols-[17.5rem_1fr]">
      <Skeleton className="h-screen rounded-none" />
      <div className="space-y-4 p-8">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-52 w-full" />
      </div>
    </div>
  );
}

function PortalBootstrapError({ error }: { error: Error }) {
  const message = error.message.toLowerCase();
  const title = message.includes("multiple schools")
    ? "Multiple schools are assigned"
    : message.includes("no school") || message.includes("unavailable")
      ? "No school is assigned"
      : "School Portal unavailable";

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl items-center p-6">
      <Alert variant="destructive">
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          {error.message}. Contact an administrator to correct your scoped school access.
        </AlertDescription>
      </Alert>
    </main>
  );
}

export function SchoolPortalProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const contextQuery = useQuery({
    queryKey: schoolPortalQueryKeys.bootstrap,
    queryFn: async () => (await schoolPortalApi.context()).data,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const context = contextQuery.data;

  useEffect(() => {
    if (!context) return;
    queryClient.setQueryData(
      schoolPortalQueryKeys.context(context.school.id),
      context,
    );
    queryClient.setQueryDefaults(schoolPortalQueryKeys.root(context.school.id), {
      staleTime: 60 * 1000,
    });
  }, [context, queryClient]);

  const navigation = useMemo(
    () =>
      context
        ? SCHOOL_PORTAL_NAVIGATION.filter((item) =>
            context.allowed_navigation.includes(item.key),
          )
        : [],
    [context],
  );
  const value = useMemo<SchoolPortalContextValue | null>(
    () =>
      context
        ? {
            ...context,
            can: (permission) => context.capabilities[permission] === true,
          }
        : null,
    [context],
  );

  if (contextQuery.isPending) return <PortalBootstrapSkeleton />;
  if (contextQuery.error) return <PortalBootstrapError error={contextQuery.error} />;
  if (!value) {
    return (
      <PortalBootstrapError
        error={new Error("No school is assigned to this account")}
      />
    );
  }

  return (
    <SchoolPortalContext.Provider value={value}>
      <PortalShell portalKey="schools" navOverride={navigation}>
        {children}
      </PortalShell>
    </SchoolPortalContext.Provider>
  );
}

export function useSchoolPortal() {
  const context = useContext(SchoolPortalContext);
  if (!context) {
    throw new Error("useSchoolPortal must be used within SchoolPortalProvider");
  }
  return context;
}
