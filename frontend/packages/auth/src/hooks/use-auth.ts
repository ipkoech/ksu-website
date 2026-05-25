"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAuthStore } from "../store";
import type { Service, LoginCredentials } from "../types";
import {
  fetchCurrentUser,
  loginWithPassword,
  logoutCurrentSession,
  refreshStoredAuthTokens,
} from "../backend";

export function useAuth() {
  const {
    user,
    isLoading,
    isAuthenticated,
    activeService,
    error,
    setUser,
    setActiveService,
    setLoading,
    setError,
    logout: logoutStore,
  } = useAuthStore();

  const accessibleServices = user ? user.services.map((service) => service.service) : [];

  const checkAuth = useCallback(async (_retryWithRefresh = true) => {
    setLoading(true);
    try {
      let user = await fetchCurrentUser();

      if (!user && _retryWithRefresh) {
        const refreshed = await refreshStoredAuthTokens();
        if (refreshed) {
          user = await fetchCurrentUser();
        }
      }

      setUser(user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setUser]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setLoading(true);
      setError(null);

      try {
        const data = await loginWithPassword(credentials);
        setUser(data.user);

        const services = data.user.services.map((service) => service.service);
        if (services.length === 1) {
          setActiveService(services[0]);
        }

        return { user: data.user, services };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Login failed";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setUser, setActiveService]
  );

  const logout = useCallback(async () => {
    // Clear user state immediately - no token refresh attempts after this
    logoutStore();
    await logoutCurrentSession();
  }, [logoutStore]);

  const switchService = useCallback(
    (service: Service) => {
      if (user?.services.some((access) => access.service === service)) {
        setActiveService(service);
      }
    },
    [user, setActiveService]
  );

  const scopeCandidates = useCallback((scope: string) => {
    const normalized = scope.trim().toLowerCase();
    const candidates = new Set([normalized]);

    if (normalized.includes(":")) {
      const [resource, action = ""] = normalized.split(":");
      candidates.add(`${resource}.${action}`);
      if (action === "read") candidates.add(`${resource}.view`);
      if (["write", "create", "update", "edit", "manage"].includes(action)) {
        candidates.add(`${resource}.manage`);
      }
    }

    if (normalized.includes(".")) {
      const [resource, action = ""] = normalized.split(".");
      candidates.add(`${resource}:${action}`);
      if (action === "view") candidates.add(`${resource}:read`);
      if (action.startsWith("manage")) candidates.add(`${resource}:write`);
    }

    return Array.from(candidates);
  }, []);

  const hasScope = useCallback(
    (scope: string): boolean => {
      if (!user || !activeService) return false;
      const serviceAccess = user.services.find((s) => s.service === activeService);
      if (!serviceAccess) return false;
      const candidates = scopeCandidates(scope);
      return (
        serviceAccess.scopes.includes("*") ||
        serviceAccess.scopes.some((serviceScope) => candidates.includes(serviceScope)) ||
        serviceAccess.scopes.some((s) => {
          const separator = s.includes(":") ? ":" : ".";
          const [resource, action] = s.split(separator);
          return (
            action === "*" &&
            candidates.some((candidate) => candidate.startsWith(`${resource}.`) || candidate.startsWith(`${resource}:`))
          );
        })
      );
    },
    [user, activeService, scopeCandidates]
  );

  const hasAnyScope = useCallback(
    (scopes: string[]): boolean => {
      return scopes.some((scope) => hasScope(scope));
    },
    [hasScope]
  );

  const hasAllScopes = useCallback(
    (scopes: string[]): boolean => {
      return scopes.every((scope) => hasScope(scope));
    },
    [hasScope]
  );

  return {
    user,
    isLoading,
    isAuthenticated,
    activeService,
    accessibleServices,
    error,
    checkAuth,
    login,
    logout,
    switchService,
    hasScope,
    hasAnyScope,
    hasAllScopes,
  };
}
