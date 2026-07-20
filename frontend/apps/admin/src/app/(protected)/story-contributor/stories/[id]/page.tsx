import { StoryContributorClient } from "@/components/stories/story-contributor-client";

export default async function EditStoryContributorStoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StoryContributorClient mode="edit" storyId={id} />;
}
