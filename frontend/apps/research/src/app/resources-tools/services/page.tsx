import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Research Services",
  description: "Research services and support records.",
  alternates: { canonical: "/services" },
};

export default function ResourceServicesPage() {
  permanentRedirect("/services");
}
