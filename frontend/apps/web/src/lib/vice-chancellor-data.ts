import { leadershipApi, viceChancellorApi } from "@ksu/api-client";

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
  } catch {
    return null;
  }
}

export async function getPublicVcGallery(slug: string) {
  try {
    return (await viceChancellorApi.publicGallery(slug)).data;
  } catch {
    return null;
  }
}

export async function getActiveViceChancellor() {
  try {
    return (
      await leadershipApi.getViceChancellor({
        fields: "id,person_id,title,role,is_acting,start_date,end_date",
        include:
          "person:id,slug,title,first_name,middle_name,last_name,full_name,email,phone,photo_id,photo_url,bio,full_bio,qualifications,institutional_role,leadership_message",
      })
    ).data;
  } catch {
    return null;
  }
}
