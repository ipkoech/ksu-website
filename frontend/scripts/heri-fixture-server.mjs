import { createServer } from "node:http";

const port = Number(process.argv[2] ?? process.env.HERI_FIXTURE_PORT ?? 18003);

const site = {
  name: "HERI Africa",
  tagline: "Evidence-led language education.",
  contact: { email: "heri@example.org" },
  social_links: {},
  seo_defaults: {},
  research_center_slug: null,
};

const chair = {
  id: "chair-1",
  name: "HERI Africa Research Chair",
  acronym: "HERI",
  host_institution: "Kisii University",
  initiative_name: "HERI Africa",
  about: "Africa-led language research.",
  tagline: "Evidence-led language education.",
  vision: "Language equity for every learner.",
  mission: "Build evidence with African communities.",
  mandate: "Advance language education research.",
  objectives: "Translate evidence into action.",
  values: ["Evidence", "Partnership"],
  why_it_matters: "Research should improve lived experience.",
  logo_url: null,
  cover_image_url: null,
  seo: {},
};

const news = [
  {
    id: "news-1",
    slug: "reading-in-kisii",
    title: "New study explores early grade reading",
    excerpt: "Evidence for better classroom practice.",
    published_at: "2026-01-15T00:00:00Z",
  },
];

const teams = [
  {
    id: "team-1",
    slug: "dr-amina",
    name: "Dr. Amina",
    role: "Research Chair",
    biography: "Language education researcher",
    photo_url: null,
    is_featured: true,
  },
  {
    id: "team-2",
    slug: "dr-baraka",
    name: "Dr. Baraka",
    role: "Research Fellow",
    biography: "Early grade literacy researcher",
    photo_url: null,
    is_featured: false,
  },
];

const projects = [
  {
    id: "project-1",
    slug: "reading-study",
    title: "Reading study",
    summary: "Early grade literacy",
    cover_image_url: null,
    publication_date: "2026-01-01",
    publication_type: "Research project",
    theme_id: null,
    is_featured: true,
    position: 0,
  },
];

const publications = [
  {
    id: "publication-1",
    slug: "language-policy-evidence",
    title: "Language policy evidence",
    summary: "Research output",
    cover_image_url: null,
    publication_date: "2026-01-10",
    publication_type: "Publication",
    theme_id: null,
    is_featured: true,
    position: 0,
  },
];

const partners = [
  {
    id: "partner-1",
    slug: "kisii-university",
    name: "Kisii University",
    description: "Host institution",
    logo_url: null,
    website_url: "https://kisiiuniversity.ac.ke",
    country: "Kenya",
  },
];

const events = [
  {
    id: "event-1",
    slug: "research-symposium",
    title: "Research symposium",
    summary: "Evidence exchange",
    starts_at: "2026-02-01T09:00:00Z",
    ends_at: "2026-02-01T12:00:00Z",
    location: "Kisii",
    event_type: "Symposium",
    featured_image_url: null,
    is_virtual: false,
    virtual_url: null,
    is_featured: true,
    position: 0,
  },
];

const opportunities = [
  {
    id: "opportunity-1",
    slug: "literacy-fellowship",
    title: "Literacy fellowship",
    summary: "Support for emerging researchers.",
    application_url: "https://example.org/apply",
    closing_at: "2026-12-01T00:00:00Z",
    opportunity_type: "Fellowship",
    featured_image_url: null,
    is_featured: true,
    position: 0,
  },
];

const themes = [
  {
    id: "theme-1",
    slug: "language-and-literacy",
    title: "Language and literacy",
    summary: "Research theme",
    position: 0,
  },
];

const metrics = [
  {
    id: "metric-1",
    label: "Partner communities",
    value: "12",
    unit: null,
    description: "Communities engaged by the programme.",
    position: 0,
  },
];

const heroSlides = [
  {
    id: "hero-1",
    eyebrow: "HERI Africa",
    title: "Research that moves from evidence to action",
    description: "Africa-led language education research.",
    image_url: "/heri-africa/images/HERIAfricaLaunch.jpg",
    mobile_image_url: null,
    button_label: "Explore our work",
    button_href: "/our-work",
    position: 0,
    is_active: true,
  },
];

function sendJson(response, status, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  response.end(body);
}

function matchDetail(pathname, collection, values) {
  const prefix = `/api/v1/heri/${collection}/`;
  if (!pathname.startsWith(prefix)) return null;
  const slug = decodeURIComponent(pathname.slice(prefix.length));
  return values.find((value) => value.slug === slug) ?? null;
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host}`);
  const pathname = requestUrl.pathname;

  if (request.method === "GET") {
    if (pathname === "/api/v1/heri/site") return sendJson(response, 200, site);
    if (pathname === "/api/v1/heri/chair") return sendJson(response, 200, chair);
    if (pathname === "/api/v1/heri/news") return sendJson(response, 200, news);
    if (pathname === "/api/v1/heri/events") return sendJson(response, 200, events);
    if (pathname === "/api/v1/heri/team") return sendJson(response, 200, teams);
    if (pathname === "/api/v1/heri/research/projects") return sendJson(response, 200, projects);
    if (pathname === "/api/v1/heri/research/publications") return sendJson(response, 200, publications);
    if (pathname === "/api/v1/heri/partners") return sendJson(response, 200, partners);
    if (pathname === "/api/v1/heri/opportunities") return sendJson(response, 200, opportunities);
    if (pathname === "/api/v1/heri/research/themes") return sendJson(response, 200, themes);
    if (pathname === "/api/v1/heri/impact-metrics") return sendJson(response, 200, metrics);
    if (pathname === "/api/v1/heri/hero-slides") return sendJson(response, 200, heroSlides);

    const newsDetail = matchDetail(pathname, "news", news);
    if (newsDetail) return sendJson(response, 200, { ...newsDetail, body: "Full story content.", featured_image_url: null });
    const teamDetail = matchDetail(pathname, "team", teams);
    if (teamDetail) return sendJson(response, 200, teamDetail);

    return sendJson(response, 404, { detail: "Not found" });
  }

  if (request.method === "POST" && (pathname === "/api/v1/heri/contact" || pathname === "/api/v1/heri/partnership-applications")) {
    for await (const _chunk of request) {
      // Consume the body so the fixture behaves like the real HTTP endpoint.
    }
    return sendJson(response, 202, {
      status: "received",
      message: pathname.endsWith("contact")
        ? "Thank you for contacting HERI Africa."
        : "Partnership enquiry received.",
    });
  }

  return sendJson(response, 405, { detail: "Method not allowed" });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`HERI fixture backend listening on http://127.0.0.1:${port}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
