import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LibraryAssistantInboxClient } from "./assistant-inbox-client";

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  invalidateQueries: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: mocks.invalidateQueries }),
  useQuery: () => ({
    data: {
      data: [
        {
          id: "thread-1",
          verified_email: "reader@example.com",
          title: "MyLOFT access",
          status: "awaiting_librarian",
          created_at: "2026-07-28T10:00:00Z",
          updated_at: "2026-07-28T10:00:00Z",
          messages: [
            { id: "message-1", sender_type: "assistant", content: "A librarian can help.", citations: [], created_at: "2026-07-28T10:00:00Z" },
          ],
        },
      ],
    },
    isLoading: false,
    isError: false,
  }),
  useMutation: () => ({ mutate: mocks.mutate, isPending: false }),
}));

vi.mock("../../../../components/layout", () => ({
  PageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

describe("LibraryAssistantInboxClient", () => {
  afterEach(() => cleanup());

  it("shows a verified thread and reply composer", async () => {
    const user = userEvent.setup();
    render(<LibraryAssistantInboxClient />);

    expect(screen.getByRole("heading", { name: "Library Assistant Inbox" })).toBeVisible();
    expect(screen.getAllByText("reader@example.com")).toHaveLength(2);
    await user.type(screen.getByLabelText("Reply as the Library"), "Please use the MyLOFT link.");
    await user.click(screen.getByRole("button", { name: "Send reply" }));

    expect(mocks.mutate).toHaveBeenCalledWith({ id: "thread-1", content: "Please use the MyLOFT link." });
  });
});
