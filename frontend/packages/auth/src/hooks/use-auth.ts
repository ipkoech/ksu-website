"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAuthStore } from "../store";
import type { Service, LoginCredentials } from "../types";
import {
  loginWithPassword,
  logoutCurrentSession,
} from "../backend";
import { allowSessionRefresh, beginSessionAction, checkSession, invalidateSession, isCurrentSession } from "../session";

export function useAuth() {
  const sessionExpiredHandledRef = useRef(false);
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

  const checkAuth = useCallback((retryWithRefresh = true) => checkSession(retryWithRefresh), []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const { version, signal } = beginSessionAction();
      setUser(null);
      setLoading(true);
      setError(null);

      try {
        sessionExpiredHandledRef.current = false;
        const data = await loginWithPassword(credentials, signal);
        if (!isCurrentSession(version)) throw new Error("Sign-in was cancelled");
        allowSessionRefresh();
        setUser(data.user);

        const services = data.user.services.map((service) => service.service);
        if (services.length === 1) {
          setActiveService(services[0]);
        }

        return { user: data.user, services };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Login failed";
        if (isCurrentSession(version)) setError(message);
        throw err;
      } finally {
        if (isCurrentSession(version)) setLoading(false);
      }
    },
    [setLoading, setError, setUser, setActiveService]
  );

  const logout = useCallback(async () => {
    // Stop competing auth requests, then clear the session after confirmation.
    // A failed logout stays visible in the caller's confirmation dialog.
    sessionExpiredHandledRef.current = true;
    const { version, signal } = beginSessionAction();
    try {
      await logoutCurrentSession(signal);
      if (isCurrentSession(version)) logoutStore();
    } catch (error) {
      if (isCurrentSession(version)) {
        sessionExpiredHandledRef.current = false;
        allowSessionRefresh();
      }
      throw error;
    }
  }, [logoutStore]);

  useEffect(() => {
    if (user) sessionExpiredHandledRef.current = false;
  }, [user]);

  useEffect(() => {
    function handleSessionExpired() {
      if (sessionExpiredHandledRef.current) return;
      sessionExpiredHandledRef.current = true;
      invalidateSession();
      logoutStore();
    }
    window.addEventListener("ksu:session-expired", handleSessionExpired);
    return () => window.removeEventListener("ksu:session-expired", handleSessionExpired);
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
