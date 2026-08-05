import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LibraryAssistantLauncher } from "./library-assistant-launcher";

vi.mock("next/navigation", () => ({
  usePathname: () => "/electronic",
}));

describe("LibraryAssistantLauncher", () => {
  it("links into the assistant with safe page context", () => {
    render(<LibraryAssistantLauncher />);
    const link = screen.getByRole("link", { name: "Ask the Library about this page" });

    expect(link).toHaveAttribute("href", expect.stringContaining("/ask?source_url=%2Felectronic"));
  });
});
