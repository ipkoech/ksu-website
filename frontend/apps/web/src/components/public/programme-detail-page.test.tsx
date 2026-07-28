import "@testing-library/jest-dom/vitest";

import React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProgrammeDetailPage } from "./programme-detail-page";
import type { ProgrammeDetailData } from "@/lib/programme-detail-data";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/site-shell", () => ({
  BreadcrumbTrail: ({ items }: { items: { label: string }[] }) => (
    <nav aria-label="Breadcrumb">
      {items.map((item) => (
        <span key={item.label}>{item.label}</span>
      ))}
    </nav>
  ),
  PageShell: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/components/ui/about-page-lenis", () => ({
  AboutPageLenis: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/components/public/public-image", () => ({
  PublicImage: ({
    alt,
    fallbackContent,
  }: {
    alt: string;
    fallbackContent?: React.ReactNode;
  }) => (
    <div role="img" aria-label={alt}>
      {fallbackContent}
    </div>
  ),
}));

vi.mock("@ksu/ui/rich-text-renderer", () => ({
  RichTextRenderer: ({
    content,
    className,
    emptyFallback,
  }: {
    content?: string | null;
    className?: string;
    emptyFallback?: React.ReactNode;
  }) =>
    content ? (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    ) : (
      <>{emptyFallback}</>
    ),
}));

vi.mock("@/lib/public-media", () => ({
  publicFileUrl: (id?: string | null) => (id ? `/media/${id}` : null),
}));

const data: ProgrammeDetailData = {
  slug: "bachelor-of-laws",
  sourceBacked: true,
  programme: {
    id: "programme-llb",
    name: "Bachelor of Laws",
    code: "LLB",
    slug: "bachelor-of-laws",
    level: "bachelor",
    mode_of_study: "full_time",
    duration: "4 years",
    department_id: "department-law",
    department_name: "Department of Law",
    department: {
      id: "department-law",
      name: "Department of Law",
      slug: "department-of-law",
    } as NonNullable<ProgrammeDetailData["programme"]>["department"],
    about:
      "The Bachelor of Laws programme equips students with legal knowledge and practical skills.",
    entry_requirements:
      "<ul><li>KCSE mean grade of C+ or equivalent.</li><li>Subject requirements apply.</li></ul>",
    career_prospects:
      "Graduates may work as advocates, legal officers, policy analysts, and legal consultants.",
    fees_structure: {
      tuition: {
        amount: "To be confirmed",
        notes: "Subject to University review",
      },
    },
    intake_months: ["September"],
    accreditation_status: "accredited",
    accrediting_body:
      "Council of Legal Education (https://cle.or.ke/downloads/)",
    is_active: true,
    display_order: 1,
    created_at: "2026-07-16T00:00:00Z",
    updated_at: "2026-07-16T00:00:00Z",
  },
  relatedProgrammes: [
    {
      id: "related-1",
      name: "Bachelor of Arts in Criminology and Security Studies",
      code: "BA-CRIM",
      slug: "bachelor-of-arts-in-criminology-and-security-studies",
      level: "bachelor",
      mode_of_study: "full_time",
      duration: "4 years",
      department_id: "department-law",
      department_name: "Department of Law",
      is_active: true,
      display_order: 2,
      created_at: "2026-07-16T00:00:00Z",
      updated_at: "2026-07-16T00:00:00Z",
    },
  ],
};

describe("ProgrammeDetailPage", () => {
  it("shows complete visible programme information without tab or accordion controls", () => {
    render(<ProgrammeDetailPage data={data} />);

    expect(
      screen.getByRole("heading", { name: "Bachelor of Laws", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Bachelor's Degree").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Full-time").length).toBeGreaterThan(0);
    expect(screen.getAllByText("4 years").length).toBeGreaterThan(0);
    expect(screen.getAllByText("September").length).toBeGreaterThan(0);

    expect(
      screen.getByRole("heading", { name: "About the programme" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Entry requirements" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Career opportunities" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Fees structure" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Accreditation" }),
    ).toBeInTheDocument();

    const accreditationSection = screen
      .getByRole("heading", { name: "Accreditation" })
      .closest("section");
    expect(accreditationSection).toBeInTheDocument();
    expect(within(accreditationSection!).getByText("Accredited")).toBeVisible();
    expect(
      within(accreditationSection!).getByRole("link", {
        name: /Council of Legal Education/i,
      }),
    ).toHaveAttribute("href", "https://cle.or.ke/downloads/");

    const details = screen
      .getByText("Programme details")
      .closest("section");
    expect(details).toBeInTheDocument();
    expect(within(details!).getByText("Programme level")).toBeInTheDocument();
    expect(within(details!).getByText("Mode of study")).toBeInTheDocument();
    expect(within(details!).getByText("Duration")).toBeInTheDocument();
    expect(within(details!).getByText("Intake")).toBeInTheDocument();

    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /expand|collapse/i })).not.toBeInTheDocument();
  });
});
