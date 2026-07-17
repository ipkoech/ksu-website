import unittest
from collections import Counter
from pathlib import Path

from app.seeders._shared import ADMIN_DEPARTMENTS, LEADERSHIP_PEOPLE
from app.seeders._shared import SCHOOL_SPECS
from app.seeders._shared import ICT_SECTION_DEPARTMENTS
from app.seeders.seed_admin_departments import ADMIN_SERVICE_SPECS, MOVED_ADMIN_SERVICE_SLUGS
from app.seeders.seed_content import HOMEPAGE_SLIDER_GROUP, HOMEPAGE_SLIDER_ITEMS
from app.seeders.seed_content import LIVE_SITE_BLOG_ITEMS, LIVE_SITE_EVENT_ITEMS, LIVE_SITE_NEWS_ITEMS
from app.seeders.live_site_snapshot import LIVE_SITE_DOCUMENTS, LIVE_SITE_PAGES
from app.seeders.seed_cover_images import cover_targets_from_specs
from app.seeders.seed_divisions import DIVISION_SPECS, WING_SPECS
from app.seeders.seed_handbook import (
    HANDBOOK_DIVISION_FACTS,
    HANDBOOK_GOVERNANCE_FACTS,
    HANDBOOK_INSTITUTIONAL_FACTS,
    HANDBOOK_LIBRARY_FACTS,
    HANDBOOK_RESEARCH_FACTS,
    HANDBOOK_SCHOOL_FACTS,
    HANDBOOK_SECTIONS,
    HANDBOOK_STUDENT_AFFAIRS_SERVICES,
)
from app.seeders.programme_catalogue import BROCHURE_PROGRAMMES
from app.seeders.seed_portal_users import (
    PORTAL_USER_SPECS,
    SCHOOL_DEAN_PORTAL_USER_PASSWORD,
    SCHOOL_DEAN_PORTAL_USER_SPECS,
)
from app.seeders.seed_rbac import RECONCILED_ROLE_NAMES, ROLE_SPECS
from app.seeders.seed_programmes import programme_code
from app.seeders.seed_public_records import CLUB_SPECS, CONTACT_SPECS, DOWNLOAD_SPECS, FAQ_SPECS
from app.seeders.seed_public_records import _merged_download_specs
from app.seeders.seed_staff_profiles import LIVE_STAFF_PROFILE_SPECS
from app.seeders.seed_university_info import HANDBOOK_SOURCE, HANDBOOK_SOURCE_PHRASES
from app.schemas.base import slugify


def duplicates(values):
    return sorted(value for value, count in Counter(values).items() if count > 1)


class SeederDataTests(unittest.TestCase):
    def test_homepage_slider_specs_are_source_backed(self):
        asset_root = Path(__file__).resolve().parents[1] / "app" / "seeders" / "assets" / "content"

        self.assertEqual("homepage-hero", HOMEPAGE_SLIDER_GROUP["slug"])
        self.assertEqual("home.hero", HOMEPAGE_SLIDER_GROUP["location"])
        self.assertEqual(3, HOMEPAGE_SLIDER_GROUP["max_slides"])
        self.assertEqual(3, len(HOMEPAGE_SLIDER_ITEMS))
        self.assertEqual([], duplicates(spec["title"] for spec in HOMEPAGE_SLIDER_ITEMS))

        for spec in HOMEPAGE_SLIDER_ITEMS:
            self.assertIn("https://kisiiuniversity.ac.ke/blog/", spec["source_url"])
            self.assertIn("https://kisiiuniversity.ac.ke/storage/public/resources/", spec["source_image_url"])
            self.assertTrue((asset_root / spec["asset_filename"]).exists())

    def test_live_site_publication_snapshot_contains_current_official_records(self):
        news_by_title = {spec["title"]: spec for spec in LIVE_SITE_NEWS_ITEMS}
        blog_by_title = {spec["title"]: spec for spec in LIVE_SITE_BLOG_ITEMS}

        expected_current_news = {
            "KSU Scouts Clinch three Regional titles",
            "Kudos Davis Ogega, Barbara Aron, and Talia Tamar",
            "Cancer Prevention and Care Workshop",
            "Medical Class of 2031 White Coat Ceremony",
        }
        self.assertEqual(set(), expected_current_news - set(news_by_title))
        self.assertGreaterEqual(len(LIVE_SITE_NEWS_ITEMS), 200)
        self.assertIn("INNOVATION WEEK 2026 WEBSITE", blog_by_title)

        for spec in LIVE_SITE_NEWS_ITEMS[:25]:
            self.assertIn("https://kisiiuniversity.ac.ke/blog/", spec["source_url"])
            self.assertIn("kisiiuniversity.ac.ke", spec["source_image_url"])
            self.assertTrue(spec["plain_text"])
            self.assertTrue(spec["published_at"].tzinfo)

    def test_live_site_event_snapshot_contains_current_official_events(self):
        events_by_title = {spec["title"]: spec for spec in LIVE_SITE_EVENT_ITEMS}

        self.assertIn("KSU 15th Graduation Ceremony", events_by_title)
        self.assertIn("Innovation Week 2026", events_by_title)
        for spec in LIVE_SITE_EVENT_ITEMS:
            self.assertIn("https://kisiiuniversity.ac.ke/event/", spec["source_url"])
            self.assertTrue(spec["start_date"].tzinfo)
            self.assertGreaterEqual(spec["end_date"], spec["start_date"])

    def test_full_live_site_snapshot_contains_official_public_sections(self):
        pages_by_path = {spec["path"]: spec for spec in LIVE_SITE_PAGES}
        required_paths = {
            "/",
            "/about_us",
            "/news",
            "/page_downloads",
            "/faq",
            "/campus-life",
            "/A-ZClubs",
            "/data_privacy_statement",
            "/school/school-of-health-sciences",
            "/dpt/information-communication-and-technology-ict",
            "/profile_view/prof-fredrick-o-wanyama-phd",
            "/admission/how-to-apply",
        }

        self.assertGreaterEqual(len(LIVE_SITE_PAGES), 1670)
        self.assertEqual(set(), required_paths - set(pages_by_path))
        for path in required_paths:
            spec = pages_by_path[path]
            self.assertTrue(spec["source_url"].startswith("https://kisiiuniversity.ac.ke"))
            self.assertTrue(spec["source_hash"])
            self.assertTrue(spec["plain_text"])

    def test_live_site_staff_profile_snapshot_contains_official_profiles(self):
        profile_paths = {spec["path"] for spec in LIVE_SITE_PAGES if spec["page_type"] == "profile"}

        self.assertGreaterEqual(len(profile_paths), 55)
        self.assertIn("/profile_view/allan-khisa", profile_paths)
        self.assertIn("/profile_view/dr-abraham-nyakebogo-osogo", profile_paths)
        self.assertIn("/profile_view/prof-fredrick-o-wanyama-phd", profile_paths)

    def test_live_staff_profile_specs_are_extracted_from_profiles(self):
        profiles_by_path = {spec["source_path"]: spec for spec in LIVE_STAFF_PROFILE_SPECS}

        self.assertGreaterEqual(len(LIVE_STAFF_PROFILE_SPECS), 55)
        khisa = profiles_by_path["/profile_view/allan-khisa"]
        self.assertEqual("Dr.", khisa["title"])
        self.assertEqual("Khisa Wanjala Allan", khisa["full_name"])
        self.assertEqual("C.O.D, Human Anatomy", khisa["official_role"])
        self.assertEqual("hod", khisa["institutional_role"])

        osogo = profiles_by_path["/profile_view/dr-abraham-nyakebogo-osogo"]
        self.assertEqual(["FLUID DYNAMICS"], osogo["research_interests"])
        self.assertIn("JOMO KENYATTA UNIVERSITY", osogo["education_background"][0]["raw"])
        self.assertIn("https://kisiiuniversity.ac.ke/profile_view/dr-abraham-nyakebogo-osogo", osogo["website_url"])

    def test_full_live_site_document_snapshot_contains_current_official_files(self):
        document_titles = {spec["title"] for spec in LIVE_SITE_DOCUMENTS}

        self.assertGreaterEqual(len(LIVE_SITE_DOCUMENTS), 120)
        self.assertIn("Kisii University 15th Graduation Booklet March 2026.pdf", document_titles)
        self.assertIn("KISII UNIVERSITY  STRATEGIC  PLAN 2024 - 2028-6.pdf", document_titles)
        for spec in LIVE_SITE_DOCUMENTS:
            self.assertIn("kisiiuniversity.ac.ke", spec["url"])
            self.assertIn("kisiiuniversity.ac.ke", spec["source_page_url"])

    def test_download_specs_include_full_live_document_snapshot(self):
        merged_urls = {str(spec["url"]) for spec in _merged_download_specs()}

        self.assertGreater(len(_merged_download_specs()), len(DOWNLOAD_SPECS))
        for spec in LIVE_SITE_DOCUMENTS:
            self.assertIn(str(spec["url"]), merged_urls)

    def test_handbook_source_enriches_university_seed_data(self):
        handbook_download = next(
            spec for spec in _merged_download_specs() if spec["slug"] == "kisii-university-revised-handbook-2019"
        )

        self.assertEqual(
            "https://kisiiuniversity.ac.ke/storage/public/downloads//Kisii%20University%20Revised%20Handbook%202019.pdf",
            HANDBOOK_SOURCE["url"],
        )
        self.assertEqual("4th edition", HANDBOOK_SOURCE["edition"])
        self.assertEqual(48, HANDBOOK_SOURCE["pages"])
        self.assertEqual("deanofstudents@kisiiuniversity.ac.ke", HANDBOOK_SOURCE["publisher_email"])
        self.assertIn("public chartered institution of higher learning", HANDBOOK_SOURCE_PHRASES)
        self.assertIn("13th Public University in Kenya", HANDBOOK_SOURCE_PHRASES)
        self.assertEqual(HANDBOOK_SOURCE["url"], handbook_download["url"])
        self.assertIn("Dean of Students", handbook_download["description"])

    def test_handbook_constants_cover_full_document_sections(self):
        self.assertGreaterEqual(len(HANDBOOK_SECTIONS), 20)
        self.assertIn("HISTORY OF KISII UNIVERSITY", HANDBOOK_SECTIONS)
        self.assertIn("MESSAGE FROM THE VICE CHANCELLOR", HANDBOOK_SECTIONS)
        self.assertIn("GOVERNANCE AND ADMINISTRATIVE STRUCTURE OF THE UNIVERSITY", HANDBOOK_SECTIONS)
        self.assertIn("BRIEF INFORMATION ON SCHOOLS IN THE UNIVERSITY", HANDBOOK_SECTIONS)
        self.assertIn("UNIVERSITY EXAMINATION REGULATIONS", HANDBOOK_SECTIONS)
        self.assertIn("high level human resource", HANDBOOK_INSTITUTIONAL_FACTS["mission"])

        self.assertEqual("supreme governance organ", HANDBOOK_GOVERNANCE_FACTS["council"]["phrase"])
        self.assertIn("Academic Affairs", HANDBOOK_DIVISION_FACTS["ARSA"]["units"])
        self.assertIn("academic excellence", HANDBOOK_DIVISION_FACTS["ARSA"]["mandate"].lower())
        self.assertIn("research and consultancy", HANDBOOK_DIVISION_FACTS["ARSA"]["mandate"].lower())
        self.assertIn("academic excellence", HANDBOOK_DIVISION_FACTS["ARSA"]["core_values"].lower())
        self.assertIn("Inter-Library Loan", HANDBOOK_LIBRARY_FACTS["services"])
        self.assertIn("University of Minnesota", HANDBOOK_RESEARCH_FACTS["partners"])
        self.assertIn("Work-Study Program", HANDBOOK_STUDENT_AFFAIRS_SERVICES)
        self.assertIn("Public Law", HANDBOOK_SCHOOL_FACTS["SOL"]["handbook_departments"])

    def test_handbook_facts_are_mapped_to_existing_seeders(self):
        divisions_by_code = {spec["code"]: spec for spec in DIVISION_SPECS}
        departments_by_code = {spec["code"]: spec for spec in ADMIN_DEPARTMENTS}
        service_slugs = {spec["slug"] for spec in ADMIN_SERVICE_SPECS}
        schools_by_code = {spec["code"]: spec for spec in SCHOOL_SPECS}

        self.assertIn("human and physical resources", divisions_by_code["APF"]["description"])
        self.assertIn("Academic Affairs", divisions_by_code["ARSA"]["description"])
        self.assertIn("academic excellence", divisions_by_code["ARSA"]["description"].lower())
        self.assertIn("research and consultancy", divisions_by_code["ARSA"]["settings"]["mandate"].lower())
        self.assertEqual(HANDBOOK_INSTITUTIONAL_FACTS["mission"], divisions_by_code["ARSA"]["mission"])
        self.assertEqual(HANDBOOK_INSTITUTIONAL_FACTS["vision"], divisions_by_code["ARSA"]["vision"])
        self.assertEqual(HANDBOOK_DIVISION_FACTS["ARSA"]["core_values"], divisions_by_code["ARSA"]["core_values"])
        self.assertIn("provide quality information services", departments_by_code["LIB"]["about"])
        self.assertIn("research, innovation and extension activities", departments_by_code["REIRM"]["mandate"])
        self.assertIn("enabling environment", departments_by_code["STUAFFAIRS"]["about"])
        self.assertIn("inter-library-loan", service_slugs)
        self.assertIn("research-linkages-and-partnerships", service_slugs)
        self.assertIn("work-study-program", service_slugs)
        self.assertIn("student-accommodation", service_slugs)
        self.assertEqual("sist@kisiiuniversity.ac.ke", schools_by_code["SIST"]["email"])
        self.assertIn("Public Law", schools_by_code["SOL"]["handbook_departments"])
        self.assertIn("Department of Tourism and Hospitality Management", schools_by_code["SBE"]["handbook_departments"])

    def test_handbook_school_departments_are_seeded_as_departments(self):
        schools_by_code = {spec["code"]: spec for spec in SCHOOL_SPECS}
        departments_by_school = {
            code: {department["name"]: department for department in spec["departments"]}
            for code, spec in schools_by_code.items()
        }

        self.assertIn("Department of fisheries and aquatic sciences", departments_by_school["SANRM"])
        self.assertIn("Department of crops and soil sciences", departments_by_school["SANRM"])
        self.assertIn("Department of Environmental Science and Natural Resource Management", departments_by_school["SANRM"])
        self.assertIn("Department of Agricultural and Resource Economics", departments_by_school["SANRM"])
        self.assertIn("Department of Media and Communication Studies", departments_by_school["SIST"])
        self.assertIn("Department of Library and Information Science", departments_by_school["SIST"])
        self.assertIn("Department of Postgraduate Studies", departments_by_school["SASS"])
        self.assertIn("Department of Public Law", departments_by_school["SOL"])
        self.assertIn("Department of Private Law", departments_by_school["SOL"])
        self.assertIn("Department of Commercial Law", departments_by_school["SOL"])
        self.assertIn("Department of Research and Post-graduate Studies", departments_by_school["SOL"])

        self.assertIn("Handbook context", departments_by_school["SANRM"]["Department of fisheries and aquatic sciences"]["about"])
        self.assertIn("Handbook context", departments_by_school["SOL"]["Department of Public Law"]["about"])

    def test_admin_department_specs_are_unique(self):
        self.assertEqual([], duplicates(spec["code"] for spec in ADMIN_DEPARTMENTS))
        self.assertEqual([], duplicates(spec["name"] for spec in ADMIN_DEPARTMENTS))

    def test_official_administration_departments_are_seeded(self):
        official_department_names = {
            "Internal Audit",
            "Procurement and Supplies",
            "Salaries",
            "Student Career Services",
            "Dean of Students",
            "Games and Sports Services",
            "Medical Services",
            "Security",
            "Information Communication and Technology (ICT)",
            "Planning",
            "Central Services",
            "Finance",
            "Registrar Administration",
            "E-Learning Directorate",
            "Town Annexes",
            "Board of Post Graduate Studies",
            "Corporate Communication",
            "Legal Department",
            "Registrar Academic Affairs",
        }
        seeded_by_name = {spec["name"]: spec for spec in ADMIN_DEPARTMENTS}

        self.assertEqual(set(), official_department_names - set(seeded_by_name))
        for department_name in official_department_names:
            self.assertIn("https://kisiiuniversity.ac.ke/dpt/", seeded_by_name[department_name]["source_url"])

    def test_internal_public_site_units_are_not_public_admin_departments(self):
        hidden_units = {
            "Vice-Chancellor's Office",
            "Research, Extension, Innovation and Resource Mobilization",
            "University Library",
        }
        seeded_by_name = {spec["name"]: spec for spec in ADMIN_DEPARTMENTS}

        for department_name in hidden_units:
            self.assertFalse(seeded_by_name[department_name]["is_public"])

    def test_reirm_registrar_is_not_seeded_while_position_is_vacant(self):
        wings_by_code = {code: head_key for _division_code, _name, code, _wing_type, head_key in WING_SPECS}
        reirm_department = next(spec for spec in ADMIN_DEPARTMENTS if spec["code"] == "REIRM")

        self.assertNotIn("research_director", LEADERSHIP_PEOPLE)
        self.assertIsNone(wings_by_code["REIRM"])
        self.assertIsNone(reirm_department["head_key"])

    def test_official_administration_divisions_and_direct_units_are_seeded(self):
        divisions_by_code = {spec["code"]: spec for spec in DIVISION_SPECS}
        wings_by_division = {}
        for division_code, _name, code, _wing_type, _head_key in WING_SPECS:
            wings_by_division.setdefault(division_code, set()).add(code)

        self.assertIn(
            "https://kisiiuniversity.ac.ke/admin_departments/administrative-division",
            divisions_by_code["APF"]["source_url"],
        )
        self.assertIn(
            "https://kisiiuniversity.ac.ke/admin_departments/academic-division",
            divisions_by_code["ARSA"]["source_url"],
        )
        self.assertEqual(
            {"AHRCS", "FIN", "ICT", "MEDICAL", "AUDIT", "PLANNING", "CORPCOMM", "PROC", "LEGAL"},
            wings_by_division["APF"],
        )
        self.assertEqual(
            {"RAA", "REIRM", "ELEARN", "STUAFFAIRS"},
            wings_by_division["ARSA"],
        )

    def test_school_and_academic_department_specs_are_unique(self):
        school_codes = [spec["code"] for spec in SCHOOL_SPECS]
        school_names = [spec["name"] for spec in SCHOOL_SPECS]
        department_codes = [
            department["code"]
            for school in SCHOOL_SPECS
            for department in school["departments"]
        ]
        department_names = [
            department["name"]
            for school in SCHOOL_SPECS
            for department in school["departments"]
        ]

        self.assertEqual([], duplicates(school_codes))
        self.assertEqual([], duplicates(school_names))
        self.assertEqual([], duplicates(department_codes))
        self.assertEqual([], duplicates(department_names))

    def test_programme_specs_link_to_existing_departments(self):
        department_codes = {
            department["code"]
            for school in SCHOOL_SPECS
            for department in school["departments"]
        }
        programme_department_codes = {
            str(spec["department_code"])
            for spec in BROCHURE_PROGRAMMES
        }

        self.assertEqual(set(), programme_department_codes - department_codes)

    def test_programme_specs_have_unique_generated_identifiers(self):
        programme_slugs = [slugify(str(spec["name"])) for spec in BROCHURE_PROGRAMMES]
        programme_codes = [
            programme_code(str(spec["name"]), str(spec["level"]))
            for spec in BROCHURE_PROGRAMMES
        ]

        self.assertEqual([], duplicates(programme_slugs))
        self.assertEqual([], duplicates(programme_codes))

    def test_consolidated_portal_roles_and_users_are_seeded(self):
        roles_by_name = {spec["name"]: spec for spec in ROLE_SPECS}
        users_by_key = {spec["key"]: spec for spec in PORTAL_USER_SPECS}

        expected_roles = {
            "super_admin",
            "admin",
            "corporate_communication_admin",
            "research_admin",
            "library_admin",
            "school_admin",
            "dept_admin",
        }
        self.assertEqual(set(), expected_roles - set(roles_by_name))
        self.assertTrue({"content.review", "media.manage", "homepage.manage"}.issubset(
            roles_by_name["corporate_communication_admin"]["permission_names"]
        ))
        self.assertTrue({"page_sections.review", "page_sections.publish"}.issubset(
            roles_by_name["corporate_communication_admin"]["permission_names"]
        ))
        self.assertTrue({
            "publications.manage",
            "publications.view",
            "publications.submit",
            "publications.review",
            "publications.approve",
        }.issubset(
            roles_by_name["research_admin"]["permission_names"]
        ))

        expected_user_roles = {
            "portal_system_admin": "admin",
            "portal_super_admin": "super_admin",
            "portal_corporate_admin": "corporate_communication_admin",
            "portal_research_admin": "research_admin",
            "portal_library_admin": "library_admin",
            "portal_school_admin": "school_admin",
            "portal_department_admin": "dept_admin",
        }
        self.assertEqual(
            expected_user_roles,
            {key: users_by_key[key]["role"] for key in expected_user_roles},
        )

    def test_school_deans_match_official_academic_division_listing(self):
        expected_deans = {
            "SANRM": ("Dr.", "Judith Achieng Odhiambo"),
            "SASS": ("Dr.", "Peter Nyansera Otieno"),
            "SBE": ("Dr.", "Caleb N. Akuku"),
            "SEHRD": ("Sr. Dr.", "Justina Ndaita"),
            "SHS": ("Dr.", "Raymond Oigara"),
            "SIST": (None, "Jane Cherono Maina"),
            "SOL": ("Dr.", "Charles Otuke Moitui"),
            "SPAS": ("Dr.", "Robert Karieko Obogi"),
        }

        specs_by_code = {spec["code"]: spec for spec in SCHOOL_SPECS}
        for school_code, (title, full_name) in expected_deans.items():
            dean_key = specs_by_code[school_code]["dean_key"]
            dean = LEADERSHIP_PEOPLE[dean_key]
            self.assertEqual(title, dean["title"])
            self.assertEqual(full_name, dean["full_name"])
            self.assertGreater(len(dean.get("leadership_message", "")), 120)
            self.assertFalse(dean["leadership_message"].startswith("Welcome to the School"))

        self.assertIn("title", LEADERSHIP_PEOPLE["dean_ist"]["clear_fields"])

    def test_live_staff_profile_names_are_normalized_from_all_caps(self):
        specs_by_source_path = {spec["source_path"]: spec for spec in LIVE_STAFF_PROFILE_SPECS}
        sbe_dean = specs_by_source_path["/profile_view/dr-caleb-n-akuku"]

        self.assertEqual("Caleb N. Akuku", sbe_dean["full_name"])
        self.assertEqual("Dr.", sbe_dean["title"])

    def test_school_dean_portal_users_are_scoped_school_admins(self):
        expected = {
            spec["code"]: spec["dean_key"]
            for spec in SCHOOL_SPECS
        }
        actual = {
            spec["school_code"]: spec["dean_key"]
            for spec in SCHOOL_DEAN_PORTAL_USER_SPECS
        }

        self.assertEqual(expected, actual)
        self.assertTrue(all(spec["role"] == "school_admin" for spec in SCHOOL_DEAN_PORTAL_USER_SPECS))
        self.assertEqual([], duplicates(spec["key"] for spec in SCHOOL_DEAN_PORTAL_USER_SPECS))
        self.assertEqual("ChangeMe@26", SCHOOL_DEAN_PORTAL_USER_PASSWORD)

    def test_legacy_content_admin_is_explicitly_reconciled_after_reseeding(self):
        roles_by_name = {spec["name"]: spec for spec in ROLE_SPECS}

        self.assertIn("content_admin", RECONCILED_ROLE_NAMES)
        self.assertNotIn("admin:*", roles_by_name["content_admin"]["permission_names"])

    def test_only_corporate_communication_and_system_admin_roles_receive_content_publication_authority(self):
        allowed_roles = {"super_admin", "admin", "corporate_communication_admin", "content_admin"}
        publication_permissions = {
            "content.review",
            "content.approve",
            "content.publish",
            "content.schedule",
            "content.unpublish",
        }

        for spec in ROLE_SPECS:
            elevated = publication_permissions.intersection(spec["permission_names"])
            if spec["name"] not in allowed_roles:
                self.assertEqual(set(), elevated, spec["name"])

        formerly_privileged = {
            "content_manager",
            "library_admin",
            "research_content_admin",
            "research_content",
            "sustainability_admin",
            "research_sustainability",
            "university_farm_admin",
            "research_farm",
        }
        self.assertTrue(formerly_privileged.issubset(RECONCILED_ROLE_NAMES))

    def test_live_site_programme_department_relationship_overrides(self):
        expected_department_codes = {
            "Bachelor of Business and Management": "ACCFIN",
            "Bachelor of Education (Arts)": "ECDESNEEPSC",
            "Bachelor of Education (Primary Option)": "CIM",
            "Bachelor of Education (Special Needs Education)": "CIM",
            "Diploma in Agricultural Economics": "AGEDX",
            "Diploma in Education Arts": "ECDESNEEPSC",
            "Master of Business Administration": "ACCFIN",
            "PhD in Educational Management": "EFAPE",
        }
        programmes_by_name = {str(spec["name"]): spec for spec in BROCHURE_PROGRAMMES}

        for programme_name, department_code in expected_department_codes.items():
            self.assertEqual(department_code, programmes_by_name[programme_name]["department_code"])

    def test_live_site_extra_academic_departments_are_not_seeded(self):
        removed_department_names = {
            "Department of Agricultural Economics and Agribusiness",
            "Department of Creative and Performing Arts",
            "Department of Economics and Statistics",
        }
        department_names = {
            department["name"]
            for school in SCHOOL_SPECS
            for department in school["departments"]
        }

        self.assertEqual(set(), removed_department_names & department_names)

    def test_admin_service_specs_are_unique_per_department(self):
        department_codes = {spec["code"] for spec in ADMIN_DEPARTMENTS}
        service_keys = [(spec["department_code"], spec["slug"]) for spec in ADMIN_SERVICE_SPECS]

        self.assertEqual([], duplicates(service_keys))
        self.assertEqual(
            set(),
            {spec["department_code"] for spec in ADMIN_SERVICE_SPECS} - department_codes,
        )

    def test_requested_administration_office_services_are_seeded(self):
        services_by_department = {}
        for spec in ADMIN_SERVICE_SPECS:
            services_by_department.setdefault(spec["department_code"], set()).add(spec["slug"])

        expected_services = {
            "ACAFFAIRS": {
                "online-admission",
                "online-application",
                "application-forms",
                "academic-affairs-office-support",
            },
            "AHRCS": {
                "customer-care-ticket",
                "complaints-compliments-suggestions",
                "registrar-administration-office-support",
                "recruitment-and-staff-advert-notices",
            },
            "FIN": {"finance-office-support"},
            "ICT": {
                "e-learning-access",
                "student-staff-portal-access",
                "turnitin-access",
                "ict-equipment-repair-and-internet-support",
                "university-system-account-opening",
                "ict-equipment-issuance",
                "website-information-posting",
                "staff-website-profile-updates",
                "student-and-staff-password-resets",
                "erp-system-support",
                "email-and-communication-services",
                "security-and-data-protection",
            },
            "PROC": {
                "tenders-and-supplier-notices",
                "supplier-registration",
                "acquisition-of-goods-works-and-services",
                "stores-and-inventory-management",
                "contract-management-and-disposal",
                "procurement-planning-and-advisory",
                "supplier-relationship-management",
            },
            "MEDSERV": {
                "medical-services-support",
                "general-outpatient-services",
                "laboratory-and-diagnostic-screening",
                "alcohol-and-drug-abuse-prevention",
                "specialized-care-referral",
                "hiv-and-aids-prevention-and-support",
                "public-health-and-sanitation",
            },
        }

        for department_code, expected_slugs in expected_services.items():
            self.assertLessEqual(expected_slugs, services_by_department[department_code])

    def test_requested_administration_office_profiles_use_official_source_details(self):
        departments_by_code = {spec["code"]: spec for spec in ADMIN_DEPARTMENTS}

        self.assertIn("Acting Registrar Academic Affairs", departments_by_code["ACAFFAIRS"]["about"])
        self.assertIn("university adverts", departments_by_code["AHRCS"]["about"])
        self.assertIn("Finance Officer", departments_by_code["FIN"]["about"])
        self.assertIn("ERP support", departments_by_code["ICT"]["mandate"])
        self.assertIn("consolidated procurement plan", departments_by_code["PROC"]["mandate"])
        self.assertIn("general outpatient", departments_by_code["MEDSERV"]["mandate"].lower())

    def test_dean_of_students_official_mandate_services_are_seeded(self):
        dean_of_students = next(spec for spec in ADMIN_DEPARTMENTS if spec["code"] == "STUAFFAIRS")
        service_slugs = {
            spec["slug"]
            for spec in ADMIN_SERVICE_SPECS
            if spec["department_code"] == "STUAFFAIRS"
        }

        self.assertIn("first-year registration", dean_of_students["mandate"].lower())
        self.assertEqual(
            {
                "student-welfare-and-support",
                "student-clubs-and-campus-life-support",
                "first-year-registration-and-orientation",
                "services-to-students-with-disabilities",
                "student-leadership-and-ksusa-support",
                "work-study-program",
                "student-loans-and-bursaries-coordination",
                "leave-of-absence",
                "counselling-and-chaplaincy-services",
                "student-accommodation",
                "kisii-university-students-association",
                "student-organizations",
                "student-handbook-and-cultural-integration",
                "student-bereavement-support",
            },
            service_slugs,
        )

    def test_moved_admin_services_are_not_reseeded_on_old_departments(self):
        service_keys = {(spec["department_code"], spec["slug"]) for spec in ADMIN_SERVICE_SPECS}

        for department_code, service_slugs in MOVED_ADMIN_SERVICE_SLUGS.items():
            for service_slug in service_slugs:
                self.assertNotIn((department_code, service_slug), service_keys)

    def test_public_record_specs_are_unique(self):
        self.assertEqual([], duplicates(spec["slug"] for spec in DOWNLOAD_SPECS))
        self.assertEqual([], duplicates(spec["url"] for spec in DOWNLOAD_SPECS))
        self.assertEqual([], duplicates(spec["question"] for spec in FAQ_SPECS))
        self.assertEqual([], duplicates(spec["name"] for spec in CONTACT_SPECS))

    def test_dean_of_students_handbook_download_is_seeded(self):
        downloads_by_slug = {spec["slug"]: spec for spec in DOWNLOAD_SPECS}

        self.assertEqual(
            "Student Life",
            downloads_by_slug["kisii-university-revised-handbook-2019"]["category"],
        )

    def test_club_specs_match_official_clubs_index(self):
        clubs_by_name = {spec["name"]: spec for spec in CLUB_SPECS}

        self.assertEqual(71, len(CLUB_SPECS))
        self.assertEqual([], duplicates(spec["slug"] for spec in CLUB_SPECS))
        self.assertEqual([], duplicates(spec["name"] for spec in CLUB_SPECS))
        self.assertEqual("professional", clubs_by_name["ACCOUNTING STUDENTS ASSOCIATION"]["club_type"])
        self.assertEqual("religious", clubs_by_name["CHRISTIAN UNION"]["club_type"])
        self.assertEqual("edu-service", clubs_by_name["ST.JOHN AMBULANCE"]["club_type"])
        self.assertEqual("mentorship", clubs_by_name["YOUNG FARMERS ASSOCIATION"]["club_type"])
        self.assertNotIn("Sports Club", clubs_by_name)

    def test_requested_administration_office_downloads_are_seeded(self):
        downloads_by_slug = {spec["slug"]: spec for spec in DOWNLOAD_SPECS}

        expected_categories = {
            "ksuerp-access-and-permissions": "Digital Services",
            "adverts-february-2026-kisii-university": "Administration",
            "tender-servicing-of-printers-and-photocopiers-may-2026": "Procurement",
            "tender-for-water-plant-materials-may-2026": "Procurement",
            "tender-document-for-supply-of-servers-and-other-ict-equipments-may-2026": "Procurement",
            "structured-cabling-tender-may-2026": "Procurement",
            "printing-press-materials-tender-document-may-2026": "Procurement",
            "final-evaluation-report-for-supplier-prequalification-2026-2028": "Procurement",
        }

        for slug, category in expected_categories.items():
            self.assertEqual(category, downloads_by_slug[slug]["category"])

    def test_cover_image_targets_cover_schools_and_departments(self):
        targets = cover_targets_from_specs()
        target_keys = {(target["entity_type"], target["code"]) for target in targets}
        expected_keys = {("school", spec["code"]) for spec in SCHOOL_SPECS}
        expected_keys |= {
            ("department", department["code"])
            for school in SCHOOL_SPECS
            for department in school["departments"]
        }
        expected_keys |= {("department", spec["code"]) for spec in ADMIN_DEPARTMENTS}
        expected_keys |= {("department", spec["code"]) for spec in ICT_SECTION_DEPARTMENTS}

        self.assertEqual(expected_keys, target_keys)

    def test_cover_image_targets_are_unique(self):
        targets = cover_targets_from_specs()
        target_keys = [(target["entity_type"], target["code"]) for target in targets]
        target_names = [(target["entity_type"], target["name"]) for target in targets]

        self.assertEqual([], duplicates(target_keys))
        self.assertEqual([], duplicates(target_names))


if __name__ == "__main__":
    unittest.main()
