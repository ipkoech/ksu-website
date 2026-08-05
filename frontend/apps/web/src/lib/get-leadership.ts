import { leadershipApi } from "@ksu/api-client";
import type { Media, Person, StaffAssignment } from "@ksu/api-client";
import type { Leader } from "@ksu/ui/components";
import { publicFileUrl, publicMediaUrl, resolvePublicMediaUrl } from "@/lib/public-media";

const leaderInclude =
  "person(id,slug,title,first_name,middle_name,last_name,full_name,bio,leadership_message,photo_id,photo_url,photo(id,url,public_url,cdn_url,thumbnail_url,alt_text,title))";

const viceChancellorInclude =
  "person(full_name,title,photo(id,url,public_url,cdn_url,thumbnail_url))";

type PersonWithMedia = Person & {
  photo?: Partial<Media> | null;
};

function personName(person: Person, fallback: string) {
  const fullName = person.full_name?.trim();
  if (fullName) return fullName;

  const name = [
    person.title,
    person.first_name,
    person.middle_name,
    person.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || fallback;
}

function personImage(person: PersonWithMedia) {
  return (
    publicMediaUrl(person.photo) ??
    publicFileUrl(person.photo_id) ??
    resolvePublicMediaUrl(person.photo_url)
  );
}

function toLeader(
  assignment: StaffAssignment | null | undefined,
  fallbackName: string,
  fallbackTitle: string,
) {
  if (!assignment?.person) {
    return null;
  }

  const person = assignment.person;

  return {
    id: person.id,
    name: personName(person, fallbackName),
    title: assignment.title || (assignment.is_acting ? `Acting ${fallbackTitle}` : fallbackTitle),
    image: personImage(person),
    message: person.leadership_message || person.bio || null,
    slug: person.slug || person.id,
  } satisfies Leader;
}

export async function getViceChancellor(): Promise<Leader | null> {
  try {
    const response = await leadershipApi.getViceChancellor({
      fields: "id,person_id,title,is_acting",
      include: viceChancellorInclude,
    });

    return toLeader(response.data, "Vice Chancellor", "Vice Chancellor");
  } catch (error) {
    console.error("Failed to fetch Vice Chancellor:", error);
    return null;
  }
}

export async function getDean(schoolId: string): Promise<Leader | null> {
  try {
    const response = await leadershipApi.getDean(schoolId, {
      fields: "id,person_id,role,title,is_acting",
      include: leaderInclude,
    });

    return toLeader(response.data, "Dean", "Dean");
  } catch (error) {
    console.error(`Failed to fetch Dean for school ${schoolId}:`, error);
    return null;
  }
}

export async function getHOD(departmentId: string): Promise<Leader | null> {
  try {
    const response = await leadershipApi.getHOD(departmentId, {
      fields: "id,person_id,role,title,is_acting",
      include: leaderInclude,
    });

    return toLeader(response.data, "Head of Department", "Head of Department");
  } catch (error) {
    console.error(`Failed to fetch HOD for department ${departmentId}:`, error);
    return null;
  }
}

export async function getDirector(divisionId: string): Promise<Leader | null> {
  try {
    const response = await leadershipApi.getDirector(divisionId, {
      fields: "id,person_id,role,title,is_acting",
      include: leaderInclude,
    });

    return toLeader(response.data, "Director", "Director");
  } catch (error) {
    console.error(`Failed to fetch Director for division ${divisionId}:`, error);
    return null;
  }
}

export async function getLeaderByRole(
  role: string,
  entityType?: string,
  entityId?: string
): Promise<Leader | null> {
  try {
    const response = await leadershipApi.getByRole({
      role,
      entity_type: entityType,
      entity_id: entityId,
      fields: "id,person_id,role,title,is_acting",
      include: leaderInclude,
    });

    return toLeader(response.data, role, response.data?.title || response.data?.role || "");
  } catch (error) {
    console.error(`Failed to fetch leader (${role}):`, error);
    return null;
  }
}
