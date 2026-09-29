"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUpRight, BookOpen, BriefcaseBusiness, FlaskConical, LayoutDashboard, ListChecks, Menu, RefreshCw, X } from "lucide-react";
import { Button } from "@ksu/ui/button";
import { WorkspaceFeedback, WorkspaceLoading } from "@ksu/ui/components/workspace-feedback";
import { researchWorkspaceApi, researchWorkspaceSupportApi, setRWCommandIdentity, acceptRWWorkspaceIdentity } from "@ksu/api-client/research";
import type { RWContext, RWModule } from "@ksu/api-client/research";
import { Problem } from "./problem";
import { institutionalAreas } from "./institutional-links";
import { useWorkspaceRead } from "./use-workspace";

interface WorkspaceContext { context: RWContext; modules: RWModule[]; refresh: () => void }
const Context = createContext<WorkspaceContext | null>(null);
export function useResearchWorkspace() {
  const context = useContext(Context);
  if (!context) throw new Error("Research workspace provider is missing");
  return context;
}
const icons: Record<string, typeof FlaskConical> = { projects: FlaskConical, publications: BookOpen, grants: BriefcaseBusiness };
const authenticationPaths = new Set(["/admin/login", "/admin/forgot-password", "/admin/reset-password", "/admin/password-required"]);
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return authenticationPaths.has(pathname) ? <main id="research-main" className="rw-auth">{children}</main> : <AuthenticatedAdminShell>{children}</AuthenticatedAdminShell>;
}
function AuthenticatedAdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname(), [expanded, setExpanded] = useState(false);
  useEffect(() => () => setRWCommandIdentity(null), []);
  const [navSearch, setNavSearch] = useState("");
  const sidebar = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!expanded) return;
    const previous = document.activeElement as HTMLElement | null;
    const focusables = () => Array.from(sidebar.current?.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),input,summary') ?? []).filter(element => element.offsetParent !== null);
    focusables()[0]?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
      if (event.key !== "Tab") return;
      const elements = focusables(), first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => { document.removeEventListener("keydown", keydown); previous?.focus(); };
  }, [expanded]);
  const utilityPage = ["/admin/account", "/admin/access", "/admin/recovery", "/admin/institutional"].includes(pathname);
  const load = useCallback(async (signal: AbortSignal) => {
    setRWCommandIdentity(null);
    const account = await researchWorkspaceSupportApi.me(signal);
    let context: RWContext, modules: RWModule[];
    try { [context, modules] = await Promise.all([researchWorkspaceApi.context(signal, account.id), researchWorkspaceApi.catalog(signal, account.id)]); }
    catch (error) {
      if (!utilityPage || !error || typeof error !== "object" || !("status" in error) || error.status !== 403) throw error;
      context = { subject: account.id, capabilities: {}, allowed_navigation: [], domains: [], is_global: false, can_review: false, can_publish: false };
      modules = [];
    }
    acceptRWWorkspaceIdentity(account.id, context.subject, signal);
    return { context, modules, account };
  }, [utilityPage]);
  const { state, reload } = useWorkspaceRead(load);
  if (state.status !== "ready") return <main id="research-main" className="rw-gate">
    <p className="rw-eyebrow">KISII UNIVERSITY · RESEARCH ADMINISTRATION</p>
    <h1>Your research workspace</h1>
    {state.status === "loading" ? <WorkspaceLoading label="Checking your session and research assignment…" /> : <Problem problem={state.error} onRetry={reload} />}
    <Link href="/" className="rw-text-link">Return to the public research website</Link>
  </main>;
  const { context, modules, account } = state.data;
  if (account.must_change_password) return <main id="research-main" className="rw-gate"><h1>Update your password</h1><WorkspaceFeedback title="A password change is required">Your account requires a new password before using this workspace.<p><Link className="rw-text-link" href="/admin/password-required">Change password securely</Link></p></WorkspaceFeedback></main>;
  const reviewAllowed = (context.can_review || context.can_publish) && modules.some(module => module.workflow);
  const groups = [...new Set(modules.map(module => module.group ?? "Research records"))];
  const currentModule = modules.find(module => pathname === `/admin/${module.key}` || pathname.startsWith(`/admin/${module.key}/`));
  const navLink = (href: string, label: string, Icon = FlaskConical) => {
    const active = href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
    return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={active ? "rw-nav-active" : ""}
      onClick={() => setExpanded(false)}><Icon size={17} aria-hidden="true" /><span>{label}</span></Link>;
  };
  return <Context.Provider value={{ context, modules, refresh: reload }}><div className="rw-shell">
    <aside ref={sidebar} id="rw-navigation" role={expanded ? "dialog" : undefined} aria-modal={expanded || undefined} className={`rw-sidebar ${expanded ? "rw-sidebar-open" : ""}`} aria-label="Research workspace navigation">
      <div className="rw-brand"><span className="rw-brand-mark">KSU</span><span><strong>Research office</strong><small>ADMINISTRATION</small></span>
        <Button type="button" variant="ghost" className="rw-mobile-close" aria-label="Close navigation" onClick={() => setExpanded(false)}><X /></Button></div>
      <label className="rw-nav-search"><span className="sr-only">Find a working area</span><input value={navSearch} onChange={event => setNavSearch(event.target.value)} placeholder="Find a working area…" /></label>
      <nav>{navLink("/admin", "Overview", LayoutDashboard)}{reviewAllowed && navLink("/admin/reviews", "Review queue", ListChecks)}
        {groups.map(group => {
          const entries = modules.filter(module => (module.group ?? "Research records") === group && `${module.label} ${group}`.toLowerCase().includes(navSearch.toLowerCase()));
          if (!entries.length) return null;
          return <details key={group} open={Boolean(navSearch) || currentModule?.group === group || (!currentModule && group === groups[0])} className="rw-nav-group"><summary>{group}<small>{entries.length}</small></summary>
            {entries.map(module => navLink(`/admin/${module.key}`, module.label, icons[module.key] ?? FlaskConical))}</details>;
        })}
        {institutionalAreas.some(area => context.allowed_navigation.includes(area.key)) && navLink("/admin/institutional", "Content and staff", ListChecks)}
        {navLink("/admin/recovery", "Command recovery", ListChecks)}
        {navLink("/admin/access", "My workspace access", ListChecks)}
        {navLink("/admin/account", "Account and security", ListChecks)}
      </nav>
      <div className="rw-scope"><span className="rw-online-dot" aria-hidden="true" />Server-assigned access
        <p>{context.is_global ? "Research oversight workspace" : context.domains.length ? context.domains.join(", ").replace(/_/g, " ") : "Your signed research assignments"}</p>
        <small>Each record is still checked against your scope.</small></div>
      <Link href="/" className="rw-public-link">Public research website <ArrowUpRight size={16} aria-hidden="true" /></Link>
    </aside>
    {expanded && <button className="rw-nav-backdrop" aria-label="Close navigation" onClick={() => setExpanded(false)} />}
    <div className="rw-body" inert={expanded || undefined}><header className="rw-topbar"><div><Button variant="ghost" className="rw-mobile-menu" aria-label="Open navigation"
      aria-controls="rw-navigation" aria-expanded={expanded} onClick={() => setExpanded(true)}><Menu /></Button><span>Research administration</span><span className="rw-topbar-divider">/</span><strong>{currentModule?.label ?? (pathname === "/admin/reviews" ? "Review queue" : "Workspace")}</strong></div>
      <Button type="button" variant="ghost" onClick={() => { if (window.confirm("Refresh access and reload this workspace? Unsaved input in the current page will be lost.")) reload(); }}><RefreshCw size={15} aria-hidden="true" /> Refresh access</Button></header>
      <main id="research-main" className="rw-main">
        {modules.length === 0 && !utilityPage ? <WorkspaceFeedback title="No supported working areas are assigned">
          Your session is valid, but none of the registered Research working areas is in your signed scope. No institution-wide data has been substituted.
          {institutionalAreas.some(area => context.allowed_navigation.includes(area.key)) && <p><Link href="/admin/institutional" className="rw-text-link">Open assigned content and staff destinations</Link></p>}
        </WorkspaceFeedback> : children}
      </main><footer className="rw-footer">Kisii University · Research workspace <span>Live, scope-checked service data</span></footer>
    </div>
  </div></Context.Provider>;
}
