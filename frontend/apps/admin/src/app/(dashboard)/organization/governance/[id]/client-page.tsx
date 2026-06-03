"use client";

import * as React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { motion } from "framer-motion";
import { Calendar, Pencil, RotateCcw, Trash2, Users } from "lucide-react";
import { toast } from "@ksu/ui";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  RichTextEditor,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  richTextToPlainText,
} from "@ksu/ui/components";
import {
  useBoard,
  useBoardMembers,
  useCreateBoard,
  useEndStaffAssignment,
  useUpdateBoard,
  type Board,
  type StaffAssignment,
} from "@ksu/api-client";
import { DataTable } from "@/components/data-table/data-table";
import { MediaPicker } from "@/components/media";
import { DivisionPicker, GovernanceParentPicker, PersonPicker } from "@/components/relationships";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { StaffAssignmentEditor } from "@/components/staff/staff-assignment-editor";
import { usePermissions } from "@/hooks/use-permissions";
import { hasChangedPayload, pickChangedPayloadWithRecord, type PayloadFieldMap } from "@/lib/changed-fields";

const optionalNumber = z.string().optional().nullable();

const schema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  slug: z.string().optional(),
  board_type: z.string().min(1).max(64),
  parent_entity_type: z.string().optional().nullable(),
  parent_entity_id: z.string().optional().nullable(),
  chairperson_id: z.string().optional().nullable(),
  vice_chairperson_id: z.string().optional().nullable(),
  secretary_id: z.string().optional().nullable(),
  mandate: z.string().optional().nullable(),
  establishment_date: z.string().optional().nullable(),
  meeting_schedule: z.string().max(255).optional().nullable(),
  member_count: optionalNumber,
  quorum: optionalNumber,
  standard_term_years: optionalNumber,
  max_terms: optionalNumber,
  show_member_terms: z.boolean(),
  description: z.string().optional().nullable(),
  head_message: z.string().optional().nullable(),
  mission: z.string().optional().nullable(),
  vision: z.string().optional().nullable(),
  cover_image_id: z.string().optional().nullable(),
  division_id: z.string().optional().nullable(),
  is_public: z.boolean(),
  is_active: z.boolean(),
  status: z.string().min(1).max(32),
  display_order: z.coerce.number().int().optional(),
});

type BoardFormValues = z.infer<typeof schema>;
type BoardPayload = Partial<Board>;

const boardFields = [
  "id",
  "name",
  "slug",
  "board_type",
  "parent_entity_type",
  "parent_entity_id",
  "chairperson_id",
  "vice_chairperson_id",
  "secretary_id",
  "mandate",
  "establishment_date",
  "meeting_schedule",
  "member_count",
  "quorum",
  "standard_term_years",
  "max_terms",
  "show_member_terms",
  "description",
  "head_message",
  "mission",
  "vision",
  "cover_image_id",
  "division_id",
  "is_public",
  "is_active",
  "status",
  "display_order",
].join(",");

const memberFields = [
  "id",
  "person_id",
  "entity_type",
  "entity_id",
  "role",
  "title",
  "hierarchy_level",
  "reports_to_id",
  "is_primary",
  "is_acting",
  "is_public",
  "start_date",
  "end_date",
  "term_years",
  "term_renewable",
  "show_term_dates",
  "status",
  "display_order",
  "notes",
  "person",
].join(",");

const boardPayloadFieldMap: PayloadFieldMap<BoardPayload> = {
  name: ["name"],
  slug: ["slug"],
  board_type: ["board_type"],
  parent_entity_type: ["parent_entity_type"],
  parent_entity_id: ["parent_entity_id"],
  chairperson_id: ["chairperson_id"],
  vice_chairperson_id: ["vice_chairperson_id"],
  secretary_id: ["secretary_id"],
  mandate: ["mandate"],
  establishment_date: ["establishment_date"],
  meeting_schedule: ["meeting_schedule"],
  member_count: ["member_count"],
  quorum: ["quorum"],
  standard_term_years: ["standard_term_years"],
  max_terms: ["max_terms"],
  show_member_terms: ["show_member_terms"],
  description: ["description"],
  head_message: ["head_message"],
  mission: ["mission"],
  vision: ["vision"],
  cover_image_id: ["cover_image_id"],
  division_id: ["division_id"],
  is_public: ["is_public"],
  is_active: ["is_active"],
  status: ["status"],
  display_order: ["display_order"],
};

const boardTypeLabels: Record<string, string> = {
  council: "Council",
  senate: "Senate",
  management_board: "Management Board",
  school_board: "School Board",
  department_board: "Department Board",
  board: "Board",
  committee: "Committee",
  taskforce: "Taskforce",
};

const roleLabels: Record<string, string> = {
  chairperson: "Chairperson",
  vice_chairperson: "Vice Chairperson",
  council_chair: "Council Chair",
  board_secretary: "Board Secretary",
  secretary: "Secretary",
  treasurer: "Treasurer",
  member: "Member",
  observer: "Observer",
  ex_officio: "Ex officio",
  convenor: "Convenor",
};

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function emptyToNull(value?: string | null) {
  const nextValue = value?.trim();
  return nextValue ? nextValue : null;
}

function textToNull(value?: string | null) {
  return emptyToNull(richTextToPlainText(value ?? ""));
}

function optionalInt(value?: string | null) {
  const nextValue = value?.trim();
  if (!nextValue) return null;
  const parsed = Number(nextValue);
  return Number.isFinite(parsed) ? parsed : null;
}

function dateLabel(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function formatPerson(assignment: StaffAssignment) {
  const person = assignment.person;
  if (!person) return "Unassigned";
  return person.full_name || [person.title, person.first_name, person.last_name].filter(Boolean).join(" ") || person.email;
}

function roleLabel(role?: string | null) {
  if (!role) return "Member";
  return roleLabels[role] ?? role.replace(/_/g, " ");
}

function resolveRouteId(routeId: string, queryId: string | null) {
  if (routeId === "_static") return queryId || "";
  return routeId;
}

function buildPayload(values: BoardFormValues): BoardPayload {
  const parentType = emptyToNull(values.parent_entity_type);
  return {
    name: values.name.trim(),
    slug: values.slug?.trim() || slugify(values.name),
    board_type: values.board_type,
    parent_entity_type: parentType,
    parent_entity_id: parentType ? emptyToNull(values.parent_entity_id) : null,
    chairperson_id: emptyToNull(values.chairperson_id),
    vice_chairperson_id: emptyToNull(values.vice_chairperson_id),
    secretary_id: emptyToNull(values.secretary_id),
    mandate: textToNull(values.mandate),
    establishment_date: emptyToNull(values.establishment_date),
    meeting_schedule: emptyToNull(values.meeting_schedule),
    member_count: optionalInt(values.member_count),
    quorum: optionalInt(values.quorum),
    standard_term_years: optionalInt(values.standard_term_years),
    max_terms: optionalInt(values.max_terms),
    show_member_terms: values.show_member_terms,
    description: textToNull(values.description),
    head_message: textToNull(values.head_message),
    mission: textToNull(values.mission),
    vision: textToNull(values.vision),
    cover_image_id: emptyToNull(values.cover_image_id),
    division_id: emptyToNull(values.division_id),
    is_public: values.is_public,
    is_active: values.is_active,
    status: values.status,
    display_order: values.display_order ?? 100,
  };
}

function toFormValues(board: Board): BoardFormValues {
  return {
    name: board.name ?? "",
    slug: board.slug ?? "",
    board_type: board.board_type ?? "board",
    parent_entity_type: board.parent_entity_type ?? "",
    parent_entity_id: board.parent_entity_id ?? "",
    chairperson_id: board.chairperson_id ?? "",
    vice_chairperson_id: board.vice_chairperson_id ?? "",
    secretary_id: board.secretary_id ?? "",
    mandate: board.mandate ?? "",
    establishment_date: board.establishment_date ?? "",
    meeting_schedule: board.meeting_schedule ?? "",
    member_count: board.member_count ? String(board.member_count) : "",
    quorum: board.quorum ? String(board.quorum) : "",
    standard_term_years: board.standard_term_years ? String(board.standard_term_years) : "",
    max_terms: board.max_terms ? String(board.max_terms) : "",
    show_member_terms: board.show_member_terms ?? false,
    description: board.description ?? "",
    head_message: board.head_message ?? "",
    mission: board.mission ?? "",
    vision: board.vision ?? "",
    cover_image_id: board.cover_image_id ?? "",
    division_id: board.division_id ?? "",
    is_public: board.is_public ?? true,
    is_active: board.is_active ?? true,
    status: board.status ?? "active",
    display_order: board.display_order ?? 100,
  };
}

export default function BoardEditorPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { canEdit } = usePermissions();
  const routeId = params.id as string;
  const boardId = resolveRouteId(routeId, searchParams.get("id"));
  const isNew = boardId === "new";

  const boardQuery = useBoard(isNew ? "" : boardId, {
    enabled: !isNew && Boolean(boardId),
    fields: boardFields,
  });
  const membersQuery = useBoardMembers(boardId, {
    enabled: !isNew && Boolean(boardId),
    fields: memberFields,
    include: "person:id,title,first_name,last_name,full_name,email,photo_url",
  });
  const createBoard = useCreateBoard();
  const updateBoard = useUpdateBoard();
  const endAssignment = useEndStaffAssignment();
  const board = boardQuery.data?.data;
  const members = membersQuery.data?.data ?? [];
  const isPending = createBoard.isPending || updateBoard.isPending;
  const canManageGovernance = canEdit("governance");

  const [assignmentEditor, setAssignmentEditor] = React.useState<{
    mode: "create" | "edit" | "reassign";
    assignment?: StaffAssignment | null;
  } | null>(null);
  const [endingAssignment, setEndingAssignment] = React.useState<StaffAssignment | null>(null);

  const form = useForm<BoardFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      board_type: "board",
      parent_entity_type: "",
      parent_entity_id: "",
      chairperson_id: "",
      vice_chairperson_id: "",
      secretary_id: "",
      mandate: "",
      establishment_date: "",
      meeting_schedule: "",
      member_count: "",
      quorum: "",
      standard_term_years: "",
      max_terms: "",
      show_member_terms: false,
      description: "",
      head_message: "",
      mission: "",
      vision: "",
      cover_image_id: "",
      division_id: "",
      is_public: true,
      is_active: true,
      status: "active",
      display_order: 100,
    },
    values: board ? toFormValues(board) : undefined,
  });

  const selectedParentType = form.watch("parent_entity_type");

  const memberColumns = React.useMemo<ColumnDef<StaffAssignment>[]>(() => [
    {
      accessorKey: "person",
      header: "Member",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{formatPerson(row.original)}</p>
          <p className="text-xs text-muted-foreground">{row.original.person?.email || "-"}</p>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="capitalize">{roleLabel(row.original.role)}</Badge>
          {row.original.is_acting ? <Badge variant="secondary">Acting</Badge> : null}
          {row.original.is_primary ? <Badge variant="secondary">Primary</Badge> : null}
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => row.original.title || "-",
    },
    {
      accessorKey: "start_date",
      header: "Term",
      cell: ({ row }) => (
        <span>
          {dateLabel(row.original.start_date)}
          {row.original.end_date ? ` - ${dateLabel(row.original.end_date)}` : ""}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <Badge variant={row.original.status === "active" ? "default" : "secondary"}>{row.original.status}</Badge>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const assignment = row.original;
        if (!canManageGovernance) return null;
        return (
          <div className="flex justify-end gap-1">
            <Button type="button" variant="ghost" size="icon" onClick={() => setAssignmentEditor({ mode: "edit", assignment })} aria-label="Edit assignment">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => setAssignmentEditor({ mode: "reassign", assignment })} aria-label="Reassign">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={() => setEndingAssignment(assignment)} aria-label="End assignment">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ], [canManageGovernance]);

  const onSubmit = async (values: BoardFormValues) => {
    const payload = buildPayload(values);
    try {
      if (isNew) {
        await createBoard.mutateAsync(payload);
        toast.success("Board created");
      } else if (board) {
        const patch = pickChangedPayloadWithRecord(
          payload,
          form.formState.dirtyFields as Record<string, unknown>,
          boardPayloadFieldMap,
          board,
        );
        if (!hasChangedPayload(patch)) {
          toast.info("No board changes to save");
          return;
        }
        await updateBoard.mutateAsync({ id: board.id, data: patch });
        toast.success("Board updated");
      }
      router.push("/organization/governance");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : isNew ? "Failed to create board" : "Failed to update board");
    }
  };

  const confirmEndAssignment = async () => {
    if (!endingAssignment) return;
    await endAssignment.mutateAsync({
      id: endingAssignment.id,
      data: {
        end_date: new Date().toISOString().slice(0, 10),
        notes: "Ended from governance board member management.",
      },
    });
    toast.success("Board member assignment ended");
    setEndingAssignment(null);
    await membersQuery.refetch();
  };

  const handleAssignmentSuccess = async () => {
    await Promise.all([membersQuery.refetch(), boardQuery.refetch()]);
    setAssignmentEditor(null);
  };

  if (!isNew && !boardId) {
    return (
      <div className="space-y-6">
        <PageHeader title="Board not found" backHref="/organization/governance" />
        <Card><CardContent className="p-6 text-sm text-muted-foreground">Missing board id.</CardContent></Card>
      </div>
    );
  }

  if (boardQuery.isLoading) return <LoadingSkeleton rows={10} />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader
        title={isNew ? "Create Board" : board?.name ?? "Edit Board"}
        description={isNew ? "Create a governance board or committee." : `${boardTypeLabels[board?.board_type ?? ""] ?? board?.board_type ?? "Board"} governance record`}
        backHref="/organization/governance"
        actions={
          !isNew && board && canManageGovernance ? (
            <Button type="button" variant="outline" onClick={() => setAssignmentEditor({ mode: "create", assignment: null })}>
              <Users className="h-4 w-4" />
              Attach Member
            </Button>
          ) : undefined
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Board Details</CardTitle>
                  <CardDescription>Core governance identity and hierarchy.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Name *</FormLabel><FormControl><Input placeholder="University Council" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="slug" render={({ field }) => (
                    <FormItem><FormLabel>Slug</FormLabel><FormControl><Input placeholder="university-council" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="board_type" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select board type" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="council">Council</SelectItem>
                          <SelectItem value="senate">Senate</SelectItem>
                          <SelectItem value="management_board">Management Board</SelectItem>
                          <SelectItem value="school_board">School Board</SelectItem>
                          <SelectItem value="department_board">Department Board</SelectItem>
                          <SelectItem value="board">Board</SelectItem>
                          <SelectItem value="committee">Committee</SelectItem>
                          <SelectItem value="taskforce">Taskforce</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="dissolved">Dissolved</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="parent_entity_id" render={() => (
                    <FormItem className="md:col-span-2">
                      <GovernanceParentPicker
                        label="Parent entity"
                        description="Select the school, department, programme, or division this board belongs to."
                        typeValue={form.watch("parent_entity_type") ?? ""}
                        idValue={form.watch("parent_entity_id") ?? ""}
                        onChange={({ type, id }) => {
                          form.setValue("parent_entity_type", type, { shouldDirty: true });
                          form.setValue("parent_entity_id", id, { shouldDirty: true });
                        }}
                        recordPlaceholder="Search and select parent record"
                      />
                      <FormMessage />
                    </FormItem>
                  )} />
                  {selectedParentType === "division" ? (
                    <FormField control={form.control} name="division_id" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Legacy Division Link</FormLabel>
                        <DivisionPicker value={field.value ?? ""} onChange={field.onChange} filters={{ is_active: true }} placeholder="Select division" />
                        <FormMessage />
                      </FormItem>
                    )} />
                  ) : null}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Leadership</CardTitle>
                  <CardDescription>Convenience profile links for board leadership. Membership is managed below.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <FormField control={form.control} name="chairperson_id" render={({ field }) => (
                    <FormItem><FormLabel>Chairperson</FormLabel><PersonPicker value={field.value ?? ""} onChange={field.onChange} filters={{ status: "active" }} placeholder="Select chairperson" /><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="vice_chairperson_id" render={({ field }) => (
                    <FormItem><FormLabel>Vice Chairperson</FormLabel><PersonPicker value={field.value ?? ""} onChange={field.onChange} filters={{ status: "active" }} placeholder="Select vice chairperson" /><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="secretary_id" render={({ field }) => (
                    <FormItem><FormLabel>Secretary</FormLabel><PersonPicker value={field.value ?? ""} onChange={field.onChange} filters={{ status: "active" }} placeholder="Select secretary" /><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mandate And Public Content</CardTitle>
                  <CardDescription>Content shown on governance pages where public visibility is enabled.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <FormField control={form.control} name="mandate" render={({ field }) => (
                    <FormItem><FormLabel>Mandate</FormLabel><FormControl><RichTextEditor value={field.value ?? ""} onChange={field.onChange} toolbar="simple" minHeight="160px" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><RichTextEditor value={field.value ?? ""} onChange={field.onChange} toolbar="simple" minHeight="150px" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="head_message" render={({ field }) => (
                    <FormItem><FormLabel>Head Message</FormLabel><FormControl><RichTextEditor value={field.value ?? ""} onChange={field.onChange} toolbar="simple" minHeight="150px" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField control={form.control} name="mission" render={({ field }) => (
                      <FormItem><FormLabel>Mission</FormLabel><FormControl><RichTextEditor value={field.value ?? ""} onChange={field.onChange} toolbar="simple" minHeight="130px" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="vision" render={({ field }) => (
                      <FormItem><FormLabel>Vision</FormLabel><FormControl><RichTextEditor value={field.value ?? ""} onChange={field.onChange} toolbar="simple" minHeight="130px" /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>

              {!isNew && board ? (
                <Card>
                  <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle>Members</CardTitle>
                      <CardDescription>Attach council and board members to this governance body.</CardDescription>
                    </div>
                    {canManageGovernance ? (
                      <Button type="button" variant="outline" onClick={() => setAssignmentEditor({ mode: "create", assignment: null })}>
                        <Users className="h-4 w-4" />
                        Attach Member
                      </Button>
                    ) : null}
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      columns={memberColumns}
                      data={members}
                      isLoading={membersQuery.isLoading}
                      emptyMessage="No active board members found."
                    />
                  </CardContent>
                </Card>
              ) : null}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Term Rules</CardTitle>
                  <CardDescription>Meeting schedule, quorum, and member term display.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="establishment_date" render={({ field }) => (
                    <FormItem><FormLabel>Established</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="meeting_schedule" render={({ field }) => (
                    <FormItem><FormLabel>Meeting Schedule</FormLabel><FormControl><Input placeholder="Monthly" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField control={form.control} name="member_count" render={({ field }) => (
                      <FormItem><FormLabel>Expected Members</FormLabel><FormControl><Input type="number" min={1} {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="quorum" render={({ field }) => (
                      <FormItem><FormLabel>Quorum</FormLabel><FormControl><Input type="number" min={1} {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="standard_term_years" render={({ field }) => (
                      <FormItem><FormLabel>Term Years</FormLabel><FormControl><Input type="number" min={1} max={10} {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="max_terms" render={({ field }) => (
                      <FormItem><FormLabel>Max Terms</FormLabel><FormControl><Input type="number" min={1} {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="show_member_terms" render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <FormLabel className="cursor-pointer">Show Member Terms</FormLabel>
                        <p className="text-xs text-muted-foreground">Expose term dates on public governance pages.</p>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Media</CardTitle>
                  <CardDescription>Cover image for public governance pages.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField control={form.control} name="cover_image_id" render={({ field }) => (
                    <FormItem>
                      <MediaPicker
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        label="Cover image"
                        mediaType="image"
                        accept="image/*"
                        helperText="Select or upload a governance cover image."
                      />
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              {!isNew && board ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Membership Snapshot</CardTitle>
                    <CardDescription>Current active assignments for this board.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-2xl font-semibold">{members.length}</p>
                        <p className="text-xs text-muted-foreground">Active members</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{form.watch("meeting_schedule") || "No schedule"}</p>
                        <p className="text-xs text-muted-foreground">Meeting cadence</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              <Card>
                <CardHeader>
                  <CardTitle>Visibility</CardTitle>
                  <CardDescription>Public and operational state.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(["is_public", "is_active"] as const).map((name) => (
                    <FormField key={name} control={form.control} name={name} render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <FormLabel className="cursor-pointer">{name === "is_public" ? "Public" : "Active"}</FormLabel>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                    )} />
                  ))}
                  <FormField control={form.control} name="display_order" render={({ field }) => (
                    <FormItem><FormLabel>Display Order</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={isPending || !canManageGovernance}>
              {isPending ? "Saving..." : isNew ? "Create Board" : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/organization/governance")}>Cancel</Button>
          </div>
        </form>
      </Form>

      {!isNew && board ? (
        <StaffAssignmentEditor
          open={!!assignmentEditor}
          onOpenChange={(open) => {
            if (!open) setAssignmentEditor(null);
          }}
          mode={assignmentEditor?.mode ?? "create"}
          assignment={assignmentEditor?.assignment ?? null}
          presetEntityType="board"
          presetEntityId={board.id}
          presetEntityLabel={board.name}
          lockEntity
          onSuccess={handleAssignmentSuccess}
        />
      ) : null}

      <ConfirmDialog
        open={!!endingAssignment}
        onOpenChange={(open) => {
          if (!open) setEndingAssignment(null);
        }}
        title="End board member assignment?"
        description="This removes the member from the active board roster and preserves the assignment in staff history."
        confirmLabel="End assignment"
        variant="destructive"
        isLoading={endAssignment.isPending}
        onConfirm={confirmEndAssignment}
      />
    </motion.div>
  );
}
