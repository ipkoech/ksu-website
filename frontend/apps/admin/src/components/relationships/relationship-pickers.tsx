"use client";

import {
  EntityPicker,
  EntityTypeRecordPicker,
  MultiEntityPicker,
  type EntityPickerProps,
  type EntityTypeRecordPickerProps,
  type MultiEntityPickerProps,
} from "./entity-picker";
import {
  departmentRelationshipAdapter,
  academicCalendarRelationshipAdapter,
  divisionRelationshipAdapter,
  governanceBoardRelationshipAdapter,
  intakeRelationshipAdapter,
  libraryBranchRelationshipAdapter,
  libraryResourceRelationshipAdapter,
  mediaFolderRelationshipAdapter,
  personRelationshipAdapter,
  programmeRelationshipAdapter,
  schoolRelationshipAdapter,
  sliderGroupRelationshipAdapter,
  staffEntityRelationshipAdapter,
  userRelationshipAdapter,
  type RelationshipFilters,
} from "./relationship-adapters";

type PickerProps<TFilters extends RelationshipFilters = RelationshipFilters> = Omit<EntityPickerProps<TFilters>, "adapter">;
type MultiPickerProps<TFilters extends RelationshipFilters = RelationshipFilters> = Omit<MultiEntityPickerProps<TFilters>, "adapter">;

export function PersonPicker(props: PickerProps<{ status?: string; school_id?: string; department_id?: string }>) {
  return <EntityPicker adapter={personRelationshipAdapter} {...props} />;
}

export function MultiPersonPicker(props: MultiPickerProps<{ status?: string; school_id?: string; department_id?: string }>) {
  return <MultiEntityPicker adapter={personRelationshipAdapter} {...props} />;
}

export function UserPicker(props: PickerProps<{ is_active?: boolean }>) {
  return <EntityPicker adapter={userRelationshipAdapter} {...props} />;
}

export function MultiUserPicker(props: MultiPickerProps<{ is_active?: boolean }>) {
  return <MultiEntityPicker adapter={userRelationshipAdapter} {...props} />;
}

export function SchoolPicker(props: PickerProps) {
  return <EntityPicker adapter={schoolRelationshipAdapter} {...props} />;
}

export function DepartmentPicker(props: PickerProps<{ school_id?: string; wing_id?: string; department_type?: string }>) {
  return <EntityPicker adapter={departmentRelationshipAdapter} {...props} />;
}

export function ProgrammePicker(props: PickerProps<{ school_id?: string; department_id?: string; level?: string }>) {
  return <EntityPicker adapter={programmeRelationshipAdapter} {...props} />;
}

export function DivisionPicker(props: PickerProps<{ is_active?: boolean }>) {
  return <EntityPicker adapter={divisionRelationshipAdapter} {...props} />;
}

export function IntakePicker(props: PickerProps<{ academic_calendar_id?: string; is_open?: boolean }>) {
  return <EntityPicker adapter={intakeRelationshipAdapter} {...props} />;
}

export function AcademicCalendarPicker(props: PickerProps<{ status?: string; academic_year?: string }>) {
  return <EntityPicker adapter={academicCalendarRelationshipAdapter} {...props} />;
}

export function GovernanceBoardPicker(props: PickerProps<{ board_type?: string; parent_entity_type?: string; parent_entity_id?: string }>) {
  return <EntityPicker adapter={governanceBoardRelationshipAdapter} {...props} />;
}

export function SliderGroupPicker(props: PickerProps<{ scope_type?: string; scope_id?: string; is_main?: boolean }>) {
  return <EntityPicker adapter={sliderGroupRelationshipAdapter} {...props} />;
}

export function MediaFolderPicker(props: PickerProps<{ parent_id?: string }>) {
  return <EntityPicker adapter={mediaFolderRelationshipAdapter} {...props} />;
}

export function StaffEntityPicker(props: PickerProps<{ entity_type: string }>) {
  return <EntityPicker adapter={staffEntityRelationshipAdapter} {...props} />;
}

export function LibraryBranchPicker(props: PickerProps<{ active_only?: boolean }>) {
  return <EntityPicker adapter={libraryBranchRelationshipAdapter} {...props} />;
}

export function LibraryResourcePicker(props: PickerProps<{ library_id?: string; resource_type?: string; status?: string }>) {
  return <EntityPicker adapter={libraryResourceRelationshipAdapter} {...props} />;
}

export function MainScopePicker(props: Omit<EntityTypeRecordPickerProps, "configs">) {
  return (
    <EntityTypeRecordPicker
      {...props}
      configs={[
        { value: "school", label: "School", adapter: schoolRelationshipAdapter },
        { value: "department", label: "Department", adapter: departmentRelationshipAdapter },
        { value: "programme", label: "Programme", adapter: programmeRelationshipAdapter },
        { value: "division", label: "Division", adapter: divisionRelationshipAdapter },
        { value: "intake", label: "Intake", adapter: intakeRelationshipAdapter },
      ]}
    />
  );
}

export function GovernanceParentPicker(props: Omit<EntityTypeRecordPickerProps, "configs">) {
  return (
    <EntityTypeRecordPicker
      {...props}
      configs={[
        { value: "school", label: "School", adapter: schoolRelationshipAdapter },
        { value: "department", label: "Department", adapter: departmentRelationshipAdapter },
        { value: "programme", label: "Programme", adapter: programmeRelationshipAdapter },
        { value: "division", label: "Division", adapter: divisionRelationshipAdapter },
      ]}
    />
  );
}
