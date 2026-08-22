import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Story } from "@ksu/api-client";
import { CampusPageHeader } from "@ksu/ui/components";
import { AboutReveal } from "@/components/about/about-reveal";
import { hubForCategory } from "@/components/campus-life/story-hubs";

/**
 * One story, set the way its source document is written.
 *
 * The seeder records each block of the original Word document with its type, so
 * a section heading is published as a heading and a bulleted list as a list
 * rather than as more running prose. Where a record predates that (only
 * `plain_text`), the body falls back to splitting on blank lines. Measure is
 * held near 68 characters; the page has one job and it is reading.
 */

type StoryBlock = { type: "heading" | "list_item" | "paragraph"; text: string };

function storyBlocks(story: Story): StoryBlock[] {
  const stored = (story.structured_content as { blocks?: unknown } | null)
    ?.blocks;

  const blocks: StoryBlock[] = Array.isArray(stored)
    ? stored
        .map((entry) => {
          const item = entry as { type?: unknown; text?: unknown };
          const text = typeof item.text === "string" ? item.text.trim() : "";
          const type =
            item.type === "heading" || item.type === "list_item"
              ? item.type
              : "paragraph";
          return { type, text } as StoryBlock;
        })
        .filter((block) => block.text)
    : (story.plain_text ?? "")
        .split(/\n\s*\n|\r\n\s*\r\n/)
        .map((text) => ({
          type: "paragraph" as const,
          text: text.replace(/\s+/g, " ").trim(),
        }))
        .filter((block) => block.text);

  return blocks;
}

/**
 * How to open the story: with a standfirst, or straight into the body.
 *
 * Each seeded summary is the story's own first paragraph, cut at roughly 500
 * characters. Printing both would set the same words twice, so one has to go —
 * and which one depends on whether the cut lost anything. An intact summary
 * becomes the standfirst and the body starts at the second paragraph; a
 * truncated one is dropped entirely, because keeping it would either duplicate
 * the opening or hide the tail of it from the page.
 */
function openingFor(story: Story, blocks: StoryBlock[]) {
  const raw = (story.summary ?? "").replace(/\s+/g, " ").trim();
  const truncated = /[.…]{2,3}$/.test(raw) || raw.endsWith("…");
  const summary = raw.replace(/\s*[.…]{1,3}\s*$/, "");
  const first = blocks[0];
  const repeatsOpening =
    summary.length > 40 &&
    first?.type === "paragraph" &&
    first.text.startsWith(summary);

  if (repeatsOpening && !truncated) {
    return { standfirst: raw, body: blocks.slice(1) };
  }
  if (repeatsOpening) {
    // The full paragraph leads instead; nothing is lost and nothing repeats.
    return { standfirst: null, body: blocks };
  }
  return { standfirst: raw || null, body: blocks };
}

/**
 * The body, set block by block.
 *
 * Consecutive list items are gathered into one list so a bulleted run reads as
 * a list rather than as a column of stray sentences. Headings take the house
 * display face at regular weight, matching the section headings used elsewhere
 * on the site.
 */
function StoryBody({ blocks }: { blocks: StoryBlock[] }) {
  const rendered: React.ReactNode[] = [];
  let index = 0;

  while (index < blocks.length) {
    const block = blocks[index];

    if (block.type === "list_item") {
      const items: string[] = [];
      while (index < blocks.length && blocks[index].type === "list_item") {
        items.push(blocks[index].text);
        index += 1;
      }
      rendered.push(
        <ul key={`list-${index}`} className="mt-6 grid gap-3">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-3.5">
              <span
                aria-hidden
                className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary"
              />
              <span className="text-base leading-8 text-muted-foreground">
                {item}
              </span>
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (block.type === "heading") {
      rendered.push(
        <h2
          key={`h-${index}`}
          className="mt-11 font-[family-name:var(--font-display)] text-2xl font-normal leading-snug tracking-tight text-primary"
        >
          {block.text}
        </h2>,
      );
    } else {
      rendered.push(
        <p
          key={`p-${index}`}
          className="mt-6 text-base leading-8 text-muted-foreground"
        >
          {block.text}
        </p>,
      );
    }
    index += 1;
  }

  return <>{rendered}</>;
}

/**
 * Three more stories to read, nearest first.
 *
 * Stories sharing this one's category lead, because a reader who finished a
 * leadership story is most likely to want another; the rest fill the row so the
 * section is never half-empty.
 */
function relatedStories(story: Story, all: Story[]) {
  const others = all.filter((item) => item.slug !== story.slug);
  const sameCategory = others.filter(
    (item) => item.category && item.category === story.category,
  );
  const rest = others.filter((item) => !sameCategory.includes(item));
  return [...sameCategory, ...rest].slice(0, 3);
}

export function StoryReader({
  story,
  stories = [],
}: {
  story?: Story | null;
  stories?: Story[];
}) {
  if (!story) {
    return (
      <div className="bg-surface text-foreground">
        <CampusPageHeader
          seed="/campus-life"
          variant="default"
          titleWeight="normal"
          eyebrow="Campus Life Stories"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Campus Life", href: "/campus-life" },
            { label: "Story not found" },
          ]}
          title="Story not found"
          description="This story may have been unpublished or moved."
        />
        <section className="px-5 py-14 sm:px-8 lg:px-16 lg:py-16 xl:px-20">
          <div className="mx-auto w-full max-w-7xl">
            <Link
              href="/campus-life"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to campus life
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const hub = hubForCategory(story.category);
  const { standfirst, body } = openingFor(story, storyBlocks(story));
  const more = relatedStories(story, stories);
  // Two of the source documents carry a real byline. The rest are authored by
  // the university, which the header does not need to state.
  const byline =
    story.show_contributor_name &&
    story.contributor_name_snapshot &&
    story.contributor_name_snapshot !== "Kisii University"
      ? story.contributor_name_snapshot
      : null;

  return (
    <div className="bg-surface text-foreground">
      <CampusPageHeader
        seed="/campus-life"
        variant="feature"
        titleWeight="normal"
        eyebrow={story.category ?? "Campus Life"}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Campus Life", href: "/campus-life" },
          ...(story.category ? [{ label: story.category }] : []),
          { label: story.title },
        ]}
        title={story.title}
        description={[
          byline ? `By ${byline}` : null,
          typeof story.reading_minutes === "number" && story.reading_minutes > 0
            ? `${story.reading_minutes} min read`
            : null,
        ]
          .filter(Boolean)
          .join("  ·  ")}
      />

      <article className="border-b border-primary/10 px-5 py-14 sm:px-8 lg:px-16 lg:py-16 xl:px-20">
        {/* The reading column is centred rather than pinned left: a 68ch measure
            inside a 7xl container otherwise leaves half the page empty. */}
        <AboutReveal className="mx-auto w-full max-w-[68ch]" variant="up">
          <div>
            {standfirst ? (
              <p className="border-l-2 border-secondary pl-5 font-[family-name:var(--font-display)] text-xl font-normal leading-[1.5] tracking-tight text-primary">
                {standfirst}
              </p>
            ) : null}
            <StoryBody blocks={body} />
          </div>

          <div className="mt-12 border-t border-border pt-6">
            <Link
              href="/campus-life#stories"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              More campus life stories
            </Link>
          </div>
        </AboutReveal>
      </article>

      {more.length > 0 ? (
        <section className="bg-white px-5 py-14 sm:px-8 lg:px-16 lg:py-16 xl:px-20">
          <AboutReveal className="mx-auto w-full max-w-7xl" variant="scale">
            <div className="flex flex-col gap-5 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-normal tracking-tight text-primary">
                Keep <em className="italic">reading</em>
              </h2>
              <Link
                href="/campus-life#stories"
                className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary hover:underline"
              >
                All stories <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <ul className="grid md:grid-cols-3">
              {more.map((item) => (
                <li
                  key={item.id}
                  className="border-b border-border md:border-r md:last:border-r-0"
                >
                  <Link
                    href={`/campus-life/stories/${item.slug}`}
                    className="flex h-full flex-col px-3 py-6 first:pl-0 transition-colors duration-200 hover:bg-primary/[0.04]"
                  >
                    {item.category ? (
                      <span className="text-[0.68rem] font-bold uppercase tracking-wider text-secondary">
                        {item.category}
                      </span>
                    ) : null}
                    <span className="mt-2 font-[family-name:var(--font-display)] text-lg font-normal leading-snug tracking-tight text-primary">
                      {item.title}
                    </span>
                    {typeof item.reading_minutes === "number" &&
                    item.reading_minutes > 0 ? (
                      <span className="mt-2 text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">
                        {item.reading_minutes} min read
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </AboutReveal>
        </section>
      ) : null}
    </div>
  );
}

export default StoryReader;
