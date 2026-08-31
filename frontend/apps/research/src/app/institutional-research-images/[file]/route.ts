import { readFile } from "node:fs/promises";
import path from "node:path";

const OFFICIAL_RESEARCH_IMAGES = new Set([
  "KSUGreenLandscapingWithoutWMJuly2026-3834.jpg",
  "KSUGreenLandscapingWithoutWMJuly2026-3835.jpg",
  "KSUGreenLandscapingWithoutWMJuly2026-3942.jpg",
  "KSUGreenLandscapingWithoutWMJuly2026-3943.jpg",
  "KSUGreenLandscapingWithoutWMJuly2026-3944.jpg",
  "KSUGreenLandscapingWithoutWMJuly2026-3945.jpg",
  "KSUGreenLandscapingWithoutWMJuly2026-3976.jpg",
  "KSUGreenLandscapingWithoutWMJuly2026-7606.jpg",
  "KSUGreenLandscapingWithoutWMJuly2026-9057.jpg",
  "KSUGreenLandscapingWithoutWMJuly2026-9665.jpg",
  "KSUGreenLandscapingWithoutWMJuly2026-9735.jpg",
  "KSUInnovationWeek2025,April7,2026-7938.jpg",
  "KSUInnovationWeek2025,April7,2026-7968 (1).jpg",
  "KSUInnovationWeek2025,April7,2026-7968.jpg",
  "KSUInnovationWeek2025,April7,2026-7982.jpg",
  "KSUInnovationWeek2025,April7,2026-8034.jpg",
  "KSUInnovationWeek2025,April7,2026-8198.jpg",
  "KSUInnovationWeek2025,April7,2026-8210.jpg",
  "KSUInnovationWeek2025,April7,2026-8234.jpg",
  "KSUInnovationWeek2025,April7,2026-8246.jpg",
  "KSUInnovationWeek2025,April7,2026-8285.jpg",
  "VC25thJune2026-4415.jpg",
  "research-header.jpg",
  "research-header1.jpg",
  "research-header2.jpg",
]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;

  if (!OFFICIAL_RESEARCH_IMAGES.has(file)) {
    return new Response("Image not found", { status: 404 });
  }

  try {
    const imagePath = path.resolve(
      process.cwd(),
      "../../public/images/research",
      file,
    );
    const image = await readFile(imagePath);

    return new Response(image, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new Response("Image not found", { status: 404 });
  }
}
