import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { createHmac } from "node:crypto";

const backend = "http://127.0.0.1:18080";

test.skip(
  process.env.KSU_AUTH_INTEGRATION !== "1",
  "Requires the explicitly disposable frontend backend",
);

async function login(page: Page) {
  await page.goto("/login/");
  await page.getByLabel("Email", { exact: true }).fill("mutation-admin@frontend.example.com");
  await page.getByLabel("Password", { exact: true }).fill("FrontendTestOnly!2026");
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(page).not.toHaveURL(/\/login\/?(?:\?.*)?$/);
}

function totp(secret: string): string {
  const normalized = secret.replace(/=+$/u, "").toUpperCase();
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const character of normalized) {
    const value = alphabet.indexOf(character);
    if (value < 0) throw new Error(`Invalid fixture MFA secret character: ${character}`);
    bits += value.toString(2).padStart(5, "0");
  }
  const key = Buffer.alloc(Math.floor(bits.length / 8));
  for (let index = 0; index < key.length; index += 1) {
    key[index] = Number.parseInt(bits.slice(index * 8, index * 8 + 8), 2);
  }
  const counter = Math.floor(Date.now() / 1000 / 30);
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac("sha1", key).update(message).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const value = digest.readUInt32BE(offset) & 0x7fffffff;
  return String(value % 1_000_000).padStart(6, "0");
}

async function enrollFixtureMfa(context: BrowserContext) {
  const status = await context.request.get(`${backend}/api/v1/auth/mfa/status`);
  expect(status.ok()).toBe(true);
  const statusBody = (await status.json()) as { data?: { enabled?: boolean } };
  expect(statusBody.data?.enabled).toBe(false);

  const enrollment = await context.request.post(`${backend}/api/v1/auth/mfa/enroll`, {
    data: { password: "FrontendTestOnly!2026" },
  });
  expect(enrollment.ok()).toBe(true);
  const enrollmentBody = (await enrollment.json()) as { data?: { secret?: string } };
  const secret = enrollmentBody.data?.secret;
  expect(secret).toBeTruthy();

  const confirmed = await context.request.post(`${backend}/api/v1/auth/mfa/confirm`, {
    data: { mfa_code: totp(secret as string) },
  });
  expect(confirmed.ok()).toBe(true);
}

test("real administrator can create, update, upload, and delete disposable records @backend-mutations", async ({
  page,
  context,
}) => {
  await login(page);
  await enrollFixtureMfa(context);

  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const email = `mutation-${suffix}@frontend.example.com`;
  let userId: string | undefined;
  let mediaId: string | undefined;

  try {
    const created = await context.request.post(`${backend}/api/v1/admin/users`, {
      data: {
        email,
        full_name: "Frontend Mutation Fixture",
        password: "FrontendMutation!2026",
      },
    });
    expect(created.status()).toBe(201);
    const createdBody = (await created.json()) as { data?: { id?: string } };
    userId = createdBody.data?.id;
    expect(userId).toBeTruthy();

    const updated = await context.request.put(`${backend}/api/v1/admin/users/${userId}`, {
      data: { full_name: "Frontend Mutation Fixture Updated", is_active: true },
    });
    expect(updated.ok()).toBe(true);

    const uploaded = await context.request.post(`${backend}/api/v1/media/upload`, {
      multipart: {
        file: {
          name: `frontend-mutation-${suffix}.txt`,
          mimeType: "text/plain",
          buffer: Buffer.from("Frontend disposable upload verification"),
        },
        is_public: "false",
      },
    });
    expect(uploaded.status()).toBe(201);
    const uploadedBody = (await uploaded.json()) as { data?: { id?: string } };
    mediaId = uploadedBody.data?.id;
    expect(mediaId).toBeTruthy();
  } finally {
    if (mediaId) {
      const deletedMedia = await context.request.delete(`${backend}/api/v1/media/${mediaId}`);
      expect(deletedMedia.status()).toBe(204);
    }
    if (userId) {
      const deletedUser = await context.request.delete(`${backend}/api/v1/admin/users/${userId}`);
      expect(deletedUser.status()).toBe(204);
    }
  }
});
