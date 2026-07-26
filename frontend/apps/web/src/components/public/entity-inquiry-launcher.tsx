"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { createPortal } from "react-dom";
import { mainApi } from "@ksu/api-client";
import {
  Button,
  Checkbox,
  Input,
  Label,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@ksu/ui/components";
import { KSU_CONTEXTUAL_ACTION_SLOT_ID } from "@ksu/ui";
import { CheckCircle2, Loader2, MessageCircle, Send } from "lucide-react";

export type PublicInquiryTarget = {
  type: "university" | "school" | "department" | "office" | "person";
  slug: string;
  name: string;
};

type InquiryResponse = {
  data: {
    reference_number: string;
    target_entity_name: string;
  };
};

type InquiryDraft = {
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  category: string;
  subject: string;
  message: string;
  consentToContact: boolean;
  website: string;
};

const initialDraft: InquiryDraft = {
  senderName: "",
  senderEmail: "",
  senderPhone: "",
  category: "general",
  subject: "",
  message: "",
  consentToContact: false,
  website: "",
};

const INQUIRY_PANEL_ID = "ksu-entity-inquiry-panel";

export function EntityInquiryLauncher({
  target,
  aboveMobileNavigation = false,
}: {
  target: PublicInquiryTarget;
  aboveMobileNavigation?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [actionSlot, setActionSlot] = useState<HTMLElement | null>(null);
  const [draft, setDraft] = useState<InquiryDraft>(initialDraft);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");

  useEffect(() => {
    const slot = document.getElementById(KSU_CONTEXTUAL_ACTION_SLOT_ID);
    setActionSlot(slot);

    const dock = slot?.closest<HTMLElement>(".ksu-floating-action-dock");
    if (!dock || !aboveMobileNavigation) return;

    const previousOffset = dock.style.getPropertyValue(
      "--ksu-floating-bottom-offset",
    );
    dock.style.setProperty(
      "--ksu-floating-bottom-offset",
      "calc(4.75rem + env(safe-area-inset-bottom))",
    );

    return () => {
      if (previousOffset) {
        dock.style.setProperty(
          "--ksu-floating-bottom-offset",
          previousOffset,
        );
      } else {
        dock.style.removeProperty("--ksu-floating-bottom-offset");
      }
    };
  }, [aboveMobileNavigation]);

  function updateDraft(
    field: keyof InquiryDraft,
  ): (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void {
    return (event) => {
      setDraft((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity() || !draft.consentToContact) {
      const invalidControl =
        form.querySelector<HTMLElement>(":invalid") ??
        form.querySelector<HTMLElement>(
          '[name="consent_to_contact"]',
        );
      invalidControl?.focus();
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await mainApi.post<InquiryResponse>(
        `/api/v1/public/entities/${target.type}/${encodeURIComponent(target.slug)}/inquiries`,
        {
          sender_name: draft.senderName,
          sender_email: draft.senderEmail,
          sender_phone: draft.senderPhone || null,
          category: draft.category,
          subject: draft.subject,
          message: draft.message,
          consent_to_contact: draft.consentToContact,
          website: draft.website,
          source_page_url: window.location.pathname,
        },
      );
      setDraft(initialDraft);
      setReference(response.data.reference_number);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "We could not send your message. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function startAnotherMessage() {
    setDraft(initialDraft);
    setError("");
    setReference("");
  }

  const launcher = (
    <TooltipProvider delayDuration={250}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="ksu-floating-action"
            aria-label={`Send a message to ${target.name}`}
            aria-expanded={open}
            aria-controls={INQUIRY_PANEL_ID}
            title="Send a message"
          >
            <MessageCircle aria-hidden className="h-5 w-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="left">Send a message</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <>
      {actionSlot ? createPortal(launcher, actionSlot) : null}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          id={INQUIRY_PANEL_ID}
          side="right"
          className="flex h-dvh w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
        >
          <SheetHeader className="border-b border-border bg-primary/[0.04] px-5 py-5 pr-12 text-left sm:px-7">
            <SheetTitle className="font-[family-name:var(--font-display)] text-2xl text-foreground">
              Send a message to {target.name}
            </SheetTitle>
            <SheetDescription>
              Your inquiry will be routed to the team responsible for this{" "}
              {target.type}.
            </SheetDescription>
          </SheetHeader>
          <p role="status" aria-live="polite" className="sr-only">
            {submitting
              ? "Sending message…"
              : reference
                ? `Message sent. Reference number ${reference}.`
                : ""}
          </p>

          {reference ? (
            <div
              className="overflow-y-auto px-6 py-10 text-center sm:px-8"
            >
              <CheckCircle2
                aria-hidden
                className="mx-auto h-12 w-12 text-emerald-600"
              />
              <h3 className="mt-4 text-xl font-bold text-foreground">
                Message received
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Keep this reference number for follow-up:
              </p>
              <p
                aria-label={`Reference number ${reference}`}
                className="mt-3 select-text rounded-xl bg-primary/[0.07] px-4 py-3 font-mono text-lg font-bold text-primary"
              >
                {reference}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button type="button" onClick={startAnotherMessage}>
                  Send another message
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={submit}
              className="grid flex-1 gap-4 overflow-y-auto px-5 py-5 sm:grid-cols-2 sm:px-7"
            >
              <div className="grid gap-1.5">
                <Label htmlFor="inquiry-name">Your name</Label>
                <Input
                  id="inquiry-name"
                  name="sender_name"
                  value={draft.senderName}
                  onChange={updateDraft("senderName")}
                  minLength={2}
                  required
                  autoComplete="name"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="inquiry-email">Email address</Label>
                <Input
                  id="inquiry-email"
                  name="sender_email"
                  type="email"
                  value={draft.senderEmail}
                  onChange={updateDraft("senderEmail")}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="inquiry-phone">Phone (optional)</Label>
                <Input
                  id="inquiry-phone"
                  name="sender_phone"
                  type="tel"
                  value={draft.senderPhone}
                  onChange={updateDraft("senderPhone")}
                  autoComplete="tel"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="inquiry-category">Category</Label>
                <select
                  id="inquiry-category"
                  name="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={draft.category}
                  onChange={updateDraft("category")}
                >
                  <option value="general">General inquiry</option>
                  <option value="admissions">Admissions and programmes</option>
                  <option value="academic">Academic support</option>
                  <option value="research">Research and collaboration</option>
                  <option value="services">Services and records</option>
                  <option value="feedback">Feedback or complaint</option>
                </select>
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <Label htmlFor="inquiry-subject">Subject</Label>
                <Input
                  id="inquiry-subject"
                  name="subject"
                  value={draft.subject}
                  onChange={updateDraft("subject")}
                  minLength={3}
                  required
                />
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <Label htmlFor="inquiry-message">Message</Label>
                <Textarea
                  id="inquiry-message"
                  name="message"
                  value={draft.message}
                  onChange={updateDraft("message")}
                  minLength={5}
                  required
                  rows={6}
                />
              </div>
              <div className="absolute -left-[9999px]" aria-hidden="true">
                <Label htmlFor="inquiry-website">Website</Label>
                <Input
                  id="inquiry-website"
                  name="website"
                  value={draft.website}
                  onChange={updateDraft("website")}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
              <label className="flex items-start gap-3 text-sm leading-5 text-muted-foreground sm:col-span-2">
                <Checkbox
                  name="consent_to_contact"
                  checked={draft.consentToContact}
                  onCheckedChange={(checked) =>
                    setDraft((current) => ({
                      ...current,
                      consentToContact: checked === true,
                    }))
                  }
                  required
                  className="mt-0.5"
                />
                <span>
                  I consent to Kisii University using these details to respond
                  to this inquiry.
                </span>
              </label>
              {error ? (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 sm:col-span-2"
                >
                  {error}
                </p>
              ) : null}
              <div className="sticky bottom-0 -mx-5 -mb-5 flex justify-end border-t border-border bg-background px-5 py-4 sm:col-span-2 sm:-mx-7 sm:px-7">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="min-w-36 gap-2"
                >
                  {submitting ? (
                    <Loader2
                      aria-hidden
                      className="h-4 w-4 animate-spin"
                    />
                  ) : (
                    <Send aria-hidden className="h-4 w-4" />
                  )}
                  {submitting ? "Sending…" : "Send message"}
                </Button>
              </div>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
