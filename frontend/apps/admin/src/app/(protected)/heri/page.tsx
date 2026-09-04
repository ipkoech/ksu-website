import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, FileText, Image, Inbox, Settings, Users } from "lucide-react";
import { Card, CardContent } from "@ksu/ui/components";
import { SchoolWorkspace, SchoolWorkspaceHeader } from "@/components/schools/shared/school-workspace";
import { HeriDashboardClient } from "./heri-dashboard-client";

const modules = [["Content & pages", "Draft, review, schedule, and publish HERI stories.", "/heri/content", FileText], ["Research", "Manage themes, projects, publications, and resources.", "/heri/research", BookOpen], ["Team & partners", "Keep leadership, researchers, and partner records current.", "/heri/people", Users], ["Submissions", "Review contact, partnership, and network applications.", "/heri/submissions", Inbox], ["Media library", "Manage approved images, documents, credits, and alt text.", "/heri/media", Image], ["Site settings", "Update navigation, footer, SEO, and contact details.", "/heri/settings", Settings]] as const;

export default function HeriWorkspacePage() {
  return <SchoolWorkspace><SchoolWorkspaceHeader eyebrow="HERI Africa workspace" title="Research communication and publishing" description="Manage the Language Education Research Chair’s public platform, research records, partners, and enquiries from one operational workspace." icon={BarChart3} /><HeriDashboardClient /><section aria-label="HERI modules" className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{modules.map(([title, description, href, Icon]) => <Link href={href} key={href}><Card className="h-full transition-colors hover:border-primary/40"><CardContent className="flex h-full items-start gap-3 p-4"><span className="rounded-xl bg-primary/10 p-2.5 text-primary"><Icon className="size-5" /></span><span className="min-w-0 flex-1"><span className="block font-semibold">{title}</span><span className="mt-1 block text-sm leading-5 text-muted-foreground">{description}</span><span className="mt-3 inline-flex items-center text-xs font-semibold text-primary">Open module <ArrowRight className="ml-1 size-3.5" /></span></span></CardContent></Card></Link>)}</section></SchoolWorkspace>;
}
