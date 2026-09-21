"use client";

import { Banknote, BookOpen, GraduationCap, HandHeart, Landmark, Sprout } from "lucide-react";

export type DonationPriorityDto = { id: string; title: string; body: string; value: string; icon: "hand" | "book" | "graduation" | "landmark" | "sprout" | "banknote" };
const icons = { hand: HandHeart, book: BookOpen, graduation: GraduationCap, landmark: Landmark, sprout: Sprout, banknote: Banknote };

export function DonationPriorities({ priorities }: { priorities: DonationPriorityDto[] }) {
  return <div id="priorities" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6" data-server-data-display="research-donation-priorities">{priorities.map((priority, index) => { const Icon = icons[priority.icon]; return <a key={priority.id} href="#make-a-gift" className={index === 0 ? "rounded-lg border border-primary bg-primary/[0.04] p-4 shadow-sm" : "rounded-lg border border-border bg-white p-4 shadow-sm transition hover:border-primary/30"}><span className={index === 0 ? "inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary text-white" : "inline-flex h-10 w-10 items-center justify-center rounded-md bg-surface-muted text-primary"}><Icon aria-hidden className="h-5 w-5" /></span><h2 className="mt-3 text-base font-semibold leading-6 text-foreground">{priority.title}</h2><p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{priority.body}</p></a>; })}</div>;
}
