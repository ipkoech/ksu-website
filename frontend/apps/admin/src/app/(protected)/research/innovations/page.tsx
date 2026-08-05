"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ksu/ui/components";
import {
  CompetitionEntriesResource,
  IncubationRecordsResource,
  InnovationOutputSummary,
  InnovationsResource,
  OutputsResource,
  StartupsResource,
  TechnologyTransferCasesResource,
} from "./_components/innovation-output-workspace";

const workspaceTabs = [
  { label: "Innovations", value: "innovations" },
  { label: "Startups", value: "startups" },
  { label: "Incubation", value: "incubation" },
  { label: "Hackathons & Competitions", value: "competitions" },
  { label: "Technology Transfer", value: "transfers" },
  { label: "Outputs", value: "outputs" },
];

export default function ResearchInnovationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab = requestedTab && workspaceTabs.some((tab) => tab.value === requestedTab) ? requestedTab : "innovations";

  const handleTabChange = (value: string) => {
    router.replace(`/research/innovations?tab=${value}`, { scroll: false });
  };

  return (
    <div className="space-y-4">
      <InnovationOutputSummary />

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

        <TabsContent value="innovations" className="mt-0">
          <InnovationsResource summarySlot={null} />
        </TabsContent>
        <TabsContent value="startups" className="mt-0">
          <StartupsResource summarySlot={null} />
        </TabsContent>
        <TabsContent value="incubation" className="mt-0">
          <IncubationRecordsResource summarySlot={null} />
        </TabsContent>
        <TabsContent value="competitions" className="mt-0">
          <CompetitionEntriesResource summarySlot={null} />
        </TabsContent>
        <TabsContent value="transfers" className="mt-0">
          <TechnologyTransferCasesResource summarySlot={null} />
        </TabsContent>
        <TabsContent value="outputs" className="mt-0">
          <OutputsResource summarySlot={null} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
