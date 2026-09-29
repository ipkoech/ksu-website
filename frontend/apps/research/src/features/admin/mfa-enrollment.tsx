"use client";
import { useState } from "react";
import { Button } from "@ksu/ui/button";
import { WorkspaceFeedback } from "@ksu/ui/components/workspace-feedback";
import { researchAuthApi } from "@ksu/api-client/research";
import { Problem } from "./problem";
import { useUnsavedGuard, useWorkspaceCommand } from "./use-workspace";
export function MfaEnrollment({ enabled, onConfirmed }: { enabled: boolean; onConfirmed: () => void }) {
  const [open, setOpen] = useState(false), [password, setPassword] = useState(""), [previous, setPrevious] = useState(""), [code, setCode] = useState("");
  const [enrollment, setEnrollment] = useState<{ secret: string; otpauth_uri: string } | null>(null), [codes, setCodes] = useState<string[]>([]);
  const begin = useWorkspaceCommand(), confirm = useWorkspaceCommand();
  useUnsavedGuard(begin.locked || confirm.locked || Boolean(password || enrollment || codes.length));
  function close() { setOpen(false); setPassword(""); setPrevious(""); setCode(""); setEnrollment(null); setCodes([]); begin.reset(); confirm.reset(); onConfirmed(); }
  if (!open) return <Button type="button" variant="outline" onClick={() => setOpen(true)}>{enabled ? "Replace authenticator" : "Set up an authenticator"}</Button>;
  return <section className="rw-mfa-setup rw-stack" aria-labelledby="rw-enrollment-title"><h3 id="rw-enrollment-title">{enabled ? "Replace your authenticator" : "Set up multi-factor authentication"}</h3>
    {codes.length ? <><WorkspaceFeedback title="Authenticator confirmed" tone="success">Store these single-use recovery codes in a secure password manager. They are shown only in this open page and are not saved to browser storage.</WorkspaceFeedback><div className="rw-recovery-codes" aria-label="Recovery codes">{codes.map(value => <code key={value}>{value}</code>)}</div><Button type="button" onClick={close}>I have saved the codes securely</Button></> : enrollment ? <><p>Add this account to your authenticator using its manual setup option. No third-party QR service receives this secret.</p><label>Setup key<input readOnly autoComplete="off" spellCheck={false} value={enrollment.secret} onFocus={event => event.target.select()} /></label><p><a className="rw-text-link" href={enrollment.otpauth_uri}>Open an installed authenticator app</a></p><form className="rw-stack" onSubmit={event => { event.preventDefault(); if (!confirm.locked) confirm.execute(key => researchAuthApi.confirmEnrollment(code, key), values => { setCode(""); setEnrollment(null); setCodes(values); }); }}><label>Code from the new authenticator<input autoComplete="one-time-code" inputMode="numeric" minLength={6} maxLength={64} required disabled={confirm.locked} value={code} onChange={event => { confirm.reset(); setCode(event.target.value); }} /></label>{confirm.error && <Problem problem={confirm.error} onRetry={confirm.retry} command researchRecovery={false} />}<Button type="submit" loading={confirm.pending} disabled={confirm.locked}>Confirm authenticator</Button></form></> : <form className="rw-stack" onSubmit={event => { event.preventDefault(); if (!begin.locked) begin.execute(key => researchAuthApi.enroll(password, key, enabled ? previous : undefined), data => { setPassword(""); setPrevious(""); setEnrollment(data); }); }}>
      <p>{enabled ? "This is a security-sensitive replacement. Supply your current password and current authenticator or recovery code." : "Verify your current password before generating an authenticator setup key."}</p>
      <label>Current password<input type="password" autoComplete="current-password" minLength={8} maxLength={255} required disabled={begin.locked} value={password} onChange={event => { begin.reset(); setPassword(event.target.value); }} /></label>
      {enabled && <label>Current authenticator or recovery code<input autoComplete="one-time-code" minLength={6} maxLength={64} required disabled={begin.locked} value={previous} onChange={event => { begin.reset(); setPrevious(event.target.value); }} /></label>}
      {begin.error && <Problem problem={begin.error} onRetry={begin.retry} command researchRecovery={false} />}<Button type="submit" disabled={begin.locked} loading={begin.pending}>Generate setup key</Button></form>}
    {!codes.length && <Button type="button" variant="ghost" disabled={begin.locked || confirm.locked} onClick={() => { if (!enrollment || window.confirm("Close without confirming this authenticator? Setup is not completed until the authentication service accepts a new code.")) close(); }}>Close setup</Button>}
  </section>;
}
