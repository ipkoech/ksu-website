/** Browser-only fault injection. All API writes are intercepted; no production data is seeded. */
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const id = "12345678-1234-4234-8234-123456789abc";
const areas = ["projects","centers","programs","themes","focus-areas","expertise-tags","grants","grant-applications","grant-reviews","grant-reports","grant-guidelines","funders","endowments","publications","journals","outputs","innovations","startups","incubation-records","competition-entries","technology-transfer-cases","training","mentorship","mentorship-applications","mentorship-matches","scholarships","scholarship-applications","partners","consultancies","farms","sustainability","stories","impact-metrics","donors","donations","donation-impacts","donation-stories","donation-settings","resources","services","guidelines"];
const editorial = new Set(["projects","publications","farms","sustainability","partners","stories","focus-areas","impact-metrics"]);
const label = (key: string) => key.replace(/-/g, " ").replace(/^./, value => value.toUpperCase());
const field = (key: string, required = false) => ({ key, label: label(key), section: "Identity", kind: "string", required, nullable: !required, create: true, update: true, max_length: 500, minimum: null, maximum: null, default: null });
const catalog = areas.map(key => ({ key, label: label(key), singular: key === "projects" ? "project" : key.replace(/-/g," "), group: "Test fixture working areas", workflow: editorial.has(key), can_create: true, fields: [field("title",true),field("slug")], columns: [], filter_fields: [], commands: [] }));

async function fixture(page: Page, options: { bootstrapStatus?: number; catalogStatus?: number; firstWriteStatus?: number; retryWriteStatus?: number; malformedWrite?: boolean; contentOnly?: boolean; institutionalKeys?: string[]; wrongDetail?: boolean; mismatchedPage?: boolean; explicitErrorWrite?: boolean } = {}) {
  const writes: Array<{ path: string; key: string; body: unknown }> = [];
  let title = "Fixture research record";
  const revision = '"rw-' + "a".repeat(64) + '"';
  await page.route("**/api/v1/**", async route => {
    const request = route.request(), url = new URL(request.url()), path = url.pathname;
    const answer = (data: unknown, status = 200) => route.fulfill({ status, contentType: "application/json", headers: { "Access-Control-Allow-Origin": request.headers()["origin"] ?? new URL(page.url()).origin, "Access-Control-Allow-Credentials": "true", "Access-Control-Allow-Headers": "Content-Type,Idempotency-Key,X-KSU-Expected-Actor,If-Match", "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS" }, body: JSON.stringify(data) });
    if (request.method() === "OPTIONS") return answer({});
    if (path.endsWith("/auth/me")) return answer({ data: { id, email: "fixture@example.test", full_name: "Fixture administrator", must_change_password: false } });
    if (path.includes("/research-portal/operations/") && request.method() === "GET") return answer({ data: { relationships: [], children: [] } });
    if (path.endsWith("/auth/refresh")) return answer({ detail: "Expired fixture" }, 401);
    if ((path.endsWith("/workspace/context") || path.endsWith("/workspace/catalog")) && request.headers()["x-ksu-expected-actor"] !== id) {
      return answer({ detail: "Bootstrap is not bound to the verified Main account" }, 409);
    }
    if (path.endsWith("/workspace/context")) {
      if (options.bootstrapStatus) return answer({ detail: "Injected bootstrap failure" }, options.bootstrapStatus);
      return answer({ data: { subject: id, capabilities: { "media.upload": true, "research.manage_reports": true }, allowed_navigation: [...(options.contentOnly ? [] : areas), ...(options.institutionalKeys ?? [])], domains: [], is_global: true, can_review: true, can_publish: true } });
    }
    if (path.endsWith("/workspace/catalog")) {
      if (options.catalogStatus) return answer({ detail: "The signed-in account changed during bootstrap" }, options.catalogStatus);
      return answer({ data: options.contentOnly ? [] : catalog });
    }
    if (path.includes("/workspace/")) {
      const key = path.split("/workspace/")[1].split("/")[0];
      const row = { id, title, revision, workflow_state: editorial.has(key) ? "draft" : null, record: { id,title,slug:"fixture",created_at:"2026-09-28T00:00:00Z",updated_at:"2026-09-28T00:00:00Z" }, actions: { edit:true,submit:editorial.has(key),approve:false,reject:false,unpublish:false,history:false,delete:true }, commands:[] };
      if (path.endsWith(id)) {
        const other = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
        return answer({ data: options.wrongDetail ? { ...row, id: other, title: "Unrelated research record",
          record: { ...row.record, id: other, title: "Unrelated research record" } } : row });
      }
      const pageNumber=Number(url.searchParams.get("page") || 1), perPage=Number(url.searchParams.get("per_page") || 20);
      return answer({ data: pageNumber === 1 ? [row] : [], meta: { page:options.mismatchedPage ? pageNumber + 1 : pageNumber, per_page:perPage, total:1, total_pages:1 } });
    }
    if (["POST","PATCH","DELETE"].includes(request.method())) {
      let body: unknown = null;
      try { body = request.postDataJSON(); } catch { /* Multipart request fixtures are not treated as JSON. */ }
      writes.push({ path, key: request.headers()["idempotency-key"] ?? "", body });
      if (writes.length === 1 && options.firstWriteStatus === 0) return route.abort("failed");
      if (writes.length === 1 && options.firstWriteStatus) return answer({ detail: options.firstWriteStatus === 409 ? "Command is already in progress" : "Injected write failure" }, options.firstWriteStatus);
      if (writes.length > 1 && options.retryWriteStatus) return answer({ detail: "Injected retry rejection" }, options.retryWriteStatus);
      if (options.malformedWrite) return answer({ data: { id: "malformed-id" } });
      if (options.explicitErrorWrite) return answer({ status: "error", data: { id } });
      if (body && typeof body === "object" && "title" in body && typeof body.title === "string") title = body.title;
      return answer({ data: { id, deleted: request.method() === "DELETE", resource: path.startsWith("/api/v1/research-workflow/") ? path.split("/")[4] : undefined, workflow_state: "pending" } });
    }
    // Do not let an unexpected endpoint reach a real backend during this suite.
    return answer({ detail: "Unconfigured local API fixture" }, 503);
  });
  return writes;
}

for (const key of areas) test(`${key} has a routed, actionable workspace`, async ({ page }) => {
  await fixture(page); await page.goto(`/admin/${key}`);
  await expect(page.getByRole("heading", { name: label(key), exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Fixture research record", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Create/ }).last()).toBeVisible();
});
for (const status of [0,409,503]) test(`uncertain ${status || "network"} writes cannot become duplicate commands`, async ({ page }) => {
  const writes = await fixture(page, { firstWriteStatus: status });
  await page.goto("/admin/projects/new"); await page.getByLabel(/Title/).fill("My test study");
  await page.getByRole("button", { name: "Create project", exact: true }).click();
  await expect(page.getByLabel(/Title/)).toBeDisabled();
  await page.getByRole("button", { name: "Retry the same command" }).click();
  await expect(page).toHaveURL(new RegExp(`/admin/projects/${id}$`));
  expect(writes).toHaveLength(2); expect(writes[0].key).toBeTruthy(); expect(writes[0].key).toBe(writes[1].key);
});
for (const status of [401,403,503]) test(`bootstrap ${status} never displays protected records`, async ({ page }) => {
  await fixture(page,{ bootstrapStatus:status }); await page.goto("/admin/projects");
  await expect(page.getByText("Injected bootstrap failure", { exact: true })).toBeVisible();
  await expect(page.getByText("Fixture research record",{exact:true})).toHaveCount(0);
});
test("malformed successful mutation is not shown as saved", async ({ page }) => {
  await fixture(page,{malformedWrite:true}); await page.goto("/admin/projects/new");
  await page.getByLabel(/Title/).fill("My test study"); await page.getByRole("button",{name:"Create project",exact:true}).click();
  await expect(page.getByText("Unexpected server response",{exact:true})).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/projects\/new$/);
  await expect(page.getByLabel(/Title/)).toBeDisabled();
});
test("empty required input cannot send a mutation",async({page})=>{
  const writes=await fixture(page);await page.goto("/admin/projects/new");await page.getByRole("button",{name:"Create project",exact:true}).click();
  await expect(page.getByRole("heading",{name:"Review these fields"})).toBeVisible();expect(writes).toHaveLength(0);
});
test("delete needs explicit confirmation",async({page})=>{
  const writes=await fixture(page);await page.goto(`/admin/projects/${id}`);await page.getByRole("button",{name:"Delete record",exact:true}).click();
  const dialog=page.getByRole("dialog");await dialog.getByRole("button",{name:"Delete record",exact:true}).click();expect(writes).toHaveLength(0);
  await dialog.getByLabel(/Type the exact title/).fill("Fixture research record");await dialog.getByRole("button",{name:"Delete record",exact:true}).click();
  await expect(page).toHaveURL(/\/admin\/projects\?deleted=1$/);expect(writes).toHaveLength(1);
});
test("mobile navigation closes with Escape and restores focus",async({page})=>{
  await page.setViewportSize({width:390,height:844});await fixture(page);await page.goto("/admin/projects");
  const button=page.getByRole("button",{name:"Open navigation"});await button.click();await expect(page.getByRole("dialog",{name:"Research workspace navigation"})).toBeVisible();
  await page.keyboard.press("Escape");await expect(button).toBeFocused();
});
test("workspace form has no serious automated accessibility violations",async({page})=>{
  await fixture(page);await page.goto("/admin/projects/new");await expect(page.getByRole("heading",{name:"Create project"})).toBeVisible();
  const result=await new AxeBuilder({page}).analyze();expect(result.violations.filter(item=>item.impact==='serious'||item.impact==='critical')).toEqual([]);
});


test("bootstrap context and catalog are bound before any record is shown", async ({ page }) => {
  const headers: Record<string, string> = {};
  page.on("request", request => {
    const path = new URL(request.url()).pathname;
    if (path.endsWith("/workspace/context") || path.endsWith("/workspace/catalog"))
      headers[path.split("/").at(-1)!] = request.headers()["x-ksu-expected-actor"];
  });
  await fixture(page);
  await page.goto("/admin/projects");
  await expect(page.getByRole("link", { name: "Fixture research record", exact: true })).toBeVisible();
  expect(headers).toEqual({ context: id, catalog: id });
});

test("catalog account conflict never renders private records", async ({ page }) => {
  const writes = await fixture(page, { catalogStatus: 409 });
  await page.goto("/admin/projects");
  await expect(page.getByText("The signed-in account changed during bootstrap", { exact: true })).toBeVisible();
  await expect(page.getByText("Fixture research record", { exact: true })).toHaveCount(0);
  expect(writes).toHaveLength(0);
});

test("Main-content-only assignment can reach its existing editor handoff", async ({ page }) => {
  await fixture(page, { contentOnly: true, institutionalKeys: ["content-news"] });
  await page.goto("/admin");
  await page.getByRole("link", { name: "Open assigned content and staff destinations" }).click();
  await expect(page).toHaveURL(/\/admin\/institutional$/);
  await expect(page.getByRole("heading", { name: "Research news", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Institutional staff", exact: true })).toHaveCount(0);
});

test("unassigned institutional handoffs remain hidden", async ({ page }) => {
  await fixture(page);
  await page.goto("/admin/institutional");
  await expect(page.getByRole("heading", { name: "No institutional destinations are assigned" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Content and staff", exact: true })).toHaveCount(0);
});


test("a mismatched detail record never exposes its edit controls", async ({ page }) => {
  const writes = await fixture(page, { wrongDetail: true });
  await page.goto(`/admin/projects/${id}`);
  await expect(page.getByText("Unexpected server response", { exact: true })).toBeVisible();
  await expect(page.getByText("Unrelated research record", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Delete record", exact: true })).toHaveCount(0);
  expect(writes).toHaveLength(0);
});

test("an incorrect returned page is not presented as the requested results", async ({ page }) => {
  await fixture(page, { mismatchedPage: true });
  await page.goto("/admin/projects?page=1&per_page=20");
  await expect(page.getByText("Unexpected server response", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Fixture research record", exact: true })).toHaveCount(0);
});

test("a success-shaped body inside an error envelope never navigates to saved detail", async ({ page }) => {
  const writes = await fixture(page, { explicitErrorWrite: true });
  await page.goto("/admin/projects/new");
  await page.getByLabel(/Title/).fill("My test study");
  await page.getByRole("button", { name: "Create project", exact: true }).click();
  await expect(page.getByText("Unexpected server response", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/projects\/new$/);
  await expect(page.getByLabel(/Title/)).toBeDisabled();
  expect(writes).toHaveLength(1);
});

// These regressions distinguish a local rejection from an unverified HTTP response.
test("short MFA code leaves login inputs editable and sends no request", async ({ page }) => {
  const writes = await fixture(page);
  await page.goto("/admin/login");
  await page.getByLabel("Email address", { exact: true }).fill("fixture@example.test");
  await page.getByLabel("Password", { exact: true }).fill("fixture-password");
  const factor = page.getByLabel(/Authenticator or recovery code/);
  await factor.fill("12345");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText("Check the entered values", { exact: true })).toBeVisible();
  await expect(factor).toBeEnabled();
  await expect(page.getByRole("button", { name: "Retry the same command" })).toHaveCount(0);
  expect(writes).toHaveLength(0);
  await factor.fill("123456");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  // The generic fixture deliberately omits a valid login acknowledgement.
  // A real dispatch with this response must now lock rather than report success.
  await expect(page.getByText("Unexpected server response", { exact: true })).toBeVisible();
  await expect(factor).toBeDisabled();
  expect(writes).toHaveLength(1);
});

test("unchanged required password can be corrected without reloading", async ({ page }) => {
  const writes = await fixture(page);
  await page.goto("/admin/password-required");
  await page.getByLabel("Current password", { exact: true }).fill("fixture-password");
  await page.getByLabel("New password", { exact: true }).fill("fixture-password");
  await page.getByLabel("Confirm new password", { exact: true }).fill("fixture-password");
  await page.getByRole("button", { name: "Change password", exact: true }).click();
  await expect(page.getByText("Check the entered values", { exact: true })).toBeVisible();
  await expect(page.getByLabel("New password", { exact: true })).toBeEnabled();
  expect(writes).toHaveLength(0);
});


// Auth-only password changes verify Main directly; no Research assignment is required.
test("required password change stays bound to the displayed Main account", async ({ page }) => {
  const writes: string[] = [];
  await page.route("**/api/v1/**", async route => {
    const request = route.request(), path = new URL(request.url()).pathname;
    const respond = (body: unknown, status = 200) => route.fulfill({ status, contentType: "application/json",
      headers: { "Access-Control-Allow-Origin": request.headers()["origin"] ?? "http://localhost:3000", "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Headers": "Content-Type,Idempotency-Key,X-KSU-Expected-Actor", "Access-Control-Allow-Methods": "GET,POST,OPTIONS" }, body: JSON.stringify(body) });
    if (request.method() === "OPTIONS") return respond({});
    if (path.endsWith("/auth/me")) return respond({ status: "success", data: { id, email: "original@example.test", full_name: "Original account", must_change_password: true } });
    if (path.endsWith("/auth/change-password")) {
      writes.push(request.headers()["x-ksu-expected-actor"] ?? "");
      return respond({ detail: "The signed-in account changed. Reload this workspace before continuing." }, 409);
    }
    return respond({ detail: "No fixture" }, 404);
  });
  await page.goto("/admin/password-required");
  await expect(page.getByText("Changing the password for original@example.test.")).toBeVisible();
  await page.getByLabel("Current password", { exact: true }).fill("old-fixture-password");
  await page.getByLabel("New password", { exact: true }).fill("new-fixture-password");
  await page.getByLabel("Confirm new password", { exact: true }).fill("new-fixture-password");
  await page.getByRole("button", { name: "Change password", exact: true }).click();
  await expect(page.getByText("The signed-in account changed", { exact: true })).toBeVisible();
  expect(writes).toEqual([id]);
  await expect(page.getByText("Request confirmed", { exact: true })).not.toBeVisible();
});

test("required password change is unavailable before Main verifies a session", async ({ page }) => {
  const writes: string[] = [];
  await page.route("**/api/v1/**", async route => {
    if (route.request().method() === "POST") writes.push(new URL(route.request().url()).pathname);
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ detail: "No active fixture session" }) });
  });
  await page.goto("/admin/password-required");
  await expect(page.getByRole("button", { name: "Change password", exact: true })).toBeDisabled();
  // The transport may attempt session refresh, but must not send a password mutation.
  expect(writes).not.toContain("/api/v1/auth/change-password");
});

// Auth/validation errors on a retry do not settle a previous uncertain write.
for (const status of [401, 403, 412, 422]) test(`network loss then retry ${status} keeps the original form locked`, async ({ page }) => {
  const writes = await fixture(page, { firstWriteStatus: 0, retryWriteStatus: status });
  await page.goto("/admin/projects/new");
  await page.getByLabel(/Title/).fill("Fixture retry study");
  await page.getByRole("button", { name: "Create project", exact: true }).click();
  await page.getByRole("button", { name: "Retry the same command" }).click();
  await expect(page.getByText("Original command still unconfirmed", { exact: true })).toBeVisible();
  await expect(page.getByLabel(/Title/)).toBeDisabled();
  await expect(page.getByRole("button", { name: "Create project", exact: true })).toBeDisabled();
  expect(writes).toHaveLength(2);
  expect(writes[0].key).toBe(writes[1].key);
  await expect(page).toHaveURL(/\/admin\/projects\/new$/);
});
