# Section 7: News & Events

## Overview
The News & Events section serves as the university's communication hub, keeping stakeholders informed about campus happenings, achievements, announcements, and upcoming events. This section balances timely updates with archival access.

## Design System Reference
- **Primary:** #2563EB (Blue)
- **Secondary:** #F97316 (Orange)
- **Foreground:** White
- **Typography:** System font stack, responsive scaling
- **Animations:** Framer Motion with 21st.dev components

---

## Routes

| Route | Description |
|-------|-------------|
| `/news` | News listing with filters and search |
| `/news/[slug]` | Individual news article |
| `/news/category/[category]` | News filtered by category |
| `/events` | Events calendar and listing |
| `/events/[slug]` | Event detail page |
| `/announcements` | Official university announcements |

---

## 7.1 News Listing Page

**Route:** `/news`

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ PublicHeader (solid)                                        │
├─────────────────────────────────────────────────────────────┤
│ Page Hero (compact)                                         │
│ "University News"                                           │
│ Breadcrumb: Home > News                                     │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Featured Article (large card)                           │ │
│ │ [Image                    ] Title                       │ │
│ │ [                         ] Excerpt...                  │ │
│ │ [                         ] Date | Category | Read →    │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Filters & Search                                            │
│ [Search...        ] [Category ▼] [Date Range ▼] [Clear]     │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│ │ NewsCard    │ │ NewsCard    │ │ NewsCard    │             │
│ │ [Image]     │ │ [Image]     │ │ [Image]     │             │
│ │ Title       │ │ Title       │ │ Title       │             │
│ │ Excerpt     │ │ Excerpt     │ │ Excerpt     │             │
│ │ Date | Cat  │ │ Date | Cat  │ │ Date | Cat  │             │
│ └─────────────┘ └─────────────┘ └─────────────┘             │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│ │ NewsCard    │ │ NewsCard    │ │ NewsCard    │             │
│ └─────────────┘ └─────────────┘ └─────────────┘             │
├─────────────────────────────────────────────────────────────┤
│ Pagination                                                  │
│ [← Prev] [1] [2] [3] ... [10] [Next →]                      │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────┐ ┌─────────────────────────────────┐ │
│ │ Categories          │ │ Newsletter Signup               │ │
│ │ • Academics (24)    │ │ Stay updated with university    │ │
│ │ • Research (18)     │ │ news delivered to your inbox    │ │
│ │ • Events (32)       │ │ [Email...        ] [Subscribe]  │ │
│ │ • Achievements (15) │ │                                 │ │
│ └─────────────────────┘ └─────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Footer                                                      │
└─────────────────────────────────────────────────────────────┘
```

### Data Model
```typescript
interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Rich text/HTML
  featuredImage: {
    url: string;
    alt: string;
    caption?: string;
  };
  category: NewsCategory;
  tags: string[];
  author: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  publishedAt: string;
  updatedAt?: string;
  isFeatured: boolean;
  relatedArticles?: string[]; // Article IDs
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
}

interface NewsCategory {
  id: string;
  slug: string;
  name: string;
  description?: string;
  articleCount: number;
}
```

### Components

#### NewsCard
```tsx
// src/components/news/news-card.tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

interface NewsCardProps {
  article: {
    slug: string;
    title: string;
    excerpt: string;
    featuredImage: { url: string; alt: string };
    category: { slug: string; name: string };
    publishedAt: string;
  };
  variant?: "default" | "featured" | "compact";
}

export function NewsCard({ article, variant = "default" }: NewsCardProps) {
  if (variant === "featured") {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative grid md:grid-cols-2 gap-6 bg-white rounded-xl overflow-hidden shadow-lg"
      >
        <div className="relative aspect-video md:aspect-auto">
          <Image
            src={article.featuredImage.url}
            alt={article.featuredImage.alt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-6 flex flex-col justify-center">
          <Badge variant="secondary" className="w-fit mb-4">
            {article.category.name}
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors">
            <Link href={`/news/${article.slug}`}>
              {article.title}
            </Link>
          </h2>
          <p className="text-gray-600 mb-4 line-clamp-3">
            {article.excerpt}
          </p>
          <div className="flex items-center justify-between mt-auto">
            <time className="text-sm text-gray-500">
              {formatDate(article.publishedAt)}
            </time>
            <Link
              href={`/news/${article.slug}`}
              className="flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
            >
              Read More <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.article>
    );
  }

  if (variant === "compact") {
    return (
      <motion.article
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="group flex gap-4 p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
      >
        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
          <Image
            src={article.featuredImage.url}
            alt={article.featuredImage.alt}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
            <Link href={`/news/${article.slug}`}>{article.title}</Link>
          </h3>
          <time className="text-sm text-gray-500">
            {formatDate(article.publishedAt)}
          </time>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
    >
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={article.featuredImage.url}
          alt={article.featuredImage.alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <Badge className="absolute top-4 left-4" variant="secondary">
          {article.category.name}
        </Badge>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          <Link href={`/news/${article.slug}`}>{article.title}</Link>
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{article.excerpt}</p>
        <div className="flex items-center justify-between">
          <time className="text-sm text-gray-500">
            {formatDate(article.publishedAt)}
          </time>
          <Link
            href={`/news/${article.slug}`}
            className="text-primary font-medium hover:underline"
          >
            Read More →
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
```

#### NewsFilters
```tsx
// src/components/news/news-filters.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface NewsFiltersProps {
  categories: { slug: string; name: string }[];
}

export function NewsFilters({ categories }: NewsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set("q", search);
    } else {
      params.delete("q");
    }
    params.delete("page");
    router.push(`/news?${params.toString()}`);
  };

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams);
    if (category && category !== "all") {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    params.delete("page");
    router.push(`/news?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch("");
    router.push("/news");
  };

  const hasActiveFilters = searchParams.has("q") || searchParams.has("category");

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-6 bg-gray-50 rounded-xl">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="search"
          placeholder="Search news..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="pl-10"
        />
      </div>
      <Select
        value={searchParams.get("category") || "all"}
        onValueChange={handleCategoryChange}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.slug} value={cat.slug}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={handleSearch}>Search</Button>
      {hasActiveFilters && (
        <Button variant="ghost" onClick={clearFilters}>
          <X className="w-4 h-4 mr-2" /> Clear
        </Button>
      )}
    </div>
  );
}
```

### API Endpoints
```
GET /api/news
  Query: page, limit, category, q (search), featured
  Response: { data: NewsArticle[], meta: { total, page, pages } }

GET /api/news/categories
  Response: { data: NewsCategory[] }

GET /api/news/[slug]
  Response: { data: NewsArticle }
```

---

## 7.2 News Article Detail

**Route:** `/news/[slug]`

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ PublicHeader (solid)                                        │
├─────────────────────────────────────────────────────────────┤
│ Breadcrumb: Home > News > Category > Article Title          │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Article Header                                          │ │
│ │ [Category Badge]                                        │ │
│ │ Article Title (h1)                                      │ │
│ │ Published: Jan 15, 2026 | Updated: Jan 16, 2026         │ │
│ │ Author: [Avatar] Name, Role                             │ │
│ │ Tags: [Research] [Innovation] [Grants]                  │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Featured Image (full width)                             │ │
│ │ [                                                     ] │ │
│ │ [                                                     ] │ │
│ │ Caption: Image description...                           │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────┐ ┌─────────────────────┐ │
│ │ Article Content                 │ │ Sidebar             │ │
│ │                                 │ │                     │ │
│ │ Rich text content with         │ │ Share               │ │
│ │ paragraphs, images, quotes,    │ │ [FB] [TW] [LI] [📋] │ │
│ │ lists, embedded media...       │ │                     │ │
│ │                                 │ │ ─────────────────── │ │
│ │                                 │ │ Related Articles    │ │
│ │                                 │ │ • Article 1         │ │
│ │                                 │ │ • Article 2         │ │
│ │                                 │ │ • Article 3         │ │
│ │                                 │ │                     │ │
│ │                                 │ │ ─────────────────── │ │
│ │ ─────────────────────────────── │ │ Categories          │ │
│ │ Attachments                     │ │ • Academics         │ │
│ │ [📄 Document.pdf] [Download]   │ │ • Research          │ │
│ │ [📄 Report.docx] [Download]    │ │ • Events            │ │
│ └─────────────────────────────────┘ └─────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ More News                                                   │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│ │ NewsCard    │ │ NewsCard    │ │ NewsCard    │             │
│ └─────────────┘ └─────────────┘ └─────────────┘             │
├─────────────────────────────────────────────────────────────┤
│ Footer                                                      │
└─────────────────────────────────────────────────────────────┘
```

### Components

#### ArticleContent
```tsx
// src/components/news/article-content.tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface ArticleContentProps {
  content: string;
  featuredImage: {
    url: string;
    alt: string;
    caption?: string;
  };
}

export function ArticleContent({ content, featuredImage }: ArticleContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Featured Image */}
      <figure className="mb-8">
        <div className="relative aspect-video rounded-xl overflow-hidden">
          <Image
            src={featuredImage.url}
            alt={featuredImage.alt}
            fill
            className="object-cover"
            priority
          />
        </div>
        {featuredImage.caption && (
          <figcaption className="mt-2 text-sm text-gray-500 text-center">
            {featuredImage.caption}
          </figcaption>
        )}
      </figure>

      {/* Article Body */}
      <div
        className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-primary"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </motion.div>
  );
}
```

#### ShareButtons
```tsx
// src/components/news/share-buttons.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Facebook, Twitter, Linkedin, Link2, Check } from "lucide-react";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "Twitter",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ];

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {shareLinks.map((link) => (
        <Button
          key={link.name}
          variant="outline"
          size="icon"
          asChild
        >
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${link.name}`}
          >
            <link.icon className="w-4 h-4" />
          </a>
        </Button>
      ))}
      <Button variant="outline" size="icon" onClick={copyToClipboard}>
        {copied ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <Link2 className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}
```

---

## 7.3 Events Calendar

**Route:** `/events`

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ PublicHeader (solid)                                        │
├─────────────────────────────────────────────────────────────┤
│ Page Hero (compact)                                         │
│ "University Events"                                         │
│ Breadcrumb: Home > Events                                   │
├─────────────────────────────────────────────────────────────┤
│ View Toggle                                                 │
│ [Calendar View] [List View]    [Month ◀ May 2026 ▶]         │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Calendar Grid (Month View)                              │ │
│ │ Sun   Mon   Tue   Wed   Thu   Fri   Sat                 │ │
│ │ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐               │ │
│ │ │ 1 │ │ 2 │ │ 3 │ │ 4 │ │ 5 │ │ 6 │ │ 7 │               │ │
│ │ │   │ │ • │ │   │ │ • │ │   │ │ • │ │   │               │ │
│ │ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘               │ │
│ │ ... (full month grid with event indicators)             │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Upcoming Events (List below calendar)                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ MAY  │ Event Title                                      │ │
│ │  14  │ Description excerpt...                           │ │
│ │ Wed  │ 🕐 9:00 AM - 4:00 PM  📍 Main Campus Hall       │ │
│ │      │ [Academic] [Public]                  [Details →] │ │
│ ├──────┼──────────────────────────────────────────────────┤ │
│ │ MAY  │ Event Title                                      │ │
│ │  18  │ Description excerpt...                           │ │
│ │ Sun  │ 🕐 2:00 PM  📍 Sports Complex                   │ │
│ └──────┴──────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Event Categories                                            │
│ [All] [Academic] [Cultural] [Sports] [Workshops] [Public]   │
├─────────────────────────────────────────────────────────────┤
│ Footer                                                      │
└─────────────────────────────────────────────────────────────┘
```

### Data Model
```typescript
interface Event {
  id: string;
  slug: string;
  title: string;
  description: string;
  content?: string; // Rich text for detail page
  featuredImage?: {
    url: string;
    alt: string;
  };
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  isAllDay: boolean;
  location: {
    name: string;
    address?: string;
    mapUrl?: string;
  };
  category: EventCategory;
  tags: string[];
  organizer?: {
    name: string;
    department?: string;
    contact?: string;
  };
  registrationUrl?: string;
  registrationDeadline?: string;
  isFeatured: boolean;
  attachments?: {
    name: string;
    url: string;
  }[];
}

interface EventCategory {
  id: string;
  slug: string;
  name: string;
  color: string; // For calendar dots
}
```

### Components

#### EventsCalendar
```tsx
// src/components/events/events-calendar.tsx
"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventsCalendarProps {
  events: {
    id: string;
    slug: string;
    title: string;
    startDate: string;
    category: { color: string };
  }[];
  onDateSelect?: (date: Date) => void;
}

export function EventsCalendar({ events, onDateSelect }: EventsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const eventsByDate = useMemo(() => {
    const map = new Map<string, typeof events>();
    events.forEach((event) => {
      const dateKey = new Date(event.startDate).toDateString();
      const existing = map.get(dateKey) || [];
      map.set(dateKey, [...existing, event]);
    });
    return map;
  }, [events]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-24" />);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateKey = date.toDateString();
    const dayEvents = eventsByDate.get(dateKey) || [];
    const isToday = new Date().toDateString() === dateKey;

    days.push(
      <motion.button
        key={day}
        whileHover={{ scale: 1.02 }}
        onClick={() => onDateSelect?.(date)}
        className={cn(
          "h-24 p-2 border border-gray-100 text-left hover:bg-gray-50 transition-colors",
          isToday && "bg-primary/5 border-primary"
        )}
      >
        <span className={cn(
          "text-sm font-medium",
          isToday && "text-primary"
        )}>
          {day}
        </span>
        <div className="mt-1 space-y-1">
          {dayEvents.slice(0, 2).map((event) => (
            <div
              key={event.id}
              className="text-xs truncate px-1 py-0.5 rounded"
              style={{ backgroundColor: `${event.category.color}20`, color: event.category.color }}
            >
              {event.title}
            </div>
          ))}
          {dayEvents.length > 2 && (
            <div className="text-xs text-gray-500">
              +{dayEvents.length - 2} more
            </div>
          )}
        </div>
      </motion.button>
    );
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="icon" onClick={prevMonth}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold">
          {monthNames[month]} {year}
        </h2>
        <Button variant="ghost" size="icon" onClick={nextMonth}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${month}-${year}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="grid grid-cols-7"
        >
          {days}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
```

#### EventCard
```tsx
// src/components/events/event-card.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";

interface EventCardProps {
  event: {
    slug: string;
    title: string;
    description: string;
    startDate: string;
    startTime?: string;
    endTime?: string;
    location: { name: string };
    category: { name: string; color: string };
    tags: string[];
  };
}

export function EventCard({ event }: EventCardProps) {
  const date = new Date(event.startDate);
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex gap-6 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
    >
      {/* Date Block */}
      <div className="flex-shrink-0 w-20 text-center">
        <div className="text-sm font-medium text-primary">{month}</div>
        <div className="text-3xl font-bold text-gray-900">{day}</div>
        <div className="text-sm text-gray-500">{weekday}</div>
      </div>

      {/* Event Details */}
      <div className="flex-1 min-w-0">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          <Link href={`/events/${event.slug}`} className="hover:text-primary transition-colors">
            {event.title}
          </Link>
        </h3>
        <p className="text-gray-600 mb-3 line-clamp-2">{event.description}</p>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
          {event.startTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {event.startTime}
              {event.endTime && ` - ${event.endTime}`}
            </div>
          )}
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {event.location.name}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge style={{ backgroundColor: event.category.color }}>
            {event.category.name}
          </Badge>
          {event.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline">{tag}</Badge>
          ))}
        </div>
      </div>

      {/* Action */}
      <div className="flex-shrink-0 self-center">
        <Link
          href={`/events/${event.slug}`}
          className="text-primary font-medium hover:underline"
        >
          Details →
        </Link>
      </div>
    </motion.article>
  );
}
```

### API Endpoints
```
GET /api/events
  Query: month, year, category, upcoming (boolean), featured
  Response: { data: Event[], meta: { total } }

GET /api/events/categories
  Response: { data: EventCategory[] }

GET /api/events/[slug]
  Response: { data: Event }
```

---

## 7.4 Event Detail Page

**Route:** `/events/[slug]`

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ PublicHeader (solid)                                        │
├─────────────────────────────────────────────────────────────┤
│ Breadcrumb: Home > Events > Event Title                     │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Featured Image (if available)                           │ │
│ │ [                                                     ] │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────┐ ┌─────────────────────┐ │
│ │ Event Details                   │ │ Event Info Card     │ │
│ │ [Category Badge]                │ │ ┌─────────────────┐ │ │
│ │ Event Title (h1)                │ │ │ 📅 May 14, 2026 │ │ │
│ │                                 │ │ │ 🕐 9AM - 4PM    │ │ │
│ │ Description and content...     │ │ │ 📍 Main Hall    │ │ │
│ │                                 │ │ │    Campus Map → │ │ │
│ │                                 │ │ ├─────────────────┤ │ │
│ │                                 │ │ │ Organizer       │ │ │
│ │                                 │ │ │ Events Office   │ │ │
│ │                                 │ │ │ 📧 Contact      │ │ │
│ │                                 │ │ ├─────────────────┤ │ │
│ │                                 │ │ │ [Register Now]  │ │ │
│ │                                 │ │ │ Deadline: May 10│ │ │
│ │ ─────────────────────────────── │ │ ├─────────────────┤ │ │
│ │ Attachments                     │ │ │ Add to Calendar │ │ │
│ │ [📄 Agenda.pdf]                │ │ │ [Google] [iCal] │ │ │
│ └─────────────────────────────────┘ └─────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Related Events                                              │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐       │
│ │ EventCard     │ │ EventCard     │ │ EventCard     │       │
│ └───────────────┘ └───────────────┘ └───────────────┘       │
├─────────────────────────────────────────────────────────────┤
│ Footer                                                      │
└─────────────────────────────────────────────────────────────┘
```

### Components

#### AddToCalendar
```tsx
// src/components/events/add-to-calendar.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "lucide-react";

interface AddToCalendarProps {
  event: {
    title: string;
    description: string;
    startDate: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    location: { name: string; address?: string };
  };
}

export function AddToCalendar({ event }: AddToCalendarProps) {
  const formatGoogleDate = (date: string, time?: string) => {
    const d = new Date(date);
    if (time) {
      const [hours, minutes] = time.split(":");
      d.setHours(parseInt(hours), parseInt(minutes));
    }
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const googleCalendarUrl = () => {
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: event.title,
      details: event.description,
      location: [event.location.name, event.location.address].filter(Boolean).join(", "),
      dates: `${formatGoogleDate(event.startDate, event.startTime)}/${formatGoogleDate(event.endDate || event.startDate, event.endTime || event.startTime)}`,
    });
    return `https://calendar.google.com/calendar/render?${params}`;
  };

  const generateICS = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location.name}
DTSTART:${formatGoogleDate(event.startDate, event.startTime)}
DTEND:${formatGoogleDate(event.endDate || event.startDate, event.endTime || event.startTime)}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.title.replace(/\s+/g, "-")}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full">
          <Calendar className="w-4 h-4 mr-2" />
          Add to Calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <a href={googleCalendarUrl()} target="_blank" rel="noopener noreferrer">
            Google Calendar
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={generateICS}>
          Download .ics (Apple/Outlook)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## 7.5 Announcements Page

**Route:** `/announcements`

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ PublicHeader (solid)                                        │
├─────────────────────────────────────────────────────────────┤
│ Page Hero (compact)                                         │
│ "Official Announcements"                                    │
│ Breadcrumb: Home > Announcements                            │
├─────────────────────────────────────────────────────────────┤
│ Filter Tabs                                                 │
│ [All] [Academic] [Administrative] [Student Affairs] [Urgent]│
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔴 URGENT                                              │ │
│ │ Announcement Title                                      │ │
│ │ Brief description of the announcement...                │ │
│ │ Posted: May 14, 2026 | Academic Affairs                 │ │
│ │ [Read Full Announcement]                                │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Announcement Title                                      │ │
│ │ Brief description of the announcement...                │ │
│ │ Posted: May 13, 2026 | Registrar                        │ │
│ │ [Read Full Announcement]                                │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Announcement Title                                      │ │
│ │ Brief description of the announcement...                │ │
│ │ Posted: May 12, 2026 | Finance                          │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Pagination                                                  │
├─────────────────────────────────────────────────────────────┤
│ Footer                                                      │
└─────────────────────────────────────────────────────────────┘
```

### Data Model
```typescript
interface Announcement {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: "academic" | "administrative" | "student-affairs" | "general";
  isUrgent: boolean;
  publishedAt: string;
  expiresAt?: string;
  department: {
    id: string;
    name: string;
  };
  attachments?: {
    name: string;
    url: string;
  }[];
}
```

### Components

#### AnnouncementCard
```tsx
// src/components/news/announcement-card.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface AnnouncementCardProps {
  announcement: {
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    isUrgent: boolean;
    publishedAt: string;
    department: { name: string };
  };
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "p-6 bg-white rounded-xl border-l-4 shadow-sm hover:shadow-md transition-shadow",
        announcement.isUrgent ? "border-l-red-500" : "border-l-primary"
      )}
    >
      {announcement.isUrgent && (
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-semibold uppercase">Urgent</span>
        </div>
      )}
      
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        <Link href={`/announcements/${announcement.slug}`} className="hover:text-primary transition-colors">
          {announcement.title}
        </Link>
      </h3>
      
      <p className="text-gray-600 mb-4 line-clamp-2">{announcement.excerpt}</p>
      
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="text-gray-500">
          Posted: {formatDate(announcement.publishedAt)}
        </span>
        <Badge variant="outline">{announcement.department.name}</Badge>
        <Link
          href={`/announcements/${announcement.slug}`}
          className="ml-auto text-primary font-medium hover:underline"
        >
          Read Full Announcement
        </Link>
      </div>
    </motion.article>
  );
}
```

### API Endpoints
```
GET /api/announcements
  Query: page, limit, category, urgent (boolean)
  Response: { data: Announcement[], meta: { total, page, pages } }

GET /api/announcements/[slug]
  Response: { data: Announcement }
```

---

## Responsive Behavior

### Mobile (< 768px)
- News cards stack vertically (1 column)
- Featured article image stacks above content
- Calendar switches to list view by default
- Event cards stack date block above details
- Full-width filter dropdowns
- Sticky back-to-top button

### Tablet (768px - 1024px)
- News grid: 2 columns
- Calendar shows week view option
- Event cards maintain horizontal layout
- Sidebar content moves below main content

### Desktop (> 1024px)
- News grid: 3 columns
- Full month calendar view
- Side-by-side article content and sidebar
- Sticky sidebar on article pages

---

## SEO Considerations

### Meta Tags
```tsx
// app/news/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const article = await getNewsArticle(params.slug);
  
  return {
    title: `${article.title} | Kisii University News`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [article.featuredImage.url],
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.author.name],
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}
```

### Structured Data
```tsx
// JSON-LD for news articles
const articleSchema = {
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  headline: article.title,
  image: article.featuredImage.url,
  datePublished: article.publishedAt,
  dateModified: article.updatedAt,
  author: {
    "@type": "Person",
    name: article.author.name,
  },
  publisher: {
    "@type": "Organization",
    name: "Kisii University",
    logo: {
      "@type": "ImageObject",
      url: "https://kisiiuniversity.ac.ke/logo.png",
    },
  },
};

// JSON-LD for events
const eventSchema = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: event.title,
  description: event.description,
  startDate: event.startDate,
  endDate: event.endDate,
  location: {
    "@type": "Place",
    name: event.location.name,
    address: event.location.address,
  },
  organizer: {
    "@type": "Organization",
    name: "Kisii University",
  },
};
```

---

## Implementation Checklist

- [ ] News listing page with filters and pagination
- [ ] NewsCard component (default, featured, compact variants)
- [ ] NewsFilters component with search and category
- [ ] News article detail page
- [ ] ArticleContent component with rich text rendering
- [ ] ShareButtons component
- [ ] News category pages
- [ ] Events calendar page
- [ ] EventsCalendar component with month navigation
- [ ] EventCard component
- [ ] View toggle (calendar/list)
- [ ] Event detail page
- [ ] AddToCalendar component (Google, iCal)
- [ ] Event registration link integration
- [ ] Announcements listing page
- [ ] AnnouncementCard component (urgent styling)
- [ ] Announcement detail page
- [ ] RSS feed for news
- [ ] SEO meta tags and structured data
- [ ] Responsive layouts for all breakpoints
- [ ] Loading skeletons for async content
- [ ] Error boundaries and fallback states
