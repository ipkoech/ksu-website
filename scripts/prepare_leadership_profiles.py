"""Prepare reviewed leadership facts and verify every linked official asset.

Requires requests and beautifulsoup4. Input HTML is saved from the official pages
under output/leadership-profiles; no placeholder identities or portraits are used.
"""
import json
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/leadership-profiles'
SITE = 'https://kisiiuniversity.ac.ke'
BOARD = SITE + '/university_management_board'
COUNCIL = SITE + '/about_adminstration'
COUNCIL_DETAIL = SITE + '/board_/kisii-university-council/board_members'
BOOKLET = SITE + '/storage/public/downloads/Kisii%20University%20Graduation%20Booklet%202025.pdf'


def q(degree, institution=None, field=None, year=None):
    return {k: v for k, v in dict(degree=degree, institution=institution, field=field, year=year).items() if v is not None}


# Professional summaries of the named biographies on the Management Board page.
MANAGEMENT = [
    ('vice_chancellor', 'Nathan Oyori Ogechi', 'officeModal1',
     'Nathan O. Ogechi has served as Vice Chancellor of Kisii University since 1 September 2023. A professor of African linguistics, he specialises in contact linguistics and linguistic human rights. His previous leadership responsibilities at Moi University included Deputy Vice Chancellor for Student Affairs, acting deputy vice chancellor appointments, school dean and department chair. He has also served on the Moi University Council and the Jomo Kenyatta Foundation board. His academic work includes teaching, research, external examination and language consultancy.',
     [q('PhD', 'University of Hamburg', 'African Linguistics'), q('MPhil', 'Moi University', 'Kiswahili Studies'), q('BEd', 'Moi University', 'Arts')]),
    ('dvc_arsa', 'Fredrick O. Wanyama', 'officeModal2',
     'Fredrick O. Wanyama is Deputy Vice Chancellor for Academic, Research and Student Affairs at Kisii University. His field is political science, with research interests in development politics and cooperatives. He previously held academic leadership positions at Murang’a University of Technology and Murang’a University College, and served as director and dean of the School of Development and Strategic Studies at Maseno University. His professional experience includes consultancy for the International Labour Organization and the World Bank. He is a Fulbright and DAAD scholar and a former fellow of the Five College African Scholars Program.',
     [q('PhD', 'Maseno University', 'Political Science', 2004), q('MA', 'University of Nairobi', 'Political Science', 1994), q('BA', 'University of Nairobi', 'Political Science', 1990)]),
    ('dvc_apf', 'Nathan Oyaro', 'officeModal3',
     'Nathan Oyaro is Deputy Vice Chancellor for Administration, Planning and Finance at Kisii University and a professor of atmospheric and environmental chemistry. His academic leadership experience includes serving as a school dean and director of research. His research covers atmospheric chemistry, environmental pollution, climate change, water quality, phytoremediation, renewable energy and sustainable environmental technologies. He has led research collaborations, secured research funding, reviewed scientific publications and mentored scientists. His professional affiliations include the Royal Society of Chemistry and the Society of Environmental Toxicology and Chemistry.',
     [q('DSc', 'University of Oslo', 'Physical Chemistry (Atmospheric Chemistry)'), q('MSc', 'Kenyatta University'), q('BSc', 'Kenyatta University')]),
    ('registrar_admin', 'Stella Omari', 'officeModal4',
     'Stella Omari has served as Acting Registrar for Administration, Human Resource and Central Services at Kisii University since 2024. Her responsibilities include staffing, training, performance management, employee welfare and central services. She is a senior lecturer in human resource management with experience in strategic management, governance, policy development and postgraduate supervision. She previously chaired the Department of Business Administration and coordinated Keroka Campus. Her work includes curriculum development and supervision of doctoral candidates. She is a member of the Institute of Human Resource Management, Kenya, and the Africa Academy of Management.',
     [q('PhD', 'University of Nairobi', 'Business Administration (Human Resource Management)', 2012), q('MA', 'Bharathidasan University', 'Social Dynamics', 1995), q('BA', 'Punjab University', year=1993), q('Postgraduate Diploma', field='Computer Applications', year=1995)]),
    ('registrar_academic', 'Kennedy Getange', 'officeModal5',
     'Kennedy Nyambeche Getange is Acting Registrar for Academic Affairs and Associate Professor of Planning and Economics of Education at Kisii University. A founding member of the School of Education, he previously chaired the Education Department and directed Academic Quality Assurance. His work in quality assurance supported the development and accreditation of 181 academic programmes. His research and consultancy address educational planning, financing, policy, quality assurance, management and education systems development.',
     [q('PhD', 'Kenyatta University', 'Education (Planning and Economics)'), q('MEd', 'Maseno University', 'Planning and Economics of Education'), q('BA', 'Andrews University', 'Education')]),
    ('finance_officer', 'Charles M. Mwangi', 'officeModal7',
     'Charles Maina Mwangi is Finance Officer at Kisii University. His professional experience spans financial management, accounting, budgeting, auditing and institutional leadership. He has led financial planning, statutory compliance, reporting, audit coordination and financial policy implementation in public institutions. He is a Certified Public Accountant, a Certified Public Secretary and a registered member of the Institute of Certified Public Accountants of Kenya.',
     [q('MBA', field='Finance'), q('Bachelor’s degree', field='Business and Management (Accounting)'), q('CPA-K'), q('CS')]),
]

COUNCILLORS = [
    ('council_chair', 'Sara Jerop Ruto', 'Sara', [q('PhD', 'University of Heidelberg'), q('MEd', 'Kenyatta University'), q('BEd', 'Kenyatta University')]),
    ('council_member_peter_mageto', 'Peter Mageto', 'Mageto', [q('PhD', 'Garrett Evangelical Seminary'), q('MA', 'Garrett Evangelical Seminary'), q('BA', 'St Pauls United Theological College', 'Divinity')]),
    ('council_member_scholastica_ndambuki', 'Scholastica Ndambuki', 'Ndambuki', [q('LLD', 'University of South Africa'), q('LLM', 'University of South Africa'), q('LLB', 'University of Nairobi')]),
    ('council_member_elizabeth_mwangi', 'Elizabeth Mwangi', 'Elizabeth', [q('MBA', 'Africa Nazarene University'), q('BA', 'Egerton University', 'Business Management')]),
    ('council_member_samson_muchelule', 'Samson Eric Muchelule', 'Muchelule', [q('MBA', 'University of Nairobi', 'Strategic Management'), q('Bachelor of Veterinary Medicine', 'University of Nairobi'), q('Diploma', field='Sales Management and Marketing')]),
    ('council_member_mwenda_makathimo', 'Mwenda Makathimo', 'Makathimo', [q('PhD', 'University of Nairobi', 'Environmental Policy'), q('MA', 'University of Nairobi', 'Valuation and Property Management'), q('BA', 'University of Nairobi', 'Land Economics')]),
    ('council_member_pamela_awuor_ochieng', 'Pamela Awuor Ochieng', 'Pamela', [q('PhD', 'Jomo Kenyatta University of Agriculture and Technology', 'Business Administration'), q('MBA', 'Kenyatta University', 'Strategic Management'), q('BEd', 'Kenyatta University', 'Arts (French, Education and Business Studies)')]),
    ('council_member_josphat_sawe', 'Josphat Sowe', 'Sowe', [q('MEd', 'University of Eastern Africa, Baraton', 'Administration'), q('BEd', 'Catholic University of Eastern Africa', 'Arts')]),
]


def main():
    management = BeautifulSoup((OUT / 'university_management_board.html').read_text(encoding='utf-8'), 'html.parser')
    council = BeautifulSoup((OUT / 'council.html').read_text(encoding='utf-8'), 'html.parser')
    records = []
    for key, name, modal_id, bio, qualifications in MANAGEMENT:
        modal = management.select_one('#' + modal_id)
        role = modal.select_one('p.text-muted').get_text(' ', strip=True)
        cv = modal.select_one('a[href*=".pdf"]')
        records.append(dict(key=key, full_name=name, source_url=BOARD + '#' + modal_id,
                            source_name=modal.select_one('.modal-title').get_text(' ', strip=True),
                            photo_url=urljoin(SITE, modal.select_one('img')['src']),
                            cv_url=cv['href'] if cv else None,
                            fields=dict(bio=role + '.', full_bio=bio, qualifications=qualifications,
                                        website_url=BOARD + '#' + modal_id),
                            sources=[BOARD, COUNCIL_DETAIL] if key == 'vice_chancellor' else [BOARD]))
    for key, name, token, qualifications in COUNCILLORS:
        cards = [c for c in council.select('.board-wrap .card') if token in c.select_one('h4').get_text()]
        assert len(cards) == 1, name
        card = cards[0]
        role = card.select_one('p').get_text(' ', strip=True)
        records.append(dict(key=key, full_name=name, source_url=COUNCIL,
                            source_name=card.select_one('h4').get_text(' ', strip=True),
                            photo_url=urljoin(SITE, card.select_one('img')['src']), cv_url=None,
                            fields=dict(bio=role + '.', qualifications=qualifications, website_url=COUNCIL),
                            sources=[COUNCIL, COUNCIL_DETAIL, BOOKLET]))
    urls = sorted({r[k] for r in records for k in ['photo_url', 'cv_url'] if r[k]})
    def check(url):
        with requests.get(url, timeout=35, stream=True) as response:
            response.raise_for_status()
            content_type = response.headers.get('Content-Type', '')
            assert content_type.startswith('image/') or 'pdf' in content_type, (url, content_type)
            return dict(url=url, status=response.status_code, content_type=content_type)
    with ThreadPoolExecutor(max_workers=5) as pool:
        verified = list(pool.map(check, urls))
    fixture = dict(verified_on='2026-09-08', profiles=records,
                   unresolved=[dict(role='Registrar (REIRM)', reason='The management page publishes no name or biography.', source_url=BOARD)])
    path = ROOT / 'services/main/app/seeders/leadership_profiles_20260908.json'
    path.write_text(json.dumps(fixture, ensure_ascii=False, indent=2), encoding='utf-8')
    (OUT / 'assets-verified.json').write_text(json.dumps(verified, indent=2))
    print(f'{len(records)} profiles; {len(verified)} verified official assets; {path}')


if __name__ == '__main__':
    main()
