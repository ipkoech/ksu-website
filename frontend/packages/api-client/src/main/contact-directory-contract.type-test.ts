import type { contactDirectoryApi } from "./api";
import type {
  Campus,
  PublicContactDirectory,
  PublicContactDirectoryEntry,
  PublicContactDirectoryParams,
  PublicContactFAQ,
  PublicUniversityContactSummary,
} from "./types";

const validParams: PublicContactDirectoryParams = {
  q: "registrar",
  contact_type: "office",
  scope_type: "campus",
  scope_id: "7ce1acb5-577b-48f7-bda6-ec44015a20ee",
  page: 1,
  per_page: 20,
};

type AggregateGetParams = Parameters<typeof contactDirectoryApi.get>[0];

const validCallParams: AggregateGetParams = validParams;
const omittedCallParams: AggregateGetParams = undefined;

// @ts-expect-error Aggregate queries do not support contact-list sorting.
const sortedCallParams: AggregateGetParams = { sort: "name_asc" };
// @ts-expect-error Aggregate queries do not support the main-contact filter.
const mainCallParams: AggregateGetParams = { is_main: true };
// @ts-expect-error Aggregate queries reject arbitrary query parameters.
const unexpectedCallParams: AggregateGetParams = { unexpected: "value" };

void validCallParams;
void omittedCallParams;
void sortedCallParams;
void mainCallParams;
void unexpectedCallParams;

const institution: PublicUniversityContactSummary = {
  id: "b063bb85-1d2e-40f5-bc75-b74e902bf648",
  name: "Kisii University",
  short_name: null,
  acronym: "KSU",
  email: null,
  phone: null,
  alternate_phone: null,
  website: null,
  postal_address: null,
  physical_address: null,
  city: null,
  county: null,
  country: null,
  social_links: null,
  cover_image_id: null,
  created_at: "2026-07-13T00:00:00Z",
  updated_at: "2026-07-13T00:00:00Z",
};

const contact: PublicContactDirectoryEntry = {
  id: "61df416c-fe5f-48dc-8ad2-249e36ba1991",
  name: "Registrar",
  contact_type: null,
  email: null,
  phone: null,
  extension: null,
  physical_address: null,
  building: null,
  room_number: null,
  operating_hours: null,
  contact_person_id: null,
  scope_type: null,
  scope_id: null,
  is_main: true,
  is_public: true,
  status: "active",
  created_at: "2026-07-13T00:00:00Z",
  updated_at: "2026-07-13T00:00:00Z",
};

const campus: Campus = {
  id: "8bfb90a9-f50e-4d10-9953-7db28575ff0e",
  name: "Main Campus",
  slug: "main-campus",
  code: "MAIN",
  campus_type: "main",
  address: null,
  city: null,
  county: null,
  postal_code: null,
  gps_latitude: null,
  gps_longitude: null,
  description: null,
  email: null,
  phone: null,
  cover_image_id: null,
  is_active: true,
  display_order: 1,
  created_at: "2026-07-13T00:00:00Z",
  updated_at: "2026-07-13T00:00:00Z",
};

const faq: PublicContactFAQ = {
  id: "f390f703-9b9e-4559-bf4f-f247d8142958",
  question: "How can I contact the registrar?",
  answer_plain_text: null,
  answer_rich_text: null,
  answer_structured: null,
  category: null,
  scope_type: null,
  scope_id: null,
  is_main: true,
  is_public: true,
  status: "published",
  display_order: 1,
  views_count: 0,
  helpful_count: 0,
  deleted_at: null,
  created_at: "2026-07-13T00:00:00Z",
  updated_at: "2026-07-13T00:00:00Z",
};

const directory: PublicContactDirectory = {
  institution,
  main_contacts: [contact],
  contacts: {
    items: [contact],
    meta: { page: 1, per_page: 20, total: 1, pages: 1 },
  },
  campuses: [campus],
  faqs: [faq],
};

void directory;

const faqWithNonEmittedAnswer: PublicContactFAQ = {
  ...faq,
  // @ts-expect-error FAQRead does not emit the legacy answer field.
  answer: "legacy",
};

void faqWithNonEmittedAnswer;
