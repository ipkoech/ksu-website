import Link from "next/link";
import { ArrowRight, ClipboardList, FileText, Handshake, Megaphone, Search, Sparkles } from "lucide-react";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";

const officialLinks = {
  customerCare: "https://digital.kisiiuniversity.ac.ke/ksu_customer_care_center",
  createTicket: "https://digital.kisiiuniversity.ac.ke/create_ticket",
  informationRequest: "https://digital.kisiiuniversity.ac.ke/create_request_for_information",
  followInformationRequest: "https://digital.kisiiuniversity.ac.ke/follow_up_your_request_for_information",
  feedbackStatus: "https://digital.kisiiuniversity.ac.ke/ksu_feedback_check_status_center",
  complaint: "https://digital.kisiiuniversity.ac.ke/ksu_feedback_general_cat/complain",
  suggestion: "https://digital.kisiiuniversity.ac.ke/ksu_feedback_general_cat/suggestion",
  compliment: "https://digital.kisiiuniversity.ac.ke/ksu_feedback_general_cat/compliment",
};

export const metadata = {
  title: "Help Desk",
  description: "Customer care and service support at Kisii University.",
};

export default function HelpDeskPage() {
  return (
    <PageShell>
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <BreadcrumbTrail items={[{ label: "Home", href: "/" }, { label: "Help Desk" }]} />

        <div className="mt-8">
          <p className="text-sm font-semibold uppercase text-secondary">Help Desk</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950">
            Customer care and service support
          </h1>
          <p className="mt-4 text-base leading-8 text-slate-600">
            Use the official Kisii University digital service channels to raise
            support tickets, submit feedback, request information, and follow up
            on existing requests.
          </p>
        </div>

        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
            Service request pathways
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { icon: ClipboardList, label: "Raise a ticket", body: "Create a support ticket for a university service issue.", href: officialLinks.createTicket },
              { icon: Search, label: "Check ticket status", body: "Follow up on an existing ticket.", href: "https://digital.kisiiuniversity.ac.ke/check_your_requests/%D7%9C%D7%99%D7%A6%D7%95%D7%A8%20%D7%9B%D7%A8%D7%98%D7%99%D7%A1" },
              { icon: FileText, label: "Request information", body: "Submit a public information request.", href: officialLinks.informationRequest },
              { icon: Search, label: "Follow up request", body: "Track a previously submitted information request.", href: officialLinks.followInformationRequest },
              { icon: Search, label: "Monitor feedback", body: "Check the status of feedback submitted.", href: officialLinks.feedbackStatus },
              { icon: Handshake, label: "General contact", body: "Email, phone, postal, and office contacts.", href: "/contact" },
            ].map((item) => {
              const Icon = item.icon;
              const external = /^https?:\/\//i.test(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="group flex items-start gap-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon aria-hidden className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-950">{item.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-600">{item.body}</span>
                    <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                      Open <ArrowRight aria-hidden className="h-3 w-3" />
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
            Complaints, suggestions, and compliments
          </h2>
          <p className="mt-3 text-base leading-8 text-slate-600">
            Use the dedicated feedback forms so each submission enters the correct
            official service workflow.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Megaphone, label: "Raise a complaint", body: "Submit a complaint through the official channel.", href: officialLinks.complaint },
              { icon: Sparkles, label: "Write a suggestion", body: "Send a suggestion for service improvement.", href: officialLinks.suggestion },
              { icon: ClipboardList, label: "Make a compliment", body: "Recognize positive service or provide a compliment.", href: officialLinks.compliment },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-[1.25rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon aria-hidden className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-[family-name:var(--font-display)] text-lg font-semibold text-slate-950">{item.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
                </a>
              );
            })}
          </div>
        </section>

        <div className="mt-10 rounded-[1.25rem] border border-blue-100 bg-blue-50/60 p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Handshake aria-hidden className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Open the customer care centre</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                All official service requests, tickets, feedback, and information
                requests are processed through the digital service centre.
              </p>
              <a
                href={officialLinks.customerCare}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-secondary"
              >
                Open customer care centre
                <ArrowRight aria-hidden className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </article>
    </PageShell>
  );
}
