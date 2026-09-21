import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { CenterFacilitiesDisplay, CentersDisplay, ProgramsDisplay } from "./research-record-displays";

afterEach(() => cleanup());

it("renders server-projected research records through focused client displays", () => {
  const { container } = render(
    <>
      <CentersDisplay centers={[{ id: "center-1", slug: "water", title: "Water Research Centre", center_type: "research_center", status: "active" }]} />
      <CenterFacilitiesDisplay facilities={[{ id: "facility-1", slug: "farm", title: "University Farm", farm_type: "experimental" }]} />
      <ProgramsDisplay
        programs={[{ id: "program-1", slug: "climate", name: "Climate Programme", status: "active" }]}
      />
    </>,
  );

  expect(container.querySelector('[data-server-data-display="research-centers"]')).not.toBeNull();
  expect(container.querySelector('[data-server-data-display="research-programs"]')).not.toBeNull();
  expect(container.textContent).toContain("Water Research Centre");
  expect(container.textContent).toContain("Climate Programme");
});
