"""Newly published official staff profiles verified on 2026-08-10."""

from __future__ import annotations


def _page(path: str, name: str, role: str, content: str, photo_url: str | None = None) -> dict[str, object]:
    source_url = f"https://kisiiuniversity.ac.ke{path}"
    return {
        "title": name,
        "path": path,
        "page_type": "profile",
        "plain_text": f"{name} {role} Biography {content}",
        "headings": [
            {"level": "h2", "text": name},
            {"level": "h4", "text": "Biography"},
            {"level": "h4", "text": "Research Interests"},
            {"level": "h4", "text": "Education Background"},
            {"level": "h4", "text": "Work Experience"},
            {"level": "h4", "text": "Publications"},
            {"level": "h4", "text": "Research Grants"},
            {"level": "h4", "text": "Skills"},
        ],
        "images": ([{"url": photo_url, "alt": name}] if photo_url else []),
        "source_url": source_url,
        "verified_on": "2026-08-10",
    }


LIVE_STAFF_PROFILE_UPDATES = [
    _page(
        "/profile_view/ben-mariga-bogonko",
        "Dr. Ben Mariga Bogonko",
        "Lecturer",
        "Research Interests No research interests provided. Education Background No education records. Work Experience No work experience. Publications No publications available. Research Grants No research grants. Skills No skills listed.",
    ),
    _page(
        "/profile_view/dr-gordon-otieno-ouma",
        "Dr. Gordon Otieno Ouma",
        "Lecturer",
        "Research Interests No research interests provided. Education Background No education records. Work Experience No work experience. Publications No publications available. Research Grants No research grants. Skills No skills listed.",
        "https://digital.kisiiuniversity.ac.ke/storage/avatars/Zu8xfDdqgEgsEh0tMsRz4ygAIZVs0XStR6d2wBce.jpg",
    ),
    _page(
        "/profile_view/dr-james-ogalo",
        "Dr. James Ogalo",
        "Lecturer",
        "Research Interests No research interests provided. Education Background No education records. Work Experience No work experience. Publications No publications available. Research Grants No research grants. Skills No skills listed.",
    ),
    _page(
        "/profile_view/dr-jonathan-abuga-phd",
        "Dr. Jonathan Abuga, PhD",
        "COD, Public Health",
        "Dr. Abuga is a public and environmental health specialist with over a decade of teaching and research experience. His work covers neurological impairment and disability epidemiology, healthcare access, household energy use, air pollution, climate change and health, cancer epidemiology, and health-system strengthening. Research Interests Environmental health; household energy and air pollution; climate change and health; cancer epidemiology; disability epidemiology; health systems. Education Background PhD, University of Amsterdam; master's degree, Hebrew University of Jerusalem; university education at Kenyatta University. Work Experience Teaching and public-health research at Kisii University. Publications Publications listed on the official profile. Research Grants Research projects in environmental health, cancer epidemiology, and communication disorders. Skills Public health research; epidemiology; environmental health; disease-burden modelling.",
        "https://digital.kisiiuniversity.ac.ke/storage/avatars/Q1kWdMmcjITAKo8Yu4RkQRorpP6LaxXB7y05jqbr.jpg",
    ),
    _page(
        "/profile_view/dr-wabwire-jonai",
        "Dr. Wabwire Jonai",
        "Lecturer",
        "Dr. Jonai Wabwire is a media and communication lecturer with more than fourteen years of teaching, research, and professional practice. His expertise includes development communication, journalism studies, media ethics, digital communication, curriculum development, postgraduate supervision, media training, and consultancy. Research Interests Social media and public discourse; digital journalism and news ecosystems; health campaigns and behaviour change; communication for sustainable development; media audiences and reception; corporate reputation management. Education Background Bachelor's, master's, and doctoral education recorded on the official profile. Work Experience Kisii University, 2012 to present. Publications Publications in narrative journalism, science communication, media, and communication research are listed on the official profile. Research Grants No research grants stated. Skills Media and communication research; journalism; curriculum development; postgraduate supervision.",
        "https://digital.kisiiuniversity.ac.ke/storage/avatars/7OGYCmZoAHlWZmows6iAwkZg88XaeiZGAkU8XaND.jpg",
    ),
    _page(
        "/profile_view/dr-wilfred-ochieng-omollo",
        "Dr. Wilfred Ochieng Omollo",
        "Lecturer",
        "Research Interests Urban and regional land-use planning; development control; applied thematic cartography; applied geospatial information science; earth observation. Education Background PhD from Jaramogi Oginga Odinga University of Science and Technology; master's degree from the University of Nairobi; bachelor's degree from Moi University. Work Experience Kisii University and the Ministry of Lands. Publications Publications are accessible through the Google Scholar profile linked by the official page. Research Grants Principal investigator grant recorded on the official profile. Skills Planning; geospatial information science; cartography.",
        "https://kisiiuniversity.ac.ke/storage/staffprofiles/images/m9CaCuua7zItPjzFaTAawxPDz93kCAAyW5sKXTyY.png",
    ),
    _page(
        "/profile_view/dr-zipporah-gichana-phd",
        "Dr. Zipporah Gichana, PhD",
        "C.O.D, Environment, NARE & Aqua",
        "Dr. Zipporah Moraa Gichana is a lecturer and Chairperson of the Department of Environment, Natural Resources and Aquatic Sciences at Kisii University, an adjunct research scientist at AICAD, and Kisii University's Africa-UniNet representative. She is a freshwater scientist and aquaculture researcher specialising in aquatic ecology, limnology, water-quality management, aquaponics, and recirculating aquaculture systems. Her official profile lists ORCID 0000-0001-8581-510X and institutional contact zgichana@kisiiuniversity.ac.ke. Research Interests Aquatic ecology; limnology; water quality; sustainable aquaculture; aquaponics; recirculating aquaculture systems; climate resilience. Education Background PhD in Natural Resources and Life Sciences with distinction from the University of Natural Resources and Life Sciences, Vienna, and an MSc in Aquatic Sciences. Work Experience Kisii University; AICAD; international aquatic-science research collaboration. Publications Peer-reviewed freshwater science, aquaculture, water-quality, and sustainability publications listed on the official profile. Research Grants Competitive aquatic-science and sustainability projects listed on the official profile. Skills Aquatic ecology; limnology; aquaculture systems; water-quality assessment; research leadership.",
        "https://digital.kisiiuniversity.ac.ke/storage/avatars/rysuM36EXKaVvbyJr8EIAhBJHzRTmcatut2YEjZs.jpg",
    ),
    _page(
        "/profile_view/gideon-o-mamboleo",
        "Dr. Gideon O. Mamboleo",
        "Lecturer",
        "Research Interests Science communication; narrative journalism; media and communication research. Education Background Bachelor's degree from the University of Nairobi; master's degree from Moi University; doctoral studies at Moi University. Work Experience Kisii University from January 2014. Publications Research on narrative journalism and communicating scientific and technological information to non-expert audiences is listed on the official profile. Research Grants No research grants stated. Skills Journalism; science communication; narrative research; media studies.",
        "https://digital.kisiiuniversity.ac.ke/storage/avatars/VoYc0pctAUgavcQfGTHCu7A3coyB1IjBJjPwFKbT.png",
    ),
    _page(
        "/profile_view/joshua-okemwa-nyangau",
        "Dr. Joshua Okemwa Nyang'au",
        "Lecturer",
        "Research Interests No research interests provided. Education Background Bachelor's degree from Makerere University; master's degree from Kisii University; doctoral degree from Kibabii University. Work Experience No work experience published. Publications No publications available. Research Grants No research grants. Skills No skills listed.",
        "https://digital.kisiiuniversity.ac.ke/storage/avatars/bE8prIuIqa3RUFqAwHeWRyYIJgAKxGNfCTZ5yOWz.jpg",
    ),
    _page(
        "/profile_view/wangari-catherine-waithera",
        "Catherine Wangari Waithera",
        "Lecturer",
        "Catherine Wangari Waithera is a computer-science educator and AI and robotics specialist with experience in machine learning, computer vision, software optimisation, workflow automation, curriculum design, mentoring, and research. Research Interests Computer vision and machine learning for image processing. Education Background Bachelor's degree from Jomo Kenyatta University of Agriculture and Technology; master's degree from Hosei University, Tokyo; doctoral studies at the University of Nairobi. Work Experience JKUAT; Hosei University; Kisii University from February 2023. Publications Machine-learning and computer-vision publications are listed on the official profile. Research Grants No research grants stated. Skills Artificial intelligence; robotics; computer vision; machine learning; software optimisation; workflow automation.",
        "https://digital.kisiiuniversity.ac.ke/storage/avatars/UpTvPpQfBINPQeIf7SM5P2VL7BwtpFGj9i7XZRVG.jpg",
    ),
]


__all__ = ["LIVE_STAFF_PROFILE_UPDATES"]
