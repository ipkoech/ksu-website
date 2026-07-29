import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AskLibraryClient } from "./ask-library-client";

const mocks = vi.hoisted(() => ({
  answer: vi.fn(),
  requestVerification: vi.fn(),
  confirmVerification: vi.fn(),
  messages: vi.fn(),
  continueConversation: vi.fn(),
}));

vi.mock("@ksu/api-client", () => ({
  ApiClientError: class ApiClientError extends Error {},
  libraryServiceApi: {
    assistant: {
      answer: mocks.answer,
      verification: {
        request: mocks.requestVerification,
        confirm: mocks.confirmVerification,
      },
      conversations: {
        messages: mocks.messages,
        continue: mocks.continueConversation,
      },
    },
  },
}));

describe("AskLibraryClient", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.answer.mockResolvedValue({
      data: {
        answer: "Use the MyLOFT link from the Library portal.",
        citations: [{ source_type: "database", source_id: "db-1", title: "MyLOFT", url: "/electronic" }],
        suggested_questions: [],
        needs_verification: true,
        should_escalate: false,
        provider: "deterministic",
      },
    });
    mocks.requestVerification.mockResolvedValue({
      data: { accepted: true, message: "A verification code is on its way." },
    });
  });

  it("shows one grounded answer and then asks for email continuation", async () => {
    const user = userEvent.setup();
    render(<AskLibraryClient contexts={[{ id: "research", name: "Research support", slug: "research" }]} />);

    await user.type(screen.getByRole("textbox", { name: "Your question" }), "How do I access MyLOFT?");
    await user.click(screen.getByRole("button", { name: "Ask the Library" }));

    expect(await screen.findByText("Use the MyLOFT link from the Library portal.")).toBeVisible();
    expect(screen.getByLabelText("Email address")).toBeVisible();
    expect(screen.getByRole("link", { name: "MyLOFT" })).toHaveAttribute("href", "/electronic");
  });

  it("sends the email request and reveals the code confirmation step", async () => {
    const user = userEvent.setup();
    render(<AskLibraryClient contexts={[]} />);

    await user.type(screen.getByRole("textbox", { name: "Your question" }), "Where are the library opening hours?");
    await user.click(screen.getByRole("button", { name: "Ask the Library" }));
    await user.type(screen.getByLabelText("Email address"), "reader@example.com");
    await user.click(screen.getByRole("button", { name: "Send verification" }));

    expect(await screen.findByText("A verification code is on its way.")).toBeVisible();
    expect(screen.getByLabelText("Verification code")).toBeVisible();
    expect(mocks.requestVerification).toHaveBeenCalledWith("reader@example.com");
  });
});
