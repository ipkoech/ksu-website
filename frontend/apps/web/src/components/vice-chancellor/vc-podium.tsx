"use client";

import { useState } from "react";
import { CalendarDays, FileText, PlayCircle } from "lucide-react";
import { VcVideoPlayer } from "./vc-video-player";
import { VcSpeechDialog, type SpeechSummary } from "./vc-speech-dialog";

type PodiumItem = SpeechSummary & {
  is_featured?: boolean;
  embed_url?: string | null;
  thumbnail_url?: string | null;
  duration_seconds?: number | null;
  category?: string | null;
  recorded_at?: string | null;
  cover?: { url?: string | null } | null;
};

const shortDate = new Intl.DateTimeFormat("en-KE", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : shortDate.format(date);
}

/**
 * "From the podium": the featured recording, then every address as a row that
 * opens in place.
 *
 * Speeches used to be cards linking to their own route, which took the reader
 * off the page for something the hub already had the text of. Each row now
 * opens a dialog instead, and the standalone routes remain for direct links
 * and search engines.
 */
export function VcPodium({
  videos,
  speeches,
}: {
  videos: PodiumItem[];
  speeches: PodiumItem[];
}) {
  const [openSpeech, setOpenSpeech] = useState<SpeechSummary | null>(null);

  if (!videos.length && !speeches.length) return null;

  const featuredVideo =
    videos.find((item) => item.is_featured && item.embed_url) ||
    videos.find((item) => item.embed_url);

  return (
    <section
      id="vc-speeches"
      aria-labelledby="vc-podium-heading"
      className="scroll-mt-24 bg-primary py-14 text-white sm:py-18"
    >
      <div className="container">
        <h2
          id="vc-podium-heading"
          className="ksu-l-h2 font-normal"
        >
          From the podium
        </h2>
        <p className="ksu-l-small mt-3 max-w-[54ch] text-white/70">
          Addresses in the Vice-Chancellor&rsquo;s own words. Open any one to
          read it here, with the recording where there is one.
        </p>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,.9fr)]">
          <div className="min-w-0">
            {featuredVideo ? (
              <>
                <VcVideoPlayer
                  title={featuredVideo.title}
                  embedUrl={featuredVideo.embed_url}
                  posterUrl={
                    featuredVideo.cover?.url || featuredVideo.thumbnail_url
                  }
                  durationSeconds={featuredVideo.duration_seconds}
                  category={featuredVideo.category}
                  className="rounded-3xl"
                />
                <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
                  <h3 className="ksu-l-card min-w-0 font-normal">
                    {featuredVideo.title}
                  </h3>
                  {formatDate(featuredVideo.recorded_at) ? (
                    <p className="ksu-l-small text-white/60">
                      {formatDate(featuredVideo.recorded_at)}
                    </p>
                  ) : null}
                </div>
              </>
            ) : null}
          </div>

          {/* Every address, not a capped three: the dialog costs nothing per
              row and the list is short enough to show in full. */}
          <ul className="min-w-0 divide-y divide-white/15">
            {speeches.map((speech) => (
              <li key={speech.id}>
                <button
                  type="button"
                  onClick={() => setOpenSpeech(speech)}
                  className="group flex w-full min-h-11 items-start gap-4 py-4 text-left transition-colors duration-200 hover:text-[hsl(var(--gold-light))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <span className="mt-0.5 shrink-0 text-white/45 transition-colors group-hover:text-[hsl(var(--gold-light))]">
                    {speech.slug === featuredVideo?.slug ? (
                      <PlayCircle className="size-4" aria-hidden />
                    ) : (
                      <FileText className="size-4" aria-hidden />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="ksu-l-small block font-medium">
                      {speech.title}
                    </span>
                    <span className="ksu-l-small mt-1 flex flex-wrap items-center gap-x-3 text-white/55">
                      {formatDate(speech.delivered_at) ? (
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="size-3.5" aria-hidden />
                          {formatDate(speech.delivered_at)}
                        </span>
                      ) : null}
                      {speech.occasion ? <span>{speech.occasion}</span> : null}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <VcSpeechDialog
        speech={openSpeech}
        onClose={() => setOpenSpeech(null)}
      />
    </section>
  );
}

export default VcPodium;
