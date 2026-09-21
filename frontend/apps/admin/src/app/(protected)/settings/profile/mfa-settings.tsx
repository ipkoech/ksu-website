"use client";

import { useEffect, useRef, useState } from "react";
import { authApi } from "@ksu/api-client";
import { Button, Input, Label, PasswordInput } from "@ksu/ui/components";

export function MfaSettings() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [secret, setSecret] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const requestAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    requestAbortRef.current = controller;
    authApi.mfaStatus({ signal: controller.signal }).then(({ data }) => {
      if (!controller.signal.aborted) {
        setEnabled(data.enabled);
        setRemaining(data.recovery_codes_remaining);
      }
    }).catch(() => { if (!controller.signal.aborted) setError("Could not load account security. Reload the page to try again."); });
    return () => {
      controller.abort();
      requestAbortRef.current?.abort();
      if (requestAbortRef.current === controller) requestAbortRef.current = null;
    };
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const replace = submitter instanceof HTMLButtonElement && submitter.value === "replace";
    setBusy(true);
    setError(null);
    setMessage(null);
    requestAbortRef.current?.abort();
    const controller = new AbortController();
    requestAbortRef.current = controller;
    const options = { signal: controller.signal };
    try {
      if (enabled && !secret && !replace) {
        await authApi.stepUpMfa(password, code.trim(), options);
        if (controller.signal.aborted) return;
        setPassword("");
        setCode("");
        setMessage("Identity verified. You can return to your task. Verification lasts 15 minutes.");
        const { data } = await authApi.mfaStatus(options);
        if (controller.signal.aborted) return;
        setRemaining(data.recovery_codes_remaining);
      } else if (secret) {
        const { data } = await authApi.confirmMfa(code.trim(), options);
        if (controller.signal.aborted) return;
        setRecoveryCodes(data.recovery_codes);
        setRemaining(data.recovery_codes.length);
        setSecret(null);
        setCode("");
        setEnabled(true);
        setMessage("Authenticator enabled. Your other sessions have been signed out.");
      } else {
        const { data } = replace
          ? await authApi.replaceMfa(password, code.trim(), options)
          : await authApi.enrollMfa(password, options);
        if (controller.signal.aborted) return;
        setSecret(data.secret);
        setPassword("");
        setCode("");
      }
    } catch (failure) {
      if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : "Verification failed. Try again.");
    } finally {
      if (requestAbortRef.current === controller) {
        requestAbortRef.current = null;
        setBusy(false);
      }
    }
  }

  return (
    <section aria-labelledby="mfa-heading" className="space-y-4 rounded-lg border p-6">
      <h2 id="mfa-heading" className="text-xl font-semibold">Account security</h2>
      <p>Use an authenticator to protect your account and verify sensitive actions.</p>
      {error && <p role="alert" className="text-destructive">{error}</p>}
      {message && <p role="status">{message}</p>}
      {enabled === null ? <p>Loading security settings…</p> : (
        <>
          <p>{enabled ? "Authenticator enabled" : "Authenticator not enabled"}</p>
          {enabled && remaining !== null && <p>{remaining} recovery codes remaining.</p>}
          {recoveryCodes.length > 0 ? (
            <div className="space-y-3">
              <p>Save these recovery codes somewhere safe. Each code works once, and this list cannot be shown again.</p>
              <pre className="overflow-x-auto rounded border p-3">{recoveryCodes.join("\n")}</pre>
              <Button onClick={() => setRecoveryCodes([])}>I have saved my recovery codes</Button>
            </div>
          ) : (
            <form onSubmit={submit} className="max-w-lg space-y-4">
              {secret && (
                <div className="space-y-2">
                  <p>Add an account named KSU in your authenticator, choose a time-based code, and enter this setup key. Complete setup within ten minutes.</p>
                  {enabled && <p>Your current authenticator remains active until you confirm the new one. Confirmation replaces your recovery codes and signs out other sessions.</p>}
                  <code className="block break-all rounded border p-3">{secret}</code>
                </div>
              )}
              {!secret && <div className="space-y-2">
                <Label htmlFor="mfa-password">Current password</Label>
                <PasswordInput id="mfa-password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} maxLength={255} />
              </div>}
              {(enabled || secret) && <div className="space-y-2">
                <Label htmlFor="mfa-proof">{secret ? "Authenticator code" : "Authenticator or recovery code"}</Label>
                <Input id="mfa-proof" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value)} required minLength={6} maxLength={64} />
              </div>}
              <Button type="submit" loading={busy}>{secret ? "Confirm authenticator" : enabled ? "Verify identity" : "Set up authenticator"}</Button>
              {enabled && !secret && <Button type="submit" value="replace" variant="outline" disabled={busy}>Replace authenticator</Button>}
              {secret && <Button type="button" variant="outline" disabled={busy} onClick={() => { setSecret(null); setCode(""); }}>Restart setup</Button>}
            </form>
          )}
        </>
      )}
    </section>
  );
}
