"""Official navigation pages discovered during the 2026-09-08 audit."""

from __future__ import annotations

import hashlib


_VC_TEXT = (
    "Prof. Dr. Nathan Oyori Ogechi is the Vice Chancellor of Kisii University. "
    "The official Office of the Vice Chancellor page lists the Vice Chancellor "
    "and links to his biography."
)

LIVE_SITE_PAGE_UPDATES_20260908 = [
    {
        "title": "Office of the Vice Chancellor",
        "slug": "admin-departments-office-of-the-vice-chancellor",
        "path": "/admin_departments/office-of-the-vice-chancellor",
        "page_type": "administration",
        "summary": "Official Office of the Vice Chancellor page for Kisii University.",
        "plain_text": "Prof. Dr. Nathan Oyori Ogechi — Vice Chancellor. Biography available on profile page.",
        "headings": ["Office of the Vice Chancellor"],
        "links": [],
        "images": [],
        "source_url": "https://kisiiuniversity.ac.ke/admin_departments/office-of-the-vice-chancellor",
        "source_hash": hashlib.sha256(_VC_TEXT.encode("utf-8")).hexdigest(),
        "display_order": 20,
    },
    {
        "title": "Campus Spark Innovation Festival 2026",
        "slug": "campus-spark-innovation-festival-2026",
        "path": "/event/campus-spark-innovation-festival-2026",
        "page_type": "event",
        "summary": "Something big is coming to Kisii University next week. Are you ready for the Campus Spark Innovation Festival.",
        "plain_text": "Kisii Universty Senate Chambers. Event Details: Something big is coming to Kisii University next week. Are you ready for the Campus Spark Innovation Festival.",
        "headings": ["Campus Spark Innovation Festival 2026", "Event Details"],
        "links": [],
        "images": [{"url": "https://kisiiuniversity.ac.ke/storage/events/images/eJvf5wnwgTMV2FyFiR61qonTDZlU5aOC7vXQqykF.jpg", "alt": "Campus Spark Innovation Festival 2026"}],
        "source_url": "https://kisiiuniversity.ac.ke/event/campus-spark-innovation-festival-2026",
        "source_hash": hashlib.sha256("Something big is coming to Kisii University next week. Are you ready for the Campus Spark Innovation Festival.".encode("utf-8")).hexdigest(),
        "display_order": 21,
    },
    {
        "title": "Kongamano la Chamaka 2026",
        "slug": "kongamano-la-chamaka-2026",
        "path": "/event/kongamano-la-chamaka-2026",
        "page_type": "event",
        "summary": "Chuo Kikuu cha Kisii kinajivunia kuwa mwenyeji wa Mkutano wa CHAKAMA 2026, utakaofanyika hapa chuoni mwezi ujao.",
        "plain_text": "Ukumbi Mpya. Event Details: Chuo Kikuu cha Kisii kinajivunia kuwa mwenyeji wa Mkutano wa CHAKAMA 2026, utakaofanyika hapa chuoni mwezi ujao. Jiandae kushuhudia mkusanyiko wa wasomi, watafiti na wadau mashuhuri wa lugha ya Kiswahili wakijadili njia bora za kuiendeleza lugha ya Kiswahili katika karne ya ishirini na moja na kuimarisha mchango wake katika elimu, utafiti, teknolojia na maendeleo ya jamii. Karibu tuungane katika kongamano hili muhimu linalolenga kuinua hadhi na thamani ya Kiswahili katika ngazi za kitaifa na kimataifa.",
        "headings": ["Kongamano la Chamaka 2026", "Event Details"],
        "links": [],
        "images": [{"url": "https://kisiiuniversity.ac.ke/storage/events/images/URB3l8b3ZjvXpbkvbk6eT3i0Ju8CgIt4MvIgWpmv.jpg", "alt": "Kongamano la Chamaka 2026"}],
        "source_url": "https://kisiiuniversity.ac.ke/event/kongamano-la-chamaka-2026",
        "source_hash": hashlib.sha256("Chuo Kikuu cha Kisii kinajivunia kuwa mwenyeji wa Mkutano wa CHAKAMA 2026, utakaofanyika hapa chuoni mwezi ujao.".encode("utf-8")).hexdigest(),
        "display_order": 22,
    },
]


__all__ = ["LIVE_SITE_PAGE_UPDATES_20260908"]
