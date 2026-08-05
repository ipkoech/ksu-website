import Link from "next/link";
import { PageShell } from "@/components/site-shell";
import { VcPublicPage } from "@/components/vice-chancellor/vc-public-page";
import { getActiveViceChancellor, getPublicVcHub } from "@/lib/vice-chancellor-data";

export default async function ViceChancellorPage() {
  const [hub, assignment] = await Promise.all([getPublicVcHub(), getActiveViceChancellor()]);
  return (
    <PageShell>
      {hub ? <VcPublicPage hub={hub} assignment={assignment} /> : (
        <section className="container flex min-h-[60vh] items-center py-20"><div className="max-w-2xl rounded-[2rem] border border-border bg-white p-8 shadow-xl sm:p-12"><p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Office of the Vice Chancellor</p><h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl font-semibold text-primary">The experience is being prepared</h1><p className="mt-5 text-lg leading-8 text-muted-foreground">Our editorial team is preparing the latest messages, activities, speeches, and moments from the Office of the Vice Chancellor.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/about/university-management" className="inline-flex min-h-12 items-center rounded-full bg-primary px-6 font-bold text-white">University Management</Link><Link href="/about/vice-chancellor/profile" className="inline-flex min-h-12 items-center rounded-full border border-border px-6 font-bold text-primary">Professional profile</Link></div></div></section>
      )}
    </PageShell>
  );
}
