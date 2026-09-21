"use client";

export type LiveBroadcastDto = {
  title: string;
  youtubeUrl: string;
  videoId: string | null;
};

export function LiveBroadcast({ livestream }: { livestream: LiveBroadcastDto | null }) {
  return (
    <div data-server-data-display="web-live-broadcast">
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-foreground sm:text-5xl">{livestream ? livestream.title : "Live events and broadcasts"}</h1>
      {livestream?.videoId ? (
        <div className="mt-8">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-brand-overlay shadow-[0_20px_70px_-44px_rgba(15,23,42,0.55)]"><iframe src={`https://www.youtube.com/embed/${livestream.videoId}?autoplay=1&rel=0`} title={livestream.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 h-full w-full" /></div>
          <p className="mt-4 text-center text-sm text-muted-foreground"><a href={livestream.youtubeUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:text-secondary">Watch on YouTube</a></p>
        </div>
      ) : (
        <div className="mt-10 rounded-xl border border-dashed border-border bg-surface-subtle px-6 py-16 text-center"><p className="text-lg font-semibold text-muted-foreground">No live broadcast is currently active.</p><p className="mt-2 text-sm text-muted-foreground">When a livestream is scheduled, the video will appear here. Check back during university events or follow the university on social media for broadcast announcements.</p></div>
      )}
    </div>
  );
}
