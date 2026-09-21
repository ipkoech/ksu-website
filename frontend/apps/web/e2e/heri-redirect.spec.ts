import { expect, test } from "@playwright/test";

test("hands HERI navigation to the owning frontend without proxying RSC", async ({
  request,
  baseURL,
}) => {
  const response = await request.get(`${baseURL}/heri-africa?from=web`, {
    maxRedirects: 0,
  });
  expect(response.status()).toBe(307);
  expect(response.headers().location).toMatch(/\/heri-africa\?from=web$/);
  expect(response.headers()["x-nextjs-rewrite"]).toBeUndefined();
});
