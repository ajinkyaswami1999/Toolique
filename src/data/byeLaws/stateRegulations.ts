// Level 2: State Building Codes & Unified DCRs (36 States & UTs - 36 Verified Documents & Rules)

import type { ByeLawRule, RegulationDocument } from './types';

export const STATE_REGULATION_DOCUMENTS: RegulationDocument[] = [
  {
    "id": "DOC-STATE-HAR-HBC-2017",
    "title": "Haryana Building Code 2017 (Amended up to 2023)",
    "shortTitle": "Haryana Building Code 2017",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Haryana"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2017",
    "version": "HBC-2017 (Amended 2023)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Department of Town & Country Planning (DTCP Haryana)",
      "officialUrl": "https://tcpharyana.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2017-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Unified statutory building code governing permissible FAR, ground coverage, mandatory stilt parking, and setbacks for all urban estates across Haryana.",
    "keyProvisions": [
      "Residential Plotted: Base FAR 1.45 to 2.00, maximum purchasable FAR up to 2.64 depending on plot area",
      "Stilt + 4 storeys allowed on plots abutting minimum 9.0m to 12.0m roads subject to structural indemnity",
      "Compulsory on-site rainwater harvesting recharge well for all plots >= 100 sq.m",
      "Mandatory dual plumbing network for all group housing and commercial complexes > 2,000 sq.m"
    ]
  },
  {
    "id": "DOC-STATE-MAH-UDCPR-2020",
    "title": "Unified Development Control and Promotion Regulations for Maharashtra (UDCPR 2020)",
    "shortTitle": "Maharashtra UDCPR 2020",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Maharashtra"
    },
    "documentType": "model_bye_laws",
    "documentPriority": "primary",
    "year": "2020",
    "version": "UDCPR 2020 (Amended 2023)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Urban Development Department, Government of Maharashtra",
      "officialUrl": "https://urban.maharashtra.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2020-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Unified development control regulations standardizing FSI, TDR loading, premium FSI, and amenity space reservation across Maharashtra.",
    "keyProvisions": [
      "Base FSI 1.10 for residential; Premium FSI up to 0.50 and TDR loading up to 0.40 depending on road width",
      "Maximum permissible FSI reaches up to 2.00 to 3.00 on road widths >= 18.0m to 30.0m",
      "Mandatory 5% to 10% Recreational Open Space (ROS) and 5% Amenity Space for plots > 4,000 sq.m",
      "Inclusive Housing mandate: 20% of residential built-up area for EWS/LIG in layouts > 4,000 sq.m"
    ]
  },
  {
    "id": "DOC-STATE-DEL-UBBL-2016",
    "title": "Unified Building Bye-Laws for Delhi 2016 (UBBL-2016)",
    "shortTitle": "Delhi UBBL 2016",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Delhi (NCT)"
    },
    "documentType": "model_bye_laws",
    "documentPriority": "primary",
    "year": "2016",
    "version": "UBBL-2016 (Amended 2023)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Delhi Development Authority & MoHUA",
      "officialUrl": "https://dda.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2016-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Unified building rules governing setbacks, ground coverage, FAR, and online sanction procedures across DDA, MCD, and NDMC jurisdictions.",
    "keyProvisions": [
      "Plotted residential FAR ranges from 200 (plots > 750 sq.m) to 350 (plots <= 100 sq.m)",
      "Maximum permissible building height: 15.0m without stilt; 17.5m with mandatory ground stilt parking",
      "Mandatory dual plumbing network and solar water heating for all plots >= 500 sq.m",
      "Single-window automated sanction scheme with deemed approval for low-risk plots <= 105 sq.m"
    ]
  },
  {
    "id": "DOC-STATE-KAR-MBBL-2020",
    "title": "Karnataka Planning Authorities & Municipalities Building Bye-Laws 2020",
    "shortTitle": "Karnataka Building Bye-Laws 2020",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Karnataka"
    },
    "documentType": "model_bye_laws",
    "documentPriority": "primary",
    "year": "2020",
    "version": "Karnataka Model Bye-Laws 2020",
    "status": "verified",
    "categories": [
      "far_fsi",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Urban Development Department, Government of Karnataka",
      "officialUrl": "https://udd.karnataka.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2020-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statewide development controls regulating road-width linked FAR, setbacks, and mandatory high-rise fire buffers throughout Karnataka.",
    "keyProvisions": [
      "Base FAR 1.50 to 2.50 linked directly to abutting road width and plot depth",
      "Premium FAR up to 0.60 purchasable on roads >= 12.0m width on payment of 50% guidance value",
      "Mandatory rainwater harvesting recharge sumps for all sites >= 120 sq.m (30x40 plots)",
      "High-rise towers (> 15m) require 6.0m all-around peripheral clear setback for emergency fire access"
    ]
  },
  {
    "id": "DOC-STATE-TN-TNCDBR-2019",
    "title": "Tamil Nadu Combined Development and Building Rules 2019 (TNCDBR 2019)",
    "shortTitle": "Tamil Nadu TNCDBR 2019",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Tamil Nadu"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2019",
    "version": "TNCDBR 2019 (Amended 2023)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Housing and Urban Development Department, Government of Tamil Nadu",
      "officialUrl": "https://tn.gov.in/tcp",
      "documentType": "Gazette",
      "publishedDate": "2019-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Unified building rules governing Non-High Rise and High-Rise developments, premium FSI, and OSR across all municipal corporations in Tamil Nadu.",
    "keyProvisions": [
      "Non-High Rise Buildings (up to 18.3m): Base FSI 1.50 to 2.00; Premium FSI up to 50% on road width >= 12m",
      "High-Rise Buildings (> 18.3m): Base FSI 2.00 to 2.75 with maximum FSI up to 3.25 to 4.00 on roads >= 18m",
      "Mandatory Open Space Reservation (OSR) of 10% for land developments exceeding 3,000 sq.m area",
      "Rainwater harvesting structure mandatory for all building categories without exception"
    ]
  },
  {
    "id": "DOC-STATE-TG-TGBPASS-2020",
    "title": "Telangana Building Rules (G.O. Ms. No. 168 & TG-bPASS Act 2020)",
    "shortTitle": "Telangana Building Rules & TG-bPASS",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Telangana"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2020",
    "version": "G.O. Ms. No. 168 (Amended 2023)",
    "status": "verified",
    "categories": [
      "setbacks",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Municipal Administration & Urban Development (MA&UD Telangana)",
      "officialUrl": "https://tgbpass.telangana.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2020-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statewide statutory building rules governing non-FAR unlimited density regime, height-linked setbacks, and single-window online approvals.",
    "keyProvisions": [
      "Unlimited Floor Space Index (No FSI Cap) subject only to road width, plot coverage, and mandatory setbacks",
      "Mandatory setbacks scale dynamically with building height (e.g. 7.0m for 18-24m, 9.0m for 24-30m, 16.0m for > 55m)",
      "TG-bPASS Instant approval for plots <= 75 sq.m (deemed pass) and plots <= 500 sq.m (single window 21 days)",
      "City Level Infrastructure Impact Fee applicable on built-up areas beyond standard baseline"
    ]
  },
  {
    "id": "DOC-STATE-AP-APDPMS-2017",
    "title": "Andhra Pradesh Building Rules 2017 (G.O. Ms. No. 119 & APDPMS)",
    "shortTitle": "Andhra Pradesh Building Rules 2017",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Andhra Pradesh"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2017",
    "version": "G.O. Ms. No. 119 (Amended 2022)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Municipal Administration & Urban Development (MA&UD AP)",
      "officialUrl": "https://apdpms.ap.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2017-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statewide development control rules governing plotted layouts, group development schemes, transfer of development rights (TDR), and coastal regulations.",
    "keyProvisions": [
      "Plotted residential FAR 1.50 to 2.50; Commercial FAR up to 3.00 on arterial roads >= 18m",
      "APDPMS Online single-window building plan scrutiny with automated CAD compliance verification",
      "Mandatory 10% Open Space Reservation (OSR) for layouts exceeding 3,000 sq.m",
      "TDR certificates issued for road widening surrenders redeemable up to 200% of surrendered land value"
    ]
  },
  {
    "id": "DOC-STATE-UP-BLR-2008",
    "title": "Uttar Pradesh Urban Planning and Development (Building) Regulations 2008",
    "shortTitle": "UP Building Regulations 2008",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Uttar Pradesh"
    },
    "documentType": "model_bye_laws",
    "documentPriority": "primary",
    "year": "2008",
    "version": "Amended up to 2022",
    "status": "verified",
    "categories": [
      "far_fsi",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Housing and Urban Planning Department, Government of Uttar Pradesh",
      "officialUrl": "https://awas.up.nic.in",
      "documentType": "Gazette",
      "publishedDate": "2008-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs permissible FAR, purchasable FAR, setbacks, and high-rise group housing standards across all Development Authorities in UP.",
    "keyProvisions": [
      "Residential Plotted Base FAR 1.50 to 2.00; Purchasable FAR up to 0.75 on roads >= 12.0m",
      "Group Housing: Base FAR 1.50 to 2.50; Purchasable FAR up to 1.00 on roads >= 24.0m",
      "Ground coverage capped at 35% to 40% for group housing with mandatory 15% ground green area",
      "Compulsory rainwater harvesting recharge pits for all buildings on plots >= 300 sq.m"
    ]
  },
  {
    "id": "DOC-STATE-RAJ-UBBL-2020",
    "title": "Rajasthan Unified Building Bye-Laws 2020 (Amended 2023)",
    "shortTitle": "Rajasthan Building Bye-Laws 2020",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Rajasthan"
    },
    "documentType": "model_bye_laws",
    "documentPriority": "primary",
    "year": "2020",
    "version": "UBBL Rajasthan 2020",
    "status": "verified",
    "categories": [
      "far_fsi",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Urban Development and Housing Department (UDH Rajasthan)",
      "officialUrl": "https://urban.rajasthan.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2020-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statewide unified building code governing Standard FAR, Betterment/Purchasable FAR, setbacks, and heritage zone controls across Rajasthan.",
    "keyProvisions": [
      "Standard FAR 1.33 to 1.66 for plotted residential; Maximum Betterment FAR up to 2.25 on roads >= 12m",
      "Commercial arterial corridors (roads >= 24m) permit FAR up to 3.00 with premium payment",
      "Mandatory rainwater harvesting structure for all plots >= 225 sq.m (300 sq.yards)",
      "Strict Walled City heritage conservation guidelines in Jaipur, Jodhpur, and Udaipur"
    ]
  },
  {
    "id": "DOC-STATE-GUJ-CGDCR-2017",
    "title": "Comprehensive General Development Control Regulations (CGDCR 2017 - Gujarat)",
    "shortTitle": "Gujarat CGDCR 2017",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Gujarat"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2017",
    "version": "CGDCR 2017 (Amended 2023)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Urban Development and Urban Housing Department (UDD Gujarat)",
      "officialUrl": "https://udd.gujarat.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2017-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Comprehensive statewide unified regulations standardizing Base FSI, Chargeable FSI, Transit Oriented Zones (TOZ), and fire norms across Gujarat.",
    "keyProvisions": [
      "Base FSI 1.20 to 1.80; Chargeable (Paid) FSI up to 0.90 to 1.80 on road widths >= 12.0m to 36.0m",
      "Transit Oriented Zone (TOZ) along BRTS and Metro corridors permits maximum FSI up to 4.00",
      "Mandatory 10% to 20% Common Plot (COP) reservation for sub-divided layouts > 1,500 sq.m",
      "Compulsory solar rooftop installation for all commercial and institutional buildings"
    ]
  },
  {
    "id": "DOC-STATE-WB-MBR-2007",
    "title": "West Bengal Municipal (Building) Rules 2007 (Amended 2022)",
    "shortTitle": "West Bengal Municipal Building Rules",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "West Bengal"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2007",
    "version": "Amended 2022",
    "status": "verified",
    "categories": [
      "far_fsi",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Department of Urban Development & Municipal Affairs, West Bengal",
      "officialUrl": "https://www.wburbanservices.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2007-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statewide municipal building rules governing permissible FAR, tenement density, mandatory open spaces, and water-body conservation.",
    "keyProvisions": [
      "Permissible FAR 1.50 to 2.75 linked strictly to abutting road width (minimum road width 7.0m for multi-storey)",
      "High-rise towers (> 15.5m) require prior clearance from State Level Fire & Emergency Services",
      "Mandatory side and rear open spaces scale directly with total building height",
      "Absolute ban on filling, encroaching, or reducing statutory buffers around natural water bodies"
    ]
  },
  {
    "id": "DOC-STATE-KER-KMBR-2019",
    "title": "Kerala Municipality Building Rules 2019 (KMBR 2019)",
    "shortTitle": "Kerala KMBR 2019",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Kerala"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2019",
    "version": "KMBR 2019 (Amended 2023)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Local Self Government Department (LSGD Kerala)",
      "officialUrl": "https://lsgkerala.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2019-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Comprehensive statewide building regulations governing residential coverage, FAR ceilings, coastal CRZ, and disaster-resilient slopes.",
    "keyProvisions": [
      "Residential Plotted Base FAR 2.00 to 3.00; Purchasable Additional FAR up to 4.00 on roads >= 10.0m",
      "Maximum ground coverage capped at 65% for residential (50% for commercial/industrial)",
      "Mandatory Rainwater Harvesting tank capacity: minimum 25 Litres per sq.m of built-up area",
      "Mandatory hill slope stabilization clearances and structural peer review for land with slope > 1:4"
    ]
  },
  {
    "id": "DOC-STATE-PUN-PMBBL-2018",
    "title": "Punjab Model Building Bye-Laws 2018 (PUDA & Local Government)",
    "shortTitle": "Punjab Building Bye-Laws 2018",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Punjab"
    },
    "documentType": "model_bye_laws",
    "documentPriority": "primary",
    "year": "2018",
    "version": "PMBBL 2018 (Amended 2022)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Housing and Urban Development Department (PUDA Punjab)",
      "officialUrl": "https://puda.punjab.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2018-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs plotted residential setbacks, group housing density, industrial development norms, and Stilt + 3 floor permissions across Punjab.",
    "keyProvisions": [
      "Plotted residential FAR 1.50 to 2.00; Purchasable FAR up to 2.50 on roads >= 12.0m width",
      "Stilt + 3 floors permitted on individual plots with independent floor registry rights",
      "Group Housing maximum permissible FAR 2.50 to 3.00 on master roads >= 24.0m",
      "Mandatory dual plumbing and tertiary treated effluent reuse in all group housing projects"
    ]
  },
  {
    "id": "DOC-STATE-MP-MPBVN-2012",
    "title": "Madhya Pradesh Bhumi Vikas Niyam 2012 (MPBVN 2012 Amended 2023)",
    "shortTitle": "MP Bhumi Vikas Niyam 2012",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Madhya Pradesh"
    },
    "documentType": "model_bye_laws",
    "documentPriority": "primary",
    "year": "2012",
    "version": "MPBVN 2012 (Amended 2023)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Directorate of Town & Country Planning (T&CP Madhya Pradesh)",
      "officialUrl": "https://tcp.mp.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2012-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statewide land development and building regulations governing FAR, Open Spaces, and automated building sanction across MP.",
    "keyProvisions": [
      "Residential Plotted Base FAR 1.25 to 1.75; Purchasable FAR up to 2.50 on roads >= 18m",
      "Commercial arterial road FAR up to 3.00 in TOD corridors (MR-10 Indore & Hoshangabad Road Bhopal)",
      "Mandatory 15% open space reservation for group developments > 2,000 sq.m",
      "Online ABPAS (Automated Building Plan Approval System) deemed clearance in 15 days"
    ]
  },
  {
    "id": "DOC-STATE-ODI-OBPAS-2020",
    "title": "Odisha Development Authorities (Planning & Building Standards) Rules 2020",
    "shortTitle": "Odisha Building Rules 2020",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Odisha"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2020",
    "version": "OBPAS Rules 2020",
    "status": "verified",
    "categories": [
      "far_fsi",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Housing & Urban Development Department, Government of Odisha",
      "officialUrl": "https://obpas.odisha.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2020-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs statutory FAR, purchasable FAR, cyclone-resilient structural designs, and automated building plan permissions across Odisha.",
    "keyProvisions": [
      "Base FAR 1.50 to 2.00; Purchasable FAR up to 3.00 on roads >= 18.0m in Bhubaneswar and Cuttack",
      "Special structural design codes for Cyclone Wind Speed Zone (up to 55 m/s) along coastal belts",
      "OBPAS single window online system: instant approval for residential buildings on plots <= 500 sq.m",
      "Mandatory 10% green area and on-site stormwater retention ponds for plots > 4,000 sq.m"
    ]
  },
  {
    "id": "DOC-STATE-BIH-BBL-2014",
    "title": "Bihar Building Bye-Laws 2014 (Amended up to 2022)",
    "shortTitle": "Bihar Building Bye-Laws 2014",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Bihar"
    },
    "documentType": "model_bye_laws",
    "documentPriority": "primary",
    "year": "2014",
    "version": "Amended 2022",
    "status": "verified",
    "categories": [
      "height_floors",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Urban Development and Housing Department (UDHD Bihar)",
      "officialUrl": "https://urban.bih.nic.in",
      "documentType": "Gazette",
      "publishedDate": "2014-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statewide development controls regulating road-width linked FAR, seismic safety (Zone IV/V), and fire clearance across Bihar.",
    "keyProvisions": [
      "Plotted residential FAR 1.50 to 2.00; Commercial FAR up to 2.50 on roads >= 15.0m",
      "Maximum building height strictly linked to abutting road width: Height <= 1.5 * (Road Width + Front Setback)",
      "Seismic Zone IV & V structural ductile detailing mandatory for all multi-storey buildings > 11m",
      "Compulsory rainwater harvesting recharge well for all plots >= 150 sq.m"
    ]
  },
  {
    "id": "DOC-STATE-JHA-JBBL-2016",
    "title": "Jharkhand Building Bye-Laws 2016 (Amended 2021)",
    "shortTitle": "Jharkhand Building Bye-Laws 2016",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Jharkhand"
    },
    "documentType": "model_bye_laws",
    "documentPriority": "primary",
    "year": "2016",
    "version": "Amended 2021",
    "status": "verified",
    "categories": [
      "far_fsi",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Urban Development & Housing Department, Jharkhand",
      "officialUrl": "https://udhd.jharkhand.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2016-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statewide statutory building code governing permissible FAR, setback alignments, and automated online approvals via JAPIT.",
    "keyProvisions": [
      "Plotted residential FAR 1.50 to 2.00; Group Housing FAR up to 2.50 on roads >= 18.0m",
      "Online single-window building sanction with automated CAD verification",
      "Mandatory 15% open green space in group housing layouts exceeding 2,000 sq.m",
      "Compulsory on-site rainwater harvesting structure for all plots >= 150 sq.m"
    ]
  },
  {
    "id": "DOC-STATE-ASM-UBR-2022",
    "title": "Assam Unified Building Construction (Regulation) Byelaws 2022",
    "shortTitle": "Assam Unified Building Byelaws 2022",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Assam"
    },
    "documentType": "model_bye_laws",
    "documentPriority": "primary",
    "year": "2022",
    "version": "Assam Byelaws 2022",
    "status": "verified",
    "categories": [
      "structural_safety",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Department of Housing and Urban Affairs (DoHUA Assam)",
      "officialUrl": "https://gdd.assam.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2022-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Unified state building code incorporating Seismic Zone V structural design, hill slope cut-and-fill limits, and flood resilience.",
    "keyProvisions": [
      "Residential Plotted Base FAR 1.50 to 2.00; Commercial FAR up to 2.50 on roads >= 15.0m",
      "Seismic Zone V mandatory ductile detailing and structural peer review by certified proof consultant",
      "Hill terrain construction restrictions: Maximum building height 12.0m; zero construction on slopes > 30 degrees",
      "Natural drainage channel buffer: Minimum 15m non-construction corridor along rivers and primary wetlands"
    ]
  },
  {
    "id": "DOC-STATE-UK-BBL-2011",
    "title": "Uttarakhand Building Bye-Laws and Regulations 2011 (Amended 2020)",
    "shortTitle": "Uttarakhand Building Regulations",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Uttarakhand"
    },
    "documentType": "model_bye_laws",
    "documentPriority": "primary",
    "year": "2011",
    "version": "Amended 2020 (Hill & Plain Norms)",
    "status": "verified",
    "categories": [
      "height_floors",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Housing and Urban Development Department, Uttarakhand",
      "officialUrl": "https://udh.uk.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2011-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Specialized dual-zone regulations governing plain urban areas (Dehradun/Haridwar) and eco-sensitive hill zones (Mussoorie/Nainital).",
    "keyProvisions": [
      "Plain Areas (Dehradun): Base FAR 1.50 to 2.00; Purchasable FAR up to 2.50 on roads >= 12.0m",
      "Hill Areas (Mussoorie/Nainital): Maximum building height capped at 11.0m to 12.0m (Ground + 2 floors)",
      "Strict slope stability certification and ban on multi-storey construction on unstable geological slopes",
      "Mandatory traditional vernacular sloped roof design with pitched metal/tile roofs in hill towns"
    ]
  },
  {
    "id": "DOC-STATE-HP-TCP-2014",
    "title": "Himachal Pradesh Town and Country Planning Rules 2014 (Amended 2023)",
    "shortTitle": "HP Town & Country Planning Rules",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Himachal Pradesh"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2014",
    "version": "Amended 2023",
    "status": "verified",
    "categories": [
      "height_floors",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Town and Country Planning Department, Himachal Pradesh",
      "officialUrl": "https://tcp.hp.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2014-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statewide hill architecture and planning regulations enforcing strict floor limits, sloped roofs, and green belt preservation.",
    "keyProvisions": [
      "Maximum permissible height in hill urban areas: 3 Storeys + Attic + Parking (Attic height max 2.75m)",
      "Strict ban on cutting mature trees and developing on forest fringes without State Cabinet clearance",
      "Mandatory sloped pitched roof (minimum 30 to 45 degree pitch) for snow/rain runoff",
      "Core & Green Belt zones in Shimla, Manali, and Dharamshala enforce absolute construction moratoriums"
    ]
  },
  {
    "id": "DOC-STATE-GOA-TCP-2010",
    "title": "Goa Land Development and Building Construction Regulations 2010 (Amended 2022)",
    "shortTitle": "Goa Building Regulations 2010",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Goa"
    },
    "documentType": "model_bye_laws",
    "documentPriority": "primary",
    "year": "2010",
    "version": "Amended 2022",
    "status": "verified",
    "categories": [
      "far_fsi",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Town and Country Planning Department (TCP Goa)",
      "officialUrl": "https://tcp.goa.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2010-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Preserves low-density coastal ecology, heritage Portuguese architecture, and enforces strict FAR 0.60 to 1.00 caps across Goa.",
    "keyProvisions": [
      "Settlement Zone Base FAR strictly capped at 0.60 to 0.80 for village panchayats and 1.00 to 1.50 for municipal towns",
      "Maximum building height capped at 9.0m (Ground + 1) in village panchayats and 12.0m in urban municipal areas",
      "Mandatory Portuguese/Goan vernacular architectural aesthetics including Mangalore tiled pitched roofs",
      "CRZ coastal buffer: Strict 200m to 500m No Development Zone from High Tide Line along all beach stretches"
    ]
  },
  {
    "id": "DOC-STATE-CHD-CBR-2017",
    "title": "Chandigarh Building Rules (Urban) 2017",
    "shortTitle": "Chandigarh Building Rules 2017",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Chandigarh (UT)"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2017",
    "version": "CBR 2017 (Amended 2023)",
    "status": "verified",
    "categories": [
      "height_floors",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Department of Urban Planning, Chandigarh Administration",
      "officialUrl": "https://chandigarh.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2017-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Preserves Le Corbusier heritage master plan grid, fixed architectural controls, frame controls, and sector zoning.",
    "keyProvisions": [
      "Standard Frame Control and Sector Zoning Sheets dictate exact setback lines and party wall heights",
      "Plotted residential maximum FAR 1.50 to 2.00; Maximum permissible height 35 feet (10.67m - Ground + 2 floors)",
      "Absolute prohibition on fragmenting or sub-dividing original residential plots or constructing stilt+4 apartments",
      "Mandatory on-site solar rooftop installation for all residential plots >= 500 sq.yards"
    ]
  },
  {
    "id": "DOC-STATE-JK-UBBL-2021",
    "title": "Jammu & Kashmir Unified Building Bye-Laws 2021",
    "shortTitle": "J&K Unified Building Bye-Laws 2021",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Jammu & Kashmir (UT)"
    },
    "documentType": "model_bye_laws",
    "documentPriority": "primary",
    "year": "2021",
    "version": "J&K UBBL 2021",
    "status": "verified",
    "categories": [
      "far_fsi",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Housing & Urban Development Department, J&K Administration",
      "officialUrl": "https://jkhudd.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2021-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Unified regulations governing cold-climate insulation, Seismic Zone IV/V design, and heritage lake buffers in Srinagar and Jammu.",
    "keyProvisions": [
      "Plotted residential Base FAR 1.50 to 2.00; Group Housing FAR up to 2.50 on roads >= 15.0m",
      "Dal Lake & Nigeen Lake conservation: Strict 200m buffer zone managed by LCMA with zero construction allowed",
      "Mandatory thermal insulation and double glazing for high-altitude cold climate zones",
      "Seismic Zone IV & V structural engineering compliance mandatory before plan sanction"
    ]
  },
  {
    "id": "DOC-STATE-LAD-BBL-2021",
    "title": "Ladakh Urban Building Bye-Laws & Solar Passive Architecture Guidelines 2021",
    "shortTitle": "Ladakh Building Guidelines 2021",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Ladakh (UT)"
    },
    "documentType": "model_bye_laws",
    "documentPriority": "primary",
    "year": "2021",
    "version": "Ladakh Guidelines 2021",
    "status": "verified",
    "categories": [
      "green_building",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Housing and Urban Development Department, UT Administration of Ladakh",
      "officialUrl": "https://ladakh.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2021-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Cold desert solar passive architecture mandates, mud-brick thermal storage, and low-density ecological regulations for Leh and Kargil.",
    "keyProvisions": [
      "Low-density urban development: Maximum permissible FAR strictly capped at 0.80 to 1.20",
      "Maximum building height capped at 9.0m to 11.0m (Ground + 1 or 2 storeys) to preserve pristine mountain vistas",
      "Mandatory South-facing orientation and Trombe Wall / solar passive sunspaces for winter thermal heating",
      "Mandatory insulated double/triple glazed windows and dry composting toilet integration"
    ]
  },
  {
    "id": "DOC-STATE-PUD-BBL-2012",
    "title": "Puducherry Building Bye-Laws and Zoning Regulations 2012",
    "shortTitle": "Puducherry Building Bye-Laws 2012",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Puducherry (UT)"
    },
    "documentType": "model_bye_laws",
    "documentPriority": "primary",
    "year": "2012",
    "version": "Amended 2020",
    "status": "verified",
    "categories": [
      "far_fsi",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Puducherry Planning Authority (PPA)",
      "officialUrl": "https://ppa.py.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2012-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs French-heritage Bouleward town architectural preservation, coastal setbacks, and permissible FAR in Puducherry.",
    "keyProvisions": [
      "French & Tamil Heritage Precincts (Boulevard Town): Strict architectural facade and cornice controls",
      "Non-High Rise Base FAR 1.50 to 2.00; Commercial corridors permit FAR up to 2.50 on roads >= 15.0m",
      "Mandatory CRZ clearance for coastal parcels within 500m of Bay of Bengal coastline",
      "Rainwater harvesting recharge structure mandatory for all building permissions"
    ]
  },
  {
    "id": "DOC-STATE-CG-BVN-1984",
    "title": "Chhattisgarh Bhumi Vikas Niyam (Amended up to 2021)",
    "shortTitle": "Chhattisgarh Bhumi Vikas Niyam",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Chhattisgarh"
    },
    "documentType": "model_bye_laws",
    "documentPriority": "primary",
    "year": "2021",
    "version": "Amended 2021",
    "status": "verified",
    "categories": [
      "far_fsi",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Directorate of Town and Country Planning (T&CP Chhattisgarh)",
      "officialUrl": "https://tcp.cg.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2021-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Regulates plotted developments, Smart City Naya Raipur corridors, and automated building plan permissions across Chhattisgarh.",
    "keyProvisions": [
      "Plotted residential Base FAR 1.25 to 1.75; Purchasable FAR up to 2.50 on roads >= 18.0m",
      "Naya Raipur (Atal Nagar) Smart City Transit corridors permit TOD FAR up to 3.00 to 3.50",
      "Mandatory 10% Open Space Reservation for residential layouts > 2,000 sq.m",
      "Online single-window building sanction with automated architectural drawing validator"
    ]
  },
  {
    "id": "DOC-STATE-TRP-MBBL-2017",
    "title": "Tripura Municipal Building Rules & Agartala Municipal Corporation Bye-Laws 2017",
    "shortTitle": "Tripura Municipal Building Rules",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Tripura"
    },
    "documentType": "building_code",
    "documentPriority": "primary",
    "year": "2017",
    "version": "2017 Edition",
    "status": "verified",
    "categories": [
      "far_fsi",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Urban Development Department, Government of Tripura",
      "officialUrl": "https://udd.tripura.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2017-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs urban building permissions, Seismic Zone V ductile detailing, and drainage setbacks in Agartala and urban local bodies.",
    "keyProvisions": [
      "Residential Plotted Base FAR 1.50 to 2.00; Maximum building height 15.0m on roads >= 9.0m",
      "Seismic Zone V structural safety compliance and soil liquefaction tests mandatory for multi-storey buildings",
      "Mandatory 10% open green space in residential layouts exceeding 2,000 sq.m",
      "Compulsory rainwater harvesting recharge pit for all building plots >= 150 sq.m"
    ]
  },
  {
    "id": "DOC-STATE-MEG-MBBL-2021",
    "title": "Meghalaya Building Bye-Laws 2021 (MUDA Shillong)",
    "shortTitle": "Meghalaya Building Bye-Laws 2021",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Meghalaya"
    },
    "documentType": "model_bye_laws",
    "documentPriority": "primary",
    "year": "2021",
    "version": "MUDA 2021",
    "status": "verified",
    "categories": [
      "height_floors",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Meghalaya Urban Development Authority (MUDA)",
      "officialUrl": "https://muda.meghalaya.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2021-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Enforces Seismic Zone V safety, high rainfall drainage, and height controls in Shillong and Meghalaya urban planning areas.",
    "keyProvisions": [
      "Maximum building height strictly capped at 12.5m (Ground + 3 floors) in Shillong master planning area",
      "Seismic Zone V ductile detailing and structural stability proof-check mandatory",
      "Maximum permissible FAR 1.25 to 1.75; Maximum ground coverage 50%",
      "Mandatory high-capacity rooftop rainwater harvesting and storm drainage culverts"
    ]
  },
  {
    "id": "DOC-STATE-SIK-BCR-2020",
    "title": "Sikkim Building Construction Regulations 2020 (Gangtok Urban Area)",
    "shortTitle": "Sikkim Building Regulations 2020",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Sikkim"
    },
    "documentType": "model_bye_laws",
    "documentPriority": "primary",
    "year": "2020",
    "version": "Sikkim BCR 2020",
    "status": "verified",
    "categories": [
      "height_floors",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Urban Development Department, Government of Sikkim",
      "officialUrl": "https://uddsikkim.org",
      "documentType": "Gazette",
      "publishedDate": "2020-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Specialized mountain building code regulating 5.5-storey height limit, landslide prevention, and Seismic Zone IV/V design in Gangtok.",
    "keyProvisions": [
      "Maximum building height strictly capped at 5.5 storeys (including basement/parking and attic roof)",
      "Mandatory Geo-Technical soil stability investigation and structural engineer peer review",
      "Maximum ground coverage capped at 50% to 60%; Maximum permissible FAR 1.50",
      "Mandatory traditional Sikkimese wooden/cornice architectural motifs on front elevations"
    ]
  },
  {
    "id": "DOC-STATE-NAG-BBL-2012",
    "title": "Nagaland Building Bye-Laws 2012 (Kohima & Dimapur Planning Areas)",
    "shortTitle": "Nagaland Building Bye-Laws 2012",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Nagaland"
    },
    "documentType": "model_bye_laws",
    "documentPriority": "primary",
    "year": "2012",
    "version": "2012 Edition",
    "status": "verified",
    "categories": [
      "far_fsi",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Urban Development Department, Government of Nagaland",
      "officialUrl": "https://urbandevelopment.nagaland.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2012-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs hill urban planning in Kohima, commercial zoning in Dimapur, and Seismic Zone V ductile detailing.",
    "keyProvisions": [
      "Maximum building height in Kohima hill area: 13.5m (Ground + 3 floors + attic)",
      "Dimapur plain area: Base FAR 1.50 to 2.00 on roads >= 12.0m width",
      "Seismic Zone V ductile detailing and structural stability certification mandatory",
      "Mandatory 2.0m side and rear setbacks to preserve natural light and ventilation"
    ]
  },
  {
    "id": "DOC-STATE-MAN-MBBL-2019",
    "title": "Manipur Building Bye-Laws & Imphal Planning Area Regulations 2019",
    "shortTitle": "Manipur Building Bye-Laws 2019",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Manipur"
    },
    "documentType": "model_bye_laws",
    "documentPriority": "primary",
    "year": "2019",
    "version": "2019 Edition",
    "status": "verified",
    "categories": [
      "far_fsi",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Municipal Administration, Housing and Urban Development (MAHUD Manipur)",
      "officialUrl": "https://mahud.mn.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2019-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Regulates urban construction, wetland buffers around Loktak Lake, and Seismic Zone V structural design in Imphal.",
    "keyProvisions": [
      "Plotted residential Base FAR 1.50 to 2.00; Maximum building height 15.0m on roads >= 9.0m",
      "Seismic Zone V structural ductile detailing compliant with IS 13920 mandatory",
      "Mandatory 50m non-construction green buffer along Nambul and Imphal riverbanks",
      "Rainwater harvesting recharge structures mandatory for all building plots >= 150 sq.m"
    ]
  },
  {
    "id": "DOC-STATE-MIZ-ABR-2017",
    "title": "Aizawl Municipal Corporation Building Regulations 2017",
    "shortTitle": "Mizoram & Aizawl Building Regulations",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Mizoram"
    },
    "documentType": "model_bye_laws",
    "documentPriority": "primary",
    "year": "2017",
    "version": "2017 Edition",
    "status": "verified",
    "categories": [
      "height_floors",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Urban Development & Poverty Alleviation Department (UD&PA Mizoram)",
      "officialUrl": "https://udpa.mizoram.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2017-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Specialized mountain ridge building regulations, landslide risk mitigation, and rainwater harvesting in Aizawl.",
    "keyProvisions": [
      "Maximum building height strictly capped at 12.0m (Ground + 3 floors) along ridge lines",
      "Mandatory slope stability certification and geo-technical clearance before excavation",
      "Maximum ground coverage capped at 50% to prevent excessive surface water runoff",
      "100% rooftop rainwater harvesting storage tank mandatory for every residential dwelling"
    ]
  },
  {
    "id": "DOC-STATE-ARU-BBL-2019",
    "title": "Arunachal Pradesh Urban Development & Building Regulations 2019",
    "shortTitle": "Arunachal Pradesh Building Regulations",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Arunachal Pradesh"
    },
    "documentType": "model_bye_laws",
    "documentPriority": "primary",
    "year": "2019",
    "version": "2019 Edition",
    "status": "verified",
    "categories": [
      "far_fsi",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Department of Urban Development & Housing, Arunachal Pradesh",
      "officialUrl": "https://urban.arunachal.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2019-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs urban building permissions, traditional timber-braced structures, and Seismic Zone V engineering in Itanagar.",
    "keyProvisions": [
      "Maximum building height capped at 12.0m to 14.0m (Ground + 3 floors) in Itanagar urban area",
      "Seismic Zone V design and independent structural review mandatory for all public and commercial buildings",
      "Maximum permissible FAR 1.50; Ground coverage capped at 50% to 60%",
      "Mandatory slope drainage culverts to prevent hill soil erosion"
    ]
  },
  {
    "id": "DOC-STATE-AND-PBMC-2019",
    "title": "Port Blair Municipal Council Building Bye-Laws 2019 (Seismic V & CRZ)",
    "shortTitle": "Andaman & Nicobar Building Bye-Laws",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Andaman & Nicobar Islands (UT)"
    },
    "documentType": "model_bye_laws",
    "documentPriority": "primary",
    "year": "2019",
    "version": "PBMC 2019",
    "status": "verified",
    "categories": [
      "far_fsi",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Port Blair Municipal Council & Andaman Administration",
      "officialUrl": "https://pbmc.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2019-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Specialized island regulations enforcing Tsunami & Seismic Zone V resilience, CRZ coastal setbacks, and low-density tourism controls.",
    "keyProvisions": [
      "Maximum building height strictly capped at 12.0m (Ground + 2 floors) across Port Blair urban area",
      "Maximum permissible FAR 1.00 to 1.25; Ground coverage capped at 40% to 50%",
      "Mandatory Tsunami resilient plinth elevation (minimum 1.0m above recorded high tide line)",
      "Strict CRZ coastal buffer: 200m to 500m No Development Zone from High Tide Line"
    ]
  },
  {
    "id": "DOC-STATE-DNH-DCR-2020",
    "title": "DNH & DD Consolidated Development Control Regulations 2020",
    "shortTitle": "DNH & DD Building Regulations 2020",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Dadra & Nagar Haveli and Daman & Diu (UT)"
    },
    "documentType": "model_bye_laws",
    "documentPriority": "primary",
    "year": "2020",
    "version": "Consolidated DCR 2020",
    "status": "verified",
    "categories": [
      "far_fsi",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Town and Country Planning Department, UT Administration of DNH & DD",
      "officialUrl": "https://daman.nic.in",
      "documentType": "Gazette",
      "publishedDate": "2020-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Consolidated regulations governing industrial manufacturing zones, coastal resort developments, and residential FAR.",
    "keyProvisions": [
      "Industrial manufacturing plots: Maximum FAR 1.50, Maximum ground coverage 60%",
      "Residential plotted: Base FAR 1.50 to 1.80 on roads >= 9.0m; Commercial FAR up to 2.25",
      "Coastal CRZ setback buffers along Daman and Diu beachfronts (200m to 500m NDZ)",
      "Mandatory on-site solar rooftop PV generation for all industrial units"
    ]
  },
  {
    "id": "DOC-STATE-LAK-ICR-2020",
    "title": "Lakshadweep Island Building & Eco-Tourism Regulations 2020",
    "shortTitle": "Lakshadweep Building Regulations",
    "level": 2,
    "jurisdiction": {
      "country": "India",
      "state": "Lakshadweep (UT)"
    },
    "documentType": "model_bye_laws",
    "documentPriority": "primary",
    "year": "2020",
    "version": "Lakshadweep ICR 2020",
    "status": "verified",
    "categories": [
      "far_fsi",
      "setbacks",
      "height_floors",
      "ground_coverage",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Department of Planning & Urban Development, UT of Lakshadweep",
      "officialUrl": "https://lakshadweep.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2020-01-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Ultra-low density eco-resilient coral atoll building code enforcing strict environmental and rainwater harvesting mandates.",
    "keyProvisions": [
      "Ultra-low density development: Maximum permissible FAR strictly capped at 0.50 to 0.75",
      "Maximum building height strictly capped at 7.5m to 9.0m (Ground + 1 storey) to preserve coconut canopy",
      "Zero groundwater discharge: 100% bio-toilets and tertiary treatment to prevent coral reef contamination",
      "100% rooftop rainwater catchment and solar power integration mandatory"
    ]
  }
];

export const STATE_RULES: ByeLawRule[] = [
  {
    "id": "L2-HAR-HBC-2017-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Haryana)",
    "jurisdiction": "Haryana (Haryana Building Code 2017)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Haryana",
      "stateId": "haryana"
    },
    "category": "far_fsi",
    "categoryName": "State Plotted FAR & Height Limits",
    "title": "Haryana Residential Plotted FAR, Height & Stilt+4 Floor Norms",
    "clause": "Haryana Building Code 2017 Chapter 6 Clause 6.1",
    "sourceDoc": "Haryana Building Code 2017 (Amended up to 2023)",
    "sourceUrl": "https://tcpharyana.gov.in",
    "documentYear": "2017",
    "version": "HBC-2017 (Amended 2023)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Unified statutory building code governing permissible FAR, ground coverage, mandatory stilt parking, and setbacks for all urban estates across Haryana.",
    "parameters": {
      "baseFar": 1.98,
      "maxPurchasableFar": 2.64,
      "maxGroundCoveragePct": 66.0,
      "stiltPlusFourPermitted": true
    },
    "detailedRequirements": [
      "Plots 60 to 250 sq.m: Base FAR 1.98, Purchasable FAR up to 2.64, Ground coverage up to 66%",
      "Stilt parking clear height minimum 2.4m, maximum 3.0m; stilt floor exempted from FAR calculation",
      "Front setback minimum 3.0m for plots > 150 sq.m; Rear setback minimum 2.0m",
      "Solar rooftop PV installation mandatory for plots >= 500 sq.m (min 1 kWp or 5% of connected load)"
    ]
  },
  {
    "id": "L2-MAH-UDCPR-2020-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Maharashtra)",
    "jurisdiction": "Maharashtra (Maharashtra UDCPR 2020)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Maharashtra",
      "stateId": "maharashtra"
    },
    "category": "far_fsi",
    "categoryName": "Unified FSI & TDR Potentials",
    "title": "Maharashtra UDCPR 2020 Unified Base FSI, Premium FSI & TDR Permissibility",
    "clause": "UDCPR 2020 Regulation 6.1 & Table 6-A",
    "sourceDoc": "Unified Development Control and Promotion Regulations for Maharashtra (UDCPR 2020)",
    "sourceUrl": "https://urban.maharashtra.gov.in",
    "documentYear": "2020",
    "version": "UDCPR 2020 (Amended 2023)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Unified development control regulations standardizing FSI, TDR loading, premium FSI, and amenity space reservation across Maharashtra.",
    "parameters": {
      "baseFsi": 1.1,
      "maxPremiumFsi": 0.5,
      "maxTdrLoading": 0.4,
      "maxTotalFsi": 2.0
    },
    "detailedRequirements": [
      "Road width 9.0m to 12.0m: Base FSI 1.10 + Premium FSI 0.30 + TDR 0.20 = Total Maximum FSI 1.60",
      "Road width 18.0m to 24.0m: Base FSI 1.10 + Premium FSI 0.50 + TDR 0.40 = Total Maximum FSI 2.00",
      "Side and rear setbacks: Minimum 3.0m for buildings up to 15m; height/5 for taller structures",
      "Premium FSI charged at 35% of prevailing Annual Statement of Rates (ASR / Ready Reckoner rate)"
    ]
  },
  {
    "id": "L2-DEL-UBBL-2016-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Delhi (NCT))",
    "jurisdiction": "Delhi (NCT) (Delhi UBBL 2016)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Delhi (NCT)",
      "stateId": "delhi"
    },
    "category": "far_fsi",
    "categoryName": "Delhi Plotted FAR & Ground Coverage",
    "title": "Delhi UBBL-2016 Plotted FAR, Ground Coverage & Height Controls",
    "clause": "UBBL-2016 Clause 7.4 & Table 7.1",
    "sourceDoc": "Unified Building Bye-Laws for Delhi 2016 (UBBL-2016)",
    "sourceUrl": "https://dda.gov.in",
    "documentYear": "2016",
    "version": "UBBL-2016 (Amended 2023)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Unified building rules governing setbacks, ground coverage, FAR, and online sanction procedures across DDA, MCD, and NDMC jurisdictions.",
    "parameters": {
      "maxFarSmallPlots": 3.5,
      "maxFarLargePlots": 2.0,
      "maxHeightWithStiltM": 17.5
    },
    "detailedRequirements": [
      "Plots <= 100 sq.m: Maximum ground coverage 90%, Maximum FAR 350, Maximum 4 dwelling units",
      "Plots 250 to 750 sq.m: Maximum ground coverage 75%, Maximum FAR 225, Maximum height 15.0m (17.5m with stilt)",
      "Stilt parking clear height minimum 2.4m; stilt floor completely free of FAR",
      "Rear setback minimum 3.0m, Front setback minimum 3.0m to 6.0m based on plot depth"
    ]
  },
  {
    "id": "L2-KAR-MBBL-2020-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Karnataka)",
    "jurisdiction": "Karnataka (Karnataka Building Bye-Laws 2020)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Karnataka",
      "stateId": "karnataka"
    },
    "category": "far_fsi",
    "categoryName": "Karnataka Road-Linked FAR",
    "title": "Karnataka Road-Width Linked FAR & Premium FAR Purchase Rules",
    "clause": "Karnataka Building Bye-Laws 2020 Chapter 4",
    "sourceDoc": "Karnataka Planning Authorities & Municipalities Building Bye-Laws 2020",
    "sourceUrl": "https://udd.karnataka.gov.in",
    "documentYear": "2020",
    "version": "Karnataka Model Bye-Laws 2020",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Statewide development controls regulating road-width linked FAR, setbacks, and mandatory high-rise fire buffers throughout Karnataka.",
    "parameters": {
      "baseFar": 1.75,
      "maxPremiumFar": 0.6,
      "rwhThresholdSqM": 120
    },
    "detailedRequirements": [
      "Road width 9.0m to 12.0m: Base FAR 1.75, Maximum permissible FAR 2.25 with premium purchase",
      "Road width > 18.0m: Base FAR 2.50, Maximum permissible FAR 3.25 for commercial & group housing",
      "Front setback minimum 2.0m to 4.5m; Side setbacks minimum 1.5m to 3.0m based on building height",
      "10% of total site area dedicated as civic amenity / park space in layouts > 2,000 sq.m"
    ]
  },
  {
    "id": "L2-TN-TNCDBR-2019-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Tamil Nadu)",
    "jurisdiction": "Tamil Nadu (Tamil Nadu TNCDBR 2019)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Tamil Nadu",
      "stateId": "tamil_nadu"
    },
    "category": "far_fsi",
    "categoryName": "Tamil Nadu FSI & Setbacks",
    "title": "Tamil Nadu TNCDBR 2019 Non-High Rise & High-Rise FSI Permissibility",
    "clause": "TNCDBR 2019 Rule 35 & Rule 39",
    "sourceDoc": "Tamil Nadu Combined Development and Building Rules 2019 (TNCDBR 2019)",
    "sourceUrl": "https://tn.gov.in/tcp",
    "documentYear": "2019",
    "version": "TNCDBR 2019 (Amended 2023)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Unified building rules governing Non-High Rise and High-Rise developments, premium FSI, and OSR across all municipal corporations in Tamil Nadu.",
    "parameters": {
      "baseFsiNonHighRise": 1.5,
      "baseFsiHighRise": 2.5,
      "premiumFsiMaxPct": 50.0
    },
    "detailedRequirements": [
      "Road width 9.0m to 12.0m: Permissible FSI 1.75; Road width 12.0m to 18.0m: Permissible FSI 2.00 (with premium up to 2.50)",
      "Road width > 18.0m: High-Rise permissible with Base FSI 2.50 and Premium FSI up to 3.75",
      "High-rise buffer: Minimum 7.0m all-around setback for buildings 18.3m to 30.0m height",
      "Premium FSI rate: 50% of Guideline Value of proportionate land area"
    ]
  },
  {
    "id": "L2-TG-TGBPASS-2020-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Telangana)",
    "jurisdiction": "Telangana (Telangana Building Rules & TG-bPASS)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Telangana",
      "stateId": "telangana"
    },
    "category": "setbacks",
    "categoryName": "Telangana Height-Linked Setbacks",
    "title": "Telangana G.O. Ms. No. 168 All-Around Open Spaces & Height Linked Setbacks",
    "clause": "G.O. Ms. No. 168 Clause 7 & Table III",
    "sourceDoc": "Telangana Building Rules (G.O. Ms. No. 168 & TG-bPASS Act 2020)",
    "sourceUrl": "https://tgbpass.telangana.gov.in",
    "documentYear": "2020",
    "version": "G.O. Ms. No. 168 (Amended 2023)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Statewide statutory building rules governing non-FAR unlimited density regime, height-linked setbacks, and single-window online approvals.",
    "parameters": {
      "noFsiCap": true,
      "minRoadWidthHighRiseM": 18.0,
      "tgbpassInstantApprovalPlotSqM": 75
    },
    "detailedRequirements": [
      "Buildings up to 10m height: Front setback 3.0m, Side/Rear setbacks minimum 1.5m to 2.0m",
      "Buildings 18m to 24m: All-around setback minimum 7.0m; Road width minimum 18.0m",
      "Buildings 30m to 40m: All-around setback minimum 11.0m; Road width minimum 24.0m",
      "10% of total site area must be surrendered for Master Plan road widening without compensation"
    ]
  },
  {
    "id": "L2-AP-APDPMS-2017-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Andhra Pradesh)",
    "jurisdiction": "Andhra Pradesh (Andhra Pradesh Building Rules 2017)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Andhra Pradesh",
      "stateId": "andhra_pradesh"
    },
    "category": "far_fsi",
    "categoryName": "AP Permissible FAR & Setbacks",
    "title": "Andhra Pradesh G.O. Ms. No. 119 FAR, Setbacks & TDR Utilization",
    "clause": "G.O. Ms. No. 119 Rule 12 & Table 8",
    "sourceDoc": "Andhra Pradesh Building Rules 2017 (G.O. Ms. No. 119 & APDPMS)",
    "sourceUrl": "https://apdpms.ap.gov.in",
    "documentYear": "2017",
    "version": "G.O. Ms. No. 119 (Amended 2022)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Statewide development control rules governing plotted layouts, group development schemes, transfer of development rights (TDR), and coastal regulations.",
    "parameters": {
      "baseFar": 1.75,
      "maxFarWithTdr": 2.75,
      "osrThresholdSqM": 3000
    },
    "detailedRequirements": [
      "Plots 100 to 300 sq.m: Base FAR 1.75, Maximum height 10.0m (Ground + 2 floors), Front setback 2.0m",
      "Plots > 1,000 sq.m on roads >= 18m: Base FAR 2.50 with TDR loading up to 3.00",
      "Minimum 6.0m peripheral fire driveway for all commercial and institutional buildings > 15m",
      "Solar water heating mandatory for all residential buildings on plots >= 200 sq.m"
    ]
  },
  {
    "id": "L2-UP-BLR-2008-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Uttar Pradesh)",
    "jurisdiction": "Uttar Pradesh (UP Building Regulations 2008)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Uttar Pradesh",
      "stateId": "uttar_pradesh"
    },
    "category": "far_fsi",
    "categoryName": "UP Purchasable FAR & Setbacks",
    "title": "UP Development Regulations Plotted & Group Housing Purchasable FAR",
    "clause": "UP Building Regulations Clause 4.1 & Clause 5.2",
    "sourceDoc": "Uttar Pradesh Urban Planning and Development (Building) Regulations 2008",
    "sourceUrl": "https://awas.up.nic.in",
    "documentYear": "2008",
    "version": "Amended up to 2022",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Governs permissible FAR, purchasable FAR, setbacks, and high-rise group housing standards across all Development Authorities in UP.",
    "parameters": {
      "baseFar": 1.5,
      "purchasableFarMax": 0.75,
      "groupHousingCoveragePct": 35.0
    },
    "detailedRequirements": [
      "Plotted residential on 9m road: Base FAR 1.50; on 12m road: Base FAR 1.75 + Purchasable FAR 0.50",
      "Group Housing: Base FAR 2.50, Purchasable FAR 0.75, Maximum permissible FAR 3.25 on 24m road",
      "Front setback: 3.0m to 9.0m based on plot depth; Side/Rear setbacks minimum 3.0m for plots > 300 sq.m",
      "Purchasable FAR charges calculated at 40% of prevailing circle rate of land"
    ]
  },
  {
    "id": "L2-RAJ-UBBL-2020-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Rajasthan)",
    "jurisdiction": "Rajasthan (Rajasthan Building Bye-Laws 2020)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Rajasthan",
      "stateId": "rajasthan"
    },
    "category": "far_fsi",
    "categoryName": "Rajasthan Standard & Betterment FAR",
    "title": "Rajasthan Unified Building Bye-Laws 2020 Standard & Betterment FAR",
    "clause": "Rajasthan UBBL 2020 Chapter 6 Clause 6.2",
    "sourceDoc": "Rajasthan Unified Building Bye-Laws 2020 (Amended 2023)",
    "sourceUrl": "https://urban.rajasthan.gov.in",
    "documentYear": "2020",
    "version": "UBBL Rajasthan 2020",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Statewide unified building code governing Standard FAR, Betterment/Purchasable FAR, setbacks, and heritage zone controls across Rajasthan.",
    "parameters": {
      "standardFar": 1.33,
      "maxBettermentFar": 2.25,
      "rwhThresholdSqM": 225
    },
    "detailedRequirements": [
      "Road width 9.0m to 12.0m: Standard FAR 1.33 + Betterment FAR 0.40 = Permissible FAR 1.73",
      "Road width 18.0m to 24.0m: Standard FAR 1.66 + Betterment FAR 0.84 = Permissible FAR 2.50",
      "Maximum ground coverage: 65% for plots up to 500 sq.m; 50% for plots > 500 sq.m",
      "Betterment levy charged at 25% of District Level Committee (DLC) rate"
    ]
  },
  {
    "id": "L2-GUJ-CGDCR-2017-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Gujarat)",
    "jurisdiction": "Gujarat (Gujarat CGDCR 2017)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Gujarat",
      "stateId": "gujarat"
    },
    "category": "far_fsi",
    "categoryName": "Gujarat Base & Chargeable FSI",
    "title": "Gujarat CGDCR 2017 Base FSI, Chargeable FSI & Transit Corridor Density",
    "clause": "CGDCR 2017 Chapter 6 Clause 6.3 & Table 6.1",
    "sourceDoc": "Comprehensive General Development Control Regulations (CGDCR 2017 - Gujarat)",
    "sourceUrl": "https://udd.gujarat.gov.in",
    "documentYear": "2017",
    "version": "CGDCR 2017 (Amended 2023)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Comprehensive statewide unified regulations standardizing Base FSI, Chargeable FSI, Transit Oriented Zones (TOZ), and fire norms across Gujarat.",
    "parameters": {
      "baseFsi": 1.2,
      "maxChargeableFsi": 1.8,
      "tozMaxFsi": 4.0
    },
    "detailedRequirements": [
      "Residential Zone 1 (R1): Base FSI 1.80 + Chargeable FSI 0.90 = Maximum Permissible FSI 2.70",
      "Commercial Central Business District (CBD): Base FSI 1.80 + Chargeable FSI 3.60 = Maximum FSI 5.40",
      "Side and rear margins: Minimum 3.0m for buildings up to 15m; 4.5m for buildings 15m to 25m",
      "Chargeable FSI premium calculated at 40% of Jantri (Government ready reckoner) value"
    ]
  },
  {
    "id": "L2-WB-MBR-2007-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (West Bengal)",
    "jurisdiction": "West Bengal (West Bengal Municipal Building Rules)",
    "jurisdictionScope": {
      "country": "India",
      "state": "West Bengal",
      "stateId": "west_bengal"
    },
    "category": "far_fsi",
    "categoryName": "West Bengal FAR & Road Widths",
    "title": "West Bengal Road-Width Linked Permissible FAR & Open Space Rules",
    "clause": "WB Municipal Building Rules Rule 51 & Rule 53",
    "sourceDoc": "West Bengal Municipal (Building) Rules 2007 (Amended 2022)",
    "sourceUrl": "https://www.wburbanservices.gov.in",
    "documentYear": "2007",
    "version": "Amended 2022",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Statewide municipal building rules governing permissible FAR, tenement density, mandatory open spaces, and water-body conservation.",
    "parameters": {
      "baseFar": 1.5,
      "maxFar": 2.75,
      "minRoadWidthMultiStoreyM": 7.0
    },
    "detailedRequirements": [
      "Road width 7.0m to 9.0m: Maximum FAR 1.75; Road width 9.0m to 15.0m: Maximum FAR 2.25",
      "Road width > 15.0m: Maximum FAR 2.75 with additional green building incentive of 10%",
      "Front open space: Minimum 1.2m to 5.0m based on road width; Rear open space minimum 3.0m to 8.0m",
      "Rainwater harvesting mandatory for all buildings with roof area >= 100 sq.m"
    ]
  },
  {
    "id": "L2-KER-KMBR-2019-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Kerala)",
    "jurisdiction": "Kerala (Kerala KMBR 2019)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Kerala",
      "stateId": "kerala"
    },
    "category": "far_fsi",
    "categoryName": "Kerala Permissible & Premium FAR",
    "title": "Kerala KMBR 2019 Plotted & Commercial Base FAR, Premium FAR & Coverage",
    "clause": "KMBR 2019 Rule 27 & Table 4",
    "sourceDoc": "Kerala Municipality Building Rules 2019 (KMBR 2019)",
    "sourceUrl": "https://lsgkerala.gov.in",
    "documentYear": "2019",
    "version": "KMBR 2019 (Amended 2023)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Comprehensive statewide building regulations governing residential coverage, FAR ceilings, coastal CRZ, and disaster-resilient slopes.",
    "parameters": {
      "baseFar": 2.0,
      "maxPurchasableFar": 4.0,
      "rwhLitrePerSqmBua": 25
    },
    "detailedRequirements": [
      "Residential occupancy: Base FAR 2.00; Additional purchasable FAR up to 3.00 on roads >= 7.0m",
      "Commercial occupancy: Base FAR 1.50; Additional purchasable FAR up to 3.00 on roads >= 10.0m",
      "Front yard setback minimum 3.0m; Rear yard minimum 1.5m to 2.0m; Side yard minimum 1.0m to 1.5m",
      "Purchasable FAR fees payable to local municipal body as per notified government rates"
    ]
  },
  {
    "id": "L2-PUN-PMBBL-2018-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Punjab)",
    "jurisdiction": "Punjab (Punjab Building Bye-Laws 2018)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Punjab",
      "stateId": "punjab"
    },
    "category": "far_fsi",
    "categoryName": "Punjab Plotted FAR & Stilt Norms",
    "title": "Punjab Model Building Bye-Laws Plotted FAR, Stilt Parking & Setbacks",
    "clause": "PMBBL 2018 Clause 3.1 & Clause 4.2",
    "sourceDoc": "Punjab Model Building Bye-Laws 2018 (PUDA & Local Government)",
    "sourceUrl": "https://puda.punjab.gov.in",
    "documentYear": "2018",
    "version": "PMBBL 2018 (Amended 2022)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Governs plotted residential setbacks, group housing density, industrial development norms, and Stilt + 3 floor permissions across Punjab.",
    "parameters": {
      "baseFar": 1.75,
      "maxPurchasableFar": 2.5,
      "stiltFloorsPermitted": 3
    },
    "detailedRequirements": [
      "Plots 100 to 250 sq.m: Base FAR 1.75, Maximum coverage 65%, Maximum height 14.5m with stilt",
      "Plots 250 to 500 sq.m: Base FAR 1.50, Maximum coverage 60%, Front setback 3.0m, Rear setback 2.0m",
      "Stilt parking clear height 2.4m minimum; open stilt exempted from FAR calculation",
      "Solar rooftop PV installation mandatory for plots >= 500 sq.m (minimum 1 kWp)"
    ]
  },
  {
    "id": "L2-MP-MPBVN-2012-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Madhya Pradesh)",
    "jurisdiction": "Madhya Pradesh (MP Bhumi Vikas Niyam 2012)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Madhya Pradesh",
      "stateId": "madhya_pradesh"
    },
    "category": "far_fsi",
    "categoryName": "MP Permissible FAR & Setbacks",
    "title": "Madhya Pradesh Bhumi Vikas Niyam Permissible FAR & High-Rise Clearances",
    "clause": "MPBVN 2012 Niyam 42 & Table 6",
    "sourceDoc": "Madhya Pradesh Bhumi Vikas Niyam 2012 (MPBVN 2012 Amended 2023)",
    "sourceUrl": "https://tcp.mp.gov.in",
    "documentYear": "2012",
    "version": "MPBVN 2012 (Amended 2023)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Statewide land development and building regulations governing FAR, Open Spaces, and automated building sanction across MP.",
    "parameters": {
      "baseFar": 1.5,
      "maxPurchasableFar": 2.5,
      "abpasSanctionDays": 15
    },
    "detailedRequirements": [
      "Road width 9.0m to 12.0m: Base FAR 1.50; Road width 18.0m to 24.0m: Base FAR 2.00 (with premium up to 2.50)",
      "High-rise buildings (> 15m) must maintain all-around setback minimum 6.0m for fire tender movement",
      "Rainwater harvesting mandatory for all buildings on plots >= 140 sq.m area",
      "Purchasable FAR charges deposited into urban infrastructure development fund"
    ]
  },
  {
    "id": "L2-ODI-OBPAS-2020-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Odisha)",
    "jurisdiction": "Odisha (Odisha Building Rules 2020)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Odisha",
      "stateId": "odisha"
    },
    "category": "far_fsi",
    "categoryName": "Odisha FAR & Cyclone Safety",
    "title": "Odisha Development Authorities Planning Standards & Cyclone Design Norms",
    "clause": "Odisha Building Rules 2020 Rule 18 & Rule 24",
    "sourceDoc": "Odisha Development Authorities (Planning & Building Standards) Rules 2020",
    "sourceUrl": "https://obpas.odisha.gov.in",
    "documentYear": "2020",
    "version": "OBPAS Rules 2020",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Governs statutory FAR, purchasable FAR, cyclone-resilient structural designs, and automated building plan permissions across Odisha.",
    "parameters": {
      "baseFar": 1.75,
      "maxPurchasableFar": 3.0,
      "cycloneWindSpeedMs": 55
    },
    "detailedRequirements": [
      "Plots 100 to 300 sq.m on 9m road: Base FAR 1.75, Maximum coverage 65%, Maximum height 12.0m",
      "Group housing on 18m road: Base FAR 2.50, Maximum FAR 3.25 with purchasable FAR at 25% benchmark rate",
      "Mandatory cyclone-resilient roof anchoring and structural wind engineering calculations",
      "Dedicated solid waste segregation and rainwater harvesting tanks for all developments"
    ]
  },
  {
    "id": "L2-BIH-BBL-2014-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Bihar)",
    "jurisdiction": "Bihar (Bihar Building Bye-Laws 2014)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Bihar",
      "stateId": "bihar"
    },
    "category": "height_floors",
    "categoryName": "Bihar Height & Road Linkages",
    "title": "Bihar Building Bye-Laws Road-Width Linked Height & Seismic Detailing",
    "clause": "Bihar Building Bye-Laws Clause 21 & Clause 29",
    "sourceDoc": "Bihar Building Bye-Laws 2014 (Amended up to 2022)",
    "sourceUrl": "https://urban.bih.nic.in",
    "documentYear": "2014",
    "version": "Amended 2022",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Statewide development controls regulating road-width linked FAR, seismic safety (Zone IV/V), and fire clearance across Bihar.",
    "parameters": {
      "baseFar": 1.5,
      "maxFar": 2.25,
      "seismicZone": "IV/V"
    },
    "detailedRequirements": [
      "Buildings on roads < 6.0m: Maximum height capped at 11.0m (Ground + 2 floors)",
      "Buildings on roads 9.0m to 12.0m: Maximum height 15.0m; Maximum permissible FAR 2.00",
      "Front setback minimum 2.0m to 4.5m; Rear setback minimum 2.0m for plotted residential",
      "Structural engineer affidavit certifying compliance with IS 1893:2016 seismic norms mandatory"
    ]
  },
  {
    "id": "L2-JHA-JBBL-2016-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Jharkhand)",
    "jurisdiction": "Jharkhand (Jharkhand Building Bye-Laws 2016)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Jharkhand",
      "stateId": "jharkhand"
    },
    "category": "far_fsi",
    "categoryName": "Jharkhand Permissible FAR",
    "title": "Jharkhand Building Bye-Laws Permissible FAR & Group Housing Setbacks",
    "clause": "Jharkhand Building Bye-Laws Chapter 5 Clause 5.2",
    "sourceDoc": "Jharkhand Building Bye-Laws 2016 (Amended 2021)",
    "sourceUrl": "https://udhd.jharkhand.gov.in",
    "documentYear": "2016",
    "version": "Amended 2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Statewide statutory building code governing permissible FAR, setback alignments, and automated online approvals via JAPIT.",
    "parameters": {
      "baseFar": 1.75,
      "maxGroupHousingFar": 2.5,
      "rwhThresholdSqM": 150
    },
    "detailedRequirements": [
      "Road width 9.0m to 12.0m: Permissible FAR 1.75; Road width >= 18.0m: Permissible FAR 2.50",
      "Front setback minimum 3.0m; Rear setback minimum 2.0m for residential plots > 200 sq.m",
      "High-rise towers (> 15m) require 6.0m clear peripheral access for fire tenders",
      "Solar water heating mandatory for all hotels, hospitals, and residential hostels"
    ]
  },
  {
    "id": "L2-ASM-UBR-2022-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Assam)",
    "jurisdiction": "Assam (Assam Unified Building Byelaws 2022)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Assam",
      "stateId": "assam"
    },
    "category": "structural_safety",
    "categoryName": "Assam Seismic V & Hill Slope Rules",
    "title": "Assam Unified Building Byelaws Seismic Zone V & Hill Slope Regulations",
    "clause": "Assam Byelaws 2022 Clause 14 & Clause 28",
    "sourceDoc": "Assam Unified Building Construction (Regulation) Byelaws 2022",
    "sourceUrl": "https://gdd.assam.gov.in",
    "documentYear": "2022",
    "version": "Assam Byelaws 2022",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Unified state building code incorporating Seismic Zone V structural design, hill slope cut-and-fill limits, and flood resilience.",
    "parameters": {
      "baseFar": 1.5,
      "maxHillHeightM": 12.0,
      "seismicZone": "V"
    },
    "detailedRequirements": [
      "All structures must be designed for Seismic Zone V base shear coefficient using response spectrum method",
      "Hill slopes > 30 degrees classified as No Construction Zone to prevent landslides",
      "Front setback minimum 3.0m; Rear setback minimum 2.0m on plain urban lands",
      "Mandatory retention ponds and zero untreated sewage discharge into Brahmaputra river catchment"
    ]
  },
  {
    "id": "L2-UK-BBL-2011-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Uttarakhand)",
    "jurisdiction": "Uttarakhand (Uttarakhand Building Regulations)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Uttarakhand",
      "stateId": "uttarakhand"
    },
    "category": "height_floors",
    "categoryName": "Uttarakhand Hill & Plain Norms",
    "title": "Uttarakhand Dual Plain & Hill Zone FAR, Height & Slope Restrictions",
    "clause": "Uttarakhand Building Bye-Laws Chapter 4 & Chapter 8",
    "sourceDoc": "Uttarakhand Building Bye-Laws and Regulations 2011 (Amended 2020)",
    "sourceUrl": "https://udh.uk.gov.in",
    "documentYear": "2011",
    "version": "Amended 2020 (Hill & Plain Norms)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Specialized dual-zone regulations governing plain urban areas (Dehradun/Haridwar) and eco-sensitive hill zones (Mussoorie/Nainital).",
    "parameters": {
      "plainBaseFar": 1.75,
      "hillMaxHeightM": 12.0,
      "pitchedRoofMandatory": true
    },
    "detailedRequirements": [
      "Plain zone plots: Base FAR 1.75, Ground coverage 60%, Maximum height 15.0m (18m on wide roads)",
      "Hill zone plots: Maximum FAR 1.20, Ground coverage 40%, Maximum height 12.0m from lowest ground level",
      "No construction permitted on slopes steeper than 35 degrees without geo-technical retention design",
      "Rainwater harvesting mandatory for all residential and commercial buildings"
    ]
  },
  {
    "id": "L2-HP-TCP-2014-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Himachal Pradesh)",
    "jurisdiction": "Himachal Pradesh (HP Town & Country Planning Rules)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Himachal Pradesh",
      "stateId": "himachal_pradesh"
    },
    "category": "height_floors",
    "categoryName": "HP Hill Town Storey Limits",
    "title": "Himachal Pradesh Hill Architecture 3-Storey + Attic & Sloped Roof Norms",
    "clause": "HP TCP Rules 2014 Rule 17 & Appendix 7",
    "sourceDoc": "Himachal Pradesh Town and Country Planning Rules 2014 (Amended 2023)",
    "sourceUrl": "https://tcp.hp.gov.in",
    "documentYear": "2014",
    "version": "Amended 2023",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Statewide hill architecture and planning regulations enforcing strict floor limits, sloped roofs, and green belt preservation.",
    "parameters": {
      "maxStoreys": 3,
      "atticPermitted": true,
      "minRoofPitchDeg": 30
    },
    "detailedRequirements": [
      "Maximum floors: Parking level + 3 habitable storeys + sloping roof attic space",
      "Ground coverage capped at 40% to 50% of plot area to preserve mountain green canopy",
      "Minimum 2.0m front and side setbacks from edge of hill paths and vehicular roads",
      "Structural proof check for Seismic Zone IV & V compliant RCC framed or timber-braced structures"
    ]
  },
  {
    "id": "L2-GOA-TCP-2010-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Goa)",
    "jurisdiction": "Goa (Goa Building Regulations 2010)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Goa",
      "stateId": "goa"
    },
    "category": "far_fsi",
    "categoryName": "Goa Low-Density FAR & Height",
    "title": "Goa Low-Density Settlement FAR, Height & Vernacular Architecture Norms",
    "clause": "Goa Building Regulations Regulation 6 & Regulation 11",
    "sourceDoc": "Goa Land Development and Building Construction Regulations 2010 (Amended 2022)",
    "sourceUrl": "https://tcp.goa.gov.in",
    "documentYear": "2010",
    "version": "Amended 2022",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Preserves low-density coastal ecology, heritage Portuguese architecture, and enforces strict FAR 0.60 to 1.00 caps across Goa.",
    "parameters": {
      "villageBaseFar": 0.8,
      "urbanBaseFar": 1.0,
      "maxVillageHeightM": 9.0
    },
    "detailedRequirements": [
      "Village Panchayat zones: Maximum FAR 0.80, Maximum coverage 40%, Maximum height 9.0m (Ground + 1)",
      "Urban Municipal zones (Panaji/Margao): Maximum FAR 1.50, Maximum coverage 50%, Maximum height 15.0m",
      "Mangalore tiled pitched sloped roof (minimum 25 degree pitch) mandatory for all residential dwellings",
      "Mandatory prior CZMA clearance for all properties situated within 500m of coastal high tide line"
    ]
  },
  {
    "id": "L2-CHD-CBR-2017-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Chandigarh (UT))",
    "jurisdiction": "Chandigarh (UT) (Chandigarh Building Rules 2017)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Chandigarh (UT)",
      "stateId": "chandigarh"
    },
    "category": "height_floors",
    "categoryName": "Chandigarh Heritage Architectural Controls",
    "title": "Chandigarh Heritage Frame Controls & Plotted Height Ceilings",
    "clause": "Chandigarh Building Rules Chapter 3 & Sector Zoning Plans",
    "sourceDoc": "Chandigarh Building Rules (Urban) 2017",
    "sourceUrl": "https://chandigarh.gov.in",
    "documentYear": "2017",
    "version": "CBR 2017 (Amended 2023)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Preserves Le Corbusier heritage master plan grid, fixed architectural controls, frame controls, and sector zoning.",
    "parameters": {
      "maxPlottedHeightFt": 35.0,
      "maxFloors": 3,
      "subdivisionAllowed": false
    },
    "detailedRequirements": [
      "Residential plots strictly governed by standard boundary-to-boundary Corbusier frame drawings",
      "Maximum height 35 feet (10.67m) comprising Ground + First + Second floor only; Zero 4th floor permitted",
      "Front and rear boundary walls must adhere to standardized exposed brickwork / RCC grill designs",
      "Solar rooftop PV installation mandatory for plots >= 500 sq.yards (min 1 kWp or 5% connected load)"
    ]
  },
  {
    "id": "L2-JK-UBBL-2021-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Jammu & Kashmir (UT))",
    "jurisdiction": "Jammu & Kashmir (UT) (J&K Unified Building Bye-Laws 2021)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Jammu & Kashmir (UT)",
      "stateId": "jammu_kashmir"
    },
    "category": "far_fsi",
    "categoryName": "J&K FAR & Lake Protection",
    "title": "J&K Unified Building Bye-Laws 2021 Permissible FAR & Lake Conservation Buffers",
    "clause": "J&K UBBL 2021 Chapter 4 & Chapter 9",
    "sourceDoc": "Jammu & Kashmir Unified Building Bye-Laws 2021",
    "sourceUrl": "https://jkhudd.gov.in",
    "documentYear": "2021",
    "version": "J&K UBBL 2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Unified regulations governing cold-climate insulation, Seismic Zone IV/V design, and heritage lake buffers in Srinagar and Jammu.",
    "parameters": {
      "baseFar": 1.75,
      "dalLakeBufferM": 200,
      "seismicZone": "IV/V"
    },
    "detailedRequirements": [
      "Urban plots on 9m road: Base FAR 1.75, Maximum coverage 60%, Maximum height 15.0m",
      "Dal Lake, Nigeen Lake, and River Jhelum banks: Minimum 200m non-construction green buffer",
      "Pitched sloped roof with minimum 30-degree slope mandatory to withstand heavy winter snowfall",
      "Mandatory online building plan approval through J&K single-window portal"
    ]
  },
  {
    "id": "L2-LAD-BBL-2021-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Ladakh (UT))",
    "jurisdiction": "Ladakh (UT) (Ladakh Building Guidelines 2021)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Ladakh (UT)",
      "stateId": "ladakh"
    },
    "category": "green_building",
    "categoryName": "Ladakh Solar Passive Standards",
    "title": "Ladakh Solar Passive Architecture & High-Altitude Thermal Insulation Norms",
    "clause": "Ladakh Building Guidelines 2021 Section 3",
    "sourceDoc": "Ladakh Urban Building Bye-Laws & Solar Passive Architecture Guidelines 2021",
    "sourceUrl": "https://ladakh.gov.in",
    "documentYear": "2021",
    "version": "Ladakh Guidelines 2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Cold desert solar passive architecture mandates, mud-brick thermal storage, and low-density ecological regulations for Leh and Kargil.",
    "parameters": {
      "baseFar": 1.0,
      "maxHeightM": 10.0,
      "solarPassiveMandatory": true
    },
    "detailedRequirements": [
      "Maximum FAR 1.00, Maximum ground coverage 40%, Maximum height 10.0m (Ground + 2 floors)",
      "Main living spaces must be oriented within 15 degrees of true South to maximize passive winter solar gain",
      "Exterior walls must incorporate minimum 100mm glass-wool / EPS thermal insulation or 300mm stabilized earth blocks",
      "Absolute ban on non-biodegradable sewage dumping into fragile Himalayan glacial streams"
    ]
  },
  {
    "id": "L2-PUD-BBL-2012-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Puducherry (UT))",
    "jurisdiction": "Puducherry (UT) (Puducherry Building Bye-Laws 2012)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Puducherry (UT)",
      "stateId": "puducherry"
    },
    "category": "far_fsi",
    "categoryName": "Puducherry FAR & Heritage Controls",
    "title": "Puducherry French Heritage Town & Coastal Zone Building Regulations",
    "clause": "Puducherry Building Bye-Laws Chapter 5",
    "sourceDoc": "Puducherry Building Bye-Laws and Zoning Regulations 2012",
    "sourceUrl": "https://ppa.py.gov.in",
    "documentYear": "2012",
    "version": "Amended 2020",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Governs French-heritage Bouleward town architectural preservation, coastal setbacks, and permissible FAR in Puducherry.",
    "parameters": {
      "baseFar": 1.75,
      "heritageBoulevardCapHeightM": 12.0
    },
    "detailedRequirements": [
      "Heritage Boulevard area: Maximum building height 12.0m; mandatory colonial french window proportions and colors",
      "Outside Boulevard area on 12m road: Base FAR 1.75, Maximum height 15.0m",
      "Front setback minimum 2.0m to 3.5m; Side setbacks minimum 1.5m",
      "Solar water heating mandatory for all residential plots >= 200 sq.m"
    ]
  },
  {
    "id": "L2-CG-BVN-1984-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Chhattisgarh)",
    "jurisdiction": "Chhattisgarh (Chhattisgarh Bhumi Vikas Niyam)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Chhattisgarh",
      "stateId": "chhattisgarh"
    },
    "category": "far_fsi",
    "categoryName": "Chhattisgarh Permissible FAR",
    "title": "Chhattisgarh Bhumi Vikas Niyam Permissible FAR & Open Spaces",
    "clause": "CG Bhumi Vikas Niyam Niyam 38 & Table 5",
    "sourceDoc": "Chhattisgarh Bhumi Vikas Niyam (Amended up to 2021)",
    "sourceUrl": "https://tcp.cg.gov.in",
    "documentYear": "2021",
    "version": "Amended 2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Regulates plotted developments, Smart City Naya Raipur corridors, and automated building plan permissions across Chhattisgarh.",
    "parameters": {
      "baseFar": 1.5,
      "maxPurchasableFar": 2.5,
      "nayaRaipurTodFar": 3.5
    },
    "detailedRequirements": [
      "Urban plots on 9m road: Base FAR 1.50, Maximum ground coverage 60%, Maximum height 15.0m",
      "Arterial commercial corridors (roads >= 24m): Base FAR 2.00 with purchasable FAR up to 3.00",
      "Front setback minimum 3.0m; Rear setback minimum 2.0m for residential plots > 200 sq.m",
      "Rainwater harvesting recharge pits compulsory for all plots >= 100 sq.m"
    ]
  },
  {
    "id": "L2-TRP-MBBL-2017-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Tripura)",
    "jurisdiction": "Tripura (Tripura Municipal Building Rules)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Tripura",
      "stateId": "tripura"
    },
    "category": "far_fsi",
    "categoryName": "Tripura FAR & Seismic Norms",
    "title": "Tripura Municipal Building Rules Permissible FAR & Seismic V Detailing",
    "clause": "Tripura Municipal Building Rules Rule 16",
    "sourceDoc": "Tripura Municipal Building Rules & Agartala Municipal Corporation Bye-Laws 2017",
    "sourceUrl": "https://udd.tripura.gov.in",
    "documentYear": "2017",
    "version": "2017 Edition",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Governs urban building permissions, Seismic Zone V ductile detailing, and drainage setbacks in Agartala and urban local bodies.",
    "parameters": {
      "baseFar": 1.5,
      "seismicZone": "V",
      "maxHeightM": 15.0
    },
    "detailedRequirements": [
      "Plots on 6m to 9m roads: Permissible FAR 1.50, Maximum height 12.0m, Ground coverage 60%",
      "Plots on roads >= 12m: Permissible FAR 2.00, Maximum height 18.0m with fire service NOC",
      "Front setback minimum 2.5m; Rear setback minimum 2.0m",
      "Structural engineer affidavit certifying seismic safety under IS 1893:2016"
    ]
  },
  {
    "id": "L2-MEG-MBBL-2021-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Meghalaya)",
    "jurisdiction": "Meghalaya (Meghalaya Building Bye-Laws 2021)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Meghalaya",
      "stateId": "meghalaya"
    },
    "category": "height_floors",
    "categoryName": "Meghalaya Height & Seismic Norms",
    "title": "Meghalaya MUDA 2021 Height Capping, Slope Cuts & Seismic Zone V Rules",
    "clause": "Meghalaya Building Bye-Laws Chapter 4",
    "sourceDoc": "Meghalaya Building Bye-Laws 2021 (MUDA Shillong)",
    "sourceUrl": "https://muda.meghalaya.gov.in",
    "documentYear": "2021",
    "version": "MUDA 2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Enforces Seismic Zone V safety, high rainfall drainage, and height controls in Shillong and Meghalaya urban planning areas.",
    "parameters": {
      "baseFar": 1.5,
      "maxHeightM": 12.5,
      "seismicZone": "V"
    },
    "detailedRequirements": [
      "Maximum height 12.5m (Ground + 3 storeys); Sloped roof attic permitted above 12.5m",
      "Zero construction on slopes steeper than 35 degrees without structural retaining walls",
      "Front setback minimum 2.5m; Rear setback minimum 2.0m; Side setbacks minimum 1.5m",
      "All RCC frames must be designed for Seismic Zone V peak ground acceleration"
    ]
  },
  {
    "id": "L2-SIK-BCR-2020-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Sikkim)",
    "jurisdiction": "Sikkim (Sikkim Building Regulations 2020)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Sikkim",
      "stateId": "sikkim"
    },
    "category": "height_floors",
    "categoryName": "Sikkim Storey Capping & Slope Safety",
    "title": "Sikkim 5.5-Storey Height Ceiling & Mountain Slope Stability Norms",
    "clause": "Sikkim Building Regulations 2020 Clause 8 & Clause 14",
    "sourceDoc": "Sikkim Building Construction Regulations 2020 (Gangtok Urban Area)",
    "sourceUrl": "https://uddsikkim.org",
    "documentYear": "2020",
    "version": "Sikkim BCR 2020",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Specialized mountain building code regulating 5.5-storey height limit, landslide prevention, and Seismic Zone IV/V design in Gangtok.",
    "parameters": {
      "maxStoreys": 5.5,
      "maxFar": 1.5,
      "geoTechInvestigationMandatory": true
    },
    "detailedRequirements": [
      "Maximum height 5.5 storeys (Ground + 4 storeys + Sloping roof attic) from lowest road level",
      "Geo-technical soil investigation report from approved laboratory mandatory prior to plan sanction",
      "Heavy RCC cantilever balconies beyond 1.0m prohibited on mountain valley sides",
      "Comprehensive stormwater drainage system connected to municipal nallahs mandatory"
    ]
  },
  {
    "id": "L2-NAG-BBL-2012-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Nagaland)",
    "jurisdiction": "Nagaland (Nagaland Building Bye-Laws 2012)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Nagaland",
      "stateId": "nagaland"
    },
    "category": "far_fsi",
    "categoryName": "Nagaland Height & FAR Standards",
    "title": "Nagaland Building Bye-Laws Hill Height Limits & Seismic V Detailing",
    "clause": "Nagaland Building Bye-Laws Clause 12",
    "sourceDoc": "Nagaland Building Bye-Laws 2012 (Kohima & Dimapur Planning Areas)",
    "sourceUrl": "https://urbandevelopment.nagaland.gov.in",
    "documentYear": "2012",
    "version": "2012 Edition",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Governs hill urban planning in Kohima, commercial zoning in Dimapur, and Seismic Zone V ductile detailing.",
    "parameters": {
      "kohimaMaxHeightM": 13.5,
      "dimapurBaseFar": 1.75,
      "seismicZone": "V"
    },
    "detailedRequirements": [
      "Kohima hill terrain: Maximum building height 13.5m, Maximum ground coverage 50%",
      "Dimapur plain terrain: Base FAR 1.75, Maximum height 18.0m on roads >= 12.0m",
      "Front setback minimum 2.5m; Side/Rear setbacks minimum 1.5m",
      "Structural compliance certificate signed by licensed structural engineer mandatory"
    ]
  },
  {
    "id": "L2-MAN-MBBL-2019-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Manipur)",
    "jurisdiction": "Manipur (Manipur Building Bye-Laws 2019)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Manipur",
      "stateId": "manipur"
    },
    "category": "far_fsi",
    "categoryName": "Manipur FAR & River Protection",
    "title": "Manipur Building Bye-Laws Permissible FAR & Riverfront Buffer Clearances",
    "clause": "Manipur Building Bye-Laws Clause 15",
    "sourceDoc": "Manipur Building Bye-Laws & Imphal Planning Area Regulations 2019",
    "sourceUrl": "https://mahud.mn.gov.in",
    "documentYear": "2019",
    "version": "2019 Edition",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Regulates urban construction, wetland buffers around Loktak Lake, and Seismic Zone V structural design in Imphal.",
    "parameters": {
      "baseFar": 1.5,
      "maxHeightM": 15.0,
      "seismicZone": "V"
    },
    "detailedRequirements": [
      "Urban plots on 9m road: Base FAR 1.50, Maximum ground coverage 60%",
      "Commercial plots on roads >= 12m: Permissible FAR 2.00 with fire safety approval",
      "Front setback minimum 3.0m; Rear setback minimum 2.0m; Side setbacks minimum 1.5m",
      "Absolute prohibition on building on designated wetlands or river floodplains"
    ]
  },
  {
    "id": "L2-MIZ-ABR-2017-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Mizoram)",
    "jurisdiction": "Mizoram (Mizoram & Aizawl Building Regulations)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Mizoram",
      "stateId": "mizoram"
    },
    "category": "height_floors",
    "categoryName": "Aizawl Ridge Height & Slope Safety",
    "title": "Aizawl Ridge-Line Height Capping & Landslide Risk Regulations",
    "clause": "Aizawl Building Regulations 2017 Clause 9",
    "sourceDoc": "Aizawl Municipal Corporation Building Regulations 2017",
    "sourceUrl": "https://udpa.mizoram.gov.in",
    "documentYear": "2017",
    "version": "2017 Edition",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Specialized mountain ridge building regulations, landslide risk mitigation, and rainwater harvesting in Aizawl.",
    "parameters": {
      "maxHeightM": 12.0,
      "maxCoveragePct": 50.0,
      "rwhTankMandatory": true
    },
    "detailedRequirements": [
      "Maximum building height 12.0m from road level; Maximum 4 storeys on downhill slopes",
      "Retaining walls and RCC column foundations must be anchored into solid bed rock",
      "Front setback minimum 2.0m from road edge; Rear setback minimum 1.5m",
      "Mandatory domestic rainwater collection tank sized at minimum 10,000 litres capacity"
    ]
  },
  {
    "id": "L2-ARU-BBL-2019-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Arunachal Pradesh)",
    "jurisdiction": "Arunachal Pradesh (Arunachal Pradesh Building Regulations)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Arunachal Pradesh",
      "stateId": "arunachal_pradesh"
    },
    "category": "far_fsi",
    "categoryName": "Arunachal FAR & Height Limits",
    "title": "Arunachal Pradesh Urban Building Bye-Laws Permissible FAR & Height",
    "clause": "Arunachal Building Regulations Clause 11",
    "sourceDoc": "Arunachal Pradesh Urban Development & Building Regulations 2019",
    "sourceUrl": "https://urban.arunachal.gov.in",
    "documentYear": "2019",
    "version": "2019 Edition",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Governs urban building permissions, traditional timber-braced structures, and Seismic Zone V engineering in Itanagar.",
    "parameters": {
      "baseFar": 1.5,
      "maxHeightM": 14.0,
      "seismicZone": "V"
    },
    "detailedRequirements": [
      "Urban plots on 9m road: Base FAR 1.50, Maximum ground coverage 60%, Maximum height 14.0m",
      "Front setback minimum 2.5m; Rear setback minimum 2.0m; Side setbacks minimum 1.5m",
      "Structural engineer certificate certifying seismic ductile detailing under IS 13920",
      "Rainwater harvesting recharge pits compulsory for all plots >= 150 sq.m"
    ]
  },
  {
    "id": "L2-AND-PBMC-2019-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Andaman & Nicobar Islands (UT))",
    "jurisdiction": "Andaman & Nicobar Islands (UT) (Andaman & Nicobar Building Bye-Laws)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Andaman & Nicobar Islands (UT)",
      "stateId": "andaman_nicobar"
    },
    "category": "far_fsi",
    "categoryName": "Island Low-Density FAR & CRZ",
    "title": "Andaman & Nicobar Island Low-Density FAR, Tsunami Plinth & CRZ Clearances",
    "clause": "PBMC Building Bye-Laws Clause 8 & Clause 21",
    "sourceDoc": "Port Blair Municipal Council Building Bye-Laws 2019 (Seismic V & CRZ)",
    "sourceUrl": "https://pbmc.gov.in",
    "documentYear": "2019",
    "version": "PBMC 2019",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Specialized island regulations enforcing Tsunami & Seismic Zone V resilience, CRZ coastal setbacks, and low-density tourism controls.",
    "parameters": {
      "baseFar": 1.0,
      "maxHeightM": 12.0,
      "tsunamiPlinthElevationM": 1.0,
      "seismicZone": "V"
    },
    "detailedRequirements": [
      "Port Blair urban plots: Base FAR 1.00, Maximum coverage 40%, Maximum height 12.0m",
      "All structures must be designed for Seismic Zone V peak ground acceleration",
      "Plinth level must be constructed minimum 1.0m above natural ground / high tide water mark",
      "Mandatory prior CZMA clearance before municipal building plan approval"
    ]
  },
  {
    "id": "L2-DNH-DCR-2020-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Dadra & Nagar Haveli and Daman & Diu (UT))",
    "jurisdiction": "Dadra & Nagar Haveli and Daman & Diu (UT) (DNH & DD Building Regulations 2020)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Dadra & Nagar Haveli and Daman & Diu (UT)",
      "stateId": "dadra_nagar_haveli_daman_diu"
    },
    "category": "far_fsi",
    "categoryName": "DNH & DD Permissible FAR",
    "title": "DNH & DD Consolidated Regulations Industrial & Residential FAR Standards",
    "clause": "DNH & DD DCR 2020 Regulation 14",
    "sourceDoc": "DNH & DD Consolidated Development Control Regulations 2020",
    "sourceUrl": "https://daman.nic.in",
    "documentYear": "2020",
    "version": "Consolidated DCR 2020",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Consolidated regulations governing industrial manufacturing zones, coastal resort developments, and residential FAR.",
    "parameters": {
      "industrialBaseFar": 1.5,
      "residentialBaseFar": 1.75,
      "industrialMaxCoveragePct": 60.0
    },
    "detailedRequirements": [
      "Industrial plots: Base FAR 1.50, Ground coverage up to 60%, Height up to 18.0m with fire NOC",
      "Residential plots on 9m road: Base FAR 1.75, Maximum coverage 60%, Height up to 15.0m",
      "Front setback minimum 3.0m; Side/Rear setbacks minimum 2.0m to 3.0m",
      "Rainwater harvesting recharge pits and hazardous effluent treatment clearance mandatory"
    ]
  },
  {
    "id": "L2-LAK-ICR-2020-01",
    "tier": "state_code",
    "level": 2,
    "levelName": "Level 2: State Building Code (Lakshadweep (UT))",
    "jurisdiction": "Lakshadweep (UT) (Lakshadweep Building Regulations)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Lakshadweep (UT)",
      "stateId": "lakshadweep"
    },
    "category": "far_fsi",
    "categoryName": "Lakshadweep Ultra-Low Density FAR",
    "title": "Lakshadweep Eco-Resilient Coral Atoll Low-Density Building Norms",
    "clause": "Lakshadweep Island Regulations Clause 5",
    "sourceDoc": "Lakshadweep Island Building & Eco-Tourism Regulations 2020",
    "sourceUrl": "https://lakshadweep.gov.in",
    "documentYear": "2020",
    "version": "Lakshadweep ICR 2020",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Ultra-low density eco-resilient coral atoll building code enforcing strict environmental and rainwater harvesting mandates.",
    "parameters": {
      "baseFar": 0.6,
      "maxHeightM": 8.0,
      "bioToiletMandatory": true
    },
    "detailedRequirements": [
      "Maximum FAR 0.60, Maximum ground coverage 33%, Maximum height 8.0m (Ground + 1 floor)",
      "Strict ban on drawing groundwater through motorized pumps to prevent saline water intrusion",
      "Mandatory rainwater harvesting collection tanks sized at 30 Litres per sq.m roof catchment",
      "Traditional eco-friendly bamboo, wood, and local coral-sand plaster finishes encouraged"
    ]
  }
];

export const STATE_BYE_LAW_RULES = STATE_RULES;
