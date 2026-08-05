"use client";

import type { LibraryBranch } from "@ksu/api-client";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { compactText } from "../../lib/library-public-data";

export function ContactBranchSelector({
  branches,
  todayByBranch = {},
}: {
  branches: LibraryBranch[];
  todayByBranch?: Record<string, string | null>;
}) {
  const [selectedId, setSelectedId] = useState(branches[0]?.id ?? "");
  const selected = branches.find((branch) => branch.id === selectedId) ?? null;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(220px,0.7fr)_minmax(0,1.3fr)]">
      <div>
        <label htmlFor="contact-branch" className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Select a library branch</label>
        <select id="contact-branch" value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="mt-3 h-12 w-full rounded-md border border-border bg-white px-3 text-sm font-semibold text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15">
          {branches.length === 0 ? <option value="">General library desk</option> : null}
          {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
          {branches.length > 0 ? <option value="">General library desk</option> : null}
        </select>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">Choose a branch to see its published contact details and visit information.</p>
      </div>
      <div className="border-l-4 border-secondary bg-surface-subtle p-6 sm:p-8">
        <h3 className="text-2xl font-semibold text-foreground">{selected?.name ?? "General library desk"}</h3>
        {selected ? <dl className="mt-6 grid gap-5 sm:grid-cols-2"><ContactDetail icon={<MapPin aria-hidden />} label="Location" value={selected.address ?? selected.location} /><ContactDetail icon={<Phone aria-hidden />} label="Phone" value={selected.phone} /><ContactDetail icon={<Mail aria-hidden />} label="Email" value={selected.email} /><ContactDetail icon={<Clock3 aria-hidden />} label="Opening hours" value={todayByBranch[selected.id] ?? "See the branch schedule below"} /></dl> : <p className="mt-4 text-sm leading-7 text-muted-foreground">Branch contact details are being updated.</p>}
      </div>
    </div>
  );
}

function ContactDetail({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  if (!compactText(value)) return null;
  return <div className="flex gap-3"><span className="mt-0.5 text-primary">{icon}</span><div><dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</dt><dd className="mt-1 text-sm leading-6 text-foreground">{value}</dd></div></div>;
}
