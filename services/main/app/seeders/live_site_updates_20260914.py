"""Exact official Kisii University article delta captured on 2026-09-14.

The July snapshot contains the remaining published article pages.  This delta
contains every article currently listed in the live /news index that was not
present in that snapshot, preserving the published text and official links.
"""

from __future__ import annotations

from datetime import datetime

_RAW = [
    {
        "title": "LIVE INAUGURAL GUSII EDUCATION STAKEHOLDERS CONVENTION DAY 2",
        "category": "NEWS",
        "summary": "",
        "plain_text": "",
        "published_at": "2026-09-11T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/live-inaugural-gusii-education-stakeholders-convention-day-2",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/tOid2Ip34uZ8WGCQmahxyZZ8CLzbUhfCTbk4Cu4C.jpg",
        "related_links": [],
        "display_order": 1
    },
    {
        "title": "INTERNAL ADVERTISEMENT:ANNOUNCEMENT OF VACANCIES IN ADMINISTRATIVE AND LIBRARY CADRES",
        "category": "NEWS",
        "summary": "Click to download advert",
        "plain_text": "Click to download advert",
        "published_at": "2026-09-11T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/internal-advertisementannouncement-of-vacancies-in-administrative-and-library-cadres",
        "source_image_url": None,
        "related_links": [
            {
                "label": "Click to download advert",
                "url": "https://kisiiuniversity.ac.ke/storage/public/downloads//PROMOTION%20ADVERT%20SHARED%20SERVICES%20revised.docx"
            }
        ],
        "display_order": 2
    },
    {
        "title": "THE FIRST GUSII EDUCATION STAKEHOLDERS CONVENTION DAY 1",
        "category": "NEWS",
        "summary": "The Gusii Education Stakeholders Convention kicked off today under the stewardship of the Convener, the Cabinet Secretary for Education, Hon. Julius Migos Ogamba, setting the stage for an inspiring conversation about the future of education. At the heart of the deliberations was a powerful reminder: the future we desire begins with the questions we dare to ask today. If we ask the right questions, challenge old assumptions and collectively pursue meaningful solutions, education can become an eve",
        "plain_text": "The Gusii Education Stakeholders Convention kicked off today under the stewardship of the Convener, the Cabinet Secretary for Education, Hon. Julius Migos Ogamba, setting the stage for an inspiring conversation about the future of education. At the heart of the deliberations was a powerful reminder: the future we desire begins with the questions we dare to ask today. If we ask the right questions, challenge old assumptions and collectively pursue meaningful solutions, education can become an even greater force for transformation, opportunity and national progress. Kisii University proudly stood at the forefront of these conversations, contributing to the shaping of the Convention,s outlook and, by extension, helping to illuminate the path towards the future of education.",
        "published_at": "2026-09-10T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/the-first-gusii-education-stakeholders-convention-day-1",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/WffDMlyssPUorzP800qYhJQVPMfgqsZlV7TUFwRM.jpg",
        "related_links": [],
        "display_order": 3
    },
    {
        "title": "Tender REF KSU/T/3/2026–2027 for General Insurance Services",
        "category": "ABOUT",
        "summary": "Click to download the tender",
        "plain_text": "Click to download the tender",
        "published_at": "2026-09-10T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/tender-ref-ksut32026-2027-for-general-insurance-services",
        "source_image_url": None,
        "related_links": [
            {
                "label": "Click to download the tender",
                "url": "https://kisiiuniversity.ac.ke/storage/public/downloads//TENDER%20FOR%20GENERAL%20%20INSURANCE%20SERVICES%20(1)%20(1).pdf"
            }
        ],
        "display_order": 4
    },
    {
        "title": "TENDER FOR GROUP LIFE AND PERSONAL ACCIDENT FOR STAFF MEMEBRS",
        "category": "ABOUT",
        "summary": "TENDER FOR GROUP LIFE AND PERSONAL ACCIDENT FOR STAFF MEMEBRS ADDENDUM NUMBER ONE TO TENDER FOR GROUP LIFE AND GROUP PERSONAL ACCIDENT INSURANCE COVER ADDENDUM NUMBER TWO FOR TENDER FOR GROUP LIFE AND GPA COVER TO TECHNICAL EVALUATION CRITERIA",
        "plain_text": "TENDER FOR GROUP LIFE AND PERSONAL ACCIDENT FOR STAFF MEMEBRS ADDENDUM NUMBER ONE TO TENDER FOR GROUP LIFE AND GROUP PERSONAL ACCIDENT INSURANCE COVER ADDENDUM NUMBER TWO FOR TENDER FOR GROUP LIFE AND GPA COVER TO TECHNICAL EVALUATION CRITERIA",
        "published_at": "2026-09-10T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/tender-for-group-life-and-personal-accident-for-staff-memebrs",
        "source_image_url": None,
        "related_links": [
            {
                "label": "https://kisiiuniversity.ac.ke/storage/public/downloads//ADDENDUM%20NUMBER%20TWO%20FOR%20TENDER%20FOR%20GROUP%20LIFE%20AND%20GPA%20COVER%20TO%20TECHNICAL%20EVALUATION%20CRITERIA%20.pdf",
                "url": "https://kisiiuniversity.ac.ke/storage/public/downloads//ADDENDUM%20NUMBER%20TWO%20FOR%20TENDER%20FOR%20GROUP%20LIFE%20AND%20GPA%20COVER%20TO%20TECHNICAL%20EVALUATION%20CRITERIA%20.pdf"
            },
            {
                "label": "TENDER FOR GROUP LIFE AND PERSONAL ACCIDENT FOR STAFF MEMEBRS",
                "url": "https://kisiiuniversity.ac.ke/storage/public/downloads//TENDER%20FOR%20GROUP%20LIFE%20AND%20PERSONAL%20ACCIDENT%20FOR%20STAFF%20MEMEBRS%20%20(1)%20(4).pdf"
            },
            {
                "label": "ADDENDUM NUMBER ONE TO TENDER FOR GROUP LIFE AND GROUP PERSONAL ACCIDENT INSURANCE COVER",
                "url": "https://kisiiuniversity.ac.ke/storage/public/downloads//ADDENDUM%20NUMBER%20ONE%20TO%20TENDER%20FOR%20GROUP%20LIFE%20AND%20GROUP%20PERSONAL%20ACCIDENT%20INSURANCE%20COVER%20%20(1).pdf"
            }
        ],
        "display_order": 5
    },
    {
        "title": "LIVE INAUGURAL GUSII EDUCATION STAKEHOLDERS CONVENTION",
        "category": "NEWS",
        "summary": "The Inaugural Gusii Stakeholders Convention kicks off. We chant the future by reflecting about our past",
        "plain_text": "The Inaugural Gusii Stakeholders Convention kicks off. We chant the future by reflecting about our past",
        "published_at": "2026-09-10T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/live-inaugural-gusii-education-stakeholders-convention",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/Xw7yBsypdG8MPbcjcvjmyBzdoo8ywsj9BgDUYwFO.jpg",
        "related_links": [],
        "display_order": 6
    },
    {
        "title": "INTERNAL ADVERTISEMENT:ANNOUNCEMENT OF VACANCIES IN SHARED SERVICES",
        "category": "ABOUT",
        "summary": "Click here to download the advert",
        "plain_text": "Click here to download the advert",
        "published_at": "2026-09-10T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/internal-advertisementannouncement-of-vacancies-in-shared-services",
        "source_image_url": None,
        "related_links": [
            {
                "label": "Click here to download the advert",
                "url": "https://kisiiuniversity.ac.ke/storage/public/downloads//PROMOTION%20ADVERT%20SHARED%20SERVICES%20(1).docx"
            }
        ],
        "display_order": 7
    },
    {
        "title": "The 1st Gusii Education Stakeholders Convention",
        "category": "NEWS",
        "summary": "The Vice Chancellor welcomes you all to Kisii University for the 1st edition of the Gusii Education Stakeholders Convention. Are you ready to re-imagine your future?",
        "plain_text": "The Vice Chancellor welcomes you all to Kisii University for the 1st edition of the Gusii Education Stakeholders Convention. Are you ready to re-imagine your future?",
        "published_at": "2026-09-07T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/the-1st-gusii-education-stakeholders-convention",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/wgbp9JboiBrLtwWr9Lu4suXSuPPu88Lh9HzMPtHr.jpg",
        "related_links": [],
        "display_order": 8
    },
    {
        "title": "Elite Savers donate segregated Waste Bins to KSU",
        "category": "NEWS",
        "summary": "Today, the Vice Chancellor hosted officials from Elite Savers, CBO who have taken a meaningful step towards building a cleaner, greener and more sustainable future by donating segregated waste bins to the University. This thoughtful gesture is a powerful reminder that meaningful transformation begins when individuals and institutions embrace collective responsibility for the environment we share. Every conscious action, no matter how simple, contributes to a future that is healthier, cleaner and",
        "plain_text": "Today, the Vice Chancellor hosted officials from Elite Savers, CBO who have taken a meaningful step towards building a cleaner, greener and more sustainable future by donating segregated waste bins to the University. This thoughtful gesture is a powerful reminder that meaningful transformation begins when individuals and institutions embrace collective responsibility for the environment we share. Every conscious action, no matter how simple, contributes to a future that is healthier, cleaner and more sustainable for generations to come. At Kisii University, we remain committed to nurturing a clean, green and aesthetically inspiring environment through deliberate initiatives such as tree planting, landscaping, paving of internal roads and floral beautification. These efforts go beyond transforming our physical spaces, they reflect our commitment to cultivating a culture of responsibility, sustainability and pride in the place we proudly call home. The University deeply values partnerships with like-minded organizations such as Elite Savers. Together, we continue to co-create better futures, demonstrating that when shared purpose meets collective action, even the smallest steps can create lasting impact",
        "published_at": "2026-09-07T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/elite-savers-donate-segregated-waste-bins-to-ksu",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/W34TFJnMQB2ihvWBKYmezMiJNUGX9j7jhC2Bt4V4.jpg",
        "related_links": [],
        "display_order": 9
    },
    {
        "title": "TENDER FOR PROVISION OF INTERNET SERVICES",
        "category": "TENDERS",
        "summary": "For More Information visit PROCUREMENT PORTAL",
        "plain_text": "For More Information visit PROCUREMENT PORTAL",
        "published_at": "2026-09-03T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/tender-for-provision-of-internet-services",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/z6vZOIOgjALubSAdCnh5OWzplGoKXfvEk0IHguZX.jpg",
        "related_links": [
            {
                "label": "For More Information visit PROCUREMENT PORTAL",
                "url": "https://digital.kisiiuniversity.ac.ke/procurement_portal/tenders"
            }
        ],
        "display_order": 10
    },
    {
        "title": "Welcome to Kisii University 2026",
        "category": "NEWS",
        "summary": "At Kisii University, we believe that great journeys need more than classrooms, they need an environment where minds can breathe, dreams can take root, and possibilities can flourish. Set within a serene and naturally inspiring environment, we provide the space, people and opportunities to help you pursue your academic ambitions, build meaningful social connections and chart a rewarding career path. Because your next chapter deserves more than a place to study, it deserves a place to become. We a",
        "plain_text": "At Kisii University, we believe that great journeys need more than classrooms, they need an environment where minds can breathe, dreams can take root, and possibilities can flourish. Set within a serene and naturally inspiring environment, we provide the space, people and opportunities to help you pursue your academic ambitions, build meaningful social connections and chart a rewarding career path. Because your next chapter deserves more than a place to study, it deserves a place to become. We are Kisii University. Where ambition finds its home, and possibilities find their wings.",
        "published_at": "2026-09-02T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/welcome-to-kisii-university-2026",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/7wnD1GnOdR3JVYlIbS0Mbp1kdI68hGjJEF56kJjV.jpg",
        "related_links": [],
        "display_order": 11
    },
    {
        "title": "Validation workshop on language Education (foundational literacy) thematic areas and research Questions",
        "category": "NEWS",
        "summary": "View gallery The HERI-Africa language Education Chair engaged with stakeholders in a validation workshop to deliberate on the research questions on language education. The session focused on the presentation and validation of five proposed thematic areas under the Research Chair, with stakeholders providing critical feedback intended to sharpen the research focus, reframe research questions, and ground the study in policy-relevant, data-driven inquiry. A cross-cutting theme throughout the discus",
        "plain_text": "View gallery The HERI-Africa language Education Chair engaged with stakeholders in a validation workshop to deliberate on the research questions on language education. The session focused on the presentation and validation of five proposed thematic areas under the Research Chair, with stakeholders providing critical feedback intended to sharpen the research focus, reframe research questions, and ground the study in policy-relevant, data-driven inquiry. A cross-cutting theme throughout the discussion was the need for the research to be systematic, policy-level, and backed by robust national data.",
        "published_at": "2026-09-02T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/validation-workshop-on-language-education-foundational-literacy-thematic-areas-and-research-questions",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/EmjxH2F8TadmnDCMyyb3wtJCxaNzIUZblx0bONZu.jpg",
        "related_links": [
            {
                "label": "View gallery",
                "url": "https://kisiiuniversity.pixieset.com/heriafricanaivashasept22026/"
            }
        ],
        "display_order": 12
    },
    {
        "title": "Our Own Alex Mutua Recipient of JICA Scholarship 2025/26",
        "category": "NEWS",
        "summary": "The Vice Chancellor today joined the Send off Ceremony for the JICA Scholarship 2025/26 Recipients, organized by JICA and the Embassy of Japan, celebrating scholars whose ambitions are taking them beyond borders and into new spaces of knowledge, discovery and transformation. Among them is Kisii University,s very own Alex Mutua of Nutrition and Dietetics, who departs on 12th September 2026 for Japan to pursue a two year Master,s programme. Alex,s journey is more than a personal achievement; it is",
        "plain_text": "The Vice Chancellor today joined the Send off Ceremony for the JICA Scholarship 2025/26 Recipients, organized by JICA and the Embassy of Japan, celebrating scholars whose ambitions are taking them beyond borders and into new spaces of knowledge, discovery and transformation. Among them is Kisii University,s very own Alex Mutua of Nutrition and Dietetics, who departs on 12th September 2026 for Japan to pursue a two year Master,s programme. Alex,s journey is more than a personal achievement; it is a reflection of what becomes possible when a university builds meaningful global partnerships and opens doors for its students and staff to engage with the world. At Kisii University, our commitment to a borderless university is not merely a vision, it is a pathway we continue to build, one partnership, one opportunity and one success story at a time.",
        "published_at": "2026-08-29T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/our-own-alex-mutua-recipient-of-jica-scholarship-202526",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/r7R0eT2DewFB0xLmklZ0bi00UsRNza97So755Nqy.jpg",
        "related_links": [],
        "display_order": 13
    },
    {
        "title": "INTER/INTRA SCHOOL TRANSFERS SEPT 2026",
        "category": "NEWS",
        "summary": "",
        "plain_text": "",
        "published_at": "2026-08-29T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/interintra-school-transfers-sept-2026",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/XLwPth1PaInghC3I33jLltPe1sM2liFioSiADyLU.jpg",
        "related_links": [],
        "display_order": 14
    },
    {
        "title": "MATRICULATION CEREMONY LIVE",
        "category": "NEWS",
        "summary": "",
        "plain_text": "",
        "published_at": "2026-08-25T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/matriculation-ceremony-live",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/J7OPg1FDX5fkY45aVFmbmk3EZtfbYbHmCSECXnqf.jpg",
        "related_links": [],
        "display_order": 15
    },
    {
        "title": "2026 Matriculation Ceremony",
        "category": "NEWS",
        "summary": "In a powerful celebration of promise, purpose and possibility, the Vice Chancellor today led the 2026 First Years, Matriculation Ceremony at the Chancellor,s Pavilion. As he looked into the hopeful eyes of a new generation of scholars, he spoke to more than their aspirations, he affirmed a commitment to nurture their dreams, shape their talents and prepare them for a world without borders. At Kisii University, every new beginning is a promise: of excellence, opportunity and a future transformed ",
        "plain_text": "In a powerful celebration of promise, purpose and possibility, the Vice Chancellor today led the 2026 First Years, Matriculation Ceremony at the Chancellor,s Pavilion. As he looked into the hopeful eyes of a new generation of scholars, he spoke to more than their aspirations, he affirmed a commitment to nurture their dreams, shape their talents and prepare them for a world without borders. At Kisii University, every new beginning is a promise: of excellence, opportunity and a future transformed by knowledge. Here, they will learn, discover, grow and become. Welcome to a globally recognised university, powered by unrivalled professionals and driven by a vision of creating positive change.",
        "published_at": "2026-08-25T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/2026-matriculation-ceremony",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/8MoxEQaFtrxrIZXcxdbuMZa87IKd2RJR5pN3ZqLf.jpg",
        "related_links": [],
        "display_order": 16
    },
    {
        "title": "External Advertisement Teaching Positions August 2026",
        "category": "NEWS & CAREERS",
        "summary": "VISIT OUR CAREER PORTAL FOR MORE INFO",
        "plain_text": "VISIT OUR CAREER PORTAL FOR MORE INFO",
        "published_at": "2026-08-24T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/external-advertisement-teaching-positions-august-2026",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/RSLYrPAfmGR3724Lo0rmFuP6mvqWdrPB0WoytVWa.jpg",
        "related_links": [
            {
                "label": "VISIT OUR",
                "url": "https://digital.kisiiuniversity.ac.ke/job_portal/open_adverts"
            }
        ],
        "display_order": 17
    },
    {
        "title": "Session Reporting Sem 1 2026/2027",
        "category": "NEWS",
        "summary": "",
        "plain_text": "",
        "published_at": "2026-08-23T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/session-reporting-sem-1-20262027",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/GPFwCxg5HEKXtcBcyzWaEeY1QTRLNkz74eVqoOGX.png",
        "related_links": [],
        "display_order": 18
    },
    {
        "title": "Orientation Week 2026 LIVE",
        "category": "NEWS",
        "summary": "A 250-strong volunteer team drawn from various Clubs and Societies is putting the final touches in place ahead of the Orientation of our newest first years on Monday. At Kisii University, we believe every student deserves a strong and dignified start. Orientation is more than a welcome, it is the first step in building confidence, belonging, purpose, and a successful academic journey. Together, we are creating an environment where every first year can begin with confidence, discover their potent",
        "plain_text": "A 250-strong volunteer team drawn from various Clubs and Societies is putting the final touches in place ahead of the Orientation of our newest first years on Monday. At Kisii University, we believe every student deserves a strong and dignified start. Orientation is more than a welcome, it is the first step in building confidence, belonging, purpose, and a successful academic journey. Together, we are creating an environment where every first year can begin with confidence, discover their potential, and thrive. A great journey deserves a great beginning. Welcome to Kisii University! ORIENTATION PROGRAMME",
        "published_at": "2026-08-23T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/orientation-week-2026-live",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/8cUAJ7WPwCO70cAse22ZV68E7dW8nk7IgL8rJJkL.jpg",
        "related_links": [],
        "display_order": 19
    },
    {
        "title": "Thousands complete Admission into Kisii University",
        "category": "NEWS",
        "summary": "Thousands of new Kisii University students admitted by 11:30 a.m. today. Behind this remarkable milestone is more than a statement, it is a story of careful coordination, exceptional execution, and the spirit of cooperation that defines Kisii University. Working together, our Staff, Scouts and St John Ambulance volunteers have helped us clear student admission lines in just four hours. What could have been a long and anxious wait became a smooth beginning to a new chapter. To our parents, thank ",
        "plain_text": "Thousands of new Kisii University students admitted by 11:30 a.m. today. Behind this remarkable milestone is more than a statement, it is a story of careful coordination, exceptional execution, and the spirit of cooperation that defines Kisii University. Working together, our Staff, Scouts and St John Ambulance volunteers have helped us clear student admission lines in just four hours. What could have been a long and anxious wait became a smooth beginning to a new chapter. To our parents, thank you for trusting us and walking this journey with us. To our new students, thank you for choosing Kisii University. We are proud to welcome you into a community where dreams are nurtured, possibilities are expanded, and futures are shaped.As we continue welcoming the remaining students over the next week, we pause to appreciate how far we have come and look forward to all that lies ahead.",
        "published_at": "2026-08-20T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/thousands-complete-admission-into-kisii-university",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/83aU8X8vFKLnuDpNS2ph4vo64S6GxQkgTPVoD92N.jpg",
        "related_links": [],
        "display_order": 20
    },
    {
        "title": "A Call to Host the HERI Africa Research Chair on Gender, Equity and Social Inclusion in Education",
        "category": "NEWS",
        "summary": "A Call to Host the HERI Africa Research Chair on Gender, Equity and Social Inclusion in Education",
        "plain_text": "A Call to Host the HERI Africa Research Chair on Gender, Equity and Social Inclusion in Education",
        "published_at": "2026-08-20T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/a-call-to-host-the-heri-africa-research-chair-on-gender-equity-and-social-inclusion-in-education",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/o4tbD6cqBcfQ3bKtXjSqxoMUZ4Z1lNsdmOww54nq.jpg",
        "related_links": [
            {
                "label": "A Call to Host the HERI Africa Research Chair on Gender, Equity and Social Inclusion in Education",
                "url": "https://kisiiuniversity.ac.ke/storage/public/downloads//Call%20to%20host%20HERI%20Africa%20GESI%20Research%20Chair%20Call.pdf"
            }
        ],
        "display_order": 21
    },
    {
        "title": "A Call to Host the HERI Africa Research Chair on African Perspectives and Theories for Education",
        "category": "NEWS",
        "summary": "A Call to Host the HERI Africa Research Chair on African Perspectives and Theories for Education",
        "plain_text": "A Call to Host the HERI Africa Research Chair on African Perspectives and Theories for Education",
        "published_at": "2026-08-20T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/a-call-to-host-the-heri-africa-research-chair-on-african-perspectives-and-theories-for-education",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/E6z8oxsMGWcWOcvAqxGiZXmmqidk8xeMrcVsuSqr.jpg",
        "related_links": [
            {
                "label": "A Call to Host the HERI Africa Research Chair on African Perspectives and Theories for Education",
                "url": "https://kisiiuniversity.ac.ke/storage/public/downloads//Call%20to%20Host%20HERI%20Africa%20APTE%20Research%20Chair.pdf"
            }
        ],
        "display_order": 22
    },
    {
        "title": "KSU hosts Media practitioners from Kisii and Nyamira Counties",
        "category": "NEWS",
        "summary": "The University today hosted media practitioners from Kisii and Nyamira Counties for a strategic media engagement workshop, creating a vibrant platform for knowledge sharing, networking, and meaningful connections. Through insights from scholars and strategic partners, the engagement equipped members of the fourth estate with new perspectives, strengthened professional networks, and inspired fresh approaches to storytelling and development communication. The University takes pride in nurturing an",
        "plain_text": "The University today hosted media practitioners from Kisii and Nyamira Counties for a strategic media engagement workshop, creating a vibrant platform for knowledge sharing, networking, and meaningful connections. Through insights from scholars and strategic partners, the engagement equipped members of the fourth estate with new perspectives, strengthened professional networks, and inspired fresh approaches to storytelling and development communication. The University takes pride in nurturing and empowering the media as a critical partner in shaping informed societies, advancing development, and building a better world.",
        "published_at": "2026-08-18T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/ksu-hosts-media-practitioners-from-kisii-and-nyamira-counties",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/EcvLenm2Bdib3HBrldjGpXEwhLmpVAqdWcyfq6ba.jpg",
        "related_links": [],
        "display_order": 23
    },
    {
        "title": "VC and County leadership explore creating pedestrian walkway to Campus",
        "category": "NEWS",
        "summary": "In a deliberate step towards making our Student,s daily movement safer and more comfortable, the Vice Chancellor hosted County leadership to explore infrastructure solutions, including the creation of a dedicated pedestrian pathway running from the Main University gate throughout the University Way stretch. This initiative will provide a safer alternative for the increased foot traffic experienced during the morning and evening hours, particularly as our students travel to and from town for acad",
        "plain_text": "In a deliberate step towards making our Student,s daily movement safer and more comfortable, the Vice Chancellor hosted County leadership to explore infrastructure solutions, including the creation of a dedicated pedestrian pathway running from the Main University gate throughout the University Way stretch. This initiative will provide a safer alternative for the increased foot traffic experienced during the morning and evening hours, particularly as our students travel to and from town for academic and social engagements. Together, we are building an environment where every student can learn, thrive, and move with confidence. At Kisii University, the safety and welfare of our students remain at the heart of everything we do",
        "published_at": "2026-08-17T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/vc-and-county-leadership-explore-creating-pedestrian-walkway-to-campus",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/nA0K1dcXqBlHDZtt7u3W4789Ar7ry1PFQaLFpJCY.jpg",
        "related_links": [],
        "display_order": 24
    },
    {
        "title": "First years incoming",
        "category": "NEWS",
        "summary": "Our dear first years, we know you are prepping to join us on Thursday, here is some info that will make your journey to us, smooth and seamless",
        "plain_text": "Our dear first years, we know you are prepping to join us on Thursday, here is some info that will make your journey to us, smooth and seamless",
        "published_at": "2026-08-17T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/first-years-incoming",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/LVy7qnGexjv8Csxoy5tlJtQOIEk4VCNWp7X55IQD.jpg",
        "related_links": [],
        "display_order": 25
    },
    {
        "title": "Communique from the Registrar AA on Academic Calendar 2026-2027",
        "category": "NEWS",
        "summary": "______________________________________________________________________________________________________________________________________________",
        "plain_text": "______________________________________________________________________________________________________________________________________________",
        "published_at": "2026-08-12T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/communique-from-the-registrar-aa-on-academic-calendar-2026-2027",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/oTME9FeQxzbyW7DlXluPbILOv4Fn5wCE4oIipeSL.jpg",
        "related_links": [],
        "display_order": 26
    },
    {
        "title": "Communique from Registrar AA on Special Exams",
        "category": "NEWS",
        "summary": "",
        "plain_text": "",
        "published_at": "2026-08-12T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/communique-from-registrar-aa-on-special-exams",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/Gov68h1chfHe2Tz8OnoCebIGW5APFoKHcSgxSuAe.jpg",
        "related_links": [],
        "display_order": 27
    },
    {
        "title": "VC hosts Prof. Solomon Nyaanga of William Paterson University, USA",
        "category": "NEWS",
        "summary": "The Vice Chancellor hosted Prof. Solomon Nyaanga of William Paterson University, USA, for strategic discussions aimed at deepening international academic collaboration between our two institutions. The engagement advances Kisii University,s internationalization agenda, opening new pathways for student and faculty mobility, joint research and publications, co-supervision, public lectures, and cross-border knowledge exchange. Beyond collaboration, the partnership will expand access to global acade",
        "plain_text": "The Vice Chancellor hosted Prof. Solomon Nyaanga of William Paterson University, USA, for strategic discussions aimed at deepening international academic collaboration between our two institutions. The engagement advances Kisii University,s internationalization agenda, opening new pathways for student and faculty mobility, joint research and publications, co-supervision, public lectures, and cross-border knowledge exchange. Beyond collaboration, the partnership will expand access to global academic resources, including a forthcoming donation of Business Management books, while creating opportunities to connect our students and scholars with international networks, expertise, and platforms. As Kisii University continues to embrace its vision of an inclusive and borderless university, we are building partnerships that transcend borders, strengthen academic excellence, and position our graduates and scholars to make a greater impact in Kenya and across the world.",
        "published_at": "2026-08-10T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/vc-hosts-prof-solomon-nyaanga-of-william-paterson-university-usa",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/pcXorNpaRAxtiLVgefhBdnk8V3Jk7Z5EAFspacYN.jpg",
        "related_links": [],
        "display_order": 28
    },
    {
        "title": "Waziri wa Elimu ahudhuria Kongamano la CHAKAMA 2026",
        "category": "NEWS",
        "summary": "Katibu wa Baraza la Mawaziri anayesimamia Wizara ya Elimu, Mhe. Julius Migos Ogamba, EBS, leo alihudhuria Kongamano la CHAKAMA linaloendelea katika Chuo Kikuu cha Kisii, ambapo alitoa ujumbe uliowatia matumaini mapya washiriki kuhusu mustakabali wa lugha ya Kiswahili. Hotuba yake ilisisitiza nafasi muhimu ya Kiswahili kama lugha inayotuunganisha, hazina ya urithi wetu wa kitamaduni, na lugha hai inayoendelea kukua na kuendana na mabadiliko ya ulimwengu. Wakati wasomi, walimu, watafiti na wapenzi",
        "plain_text": "Katibu wa Baraza la Mawaziri anayesimamia Wizara ya Elimu, Mhe. Julius Migos Ogamba, EBS, leo alihudhuria Kongamano la CHAKAMA linaloendelea katika Chuo Kikuu cha Kisii, ambapo alitoa ujumbe uliowatia matumaini mapya washiriki kuhusu mustakabali wa lugha ya Kiswahili. Hotuba yake ilisisitiza nafasi muhimu ya Kiswahili kama lugha inayotuunganisha, hazina ya urithi wetu wa kitamaduni, na lugha hai inayoendelea kukua na kuendana na mabadiliko ya ulimwengu. Wakati wasomi, walimu, watafiti na wapenzi wa lugha wanapokutana kujadili na kuunda mustakabali wake, kongamano hili linaendelea kudhihirisha dhamira yetu ya pamoja ya kuikuza na kuiendeleza lugha ya Kiswahili kwa manufaa ya vizazi vya sasa na vijavyo. Kwa pamoja, tunaadhimisha maendeleo yake, tunakumbatia mageuzi yake, na kuendeleza nafasi yake ya kudumu katika elimu, utafiti na jamii.",
        "published_at": "2026-08-09T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/waziri-wa-elimu-ahudhuria-kongamano-la-chakama-2026",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/Wc9UmU1CBW1L4kP5jSjPnibzFwzUpfTMczeFEYXJ.jpg",
        "related_links": [],
        "display_order": 29
    },
    {
        "title": "KSU Students Return from 21 Day Medical School expedition at  University of Manchester",
        "category": "NEWS",
        "summary": "They went, they saw, they conquered. After an enriching 21-day medical school expedition at the University of Manchester, our Medicine students have returned home carrying more than knowledge. They return with new connections, fresh perspectives, unforgettable experiences, and a deeper understanding of medicine in a global context. This journey reminded us that learning knows no borders, and medicine is a language that connects us all. At Kisii University, we are not only preparing doctors for t",
        "plain_text": "They went, they saw, they conquered. After an enriching 21-day medical school expedition at the University of Manchester, our Medicine students have returned home carrying more than knowledge. They return with new connections, fresh perspectives, unforgettable experiences, and a deeper understanding of medicine in a global context. This journey reminded us that learning knows no borders, and medicine is a language that connects us all. At Kisii University, we are not only preparing doctors for today, we are nurturing globally minded healthcare leaders for tomorrow. We are Kisii University. We are borderless.",
        "published_at": "2026-08-09T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/ksu-students-return-from-21-day-medical-school-expedition-at-university-of-manchester",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/4Wk5sDm9p0G3Gzj2AXJHIufYOa2xFerUYEMACCho.jpg",
        "related_links": [],
        "display_order": 30
    },
    {
        "title": "Chakula cha Jioni kwa Washiriki wa Kongamano la CHAKAMA",
        "category": "NEWS",
        "summary": "Washiriki wa Kongamano la CHAKAMA walifurahia ukarimu wa kipekee walipoandaliwa chakula cha jioni cha kibiashara na Chuo Kikuu cha Kisii kwa heshima yao. Zaidi ya mapokezi ya kuvutia, hafla hiyo ilitoa jukwaa adhimu la kujenga mitandao ya kitaaluma, kuimarisha mahusiano ya kikazi, na kubadilishana mawazo bunifu yenye uwezo wa kuleta mabadiliko chanya. Chakula hicho cha jioni kilichochea kuanzishwa kwa mahusiano mapya, kikaimarisha ushirikiano uliopo, na kuweka msingi imara wa ubia na miungano ya",
        "plain_text": "Washiriki wa Kongamano la CHAKAMA walifurahia ukarimu wa kipekee walipoandaliwa chakula cha jioni cha kibiashara na Chuo Kikuu cha Kisii kwa heshima yao. Zaidi ya mapokezi ya kuvutia, hafla hiyo ilitoa jukwaa adhimu la kujenga mitandao ya kitaaluma, kuimarisha mahusiano ya kikazi, na kubadilishana mawazo bunifu yenye uwezo wa kuleta mabadiliko chanya. Chakula hicho cha jioni kilichochea kuanzishwa kwa mahusiano mapya, kikaimarisha ushirikiano uliopo, na kuweka msingi imara wa ubia na miungano ya kimkakati itakayochangia kukuza taaluma, utafiti na ufundishaji wa lugha ya Kiswahili. Hafla hiyo ilikuwa sherehe ya maono ya pamoja, mshikamano, na nguvu ya ushirikiano katika kujenga mustakabali wenye mafanikio makubwa kwa vizazi vya sasa na vijavyo.",
        "published_at": "2026-08-09T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/chakula-cha-jioni-kwa-washiriki-wa-kongamano-la-chakama",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/8vvU6JQU40yT6mRwIRQinxGROXAZ4zK7BWZZSpjS.jpg",
        "related_links": [],
        "display_order": 31
    },
    {
        "title": "SIKU YA PILI MOJA KWA MOJA KONGAMANO LA CHAKAMA, 2026",
        "category": "NEWS",
        "summary": "",
        "plain_text": "",
        "published_at": "2026-08-07T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/siku-ya-pili-moja-kwa-moja-kongamano-la-chakama-2026",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/kv8b4GraGLPXmxfbXg9mSkIUdMlPJ12aKock9kpg.jpg",
        "related_links": [],
        "display_order": 32
    },
    {
        "title": "Siku ya Kwanza ya Kongamano la CHAKAMA 2026",
        "category": "NEWS",
        "summary": "Kongamano la CHAKAMA 2026 limeanza kwa shamrashamra za kuvutia na maonesho ya kutia moyo yanayoadhimisha umahiri katika lugha ya Kiswahili. Kadiri mijadala na ushirikiano unavyoendelea katika Chuo Kikuu cha Kisii, mkutano huu unaweka msingi imara wa kukuza, kubuni na kueneza matumizi ya Kiswahili kwa kiwango cha kitaifa na kimataifa. Tunajivunia kuwa mstari wa mbele katika safari hii ya kipekee, tukiiendeleza na kuitangaza lugha inayounganisha jamii, kuhifadhi urithi wa utamaduni wetu, na kuhama",
        "plain_text": "Kongamano la CHAKAMA 2026 limeanza kwa shamrashamra za kuvutia na maonesho ya kutia moyo yanayoadhimisha umahiri katika lugha ya Kiswahili. Kadiri mijadala na ushirikiano unavyoendelea katika Chuo Kikuu cha Kisii, mkutano huu unaweka msingi imara wa kukuza, kubuni na kueneza matumizi ya Kiswahili kwa kiwango cha kitaifa na kimataifa. Tunajivunia kuwa mstari wa mbele katika safari hii ya kipekee, tukiiendeleza na kuitangaza lugha inayounganisha jamii, kuhifadhi urithi wa utamaduni wetu, na kuhamasisha vizazi vya sasa na vijavyo.",
        "published_at": "2026-08-07T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/siku-ya-kwanza-ya-kongamano-la-chakama-2026",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/Crsy92dBw7NHS1hnKT7zi90tM50L3m20wPlridy4.jpg",
        "related_links": [],
        "display_order": 33
    },
    {
        "title": "MOJA KWA MOJA || KONGAMANO LA CHAKAMA, 2026",
        "category": "NEWS",
        "summary": "",
        "plain_text": "",
        "published_at": "2026-08-06T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/moja-kwa-moja-kongamano-la-chakama-2026",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/PzoHtUhpDtgDRvYOt1Npp1UDPb9ynPbUjOk1rLrh.jpg",
        "related_links": [],
        "display_order": 34
    },
    {
        "title": "KSU Scouts  Bag three National Super Scouts titles",
        "category": "NEWS",
        "summary": "Our Scouts have once again demonstrated that excellence is earned through dedication, discipline, and an unwavering commitment to the ideals of Scouting. In a vibrant display of leadership, skill, and outstanding knowledge, they have emerged victorious bagging three National Super Scouts titles, earning the honor of representing Kenya in the forthcoming East & Central African Super Scouts Competition. Their continued dominance at the apex of Scouting is a testament to their resilience, teamwork,",
        "plain_text": "Our Scouts have once again demonstrated that excellence is earned through dedication, discipline, and an unwavering commitment to the ideals of Scouting. In a vibrant display of leadership, skill, and outstanding knowledge, they have emerged victorious bagging three National Super Scouts titles, earning the honor of representing Kenya in the forthcoming East & Central African Super Scouts Competition. Their continued dominance at the apex of Scouting is a testament to their resilience, teamwork, and relentless pursuit of excellence. As they prepare to fly the nation's flag on the regional stage, we proudly celebrate their remarkable achievement and encourage them to continue lifting the Kisii University name to even greater heights. Congratulations, champions! Your journey reminds us how inclusive and borderless our University is.",
        "published_at": "2026-08-05T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/ksu-scouts-bag-three-national-super-scouts-titles",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/DI72WsmA6JLJLExnrLt1gBn0sMJxC6triaWQHHB0.jpg",
        "related_links": [],
        "display_order": 35
    },
    {
        "title": "Scholarship: Announcement For African Development Fund (Adf) Support To Higher Education Science And Technology (Hest) Phase ii Project Scholarships",
        "category": "ACADEMICS",
        "summary": "VIEW FULL ADVERT Open POSTGRADUATE APPLICATION FORMS",
        "plain_text": "VIEW FULL ADVERT Open POSTGRADUATE APPLICATION FORMS",
        "published_at": "2026-08-04T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/scholarship-announcement-for-african-development-fund-adf-support-to-higher-education-science-and-technology-hest-phase-ii-project-scholarships",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/1x0kGGKM8zebjqHAnV3CBXgiuGAEvpmP4fhueTZT.png",
        "related_links": [
            {
                "label": "VIEW FULL ADVERT",
                "url": "https://kisiiuniversity.ac.ke/storage/public/downloads//Kisii%20University%20Advert%20for%202026%20HEST%20II%20Funded%20Scholarships.pdf"
            },
            {
                "label": "POSTGRADUATE APPLICATION FORMS",
                "url": "https://kisiiuniversity.ac.ke/storage/public/downloads//POSTGRADUATE-APPLICATION-FORMS.pdf"
            }
        ],
        "display_order": 36
    },
    {
        "title": "CALL FOR APPLICATIONS: 2026/2027 LANGUAGE EDUCATION POSTGRADUATE SCHOLARSHIPS IN FOUNDATIONAL LITERACY",
        "category": "ACADEMICS",
        "summary": "OPEN THE FULL ADVERT POSTGRADUATE APPLICATION FORMS POSTGRADUATE APPLICATION FORMS REFEEE CONFIDENTIAL REPORT",
        "plain_text": "OPEN THE FULL ADVERT POSTGRADUATE APPLICATION FORMS POSTGRADUATE APPLICATION FORMS REFEEE CONFIDENTIAL REPORT",
        "published_at": "2026-07-30T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/call-for-applications-20262027-language-education-postgraduate-scholarships-in-foundational-literacy",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/UN1Sy5wVsSJlnopFXM0Lb3b3oS8WX9PXHmnTWYzB.png",
        "related_links": [
            {
                "label": "OPEN THE FULL ADVERT",
                "url": "https://kisiiuniversity.ac.ke/storage/public/downloads//HERI%20Call%20for%20applications%20for%20Postgraduate%20scholarship%20Final%202026!.pdf"
            },
            {
                "label": "POSTGRADUATE APPLICATION FORMS",
                "url": "https://kisiiuniversity.ac.ke/storage/public/downloads//POSTGRADUATE-APPLICATION-FORMS.pdf"
            },
            {
                "label": "REFEEE CONFIDENTIAL REPORT",
                "url": "https://kisiiuniversity.ac.ke/storage/public/downloads//Kisii%20Uni%20-%20Referee%20Form-1.pdf"
            }
        ],
        "display_order": 37
    },
    {
        "title": "KUCCPS Course Transfer & Late Applications",
        "category": "NEWS",
        "summary": "The KUCCPS Late Application portal is open for you. Did you miss out on a Course in Kisii University, worry not, here is another great opportunity for you to join us. If you don't have a preferred Course yet? Spend the weekend transferring to us and let's take you to your future.",
        "plain_text": "The KUCCPS Late Application portal is open for you. Did you miss out on a Course in Kisii University, worry not, here is another great opportunity for you to join us. If you don't have a preferred Course yet? Spend the weekend transferring to us and let's take you to your future.",
        "published_at": "2026-07-23T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/kuccps-course-transfer-late-applications",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/lT2YVjg2sV8Tz4NdfyLOm5VkvfBDuXLrRUWDpxPN.jpg",
        "related_links": [],
        "display_order": 38
    },
    {
        "title": "Kongamano lijalo la CHAKAMA la 2026 linawakutanisha Wataalamu wa Kiswahili",
        "category": "NEWS",
        "summary": "Kongamano lijalo la CHAKAMA linawakutanisha wataalamu wa Kiswahili, watendaji, walimu na wabobezi wa sekta mbalimbali. Jitayarishe kwa mjadala wenye tija, ubadilishanaji wa maarifa, mawazo bunifu na kujifunza kutoka kwa vinara wa taaluma, huku tukisherehekea ubora wa Kiswahili.",
        "plain_text": "Kongamano lijalo la CHAKAMA linawakutanisha wataalamu wa Kiswahili, watendaji, walimu na wabobezi wa sekta mbalimbali. Jitayarishe kwa mjadala wenye tija, ubadilishanaji wa maarifa, mawazo bunifu na kujifunza kutoka kwa vinara wa taaluma, huku tukisherehekea ubora wa Kiswahili.",
        "published_at": "2026-07-23T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/kongamano-lijalo-la-chakama-la-2026-linawakutanisha-wataalamu-wa-kiswahili",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/KR1TsF4LxXAQdrRlv9WFUG7IkSTK8WeWGjUmQxRH.jpg",
        "related_links": [],
        "display_order": 39
    },
    {
        "title": "Campus Spark Innovation Festival",
        "category": "NEWS",
        "summary": "Today, 17 carefully selected innovations took center stage as our brilliant students pitched their ideas to a panel of distinguished judges during the Campus Spark Innovation Festival. In his opening remarks, the Vice Chancellor challenged the innovators to remain steadfast in their vision, refine their ideas with purpose, and focus on creating solutions that make a meaningful difference in society. At Kisii University, we believe that innovation begins with courage, curiosity, and the determina",
        "plain_text": "Today, 17 carefully selected innovations took center stage as our brilliant students pitched their ideas to a panel of distinguished judges during the Campus Spark Innovation Festival. In his opening remarks, the Vice Chancellor challenged the innovators to remain steadfast in their vision, refine their ideas with purpose, and focus on creating solutions that make a meaningful difference in society. At Kisii University, we believe that innovation begins with courage, curiosity, and the determination to solve real-world challenges. Through opportunities like the Campus Spark Innovation Festival, we continue to nurture the next generation of creators, problem-solvers, and change-makers",
        "published_at": "2026-07-21T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/campus-spark-innovation-festival",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/8buagXwROd1CclS7qzpNhMu9ipZgLgrNengspbCz.jpg",
        "related_links": [],
        "display_order": 40
    },
    {
        "title": "Campus Spark Innovation Festival Zoom link",
        "category": "NEWS",
        "summary": "Unable to join us physically at the Senate Chambers, we got your back. Here is a way to connect with us remotely and appreciate every bit of ingenuity our students have to offer.",
        "plain_text": "Unable to join us physically at the Senate Chambers, we got your back. Here is a way to connect with us remotely and appreciate every bit of ingenuity our students have to offer.",
        "published_at": "2026-07-20T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/campus-spark-innovation-festival-zoom-link",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/uNRdi9Cn3obHzOvZTNVxSWwMpau6i5RakHvj4bxB.jpg",
        "related_links": [],
        "display_order": 41
    },
    {
        "title": "KSU Medicine Students visit University of Manchester for 21 Day Program",
        "category": "NEWS",
        "summary": "Today the second batch of our 5th year Medicine Students take off to the University of Manchester for a 21 day Summer School Exchange Program. We truly are the Borderless Masters.",
        "plain_text": "Today the second batch of our 5th year Medicine Students take off to the University of Manchester for a 21 day Summer School Exchange Program. We truly are the Borderless Masters.",
        "published_at": "2026-07-18T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/ksu-medicine-students-visit-university-of-manchester-for-21-day-program",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/5p4F5uqG5WRzrnFEEyjFUI7JaWCTwN6NoQP4hRXr.jpg",
        "related_links": [],
        "display_order": 42
    },
    {
        "title": "KSU President's Award Gold Residential Project 2026",
        "category": "NEWS",
        "summary": "Impact drilled down into communities creates a lasting legacy, Kisii University Students from the Presidents Award Club know how to do this better than most.",
        "plain_text": "Impact drilled down into communities creates a lasting legacy, Kisii University Students from the Presidents Award Club know how to do this better than most.",
        "published_at": "2026-07-16T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/ksu-presidents-award-gold-residential-project-2026",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/PsEmPCxFYsC2JoLKiTsf1cTuNpYUl3ER9cQNLr2Q.jpg",
        "related_links": [],
        "display_order": 43
    },
    {
        "title": "VC meets Kenya Nutrition & Dieticians Institute CEO",
        "category": "NEWS",
        "summary": "Today, our Vice Chancellor hosted the CEO of the Kenya Nutrition & Dieticians Institute for a productive engagement that culminated in the signing of a Memorandum of Understanding (MoU) between our two institutions. This strategic partnership marks the beginning of an exciting journey of collaboration in advancing nutrition education, research, and professional development. It also lays the foundation for the upcoming Nutrition Conference, which will be co-hosted by our two institutions here at ",
        "plain_text": "Today, our Vice Chancellor hosted the CEO of the Kenya Nutrition & Dieticians Institute for a productive engagement that culminated in the signing of a Memorandum of Understanding (MoU) between our two institutions. This strategic partnership marks the beginning of an exciting journey of collaboration in advancing nutrition education, research, and professional development. It also lays the foundation for the upcoming Nutrition Conference, which will be co-hosted by our two institutions here at Kisii University. At Kisii University, every partnership opens new doors, every milestone strengthens our vision, and every success story inspires us to aim even higher. Together, we are building a future driven by innovation, excellence, and meaningful impact.",
        "published_at": "2026-07-14T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/vc-meets-kenya-nutrition-dieticians-institute-ceo",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/x4tUUeSbqae1GI2sOKFov12T9LAFA2Xr6bTIJYK0.jpg",
        "related_links": [],
        "display_order": 44
    },
    {
        "title": "KUCCPS 2026 Admissions",
        "category": "NEWS",
        "summary": "Our First years, its your time to shine. Go get your admission letters and immediately begin your online admission process. Welcome home. https://digital.kisiiuniversity.ac.ke/students/admissions/center www.hef.co.ke",
        "plain_text": "Our First years, its your time to shine. Go get your admission letters and immediately begin your online admission process. Welcome home. https://digital.kisiiuniversity.ac.ke/students/admissions/center www.hef.co.ke",
        "published_at": "2026-07-13T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/kuccps-2026-admissions",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/PvKv1g7ilQJo75E6hqe7JuzmqKGhBRnJ1AgIxPx7.jpg",
        "related_links": [
            {
                "label": "https://digital.kisiiuniversity.ac.ke/students/admissions/center",
                "url": "https://digital.kisiiuniversity.ac.ke/students/admissions/center"
            },
            {
                "label": "www.hef.co.ke",
                "url": "https://kisiiuniversity.ac.ke/blog/www.hef.co.ke"
            }
        ],
        "display_order": 45
    },
    {
        "title": "KSU VC meets CS Education Hon. Julius Ogamba, MBS, and the CS Energy, Hon. Opiyo Wandayi, EGH",
        "category": "NEWS",
        "summary": "The Vice Chancellor was privileged to host the Cabinet Secretary for Education, Hon. Julius Ogamba, MBS, and the Cabinet Secretary for Energy, Hon. Opiyo Wandayi, EGH. Happening on the sidelines of the Nyota Program Launch- Kisii edition, the two Cabinet Secretaries held fruitful bilateral discussions with the Vice Chancellor, expressing their appreciation for the remarkable growth, excellence, and transformation taking place at Kisii University. They commended the University's leadership, toget",
        "plain_text": "The Vice Chancellor was privileged to host the Cabinet Secretary for Education, Hon. Julius Ogamba, MBS, and the Cabinet Secretary for Energy, Hon. Opiyo Wandayi, EGH. Happening on the sidelines of the Nyota Program Launch- Kisii edition, the two Cabinet Secretaries held fruitful bilateral discussions with the Vice Chancellor, expressing their appreciation for the remarkable growth, excellence, and transformation taking place at Kisii University. They commended the University's leadership, together with the Government of Kenya, for the visionary commitment and strategic investments that continue to propel the institution to greater heights. As Kisii University strengthens its partnerships with government and other key stakeholders, it remains steadfast in its mission to nurture innovation, empower future generations, and expand opportunities for quality education, research, and community impact. Every milestone achieved is a testament to what visionary leadership, collaboration, and shared purpose can accomplish.",
        "published_at": "2026-07-12T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/ksu-vc-meets-cs-education-hon-julius-ogamba-mbs-and-the-cs-energy-hon-opiyo-wandayi-egh",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/HpYmfP0KmtVkOjyUQuQOzeyWoXbyJtAq7sJOPIc1.jpg",
        "related_links": [],
        "display_order": 46
    },
    {
        "title": "Mathematical Modeling for Infectious Diseases and Antimicrobial Resistance",
        "category": "NEWS",
        "summary": "The Department of Mathematics and Actuarial Science proudly hosted a transformative two-day hands-on workshop on Mathematical Modeling for Infectious Diseases and Antimicrobial Resistance (AMR) in Africa. Bringing together passionate researchers, students, and emerging scholars, the workshop empowered participants with practical mathematical modeling skills to address some of Africa's most urgent public health challenges. Beyond technical training, the event fostered meaningful collaborations, s",
        "plain_text": "The Department of Mathematics and Actuarial Science proudly hosted a transformative two-day hands-on workshop on Mathematical Modeling for Infectious Diseases and Antimicrobial Resistance (AMR) in Africa. Bringing together passionate researchers, students, and emerging scholars, the workshop empowered participants with practical mathematical modeling skills to address some of Africa's most urgent public health challenges. Beyond technical training, the event fostered meaningful collaborations, strengthened research networks, and inspired the next generation of scientists to develop innovative, evidence-based solutions for healthier communities across the continent. Together, Kisii University is advancing knowledge, building capacity, and shaping a future where mathematics drives impactful change in public health.",
        "published_at": "2026-07-10T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/mathematical-modeling-for-infectious-diseases-and-antimicrobial-resistance",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/WW6dXKqOhtnLbGxCoks2jqST7uoPcTS85m9QKwhb.jpg",
        "related_links": [],
        "display_order": 47
    },
    {
        "title": "Congratulations to all 7903 KUCCPS Students",
        "category": "NEWS",
        "summary": "Congratulations to you all for being placed with us. We look forward to making your acquaintance soon.",
        "plain_text": "Congratulations to you all for being placed with us. We look forward to making your acquaintance soon.",
        "published_at": "2026-07-08T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/congratulations-to-all-7903-kuccps-students",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/OcQ7VM0diGathU8fInkBAgXRws3eEeLzB88yhFhS.jpg",
        "related_links": [],
        "display_order": 48
    },
    {
        "title": "Human Rights Lecture by Hon Justice Teresa Achieng Odera",
        "category": "STUDENT LIFE",
        "summary": "The Vice Chancellor hosted Hon Justice Teresa Achieng Odera, Judge of the High Court of Kenya, for a Public Lecture under the topic, Upholding human rights in a changing Kenya with focus on the use of technology in the administration of justice. Kisii University Students especially from our Law School benefited immensely from her insights into this broad field. Kisii University continues to tap industry experts to enhance our Lecturers classroom teaching in a bid to produce wholesome students.",
        "plain_text": "The Vice Chancellor hosted Hon Justice Teresa Achieng Odera, Judge of the High Court of Kenya, for a Public Lecture under the topic, Upholding human rights in a changing Kenya with focus on the use of technology in the administration of justice. Kisii University Students especially from our Law School benefited immensely from her insights into this broad field. Kisii University continues to tap industry experts to enhance our Lecturers classroom teaching in a bid to produce wholesome students.",
        "published_at": "2024-11-27T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/human-rights-lecture-by-hon-justice-teresa-achieng-odera",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/PTQzh9o68Xo4OvDVHIeiExMOINcAHMB8PVZgYCMg.jpg",
        "related_links": [],
        "display_order": 49
    },
    {
        "title": "Kisii and University of Manchester MOU",
        "category": "ACADEMICS",
        "summary": "The Vice Chancellor hosted Medical Students from the University of Manchester currently in a Teaching Program by our School of Health Sciences under the Kenya UK Health Alliance Umbrella for an exchange program with our students. Under the active Kisii and University of Manchester MOU our medical students are also set to be in the University of Manchester for the summertime Program as from 22nd of July this year. Kisii University continues to link strategically with international institutions of",
        "plain_text": "The Vice Chancellor hosted Medical Students from the University of Manchester currently in a Teaching Program by our School of Health Sciences under the Kenya UK Health Alliance Umbrella for an exchange program with our students. Under the active Kisii and University of Manchester MOU our medical students are also set to be in the University of Manchester for the summertime Program as from 22nd of July this year. Kisii University continues to link strategically with international institutions of repute to be able to provide the best for our students.",
        "published_at": "2024-06-19T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/kisii-and-university-of-manchester-mou",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/S3Z05VvwCO5nzaeXe7q1ktZVEU2OPvcXkltNhVdn.jpg",
        "related_links": [],
        "display_order": 50
    },
    {
        "title": "A.I. Powered Mental Health System",
        "category": "INNOVATION",
        "summary": "We Celebrate our Computer Science Student Davis Ogega who has developed an A.I. Powered Mental Health System that gives you comfort and mental support at no cost. With the rise in mental health issues Kisii University is helping create solutions to avert possible crises in the near and distant futures.",
        "plain_text": "We Celebrate our Computer Science Student Davis Ogega who has developed an A.I. Powered Mental Health System that gives you comfort and mental support at no cost. With the rise in mental health issues Kisii University is helping create solutions to avert possible crises in the near and distant futures.",
        "published_at": "2024-06-19T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/ai-powered-mental-health-system",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/JH3ZLbbt7i7UeDPcqEjdcrGxg9ZaR8INKQX36RLd.jpg",
        "related_links": [],
        "display_order": 51
    },
    {
        "title": "General Library Rules And Regulations",
        "category": "STUDENT LIFE",
        "summary": "",
        "plain_text": "",
        "published_at": "2026-08-26T12:00:00+03:00",
        "source_url": "https://kisiiuniversity.ac.ke/blog/general-library-rules-and-regulations",
        "source_image_url": "https://kisiiuniversity.ac.ke/storage/public/resources/2JV79rQthVZm09WknSi2cs0m2CCLdcjZSaRRPhPW.jpg",
        "gallery_image_urls": [
            "https://kisiiuniversity.ac.ke/resources/6a8ee914e2157.jpeg",
            "https://kisiiuniversity.ac.ke/resources/6a8ee914f2002.jpeg",
        ],
        "related_links": [],
        "display_order": 52
    }
]


def _hydrate(records: list[dict[str, object]]) -> list[dict[str, object]]:
    hydrated: list[dict[str, object]] = []
    for record in records:
        item = dict(record)
        value = item.get("published_at")
        if isinstance(value, str):
            item["published_at"] = datetime.fromisoformat(value)
        hydrated.append(item)
    return hydrated


LIVE_SITE_NEWS_UPDATES_20260914 = _hydrate(_RAW)

__all__ = ["LIVE_SITE_NEWS_UPDATES_20260914"]
