"use client";

import { useEffect } from "react";
import { useAuthStore } from "../store";
import type { AuthState } from "../types";

export interface AuthCache {
  cancelQueries: () => Promise<unknown>;
  clear: () => void;
}

function contextKey(state: AuthState) {
  const user = state.user;
  return JSON.stringify([
    user?.id,
    state.activeService,
    user?.mustChangePassword,
    [...(user?.roles ?? [])].sort(),
    [...(user?.permissions ?? [])].sort(),
    [...(user?.serviceMemberships ?? [])].sort(),
    user?.services
      .map((access) => [
        access.service,
        [...access.roles].sort(),
        [...access.scopes].sort(),
      ])
      .sort(),
  ]);
}

export function bindAuthCache(cache: AuthCache) {
  return useAuthStore.subscribe((state, previous) => {
    if (contextKey(state) === contextKey(previous)) return;
    // Cancellation starts synchronously before dropping the old account's data.
    void cache.cancelQueries().catch(() => undefined);
    cache.clear();
  });
}

export function useAuthCacheIsolation(cache: AuthCache) {
  useEffect(() => bindAuthCache(cache), [cache]);
}
