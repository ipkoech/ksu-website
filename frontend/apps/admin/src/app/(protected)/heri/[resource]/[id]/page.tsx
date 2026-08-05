import { HeriDetailPage } from "../../_components/heri-detail-page";

export function generateStaticParams() {
  return [{ resource: "_static", id: "_static" }];
}

export default function HeriRecordDetailPage() {
  return <HeriDetailPage />;
}
