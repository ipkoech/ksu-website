"use client";
import { WorkspaceFeedback } from "@ksu/ui/components/workspace-feedback";
import { useResearchWorkspace } from "./admin-shell";
import { institutionalAdminOrigin, institutionalAreas } from "./institutional-links";

export function InstitutionalAdministration() {
  const { context } = useResearchWorkspace();
  const origin = institutionalAdminOrigin(process.env.NEXT_PUBLIC_KSU_ADMIN_ORIGIN);
  const areas = institutionalAreas.filter(area => context.allowed_navigation.includes(area.key));
  return <div className="rw-stack">
    <div className="rw-page-heading"><div><p className="rw-eyebrow">INSTITUTIONAL ADMINISTRATION</p><h1>Content and staff</h1><p>Continue in the existing KSU administration application for Main-owned content and institutional staff.</p></div></div>
    <WorkspaceFeedback title="Existing workflows, unchanged authority">These destinations use the existing admin portal and Main-service APIs. They open in a new tab; the destination checks your session and assigned permissions again. They are not replacement editors in this Research application.</WorkspaceFeedback>
    {!origin && <WorkspaceFeedback title="Administration origin is not configured" tone="error">Configure <code>NEXT_PUBLIC_KSU_ADMIN_ORIGIN</code> with the trusted administration origin at build time. No guessed or unsafe destination is linked.</WorkspaceFeedback>}
    {!areas.length ? <WorkspaceFeedback title="No institutional destinations are assigned">The Research portal did not authorize any of these navigation keys. No access is inferred from a role name.</WorkspaceFeedback> : <div className="rw-grid">{areas.map(area => <section className="rw-panel rw-inset" key={area.key}><h2>{area.label}</h2><p>{area.description}</p>{origin ? <a className="rw-text-link" href={origin + area.path} target="_blank" rel="noopener noreferrer">Open {area.label.toLowerCase()} in KSU administration</a> : <p className="rw-help">Destination unavailable until the administration origin is configured.</p>}</section>)}</div>}
  </div>;
}
