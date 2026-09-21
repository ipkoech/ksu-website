import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import { MfaSettings } from "./mfa-settings";

const api = vi.hoisted(() => ({ mfaStatus: vi.fn(), enrollMfa: vi.fn(), replaceMfa: vi.fn(), confirmMfa: vi.fn(), stepUpMfa: vi.fn() }));
vi.mock("@ksu/api-client", () => ({ authApi: api }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });

it("uses an existing proof to begin replacement, then confirms the new authenticator", async () => {
  api.mfaStatus.mockResolvedValue({ data: { enabled: true, recovery_codes_remaining: 9 } });
  api.replaceMfa.mockResolvedValue({ data: { secret: "REPLACEMENTKEY" } });
  api.confirmMfa.mockResolvedValue({ data: { recovery_codes: ["replacement-recovery-code"] } });
  const user = userEvent.setup();
  render(<MfaSettings />);
  await user.type(await screen.findByLabelText("Current password"), "Password123");
  await user.type(screen.getByLabelText("Authenticator or recovery code"), "existing-recovery-code");
  await user.click(screen.getByRole("button", { name: "Replace authenticator" }));
  expect(await screen.findByText("REPLACEMENTKEY")).toBeVisible();
  expect(api.replaceMfa).toHaveBeenCalledWith("Password123", "existing-recovery-code", expect.objectContaining({ signal: expect.any(AbortSignal) }));
  expect(api.stepUpMfa).not.toHaveBeenCalled();
  await user.type(screen.getByLabelText("Authenticator code"), "654321");
  await user.click(screen.getByRole("button", { name: "Confirm authenticator" }));
  expect(await screen.findByText("replacement-recovery-code")).toBeVisible();
  expect(api.confirmMfa).toHaveBeenCalledWith("654321", expect.objectContaining({ signal: expect.any(AbortSignal) }));
});

it("enrolls, clears the setup secret and dismisses recovery codes", async () => {
  api.mfaStatus.mockResolvedValue({ data: { enabled: false, recovery_codes_remaining: 0 } });
  api.enrollMfa.mockResolvedValue({ data: { secret: "TESTSETUPKEY" } });
  api.confirmMfa.mockResolvedValue({ data: { recovery_codes: ["one-use-code"] } });
  const user = userEvent.setup();
  render(<MfaSettings />);
  await user.type(await screen.findByLabelText("Current password"), "Password123");
  await user.click(screen.getByRole("button", { name: "Set up authenticator" }));
  expect(await screen.findByText("TESTSETUPKEY")).toBeVisible();
  expect(api.enrollMfa).toHaveBeenCalledWith("Password123", expect.objectContaining({ signal: expect.any(AbortSignal) }));
  await user.type(screen.getByLabelText("Authenticator code"), "123456");
  await user.click(screen.getByRole("button", { name: "Confirm authenticator" }));
  expect(await screen.findByText("one-use-code")).toBeVisible();
  expect(screen.queryByText("TESTSETUPKEY")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "I have saved my recovery codes" }));
  expect(screen.queryByText("one-use-code")).not.toBeInTheDocument();
  expect(screen.getByLabelText("Current password")).toHaveValue("");
});

it("steps up an enrolled session and clears both proof fields", async () => {
  api.mfaStatus.mockResolvedValue({ data: { enabled: true, recovery_codes_remaining: 9 } });
  api.stepUpMfa.mockResolvedValue({ data: { verified_at: "2026-09-07T00:00:00Z" } });
  const user = userEvent.setup();
  render(<MfaSettings />);
  await user.type(await screen.findByLabelText("Current password"), "Password123");
  await user.type(screen.getByLabelText("Authenticator or recovery code"), "123456");
  await user.click(screen.getByRole("button", { name: "Verify identity" }));
  expect(await screen.findByRole("status")).toHaveTextContent("Identity verified");
  expect(api.stepUpMfa).toHaveBeenCalledWith("Password123", "123456", expect.objectContaining({ signal: expect.any(AbortSignal) }));
  expect(screen.getByLabelText("Current password")).toHaveValue("");
  expect(screen.getByLabelText("Authenticator or recovery code")).toHaveValue("");
});

it("aborts the security request when the profile route unmounts", async () => {
  let requestSignal: AbortSignal | undefined;
  api.mfaStatus.mockImplementationOnce((options) => {
    requestSignal = options?.signal;
    return new Promise<void>((resolve) => options?.signal?.addEventListener("abort", () => resolve(), { once: true }));
  });
  const view = render(<MfaSettings />);

  await waitFor(() => expect(requestSignal).toBeDefined());
  view.unmount();

  expect(requestSignal?.aborted).toBe(true);
});
