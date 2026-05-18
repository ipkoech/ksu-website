# Admissions Section — Implementation Prompt

## Overview

The Admissions section guides prospective students through the application process, showcasing programmes, requirements, fees, and current intakes. This is a high-traffic, conversion-focused section.

---

## Routes

```
/admissions                        # Admissions landing
├── /admissions/undergraduate      # UG admissions info
├── /admissions/postgraduate       # PG admissions info
├── /admissions/international      # International students
├── /admissions/requirements       # Entry requirements
├── /admissions/fees               # Fee structure
├── /admissions/scholarships       # Financial aid
├── /admissions/how-to-apply       # Step-by-step guide
└── /admissions/intakes            # Current intakes
    └── /admissions/intakes/[id]   # Specific intake details
```

---

## Navigation

```
Admissions (Dropdown):
├── Undergraduate
├── Postgraduate
├── International Students
├── Entry Requirements
├── Fees & Scholarships
├── How to Apply
└── Current Intakes
```

---

## Page Specifications

### Admissions Landing Page

```
┌─────────────────────────────────────────────────────────────────┐
│ JOIN KISII UNIVERSITY                                            │
│ Your journey to excellence starts here                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ CURRENT INTAKES                                     🔴 OPEN ││
│  │                                                              ││
│  │ ┌─────────────────────────┐ ┌─────────────────────────────┐ ││
│  │ │ KUCCPS INTAKE           │ │ SELF-SPONSORED INTAKE       │ ││
│  │ │ September 2026          │ │ September 2026              │ ││
│  │ │                         │ │                             │ ││
│  │ │ For KCSE graduates      │ │ Direct application for      │ ││
│  │ │ placed by KUCCPS        │ │ all qualifications          │ ││
│  │ │                         │ │                             │ ││
│  │ │ Deadline: July 30       │ │ Deadline: August 15         │ ││
│  │ │ [Apply via KUCCPS →]    │ │ [Apply Now →]               │ ││
│  │ └─────────────────────────┘ └─────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ADMISSION CATEGORIES                                            │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │
│  │ 🎓 Undergraduate│ │ 📚 Postgraduate │ │ 🌍 International│    │
│  │                 │ │                 │ │                 │    │
│  │ Bachelor's      │ │ Masters, PhD &  │ │ Study in Kenya  │    │
│  │ degrees &       │ │ Postgraduate    │ │ as an           │    │
│  │ Diplomas        │ │ Diplomas        │ │ international   │    │
│  │                 │ │                 │ │ student         │    │
│  │ [Learn More →]  │ │ [Learn More →]  │ │ [Learn More →]  │    │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘    │
│                                                                  │
│  QUICK LINKS                                                     │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────────┐   │
│  │Entry     │ Fees     │ Scholar- │ How to   │ Download     │   │
│  │Require.  │ Structure│ ships    │ Apply    │ Prospectus   │   │
│  └──────────┴──────────┴──────────┴──────────┴──────────────┘   │
│                                                                  │
│  FIND YOUR PROGRAMME                                             │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ [Search programmes...]                                      ││
│  │                                                              ││
│  │ Filter: [Level ▼] [School ▼] [Mode ▼] [Duration ▼]          ││
│  │                                                              ││
│  │ Popular: BCom | BSc Computer Science | LLB | MBA | BEd      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  WHY KISII UNIVERSITY?                                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐  │
│  │ ✓ Quality   │ │ ✓ Career    │ │ ✓ Vibrant   │ │ ✓ Afford-│  │
│  │   Education │ │   Support   │ │   Campus    │ │   able   │  │
│  │             │ │             │ │   Life      │ │   Fees   │  │
│  │ Accredited  │ │ Industry    │ │ 40+ clubs,  │ │ Flexible │  │
│  │ programs    │ │ partnerships│ │ sports      │ │ payment  │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘  │
│                                                                  │
│  STUDENT TESTIMONIALS                                            │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ "Choosing KSU was the best decision I made. The supportive ││
│  │  learning environment helped me excel..."                   ││
│  │  — [Name], BCom Graduate 2023                               ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  NEED HELP?                                                      │
│  📞 Admissions Hotline: +254 XXX XXX XXX                        │
│  📧 admissions@ksu.ac.ke                                        │
│  💬 [Chat with Us]                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Undergraduate Admissions

```
┌─────────────────────────────────────────────────────────────────┐
│ Admissions > Undergraduate                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  UNDERGRADUATE ADMISSIONS                                        │
│  Begin your journey with a world-class degree                   │
│                                                                  │
│  ENTRY PATHWAYS                                                  │
│  ┌───────────────────────────┐ ┌───────────────────────────┐    │
│  │ KUCCPS PLACEMENT          │ │ SELF-SPONSORED            │    │
│  │                           │ │                           │    │
│  │ • KCSE graduates          │ │ • KCSE graduates          │    │
│  │ • Government sponsored    │ │ • A-Level holders         │    │
│  │ • Placed centrally        │ │ • Diploma holders         │    │
│  │                           │ │ • Mature entry            │    │
│  │ Minimum: C+ mean          │ │                           │    │
│  │                           │ │ Minimum: C+ or equivalent │    │
│  └───────────────────────────┘ └───────────────────────────┘    │
│                                                                  │
│  AVAILABLE PROGRAMMES                                            │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ [Filter: School ▼] [Mode ▼] [Search...]                     ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ School of Business & Economics                              ││
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            ││
│  │ │ BCom        │ │ BBA         │ │ BSc Finance │            ││
│  │ │ 4 Years     │ │ 4 Years     │ │ 4 Years     │            ││
│  │ │ [View →]    │ │ [View →]    │ │ [View →]    │            ││
│  │ └─────────────┘ └─────────────┘ └─────────────┘            ││
│  │                                                              ││
│  │ School of Information Technology                            ││
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            ││
│  │ │ BSc CS      │ │ BSc IT      │ │ BSc SE      │            ││
│  │ │ 4 Years     │ │ 4 Years     │ │ 4 Years     │            ││
│  │ │ [View →]    │ │ [View →]    │ │ [View →]    │            ││
│  │ └─────────────┘ └─────────────┘ └─────────────┘            ││
│  │                                                              ││
│  │ (... more schools)                                          ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  HOW TO APPLY                                                    │
│  1. Check entry requirements                                    │
│  2. Choose your programme                                       │
│  3. Apply online or download form                               │
│  4. Submit required documents                                   │
│  5. Pay application fee (KES 2,000)                             │
│                                                                  │
│  [Start Application →]                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Fee Structure Page

```
┌─────────────────────────────────────────────────────────────────┐
│ Admissions > Fee Structure                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  FEE STRUCTURE 2026/2027                                         │
│                                                                  │
│  [Undergraduate ▼] [Postgraduate ▼] [School ▼]                  │
│                                                                  │
│  UNDERGRADUATE FEES                                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Programme               │ Tuition/Yr │ Other    │ Total   │  │
│  ├─────────────────────────┼────────────┼──────────┼─────────┤  │
│  │ BCom (All options)      │ 95,000     │ 25,000   │ 120,000 │  │
│  │ BSc Computer Science    │ 105,000    │ 30,000   │ 135,000 │  │
│  │ LLB                     │ 130,000    │ 25,000   │ 155,000 │  │
│  │ BEd (Arts)              │ 85,000     │ 20,000   │ 105,000 │  │
│  │ BEd (Science)           │ 90,000     │ 25,000   │ 115,000 │  │
│  │ BSc Nursing             │ 150,000    │ 35,000   │ 185,000 │  │
│  │ Diploma programmes      │ 65,000     │ 15,000   │ 80,000  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  OTHER FEES (One-time)                                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Application Fee                              │ 2,000      │  │
│  │ Registration Fee                             │ 5,000      │  │
│  │ Student ID                                   │ 1,000      │  │
│  │ Medical Insurance (per year)                 │ 6,500      │  │
│  │ ICT Services (per year)                      │ 3,000      │  │
│  │ Library Fee (per year)                       │ 2,500      │  │
│  │ Examination Fee (per year)                   │ 5,000      │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  PAYMENT OPTIONS                                                 │
│  • Full payment (5% discount)                                   │
│  • Semester payment                                             │
│  • Monthly installments (arrangement required)                  │
│  • HELB loan (for Kenyan students)                              │
│                                                                  │
│  PAYMENT METHODS                                                 │
│  • Bank deposit (KCB, Equity, Co-op)                            │
│  • M-Pesa Paybill: XXXXXX                                       │
│  • Online payment portal                                        │
│                                                                  │
│  [Download Full Fee Structure PDF]                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### How to Apply Page (MDX)

```
┌─────────────────────────────────────────────────────────────────┐
│ Admissions > How to Apply                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  HOW TO APPLY                                                    │
│  Your step-by-step guide to joining Kisii University           │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ STEP 1: CHECK REQUIREMENTS                                  ││
│  │                                                              ││
│  │ ┌─────┐  Ensure you meet the minimum entry requirements     ││
│  │ │  1  │  for your chosen programme.                         ││
│  │ └─────┘                                                      ││
│  │         [View Entry Requirements →]                         ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ STEP 2: CHOOSE YOUR PROGRAMME                               ││
│  │                                                              ││
│  │ ┌─────┐  Browse our 100+ programmes and select the one     ││
│  │ │  2  │  that matches your career goals.                    ││
│  │ └─────┘                                                      ││
│  │         [Browse Programmes →]                               ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ STEP 3: APPLY ONLINE                                        ││
│  │                                                              ││
│  │ ┌─────┐  Complete the online application form with          ││
│  │ │  3  │  accurate personal and academic information.        ││
│  │ └─────┘                                                      ││
│  │         [Start Online Application →]                        ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ STEP 4: UPLOAD DOCUMENTS                                    ││
│  │                                                              ││
│  │ ┌─────┐  Upload certified copies of:                        ││
│  │ │  4  │  • National ID / Passport                           ││
│  │ └─────┘  • Academic certificates                            ││
│  │         • Passport photo                                    ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ STEP 5: PAY APPLICATION FEE                                 ││
│  │                                                              ││
│  │ ┌─────┐  Pay KES 2,000 via M-Pesa or bank                   ││
│  │ │  5  │  M-Pesa Paybill: XXXXXX                             ││
│  │ └─────┘  Account: Your Application Number                   ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ STEP 6: AWAIT ADMISSION                                     ││
│  │                                                              ││
│  │ ┌─────┐  Applications are processed within 2 weeks.         ││
│  │ │  6  │  Check your email and portal for admission letter. ││
│  │ └─────┘                                                      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  NEED HELP?                                                      │
│  Contact Admissions: admissions@ksu.ac.ke | +254 XXX XXX XXX   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Components Required

```
components/
├── admissions/
│   ├── IntakeCard.tsx
│   ├── ProgrammeFinder.tsx
│   ├── ProgrammeFilters.tsx
│   ├── FeeTable.tsx
│   ├── ApplicationSteps.tsx
│   ├── RequirementsTable.tsx
│   └── AdmissionCategoryCard.tsx
│
├── cards/
│   └── ProgrammeCard.tsx
```

---

## Data Sources

| Endpoint | Page |
|----------|------|
| `GET /intakes?active=true` | Landing, Intakes |
| `GET /programmes?level=undergraduate` | UG programmes |
| `GET /programmes?level=postgraduate` | PG programmes |
| `GET /programmes` | Programme finder |
| `GET /fees` | Fee structure |
| `GET /scholarships` | Scholarships |

---

## Static Content (MDX)

```
content/admissions/
├── how-to-apply.mdx
├── requirements.mdx
├── international.mdx
└── scholarships.mdx
```

---

## Checklist

- [ ] Admissions landing page
- [ ] Undergraduate admissions page
- [ ] Postgraduate admissions page
- [ ] International students page
- [ ] Entry requirements page (MDX)
- [ ] Fee structure page with filters
- [ ] Scholarships page
- [ ] How to Apply guide (MDX)
- [ ] Current intakes listing
- [ ] Programme finder with filters
- [ ] IntakeCard component
- [ ] FeeTable component
