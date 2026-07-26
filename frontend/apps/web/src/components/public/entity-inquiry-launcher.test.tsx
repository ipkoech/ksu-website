import "@testing-library/jest-dom/vitest";

import React from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mainApi } from "@ksu/api-client";

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
    vi.clearAllMocks();
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
    expect(launcher).toHaveAttribute("aria-expanded", "false");
    expect(launcher).toHaveAttribute("aria-controls");
    expect(launcher.parentElement).toHaveAttribute(
      "id",
      "ksu-contextual-action-slot",
    );
  });

  it("opens a side panel and preserves the draft when reopened", () => {
    render(<EntityInquiryLauncher target={target} />);

    const launcher = screen.getByRole("button", {
      name: "Send a message to Kisii University",
    });
    fireEvent.click(launcher);

    expect(launcher).toHaveAttribute("aria-expanded", "true");
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

  it("announces success and clears a submitted draft", async () => {
    vi.mocked(mainApi.post).mockResolvedValueOnce({
      data: {
        reference_number: "KSU-2026-001",
        target_entity_name: "Kisii University",
      },
    });
    render(<EntityInquiryLauncher target={target} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Send a message to Kisii University",
      }),
    );
    fireEvent.change(screen.getByLabelText("Your name"), {
      target: { value: "Amina" },
    });
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "amina@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Subject"), {
      target: { value: "Accessible support" },
    });
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "Please share accessible formats." },
    });
    fireEvent.click(
      screen.getByText(
        "I consent to Kisii University using these details to respond to this inquiry.",
      ),
    );
    fireEvent.submit(
      screen.getByRole("button", { name: "Send message" }).closest("form")!,
    );

    expect(
      await screen.findByText("KSU-2026-001"),
    ).toHaveAttribute("aria-label", "Reference number KSU-2026-001");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Message sent. Reference number KSU-2026-001.",
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Send another message" }),
    );
    await waitFor(() =>
      expect(screen.getByLabelText("Subject")).toHaveValue(""),
    );
  });

  it("focuses the first invalid field", () => {
    render(<EntityInquiryLauncher target={target} />);
    fireEvent.click(
      screen.getByRole("button", {
        name: "Send a message to Kisii University",
      }),
    );

    fireEvent.submit(
      screen.getByRole("button", { name: "Send message" }).closest("form")!,
    );

    expect(screen.getByLabelText("Your name")).toHaveFocus();
    expect(mainApi.post).not.toHaveBeenCalled();
  });
});
