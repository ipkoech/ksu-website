"use client";

import { useEffect, useState } from "react";
import { CalendarDays, FileDown, X } from "lucide-react";
import Link from "next/link";
import { AdmissionsCountdown } from "@/components/home/admissions-countdown";
import type { HomepageHeroAdmissions, HomepageHeroAction } from "@/lib/homepage-sections";

export function AdmissionsPopover({ admissions }: { admissions: HomepageHeroAdmissions }) {
  const [open, setOpen] = useState(false);
  const letters = admissions.state === "admission_letters_available";
  const intakeName = admissions.intake?.name ?? "Current intake";

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open} className="absolute right-4 top-5 z-20 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/35 bg-primary/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white shadow-lg backdrop-blur-sm transition hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary sm:right-6 sm:top-8">
        <CalendarDays className="h-4 w-4 text-secondary" aria-hidden /> Admissions open
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="admissions-popover-title" className="relative w-full max-w-md rounded-2xl border border-white/15 bg-primary p-6 text-white shadow-2xl sm:p-8">
            <button type="button" onClick={() => setOpen(false)} aria-label="Close admissions update" className="absolute right-4 top-4 rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"><X className="h-5 w-5" aria-hidden /></button>
            <div className="flex items-start gap-3 border-b border-white/15 pb-5 pr-8">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-white">{letters ? <FileDown className="h-5 w-5" aria-hidden /> : <CalendarDays className="h-5 w-5" aria-hidden />}</span>
              <div><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/65">Admissions update</p><h2 id="admissions-popover-title" className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold">{intakeName}</h2></div>
            </div>
            {admissions.state === "applications_open" ? <div className="pt-5"><p className="text-center text-xs font-bold uppercase tracking-[0.14em] text-white/70">Applications close in</p>{admissions.countdown_target ? <div className="mt-4"><AdmissionsCountdown target={admissions.countdown_target} /></div> : null}{admissions.application_phase === "late" ? <p className="mt-4 rounded-lg bg-white/10 px-3 py-2 text-center text-xs font-semibold text-white/85">Late applications are currently being accepted.</p> : null}</div> : null}
            {letters ? <p className="pt-5 font-[family-name:var(--font-display)] text-xl font-semibold">Admission letters are available.</p> : null}
            {admissions.primary_action ? <ActionLink action={admissions.primary_action} prominent /> : null}
            <div className="mt-4 flex flex-col items-center gap-2">{admissions.secondary_actions?.slice(0, 2).map((action) => <ActionLink key={action.key ?? action.href} action={action} />)}</div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function ActionLink({ action, prominent = false }: { action: HomepageHeroAction; prominent?: boolean }) {
  return <Link href={action.href} target={action.open_in_new_tab ? "_blank" : undefined} rel={action.open_in_new_tab ? "noopener noreferrer" : undefined} className={prominent ? "mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary" : "inline-flex min-h-9 items-center justify-center px-3 py-1 text-sm font-semibold text-white/85 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"}>{action.label}</Link>;
}
