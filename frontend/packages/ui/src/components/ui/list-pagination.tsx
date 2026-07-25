import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

export type ListPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  baseHref: string;
  className?: string;
};

export function ListPagination({
  page,
  totalPages,
  total,
  perPage,
  baseHref,
  className,
}: ListPaginationProps) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const pageHref = (p: number) => {
    const url = new URL(baseHref, "https://kisiiuniversity.ac.ke");
    if (p > 1) url.searchParams.set("page", String(p));
    else url.searchParams.delete("page");
    return `${url.pathname}${url.search}`;
  };

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "flex flex-col items-center gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{from}</span>
        {" – "}
        <span className="font-semibold text-foreground">{to}</span> of{" "}
        <span className="font-semibold text-foreground">{total}</span> records
      </p>

      <div className="flex items-center gap-2">
        {hasPrev ? (
          <Link
            href={pageHref(page - 1)}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-white px-3 text-sm font-semibold text-muted-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            <ChevronLeft aria-hidden className="h-4 w-4" />
            Previous
          </Link>
        ) : (
          <span className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-white px-3 text-sm font-medium text-muted-foreground/70">
            <ChevronLeft aria-hidden className="h-4 w-4" />
            Previous
          </span>
        )}

        <span className="px-2 text-sm font-medium text-muted-foreground">
          Page {page} of {totalPages}
        </span>

        {hasNext ? (
          <Link
            href={pageHref(page + 1)}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-white px-3 text-sm font-semibold text-muted-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            Next
            <ChevronRight aria-hidden className="h-4 w-4" />
          </Link>
        ) : (
          <span className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-white px-3 text-sm font-medium text-muted-foreground/70">
            Next
            <ChevronRight aria-hidden className="h-4 w-4" />
          </span>
        )}
      </div>
    </nav>
  );
}

export function pageFromSearchParams(
  params: Record<string, string | string[] | undefined>,
) {
  const raw = params["page"];
  if (typeof raw !== "string") return 1;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}
