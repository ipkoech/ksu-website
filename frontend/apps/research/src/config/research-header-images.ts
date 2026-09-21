const headerPhotos = [
  { number: "8246", alt: "Visitors examining an innovation exhibit at Kisii University" },
  { number: "8020", alt: "Audience attending Kisii University Innovation Week" },
  { number: "8173", alt: "Innovation Week participants gathered at Kisii University" },
  { number: "8040", alt: "Speaker addressing Kisii University Innovation Week" },
  { number: "8263", alt: "Exhibitors and visitors at Kisii University Innovation Week" },
  { number: "8101", alt: "Delegates attending an Innovation Week session" },
  { number: "8197", alt: "An exhibitor presenting an innovation to university visitors" },
  { number: "8147", alt: "Group photograph of Kisii University Innovation Week participants" },
  { number: "8243", alt: "Visitors exploring exhibits at Kisii University Innovation Week" },
];

// A page-specific seed provides variety without changing during hydration or reloads.
export function getResearchHeaderImage(pageKey: string) {
  let hash = 2166136261;
  for (const character of pageKey) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  }
  const photo = headerPhotos[(hash >>> 0) % headerPhotos.length];
  return { src: `/images/research/headers/innovation-week-${photo.number}.jpg`, alt: photo.alt };
}
