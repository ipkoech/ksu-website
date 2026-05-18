# About Section — Implementation Prompt

## Overview

The About section tells the story of Kisii University — its history, mission, leadership, and governance structure. This section establishes credibility and trust.

---

## Routes

```
/about                        # About landing page
├── /about/history            # University history & milestones
├── /about/mission-vision     # Mission, Vision, Core Values
├── /about/leadership         # VC, DVCs, Registrars, Deans
│   └── /about/leadership/[slug]  # Individual leader profile
├── /about/governance         # Council, Senate, Management Board
│   └── /about/governance/[slug]  # Individual board page
├── /about/quality-assurance  # Accreditation, CUE, ISO
└── /about/strategic-plan     # Strategic plan documents
```

---

## Navigation

```
About (Dropdown):
├── History
├── Mission & Vision
├── Leadership
├── Governance
└── Quality Assurance
```

---

## Page Specifications

### About Landing Page

```
┌─────────────────────────────────────────────────────────────────┐
│ ABOUT KISII UNIVERSITY                                          │
│ "Transforming lives through education since 1965"               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ [Hero Image - Campus Aerial View]                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  QUICK NAVIGATION                                                │
│  ┌─────────────┬─────────────┬─────────────┬─────────────────┐  │
│  │ 📜 History  │ 🎯 Mission  │ 👥 Leaders  │ 🏛️ Governance   │  │
│  │             │ & Vision    │             │                 │  │
│  └─────────────┴─────────────┴─────────────┴─────────────────┘  │
│  ┌─────────────┬─────────────┐                                  │
│  │ ✅ Quality  │ 📋 Strategic│                                  │
│  │ Assurance   │ Plan        │                                  │
│  └─────────────┴─────────────┘                                  │
│                                                                  │
│  AT A GLANCE                                                     │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐       │
│  │ Est.1965 │ 8 Schools│ 15K+     │ 1 Campus │ 100+     │       │
│  │          │          │ Students │          │ Programs │       │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘       │
│                                                                  │
│  BRIEF INTRODUCTION                                              │
│  Kisii University is a leading public university in Kenya,      │
│  committed to excellence in teaching, research, and community   │
│  service...                                                      │
│  [Read More →]                                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### History Page

```
┌─────────────────────────────────────────────────────────────────┐
│ About > History                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  OUR HISTORY                                                     │
│  A Journey of Excellence Since 1965                             │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ TIMELINE                                                     ││
│  │                                                              ││
│  │  1965 ●──────────────────────────────────────────────────   ││
│  │       │ Establishment as Kisii College                      ││
│  │       │ First students enrolled                             ││
│  │                                                              ││
│  │  1990 ●──────────────────────────────────────────────────   ││
│  │       │ Upgraded to University College                      ││
│  │       │ Under Egerton University                            ││
│  │                                                              ││
│  │  2007 ●──────────────────────────────────────────────────   ││
│  │       │ Chartered as Full University                        ││
│  │       │ First Vice Chancellor appointed                     ││
│  │                                                              ││
│  │  2015 ●──────────────────────────────────────────────────   ││
│  │       │ Golden Jubilee Celebration                          ││
│  │       │ 50 years of excellence                              ││
│  │                                                              ││
│  │  2024 ●──────────────────────────────────────────────────   ││
│  │       │ Modern Campus Expansion                             ││
│  │       │ New academic blocks, library                        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  MILESTONES                                                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │ First PhD   │ │ ISO         │ │ 100th       │               │
│  │ Awarded     │ │ Certification│ │ Programme   │               │
│  │ 2012        │ │ 2018        │ │ 2023        │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Implementation:** MDX content with Timeline component

---

### Mission & Vision Page

```
┌─────────────────────────────────────────────────────────────────┐
│ About > Mission & Vision                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                         VISION                               ││
│  │                                                              ││
│  │  "To be a world-class university committed to               ││
│  │   academic excellence and societal transformation"          ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                        MISSION                               ││
│  │                                                              ││
│  │  To provide quality higher education, foster research       ││
│  │  and innovation, and engage communities for sustainable     ││
│  │  development.                                                ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  CORE VALUES                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐  │
│  │ Excellence  │ │ Integrity   │ │ Innovation  │ │ Teamwork │  │
│  │             │ │             │ │             │ │          │  │
│  │ We strive   │ │ We uphold   │ │ We embrace  │ │ We work  │  │
│  │ for the     │ │ the highest │ │ creativity  │ │ together │  │
│  │ highest...  │ │ ethical...  │ │ and new...  │ │ towards..│  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘  │
│  ┌─────────────┐ ┌─────────────┐                               │
│  │ Inclusivity │ │ Accounta-   │                               │
│  │             │ │ bility      │                               │
│  └─────────────┘ └─────────────┘                               │
│                                                                  │
│  MOTTO                                                           │
│  "Knowledge is Power"                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Implementation:** MDX content with styled cards

---

### Leadership Page

```
┌─────────────────────────────────────────────────────────────────┐
│ About > Leadership                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  UNIVERSITY LEADERSHIP                                           │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    VICE CHANCELLOR                           ││
│  │  ┌─────────┐                                                 ││
│  │  │         │   Prof. [Name]                                  ││
│  │  │ [Photo] │   Vice Chancellor                               ││
│  │  │         │   PhD, University of...                         ││
│  │  └─────────┘   [View Profile →]                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  DEPUTY VICE CHANCELLORS                                         │
│  ┌───────────────────────┐  ┌───────────────────────┐           │
│  │ [Photo]               │  │ [Photo]               │           │
│  │ Prof. [Name]          │  │ Prof. [Name]          │           │
│  │ DVC Academic, Research│  │ DVC Admin, Planning   │           │
│  │ & Student Affairs     │  │ & Finance             │           │
│  │ [View Profile →]      │  │ [View Profile →]      │           │
│  └───────────────────────┘  └───────────────────────┘           │
│                                                                  │
│  REGISTRARS                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ [Photo]     │  │ [Photo]     │  │ [Photo]     │              │
│  │ Registrar   │  │ Registrar   │  │ Finance     │              │
│  │ Academic    │  │ Admin       │  │ Officer     │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
│  DEANS OF SCHOOLS                                                │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐       │
│  │Dean│ │Dean│ │Dean│ │Dean│ │Dean│ │Dean│ │Dean│ │Dean│       │
│  │Biz │ │Edu │ │IT  │ │Law │ │Hlth│ │Agri│ │Arts│ │Sci │       │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Data Sources:**
- `GET /organogram` - Get organizational structure with leadership roles
- `GET /leadership/university/{root-id}/leadership` - University-level leadership (VC)
- `GET /leadership/division/{division-id}/leadership` - Division leadership (DVCs)
- `GET /leadership/school/{school-id}/leadership` - School leadership (Deans)
- `GET /staff-assignments/entity/university/{id}` - University staff assignments
- Alternative: Parse leadership from `/organogram` response structure

---

### Leader Profile Page

```
┌─────────────────────────────────────────────────────────────────┐
│ About > Leadership > Prof. [Name]                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┬──────────────────────────────────────┐ │
│  │                     │                                      │ │
│  │   ┌───────────┐     │  PROF. [FULL NAME]                   │ │
│  │   │           │     │  Vice Chancellor                     │ │
│  │   │  [Photo]  │     │                                      │ │
│  │   │           │     │  PhD in [Field], University of...    │ │
│  │   └───────────┘     │                                      │ │
│  │                     │  📧 vc@ksu.ac.ke                     │ │
│  │                     │  📞 +254 XXX XXX XXX                 │ │
│  │                     │                                      │ │
│  └─────────────────────┴──────────────────────────────────────┘ │
│                                                                  │
│  MESSAGE FROM THE VICE CHANCELLOR                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │  "Welcome to Kisii University, where we are committed to    ││
│  │   producing graduates who are not only academically         ││
│  │   excellent but also morally upright and ready to serve     ││
│  │   society..."                                                ││
│  │                                                              ││
│  │  [Continue reading...]                                       ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  BIOGRAPHY                                                       │
│  Prof. [Name] has served as Vice Chancellor since 2020...       │
│                                                                  │
│  EDUCATION                                                       │
│  • PhD in [Field], University of..., Year                       │
│  • MSc in [Field], University of..., Year                       │
│  • BSc in [Field], Kisii University, Year                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Data Source:** 
- `GET /people/{person_id}` - Full person profile with education history and bio
- Includes: full_name, title, email, phone, photo_url, biography, education, leadership_message

---

### Governance Page

```
┌─────────────────────────────────────────────────────────────────┐
│ About > Governance                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  GOVERNANCE STRUCTURE                                            │
│  How Kisii University is governed                               │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ [Governance hierarchy diagram]                               ││
│  │                                                              ││
│  │                    ┌───────────────┐                         ││
│  │                    │   COUNCIL     │                         ││
│  │                    │ (Governing    │                         ││
│  │                    │   Body)       │                         ││
│  │                    └───────┬───────┘                         ││
│  │                            │                                 ││
│  │           ┌────────────────┼────────────────┐                ││
│  │           │                │                │                ││
│  │    ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐        ││
│  │    │ MANAGEMENT  │  │   SENATE    │  │  COMMITTEES │        ││
│  │    │   BOARD     │  │ (Academic)  │  │             │        ││
│  │    └─────────────┘  └─────────────┘  └─────────────┘        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  GOVERNING BODIES                                                │
│  ┌─────────────────────┐ ┌─────────────────────┐                │
│  │ UNIVERSITY COUNCIL  │ │ SENATE              │                │
│  │                     │ │                     │                │
│  │ The supreme         │ │ The academic        │                │
│  │ governing body...   │ │ authority...        │                │
│  │                     │ │                     │                │
│  │ [View Council →]    │ │ [View Senate →]     │                │
│  └─────────────────────┘ └─────────────────────┘                │
│  ┌─────────────────────┐ ┌─────────────────────┐                │
│  │ MANAGEMENT BOARD    │ │ COMMITTEES          │                │
│  │                     │ │                     │                │
│  │ Day-to-day          │ │ Standing and        │                │
│  │ operations...       │ │ ad-hoc committees   │                │
│  │                     │ │                     │                │
│  │ [View Board →]      │ │ [View All →]        │                │
│  └─────────────────────┘ └─────────────────────┘                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Data Source:** 
- `GET /governance/boards?page=1&per_page=50&is_public=true` - List all public governance boards
- Returns: board list with type, mandate, chairperson, secretary

---

### Board Detail Page (Council/Senate/etc.)

```
┌─────────────────────────────────────────────────────────────────┐
│ About > Governance > University Council                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  UNIVERSITY COUNCIL                                              │
│  The Supreme Governing Body                                      │
│                                                                  │
│  ABOUT                                                           │
│  The University Council is the supreme governing body of        │
│  Kisii University, responsible for policy direction and         │
│  oversight of the institution...                                │
│                                                                  │
│  MEMBERSHIP                                                      │
│                                                                  │
│  CHAIR                                                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ ┌─────┐  [Name]                                           │  │
│  │ │Photo│  Council Chairperson                              │  │
│  │ └─────┘  [View Profile]                                   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  EX-OFFICIO MEMBERS                                              │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐                   │
│  │ [Photo]    │ │ [Photo]    │ │ [Photo]    │                   │
│  │ Vice       │ │ DVC ARSA   │ │ DVC APF    │                   │
│  │ Chancellor │ │            │ │            │                   │
│  └────────────┘ └────────────┘ └────────────┘                   │
│                                                                  │
│  APPOINTED MEMBERS                                               │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│  │ [Photo]    │ │ [Photo]    │ │ [Photo]    │ │ [Photo]    │   │
│  │ Member     │ │ Member     │ │ Member     │ │ Member     │   │
│  │ Name       │ │ Name       │ │ Name       │ │ Name       │   │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
│                                                                  │
│  MEETINGS                                                        │
│  The Council meets quarterly. Next meeting: [Date]              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Data Source:** 
- `GET /governance/boards/{board_id}` - Get single board by ID
- `GET /staff-assignments/entity/board/{board_id}?page=1&per_page=100` - Get board members (staff assignments)
- Board structure includes: chairperson, secretary, ex-officio members, appointed members

---

### Quality Assurance Page

```
┌─────────────────────────────────────────────────────────────────┐
│ About > Quality Assurance                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  QUALITY ASSURANCE & ACCREDITATION                               │
│                                                                  │
│  ACCREDITATION                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ┌─────┐  Commission for University Education (CUE)         ││
│  │ │ CUE │  Kisii University is fully chartered and          ││
│  │ │Logo │  accredited by CUE.                                ││
│  │ └─────┘  [View Certificate]                                ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  CERTIFICATIONS                                                  │
│  ┌─────────────────────┐ ┌─────────────────────┐                │
│  │ ┌─────┐ ISO 9001    │ │ ┌─────┐ ISO 14001   │                │
│  │ │ ISO │ Quality     │ │ │ ISO │ Environment │                │
│  │ │Logo │ Management  │ │ │Logo │ Management  │                │
│  │ └─────┘             │ │ └─────┘             │                │
│  └─────────────────────┘ └─────────────────────┘                │
│                                                                  │
│  QUALITY ASSURANCE DIRECTORATE                                   │
│  The QA Directorate ensures that the university maintains       │
│  high standards in all academic and administrative processes... │
│                                                                  │
│  [Contact QA Directorate →]                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Implementation:** MDX content + static badges

---

## Components Required

```
components/
├── about/
│   ├── Timeline.tsx
│   ├── LeaderCard.tsx
│   ├── GovernanceChart.tsx
│   ├── BoardMemberGrid.tsx
│   ├── ValueCard.tsx
│   └── AccreditationBadge.tsx
```

---

## Data Sources

| Endpoint | Purpose | Response |
|----------|---------|----------|
| `GET /organogram` | Full organizational structure | Academic tree + Administrative structure with leadership |
| `GET /leadership/university/{root-id}/leadership` | University-level leadership | VC, deputies, coordinators |
| `GET /leadership/division/{division-id}/leadership` | Division/DVC leadership | Division head, deputies, staff |
| `GET /leadership/school/{school-id}/leadership` | School leadership | Dean, coordinators, staff |
| `GET /staff-assignments/entity/{entity_type}/{entity_id}` | Staff for any entity | Paginated list of staff assignments |
| `GET /people/{person_id}` | Individual profile | Person bio, education, contact, photo, leadership message |
| `GET /schools?page=1&per_page=100` | All schools | School list with deans and basic info |
| `GET /governance/boards?is_public=true` | All public boards | Council, Senate, Management Board, Committees |
| `GET /governance/boards/{board_id}` | Single board details | Board mandate, mission, vision, meetings |
| `GET /staff-assignments/entity/board/{board_id}` | Board members | Chairperson, secretary, ex-officio, appointed members |

---

## Static Content (MDX)

```
content/about/
├── history.mdx
├── mission-vision.mdx
├── quality-assurance.mdx
└── strategic-plan.mdx
```

---

## Checklist

---

## Implementation Notes

### API Integration Guidelines

#### Leadership Data Fetching

For the Leadership page, use this strategy:

1. **Call `/organogram` endpoint** to get the full organizational structure
2. **Extract leadership from response**:
   - Top-level university leaders from `academic_tree.children[0]` (VC from head field)
   - DVCs from `administrative_tree` divisions with `level=1` or `2`
   - Deans from schools in `academic_tree` with `school.dean` field

3. **For individual leader profiles**, call `GET /people/{person_id}` with person ID from the staff assignment or organogram

**Optimization**: Cache `/organogram` response for 5-10 minutes as it contains comprehensive leadership structure

#### Board Members Fetching

For boards and governance pages:

1. **Fetch all boards**: `GET /governance/boards?is_public=true&page=1&per_page=50`
2. **For board detail pages**:
   - Get board info: `GET /governance/boards/{board_id}`
   - Get members: `GET /staff-assignments/entity/board/{board_id}?page=1&per_page=100`
   - Parse `chairperson_id` and `secretary_id` from board object for special emphasis

3. **Member categorization**:
   - Ex-officio members: Those with `hierarchy_level=1` or `role` matching keywords like "vice chancellor", "dvc", "registrar"
   - Appointed members: Those with `hierarchy_level=2` or higher

#### Person Profile Data

The `/people/{person_id}` endpoint returns:
- `full_name`, `title`, `rank`, `email`, `phone`
- `photo_url` - absolute URL, can be used directly in `<img src=...>`
- `biography` - long form text
- `education` - JSON array of education records with fields like `degree`, `institution`, `year`
- `leadership_message` - personal message from leader (may be null)

### Response Envelope

All endpoints return responses in this format:

```json
{
  "data": { ... },
  "error": null,
  "meta": { 
    "page": 1,
    "per_page": 50,
    "total": 127,
    "pages": 3
  }
}
```

### Caching Strategy

- `/organogram` - Cache for 10 minutes (changes infrequently)
- `/people/{id}` - Cache for 30 minutes
- `/governance/boards` - Cache for 10 minutes
- Individual board detail pages - Cache for 15 minutes

### Error Handling

- If leadership endpoint returns empty, check that entity exists and is not deleted
- If photo_url is null, use fallback avatar with initials
- If education array is empty or null, omit education section on profile page
- Gracefully handle boards with no chairperson/secretary (show "TBD" or leave empty)

### Frontend Component Props

**LeaderCard Component**:
```typescript
interface LeaderCard {
  id: string;
  fullName: string;
  title: string;
  designation?: string;
  photoUrl?: string;
  role?: string;
  email?: string;
  phone?: string;
  onClick?: () => void;
}
```

**BoardMemberGrid Component**:
```typescript
interface BoardMember {
  id: string;
  fullName: string;
  title: string;
  role: 'chairperson' | 'secretary' | 'exOfficio' | 'appointed';
  photoUrl?: string;
  designation?: string;
}
```

### Testing the Integration

1. Verify all leadership endpoints return properly formatted staff assignments
2. Test board detail pages load members without 404 errors
3. Ensure photo URLs are absolute and images load
4. Test pagination on large board member lists (>20 members)
5. Verify caching headers are present in responses
