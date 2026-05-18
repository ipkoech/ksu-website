import Link from "next/link";
import { Button, HomepageHeroFallback, ScrollReveal, LeaderMessage, type Leader } from "@ksu/ui/components";
import { CTA } from "@ksu/ui/layout/public";
import {
  MiniHeader,
  PublicHeader,
  PublicFooter,
  Announcements,
} from "@ksu/ui/layout/public";
import { getViceChancellor } from "@/lib/get-leadership";
import { getSchools, getActiveIntake } from "@/lib/get-academics";
import { AcademicSection } from "@/components/home/academic-section";

// Static data
const pillars = [
  {
    eyebrow: "Teaching",
    title: "Learning that transforms",
    body: "Rigorous programmes shaped by faculty expertise and market realities across eight schools.",
    href: "/academics",
    cta: "Explore academics",
  },
  {
    eyebrow: "Research",
    title: "Inquiry that matters",
    body: "Building a research culture around innovation, collaboration, and practical community impact.",
    href: "/research",
    cta: "See research",
  },
  {
    eyebrow: "Community",
    title: "Service beyond campus",
    body: "Extending learning through outreach, partnerships, and alumni networks across Kenya.",
    href: "/community",
    cta: "View community work",
  },
];

const featuredNews = [
  {
    title: "Kisii University expands health sciences training through regional partnerships",
    category: "Partnerships",
    date: "May 2026",
    href: "/news",
  },
  {
    title: "Student innovators present agriculture and climate solutions",
    category: "Innovation",
    date: "May 2026",
    href: "/news",
  },
  {
    title: "Faculty research forum spotlights community impact projects",
    category: "Research",
    date: "April 2026",
    href: "/news",
  },
];

const events = [
  {
    month: "JUN",
    day: "15",
    title: "Graduation Ceremony",
    location: "Main Campus",
    href: "/news",
  },
  {
    month: "JUN",
    day: "22",
    title: "Research Symposium",
    location: "Senate Hall",
    href: "/news",
  },
  {
    month: "JUL",
    day: "05",
    title: "Open Day",
    location: "All Campuses",
    href: "/news",
  },
];

const socialLinks = {
  facebook: "https://facebook.com/kisiiuniversity",
  twitter: "https://twitter.com/kisiiuniversity",
  instagram: "https://instagram.com/kisiiuniversity",
  youtube: "https://youtube.com/kisiiuniversity",
  linkedin: "https://linkedin.com/school/kisiiuniversity",
};

const contactInfo = {
  address: "P.O. Box 408-40200, Kisii",
  phone: "+254 XXX XXX XXX",
  email: "info@kisiiuniversity.ac.ke",
};

const announcements = [
  {
    id: "intake-2026",
    message: "September 2026 intake applications are now open!",
    linkText: "Apply Now",
    linkHref: "/admissions/how-to-apply",
    variant: "info" as const,
    dismissible: true,
  },
];

const quickLinks = [
  { title: "Apply Now", href: "/admissions/how-to-apply", icon: "arrow" },
  { title: "Programmes", href: "/academics/programmes", icon: "book" },
  { title: "Library", href: "https://library.kisiiuniversity.ac.ke", icon: "library" },
  { title: "E-Learning", href: "https://elearning.kisiiuniversity.ac.ke", icon: "laptop" },
  { title: "Student Portal", href: "https://portal.kisiiuniversity.ac.ke", icon: "user" },
  { title: "Contact Us", href: "/contact", icon: "mail" },
];

// Fallback Vice Chancellor data when API is unavailable
const fallbackVC: Leader = {
  id: "vc-fallback",
  name: "Prof. John Akama",
  title: "Vice Chancellor",
  image: null,
  message: "We are committed to producing graduates who are academically strong, ethically grounded, and ready to serve society with competence and character.",
  slug: "vice-chancellor",
};

const heroData = {
  tagline: "Inclusivity & Borderlessness",
  title: "Shape Your Future",
  subtitle: "A public university combining academic depth with practical ambition, preparing leaders for Kenya and beyond.",
  backgroundImageSrc: "/logos/ksu-bck5.jpg",
  primaryAction: {
    label: "Apply Now",
    href: "/admissions/how-to-apply",
  },
  secondaryAction: {
    label: "Explore Programmes",
    href: "/academics/programmes",
  },
};

export default async function HomePage() {
  // Fetch data from API in parallel
  const [vcData, schools, activeIntake] = await Promise.all([
    getViceChancellor(),
    getSchools(),
    getActiveIntake(),
  ]);
  const viceChancellor = vcData || fallbackVC;

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <Announcements announcements={announcements} />
      <MiniHeader contactInfo={contactInfo} socialLinks={socialLinks} />
      <PublicHeader transparent />

      <main>
        {/* Hero */}
        <section className="-mt-20">
          <HomepageHeroFallback {...heroData} />
        </section>

        {/* Bento Grid Section */}
        <section className="relative z-10 -mt-12 pb-8 sm:-mt-16 sm:pb-12 lg:-mt-20 lg:pb-16">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <ScrollReveal variant="fade-up">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:h-[320px]">
                {/* Column 1: Three Pillars - Hidden on mobile */}
                <div className="hidden lg:flex lg:flex-col gap-4">
                  {/* Top row: 2 pillars side by side */}
                  <div className="grid grid-cols-2 gap-4">
                    {pillars.slice(0, 2).map((pillar) => (
                      <Link
                        key={pillar.eyebrow}
                        href={pillar.href}
                        className="group flex flex-col rounded-2xl bg-white p-4 shadow-lg shadow-slate-200/50 transition-all hover:-translate-y-1 hover:shadow-xl"
                      >
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                          {pillar.eyebrow}
                        </span>
                        <h3 className="mt-2 text-sm font-bold leading-tight text-slate-950">
                          {pillar.title}
                        </h3>
                        <span className="mt-2 text-xs font-semibold text-primary group-hover:text-secondary">
                          {pillar.cta} →
                        </span>
                      </Link>
                    ))}
                  </div>
                  {/* Bottom row: 1 pillar full width */}
                  <Link
                    href={pillars[2].href}
                    className="group flex-1 flex flex-col justify-between rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-4 text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                        {pillars[2].eyebrow}
                      </span>
                      <h3 className="mt-1 text-base font-bold leading-tight">
                        {pillars[2].title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-blue-100 line-clamp-2">
                        {pillars[2].body}
                      </p>
                    </div>
                    <span className="mt-2 text-xs font-semibold text-white group-hover:text-secondary">
                      {pillars[2].cta} →
                    </span>
                  </Link>
                </div>

                {/* Column 2: VC Message - Always visible */}
                <LeaderMessage
                  leader={viceChancellor}
                  variant="card"
                  showImage={true}
                  showMessage={true}
                  messageLength="short"
                  linkHref="/about/leadership"
                  linkText="Read full message"
                  className="min-h-[240px] md:min-h-0"
                />

                {/* Column 3: Quick Links - Hidden on mobile, visible on tablet+ */}
                <div className="hidden md:flex flex-col rounded-2xl bg-white p-5 sm:p-6 shadow-lg">
                  <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                    Quick Links
                  </span>
                  <nav className="mt-3 sm:mt-4 flex flex-1 flex-col justify-between">
                    {quickLinks.map((link) => (
                      <Link
                        key={link.title}
                        href={link.href}
                        className="group flex items-center justify-between border-b border-slate-100 py-2.5 sm:py-3 last:border-0"
                      >
                        <span className="text-sm sm:text-base font-medium text-slate-700 transition-colors group-hover:text-primary">
                          {link.title}
                        </span>
                        <span className="text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-primary">
                          →
                        </span>
                      </Link>
                    ))}
                  </nav>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Academic Section - Schools, Admissions, Programme Categories */}
        <AcademicSection
          schools={schools}
          activeIntake={activeIntake}
        />

        {/* News & Events - Full Width Split */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-2">
              {/* News */}
              <div>
                <ScrollReveal>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-secondary">
                        Latest News
                      </p>
                      <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-slate-950">
                        What's Happening
                      </h2>
                    </div>
                    <Link href="/news" className="text-sm font-semibold text-primary hover:text-secondary">
                      View all →
                    </Link>
                  </div>
                </ScrollReveal>

                <div className="mt-8 space-y-6">
                  {featuredNews.map((story, index) => (
                    <ScrollReveal key={story.title} delay={index * 100}>
                      <article className="group">
                        <Link href={story.href} className="block">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            {story.category} • {story.date}
                          </p>
                          <h3 className="mt-2 text-lg font-semibold leading-snug text-slate-950 transition-colors group-hover:text-primary">
                            {story.title}
                          </h3>
                        </Link>
                        <div className="mt-4 h-px bg-slate-100" />
                      </article>
                    </ScrollReveal>
                  ))}
                </div>
              </div>

              {/* Events */}
              <div>
                <ScrollReveal>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-secondary">
                        Upcoming Events
                      </p>
                      <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-slate-950">
                        Mark Your Calendar
                      </h2>
                    </div>
                    <Link href="/events" className="text-sm font-semibold text-primary hover:text-secondary">
                      View all →
                    </Link>
                  </div>
                </ScrollReveal>

                <div className="mt-8 space-y-4">
                  {events.map((event, index) => (
                    <ScrollReveal key={event.title} delay={index * 100}>
                      <Link
                        href={event.href}
                        className="group flex items-center gap-6 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-primary/30 hover:shadow-md"
                      >
                        <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-slate-950 text-white">
                          <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                            {event.month}
                          </span>
                          <span className="text-2xl font-bold">{event.day}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-950 transition-colors group-hover:text-primary">
                            {event.title}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">{event.location}</p>
                        </div>
                      </Link>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <ScrollReveal>
          <CTA
            variant="banner"
            title="Ready to Start Your Journey?"
            description="Join thousands of students building their future at Kisii University."
            backgroundColor="gradient"
            actions={[
              { label: "Apply Now", href: "/admissions/how-to-apply" },
              { label: "Contact Us", href: "/contact", variant: "outline" },
            ]}
          />
        </ScrollReveal>
      </main>

      <PublicFooter />
    </div>
  );
}
