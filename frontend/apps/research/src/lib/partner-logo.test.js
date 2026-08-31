import { assert, test } from "vitest";

import { getPartnerLogo } from "./partner-logo.js";

test("partner logos prefer local social-link assets and reject source webpages", () => {
  assert.equal(
    getPartnerLogo({
      logo_url: "https://example.org/remote-logo.png",
      social_links: {
        logo_url: "/images/research/partners/university-of-minnesota.svg",
        logo_asset_path: "/images/research/partners/fallback.svg",
        logo_source_url: "https://brand.umn.edu/",
      },
    }),
    "/images/research/partners/university-of-minnesota.svg",
  );

  assert.equal(
    getPartnerLogo({
      social_links: {
        logo_asset_path: "/images/research/partners/university-of-minnesota.svg",
        logo_source_url: "https://brand.umn.edu/",
      },
    }),
    "/images/research/partners/university-of-minnesota.svg",
  );

  assert.equal(
    getPartnerLogo({
      social_links: {
        logo_source_url: "https://brand.umn.edu/",
      },
    }),
    "",
  );
});
