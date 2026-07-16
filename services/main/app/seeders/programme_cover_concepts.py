"""Editorial image concepts for programme-specific public cover artwork."""

from __future__ import annotations

from dataclasses import dataclass

from app.schemas.base import slugify


@dataclass(frozen=True, slots=True)
class ProgrammeCoverConcept:
    programme_name: str
    department_code: str
    visual_family: str
    subject: str
    alt_text: str

    @property
    def slug(self) -> str:
        return slugify(self.programme_name)

    @property
    def filename(self) -> str:
        return f"{self.slug}.webp"


def _concept(
    programme_name: str,
    department_code: str,
    visual_family: str,
    subject: str,
    alt_text: str,
) -> ProgrammeCoverConcept:
    return ProgrammeCoverConcept(
        programme_name=programme_name,
        department_code=department_code,
        visual_family=visual_family,
        subject=subject,
        alt_text=alt_text,
    )


ICT_PROGRAMME_COVER_CONCEPTS: tuple[ProgrammeCoverConcept, ...] = (
    _concept("PhD in Information Systems", "CS", "information systems", "a layered enterprise data network connecting databases, cloud services, analytics panels, and governance nodes", "Illustration of an interconnected enterprise information system"),
    _concept("Master of Information Systems", "CS", "information systems", "a central database connected to cloud services, business applications, and a structured decision dashboard", "Illustration of a database connecting business applications and cloud services"),
    _concept("Bachelor of Science in Applied Computer Science", "CS", "computer science", "a laptop with code blocks connected to a sensor, a small robot arm, and practical data-processing modules", "Illustration of computing code applied to sensors and automation"),
    _concept("Bachelor of Science in Computer Science", "CS", "computer science", "a computer processor framed by binary pathways, an algorithm flow, and connected data nodes", "Illustration of a processor, algorithms, and connected data nodes"),
    _concept("Bachelor of Science in Software Engineering", "CS", "software engineering", "modular software blocks moving through design, testing, version control, and deployment stages", "Illustration of a structured software design and deployment workflow"),
    _concept("Bachelor of Science in Information Technology", "CS", "information technology", "a laptop connected to a secure server, cloud platform, network router, and support tools", "Illustration of connected information technology infrastructure"),
    _concept("Diploma in Information Technology", "CS", "information technology", "a workstation connected to a server rack, network switch, cloud service, and maintenance tools", "Illustration of practical information technology systems and support tools"),
    _concept("Diploma in Computer Science", "CS", "computer science", "a laptop displaying a simple algorithm flow beside a processor, database cylinder, and programming brackets", "Illustration of foundational programming, algorithms, and computer systems"),
    _concept("Certificate in Information Technology", "CS", "information technology", "a desktop workstation with a network router, cloud connection, shield, and basic troubleshooting tools", "Illustration of foundational information technology and user support"),
    _concept("PhD in Information Science", "COMLIS", "information science", "a research knowledge graph linking archives, digital records, scholarly documents, and discovery pathways", "Illustration of a research knowledge graph connecting archives and digital information"),
    _concept("PhD in Knowledge Management", "COMLIS", "knowledge management", "an advanced knowledge network transforming documents and expert insights into an organized institutional memory", "Illustration of institutional knowledge being organized into a connected network"),
    _concept("PhD in Media and Communication Studies", "COMLIS", "media and communication", "a research lens examining broadcast waves, digital media channels, audience networks, and public discourse", "Illustration of research across media channels and audience networks"),
    _concept("Master of Information Science", "COMLIS", "information science", "a digital catalogue linking books, archival boxes, metadata records, and a search interface", "Illustration of a digital catalogue connecting books, archives, and metadata"),
    _concept("Master of Knowledge Management", "COMLIS", "knowledge management", "documents, team insights, and data flowing into a structured knowledge repository with connected categories", "Illustration of organizational knowledge flowing into a structured repository"),
    _concept("Master of Journalism", "COMLIS", "journalism", "a reporter notebook, microphone, camera, and verified news document arranged around a public-interest story", "Illustration of journalism tools surrounding a verified news story"),
    _concept("Master of Communication Studies", "COMLIS", "media and communication", "interconnected speech forms, audience groups, broadcast signals, and a strategic communication plan", "Illustration of strategic messages connecting media channels and audiences"),
    _concept("Bachelor of Information Science", "COMLIS", "information science", "an open book transitioning into searchable digital records, metadata tags, and an organized archive", "Illustration of books and archives becoming searchable digital information"),
    _concept("Bachelor of Arts (Communication and Media)", "COMLIS", "media and communication", "a camera, microphone, mobile screen, and broadcast waves composing one balanced multimedia story", "Illustration of camera, audio, mobile, and broadcast media storytelling"),
    _concept("Diploma in Library and Information Science", "COMLIS", "library science", "organized bookshelves connected to a digital catalogue, archive box, barcode, and search symbol", "Illustration of library collections connected to a digital catalogue"),
    _concept("Diploma in Journalism and Mass Communication", "COMLIS", "journalism", "a microphone, camera, newspaper layout, and broadcast signal arranged as a practical newsroom toolkit", "Illustration of a practical newsroom and mass communication toolkit"),
    _concept("Certificate in Library and Information Science", "COMLIS", "library science", "an open book beside a labelled archive box, catalogue cards, and a simple search interface", "Illustration of foundational library organization and information search"),
    _concept("Certificate in Journalism and Mass Communication", "COMLIS", "journalism", "a microphone, compact camera, notebook, and radio waves forming an introductory reporting toolkit", "Illustration of foundational reporting and mass communication tools"),
)


def ict_programme_slugs() -> set[str]:
    return {concept.slug for concept in ICT_PROGRAMME_COVER_CONCEPTS}


def imagegen_prompt(concept: ProgrammeCoverConcept) -> str:
    return f"""Use case: illustration-story
Asset type: programme hero illustration for a public university website
Primary request: Create a programme-specific editorial illustration for {concept.programme_name}.
Subject: {concept.subject}.
Style/medium: refined institutional vector-like line illustration with precise geometry and restrained flat supporting forms.
Composition/framing: centered 16:9 landscape composition with generous clear space, designed for the right panel of a university programme hero.
Color palette: deep royal-blue linework, pale-blue supporting forms, white or near-white background, and one restrained gold accent.
Constraints: communicate the academic discipline immediately; keep line weight and visual density consistent with a university-wide illustration family; crisp edges; accessible contrast.
Avoid: No text, no letters, no numbers, no logos, no university crest, no people, no faces, no photorealism, no dark background, no watermark, no decorative clutter."""

