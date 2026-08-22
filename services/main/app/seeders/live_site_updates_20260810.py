"""Verified Kisii University live-site updates captured on 2026-08-10.

Every item comes from an official ``kisiiuniversity.ac.ke/blog`` page.  The
lead image is retained as a remote Main-service media record so seed runs do
not copy or invent university photography.
"""

from __future__ import annotations

from datetime import datetime
from zoneinfo import ZoneInfo


EAT = ZoneInfo("Africa/Nairobi")


LIVE_SITE_NEWS_UPDATES = [
    {
        "title": "KSU Students Return from 21 Day Medical School Expedition at University of Manchester",
        "category": "NEWS",
        "summary": "Kisii University medicine students returned from a 21-day medical-school expedition at the University of Manchester with new global-health perspectives and professional connections.",
        "plain_text": "After an enriching 21-day medical school expedition at the University of Manchester, Kisii University medicine students returned with new connections, fresh perspectives, and a deeper understanding of medicine in a global context. The university described the exchange as part of preparing globally minded healthcare leaders.",
        "published_at": datetime(2026, 8, 9, 12, 0, tzinfo=EAT),
        "source_url": "https://kisiiuniversity.ac.ke/blog/ksu-students-return-from-21-day-medical-school-expedition-at-university-of-manchester",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/4Wk5sDm9p0G3Gzj2AXJHIufYOa2xFerUYEMACCho.jpg",
        "gallery_image_urls": [
            f"https://kisiiuniversity.ac.ke/resources/6a78f6fa{suffix}.jpeg"
            for suffix in ("03310", "7030b", "80655", "8fdbc", "9f050", "af2e8", "bd364", "c9d87", "d78b5", "e523f")
        ],
        "display_order": 1,
        "is_featured": True,
    },
    {
        "title": "Wizara ya Elimu Yahudhuria Kongamano la CHAKAMA",
        "category": "NEWS",
        "summary": "Waziri wa Elimu Julius Migos Ogamba alihudhuria Kongamano la CHAKAMA katika Chuo Kikuu cha Kisii na kusisitiza umuhimu wa Kiswahili katika elimu, utafiti na jamii.",
        "plain_text": "Katibu wa Baraza la Mawaziri anayesimamia Wizara ya Elimu, Mhe. Julius Migos Ogamba, EBS, alihudhuria Kongamano la CHAKAMA katika Chuo Kikuu cha Kisii. Ujumbe wake ulisisitiza nafasi ya Kiswahili kama lugha inayounganisha jamii, kuhifadhi urithi wa kitamaduni, na kuendelea kukua katika elimu na utafiti.",
        "published_at": datetime(2026, 8, 9, 12, 0, tzinfo=EAT),
        "source_url": "https://kisiiuniversity.ac.ke/blog/wizara-ya-elimu-ahudhuria-kongamano-la-chakama",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/Wc9UmU1CBW1L4kP5jSjPnibzFwzUpfTMczeFEYXJ.jpg",
        "display_order": 2,
        "is_featured": True,
    },
    {
        "title": "Siku ya Kwanza ya Kongamano la CHAKAMA 2026",
        "category": "NEWS",
        "summary": "Kongamano la CHAKAMA 2026 lilianza katika Chuo Kikuu cha Kisii kwa mijadala na maonesho yanayolenga kukuza matumizi ya Kiswahili kitaifa na kimataifa.",
        "plain_text": "Kongamano la CHAKAMA 2026 lilianza kwa maonesho na mijadala ya kukuza, kubuni na kueneza matumizi ya Kiswahili. Chuo Kikuu cha Kisii kilieleza kongamano hilo kama jukwaa la kuunganisha jamii, kuhifadhi urithi wa kitamaduni, na kuhamasisha vizazi vya sasa na vijavyo.",
        "published_at": datetime(2026, 8, 7, 12, 0, tzinfo=EAT),
        "source_url": "https://kisiiuniversity.ac.ke/blog/siku-ya-kwanza-ya-kongamano-la-chakama-2026",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/Crsy92dBw7NHS1hnKT7zi90tM50L3m20wPlridy4.jpg",
        "display_order": 3,
        "is_featured": False,
    },
    {
        "title": "KSU Scouts Bag Three National Super Scouts Titles",
        "category": "NEWS",
        "summary": "Kisii University Scouts won three National Super Scouts titles and qualified to represent Kenya at the East and Central African Super Scouts Competition.",
        "plain_text": "Kisii University Scouts won three National Super Scouts titles after demonstrating leadership, skill, discipline, and teamwork. The official university announcement says the team earned the opportunity to represent Kenya at the forthcoming East and Central African Super Scouts Competition.",
        "published_at": datetime(2026, 8, 5, 12, 0, tzinfo=EAT),
        "source_url": "https://kisiiuniversity.ac.ke/blog/ksu-scouts-bag-three-national-super-scouts-titles",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/DI72WsmA6JLJLExnrLt1gBn0sMJxC6triaWQHHB0.jpg",
        "display_order": 4,
        "is_featured": False,
    },
    {
        "title": "Siku ya Pili Moja kwa Moja — Kongamano la CHAKAMA 2026",
        "category": "NEWS",
        "summary": "Kisii University published its official live page for the second day of the CHAKAMA 2026 conference.",
        "plain_text": "Official Kisii University live coverage for day two of Kongamano la CHAKAMA 2026.",
        "published_at": datetime(2026, 8, 7, 12, 0, tzinfo=EAT),
        "source_url": "https://kisiiuniversity.ac.ke/blog/siku-ya-pili-moja-kwa-moja-kongamano-la-chakama-2026",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/kv8b4GraGLPXmxfbXg9mSkIUdMlPJ12aKock9kpg.jpg",
        "display_order": 5,
        "is_featured": False,
    },
    {
        "title": "KUCCPS Course Transfer and Late Applications",
        "category": "ADMISSIONS",
        "summary": "Kisii University announced that the KUCCPS late-application and course-transfer portal was open for applicants seeking to join the university.",
        "plain_text": "The official university notice invited applicants who missed initial placement to use the KUCCPS late-application portal or transfer a course to Kisii University.",
        "published_at": datetime(2026, 7, 23, 12, 0, tzinfo=EAT),
        "source_url": "https://kisiiuniversity.ac.ke/blog/kuccps-course-transfer-late-applications",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/lT2YVjg2sV8Tz4NdfyLOm5VkvfBDuXLrRUWDpxPN.jpg",
        "display_order": 6,
        "is_featured": False,
    },
    {
        "title": "KSU Medicine Students Visit University of Manchester for 21-Day Programme",
        "category": "NEWS",
        "summary": "A second group of fifth-year Kisii University medicine students travelled to the University of Manchester for a 21-day summer-school exchange programme.",
        "plain_text": "Kisii University announced that the second group of fifth-year medicine students departed for the University of Manchester for a 21-day Summer School Exchange Programme.",
        "published_at": datetime(2026, 7, 18, 12, 0, tzinfo=EAT),
        "source_url": "https://kisiiuniversity.ac.ke/blog/ksu-medicine-students-visit-university-of-manchester-for-21-day-program",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/5p4F5uqG5WRzrnFEEyjFUI7JaWCTwN6NoQP4hRXr.jpg",
        "display_order": 7,
        "is_featured": False,
    },
    {
        "title": "KUCCPS 2026 Admissions",
        "category": "ADMISSIONS",
        "summary": "Kisii University directed its incoming first-year students to download admission letters and begin the official online admission process.",
        "plain_text": "The official university admission notice welcomed incoming first-year students and directed them to obtain their admission letters and begin online admission through the Kisii University digital platform.",
        "published_at": datetime(2026, 7, 13, 12, 0, tzinfo=EAT),
        "source_url": "https://kisiiuniversity.ac.ke/blog/kuccps-2026-admissions",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/PvKv1g7ilQJo75E6hqe7JuzmqKGhBRnJ1AgIxPx7.jpg",
        "related_links": [
            {"label": "Official Kisii University notice", "url": "https://kisiiuniversity.ac.ke/blog/kuccps-2026-admissions"},
            {"label": "Online admissions centre", "url": "https://digital.kisiiuniversity.ac.ke/students/admissions/center"},
        ],
        "display_order": 8,
        "is_featured": False,
    },
    {
        "title": "Mathematical Modeling for Infectious Diseases and Antimicrobial Resistance",
        "category": "RESEARCH",
        "summary": "The Department of Mathematics and Actuarial Science hosted a two-day practical workshop on mathematical modeling for infectious diseases and antimicrobial resistance in Africa.",
        "plain_text": "The workshop brought together researchers, students, and emerging scholars for practical mathematical-modeling training addressing infectious diseases and antimicrobial resistance. Kisii University reported that it also strengthened collaboration and public-health research networks.",
        "published_at": datetime(2026, 7, 10, 12, 0, tzinfo=EAT),
        "source_url": "https://kisiiuniversity.ac.ke/blog/mathematical-modeling-for-infectious-diseases-and-antimicrobial-resistance",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/WW6dXKqOhtnLbGxCoks2jqST7uoPcTS85m9QKwhb.jpg",
        "display_order": 9,
        "is_featured": False,
    },
]


LIVE_SITE_BLOG_UPDATES = [
    {
        "title": "2026/2027 Language Education Postgraduate Scholarships in Foundational Literacy",
        "category": "SCHOLARSHIPS",
        "summary": "Kisii University published the official 2026/2027 call and application materials for postgraduate scholarships in foundational literacy and language education.",
        "plain_text": "The official Kisii University notice provides the full scholarship advert, postgraduate application forms, and referee confidential report for the 2026/2027 Language Education postgraduate scholarship call in foundational literacy.",
        "published_at": datetime(2026, 7, 30, 12, 0, tzinfo=EAT),
        "source_url": "https://kisiiuniversity.ac.ke/blog/call-for-applications-20262027-language-education-postgraduate-scholarships-in-foundational-literacy",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/VXRP3L0NinznhHa2aD2ei4pw1TR54196hv3CPn17.png",
        "display_order": 1,
        "is_featured": True,
    },
    {
        "title": "African Development Fund HEST Phase II Project Scholarships",
        "category": "ACADEMICS",
        "summary": "Kisii University published the official African Development Fund support to Higher Education, Science and Technology Phase II scholarship announcement and postgraduate forms.",
        "plain_text": "The official university notice provides the full scholarship advert and postgraduate application forms for African Development Fund support to the Higher Education, Science and Technology Phase II project scholarships.",
        "published_at": datetime(2026, 8, 4, 12, 0, tzinfo=EAT),
        "source_url": "https://kisiiuniversity.ac.ke/blog/scholarship-announcement-for-african-development-fund-adf-support-to-higher-education-science-and-technology-hest-phase-ii-project-scholarships",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/1x0kGGKM8zebjqHAnV3CBXgiuGAEvpmP4fhueTZT.png",
        "display_order": 2,
        "is_featured": True,
    },
]


LIVE_SITE_EVENT_UPDATES = [
    {
        "title": "6th International Nutrition and Dietetics Scientific Conference",
        "category": "KISII UNIVERSITY",
        "summary": "The official Kisii University events calendar lists the 6th International Nutrition and Dietetics Scientific Conference for 9–13 November 2026.",
        "plain_text": "Kisii University lists the 6th International Nutrition and Dietetics Scientific Conference as an upcoming event running from 9 to 13 November 2026, with conference information hosted by the Kenya Nutritionists and Dieticians Institute conference platform.",
        "start_date": datetime(2026, 11, 9, 8, 0, tzinfo=EAT),
        "end_date": datetime(2026, 11, 13, 17, 0, tzinfo=EAT),
        "location": "Kisii University",
        "source_url": "https://kisiiuniversity.ac.ke/our_events",
        "registration_url": "https://conferences.kndi.institute/series/6",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/events/images/UwP82yXweY1BPwGISV3941fQKqUZFoEuAQntjDAk.jpg",
        "display_order": 1,
        "is_featured": True,
    },
]


__all__ = ["LIVE_SITE_NEWS_UPDATES", "LIVE_SITE_BLOG_UPDATES", "LIVE_SITE_EVENT_UPDATES"]
