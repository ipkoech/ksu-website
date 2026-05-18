# Academics Section — Implementation Prompt

## Overview

The Academics section showcases the university's schools, departments, programmes, and academic resources. Each school operates as a mini-site with its own navigation, staff listings, publications, and documents.

---

## Routes

```
/academics                              # Academics landing
├── /academics/schools                  # All schools listing
│   └── /academics/schools/[slug]       # School mini-site
│       ├── / (overview)                # School home
│       ├── /departments                # Departments listing
│       │   └── /[dept-slug]            # Department detail
│       │       ├── / (overview)
│       │       ├── /programmes
│       │       ├── /staff
│       │       └── /publications
│       ├── /programmes                 # School programmes
│       ├── /staff                      # School staff
│       ├── /publications               # School publications
│       ├── /clubs                      # School clubs
│       └── /documents                  # School documents
├── /academics/programmes               # Programme finder
│   └── /academics/programmes/[slug]    # Programme detail
└── /academics/calendar                 # Academic calendar
```

---

## Navigation

```
Academics (Dropdown):
├── Schools
│   ├── Business & Economics
│   ├── Education
│   ├── Information Technology
│   ├── Law
│   ├── Health Sciences
│   ├── Agriculture
│   ├── Arts & Social Sciences
│   └── Pure & Applied Sciences
├── All Programmes
├── Academic Calendar
├── Library → (external link to Library Service)
└── E-Learning → (external link)
```

---

## Page Specifications

### Academics Landing Page

```
┌─────────────────────────────────────────────────────────────────┐
│ ACADEMICS                                                        │
│ World-class education across 8 schools                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ PROGRAMME FINDER                                            ││
│  │ [Search programmes...]                  [Search]            ││
│  │                                                              ││
│  │ Filters: [Level ▼] [School ▼] [Mode ▼] [Duration ▼]         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  OUR SCHOOLS                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐  │
│  │ [Cover Img] │ │ [Cover Img] │ │ [Cover Img] │ │[Cover]   │  │
│  │             │ │             │ │             │ │          │  │
│  │ School of   │ │ School of   │ │ School of   │ │School of │  │
│  │ Business &  │ │ Education   │ │ Information │ │Law       │  │
│  │ Economics   │ │             │ │ Technology  │ │          │  │
│  │             │ │             │ │             │ │          │  │
│  │ 12 Progs    │ │ 8 Progs     │ │ 15 Progs    │ │5 Progs   │  │
│  │ 4 Depts     │ │ 3 Depts     │ │ 2 Depts     │ │2 Depts   │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐  │
│  │ [Cover Img] │ │ [Cover Img] │ │ [Cover Img] │ │[Cover]   │  │
│  │ School of   │ │ School of   │ │ School of   │ │School of │  │
│  │ Health      │ │ Agriculture │ │ Arts &      │ │Pure &    │  │
│  │ Sciences    │ │             │ │ Social Sci  │ │Applied   │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘  │
│                                                                  │
│  ACADEMIC CALENDAR 2026/2027                                     │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Semester 1: September 2 - December 15, 2026                 ││
│  │ Semester 2: January 6 - April 20, 2027                      ││
│  │ Examination Period: Check specific dates                    ││
│  │                                                              ││
│  │ [View Full Calendar] [Download PDF]                         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  QUICK LINKS                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ 📚       │ │ 💻       │ │ 📅       │ │ 📄       │           │
│  │ Library  │ │E-Learning│ │ Timetables│ │ Past     │           │
│  │          │ │          │ │          │ │ Papers   │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### School Page (Mini-Site) — Tab-Based

```
┌─────────────────────────────────────────────────────────────────┐
│ [MAIN HEADER]                                                    │
├─────────────────────────────────────────────────────────────────┤
│ [SCHOOL HEADER]                                                  │
│ ← Schools | SCHOOL OF BUSINESS & ECONOMICS                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ [School Banner]                                               ││
│ │ SCHOOL OF BUSINESS & ECONOMICS                                ││
│ │ "Developing Tomorrow's Business Leaders"                      ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ TABS (horizontal, sticky)                                    ││
│ │ [About] [Departments] [Programmes] [Staff] [Publications]... ││
│ │         ↑ Only show tabs that have content                   ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                  │
│ ════════════════════════════════════════════════════════════════│
│ TAB: ABOUT (Default)                                             │
│ ════════════════════════════════════════════════════════════════│
│                                                                  │
│ ┌─────────────────────┬────────────────────────────────────────┐│
│ │ DEAN                │ ABOUT THE SCHOOL                       ││
│ │ ┌─────────┐         │                                        ││
│ │ │ [Photo] │         │ The School of Business & Economics     ││
│ │ └─────────┘         │ was established in 1990 and has        ││
│ │ Prof. [Name]        │ grown to become one of the leading     ││
│ │ Dean                │ business schools in the region.        ││
│ │                     │                                        ││
│ │ "Our vision is to   │ We offer programmes at certificate,    ││
│ │ produce industry-   │ diploma, undergraduate, and            ││
│ │ ready graduates..." │ postgraduate levels.                   ││
│ │                     │                                        ││
│ │ [View Profile →]    │ QUICK FACTS                            ││
│ │                     │ ┌────┬────┬────┬────┐                  ││
│ │                     │ │ 4  │ 12 │ 45 │2500│                  ││
│ │                     │ │Dept│Prog│Staf│Stud│                  ││
│ │                     │ └────┴────┴────┴────┘                  ││
│ └─────────────────────┴────────────────────────────────────────┘│
│                                                                  │
│ ════════════════════════════════════════════════════════════════│
│ TAB: DEPARTMENTS                                                 │
│ ════════════════════════════════════════════════════════════════│
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ DEPARTMENT OF ACCOUNTING & FINANCE                           ││
│ │ ┌─────┐ Dr. [Name], HOD                                      ││
│ │ │Photo│ 4 Programmes • 12 Academic Staff                     ││
│ │ └─────┘ [View Department →]                                  ││
│ ├──────────────────────────────────────────────────────────────┤│
│ │ DEPARTMENT OF ECONOMICS                                      ││
│ │ ┌─────┐ Dr. [Name], HOD                                      ││
│ │ │Photo│ 3 Programmes • 8 Academic Staff                      ││
│ │ └─────┘ [View Department →]                                  ││
│ ├──────────────────────────────────────────────────────────────┤│
│ │ DEPARTMENT OF MANAGEMENT SCIENCE                             ││
│ │ ┌─────┐ Dr. [Name], HOD                                      ││
│ │ │Photo│ 3 Programmes • 10 Academic Staff                     ││
│ │ └─────┘ [View Department →]                                  ││
│ ├──────────────────────────────────────────────────────────────┤│
│ │ DEPARTMENT OF MARKETING & SUPPLY CHAIN                       ││
│ │ ┌─────┐ Dr. [Name], HOD                                      ││
│ │ │Photo│ 2 Programmes • 6 Academic Staff                      ││
│ │ └─────┘ [View Department →]                                  ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                  │
│ ════════════════════════════════════════════════════════════════│
│ TAB: PROGRAMMES                                                  │
│ ════════════════════════════════════════════════════════════════│
│                                                                  │
│ [All] [Undergraduate] [Postgraduate] [Diploma] [Certificate]   │
│                                                                  │
│ UNDERGRADUATE                                                    │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │
│ │ BCom        │ │ BBA         │ │ BSc Finance │                │
│ │ 4 Years     │ │ 4 Years     │ │ 4 Years     │                │
│ │ Full-time   │ │ Full-time   │ │ Full-time   │                │
│ │ [Details →] │ │ [Details →] │ │ [Details →] │                │
│ └─────────────┘ └─────────────┘ └─────────────┘                │
│                                                                  │
│ POSTGRADUATE                                                     │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │
│ │ MBA         │ │ MSc Finance │ │ PhD Business│                │
│ │ 2 Years     │ │ 2 Years     │ │ 3 Years     │                │
│ │ [Details →] │ │ [Details →] │ │ [Details →] │                │
│ └─────────────┘ └─────────────┘ └─────────────┘                │
│                                                                  │
│ ════════════════════════════════════════════════════════════════│
│ TAB: STAFF (Grouped by Academic Rank)                            │
│ ════════════════════════════════════════════════════════════════│
│                                                                  │
│ PROFESSORS (3)                                                   │
│ ┌────────┐ ┌────────┐ ┌────────┐                               │
│ │ [Photo]│ │ [Photo]│ │ [Photo]│                               │
│ │ Prof. X│ │ Prof. Y│ │ Prof. Z│                               │
│ │ Finance│ │ Econ   │ │ Mgmt   │                               │
│ │[View →]│ │[View →]│ │[View →]│                               │
│ └────────┘ └────────┘ └────────┘                               │
│                                                                  │
│ ASSOCIATE PROFESSORS (5)                      [Expand ▼]        │
│ SENIOR LECTURERS (12)                         [Expand ▼]        │
│ LECTURERS (18)                                [Expand ▼]        │
│ TUTORIAL FELLOWS (7)                          [Expand ▼]        │
│                                                                  │
│ ════════════════════════════════════════════════════════════════│
│ TAB: PUBLICATIONS (If school has publications)                   │
│ ════════════════════════════════════════════════════════════════│
│                                                                  │
│ [Filter: Year ▼] [Type ▼] [Department ▼]                        │
│                                                                  │
│ 2026                                                             │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ 📄 Impact of Digital Banking on SMEs in Kenya             │   │
│ │    Dr. [Name] et al. • Journal of Finance • 2026          │   │
│ │    [View Abstract] [Full Text →]                          │   │
│ └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│ ════════════════════════════════════════════════════════════════│
│ TAB: CLUBS (If school has associated clubs)                      │
│ ════════════════════════════════════════════════════════════════│
│                                                                  │
│ ┌─────────────┐ ┌─────────────┐                                 │
│ │ [Logo]      │ │ [Logo]      │                                 │
│ │ Business    │ │ Economics   │                                 │
│ │ Club        │ │ Society     │                                 │
│ │ 120 members │ │ 85 members  │                                 │
│ │ [View →]    │ │ [View →]    │                                 │
│ └─────────────┘ └─────────────┘                                 │
│                                                                  │
│ ════════════════════════════════════════════════════════════════│
│ TAB: DOCUMENTS                                                   │
│ ════════════════════════════════════════════════════════════════│
│                                                                  │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ 📋 School Academic Policy         │ PDF  │ [Download]    │   │
│ │ 📄 Internship Guidelines          │ PDF  │ [Download]    │   │
│ │ 📄 Project Writing Guide          │ PDF  │ [Download]    │   │
│ └───────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Department Page

Similar structure to School but scoped to department:

```
Tabs: About | Programmes | Staff | Publications | Documents

Key differences:
- Shows HOD instead of Dean
- Programmes include tutors (teaching staff)
- Staff filtered to department only
- Publications from department staff only
```

---

### Programme Page (with Tutors)

```
┌─────────────────────────────────────────────────────────────────┐
│ School of Business > Accounting > BCom Accounting               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ BACHELOR OF COMMERCE (ACCOUNTING OPTION)                         │
│                                                                  │
│ ┌─────────────┬─────────────┬─────────────┬─────────────────┐   │
│ │ ⏱️ 4 Years  │ 🎓 Bachelor │ 📅 Sept/Jan │ 💰 KES 120K/yr  │   │
│ └─────────────┴─────────────┴─────────────┴─────────────────┘   │
│                                                                  │
│ [Apply Now]  [Download Brochure]  [Contact Department]          │
│                                                                  │
│ TABS: Overview | Requirements | Curriculum | Tutors | FAQ        │
│ ════════════════════════════════════════════════════════════════│
│                                                                  │
│ TAB: OVERVIEW                                                    │
│ The Bachelor of Commerce (Accounting Option) prepares           │
│ students for careers in accounting, auditing, taxation...       │
│                                                                  │
│ KEY HIGHLIGHTS                                                   │
│ • CPA-K exemptions pathway                                      │
│ • Industry-aligned curriculum                                   │
│ • Mandatory internship                                          │
│                                                                  │
│ TAB: TUTORS                                                      │
│                                                                  │
│ PROGRAMME COORDINATOR                                            │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ ┌─────────┐  Dr. John Mwangi                              │   │
│ │ │ [Photo] │  Senior Lecturer, CPA(K)                      │   │
│ │ │         │  Specialization: Financial Accounting         │   │
│ │ └─────────┘  [View Full Profile →]                        │   │
│ └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│ TEACHING STAFF (by rank)                                         │
│                                                                  │
│ Professors (2)                                                   │
│ ┌───────────────────┐  ┌───────────────────┐                    │
│ │ ┌─────┐ Prof. X   │  │ ┌─────┐ Prof. Y   │                    │
│ │ │Photo│ Taxation  │  │ │Photo│ Auditing  │                    │
│ │ └─────┘ [Profile] │  │ └─────┘ [Profile] │                    │
│ └───────────────────┘  └───────────────────┘                    │
│                                                                  │
│ Senior Lecturers (4)               [Expand ▼]                   │
│ Lecturers (6)                      [Expand ▼]                   │
│ Tutorial Fellows (3)               [Expand ▼]                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### School Header

```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo]  ← Schools | SCHOOL OF BUSINESS & ECONOMICS              │
│                                                                  │
│ About  Departments  Programmes  Staff  Publications  Clubs Docs │
└─────────────────────────────────────────────────────────────────┘

Behavior:
- Shows below main public header
- Active tab highlighted
- Tabs hidden if no content (e.g., no clubs for this school)
- Back link returns to /academics/schools
```

---

## Components Required

```
components/
├── layout/headers/
│   ├── SchoolHeader.tsx
│   └── DepartmentHeader.tsx
│
├── school/
│   ├── SchoolTabs.tsx
│   ├── DeanCard.tsx
│   ├── DepartmentList.tsx
│   ├── StaffGrid.tsx
│   ├── PublicationsList.tsx
│   ├── ClubsGrid.tsx
│   └── DocumentsTable.tsx
│
├── department/
│   ├── DepartmentTabs.tsx
│   ├── HODCard.tsx
│   └── ProgrammeWithTutors.tsx
│
├── programme/
│   ├── ProgrammeTabs.tsx
│   ├── ProgrammeInfo.tsx
│   ├── TutorsList.tsx
│   ├── RequirementsTable.tsx
│   └── CurriculumTable.tsx
│
├── cards/
│   ├── SchoolCard.tsx
│   ├── DepartmentCard.tsx
│   ├── ProgrammeCard.tsx
│   ├── StaffCard.tsx
│   ├── PublicationCard.tsx
│   └── ClubCard.tsx
```

---

## Data Sources

| Endpoint | Page |
|----------|------|
| `GET /schools` | Schools listing |
| `GET /schools/{slug}` | School detail |
| `GET /schools/{slug}/departments` | School departments |
| `GET /schools/{slug}/staff` | School staff (by rank) |
| `GET /schools/{slug}/publications` | Publications from school staff |
| `GET /schools/{slug}/clubs` | Associated clubs |
| `GET /schools/{slug}/documents` | School documents |
| `GET /departments/{slug}` | Department detail |
| `GET /departments/{slug}/programmes` | Department programmes |
| `GET /departments/{slug}/staff` | Department staff |
| `GET /programmes` | All programmes |
| `GET /programmes/{slug}` | Programme detail |
| `GET /programmes/{slug}/tutors` | Programme tutors |
| `GET /staff/assignments?entity_type=school&role=dean` | School dean |
| `GET /staff/assignments?entity_type=department&role=hod` | Department HOD |

---

## Tab Visibility Rules

| Tab | Show If |
|-----|---------|
| About | Always |
| Departments | School has departments |
| Programmes | School/Dept has programmes |
| Staff | Has staff with `display_on_website=true` |
| Publications | Staff have publications |
| Clubs | School has associated clubs with data |
| Documents | Has uploaded documents |

---

## Checklist

- [ ] Academics landing page
- [ ] Schools listing grid
- [ ] School page (tab-based mini-site)
- [ ] SchoolHeader component
- [ ] School tabs (About, Departments, Programmes, Staff, Publications, Clubs, Docs)
- [ ] Department page (tab-based)
- [ ] DepartmentHeader component
- [ ] Programme listing page
- [ ] Programme detail page with tutors
- [ ] TutorsList component (grouped by rank)
- [ ] StaffGrid component
- [ ] PublicationsList component
- [ ] Academic calendar page
- [ ] All components responsive
- [ ] Tab visibility logic
