import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useAuth } from "./use-auth";
import { useAuthStore } from "../store";
import type { User } from "../types";
import {
  fetchCurrentUser,
  loginWithPassword,
  logoutCurrentSession,
} from "../backend";
import { allowSessionRefresh } from "../session";

vi.mock("../backend", () => ({
  fetchCurrentUser: vi.fn(),
  loginWithPassword: vi.fn(),
  logoutCurrentSession: vi.fn().mockResolvedValue(undefined),
  refreshStoredAuthTokens: vi.fn().mockResolvedValue(false),
}));

const user: User = {
  id: "fixture",
  email: "fixture@example.invalid",
  name: "Fixture",
  roles: [],
  permissions: [],
  services: [{ service: "research", roles: [], scopes: [] }],
  serviceMemberships: ["research"],
  mustChangePassword: false,
};

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.getState().reset();
  allowSessionRefresh();
});
afterEach(cleanup);

it("keeps the session available for retry when the backend cannot confirm logout", async () => {
  useAuthStore.getState().setUser(user);
  vi.mocked(logoutCurrentSession).mockRejectedValueOnce(
    new Error("Service unavailable"),
  );
  const hook = renderHook(() => useAuth());
  await act(async () => {
    await expect(hook.result.current.logout()).rejects.toThrow(
      "Service unavailable",
    );
  });
  expect(useAuthStore.getState().user?.id).toBe(user.id);
});

it("does not start verification again when guards react to logout", async () => {
  vi.mocked(fetchCurrentUser).mockResolvedValue(user);
  const hook = renderHook(() => useAuth());
  await act(async () => {
    await hook.result.current.logout();
    await hook.result.current.checkAuth();
  });
  expect(fetchCurrentUser).not.toHaveBeenCalled();
  expect(useAuthStore.getState().user).toBeNull();
});

it("cancels a pending login and ignores its late response after logout", async () => {
  let resolve!: (value: { user: User }) => void;
  vi.mocked(loginWithPassword).mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }),
  );
  const hook = renderHook(() => useAuth());
  await act(async () => {
    const login = hook.result.current.login({
      email: "fixture@example.invalid",
      password: "test-only",
    });
    const result = expect(login).rejects.toThrow("cancelled");
    await hook.result.current.logout();
    expect(vi.mocked(loginWithPassword).mock.calls[0][1]?.aborted).toBe(true);
    resolve({ user });
    await result;
  });
  expect(useAuthStore.getState().user).toBeNull();
});

it("coalesces simultaneous verification across hook consumers", async () => {
  let resolve!: (value: User) => void;
  vi.mocked(fetchCurrentUser).mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }),
  );
  const first = renderHook(() => useAuth());
  const second = renderHook(() => useAuth());
  await act(async () => {
    const pending = [
      first.result.current.checkAuth(),
      second.result.current.checkAuth(),
    ];
    resolve(user);
    await Promise.all(pending);
  });
  expect(fetchCurrentUser).toHaveBeenCalledTimes(1);
});

it("does not restore a user from verification completed after logout", async () => {
  let resolve!: (value: User) => void;
  vi.mocked(fetchCurrentUser).mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }),
  );
  const hook = renderHook(() => useAuth());
  await act(async () => {
    const pending = hook.result.current.checkAuth();
    await hook.result.current.logout();
    resolve(user);
    await pending;
  });
  expect(useAuthStore.getState().user).toBeNull();
  expect(useAuthStore.getState().isAuthenticated).toBe(false);
});

it("retains an existing session and exposes a retryable verification failure", async () => {
  useAuthStore.getState().setUser(user);
  vi.mocked(fetchCurrentUser).mockRejectedValue(
    new Error("Service unavailable"),
  );
  const hook = renderHook(() => useAuth());
  await act(async () => {
    await hook.result.current.checkAuth();
  });
  expect(useAuthStore.getState().user?.id).toBe(user.id);
  expect(useAuthStore.getState().error).toBeTruthy();
});

it("removes a selected service when updated permissions revoke access", () => {
  useAuthStore.getState().setUser(user);
  useAuthStore.getState().setActiveService("research");
  useAuthStore
    .getState()
    .setUser({ ...user, services: [], serviceMemberships: [] });
  expect(useAuthStore.getState().activeService).toBeNull();
});
