/** Verified destinations in the existing admin portal registry, not new CRUD APIs. */
export const institutionalAreas = [
  { key: "content-news", label: "Research news", path: "/research/content/news", description: "Edit research news in the existing institutional content workflow." },
  { key: "content-blogs", label: "Research blogs", path: "/research/content/blogs", description: "Manage articles and their existing review and publication controls." },
  { key: "content-announcements", label: "Announcements", path: "/research/content/announcements", description: "Maintain announcements using the Main-service publishing rules." },
  { key: "content-events", label: "Events", path: "/research/content/events", description: "Manage event content without duplicating institutional ownership." },
  { key: "content-sliders", label: "Featured content", path: "/research/content/sliders", description: "Edit existing research sliders and media placements." },
  { key: "settings-staff", label: "Institutional staff", path: "/research/content/staff", description: "Manage staff in the existing administration app. Project-team entries do not grant application access." },
] as const;

export function institutionalAdminOrigin(value: string | undefined): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (url.username || url.password || url.search || url.hash || url.pathname !== "/") return null;
    const local = url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    return url.protocol === "https:" || local ? url.origin : null;
  } catch { return null; }
}
