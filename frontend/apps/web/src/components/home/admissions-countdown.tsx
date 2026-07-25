"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const SECOND = 1000;

function secondsUntil(target: string) {
  const targetTime = new Date(target).getTime();
  if (Number.isNaN(targetTime)) return 0;
  return Math.max(Math.floor((targetTime - Date.now()) / SECOND), 0);
}

function countdownParts(totalSeconds: number) {
  return [
    { label: "Days", value: Math.floor(totalSeconds / 86400) },
    { label: "Hours", value: Math.floor((totalSeconds % 86400) / 3600) },
    { label: "Minutes", value: Math.floor((totalSeconds % 3600) / 60) },
    { label: "Seconds", value: totalSeconds % 60 },
  ];
}

function readableDeadline(target: string) {
  const deadline = new Date(target);
  if (Number.isNaN(deadline.getTime())) return null;
  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Africa/Nairobi",
  }).format(deadline);
}

export function AdmissionsCountdown({ target }: { target: string }) {
  const router = useRouter();
  const hasRefreshed = useRef(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const parts = useMemo(
    () => countdownParts(remainingSeconds),
    [remainingSeconds],
  );
  const deadline = useMemo(() => readableDeadline(target), [target]);

  useEffect(() => {
    const update = () => {
      const remaining = secondsUntil(target);
      setRemainingSeconds(remaining);
      if (remaining === 0 && !hasRefreshed.current) {
        hasRefreshed.current = true;
        router.refresh();
      }
      return remaining;
    };

    hasRefreshed.current = false;
    if (update() === 0) return;
    const timer = window.setInterval(() => {
      if (update() === 0) window.clearInterval(timer);
    }, SECOND);
    return () => window.clearInterval(timer);
  }, [router, target]);

  return (
    <div>
      {deadline ? (
        <p className="sr-only">Applications close on {deadline}.</p>
      ) : null}
      <div
        className="grid grid-cols-4 gap-2"
        aria-hidden="true"
        data-testid="admissions-countdown"
      >
        {parts.map((part) => (
          <div key={part.label} className="text-center">
            <span className="block text-2xl font-bold tabular-nums text-white sm:text-3xl">
              {String(part.value).padStart(2, "0")}
            </span>
            <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-white/70">
              {part.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
