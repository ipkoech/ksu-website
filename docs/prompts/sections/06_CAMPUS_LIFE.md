# Campus Life Section — Implementation Prompt

## Overview

The Campus Life section showcases the student experience beyond academics — clubs, sports, accommodation, student support, and campus activities. This section is marketing-focused, designed to attract prospective students.

---

## Routes

```
/campus-life                         # Campus life landing
├── /campus-life/student-life        # Student experience overview
├── /campus-life/clubs               # Clubs & societies listing
│   └── /campus-life/clubs/[slug]    # Club detail page
├── /campus-life/sports              # Sports & recreation
│   └── /campus-life/sports/[slug]   # Sport/facility detail
├── /campus-life/accommodation       # Hostels & housing
├── /campus-life/support             # Student support services
│   ├── /campus-life/support/counseling
│   ├── /campus-life/support/health
│   └── /campus-life/support/disability
└── /campus-life/gallery             # Photo/video gallery
    ├── /campus-life/gallery/photos
    │   └── /[album]
    └── /campus-life/gallery/videos
```

---

## Navigation

```
Campus Life (Dropdown):
├── Student Life
├── Clubs & Societies
├── Sports & Recreation
├── Accommodation
├── Student Support
└── Gallery
```

---

## Page Specifications

### Campus Life Landing Page

```
┌─────────────────────────────────────────────────────────────────┐
│ CAMPUS LIFE                                                      │
│ More than just academics                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ [Hero Image - Students on campus]                           ││
│  │                                                              ││
│  │   Experience Life at Kisii University                       ││
│  │   Where learning meets living                               ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  EXPLORE CAMPUS LIFE                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐  │
│  │ [Image]     │ │ [Image]     │ │ [Image]     │ │ [Image]  │  │
│  │             │ │             │ │             │ │          │  │
│  │ 🎭 Clubs &  │ │ ⚽ Sports & │ │ 🏠 Accommo- │ │ 🎓 Student│  │
│  │ Societies   │ │ Recreation  │ │ dation      │ │ Support  │  │
│  │             │ │             │ │             │ │          │  │
│  │ 40+ clubs   │ │ Modern      │ │ On-campus   │ │ Counsel- │  │
│  │ to join     │ │ facilities  │ │ hostels     │ │ ing, etc │  │
│  │             │ │             │ │             │ │          │  │
│  │ [Explore →] │ │ [Explore →] │ │ [Explore →] │ │[Explore] │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘  │
│                                                                  │
│  CAMPUS HIGHLIGHTS                                               │
│  ┌──────────┬──────────┬──────────┬──────────┐                  │
│  │   40+    │   5      │  2,000   │    3     │                  │
│  │  Clubs   │  Sports  │  Hostel  │ Dining   │                  │
│  │          │ Facilities│  Beds   │ Halls    │                  │
│  └──────────┴──────────┴──────────┴──────────┘                  │
│                                                                  │
│  UPCOMING EVENTS                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 📅 May 15 │ Cultural Week │ Main grounds │ [Details]       ││
│  │ 📅 May 22 │ Sports Day    │ Stadium      │ [Details]       ││
│  │ 📅 Jun 5  │ Club Fair     │ Student Center│ [Details]      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  PHOTO GALLERY                                                   │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐              │
│  │[img]│ │[img]│ │[img]│ │[img]│ │[img]│ │[img]│ [View All →] │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘              │
│                                                                  │
│  STUDENT TESTIMONIALS                                            │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ "The campus life at KSU is vibrant. I've made lifelong     ││
│  │  friends through the clubs and activities..."               ││
│  │  — [Name], BCom Student                                     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Clubs & Societies Listing

```
┌─────────────────────────────────────────────────────────────────┐
│ Campus Life > Clubs & Societies                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CLUBS & SOCIETIES                                               │
│  Find your community                                            │
│                                                                  │
│  [All] [Academic] [Sports] [Cultural] [Religious] [Social]     │
│                                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐  │
│  │ [Logo/Img]  │ │ [Logo/Img]  │ │ [Logo/Img]  │ │[Logo]    │  │
│  │             │ │             │ │             │ │          │  │
│  │ Business    │ │ Debate      │ │ Drama       │ │ IEEE     │  │
│  │ Club        │ │ Society     │ │ Club        │ │ Student  │  │
│  │             │ │             │ │             │ │ Branch   │  │
│  │ Academic    │ │ Academic    │ │ Cultural    │ │ Academic │  │
│  │ 120 members │ │ 85 members  │ │ 64 members  │ │ 45 memb  │  │
│  │             │ │             │ │             │ │          │  │
│  │ [View →]    │ │ [View →]    │ │ [View →]    │ │[View →]  │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘  │
│                                                                  │
│  (... more clubs)                                               │
│                                                                  │
│  HOW TO JOIN A CLUB                                              │
│  1. Browse available clubs above                                │
│  2. Contact the club or attend their meeting                    │
│  3. Register through the Dean of Students office                │
│                                                                  │
│  WANT TO START A CLUB?                                           │
│  [Learn How →]                                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Club Detail Page

```
┌─────────────────────────────────────────────────────────────────┐
│ Campus Life > Clubs > Business Club                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ [Club Banner / Cover Image]                                 ││
│  │                                                              ││
│  │       BUSINESS CLUB                                         ││
│  │       "Building Tomorrow's Entrepreneurs"                   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────┬───────────────────────────────────────┐│
│  │                     │                                       ││
│  │ [Club Logo]         │ ABOUT                                 ││
│  │                     │                                       ││
│  │ Category: Academic  │ The Business Club brings together     ││
│  │ Founded: 2005       │ students passionate about business,   ││
│  │ Members: 120        │ entrepreneurship, and leadership.     ││
│  │                     │                                       ││
│  │ [Join Club]         │ OBJECTIVES                            ││
│  │                     │ • Foster entrepreneurship             ││
│  │                     │ • Networking opportunities            ││
│  │                     │ • Business skills development         ││
│  └─────────────────────┴───────────────────────────────────────┘│
│                                                                  │
│  ASSOCIATIONS                                                    │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🏫 School: School of Business & Economics                   ││
│  │    [View School →]                                          ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  PATRON / ADVISOR                                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ┌─────┐ Dr. James Otieno                                    ││
│  │ │Photo│ Senior Lecturer, Management                         ││
│  │ └─────┘ [View Profile →]                                    ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  LEADERSHIP (Current Term)                                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │ [Photo]     │ │ [Photo]     │ │ [Photo]     │               │
│  │ Chairperson │ │ Vice Chair  │ │ Secretary   │               │
│  │ [Name]      │ │ [Name]      │ │ [Name]      │               │
│  │ BCom Yr 3   │ │ BBA Yr 3    │ │ BCom Yr 2   │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
│                                                                  │
│  ACTIVITIES & EVENTS                                             │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ UPCOMING                                                    ││
│  │ 📅 May 20 │ Business Plan Competition │ [Details]          ││
│  │ 📅 Jun 5  │ Industry Visit - Safaricom │ [Details]         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  GALLERY                                                         │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                               │
│  │[img]│ │[img]│ │[img]│ │[img]│  [View All →]                 │
│  └─────┘ └─────┘ └─────┘ └─────┘                               │
│                                                                  │
│  CONTACT                                                         │
│  📧 businessclub@ksu.ac.ke                                      │
│  📍 Room 102, Business Block                                    │
│  Meeting: Every Tuesday, 4:00 PM                                │
│  [Facebook] [Instagram]                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Sports & Recreation

```
┌─────────────────────────────────────────────────────────────────┐
│ Campus Life > Sports & Recreation                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SPORTS & RECREATION                                             │
│  Stay active, stay healthy                                      │
│                                                                  │
│  SPORTS TEAMS                                                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐  │
│  │ [Image]     │ │ [Image]     │ │ [Image]     │ │ [Image]  │  │
│  │ ⚽ Football │ │ 🏀 Basketball│ │ 🏐 Volleyball│ │ 🏃 Athletics│  │
│  │ Men/Women   │ │ Men/Women   │ │ Men/Women   │ │ Track    │  │
│  │ [View →]    │ │ [View →]    │ │ [View →]    │ │[View →]  │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘  │
│                                                                  │
│  FACILITIES                                                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🏟️ Stadium          │ Football, Athletics      │ Main Campus││
│  │ 🏀 Indoor Courts    │ Basketball, Volleyball   │ Sports Block│
│  │ 🏊 Swimming Pool    │ Swimming, Aquatics       │ Sports Block│
│  │ 🎾 Tennis Courts    │ Tennis, Badminton        │ Sports Block│
│  │ 🏋️ Gymnasium        │ Fitness, Weightlifting   │ Sports Block│
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  UPCOMING TOURNAMENTS                                            │
│  • KUSA Games 2026 - June                                       │
│  • Inter-School Competition - May                               │
│                                                                  │
│  JOIN A TEAM                                                     │
│  Contact: Sports Office, sports@ksu.ac.ke                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Accommodation

```
┌─────────────────────────────────────────────────────────────────┐
│ Campus Life > Accommodation                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  STUDENT ACCOMMODATION                                           │
│  Your home away from home                                       │
│                                                                  │
│  ON-CAMPUS HOSTELS                                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ┌─────────┐  HOSTEL A (MALE)                                ││
│  │ │ [Image] │                                                  ││
│  │ │         │  Capacity: 500 beds                             ││
│  │ └─────────┘  Room Types: Single, Double, Triple             ││
│  │              Amenities: Wi-Fi, Laundry, Common Room         ││
│  │              Fee: KES 15,000 - 25,000 per semester          ││
│  │              [View Details] [Apply]                         ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ┌─────────┐  HOSTEL B (FEMALE)                              ││
│  │ │ [Image] │                                                  ││
│  │ │         │  Capacity: 600 beds                             ││
│  │ └─────────┘  Room Types: Single, Double, Triple             ││
│  │              Amenities: Wi-Fi, Laundry, Common Room         ││
│  │              Fee: KES 15,000 - 25,000 per semester          ││
│  │              [View Details] [Apply]                         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  HOW TO APPLY                                                    │
│  1. Log in to Student Portal                                    │
│  2. Navigate to Accommodation                                   │
│  3. Select preferred hostel and room type                       │
│  4. Pay accommodation fee                                       │
│                                                                  │
│  CONTACT                                                         │
│  Dean of Students Office                                        │
│  📧 deanofstudents@ksu.ac.ke                                    │
│  📞 +254 XXX XXX XXX                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Student Support Services

```
┌─────────────────────────────────────────────────────────────────┐
│ Campus Life > Student Support                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  STUDENT SUPPORT SERVICES                                        │
│  We're here to help you succeed                                 │
│                                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐  │
│  │ 💭 Counsel- │ │ 🏥 Health   │ │ ♿ Disability│ │ 📚 Academic│  │
│  │ ing & Psych│ │ Services    │ │ Support     │ │ Support  │  │
│  │             │ │             │ │             │ │          │  │
│  │ Mental      │ │ On-campus   │ │ Accessibility│ │ Tutoring │  │
│  │ health      │ │ clinic      │ │ services    │ │ & mentoring│  │
│  │ support     │ │             │ │             │ │          │  │
│  │ [Learn More]│ │ [Learn More]│ │ [Learn More]│ │[Learn More]│  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘  │
│                                                                  │
│  COUNSELING SERVICES                                             │
│  Free, confidential counseling for all students                 │
│  Location: Student Services Building, Room 105                  │
│  Hours: Mon-Fri 8AM-5PM                                         │
│  📧 counseling@ksu.ac.ke                                        │
│  [Book Appointment]                                             │
│                                                                  │
│  HEALTH SERVICES                                                 │
│  24/7 medical services at University Clinic                     │
│  Location: Health Centre                                        │
│  Emergency: +254 XXX XXX XXX                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Gallery

```
┌─────────────────────────────────────────────────────────────────┐
│ Campus Life > Gallery                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  GALLERY                                                         │
│  See campus life in action                                      │
│                                                                  │
│  [Photos] [Videos]                                              │
│                                                                  │
│  PHOTO ALBUMS                                                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐  │
│  │ [Cover]     │ │ [Cover]     │ │ [Cover]     │ │ [Cover]  │  │
│  │             │ │             │ │             │ │          │  │
│  │ Graduation  │ │ Cultural    │ │ Sports Day  │ │ Campus   │  │
│  │ 2025        │ │ Week 2025   │ │ 2025        │ │ Life     │  │
│  │ 45 photos   │ │ 32 photos   │ │ 28 photos   │ │ 64 photos│  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘  │
│                                                                  │
│  ALBUM VIEW (Masonry Grid with Lightbox)                        │
│  ┌─────────┬───────────┬─────────┐                              │
│  │         │           │         │                              │
│  │  [Img]  │   [Img]   │  [Img]  │                              │
│  │         │           │         │                              │
│  ├─────────┴───────────┼─────────┤                              │
│  │                     │         │                              │
│  │       [Img]         │  [Img]  │                              │
│  │                     │         │                              │
│  └─────────────────────┴─────────┘                              │
│                                                                  │
│  → Click opens lightbox with navigation                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Components Required

```
components/
├── campus-life/
│   ├── ClubCard.tsx
│   ├── ClubDetail.tsx
│   ├── ClubLeadershipGrid.tsx
│   ├── SportCard.tsx
│   ├── FacilityCard.tsx
│   ├── HostelCard.tsx
│   ├── SupportServiceCard.tsx
│   └── CampusLifeStats.tsx
│
├── gallery/
│   ├── AlbumCard.tsx
│   ├── PhotoGrid.tsx
│   ├── Lightbox.tsx
│   └── VideoCard.tsx
```

---

## Data Sources

| Endpoint | Page |
|----------|------|
| `GET /clubs` | Clubs listing |
| `GET /clubs/{slug}` | Club detail |
| `GET /clubs/{slug}/events` | Club events |
| `GET /sports` | Sports listing |
| `GET /sports-facilities` | Facilities |
| `GET /accommodation` | Hostels |
| `GET /gallery/albums` | Photo albums |
| `GET /gallery/albums/{slug}` | Album photos |
| `GET /gallery/videos` | Videos |

---

## Static Content (MDX)

```
content/campus-life/
├── student-life.mdx
├── accommodation.mdx
└── support-services/
    ├── counseling.mdx
    ├── health.mdx
    └── disability.mdx
```

---

## Checklist

- [ ] Campus Life landing page
- [ ] Student Life overview
- [ ] Clubs listing with filters
- [ ] Club detail page
- [ ] Sports & Recreation page
- [ ] Accommodation page
- [ ] Student Support pages (MDX)
- [ ] Gallery with albums
- [ ] Photo lightbox component
- [ ] ClubCard component
- [ ] All pages responsive
