import { Metadata } from "next";
import { LibraryAssistantContextManagementClient } from "../context-management-client";

export const metadata: Metadata = {
  title: "Assistant Contexts",
};

export default function LibraryAssistantContextsPage() {
  return <LibraryAssistantContextManagementClient />;
}
