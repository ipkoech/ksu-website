import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  Twitter,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import { focusVisibleStyles } from "@ksu/ui/motion";
import { cn } from "@ksu/ui/lib/utils";
import { NewsletterSubscribeForm } from "@/components/home/newsletter-subscribe-form";
import { Reveal } from "@/components/home/motion-primitives";
import type { HomeContactInfo, HomeSocialLinks } from "@/lib/homepage-data";

const socialIcons: Array<{
  key: keyof HomeSocialLinks;
  label: string;
  Icon: LucideIcon;
}> = [
  { key: "facebook", label: "Facebook", Icon: Facebook },
  { key: "twitter", label: "X", Icon: Twitter },
  { key: "linkedin", label: "LinkedIn", Icon: Linkedin },
  { key: "youtube", label: "YouTube", Icon: Youtube },
  { key: "instagram", label: "Instagram", Icon: Instagram },
];

type NewsletterSignupBandProps = {
  contactInfo: HomeContactInfo;
  socialLinks: HomeSocialLinks;
};

/**
 * The newsletter/contact content without a section wrapper. This lets the
 * homepage place the signup at the end of its combined Life & Updates beat.
 */
export function NewsletterSignupBand({
  contactInfo,
  socialLinks,
}: NewsletterSignupBandProps) {
  const socials = socialIcons
    .map(({ key, label, Icon }) => ({ href: socialLinks[key], label, Icon }))
    .filter(
      (social): social is { href: string; label: string; Icon: LucideIcon } =>
        Boolean(social.href),
    );

  return (
    <div className="relative isolate overflow-hidden rounded-3xl bg-brand-overlay text-white">
      {/* A single wash of brand light across the band, and the dot field the
          approved design carries in the right margin. */}
      <div
        className="pointer-events-none absolute -left-32 top-1/2 -z-10 h-[34rem] w-[34rem] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.35),transparent_68%)]"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute -right-6 top-1/2 hidden h-44 w-72 -translate-y-1/2 opacity-25 lg:block"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(hsl(var(--gold)) 1.2px, transparent 1.2px)",
          backgroundSize: "12px 12px",
        }}
      />

      <div className="relative grid gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16 lg:px-10 lg:py-10">
        <Reveal className="min-w-0">
          <h2
            id="newsletter-heading"
            className="text-balance text-[clamp(1.75rem,1rem+1.8vw,2.5rem)] font-normal leading-[1.12]"
          >
            Stay connected to Kisii University
          </h2>
          <p className="mt-4 max-w-[46ch] text-white/70">
            News, events, research and campus stories delivered to your inbox.
          </p>
          <div className="mt-8 max-w-[36rem]">
            <NewsletterSubscribeForm variant="dark" />
          </div>
          <p className="ksu-l-small mt-2 text-white/45">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="min-w-0 lg:border-l lg:border-white/12 lg:pl-20">
          <h3 className="ksu-l-card font-normal">Talk to us directly</h3>
          <ul className="mt-5 space-y-1">
            <li className="min-w-0">
              <a
                href={`tel:${contactInfo.phone.replace(/\s+/g, "")}`}
                className={cn(
                  "group -mx-3 inline-flex min-h-11 items-center gap-3 rounded-lg px-3 text-white/80 transition-colors duration-300 hover:bg-white/5 hover:text-white",
                  focusVisibleStyles.white,
                )}
              >
                <Phone
                  className="h-4 w-4 shrink-0 text-secondary"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <span className="ksu-l-small min-w-0 truncate">
                  {contactInfo.phone}
                </span>
              </a>
            </li>
            <li className="min-w-0">
              <a
                href={`mailto:${contactInfo.email}`}
                className={cn(
                  "group -mx-3 inline-flex min-h-11 items-center gap-3 rounded-lg px-3 text-white/80 transition-colors duration-300 hover:bg-white/5 hover:text-white",
                  focusVisibleStyles.white,
                )}
              >
                <Mail
                  className="h-4 w-4 shrink-0 text-secondary"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <span className="ksu-l-small min-w-0 truncate">
                  {contactInfo.email}
                </span>
              </a>
            </li>
          </ul>

          {socials.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-2">
              {socials.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Kisii University on ${label}`}
                    className={cn(
                      "inline-flex h-11 w-11 items-center justify-center rounded-md bg-white/8 text-white ring-1 ring-white/12 transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-secondary hover:ring-secondary",
                      focusVisibleStyles.white,
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </Reveal>
      </div>
    </div>
  );
}

/**
 * The closing call to action. Kept as a compatibility wrapper for other
 * pages while the homepage embeds the same band in Life & Updates.
 */
export function NewsletterCtaSection(props: NewsletterSignupBandProps) {
  return (
    <section
      aria-labelledby="newsletter-heading"
      className="relative isolate overflow-hidden bg-brand-overlay text-white"
    >
      <div className="ksu-shell py-8 lg:py-10">
        <NewsletterSignupBand {...props} />
      </div>
    </section>
  );
}

export default NewsletterCtaSection;
