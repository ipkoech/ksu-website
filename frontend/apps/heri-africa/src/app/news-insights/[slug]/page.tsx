import { notFound } from "next/navigation";
import { SiteShell } from "../../../components/site-shell";
import { getNews } from "../../../lib/api";

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const article = (await getNews().catch(() => [])).find((item) => item.slug === slug); if (!article) notFound(); return <SiteShell><main className="mx-auto max-w-4xl px-6 py-20"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-heri-teal">News & insights</p><h1 className="mt-4 text-5xl font-semibold text-heri-blue">{article.title}</h1><p className="mt-8 text-lg leading-8 text-heri-ink/75">{article.excerpt}</p></main></SiteShell>; }
