export const researchSiteUrl =
  process.env.NEXT_PUBLIC_RESEARCH_FRONTEND_URL ??
  "https://research.kisiiuniversity.ac.ke";

export const institutionContact = {
  address: "Main Campus, Kisii, Kenya",
  postalAddress: "P.O. Box 408-40200, Kisii, Kenya",
  phone: "+254 773 452 323",
  phoneHref: "tel:+254773452323",
  email: "research@kisiiuniversity.ac.ke",
  emailHref: "mailto:research@kisiiuniversity.ac.ke",
} as const;

export const institutionSocialLinks = {
  facebook: "https://facebook.com/kisiiuniversity",
  twitter: "https://twitter.com/kisiiuniversity",
  instagram: "https://instagram.com/kisiiuniversity",
  youtube: "https://youtube.com/@kisiiuniversity",
  linkedin: "https://linkedin.com/school/kisiiuniversity",
} as const;

export const institutionLinks = {
  university: "https://kisiiuniversity.ac.ke/",
  nacosti: "https://research-portal.nacosti.go.ke/",
} as const;
