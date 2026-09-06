// Level 1: National Regulations & Statutory Codes (20 Verified Documents & Evaluated Rules)

import type { ByeLawRule, RegulationDocument } from './types';

export const NATIONAL_REGULATION_DOCUMENTS: RegulationDocument[] = [
  {
    "id": "DOC-NAT-NBC-2016-FIRE",
    "title": "National Building Code of India 2016 (Part 4: Fire and Life Safety)",
    "shortTitle": "NBC 2016 Part 4 (Fire)",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2016",
    "version": "NBC 2016 (Third Revision)",
    "status": "verified",
    "categories": [
      "fire_safety",
      "height_floors",
      "setbacks",
      "means_of_egress",
      "refuge_areas"
    ],
    "source": {
      "authority": "Bureau of Indian Standards (BIS)",
      "officialUrl": "https://www.bis.gov.in",
      "documentUrl": "https://www.standardsbis.in/gemini/home/nbc",
      "documentType": "Manual",
      "publishedDate": "2016-12-01",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Mandates mandatory fire protection, compartmentation, peripheral fire tender access, and structural fire ratings for high-rise buildings exceeding 15 meters across India.",
    "keyProvisions": [
      "Mandatory 6.0m clear peripheral driveway around high-rise buildings > 15m for fire tender movement",
      "Fire refuge area required at every 7th floor above 24 meters height (minimum 15 sq.m area)",
      "Two-hour structural fire resistance rating for load-bearing walls and exit corridors",
      "Compulsory dual fire towers with pressurized fire staircases for buildings > 24m"
    ]
  },
  {
    "id": "DOC-NAT-NBC-2016-DCR",
    "title": "National Building Code of India 2016 (Part 3: Development Control Rules & General Building Requirements)",
    "shortTitle": "NBC 2016 Part 3 (DCR)",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2016",
    "version": "NBC 2016",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "open_spaces"
    ],
    "source": {
      "authority": "Bureau of Indian Standards (BIS)",
      "officialUrl": "https://www.bis.gov.in",
      "documentType": "Manual",
      "publishedDate": "2016-12-01",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "National benchmark governing baseline plot coverage, FAR ceilings, rear/side setback ratios, and habitable room dimensional requirements.",
    "keyProvisions": [
      "Maximum ground coverage caps: Plotted residential (66% to 75%), Group housing (33% to 40%)",
      "Habitable room minimum clear height: 2.75m (air-conditioned: 2.4m)",
      "Courtyard minimum dimension: Height of surrounding walls / 2 (minimum 3.0m)",
      "Basement setback requirements: minimum 2.0m to 3.0m inside property boundary"
    ]
  },
  {
    "id": "DOC-NAT-NBC-2016-STAIR",
    "title": "National Building Code of India 2016 (Part 4 Clause 4.4: Means of Egress & Staircases)",
    "shortTitle": "NBC 2016 Staircases & Egress",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2016",
    "version": "NBC 2016",
    "status": "verified",
    "categories": [
      "means_of_egress",
      "staircases",
      "fire_safety",
      "corridors"
    ],
    "source": {
      "authority": "Bureau of Indian Standards (BIS)",
      "officialUrl": "https://www.bis.gov.in",
      "documentType": "Manual",
      "publishedDate": "2016-12-01",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Establishes minimum width, maximum riser height, minimum tread width, and travel distance limits for escape routes.",
    "keyProvisions": [
      "Minimum staircase width: Residential (1.0m to 1.25m), Commercial/Institutional (1.5m to 2.0m)",
      "Maximum riser: 150mm (residential max 190mm), Minimum tread: 300mm (residential min 250mm)",
      "Maximum travel distance to fire exit: 30m for dead-end corridors, 45m for ventilated corridors",
      "Minimum corridor clear width: 1.5m for residential group housing, 2.0m for commercial"
    ]
  },
  {
    "id": "DOC-NAT-NBC-2016-PARK",
    "title": "National Building Code of India 2016 (Part 3 Clause 9.6: Parking & Transit Spaces)",
    "shortTitle": "NBC 2016 Parking ECS",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2016",
    "version": "NBC 2016",
    "status": "verified",
    "categories": [
      "parking",
      "stilt_parking",
      "basement"
    ],
    "source": {
      "authority": "Bureau of Indian Standards (BIS)",
      "officialUrl": "https://www.bis.gov.in",
      "documentType": "Manual",
      "publishedDate": "2016-12-01",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Prescribes Equivalent Car Space (ECS) dimensions, driveway circulation widths, and visitor parking quotas.",
    "keyProvisions": [
      "1 ECS area benchmarks: Open Surface (23 sq.m), Covered Stilt (28 sq.m), Basement (32 sq.m)",
      "Minimum two-way drive aisle width: 6.0m (one-way: 3.5m)",
      "Ramp slope limits: Straight ramp max 1:8 to 1:10; Curved ramp max 1:10 with outer radius >= 9.0m",
      "Minimum 10% additional parking dedicated for visitors and deliveries"
    ]
  },
  {
    "id": "DOC-NAT-NBC-2016-PLUMB",
    "title": "National Building Code of India 2016 (Part 9: Plumbing Services)",
    "shortTitle": "NBC 2016 Part 9 (Plumbing)",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2016",
    "version": "NBC 2016",
    "status": "verified",
    "categories": [
      "plumbing",
      "water_supply",
      "sewage_drainage",
      "environmental_regulations"
    ],
    "source": {
      "authority": "Bureau of Indian Standards (BIS)",
      "officialUrl": "https://www.bis.gov.in",
      "documentType": "Manual",
      "publishedDate": "2016-12-01",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statutory engineering codes for domestic water supply sizing, fixture unit counts, dual piping, and sewage drainage.",
    "keyProvisions": [
      "Per capita domestic water demand: 135 Litres Per Head Per Day (LPCD) for residential",
      "Dual plumbing network mandatory for all developments with built-up area >= 5,000 sq.m",
      "Minimum gradient for gravity sewer pipes: 1:60 for 100mm dia, 1:100 for 150mm dia",
      "Mandatory grease interceptors for commercial kitchens and dining facilities"
    ]
  },
  {
    "id": "DOC-NAT-NBC-2016-HVAC",
    "title": "National Building Code of India 2016 (Part 8: Lighting, Ventilation & HVAC)",
    "shortTitle": "NBC 2016 Part 8 (HVAC)",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2016",
    "version": "NBC 2016",
    "status": "verified",
    "categories": [
      "building_services",
      "environmental_regulations"
    ],
    "source": {
      "authority": "Bureau of Indian Standards (BIS)",
      "officialUrl": "https://www.bis.gov.in",
      "documentType": "Manual",
      "publishedDate": "2016-12-01",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Prescribes daylight factors, minimum aggregate window opening percentages, and mechanical air change rates.",
    "keyProvisions": [
      "Minimum aggregate opening area for natural ventilation: 1/10th (10%) of floor area for habitable rooms",
      "Basement mechanical ventilation: minimum 6 air changes per hour (normal), 10 ACPH (smoke clearance mode)",
      "Minimum daylight factor: 1.0% for residential habitable rooms, 2.0% for classrooms and design offices",
      "Acoustic insulation between adjoining dwelling units >= 45 dB Sound Transmission Class (STC)"
    ]
  },
  {
    "id": "DOC-NAT-NBC-2016-LIFT",
    "title": "National Building Code of India 2016 (Part 8 Section 5: Lifts, Escalators & Passenger Transport)",
    "shortTitle": "NBC 2016 Lifts & Elevators",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2016",
    "version": "NBC 2016",
    "status": "verified",
    "categories": [
      "lifts",
      "accessibility",
      "fire_safety",
      "building_services"
    ],
    "source": {
      "authority": "Bureau of Indian Standards (BIS)",
      "officialUrl": "https://www.bis.gov.in",
      "documentType": "Manual",
      "publishedDate": "2016-12-01",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statutory installation criteria for passenger elevators, stretcher lifts, and firefighter emergency elevators.",
    "keyProvisions": [
      "Passenger lift mandatory for all multi-storey buildings exceeding 15.0m height (Ground + 4 storeys)",
      "Dedicated Fire Lift with minimum 8-passenger capacity and emergency power backup mandatory for buildings > 15m",
      "At least one 13-passenger stretcher lift (minimum internal car size 2000mm x 1100mm) for buildings > 24m",
      "Automatic Rescue Device (ARD) and two-way intercom connected to 24x7 security room mandatory"
    ]
  },
  {
    "id": "DOC-NAT-ECBC-2017",
    "title": "Energy Conservation Building Code 2017 (ECBC 2017 & Energy Conservation Act)",
    "shortTitle": "ECBC 2017 Commercial Norms",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2017",
    "version": "ECBC 2017 (Revised Edition)",
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
      "documentUrl": "https://beeindia.gov.in/en/energy-conservation-building-code-ecbc",
      "documentType": "Gazette",
      "publishedDate": "2017-06-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Mandatory energy efficiency thresholds for commercial buildings with connected load >= 100 kW or contract demand >= 120 kVA.",
    "keyProvisions": [
      "Maximum overall building envelope Window-to-Wall Ratio (WWR) capped at 40%",
      "Mandatory rooftop solar PV generation: minimum 1% to 2% of peak electrical connected demand",
      "Maximum solar heat gain coefficient (SHGC <= 0.25) and U-factor thresholds for exterior glazing",
      "Mandatory daylight integration sensors and auto-shutoff scheduling in office floor plates"
    ]
  },
  {
    "id": "DOC-NAT-ENS-2021",
    "title": "Eco-Niwas Samhita 2021 (Energy Conservation Building Code for Residential Buildings)",
    "shortTitle": "Eco-Niwas Samhita (ENS 2021)",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2021",
    "version": "ENS 2021 (Part I & Part II)",
    "status": "verified",
    "categories": [
      "green_building",
      "solar_requirements",
      "environmental_regulations"
    ],
    "source": {
      "authority": "Bureau of Energy Efficiency (BEE), Ministry of Power",
      "officialUrl": "https://econiwassamhita.in",
      "documentType": "Gazette",
      "publishedDate": "2021-08-20",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Prescribes thermal comfort and energy efficiency metrics (RETV, VLT, WWR, and solar rooftop) for residential multi-dwelling developments.",
    "keyProvisions": [
      "Residential Envelope Transmittance Value (RETV) strictly capped <= 15.0 W/sq.m for composite climate zones",
      "Minimum 30% of total unshaded roof area reserved for solar PV or solar water heating",
      "Minimum Visual Light Transmittance (VLT) >= 0.27 (27%) for exterior glazed windows",
      "Mandatory BEE 4-star / 5-star rated energy-efficient ceiling fans and LED lighting in common lobbies"
    ]
  },
  {
    "id": "DOC-NAT-MOHUA-ACC-2021",
    "title": "Harmonised Guidelines and Standards for Universal Accessibility in India 2021",
    "shortTitle": "MoHUA Universal Accessibility 2021",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "guideline",
    "documentPriority": "primary",
    "year": "2021",
    "version": "2021 Edition (RPwD Act 2016 Compliant)",
    "status": "verified",
    "categories": [
      "accessibility",
      "staircases",
      "lifts",
      "corridors"
    ],
    "source": {
      "authority": "Ministry of Housing and Urban Affairs (MoHUA)",
      "officialUrl": "https://mohua.gov.in",
      "documentUrl": "https://mohua.gov.in/upload/uploadfiles/files/HarmonisedGuidelines2021.pdf",
      "documentType": "Gazette",
      "publishedDate": "2021-12-10",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Comprehensive national standard ensuring 100% barrier-free accessibility for persons with disabilities in all public and commercial premises.",
    "keyProvisions": [
      "Wheelchair entry ramp: maximum gradient 1:12 (ideal 1:15), minimum clear width 1.2m, double handrails at 750mm and 900mm",
      "Accessible unisex toilet cubicle: minimum dimensions 2200mm x 2000mm with outward swinging 900mm door and grab bars",
      "Tactile paving guiding path (warning and directional blisters) connecting main gate to building elevators",
      "Reserved disabled parking space (min 3.6m width) located within 30m of main accessible building entrance"
    ]
  },
  {
    "id": "DOC-NAT-CGWA-RWH",
    "title": "Central Ground Water Authority (CGWA) Guidelines for Rainwater Harvesting & Groundwater NOC 2020",
    "shortTitle": "CGWA Rainwater & Groundwater Guidelines",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "statutory_act",
    "documentPriority": "primary",
    "year": "2020",
    "version": "CGWA Guidelines 2020 (Amended 2023)",
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
    "summary": "Mandates on-site rainwater harvesting recharge structures for plots >= 100 sq.m and prior statutory NOC for commercial borewells.",
    "keyProvisions": [
      "Compulsory rainwater harvesting recharge pit/trench for all plots >= 100 sq.m area",
      "Recharge structure volume: minimum 20 Litres per sq.m of rooftop catchment area",
      "Strict ban on direct injection of untreated surface road runoff into deep drinking water aquifers",
      "Digital flow meter with telemetry required on all commercial and industrial abstraction borewells"
    ]
  },
  {
    "id": "DOC-NAT-MOEFCC-EIA",
    "title": "MoEFCC Environment Impact Assessment (EIA) Notification 2006 (Building & Construction Projects)",
    "shortTitle": "MoEFCC EIA Notification 2006",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "statutory_act",
    "documentPriority": "primary",
    "year": "2006",
    "version": "EIA Notification 2006 (Amended up to 2024)",
    "status": "verified",
    "categories": [
      "environmental_regulations",
      "approvals_sanctions",
      "special_restriction"
    ],
    "source": {
      "authority": "Ministry of Environment, Forest and Climate Change (MoEFCC)",
      "officialUrl": "https://moef.gov.in",
      "documentUrl": "https://parivesh.nic.in",
      "documentType": "Gazette",
      "publishedDate": "2006-09-14",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Mandates prior statutory Environmental Clearance (EC) from SEIAA for built-up area >= 20,000 sq.m and from MoEFCC for >= 1,50,000 sq.m.",
    "keyProvisions": [
      "Built-up area 20,000 to 1,50,000 sq.m: Category 8(a) Prior Environmental Clearance from State SEIAA mandatory before ground breaking",
      "Townships and Area Development > 1,50,000 sq.m: Category 8(b) full EIA study and environmental public consultation",
      "Mandatory 100% on-site Sewage Treatment Plant (STP) with tertiary filtration for recycling in HVAC cooling and flushing",
      "Minimum 33% of project plot area dedicated to indigenous tree plantation and green belt"
    ]
  },
  {
    "id": "DOC-NAT-MOEFCC-CRZ",
    "title": "Coastal Regulation Zone (CRZ) Notification 2019",
    "shortTitle": "CRZ Notification 2019 (NCZMA)",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "statutory_act",
    "documentPriority": "primary",
    "year": "2019",
    "version": "CRZ Notification 2019 (Amended 2023)",
    "status": "verified",
    "categories": [
      "special_restriction",
      "environmental_regulations",
      "setbacks"
    ],
    "source": {
      "authority": "National Coastal Zone Management Authority (NCZMA) / MoEFCC",
      "officialUrl": "https://moef.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2019-01-18",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Regulates and restricts building development along coastal stretches, estuaries, backwaters, and tidal creeks throughout India.",
    "keyProvisions": [
      "CRZ-I (Ecologically Sensitive): Zero new construction permitted within 500m of High Tide Line (HTL)",
      "CRZ-II (Urbanized Areas on Seaward Side): Buildings permitted only on landward side of existing authorized road or structure",
      "CRZ-III (Rural Coastal Areas): No Development Zone (NDZ) of 50m (dense) to 200m (rural) from HTL",
      "Mandatory prior CZMA recommendation before local municipal building sanction in coastal districts"
    ]
  },
  {
    "id": "DOC-NAT-SWM-2016",
    "title": "Solid Waste Management Rules 2016 (Bulk Waste Generators)",
    "shortTitle": "Solid Waste Management Rules 2016",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "statutory_act",
    "documentPriority": "primary",
    "year": "2016",
    "version": "SWM Rules 2016",
    "status": "verified",
    "categories": [
      "environmental_regulations",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Central Pollution Control Board (CPCB), MoEFCC",
      "officialUrl": "https://cpcb.nic.in",
      "documentType": "Gazette",
      "publishedDate": "2016-04-08",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Mandatory on-site waste segregation and in-situ organic waste composting for residential and commercial bulk waste generators.",
    "keyProvisions": [
      "Applicable to all buildings generating > 100 kg waste/day or with plot area > 5,000 sq.m",
      "Mandatory three-bin segregation: Biodegradable (Wet), Non-biodegradable (Dry), Domestic Hazardous",
      "Compulsory on-site organic waste composter (OWC) or bio-methanation plant for wet waste",
      "Dedicated ventilated solid waste sorting room with minimum 15 sq.m area at ground/stilt level"
    ]
  },
  {
    "id": "DOC-NAT-CEA-HT",
    "title": "Central Electricity Authority (Measures Relating to Safety and Electric Supply) Regulations 2010",
    "shortTitle": "CEA High Voltage Clearances 2010",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "statutory_act",
    "documentPriority": "primary",
    "year": "2010",
    "version": "CEA Regulations 2010 (Amended 2023)",
    "status": "verified",
    "categories": [
      "setbacks",
      "height_floors",
      "special_restriction",
      "electrical"
    ],
    "source": {
      "authority": "Central Electricity Authority (CEA), Ministry of Power",
      "officialUrl": "https://cea.nic.in",
      "documentType": "Gazette",
      "publishedDate": "2010-09-20",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statutory minimum vertical and horizontal clearance corridors for buildings located in the vicinity of overhead high-voltage transmission lines.",
    "keyProvisions": [
      "Low/Medium Voltage (< 650V): Vertical clearance 2.5m, Horizontal clearance 1.2m",
      "High Voltage (11kV to 33kV): Vertical clearance 3.7m, Horizontal clearance 2.0m",
      "Extra High Voltage (66kV / 132kV / 220kV): Vertical 4.6m + 0.3m per 33kV; Horizontal 2.7m to 4.5m",
      "Absolute prohibition on erecting balconies, cantilevers, or scaffolding within designated safety envelope"
    ]
  },
  {
    "id": "DOC-NAT-AAI-NOCAS",
    "title": "Ministry of Civil Aviation GSR 751(E) & AAI NOCAS II Guidelines",
    "shortTitle": "AAI Airport Height Clearance (NOCAS II)",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "statutory_act",
    "documentPriority": "primary",
    "year": "2015",
    "version": "GSR 751(E) & NOCAS 2.0",
    "status": "verified",
    "categories": [
      "height_floors",
      "special_restriction",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Airports Authority of India (AAI), Ministry of Civil Aviation",
      "officialUrl": "https://nocas2.aai.aero",
      "documentType": "Gazette",
      "publishedDate": "2015-09-30",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Mandatory aerodrome obstacle limitation surface (OLS) height verification and Colour Coded Zoning Map (CCZM) compliance across India.",
    "keyProvisions": [
      "Top elevation (including lift machine room, overhead water tank, parapet, antennas) must not breach CCZM grid ceiling",
      "Automated online deemed clearance if proposed building height is below CCZM permissible elevation AMSL",
      "NOCAS II formal height NOC required for all structures breaching CCZM ceiling or within 20km airport radius",
      "Mandatory dual aviation obstacle warning lights for all structures exceeding 45.0m height"
    ]
  },
  {
    "id": "DOC-NAT-NMA-AMASR",
    "title": "Ancient Monuments and Archaeological Sites and Remains (AMASR) Act & NMA Guidelines",
    "shortTitle": "ASI & NMA Monument Clearances",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "statutory_act",
    "documentPriority": "primary",
    "year": "2010",
    "version": "AMASR (Amendment) Act 2010",
    "status": "verified",
    "categories": [
      "special_restriction",
      "height_floors",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "National Monuments Authority (NMA) / Archaeological Survey of India (ASI)",
      "officialUrl": "https://nma.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2010-03-30",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Enforces absolute construction prohibitions within 100m and statutory regulatory controls up to 300m from Centrally Protected Monuments.",
    "keyProvisions": [
      "Prohibited Area (0m to 100m): Absolute statutory ban on any new construction or vertical addition",
      "Regulated Area (100m to 300m): Mandatory prior online NOC from National Monuments Authority via SMARAC portal",
      "Heritage impact assessment and strict height restriction (normally <= 12m) to protect skyline of ancient monuments",
      "Non-bailable criminal penal provisions for unauthorized construction in prohibited heritage zones"
    ]
  },
  {
    "id": "DOC-NAT-CPCB-DG",
    "title": "CPCB Environment (Protection) Rules - Emission & Acoustic Standards for Diesel Generator (DG) Sets",
    "shortTitle": "CPCB DG Set Acoustic & Stack Norms",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "statutory_act",
    "documentPriority": "primary",
    "year": "2014",
    "version": "CPCB CPCB-IV+ Standards",
    "status": "verified",
    "categories": [
      "environmental_regulations",
      "building_services"
    ],
    "source": {
      "authority": "Central Pollution Control Board (CPCB), MoEFCC",
      "officialUrl": "https://cpcb.nic.in",
      "documentType": "Gazette",
      "publishedDate": "2014-07-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Mandatory acoustic enclosure sound level limits and minimum exhaust chimney stack height formula for standby power generators.",
    "keyProvisions": [
      "DG set acoustic enclosure must reduce noise by at least 25 dB(A) or meet ambient noise limit at 1.0m boundary",
      "Minimum exhaust stack height formula: H = h + 0.2 * sqrt(KVA) where h is building height in meters",
      "Strict prohibition on installing DG sets inside unventilated basements without dedicated fresh air and exhaust shafts",
      "Anti-vibration spring isolators mandatory under generator skid bed"
    ]
  },
  {
    "id": "DOC-NAT-NDMA-EQ",
    "title": "National Disaster Management Authority (NDMA) Guidelines for Earthquake Resilient Construction",
    "shortTitle": "NDMA & BIS Earthquake Standards (IS 1893 / IS 13920)",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "standard",
    "documentPriority": "primary",
    "year": "2016",
    "version": "IS 1893:2016 & IS 13920:2016",
    "status": "verified",
    "categories": [
      "structural_safety",
      "building_services"
    ],
    "source": {
      "authority": "National Disaster Management Authority (NDMA) / BIS",
      "officialUrl": "https://ndma.gov.in",
      "documentType": "Manual",
      "publishedDate": "2016-12-01",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Mandates seismic zone compliant ductile detailing, shear wall design, and structural peer review across Seismic Zones III, IV, and V.",
    "keyProvisions": [
      "Ductile detailing of reinforced concrete structures (IS 13920) mandatory for all multi-storey buildings in Zones III, IV, and V",
      "Soft storey (open stilt parking) requires special column shear magnification factor of 2.5 or bracing shear walls",
      "Structural engineer self-certification affidavit mandatory prior to municipal plan sanction",
      "Independent third-party peer review by IIT/NIT or approved structural proof consultants for buildings > 45m"
    ]
  },
  {
    "id": "DOC-NAT-MOHUA-MBBL",
    "title": "Model Building Bye-Laws 2016 (Ministry of Housing and Urban Affairs)",
    "shortTitle": "MoHUA Model Building Bye-Laws 2016",
    "level": 1,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "model_bye_laws",
    "documentPriority": "primary",
    "year": "2016",
    "version": "MBBL 2016 (Second Edition)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "approvals_sanctions",
      "green_building"
    ],
    "source": {
      "authority": "Ministry of Housing and Urban Affairs (MoHUA)",
      "officialUrl": "https://mohua.gov.in",
      "documentType": "Manual",
      "publishedDate": "2016-03-18",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "National guiding template integrating single-window automated approvals, structural safety, environmental thresholds, and barrier-free norms.",
    "keyProvisions": [
      "Online single-window building plan approval with deemed approval timelines (max 30 days)",
      "Risk-based fast-track sanction classification (Low, Medium, High Risk)",
      "Integration of environmental clearances into municipal building permission framework",
      "Incentive FAR bonuses of 5% to 15% for certified GRIHA / IGBC Green Buildings"
    ]
  }
];

export const NATIONAL_RULES: ByeLawRule[] = [
  {
    "id": "L1-NBC-2016-FIRE-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: National (NBC 2016 Fire Safety)",
    "jurisdiction": "National (BIS NBC 2016)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "fire_safety",
    "categoryName": "NBC 2016 High-Rise Fire Safety",
    "title": "NBC 2016 High-Rise Fire Safety & Refuge Area Norms",
    "clause": "NBC 2016 Part 4 Clause 4.3",
    "sourceDoc": "National Building Code of India 2016 (Part 4: Fire and Life Safety)",
    "sourceUrl": "https://www.bis.gov.in",
    "documentYear": "2016",
    "version": "Third Revision",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandates 6.0m peripheral driveway, refuge floors every 7th level, and pressurized fire staircases for buildings > 15m.",
    "parameters": {
      "highRiseThresholdM": 15.0,
      "minPeripheralDrivewayM": 6.0,
      "refugeFloorInterval": 7,
      "fireNocRequired": true
    },
    "detailedRequirements": [
      "Peripheral driveway around building must be minimum 6.0m clear width with load-bearing capacity of 45 tonnes for hydraulic ladders",
      "Refuge area required at first level above 24m and thereafter every 7th floor (minimum area 15 sq.m cantilevered or open-to-sky)",
      "Two enclosed staircases mandatory for all floors with area > 500 sq.m; at least one on external perimeter",
      "Pressurized staircases and lift lobbies for all towers exceeding 30 meters height"
    ]
  },
  {
    "id": "L1-NBC-2016-STAIR-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: National (NBC 2016 Egress)",
    "jurisdiction": "National (BIS NBC 2016)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "means_of_egress",
    "categoryName": "NBC 2016 Minimum Staircase & Egress",
    "title": "NBC 2016 Minimum Staircase Width & Dual Egress Norms",
    "clause": "NBC 2016 Part 4 Clause 4.4",
    "sourceDoc": "National Building Code of India 2016 (Part 4 Clause 4.4: Means of Egress & Staircases)",
    "sourceUrl": "https://www.bis.gov.in",
    "documentYear": "2016",
    "version": "Third Revision",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Specifies minimum width (1.25m residential / 2.0m commercial) and maximum 30m travel distance to exit.",
    "parameters": {
      "minStairWidthResidentialM": 1.25,
      "minStairWidthCommercialM": 2.0,
      "maxTravelDistanceM": 30.0,
      "maxRiserMm": 150,
      "minTreadMm": 300
    },
    "detailedRequirements": [
      "Residential multi-storey buildings require minimum 1.25m clear staircase width (1.5m if height > 24m)",
      "Commercial, institutional, and assembly buildings require minimum 2.0m clear staircase width",
      "Maximum travel distance to any fire escape staircase is 30m (45m if fully sprinklered)",
      "Treads must be minimum 300mm with non-slip nosing; maximum riser height 150mm"
    ]
  },
  {
    "id": "L1-NBC-2016-PARK-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: National (NBC 2016 Parking)",
    "jurisdiction": "National (BIS NBC 2016)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "parking",
    "categoryName": "NBC 2016 Parking ECS Standards",
    "title": "NBC 2016 Equivalent Car Space (ECS) Baseline Standards",
    "clause": "NBC 2016 Part 3 Clause 9.6",
    "sourceDoc": "National Building Code of India 2016 (Part 3 Clause 9.6: Parking & Transit Spaces)",
    "sourceUrl": "https://www.bis.gov.in",
    "documentYear": "2016",
    "version": "Third Revision",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Area per ECS: 23 sq.m open, 28 sq.m stilt, 32 sq.m basement; two-way driveways minimum 6.0m.",
    "parameters": {
      "ecsAreaOpenSqM": 23,
      "ecsAreaStiltSqM": 28,
      "ecsAreaBasementSqM": 32,
      "minDrivewayWidthM": 6.0
    },
    "detailedRequirements": [
      "Open surface parking: 23 sq.m per Equivalent Car Space (ECS) including driveways",
      "Stilt / Ground covered parking: 28 sq.m per ECS",
      "Basement parking: 32 sq.m per ECS including ramp transitions and column clearances",
      "Minimum clear ceiling height in basement parking: 2.4m (2.1m below beams/ducts)"
    ]
  },
  {
    "id": "L1-MOHUA-ACC-2021-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: National (Universal Accessibility)",
    "jurisdiction": "National (MoHUA / RPwD Act 2016)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "accessibility",
    "categoryName": "Universal Barrier-Free Accessibility",
    "title": "Universal Barrier-Free Accessibility & Ramp Standards",
    "clause": "Harmonised Guidelines 2021 Section 4",
    "sourceDoc": "Harmonised Guidelines and Standards for Universal Accessibility in India 2021",
    "sourceUrl": "https://mohua.gov.in",
    "documentYear": "2021",
    "version": "2021 Guidelines",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandatory wheelchair ramps (max slope 1:12), tactile paving, and accessible toilets in all public buildings.",
    "parameters": {
      "maxRampSlope": "1:12",
      "minRampWidthM": 1.2,
      "minToiletSizeM": "2.2 x 2.0"
    },
    "detailedRequirements": [
      "Main entrance ramp maximum slope 1:12 with minimum clear width of 1.20m and handrails at 750mm and 900mm",
      "At least one accessible toilet (minimum 2.2m x 2.0m) with grab rails and emergency call alarm per floor",
      "Tactile warning tiles before all staircases, ramps, and elevator entrances",
      "Braille floor indicators and auditory announcements in all passenger elevators"
    ]
  },
  {
    "id": "L1-CGWA-RWH-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: National (CGWA Groundwater)",
    "jurisdiction": "National (CGWA / Ministry of Jal Shakti)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "rainwater_harvesting",
    "categoryName": "Mandatory Rainwater Harvesting",
    "title": "Mandatory Rainwater Harvesting & Dual Plumbing",
    "clause": "CGWA Notification 2020 Clause 3.1",
    "sourceDoc": "Central Ground Water Authority (CGWA) Guidelines for Rainwater Harvesting & Groundwater NOC 2020",
    "sourceUrl": "https://cgwa-noc.gov.in",
    "documentYear": "2020",
    "version": "2020 Guidelines",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandatory RWH recharge well for plots >= 100 sq.m; dual plumbing network for built-up area >= 5,000 sq.m.",
    "parameters": {
      "minPlotAreaForRwhSqM": 100,
      "minStorageLitrePerSqmRoof": 20,
      "dualPlumbingThresholdSqM": 5000
    },
    "detailedRequirements": [
      "All plots >= 100 sq.m must install recharge pit, trench, or recharge shaft based on soil permeability",
      "Rooftop collection volume calculation: Min 20 Litres per sq.m of catchment area",
      "Direct injection into borewell prohibited unless passed through multi-layer sand-gravel filter",
      "Dual plumbing network for recycled flushing water mandatory for developments > 5,000 sq.m built-up area"
    ]
  },
  {
    "id": "L1-ECBC-2017-SOLAR-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: National (ECBC Energy)",
    "jurisdiction": "National (BEE / Ministry of Power)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "solar_requirements",
    "categoryName": "Rooftop Solar PV & Energy Baseline",
    "title": "Rooftop Solar PV Installation & EPI Baseline Mandate",
    "clause": "ECBC 2017 Clause 4.3.7",
    "sourceDoc": "Energy Conservation Building Code 2017 (ECBC 2017 & Energy Conservation Act)",
    "sourceUrl": "https://beeindia.gov.in",
    "documentYear": "2017",
    "version": "2017 Edition",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandatory solar PV generation >= 1% of peak connected load; maximum Window-to-Wall Ratio capped at 40%.",
    "parameters": {
      "minSolarPvPctPeakDemand": 1.0,
      "maxWwrPct": 40.0,
      "shgcThreshold": 0.25
    },
    "detailedRequirements": [
      "Commercial buildings with connected load >= 100 kW must install solar PV >= 1% of peak electrical demand",
      "Maximum aggregate Window-to-Wall Ratio (WWR) capped at 40% of total exterior wall area",
      "Solar Heat Gain Coefficient (SHGC) for exterior glazing must not exceed 0.25 in composite/hot-dry zones",
      "Energy Performance Index (EPI) must meet baseline target <= 120 kWh/sq.m/year for air-conditioned spaces"
    ]
  },
  {
    "id": "L1-CEA-HT-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: National (CEA Safety)",
    "jurisdiction": "National (CEA / Ministry of Power)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "setbacks",
    "categoryName": "High Tension (HT) Power Corridor",
    "title": "Statutory Setbacks from Overhead High Tension (HT) Power Lines",
    "clause": "CEA Safety Regulations 2010 Regulation 60 & 61",
    "sourceDoc": "Central Electricity Authority (Measures Relating to Safety and Electric Supply) Regulations 2010",
    "sourceUrl": "https://cea.nic.in",
    "documentYear": "2010",
    "version": "Amended 2023",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandates vertical (3.7m for 33kV, 4.6m for 66kV+) and horizontal (2.0m for 33kV, 4.0m for 66kV+) building clearance.",
    "parameters": {
      "clearance33kVVerticalM": 3.7,
      "clearance33kVHorizontalM": 2.0,
      "clearance66kVVerticalM": 4.6,
      "clearance66kVHorizontalM": 4.0
    },
    "detailedRequirements": [
      "11kV to 33kV lines: Minimum vertical clearance 3.7m from highest building point; Horizontal clearance 2.0m",
      "66kV to 132kV lines: Minimum vertical clearance 4.6m; Horizontal clearance 4.0m from exterior walls",
      "220kV to 400kV lines: Minimum vertical clearance 5.5m to 7.0m; Absolute corridor Right of Way (RoW) buffer 35m to 52m",
      "Zero construction, balconies, or scaffolding permitted inside statutory electrical safety envelope"
    ]
  },
  {
    "id": "L1-MOEFCC-EIA-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: National (MoEFCC EIA)",
    "jurisdiction": "National (MoEFCC / SEIAA)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "environmental_regulations",
    "categoryName": "Prior Environmental Clearance",
    "title": "Prior Environmental Clearance for Built-up Area >= 20,000 sq.m",
    "clause": "EIA Notification 2006 Item 8(a)",
    "sourceDoc": "MoEFCC Environment Impact Assessment (EIA) Notification 2006 (Building & Construction Projects)",
    "sourceUrl": "https://parivesh.nic.in",
    "documentYear": "2006",
    "version": "Amended 2024",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandatory prior Environmental Clearance (EC) from State SEIAA before starting construction for BUA >= 20,000 sq.m.",
    "parameters": {
      "eiaThresholdBuiltUpSqM": 20000,
      "largeTownshipThresholdSqM": 150000
    },
    "detailedRequirements": [
      "Built-up area >= 20,000 sq.m requires prior Environmental Clearance from State Environment Impact Assessment Authority (SEIAA)",
      "Zero ground excavation or tree cutting permitted on site prior to obtaining formal grant of EC",
      "Mandatory on-site Sewage Treatment Plant (STP) with 100% wastewater recycling for flushing and landscaping",
      "Minimum 33% of plot area must be maintained as green cover with multi-tier indigenous tree canopy"
    ]
  },
  {
    "id": "L1-MOEFCC-CRZ-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: National (CRZ Coastal)",
    "jurisdiction": "National (NCZMA / MoEFCC)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "special_restriction",
    "categoryName": "Coastal Regulation Zone Restrictions",
    "title": "Coastal Regulation Zone Buffer & Construction Setback Prohibitions",
    "clause": "CRZ Notification 2019 Clause 5",
    "sourceDoc": "Coastal Regulation Zone (CRZ) Notification 2019",
    "sourceUrl": "https://moef.gov.in",
    "documentYear": "2019",
    "version": "2019 Notification",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Prohibits new construction in CRZ-I (500m HTL) and enforces No-Development-Zone (NDZ) in coastal stretches.",
    "parameters": {
      "crz1BufferM": 500,
      "crz3NdzBufferM": 200
    },
    "detailedRequirements": [
      "CRZ-I: Zero construction permitted within 500m of High Tide Line (HTL) or ecologically sensitive mangrove areas",
      "CRZ-II: Buildings permitted only on landward side of existing authorized structures or approved master plan roads",
      "CRZ-III: 50m to 200m No Development Zone (NDZ) from High Tide Line; local traditional dwellings permitted beyond NDZ",
      "Prior NOC from State Coastal Zone Management Authority (SCZMA) mandatory before municipal sanction"
    ]
  },
  {
    "id": "L1-SWM-2016-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: National (CPCB Waste Management)",
    "jurisdiction": "National (CPCB / MoEFCC)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "environmental_regulations",
    "categoryName": "Bulk Waste Generator On-Site Composting",
    "title": "Bulk Waste Generator On-Site Composting & Waste Sorting Facility Mandate",
    "clause": "Solid Waste Management Rules 2016 Rule 4",
    "sourceDoc": "Solid Waste Management Rules 2016 (Bulk Waste Generators)",
    "sourceUrl": "https://cpcb.nic.in",
    "documentYear": "2016",
    "version": "2016 Rules",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandatory on-site organic waste composting and dedicated sorting rooms for buildings generating > 100 kg waste/day.",
    "parameters": {
      "wasteThresholdKgPerDay": 100,
      "plotThresholdSqM": 5000,
      "minSortingRoomAreaSqM": 15
    },
    "detailedRequirements": [
      "Gated communities, multi-storey apartments, and commercial complexes with plot area > 5,000 sq.m classified as Bulk Waste Generators",
      "100% in-situ composting or bio-methanation of organic biodegradable waste on site",
      "Mandatory 3-stream waste segregation infrastructure at source (Wet, Dry, Hazardous)",
      "Dedicated ventilated solid waste storage room with easy service vehicle access at ground level"
    ]
  },
  {
    "id": "L1-NDMA-EQ-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: National (Structural Safety)",
    "jurisdiction": "National (NDMA / BIS)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "structural_safety",
    "categoryName": "Seismic Zone Resilient Design",
    "title": "Seismic Zone Resilient Structural Detailing Standards",
    "clause": "IS 1893:2016 & IS 13920:2016",
    "sourceDoc": "National Disaster Management Authority (NDMA) Guidelines for Earthquake Resilient Construction",
    "sourceUrl": "https://ndma.gov.in",
    "documentYear": "2016",
    "version": "2016 Edition",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandatory ductile detailing, shear wall design, and independent third-party structural review for buildings in Zones III, IV, and V.",
    "parameters": {
      "structuralAuditMandatory": true,
      "highRiseProofCheckHeightM": 45.0
    },
    "detailedRequirements": [
      "Structural ductile detailing compliant with IS 13920 mandatory for all multi-storey buildings in Seismic Zones III, IV, and V",
      "Soft storey (open ground stilt) must be designed with special column confinement ties and 2.5x shear amplification",
      "Third-party structural proof check by approved government engineering institute (IIT/NIT) mandatory for buildings > 45m",
      "Structural stability certificate signed by licensed structural engineer mandatory before plan sanction and occupancy"
    ]
  },
  {
    "id": "L1-AAI-NOCAS-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: National (AAI Aviation)",
    "jurisdiction": "National (AAI / MoCA)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "height_floors",
    "categoryName": "Airport Height Clearance (OLS)",
    "title": "AAI Airport Obstacle Limitation Surface (OLS) & Height NOC Mandate",
    "clause": "Ministry of Civil Aviation GSR 751(E) Clause 3",
    "sourceDoc": "Ministry of Civil Aviation GSR 751(E) & AAI NOCAS II Guidelines",
    "sourceUrl": "https://nocas2.aai.aero",
    "documentYear": "2015",
    "version": "GSR 751(E)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Top elevation including lift rooms and water tanks must comply with CCZM grid AMSL limits around all civil aerodromes.",
    "parameters": {
      "cczmVerificationMandatory": true,
      "aviationLightHeightM": 45.0
    },
    "detailedRequirements": [
      "Total proposed building elevation (AMSL) including all rooftop appurtenances must not exceed Colour Coded Zoning Map (CCZM) ceiling",
      "Online NOCAS II application mandatory if structure breaches CCZM grid permissible elevation or lies within 20km aerodrome radius",
      "Aviation obstruction warning lights (medium-intensity red flashing) mandatory for all structures > 45m height",
      "Local municipal bodies prohibited from releasing Commencement Certificate without verified CCZM clearance"
    ]
  },
  {
    "id": "L1-NMA-AMASR-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: National (Heritage Protection)",
    "jurisdiction": "National (NMA / ASI)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "special_restriction",
    "categoryName": "Monument Prohibited & Regulated Zones",
    "title": "ASI Prohibited 100m Buffer & Regulated 200m Buffer Construction Clearance",
    "clause": "AMASR Act Section 20A & 20B",
    "sourceDoc": "Ancient Monuments and Archaeological Sites and Remains (AMASR) Act & NMA Guidelines",
    "sourceUrl": "https://nma.gov.in",
    "documentYear": "2010",
    "version": "AMASR 2010",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "0m to 100m from monument: Absolute construction ban; 100m to 300m: Prior online NOC from NMA mandatory.",
    "parameters": {
      "prohibitedZoneRadiusM": 100,
      "regulatedZoneRadiusM": 200,
      "nmaNocMandatory": true
    },
    "detailedRequirements": [
      "0 to 100 meters around Centrally Protected Monuments declared as Prohibited Area: Zero new construction permitted",
      "100 to 300 meters declared as Regulated Area: Prior online NOC from National Monuments Authority (NMA) mandatory",
      "Maximum permissible building height in regulated zone determined by site-specific heritage bye-laws",
      "Strict penal liability including mandatory demolition and non-bailable imprisonment for violations"
    ]
  },
  {
    "id": "L1-CPCB-DG-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: National (CPCB Emissions)",
    "jurisdiction": "National (CPCB / MoEFCC)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "environmental_regulations",
    "categoryName": "DG Set Acoustic & Stack Clearance",
    "title": "Acoustic Enclosure & Stack Height Clearances for Standby Diesel Generators",
    "clause": "Environment (Protection) Rules Schedule I",
    "sourceDoc": "CPCB Environment (Protection) Rules - Emission & Acoustic Standards for Diesel Generator (DG) Sets",
    "sourceUrl": "https://cpcb.nic.in",
    "documentYear": "2014",
    "version": "CPCB Standards",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandates acoustic enclosure with 25 dB(A) noise reduction and minimum exhaust stack formula: H = h + 0.2*sqrt(KVA).",
    "parameters": {
      "minAcousticAttenuationDb": 25,
      "antiVibrationPadsRequired": true
    },
    "detailedRequirements": [
      "DG set acoustic enclosure must ensure minimum 25 dB(A) insertion loss or meet ambient noise standards at 1.0m",
      "Exhaust chimney stack height calculated as: H = h + 0.2 * sqrt(KVA) above the highest roof level",
      "DG installation in basements requires dedicated intake air ventilation fans and rated fire isolation walls",
      "Consent to Establish (CTE) from State Pollution Control Board required for industrial/commercial installations > 500 kVA"
    ]
  },
  {
    "id": "L1-ENS-2021-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: National (Eco-Niwas Samhita)",
    "jurisdiction": "National (BEE / Eco-Niwas Samhita)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "green_building",
    "categoryName": "Residential Energy Efficiency",
    "title": "Eco-Niwas Samhita (ENS 2021) Residential Building Thermal Comfort Standards",
    "clause": "Eco-Niwas Samhita 2021 Part II",
    "sourceDoc": "Eco-Niwas Samhita 2021 (Energy Conservation Building Code for Residential Buildings)",
    "sourceUrl": "https://econiwassamhita.in",
    "documentYear": "2021",
    "version": "ENS 2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Residential Envelope Transmittance Value (RETV) capped <= 15 W/sq.m; 30% unshaded roof reserved for solar.",
    "parameters": {
      "maxRetvWSqM": 15.0,
      "minSolarRoofCoveragePct": 30.0,
      "minVltPct": 27.0
    },
    "detailedRequirements": [
      "Residential Envelope Transmittance Value (RETV) must not exceed 15.0 W/sq.m in composite and hot-dry climates",
      "Minimum 30% of total unshaded roof area must be reserved for solar photovoltaic or solar water heating systems",
      "Visible Light Transmittance (VLT) of external glazed windows must be >= 0.27 to maximize natural daylighting",
      "Common area LED lighting and high-efficiency pumping systems mandatory in multi-dwelling group housing"
    ]
  },
  {
    "id": "L1-MOHUA-MBBL-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: National (Model Building Bye-Laws)",
    "jurisdiction": "National (MoHUA MBBL 2016)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "approvals_sanctions",
    "categoryName": "Model Single Window Sanctions",
    "title": "Model Building Bye-Laws 2016 Fast-Track Single Window Approvals",
    "clause": "MBBL 2016 Chapter 2",
    "sourceDoc": "Model Building Bye-Laws 2016 (Ministry of Housing and Urban Affairs)",
    "sourceUrl": "https://mohua.gov.in",
    "documentYear": "2016",
    "version": "2016 Framework",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Single-window online approval system with 30-day deemed sanction and risk-based scrutiny categorization.",
    "parameters": {
      "maxSanctionDays": 30,
      "greenBuildingFarIncentivePct": 5.0
    },
    "detailedRequirements": [
      "Online Common Application Form (CAF) integrated with fire, environment, heritage, and airport departments",
      "Deemed building plan sanction if no objection raised within 30 working days from fee confirmation",
      "Risk-based scrutiny framework: Low-risk residential plots <= 105 sq.m approved via architect self-certification",
      "Incentive additional FAR of 5% to 15% for GRIHA 4/5 star or IGBC Gold/Platinum green certified projects"
    ]
  },
  {
    "id": "L1-NBC-2016-DCR-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: National (NBC 2016 General Requirements)",
    "jurisdiction": "National (BIS NBC 2016)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "ground_coverage",
    "categoryName": "NBC 2016 Ground Coverage & Height",
    "title": "NBC 2016 Maximum Ground Coverage & Habitable Room Dimensions",
    "clause": "NBC 2016 Part 3 Clause 6.4",
    "sourceDoc": "National Building Code of India 2016 (Part 3: Development Control Rules & General Building Requirements)",
    "sourceUrl": "https://www.bis.gov.in",
    "documentYear": "2016",
    "version": "Third Revision",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Ground coverage caps (66% plotted / 33% group housing) and minimum 2.75m clear room height.",
    "parameters": {
      "maxCoveragePlottedPct": 66.0,
      "maxCoverageGroupHousingPct": 33.3,
      "minRoomHeightM": 2.75
    },
    "detailedRequirements": [
      "Plotted residential ground coverage restricted to 66% (up to 75% for small plots <= 200 sq.m)",
      "Group housing developments capped at 33.3% to 40% ground coverage with 15% dedicated green space",
      "Habitable room clear ceiling height minimum 2.75m (air-conditioned rooms minimum 2.40m)",
      "Bathroom minimum clear area 1.8 sq.m with minimum width 1.2m and ventilation window opening"
    ]
  },
  {
    "id": "L1-NBC-2016-PLUMB-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: National (NBC 2016 Plumbing)",
    "jurisdiction": "National (BIS NBC 2016)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "plumbing",
    "categoryName": "NBC 2016 Water Supply & Drainage",
    "title": "NBC 2016 Domestic Water Sizing & Dual Plumbing Standards",
    "clause": "NBC 2016 Part 9 Section 1",
    "sourceDoc": "National Building Code of India 2016 (Part 9: Plumbing Services)",
    "sourceUrl": "https://www.bis.gov.in",
    "documentYear": "2016",
    "version": "Third Revision",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "135 LPCD residential water benchmark and mandatory dual plumbing network for treated recycled water.",
    "parameters": {
      "domesticDemandLpcd": 135,
      "dualPipingMandatory": true
    },
    "detailedRequirements": [
      "Per capita domestic water demand: 135 LPCD (90 litres domestic potable + 45 litres flushing)",
      "Dedicated underground water tank with minimum 1-day storage capacity plus mandatory dedicated fire static reserve",
      "Dual plumbing distribution network mandatory to receive recycled STP water for toilet cisterns and horticulture",
      "Air gap and non-return backflow preventers mandatory on main municipal water supply lines"
    ]
  },
  {
    "id": "L1-NBC-2016-HVAC-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: National (NBC 2016 HVAC & Ventilation)",
    "jurisdiction": "National (BIS NBC 2016)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "building_services",
    "categoryName": "NBC 2016 Ventilation & Air Changes",
    "title": "NBC 2016 Natural Ventilation Openings & Basement Smoke Extraction",
    "clause": "NBC 2016 Part 8 Section 3",
    "sourceDoc": "National Building Code of India 2016 (Part 8: Lighting, Ventilation & HVAC)",
    "sourceUrl": "https://www.bis.gov.in",
    "documentYear": "2016",
    "version": "Third Revision",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Minimum window area >= 10% floor area; basement smoke extraction minimum 10 Air Changes Per Hour (ACPH).",
    "parameters": {
      "minWindowOpenPctFloor": 10.0,
      "basementSmokeAcph": 10.0
    },
    "detailedRequirements": [
      "Habitable rooms must provide natural window openings >= 10% of carpet floor area directly opening to exterior open space",
      "Mechanical basement ventilation must provide minimum 6 air changes per hour (normal) and 10 ACPH (fire smoke mode)",
      "Fire dampers with 2-hour rating mandatory in all HVAC ducts penetrating fire-rated floor slabs and shaft walls",
      "Outdoor fresh air intake minimum 5 Litres/second per person in commercial and office occupancy"
    ]
  },
  {
    "id": "L1-NBC-2016-LIFT-01",
    "tier": "national",
    "level": 1,
    "levelName": "Level 1: National (NBC 2016 Lift Standards)",
    "jurisdiction": "National (BIS NBC 2016)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "lifts",
    "categoryName": "NBC 2016 Passenger & Stretcher Lifts",
    "title": "NBC 2016 Mandatory Passenger Lift & Stretcher Lift Norms",
    "clause": "NBC 2016 Part 8 Section 5",
    "sourceDoc": "National Building Code of India 2016 (Part 8 Section 5: Lifts, Escalators & Passenger Transport)",
    "sourceUrl": "https://www.bis.gov.in",
    "documentYear": "2016",
    "version": "Third Revision",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Passenger lift mandatory for buildings > 15m; 13-passenger stretcher lift mandatory for buildings > 24m.",
    "parameters": {
      "liftMandatoryHeightM": 15.0,
      "stretcherLiftHeightM": 24.0,
      "stretcherLiftCapacity": 13
    },
    "detailedRequirements": [
      "Passenger lift mandatory for all buildings taller than 15.0m (Ground + 4 storeys)",
      "High-rise towers > 24m must provide at least one 13-passenger stretcher lift with minimum internal car depth 2.0m",
      "Dedicated Firefighter Lift with 8-passenger capacity, waterproof call stations, and 2-hour rated fire doors for towers > 15m",
      "Automatic Rescue Device (ARD) with auxiliary battery backup to bring lift to nearest landing during grid power failure"
    ]
  }
];

export const NATIONAL_BYE_LAW_RULES = NATIONAL_RULES;
