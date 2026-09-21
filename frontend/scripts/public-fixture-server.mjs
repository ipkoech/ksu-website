import { createServer } from "node:http";

const port = Number(process.argv[2] ?? process.env.PUBLIC_FIXTURE_PORT ?? 18004);

const project = {
  id: "fixture-project-1",
  title: "Climate-Smart Agriculture for Smallholder Food Security",
  slug: "climate-smart-agriculture",
  code: "FIXTURE-001",
  summary: "A disposable research project used for server-rendering verification.",
  status: "ongoing",
  is_active: true,
  is_public: true,
  is_featured: true,
  project_type: "applied",
  cover_image: null,
  cover_image_url: null,
  start_date: "2026-01-01",
  end_date: null,
};

const person = {
  id: "fixture-person-1",
  slug: "fixture-researcher",
  full_name: "Fixture Researcher",
  first_name: "Fixture",
  last_name: "Researcher",
  title: "Research Fellow",
  academic_rank: "Research Fellow",
  institutional_role: "Research Fellow",
  department_name: "Research and Innovation",
  department: { name: "Research and Innovation" },
  bio: "A disposable research team record.",
  specialization: "Evidence synthesis",
  is_researcher: true,
  is_public: true,
  is_active: true,
  is_featured: true,
};

const branch = {
  id: "fixture-library-main",
  name: "Main Campus Library",
  code: "MAIN",
  short_name: "Main Library",
  slug: "main-campus-library",
  description: "A disposable library branch used for server-rendering verification.",
  about_content: null,
  address: "Main Campus, Kisii",
  location: "Main Campus",
  email: "library@example.org",
  phone: "+254700000000",
  opening_hours: {},
  library_type: "academic",
  is_active: true,
  is_public: true,
  sort_order: 0,
};

const story = {
  id: "fixture-story-1",
  title: "Fixture story for server rendering",
  slug: "fixture-story",
  summary: "A disposable published story used for server-rendering verification.",
  plain_text: "A disposable published story used for server-rendering verification.",
  rich_text: "<p>A disposable published story used for server-rendering verification.</p>",
  structured_content: null,
  related_links: [],
  featured_media_id: null,
  featured_media: null,
  author_user_id: null,
  author: null,
  story_type: "news",
  category: "University",
  source_type: "editorial",
  contributor_user_id: null,
  contributor: null,
  contributor_name_snapshot: null,
  contributor_email_snapshot: null,
  contributor_affiliation_snapshot: null,
  show_contributor_name: false,
  consent_to_publish: true,
  is_featured: true,
  featured_until: null,
  homepage_priority: 1,
  reading_minutes: 1,
  scope_type: "global",
  scope_id: null,
  published_at: "2026-01-01T00:00:00Z",
  valid_from: null,
  valid_to: null,
  archived_at: null,
  is_main: true,
  is_public: true,
  is_published: true,
  status: "published",
  workflow_status: "published",
  submitted_at: null,
  scheduled_publish_at: null,
  revision_notes: null,
  rejection_reason: null,
  display_order: 1,
  meta_title: null,
  meta_description: null,
  keywords: {},
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

const institutionalPage = (slug) => ({
  id: `fixture-${slug}`,
  page_type: slug === "service-charter" ? "service_charter" : slug === "about" ? "about" : "strategic_plan",
  slug,
  eyebrow: "Kisii University",
  title: slug === "service-charter" ? "University Service Charter" : "Strategic Plan",
  introduction: "A disposable institutional page used for server-rendering verification.",
  hero_media: null,
  mobile_hero_media: null,
  hero_alt_text: null,
  primary_document: null,
  reporting_period_label: "2026",
  effective_date: null,
  review_date: null,
  seo_title: null,
  seo_description: null,
  sections: [],
});

function list(data = []) {
  return { data, meta: { total: data.length, per_page: 100, page: 1 } };
}

function sendJson(response, status, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  response.end(body);
}

function payloadFor(pathname) {
  if (pathname === "/api/v1/public/about") {
    return {
      data: {
        university: {
          name: "Kisii University",
          short_name: "KSU",
          acronym: "KSU",
        },
        content: null,
        history: { milestones: [], document: null },
        institutional_page: null,
      },
    };
  }
  if (pathname === "/api/v1/public/about/facts") {
    return {
      data: {
        edition: { reporting_year: 2026, title: "University facts", introduction: null },
        groups: [],
        available_years: [2026],
      },
    };
  }
  if (pathname.startsWith("/api/v1/public/institutional-pages/")) {
    return { data: institutionalPage(pathname.split("/").at(-1) ?? "service-charter") };
  }
  if (pathname === "/api/v1/public/vice-chancellor") {
    return {
      data: {
        id: "fixture-vc-hub",
        eyebrow: "Office of the Vice Chancellor",
        title: "Meet the Vice Chancellor",
        introduction: "A disposable Vice Chancellor fixture.",
        welcome_title: null,
        welcome_message: null,
        hero_media: null,
        welcome_video: null,
        professional_profile_url: "/about/vice-chancellor/profile",
        section_order: ["story", "activities", "speeches", "videos", "events", "gallery"],
        section_visibility: { story: true, activities: true, speeches: true, videos: true, events: true, gallery: true },
        sections: { story: [], activities: [], speeches: [], videos: [], events: [], gallery: [] },
      },
    };
  }
  if (pathname === "/api/v1/public/leadership/vice-chancellor") return { data: null };
  if (pathname === "/api/v1/homepage") {
    return {
      data: {
        page_key: "homepage",
        scope_type: "global",
        scope_id: null,
        resolved_at: "2026-01-01T00:00:00Z",
        hero: null,
        sections: [
          {
            section_key: "featured-partnership",
            layout_variant: "featured_partnership",
            title: "Kisii University and HERI Africa",
            subtitle: "Research, education and partnership for impact.",
            description: "A disposable homepage composition for responsive verification.",
            is_enabled: true,
            display_order: 1,
            items: [],
            media: {},
            settings: {},
          },
          {
            section_key: "academic-dates",
            layout_variant: "date_timeline",
            title: "Important academic dates",
            subtitle: null,
            description: "A second independent section for responsive verification.",
            is_enabled: true,
            display_order: 2,
            items: [],
            media: {},
            settings: {},
          },
        ],
        partnership_spotlights: [],
      },
    };
  }
  if (pathname === "/api/v1/stories") return list([story]);
  if (pathname === "/api/v1/stories/fixture-story") return { data: story };
  if (pathname.startsWith("/api/v1/stories/")) return null;
  if (pathname === "/api/v1/public/research/context") {
    return {
      data: {
        resolved_entity: { entity_type: "university", entity_id: "fixture-university" },
        entity: { name: "Kisii University", office_location: "Main Campus", phone: "+254700000000", email: "research@example.org" },
        team: [],
        leadership: [],
        relationships: [],
      },
    };
  }
  if (pathname === "/api/v1/public/research/context" || pathname.endsWith("/announcements")) return list([]);
  if (pathname === "/api/v1/projects/featured") return { data: project };
  if (pathname === "/api/v1/projects" || pathname.startsWith("/api/v1/projects?")) return list([project]);
  if (pathname === "/api/v1/persons" || pathname.startsWith("/api/v1/persons?")) return list([person]);
  if (pathname === "/api/v1/centers" || pathname.startsWith("/api/v1/centers?")) return list([]);
  if (pathname === "/api/v1/programs" || pathname.startsWith("/api/v1/programs?")) return list([]);
  if (pathname === "/api/v1/research/stats") return { data: { stats: [] } };

  if (pathname === "/api/v1/library/stats") return { data: { stats: [] } };
  if (pathname === "/api/v1/library/hours/today") return { data: [] };
  if (pathname === "/api/v1/library/branches" || pathname === "/api/v1/library/branches/") return list([branch]);
  if (pathname.startsWith("/api/v1/library/")) return list([]);

  // HERI's public endpoints return their collections as bare arrays rather
  // than the paginated envelopes used by the shared university APIs.
  if (pathname === "/api/v1/heri/site") {
    return {
      name: "HERI Africa Research Chair",
      tagline: "A disposable HERI fixture used for server-rendering verification.",
      contact: {},
      social_links: {},
      seo_defaults: {},
      research_center_slug: null,
    };
  }
  if (pathname === "/api/v1/heri/chair") {
    return {
      id: "fixture-heri-chair",
      name: "HERI Africa Research Chair",
      acronym: "HERI",
      host_institution: "Kisii University",
      initiative_name: "HERI Africa",
      about: "A disposable HERI chair record used for server-rendering verification.",
      tagline: "Research that connects evidence, policy and practice.",
      vision: "An Africa where research is locally led and used.",
      mission: "Connect evidence with policy, practice and communities.",
      mandate: "Support relevant language education research.",
      objectives: "Build research capacity and share usable evidence.",
      values: [],
      why_it_matters: "Research should improve learning and opportunity.",
      logo_url: null,
      cover_image_url: null,
      seo: {},
    };
  }
  if (pathname.startsWith("/api/v1/heri/")) return [];

  if (
    pathname === "/api/v1/news" ||
    pathname === "/api/v1/events" ||
    pathname === "/api/v1/blogs"
  ) return list([]);

  // The representative pages intentionally tolerate optional empty collections.
  if (pathname.startsWith("/api/v1/")) return list([]);
  return null;
}

const server = createServer((request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host}`);
  if (request.method !== "GET") return sendJson(response, 405, { detail: "Method not allowed" });
  const payload = payloadFor(requestUrl.pathname);
  if (payload === null) return sendJson(response, 404, { detail: "Not found" });
  return sendJson(response, 200, payload);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Public frontend fixture listening on http://127.0.0.1:${port}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
