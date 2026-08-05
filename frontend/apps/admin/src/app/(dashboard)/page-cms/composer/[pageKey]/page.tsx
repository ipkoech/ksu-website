import { Suspense } from "react";
import ComposerClientPage from "./client-page";

export function generateStaticParams() {
  return [{ pageKey: "homepage" }];
}

export default function PageCmsComposerRoutePage() {
  return <Suspense><ComposerClientPage /></Suspense>;
}
