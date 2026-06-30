"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, MessageSquareText, MoreVertical, Send, Sparkles } from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  ScrollArea,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Textarea,
} from "@ksu/ui/components";
import { cn } from "@ksu/ui/lib";
import {
  researchServiceApi,
  type ResearchAIMessage,
  type ResearchAskAIContextRequest,
  type ResearchAskAIPrompt,
  type ResearchAskAIReference,
} from "@ksu/api-client";

type ChatMessage = Pick<ResearchAIMessage, "id" | "role" | "content" | "content_format" | "created_at"> & {
  pending?: boolean;
  references?: ResearchAskAIReference[];
};

type AskAIScope = "page" | "global" | "mixed";
type AskAIMode = "summarize" | "find_gaps" | "compare" | "report" | "explain" | "navigate";

const SCOPE_OPTIONS: Array<{ label: string; value: AskAIScope }> = [
  { label: "This page", value: "page" },
  { label: "All research", value: "global" },
  { label: "Mixed", value: "mixed" },
];

const MODE_OPTIONS: Array<{ label: string; value: AskAIMode }> = [
  { label: "Summarize", value: "summarize" },
  { label: "Find gaps", value: "find_gaps" },
  { label: "Compare", value: "compare" },
  { label: "Report", value: "report" },
  { label: "Explain", value: "explain" },
  { label: "Navigate", value: "navigate" },
];

const REFERENCE_OPTIONS: Array<ResearchAskAIReference & { token: string }> = [
  { token: "/projects", label: "/projects", type: "resource", href: "/research/projects", resource_key: "research-projects" },
  { token: "/grants", label: "/grants", type: "resource", href: "/research/grants", resource_key: "research-grants" },
  { token: "/publications", label: "/publications", type: "resource", href: "/research/publications", resource_key: "research-publications" },
  { token: "/centers", label: "/centers", type: "resource", href: "/research/centers", resource_key: "research-centers" },
  { token: "/reports", label: "/reports", type: "page", href: "/research/reports", resource_key: null },
  { token: "/sustainability", label: "/sustainability", type: "resource", href: "/research/sustainability", resource_key: "research-sustainability" },
];

const DEFAULT_PROMPTS: ResearchAskAIPrompt[] = [
  {
    id: "portfolio-health",
    label: "Portfolio health",
    text: "Summarize the current research portfolio and highlight data quality checks.",
    intent: "summarize",
  },
  {
    id: "export-readiness",
    label: "Export readiness",
    text: "What should I verify before exporting this section for reporting?",
    intent: "prepare_export",
  },
  {
    id: "section-gaps",
    label: "Find gaps",
    text: "Which records in this section should I review for missing metadata?",
    intent: "find_gaps",
  },
];

export function ResearchAskAIWidget() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [conversationId, setConversationId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = React.useState("");
  const [selectedScope, setSelectedScope] = React.useState<AskAIScope>("page");
  const [selectedMode, setSelectedMode] = React.useState<AskAIMode>("summarize");
  const [manualReferences, setManualReferences] = React.useState<ResearchAskAIReference[]>([]);
  const [suggestedPrompts, setSuggestedPrompts] = React.useState<ResearchAskAIPrompt[]>(DEFAULT_PROMPTS);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const context = React.useMemo(() => buildAskAIContext(pathname), [pathname]);
  const selectedReferences = React.useMemo(
    () => mergeReferences(manualReferences, referencesFromPrompt(prompt)),
    [manualReferences, prompt],
  );
  const scopeLabel = SCOPE_OPTIONS.find((item) => item.value === selectedScope)?.label ?? "This page";

  const conversationsQuery = useQuery({
    queryKey: ["research", "ask-ai", "conversations"],
    queryFn: () => researchServiceApi.listAskAIConversations(),
    enabled: open,
    staleTime: 30_000,
  });

  const activeConversationId = conversationId ?? conversationsQuery.data?.data?.[0]?.id ?? null;

  const messagesQuery = useQuery({
    queryKey: ["research", "ask-ai", "messages", activeConversationId],
    queryFn: () => researchServiceApi.listAskAIMessages(activeConversationId as string),
    enabled: open && Boolean(activeConversationId) && !isStreaming,
    staleTime: 10_000,
  });

  React.useEffect(() => {
    if (!conversationId && conversationsQuery.data?.data?.[0]?.id) {
      setConversationId(conversationsQuery.data.data[0].id);
    }
  }, [conversationId, conversationsQuery.data?.data]);

  React.useEffect(() => {
    if (messagesQuery.data?.data && !isStreaming) {
      setMessages(messagesQuery.data.data.map(toChatMessage));
    }
  }, [isStreaming, messagesQuery.data?.data]);

  React.useEffect(() => {
    const viewport = scrollRef.current?.querySelector("[data-radix-scroll-area-viewport]");
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages, open]);

  const sendMessage = React.useCallback(
    async (text: string) => {
      const message = text.trim();
      if (!message || isStreaming) return;

      const now = new Date().toISOString();
      const assistantId = `assistant-${Date.now()}`;
      let assistantDraft = "";
      setPrompt("");
      setError(null);
      setIsStreaming(true);
      setMessages((current) => [
        ...current,
        {
          id: `user-${Date.now()}`,
          role: "user",
          content: message,
          content_format: "markdown",
          created_at: now,
          references: selectedReferences,
        },
        {
          id: assistantId,
          role: "assistant",
          content: "",
          content_format: "markdown",
          created_at: now,
          pending: true,
          references: selectedReferences,
        },
      ]);

      try {
        await researchServiceApi.streamAskAI(
          {
            conversation_id: activeConversationId,
            message,
            context,
            scope: selectedScope,
            intent_mode: selectedMode,
            references: selectedReferences,
          },
          (event) => {
            if (event.event === "metadata") {
              if (event.data.conversation_id) {
                setConversationId(event.data.conversation_id);
              }
              if (event.data.suggested_prompts?.length) {
                setSuggestedPrompts(event.data.suggested_prompts);
              }
              return;
            }

            if (event.event === "delta") {
              const delta = event.data.text ?? "";
              if (!delta) return;
              assistantDraft += delta;
              return;
            }

            if (event.event === "error") {
              const message = event.data.message || "Ask AI could not answer right now.";
              setError(message);
              setMessages((current) =>
                current.map((item) =>
                  item.id === assistantId
                    ? { ...item, content: message, pending: false }
                    : item,
                ),
              );
              return;
            }

            if (event.event === "done") {
              setConversationId(event.data.conversation_id ?? activeConversationId);
              if (event.data.suggested_prompts?.length) {
                setSuggestedPrompts(event.data.suggested_prompts);
              }
              setMessages((current) =>
                current.map((item) =>
                  item.id === assistantId
                    ? {
                        ...item,
                        id: event.data.assistant_message_id ?? item.id,
                        content: event.data.answer || assistantDraft,
                        pending: false,
                        references: event.data.references ?? selectedReferences,
                      }
                    : item,
                ),
              );
            }
          },
        );
        await queryClient.invalidateQueries({ queryKey: ["research", "ask-ai"] });
      } catch (streamError) {
        setError(streamError instanceof Error ? streamError.message : "Ask AI could not answer right now.");
        setMessages((current) => current.filter((item) => item.id !== assistantId));
      } finally {
        setIsStreaming(false);
      }
    },
    [activeConversationId, context, isStreaming, queryClient, selectedMode, selectedReferences, selectedScope],
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        size="lg"
        className="fixed bottom-4 right-4 z-50 h-12 gap-2 rounded-full px-5 shadow-lg shadow-primary/20 sm:bottom-6 sm:right-6"
        onClick={() => setOpen(true)}
      >
        <MessageSquareText className="size-4" />
        Ask AI
      </Button>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="border-b px-5 py-4 text-left">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-primary/10 text-primary">
              <Bot className="size-5" />
            </div>
            <div className="min-w-0">
              <SheetTitle>Research Ask AI</SheetTitle>
              <SheetDescription className="truncate">
                Using {scopeLabel} for {sectionLabelFromContext(context)}
              </SheetDescription>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {SCOPE_OPTIONS.map((item) => (
                <Button
                  key={item.value}
                  type="button"
                  size="sm"
                  variant={selectedScope === item.value ? "default" : "outline"}
                  className="h-8 px-3 text-xs"
                  onClick={() => setSelectedScope(item.value)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {MODE_OPTIONS.map((item) => (
                <Button
                  key={item.value}
                  type="button"
                  size="sm"
                  variant={selectedMode === item.value ? "secondary" : "ghost"}
                  className="h-7 px-2 text-xs"
                  onClick={() => setSelectedMode(item.value)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </SheetHeader>

        <ScrollArea ref={scrollRef} className="flex-1 px-5 py-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="size-4 text-primary" />
                  Suggested prompts
                </div>
                <div className="grid gap-2">
                  {suggestedPrompts.slice(0, 4).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="rounded-md border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                      onClick={() => setPrompt(item.text)}
                    >
                      <span className="block font-medium">{item.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

          </div>
        </ScrollArea>

        <div className="border-t bg-background px-5 py-4">
          {error ? <p className="mb-2 text-sm text-destructive">{error}</p> : null}
          <div className="mb-2 flex items-center justify-between gap-3">
            <SelectedReferenceChips references={selectedReferences} />
            <ReferenceMenu
              references={manualReferences}
              onToggle={(reference) => setManualReferences((current) => toggleReference(current, reference))}
            />
          </div>
          <form
            className="flex items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage(prompt);
            }}
          >
            <Textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage(prompt);
                }
              }}
              placeholder="Ask about this research section..."
              rows={2}
              className="min-h-12 resize-none"
              disabled={isStreaming}
            />
            <Button type="submit" size="icon" disabled={isStreaming || !prompt.trim()} aria-label="Send Ask AI message">
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const content = isUser ? message.content : stripEchoedQuestion(message.content);
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[88%] rounded-lg px-3 py-2 text-sm leading-6",
          isUser ? "bg-primary text-primary-foreground" : "border bg-background",
          message.pending && "opacity-80",
        )}
      >
        {message.pending ? <TypingIndicator /> : <MarkdownMessage content={content} />}
        {isUser && message.references?.length ? <UserReferenceChips references={message.references} /> : null}
        {!isUser && !message.pending ? <SourceChips references={message.references ?? []} /> : null}
      </div>
    </div>
  );
}

function ReferenceMenu({
  references,
  onToggle,
}: {
  references: ResearchAskAIReference[];
  onToggle: (reference: ResearchAskAIReference & { token: string }) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" size="icon" variant="outline" className="size-9 shrink-0" aria-label="Choose Ask AI references">
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2">
        <div className="mb-2 px-2 text-xs font-medium text-muted-foreground">References</div>
        <div className="grid gap-1">
          {REFERENCE_OPTIONS.map((item) => {
            const selected = references.some((reference) => reference.href === item.href);
            return (
              <button
                key={item.token}
                type="button"
                className={cn(
                  "flex items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                  selected ? "bg-primary/10 text-primary" : "hover:bg-muted",
                )}
                onClick={() => onToggle(item)}
              >
                <span>{item.token}</span>
                {selected ? <span className="text-[10px] uppercase">On</span> : null}
              </button>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SelectedReferenceChips({ references }: { references: ResearchAskAIReference[] }) {
  if (!references.length) {
    return <p className="min-w-0 text-xs text-muted-foreground">No references selected</p>;
  }
  return (
    <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
      {references.map((reference) => (
        <ReferenceChip key={`${reference.href}-${reference.resource_key ?? reference.label}`} reference={reference} />
      ))}
    </div>
  );
}

function UserReferenceChips({ references }: { references: ResearchAskAIReference[] }) {
  return (
    <div className="mt-2 flex flex-wrap justify-end gap-1">
      {references.slice(0, 4).map((reference) => (
        <span
          key={`${reference.href}-${reference.resource_key ?? reference.label}`}
          className="rounded bg-primary-foreground/15 px-1.5 py-0.5 text-[10px] leading-4 text-primary-foreground/90"
        >
          {reference.label}
        </span>
      ))}
    </div>
  );
}

function SourceChips({ references }: { references: ResearchAskAIReference[] }) {
  if (!references.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-1.5 border-t pt-2">
      {references.slice(0, 4).map((reference) => (
        <ReferenceChip key={`${reference.href}-${reference.resource_key ?? reference.label}`} reference={reference} />
      ))}
    </div>
  );
}

function ReferenceChip({ reference }: { reference: ResearchAskAIReference }) {
  return (
    <span className="rounded-md bg-muted px-2 py-1 text-[11px] leading-4 text-muted-foreground">
      {reference.label}
    </span>
  );
}

function stripEchoedQuestion(content: string) {
  return content.replace(/\n#{2,3}\s*Your question[\s\S]*$/i, "").trim();
}

function TypingIndicator() {
  return (
    <div className="flex min-h-6 items-center gap-1.5" aria-label="Ask AI is preparing an answer">
      {/* motion dots */}
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          className="size-1.5 rounded-full bg-muted-foreground/70 motion-safe:animate-bounce"
          style={{ animationDelay: `${dot * 120}ms` }}
        />
      ))}
    </div>
  );
}

function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="space-y-2">
      {content.split("\n").map((line, index) => {
        const key = `${index}-${line}`;
        if (!line.trim()) return <div key={key} className="h-1" />;
        if (line.startsWith("### ")) {
          return <p key={key} className="pt-1 text-sm font-semibold">{renderInlineMarkdown(line.slice(4))}</p>;
        }
        if (line.startsWith("## ")) {
          return <p key={key} className="pt-1 text-base font-semibold">{renderInlineMarkdown(line.slice(3))}</p>;
        }
        if (line.startsWith("- ")) {
          return <p key={key} className="pl-3 before:mr-2 before:content-['-']">{renderInlineMarkdown(line.slice(2))}</p>;
        }
        return <p key={key}>{renderInlineMarkdown(line)}</p>;
      })}
    </div>
  );
}

function renderInlineMarkdown(line: string) {
  const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index} className="rounded bg-muted px-1 py-0.5 text-[0.85em]">{part.slice(1, -1)}</code>;
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

function buildAskAIContext(pathname: string): ResearchAskAIContextRequest {
  const parts = pathname.split("/").filter(Boolean);
  const section = parts[1] ?? "overview";
  return {
    path: pathname || "/research",
    section,
    resource_key: resourceKeyForPath(parts),
  };
}

function referencesFromPrompt(prompt: string): ResearchAskAIReference[] {
  const normalized = prompt.toLowerCase();
  return REFERENCE_OPTIONS.filter((item) => normalized.includes(item.token)).map(toReference);
}

function toChatMessage(message: ResearchAIMessage): ChatMessage {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    content_format: message.content_format,
    created_at: message.created_at,
    references: normalizeReferences(message.references),
  };
}

function normalizeReferences(references: ResearchAIMessage["references"]): ResearchAskAIReference[] {
  const rawReferences: unknown[] = references ? [...references] : [];
  const safeReferences: ResearchAskAIReference[] = rawReferences
    .filter(isResearchAskAIReference);
  return safeReferences.map(toReference);
}

function isResearchAskAIReference(reference: unknown): reference is ResearchAskAIReference {
  if (typeof reference !== "object" || reference === null) return false;
  const candidate = reference as Record<string, unknown>;
  return (
    typeof candidate.label === "string" &&
    typeof candidate.type === "string" &&
    typeof candidate.href === "string"
  );
}

function toggleReference(current: ResearchAskAIReference[], option: ResearchAskAIReference & { token: string }) {
  if (current.some((reference) => reference.href === option.href)) {
    return current.filter((reference) => reference.href !== option.href);
  }
  return [...current, toReference(option)];
}

function mergeReferences(...groups: ResearchAskAIReference[][]) {
  const seen = new Set<string>();
  const merged: ResearchAskAIReference[] = [];
  for (const group of groups) {
    for (const reference of group) {
      const key = `${reference.resource_key ?? ""}:${reference.href}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(reference);
    }
  }
  return merged;
}

function toReference(reference: ResearchAskAIReference): ResearchAskAIReference {
  return {
    label: reference.label,
    type: reference.type,
    href: reference.href,
    resource_key: reference.resource_key,
  };
}

function resourceKeyForPath(parts: string[]) {
  const key = parts.slice(1, 3).join("/");
  const mappings: Record<string, string> = {
    projects: "research-projects",
    publications: "research-publications",
    "publications/journals": "research-journals",
    outputs: "research-outputs",
    innovations: "research-innovations",
    grants: "research-grants",
    fundings: "research-grants",
    impact: "research-impact-metrics",
    partnerships: "research-partners",
    sustainability: "research-sustainability",
    "sustainability/partners": "research-partners",
    "farm/farms": "research-farms",
    "farm/projects": "research-projects",
    "farm/partnerships": "research-partners",
    reports: "research-reports",
  };
  return mappings[key] ?? mappings[parts[1] ?? ""] ?? null;
}

function sectionLabelFromContext(context: ResearchAskAIContextRequest) {
  const section = context.section?.replace(/-/g, " ") || "overview";
  return section.replace(/\b\w/g, (letter) => letter.toUpperCase());
}
