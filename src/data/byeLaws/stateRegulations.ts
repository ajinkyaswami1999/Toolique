// Level 2: State Unified Building Codes & Regulations (25 States & UT Codes)

import type { ByeLawRule, RegulationDocument } from './types';

export const STATE_REGULATION_DOCUMENTS: RegulationDocument[] = [
  {
    "id": "DOC-STATE-MAHA-UDCPR-2020",
    "title": "Maharashtra Unified Development Control and Promotion Regulations (UDCPR 2020)",
    "shortTitle": "Maharashtra UDCPR 2020",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Maharashtra",
      "stateId": "maharashtra"
    },
    "documentType": "unified_dcr",
    "documentPriority": "primary",
    "year": "2020",
    "version": "UDCPR 2020 (Amended up to 2024)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "fire_safety",
      "approvals_sanctions",
      "amenity_space"
    ],
    "source": {
      "authority": "Urban Development Department (UDD), Government of Maharashtra",
      "officialUrl": "https://urban.maharashtra.gov.in",
      "documentUrl": "https://dtp.maharashtra.gov.in/en/udcpr",
      "documentType": "Gazette",
      "publishedDate": "2020-12-02",
      "lastVerified": "15 Jan 2026"
    },
    "amendments": [
      {
        "year": "2022",
        "title": "UDCPR Amendment for Premium FSI Rates and TDR Loading Corridors",
        "gazetteNotification": "TPS-1821/119/CR-104/2021/UD-13",
        "summary": "Standardized Ancillary FSI up to 60% on payment of premium and revised road width linked FSI caps.",
        "status": "in_force"
      }
    ],
    "summary": "Single unified regulatory framework applicable across all Municipal Corporations, Municipal Councils, and Regional Planning Authorities in Maharashtra (excluding MCGM Mumbai which is governed under DCPR-2034).",
    "keyProvisions": [
      "Regulation 6.1: Basic FSI + Premium FSI + TDR entitlement structured strictly based on access road width (9m, 12m, 15m, 18m, 24m+)",
      "Regulation 6.3: Ancillary FSI up to 60% of basic FSI for residential and 80% for commercial buildings",
      "Regulation 7.1: Standardized mandatory parking standards (1 Car per 50-100 sq.m carpet area for residential)",
      "Regulation 9.1: Comprehensive fire safety, travel distance (30m), and dual staircase norms"
    ]
  },
  {
    "id": "DOC-STATE-DELHI-UBBL-2016",
    "title": "Unified Building Bye-Laws for Delhi 2016 (UBBL-2016)",
    "shortTitle": "Delhi UBBL 2016",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Delhi (NCT)",
      "stateId": "delhi"
    },
    "documentType": "unified_dcr",
    "documentPriority": "primary",
    "year": "2016",
    "version": "UBBL-2016 (Amended 2020/2023)",
    "status": "verified",
    "categories": [
      "ground_coverage",
      "far_fsi",
      "setbacks",
      "height_floors",
      "stilt_parking",
      "fire_safety",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Delhi Development Authority (DDA) & Ministry of Housing and Urban Affairs",
      "officialUrl": "https://dda.gov.in",
      "documentUrl": "https://dda.gov.in/unified-building-bye-laws-2016",
      "documentType": "Gazette",
      "publishedDate": "2016-03-22",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statutory unified building regulations for the National Capital Territory of Delhi, governing DDA, MCD, NDMC, and Delhi Cantonment Board jurisdictions.",
    "keyProvisions": [
      "Chapter 7: Plotted residential development FAR ranging from 200 (plots > 1000 sqm) to 350 (plots < 100 sqm)",
      "Clause 7.14: Stilt parking floor mandatory for plot size > 100 sqm where FAR is fully loaded (non-FAR countable)",
      "Clause 2.14: Online Building Plan Sanction (OBPS) with SARAL single-window risk-based fast track approval",
      "Clause 9.3: Green building compliance mandatory for all plots >= 105 sq.m"
    ]
  },
  {
    "id": "DOC-STATE-HR-HBC-2017",
    "title": "Haryana Building Code 2017 (HBC-2017 Amended up to 2023)",
    "shortTitle": "Haryana Building Code 2017",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Haryana",
      "stateId": "haryana"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2017",
    "version": "HBC-2017 (Amended 2023)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "stilt_parking",
      "parking",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Department of Town & Country Planning (DTCP) & HSVP Haryana",
      "officialUrl": "https://tcpharyana.gov.in",
      "documentUrl": "https://tcpharyana.gov.in/Acts_Rules/HBC-2017.pdf",
      "documentType": "Gazette",
      "publishedDate": "2017-04-10",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Unified statutory building code across HSVP sectors, DTCP licensed colonies, and municipal corporation areas in Gurugram, Faridabad, Panchkula, and entire Haryana.",
    "keyProvisions": [
      "Clause 6.1 & Table 6.1: Core FAR + Purchasable FAR (PFAR) slabs for residential plotted sectors (FAR up to 2.64 on 12m+ roads)",
      "Clause 6.3: Stilt + 4 Floors policy with mandatory stilt parking for independent floor registrations",
      "Clause 7.1: Basements permissible up to boundary line subject to structural safety retaining wall",
      "Clause 8.4: Rooftop solar generation mandatory for connected electrical load >= 50 kW"
    ]
  },
  {
    "id": "DOC-STATE-TN-TNCDBR-2019",
    "title": "Tamil Nadu Combined Development and Building Rules 2019 (TNCDBR-2019)",
    "shortTitle": "Tamil Nadu TNCDBR 2019",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Tamil Nadu",
      "stateId": "tamil_nadu"
    },
    "documentType": "unified_dcr",
    "documentPriority": "primary",
    "year": "2019",
    "version": "G.O. (Ms) No. 18 (Amended 2022)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "fire_safety",
      "amenity_space"
    ],
    "source": {
      "authority": "Housing and Urban Development Department, Government of Tamil Nadu",
      "officialUrl": "https://cmdachennai.gov.in",
      "documentUrl": "https://cmdachennai.gov.in/tncdbr2019.html",
      "documentType": "Gazette",
      "publishedDate": "2019-02-04",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Comprehensive uniform development rules applying across Chennai Metropolitan Area (CMDA), DTCP directorate areas, and all Urban Local Bodies in Tamil Nadu.",
    "keyProvisions": [
      "Rule 35 & 39: Premium FSI up to 50% over base FSI against infrastructure development charges",
      "Rule 41: Mandatory Open Space Reservation (OSR 10%) for layouts and developments > 3,000 sq.m",
      "Rule 38: Non-High Rise buildings (up to 18.3m height) and High Rise buildings (> 18.3m height) spatial matrix",
      "Rule 55: Rainwater harvesting structures and solar water heaters mandatory for all building categories"
    ]
  },
  {
    "id": "DOC-STATE-TG-TGBPASS-2020",
    "title": "Telangana State Building Rules & TG-bPASS Act 2020 (G.O. Ms. No. 168 & 7)",
    "shortTitle": "Telangana TG-bPASS Rules",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Telangana",
      "stateId": "telangana"
    },
    "documentType": "unified_dcr",
    "documentPriority": "primary",
    "year": "2020",
    "version": "Act No. 12 of 2020 / G.O. Ms. 168 (Amended 2023)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "setbacks",
      "height_floors",
      "parking",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Municipal Administration & Urban Development (MA&UD) Department, Telangana",
      "officialUrl": "https://tgbpass.telangana.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2020-09-19",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs building sanctions across GHMC Hyderabad, HMDA metropolitan region, and all municipalities in Telangana under the TS-bPASS single window platform.",
    "keyProvisions": [
      "No FAR/FSI restriction (Free FAR) for non-high rise residential developments subject to setbacks and road width",
      "Instant online building registration for plots up to 500 sq.m (height up to 10m)",
      "Single-window approval within 21 days for high-rise and commercial buildings, failing which deemed approval applies",
      "Mandatory 10% mortgage of built-up area to municipal authority until Occupancy Certificate is issued"
    ]
  },
  {
    "id": "DOC-STATE-KA-KMCR-2020",
    "title": "Karnataka Municipal Corporations (Building) Bye-Laws & Planning Regulations",
    "shortTitle": "Karnataka KMC Building Bye-Laws",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Karnataka",
      "stateId": "karnataka"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2020",
    "version": "Amended 2020",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "rainwater_harvesting"
    ],
    "source": {
      "authority": "Urban Development Department (UDD), Government of Karnataka",
      "officialUrl": "https://udd.karnataka.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2020-06-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statutory building bye-laws regulating construction across BBMP Bengaluru, Mysuru, Hubballi-Dharwad, Mangaluru, and all Municipal Corporations in Karnataka.",
    "keyProvisions": [
      "FAR matrix structured by road width (FAR 1.50 for roads < 12m up to 3.25+ on roads > 24m with Premium FAR)",
      "Mandatory all-around peripheral setbacks for high-rise buildings exceeding 15 meters in height",
      "Compulsory rainwater harvesting percolation pits and solar rooftop water heating systems",
      "Zero deviation policy with mandatory Suvarna Paravanage online verification"
    ]
  },
  {
    "id": "DOC-STATE-GJ-CGDCR-2017",
    "title": "Comprehensive General Development Control Regulations Gujarat (CGDCR-2017)",
    "shortTitle": "Gujarat CGDCR 2017",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Gujarat",
      "stateId": "gujarat"
    },
    "documentType": "unified_dcr",
    "documentPriority": "primary",
    "year": "2017",
    "version": "CGDCR-2017 (Amended 2022)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "fire_safety",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Urban Development and Urban Housing Department, Government of Gujarat",
      "officialUrl": "https://udd.gujarat.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2017-09-19",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Unified development control regulations covering AMC Ahmedabad, SMC Surat, VMC Vadodara, RMC Rajkot, AUDA, SUDA, and all urban development authorities in Gujarat.",
    "keyProvisions": [
      "Base FSI 1.20 to 1.80 with Chargeable/Premium FSI up to 4.0 in Transit Oriented Development (TOD) corridors",
      "D1 to D8 authority categorization defining uniform setback and height rules across mega cities and towns",
      "Mandatory visitor parking (minimum 10% of total parking spaces) located on ground level",
      "Affordable Housing FSI incentives up to 2.70 for EWS and LIG housing schemes"
    ]
  },
  {
    "id": "DOC-STATE-RJ-BBR-2020",
    "title": "Rajasthan Unified Model Building Regulations 2020 (Amended 2023)",
    "shortTitle": "Rajasthan Unified BBR 2020",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Rajasthan",
      "stateId": "rajasthan"
    },
    "documentType": "unified_dcr",
    "documentPriority": "primary",
    "year": "2020",
    "version": "BBR-2020 (Amended 2023)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Urban Development and Housing (UDH) Department, Government of Rajasthan",
      "officialUrl": "https://urban.rajasthan.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2020-04-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statewide unified building bye-laws applicable across Jaipur Development Authority (JDA), Jodhpur Development Authority (JDA), UITs, and all Municipal Corporations in Rajasthan.",
    "keyProvisions": [
      "Standard FAR slabs ranging from 1.33 to 2.25 based on road width and plot area, with purchasable Betterment FAR",
      "Standard front, side, and rear setback formulas linked to plot size and proposed building height",
      "Stilt parking allowed without FAR counting up to 2.4m height; basements permissible up to side setbacks",
      "Mandatory rainwater harvesting recharge structure for all plots measuring 225 sq.m or more"
    ]
  },
  {
    "id": "DOC-STATE-UP-AWAS-2008",
    "title": "Uttar Pradesh Building Construction and Development Bye-Laws (Awas Bandhu 2008 Amended 2021)",
    "shortTitle": "UP Awas Bandhu Building Bye-Laws",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Uttar Pradesh",
      "stateId": "uttar_pradesh"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2008",
    "version": "Amended 2021",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "fire_safety"
    ],
    "source": {
      "authority": "Housing and Urban Planning Department, Government of Uttar Pradesh / Awas Bandhu",
      "officialUrl": "https://awas.up.nic.in",
      "documentType": "Gazette",
      "publishedDate": "2008-09-04",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "State building regulations governing development authorities including LDA Lucknow, GDA Ghaziabad, KDA Kanpur, ADA Agra, VDA Varanasi, and all UP municipal corporations.",
    "keyProvisions": [
      "Core FAR 1.50 to 2.50 with Purchasable FAR (up to 33% additional) on designated master plan roads",
      "Standard residential plotted ground coverage capped at 65% to 75% based on plot size",
      "Mandatory dual staircases and peripheral 6.0m fire driveways for buildings exceeding 15 meters height",
      "Purchasable FAR fees credited to city urban infrastructure development fund"
    ]
  },
  {
    "id": "DOC-STATE-KL-KMBR-2019",
    "title": "Kerala Municipality Building Rules 2019 (KMBR-2019) / KPBR-2019",
    "shortTitle": "Kerala KMBR 2019",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Kerala",
      "stateId": "kerala"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2019",
    "version": "S.R.O. No. 777/2019 (Amended 2022)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "rainwater_harvesting"
    ],
    "source": {
      "authority": "Local Self Government Department (LSGD), Government of Kerala",
      "officialUrl": "https://lsgkerala.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2019-11-08",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statutory building code applicable across all Municipal Corporations (Kochi, Thiruvananthapuram, Kozhikode) and Municipalities in the State of Kerala.",
    "keyProvisions": [
      "Maximum permissible FAR 2.75 to 4.0 for commercial and multi-family residential against premium charges",
      "Setbacks strictly governed by access road width and building height with minimum 3.0m front yard",
      "Mandatory rainwater storage tank (minimum 25 litres per sq.m of roof area) for all new structures",
      "Special environmental coastal and canal setback restrictions along backwaters and estuaries"
    ]
  },
  {
    "id": "DOC-STATE-MP-BHUMI-2012",
    "title": "Madhya Pradesh Bhumi Vikas Niyam 2012 (Amended 2021)",
    "shortTitle": "MP Bhumi Vikas Niyam 2012",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Madhya Pradesh",
      "stateId": "madhya_pradesh"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2012",
    "version": "Amended 2021",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Directorate of Town and Country Planning (DTCP), Government of Madhya Pradesh",
      "officialUrl": "https://mptownplan.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2012-06-01",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs building permissions and land development across Bhopal, Indore, Jabalpur, Gwalior, and all urban local bodies in Madhya Pradesh.",
    "keyProvisions": [
      "Base FAR 1.25 to 2.50 with TDR and Premium FAR loading along major Master Plan transit corridors",
      "Ground coverage limits: 60% for residential plotted, 40% for group housing, 50% for commercial",
      "Mandatory colony open space reservation (10% to 15%) for land layouts exceeding 1 hectare",
      "Online ABPAS (Automated Building Plan Approval System) scrutiny for architectural drawings"
    ]
  },
  {
    "id": "DOC-STATE-WB-WBR-2007",
    "title": "West Bengal Municipal (Building) Rules 2007 (Amended 2021)",
    "shortTitle": "West Bengal Building Rules",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "West Bengal",
      "stateId": "west_bengal"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2007",
    "version": "Amended 2021",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking"
    ],
    "source": {
      "authority": "Urban Development & Municipal Affairs Department, West Bengal",
      "officialUrl": "https://wburbandev.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2007-02-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statutory building rules applicable to all Municipalities in West Bengal, harmonized with Kolkata Municipal Corporation (KMC) building rules.",
    "keyProvisions": [
      "Rule 51: Permissible FAR strictly linked to means of access road width (FAR 1.50 for roads 3.5m-7.0m, up to 3.0+ for roads > 15m)",
      "Rule 52: Mandatory open spaces (Front, Rear, Sides) based on building height brackets",
      "Mandatory car parking based on carpet area tenements (1 car per 75 sq.m carpet area for residential)",
      "Mandatory fire safety clearance from West Bengal Fire & Emergency Services for buildings > 14.5m height"
    ]
  },
  {
    "id": "DOC-STATE-PB-PBBL-2018",
    "title": "Punjab Municipal Building Bye-Laws 2018",
    "shortTitle": "Punjab Building Bye-Laws 2018",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Punjab",
      "stateId": "punjab"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2018",
    "version": "Amended 2022",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Department of Local Government & PUDA, Government of Punjab",
      "officialUrl": "https://lgpunjab.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2018-07-27",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs building sanctions across Ludhiana, Amritsar, Jalandhar, SAS Nagar (Mohali), Patiala, and all municipal councils in Punjab.",
    "keyProvisions": [
      "Clause 3.12: Standard FAR 1.50 to 2.0 with unlimited Purchasable FAR on designated 60ft+ Master Plan roads",
      "Clause 3.14: Stilt parking floor mandatory for multi-storey residential plotted constructions",
      "Basement permissible for parking and storage up to boundary setbacks",
      "Online e-Naksha single-window portal approval for building drawings and completion certificates"
    ]
  },
  {
    "id": "DOC-STATE-AP-APBR-2017",
    "title": "Andhra Pradesh Building Rules 2017 (G.O. Ms. No. 119 Amended)",
    "shortTitle": "Andhra Pradesh Building Rules 2017",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Andhra Pradesh",
      "stateId": "andhra_pradesh"
    },
    "documentType": "unified_dcr",
    "documentPriority": "primary",
    "year": "2017",
    "version": "G.O. Ms. No. 119 (Amended 2022)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "fire_safety"
    ],
    "source": {
      "authority": "Directorate of Town and Country Planning (DTCP), Andhra Pradesh",
      "officialUrl": "https://dtcp.ap.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2017-03-28",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Unified building rules governing Visakhapatnam (VMRDA), Vijayawada (CRDA), Tirupati (TUDA), and all ULBs across Andhra Pradesh.",
    "keyProvisions": [
      "Rule 6: Base FAR and unlimited TDR utilization potential along designated arterial transit corridors",
      "Rule 7: Mandatory all-around setbacks and peripheral fire access driveways for buildings > 15m height",
      "Rule 18: Online AP-DPMS (Development Permission Management System) workflow with automated DCR scrutiny",
      "Rule 22: Mandatory solar water heating and rooftop solar PV generation for commercial complexes"
    ]
  },
  {
    "id": "DOC-STATE-GA-GLDBCR-2010",
    "title": "Goa Land Development and Building Construction Regulations 2010 (Amended 2022)",
    "shortTitle": "Goa Building Regulations 2010",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Goa",
      "stateId": "goa"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2010",
    "version": "Amended 2022",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "special_restriction",
      "zoning"
    ],
    "source": {
      "authority": "Town and Country Planning (TCP) Department, Government of Goa",
      "officialUrl": "https://tcp.goa.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2010-09-16",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "State development regulations governing North Goa (Panaji, Mapusa) and South Goa (Margao, Vasco) planning areas.",
    "keyProvisions": [
      "Regulation 6.2: Settlement Zone (S1/S2) FAR strictly capped at 0.60 to 0.80 to preserve low-density architectural character",
      "Regulation 7.1: Maximum permissible building height strictly limited to 9m (Ground + 1) or 11.5m in sensitive coastal zones",
      "Mandatory Portuguese traditional tiled sloped roof aesthetic and heritage village buffer compliance",
      "Prohibition of building development on slopes steeper than 1:4 (25% gradient)"
    ]
  },
  {
    "id": "DOC-STATE-OD-ODBR-2020",
    "title": "Odisha Development Authorities (Planning and Building Standards) Rules 2020",
    "shortTitle": "Odisha ODBR 2020",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Odisha",
      "stateId": "odisha"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2020",
    "version": "Amended 2022",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Housing & Urban Development Department, Government of Odisha",
      "officialUrl": "https://urban.odisha.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2020-07-10",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Unified planning and building standards for Bhubaneswar (BDA), Cuttack (CDA), Puri (PKDA), and all development authorities in Odisha.",
    "keyProvisions": [
      "Base FAR 1.50 to 2.75 with purchasable FAR up to 4.0 in TOD transit zones along Janpath/Metro corridors",
      "Mandatory setback formulas based on plot depth, road width, and proposed building height",
      "Cyclone-resilient structural design certification mandatory for coastal districts of Odisha",
      "Single-window approval through the Sujog online portal"
    ]
  },
  {
    "id": "DOC-STATE-CH-CBR-2017",
    "title": "Chandigarh Building Rules (Urban) 2017",
    "shortTitle": "Chandigarh Building Rules 2017",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Chandigarh (UT)",
      "stateId": "chandigarh"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2017",
    "version": "Amended 2021",
    "status": "verified",
    "categories": [
      "ground_coverage",
      "far_fsi",
      "height_floors",
      "setbacks",
      "special_restriction",
      "zoning"
    ],
    "source": {
      "authority": "Department of Urban Planning, Chandigarh Administration",
      "officialUrl": "https://urbanplanning.chd.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2017-07-25",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs all building construction across Sectors 1 through 60 in Chandigarh, preserving the original Corbusian master plan and frame controls.",
    "keyProvisions": [
      "Strict architectural frame controls: Fixed facade lines, standardized boundary walls, and material palettes",
      "Maximum permissible height capped at 35 ft (G+2) for residential sectors 1 to 30",
      "Mandatory front and rear courtyard setbacks with zero tolerance for deviations or unauthorized floor additions",
      "Compulsory solar rooftop installation for all plots measuring 500 sq.yd or more"
    ]
  },
  {
    "id": "DOC-STATE-UK-UBBL-2020",
    "title": "Uttarakhand Building Bye-Laws and Regulations 2020",
    "shortTitle": "Uttarakhand Building Bye-Laws 2020",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Uttarakhand",
      "stateId": "uttaranchal"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2020",
    "version": "Amended 2022",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "structural_safety",
      "special_restriction"
    ],
    "source": {
      "authority": "Housing and Urban Development Department, Uttarakhand / MDDA",
      "officialUrl": "https://udh.uk.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2020-09-02",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Special hill and plain area building regulations governing Dehradun (MDDA), Haridwar (HRDA), Nainital, and Mussoorie.",
    "keyProvisions": [
      "Plain areas (Dehradun/Haridwar): Base FAR 1.50 to 2.0; Hill areas (Mussoorie/Nainital): FAR capped at 1.0 to 1.20",
      "Strict hill slope construction ban on slopes > 30 degrees to prevent landslides and soil erosion",
      "Seismic Zone IV/V ductile detailing mandatory for all multi-storey building structures",
      "Traditional hill architecture aesthetic features (sloped roofs, stone cladding) encouraged"
    ]
  },
  {
    "id": "DOC-STATE-AS-ABR-2014",
    "title": "Assam Notified Urban Areas (Building) Rules 2014 & GMDA Building Byelaws",
    "shortTitle": "Assam Building Rules 2014",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Assam",
      "stateId": "assam"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2014",
    "version": "Amended 2020",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "structural_safety",
      "fire_safety"
    ],
    "source": {
      "authority": "Department of Housing and Urban Affairs & GMDA, Government of Assam",
      "officialUrl": "https://gmda.assam.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2014-08-01",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs building sanctions across Guwahati (GMDA/GMC), Dibrugarh, Silchar, and all urban areas in Assam.",
    "keyProvisions": [
      "Seismic Zone V structural safety compliance: Mandatory ductile detailing and dynamic analysis for buildings > 12m height",
      "Standard FAR 1.50 to 2.50 linked to road width (minimum 6.0m road required for any multi-storey permit)",
      "Mandatory hill cutting NOC from GMDA/Forest department for construction on hilly terrains",
      "Rainwater harvesting and on-site drainage connectivity mandatory to mitigate urban flash flooding"
    ]
  },
  {
    "id": "DOC-STATE-JH-JBBL-2016",
    "title": "Jharkhand Municipal Building Bye-Laws 2016",
    "shortTitle": "Jharkhand Building Bye-Laws 2016",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Jharkhand",
      "stateId": "jharkhand"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2016",
    "version": "Amended 2021",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Urban Development & Housing Department (UDHD), Government of Jharkhand",
      "officialUrl": "https://udhd.jharkhand.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2016-05-18",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Unified building rules governing Ranchi (RMC/RRDA), Jamshedpur, Dhanbad, and all urban local bodies in Jharkhand.",
    "keyProvisions": [
      "Base FAR 1.50 to 2.50 with purchasable FAR up to 3.0 on 18m+ wide roads",
      "Mandatory stilt parking floor for residential complexes on plots > 300 sq.m",
      "Online single-window building sanction platform with GIS land parcel verification",
      "Mandatory rainwater harvesting recharge pits for all plots > 150 sq.m"
    ]
  },
  {
    "id": "DOC-STATE-CG-CGBV-2019",
    "title": "Chhattisgarh Bhumi Vikas Niyam & Nagar Tatha Gram Nivesh Rules",
    "shortTitle": "Chhattisgarh Bhumi Vikas Niyam",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Chhattisgarh",
      "stateId": "chhattisgarh"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2019",
    "version": "Amended 2021",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking"
    ],
    "source": {
      "authority": "Town & Country Planning (TCP) Department, Government of Chhattisgarh",
      "officialUrl": "https://tcp.cg.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2019-10-14",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs building construction across Raipur (RDA/Nava Raipur), Bilaspur, Durg-Bhilai, and all urban bodies in Chhattisgarh.",
    "keyProvisions": [
      "Base FAR 1.25 to 2.0 with premium FAR up to 3.0 along Nava Raipur smart city corridors",
      "Standard ground coverage: 50% for plotted residential, 35% for high-rise group housing",
      "Mandatory 10% open green space reservation in colony layouts exceeding 0.5 hectare",
      "Compulsory on-site rainwater percolation and rooftop solar integration"
    ]
  },
  {
    "id": "DOC-STATE-HP-HPTCP-2014",
    "title": "Himachal Pradesh Town and Country Planning Rules 2014 (Amended 2021)",
    "shortTitle": "HP Town & Country Planning Rules",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Himachal Pradesh",
      "stateId": "himachal_pradesh"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2014",
    "version": "Amended 2021",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "structural_safety",
      "special_restriction"
    ],
    "source": {
      "authority": "Town and Country Planning Department, Himachal Pradesh",
      "officialUrl": "https://tcp.hp.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2014-11-28",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Special mountain terrain building bye-laws regulating Shimla, Dharamshala, Manali, Solan, and planning areas across Himachal Pradesh.",
    "keyProvisions": [
      "Maximum building height strictly capped at 3 storeys + attic (11.5m to 14.0m) in core planning areas",
      "FAR capped between 1.0 and 1.50 with strict prohibitions on slopes steeper than 45 degrees",
      "Seismic Zone IV and V structural ductile design mandatory for all sanctioned buildings",
      "Green belt no-construction zones strictly enforced in Shimla municipal limits"
    ]
  },
  {
    "id": "DOC-STATE-BR-BBBL-2014",
    "title": "Bihar Building Bye-Laws 2014 (Amended up to 2022)",
    "shortTitle": "Bihar Building Bye-Laws 2014",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Bihar",
      "stateId": "bihar"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2014",
    "version": "Amended 2022",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Urban Development and Housing Department (UDHD), Government of Bihar",
      "officialUrl": "https://urban.bih.nic.in",
      "documentType": "Gazette",
      "publishedDate": "2014-12-05",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs building permissions across Patna (PMC/PRDA), Gaya, Bhagalpur, Muzaffarpur, and all municipal corporations in Bihar.",
    "keyProvisions": [
      "Base FAR 1.50 to 2.50 depending on road width (minimum 20ft road required for G+3 sanction)",
      "Mandatory stilt parking floor for residential multi-family buildings on plots > 250 sq.m",
      "Seismic Zone IV structural safety certificate mandatory for all multi-storey drawings",
      "Online building plan approval system implemented across all municipal corporations"
    ]
  },
  {
    "id": "DOC-STATE-JK-JKUBBL-2021",
    "title": "Jammu and Kashmir Unified Building Bye-Laws 2021",
    "shortTitle": "J&K Unified Building Bye-Laws 2021",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Jammu and Kashmir (UT)",
      "stateId": "jammu_and_kashmir"
    },
    "documentType": "unified_dcr",
    "documentPriority": "primary",
    "year": "2021",
    "version": "S.O. 128 (2021)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "structural_safety",
      "special_restriction"
    ],
    "source": {
      "authority": "Housing & Urban Development Department, J&K Government",
      "officialUrl": "https://jkhudd.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2021-04-09",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Unified building bye-laws regulating Srinagar (SMC/SDA), Jammu (JMC/JDA), and all municipal bodies across J&K UT.",
    "keyProvisions": [
      "Seismic Zone IV and V high-risk compliance: Mandatory structural engineering scrutiny and soil bearing tests",
      "Base FAR 1.50 to 2.0 with strict sloped roof design standards to handle heavy winter snow loads",
      "Heritage and lake buffer conservation norms along Dal Lake, Nigeen Lake, and Jhelum River banks",
      "Fast-track online single-window approval system for commercial and residential plans"
    ]
  },
  {
    "id": "DOC-STATE-PY-PYDCR-2012",
    "title": "Puducherry Planning Authority Comprehensive Development Control Rules",
    "shortTitle": "Puducherry Building Rules",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Puducherry (UT)",
      "stateId": "puducherry"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2012",
    "version": "Amended 2020",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "special_restriction"
    ],
    "source": {
      "authority": "Town and Country Planning Department (TCPD), Government of Puducherry",
      "officialUrl": "https://tcpd.py.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2012-03-29",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs building sanctions across Puducherry, Karaikal, Mahe, and Yanam planning areas.",
    "keyProvisions": [
      "French Heritage Boulevard zone architectural control: Strict height limitation (maximum 11m/G+2) and classical facade elements",
      "Standard FAR 1.50 to 2.20 in non-heritage suburban development zones",
      "Coastal Regulation Zone (CRZ) setbacks along the Bay of Bengal coastline strictly enforced",
      "Mandatory rainwater harvesting and greywater recycling systems for commercial properties"
    ]
  }
];

export const STATE_RULES: ByeLawRule[] = [
  {
    "id": "L2-MAHA-UDCPR-FAR-01",
    "tier": "state",
    "level": 2,
    "levelName": "Level 2: State Unified Code (UDCPR)",
    "jurisdiction": "Maharashtra (Excl. Mumbai City)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Maharashtra",
      "stateId": "maharashtra"
    },
    "category": "far_fsi",
    "categoryName": "Floor Space Index (FSI/FAR)",
    "title": "Maharashtra UDCPR Road-Width Linked FSI & Premium/TDR Potential",
    "clause": "Regulation 6.1 & Table 6-A",
    "sourceDoc": "Maharashtra Unified Development Control and Promotion Regulations (UDCPR 2020)",
    "sourceUrl": "https://urban.maharashtra.gov.in",
    "documentYear": "2020",
    "version": "UDCPR 2020",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Calculates the maximum permissible building potential by combining Base FSI, Premium FSI, and Transferable Development Rights (TDR) strictly determined by access road width.",
    "appliesTo": {
      "minPlotArea": 0,
      "minRoadWidth": 9.0
    },
    "parameters": {
      "baseFsiRoad9m": 1.1,
      "maxPotentialRoad9m": 1.7,
      "baseFsiRoad12m": 1.1,
      "maxPotentialRoad12m": 2.1,
      "baseFsiRoad15m": 1.1,
      "maxPotentialRoad15m": 2.4,
      "baseFsiRoad18m": 1.1,
      "maxPotentialRoad18m": 2.7,
      "baseFsiRoad24m": 1.1,
      "maxPotentialRoad24m": 3.0,
      "ancillaryFsiResidentialPct": 60,
      "ancillaryFsiCommercialPct": 80
    },
    "detailedRequirements": [
      "Road width < 9.0m: Maximum basic FSI 1.10; No Premium FSI or TDR loading permitted",
      "Road width 9.0m to < 12.0m: Basic FSI 1.10 + Premium FSI 0.30 + TDR 0.30 = Max Potential 1.70",
      "Road width 12.0m to < 15.0m: Basic FSI 1.10 + Premium FSI 0.50 + TDR 0.50 = Max Potential 2.10",
      "Road width 15.0m to < 18.0m: Basic FSI 1.10 + Premium FSI 0.65 + TDR 0.65 = Max Potential 2.40",
      "Road width 18.0m to < 24.0m: Basic FSI 1.10 + Premium FSI 0.80 + TDR 0.80 = Max Potential 2.70",
      "Road width 24.0m+: Basic FSI 1.10 + Premium FSI 0.95 + TDR 0.95 = Max Potential 3.00",
      "Ancillary FSI up to 60% of basic FSI for residential on payment of premium at 35% of ASR rate"
    ]
  },
  {
    "id": "L2-MAHA-UDCPR-AMENITY-01",
    "tier": "state",
    "level": 2,
    "levelName": "Level 2: State Unified Code (UDCPR)",
    "jurisdiction": "Maharashtra (Excl. Mumbai City)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Maharashtra",
      "stateId": "maharashtra"
    },
    "category": "amenity_space",
    "categoryName": "Amenity Space & Open Space Reservation",
    "title": "Maharashtra UDCPR Mandatory Amenity Space & Open Space Reservation",
    "clause": "Regulation 3.4 & Regulation 3.5",
    "sourceDoc": "Maharashtra Unified Development Control and Promotion Regulations (UDCPR 2020)",
    "sourceUrl": "https://urban.maharashtra.gov.in",
    "documentYear": "2020",
    "version": "UDCPR 2020",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandatory surrender of land or construction of civic amenities for large layout developments exceeding statutory plot thresholds.",
    "parameters": {
      "openSpaceThresholdSqM": 4000,
      "openSpacePct": 10,
      "amenitySpaceThresholdSqM": 20000,
      "amenitySpacePct": 5
    },
    "detailedRequirements": [
      "Plot area >= 4,000 sq.m: Minimum 10% Recreational Open Space (ROS) must be physically provided on ground",
      "Plot area >= 20,000 sq.m (2 Hectares): Minimum 5% Amenity Space must be surrendered to the local authority free of cost",
      "In lieu of physical surrender in specific zones, amenity premium payment may be permitted by Municipal Commissioner"
    ]
  },
  {
    "id": "L2-DELHI-UBBL-FAR-01",
    "tier": "state",
    "level": 2,
    "levelName": "Level 2: State Unified Code (Delhi UBBL)",
    "jurisdiction": "Delhi (NCT)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Delhi (NCT)",
      "stateId": "delhi"
    },
    "category": "far_fsi",
    "categoryName": "Floor Area Ratio & Ground Coverage",
    "title": "Delhi UBBL-2016 Residential Plotted FAR, Ground Coverage & Setbacks",
    "clause": "Chapter 7, Clause 7.4.1 & Table 7.1",
    "sourceDoc": "Unified Building Bye-Laws for Delhi 2016 (UBBL-2016)",
    "sourceUrl": "https://dda.gov.in",
    "documentYear": "2016",
    "version": "UBBL-2016",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Statutory Floor Area Ratio, Ground Coverage, Height and Setback slabs for residential plotted developments in Delhi.",
    "parameters": {
      "farPlotUpTo50SqM": 350,
      "groundCoverageUpTo50SqM": 90,
      "farPlot50To100SqM": 350,
      "groundCoverage50To100SqM": 90,
      "farPlot100To250SqM": 300,
      "groundCoverage100To250SqM": 75,
      "farPlot250To750SqM": 225,
      "groundCoverage250To750SqM": 50,
      "farPlot750To1000SqM": 200,
      "groundCoverage750To1000SqM": 50,
      "maxHeightM": 15.0,
      "maxHeightWithStiltM": 17.5
    },
    "detailedRequirements": [
      "Plots <= 100 sq.m: Max Ground Coverage 90%, Max FAR 350, Height 15m (17.5m with Stilt)",
      "Plots 100 to 250 sq.m: Max Ground Coverage 75%, Max FAR 300, Height 15m (17.5m with Stilt)",
      "Plots 250 to 750 sq.m: Max Ground Coverage 50%, Max FAR 225, Height 15m (17.5m with Stilt)",
      "Plots > 750 sq.m: Max Ground Coverage 50%, Max FAR 200, Height 15m (17.5m with Stilt)",
      "Front setback: 3.0m for 100-250 sqm plots; 4.5m for 250-500 sqm; 6.0m for > 500 sqm plots"
    ]
  },
  {
    "id": "L2-DELHI-UBBL-STILT-01",
    "tier": "state",
    "level": 2,
    "levelName": "Level 2: State Unified Code (Delhi UBBL)",
    "jurisdiction": "Delhi (NCT)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Delhi (NCT)",
      "stateId": "delhi"
    },
    "category": "stilt_parking",
    "categoryName": "Stilt Parking & Height Exemption",
    "title": "Delhi UBBL-2016 Non-FAR Stilt Parking Exemption & Height Norms",
    "clause": "Chapter 7, Clause 7.14 & Clause 7.15",
    "sourceDoc": "Unified Building Bye-Laws for Delhi 2016 (UBBL-2016)",
    "sourceUrl": "https://dda.gov.in",
    "documentYear": "2016",
    "version": "UBBL-2016",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Exempts ground-level stilt parking from FAR and allows additional 2.5m building height for multi-dwelling residential buildings.",
    "parameters": {
      "stiltHeightMinM": 2.4,
      "stiltHeightMaxM": 2.75,
      "exemptFromFar": true,
      "additionalBuildingHeightM": 2.5
    },
    "detailedRequirements": [
      "Stilt parking floor is mandatory for residential plotted developments > 100 sq.m where independent floors are proposed",
      "Clear height of stilt floor must be minimum 2.4m and maximum 2.75m from finished floor to soffit of beam",
      "Stilt area must be exclusively used for car parking; enclosing stilt into habitable rooms leads to cancellation of sanction",
      "Overall permissible building height increases from 15.0m to 17.5m when non-habitable stilt parking is provided"
    ]
  },
  {
    "id": "L2-HR-HBC-FAR-01",
    "tier": "state",
    "level": 2,
    "levelName": "Level 2: State Unified Code (Haryana HBC)",
    "jurisdiction": "Haryana (DTCP / HSVP / MCG)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Haryana",
      "stateId": "haryana"
    },
    "category": "far_fsi",
    "categoryName": "Core & Purchasable FAR",
    "title": "Haryana Building Code 2017 Core FAR & Purchasable FAR Slabs",
    "clause": "Clause 6.1 & Table 6.1",
    "sourceDoc": "Haryana Building Code 2017 (HBC-2017 Amended up to 2023)",
    "sourceUrl": "https://tcpharyana.gov.in",
    "documentYear": "2017",
    "version": "HBC-2017",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Prescribes core baseline FAR and purchasable FAR (PFAR) slabs for residential plotted sectors across Gurugram, Faridabad, and Haryana.",
    "parameters": {
      "coreFarPlotted": 1.45,
      "purchasableFarPlotted": 1.19,
      "maxAchievableFarPlotted": 2.64,
      "maxGroundCoveragePlottedPct": 66.0,
      "maxHeightPlottedStiltM": 16.5
    },
    "detailedRequirements": [
      "Residential Plotted Core FAR: 1.45 (Max Ground Coverage: 66.0%)",
      "Purchasable FAR (PFAR): Up to 1.19 additional FAR on payment of prescribed government rates",
      "Maximum Total Achievable FAR: 2.64 on access roads measuring 12 meters or wider",
      "Maximum building height: 16.5m (Stilt + 4 Floors configuration)"
    ]
  },
  {
    "id": "L2-TN-TNCDBR-FSI-01",
    "tier": "state",
    "level": 2,
    "levelName": "Level 2: State Unified Code (TNCDBR)",
    "jurisdiction": "Tamil Nadu (CMDA / DTCP)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Tamil Nadu",
      "stateId": "tamil_nadu"
    },
    "category": "far_fsi",
    "categoryName": "FSI & Road Width Matrix",
    "title": "Tamil Nadu TNCDBR-2019 Non-High Rise & High Rise FSI Road Matrix",
    "clause": "Rule 35 & Rule 39",
    "sourceDoc": "Tamil Nadu Combined Development and Building Rules 2019 (TNCDBR-2019)",
    "sourceUrl": "https://cmdachennai.gov.in",
    "documentYear": "2019",
    "version": "TNCDBR-2019",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandatory FSI entitlements linked to road width and building height classifications across Chennai and Tamil Nadu.",
    "parameters": {
      "baseFsiRoad9m": 1.5,
      "premiumFsiRoad9mPct": 0,
      "baseFsiRoad12m": 2.0,
      "premiumFsiRoad12mPct": 50,
      "baseFsiRoad18m": 2.5,
      "premiumFsiRoad18mPct": 50,
      "highRiseThresholdM": 18.3
    },
    "detailedRequirements": [
      "Road width 9.0m to 12.0m: Base FSI 1.50 (Non-High Rise up to 18.3m height / 16 dwelling units)",
      "Road width 12.0m to 18.0m: Base FSI 2.00 + 50% Premium FSI potential = Max FSI 3.00",
      "Road width 18.0m+: Base FSI 2.50 + 50% Premium FSI potential = Max FSI 3.75 (Multi-Storey/High-Rise)",
      "Premium FSI charge: 50% of the Guideline Value (GLV) for the additional square footage"
    ]
  },
  {
    "id": "L2-TG-TGBPASS-SETBACK-01",
    "tier": "state",
    "level": 2,
    "levelName": "Level 2: State Unified Code (TG-bPASS)",
    "jurisdiction": "Telangana (GHMC / HMDA)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Telangana",
      "stateId": "telangana"
    },
    "category": "setbacks",
    "categoryName": "All-Around Setbacks & Open Spaces",
    "title": "Telangana G.O. Ms. No. 168 All-Around Open Spaces & Height Linked Setbacks",
    "clause": "Rule 7 & Table III",
    "sourceDoc": "Telangana State Building Rules & TG-bPASS Act 2020 (G.O. Ms. No. 168 & 7)",
    "sourceUrl": "https://tgbpass.telangana.gov.in",
    "documentYear": "2020",
    "version": "G.O. Ms. No. 168",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandates open spaces and all-around setbacks based on proposed building height and plot size with Free FAR policy.",
    "parameters": {
      "setbackHeightUpTo10mM": 2.0,
      "setbackHeight10To15mM": 3.0,
      "setbackHeight15To18mM": 4.0,
      "setbackHeight18To21mM": 5.0,
      "highRiseDrivewayM": 6.0
    },
    "detailedRequirements": [
      "Building height up to 10m: Minimum 2.0m all-around peripheral setbacks",
      "Building height 10m to 15m: Minimum 3.0m all-around setbacks",
      "Building height 15m to 18m: Minimum 4.0m all-around setbacks",
      "Building height > 18m (High-Rise): Minimum 6.0m to 9.0m clear driveway for fire tender movement",
      "No FAR cap for residential non-high-rise; built-up area is restricted solely by setbacks and road width"
    ]
  },
  {
    "id": "L2-KA-KMCR-FAR-01",
    "tier": "state",
    "level": 2,
    "levelName": "Level 2: State Unified Code (Karnataka KMC)",
    "jurisdiction": "Karnataka (BBMP / KMC)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Karnataka",
      "stateId": "karnataka"
    },
    "category": "far_fsi",
    "categoryName": "Standard FAR & Premium FAR",
    "title": "Karnataka Municipal Corporations Standard FAR & Road Width Multipliers",
    "clause": "Bye-law 14.1 & Table 4",
    "sourceDoc": "Karnataka Municipal Corporations (Building) Bye-Laws & Planning Regulations",
    "sourceUrl": "https://udd.karnataka.gov.in",
    "documentYear": "2020",
    "version": "KMC 2020",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Governs permissible FAR in Bengaluru and Karnataka cities linked to plot area and road width.",
    "parameters": {
      "farRoadUnder9m": 1.5,
      "farRoad9To12m": 1.75,
      "farRoad12To15m": 2.25,
      "farRoad15To24m": 2.5,
      "farRoadAbove24m": 3.25
    },
    "detailedRequirements": [
      "Road width < 9m: Maximum FAR 1.50 (Residential); Premium FAR not permitted",
      "Road width 9m to 12m: Base FAR 1.75 + Premium FAR up to 0.60 = Total 2.35",
      "Road width 12m to 15m: Base FAR 2.25 + Premium FAR up to 0.75 = Total 3.00",
      "Road width > 24m: Base FAR 3.25 + Premium FAR up to 1.00 = Total 4.25 (Intense Development Zone)"
    ]
  },
  {
    "id": "L2-GJ-CGDCR-FSI-01",
    "tier": "state",
    "level": 2,
    "levelName": "Level 2: State Unified Code (Gujarat CGDCR)",
    "jurisdiction": "Gujarat (AUDA / AMC / SUDA / SMC)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Gujarat",
      "stateId": "gujarat"
    },
    "category": "far_fsi",
    "categoryName": "Base FSI & Chargeable FSI",
    "title": "Gujarat CGDCR Base FSI & Chargeable FSI on D-1/D-2 Category Roads",
    "clause": "Table 6.2 & Regulation 6.4",
    "sourceDoc": "Comprehensive General Development Control Regulations Gujarat (CGDCR-2017)",
    "sourceUrl": "https://udd.gujarat.gov.in",
    "documentYear": "2017",
    "version": "CGDCR-2017",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Governs base FSI and chargeable premium FSI in Ahmedabad, Surat, Vadodara, and Rajkot.",
    "parameters": {
      "baseFsiD1": 1.8,
      "chargeableFsiD1Road18m": 0.9,
      "chargeableFsiD1Road36m": 2.2,
      "maxFsiTodCorridor": 4.0
    },
    "detailedRequirements": [
      "D1 Category (Mega Cities - Ahmedabad/Surat): Base FSI 1.80 on roads >= 12m",
      "Road width 18m: Base 1.80 + Chargeable 0.90 = Max 2.70 FSI",
      "Road width 36m+: Base 1.80 + Chargeable 2.20 = Max 4.00 FSI",
      "TOD Corridor (within 200m of BRTS/Metro): Maximum permissible FSI 4.00"
    ]
  },
  {
    "id": "L2-RJ-BBR-FAR-01",
    "tier": "state",
    "level": 2,
    "levelName": "Level 2: State Unified Code (Rajasthan BBR)",
    "jurisdiction": "Rajasthan (JDA / UITs / Municipalities)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Rajasthan",
      "stateId": "rajasthan"
    },
    "category": "far_fsi",
    "categoryName": "Standard FAR & Setbacks",
    "title": "Rajasthan Model Building Bye-Laws 2020 Standard FAR & Setback Slabs",
    "clause": "Clause 8.1 & Table 8.1",
    "sourceDoc": "Rajasthan Unified Model Building Regulations 2020 (Amended 2023)",
    "sourceUrl": "https://urban.rajasthan.gov.in",
    "documentYear": "2020",
    "version": "BBR-2020",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Prescribes standard FAR, betterments, and setback formulas for residential plots in Jaipur, Jodhpur, and Rajasthan.",
    "parameters": {
      "standardFarPlotted": 1.33,
      "bettermentFarPlotted": 0.67,
      "maxAchievableFarPlotted": 2.0,
      "maxGroundCoveragePct": 65.0,
      "maxHeightPlottedM": 15.0
    },
    "detailedRequirements": [
      "Plots <= 250 sq.m on 9m-12m road: Standard FAR 1.33 + Betterment FAR 0.67 = Max FAR 2.00",
      "Ground coverage capped at 65% for plotted residential (50% for commercial)",
      "Setbacks: Front 3.0m to 4.5m; Rear 1.5m to 3.0m; Side setbacks 1.5m for plots > 200 sqm",
      "Stilt parking allowed without FAR counting up to 2.4m height; basements permissible up to side setbacks"
    ]
  },
  {
    "id": "L2-UP-AWAS-FAR-01",
    "tier": "state",
    "level": 2,
    "levelName": "Level 2: State Unified Code (UP Awas Bandhu)",
    "jurisdiction": "Uttar Pradesh (LDA / GDA / KDA)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Uttar Pradesh",
      "stateId": "uttar_pradesh"
    },
    "category": "far_fsi",
    "categoryName": "Standard & Purchasable FAR",
    "title": "Uttar Pradesh Awas Bandhu Standard FAR, Purchasable FAR & Setbacks",
    "clause": "Clause 3.1 & Table 3.2",
    "sourceDoc": "Uttar Pradesh Building Construction and Development Bye-Laws (Awas Bandhu 2008 Amended 2021)",
    "sourceUrl": "https://awas.up.nic.in",
    "documentYear": "2008",
    "version": "Amended 2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Governs standard FAR, purchasable FAR, and setback formulas for development authorities across Uttar Pradesh.",
    "parameters": {
      "standardFarResidential": 1.5,
      "purchasableFarResidentialPct": 33,
      "maxFarResidential": 2.0,
      "maxGroundCoveragePlottedPct": 65.0
    },
    "detailedRequirements": [
      "Residential Plotted Core FAR: 1.50 (Max Ground Coverage: 65%)",
      "Purchasable FAR up to 33% (0.50 additional) on master plan roads >= 12 meters",
      "Group housing developments: Base FAR 2.00 to 2.50 + Purchasable FAR up to 0.75 = Max 3.25",
      "Purchasable FAR fee calculated as 50% of the circle rate for the additional covered area"
    ]
  },
  {
    "id": "L2-KL-KMBR-FAR-01",
    "tier": "state",
    "level": 2,
    "levelName": "Level 2: State Unified Code (Kerala KMBR)",
    "jurisdiction": "Kerala (Kochi / Thiruvananthapuram)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Kerala",
      "stateId": "kerala"
    },
    "category": "far_fsi",
    "categoryName": "Maximum FAR & Access Road Thresholds",
    "title": "Kerala Municipality Building Rules Maximum FAR & Access Road Thresholds",
    "clause": "Rule 34 & Table 6",
    "sourceDoc": "Kerala Municipality Building Rules 2019 (KMBR-2019) / KPBR-2019",
    "sourceUrl": "https://lsgkerala.gov.in",
    "documentYear": "2019",
    "version": "KMBR-2019",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Prescribes permissible FAR and premium FAR slabs for residential and commercial occupancies in Kerala.",
    "parameters": {
      "maxFarResidential": 3.0,
      "maxFarCommercial": 2.5,
      "minRoadWidthHighRiseM": 7.0
    },
    "detailedRequirements": [
      "Residential base FAR 2.00; achievable up to 3.00 with additional fee for road width >= 7.0m",
      "Commercial base FAR 1.50; achievable up to 2.50 with additional fee for road width >= 10.0m",
      "Mandatory minimum 3.0m front yard setback along all municipal streets",
      "RWH storage tank mandatory with minimum 25 litres capacity per sq.m of built-up roof area"
    ]
  },
  {
    "id": "L2-MP-BHUMI-FAR-01",
    "tier": "state",
    "level": 2,
    "levelName": "Level 2: State Unified Code (MP Bhumi Vikas)",
    "jurisdiction": "Madhya Pradesh (Bhopal / Indore)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Madhya Pradesh",
      "stateId": "madhya_pradesh"
    },
    "category": "far_fsi",
    "categoryName": "FAR & Ground Coverage",
    "title": "MP Bhumi Vikas Niyam 2012 FAR, Ground Coverage & Front Margin Norms",
    "clause": "Rule 53 & Table 17",
    "sourceDoc": "Madhya Pradesh Bhumi Vikas Niyam 2012 (Amended 2021)",
    "sourceUrl": "https://mptownplan.gov.in",
    "documentYear": "2012",
    "version": "Amended 2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Regulates floor area ratio, ground coverage, and front open spaces across Bhopal, Indore, and MP.",
    "parameters": {
      "baseFarPlotted": 1.25,
      "maxFarTransitCorridor": 2.5,
      "groundCoveragePlottedPct": 60.0
    },
    "detailedRequirements": [
      "Residential plotted standard FAR 1.25 on 9m-12m roads; up to 1.75 on 18m+ roads",
      "Ground coverage capped at 60% for residential plotted and 40% for group housing",
      "High-density commercial corridors allow FAR up to 2.50 against premium infrastructure charges",
      "Mandatory automated scrutiny via ABPAS for all building permit submissions"
    ]
  },
  {
    "id": "L2-WB-WBR-FAR-01",
    "tier": "state",
    "level": 2,
    "levelName": "Level 2: State Unified Code (West Bengal Rules)",
    "jurisdiction": "West Bengal (Kolkata / Howrah)",
    "jurisdictionScope": {
      "country": "India",
      "state": "West Bengal",
      "stateId": "west_bengal"
    },
    "category": "far_fsi",
    "categoryName": "Permissible FAR by Road Width",
    "title": "West Bengal Municipal Building Rules Permissible FAR by Road Width",
    "clause": "Rule 51 & Table 2",
    "sourceDoc": "West Bengal Municipal (Building) Rules 2007 (Amended 2021)",
    "sourceUrl": "https://wburbandev.gov.in",
    "documentYear": "2007",
    "version": "Amended 2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandatory FAR and setback matrix based on abutting street width across West Bengal municipal areas.",
    "parameters": {
      "farRoadUnder7m": 1.5,
      "farRoad7To10m": 2.0,
      "farRoad10To15m": 2.5,
      "farRoadAbove15m": 3.0
    },
    "detailedRequirements": [
      "Road width 3.5m to < 7.0m: Maximum FAR 1.50, Height capped at 11.0m",
      "Road width 7.0m to < 10.0m: Maximum FAR 2.00, Height capped at 14.5m",
      "Road width 10.0m to < 15.0m: Maximum FAR 2.50, Height capped at 24.0m",
      "Road width >= 15.0m: Maximum FAR 3.00+ with WB Fire & Emergency Services NOC"
    ]
  },
  {
    "id": "L2-PB-PBBL-FAR-01",
    "tier": "state",
    "level": 2,
    "levelName": "Level 2: State Unified Code (Punjab PBBL)",
    "jurisdiction": "Punjab (Ludhiana / Mohali / Amritsar)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Punjab",
      "stateId": "punjab"
    },
    "category": "far_fsi",
    "categoryName": "Residential & Commercial FAR",
    "title": "Punjab Municipal Building Bye-Laws 2018 Residential & Commercial FAR",
    "clause": "Clause 3.12 & Table 4",
    "sourceDoc": "Punjab Municipal Building Bye-Laws 2018",
    "sourceUrl": "https://lgpunjab.gov.in",
    "documentYear": "2018",
    "version": "Amended 2022",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Regulates floor area ratio and purchasable FAR across all municipal corporations in Punjab.",
    "parameters": {
      "baseFarResidential": 1.5,
      "purchasableFarResidential": 0.5,
      "maxFarResidential": 2.0,
      "groundCoveragePct": 65.0
    },
    "detailedRequirements": [
      "Residential plotted base FAR 1.50 + Purchasable FAR 0.50 = Total 2.00",
      "Ground coverage capped at 65% for plots up to 500 sq.yd",
      "Stilt parking floor mandatory for multi-storey independent floor permits",
      "Online approval through e-Naksha portal mandatory for all ULBs"
    ]
  },
  {
    "id": "L2-AP-APBR-FAR-01",
    "tier": "state",
    "level": 2,
    "levelName": "Level 2: State Unified Code (Andhra APBR)",
    "jurisdiction": "Andhra Pradesh (Visakhapatnam / Vijayawada)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Andhra Pradesh",
      "stateId": "andhra_pradesh"
    },
    "category": "far_fsi",
    "categoryName": "Base FAR & TDR Potential",
    "title": "Andhra Pradesh Building Rules 2017 Base FAR and Transferable Development Rights",
    "clause": "Rule 6 & Table 2",
    "sourceDoc": "Andhra Pradesh Building Rules 2017 (G.O. Ms. No. 119 Amended)",
    "sourceUrl": "https://dtcp.ap.gov.in",
    "documentYear": "2017",
    "version": "G.O. Ms. No. 119",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Base FAR entitlements and TDR utilization along master plan transit roads in Andhra Pradesh.",
    "parameters": {
      "baseFarRoad12m": 2.0,
      "maxFarWithTdrRoad18m": 3.5,
      "mandatorySolarKwh": 1.0
    },
    "detailedRequirements": [
      "Base FAR 1.50 to 2.00 on 12m roads; up to 3.50 with TDR loading on 18m+ roads",
      "Mandatory all-around setbacks of 6.0m for high-rise buildings > 15m height",
      "Online AP-DPMS building permission system integration",
      "Mandatory rooftop solar generation for connected load >= 20 kW"
    ]
  },
  {
    "id": "L2-GA-GLDBCR-FAR-01",
    "tier": "state",
    "level": 2,
    "levelName": "Level 2: State Unified Code (Goa Regulations)",
    "jurisdiction": "Goa (Panaji / Margao)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Goa",
      "stateId": "goa"
    },
    "category": "far_fsi",
    "categoryName": "Maximum FAR & Settlement Zones",
    "title": "Goa Land Development & Building Regulations Maximum FAR & Settlement Zone Norms",
    "clause": "Regulation 6.2",
    "sourceDoc": "Goa Land Development and Building Construction Regulations 2010 (Amended 2022)",
    "sourceUrl": "https://tcp.goa.gov.in",
    "documentYear": "2010",
    "version": "Amended 2022",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Strict low-density FAR limits and height ceilings in Goa to preserve ecological and cultural identity.",
    "parameters": {
      "maxFarSettlementS1": 0.8,
      "maxFarSettlementS2": 0.6,
      "maxBuildingHeightM": 11.5
    },
    "detailedRequirements": [
      "Settlement Zone S1: Maximum FAR 0.80, Ground Coverage 40%",
      "Settlement Zone S2: Maximum FAR 0.60, Ground Coverage 30%",
      "Building height capped at 9.0m (G+1) in rural/heritage zones and 11.5m (G+2) in urban zones",
      "Mandatory traditional sloping roofs with Mangalore tiles or aesthetic clay tile finish"
    ]
  },
  {
    "id": "L2-OD-ODBR-FAR-01",
    "tier": "state",
    "level": 2,
    "levelName": "Level 2: State Unified Code (Odisha ODBR)",
    "jurisdiction": "Odisha (Bhubaneswar / Cuttack)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Odisha",
      "stateId": "odisha"
    },
    "category": "far_fsi",
    "categoryName": "Planning Standards & Purchasable FAR",
    "title": "Odisha ODBR Planning Standards FAR & Setback Regulations",
    "clause": "Rule 14 & Rule 27",
    "sourceDoc": "Odisha Development Authorities (Planning and Building Standards) Rules 2020",
    "sourceUrl": "https://urban.odisha.gov.in",
    "documentYear": "2020",
    "version": "ODBR 2020",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Floor area ratios, purchasable FAR, and cyclone-resilient engineering standards in Odisha.",
    "parameters": {
      "baseFarResidential": 1.5,
      "purchasableFarMax": 1.25,
      "maxAchievableFar": 2.75
    },
    "detailedRequirements": [
      "Base FAR 1.50 on 12m road; achievable up to 2.75 with purchasable FAR on 18m+ road",
      "TOD zone along Janpath corridor allows maximum FAR up to 4.00",
      "Cyclone-resilient glass facade and structural anchor certification mandatory",
      "Online approval through Sujog single-window platform"
    ]
  },
  {
    "id": "L2-CH-CBR-ZONING-01",
    "tier": "state",
    "level": 2,
    "levelName": "Level 2: State Code (Chandigarh Rules)",
    "jurisdiction": "Chandigarh (UT)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Chandigarh (UT)",
      "stateId": "chandigarh"
    },
    "category": "zoning",
    "categoryName": "Architectural Control & Frame Control",
    "title": "Chandigarh Urban Building Rules Strict Architectural Control & Frame Control",
    "clause": "Rule 5 & Annexure A",
    "sourceDoc": "Chandigarh Building Rules (Urban) 2017",
    "sourceUrl": "https://urbanplanning.chd.gov.in",
    "documentYear": "2017",
    "version": "Amended 2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Enforces strict Corbusian heritage preservation, standardized facades, and height limits in Chandigarh.",
    "parameters": {
      "maxHeightSectors1To30Ft": 35.0,
      "frameControlMandatory": true,
      "solarPvThresholdSqYd": 500
    },
    "detailedRequirements": [
      "Sectors 1 to 30: Strict frame control with standardized boundary walls, gates, and red brick/exposed concrete finish",
      "Maximum height capped at 35 ft (G+2 storeys) for residential sectors",
      "No independent floor registration or sub-division of residential plots permitted",
      "Compulsory solar rooftop installation for plots >= 500 sq.yd"
    ]
  },
  {
    "id": "L2-UK-UBBL-FAR-01",
    "tier": "state",
    "level": 2,
    "levelName": "Level 2: State Unified Code (Uttarakhand UBBL)",
    "jurisdiction": "Uttarakhand (MDDA / Plains & Hills)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Uttarakhand",
      "stateId": "uttaranchal"
    },
    "category": "far_fsi",
    "categoryName": "Hill & Plain Area FAR Slabs",
    "title": "Uttarakhand Building Bye-Laws Hill & Plain Area FAR Slabs",
    "clause": "Clause 4.1 & Clause 7.2",
    "sourceDoc": "Uttarakhand Building Bye-Laws and Regulations 2020",
    "sourceUrl": "https://udh.uk.gov.in",
    "documentYear": "2020",
    "version": "Amended 2022",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Differentiates permissible FAR and slope restrictions between plain areas (Dehradun/Haridwar) and hill zones (Mussoorie/Nainital).",
    "parameters": {
      "plainAreaMaxFar": 2.0,
      "hillAreaMaxFar": 1.2,
      "maxSlopeDegrees": 30
    },
    "detailedRequirements": [
      "Plain Areas (Dehradun, Haridwar, Roorkee): Base FAR 1.50 to 2.00 on roads >= 12m",
      "Hill Areas (Mussoorie, Nainital): Maximum FAR strictly capped at 1.00 to 1.20",
      "Construction prohibited on hill slopes steeper than 30 degrees",
      "Seismic Zone IV/V structural safety certificate mandatory"
    ]
  },
  {
    "id": "L2-AS-ABR-FAR-01",
    "tier": "state",
    "level": 2,
    "levelName": "Level 2: State Unified Code (Assam Rules)",
    "jurisdiction": "Assam (GMDA / GMC / Urban Areas)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Assam",
      "stateId": "assam"
    },
    "category": "structural_safety",
    "categoryName": "Seismic Zone V & High-Rise FAR",
    "title": "Assam Building Rules Seismic Zone V Structural & FAR Standards",
    "clause": "Rule 18 & Rule 32",
    "sourceDoc": "Assam Notified Urban Areas (Building) Rules 2014 & GMDA Building Byelaws",
    "sourceUrl": "https://gmda.assam.gov.in",
    "documentYear": "2014",
    "version": "Amended 2020",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandates Seismic Zone V ductile structural detailing, soil dynamic analysis, and road-width linked FAR across Assam.",
    "parameters": {
      "seismicZone": "V",
      "minRoadWidthHighRiseM": 6.0,
      "baseFar": 1.75
    },
    "detailedRequirements": [
      "Seismic Zone V dynamic structural analysis mandatory for all buildings taller than 12.0m",
      "Base FAR 1.50 to 2.50 linked to access road width (minimum 6.0m road required for multi-storey sanction)",
      "Mandatory hill cutting NOC from GMDA/Forest department on hilly terrains",
      "Rooftop rainwater harvesting recharge mandatory to mitigate flash floods"
    ]
  },
  {
    "id": "L2-JH-JBBL-FAR-01",
    "tier": "state",
    "level": 2,
    "levelName": "Level 2: State Unified Code (Jharkhand JBBL)",
    "jurisdiction": "Jharkhand (Ranchi / Jamshedpur / Dhanbad)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Jharkhand",
      "stateId": "jharkhand"
    },
    "category": "far_fsi",
    "categoryName": "Plotted FAR & Stilt Parking",
    "title": "Jharkhand Municipal Building Bye-Laws Standard FAR & Stilt Parking",
    "clause": "Rule 23 & Table 5",
    "sourceDoc": "Jharkhand Municipal Building Bye-Laws 2016",
    "sourceUrl": "https://udhd.jharkhand.gov.in",
    "documentYear": "2016",
    "version": "Amended 2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Standard FAR slabs, purchasable FAR up to 3.0, and mandatory stilt parking for multi-family residential plots in Jharkhand.",
    "parameters": {
      "baseFarPlotted": 1.5,
      "purchasableFarMax": 1.0,
      "stiltThresholdSqM": 300
    },
    "detailedRequirements": [
      "Base FAR 1.50 on 12m road; achievable up to 2.50 with purchasable FAR on 18m+ road",
      "Mandatory stilt parking floor for residential multi-dwelling plots > 300 sq.m",
      "Online GIS single-window building sanction platform compliance",
      "Mandatory RWH recharge structures on all plots > 150 sq.m"
    ]
  },
  {
    "id": "L2-CG-CGBV-FAR-01",
    "tier": "state",
    "level": 2,
    "levelName": "Level 2: State Unified Code (Chhattisgarh Bhumi Vikas)",
    "jurisdiction": "Chhattisgarh (Raipur / Bilaspur / Durg)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Chhattisgarh",
      "stateId": "chhattisgarh"
    },
    "category": "far_fsi",
    "categoryName": "Base & Premium FAR Standards",
    "title": "Chhattisgarh Bhumi Vikas Niyam Base & Premium FAR Standards",
    "clause": "Niyam 42 & Table 8",
    "sourceDoc": "Chhattisgarh Bhumi Vikas Niyam & Nagar Tatha Gram Nivesh Rules",
    "sourceUrl": "https://tcp.cg.gov.in",
    "documentYear": "2019",
    "version": "Amended 2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Base FAR 1.25 to 2.0 with premium FAR up to 3.0 along smart city growth corridors in Chhattisgarh.",
    "parameters": {
      "baseFarResidential": 1.25,
      "premiumFarMax": 1.5,
      "maxAchievableFar": 2.75
    },
    "detailedRequirements": [
      "Base FAR 1.25 on 12m road; up to 2.75 with premium FAR on 24m+ wide roads",
      "Standard ground coverage capped at 50% for plotted and 35% for group housing",
      "Mandatory 10% open green space in layouts > 0.5 hectare",
      "Compulsory on-site rainwater percolation structures"
    ]
  },
  {
    "id": "L2-HP-HPTCP-HEIGHT-01",
    "tier": "state",
    "level": 2,
    "levelName": "Level 2: State Code (HP TCP Rules)",
    "jurisdiction": "Himachal Pradesh (Shimla / Dharamshala / Manali)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Himachal Pradesh",
      "stateId": "himachal_pradesh"
    },
    "category": "height_floors",
    "categoryName": "Mountain Height & Storey Ceilings",
    "title": "Himachal Pradesh TCP Rules 3-Storey Height Ceiling & Attic Controls",
    "clause": "Rule 16 & Annexure G",
    "sourceDoc": "Himachal Pradesh Town and Country Planning Rules 2014 (Amended 2021)",
    "sourceUrl": "https://tcp.hp.gov.in",
    "documentYear": "2014",
    "version": "Amended 2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Strict mountain terrain regulations capping building height at 3 storeys plus attic (maximum 14m) across Himachal Pradesh.",
    "parameters": {
      "maxStoreys": 3,
      "maxBuildingHeightM": 14.0,
      "maxSlopeDegrees": 45
    },
    "detailedRequirements": [
      "Maximum permissible building height strictly capped at 3 storeys + sloping roof attic (11.5m to 14.0m)",
      "FAR strictly capped between 1.00 and 1.50",
      "Prohibition on construction on steep hill slopes exceeding 45 degrees",
      "Green belt no-construction zones strictly enforced in core planning areas"
    ]
  },
  {
    "id": "L2-BR-BBBL-FAR-01",
    "tier": "state",
    "level": 2,
    "levelName": "Level 2: State Unified Code (Bihar BBBL)",
    "jurisdiction": "Bihar (Patna / Gaya / Bhagalpur)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Bihar",
      "stateId": "bihar"
    },
    "category": "far_fsi",
    "categoryName": "Road Width Linked FAR & Stilt Norms",
    "title": "Bihar Building Bye-Laws Standard FAR & Road Width Thresholds",
    "clause": "Rule 28 & Table 6",
    "sourceDoc": "Bihar Building Bye-Laws 2014 (Amended up to 2022)",
    "sourceUrl": "https://urban.bih.nic.in",
    "documentYear": "2014",
    "version": "Amended 2022",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Base FAR 1.50 to 2.50 linked to access road width, mandatory stilt parking for multi-family homes in Bihar.",
    "parameters": {
      "baseFarResidential": 1.5,
      "maxFarRoad20m": 2.5,
      "stiltMandatoryPlotSqM": 250
    },
    "detailedRequirements": [
      "Base FAR 1.50 on 20ft-30ft roads; up to 2.50 on roads measuring 60ft or wider",
      "Mandatory stilt parking floor for residential multi-family buildings on plots > 250 sq.m",
      "Seismic Zone IV ductile detailing certification mandatory for all drawings",
      "Online single-window building sanction platform compliance"
    ]
  },
  {
    "id": "L2-JK-JKUBBL-FAR-01",
    "tier": "state",
    "level": 2,
    "levelName": "Level 2: State Unified Code (J&K Unified Bye-Laws)",
    "jurisdiction": "Jammu & Kashmir (Srinagar / Jammu)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Jammu and Kashmir (UT)",
      "stateId": "jammu_and_kashmir"
    },
    "category": "structural_safety",
    "categoryName": "Snow Load Sloped Roof & Seismic Detailing",
    "title": "J&K Unified Building Bye-Laws Snow Load Sloped Roof & FAR Standards",
    "clause": "Clause 14 & Chapter 6",
    "sourceDoc": "Jammu and Kashmir Unified Building Bye-Laws 2021",
    "sourceUrl": "https://jkhudd.gov.in",
    "documentYear": "2021",
    "version": "S.O. 128 (2021)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Prescribes seismic resilient structural design, snow load roof gradients, and lake buffer setbacks in J&K UT.",
    "parameters": {
      "seismicZone": "IV / V",
      "slopedRoofMandatory": true,
      "baseFar": 1.5
    },
    "detailedRequirements": [
      "Mandatory sloped roof design for Kashmir division to withstand winter snow accumulation",
      "Seismic Zone IV / V structural safety certificate signed by certified structural engineer",
      "Base FAR 1.50 to 2.00 linked to road width",
      "Strict lake buffer conservation along Dal Lake and Jhelum River embankments"
    ]
  },
  {
    "id": "L2-PY-PYDCR-HERITAGE-01",
    "tier": "state",
    "level": 2,
    "levelName": "Level 2: State Code (Puducherry Rules)",
    "jurisdiction": "Puducherry (Town & Country Planning)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Puducherry (UT)",
      "stateId": "puducherry"
    },
    "category": "zoning",
    "categoryName": "French Boulevard Heritage & Coastal Setbacks",
    "title": "Puducherry French Boulevard Heritage Height & Setback Norms",
    "clause": "Rule 12 & Special Heritage Chapter",
    "sourceDoc": "Puducherry Planning Authority Comprehensive Development Control Rules",
    "sourceUrl": "https://tcpd.py.gov.in",
    "documentYear": "2012",
    "version": "Amended 2020",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Enforces strict height limitation (max 11m/G+2) and French architectural controls in the Boulevard heritage town of Puducherry.",
    "parameters": {
      "maxHeightBoulevardM": 11.0,
      "frenchFacadeMandatory": true,
      "crzClearanceMandatory": true
    },
    "detailedRequirements": [
      "French Heritage Boulevard zone: Maximum building height capped at 11.0m (Ground + 2 storeys)",
      "Traditional Franco-Tamil architectural elements (colonnades, arched openings, continuous cornices) mandatory",
      "Base FAR 1.50 to 2.20 in non-heritage suburban zones",
      "Coastal Regulation Zone (CRZ) setbacks along the coastline strictly enforced"
    ]
  }
];

export const STATE_BYE_LAW_RULES = STATE_RULES;
