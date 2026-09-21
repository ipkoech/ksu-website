import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { LibraryUpdateContentDisplay } from "./update-content-display";

afterEach(() => cleanup());

it("renders server-projected update content through a client display marker", () => {
  const { container } = render(
    <LibraryUpdateContentDisplay content="<p>Library opening hours</p>" fallback="No update text" />,
  );

  expect(container.querySelector('[data-server-data-display="library-update-content"]')).not.toBeNull();
  expect(container.textContent).toContain("Library opening hours");
});
