/**
 * Official campus photography, used when a record carries no cover of its own.
 *
 * A single fallback image would be simpler, but a homepage row shows three
 * cards at once: one default means three identical photographs side by side,
 * which reads as a rendering fault rather than as house imagery. Picking from
 * a small set keyed on the record's own id keeps the choice stable for a
 * given story (it will not change between renders or page loads) while
 * letting a row of cards look composed.
 */
const UNIVERSITY_IMAGES = [
  "/images/headers/main-admin.jpg",
  "/images/headers/chancellors-pavilion.jpg",
  "/images/about-us/science-complex-3.jpg",
  "/images/about-us/gate-1.jpg",
  "/images/about-us/pathway-3.jpg",
  "/images/headers/block-c.jpg",
] as const;

/** The single image to use where only one is ever shown. */
export const DEFAULT_UNIVERSITY_IMAGE = UNIVERSITY_IMAGES[0];

/**
 * A stable campus photograph for a record with no cover.
 *
 * `seed` should be the record's id or href: the same record always resolves
 * to the same picture, so nothing shuffles as the reader scrolls or the page
 * revalidates.
 */
export function defaultUniversityImage(seed?: string | null): string {
  if (!seed) return DEFAULT_UNIVERSITY_IMAGE;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100_003;
  }
  return UNIVERSITY_IMAGES[hash % UNIVERSITY_IMAGES.length];
}
