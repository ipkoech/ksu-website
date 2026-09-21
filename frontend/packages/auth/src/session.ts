"use client";

import { setSessionRefreshEnabled } from "@ksu/api-client/browser";
import { fetchCurrentUser, refreshStoredAuthTokens } from "./backend";
import { useAuthStore } from "./store";

let generation = 0;
let verificationEnabled = true;
let pending: { controller: AbortController; task: Promise<void> } | null = null;
let actionController: AbortController | null = null;

function releasePending(controller: AbortController) {
  if (pending?.controller === controller) pending = null;
}

export function invalidateSession() {
  generation++;
  verificationEnabled = false;
  pending?.controller.abort();
  actionController?.abort();
  actionController = null;
  pending = null;
  setSessionRefreshEnabled(false);
  return generation;
}

export function beginSessionAction() {
  const version = invalidateSession();
  actionController = new AbortController();
  return { version, signal: actionController.signal };
}

export function isCurrentSession(version: number) {
  return version === generation;
}

export function allowSessionRefresh() {
  verificationEnabled = true;
  setSessionRefreshEnabled(true);
}

export function checkSession(retryWithRefresh = true): Promise<void> {
  if (typeof window === "undefined" || !verificationEnabled) return Promise.resolve();
  if (pending) return pending.task;
  const version = generation;
  const controller = new AbortController();
  useAuthStore.getState().setLoading(true);
  const task = (async () => {
    try {
      let user = await fetchCurrentUser(controller.signal);
      if (!isCurrentSession(version)) return;
      if (!user && retryWithRefresh && (await refreshStoredAuthTokens())) {
        if (!isCurrentSession(version)) return;
        user = await fetchCurrentUser(controller.signal);
      }
      if (isCurrentSession(version)) useAuthStore.getState().setUser(user);
    } catch {
      if (isCurrentSession(version))
        useAuthStore
          .getState()
          .setError("Unable to verify your session. Please try again.");
    } finally {
      if (isCurrentSession(version)) useAuthStore.getState().setLoading(false);
      releasePending(controller);
    }
  })();
  pending = { controller, task };
  return task;
}
