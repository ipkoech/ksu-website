"""Source-backed Library manifest from Kisii University's live website."""

from __future__ import annotations


LIVE_LIBRARY_SOURCE_URL = "https://kisiiuniversity.ac.ke/library/library-website"
LIVE_LIBRARY_ABOUT_URL = (
    "https://kisiiuniversity.ac.ke/%D7%97%D7%96%D7%99%D7%AA%D7%99/"
    "library-website/about"
)
LIVE_LIBRARY_OPENING_HOURS_URL = "https://kisiiuniversity.ac.ke/about/opening-hours"
LIVE_LIBRARY_RULES_URL = (
    "https://kisiiuniversity.ac.ke/storage/public/downloads//"
    "LIBRARY%20RULES%20AND%20REGULATIONS.pdf"
)
LIVE_LIBRARY_EBOOKS_URL = (
    "https://kisiiuniversity.ac.ke/%D7%97%D7%96%D7%99%D7%AA%D7%99/"
    "library_collections/electronic-books"
)
LIVE_LIBRARY_JOURNALS_URL = (
    "https://kisiiuniversity.ac.ke/%D7%97%D7%96%D7%99%D7%AA%D7%99/"
    "library_collections/electronic-journals-a-z-listing"
)
LIVE_LIBRARY_EBSCO_URL = (
    "https://kisiiuniversity.ac.ke/%D7%97%D7%96%D7%99%D7%ת%D7%99/"
    "library_collections/ebsco-ebooks"
)

# Keep this URL in the same encoded form as the live site route.
LIVE_LIBRARY_EBSCO_URL = (
    "https://kisiiuniversity.ac.ke/%D7%97%D7%96%D7%99%D7%AA%D7%99/"
    "library_collections/ebsco-ebooks"
)

LIVE_LIBRARY_OBJECTIVES = (
    "To acquire and organize information resources and develop services to support "
    "quality teaching, learning and research.\n"
    "To develop and maintain world class information resources in all formats."
)

LIVE_LIBRARY_BORROWING = (
    "The registered members are issued borrowers’ ticket corresponding to their "
    "entitlement.\n\n"
    "Undergraduate — 2 books for two weeks and 1 reserved short loan book for 4 hours.\n"
    "Masters student — 2 books for 2 weeks and 1 reserved/ short loan for 4 hours.\n"
    "Ph.D student — 4 books for 2 weeks (open shelf) and 1 for short loan for 4 hours.\n"
    "Academic staff — 5 books for 1 month (open shelf) and short loan for 7 days.\n"
    "Non-academic staff — 2 books for 1 month (Open shelf) and short loan for 4 hours."
)

LIVE_LIBRARY_SERVICES = (
    {
        "name": "Reference Information",
        "service_type": "reference",
        "description": "Librarian is available at all times to assist you search and retrieve information.",
    },
    {
        "name": "Book Reservation",
        "service_type": "other",
        "description": "Books not immediately available on the shelves but in stock, can be reserved for readers after a written request on a reservation form at the issue desk.",
    },
    {
        "name": "Book Renewals",
        "service_type": "other",
        "description": "Books on loan can be renewed for a further period. This will be done on request if they have not been reserved.",
    },
    {
        "name": "Loan Recall",
        "service_type": "other",
        "description": "The librarian may recall any material on loan if it is required for special purposes by another user.",
    },
    {
        "name": "Interlibrary Loan",
        "service_type": "inter_library_loan",
        "description": "Library materials not available in the library can be obtained from other libraries through this scheme. This will however depend on the availability of the materials required.",
    },
    {
        "name": "Photocopying and Printing",
        "service_type": "printing",
        "description": "Limited photocopying of articles from books and periodicals will be allowed while respecting copyright laws on fair use. Downloads from internet can be printed for users at a fee.",
    },
    {
        "name": "Current Awareness Services",
        "service_type": "other",
        "description": "The Library displays all newly acquired materials before they are shelved for user awareness.",
    },
    {
        "name": "User Education",
        "service_type": "training",
        "description": "Information and instruction shall continuously be provided to the users.",
    },
    {
        "name": "Alerting Services",
        "service_type": "other",
        "description": "The library provides alerting services by E-mail to members of Faculty when new acquisitions in their areas of interest are received in the library.",
    },
    {
        "name": "Multimedia",
        "service_type": "other",
        "description": "Our Library provides information in non-book format e.g. audio cassettes and CD ROMs.",
    },
    {
        "name": "Electronic Resources",
        "service_type": "other",
        "description": "The University Library provide electronic resources through the programme of TEEAL (The Essential Electronic Agricultural Library), a fully searchable database of full text articles from more than 200 journals.",
    },
    {
        "name": "Bindery Services",
        "service_type": "other",
        "description": "This facility is available at the Main Campus Library. It provides the following services: Repair of Books, Spiral Binding, Hard Cover Binding, Soft Cover Binding, Binding of projects theses and Dissertations, paper trimming etc. all these services are offered at competitive prices.",
    },
)

LIVE_LIBRARY_CHARGES = (
    {
        "name": "Mobile phone penalty",
        "charge_type": "other",
        "amount": "100.00",
        "rate_unit": "flat",
        "description": "Use of mobile phones is strictly prohibited in the library. Offenders will be charged Kshs.100/=. ",
    },
    {
        "name": "Replacement of borrowers ticket",
        "charge_type": "membership",
        "amount": "50.00",
        "rate_unit": "flat",
        "description": "Replacement of loss of Borrowers ticket is 50/= per card.",
    },
    {
        "name": "Photocopying services",
        "charge_type": "photocopy",
        "amount": "5.00",
        "rate_unit": "per_page",
        "description": "Photocopying services is 5/= per page.",
    },
    {
        "name": "Printing services",
        "charge_type": "printing",
        "amount": "10.00",
        "rate_unit": "per_page",
        "description": "Printing services is 10/= per page.",
    },
    {
        "name": "Library use by non-members",
        "charge_type": "membership",
        "amount": "200.00",
        "rate_unit": "per_day",
        "description": "Usage of library materials for non members is charged 200/= per day, subject to availability of space.",
    },
    {
        "name": "Loss of luggage section ticket",
        "charge_type": "other",
        "amount": "100.00",
        "rate_unit": "flat",
        "description": "Loss of luggage section ticket is charged 100/=. ",
    },
    {
        "name": "Long-loan overdue fine",
        "charge_type": "overdue_fine",
        "amount": "10.00",
        "rate_unit": "per_day",
        "description": "Any borrower who fails to return or renew a long-loan material is charged a fine of 10/= shillings per material per day, up to 30 days.",
    },
)

LIVE_LIBRARY_CHARGES_TEXT = (
    "In case of loss, the borrower will be charged Three times the current cost of "
    "books in print.\n"
    "Five times the cost of replacement for books out of print.\n"
    "Use of mobile phones is strictly prohibited in the library. Offenders will be "
    "charged Kshs.100/=.\n"
    "Replacements of loss of Borrowers ticket is 50/= per card.\n"
    "Photocopying services is 5/= per page.\n"
    "Printing services is 10/= per page.\n"
    "Usage of library materials for non members is charged 200/= per day, subject to "
    "availability of space.\n"
    "Loss of luggage section ticket is charged 100/=.\n"
    "Any borrower who fails to return or renew a long-loan material is charged a fine "
    "of Kshs10/= per material per day, up to 30 days. After 30 days, the borrower is "
    "billed for the material.\n"
    "Short loan materials are issued for a maximum period of 4 hours. Any borrower who "
    "fails to return a book from the Short-loan collection or Africana at a stated time "
    "shall be charged a fine of Kshs20/= per material per hour. Sundays and Public "
    "holidays are included in calculating all the fines."
)

LIVE_LIBRARY_RULES = (
    "Order and silence must be maintained at all times in the Library.\n"
    "Briefcases, bags, overcoats, hats, umbrellas, etc., are not allowed in the library.\n"
    "All persons entering the library must show their university Identification at the entrance.\n"
    "All persons leaving the library must show all their documents to the Security staff at exit.\n"
    "The library will not take responsibility for loss or damage of personal property left in the reading and baggage areas.\n"
    "Ink bottles, paints or any item which might accidentally damage library materials are not allowed into the library.\n"
    "Damage of library materials, equipment, property, or building is prohibited and must be reported immediately to library staff. Those responsible must pay for the damage.\n"
    "The Library reserves the right to ask any person to stop using computer equipment if the library staff has reasonable grounds to believe that the person is misusing it.\n"
    "Computers are provided for the purpose of research and other educational endeavours. Misuse of these facilities, including game playing, personal email, e-trade, hacking and changing PC or network settings, online application or registration, is prohibited.\n"
    "Food, drinks, edibles such as chewing gum and biscuits, wet umbrellas and any other materials that might damage library materials or property should not be brought to the library.\n"
    "Stealing and attempting to steal library property is an offence. Offenders, if caught, will pay three times the cost of the material.\n"
    "The University Librarian will suspend any user whose conduct in the library is unbecoming or disorderly or causes damage to Library Materials or Property.\n"
    "Users are responsible for checking that the books they borrow are not damaged before they are borrowed, otherwise, they will be held responsible for the damage.\n"
    "Every reader entering the library should deposit their belongings at the property counter.\n"
    "In case of a power outage/blackout every reader MUST clear from the library within 15 minutes.\n"
    "Cyber Library is to be utilized for academic purpose only.\n"
    "Online chatting in the cyber-library is not allowed.\n"
    "Users are not allowed to carry eatables and drinks in the cyber Library area.\n"
    "Readers are not to share their e-mail ID and password with other students.\n"
    "Changing the setting and display of the computers kept in the cyber library/reading hall is not allowed.\n"
    "Playing games on computers is strictly prohibited in the entire library premises.\n"
    "Students should take care of their pen drives, CD/DVD ROMs, cell phones and wallets.\n"
    "Use of internet for any commercial purpose is prohibited.\n"
    "Users should not interfere with or disrupt network services or equipment."
)

LIVE_LIBRARY_REGULATIONS = (
    ("Borrowing", "borrowing", LIVE_LIBRARY_BORROWING),
    ("Services Offered to Readers", "general", "\n".join(item["description"] for item in LIVE_LIBRARY_SERVICES)),
    ("Library Charges", "fees", LIVE_LIBRARY_CHARGES_TEXT),
    ("General Library Rules And Regulations", "conduct", LIVE_LIBRARY_RULES),
)

LIVE_LIBRARY_BRANCHES = (
    {
        "name": "Main Campus Library",
        "short_name": "Main Campus Library",
        "slug": "main-campus-library",
        "description": "Library Welcome Message will be updated soon",
        "objectives": LIVE_LIBRARY_OBJECTIVES,
        "mission": "Empowering teaching, learning, research and innovation by providing equitable access to quality information resources, innovative services and enabling technologies that enhance academic excellence and student success.",
        "vision": "A leading academic information centre that advances teaching, learning, research and innovation with global impact.",
        "address": None,
        "phone": None,
        "email": None,
        "website_url": LIVE_LIBRARY_SOURCE_URL,
        "latitude": None,
        "longitude": None,
        "library_type": "main",
        "sort_order": 10,
    },
    {
        "name": "Branch Campus Libraries",
        "short_name": "Branch Libraries",
        "slug": "branch-campus-libraries",
        "description": None,
        "objectives": None,
        "mission": None,
        "vision": None,
        "address": None,
        "phone": None,
        "email": None,
        "website_url": LIVE_LIBRARY_OPENING_HOURS_URL,
        "latitude": None,
        "longitude": None,
        "library_type": "branch",
        "sort_order": 20,
    },
)

LIVE_LIBRARY_HOURS = {
    "main-campus-library": (
        {"day_type": "weekday", "opens_at": "08:00", "closes_at": "22:00", "note": "During Semester; Monday to Friday"},
        {"day_type": "saturday", "opens_at": "08:00", "closes_at": "17:00", "note": "During Semester"},
        {"day_type": "sunday", "opens_at": "08:00", "closes_at": "14:00", "note": "During Semester"},
        {"day_type": "public_holiday", "opens_at": "08:00", "closes_at": "14:00", "note": "During Semester"},
    ),
    "branch-campus-libraries": (
        {"day_type": "weekday", "opens_at": "08:00", "closes_at": "18:00", "note": "Branch Campus Libraries"},
        {"day_type": "saturday", "opens_at": "08:00", "closes_at": "17:00", "note": "Branch Campus Libraries"},
    ),
}


def _resource(name: str, url: str, letter: str, resource_type: str, order: int, description: str | None = None, *, provider: str | None = None, subjects: list[str] | None = None, access_level: str = "all", access_type: str = "both", requires_registration: bool = False) -> dict:
    return {
        "name": name,
        "slug": name,
        "provider": provider,
        "description": description,
        "access_url": url,
        "section_letter": letter,
        "resource_type": resource_type,
        "subjects": subjects,
        "access_level": access_level,
        "access_type": access_type,
        "requires_registration": requires_registration,
        "is_featured": order <= 30,
        "sort_order": order,
    }


LIVE_LIBRARY_ELECTRONIC_RESOURCES = (
    _resource("Institutional Repository", "http://repository.kisiiuniversity.ac.ke:8080/xmlui/", "I", "reference", 10, "This is a digital service that collects, preserves, and distributes digital material.", provider="Kisii University", subjects=["Journals and research papers", "Lecture notes", "Past examination papers", "Public lectures and speeches", "Theses and dissertations", "Undergraduate projects"]),
    _resource("MYLOFT E-RESOURCE ACCESS", "https://app.myloft.xyz/user/login?institute=cl4pou55huc740960l7k1mftg", "M", "database", 20, "Access Electronic Resources off campus through MYLOFT Application.", provider="MyLOFT", access_level="students", access_type="off_campus", requires_registration=True),
    _resource("EBSCO eBooks", LIVE_LIBRARY_EBSCO_URL, "E", "ebook_platform", 30, "Kisii University has subscribed to the EBSCO eBooks package with over 257,000 ebooks available for access.", provider="EBSCO"),
    _resource("Bartley by", "http://www.bartleyby.com/", "B", "ebook_platform", 40, "The full text of many classic literary works, including Shakespeare."),
    _resource("BOOKBOON", "http://bookboon.com/", "B", "ebook_platform", 50, "An online book publishing company that provides free textbooks to students all around the world."),
    _resource("Booksee", "http://en.booksee.org/", "B", "ebook_platform", 60, "A portal that offers over 2,400,000 downloadable ebooks (PDFs)."),
    _resource("Directory of Open Access Journals (DOAJ)", "http://doaj.org/", "D", "ebook_platform", 70, "An online directory that indexes and provides access to quality open access, peer-reviewed journals in all fields."),
    _resource("E prints in Library and Information Science (E-LIS)", "http://eprints.rclis.org/", "E", "ebook_platform", 80, "An international open access repository for academic papers in Library and Information Science and Information Technology."),
    _resource("GOOGLE SCHOLAR", "http://scholar.google.com/", "G", "reference", 90, "A freely accessible web search engine that indexes the full text of scholarly literature across an array of publishing formats and disciplines."),
    _resource("Internet Public Library", "http://www.ipl.org/", "I", "ebook_platform", 100, "45,000+ full text works, fiction and non-fiction plus online reference works. Divided into subject collection."),
    _resource("Medical student", "http://www.medicalstudent.com", "M", "reference", 110, "A digital library of authoritative medical education information for the medical student and all students of medicine."),
    _resource("Net Library free titles", "http://www.netlibrary.com/", "N", "ebook_platform", 120, "Over 3,000 out of copyright works, including the Bible, Shakespeare, and classic works of literature and philosophy."),
    _resource("Online Books", "http://onlinebooks.library.upenn.edu/", "O", "ebook_platform", 130, "An index of over 1 million online freely readable books over the internet. It is hosted by the University of Pennsylvania libraries."),
    _resource("Open Book Publishers", "http://www.openbookpublishers.com/", "O", "ebook_platform", 140, "Offers access to PDF and eBook editions, including a free online edition that can be read via the website or downloaded."),
    _resource("Oxford Text Archive", "http://ota.ahds.ac.uk/", "O", "ebook_platform", 150, "The archive holds several thousand electronic texts and linguistics corpora, in a variety of languages."),
    _resource("Pdf Drive", "https://www.pdfdrive.com/", "P", "ebook_platform", 160, "Pdf Drive is a search engine for PDF ebook files."),
    _resource("Project Gutenberg", "http://www.gutenberg.org/", "P", "ebook_platform", 170, "A fully searchable collection of 18,000+ multilingual eBooks and other formats such as audio books."),
    _resource("TEEAL: The Essential Electronic Agricultural Library", "https://www.teeal.org/", "T", "database", 180, "A full text and searchable database of articles from more than 275 high quality research journals of agriculture and related sciences spanning several years. It is a searchable offline digital library updated annually."),
    _resource("World Bank open Knowledge repository", "https://openknowledge.worldbank.org/", "W", "reference", 190, "The World Bank Open Knowledge Repository is the World Bank’s official open access repository for its research outputs and knowledge products."),
    _resource("Access to Global Online Research in Agriculture (AGORA)", "http://www.fao.org/agora/en", "A", "database", 200, "Provides access to a digital library collection in food, agriculture, environmental science and related social science with a collection of 1,900 journals.", requires_registration=True),
    _resource("ARDI – Research for Innovation", "http://ardi2.wipo.int", "A", "database", 210, "Provides access to scholarly literature from diverse fields of science and technology.", requires_registration=True),
    _resource("American Institute of Physics Journal", "http://www.aip.org/pubs/", "A", "ejournal_aggregator", 220, "Subjects covered include condensed matter and materials science, applied physics and applied mathematics, measurement science and sensors, plasma physics, optical atomic and molecular physics, high energy and nuclear physics, medical and biological physics, physics education and computer science."),
    _resource("American Physical Society", "http://journals.aps.org/", "A", "ejournal_aggregator", 230),
    _resource("Acoustical Society of America", "http://scitation.aip.org/jasa", "A", "ejournal_aggregator", 240),
    _resource("Annual Reviews", "http://arjournals.annualreviews.org/", "A", "ejournal_aggregator", 250, "Offers full text articles in Biomedical, Life, Physical and Social Sciences."),
    _resource("Cambridge University Press", "http://www.cambridge.org", "C", "ejournal_aggregator", 260, "Subjects covered include linguistics, politics, medicine, science, law, mathematics, technology, social science and humanities."),
    _resource("Canadian Science Publishing publisher of the NRC Research Press Journal", "http://www.nrcresearchpress.com", "C", "ejournal_aggregator", 270),
    _resource("COCHRAIN LIBRARY", "http://www.thecochrainlibrary.com", "C", "database", 280, "An internationally acclaimed database of regularly updated evidence-based medical systematic reviews."),
    _resource("DIRECTORY OF OPEN ACCESS RESOURCES (OPENDOAR)", "http://www.opendoar.org", "D", "reference", 290, "A comprehensive and authoritative list of academic open access repositories."),
    _resource("DE GRUYTER", "http://www.degruyter.com", "D", "ejournal_aggregator", 300, "Access to over 117 titles delivering content in humanities, medicine, the sciences and law."),
    _resource("EBSCO HOST RESEARCH DATABASES EBSCO", "http://search.epnet.com", "E", "database", 310, "Provides access to over 11,000 full text, peer-reviewed journals and over 15,000 abstracted and indexed titles."),
    _resource("EDINBURG UNIVERSITY PRESS", "http://www.euppublishing.com", "E", "ejournal_aggregator", 320, "Contains over 30 full text electronic journals."),
    _resource("EMERALD GROUP PUBLISHING LTD", "http://www.emeraldinsight.com", "E", "ejournal_aggregator", 330, "Subjects covered include accounting and auditing, economics, education, engineering, environmental management, food and nutrition, health care management, information management, library management, marketing and public sector management."),
    _resource("HENRY STEWART TALKS LTD", "http://hstalks.com", "H", "database", 340, "Specially prepared, online, animated, audio-visual lectures by authorities on biomedical and life sciences for researchers and university faculty members."),
    _resource("IEEE explore Digital Library", "http://ieeexplore.ieee.org", "I", "database", 350),
    _resource("IET Digital Library", "http://www.theiet.org", "I", "database", 360, "Over 20 research journals and letters in electrical and electronic engineering."),
    _resource("Institute for Operations Research and Management Sciences (INFORMS)", "http://www.informs.org", "I", "database", 370),
    _resource("INSTITUTE OF PHYSICS PUBLISHING (IOP)", "http://www.iop.org", "I", "ejournal_aggregator", 380, "IOP publishes over 60 journals in physics and related sciences."),
    _resource("INTERNATIONAL MONETARY FUND", "http://www.elibrary.imf.org", "I", "database", 390, "IMF eLibrary provides comprehensive data and original analysis, with coverage of almost every economy in the world."),
    _resource("JSTOR", "http://www.jstor.org", "J", "database", 400, "Subjects covered include economics and history, political science, archaeology, African studies, music, art and art history, business, ecology and botany, language and literature, mathematics and statistics."),
    _resource("LEXIS NEXIS ELECTRONIC JOURNALS", "https://plus.lexis.com/uk?identityprofileid=TSVD9369626", "L", "database", 410, "Offers access to millions of peer reviewed sources."),
    _resource("MARY ANN LIEBERT, INC", "http://www.liebertonline.com", "M", "ejournal_aggregator", 420, "Subjects covered include biomedical research and life sciences, biotechnology, clinical medicine and surgery, engineering and informatics, law, psychology and public health."),
    _resource("NATURE PUBLISHING GROUP", "http://www.nature.com/", "N", "ejournal_aggregator", 430, "Nature publishes journals and online databases across the life, physical and applied sciences and clinical medicine."),
    _resource("OECD", "http://www.oecd-ilibrary.org", "O", "database", 440),
    _resource("OSA Journals", "http://www.osapublishing.org", "O", "ejournal_aggregator", 450),
    _resource("OXFORD JOURNALS", "http://www.oxfordjournals.org/", "O", "ejournal_aggregator", 460, "Oxford Journals publishes journals from science, technical, professional, medical, humanities, arts and social science disciplines, giving access to over 200 titles."),
    _resource("PALGRAVE MACMILLAN JOURNALS", "http://www.palgrave-journals.com", "P", "ejournal_aggregator", 470, "Palgrave Macmillan offers a combined portfolio of over 70 peer-reviewed e-journals in the humanities and social sciences."),
    _resource("PROJECT MUSE", "http://muse.jhu.edu", "P", "ejournal_aggregator", 480, "Provides online access to full-text journals in humanities and social science."),
    _resource("ROYAL COLLEGE OF PHYSICIANS", "http://www.ingentaconnect.com/content/cop/cm", "R", "ejournal_aggregator", 490, "Full text issues in clinical medicine and public health."),
    _resource("ROYAL SOCIETY", "http://www.royalsocietypublishing.org/journals", "R", "ejournal_aggregator", 500, "Seven leading international journals covering biological and physical sciences."),
    _resource("Royal Society of Chemistry - RSC Journals Archive", "http://pubs.rsc.org", "R", "ejournal_aggregator", 510),
    _resource("SAGE ONLINE JOURNALS", "http://online.sagepub.com/", "S", "ejournal_aggregator", 520, "Access to over 550 journals in business, humanities, social sciences and scientific, technical and medical sciences."),
    _resource("Society for Industrial and Applied Mathematics Journals", "http://epubs.siam.org/", "S", "ejournal_aggregator", 530),
    _resource("Taylor & Francis Journals", "http://www.tandfonline.com", "T", "ejournal_aggregator", 540, "More than 1,300 titles in humanities, social sciences and applied sciences."),
    _resource("THE GEOLOGICAL SOCIETY", "http://www.geolsoc.org.uk", "T", "ejournal_aggregator", 550, "An online collection comprising journals of the Geological Society of London and related book series."),
    _resource("University of California", "http://www.ucpressjournals.com/", "U", "ejournal_aggregator", 560, "Access to 33 journals of the University of California Press."),
    _resource("UNIVERSITY OF CHICAGO PRESS", "http://www.journals.uchicago.edu/", "U", "ejournal_aggregator", 570, "Publishes scholarly journals in the social sciences, humanities, education, biological and medical sciences and physical sciences."),
    _resource("WILEY ONLINE LIBRARY", "http://www.interscience.wiley.com", "W", "ejournal_aggregator", 580, "Provides access to millions of articles across a wide range of journals, including a package of over 350 journals."),
)

LIVE_LIBRARY_FILES = (
    {
        "title": "LIBRARY RULES AND REGULATIONS.pdf",
        "description": "Official Library Rules and Regulations published by Kisii University.",
        "file_category": "policy",
        "source_url": LIVE_LIBRARY_RULES_URL,
        "media_filename": "LIBRARY RULES AND REGULATIONS.pdf",
    },
    {
        "title": "Subscribed EBSCO-eBooks.xlsx",
        "description": "EBSCO eBooks title list linked from the Library website.",
        "file_category": "guide",
        "source_url": "https://kisiiuniversity.ac.ke/storage/public/downloads//Subscribed%20EBSCO-eBooks.xlsx",
        "media_filename": "Subscribed EBSCO-eBooks.xlsx",
    },
    {
        "title": "E-Resources Bronchure.pdf",
        "description": "E-Resources brochure linked from the Library website.",
        "file_category": "brochure",
        "source_url": "https://kisiiuniversity.ac.ke/storage/public/downloads//E-Resources%20Bronchure.pdf",
        "media_filename": "E-Resources Bronchure.pdf",
    },
)


__all__ = [
    "LIVE_LIBRARY_ABOUT_URL",
    "LIVE_LIBRARY_BORROWING",
    "LIVE_LIBRARY_BRANCHES",
    "LIVE_LIBRARY_CHARGES",
    "LIVE_LIBRARY_EBOOKS_URL",
    "LIVE_LIBRARY_EBSCO_URL",
    "LIVE_LIBRARY_ELECTRONIC_RESOURCES",
    "LIVE_LIBRARY_FILES",
    "LIVE_LIBRARY_HOURS",
    "LIVE_LIBRARY_JOURNALS_URL",
    "LIVE_LIBRARY_OBJECTIVES",
    "LIVE_LIBRARY_OPENING_HOURS_URL",
    "LIVE_LIBRARY_REGULATIONS",
    "LIVE_LIBRARY_RULES",
    "LIVE_LIBRARY_RULES_URL",
    "LIVE_LIBRARY_SERVICES",
    "LIVE_LIBRARY_SOURCE_URL",
]
