import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LibraryAssistantLauncher } from "./library-assistant-launcher";

vi.mock("next/navigation", () => ({
  usePathname: () => "/electronic",
}));

afterEach(() => cleanup());

describe("LibraryAssistantLauncher", () => {
  it("links into the assistant with safe page context", () => {
    render(<LibraryAssistantLauncher />);
    const link = screen.getByRole("link", { name: "Ask the Library about this page" });

    expect(link).toHaveAttribute("href", expect.stringContaining("/ask?source_url=%2Felectronic"));
  });
});
