import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { ProjectResults } from "./project-results";

afterEach(() => cleanup());

it("renders the projected project DTO through the client display boundary", () => {
  const { container } = render(
    <ProjectResults
      view="table"
      projects={[
        {
          id: "project-1",
          slug: "climate-smart-agriculture",
          title: "Climate-smart agriculture",
          summary: "Research for resilient smallholder food systems.",
          status: "ongoing",
        },
      ]}
    />,
  );

  expect(container.querySelector('[data-server-data-display="research-projects"]')).not.toBeNull();
  expect(container.textContent).toContain("Climate-smart agriculture");
});
