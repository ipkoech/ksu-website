import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LibraryAssistantContextManagementClient } from "./context-management-client";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  publish: vi.fn(),
  archive: vi.fn(),
  invalidateQueries: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: mocks.invalidateQueries }),
  useQuery: () => ({
    data: {
      data: [{
        id: "context-1",
        name: "Research support",
        slug: "research-support",
        description: "Research help",
        audience: "Students",
        instructions: "Use approved research sources.",
        escalation_guidance: "Offer a librarian when needed.",
        status: "draft",
        is_public: false,
        sort_order: 1,
        sources: [{
          id: "source-1",
          context_id: "context-1",
          source_type: "guide",
          source_id: "11111111-1111-1111-1111-111111111111",
          title: "Research guide",
          public_url: "/guides/research",
          is_approved: true,
        }],
      }],
    },
    isLoading: false,
    isError: false,
  }),
  useMutation: ({ mutationFn }: { mutationFn: (payload: unknown) => unknown }) => ({
    mutate: (payload: unknown) => {
      mocks.update(payload);
      void mutationFn(payload);
    },
    isPending: false,
  }),
}));

vi.mock("../../../../components/layout", () => ({
  PageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

vi.mock("@ksu/api-client", () => ({
  libraryServiceApi: {
    assistantContexts: {
      list: vi.fn(),
      create: mocks.create,
      update: mocks.update,
      publish: mocks.publish,
      archive: mocks.archive,
    },
  },
}));

describe("LibraryAssistantContextManagementClient", () => {
  afterEach(() => cleanup());

  it("edits an approved source and saves the librarian context", async () => {
    const user = userEvent.setup();
    render(<LibraryAssistantContextManagementClient />);

    expect(screen.getByRole("heading", { name: "Assistant contexts" })).toBeVisible();
    expect(screen.getByDisplayValue("Research guide")).toBeVisible();
    await user.clear(screen.getByLabelText("Source title"));
    await user.type(screen.getByLabelText("Source title"), "Updated research guide");
    await user.click(screen.getByRole("button", { name: "Save context" }));

    expect(mocks.update).toHaveBeenCalled();
  });
});
