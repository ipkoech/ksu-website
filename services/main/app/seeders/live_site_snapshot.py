"""Live Kisii University website snapshot used by main-service seeders.

Generated from https://kisiiuniversity.ac.ke on 2026-07-07.
Each record preserves its official source URL and source image URL.
"""

from __future__ import annotations

from datetime import datetime


def _dt(value: str) -> datetime:
    return datetime.fromisoformat(value)


def _hydrate(records: list[dict[str, object]]) -> list[dict[str, object]]:
    hydrated: list[dict[str, object]] = []
    for record in records:
        item = dict(record)
        for key in ("published_at", "start_date", "end_date"):
            value = item.get(key)
            if isinstance(value, str):
                item[key] = _dt(value)
        hydrated.append(item)
    return hydrated


_LIVE_SITE_NEWS_ITEMS = [{'title': 'KSU Scouts Clinch three Regional titles',
  'category': 'NEWS',
  'summary': 'Our Scouts have once again made Kisii University proud! After four days of intense competition, they '
             'emerged victorious, clinching three regional titles and earning the honor of representing the Lake '
             'Region at the forthcoming National Super Scouts Competitions. This remarkable achievement is a testament '
             'to their',
  'plain_text': 'Our Scouts have once again made Kisii University proud! After four days of intense competition, they '
                'emerged victorious, clinching three regional titles and earning the honor of representing the Lake '
                'Region at the forthcoming National Super Scouts Competitions. This remarkable achievement is a '
                'testament to their discipline, resilience, teamwork, and unwavering commitment to excellence. At '
                'Kisii University, our students continue to distinguish themselves not only through academic '
                'excellence but also by excelling in co-curricular activities that shape confident, responsible, and '
                'impactful leaders.',
  'published_at': '2026-07-06T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ksu-scouts-clinch-three-regional-titles',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/J9tDpJqK5n05ZXUYJ8JgC27fgiWjXrhlM5BSNeF1.jpg',
  'display_order': 10,
  'is_featured': False},
 {'title': 'Kudos Davis Ogega, Barbara Aron, and Talia Tamar',
  'category': 'NEWS',
  'summary': 'Congratulations to Davis Ogega, Barbara Aron, and Talia Tamar on emerging as winners at the innovation '
             'challenge organized by Open University of Kenya and KISE! Their award-winning innovation, Rax AI, is '
             "redefining what's possible in artificial intelligence by optimizing AI models to reduce computer costs "
             'without',
  'plain_text': 'Congratulations to Davis Ogega, Barbara Aron, and Talia Tamar on emerging as winners at the '
                'innovation challenge organized by Open University of Kenya and KISE! Their award-winning innovation, '
                "Rax AI, is redefining what's possible in artificial intelligence by optimizing AI models to reduce "
                'computer costs without compromising performance. This innovation is already making an impact with Rax '
                '4.5 being the most downloaded open-source AI model from Kenya and ranks among the Top 10 most '
                'downloaded open-source AI models in Africa, with 100,000+ monthly downloads on Hugging Face. Kisii '
                'University continues to nurture innovative, creative and industry ready graduates who are changing '
                'the world one innovation at a time.',
  'published_at': '2026-07-05T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kudos-davis-ogega-barbara-aron-and-talia-tamar',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/adUCvtdYOaLZUZagrvavqG0AMiAzItG2vPAuutlr.jpg',
  'display_order': 11,
  'is_featured': False},
 {'title': 'Cancer Prevention and Care Workshop',
  'category': 'NEWS',
  'summary': 'Through a dynamic engagement that brought together academic leaders and practitioners, the University '
             'explored innovative approaches to resource mobilization, university partnerships, and community-driven '
             'solutions for cancer prevention and care. The discussions showcased inspiring cross-national '
             'experiences,',
  'plain_text': 'Through a dynamic engagement that brought together academic leaders and practitioners, the University '
                'explored innovative approaches to resource mobilization, university partnerships, and '
                'community-driven solutions for cancer prevention and care. The discussions showcased inspiring '
                'cross-national experiences, demonstrating how strategic investment and sustained collaboration can '
                'build lasting institutions, strengthen social work education, and empower future generations of '
                'professionals. As a hub of knowledge, research, and collaboration, Kisii University remains committed '
                'to creating opportunities that extend beyond its classrooms, benefiting students, faculty, and the '
                'wider community. By fostering meaningful partnerships and embracing local knowledge, the University '
                "is helping shape sustainable solutions to some of Africa's most pressing health challenges. Together, "
                'we are building healthier communities, empowering future leaders, and creating lasting impact.',
  'published_at': '2026-07-01T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/cancer-prevention-and-care-workshop',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/tvEqe86X3FTBlvpd011zzESDPBgKBE6Oz1yYyTtv.jpg',
  'display_order': 12,
  'is_featured': False},
 {'title': 'Medical Class of 2031 White Coat Ceremony',
  'category': 'NEWS',
  'summary': 'The Medical Class of 2031 officially embarked on their journey toward becoming tomorrow,s doctors during '
             'a memorable White Coat Ceremony. This significant milestone marks the beginning of a path defined by '
             'dedication, compassion, and excellence in healthcare. Following the graduation of our first cohort of '
             'doctors',
  'plain_text': 'The Medical Class of 2031 officially embarked on their journey toward becoming tomorrow,s doctors '
                'during a memorable White Coat Ceremony. This significant milestone marks the beginning of a path '
                'defined by dedication, compassion, and excellence in healthcare. Following the graduation of our '
                "first cohort of doctors last year, this ceremony is another proud moment in Kisii University's "
                'journey. As health sciences continue to be our niche, we remain committed to nurturing highly '
                'skilled, ethical, and compassionate healthcare professionals who will transform lives and strengthen '
                'communities. Congratulations to the Class of 2031 as you take your first steps toward a noble '
                'profession. May your white coats always symbolize service, integrity, and hope. The future of '
                'healthcare begins with you, and Kisii University is proud to be part of your journey.',
  'published_at': '2026-06-27T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/medical-class-of-2031-white-coat-ceremony',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/uNUS9IMozyHWXmwSCGJUDdotgRYXKCaj8cM6uT7l.jpg',
  'display_order': 13,
  'is_featured': False},
 {'title': 'Dr. Rindoria, Dr. Rono, and Dr. Gichana Represent KSU at SRI 2026 Africa Regional Congress',
  'category': 'NEWS',
  'summary': 'All the way from Cape Town, South Africa, Kisii University continues to demonstrate its growing global '
             'footprint in research, innovation, and strategic partnerships. The University is proudly represented at '
             'the SRI 2026 African Regional Congress hapening now in South Africa by a distinguished delegation '
             'comprising Dr.',
  'plain_text': 'All the way from Cape Town, South Africa, Kisii University continues to demonstrate its growing '
                'global footprint in research, innovation, and strategic partnerships. The University is proudly '
                'represented at the SRI 2026 African Regional Congress hapening now in South Africa by a distinguished '
                'delegation comprising Dr. Rindoria, Dr. Charles Rono, and Dr. Zipporah Gichana. Their participation '
                'is made possible through the sponsorship of the Future Earth Africa Leadership Centre at the '
                'University of Limpopo, a valued partner that has maintained a strong and impactful collaboration with '
                'Kisii University since 2023. Kisii University continues to blur the borders of knowledge, strengthen '
                'international partnerships, and inspire a new generation of scholars dedicated to addressing global '
                'challenges through collective action and shared expertise.',
  'published_at': '2026-06-25T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/dr-rindoria-dr-rono-and-dr-gichana-represent-ksu-at-sri-2026-africa-regional-congress',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/BERydgrTHiRqBN0hCtBLhcOwBt5TG4GOpPTGFTlA.jpg',
  'display_order': 14,
  'is_featured': False},
 {'title': 'Dr. Pamela Wadende Reps Kisii University at ISSBD Conference in Seoul',
  'category': 'NEWS',
  'summary': 'Kisii University continues to shine on the global academic stage through the remarkable achievements of '
             'its scholars and the strength of its international partnerships. Currently representing the University '
             'at the ongoing International Society for the Study of Behavioural Development (ISSBD) Conference in '
             'Seoul, South',
  'plain_text': 'Kisii University continues to shine on the global academic stage through the remarkable achievements '
                'of its scholars and the strength of its international partnerships. Currently representing the '
                'University at the ongoing International Society for the Study of Behavioural Development (ISSBD) '
                'Conference in Seoul, South Korea, Dr. Pamela Wadende exemplifies the excellence, dedication, and '
                'transformative impact that define the Kisii University community. In recognition of her outstanding '
                'contributions to the field, Dr. Wadende has been honored with a prestigious Fellowship Award at the '
                'conference, a testament to her scholarly excellence and commitment to advancing knowledge that '
                "positively impacts society. As Kisii University's presence grows across continents, so does its "
                'mission of empowering minds, transforming communities, and shaping a future driven by knowledge, '
                'innovation, and global engagement.',
  'published_at': '2026-06-25T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/dr-pamela-wadende-reps-kisii-university-at-issbd-conference-in-seoul',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/u8qmtjBmbXAdBQWVcCgIPW469gzllJRMNH3oFBBb.jpg',
  'display_order': 15,
  'is_featured': False},
 {'title': 'KMFRI CEO Dr. Paul Orina pays courtesy call to Vice Chancellor',
  'category': 'NEWS',
  'summary': 'Today, the Director General and CEO of the Kenya Marine and Fisheries Research Institute (KMFRI), Dr. '
             'Paul Orina, paid the Vice Chancellor a courtesy call that marked another significant milestone in the '
             'enduring partnership between the two institutions. During the courtesy call, the leaders engaged in '
             'productive',
  'plain_text': 'Today, the Director General and CEO of the Kenya Marine and Fisheries Research Institute (KMFRI), Dr. '
                'Paul Orina, paid the Vice Chancellor a courtesy call that marked another significant milestone in the '
                'enduring partnership between the two institutions. During the courtesy call, the leaders engaged in '
                'productive discussions on ongoing collaborative initiatives and shared aspirations for the future. '
                'The discussion underscored a common vision of advancing knowledge through research, innovation, and '
                'strategic partnerships. By strengthening their collaboration, KMFRI and Kisii University continue to '
                'pave the way for ground-breaking solutions that promote sustainable resource management, '
                'environmental stewardship, and socio-economic development. This partnership stands as a powerful '
                'example of how institutions can work together to inspire progress, transform communities, and create '
                'a more sustainable future for generations to come.',
  'published_at': '2026-06-25T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kmfri-ceo-dr-paul-orina-pays-courtesy-call-to-vice-chancellor',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/RMyGOVMcYj9gJdZt2sTIlOgxsRgolOpdhJw04aZW.jpg',
  'display_order': 16,
  'is_featured': False},
 {'title': 'KSU Vice Chancellor Joins Nyamira County Governor to Celebrate Vocational Training Graduates',
  'category': 'NEWS',
  'summary': 'Today, the Vice Chancellor, hosted by the Nyamira County Governor, joined graduates from the County,s '
             'Vocational Training Centres in a memorable celebration of achievement and new beginnings. Drawing from '
             'his vast experience in life and academia, he passionately encouraged the graduates to step confidently '
             'into the',
  'plain_text': 'Today, the Vice Chancellor, hosted by the Nyamira County Governor, joined graduates from the County,s '
                'Vocational Training Centres in a memorable celebration of achievement and new beginnings. Drawing '
                'from his vast experience in life and academia, he passionately encouraged the graduates to step '
                'confidently into the world and put their hard-earned skills to meaningful use. His words of wisdom, '
                'resilience, and purpose inspired them to embrace opportunities, overcome challenges, and become '
                'agents of positive change in their communities and beyond. As an institution committed to nurturing '
                'excellence, Kisii University continues to lead in igniting the spirit of ambition, innovation, and '
                'lifelong learning. Through such engagements.',
  'published_at': '2026-06-24T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ksu-vice-chancellor-joins-nyamira-county-governor-to-celebrate-vocational-training-graduates',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/CL8DOu0Kt4REaFZhYzLcil31wOk3NfGODGep95lF.jpg',
  'display_order': 17,
  'is_featured': False},
 {'title': 'KSU Top Achievers Dinner',
  'category': 'NEWS',
  'summary': 'Last evening, the Vice Chancellor hosted a special Top Achievers Dinner in recognition of students whose '
             'dedication, talent, and resilience have produced exceptional results throughout their Kisii University '
             'journey. What stood out was not only academic excellence, but the remarkable diversity of achievement',
  'plain_text': 'Last evening, the Vice Chancellor hosted a special Top Achievers Dinner in recognition of students '
                'whose dedication, talent, and resilience have produced exceptional results throughout their Kisii '
                'University journey. What stood out was not only academic excellence, but the remarkable diversity of '
                'achievement represented in the room. From members of the Presidents Award Club, the Tax Society, and '
                'St. John Ambulance, to talented dramatists, basketball players who proudly represented the university '
                'in Nigeria, and innovators behind ground breaking projects and solutions, each story reflected a '
                'unique path of growth and impact. The evening was a powerful reminder that true education extends far '
                'beyond the classroom. At Kisii University, students are empowered to discover their potential, '
                'cultivate leadership, serve their communities, innovate boldly, and pursue excellence in every sphere '
                'of life. Kisii University continues to demonstrate that when young people are given the right '
                'environment to learn, lead, and thrive, they become the architects of a brighter future.',
  'published_at': '2026-06-24T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ksu-top-achievers-dinner',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/X5W42j4UtCHBvwnZbsxcPwKFshwqMiE2BR6MEtRf.jpg',
  'display_order': 18,
  'is_featured': False},
 {'title': 'KSU St.John Ambulance delegation attend 95th Annual Parade Inspection',
  'category': 'NEWS',
  'summary': 'The Vice-Chancellor proudly led the Kisii University St. John Ambulance delegation in commemorating the '
             '95th Annual Parade Inspection, graciously hosted by His Excellency President William Ruto. This '
             'distinguished occasion was not only a celebration of a rich legacy of service but also a moment of '
             'profound reflection',
  'plain_text': 'The Vice-Chancellor proudly led the Kisii University St. John Ambulance delegation in commemorating '
                'the 95th Annual Parade Inspection, graciously hosted by His Excellency President William Ruto. This '
                'distinguished occasion was not only a celebration of a rich legacy of service but also a moment of '
                'profound reflection on the enduring impact that the St. John Ambulance Priory continues to make in '
                'transforming lives and advancing humanitarian service across the nation. The event provided an '
                'inspiring platform to recognize the selfless dedication, discipline, and compassion that define the '
                'spirit of volunteerism. It also offered a valuable opportunity to showcase and appreciate the '
                'remarkable contributions of Kisii University members, whose commitment to service continues to make a '
                'meaningful difference within our communities and beyond.',
  'published_at': '2026-06-22T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ksu-stjohn-ambulance-delegation-attend-95th-annual-parade-inspection',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/7YWfEHI0QzEVAlT5sdVHDJcBoTof9KGe3uK2x5cC.jpg',
  'display_order': 19,
  'is_featured': False},
 {'title': 'School of Health Sciences receives 50million worth of Equipment',
  'category': 'NEWS',
  'summary': 'All the way from Boston, Massachusetts, after months of putting in incredible work, today, Kisii '
             'University proudly celebrate,s a remarkable milestone for the Department of Medical Microbiology and '
             'Parasitology following the successful in-kind arrival of equipment worth over 50 million Kenya Shillings '
             'from Seeding',
  'plain_text': 'All the way from Boston, Massachusetts, after months of putting in incredible work, today, Kisii '
                'University proudly celebrate,s a remarkable milestone for the Department of Medical Microbiology and '
                'Parasitology following the successful in-kind arrival of equipment worth over 50 million Kenya '
                'Shillings from Seeding Labs, Boston, USA. This achievement, made possible through a winning proposal '
                'developed by Dr. Eric Omwenga under the visionary leadership of our Vice Chancellor, is a testament '
                'to innovation, self-sacrifice and commitment to advancing scientific research. The equipment will '
                'provide critical infrastructure that will significantly strengthen research in infectious diseases '
                'while enriching the teaching and learning experience within the School of Health Sciences. Even more '
                'exciting is the emerging possibility of introducing molecular diagnostics capabilities in our '
                'laboratories, opening new frontiers in research, training, and healthcare impact. Kisii University '
                'continues to strengthen its health niche with every passing day.',
  'published_at': '2026-06-18T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/school-of-health-sciences-receives-50million-worth-of-equipment',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/jM6e7rjGSW9rRaGpqH0UCgRnwXLpuhOyFzEqy5c9.jpg',
  'display_order': 20,
  'is_featured': False},
 {'title': 'TENDER NOTICE JUNE 2026',
  'category': 'TENDERS',
  'summary': 'For More Information Visit Our Procurement Portal TENDER DOCUMENT_KISII UNIVERSITY CONSTRUCTION OF '
             'OLYMPIC SIZE SWIMMING POOL-JUNE 2026 , FINAL BQ N DRAWINGS KISII UNIVERSITY SWIMMING POOL COMPLEXES '
             'COMBINED BLANK BQ + DRAWINGS REQUEST FOR PROPOSAL FOR AUDIT SOFTWARE RFP TENDER FOR DISPOSAL OF MOTOR '
             'VEHICLES AND OTHER',
  'plain_text': 'For More Information Visit Our Procurement Portal TENDER DOCUMENT_KISII UNIVERSITY CONSTRUCTION OF '
                'OLYMPIC SIZE SWIMMING POOL-JUNE 2026 , FINAL BQ N DRAWINGS KISII UNIVERSITY SWIMMING POOL COMPLEXES '
                'COMBINED BLANK BQ + DRAWINGS REQUEST FOR PROPOSAL FOR AUDIT SOFTWARE RFP TENDER FOR DISPOSAL OF MOTOR '
                'VEHICLES AND OTHER SURPLUS AND OBSOLETE ITEMS',
  'published_at': '2026-06-18T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/tender-notice-june-2026',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/PQO8gSp6wLrEiRom1sqat4otkRGRfDljvUSTOwQR.jpg',
  'display_order': 21,
  'is_featured': False},
 {'title': 'LIVE Day 3 of the 3rd International Multi-Disciplinary Conference',
  'category': 'NEWS',
  'summary': 'Welcome to the official live broadcast of the 3rd International Multi-Disciplinary Conference hosted by '
             'Kisii University. Theme: Reimagining Inclusive and Borderless Knowledge through Global Health for '
             'Sustainable Development. This conference brings together researchers, policymakers, academics, industry '
             'leaders,',
  'plain_text': 'Welcome to the official live broadcast of the 3rd International Multi-Disciplinary Conference hosted '
                'by Kisii University. Theme: Reimagining Inclusive and Borderless Knowledge through Global Health for '
                'Sustainable Development. This conference brings together researchers, policymakers, academics, '
                'industry leaders, innovators, students, and development partners to share knowledge, foster '
                'collaboration, and explore innovative solutions to global challenges affecting health, education, '
                'governance, technology, business, and sustainable development. Conference Sub-Themes -Human Cultures, '
                'Health Knowledge Systems and Societal Transformation in a Borderless World -Enhanced Environmental '
                'Conservation and Food Security for a Healthy World -Holistic Education for Healthy and Sustainable '
                'Development -Integrating Scientific Data for Therapeutics, Decision Making, Forecasting and '
                'Predictive Analytics in Global Health -Strengthening Community-Centred Global Health Innovations for '
                'Sustainable Development -Law, Governance and Public Policy for a Healthy and Just Society '
                '-Transforming Business and Economic Models for Sustainable Health Systems -Leveraging Digital '
                'Innovation and Information Systems to Democratize Global Health Knowledge for Sustainable Development',
  'published_at': '2026-06-11T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/live-day-3-of-the-3rd-international-multi-disciplinary-conference',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/OFs7lRWRCgFQ80auwzXWhFHPa8dzlWqFBFa8oJnp.jpg',
  'display_order': 22,
  'is_featured': False},
 {'title': 'Day 2 of the 3rd International Multidisciplinary Conference',
  'category': 'NEWS',
  'summary': 'Today, during the Second Day of the 3rd International Multidisciplinary Conference, we elevated the '
             'conversation and set the stage for meaningful engagement, innovation, and collaboration. The conference '
             'continues to serve as a vibrant and inclusive platform where scholars, professionals, and thought '
             'leaders can',
  'plain_text': 'Today, during the Second Day of the 3rd International Multidisciplinary Conference, we elevated the '
                'conversation and set the stage for meaningful engagement, innovation, and collaboration. The '
                'conference continues to serve as a vibrant and inclusive platform where scholars, professionals, and '
                'thought leaders can connect, network, and learn from diverse perspectives. As we reflect on this '
                'remarkable gathering, we are reminded that knowledge grows when it is shared and that progress is '
                'driven by collective wisdom. Kisii University continues to shine beyond its traditional boundaries, '
                'fostering impactful partnerships and generating solutions that contribute to the advancement of '
                'society. Together, we are not only exchanging ideas, we are shaping the future.',
  'published_at': '2026-06-11T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/day-2-of-the-3rd-international-multidisciplinary-conference',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/t3C7ZebesTloShVt5467zcL44X6VXRhv4ZbmmBYT.jpg',
  'display_order': 23,
  'is_featured': False},
 {'title': 'LIVE Day 2 of the 3rd International Multi-Disciplinary Conference',
  'category': 'NEWS',
  'summary': 'Welcome to the live broadcast of the Second Day of the 3rd International Multi-Disciplinary Conference '
             'hosted by Kisii University. Theme: Reimagining Inclusive and Borderless Knowledge through Global Health '
             'for Sustainable Development. This conference brings together researchers, policymakers, academics, '
             'industry',
  'plain_text': 'Welcome to the live broadcast of the Second Day of the 3rd International Multi-Disciplinary '
                'Conference hosted by Kisii University. Theme: Reimagining Inclusive and Borderless Knowledge through '
                'Global Health for Sustainable Development. This conference brings together researchers, policymakers, '
                'academics, industry leaders, innovators, students, and development partners to share knowledge, '
                'foster collaboration, and explore innovative solutions to global challenges affecting health, '
                'education, governance, technology, business, and sustainable development. Conference Sub-Themes '
                '-Human Cultures, Health Knowledge Systems and Societal Transformation in a Borderless World -Enhanced '
                'Environmental Conservation and Food Security for a Healthy World -Holistic Education for Healthy and '
                'Sustainable Development -Integrating Scientific Data for Therapeutics, Decision Making, Forecasting '
                'and Predictive Analytics in Global Health -Strengthening Community-Centred Global Health Innovations '
                'for Sustainable Development -Law, Governance and Public Policy for a Healthy and Just Society '
                '-Transforming Business and Economic Models for Sustainable Health Systems -Leveraging Digital '
                'Innovation and Information Systems to Democratize Global Health Knowledge for Sustainable Development '
                'Afternoon Session',
  'published_at': '2026-06-10T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/live-day-2-of-the-3rd-international-multi-disciplinary-conference',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/qBsTekI0n3pvMTeB0njWT3E39PLDSd1SHXuUoLha.jpg',
  'display_order': 24,
  'is_featured': False},
 {'title': 'Day 1 of the 3rd International Multidisciplinary Conference',
  'category': 'NEWS',
  'summary': 'Day One of the 3rd International Multidisciplinary Conference unfolded seamlessly, creating space for '
             'meaningful conversations, new connections, and the exchange of ideas that transcend disciplines and '
             'borders. Beyond the presentations and discussions, today was a reminder of the power of gathering as a '
             'community of',
  'plain_text': 'Day One of the 3rd International Multidisciplinary Conference unfolded seamlessly, creating space for '
                'meaningful conversations, new connections, and the exchange of ideas that transcend disciplines and '
                'borders. Beyond the presentations and discussions, today was a reminder of the power of gathering as '
                'a community of scholars, practitioners, and innovators, each bringing unique perspectives yet united '
                'by a shared commitment to learning and advancing knowledge. As we reflect on the insights gained and '
                'the relationships forged, we recognize that this is only the beginning. Tomorrow presents another '
                'opportunity to deepen our engagement, challenge our thinking, and elevate the conversations that '
                'inspire progress. The momentum is building, the possibilities are expanding, and we are ready to take '
                'it to an even higher level.',
  'published_at': '2026-06-10T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/day-1-of-the-3rd-international-multidisciplinary-conference',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/5qZ0loEZ6edEseOftyNo5jBqynrMOYDQMnqEgUBm.jpg',
  'display_order': 25,
  'is_featured': False},
 {'title': 'LIVE 3rd International Multi-Disciplinary Conference',
  'category': 'NEWS',
  'summary': 'Welcome to the official live broadcast of the 3rd International Multi-Disciplinary Conference hosted by '
             'Kisii University. Theme: Reimagining Inclusive and Borderless Knowledge through Global Health for '
             'Sustainable Development. This conference brings together researchers, policymakers, academics, industry '
             'leaders,',
  'plain_text': 'Welcome to the official live broadcast of the 3rd International Multi-Disciplinary Conference hosted '
                'by Kisii University. Theme: Reimagining Inclusive and Borderless Knowledge through Global Health for '
                'Sustainable Development. This conference brings together researchers, policymakers, academics, '
                'industry leaders, innovators, students, and development partners to share knowledge, foster '
                'collaboration, and explore innovative solutions to global challenges affecting health, education, '
                'governance, technology, business, and sustainable development. Conference Sub-Themes -Human Cultures, '
                'Health Knowledge Systems and Societal Transformation in a Borderless World -Enhanced Environmental '
                'Conservation and Food Security for a Healthy World -Holistic Education for Healthy and Sustainable '
                'Development -Integrating Scientific Data for Therapeutics, Decision Making, Forecasting and '
                'Predictive Analytics in Global Health -Strengthening Community-Centred Global Health Innovations for '
                'Sustainable Development -Law, Governance and Public Policy for a Healthy and Just Society '
                '-Transforming Business and Economic Models for Sustainable Health Systems -Leveraging Digital '
                'Innovation and Information Systems to Democratize Global Health Knowledge for Sustainable Development '
                'Join the conversation as experts and thought leaders discuss groundbreaking research, emerging '
                'trends, and practical solutions that will shape a healthier, more inclusive, and sustainable future. '
                'Afternoon Session',
  'published_at': '2026-06-09T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/live-3rd-international-multi-disciplinary-conference',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/uy5ma2VynaARR88yMcR0Y5rtsk8Xt6mvyTkyJ7Zr.jpg',
  'display_order': 26,
  'is_featured': False},
 {'title': '3rd Multidisciplinary Conference 9th - 11th June',
  'category': 'NEWS',
  'summary': 'We are just five days away from the 3rd Multidisciplinary Conference! As the event draws near, we '
             'encourage all postgraduate students to prepare for an engaging and enriching academic experience. The '
             '3rd Multidisciplinary Conference offers a unique platform for scholarly exchange, collaboration, and '
             'interdisciplinary',
  'plain_text': 'We are just five days away from the 3rd Multidisciplinary Conference! As the event draws near, we '
                'encourage all postgraduate students to prepare for an engaging and enriching academic experience. The '
                '3rd Multidisciplinary Conference offers a unique platform for scholarly exchange, collaboration, and '
                'interdisciplinary learning. We invite all postgraduate students to participate in this exceptional '
                'colloquium and take advantage of the valuable opportunities it presents. We are also pleased to '
                'announce that Prof. Jan Siska of Charles University will be among the distinguished attendees at this '
                "year's conference.",
  'published_at': '2026-06-05T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/3rd-multidisciplinary-conference-9th-11th-june',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/wMwz0n8I7hGJIJs2v0bEf5IkiKkyD8hEi110D7Kg.jpg',
  'display_order': 27,
  'is_featured': False},
 {'title': 'KISII UNIVERSITY ALERT',
  'category': 'NEWS',
  'summary': 'Suppliers are warned to stay vigilant and avoid fraudsters. A con person using the number +254733834987 '
             'is pretending to be a Kisii University employee and soliciting bribes. Do NOT send money or share '
             'sensitive details. All official procurement communication is strictly in writing',
  'plain_text': 'Suppliers are warned to stay vigilant and avoid fraudsters. A con person using the number '
                '+254733834987 is pretending to be a Kisii University employee and soliciting bribes. Do NOT send '
                'money or share sensitive details. All official procurement communication is strictly in writing',
  'published_at': '2026-05-20T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-alert',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/geTHXfW19Vgu6MybcS1Ur9QAQk7KE78gCd1wazyz.png',
  'display_order': 28,
  'is_featured': False},
 {'title': '2026 KUCCPS REVISION Deadline',
  'category': 'NEWS',
  'summary': 'Remember the deadline for Revision is Friday 22nd May 2026. Don,t miss a chance to join us this August. '
             'We got you.',
  'plain_text': 'Remember the deadline for Revision is Friday 22nd May 2026. Don,t miss a chance to join us this '
                'August. We got you.',
  'published_at': '2026-05-20T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/2026-kuccps-revision-deadline',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/foonJPAxoqyahhrynU9XR8nGCMYMB9vadTozSP8S.jpg',
  'display_order': 29,
  'is_featured': False},
 {'title': 'Kisii University Infrastructure For your Academic Growth and Social Success',
  'category': 'NEWS',
  'summary': 'Our infrastructure has been intentionally designed to support both your academic growth and your social '
             'success throughout your journey. Every space, resource, and opportunity has been carefully created to '
             'help you thrive, excel, and become the very best version of yourself. Greatness does not happen by '
             'chance, it is',
  'plain_text': 'Our infrastructure has been intentionally designed to support both your academic growth and your '
                'social success throughout your journey. Every space, resource, and opportunity has been carefully '
                'created to help you thrive, excel, and become the very best version of yourself. Greatness does not '
                'happen by chance, it is built through preparation, purpose, and perseverance. Your future is calling '
                'with endless possibilities, and now is the time to rise with confidence, embrace the challenge, and '
                'answer that call with determination.',
  'published_at': '2026-05-18T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-infrastructure-for-your-academic-growth-and-social-success',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/7FWohJpR1YyR1Fwbxkq0rckK3pCyA7nKDTCT9Bfw.jpg',
  'display_order': 30,
  'is_featured': False},
 {'title': 'Review and Development of Masters and PhD curricula',
  'category': 'NEWS',
  'summary': 'At Kisii University, visionary leadership continues to shape a future anchored on innovation, relevance, '
             'and transformative scholarship. Under the stewardship of the Vice Chancellor, the University is '
             'championing bold initiatives that not only enrich its mandate but position Kisii University at the '
             'forefront of',
  'plain_text': 'At Kisii University, visionary leadership continues to shape a future anchored on innovation, '
                'relevance, and transformative scholarship. Under the stewardship of the Vice Chancellor, the '
                'University is championing bold initiatives that not only enrich its mandate but position Kisii '
                'University at the forefront of academic excellence and research-driven impact. A key milestone is the '
                'ongoing review and development of Masters and PhD curricula aligned to the HERI Africa Priority '
                'Areas, a strategic response to critical research gaps in foundational literacy across the continent. '
                'This timely initiative reflects the University,s unwavering commitment to producing knowledge that '
                'addresses real societal needs and advances Africa,s development agenda. The review process is '
                'receiving technical guidance from distinguished scholars and subject matter experts: Prof. Peter '
                'Barasa, VC, Alupe University, and Prof. Caroline Omulando, DVC (AA), the Open University of Kenya. '
                'Their expertise continues to enrich this transformative academic undertaking. Kisii University '
                'remains steadfast in embracing creative and forward-looking initiatives that propel the institution '
                'to greater heights of inclusivity, innovation, and borderless education',
  'published_at': '2026-05-14T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/review-and-development-of-masters-and-phd-curricula',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/fmbm9r7TusMTIMOc8ebWpnEZt0T1czpvtPvoM8S5.jpg',
  'display_order': 31,
  'is_featured': False},
 {'title': 'DVC ARSA hosts African Technology Policy Studies Network (ATPS)',
  'category': 'NEWS',
  'summary': 'The DVC ARSA, hosted guests from the African Technology Policy Studies Network (ATPS) during a '
             'high-level review and evaluation visit for the transformative project on the Application of Multilingual '
             'AI Technology for Improving Food Safety, Supply Chain Monitoring and Reduction of Post-Harvest Losses in '
             'Kenya. Led by',
  'plain_text': 'The DVC ARSA, hosted guests from the African Technology Policy Studies Network (ATPS) during a '
                'high-level review and evaluation visit for the transformative project on the Application of '
                'Multilingual AI Technology for Improving Food Safety, Supply Chain Monitoring and Reduction of '
                'Post-Harvest Losses in Kenya. Led by Dr. Cynthia Mwau (PI) and Dr. Vincent Bulinda (Co-PI) from the '
                'School of Pure and Applied Sciences, the project is harnessing inclusive and responsible AI to '
                'empower smallholder farmers with tools to assess produce quality, access market information, and '
                'connect to transport services in their own languages. The initiative reflects the University,s '
                'commitment to research that creates lasting impact and ensures that women farmers, the elderly, and '
                'persons with disabilities are not left behind in Kenya,s agricultural transformation',
  'published_at': '2026-05-14T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/dvc-arsa-hosts-african-technology-policy-studies-network-atps',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/N14Erl2BXfkUkuHPLiAYxN4iqoqItbx13yVR2sry.jpg',
  'display_order': 32,
  'is_featured': False},
 {'title': 'TENDER NOTICE MAY 2026',
  'category': 'TENDERS',
  'summary': 'FOR MORE INFORMATION VISIT OUR PROCUREMENT PORTAL '
             'https://digital.kisiiuniversity.ac.ke/procurement_portal/tenders',
  'plain_text': 'FOR MORE INFORMATION VISIT OUR PROCUREMENT PORTAL '
                'https://digital.kisiiuniversity.ac.ke/procurement_portal/tenders',
  'published_at': '2026-05-08T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/tender-notice-may-2026',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/BtypKNHLpZy7Geun4hQnozBbQuGZh9kavib5dxKf.png',
  'display_order': 33,
  'is_featured': False},
 {'title': 'KUCCPS Deadline',
  'category': 'ADMISSIONS',
  'summary': 'Remember the KUCCPS deadline is today. Choose one of our KSU programmes and we will schedule you for '
             'your Academic Journey in August.',
  'plain_text': 'Remember the KUCCPS deadline is today. Choose one of our KSU programmes and we will schedule you for '
                'your Academic Journey in August.',
  'published_at': '2026-05-06T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kuccps-deadline',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/2bo4AVMNMqaBLrr8ReyAVV1oqhKi6fTHdLkBSgM9.jpg',
  'display_order': 34,
  'is_featured': False},
 {'title': 'NOTIFICATION OF PREQUALIFICATION OF SUPPLIERS 2026-2028',
  'category': 'NEWS',
  'summary': 'Evaluation Report For The Prequalification Of Suppliers In Various Categories For Goods, Works And '
             'Services For The Period 2026-2028 Evaluation Report Document Link',
  'plain_text': 'Evaluation Report For The Prequalification Of Suppliers In Various Categories For Goods, Works And '
                'Services For The Period 2026-2028 Evaluation Report Document Link',
  'published_at': '2026-05-03T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/notification-of-prequalification-of-suppliers-2026-2028',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/m5lvwpGdmv8S8paLgqKKzIPKTepW7uhCsx0sZ97d.jpg',
  'display_order': 35,
  'is_featured': False},
 {'title': 'ADVERTISEMENT OF ADJUNCT LECTURER POSITIONS IN THE SCHOOL OF HEALTH SCIENCES',
  'category': 'NEWS & CAREERS',
  'summary': 'ADVERTISEMENT OF ADJUNCT LECTURER POSITIONS IN THE SCHOOL OF HEALTH SCIENCES Kisii University wishes to '
             'declare vacancies in the School of Health Sciences for the following Adjunct Faculty positions Lecturer '
             'Human Anatomy (1 position) Lecturer Obstetrics/Gynecology (1 position) Lecturer General Surgery (1 '
             'position)',
  'plain_text': 'ADVERTISEMENT OF ADJUNCT LECTURER POSITIONS IN THE SCHOOL OF HEALTH SCIENCES Kisii University wishes '
                'to declare vacancies in the School of Health Sciences for the following Adjunct Faculty positions '
                'Lecturer Human Anatomy (1 position) Lecturer Obstetrics/Gynecology (1 position) Lecturer General '
                'Surgery (1 position) Lecturer Human Pathology (1 position) Lecturer Psychiatry (1 position) Lecturer '
                'Clinical Medicine (1 position) Remuneration will be monthly but on a contract basis Key '
                'responsibilities: - 1. Teach and asses courses in medical physiology to both undergraduate and '
                'postgraduate students; 2. Supervise postgraduate students; 3. Initiate, promote and participate in '
                'research projects; 4. Attend and participate in seminars, workshops and conference in relevant '
                'fields; 5. Participate in planning, development, implementation and evaluation of curricula in the '
                'department; 6. Participate in departmental and School Board meetings and other activities; 7. Conduct '
                'community service and initiate linkages; 8. Any other official duties that may be assigned by the '
                'immediate supervisor. Personal attributes: - Proficient in computer skills; Self-motivated and highly '
                'disciplined; Possess excellent command of the subject area, including adept lesson planning; Capable '
                'of managing ambiguity and emotions; Adaptability to technological changes; Excellent communication, '
                'listening, and mediation skills; Strong in fundraising and grants writing abilities; Demonstrates '
                'outstanding presentation and research writing skills. Minimum education qualifications and '
                'Professional Experience: - A relevant Bachelor,s degree or its equivalent from a recognized '
                'University; A Master,s degree or its equivalent in the relevant field from a recognized '
                'University/College is mandatory; A PhD. in a relevant discipline will be an added advantage; Previous '
                'teaching experience is preferred; Must be registered by relevant professional body; Must satisfy '
                'requirements of chapter 6 of the Kenyan Constitution. How to Apply: If you possess the required '
                'qualifications and experience and aspire to work as a team member in world class University where you '
                'can make a difference, please follow these steps: Submit a cover letter and a current CV. Attach '
                'certified copies of educational certificates and transcripts. Provide names and addresses of three '
                'referees. Include details of your current salary and benefits. Share your telephone and e-mail '
                'contacts. Submit all application documents by 5.00 pm, Friday, 12 t',
  'published_at': '2026-04-24T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/advertisement-of-adjunct-lecturer-positions-in-the-school-of-health-sciences',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/Vf3rSSusiM2xOLqE6AVUZ7QUKwc97TtiAHPF2s5N.jpg',
  'display_order': 36,
  'is_featured': False},
 {'title': 'H.E. the President officially laid the foundation stone for Nyamira University College',
  'category': 'NEWS',
  'summary': 'Today marks a remarkable milestone in our journey of progress! H.E. the President officially laid the '
             'foundation stone for Nyamira University College, a bold step toward expanding access to higher education '
             'and empowering future generations. Under the stewardship of Kisii University, this transformative '
             'project is on',
  'plain_text': 'Today marks a remarkable milestone in our journey of progress! H.E. the President officially laid the '
                'foundation stone for Nyamira University College, a bold step toward expanding access to higher '
                'education and empowering future generations. Under the stewardship of Kisii University, this '
                'transformative project is on a fast-track development plan, with an ambitious goal of welcoming its '
                'first cohort of 700 students this September. This is more than just the construction of an '
                'institution; it is the building of opportunity, innovation, and hope. We are excited to collaborate '
                'closely with the National Government to ensure the success of this vision and to create a lasting '
                'legacy for the people of Nyamira and beyond. The future starts now!',
  'published_at': '2026-04-13T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/he-the-president-officially-laid-the-foundation-stone-for-nyamira-university-college',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/lFm7NWhlo6DOsJ65krhiNUSJgVD9T4OXjz4RubpD.jpg',
  'display_order': 37,
  'is_featured': False},
 {'title': 'Day 4 of Kisii University Innovation Week',
  'category': 'NEWS',
  'summary': 'The curtains have closed on the inaugural Kisii University Innovation Week, a remarkable celebration of '
             'creativity, curiosity, and possibility. Over the past days, minds have been ignited through shared '
             'learning, journeys of self-discovery, and meaningful connections that will last far beyond this moment. '
             'Kisii',
  'plain_text': 'The curtains have closed on the inaugural Kisii University Innovation Week, a remarkable celebration '
                'of creativity, curiosity, and possibility. Over the past days, minds have been ignited through shared '
                'learning, journeys of self-discovery, and meaningful connections that will last far beyond this '
                'moment. Kisii University has not only hosted an event but has set a powerful benchmark for '
                'innovation, one that challenges both students and staff to dream bigger, think deeper, and reach far '
                'beyond the stars. This is just the beginning of a bold journey where imagination knows no limits and '
                'the future is ours to shape.',
  'published_at': '2026-04-11T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/day-4-of-kisii-university-innovation-week',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/Ltfd9S8AWmh3ZkGIBLIecukN6QeBDgaEP7mqYBhS.jpg',
  'display_order': 38,
  'is_featured': False},
 {'title': 'Day 3 of Kisii University Innovation Week',
  'category': 'NEWS',
  'summary': 'Day three of Innovation Week comes to a close, leaving us inspired, enriched, and more connected than '
             'ever. It has been a powerful journey of ideas, collaboration, and meaningful engagement. Beyond the main '
             'sessions, our Vice Chancellor remained steadfast in advancing our vision, holding strategic roundtable',
  'plain_text': 'Day three of Innovation Week comes to a close, leaving us inspired, enriched, and more connected than '
                'ever. It has been a powerful journey of ideas, collaboration, and meaningful engagement. Beyond the '
                'main sessions, our Vice Chancellor remained steadfast in advancing our vision, holding strategic '
                'roundtable discussions that ensured our borderless agenda is not just voiced, but truly heard and '
                'embraced. Kisii University continues to rise, driven by purpose, partnership, and the relentless '
                'pursuit of excellence. The future is bright, and we are shaping it together.',
  'published_at': '2026-04-11T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/day-3-of-kisii-university-innovation-week',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/wUsCjmnuiKvU0JbfS595xIuxMYYjgwqDJt5YBorF.jpg',
  'display_order': 39,
  'is_featured': False},
 {'title': 'KUCCPS Portal is now open for Undergraduate Programmes',
  'category': 'NEWS',
  'summary': 'Did you know that the KUCCPS Portal is now open for Undergraduate Programmes. Start the process and '
             'let,s help you make Kisii University your next academic home.',
  'plain_text': 'Did you know that the KUCCPS Portal is now open for Undergraduate Programmes. Start the process and '
                'let,s help you make Kisii University your next academic home.',
  'published_at': '2026-04-08T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kuccps-portal-is-now-open-for-undergraduate-programmes',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/svEwOjYPYKfwbPl37N6ELQKVoZFhR4t7Wp0noFDf.jpg',
  'display_order': 40,
  'is_featured': False},
 {'title': 'Day 2 of Kisii University Innovation Week',
  'category': 'NEWS',
  'summary': 'Day two of Innovation Week was nothing short of transformative. Dr. Tonny Omwansa, CEO of the Kenya '
             'Innovation Agency (KENIA), inspired our innovators by bridging the gap between ideas and real-world '
             'impact, highlighting the power of smart investment, meaningful connections, and strategic networking. At '
             'Kisii',
  'plain_text': 'Day two of Innovation Week was nothing short of transformative. Dr. Tonny Omwansa, CEO of the Kenya '
                'Innovation Agency (KENIA), inspired our innovators by bridging the gap between ideas and real-world '
                'impact, highlighting the power of smart investment, meaningful connections, and strategic networking. '
                'At Kisii University, this week marks more than just conversation, it,s a bold commitment to action. '
                'We are moving beyond words and stepping into a future driven by purpose, collaboration, and '
                'borderless innovation. The journey has begun, and the possibilities are limitless.',
  'published_at': '2026-04-08T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/day-2-of-kisii-university-innovation-week',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/bV2g4m9YzWbwBMmGtxwcInAbyn4qcxsYeLVaI9sV.jpg',
  'display_order': 41,
  'is_featured': False},
 {'title': 'Day 2 of Innovation Week LIVE',
  'category': 'NEWS',
  'summary': 'Day 2 of Innovation Week LIVE is published on the official Kisii University website.',
  'plain_text': 'Day 2 of Innovation Week LIVE is published on the official Kisii University website.',
  'published_at': '2026-04-08T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/day-2-of-innovation-week-live',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/plZVFAzDUzDBLj5PgjtJ1kE4pGwzVX6f9BIqL96u.jpg',
  'display_order': 42,
  'is_featured': False},
 {'title': 'KISII UNIVERSITY INAUGURAL INNOVATION WEEK 2026 [LIVE]',
  'category': 'NEWS',
  'summary': 'Join us in celebrating the Kisii University Innovation Week 2026 under the powerful theme: Co-Creating '
             'Sustainable Futures through Interdisciplinary Research, Green Innovation, and Community Impact. This '
             'week marks a milestone as we bring together bright minds, creators, and changemakers dedicated to '
             'solving community',
  'plain_text': 'Join us in celebrating the Kisii University Innovation Week 2026 under the powerful theme: '
                'Co-Creating Sustainable Futures through Interdisciplinary Research, Green Innovation, and Community '
                'Impact. This week marks a milestone as we bring together bright minds, creators, and changemakers '
                'dedicated to solving community challenges and shaping the future through innovation.',
  'published_at': '2026-04-07T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-inaugural-innovation-week-2026-live',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/63wuYbVLPzzOmdEM7fDrmzHm47pwuvhjFqJHzivm.jpg',
  'display_order': 44,
  'is_featured': False},
 {'title': 'INNOVATION WEEK 2026 Partners',
  'category': 'NEWS',
  'summary': 'The Innovation week drums have started beating. Today we raise a glass to our confirmed partners in this '
             'transformative journey. Over 10 Institutions have already confirmed participation. Clocking in from '
             'Tuesday 7th April, join us at the Innovation Week and regale yourself with our innovative products and '
             'services.',
  'plain_text': 'The Innovation week drums have started beating. Today we raise a glass to our confirmed partners in '
                'this transformative journey. Over 10 Institutions have already confirmed participation. Clocking in '
                'from Tuesday 7th April, join us at the Innovation Week and regale yourself with our innovative '
                'products and services.',
  'published_at': '2026-04-06T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/innovation-week-2026-partners',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/VLZjPcBAHbtBVeaHjSUOvZHdwtVrYNpV8FwDv8DF.jpg',
  'display_order': 45,
  'is_featured': False},
 {'title': 'East African Community Medical and Dental Council official inspection of School of Health Sciences',
  'category': 'ACADEMICS',
  'summary': 'Kisii University,s School of Health Sciences proudly hosted the East African Community Medical and '
             'Dental Council during the official inspection of our health academic programs. This important engagement '
             'reflects our unwavering commitment to excellence, professionalism, and strict adherence to regulatory '
             'and statutory',
  'plain_text': 'Kisii University,s School of Health Sciences proudly hosted the East African Community Medical and '
                'Dental Council during the official inspection of our health academic programs. This important '
                'engagement reflects our unwavering commitment to excellence, professionalism, and strict adherence to '
                'regulatory and statutory standards. At Kisii University under the visionary leadership of our Vice '
                'Chancellor, we continuously strive to deliver high-quality, industry-aligned programs that shape '
                'competent and ethical healthcare professionals. We are Kisii University, where integrity, discipline, '
                'and excellence define our journey',
  'published_at': '2026-04-04T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/east-african-community-medical-and-dental-council-official-inspection-of-school-of-health-sciences',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/QZ1zpFcpgIodV6iDi3BWr7073EqyUmmcftLFBc1i.jpg',
  'display_order': 46,
  'is_featured': False},
 {'title': 'KSU VC presides over the AICAD Technical Committee meeting in Arusha, Tanzania',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor proudly presided over the AICAD Technical Committee meeting in Arusha, Tanzania, '
             'reaffirming a strong commitment to regional collaboration and capacity development. As an active and '
             'dynamic member of the AICAD community, Kisii University continues to play a vital role and under the '
             'leadership of',
  'plain_text': 'The Vice Chancellor proudly presided over the AICAD Technical Committee meeting in Arusha, Tanzania, '
                'reaffirming a strong commitment to regional collaboration and capacity development. As an active and '
                'dynamic member of the AICAD community, Kisii University continues to play a vital role and under the '
                'leadership of AICAD CEO Prof. James Njiru, drive innovation, partnership, and sustainable growth '
                'across East Africa.',
  'published_at': '2026-03-25T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ksu-vc-presides-over-the-aicad-technical-committee-meeting-in-arusha-tanzania',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/mHV7ELfN8LoQemChVC0DG2JDYQFY4XFnzBCLXPbK.jpg',
  'display_order': 48,
  'is_featured': False},
 {'title': 'EXTERNAL ADVERTISEMENT - TEACHING POSITIONS',
  'category': 'NEWS & CAREERS',
  'summary': 'FEBUARY TEACHING VACANCIES Document Download LINK CAREERS PORTAL Normal 0 false false false EN-US X-NONE '
             'X-NONE /* Style Definitions */ table.MsoNormalTable {mso-style-name:"Table Normal"; '
             'mso-tstyle-rowband-size:0; mso-tstyle-colband-size:0; mso-style-noshow:yes; mso-style-priority:99; '
             'mso-style-parent:"";',
  'plain_text': 'FEBUARY TEACHING VACANCIES Document Download LINK CAREERS PORTAL Normal 0 false false false EN-US '
                'X-NONE X-NONE /* Style Definitions */ table.MsoNormalTable {mso-style-name:"Table Normal"; '
                'mso-tstyle-rowband-size:0; mso-tstyle-colband-size:0; mso-style-noshow:yes; mso-style-priority:99; '
                'mso-style-parent:""; mso-padding-alt:0in 5.4pt 0in 5.4pt; mso-para-margin-top:0in; '
                'mso-para-margin-right:0in; mso-para-margin-bottom:8.0pt; mso-para-margin-left:0in; line-height:107%; '
                'mso-pagination:widow-orphan; font-size:11.0pt; font-family:"Calibri",sans-serif; '
                'mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-hansi-font-family:Calibri; '
                'mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; '
                'mso-bidi-theme-font:minor-bidi;} REQUIREMENTS FOR APPOINTMENT ASSOCIATE PROFESSOR ANATOMY, PATHOLOGY '
                'GRADE FOURTEEN (14) Requirements for Appointment To be eligible for appointment to the position of '
                'Associate Professor, the candidate must have: a. a Doctor of Philosophy degree (Ph.D/ D.Phil.) from a '
                'recognized/accredited Institution; OR MMed or MDS, and Specialist training; b. a cumulative of three '
                '(3) years of teaching or research experience at university level since becoming a Senior Lecturer; '
                '(i) have research output points comprising at least thirty-six (36) points from refereed scholarly '
                "journals and/ or university level book, six (6) points from postgraduate students' supervision and "
                'two (2) points from publications in conference proceedings since appointment to the position of '
                'Senior Lecturer; (ii) evidence of continued evaluated effective teaching and successful supervision '
                'of graduate students; (iii) Attended and contributed at learned conferences, seminars or workshops; '
                '(iv) Evidence of recognition and registration by a relevant regulatory body where applicable; (v) '
                'Evidence of membership or affiliation to a relevant professional body where applicable; (vi) Evidence '
                'of contribution to community, national and international service; (xi) Evidence of contribution to '
                'University service through participation in Departmental matters, student,s academic advising, and '
                'School and University meetings and committee membership, among others; and (vii) Evidence of having '
                'developed proposals that have attracted funding. Duties and Responsibilities An individual appointed '
                "as an Associate Professor shall: (i) teach and assess courses in one's discipline/ area of "
                'specialization at both undergraduate and postgraduate levels; (ii) supervise undergraduate ',
  'published_at': '2026-03-21T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/external-advertisement-teaching-positions',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/LbshjfSgdm7LoN0kGZeAgqoC6zyyw7QbGGj7nbBy.jpg',
  'display_order': 49,
  'is_featured': False},
 {'title': 'CS, Education, Hon. Julius Ogamba meets education stakeholders',
  'category': 'NEWS',
  'summary': 'The Cabinet Secretary, Education, Hon. Julius Ogamba today convened a high-powered meeting of education '
             'stakeholders at Kisii University, setting the stage for transformative dialogue and forward-looking '
             'collaboration. In his address, the Cabinet Secretary underscored the promise of visionary initiatives '
             'taking shape,',
  'plain_text': 'The Cabinet Secretary, Education, Hon. Julius Ogamba today convened a high-powered meeting of '
                'education stakeholders at Kisii University, setting the stage for transformative dialogue and '
                'forward-looking collaboration. In his address, the Cabinet Secretary underscored the promise of '
                'visionary initiatives taking shape, among them the establishment of the Nyamira University College, '
                'the development of a vibrant Student Village, and a growing calendar of high-impact conferences '
                'positioning Kisii as a center of intellectual exchange. These milestones are a testament to Kisii '
                'University,s rising stature as a magnetic hub for academia, innovation, and research. With every '
                'partnership forged and every project realized, the University continues to illuminate a path of '
                'growth, drawing scholars, ideas, and opportunities into a dynamic ecosystem of excellence.',
  'published_at': '2026-03-21T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/cs-education-hon-julius-ogamba-meets-education-stakeholders',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/6l03YY7I9MeKyaOCIcqE54ybn7TahFo6SlOoOToD.jpg',
  'display_order': 50,
  'is_featured': False},
 {'title': 'RE-ADVERTISEMENT HERI-Africa Project Research Chair',
  'category': 'NEWS',
  'summary': 'HERI-Africa Project Research Chair in Languages Education at Kisii University, Kenya. About HERI-Africa '
             'Project The Harnessing Education Research for Impact in Africa (HERI-Africa) is a Pan-African initiative '
             'bringing together collaborators from government, universities, and civil society research organizations.',
  'plain_text': 'HERI-Africa Project Research Chair in Languages Education at Kisii University, Kenya. About '
                'HERI-Africa Project The Harnessing Education Research for Impact in Africa (HERI-Africa) is a '
                'Pan-African initiative bringing together collaborators from government, universities, and civil '
                'society research organizations. HERI-Africa aims to increase the productivity and impact of education '
                'research on the continent from the current 3% to 30% by 2050 and ensure that research meaningfully '
                'improves learning outcomes, student transitions, and lifelong opportunities. Role Overview Kisii '
                'University (KSU), in partnership with HERI-Africa, is establishing a Research Chair in Languages '
                'Education to lead high-impact research, capacity development, and innovation in Language Education in '
                'Kenya and across Africa. The Chair will be based at Kisii University (KSU), with collaboration across '
                'the HERI-Africa network which will require occasional travel. Key Result Areas The Research Chair '
                'will: Provide intellectual and scholarly leadership in foundational languages research. Lead '
                'multi-country and multi-institutional research programs aligned with HERI-Africa,s mission. '
                'Strengthen research capacity through mentorship, postgraduate training, and institutional '
                'collaboration. Build strong networks across universities and other stakeholders. Ensure research '
                'findings are translated into policy and practice to enhance learning outcomes. Participate in '
                'resource mobilization efforts to support research in Languages education Key Responsibilities I. '
                'Research Leadership and Strategy Development Develop and lead a multi-year research agenda focused on '
                'foundational Language education. Establish systems to ensure research quality, ethical compliance, '
                'and effective dissemination. II. Graduate Training and Supervision Strengthen postgraduate training '
                'programs at Kisii University. Develop a pipeline of early-career scholars through training, '
                'workshops, and mentorship. III. Collaboration, Partnerships & Knowledge Mobilization Strengthen '
                'partnerships with universities, government agencies, and research organizations across Africa. '
                'Translate research findings into policy briefs, teaching tools, and evidence-based guidance. IV. '
                'Resource Mobilization & Grants Management Lead and contribute to fundraising efforts for languages '
                'education research. Required Qualifications and Experience Professor or Associate Professor, or '
                'equivalent senior academic rank, in Language Education or a related discipline. St',
  'published_at': '2026-03-16T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/re-advertisement-heri-africa-project-research-chair',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/Ytdxe63KVt9p5j3LKwOyQ5IDN0N5diXa5zuARTcO.jpg',
  'display_order': 51,
  'is_featured': False},
 {'title': 'Strategic Data-tracking Mission By National Commission for Science, Technology and Innovation (NACOSTI)',
  'category': 'NEWS',
  'summary': 'Kisii University today welcomed a delegation from National Commission for Science, Technology and '
             'Innovation (NACOSTI), hosted by the Vice Chancellor, on a strategic data-tracking mission aimed at '
             'informing national policy. The visit focused on the analysis of genomics and data security, critical '
             'areas that will help',
  'plain_text': 'Kisii University today welcomed a delegation from National Commission for Science, Technology and '
                'Innovation (NACOSTI), hosted by the Vice Chancellor, on a strategic data-tracking mission aimed at '
                'informing national policy. The visit focused on the analysis of genomics and data security, critical '
                'areas that will help guide the Government of Kenya in developing standards and frameworks with '
                'far-reaching national impact. As one of the institutions selected to contribute to this important '
                'initiative, Kisii University is proud to play a role in shaping evidence-based policy and advancing '
                'responsible scientific innovation. The engagement underscores the university,s growing contribution '
                'to research, knowledge generation, and national development.',
  'published_at': '2026-03-15T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/strategic-data-tracking-mission-by-national-commission-for-science-technology-and-innovation-nacosti',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/oknLChnkq1AUcxOBvSak8nJ1lk8A4JaAijAaRyFh.jpg',
  'display_order': 52,
  'is_featured': False},
 {'title': 'Kisii University 15th Graduation Booklet March 2026',
  'category': 'NEWS',
  'summary': 'Kisii University 15th Graduation Booklet March 2026 '
             'https://digital.kisiiuniversity.ac.ke/15thgraduationbooklet',
  'plain_text': 'Kisii University 15th Graduation Booklet March 2026 '
                'https://digital.kisiiuniversity.ac.ke/15thgraduationbooklet',
  'published_at': '2026-03-13T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-15th-graduation-booklet-march-2026',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/NZ7bgv2JwWBqiqMqsgFXqPY2K7ma1vSkTz2gBBUt.jpg',
  'display_order': 53,
  'is_featured': False},
 {'title': '15th Graduation Ceremony 2026',
  'category': 'NEWS',
  'summary': 'They say the best things come in small doses, and the 15th Graduation Ceremony was a beautiful '
             'affirmation of that truth. With grace, joy, and unmistakable finesse, the University community gathered '
             'for a moment both rare and historic: a celebration of achievement, resilience, and new beginnings. In an '
             'atmosphere',
  'plain_text': 'They say the best things come in small doses, and the 15th Graduation Ceremony was a beautiful '
                'affirmation of that truth. With grace, joy, and unmistakable finesse, the University community '
                'gathered for a moment both rare and historic: a celebration of achievement, resilience, and new '
                'beginnings. In an atmosphere filled with pride and optimism, Kisii University warmly congratulated '
                'and conferred honors upon its newest cohort of graduates brilliant minds ready to step into the world '
                'and shape its future. Each graduate carries with them not only knowledge, but also the enduring '
                'spirit of a university that champions inclusivity, innovation, and a truly borderless vision of '
                'education. As we mark this milestone, we reaffirm our place as a global beacon of excellence, '
                'nurturing talent, inspiring purpose, and building bridges across communities and continents. '
                'Congratulations to all members of the 15th Congregation may your paths be bold, bright, and boundless '
                'LIVE CEREMONY Mobile LINK https://www.youtube.com/watch?v=_krrQWU98b4',
  'published_at': '2026-03-12T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/15th-graduation-ceremony-2026',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/a5w1emerTvjapXL0TLJwpk2h09mP8RtL4sGbmuue.jpg',
  'display_order': 54,
  'is_featured': False},
 {'title': 'KISII UNIVERSITY 15TH GRADUATION CEREMONY LIVE',
  'category': 'NEWS',
  'summary': 'Join us in celebrating the 15th Graduation of Kisii University under the powerful theme: Producing '
             'Global Minds for Healthy Communities | Today 12th March 2026 marks a milestone as we send forth a new '
             'generation of global minds dedicated to building healthy communities and transforming the world. Mobile '
             'App Link',
  'plain_text': 'Join us in celebrating the 15th Graduation of Kisii University under the powerful theme: Producing '
                'Global Minds for Healthy Communities | Today 12th March 2026 marks a milestone as we send forth a new '
                'generation of global minds dedicated to building healthy communities and transforming the world. '
                'Mobile App Link https://www.openinyoutube.com/watch?v=_krrQWU98b4',
  'published_at': '2026-03-12T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-15th-graduation-ceremony-live',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/hhnccLYYdyDI4I4oDbAvnP4ZoJB1LYfBayaWpMum.jpg',
  'display_order': 55,
  'is_featured': False},
 {'title': 'Nyaribari Chache CDF Delegation Delivers Support to Constituency Students',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor received officials from the Nyaribari Chache Constituency Development Fund who paid '
             'a courtesy visit on behalf of the area Member of Parliament, Hon. Zaheer Jhanda. During the visit, the '
             'delegation presented a cheque worth KSh 4.2 million to support students from the constituency who '
             'require',
  'plain_text': 'The Vice Chancellor received officials from the Nyaribari Chache Constituency Development Fund who '
                'paid a courtesy visit on behalf of the area Member of Parliament, Hon. Zaheer Jhanda. During the '
                'visit, the delegation presented a cheque worth KSh 4.2 million to support students from the '
                'constituency who require financial assistance in pursuing their academic dreams at Kisii University. '
                'This generous contribution stands as a powerful reminder of the transformative impact that '
                'collaboration between institutions and leaders can have on the lives of young people. Through such '
                'partnerships, doors of opportunity continue to open for bright but financially challenged students, '
                'enabling them to pursue education with dignity and hope. Kisii University deeply values its strong '
                'and enduring cooperation with national and county institutions, and remains committed to working hand '
                'in hand with partners who share the vision of empowering communities through education. Together, we '
                'continue to nurture potential, uplift futures, and build a stronger, more inclusive society.',
  'published_at': '2026-03-11T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/nyaribari-chache-cdf-delegation-delivers-support-to-constituency-students',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/xdelTxd7ql4TFpAtabDcyAwghU1GqOPVINxTBvDy.jpg',
  'display_order': 56,
  'is_featured': False},
 {'title': '15th Graduation Ceremony',
  'category': 'NEWS',
  'summary': 'The 15th Graduation Ceremony is right here with us, coming this Thursday 10th/03/2026',
  'plain_text': 'The 15th Graduation Ceremony is right here with us, coming this Thursday 10th/03/2026',
  'published_at': '2026-03-10T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/15th-graduation-ceremony',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/O0bOUonmbXRZGGVqYrLG2DEAGkFT8WRQafz8CCrL.jpg',
  'display_order': 57,
  'is_featured': False},
 {'title': 'C.S Education, Hon. Julius Ogamba & KSU Vice Chancellor at Nyambaria High School',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor today joined the Cabinet Secretary, Education, Hon. Julius Ogamba at Nyambaria High '
             'School to celebrate knowledge, progress, and a thoughtful reflection on the future of education. The '
             'occasion stood as a powerful reminder that learning is not only about achievement today, but about '
             'shaping the',
  'plain_text': 'The Vice Chancellor today joined the Cabinet Secretary, Education, Hon. Julius Ogamba at Nyambaria '
                'High School to celebrate knowledge, progress, and a thoughtful reflection on the future of education. '
                'The occasion stood as a powerful reminder that learning is not only about achievement today, but '
                'about shaping the leaders, innovators, and problem-solvers of tomorrow. As a committed partner in '
                'academia, government, and research, Kisii University continues to extend its reach and impact. With '
                'purpose and vision, the University remains ready to spread its wings, building partnerships, '
                'nurturing talent, and contributing meaningfully to the advancement of education and national '
                'development.',
  'published_at': '2026-03-10T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/cs-education-hon-julius-ogamba-ksu-vice-chancellor-at-nyambaria-high-school',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/v4Vyu7gMotNrKghM7gs9AT2sEqly22tw3slEbBma.jpg',
  'display_order': 58,
  'is_featured': False},
 {'title': 'MULTIPLE TENDERS FEB- MARCH 2026',
  'category': 'TENDERS',
  'summary': 'TENDER DOCUMENT FOR SUPPLY AND DELIVERY OF DRUGS AND DRESSING- Link TENDER DOCUMENT FOR SUPPLY AND '
             'DELIVERY OF COMPUTERS -SERVER-PRINTERS-AUDIO EQUIPMENT -LAPTOP AND RELATED ICT EQUIPMENT TENDER FOR DRY '
             'CLEANING SERVICES TENDER DOCUMENT FOR SUPPLY AND DELIVERY OF OF YMCTK RIBBON AND PLASTIC MAGNETIC '
             'CARDS-FRAMERWORK',
  'plain_text': 'TENDER DOCUMENT FOR SUPPLY AND DELIVERY OF DRUGS AND DRESSING- Link TENDER DOCUMENT FOR SUPPLY AND '
                'DELIVERY OF COMPUTERS -SERVER-PRINTERS-AUDIO EQUIPMENT -LAPTOP AND RELATED ICT EQUIPMENT TENDER FOR '
                'DRY CLEANING SERVICES TENDER DOCUMENT FOR SUPPLY AND DELIVERY OF OF YMCTK RIBBON AND PLASTIC MAGNETIC '
                'CARDS-FRAMERWORK AGREEMENT TENDER DOCUMENT FOR SUPPLY AND DELIVERY OF CERTIFICATE FOLDERS Procurement '
                'Portal',
  'published_at': '2026-02-22T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/multiple-tenders-feb-march-2026',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/QJ3oSPRrz02KjRHcMS7l86O8Ea6obf0zmNZD8LPA.jpg',
  'display_order': 59,
  'is_featured': False},
 {'title': 'KSU Vice Chancellor joins academic community in celebrating Egerton University 86th year of service',
  'category': 'NEWS',
  'summary': 'Led by our Vice Chancellor, Kisii University proudly joined the academic community in celebrating '
             'Egerton University on the occasion of her 86th year of distinguished service, marked during today,s Open '
             'Day celebrations. This moment was more than a celebration, it was a powerful affirmation of unity, '
             'shared purpose,',
  'plain_text': 'Led by our Vice Chancellor, Kisii University proudly joined the academic community in celebrating '
                'Egerton University on the occasion of her 86th year of distinguished service, marked during today,s '
                'Open Day celebrations. This moment was more than a celebration, it was a powerful affirmation of '
                'unity, shared purpose, and the enduring spirit of scholarship. Kisii University stands shoulder to '
                'shoulder with fellow academic giants, committed to learning from one another, engaging meaningfully, '
                'and building networks that elevate higher education for the greater good. Congratulations to Egerton '
                'University on 86 remarkable years of impact and excellence. Here,s to an even brighter future, bold '
                'in vision, rich in collaboration, and transformative for generations to come.',
  'published_at': '2026-02-16T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ksu-vice-chancellor-joins-academic-community-in-celebrating-egerton-university-86th-year-of-service',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/oR0iY5p6PCUZXhYulWuHLiK2Wj9RxlvX9XSws02q.jpg',
  'display_order': 62,
  'is_featured': False},
 {'title': 'Day 2 Night Beauty Pageantry Preliminaries',
  'category': 'ARTS & CULTURE',
  'summary': 'A dazzling spectacle of talent, skill, and boundless creativity has lit up our Beauty Pageantry '
             'Preliminaries. Despite the crisp and cold night air, the stage burned bright with confidence, elegance, '
             'and brilliance. Each step, each smile, each performance radiated passion and purpose, wrapping us all in '
             'a warmth only',
  'plain_text': 'A dazzling spectacle of talent, skill, and boundless creativity has lit up our Beauty Pageantry '
                'Preliminaries. Despite the crisp and cold night air, the stage burned bright with confidence, '
                'elegance, and brilliance. Each step, each smile, each performance radiated passion and purpose, '
                'wrapping us all in a warmth only excellence can create. In every contestant, we witnessed not just '
                'beauty, but discipline, courage, and the unshakable pride of Kisii University students rising to '
                'their moment. The commitment, focus, and artistry on display has transformed the evening into a '
                'celebration of identity, culture, and limitless potential. Ladies and gentlemen, welcome to the 11th '
                'Kisii University Cultural Festival, where talent finds its voice, creativity takes center stage, and '
                'greatness shines unapologetically.',
  'published_at': '2026-02-12T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/day-2-night-beauty-pageantry-preliminaries',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/4IbrztjI97BKwv4xiK3CFSnNhtOsdnalSkM4woeI.jpg',
  'display_order': 63,
  'is_featured': False},
 {'title': 'Day 2 Cultural Week 2026',
  'category': 'ARTS & CULTURE',
  'summary': 'Words fall short in capturing the boundless joy and the magnificent display of culture and tradition '
             'that unfolded on Day 2 , the Vice Chancellor stepped right into the heart of the celebration, unafraid, '
             'unreserved, and fully present, dancing, laughing, and rejoicing alongside his children, the students. It '
             'was more',
  'plain_text': 'Words fall short in capturing the boundless joy and the magnificent display of culture and tradition '
                'that unfolded on Day 2 , the Vice Chancellor stepped right into the heart of the celebration, '
                'unafraid, unreserved, and fully present, dancing, laughing, and rejoicing alongside his children, the '
                'students. It was more than a moment of festivity; it was a powerful expression of unity, humility, '
                'and shared identity. A timeless scene, etched forever into the living memory of Kisii University, '
                'reminding us that leadership shines brightest when it celebrates with the people.',
  'published_at': '2026-02-12T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/day-2-cultural-week-2026',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/8Xwcnp03Gj2vvHoHvrJPy7dhYsuH4RWdvUoQOlUc.jpg',
  'display_order': 64,
  'is_featured': False},
 {'title': 'CRITERIA FOR APPOINTMENT AND PROMOTION OF ACADEMIC AND RESEARCH STAFF',
  'category': 'NEWS',
  'summary': 'CRITERIA FOR APPOINTMENT AND PROMOTION OF ACADEMIC AND RESEARCH STAFF. pdf',
  'plain_text': 'CRITERIA FOR APPOINTMENT AND PROMOTION OF ACADEMIC AND RESEARCH STAFF. pdf',
  'published_at': '2026-02-11T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/criteria-for-appointment-and-promotion-of-academic-and-research-staff',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/6KYUKP9L7tuEQuZmopDoO3i8gJBDLfgv1Zvy7i2c.jpg',
  'display_order': 65,
  'is_featured': False},
 {'title': 'Vice Chancellors sign Implementation Agreements at CS for Education, Hon. Julius Migos Ogamba',
  'category': 'NEWS',
  'summary': 'This afternoon, our Vice Chancellor joined fellow Vice Chancellors and the Cabinet Secretary for '
             'Education, Hon. Julius Migos Ogamba, at the signing of Implementation Agreements for the Higher '
             'Education, Science and Technology Phase II Project. By standing with the Cabinet Secretary in this '
             'landmark moment, Kisii',
  'plain_text': 'This afternoon, our Vice Chancellor joined fellow Vice Chancellors and the Cabinet Secretary for '
                'Education, Hon. Julius Migos Ogamba, at the signing of Implementation Agreements for the Higher '
                'Education, Science and Technology Phase II Project. By standing with the Cabinet Secretary in this '
                'landmark moment, Kisii University reaffirmed its strong alignment with the Government,s five-year '
                'flagship investment to transform STEM education. The project will drive investments in modern '
                'infrastructure, advanced equipment, research, and governance systems, preparing the University to '
                'receive learners from the Competency-Based Education (CBE) pathway and produce globally competitive, '
                'innovative graduates. Kisii University continues to invest in the right spaces and partner with the '
                'right institutions, boldly stepping into the next phase of growth and impact.',
  'published_at': '2026-02-10T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/vice-chancellors-sign-implementation-agreements-at-cs-for-education-hon-julius-migos-ogamba',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/zJGUuaDu1u7djJmxddAJoyCPJgKDO3QRTcRjFZ6R.jpg',
  'display_order': 66,
  'is_featured': False},
 {'title': 'Day 1 KSU Cultural Week 2026',
  'category': 'ARTS & CULTURE',
  'summary': 'Smiles bloomed, laughter echoed, and a sea of colour danced through the streets as Kisii University '
             'officially launched the 11th Cultural Festival Celebrations. The air was alive with joy, pride, and an '
             'indescribable inner happiness that only culture, unity, and shared purpose can inspire. Flagged off by '
             'the Deputy',
  'plain_text': 'Smiles bloomed, laughter echoed, and a sea of colour danced through the streets as Kisii University '
                'officially launched the 11th Cultural Festival Celebrations. The air was alive with joy, pride, and '
                'an indescribable inner happiness that only culture, unity, and shared purpose can inspire. Flagged '
                'off by the Deputy Vice Chancellor (ARSA), our disciplined Scouts and St. John Ambulance students '
                'proudly led the procession, gracefully snaking through town and capturing hearts at every turn. With '
                'every step, they carried a powerful message, of inclusivity without limits, borderless unity, and '
                'deep-rooted patriotism a message that resonated far beyond the parade route. This was more than a '
                'procession; it was a moving declaration of who we are as Kisii University and what we stand for. The '
                'journey has begun, the drums are beating, the colours are flying, and the celebration is in full '
                'motion. We begin now. Stay with us for a tonne of vibrant activities, unforgettable moments, and '
                'cultural brilliance as the 11th Cultural Festival unfolds.',
  'published_at': '2026-02-10T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/day-1-ksu-cultural-week-2026',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/m8mBkcC4NnhI5Wcc873l5Z0zb9LmvHrGyAhpP7SX.jpg',
  'display_order': 67,
  'is_featured': False},
 {'title': 'TENDER ADDENDUM FOR PROVISION OF COMPREHENSIVE MEDICAL INSURANCE COVER FOR STAFF',
  'category': 'TENDERS',
  'summary': 'Addendum For The Tender For Provision Of Comprehensive Medical Insurance Cover For University Staff PDF '
             'Link',
  'plain_text': 'Addendum For The Tender For Provision Of Comprehensive Medical Insurance Cover For University Staff '
                'PDF Link',
  'published_at': '2026-02-10T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/tender-addendum-for-provision-of-comprehensive-medical-insurance-cover-for-staff',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/BakKtY3YkhlETVUY6Hi3hZYJuENU3zh750toM160.jpg',
  'display_order': 68,
  'is_featured': False},
 {'title': 'KSU 11th Cultural Festival',
  'category': 'NEWS',
  'summary': 'The Cultural Festival begins today with our Vice Chancellor starting us off. Are you ready to sample the '
             'tapestry of our culture and the complexity of our food gala, well, join us from 12pm at the Chancellor,s '
             'Pavilion.',
  'plain_text': 'The Cultural Festival begins today with our Vice Chancellor starting us off. Are you ready to sample '
                'the tapestry of our culture and the complexity of our food gala, well, join us from 12pm at the '
                'Chancellor,s Pavilion.',
  'published_at': '2026-02-10T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ksu-11th-cultural-festival',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/tmwF3KGuj6ZLfacGBcTqb1dXBd4r201SGW32V9c5.jpg',
  'display_order': 69,
  'is_featured': False},
 {'title': '14th Graduation Certificate Pick up Schedule',
  'category': 'NEWS',
  'summary': 'Here is the schedule for picking 14th Graduation Certificates.',
  'plain_text': 'Here is the schedule for picking 14th Graduation Certificates.',
  'published_at': '2026-02-10T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/14th-graduation-certificate-pick-up-schedule',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/FyBu95T8crAYWUOUkc1vrWSjHnoBHA7CmAzBOu61.jpg',
  'display_order': 70,
  'is_featured': False},
 {'title': 'KSU 13th Year Anniversary',
  'category': 'NEWS',
  'summary': 'KSU 13th Year Anniversary is published on the official Kisii University website.',
  'plain_text': 'KSU 13th Year Anniversary is published on the official Kisii University website.',
  'published_at': '2026-02-06T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ksu-13th-year-anniversary',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/EP7D1hDU1q3LVBmZ1M8zg3JtYu0SVRVaTfqSWJPw.jpg',
  'display_order': 71,
  'is_featured': False},
 {'title': 'TENDER NOTICE',
  'category': 'TENDERS',
  'summary': 'For More Info Click Our Procurement Portal link',
  'plain_text': 'For More Info Click Our Procurement Portal link',
  'published_at': '2026-02-06T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/tender-notice',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/5JfH3qIrT1sSxFsqVX3M8F4yo4Sz9QqruYctPMBw.jpg',
  'display_order': 72,
  'is_featured': False},
 {'title': 'Commission for Administrative Training On Capacity Building On Access To Infromation',
  'category': 'WORKSHOP',
  'summary': 'Follow the Commission for Administrative Training Live through this link '
             'https://www.youtube.com/live/S3TELYrCFu8?si=74LV9IvUMr7cFrYR Learn, engage and interact. '
             'https://www.youtube.com/live/S3TELYrCFu8',
  'plain_text': 'Follow the Commission for Administrative Training Live through this link '
                'https://www.youtube.com/live/S3TELYrCFu8?si=74LV9IvUMr7cFrYR Learn, engage and interact. '
                'https://www.youtube.com/live/S3TELYrCFu8',
  'published_at': '2026-02-05T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/commission-for-administrative-training-on-capacity-building-on-access-to-infromation',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/dPrfHwXX4XONtaCaSWqu3pnKlNZk7iEYMrfA1bVf.jpg',
  'display_order': 73,
  'is_featured': False},
 {'title': 'Kisii University and Mälardalen University explore strategic collaboration',
  'category': 'NEWS',
  'summary': 'Kisii University and Malardalen University, Sweden, are exploring a strategic collaboration with a '
             'strong focus on Environmental Studies at Bachelor,s, Master,s, and PhD levels, as well as renewable '
             'energy. The Vice Chancellor, today hosted Dr. Lara Carvalho in a bid to expediate this good work that '
             'will see the two',
  'plain_text': 'Kisii University and Malardalen University, Sweden, are exploring a strategic collaboration with a '
                'strong focus on Environmental Studies at Bachelor,s, Master,s, and PhD levels, as well as renewable '
                'energy. The Vice Chancellor, today hosted Dr. Lara Carvalho in a bid to expediate this good work that '
                'will see the two institutions develop a mutually beneficial working relationship in the next few '
                'months. Kisii University continues to paint its borderless map on a truly magical world canvas. In '
                'Kisii university our international agenda is intentional.',
  'published_at': '2026-02-04T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-and-malardalen-university-explore-strategic-collaboration',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/0tNl5m3honraLOG4ZD7LkBtQiD4VkRbbGytRNmDe.jpg',
  'display_order': 75,
  'is_featured': False},
 {'title': 'Mental Health Workshop',
  'category': 'WORKSHOP',
  'summary': 'Day 2 Part 3 https://www.youtube.com/watch?v=TI_ZxrMcvus DAY 2 Part 2 '
             'https://www.youtube.com/live/a6z0NPnynuc?si=_TczoTPhDHLkMdnO DAY 2 Part 1 '
             'https://www.youtube.com/watch?v=ZAYiVakDTWk DAY 1 part 1 https://www.youtube.com/watch?v=GaA5G0cnFDU DAY '
             '1 Part 2 https://www.youtube.com/watch?v=lTQk4ZF8UO0 DAY 1 Part 3',
  'plain_text': 'Day 2 Part 3 https://www.youtube.com/watch?v=TI_ZxrMcvus DAY 2 Part 2 '
                'https://www.youtube.com/live/a6z0NPnynuc?si=_TczoTPhDHLkMdnO DAY 2 Part 1 '
                'https://www.youtube.com/watch?v=ZAYiVakDTWk DAY 1 part 1 https://www.youtube.com/watch?v=GaA5G0cnFDU '
                'DAY 1 Part 2 https://www.youtube.com/watch?v=lTQk4ZF8UO0 DAY 1 Part 3 '
                'https://www.youtube.com/watch?v=WRK7D7VNWHY',
  'published_at': '2026-01-28T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/mental-health-workshop',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/TZhbQuEhytsKnP5cGOhBBXUVLUQbmUciDVrZufOn.jpg',
  'display_order': 76,
  'is_featured': False},
 {'title': 'Session Reporting For Second Semester 2025/2026 Academic Year',
  'category': 'NEWS',
  'summary': 'Session Reporting For Second Semester 2025/2026 Academic Year is published on the official Kisii '
             'University website.',
  'plain_text': 'Session Reporting For Second Semester 2025/2026 Academic Year is published on the official Kisii '
                'University website.',
  'published_at': '2026-01-27T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/session-reporting-for-second-semester-20252026-academic-year',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/SvyYecnNlkB9i07xHDmV2zIepbEQqg6c2VY1XOcW.jpg',
  'display_order': 77,
  'is_featured': False},
 {'title': 'HERI Africa Research Program',
  'category': 'NEWS',
  'summary': 'The HERI Africa Research Program is here, bold in vision, far-reaching in impact, and firmly at home '
             'with us. Today, alongside our colleagues from Education Sub-Saharan Africa (ESSA), we took the first '
             'decisive steps on a transformative journey that will culminate in the official launch of this '
             'prestigious program at',
  'plain_text': 'The HERI Africa Research Program is here, bold in vision, far-reaching in impact, and firmly at home '
                'with us. Today, alongside our colleagues from Education Sub-Saharan Africa (ESSA), we took the first '
                'decisive steps on a transformative journey that will culminate in the official launch of this '
                'prestigious program at our University on 18th February 2026. This is more than a beginning; it,s a '
                'commitment to research excellence, collaboration, and Africa-driven solutions. Watch this space, '
                'something remarkable is unfolding.',
  'published_at': '2026-01-23T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/heri-africa-research-program',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/0Xm7ByrND3PdK5bcWE2eG0h9blEPGUuhhNFhvdHV.jpg',
  'display_order': 78,
  'is_featured': False},
 {'title': 'KSU Students Awarded President’s Award Gold Award',
  'category': 'NEWS',
  'summary': 'Our Vice Chancellor proudly led a delegation to State House for the President,s Award Gold Award '
             'Celebrations, a moment of honour and inspiration as our students were recognised with Gold Awards for '
             'their unwavering commitment to community service, skills development, and transformative impact. Under '
             'the focused and',
  'plain_text': 'Our Vice Chancellor proudly led a delegation to State House for the President,s Award Gold Award '
                'Celebrations, a moment of honour and inspiration as our students were recognised with Gold Awards for '
                'their unwavering commitment to community service, skills development, and transformative impact. '
                'Under the focused and visionary leadership of our Vice Chancellor, Kisii University continues to '
                'excel in this prestigious programme, nurturing servant leaders and changemakers who are shaping '
                'society beyond the classroom. This is the Kisii University spirit in action, excellence with purpose, '
                'impact with heart.',
  'published_at': '2026-01-22T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ksu-students-awarded-presidents-award-gold-award',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/TytSN4lNdnjjFv1ynrDJM3gxeOzM5QUhk5a2qV0p.jpg',
  'display_order': 79,
  'is_featured': False},
 {'title': 'Kisii University Student Village Site Handover',
  'category': 'NEWS',
  'summary': 'We didn,t just hand over land for a student village, we handed over hope, opportunity, and the promise '
             'of fulfilled dreams. In just under 52 weeks, our students will call this place home, enjoying modern '
             'amenities, a secure environment, and the freedom to focus fully on pursuing their ambitions. At Kisii '
             'University,',
  'plain_text': 'We didn,t just hand over land for a student village, we handed over hope, opportunity, and the '
                'promise of fulfilled dreams. In just under 52 weeks, our students will call this place home, enjoying '
                'modern amenities, a secure environment, and the freedom to focus fully on pursuing their ambitions. '
                'At Kisii University, we exist because you do and together, we are building a future where every dream '
                'has room to thrive.',
  'published_at': '2026-01-19T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-student-village-site-handover',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/LwLLqNzkNtdfTWpegwq9li84aU71isH0ryEAynfh.jpg',
  'display_order': 80,
  'is_featured': False},
 {'title': 'University of West Bohemia Pilsen and Charles University on Campus',
  'category': 'NEWS',
  'summary': 'The University of West Bohemia Pilsen and Charles University are currently on campus, partnering with '
             'our School of Education to implement a transformative Higher Education Mobility Programme. Through a '
             'series of high-impact sessions and enriching side events, they are equipping our staff and students for '
             'greater',
  'plain_text': 'The University of West Bohemia Pilsen and Charles University are currently on campus, partnering with '
                'our School of Education to implement a transformative Higher Education Mobility Programme. Through a '
                'series of high-impact sessions and enriching side events, they are equipping our staff and students '
                'for greater global opportunities ahead. Today, they paid a courtesy call on the Vice Chancellor and '
                'received a warm welcome to deepen and sustain our collaboration. Kisii University continues to boldly '
                'and relentlessly advance its internationalization agenda, opening doors to a truly global future of '
                'learning and innovation.',
  'published_at': '2026-01-07T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/university-of-west-bohemia-pilsen-and-charles-university-on-campus',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/lkfqBT09nsKYNEZEHcRXy0BffaxouRPeE6oprEIh.jpg',
  'display_order': 81,
  'is_featured': False},
 {'title': 'Thomas More University Team at Kisii University',
  'category': 'NEWS',
  'summary': 'Today, the Vice Chancellor hosted a distinguished team from Thomas More University, marking a powerful '
             'step forward in strengthening global academic partnerships in the University. Through meaningful '
             'dialogue and collaboration, this engagement advances knowledge exchange and supports the development of '
             'impactful',
  'plain_text': 'Today, the Vice Chancellor hosted a distinguished team from Thomas More University, marking a '
                'powerful step forward in strengthening global academic partnerships in the University. Through '
                'meaningful dialogue and collaboration, this engagement advances knowledge exchange and supports the '
                'development of impactful academic projects. Kisii University continues to rise, thriving, shining, '
                'and confidently engaging institutions on the international stage as we shape a borderless future of '
                'learning and innovation.',
  'published_at': '2026-01-07T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/thomas-more-university-team-at-kisii-university',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/9GBXxu4cYBGS8jpzZgQYUH1HDjUtpCLkmeAfwbrv.jpg',
  'display_order': 82,
  'is_featured': False},
 {'title': 'Public Lecture On Current & Future Opportunities By Dr. Kirsten Schraeyen, PhD',
  'category': 'NEWS',
  'summary': 'In a truly inspiring engagement, Dr. Kirsten Schraeyen, PhD, bridged the Kisii University academic '
             'community with global ideas, boundless opportunities, and enriching international experiences. As Kisii '
             'University looks beyond the horizon to boldly advance its borderless and internationalization agenda, '
             'this',
  'plain_text': 'In a truly inspiring engagement, Dr. Kirsten Schraeyen, PhD, bridged the Kisii University academic '
                'community with global ideas, boundless opportunities, and enriching international experiences. As '
                'Kisii University looks beyond the horizon to boldly advance its borderless and internationalization '
                'agenda, this engagement marks a powerful and fitting beginning. Through her presence on campus and '
                'participation in several side events, Dr. Schraeyen continues to generously share her wealth of '
                'experience, igniting conversations that broaden perspectives and open new pathways for collaboration.',
  'published_at': '2026-01-05T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/public-lecture-on-current-future-opportunities-by-dr-kirsten-schraeyen-phd',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/lMNRaOKqNkiqOai9V7jwpX6KA8FyPnJhVY1JKwlb.jpg',
  'display_order': 83,
  'is_featured': False},
 {'title': 'Our New KSU Deputy Vice Chancellor Administration Planning & Finance',
  'category': 'NEWS',
  'summary': 'Today, Kisii University was enriched with a fresh infusion of wisdom, leadership, and purpose as we '
             'welcomed our new Deputy Vice Chancellor Administration Planning & Finance, Prof. Nathan Oyaro, PhD. '
             'Personally ushered in by our Vice Chancellor, Prof. Dr. Nathan O. Ogechi, Prof. Oyaro was inducted into '
             'his first',
  'plain_text': 'Today, Kisii University was enriched with a fresh infusion of wisdom, leadership, and purpose as we '
                'welcomed our new Deputy Vice Chancellor Administration Planning & Finance, Prof. Nathan Oyaro, PhD. '
                'Personally ushered in by our Vice Chancellor, Prof. Dr. Nathan O. Ogechi, Prof. Oyaro was inducted '
                'into his first Senate meeting and formally welcomed into his new office, marking the beginning of a '
                'promising chapter of service and impact. He joins the Kisii University family with a wealth of '
                'academic insight, proven administrative acumen, and a reputation for sound, dependable '
                'decision-making. We are inspired by the journey ahead and confident in the strength of the leadership '
                'team we continue to build. Welcome to the winning team, Prof. Oyaro, together, we move forward with '
                'purpose and excellence.',
  'published_at': '2026-01-05T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/our-new-ksu-deputy-vice-chancellor-administration-planning-finance',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/jEW8jp0d2SVl7gic7VmS9OAo9jSbYSN7HqhQ4vAI.jpg',
  'display_order': 84,
  'is_featured': False},
 {'title': 'Kudos KSU Staff Choir',
  'category': 'NEWS',
  'summary': 'Our Staff Choir gives us one of the last gifts of 2025 by clinching an amazing award. Cheers to you all '
             'for the wonderful work you put in creating and perfecting the melodies that warm and calm our hearts. '
             'You guys are a joy to behold',
  'plain_text': 'Our Staff Choir gives us one of the last gifts of 2025 by clinching an amazing award. Cheers to you '
                'all for the wonderful work you put in creating and perfecting the melodies that warm and calm our '
                'hearts. You guys are a joy to behold',
  'published_at': '2025-12-29T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kudos-ksu-staff-choir',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/HUF0BRydhOVDAxh6nARz0BNExoFHEpMSvQ6Hq5Wy.png',
  'display_order': 85,
  'is_featured': False},
 {'title': 'Merry Christmas and a Happy New Year',
  'category': 'NEWS',
  'summary': 'To you and yours, Merry Christmas and a Happy New Year.',
  'plain_text': 'To you and yours, Merry Christmas and a Happy New Year.',
  'published_at': '2025-12-29T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/merry-christmas-and-a-happy-new-year',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/3amQLkhcgLqbXTIxImIRLMiPI9gS2CdFXBaxMacs.jpg',
  'display_order': 86,
  'is_featured': False},
 {'title': 'Kisii University 14th Graduation Ceremony LIVE',
  'category': 'NEWS',
  'summary': 'Celebrating the 14th Graduation of Kisii University under the powerful theme: Producing Global Minds for '
             'Healthy Communities | Today marks a milestone as we send forth a new generation of global minds '
             'dedicated to building healthy communities and transforming the world. This is the 14th Congregation for '
             'the Conferment',
  'plain_text': 'Celebrating the 14th Graduation of Kisii University under the powerful theme: Producing Global Minds '
                'for Healthy Communities | Today marks a milestone as we send forth a new generation of global minds '
                'dedicated to building healthy communities and transforming the world. This is the 14th Congregation '
                'for the Conferment of Degrees and Award of Diplomas and Certificates of Kisii University. View in '
                'Youtube Mobile App https://www.openinyoutube.com/watch?v=yzto_MgjXqc',
  'published_at': '2025-12-17T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-14th-graduation-ceremony-live',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/PziP5GNDFicPHNvlWOq1aD864fxxjsyWNzf5uVbx.jpg',
  'display_order': 87,
  'is_featured': False},
 {'title': 'KSU Celebrates our PhD Graduands',
  'category': 'NEWS',
  'summary': 'An evening of honour, reflection, and quiet triumph : Tonight, we celebrate our PhD graduands, scholars '
             'who dared to ask difficult questions, endured the long solitude of research, and emerged as creators of '
             'knowledge and change. As the Chancellor hosted them, she honoured not just a milestone, but a journey of',
  'plain_text': 'An evening of honour, reflection, and quiet triumph : Tonight, we celebrate our PhD graduands, '
                'scholars who dared to ask difficult questions, endured the long solitude of research, and emerged as '
                'creators of knowledge and change. As the Chancellor hosted them, she honoured not just a milestone, '
                'but a journey of resilience, discipline, and unwavering pursuit of truth. The future of academia, '
                'innovation, and leadership sits among us. We celebrate you and tomorrow we crown you.',
  'published_at': '2025-12-17T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ksu-celebrates-our-phd-graduands',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/8LA60m9RzQzobJk6uXe0kpu2A6rCAmYFOiXovUxu.jpg',
  'display_order': 88,
  'is_featured': False},
 {'title': 'Kisii University 14th Graduation Documentary',
  'category': 'NEWS',
  'summary': 'The Kisii University 14th Graduation Documentary runs under the theme Producing Global Minds for Healthy '
             'Communities. The University continues to be a beacon of higher learning channeling local talent, '
             'leveraging global opportunities while transforming our current and future world View On YouTube Mobile '
             'App',
  'plain_text': 'The Kisii University 14th Graduation Documentary runs under the theme Producing Global Minds for '
                'Healthy Communities. The University continues to be a beacon of higher learning channeling local '
                'talent, leveraging global opportunities while transforming our current and future world View On '
                'YouTube Mobile App https://openinyoutu.be/yTucpnNVKmc',
  'published_at': '2025-12-17T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-14th-graduation-documentary',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/p88iiuDFxFtqsGEZv4Tw7F7NTdXpsIeps3P4WrjX.png',
  'display_order': 89,
  'is_featured': False},
 {'title': 'Kisii University Daycare and Lactation Centre',
  'category': 'NEWS',
  'summary': 'Today, we crowned our pre-graduation celebrations with a gift of the heart. The launch of the Kisii '
             'University Daycare and Lactation Centre is more than a milestone, it is a promise kept to parents, '
             'caregivers, and little ones in our community. A warm, safe space where dreams are nurtured, futures are '
             'protected, and',
  'plain_text': 'Today, we crowned our pre-graduation celebrations with a gift of the heart. The launch of the Kisii '
                'University Daycare and Lactation Centre is more than a milestone, it is a promise kept to parents, '
                'caregivers, and little ones in our community. A warm, safe space where dreams are nurtured, futures '
                'are protected, and love finds a home within our campus, because at Kisii University, graduation is '
                'not just about degrees earned, but about lives supported, families embraced, and a community that '
                'truly cares',
  'published_at': '2025-12-16T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-daycare-and-lactation-centre',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/hPKosqczYvywIrpDRS26XjwaLXBmtu3QjtQ7FtR0.jpg',
  'display_order': 90,
  'is_featured': False},
 {'title': 'The Citadel, 14th Graduation Newsletter 2025',
  'category': 'NEWS',
  'summary': 'Have you gotten a chance to flip through our 14th Graduation Citadel Magazine Edition. Take a few '
             'minutes and get inspired by the amazing things happening in Kisii University. '
             'https://heyzine.com/flip-book/eaa2734d59.html',
  'plain_text': 'Have you gotten a chance to flip through our 14th Graduation Citadel Magazine Edition. Take a few '
                'minutes and get inspired by the amazing things happening in Kisii University. '
                'https://heyzine.com/flip-book/eaa2734d59.html',
  'published_at': '2025-12-16T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/the-citadel-14th-graduation-newsletter-2025',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/7uGcMjeczHyc7UTf4jES231HHNFO69Sfvr4H0hi6.png',
  'display_order': 91,
  'is_featured': False},
 {'title': 'Kisii University 14th Graduation Booklet',
  'category': 'NEWS',
  'summary': 'Are you a graduand in the 14th Graduation Ceremony, Scan the QR Code to see how your beautiful name has '
             'been annexed in the halls of Kisii University history. https://heyzine.com/flip-book/948851f7c9.html',
  'plain_text': 'Are you a graduand in the 14th Graduation Ceremony, Scan the QR Code to see how your beautiful name '
                'has been annexed in the halls of Kisii University history. '
                'https://heyzine.com/flip-book/948851f7c9.html',
  'published_at': '2025-12-13T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-14th-graduation-booklet',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/NcK0R9XiOhRyEhXVgLbTXSdJQpQyE2bfJ8Pfi4lb.png',
  'display_order': 92,
  'is_featured': False},
 {'title': 'Kisii University Graduation Ceremony 2025',
  'category': 'NEWS',
  'summary': 'Join our Kisii University family as we celebrate the hard work, dedication, and success of the Class of '
             '2025! Only 5 days left to 14th graduation day. We can,t wait to see you there in person or watching '
             'live! DATE: December 17, 2025 | VENUE: Chancellor,s Pavilion | TIME: From 8:00 a.m. Don,t forget to '
             'connect with us',
  'plain_text': 'Join our Kisii University family as we celebrate the hard work, dedication, and success of the Class '
                'of 2025! Only 5 days left to 14th graduation day. We can,t wait to see you there in person or '
                'watching live! DATE: December 17, 2025 | VENUE: Chancellor,s Pavilion | TIME: From 8:00 a.m. Don,t '
                'forget to connect with us online and be part of the celebration! Live On youtube.com',
  'published_at': '2025-12-11T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-graduation-ceremony-2025',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/aPj51WqzhBNjY1nhsqQsRKitkHlXDz17dbDxJ20B.jpg',
  'display_order': 93,
  'is_featured': False},
 {'title': 'KSU Stand Against Gender-Based Violence',
  'category': 'NEWS',
  'summary': 'Kisii University,s Gender Committee led a powerful road walk, turning our streets into a moving '
             'statement of solidarity and hope. With every step, we affirmed our stand against gender-based violence, '
             'championing a culture where dignity is protected, voices are heard, and every individual feels safe and '
             'valued. This',
  'plain_text': 'Kisii University,s Gender Committee led a powerful road walk, turning our streets into a moving '
                'statement of solidarity and hope. With every step, we affirmed our stand against gender-based '
                'violence, championing a culture where dignity is protected, voices are heard, and every individual '
                'feels safe and valued. This walk was more than a march; it was a call to action. A reminder that '
                'ending GBV begins with us, through awareness, compassion, and the courage to speak up. As a '
                'university committed to inclusivity and human rights, we continue to rise, advocate, and lead the '
                'charge toward a just and respectful society',
  'published_at': '2025-12-01T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ksu-stand-against-gender-based-violence',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/dmuuq5ZyIAgtHMmzr3sFczGsfEX8DjTPBKrkuuq5.jpg',
  'display_order': 94,
  'is_featured': False},
 {'title': 'World Antimicrobial Awareness Week',
  'category': 'NEWS',
  'summary': 'In a vibrant and deeply meaningful event, our students stood shoulder to shoulder with the world in '
             'marking the World Antimicrobial Awareness Week. They stepped boldly into the global conversation, '
             'embracing the responsibility of advocacy and amplifying the call to confront this silent but devastating '
             'threat. At Kisii',
  'plain_text': 'In a vibrant and deeply meaningful event, our students stood shoulder to shoulder with the world in '
                'marking the World Antimicrobial Awareness Week. They stepped boldly into the global conversation, '
                'embracing the responsibility of advocacy and amplifying the call to confront this silent but '
                'devastating threat. At Kisii University, where health sciences form the heart of our academic '
                'identity, empowering students with proactive, real-world solutions is more than preparing the next '
                'generation of health professionals; it is an investment in safeguarding humanity,s future.',
  'published_at': '2025-11-25T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/world-antimicrobial-awareness-week',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/BLWPz9YJp7nHvMAoDuZS7d2OxXCxEjLEtNr2EHfE.jpg',
  'display_order': 95,
  'is_featured': False},
 {'title': 'Kisii University Reviews It,s Performance',
  'category': 'NEWS',
  'summary': 'Kisii University remains steadfast in its commitment to delivering excellence through annual performance '
             'contracting with the Government of Kenya. For us, performance is more than a requirement, it is a '
             'culture of accountability, continuous improvement, and purposeful growth. By measuring our progress, we '
             'not only',
  'plain_text': 'Kisii University remains steadfast in its commitment to delivering excellence through annual '
                'performance contracting with the Government of Kenya. For us, performance is more than a requirement, '
                'it is a culture of accountability, continuous improvement, and purposeful growth. By measuring our '
                'progress, we not only celebrate the targets we achieve but also gain valuable insight into areas that '
                'require renewed strategy and innovation. In collaboration with officials from the Public Service '
                'Performance Management Unit, Kisii University recently reflected on its achievements, evaluated '
                'lessons learned, and jointly crafted an even stronger performance roadmap for the upcoming financial '
                'year. This exercise was both a moment of gratitude for how far we have come and a renewed call to '
                'elevate our standards even higher. Our focus remains clear: to serve, to innovate, and to excel. We '
                'aim for nothing less than exceptional',
  'published_at': '2025-11-22T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-reviews-its-performance',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/q9lnlKCAUEm1yHjMGWqIlfOm8cZCUH9mOwhXwNSn.jpg',
  'display_order': 96,
  'is_featured': False},
 {'title': 'Kisii University Receives Best University Tax Club Award by H.E. President William Ruto, PhD',
  'category': 'NEWS',
  'summary': 'Kisii University was proudly recognized at Statehouse, Nairobi, as the recipient of the Best University '
             'Tax Club Award by H.E. President William Ruto, PhD. This prestigious honor celebrates our outstanding '
             'work in promoting tax education, enhancing compliance, and empowering vulnerable communities with '
             'knowledge and',
  'plain_text': 'Kisii University was proudly recognized at Statehouse, Nairobi, as the recipient of the Best '
                'University Tax Club Award by H.E. President William Ruto, PhD. This prestigious honor celebrates our '
                'outstanding work in promoting tax education, enhancing compliance, and empowering vulnerable '
                'communities with knowledge and understanding. Under the visionary leadership and unwavering support '
                'of our Vice Chancellor, the University,s Tax Society has demonstrated remarkable dedication, '
                'resulting in this consistent exceptional achievement. Kisii University takes immense pride in this '
                'milestone, a testament to our commitment to excellence, civic responsibility, and transformative '
                'impact.',
  'published_at': '2025-11-20T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-receives-best-university-tax-club-award-by-he-president-william-ruto-phd',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/0z7zIk3HmbCotHyYOLKAdysMToP9r1vQSvcdTWER.png',
  'display_order': 97,
  'is_featured': False},
 {'title': 'KSU VC Graces Alupe University’s 4th Graduation Ceremony',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor graced Alupe University,s 4th Graduation Ceremony at their Main Campus, standing in '
             'solidarity with our peers in celebrating academic excellence. In the true spirit of nurturing growth, '
             'strengthening networks, and elevating the collective journey of higher education, the Vice Chancellor in '
             'his',
  'plain_text': 'The Vice Chancellor graced Alupe University,s 4th Graduation Ceremony at their Main Campus, standing '
                'in solidarity with our peers in celebrating academic excellence. In the true spirit of nurturing '
                'growth, strengthening networks, and elevating the collective journey of higher education, the Vice '
                'Chancellor in his characteristic wisdom authorized the Kisii University Communications Team to '
                'support the event,s coverage and livestreaming. With the professionalism and exceptional quality that '
                'has become the hallmark of Kisii University, our team ensured the celebrations were captured '
                'impeccably. Kisii University continues to rise as a gold standard in service, operations, and '
                'collaborative engagement across the academic landscape.',
  'published_at': '2025-11-16T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ksu-vc-graces-alupe-universitys-4th-graduation-ceremony',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/IhHxLuygYVeHQ4GG4T1AJC3b0D0uYxTSgMF3c1cp.jpg',
  'display_order': 98,
  'is_featured': False},
 {'title': 'Rural Leadership Program',
  'category': 'NEWS',
  'summary': 'In partnership with Minnesota State University, USA, Kisii University proudly celebrated the graduation '
             'of the inaugural cohort of the Rural Leadership Program; a milestone that reflects our unwavering '
             'commitment to nurturing visionary leaders with a global outlook. This initiative embodies our dedication '
             'to',
  'plain_text': 'In partnership with Minnesota State University, USA, Kisii University proudly celebrated the '
                'graduation of the inaugural cohort of the Rural Leadership Program; a milestone that reflects our '
                'unwavering commitment to nurturing visionary leaders with a global outlook. This initiative embodies '
                'our dedication to borderless learning, inspiring our students to think beyond boundaries and act with '
                'purpose. As Kisii University continues to align strategically with esteemed international partners, '
                'we reaffirm our pursuit of excellence, innovation, and impact on both local and global stages.',
  'published_at': '2025-11-08T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/rural-leadership-program',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/tq8kT7cubXXVMgnF4OaDKRSpK9SFiMn6C8uai8GL.jpg',
  'display_order': 99,
  'is_featured': False},
 {'title': 'Revised Academic Calendar 2025/26',
  'category': 'ACADEMICS',
  'summary': 'Revised Academic Calendar 2025/26 is published on the official Kisii University website.',
  'plain_text': 'Revised Academic Calendar 2025/26 is published on the official Kisii University website.',
  'published_at': '2025-11-06T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/revised-academic-calendar-202526',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/Fit4dC4IWWc7uBQOEmHtC2v25Jfe8rDxy5UgZ4Gl.jpg',
  'display_order': 100,
  'is_featured': False},
 {'title': 'KSU and Safaricom Foundation',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor today hosted a delegation from Safaricom Foundation, marking the beginning of a '
             'promising partnership that holds immense potential for our students and the wider community. Through a '
             'Memorandum of Understanding currently at its beginning stages, Kisii University and Safaricom Foundation '
             'are laying',
  'plain_text': 'The Vice Chancellor today hosted a delegation from Safaricom Foundation, marking the beginning of a '
                'promising partnership that holds immense potential for our students and the wider community. Through '
                'a Memorandum of Understanding currently at its beginning stages, Kisii University and Safaricom '
                'Foundation are laying the foundation for collaboration in areas that inspire innovation, create '
                'internship opportunities for our students, and drive meaningful societal transformation. Together, we '
                'envision a future where education and industry unite to empower the next generation of changemakers.',
  'published_at': '2025-11-06T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ksu-and-safaricom-foundation',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/0Jjq3ehCX7H9s2h1Jesf56dBdkLibKVmRvSyemf4.jpg',
  'display_order': 101,
  'is_featured': False},
 {'title': 'KSU New Student Leadership 2025',
  'category': 'STUDENT LIFE',
  'summary': 'Kisii University,s newly elected Student Leaders today embarked on an inspiring journey of '
             'transformation as they began their induction training. The week-long program was launched on a high '
             'note, with the Vice Chancellor serving as the inaugural facilitator setting the tone for a season of '
             'growth, reflection, and',
  'plain_text': 'Kisii University,s newly elected Student Leaders today embarked on an inspiring journey of '
                'transformation as they began their induction training. The week-long program was launched on a high '
                'note, with the Vice Chancellor serving as the inaugural facilitator setting the tone for a season of '
                'growth, reflection, and purpose. Over the coming days, the young leaders will immerse themselves in '
                'the principles of good governance, ethical leadership, and service excellence. Guided by the values '
                'that define Kisii University, they will refine their skills, strengthen their resolve, and learn how '
                'to lead with integrity, vision, and heart advancing the University,s mission and shaping a legacy of '
                'leadership that uplifts others.',
  'published_at': '2025-10-27T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ksu-new-student-leadership-2025',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/sY6ZFyY1oh9LqwFLrifq8topecMK0qZ2Y4XA6ovR.jpg',
  'display_order': 102,
  'is_featured': False},
 {'title': 'Nyamira University College Ground-breaking Ceremony',
  'category': 'NEWS',
  'summary': 'In a powerful display of vision, unity, and purpose, the Cabinet Secretary for Defence, Hon. Soipan '
             'Tuya, together with her Education counterpart, Hon. Julius Migos, today led the groundbreaking ceremony '
             'for the new Nyamira University College, a constituent college of Kisii University. This moment marks the '
             'dawn of a',
  'plain_text': 'In a powerful display of vision, unity, and purpose, the Cabinet Secretary for Defence, Hon. Soipan '
                'Tuya, together with her Education counterpart, Hon. Julius Migos, today led the groundbreaking '
                'ceremony for the new Nyamira University College, a constituent college of Kisii University. This '
                'moment marks the dawn of a transformative journey one fuelled by the unwavering professionalism, '
                'dedication, and institutional excellence of Kisii University. With such a strong foundation, the '
                'future shines bright for Nyamira University College, as it rises to become a beacon of knowledge, '
                'innovation, and regional growth. The journey has begun and from here, it only gets better.',
  'published_at': '2025-10-24T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/nyamira-university-college-ground-breaking-ceremony',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/neeBEaXLI0FMoxck4Q21rdkcLcBtp7SGSljaGSQB.jpg',
  'display_order': 103,
  'is_featured': False},
 {'title': 'Kisii University Students Association (KSUSA) New Leadership',
  'category': 'STUDENT LIFE',
  'summary': 'Today, the spirit of leadership and service came alive as newly elected Kisii University Students '
             'Association (KSUSA) leaders took the oath of office, a proud moment marking the smooth and dignified '
             'handover of the tools of power. Presided over by our Vice Chancellor, Prof. Dr. Nathan O. Ogechi, the '
             'ceremony',
  'plain_text': 'Today, the spirit of leadership and service came alive as newly elected Kisii University Students '
                'Association (KSUSA) leaders took the oath of office, a proud moment marking the smooth and dignified '
                'handover of the tools of power. Presided over by our Vice Chancellor, Prof. Dr. Nathan O. Ogechi, the '
                'ceremony symbolized continuity, unity, and the shared commitment to student empowerment. With fresh '
                'ideas, renewed energy, and unwavering integrity, our new student leaders are ready to carry the Kisii '
                'University flag even higher.',
  'published_at': '2025-10-22T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-students-association-ksusa-new-leadership',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/bYlebFQEiBIxv7aYgwUxKcJPUA6jDLKXLi89ztd2.jpg',
  'display_order': 104,
  'is_featured': False},
 {'title': 'Institutional Commercialization Support Programme',
  'category': 'NEWS',
  'summary': 'On October 6th, 2025, Kisii University launched the Institutional Commercialization Support Programme in '
             'partnership with KeNIA, marking a bold step toward becoming a leading entrepreneurial university. Guided '
             'by the Entrepreneurial Institutions Maturity Framework (EIMF), the University team conducted a strategic',
  'plain_text': 'On October 6th, 2025, Kisii University launched the Institutional Commercialization Support Programme '
                'in partnership with KeNIA, marking a bold step toward becoming a leading entrepreneurial university. '
                'Guided by the Entrepreneurial Institutions Maturity Framework (EIMF), the University team conducted a '
                'strategic self-assessment to map strengths and opportunities. The outcome, a tailored Institutional '
                'Commercialisation Masterplan, will transform research and innovations into impactful ventures, '
                'products, and services that drive real societal change. We are on prefixes of the next generation '
                'indeed.',
  'published_at': '2025-10-13T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/institutional-commercialization-support-programme',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/Vm7NAJK4zX2Cep5L5VvQVfMztDCWg73XfDcYRp0b.jpg',
  'display_order': 105,
  'is_featured': False},
 {'title': 'Kisii University Customer Service Week',
  'category': 'NEWS',
  'summary': 'What a vibe-filled week it,s been! From inspiring sessions to sharing cake and dancing together Kisii '
             'University turned Customer Service Week into a true celebration of teamwork, joy, and excellence! We '
             'didn,t just talk about great service we lived it, laughed it, and danced it out! Here,s to keeping that '
             'spirit alive',
  'plain_text': 'What a vibe-filled week it,s been! From inspiring sessions to sharing cake and dancing together Kisii '
                'University turned Customer Service Week into a true celebration of teamwork, joy, and excellence! We '
                'didn,t just talk about great service we lived it, laughed it, and danced it out! Here,s to keeping '
                'that spirit alive every single day, because at Kisii University, service with a smile is our '
                'lifestyle!',
  'published_at': '2025-10-13T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-customer-service-week',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/RbWifnGoZmu1m9ve5ciyAlJXGyikB8tKHb1uMCE8.jpg',
  'display_order': 106,
  'is_featured': False},
 {'title': 'Day 1 KSU Customer Service Week',
  'category': 'STUDENT LIFE',
  'summary': 'Day One of the Customer Service Week at Kisii University was nothing short of amazing! Wondering what '
             'exciting experiences we have lined up for the rest of the week? Stay tuned, it only gets better',
  'plain_text': 'Day One of the Customer Service Week at Kisii University was nothing short of amazing! Wondering what '
                'exciting experiences we have lined up for the rest of the week? Stay tuned, it only gets better',
  'published_at': '2025-10-06T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/day-1-ksu-customer-service-week',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/LqyeEsNpDuyQ2rcFYETljVOiXu8fZaJ3QXkL4n7o.jpg',
  'display_order': 107,
  'is_featured': False},
 {'title': 'Ksu Customer Service Week',
  'category': 'NEWS',
  'summary': 'This week we make very intentional steps to celebrate our lovely customers in every way possible. Watch '
             'out for our teams around and let us make you feel how much you mean to us. Happy Customer Service Week .',
  'plain_text': 'This week we make very intentional steps to celebrate our lovely customers in every way possible. '
                'Watch out for our teams around and let us make you feel how much you mean to us. Happy Customer '
                'Service Week .',
  'published_at': '2025-10-06T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ksu-customer-service-week',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/61bSQck7OATWCJiNgOdICYaicVkD8mf6459nYBNZ.jpg',
  'display_order': 108,
  'is_featured': False},
 {'title': 'Consultative Meeting with CS for Education & CS for Defence',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor joined the Cabinet Secretary for Education, Hon. Julius Migos Ogamba, in a '
             'high-level consultative meeting with the Cabinet Secretary for Defence, Hon. Soipan Tuya, to deliberate '
             'on the progress of establishing Nyamira University College. Anchored under the stewardship of Kisii '
             'University, this new',
  'plain_text': 'The Vice Chancellor joined the Cabinet Secretary for Education, Hon. Julius Migos Ogamba, in a '
                'high-level consultative meeting with the Cabinet Secretary for Defence, Hon. Soipan Tuya, to '
                'deliberate on the progress of establishing Nyamira University College. Anchored under the stewardship '
                'of Kisii University, this new institution promises to be a transformative hub of knowledge and '
                'innovation, uniquely positioning the region for greater growth, opportunity, and global connection.',
  'published_at': '2025-10-03T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/consultative-meeting-with-cs-for-education-cs-for-defence',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/x6UQwHNCLY00xrOdwxhpQDDJRQG8sHxn1zUKX5Ia.jpg',
  'display_order': 109,
  'is_featured': False},
 {'title': 'Kisii University Career Fair 2025 Day 2',
  'category': 'STUDENT LIFE',
  'summary': 'Celebrating the spirit of innovation and forward thinking among his students, the Vice Chancellor this '
             'afternoon immersed himself in the vibrant showcase of groundbreaking projects at the ongoing Career '
             'Fair. With grace and keen insight, he led inspiring mentorship circles, offering invaluable career '
             'guidance and',
  'plain_text': 'Celebrating the spirit of innovation and forward thinking among his students, the Vice Chancellor '
                'this afternoon immersed himself in the vibrant showcase of groundbreaking projects at the ongoing '
                'Career Fair. With grace and keen insight, he led inspiring mentorship circles, offering invaluable '
                'career guidance and wisdom to the budding professionals. His bird,s-eye perspective illuminated new '
                'possibilities, leaving students empowered, motivated, and deeply appreciative of the transformative '
                'guidance that defines Kisii University,s commitment to shaping future leaders.',
  'published_at': '2025-09-28T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-career-fair-2025-day-2',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/jhjNhHEebE2DoLhtIPpv11p8ngZZ4rSz0qLq6dfv.jpg',
  'display_order': 110,
  'is_featured': False},
 {'title': 'Kisii University Career Fair 2025 Day 1',
  'category': 'STUDENT LIFE',
  'summary': 'Day one of the Kisii University Career Fair was nothing short of electrifying filled with inspirational '
             'presentations, diverse partners, vibrant student engagement, dynamic facilitators, and captivating '
             'presenters. As we step into day two, we anticipate even greater opportunities for our students to learn, '
             'connect,',
  'plain_text': 'Day one of the Kisii University Career Fair was nothing short of electrifying filled with '
                'inspirational presentations, diverse partners, vibrant student engagement, dynamic facilitators, and '
                'captivating presenters. As we step into day two, we anticipate even greater opportunities for our '
                'students to learn, connect, and grow. This is the Kisii University way bold, inspiring, and '
                'transformative.',
  'published_at': '2025-09-24T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-career-fair-2025-day-1',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/BsxBhXKN5AJC19JVYQd8MUha2oK3kapjeIsVTp2H.jpg',
  'display_order': 111,
  'is_featured': False},
 {'title': 'Kisii University Career Fair Program',
  'category': 'STUDENT LIFE',
  'summary': 'Kisii University Career Fair Program is published on the official Kisii University website.',
  'plain_text': 'Kisii University Career Fair Program is published on the official Kisii University website.',
  'published_at': '2025-09-23T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-career-fair-program',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/Kjd9Brpei4g4fblnzRduXJQl9938axG523DUx6vs.jpg',
  'display_order': 112,
  'is_featured': False},
 {'title': 'International Labour Organization Entrepreneurship Training',
  'category': 'WORKSHOP',
  'summary': 'Over an intensive ten-day journey, colleagues drawn from diverse departments immersed themselves in a '
             'transformative entrepreneurship training led by the International Labour Organization (ILO). With '
             'unwavering dedication braving early mornings and late nights they diligently mastered complex concepts, '
             'internalized',
  'plain_text': 'Over an intensive ten-day journey, colleagues drawn from diverse departments immersed themselves in a '
                'transformative entrepreneurship training led by the International Labour Organization (ILO). With '
                'unwavering dedication braving early mornings and late nights they diligently mastered complex '
                'concepts, internalized the program,s vision, and set forth on the uncommon path of not merely '
                'becoming trainers, but emerging as master trainers. This remarkable feat reflects Kisii University,s '
                'steadfast commitment to empowering both staff and students to do more than reimagine the future, to '
                'boldly recreate it. Guided by a spirit of borderlessness and inclusivity, the University continues to '
                'nurture innovators and change-makers who will shape a world without limits',
  'published_at': '2025-09-22T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/international-labour-organization-entrepreneurship-training',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/v7tvK5E5EwWnyLzn2l4kKyuCPRNPzS4ZNV5nNaKo.jpg',
  'display_order': 113,
  'is_featured': False},
 {'title': 'Vice Chancellors Meet with H.E the President',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor, alongside colleague Vice Chancellors, met with H.E. the President to review the '
             'ongoing progress in institutions of higher learning. The discussions highlighted the stability being '
             'achieved across the sector, ground-breaking research initiatives undertaken, and financial efficiencies '
             'realized',
  'plain_text': 'The Vice Chancellor, alongside colleague Vice Chancellors, met with H.E. the President to review the '
                'ongoing progress in institutions of higher learning. The discussions highlighted the stability being '
                'achieved across the sector, ground-breaking research initiatives undertaken, and financial '
                'efficiencies realized through the new funding model. Kisii University, particularly continues to '
                'enjoy strategic leadership and oversight from our Vice Chancellor and the University Council ensuring '
                'notable strides in academic growth, research excellence, and innovative financial management.',
  'published_at': '2025-09-22T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/vice-chancellors-meet-with-he-the-president',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/jStAPFPVLsG6Qbid8xKNp4MpauTOzfUOJQqkgssj.jpg',
  'display_order': 114,
  'is_featured': False},
 {'title': 'National Land Commission workshop on Land Fragmentation',
  'category': 'WORKSHOP',
  'summary': 'National Land Commission today started a two day workshop to disseminate research findings on effects of '
             'land fragmentation & stakeholders engagement on draft advisory on minimum viable agricultural land sizes '
             'in Kenya. Kisii university is hosting this timely conference that has attracted the attention of at '
             'least 5',
  'plain_text': 'National Land Commission today started a two day workshop to disseminate research findings on effects '
                'of land fragmentation & stakeholders engagement on draft advisory on minimum viable agricultural land '
                'sizes in Kenya. Kisii university is hosting this timely conference that has attracted the attention '
                'of at least 5 Counties and 5 other Institution including the Food & Agricultural Organization (FAO). '
                'We continue to be the centre of excellence espousing inclusivity and borderless vibes across and '
                'beyond.',
  'published_at': '2025-09-09T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/national-land-commission-workshop-on-land-fragmentation',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/3QbbRzvlZzZK1yXHSpgF3svXBWLIxZpePtlU9Skh.jpg',
  'display_order': 115,
  'is_featured': False},
 {'title': 'Matriculation Ceremony 2025',
  'category': 'STUDENT LIFE',
  'summary': 'With pomp, colour and admiration etched on the faces of ambitious young scholars, the Vice Chancellor '
             'today presided over the matriculation ceremony, officially welcoming 8,000 first years into the Kisii '
             'University family. His resounding message of inclusivity, excellence, and unwavering commitment set the '
             'tone for a',
  'plain_text': 'With pomp, colour and admiration etched on the faces of ambitious young scholars, the Vice Chancellor '
                'today presided over the matriculation ceremony, officially welcoming 8,000 first years into the Kisii '
                'University family. His resounding message of inclusivity, excellence, and unwavering commitment set '
                'the tone for a transformative journey ahead one defined by hope, opportunity, and boundless '
                'possibility. Kisii University stands tall as a hub of technological excellence, powered by unmatched '
                'human potential and a vision to shape global leaders.',
  'published_at': '2025-08-30T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/matriculation-ceremony-2025',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/zm49m96XahsfpknVMchYM7dbPppIlMlQ7v4hcLSm.jpg',
  'display_order': 116,
  'is_featured': False},
 {'title': 'Day 4 Orientation 2025',
  'category': 'NEWS',
  'summary': 'Today was a beautiful Academic day for our First years at Orientation, with wise words from our top '
             'administrators.',
  'plain_text': 'Today was a beautiful Academic day for our First years at Orientation, with wise words from our top '
                'administrators.',
  'published_at': '2025-08-30T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/day-4-orientation-2025',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/xRNRaYyeOtwug8dEHmP3Obwr98SxBjbvU8aWaLDE.jpg',
  'display_order': 117,
  'is_featured': False},
 {'title': 'Session Reporting & Unit Registration 2025 Sept',
  'category': 'ACADEMICS',
  'summary': 'Session Reporting & Unit Registration 2025 Sept is published on the official Kisii University website.',
  'plain_text': 'Session Reporting & Unit Registration 2025 Sept is published on the official Kisii University '
                'website.',
  'published_at': '2025-08-28T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/session-reporting-unit-registration-2025-sept',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/fkK7mwrSHeB4JfvIpHQAyqLHmTGCSq9L26am6bPU.jpg',
  'display_order': 118,
  'is_featured': False},
 {'title': 'Day 3 Orientation 2025',
  'category': 'NEWS',
  'summary': 'Radiant faces, infectious energy, and the bright promise of tomorrow marked the close of Day 3 of '
             'Orientation. Our young scholars, brilliant, beautiful, and bold are steadily finding their footing. At '
             'Kisii University, we walk beside them, offering unwavering support and guidance, shaping them into '
             'globally',
  'plain_text': 'Radiant faces, infectious energy, and the bright promise of tomorrow marked the close of Day 3 of '
                'Orientation. Our young scholars, brilliant, beautiful, and bold are steadily finding their footing. '
                'At Kisii University, we walk beside them, offering unwavering support and guidance, shaping them into '
                'globally competitive leaders ready to leave their mark on the world',
  'published_at': '2025-08-28T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/day-3-orientation-2025',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/31WpfMTRbqOTyz7dUZV2lLnj36z5u1cypmCBvBef.jpg',
  'display_order': 119,
  'is_featured': False},
 {'title': 'Day 2 Orientation 2025',
  'category': 'NEWS',
  'summary': 'Today, our first-year students embarked on a guided familiarization tour of Kisii University, a journey '
             'of discovery designed to immerse them in the heartbeat of their new academic home. Beyond orienting them '
             'to the physical landscape, the experience unveiled the wealth of intellectual, technological, and '
             'digital',
  'plain_text': 'Today, our first-year students embarked on a guided familiarization tour of Kisii University, a '
                'journey of discovery designed to immerse them in the heartbeat of their new academic home. Beyond '
                'orienting them to the physical landscape, the experience unveiled the wealth of intellectual, '
                'technological, and digital resources at their disposal. By acquainting themselves with these assets, '
                'they begin to see not just buildings and systems, but the possibilities that lie within them, the '
                'tools that will shape their pursuit of knowledge, innovation, and personal growth. This is the first '
                'step in transforming curiosity into clarity, and potential into excellence.',
  'published_at': '2025-08-27T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/day-2-orientation-2025',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/eQ9EYeHAtPDFzVaJuaTaPFKlP73p0quFqXpAUjnE.jpg',
  'display_order': 120,
  'is_featured': False},
 {'title': 'Orientation Week 2025',
  'category': 'STUDENT LIFE',
  'summary': 'The journey of 8,000 bright young minds who joined us last week officially begins today with the launch '
             'of our Orientation Week. This week is thoughtfully designed to immerse them into the rhythms and values '
             'of Kisii University, equipping them with the tools, knowledge, and confidence to thrive. As we walk with '
             'them',
  'plain_text': 'The journey of 8,000 bright young minds who joined us last week officially begins today with the '
                'launch of our Orientation Week. This week is thoughtfully designed to immerse them into the rhythms '
                'and values of Kisii University, equipping them with the tools, knowledge, and confidence to thrive. '
                'As we walk with them from this first step, we do so with a clear vision to nurture their potential, '
                'shape their character, and guide them toward a celebrated graduation four years from now, ready to '
                'impact the world with excellence. Matriculation Ceremony 2025 Day 4 Orientation 2025 Day 3 '
                'Orientation 2025 Day 2 Orientation 2025 Orientation LIVE Day 1 Orientation Programme',
  'published_at': '2025-08-25T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/orientation-week-2025',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/v5gFKYLlIh3i4PsbLXUoKIXd566t37t5XOjjZMPt.jpg',
  'display_order': 121,
  'is_featured': False},
 {'title': 'Welcome 2025/2026 First Years',
  'category': 'ADMISSIONS',
  'summary': 'With careful planning, seamless execution, and the right blend of skill and experience, Kisii University '
             'proudly welcomed and officially registered over 6,700 first-year students. The admission process '
             'continues tomorrow as we journey towards enrolling all 9,000 of our new scholars. We deeply value the '
             'trust, support,',
  'plain_text': 'With careful planning, seamless execution, and the right blend of skill and experience, Kisii '
                'University proudly welcomed and officially registered over 6,700 first-year students. The admission '
                'process continues tomorrow as we journey towards enrolling all 9,000 of our new scholars. We deeply '
                'value the trust, support, and cooperation of parents and guardians who walk with us in this noble '
                'mission. Ladies and gentlemen, we remain profoundly grateful as together we build futures and nurture '
                'destinies.Â',
  'published_at': '2025-08-22T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/welcome-20252026-first-years',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/poMQxMeEVMoF8FJBLLuKPaBYTGliZl8TzrXWX9qQ.jpg',
  'display_order': 122,
  'is_featured': False},
 {'title': 'Kenya National Research Festival 2025 Innovations',
  'category': 'NEWS',
  'summary': "If You haven't gotten a chance to visit our stand at the Kenya National Research Festival, worry not, "
             'here are some of the innovations we are fielding. We are indeed the inclusive and borderless university, '
             'in mind body and intellectual prowess.',
  'plain_text': "If You haven't gotten a chance to visit our stand at the Kenya National Research Festival, worry not, "
                'here are some of the innovations we are fielding. We are indeed the inclusive and borderless '
                'university, in mind body and intellectual prowess.',
  'published_at': '2025-08-19T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kenya-national-research-festival-2025-innovations',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/zchWnQBoHMqvmfN1LF1RM8JUaVZcz3peBNa0oQhv.jpg',
  'display_order': 123,
  'is_featured': False},
 {'title': 'Performance Contracting 2025-2026',
  'category': 'NEWS',
  'summary': 'Kisii University grounds its foundational success not only in strategic planning and thinking but in '
             'living up to the spirit and letter of the Governments Performance Contracting obligations. Today, the '
             'Vice Chancellor led the important work of curating the 2025-2026 PC cycle negotiations that are going to '
             'be our',
  'plain_text': 'Kisii University grounds its foundational success not only in strategic planning and thinking but in '
                'living up to the spirit and letter of the Governments Performance Contracting obligations. Today, the '
                'Vice Chancellor led the important work of curating the 2025-2026 PC cycle negotiations that are going '
                'to be our north star in activities, performance and successes for the next one year. As our '
                'commitments become obligations, we strive to ensure a year in excellence service delivery.',
  'published_at': '2025-08-15T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/performance-contracting-2025-2026',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/pDctPM6AmLjKNxoWl7ilzj2jPyFYes5MeSvGDqGp.jpg',
  'display_order': 125,
  'is_featured': False},
 {'title': 'Inaugural Gusii Innovation Week 2025 Preparations is on track',
  'category': 'NEWS',
  'summary': 'Kisii University is on track to host the Inaugural Gusii Innovation Week, 2025 with the Research Office '
             'locking up potential partners like Fie Labs Innovation Hub, Kisii National Polytechnic, Getembe TV, '
             'Kisii County Department of Agriculture and Association of Regional Hubs. The University is keen on '
             'expanding its',
  'plain_text': 'Kisii University is on track to host the Inaugural Gusii Innovation Week, 2025 with the Research '
                'Office locking up potential partners like Fie Labs Innovation Hub, Kisii National Polytechnic, '
                'Getembe TV, Kisii County Department of Agriculture and Association of Regional Hubs. The University '
                'is keen on expanding its innovation mandate by intentionally reaching out to the community and '
                'pulling untapped potential into our innovation space. Kisii University will be the incubation '
                'launchpad and connection of this success stories with the world.',
  'published_at': '2025-08-15T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/inaugural-gusii-innovation-week-2025-preparations-is-on-track',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/a4fUQILZG71FuuBAR7XzgEFVM0rBXSHVMNPmeNCg.jpg',
  'display_order': 126,
  'is_featured': False},
 {'title': 'Career department hosts Kisii CEO’S and Managers',
  'category': 'NEWS',
  'summary': 'The Career department hosted a business breakfast for various CEO,S and Managers in Kisii town in a bid '
             'to continue martialing social capital and creating opportunities for our students. At Kisii University, '
             'education is not confined to classrooms it is a dynamic bridge between knowledge and opportunity. We '
             'believe',
  'plain_text': 'The Career department hosted a business breakfast for various CEO,S and Managers in Kisii town in a '
                'bid to continue martialing social capital and creating opportunities for our students. At Kisii '
                'University, education is not confined to classrooms it is a dynamic bridge between knowledge and '
                'opportunity. We believe that every graduate should step into the world not just with a degree, but '
                'with the confidence, competence, and clarity to thrive. For this we go out of our way to get for '
                'them.',
  'published_at': '2025-08-15T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/career-department-hosts-kisii-ceos-and-managers',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/GIIGYGT44hgTHeQeKGJIo8BRekoiOkGtM45Dp42J.jpg',
  'display_order': 127,
  'is_featured': False},
 {'title': 'Financial Literacy and Resource Management Training by Egerton Sacco',
  'category': 'WORKSHOP',
  'summary': 'Egerton Sacco empowered its Kisii University members through an insightful training on Financial '
             'Literacy and Resource Management. This session, part of the Sacco,s annual capacity-building programme, '
             'was made possible through sponsorship and facilitation by the African Confederation of Cooperative '
             'Savings and Credit',
  'plain_text': 'Egerton Sacco empowered its Kisii University members through an insightful training on Financial '
                'Literacy and Resource Management. This session, part of the Sacco,s annual capacity-building '
                'programme, was made possible through sponsorship and facilitation by the African Confederation of '
                'Cooperative Savings and Credit Associations (ACCOSCA). Representing the University Management, the '
                'Deputy Vice-Chancellor (Administration, Planning & Finance) commended the members for their active '
                'participation, underscoring financial discipline as a vital pillar of personal and professional '
                'success. Kisii University remains deeply appreciative of initiatives that enhance the capacity, '
                'knowledge, and socio-economic standing of our staff.',
  'published_at': '2025-08-15T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/financial-literacy-and-resource-management-training-by-egerton-sacco',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/ZPFwQPhLnyyBDvTdW7qkZzQkOlCmYbQ5TW9unlvs.jpg',
  'display_order': 128,
  'is_featured': False},
 {'title': 'Canadian High Commission Delegation visits KSU',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor warmly welcomed a delegation from the Canadian High Commission, led by Ms. Charity '
             'Kabaya, the Trade Commissioner, on a mission to explore meaningful avenues for collaboration between '
             'Kisii University and esteemed educational and research institutions in Canada. This engagement reflects '
             'Kisii',
  'plain_text': 'The Vice Chancellor warmly welcomed a delegation from the Canadian High Commission, led by Ms. '
                'Charity Kabaya, the Trade Commissioner, on a mission to explore meaningful avenues for collaboration '
                'between Kisii University and esteemed educational and research institutions in Canada. This '
                'engagement reflects Kisii Universityâ€™s unwavering commitment to its Internationalization '
                'agendaâ€”deliberately seeking, cultivating, and sustaining impactful global partnerships that place '
                'our institution firmly on the world stage, opening limitless horizons for our students, staff, and '
                'research.',
  'published_at': '2025-08-13T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/canadian-high-commission-delegation-visits-ksu',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/Gp7yXHO6yGbOghYAKbKVwyMkTPtnH1SpQZT25ToI.jpg',
  'display_order': 129,
  'is_featured': False},
 {'title': 'National Scouting Championships',
  'category': 'STUDENT LIFE',
  'summary': 'Our Scouts have glamorously emerged victorious in all their categories of the just ended, National '
             'Scouting Championships. From Best Male Troop, Best Female Troop, and Best Drill Team, to clinching the '
             'coveted title of Overall Best Institution in the Country, they have swept the awards with unmatched '
             'elegance and',
  'plain_text': 'Our Scouts have glamorously emerged victorious in all their categories of the just ended, National '
                'Scouting Championships. From Best Male Troop, Best Female Troop, and Best Drill Team, to clinching '
                'the coveted title of Overall Best Institution in the Country, they have swept the awards with '
                'unmatched elegance and precision. This outstanding performance now earns them the honour of '
                'representing Kenya at the East African Scouting Competition to be held later this year in Dar es '
                'Salaam, Tanzania. With unwavering finesse, excellence, and a spirit of inclusivity and borderlessness '
                'that defines the Kisii University identity, our Scouts have once again flown our flag high. We '
                'celebrate them with pride; true ambassadors of our values and vision.',
  'published_at': '2025-08-06T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/national-scouting-championships',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/hIfMjPAcE5dzQhMaHTNIOEGEF2LndbBoQ6TXYrz6.jpg',
  'display_order': 130,
  'is_featured': False},
 {'title': 'Open Call To All Current and Prospective Suppliers',
  'category': 'PUBLIC NOTIFICATION',
  'summary': 'https://egpkenya.go.ke/supplier/registration',
  'plain_text': 'https://egpkenya.go.ke/supplier/registration',
  'published_at': '2025-08-01T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/open-call-to-all-current-and-prospective-suppliers',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/27ki0sxnpkS5Op9ZUwxwyqWOFwMtk4DQzkHSKdI7.jpg',
  'display_order': 131,
  'is_featured': False},
 {'title': 'HELB Application for Continuing Students',
  'category': 'ADMISSIONS',
  'summary': 'Are you a Continuing Student, Take a minute and quickly apply for your Subsequent HELB Scholarship and '
             'Loan to ensure your disbursements come in on time to support you.',
  'plain_text': 'Are you a Continuing Student, Take a minute and quickly apply for your Subsequent HELB Scholarship '
                'and Loan to ensure your disbursements come in on time to support you.',
  'published_at': '2025-07-31T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/helb-application-for-continuing-students',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/t8PVh2nwaav5vu7KSYorVjj2ETUW3ubVdsmpiQjJ.jpg',
  'display_order': 132,
  'is_featured': False},
 {'title': 'HELB Application',
  'category': 'ADMISSIONS',
  'summary': 'As you prepare to join us next month, Let us help you seek government support for your education too. '
             'Remember to be extra keen with details while applying for your Scholarship and Loan. Like always, we are '
             'here for you so don,t miss out on anything.',
  'plain_text': 'As you prepare to join us next month, Let us help you seek government support for your education too. '
                'Remember to be extra keen with details while applying for your Scholarship and Loan. Like always, we '
                'are here for you so don,t miss out on anything.',
  'published_at': '2025-07-31T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/helb-application',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/xxoMWfhr8LWySDqC6cxO3T1EJbq3cVcVjei0bQ2K.jpg',
  'display_order': 133,
  'is_featured': False},
 {'title': 'Inter-University Transfers',
  'category': 'ADMISSIONS',
  'summary': 'Did you miss out on getting a course in Kisii University? No reason for you to be sad. Here is an '
             'opportunity for you to transfer to us. We are waiting to approve you in.',
  'plain_text': 'Did you miss out on getting a course in Kisii University? No reason for you to be sad. Here is an '
                'opportunity for you to transfer to us. We are waiting to approve you in.',
  'published_at': '2025-07-31T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/inter-university-transfers',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/wJUDneq0SZ5XB6emtsBSPFfFZFxOn9yOIJt31U7M.jpg',
  'display_order': 134,
  'is_featured': False},
 {'title': 'Nyanza Administration Police Command at KSU',
  'category': 'NEWS',
  'summary': 'In a continued demonstration of unwavering commitment to student safety and a stable, thriving learning '
             'environment, the Vice Chancellor warmly welcomed the new Nyanza Administration Police Command to Kisii '
             'University for a high-level strategic security meeting. This collaborative engagement underscores the',
  'plain_text': 'In a continued demonstration of unwavering commitment to student safety and a stable, thriving '
                'learning environment, the Vice Chancellor warmly welcomed the new Nyanza Administration Police '
                'Command to Kisii University for a high-level strategic security meeting. This collaborative '
                'engagement underscores the University,s dedication to fostering a secure and enabling space for '
                'academic excellence. Kisii University proudly partners with sister government agencies in a shared '
                'mission to elevate service delivery, champion national values, and create an institution where '
                'excellence is not just pursued, it is protected and assured.',
  'published_at': '2025-07-31T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/nyanza-administration-police-command-at-ksu',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/wpGIvunvZLLPgvP5UVFOi2DtpgTs0xFX35SCOZRI.jpg',
  'display_order': 135,
  'is_featured': False},
 {'title': 'Minnesota State University Carnegie African Diaspora Fellowship Program',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor hosted a delegation from Minnesota State University, Mankato which has partnered '
             'with the School of Education at Kisii University through the Carnegie African Diaspora Fellowship '
             'Program, This partnership focuses on enhancing STEM education and Competency-Based Education (CBE) at '
             'Kisii University.',
  'plain_text': 'The Vice Chancellor hosted a delegation from Minnesota State University, Mankato which has partnered '
                'with the School of Education at Kisii University through the Carnegie African Diaspora Fellowship '
                'Program, This partnership focuses on enhancing STEM education and Competency-Based Education (CBE) at '
                'Kisii University. The collaboration aims to equip STEM students and faculty with 21st-century '
                'pedagogical competencies in teaching and learning, enabling them to compete globally. Kisii '
                'University continues to expand its internationalization agenda and cross-border partnerships through '
                'this and many other programs.',
  'published_at': '2025-07-23T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/minnesota-state-university-carnegie-african-diaspora-fellowship-program',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/EiJEODAFbdtRZdTx0sDYsf2HRGbDsWqmz5sdZ5F1.jpg',
  'display_order': 136,
  'is_featured': False},
 {'title': 'Welcome to Kisii University',
  'category': 'STUDENT LIFE',
  'summary': 'At Kisii University, we don,t just offer an education, we ignite a transformation spirit in you. It is '
             'where ambition meets opportunity, and where you are sculpted into a man or woman of bold distinction and '
             'undeniable mettle. Our cutting-edge resources, world-class expertise, and deliberate, future-focused '
             'approach',
  'plain_text': 'At Kisii University, we don,t just offer an education, we ignite a transformation spirit in you. It '
                'is where ambition meets opportunity, and where you are sculpted into a man or woman of bold '
                'distinction and undeniable mettle. Our cutting-edge resources, world-class expertise, and deliberate, '
                'future-focused approach converge to shape leaders who don,t just thrive, they redefine the standards '
                'of excellence. At Kisii University, you are not a number; you are a force in the making. Step into a '
                'space where inclusivity is not a slogan but a lived experience, and borderlessness is our everyday '
                'reality. Welcome to Kisii University, your launch pad to unstoppable success, purpose-driven '
                'innovation, and lasting impact.',
  'published_at': '2025-07-23T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/welcome-to-kisii-university',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/zb2913BxEketmYyvJjd1o8k5lar1HGDnBcPfbk6O.jpg',
  'display_order': 137,
  'is_featured': False},
 {'title': 'ABSA Bank at KSU',
  'category': 'NEWS',
  'summary': 'The Deputy Vice Chancellor ARSA hosted officials from ABSA Bank at the University to explore the '
             'establishment of a strategic partnership focused on key areas of mutual interest. In the coming days, '
             'both institutions will work towards developing a comprehensive Memorandum of Understanding (MoU) to '
             'guide their',
  'plain_text': 'The Deputy Vice Chancellor ARSA hosted officials from ABSA Bank at the University to explore the '
                'establishment of a strategic partnership focused on key areas of mutual interest. In the coming days, '
                'both institutions will work towards developing a comprehensive Memorandum of Understanding (MoU) to '
                'guide their collaboration, particularly in implementing various micro and medium finance programs for '
                'staff and students among others. We look forward to a fruitful and impactful partnership.',
  'published_at': '2025-07-23T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/absa-bank-at-ksu',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/c59hpa1mrFysYY0lNrC5LiPREF0CC7sJ64hnxQXz.jpg',
  'display_order': 138,
  'is_featured': False},
 {'title': 'RECRUITMENT OF PROSPECTIVE PART-TIME LECTURERS',
  'category': 'NEWS & CAREERS',
  'summary': 'The University intends to establish a database for qualified part time lecturers from which lecturers '
             'would be drawn as and when required. REQUIREMENTS FOR APPOINTMENT Doctorate degree or a Master,s degree '
             'in the relevant area of specialization from a recognized University; All applicants qualifications '
             '(degrees) must',
  'plain_text': 'The University intends to establish a database for qualified part time lecturers from which lecturers '
                'would be drawn as and when required. REQUIREMENTS FOR APPOINTMENT Doctorate degree or a Master,s '
                'degree in the relevant area of specialization from a recognized University; All applicants '
                'qualifications (degrees) must be in the same field. At least two (2) years teaching experience in a '
                'University. APPLICATION PROCEDURE Visit Our Careers portal for More Info All applications should '
                'reach Kisii University on or before Friday, 8th August, 2025 not later than 5.00 p.m. (East African '
                'Time)',
  'published_at': '2025-07-17T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/recruitment-of-prospective-part-time-lecturers',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/uSbOPpgkeHK7gDRjCskqCmMiySK8vW04xhE1iiwb.jpg',
  'display_order': 139,
  'is_featured': False},
 {'title': '2025 Admission Process',
  'category': 'NEWS',
  'summary': 'Did you get placed in Kisii University. It,s time for you to download your admission letter and gear up '
             'for the Online Admission Process. Remember, we got your back anywhere you get stuck. Scan the QR Code in '
             'the Post below or click on this link 1. https://digital.kisiiuniversity.ac.ke/students/admissions/center '
             '2.',
  'plain_text': 'Did you get placed in Kisii University. It,s time for you to download your admission letter and gear '
                'up for the Online Admission Process. Remember, we got your back anywhere you get stuck. Scan the QR '
                'Code in the Post below or click on this link 1. '
                'https://digital.kisiiuniversity.ac.ke/students/admissions/center 2. Inter-University Transfer 3. HELB '
                'Application 4. HELB Application for Continuing Students',
  'published_at': '2025-07-16T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/2025-admission-process',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/dsmOZp5RK8cWfqYYvtGJM09pXMsBTG53WXSu3fmE.jpg',
  'display_order': 140,
  'is_featured': False},
 {'title': 'ASK Kisii Show comes to a Close',
  'category': 'NEWS',
  'summary': 'In a swift conclusion to an eventful four-day expedition, Kisii University wrapped up its participation '
             'in the ASK Show with deep reflections, invaluable lessons, and a promising future to envision. The '
             'University remains committed to its grand vision of inclusive and borderless success, grounded in the '
             'understanding',
  'plain_text': 'In a swift conclusion to an eventful four-day expedition, Kisii University wrapped up its '
                'participation in the ASK Show with deep reflections, invaluable lessons, and a promising future to '
                'envision. The University remains committed to its grand vision of inclusive and borderless success, '
                'grounded in the understanding of a shared world and a common destiny. Until next time, we continue to '
                'rise.',
  'published_at': '2025-07-14T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ask-kisii-show-comes-to-a-close',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/JPYMQd8Vczk9DSvYBnMVWObUyzMgrqTNmbBn7F6L.jpg',
  'display_order': 141,
  'is_featured': False},
 {'title': 'KSU Best University Stand',
  'category': 'NEWS',
  'summary': 'The best University Stand, the best stand in research & development and the best stand that best '
             'interprets the current theme, Kisii University continues to claim accolades and awards in the '
             'Agricultural Society Show at Gusii Stadium. The Kisii University stand at the ASK Show attracted '
             'thousands of visitors eager to',
  'plain_text': 'The best University Stand, the best stand in research & development and the best stand that best '
                'interprets the current theme, Kisii University continues to claim accolades and awards in the '
                'Agricultural Society Show at Gusii Stadium. The Kisii University stand at the ASK Show attracted '
                'thousands of visitors eager to learn about our academic programs, innovations, and groundbreaking '
                'creations developed within the University. As a towering north star in the region, Kisii University '
                'remains committed not only to academic excellence but also to providing practical solutions to '
                'real-world societal challenges. The University proudly champions inclusivity as it leads the charge '
                'towards a brighter and more sustainable future.',
  'published_at': '2025-07-14T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ksu-best-university-stand',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/2ZwuaXLGfPD6wb7Ng57VIYlxTk5LA1FXpId2xztp.jpg',
  'display_order': 142,
  'is_featured': False},
 {'title': 'ASK Show 2025 Promoting Climate-Smart Agriculture and Trade Initiatives for Sustainable Economic Growth',
  'category': 'NEWS',
  'summary': "Kisii University is proud to participate in this year's Agricultural Society of Kenya (ASK) Show at "
             'Gusii Stadium, under the theme, Promoting Climate-Smart Agriculture and Trade Initiatives for '
             'Sustainable Economic Growth. The University is showcasing innovative programs and initiatives designed '
             'to inspire and empower',
  'plain_text': "Kisii University is proud to participate in this year's Agricultural Society of Kenya (ASK) Show at "
                'Gusii Stadium, under the theme, Promoting Climate-Smart Agriculture and Trade Initiatives for '
                'Sustainable Economic Growth. The University is showcasing innovative programs and initiatives '
                'designed to inspire and empower the public in co-creating a better, more sustainable future. Be sure '
                'to visit our exhibition stand when you get a moment.',
  'published_at': '2025-07-11T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ask-show-2025-promoting-climate-smart-agriculture-and-trade-initiatives-for-sustainable-economic-growth',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/YeV5f0kt83aXKt9Hgads2fqqtjslwfqk2wSwv3xq.jpg',
  'display_order': 143,
  'is_featured': False},
 {'title': 'Chuo Kikuu cha Kisii yahidimisha Siku ya Kiswahili Duniani',
  'category': 'ARTS & CULTURE',
  'summary': 'Chuo Kikuu cha Kisii kwa kushirikiana na Wizara ya Jinsia, Utamaduni, Sanaa na Urithi pamoja na Shirika '
             'la UNESCO, kiliandaa kongamano la kitaaluma kuadhimisha Siku ya Kiswahili Duniani leo tarehe 7 Julai '
             '2025. Kongamano hilo lilifanyika katika majengo ya chuo kikuu na liliwaleta pamoja wataalamu wa lugha, '
             'wanazuoni,',
  'plain_text': 'Chuo Kikuu cha Kisii kwa kushirikiana na Wizara ya Jinsia, Utamaduni, Sanaa na Urithi pamoja na '
                'Shirika la UNESCO, kiliandaa kongamano la kitaaluma kuadhimisha Siku ya Kiswahili Duniani leo tarehe '
                '7 Julai 2025. Kongamano hilo lilifanyika katika majengo ya chuo kikuu na liliwaleta pamoja wataalamu '
                'wa lugha, wanazuoni, wanafunzi, wanahabari na wadau mbalimbali wa Kiswahili kutoka ndani na nje ya '
                'nchi. Kongamano hili lilidhihirisha dhamira ya Chuo Kikuu cha Kisii ya kuendeleza lugha ya Kiswahili '
                'kama nguzo muhimu ya maarifa, utambulisho na mshikamano wa kimataifa.',
  'published_at': '2025-07-09T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/chuo-kikuu-cha-kisii-yahidimisha-siku-ya-kiswahili-duniani',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/OnSn1Q4w20IbC7XDuHor2pMJ1XgqjIIUpynCp52J.jpg',
  'display_order': 144,
  'is_featured': False},
 {'title': 'Siku ya Kiswahili Duniani',
  'category': 'ARTS & CULTURE',
  'summary': 'Katika maadhimisho ya kuvutia ya Siku ya Kiswahili Duniani, Chuo Kikuu cha Kisii kwa fahari kubwa '
             'kiliungana na Wizara ya Jinsia, Utamaduni, Sanaa na Urithi pamoja na UNESCO katika tukio lililoangazia '
             'nguvu ya lugha katika kukuza umoja na utambulisho wa kitamaduni. Tukio hilo liliwaleta pamoja wasomi, '
             'wanafunzi,',
  'plain_text': 'Katika maadhimisho ya kuvutia ya Siku ya Kiswahili Duniani, Chuo Kikuu cha Kisii kwa fahari kubwa '
                'kiliungana na Wizara ya Jinsia, Utamaduni, Sanaa na Urithi pamoja na UNESCO katika tukio '
                'lililoangazia nguvu ya lugha katika kukuza umoja na utambulisho wa kitamaduni. Tukio hilo liliwaleta '
                'pamoja wasomi, wanafunzi, wasanii na watunga sera kutafakari nafasi ya Kiswahili si kama urithi wa '
                'kitaifa tu bali pia kama chombo cha kuunganisha mataifa ya Afrika na dunia kwa ujumla. Kupitia '
                'nyimbo, mashairi, mijadala na maigizo, washiriki walilitukuza Kiswahili kama njia ya kukuza undugu, '
                'heshima ya pamoja na mawasiliano jumuishi katika jamii yenye tofauti nyingi na inayobadilika kila '
                'uchao.',
  'published_at': '2025-07-07T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/siku-ya-kiswahili-duniani',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/RQ8VAZfesxh5XLRAgbiNGKinQDX59Et7xarHwFX3.jpg',
  'display_order': 145,
  'is_featured': False},
 {'title': '8047 Choose Kisii University',
  'category': 'NEWS',
  'summary': 'We take this early opportunity to welcome every single one of the 8,047 first years who will be joining '
             'us next month for choosing Kisii University. We will be reaching out soon on how you can download your '
             'admission letter. Here is how our new students are distributed in all our Schools and by gender as well. '
             'FYI if',
  'plain_text': 'We take this early opportunity to welcome every single one of the 8,047 first years who will be '
                'joining us next month for choosing Kisii University. We will be reaching out soon on how you can '
                'download your admission letter. Here is how our new students are distributed in all our Schools and '
                'by gender as well. FYI if you didn,t get selected to Kisii University yet, we are waiting for the '
                'transfer window to open so we can help you transfer to any of our Schools',
  'published_at': '2025-07-04T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/8047-choose-kisii-university',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/xK1q6ZcX6sziZOqDH9XcGJrF1zTLtIUeJsfaAlQc.jpg',
  'display_order': 146,
  'is_featured': False},
 {'title': 'Nyamira County Medical Camp',
  'category': 'COMMUNITY OUTREACH',
  'summary': 'Kisii University today took its extension activities to Nyamira County providing a Medical Camp for the '
             'people of Nyamira to be screened, treated and referred on various possible ailments. In partnership with '
             'other like-minded organizations like Stima Sacco, Stanbic bank and Elite Savers CBO, Kisii University '
             'proudly',
  'plain_text': 'Kisii University today took its extension activities to Nyamira County providing a Medical Camp for '
                'the people of Nyamira to be screened, treated and referred on various possible ailments. In '
                'partnership with other like-minded organizations like Stima Sacco, Stanbic bank and Elite Savers CBO, '
                'Kisii University proudly took care and nurture to the grassroots and impacted many people. Kisii '
                'University continues to aspire to be the best by collaborating and forming synergistic alliances with '
                'strategically aligned organizations.',
  'published_at': '2025-06-28T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/nyamira-county-medical-camp',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/Rg8jkCetXwC2Z1TrC6PJuYWlzySNpmdnAErgUpWb.jpg',
  'display_order': 147,
  'is_featured': False},
 {'title': 'Grand Finale of the Non-Communicable Diseases and Humanitarian Medicine Conference',
  'category': 'NEWS',
  'summary': 'In a vibrant celebration of culture, elegance, and unity, the Kisii University community came together '
             'with our international guests for a memorable networking dinner marking the grand finale of an eventful '
             'week of the Summer School Program and the Non-Communicable Diseases and Humanitarian Medicine '
             'Conference. As we',
  'plain_text': 'In a vibrant celebration of culture, elegance, and unity, the Kisii University community came '
                'together with our international guests for a memorable networking dinner marking the grand finale of '
                'an eventful week of the Summer School Program and the Non-Communicable Diseases and Humanitarian '
                'Medicine Conference. As we reflect on the enriching experiences shared, we look ahead with optimism '
                'to a future of stronger connections and distinguished global partnerships.',
  'published_at': '2025-06-28T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/grand-finale-of-the-non-communicable-diseases-and-humanitarian-medicine-conference',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/vyZQQmaah4Xpo4ZxoLTWRSRy4WFnTYEbN8M1B0Vn.jpg',
  'display_order': 148,
  'is_featured': False},
 {'title': 'NCDS and Humanitarian Medicine Conference Roundtables',
  'category': 'NEWS',
  'summary': 'As we look into opening the NCDS and Humanitarian Medicine Conference. Take a look at what we have for '
             'you in the roundtables corners today. The discourse is next level. Welcome all',
  'plain_text': 'As we look into opening the NCDS and Humanitarian Medicine Conference. Take a look at what we have '
                'for you in the roundtables corners today. The discourse is next level. Welcome all',
  'published_at': '2025-06-25T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ncds-and-humanitarian-medicine-conference-roundtables',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/wjY0002HI0zjI9r0Z47HRFFFCKHdV0UeKbEYsE6R.jpg',
  'display_order': 149,
  'is_featured': False},
 {'title': 'NCD’s and Humanitarian Medicine Conference',
  'category': 'NEWS',
  'summary': 'The Non-Communicable Diseases and Humanitarian Medicine Conference commenced at the Main Campus. '
             'Bringing together strategic partners from across the globe, the conference seeks to foster a sustained '
             'and in-depth dialogue on the future of medicine. Kisii University continues to strengthen its niche in '
             'health sciences',
  'plain_text': 'The Non-Communicable Diseases and Humanitarian Medicine Conference commenced at the Main Campus. '
                'Bringing together strategic partners from across the globe, the conference seeks to foster a '
                'sustained and in-depth dialogue on the future of medicine. Kisii University continues to strengthen '
                'its niche in health sciences through meaningful collaboration with leading stakeholders in the field. '
                'Day 1 Medical Summer School Module Program Day 2 of the Medical Summer School Module Day 3 at the '
                'Medical Summer School Module Program',
  'published_at': '2025-06-25T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ncds-and-humanitarian-medicine-conference',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/17ycP6nzQ8B3FQ0tiGzXn0fNCN1jeWLHUCLBF60s.jpg',
  'display_order': 150,
  'is_featured': False},
 {'title': 'Day 3 at the Medical Summer School Module Program',
  'category': 'NEWS',
  'summary': 'Day three at the Medical Summer School Module Program continues to pick up pace at Kisii University. '
             'Enriched with deep and meaningful discourse on how to better provide a higher standard of care for '
             'patients and provide shared knowledge for physicians to continue evolving medical interventions. Kisii '
             'University is on',
  'plain_text': 'Day three at the Medical Summer School Module Program continues to pick up pace at Kisii University. '
                'Enriched with deep and meaningful discourse on how to better provide a higher standard of care for '
                'patients and provide shared knowledge for physicians to continue evolving medical interventions. '
                'Kisii University is on a steady rise and much closer to perfecting its health science niche on a '
                'global stage Day 1 Medical Summer School Module Program Day 2 of the Medical Summer School Module',
  'published_at': '2025-06-21T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/day-3-at-the-medical-summer-school-module-program',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/O1KXHQGFiEwPMUZIC3Eh13BT4hiCtd0OoPzLxRZS.jpg',
  'display_order': 151,
  'is_featured': False},
 {'title': 'Day 2 of the Medical Summer School Module',
  'category': 'NEWS',
  'summary': 'Day two of the Medical Summer School Module closed beautifully with a trail of productive discussions, '
             'networking and thought collaborations behind it. Its yet another beautiful win for Kisii University,s '
             'Internationalization Agenda. Thumbs partners to our wonderful partners from the University of '
             'Manchester, Medecins',
  'plain_text': 'Day two of the Medical Summer School Module closed beautifully with a trail of productive '
                'discussions, networking and thought collaborations behind it. Its yet another beautiful win for Kisii '
                'University,s Internationalization Agenda. Thumbs partners to our wonderful partners from the '
                'University of Manchester, Medecins Sans Frontie,res/ Doctors Without Borders (MSF) and Liverpool '
                'School of Tropical Medicine',
  'published_at': '2025-06-21T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/day-2-of-the-medical-summer-school-module',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/8xPiP8kpxIruDHHM5Utig2gRvwGDtBtVF3B2aNmW.jpg',
  'display_order': 152,
  'is_featured': False},
 {'title': 'North Carolina State University at KSU',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor hosted North Carolina State University on Campus today seeking to engage on a '
             'wonderful collaborative journey with Kisii University on extension services to the various communities '
             'around us. Further strengthening the Internationalization agenda of Kisii University, the VC was excited '
             'to lead KSU',
  'plain_text': 'The Vice Chancellor hosted North Carolina State University on Campus today seeking to engage on a '
                'wonderful collaborative journey with Kisii University on extension services to the various '
                'communities around us. Further strengthening the Internationalization agenda of Kisii University, the '
                'VC was excited to lead KSU into this exciting program that will benefit hundreds of farmers from '
                'Kisii County and the greater lake region. Kisii University continues to brighten the social impact '
                'bulb.',
  'published_at': '2025-06-21T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/north-carolina-state-university-at-ksu',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/vPysh9Bly1T3GMgWeRHgWxOrBwtmE6qCu0oQ0kw7.jpg',
  'display_order': 153,
  'is_featured': False},
 {'title': 'Commission for University Education at KSU',
  'category': 'NEWS',
  'summary': 'The Commission for University Education was on Campus inspecting our upgraded facilities that enable us '
             'to offer world class Academic Programmes to our students. Kisii University continues to coin an '
             'unbeatable infrastructure complex, aimed at delivering quality education, facilitating unmatched '
             'research activities',
  'plain_text': 'The Commission for University Education was on Campus inspecting our upgraded facilities that enable '
                'us to offer world class Academic Programmes to our students. Kisii University continues to coin an '
                'unbeatable infrastructure complex, aimed at delivering quality education, facilitating unmatched '
                'research activities and enabling impeccable community outreaches.',
  'published_at': '2025-06-21T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/commission-for-university-education-at-ksu',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/0Wp4pGvN09t1jo3uYOP7xdC4uC09IBU5StmkrnO6.jpg',
  'display_order': 154,
  'is_featured': False},
 {'title': 'Day 1 Medical Summer School Module Program',
  'category': 'NEWS',
  'summary': '15 different countries from all four corners of the world converged in Kisii University for the Medical '
             'Summer School Module Program. Kisii University, University of Manchester and Medecins Sans Frontier,es/ '
             'Doctors Without Borders (MSF) have all embarked on this wonderful sojourn together. The Vice Chancellor',
  'plain_text': '15 different countries from all four corners of the world converged in Kisii University for the '
                'Medical Summer School Module Program. Kisii University, University of Manchester and Medecins Sans '
                'Frontier,es/ Doctors Without Borders (MSF) have all embarked on this wonderful sojourn together. The '
                'Vice Chancellor officially opened the program not only clearing a path for knowledge exchange but '
                'creating a new platform for networking and integration.',
  'published_at': '2025-06-21T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/day-1-medical-summer-school-module-program',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/uIzxkfD5zBVmw0nrtjpUgvyImF7HU7qImXsWLhCW.jpg',
  'display_order': 155,
  'is_featured': False},
 {'title': 'Kisii University hosts Agritech Exposé',
  'category': 'NEWS',
  'summary': 'Kisii University proudly hosted the 2025 edition of the Agritech ExposÃƒÆ’Ã‚Â© at the Main Campus '
             'ChancellorÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢s Pavilion. The event brought together over 1,600 participants, including '
             'farmers, young learners, and key stakeholders in the agricultural sector. It served as a vibrant '
             'platform for sharing',
  'plain_text': 'Kisii University proudly hosted the 2025 edition of the Agritech ExposÃƒÆ’Ã‚Â© at the Main Campus '
                'ChancellorÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢s Pavilion. The event brought together over 1,600 participants, including '
                'farmers, young learners, and key stakeholders in the agricultural sector. It served as a vibrant '
                'platform for sharing experiences, exchanging knowledge, networking, and showcasing the latest best '
                'practices in Agritech. Kisii University remains a beacon of knowledge, a hub of innovation, and a '
                'true fountain of borderless knowledge.',
  'published_at': '2025-06-19T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-hosts-agritech-expose',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/4IAy7hY5HIlvFAMxlRqCVxueLbB9X47mhbzjKNAz.jpg',
  'display_order': 156,
  'is_featured': False},
 {'title': 'Medical Summer School Program and Médecins Sans Frontières Conference',
  'category': 'NEWS',
  'summary': 'A heartbeat away from this year,s Medical Summer School Program and a joint Conference with Medecins '
             'Sans Frontires/ Doctors Without Borders (MSF) following closely behind, the Vice Chancellor on top of '
             'the preparations drove the agenda of ensuring Kisii University,s Internationalization agenda was top on '
             'the list of',
  'plain_text': 'A heartbeat away from this year,s Medical Summer School Program and a joint Conference with Medecins '
                'Sans Frontires/ Doctors Without Borders (MSF) following closely behind, the Vice Chancellor on top of '
                'the preparations drove the agenda of ensuring Kisii University,s Internationalization agenda was top '
                'on the list of priorities. Health Science being Kisii University,s niche, every passing day we are '
                'driving change by opening new frontiers supporting our faculty and students in their respective '
                'programs.',
  'published_at': '2025-06-17T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/medical-summer-school-program-and-medecins-sans-frontieres-conference',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/pxUcwM8qSTYNCOnsKSd1o0mKexdTrDj4u4TH0XbH.jpg',
  'display_order': 157,
  'is_featured': False},
 {'title': 'Kisii University 2025 Brochure',
  'category': 'NEWS',
  'summary': 'Take a look at our current courses and see which one is a great fit for you. To apply scan the QR Code '
             'and join our borderless and inclusive University. Download Kisii University 2025 Brochure Online '
             'Application Link',
  'plain_text': 'Take a look at our current courses and see which one is a great fit for you. To apply scan the QR '
                'Code and join our borderless and inclusive University. Download Kisii University 2025 Brochure Online '
                'Application Link',
  'published_at': '2025-06-14T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-2025-brochure',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/wF4dnFh0tjwFI7GYV8464LFlAqto0xSL5w2Qw8fm.png',
  'display_order': 158,
  'is_featured': False},
 {'title': 'KSU tree planting exercise at Nyosia',
  'category': 'NEWS',
  'summary': 'Kisii University continues to take a leading role among its peers in the fight against climate change. '
             'Today, a tree planting exercise at Nyosia, where 16,000 trees were planted in collaboration with '
             'strategic partners and institutions from the greater Kisii region was a wonderful example. The '
             'University remains',
  'plain_text': 'Kisii University continues to take a leading role among its peers in the fight against climate '
                'change. Today, a tree planting exercise at Nyosia, where 16,000 trees were planted in collaboration '
                'with strategic partners and institutions from the greater Kisii region was a wonderful example. The '
                'University remains firmly committed to combating the effects of climate change through intentional '
                'and impactful initiatives tree planting being just one among many. We value the growing global '
                'recognition our efforts continue to bring to the University.',
  'published_at': '2025-06-14T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ksu-tree-planting-exercise-at-nyosia',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/2lqMcXEa3GgHIGsHGU53QfefC2YTYWf0sPLLkQkI.jpg',
  'display_order': 159,
  'is_featured': False},
 {'title': 'Integrity Workshop by Ethics and Anti-Corruption Commission (EACC)',
  'category': 'NEWS',
  'summary': 'Integrity, good governance, and morality were key themes at a remarkable Integrity Workshop led by the '
             'Vice Chancellor and attended by heads of various administrative and academic units in the University. '
             'The workshop, facilitated by a team from the Ethics and Anti-Corruption Commission (EACC), provided our',
  'plain_text': 'Integrity, good governance, and morality were key themes at a remarkable Integrity Workshop led by '
                'the Vice Chancellor and attended by heads of various administrative and academic units in the '
                'University. The workshop, facilitated by a team from the Ethics and Anti-Corruption Commission '
                '(EACC), provided our departmental heads with timely and essential insights on how to curb corruption '
                'in the workplace while promoting a culture of integrity and ethical conduct among staff. Kisii '
                'University remains committed to implementing sound governance strategies to enhance its growth and '
                'excellence in both academic and social spheres, locally and internationally',
  'published_at': '2025-06-10T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/integrity-workshop-by-ethics-and-anti-corruption-commission-eacc',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/4RMDIWmS0tpPeKba9MvJil68g9DqAfqjLS73mFah.jpg',
  'display_order': 160,
  'is_featured': False},
 {'title': 'CUE Conduct an Internationalization Survey',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor hosted a team from the Commission for University Education who are on Campus today '
             'conducting an Internationalization survey of the University and her activities. Kisii University under '
             'strong leadership from our Vice Chancellor has consistently advanced an intentional Internationalization '
             'agenda',
  'plain_text': 'The Vice Chancellor hosted a team from the Commission for University Education who are on Campus '
                'today conducting an Internationalization survey of the University and her activities. Kisii '
                'University under strong leadership from our Vice Chancellor has consistently advanced an intentional '
                'Internationalization agenda by linking, partnering and strategically aligning with international '
                'institutions of repute to globalize our services and academic programmes.',
  'published_at': '2025-06-05T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/cue-conduct-an-internationalization-survey',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/xEhCF0C6mTL3764bcOgNZfb9y1dsQWS2dDlrSVUd.jpg',
  'display_order': 161,
  'is_featured': False},
 {'title': 'Senior Kisii County Police Officers Train on Mental Health',
  'category': 'WORKSHOP',
  'summary': 'Senior Police Officers in Kisii County under the leadership of the County Police Commander today were on '
             'Campus engaged in an elaborate discourse on matters security as well as receiving mental health training '
             'on how to cope and manage trauma on the job. Kisii University through our Vice Chancellor continues to '
             'draw',
  'plain_text': 'Senior Police Officers in Kisii County under the leadership of the County Police Commander today were '
                'on Campus engaged in an elaborate discourse on matters security as well as receiving mental health '
                'training on how to cope and manage trauma on the job. Kisii University through our Vice Chancellor '
                'continues to draw into relevant government agencies forging meaningful strategic partnerships that '
                'support excellent University Governance.',
  'published_at': '2025-06-04T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/senior-kisii-county-police-officers-train-on-mental-health',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/lnyS4lkLqzHLRYJPu4L9BzUn5lEVpKWQwFOrdALB.jpg',
  'display_order': 162,
  'is_featured': False},
 {'title': 'Kisii County 2025 Super Scouts Competitions',
  'category': 'STUDENT LIFE',
  'summary': 'Our Scouts participated in the Kisii County 2025 Super Scouts Competitions and Rover Challenge and '
             'emerged winners beginning their run up journey to defend their National and East African Scouting '
             'Titles. The Scouts presented concepts and executed practical initiatives in environmental conservation, '
             'reproductive',
  'plain_text': 'Our Scouts participated in the Kisii County 2025 Super Scouts Competitions and Rover Challenge and '
                'emerged winners beginning their run up journey to defend their National and East African Scouting '
                'Titles. The Scouts presented concepts and executed practical initiatives in environmental '
                'conservation, reproductive health, technology and climate change programs. Kisii University continues '
                'to shine in various academic, social and talent based programs involving her students',
  'published_at': '2025-06-04T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-county-2025-super-scouts-competitions',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/GA7VGbf41dzLBnqqn0r6yIz8909tNsLpy9Cac3sY.jpg',
  'display_order': 163,
  'is_featured': False},
 {'title': 'KSU donates Computers to Ibacho High School and Ebachwa Primary School.',
  'category': 'COMMUNITY OUTREACH',
  'summary': 'Kisii University donated Computers to the Laboratories of Ibacho High School and Ebachwa Primary School. '
             'This goes a long way to help the Schools impart the right technological skills in the young students '
             'preparing them adequately to not only exist but thrive in a world that immensely leverages on technology '
             'and',
  'plain_text': 'Kisii University donated Computers to the Laboratories of Ibacho High School and Ebachwa Primary '
                'School. This goes a long way to help the Schools impart the right technological skills in the young '
                'students preparing them adequately to not only exist but thrive in a world that immensely leverages '
                'on technology and Artificial Intelligence. Kisii University continues to strive to make a difference '
                'not only in her staff students but in the community as well.',
  'published_at': '2025-05-29T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ksu-donates-computers-to-ibacho-high-school-and-ebachwa-primary-school',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/ezN0ixhrGhfpf58NG0Ph32j6qLB6zEyYJO4KYIUi.jpg',
  'display_order': 164,
  'is_featured': False},
 {'title': 'KCB Bank MD visits KSU',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor hosted, the MD OF KCB Bank, Ms. Annastacia Kimtai and her team on an official visit '
             'to the University. The team had a wonderful discourse on various cross-point projects where KCB and '
             'Kisii University can partner in, like internship opportunities for our students and beautification of '
             'River',
  'plain_text': 'The Vice Chancellor hosted, the MD OF KCB Bank, Ms. Annastacia Kimtai and her team on an official '
                'visit to the University. The team had a wonderful discourse on various cross-point projects where KCB '
                'and Kisii University can partner in, like internship opportunities for our students and '
                'beautification of River Nyakomisaro, that passes through Kisii University among many others. Kisii '
                'University continues active discussion with our renewed partners to continue creating mutually '
                'beneficial programs for the benefit of the society.',
  'published_at': '2025-05-27T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kcb-bank-md-visits-ksu',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/iU5S1us4ESuKHGBNqo881f0y60ngOSNfNqIhkvyP.jpg',
  'display_order': 165,
  'is_featured': False},
 {'title': 'Kenya Library and Information Services Consortium holds AGM at KSU',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor hosted leaders and members from the Kenya Library and Information Services '
             'Consortium who were conducting their Annual General Meeting on Campus. The Consortium facilitates access '
             'to knowledge through collective subscription to electronic resources and they have ranked Kisii '
             'University among the',
  'plain_text': 'The Vice Chancellor hosted leaders and members from the Kenya Library and Information Services '
                'Consortium who were conducting their Annual General Meeting on Campus. The Consortium facilitates '
                'access to knowledge through collective subscription to electronic resources and they have ranked '
                'Kisii University among the top three utilizers in our Country. Kisii University continues to '
                'co-create a wonderful future by working with like-minded organizations.',
  'published_at': '2025-05-27T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kenya-library-and-information-services-consortium-holds-agm-at-ksu',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/rGvLlR3iXbSFqJ228COFRG88KrYQBIqR04WyfVKm.jpg',
  'display_order': 166,
  'is_featured': False},
 {'title': 'Machakos University is on Campus',
  'category': 'NEWS',
  'summary': 'Machakos University is on Campus today benchmarking on how they can improve and optimize their admission '
             'process. Kisii University was much obliged, being the golden standard in efficient and effective student '
             'handling. By leveraging on various technological tools the University conducted last year,s admission of '
             'over',
  'plain_text': 'Machakos University is on Campus today benchmarking on how they can improve and optimize their '
                'admission process. Kisii University was much obliged, being the golden standard in efficient and '
                'effective student handling. By leveraging on various technological tools the University conducted '
                'last year,s admission of over 6,000 students in just 4 hours. Kisii University continues to work '
                'towards the betterment of her systems and structures to become even bigger and better.',
  'published_at': '2025-05-21T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/machakos-university-is-on-campus',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/gy6UqkB9kee4YUAixlPAaeXmL4B6UlQ67BmlviiQ.jpg',
  'display_order': 167,
  'is_featured': False},
 {'title': 'Kenya Libraries and Information Services at KSU',
  'category': 'NEWS',
  'summary': 'The Kenya Libraries and Information Services Consortium Governing Council paid a courtesy call to the '
             'Ag. DVC APF as they prepare to start a three day conference that will help advance research, information '
             'services and innovations. Kisii University has been ranked among the top three Universities in the '
             'Country that',
  'plain_text': 'The Kenya Libraries and Information Services Consortium Governing Council paid a courtesy call to the '
                'Ag. DVC APF as they prepare to start a three day conference that will help advance research, '
                'information services and innovations. Kisii University has been ranked among the top three '
                'Universities in the Country that records the highest use of e-resources by our students and staff, a '
                'reflection of impressive learning and research activities taking place here.',
  'published_at': '2025-05-21T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kenya-libraries-and-information-services-at-ksu',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/JKNumqFJZXJHmetIYVJssPjzjfHWUqcIjnlCAxja.jpg',
  'display_order': 168,
  'is_featured': False},
 {'title': 'IPUUCF technical team at Maasai Mara University',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor joined fellow Vice Chancellors who are members of the IPUUCF technical team at '
             'Maasai Mara University. These meetings continue to provide decent perspective for the team as they seek '
             'to continue improving University governance and operations across all levels. Kisii University remains '
             'proud to',
  'plain_text': 'The Vice Chancellor joined fellow Vice Chancellors who are members of the IPUUCF technical team at '
                'Maasai Mara University. These meetings continue to provide decent perspective for the team as they '
                'seek to continue improving University governance and operations across all levels. Kisii University '
                'remains proud to actively support and promote positive, collaborative engagement on these important '
                'matters',
  'published_at': '2025-05-21T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ipuucf-technical-team-at-maasai-mara-university',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/3qvZbvVSQQOtRumMo4TtQZ9YmqQS3cYUU260lxQ7.jpg',
  'display_order': 169,
  'is_featured': False},
 {'title': 'University of Minnesota Conducts a Rural Leadership Training Program',
  'category': 'COMMUNITY OUTREACH',
  'summary': 'The Vice Chancellor today hosted a delegation from the University of Minnesota, USA currently in Kisii '
             'University conducting a rural leadership training program for the community. Kisii University continues '
             'to broaden its horizon reaching out to international stakeholders as it continues attaining and '
             'achieving its',
  'plain_text': 'The Vice Chancellor today hosted a delegation from the University of Minnesota, USA currently in '
                'Kisii University conducting a rural leadership training program for the community. Kisii University '
                'continues to broaden its horizon reaching out to international stakeholders as it continues attaining '
                'and achieving its internationalization agenda.',
  'published_at': '2025-05-13T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/university-of-minnesota-conducts-a-rural-leadership-training-program',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/qr1jKEbTOjpdZudICkmAszdCafn5VY9ianCt5e1v.jpg',
  'display_order': 170,
  'is_featured': False},
 {'title': 'Free Medical camp',
  'category': 'STUDENT LIFE',
  'summary': 'Kisii University conducted a Free Medical camp for the Kisii, Nyamira and other surrounding communities. '
             'In a world plagued by different diseases and ailments, early detection and intervention is a key and '
             'necessary strategy that can help you mitigate effects of various diseases. Kisii University continues to '
             'be on',
  'plain_text': 'Kisii University conducted a Free Medical camp for the Kisii, Nyamira and other surrounding '
                'communities. In a world plagued by different diseases and ailments, early detection and intervention '
                'is a key and necessary strategy that can help you mitigate effects of various diseases. Kisii '
                'University continues to be on the front line in promoting the health agenda not only here at home but '
                'internationally as well.',
  'published_at': '2025-05-13T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/free-medical-camp',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/jNEmUUnqNSDdFVg70V8O1RQXRvN25BUX3iBIv2DP.jpg',
  'display_order': 171,
  'is_featured': False},
 {'title': 'Kisii Central Police Commander visits KSU',
  'category': 'NEWS',
  'summary': 'The new Kisii Central Sub-County Police Commander paid the Vice Chancellor a courtesy call today as he '
             'is on a familiarization tour of his new command. Among many things they discussed Security governance '
             'matters regarding our students, there area of residence and operational corners. This will help put an '
             'early start',
  'plain_text': 'The new Kisii Central Sub-County Police Commander paid the Vice Chancellor a courtesy call today as '
                'he is on a familiarization tour of his new command. Among many things they discussed Security '
                'governance matters regarding our students, there area of residence and operational corners. This will '
                'help put an early start to preparations of this year,s batch of first years as the university '
                'continues to prepare in every aspect to receive and accommodate them.',
  'published_at': '2025-04-24T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-central-police-commander-visits-ksu',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/jhMJM3IbA1OrBzBWcr9NULYaBilz7Su0Yu3tLa6R.jpg',
  'display_order': 174,
  'is_featured': False},
 {'title': 'Global Kiswahili Conference',
  'category': 'NEWS',
  'summary': 'Internationalizing Kisii University being key on his agenda, the Vice Chancellor met a team from the '
             'Kiswahili Association of East Africa keen on hosting the next Global Kiswahili Conference here at Kisii '
             'University. The conference will draw participants on a global scale from every Kiswahili speaking and '
             'teaching',
  'plain_text': 'Internationalizing Kisii University being key on his agenda, the Vice Chancellor met a team from the '
                'Kiswahili Association of East Africa keen on hosting the next Global Kiswahili Conference here at '
                'Kisii University. The conference will draw participants on a global scale from every Kiswahili '
                'speaking and teaching nation and territory. From the front, the VC led collaboration meetings and a '
                'field study with partners to ensure Kisii University not only delivers a world class event but is '
                'keen on its organic effects as well. The work starts now.',
  'published_at': '2025-04-24T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/global-kiswahili-conference',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/bfw5TYCbAXr9hKdR5MsBjwn2qrCvkLgQAF5VJsGd.jpg',
  'display_order': 175,
  'is_featured': False},
 {'title': 'KSU Vacancies',
  'category': 'VACANCIES',
  'summary': 'Normal 0 false false false EN-US ZH-CN X-NONE /* Style Definitions */ table.MsoNormalTable '
             '{mso-style-name:"Table Normal"; mso-tstyle-rowband-size:0; mso-tstyle-colband-size:0; '
             'mso-style-noshow:yes; mso-style-priority:99; mso-style-parent:""; mso-padding-alt:0cm 5.4pt 0cm 5.4pt; '
             'mso-para-margin:0cm;',
  'plain_text': 'Normal 0 false false false EN-US ZH-CN X-NONE /* Style Definitions */ table.MsoNormalTable '
                '{mso-style-name:"Table Normal"; mso-tstyle-rowband-size:0; mso-tstyle-colband-size:0; '
                'mso-style-noshow:yes; mso-style-priority:99; mso-style-parent:""; mso-padding-alt:0cm 5.4pt 0cm '
                '5.4pt; mso-para-margin:0cm; mso-para-margin-bottom:.0001pt; mso-pagination:widow-orphan; '
                'font-size:10.0pt; font-family:"Calibri",sans-serif; mso-ascii-font-family:Calibri; '
                'mso-ascii-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; '
                'mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi;} table.MsoTableGrid '
                '{mso-style-name:"Table Grid"; mso-tstyle-rowband-size:0; mso-tstyle-colband-size:0; '
                'mso-style-priority:59; mso-style-unhide:no; border:solid windowtext 1.0pt; mso-border-alt:solid '
                'windowtext .5pt; mso-padding-alt:0cm 5.4pt 0cm 5.4pt; mso-border-insideh:.5pt solid windowtext; '
                'mso-border-insidev:.5pt solid windowtext; mso-para-margin:0cm; mso-para-margin-bottom:.0001pt; '
                'mso-pagination:widow-orphan; font-size:10.0pt; font-family:"Calibri",sans-serif; '
                'mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; mso-hansi-font-family:Calibri; '
                'mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New Roman"; '
                'mso-bidi-theme-font:minor-bidi;} In pursuit of its mission and mandate, Kisii University wishes to '
                'invite applications from suitable candidates to fill the following positions: VISIT CAREERS PORTAL '
                'FOR MORE SCHOOL OF ARTS AND SOCIAL SCIENCES DEPARTMENT OF LANGUAGES AND LINGUISTICS S/No. Position '
                'Grade No. of posts Specialization Ref. No. 1. Lecturer Twelve (12) One (1) Sign Language '
                'KSU/AC/SASS/LALI/03/01/25 2. Lecturer Twelve (12) One (1) Film Studies KSU/AC/SASS/LALI/03/02/25 3. '
                'Lecturer Twelve (12) One (1) French KSU/AC/SASS/LALI/03/03/25 4. Lecturer Twelve (12) One (1) Public '
                'Administration, Public Policy and Management KSU/AC/SASS/LALI03/04/25 5. Tutorial Fellow Eleven (11) '
                'One (1) French KSU/AC/SASS/LALI/03/05/25 6. Tutorial Fellow Eleven (11) One (1) English '
                'KSU/AC/SASS/LALI/03/06/25 7. Tutorial Fellow Eleven (11) One (1) Kiswahili KSU/AC/SASS/LALI/03/07/25 '
                'DEPARTMENT OF PSYCHOLOGY 8. Lecturer Twelve (12) Two (2) One (1) - Clinical Psychology - Counselling '
                'Psychology KSU/AC/SASS/LALI/03/08/25 SCHOOL OF EDUCATION AND HUMAN RESOURCE DEVELOPMENT DEPARTMENT OF '
                'SPECIAL NEEDS EDUCATION 9. Lecturer Twelve (12) One (1) post Special Needs Education '
                'KSU/AC/SEHRD/SNE/04/09/25 10. Tutorial Fellow Eleven (11) One (1) post Specia',
  'published_at': '2025-04-24T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ksu-vacancies',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/D6BqIrryGngsDxb17R89tqZxojVSQbDvQ6MBY8aH.jpg',
  'display_order': 176,
  'is_featured': False},
 {'title': 'Summer School Module and MSF Conference',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor hosted an advance team inspecting our facilities in readiness for the forthcoming '
             'Summer School module and MSF Conference on NCD,S in Humanitarian setting. The events are being organized '
             'in partnership with the University of Manchester, Liverpool University MSF East Africa & MSF United '
             'Kingdom.',
  'plain_text': 'The Vice Chancellor hosted an advance team inspecting our facilities in readiness for the forthcoming '
                'Summer School module and MSF Conference on NCD,S in Humanitarian setting. The events are being '
                'organized in partnership with the University of Manchester, Liverpool University MSF East Africa & '
                'MSF United Kingdom. This is the first time this conference will take place in Africa and Kisii '
                'University is proud to be expanding its horizons and capabilities to collaborate internationally.',
  'published_at': '2025-04-17T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/summer-school-module-and-msf-conference',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/78HhzTbK8IwbELFUXGc4ZLPMmMh2L8vqLGGlYEiH.jpg',
  'display_order': 177,
  'is_featured': False},
 {'title': 'IPUUCF Technical Team visits KSU',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor hosted colleague VC,s who are members of the IPUUCF technical team at the '
             'University. The team was on Campus to appreciate and interrogate progress made on various negotiations '
             'affecting Staff welfare matters. Positive engagement on matters welfare for our staff is something Kisii '
             'University is',
  'plain_text': 'The Vice Chancellor hosted colleague VC,s who are members of the IPUUCF technical team at the '
                'University. The team was on Campus to appreciate and interrogate progress made on various '
                'negotiations affecting Staff welfare matters. Positive engagement on matters welfare for our staff is '
                'something Kisii University is proud to have supported.',
  'published_at': '2025-04-17T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ipuucf-technical-team-visits-ksu',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/wwaiHJunILk5k2p1bIhh4MKJJX0YK7EU6LWVQ4E8.jpg',
  'display_order': 178,
  'is_featured': False},
 {'title': 'World Directory of Medical Schools',
  'category': 'ABOUT',
  'summary': 'https://www.wdoms.org/',
  'plain_text': 'https://www.wdoms.org/',
  'published_at': '2025-04-14T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/world-directory-of-medical-schools',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/nbs1HsOc9d9Kf1TGPt88FNw6JM5M4UW5GnFJZU2U.png',
  'display_order': 179,
  'is_featured': False},
 {'title': 'PROVISION OF CONSULTANCY SERVICES',
  'category': 'TENDERS',
  'summary': 'Tender Document',
  'plain_text': 'Tender Document',
  'published_at': '2025-04-11T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/provision-of-consultancy-services',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/4LCfJI6oyzPRuvAqWWq1OFw4EWi5oPSUkCavkaJm.jpg',
  'display_order': 180,
  'is_featured': False},
 {'title': 'Public Participation: New funding Model & Student Appeal mechanism',
  'category': 'PUBLIC NOTIFICATION',
  'summary': 'It is a wonderful Friday to give your views on the New Funding Model & Student Appeal mechanism, have '
             'your voice heard and contribute towards making the model better and more inclusive',
  'plain_text': 'It is a wonderful Friday to give your views on the New Funding Model & Student Appeal mechanism, have '
                'your voice heard and contribute towards making the model better and more inclusive',
  'published_at': '2025-04-04T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/public-participation-new-funding-model-student-appeal-mechanism',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/QI5EKyVdYTZeXtt4c1Wq28PSJ6J5yqzvOaqb5P97.png',
  'display_order': 183,
  'is_featured': False},
 {'title': 'KUCCPS Portal Now Open Apply Now',
  'category': 'NEWS',
  'summary': 'https://students.kuccps.net/login/',
  'plain_text': 'https://students.kuccps.net/login/',
  'published_at': '2025-03-30T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kuccps-portal-now-open-apply-now',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/6Zcu1INF7HKd7Www5uAdIB7Zn06YAz4WS5kJlPnV.jpg',
  'display_order': 184,
  'is_featured': False},
 {'title': 'KSU Community Outreach Masimba Sub-County Hospital',
  'category': 'STUDENT LIFE',
  'summary': 'Reaching out to support our community, the University through the Corporate Communications office with '
             'our students led a clean-up exercise at Masimba Sub-County Hospital. The exercise involved a wholesome '
             'clean up of the entire hospital premises as well as donation of fruits and vegetables to support the '
             'nutrition of',
  'plain_text': 'Reaching out to support our community, the University through the Corporate Communications office '
                'with our students led a clean-up exercise at Masimba Sub-County Hospital. The exercise involved a '
                'wholesome clean up of the entire hospital premises as well as donation of fruits and vegetables to '
                'support the nutrition of the patients on premise. Kisii University continues to ensure that its '
                'existence continuously benefits the surrounding society in many a different ways',
  'published_at': '2025-03-24T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ksu-community-outreach-masimba-sub-county-hospital',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/8lc5WsIZ8Gs0UB9F0UV0mZcXWds4N97CZA7QemiL.jpg',
  'display_order': 187,
  'is_featured': False},
 {'title': 'KSU President’s Award Club',
  'category': 'STUDENT LIFE',
  'summary': 'In just five days, our students from the President,s Award Club connected Obolo Comprehensive School to '
             'the local water grid giving hundreds of pupils access to clean water in the School, installed doors on '
             'their classrooms, vastly improving the learning conditions of the kids and painted the School giving the '
             'pupils',
  'plain_text': 'In just five days, our students from the President,s Award Club connected Obolo Comprehensive School '
                'to the local water grid giving hundreds of pupils access to clean water in the School, installed '
                'doors on their classrooms, vastly improving the learning conditions of the kids and painted the '
                'School giving the pupils a sense of pride and love for their School. These actions largely inspired '
                'not only the pupils but the community of Obolo area who immensely appreciated the much needed '
                'support. Our students are currently in pursuit of their Gold Award Program and are performing '
                'inspirational acts, learning from them and generating massive social impact.',
  'published_at': '2025-03-19T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ksu-presidents-award-club',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/5XFJYqCl0JcuXb9PghAyWGTCuHxkfxVhN3UP0XeA.jpg',
  'display_order': 188,
  'is_featured': False},
 {'title': 'Workshop On Referencing Management Tools',
  'category': 'ACADEMICS',
  'summary': 'The Department of Computing in the School of Information Science & Technology held a capacity building '
             'workshop on referencing management tools. This was a short skills-builder that enhanced their '
             'capabilities of leveraging on tools like Zotero and APA and improved the quality of their academic '
             'assessments. Kisii',
  'plain_text': 'The Department of Computing in the School of Information Science & Technology held a capacity '
                'building workshop on referencing management tools. This was a short skills-builder that enhanced '
                'their capabilities of leveraging on tools like Zotero and APA and improved the quality of their '
                'academic assessments. Kisii University takes pride in supporting its staff reach out and continually '
                'increase their betterment in service delivery.',
  'published_at': '2025-03-19T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/workshop-on-referencing-management-tools',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/ZcnlCe5MrrekSeugvRAnSdFLCgDzDNwDQdgkuf3e.jpg',
  'display_order': 189,
  'is_featured': False},
 {'title': 'KSU, French Embassy and Kifaransa village hosts Francophonie Month Celebrations',
  'category': 'ARTS & CULTURE',
  'summary': 'Kisii University in partnership with Kifaransa village and the French Embassy hosted the French day '
             'Celebrations in recognition of the Francophonie Month here in Kisii University. This is an annual '
             'celebration held in March to honour the French language and the diverse cultures of the Francophonie the '
             'global community',
  'plain_text': 'Kisii University in partnership with Kifaransa village and the French Embassy hosted the French day '
                'Celebrations in recognition of the Francophonie Month here in Kisii University. This is an annual '
                'celebration held in March to honour the French language and the diverse cultures of the Francophonie '
                'the global community of French-speaking countries. It was a great opportunity to promote linguistic '
                'and cultural exchange not only in the University but through the hundreds of High School Students '
                'that participated positioning the university as an authority in this matters. Kisii University '
                'continues to broaden her horizons while increase ng her influence and impact',
  'published_at': '2025-03-13T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ksu-french-embassy-and-kifaransa-village-hosts-francophonie-month-celebrations',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/ua7pmieRKAEs19nthOyayeIdC6Dzhh21pucPV67r.jpg',
  'display_order': 190,
  'is_featured': False},
 {'title': 'Old Mutual Group hosts Financial Literacy and Education Workshop',
  'category': 'BUSINESS & ECONOMICS',
  'summary': 'Kisii University Staff led by the Office of the Registrar Administration Human Resource and Central '
             'Services were treated to a financial literacy and education training by the Old Mutual Group. The '
             'training benefited our staff who were able to reflect on various opportunities to enforce fiscal '
             'discipline in their',
  'plain_text': 'Kisii University Staff led by the Office of the Registrar Administration Human Resource and Central '
                'Services were treated to a financial literacy and education training by the Old Mutual Group. The '
                'training benefited our staff who were able to reflect on various opportunities to enforce fiscal '
                'discipline in their lives but also maximize investment opportunities to increase their revenue. Kisii '
                'University continues to create conducive opportunities for her employees in order to ensure a stable, '
                'disciplined, ambitious and hardworking workforce.Â',
  'published_at': '2025-03-13T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/old-mutual-group-hosts-financial-literacy-and-education-workshop',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/UUmaKwmqcIdkeB6bHDj0KGbcjiqi6RRsffeAa154.jpg',
  'display_order': 193,
  'is_featured': False},
 {'title': 'KSU Scouts',
  'category': 'STUDENT LIFE',
  'summary': 'Completing six months of intensive training, 52 new Scouts were invested and graduated officially this '
             'weekend in an inspiring Ceremony beside the grave of Baden Powel( Founder of Scouting) in Nyeri, Kenya. '
             'This rigorous and intensive training continues to ensure that Kisii University produces top rate scouts '
             'who',
  'plain_text': 'Completing six months of intensive training, 52 new Scouts were invested and graduated officially '
                'this weekend in an inspiring Ceremony beside the grave of Baden Powel( Founder of Scouting) in Nyeri, '
                'Kenya. This rigorous and intensive training continues to ensure that Kisii University produces top '
                'rate scouts who compete against the best in the Country and win while the more maintaining high '
                'levels of character, discipline, good service and order.',
  'published_at': '2025-03-10T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ksu-scouts',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/9TE8WFvP7CQ2iqk3hKyyd9Yfg5LMZut5mjr0Hykq.jpg',
  'display_order': 194,
  'is_featured': False},
 {'title': 'KSU Donates Mattresses to Nyosia Mixed Secondary',
  'category': 'NEWS',
  'summary': 'Kisii University stood with Nyosia Mixed secondary donating 70 mattresses to the school after a fire had '
             'razed down the boys dormitory and paralyzed learning. In a wonderful event presided over by the '
             'Registrar AHRCS and the Schools Principal the University was able to demonstrate our borderless-ness and '
             'inclusivity',
  'plain_text': 'Kisii University stood with Nyosia Mixed secondary donating 70 mattresses to the school after a fire '
                'had razed down the boys dormitory and paralyzed learning. In a wonderful event presided over by the '
                'Registrar AHRCS and the Schools Principal the University was able to demonstrate our borderless-ness '
                'and inclusivity within our County by standing with our neighbours. Kisii University continues to '
                'connect, support and uplift our community for the better.',
  'published_at': '2025-03-10T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ksu-donates-mattresses-to-nyosia-mixed-secondary',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/LEg1BhcHd8b9Paq7Y9mSuEwCbC2DvGpc5behYQOj.jpg',
  'display_order': 195,
  'is_featured': False},
 {'title': 'KSU 10th Cultural Festival',
  'category': 'ARTS & CULTURE',
  'summary': 'With pompous colour, a taste of culture and radiant excitement, our students displayed a vivid '
             'imagination as they celebrated the cultural, gala with a unique preference for traditional food, songs '
             'and folklore. The 10th cultural festival is a reflection of not only how well knit the Kisii University '
             'family is but how',
  'plain_text': 'With pompous colour, a taste of culture and radiant excitement, our students displayed a vivid '
                'imagination as they celebrated the cultural, gala with a unique preference for traditional food, '
                'songs and folklore. The 10th cultural festival is a reflection of not only how well knit the Kisii '
                'University family is but how we revel in our diversity and use it to our advantage. Kisii University '
                'is indeed inclusive and borderless Day 1 KSU 10th Cultural Festival Day 2 KSU 10th Cultural Festival',
  'published_at': '2025-02-25T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ksu-10th-cultural-festival',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/r1JWIaL6XRyr5lI0Nt8OA3Ch83MOUCBqV2Q7XKRF.jpg',
  'display_order': 196,
  'is_featured': False},
 {'title': 'Day 2 KSU 10th Cultural Festival',
  'category': 'ARTS & CULTURE',
  'summary': 'With pompous colour, a taste of culture and radiant excitement, our students displayed a vivid '
             'imagination as they celebrated the cultural, gala with a unique preference for traditional food, songs '
             'and folklore. The 10th cultural festival is a reflection of not only how well knit the Kisii University '
             'family is but how',
  'plain_text': 'With pompous colour, a taste of culture and radiant excitement, our students displayed a vivid '
                'imagination as they celebrated the cultural, gala with a unique preference for traditional food, '
                'songs and folklore. The 10th cultural festival is a reflection of not only how well knit the Kisii '
                'University family is but how we revel in our diversity and use it to our advantage. Kisii University '
                'is indeed inclusive and borderless.',
  'published_at': '2025-02-21T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/day-2-ksu-10th-cultural-festival',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/Y8pR09jZpMmqgQE1TU3ccvsAsDcAaYmtZEpMgxX3.jpg',
  'display_order': 197,
  'is_featured': False},
 {'title': 'Day 1 KSU 10th Cultural Festival',
  'category': 'ARTS & CULTURE',
  'summary': 'The 10th Cultural Festival Celebrations kicked off to a jolly start with the DVC APF flagging of the '
             'procession carrying the message of inclusivity, diversity and tolerance right through the streets of '
             'Kisii town. The Kisii University community is geared up to celebrate art, food and poetry as it promotes '
             'talent and',
  'plain_text': 'The 10th Cultural Festival Celebrations kicked off to a jolly start with the DVC APF flagging of the '
                'procession carrying the message of inclusivity, diversity and tolerance right through the streets of '
                'Kisii town. The Kisii University community is geared up to celebrate art, food and poetry as it '
                'promotes talent and skills among its members',
  'published_at': '2025-02-20T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/day-1-ksu-10th-cultural-festival',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/GWNxdz4bc6KJXzieZeglBM8UeY7oIuyxwmB0yfoC.jpg',
  'display_order': 198,
  'is_featured': False},
 {'title': 'Kisii University 10th Cultural Festival Programme',
  'category': 'ARTS & CULTURE',
  'summary': 'Have a feel and a test of what we have in store for you . It will be a Cultural Festival to remember.',
  'plain_text': 'Have a feel and a test of what we have in store for you . It will be a Cultural Festival to remember.',
  'published_at': '2025-02-19T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-10th-cultural-festival-programme',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/rYFccRNAn02LokWlqOuzulfKdTjB0I5w13OuS2FM.jpg',
  'display_order': 199,
  'is_featured': False},
 {'title': 'University of Manchester',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor today, hosted a delegation from the University of Manchester currently in Kisii to '
             'extend the good work happening between our Institutions. Kisii University and the University of '
             'Manchester continue to engage in more ways than one to enhance and advance our exchange programs '
             'currently targeting our',
  'plain_text': 'The Vice Chancellor today, hosted a delegation from the University of Manchester currently in Kisii '
                'to extend the good work happening between our Institutions. Kisii University and the University of '
                'Manchester continue to engage in more ways than one to enhance and advance our exchange programs '
                'currently targeting our staff, students and exclusive learning content. Kisii University will '
                'continue to be an ardent driver of change locally, nationally and internationally.',
  'published_at': '2025-02-11T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/university-of-manchester',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/Y6g7Qlklq6EAvT4ILG8bu1hkakjvjatK1uHvlPto.jpg',
  'display_order': 200,
  'is_featured': False},
 {'title': 'Abasuba Community',
  'category': 'ARTS & CULTURE',
  'summary': 'The Vice Chancellor hosted elders from the Abasuba Community today with a strategic aim of working '
             'closely with them to help save the Suba language. The Suba language is an endangered tongue spoken in '
             'Kenya and the Kisii University Department of Languages are offering professional support to help '
             'rejuvenate it. Kisii',
  'plain_text': 'The Vice Chancellor hosted elders from the Abasuba Community today with a strategic aim of working '
                'closely with them to help save the Suba language. The Suba language is an endangered tongue spoken in '
                'Kenya and the Kisii University Department of Languages are offering professional support to help '
                'rejuvenate it. Kisii University will partner with the Abasuba Community on programs that can help '
                'cast life to the language, UNESCOâ€™s International Mother Language Day and the forthcoming Cultural '
                'Festivals being key immediate activities',
  'published_at': '2025-02-11T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/abasuba-community',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/4E1jLAIfZVpe1okk5MReOJBPZkWWVAJzHbXEy7dQ.jpg',
  'display_order': 202,
  'is_featured': False},
 {'title': 'KUSA Sports competition',
  'category': 'SPORTS & ATHLETICS',
  'summary': 'Displaying unique skill, unmatched endurance and God-given talent our students participated in the KUSA '
             'Sports competition scooping a variety of accolades and awards. Kisii University continues to sponsor the '
             'creation of an all rounded student who is good in the classroom, adventurous in activities and practical '
             'in',
  'plain_text': 'Displaying unique skill, unmatched endurance and God-given talent our students participated in the '
                'KUSA Sports competition scooping a variety of accolades and awards. Kisii University continues to '
                'sponsor the creation of an all rounded student who is good in the classroom, adventurous in '
                'activities and practical in programs.',
  'published_at': '2025-02-06T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kusa-sports-competition',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/USiYIKbrjxi5LViPfrj6VUXDTY49vNb9pMrSQJPN.jpg',
  'display_order': 203,
  'is_featured': False},
 {'title': 'World Wetland Day',
  'category': 'STUDENT LIFE',
  'summary': 'The School of Agriculture joined stakeholders spanning across the County to Celebrate the World Wetland '
             'day by further planting trees. These celebrations are key to igniting meaningful discussions across '
             'multisectoral partners to push the environmental agenda and Kisii University always has a front row '
             'seat.',
  'plain_text': 'The School of Agriculture joined stakeholders spanning across the County to Celebrate the World '
                'Wetland day by further planting trees. These celebrations are key to igniting meaningful discussions '
                'across multisectoral partners to push the environmental agenda and Kisii University always has a '
                'front row seat.',
  'published_at': '2025-02-06T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/world-wetland-day',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/bonA5gTVS8fSIHreOSyXnK9dEc30AFLX6ZzQhITe.jpg',
  'display_order': 204,
  'is_featured': False},
 {'title': 'Mentoring Kereri Girls High School',
  'category': 'STUDENT LIFE',
  'summary': 'Our Academic community builds the next generation of Scholars right from High School level by providing '
             'the right information, facts and opportunities to reshape their thinking and put them on a fast scale '
             'track towards desirable futures. We appreciate the good work done by the School of Agriculture at Kereri '
             'Girls',
  'plain_text': 'Our Academic community builds the next generation of Scholars right from High School level by '
                'providing the right information, facts and opportunities to reshape their thinking and put them on a '
                'fast scale track towards desirable futures. We appreciate the good work done by the School of '
                'Agriculture at Kereri Girls High School to advance our mandate in the eyes of those young scholars.',
  'published_at': '2025-01-28T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/mentoring-kereri-girls-high-school',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/0FgbQGX60BN0dCeLjl8ssIoN901sXrNhd0D0dAo1.jpg',
  'display_order': 206,
  'is_featured': False},
 {'title': 'KSU to participate in Athletics Kenya competitive races',
  'category': 'SPORTS & ATHLETICS',
  'summary': 'Four Kisii University students in riveting competitive races have qualified to represent Universities in '
             'Athletics Kenya races. The two ladies and gentlemen out performed their peers gracefully and are now '
             'headed into the big leagues to showcase their talents. Kisii University continues to nurture all rounded '
             'students',
  'plain_text': 'Four Kisii University students in riveting competitive races have qualified to represent Universities '
                'in Athletics Kenya races. The two ladies and gentlemen out performed their peers gracefully and are '
                'now headed into the big leagues to showcase their talents. Kisii University continues to nurture all '
                'rounded students with academic, social, talents and acquired & honed skills. We are proud and we wish '
                'them well',
  'published_at': '2025-01-28T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ksu-to-participate-in-athletics-kenya-competitive-races',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/TvYBgxLkSVPKFTsXSugX1sMk58iWKOTtlH4e1MtX.jpg',
  'display_order': 208,
  'is_featured': False},
 {'title': 'Kisii university student Handbook',
  'category': 'STUDENT LIFE',
  'summary': 'Kisii University Revised Handbook 2019',
  'plain_text': 'Kisii University Revised Handbook 2019',
  'published_at': '2025-01-16T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-student-handbook',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/AWMpgqmUFbTKXyE9AwoPlsEIQTfKklGx8eFlhIKy.jpg',
  'display_order': 210,
  'is_featured': False},
 {'title': 'Kisii University 13th Graduation LIVE Ceremony',
  'category': 'NEWS',
  'summary': 'Kisii University 13th Graduation LIVE Ceremony is published on the official Kisii University website.',
  'plain_text': 'Kisii University 13th Graduation LIVE Ceremony is published on the official Kisii University website.',
  'published_at': '2024-12-19T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-13th-graduation-live-ceremony',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/jqSLAzwuv7hP5SlnHbUL8dE5JGQHaUyDMeipLNIs.jpg',
  'display_order': 211,
  'is_featured': False},
 {'title': 'Kisii University 13th Graduation Ceremony',
  'category': 'NEWS',
  'summary': 'Kisii University welcomes you to the 13th Graduation Ceremony. Come and witness the celebration of '
             'knowledge beyond borders. Ksu Published 13th Graduation Booklet',
  'plain_text': 'Kisii University welcomes you to the 13th Graduation Ceremony. Come and witness the celebration of '
                'knowledge beyond borders. Ksu Published 13th Graduation Booklet',
  'published_at': '2024-12-11T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-13th-graduation-ceremony',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/8pT55YG10OSLfmKQAlhPIAjD6Xl2Q2DHkqDpixfD.jpg',
  'display_order': 212,
  'is_featured': False},
 {'title': 'KSU ACU holds Town hall meeting',
  'category': 'NEWS',
  'summary': 'The Kisii University Aids Control Unit had an elaborate and engaging Town hall meeting today aimed at '
             'promoting the well-being of men and boys in a rapidly changing social and cultural integrated society. '
             'The event created a safe space to engage in difficult conversations that affect our general mind, body '
             'and spirit',
  'plain_text': 'The Kisii University Aids Control Unit had an elaborate and engaging Town hall meeting today aimed at '
                'promoting the well-being of men and boys in a rapidly changing social and cultural integrated '
                'society. The event created a safe space to engage in difficult conversations that affect our general '
                'mind, body and spirit wellness and was attended by students, staff and other stakeholders. Kisii '
                'University continues to assume a leadership role in complex matters affecting our progressive society '
                'and assists our communities unpack this issues into simple programs.',
  'published_at': '2024-12-01T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ksu-acu-holds-town-hall-meeting',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/vC7Pz16LQjdMTGzpIURazQbtvnfGqGpsFqMeVy5o.jpg',
  'display_order': 213,
  'is_featured': False},
 {'title': 'Human Rights Lecture by Hon Justice Teresa Achieng Odera',
  'category': 'STUDENT LIFE',
  'summary': 'The Vice Chancellor hosted Hon Justice Teresa Achieng Odera, Judge of the High Court of Kenya, for a '
             'Public Lecture under the topic, Upholding human rights in a changing Kenya with focus on the use of '
             'technology in the administration of justice. Kisii University Students especially from our Law School '
             'benefited',
  'plain_text': 'The Vice Chancellor hosted Hon Justice Teresa Achieng Odera, Judge of the High Court of Kenya, for a '
                'Public Lecture under the topic, Upholding human rights in a changing Kenya with focus on the use of '
                'technology in the administration of justice. Kisii University Students especially from our Law School '
                'benefited immensely from her insights into this broad field. Kisii University continues to tap '
                'industry experts to enhance our Lecturers classroom teaching in a bid to produce wholesome students.',
  'published_at': '2024-11-27T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/human-rights-lecture-by-hon-justice-teresa-achieng-odera',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/PTQzh9o68Xo4OvDVHIeiExMOINcAHMB8PVZgYCMg.jpg',
  'display_order': 214,
  'is_featured': False},
 {'title': 'KSU Recieves 2M in Books and Equipments',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor today received a consignment of multidisciplinary academic materials from different '
             'benefactors working closely with our academic staff. The books and equipment, valued north of 2 million '
             'shillings were sort by members of the academic community and will be available to our students and '
             'researchers',
  'plain_text': 'The Vice Chancellor today received a consignment of multidisciplinary academic materials from '
                'different benefactors working closely with our academic staff. The books and equipment, valued north '
                'of 2 million shillings were sort by members of the academic community and will be available to our '
                'students and researchers seeking to explore their academic activities more broadly. Kisii University '
                'continues to seek, attain and retain global partnerships that support our various core mandates in '
                'the Country and beyond.',
  'published_at': '2024-11-18T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ksu-recieves-2m-in-books-and-equipments',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/zdxn1YTSoNlNZTe2zY8pAz34DFdkHwajUaDwY0Z0.jpg',
  'display_order': 215,
  'is_featured': False},
 {'title': 'Fake Memo to Students',
  'category': 'NEWS',
  'summary': 'Fake Memo to Students on the ongoing Lecturer Strike',
  'plain_text': 'Fake Memo to Students on the ongoing Lecturer Strike',
  'published_at': '2024-11-12T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/fake-memo-to-students',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/OPbkfhEsOWxt4H3JI2Ciup8HfB0AFS7ojDKtbTog.jpg',
  'display_order': 216,
  'is_featured': False},
 {'title': 'TENDER NOTICE OCT-NOV 2024/2025',
  'category': 'TENDERS',
  'summary': 'Kisii University was chartered in February 2013. It is headquartered in Kisii town, some 1.5 kilometers '
             'away from the town centre. The University invites tenders for: Normal 0 false false false EN-US X-NONE '
             'X-NONE /* Style Definitions */ table.MsoNormalTable {mso-style-name:"Table Normal"; '
             'mso-tstyle-rowband-size:0;',
  'plain_text': 'Kisii University was chartered in February 2013. It is headquartered in Kisii town, some 1.5 '
                'kilometers away from the town centre. The University invites tenders for: Normal 0 false false false '
                'EN-US X-NONE X-NONE /* Style Definitions */ table.MsoNormalTable {mso-style-name:"Table Normal"; '
                'mso-tstyle-rowband-size:0; mso-tstyle-colband-size:0; mso-style-noshow:yes; mso-style-priority:99; '
                'mso-style-parent:""; mso-padding-alt:0cm 5.4pt 0cm 5.4pt; mso-para-margin:0cm; '
                'mso-para-margin-bottom:.0001pt; mso-pagination:none; font-size:12.0pt; font-family:"Times New '
                'Roman",serif; mso-bidi-language:EN-US;} To download the tender documents, Visit Kisii University '
                'website (www.kisiiuniversity.ac.ke) or www.tenders.go.ke . Youth, Women and Persons with disabilities '
                'are encouraged to apply. Two (2) copies of bound completed and paginated tender documents (marked '
                'original and copy ) are to be enclosed in plain sealed envelopes marked with tender number and be '
                'deposited in the Tender Box at Kisii University main campus administration block and shall be '
                'addressed to: Vice Chancellor Kisii University P.O BOX 408-40200 KISII Procurement Portal Tender '
                'Documents KSU/T/08/2024 /2025 KSU/T/09/2024/2025 KSU/T/10/2024/2025 KSU/T/11/2024/2025 '
                'KSU/T/12/2024/2025',
  'published_at': '2024-10-31T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/tender-notice-oct-nov-20242025',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/x9Nw1SlDgdQzLCTr4IxyTmTFrEfcLAfWekYr8pwW.jpg',
  'display_order': 217,
  'is_featured': False},
 {'title': 'EIK International Environmental Conference',
  'category': 'NEWS',
  'summary': 'Kisii University is present and operational at the 3rd EIK International Environmental Conference in '
             'Mombasa. The conference themed Climate change and energy transition is giving us a chance to compare and '
             'connect with the latest data researches on climate change advocacy. Kisii University continues to shine '
             'even',
  'plain_text': 'Kisii University is present and operational at the 3rd EIK International Environmental Conference in '
                'Mombasa. The conference themed Climate change and energy transition is giving us a chance to compare '
                'and connect with the latest data researches on climate change advocacy. Kisii University continues to '
                'shine even brighter in multiple spaces ensuring that our banner flies high.',
  'published_at': '2024-10-25T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/eik-international-environmental-conference',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/BeEN3QwWYo87fI6LciVsotAFM7Yc0KJkMNOUHWYQ.jpg',
  'display_order': 218,
  'is_featured': False},
 {'title': 'New KSUSA Leadership',
  'category': 'STUDENT LIFE',
  'summary': 'Curtains were drawn on the newly elected Kisii University Student Association Leadership as the Vice '
             'Chancellor presided over their Swearing In into office and the seamless transition from the outgoing '
             'leadership. With Kisii University making history for the first time ever having a lady preside over the '
             "Student's",
  'plain_text': 'Curtains were drawn on the newly elected Kisii University Student Association Leadership as the Vice '
                'Chancellor presided over their Swearing In into office and the seamless transition from the outgoing '
                'leadership. With Kisii University making history for the first time ever having a lady preside over '
                "the Student's Executive Council, the new student leaders take up the advocacy and diverse leadership "
                'opportunities on behalf of our student populace. Kisii University continues to strengthen its '
                'different governance structures and propel its vision and oversight to even greater heights.',
  'published_at': '2024-10-21T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/new-ksusa-leadership',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/O4p3WUQvE8KcZtD35U0Ged3UoxgTv6E6l4SqYTCW.jpg',
  'display_order': 219,
  'is_featured': False},
 {'title': 'USA Ambassador visits KSU',
  'category': 'NEWS',
  'summary': 'Hosted by the Vice Chancellor, The USA Ambassador to Kenya Margaret Whitman engaged Kisii University '
             'students in a Fireside chat today with interesting discussions around geopolitical possibilities and '
             'strategic engagements that could not only mean the next great revolutions come to be but become real. '
             'Kisii',
  'plain_text': 'Hosted by the Vice Chancellor, The USA Ambassador to Kenya Margaret Whitman engaged Kisii University '
                'students in a Fireside chat today with interesting discussions around geopolitical possibilities and '
                'strategic engagements that could not only mean the next great revolutions come to be but become real. '
                'Kisii University continues to be the gateway for our students to see beyond the borders of our '
                'nations into infinite possibilities.',
  'published_at': '2024-10-16T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/usa-ambassador-visits-ksu',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/Ppef1v1vDJT66MqlsNtTaOAvhMXgSl49DisUip3T.jpg',
  'display_order': 220,
  'is_featured': False},
 {'title': 'Performance Contracting 2024-2025',
  'category': 'NEWS',
  'summary': 'Quality and excellence being at the heart of Kisii University, earlier today, the Vice Chancellor '
             'presided over the Signing of Performance Contracts for the FY 2024-2025 Cycle. The various departments '
             'in the University headed by our two Deputy Vice Chancellors made their annual commitments and '
             're-dedicated their',
  'plain_text': 'Quality and excellence being at the heart of Kisii University, earlier today, the Vice Chancellor '
                'presided over the Signing of Performance Contracts for the FY 2024-2025 Cycle. The various '
                'departments in the University headed by our two Deputy Vice Chancellors made their annual commitments '
                'and re-dedicated their operations to aim at achieving efficiency and effectiveness. Kisii University '
                'continues to re-imagine operational management and continuously leverages on different technologies '
                'to attain the highest possible results in its programs.',
  'published_at': '2024-09-11T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/performance-contracting-2024-2025',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/EBw1geE5VgiCjpPLhNDZ1SmlA1P0TU7n9ZYRVlpT.jpg',
  'display_order': 221,
  'is_featured': False},
 {'title': 'Matriculation Ceremony 2024',
  'category': 'NEWS',
  'summary': 'With pomp, color and exceptional finesse, the Vice Chancellor conducted the matriculation ceremony of '
             'the 2024 cohort of first years officially commencing their academic journey in Kisii University. The '
             'freshmen and women graciously embraced the opportunities Kisii University promised them and committed to '
             'continue',
  'plain_text': 'With pomp, color and exceptional finesse, the Vice Chancellor conducted the matriculation ceremony of '
                'the 2024 cohort of first years officially commencing their academic journey in Kisii University. The '
                'freshmen and women graciously embraced the opportunities Kisii University promised them and committed '
                'to continue the culture of excellence, self sacrifice and success. We welcome you to the University '
                'of the 21st century.',
  'published_at': '2024-09-08T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/matriculation-ceremony-2024',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/QTaznU3xQdh2eMrUGMq1aAWxT64scXLFUuONgZbo.jpg',
  'display_order': 223,
  'is_featured': False},
 {'title': 'Keele University',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor today hosted Hon Jeremy Lefroy and Prof Janet Lefroy from the United Kingdom. The '
             'distinguished academicians are diligently working to set up and progress various curricula jointly '
             'between Kisii University and Keele University to not only allow multiple learning opportunities from '
             'both Institutions',
  'plain_text': 'The Vice Chancellor today hosted Hon Jeremy Lefroy and Prof Janet Lefroy from the United Kingdom. The '
                'distinguished academicians are diligently working to set up and progress various curricula jointly '
                'between Kisii University and Keele University to not only allow multiple learning opportunities from '
                'both Institutions but to also provide platforms for advancement on a global scale. Led by our Vice '
                'Chancellor, Kisii University is pooling its global networks to ensure our students continue to '
                'receive world-class opportunities from right here at home.',
  'published_at': '2024-09-05T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/keele-university',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/3X2JNFhLfkn8e9kBb6VxLt4yOU80r1D0h37TBZOX.jpg',
  'display_order': 224,
  'is_featured': False},
 {'title': 'Active Tenders September 2024',
  'category': 'TENDERS',
  'summary': '1. Open Tender For Leasing Out University Restaurant (2 Years Contract) TENDER NUMBER: '
             'KSU/T/04/2024/2025 Tender Document 2. Open Tender For Supply, Delivery, Installation, Training And '
             'Commissioning Of Structured Networking And Cabling Of Ict Block B. TENDER NUMBER: KSU/T/05/2024/2025 '
             'Tender Document 3. Tender For',
  'plain_text': '1. Open Tender For Leasing Out University Restaurant (2 Years Contract) TENDER NUMBER: '
                'KSU/T/04/2024/2025 Tender Document 2. Open Tender For Supply, Delivery, Installation, Training And '
                'Commissioning Of Structured Networking And Cabling Of Ict Block B. TENDER NUMBER: KSU/T/05/2024/2025 '
                'Tender Document 3. Tender For Provision Of Ground Maintenance And Landscaping Services. Reserved '
                'Tender For Women, Youth And Pwds. TENDER NUMBER: KSU/T/07/2024/2025 Tender Document 4. Open Tender '
                'For Provision Of Insurance Brokerage Services TENDER NUMBER: KSU/T/06/2024/2025 Tender Document '
                'Procurement Portal',
  'published_at': '2024-09-05T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/active-tenders-september-2024',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/qcJPPP3ohYjQvFZtiOlcwxpwC4idzEJisb6bEcIl.jpg',
  'display_order': 225,
  'is_featured': False},
 {'title': 'University of Alabama',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor today hosted Prof George Mugoya, PhD from the University of Alabama alongside a '
             'technical team from Kisii University with exciting discussions centred around the creation of various '
             'academic programmes to be jointly delivered by the two Universities leveraging on unique expertise from '
             'both sides.',
  'plain_text': 'The Vice Chancellor today hosted Prof George Mugoya, PhD from the University of Alabama alongside a '
                'technical team from Kisii University with exciting discussions centred around the creation of various '
                'academic programmes to be jointly delivered by the two Universities leveraging on unique expertise '
                "from both sides. Kisii University's reach continues to span across the globe with a people-centred "
                'approach to academic progress and excellence',
  'published_at': '2024-09-04T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/university-of-alabama',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/i1X5dUphAyOqfkKCurUZS7kLmA1XTfbUULb2ssbQ.jpg',
  'display_order': 226,
  'is_featured': False},
 {'title': 'First Years Students Orientation',
  'category': 'NEWS',
  'summary': 'The Orientation Program is off to an exciting start with thousands of new students who have just joined '
             'Kisii University flocking the Pavilion in a bid to get the right start to their Academic and Social '
             'lives in the University. Kisii University demonstrates a keen interest in ensuring the right start of '
             'life to our',
  'plain_text': 'The Orientation Program is off to an exciting start with thousands of new students who have just '
                'joined Kisii University flocking the Pavilion in a bid to get the right start to their Academic and '
                'Social lives in the University. Kisii University demonstrates a keen interest in ensuring the right '
                'start of life to our new students always',
  'published_at': '2024-09-04T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/first-years-students-orientation',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/9xx5idIQzbFFUlIbNzVYZL2CzAR0lJnIHpbw5fg1.jpg',
  'display_order': 227,
  'is_featured': False},
 {'title': 'Welcome, First Years 2024/2025',
  'category': 'NEWS',
  'summary': 'From all walks of life, first years students streamed into Kisii University to be admitted and commence '
             'their academic journey and in a record 3 hours the University had admitted and settled the over 7,000 '
             'students now ready for Orientation that will commence on 2nd September at the Chancellorâ€™s Pavilion. '
             'Kisii',
  'plain_text': 'From all walks of life, first years students streamed into Kisii University to be admitted and '
                'commence their academic journey and in a record 3 hours the University had admitted and settled the '
                'over 7,000 students now ready for Orientation that will commence on 2nd September at the '
                'Chancellorâ€™s Pavilion. Kisii University continues to quality services on the heels of academic '
                'excellence and social economic empowerment.',
  'published_at': '2024-08-29T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/welcome-first-years-20242025',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/QORUJilsbm2Mj2R3JDtUQ6EzsUJgCmctu1msdbZC.jpg',
  'display_order': 228,
  'is_featured': False},
 {'title': 'ACTIVE TENDERS AUGUST 2024',
  'category': 'TENDERS',
  'summary': 'Normal 0 false false false EN-US X-NONE X-NONE /* Style Definitions */ table.MsoNormalTable '
             '{mso-style-name:"Table Normal"; mso-tstyle-rowband-size:0; mso-tstyle-colband-size:0; '
             'mso-style-noshow:yes; mso-style-priority:99; mso-style-parent:""; mso-padding-alt:0cm 5.4pt 0cm 5.4pt; '
             'mso-para-margin-top:0cm;',
  'plain_text': 'Normal 0 false false false EN-US X-NONE X-NONE /* Style Definitions */ table.MsoNormalTable '
                '{mso-style-name:"Table Normal"; mso-tstyle-rowband-size:0; mso-tstyle-colband-size:0; '
                'mso-style-noshow:yes; mso-style-priority:99; mso-style-parent:""; mso-padding-alt:0cm 5.4pt 0cm '
                '5.4pt; mso-para-margin-top:0cm; mso-para-margin-right:0cm; mso-para-margin-bottom:8.0pt; '
                'mso-para-margin-left:0cm; line-height:107%; mso-pagination:widow-orphan; font-size:11.0pt; '
                'font-family:"Calibri",sans-serif; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; '
                'mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New '
                'Roman"; mso-bidi-theme-font:minor-bidi;} 1. Open Tender For Centralized Ups For Ict Block B Tender '
                'Number: KSU/T/03/2024/2025 Normal 0 false false false EN-US X-NONE X-NONE /* Style Definitions */ '
                'table.MsoNormalTable {mso-style-name:"Table Normal"; mso-tstyle-rowband-size:0; '
                'mso-tstyle-colband-size:0; mso-style-noshow:yes; mso-style-priority:99; mso-style-parent:""; '
                'mso-padding-alt:0cm 5.4pt 0cm 5.4pt; mso-para-margin:0cm; mso-para-margin-bottom:.0001pt; '
                'mso-pagination:none; font-size:12.0pt; font-family:"Times New Roman",serif; mso-bidi-language:EN-US;} '
                '2. Open Tender For Hosting Of Learning Management System (LMS) Tender Number: Ksu/T/01/2024/2025 3. '
                'Open Tender For Provision Of Servicing And Maintenance Of Generators Tender Number: '
                'Ksu/T/02/2024/2025',
  'published_at': '2024-08-22T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/active-tenders-august-2024',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/uphLVkA8fr4g9jyDJB20XSL3rL3QfhQYJfnSL2fA.jpg',
  'display_order': 229,
  'is_featured': False},
 {'title': 'Open Tender For Centralized Ups For Ict Block B',
  'category': 'TENDERS',
  'summary': 'Procurement Portal Tender Document',
  'plain_text': 'Procurement Portal Tender Document',
  'published_at': '2024-08-22T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/open-tender-for-centralized-ups-for-ict-block-b',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/04zREWb8Dxn75dVO2PyDmpZxSFk5IYHF7hxgOMKX.jpg',
  'display_order': 230,
  'is_featured': False},
 {'title': 'Open Tender For Provision Of Servicing And Maintenance Of Generators',
  'category': 'TENDERS',
  'summary': 'Procurement portal Tender Document',
  'plain_text': 'Procurement portal Tender Document',
  'published_at': '2024-08-22T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/open-tender-for-provision-of-servicing-and-maintenance-of-generators',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/1gNDOZuvv1uUNOasXYf8M2OkaTTMt32GLncihlN5.jpg',
  'display_order': 231,
  'is_featured': False},
 {'title': 'Open Tender For Hosting Of Learning Management System (LMS)',
  'category': 'TENDERS',
  'summary': 'Procurement Portal Tender Document',
  'plain_text': 'Procurement Portal Tender Document',
  'published_at': '2024-08-22T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/open-tender-for-hosting-of-learning-management-system-lms',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/iJ9wwxHtAc6MJaTP8G7WYi69gQGhpD3svxUa3A7T.jpg',
  'display_order': 232,
  'is_featured': False},
 {'title': 'Notice to First Year Students',
  'category': 'PUBLIC NOTIFICATION',
  'summary': 'Notice to First Year Students is published on the official Kisii University website.',
  'plain_text': 'Notice to First Year Students is published on the official Kisii University website.',
  'published_at': '2024-07-18T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/notice-to-first-year-students',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/yLLTc0FuNkMRGjnNU4JUxIDrG0Lee76neFbd9GJA.png',
  'display_order': 233,
  'is_featured': False},
 {'title': 'Kisii university at the ASK show',
  'category': 'NEWS',
  'summary': 'A buzz with activities; From farmers who were looking to add on to their knowledge and experience from '
             'our researchers, to High School students a heartbeat away from joining University education seeking more '
             'insights into creative and innovative Academic programmes to inquisitive youngsters with a thousand and '
             'one',
  'plain_text': 'A buzz with activities; From farmers who were looking to add on to their knowledge and experience '
                'from our researchers, to High School students a heartbeat away from joining University education '
                'seeking more insights into creative and innovative Academic programmes to inquisitive youngsters with '
                'a thousand and one questions, the Kisii university stand at the Agricultural Show is full of '
                'activities and opportunities. We welcome you tomorrow to join us and explore even more.',
  'published_at': '2024-07-15T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-at-the-ask-show',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/jjXT9XDM4cXOQ3s1fDYO43sgihfrSvyNxJzGmJiO.jpg',
  'display_order': 234,
  'is_featured': False},
 {'title': 'Kisii Agricultural Show',
  'category': 'NEWS',
  'summary': 'Kisii University has taken prestigious frontline position in the Southern Kenya Branch, Kisii '
             'Agricultural Show set to commence officially from 11th to 14th July at the Gusii Stadium. Come and '
             'experience the amazing research, innovation and creative opportunities being born and bred at our '
             'Fountain of Knowledge.',
  'plain_text': 'Kisii University has taken prestigious frontline position in the Southern Kenya Branch, Kisii '
                'Agricultural Show set to commence officially from 11th to 14th July at the Gusii Stadium. Come and '
                'experience the amazing research, innovation and creative opportunities being born and bred at our '
                'Fountain of Knowledge.',
  'published_at': '2024-07-10T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-agricultural-show',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/gp7RSaClIod0zO2Avyu8bplVoBcm43C5bQpgsihL.jpg',
  'display_order': 238,
  'is_featured': False},
 {'title': 'Agritech Expose 2024',
  'category': 'NEWS',
  'summary': 'Kisii University School of Agriculture hosted the Agritech Expose 2024 for farmers, partners and major '
             "players in the agricultural game at the University's Nyosia Farm. The event focused on major networking, "
             'learning and comparing different ways and techniques of achieving the best in the agricultural sector. '
             'Farmers',
  'plain_text': 'Kisii University School of Agriculture hosted the Agritech Expose 2024 for farmers, partners and '
                "major players in the agricultural game at the University's Nyosia Farm. The event focused on major "
                'networking, learning and comparing different ways and techniques of achieving the best in the '
                'agricultural sector. Farmers were able to learn new ways in producing their crops and rearing animals '
                'and share best practices. Kisii University continues to lead in many are different ways in promoting '
                'positive programs that create a difference',
  'published_at': '2024-07-02T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/agritech-expose-2024',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/0VhQ6eUzwAfWoHoDACvNGB8mjIretRwVSWKN4QJv.jpg',
  'display_order': 239,
  'is_featured': False},
 {'title': 'Kisii and University of Manchester MOU',
  'category': 'ACADEMICS',
  'summary': 'The Vice Chancellor hosted Medical Students from the University of Manchester currently in a Teaching '
             'Program by our School of Health Sciences under the Kenya UK Health Alliance Umbrella for an exchange '
             'program with our students. Under the active Kisii and University of Manchester MOU our medical students '
             'are also set',
  'plain_text': 'The Vice Chancellor hosted Medical Students from the University of Manchester currently in a Teaching '
                'Program by our School of Health Sciences under the Kenya UK Health Alliance Umbrella for an exchange '
                'program with our students. Under the active Kisii and University of Manchester MOU our medical '
                'students are also set to be in the University of Manchester for the summertime Program as from 22nd '
                'of July this year. Kisii University continues to link strategically with international institutions '
                'of repute to be able to provide the best for our students.',
  'published_at': '2024-06-19T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-and-university-of-manchester-mou',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/S3Z05VvwCO5nzaeXe7q1ktZVEU2OPvcXkltNhVdn.jpg',
  'display_order': 241,
  'is_featured': False},
 {'title': 'CUE 4th Biennial Conference',
  'category': 'NEWS',
  'summary': 'Kisii University attended the 4th Biennial Conference at the KICC and presented wonderful innovations '
             'reflecting the unending creativity and ingenuity at Kisii University.',
  'plain_text': 'Kisii University attended the 4th Biennial Conference at the KICC and presented wonderful innovations '
                'reflecting the unending creativity and ingenuity at Kisii University.',
  'published_at': '2024-06-19T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/cue-4th-biennial-conference',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/uDKCjnlqMXQwTz18iKZIVjHPbnY0m7hjidR2b9wl.jpg',
  'display_order': 242,
  'is_featured': False},
 {'title': 'Inter - University And Inter / Intra Faculty Transfers',
  'category': 'PUBLIC NOTIFICATION',
  'summary': 'Inter - University And Inter / Intra Faculty Transfers is published on the official Kisii University '
             'website.',
  'plain_text': 'Inter - University And Inter / Intra Faculty Transfers is published on the official Kisii University '
                'website.',
  'published_at': '2024-06-01T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/inter-university-and-inter-intra-faculty-transfers',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/iuCVCZTuaQZYt0Y1CPZ5iIOb6h4LyIrrjgq264Pr.jpg',
  'display_order': 243,
  'is_featured': False},
 {'title': 'PROVISION OF FUEL SMART CARDS SERVICE TENDER REF NO.KSU/T/32/2023–2024',
  'category': 'TENDERS',
  'summary': 'PROVISION OF FUEL SMART CARDS SERVICE TENDER REF NO.KSU/T/32/2023â€“2024 OPENING AND CLOSING DATE: 12th '
             'WEDNESDAY JUNE, 2024 TIME: 11.30 A.M Download the tender document',
  'plain_text': 'PROVISION OF FUEL SMART CARDS SERVICE TENDER REF NO.KSU/T/32/2023â€“2024 OPENING AND CLOSING DATE: '
                '12th WEDNESDAY JUNE, 2024 TIME: 11.30 A.M Download the tender document',
  'published_at': '2024-05-28T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/provision-of-fuel-smart-cards-service-tender-ref-noksut322023-2024',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/TiTBYQ7NQV0UNxtLUY7G2pHKgq9bBlooR97A9vc0.jpg',
  'display_order': 244,
  'is_featured': False},
 {'title': 'Planting 10,000 Trees at Nyangweta Forest',
  'category': 'NEWS',
  'summary': 'As gallant environmental warriors, today Kisii University led by our Vice Chancellor was on the '
             'frontline in pushing the growing trees agenda by planting 10,000 trees at Nyangweta Forest. Kisii '
             'University is on an ambitious quest to protect our environment by ensuring many trees planted as well as '
             'spreading the',
  'plain_text': 'As gallant environmental warriors, today Kisii University led by our Vice Chancellor was on the '
                'frontline in pushing the growing trees agenda by planting 10,000 trees at Nyangweta Forest. Kisii '
                'University is on an ambitious quest to protect our environment by ensuring many trees planted as well '
                'as spreading the inspiration to as many people as possible',
  'published_at': '2024-05-04T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/planting-10000-trees-at-nyangweta-forest',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/lZnTF3zEfjxoA0eTEOJZtCIAQaGpSOxIo01G6ZRp.jpg',
  'display_order': 245,
  'is_featured': False},
 {'title': 'SASS Community Outreach Programs 2023/2024',
  'category': 'ARTS & CULTURE',
  'summary': 'Mandate: The community outreach committee is mandated to organize, plan and execute activities meant to '
             'unite members of SASS with the members of the catchment communities To be the guiding body in SASS in as '
             'far as community outreach activities are concerned To liaise with other stakeholders on behalf of SASS '
             'in',
  'plain_text': 'Mandate: The community outreach committee is mandated to organize, plan and execute activities meant '
                'to unite members of SASS with the members of the catchment communities To be the guiding body in SASS '
                'in as far as community outreach activities are concerned To liaise with other stakeholders on behalf '
                'of SASS in order to accomplish community outreach activities Objectives: To market the University and '
                'the School of Arts and Social Sciences within the community To encourage the differently abled in the '
                'community to appreciate their conditions To visit schools and talk to future students/clients on the '
                'benefits of joining Kisii University To contribute to the hygienic conditions within the community To '
                'be part of the solutions to issues of climate change Brief Background The School of Arts and Social '
                'Sciences has in the past been engaged in community outreach programs. Activities already accomplished '
                'in the previous academic years: A visit to a special school in Nyanchwa, Kisii. Book donations to '
                'Sengera Girls High School, Kisii Sensitization of the community on mental health. Donation of '
                'sanitary towels to Nyaura Primary School, Kisii. Plans for 2023/2024 Academic Year Visitations to '
                'orphanages and schools for the blind Rubbish collection Tree planting Books donation Hygiene training '
                'and jigger campaigns Talks to street children, schools and the aged Schedule for 2023/2024 Normal 0 '
                'false false false EN-US X-NONE X-NONE /* Style Definitions */ table.MsoNormalTable '
                '{mso-style-name:"Table Normal"; mso-tstyle-rowband-size:0; mso-tstyle-colband-size:0; '
                'mso-style-noshow:yes; mso-style-priority:99; mso-style-parent:""; mso-padding-alt:0in 5.4pt 0in '
                '5.4pt; mso-para-margin-top:0in; mso-para-margin-right:0in; mso-para-margin-bottom:10.0pt; '
                'mso-para-margin-left:0in; mso-pagination:widow-orphan; font-size:11.0pt; '
                'font-family:"Calibri",sans-serif; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; '
                'mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New '
                'Roman"; mso-bidi-theme-font:minor-bidi;} table.LightShading1 {mso-style-name:"Light Shading1"; '
                'mso-tstyle-rowband-size:1; mso-tstyle-colband-size:1; mso-style-noshow:yes; mso-style-priority:60; '
                'border-top:solid black 1.0pt; mso-border-top-themecolor:text1; border-left:none; border-bottom:solid '
                'black 1.0pt; mso-border-bottom-themecolor:text1; border-right:none; mso-padding-alt:0in 5.4pt 0in '
                '5.4pt; mso-para-margin:0in; mso-para-margin-bottom:.0001pt; mso-pagination:wid',
  'published_at': '2024-04-24T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/sass-community-outreach-programs-20232024',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/',
  'display_order': 246,
  'is_featured': False},
 {'title': 'Kenya UK Health Alliance Research Workshop',
  'category': 'NEWS',
  'summary': 'The Kenya UK Health Alliance Research Workshop happening now continues to draw expertise from multiple '
             'Universities and Countries. Kisii University continues to be the lead Kenyan University in furthering '
             'the goals and benefits of the Alliance',
  'plain_text': 'The Kenya UK Health Alliance Research Workshop happening now continues to draw expertise from '
                'multiple Universities and Countries. Kisii University continues to be the lead Kenyan University in '
                'furthering the goals and benefits of the Alliance',
  'published_at': '2024-04-24T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kenya-uk-health-alliance-research-workshop',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/Z9X9j86z0j8qAPTVIgOjqaq5grC81ZcVmaqrpLm5.jpg',
  'display_order': 247,
  'is_featured': False},
 {'title': 'TENDER NOTICE APRIL 2024 SUPPLY OF VARIOUS ITEMS',
  'category': 'TENDERS',
  'summary': '1. Tender For Provision Of Security Services Ksu/T/29/2023/2024 Document 2. Tender For Proposed '
             'Completion Of Tuition Complex Ksu/T/30/2023-2024 Document',
  'plain_text': '1. Tender For Provision Of Security Services Ksu/T/29/2023/2024 Document 2. Tender For Proposed '
                'Completion Of Tuition Complex Ksu/T/30/2023-2024 Document',
  'published_at': '2024-04-10T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/tender-notice-april-2024-supply-of-various-items',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/pX6yVvJJSPcPEp1hy5Uzx1kg2YRHSGOjlT7FmwuB.jpg',
  'display_order': 248,
  'is_featured': False},
 {'title': 'National Assembly Departmental Committee on Education',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor hosted the National Assembly Departmental Committee on Education led by the Vice '
             'Chairperson, Hon. Injendi Moses Malulu. The Committee visited the University to enhance engagements on '
             "various matters education as well as appreciate ongoing projects and challenges facing the University's "
             'Strategic',
  'plain_text': 'The Vice Chancellor hosted the National Assembly Departmental Committee on Education led by the Vice '
                'Chairperson, Hon. Injendi Moses Malulu. The Committee visited the University to enhance engagements '
                'on various matters education as well as appreciate ongoing projects and challenges facing the '
                "University's Strategic Priorities. Kisii University continues to partner and collaborate with "
                'Government in order to achieve her mandate and progress her Mission',
  'published_at': '2024-04-10T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/national-assembly-departmental-committee-on-education',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/XoqdbVZw2dtE0uad5saxHuXVc6WUvZ1lPsP0d86i.jpg',
  'display_order': 249,
  'is_featured': False},
 {'title': 'KISII UNIVERSITY TENDER NOTICE MARCH 2024',
  'category': 'TENDERS',
  'summary': 'KSU/T/18/2023 - 2024 Tender Document download KSU/T/19/2023 /2024 Tender Document download '
             'KSU/T/20/2023-2024 Tender Document download KSU/T/21/2023-2024 Tender Document download '
             'KSU/T/22/2023-2024 Tender Document download',
  'plain_text': 'KSU/T/18/2023 - 2024 Tender Document download KSU/T/19/2023 /2024 Tender Document download '
                'KSU/T/20/2023-2024 Tender Document download KSU/T/21/2023-2024 Tender Document download '
                'KSU/T/22/2023-2024 Tender Document download',
  'published_at': '2024-03-12T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-tender-notice-march-2024',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/HWk64FRLnP48ezDrz0KX6UnqHAvNaAMc1WUOCfyX.jpg',
  'display_order': 250,
  'is_featured': False},
 {'title': 'Council For Legal Education Inspection At Kisii University Law School',
  'category': 'NEWS',
  'summary': 'Kisii University School of Law Academic Programmes Onsite Inspection led by the Supreme Court Judge Hon. '
             'Justice Smokin Wanjala has been completed successfully with Kisii University demonstrating its innate '
             'ability and capacity to continue to offer the Law Programmes; as it has been discharging her mandate '
             'with',
  'plain_text': 'Kisii University School of Law Academic Programmes Onsite Inspection led by the Supreme Court Judge '
                'Hon. Justice Smokin Wanjala has been completed successfully with Kisii University demonstrating its '
                'innate ability and capacity to continue to offer the Law Programmes; as it has been discharging her '
                'mandate with distinct style and off the charts success levels. Kisii University continues to thrive '
                'under decisive and visionary leadership gearing the University towards a hopeful future',
  'published_at': '2024-03-12T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/council-for-legal-education-inspection-at-kisii-university-law-school',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/a2sgedw3el97zjsraR7mquJa8gWNp2qHYVQ1zHxR.jpg',
  'display_order': 251,
  'is_featured': False},
 {'title': 'University of Limpopo and KEFRI',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor today led bilateral discussions with the University of Limpopo and KEFRI that aim at '
             'creating enhanced co-relations and empowered working collaborations that should assure research and '
             'growth opportunities through prudent management and production of invaluable resources in water and aqua '
             'related',
  'plain_text': 'The Vice Chancellor today led bilateral discussions with the University of Limpopo and KEFRI that aim '
                'at creating enhanced co-relations and empowered working collaborations that should assure research '
                'and growth opportunities through prudent management and production of invaluable resources in water '
                'and aqua related areas. The program puts Kisii University at a unique place to expand her horizon to '
                'greater and better frontiers.',
  'published_at': '2024-03-12T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/university-of-limpopo-and-kefri',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/SLwm0wgePyg1kPpmDF6NsQunQ1IuBnub6n0u3jPQ.jpg',
  'display_order': 252,
  'is_featured': False},
 {'title': 'KISII UNIVERSITY TENDER NOTICE FEB - MARCH 2024',
  'category': 'TENDERS',
  'summary': '1. Tender For Supply And Delivery Of Nursing Skills Laboratory Equipment Document 2. Tender For Supply '
             'And Delivery Of Library Books Document 3. Tender For Provision Of Internet Services Document 4. Tender '
             'For Supply And Delivery Of Media Equipment Document',
  'plain_text': '1. Tender For Supply And Delivery Of Nursing Skills Laboratory Equipment Document 2. Tender For '
                'Supply And Delivery Of Library Books Document 3. Tender For Provision Of Internet Services Document '
                '4. Tender For Supply And Delivery Of Media Equipment Document',
  'published_at': '2024-02-27T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-tender-notice-feb-march-2024',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/4kefrJtzChtnJGf0hnItTjbpwNYkgvrNwBrLpvAX.jpg',
  'display_order': 253,
  'is_featured': False},
 {'title': 'Advertisement of Vacancies(Registrar[Adminstration,Human Resource and Central '
           'Services],Registrar[Academics],Registrar[Research,Innovation,Extension and Resource Mobilization])',
  'category': 'NEWS',
  'summary': 'Kisii University invites applications from suitably qualified candidates for the following positions: '
             'Registrar (Administration, Human Resource and Central Services), Grade 15 Registrar (Academic Affairs), '
             'Grade 15 Registrar (Research, Innovation and Resource Mobilization), Grade 15 REGISTRAR (ADMINISTRATION, '
             'HUMAN',
  'plain_text': 'Kisii University invites applications from suitably qualified candidates for the following positions: '
                'Registrar (Administration, Human Resource and Central Services), Grade 15 Registrar (Academic '
                'Affairs), Grade 15 Registrar (Research, Innovation and Resource Mobilization), Grade 15 REGISTRAR '
                '(ADMINISTRATION, HUMAN RESOURCE AND CENTRAL SERVICES), GRADE 15, REF. NO: KSU/R(AHRCS)/01/2024 Basic '
                'Salary: Kes. 209, 694 - 283,087 per month House Allowance: Kes. 73,715 per month All other benefits '
                'will be as provided in the terms of service applicable for the position. Duties and responsibilities '
                ': Under the general direction of the Deputy Vice-Chancellor (Administration, Planning and Finance), '
                'the Registrar (Administration) shall have the following duties and responsibilities: working in '
                'partnership with academic and administrative units of the University in identification, recruitment, '
                "training, performance management of staff; implementation and application of the University's human "
                'resource development and management policies and strategy; implementation, application and review of '
                "the University's policies on employment and employee relations; overseeing the following operations "
                'in the University in coordination with its Schools, Campuses and Departments: selection and '
                'recruitment of employees; induction and orientation of new employees, training and development of '
                "employees; remuneration and employees' terms of service; managing employee benefits; employee "
                'relations and welfare; management of leave and employee records; discipline of employees; payroll '
                'management; ensuring adherence to University rules and regulations; enforcement of University '
                'policies on human resource; coordinating management and provision of central services that include '
                'accommodation, estates, farm, transport and catering; safe custody of administrative University '
                'records; and undertaking such other responsibilities as shall be assigned by the Deputy '
                'Vice-Chancellor (Administration, Planning and Finance). Academic and Professional Requirements and '
                'Experience For appointment to the position of Registrar (Administration), one must meet the following '
                'requirements: PhD in administration, public administration, human resource management, business '
                'administration, communication, educational communication, project planning, education or any other '
                'related, relevant field from a university recognized in Kenya Certified Public Secretary (K) Twelve '
                "years' administrative experience, 3 of which should",
  'published_at': '2024-02-14T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/advertisement-of-vacanciesregistraradminstrationhuman-resource-and-central-servicesregistraracademicsregistrarresearchinnovationextension-and-resource-mobilization',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/APLAp8AxeAtTfQfOG8iSE9czHrl5UHcopP3rOxcB.jpg',
  'display_order': 254,
  'is_featured': False},
 {'title': 'Kisii University & University of Manchester Strengthen Ties',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor today hosted a delegation from the University of Manchester continuing a string of '
             'strategic engagements between our two institutions. The visit came with wonderful news of a full '
             'scholarship for 16 Health Science students who are headed to the University of Manchester for a Summer '
             'Program. This is',
  'plain_text': 'The Vice Chancellor today hosted a delegation from the University of Manchester continuing a string '
                'of strategic engagements between our two institutions. The visit came with wonderful news of a full '
                'scholarship for 16 Health Science students who are headed to the University of Manchester for a '
                'Summer Program. This is as a result of our mutual exchange program that saw Kisii University also '
                'host medical students from the University of Manchester. Kisii University continues to align itself '
                'with global institutions and attain global standards of operations',
  'published_at': '2024-02-09T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-university-of-manchester-strengthen-ties',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/iXwqBGt8frA30hAIbJn8U1JDOaHTgQsxB89LzY7s.jpg',
  'display_order': 255,
  'is_featured': False},
 {'title': '9th Annual Kisii University Cultural Festival',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor today amidst an amazing display of pomp and color opened the 9th Annual Kisii '
             'University Cultural Festival. The Festival is running up to Friday 9th and will give an opportunity to '
             'the University community to not only showcase various cultures but also appreciate them.',
  'plain_text': 'The Vice Chancellor today amidst an amazing display of pomp and color opened the 9th Annual Kisii '
                'University Cultural Festival. The Festival is running up to Friday 9th and will give an opportunity '
                'to the University community to not only showcase various cultures but also appreciate them.',
  'published_at': '2024-02-08T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/9th-annual-kisii-university-cultural-festival',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/zKEv3YyNhc95wlkOGW2CVqonHdAbUIppsY2N22pg.jpg',
  'display_order': 256,
  'is_featured': False},
 {'title': 'University’s Strategic Partnerships with the University of Manchester and Minnesota',
  'category': 'NEWS',
  'summary': "In an effort to continue the University's Strategic Partnerships with the University of Manchester and "
             'Minnesota, this evening different stakeholders concluded a busy and interactive week with a working '
             'dinner that elicited productive conversation and innovative ideological collaborations that will see '
             'Kisii',
  'plain_text': "In an effort to continue the University's Strategic Partnerships with the University of Manchester "
                'and Minnesota, this evening different stakeholders concluded a busy and interactive week with a '
                'working dinner that elicited productive conversation and innovative ideological collaborations that '
                'will see Kisii University sail into the future of academic and operational success. Kisii University '
                'continues to span her wings wide enough to engage more critical partners to ensure her future.',
  'published_at': '2024-02-08T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/universitys-strategic-partnerships-with-the-university-of-manchester-and-minnesota',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/bjApj0vB18NXa9k0Ar0POHqeYrCBbbs6f9Zo0q64.jpg',
  'display_order': 257,
  'is_featured': False},
 {'title': 'Kisii University to extend the campaign against drug abuse',
  'category': 'NEWS',
  'summary': 'The Second Lady, H.E. Pastor Dr. Dorcas Rigathi today was in Kisii University to extend the campaign '
             'against drug abuse. Kisii University, led by our Vice Chancellor graciously hosted the Second Lady and '
             'continued to demonstrate countless ways in which support to this amazing cause has been demonstrated. We '
             'continue',
  'plain_text': 'The Second Lady, H.E. Pastor Dr. Dorcas Rigathi today was in Kisii University to extend the campaign '
                'against drug abuse. Kisii University, led by our Vice Chancellor graciously hosted the Second Lady '
                'and continued to demonstrate countless ways in which support to this amazing cause has been '
                'demonstrated. We continue to appreciate the good work done by our leaders in support of our '
                'communities',
  'published_at': '2024-02-08T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-to-extend-the-campaign-against-drug-abuse',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/kRlO3RpiHS3ItcsitLWE3WYzKVrWbcYq0xSjm7oH.jpg',
  'display_order': 258,
  'is_featured': False},
 {'title': 'KPLC Institute Research & Energy Studies',
  'category': 'NEWS',
  'summary': 'The Ag. Registrar Research, Innovation & Resource Mobilization, Prof Christopher Ngacho today led an '
             'innovation meeting at KPLC Institute Research & Energy Studies discussing an innovation of a Synmeter '
             'design by our students. This innovation is providing a solution to update Energy Meters automatically '
             'other than',
  'plain_text': 'The Ag. Registrar Research, Innovation & Resource Mobilization, Prof Christopher Ngacho today led an '
                'innovation meeting at KPLC Institute Research & Energy Studies discussing an innovation of a Synmeter '
                'design by our students. This innovation is providing a solution to update Energy Meters automatically '
                'other than being required to enter the token numbers. Kisii University continues to provide the '
                "necessary ingenuity to provide solutions for our society's problems",
  'published_at': '2024-02-08T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kplc-institute-research-energy-studies',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/CL8oSZvhjlMVWKAQHLWO9xoHjEtMdWdRtvlQix4i.jpg',
  'display_order': 259,
  'is_featured': False},
 {'title': 'KISII UNIVERSITY VACANCIES ANNOUNCEMENT',
  'category': 'NEWS',
  'summary': 'KISII UNIVERSITY VACANCIES ANNOUNCEMENT is published on the official Kisii University website.',
  'plain_text': 'KISII UNIVERSITY VACANCIES ANNOUNCEMENT is published on the official Kisii University website.',
  'published_at': '2024-01-08T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-vacancies-announcement',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/gtkgDdcrCzSR8fZMOomVMzg0DnAJz37tdD7VpSJe.jpg',
  'display_order': 260,
  'is_featured': False},
 {'title': '12TH GRADUATION CEREMONY AND INSTALLATION OF THE 2ND VICE CHANCELLOR PROF.DR.NATHAN O OGECH',
  'category': 'NEWS',
  'summary': 'YOU CAN JOIN US ON ZOOM',
  'plain_text': 'YOU CAN JOIN US ON ZOOM',
  'published_at': '2023-12-19T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/12th-graduation-ceremony-and-installation-of-the-2nd-vice-chancellor-profdrnathan-o-ogech',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/APDTIYJtGRrQ0h5EG3P2djE8qNvVRPGTmLZTA9Ip.jpg',
  'display_order': 261,
  'is_featured': False},
 {'title': 'Dare to be, Kisii University Women Techmakers resolve',
  'category': 'NEWS',
  'summary': 'Source : Article originally published by ScholarMedia Africa',
  'plain_text': 'Source : Article originally published by ScholarMedia Africa',
  'published_at': '2023-12-11T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/dare-to-be-kisii-university-women-techmakers-resolve',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/lrU4PDW7BakYmQwsMfG1wIzPoF4ue8I9WA5isoH8.jpg',
  'display_order': 262,
  'is_featured': False},
 {'title': "FROM GRASS TO GRACE : A Rural Boy's Journey",
  'category': 'NEWS',
  'summary': "FROM GRASS TO GRACE : A Rural Boy's Journey is published on the official Kisii University website.",
  'plain_text': "FROM GRASS TO GRACE : A Rural Boy's Journey is published on the official Kisii University website.",
  'published_at': '2023-11-12T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/from-grass-to-grace-a-rural-boys-journey',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/6CQIxZmFex3MHcwo0lAndxbgLpcgOXFa3NLYCVYF.jpg',
  'display_order': 263,
  'is_featured': False},
 {'title': 'PARTNERING FOR EXCELLENCE',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor today hosted Prof. David Lee Wood from the University of East Tennessee State '
             'University, USA in a bid to continue progressing a working MOU with Kisii University. The University is '
             'exploring establishing a student and staff exchange programme to benefit both Universities. Research '
             'efforts will',
  'plain_text': 'The Vice Chancellor today hosted Prof. David Lee Wood from the University of East Tennessee State '
                'University, USA in a bid to continue progressing a working MOU with Kisii University. The University '
                'is exploring establishing a student and staff exchange programme to benefit both Universities. '
                'Research efforts will also be collaboratively worked on to ensure the strategic partnership bears '
                'fruits',
  'published_at': '2023-11-11T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/partnering-for-excellence',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/HrFy15E9ovj6ZS3YU61JFFEoRFxAOrvxzLTEYwfG.png',
  'display_order': 264,
  'is_featured': False},
 {'title': 'KISII UNIVERSITY HOSTS THE CABINET SECRETARY, EDUCATION HON EZEKIEL MACHOGU',
  'category': 'NEWS',
  'summary': 'Kisii University today hosted the Cabinet Secretary Education, Hon Ezekiel Machogu, H.E. Hon Simba '
             'Arati, and Principal Secretary Housing & Urban Development PS Charles Hinga on a consultative tour '
             'geared to see Kisii University commence transformative infrastrastructural projects. To commence in the '
             'immediate future',
  'plain_text': 'Kisii University today hosted the Cabinet Secretary Education, Hon Ezekiel Machogu, H.E. Hon Simba '
                'Arati, and Principal Secretary Housing & Urban Development PS Charles Hinga on a consultative tour '
                'geared to see Kisii University commence transformative infrastrastructural projects. To commence in '
                'the immediate future is the construction of a 10,000 capacity-housing unit to help accommodate '
                'students of Kisii University and give them access to other attractive amenities to help them lead a '
                'comfortable academic life. The County Government in support of the development streak has also '
                'committed to pave the different roads around the University to open up the areas even further for '
                'students. Kisii University continues to engage and retain development partners to help her achieve '
                'her core mandate.',
  'published_at': '2023-11-07T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-hosts-the-cabinet-secretary-education-hon-ezekiel-machogu',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/25zOMiaCEiXTKhAtlQH4DAYE88Fveembj8gLgpX5.png',
  'display_order': 265,
  'is_featured': False},
 {'title': 'ACTIVE TENDERS OCT/NOV 2023',
  'category': 'TENDERS',
  'summary': 'ISUZU TENDER FOR SERVICING 2023 TENDER FOR SERVICING HOLLAND TRACTOR 2023 TENDER FOR SERVICING NISSAN '
             'MOTOR VEHICLES 2023 TENDER FOR SERVICING TOYOTA MOTOR VEHICLES 2023 TENDER FOR SERVICING VEHICLES FAW '
             'MODELS 2023. TENDER FOR PAINTING WORKS 2023',
  'plain_text': 'ISUZU TENDER FOR SERVICING 2023 TENDER FOR SERVICING HOLLAND TRACTOR 2023 TENDER FOR SERVICING NISSAN '
                'MOTOR VEHICLES 2023 TENDER FOR SERVICING TOYOTA MOTOR VEHICLES 2023 TENDER FOR SERVICING VEHICLES FAW '
                'MODELS 2023. TENDER FOR PAINTING WORKS 2023',
  'published_at': '2023-11-01T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/active-tenders-octnov-2023',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/vl6GeaUlyscLcMkbwsjyXpjYW3LZjQwRhBoQqmbp.jpg',
  'display_order': 266,
  'is_featured': False},
 {'title': 'TENDER FOR REGISTRATION OF SUPPLIERS 2023-2025',
  'category': 'TENDERS',
  'summary': 'Procurement Portal Suppliers Registration Documentation',
  'plain_text': 'Procurement Portal Suppliers Registration Documentation',
  'published_at': '2023-10-30T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/tender-for-registration-of-suppliers-2023-2025',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/2ygSLwFZR3FLq35Rs43rLrk4PbnlhakH3aeMZWiz.jpg',
  'display_order': 267,
  'is_featured': False},
 {'title': 'TENDER FOR SERVICING VEHICLES FAW MODELS 2023',
  'category': 'TENDERS',
  'summary': 'Procurement Portal Tender Document',
  'plain_text': 'Procurement Portal Tender Document',
  'published_at': '2023-10-30T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/tender-for-servicing-vehicles-faw-models-2023',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/krn9fptYauMYY6GD4j2rwXtCjKsOXIsYBbOom4NR.jpg',
  'display_order': 268,
  'is_featured': False},
 {'title': 'TENDER FOR SERVICING TOYOTA MOTOR VEHICLES 2023',
  'category': 'TENDERS',
  'summary': 'Procurement Portal Tender Document',
  'plain_text': 'Procurement Portal Tender Document',
  'published_at': '2023-10-30T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/tender-for-servicing-toyota-motor-vehicles-2023',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/swtnQqbr9bWh24o7owPCswkymMw1vMD9eidCUBh4.jpg',
  'display_order': 269,
  'is_featured': False},
 {'title': 'TENDER FOR SERVICING NISSAN MOTOR VEHICLES 2023',
  'category': 'TENDERS',
  'summary': 'Procurement Portal Tender Document',
  'plain_text': 'Procurement Portal Tender Document',
  'published_at': '2023-10-30T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/tender-for-servicing-nissan-motor-vehicles-2023',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/6M6va0h1OGaQvX3MpUCxCfpow7Rkk77xnFSi9rLx.jpg',
  'display_order': 270,
  'is_featured': False},
 {'title': 'TENDER FOR SERVICING HOLLAND TRACTOR 2023',
  'category': 'TENDERS',
  'summary': 'Procurement Portal Tender Document',
  'plain_text': 'Procurement Portal Tender Document',
  'published_at': '2023-10-30T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/tender-for-servicing-holland-tractor-2023',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/IiiIJSLyDTdxMgIZ6kfomUi5XaGrFvc0Sj3hCSY1.jpg',
  'display_order': 271,
  'is_featured': False},
 {'title': 'ISUZU TENDER FOR SERVICING 2023',
  'category': 'TENDERS',
  'summary': 'Procurement Portal Tender Document',
  'plain_text': 'Procurement Portal Tender Document',
  'published_at': '2023-10-30T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/isuzu-tender-for-servicing-2023',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/C0TRoZtm4MYqBmwhO73fLEZdKoasYlqwjZRJ4UvH.jpg',
  'display_order': 272,
  'is_featured': False},
 {'title': 'TENDER FOR PAINTING WORKS 2023',
  'category': 'TENDERS',
  'summary': 'Procurement Portal Tender Document',
  'plain_text': 'Procurement Portal Tender Document',
  'published_at': '2023-10-30T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/tender-for-painting-works-2023',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/yWoUBXwiKG94351fUgZxO4IxJkLWJRvnT6lTByfj.jpg',
  'display_order': 273,
  'is_featured': False},
 {'title': 'Collaborating for a great many partnerships; The Vice Chancellor continues to push for Strategic Alliances',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor met with KUSU, UASU and KUDHEIA officials from the Kisii University Branch Chapters '
             'and their select National officials, continuing his progressive trend of ensuring all the right '
             'stakeholders are onboarded into furthering the mandate and vision of Kisii University that largely '
             'depends on our',
  'plain_text': 'The Vice Chancellor met with KUSU, UASU and KUDHEIA officials from the Kisii University Branch '
                'Chapters and their select National officials, continuing his progressive trend of ensuring all the '
                'right stakeholders are onboarded into furthering the mandate and vision of Kisii University that '
                'largely depends on our staff. The Vice Chancellor continues to lead these strategic engagements that '
                'are aimed at ensuring a progressive, functional, effective and efficient Kisii University.',
  'published_at': '2023-09-29T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/collaborating-for-a-great-many-partnerships-the-vice-chancellor-continues-to-push-for-strategic-alliances',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/eMHPNT4QB3LyFRkN63gBMPyLLpwqHmYNhTIVRip6.png',
  'display_order': 274,
  'is_featured': False},
 {'title': 'Kisii University Inspiring Finalist Students to reach for the greatness within them; We can all make it',
  'category': 'NEWS',
  'summary': 'In a moment of instant inspiration, the Vice Chancellor today accompanied by the two DVCS touched the '
             'hearts and inspired the minds of finalist students at Friends School Kiamokama. The students who were '
             'being dedicated in prayer as they prepared for their KCSE received inspiration and guidance from the '
             'academic',
  'plain_text': 'In a moment of instant inspiration, the Vice Chancellor today accompanied by the two DVCS touched the '
                'hearts and inspired the minds of finalist students at Friends School Kiamokama. The students who were '
                'being dedicated in prayer as they prepared for their KCSE received inspiration and guidance from the '
                'academic leaders. Kisii University continues to find a way to touch the hearts of many as it grows '
                'and networks.',
  'published_at': '2023-09-29T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-inspiring-finalist-students-to-reach-for-the-greatness-within-them-we-can-all-make-it',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/lKYAefAxDNtpL1PPymy2JvlLhcpqRaKnjriKfe7s.png',
  'display_order': 275,
  'is_featured': False},
 {'title': 'Securing our Financial future, National Bank supports the Kisii University community in matters financial '
           'planning',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor met with the Branch leadership from the National Bank of Kenya. The meeting sought '
             'to set a ground work for provision of different and competitive products from the bank to both our '
             'students and staff to enable them achieve financial freedom. The bank would also support the University '
             'community',
  'plain_text': 'The Vice Chancellor met with the Branch leadership from the National Bank of Kenya. The meeting '
                'sought to set a ground work for provision of different and competitive products from the bank to both '
                'our students and staff to enable them achieve financial freedom. The bank would also support the '
                'University community with different financial literacy and educational programs to help grow a stable '
                'community. Kisii University continues to prepare and engage worthy partners that can help realize her '
                'vision and mission.',
  'published_at': '2023-09-29T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/securing-our-financial-future-national-bank-supports-the-kisii-university-community-in-matters-financial-planning',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/oaTzniOWH8NB7ey0LZTY14f5FpBmg8glbHodsAvP.png',
  'display_order': 276,
  'is_featured': False},
 {'title': 'OPEN TENDER FOR PROVISION OF INSURANCE BROKERAGE SERVICES KSU/T/04/2023/2024',
  'category': 'TENDERS',
  'summary': 'Tender Document Procurement Portal',
  'plain_text': 'Tender Document Procurement Portal',
  'published_at': '2023-09-27T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/open-tender-for-provision-of-insurance-brokerage-services-ksut0420232024',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/RuRStaihE68GCXwE4h5rCvS6O45uSZbzdT3WM3Ty.jpg',
  'display_order': 277,
  'is_featured': False},
 {'title': 'TENDER ADDENDUM - TENDER FOR SUPPLY AND DELIVERY OF SECURITY PRINTED ACADEMIC CERTIFICATES AND TRANSCRIPTS '
           '(FRAMEWORK AGREEMENT)',
  'category': 'TENDERS',
  'summary': 'Procurement Portal',
  'plain_text': 'Procurement Portal',
  'published_at': '2023-09-27T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/tender-addendum-tender-for-supply-and-delivery-of-security-printed-academic-certificates-and-transcripts-framework-agreement',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/uz0myNwEpBA5CRARdk5xCMB6z2jp67ssHdoWWDPt.jpg',
  'display_order': 278,
  'is_featured': False},
 {'title': 'Partnering for Excellence; Kereri Girls Visits with a Partnership Perspective',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor continues to lead Strategic Engagements with Academic and other reputable '
             'institutions in the region with the view of collaborating and revolutionizing academia in the region. '
             'The Principal and Board of Management of Kereri Girls were on the frontline to advance the networking '
             'agenda with the',
  'plain_text': 'The Vice Chancellor continues to lead Strategic Engagements with Academic and other reputable '
                'institutions in the region with the view of collaborating and revolutionizing academia in the region. '
                'The Principal and Board of Management of Kereri Girls were on the frontline to advance the networking '
                'agenda with the University today. Kisii University is pursuing a mutually beneficial partnership with '
                'her neighbors and likeminded institutions.',
  'published_at': '2023-09-27T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/partnering-for-excellence-kereri-girls-visits-with-a-partnership-perspective',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/q7ar5h4XuTXzATb9Odsk53lr9asKfhdICjRUAPV5.png',
  'display_order': 279,
  'is_featured': False},
 {'title': 'The Ethical Artificial Intelligence Project Continues to change the lives of our students',
  'category': 'NEWS',
  'summary': 'Our Students from the School of Information Science and technology continued the Ethical Artificial '
             'Intelligence project by engaging targeted experts from different segments of the industry to learn how '
             'best to be ethical in the 21st century. The experts put them in touch with real life scenarios that '
             'affect the',
  'plain_text': 'Our Students from the School of Information Science and technology continued the Ethical Artificial '
                'Intelligence project by engaging targeted experts from different segments of the industry to learn '
                'how best to be ethical in the 21st century. The experts put them in touch with real life scenarios '
                'that affect the industry and how to best be on the right side of everything. The project supported by '
                'Mozzilla Foundation continues to give them wonderful real-world experiences.',
  'published_at': '2023-09-26T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/the-ethical-artificial-intelligence-project-continues-to-change-the-lives-of-our-students',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/9roAvJrkNJFboSv0AS3kf1RIoGTHgg3hGtICHMhy.png',
  'display_order': 280,
  'is_featured': False},
 {'title': 'The Vice Chancellor leading Partnership Engagements to Improve the School of Education',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor met Prof. Dr. Kennedy Bota from Masinde Muliro University of Science and Technology '
             'and the University of Homburg, Germany. In a strategy session that they had, the Vice Chancellor '
             'explored the different ways Kisii University could upscale the quality of its courses in the School of '
             'Education.',
  'plain_text': 'The Vice Chancellor met Prof. Dr. Kennedy Bota from Masinde Muliro University of Science and '
                'Technology and the University of Homburg, Germany. In a strategy session that they had, the Vice '
                'Chancellor explored the different ways Kisii University could upscale the quality of its courses in '
                'the School of Education. Kisii University continues to work around the clock to ensure that its '
                'different organs are operating at an optimum capacity.',
  'published_at': '2023-09-26T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/the-vice-chancellor-leading-partnership-engagements-to-improve-the-school-of-education',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/Xydwh1FFG7tBknDgr4kXaNAWvqEIdRabuogi0iCJ.png',
  'display_order': 281,
  'is_featured': False},
 {'title': 'UASU KISII AND MOI UNIVERSITY PAY THE VICE CHANCELLOR A COURTESY CALL',
  'category': 'NEWS',
  'summary': 'The leadership of Kisii University and Moi University UASU chapters paid the Vice Chancellor a visit to '
             'continue to extend the conversational olive hand as the CEO led the University. The academic union is a '
             'key stakeholder that advances interests of academic staff that are key in the University achieving its '
             'mandate.',
  'plain_text': 'The leadership of Kisii University and Moi University UASU chapters paid the Vice Chancellor a visit '
                'to continue to extend the conversational olive hand as the CEO led the University. The academic union '
                'is a key stakeholder that advances interests of academic staff that are key in the University '
                'achieving its mandate. These forms of bilateral conversations continue to open opportunities for '
                'possible collaborations and networking for the University.',
  'published_at': '2023-09-26T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/uasu-kisii-and-moi-university-pay-the-vice-chancellor-a-courtesy-call',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/t7dOJ1JEYQa9jDJzldmeUNfliEUIISb25ipKXHHb.png',
  'display_order': 282,
  'is_featured': False},
 {'title': 'Advertisement of Vacant Positions in the School of Health Science',
  'category': 'NEWS',
  'summary': 'Kisii University seeks to fill vacancies in these positions. If you are a team player and desire to work '
             'in a World class university shaping young minds of our generation into academic and practical future '
             'giants then we are looking for you. Job Portal',
  'plain_text': 'Kisii University seeks to fill vacancies in these positions. If you are a team player and desire to '
                'work in a World class university shaping young minds of our generation into academic and practical '
                'future giants then we are looking for you. Job Portal',
  'published_at': '2023-09-22T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/advertisement-of-vacant-positions-in-the-school-of-health-science',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/XQu7CxYA0h0GFpX2Sgva5ONnrtVCrgBKPFFZvEEv.jpg',
  'display_order': 283,
  'is_featured': False},
 {'title': 'The Vice Chancellor continues to identify and engage Strategic Alliances for the benefit of Kisii '
           'University',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor earlier today hosted the Chairman and treasurer of KUPPET alongside the Chief '
             'Principal of Keroka Technical Institute in a courtesy call that aimed at discussing different ways in '
             'which academic progress could be achieved by leveraging on strategic alliances and partnerships. Kisii '
             'University',
  'plain_text': 'The Vice Chancellor earlier today hosted the Chairman and treasurer of KUPPET alongside the Chief '
                'Principal of Keroka Technical Institute in a courtesy call that aimed at discussing different ways in '
                'which academic progress could be achieved by leveraging on strategic alliances and partnerships. '
                'Kisii University continues to reach out to like minded institutions for synergistic alliances.',
  'published_at': '2023-09-20T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/the-vice-chancellor-continues-to-identify-and-engage-strategic-alliances-for-the-benefit-of-kisii-university',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/JCn5ObYU9sYBtoX87ULJNEWpNIkPzQkuiHIOjnxS.png',
  'display_order': 284,
  'is_featured': False},
 {'title': 'The Vice Chancellor Meets Deans and Directors',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor had a breakfast meeting today with Deans and Directors. The meeting was a good '
             'opportunity for the Academic Managers to interact closely with the CEO and also brief him on the current '
             'status of different items in their purview areas. The Vice Chancellor encouraged them to work hard '
             'especially now',
  'plain_text': 'The Vice Chancellor had a breakfast meeting today with Deans and Directors. The meeting was a good '
                'opportunity for the Academic Managers to interact closely with the CEO and also brief him on the '
                'current status of different items in their purview areas. The Vice Chancellor encouraged them to work '
                'hard especially now that we were already in the run in to the 12 th Graduation Ceremony.',
  'published_at': '2023-09-20T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/the-vice-chancellor-meets-deans-and-directors',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/EFVHSDwcwWiXHMEKK6IecIq1GxWyPdQ7hIYKMzf8.png',
  'display_order': 285,
  'is_featured': False},
 {'title': 'TENDER FOR SUPPLY AND DELIVERY OF SECURITY PRINTED ACADEMIC CERTIFICATES AND TRANSCRIPTS (FRAMEWORK '
           'AGREEMENT)',
  'category': 'NEWS',
  'summary': 'Normal 0 false false false EN-US X-NONE X-NONE /* Style Definitions */ table.MsoNormalTable '
             '{mso-style-name:"Table Normal"; mso-tstyle-rowband-size:0; mso-tstyle-colband-size:0; '
             'mso-style-noshow:yes; mso-style-priority:99; mso-style-parent:""; mso-padding-alt:0in 5.4pt 0in 5.4pt; '
             'mso-para-margin:0in;',
  'plain_text': 'Normal 0 false false false EN-US X-NONE X-NONE /* Style Definitions */ table.MsoNormalTable '
                '{mso-style-name:"Table Normal"; mso-tstyle-rowband-size:0; mso-tstyle-colband-size:0; '
                'mso-style-noshow:yes; mso-style-priority:99; mso-style-parent:""; mso-padding-alt:0in 5.4pt 0in '
                '5.4pt; mso-para-margin:0in; mso-para-margin-bottom:.0001pt; mso-pagination:none; text-autospace:none; '
                'font-size:11.0pt; font-family:"Calibri",sans-serif; mso-ascii-font-family:Calibri; '
                'mso-ascii-theme-font:minor-latin; mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; '
                'mso-bidi-font-family:"Times New Roman"; mso-bidi-theme-font:minor-bidi;} OPEN TENDER TENDER FOR '
                'SUPPLY AND DELIVERY OF SECURITY PRINTED ACADEMIC CERTIFICATES AND TRANSCRIPTS (FRAMEWORK AGREEMENT) '
                'TENDER REF NO.KSU/T/02/2023/2024 OPENING AND CLOSING DATE: 29TH FRIDAY SEPTEMBER 2023 TIME: 11. 30A.M '
                '(EAST AFRICA TIME) Download Tender Document Procurement Portal',
  'published_at': '2023-09-18T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/tender-for-supply-and-delivery-of-security-printed-academic-certificates-and-transcripts-framework-agreement',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/',
  'display_order': 286,
  'is_featured': False},
 {'title': 'TENDER FOR SUPPLY AND DELIVERY OF DRUGS, DRESSINGS AND INFUSIONS',
  'category': 'NEWS',
  'summary': 'v\\:* {behavior:url(#default#VML);} o\\:* {behavior:url(#default#VML);} w\\:* '
             '{behavior:url(#default#VML);} .shape {behavior:url(#default#VML);} Normal 0 false false false false '
             'EN-US X-NONE X-NONE /* Style Definitions */ table.MsoNormalTable {mso-style-name:"Table Normal"; '
             'mso-tstyle-rowband-size:0;',
  'plain_text': 'v\\:* {behavior:url(#default#VML);} o\\:* {behavior:url(#default#VML);} w\\:* '
                '{behavior:url(#default#VML);} .shape {behavior:url(#default#VML);} Normal 0 false false false false '
                'EN-US X-NONE X-NONE /* Style Definitions */ table.MsoNormalTable {mso-style-name:"Table Normal"; '
                'mso-tstyle-rowband-size:0; mso-tstyle-colband-size:0; mso-style-noshow:yes; mso-style-priority:99; '
                'mso-style-parent:""; mso-padding-alt:0in 5.4pt 0in 5.4pt; mso-para-margin:0in; '
                'mso-para-margin-bottom:.0001pt; mso-pagination:none; text-autospace:none; font-size:11.0pt; '
                'font-family:"Calibri",sans-serif; mso-ascii-font-family:Calibri; mso-ascii-theme-font:minor-latin; '
                'mso-hansi-font-family:Calibri; mso-hansi-theme-font:minor-latin; mso-bidi-font-family:"Times New '
                'Roman"; mso-bidi-theme-font:minor-bidi;} TENDER FOR SUPPLY AND DELIVERY OF DRUGS, DRESSINGS AND '
                'INFUSIONS KSU/T/03/2023 /2024 DISPATCHED ON FRIDAY 15th SEPTEMBER, 2023: OPENING AND CLOSING DATE: '
                'FRIDAY 29th SEPTEMBER, 2023:11.30 AM Download Tender Document Procurement Portal',
  'published_at': '2023-09-18T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/tender-for-supply-and-delivery-of-drugs-dressings-and-infusions',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/',
  'display_order': 287,
  'is_featured': False},
 {'title': 'Its Business all the way as the Vice Chancellor signs Kisii University’s Performance Contract with the '
           'University Council',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor on behalf of Kisii University signed the Performance Contract with the University '
             'Council to officially mark the framework of service delivery that Kisii University has committed to. The '
             "Performance Contract embodies the spirit of Kisii University's commitments for the financial year "
             '2023-2024. It',
  'plain_text': 'The Vice Chancellor on behalf of Kisii University signed the Performance Contract with the University '
                'Council to officially mark the framework of service delivery that Kisii University has committed to. '
                "The Performance Contract embodies the spirit of Kisii University's commitments for the financial year "
                '2023-2024. It establishes the professional engagements and how Kisii University will measure its '
                'success at the end of the financial year. Kisii University staff in different departments work '
                'through the year to deliver their different mandates that culminates to the University achieving the '
                'Performance Contract.',
  'published_at': '2023-09-18T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/its-business-all-the-way-as-the-vice-chancellor-signs-kisii-universitys-performance-contract-with-the-university-council',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/wruKBlStW1rLkLBSWayVuVZNqj9BfpgFyJWrzR2h.png',
  'display_order': 288,
  'is_featured': False},
 {'title': 'THE VICE CHANCELLOR CASCADES THE 2023-2024 KISII UNIVERSITY PERFORMANCE CONTRACT',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor today cascaded the 2023/2024 Financial Year Performance Contracting agreements to '
             'the respective Deputy Vice Chancellors for implementation. Kisii University continues to excel in '
             'matters performance contracting through the commitment, creativity and ingenuity of its staff. This year '
             'the University',
  'plain_text': 'The Vice Chancellor today cascaded the 2023/2024 Financial Year Performance Contracting agreements to '
                'the respective Deputy Vice Chancellors for implementation. Kisii University continues to excel in '
                'matters performance contracting through the commitment, creativity and ingenuity of its staff. This '
                'year the University is taking this success to a different level.',
  'published_at': '2023-09-13T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/the-vice-chancellor-cascades-the-2023-2024-kisii-university-performance-contract',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/6agaseZmHAUmFms6vsq1E12AuCSgrk1cSgBtHtuv.png',
  'display_order': 289,
  'is_featured': False},
 {'title': 'THE VICE CHANCELLOR LEADS US IN A COLORFUL MATRICULATION CEREMONY',
  'category': 'NEWS',
  'summary': 'The Vice Chancellor today in a colorful Matriculation Ceremony welcomed the 2023 first years. In an '
             "amazing Ceremony that brought together over 7,500 first years at the University's Chancellor's Pavilion, "
             'the VC welcomed them to Kisii University and assured them of receiving the best from Kisii University. '
             'He also',
  'plain_text': 'The Vice Chancellor today in a colorful Matriculation Ceremony welcomed the 2023 first years. In an '
                "amazing Ceremony that brought together over 7,500 first years at the University's Chancellor's "
                'Pavilion, the VC welcomed them to Kisii University and assured them of receiving the best from Kisii '
                'University. He also challenged them to reach for the best and work hard in order to better the '
                'futures.',
  'published_at': '2023-09-13T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/the-vice-chancellor-leads-us-in-a-colorful-matriculation-ceremony',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/1CMOO4QF7J5BzWLD8duoxLxJDFARC2gVIxIYzSuZ.png',
  'display_order': 290,
  'is_featured': False}]

_LIVE_SITE_BLOG_ITEMS = [{'title': 'Day 1 of Kisii University Innovation Week',
  'category': 'INNOVATION',
  'summary': 'Day one of the Inaugural Kisii University Innovation Week comes to a powerful close, marked by vibrant '
             'conversations, bold ideas, meaningful connections, and hands-on collaboration that sparked real '
             'possibilities. Tomorrow, we rise for day two with greater purpose, energized, inspired, and ready to '
             'turn vision into',
  'plain_text': 'Day one of the Inaugural Kisii University Innovation Week comes to a powerful close, marked by '
                'vibrant conversations, bold ideas, meaningful connections, and hands-on collaboration that sparked '
                'real possibilities. Tomorrow, we rise for day two with greater purpose, energized, inspired, and '
                'ready to turn vision into action.',
  'published_at': '2026-04-07T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/day-1-of-kisii-university-innovation-week',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/cXsIn1g7aVR6zbcy41zK4chEy7lhAvfkpBqcUIMJ.jpg',
  'display_order': 43,
  'is_featured': False,
  'excerpt': 'Day one of the Inaugural Kisii University Innovation Week comes to a powerful close, marked by vibrant '
             'conversations, bold ideas, meaningful connections, and hands-on collaboration that sparked real '
             'possibilities. Tomorrow, we rise for day two with greater purpose, energized, inspired, and ready to '
             'turn vision into'},
 {'title': 'INNOVATION WEEK 2026 WEBSITE',
  'category': 'RESEARCH',
  'summary': 'Kisii University Innovation Week is the flagship event of the Directorate of Research, Extension, '
             'Innovation and Resource Mobilization. It brings together students, researchers, industry leaders, '
             'government officials,and development partners under one roof to showcase innovations that matter. The '
             'event serves as a',
  'plain_text': 'Kisii University Innovation Week is the flagship event of the Directorate of Research, Extension, '
                'Innovation and Resource Mobilization. It brings together students, researchers, industry leaders, '
                'government officials,and development partners under one roof to showcase innovations that matter. The '
                'event serves as a critical bridge between academic research and real-world applications accelerating '
                "commercialization, fostering entrepreneurship, and aligning Kenya's innovation ecosystem with the "
                'United Nations Sustainable Development Goals and Kenya Vision 2030. Over four dynamic days, '
                'participants will engage in exhibitions, keynote lectures, pitching competitions, workshops, and a '
                'prestigious awards ceremony celebrating SDG-aligned innovations from across the country. VISIT OUR '
                'INNOVATIONSWEEK WEBSITE at innovationweek.kisiiuniversity.ac.ke',
  'published_at': '2026-03-31T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/innovation-week-2026-website',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/1hJScctHNTPJgj4YcxPPRnsDDddQ5U1PQXXnHszo.jpg',
  'display_order': 47,
  'is_featured': False,
  'excerpt': 'Kisii University Innovation Week is the flagship event of the Directorate of Research, Extension, '
             'Innovation and Resource Mobilization. It brings together students, researchers, industry leaders, '
             'government officials,and development partners under one roof to showcase innovations that matter. The '
             'event serves as a'},
 {'title': 'HERI Africa Research Program Launch',
  'category': 'RESEARCH',
  'summary': 'In a spectacular and courageous triumph of vision and purpose, Kisii University proudly hosted the '
             'Cabinet Secretary for Education, Hon. Julius Ogamba, EBS, as he presided over the historic tripartite '
             'launch of the HERI Africa Research Program, the HERI Africa Research Offices at Kisii University, and '
             'the National',
  'plain_text': 'In a spectacular and courageous triumph of vision and purpose, Kisii University proudly hosted the '
                'Cabinet Secretary for Education, Hon. Julius Ogamba, EBS, as he presided over the historic tripartite '
                'launch of the HERI Africa Research Program, the HERI Africa Research Offices at Kisii University, and '
                'the National Economic Research Agenda. This landmark moment was more than a ceremonial unveiling, it '
                'was a bold declaration of Africa,s intellectual sovereignty. It signalled a future where African '
                'scholars define priorities, generate knowledge, and shape solutions rooted in our realities and '
                'aspirations. By opening its doors to HERI Africa and aligning with forward-looking partners, Kisii '
                'University stands firmly at the frontier of transformative scholarship, championing a new era where '
                'African researchers drive African research for African prosperity. Today, we did not simply host an '
                'event; we embraced a vision. And in that vision lies the promise of innovation, economic empowerment, '
                'and a continent confidently charting its own course.',
  'published_at': '2026-02-20T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/heri-africa-research-program-launch',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/xW9LcG9rcKrRGoOgIOhurepUJcOzuSZVO7m49bqB.jpg',
  'display_order': 60,
  'is_featured': False,
  'excerpt': 'In a spectacular and courageous triumph of vision and purpose, Kisii University proudly hosted the '
             'Cabinet Secretary for Education, Hon. Julius Ogamba, EBS, as he presided over the historic tripartite '
             'launch of the HERI Africa Research Program, the HERI Africa Research Offices at Kisii University, and '
             'the National'},
 {'title': 'HERI AFRICA LAUNCH- FEBRUARY 2026 [LIVE]',
  'category': 'RESEARCH',
  'summary': 'HERI AFRICA LAUNCH- FEBRUARY 2026 [LIVE] is published on the official Kisii University website.',
  'plain_text': 'HERI AFRICA LAUNCH- FEBRUARY 2026 [LIVE] is published on the official Kisii University website.',
  'published_at': '2026-02-19T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/heri-africa-launch-february-2026-live',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/5QNdpiM4gKVVYtzrwCmbltmDQWe1gfSk9zKlutQQ.jpg',
  'display_order': 61,
  'is_featured': False,
  'excerpt': 'HERI AFRICA LAUNCH- FEBRUARY 2026 [LIVE] is published on the official Kisii University website.'},
 {'title': 'Prof. Sawada from The University of Tsukuba, Japan explores developing joint research proposals with SANRM',
  'category': 'RESEARCH',
  'summary': 'Under the visionary leadership of the Vice Chancellor, Kisii University proudly hosted Prof. Sawada from '
             'the University of Tsukuba, Japan, a distinguished scholar supported by the Japan Society for the '
             'Promotion of Science (JSPS) through the Overseas Challenge Program for Young Researchers. During his '
             'visit to Kenya,',
  'plain_text': 'Under the visionary leadership of the Vice Chancellor, Kisii University proudly hosted Prof. Sawada '
                'from the University of Tsukuba, Japan, a distinguished scholar supported by the Japan Society for the '
                'Promotion of Science (JSPS) through the Overseas Challenge Program for Young Researchers. During his '
                'visit to Kenya, Prof. Sawada is working closely with our School of Agriculture and Natural Resources '
                'Management to develop joint research proposals while exploring rich opportunities for collaboration '
                'and academic exchange. This engagement reaffirms Kisii University,s unwavering commitment to building '
                'meaningful partnerships with like-minded institutions across the globe. Together, we are pushing '
                'boundaries, expanding knowledge, and scaling new heights of academic excellence',
  'published_at': '2026-02-05T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/prof-sawada-from-the-university-of-tsukuba-japan-explores-developing-joint-research-proposals-with-sanrm',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/nB2Zcc64MzdrnQWoo8UGRfwW9fPokM8vy0Nu9RvT.jpg',
  'display_order': 74,
  'is_featured': False,
  'excerpt': 'Under the visionary leadership of the Vice Chancellor, Kisii University proudly hosted Prof. Sawada from '
             'the University of Tsukuba, Japan, a distinguished scholar supported by the Japan Society for the '
             'Promotion of Science (JSPS) through the Overseas Challenge Program for Young Researchers. During his '
             'visit to Kenya,'},
 {'title': 'Kenya National Research Festival 2025',
  'category': 'RESEARCH',
  'summary': 'Opening the Kenya National Research Festival in style, Kisii University proudly unveiled its exhibition '
             'stand, with the very first guest of honor being Prof. Abdulrazak Shaukat, the Principal Secretary for '
             'Science, Research, and Innovation. The University is showcasing groundbreaking projects aligned to '
             'climate',
  'plain_text': 'Opening the Kenya National Research Festival in style, Kisii University proudly unveiled its '
                'exhibition stand, with the very first guest of honor being Prof. Abdulrazak Shaukat, the Principal '
                'Secretary for Science, Research, and Innovation. The University is showcasing groundbreaking projects '
                'aligned to climate action, food security, and sustainability areas that resonate deeply with our '
                'commitment to building solutions for today and tomorrow. True to our inclusive and borderless agenda, '
                'these innovations are not just for Kisii University, but for communities across Kenya, Africa, and '
                'the globe. Here, research knows no boundaries, and every voice, idea, and perspective finds a place '
                'in shaping a sustainable and resilient future Kenya National Research Festival 2025 Innovations',
  'published_at': '2025-08-19T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kenya-national-research-festival-2025',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/Y7IEM5fIM1tyoYJ89by1fPneZhNe6q1TSa7r8YRA.jpg',
  'display_order': 124,
  'is_featured': False,
  'excerpt': 'Opening the Kenya National Research Festival in style, Kisii University proudly unveiled its exhibition '
             'stand, with the very first guest of honor being Prof. Abdulrazak Shaukat, the Principal Secretary for '
             'Science, Research, and Innovation. The University is showcasing groundbreaking projects aligned to '
             'climate'},
 {'title': 'Responsible Computing Innovation Day Awards',
  'category': 'INNOVATION',
  'summary': 'With a fathers pride and admiration, the Vice Chancellor received and awarded the winning projects from '
             'the Responsible Computing Innovation Day and listened to his students defend the brilliant ideas that '
             'will change the next frontier of how technology relates to every aspect of our lives. Kisii University '
             'continues',
  'plain_text': 'With a fathers pride and admiration, the Vice Chancellor received and awarded the winning projects '
                'from the Responsible Computing Innovation Day and listened to his students defend the brilliant ideas '
                'that will change the next frontier of how technology relates to every aspect of our lives. Kisii '
                'University continues to stay relevant, true and on top of its game in creating future industry '
                'captains and managers.',
  'published_at': '2025-04-24T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/responsible-computing-innovation-day-awards',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/abs9pxPPxlRK8NsOsKsSGcTZWBuRg8UoYLPd2jG5.jpg',
  'display_order': 172,
  'is_featured': False,
  'excerpt': 'With a fathers pride and admiration, the Vice Chancellor received and awarded the winning projects from '
             'the Responsible Computing Innovation Day and listened to his students defend the brilliant ideas that '
             'will change the next frontier of how technology relates to every aspect of our lives. Kisii University '
             'continues'},
 {'title': 'Mozilla Sponsored Responsible Computing Innovation Day',
  'category': 'INNOVATION',
  'summary': 'In a great show of creativity, ingenuity and excellent mastery of their subject matter, students from '
             'the School of Information Science & Technology presented their innovations earlier today competing in '
             'the Mozilla Sponsored Responsible Computing Innovation Day. By the end of the day, it was feisty to say '
             'we have',
  'plain_text': 'In a great show of creativity, ingenuity and excellent mastery of their subject matter, students from '
                'the School of Information Science & Technology presented their innovations earlier today competing in '
                'the Mozilla Sponsored Responsible Computing Innovation Day. By the end of the day, it was feisty to '
                'say we have skilled students in the hands of expert Lecturers.',
  'published_at': '2025-04-24T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/mozilla-sponsored-responsible-computing-innovation-day',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/QqD8ha1koXoJQES9sCBN6ZE5h6h49I4ehpUyNl1c.jpg',
  'display_order': 173,
  'is_featured': False,
  'excerpt': 'In a great show of creativity, ingenuity and excellent mastery of their subject matter, students from '
             'the School of Information Science & Technology presented their innovations earlier today competing in '
             'the Mozilla Sponsored Responsible Computing Innovation Day. By the end of the day, it was feisty to say '
             'we have'},
 {'title': '15th International Invention Fair',
  'category': 'INNOVATION',
  'summary': '15th International Invention Fair is published on the official Kisii University website.',
  'plain_text': '15th International Invention Fair is published on the official Kisii University website.',
  'published_at': '2025-04-11T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/15th-international-invention-fair',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/PwIQfvEFlqsFvWUdnW7wkReH6iOEQRHZcxMNDeMP.png',
  'display_order': 181,
  'is_featured': False,
  'excerpt': '15th International Invention Fair is published on the official Kisii University website.'},
 {'title': 'SASS Workshop: Climate Adaptation and Resilience Strategies',
  'category': 'RESEARCH',
  'summary': 'In a life-changing project dubbed the Climate Adaptation and Resilience Strategies (CLARS), the School '
             'of Arts and Social Sciences today conducted a breaking in workshop aimed at creating a transformative '
             'research initiative that seeks to examine the intersection of gender, social inequalities, and '
             'climate-related',
  'plain_text': 'In a life-changing project dubbed the Climate Adaptation and Resilience Strategies (CLARS), the '
                'School of Arts and Social Sciences today conducted a breaking in workshop aimed at creating a '
                'transformative research initiative that seeks to examine the intersection of gender, social '
                'inequalities, and climate-related socio-economic vulnerabilities. In partnership with McMaster '
                'University, Kisii University represented by Co-investigator, Dr. Peter Gutwa aim to prioritize the '
                'active involvement of marginalized communities, including persons with disabilities, migrants with '
                'irregular status, individuals with diverse gender identities and/or expressions, and older peoples, '
                'in shaping climate adaptation, resilience strategies, and migration policies. Kisii University '
                'continues to step out and stand out in partnering for excellence, nationally and internationally',
  'published_at': '2025-04-07T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/sass-workshop-climate-adaptation-and-resilience-strategies',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/o1XpN87U4gvdcmaXhi3sD9atnttW9eGOPFrvzSaP.jpg',
  'display_order': 182,
  'is_featured': False,
  'excerpt': 'In a life-changing project dubbed the Climate Adaptation and Resilience Strategies (CLARS), the School '
             'of Arts and Social Sciences today conducted a breaking in workshop aimed at creating a transformative '
             'research initiative that seeks to examine the intersection of gender, social inequalities, and '
             'climate-related'},
 {'title': 'KSU Workshop: Strategies For Managing Evolving Workplace',
  'category': 'RESEARCH',
  'summary': 'The School of Business created a dynamic event that brought together HR students from Kisii University, '
             'Kabianga University, Rongo University, Maseno University, and Kisii National Polytechnic, with Maasai '
             'Mara University and JKUAT joining virtually This provided a collaborative space for emerging HR leaders '
             'to',
  'plain_text': 'The School of Business created a dynamic event that brought together HR students from Kisii '
                'University, Kabianga University, Rongo University, Maseno University, and Kisii National Polytechnic, '
                'with Maasai Mara University and JKUAT joining virtually This provided a collaborative space for '
                'emerging HR leaders to exchange innovative ideas and strategies for managing the evolving challenges '
                "of today's workplace. Kisii University continues to be an excellent leader according her students "
                'invaluable opportunities to interact, learn from and connect with various industry leaders in their '
                'specific profession',
  'published_at': '2025-03-24T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ksu-workshop-strategies-for-managing-evolving-workplace',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/1ZD78LDtQDCU9Y23eBlggxROnlaDmOC9XbMZE3fO.jpg',
  'display_order': 185,
  'is_featured': False,
  'excerpt': 'The School of Business created a dynamic event that brought together HR students from Kisii University, '
             'Kabianga University, Rongo University, Maseno University, and Kisii National Polytechnic, with Maasai '
             'Mara University and JKUAT joining virtually This provided a collaborative space for emerging HR leaders '
             'to'},
 {'title': 'Mozilla Responsible Computing Challenge Shaping Ideas',
  'category': 'RESEARCH',
  'summary': 'Exploring a new and effective way of passing knowledge the School of Information Science and Technology '
             'brought together industry captains and powerful leads in various disciplines to help shape the ideas of '
             'the fourth years Computing Sciences students. In a project in partnership with Mozilla Foundation dubbed',
  'plain_text': 'Exploring a new and effective way of passing knowledge the School of Information Science and '
                'Technology brought together industry captains and powerful leads in various disciplines to help shape '
                'the ideas of the fourth years Computing Sciences students. In a project in partnership with Mozilla '
                'Foundation dubbed Responsible Computing Challenge, Kisii University continues to renew its commitment '
                'to producing high level graduates.',
  'published_at': '2025-03-24T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/mozilla-responsible-computing-challenge-shaping-ideas',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/e2RydgLxod9kGE2w0sWbRJMiAUe89V0Ujyprktw9.jpg',
  'display_order': 186,
  'is_featured': False,
  'excerpt': 'Exploring a new and effective way of passing knowledge the School of Information Science and Technology '
             'brought together industry captains and powerful leads in various disciplines to help shape the ideas of '
             'the fourth years Computing Sciences students. In a project in partnership with Mozilla Foundation '
             'dubbed'},
 {'title': 'Grant Writing Capacity-building Training',
  'category': 'RESEARCH',
  'summary': 'Kisii University, through the Department of Research, Extension, Innovation & Resource Mobilization '
             '(REIRM) held a Grant Writing Capacity-building Training for its Academicians. The programme facilitated '
             'by the Ministry of Education, State Department for Higher Education and Research aimed at increasing the '
             'research',
  'plain_text': 'Kisii University, through the Department of Research, Extension, Innovation & Resource Mobilization '
                '(REIRM) held a Grant Writing Capacity-building Training for its Academicians. The programme '
                'facilitated by the Ministry of Education, State Department for Higher Education and Research aimed at '
                'increasing the research operational purview of our academic staff and revealing wider fishing grounds '
                'full of opportunities worthy of pursuit. The scholars were equipped with modern tools on Academic '
                'Research Grant Writing and various solutions to todays societal challenges. Kisii University '
                'continues to empower and enrich her staff in order to give our students the best possible caliber of '
                'staff to guide them into their respective futures.',
  'published_at': '2025-03-13T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/grant-writing-capacity-building-training',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/Tq1utAjrDPxaWYCvSOgzo13K1zyB0Dqm9W19lst1.jpg',
  'display_order': 191,
  'is_featured': False,
  'excerpt': 'Kisii University, through the Department of Research, Extension, Innovation & Resource Mobilization '
             '(REIRM) held a Grant Writing Capacity-building Training for its Academicians. The programme facilitated '
             'by the Ministry of Education, State Department for Higher Education and Research aimed at increasing the '
             'research'},
 {'title': 'Advancing Partnerships for Research',
  'category': 'RESEARCH',
  'summary': 'The Vice Chancellor hosted a research team led by Dr. Elizabeth Meassick, Former Director of Excellence '
             'at USAID, Kenya and Claire Nyapucha from Prosper Bridge Consulting on the occasion of their visit to '
             'Kisii University to advance partnerships for research and development in School of Agriculture and '
             'Natural',
  'plain_text': 'The Vice Chancellor hosted a research team led by Dr. Elizabeth Meassick, Former Director of '
                'Excellence at USAID, Kenya and Claire Nyapucha from Prosper Bridge Consulting on the occasion of '
                'their visit to Kisii University to advance partnerships for research and development in School of '
                'Agriculture and Natural Resource Management. Kisii University continues to strategically explore '
                'like-minded organizations, partners and people to help co-create desirable futures in academics, '
                'economy, health and education.',
  'published_at': '2025-03-13T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/advancing-partnerships-for-research',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/inyngcQ3MGMUuqT2RdMYtdVhrUbBTGKtcwk7tORp.jpg',
  'display_order': 192,
  'is_featured': False,
  'excerpt': 'The Vice Chancellor hosted a research team led by Dr. Elizabeth Meassick, Former Director of Excellence '
             'at USAID, Kenya and Claire Nyapucha from Prosper Bridge Consulting on the occasion of their visit to '
             'Kisii University to advance partnerships for research and development in School of Agriculture and '
             'Natural'},
 {'title': 'Nyanza International Investment conference',
  'category': 'INNOVATION',
  'summary': 'The Vice Chancellor today alongside several other Vice Chancellors met the Deputy Chief of Staff as he '
             'chaired a meeting with the Nyanza International Investment Conference Committee. The meeting unpacked '
             'vivid expectations, opportunities and programs that will be fielded in the forthcoming Nyanza '
             'International',
  'plain_text': 'The Vice Chancellor today alongside several other Vice Chancellors met the Deputy Chief of Staff as '
                'he chaired a meeting with the Nyanza International Investment Conference Committee. The meeting '
                'unpacked vivid expectations, opportunities and programs that will be fielded in the forthcoming '
                'Nyanza International Investment Conference to be held in Ciala Resort from 6th to 8th February 2025.',
  'published_at': '2025-01-28T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/nyanza-international-investment-conference',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/w0ZgIBIifH3302JTT4TsgrWGIYJrO5PgKW4HelRy.jpg',
  'display_order': 201,
  'is_featured': False,
  'excerpt': 'The Vice Chancellor today alongside several other Vice Chancellors met the Deputy Chief of Staff as he '
             'chaired a meeting with the Nyanza International Investment Conference Committee. The meeting unpacked '
             'vivid expectations, opportunities and programs that will be fielded in the forthcoming Nyanza '
             'International'},
 {'title': 'Mozilla Foundation Responsible Computing Challenge',
  'category': 'RESEARCH',
  'summary': 'Kisii University Students from School of Information Science & Technology overwhelmingly embraced '
             'tutelage in matters ethics in the design and creation of their fourth year project. Having been exposed '
             'to responsible computing concepts courtesy of Mozilla Foundation and Kisii University partnership, they '
             'have',
  'plain_text': 'Kisii University Students from School of Information Science & Technology overwhelmingly embraced '
                'tutelage in matters ethics in the design and creation of their fourth year project. Having been '
                'exposed to responsible computing concepts courtesy of Mozilla Foundation and Kisii University '
                'partnership, they have developed a keen and unique interest in considering ethics while creating '
                'computer systems. Kisii University continues to seek and retain partnerships that have a direct push '
                'to scaling up the quality of graduates we release to the market.',
  'published_at': '2025-01-29T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/mozilla-foundation-responsible-computing-challenge',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/OYYviaxMG7P0lNXUCHGSe4hlvrkIHHNZeg0AkMVc.jpg',
  'display_order': 205,
  'is_featured': False,
  'excerpt': 'Kisii University Students from School of Information Science & Technology overwhelmingly embraced '
             'tutelage in matters ethics in the design and creation of their fourth year project. Having been exposed '
             'to responsible computing concepts courtesy of Mozilla Foundation and Kisii University partnership, they '
             'have'},
 {'title': 'Mozilla Responsible Computing Challenge 2nd Phase begins',
  'category': 'RESEARCH',
  'summary': 'The faculty team from our School of Information Science and technology set the ball rolling with a hot '
             'intuitive workshop session that marked the beginning of the 2nd phase of the responsible computing '
             'challenge in Kisii University. Bringing all these tech minds together provided a rich ground for '
             'harvesting the right',
  'plain_text': 'The faculty team from our School of Information Science and technology set the ball rolling with a '
                'hot intuitive workshop session that marked the beginning of the 2nd phase of the responsible '
                'computing challenge in Kisii University. Bringing all these tech minds together provided a rich '
                'ground for harvesting the right ideas to push forward the ethics agenda through advocating for '
                'responsible computing.',
  'published_at': '2025-01-28T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/mozilla-responsible-computing-challenge-2nd-phase-begins',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/547Nr9x1BkS7amVE7wMDg2i1KNG2sdhq1D7M2G2O.jpg',
  'display_order': 207,
  'is_featured': False,
  'excerpt': 'The faculty team from our School of Information Science and technology set the ball rolling with a hot '
             'intuitive workshop session that marked the beginning of the 2nd phase of the responsible computing '
             'challenge in Kisii University. Bringing all these tech minds together provided a rich ground for '
             'harvesting the right'},
 {'title': 'Mozilla Responsible Computing Challenge project',
  'category': 'RESEARCH',
  'summary': 'Today we set the ball rolling on Phase 2 of the Responsible Computing Challenge project with two '
             'inciting workshops for our faculty and our students in the computing sciences program. This intuitive '
             'project has helped them to start asking the right questions with regards to ethics in dealing with '
             'different computer',
  'plain_text': 'Today we set the ball rolling on Phase 2 of the Responsible Computing Challenge project with two '
                'inciting workshops for our faculty and our students in the computing sciences program. This intuitive '
                'project has helped them to start asking the right questions with regards to ethics in dealing with '
                'different computer systems',
  'published_at': '2025-01-28T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/mozilla-responsible-computing-challenge-project',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/Bzw1uag6HA1zAFz5eCpy8CggmDOweknQNT7rAdRk.jpg',
  'display_order': 209,
  'is_featured': False,
  'excerpt': 'Today we set the ball rolling on Phase 2 of the Responsible Computing Challenge project with two '
             'inciting workshops for our faculty and our students in the computing sciences program. This intuitive '
             'project has helped them to start asking the right questions with regards to ethics in dealing with '
             'different computer'},
 {'title': 'Partnering University of Minnesota',
  'category': 'RESEARCH',
  'summary': 'This morning, the Vice Chancellor hosted a team from the University of Minnesota, USA. Kisii University '
             'and the University of Minnesota have had a long-standing partnership over the years promoting various '
             'staff and student development programmes from both institutions. To even further enhance our working',
  'plain_text': 'This morning, the Vice Chancellor hosted a team from the University of Minnesota, USA. Kisii '
                'University and the University of Minnesota have had a long-standing partnership over the years '
                'promoting various staff and student development programmes from both institutions. To even further '
                'enhance our working collaborations the University of Minnesota in its latest bid is supporting Kisii '
                'University with over 660,000 US Dollars (77,000,000 Kenya Shillings) in research funds over the next '
                '3 years. Kisii University continues to attain and maintain strategic partnerships akin to our growth '
                'trajectory',
  'published_at': '2024-09-10T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/partnering-university-of-minnesota',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/fLeMmBlmXHF4Z10N5YQr15s8ZfwCCJOXGrdSHPzM.jpg',
  'display_order': 222,
  'is_featured': False,
  'excerpt': 'This morning, the Vice Chancellor hosted a team from the University of Minnesota, USA. Kisii University '
             'and the University of Minnesota have had a long-standing partnership over the years promoting various '
             'staff and student development programmes from both institutions. To even further enhance our working'},
 {'title': 'Ai-Driven Carbon Emissions Tracking And Mitigation System',
  'category': 'INNOVATION',
  'summary': 'Ai-Driven Carbon Emissions Tracking And Mitigation System is published on the official Kisii University '
             'website.',
  'plain_text': 'Ai-Driven Carbon Emissions Tracking And Mitigation System is published on the official Kisii '
                'University website.',
  'published_at': '2024-07-12T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ai-driven-carbon-emissions-tracking-and-mitigation-system',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/cnhv4x35bibTgLgEZW4k1isXn1aUbwuGZBJhifAv.jpg',
  'display_order': 235,
  'is_featured': False,
  'excerpt': 'Ai-Driven Carbon Emissions Tracking And Mitigation System is published on the official Kisii University '
             'website.'},
 {'title': 'Visual AI-Assistant-for the Visually Impaired System',
  'category': 'INNOVATION',
  'summary': 'Visual AI-Assistant-for the Visually Impaired System is published on the official Kisii University '
             'website.',
  'plain_text': 'Visual AI-Assistant-for the Visually Impaired System is published on the official Kisii University '
                'website.',
  'published_at': '2024-07-12T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/visual-ai-assistant-for-the-visually-impaired-system',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/aq9EjO1ft03UvmztDqO7NQ28keWFNDZHlwdXrrZp.jpg',
  'display_order': 236,
  'is_featured': False,
  'excerpt': 'Visual AI-Assistant-for the Visually Impaired System is published on the official Kisii University '
             'website.'},
 {'title': 'Revolutionizing Mental Health Support: The Therax Journey',
  'category': 'INNOVATION',
  'summary': 'Revolutionizing Mental Health Support: The Therax Journey is published on the official Kisii University '
             'website.',
  'plain_text': 'Revolutionizing Mental Health Support: The Therax Journey is published on the official Kisii '
                'University website.',
  'published_at': '2024-07-12T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/revolutionizing-mental-health-support-the-therax-journey',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/WimyJTXpuhSkdUU2Gn0qXjj7KpyZaHjz6UOgj6vE.jpg',
  'display_order': 237,
  'is_featured': False,
  'excerpt': 'Revolutionizing Mental Health Support: The Therax Journey is published on the official Kisii University '
             'website.'},
 {'title': 'A.I. Powered Mental Health System',
  'category': 'INNOVATION',
  'summary': 'We Celebrate our Computer Science Student Davis Ogega who has developed an A.I. Powered Mental Health '
             'System that gives you comfort and mental support at no cost. With the rise in mental health issues Kisii '
             'University is helping create solutions to avert possible crises in the near and distant futures.',
  'plain_text': 'We Celebrate our Computer Science Student Davis Ogega who has developed an A.I. Powered Mental Health '
                'System that gives you comfort and mental support at no cost. With the rise in mental health issues '
                'Kisii University is helping create solutions to avert possible crises in the near and distant '
                'futures.',
  'published_at': '2024-06-19T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/ai-powered-mental-health-system',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/JH3ZLbbt7i7UeDPcqEjdcrGxg9ZaR8INKQX36RLd.jpg',
  'display_order': 240,
  'is_featured': False,
  'excerpt': 'We Celebrate our Computer Science Student Davis Ogega who has developed an A.I. Powered Mental Health '
             'System that gives you comfort and mental support at no cost. With the rise in mental health issues Kisii '
             'University is helping create solutions to avert possible crises in the near and distant futures.'},
 {'title': 'KISII UNIVERSITY AND KISII SCHOOL STEP UP JOINT PARTNERSHIPS',
  'category': 'INNOVATION',
  'summary': 'The Vice Chancellor led the University Management in partnership discussions with the Kisii School Board '
             'of Management today. The discussions started a hopefully long and mutually beneficial working '
             'partnership between the two Institutions. The two Institutions resolved to partner in revolutionizing '
             'academic standards',
  'plain_text': 'The Vice Chancellor led the University Management in partnership discussions with the Kisii School '
                'Board of Management today. The discussions started a hopefully long and mutually beneficial working '
                'partnership between the two Institutions. The two Institutions resolved to partner in revolutionizing '
                'academic standards in Kisii region as well stepping up their individual and collective efforts of '
                'community engagement. They also committed to utilize their infrastructure jointly as well as work to '
                'patent ideas and innovations that will be created in future endeavors. In this partnership, Kisii '
                'University would also consider Kisii School students for scholarship and encourage knowledge transfer '
                'flowing both ways.',
  'published_at': '2023-09-12T12:00:00+03:00',
  'source_url': 'https://kisiiuniversity.ac.ke/blog/kisii-university-and-kisii-school-step-up-joint-partnerships',
  'source_image_url': 'https://kisiiuniversity.ac.ke/storage/public/resources/55WEXvgk5Nz5YCdSaDPI47SXYaG7Ham9Qa6AKkz5.png',
  'display_order': 291,
  'is_featured': False,
  'excerpt': 'The Vice Chancellor led the University Management in partnership discussions with the Kisii School Board '
             'of Management today. The discussions started a hopefully long and mutually beneficial working '
             'partnership between the two Institutions. The two Institutions resolved to partner in revolutionizing '
             'academic standards'}]

_LIVE_SITE_EVENT_ITEMS = [{'title': 'KSU 15th Graduation Ceremony',
  'summary': '<p>The 15th Graduation Ceremony is right here with us.&nbsp;</p>',
  'plain_text': '<p>The 15th Graduation Ceremony is right here with us.&nbsp;</p>',
  'start_date': '2026-03-12T08:00:00+03:00',
  'end_date': '2026-03-12T17:00:00+03:00',
  'location': 'Kisii University',
  'source_url': 'https://kisiiuniversity.ac.ke/event/ksu-15th-graduation-ceremony',
  'source_image_url': 'https://localist-images.azureedge.net/photos/39484798898259/huge/1131ffcbc27c027f2abee27276c976592109ef97.jpg',
  'display_order': 10,
  'is_featured': True},
 {'title': 'Innovation Week 2026',
  'summary': '<p>Innovation and creativity is the lifeblood that powers the Kisii University engine. Are you aware '
             'that the Innovation Week is just around the corner?</p><p>For More Info Email&nbsp; <b>&nbsp;<font '
             'color="#0000ff">innovationweek@kisiiuniversity.ac.ke</font></b></p>',
  'plain_text': '<p>Innovation and creativity is the lifeblood that powers the Kisii University engine. Are you aware '
                'that the Innovation Week is just around the corner?</p><p>For More Info Email&nbsp; <b>&nbsp;<font '
                'color="#0000ff">innovationweek@kisiiuniversity.ac.ke</font></b></p>',
  'start_date': '2026-04-07T08:00:00+03:00',
  'end_date': '2026-04-07T17:00:00+03:00',
  'location': 'Kisii University',
  'source_url': 'https://kisiiuniversity.ac.ke/event/innovation-week-2026',
  'source_image_url': 'https://localist-images.azureedge.net/photos/39484798898259/huge/1131ffcbc27c027f2abee27276c976592109ef97.jpg',
  'display_order': 11,
  'is_featured': True},
 {'title': '3rd Multidisciplinary Kisii University Conference Abstract Submission',
  'summary': '<p>The 3rd Multidisciplinary Kisii University Conference is drawing closer and you haven’t submitted '
             'your Abstract yet. Take note that you have only until 20th March to do so to be a part of this wonderful '
             'experience.&nbsp;</p><p><b><u><span style="font-family: " segoe="" ui";"="">IMPORTANT '
             'DATES</span></u></b></p><p>📄 Abstract &amp; Papers: <b><font color="#0000ff">20 March '
             '2026</font></b><br>📝 Acceptance Notification :<b> <font color="#0000ff">27 March 2026</font></b><br>📅 '
             'Payment: <b><font color="#0000ff">3rd April 2026</font></b><span style="font-family: " segoe="" '
             'ui";"="">\ufeff</span><br>📧 Full Paper Submission : <b><font color="#0000ff">17th April '
             '2026</font></b></p><p><b>For More info Email</b>&nbsp;<b> -</b>&nbsp; &nbsp;<font '
             'color="#0000ff"><b>ksuconference@kisiiuniversity.ac.ke</b></font></p>',
  'plain_text': '<p>The 3rd Multidisciplinary Kisii University Conference is drawing closer and you haven’t submitted '
                'your Abstract yet. Take note that you have only until 20th March to do so to be a part of this '
                'wonderful experience.&nbsp;</p><p><b><u><span style="font-family: " segoe="" ui";"="">IMPORTANT '
                'DATES</span></u></b></p><p>📄 Abstract &amp; Papers: <b><font color="#0000ff">20 March '
                '2026</font></b><br>📝 Acceptance Notification :<b> <font color="#0000ff">27 March 2026</font></b><br>📅 '
                'Payment: <b><font color="#0000ff">3rd April 2026</font></b><span style="font-family: " segoe="" '
                'ui";"="">\ufeff</span><br>📧 Full Paper Submission : <b><font color="#0000ff">17th April '
                '2026</font></b></p><p><b>For More info Email</b>&nbsp;<b> -</b>&nbsp; &nbsp;<font '
                'color="#0000ff"><b>ksuconference@kisiiuniversity.ac.ke</b></font></p>',
  'start_date': '2026-06-09T08:00:00+03:00',
  'end_date': '2026-06-09T17:00:00+03:00',
  'location': 'Kisii University',
  'source_url': 'https://kisiiuniversity.ac.ke/event/3rd-multidisciplinary-kisii-university-conference-abstract-submission',
  'source_image_url': 'https://localist-images.azureedge.net/photos/39484798898259/huge/1131ffcbc27c027f2abee27276c976592109ef97.jpg',
  'display_order': 12,
  'is_featured': True}]

LIVE_SITE_NEWS_ITEMS = _hydrate(_LIVE_SITE_NEWS_ITEMS)
LIVE_SITE_BLOG_ITEMS = _hydrate(_LIVE_SITE_BLOG_ITEMS)
LIVE_SITE_EVENT_ITEMS = _hydrate(_LIVE_SITE_EVENT_ITEMS)

__all__ = ["LIVE_SITE_NEWS_ITEMS", "LIVE_SITE_BLOG_ITEMS", "LIVE_SITE_EVENT_ITEMS"]
