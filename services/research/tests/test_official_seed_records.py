from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SEED_PARTNERS = (ROOT / "app" / "seeders" / "seed_partners.py").read_text()
SEED_RESEARCH = (ROOT / "app" / "seeders" / "seed_research.py").read_text()
RESEARCH_HEADER = (
    ROOT.parents[1] / "frontend" / "apps" / "research" / "src" / "components" / "research-header.tsx"
).read_text()
SHARED_MINIHEADER = (
    ROOT.parents[1] / "frontend" / "packages" / "ui" / "src" / "components" / "layout" / "public" / "mini-header.tsx"
).read_text()


OFFICIAL_PARTNERS = [
    "University of Kansas Medical Centre",
    "Pentecostal Life University",
    "Computer Aid International",
    "Kenya National Library Service",
    "Kenya Marine Fisheries Research Institute",
    "Books for Africa",
    "Jingdezhen University",
    "Bowling Green State University",
    "Austin Peay State University",
    "International Computer Driving License",
    "Kenya Agricultural and Livestock Research Organization",
    "University of Minnesota",
    "Semyung University",
    "University of Cape Town",
    "International Youth Fellowship",
    "Kantar Public",
    "Mogadishu University",
    "Kenya National Commission on Human Rights",
]

REMOVED_PARTNERS = [
    "Mozilla Foundation",
    "Sheffield Hallam University",
    "Durban University of Technology",
    "Ladoke Akintola University of Technology",
    "Innovate Durban",
]

OFFICIAL_GRANTS = [
    "Scientific Manuscript Writing Workshop at Kisii University",
    "Communicating Research findings",
    "Post-Harvest Losses in South Western Kenya",
    "Effect of Human Immunodeficiency virus on progesterone and cytokines levels during pregnancy",
    "Home and school partnership for child development",
    "Innovation partnership for accelerating third generation mini girds deployment in Africa, for rural electrification and sustainable development",
    "Development and promotion of insect-based feeds to sustainably increase productivity, income, and resilience of fish farming in Kenya",
    "Enhancing Local Social Capital In Kenya",
    "African Higher Education Leadership in Advancing Inclusive Innovation for Development",
    "Efficacy of Selected Indigenous Medicinal Plants from Kenya against Drug Resistant Mycobacteria tuberculosis",
    "DAAD Msc and PhD Scholarships in Fisheries",
    "African Development Bank Msc and PhD Scholarships",
    "National Research Fund Msc and PhD Students",
]


def test_partner_seeders_only_use_official_published_mous():
    for partner in OFFICIAL_PARTNERS:
        assert partner in SEED_PARTNERS
        assert partner in SEED_RESEARCH

    for partner in REMOVED_PARTNERS:
        assert partner not in SEED_PARTNERS
        assert f'"name": "{partner}"' not in SEED_RESEARCH


def test_external_grant_seeder_uses_official_awarded_list():
    for grant in OFFICIAL_GRANTS:
        assert grant in SEED_RESEARCH

    assert "Carbon Literacy for Youth Employability and Job Creation Grant" not in SEED_RESEARCH
    assert "Responsible Computing Challenge Grant" not in SEED_RESEARCH
    assert "external-research-grants-awarded" in SEED_RESEARCH


def test_research_miniheader_has_apply_nacosti_link():
    assert "Apply NACOSTI" in RESEARCH_HEADER
    assert "https://research-portal.nacosti.go.ke/" in RESEARCH_HEADER
    assert "Apply NACOSTI" in SHARED_MINIHEADER
    assert "https://research-portal.nacosti.go.ke/" in SHARED_MINIHEADER
