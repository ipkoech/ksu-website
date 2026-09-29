import type { Metadata } from "next";
import { ResearchAuthPage } from "../../../features/admin/auth-pages";
export const metadata: Metadata = { title: "KSU account access", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default function Page() { return <ResearchAuthPage screen="login" />; }
