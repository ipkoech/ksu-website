import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { announcementsApi } from "@ksu/api-client/server";
import {
  LiveBroadcast,
  type LiveBroadcastDto,
} from "@/components/public/live-broadcast";

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
  let livestream: LiveBroadcastDto | null = null;

  try {
    const response = await announcementsApi.list(
      {
        is_published: true,
        per_page: 5,
        fields: "id,title,slug,youtube_url",
      },
      // Livestream status must stay near-real-time; skip the default
      // 5-minute public data cache.
      { next: { revalidate: 30 } },
    );

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
          <LiveBroadcast livestream={livestream} />
        </div>
      </article>
    </PageShell>
  );
}
