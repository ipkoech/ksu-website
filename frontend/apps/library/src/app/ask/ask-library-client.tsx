"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Loader2, Mail, Send, ShieldCheck } from "lucide-react";
import {
  ApiClientError,
  libraryServiceApi,
  type LibraryAssistantAnswer,
  type LibraryAssistantContext,
  type LibraryAssistantMessage,
} from "@ksu/api-client";

type ChatMessage = Pick<LibraryAssistantMessage, "sender_type" | "content" | "citations"> & {
  id?: string;
};

type AskLibraryClientProps = {
  contexts: LibraryAssistantContext[];
};

export function AskLibraryClient({ contexts }: AskLibraryClientProps) {
  const [contextId, setContextId] = useState(contexts[0]?.id ?? "");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [verificationRequested, setVerificationRequested] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedContext = useMemo(
    () => contexts.find((context) => context.id === contextId) ?? contexts[0],
    [contextId, contexts],
  );

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("verification_token");
    if (!token) return;
    void confirmVerification({ token });
    // The email link is intentionally consumed through the backend cookie flow.
  }, []);

  async function submitQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || isBusy) return;
    setIsBusy(true);
    setError(null);
    setStatus(null);
    setMessages((current) => [...current, { sender_type: "user", content: trimmed, citations: [] }]);
    setQuestion("");
    try {
      const response = conversationId
        ? await libraryServiceApi.assistant.conversations.continue(conversationId, {
            message: trimmed,
            conversation_id: conversationId,
          })
        : await libraryServiceApi.assistant.answer({
            message: trimmed,
            context_id: selectedContext?.id,
            page_context: { url: "/ask", title: "Ask the Library" },
          });
      appendAnswer(response.data);
    } catch (caught) {
      const message = caught instanceof ApiClientError ? caught.message : "The assistant could not answer right now.";
      setError(message);
    } finally {
      setIsBusy(false);
    }
  }

  function appendAnswer(answer: LibraryAssistantAnswer) {
    setMessages((current) => [
      ...current,
      {
        sender_type: "assistant",
        content: answer.answer,
        citations: answer.citations,
      },
    ]);
    if (answer.conversation_id) setConversationId(answer.conversation_id);
    if (answer.needs_verification) {
      setStatus("That was your free answer. Verify your email to continue this conversation and keep the thread.");
    }
  }

  async function requestVerification(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || isBusy) return;
    setIsBusy(true);
    setError(null);
    try {
      const response = await libraryServiceApi.assistant.verification.request(email.trim());
      setVerificationRequested(response.data.accepted);
      setStatus(response.data.message);
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : "We could not send the verification email.");
    } finally {
      setIsBusy(false);
    }
  }

  async function confirmVerification(data: { token?: string; code?: string }) {
    setIsBusy(true);
    setError(null);
    try {
      const response = await libraryServiceApi.assistant.verification.confirm(data);
      if (!response.data.accepted) throw new Error(response.data.message);
      setConversationId(response.data.conversation_id ?? null);
      setVerificationRequested(false);
      setStatus(response.data.message);
      if (response.data.conversation_id) {
        const history = await libraryServiceApi.assistant.conversations.messages(response.data.conversation_id);
        setMessages(history.data);
      }
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : "That verification link or code is no longer valid.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_330px] lg:gap-16">
      <section className="min-w-0" aria-labelledby="assistant-conversation-heading">
        <div className="flex flex-col gap-5 border-y border-border py-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Library desk</p>
            <h2 id="assistant-conversation-heading" className="mt-2 text-2xl font-semibold text-foreground">Ask the Library</h2>
            <p className="mt-2 max-w-xl text-sm leading-7 text-muted-foreground">Start with one question. The assistant searches approved Library guidance and shows you where the answer comes from.</p>
          </div>
          {contexts.length > 0 ? (
            <label className="flex min-w-52 flex-col gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Support area
              <select value={contextId} onChange={(event) => setContextId(event.target.value)} disabled={isBusy} className="min-h-11 rounded-md border border-border bg-white px-3 text-sm font-medium normal-case tracking-normal text-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15">
                {contexts.map((context) => <option key={context.id} value={context.id}>{context.name}</option>)}
              </select>
            </label>
          ) : null}
        </div>

        <div className="min-h-72 border-b border-border py-6" aria-live="polite">
          {messages.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center px-5 text-center">
              <BookOpen aria-hidden className="h-8 w-8 text-secondary" />
              <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">Try asking about borrowing, MyLOFT, finding a book, research support, opening hours, or a Library policy.</p>
            </div>
          ) : (
            <div className="space-y-7">
              {messages.map((message, index) => (
                <article key={message.id ?? `${message.sender_type}-${index}`} className={message.sender_type === "user" ? "ml-auto max-w-2xl border-r-4 border-secondary pr-4 text-right" : "max-w-3xl border-l-4 border-primary pl-4"}>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{message.sender_type === "user" ? "You" : "Library assistant"}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-foreground">{message.content}</p>
                  {message.citations?.length ? (
                    <div className="mt-4 border-t border-border pt-3 text-left">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">Sources</p>
                      <ul className="mt-2 space-y-2">
                        {message.citations.map((citation) => <li key={`${citation.source_type}-${citation.source_id}`}><a href={citation.url ?? "/search"} className="text-sm font-semibold text-primary underline-offset-4 hover:underline">{citation.title}</a>{citation.snippet ? <span className="ml-2 text-xs text-muted-foreground">{citation.snippet}</span> : null}</li>)}
                      </ul>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={submitQuestion} className="border-b border-border py-5">
          <label htmlFor="library-assistant-question" className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Your question</label>
          <textarea id="library-assistant-question" value={question} onChange={(event) => setQuestion(event.target.value)} disabled={isBusy} rows={4} maxLength={2000} placeholder="What would you like help finding?" className="mt-2 min-h-28 w-full resize-y rounded-md border border-border bg-white p-3 text-sm leading-7 text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" />
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-muted-foreground">Do not share passwords, payment details, or confidential personal information.</p>
            <button type="submit" disabled={isBusy || !question.trim()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60">{isBusy ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <Send aria-hidden className="h-4 w-4" />} Ask the Library</button>
          </div>
        </form>

        {status ? <p role="status" className="mt-5 border-l-4 border-secondary bg-secondary/5 p-4 text-sm leading-7 text-primary">{status}</p> : null}
        {error ? <p role="alert" className="mt-5 border-l-4 border-destructive bg-destructive/5 p-4 text-sm leading-7 text-destructive">{error}</p> : null}
      </section>

      <aside className="space-y-7">
        {verificationRequested ? (
          <form onSubmit={(event) => { event.preventDefault(); void confirmVerification({ code }); }} className="border-t-4 border-secondary bg-surface-subtle p-5">
            <Mail aria-hidden className="h-6 w-6 text-secondary" />
            <h3 className="mt-4 text-xl font-semibold text-foreground">Check your email</h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">Use the secure link or enter the six-digit code we sent to continue this thread.</p>
            <label htmlFor="library-assistant-code" className="mt-5 block text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Verification code</label>
            <input id="library-assistant-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value)} className="mt-2 min-h-11 w-full rounded-md border border-border bg-white px-3 text-sm tracking-[0.35em] outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" />
            <button type="submit" disabled={isBusy || code.length !== 6} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{isBusy ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <ShieldCheck aria-hidden className="h-4 w-4" />} Continue securely</button>
          </form>
        ) : status?.includes("Verify your email") ? (
          <form onSubmit={requestVerification} className="border-t-4 border-secondary bg-surface-subtle p-5">
            <ShieldCheck aria-hidden className="h-6 w-6 text-secondary" />
            <h3 className="mt-4 text-xl font-semibold text-foreground">Keep this conversation</h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">Enter your email to receive a magic link and six-digit code. Your next questions and any librarian reply will stay in this thread.</p>
            <label htmlFor="library-assistant-email" className="mt-5 block text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Email address</label>
            <input id="library-assistant-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 min-h-11 w-full rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" placeholder="you@example.com" />
            <button type="submit" disabled={isBusy || !email.trim()} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-secondary px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{isBusy ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <Mail aria-hidden className="h-4 w-4" />} Send verification</button>
          </form>
        ) : (
          <div className="border-l-4 border-secondary bg-surface-subtle p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">One free answer</p>
            <h3 className="mt-3 text-xl font-semibold text-foreground">Need to keep going?</h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">Verify your email after the first answer to keep the conversation and continue with the Library team.</p>
          </div>
        )}
        <div className="border-t border-border pt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">Human support</p>
          <h3 className="mt-3 text-xl font-semibold text-foreground">Prefer a librarian?</h3>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">You can contact a branch directly or send the Library team a structured enquiry.</p>
          <Link href="/contact#contact-form" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary">Contact the Library <ArrowRight aria-hidden className="h-4 w-4" /></Link>
        </div>
        <div className="flex items-start gap-3 border-t border-border pt-5 text-sm leading-6 text-muted-foreground"><CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />Answers are grounded in approved Library information and may recommend human help when the sources are not enough.</div>
      </aside>
    </div>
  );
}
