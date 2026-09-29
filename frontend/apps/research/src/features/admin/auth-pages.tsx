"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { Button } from "@ksu/ui/button";
import { WorkspaceFeedback, WorkspaceLoading } from "@ksu/ui/components/workspace-feedback";
import { researchAuthApi, researchWorkspaceSupportApi, safeRWReturnTo } from "@ksu/api-client/research";
import { Problem } from "./problem";
import { useUnsavedGuard, useWorkspaceCommand, useWorkspaceRead } from "./use-workspace";
export type AuthScreen = "login" | "forgot" | "reset" | "required";
export function ResearchAuthPage({ screen }: { screen: AuthScreen }) { return <Suspense fallback={<WorkspaceLoading label="Loading authentication form…" />}><AuthForm key={screen} screen={screen} /></Suspense>; }
function AuthForm({ screen }: { screen: AuthScreen }) {
  const params = useSearchParams(), command = useWorkspaceCommand();
  const [email, setEmail] = useState(""), [password, setPassword] = useState(""), [code, setCode] = useState(""), [current, setCurrent] = useState(""), [repeat, setRepeat] = useState(""), [notice, setNotice] = useState(""), [validation, setValidation] = useState("");
  const [token] = useState(() => screen === "reset" ? params.get("token") ?? "" : "");
  const next = safeRWReturnTo(params.get("next"));
  const loadAccount = useCallback((signal: AbortSignal) => screen === "required"
    ? researchWorkspaceSupportApi.me(signal, null) : Promise.resolve(null), [screen]);
  const { state: accountState, reload: reloadAccount } = useWorkspaceRead(loadAccount);
  const requiredAccount = accountState.status === "ready" ? accountState.data : null;
  useEffect(() => { if (screen === "reset" && token) window.history.replaceState(null, "", "/admin/reset-password"); }, [screen, token]);
  const dismissUnsaved = useUnsavedGuard(command.locked || Boolean(password || current));
  const title = { login: "Welcome back", forgot: "Reset your password", reset: "Choose a new password", required: "Update your password" }[screen];
  const description = { login: "Sign in with your KSU account to access your assigned research workspace.", forgot: "Enter your account email. The response is the same whether or not an account exists.", reset: "Use your password-reset link to finish changing your password. Your reset token stays in this open page only.", required: "Your account requires a password change before you continue. The service will end this session after the change." }[screen];
  function clear() { command.reset(); setValidation(""); }
  function submit() {
    if (command.locked || notice) return;
    setValidation("");
    if (["reset", "required"].includes(screen) && password !== repeat) { setValidation("The new passwords do not match."); return; }
    if (screen === "reset" && !token) { setValidation("Open the complete password-reset link from your email. This page has no reset token."); return; }
    if (screen === "login") command.execute(key => researchAuthApi.login(email.trim(), password, code.trim(), key), account => { dismissUnsaved(); setPassword(""); setCode(""); window.location.assign(account.must_change_password ? "/admin/password-required" : next); });
    else if (screen === "forgot") command.execute(key => researchAuthApi.forgot(email.trim(), key), () => setNotice("If that email is registered, a password-reset message has been queued. Check your email and junk folder."));
    else if (screen === "reset") command.execute(key => researchAuthApi.reset(token, password, key), () => { setPassword(""); setRepeat(""); setNotice("The service confirmed your new password. Sign in to continue."); });
    else {
      if (!requiredAccount) { setValidation("Verify your signed-in account before changing its password."); return; }
      const accountId = requiredAccount.id;
      command.execute(key => researchWorkspaceSupportApi.changePassword(current, password, key, accountId), () => { setPassword(""); setRepeat(""); setCurrent(""); setNotice("Your password was changed and this session was cleared. Sign in with your new password."); });
    }
  }
  return <div className="rw-auth-grid"><section className="rw-auth-intro"><Link className="rw-brand" href="/"><span className="rw-brand-mark">KSU</span><span><strong>Research office</strong><small>KISII UNIVERSITY</small></span></Link><p className="rw-eyebrow">RESEARCH ADMINISTRATION</p><h1>Ideas to impact.<br />One connected workspace.</h1><p>Manage research, funding, publications and partnerships with the access assigned to your account.</p><p className="rw-help">Your role determines the records and actions available. Signing in does not grant additional permissions.</p></section><section className="rw-auth-card" aria-labelledby="rw-auth-title"><p className="rw-eyebrow">SECURE ACCOUNT ACCESS</p><h2 id="rw-auth-title">{title}</h2><p>{description}</p>
    {screen === "required" && (accountState.status === "loading" ? <WorkspaceLoading label="Verifying the account for this password change…" /> : accountState.status === "error" ? <Problem problem={accountState.error} onRetry={reloadAccount} /> : requiredAccount ? <p className="rw-help">Changing the password for {requiredAccount.email}.</p> : null)}
    {notice ? <WorkspaceFeedback title="Request confirmed" tone="success">{notice}<p><Link className="rw-text-link" href="/admin/login">Continue to sign-in</Link></p></WorkspaceFeedback> : <form className="rw-stack" onSubmit={event => { event.preventDefault(); submit(); }}>
      {["login", "forgot"].includes(screen) && <label>Email address<input name="email" type="email" autoComplete="username" maxLength={320} required value={email} disabled={command.locked} onChange={event => { clear(); setEmail(event.target.value); }} /></label>}
      {screen === "required" && <label>Current password<input name="current_password" type="password" autoComplete="current-password" maxLength={255} required value={current} disabled={command.locked} onChange={event => { clear(); setCurrent(event.target.value); }} /></label>}
      {screen !== "forgot" && <label>{screen === "login" ? "Password" : "New password"}<input name="password" type="password" autoComplete={screen === "login" ? "current-password" : "new-password"} minLength={screen === "login" ? 1 : 8} maxLength={255} required value={password} disabled={command.locked} onChange={event => { clear(); setPassword(event.target.value); }} /></label>}
      {["reset", "required"].includes(screen) && <label>Confirm new password<input type="password" autoComplete="new-password" minLength={8} maxLength={255} required value={repeat} disabled={command.locked} onChange={event => { clear(); setRepeat(event.target.value); }} /></label>}
      {screen === "login" && <label>Authenticator or recovery code <span className="rw-help">Required when MFA is enrolled</span><input name="mfa_code" autoComplete="one-time-code" maxLength={64} value={code} disabled={command.locked} onChange={event => { clear(); setCode(event.target.value); }} /></label>}
      {validation && <p role="alert" className="rw-field-error">{validation}</p>}
      {command.error && <Problem problem={command.error} onRetry={command.retry} command researchRecovery={false} />}
      {screen === "login" && command.error?.kind === "session" && <p className="rw-help">Check the email, password and MFA code. No authentication is assumed from this response.</p>}
      <Button type="submit" loading={command.pending} disabled={command.locked || screen === "reset" && !token || screen === "required" && !requiredAccount}>{screen === "login" ? "Sign in" : screen === "forgot" ? "Send reset instructions" : "Change password"}</Button>
      {screen === "login" ? <Link className="rw-text-link" href="/admin/forgot-password">Forgot your password?</Link> : <Link className="rw-text-link" href="/admin/login">Back to sign-in</Link>}
    </form>}<p className="rw-help">Credentials are sent to the existing KSU authentication service. No credentials are placed in browser storage.</p></section></div>;
}
