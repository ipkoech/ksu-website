"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarDays, Loader2, MapPin, X } from "lucide-react";
import { VcVideoPlayer } from "./vc-video-player";

export interface SpeechSummary {
  id: string;
  slug?: string | null;
  title: string;
  summary?: string | null;
  plain_text?: string | null;
  rich_text?: string | null;
  occasion?: string | null;
  venue?: string | null;
  audience?: string | null;
  delivered_at?: string | null;
}

type SpeechVideo = {
  title: string;
  embed_url?: string | null;
  thumbnail_url?: string | null;
  duration_seconds?: number | null;
  category?: string | null;
  role?: string | null;
};

const longDate = new Intl.DateTimeFormat("en-KE", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : longDate.format(date);
}

/**
 * A speech, read in place.
 *
 * The list payload already carries the full text, so the address renders the
 * instant the dialog opens. Only the recording has to be fetched, because
 * videos are attached on the detail route: it arrives a moment later and
 * slots in above the transcript. Speeches with no recording simply never show
 * a player rather than holding an empty frame.
 */
export function VcSpeechDialog({
  speech,
  onClose,
}: {
  speech: SpeechSummary | null;
  onClose: () => void;
}) {
  const [video, setVideo] = useState<SpeechVideo | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Whatever had focus before the dialog opened, so it can be handed back.
  const returnFocusRef = useRef<Element | null>(null);

  const open = speech !== null;

  useEffect(() => {
    if (!open || !speech) {
      setVideo(null);
      return;
    }
    if (!speech.slug) {
      // No slug means no detail route to ask, so there is no recording to
      // wait for — show the text alone rather than a spinner that never ends.
      setVideo(null);
      setLoadingVideo(false);
      return;
    }
    let cancelled = false;
    setLoadingVideo(true);
    setVideo(null);
    fetch(`/api/vc-speech/${encodeURIComponent(speech.slug)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (cancelled) return;
        const first = payload?.videos?.[0] ?? null;
        setVideo(first);
      })
      .catch(() => {
        // A missing recording is not an error worth showing: the address
        // itself is already on screen and readable.
        if (!cancelled) setVideo(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingVideo(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, speech]);

  // Lock the page behind the dialog, trap Tab inside it, and restore focus.
  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      (returnFocusRef.current as HTMLElement | null)?.focus?.();
    };
  }, [open, onClose]);

  const onBackdrop = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget) onClose();
    },
    [onClose],
  );

  if (!open || !speech) return null;

  const delivered = formatDate(speech.delivered_at);
  const meta = [speech.occasion, speech.venue].filter(Boolean).join(" · ");

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-brand-overlay/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={onBackdrop}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="vc-speech-title"
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[88vh] sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-brand-overlay/10 p-5 sm:p-6">
          <div className="min-w-0">
            <h2
              id="vc-speech-title"
              className="ksu-l-card font-normal text-brand-overlay"
            >
              {speech.title}
            </h2>
            <p className="ksu-l-small mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-brand-overlay/60">
              {delivered ? (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" aria-hidden />
                  {delivered}
                </span>
              ) : null}
              {meta ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5" aria-hidden />
                  {meta}
                </span>
              ) : null}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close speech"
            className="flex size-11 shrink-0 items-center justify-center rounded-full text-brand-overlay/60 transition-colors hover:bg-[hsl(var(--primary-soft))] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          {loadingVideo ? (
            <div className="mb-6 flex aspect-video items-center justify-center rounded-2xl bg-[hsl(var(--surface-band))]">
              <Loader2
                className="size-5 animate-spin text-brand-overlay/40"
                aria-hidden
              />
              <span className="sr-only">Checking for a recording</span>
            </div>
          ) : video?.embed_url ? (
            <VcVideoPlayer
              title={video.title || speech.title}
              embedUrl={video.embed_url}
              posterUrl={video.thumbnail_url}
              durationSeconds={video.duration_seconds}
              category={video.category}
              className="mb-6 rounded-2xl"
            />
          ) : null}

          {speech.summary ? (
            <p className="ksu-l-card mb-5 font-normal text-brand-overlay/85">
              {speech.summary}
            </p>
          ) : null}

          {speech.rich_text ? (
            <div
              className="ksu-speech-body text-brand-overlay/80"
              // The body is editor-authored rich text from the university's
              // own CMS, sanitised server-side before it is stored.
              dangerouslySetInnerHTML={{ __html: speech.rich_text }}
            />
          ) : speech.plain_text ? (
            <div className="space-y-4 text-brand-overlay/80">
              {speech.plain_text
                .split(/\n{2,}/)
                .filter(Boolean)
                .map((para, index) => (
                  <p key={index}>{para}</p>
                ))}
            </div>
          ) : null}

          {speech.audience ? (
            <p className="ksu-l-small mt-6 border-t border-brand-overlay/10 pt-4 text-brand-overlay/55">
              Delivered to: {speech.audience}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default VcSpeechDialog;
