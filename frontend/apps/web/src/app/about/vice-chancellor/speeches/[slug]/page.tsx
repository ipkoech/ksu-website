import { CalendarDays, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { VcVideoPlayer } from "@/components/vice-chancellor/vc-video-player";
import { getPublicVcSpeech } from "@/lib/vice-chancellor-data";

export default async function ViceChancellorSpeechPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const speech = await getPublicVcSpeech(slug);
  if (!speech) notFound();
  const date = speech.delivered_at
    ? new Intl.DateTimeFormat("en-KE", { dateStyle: "long" }).format(
        new Date(speech.delivered_at),
      )
    : null;
  const body =
    speech.plain_text ||
    speech.rich_text ||
    speech.summary ||
    "The full text of this address will be available soon.";
  return (
    <PageShell>
      <article>
        <header className="bg-primary text-white">
          <div className="container py-6">
            <BreadcrumbTrail
              items={[
                { label: "Home", href: "/" },
                { label: "Meet the VC", href: "/about/vice-chancellor" },
                { label: "Speeches", href: "/about/vice-chancellor#speeches" },
                { label: speech.title },
              ]}
            />
          </div>
          <div className="container max-w-5xl pb-16 pt-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
              {speech.speech_type || "Speech"}
            </p>
            <h1 className="mt-5 font-[family-name:var(--font-display)] text-5xl font-semibold leading-tight sm:text-6xl">
              {speech.title}
            </h1>
            {speech.summary ? (
              <p className="mt-6 max-w-3xl text-xl leading-8 text-white/75">
                {speech.summary}
              </p>
            ) : null}
            <div className="mt-7 flex flex-wrap gap-5 text-sm text-white/75">
              {date ? (
                <span className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-secondary" />
                  {date}
                </span>
              ) : null}
              {speech.venue ? (
                <span className="flex items-center gap-2">
                  <MapPin className="size-4 text-secondary" />
                  {speech.venue}
                </span>
              ) : null}
            </div>
          </div>
        </header>
        <div className="container max-w-4xl py-16">
          {speech.videos?.length ? (
            <section aria-labelledby="recordings-heading" className="mb-12">
              <h2
                id="recordings-heading"
                className="mb-5 font-[family-name:var(--font-display)] text-3xl font-semibold"
              >
                Watch this address
              </h2>
              <div className="space-y-8">
                {speech.videos.map((video) => (
                  <VcVideoPlayer
                    key={video.id}
                    title={video.title}
                    embedUrl={video.embed_url}
                    posterUrl={video.thumbnail_url}
                  />
                ))}
              </div>
            </section>
          ) : null}
          <div className="whitespace-pre-line text-lg leading-9 text-foreground">
            {body}
          </div>
          {speech.audience || speech.occasion ? (
            <footer className="mt-12 border-t border-border pt-7 text-sm text-muted-foreground">
              {speech.occasion ? (
                <p>
                  <strong className="text-foreground">Occasion:</strong>{" "}
                  {speech.occasion}
                </p>
              ) : null}
              {speech.audience ? (
                <p className="mt-2">
                  <strong className="text-foreground">Audience:</strong>{" "}
                  {speech.audience}
                </p>
              ) : null}
            </footer>
          ) : null}
        </div>
      </article>
    </PageShell>
  );
}
