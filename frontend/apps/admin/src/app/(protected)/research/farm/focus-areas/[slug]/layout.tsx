import type { ReactNode } from "react";

export function generateStaticParams() {
  return [{ slug: "_static" }];
}

export default function DynamicDetailLayout({ children }: { children: ReactNode }) {
  return children;
}
