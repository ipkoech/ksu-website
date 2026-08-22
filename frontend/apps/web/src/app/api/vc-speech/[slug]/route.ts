import { NextResponse } from "next/server";
import { getPublicVcSpeech } from "@/lib/vice-chancellor-data";

export const dynamic = "force-dynamic";

/**
 * A single speech, for the in-page dialog.
 *
 * The hub's list payload carries every speech's text but not its recordings:
 * videos are only attached on the detail route. This proxies that one record
 * so the dialog can slot a player in without the reader leaving the page.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    const speech = await getPublicVcSpeech(slug);
    if (!speech) {
      return NextResponse.json({ videos: [] }, { status: 404 });
    }
    return NextResponse.json(
      { videos: speech.videos ?? [] },
      { headers: { "Cache-Control": "public, max-age=300" } },
    );
  } catch (error) {
    console.error("VC speech lookup failed:", error);
    // The dialog already has the text; a missing recording is not fatal.
    return NextResponse.json({ videos: [] });
  }
}
