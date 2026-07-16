import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { announcementsApi } from "@ksu/api-client";

export const metadata = {
  title: "Live",
  description: "Live events and broadcasts from Kisii University.",
};

export const dynamic = "force-dynamic";

function extractYoutubeId(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1);
    }
  } catch {
    // not a valid URL
  }
  return null;
}

export default async function LivePage() {
  let livestream: {
    title: string;
    youtubeUrl: string;
    videoId: string | null;
  } | null = null;

  try {
    const response = await announcementsApi.list({
      is_published: true,
      per_page: 5,
      fields: "id,title,slug,youtube_url",
    });

    const active = (response.data ?? []).find(
      (item) => item.youtube_url,
    );

    if (active?.youtube_url) {
      livestream = {
        title: active.title,
        youtubeUrl: active.youtube_url,
        videoId: extractYoutubeId(active.youtube_url),
      };
    }
  } catch {
    // livestream is optional
  }

  return (
    <PageShell>
      <article className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <BreadcrumbTrail
          items={[
            { label: "Home", href: "/" },
            { label: "Live" },
          ]}
        />

        <div className="mt-6">
          <p className="text-sm font-semibold uppercase text-secondary">Live</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            {livestream ? livestream.title : "Live events and broadcasts"}
          </h1>
        </div>

        {livestream?.videoId ? (
          <div className="mt-8">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-brand-overlay shadow-[0_20px_70px_-44px_rgba(15,23,42,0.55)]">
              <iframe
                src={`https://www.youtube.com/embed/${livestream.videoId}?autoplay=1&rel=0`}
                title={livestream.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
            {livestream.youtubeUrl ? (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                <a
                  href={livestream.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary hover:text-secondary"
                >
                  Watch on YouTube
                </a>
              </p>
            ) : null}
          </div>
        ) : (
          <div className="mt-10 rounded-xl border border-dashed border-border bg-surface-subtle px-6 py-16 text-center">
            <p className="text-lg font-semibold text-muted-foreground">
              No live broadcast is currently active.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              When a livestream is scheduled, the video will appear here.
              Check back during university events or follow the university
              on social media for broadcast announcements.
            </p>
          </div>
        )}
      </article>
    </PageShell>
  );
}
