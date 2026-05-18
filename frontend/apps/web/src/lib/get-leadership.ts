import { leadershipApi } from "@ksu/api-client";
import type { Leader } from "@ksu/ui/components";

export async function getViceChancellor(): Promise<Leader | null> {
  try {
    const response = await leadershipApi.getViceChancellor({
      fields: "id,person_id,role,title,is_acting",
      include: "person:id,slug,first_name,last_name,title,salutation,bio,photo_url",
    });

    const assignment = response.data;
    if (!assignment?.person) {
      return null;
    }

    const person = assignment.person;
    const fullName = [person.salutation, person.first_name, person.last_name]
      .filter(Boolean)
      .join(" ");

    return {
      id: person.id,
      name: fullName || "Vice Chancellor",
      title: assignment.is_acting ? "Acting Vice Chancellor" : "Vice Chancellor",
      image: person.photo_url || null,
      message: person.bio || null,
      slug: person.slug,
    };
  } catch (error) {
    console.error("Failed to fetch Vice Chancellor:", error);
    return null;
  }
}

export async function getDean(schoolId: string): Promise<Leader | null> {
  try {
    const response = await leadershipApi.getDean(schoolId, {
      fields: "id,person_id,role,title,is_acting",
      include: "person:id,slug,first_name,last_name,title,salutation,bio,photo_url",
    });

    const assignment = response.data;
    if (!assignment?.person) {
      return null;
    }

    const person = assignment.person;
    const fullName = [person.salutation, person.first_name, person.last_name]
      .filter(Boolean)
      .join(" ");

    return {
      id: person.id,
      name: fullName,
      title: assignment.is_acting ? "Acting Dean" : "Dean",
      image: person.photo_url || null,
      message: person.bio || null,
      slug: person.slug,
    };
  } catch (error) {
    console.error(`Failed to fetch Dean for school ${schoolId}:`, error);
    return null;
  }
}

export async function getHOD(departmentId: string): Promise<Leader | null> {
  try {
    const response = await leadershipApi.getHOD(departmentId, {
      fields: "id,person_id,role,title,is_acting",
      include: "person:id,slug,first_name,last_name,title,salutation,bio,photo_url",
    });

    const assignment = response.data;
    if (!assignment?.person) {
      return null;
    }

    const person = assignment.person;
    const fullName = [person.salutation, person.first_name, person.last_name]
      .filter(Boolean)
      .join(" ");

    return {
      id: person.id,
      name: fullName,
      title: assignment.is_acting ? "Acting HOD" : "Head of Department",
      image: person.photo_url || null,
      message: person.bio || null,
      slug: person.slug,
    };
  } catch (error) {
    console.error(`Failed to fetch HOD for department ${departmentId}:`, error);
    return null;
  }
}

export async function getDirector(divisionId: string): Promise<Leader | null> {
  try {
    const response = await leadershipApi.getDirector(divisionId, {
      fields: "id,person_id,role,title,is_acting",
      include: "person:id,slug,first_name,last_name,title,salutation,bio,photo_url",
    });

    const assignment = response.data;
    if (!assignment?.person) {
      return null;
    }

    const person = assignment.person;
    const fullName = [person.salutation, person.first_name, person.last_name]
      .filter(Boolean)
      .join(" ");

    return {
      id: person.id,
      name: fullName,
      title: assignment.is_acting ? "Acting Director" : "Director",
      image: person.photo_url || null,
      message: person.bio || null,
      slug: person.slug,
    };
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
      include: "person:id,slug,first_name,last_name,title,salutation,bio,photo_url",
    });

    const assignment = response.data;
    if (!assignment?.person) {
      return null;
    }

    const person = assignment.person;
    const fullName = [person.salutation, person.first_name, person.last_name]
      .filter(Boolean)
      .join(" ");

    return {
      id: person.id,
      name: fullName,
      title: assignment.title || assignment.role || "",
      image: person.photo_url || null,
      message: person.bio || null,
      slug: person.slug,
    };
  } catch (error) {
    console.error(`Failed to fetch leader (${role}):`, error);
    return null;
  }
}
