"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@ksu/ui/components";
import { libraryServiceApi } from "@ksu/api-client";

export default function LibraryPatronsPage() {
  const loansQuery = useQuery({
    queryKey: ["library", "patrons", "loans"],
    queryFn: () => libraryServiceApi.loans.list({ page: 1, per_page: 100 }),
  });

  const patrons = useMemo(() => {
    const counts = new Map<string, { active: number; total: number }>();
    for (const loan of loansQuery.data?.data ?? []) {
      const current = counts.get(loan.borrower_person_id) ?? { active: 0, total: 0 };
      current.total += 1;
      if (loan.status !== "returned") current.active += 1;
      counts.set(loan.borrower_person_id, current);
    }
    return Array.from(counts.entries()).map(([personId, stats]) => ({ personId, ...stats }));
  }, [loansQuery.data]);

  return (
    <div>
      <PageHeader title="Library Patrons" description="Patron activity derived from circulation records." backHref="/library" />
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Patrons</CardTitle>
          </CardHeader>
          <CardContent>
            {loansQuery.isLoading ? (
              <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-lg bg-muted" />)}</div>
            ) : patrons.length === 0 ? (
              <p className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">No patrons were found in current circulation records.</p>
            ) : (
              <div className="divide-y rounded-lg border">
                {patrons.map((patron) => (
                  <div key={patron.personId} className="flex items-center justify-between gap-4 p-4">
                    <div>
                      <p className="font-medium">{patron.personId}</p>
                      <p className="text-sm text-muted-foreground">Person ID from borrower records</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{patron.total} total loans</Badge>
                      <Badge>{patron.active} active</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
