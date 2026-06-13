# Research Page Design Guidelines

## Global Rules

- Match the current public site: typography, spacing, restrained color use, full-width bands, and the established three-column content rhythm.
- Use the research landing page as the only research page with a full hero. Inner pages should open with a compact title band, filters or context, and content.
- Pull content from backend APIs. Do not seed public pages with dummy cards.
- Prefer relationship-aware sections: related projects, programs, centers, outputs, partners, funders, events, and people.
- Keep cards shallow. Cards are for repeated records, not page sections inside other cards.
- Use images where they add meaning: landing, farm, sustainability, community impact, innovation, partners, and selected records with image URLs.
- Use public language: "Research work", "Outputs", "Supported by", "Partners", "How to apply", "Downloads"; avoid backend/model language.

## Navigation

- Keep the current public styling for the utility and main navigation.
- Mirror the older research information architecture in the main nav items.
- Main groups: Discovery, Publications and Outputs, Funding and Support, Extension and Community, Innovation and Partnerships, Learning and Updates.
- Dropdown links should point to backend-backed sections and avoid placeholder destinations.

## `/` Research Landing

Design image: [images/research-landing-page.png](images/research-landing-page.png)

- Use a full-width image-led hero that says what KSU Research does and shows research in action.
- Follow with three-column core workflows: Discovery, Funding, Outputs.
- Include a "Message from the Registrar REIRM" section with image, title, and backend-managed message content.
- Surface featured projects, publications or outputs, upcoming funding deadlines, partners, and events.
- Add scroll reveal only as progressive enhancement; page content must remain readable without animation.

## Discovery / Research Work

### `/projects`

Design image: [images/discovery-project-listing.png](images/discovery-project-listing.png)

- Show a compact page title, then filters for search, year, type, status, program, and center.
- Provide sorting for newest, closing/completion date where relevant, featured, and title.
- Use three-column project cards on desktop. Cards should show project type, status, year/date range, lead unit, summary, and related program/center.
- Status colors should be restrained and consistent: active, completed, proposed, paused.
- Empty state should explain that no matching research work is currently published.

### `/projects/[slug]`

Design image: [images/discovery-project-detail.png](images/discovery-project-detail.png)

- Open with the project title, status, date range, lead program/center, and clear summary.
- Use a two-column detail layout: primary narrative on the left, facts and actions on the right.
- Show public-friendly relationships: "Part of this program", "Hosted by this center", "Research outputs", "Partners", "Funding support", "Team".
- Include methodology, objectives, expected outcomes, and community or policy relevance when present.

### `/programs` and `/programs/[slug]`

Design image: [images/discovery-program-center-detail.png](images/discovery-program-center-detail.png)

- Listing should group programs by type or focus area and show whether they currently contain projects.
- Detail should make the program feel like a research pathway: overview, focus areas, active projects, outputs, center relationship, people, and calls to participate.
- If a program has no projects, show program information and a neutral "No published projects yet" state.

### `/centers` and `/centers/[slug]`

Design image: [images/discovery-program-center-detail.png](images/discovery-program-center-detail.png)

- Treat centers as institutional research homes, not generic cards.
- Detail should show center overview, head/contact, programs, projects, publications/outputs, facilities, partners, and events.
- Use a three-column relationship grid for active projects, outputs, and opportunities.

### `/expertise`

- Use a searchable directory layout with filters for field, center, program, and availability.
- Cards should show name, role, specialization, center/program affiliation, and links to projects or outputs.
- Avoid staff-profile hero sections.

### `/facilities`

- Use an image-led listing if facility images are available.
- Filters: facility type, center, availability, service category.
- Detail should show capability, location, access process, related projects, booking/contact, and safety/downloadable resources.

## Publications / Outputs

### `/publications`

Design image: [images/publications-outputs-listing.png](images/publications-outputs-listing.png)

- Use a research-library layout with filters for search, year, publication type, access type, center, project, and author.
- Cards/list rows should prioritize title, year, venue or publisher, authors, DOI/access link, and related project.
- Keep filters visible and compact; this page is for scanning.

### `/publications/[slug]`

Design image: [images/publication-detail.png](images/publication-detail.png)

- Use public labels: "About this publication", "Published in", "Authors", "Research context", "Access", "Citation".
- Show project, center, themes, journal/publisher/conference, DOI, download, and external links when present.
- Avoid backend terms such as `project_id`, `center_id`, or `publication_type`.

### `/outputs`

Design image: [images/publications-outputs-listing.png](images/publications-outputs-listing.png)

- Similar to publications, but with output type, usage, repository/download, version, license, and related project.
- Filters: output type, year/date, access, center, project, keyword.

### `/outputs/[slug]`

Design image: [images/research-output-detail.png](images/research-output-detail.png)

- Explain what the output is, who can use it, how to cite it, and which project produced it.
- Include download/repository/actions near the top and repeat them after the description.

## Funding / Support

### `/funding`

Design image: [images/funding-opportunity-board.png](images/funding-opportunity-board.png)

- Use an opportunity-board layout with internal funding receiving richer treatment than external funding.
- Filters: grant type, category, status, deadline window, funder, focus area.
- Deadline badges should be color-coded: open, closing soon, due today/overdue, closed, no deadline.
- Show application flow: eligibility, documents, guidelines, deadline, apply/contact action.

### `/funding/[slug]`

Design images: [images/internal-funding-detail.png](images/internal-funding-detail.png), [images/external-funding-detail.png](images/external-funding-detail.png)

- Internal grants should show full workflow: overview, eligibility, award range, deadlines, requirements, documents, guidelines, review timeline, apply action.
- External grants should prioritize funder, external link, deadline, eligibility summary, and documents.
- Use `total_budget`, `min_award`, `max_award`, `currency`, `documents`, and `guidelines`; do not reference a non-existent generic amount field.

### `/scholarships` and `/scholarships/[slug]`

- Use a funding-support variant with eligibility, level, award value, deadline, documents, and application/contact.
- Detail should show the application sequence and downloadable resources.

### `/guidelines` and `/guidelines/[slug]`

- Use a document-library pattern.
- Filters: topic/category, grant type, required/optional, updated date.
- Detail should show purpose, applicable funding/program, document link, version/date, and related forms.

### `/forms`

- Use a compact resource table with form title, category, applies to, file type, last updated, and download action.
- Provide search and category filters.

### `/resources-tools` and `/resources-tools/[slug]`

- Use an information-resource layout for templates, tools, policies, and downloads.
- Detail should explain when to use the resource, related workflow, and download/external link.

### `/services` and `/services/[slug]`

- Use service catalogue cards: service name, who it is for, process, contact, and required documents.
- Detail should show steps, turnaround time if available, and related resources.

## Extension / Community / Sustainability

### `/community-impact`

Design image: [images/community-impact-overview.png](images/community-impact-overview.png)

- Use impact pathways: community engagement, extension, sustainability, farm demonstrations, policy/practice change.
- Surface impact stories, active projects, partner communities, events, and metrics.

### `/farm` and `/farm/[slug]`

Design image: [images/research-farm-landing.png](images/research-farm-landing.png)

- Treat the farm as a mini-site, with a strong image-led landing section and a message from the farm head.
- Sections: what happens here, demonstration units, active projects, training, community extension, partners, facilities, outputs.
- Detail should show farm activity/project relationships and practical visitor/contact information.

### `/sustainability` and `/sustainability/[slug]`

Design image: [images/sustainability-landing.png](images/sustainability-landing.png)

- Treat sustainability as a mini-site with pillars, initiatives, projects, partners, metrics, stories, and head message.
- Use image-led sections and relationship panels for related projects, outputs, events, and partners.

## Innovation / Partnerships

### `/innovations`

Design image: [images/innovation-partnership-overview.png](images/innovation-partnership-overview.png)

- Show innovation as a pathway from problem to solution to adoption.
- Filters: innovation type, development stage, TRL, IP status, commercialization status, center, project.
- Cards should show problem addressed, solution, stage, IP/commercial status, and sponsoring partners.

### `/innovations/[slug]`

Design image: [images/innovation-detail.png](images/innovation-detail.png)

- Detail should show problem, solution, applications, target users, benefits, development stage, IP status, inventors, project/center, sponsors, and outputs.
- Keep commercial/IP information clear but not overly technical.

### `/partners`

Design image: [images/partner-profile.png](images/partner-profile.png)

- Listing should filter by partner type, level, country, focus area, and active status.
- Cards should show partner identity, collaboration areas, and what they support.

### `/partners/[slug]`

Design image: [images/partner-profile.png](images/partner-profile.png)

- Profile should show about, collaboration areas, partnership dates/MOU where public, key achievements, sponsored projects, funded centers, innovations, consultancies, and outputs.
- Use relationship labels such as "Supports", "Collaborates on", and "Outputs from this partnership".

### `/consultancies` and `/consultancies/[slug]`

Design image: [images/consultancy-endowment-patterns.png](images/consultancy-endowment-patterns.png)

- Listing should filter by consultancy type, client type, status, center, date, and country.
- Detail should show client/partner, objectives, methodology, deliverables, outcomes, impact, team, and related outputs.

### `/endowments` and `/endowments/[slug]`

Design image: [images/consultancy-endowment-patterns.png](images/consultancy-endowment-patterns.png)

- Endowments are information publishing pages.
- Show purpose, donor message, fund value/distribution where public, eligibility/use guidelines, contribution status, and contact.

## Learning / Events / Updates

### `/training` and `/training/[slug]`

Design image: [images/learning-training-catalogue.png](images/learning-training-catalogue.png)

- Use a learning catalogue with filters for program type, delivery mode, date, center, category, certificate availability, and registration status.
- Detail should show objectives, target audience, curriculum, facilitators, schedule, venue/platform, fees, certificate/CPD, materials, and registration action.

### `/mentorship` and `/mentorship/[slug]`

Design image: [images/mentorship-pathway.png](images/mentorship-pathway.png)

- Use a pathway layout: mentor/mentee fit, expectations, cohort dates, application window, capacity, and benefits.
- Detail should show program requirements, guidelines, coordinator, brochure, and application action.

### `/events` and `/events/[slug]`

Design image: [images/events-calendar-detail.png](images/events-calendar-detail.png)

- Use a calendar/list hybrid with filters for event type, date, center, format, registration required, and status.
- Detail should show agenda, speakers, date/time/timezone, venue or online platform, registration, fees, recording, and related research work.

### `/news` and `/news/[slug]`

Design image: [images/research-news-updates.png](images/research-news-updates.png)

- Use an editorial update layout with pinned/featured items, filters for news type/category, center, project, publication, innovation, and date.
- Detail should show source/author, published date, related research entities, media, tags, and external source where applicable.
