"use client";

import { useEffect, useMemo, useState } from "react";

function remainingTime(deadline: string) {
  const distance = Math.max(0, new Date(deadline).getTime() - Date.now());
  return {
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor((distance / 3_600_000) % 24),
    minutes: Math.floor((distance / 60_000) % 60),
    seconds: Math.floor((distance / 1_000) % 60),
  };
}

export function AdmissionsCountdown({ deadline }: { deadline: string }) {
  const initial = useMemo(() => remainingTime(deadline), [deadline]);
  const [remaining, setRemaining] = useState(initial);

  useEffect(() => {
    const update = () => setRemaining(remainingTime(deadline));
    update();
    const timer = window.setInterval(update, 1_000);
    return () => window.clearInterval(timer);
  }, [deadline]);

  const units = [
    ["Days", remaining.days],
    ["Hours", remaining.hours],
    ["Minutes", remaining.minutes],
    ["Seconds", remaining.seconds],
  ] as const;

  return (
    <dl className="grid grid-cols-4 gap-px overflow-hidden rounded-3xl bg-white/15">
      {units.map(([label, value]) => (
        <div key={label} className="bg-primary px-2 py-5 text-center sm:px-5">
          <dd className="font-[family-name:var(--font-display)] text-2xl font-normal tabular-nums text-white sm:text-4xl">
            {String(value).padStart(2, "0")}
          </dd>
          <dt className="mt-2 text-[0.6rem] font-bold uppercase tracking-wider text-white/55 sm:text-xs">
            {label}
          </dt>
        </div>
      ))}
    </dl>
  );
}
