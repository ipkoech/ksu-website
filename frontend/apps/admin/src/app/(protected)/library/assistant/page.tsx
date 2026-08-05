import { Metadata } from "next";
import { LibraryAssistantInboxClient } from "./assistant-inbox-client";

export const metadata: Metadata = {
  title: "Library Assistant Inbox",
};

export default function LibraryAssistantPage() {
  return <LibraryAssistantInboxClient />;
}
