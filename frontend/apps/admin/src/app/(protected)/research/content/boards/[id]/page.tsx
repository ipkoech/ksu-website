"use client";

import { governanceApi, type ResearchGenericRecord } from "@ksu/api-client";
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
      ]}
    />
  );
}
