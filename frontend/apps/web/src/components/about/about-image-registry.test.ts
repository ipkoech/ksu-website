import { describe, expect, it } from "vitest";
import {
  ABOUT_PAGE_IMAGE_POOLS,
  createAboutImagePicker,
  isGenericAboutImage,
} from "./about-image-registry";

describe("about image registry", () => {
  it("falls back to unused local images when media is generic or repeated", () => {
    const pick = createAboutImagePicker("about");

    expect(pick("/images/about/about-overview-branded.webp")).toBe(
      "/images/about-us/gate-1.jpg",
    );

    const second = pick("/images/about-us/gate-1.jpg");
    expect(second).toBe("/images/about-us/sakagwa-tc.jpg");
    expect(pick(second)).toBe("/images/about-us/block%20C.jpg");
  });

  it("keeps every page pool unique while allowing reuse between pages", () => {
    for (const pool of Object.values(ABOUT_PAGE_IMAGE_POOLS)) {
      expect(new Set(pool).size).toBe(pool.length);
      expect(pool.every((image) => image.startsWith("/images/about-us/"))).toBe(
        true,
      );
    }

    expect(ABOUT_PAGE_IMAGE_POOLS.about).not.toEqual(
      ABOUT_PAGE_IMAGE_POOLS.numbersFacts,
    );
  });

  it("recognizes the generic About fallbacks being removed", () => {
    expect(isGenericAboutImage("/images/about/about-mission-vision.webp")).toBe(
      true,
    );
    expect(isGenericAboutImage("/images/backgrounds/about-hero.jpg")).toBe(true);
    expect(isGenericAboutImage("/images/backgrounds/KSUB-RollPhotos2025-123.jpg")).toBe(
      true,
    );
    expect(isGenericAboutImage("/images/about-us/pathway-3.jpg")).toBe(false);
  });
});
