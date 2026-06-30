import type { ReactNode } from "react";

export function generateStaticParams() {
  return [{ id: "_static" }];
}

export default function DynamicDetailLayout({ children }: { children: ReactNode }) {
  return children;
}
