import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ResearchAskAIWidget } from "./research-ask-ai-widget";

const { queryResult, streamAskAI } = vi.hoisted(() => ({
  queryResult: { data: { data: [] } },
  streamAskAI: vi.fn(),
}));

vi.mock("next/navigation", () => ({ usePathname: () => "/research/projects" }));
vi.mock("@tanstack/react-query", () => ({
  useQuery: () => queryResult,
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));
vi.mock("@ksu/api-client", () => ({
  researchServiceApi: {
    listAskAIConversations: vi.fn(),
    listAskAIMessages: vi.fn(),
    streamAskAI,
  },
}));
vi.mock("@ksu/ui/components", () => {
  type DivProps = React.HTMLAttributes<HTMLDivElement>;
  type WrapperProps = DivProps & { asChild?: boolean; onOpenChange?: (open: boolean) => void };
  const passthrough = ({ children, asChild: _asChild, onOpenChange: _onOpenChange, ...props }: WrapperProps) => <div {...props}>{children}</div>;
  passthrough.displayName = "MockDiv";
  const button = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>;
  button.displayName = "MockButton";
  const textArea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>((props, ref) => <textarea ref={ref} {...props} />);
  textArea.displayName = "MockTextarea";
  const scrollArea = React.forwardRef<HTMLDivElement, DivProps>((props, ref) => <div ref={ref} {...props}>{props.children}</div>);
  scrollArea.displayName = "MockScrollArea";
  return {
    Button: button,
    DropdownMenu: passthrough,
    DropdownMenuContent: passthrough,
    DropdownMenuTrigger: passthrough,
    ScrollArea: scrollArea,
    Sheet: passthrough,
    SheetContent: passthrough,
    SheetDescription: passthrough,
    SheetHeader: passthrough,
    SheetTitle: passthrough,
    Textarea: textArea,
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("ResearchAskAIWidget", () => {
  it("aborts an active stream when the widget unmounts", async () => {
    let requestSignal: AbortSignal | undefined;
    streamAskAI.mockImplementationOnce((_data, _onEvent, signal) => {
      requestSignal = signal;
      return new Promise<void>((resolve) => signal?.addEventListener("abort", () => resolve(), { once: true }));
    });
    const view = render(<ResearchAskAIWidget />);

    fireEvent.change(screen.getByPlaceholderText("Ask about this research section..."), {
      target: { value: "Summarize this section" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send Ask AI message" }));
    await waitFor(() => expect(requestSignal).toBeDefined());

    view.unmount();

    expect(requestSignal?.aborted).toBe(true);
  });
});
