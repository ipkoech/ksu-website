"use client";

import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ksu/ui/components";
import { NewsroomWorkspace } from "@/components/corporate/newsroom-workspace";
import { ContributorRequestsPanel } from "@/components/stories/contributor-requests-panel";

export default function CorporateCommunicationStoriesPage() {
  const params = useSearchParams();
  const tab = params.get("tab") ?? "stories";

  return (
    <Tabs defaultValue={tab}>
      <TabsList className="mx-4 mt-4 sm:mx-6">
        <TabsTrigger value="stories">Stories</TabsTrigger>
        <TabsTrigger value="requests">Contributor requests</TabsTrigger>
      </TabsList>
      <TabsContent value="stories">
        <NewsroomWorkspace contentType="stories" />
      </TabsContent>
      <TabsContent value="requests" className="p-4 sm:p-6">
        <ContributorRequestsPanel />
      </TabsContent>
    </Tabs>
  );
}
