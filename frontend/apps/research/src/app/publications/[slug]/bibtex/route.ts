import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    const { data: publication } = await researchServiceApi.publications.getBySlug(
      slug,
      {
        fields: "id,title,slug,abstract,journal_name,publisher,volume,issue,pages,doi,year,publication_date,publication_type,authors,editors,issn,isbn,url",
      },
    );
    if (!publication) {
      return new Response("Publication not found", {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const pub = publication as unknown as ResearchGenericRecord;
    const authors = Array.isArray(pub.authors)
      ? (pub.authors as string[]).join(" and ")
      : "";

    const bibtexType = mapBibtexType(pub.publication_type);
    const bibtexKey = pub.slug || pub.id || "pub";
    const journal = pub.journal_name ?? pub.publisher ?? "";
    const year = pub.year ?? (
      pub.publication_date
        ? new Date(pub.publication_date as string).getFullYear()
        : ""
    );

    const bibtexLines = [
      `@${bibtexType}{${bibtexKey},`,
      `  author = {${authors}},`,
      `  title = {${pub.title ?? ""}},`,
      journal ? `  journal = {${journal}},` : "",
      year ? `  year = {${year}},` : "",
      pub.doi ? `  doi = {${pub.doi}},` : "",
      pub.volume ? `  volume = {${pub.volume}},` : "",
      pub.pages ? `  pages = {${pub.pages}},` : "",
      pub.publisher ? `  publisher = {${pub.publisher}},` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const bibtex = bibtexLines + "\n}";

    return new Response(bibtex, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${slug}.bib"`,
      },
    });
  } catch {
    return new Response("Error generating BibTeX", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

function mapBibtexType(type?: string | null): string {
  switch (type) {
    case "journal_article":
      return "article";
    case "conference_paper":
      return "inproceedings";
    case "book":
      return "book";
    case "book_chapter":
      return "incollection";
    case "thesis":
      return "phdthesis";
    case "report":
    case "policy_brief":
      return "techreport";
    default:
      return "misc";
  }
}
