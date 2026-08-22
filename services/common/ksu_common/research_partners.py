"""Verified Kisii University research-partner seed manifest.

The manifest is shared by Main (which owns media) and Research (which owns
partner records), so a seeded ``Partner.logo_id`` always points at the same
deterministic Main ``Media`` UUID.
"""

from __future__ import annotations

import uuid
from typing import Any


PARTNER_SOURCE_URL = (
    "https://kisiiuniversity.ac.ke/%D7%97%D7%96%D7%99%D7%AA%D7%99/"
    "research_partnerships/2b25301b-de41-435a-a8f1-763f78cd3df2"
)
PARTNER_MEDIA_NAMESPACE = uuid.UUID("7996dc70-f67c-5ba1-bce7-f540be4f08ca")


def _logo(slug: str, ext: str = "png") -> str:
    """Path to the partner's self-hosted brand mark.

    These used to be ``https://icons.duckduckgo.com/ip3/<domain>.ico`` — a
    16px *favicon*, not a logo, which rendered as an illegible speck on the
    homepage partner rail. The handful of records that pointed straight at a
    partner's own server had rotted to 404s instead.

    Each mark is now downloaded from the partner's official site and served
    from our own origin under ``public/images/research/partners``, so the
    rail no longer depends on eighteen third-party hosts staying up (and no
    longer discloses every visitor to them).
    """
    return f"/images/research/partners/{slug}.{ext}"


def partner_logo_id(slug: str) -> uuid.UUID:
    return uuid.uuid5(PARTNER_MEDIA_NAMESPACE, slug)


RESEARCH_PARTNERS: tuple[dict[str, Any], ...] = (
    {"name": "University of Kansas Medical Center", "legacy_slug": "university-of-kansas-medical-centre", "partner_type": "academic", "partnership_level": "strategic", "country": "United States", "website": "https://www.kumc.edu/", "logo_url": _logo("university-of-kansas-medical-center")},
    {"name": "Pentecostal Life University", "partner_type": "academic", "partnership_level": "strategic", "country": "Malawi", "website": "https://plu.ac.mw/", "logo_url": _logo("pentecostal-life-university")},
    {"name": "Computer Aid International", "partner_type": "international", "partnership_level": "technical", "country": "United Kingdom", "website": "https://www.computeraid.org/", "logo_url": _logo("computer-aid-international", "svg")},
    {"name": "Kenya National Library Service", "acronym": "KNLS", "partner_type": "government", "partnership_level": "implementing", "country": "Kenya", "website": "https://www.knls.ac.ke/", "logo_url": _logo("kenya-national-library-service")},
    {"name": "Kenya Marine and Fisheries Research Institute", "legacy_slug": "kenya-marine-fisheries-research-institute", "acronym": "KMFRI", "partner_type": "government", "partnership_level": "research", "country": "Kenya", "website": "https://www.kmfri.go.ke/", "logo_url": _logo("kenya-marine-and-fisheries-research-institute")},
    {"name": "Books For Africa", "partner_type": "foundation", "partnership_level": "community", "country": "United States", "website": "https://www.booksforafrica.org/", "logo_url": _logo("books-for-africa")},
    {"name": "Jingdezhen University", "partner_type": "academic", "partnership_level": "strategic", "country": "China", "website": "https://www.jci.edu.cn/english/", "logo_url": _logo("jingdezhen-university")},
    {"name": "Bowling Green State University", "acronym": "BGSU", "partner_type": "academic", "partnership_level": "strategic", "country": "United States", "website": "https://www.bgsu.edu/", "logo_url": _logo("bowling-green-state-university", "svg")},
    {"name": "Austin Peay State University", "acronym": "APSU", "partner_type": "academic", "partnership_level": "strategic", "country": "United States", "website": "https://www.apsu.edu/", "logo_url": _logo("austin-peay-state-university")},
    {"name": "International Computer Driving Licence", "legacy_slug": "international-computer-driving-license", "acronym": "ICDL Africa", "partner_type": "international", "partnership_level": "technical", "country": "Africa", "website": "https://icdl.org/icdl-africa/", "logo_url": _logo("international-computer-driving-licence", "svg")},
    {"name": "Kenya Agricultural and Livestock Research Organization", "legacy_slug": "kenya-agricultural-and-livestock-research-organization-karlo", "acronym": "KALRO", "partner_type": "government", "partnership_level": "research", "country": "Kenya", "website": "https://www.kalro.org/", "logo_url": _logo("kenya-agricultural-and-livestock-research-organization")},
    {"name": "University of Minnesota", "acronym": "UMN", "partner_type": "academic", "partnership_level": "strategic", "country": "United States", "website": "https://twin-cities.umn.edu/", "logo_url": _logo("university-of-minnesota", "svg")},
    {"name": "Semyung University", "partner_type": "academic", "partnership_level": "strategic", "country": "South Korea", "website": "https://www.semyung.ac.kr/eng.do", "logo_url": _logo("semyung-university")},
    {"name": "University of Cape Town", "acronym": "UCT", "partner_type": "academic", "partnership_level": "strategic", "country": "South Africa", "website": "https://www.uct.ac.za/", "logo_url": _logo("university-of-cape-town", "svg")},
    {"name": "International Youth Fellowship", "acronym": "IYF", "partner_type": "ngo", "partnership_level": "community", "country": "International", "website": "https://www.iyf.org/", "logo_url": _logo("international-youth-fellowship")},
    {"name": "Kantar Public (now Verian)", "legacy_slug": "kantar-public", "acronym": "Verian", "partner_type": "industry", "partnership_level": "research", "country": "United Kingdom", "website": "https://www.veriangroup.com/", "logo_url": _logo("kantar-public-now-verian")},
    {"name": "Mogadishu University", "acronym": "MU", "partner_type": "academic", "partnership_level": "strategic", "country": "Somalia", "website": "https://mu.edu.so/", "logo_url": _logo("mogadishu-university")},
    {"name": "Kenya National Commission on Human Rights", "acronym": "KNCHR", "partner_type": "government", "partnership_level": "community", "country": "Kenya", "website": "https://www.knchr.org/", "logo_url": _logo("kenya-national-commission-on-human-rights")},
)


__all__ = ["PARTNER_SOURCE_URL", "RESEARCH_PARTNERS", "partner_logo_id"]
