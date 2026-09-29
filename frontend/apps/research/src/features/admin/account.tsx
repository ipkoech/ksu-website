"use client";
import { useCallback, useState } from "react";
import { Button } from "@ksu/ui/button";
import { WorkspaceFeedback, WorkspaceLoading } from "@ksu/ui/components/workspace-feedback";
import { researchWorkspaceSupportApi } from "@ksu/api-client/research";
import { MfaEnrollment } from "./mfa-enrollment";
import { Problem, signInUrl } from "./problem";
import { useUnsavedGuard, useWorkspaceCommand, useWorkspaceRead } from "./use-workspace";

export function WorkspaceAccount() {
  const load = useCallback((signal: AbortSignal) => researchWorkspaceSupportApi.me(signal), []);
  const { state, reload } = useWorkspaceRead(load);
  const logout = useWorkspaceCommand();
  useUnsavedGuard(logout.locked);
  return <div className="rw-stack"><div className="rw-page-heading"><div><p className="rw-eyebrow">MY ACCOUNT</p><h1>Account and security</h1><p>Identity and authentication remain owned by the Main service. Credentials are not stored in browser storage.</p></div></div>
    {state.status === "loading" ? <WorkspaceLoading label="Loading your identity…" /> : state.status === "error" ? <Problem problem={state.error} onRetry={reload} /> :
      <section className="rw-panel rw-inset"><h2>{state.data.name}</h2><p>{state.data.email}</p><p className="rw-help">Account ID: {state.data.id}</p>
        {state.data.must_change_password && <WorkspaceFeedback title="A password change is required">Use the password form below. The backend may restrict other actions until the change is complete.</WorkspaceFeedback>}</section>}
    <div className="rw-detail-grid"><MfaVerification /><ChangePassword onConfirmed={reload} /></div>
    <section className="rw-panel rw-inset"><h2>End this session</h2><p>Sign-out invalidates the current session through the existing authentication endpoint. Finish or reconcile outstanding commands first.</p>
      {logout.error && <Problem problem={logout.error} onRetry={logout.retry} command researchRecovery={false} />}
      <Button type="button" variant="outline" disabled={logout.locked} loading={logout.pending} onClick={() => {
        if (window.confirm("Sign out of this KSU session?")) logout.execute(key => researchWorkspaceSupportApi.logout(key), () => window.location.assign("/"));
      }}>Sign out</Button></section>
  </div>;
}
function MfaVerification() {
  const load = useCallback((signal: AbortSignal) => researchWorkspaceSupportApi.mfa(signal), []);
  const { state, reload } = useWorkspaceRead(load), command = useWorkspaceCommand();
  const [password, setPassword] = useState(""), [code, setCode] = useState(""), [confirmed, setConfirmed] = useState("");
  useUnsavedGuard(command.locked || Boolean(password || code));
  return <section className="rw-panel rw-inset"><p className="rw-eyebrow">SENSITIVE ACTIONS</p><h2>Verify your MFA session</h2>
    <p>Publication actions may require recent multi-factor verification. Verification does not add permissions or broaden your assigned scope.</p>
    {state.status === "loading" ? <WorkspaceLoading label="Checking MFA status…" /> : state.status === "error" ? <Problem problem={state.error} onRetry={reload} /> : <>
      <p><strong>{state.data.enabled ? "MFA is enrolled" : "MFA is not enrolled"}</strong></p>
      {state.data.verified_at && <p className="rw-help">Last verified: {new Date(state.data.verified_at).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })} EAT</p>}
      <p className="rw-help">Recovery codes remaining: {state.data.recovery_codes_remaining}</p>
      {!state.data.enabled ? <p>Set up an authenticator below, then confirm its generated code.</p> :
        <form className="rw-stack" onSubmit={event => { event.preventDefault(); if (!command.locked) command.execute(key => researchWorkspaceSupportApi.stepUp(password, code, key), time => { setPassword(""); setCode(""); setConfirmed(time); reload(); }); }}>
          <label htmlFor="rw-mfa-password">Current password<input id="rw-mfa-password" name="password" type="password" autoComplete="current-password" required value={password} disabled={command.locked} onChange={event => { command.reset(); setPassword(event.target.value); }} /></label>
          <label htmlFor="rw-mfa-code">Authenticator or recovery code<input id="rw-mfa-code" name="mfa_code" autoComplete="one-time-code" required value={code} disabled={command.locked} onChange={event => { command.reset(); setCode(event.target.value); }} /></label>
          {command.error && <Problem problem={command.error} onRetry={command.retry} command researchRecovery={false} />}
          <Button type="submit" loading={command.pending} disabled={command.locked}>Verify session</Button>
        </form>}
      <MfaEnrollment enabled={state.data.enabled} onConfirmed={reload} />
    </>}
    {confirmed && <WorkspaceFeedback title="Session verification confirmed" tone="success">Return to the original form and explicitly retry its command. Nothing was published automatically.</WorkspaceFeedback>}
    <Button type="button" variant="ghost" disabled={command.locked} onClick={reload}>Recheck MFA status</Button>
  </section>;
}
function ChangePassword({ onConfirmed }: { onConfirmed: () => void }) {
  const command = useWorkspaceCommand(), [current, setCurrent] = useState(""), [next, setNext] = useState(""), [repeat, setRepeat] = useState("");
  const [error, setError] = useState(""), [saved, setSaved] = useState(false);
  const login = signInUrl();
  useUnsavedGuard(command.locked || Boolean(current || next || repeat));
  function clearFeedback() { command.reset(); setError(""); setSaved(false); }
  return <section className="rw-panel rw-inset"><p className="rw-eyebrow">PASSWORD</p><h2>Change your password</h2><p>The Main service enforces password requirements. A rejected change is never shown as saved.</p>
    <form className="rw-stack" onSubmit={event => {
      event.preventDefault(); if (command.locked) return;
      if (!current || !next || next !== repeat) { setError("Enter your current password and matching new passwords."); return; }
      if (current === next) { setError("Choose a different new password."); return; }
      const oldPassword = current, newPassword = next;
      command.execute(key => researchWorkspaceSupportApi.changePassword(oldPassword, newPassword, key), () => { setCurrent(""); setNext(""); setRepeat(""); setSaved(true); onConfirmed(); });
    }}>
      <label htmlFor="rw-current-password">Current password<input id="rw-current-password" type="password" autoComplete="current-password" required value={current} disabled={command.locked} onChange={event => { clearFeedback(); setCurrent(event.target.value); }} /></label>
      <label htmlFor="rw-new-password">New password<input id="rw-new-password" type="password" autoComplete="new-password" required value={next} disabled={command.locked} onChange={event => { clearFeedback(); setNext(event.target.value); }} /></label>
      <label htmlFor="rw-repeat-password">Confirm new password<input id="rw-repeat-password" type="password" autoComplete="new-password" required value={repeat} disabled={command.locked} onChange={event => { clearFeedback(); setRepeat(event.target.value); }} /></label>
      {error && <p role="alert" className="rw-field-error">{error}</p>}
      {command.error && <Problem problem={command.error} onRetry={command.retry} command researchRecovery={false} />}
      {saved && <WorkspaceFeedback title="Password changed" tone="success">The authentication service confirmed your change and cleared this session. Sign in again before continuing.
        {login && <p><a className="rw-text-link" href={login} target="_blank" rel="noopener noreferrer">Open KSU sign-in in a new tab</a></p>}
      </WorkspaceFeedback>}
      <Button type="submit" disabled={command.locked || saved} loading={command.pending}>Change password</Button>
    </form>
  </section>;
}
