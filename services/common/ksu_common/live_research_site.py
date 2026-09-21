"""Exact Research-office profile published on the Kisii University live site.

The detailed projects, funding notices, partnerships and source documents remain
in ``research_source_catalog.json``.  This manifest holds the current profile
page fields that are owned by the Research service and should not be replaced by
copy written for the application.
"""

from __future__ import annotations


LIVE_RESEARCH_PROFILE_URL = (
    "https://kisiiuniversity.ac.ke/%D7%97%D7%96%D7%99%D7%AA%D7%99/"
    "a/2b25301b-de41-435a-a8f1-763f78cd3df2/about"
)

LIVE_RESEARCH_PROFILE = {
    "source_url": LIVE_RESEARCH_PROFILE_URL,
    "overview": (
        "Kisii University aims to be a leading University through academic research "
        "and social welfare. In order to promote research welfare and engender a "
        "vibrant research culture amongst staff and students, facilitative frameworks "
        "are being formulated at the university. The frameworks are equally geared "
        "at strengthening the university’s innovation and extension function and "
        "implementing its objective of commitment to social welfare by facilitating "
        "linkage between research output and community development.\n\n"
        "To this end the university always establishes linkages with other international "
        "and local Universities on various programs. These programs entail staff and "
        "student exchange, mentorship programs and joint research activities. The "
        "University further aims to contribute to the achievement of academic excellence "
        "by promoting integration of research results and teaching. Staff and students "
        "are thus encouraged and supported to enable the University to compete with peer "
        "institutions and be ranked amongst the top Universities in Research consultancy, "
        "Innovation and Extension.\n\n"
        "Kisii University recognizes that Research consultancy, Innovation and Extension "
        "forms a necessary and vital part of its function as a University. Through its "
        "policies and practices, it seeks to encourage the pursuit of excellence in "
        "research and innovation that is undertaken and the extension efforts emanating "
        "from this efforts. The university further supports areas which demonstrate or "
        "hold the promise of showing excellence in research, innovation and extension.\n\n"
        "The University has set a research agenda to conduct basic research that will "
        "provide basis for developing new knowledge and applied research that will "
        "contextualize prevailing knowledge in the different academic fields which are "
        "relevant through defined research categories."
    ),
    "mission": (
        "The mission of the department of Research, Extension, Innovation and Resource "
        "mobilization at Kisii University is to sustain production of high quality "
        "research and consultancy and dissemination of Knowledge, skills and competencies "
        "for the advancement of humanity."
    ),
    "objectives": (
        "Grow research, consultancy capability and capacity\n"
        "Ensure strong research-teaching nexus\n"
        "Link research and consultancy to wider societal responsibilities.\n"
        "Increase and allocate resources to facilitate productivity and reward excellence.\n"
        "Establish research and consultancy clusters/centres of excellence.\n"
        "Enhance institutional status and mission.\n"
        "Develop and maintain strong relationships with donors"
    ),
    "vision": (
        "To create a conducive environment that promotes excellence in research, "
        "extension, innovation and resource mobilization at Kisii University"
    ),
    "mandate": (
        "Research\n"
        "University Consultancy\n"
        "Linkages\n"
        "Extension/ Community Outreach\n"
        "Capacity building in Research and Extension\n"
        "Organizing Seminars and Conferences\n"
        "Promoting High Quality Publications\n"
        "Exhibitions"
    ),
    "research_areas": (
        "Agriculture, and environmental conservation, Science, Information Communication "
        "Technology, Socio-Economics and Culture, Law and Governance, Education, Health "
        "and Community development."
    ),
    "phone": "+254773452323",
    "additional_phone": "+254020491131",
    "address": "408 - 40200 Kisii, Kenya",
    "external_links": {
        "nacosti_application": "https://research-portal.nacosti.go.ke/",
    },
}


__all__ = ["LIVE_RESEARCH_PROFILE", "LIVE_RESEARCH_PROFILE_URL"]
