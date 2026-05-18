# Administration Section — Implementation Prompt

## Overview

The Administration section showcases the university's administrative structure, units, and services. This includes divisions, administrative departments (non-academic), directorates, and the services they provide to students and staff.

---

## Routes

```
/administration                           # Administration landing
├── /administration/divisions             # Divisions overview
│   └── /administration/divisions/[slug]  # Division detail
├── /administration/units                 # Administrative units listing
│   └── /administration/units/[slug]      # Unit detail page
│       ├── /staff                        # Unit staff
│       ├── /services                     # Services offered
│       └── /documents                    # Unit documents/forms
├── /administration/directorates          # Directorates listing
│   └── /administration/directorates/[slug]
└── /administration/organization          # Organizational structure
```

---

## Navigation

```
Administration (Main Nav Item):
├── Organization Structure
├── Divisions
├── Administrative Units
│   ├── Finance Office
│   ├── Human Resources
│   ├── ICT Directorate
│   ├── Estates
│   ├── Academic Registrar
│   ├── Student Affairs
│   ├── Procurement
│   └── View All Units
└── Directorates & Centers
```

---

## Administrative Units (Examples)

| Unit | Head Title | Reports To |
|------|-----------|------------|
| Finance Office | Finance Officer | DVC-APF |
| Human Resources | HR Director | DVC-APF |
| ICT Directorate | ICT Director | DVC-APF |
| Estates Department | Estates Manager | DVC-APF |
| Academic Registrar | Registrar Academic | VC |
| Administration Registrar | Registrar Admin | VC |
| Student Affairs | Dean of Students | DVC-ARSA |
| Procurement | Procurement Officer | Finance Officer |
| Security | Security Chief | Registrar Admin |
| Transport | Transport Officer | Estates Manager |
| Catering | Catering Manager | Dean of Students |
| Health Services | Medical Officer | Dean of Students |

---

## Page Specifications

### Administration Landing Page

```
┌─────────────────────────────────────────────────────────────────┐
│ ADMINISTRATION                                                   │
│ University Administrative Structure & Services                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ [Hero Banner - Administration Building]                     ││
│  │                                                              ││
│  │   Serving Students, Staff & Community                       ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  QUICK ACCESS                                                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐  │
│  │ 💰 Finance  │ │ 👥 HR       │ │ 💻 ICT      │ │ 🏠 Estates│  │
│  │             │ │             │ │             │ │          │  │
│  │ Fee payment │ │ Staff       │ │ Tech        │ │ Facilities│  │
│  │ queries     │ │ matters     │ │ support     │ │ booking  │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐  │
│  │ 📋 Academic │ │ 🎓 Student  │ │ 📦 Procure- │ │ 🏥 Health │  │
│  │ Registrar   │ │ Affairs     │ │ ment        │ │ Services │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘  │
│                                                                  │
│  DIVISIONS                                                       │
│  ┌─────────────────────────────┐ ┌─────────────────────────────┐│
│  │ ACADEMIC, RESEARCH &        │ │ ADMINISTRATION, PLANNING    ││
│  │ STUDENT AFFAIRS (DVC-ARSA)  │ │ & FINANCE (DVC-APF)        ││
│  │                             │ │                             ││
│  │ Oversees academic programs, │ │ Oversees administrative    ││
│  │ research initiatives, and   │ │ functions, planning, and   ││
│  │ student welfare.            │ │ financial management.      ││
│  │                             │ │                             ││
│  │ [View Division →]           │ │ [View Division →]          ││
│  └─────────────────────────────┘ └─────────────────────────────┘│
│                                                                  │
│  ORGANIZATIONAL CHART                                            │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ [Interactive Org Chart - Click to expand]                   ││
│  │                                                              ││
│  │                    ┌─────────────┐                           ││
│  │                    │     VC      │                           ││
│  │                    └──────┬──────┘                           ││
│  │         ┌─────────────────┼─────────────────┐                ││
│  │    ┌────┴────┐       ┌────┴────┐       ┌────┴────┐          ││
│  │    │DVC ARSA │       │DVC APF  │       │Registrar│          ││
│  │    └────┬────┘       └────┬────┘       └────┬────┘          ││
│  │         │                 │                 │                ││
│  │    [Schools]      [Admin Units]      [Academic]             ││
│  └─────────────────────────────────────────────────────────────┘│
│                              [View Full Structure →]            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Division Detail Page

```
┌─────────────────────────────────────────────────────────────────┐
│ Administration > Divisions > DVC-APF                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  DIVISION OF ADMINISTRATION, PLANNING & FINANCE                  │
│                                                                  │
│  ┌─────────────────────┬────────────────────────────────────────┐│
│  │ DVC                 │ ABOUT THE DIVISION                     ││
│  │ ┌─────────┐         │                                        ││
│  │ │ [Photo] │         │ The Division of Administration,        ││
│  │ └─────────┘         │ Planning & Finance oversees the        ││
│  │ Prof. [Name]        │ university's administrative operations,││
│  │ Deputy Vice         │ financial management, infrastructure,  ││
│  │ Chancellor (APF)    │ and human resources.                   ││
│  │                     │                                        ││
│  │ [View Profile →]    │ KEY RESPONSIBILITIES                   ││
│  │                     │ • Financial management & budgeting     ││
│  │                     │ • Human resource management            ││
│  │                     │ • Infrastructure development           ││
│  │                     │ • ICT services                         ││
│  │                     │ • Procurement & supplies               ││
│  └─────────────────────┴────────────────────────────────────────┘│
│                                                                  │
│  UNITS UNDER THIS DIVISION                                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐  │
│  │ Finance     │ │ Human       │ │ ICT         │ │ Estates  │  │
│  │ Office      │ │ Resources   │ │ Directorate │ │          │  │
│  │ [View →]    │ │ [View →]    │ │ [View →]    │ │ [View →] │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘  │
│  ┌─────────────┐ ┌─────────────┐                               │
│  │ Procurement │ │ Transport   │                               │
│  │             │ │             │                               │
│  │ [View →]    │ │ [View →]    │                               │
│  └─────────────┘ └─────────────┘                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Data Source:**
- `GET /divisions/{slug}`
- `GET /admin-units?division_id={id}`

---

### Administrative Units Listing

```
┌─────────────────────────────────────────────────────────────────┐
│ Administration > Units                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ADMINISTRATIVE UNITS                                            │
│  Our offices serving students and staff                         │
│                                                                  │
│  [Search units...]                                               │
│                                                                  │
│  FILTER BY DIVISION                                              │
│  [All] [DVC-ARSA] [DVC-APF] [VC Office]                         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 💰 FINANCE OFFICE                                           ││
│  │                                                              ││
│  │ Manages university finances, fee collection, payments       ││
│  │                                                              ││
│  │ Head: Mr. [Name], Finance Officer                           ││
│  │ Location: Finance Block                                     ││
│  │ Hours: Mon-Fri 8AM-5PM                                      ││
│  │                                                              ││
│  │ [View Unit →]                                               ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 👥 HUMAN RESOURCES                                          ││
│  │                                                              ││
│  │ Staff recruitment, welfare, and development                 ││
│  │                                                              ││
│  │ Head: Mrs. [Name], HR Director                              ││
│  │ Location: Administration Block                              ││
│  │                                                              ││
│  │ [View Unit →]                                               ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  (... more units)                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Administrative Unit Detail Page

```
┌─────────────────────────────────────────────────────────────────┐
│ [Main Header]                                                    │
├─────────────────────────────────────────────────────────────────┤
│ [Admin Unit Header]                                              │
│ ← Administration | FINANCE OFFICE                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ TABS                                                         ││
│ │ [About] [Services] [Staff] [Documents] [Contact]             ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                  │
│ ════════════════════════════════════════════════════════════════│
│ TAB: ABOUT                                                       │
│ ════════════════════════════════════════════════════════════════│
│                                                                  │
│ ┌─────────────────────┬────────────────────────────────────────┐│
│ │ HEAD OF UNIT        │ ABOUT THE UNIT                         ││
│ │ ┌─────────┐         │                                        ││
│ │ │ [Photo] │         │ The Finance Office is responsible      ││
│ │ └─────────┘         │ for managing the university's          ││
│ │ Mr. [Name]          │ financial resources, budgeting,        ││
│ │ Finance Officer     │ accounting, and financial reporting.   ││
│ │                     │                                        ││
│ │ "Our mission is to  │ REPORTING TO                           ││
│ │ ensure prudent      │ Deputy Vice Chancellor (APF)           ││
│ │ financial           │                                        ││
│ │ management..."      │ SECTIONS                               ││
│ │                     │ • Accounts                             ││
│ │ [View Profile →]    │ • Revenue                              ││
│ │                     │ • Payroll                              ││
│ │                     │ • Budgeting                            ││
│ └─────────────────────┴────────────────────────────────────────┘│
│                                                                  │
│ ════════════════════════════════════════════════════════════════│
│ TAB: SERVICES                                                    │
│ ════════════════════════════════════════════════════════════════│
│                                                                  │
│ SERVICES WE OFFER                                                │
│                                                                  │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ 💰 FEE PAYMENT PROCESSING                                 │   │
│ │                                                            │   │
│ │ Process student fee payments and issue receipts            │   │
│ │                                                            │   │
│ │ Location: Finance Block, Room 101                          │   │
│ │ Hours: Mon-Fri 8:00 AM - 4:00 PM                           │   │
│ │ Requirements: Student ID, Fee structure                    │   │
│ │                                                            │   │
│ │ [Get Directions]                                           │   │
│ ├───────────────────────────────────────────────────────────┤   │
│ │ 📄 FINANCIAL CLEARANCE                                    │   │
│ │                                                            │   │
│ │ Issue clearance certificates for graduating students       │   │
│ │                                                            │   │
│ │ Location: Finance Block, Room 102                          │   │
│ │ Requirements: No outstanding fees                          │   │
│ │ Processing Time: 2-3 working days                          │   │
│ ├───────────────────────────────────────────────────────────┤   │
│ │ 💳 STAFF SALARY QUERIES                                   │   │
│ │                                                            │   │
│ │ Handle salary-related inquiries and payslip requests       │   │
│ │                                                            │   │
│ │ Location: Finance Block, Room 103                          │   │
│ │ Hours: Mon-Fri 9:00 AM - 1:00 PM                           │   │
│ ├───────────────────────────────────────────────────────────┤   │
│ │ 📊 BUDGET SUPPORT                                         │   │
│ │                                                            │   │
│ │ Assist departments with budget preparation and tracking    │   │
│ │                                                            │   │
│ │ Contact: budget@ksu.ac.ke                                  │   │
│ └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│ ════════════════════════════════════════════════════════════════│
│ TAB: STAFF                                                       │
│ ════════════════════════════════════════════════════════════════│
│                                                                  │
│ UNIT LEADERSHIP                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ┌─────┐ Mr. [Name]                                         │ │
│ │ │Photo│ Finance Officer (Head)                              │ │
│ │ └─────┘ 📧 finance@ksu.ac.ke                               │ │
│ │         [View Profile]                                      │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ SECTION HEADS                                                    │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐    │
│ │ [Photo]    │ │ [Photo]    │ │ [Photo]    │ │ [Photo]    │    │
│ │ Name       │ │ Name       │ │ Name       │ │ Name       │    │
│ │ Chief      │ │ Senior     │ │ Payroll    │ │ Budget     │    │
│ │ Accountant │ │ Acc. Off.  │ │ Officer    │ │ Officer    │    │
│ └────────────┘ └────────────┘ └────────────┘ └────────────┘    │
│                                                                  │
│ ALL STAFF                                                        │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐         │
│ │ [Photo]│ │ [Photo]│ │ [Photo]│ │ [Photo]│ │ [Photo]│  +12    │
│ │ Name   │ │ Name   │ │ Name   │ │ Name   │ │ Name   │  more   │
│ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘         │
│                                                                  │
│ ════════════════════════════════════════════════════════════════│
│ TAB: DOCUMENTS                                                   │
│ ════════════════════════════════════════════════════════════════│
│                                                                  │
│ FORMS & TEMPLATES                                                │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ 📄 Fee Payment Form              │ PDF  │ [Download]      │   │
│ │ 📄 Refund Request Form           │ PDF  │ [Download]      │   │
│ │ 📄 Travel Advance Form           │ DOCX │ [Download]      │   │
│ │ 📄 Imprest Application           │ PDF  │ [Download]      │   │
│ │ 📄 Petty Cash Request            │ PDF  │ [Download]      │   │
│ └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│ POLICIES & GUIDELINES                                            │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ 📋 Financial Policy Manual       │ PDF  │ [Download]      │   │
│ │ 📋 Travel & Subsistence Policy   │ PDF  │ [Download]      │   │
│ │ 📋 Fee Payment Guidelines        │ PDF  │ [Download]      │   │
│ └───────────────────────────────────────────────────────────┘   │
│                                                                  │
│ ════════════════════════════════════════════════════════════════│
│ TAB: CONTACT                                                     │
│ ════════════════════════════════════════════════════════════════│
│                                                                  │
│ ┌─────────────────────┬────────────────────────────────────────┐│
│ │ CONTACT INFO        │ LOCATION                               ││
│ │                     │                                        ││
│ │ 📧 finance@ksu.ac.ke│ [Map showing building location]        ││
│ │ 📞 +254 XXX XXX XXX │                                        ││
│ │                     │ Finance Block                          ││
│ │ OFFICE HOURS        │ Main Campus                            ││
│ │ Mon-Fri: 8AM - 5PM  │ Ground Floor, Rooms 101-110            ││
│ │ Sat: 9AM - 12PM     │                                        ││
│ │                     │ [Get Directions]                       ││
│ └─────────────────────┴────────────────────────────────────────┘│
│                                                                  │
│ QUICK CONTACT FORM                                               │
│ ┌───────────────────────────────────────────────────────────┐   │
│ │ Name: [____________]  Email: [____________]                │   │
│ │ Subject: [Query Type ▼]                                    │   │
│ │ Message: [_________________________________________]       │   │
│ │                                              [Send →]      │   │
│ └───────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Admin Unit Header

```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo]  ← Administration | FINANCE OFFICE                       │
│                                                                  │
│ About  Services  Staff  Documents  Contact                      │
└─────────────────────────────────────────────────────────────────┘

Behavior:
- Shows below main public header
- Tab navigation for unit sections
- Active tab highlighted
- Tabs hidden if no content (e.g., no documents uploaded)
- Back link returns to /administration
```

---

### Directorates Page

```
┌─────────────────────────────────────────────────────────────────┐
│ Administration > Directorates                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  DIRECTORATES & CENTERS                                          │
│                                                                  │
│  ┌─────────────────────┐ ┌─────────────────────┐                │
│  │ QUALITY ASSURANCE   │ │ RESEARCH &          │                │
│  │ DIRECTORATE         │ │ EXTENSION           │                │
│  │                     │ │                     │                │
│  │ Ensures academic    │ │ Coordinates         │                │
│  │ quality standards   │ │ research activities │                │
│  │                     │ │                     │                │
│  │ Director: [Name]    │ │ Director: [Name]    │                │
│  │ [View →]            │ │ [View →]            │                │
│  └─────────────────────┘ └─────────────────────┘                │
│  ┌─────────────────────┐ ┌─────────────────────┐                │
│  │ COMMUNITY OUTREACH  │ │ LINKAGES &          │                │
│  │                     │ │ PARTNERSHIPS        │                │
│  │ University-community│ │ International       │                │
│  │ engagement          │ │ collaborations      │                │
│  │                     │ │                     │                │
│  │ Director: [Name]    │ │ Director: [Name]    │                │
│  │ [View →]            │ │ [View →]            │                │
│  └─────────────────────┘ └─────────────────────┘                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Organization Structure Page

```
┌─────────────────────────────────────────────────────────────────┐
│ Administration > Organization Structure                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ORGANIZATIONAL STRUCTURE                                        │
│  How Kisii University is organized                              │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ [Interactive Organizational Chart]                          ││
│  │                                                              ││
│  │                    ┌─────────────────┐                       ││
│  │                    │ UNIVERSITY      │                       ││
│  │                    │ COUNCIL         │                       ││
│  │                    └────────┬────────┘                       ││
│  │                             │                                ││
│  │                    ┌────────┴────────┐                       ││
│  │                    │ VICE CHANCELLOR │                       ││
│  │                    └────────┬────────┘                       ││
│  │         ┌───────────────────┼───────────────────┐            ││
│  │         │                   │                   │            ││
│  │  ┌──────┴──────┐    ┌───────┴───────┐   ┌───────┴───────┐   ││
│  │  │  DVC-ARSA   │    │   DVC-APF     │   │   REGISTRAR   │   ││
│  │  └──────┬──────┘    └───────┬───────┘   └───────┬───────┘   ││
│  │         │                   │                   │            ││
│  │  ┌──────┴──────┐    ┌───────┴───────┐   ┌───────┴───────┐   ││
│  │  │ • Schools   │    │ • Finance    │   │ • Academic    │   ││
│  │  │ • Student   │    │ • HR         │   │   Affairs     │   ││
│  │  │   Affairs   │    │ • ICT        │   │ • Admissions  │   ││
│  │  │ • Research  │    │ • Estates    │   │ • Examinations│   ││
│  │  │ • Library   │    │ • Procurement│   │ • Records     │   ││
│  │  └─────────────┘    └──────────────┘   └───────────────┘   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Click on any unit to view details                              │
│                                                                  │
│  [Download Org Chart PDF]                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Components Required

```
components/
├── layout/headers/
│   └── AdminUnitHeader.tsx
│
├── admin-unit/
│   ├── AdminUnitTabs.tsx
│   ├── DirectorCard.tsx
│   ├── ServicesList.tsx
│   ├── ServiceCard.tsx
│   ├── UnitStaffGrid.tsx
│   ├── UnitDocuments.tsx
│   └── UnitContactForm.tsx
│
├── organization/
│   ├── OrganizationChart.tsx
│   ├── DivisionCard.tsx
│   ├── DirectorateCard.tsx
│   └── AdminUnitCard.tsx
```

---

## Data Sources

| Endpoint | Page | Notes |
|----------|------|-------|
| `GET /divisions` | Divisions listing | List all divisions |
| `GET /divisions/{slug}` | Division detail | Division info + units |
| `GET /admin-units` | Units listing | All administrative units |
| `GET /admin-units?division_id={id}` | Units by division | Filter by division |
| `GET /admin-units/{slug}` | Unit detail | Unit information |
| `GET /admin-units/{slug}/staff` | Unit staff tab | Staff members |
| `GET /admin-units/{slug}/services` | Unit services tab | Services offered |
| `GET /admin-units/{slug}/documents` | Unit documents tab | Forms, policies |
| `GET /directorates` | Directorates listing | All directorates |
| `GET /directorates/{slug}` | Directorate detail | Directorate info |
| `GET /staff/assignments?entity_type=admin_unit` | Unit heads | Leadership |

---

## Data Models (API)

```python
# Division
class Division:
    id: UUID
    name: str           # "Academic, Research & Student Affairs"
    short_name: str     # "DVC-ARSA"
    slug: str           # "dvc-arsa"
    description: str
    head_id: UUID       # DVC person
    display_order: int

# Administrative Unit
class AdminUnit:
    id: UUID
    name: str           # "Finance Office"
    slug: str           # "finance"
    description: str
    division_id: UUID   # Parent division
    head_title: str     # "Finance Officer"
    location: str       # "Finance Block, Ground Floor"
    email: str
    phone: str
    office_hours: str
    is_active: bool

# Service (offered by unit)
class UnitService:
    id: UUID
    admin_unit_id: UUID
    name: str           # "Fee Payment Processing"
    description: str
    location: str       # Room/office
    hours: str          # Service hours
    requirements: str   # What's needed
    processing_time: str
    display_order: int

# Directorate
class Directorate:
    id: UUID
    name: str
    slug: str
    description: str
    director_id: UUID
    is_active: bool
```

---

## Tab Visibility Rules

| Tab | Show If |
|-----|---------|
| About | Always |
| Services | `unit.services.length > 0` |
| Staff | `unit.staff.length > 0` with `display_on_website=true` |
| Documents | `unit.documents.length > 0` |
| Contact | Always (has email/phone) |

---

## Responsive Design

| Element | Mobile | Desktop |
|---------|--------|---------|
| Unit cards | 1 column | 2-3 columns |
| Org chart | Scrollable/zoomable | Full view |
| Services list | Stacked | Same |
| Staff grid | 2 columns | 4 columns |
| Tabs | Horizontal scroll | All visible |

---

## Checklist

- [ ] Administration landing page
- [ ] Divisions listing & detail pages
- [ ] Administrative units listing
- [ ] Admin unit detail page (tab-based)
- [ ] AdminUnitHeader component
- [ ] Services tab with ServiceCard
- [ ] Staff tab with grid layout
- [ ] Documents tab with download links
- [ ] Contact tab with form
- [ ] Organization chart (interactive)
- [ ] Directorates listing & detail
- [ ] All pages responsive
- [ ] Search/filter functionality
