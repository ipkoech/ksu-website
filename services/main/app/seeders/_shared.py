"""Shared helpers and source-backed KSU seed data."""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    AcademicCalendar,
    AdmissionInfo,
    Board,
    Campus,
    Department,
    DepartmentService,
    Division,
    Intake,
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
        "bio": "Vice Chancellor and University Council Secretary as listed on the governance and management pages.",
        "qualifications": [
            {
                "degree": "PhD",
                "field": "African Linguistics",
                "institution": "University of Hamburg, Germany",
                "year": 0,
            },
            {
                "degree": "MPhil.",
                "field": "Kiswahili Studies",
                "institution": "Moi University, Eldoret",
                "year": 0,
            },
            {
                "degree": "B.Ed (Arts)",
                "field": "Arts",
                "institution": "Moi University, Eldoret",
                "year": 0,
            },
        ],
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
    "research_director": {
        "full_name": "Christopher Ngacho",
        "title": "Prof.",
        "institutional_role": "registrar_research_extension_innovation_resource_mobilization",
        "bio": "Acting Registrar in charge of Research, Extension, Innovation and Resource Mobilization.",
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
        "full_name": "Judith Odhiambo",
        "title": "Dr.",
        "institutional_role": "dean_agriculture_and_natural_resources_management",
        "bio": "Dean of the School of Agriculture and Natural Resources Management as listed on the official school page.",
        "academic_rank": "dean",
    },
    "dean_business": {
        "full_name": "Caleb Akuku",
        "title": "Dr.",
        "institutional_role": "dean_business_and_economics",
        "bio": "Dean of the School of Business and Economics as displayed on the school page.",
        "academic_rank": "dean",
    },
    "dean_education": {
        "full_name": "Justina Ndaita",
        "title": "Dr.",
        "institutional_role": "dean_education_and_human_resource_development",
        "bio": "Dean of the School of Education and Human Resource Development as listed on the official school team page.",
        "academic_rank": "dean",
    },
    "dean_health": {
        "full_name": "Raymond Oigara",
        "title": "Dr.",
        "institutional_role": "dean_health_sciences",
        "bio": "Dean of the School of Health Sciences as displayed on the school page.",
        "academic_rank": "dean",
    },
    "dean_ist": {
        "full_name": "Jane Cherono Maina",
        "title": "Dr.",
        "institutional_role": "dean_information_science_and_technology",
        "bio": "Acting Dean of the School of Information Science & Technology as listed on the school and Academic Division pages.",
        "academic_rank": "dean",
    },
    "dean_pure_sciences": {
        "full_name": "Robert Obogi",
        "title": "Dr.",
        "institutional_role": "dean_pure_and_applied_sciences",
        "bio": "Dean of the School of Pure and Applied Sciences as referenced in current official university publications.",
        "academic_rank": "dean",
    },
    "dean_arts": {
        "full_name": "Peter Nyansera",
        "title": "Dr.",
        "institutional_role": "dean_arts_and_social_sciences",
        "bio": "Dean of the School of Arts and Social Sciences as listed on the official school page.",
        "academic_rank": "dean",
    },
    "dean_law": {
        "full_name": "Charles Moitui",
        "title": "Dr.",
        "institutional_role": "head_school_of_law",
        "bio": "Dean of the School of Law as referenced in current official university publications.",
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
        "full_name": "Josphat Sawe",
        "title": "Mr.",
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
            {"name": "Department of Agricultural Economics and Agribusiness", "code": "AGECO"},
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
            {"name": "Department of Economics and Statistics", "code": "ECONSTAT"},
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
            {"name": "Department of Educational Foundations & Educational Administration Planning and Economics of Education", "code": "EDFAPE"},
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
            {"name": "Department of Creative and Performing Arts", "code": "CPA"},
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


ADMIN_DEPARTMENTS: list[dict[str, Any]] = [
    {"name": "Vice-Chancellor's Office", "code": "VCO", "wing_code": None, "head_key": "vice_chancellor", "about": "Executive office that provides strategic leadership and institutional coordination."},
    {"name": "Academic Affairs", "code": "ACAFFAIRS", "wing_code": "RAA", "head_key": "registrar_academic", "about": "Academic Affairs Office coordinating graduate programmes, admissions, examinations, and academic processes."},
    {"name": "Student Affairs", "code": "STUAFFAIRS", "wing_code": "STUAFFAIRS", "head_key": "dean_students", "about": "Department mandated to support the academic and developmental pursuits of students."},
    {"name": "Research, Extension, Innovation and Resource Mobilization", "code": "REIRM", "wing_code": "REIRM", "head_key": "research_director", "about": "Official research office responsible for research information, policy, partnerships, grants, and ethics review."},
    {"name": "University Library", "code": "LIB", "wing_code": "RAA", "head_key": "university_librarian", "about": "Official library support unit serving teaching, learning, and research through print and electronic information services."},
    {"name": "Administration, Human Resource and Central Services", "code": "AHRCS", "wing_code": "AHRCS", "head_key": "registrar_admin", "about": "Administrative unit publicly led by the Registrar Administration, Human Resource and Central Services."},
    {"name": "Finance", "code": "FIN", "wing_code": "FIN", "head_key": "finance_officer", "about": "Finance department publicly listed under the APF division and headed by the Finance Officer."},
    {"name": "Planning", "code": "PLNDEV", "wing_code": "PLANNING", "head_key": "dvc_apf", "about": "Planning department listed on the official APF division page."},
    {"name": "Information Communication and Technology (ICT)", "code": "ICT", "wing_code": "ICT", "head_key": "ict_manager", "about": "Support unit sustaining academic and administrative operations through digital infrastructure, systems, and user support."},
    {"name": "Medical Services", "code": "MEDSERV", "wing_code": "MEDICAL", "head_key": "dvc_apf", "about": "Medical Services is listed as an official department under the APF division."},
    {"name": "Internal Audit", "code": "AUDIT", "wing_code": "AUDIT", "head_key": "dvc_apf", "about": "Internal Audit is listed as an official department under the APF division."},
    {"name": "Corporate Communication", "code": "CORPCOMM", "wing_code": "CORPCOMM", "head_key": "dvc_apf", "about": "Corporate Communication is listed as an official department under the APF division."},
    {"name": "Procurement and Supplies", "code": "PROC", "wing_code": "PROC", "head_key": "dvc_apf", "about": "Procurement and Supplies is listed as an official department under the APF division."},
    {"name": "Legal Department", "code": "LEGAL", "wing_code": "LEGAL", "head_key": "dvc_apf", "about": "Legal Department is listed as an official department under the APF division."},
    {"name": "E-Learning Directorate", "code": "ELEARN", "wing_code": "ELEARN", "head_key": "director_elearning", "about": "E-Learning Directorate is listed as an academic unit under the ARSA division."},
    {"name": "Board of Post Graduate Studies", "code": "BPGS", "wing_code": "RAA", "head_key": "registrar_academic", "about": "Board of Post Graduate Studies is listed as an academic unit under the Academic Affairs wing."},
]


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
        "qualifications": spec.get("qualifications"),
        "academic_rank": spec.get("academic_rank"),
        "specialization": spec.get("specialization"),
        "research_interests": spec.get("research_interests"),
        "institutional_role": spec.get("institutional_role"),
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
