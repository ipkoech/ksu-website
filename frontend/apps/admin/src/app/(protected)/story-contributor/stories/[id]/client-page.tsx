"use client";

import { useParams } from "next/navigation";
import { StoryContributorClient } from "@/components/stories/story-contributor-client";

export default function ClientPage() {
  const { id } = useParams<{ id: string }>();
  return <StoryContributorClient mode="edit" storyId={id} />;
}
