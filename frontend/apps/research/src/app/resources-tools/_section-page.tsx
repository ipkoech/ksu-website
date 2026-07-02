import {
  ResourcesWorkspace,
  type ResourceWorkspaceParams,
  getResourcesWorkspacePageModel,
} from "./_workspace";

export async function ResourcesSectionPage({
  searchParams,
  activeItem,
  visibleSections,
}: {
  searchParams?: Promise<ResourceWorkspaceParams>;
  activeItem: string;
  visibleSections: string[];
}) {
  const params = (await searchParams) ?? {};
  const model = await getResourcesWorkspacePageModel(params);

  return (
    <main id="research-main" className="min-h-screen bg-white text-slate-950">
      <ResourcesWorkspace
        {...model}
        activeItem={activeItem}
        visibleSections={visibleSections}
      />
    </main>
  );
}
