"""Structured facts extracted from the official Kisii University student handbook."""

from __future__ import annotations

HANDBOOK_SOURCE = {
    "title": "Kisii University Student Handbook",
    "edition": "4th edition",
    "pages": 48,
    "publisher": "Dean of Students' Office",
    "publisher_email": "deanofstudents@kisiiuniversity.ac.ke",
    "url": "https://kisiiuniversity.ac.ke/storage/public/downloads//Kisii%20University%20Revised%20Handbook%202019.pdf",
}

HANDBOOK_SOURCE_PHRASES = (
    "public chartered institution of higher learning",
    "13th Public University in Kenya",
    "serene, picturesque and congenial environment",
    "University of the 21st Century",
)

HANDBOOK_INSTITUTIONAL_FACTS = {
    "mission": (
        "The University is committed to training high level human resource that meets the development needs "
        "of the country and the international labour market while sustaining quality research, dissemination "
        "of knowledge, skills and competencies for the advancement of humanity."
    ),
    "vision": "World Class University in the advancement of academic excellence, research, innovation, and enhancement of social welfare",
    "student_formation": "Academic Excellence, Research and Service to Humanity",
}

HANDBOOK_SECTIONS = (
    "HISTORY OF KISII UNIVERSITY",
    "MESSAGE FROM THE VICE CHANCELLOR",
    "GOVERNANCE AND ADMINISTRATIVE STRUCTURE OF THE UNIVERSITY",
    "OFFICE OF THE DEPUTY VICE CHANCELLOR ADMINISTRATION, PLANNING AND FINANCE",
    "OFFICE OF THE DEPUTY VICE CHANCELLOR, ACADEMIC, RESEARCH AND STUDENT AFFAIRS",
    "Academic Affairs",
    "Research, Innovation and Extension",
    "Library Services",
    "Student Affairs",
    "BRIEF INFORMATION ON SCHOOLS IN THE UNIVERSITY",
    "SCHOOL OF PURE AND APPLIED SCIENCES (SPAS)",
    "SCHOOL OF INFORMATION SCIENCE AND TECHNOLOGY (SIST)",
    "SCHOOL OF BUSINESS AND ECONOMICS (SOBE)",
    "SCHOOL OF ARTS AND SOCIAL SCIENCES (SASS)",
    "SCHOOL OF AGRICULTURE AND NATURAL RESOURCE MANAGEMENT (SANRM)",
    "SCHOOL OF EDUCATION AND HUMAN RESOURCE DEVELOPMENT (SEDHURED)",
    "SCHOOL OF HEALTH SCIENCES",
    "THE SCHOOL OF LAW",
    "STUDENT AFFAIRS DEPARTMENT",
    "Student Rights and Responsibilities",
    "Channels of Communication",
    "Student Organizations",
    "STUDENT MATTERS",
    "RULES AND REGULATIONS GOVERNING THE ASSOCIATION, CONDUCT, AND DISCIPLINE OF STUDENTS",
    "UNIVERSITY EXAMINATION REGULATIONS",
    "Important Information for First Year Students",
)

HANDBOOK_GOVERNANCE_FACTS = {
    "chancellor": {
        "phrase": "titular head",
        "summary": "The Chancellor confers degrees, diplomas, certificates, and other awards in consultation with Council and Senate.",
    },
    "council": {
        "phrase": "supreme governance organ",
        "summary": "Council is responsible for staff employment, statutes, policies, budgets, and senior leadership recommendations.",
    },
    "senate": {
        "phrase": "main and final decision-making body on all academic matters",
        "summary": "Senate covers programmes, admission, teaching, examinations, student discipline, and graduation.",
    },
    "management_board": {
        "phrase": "third organ of governance",
        "summary": "The Management Board implements university policies and assists day-to-day management.",
    },
    "vice_chancellor": {
        "phrase": "chief executive officer",
        "summary": "The Vice-Chancellor is the academic and administrative head of the university.",
    },
}

HANDBOOK_DIVISION_FACTS = {
    "APF": {
        "units": (
            "Administration Department",
            "Planning and Development",
            "Central Services",
            "Medical Department",
            "Procurement and Supplies",
        ),
        "description": (
            "Division responsible for management of the University's human and physical resources, "
            "administration, planning, finance, welfare support, procurement, and central services."
        ),
    },
    "ARSA": {
        "units": (
            "Academic Affairs",
            "Research, Innovation and Extension",
            "Library Services",
            "Student Affairs",
        ),
        "description": (
            "Division organized into Academic Affairs; Research, Innovation and Extension; "
            "Library Services; and Student Affairs."
        ),
    },
}

HANDBOOK_LIBRARY_FACTS = {
    "mission_phrase": "provide quality information services",
    "services": (
        "Library Use & Membership",
        "Inter-Library Loan",
        "Reference and Information Service",
        "Electronic resources",
        "Book-binding and repair",
        "Current Awareness Services",
        "Selective dissemination of information",
        "Multimedia",
        "Photocopying and printing",
        "Alerting services",
        "User education",
    ),
    "semester_hours": {
        "monday_friday": "8.00 a.m. to 10.00 p.m.",
        "saturday": "8.00 a.m. to 5.00 p.m.",
        "sunday_public_holiday": "closed",
    },
}

HANDBOOK_RESEARCH_FACTS = {
    "mandate_phrase": "research, innovation and extension activities",
    "summary": "Coordinates research, innovation, extension, linkages, exhibitions, workshops, and seminars.",
    "partners": (
        "University of Minnesota",
        "East Tennessee State University",
        "Kenya Forestry Research Institute",
        "Kenya Industrial Research and Development Institute",
        "Kenya Sugar Research Foundation",
        "Kenya Marine and Fisheries Research Institute",
        "Green Acres Rabbitry Limited",
    ),
}

HANDBOOK_STUDENT_AFFAIRS_SERVICES = (
    "Services to Students with Disabilities",
    "Work-Study Program",
    "Student Loans and Bursaries",
    "Leave of Absence",
    "Death and Bereavement",
    "Counselling Services",
    "Office of Career Services",
    "Spiritual Guidance and Chaplaincy",
    "Alcohol, Drug and Substance Abuse Support",
    "Games and Sports Services",
    "Student Accommodation",
    "Medical Services",
    "Catering Services",
    "ICT Services",
    "Security Services",
    "Directorate of E-Learning",
    "Kisii University Students' Association",
    "Student Rights and Responsibilities",
    "Channels of Communication",
    "Student Organizations",
)

HANDBOOK_STUDENT_AFFAIRS_FACTS = {
    "mandate_phrase": "enabling environment",
    "mandate": (
        "Develop, nurture, and promote an enabling environment that supports academic and developmental "
        "pursuits of students."
    ),
    "statute_services": (
        "accommodation",
        "counselling",
        "discipline",
        "mentorship",
        "spiritual nourishment",
        "sports and recreation",
        "job placement",
        "welfare organizations",
        "catering services",
    ),
}

HANDBOOK_SCHOOL_FACTS = {
    "SPAS": {
        "about": "Established in 2013 from the then School of Education due to the growing need for science based courses.",
        "handbook_departments": ("Mathematics and Actuarial science", "Biology", "Chemistry", "Physics"),
        "research_context": (
            "advanced and applied scientific research across mathematics, biology, public-health, energy, "
            "survival analysis, economics, and related applied fields"
        ),
    },
    "SIST": {
        "about": "Prepares students in information science, technology skills, creativity, media, computing, and library science.",
        "email": "sist@kisiiuniversity.ac.ke",
        "handbook_departments": (
            "Media and Communication Studies",
            "Computing Sciences",
            "Library and Information Science",
        ),
    },
    "SBE": {
        "about": "Oldest among all the schools in the university.",
        "handbook_departments": (
            "Department of Accounting and Finance",
            "Department of Business Administration",
            "Department of Human Resource and Strategic Management",
            "Department of Management Science",
            "Department of Tourism and Hospitality Management",
        ),
    },
    "SASS": {
        "about": "Trains and graduates competent students in certificate, diploma, bachelors, masters, and doctoral courses.",
        "email": "fass@kisiiuniversity.ac.ke",
        "handbook_departments": (
            "Psychology",
            "Philosophy and Religious Studies",
            "Political Science and Peace Studies",
            "Language, Linguistic and Literature",
            "History",
            "Geography",
            "Sociology, Gender and Development Studies",
            "Postgraduate studies",
        ),
    },
    "SANRM": {
        "about": "Contributes to agricultural and economic development through teaching, research and outreach.",
        "handbook_departments": (
            "Department of fisheries and aquatic sciences",
            "Department of crops and soil sciences",
            "Department of Environmental Science and Natural Resource Management",
            "Department of Agricultural Education and Extension",
            "Department of Animal Science",
            "Department of Agricultural and Resource Economics",
        ),
    },
    "SEHRD": {
        "about": "Gave the very first academic program, Postgraduate Diploma in Education, in the growth of Kisii to a University.",
        "handbook_departments": (
            "Doctoral programmes",
            "Masters programmes",
            "Bachelors programmes",
            "Diploma programmes",
        ),
    },
    "SHS": {
        "about": "Established in March 2010 to train holistic health professionals.",
        "email": "shs@kisiiuniversity.ac.ke",
        "handbook_departments": (
            "Clinical Medicine and Surgery",
            "Medical Laboratory Science",
            "Pharmaceutical Technology",
            "Community Health",
            "Food Nutrition and Dietetics",
            "Health Records and Information Management",
            "Biomedical Sciences",
            "Nursing",
            "Public Health",
            "Community Health and Development",
            "Medicine and Surgery",
        ),
    },
    "SOL": {
        "about": "Established in 2009 and accredited by the Council of Legal Education in 2012.",
        "handbook_departments": ("Public Law", "Private law", "Commercial Law", "Research and Post-graduate Studies"),
        "programmes": ("Bachelor of Laws (LL.B)", "Diploma in Law"),
    },
}

HANDBOOK_DEPARTMENT_SEED_SPECS = {
    "SANRM": (
        {
            "name": "Department of fisheries and aquatic sciences",
            "code": "SANRM-FAS",
            "about": "Handbook context: offers fisheries, limnology, aquaculture, and applied aquatic sciences programmes.",
        },
        {
            "name": "Department of crops and soil sciences",
            "code": "SANRM-CSS",
            "about": "Handbook context: offers agronomy, sustainable agriculture, and agriculture programmes.",
        },
        {
            "name": "Department of Environmental Science and Natural Resource Management",
            "code": "SANRM-ESNRM",
            "about": "Handbook context: covers natural resources, environmental science, and water resources management.",
        },
        {
            "name": "Department of Agricultural Education and Extension",
            "about": "Handbook context: covers agricultural education, agricultural extension, and rural development.",
        },
        {
            "name": "Department of Animal Science",
            "code": "SANRM-ANSCI",
            "about": "Handbook context: covers livestock production systems, animal science, and animal health and production.",
        },
        {
            "name": "Department of Agricultural and Resource Economics",
            "code": "SANRM-ARE",
            "about": "Handbook context: covers agricultural and applied economics, agribusiness management, and agricultural economics.",
        },
    ),
    "SIST": (
        {
            "name": "Department of Media and Communication Studies",
            "code": "SIST-MCS",
            "about": "Handbook context: prepares learners in media, journalism, TV, radio, photo-journalism, new media, and graphic design.",
        },
        {
            "name": "Department of Computing Science",
            "about": "Handbook context: trains well-rounded IT individuals for innovation and development in the digital space.",
        },
        {
            "name": "Department of Library and Information Science",
            "code": "SIST-LIS",
            "about": "Handbook context: focuses on knowledge organization, archives, digital library, access, retrieval, storage, and dissemination.",
        },
    ),
    "SBE": (
        {
            "name": "Department of Accounting and Finance",
            "about": "Handbook context: one of five departments in the oldest school in the university.",
        },
        {
            "name": "Department of Business Administration",
            "about": "Handbook context: one of five business and economics departments headed by Chairpersons of Department.",
        },
        {
            "name": "Department of Human Resource and Strategic Management",
            "about": "Handbook context: supports business, management, and human resource programmes.",
        },
        {
            "name": "Department of Management Science",
            "about": "Handbook context: supports management science and related business programmes.",
        },
        {
            "name": "Department of Tourism and Hospitality Management",
            "about": "Handbook context: supports tourism, hospitality, hotel, catering, and travel programmes.",
        },
    ),
    "SASS": (
        {
            "name": "Department of Psychology",
            "about": "Handbook context: responds to mental health service needs and prepares competent mental health workers.",
        },
        {
            "name": "Department of Philosophy and Religious Studies",
            "about": "Handbook context: prepares people to mitigate moral challenges in society through philosophical and religious studies.",
        },
        {
            "name": "Department of Political Science & Peace Studies",
            "about": "Handbook context: trains human resource for development needs, research, and advancement of humanity.",
        },
        {
            "name": "Department of Languages, Linguistics, and Literature",
            "about": "Handbook context: supports language, linguistics, literature, pedagogy, and research.",
        },
        {
            "name": "Department of Postgraduate Studies",
            "code": "SASS-PG",
            "about": "Handbook context: listed among the School of Arts and Social Sciences departments.",
        },
    ),
    "SOL": (
        {
            "name": "Department of Public Law",
            "code": "SOL-PUB",
            "about": "Handbook context: one of the four School of Law departments headed by a Chairperson of Department.",
        },
        {
            "name": "Department of Private Law",
            "code": "SOL-PRIV",
            "about": "Handbook context: one of the four School of Law departments headed by a Chairperson of Department.",
        },
        {
            "name": "Department of Commercial Law",
            "code": "SOL-COM",
            "about": "Handbook context: one of the four School of Law departments headed by a Chairperson of Department.",
        },
        {
            "name": "Department of Research and Post-graduate Studies",
            "code": "SOL-RPGS",
            "about": "Handbook context: supports research and post-graduate studies in the School of Law.",
        },
    ),
}


__all__ = [
    "HANDBOOK_DEPARTMENT_SEED_SPECS",
    "HANDBOOK_DIVISION_FACTS",
    "HANDBOOK_GOVERNANCE_FACTS",
    "HANDBOOK_INSTITUTIONAL_FACTS",
    "HANDBOOK_LIBRARY_FACTS",
    "HANDBOOK_RESEARCH_FACTS",
    "HANDBOOK_SCHOOL_FACTS",
    "HANDBOOK_SECTIONS",
    "HANDBOOK_SOURCE",
    "HANDBOOK_SOURCE_PHRASES",
    "HANDBOOK_STUDENT_AFFAIRS_FACTS",
    "HANDBOOK_STUDENT_AFFAIRS_SERVICES",
]
