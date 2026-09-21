import { expect, it, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { bindAuthCache } from "./use-auth-cache-isolation";
import { useAuthStore } from "../store";
import type { User } from "../types";

it("cancels actual React Query work and prevents a late account-A result restoring data after account B signs in", async () => {
  useAuthStore.getState().reset();
  const makeUser = (id: string): User => ({
    id,
    email: `${id}@example.invalid`,
    name: id,
    roles: [],
    permissions: [],
    services: [],
    serviceMemberships: [],
    mustChangePassword: false,
  });
  useAuthStore.getState().setUser(makeUser("account-a"));
  const cache = new QueryClient();
  const stop = bindAuthCache(cache);
  let resolve!: (value: string) => void;
  let signal!: AbortSignal;
  try {
    cache.setQueryData(["private"], "account-a");
    const pending = cache.fetchQuery({
      queryKey: ["slow-private"],
      queryFn: (context) => {
        signal = context.signal;
        return new Promise<string>((done) => {
          resolve = done;
        });
      },
    });
    const result = pending.catch(() => "cancelled");
    useAuthStore.getState().setUser(makeUser("account-b"));
    expect(signal.aborted).toBe(true);
    expect(cache.getQueryData(["private"])).toBeUndefined();
    cache.setQueryData(["private"], "account-b");
    resolve("late-account-a");
    await result;
    expect(cache.getQueryData(["slow-private"])).toBeUndefined();
    expect(cache.getQueryData(["private"])).toBe("account-b");
  } finally {
    stop();
    cache.clear();
  }
});

it("clears cached data for account, permission, service changes and logout, but not loading or equivalent profiles", () => {
  useAuthStore.getState().reset();
  const cache = {
    cancelQueries: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn(),
  };
  const stop = bindAuthCache(cache);
  const user: User = {
    id: "fixture",
    email: "fixture@example.invalid",
    name: "Fixture",
    roles: [],
    permissions: ["research:read"],
    services: [{ service: "research", roles: [], scopes: ["research.view"] }],
    serviceMemberships: ["research"],
    mustChangePassword: false,
  };
  try {
    useAuthStore.getState().setUser(user);
    expect(cache.clear).toHaveBeenCalledTimes(1);
    useAuthStore.getState().setLoading(true);
    useAuthStore.getState().setUser({ ...user, name: "Updated display name" });
    expect(cache.clear).toHaveBeenCalledTimes(1);
    useAuthStore.getState().setActiveService("research");
    expect(cache.clear).toHaveBeenCalledTimes(2);
    useAuthStore.getState().setUser({ ...user, permissions: [] });
    expect(cache.clear).toHaveBeenCalledTimes(3);
    useAuthStore.getState().setUser({ ...user, id: "another-fixture" });
    expect(cache.clear).toHaveBeenCalledTimes(4);
    useAuthStore.getState().logout();
    expect(cache.clear).toHaveBeenCalledTimes(5);
    expect(cache.cancelQueries).toHaveBeenCalledTimes(5);
  } finally {
    stop();
  }
});
