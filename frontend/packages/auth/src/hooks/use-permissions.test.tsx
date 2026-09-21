import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it } from "vitest";
import { useAuthStore } from "../store";
import type { User } from "../types";
import { usePermissions } from "./use-permissions";

const user: User = {
  id: "fixture",
  email: "fixture@example.invalid",
  name: "Fixture",
  roles: [],
  permissions: ["research.manage_projects", "library.manage_resources"],
  services: [
    { service: "research", roles: [], scopes: ["research.manage_projects"] },
    { service: "library", roles: [], scopes: ["library.manage_resources"] },
  ],
  serviceMemberships: ["research", "library"],
  mustChangePassword: false,
};

beforeEach(() => useAuthStore.getState().reset());
afterEach(cleanup);

it("does not use another service's permissions after a service is selected", () => {
  useAuthStore.getState().setUser(user);
  useAuthStore.getState().setActiveService("research");

  const { result } = renderHook(() => usePermissions());

  expect(result.current.hasScope("research.manage_projects")).toBe(true);
  expect(result.current.hasScope("library.manage_resources")).toBe(false);
});

it("uses account permissions while no service context is selected", () => {
  useAuthStore.getState().setUser(user);

  const { result } = renderHook(() => usePermissions());

  expect(result.current.hasScope("research.manage_projects")).toBe(true);
  expect(result.current.hasScope("library.manage_resources")).toBe(true);
});
