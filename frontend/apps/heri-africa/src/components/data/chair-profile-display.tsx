"use client";

export function ChairAboutDisplay({ about }: { about: string }) {
  return (
    <p className="mt-5 text-base leading-7 text-slate-600" data-server-data-display="heri-chair-about">
      {about}
    </p>
  );
}

export function ChairVisionDisplay({ vision }: { vision: string }) {
  return (
    <p className="mt-5 text-sm leading-6 text-slate-600" data-server-data-display="heri-chair-vision">
      {vision}
    </p>
  );
}

export function ChairMissionDisplay({ mission }: { mission: string }) {
  return (
    <p className="mt-5 text-sm leading-6 text-slate-600" data-server-data-display="heri-chair-mission">
      {mission}
    </p>
  );
}
