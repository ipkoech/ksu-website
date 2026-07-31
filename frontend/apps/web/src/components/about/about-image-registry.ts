export type AboutImagePage =
  | "about"
  | "academics"
  | "admissions"
  | "numbersFacts"
  | "qualityAssurance"
  | "serviceCharter"
  | "strategicPlan";

const aboutUsImages = {
  bgFore: "/images/about-us/bg-fore.jpg",
  blockC: "/images/about-us/block%20C.jpg",
  gate: "/images/about-us/gate-1.jpg",
  ictVillage: "/images/about-us/ict-village-1.jpg",
  law: "/images/about-us/law-4.jpg",
  pathway: "/images/about-us/pathway-3.jpg",
  pavilion: "/images/about-us/pavilion-2.jpg",
  sakagwa: "/images/about-us/sakagwa-tc.jpg",
  science: "/images/about-us/science-complex-3.jpg",
} as const;

export const ABOUT_PAGE_IMAGE_POOLS = {
  about: [
    aboutUsImages.gate,
    aboutUsImages.sakagwa,
    aboutUsImages.blockC,
    aboutUsImages.bgFore,
    aboutUsImages.pathway,
    aboutUsImages.law,
    aboutUsImages.pavilion,
    aboutUsImages.ictVillage,
    aboutUsImages.science,
  ],
  academics: [
    aboutUsImages.law,
    aboutUsImages.science,
    aboutUsImages.ictVillage,
    aboutUsImages.blockC,
    aboutUsImages.pathway,
    aboutUsImages.gate,
    aboutUsImages.pavilion,
    aboutUsImages.sakagwa,
    aboutUsImages.bgFore,
  ],
  admissions: [
    aboutUsImages.pavilion,
    aboutUsImages.gate,
    aboutUsImages.bgFore,
    aboutUsImages.pathway,
    aboutUsImages.sakagwa,
    aboutUsImages.blockC,
    aboutUsImages.science,
    aboutUsImages.law,
    aboutUsImages.ictVillage,
  ],
  numbersFacts: [
    aboutUsImages.bgFore,
    aboutUsImages.blockC,
    aboutUsImages.pathway,
    aboutUsImages.pavilion,
    aboutUsImages.law,
    aboutUsImages.science,
  ],
  qualityAssurance: [
    aboutUsImages.science,
    aboutUsImages.ictVillage,
    aboutUsImages.sakagwa,
    aboutUsImages.pathway,
    aboutUsImages.pavilion,
    aboutUsImages.blockC,
    aboutUsImages.bgFore,
    aboutUsImages.gate,
    aboutUsImages.law,
  ],
  serviceCharter: [
    aboutUsImages.ictVillage,
    aboutUsImages.pathway,
    aboutUsImages.gate,
    aboutUsImages.bgFore,
    aboutUsImages.blockC,
    aboutUsImages.law,
    aboutUsImages.pavilion,
    aboutUsImages.science,
    aboutUsImages.sakagwa,
  ],
  strategicPlan: [
    aboutUsImages.bgFore,
    aboutUsImages.science,
    aboutUsImages.blockC,
    aboutUsImages.gate,
    aboutUsImages.pavilion,
    aboutUsImages.law,
    aboutUsImages.ictVillage,
    aboutUsImages.pathway,
    aboutUsImages.sakagwa,
  ],
} satisfies Record<AboutImagePage, readonly string[]>;

const genericImagePaths = [
  "/images/backgrounds/about-hero.jpg",
  "/images/HERIAfricaLaunch.jpg",
  "/images/Home/OurKSU-82.jpg",
  "/images/history/KSUGreenLandscapingMay2026-3810.jpg",
  "/images/backgrounds/KSUB-RollPhotos2025-122.jpg",
  "/images/backgrounds/KSUB-RollPhotos2025-123.jpg",
] as const;

function normalizeImageSource(source: string) {
  const withoutQuery = source.split(/[?#]/, 1)[0];
  try {
    return decodeURIComponent(new URL(withoutQuery, "http://localhost").pathname);
  } catch {
    return withoutQuery;
  }
}

export function isGenericAboutImage(source?: string | null) {
  if (!source?.trim()) return false;
  const normalized = normalizeImageSource(source);
  return (
    normalized.startsWith("/images/about/about-") ||
    genericImagePaths.includes(normalized as (typeof genericImagePaths)[number])
  );
}

export type AboutImagePicker = (preferred?: string | null) => string;

export function createAboutImagePicker(page: AboutImagePage): AboutImagePicker {
  const pool = ABOUT_PAGE_IMAGE_POOLS[page];
  const used = new Set<string>();

  return (preferred) => {
    const candidate = preferred?.trim();
    const candidateKey = candidate ? normalizeImageSource(candidate) : null;

    if (candidate && candidateKey && !isGenericAboutImage(candidate) && !used.has(candidateKey)) {
      used.add(candidateKey);
      return candidate;
    }

    const fallback = pool.find((image) => !used.has(normalizeImageSource(image)));
    if (!fallback) {
      throw new Error(`No unused About image remains for the ${page} page.`);
    }

    used.add(normalizeImageSource(fallback));
    return fallback;
  };
}
