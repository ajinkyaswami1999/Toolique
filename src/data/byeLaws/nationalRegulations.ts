// Level 1: National Regulations & Statutory Codes (NBC 2016, ECBC, CGWA, MoHUA, MoEFCC, NDMA, CEA, CPCB)

import type { ByeLawRule, RegulationDocument } from './types';

export const NATIONAL_REGULATION_DOCUMENTS: RegulationDocument[] = [
  {
    "id": "DOC-NAT-NBC-2016",
    "title": "National Building Code of India 2016 (SP 7: 2016)",
    "shortTitle": "NBC 2016",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "building_code",
    "documentPriority": "reference",
    "year": "2016",
    "version": "SP 7: 2016 (First Revision 2020)",
    "status": "verified",
    "categories": [
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "fire_safety",
      "accessibility",
      "structural_safety",
      "building_services",
      "plumbing",
      "electrical"
    ],
    "source": {
      "authority": "Bureau of Indian Standards (BIS)",
      "officialUrl": "https://www.bis.gov.in",
      "documentUrl": "https://standardsbis.bsbedge.com",
      "documentType": "Standard",
      "publishedDate": "2016-12-23",
      "lastVerified": "15 Jan 2026"
    },
    "amendments": [
      {
        "year": "2020",
        "title": "Amendment No. 1 to NBC 2016 (Structural & Fire Provisions)",
        "gazetteNotification": "BIS/CED/46/A1",
        "summary": "Incorporated updated seismic loading provisions of IS 1893:2016 and enhanced high-rise fire evacuation standards.",
        "status": "in_force"
      }
    ],
    "relationships": {
      "relatedDocuments": [
        "DOC-NAT-ECBC-2017",
        "DOC-NAT-MOHUA-ACC-2021",
        "DOC-NAT-MBBL-2016"
      ],
      "references": [
        "IS 1893 (Part 1): 2016",
        "IS 4326: 2013",
        "IS 13920: 2016"
      ]
    },
    "summary": "The apex national model code formulated by BIS providing comprehensive guidelines for regulating building construction activities across India, serving as the foundational reference for all state and municipal bye-laws.",
    "keyProvisions": [
      "Part 3: General Building Requirements (Coverage, Setbacks, Heights, Light & Ventilation)",
      "Part 4: Fire and Life Safety (Compartmentation, Exit Widths, Travel Distances, Sprinklers)",
      "Part 6: Structural Design (Earthquake, Wind, Foundation & Masonry Standards)",
      "Part 8: Building Services (Lighting, Ventilation, Acoustics, HVAC, Lifts, Electrical)",
      "Part 9: Plumbing Services (Water Supply, Drainage, Sanitation, Gas Supply)",
      "Part 10: Landscape Development, Signs and Outdoor Display Structures"
    ]
  },
  {
    "id": "DOC-NAT-ECBC-2017",
    "title": "Energy Conservation Building Code 2017 (ECBC-2017)",
    "shortTitle": "ECBC 2017",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "standard",
    "documentPriority": "reference",
    "year": "2017",
    "version": "ECBC 2017 (Rev 2021)",
    "status": "verified",
    "categories": [
      "green_building",
      "solar_requirements",
      "environmental_regulations",
      "electrical"
    ],
    "source": {
      "authority": "Bureau of Energy Efficiency (BEE), Ministry of Power",
      "officialUrl": "https://beeindia.gov.in",
      "documentUrl": "https://beeindia.gov.in/en/energy-conservation-building-code",
      "documentType": "Gazette",
      "publishedDate": "2017-06-15",
      "lastVerified": "15 Jan 2026"
    },
    "amendments": [
      {
        "year": "2021",
        "title": "Eco-Niwas Samhita (Part II: Electro-Mechanical and Renewable Energy Systems)",
        "summary": "Introduced Energy Performance Index (EPI) baselines for commercial and multi-family residential complexes.",
        "status": "in_force"
      }
    ],
    "relationships": {
      "relatedDocuments": [
        "DOC-NAT-NBC-2016"
      ],
      "references": [
        "Energy Conservation Act 2001 (52 of 2001)"
      ]
    },
    "summary": "Mandatory energy efficiency standard under the Energy Conservation Act 2001 for commercial complexes and high-density buildings with connected load >= 100 kW or contract demand >= 120 kVA.",
    "keyProvisions": [
      "Prescribes maximum Window-to-Wall Ratio (WWR <= 40% for prescriptive compliance)",
      "Mandatory Solar Heat Gain Coefficient (SHGC <= 0.25 for hot-dry and composite climates)",
      "Mandatory minimum 1% to 3% peak electrical load powered via on-site Solar PV installations",
      "High-efficiency HVAC chillers and Variable Frequency Drive (VFD) requirements"
    ]
  },
  {
    "id": "DOC-NAT-MOHUA-ACC-2021",
    "title": "Harmonised Guidelines and Standards for Universal Accessibility in India 2021",
    "shortTitle": "MoHUA Accessibility 2021",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "guideline",
    "documentPriority": "reference",
    "year": "2021",
    "version": "MoHUA 2021 Edition",
    "status": "verified",
    "categories": [
      "accessibility"
    ],
    "source": {
      "authority": "Ministry of Housing and Urban Affairs (MoHUA)",
      "officialUrl": "https://mohua.gov.in",
      "documentType": "PDF",
      "publishedDate": "2021-12-18",
      "lastVerified": "15 Jan 2026"
    },
    "relationships": {
      "relatedDocuments": [
        "DOC-NAT-NBC-2016"
      ],
      "references": [
        "Rights of Persons with Disabilities Act 2016"
      ]
    },
    "summary": "National statutory standard framed under the RPwD Act 2016 mandating barrier-free access, tactile paths, ramp gradients, accessible elevators, and universal toilet designs across all public and semi-public premises.",
    "keyProvisions": [
      "Mandatory entrance ramp slope not exceeding 1:12 (1:15 to 1:20 recommended for lengths > 9m)",
      "Minimum clear door opening width of 900mm throughout public circulation spaces",
      "Tactile Ground Surface Indicators (TGSI) for guiding and warning visually impaired occupants",
      "Accessible unisex toilet cubicle with minimum internal dimensions of 2200mm x 2000mm"
    ]
  },
  {
    "id": "DOC-NAT-CGWA-2020",
    "title": "Guidelines to Regulate and Control Ground Water Extraction in India (CGWA 2020)",
    "shortTitle": "CGWA Guidelines 2020",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "statutory_act",
    "documentPriority": "reference",
    "year": "2020",
    "version": "Gazette Notification S.O. 3289(E)",
    "status": "verified",
    "categories": [
      "rainwater_harvesting",
      "environmental_regulations",
      "water_supply"
    ],
    "source": {
      "authority": "Central Ground Water Authority (CGWA), Ministry of Jal Shakti",
      "officialUrl": "https://cgwa-noc.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2020-09-24",
      "lastVerified": "15 Jan 2026"
    },
    "relationships": {
      "relatedDocuments": [
        "DOC-NAT-NBC-2016"
      ],
      "references": [
        "Environment (Protection) Act 1986"
      ]
    },
    "summary": "Mandates rainwater harvesting recharge infrastructure and abstraction NOC for commercial/infrastructure projects, prohibiting groundwater extraction in over-exploited assessment units without recharge offsets.",
    "keyProvisions": [
      "Mandatory rooftop rainwater harvesting for all new buildings on plots measuring 100 sq.m or more",
      "Mandatory dual plumbing network and STP recycling for residential/commercial projects with BUA >= 5000 sq.m",
      "Installation of digital water flow meters with telemetry for authorized groundwater abstraction borewells"
    ]
  },
  {
    "id": "DOC-NAT-MBBL-2016",
    "title": "Model Building Bye-Laws 2016 (MBBL-2016)",
    "shortTitle": "MoHUA MBBL 2016",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "model_bye_laws",
    "documentPriority": "reference",
    "year": "2016",
    "version": "MBBL 2016 (Circular 2020)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "green_building",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Town and Country Planning Organisation (TCPO), MoHUA",
      "officialUrl": "https://mohua.gov.in",
      "documentType": "PDF",
      "publishedDate": "2016-03-18",
      "lastVerified": "15 Jan 2026"
    },
    "relationships": {
      "relatedDocuments": [
        "DOC-NAT-NBC-2016"
      ]
    },
    "summary": "Model regulatory framework issued by the central government recommending standardized fast-track online building approvals, risk-based classification, green building incentives, and structural safety norms for adoption by all states.",
    "keyProvisions": [
      "Single-window Online Building Permission System (OBPAS) with integrated NOCs",
      "Risk-based building classification for deemed approval of low-risk residential plots",
      "Mandatory inclusion of green building parameters (RWH, Solar PV, Waste segregation) in municipal bye-laws",
      "Standardized Floor Area Ratio (FAR) and Equivalent Car Space (ECS) calculation methodologies"
    ]
  },
  {
    "id": "DOC-NAT-MOEFCC-EIA-2006",
    "title": "Environmental Impact Assessment (EIA) Notification 2006 & Building Amendments",
    "shortTitle": "MoEFCC EIA 2006",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "statutory_act",
    "documentPriority": "reference",
    "year": "2006",
    "version": "S.O. 1533(E) Amended up to 2022",
    "status": "verified",
    "categories": [
      "environmental_regulations",
      "green_building",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Ministry of Environment, Forest and Climate Change (MoEFCC)",
      "officialUrl": "https://parivesh.nic.in",
      "documentUrl": "https://moef.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2006-09-14",
      "lastVerified": "15 Jan 2026"
    },
    "relationships": {
      "references": [
        "Environment (Protection) Act 1986"
      ]
    },
    "summary": "Statutory central environmental clearance mandate for large construction projects, requiring SEIAA approval for built-up areas exceeding 20,000 sq.m and full EIA studies for townships exceeding 1,50,000 sq.m.",
    "keyProvisions": [
      "Item 8(a): Building & Construction Projects (BUA >= 20,000 sq.m and < 1,50,000 sq.m) require prior Environmental Clearance (EC) from SEIAA",
      "Item 8(b): Townships and Area Development Projects (Plot Area >= 50 ha or BUA >= 1,50,000 sq.m) require comprehensive EIA study",
      "Mandatory zero liquid discharge (ZLD) conditions or on-site 100% sewage treatment with dual plumbing reuse",
      "Construction phase environmental management plan (C&D waste recycling, anti-smog guns, dust barriers)"
    ]
  },
  {
    "id": "DOC-NAT-CEA-SAFETY-2010",
    "title": "Central Electricity Authority (Measures Relating to Safety and Electric Supply) Regulations 2010",
    "shortTitle": "CEA Safety Regulations 2010",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "statutory_act",
    "documentPriority": "reference",
    "year": "2010",
    "version": "CEA Regulations 2010 (Amended 2023)",
    "status": "verified",
    "categories": [
      "electrical",
      "setbacks",
      "special_restriction"
    ],
    "source": {
      "authority": "Central Electricity Authority (CEA), Ministry of Power",
      "officialUrl": "https://cea.nic.in",
      "documentType": "Gazette",
      "publishedDate": "2010-09-20",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statutory safety clearances governing the vertical and horizontal physical separation required between building structures and high-voltage / extra-high-voltage overhead transmission lines.",
    "keyProvisions": [
      "Regulation 60: Minimum clearances from overhead lines of Low and Medium voltage (Vertical 2.5m, Horizontal 1.2m)",
      "Regulation 61: Minimum clearances from High Voltage lines up to 11 kV & 33 kV (Vertical 3.7m, Horizontal 1.2m to 2.0m)",
      "Regulation 61(3): For Extra High Voltage lines (66 kV to 220 kV), clearances increase by 0.3m for every additional 33 kV",
      "Prohibition of permanent balconies, chajjas, or structures projecting into the statutory transmission corridor right-of-way"
    ]
  },
  {
    "id": "DOC-NAT-MOEFCC-CRZ-2019",
    "title": "Coastal Regulation Zone (CRZ) Notification 2019",
    "shortTitle": "CRZ Notification 2019",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "statutory_act",
    "documentPriority": "reference",
    "year": "2019",
    "version": "G.S.R. 37(E) (Amended 2021)",
    "status": "verified",
    "categories": [
      "environmental_regulations",
      "setbacks",
      "special_restriction",
      "zoning"
    ],
    "source": {
      "authority": "National Coastal Zone Management Authority (NCZMA) / MoEFCC",
      "officialUrl": "https://moef.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2019-01-18",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Regulates development within 500m of High Tide Line (HTL) along coastal stretches and 100m or width of creek along tidal water bodies across all coastal states and island territories.",
    "keyProvisions": [
      "CRZ-I: Ecologically Sensitive Areas (Mangroves, Corals, Sand Dunes) - No new construction permitted",
      "CRZ-II: Developed Urban Areas - Construction permitted only on landward side of existing authorized structures or roads",
      "CRZ-III: Rural/Semi-Urban Areas - No Development Zone (NDZ) of 50m (for CRZ-III A) or 200m (for CRZ-III B) from HTL",
      "Mandatory CRZ clearance from State Coastal Zone Management Authority (SCZMA) prior to municipal plan sanction"
    ]
  },
  {
    "id": "DOC-NAT-SWM-2016",
    "title": "Solid Waste Management Rules 2016",
    "shortTitle": "SWM Rules 2016",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "statutory_act",
    "documentPriority": "reference",
    "year": "2016",
    "version": "S.O. 1357(E)",
    "status": "verified",
    "categories": [
      "environmental_regulations",
      "building_services"
    ],
    "source": {
      "authority": "Central Pollution Control Board (CPCB) / MoEFCC",
      "officialUrl": "https://cpcb.nic.in",
      "documentType": "Gazette",
      "publishedDate": "2016-04-08",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Mandatory waste segregation at source and on-site processing facilities for all bulk waste generators, gated communities, and commercial complexes with plot area > 5,000 sq.m or waste > 100 kg/day.",
    "keyProvisions": [
      "Rule 4(7): Gated communities and institutions on plots > 5,000 sq.m must provide on-site organic waste composters/bio-methanation units",
      "Rule 4(8): Dedicated multi-bin waste collection and sorting rooms segregated into biodegradable, non-biodegradable, and domestic hazardous waste",
      "Prohibition of throwing or burning construction and demolition waste; mandatory C&D waste management plan"
    ]
  },
  {
    "id": "DOC-NAT-NDMA-EQ-2016",
    "title": "National Disaster Management Guidelines & Seismic Design Standards (IS 1893: 2016 / IS 13920: 2016)",
    "shortTitle": "NDMA Seismic Safety Norms",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "standard",
    "documentPriority": "reference",
    "year": "2016",
    "version": "IS 1893 (Part 1): 2016 & IS 13920: 2016",
    "status": "verified",
    "categories": [
      "structural_safety"
    ],
    "source": {
      "authority": "National Disaster Management Authority (NDMA) & BIS",
      "officialUrl": "https://ndma.gov.in",
      "documentType": "Standard",
      "publishedDate": "2016-12-01",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "National structural earthquake resilient design criteria categorizing India into Seismic Zones II, III, IV, and V, mandating ductile detailing for all reinforced concrete buildings.",
    "keyProvisions": [
      "Seismic Zone IV & V (e.g., Delhi NCR, North-East, Uttarakhand, Kutch): Mandatory ductile detailing per IS 13920:2016",
      "Mandatory structural stability certificate signed by registered Structural Engineer prior to plan sanction",
      "Separation distances between adjacent building blocks to prevent seismic pounding during earthquakes",
      "Special moment resisting frames (SMRF) mandated for buildings taller than 15 meters in Zone IV and V"
    ]
  },
  {
    "id": "DOC-NAT-AAI-NOCAS-2015",
    "title": "Ministry of Civil Aviation Height Restrictions for Safeguarding of Aerodromes (G.S.R. 751(E))",
    "shortTitle": "AAI Height Regulations GSR 751(E)",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "statutory_act",
    "documentPriority": "reference",
    "year": "2015",
    "version": "G.S.R. 751(E) (Amended 2020)",
    "status": "verified",
    "categories": [
      "height_floors",
      "special_restriction",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Airports Authority of India (AAI) / Ministry of Civil Aviation",
      "officialUrl": "https://nocas2.aai.aero",
      "documentType": "Gazette",
      "publishedDate": "2015-09-30",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "National statutory civil aviation clearance system establishing Obstacle Limitation Surfaces (OLS) and Colour Coded Zoning Maps (CCZM) around all civil, defense, and private aerodromes across India.",
    "keyProvisions": [
      "Rule 4: Mandatory NOC for any structure exceeding the permissible top elevation defined in the Colour Coded Zoning Map (CCZM)",
      "Rule 5: Automatic online clearance (NOCAS) for structures situated below the CCZM threshold elevation",
      "Prohibition of tall cranes, chimneys, telecom towers, and high-rise elements breaching airport approach funnels and transitional surfaces",
      "Mandatory aviation warning lights and obstruction markings for structures exceeding 45 meters in height"
    ]
  },
  {
    "id": "DOC-NAT-NMA-AMASR-2010",
    "title": "Ancient Monuments and Archaeological Sites and Remains (Amendment and Validation) Act 2010",
    "shortTitle": "AMASR Act Heritage Rules",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "statutory_act",
    "documentPriority": "reference",
    "year": "2010",
    "version": "Act No. 10 of 2010",
    "status": "verified",
    "categories": [
      "setbacks",
      "special_restriction",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "National Monuments Authority (NMA) & Archaeological Survey of India (ASI)",
      "officialUrl": "https://nma.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2010-03-30",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statutory central heritage protection law imposing a 100-meter absolute prohibited buffer and 200-meter regulated buffer around all centrally protected monuments across India.",
    "keyProvisions": [
      "Section 20A: Prohibited Area within 100 meters in all directions from protected monument boundary - Zero new construction permitted",
      "Section 20B: Regulated Area extending 200 meters beyond the prohibited area - Construction or repair requires prior NMA NOC",
      "Heritage Bye-laws determine maximum permissible height and facade styling for proposed buildings in regulated zones",
      "Online SMARAC portal integration for automated heritage proximity verification"
    ]
  },
  {
    "id": "DOC-NAT-CPCB-NOISE-2000",
    "title": "Noise Pollution (Regulation and Control) Rules 2000 & DG Set Acoustic Norms",
    "shortTitle": "CPCB Noise & DG Set Norms",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "statutory_act",
    "documentPriority": "reference",
    "year": "2000",
    "version": "S.O. 123(E) Amended 2010/2021",
    "status": "verified",
    "categories": [
      "environmental_regulations",
      "building_services",
      "electrical"
    ],
    "source": {
      "authority": "Central Pollution Control Board (CPCB) / MoEFCC",
      "officialUrl": "https://cpcb.nic.in",
      "documentType": "Gazette",
      "publishedDate": "2000-02-14",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Prescribes ambient noise standards for industrial, commercial, residential, and silence zones, mandating acoustic enclosures and minimum chimney exhaust stack heights for diesel generator sets.",
    "keyProvisions": [
      "Prescribes daytime (55 dB(A)) and nighttime (45 dB(A)) noise limits for residential zones",
      "Mandatory acoustic enclosure providing minimum 25 dB(A) insertion loss for all standby diesel generator sets",
      "Minimum DG chimney stack height formula: H = h + 0.2 x sqrt(kVA), where h is the building roof height in meters",
      "Silence zones (within 100m of hospitals, educational institutions, courts) prohibit noisy machinery operation"
    ]
  },
  {
    "id": "DOC-NAT-NBC-PART4-FIRE",
    "title": "National Building Code 2016 Part 4: Fire and Life Safety Code",
    "shortTitle": "NBC Part 4 Fire Code",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "building_code",
    "documentPriority": "reference",
    "year": "2016",
    "version": "SP 7 (Part 4): 2016",
    "status": "verified",
    "categories": [
      "fire_safety",
      "staircases",
      "lifts",
      "means_of_egress",
      "refuge_areas"
    ],
    "source": {
      "authority": "Bureau of Indian Standards (BIS)",
      "officialUrl": "https://www.bis.gov.in",
      "documentType": "Standard",
      "publishedDate": "2016-12-23",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Comprehensive national standard defining fire safety measures, compartmentalization, emergency staircases, fire lift specifications, travel distance limits, and sprinkler mandates for all occupancy types.",
    "keyProvisions": [
      "Clause 4.4.2: Maximum travel distance to exit staircase: 30 meters for residential/commercial (45m if fully sprinklered)",
      "Clause 4.4.2.4: Minimum two enclosed fire staircases required for all buildings exceeding 15 meters in height or floor plate > 500 sq.m",
      "Clause 4.12: Mandatory cantilevered refuge areas at 24 meters height and every subsequent 15 meters thereafter",
      "Clause 4.17: Mandatory dedicated Fire Lift with minimum 8-passenger (545 kg) capacity and 1-hour fire rated doors for high-rises"
    ]
  }
];

export const NATIONAL_RULES: ByeLawRule[] = [
  {
    "id": "L1-NBC-2016-FIRE-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: National Code (NBC 2016)",
    "jurisdiction": "National (BIS NBC 2016)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "fire_safety",
    "categoryName": "Fire and Life Safety",
    "title": "NBC 2016 High-Rise Fire Safety & Refuge Area Norms",
    "clause": "Part 4, Clause 4.4.2 & Clause 4.12",
    "sourceDoc": "National Building Code of India 2016 (SP 7: 2016)",
    "sourceUrl": "https://www.bis.gov.in",
    "documentYear": "2016",
    "version": "SP 7: 2016",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "reference",
    "summary": "Mandatory fire safety requirements for buildings exceeding 15m height, including dedicated fire lifts, automatic sprinkler networks, and cantilevered refuge areas.",
    "appliesTo": {
      "minPlotArea": 0,
      "minRoadWidth": 9.0
    },
    "parameters": {
      "highRiseThresholdM": 15.0,
      "sprinklerThresholdM": 15.0,
      "firstRefugeHeightM": 24.0,
      "refugeFrequencyM": 15.0,
      "fireDrivewayWidthM": 6.0,
      "maxTravelDistanceM": 30.0
    },
    "detailedRequirements": [
      "Buildings taller than 15 meters are classified as High-Rise and require State Fire NOC",
      "First refuge area mandatory at 24 meters height; subsequent refuge areas every 15 meters thereafter",
      "Refuge area must be cantilevered open to the external air with minimum 15 sq.m usable floor space",
      "Minimum 6.0m clear peripheral motorable fire driveway around the building perimeter",
      "Maximum travel distance to exit staircase is 30m (extendable to 45m with automatic sprinkler protection)"
    ]
  },
  {
    "id": "L1-NBC-2016-STAIR-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: National Code (NBC 2016)",
    "jurisdiction": "National (BIS NBC 2016)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "staircases",
    "categoryName": "Staircases & Means of Egress",
    "title": "NBC 2016 Minimum Staircase Width & Dual Egress Norms",
    "clause": "Part 4, Clause 4.4.2.4 & Table 7",
    "sourceDoc": "National Building Code of India 2016 (SP 7: 2016)",
    "sourceUrl": "https://www.bis.gov.in",
    "documentYear": "2016",
    "version": "SP 7: 2016",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "reference",
    "summary": "Mandates minimum width of escape staircases, maximum tread/riser dimensions, and requirement for two isolated fire staircases in multi-storey buildings.",
    "parameters": {
      "minStairWidthResidentialM": 1.0,
      "minStairWidthCommercialM": 1.5,
      "minStairWidthAssemblyM": 2.0,
      "maxRiserMm": 150,
      "minTreadMm": 300,
      "dualStairThresholdM": 15.0
    },
    "detailedRequirements": [
      "Residential Plotted / Low-Rise: Minimum 1.0m to 1.25m clear staircase width",
      "Commercial / Multi-Family: Minimum 1.5m clear staircase width; Assembly buildings require 2.0m width",
      "Maximum riser height 150mm for public buildings (190mm for residential); minimum tread depth 300mm (250mm residential)",
      "Minimum two remote fire exit staircases required for all buildings taller than 15 meters"
    ]
  },
  {
    "id": "L1-NBC-2016-PARK-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: National Code (NBC 2016)",
    "jurisdiction": "National (BIS NBC 2016)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "parking",
    "categoryName": "Off-Street Parking Standards",
    "title": "NBC 2016 Equivalent Car Space (ECS) Baseline Standards",
    "clause": "Part 3, Appendix B, Clause B-1.2",
    "sourceDoc": "National Building Code of India 2016 (SP 7: 2016)",
    "sourceUrl": "https://www.bis.gov.in",
    "documentYear": "2016",
    "version": "SP 7: 2016",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "reference",
    "summary": "Establishes baseline dimensions and spatial standards for Equivalent Car Space (ECS) in open, covered, and basement parking.",
    "parameters": {
      "ecsOpenAreaSqM": 23.0,
      "ecsCoveredAreaSqM": 28.0,
      "ecsBasementAreaSqM": 32.0,
      "minStallWidthM": 2.5,
      "minStallLengthM": 5.0,
      "minDrivewayTwoWayM": 6.0
    },
    "detailedRequirements": [
      "Standard car parking bay dimensions: Minimum 2.5m width x 5.0m length",
      "Area per ECS: 23 sq.m for open surface parking, 28 sq.m for stilt parking, 32 sq.m for basement parking (including driveways)",
      "Minimum clear two-way aisle/driveway width: 6.0 meters (3.5m for one-way)",
      "Minimum clear ceiling headroom in stilt / basement parking: 2.4 meters (2.2m below beams)"
    ]
  },
  {
    "id": "L1-MOHUA-ACC-2021-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: Universal Accessibility (MoHUA)",
    "jurisdiction": "National (MoHUA / RPwD Act 2016)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "accessibility",
    "categoryName": "Universal Accessibility",
    "title": "Universal Barrier-Free Accessibility & Ramp Standards",
    "clause": "Section 3.2 & Section 4.5",
    "sourceDoc": "Harmonised Guidelines and Standards for Universal Accessibility in India 2021",
    "sourceUrl": "https://mohua.gov.in",
    "documentYear": "2021",
    "version": "2021 Edition",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "reference",
    "summary": "Statutory compliance under the Rights of Persons with Disabilities Act 2016 requiring universal wheelchair access, tactile guiding paving, and accessible sanitary blocks.",
    "parameters": {
      "maxRampSlope": "1:12",
      "minRampWidthM": 1.2,
      "minDoorWidthMm": 900,
      "accessibleToiletSizeMm": "2200x2000"
    },
    "detailedRequirements": [
      "Entrance ramps must not exceed a slope of 1:12 (1:15 to 1:20 recommended for long ramps)",
      "Handrails on both sides at 760mm and 900mm height with tactile warnings",
      "Dedicated unisex wheelchair-accessible toilet on ground/lobby floor with 900mm sliding or outward-opening door"
    ]
  },
  {
    "id": "L1-CGWA-RWH-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: National Environmental Guidelines",
    "jurisdiction": "National (CGWA / Ministry of Jal Shakti)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "rainwater_harvesting",
    "categoryName": "Rainwater Harvesting & Ground Water",
    "title": "Mandatory Rainwater Harvesting & Dual Plumbing",
    "clause": "Gazette Notification S.O. 3289(E)",
    "sourceDoc": "Guidelines to Regulate and Control Ground Water Extraction in India (CGWA 2020)",
    "sourceUrl": "https://cgwa-noc.gov.in",
    "documentYear": "2020",
    "version": "2020 Guidelines",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "reference",
    "summary": "Mandatory rainwater harvesting recharge systems for all new buildings on plots measuring 100 sq.m or more to combat groundwater depletion and urban runoff flooding.",
    "parameters": {
      "mandatoryRwhPlotAreaSqM": 100,
      "dualPlumbingBuaThresholdSqM": 5000,
      "stpThresholdBuaSqM": 5000
    },
    "detailedRequirements": [
      "Plots >= 100 sq.m: Mandatory rooftop rainwater harvesting with desilting chamber and recharge pit",
      "BUA >= 5000 sq.m: Mandatory on-site Sewage Treatment Plant (STP) and dual plumbing network for flushing and landscape irrigation",
      "No occupancy certificate issued without verified RWH completion certificate"
    ]
  },
  {
    "id": "L1-ECBC-2017-SOLAR-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: Energy Conservation Code (ECBC)",
    "jurisdiction": "National (BEE / Ministry of Power)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "solar_requirements",
    "categoryName": "Renewable Energy & Solar Mandates",
    "title": "Rooftop Solar PV Installation & EPI Baseline Mandate",
    "clause": "Section 4.3.7 & Section 5.3",
    "sourceDoc": "Energy Conservation Building Code 2017 (ECBC-2017)",
    "sourceUrl": "https://beeindia.gov.in",
    "documentYear": "2017",
    "version": "ECBC 2017 (Rev 2021)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "reference",
    "summary": "Mandatory dedicated solar rooftop generation for commercial buildings with connected electrical load >= 100 kW or built-up area >= 2000 sq.m.",
    "parameters": {
      "minSolarPvCapacityKwPer100SqM": 1.0,
      "minRoofAreaForSolarPct": 25,
      "connectedLoadThresholdKw": 100
    },
    "detailedRequirements": [
      "Minimum 25% of unshaded rooftop area must be dedicated to Solar PV panels",
      "Mandatory net-metering synchronization with state power discom",
      "Window-to-Wall Ratio (WWR) capped at 40% for prescriptive envelope compliance"
    ]
  },
  {
    "id": "L1-CEA-HT-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: Central Electricity Authority (Safety)",
    "jurisdiction": "National (CEA / Ministry of Power)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "electrical",
    "categoryName": "High Tension Electrical Clearances",
    "title": "Statutory Setbacks from Overhead High Tension (HT) Power Lines",
    "clause": "Regulation 60 & 61",
    "sourceDoc": "Central Electricity Authority (Measures Relating to Safety and Electric Supply) Regulations 2010",
    "sourceUrl": "https://cea.nic.in",
    "documentYear": "2010",
    "version": "CEA 2010 (Rev 2023)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "reference",
    "summary": "Strict mandatory physical clearances required between building balconies, walls, and overhead HT power conductors to eliminate electrical arcing hazards.",
    "parameters": {
      "minVerticalClearance11KvM": 3.7,
      "minHorizontalClearance11KvM": 1.2,
      "minVerticalClearance33KvM": 3.7,
      "minHorizontalClearance33KvM": 2.0,
      "minHorizontalClearance66KvM": 2.3
    },
    "detailedRequirements": [
      "11 kV & 33 kV Lines: Minimum 3.7m vertical clearance and 1.2m to 2.0m horizontal clearance from nearest building point",
      "66 kV to 220 kV Lines: Mandatory power corridor Right-of-Way (RoW) buffer where no permanent roof, balcony, or column is permitted",
      "No building plan sanction granted without State Electricity Transmission Utility NOC for plots adjacent to HT towers"
    ]
  },
  {
    "id": "L1-MOEFCC-EIA-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: Environmental Clearance (MoEFCC)",
    "jurisdiction": "National (MoEFCC / SEIAA)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "environmental_regulations",
    "categoryName": "Environmental Clearances (EIA)",
    "title": "Prior Environmental Clearance for Built-up Area >= 20,000 sq.m",
    "clause": "Item 8(a), Schedule of EIA Notification 2006",
    "sourceDoc": "Environmental Impact Assessment (EIA) Notification 2006 & Building Amendments",
    "sourceUrl": "https://parivesh.nic.in",
    "documentYear": "2006",
    "version": "S.O. 1533(E)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "reference",
    "summary": "Statutory prior Environmental Clearance from SEIAA mandatory for any building project where total gross built-up area equals or exceeds 20,000 sq.m.",
    "parameters": {
      "ecBuaThresholdSqM": 20000,
      "townshipBuaThresholdSqM": 150000,
      "townshipPlotAreaHa": 50
    },
    "detailedRequirements": [
      "Built-up area >= 20,000 sq.m and < 1,50,000 sq.m: Mandatory Category B2 SEIAA Environmental Clearance",
      "Zero on-site physical construction permitted prior to receipt of formal EC letter",
      "Mandatory environmental management plan covering dust suppression, tree transplantation, and organic waste convertors"
    ]
  },
  {
    "id": "L1-MOEFCC-CRZ-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: Coastal Regulation Zone (MoEFCC)",
    "jurisdiction": "National (NCZMA / MoEFCC)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "special_restriction",
    "categoryName": "Coastal Regulation Zone (CRZ)",
    "title": "Coastal Regulation Zone Buffer & Construction Setback Prohibitions",
    "clause": "Paragraph 5.1 & Paragraph 5.2",
    "sourceDoc": "Coastal Regulation Zone (CRZ) Notification 2019",
    "sourceUrl": "https://moef.gov.in",
    "documentYear": "2019",
    "version": "G.S.R. 37(E)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "reference",
    "summary": "Strict prohibitions and spatial guidelines for building development within coastal stretches and tidal water body buffers.",
    "parameters": {
      "crzCoastalBufferM": 500,
      "crzCreekBufferM": 100,
      "ndzRuralBufferM": 50
    },
    "detailedRequirements": [
      "CRZ-II Urban Areas: New construction permitted strictly on the landward side of existing authorized structures or approved roads",
      "FSI/FAR in CRZ-II is frozen to norms approved in the local development control regulations",
      "Mandatory CZMA recommendation before local municipal corporation plan sanction"
    ]
  },
  {
    "id": "L1-SWM-2016-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: Solid Waste Management (CPCB)",
    "jurisdiction": "National (CPCB / MoEFCC)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "environmental_regulations",
    "categoryName": "Solid Waste Management",
    "title": "Bulk Waste Generator On-Site Composting & Waste Sorting Facility Mandate",
    "clause": "Rule 4(7) & Rule 4(8)",
    "sourceDoc": "Solid Waste Management Rules 2016",
    "sourceUrl": "https://cpcb.nic.in",
    "documentYear": "2016",
    "version": "S.O. 1357(E)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "reference",
    "summary": "Mandatory on-site waste segregation, organic bio-composting, and dedicated sorting rooms for all large residential and commercial properties.",
    "parameters": {
      "bulkWastePlotAreaSqM": 5000,
      "wasteThresholdKgPerDay": 100
    },
    "detailedRequirements": [
      "Properties on plots > 5,000 sq.m or generating > 100 kg/day waste must install Organic Waste Converters (OWC)",
      "Treated compost must be utilized within on-site landscaped gardens and open spaces",
      "Dedicated ventilated storage room for dry recyclable waste prior to authorized municipal handover"
    ]
  },
  {
    "id": "L1-NDMA-EQ-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: Disaster Management (NDMA)",
    "jurisdiction": "National (NDMA / BIS)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "structural_safety",
    "categoryName": "Earthquake Resilient Structural Design",
    "title": "Seismic Zone Resilient Structural Detailing Standards",
    "clause": "IS 1893:2016 Clause 6.4 & IS 13920:2016",
    "sourceDoc": "National Disaster Management Guidelines & Seismic Design Standards",
    "sourceUrl": "https://ndma.gov.in",
    "documentYear": "2016",
    "version": "IS 1893: 2016",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "reference",
    "summary": "Mandatory earthquake resistant structural engineering design and ductile detailing based on national seismic zoning map.",
    "parameters": {
      "seismicZoneDelhi": "IV",
      "seismicZoneMumbai": "III",
      "seismicZoneGuwahati": "V",
      "mandatoryDuctileDetailing": true
    },
    "detailedRequirements": [
      "All RCC frame buildings in Seismic Zones III, IV, and V must comply with ductile detailing under IS 13920:2016",
      "Soft storey stilt floors require shear walls or stiffening columns to resist seismic lateral drift",
      "Structural stability certificate signed by registered chartered structural engineer required for sanction"
    ]
  },
  {
    "id": "L1-AAI-NOCAS-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: Civil Aviation Height Clearance (AAI)",
    "jurisdiction": "National (AAI / MoCA)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "height_floors",
    "categoryName": "Airport Height Clearance",
    "title": "AAI Airport Obstacle Limitation Surface (OLS) & Height NOC Mandate",
    "clause": "G.S.R. 751(E) Rule 4 & Rule 5",
    "sourceDoc": "Ministry of Civil Aviation Height Restrictions for Safeguarding of Aerodromes (G.S.R. 751(E))",
    "sourceUrl": "https://nocas2.aai.aero",
    "documentYear": "2015",
    "version": "G.S.R. 751(E)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "reference",
    "summary": "Mandatory prior AAI Height Clearance NOC for any building whose proposed top elevation breaches the local CCZM grid limits.",
    "parameters": {
      "mandatoryCczmCheck": true,
      "aviationLightThresholdM": 45.0
    },
    "detailedRequirements": [
      "Every building within 20km of civil/defense airport must verify top elevation (AMSL) against AAI Colour Coded Zoning Map",
      "Structures exceeding 45m above ground level must install medium-intensity Type B aviation obstruction lights",
      "Online NOCAS II filing required if building height exceeds local permissible grid ceiling"
    ]
  },
  {
    "id": "L1-NMA-AMASR-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: Monument Protection (NMA / ASI)",
    "jurisdiction": "National (NMA / ASI)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "special_restriction",
    "categoryName": "Heritage & Monument Buffers",
    "title": "ASI Prohibited 100m Buffer & Regulated 200m Buffer Construction Clearance",
    "clause": "Section 20A & Section 20B",
    "sourceDoc": "Ancient Monuments and Archaeological Sites and Remains (Amendment and Validation) Act 2010",
    "sourceUrl": "https://nma.gov.in",
    "documentYear": "2010",
    "version": "Act No. 10 of 2010",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "reference",
    "summary": "Absolute statutory ban on new construction within 100m of Centrally Protected Monuments, and mandatory NMA NOC between 100m to 300m.",
    "parameters": {
      "prohibitedZoneRadiusM": 100,
      "regulatedZoneRadiusM": 200,
      "totalHeritageBufferM": 300
    },
    "detailedRequirements": [
      "0m to 100m from monument boundary: Prohibited area, zero new construction or addition allowed",
      "100m to 300m from monument boundary: Regulated area, permission from National Monuments Authority (NMA) required",
      "Applications must be filed online via SMARAC portal with heritage impact assessment"
    ]
  },
  {
    "id": "L1-CPCB-DG-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: Pollution Control (CPCB)",
    "jurisdiction": "National (CPCB / MoEFCC)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "building_services",
    "categoryName": "Noise Control & DG Set Exhaust",
    "title": "Acoustic Enclosure & Stack Height Clearances for Standby Diesel Generators",
    "clause": "CPCB Schedule I Entry 95",
    "sourceDoc": "Noise Pollution (Regulation and Control) Rules 2000 & DG Set Acoustic Norms",
    "sourceUrl": "https://cpcb.nic.in",
    "documentYear": "2000",
    "version": "S.O. 123(E)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "reference",
    "summary": "Mandates soundproofing and elevated exhaust chimneys for backup power DG sets to prevent localized acoustic and particulate pollution.",
    "parameters": {
      "minAcousticInsertionLossDb": 25,
      "chimneyFormula": "H = h + 0.2 * sqrt(kVA)"
    },
    "detailedRequirements": [
      "All DG sets must be housed inside acoustic enclosures certified for minimum 25 dB(A) noise reduction",
      "Exhaust stack must vent above the roof of the tallest adjacent building structure",
      "Periodic emission testing and CPCB-IV+ compliant engine certification mandatory"
    ]
  }
];

export const NATIONAL_BYE_LAW_RULES = NATIONAL_RULES;
