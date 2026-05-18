# Landing Page — Implementation Prompt

## Overview

The homepage is the main entry point to Kisii University's digital presence. It should be **60% marketing** (emotional, aspirational) and **40% academic** (data-driven, informative), showcasing the university's three pillars: Teaching, Research, and Community Service.

---

## Route

```
/                     # Homepage
```

---

## Page Sections (In Order)

### 1. Hero Slider

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  [Full-width background image/video]                            │
│                                                                  │
│         Welcome to Kisii University                             │
│         (Playfair Display, 48-60px)                             │
│                                                                  │
│         Transforming Lives Through Education,                   │
│         Research, and Community Service                         │
│         (Inter, 18-20px, muted)                                 │
│                                                                  │
│         [Explore Programmes]  [Apply Now]                       │
│                                                                  │
│                              ○ ○ ● ○ ○                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Implementation:**
- Use 21st.dev hero component as base
- Dynamic content from `GET /sliders?active=true`
- Static fallback if no sliders configured
- Auto-advance every 6 seconds
- Pause on hover
- Framer Motion transitions between slides
- Mobile: Stack text, reduce font sizes

**Data Source:** `GET /sliders?group=homepage`

---

### 2. Quick Stats

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌───────────┬───────────┬───────────┬───────────┬───────────┐ │
│  │  15,000+  │   500+    │   100+    │     8     │   50+     │ │
│  │ Students  │  Faculty  │ Programmes│  Schools  │ Partners  │ │
│  └───────────┴───────────┴───────────┴───────────┴───────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Implementation:**
- AnimatedCounter component with Framer Motion
- Count up from 0 to target value on scroll into view
- Stagger animation (100ms delay between each)
- Use `useInView` hook to trigger animation
- Mobile: 2x3 grid or horizontal scroll

**Data Source:** Static or `GET /university-info`

---

### 3. Schools Grid

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Our Schools                                                     │
│  World-class education across 8 faculties                       │
│                                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐  │
│  │ [Cover Img] │ │ [Cover Img] │ │ [Cover Img] │ │[Cover]   │  │
│  │             │ │             │ │             │ │          │  │
│  │ School of   │ │ School of   │ │ School of   │ │School of │  │
│  │ Business    │ │ Education   │ │ IT          │ │Law       │  │
│  │ 12 Programmes│ │ 8 Programmes│ │15 Programmes│ │5 Progs   │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘  │
│  (... row 2)                                                    │
│                              [View All Schools →]               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Implementation:**
- Grid: 1 col mobile, 2 col tablet, 4 col desktop
- StaggerContainer for entrance animation
- Card hover: `scale(1.02)`, `shadow-lg`
- Cover image with aspect-ratio 4:3
- Links to `/academics/schools/[slug]`

**Data Source:** `GET /schools`

---

### 4. Admissions CTA

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Ready to Join Kisii University?                                │
│                                                                  │
│  ┌────────────────────────────┐ ┌────────────────────────────┐ │
│  │                            │ │                            │ │
│  │    KUCCPS PLACEMENT        │ │    SELF-SPONSORED          │ │
│  │                            │ │                            │ │
│  │    Government-sponsored    │ │    Direct application      │ │
│  │    placement for KCSE      │ │    for all qualifications  │ │
│  │    graduates               │ │                            │ │
│  │                            │ │    Deadline: Aug 15, 2026  │ │
│  │    [Apply via KUCCPS →]    │ │    [Apply Now →]           │ │
│  │                            │ │                            │ │
│  └────────────────────────────┘ └────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Implementation:**
- Show/hide cards based on intake status
- Conditional rendering: if `intake.status === 'open'`
- Urgency indicators (days remaining)
- Mobile: Stack vertically

**Data Source:** `GET /intakes?active=true`

---

### 5. Research Highlights

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Research & Innovation                                           │
│  Driving solutions for real-world challenges                    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ [Carousel]                                                   ││
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ →           ││
│  │ │ [Image]     │ │ [Image]     │ │ [Image]     │             ││
│  │ │ Title       │ │ Title       │ │ Title       │             ││
│  │ │ School      │ │ School      │ │ School      │             ││
│  │ └─────────────┘ └─────────────┘ └─────────────┘             ││
│  └─────────────────────────────────────────────────────────────┘│
│                              [Explore Research →]               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Implementation:**
- Carousel with 3 visible items (desktop), 1 (mobile)
- Swipe support on mobile
- If no API data, show static highlights
- Link to Research Service

**Data Source:** `GET /research/highlights` or static

---

### 6. Events Calendar

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Upcoming Events                                                 │
│                                                                  │
│  ┌────────────────────────┬────────────────────────────────────┐│
│  │      MAY 2026          │  ┌──────────────────────────────┐  ││
│  │    ◀ ─────── ▶         │  │ MAY 15                       │  ││
│  │                        │  │ 🎓 Graduation Ceremony       │  ││
│  │  Mo Tu We Th Fr Sa Su  │  │ 9:00 AM • Main Campus        │  ││
│  │         1  2  3  4  5  │  │ [View Details]               │  ││
│  │   6  7  8  9 10 11 12  │  └──────────────────────────────┘  ││
│  │  13 14 [15]16 17 18 19 │  ┌──────────────────────────────┐  ││
│  │  20 21 22 23 24 25 26  │  │ MAY 22                       │  ││
│  │  27 28 29 30 31        │  │ 🔬 Research Symposium        │  ││
│  │  ● = Event day         │  └──────────────────────────────┘  ││
│  └────────────────────────┴────────────────────────────────────┘│
│                              [View All Events →]                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Implementation:**
- Split layout: Calendar left, Events list right
- Highlight dates with events
- Click date to filter events
- Mobile: Stack vertically, list view first

**Data Source:** `GET /events?upcoming=true&limit=10`

---

### 7. Student Life

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Campus Life                                                     │
│  More than just academics                                        │
│                                                                  │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐          │
│  │ [Image]       │ │ [Image]       │ │ [Image]       │          │
│  │               │ │               │ │               │          │
│  │ Clubs &       │ │ Sports &      │ │ Accommodation │          │
│  │ Societies     │ │ Recreation    │ │               │          │
│  │ 40+ clubs     │ │ Modern        │ │ On-campus     │          │
│  │ to join       │ │ facilities    │ │ hostels       │          │
│  └───────────────┘ └───────────────┘ └───────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Implementation:**
- Static cards (content rarely changes)
- Hover: Image zoom, overlay appears
- Links to respective campus life pages

**Data Source:** Static

---

### 8. Partners Marquee

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Our Partners                                                    │
│                                                                  │
│  ← [Logo][Logo][Logo][Logo][Logo][Logo][Logo][Logo][Logo] ←     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Implementation:**
- Infinite horizontal scroll (CSS keyframes)
- Duplicate logo set for seamless loop
- 30-40 second full cycle
- Pause on hover
- Grayscale → Color on hover
- Mobile: Same behavior, smaller logos

**Data Source:** `GET /partners` or static

**Component:**
```tsx
"use client";

import { motion } from "framer-motion";

export function InfiniteMarquee({ children, speed = 30 }) {
  return (
    <div className="overflow-hidden">
      <motion.div
        className="flex gap-8"
        animate={{ x: [0, "-50%"] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: speed,
            ease: "linear",
          },
        }}
        whileHover={{ animationPlayState: "paused" }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}
```

---

### 9. Testimonials

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  What Our Community Says                                         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  "Kisii University gave me the foundation I needed to       ││
│  │   succeed in my career. The lecturers were dedicated        ││
│  │   and the environment was conducive for learning."          ││
│  │                                                              ││
│  │  ┌─────┐  John Doe                                          ││
│  │  │Photo│  Class of 2020                                     ││
│  │  └─────┘  Software Engineer, Google                         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                            ◀  ● ○ ○ ○  ▶        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Implementation:**
- Carousel with auto-play
- Swipe support
- Dot indicators
- Framer Motion transitions

**Data Source:** `GET /testimonials?is_featured=true`

---

### 10. Newsletter

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Stay Updated                                                    │
│  Subscribe to our newsletter for the latest news and updates    │
│                                                                  │
│  ┌─────────────────────────────────────────┐ ┌───────────────┐  │
│  │ Enter your email                        │ │ Subscribe     │  │
│  └─────────────────────────────────────────┘ └───────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Implementation:**
- Email validation with Zod
- Success/error states
- Rate limiting on submit

---

## Components Required

```
components/
├── sections/
│   ├── HeroSlider.tsx
│   ├── QuickStats.tsx
│   ├── SchoolsGrid.tsx
│   ├── AdmissionsCTA.tsx
│   ├── ResearchHighlights.tsx
│   ├── EventsCalendar.tsx
│   ├── StudentLife.tsx
│   ├── PartnersMarquee.tsx
│   ├── Testimonials.tsx
│   └── Newsletter.tsx
│
├── ui/
│   ├── AnimatedCounter.tsx
│   ├── InfiniteMarquee.tsx
│   └── CalendarWidget.tsx
│
└── cards/
    ├── SchoolCard.tsx
    ├── EventCard.tsx
    └── TestimonialCard.tsx
```

---

## Data Fetching Pattern

```tsx
// app/(site)/page.tsx (Server Component)
export default async function HomePage() {
  const [schools, events, sliders, testimonials, intakes] = await Promise.all([
    getSchools(),
    getUpcomingEvents(10),
    getSliders("homepage"),
    getFeaturedTestimonials(),
    getActiveIntakes(),
  ]);

  return (
    <HomePageClient
      schools={schools}
      events={events}
      sliders={sliders}
      testimonials={testimonials}
      intakes={intakes}
    />
  );
}

// components/sections/HomePageClient.tsx (Client Component)
"use client";

export function HomePageClient({ schools, events, ... }) {
  return (
    <>
      <HeroSlider slides={sliders} />
      <QuickStats />
      <SchoolsGrid schools={schools} />
      {/* ... */}
    </>
  );
}
```

---

## Responsive Breakpoints

| Section | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Hero | Full width, stacked text | Same | Same with larger text |
| Stats | 2x3 grid | 3x2 grid | 5 columns |
| Schools | 1 column | 2 columns | 4 columns |
| Events | List only | Split view | Split view |
| Partners | Smaller logos | Same | Same |

---

## Animation Summary

| Section | Animation |
|---------|-----------|
| Hero | Fade/slide transitions between slides |
| Stats | Count up on scroll into view |
| Schools | Staggered fade-in |
| Events | Fade in |
| Partners | Infinite horizontal scroll |
| Testimonials | Slide transition |

---

## SEO

```tsx
export const metadata: Metadata = {
  title: "Kisii University - Excellence in Education, Research & Innovation",
  description: "Kisii University is a leading public university in Kenya offering undergraduate, postgraduate, and doctoral programmes across 8 schools.",
  keywords: ["Kisii University", "KSU", "Kenya university", "higher education"],
  openGraph: {
    title: "Kisii University",
    description: "Transforming Lives Through Education, Research, and Community Service",
    images: ["/og-image.jpg"],
  },
};
```

---

## Checklist

- [ ] HeroSlider with dynamic/static fallback
- [ ] AnimatedCounter component
- [ ] SchoolsGrid with stagger animation
- [ ] AdmissionsCTA with conditional display
- [ ] EventsCalendar with interactive calendar
- [ ] InfiniteMarquee for partners
- [ ] Testimonials carousel
- [ ] Newsletter form with validation
- [ ] All sections responsive
- [ ] All animations respect `prefers-reduced-motion`
