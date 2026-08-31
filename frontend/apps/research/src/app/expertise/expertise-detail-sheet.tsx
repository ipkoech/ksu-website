"use client";

import type { ReactNode } from "react";
import { ResearchImage } from "../../components/research-image";
import type { Person } from "@ksu/api-client";
import type { LucideIcon } from "lucide-react";
import { Building2, ExternalLink, Mail, Phone, UserRound } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@ksu/ui/components";
import { ResearchRichText } from "../../components/research-rich-text";
import { Badge } from "../../components/research-ui";
import { compactText, formatLabel } from "../../lib/research-public-data";
import { publicFrontendUrl } from "../../lib/service-urls";

export function ExpertiseDetailSheet({
  person,
  children,
}: {
  person: Person;
  children: ReactNode;
}) {
  const name = personName(person);
  const role = compactText(person.institutional_role) || compactText(person.title) || compactText(person.academic_rank);
  const department = compactText(person.department_name) || compactText(person.department?.name);
  const profileHref = `${publicFrontendUrl}/staff/${person.slug || person.id}`;
  const summary = compactText(person.specialization) || compactText(person.bio) || compactText(person.full_bio);
  const interests = Array.isArray(person.research_interests) ? person.research_interests.filter(Boolean) : [];

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="right"
        className="top-[92px] h-[calc(100dvh-92px)] w-full overflow-y-auto bg-white p-0 sm:max-w-2xl xl:top-[128px] xl:h-[calc(100dvh-128px)]"
      >
        <SheetHeader className="border-b border-border px-6 py-5 text-left">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
              {person.photo_url ? (
                <ResearchImage src={person.photo_url} alt="" width={112} height={112} sizes="56px" className="h-full w-full object-cover" />
              ) : (
                <UserRound aria-hidden className="h-7 w-7" />
              )}
            </div>
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap gap-2">
                {person.academic_rank ? <Badge>{formatLabel(person.academic_rank)}</Badge> : null}
                {person.is_featured ? (
                  <span className="inline-flex rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold uppercase text-primary">
                    Featured
                  </span>
                ) : null}
              </div>
              <SheetTitle className="text-2xl font-semibold leading-tight text-foreground">
                {name}
              </SheetTitle>
              {role ? (
                <SheetDescription className="text-sm font-semibold leading-6 text-primary">
                  {role}
                </SheetDescription>
              ) : null}
            </div>
          </div>
        </SheetHeader>

        <div className="grid gap-5 px-6 py-5">
          <dl className="grid gap-3 rounded-lg border border-border bg-surface-subtle p-4 text-sm">
            <MetaRow icon={Building2} label="Department" value={department} />
            <MetaRow icon={Mail} label="Email" value={compactText(person.email)} href={person.email ? `mailto:${person.email}` : undefined} />
            <MetaRow icon={Phone} label="Phone" value={compactText(person.phone || person.office_phone)} href={person.phone ? `tel:${person.phone}` : undefined} />
          </dl>

          {interests.length ? (
            <section>
              <h3 className="text-sm font-semibold text-foreground">Expertise areas</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <Badge key={interest}>{interest}</Badge>
                ))}
              </div>
            </section>
          ) : null}

          {summary ? (
            <section>
              <h3 className="text-sm font-semibold text-foreground">Profile</h3>
              <ResearchRichText content={summary} className="mt-2 text-sm leading-7 text-muted-foreground" />
            </section>
          ) : null}

          <section className="rounded-lg border border-border bg-white p-4">
            <h3 className="text-sm font-semibold text-foreground">Research profile links</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <ExternalProfileLink href={profileHref} label="Main profile" />
              <ExternalProfileLink href={person.google_scholar_url} label="Google Scholar" />
              <ExternalProfileLink href={person.researchgate_url} label="ResearchGate" />
              <ExternalProfileLink href={person.website_url} label="Website" />
              <ExternalProfileLink href={person.linkedin_url} label="LinkedIn" />
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ExternalProfileLink({ href, label }: { href?: string | null; label: string }) {
  const cleanHref = compactText(href);
  if (!cleanHref) return null;
  return (
    <a
      href={cleanHref}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-10 items-center gap-2 rounded-md border border-primary px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5"
    >
      {label}
      <ExternalLink aria-hidden className="h-4 w-4" />
    </a>
  );
}

function MetaRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
}) {
  if (!value) return null;
  const content = href ? (
    <a href={href} className="break-words font-semibold text-primary hover:text-secondary [overflow-wrap:anywhere]">
      {value}
    </a>
  ) : (
    <span className="break-words text-foreground [overflow-wrap:anywhere]">{value}</span>
  );

  return (
    <div className="grid grid-cols-[20px_100px_minmax(0,1fr)] gap-2">
      <Icon aria-hidden className="mt-0.5 h-4 w-4 text-primary" />
      <dt className="font-semibold text-muted-foreground">{label}</dt>
      <dd className="min-w-0">{content}</dd>
    </div>
  );
}

function personName(person: Person) {
  return compactText(person.full_name) || [person.first_name, person.last_name].map(compactText).filter(Boolean).join(" ") || person.id;
}
