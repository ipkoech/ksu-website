/**
 * The six category hubs the ten seeded stories fall into.
 *
 * Story categories are authored strings on the record, so the mapping is keyed
 * by the exact stored value. A story whose category matches nothing here still
 * appears in the chapters rail; it simply has no hub of its own yet.
 */

export interface StoryHub {
  /** URL segment: /campus-life/stories/<slug>. */
  slug: string;
  /** Hub title, written as a claim rather than a label. */
  title: string;
  /** Standfirst for the hub page and the landing card. */
  standfirst: string;
  /** Stored `category` values that route into this hub. */
  categories: string[];
  image: string;
  imageAlt: string;
}

const life = (name: string) => `/images/student-life/Life-around-studies/${name}.jpg`;

export const STORY_HUBS: StoryHub[] = [
  {
    slug: "culture",
    title: "Culture is lived here, not archived",
    standfirst:
      "Once a year the campus walks into Kisii Town, and the whole county watches students carry their own heritage down the street.",
    categories: ["Art & Culture"],
    image: life("culture"),
    imageAlt: "Kisii University students in cultural dress during the festival procession",
  },
  {
    slug: "careers",
    title: "Prepared for the world of work",
    standfirst:
      "A degree opens the door. Mentorship, industry linkages and student-run summits are what walk you through it.",
    categories: ["Careers"],
    image: life("career-mentorship"),
    imageAlt: "A career mentorship session at Kisii University",
  },
  {
    slug: "leadership",
    title: "Leadership is practised, not taught",
    standfirst:
      "From national parade grounds to the Top Achievers Dinner, students here learn responsibility by carrying it.",
    categories: ["Leadership"],
    image: life("leadership"),
    imageAlt: "Kisii University contingent at the St. John Ambulance annual parade",
  },
  {
    slug: "health",
    title: "The students who save lives",
    standfirst:
      "Survival often depends on whoever is standing closest. At Kisii University, that person is trained.",
    categories: ["Student Health"],
    image: life("health"),
    imageAlt: "St. John Ambulance Kisii University Division members on duty",
  },
  {
    slug: "innovation",
    title: "Ideas that refuse to wait for graduation",
    standfirst:
      "Four days, more than three hundred participants and ninety-seven exhibitors at the university's first Innovation Week.",
    categories: ["Research & Innovation"],
    image: life("innovation"),
    imageAlt: "Exhibition stands at Kisii University's inaugural Innovation Week",
  },
  {
    slug: "clubs",
    title: "Communities that compete nationally",
    standfirst:
      "Some clubs carry the university's name as far as State House, and come back with the award.",
    categories: ["Clubs & Societies", "Student Life"],
    image: life("summer-exchange"),
    imageAlt: "Kisii University students representing the university at a national event",
  },
];

const HUB_BY_CATEGORY = new Map<string, StoryHub>();
for (const hub of STORY_HUBS) {
  for (const category of hub.categories) {
    HUB_BY_CATEGORY.set(category.toLowerCase(), hub);
  }
}

export function hubForCategory(category?: string | null): StoryHub | null {
  const key = category?.trim().toLowerCase();
  return (key && HUB_BY_CATEGORY.get(key)) || null;
}

export function hubBySlug(slug?: string | null): StoryHub | null {
  const key = slug?.trim().toLowerCase();
  return STORY_HUBS.find((hub) => hub.slug === key) ?? null;
}
