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

const vcPublicationRecords: PublicPersonPublication[] = [
  {
    citation:
      "N. O. Ogechi. 2002. Mbinu za Mawasiliano kwa Kiswahili. Eldoret: Moi University Press.",
    year: 2002,
    source: "Book",
  },
  {
    citation:
      "N. O. Ogechi. 2005. Trilingual Codeswitching in Kenya – Evidence from Ekegusii, Kiswahili, English and Sheng. http://www.sub.uni-hamburg.de/opus/volltexte/2005/2749/.",
    year: 2005,
    source: "Book",
    url: "http://www.sub.uni-hamburg.de/opus/volltexte/2005/2749/",
  },
  {
    citation:
      "Kembo-Sure (ed.) with S. Waitiki & N. O. Ogechi. 2006. Language Planning for Development in Africa. Eldoret: Moi University Press.",
    year: 2006,
    source: "Book",
  },
  {
    citation:
      "N. O. Ogechi, N. L. Shitemi & K. I. Simala (eds.). 2008. Nadharia katika Taaluma ya Kiswahili na Lugha za Kiafrika. Eldoret: Moi University.",
    year: 2008,
    source: "Book",
  },
  {
    citation:
      "Kembo-Sure & N. O. Ogechi. 2009. Linguistic Human Rights and the Language Policy in the Kenyan Education System. Addis Ababa. OSSREA.",
    year: 2009,
    source: "Book",
  },
  {
    citation:
      "N. O. Ogechi (ed.). 2011. Themes in Language, Education and Development in Kenya. Ontario: Nsemia Publishers.",
    year: 2011,
    source: "Book",
  },
  {
    citation:
      "N. O. Ogechi, J. A. Ngala-Oduor & P. Iribemwangi (eds.) 2012a. The Harmonization and Standardization of Kenyan Languages; Orthography and Other Aspects. Cape Town: CASAS.",
    year: 2012,
    source: "Book",
  },
  {
    citation:
      "N. O. Ogechi, et al. 2012b. A Unified Orthography for Bantu Languages of Kenya (Kipokomo, Mijikenda, Kikuria, Gikuyu, Luhya, Dawida, Ekegusii, Kiikamba, Kiembu, Kimeru, Kiswahili). CASAS MONOGRAPH No. 249. Cape Town: CASAS.",
    year: 2012,
    source: "Book",
  },
  {
    citation:
      "M. M. Kandagor, N. O. Ogechi & C. Vierke (eds.). 2017. Lugha na Fasihi katika Karne ya Ishirini na Moja. Eldoret: Moi University Press.",
    year: 2017,
    source: "Book",
  },
  {
    citation:
      "Ogechi, N. O. (2024). Taratibu za Kuendesha Utafiti na Masuala Mengine. Nairobi: Jomo Kenyatta Foundation.",
    year: 2024,
    source: "Book",
  },
  {
    citation:
      "N. O. Ogechi. 2001. Publishing in Kiswahili and indigenous languages for enhanced adult education in Kenya. Afrikanistische Arbeitspapiere Swahili Forum VII In Honour of Gudrun Miehe 68: 185-199.",
    year: 2001,
    source: "Journal article",
  },
  {
    citation:
      "N.O. Ogechi & S. J. Ruto. 2001. Lakwa ko lakwa – Ein Kind ist ein Kind. Das Verständnis von Behinderung in der afrikanischen Kultur am Beispiel kenianischer Sprachen. In: Das Zeichen 58: 560–569.",
    year: 2001,
    source: "Journal article",
  },
  {
    citation:
      "N. O. Ogechi & S. J. Ruto. 2002. Portrayal of disability through personal names and proverbs in Kenya: Evidence from Ekegusii and Nandi. Stichproben: Wiener Zeitschrift für kritische Afrikastudien 3: 63-82.",
    year: 2002,
    source: "Journal article",
  },
  {
    citation:
      "N. O. Ogechi & E. K. Bosire-Ogechi. 2002. Educational publishing in African languages with a focus on Swahili in Kenya. Nordic Journal of African Studies 11, 2: 167-184.",
    year: 2002,
    source: "Journal article",
  },
  {
    citation:
      "N. O. Ogechi. 2003. Utegemezi au utegemeano baina ya Kenya na Tanzania katika ukuzaji na uendelezaji wa Kiswahili nchini Kenya? Afrikanistische Arbeitspapiere Swahili Forum IX: 155–172.",
    year: 2003,
    source: "Journal article",
  },
  {
    citation:
      "N. O. Ogechi. 2003. On Language Rights in Kenya. Nordic Journal of African Studies 12, 3: 277–295.",
    year: 2003,
    source: "Journal article",
  },
  {
    citation:
      "J. Jwan & N. O. Ogechi. 2004. Bilingual Education for Street Children in Kenya; Evidence from Language Mixing. Journal of Language and Learning 2, 2: 65-87.",
    year: 2004,
    source: "Journal article",
  },
  {
    citation:
      "N. O. Ogechi. 2004. Athari za mabadiliko ya mitaala ya Kiswahili katika uandishi na uchapishaji. Swahili Forum IX: 92–104.",
    year: 2004,
    source: "Journal article",
  },
  {
    citation:
      "N. O. Ogechi. 2004. Lexicalization in Sheng. Alternation 11, 2: 325–342.",
    year: 2004,
    source: "Journal article",
  },
  {
    citation:
      "N. O. Ogechi. 2005a. The language of sex and HIV/Aids among university students in Kenya. Stichproben: The Vienna Journal of African Studies, 9: 123–149.",
    year: 2005,
    source: "Journal article",
  },
  {
    citation:
      "N. O. Ogechi. 2005b. Does Sheng have a Kiswahili grammar? APAL Annual Publication in African Linguistics 3: 3-25.",
    year: 2005,
    source: "Journal article",
  },
  {
    citation:
      "N. O. Ogechi. 2009. The teaching of Kiswahili in Kenyan universities with emphasis on historiography. IFRA, Nairobi, Les Cahiers 40: 151-165.",
    year: 2009,
    source: "Journal article",
  },
  {
    citation:
      "N. O. Ogechi. 2009. The role of foreign and indigenous languages in primary schools: The case of Kenya. Stellenbosch Selected Papers in Linguistics (SPIL)-PLUS 38: 143-158.",
    year: 2009,
    source: "Journal article",
  },
  {
    citation:
      "N. O. Ogechi & Kembo-Sure. 2016. Literacy through a foreign language and children’s rights to education: An examination of Kenya’s medium of instruction policy. Nordic Journal of African Studies 25 (1): 92–106.",
    year: 2016,
    source: "Journal article",
  },
  {
    citation:
      "N. J. Cherono & N. O. Ogechi. 2018. Ujasiriamali wa Kiswahili nchini Kenya. Mwanga wa Lugha; Jarida la Idara ya Kiswahili na Lugha Nyingine za Kiafrika. 2 (1): 15-32.",
    year: 2018,
    source: "Journal article",
  },
  {
    citation:
      "H. K. Ibala, N. O. Ogechi & R. Oduori. 2018. Uchanganuzi wa tungo zenye Sheng kwa kutumia vigezo vya nadharia ya 4m. Realm International Kiswahili Journal 1 (1): 11-18.",
    year: 2018,
    source: "Journal article",
  },
  {
    citation:
      "H. K. Ibala, N. O. Ogechi & R. Oduori. 2018. Mdahalo kuhusu uPijini na uKriolishaji wa Sheng. Mara Research Journal of Kiswahili 3 (2): 45-54.",
    year: 2018,
    source: "Journal article",
  },
  {
    citation:
      "N. O. Ogechi. 2019. Ethnicity, language and identity in Kenya. Modern Africa: Politics, History and Society 7 (1): 113-137.",
    year: 2019,
    source: "Journal article",
  },
  {
    citation:
      "G. E. Aberi & N. O. Ogechi. 2025. Legitimization and leadership communication during crisis. A case study of President Uhuru Kenyatta’s political speeches on the COVID-19 pandemic. Journal of Linguistic and Communication Studies 4 (2): 1-17.",
    year: 2025,
    source: "Journal article",
  },
  {
    citation:
      "N. O. Ogechi. 2002a. The African languages dilemma in educational publishing in Kenya. In: F. Owino (ed.) Speaking African. Cape Town: CASAS. Pp. 329–336.",
    year: 2002,
    source: "Book chapter",
  },
  {
    citation:
      "N. O. Ogechi. 2002b. Publishing in Swahili: reality and challenges in Kenya. In: I. Simala K. (ed.) Utafiti wa Kiswahili. Eldoret: Moi University Press. Pp. 25-35.",
    year: 2002,
    source: "Book chapter",
  },
  {
    citation:
      "N. O. Ogechi. 2002. The base language question in Ekegusii, Kiswahili, English and Sheng codeswitching in Kenya. In: T. Schumann, M. Reh, R. Kiessling & L. Gerhadt (eds.) Aktuelle Forschungen zu afrikanischen Sprachen. Köln: Rüdiger Köppe. Pp. 93-114.",
    year: 2002,
    source: "Book chapter",
  },
  {
    citation:
      "Kembo-Sure, S. Waitiki & N. O. Ogechi. 2006. Introduction. In: Kembo-Sure, Serah Waitiki & Nathan O. Ogechi (eds.) Language Planning for Development in Africa. Eldoret: Moi University Press. Pp. xiii–xvi.",
    year: 2006,
    source: "Book chapter",
  },
  {
    citation:
      "N. O. Ogechi. 2006. Research on Sheng in Kenya: A State of the Art. Under My Africa’s Sky: History, Culture and Languages of Africa. Vol. 3. Moscow: Academy for research into the humanities. Pp. 137–149. (In Russian).",
    year: 2006,
    source: "Book chapter",
  },
  {
    citation:
      "Kembo-Sure & N. O. Ogechi. 2006. Language planning and language reform in Kenya. In: Kembo-Sure, Serah Waitiki & Nathan O. Ogechi (eds.) Language Planning for Development in Africa. Eldoret: Moi University Press. Pp. 37–54.",
    year: 2006,
    source: "Book chapter",
  },
  {
    citation:
      "N. O. Ogechi. 2006. Language and its usage. In: J. S. Akama & R. Maxon (eds.). Ethnography of the Gusii of Western Kenya; A Vanishing Cultural Heritage. New York: The Edwin Mellen Press, Ltd. Pp. 61–80.",
    year: 2006,
    source: "Book chapter",
  },
  {
    citation:
      "N. O. Ogechi. 2007. Building bridges through trichotomous youth identities in Kenya; Evidence from code-choice. In: K. Njogu & G. Oluoch-Olunya (eds.) Cultural Production and Social Change in Kenya: Building Bridges. Nairobi: Twaweza Communications. Pp. 129–150.",
    year: 2007,
    source: "Book chapter",
  },
  {
    citation:
      "N. O. Ogechi. 2008. Sheng as a youth identity marker; reality or misnomer? In: K. Njogu (ed.) Culture, Performance and Identity; Paths of Communication in Kenya. Nairobi: Twaweza Communications. Pp. 75–92.",
    year: 2008,
    source: "Book chapter",
  },
  {
    citation:
      "N. O. Ogechi. 2008. Kiswahili kina mchango gani katika Sheng? In: N.O. Ogechi, N. L. Shitemi & K. I. Simala (eds.) Nadharia katika Taaluma ya Kiswahili na Lugha za Kiafrika. Eldoret: Moi University Press. Pp. 227–242.",
    year: 2008,
    source: "Book chapter",
  },
  {
    citation:
      "N.O. Ogechi, N. L. Shitemi & K. I. Simala. 2008. Utangulizi. In: N.O. Ogechi, N. L. Shitemi & K. I. Simala (eds.) Nadharia katika Taaluma ya Kiswahili na Lugha za Kiafrika. Eldoret: Moi University Press. Pp. xiii–xix.",
    year: 2008,
    source: "Book chapter",
  },
  {
    citation:
      "N. O. Ogechi & E. Bosire-Ogechi. 2011. Identity and new communication technologies. In: D. N. Wachanga (ed.) Cultural Identity and New Communication Technologies: Political, Ethnic and Ideological Implications. Wisconsin: IGI Global, Pp. 23-39.",
    year: 2011,
    source: "Book chapter",
  },
  {
    citation:
      "N. O. Ogechi. 2011a. Comparative morphosyntax of Ekegusii and Kiswahili. In: N. O. Ogechi (ed.) Themes in Language, Literature and Education in Kenya. Ontario: Nsemia Inc. Publishers. Pp. 3-24.",
    year: 2011,
    source: "Book chapter",
  },
  {
    citation:
      "N. O. Ogechi. 2011b. Njeo na hali katika Kiswahili na lugha za Kibantu. In: N. O. Ogechi (ed.) Themes in Language, Literature and Education in Kenya. Ontario: Nsemia Inc. Publishers. Pp. 41-52.",
    year: 2011,
    source: "Book chapter",
  },
  {
    citation:
      "N. O. Ogechi. 2011c. Kiswahili kama silaha ya Afrika. In: N. O. Ogechi (ed.) Themes in Language, Literature and Education in Kenya. Ontario: Nsemia Inc. Publishers. Pp. 65-78.",
    year: 2011,
    source: "Book chapter",
  },
  {
    citation:
      "N. O. Ogechi. 2011d. Language turf wars in Kenya. In: N. O. Ogechi (ed.) Themes in Language, Literature and Education in Kenya. Ontario: Nsemia Inc. Publishers. Pp. 79-95.",
    year: 2011,
    source: "Book chapter",
  },
  {
    citation:
      "N. O. Ogechi. 2011e. A double-edged sword? The case of Kiswahili. In: N. O. Ogechi (ed.) Themes in Language, Literature and Education in Kenya. Ontario: Nsemia Inc. Publishers. Pp. 95-108.",
    year: 2011,
    source: "Book chapter",
  },
  {
    citation:
      "N. O. Ogechi. 2012a. Language situation in Kenya: Introduction. In: N. O. Ogechi, J. A. Ngala-Oduor (eds.) Harmonization and Standardization of Kenyan Languages; Orthography and Other Aspects. Cape Town: CASAS. Pp. 1-21.",
    year: 2012,
    source: "Book chapter",
  },
  {
    citation:
      "N. O. Ogechi. 2012b. Issues of morphosyntax and orthography in Ekegusii and Igikuria. In: N. O. Ogechi, J. A. Ngala-Oduor (eds.) Harmonization and Standardization of Kenyan Languages; Orthography and Other Aspects. Cape Town: CASAS. Pp. 81-99.",
    year: 2012,
    source: "Book chapter",
  },
  {
    citation:
      "S. J. Ruto & N. O. Ogechi. 2009. Understanding disability in indigenous African culture through Ekegusii and Nandi languages in Kenya. In: T. Bearth et al. Topics in Interdisciplinary African Studies Volume 15; African Languages in Global Society. Cologne: Ruediger Koeppe Verlag. Pp. 143-156.",
    year: 2009,
    source: "Book chapter",
  },
  {
    citation:
      "Ogechi, N. O. 2024. Learning transformative leadership through student activism in Kenya. In: S. Swartz, T. de Kock & C. A. Odora-Hoppers. (eds.) Transformative Leadership in African Contexts: Strategies for Social Change. Durban: HSRC. Pp. 207-222.",
    year: 2024,
    source: "Book chapter",
  },
  {
    citation:
      "Ogechi, N. O. 2026. Relics of imperialism? Racialization and language choice in multiracial Kenya. In: S. Makoni, B.E. Antia & S. Rudwick (eds.). The Routledge Handbook of Language and Race. London: Routledge. Pp. 354-377.",
    year: 2026,
    source: "Book chapter",
  },
  {
    citation:
      "N. O. Ogechi. 2002. Is it codeswitching, convergence or both in Ekegusii – Kiswahili-English mixing in Kenya? Paper presented at the L3 and third language acquisition conference at Fryske Akademy, Ljouwert/Leeuwarden, The Netherlands. 13th-15th September, 2001.",
    year: 2002,
    source: "Conference/Workshop Proceedings",
  },
  {
    citation:
      "N. O. Ogechi. 2004. Ethics in research design, strategies and settings; evidence from linguistic fieldwork. DAAD workshop on Research Ethics with the theme “Violation of social and scientific research ethics in Kenya and the way forward”. 12th February, 2004. Maseno University, Kenya. Pp. 137-149.",
    year: 2004,
    source: "Conference/Workshop Proceedings",
  },
  {
    citation:
      "Kembo-Sure & N. O. Ogechi. 2005. Linguistic human rights in Kenya. DAAD conference on Across Borders: Benefiting from Cultural Differences. 17th–18th March 2005. University of Nairobi. Pp. 25-42.",
    year: 2005,
    source: "Conference/Workshop Proceedings",
  },
  {
    citation:
      "N. O. Ogechi. 2006. “Nimewaambukiza virusi 118”: Lugha ya mapenzi na ukimwi nchini Kenya. In: S. S. Sewangi & J. S. Madumulla (eds.) Makala ya Kongamano la Kimataifa la Jubilei ya TUKI 2005. Dar salaam, Tanzania.",
    year: 2006,
    source: "Conference/Workshop Proceedings",
  },
  {
    citation:
      "E. K. Bosire-Ogechi & N. O. Ogechi. Use of Indigenous Languages for Instruction, Research and Knowledge Dissemination: The Case of Kiswahili in East African Universities. In: A. P. Ndofirepi, S. Vurayai & G. Erima (eds.) Unyoking African University Knowledges: Voices from the Subaltern. Leiden: Brill.",
    year: null,
    source: "In Press",
  },
  {
    citation:
      "N. O. Ogechi & M. N. Baya. Faharasa ya Istilahi za Isimu Jamii kwa Kiswahili. (Book-manuscript on Glossary of Sociolinguistic Terms in Kiswahili). Ontario: Nsemia Publishers.",
    year: null,
    source: "Accepted Manuscript",
  },
  {
    citation:
      "N. O. Ogechi. Uwezeshaji na umataifishaji wa Kiswahili kwa kurejelea maendeleo ya Afrika kwa karne moja (1963–2063).",
    year: null,
    source: "Book Manuscript in Progress",
  },
  {
    citation:
      "N. O. Ogechi. Isimujamii kwa Kiswahili. (Sociolinguistics in Kiswahili).",
    year: null,
    source: "Book Manuscript in Progress",
  },
];

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
  publications: vcPublicationRecords,
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
