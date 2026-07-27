import { describe, expect, it } from "vitest";
import { buildNavigation } from "./public-header";

describe("main public site navigation", () => {
  it("builds the requested main-site hierarchy and utility links", () => {
    const navigation = buildNavigation(
      {
        schools: [
          { id: "school-1", name: "School of Computing", slug: "computing" },
        ],
        clubs: [
          { id: "club-1", name: "Debate Club", slug: "debate" },
        ],
      },
      {
        heriHref: "http://localhost:3004",
        researchHref: "http://localhost:3002",
        libraryHref: "http://localhost:3003",
      },
    );

    expect(navigation.map((item) => item.label)).toEqual([
      "ABOUT US",
      "PROGRAMMES",
      "RESEARCH",
      "LIBRARY",
      "CAMPUS LIFE",
      "NEWS & EVENTS",
      "CONTACT",
    ]);

    const about = navigation[0];
    expect(about.children?.map((item) => item.label)).toEqual([
      "ABOUT KSU",
      "UNIVERSITY COUNCIL",
      "UNIVERSITY MANAGEMENT",
      "UNIVERSITY SERVICE CHARTER",
      "STRATEGIC PLAN",
      "KSU NUMBERS & FACTS",
      "HERI AFRICA",
      "NYANGWETA FARM",
    ]);
    expect(about.children?.at(-2)).toMatchObject({
      href: "http://localhost:3004",
      external: true,
      group: "QUICK LINKS",
    });
    expect(about.children?.at(-1)).toMatchObject({
      href: "#",
      group: "QUICK LINKS",
    });

    const programmes = navigation[1];
    expect(programmes.children?.map((item) => item.label)).toEqual([
      "ALL PROGRAMMES",
      "ADMISSIONS",
      "SCHOOLS",
      "ACADEMIC DIVISION",
    ]);
    expect(programmes.children?.[1].children?.map((item) => item.label)).toEqual([
      "UNDERGRADUATE",
      "POSTGRADUATE",
      "INTERNATIONAL STUDENTS",
      "REQUIREMENTS",
      "FEES & SCHOLARSHIPS",
      "HOW TO APPLY",
    ]);
    expect(programmes.children?.[2].children?.[0]).toMatchObject({
      label: "COMPUTING",
      href: "/academics/schools/computing",
    });
    expect(programmes.children?.[3].children?.map((item) => item.label)).toEqual([
      "ORGANIZATION",
      "CALENDAR",
      "EXAMINATIONS",
    ]);

    expect(navigation[4].children?.map((item) => item.label)).toEqual([
      "STUDENT LIFE",
      "CLUBS & SOCIETIES",
      "SPORTS",
      "ACCOMMODATION",
      "SUPPORT SERVICES",
    ]);
    expect(navigation[5]).toMatchObject({
      label: "NEWS & EVENTS",
      href: "/media",
    });
    expect(navigation[5].children).toBeUndefined();
  });
});
