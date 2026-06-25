import Link from "next/link";
import { Search } from "lucide-react";
import { ListPagination, pageFromSearchParams } from "@ksu/ui/components";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { getMediaDeskListingData, mediaUrl } from "@/lib/content-page-data";

export const metadata = {
  title: "Gallery",
  description: "Published image, video, and file records from the Kisii University media library.",
};

const gallerySpanPattern = [
  "sm:col-span-1 sm:row-span-2 md:col-span-1 md:row-span-3",
  "sm:col-span-2 sm:row-span-2 md:col-span-2 md:row-span-2",
  "sm:col-span-2 sm:row-span-2 md:col-span-1 md:row-span-3",
  "sm:col-span-1 sm:row-span-2 md:col-span-2 md:row-span-2",
  "sm:col-span-1 sm:row-span-2 md:col-span-1 md:row-span-3",
  "sm:col-span-2 sm:row-span-2 md:col-span-2 md:row-span-2",
];

const PER_PAGE = 24;

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const page = pageFromSearchParams(query);
  const data = await getMediaDeskListingData("gallery", [], query, page);

  const records = data.records.filter(
    (record) => record.contentKind === "media",
  );

  const searchHref = data.filters.q
    ? `/media/gallery?q=${encodeURIComponent(data.filters.q)}`
    : "/media/gallery";

  return (
    <PageShell>
      <article className="mx-auto max-w-[1680px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <BreadcrumbTrail items={[
          { label: "Home", href: "/" },
          { label: "Media Desk", href: "/media" },
          { label: "Gallery" },
        ]} />

        <div className="mt-6">
          <p className="text-sm font-semibold uppercase text-secondary">Gallery</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
            Published gallery
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Image, video, and file records from the public media library.
          </p>
        </div>

        <div className="mt-6">
          <form action="/media/gallery" className="relative max-w-md">
            <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              name="q"
              defaultValue={data.filters.q}
              placeholder="Search gallery records"
              autoComplete="off"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-950 outline-none ring-primary/20 transition placeholder:text-slate-400 focus:border-primary focus:ring-4"
            />
          </form>
        </div>

        {records.length === 0 ? (
          <div className="mt-10 rounded-lg border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
            <Search aria-hidden className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-4 text-sm font-semibold text-slate-600">
              No gallery records found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try a different search term or browse unfiltered.
            </p>
            <Link
              href="/media/gallery"
              className="mt-4 inline-flex min-h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-primary hover:bg-blue-50"
            >
              Clear search
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8 grid auto-rows-[200px] grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {records.map((record, index) => {
                const url = mediaUrl(record);
                const isImage =
                  record.media_type === "image" ||
                  record.mime_type?.startsWith("image/");
                const title =
                  record.title ||
                  record.original_filename ||
                  record.filename ||
                  record.id;

                return (
                  <Link
                    key={record.id}
                    href={`/media/gallery/${record.id}`}
                    className={`${gallerySpanPattern[index % gallerySpanPattern.length]} group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm transition hover:shadow-md`}
                  >
                    {isImage && url ? (
                      <>
                        <img
                          src={url}
                          alt={record.alt_text || title}
                          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/55 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="line-clamp-2 text-xs font-semibold text-white drop-shadow">
                            {title}
                          </p>
                          {record.media_type ? (
                            <p className="mt-0.5 text-[10px] font-medium uppercase text-white/70">
                              {record.media_type}
                            </p>
                          ) : null}
                        </div>
                      </>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                        <span className="text-xl text-slate-400">{isImage ? "🖼" : "📄"}</span>
                        <p className="mt-2 line-clamp-2 text-xs font-semibold text-slate-700">
                          {title}
                        </p>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>

            <ListPagination
              page={page}
              totalPages={Math.ceil(data.total / PER_PAGE)}
              total={data.total}
              perPage={PER_PAGE}
              baseHref={searchHref}
              className="mt-8"
            />
          </>
        )}
      </article>
    </PageShell>
  );
}
