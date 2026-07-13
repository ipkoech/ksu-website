"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ksu/ui/components";
import { governanceAdminApi } from "@/lib/api/organization";

type PreviewMember = Record<string, any>;

function memberName(member?: PreviewMember | null) {
  return member?.person?.display_name ?? member?.person?.full_name ?? member?.display_name ?? member?.name ?? "Council member";
}

function memberRole(member?: PreviewMember | null) {
  return member?.public_role_label ?? member?.role_label ?? member?.role ?? "Council member";
}

function memberSlug(member?: PreviewMember | null) {
  return member?.profile_slug ?? member?.slug ?? "#";
}

function profileHref(member?: PreviewMember | null) {
  const slug = memberSlug(member);
  return slug === "#" ? "#" : `/about/university-council/${slug}`;
}

export function CouncilPreview() {
  const previewQuery = useQuery({
    queryKey: ["governance", "university-council", "preview"],
    queryFn: () => governanceAdminApi.previewCouncil(),
  });
  const preview = previewQuery.data?.data;
  const chairperson = preview?.chairperson ?? null;
  const members = (preview?.members ?? []) as PreviewMember[];
  const secretary = preview?.secretary ?? null;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <CardTitle>Preview Public Page</CardTitle>
          <CardDescription>
            Public-style Council cards grouped by chairperson, members, and secretary before changes are published.
          </CardDescription>
        </div>
        <Badge variant="outline">Admin preview</Badge>
      </CardHeader>
      <CardContent className="space-y-8">
        {previewQuery.isLoading ? (
          <StateMessage label="Loading Council preview..." />
        ) : null}
        {previewQuery.isError ? (
          <StateMessage label="Council preview could not be loaded. Check your connection and try again." tone="error" />
        ) : null}
        <section className="rounded-lg border bg-muted/20 p-6 text-center">
          <p className="text-xs font-semibold uppercase text-primary">chairperson</p>
          <div className="mx-auto mt-4 max-w-sm">
            {chairperson ? <PreviewCard member={chairperson} featured /> : !previewQuery.isLoading && !previewQuery.isError ? <EmptyPreview label="No chairperson ready for preview" /> : null}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Council Members</h3>
              <p className="text-sm text-muted-foreground">{members.length} profiles in public order</p>
            </div>
          </div>
          {members.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {members.map((member, index) => (
                <PreviewCard key={member.profile_slug ?? member.slug ?? index} member={member} />
              ))}
            </div>
          ) : !previewQuery.isLoading && !previewQuery.isError ? (
            <EmptyPreview label="No council members ready for preview" />
          ) : (
            <div className="min-h-24" />
          )}
        </section>

        <section className="rounded-lg border bg-muted/20 p-6 text-center">
          <p className="text-xs font-semibold uppercase text-primary">secretary</p>
          <div className="mx-auto mt-4 max-w-sm">
            {secretary ? <PreviewCard member={secretary} featured /> : !previewQuery.isLoading && !previewQuery.isError ? <EmptyPreview label="No secretary ready for preview" /> : null}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}

function PreviewCard({ member, featured = false }: { member: PreviewMember; featured?: boolean }) {
  const name = memberName(member);
  const role = memberRole(member);

  return (
    <Link
      href={profileHref(member)}
      aria-label={`View profile of ${name}, ${role}`}
      className={`group block rounded-lg border bg-background p-5 text-left transition hover:border-primary/60 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary ${
        featured ? "text-center" : ""
      }`}
    >
      <div className={`flex ${featured ? "justify-center" : "justify-between"} gap-3`}>
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
          {name.slice(0, 1)}
        </div>
        {!featured ? <ExternalLink className="size-4 text-muted-foreground transition group-hover:text-primary" /> : null}
      </div>
      <h4 className="mt-4 font-semibold">{name}</h4>
      <p className="mt-1 text-sm text-muted-foreground">{role}</p>
      {member.represented_institution ? <p className="mt-3 text-xs text-muted-foreground">{member.represented_institution}</p> : null}
    </Link>
  );
}

function EmptyPreview({ label }: { label: string }) {
  return <p className="rounded-md border border-dashed bg-background p-4 text-sm text-muted-foreground">{label}</p>;
}

function StateMessage({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "error" }) {
  return (
    <p className={`rounded-md border p-4 text-sm ${tone === "error" ? "border-destructive/30 bg-destructive/5 text-destructive" : "bg-muted/20 text-muted-foreground"}`}>
      {label}
    </p>
  );
}
