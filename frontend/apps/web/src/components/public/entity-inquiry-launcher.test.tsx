import "@testing-library/jest-dom/vitest";

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EntityInquiryLauncher } from "./entity-inquiry-launcher";

vi.mock("@ksu/api-client", () => ({
  mainApi: {
    post: vi.fn(),
  },
}));

const target = {
  type: "university" as const,
  slug: "kisii-university",
  name: "Kisii University",
};

describe("EntityInquiryLauncher", () => {
  beforeEach(() => {
    globalThis.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    document.body.innerHTML =
      '<div id="ksu-contextual-action-slot"></div>';
  });

  it("renders an icon-only launcher in the shared action dock", () => {
    render(<EntityInquiryLauncher target={target} />);

    const launcher = screen.getByRole("button", {
      name: "Send a message to Kisii University",
    });

    expect(launcher).toHaveAttribute("title", "Send a message");
    expect(launcher).toHaveTextContent("");
    expect(launcher.parentElement).toHaveAttribute(
      "id",
      "ksu-contextual-action-slot",
    );
  });

  it("opens a side panel and preserves the draft when reopened", () => {
    render(<EntityInquiryLauncher target={target} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Send a message to Kisii University",
      }),
    );

    expect(
      screen.getByRole("dialog", {
        name: "Send a message to Kisii University",
      }),
    ).toBeInTheDocument();

    const subject = screen.getByLabelText("Subject");
    fireEvent.change(subject, {
      target: { value: "Accessible admissions support" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "Send a message to Kisii University",
      }),
    );

    expect(screen.getByLabelText("Subject")).toHaveValue(
      "Accessible admissions support",
    );
  });
});
