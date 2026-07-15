import { mainApi } from "@ksu/api-client";
import type { PublicTeamAssignment } from "@/lib/public-team-data";

export type PublicPersonPublication = {
  title?: string | null;
  citation?: string | null;
  year?: string | number | null;
  venue?: string | null;
  url?: string | null;
  doi?: string | null;
  source?: string | null;
};

export type PublicPersonResearchGrant = {
  title?: string | null;
  funder?: string | null;
  role?: string | null;
  amount?: string | number | null;
  year?: string | number | null;
  status?: string | null;
  source?: string | null;
};

export type PublicPersonGenericRecord = {
  title?: string | null;
  name?: string | null;
  award?: string | null;
  recognition?: string | null;
  referee?: string | null;
  citation?: string | null;
  description?: string | null;
  summary?: string | null;
  year?: string | number | null;
  date?: string | number | null;
  venue?: string | null;
  organization?: string | null;
  institution?: string | null;
  funder?: string | null;
  contact?: string | null;
  source?: string | null;
  role?: string | null;
  url?: string | null;
  type?: string | null;
  category?: string | null;
};

export type PublicPersonProfile = {
  id: string;
  slug?: string | null;
  title?: string | null;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  alternative_email?: string | null;
  alternative_phone?: string | null;
  photo_id?: string | null;
  photo_url?: string | null;
  cv_file_id?: string | null;
  cv_file_url?: string | null;
  bio?: string | null;
  full_bio?: string | null;
  qualifications?: Array<Record<string, unknown>> | null;
  education_background?: Array<Record<string, unknown>> | null;
  professional_memberships?: Array<Record<string, unknown>> | null;
  awards_honors?: Array<Record<string, unknown>> | null;
  department_id?: string | null;
  department_name?: string | null;
  school_id?: string | null;
  school_name?: string | null;
  academic_rank?: string | null;
  specialization?: string | null;
  research_interests?: string[] | null;
  teaching_areas?: string[] | null;
  publications?: PublicPersonPublication[] | null;
  research_grants_won?: PublicPersonResearchGrant[] | null;
  innovations?: PublicPersonGenericRecord[] | null;
  book_publications?: PublicPersonPublication[] | null;
  community_outreach?: PublicPersonGenericRecord[] | null;
  referees?: PublicPersonGenericRecord[] | null;
  courses_taught?: string[] | null;
  office_location?: string | null;
  office_hours?: Record<string, unknown> | string | null;
  office_phone?: string | null;
  institutional_role?: string | null;
  leadership_message?: string | null;
  is_researcher?: boolean | null;
  website_url?: string | null;
  linkedin_url?: string | null;
  google_scholar_id?: string | null;
  google_scholar_url?: string | null;
  orcid?: string | null;
  researchgate_url?: string | null;
  scopus_id?: string | null;
  publications_count?: number | null;
  h_index?: number | null;
  assignments?: PublicPersonAssignment[];
};

export type PublicPersonAssignmentEntity = {
  entity_type?: string | null;
  id?: string | null;
  name?: string | null;
  slug?: string | null;
  kind?: string | null;
};

export type PublicPersonAssignment = PublicTeamAssignment & {
  entity?: PublicPersonAssignmentEntity | null;
};

type PublicPersonResponse = {
  data?: PublicPersonProfile;
};

const VC_PROFILE_ID = "9bddbf62-fddd-4d60-82e8-dd43be3bbf9f";

const officialVcProfile: Partial<PublicPersonProfile> = {
  email: "nogechi@kisiiuniversity.ac.ke",
  phone: "+254726297952",
  office_location: "Office of the Vice Chancellor, Kisii University",
  office_phone: "+254726297952",
  bio: "Prof. Dr. Nathan Oyori Ogechi is the Vice-Chancellor of Kisii University, serving as secretary to Council, day-to-day administrative and academic head, chair of the University Management Board, and chair of Senate.",
  full_bio:
    "Prof. Dr. Nathan Oyori Ogechi is the Vice-Chancellor of Kisii University. His career spans university leadership, research, teaching, publishing, translation, and language policy work. Before joining Kisii University as Vice-Chancellor in September 2023, he served Moi University in senior leadership roles including Deputy Vice Chancellor for Student Affairs, Acting Deputy Vice Chancellor for Administration, Planning and Development, Acting Deputy Vice Chancellor for Academics, Research and Extension, Dean of the School of Arts and Social Sciences, and Head of the Department of Kiswahili and Other African Languages. He is a Professor of African Linguistics whose work focuses on African languages, Kiswahili, Ekegusii, Sheng, language contact, communication, linguistic human rights, language planning, and transformative leadership.",
  academic_rank: "professor",
  specialization:
    "Linguistics and African Languages with a focus on Kiswahili, Ekegusii and Sheng codes; Translation and Communication",
  is_researcher: true,
  cv_file_url:
    "https://kisiiuniversity.ac.ke/storage/public/downloads//CV%20Nathan%20Ogechi.pdf",
  publications_count: 59,
  qualifications: [
    {
      degree: "PhD",
      field: "African Linguistics",
      institution: "University of Hamburg, Germany",
      year: 2000,
    },
    {
      degree: "MPhil.",
      field: "Kiswahili Studies",
      institution: "Moi University, Eldoret",
      year: 1993,
    },
    {
      degree: "B.Ed (Arts)",
      field: "Arts",
      institution: "Moi University, Eldoret",
      year: 1990,
    },
  ],
  research_interests: [
    "Language contact phenomena",
    "Language and culture",
    "Language education",
    "Morphosyntax",
    "Phonology",
    "African languages and publishing",
    "Ethno-semantics",
    "Onomastics",
    "Communication",
    "Linguistic human rights",
    "Language and HIV/Aids",
    "Language and politics",
    "Language and new communication technologies",
    "Language and peace",
    "Language, ethnicity and identity",
    "Language planning",
    "Transformative leadership",
    "Language and race",
  ],
  publications: [
    {
      title: "Taratibu za Kuendesha Utafiti na Masuala Mengine",
      citation:
        "Ogechi, N. O. (2024). Taratibu za Kuendesha Utafiti na Masuala Mengine. Nairobi: Jomo Kenyatta Foundation.",
      year: 2024,
      source: "Book",
    },
    {
      title: "Trilingual Codeswitching in Kenya",
      citation:
        "N. O. Ogechi. 2005. Trilingual Codeswitching in Kenya – Evidence from Ekegusii, Kiswahili, English and Sheng.",
      year: 2005,
      source: "Book",
      url: "http://www.sub.uni-hamburg.de/opus/volltexte/2005/2749/",
    },
    {
      title:
        "Learning transformative leadership through student activism in Kenya",
      citation:
        "Ogechi, N. O. 2024. Learning transformative leadership through student activism in Kenya. In Transformative Leadership in African Contexts: Strategies for Social Change. Durban: HSRC. Pp. 207-222.",
      year: 2024,
      source: "Book chapter",
    },
    {
      title: "Legitimization and leadership communication during crisis",
      citation:
        "G. E. Aberi & N. O. Ogechi. 2025. Legitimization and leadership communication during crisis: A case study of President Uhuru Kenyatta’s political speeches on the COVID-19 pandemic. Journal of Linguistic and Communication Studies 4 (2): 1-17.",
      year: 2025,
      venue: "Journal of Linguistic and Communication Studies",
      source: "Journal article",
    },
    {
      title: "Ethnicity, language and identity in Kenya",
      citation:
        "N. O. Ogechi. 2019. Ethnicity, language and identity in Kenya. Modern Africa: Politics, History and Society 7 (1): 113-137.",
      year: 2019,
      venue: "Modern Africa: Politics, History and Society",
      source: "Journal article",
    },
    {
      title: "On Language Rights in Kenya",
      citation:
        "N. O. Ogechi. 2003. On Language Rights in Kenya. Nordic Journal of African Studies 12 (3): 277-295.",
      year: 2003,
      venue: "Nordic Journal of African Studies",
      source: "Journal article",
    },
  ],
  research_grants_won: [
    {
      title:
        "Linguistic Human Rights and Language Policy in the Kenyan Educational System",
      funder:
        "Organization of Social Science Research in Eastern Africa (OSSREA)",
      amount: "US$ 21,000",
      role: "Project preparation and fund management",
      source: "Official CV",
    },
    {
      title: "Africa Multiple Cluster Centre of Excellence in African Studies",
      funder: "Deutsche Forschungs Gemeinschaft (DFG)",
      amount: "US$ 1,270,000",
      role: "Member",
      year: 2019,
      source: "Official CV",
    },
    {
      title: "Research Chair on language education in HERI-Africa",
      funder: "Harnessing Educational Research for Impact in Africa",
      role: "Research Chair",
      source: "Official CV",
    },
  ],
  awards_honors: [
    {
      award: "DAAD scholarship for PhD studies",
      organization: "Deutsche Akademischer Austausch Dienst (DAAD)",
      year: 2000,
    },
    {
      award: "Senior Scholars Research Grant",
      organization:
        "Organization of Social Science Research in Eastern Africa (OSSREA)",
      year: 2004,
    },
    {
      award: "World Bank travel and subsistence award",
      organization: "World Bank",
      year: 2017,
    },
  ],
};

function enrichPublicPersonProfile(
  person: PublicPersonProfile,
): PublicPersonProfile {
  if (person.id !== VC_PROFILE_ID) return person;

  return {
    ...person,
    ...officialVcProfile,
    qualifications: officialVcProfile.qualifications ?? person.qualifications,
    assignments: person.assignments,
    photo_id: person.photo_id,
    photo_url: person.photo_url,
  };
}

export async function getPublicPersonProfile(
  personId: string,
): Promise<PublicPersonProfile | null> {
  try {
    const response = await mainApi.get<PublicPersonResponse>(
      `/api/v1/public/people/${encodeURIComponent(personId)}`,
    );

    return response.data ? enrichPublicPersonProfile(response.data) : null;
  } catch (error) {
    console.error("Failed to load public person profile:", error);
    return null;
  }
}
