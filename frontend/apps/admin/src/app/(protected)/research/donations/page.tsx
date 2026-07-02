"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FileText, Settings } from "lucide-react";
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from "@ksu/ui/components";
import {
  DonationRecordsResource,
  DonationsWorkspaceHeader,
  DonorsResource,
} from "./_components/donations-workspace";

const workspaceTabs = [
  { label: "Donation Records", value: "records" },
  { label: "Donors", value: "donors" },
];

const relatedDonationPages = [
  { label: "Impacts", href: "/research/donations/impacts", icon: FileText },
  { label: "Stories", href: "/research/donations/stories", icon: FileText },
  { label: "Settings", href: "/research/donations/settings", icon: Settings },
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

      <div className="flex flex-wrap items-center justify-end gap-2">
        {relatedDonationPages.map((page) => (
          <Button key={page.href} asChild variant="outline" size="sm">
            <Link href={page.href}>
              <page.icon className="mr-2 h-4 w-4" />
              {page.label}
            </Link>
          </Button>
        ))}
      </div>

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
      </Tabs>
    </div>
  );
}
