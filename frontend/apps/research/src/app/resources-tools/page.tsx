import type { Metadata } from "next";
import {
  ResourcesWorkspace,
  getResourcesWorkspacePageModel,
  type ResourceWorkspaceParams,
} from "./_workspace";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Resources & Tools",
  description:
    "Research resources, policies, forms, services, outputs, and downloads.",
};

export default async function ResourcesToolsPage({
  searchParams,
}: {
  searchParams?: Promise<ResourceWorkspaceParams>;
}) {
  const model = await getResourcesWorkspacePageModel((await searchParams) ?? {});
  return (
    <main id="research-main" className="min-h-screen bg-white text-foreground">
      <ResourcesWorkspace {...model} />
    </main>
  );
}
