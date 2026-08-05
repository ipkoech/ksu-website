"use client";

import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { useEffect, useState } from "react";
import vcOfficial from "../../../../../public/images/vc/vc-official.jpg";

const heroTitle = "Meet Our Vice Chancellor";
const heroStatement =
  "Step inside the work of the Vice Chancellor. From decisions made at his desk to conversations shaping the University’s future.";

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return reducedMotion;
}

function useTypedText(
  text: string,
  {
    delay,
    speed,
    reducedMotion,
  }: { delay: number; speed: number; reducedMotion: boolean },
) {
  const [characterCount, setCharacterCount] = useState(0);

  useEffect(() => {
    if (reducedMotion) {
      setCharacterCount(text.length);
      return;
    }

    setCharacterCount(0);
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = window.setTimeout(() => {
      interval = setInterval(() => {
        setCharacterCount((current) => {
          if (current >= text.length) {
            if (interval) clearInterval(interval);
            return current;
          }
          return current + 1;
        });
      }, speed);
    }, delay);

    return () => {
      window.clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [delay, reducedMotion, speed, text]);

  return text.slice(0, characterCount);
}

function ReservedTypedText({
  text,
  typedText,
  className,
}: {
  text: string;
  typedText: string;
  className: string;
}) {
  const isTyping = typedText.length < text.length;

  return (
    <span className={`relative block ${className}`} aria-label={text}>
      <span className="invisible block" aria-hidden>
        {text}
      </span>
      <span className="absolute inset-0 hidden motion-reduce:block" aria-hidden>
        {text}
      </span>
      <span className="absolute inset-0 block motion-reduce:hidden" aria-hidden>
        {typedText}
        {isTyping ? (
          <span className="ml-1 inline-block h-[0.82em] w-[2px] animate-pulse bg-secondary align-baseline" />
        ) : null}
      </span>
    </span>
  );
}

export function VcHero({
  professionalProfileUrl,
  hasWelcomeVideo,
}: {
  professionalProfileUrl: string;
  hasWelcomeVideo: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const typedTitle = useTypedText(heroTitle, {
    delay: 180,
    speed: 58,
    reducedMotion,
  });
  const statementDelay = reducedMotion ? 0 : 180 + heroTitle.length * 58 + 260;
  const typedStatement = useTypedText(heroStatement, {
    delay: statementDelay,
    speed: 16,
    reducedMotion,
  });
  const animationComplete =
    reducedMotion || typedStatement.length === heroStatement.length;

  return (
    <section className="relative isolate min-h-[560px] overflow-hidden bg-slate-950 text-white sm:min-h-[590px] lg:min-h-[620px]">
      <Image
        src={vcOfficial}
        alt="The Vice Chancellor working at his desk"
        fill
        priority
        placeholder="blur"
        sizes="100vw"
        className="object-cover object-[74%_center] sm:object-[68%_center] lg:object-center"
      />

      <div className="relative flex min-h-[560px] w-full items-center px-4 py-10 sm:min-h-[590px] sm:px-7 lg:min-h-[620px] lg:px-10">
        <div className="max-w-[630px] [text-shadow:0_2px_18px_rgba(0,0,0,.95),0_1px_3px_rgba(0,0,0,1)]">
          <h1>
            <ReservedTypedText
              text={heroTitle}
              typedText={typedTitle}
              className="font-[family-name:var(--font-display)] text-5xl font-semibold leading-[0.95] sm:text-6xl lg:text-7xl"
            />
          </h1>

          <ReservedTypedText
            text={heroStatement}
            typedText={typedStatement}
            className="mt-7 max-w-[590px] text-base font-medium leading-7 text-white sm:text-lg sm:leading-8"
          />

          <div
            className={`mt-9 flex flex-wrap gap-3 transition duration-500 motion-reduce:!translate-y-0 motion-reduce:!opacity-100 motion-reduce:transition-none ${
              animationComplete
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-2 opacity-0"
            }`}
          >
            {hasWelcomeVideo ? (
              <a
                href="#vc-story"
                className="inline-flex min-h-12 items-center gap-3 bg-secondary px-6 font-bold text-secondary-foreground shadow-lg transition-colors duration-200 hover:bg-white hover:text-primary active:scale-[0.98]"
              >
                <span className="grid size-6 place-items-center rounded-full bg-primary text-white">
                  <Play className="ml-0.5 size-3.5 fill-current" aria-hidden />
                </span>
                Watch the welcome
              </a>
            ) : null}
            <Link
              href={professionalProfileUrl}
              className="inline-flex min-h-12 items-center border border-white bg-black/35 px-6 font-semibold text-white shadow-lg transition-colors duration-200 hover:bg-white hover:text-primary active:scale-[0.98]"
            >
              Professional profile
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
