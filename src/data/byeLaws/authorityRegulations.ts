// Level 4: Local Authority Building Norms & Statutory Overlays (26 Authorities & Overlays)

import type { ByeLawRule, RegulationDocument } from './types';

export const AUTHORITY_REGULATION_DOCUMENTS: RegulationDocument[] = [
  {
    "id": "DOC-AUTH-DDA-SANCTION",
    "title": "DDA Building Sanction, Completion & Layout Scrutiny Guidelines",
    "shortTitle": "DDA Sanction Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Delhi (NCT)",
      "city": "Delhi",
      "authority": "Delhi Development Authority"
    },
    "documentType": "guideline",
    "documentPriority": "primary",
    "year": "2020",
    "version": "DDA Sanction Manual 2020 (Amended 2023)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Delhi Development Authority (DDA)",
      "officialUrl": "https://dda.gov.in",
      "documentUrl": "https://dda.gov.in/building-sanction-procedures",
      "documentType": "Portal",
      "publishedDate": "2020-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs statutory sanction procedures, layout scrutiny, compoundable deviations, and completion/occupancy certification across all DDA development areas.",
    "keyProvisions": [
      "Online single-window building plan scrutiny with automated drawing validator",
      "Procedures for issuing Commencement Certificate and Completion-cum-Occupancy Certificate (CC/OC)",
      "Strict compoundable vs non-compoundable deviation limits (maximum 5% within setbacks)",
      "Mandatory structural engineer and supervisor peer review affidavits"
    ]
  },
  {
    "id": "DOC-AUTH-MCD-OBPAS",
    "title": "MCD Online Building Plan Approval System (OBPAS) & SARAL Scheme",
    "shortTitle": "MCD OBPAS / SARAL Scheme",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Delhi (NCT)",
      "city": "Delhi",
      "authority": "Municipal Corporation of Delhi"
    },
    "documentType": "guideline",
    "documentPriority": "primary",
    "year": "2021",
    "version": "MCD OBPAS 2.0 (Amended 2023)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate"
    ],
    "source": {
      "authority": "Municipal Corporation of Delhi (MCD)",
      "officialUrl": "https://mcdonline.nic.in",
      "documentType": "Portal",
      "publishedDate": "2021-06-10",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Fast-track risk-based automated building approval scheme for residential plots up to 500 sq.m across all 12 MCD administrative zones.",
    "keyProvisions": [
      "SARAL Scheme: Instant online deemed sanction for individual residential plots <= 105 sq.m based on registered architect self-certification",
      "Plots 105 to 500 sq.m: Automated common application form approval within 15 working days",
      "Risk-based inspection framework: Pre-construction, plinth level, and final occupancy inspections",
      "Integration with Delhi Jal Board (DJB), Delhi Fire Services (DFS), and Tata Power / BSES power discoms"
    ]
  },
  {
    "id": "DOC-AUTH-NDMC-LBZ",
    "title": "NDMC Lutyens Bungalow Zone (LBZ) Guidelines & Heritage Regulations",
    "shortTitle": "NDMC LBZ Guidelines",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Delhi (NCT)",
      "city": "New Delhi",
      "authority": "New Delhi Municipal Council & DUAC"
    },
    "documentType": "special_overlay",
    "documentPriority": "primary",
    "year": "2022",
    "version": "LBZ Guidelines (Sanctioned 2022)",
    "status": "verified",
    "categories": [
      "special_restriction",
      "far_fsi",
      "ground_coverage",
      "height_floors",
      "setbacks"
    ],
    "source": {
      "authority": "New Delhi Municipal Council (NDMC) & Delhi Urban Art Commission (DUAC)",
      "officialUrl": "https://online.ndmc.gov.in",
      "documentUrl": "https://duac.org.in",
      "documentType": "Gazette",
      "publishedDate": "2022-03-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Special heritage conservation guidelines strictly preserving the low-density garden city character and tree canopy of the Lutyens Bungalow Zone in New Delhi.",
    "keyProvisions": [
      "Maximum Floor Area Ratio (FAR) strictly capped at 0.20 (20%) of plot area",
      "Maximum ground coverage limited to 12% to 20% depending on plot size",
      "Building height strictly capped at single or double storey (maximum 12 meters to ridge line)",
      "Zero felling of mature heritage trees; mandatory DUAC (Delhi Urban Art Commission) aesthetic clearance"
    ]
  },
  {
    "id": "DOC-AUTH-GMDA-INFRA",
    "title": "GMDA Infrastructure Access, Water Supply & Master Drainage Regulations",
    "shortTitle": "GMDA Infrastructure Regulations",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Haryana",
      "city": "Gurugram",
      "authority": "Gurugram Metropolitan Development Authority"
    },
    "documentType": "special_overlay",
    "documentPriority": "primary",
    "year": "2020",
    "version": "GMDA Act & Regulations 2020",
    "status": "verified",
    "categories": [
      "water_supply",
      "sewage_drainage",
      "approvals_sanctions",
      "special_restriction"
    ],
    "source": {
      "authority": "Gurugram Metropolitan Development Authority (GMDA)",
      "officialUrl": "https://gmda.gov.in",
      "documentType": "Portal",
      "publishedDate": "2020-08-20",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Regulates trunk infrastructure connectivity, access permissions from master sector roads, master stormwater drain protection, and recycled water supply in Gurugram.",
    "keyProvisions": [
      "Mandatory GMDA Right of Way (RoW) Access Permission for any entry/exit on 60m+ master roads",
      "Prohibition of discharge of untreated sewage into master stormwater drains (Najafgarh / Leg I / Leg II / Leg III)",
      "Mandatory dual plumbing network connection to receive GMDA tertiary treated STP water for flushing and horticulture",
      "Installation of smart bulk water ultrasonic flow meters connected to GMDA Integrated Command and Control Centre (ICCC)"
    ]
  },
  {
    "id": "DOC-AUTH-HSVP-ZONING",
    "title": "HSVP (HUDA) Architectural Control and Sector Zoning Plans",
    "shortTitle": "HSVP Architectural Control",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Haryana",
      "city": "Gurugram",
      "authority": "Haryana Shehri Vikas Pradhikaran"
    },
    "documentType": "guideline",
    "documentPriority": "primary",
    "year": "2021",
    "version": "HSVP Zoning Manual (Amended 2023)",
    "status": "verified",
    "categories": [
      "setbacks",
      "height_floors",
      "ground_coverage",
      "stilt_parking"
    ],
    "source": {
      "authority": "Haryana Shehri Vikas Pradhikaran (HSVP)",
      "officialUrl": "https://hsvp.org.in",
      "documentType": "Portal",
      "publishedDate": "2021-04-12",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs plot-level zoning boundaries, common dividing party walls, standard boundary wall designs, and Stilt + 4 floor construction across all HSVP urban estates.",
    "keyProvisions": [
      "Standardized sector zoning sheets defining non-negotiable front and rear building setback lines",
      "Mutual party-wall construction rules and mandatory structural indemnity bond for adjacent property protection",
      "Maximum permissible plinth level height: 1.0m above crown of road",
      "Standard front boundary wall design (0.9m solid brick + 0.9m decorative steel railing)"
    ]
  },
  {
    "id": "DOC-AUTH-MCGM-AUTODCR",
    "title": "MCGM (BMC) AutoDCR Building Proposal Scrutiny & Fire Scrutiny Guidelines",
    "shortTitle": "MCGM AutoDCR Guidelines",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Mumbai",
      "authority": "Municipal Corporation of Greater Mumbai"
    },
    "documentType": "guideline",
    "documentPriority": "primary",
    "year": "2022",
    "version": "AutoDCR 2.0 (Amended 2024)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "fire_safety",
      "far_fsi"
    ],
    "source": {
      "authority": "Building Proposal Department, Municipal Corporation of Greater Mumbai (MCGM)",
      "officialUrl": "https://autodcr.mcgm.gov.in",
      "documentType": "Portal",
      "publishedDate": "2022-01-10",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs online CAD drawing scrutiny, Intimation of Disapproval (IOD), Commencement Certificate (CC), and CFO Fire NOC procedures in Greater Mumbai.",
    "keyProvisions": [
      "Automated verification of FSI/Fungible FSI calculations, premium payments, and road widening reservations",
      "Mandatory High-Rise Committee (HRC) scrutiny for building proposals exceeding 70 meters in height",
      "CFO Fire Safety NOC mandatory for buildings taller than 32 meters",
      "Standard procedures for issuing IOD, Plinth CC, Full CC, and Occupation Certificate (OC)"
    ]
  },
  {
    "id": "DOC-AUTH-MMRDA-SPA",
    "title": "MMRDA Special Planning Authority (SPA) Regulations (BKC, Wadala, Owe)",
    "shortTitle": "MMRDA SPA Regulations",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Mumbai",
      "authority": "Mumbai Metropolitan Region Development Authority"
    },
    "documentType": "special_overlay",
    "documentPriority": "primary",
    "year": "2021",
    "version": "Amended 2023",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "height_floors",
      "parking",
      "special_restriction"
    ],
    "source": {
      "authority": "Mumbai Metropolitan Region Development Authority (MMRDA)",
      "officialUrl": "https://mmrda.maharashtra.gov.in",
      "documentType": "Portal",
      "publishedDate": "2021-07-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Special planning regulations governing the Bandra-Kurla Complex (BKC) International Financial Centre, Wadala Notified Area, and MMRDA growth nodes.",
    "keyProvisions": [
      "Bandra-Kurla Complex (BKC): High-density commercial FSI up to 4.0 with mandatory skywalk and underground concourse integration",
      "Mandatory podium parking and district cooling system provision for commercial towers",
      "Zero surface stormwater discharge; on-site detention tanks mandatory",
      "Direct approval from Metropolitan Commissioner, MMRDA"
    ]
  },
  {
    "id": "DOC-AUTH-SRA-MAHA",
    "title": "Slum Rehabilitation Authority (SRA) Mumbai Regulations (Regulation 33(10))",
    "shortTitle": "SRA Mumbai Regulations",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Mumbai",
      "authority": "Slum Rehabilitation Authority"
    },
    "documentType": "special_overlay",
    "documentPriority": "primary",
    "year": "2020",
    "version": "DCPR 33(10) / SRA 2020",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Slum Rehabilitation Authority (SRA), Government of Maharashtra",
      "officialUrl": "https://sra.gov.in",
      "documentType": "Portal",
      "publishedDate": "2020-03-12",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs in-situ rehabilitation of slum dwellers with incentive sale FSI up to 3.0 to 4.0 in Greater Mumbai.",
    "keyProvisions": [
      "Incentive Sale Component FSI generated based on rehabilitation built-up area ratio (1:1 in City, 1:1.25 in Suburbs)",
      "Minimum carpet area of 300 sq.ft (27.88 sq.m) for each eligible slum rehabilitation tenement free of cost",
      "Relaxed internal open space and density norms for composite rehab-cum-sale high-rise towers",
      "Single-window SRA CEO sanction and fast-track transit camp clearance"
    ]
  },
  {
    "id": "DOC-AUTH-BBMP-BYELAWS",
    "title": "Bruhat Bengaluru Mahanagara Palike (BBMP) Building Byelaws & Scrutiny Guidelines",
    "shortTitle": "BBMP Building Sanction Guidelines",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Karnataka",
      "city": "Bengaluru",
      "authority": "Bruhat Bengaluru Mahanagara Palike"
    },
    "documentType": "guideline",
    "documentPriority": "primary",
    "year": "2020",
    "version": "BBMP Byelaws (Amended 2022)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "setbacks",
      "rainwater_harvesting"
    ],
    "source": {
      "authority": "Bruhat Bengaluru Mahanagara Palike (BBMP)",
      "officialUrl": "https://bbmp.gov.in",
      "documentType": "Portal",
      "publishedDate": "2020-05-18",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Regulates plan sanctions, khata verification (A-Khata / B-Khata), building line setbacks, and Occupancy Certificates across Bengaluru's 8 zones.",
    "keyProvisions": [
      "Mandatory 'A-Khata' property tax register extract and BDA layout plan compliance for standard plan approval",
      "Mandatory 2.0m to 3.0m peripheral setback for independent residential homes",
      "Compulsory rainwater harvesting (RWH) percolation pit inspection prior to issuing OC",
      "Online plan submission through BBMP Citizen / Architect portal with digital drawing scrutiny"
    ]
  },
  {
    "id": "DOC-AUTH-BDA-LAYOUT",
    "title": "Bangalore Development Authority (BDA) Layout & Sub-division Regulations",
    "shortTitle": "BDA Layout Regulations",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Karnataka",
      "city": "Bengaluru",
      "authority": "Bangalore Development Authority"
    },
    "documentType": "guideline",
    "documentPriority": "primary",
    "year": "2020",
    "version": "Amended 2022",
    "status": "verified",
    "categories": [
      "zoning",
      "amenity_space",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Bangalore Development Authority (BDA)",
      "officialUrl": "https://bdabangalore.org",
      "documentType": "Portal",
      "publishedDate": "2020-11-20",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs layout development approval, private residential layout sub-divisions, and civic amenity (CA) site relinquishment in Bengaluru.",
    "keyProvisions": [
      "Mandatory 15% open space (Parks & Open spaces) + 5% Civic Amenity (CA) land relinquished to BDA free of cost",
      "Minimum road width of 12.0m inside residential layout sub-divisions (9.0m for cul-de-sacs < 100m)",
      "Mandatory BDA NOC before BBMP plan sanction for properties in approved development schemes",
      "Clear demarcation of Rajakaluve drain buffer corridors"
    ]
  },
  {
    "id": "DOC-AUTH-GHMC-SANCTION",
    "title": "Greater Hyderabad Municipal Corporation (GHMC) Building Sanction Norms",
    "shortTitle": "GHMC Building Sanction Norms",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Telangana",
      "city": "Hyderabad",
      "authority": "Greater Hyderabad Municipal Corporation"
    },
    "documentType": "guideline",
    "documentPriority": "primary",
    "year": "2021",
    "version": "Amended 2023",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "setbacks",
      "parking"
    ],
    "source": {
      "authority": "Greater Hyderabad Municipal Corporation (GHMC)",
      "officialUrl": "https://www.ghmc.gov.in",
      "documentType": "Portal",
      "publishedDate": "2021-08-14",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs building plan sanctions, road widening land surrenders, and compound wall alignments across Hyderabad municipal circles.",
    "keyProvisions": [
      "Mandatory free surrender of affected land for Master Plan road widening in exchange for TDR certificate",
      "Mandatory 10% built-up area mortgage to GHMC as security against deviation during construction",
      "Compulsory rainwater harvesting injection wells for all plot sizes > 200 sq.m",
      "Online TG-bPASS scrutiny with integrated structural stability certification"
    ]
  },
  {
    "id": "DOC-AUTH-CMDA-PP",
    "title": "Chennai Metropolitan Development Authority (CMDA) Planning Permission Rules",
    "shortTitle": "CMDA Planning Permission Rules",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Tamil Nadu",
      "city": "Chennai",
      "authority": "Chennai Metropolitan Development Authority"
    },
    "documentType": "guideline",
    "documentPriority": "primary",
    "year": "2021",
    "version": "Amended 2023",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "fire_safety",
      "far_fsi"
    ],
    "source": {
      "authority": "Chennai Metropolitan Development Authority (CMDA)",
      "officialUrl": "https://cmdachennai.gov.in",
      "documentType": "Portal",
      "publishedDate": "2021-09-30",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs Planning Permission (PP), Multi-Storey Building (MSB) scrutiny panel reviews, and Completion Certificate inspections in Chennai.",
    "keyProvisions": [
      "Multi-Storey Building (MSB) Panel scrutiny mandatory for all buildings exceeding 18.3 meters in height",
      "Mandatory gift deed execution for 10% OSR and road widening stretches prior to PP issue",
      "Completion Certificate (CC) mandatory for obtaining permanent electricity and water supply connections",
      "Online single-window portal with GIS cadastral map verification"
    ]
  },
  {
    "id": "DOC-AUTH-JDA-BYELAWS",
    "title": "Jaipur Development Authority (JDA) Building Byelaws 2020 & Scheme Area Regulations",
    "shortTitle": "JDA Building Byelaws 2020",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Rajasthan",
      "city": "Jaipur",
      "authority": "Jaipur Development Authority"
    },
    "documentType": "guideline",
    "documentPriority": "primary",
    "year": "2020",
    "version": "JDA Byelaws 2020 (Amended 2023)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "far_fsi",
      "setbacks",
      "height_floors"
    ],
    "source": {
      "authority": "Jaipur Development Authority (JDA)",
      "officialUrl": "https://jda.urban.rajasthan.gov.in",
      "documentType": "Portal",
      "publishedDate": "2020-06-25",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs building sanctions, betterment charges, corner plot splays, and leasehold/freehold regularizations in JDA approved schemes.",
    "keyProvisions": [
      "Mandatory 3.0m x 3.0m corner splay on all corner plot intersections for traffic sightlines",
      "Standard residential plotted height limited to 15.0m on roads up to 12m; up to 18m on roads >= 18m",
      "Betterment FAR deposit procedure for purchasing additional built-up area",
      "Online plan sanction via JDA Single Window Citizen Service Portal"
    ]
  },
  {
    "id": "DOC-AUTH-NOIDA-REG-2010",
    "title": "NOIDA Building Regulations 2010 (Amended up to 2023)",
    "shortTitle": "NOIDA Building Regulations 2010",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Noida",
      "authority": "New Okhla Industrial Development Authority"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2010",
    "version": "Amended up to 2023",
    "status": "verified",
    "categories": [
      "ground_coverage",
      "far_fsi",
      "setbacks",
      "height_floors",
      "parking"
    ],
    "source": {
      "authority": "New Okhla Industrial Development Authority (NOIDA)",
      "officialUrl": "https://noidaauthorityonline.in",
      "documentType": "Gazette",
      "publishedDate": "2010-11-30",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Prescribes detailed building construction regulations, structural design norms, and occupancy criteria for all sectors in NOIDA.",
    "keyProvisions": [
      "Clause 24.1: Residential plotted ground coverage capped at 60% to 75% with maximum height 15.0m",
      "Clause 25.1: Group Housing developments require minimum 24m access road and 15% green area on ground",
      "Mandatory basement parking with 6.0m two-way ramps and mechanical ventilation",
      "Strict structural audit and third-party IIT/NIT peer review for high-rise buildings > 45m"
    ]
  },
  {
    "id": "DOC-AUTH-GNIDA-REG",
    "title": "Greater Noida Building Regulations 2010 (Amended 2023)",
    "shortTitle": "Greater Noida Building Regulations",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Greater Noida",
      "authority": "Greater Noida Industrial Development Authority"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2010",
    "version": "Amended 2023",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "height_floors",
      "setbacks"
    ],
    "source": {
      "authority": "Greater Noida Industrial Development Authority (GNIDA)",
      "officialUrl": "https://www.greaternoidaauthority.in",
      "documentType": "Gazette",
      "publishedDate": "2010-12-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Regulates construction standards for tech zones, knowledge parks, and residential group housing in Greater Noida.",
    "keyProvisions": [
      "Regulation 18.2: Institutional IT Park ground coverage capped at 30% with FAR 1.50 to 2.00",
      "Regulation 22: Group Housing high-rise towers must provide 6.0m clear peripheral fire access driveway",
      "Mandatory dual plumbing network and STP for all multi-dwelling developments",
      "Single-window online building plan approval and completion certificate module"
    ]
  },
  {
    "id": "DOC-AUTH-YEIDA-REG",
    "title": "YEIDA Building Regulations & Industrial Sanction Guidelines",
    "shortTitle": "YEIDA Building Regulations",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Greater Noida",
      "authority": "Yamuna Expressway Industrial Development Authority"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2015",
    "version": "Amended 2023",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "height_floors",
      "special_restriction"
    ],
    "source": {
      "authority": "Yamuna Expressway Industrial Development Authority (YEIDA)",
      "officialUrl": "https://yamunaexpresswayauthority.com",
      "documentType": "Gazette",
      "publishedDate": "2015-06-18",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs industrial, logistics, institutional, and mixed-use building permissions along the Yamuna Expressway.",
    "keyProvisions": [
      "Clause 9.3: Industrial plots ground coverage up to 60% with FAR 1.50",
      "Mandatory AAI CCZM clearance for all sectors in the Jewar Airport aerodrome vicinity",
      "Compulsory on-site solar rooftop installation for all industrial and institutional plots",
      "Zero surface effluent discharge and integrated stormwater recharge pits"
    ]
  },
  {
    "id": "DOC-OVERLAY-AAI-CCZM",
    "title": "Airports Authority of India (AAI) Colour Coded Zoning Map (CCZM) Height NOC",
    "shortTitle": "AAI CCZM Height Clearance",
    "level": 4,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "special_overlay",
    "documentPriority": "primary",
    "year": "2020",
    "version": "AAI NOCAS II Guidelines 2020",
    "status": "verified",
    "categories": [
      "height_floors",
      "special_restriction",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Airports Authority of India (AAI) / Ministry of Civil Aviation",
      "officialUrl": "https://nocas2.aai.aero",
      "documentType": "Portal",
      "publishedDate": "2020-04-01",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Mandatory aerodrome safeguarding clearance restricting building top elevation based on GIS Colour Coded Zoning Maps (CCZM).",
    "keyProvisions": [
      "All building proposals within 20km radius of civil or defense aerodromes must verify top elevation (AMSL)",
      "If proposed top elevation is below the CCZM grid limit, local municipal authority can sanction without separate AAI NOC",
      "If proposed height breaches CCZM ceiling, formal online NOCAS II application and aeronautical study required",
      "Mandatory red aviation obstruction warning lights for buildings exceeding 45m height"
    ]
  },
  {
    "id": "DOC-OVERLAY-NHAI-ACCESS",
    "title": "NHAI Guidelines for Access Permission & Setbacks along National Highways",
    "shortTitle": "NHAI Access & Setback Guidelines",
    "level": 4,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "special_overlay",
    "documentPriority": "primary",
    "year": "2020",
    "version": "MoRTH Circular RW/NH-33044 (Amended 2022)",
    "status": "verified",
    "categories": [
      "setbacks",
      "special_restriction",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "National Highways Authority of India (NHAI) / MoRTH",
      "officialUrl": "https://nhai.gov.in",
      "documentType": "Portal",
      "publishedDate": "2020-07-24",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs statutory setbacks, building control lines, and entry/exit service road access permissions along all National Highways.",
    "keyProvisions": [
      "Building Line Setback: Minimum 5.0m to 15.0m setback from the statutory National Highway Right of Way (RoW)",
      "Control Line Setback: Minimum 10.0m to 25.0m setback where no permanent industrial or assembly structure is allowed",
      "Mandatory formal Access Permission NOC from NHAI Regional Office before commercial entry/exit is constructed",
      "Direct vehicular access onto highway main carriageway strictly prohibited; entry permitted only via dedicated service lanes"
    ]
  },
  {
    "id": "DOC-OVERLAY-RAILWAY-30M",
    "title": "Ministry of Railways 30m Track Safety Buffer & Metro Zone NOC",
    "shortTitle": "Railway 30m Safety Buffer NOC",
    "level": 4,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "special_overlay",
    "documentPriority": "primary",
    "year": "2021",
    "version": "Railway Board Circular 2021/CE-I/CT/14",
    "status": "verified",
    "categories": [
      "setbacks",
      "special_restriction",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Ministry of Railways & Metro Rail Corporations",
      "officialUrl": "https://indianrailways.gov.in",
      "documentType": "Portal",
      "publishedDate": "2021-05-12",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Mandatory structural safety NOC and excavation setback for any building construction within 30 meters of railway or metro rail tracks.",
    "keyProvisions": [
      "Plots situated within 30 meters from railway land boundary require prior NOC from the Divisional Railway Manager (DRM)",
      "Deep basement excavation adjacent to operational metro lines requires structural vibration study and diaphragm wall monitoring",
      "No permanent building foundation allowed within 3.0m of railway boundary wall",
      "Crane boom swing over operational railway tracks is strictly prohibited"
    ]
  },
  {
    "id": "DOC-OVERLAY-ASI-NMA",
    "title": "ASI & National Monuments Authority Prohibited (100m) and Regulated (200m) Buffers",
    "shortTitle": "ASI / NMA Heritage Clearance",
    "level": 4,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "special_overlay",
    "documentPriority": "primary",
    "year": "2020",
    "version": "SMARAC Guidelines 2020",
    "status": "verified",
    "categories": [
      "special_restriction",
      "height_floors",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Archaeological Survey of India (ASI) & National Monuments Authority (NMA)",
      "officialUrl": "https://nma.gov.in",
      "documentType": "Portal",
      "publishedDate": "2020-02-18",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statutory heritage clearance enforcing absolute prohibition of construction within 100m and strict height regulation within 300m of Centrally Protected Monuments.",
    "keyProvisions": [
      "0m to 100m from monument boundary: Prohibited area, zero new construction permitted under Section 20A of AMASR Act",
      "100m to 300m from monument boundary: Regulated area requiring prior online NOC from NMA via SMARAC portal",
      "Maximum permissible building height in regulated zone determined by monument-specific heritage bye-laws",
      "Unauthorized construction in prohibited zone attracts demolition and criminal prosecution under central act"
    ]
  },
  {
    "id": "DOC-OVERLAY-NGT-BUFFER",
    "title": "National Green Tribunal (NGT) & CPCB Buffer Zones for Lakes, Rivers & Drains",
    "shortTitle": "NGT Environmental Buffer Norms",
    "level": 4,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "special_overlay",
    "documentPriority": "primary",
    "year": "2019",
    "version": "NGT Order in OA No. 222/2014 & OA No. 673/2018",
    "status": "verified",
    "categories": [
      "environmental_regulations",
      "setbacks",
      "special_restriction"
    ],
    "source": {
      "authority": "National Green Tribunal (NGT) & CPCB",
      "officialUrl": "https://greentribunal.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2019-03-05",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statutory non-construction ecological buffer corridors around lakes, rivers, floodplains, and stormwater drains across all Indian cities.",
    "keyProvisions": [
      "Lakes and Water Bodies: Mandatory 75-meter buffer from full tank level (FTL) / lake boundary (or state specific buffer if higher)",
      "Primary Natural Drains (Rajakaluve / Nallah): Mandatory 50-meter non-construction green buffer on both banks",
      "Secondary Natural Drains: Mandatory 25-meter buffer; Tertiary Drains: Mandatory 15-meter buffer",
      "Absolute prohibition on dumping C&D waste, concrete paving, or laying sewer pipes inside designated buffers"
    ]
  },
  {
    "id": "DOC-OVERLAY-CRZ-COASTAL",
    "title": "Coastal Zone Management Authority (CRZ Clearance - MCZMA / TNCZMA / GCZMA)",
    "shortTitle": "Coastal Zone Management Clearance",
    "level": 4,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "special_overlay",
    "documentPriority": "primary",
    "year": "2019",
    "version": "CRZ Notification 2019 Guidelines",
    "status": "verified",
    "categories": [
      "environmental_regulations",
      "special_restriction",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "State Coastal Zone Management Authorities (SCZMA) & MoEFCC",
      "officialUrl": "https://mczma.gov.in",
      "documentType": "Portal",
      "publishedDate": "2019-05-20",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Mandatory statutory clearance for all properties situated within 500m of coastal high tide line or 100m of tidal creeks/backwaters.",
    "keyProvisions": [
      "Mandatory CRZ recommendation from State Coastal Zone Management Authority before local municipal plan sanction",
      "No construction permitted in CRZ-I (ecologically sensitive mangrove/sand dune areas)",
      "CRZ-II urban developments permitted only on the landward side of existing authorized structures or approved roads",
      "FSI and height restricted strictly to the sanctioned development control rules in force"
    ]
  },
  {
    "id": "DOC-OVERLAY-CEA-HTLINE",
    "title": "Central Electricity Authority High Tension (HT) Line Clearance & Corridor Buffers",
    "shortTitle": "CEA High Voltage Corridor Buffer",
    "level": 4,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "special_overlay",
    "documentPriority": "primary",
    "year": "2020",
    "version": "CEA Electrical Safety Regulations 2020",
    "status": "verified",
    "categories": [
      "electrical",
      "setbacks",
      "special_restriction"
    ],
    "source": {
      "authority": "Central Electricity Authority (CEA) & State Transmission Utilities",
      "officialUrl": "https://cea.nic.in",
      "documentType": "Portal",
      "publishedDate": "2020-06-18",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Safety buffer distances and right-of-way building restrictions under and adjacent to high-voltage (11kV, 33kV, 66kV, 132kV, 220kV, 400kV) power lines.",
    "keyProvisions": [
      "11 kV & 33 kV Overhead Lines: Minimum 3.7m vertical clearance and 1.2m to 2.0m horizontal clearance from nearest building part",
      "66 kV to 220 kV Overhead Lines: Mandatory power transmission corridor right-of-way (RoW) buffer where no structure is permitted",
      "State Electricity Transmission Utility NOC mandatory before building plan sanction for plots traversing HT corridors",
      "Strict prohibition on trees, scaffolding, or metallic antenna structures encroaching electrical arcing zones"
    ]
  },
  {
    "id": "DOC-OVERLAY-FIRE-NOC",
    "title": "State Fire & Emergency Services High-Rise Fire Safety NOC",
    "shortTitle": "Fire & Emergency Services Fire NOC",
    "level": 4,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "special_overlay",
    "documentPriority": "primary",
    "year": "2021",
    "version": "State Fire Safety Act Standards 2021",
    "status": "verified",
    "categories": [
      "fire_safety",
      "staircases",
      "refuge_areas",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Directorate of Fire and Emergency Services (State Fire Services)",
      "officialUrl": "https://dfs.delhigovt.nic.in",
      "documentType": "Portal",
      "publishedDate": "2021-04-25",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Mandatory statutory Fire NOC from State Fire Services for all buildings exceeding 15 meters in height or commercial buildings > 500 sq.m.",
    "keyProvisions": [
      "Provisional Fire NOC required prior to municipal building plan sanction",
      "Mandatory 6.0m clear peripheral motorable fire engine driveway with minimum 45-tonne load bearing capacity",
      "Mandatory dual fire exit staircases, automatic sprinkler system, wet risers, yard hydrants, and fire check doors",
      "Final Fire Safety Certificate (FSC) inspection required prior to grant of Occupancy Certificate"
    ]
  },
  {
    "id": "DOC-OVERLAY-CGWA-GW",
    "title": "Central Ground Water Authority (CGWA) Ground Water Extraction NOC",
    "shortTitle": "CGWA Borewell Extraction NOC",
    "level": 4,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "special_overlay",
    "documentPriority": "primary",
    "year": "2020",
    "version": "CGWA Guidelines 2020",
    "status": "verified",
    "categories": [
      "rainwater_harvesting",
      "water_supply",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Central Ground Water Authority (CGWA), Ministry of Jal Shakti",
      "officialUrl": "https://cgwa-noc.gov.in",
      "documentType": "Portal",
      "publishedDate": "2020-09-24",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Mandatory prior approval and registration of borewells for commercial complexes, infrastructure projects, and bulk residential townships.",
    "keyProvisions": [
      "Prior CGWA NOC mandatory before drilling any borewell for commercial, industrial, or bulk residential use",
      "Mandatory installation of digital water flow meter with telemetry data transmission to CGWA",
      "Mandatory rainwater harvesting recharge structures to offset groundwater extraction volume",
      "Extraction strictly prohibited in notified Over-Exploited / Critical assessment blocks without equivalent artificial recharge"
    ]
  },
  {
    "id": "DOC-OVERLAY-TREE-NOC",
    "title": "State Tree Authority & Forest Department Tree Preservation Clearance",
    "shortTitle": "Tree Authority Felling NOC",
    "level": 4,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "special_overlay",
    "documentPriority": "primary",
    "year": "2021",
    "version": "State Tree Protection Act Standards 2021",
    "status": "verified",
    "categories": [
      "environmental_regulations",
      "special_restriction",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "State Tree Authority & Department of Forests",
      "officialUrl": "https://forest.delhigovt.nic.in",
      "documentType": "Portal",
      "publishedDate": "2021-03-10",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs tree preservation, mandatory tree transplantation, and compensatory plantation norms on construction plots.",
    "keyProvisions": [
      "Prior written permission from Tree Officer / Tree Authority mandatory before cutting, pruning, or felling any mature tree",
      "Mandatory 1:10 Compensatory Plantation: Minimum 10 new indigenous trees planted for every 1 tree permitted to be felled",
      "Mandatory tree survey map showing exact locations of all mature trees within the proposed plot footprint",
      "Preservation of mature heritage trees (girth > 2.0m) integrated into building architectural design"
    ]
  }
];

export const AUTHORITY_RULES: ByeLawRule[] = [
  {
    "id": "L4-DDA-SANCTION-01",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Local Authority (DDA Sanctions)",
    "jurisdiction": "Delhi (DDA Development Areas)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Delhi (NCT)",
      "city": "Delhi",
      "authority": "Delhi Development Authority"
    },
    "category": "approvals_sanctions",
    "categoryName": "DDA Plan Sanction & Completion",
    "title": "DDA Online Building Plan Sanction (OBPS) & Deemed Sanction Norms",
    "clause": "DDA Sanction Manual 2020 Clause 3.2",
    "sourceDoc": "DDA Building Sanction, Completion & Layout Scrutiny Guidelines",
    "sourceUrl": "https://dda.gov.in",
    "documentYear": "2020",
    "version": "2020 Edition",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandatory online building plan sanction and completion-cum-occupancy certification through the DDA single-window portal.",
    "parameters": {
      "maxDeviationCompoundingPct": 5.0,
      "onlineSanctionMandatory": true
    },
    "detailedRequirements": [
      "Online CAD drawing submission through DDA OBPS single window system",
      "Pre-construction NOCs from Delhi Fire Services, Heritage Conservation Committee, and AAI where applicable",
      "Mandatory inspection at Plinth level within 7 days of intimation before continuing upper floor casting",
      "Completion certificate mandatory before applying for permanent water, sewer, and electric meters"
    ]
  },
  {
    "id": "L4-MCD-SARAL-01",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Local Authority (MCD Sanctions)",
    "jurisdiction": "Delhi (MCD 12 Zones)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Delhi (NCT)",
      "city": "Delhi",
      "authority": "Municipal Corporation of Delhi"
    },
    "category": "approvals_sanctions",
    "categoryName": "MCD SARAL Instant Approval",
    "title": "MCD Saral Building Sanction Scheme for Residential Plots <= 105/500 sq.m",
    "clause": "MCD Notification 2021 (SARAL Scheme)",
    "sourceDoc": "MCD Online Building Plan Approval System (OBPAS) & SARAL Scheme",
    "sourceUrl": "https://mcdonline.nic.in",
    "documentYear": "2021",
    "version": "OBPAS 2.0",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Instant deemed building approval for individual plotted residential homes based on registered architect self-certification.",
    "parameters": {
      "instantApprovalMaxPlotSqM": 105,
      "fastTrackMaxPlotSqM": 500
    },
    "detailedRequirements": [
      "Plots <= 105 sq.m: Instant online building permit generated immediately upon fee payment and architect certification",
      "Plots 105 sq.m to 500 sq.m: Deemed approval generated within 15 working days through automated CAD scrutiny",
      "Registered architect and structural engineer hold full legal liability for compliance with UBBL-2016",
      "Random post-approval municipal site inspection to verify setback and height compliance"
    ]
  },
  {
    "id": "L4-NDMC-LBZ-01",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Special Overlay (Lutyens Bungalow Zone)",
    "jurisdiction": "New Delhi (NDMC LBZ Heritage Zone)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Delhi (NCT)",
      "city": "New Delhi",
      "authority": "New Delhi Municipal Council & DUAC"
    },
    "category": "special_restriction",
    "categoryName": "Lutyens Bungalow Zone Strict Controls",
    "title": "Lutyens Bungalow Zone (LBZ) Strict FAR 0.20 & Tree Retention Heritage Norms",
    "clause": "LBZ Guidelines 2022",
    "sourceDoc": "NDMC Lutyens Bungalow Zone (LBZ) Guidelines & Heritage Regulations",
    "sourceUrl": "https://online.ndmc.gov.in",
    "documentYear": "2022",
    "version": "2022 Guidelines",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Strict low-density garden city heritage controls capping FAR at 0.20 and maximum height at 12m in the Lutyens Bungalow precinct.",
    "parameters": {
      "maxFarLbz": 0.2,
      "maxGroundCoverageLbzPct": 12.0,
      "maxBuildingHeightLbzM": 12.0,
      "duacClearanceMandatory": true
    },
    "detailedRequirements": [
      "Maximum permissible FAR strictly capped at 0.20 (20%) of plot area",
      "Maximum ground coverage restricted to 12% for plots > 1 acre (20% for plots < 1 acre)",
      "Maximum height capped at 12.0m (Ground + 1 or 2 storeys) to maintain tree-line skyline",
      "Mandatory aesthetic design clearance from Delhi Urban Art Commission (DUAC)",
      "Absolute ban on felling mature heritage trees or sub-dividing original bungalow plots"
    ]
  },
  {
    "id": "L4-GMDA-DRAIN-01",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Local Authority (GMDA Gurugram)",
    "jurisdiction": "Gurugram (GMDA Urban Area)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Haryana",
      "city": "Gurugram",
      "authority": "Gurugram Metropolitan Development Authority"
    },
    "category": "sewage_drainage",
    "categoryName": "Master Drainage & Recycled Water",
    "title": "GMDA Master Drainage Corridor & Sewer Connection Clearances",
    "clause": "GMDA Act Section 14 & Drainage Regulations",
    "sourceDoc": "GMDA Infrastructure Access, Water Supply & Master Drainage Regulations",
    "sourceUrl": "https://gmda.gov.in",
    "documentYear": "2020",
    "version": "2020 Regulations",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandates storm water detention, recycled water plumbing, and access permits along Gurugram master infrastructure corridors.",
    "parameters": {
      "mandatoryDualPlumbing": true,
      "stormwaterDetentionMandatory": true
    },
    "detailedRequirements": [
      "Mandatory dual plumbing network connection to receive GMDA recycled water for flushing and horticulture",
      "Prohibition of untreated commercial sewage discharge into Leg I, Leg II, Leg III, or Najafgarh drain corridors",
      "Access connection permit from GMDA mandatory before constructing culvert entry across master service lanes",
      "Ultrasonic smart bulk water meters integrated with GMDA command center"
    ]
  },
  {
    "id": "L4-HSVP-ZONING-01",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Local Authority (HSVP Zoning)",
    "jurisdiction": "Haryana (HSVP Plotted Urban Estates)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Haryana",
      "city": "Gurugram",
      "authority": "Haryana Shehri Vikas Pradhikaran"
    },
    "category": "setbacks",
    "categoryName": "Architectural Control & Zoning Sheets",
    "title": "HSVP Standard Architectural Control & Plotted Zoning Sheets",
    "clause": "HSVP Zoning Manual Clause 4.1",
    "sourceDoc": "HSVP (HUDA) Architectural Control and Sector Zoning Plans",
    "sourceUrl": "https://hsvp.org.in",
    "documentYear": "2021",
    "version": "HSVP Zoning Manual",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Fixed setback lines, party wall alignments, and Stilt + 4 floor structural indemnity regulations for HSVP sector plots.",
    "parameters": {
      "standardFrontSetbackM": 3.0,
      "standardRearSetbackM": 2.0,
      "maxPlinthHeightM": 1.0
    },
    "detailedRequirements": [
      "Setbacks strictly governed by standard sector zoning drawings; zero deviation permitted on front building line",
      "Mutual party wall structural indemnity bond required when excavating stilt basement adjacent to constructed plot",
      "Plinth level must not exceed 1.0m above the crown of the access road",
      "Mandatory rainwater harvesting recharge well in rear courtyard"
    ]
  },
  {
    "id": "L4-MCGM-AUTODCR-01",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Local Authority (MCGM Scrutiny)",
    "jurisdiction": "Mumbai (MCGM Building Proposal Department)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Mumbai",
      "authority": "Municipal Corporation of Greater Mumbai"
    },
    "category": "approvals_sanctions",
    "categoryName": "MCGM AutoDCR & High-Rise Committee",
    "title": "MCGM AutoDCR Mandatory High-Rise Structural Stability & Scrutiny Fee Check",
    "clause": "MCGM Circular 2022 / AutoDCR 2.0",
    "sourceDoc": "MCGM (BMC) AutoDCR Building Proposal Scrutiny & Fire Scrutiny Guidelines",
    "sourceUrl": "https://autodcr.mcgm.gov.in",
    "documentYear": "2022",
    "version": "AutoDCR 2.0",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "CAD drawing scrutiny, fungible FSI premium calculation, CFO Fire NOC, and High-Rise Committee approval for towers > 70m.",
    "parameters": {
      "highRiseCommitteeThresholdM": 70.0,
      "cfoNocThresholdM": 32.0,
      "fungibleFsiResidentialPct": 35
    },
    "detailedRequirements": [
      "Buildings exceeding 70m height require High-Rise Committee (HRC) environmental, wind tunnel, and structural review",
      "CFO Fire Safety NOC mandatory for all buildings taller than 32 meters",
      "Fungible FSI up to 35% for residential (20% for commercial) loaded on payment of premium at 50% of ASR rate",
      "Online issuance of IOD, Plinth CC, Full CC, and Occupation Certificate (OC)"
    ]
  },
  {
    "id": "L4-MMRDA-BKC-01",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Special Authority (MMRDA BKC)",
    "jurisdiction": "Mumbai (MMRDA Bandra-Kurla Complex)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Mumbai",
      "authority": "Mumbai Metropolitan Region Development Authority"
    },
    "category": "far_fsi",
    "categoryName": "BKC Commercial Zone Special FSI",
    "title": "MMRDA Bandra-Kurla Complex (BKC) Commercial Zone FSI & Skywalk Integration",
    "clause": "MMRDA SPA DCR Clause 4.2",
    "sourceDoc": "MMRDA Special Planning Authority (SPA) Regulations (BKC, Wadala, Owe)",
    "sourceUrl": "https://mmrda.maharashtra.gov.in",
    "documentYear": "2021",
    "version": "2021 Edition",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Special commercial FSI up to 4.0, mandatory podium parking, and skywalk connectivity in the Bandra-Kurla Complex financial district.",
    "parameters": {
      "bkcCommercialMaxFsi": 4.0,
      "podiumParkingMandatory": true,
      "skywalkConnectivityRequired": true
    },
    "detailedRequirements": [
      "Commercial plots in BKC 'G' Block and 'E' Block: Permissible FSI up to 4.00 against MMRDA premium rates",
      "Mandatory podium parking and direct elevated pedestrian skywalk connection to adjacent transit hubs",
      "Zero surface stormwater discharge; on-site detention tank required for 100mm/hour rainfall intensity",
      "District cooling and central HVAC integration recommended"
    ]
  },
  {
    "id": "L4-SRA-MUM-01",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Special Scheme (Slum Rehabilitation Authority)",
    "jurisdiction": "Mumbai (SRA Schemes Maharashtra)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Mumbai",
      "authority": "Slum Rehabilitation Authority"
    },
    "category": "far_fsi",
    "categoryName": "In-Situ Slum Redevelopment FSI",
    "title": "Mumbai SRA Scheme In-Situ Rehabilitation 3.0+ FSI Incentives",
    "clause": "Regulation 33(10), Appendix IV",
    "sourceDoc": "Slum Rehabilitation Authority (SRA) Mumbai Regulations (Regulation 33(10))",
    "sourceUrl": "https://sra.gov.in",
    "documentYear": "2020",
    "version": "DCPR 33(10)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Incentive sale FSI generation against rehabilitation of eligible slum tenements with minimum 300 sq.ft carpet area per unit.",
    "parameters": {
      "minTenementCarpetSqFt": 300,
      "maxAchievableFsi": 4.0,
      "incentiveRatioSuburbs": 1.25
    },
    "detailedRequirements": [
      "Every eligible slum dweller provided a free 300 sq.ft (27.88 sq.m) self-contained rehabilitation apartment",
      "Incentive sale component FSI granted at 1:1 in Island City and 1:1.25 in Mumbai Suburbs",
      "Total composite project FSI permissible up to 4.00 or actual consumption required",
      "Mandatory escrow account and bank guarantee for transit camp accommodation"
    ]
  },
  {
    "id": "L4-BBMP-SCRUTINY-01",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Local Authority (BBMP Scrutiny)",
    "jurisdiction": "Bengaluru (BBMP 8 Administrative Zones)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Karnataka",
      "city": "Bengaluru",
      "authority": "Bruhat Bengaluru Mahanagara Palike"
    },
    "category": "approvals_sanctions",
    "categoryName": "Suvarna Paravanage & Khata Verification",
    "title": "BBMP Suvarna Paravanage Online Sanction & Zero Deviation Affidavit",
    "clause": "BBMP Circular 2021 / Suvarna Paravanage",
    "sourceDoc": "Bruhat Bengaluru Mahanagara Palike (BBMP) Building Byelaws & Scrutiny Guidelines",
    "sourceUrl": "https://bbmp.gov.in",
    "documentYear": "2020",
    "version": "2020 Byelaws",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Online building permission, A-Khata validation, BWSSB water NOC, and Occupancy Certificate verification in Bengaluru.",
    "parameters": {
      "aKhataMandatory": true,
      "bwssbNocThresholdUnits": 20
    },
    "detailedRequirements": [
      "A-Khata certificate and title deed verification mandatory for building plan sanction",
      "Projects with > 20 apartments require BWSSB water supply and sewerage NOC with dual plumbing",
      "Mandatory RWH percolation pits inspected and certified prior to issuing Occupancy Certificate",
      "Online plan scrutiny with zero tolerance for setback deviations"
    ]
  },
  {
    "id": "L4-BDA-CDP-01",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Local Authority (BDA Layouts)",
    "jurisdiction": "Bengaluru (BDA Layout Approval Area)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Karnataka",
      "city": "Bengaluru",
      "authority": "Bangalore Development Authority"
    },
    "category": "amenity_space",
    "categoryName": "Park & Civic Amenity (CA) Site Relinquishment",
    "title": "BDA Layout Approval 15% Park & Civic Amenity (CA) Site Relinquishment",
    "clause": "BDA Act Section 32 & Layout Regulations",
    "sourceDoc": "Bangalore Development Authority (BDA) Layout & Sub-division Regulations",
    "sourceUrl": "https://bdabangalore.org",
    "documentYear": "2020",
    "version": "2020 Regulations",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandatory relinquishment of 15% park/open space and 5% civic amenity land for private layout approvals in Bengaluru.",
    "parameters": {
      "parkRelinquishmentPct": 15.0,
      "civicAmenityRelinquishmentPct": 5.0,
      "minRoadWidthLayoutM": 12.0
    },
    "detailedRequirements": [
      "15% of the total layout land must be relinquished free of cost to BDA for public parks and open spaces",
      "5% of the total layout land must be surrendered for Civic Amenity (CA) sites",
      "Minimum road width of 12.0 meters for all internal residential layout roads",
      "Mandatory buffer demarcation from Rajakaluve stormwater drains"
    ]
  },
  {
    "id": "L4-GHMC-ROAD-01",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Local Authority (GHMC Hyderabad)",
    "jurisdiction": "Hyderabad (GHMC Circles)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Telangana",
      "city": "Hyderabad",
      "authority": "Greater Hyderabad Municipal Corporation"
    },
    "category": "approvals_sanctions",
    "categoryName": "Road Widening Land Surrender & TDR",
    "title": "GHMC Mandatory Free Land Surrender for Master Plan Road Widening",
    "clause": "GHMC Act Section 146 & G.O. Ms. No. 168",
    "sourceDoc": "Greater Hyderabad Municipal Corporation (GHMC) Building Sanction Norms",
    "sourceUrl": "https://www.ghmc.gov.in",
    "documentYear": "2021",
    "version": "2021 Edition",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandatory free surrender of road widening land in exchange for 200% to 400% Transferable Development Rights (TDR) in Hyderabad.",
    "parameters": {
      "tdrIncentiveRoadWideningPct": 200,
      "mortgageBuiltUpAreaPct": 10
    },
    "detailedRequirements": [
      "Affected road widening portion must be gifted to GHMC via registered gift deed free of cost",
      "Owner receives TDR certificate equal to 200% to 400% of the surrendered land area",
      "10% of the total built-up area mortgaged to GHMC until Occupancy Certificate is issued",
      "Mandatory online application via TG-bPASS platform"
    ]
  },
  {
    "id": "L4-CMDA-MSB-01",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Local Authority (CMDA Chennai)",
    "jurisdiction": "Chennai (CMDA Planning Area)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Tamil Nadu",
      "city": "Chennai",
      "authority": "Chennai Metropolitan Development Authority"
    },
    "category": "fire_safety",
    "categoryName": "Multi-Storey Building (MSB) Panel Scrutiny",
    "title": "CMDA Multi-Storey Building (MSB) Special Fire & Structural Scrutiny Panel",
    "clause": "CMDA MSB Rule 12 & TNCDBR Rule 39",
    "sourceDoc": "Chennai Metropolitan Development Authority (CMDA) Planning Permission Rules",
    "sourceUrl": "https://cmdachennai.gov.in",
    "documentYear": "2021",
    "version": "2021 Edition",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Special inter-departmental panel scrutiny for high-rise buildings exceeding 18.3m height in Chennai metropolitan area.",
    "parameters": {
      "msbHeightThresholdM": 18.3,
      "minFireDrivewayM": 7.0,
      "osrGiftDeedMandatory": true
    },
    "detailedRequirements": [
      "Buildings > 18.3m height require Multi-Storey Building (MSB) panel approval (CMDA, Fire, Police Traffic, CMWSSB)",
      "Minimum 7.0m clear peripheral fire access driveway around the building",
      "Execution of registered gift deed for 10% OSR space to local body prior to issue of Planning Permission",
      "Mandatory structural peer review by IIT Madras / Anna University for buildings > 50m height"
    ]
  },
  {
    "id": "L4-JDA-SCHEME-01",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Local Authority (JDA Jaipur)",
    "jurisdiction": "Jaipur (JDA Scheme Areas)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Rajasthan",
      "city": "Jaipur",
      "authority": "Jaipur Development Authority"
    },
    "category": "setbacks",
    "categoryName": "Corner Splay & Scheme Setbacks",
    "title": "JDA Approved Scheme Corner Splay and Setback Regularization",
    "clause": "JDA Byelaws 2020 Clause 5.4",
    "sourceDoc": "Jaipur Development Authority (JDA) Building Byelaws 2020 & Scheme Area Regulations",
    "sourceUrl": "https://jda.urban.rajasthan.gov.in",
    "documentYear": "2020",
    "version": "JDA Byelaws 2020",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandates 3.0m corner splays on street junctions and standard setback parameters in JDA approved residential schemes.",
    "parameters": {
      "cornerSplayM": 3.0,
      "rwhThresholdSqM": 225
    },
    "detailedRequirements": [
      "Corner plots must provide 3.0m x 3.0m chamfer/splay at road junctions for vehicle visibility",
      "Mandatory rooftop rainwater harvesting with recharge well for plots >= 225 sq.m",
      "Betterment FAR purchase options for additional floor area on roads >= 12m",
      "Online application through JDA citizen service portal"
    ]
  },
  {
    "id": "L4-NOIDA-SECTOR-01",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Local Authority (NOIDA Regulations)",
    "jurisdiction": "Noida (NOIDA Authority Sectors)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Noida",
      "authority": "New Okhla Industrial Development Authority"
    },
    "category": "ground_coverage",
    "categoryName": "Plotted Coverage & Height Limits",
    "title": "NOIDA Plotted Ground Coverage & Maximum 15m Height Restriction",
    "clause": "NOIDA Building Regulations 2010 Clause 24.1",
    "sourceDoc": "NOIDA Building Regulations 2010 (Amended up to 2023)",
    "sourceUrl": "https://noidaauthorityonline.in",
    "documentYear": "2010",
    "version": "Amended 2023",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Restricts residential plotted building height to 15.0m and enforces strict ground coverage slabs across all Noida sectors.",
    "parameters": {
      "maxHeightPlottedM": 15.0,
      "maxGroundCoverageUpTo200SqMPct": 75.0,
      "maxGroundCoverageAbove200SqMPct": 60.0
    },
    "detailedRequirements": [
      "Residential plotted height strictly capped at 15.0m (Ground + 3 floors); no stilt exemption for extra storey",
      "Ground coverage: 75% for plots <= 200 sq.m; 60% for plots 200 to 500 sq.m; 50% for plots > 500 sq.m",
      "Front setback: 3.0m for 150-300 sqm; 4.5m for 300-500 sqm; 6.0m for > 500 sqm",
      "Third-party structural audit certificate mandatory for all multi-family buildings"
    ]
  },
  {
    "id": "L4-GNIDA-INST-01",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Local Authority (Greater Noida)",
    "jurisdiction": "Greater Noida (GNIDA Knowledge Parks & IT Zones)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Greater Noida",
      "authority": "Greater Noida Industrial Development Authority"
    },
    "category": "ground_coverage",
    "categoryName": "IT Park & Institutional Coverage",
    "title": "Greater Noida IT Park & Institutional Ground Coverage 30% / FAR 1.50",
    "clause": "GNIDA Regulation 18.2",
    "sourceDoc": "Greater Noida Building Regulations 2010 (Amended 2023)",
    "sourceUrl": "https://www.greaternoidaauthority.in",
    "documentYear": "2010",
    "version": "Amended 2023",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Regulates coverage, FAR, and open green requirements in Knowledge Parks and Tech Zones in Greater Noida.",
    "parameters": {
      "maxGroundCoverageInstitutionalPct": 30.0,
      "baseFarInstitutional": 1.5,
      "minGreenLandscapePct": 25.0
    },
    "detailedRequirements": [
      "Maximum ground coverage capped at 30% to maintain spacious institutional campus layout",
      "Base FAR 1.50 (purchasable up to 2.00 on 30m+ master roads)",
      "Minimum 25% of the campus must be dedicated to soft green landscaping",
      "Mandatory zero effluent discharge with on-site tertiary STP"
    ]
  },
  {
    "id": "L4-YEIDA-IND-01",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Local Authority (YEIDA)",
    "jurisdiction": "Yamuna Expressway (YEIDA Industrial Sectors)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Greater Noida",
      "authority": "Yamuna Expressway Industrial Development Authority"
    },
    "category": "ground_coverage",
    "categoryName": "Industrial Zone Ground Coverage",
    "title": "YEIDA Electronic City & Industrial Zone Ground Coverage 60%",
    "clause": "YEIDA Regulation Clause 9.3",
    "sourceDoc": "YEIDA Building Regulations & Industrial Sanction Guidelines",
    "sourceUrl": "https://yamunaexpresswayauthority.com",
    "documentYear": "2015",
    "version": "Amended 2023",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Industrial ground coverage up to 60%, solar mandates, and Jewar Airport aviation height compliance in YEIDA sectors.",
    "parameters": {
      "maxGroundCoverageIndustrialPct": 60.0,
      "baseFarIndustrial": 1.5,
      "solarPvMandatory": true
    },
    "detailedRequirements": [
      "Industrial plots: Maximum ground coverage 60%, FAR 1.50",
      "Mandatory AAI CCZM clearance for all sectors in the Jewar Airport aerodrome vicinity",
      "Compulsory on-site solar rooftop installation for all industrial allotments",
      "Integrated rainwater recharge pits and hazardous waste storage clearance"
    ]
  },
  {
    "id": "L4-AAI-CCZM-01",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Statutory Overlay (AAI CCZM)",
    "jurisdiction": "Pan-India (Airport Influence Grids 20km)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "height_floors",
    "categoryName": "Colour Coded Zoning Map (CCZM)",
    "title": "AAI Colour Coded Zoning Map (CCZM) Height NOC Grid Compliance",
    "clause": "AAI NOCAS II Guidelines Clause 3",
    "sourceDoc": "Airports Authority of India (AAI) Colour Coded Zoning Map (CCZM) Height NOC",
    "sourceUrl": "https://nocas2.aai.aero",
    "documentYear": "2020",
    "version": "NOCAS II",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandatory grid-by-grid AMSL top elevation ceiling verification around all civil and defense aerodromes across India.",
    "parameters": {
      "cczmGridCheckRequired": true,
      "aviationLightHeightThresholdM": 45.0
    },
    "detailedRequirements": [
      "Building top elevation including lift machine rooms, overhead tanks, and antennas must not exceed local CCZM grid AMSL ceiling",
      "Automated clearance by local municipal body if proposed elevation is strictly below CCZM threshold",
      "NOCAS II online application required if proposed height breaches CCZM ceiling",
      "Aviation obstruction red warning lights mandatory for structures > 45m height"
    ]
  },
  {
    "id": "L4-NHAI-SETBACK-01",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Statutory Overlay (NHAI Highway Setback)",
    "jurisdiction": "Pan-India (National Highways)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "setbacks",
    "categoryName": "National Highway Building Line Setback",
    "title": "NHAI 5m-15m Non-Construction Building Line from Highway Right of Way",
    "clause": "MoRTH Circular RW/NH-33044",
    "sourceDoc": "NHAI Guidelines for Access Permission & Setbacks along National Highways",
    "sourceUrl": "https://nhai.gov.in",
    "documentYear": "2020",
    "version": "MoRTH Circular",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandatory physical setback buffer from National Highway Right of Way and formal access NOC for entry/exit service lanes.",
    "parameters": {
      "minBuildingLineSetbackM": 5.0,
      "maxBuildingLineSetbackM": 15.0,
      "nhaiAccessNocMandatory": true
    },
    "detailedRequirements": [
      "Minimum 5.0m to 15.0m building line setback measured from the statutory highway Right of Way (RoW) boundary",
      "No permanent structure, balcony, or deep basement excavation allowed in the building setback corridor",
      "Mandatory Access Permission NOC from NHAI Regional Office before constructing commercial vehicular access",
      "Access must connect via decelerating/accelerating service lanes"
    ]
  },
  {
    "id": "L4-RAILWAY-30M-01",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Statutory Overlay (Railway Track Buffer)",
    "jurisdiction": "Pan-India (Railway & Metro Corridors)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "setbacks",
    "categoryName": "Railway Track 30m Safety Buffer",
    "title": "Indian Railways & Metro Rail Mandatory 30-Meter Track Safety NOC Buffer",
    "clause": "Railway Board Circular 2021/CE-I/CT/14",
    "sourceDoc": "Ministry of Railways 30m Track Safety Buffer & Metro Zone NOC",
    "sourceUrl": "https://indianrailways.gov.in",
    "documentYear": "2021",
    "version": "2021 Circular",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandatory structural stability clearance from Indian Railways / Metro Rail for any construction within 30m of tracks.",
    "parameters": {
      "railwayBufferM": 30.0,
      "minDistanceBoundaryWallM": 3.0
    },
    "detailedRequirements": [
      "Properties located within 30 meters of railway track land boundary must obtain prior DRM / Metro Rail NOC",
      "Deep basement excavations require diaphragm wall structural vibration analysis",
      "Zero permanent foundation permitted within 3.0m of railway boundary",
      "Tower cranes must be fitted with anti-collision limiters to prevent boom rotation over railway lines"
    ]
  },
  {
    "id": "L4-ASI-100M-01",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Statutory Overlay (Heritage Buffers)",
    "jurisdiction": "Pan-India (Protected Monuments)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "special_restriction",
    "categoryName": "ASI Prohibited 100m & Regulated 200m",
    "title": "ASI Prohibited 100-Meter Zone Absolute Construction Ban & 200-Meter Regulated Zone",
    "clause": "AMASR Act Section 20A & Section 20B",
    "sourceDoc": "ASI & National Monuments Authority Prohibited (100m) and Regulated (200m) Buffers",
    "sourceUrl": "https://nma.gov.in",
    "documentYear": "2020",
    "version": "AMASR Act",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Absolute statutory ban on construction within 100m of Centrally Protected Monuments, and online NMA NOC within 300m.",
    "parameters": {
      "prohibitedZoneRadiusM": 100,
      "regulatedZoneRadiusM": 200,
      "nmaNocMandatory": true
    },
    "detailedRequirements": [
      "0m to 100m from monument boundary: Prohibited area, zero new construction or addition allowed",
      "100m to 300m from monument boundary: Regulated area requiring prior online NOC from NMA via SMARAC portal",
      "Maximum building height in regulated zone determined by monument-specific heritage bye-laws",
      "Penal action including mandatory demolition and non-bailable imprisonment for violations"
    ]
  },
  {
    "id": "L4-NGT-LAKE-01",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Statutory Overlay (NGT Buffers)",
    "jurisdiction": "Pan-India (Lakes, Rivers & Drains)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "environmental_regulations",
    "categoryName": "Water Body & Drainage Buffer Corridors",
    "title": "NGT Mandated 75m Lake Buffer & 50m Primary Stormwater Drain Buffer",
    "clause": "NGT OA No. 222/2014 & OA No. 673/2018",
    "sourceDoc": "National Green Tribunal (NGT) & CPCB Buffer Zones for Lakes, Rivers & Drains",
    "sourceUrl": "https://greentribunal.gov.in",
    "documentYear": "2019",
    "version": "NGT Order",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Non-construction ecological buffer corridors around lakes, rivers, floodplains, and stormwater drains across India.",
    "parameters": {
      "lakeBufferM": 75.0,
      "primaryDrainBufferM": 50.0,
      "secondaryDrainBufferM": 25.0,
      "tertiaryDrainBufferM": 15.0
    },
    "detailedRequirements": [
      "Lakes & Water Bodies: Minimum 75m buffer from full tank level (FTL) where zero construction is permitted",
      "Primary Stormwater Drains: Minimum 50m non-construction green buffer on both banks",
      "Secondary Drains: Minimum 25m buffer; Tertiary Drains: Minimum 15m buffer",
      "Absolute prohibition on dumping debris or laying sewer pipes inside designated buffers"
    ]
  },
  {
    "id": "L4-CRZ-500M-01",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Statutory Overlay (CRZ Clearances)",
    "jurisdiction": "Pan-India (Coastal Stretches & Tidal Creeks)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "environmental_regulations",
    "categoryName": "Coastal Regulation Zone Clearance",
    "title": "MCZMA/TNCZMA Coastal Regulation Zone High Tide Line (HTL) 200m-500m Buffer NOC",
    "clause": "CRZ Notification 2019",
    "sourceDoc": "Coastal Zone Management Authority (CRZ Clearance - MCZMA / TNCZMA / GCZMA)",
    "sourceUrl": "https://mczma.gov.in",
    "documentYear": "2019",
    "version": "CRZ 2019",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandatory statutory clearance from State Coastal Zone Management Authority for all properties in coastal strips.",
    "parameters": {
      "coastalBufferM": 500,
      "creekBufferM": 100,
      "sczmaNocMandatory": true
    },
    "detailedRequirements": [
      "Mandatory CRZ clearance from State CZMA before local municipal corporation plan sanction",
      "Zero construction permitted in CRZ-I ecologically sensitive areas",
      "CRZ-II urban developments permitted only on the landward side of existing authorized structures or roads",
      "FSI and height restricted strictly to the sanctioned development control rules in force"
    ]
  },
  {
    "id": "L4-CEA-CLEARANCE-01",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Statutory Overlay (HT Power Clearances)",
    "jurisdiction": "Pan-India (Overhead Power Corridors)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "electrical",
    "categoryName": "High Tension Overhead Line Clearances",
    "title": "66kV / 132kV / 220kV High Voltage Overhead Line Corridor Building Restrictions",
    "clause": "CEA Regulation 61",
    "sourceDoc": "Central Electricity Authority High Tension (HT) Line Clearance & Corridor Buffers",
    "sourceUrl": "https://cea.nic.in",
    "documentYear": "2020",
    "version": "CEA 2020",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandatory safety clearances and corridor right-of-way buffers between building structures and high-voltage transmission lines.",
    "parameters": {
      "minVertical11KvM": 3.7,
      "minHorizontal11KvM": 1.2,
      "minVertical33KvM": 3.7,
      "minHorizontal33KvM": 2.0,
      "minHorizontal66KvM": 2.3
    },
    "detailedRequirements": [
      "11 kV & 33 kV Lines: Minimum 3.7m vertical clearance and 1.2m to 2.0m horizontal clearance from nearest building point",
      "66 kV to 220 kV Lines: Mandatory power corridor Right-of-Way (RoW) buffer where no structure is permitted",
      "No building plan sanction granted without State Electricity Transmission Utility NOC for plots adjacent to HT towers",
      "Strict prohibition on trees or balconies projecting into the transmission corridor"
    ]
  },
  {
    "id": "L4-FIRE-HIGHRISE-01",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Statutory Overlay (Fire Safety NOC)",
    "jurisdiction": "Pan-India (High-Rise Buildings > 15m)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "fire_safety",
    "categoryName": "High-Rise Fire Safety Clearance",
    "title": "State Fire Services Mandatory 6.0m Peripheral Fire Engine Driveway & Fire Lift",
    "clause": "State Fire Safety Act & NBC Part 4",
    "sourceDoc": "State Fire & Emergency Services High-Rise Fire Safety NOC",
    "sourceUrl": "https://dfs.delhigovt.nic.in",
    "documentYear": "2021",
    "version": "2021 Standards",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandatory Fire NOC from State Fire Services, peripheral 6m fire tender access, automatic sprinklers, and refuge floors.",
    "parameters": {
      "highRiseThresholdM": 15.0,
      "minFireDrivewayM": 6.0,
      "fireLiftMandatory": true
    },
    "detailedRequirements": [
      "Buildings > 15m height require Provisional Fire NOC before sanction and Final FSC before occupancy",
      "Minimum 6.0m clear peripheral motorable fire engine driveway with 45-tonne bearing capacity",
      "Mandatory dual fire staircases, automatic sprinkler system, wet risers, and yard hydrants",
      "Cantilevered refuge areas at 24m and every 15m thereafter"
    ]
  },
  {
    "id": "L4-CGWA-BOREWELL-01",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Statutory Overlay (Groundwater Abstraction)",
    "jurisdiction": "Pan-India (Commercial & Large Residential)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "rainwater_harvesting",
    "categoryName": "Groundwater Extraction NOC",
    "title": "CGWA Prior NOC for Commercial/Industrial Groundwater Borewell Extraction",
    "clause": "CGWA Notification 2020",
    "sourceDoc": "Central Ground Water Authority (CGWA) Ground Water Extraction NOC",
    "sourceUrl": "https://cgwa-noc.gov.in",
    "documentYear": "2020",
    "version": "CGWA 2020",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandatory prior approval and registration of borewells for commercial complexes, infrastructure, and bulk townships.",
    "parameters": {
      "digitalFlowMeterMandatory": true,
      "rwhRechargeMandatory": true
    },
    "detailedRequirements": [
      "Prior CGWA NOC mandatory before drilling any borewell for commercial, industrial, or bulk residential use",
      "Mandatory installation of digital water flow meter with telemetry data transmission to CGWA",
      "Mandatory rainwater harvesting recharge structures to offset groundwater extraction volume",
      "Extraction strictly prohibited in notified Over-Exploited blocks without equivalent recharge"
    ]
  },
  {
    "id": "L4-TREE-FELLING-01",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Statutory Overlay (Tree Preservation)",
    "jurisdiction": "Pan-India (Urban Forest Departments)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "environmental_regulations",
    "categoryName": "Tree Authority Permission & Plantation",
    "title": "State Tree Authority Mandatory 1:10 Compensatory Plantation for Tree Felling",
    "clause": "Tree Protection Act & Forest Rules",
    "sourceDoc": "State Tree Authority & Forest Department Tree Preservation Clearance",
    "sourceUrl": "https://forest.delhigovt.nic.in",
    "documentYear": "2021",
    "version": "2021 Standards",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandatory prior permission for tree felling and compulsory 1:10 compensatory plantation on construction sites.",
    "parameters": {
      "compensatoryRatio": "1:10",
      "treeSurveyMandatory": true
    },
    "detailedRequirements": [
      "Prior written permission from Tree Officer mandatory before cutting, pruning, or felling any mature tree",
      "Mandatory 1:10 Compensatory Plantation: Minimum 10 new indigenous trees planted for every 1 tree felled",
      "Mandatory tree survey drawing showing exact locations of all mature trees within the proposed plot footprint",
      "Preservation of mature heritage trees (girth > 2.0m) integrated into building architectural design"
    ]
  }
];

export const AUTHORITY_BYE_LAW_RULES = AUTHORITY_RULES;
