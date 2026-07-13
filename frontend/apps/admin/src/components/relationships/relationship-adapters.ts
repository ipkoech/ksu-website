import {
  academicCalendarsApi,
  contactsApi,
  departmentsApi,
  divisionsApi,
  governanceApi,
  intakesApi,
  libraryServiceApi,
  researchServiceApi,
  mediaApi,
  personsApi,
  programmesApi,
  schoolsApi,
  slidersApi,
  staffApi,
  usersApi,
  wingsApi,
  type AcademicCalendar,
  type Board,
  type ContactOwnerScopeType,
  type Department,
  type Division,
  type Intake,
  type LibraryBranch,
  type LibraryElectronicResource,
  type LibraryResource,
  type LibraryStaff,
  type Media,
  type MediaFolder,
  type Person,
  type Programme,
  type ResearchDonor,
  type ResearchGenericRecord,
  type ResearchProject,
  type StaffAssignment,
  type School,
  type SliderGroup,
  type StaffEntityOption,
  type User,
  type Wing,
} from "@ksu/api-client";

export type RelationshipFilters = Record<string, string | number | boolean | null | undefined>;

export type RelationshipOption = {
  id: string;
  label: string;
  description?: string;
  eyebrow?: string;
  imageUrl?: string | null;
  disabled?: boolean;
  raw?: unknown;
};

export type RelationshipSearchArgs<TFilters extends RelationshipFilters = RelationshipFilters> = {
  search?: string;
  filters?: TFilters;
  limit?: number;
};

export type RelationshipAdapter<TFilters extends RelationshipFilters = RelationshipFilters> = {
  key: string;
  entityType: string;
  label: string;
  pluralLabel: string;
  searchPlaceholder: string;
  emptyLabel: string;
  requiredFilterMessage?: string | ((filters?: TFilters) => string | null);
  search: (args: RelationshipSearchArgs<TFilters>) => Promise<RelationshipOption[]>;
  get: (id: string, filters?: TFilters) => Promise<RelationshipOption | null>;
};

const defaultLimit = 50;

function joinDescription(parts: Array<string | number | boolean | null | undefined>) {
  return parts
    .filter((part) => part !== undefined && part !== null && String(part).trim() !== "")
    .map(String)
    .join(" · ");
}

function fullName(person: Pick<Person, "full_name" | "first_name" | "middle_name" | "last_name">) {
  return person.full_name || [person.first_name, person.middle_name, person.last_name].filter(Boolean).join(" ");
}

function matches(option: RelationshipOption, search?: string) {
  const term = search?.trim().toLowerCase();
  if (!term) return true;
  return [option.label, option.description, option.eyebrow]
    .filter(Boolean)
    .some((part) => String(part).toLowerCase().includes(term));
}

function limitOptions(options: RelationshipOption[], limit = defaultLimit) {
  return options.slice(0, limit);
}

function personOption(person: Person): RelationshipOption {
  return {
    id: person.id,
    label: fullName(person),
    description: joinDescription([person.email, person.department?.name ?? person.department_name, person.is_active === false ? "Inactive" : undefined]),
    eyebrow: person.title,
    imageUrl: person.photo_url,
    raw: person,
  };
}

function userOption(user: User): RelationshipOption {
  return {
    id: user.id,
    label: user.full_name || user.email,
    description: joinDescription([user.full_name ? user.email : undefined, user.is_active === false ? "Inactive" : undefined]),
    raw: user,
  };
}

function schoolOption(school: School): RelationshipOption {
  return {
    id: school.id,
    label: school.name,
    description: joinDescription([school.code, school.school_type, school.is_active === false ? "Inactive" : undefined]),
    raw: school,
  };
}

function departmentOption(department: Department): RelationshipOption {
  return {
    id: department.id,
    label: department.name,
    description: joinDescription([department.code, department.school_name, department.department_type, department.is_active === false ? "Inactive" : undefined]),
    raw: department,
  };
}

function programmeOption(programme: Programme): RelationshipOption {
  return {
    id: programme.id,
    label: programme.name,
    description: joinDescription([programme.code, programme.level, programme.department_name, programme.is_active === false ? "Inactive" : undefined]),
    raw: programme,
  };
}

function divisionOption(division: Division): RelationshipOption {
  return {
    id: division.id,
    label: division.name,
    description: joinDescription([division.code, division.division_type, division.is_active === false ? "Inactive" : undefined]),
    raw: division,
  };
}

function wingOption(wing: Wing): RelationshipOption {
  return {
    id: wing.id,
    label: wing.name,
    description: joinDescription([wing.code, wing.wing_type, wing.is_active === false ? "Inactive" : undefined]),
    raw: wing,
  };
}

function intakeOption(intake: Intake): RelationshipOption {
  return {
    id: intake.id,
    label: intake.name,
    description: joinDescription([intake.code, intake.is_open ? "Open" : "Closed", intake.is_active === false ? "Inactive" : undefined]),
    raw: intake,
  };
}

function academicCalendarOption(calendar: AcademicCalendar): RelationshipOption {
  return {
    id: calendar.id,
    label: `${calendar.academic_year} Semester ${calendar.semester}`,
    description: joinDescription([calendar.status, `${calendar.start_date} to ${calendar.end_date}`]),
    raw: calendar,
  };
}

function boardOption(board: Board): RelationshipOption {
  return {
    id: board.id,
    label: board.name,
    description: joinDescription([board.board_type, board.status, board.is_active === false ? "Inactive" : undefined]),
    raw: board,
  };
}

function sliderGroupOption(group: SliderGroup): RelationshipOption {
  return {
    id: group.id,
    label: group.name,
    description: joinDescription([group.location, group.is_main ? "Main" : undefined, group.is_active === false ? "Inactive" : undefined]),
    raw: group,
  };
}

function mediaFolderOption(folder: MediaFolder): RelationshipOption {
  return {
    id: folder.id,
    label: folder.name,
    description: joinDescription([folder.slug, folder.is_public ? "Public" : "Private"]),
    raw: folder,
  };
}

function mediaOption(media: Media): RelationshipOption {
  return {
    id: media.id,
    label: media.title || media.original_filename || media.filename,
    description: joinDescription([media.media_type, media.mime_type, media.is_public ? "Public" : "Private"]),
    imageUrl: media.thumbnail_url || media.public_url || media.url,
    raw: media,
  };
}

function staffEntityOption(entity: StaffEntityOption): RelationshipOption {
  return {
    id: entity.id ?? "__university__",
    label: entity.label,
    description: joinDescription([entity.subtitle, entity.entity_type, entity.is_active === false ? "Inactive" : undefined]),
    raw: entity,
  };
}

function libraryBranchOption(branch: LibraryBranch): RelationshipOption {
  return {
    id: branch.id,
    label: branch.name,
    description: joinDescription([branch.short_name, branch.library_type, branch.is_active === false ? "Inactive" : undefined]),
    raw: branch,
  };
}

function libraryResourceOption(resource: LibraryResource): RelationshipOption {
  return {
    id: resource.id,
    label: resource.title,
    description: joinDescription([resource.authors, resource.resource_type, resource.status, resource.available_copies !== undefined ? `${resource.available_copies} available` : undefined]),
    raw: resource,
  };
}

function libraryStaffOption(staff: LibraryStaff): RelationshipOption {
  const person = staff.person;
  const name =
    person?.full_name ||
    person?.title ||
    staff.job_title ||
    "Library staff";
  return {
    id: staff.id,
    label: name,
    description: joinDescription([
      staff.job_title,
      staff.department,
      staff.role,
      staff.is_active === false ? "Inactive" : undefined,
    ]),
    imageUrl: person?.photo || null,
    raw: staff,
  };
}

function libraryElectronicResourceOption(resource: LibraryElectronicResource): RelationshipOption {
  return {
    id: resource.id,
    label: resource.name,
    description: joinDescription([resource.provider, resource.resource_type, resource.access_level, resource.is_active === false ? "Inactive" : undefined]),
    raw: resource,
  };
}

function researchDonorOption(donor: ResearchDonor): RelationshipOption {
  const individualName = [donor.first_name, donor.last_name].filter(Boolean).join(" ");
  return {
    id: donor.id,
    label: donor.display_name || donor.organization_name || individualName || "Unnamed donor",
    description: joinDescription([
      donor.email,
      donor.donor_type,
      donor.tier,
      donor.donation_count !== undefined ? `${donor.donation_count} donations` : undefined,
      donor.is_active === false ? "Inactive" : undefined,
    ]),
    raw: donor,
  };
}

function researchRecordOption(record: ResearchGenericRecord | ResearchProject): RelationshipOption {
  return {
    id: record.id,
    label: record.title ?? ("name" in record ? record.name : undefined) ?? record.slug ?? record.id,
    description: joinDescription([
      record.code,
      "center" in record ? record.center?.name : undefined,
      "category" in record ? record.category : undefined,
      record.project_type,
      record.status,
      record.is_active === false ? "Inactive" : undefined,
    ]),
    raw: record,
  };
}

function staffAssignmentOption(assignment: StaffAssignment): RelationshipOption {
  const person = assignment.person;
  const personName = person ? fullName(person) : "Staff assignment";
  return {
    id: assignment.id,
    label: joinDescription([personName, assignment.role_display ?? assignment.role]),
    description: joinDescription([
      assignment.title,
      assignment.entity?.name,
      assignment.entity_type,
      assignment.status,
    ]),
    raw: assignment,
  };
}

export const personRelationshipAdapter: RelationshipAdapter<{ status?: string; school_id?: string; department_id?: string }> = {
  key: "person",
  entityType: "person",
  label: "Person",
  pluralLabel: "People",
  searchPlaceholder: "Search people by name, email, or staff details",
  emptyLabel: "No people found.",
  async search({ search, filters, limit = defaultLimit }) {
    const response = await personsApi.listAdmin({
      per_page: limit,
      search: search?.trim() || undefined,
      status: (filters?.status as any) || "all",
      school_id: filters?.school_id || undefined,
      department_id: filters?.department_id || undefined,
      fields: "id,title,first_name,middle_name,last_name,full_name,email,photo_id,photo_url,department_id,is_active",
      include: "department:id,name,code,school_id",
    });
    return (response.data ?? []).map(personOption);
  },
  async get(id) {
    const response = await personsApi.get(id, {
      fields: "id,title,first_name,middle_name,last_name,full_name,email,photo_id,photo_url,department_id,is_active",
      include: "department:id,name,code,school_id",
    });
    return response.data ? personOption(response.data) : null;
  },
};

export const userRelationshipAdapter: RelationshipAdapter<{ is_active?: boolean }> = {
  key: "user",
  entityType: "user",
  label: "User",
  pluralLabel: "Users",
  searchPlaceholder: "Search users by name or email",
  emptyLabel: "No users found.",
  async search({ search, filters, limit = defaultLimit }) {
    const response = await usersApi.list({
      per_page: limit,
      search: search?.trim() || undefined,
      is_active: filters?.is_active ?? true,
      fields: "id,email,full_name,is_active",
    });
    return (response.data ?? []).map(userOption);
  },
  async get(id) {
    const response = await usersApi.get(id, { fields: "id,email,full_name,is_active" });
    return response.data ? userOption(response.data) : null;
  },
};

export const schoolRelationshipAdapter: RelationshipAdapter = {
  key: "school",
  entityType: "school",
  label: "School",
  pluralLabel: "Schools",
  searchPlaceholder: "Search schools by name or code",
  emptyLabel: "No schools found.",
  async search({ search, limit = defaultLimit }) {
    const response = await schoolsApi.listAdmin({ per_page: limit, search: search?.trim() || undefined, fields: "id,name,code,slug,school_type,is_active" });
    return (response.data ?? []).map(schoolOption);
  },
  async get(id) {
    const response = await schoolsApi.get(id, { fields: "id,name,code,slug,school_type,is_active" });
    return response.data ? schoolOption(response.data) : null;
  },
};

export const departmentRelationshipAdapter: RelationshipAdapter<{ school_id?: string; wing_id?: string; department_type?: string }> = {
  key: "department",
  entityType: "department",
  label: "Department",
  pluralLabel: "Departments",
  searchPlaceholder: "Search departments by name or code",
  emptyLabel: "No departments found.",
  async search({ search, filters, limit = defaultLimit }) {
    const response = await departmentsApi.listAdmin({
      per_page: limit,
      search: search?.trim() || undefined,
      school_id: filters?.school_id || undefined,
      wing_id: filters?.wing_id || undefined,
      department_type: filters?.department_type || undefined,
      fields: "id,name,code,slug,school_id,school_name,department_type,is_active",
    });
    return (response.data ?? []).map(departmentOption);
  },
  async get(id) {
    const response = await departmentsApi.get(id, { fields: "id,name,code,slug,school_id,school_name,department_type,is_active" });
    return response.data ? departmentOption(response.data) : null;
  },
};

export const programmeRelationshipAdapter: RelationshipAdapter<{ school_id?: string; department_id?: string; level?: string }> = {
  key: "programme",
  entityType: "programme",
  label: "Programme",
  pluralLabel: "Programmes",
  searchPlaceholder: "Search programmes by name or code",
  emptyLabel: "No programmes found.",
  async search({ search, filters, limit = defaultLimit }) {
    const response = await programmesApi.listAdmin({
      per_page: limit,
      q: search?.trim() || undefined,
      school_id: filters?.school_id || undefined,
      department_id: filters?.department_id || undefined,
      level: filters?.level || undefined,
      fields: "id,name,code,slug,level,department_id,department_name,is_active",
    });
    return (response.data ?? []).map(programmeOption);
  },
  async get(id) {
    const response = await programmesApi.get(id, { fields: "id,name,code,slug,level,department_id,department_name,is_active" });
    return response.data ? programmeOption(response.data) : null;
  },
};

export const divisionRelationshipAdapter: RelationshipAdapter<{ is_active?: boolean }> = {
  key: "division",
  entityType: "division",
  label: "Division",
  pluralLabel: "Divisions",
  searchPlaceholder: "Search divisions by name or code",
  emptyLabel: "No divisions found.",
  async search({ search, filters, limit = defaultLimit }) {
    const response = await divisionsApi.listAdmin({
      per_page: 100,
      is_active: filters?.is_active ?? undefined,
      fields: "id,name,code,slug,division_type,is_active",
    });
    return limitOptions((response.data ?? []).map(divisionOption).filter((option) => matches(option, search)), limit);
  },
  async get(id) {
    const response = await divisionsApi.get(id, { fields: "id,name,code,slug,division_type,is_active" });
    return response.data ? divisionOption(response.data) : null;
  },
};

export const wingRelationshipAdapter: RelationshipAdapter<{ division_id?: string; is_active?: boolean }> = {
  key: "wing",
  entityType: "wing",
  label: "Wing",
  pluralLabel: "Wings",
  searchPlaceholder: "Search wings by name or code",
  emptyLabel: "No wings found.",
  async search({ search, filters, limit = defaultLimit }) {
    const response = await wingsApi.listAdmin({
      per_page: 100,
      division_id: filters?.division_id || undefined,
      is_active: filters?.is_active ?? undefined,
      fields: "id,name,code,slug,division_id,is_active",
    });
    return limitOptions((response.data ?? []).map(wingOption).filter((option) => matches(option, search)), limit);
  },
  async get(id) {
    const response = await wingsApi.get(id, { fields: "id,name,code,slug,division_id,is_active" });
    return response.data ? wingOption(response.data) : null;
  },
};

export const intakeRelationshipAdapter: RelationshipAdapter<{ academic_calendar_id?: string; is_open?: boolean }> = {
  key: "intake",
  entityType: "intake",
  label: "Intake",
  pluralLabel: "Intakes",
  searchPlaceholder: "Search intakes by name or code",
  emptyLabel: "No intakes found.",
  async search({ search, filters, limit = defaultLimit }) {
    const response = await intakesApi.listAdmin({
      per_page: 100,
      academic_calendar_id: filters?.academic_calendar_id || undefined,
      is_open: filters?.is_open ?? undefined,
      fields: "id,name,code,slug,is_open,is_active",
    });
    return limitOptions((response.data ?? []).map(intakeOption).filter((option) => matches(option, search)), limit);
  },
  async get(id) {
    const response = await intakesApi.get(id, { fields: "id,name,code,slug,is_open,is_active" });
    return response.data ? intakeOption(response.data) : null;
  },
};

export const academicCalendarRelationshipAdapter: RelationshipAdapter<{ status?: string; academic_year?: string }> = {
  key: "academic-calendar",
  entityType: "academic_calendar",
  label: "Academic Calendar",
  pluralLabel: "Academic Calendars",
  searchPlaceholder: "Search calendars by academic year or semester",
  emptyLabel: "No academic calendars found.",
  async search({ search, filters, limit = defaultLimit }) {
    const response = await academicCalendarsApi.listAdmin({
      per_page: 100,
      status: filters?.status || undefined,
      academic_year: filters?.academic_year || undefined,
      fields: "id,academic_year,semester,start_date,end_date,status",
    });
    return limitOptions((response.data ?? []).map(academicCalendarOption).filter((option) => matches(option, search)), limit);
  },
  async get(id) {
    const response = await academicCalendarsApi.get(id, { fields: "id,academic_year,semester,start_date,end_date,status" });
    return response.data ? academicCalendarOption(response.data) : null;
  },
};

export const governanceBoardRelationshipAdapter: RelationshipAdapter<{ board_type?: string; parent_entity_type?: string; parent_entity_id?: string }> = {
  key: "governance-board",
  entityType: "governance_board",
  label: "Board",
  pluralLabel: "Boards",
  searchPlaceholder: "Search governance boards",
  emptyLabel: "No governance boards found.",
  async search({ search, filters, limit = defaultLimit }) {
    const response = await governanceApi.listBoards({
      board_type: filters?.board_type || undefined,
      parent_entity_type: filters?.parent_entity_type || undefined,
      parent_entity_id: filters?.parent_entity_id || undefined,
      fields: "id,name,slug,board_type,status,is_active",
    });
    return limitOptions((response.data ?? []).map(boardOption).filter((option) => matches(option, search)), limit);
  },
  async get(id) {
    const response = await governanceApi.getBoard(id, { fields: "id,name,slug,board_type,status,is_active" });
    return response.data ? boardOption(response.data) : null;
  },
};

export const sliderGroupRelationshipAdapter: RelationshipAdapter<{ scope_type?: string; scope_id?: string; is_main?: boolean }> = {
  key: "slider-group",
  entityType: "slider_group",
  label: "Slider group",
  pluralLabel: "Slider groups",
  searchPlaceholder: "Search slider groups",
  emptyLabel: "No slider groups found.",
  async search({ search, filters, limit = defaultLimit }) {
    const response = await slidersApi.listGroups({
      scope_type: filters?.scope_type || undefined,
      scope_id: filters?.scope_id || undefined,
      is_main: filters?.is_main ?? undefined,
      fields: "id,name,slug,location,is_main,is_active",
    });
    return limitOptions((response.data ?? []).map(sliderGroupOption).filter((option) => matches(option, search)), limit);
  },
  async get(id) {
    const response = await slidersApi.getGroup(id, { fields: "id,name,slug,location,is_main,is_active" });
    return response.data ? sliderGroupOption(response.data) : null;
  },
};

export const mediaFolderRelationshipAdapter: RelationshipAdapter<{ parent_id?: string; scope_type?: string; scope_id?: string }> = {
  key: "media-folder",
  entityType: "media_folder",
  label: "Media folder",
  pluralLabel: "Media folders",
  searchPlaceholder: "Search media folders",
  emptyLabel: "No media folders found.",
  async search({ search, filters, limit = defaultLimit }) {
    const response = await mediaApi.listFolders({
      parent_id: filters?.parent_id || undefined,
      scope_type: filters?.scope_type || undefined,
      scope_id: filters?.scope_id || undefined,
      fields: "id,name,slug,is_public,parent_id,scope_type,scope_id",
    });
    return limitOptions((response.data ?? []).map(mediaFolderOption).filter((option) => matches(option, search)), limit);
  },
  async get(id) {
    const response = await mediaApi.getFolder(id, { fields: "id,name,slug,is_public,parent_id,scope_type,scope_id" });
    return response.data ? mediaFolderOption(response.data) : null;
  },
};

export const mediaRelationshipAdapter: RelationshipAdapter<{ media_type?: string; folder_id?: string }> = {
  key: "media",
  entityType: "media",
  label: "Media asset",
  pluralLabel: "Media assets",
  searchPlaceholder: "Search media assets",
  emptyLabel: "No media assets found.",
  async search({ search, filters, limit = defaultLimit }) {
    const response = await mediaApi.list({
      page: 1,
      per_page: limit,
      search: search?.trim() || undefined,
      media_type: filters?.media_type || undefined,
      folder_id: filters?.folder_id || undefined,
      fields: "id,title,filename,original_filename,media_type,mime_type,is_public,thumbnail_url,public_url,url",
    });
    return (response.data ?? []).map(mediaOption);
  },
  async get(id) {
    const response = await mediaApi.get(id, {
      fields: "id,title,filename,original_filename,media_type,mime_type,is_public,thumbnail_url,public_url,url",
    });
    return response.data ? mediaOption(response.data) : null;
  },
};

export const staffEntityRelationshipAdapter: RelationshipAdapter<{ entity_type: string }> = {
  key: "staff-entity",
  entityType: "staff_entity",
  label: "Entity",
  pluralLabel: "Entities",
  searchPlaceholder: "Search matching entities",
  emptyLabel: "No entities found.",
  requiredFilterMessage: (filters) => (filters?.entity_type ? null : "Choose an entity type first."),
  async search({ search, filters, limit = defaultLimit }) {
    if (!filters?.entity_type) return [];
    const response = await staffApi.listEntities({
      entity_type: filters.entity_type,
      search: search?.trim() || undefined,
      limit,
    });
    return (response.data ?? []).map(staffEntityOption);
  },
  async get(id, filters) {
    if (!filters?.entity_type) return null;
    const response = await staffApi.listEntities({
      entity_type: filters.entity_type,
      limit: 100,
    });
    const option = (response.data ?? []).map(staffEntityOption).find((item) => item.id === id);
    return option ?? null;
  },
};

export const contactOwnerRelationshipAdapter: RelationshipAdapter<{
  entity_type: ContactOwnerScopeType;
}> = {
  key: "contact-owner",
  entityType: "contact_owner",
  label: "Contact owner",
  pluralLabel: "Contact owners",
  searchPlaceholder: "Search authorized contact owners",
  emptyLabel: "No authorized contact owners found.",
  requiredFilterMessage: (filters) =>
    filters?.entity_type ? null : "Choose an owner type first.",
  async search({ search, filters, limit = defaultLimit }) {
    if (!filters?.entity_type) return [];
    const response = await contactsApi.listOwners({
      scope_type: filters.entity_type,
      q: search?.trim() || undefined,
      limit,
    });
    return (response.data ?? []).map(staffEntityOption);
  },
  async get(id, filters) {
    if (!filters?.entity_type) return null;
    const response = await contactsApi.listOwners({
      scope_type: filters.entity_type,
      limit: 100,
    });
    return (
      (response.data ?? [])
        .map(staffEntityOption)
        .find((option) => option.id === id) ?? null
    );
  },
};

export const libraryBranchRelationshipAdapter: RelationshipAdapter<{ active_only?: boolean }> = {
  key: "library-branch",
  entityType: "library_branch",
  label: "Library branch",
  pluralLabel: "Library branches",
  searchPlaceholder: "Search library branches",
  emptyLabel: "No library branches found.",
  async search({ search, filters, limit = defaultLimit }) {
    const response = await libraryServiceApi.branches.list({
      active_only: filters?.active_only ?? false,
      page: 1,
      per_page: 100,
      fields: "id,name,short_name,slug,library_type,is_active",
    });
    return limitOptions((response.data ?? []).map(libraryBranchOption).filter((option) => matches(option, search)), limit);
  },
  async get(id) {
    const response = await libraryServiceApi.branches.get(id, { fields: "id,name,short_name,slug,library_type,is_active" });
    return response.data ? libraryBranchOption(response.data) : null;
  },
};

export const libraryResourceRelationshipAdapter: RelationshipAdapter<{ library_id?: string; resource_type?: string; status?: string }> = {
  key: "library-resource",
  entityType: "library_resource",
  label: "Library resource",
  pluralLabel: "Library resources",
  searchPlaceholder: "Search resources by title, author, ISBN, or barcode",
  emptyLabel: "No resources found.",
  async search({ search, filters, limit = defaultLimit }) {
    const branchIds = filters?.library_id
      ? [filters.library_id]
      : (await libraryServiceApi.branches.list({
          active_only: true,
          page: 1,
          per_page: 20,
          fields: "id",
        })).data?.map((branch) => branch.id) ?? [];
    if (branchIds.length === 0) return [];
    const responses = await Promise.all(
      branchIds.map((library_id) =>
        libraryServiceApi.resources.list({
          library_id,
          resource_type: filters?.resource_type || undefined,
          status: filters?.status || undefined,
          q: search?.trim() || undefined,
          page: 1,
          per_page: limit,
          fields: "id,title,authors,resource_type,status,available_copies",
        }),
      ),
    );
    return limitOptions(responses.flatMap((response) => response.data ?? []).map(libraryResourceOption), limit);
  },
  async get(id) {
    const response = await libraryServiceApi.resources.get(id, { fields: "id,title,authors,resource_type,status,available_copies" });
    return response.data ? libraryResourceOption(response.data) : null;
  },
};

export const libraryStaffRelationshipAdapter: RelationshipAdapter<{ library_id?: string; role?: string }> = {
  key: "library-staff",
  entityType: "library_staff",
  label: "Library staff",
  pluralLabel: "Library staff",
  searchPlaceholder: "Search library staff by name, role, or department",
  emptyLabel: "No library staff found.",
  async search({ search, filters, limit = defaultLimit }) {
    const branchIds = filters?.library_id
      ? [filters.library_id]
      : (await libraryServiceApi.branches.list({
          active_only: true,
          page: 1,
          per_page: 20,
          fields: "id",
        })).data?.map((branch) => branch.id) ?? [];
    if (branchIds.length === 0) return [];
    const responses = await Promise.all(
      branchIds.map((library_id) =>
        libraryServiceApi.staff.list({
          library_id,
          role: filters?.role || undefined,
          fields:
            "id,job_title,department,role,is_active,person:id,title,full_name,email,photo",
        } as any),
      ),
    );
    return limitOptions(
      responses
        .flatMap((response) => response.data ?? [])
        .map(libraryStaffOption)
        .filter((option) => matches(option, search)),
      limit,
    );
  },
  async get(id, filters) {
    const options = await this.search({ filters, limit: 100 });
    return options.find((option) => option.id === id) ?? null;
  },
};

export const libraryElectronicResourceRelationshipAdapter: RelationshipAdapter<{ library_id?: string; resource_type?: string; access_level?: string; is_active?: boolean }> = {
  key: "library-electronic-resource",
  entityType: "library_electronic_resource",
  label: "Electronic resource",
  pluralLabel: "Electronic resources",
  searchPlaceholder: "Search e-resources by name, provider, or subject",
  emptyLabel: "No electronic resources found.",
  async search({ search, filters, limit = defaultLimit }) {
    const response = await libraryServiceApi.databases.list({
      page: 1,
      per_page: limit,
      search: search?.trim() || undefined,
      library_id: filters?.library_id || undefined,
      resource_type: filters?.resource_type || undefined,
      access_level: filters?.access_level || undefined,
      is_active: filters?.is_active ?? undefined,
      fields: "id,name,provider,resource_type,access_level,is_active",
    });
    return (response.data ?? []).map(libraryElectronicResourceOption);
  },
  async get(id) {
    const response = await libraryServiceApi.databases.get(id, {
      fields: "id,name,provider,resource_type,access_level,is_active",
    });
    return response.data ? libraryElectronicResourceOption(response.data) : null;
  },
};

export const researchDonorRelationshipAdapter: RelationshipAdapter<{ is_active?: boolean }> = {
  key: "research-donor",
  entityType: "research_donor",
  label: "Donor",
  pluralLabel: "Donors",
  searchPlaceholder: "Search donors by name, organization, or email",
  emptyLabel: "No donors found.",
  async search({ search, filters, limit = defaultLimit }) {
    const response = await researchServiceApi.donors.list({
      page: 1,
      per_page: limit,
      search: search?.trim() || undefined,
      is_active: filters?.is_active ?? undefined,
    });
    return (response.data ?? []).map(researchDonorOption);
  },
  async get(id, filters) {
    const response = await researchServiceApi.donors.list({
      page: 1,
      per_page: 100,
      is_active: filters?.is_active ?? undefined,
    });
    return (response.data ?? []).map(researchDonorOption).find((item) => item.id === id) ?? null;
  },
};

export const researchCenterRelationshipAdapter: RelationshipAdapter<{ is_active?: boolean }> = {
  key: "research-center",
  entityType: "research_center",
  label: "Research center",
  pluralLabel: "Research centers",
  searchPlaceholder: "Search research centers",
  emptyLabel: "No research centers found.",
  async search({ search, filters, limit = defaultLimit }) {
    const response = await researchServiceApi.centers.list({
      page: 1,
      per_page: limit,
      search: search?.trim() || undefined,
      is_active: filters?.is_active ?? undefined,
    });
    return (response.data ?? []).map(researchRecordOption);
  },
  async get(id, filters) {
    const response = await researchServiceApi.centers.list({
      page: 1,
      per_page: 100,
      is_active: filters?.is_active ?? undefined,
    });
    return (response.data ?? []).map(researchRecordOption).find((item) => item.id === id) ?? null;
  },
};

export const researchProgramRelationshipAdapter: RelationshipAdapter<{ is_active?: boolean; center_id?: string }> = {
  key: "research-program",
  entityType: "research_program",
  label: "Research program",
  pluralLabel: "Research programs",
  searchPlaceholder: "Search research programs",
  emptyLabel: "No research programs found.",
  async search({ search, filters, limit = defaultLimit }) {
    const response = await researchServiceApi.programs.list({
      page: 1,
      per_page: limit,
      search: search?.trim() || undefined,
      is_active: filters?.is_active ?? undefined,
      center_id: filters?.center_id || undefined,
    });
    return (response.data ?? []).map(researchRecordOption);
  },
  async get(id, filters) {
    const response = await researchServiceApi.programs.list({
      page: 1,
      per_page: 100,
      is_active: filters?.is_active ?? undefined,
      center_id: filters?.center_id || undefined,
    });
    return (response.data ?? []).map(researchRecordOption).find((item) => item.id === id) ?? null;
  },
};

export const researchProjectRelationshipAdapter: RelationshipAdapter<{ is_active?: boolean; is_public?: boolean; project_type?: string }> = {
  key: "research-project",
  entityType: "research_project",
  label: "Research project",
  pluralLabel: "Research projects",
  searchPlaceholder: "Search research projects",
  emptyLabel: "No research projects found.",
  async search({ search, filters, limit = defaultLimit }) {
    const response = await researchServiceApi.projects.list({
      page: 1,
      per_page: limit,
      search: search?.trim() || undefined,
      is_active: filters?.is_active ?? undefined,
      is_public: filters?.is_public ?? undefined,
      project_type: filters?.project_type || undefined,
      fields: "id,title,slug,code,center_id,project_type,status,is_active",
      include: "center:id,name,code",
    });
    return (response.data ?? []).map(researchRecordOption);
  },
  async get(id, filters) {
    const response = await researchServiceApi.projects.list({
      page: 1,
      per_page: 100,
      is_active: filters?.is_active ?? undefined,
      is_public: filters?.is_public ?? undefined,
      project_type: filters?.project_type || undefined,
      fields: "id,title,slug,code,center_id,project_type,status,is_active",
      include: "center:id,name,code",
    });
    return (response.data ?? []).map(researchRecordOption).find((item) => item.id === id) ?? null;
  },
};

export const researchFarmRelationshipAdapter: RelationshipAdapter<{ is_active?: boolean; is_public?: boolean; farm_type?: string }> = {
  key: "research-farm",
  entityType: "research_farm",
  label: "Research farm",
  pluralLabel: "Research farms",
  searchPlaceholder: "Search research farms",
  emptyLabel: "No research farms found.",
  async search({ search, filters, limit = defaultLimit }) {
    const response = await researchServiceApi.farms.list({
      page: 1,
      per_page: limit,
      search: search?.trim() || undefined,
      is_active: filters?.is_active ?? undefined,
      is_public: filters?.is_public ?? undefined,
      farm_type: filters?.farm_type || undefined,
      fields: "id,name,slug,code,farm_type,county,is_active,is_public",
    });
    return (response.data ?? []).map(researchRecordOption);
  },
  async get(id, filters) {
    const response = await researchServiceApi.farms.list({
      page: 1,
      per_page: 100,
      is_active: filters?.is_active ?? undefined,
      is_public: filters?.is_public ?? undefined,
      farm_type: filters?.farm_type || undefined,
      fields: "id,name,slug,code,farm_type,county,is_active,is_public",
    });
    return (response.data ?? []).map(researchRecordOption).find((item) => item.id === id) ?? null;
  },
};

export const researchGrantRelationshipAdapter: RelationshipAdapter<{ is_active?: boolean; status?: string }> = {
  key: "research-grant",
  entityType: "research_grant",
  label: "Research grant",
  pluralLabel: "Research grants",
  searchPlaceholder: "Search research grants",
  emptyLabel: "No research grants found.",
  async search({ search, filters, limit = defaultLimit }) {
    const response = await researchServiceApi.grants.list({
      page: 1,
      per_page: limit,
      search: search?.trim() || undefined,
      is_active: filters?.is_active ?? undefined,
      status: filters?.status || undefined,
    });
    return (response.data ?? []).map(researchRecordOption);
  },
  async get(id, filters) {
    const response = await researchServiceApi.grants.list({
      page: 1,
      per_page: 100,
      is_active: filters?.is_active ?? undefined,
      status: filters?.status || undefined,
    });
    return (response.data ?? []).map(researchRecordOption).find((item) => item.id === id) ?? null;
  },
};

export const researchInnovationRelationshipAdapter: RelationshipAdapter<{ is_active?: boolean; status?: string; innovation_type?: string }> = {
  key: "research-innovation",
  entityType: "research_innovation",
  label: "Innovation",
  pluralLabel: "Innovations",
  searchPlaceholder: "Search innovations by title, code, or type",
  emptyLabel: "No innovations found.",
  async search({ search, filters, limit = defaultLimit }) {
    const response = await researchServiceApi.innovations.list({
      page: 1,
      per_page: limit,
      search: search?.trim() || undefined,
      is_active: filters?.is_active ?? undefined,
      status: filters?.status || undefined,
      innovation_type: filters?.innovation_type || undefined,
      fields: "id,title,slug,code,innovation_type,development_stage,status,is_active",
    });
    return (response.data ?? []).map(researchRecordOption);
  },
  async get(id, filters) {
    const response = await researchServiceApi.innovations.list({
      page: 1,
      per_page: 100,
      is_active: filters?.is_active ?? undefined,
      status: filters?.status || undefined,
      innovation_type: filters?.innovation_type || undefined,
      fields: "id,title,slug,code,innovation_type,development_stage,status,is_active",
    });
    return (response.data ?? []).map(researchRecordOption).find((item) => item.id === id) ?? null;
  },
};

export const researchStartupRelationshipAdapter: RelationshipAdapter<{ is_active?: boolean; status?: string; venture_stage?: string }> = {
  key: "research-startup",
  entityType: "research_startup",
  label: "Startup",
  pluralLabel: "Startups",
  searchPlaceholder: "Search startups by name, code, or stage",
  emptyLabel: "No startups found.",
  async search({ search, filters, limit = defaultLimit }) {
    const response = await researchServiceApi.startups.list({
      page: 1,
      per_page: limit,
      search: search?.trim() || undefined,
      is_active: filters?.is_active ?? undefined,
      status: filters?.status || undefined,
      venture_stage: filters?.venture_stage || undefined,
      fields: "id,name,slug,code,venture_stage,registration_status,status,is_active",
    });
    return (response.data ?? []).map(researchRecordOption);
  },
  async get(id, filters) {
    const response = await researchServiceApi.startups.list({
      page: 1,
      per_page: 100,
      is_active: filters?.is_active ?? undefined,
      status: filters?.status || undefined,
      venture_stage: filters?.venture_stage || undefined,
      fields: "id,name,slug,code,venture_stage,registration_status,status,is_active",
    });
    return (response.data ?? []).map(researchRecordOption).find((item) => item.id === id) ?? null;
  },
};

export const researchFunderRelationshipAdapter: RelationshipAdapter<{ is_active?: boolean; funder_type?: string }> = {
  key: "research-funder",
  entityType: "research_funder",
  label: "Research funder",
  pluralLabel: "Research funders",
  searchPlaceholder: "Search research funders",
  emptyLabel: "No research funders found.",
  async search({ search, filters, limit = defaultLimit }) {
    const response = await researchServiceApi.funders.list({
      page: 1,
      per_page: limit,
      search: search?.trim() || undefined,
      is_active: filters?.is_active ?? undefined,
      funder_type: filters?.funder_type || undefined,
      fields: "id,name,slug,acronym,funder_type,is_active",
    });
    return (response.data ?? []).map(researchRecordOption);
  },
  async get(id, filters) {
    const response = await researchServiceApi.funders.list({
      page: 1,
      per_page: 100,
      is_active: filters?.is_active ?? undefined,
      funder_type: filters?.funder_type || undefined,
      fields: "id,name,slug,acronym,funder_type,is_active",
    });
    return (response.data ?? []).map(researchRecordOption).find((item) => item.id === id) ?? null;
  },
};

export const researchSustainabilityRelationshipAdapter: RelationshipAdapter<{ is_active?: boolean; status?: string; initiative_type?: string }> = {
  key: "research-sustainability",
  entityType: "research_sustainability",
  label: "Sustainability initiative",
  pluralLabel: "Sustainability initiatives",
  searchPlaceholder: "Search sustainability initiatives",
  emptyLabel: "No sustainability initiatives found.",
  async search({ search, filters, limit = defaultLimit }) {
    const response = await researchServiceApi.sustainability.list({
      page: 1,
      per_page: limit,
      search: search?.trim() || undefined,
      is_active: filters?.is_active ?? undefined,
      status: filters?.status || undefined,
      initiative_type: filters?.initiative_type || undefined,
      fields: "id,name,slug,code,initiative_type,status,is_active",
    });
    return (response.data ?? []).map(researchRecordOption);
  },
  async get(id, filters) {
    const response = await researchServiceApi.sustainability.list({
      page: 1,
      per_page: 100,
      is_active: filters?.is_active ?? undefined,
      status: filters?.status || undefined,
      initiative_type: filters?.initiative_type || undefined,
      fields: "id,name,slug,code,initiative_type,status,is_active",
    });
    return (response.data ?? []).map(researchRecordOption).find((item) => item.id === id) ?? null;
  },
};

export const researchEndowmentRelationshipAdapter: RelationshipAdapter<{ is_active?: boolean; status?: string }> = {
  key: "research-endowment",
  entityType: "research_endowment",
  label: "Endowment fund",
  pluralLabel: "Endowment funds",
  searchPlaceholder: "Search endowment funds",
  emptyLabel: "No endowment funds found.",
  async search({ search, filters, limit = defaultLimit }) {
    const response = await researchServiceApi.endowments.list({
      page: 1,
      per_page: limit,
      search: search?.trim() || undefined,
      is_active: filters?.is_active ?? undefined,
      status: filters?.status || undefined,
    });
    return (response.data ?? []).map(researchRecordOption);
  },
  async get(id, filters) {
    const response = await researchServiceApi.endowments.list({
      page: 1,
      per_page: 100,
      is_active: filters?.is_active ?? undefined,
      status: filters?.status || undefined,
    });
    return (response.data ?? []).map(researchRecordOption).find((item) => item.id === id) ?? null;
  },
};

export const researchJournalRelationshipAdapter: RelationshipAdapter<{ is_active?: boolean }> = {
  key: "research-journal",
  entityType: "research_journal",
  label: "Journal",
  pluralLabel: "Journals",
  searchPlaceholder: "Search journals",
  emptyLabel: "No journals found.",
  async search({ search, filters, limit = defaultLimit }) {
    const response = await researchServiceApi.journals.list({
      page: 1,
      per_page: limit,
      search: search?.trim() || undefined,
      is_active: filters?.is_active ?? undefined,
    });
    return (response.data ?? []).map(researchRecordOption);
  },
  async get(id, filters) {
    const response = await researchServiceApi.journals.list({
      page: 1,
      per_page: 100,
      is_active: filters?.is_active ?? undefined,
    });
    return (response.data ?? []).map(researchRecordOption).find((item) => item.id === id) ?? null;
  },
};

export const researchGrantApplicationRelationshipAdapter: RelationshipAdapter<{ status?: string }> = {
  key: "research-grant-application",
  entityType: "research_grant_application",
  label: "Grant application",
  pluralLabel: "Grant applications",
  searchPlaceholder: "Search grant applications",
  emptyLabel: "No grant applications found.",
  async search({ search, filters, limit = defaultLimit }) {
    const response = await researchServiceApi.grantApplications.list({
      page: 1,
      per_page: limit,
      search: search?.trim() || undefined,
      status: filters?.status || undefined,
    });
    return (response.data ?? []).map(researchRecordOption);
  },
  async get(id, filters) {
    const response = await researchServiceApi.grantApplications.list({
      page: 1,
      per_page: 100,
      status: filters?.status || undefined,
    });
    return (response.data ?? []).map(researchRecordOption).find((item) => item.id === id) ?? null;
  },
};

export const researchMentorshipRelationshipAdapter: RelationshipAdapter<{ is_active?: boolean; status?: string }> = {
  key: "research-mentorship",
  entityType: "research_mentorship",
  label: "Mentorship program",
  pluralLabel: "Mentorship programs",
  searchPlaceholder: "Search mentorship programs",
  emptyLabel: "No mentorship programs found.",
  async search({ search, filters, limit = defaultLimit }) {
    const response = await researchServiceApi.mentorship.list({
      page: 1,
      per_page: limit,
      search: search?.trim() || undefined,
      is_active: filters?.is_active ?? undefined,
      status: filters?.status || undefined,
    });
    return (response.data ?? []).map(researchRecordOption);
  },
  async get(id, filters) {
    const response = await researchServiceApi.mentorship.list({
      page: 1,
      per_page: 100,
      is_active: filters?.is_active ?? undefined,
      status: filters?.status || undefined,
    });
    return (response.data ?? []).map(researchRecordOption).find((item) => item.id === id) ?? null;
  },
};

export const researchScholarshipRelationshipAdapter: RelationshipAdapter<{ is_active?: boolean; status?: string }> = {
  key: "research-scholarship",
  entityType: "research_scholarship",
  label: "Scholarship",
  pluralLabel: "Scholarships",
  searchPlaceholder: "Search scholarships",
  emptyLabel: "No scholarships found.",
  async search({ search, filters, limit = defaultLimit }) {
    const response = await researchServiceApi.scholarships.list({
      page: 1,
      per_page: limit,
      search: search?.trim() || undefined,
      is_active: filters?.is_active ?? undefined,
      status: filters?.status || undefined,
    });
    return (response.data ?? []).map(researchRecordOption);
  },
  async get(id, filters) {
    const response = await researchServiceApi.scholarships.list({
      page: 1,
      per_page: 100,
      is_active: filters?.is_active ?? undefined,
      status: filters?.status || undefined,
    });
    return (response.data ?? []).map(researchRecordOption).find((item) => item.id === id) ?? null;
  },
};

export const researchPartnerRelationshipAdapter: RelationshipAdapter<{ is_active?: boolean; partner_type?: string; status?: string }> = {
  key: "research-partner",
  entityType: "research_partner",
  label: "Research partner",
  pluralLabel: "Research partners",
  searchPlaceholder: "Search research partners",
  emptyLabel: "No research partners found.",
  async search({ search, filters, limit = defaultLimit }) {
    const response = await researchServiceApi.partners.list({
      page: 1,
      per_page: limit,
      search: search?.trim() || undefined,
      is_active: filters?.is_active ?? undefined,
      partner_type: filters?.partner_type || undefined,
      status: filters?.status || undefined,
    });
    return (response.data ?? []).map(researchRecordOption);
  },
  async get(id, filters) {
    const response = await researchServiceApi.partners.list({
      page: 1,
      per_page: 100,
      is_active: filters?.is_active ?? undefined,
      partner_type: filters?.partner_type || undefined,
      status: filters?.status || undefined,
    });
    return (response.data ?? []).map(researchRecordOption).find((item) => item.id === id) ?? null;
  },
};

export const staffAssignmentRelationshipAdapter: RelationshipAdapter<{ status?: string; entity_type?: string; entity_id?: string }> = {
  key: "staff-assignment",
  entityType: "staff_assignment",
  label: "Staff assignment",
  pluralLabel: "Staff assignments",
  searchPlaceholder: "Search staff assignments",
  emptyLabel: "No staff assignments found.",
  async search({ search, filters, limit = defaultLimit }) {
    const response = await staffApi.listAssignments({
      page: 1,
      per_page: 100,
      status: (filters?.status as any) || "active",
      entity_type: filters?.entity_type || undefined,
      entity_id: filters?.entity_id || undefined,
      fields:
        "id,person_id,entity_type,entity_id,role,title,hierarchy_level,is_primary,is_acting,is_public,start_date,end_date,status,display_order",
      include:
        "person:id,title,first_name,middle_name,last_name,full_name,email,photo_url;entity",
    });
    return limitOptions((response.data ?? []).map(staffAssignmentOption).filter((option) => matches(option, search)), limit);
  },
  async get(id) {
    const response = await staffApi.getAssignment(id, {
      fields:
        "id,person_id,entity_type,entity_id,role,title,hierarchy_level,is_primary,is_acting,is_public,start_date,end_date,status,display_order",
      include:
        "person:id,title,first_name,middle_name,last_name,full_name,email,photo_url;entity",
    });
    return response.data ? staffAssignmentOption(response.data) : null;
  },
};

export const relationshipAdapters = {
  person: personRelationshipAdapter,
  user: userRelationshipAdapter,
  school: schoolRelationshipAdapter,
  department: departmentRelationshipAdapter,
  programme: programmeRelationshipAdapter,
  academicCalendar: academicCalendarRelationshipAdapter,
  division: divisionRelationshipAdapter,
  wing: wingRelationshipAdapter,
  intake: intakeRelationshipAdapter,
  governanceBoard: governanceBoardRelationshipAdapter,
  sliderGroup: sliderGroupRelationshipAdapter,
  media: mediaRelationshipAdapter,
  mediaFolder: mediaFolderRelationshipAdapter,
  staffEntity: staffEntityRelationshipAdapter,
  contactOwner: contactOwnerRelationshipAdapter,
  libraryBranch: libraryBranchRelationshipAdapter,
  libraryResource: libraryResourceRelationshipAdapter,
  libraryStaff: libraryStaffRelationshipAdapter,
  libraryElectronicResource: libraryElectronicResourceRelationshipAdapter,
  researchDonor: researchDonorRelationshipAdapter,
  researchCenter: researchCenterRelationshipAdapter,
  researchProgram: researchProgramRelationshipAdapter,
  researchProject: researchProjectRelationshipAdapter,
  researchFarm: researchFarmRelationshipAdapter,
  researchGrant: researchGrantRelationshipAdapter,
  researchInnovation: researchInnovationRelationshipAdapter,
  researchStartup: researchStartupRelationshipAdapter,
  researchFunder: researchFunderRelationshipAdapter,
  researchSustainability: researchSustainabilityRelationshipAdapter,
  researchEndowment: researchEndowmentRelationshipAdapter,
  researchJournal: researchJournalRelationshipAdapter,
  researchGrantApplication: researchGrantApplicationRelationshipAdapter,
  researchMentorship: researchMentorshipRelationshipAdapter,
  researchScholarship: researchScholarshipRelationshipAdapter,
  researchPartner: researchPartnerRelationshipAdapter,
  staffAssignment: staffAssignmentRelationshipAdapter,
};
