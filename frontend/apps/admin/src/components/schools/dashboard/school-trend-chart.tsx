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
  const max = Math.max(...points.flatMap((point) => [point.value, point.visitors]), 1);
  const coordinates = points.map((point, index) => ({
    x: points.length === 1 ? width / 2 : (index / (points.length - 1)) * width,
    y: height - (point.value / max) * (height - 20) - 10,
  }));
  const path = coordinates
    .map(({ x, y }, index) => `${index === 0 ? "M" : "L"} ${x} ${y}`)
    .join(" ");
  const summary = `${points.length} periods. Highest page-view activity ${Math.max(...points.map((point) => point.value), 0)}. Latest unique visitors ${points.at(-1)?.visitors ?? 0}.`;
  const barWidth = Math.max(4, Math.min(18, width / Math.max(points.length, 1) / 2));

  return (
    <figure className="space-y-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={summary}
        className="h-48 w-full overflow-visible"
        preserveAspectRatio="none"
      >
        {points.map((point, index) => {
          const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
          const barHeight = (point.visitors / max) * (height - 20);
          return (
            <rect
              key={`${point.bucket}-visitors`}
              x={x - barWidth / 2}
              y={height - barHeight}
              width={barWidth}
              height={barHeight}
              rx="2"
              className="fill-amber-400/70"
            />
          );
        })}
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
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>{new Date(points[0]?.bucket).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
        <span className="flex flex-wrap items-center justify-center gap-3">
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" /> Page views</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-amber-400" /> Visitors</span>
        </span>
        <span>{new Date(points.at(-1)?.bucket ?? "").toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
      </div>
    </figure>
  );
}
