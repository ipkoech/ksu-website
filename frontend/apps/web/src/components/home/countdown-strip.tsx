"use client";

import { useEffect, useMemo, useState } from "react";

function secondsUntil(deadline: string) {
  const target = new Date(deadline);
  if (Number.isNaN(target.getTime())) return 0;
  return Math.max(Math.floor((target.getTime() - Date.now()) / 1000), 0);
}

function countdownParts(totalSeconds: number) {
  return [
    { label: "Days", value: Math.floor(totalSeconds / 86400) },
    { label: "Hours", value: Math.floor((totalSeconds % 86400) / 3600) },
    { label: "Minutes", value: Math.floor((totalSeconds % 3600) / 60) },
    { label: "Seconds", value: totalSeconds % 60 },
  ];
}

export function CountdownStrip({
  title,
  deadline,
  deadlineLabel,
  compact = false,
}: {
  title: string;
  deadline: string;
  deadlineLabel: string;
  compact?: boolean;
}) {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const items = useMemo(
    () => countdownParts(remainingSeconds),
    [remainingSeconds],
  );

  useEffect(() => {
    setRemainingSeconds(secondsUntil(deadline));
    const timer = window.setInterval(() => {
      setRemainingSeconds(secondsUntil(deadline));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [deadline]);

  return (
    <div className={`${compact ? "p-3" : "p-5"} bg-secondary text-white`}>
      <p className="font-[family-name:var(--font-display)] text-xl font-bold">
        {title}
      </p>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="border-r border-white/30 text-center last:border-r-0"
          >
            <span
              className={`block font-bold text-white ${compact ? "text-lg" : "text-3xl"}`}
            >
              {String(item.value).padStart(2, "0")}
            </span>
            <span className="mt-1 block text-[11px] font-semibold text-white/90">
              {item.label}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs font-semibold text-white/90">
        Application deadline: {deadlineLabel}
      </p>
    </div>
  );
}
