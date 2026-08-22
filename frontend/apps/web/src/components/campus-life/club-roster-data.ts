/**
 * Presentation rules for the club roster.
 *
 * The register is authored in an admin portal and arrives shouty, inconsistently
 * spelled, and occasionally prefixed with its row number. None of that is worth
 * a migration — the records are correct, only their casing is not — so the
 * repair happens here, at the point of display, and leaves the source untouched.
 */

/** The six registered club types, in the order the roster presents them. */
export const CLUB_TRACKS = [
  "county",
  "professional",
  "edu-tainment",
  "mentorship",
  "religious",
  "edu-service",
] as const;

export type ClubTrack = (typeof CLUB_TRACKS)[number];

export interface ClubTrackMeta {
  /**
   * What this kind of club is called, in plain words.
   *
   * `title` is a phrase written for the roster band ("Where you're from"),
   * which does not work as an eyebrow or a breadcrumb; this is the noun.
   */
  label: string;
  /** Heading for the track's band in the roster. */
  title: string;
  /** One line saying who this track is for, addressed to a reader deciding. */
  line: string;
  /** Backdrop photograph. Shared across the track by design — see `roster.tsx`. */
  image: string;
  /** Alt text for the backdrop, describing the photograph rather than the track. */
  imageAlt: string;
}

const life = (name: string) => `/images/student-life/Life-around-studies/${name}.jpg`;

export const CLUB_TRACK_META: Record<ClubTrack, ClubTrackMeta> = {
  county: {
    label: "County students' association",
    title: "Where you're from",
    line: "Twenty-nine county associations, from Turkana to Kwale. Odds are there is already a room of people from home, meeting.",
    image: life("culture"),
    imageAlt: "Kisii University students in cultural dress during a campus celebration",
  },
  professional: {
    label: "Professional students' association",
    title: "What you're training to be",
    line: "Seventeen course-linked bodies where students meet the profession before they graduate into it.",
    image: life("career-mentorship"),
    imageAlt: "Students in a career mentorship session at Kisii University",
  },
  "edu-tainment": {
    label: "Performing and creative arts club",
    title: "What you do for the love of it",
    line: "Stage, page, court and dance floor. The clubs that have nothing to do with your transcript.",
    image: life("culture"),
    imageAlt: "Performance during a Kisii University cultural event",
  },
  mentorship: {
    label: "Mentorship and advocacy society",
    title: "What you want to change",
    line: "Policy, tax literacy, farming, youth leadership. Students organising around a cause and taking it national.",
    image: life("leadership"),
    imageAlt: "Kisii University students at a leadership parade",
  },
  religious: {
    label: "Faith community",
    title: "What you believe",
    line: "Five faith communities keeping their own calendar of worship, service and fellowship on campus.",
    image: life("health"),
    imageAlt: "Students gathered on the Kisii University campus",
  },
  "edu-service": {
    label: "Service and volunteering corps",
    title: "Who you turn up for",
    line: "First aid, conservation, scouting. The students who train so that they are useful when it matters.",
    image: life("innovation"),
    imageAlt: "Kisii University students at a service and innovation exhibition",
  },
};

/** Small words that stay lowercase inside a normalised club name. */
const MINOR_WORDS = new Set(["and", "of", "for", "the", "in", "at", "de"]);

/**
 * Acronyms that must survive title-casing intact.
 *
 * "St" is deliberately absent: it is the abbreviation in "St John", not an
 * acronym, and uppercasing it produces "ST John".
 */
const KEEP_UPPER = new Set(["ksu", "sda", "pak", "panasa", "ict", "hr"]);

/**
 * Misspellings in the register, corrected for display only.
 *
 * Each key is exactly as stored. Fixing these upstream would be the better
 * repair; until someone does, a prospective student searching for "Siaya"
 * should still find their association.
 */
const SPELLING_FIXES: Record<string, string> = {
  stdents: "Students",
  labaratory: "Laboratory",
  aplled: "Applied",
  apllied: "Applied",
  kirinyanga: "Kirinyaga",
  elgeyomarakwet: "Elgeyo Marakwet",
};

/**
 * Turn a stored club name into something a person would set in a sentence.
 *
 * Drops any leading row number, repairs known misspellings, title-cases the
 * result, and preserves acronyms and internal apostrophes (Murang'a).
 */
export function displayClubName(raw?: string | null): string {
  const source = (raw ?? "").trim().replace(/^\d+\.\s*/, "");
  if (!source) return "Unnamed club";

  return source
    // "ST.JOHN" carries no space after the period, so the capitaliser below
    // cannot see the second word. Give it the boundary it needs.
    .replace(/\bST\.\s*JOHN\b/gi, "St John")
    .toLowerCase()
    .split(/\s+/)
    .map((word, index) => {
      const bare = word.replace(/[^a-z']/g, "");
      const fixed = SPELLING_FIXES[bare];
      if (fixed) return fixed;
      if (KEEP_UPPER.has(bare)) return bare.toUpperCase();
      if (index > 0 && MINOR_WORDS.has(bare)) return bare;
      // Capitalise across hyphens too, so "trans-nzoia" reads "Trans-Nzoia".
      return word.replace(/(^|[-'])([a-z])/g, (_, lead: string, letter: string) =>
        lead === "'" ? lead + letter : lead + letter.toUpperCase(),
      );
    })
    .join(" ");
}

/**
 * The distinguishing part of an association's name.
 *
 * Twenty-nine entries end in "County Students Association"; printing that on
 * every tile would make the wall unreadable and hide the one word that differs.
 * The suffix is stated once in the track heading instead.
 */
export function clubShortName(raw?: string | null): string {
  const full = displayClubName(raw);
  // Each pattern is anchored and specific. A looser rule that allowed any word
  // between "Students" and "Association" turned "Kisii University Students
  // Teachers Association" into "Kisii University", which names the wrong thing
  // entirely — a shortener must never change who the entry refers to.
  const trimmed = full
    .replace(/\s+County\s+Students?\s+Association$/i, "")
    .replace(/\s+Students?\s+Association\s+of\s+Kisii\s+University$/i, "")
    .replace(/\s+Students?\s+Association$/i, "")
    .replace(/\s+Students?\s+Society$/i, "")
    .replace(/^The\s+/i, "")
    .trim();
  // Never return something so short it stops identifying the club.
  return trimmed.length >= 3 ? trimmed : full;
}
