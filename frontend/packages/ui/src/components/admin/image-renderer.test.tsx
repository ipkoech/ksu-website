import "@testing-library/jest-dom/vitest";
import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { ImageRenderer } from "./image-renderer";

afterEach(cleanup);

it("reserves intrinsic media space before the image loads", () => {
  render(
    <ImageRenderer
      image={{
        url: "https://cdn.example.invalid/portrait.jpg",
        width: 1200,
        height: 800,
        alt_text: "University portrait",
      }}
    />,
  );

  const image = screen.getByRole("img", { name: "University portrait" });
  expect(image).toHaveAttribute("width", "1200");
  expect(image).toHaveAttribute("height", "800");
  expect(image).toHaveAttribute("loading", "lazy");
  expect(image).toHaveStyle({ aspectRatio: "1.5" });
});
