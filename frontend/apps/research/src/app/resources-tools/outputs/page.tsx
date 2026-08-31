import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Research Outputs",
  description: "Research output records.",
  alternates: { canonical: "/outputs" },
};

export default function ResourceOutputsPage() {
  permanentRedirect("/outputs");
}
