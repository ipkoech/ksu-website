import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "../../components/forms/contact-form";
import { SiteShell } from "../../components/site-shell";

export const revalidate = 300;

export default function ContactPage() {
  return (
    <SiteShell>
      <main className="bg-white">
        <section className="relative overflow-hidden bg-heri-ink text-white">
          <div className="absolute inset-0 bg-[linear-gradient(115deg,#003c39,#006b62_54%,#07302d)]" />
          <div className="relative mx-auto grid min-h-[390px] max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:px-10">
            <div>
              <p className="text-sm text-white/70">
                Home <span className="mx-2">/</span> Contact Us
              </p>
              <p className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-heri-lime">
                Connect with the research chair
              </p>
              <h1 className="mt-4 text-5xl font-bold leading-[1.02] sm:text-6xl">
                Connect With the
                <br />
                <span className="text-heri-lime">Research Chair</span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-white/85">
                We welcome your questions, collaboration ideas, media requests
                and partnership enquiries. Our team is here to support your
                engagement with HERI Africa.
              </p>
            </div>
            <div className="relative h-[270px] overflow-hidden rounded-t-[6rem] rounded-bl-[6rem]">
              <Image
                alt="HERI Africa researchers meeting"
                className="object-cover"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                src="/images/backgrounds/about-hero.jpg"
              />
            </div>
          </div>
        </section>
        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
          <div className="lg:pr-8">
            <div className="h-1 w-10 bg-heri-lime" />
            <h2 className="mt-4 text-4xl font-bold text-heri-blue">
              We’d Be Glad to
              <br />
              Hear From You
            </h2>
            <p className="mt-5 font-semibold text-heri-blue">
              HERI Africa Language Education Research Chair
            </p>
            <p className="mt-1 text-sm text-slate-600">Kisii University</p>
            <div className="mt-8 grid gap-6">
              <ContactItem icon={MapPin} title="Our Location">
                Kisii University Main Campus
                <br />
                Nyanchwa, Kisii County
                <br />
                Kenya
              </ContactItem>
              <ContactItem icon={Mail} title="Email">
                <a
                  className="hover:text-heri-teal"
                  href="mailto:heri-language@kisiiuniversity.ac.ke"
                >
                  heri-language@kisiiuniversity.ac.ke
                </a>
              </ContactItem>
              <ContactItem icon={Phone} title="Telephone">
                <a className="hover:text-heri-teal" href="tel:+254796123456">
                  +254 796 123 456
                </a>
              </ContactItem>
              <ContactItem icon={Clock3} title="Office Hours">
                Monday – Friday: 8:00 AM – 5:00 PM (EAT)
                <br />
                Closed on Saturdays, Sundays &amp; public holidays
              </ContactItem>
            </div>
            <div className="mt-8">
              <p className="text-sm font-bold text-heri-blue">
                Connect With Us
              </p>
              <div className="mt-3 flex gap-3">
                <Link
                  aria-label="Facebook"
                  className="grid size-10 place-items-center rounded-full border border-slate-300 text-sm font-bold text-heri-blue"
                  href="#"
                >
                  f
                </Link>
                <Link
                  aria-label="X"
                  className="grid size-10 place-items-center rounded-full border border-slate-300 text-sm font-bold text-heri-blue"
                  href="#"
                >
                  𝕏
                </Link>
                <Link
                  aria-label="LinkedIn"
                  className="grid size-10 place-items-center rounded-full border border-slate-300 text-sm font-bold text-heri-blue"
                  href="#"
                >
                  in
                </Link>
                <Link
                  aria-label="YouTube"
                  className="grid size-10 place-items-center rounded-full border border-slate-300 text-sm font-bold text-heri-blue"
                  href="#"
                >
                  ▶
                </Link>
              </div>
            </div>
          </div>
          <ContactForm />
        </section>
        <section className="border-t border-slate-200 px-6 py-14">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-center text-3xl font-bold text-heri-blue">
              Choose the Right Contact
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-600">
              To help us respond faster, please reach out through the most
              relevant channel.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                [
                  "General Enquiries",
                  "Questions about our work, programmes, collaborations or general information.",
                  "heri-language@kisiiuniversity.ac.ke",
                ],
                [
                  "Research & Media",
                  "Research partnerships, data requests, interviews and media enquiries.",
                  "research@kisiiuniversity.ac.ke",
                ],
                [
                  "Events & Opportunities",
                  "Event participation, speaking engagements and funding opportunities.",
                  "partnerships@kisiiuniversity.ac.ke",
                ],
              ].map(([title, text, email]) => (
                <article
                  className="border-slate-200 px-4 md:border-r md:last:border-0"
                  key={title}
                >
                  <Mail className="size-9 text-heri-lime" />
                  <h3 className="mt-4 text-xl font-bold text-heri-blue">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {text}
                  </p>
                  <a
                    className="mt-4 inline-block text-xs font-bold text-heri-teal"
                    href={`mailto:${email}`}
                  >
                    {email} →
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="mx-6 mb-14 overflow-hidden rounded-3xl border border-slate-200 md:mx-auto md:max-w-7xl">
          <div className="grid items-stretch lg:grid-cols-[0.65fr_1.35fr]">
            <div className="p-8 md:p-10">
              <h2 className="text-4xl font-bold text-heri-blue">
                Find Us at
                <br />
                Kisii University
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Our offices are located within the Main Campus in Nyanchwa. We
                look forward to welcoming you to our community.
              </p>
              <a
                className="mt-7 inline-flex rounded-lg bg-heri-lime px-5 py-3 text-xs font-bold text-heri-ink"
                href="https://maps.google.com/?q=Kisii+University"
                rel="noreferrer"
                target="_blank"
              >
                GET DIRECTIONS →
              </a>
            </div>
            <div className="relative min-h-[280px] bg-[#e6eed9]">
              <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(30deg,#fff_12%,transparent_12.5%,transparent_87%,#fff_87.5%,#fff),linear-gradient(150deg,#fff_12%,transparent_12.5%,transparent_87%,#fff_87.5%,#fff)] [background-size:70px_70px]" />
              <div className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-heri-blue text-white shadow-xl">
                <MapPin className="size-8" />
              </div>
              <span className="absolute left-1/2 top-[56%] -translate-x-1/2 rounded-lg bg-heri-blue px-4 py-2 text-xs font-bold text-white">
                Kisii University Main Campus
              </span>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}

function ContactItem({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof MapPin;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <Icon className="mt-1 size-7 shrink-0 text-heri-lime" />
      <div>
        <h3 className="font-bold text-heri-blue">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{children}</p>
      </div>
    </div>
  );
}
