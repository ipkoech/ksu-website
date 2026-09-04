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
            "Division responsible for academic excellence, research and consultancy, knowledge "
            "dissemination, academic programmes, teaching and learning through Academic Affairs, "
            "Research, Innovation and Extension, Library Services, and Student Affairs."
        ),
        "mandate": (
            "Promotes academic excellence, research and consultancy, dissemination and preservation "
            "of knowledge, skills and competencies, and coordinates academic programmes, teaching, "
            "learning, Library Services, and Student Affairs through its Academic Affairs; Research, "
            "Innovation and Extension; Library Services; and Student Affairs units."
        ),
        "core_values": "Academic Excellence, Research and Service to Humanity",
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
            "about": "Supports fisheries, limnology, aquaculture, and applied aquatic sciences through teaching, research, and community engagement.",
        },
        {
            "name": "Department of crops and soil sciences",
            "code": "SANRM-CSS",
            "about": "Supports agronomy, sustainable agriculture, and agriculture programmes through teaching, research, and practical training.",
        },
        {
            "name": "Department of Environmental Science and Natural Resource Management",
            "code": "SANRM-ESNRM",
            "about": "Covers natural resources, environmental science, and water resources management through academic training and applied research.",
        },
        {
            "name": "Department of Agricultural Education and Extension",
            "about": "Covers agricultural education, agricultural extension, and rural development, linking classroom learning with field practice.",
        },
        {
            "name": "Department of Animal Science",
            "code": "SANRM-ANSCI",
            "about": "Covers livestock production systems, animal science, and animal health and production through teaching, research, and practical training.",
        },
        {
            "name": "Department of Agricultural and Resource Economics",
            "code": "SANRM-ARE",
            "about": "Covers agricultural and applied economics, agribusiness management, and agricultural economics through teaching, research, and field application.",
        },
    ),
    "SIST": (
        {
            "name": "Department of Media and Communication Studies",
            "code": "SIST-MCS",
            "about": "Prepares learners in media, journalism, television, radio, photojournalism, new media, and graphic design.",
        },
        {
            "name": "Department of Computing Science",
            "about": "Prepares learners for information technology, digital systems, innovation, and technology-enabled development.",
        },
        {
            "name": "Department of Library and Information Science",
            "code": "SIST-LIS",
            "about": "Focuses on knowledge organization, archives, digital libraries, information access, retrieval, storage, and dissemination.",
        },
    ),
    "SBE": (
        {
            "name": "Department of Accounting and Finance",
            "about": "Covers accounting, finance, financial reporting, taxation, auditing, and related business practice.",
        },
        {
            "name": "Department of Business Administration",
            "about": "Provides teaching and research in business administration, organisational practice, entrepreneurship, and management.",
        },
        {
            "name": "Department of Human Resource and Strategic Management",
            "about": "Supports business, management, and human resource programmes through teaching, research, and professional development.",
        },
        {
            "name": "Department of Management Science",
            "about": "Supports management science and related business programmes through quantitative analysis, decision-making, and operations study.",
        },
        {
            "name": "Department of Tourism and Hospitality Management",
            "about": "Supports tourism, hospitality, hotel, catering, and travel programmes through academic and practical training.",
        },
    ),
    "SASS": (
        {
            "name": "Department of Psychology",
            "about": "Responds to mental health service needs and prepares learners for psychological assessment, counselling, and related practice.",
        },
        {
            "name": "Department of Philosophy and Religious Studies",
            "about": "Examines philosophical and religious thought, ethics, belief systems, and their contribution to social life and moral reasoning.",
        },
        {
            "name": "Department of Political Science & Peace Studies",
            "about": "Studies governance, political institutions, peace, conflict, public policy, and research for social development.",
        },
        {
            "name": "Department of Languages, Linguistics, and Literature",
            "about": "Supports language, linguistics, literature, pedagogy, communication, and related research.",
        },
        {
            "name": "Department of Postgraduate Studies",
            "code": "SASS-PG",
            "about": "Coordinates postgraduate study, research supervision, and advanced academic work in the School of Arts and Social Sciences.",
        },
    ),
    "SOL": (
        {
            "name": "Department of Public Law",
            "code": "SOL-PUB",
            "about": "Develops teaching and research in public law, constitutional law, governance, and regulatory practice.",
        },
        {
            "name": "Department of Private Law",
            "code": "SOL-PRIV",
            "about": "Develops teaching and research in private law, civil procedure, family law, property, and related legal practice.",
        },
        {
            "name": "Department of Commercial Law",
            "code": "SOL-COM",
            "about": "Develops teaching and research in commercial transactions, company law, trade, taxation, and business regulation.",
        },
        {
            "name": "Department of Research and Post-graduate Studies",
            "code": "SOL-RPGS",
            "about": "Coordinates research support and postgraduate study within the School of Law.",
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
