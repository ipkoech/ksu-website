import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CapacityDataDisplay } from "./capacity-data-display";

describe("CapacityDataDisplay", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });
  });

  it("renders the server-projected capacity records", () => {
    const record = {
      id: "training-1",
      title: "Research methods institute",
      summary: "A practical programme for early-career researchers.",
      description: null,
      status: "published",
      programType: "short_course",
      deliveryMode: "hybrid",
      startDate: "2026-02-01",
      venue: "Main Campus",
      isFeatured: true,
    } as const;

    render(
      <CapacityDataDisplay
        training={[record]}
        mentorship={[]}
        scholarships={[]}
        errors={[]}
      />,
    );

    expect(
      document.querySelector('[data-server-data-display="research-capacity"]'),
    ).not.toBeNull();
    expect(screen.getByText("Research methods institute")).toBeVisible();
    expect(screen.getByText("A practical programme for early-career researchers.")).toBeVisible();
  });
});
