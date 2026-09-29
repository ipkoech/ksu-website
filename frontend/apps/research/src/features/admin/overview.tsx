"use client";
import Link from "next/link";
import { useCallback, useState } from "react";
import { ArrowRight, BookOpen, BriefcaseBusiness, FlaskConical, ShieldCheck } from "lucide-react";
import { Button } from "@ksu/ui/button";
import { researchWorkspaceApi } from "@ksu/api-client/research";
import type { RWModule } from "@ksu/api-client/research";
import { useResearchWorkspace } from "./admin-shell";
import { useWorkspaceRead } from "./use-workspace";
import { Problem } from "./problem";

const icons: Record<string, typeof FlaskConical> = { projects: FlaskConical, publications: BookOpen, grants: BriefcaseBusiness };
function Summary({ module }: { module: RWModule }) {
  const load = useCallback((signal: AbortSignal) => researchWorkspaceApi.list(module.key, { per_page: 1 }, signal), [module.key]);
  const { state, reload } = useWorkspaceRead(load), Icon = icons[module.key] ?? FlaskConical;
  return <article className="rw-summary"><div className="rw-summary-heading"><span>{module.label}</span><Icon aria-hidden="true" size={20} /></div>
    {state.status === "loading" ? <p role="status" className="rw-count-placeholder">Loading…</p> : state.status === "error" ? <Problem problem={state.error} onRetry={reload} /> :
      <><strong className="rw-count">{state.data.meta.total.toLocaleString()}</strong><p>Records in your assigned scope</p></>}
    <Link href={`/admin/${module.key}`}>Open working area <ArrowRight aria-hidden="true" size={16} /></Link></article>;
}
export function Overview() {
  const { modules, context } = useResearchWorkspace();
  const [search, setSearch] = useState("");
  const featured = ["projects", "publications", "grants"].map(key => modules.find(module => module.key === key)).filter((module): module is RWModule => Boolean(module));
  const summaries = [...featured, ...modules.filter(module => !featured.includes(module))].slice(0, 3);
  const groups = [...new Set(modules.map(module => module.group ?? "Research records"))];
  return <div className="rw-stack"><section className="rw-hero"><div><p className="rw-eyebrow">RESEARCH · SCHOLARSHIP · OPPORTUNITY</p><h1>Give good research<br />a clear path forward.</h1>
    <p>Maintain accurate records, resolve review decisions and keep your assigned research portfolio moving.</p></div>
    <div className="rw-hero-note"><ShieldCheck size={26} aria-hidden="true" /><strong>Your scope, made visible.</strong><p>Counts and record access come from signed assignments. Public visibility remains a separate, audited workflow.</p></div></section>
    <div className="rw-section-heading"><div><h2>Your portfolio</h2><p>Live counts, without estimated trends or mixed-currency totals.</p></div></div>
    <div className="rw-summaries">{summaries.map(module => <Summary key={module.key} module={module} />)}</div>
    <section className="rw-panel rw-inset"><div className="rw-section-heading"><div><p className="rw-eyebrow">WORKSPACE DIRECTORY</p><h2>{modules.length} assigned working areas</h2><p>Native forms, private records and explicit actions across the research office.</p></div>
      <label><span className="sr-only">Search working areas</span><input className="rw-directory-search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Find a module or category…" /></label></div>
      {groups.map(group => {
        const entries = modules.filter(module => (module.group ?? "Research records") === group && `${group} ${module.label}`.toLowerCase().includes(search.toLowerCase()));
        if (!entries.length) return null;
        return <section key={group} className="rw-directory-group"><h3>{group}</h3><div className="rw-directory-grid">{entries.map(module => <article key={module.key} className="rw-directory-card"><h3>{module.label}</h3>
          <p>{module.workflow ? "Records, editorial review and provenance." : "Native record fields and authorized maintenance."}</p><div className="rw-actions"><Link href={`/admin/${module.key}`} className="rw-text-link">Open records <ArrowRight aria-hidden="true" size={15} /></Link>
          {module.can_create && <Link href={`/admin/${module.key}/new`} className="rw-text-link">Create new</Link>}</div></article>)}</div></section>;
      })}
      {!modules.some(module => `${module.group ?? ""} ${module.label}`.toLowerCase().includes(search.toLowerCase())) && <p>No working areas match this search.</p>}
    </section><div className="rw-overview-grid"><section className="rw-panel rw-inset"><p className="rw-eyebrow">WORKSPACE ASSURANCE</p><h2>Act with the right context</h2><p>Each record is checked against the same signed permissions and ownership filters used by the service.</p>
      <p className="rw-help">A directory count is the number of modules assigned to you, not the number of research records. Portfolio tiles show live record counts separately.</p>
      <Button asChild variant="outline"><Link href="/admin/access">Review my workspace access</Link></Button></section>
      <section className="rw-panel rw-inset"><p className="rw-eyebrow">EDITORIAL WORKFLOW</p><h2>From record to publication</h2><ol className="rw-steps"><li><strong>Prepare the record</strong><p>Use native service fields. The server assigns the initial editorial state.</p></li><li><strong>Submit for review</strong><p>Only editable drafts or returned records can be submitted.</p></li><li><strong>Review and publish</strong><p>Approval requires both review and publication authority, plus the backend’s MFA assurance.</p></li></ol>
      {(context.can_review || context.can_publish) && modules.some(module => module.workflow) && <Button asChild><Link href="/admin/reviews">Open review queue <ArrowRight aria-hidden="true" /></Link></Button>}</section></div>
  </div>;
}
