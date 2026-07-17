"""Shared helpers and source-backed KSU seed data."""

from __future__ import annotations

import uuid
import hashlib
import shutil
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.helpers.storage import get_public_url
from app.models import (
    AcademicCalendar,
    AdmissionInfo,
    Board,
    Campus,
    Department,
    DepartmentService,
    Division,
    Intake,
    Media,
    Person,
    Permission,
    Programme,
    ProgrammeIntake,
    ProgrammeTutor,
    Role,
    RolePermission,
    School,
    StaffAssignment,
    User,
    UserRole,
    UniversityInfo,
    Wing,
)
from app.schemas.base import slugify
from app.helpers.password import hash_password
from .seed_handbook import (
    HANDBOOK_DEPARTMENT_SEED_SPECS,
    HANDBOOK_LIBRARY_FACTS,
    HANDBOOK_RESEARCH_FACTS,
    HANDBOOK_SCHOOL_FACTS,
    HANDBOOK_SOURCE,
    HANDBOOK_STUDENT_AFFAIRS_FACTS,
)


LEADERSHIP_PEOPLE: dict[str, dict[str, Any]] = {
    "council_chair": {
        "full_name": "Sara Jerop Ruto",
        "title": "Dr.",
        "institutional_role": "university_council_chairperson",
        "bio": "Chairperson of the University Council as listed on the governance page.",
        "qualifications": [
            {
                "degree": "PhD",
                "field": "Education",
                "institution": "University of Heidelberg, Germany",
                "year": 0,
            },
            {
                "degree": "Master of Education",
                "field": "Education",
                "institution": "Kenyatta University",
                "year": 0,
            },
            {
                "degree": "B.Ed",
                "field": "Education",
                "institution": "Kenyatta University",
                "year": 0,
            },
        ],
    },
    "vice_chancellor": {
        "full_name": "Nathan Oyori Ogechi",
        "title": "Prof. Dr.",
        "institutional_role": "vice_chancellor",
        "bio": (
            "Prof. Dr. Nathan Oyori Ogechi is the Vice-Chancellor of Kisii University, serving as secretary "
            "to Council, day-to-day administrative and academic head, chair of the University Management "
            "Board, and chair of Senate."
        ),
        "full_bio": (
            "Prof. Dr. Nathan Oyori Ogechi is the Vice-Chancellor of Kisii University. His career spans "
            "university leadership, research, teaching, publishing, translation, and language policy work. "
            "Before joining Kisii University as Vice-Chancellor in September 2023, he served Moi University "
            "in senior leadership roles including Deputy Vice Chancellor for Student Affairs, Acting Deputy "
            "Vice Chancellor for Administration, Planning and Development, Acting Deputy Vice Chancellor for "
            "Academics, Research and Extension, Dean of the School of Arts and Social Sciences, and Head of "
            "the Department of Kiswahili and Other African Languages. He is a Professor of African "
            "Linguistics whose work focuses on African languages, Kiswahili, Ekegusii, Sheng, language "
            "contact, communication, linguistic human rights, language planning, and transformative "
            "leadership."
        ),
        "email": "nogechi@kisiiuniversity.ac.ke",
        "phone": "+254726297952",
        "office_location": "Office of the Vice Chancellor, Kisii University",
        "office_phone": "+254726297952",
        "academic_rank": "professor",
        "specialization": (
            "Linguistics and African Languages with a focus on Kiswahili, Ekegusii and Sheng codes; "
            "Translation and Communication"
        ),
        "is_researcher": True,
        "publications_count": 59,
        "research_interests": [
            "Language contact phenomena",
            "Language and culture",
            "Language education",
            "Morphosyntax",
            "Phonology",
            "African languages and publishing",
            "Ethno-semantics",
            "Onomastics",
            "Communication",
            "Linguistic human rights",
            "Language and HIV/Aids",
            "Language and politics",
            "Language and new communication technologies",
            "Language and peace",
            "Language, ethnicity and identity",
            "Language planning",
            "Transformative leadership",
            "Language and race",
        ],
        "qualifications": [
            {
                "degree": "PhD",
                "field": "African Linguistics",
                "institution": "University of Hamburg, Germany",
                "year": 2000,
            },
            {
                "degree": "MPhil.",
                "field": "Kiswahili Studies",
                "institution": "Moi University, Eldoret",
                "year": 1993,
            },
            {
                "degree": "B.Ed (Arts)",
                "field": "Arts",
                "institution": "Moi University, Eldoret",
                "year": 1990,
            },
        ],
        "publication_records": [
            {
                "title": "Taratibu za Kuendesha Utafiti na Masuala Mengine",
                "citation": "Ogechi, N. O. (2024). Taratibu za Kuendesha Utafiti na Masuala Mengine. Nairobi: Jomo Kenyatta Foundation.",
                "year": 2024,
                "source": "Book",
            },
            {
                "title": "Trilingual Codeswitching in Kenya",
                "citation": "N. O. Ogechi. 2005. Trilingual Codeswitching in Kenya – Evidence from Ekegusii, Kiswahili, English and Sheng.",
                "year": 2005,
                "source": "Book",
                "url": "http://www.sub.uni-hamburg.de/opus/volltexte/2005/2749/",
            },
            {
                "title": "Themes in Language, Education and Development in Kenya",
                "citation": "N. O. Ogechi (ed.). 2011. Themes in Language, Education and Development in Kenya. Ontario: Nsemia Publishers.",
                "year": 2011,
                "source": "Book",
            },
            {
                "title": "Linguistic Human Rights and the Language Policy in the Kenyan Education System",
                "citation": "Kembo-Sure & N. O. Ogechi. 2009. Linguistic Human Rights and the Language Policy in the Kenyan Education System. Addis Ababa: OSSREA.",
                "year": 2009,
                "source": "Book",
            },
            {
                "title": "Learning transformative leadership through student activism in Kenya",
                "citation": "Ogechi, N. O. 2024. Learning transformative leadership through student activism in Kenya. In Transformative Leadership in African Contexts: Strategies for Social Change. Durban: HSRC. Pp. 207-222.",
                "year": 2024,
                "source": "Book chapter",
            },
            {
                "title": "Legitimization and leadership communication during crisis",
                "citation": "G. E. Aberi & N. O. Ogechi. 2025. Legitimization and leadership communication during crisis: A case study of President Uhuru Kenyatta’s political speeches on the COVID-19 pandemic. Journal of Linguistic and Communication Studies 4 (2): 1-17.",
                "year": 2025,
                "venue": "Journal of Linguistic and Communication Studies",
                "source": "Journal article",
            },
            {
                "title": "Ethnicity, language and identity in Kenya",
                "citation": "N. O. Ogechi. 2019. Ethnicity, language and identity in Kenya. Modern Africa: Politics, History and Society 7 (1): 113-137.",
                "year": 2019,
                "venue": "Modern Africa: Politics, History and Society",
                "source": "Journal article",
            },
            {
                "title": "Literacy through a foreign language and children’s rights to education",
                "citation": "N. O. Ogechi & Kembo-Sure. 2016. Literacy through a foreign language and children’s rights to education: An examination of Kenya’s medium of instruction policy. Nordic Journal of African Studies 25 (1): 92-106.",
                "year": 2016,
                "venue": "Nordic Journal of African Studies",
                "source": "Journal article",
            },
            {
                "title": "On Language Rights in Kenya",
                "citation": "N. O. Ogechi. 2003. On Language Rights in Kenya. Nordic Journal of African Studies 12 (3): 277-295.",
                "year": 2003,
                "venue": "Nordic Journal of African Studies",
                "source": "Journal article",
            },
            {
                "title": "Lexicalization in Sheng",
                "citation": "N. O. Ogechi. 2004. Lexicalization in Sheng. Alternation 11 (2): 325-342.",
                "year": 2004,
                "venue": "Alternation",
                "source": "Journal article",
            },
        ],
        "research_grants_won": [
            {
                "title": "Linguistic Human Rights and Language Policy in the Kenyan Educational System",
                "funder": "Organization of Social Science Research in Eastern Africa (OSSREA)",
                "amount": "US$ 21,000",
                "role": "Project preparation and fund management",
                "source": "Official CV",
            },
            {
                "title": "Harmonization, standardization and other aspects of Kenyan and cross-border languages",
                "funder": "Centre for the Advanced Study of African Society (CASAS)",
                "amount": "US$ 3,000",
                "role": "Initiator and coordinator",
                "source": "Official CV",
            },
            {
                "title": "Africa Multiple Cluster Centre of Excellence in African Studies",
                "funder": "Deutsche Forschungs Gemeinschaft (DFG)",
                "amount": "US$ 1,270,000",
                "role": "Member",
                "year": 2019,
                "source": "Official CV",
            },
            {
                "title": "Research Chair on language education in HERI-Africa",
                "funder": "Harnessing Educational Research for Impact in Africa",
                "role": "Research Chair",
                "source": "Official CV",
            },
        ],
        "awards_honors": [
            {
                "award": "DAAD scholarship for PhD studies",
                "organization": "Deutsche Akademischer Austausch Dienst (DAAD)",
                "year": 2000,
            },
            {
                "award": "Senior Scholars Research Grant",
                "organization": "Organization of Social Science Research in Eastern Africa (OSSREA)",
                "year": 2004,
            },
            {
                "award": "World Bank travel and subsistence award",
                "organization": "World Bank",
                "year": 2017,
            },
            {
                "award": "Confucius Institute travel award",
                "organization": "Confucius Institute",
                "year": 2018,
            },
        ],
        "cv_asset_filename": "nathan-ogechi-cv.pdf",
        "cv_source_url": "https://kisiiuniversity.ac.ke/storage/public/downloads//CV%20Nathan%20Ogechi.pdf",
    },
    "dvc_apf": {
        "full_name": "Nathan Oyaro",
        "title": "Prof.",
        "institutional_role": "dvc_administration_planning_finance",
        "bio": "Deputy Vice Chancellor in charge of Administration, Planning and Finance.",
    },
    "dvc_arsa": {
        "full_name": "Fredrick O. Wanyama",
        "title": "Prof.",
        "institutional_role": "dvc_academic_research_student_affairs",
        "bio": "Deputy Vice Chancellor in charge of Academic, Research and Student Affairs.",
    },
    "registrar_admin": {
        "full_name": "Stella Omari",
        "title": "Dr.",
        "institutional_role": "registrar_administration_hr_central_services",
        "bio": "Acting Registrar in charge of Administration, Human Resource and Central Services.",
    },
    "registrar_academic": {
        "full_name": "Kennedy Getange",
        "title": "Prof.",
        "institutional_role": "registrar_academic_affairs",
        "bio": "Acting Registrar in charge of Academic Affairs.",
    },
    "registrar_reirm": {
        "full_name": "Onchari O. Ogara",
        "title": "Prof.",
        "institutional_role": "registrar_research_extension_innovation_resource_mobilization",
        "bio": "Registrar in charge of Research, Extension, Innovation and Resource Mobilization.",
    },
    "finance_officer": {
        "full_name": "Charles M. Mwangi",
        "title": "CPA",
        "institutional_role": "finance_officer",
        "bio": "Finance Officer listed on the management and administrative division pages.",
    },
    "university_librarian": {
        "full_name": "Irene Nyakweba",
        "title": "Ms.",
        "institutional_role": "university_librarian",
        "bio": "Librarian listed on the academic division page.",
    },
    "dean_students": {
        "full_name": "Gladys Osoro",
        "title": "Dr.",
        "institutional_role": "dean_of_students",
        "bio": "Dean of Students listed on the department page and academic division page.",
    },
    "director_elearning": {
        "full_name": "Benard Maake",
        "title": "Dr.",
        "institutional_role": "director_elearning",
        "bio": "Director of eLearning listed on the academic division page.",
    },
    "dean_agriculture": {
        "full_name": "Judith Achieng Odhiambo",
        "title": "Dr.",
        "email": "jodhiambo@kisiiuniversity.ac.ke",
        "institutional_role": "dean_agriculture_and_natural_resources_management",
        "bio": "Dean of the School of Agriculture and Natural Resources Management as listed on the official Academic Division page.",
        "full_bio": (
            "Dr. Judith Achieng Odhiambo is Dean of the School of Agriculture and Natural Resources "
            "Management and a Senior Lecturer in Agronomy. Her academic and development work spans "
            "crop production, soil health, conservation agriculture, climate-smart agriculture, indigenous "
            "food systems, agribusiness, and agricultural education."
        ),
        "website_url": "https://kisiiuniversity.ac.ke/profile_view/dr-judith-achieng-odhiambo",
        "research_interests": [
            "Climate-smart agriculture",
            "Conservation agriculture",
            "Soil health",
            "Crop production",
            "Agricultural education",
            "Indigenous food systems",
            "Agribusiness",
        ],
        "education_background": [
            {
                "raw": (
                    "Menengai High School 1987 - 1990 C Plain; University of Wyoming 2011 Jan - "
                    "2014 Dec Doctor of Philosophy (PhD); Egerton University 2006 July - 2009 March "
                    "Masters; Egerton University 2002 July - 2006 Jan Bachelors; Egerton University "
                    "1992 July - 1995 June Diploma"
                ),
                "source": "official_profile",
                "source_url": "https://kisiiuniversity.ac.ke/profile_view/dr-judith-achieng-odhiambo",
            }
        ],
        "orcid": "0000-0002-3863-4362",
        "researchgate_url": "https://www.researchgate.net/profile/Judith-Odhiambo-5",
        "google_scholar_url": (
            "https://scholar.google.com/citations?view_op=search_authors&mauthors=judith+achieng+odhiambo&hl=en&oi=ao"
        ),
        "is_researcher": True,
        "leadership_message": (
            "Agriculture and natural resources sit at the centre of food security, livelihoods, and climate resilience. In this school, "
            "we want students to learn from the farm, the laboratory, and the community with equal seriousness. Our priority is to graduate "
            "professionals who can improve production systems, conserve resources, and turn research into practical solutions for households and industry."
        ),
        "academic_rank": "dean",
    },
    "dean_business": {
        "full_name": "Caleb N. Akuku",
        "title": "Dr.",
        "institutional_role": "dean_business_and_economics",
        "bio": "Dean of the School of Business and Economics as listed on the official Academic Division page.",
        "website_url": "https://kisiiuniversity.ac.ke/profile_view/dr-caleb-n-akuku",
        "research_interests": ["Technology adoption and business performance"],
        "education_background": [
            {
                "raw": (
                    "Ambira Secondary 1984 - 1987 Division One; St. Mary's Yala High 1988 - 1991 "
                    "3 Principals and 1 subsidiary; Jomo Kenyatta University of Agriculture and "
                    "Technology 2008 Sep - 2009 Dec Masters; Moi University 2010 Sep - 2017 Dec "
                    "Doctor of Philosophy (PhD)"
                ),
                "source": "official_profile",
                "source_url": "https://kisiiuniversity.ac.ke/profile_view/dr-caleb-n-akuku",
            }
        ],
        "professional_memberships": [
            {
                "type": "work_experience",
                "raw": "Kisii University Jan 2023 - present; Kisii University May 2016 - 2023",
                "source": "official_profile",
                "source_url": "https://kisiiuniversity.ac.ke/profile_view/dr-caleb-n-akuku",
            }
        ],
        "teaching_areas": ["Strategic Management", "Machinery and Equipment"],
        "is_researcher": True,
        "leadership_message": (
            "Business education must help learners read markets, manage people, account responsibly, and build enterprises that last. Our school "
            "brings together economics, finance, hospitality, management, and entrepreneurship so that students can connect theory with decisions "
            "made in boardrooms, public institutions, hotels, banks, small businesses, and emerging ventures."
        ),
        "academic_rank": "dean",
    },
    "dean_education": {
        "full_name": "Justina Ndaita",
        "title": "Sr. Dr.",
        "institutional_role": "dean_education_and_human_resource_development",
        "bio": "Dean SEDHURED as listed on the official Academic Division page.",
        "website_url": "https://kisiiuniversity.ac.ke/profile_view/sr-drjustina-ndaita",
        "leadership_message": (
            "Teacher preparation is a public trust. Our school trains educators, counsellors, curriculum specialists, and education managers who understand "
            "the learner, the classroom, and the wider community. We place strong emphasis on professional discipline, research, mentorship, and the ability "
            "to improve schools through thoughtful leadership."
        ),
        "academic_rank": "dean",
    },
    "dean_health": {
        "full_name": "Raymond Oigara",
        "title": "Dr.",
        "institutional_role": "dean_health_sciences",
        "bio": "Dean of the School of Health Sciences as displayed on the school page.",
        "website_url": "https://kisiiuniversity.ac.ke/profile_view/dr-raymond-oigara",
        "leadership_message": (
            "Health training carries a direct responsibility to patients, families, and communities. We expect our students to pursue competence with humility, "
            "compassion, and evidence-based practice. Across our health programmes, clinical exposure, laboratory learning, public health thinking, and research "
            "work together to prepare graduates for service in demanding healthcare environments."
        ),
        "academic_rank": "dean",
    },
    "dean_ist": {
        "full_name": "Jane Cherono Maina",
        "title": None,
        "clear_fields": ("title",),
        "institutional_role": "dean_information_science_and_technology",
        "bio": "Dean of the School of Information Science & Technology as listed on the official Academic Division page.",
        "website_url": "https://kisiiuniversity.ac.ke/admin_departments/academic-division",
        "leadership_message": (
            "Technology changes quickly, but the need for clear thinking, reliable systems, and responsible communication remains constant. Our school brings "
            "computing, media, information science, and library science into one learning environment where students build, analyse, communicate, and manage "
            "knowledge for organisations and society."
        ),
        "academic_rank": "dean",
    },
    "dean_pure_sciences": {
        "full_name": "Robert Karieko Obogi",
        "title": "Dr.",
        "institutional_role": "dean_pure_and_applied_sciences",
        "bio": "Dean of the School of Pure and Applied Sciences as listed on the official Academic Division page.",
        "website_url": "https://kisiiuniversity.ac.ke/profile_view/dr-robert-karieko-obogi",
        "education_background": [
            {
                "raw": "Egerton University 2001 Sep - 2005 April Bachelors",
                "source": "official_profile",
                "source_url": "https://kisiiuniversity.ac.ke/profile_view/dr-robert-karieko-obogi",
            }
        ],
        "publication_records": [
            {
                "title": "Lie Symmetry Solutions of Coupled Lotka-Volterra Competition-Diffusion Model",
                "citation": (
                    "Peter O. Ojwala, Michael O. Okoya, Robert Obogi. International Journal of "
                    "Mathematics Trends and Technology, 66(3), 39-52, 2020."
                ),
                "year": 2020,
                "source": "official_profile",
                "url": "https://kisiiuniversity.ac.ke/profile_view/dr-robert-karieko-obogi",
            },
            {
                "title": "Convergence of Positive and Completely Positive Operators on Non-Unital C*-Algebras",
                "citation": (
                    "Obogi Robert Karieko. International Journal of Functional Analysis, Operator "
                    "Theory and Applications, 11(2), 71-78, 2019."
                ),
                "year": 2019,
                "source": "official_profile",
                "url": "https://kisiiuniversity.ac.ke/profile_view/dr-robert-karieko-obogi",
            },
        ],
        "publications_count": 2,
        "is_researcher": True,
        "leadership_message": (
            "Science asks students to be patient with evidence and bold in seeking explanations. In our laboratories, field activities, and quantitative courses, "
            "we train learners to observe carefully, test ideas, and communicate results clearly. The school supports scientific talent that can serve research, "
            "teaching, industry, and public problem-solving."
        ),
        "academic_rank": "dean",
    },
    "dean_arts": {
        "full_name": "Peter Nyansera Otieno",
        "title": "Dr.",
        "institutional_role": "dean_arts_and_social_sciences",
        "bio": "Dean SASS as listed on the official Academic Division page.",
        "website_url": "https://kisiiuniversity.ac.ke/profile_view/dr-peter-nyansera-otieno",
        "education_background": [
            {
                "raw": (
                    "Kisii University 2015 May - 2020 Dec Doctor of Philosophy (PhD); University "
                    "of Nairobi 2010 Oct - 2012 Dec Masters; Egerton University 1996 Oct - 2000 Dec Bachelors"
                ),
                "source": "official_profile",
                "source_url": "https://kisiiuniversity.ac.ke/profile_view/dr-peter-nyansera-otieno",
            }
        ],
        "research_grants_won": [
            {
                "title": "Acoustic Analysis of Ekegusii Vowels and Stops",
                "funder": "National Research Fund",
                "role": "Principal Investigator",
                "source": "official_profile",
                "source_url": "https://kisiiuniversity.ac.ke/profile_view/dr-peter-nyansera-otieno",
            },
            {
                "title": "Use of Telehealth to Improve Timely Quality Care In Type 2 Diabetes Mellitus: A Pilot Study",
                "funder": "MicroResearch International",
                "role": "Principal Investigator",
                "source": "official_profile",
                "source_url": "https://kisiiuniversity.ac.ke/profile_view/dr-peter-nyansera-otieno",
            },
        ],
        "is_researcher": True,
        "leadership_message": (
            "Societies need graduates who can interpret people, institutions, cultures, histories, conflicts, and ideas with care. Our school gives students "
            "space to ask difficult questions, strengthen communication, understand human behaviour, and apply social knowledge to peace, governance, development, "
            "heritage, and community life."
        ),
        "academic_rank": "dean",
    },
    "dean_law": {
        "full_name": "Charles Otuke Moitui",
        "title": "Dr.",
        "institutional_role": "head_school_of_law",
        "bio": "Dean of the School of Law as listed on the official Academic Division page.",
        "website_url": "https://kisiiuniversity.ac.ke/profile_view/dr-charles-otuke-moitui",
        "leadership_message": (
            "Legal education is more than mastering statutes and cases; it is learning judgment, ethics, argument, and service. The School of Law prepares "
            "students to understand legal rules in their social context, defend justice with discipline, and contribute to institutions that protect rights, "
            "resolve disputes, and serve the public good."
        ),
        "academic_rank": "dean",
    },
    "council_member_peter_mageto": {
        "full_name": "Peter Mageto",
        "title": "Prof. Rev.",
        "institutional_role": "university_council_member_peter_mageto",
        "bio": "University Council member as listed on the governance page.",
    },
    "council_member_scholastica_ndambuki": {
        "full_name": "Scholastica Ndambuki",
        "title": "Dr.",
        "institutional_role": "university_council_member_scholastica_ndambuki",
        "bio": "University Council member as listed on the governance page.",
        "qualifications": [
            {
                "degree": "Doctor of Laws (LLD)",
                "field": "Law",
                "institution": "University of South Africa",
                "year": 0,
            },
            {
                "degree": "Master of Laws (LLM)",
                "field": "Law",
                "institution": "University of South Africa",
                "year": 0,
            },
            {
                "degree": "Bachelor of Laws (LLB)",
                "field": "Law",
                "institution": "University of Nairobi",
                "year": 0,
            },
        ],
    },
    "council_member_elizabeth_mwangi": {
        "full_name": "Elizabeth Mwangi",
        "title": "Ms.",
        "institutional_role": "university_council_member_elizabeth_mwangi",
        "bio": "University Council member as listed on the governance page.",
    },
    "council_member_samson_muchelule": {
        "full_name": "Samson Eric Muchelule",
        "title": "Dr.",
        "institutional_role": "university_council_member_samson_muchelule",
        "bio": "University Council member as listed on the governance page.",
        "qualifications": [
            {
                "degree": "MBA",
                "field": "Strategic Management",
                "institution": "University of Nairobi",
                "year": 0,
            },
            {
                "degree": "Bachelor of Veterinary Medicine",
                "field": "Veterinary Medicine",
                "institution": "University of Nairobi",
                "year": 0,
            },
            {
                "degree": "Diploma",
                "field": "Sales Management and Marketing",
                "institution": "",
                "year": 0,
            },
        ],
    },
    "council_member_mwenda_makathimo": {
        "full_name": "Mwenda Makathimo",
        "title": "Dr.",
        "institutional_role": "university_council_member_mwenda_makathimo",
        "bio": "University Council member as listed on the governance page.",
    },
    "council_member_pamela_awuor_ochieng": {
        "full_name": "Pamela Awuor Ochieng",
        "title": "Dr.",
        "institutional_role": "university_council_member_pamela_awuor_ochieng",
        "bio": "University Council member as listed on the governance page.",
    },
    "council_member_josphat_sawe": {
        "full_name": "Josphat Sowe",
        "title": "Mr.",
        "email": "josphat.sawe@kisiiuniversity.ac.ke",
        "institutional_role": "university_council_member_josphat_sawe",
        "bio": "University Council member as listed on the governance page.",
    },
    "ict_manager": {
        "full_name": "Marianne Mongeri",
        "title": "Ms.",
        "institutional_role": "ict_manager",
        "bio": "Current ICT Manager of the Information Communication and Technology Department.",
    },
    "ict_cybersecurity_head": {
        "full_name": "William Magonga",
        "title": "Mr.",
        "institutional_role": "ict_section_head_cybersecurity_support",
        "bio": "Section Head for Cyber Security, Staff, and Student Support in the ICT Department.",
    },
    "ict_software_dev_head": {
        "full_name": "Benard Masita",
        "title": "Mr.",
        "institutional_role": "ict_section_head_software_development",
        "bio": "Section Head for Software Development in the ICT Department.",
    },
    "ict_installation_maintenance_head": {
        "full_name": "Moffat Barongo",
        "title": "Mr.",
        "institutional_role": "ict_section_head_installation_maintenance",
        "bio": "Section Head for Hardware and Software Installation and Maintenance in the ICT Department.",
    },
    "ict_networking_head": {
        "full_name": "George Kilili",
        "title": "Mr.",
        "institutional_role": "ict_section_head_networking_connectivity",
        "bio": "Section Head for Networking, Internet, and LAN Connectivity in the ICT Department.",
    },
    "ict_website_support_head": {
        "full_name": "Dominic Mariita",
        "title": "Mr.",
        "institutional_role": "ict_section_head_website_user_support",
        "bio": "Section Head for Website Administration and User Support in the ICT Department.",
    },
    "ict_officer_leakey_namoyo": {
        "full_name": "Leakey Namoyo",
        "title": "Mr.",
        "institutional_role": "ict_software_developer",
        "bio": "Software Developer in the ICT Department.",
    },
    "ict_officer_robline_yegon": {
        "full_name": "Robline Kipkoech Yegon",
        "title": "Ms.",
        "institutional_role": "ict_software_developer",
        "bio": "Software Developer in the ICT Department.",
        "qualifications": [
            {
                "degree": "Bachelor of Science in Software Engineering, Second Class Honours (Upper Division)",
                "institution": "Kisii University",
                "year": "2021",
            }
        ],
    },
}


SCHOOL_SPECS: list[dict[str, Any]] = [
    {
        "key": "agriculture",
        "name": "School of Agriculture and Natural Resources Management",
        "code": "SANRM",
        "dean_key": "dean_agriculture",
        "about": "School offering doctoral, masters, undergraduate, diploma, and certificate training across agricultural and natural resource disciplines.",
        "mission": "To be a centre of excellence in capacity building for agricultural development.",
        "vision": "Will be updated soon.",
        "mandate": "To build capacity for agricultural development, natural resource stewardship, applied research, and community-responsive innovation.",
        "website": "https://kisiiuniversity.ac.ke/school/school-of-agriculture-and-natural-resources-management",
        "departments": [
            {"name": "Department of Natural Resources", "code": "NRES"},
            {"name": "Department of Agricultural Sciences", "code": "AGRSCI"},
            {"name": "Department of Agricultural Education and Extension", "code": "AGEDX"},
            {"name": "Department of Applied Aquatic Sciences", "code": "AAS"},
        ],
    },
    {
        "key": "business",
        "name": "School of Business and Economics",
        "code": "SBE",
        "dean_key": "dean_business",
        "about": "School of Business and Economics offering business, finance, economics, hospitality, and management programmes.",
        "mission": "To prepare competent responsive students who will be competitive globally and contribute to the growth of the Kenyan economy in innovative and sustainable ways.",
        "vision": "To be a center of excellence and progress in academic training for business.",
        "mandate": "To offer market-driven business, economics, hospitality, and management training that prepares graduates for enterprise, leadership, industry, and research.",
        "website": "https://kisiiuniversity.ac.ke/school/school-of-business-and-economics",
        "office_location": "Sakagwa Building, Kisii University Main Campus",
        "departments": [
            {"name": "Department of Accounting and Finance", "code": "ACCFIN"},
            {"name": "Department of Business Administration", "code": "BUSADM"},
            {"name": "Department of Management Science", "code": "MSC"},
            {"name": "Department of Tourism and Hospitality Management", "code": "THM"},
            {"name": "Department of Human Resource and Strategic Management", "code": "HRSM"},
        ],
    },
    {
        "key": "education",
        "name": "School of Education and Human Resource Development",
        "code": "SEHRD",
        "dean_key": "dean_education",
        "about": "Teacher-training school offering curriculum studies, educational management, ECDE, special needs education, counseling, and teacher education programmes.",
        "mission": "A center of excellence in administering, promoting and co-ordinating teacher training, scholarship, pursuit of knowledge, research and publication, through linkages with industry and other professional institutions.",
        "vision": "An efficient School committed to academic excellence in teacher training.",
        "mandate": "To administer, promote, and coordinate teacher education, scholarship, research, and publication through professional and industry linkages.",
        "website": "https://kisiiuniversity.ac.ke/school/school-of-education-and-human-resource-development",
        "office_location": "Sakagwa Building, Kisii University Main Campus",
        "departments": [
            {"name": "Department of Educational Foundations & Educational Administration Planning and Economics of Education", "code": "EFAPE"},
            {"name": "Department of Curriculum Instruction and Media (CIM)", "code": "CIM"},
            {"name": "Department of Early Childhood Development Education (ECDE), Special Needs Education (SNE) & Educational Psychology (EPSC)", "code": "ECDESNEEPSC"},
        ],
    },
    {
        "key": "health",
        "name": "School of Health Sciences",
        "code": "SHS",
        "dean_key": "dean_health",
        "about": "School offering postgraduate and undergraduate training in biomedical sciences, nursing, pharmacy, clinical medicine, public health, and related disciplines.",
        "mission": "Our mission is to cultivate top-tier professionals in the health sector, instilling the highest standards of competence, practice, and research.",
        "vision": "Our vision is to become a beacon of global excellence, advancing academics, social welfare, and groundbreaking health sector research on an international stage.",
        "mandate": "To train health professionals, advance biomedical and clinical research, and strengthen healthcare practice, social welfare, and community health systems.",
        "website": "https://kisiiuniversity.ac.ke/school/school-of-health-sciences",
        "office_location": "Main Campus, Kisii University",
        "departments": [
            {"name": "Department of Applied Health Sciences", "code": "AHS"},
            {"name": "Department of Clinical Medicine", "code": "CLMED"},
            {"name": "Department of Pharmacy", "code": "PHARM"},
            {"name": "Department of Medical Microbiology and Parasitology", "code": "MMP"},
            {"name": "Department of Public Health", "code": "PUBH"},
            {"name": "Department of Community Health & Development", "code": "CHD"},
            {"name": "Department of Medical Laboratory Sciences", "code": "MLS"},
            {"name": "Department of Nursing", "code": "NURS"},
            {"name": "Department of Internal Medicine", "code": "IMED"},
            {"name": "Department of Food, Nutrition and Dietetics", "code": "FND"},
            {"name": "Department of Human Anatomy", "code": "HANAT"},
            {"name": "Department of Medical Biochemistry", "code": "MBIOCHEM"},
            {"name": "Department of Medical Physiology", "code": "MPHYS"},
            {"name": "Department of Human Pathology", "code": "HPATH"},
            {"name": "Department of Surgery", "code": "SURG"},
            {"name": "Department of Obstetrics and Gynaecology", "code": "OBGYN"},
            {"name": "Department of Pediatrics and Child Health", "code": "PCH"},
            {"name": "Department of Clinical Pharmacology", "code": "CPHARM"},
            {"name": "Department of Medicine", "code": "MED"},
        ],
    },
    {
        "key": "ist",
        "name": "School of Information Science & Technology",
        "code": "SIST",
        "dean_key": "dean_ist",
        "about": "School supporting technology, communication media, and information science training.",
        "mission": "To Provide quality education in the field of Computing Studies, Media and Information for human and social benefit.",
        "vision": "To be recognized nationally and internationally as a center of excellence for training professionals in the fields of Computing Sciences, Information Technology, Media and Library Sciences.",
        "mandate": "To train professionals in computing, communication media, information science, and library science while supporting innovation and digital transformation.",
        "website": "https://kisiiuniversity.ac.ke/school/school-of-information-technology",
        "office_location": "ICT Building, 2nd and 3rd Floor, Main Campus",
        "departments": [
            {"name": "Department of Computing Science", "code": "CS"},
            {"name": "Department of Communication Media and Information Science (COMLIS)", "code": "COMLIS"},
        ],
    },
    {
        "key": "pure_sciences",
        "name": "School of Pure and Applied Sciences",
        "code": "SPAS",
        "dean_key": "dean_pure_sciences",
        "about": "School created in 2013 to respond to labour market demand for scientists and offering biological sciences, mathematics, chemistry, and physics disciplines.",
        "mission": "Will be updated soon.",
        "vision": "Will be updated soon.",
        "mandate": "To develop scientists through training, laboratory practice, quantitative inquiry, and research across the pure and applied sciences.",
        "website": "https://kisiiuniversity.ac.ke/school/school-of-pure-and-applied-science",
        "departments": [
            {"name": "Department of Biological Sciences", "code": "BIO"},
            {"name": "Department of Mathematics and Actuarial Sciences", "code": "MATHACT"},
            {"name": "Department of Chemistry", "code": "CHEM"},
            {"name": "Department of Physics", "code": "PHYS"},
        ],
    },
    {
        "key": "arts",
        "name": "School of Arts and Social Sciences",
        "code": "SASS",
        "dean_key": "dean_arts",
        "about": "School covering humanities, social sciences, and interdisciplinary social inquiry, with certificate, diploma, bachelors, masters, and doctoral training.",
        "mission": "To create market and need driven courses that prepare the learner holistically: intellectually, morally and religiously to undertake various responsibilities in the society and in the global world.",
        "vision": "To become a dynamic and a vibrant School of Arts and Social Sciences that is driven by the desire for knowledge through research, innovation by attentive experience, intelligent understanding and reasonable judgments of the societal reality.",
        "mandate": "To offer demand-driven arts and social science programmes that prepare graduates for scholarship, citizenship, leadership, and service in society.",
        "website": "https://kisiiuniversity.ac.ke/school/school-of-arts-and-social-science",
        "departments": [
            {"name": "Department of Psychology", "code": "PSY"},
            {"name": "Department of Political Science & Peace Studies", "code": "PSPS"},
            {"name": "Department of History & Heritage", "code": "HH"},
            {"name": "Department of Languages, Linguistics, and Literature", "code": "LLL"},
            {"name": "Department of Geography", "code": "GEOG"},
            {"name": "Department of Sociology, Gender & Development Studies", "code": "SGDS"},
            {"name": "Department of Philosophy and Religious Studies", "code": "PRS"},
        ],
    },
    {
        "key": "law",
        "name": "School of Law",
        "code": "SOL",
        "dean_key": "dean_law",
        "about": "School training legal experts to meet local and international challenges.",
        "mission": "The Mission of the School of Law is to offer high quality and affordable training to students and other actors in the legal sector to meet the country’s, regional and legal standards.",
        "vision": "To be a world class centre of excellence in legal training and research.",
        "mandate": "To teach the theory and substance of law, build ethical and research-ready legal professionals, and support legal scholarship, outreach, and practice.",
        "website": "https://kisiiuniversity.ac.ke/school/school-of-law",
        "departments": [
            {"name": "Department of Law", "code": "LAW"},
        ],
    },
]


for school_spec in SCHOOL_SPECS:
    handbook_fact = HANDBOOK_SCHOOL_FACTS.get(school_spec["code"])
    if not handbook_fact:
        continue
    school_spec["about"] = f"{school_spec['about']} Handbook context: {handbook_fact['about']}"
    school_spec["handbook_departments"] = list(handbook_fact["handbook_departments"])
    school_spec["handbook_source_url"] = HANDBOOK_SOURCE["url"]
    if handbook_fact.get("email"):
        school_spec["email"] = handbook_fact["email"]
    if handbook_fact.get("research_context"):
        school_spec["mandate"] = f"{school_spec['mandate']} Handbook research context: {handbook_fact['research_context']}."
    if handbook_fact.get("programmes"):
        school_spec["mandate"] = f"{school_spec['mandate']} Handbook programmes: {', '.join(handbook_fact['programmes'])}."
    existing_departments = {department["name"]: department for department in school_spec["departments"]}
    for department_fact in HANDBOOK_DEPARTMENT_SEED_SPECS.get(school_spec["code"], ()):
        existing_department = existing_departments.get(department_fact["name"])
        if existing_department:
            existing_department["about"] = department_fact["about"]
            existing_department["handbook_source_url"] = HANDBOOK_SOURCE["url"]
            continue
        school_spec["departments"].append(
            {
                "name": department_fact["name"],
                "code": department_fact["code"],
                "about": department_fact["about"],
                "handbook_source_url": HANDBOOK_SOURCE["url"],
            }
        )


ADMIN_DEPARTMENTS: list[dict[str, Any]] = [
    {"name": "Vice-Chancellor's Office", "code": "VCO", "wing_code": None, "head_key": "vice_chancellor", "about": "Executive office that provides strategic leadership and institutional coordination.", "is_public": False},
    {"name": "Registrar Academic Affairs", "code": "ACAFFAIRS", "wing_code": "RAA", "head_key": "registrar_academic", "about": "Registrar Academic Affairs is listed as an official administration department headed by the Acting Registrar Academic Affairs. Its current public page publishes academic-affairs navigation, team, news, events, and downloads sections, with no additional mandate text beyond the office listing.", "source_url": "https://kisiiuniversity.ac.ke/dpt/registrar-academic-affairs"},
    {"name": "Dean of Students", "code": "STUAFFAIRS", "wing_code": "STUAFFAIRS", "head_key": "dean_students", "about": "The Dean of Students Department offers support and welfare services to students and coordinates essential academic and non-academic student support services that enhance retention.", "mandate": "Develop, nurture, and promote an enabling environment that supports and enhances students' academic and developmental pursuits, including first-year registration and orientation, student leadership elections, KSUSA induction and budgeting, cultural awareness and integration, student handbook review, clubs and societies, loans and bursaries, student bereavement support, counselling, sports and games, and chaplaincy services.", "source_url": "https://kisiiuniversity.ac.ke/dpt/dean-of-students"},
    {"name": "Research, Extension, Innovation and Resource Mobilization", "code": "REIRM", "wing_code": "REIRM", "head_key": None, "about": "Official research office responsible for research information, policy, partnerships, grants, and ethics review.", "source_url": "https://research.kisiiuniversity.ac.ke/", "email": "research@kisiiuniversity.ac.ke", "phone": "+254773452323 +254020491131", "office_location": "408 - 40200 Kisii, Kenya", "is_public": False},
    {"name": "University Library", "code": "LIB", "wing_code": "RAA", "head_key": "university_librarian", "about": "Official library support unit serving teaching, learning, and research through print and electronic information services.", "source_url": "https://kisiiuniversity.ac.ke/library/library-website", "is_public": False},
    {"name": "Registrar Administration", "code": "AHRCS", "wing_code": "AHRCS", "head_key": "registrar_admin", "about": "Registrar Administration is listed as an official administration department headed by the Acting Registrar Administration, Human Resource and Central Services. Its current public page publishes administration navigation, team, news, events, and downloads sections, with current downloads for university adverts.", "source_url": "https://kisiiuniversity.ac.ke/dpt/registrar-administration"},
    {"name": "Finance", "code": "FIN", "wing_code": "FIN", "head_key": "finance_officer", "about": "Finance is listed as an official administration department headed by the Finance Officer. Its current public page publishes finance navigation, team, news, events, and downloads sections, with no additional mandate text beyond the office listing.", "source_url": "https://kisiiuniversity.ac.ke/dpt/finance"},
    {"name": "Planning", "code": "PLNDEV", "wing_code": "PLANNING", "head_key": None, "about": "Planning is listed as an official administration department on the university website.", "source_url": "https://kisiiuniversity.ac.ke/dpt/planning"},
    {"name": "Information Communication and Technology (ICT)", "code": "ICT", "wing_code": "ICT", "head_key": "ict_manager", "about": "The Information and Communication Technology Department supports Kisii University's academic, research, and administrative functions through ICT resources, digital infrastructure, systems, connectivity, web platforms, user support, and data protection.", "mandate": "Provide innovative, reliable, and secure ICT services including ERP support, university web platforms, internet connectivity, hardware maintenance, MIS innovation, networking and website administration, email and communication services, user support, security and data protection, and technology integration.", "core_values": "Transformative thinking, respect, inclusivity, and fairness.", "service_charter": "The ICT client service delivery charter lists free ICT equipment repair/service and internet support within 1 day, user account opening within 1 hour, ICT equipment issuance within 1 day, website information posting within 1 day, staff profile updates within 1 day, and student/staff password or account resets within 10 minutes.", "source_url": "https://kisiiuniversity.ac.ke/dpt/information-communication-and-technology-ict"},
    {"name": "Medical Services", "code": "MEDSERV", "wing_code": "MEDICAL", "head_key": None, "about": "The University Medical Services department caters for the health needs of students, staff, their dependants, and the community in general through timely, quality, efficient, round-the-clock service delivery.", "mandate": "Provide general outpatient preventive, curative, and rehabilitative services; laboratory and medical diagnostic screening and testing; prevention and management of alcohol and drug abuse; referrals for specialized care and management; comprehensive HIV and AIDS prevention and support; and public health and sanitation.", "service_charter": "Medical Services is presented as an essential service provider offering 24-hour service every day of the week throughout the year.", "source_url": "https://kisiiuniversity.ac.ke/dpt/medical-services"},
    {"name": "Internal Audit", "code": "AUDIT", "wing_code": "AUDIT", "head_key": None, "about": "Internal Audit is listed as an official administration department on the university website.", "source_url": "https://kisiiuniversity.ac.ke/dpt/internal-audit"},
    {"name": "Corporate Communication", "code": "CORPCOMM", "wing_code": "CORPCOMM", "head_key": None, "about": "Corporate Communication is listed as an official administration department on the university website.", "source_url": "https://kisiiuniversity.ac.ke/dpt/corporate-communication"},
    {"name": "Procurement and Supplies", "code": "PROC", "wing_code": "PROC", "head_key": None, "about": "The Procurement and Supplies Department is divided into Administration, Planning and Budgetary Control; Procurement Processing; Stores and Inventory Management; and Contract Management and Disposal sections as provided under the Public Procurement and Assets Disposal Act, 2015.", "mandate": "Prepare the university consolidated procurement plan; register general suppliers; acquire goods, works, and services; dispose of surplus stores, equipment, and other unserviceable assets; manage supplier relationships; receive, store, control, and issue procured items or works; manage contracts; and advise the Accounting Officer and Management on procurement strategies that achieve value for money.", "core_values": "The department is guided by constitutional values and principles, equality and freedom from discrimination, affirmative action, integrity, public finance principles, public service values, procurement-profession principles and international norms, value for money, local industry promotion, sustainable development, environmental protection, and citizen contractor promotion.", "source_url": "https://kisiiuniversity.ac.ke/dpt/procurement-and-supplies"},
    {"name": "Legal Department", "code": "LEGAL", "wing_code": "LEGAL", "head_key": None, "about": "Legal Department is listed as an official administration department on the university website.", "source_url": "https://kisiiuniversity.ac.ke/dpt/legal-department"},
    {"name": "E-Learning Directorate", "code": "ELEARN", "wing_code": "ELEARN", "head_key": "director_elearning", "about": "E-Learning Directorate is listed as an official administration department on the university website.", "source_url": "https://kisiiuniversity.ac.ke/dpt/e-learning-directorate"},
    {"name": "Board of Post Graduate Studies", "code": "BPGS", "wing_code": "RAA", "head_key": "registrar_academic", "about": "Board of Post Graduate Studies is listed as an official administration department on the university website.", "source_url": "https://kisiiuniversity.ac.ke/dpt/board-of-post-graduate-studies"},
    {"name": "Salaries", "code": "SAL", "wing_code": "FIN", "head_key": None, "about": "Salaries is listed as an official administration department on the university website.", "source_url": "https://kisiiuniversity.ac.ke/dpt/salaries"},
    {"name": "Student Career Services", "code": "CAREER", "wing_code": "STUAFFAIRS", "head_key": None, "about": "Student Career Services is listed as an official administration department on the university website.", "source_url": "https://kisiiuniversity.ac.ke/dpt/student-career-services"},
    {"name": "Games and Sports Services", "code": "SPORTSERV", "wing_code": "STUAFFAIRS", "head_key": None, "about": "Games and Sports Services is listed as an official administration department on the university website.", "source_url": "https://kisiiuniversity.ac.ke/dpt/games-and-sports-services"},
    {"name": "Security", "code": "SEC", "wing_code": "AHRCS", "head_key": None, "about": "Security is listed as an official administration department on the university website.", "source_url": "https://kisiiuniversity.ac.ke/dpt/security"},
    {"name": "Central Services", "code": "CENTRAL", "wing_code": "AHRCS", "head_key": None, "about": "Central Services is listed as an official administration department on the university website.", "source_url": "https://kisiiuniversity.ac.ke/dpt/central-services"},
    {"name": "Town Annexes", "code": "TOWNANNEX", "wing_code": "AHRCS", "head_key": None, "about": "Town Annexes is listed as an official administration department on the university website.", "source_url": "https://kisiiuniversity.ac.ke/dpt/town-annexes"},
]


_admin_department_by_code = {department["code"]: department for department in ADMIN_DEPARTMENTS}
_admin_department_by_code["LIB"]["about"] = (
    "Official library support unit whose primary mission is to provide quality information services, "
    "support teaching, learning, and research activities through print, electronic, reference, and "
    "inter-library services."
)
_admin_department_by_code["LIB"]["mandate"] = (
    "Support teaching, learning, and research through library membership, catalogue access, "
    f"{', '.join(HANDBOOK_LIBRARY_FACTS['services'])}."
)
_admin_department_by_code["LIB"]["service_charter"] = (
    "Semester hours: Monday to Friday 8.00 a.m. to 10.00 p.m.; Saturday 8.00 a.m. to 5.00 p.m.; "
    "Sunday and Public Holidays closed."
)
_admin_department_by_code["REIRM"]["about"] = (
    "Official research office responsible for research, innovation and extension activities, policy, "
    "linkages, exhibitions, workshops, seminars, grants, and ethics review."
)
_admin_department_by_code["REIRM"]["mandate"] = (
    f"Coordinates {HANDBOOK_RESEARCH_FACTS['mandate_phrase']}. {HANDBOOK_RESEARCH_FACTS['summary']} "
    "Handbook partners include "
    f"{', '.join(HANDBOOK_RESEARCH_FACTS['partners'])}."
)
_admin_department_by_code["STUAFFAIRS"]["about"] = (
    "The Student Affairs Department develops, nurtures, and promotes an enabling environment that "
    "supports academic and developmental pursuits of students."
)
_admin_department_by_code["STUAFFAIRS"]["mandate"] = (
    f"{HANDBOOK_STUDENT_AFFAIRS_FACTS['mandate']} Statute services include "
    f"{', '.join(HANDBOOK_STUDENT_AFFAIRS_FACTS['statute_services'])}. Operational services include "
    "first-year registration and orientation, student leadership elections, KSUSA induction and budgeting, "
    "cultural awareness and integration, student handbook review, clubs and societies, loans and bursaries, "
    "student bereavement support, counselling, sports and games, and chaplaincy services."
)


ICT_SECTION_DEPARTMENTS: list[dict[str, Any]] = [
    {"name": "Cybersecurity and User Support", "code": "ICT-CYBER", "head_key": "ict_cybersecurity_head"},
    {"name": "Software Development", "code": "ICT-SOFTDEV", "head_key": "ict_software_dev_head"},
    {"name": "Installation and Maintenance", "code": "ICT-INSTALL", "head_key": "ict_installation_maintenance_head"},
    {"name": "Networking and Connectivity", "code": "ICT-NET", "head_key": "ict_networking_head"},
    {"name": "Website Support", "code": "ICT-WEB", "head_key": "ict_website_support_head"},
]


@dataclass
class SeedContext:
    people: dict[str, Person] = field(default_factory=dict)
    boards: dict[str, Board] = field(default_factory=dict)
    campuses: dict[str, Campus] = field(default_factory=dict)
    divisions: dict[str, Division] = field(default_factory=dict)
    wings: dict[str, Wing] = field(default_factory=dict)
    schools: dict[str, School] = field(default_factory=dict)
    departments: dict[str, Department] = field(default_factory=dict)
    academic_calendars: dict[str, AcademicCalendar] = field(default_factory=dict)
    admission_infos: dict[str, AdmissionInfo] = field(default_factory=dict)
    programmes: dict[str, Programme] = field(default_factory=dict)
    intakes: dict[str, Intake] = field(default_factory=dict)
    assignments: dict[str, StaffAssignment] = field(default_factory=dict)
    permissions: dict[str, Permission] = field(default_factory=dict)
    roles: dict[str, Role] = field(default_factory=dict)
    users: dict[str, User] = field(default_factory=dict)
    university_info: UniversityInfo | None = None


def split_full_name(full_name: str) -> tuple[str, str | None, str]:
    parts = full_name.split()
    if len(parts) == 1:
        return parts[0], None, parts[0]
    if len(parts) == 2:
        return parts[0], None, parts[1]
    return parts[0], " ".join(parts[1:-1]), parts[-1]


def generated_email(full_name: str) -> str:
    local = slugify(full_name).replace("-", ".")
    return f"{local}@kisiiuniversity.ac.ke"


async def fetch_one(session: AsyncSession, model: type[Any], **filters: Any) -> Any | None:
    result = await session.execute(select(model).filter_by(**filters))
    return result.scalar_one_or_none()


async def get_or_create_person(session: AsyncSession, ctx: SeedContext, key: str, **spec: Any) -> Person:
    if key in ctx.people:
        return ctx.people[key]

    full_name = spec["full_name"]
    email = spec.get("email") or generated_email(full_name)
    person = await fetch_one(session, Person, email=email)
    first_name, middle_name, last_name = split_full_name(full_name)
    payload = {
        "title": spec.get("title"),
        "first_name": first_name,
        "middle_name": middle_name,
        "last_name": last_name,
        "full_name": full_name,
        "email": email,
        "phone": spec.get("phone"),
        "bio": spec.get("bio"),
        "full_bio": spec.get("full_bio"),
        "qualifications": spec.get("qualifications"),
        "education_background": spec.get("education_background"),
        "professional_memberships": spec.get("professional_memberships"),
        "awards_honors": spec.get("awards_honors"),
        "academic_rank": spec.get("academic_rank"),
        "specialization": spec.get("specialization"),
        "research_interests": spec.get("research_interests"),
        "teaching_areas": spec.get("teaching_areas"),
        "publication_records": spec.get("publication_records"),
        "research_grants_won": spec.get("research_grants_won"),
        "publications_count": spec.get("publications_count"),
        "h_index": spec.get("h_index"),
        "office_location": spec.get("office_location"),
        "office_hours": spec.get("office_hours"),
        "office_phone": spec.get("office_phone"),
        "courses_taught": spec.get("courses_taught"),
        "institutional_role": spec.get("institutional_role"),
        "leadership_message": spec.get("leadership_message"),
        "website_url": spec.get("website_url"),
        "linkedin_url": spec.get("linkedin_url"),
        "google_scholar_id": spec.get("google_scholar_id"),
        "google_scholar_url": spec.get("google_scholar_url"),
        "orcid": spec.get("orcid"),
        "researchgate_url": spec.get("researchgate_url"),
        "scopus_id": spec.get("scopus_id"),
        "employment_type": spec.get("employment_type", "full_time"),
        "is_researcher": spec.get("is_researcher", False),
        "is_active": True,
        "is_public": True,
    }
    if person is None:
        person = Person(id=uuid.uuid4(), **payload)
        session.add(person)
    else:
        for field_name, value in payload.items():
            if value is not None:
                setattr(person, field_name, value)
        for field_name in spec.get("clear_fields", ()):
            setattr(person, field_name, None)
    cv_asset_filename = spec.get("cv_asset_filename")
    if cv_asset_filename:
        asset_path = Path(__file__).resolve().parent / "assets" / "staff" / str(cv_asset_filename)
        if not asset_path.exists():
            raise FileNotFoundError(f"Missing staff CV seed asset: {asset_path}")

        filename = spec.get("cv_filename") or asset_path.name
        original_filename = spec.get("cv_original_filename") or f"CV {full_name}.pdf"
        storage_path = f"seed/staff/{filename}"
        upload_path = get_settings().upload_dir_path / storage_path
        upload_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(asset_path, upload_path)
        file_size = asset_path.stat().st_size
        file_hash = hashlib.sha256(asset_path.read_bytes()).hexdigest()
        public_url = get_public_url(storage_path)
        cv_source_url = spec.get("cv_source_url")

        media_filters = [
            Media.storage_path == storage_path,
            Media.public_url == public_url,
        ]
        if cv_source_url:
            media_filters.append(Media.public_url == cv_source_url)
        media = (await session.execute(select(Media).where(or_(*media_filters)))).scalar_one_or_none()
        media_payload = {
            "filename": filename,
            "original_filename": original_filename,
            "mime_type": "application/pdf",
            "file_size": file_size,
            "file_hash": file_hash,
            "storage_provider": "local",
            "storage_path": storage_path,
            "public_url": public_url,
            "title": spec.get("cv_title") or f"Curriculum Vitae - {full_name}",
            "alt_text": spec.get("cv_alt_text") or f"Curriculum vitae for {full_name}",
            "description": spec.get("cv_description") or "Official curriculum vitae published by Kisii University.",
            "tags": ["kisii-university", "staff-profile", "curriculum-vitae"],
            "credit": "Kisii University",
            "media_type": "document",
            "is_public": True,
            "is_processed": True,
            "extra_metadata": {
                "source": "kisiiuniversity.ac.ke",
                "seed_asset": True,
                "source_url": cv_source_url,
                "source_asset": str(asset_path.relative_to(Path(__file__).resolve().parent)),
            },
        }
        if media is None:
            media = Media(id=uuid.uuid4(), **media_payload)
            session.add(media)
        else:
            for field_name, value in media_payload.items():
                setattr(media, field_name, value)
        await session.flush()
        person.cv_file_id = media.id
    await session.flush()
    ctx.people[key] = person
    return person


async def upsert_board(session: AsyncSession, ctx: SeedContext, key: str, **payload: Any) -> Board:
    board = await fetch_one(session, Board, slug=payload["slug"])
    if board is None:
        board = Board(id=uuid.uuid4(), **payload)
        session.add(board)
    else:
        for field_name, value in payload.items():
            setattr(board, field_name, value)
    await session.flush()
    ctx.boards[key] = board
    return board


async def upsert_campus(session: AsyncSession, ctx: SeedContext, **payload: Any) -> Campus:
    campus = await fetch_one(session, Campus, code=payload["code"])
    if campus is None:
        campus = Campus(id=uuid.uuid4(), **payload)
        session.add(campus)
    else:
        for field_name, value in payload.items():
            setattr(campus, field_name, value)
    await session.flush()
    ctx.campuses[payload["code"]] = campus
    return campus


async def upsert_division(session: AsyncSession, ctx: SeedContext, **payload: Any) -> Division:
    division = await fetch_one(session, Division, code=payload["code"])
    if division is None:
        division = Division(id=uuid.uuid4(), **payload)
        session.add(division)
    else:
        for field_name, value in payload.items():
            setattr(division, field_name, value)
    await session.flush()
    ctx.divisions[payload["code"]] = division
    return division


async def upsert_wing(session: AsyncSession, ctx: SeedContext, **payload: Any) -> Wing:
    wing = await fetch_one(session, Wing, division_id=payload["division_id"], code=payload["code"])
    if wing is None:
        wing = Wing(id=uuid.uuid4(), **payload)
        session.add(wing)
    else:
        for field_name, value in payload.items():
            setattr(wing, field_name, value)
    await session.flush()
    ctx.wings[payload["code"]] = wing
    return wing


async def upsert_school(session: AsyncSession, ctx: SeedContext, **payload: Any) -> School:
    school = await fetch_one(session, School, code=payload["code"])
    if school is None:
        school = School(id=uuid.uuid4(), **payload)
        session.add(school)
    else:
        for field_name, value in payload.items():
            setattr(school, field_name, value)
    await session.flush()
    ctx.schools[payload["code"]] = school
    return school


async def upsert_department(session: AsyncSession, ctx: SeedContext, **payload: Any) -> Department:
    department = await fetch_one(session, Department, code=payload["code"])
    if department is None:
        department = Department(id=uuid.uuid4(), **payload)
        session.add(department)
    else:
        for field_name, value in payload.items():
            setattr(department, field_name, value)
    await session.flush()
    ctx.departments[payload["code"]] = department
    return department


async def upsert_academic_calendar(session: AsyncSession, ctx: SeedContext, **payload: Any) -> AcademicCalendar:
    calendar = await fetch_one(
        session,
        AcademicCalendar,
        academic_year=payload["academic_year"],
        semester=payload["semester"],
    )
    if calendar is None:
        calendar = AcademicCalendar(id=uuid.uuid4(), **payload)
        session.add(calendar)
    else:
        for field_name, value in payload.items():
            setattr(calendar, field_name, value)
    await session.flush()
    ctx.academic_calendars[f"{payload['academic_year']}-S{payload['semester']}"] = calendar
    return calendar


async def upsert_admission_info(session: AsyncSession, ctx: SeedContext, **payload: Any) -> AdmissionInfo:
    item = await fetch_one(session, AdmissionInfo, slug=payload["slug"])
    if item is None:
        item = AdmissionInfo(id=uuid.uuid4(), **payload)
        session.add(item)
    else:
        for field_name, value in payload.items():
            setattr(item, field_name, value)
    await session.flush()
    ctx.admission_infos[payload["slug"]] = item
    return item


async def upsert_programme(session: AsyncSession, ctx: SeedContext, **payload: Any) -> Programme:
    programme = await fetch_one(session, Programme, code=payload["code"])
    if programme is None:
        programme = await fetch_one(session, Programme, slug=payload["slug"])
    if programme is None:
        programme = Programme(id=uuid.uuid4(), **payload)
        session.add(programme)
    else:
        for field_name, value in payload.items():
            setattr(programme, field_name, value)
    await session.flush()
    ctx.programmes[payload["code"]] = programme
    return programme


async def upsert_intake(session: AsyncSession, ctx: SeedContext, **payload: Any) -> Intake:
    intake = await fetch_one(session, Intake, code=payload["code"])
    if intake is None:
        intake = Intake(id=uuid.uuid4(), **payload)
        session.add(intake)
    else:
        for field_name, value in payload.items():
            setattr(intake, field_name, value)
    await session.flush()
    ctx.intakes[payload["code"]] = intake
    return intake


async def upsert_programme_intake(
    session: AsyncSession,
    programme: Programme,
    intake: Intake,
    **payload: Any,
) -> ProgrammeIntake:
    item = await fetch_one(session, ProgrammeIntake, programme_id=programme.id, intake_id=intake.id)
    payload["programme_id"] = programme.id
    payload["intake_id"] = intake.id
    if item is None:
        item = ProgrammeIntake(id=uuid.uuid4(), **payload)
        session.add(item)
    else:
        for field_name, value in payload.items():
            setattr(item, field_name, value)
    await session.flush()
    return item


async def upsert_programme_tutor(
    session: AsyncSession,
    programme: Programme,
    person: Person,
    **payload: Any,
) -> ProgrammeTutor:
    item = await fetch_one(session, ProgrammeTutor, programme_id=programme.id, person_id=person.id)
    payload["programme_id"] = programme.id
    payload["person_id"] = person.id
    if item is None:
        item = ProgrammeTutor(id=uuid.uuid4(), **payload)
        session.add(item)
    else:
        for field_name, value in payload.items():
            setattr(item, field_name, value)
    await session.flush()
    return item


async def upsert_department_service(session: AsyncSession, department: Department, **payload: Any) -> DepartmentService:
    service = await fetch_one(session, DepartmentService, department_id=department.id, slug=payload["slug"])
    payload["department_id"] = department.id
    if service is None:
        service = DepartmentService(id=uuid.uuid4(), **payload)
        session.add(service)
    else:
        for field_name, value in payload.items():
            setattr(service, field_name, value)
    await session.flush()
    return service


async def upsert_staff_assignment(session: AsyncSession, ctx: SeedContext, key: str, **payload: Any) -> StaffAssignment:
    constrained_active_role = (
        payload.get("status") == "active"
        and payload.get("entity_id") is not None
        and (
            (payload["entity_type"] == "school" and payload["role"] == "dean")
            or (payload["entity_type"] == "department" and payload["role"] in {"hod", "cod", "head"})
        )
    )
    assignment = None
    if constrained_active_role:
        assignment = await fetch_one(
            session,
            StaffAssignment,
            entity_type=payload["entity_type"],
            entity_id=payload.get("entity_id"),
            role=payload["role"],
            status="active",
        )
    if assignment is None:
        assignment = await fetch_one(
            session,
            StaffAssignment,
            person_id=payload["person_id"],
            entity_type=payload["entity_type"],
            entity_id=payload.get("entity_id"),
            role=payload["role"],
        )
    if assignment is None:
        assignment = StaffAssignment(id=uuid.uuid4(), **payload)
        session.add(assignment)
    else:
        for field_name, value in payload.items():
            setattr(assignment, field_name, value)
    await session.flush()
    ctx.assignments[key] = assignment
    return assignment


async def upsert_university_info(session: AsyncSession, ctx: SeedContext, **payload: Any) -> UniversityInfo:
    item = await fetch_one(session, UniversityInfo, slug=payload["slug"])
    if item is None:
        item = UniversityInfo(id=uuid.uuid4(), **payload)
        session.add(item)
    else:
        for field_name, value in payload.items():
            setattr(item, field_name, value)
    await session.flush()
    ctx.university_info = item
    return item


async def upsert_permission(session: AsyncSession, ctx: SeedContext, **payload: Any) -> Permission:
    item = await fetch_one(session, Permission, name=payload["name"])
    if item is None:
        item = Permission(id=uuid.uuid4(), **payload)
        session.add(item)
    else:
        for field_name, value in payload.items():
            setattr(item, field_name, value)
    await session.flush()
    ctx.permissions[payload["name"]] = item
    return item


async def upsert_role(session: AsyncSession, ctx: SeedContext, **payload: Any) -> Role:
    item = await fetch_one(session, Role, name=payload["name"])
    if item is None:
        item = Role(id=uuid.uuid4(), **payload)
        session.add(item)
    else:
        for field_name, value in payload.items():
            setattr(item, field_name, value)
    await session.flush()
    ctx.roles[payload["name"]] = item
    return item


async def upsert_role_permission(
    session: AsyncSession,
    role: Role,
    permission: Permission,
) -> RolePermission:
    item = await fetch_one(
        session,
        RolePermission,
        role_id=role.id,
        permission_id=permission.id,
    )
    if item is None:
        item = RolePermission(id=uuid.uuid4(), role_id=role.id, permission_id=permission.id)
        session.add(item)
    await session.flush()
    return item


async def upsert_user(session: AsyncSession, ctx: SeedContext, key: str, **payload: Any) -> User:
    normalized_email = payload["email"].strip().lower()
    item = await fetch_one(session, User, email=normalized_email)
    if "password" in payload:
        payload["password_hash"] = hash_password(payload.pop("password"))
    payload["email"] = normalized_email
    if item is None:
        item = User(id=uuid.uuid4(), **payload)
        session.add(item)
    else:
        password_hash = payload.pop("password_hash", None)
        for field_name, value in payload.items():
            setattr(item, field_name, value)
        if password_hash is not None:
            item.password_hash = password_hash
    await session.flush()
    ctx.users[key] = item
    return item


async def upsert_user_role(
    session: AsyncSession,
    user: User,
    role: Role,
    *,
    assigned_by_id: uuid.UUID | None = None,
    scope_type: str | None = None,
    scope_id: uuid.UUID | None = None,
    note: str | None = None,
) -> UserRole:
    item = await fetch_one(
        session,
        UserRole,
        user_id=user.id,
        role_id=role.id,
        scope_type=scope_type,
        scope_id=scope_id,
    )
    payload = {
        "assigned_by_id": assigned_by_id,
        "scope_type": scope_type,
        "scope_id": scope_id,
        "note": note,
        "is_active": True,
    }
    if item is None:
        item = UserRole(id=uuid.uuid4(), user_id=user.id, role_id=role.id, **payload)
        session.add(item)
    else:
        for field_name, value in payload.items():
            setattr(item, field_name, value)
    await session.flush()
    return item
