"""Seed initial Page CMS homepage sections and partnership spotlight content."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Accommodation, ArtsCulture, Club, News, PageSection, PartnershipSpotlight, SectionItem, SportsFacility, StudentGovernance
from app.services.research_partners import ResearchPartnersProxyService

from ._shared import SeedContext


SEED_OWNER = "page-cms-homepage-v1"
SEED_VERSION = 6
PENDING_HERI_AFRICA_SOURCE_ID = uuid.UUID("8d724ec7-3b5b-54f8-b3f3-8770f627dd6a")
PENDING_HERI_AFRICA_HEADLINE = "Heri Africa partnership spotlight pending"


HOMEPAGE_SECTION_SPECS: tuple[dict[str, Any], ...] = (
    {
        "section_key": "hero-admissions",
        "layout_variant": "hero_admissions",
        "display_order": 10,
        "title": "Shaping Tomorrow. Inspiring Innovation.",
        "subtitle": "Kisii University",
        "description": "A leading public university committed to academic excellence, innovative research, and transforming communities across Kenya and beyond.",
        "settings": {
            "eyebrow": "Kisii University",
            "backgroundRole": "heroImage",
            "primaryCta": {"label": "Study With Us", "href": "/admissions/how-to-apply"},
            "secondaryCta": {"label": "Explore Programmes", "href": "/academics/programmes"},
            "tertiaryCta": {"label": "Discover KSU", "href": "/about"},
        },
        "items": (
            {
                "item_type": "cta",
                "title": "Study With Us",
                "body_text": "Start your application and review entry requirements.",
                "cta_label": "Study With Us",
                "cta_url": "/admissions/how-to-apply",
                "display_order": 10,
                "content": {"intent": "primary"},
            },
            {
                "item_type": "cta",
                "title": "Explore Programmes",
                "body_text": "Browse diploma, undergraduate and postgraduate study options.",
                "cta_label": "Explore Programmes",
                "cta_url": "/academics/programmes",
                "display_order": 20,
                "content": {"intent": "secondary"},
            },
            {
                "item_type": "cta",
                "title": "Discover KSU",
                "body_text": "Learn about the university, its history and its mission.",
                "cta_label": "Discover KSU",
                "cta_url": "/about",
                "display_order": 30,
                "content": {"intent": "tertiary"},
            },
        ),
    },
    {
        "section_key": "why-kisii",
        "layout_variant": "pillar_grid",
        "display_order": 40,
        "title": "Why Kisii University?",
        "subtitle": "Why choose KSU",
        "description": "An inclusive, borderless public university   advancing teaching, research and community engagement for learners and communities in Kenya and beyond.",
        "settings": {"presentation": "story_chapters"},
        "items": (
            {
                "item_type": "card",
                "title": "Teaching",
                "body_text": (
                    "Teaching at Kisii University begins with a simple conviction: every learner deserves "
                    "instruction that transforms. In lecture halls like the Sakagwa Academic Block, experienced "
                    "faculty guide students through accredited programmes stretching from certificate level to "
                    "doctoral research   in education, business, health sciences, law, agriculture and the pure "
                    "and applied sciences. Learning is deliberately practical: coursework connects to fieldwork, "
                    "laboratories to industry, and assessment to the competencies Kenya's workforce actually "
                    "demands. And because KSU is proudly borderless, those halls hold students from every county "
                    "in Kenya and from across East Africa and beyond   learning side by side, on campus and "
                    "through flexible, school-based modes that meet learners where they are. Whoever you are and "
                    "wherever you begin, teaching here is designed to take you further than you thought possible."
                ),
                "cta_label": "Explore academics",
                "cta_url": "/academics",
                "display_order": 10,
                "content": {"imageUrl": "/images/landing-page/why-kisii/sakgwa-academic-block.jpg", "imageAlt": "The Sakagwa Academic Block at Kisii University", "icon": "teaching"},
            },
            {
                "item_type": "card",
                "title": "Research",
                "body_text": (
                    "Research at Kisii University is anchored on a simple test: does it change anything? From the "
                    "university's research centres, faculty and postgraduate students pursue questions drawn from "
                    "real life   food security on smallholder farms, disease burdens in county health systems, "
                    "literacy in early classrooms, and technology built for African realities. The university "
                    "publishes, wins grants and hosts international collaborations   including the HERI-Africa "
                    "Research Chair in Language Education   yet measures success by impact rather than output "
                    "alone. Research training starts early: undergraduates join projects as assistants, "
                    "postgraduates are mentored toward publication, and findings are shared openly with the "
                    "policymakers and practitioners who can use them. This is inquiry without borders   "
                    "connecting Kisii to networks across Africa and the world, and always bringing what is "
                    "learned back home."
                ),
                "cta_label": "Explore research",
                "cta_url": "/research",
                "display_order": 20,
                "content": {"imageUrl": "/images/landing-page/why-kisii/bg-3.jpg", "imageAlt": "The Kisii University tower rising above campus", "icon": "research"},
            },
            {
                "item_type": "card",
                "title": "Community Engagement",
                "body_text": (
                    "The gate on the hill welcomes more than students. Farmers, teachers, entrepreneurs and "
                    "county officials all walk through it, because Kisii University treats its neighbours as "
                    "partners in everything it does. Knowledge flows outward through medical camps and health "
                    "outreach, agricultural extension in the Gusii highlands, literacy programmes in local "
                    "schools, business incubation for young entrepreneurs, and public lectures open to all. And "
                    "engagement is a two-way street: communities bring the questions that shape the university's "
                    "teaching and research, and the university returns evidence, skills and service. Inclusivity "
                    "is the thread running through it all   KSU serves learners and neighbours regardless of "
                    "background, gender, ability or origin. A borderless university is, in the end, simply one "
                    "whose gates never close: to ideas, to partnership, and to every community it exists to serve."
                ),
                "cta_label": "Learn more",
                "cta_url": "/research/partnerships",
                "display_order": 30,
                "content": {"imageUrl": "/images/landing-page/why-kisii/pathway-2.jpg", "imageAlt": "The open main gate of Kisii University", "icon": "community"},
            },
            {
                "item_type": "card",
                "title": "Inclusivity & Borderlessness",
                "body_text": (
                    "Inclusivity and borderlessness are not slogans at Kisii University   they are how the "
                    "institution is built. Admission is open to talent from every background: students arrive "
                    "from all corners of Kenya, from across East Africa and beyond, and find a campus where "
                    "gender equity, disability support and student welfare are treated as foundations rather "
                    "than afterthoughts. Learning crosses borders too: flexible, school-based and "
                    "technology-enabled modes carry KSU's programmes to working adults, teachers upgrading "
                    "their skills and learners far from Kisii town. Partnerships stretch the university outward "
                    "  from county governments to continental networks like HERI-Africa   so that ideas, staff "
                    "and students move freely between institutions and countries. The result is a university "
                    "without walls in every sense that matters: open in admission, open in delivery, and open "
                    "to the world. Everyone with the will to learn has a place here."
                ),
                "cta_label": "Explore campus life",
                "cta_url": "/campus-life",
                "display_order": 40,
                "content": {"imageUrl": "/images/backgrounds/KSUB-RollPhotos2025-123.jpg", "imageAlt": "Kisii University students on campus", "icon": "inclusion"},
            },
        ),
    },
    {
        "section_key": "featured-partnership",
        "layout_variant": "featured_partnership",
        "display_order": 30,
        "title": "Kisii University & Heri Africa Building Africa Together.",
        "subtitle": "Strategic partnership",
        "description": "Partnering to advance innovation, entrepreneurship, digital transformation and community impact across Africa.",
        "settings": {
            "spotlightKey": "heri-africa",
            "spotlightSourceType": "research_partner",
            "cta": {"label": "Explore More", "href": "/heri-africa"},
        },
        "items": (
            {
                "item_type": "card",
                "title": "Heri Africa spotlight",
                "body_text": "Connect public-facing partnership content to the research partner source record.",
                "cta_label": "Read More",
                "cta_url": "/heri-africa",
                "display_order": 10,
                "content": {"spotlightSlug": "heri-africa"},
            },
            {
                "item_type": "card",
                "title": "The initiative",
                "body_text": (
                    "HERI-Africa   Harnessing Education Research for Impact in Africa   is a Pan-African "
                    "initiative bringing together collaborators from government, universities and civil society "
                    "research organizations, working to raise the impact of education research on the continent "
                    "from 3% to 30% by 2050."
                ),
                "display_order": 20,
                "content": {"group": "chapter"},
            },
            {
                "item_type": "card",
                "title": "Kisii University's role",
                "subtitle": "The Research Chair in Language Education",
                "body_text": (
                    "A leading Africa-led Centre of Excellence in language education research   advancing "
                    "foundational literacy, educational transformation, and global societal impact. The Chair "
                    "advances impactful, policy-responsive, and practice-oriented research in language education "
                    "and foundational literacy for educational transformation in Africa and beyond."
                ),
                "display_order": 30,
                "content": {
                    "group": "chapter",
                    "values": [
                        "Excellence",
                        "Collaboration",
                        "Inclusivity",
                        "Accountability",
                        "Innovation",
                        "Responsiveness",
                        "Integrity",
                        "African-Centred knowledge",
                    ],
                },
            },
        ),
    },
    {
        "section_key": "programme-finder",
        "layout_variant": "programme_finder",
        "display_order": 50,
        "title": "Find the right programme. Build your future.",
        "subtitle": "Programmes and academic pathways",
        "description": "Search programmes and follow the five steps from programme choice to campus reporting.",
        "settings": {
            "filters": ["level", "school", "studyMode"],
            "defaultQuery": "",
            "cta": {"label": "Browse all programmes", "href": "/programmes"},
        },
        "items": (
            {"item_type": "card", "title": "Health Sciences", "cta_url": "/academics/programmes", "display_order": 10, "content": {"group": "category", "icon": "health"}},
            {"item_type": "card", "title": "Business & Economics", "cta_url": "/academics/programmes", "display_order": 20, "content": {"group": "category", "icon": "business"}},
            {"item_type": "card", "title": "ICT & Computing", "cta_url": "/academics/programmes", "display_order": 30, "content": {"group": "category", "icon": "computing"}},
            {"item_type": "card", "title": "Engineering", "cta_url": "/academics/programmes", "display_order": 40, "content": {"group": "category", "icon": "engineering"}},
            {"item_type": "card", "title": "Law & Governance", "cta_url": "/academics/programmes", "display_order": 50, "content": {"group": "category", "icon": "law"}},
            {"item_type": "card", "title": "Choose programme", "body_text": "Find a programme that matches your goals.", "display_order": 110, "content": {"group": "journey", "step": 1}},
            {"item_type": "card", "title": "Check entry requirements", "body_text": "Review the academic and supporting requirements.", "display_order": 120, "content": {"group": "journey", "step": 2}},
            {"item_type": "card", "title": "Submit application", "body_text": "Apply online and upload the required documents.", "display_order": 130, "content": {"group": "journey", "step": 3}},
            {"item_type": "card", "title": "Receive offer", "body_text": "Successful applicants receive admission information.", "display_order": 140, "content": {"group": "journey", "step": 4}},
            {"item_type": "card", "title": "Report to campus", "body_text": "Join the university and begin your journey.", "display_order": 150, "content": {"group": "journey", "step": 5}},
        ),
    },
    {
        "section_key": "academic-dates",
        "layout_variant": "date_timeline",
        "display_order": 55,
        "title": "Key dates",
        "subtitle": "Admissions and reporting",
        "description": "Confirm official dates before completing an application or reporting to campus.",
        "settings": {"cta": {"label": "View academic calendar", "href": "/academics/calendar"}},
        "items": (
            {"item_type": "card", "title": "Next intake opens", "subtitle": "Admissions", "body_text": "Review the current intake announcement.", "cta_url": "/admissions", "display_order": 10, "content": {"date": "Published by Admissions"}},
            {"item_type": "card", "title": "Application period", "subtitle": "Applications", "body_text": "Check the active application window.", "cta_url": "/admissions/how-to-apply", "display_order": 20, "content": {"date": "See official notice"}},
            {"item_type": "card", "title": "Admission letters", "subtitle": "Applicants", "body_text": "Access admission information through the applicant portal.", "cta_url": "/admissions", "display_order": 30, "content": {"date": "When published"}},
            {"item_type": "card", "title": "Reporting date", "subtitle": "New students", "body_text": "Follow the reporting instructions for your intake.", "cta_url": "/admissions", "display_order": 40, "content": {"date": "See intake details"}},
        ),
    },
    {
        "section_key": "campus-life",
        "layout_variant": "media_mosaic",
        "display_order": 90,
        "title": "Life Around Studies",
        "subtitle": "Life around studies",
        "description": "Culture, service, innovation, careers and community: the campus in motion, told through the students living it.",
        "settings": {"cta": {"label": "Explore campus life", "href": "/campus-life"}},
        "items": (
            {"item_type": "media", "title": "Art & Culture", "body_text": "The Cultural Festival spills from campus into the streets of Kisii Town in a celebration of heritage, diversity and national pride.", "cta_label": "Discover culture", "cta_url": "/campus-life#art-culture", "display_order": 10, "source_type": "arts", "is_featured": True, "content": {"imageUrl": "/images/student-life/cultural-festival-11th/image1.jpg", "imageAlt": "Procession at the 11th Kisii University Cultural Festival", "storySlug": "cultural-festival-11th"}},
            {"item_type": "media", "title": "Careers", "body_text": "Career guidance, mentorship and student-led professional summits connect students to the world of work before graduation.", "cta_label": "Explore careers", "cta_url": "/campus-life#careers", "display_order": 20, "source_type": "manual", "is_featured": True, "content": {"imageUrl": "/images/student-life/career-guidance/image4.jpg", "imageAlt": "Career guidance session at Kisii University", "storySlug": "career-guidance"}},
            {"item_type": "media", "title": "Student Health", "body_text": "From campus health services to student volunteers trained to save lives when seconds matter.", "cta_label": "Explore health", "cta_url": "/campus-life#student-health", "display_order": 30, "source_type": "manual", "is_featured": True, "content": {"imageUrl": "/images/student-life/st-john-95th-parade/image2.jpg", "imageAlt": "St. John Ambulance Kisii University Division members", "storySlug": "st-john-lifesavers"}},
            {"item_type": "media", "title": "Leadership", "body_text": "Leadership is practised, not just taught: national parades, student government and evenings honouring excellence.", "cta_label": "See leadership", "cta_url": "/campus-life#leadership", "display_order": 40, "source_type": "governance", "is_featured": True, "content": {"imageUrl": "/images/student-life/st-john-95th-parade/image1.jpg", "imageAlt": "Kisii University members at the 95th St. John Annual Parade", "storySlug": "st-john-95th-parade"}},
            {"item_type": "media", "title": "Research & Innovation", "body_text": "Innovation Week turned campus into a marketplace of ideas: 300+ participants and 97 exhibitors co-creating a sustainable future.", "cta_label": "Explore innovation", "cta_url": "/campus-life#research-innovation", "display_order": 50, "source_type": "manual", "is_featured": True, "content": {"imageUrl": "/images/student-life/innovation-week/image3.jpg", "imageAlt": "Exhibition during Kisii University's inaugural Innovation Week", "storySlug": "innovation-week"}},
            {"item_type": "media", "title": "Clubs & Societies", "body_text": "Dozens of societies turn interests into impact, including clubs recognised at State House for national contribution.", "cta_label": "Explore clubs", "cta_url": "/campus-life#clubs-societies", "display_order": 60, "source_type": "club", "is_featured": True, "content": {"imageUrl": "/images/student-life/best-tax-club-award/image1.jpg", "imageAlt": "Kisii University Tax Club recognition at State House", "storySlug": "best-tax-club-award"}},
            {"item_type": "media", "title": "Accommodation", "body_text": "A supportive place to live and learn, close to lectures, libraries and the communities that make campus home.", "cta_label": "View accommodation", "cta_url": "/campus-life#accommodation", "display_order": 70, "source_type": "accommodation", "audience": "prospective", "content": {"imageUrl": "/images/homepage/kisii-administration-campus.jpg", "imageAlt": "Kisii University campus"}},
        ),
    },
    {
        "section_key": "leadership-activity",
        "layout_variant": "leadership_activity",
        "display_order": 60,
        "title": "Leadership in action",
        "subtitle": "Vice Chancellor",
        "description": "Our leadership advances knowledge, nurtures talent and transforms communities.",
        "settings": {"leaderName": "Prof. Charles O. Ong’ondo, PhD", "leaderTitle": "Vice Chancellor", "leaderImage": "/logos/vc3.jpg", "cta": {"label": "Meet our leadership", "href": "/about/vice-chancellor"}},
        "items": (
            {"item_type": "card", "title": "AI & Data Science Centre launched", "cta_url": "/news", "display_order": 10, "content": {"category": "Innovation", "date": "Latest activity", "imageUrl": "/images/about/about-quality-assurance-branded.webp"}},
            {"item_type": "card", "title": "MoU signed with the University of Pretoria", "cta_url": "/news", "display_order": 20, "content": {"category": "Partnership", "date": "Latest activity", "imageUrl": "/images/about/about-governance-branded.webp"}},
            {"item_type": "card", "title": "UNESCO delegation visits Kisii University", "cta_url": "/news", "display_order": 30, "content": {"category": "Global engagement", "date": "Latest activity", "imageUrl": "/images/about/about-management-branded.webp"}},
            {"item_type": "card", "title": "Student leaders engagement forum", "cta_url": "/news", "display_order": 40, "content": {"category": "Leadership", "date": "Latest activity", "imageUrl": "/images/backgrounds/KSUB-RollPhotos2025-123.jpg"}},
        ),
    },
    {
        "section_key": "research-impact",
        "layout_variant": "research_cards",
        "display_order": 70,
        "title": "Transforming Communities Through Research",
        "subtitle": "Research and innovation",
        "description": "Our research addresses real-world challenges and creates sustainable solutions for society.",
        "settings": {
            "backgroundImage": "/images/research/research-impact-bg.png",
            "cta": {"label": "Explore research", "href": "/research"},
        },
        "items": (
            {"item_type": "card", "title": "Climate-Resilient Agriculture", "body_text": "Improving food security through innovative farming.", "cta_url": "/research", "display_order": 10, "content": {"imageUrl": "/images/history/KSUGreenLandscapingMay2026-3885.jpg"}},
            {"item_type": "card", "title": "Healthcare Innovation", "body_text": "Advancing health solutions for better communities.", "cta_url": "/research", "display_order": 20, "content": {"imageUrl": "/images/about/about-service-charter-branded.webp"}},
            {"item_type": "card", "title": "AI & Digital Solutions", "body_text": "Developing intelligent systems for African futures.", "cta_url": "/research", "display_order": 30, "content": {"imageUrl": "/images/about/about-quality-assurance-branded.webp"}},
            {"item_type": "card", "title": "Renewable Energy Research", "body_text": "Building sustainable energy pathways.", "cta_url": "/research", "display_order": 40, "content": {"imageUrl": "/images/history/KSUGreenLandscapingMay2026-3810.jpg"}},
            {"item_type": "card", "title": "Law & Social Justice", "body_text": "Promoting justice, equity and good governance.", "cta_url": "/research", "display_order": 50, "content": {"imageUrl": "/images/about/about-governance-branded.webp"}},
        ),
    },
    {
        "section_key": "latest-news",
        "layout_variant": "news_grid",
        "display_order": 100,
        "title": "Latest News & Stories",
        "subtitle": "University news",
        "description": "Official stories from across Kisii University.",
        "settings": {"cta": {"label": "View all news", "href": "/news"}},
        "items": (
            {"item_type": "card", "title": "Kisii University celebrates graduation", "cta_url": "/news", "display_order": 10, "content": {"category": "Graduation", "date": "Latest", "imageUrl": "/images/backgrounds/KSUB-RollPhotos2025-123.jpg"}},
            {"item_type": "card", "title": "Climate resilience research advances", "cta_url": "/news", "display_order": 20, "content": {"category": "Research", "date": "Latest", "imageUrl": "/images/history/KSUGreenLandscapingMay2026-3885.jpg"}},
            {"item_type": "card", "title": "University expands strategic partnerships", "cta_url": "/news", "display_order": 30, "content": {"category": "Partnership", "date": "Latest", "imageUrl": "/images/about/about-governance-branded.webp"}},
            {"item_type": "card", "title": "Students excel in regional competition", "cta_url": "/news", "display_order": 40, "content": {"category": "Student life", "date": "Latest", "imageUrl": "/images/backgrounds/KSUB-RollPhotos2025-123.jpg"}},
        ),
    },
    {
        "section_key": "upcoming-events",
        "layout_variant": "events_list",
        "display_order": 110,
        "title": "Upcoming Events",
        "subtitle": "Save the date",
        "description": "Upcoming public lectures, research activities and ceremonies.",
        "settings": {"cta": {"label": "View all events", "href": "/events"}},
        "items": (
            {"item_type": "card", "title": "Public Lecture", "subtitle": "Main Campus", "cta_url": "/events", "display_order": 10, "content": {"date": "15 May", "time": "10:00 AM"}},
            {"item_type": "card", "title": "Research & Innovation Week", "subtitle": "Main Campus", "cta_url": "/events", "display_order": 20, "content": {"date": "24 May", "time": "All day"}},
            {"item_type": "card", "title": "Graduation Ceremony", "subtitle": "Main Campus", "cta_url": "/events", "display_order": 30, "content": {"date": "27 Jun", "time": "9:00 AM"}},
        ),
    },
    {
        "section_key": "partners",
        "layout_variant": "logo_carousel",
        "display_order": 80,
        "title": "A network advancing learning, research and community impact.",
        "subtitle": "Our partners",
        "description": "Kisii University works with academic, industry, government and development partners to expand opportunity and translate knowledge into public value.",
        "settings": {"presentation": "wordmarks", "source": "research_partners"},
        "items": tuple(
            {"item_type": "card", "title": name, "display_order": order, "content": {"label": name}}
            for order, name in enumerate(("UNESCO", "World Health Organization", "Google", "KEMRI", "JICA", "Microsoft", "USAID", "Safaricom"), start=10)
        ),
    },
    {
        "section_key": "alumni-impact",
        "layout_variant": "alumni_story",
        "display_order": 130,
        "title": "Alumni Making Impact",
        "subtitle": "Alumni success story",
        "description": "Our alumni carry Kisii University knowledge and service into communities around the world.",
        "settings": {"imageUrl": "/images/about/about-leadership.webp"},
        "items": (
            {"item_type": "card", "title": "Dr. Mercy Nyanchoka", "subtitle": "Medical Doctor and Kisii University alumna", "body_text": "Kisii University gave me the foundation and confidence to pursue my dreams and make a difference.", "cta_label": "View more alumni stories", "cta_url": "/alumni", "display_order": 10, "content": {"imageUrl": "/images/about/about-leadership.webp"}},
        ),
    },
    {
        "section_key": "facts",
        "layout_variant": "facts_strip",
        "display_order": 20,
        "title": "Kisii University at a glance",
        "subtitle": "Key institutional facts for the public homepage.",
        "description": "A concise facts strip for first-time visitors.",
        "settings": {
            "presentation": "strip",
            "source": "institutional_seed",
        },
        "items": (
            {"item_type": "stat", "title": "45,000+", "subtitle": "Alumni", "display_order": 1, "content": {"label": "Alumni"}},
            {"item_type": "stat", "title": "30,000+", "subtitle": "Students", "display_order": 10, "content": {"label": "Students"}},
            {"item_type": "stat", "title": "200+", "subtitle": "Programmes", "display_order": 20, "content": {"label": "Programmes"}},
            {"item_type": "stat", "title": "700+", "subtitle": "Academic Staff", "display_order": 30, "content": {"label": "Academic Staff"}},
            {"item_type": "stat", "title": "50+", "subtitle": "Student Clubs", "display_order": 40, "content": {"label": "Student Clubs"}},
            {"item_type": "stat", "title": "4+", "subtitle": "Research Centres", "display_order": 50, "content": {"label": "Research Centres"}},
            {"item_type": "stat", "title": "13+", "subtitle": "Years of Excellence", "display_order": 60, "content": {"label": "Years of Excellence"}},
        ),
    },
)


def _seed_settings(settings: dict[str, Any]) -> dict[str, Any]:
    merged = dict(settings)
    merged["seed"] = {
        "owner": SEED_OWNER,
        "version": SEED_VERSION,
    }
    return merged


def _is_seed_owned_section(section: PageSection) -> bool:
    settings = section.settings if isinstance(section.settings, dict) else {}
    seed = settings.get("seed") if isinstance(settings.get("seed"), dict) else {}
    return seed.get("owner") == SEED_OWNER


def _can_update_seeded_section(section: PageSection) -> bool:
    if not _is_seed_owned_section(section):
        return False
    if section.status == "draft":
        return True

    settings = section.settings if isinstance(section.settings, dict) else {}
    if settings.get("edited") is True:
        return False
    seed = settings.get("seed") if isinstance(settings.get("seed"), dict) else {}
    version = seed.get("version")
    return isinstance(version, int) and version < SEED_VERSION


def _section_identity(section: PageSection) -> tuple[str, str, uuid.UUID | None, str]:
    return (section.page_key, section.scope_type, section.scope_id, section.section_key)


def _replace_section_items(section: PageSection, item_specs: tuple[dict[str, Any], ...]) -> None:
    section.items = [
        SectionItem(
            item_type=spec["item_type"],
            title=spec.get("title"),
            subtitle=spec.get("subtitle"),
            body_text=spec.get("body_text"),
            content=spec.get("content"),
            cta_label=spec.get("cta_label"),
            cta_url=spec.get("cta_url"),
            cta_description=spec.get("cta_description"),
            audience=spec.get("audience", "all"),
            source_type=spec.get("source_type"),
            source_id=spec.get("source_id"),
            is_featured=spec.get("is_featured", False),
            poster_media_id=spec.get("poster_media_id"),
            transcript=spec.get("transcript"),
            display_order=spec["display_order"],
            is_enabled=True,
        )
        for spec in item_specs
    ]


async def _seed_leadership_activity_news(db: AsyncSession) -> dict[str, uuid.UUID]:
    now = datetime.now(timezone.utc)
    records = (
        ("AI & Data Science Centre launched", "ai-data-science-centre-launched", "Kisii University expands its capacity in artificial intelligence, data science and applied digital innovation."),
        ("MoU signed with the University of Pretoria", "mou-university-of-pretoria", "A strategic academic partnership supporting collaboration, mobility and shared research."),
        ("UNESCO delegation visits Kisii University", "unesco-delegation-visits-kisii-university", "University leadership welcomed UNESCO representatives for discussions on education, research and community impact."),
        ("Student leaders engagement forum", "student-leaders-engagement-forum", "The Vice Chancellor met student representatives to discuss student experience, leadership and institutional priorities."),
    )
    linked: dict[str, uuid.UUID] = {}
    for title, slug, summary in records:
        item = (await db.execute(select(News).where(News.slug == slug))).scalar_one_or_none()
        if item is None:
            item = News(
                title=title,
                slug=slug,
                summary=summary,
                plain_text=summary,
                rich_text=f"<p>{summary}</p>",
                is_featured=False,
                is_main=True,
                is_public=True,
                is_published=True,
                status="published",
                workflow_status="published",
                published_at=now,
                display_order=100,
            )
            db.add(item)
            await db.flush()
        linked[title] = item.id
    return linked


async def _seed_homepage_sections(db: AsyncSession) -> None:
    result = await db.execute(select(PageSection))
    existing = {
        _section_identity(section): section
        for section in result.scalars().all()
        if section.deleted_at is None
    }

    now = datetime.now(timezone.utc)

    # Retire seed-owned homepage sections whose spec has been removed
    # (e.g. the old "pulse" strip replaced by the facts overlap card).
    spec_keys = {spec["section_key"] for spec in HOMEPAGE_SECTION_SPECS}
    for identity, section in existing.items():
        page_key, scope_type, _scope_id, section_key = identity
        if page_key != "homepage" or scope_type != "university":
            continue
        if section_key in spec_keys:
            continue
        if _is_seed_owned_section(section):
            section.deleted_at = now
            section.is_enabled = False

    leadership_news = await _seed_leadership_activity_news(db)
    for spec in HOMEPAGE_SECTION_SPECS:
        identity = ("homepage", "university", None, spec["section_key"])
        section = existing.get(identity)
        if section is not None and not _can_update_seeded_section(section):
            continue

        payload = {
            "page_key": "homepage",
            "scope_type": "university",
            "scope_id": None,
            "section_key": spec["section_key"],
            "title": spec["title"],
            "subtitle": spec["subtitle"],
            "description": spec["description"],
            "settings": _seed_settings(spec["settings"]),
            "display_order": spec["display_order"],
            "is_enabled": True,
            "layout_variant": spec["layout_variant"],
            "status": "published",
            "workflow_status": "published",
            "valid_from": None,
            "valid_to": None,
            "approved_at": now,
            "published_at": now,
        }

        if section is None:
            section = PageSection(**payload)
            db.add(section)
        else:
            for field_name, value in payload.items():
                setattr(section, field_name, value)

        item_specs = spec["items"]
        if spec["section_key"] == "leadership-activity":
            item_specs = tuple(
                {
                    **item_spec,
                    "cta_url": None,
                    "content": {
                        "linked_content_type": "news",
                        "linked_content_id": str(leadership_news[item_spec["title"]]),
                        "activity_context": "leadership-activity",
                    },
                }
                for item_spec in item_specs
            )
        _replace_section_items(section, item_specs)

    await db.flush()


async def _populate_life_around_studies_links(db: AsyncSession) -> None:
    """Attach available live student-life records to the seeded editorial items."""
    result = await db.execute(
        select(PageSection).where(
            PageSection.page_key == "homepage",
            PageSection.scope_type == "university",
            PageSection.section_key == "campus-life",
            PageSection.deleted_at.is_(None),
        )
    )
    section = result.scalar_one_or_none()
    if section is None:
        return

    sources: dict[str, Any] = {}
    for model, source_type, title_field in (
        (Club, "club", Club.name),
        (SportsFacility, "sport", SportsFacility.name),
        (Accommodation, "accommodation", Accommodation.name),
        (ArtsCulture, "arts", ArtsCulture.title),
        (StudentGovernance, "governance", StudentGovernance.name),
    ):
        record = (
            await db.execute(
                select(model).where(model.is_active.is_(True)).order_by(title_field.asc()).limit(1)
            )
        ).scalar_one_or_none()
        if record is not None:
            sources[source_type] = record

    for item in section.items:
        source_type = item.source_type
        source = sources.get(source_type) if source_type else None
        if source is None or item.source_id is not None:
            continue
        item.source_id = source.id

    await db.flush()


def _partner_matches_heri_africa(partner: dict[str, Any]) -> bool:
    values = (
        partner.get("name"),
        partner.get("title"),
        partner.get("slug"),
    )
    return any(isinstance(value, str) and "heri" in value.lower() and "africa" in value.lower() for value in values)


async def _resolve_heri_africa_partner() -> dict[str, Any] | None:
    try:
        payload = await ResearchPartnersProxyService.list_partners(
            page=1,
            per_page=100,
            search="Heri Africa",
        )
    except Exception:
        return None

    partners = payload.get("data") if isinstance(payload, dict) else None
    if not isinstance(partners, list):
        return None
    for partner in partners:
        if isinstance(partner, dict) and _partner_matches_heri_africa(partner):
            return partner
    return None


def _coerce_partner_id(partner: dict[str, Any] | None) -> uuid.UUID | None:
    if not isinstance(partner, dict):
        return None
    partner_id = partner.get("id")
    if isinstance(partner_id, uuid.UUID):
        return partner_id
    if isinstance(partner_id, str):
        try:
            return uuid.UUID(partner_id)
        except ValueError:
            return None
    return None


def _spotlight_payload(partner: dict[str, Any] | None) -> dict[str, Any]:
    partner_id = _coerce_partner_id(partner)
    if partner_id is None:
        return {
            "source_type": "research_partner",
            "source_id": PENDING_HERI_AFRICA_SOURCE_ID,
            "primary_cta_source": "manual",
            "primary_cta_label": "Review partner record",
            "primary_cta_url": "/research/partnerships",
            "headline": PENDING_HERI_AFRICA_HEADLINE,
            "summary": (
                "Pending seed placeholder for the Heri Africa spotlight. Publish after the "
                "matching research partner source record is available."
            ),
            "pillars": [],
            "opportunities": [],
            "is_enabled": False,
            "status": "draft",
            "workflow_status": "draft",
            "valid_from": None,
            "valid_to": None,
            "approved_at": None,
            "published_at": None,
        }

    now = datetime.now(timezone.utc)
    return {
        "source_type": "research_partner",
        "source_id": partner_id,
        "primary_cta_source": "generated_detail_page",
        "primary_cta_label": "Explore the partnership",
        "primary_cta_url": None,
        "headline": "Heri Africa partnership spotlight",
        "summary": "A featured partnership spotlight connected to the Heri Africa research partner record.",
        "pillars": [
            {"label": "Research collaboration", "description": "Shared research and innovation activity."},
            {"label": "Community impact", "description": "Knowledge exchange with public value."},
        ],
        "opportunities": [
            {"label": "Partnership enquiries", "href": "/research/partnerships"},
        ],
        "is_enabled": True,
        "status": "published",
        "workflow_status": "published",
        "valid_from": None,
        "valid_to": None,
        "approved_at": now,
        "published_at": now,
    }


async def _seed_heri_africa_spotlight(db: AsyncSession) -> None:
    partner = await _resolve_heri_africa_partner()
    payload = _spotlight_payload(partner)

    result = await db.execute(select(PartnershipSpotlight))
    existing_spotlights = [
        spotlight for spotlight in result.scalars().all() if spotlight.deleted_at is None
    ]
    existing_for_source = any(
        (
            candidate
            for candidate in existing_spotlights
            if candidate.source_type == "research_partner" and candidate.source_id == payload["source_id"]
        )
    )

    if existing_for_source:
        return

    db.add(PartnershipSpotlight(**payload))
    await db.flush()


async def seed_page_cms(db: AsyncSession, ctx: SeedContext) -> None:
    del ctx

    await _seed_homepage_sections(db)
    await _populate_life_around_studies_links(db)
    await _seed_heri_africa_spotlight(db)


__all__ = [
    "HOMEPAGE_SECTION_SPECS",
    "PENDING_HERI_AFRICA_SOURCE_ID",
    "SEED_OWNER",
    "SEED_VERSION",
    "seed_page_cms",
]
