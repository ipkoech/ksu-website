import { notFound } from "next/navigation";
import { ResearchRecordDetail } from "../../../components/research-detail";
import { getArticleBySlug, getNewsBySlug } from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  const record = article.data ? article : await getNewsBySlug(slug);
  const { data, error } = record;
  if (!data) notFound();

  return (
    <ResearchRecordDetail
      record={data}
      error={error}
      eyebrow="Research Update"
      fallbackTitle="Research update"
      fallbackBody="Content record loaded from the Research service."
      backLabel="News"
      backHref="/news"
      labelFields={["article_type", "news_type", "category", "status"]}
      factFields={[
        { label: "Published", field: "published_at", format: "date" },
        { label: "Author", field: "author_name" },
      ]}
      sections={[
        { title: "Summary", fields: ["summary", "excerpt"] },
        { title: "Content", fields: ["content", "body"] },
      ]}
    />
  );
}
