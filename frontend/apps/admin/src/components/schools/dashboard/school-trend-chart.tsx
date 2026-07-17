import type { SchoolPortalDashboardResponse } from "@ksu/api-client";

type TrendPoint = SchoolPortalDashboardResponse["trends"][number];

export function SchoolTrendChart({ points }: { points: TrendPoint[] }) {
  if (points.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Activity will appear as school records change.
      </div>
    );
  }

  const width = 600;
  const height = 180;
  const max = Math.max(...points.map((point) => point.value), 1);
  const coordinates = points.map((point, index) => ({
    x: points.length === 1 ? width / 2 : (index / (points.length - 1)) * width,
    y: height - (point.value / max) * (height - 20) - 10,
  }));
  const path = coordinates
    .map(({ x, y }, index) => `${index === 0 ? "M" : "L"} ${x} ${y}`)
    .join(" ");
  const summary = `${points.length} periods. Highest activity ${max}. Latest activity ${points.at(-1)?.value ?? 0}.`;

  return (
    <figure className="space-y-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={summary}
        className="h-48 w-full overflow-visible"
        preserveAspectRatio="none"
      >
        <path
          d={`${path} L ${width} ${height} L 0 ${height} Z`}
          className="fill-primary/10"
        />
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
          className="text-primary"
        />
        {coordinates.map(({ x, y }, index) => (
          <circle
            key={points[index].bucket}
            cx={x}
            cy={y}
            r="4"
            className="fill-background stroke-primary"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <figcaption className="sr-only">{summary}</figcaption>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{points[0]?.bucket}</span>
        <span>{points.at(-1)?.bucket}</span>
      </div>
    </figure>
  );
}
