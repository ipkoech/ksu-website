export type AcademicOrganizationMember = {
  id: string;
  name: string;
  title?: string | null;
  position?: string | null;
  role?: string | null;
  profile_url?: string | null;
  photo_url?: string | null;
  entity?: {
    id?: string | null;
    name?: string | null;
    slug?: string | null;
  } | null;
};

export type AcademicOrganizationTier = {
  key: "dvc" | "registrar" | "deans" | string;
  label: string;
  members: AcademicOrganizationMember[];
  count?: number;
};

export type AcademicOrganization = {
  key: string;
  label?: string | null;
  tiers: AcademicOrganizationTier[];
};
