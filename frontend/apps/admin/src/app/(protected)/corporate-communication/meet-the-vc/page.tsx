import { Suspense } from "react";
import { VcStudio } from "@/components/vice-chancellor/vc-studio";

export default function MeetTheVcStudioPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Opening VC content studio…</div>}>
      <VcStudio />
    </Suspense>
  );
}
