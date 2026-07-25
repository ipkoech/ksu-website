import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const SECRET = process.env.REVALIDATION_SECRET || "ksu-research-revalidate";

// Maps admin resource keys to public research paths
const pathMap: Record<string, string[]> = {
  projects: ["/projects", "/projects/[slug]", "/", "/search"],
  publications: ["/publications", "/publications/[slug]", "/", "/search"],
  grants: ["/funding", "/funding/[slug]", "/", "/search"],
  innovations: ["/innovations", "/innovations/[slug]", "/", "/search"],
  partners: ["/partners", "/partners/[slug]", "/", "/search"],
  centers: ["/centers", "/centers/[slug]", "/"],
  programs: ["/programs", "/programs/[slug]", "/"],
  outputs: ["/outputs", "/outputs/[slug]", "/"],
  training: ["/training", "/training/[slug]", "/"],
  mentorship: ["/mentorship", "/mentorship/[slug]", "/"],
  scholarships: ["/scholarships", "/scholarships/[slug]", "/"],
  consultancies: ["/consultancies", "/consultancies/[slug]", "/"],
  endowments: ["/endowments", "/endowments/[slug]", "/"],
  events: ["/events", "/events/[slug]", "/"],
  news: ["/news", "/news/[slug]", "/"],
  sustainability: ["/sustainability", "/sustainability/[slug]", "/"],
  farms: ["/farm", "/farm/[slug]", "/"],
  guidelines: ["/guidelines", "/guidelines/[slug]", "/"],
  services: ["/services", "/services/[slug]", "/"],
  resources: ["/resources-tools", "/resources-tools/[slug]", "/"],
};

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.secret || body.secret !== SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resource = body.resource as string;
  const paths = pathMap[resource];

  if (!paths) {
    return NextResponse.json({ revalidated: false, error: `Unknown resource: ${resource}` }, { status: 400 });
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: true, paths });
}
