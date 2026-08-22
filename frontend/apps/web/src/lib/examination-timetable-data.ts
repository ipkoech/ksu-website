import {
  academicCalendarsApi,
  documentsApi,
  mainApi,
  programmesApi,
  type AcademicCalendar,
} from "@ksu/api-client";

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

  const calendars =
    calendarResponse.status === "fulfilled"
      ? (calendarResponse.value.data ?? [])
      : [];
  const calendar =
    calendars.find((item) => item.status === "current") ?? calendars[0] ?? null;
  const programmes =
    programmesResponse.status === "fulfilled"
      ? (programmesResponse.value.data ?? []).map((item) => ({
          id: item.id,
          name: item.name,
          code: item.code,
        }))
      : [];
  const documents =
    documentsResponse.status === "fulfilled"
      ? documentsResponse.value.data ?? []
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
    records = response.data ?? [];
  } catch {
    records = [];
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
