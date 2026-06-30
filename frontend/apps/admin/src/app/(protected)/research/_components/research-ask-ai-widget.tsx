"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, MessageSquareText, Send, Sparkles } from "lucide-react";
import {
  Button,
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
} from "@ksu/api-client";

type ChatMessage = Pick<ResearchAIMessage, "id" | "role" | "content" | "content_format" | "created_at"> & {
  pending?: boolean;
};

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
  const [suggestedPrompts, setSuggestedPrompts] = React.useState<ResearchAskAIPrompt[]>(DEFAULT_PROMPTS);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const context = React.useMemo(() => buildAskAIContext(pathname), [pathname]);

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
      setMessages(messagesQuery.data.data);
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
        },
        {
          id: assistantId,
          role: "assistant",
          content: "",
          content_format: "markdown",
          created_at: now,
          pending: true,
        },
      ]);

      try {
        await researchServiceApi.streamAskAI(
          {
            conversation_id: activeConversationId,
            message,
            context,
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
    [activeConversationId, context, isStreaming, queryClient],
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
                Read-only advisor for {sectionLabelFromContext(context)}
              </SheetDescription>
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
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[88%] rounded-lg px-3 py-2 text-sm leading-6",
          isUser ? "bg-primary text-primary-foreground" : "border bg-background",
          message.pending && "opacity-80",
        )}
      >
        {message.pending ? <TypingIndicator /> : <MarkdownMessage content={message.content} />}
      </div>
    </div>
  );
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
