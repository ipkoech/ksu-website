import { researchServiceApi } from "@ksu/api-client";
import { researchSiteUrl } from "../../../config/institution";

export async function GET() {
  try {
    const { data: articles } = await researchServiceApi.articles.list({
      per_page: 20,
      is_public: true,
      status: "published",
      is_active: true,
      sort: "published_at",
      order: "desc",
      fields: "id,title,slug,summary,published_at,author_name",
    });

    const items = (articles ?? [])
      .filter((article) => article.slug)
      .map((article) => {
        const link = `${researchSiteUrl}/news/${article.slug}`;
        const description = escapeXml(article.summary ?? "");
        const author = escapeXml(article.author_name ?? "");
        const pubDate = article.published_at
          ? new Date(article.published_at).toUTCString()
          : new Date().toUTCString();

        return [
          `<item>`,
          `  <title>${escapeXml(article.title ?? "Research article")}</title>`,
          `  <link>${escapeXml(link)}</link>`,
          description ? `  <description>${description}</description>` : "",
          author ? `  <author>${author}</author>` : "",
          `  <pubDate>${pubDate}</pubDate>`,
          `  <guid isPermaLink="true">${escapeXml(link)}</guid>`,
          `</item>`,
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n");

    const rss = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`,
      `<channel>`,
      `  <title>Kisii University Research News</title>`,
      `  <description>Research news, updates, and articles from Kisii University</description>`,
      `  <link>${researchSiteUrl}/news</link>`,
      `  <atom:link href="${researchSiteUrl}/news/feed.xml" rel="self" type="application/rss+xml"/>`,
      items,
      `</channel>`,
      `</rss>`,
    ].join("\n");

    return new Response(rss, {
      headers: { "Content-Type": "application/rss+xml" },
    });
  } catch {
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Kisii University Research News</title></channel></rss>`,
      { headers: { "Content-Type": "application/rss+xml" } },
    );
  }
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
