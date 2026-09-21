import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AuthGuard } from "./auth-guard";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  checkAuth: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("../hooks/use-auth", () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: "Unavailable",
    checkAuth: mocks.checkAuth,
  }),
}));
afterEach(cleanup);

it("offers retry instead of redirecting a verification outage to login", () => {
  render(
    <AuthGuard>
      <div>Private content</div>
    </AuthGuard>,
  );
  expect(mocks.push).not.toHaveBeenCalled();
  expect(screen.queryByText("Private content")).toBeNull();
  expect(screen.getByRole("alert").textContent).toContain("Unable to verify");
  mocks.checkAuth.mockClear();
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(mocks.checkAuth).toHaveBeenCalledTimes(1);
});
