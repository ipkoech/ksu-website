# Research source import — 8 September 2026

The shared `ksu_common/research_source_catalog.json` contains the supplied Word
documents as paragraphs/tables, the official site's fetched page text and URLs,
normalized records, image hashes and original filenames. It is the reproducible
input for both service seeders; a seed run does not depend on the old live site.

Inputs: the five DOCX files and conference photograph in
`frontend/apps/admin/public/design-references/research`, plus
https://kisiiuniversity.ac.ke/researc/2b25301b-de41-435a-a8f1-763f78cd3df2
and its research section links. The snapshot contains 123 successful page fetches
and one 404 for a duplicate funding-navigation URL.

## Mapping and source limitations

- 39 register rows become 36 projects: rows 23/1, 24/8 and 34/30 are duplicates.
  Two additional live projects bring the catalog to 38. Every original row,
  investigator string and funder attribution is retained in `source_references`.
- The two SPAVPA rows are retained separately because their titles, investigator
  roles and funding attributions differ. No unsupported consolidation is made.
- Project investigators and schools retain source names until linked to Main
  identities; no staff identities, project dates or percentage progress are invented.
- 19 RZ registrations are copyrights, not patents. Six other exhibited
  innovations and three award results come from the Innovation Week report.
  Event participation (97), exhibited innovations (89), the narrative reference
  to 13 registrations and the 19-row register remain separately attributed.
- Research owns projects, funders, grants, scholarships, innovations, competition
  results, training, farm, sustainability, metrics and outreach stories. Main owns
  media, organizational office content, news and events.
- Funding notices preserve their historical text and original dates. They are
  published notices, not claims of currently open applications; reseeding never
  moves a deadline into the future. Mixed directories and consultancy notices
  are resources; scholarship notices are scholarships. Awarded scholarships are
  separate from the ten recorded external grant awards.
- Empty live policy/publication/ethics pages are resources linking to the source,
  not invented policy documents or scholarly publications.
- The 260,000 seedlings figure is a propagation commitment. The recorded output
  is 89,800 planted seedlings; neither is substituted for the other. Equity's
  30,800 seedlings and Safaricom's 500/4,500 donations are separate indicators,
  not additional totals to sum into overall planting.
- Original photographs are copied unchanged and registered with deterministic
  media IDs. Project pages use the conference photograph as a general research
  image because the project register supplies no project-specific photographs.
- The conference photo does not specify a timetable, so it is published as news.
  Innovation Week has calendar dates April 7–10, 2026, marked as an all-day event.
  September 8 publication timestamps indicate import publication, not event dates.

## Run

Apply the Research migration first (`alembic upgrade head`). Then run in each
service environment:

```sh
# Main (after the normal organizational seeds)
python -m app.seeders.seed_research_sources
# Research
python -m app.seeders.seed_research
```

For the explicitly requested replacement of the local project catalog:

```sh
python -m app.seeders.seed_research --replace-projects
```

Replacement soft-removes other projects from public listings and retains their
history and relationships. Ordinary runs retire only the known legacy sample
records. Both seeders have been exercised twice in rollback transactions.
Deploy the verified image directory with the Research, Admin and Web frontends.
