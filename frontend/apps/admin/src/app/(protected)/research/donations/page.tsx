"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ksu/ui/components";
import {
  DonationImpactsResource,
  DonationRecordsResource,
  DonationSettingsResource,
  DonationStoriesResource,
  DonationsWorkspaceHeader,
  DonorsResource,
} from "./_components/donations-workspace";

const workspaceTabs = [
  { label: "Donations", value: "records" },
  { label: "Donors", value: "donors" },
  { label: "Impacts", value: "impacts" },
  { label: "Stories", value: "stories" },
  { label: "Settings", value: "settings" },
];

export default function ResearchDonationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab = requestedTab && workspaceTabs.some((tab) => tab.value === requestedTab) ? requestedTab : "records";

  const handleTabChange = (value: string) => {
    router.replace(`/research/donations?tab=${value}`, { scroll: false });
  };

  return (
    <div className="space-y-4">
      <DonationsWorkspaceHeader />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <div className="overflow-x-auto rounded-lg border bg-background p-1">
          <TabsList className="h-auto min-w-max bg-transparent p-0">
            {workspaceTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="rounded-md px-3 py-2">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="records" className="mt-0">
          <DonationRecordsResource summarySlot={null} />
        </TabsContent>
        <TabsContent value="donors" className="mt-0">
          <DonorsResource summarySlot={null} />
        </TabsContent>
        <TabsContent value="impacts" className="mt-0">
          <DonationImpactsResource summarySlot={null} />
        </TabsContent>
        <TabsContent value="stories" className="mt-0">
          <DonationStoriesResource summarySlot={null} />
        </TabsContent>
        <TabsContent value="settings" className="mt-0">
          <DonationSettingsResource summarySlot={null} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
