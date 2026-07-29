import { describe, expect, it } from "vitest";
import { buildLibrarySearchHref } from "./library-home";

describe("buildLibrarySearchHref", () => {
  it("preserves the search phrase and selected search type in the URL", () => {
    expect(buildLibrarySearchHref("  climate change  ", "articles")).toBe(
      "/search?q=climate+change&type=articles",
    );
  });

  it("returns the base search route for an empty phrase", () => {
    expect(buildLibrarySearchHref("", "everything")).toBe("/search");
  });
});
