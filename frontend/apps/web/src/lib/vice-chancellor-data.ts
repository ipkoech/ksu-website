import { leadershipApi, viceChancellorApi } from "@ksu/api-client";

import { nullIfNotFound } from "./public-fetch";

// Swallows all errors (not just 404s): the homepage renders this as an
// optional section and must degrade instead of erroring.
export async function getPublicVcHub() {
  try {
    return (await viceChancellorApi.publicHub()).data;
  } catch {
    return null;
  }
}

export async function getPublicVcSpeech(slug: string) {
  try {
    return (await viceChancellorApi.publicSpeech(slug)).data;
  } catch (error) {
    return nullIfNotFound(error);
  }
}

export async function getPublicVcGallery(slug: string) {
  try {
    return (await viceChancellorApi.publicGallery(slug)).data;
  } catch (error) {
    return nullIfNotFound(error);
  }
}

export async function getActiveViceChancellor() {
  try {
    return (
      await leadershipApi.getViceChancellor({
        fields: "id,person_id,title,role,is_acting,start_date,end_date",
        include:
          "person:id,slug,title,first_name,middle_name,last_name,full_name,email,phone,photo_id,photo_url,bio,full_bio,qualifications,institutional_role,leadership_message,academic_rank,specialization,publications_count,research_interests",
      })
    ).data;
  } catch (error) {
    return nullIfNotFound(error);
  }
}
