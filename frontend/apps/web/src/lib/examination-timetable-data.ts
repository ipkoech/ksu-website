import "server-only";
import {
  academicCalendarsApi,
  documentsApi,
  mainApi,
  programmesApi,
  type AcademicCalendar,
  type Document,
  type Programme,
} from "@ksu/api-client/server";
import { uncachedPublicFallback } from "@/lib/public-fetch";
import { normalizePublicListResponse } from "@/lib/web-response-shapes";

export type TimetableProgramme = {
  id: string;
  name: string;
  code?: string | null;
};

export type TimetableVenue = {
  id?: string;
  name?: string | null;
  code?: string | null;
  building?: string | null;
};

export type ExaminationSitting = {
  id: string;
  course_code: string;
  course_title: string;
  sitting_date: string;
  start_time: string;
  end_time: string;
  cohort_label?: string | null;
  special_instructions?: string | null;
  status?: string | null;
  venue?: TimetableVenue | null;
  programmes?: TimetableProgramme[];
};

export type PublishedTimetable = {
  id: string;
  title: string;
  version: number;
  published_at?: string | null;
  notes?: string | null;
  fallback_document?: { slug?: string | null; title?: string | null } | null;
};

export type ExaminationTimetableData = {
  calendar: AcademicCalendar | null;
  timetable: PublishedTimetable | null;
  sittings: ExaminationSitting[];
  programmes: TimetableProgramme[];
  selectedProgrammeId?: string;
  courseCode?: string;
  fallbackDocument: { title: string; href: string } | null;
};

type TimetableEnvelope = {
  data?: Array<{ timetable?: PublishedTimetable; sittings?: ExaminationSitting[] }>;
};
type TimetableRecord = NonNullable<TimetableEnvelope["data"]>[number];

export async function getExaminationTimetableData(filters: {
  programme_id?: string;
  course_code?: string;
}): Promise<ExaminationTimetableData> {
  const selectedProgrammeId = filters.programme_id?.trim() || undefined;
  const courseCode = filters.course_code?.trim() || undefined;

  const [calendarResponse, programmesResponse, documentsResponse] =
    await Promise.allSettled([
      academicCalendarsApi.list({ per_page: 20 }),
      programmesApi.list({ per_page: 100, fields: "id,name,code" }),
      documentsApi.list({
        category: "examinations",
        per_page: 20,
        fields: "id,title,slug,document_type",
      }),
    ]);
  if ([calendarResponse, programmesResponse, documentsResponse].some((result) => result.status === "rejected")) {
    uncachedPublicFallback(null);
  }

  const calendars =
    calendarResponse.status === "fulfilled"
      ? normalizePublicListResponse<AcademicCalendar>(calendarResponse.value)?.data ??
        uncachedPublicFallback([])
      : [];
  const calendar =
    calendars.find((item) => item.status === "current") ?? calendars[0] ?? null;
  const programmes =
    programmesResponse.status === "fulfilled"
      ? (normalizePublicListResponse<Programme>(programmesResponse.value)?.data ??
          uncachedPublicFallback([])).map((item) => ({
          id: item.id,
          name: item.name,
          code: item.code,
        }))
      : [];
  const documents =
    documentsResponse.status === "fulfilled"
      ? normalizePublicListResponse<Document>(documentsResponse.value)?.data ??
        uncachedPublicFallback([])
      : [];
  const fallback =
    documents.find((item) => item.title.toLowerCase().includes("timetable")) ??
    documents[0];

  let records: TimetableEnvelope["data"] = [];
  try {
    const response = await mainApi.get<TimetableEnvelope>(
      "/api/v1/timetables",
      {
        timetable_type: "examination",
        calendar_id: calendar?.id,
        programme_id: selectedProgrammeId,
      },
    );
    const normalized = normalizePublicListResponse<TimetableRecord>(response);
    if (!normalized) throw new Error("Invalid examination timetable response");
    records = normalized.data;
  } catch {
    records = uncachedPublicFallback([]);
  }

  const record = records[0];
  let sittings = record?.sittings ?? [];
  if (courseCode) {
    const normalized = courseCode.toLowerCase();
    sittings = sittings.filter(
      (item) =>
        item.course_code.toLowerCase().includes(normalized) ||
        item.course_title.toLowerCase().includes(normalized),
    );
  }
  sittings = sittings.slice().sort(
    (first, second) =>
      first.sitting_date.localeCompare(second.sitting_date) ||
      first.start_time.localeCompare(second.start_time) ||
      first.course_code.localeCompare(second.course_code),
  );

  return {
    calendar,
    timetable: record?.timetable ?? null,
    sittings,
    programmes,
    selectedProgrammeId,
    courseCode,
    fallbackDocument: fallback
      ? { title: fallback.title, href: `/downloads/${fallback.slug}` }
      : null,
  };
}
