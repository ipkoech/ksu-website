"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAuthStore } from "../store";
import { getAccessibleServices, hasServiceAccess, getPrimaryService } from "../permissions";
import type { Service, LoginCredentials } from "../types";

async function tryRefreshToken(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    return response.ok;
  } catch {
    return false;
  }
}

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

  const accessibleServices = user ? getAccessibleServices(user.roles) : [];

  const checkAuth = useCallback(async (_retryWithRefresh = true) => {
    setLoading(true);
    try {
      let response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      // If unauthorized, try to refresh the token
      if (response.status === 401 && _retryWithRefresh) {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
          // Retry the request with new token
          response = await fetch("/api/auth/me", {
            credentials: "include",
          });
        }
      }

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
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
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          // Handle normalized error response
          const errorMessage = data.detail || data.message || "Login failed";
          throw new Error(errorMessage);
        }

        setUser(data.user);

        const services = getAccessibleServices(data.user.roles);
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

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Already logged out locally, ignore API errors
    }
  }, [logoutStore]);

  const switchService = useCallback(
    (service: Service) => {
      if (user && hasServiceAccess(user.roles, service)) {
        setActiveService(service);
      }
    },
    [user, setActiveService]
  );

  const hasScope = useCallback(
    (scope: string): boolean => {
      if (!user || !activeService) return false;
      const serviceAccess = user.services.find((s) => s.service === activeService);
      if (!serviceAccess) return false;
      return (
        serviceAccess.scopes.includes("*") ||
        serviceAccess.scopes.includes(scope) ||
        serviceAccess.scopes.some((s) => {
          const [resource] = s.split(".");
          return s === `${resource}.*` && scope.startsWith(`${resource}.`);
        })
      );
    },
    [user, activeService]
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
