/**
 * Student life editorial content for the /campus-life storytelling landing.
 * Story bodies live in the CMS (seeded from the Student Life collection);
 * this module carries the page structure: categories, story cards, covers
 * and gallery imagery extracted from the official story documents.
 */

export type StudentLifeCategoryId =
  | "art-culture"
  | "careers"
  | "student-health"
  | "leadership"
  | "research-innovation"
  | "clubs-societies"
  | "accommodation";

export interface StudentLifeStoryCard {
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  gallery?: string[];
}

export interface StudentLifeCategory {
  id: StudentLifeCategoryId;
  label: string;
  title: string;
  narrative: string;
  image: string;
  imageAlt: string;
  stories: StudentLifeStoryCard[];
  exploreHref?: string;
  exploreLabel?: string;
}

const media = (slug: string, name: string) =>
  `/images/student-life/${slug}/${name}.jpg`;

export const studentLifeHero = {
  title: "Life Around Studies",
  intro:
    "Through a wide range of programmes coordinated by the Department of Student Affairs, Kisii University nurtures well-rounded graduates — supporting student welfare, leadership, culture, service and professional growth across every semester.",
  image: media("empowering-student-life", "image1"),
  imageAlt: "Kisii University students during a student affairs programme",
  storySlug: "empowering-student-life",
};

export const studentLifeClosingGallery = {
  title: "A semester in pictures",
  images: [
    media("empowering-student-life", "image2"),
    media("empowering-student-life", "image3"),
    media("empowering-student-life", "image4"),
    media("empowering-student-life", "image5"),
  ],
};

export const studentLifeCategories: StudentLifeCategory[] = [
  {
    id: "art-culture",
    label: "Art & Culture",
    title: "Culture is lived here, not archived",
    narrative:
      "Music, dance, heritage and expression run through campus life. Every year the Cultural Festival spills out of the university and into the streets of Kisii Town — a colourful celebration of heritage, diversity and national pride carried by the students themselves.",
    image: media("cultural-festival-11th", "image1"),
    imageAlt: "Procession at the 11th Kisii University Cultural Festival",
    stories: [
      {
        slug: "cultural-festival-11th",
        title:
          "Celebrating Culture, Unity and Identity at the 11th Cultural Festival",
        excerpt:
          "The vibrant spirit of culture came alive as the university launched its 11th Cultural Festival under the theme “Our Flag, Our Future: Youth Shaping Kenya's Cultural Identity.”",
        cover: media("cultural-festival-11th", "image2"),
        gallery: [
          media("cultural-festival-11th", "image3"),
          media("cultural-festival-11th", "image4"),
        ],
      },
    ],
    exploreHref: "/campus-life/gallery",
    exploreLabel: "Explore culture & arts",
  },
  {
    id: "careers",
    label: "Careers",
    title: "Prepared for the world of work",
    narrative:
      "A degree opens the door; preparation walks you through it. Career guidance, mentorship, industry linkages and student-led professional summits connect Kisii University students to the working world long before graduation day.",
    image: media("career-guidance", "image4"),
    imageAlt: "Career guidance session at Kisii University",
    stories: [
      {
        slug: "career-guidance",
        title:
          "Shaping Futures: Empowering Students Through Career Guidance and Professional Development",
        excerpt:
          "Employers increasingly seek graduates with practical skills, professional networks and adaptability — and the university has built the programmes to deliver exactly that.",
        cover: media("career-guidance", "image1"),
        gallery: [
          media("career-guidance", "image2"),
          media("career-guidance", "image3"),
          media("career-guidance", "image6"),
        ],
      },
      {
        slug: "hr-students-summit",
        title: "Executive Presence: HR Students Push the Agenda Further",
        excerpt:
          "Over five hundred students and seasoned professionals converged at the Old Amphitheatre for a defining academic and professional summit led by the HR Students' Association.",
        cover: media("hr-students-summit", "image2"),
        gallery: [
          media("hr-students-summit", "image1"),
          media("hr-students-summit", "image3"),
        ],
      },
    ],
  },
  {
    id: "student-health",
    label: "Student Health",
    title: "Wellbeing first — and students who save lives",
    narrative:
      "Health on campus goes beyond the clinic. Alongside campus health and counselling services, student volunteers train to act when seconds matter — turning ordinary members of the university community into first responders.",
    image: media("st-john-95th-parade", "image2"),
    imageAlt: "St. John Ambulance Kisii University Division members",
    stories: [
      {
        slug: "st-john-lifesavers",
        title:
          "From Students to Lifesavers: The St. John Ambulance KSU Division",
        excerpt:
          "When an emergency strikes there is rarely time to think. Survival often depends on the person standing closest — and at Kisii University, that person is trained.",
        cover: media("st-john-95th-parade", "image2"),
      },
    ],
    exploreHref: "/campus-life/health-services",
    exploreLabel: "Explore health services",
  },
  {
    id: "leadership",
    label: "Leadership",
    title: "Leadership is practised, not just taught",
    narrative:
      "From national parade grounds to elegant evenings honouring discipline and excellence, Kisii University students learn responsibility by carrying it — in service organisations, student government and every stage in between.",
    image: media("st-john-95th-parade", "image1"),
    imageAlt:
      "Kisii University members at the 95th St. John Ambulance Annual Parade",
    stories: [
      {
        slug: "st-john-95th-parade",
        title:
          "Honouring Service and Leadership at the 95th St. John Annual Parade",
        excerpt:
          "Kisii University proudly joined the national community at the 95th Annual Parade Inspection of the St. John Ambulance, hosted by His Excellency the President.",
        cover: media("st-john-95th-parade", "image1"),
      },
      {
        slug: "top-achievers-dinner",
        title: "Celebrating Excellence Beyond the Classroom",
        excerpt:
          "The Top Achievers Dinner brought together the university's most outstanding students for an elegant evening honouring dedication, talent and resilience.",
        cover: media("top-achievers-dinner", "image2"),
        gallery: [media("top-achievers-dinner", "image1")],
      },
    ],
  },
  {
    id: "research-innovation",
    label: "Research & Innovation",
    title: "Ideas that refuse to wait for graduation",
    narrative:
      "In April 2026 the university made history with its first-ever Innovation Week — four days, more than 300 participants and 97 exhibitors co-creating a sustainable future through interdisciplinary research, green innovation and community impact.",
    image: media("innovation-week", "image3"),
    imageAlt: "Exhibition during Kisii University's inaugural Innovation Week",
    stories: [
      {
        slug: "innovation-week",
        title: "The Inaugural Innovation Week: Co-creating a Sustainable Future",
        excerpt:
          "A bold declaration of the university's transformation into an innovation-driven institution — students, researchers and partners building the future side by side.",
        cover: media("innovation-week", "image1"),
        gallery: [media("innovation-week", "image2")],
      },
    ],
    exploreHref: "/research",
    exploreLabel: "Explore research",
  },
  {
    id: "clubs-societies",
    label: "Clubs & Societies",
    title: "Communities that compete at national level",
    narrative:
      "Dozens of clubs and societies turn interests into impact — academic, professional and personal. Some carry the university's name all the way to State House, where Kisii University clubs have received national recognition from the President.",
    image: media("best-tax-club-award", "image1"),
    imageAlt: "Kisii University Tax Club recognition at State House, Nairobi",
    stories: [
      {
        slug: "best-tax-club-award",
        title: "Crowned Best University Tax Club in National Recognition",
        excerpt:
          "The Best University Tax Club Award, presented at State House, Nairobi by His Excellency the President, recognises excellence, civic responsibility and transformative education.",
        cover: media("best-tax-club-award", "image1"),
      },
      {
        slug: "tax-society-recognition",
        title:
          "Tax Society Wins National Recognition for Advancing Tax Literacy",
        excerpt:
          "The university's Tax Society earned the prestigious Best Tax Club Award during the 2025 Taxpayers' Day celebrations for advancing tax literacy and civic responsibility.",
        cover: media("best-tax-club-award", "image1"),
      },
    ],
    exploreHref: "/campus-life/clubs",
    exploreLabel: "Explore clubs & societies",
  },
  {
    id: "accommodation",
    label: "Accommodation",
    title: "A supportive place to live and learn",
    narrative:
      "Learning well starts with living well. University hostels and accommodation options keep students close to lectures, libraries, and the communities that make campus feel like home — with housing guidance available for every budget.",
    image: "/images/homepage/kisii-administration-campus.jpg",
    imageAlt: "Kisii University campus",
    stories: [],
    exploreHref: "/campus-life/accommodation",
    exploreLabel: "Explore accommodation",
  },
];
