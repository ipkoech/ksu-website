type PersonNameRecord = {
  display_name?: string | null;
  full_name?: string | null;
  title?: string | null;
};

export function personDisplayName(
  person: PersonNameRecord | null | undefined,
  fallback: string,
) {
  const displayName = person?.display_name?.trim();
  if (displayName) return displayName;

  const fullName = person?.full_name?.trim();
  if (!fullName) return fallback;

  const title = person?.title?.trim();
  if (!title || fullName.toLowerCase().startsWith(title.toLowerCase())) {
    return fullName;
  }

  return `${title} ${fullName}`;
}
