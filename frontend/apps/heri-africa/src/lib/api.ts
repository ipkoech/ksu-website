export type SiteSettings = {
  name: string;
  tagline: string | null;
  contact: Record<string, unknown>;
  social_links: Record<string, unknown>;
  seo_defaults: Record<string, unknown>;
};

export type NewsSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
};

const apiBase = process.env.NEXT_PUBLIC_HERI_API_URL ?? "http://localhost:8003/api/v1/heri";

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, { next: { revalidate: 300 } });
  if (!response.ok) throw new Error(`HERI API request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export async function getSite(): Promise<SiteSettings> {
  return get<SiteSettings>("/site");
}

export async function getNews(): Promise<NewsSummary[]> {
  return get<NewsSummary[]>("/news?limit=6");
}

export async function submitContact(payload: Record<string, unknown>): Promise<{ status: string; message: string }> {
  const response = await fetch(`${apiBase}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail ?? "Unable to submit enquiry");
  return data;
}
