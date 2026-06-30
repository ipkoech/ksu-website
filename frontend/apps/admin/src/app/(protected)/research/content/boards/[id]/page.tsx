"use client";

import { useQuery } from "@tanstack/react-query";
import { governanceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@ksu/ui/components";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../../_components/research-admin-detail-page";
import { RelatedRecordsCard } from "../../../_components/research-detail-relationships";

export default function ResearchBoardDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Research Board"
      description="View research board mandate, officers, membership, and audit history from the governance service."
      resource={{
        list: (params) => governanceApi.listBoards({ page: 1, per_page: 100, parent_entity_type: "research", ...params }),
      }}
      backHref="/research/content/boards"
      slugParam="id"
      lookup="id"
      labelFields={["board_type", "status", "is_public"]}
      factFields={[
        { label: "Type", field: "board_type", format: "label" },
        { label: "Chairperson", field: "chairperson_id", relation: { adapter: "person" } },
        { label: "Vice Chairperson", field: "vice_chairperson_id", relation: { adapter: "person" } },
        { label: "Secretary", field: "secretary_id", relation: { adapter: "person" } },
        { label: "Members", field: "current_members" },
        { label: "Quorum", field: "quorum" },
      ]}
      sections={[
        { title: "Mandate", fields: ["mandate", "description", "meeting_schedule"] },
        { title: "Terms", fields: ["standard_term_years", "max_terms", "member_count", "display_order"] },
      ]}
      auditServiceName="main"
      auditResourceTypes={["board", "governance_board", "boards"]}
      renderAfter={(record) => <BoardRelations board={record} />}
    />
  );
}

function BoardRelations({ board }: { board: ResearchGenericRecord }) {
  const boardId = String(board.id);

  return (
    <ResearchDetailRelationshipTabs
      defaultValue="members"
      tabs={[
        {
          value: "members",
          label: "Members",
          content: (
            <RelatedRecordsCard
              title="Board Members"
              queryKey={["research", "content", "boards", boardId, "members"]}
              queryFn={async () => {
                const response = await governanceApi.getBoardMembers(boardId, {
                  fields: "id,person_id,role,title,status,start_date,end_date,person",
                });
                return { data: (response.data ?? []) as ResearchGenericRecord[] };
              }}
              emptyLabel="No board members were returned by the governance service."
              metaFields={["role", "title", "status", "start_date"]}
            />
          ),
        },
        {
          value: "terms",
          label: "Terms",
          content: <BoardTermTimeline boardId={boardId} />,
        },
      ]}
    />
  );
}

function BoardTermTimeline({ boardId }: { boardId: string }) {
  const membersQuery = useQuery({
    queryKey: ["research", "content", "boards", boardId, "terms"],
    queryFn: async () => {
      const response = await governanceApi.getBoardMembers(boardId, {
        fields: "id,person_id,role,title,status,start_date,end_date,term_years,term_renewable,person",
      });
      return (response.data ?? []) as ResearchGenericRecord[];
    },
  });
  const members = membersQuery.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Member Term Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {membersQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading member terms...</p>
        ) : membersQuery.isError ? (
          <p className="text-sm text-destructive">Unable to load board member terms.</p>
        ) : members.length === 0 ? (
          <p className="text-sm text-muted-foreground">No board member term records were returned.</p>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{personTitle(member) || "Board member"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {[formatLabel(member.role), member.title].filter(Boolean).join(" - ") || "Research board role"}
                    </p>
                  </div>
                  {member.status ? <Badge variant="outline">{formatLabel(member.status)}</Badge> : null}
                </div>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <TermFact label="Start" value={formatDate(member.start_date)} />
                  <TermFact label="End" value={formatDate(member.end_date) || "Current"} />
                  <TermFact label="Term" value={termLabel(member)} />
                </dl>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TermFact({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-md bg-muted/40 p-3">
      <dt className="text-xs font-medium uppercase text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value || "Not set"}</dd>
    </div>
  );
}

function personTitle(record: ResearchGenericRecord) {
  const person = record.person as ResearchGenericRecord | undefined;
  return [
    person?.full_name,
    person?.display_name,
    person?.name,
    record.full_name,
    record.display_name,
    record.name,
  ].find((value) => typeof value === "string" && value.trim());
}

function termLabel(record: ResearchGenericRecord) {
  const years = record.term_years ? `${record.term_years} year${Number(record.term_years) === 1 ? "" : "s"}` : null;
  const renewable = typeof record.term_renewable === "boolean" ? (record.term_renewable ? "renewable" : "not renewable") : null;
  return [years, renewable].filter(Boolean).join(", ") || "Term metadata not set";
}

function formatDate(value: unknown) {
  if (!value || typeof value !== "string") return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

function formatLabel(value: unknown) {
  if (value === null || value === undefined || value === "") return "";
  return String(value).replace(/[_-]+/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());
}
