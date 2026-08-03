import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ksu/ui/components";
import { PortalResourcePage } from "@/components/portals/portal-resource-page";
import { ContributorRequestsPanel } from "@/components/stories/contributor-requests-panel";

export default function CorporateCommunicationStoriesPage() {
  return (
    <Tabs defaultValue="stories">
      <TabsList className="mx-4 mt-4 sm:mx-6">
        <TabsTrigger value="stories">Stories</TabsTrigger>
        <TabsTrigger value="requests">Contributor requests</TabsTrigger>
      </TabsList>
      <TabsContent value="stories">
        <PortalResourcePage
          portalKey="corporate-communication"
          resourceKey="stories"
        />
      </TabsContent>
      <TabsContent value="requests" className="p-4 sm:p-6">
        <ContributorRequestsPanel />
      </TabsContent>
    </Tabs>
  );
}
