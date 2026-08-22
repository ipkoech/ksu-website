"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import { focusVisibleStyles } from "@ksu/ui/motion";
import { PublicImage } from "@/components/public/public-image";
import type { HomeContactInfo } from "@/lib/homepage-data";

export function VisitUsSection({
  contactInfo,
}: {
  contactInfo: HomeContactInfo;
}) {
  const reducedMotion = useReducedMotion();

  const details = [
    { icon: MapPin, label: "Address", value: contactInfo.address },
    { icon: Phone, label: "Phone", value: contactInfo.phone },
    { icon: Mail, label: "Email", value: contactInfo.email },
    {
      icon: Clock,
      label: "Office hours",
      value: "Mon – Fri, 8:00 AM – 5:00 PM",
    },
  ].filter((item) => Boolean(item.value));

  return (
    <section
      aria-labelledby="visit-heading"
      className="border-b border-border bg-white py-16 lg:py-24"
    >
      <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          {/* Campus scene */}
          <motion.div
            initial={reducedMotion ? undefined : { opacity: 0, y: 24 }}
            whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-border">
              <PublicImage
                src="/logos/ksu-bck1.jpg"
                alt="Kisii University main campus"
                ratio="fill"
                className="absolute inset-0 h-full w-full"
                imageClassName="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </div>
          </motion.div>

          {/* The invitation */}
          <motion.div
            initial={reducedMotion ? undefined : { opacity: 0, y: 24 }}
            whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              Visit us
            </p>
            <h2
              id="visit-heading"
              className="mt-3 max-w-xl text-balance font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-primary sm:text-4xl"
            >
              Rooted in Kisii, open to the world
            </h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
              The university sits in the highlands of Kisii County, western
              Kenya. Come for a campus visit, an open day, or a conversation
              with admissions.
            </p>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              {details.map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                    <item.icon className="h-4 w-4" aria-hidden />
                  </span>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {item.label}
                    </dt>
                    <dd className="mt-0.5 text-sm font-medium text-foreground">
                      {item.value}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>

            <div className="mt-7 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 active:scale-[0.97]",
                  focusVisibleStyles.primary
                )}
              >
                Plan your visit
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/visitors"
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary transition hover:text-secondary",
                  focusVisibleStyles.primary
                )}
              >
                Visitor information
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default VisitUsSection;
