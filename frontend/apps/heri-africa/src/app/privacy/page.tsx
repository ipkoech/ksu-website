import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "../../components/motion/reveal";
import { SiteShell } from "../../components/site-shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How the HERI Africa Language Education Research Chair at Kisii University collects, uses and protects personal information.",
};

const sections = [
  {
    heading: "Information we collect",
    body: [
      "When you contact us or send a partnership enquiry, we collect the details you provide: your name, email address, telephone number, organisation, and the content of your message.",
      "The website itself does not require an account and does not collect personal information as you browse.",
    ],
  },
  {
    heading: "How we use it",
    body: [
      "We use submitted information only to respond to your enquiry, connect you with the right member of the research team, and share updates you have asked for.",
      "We do not sell personal information, and we do not use it for advertising.",
    ],
  },
  {
    heading: "Sharing",
    body: [
      "Enquiries are handled by the Chair's team at Kisii University. Where an enquiry concerns the wider HERI Africa initiative, we may share it with the relevant initiative partners so the right people can respond. We do not share your details with anyone else unless the law requires it.",
    ],
  },
  {
    heading: "Retention and security",
    body: [
      "We keep enquiry records only as long as needed to handle your request and maintain a record of our correspondence. Submissions are stored on Kisii University managed systems with access limited to the Chair's team.",
    ],
  },
  {
    heading: "Your rights",
    body: [
      "Under Kenya's Data Protection Act, 2019 you may ask us what personal data we hold about you, ask us to correct it, or ask us to delete it. Write to us at the address below and we will respond.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-4xl px-6 py-16 lg:py-20">
        <Reveal>
          <h1 className="text-5xl font-bold text-heri-blue">Privacy Policy</h1>
          <div className="mt-4 h-1 w-10 bg-heri-lime" />
          <p className="mt-6 text-lg leading-8 text-heri-ink/75">
            This policy explains how the HERI Africa Language Education Research
            Chair, hosted by Kisii University, handles personal information
            submitted through this website.
          </p>
        </Reveal>
        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <Reveal key={section.heading}>
              <section>
                <h2 className="text-2xl font-bold text-heri-blue">
                  {section.heading}
                </h2>
                {section.body.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 40)}
                    className="mt-3 text-base leading-7 text-slate-600"
                  >
                    {paragraph}
                  </p>
                ))}
              </section>
            </Reveal>
          ))}
          <Reveal>
            <section className="rounded-2xl bg-heri-cream/60 p-7">
              <h2 className="text-2xl font-bold text-heri-blue">Contact us</h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Questions about this policy or your data:{" "}
                <a
                  className="font-semibold text-heri-teal hover:text-heri-blue"
                  href="mailto:heri-language@kisiiuniversity.ac.ke"
                >
                  heri-language@kisiiuniversity.ac.ke
                </a>{" "}
                or HERI Africa Language Education Research Chair, Kisii
                University Main Campus, Nyanchwa, Kisii County, Kenya. You can
                also{" "}
                <Link
                  className="font-semibold text-heri-teal hover:text-heri-blue"
                  href="/partner-with-us#partnership-enquiry"
                >
                  use the enquiry form
                </Link>
                .
              </p>
            </section>
          </Reveal>
        </div>
      </main>
    </SiteShell>
  );
}
