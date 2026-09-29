"use client";
import { Button } from "@ksu/ui/button";
import { useResearchWorkspace } from "./admin-shell";
export function WorkspaceAccess() {
  const { context, modules, refresh } = useResearchWorkspace();
  return <div className="rw-stack"><div className="rw-page-heading"><div><p className="rw-eyebrow">MY ASSIGNMENT</p><h1>Workspace access</h1><p>Read-only capability and module information returned by the Research service.</p></div><Button variant="outline" onClick={refresh}>Recheck access</Button></div>
    <section className="rw-panel rw-inset"><h2>Authority and scope</h2><dl className="rw-values"><div><dt>Research authority</dt><dd>{context.is_global ? "Research oversight permissions; record scope still applies" : "Scoped research assignment"}</dd></div>
      <div><dt>Assigned domains</dt><dd>{context.domains.length ? context.domains.join(", ") : "No domain labels returned"}</dd></div><div><dt>Editorial review</dt><dd>{context.can_review ? "Available, subject to record scope" : "Not assigned"}</dd></div>
      <div><dt>Publication</dt><dd>{context.can_publish ? "Available, subject to scope and MFA assurance" : "Not assigned"}</dd></div></dl></section>
    <section className="rw-panel rw-inset"><h2>{modules.length} available modules</h2><p className="rw-help">Creation availability is preliminary. The mutation endpoint checks the submitted ownership, required references and assurance again.</p>
      <div className="rw-table-scroll"><table className="rw-table"><thead><tr><th scope="col">Module</th><th scope="col">Create</th><th scope="col">Editorial workflow</th><th scope="col">Native fields</th></tr></thead><tbody>{modules.map(module => <tr key={module.key}><td>{module.label}</td><td>{module.can_create ? "Assigned" : "Not assigned"}</td><td>{module.workflow ? "Supported" : "Not applicable"}</td><td>{module.fields.length}</td></tr>)}</tbody></table></div></section>
    <section className="rw-panel rw-inset"><h2>Portal capability snapshot</h2><p className="rw-help">This is the portal's existing capability vocabulary, not the complete identity permission catalog.</p><dl className="rw-values">{Object.entries(context.capabilities).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value ? "Assigned" : "Not assigned"}</dd></div>)}</dl></section>
  </div>;
}
