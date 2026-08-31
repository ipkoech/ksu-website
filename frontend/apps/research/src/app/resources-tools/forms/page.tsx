import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Forms & Templates",
  description: "Research forms and templates.",
  alternates: { canonical: "/forms" },
};

export default function ResourceFormsPage() {
  permanentRedirect("/forms");
}
