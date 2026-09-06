// Level 4: Local Authority Building Norms & Pan-India Statutory Overlays
// Authoritative database of municipal development authorities and nationwide statutory overlays

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
      "authority": "Delhi Development Authority",
      "officialUrl": "https://dda.gov.in",
      "documentUrl": "https://dda.gov.in/building-sanction-procedures",
      "documentType": "Manual",
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
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Municipal Corporation of Delhi",
      "officialUrl": "https://mcdonline.nic.in",
      "documentUrl": "https://mcdonline.nic.in/eodb/",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Fast-track risk-based automated building approval scheme for residential plots up to 500 sq.m across all 12 MCD administrative zones.",
    "keyProvisions": [
      "SARAL Scheme: Instant online deemed sanction for individual residential plots <= 105 sq.m based on registered architect self-certification",
      "Plots 105 to 500 sq.m: Automated common application form approval within 15 working days",
      "Risk-based inspection framework: Pre-construction, plinth level, and final occupancy inspections",
      "Integration with Delhi Jal Board (DJB), Delhi Fire Services (DFS), and power discoms"
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
      "city": "Delhi",
      "authority": "New Delhi Municipal Council & DUAC"
    },
    "documentType": "special_overlay",
    "documentPriority": "primary",
    "year": "2022",
    "version": "LBZ Guidelines (Sanctioned 2022)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "New Delhi Municipal Council & DUAC",
      "officialUrl": "https://ndmc.gov.in",
      "documentUrl": "https://ndmc.gov.in/public_notices/lbz_guidelines.aspx",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Stringent heritage conservation and low-density development controls applicable strictly within the Lutyens Bungalow Zone boundary.",
    "keyProvisions": [
      "Strict height ceiling of 12 meters (ground + 1 upper floor) for residential bungalows",
      "Maximum ground coverage capped at 20% to 25% with extensive green setbacks",
      "Mandatory Delhi Urban Art Commission (DUAC) aesthetic design approval",
      "Tree felling prohibited; any trimming requires Tree Officer clearance under Delhi Tree Preservation Act"
]
  },
  {
    "id": "DOC-AUTH-MCGM-AUTODCR",
    "title": "MCGM AutoDCR Building Approval Manual & Scrutiny Circulars",
    "shortTitle": "MCGM AutoDCR Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Mumbai",
      "authority": "Municipal Corporation of Greater Mumbai (MCGM / BMC)"
    },
    "documentType": "guideline",
    "documentPriority": "primary",
    "year": "2021",
    "version": "MCGM AutoDCR 3.0 / DCPR-2034 Implementation Manual",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Municipal Corporation of Greater Mumbai (MCGM / BMC)",
      "officialUrl": "https://portal.mcgm.gov.in",
      "documentUrl": "https://autodcr.mcgm.gov.in",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Detailed technical manual for automated architectural scrutiny, concession approvals, and scrutiny fee calculations under DCPR-2034.",
    "keyProvisions": [
      "CAD layer standardisation for automated FSI/Fungible FSI calculation",
      "Municipal Commissioner discretionary concession process under Regulation 6(b)",
      "High-rise technical scrutiny checklist for buildings exceeding 70 meters",
      "Mandatory NOC workflow: CFO Fire NOC, Storm Water Drain (SWD), Traffic Police, and SWM"
]
  },
  {
    "id": "DOC-AUTH-CIDCO-NAVI-MUMBAI",
    "title": "CIDCO Navi Mumbai Development Control & Building Sanction Manual",
    "shortTitle": "CIDCO Sanction Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Navi Mumbai",
      "authority": "City and Industrial Development Corporation (CIDCO)"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "CIDCO DCR Manual (Aligned with UDCPR 2020)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "City and Industrial Development Corporation (CIDCO)",
      "officialUrl": "https://cidco.maharashtra.gov.in",
      "documentUrl": "https://cidco.maharashtra.gov.in/town_planning_dcr",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Sanction procedures, leasehold plot development conditions, and node-specific infrastructure charges across Navi Mumbai planned nodes.",
    "keyProvisions": [
      "Plot utilization rules for CIDCO leasehold residential and commercial plots",
      "Unified DCPR application within CIDCO jurisdiction with node-specific overlay guidelines",
      "Coastal regulation zone scrutiny for waterfront nodes (Palm Beach, Ulwe, Dronagiri)",
      "Navi Mumbai International Airport (NMIA) height envelope enforcement"
]
  },
  {
    "id": "DOC-AUTH-TMC-THANE",
    "title": "Thane Municipal Corporation (TMC) Building Permission Guidelines",
    "shortTitle": "TMC Building Guidelines",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Thane",
      "authority": "Thane Municipal Corporation"
    },
    "documentType": "guideline",
    "documentPriority": "primary",
    "year": "2021",
    "version": "TMC BPAMS / UDCPR Thane Guidelines 2021",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Thane Municipal Corporation",
      "officialUrl": "https://thanecity.gov.in",
      "documentUrl": "https://thanecity.gov.in/townplanning",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs town planning permissions, cluster redevelopment guidelines (URP), and lake buffer regulations across Thane municipal area.",
    "keyProvisions": [
      "Urban Renewal Plan (URP) cluster redevelopment parameters for dense older settlements",
      "Protection buffer of 30m around Thane's notified natural water bodies and lakes",
      "Transit-Oriented Development (TOD) corridor FSI incentives along Thane Metro Ring",
      "Mandatory tree census and structural safety audit certification"
]
  },
  {
    "id": "DOC-AUTH-PMC-PUNE",
    "title": "Pune Municipal Corporation (PMC) Building Sanction Manual",
    "shortTitle": "PMC Building Sanction Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Pune",
      "authority": "Pune Municipal Corporation"
    },
    "documentType": "guideline",
    "documentPriority": "primary",
    "year": "2021",
    "version": "PMC AutoDCR & UDCPR Implementation Framework",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Pune Municipal Corporation",
      "officialUrl": "https://pmc.gov.in",
      "documentUrl": "https://pmc.gov.in/en/building-permission-department",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building scrutiny procedures, Hill-top/Hill-slope (HTHS) protection rules, and Riverfront Development overlays in Pune municipal limits.",
    "keyProvisions": [
      "Hill-top and Hill-slope (HTHS) zone no-development prohibition enforcement",
      "Mula-Mutha River Prohibitive Flood Line (Blue Line) and Restrictive Flood Line (Red Line) regulations",
      "Eco-housing green building rating incentives (discount on development charges)",
      "Automated drawing scrutiny via PMC Building Permission Management System"
]
  },
  {
    "id": "DOC-AUTH-PMRDA-PUNE",
    "title": "PMRDA Metropolitan Region Development & Building Regulations",
    "shortTitle": "PMRDA Building Sanction Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Pune",
      "authority": "Pune Metropolitan Region Development Authority"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "PMRDA Building Permission Code (UDCPR Aligned)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Pune Metropolitan Region Development Authority",
      "officialUrl": "https://pmrda.gov.in",
      "documentUrl": "https://pmrda.gov.in/town-planning/",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Development regulations across Pune fringe peri-urban areas, Ring Road influence zone, and Special Township projects.",
    "keyProvisions": [
      "Ring Road influence zone development charges and premium FSI provisions",
      "Special Township Projects (minimum 40 hectares) integrated sanction norms",
      "Agri-zone farm building and agro-industrial conversion parameters",
      "Water supply and sewage infrastructure adequacy verification"
]
  },
  {
    "id": "DOC-AUTH-NMC-NAGPUR",
    "title": "Nagpur Municipal Corporation (NMC) Building Permission Manual",
    "shortTitle": "NMC Building Permission Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Nagpur",
      "authority": "Nagpur Municipal Corporation & NIT"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "NMC BPAMS UDCPR Code 2021",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Nagpur Municipal Corporation & NIT",
      "officialUrl": "https://nmcnagpur.gov.in",
      "documentUrl": "https://nmcnagpur.gov.in/town-planning",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Scrutiny regulations, heritage corridor rules, and Metro corridor TOD incentives across Nagpur city.",
    "keyProvisions": [
      "Nagpur Metro TOD Corridor TOD FSI up to 4.0 within 500m of stations",
      "Nag River & Pili River environmental buffer zone enforcement",
      "Heritage Conservation Committee approvals for Civil Lines and Sitabuldi areas",
      "Online BPAMS automated scrutiny and Occupancy Certificate workflow"
]
  },
  {
    "id": "DOC-AUTH-NMC-NASHIK",
    "title": "Nashik Municipal Corporation Building Sanction Code",
    "shortTitle": "Nashik NMC Sanction Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Nashik",
      "authority": "Nashik Municipal Corporation"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "Nashik BPAMS UDCPR 2021",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Nashik Municipal Corporation",
      "officialUrl": "https://nashikcorporation.in",
      "documentUrl": "https://nashikcorporation.in/townplanning",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building permission norms, Godavari River flood buffer lines, and Agro-processing industrial zone guidelines in Nashik.",
    "keyProvisions": [
      "Godavari River flood line (Blue and Red lines) development restrictions",
      "Kumbh Mela pilgrimage route right-of-way protection corridors",
      "Winery and agro-tourism special building parameters",
      "Automated building scrutiny system under UDCPR"
]
  },
  {
    "id": "DOC-AUTH-DTCP-HARYANA",
    "title": "DTCP Haryana Building Code Sanction, CLU & Scrutiny Framework",
    "shortTitle": "DTCP Haryana Scrutiny Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Haryana",
      "city": "Gurugram",
      "authority": "Department of Town & Country Planning Haryana (DTCP)"
    },
    "documentType": "guideline",
    "documentPriority": "primary",
    "year": "2021",
    "version": "DTCP Haryana Circulars 2021-2023 (Haryana Building Code 2017)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Department of Town & Country Planning Haryana (DTCP)",
      "officialUrl": "https://tcpharyana.gov.in",
      "documentUrl": "https://tcpharyana.gov.in/Policy/HBC2017_Amendments.pdf",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Comprehensive regulatory instructions governing Change of Land Use (CLU), licensed colony building plan approval, and group housing scrutiny in Haryana NCR.",
    "keyProvisions": [
      "Change of Land Use (CLU) approval process and external development charges (EDC/IDC)",
      "Stilt + 4 floor policy guidelines, structural peer review, and neighbor consent framework",
      "Affordable Group Housing Policy (AHP 2013 / amended 2023) FAR and density norms",
      "Deen Dayal Jan Awas Yojna (DDJAY) plotted colony building norms"
]
  },
  {
    "id": "DOC-AUTH-GMDA-INFRA",
    "title": "GMDA Urban Infrastructure & Water-Discharge Regulatory Guidelines",
    "shortTitle": "GMDA Urban Drainage & Infrastructure Code",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Haryana",
      "city": "Gurugram",
      "authority": "Gurugram Metropolitan Development Authority"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2022",
    "version": "GMDA Infrastructure Guidelines (2022)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Gurugram Metropolitan Development Authority",
      "officialUrl": "https://gmda.gov.in",
      "documentUrl": "https://gmda.gov.in/policies-guidelines",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Mandatory stormwater discharge, zero-runoff groundwater recharge, and master infrastructure connection norms across GMDA notified area.",
    "keyProvisions": [
      "Zero stormwater discharge mandate into GMDA master drains during peak rainfall",
      "Standard design for on-site rainwater harvesting injection wells in all commercial & residential layouts",
      "Master water supply connection meter and bulk recycled water intake regulations",
      "Right-of-Way (ROW) access control on GMDA master sector roads"
]
  },
  {
    "id": "DOC-AUTH-HSVP-SANCTION",
    "title": "HSVP (HUDA) Sectoral Plot Sanction & Architectural Control Manual",
    "shortTitle": "HSVP Sectoral Sanction Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Haryana",
      "city": "Faridabad",
      "authority": "Haryana Shehri Vikas Pradhikaran (HSVP / FMDA)"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "HSVP Architectural Control Book 2021",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Haryana Shehri Vikas Pradhikaran (HSVP / FMDA)",
      "officialUrl": "https://hsvphry.org.in",
      "documentUrl": "https://hsvphry.org.in/building-regulations",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Standard architectural controls, zoning plans, basement permissions, and occupancy certification for HSVP developed sectors in Faridabad & Haryana.",
    "keyProvisions": [
      "Pre-approved standard design templates for standard residential sector plots",
      "Basement construction conditions (setback from plot boundary, structural protection of adjacent plots)",
      "Commercial SCO (Shop-cum-Office) mandatory verandah width and facade architectural control",
      "Online Building Plan Approval System (OBPAS) sanction workflow"
]
  },
  {
    "id": "DOC-AUTH-PANCHKULA-HSVP",
    "title": "HSVP Panchkula Architectural Control & Shivalik Foothill Guidelines",
    "shortTitle": "HSVP Panchkula Sanction Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Haryana",
      "city": "Panchkula",
      "authority": "Haryana Shehri Vikas Pradhikaran (HSVP Panchkula)"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "HSVP Panchkula Architectural Controls 2021",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Haryana Shehri Vikas Pradhikaran (HSVP Panchkula)",
      "officialUrl": "https://hsvphry.org.in",
      "documentUrl": "https://hsvphry.org.in/panchkula-zoning",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Architectural controls, hill-slope contouring rules, and seismic design norms for Panchkula urban estate and MDC.",
    "keyProvisions": [
      "Mansa Devi Complex (MDC) special low-density height ceiling",
      "Shivalik foothill slope contouring and retaining wall engineering standards",
      "Architectural facade uniformity for SCO and bay shop markets",
      "Seismic Zone IV resilient structural detailing requirements"
]
  },
  {
    "id": "DOC-AUTH-BBMP-SUVARNA",
    "title": "BBMP Suvarna Paravanage & Automated Building Scrutiny Manual",
    "shortTitle": "BBMP Suvarna Paravanage Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Karnataka",
      "city": "Bengaluru",
      "authority": "Bruhat Bengaluru Mahanagara Palike"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "Suvarna Paravanage 2.0 Scrutiny Manual",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Bruhat Bengaluru Mahanagara Palike",
      "officialUrl": "https://bbmp.gov.in",
      "documentUrl": "https://bbmp.gov.in/building-sanction/",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Automated online building plan approval framework, Rajakaluve buffer scrutiny, and lake protection zoning in Bengaluru.",
    "keyProvisions": [
      "Suvarna Paravanage: Deemed sanction for residential plots up to 4,000 sq.ft (371 sq.m) with up to G+3 floors",
      "Primary Stormwater Drain (Primary Rajakaluve): 50-meter buffer (50m from center / 25m from edge per NGT orders)",
      "Secondary Drain (25m buffer) and Tertiary Drain (15m buffer) strict no-construction rules",
      "Mandatory NOC workflow: BWSSB water/sewer clearance, BESCOM power NOC, Fire & Emergency Services"
]
  },
  {
    "id": "DOC-AUTH-BDA-SANCTION",
    "title": "BDA Layout Sanction & Group Housing Comprehensive Scrutiny Rules",
    "shortTitle": "BDA Layout & Housing Scrutiny Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Karnataka",
      "city": "Bengaluru",
      "authority": "Bangalore Development Authority"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2020",
    "version": "BDA Layout & Group Housing Code 2020",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Bangalore Development Authority",
      "officialUrl": "https://bdabangalore.org",
      "documentUrl": "https://bdabangalore.org/planning-guidelines",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs statutory layout approvals, CA site relinquishment, arterial road widening setbacks, and Master Plan zoning compliance across Bangalore Metropolitan Area.",
    "keyProvisions": [
      "Mandatory 15% park & open space + 10% Civic Amenity (CA) land surrender in layout approvals",
      "Road widening setbacks and free surrender of land in exchange for Transferable Development Rights (TDR)",
      "Integrated development scrutiny for projects > 20,000 sq.m built-up area",
      "Zoning regulations compliance with Revised Master Plan (RMP-2015/2031)"
]
  },
  {
    "id": "DOC-AUTH-CMDA-SANCTION",
    "title": "CMDA Single Window Planning Permission Manual & Scrutiny Code",
    "shortTitle": "CMDA Planning Permission Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Tamil Nadu",
      "city": "Chennai",
      "authority": "Chennai Metropolitan Development Authority (CMDA / GCC)"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2022",
    "version": "CMDA Single Window System (SWS) Manual 2022",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Chennai Metropolitan Development Authority (CMDA / GCC)",
      "officialUrl": "https://cmdachennai.gov.in",
      "documentUrl": "https://cmdachennai.gov.in/PlanningPermission.html",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Complete procedure for Non-MSB (Ordinary), High-Rise (MSB), and layout planning permissions across Chennai Metropolitan Area under TNCDBR 2019.",
    "keyProvisions": [
      "Online Single Window System (SWS) automated scrutiniser for architectural drawings",
      "Multi-Storeyed Building (MSB) Panel scrutiny for buildings exceeding 18.30m height",
      "Open Space Reservation (OSR) 10% land transfer or guideline value payment for plots > 3,000 sq.m",
      "Mandatory infrastructure and amenity charges schedule under TCP Act Section 59"
]
  },
  {
    "id": "DOC-AUTH-COIMBATORE-CCMC",
    "title": "Coimbatore City Municipal Corporation Planning Permission Code",
    "shortTitle": "CCMC Planning Permission Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Tamil Nadu",
      "city": "Coimbatore",
      "authority": "Coimbatore City Municipal Corporation & DTCP Coimbatore"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "CCMC Town Planning Code (TNCDBR 2019 Aligned)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Coimbatore City Municipal Corporation & DTCP Coimbatore",
      "officialUrl": "https://ccmc.gov.in",
      "documentUrl": "https://ccmc.gov.in/townplanning",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building sanction rules, industrial-textile corridor setbacks, and Noyyal River catchment protection overlays in Coimbatore.",
    "keyProvisions": [
      "Noyyal river and tank water spread buffer enforcement (15m to 30m)",
      "Special industrial and textile processing zone building safety standards",
      "Single Window Clearance for commercial and residential buildings under TNCDBR 2019",
      "Rainwater harvesting percolation pit audit before power connection"
]
  },
  {
    "id": "DOC-AUTH-MADURAI-MMC",
    "title": "Madurai Municipal Corporation Heritage Precinct & Sanction Manual",
    "shortTitle": "Madurai Corporation Sanction Code",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Tamil Nadu",
      "city": "Madurai",
      "authority": "Madurai Corporation & DTCP Madurai"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "Madurai Heritage & Sanction Code 2021",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Madurai Corporation & DTCP Madurai",
      "officialUrl": "https://maduraicorporation.co.in",
      "documentUrl": "https://maduraicorporation.co.in/townplanning",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building approvals, Meenakshi Temple heritage height ceiling, and Vaigai River flood zone regulations in Madurai.",
    "keyProvisions": [
      "Meenakshi Amman Temple 1 km heritage zone strict 9m / 12m height ceiling",
      "Vaigai River active riverbed and bank protection buffer (30m)",
      "Automated building scrutiny system under TNCDBR 2019",
      "Heritage facade architectural harmony guidelines"
]
  },
  {
    "id": "DOC-AUTH-GHMC-TSBPASS",
    "title": "GHMC TS-bPASS Building Approval & Self-Certification Guidelines",
    "shortTitle": "GHMC TS-bPASS Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Telangana",
      "city": "Hyderabad",
      "authority": "Greater Hyderabad Municipal Corporation"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "TS-bPASS Operational Guidelines 2021 (Amended 2023)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Greater Hyderabad Municipal Corporation",
      "officialUrl": "https://tsbpass.telangana.gov.in",
      "documentUrl": "https://tsbpass.telangana.gov.in/UserManual.aspx",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Online statutory building permission system across Hyderabad, implementing instant registrations, self-certifications, and single-window committee approvals.",
    "keyProvisions": [
      "Category 1: Plot area up to 75 sq.yards (62.7 sq.m) - No building permission required (registration only for token \u20b91)",
      "Category 2: Plot area up to 500 sq.m and height up to 10m - Instant online self-certification approval",
      "Category 3: Plot area > 500 sq.m or height > 10m - Single Window clearance within 21 days",
      "Mandatory 10% mortgage of built-up area to GHMC as security for bye-law compliance"
]
  },
  {
    "id": "DOC-AUTH-HMDA-SANCTION",
    "title": "HMDA Layout & High-Rise Building Scrutiny Regulations",
    "shortTitle": "HMDA Scrutiny Code",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Telangana",
      "city": "Hyderabad",
      "authority": "Hyderabad Metropolitan Development Authority"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "HMDA Development Regulations & TS-bPASS Integration",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Hyderabad Metropolitan Development Authority",
      "officialUrl": "https://www.hmda.org.in",
      "documentUrl": "https://www.hmda.org.in/building-regulations/",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs gated communities, multi-storeyed complexes, Outer Ring Road (ORR) Special Development Zone, and layout scrutinies across HMDA area.",
    "keyProvisions": [
      "Outer Ring Road Growth Corridor (ORRGC): 1 km buffer on both sides with special high-density zoning",
      "Lake buffer protection (30m FTL buffer for lakes > 10 Ha; 9m buffer for smaller water bodies)",
      "High-rise buildings (> 50m) mandatory aerodynamic and wind-tunnel testing certification",
      "Integrated township minimum plot size and open space handover requirements"
]
  },
  {
    "id": "DOC-AUTH-KMC-SANCTION",
    "title": "KMC Building Plan Sanction Manual & Heritage Conservation Rules",
    "shortTitle": "KMC Building Sanction Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "West Bengal",
      "city": "Kolkata",
      "authority": "Kolkata Municipal Corporation"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2020",
    "version": "KMC Building Rules 2009 (Amended to 2023)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Kolkata Municipal Corporation",
      "officialUrl": "https://www.kmcgov.in",
      "documentUrl": "https://www.kmcgov.in/KMCPortal/jsp/BuildingDepartment.jsp",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building sanctions, heritage building grade regulations (Grade I, IIA, IIB, III), narrow lane height controls, and occupancy certificates in Kolkata.",
    "keyProvisions": [
      "Narrow street height restrictions: Building height strictly capped as function of front street width",
      "Heritage Conservation Committee (HCC) mandatory sanction for Grade I, II, III heritage properties",
      "Automated Building Plan Approval System (e-Sanction)",
      "Mandatory structural peer review for buildings exceeding 15.5m height"
]
  },
  {
    "id": "DOC-AUTH-AMC-AUTODCR",
    "title": "AMC Automated Building Scrutiny Manual & Heritage Precinct Code",
    "shortTitle": "AMC AutoDCR & Walled City Heritage Code",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Gujarat",
      "city": "Ahmedabad",
      "authority": "Ahmedabad Municipal Corporation & AUDA"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "AMC AutoDCR Scrutiny Code (CGDCR 2017 Implementation)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Ahmedabad Municipal Corporation & AUDA",
      "officialUrl": "https://ahmedabadcity.gov.in",
      "documentUrl": "https://ahmedabadcity.gov.in/portal/jsp/eServices/TownPlanning.jsp",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs automated architectural scrutiny, UNESCO World Heritage Walled City development controls, and Sabarmati Riverfront special overlays.",
    "keyProvisions": [
      "UNESCO Walled City of Ahmedabad: Strict conservation norms, traditional Pol house facades, height caps",
      "Sabarmati Riverfront Development (SRFDCL) special design codes and volumetric controls",
      "Affordable housing / R2 zone FSI enhancement provisions under CGDCR-2017",
      "Automated scrutiny through AMC Single Window Clearance System"
]
  },
  {
    "id": "DOC-AUTH-SMC-SURAT",
    "title": "Surat Municipal Corporation Building Permission & Textile Zone Manual",
    "shortTitle": "SMC Building Permission Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Gujarat",
      "city": "Surat",
      "authority": "Surat Municipal Corporation & SUDA"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "SMC AutoDCR / CGDCR 2021",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Surat Municipal Corporation & SUDA",
      "officialUrl": "https://suratmunicipal.gov.in",
      "documentUrl": "https://suratmunicipal.gov.in/Departments/TownPlanning",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building permissions, Tapi River flood protection overlays, and Diamond/Textile park fire safety regulations in Surat.",
    "keyProvisions": [
      "Tapi River high flood contour buffer restrictions and embankment building setbacks",
      "Diamond Bourse and textile market special multi-level fire safety and logistics parking standards",
      "Automated CAD scrutiny via SMC Single Window BPAMS",
      "Rainwater percolation wells and solar rooftop installation mandates"
]
  },
  {
    "id": "DOC-AUTH-VMC-VADODARA",
    "title": "Vadodara Municipal Corporation Building Sanction Code",
    "shortTitle": "VMC Sanction Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Gujarat",
      "city": "Vadodara",
      "authority": "Vadodara Municipal Corporation & VUDA"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "VMC AutoDCR CGDCR Code 2021",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Vadodara Municipal Corporation & VUDA",
      "officialUrl": "https://vmc.gov.in",
      "documentUrl": "https://vmc.gov.in/townplanning.aspx",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building scrutiny regulations, Vishwamitri River ecological corridor buffer, and chemical belt safety setbacks in Vadodara.",
    "keyProvisions": [
      "Vishwamitri River riparian buffer and crocodile habitat protection zone",
      "Petrochemical and industrial buffer setback zones",
      "Heritage palace precinct height restrictions (Laxmi Vilas Palace buffer)",
      "Automated online building permit workflow"
]
  },
  {
    "id": "DOC-AUTH-RUDA-RAJKOT",
    "title": "Rajkot Urban Development Authority Sanction Guidelines",
    "shortTitle": "RUDA / RMC Sanction Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Gujarat",
      "city": "Rajkot",
      "authority": "Rajkot Urban Development Authority & RMC"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "RUDA Building Sanction Code 2021",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Rajkot Urban Development Authority & RMC",
      "officialUrl": "https://rajkotuda.com",
      "documentUrl": "https://rajkotuda.com/townplanning",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building permission norms, Aji and Nyari lake catchment protection, and engineering industrial layout guidelines in Rajkot.",
    "keyProvisions": [
      "Aji and Nyari reservoir catchment area environmental protection",
      "Engineering and auto-parts industrial cluster safety regulations",
      "Ring Road TOD corridor FSI incentives",
      "Online BPAMS automated plan scrutiny"
]
  },
  {
    "id": "DOC-AUTH-JDA-SANCTION",
    "title": "Jaipur Development Authority (JDA) Building Sanction Manual",
    "shortTitle": "JDA Building Sanction Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Rajasthan",
      "city": "Jaipur",
      "authority": "Jaipur Development Authority"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2020",
    "version": "JDA Building Regulations 2020 (Amended 2023)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Jaipur Development Authority",
      "officialUrl": "https://urban.rajasthan.gov.in/jda",
      "documentUrl": "https://jda.urban.rajasthan.gov.in/content/raj/udh/jda---jaipur/en/rules/building-regulations.html",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building permissions, Walled Pink City heritage regulations, standard setbacks, and height controls across Jaipur Metropolitan Region.",
    "keyProvisions": [
      "Jaipur Walled Pink City UNESCO World Heritage Zone: Heritage facade preservation, uniform pink terracotta shade, 12m height cap",
      "Standard residential, group housing, and commercial setback and FAR tables under Rajasthan Building Bye-Laws 2020",
      "Airport Authority of India (AAI) height zoning for Sanganer Airport influence area",
      "Online single window building sanction system (JDA E-Mitra / BPAMS)"
]
  },
  {
    "id": "DOC-AUTH-NOIDA-SANCTION",
    "title": "NOIDA Authority Building Regulations & Automated Scrutiny Manual",
    "shortTitle": "NOIDA Building Regulations Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Noida",
      "authority": "New Okhla Industrial Development Authority"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2020",
    "version": "NOIDA Building Regulations 2010 (Amended to 2023)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "New Okhla Industrial Development Authority",
      "officialUrl": "https://noidaauthorityonline.in",
      "documentUrl": "https://noidaauthorityonline.in/en/building-regulations",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs group housing, commercial complexes, IT parks, and industrial plot building sanctions, completion certificates, and compoundable limits in Noida.",
    "keyProvisions": [
      "Group Housing: Maximum FAR 2.75 + purchasable FAR up to 3.50 with mandatory 15% green area",
      "IT & Institutional plots: FAR up to 3.00 with dedicated data center & software campus parameters",
      "Okhla Bird Sanctuary Eco-Sensitive Zone (ESZ) distance restrictions and environmental conditions",
      "Compoundable deviations strictly capped at 5% with exponential penalty fees"
]
  },
  {
    "id": "DOC-AUTH-GNIDA-SANCTION",
    "title": "Greater Noida Authority (GNIDA) Building Sanction & Scrutiny Code",
    "shortTitle": "GNIDA Sanction Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Greater Noida",
      "authority": "Greater Noida Industrial Development Authority"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "GNIDA Building Regulations (Amended 2021)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Greater Noida Industrial Development Authority",
      "officialUrl": "https://greaternoidaauthority.in",
      "documentUrl": "https://greaternoidaauthority.in/building-cell",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building sanctions, institutional mega-projects, industrial parks, and high-rise group housing parameters in Greater Noida.",
    "keyProvisions": [
      "Institutional mega-campus and knowledge park FAR and coverage norms",
      "Industrial logistics and manufacturing park building controls",
      "Structural safety peer review and completion certificate protocols",
      "Automated drawing scrutiny via GNIDA Single Window portal"
]
  },
  {
    "id": "DOC-AUTH-YEIDA-SANCTION",
    "title": "YEIDA Yamuna Expressway Industrial Development Building Code",
    "shortTitle": "YEIDA Building Sanction Code",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "YEIDA (Yamuna Expressway)",
      "authority": "Yamuna Expressway Industrial Development Authority"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "YEIDA Building Regulations 2021",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Yamuna Expressway Industrial Development Authority",
      "officialUrl": "https://yamunaexpresswayauthority.com",
      "documentUrl": "https://yamunaexpresswayauthority.com/building-regulations",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building norms, Noida International Airport (Jewar) aviation height envelope, and Electronic City/Logistics hub development regulations along Yamuna Expressway.",
    "keyProvisions": [
      "Jewar Noida International Airport (NIA) Obstacle Limitation Surfaces (OLS) height caps",
      "Semiconductor Park, Electronic Manufacturing Cluster (EMC), and Data Center building standards",
      "Expressway 100m green buffer setback enforcement",
      "Online automated building plan approval system"
]
  },
  {
    "id": "DOC-AUTH-LDA-LUCKNOW",
    "title": "Lucknow Development Authority (LDA) Building Sanction Manual",
    "shortTitle": "LDA Building Sanction Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Lucknow",
      "authority": "Lucknow Development Authority"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "LDA Building Bye-Laws (UP Model Bye-Laws 2021 Implementation)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Lucknow Development Authority",
      "officialUrl": "https://onlineuplda.com",
      "documentUrl": "https://onlineuplda.com/building-sanction",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs town planning permissions, Gomti Riverfront buffer regulations, and Heritage Zone scrutiny across Lucknow.",
    "keyProvisions": [
      "Gomti Riverfront development and 50m green buffer protection",
      "Heritage corridor building height restrictions (Hussainabad & Kaiserbagh precincts)",
      "Automated online building plan approval system (UP-OBPAS)",
      "Rainwater harvesting and ground water recharge certification"
]
  },
  {
    "id": "DOC-AUTH-KDA-KANPUR",
    "title": "Kanpur Development Authority Building Permission Manual",
    "shortTitle": "KDA Building Sanction Code",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Kanpur",
      "authority": "Kanpur Development Authority"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "KDA Building Code 2021 (UP Bye-Laws Aligned)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Kanpur Development Authority",
      "officialUrl": "https://kdakanpur.up.gov.in",
      "documentUrl": "https://kdakanpur.up.gov.in/townplanning",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building sanctions, Ganga River pollution buffer controls, and leather/textile industrial zone regulations in Kanpur.",
    "keyProvisions": [
      "Ganga River high-flood level 100m to 200m environmental buffer protection",
      "Industrial zone effluent treatment and CETP connection mandates",
      "Automated drawing scrutiny via UP-OBPAS",
      "Seismic Zone IV structural compliance"
]
  },
  {
    "id": "DOC-AUTH-VDA-VARANASI",
    "title": "Varanasi Development Authority Heritage & Sanction Code",
    "shortTitle": "VDA Sanction Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Varanasi",
      "authority": "Varanasi Development Authority"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "VDA Heritage & Building Bye-Laws 2021",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Varanasi Development Authority",
      "officialUrl": "https://vdavns.up.gov.in",
      "documentUrl": "https://vdavns.up.gov.in/townplanning",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building approvals, Ganga Ghat 200m prohibited buffer, and Kashi Vishwanath Dham heritage precinct architectural controls.",
    "keyProvisions": [
      "Ganga Ghat 200m prohibited zone: Zero new construction / height capped strictly per NGT and High Court orders",
      "Heritage corridor facade uniformity (traditional stone cladding and archways)",
      "Automated building scrutiny system under UP-OBPAS",
      "Narrow street building height ratios in old Kashi alleys"
]
  },
  {
    "id": "DOC-AUTH-ADA-AGRA",
    "title": "Agra Development Authority Taj Trapezium Zone (TTZ) Sanction Code",
    "shortTitle": "ADA TTZ Sanction Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Agra",
      "authority": "Agra Development Authority & TTZ Authority"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "ADA Building Bye-Laws & TTZ Guidelines 2021",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Agra Development Authority & TTZ Authority",
      "officialUrl": "https://adaagra.up.gov.in",
      "documentUrl": "https://adaagra.up.gov.in/townplanning",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building sanctions, Supreme Court Taj Trapezium Zone (TTZ) environmental controls, and Taj Mahal visual corridor height restrictions.",
    "keyProvisions": [
      "Taj Trapezium Zone (TTZ): Strict prohibition on polluting industries and mandatory clean fuel usage",
      "Taj Mahal visual corridor height caps and ASI 300m regulated zone compliance",
      "Yamuna River environmental buffer zone",
      "UP-OBPAS automated building plan scrutiny"
]
  },
  {
    "id": "DOC-AUTH-GDA-GHAZIABAD",
    "title": "Ghaziabad Development Authority (GDA) Building Sanction Manual",
    "shortTitle": "GDA Sanction Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Ghaziabad",
      "authority": "Ghaziabad Development Authority"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "GDA Building Code 2021 (UP-OBPAS)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Ghaziabad Development Authority",
      "officialUrl": "https://gdaghaziabad.up.gov.in",
      "documentUrl": "https://gdaghaziabad.up.gov.in/townplanning",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building approvals, Hindon River eco-buffer, and Delhi-Meerut RRTS Transit-Oriented Development (TOD) corridor rules in Ghaziabad.",
    "keyProvisions": [
      "RRTS Corridor TOD FSI up to 4.0 within 1.5 km influence zone of Regional Rapid Transit stations",
      "Hindon River 50m active flood plain buffer enforcement",
      "Group housing and commercial building scrutiny via UP-OBPAS",
      "Rainwater harvesting and ground water recharge mandates"
]
  },
  {
    "id": "DOC-AUTH-GMADA-MOHALI",
    "title": "GMADA SAS Nagar (Mohali) Building Sanction & Architectural Controls",
    "shortTitle": "GMADA Sanction Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Punjab",
      "city": "Mohali (SAS Nagar)",
      "authority": "Greater Mohali Area Development Authority"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "GMADA Architectural Control Book 2021 (PBR-2021 Aligned)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Greater Mohali Area Development Authority",
      "officialUrl": "https://gmada.gov.in",
      "documentUrl": "https://gmada.gov.in/building-rules",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building permissions, Chandigarh periphery controlled area restrictions, and IT City Mohali development standards.",
    "keyProvisions": [
      "Punjab New Capital (Periphery) Control Act 1952 enforcement",
      "IT City Mohali and Aero City high-density commercial/group housing FAR norms",
      "Chandigarh International Airport (IXC) aviation height funnel restrictions",
      "Automated building plan approval via e-Naksha Punjab portal"
]
  },
  {
    "id": "DOC-AUTH-GLADA-LUDHIANA",
    "title": "GLADA Ludhiana Building Permission & Industrial Estate Manual",
    "shortTitle": "GLADA Sanction Code",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Punjab",
      "city": "Ludhiana",
      "authority": "Greater Ludhiana Area Development Authority & MC Ludhiana"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "GLADA / MC Ludhiana Building Code 2021",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Greater Ludhiana Area Development Authority & MC Ludhiana",
      "officialUrl": "https://glada.gov.in",
      "documentUrl": "https://glada.gov.in/townplanning",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building sanctions, Buddha Nullah pollution abatement buffer, and industrial focal point building controls in Ludhiana.",
    "keyProvisions": [
      "Buddha Nullah 25m environmental green buffer and zero-discharge norms",
      "Focal point hosiery, cycle, and engineering industrial shed building regulations",
      "e-Naksha Punjab online automated building sanction system",
      "Fire safety and industrial hazardous occupancy standards"
]
  },
  {
    "id": "DOC-AUTH-IDA-INDORE",
    "title": "Indore Development Authority (IDA) Building Sanction Manual",
    "shortTitle": "IDA Sanction Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Madhya Pradesh",
      "city": "Indore",
      "authority": "Indore Development Authority & IMC"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "IDA / IMC Building Permission Code (MP Bhumi Vikas Rules 2012 Aligned)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Indore Development Authority & IMC",
      "officialUrl": "https://idaindore.org",
      "documentUrl": "https://idaindore.org/townplanning",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building permissions, Super Corridor IT hub special zoning, and Khan River rejuvenation buffer rules in Indore.",
    "keyProvisions": [
      "Super Corridor high-density TOD and IT/ITeS campus FAR up to 3.50",
      "Khan River / Saraswati River 30m rejuvenation buffer and clean water safeguards",
      "Swachh Indore solid waste segregation chute and compactor mandates in multi-storeyed buildings",
      "Automated drawing scrutiny via ABPAS Madhya Pradesh"
]
  },
  {
    "id": "DOC-AUTH-BDA-BHOPAL",
    "title": "Bhopal Development Authority Building Sanction Code",
    "shortTitle": "BDA Bhopal Sanction Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Madhya Pradesh",
      "city": "Bhopal",
      "authority": "Bhopal Development Authority & BMC"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "BDA Bhopal Building Code 2021 (MP Bhumi Vikas Rules Aligned)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Bhopal Development Authority & BMC",
      "officialUrl": "https://bda.mp.gov.in",
      "documentUrl": "https://bda.mp.gov.in/townplanning",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building approvals, Upper Lake (Bhoj Wetland Ramsar Site) 50m to 100m catchment buffer, and BRTS corridor zoning in Bhopal.",
    "keyProvisions": [
      "Bhoj Wetland (Upper Lake) Ramsar site strict catchment and full-tank level buffer restrictions",
      "BRTS corridor high-density transit-oriented development incentives",
      "Automated building approval via ABPAS Madhya Pradesh",
      "Seismic Zone II/III structural stability compliance"
]
  },
  {
    "id": "DOC-AUTH-VMRDA-VIZAG",
    "title": "VMRDA Visakhapatnam Metropolitan Building Sanction Manual",
    "shortTitle": "VMRDA Sanction Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Andhra Pradesh",
      "city": "Visakhapatnam",
      "authority": "Visakhapatnam Metropolitan Region Development Authority & GVMC"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "VMRDA Building Regulations (AP Building Rules 2017 Aligned)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Visakhapatnam Metropolitan Region Development Authority & GVMC",
      "officialUrl": "https://vmrda.gov.in",
      "documentUrl": "https://vmrda.gov.in/townplanning",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building sanctions, Coastal Regulation Zone (CRZ-II/III) waterfront rules, cyclone-resilient structural norms, and hill-slope protection in Visakhapatnam.",
    "keyProvisions": [
      "Coastal Regulation Zone (CRZ) beach road buffer and height zoning",
      "High cyclone wind speed (50 m/s / Zone V wind) structural engineering mandate",
      "Kailasagiri and Rushikonda hill slope development restrictions",
      "Automated online building approval via AP-DPMS"
]
  },
  {
    "id": "DOC-AUTH-APCRDA-VIJAYAWADA",
    "title": "APCRDA Amaravati & Vijayawada Building Sanction Guidelines",
    "shortTitle": "APCRDA Sanction Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Andhra Pradesh",
      "city": "Vijayawada",
      "authority": "Andhra Pradesh Capital Region Development Authority & VMC"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "APCRDA Building Regulations 2021",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Andhra Pradesh Capital Region Development Authority & VMC",
      "officialUrl": "https://crda.ap.gov.in",
      "documentUrl": "https://crda.ap.gov.in/townplanning",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building permissions, Krishna River flood embankment setbacks, and Capital City Amaravati development zoning standards.",
    "keyProvisions": [
      "Krishna River flood bank 50m environmental buffer protection",
      "Amaravati Capital City grid zoning and high-density FAR provisions",
      "Automated building permission system via AP-DPMS",
      "Rainwater harvesting and canal irrigation protection buffers"
]
  },
  {
    "id": "DOC-AUTH-BDA-BHUBANESWAR",
    "title": "Bhubaneswar Development Authority (BDA) Building Sanction Code",
    "shortTitle": "BDA Bhubaneswar Sanction Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Odisha",
      "city": "Bhubaneswar",
      "authority": "Bhubaneswar Development Authority & BMC"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "BDA Planning & Building Standards Regulations 2020",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Bhubaneswar Development Authority & BMC",
      "officialUrl": "https://bda.gov.in",
      "documentUrl": "https://bda.gov.in/building-regulations",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building approvals, heritage temple corridor restrictions (Old Town Lingaraj precinct), and cyclone-resilient construction in Bhubaneswar.",
    "keyProvisions": [
      "Lingaraj Temple and Old Town heritage precinct strict height limits (max 12m) and facade guidelines",
      "Cyclone-resilient building standards under Odisha Planning & Building Standard Rules",
      "Automated Building Plan Approval System (e-BIKASH)",
      "Daya River and Gangua Nallah drainage buffer zones"
]
  },
  {
    "id": "DOC-AUTH-CDA-CUTTACK",
    "title": "Cuttack Development Authority Building Sanction Manual",
    "shortTitle": "CDA Cuttack Sanction Code",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Odisha",
      "city": "Cuttack",
      "authority": "Cuttack Development Authority & CMC"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "CDA Building Regulations 2021 (OPBSR Aligned)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Cuttack Development Authority & CMC",
      "officialUrl": "https://cda.odisha.gov.in",
      "documentUrl": "https://cda.odisha.gov.in/townplanning",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building sanctions, Mahanadi and Kathajodi river embankment protection buffers, and silver city narrow lane regulations in Cuttack.",
    "keyProvisions": [
      "Mahanadi & Kathajodi river ring embankment 50m protection buffer",
      "Narrow historic settlement street width building height limits",
      "e-BIKASH online building plan scrutiny",
      "Rainwater harvesting and de-watering safety measures"
]
  },
  {
    "id": "DOC-AUTH-PRDA-PATNA",
    "title": "Patna Municipal Corporation & PRDA Building Sanction Manual",
    "shortTitle": "Patna Building Sanction Code",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Bihar",
      "city": "Patna",
      "authority": "Patna Municipal Corporation & PRDA"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "Bihar Building Bye-Laws 2014 (Amended to 2022) / PMC Manual",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Patna Municipal Corporation & PRDA",
      "officialUrl": "https://pmc.bihar.gov.in",
      "documentUrl": "https://pmc.bihar.gov.in/townplanning",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building permissions, Ganga River flood plain restrictions, narrow street height limits, and Seismic Zone IV structural scrutiny in Patna.",
    "keyProvisions": [
      "Ganga River high-flood level 200m buffer and Marine Drive (Ganga Path) corridor controls",
      "Strict street-width to building height proportionality in dense residential colonies",
      "Seismic Zone IV earthquake-resistant design certification",
      "Automated building plan approval via Bihar Single Window System"
]
  },
  {
    "id": "DOC-AUTH-RRDA-RANCHI",
    "title": "Ranchi Regional Development Authority (RRDA) Sanction Manual",
    "shortTitle": "RRDA Ranchi Sanction Code",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Jharkhand",
      "city": "Ranchi",
      "authority": "Ranchi Regional Development Authority & RMC"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "Jharkhand Building Bye-Laws 2016 (Amended 2022)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Ranchi Regional Development Authority & RMC",
      "officialUrl": "https://rrda.jharkhand.gov.in",
      "documentUrl": "https://rrda.jharkhand.gov.in/townplanning",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building approvals, Subarnarekha and Harmu River buffer protections, and plateau slope development regulations in Ranchi.",
    "keyProvisions": [
      "Subarnarekha and Harmu river 30m environmental green buffer",
      "Plateau hill slope and forest fringe building setbacks",
      "Online building plan approval system (OBPAS Jharkhand)",
      "Rainwater harvesting recharge pits in hard-rock terrain"
]
  },
  {
    "id": "DOC-AUTH-GMDA-GUWAHATI",
    "title": "Guwahati Metropolitan Development Authority (GMDA) Sanction Code",
    "shortTitle": "GMDA Guwahati Sanction Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Assam",
      "city": "Guwahati",
      "authority": "Guwahati Metropolitan Development Authority & GMC"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "Guwahati Building Byelaws 2014 (Amended 2022)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Guwahati Metropolitan Development Authority & GMC",
      "officialUrl": "https://gmda.assam.gov.in",
      "documentUrl": "https://gmda.assam.gov.in/documents-detail/building-byelaws",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building sanctions, Brahmaputra River flood plain restrictions, hill cutting prohibitions, and Seismic Zone V structural scrutiny in Guwahati.",
    "keyProvisions": [
      "Hill cutting strict prohibition under Guwahati Building Byelaws & disaster prevention orders",
      "Brahmaputra River and Deepor Beel Ramsar site environmental protection zones",
      "Seismic Zone V (Highest Seismic Hazard in India) ductile detailing and proof checking",
      "Single window online building permission system"
]
  },
  {
    "id": "DOC-AUTH-MDDA-DEHRADUN",
    "title": "MDDA Dehradun Building Sanction & Doon Valley Eco-Code",
    "shortTitle": "MDDA Sanction Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Uttarakhand",
      "city": "Dehradun",
      "authority": "Mussoorie Dehradun Development Authority"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "MDDA Building Bye-Laws 2021 (Doon Valley Notification Aligned)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Mussoorie Dehradun Development Authority",
      "officialUrl": "https://mddaonline.in",
      "documentUrl": "https://mddaonline.in/building-bye-laws",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building approvals, Doon Valley Eco-Sensitive Zone Notification controls, Rispana/Bindal river buffers, and Seismic Zone IV structural scrutiny in Dehradun.",
    "keyProvisions": [
      "Doon Valley Notification 1989 environmental guidelines (non-polluting tourism & IT industries)",
      "Rispana and Bindal river 15m to 30m flood channel protection buffer",
      "Mussoorie special hill contour height caps (max 11m / 2 storeys) and slope prohibitions",
      "Online building plan approval system (MDDA OBPAS)"
]
  },
  {
    "id": "DOC-AUTH-SMRDA-SHIMLA",
    "title": "Shimla SMRDA Hill Architecture & Green Belt Building Sanction Code",
    "shortTitle": "Shimla SMRDA Sanction Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Himachal Pradesh",
      "city": "Shimla",
      "authority": "Shimla Municipal Corporation & SMRDA"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "Shimla Planning Area Building Regulations 2021 (NGT Aligned)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Shimla Municipal Corporation & SMRDA",
      "officialUrl": "https://shimlamc.hp.gov.in",
      "documentUrl": "https://shimlamc.hp.gov.in/townplanning",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building permissions, 17 Notified Green Belts complete construction ban, Heritage Core Zone controls, and hill slope stability rules in Shimla.",
    "keyProvisions": [
      "17 Notified Green Belts: Complete ban on any new construction as per NGT and Supreme Court orders",
      "Core and Heritage Area: Strict height cap of 2 storeys + attic (max 10m height)",
      "Hill slope development: Prohibited on slopes steeper than 45 degrees",
      "Automated building approval via HP-DCR portal"
]
  },
  {
    "id": "DOC-AUTH-SDA-SRINAGAR",
    "title": "Srinagar Development Authority (SDA) Building Sanction Manual",
    "shortTitle": "SDA Srinagar Sanction Code",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Jammu & Kashmir (UT)",
      "city": "Srinagar",
      "authority": "Srinagar Development Authority & SMC"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "J&K Unified Building Bye-Laws 2021 (Srinagar Overlay)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Srinagar Development Authority & SMC",
      "officialUrl": "https://sdasrinagar.jk.gov.in",
      "documentUrl": "https://sdasrinagar.jk.gov.in/townplanning",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building sanctions, Dal Lake 200m prohibited buffer, Jhelum River flood protection zone, and Seismic Zone V structural norms in Srinagar.",
    "keyProvisions": [
      "Dal Lake and Nigeen Lake: 200m strict prohibited buffer under LAWDA / LCMA regulations",
      "Jhelum River flood spill channel and flood retention basin building restrictions",
      "Seismic Zone V earthquake-resistant timber/RCC composite engineering guidelines",
      "Online building plan approval via J&K Single Window System"
]
  },
  {
    "id": "DOC-AUTH-JDA-JAMMU",
    "title": "Jammu Development Authority (JDA) Building Sanction Code",
    "shortTitle": "JDA Jammu Sanction Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Jammu & Kashmir (UT)",
      "city": "Jammu",
      "authority": "Jammu Development Authority & JMC"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "J&K Unified Building Bye-Laws 2021 (Jammu Overlay)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Jammu Development Authority & JMC",
      "officialUrl": "https://jdajammu.in",
      "documentUrl": "https://jdajammu.in/townplanning",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building approvals, Tawi River flood plain restrictions, and Bahu Fort heritage buffer regulations in Jammu.",
    "keyProvisions": [
      "Tawi Riverfront artificial lake and flood channel protection buffer (50m)",
      "Bahu Fort and Mubarak Mandi heritage palace precinct height controls",
      "Automated building approval via J&K Single Window Portal",
      "Seismic Zone IV structural safety compliance"
]
  },
  {
    "id": "DOC-AUTH-RDA-RAIPUR",
    "title": "Raipur Development Authority & NRDA Nava Raipur Sanction Code",
    "shortTitle": "RDA / NRDA Sanction Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Chhattisgarh",
      "city": "Raipur",
      "authority": "Raipur Development Authority & Nava Raipur (NRDA)"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "Chhattisgarh Bhumi Vikas Niyam (Amended 2021) / NRDA Code",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Raipur Development Authority & Nava Raipur (NRDA)",
      "officialUrl": "https://rdaraipur.com",
      "documentUrl": "https://rdaraipur.com/townplanning",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building sanctions, Nava Raipur smart city planned grid controls, and Kharun River environmental protection buffer.",
    "keyProvisions": [
      "Nava Raipur planned sector grid zoning, mandatory green setbacks, and high FAR incentives",
      "Kharun River 30m flood protection green corridor",
      "Online building permission system (CG-BPAMS)",
      "Mandatory solar rooftop and smart metering provisions"
]
  },
  {
    "id": "DOC-AUTH-GCDA-KOCHI",
    "title": "GCDA Kochi & Kochi Municipal Corporation Building Sanction Code",
    "shortTitle": "GCDA Kochi Sanction Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Kerala",
      "city": "Kochi",
      "authority": "Greater Cochin Development Authority & Kochi Municipal Corporation"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "KMBR 2019 (Kochi Metropolitan Overlay 2021)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Greater Cochin Development Authority & Kochi Municipal Corporation",
      "officialUrl": "https://gcda.kerala.gov.in",
      "documentUrl": "https://gcda.kerala.gov.in/townplanning",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building permissions, Vembanad Lake CRZ-II buffer regulations, Kochi Metro TOD corridor, and backwater canal setbacks in Kochi.",
    "keyProvisions": [
      "Vembanad Lake CRZ-II and backwater canal waterfront protection buffers",
      "Kochi Metro TOD corridor FSI incentives within 500m of stations",
      "Automated building permit workflow via Kerala SANKETHAM portal",
      "High water table foundation and piling engineering standards"
]
  },
  {
    "id": "DOC-AUTH-TRIDA-TRIVANDRUM",
    "title": "TRIDA Thiruvananthapuram Metropolitan Building Sanction Code",
    "shortTitle": "TRIDA Trivandrum Sanction Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Kerala",
      "city": "Thiruvananthapuram",
      "authority": "Thiruvananthapuram Regional Development Authority & TMC"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "KMBR 2019 (TRIDA Master Plan Overlay)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Thiruvananthapuram Regional Development Authority & TMC",
      "officialUrl": "https://trida.kerala.gov.in",
      "documentUrl": "https://trida.kerala.gov.in/townplanning",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building sanctions, Padmanabhaswamy Temple heritage security zone, and coastal Karamana River buffer regulations in Thiruvananthapuram.",
    "keyProvisions": [
      "Sree Padmanabhaswamy Temple 500m heritage security and height ceiling (max 10m)",
      "Karamana and Killi River flood channel 15m green protection buffer",
      "Automated drawing scrutiny via SANKETHAM portal",
      "Rainwater harvesting and slope terracing mandates"
]
  },
  {
    "id": "DOC-AUTH-PDA-PRAYAGRAJ",
    "title": "Prayagraj Development Authority (PDA) Building Sanction Manual",
    "shortTitle": "PDA Prayagraj Sanction Code",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Prayagraj",
      "authority": "Prayagraj Development Authority"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "PDA Building Regulations 2021 (UP-OBPAS)",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Prayagraj Development Authority",
      "officialUrl": "https://pdaprayagraj.in",
      "documentUrl": "https://pdaprayagraj.in/townplanning",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building approvals, Triveni Sangam flood plain 200m buffer, and Maha Kumbh Mela movement corridor regulations in Prayagraj.",
    "keyProvisions": [
      "Triveni Sangam & Ganga-Yamuna confluence 200m prohibited flood zone",
      "Kumbh Mela pilgrimage route widening setbacks (minimum 24m road right-of-way)",
      "Automated building approval via UP-OBPAS",
      "Seismic Zone IV structural safety compliance"
]
  },
  {
    "id": "DOC-AUTH-ADA-AMRITSAR",
    "title": "Amritsar Development Authority & MCA Heritage Sanction Code",
    "shortTitle": "ADA / MCA Sanction Manual",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "Punjab",
      "city": "Amritsar",
      "authority": "Amritsar Development Authority & Municipal Corporation Amritsar"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "Amritsar Walled City Heritage Act & PBR 2021",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "Amritsar Development Authority & Municipal Corporation Amritsar",
      "officialUrl": "https://adaamritsar.gov.in",
      "documentUrl": "https://adaamritsar.gov.in/townplanning",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Building sanctions, Golden Temple (Sri Harmandir Sahib) Galliara heritage buffer, and Walled City special building controls in Amritsar.",
    "keyProvisions": [
      "Sri Harmandir Sahib (Golden Temple) Galliara 100m heritage buffer zone (strict 10m height ceiling)",
      "Amritsar Walled City facade red-brick / Nanak Shahi architectural harmony guidelines",
      "Automated building plan approval via e-Naksha Punjab portal",
      "Seismic Zone IV structural engineering compliance"
]
  },
  {
    "id": "DOC-AUTH-WBHIDCO-KOLKATA",
    "title": "WBHIDCO New Town Kolkata Smart City Building Regulations",
    "shortTitle": "WBHIDCO New Town Sanction Code",
    "level": 4,
    "jurisdiction": {
      "country": "India",
      "state": "West Bengal",
      "city": "Kolkata",
      "authority": "West Bengal Housing Infrastructure Development Corporation (WBHIDCO / NKDA)"
    },
    "documentType": "manual",
    "documentPriority": "primary",
    "year": "2021",
    "version": "New Town Kolkata (NKDA) Building Rules 2021",
    "status": "verified",
    "categories": [
      "approvals_sanctions",
      "completion_occupancy_certificate",
      "far_fsi",
      "ground_coverage"
    ],
    "source": {
      "authority": "West Bengal Housing Infrastructure Development Corporation (WBHIDCO / NKDA)",
      "officialUrl": "https://www.wbhidcoltd.com",
      "documentUrl": "https://www.nkdamar.org/BuildingPermission.aspx",
      "documentType": "Manual",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Smart city building sanctions, Eco-Park water body buffer, and high-density financial/IT hub FAR regulations in New Town Kolkata.",
    "keyProvisions": [
      "New Town Financial & IT Hub high FAR incentives (FAR up to 4.0 on major boulevards)",
      "Eco-Park and East Kolkata Wetlands (Ramsar site) environmental buffer protection",
      "Green building mandatory IGBC/GRIHA certification for large commercial plots",
      "Automated single window building approval via NKDA portal"
]
  },
  {
    "id": "DOC-AUTH-CRZ-OVERLAY",
    "title": "MoEFCC Coastal Regulation Zone (CRZ-I, II, III, IV) Buffer Regulations",
    "shortTitle": "CRZ Statutory Overlay Code",
    "level": 4,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "special_overlay",
    "documentPriority": "primary",
    "year": "2019",
    "version": "CRZ Notification 2019 (Amended 2021)",
    "status": "verified",
    "categories": [
      "special_restrictions",
      "environmental_clearances",
      "fire_life_safety",
      "setbacks"
    ],
    "source": {
      "authority": "MoEFCC",
      "officialUrl": "https://moef.gov.in",
      "documentUrl": "https://moef.gov.in/en/division/coastal-zone-management/",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statutory nationwide coastal setbacks, High Tide Line (HTL) buffers, and No Development Zones (NDZ) applicable across all coastal states and UTs in India.",
    "keyProvisions": [
      "CRZ-I (Ecologically Sensitive): Complete prohibition on new construction",
      "CRZ-II (Developed Urban Areas): Construction permitted on landward side of existing authorized structures or roads",
      "CRZ-III (Rural Coastal Areas): 50m No Development Zone (NDZ) from HTL in densely populated rural areas (CRZ-III A) / 200m in others (CRZ-III B)",
      "Mandatory CZMA (Coastal Zone Management Authority) recommendation prior to local municipal plan sanction"
]
  },
  {
    "id": "DOC-AUTH-AAI-HEIGHT-OVERLAY",
    "title": "AAI Obstacle Limitation Surfaces (OLS) & Colour Coded Zoning Map (CCZM)",
    "shortTitle": "AAI Height Clearance Overlay",
    "level": 4,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "special_overlay",
    "documentPriority": "primary",
    "year": "2015",
    "version": "MoCA GSR 751(E) / NOCAS 2.0 System",
    "status": "verified",
    "categories": [
      "special_restrictions",
      "environmental_clearances",
      "fire_life_safety",
      "setbacks"
    ],
    "source": {
      "authority": "AAI",
      "officialUrl": "https://www.aai.aero",
      "documentUrl": "https://nocas2.aai.aero/nocas/",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Pan-India aviation height safety clearance regulations, funnel slope restrictions, and radar clearance criteria around all civil and defense airports.",
    "keyProvisions": [
      "Automated NOCAS 2.0 Colour Coded Zoning Map (CCZM) permissible top elevation limits",
      "Approach Surface slope (1:50 / 2%) and Transitional Surface (1:7 / 14.3%) height ceilings",
      "Mandatory AAI / IAF NOC required for any building penetrating CCZM permissible elevation",
      "Aviation obstacle warning lights (red flashing beacon) mandatory for structures >= 45m"
]
  },
  {
    "id": "DOC-AUTH-ASI-NMA-OVERLAY",
    "title": "ASI & National Monuments Authority Prohibited and Regulated Buffer Code",
    "shortTitle": "ASI / NMA Heritage Buffer Code",
    "level": 4,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "special_overlay",
    "documentPriority": "primary",
    "year": "2010",
    "version": "AMASR (Amendment and Validation) Act 2010",
    "status": "verified",
    "categories": [
      "special_restrictions",
      "environmental_clearances",
      "fire_life_safety",
      "setbacks"
    ],
    "source": {
      "authority": "ASI",
      "officialUrl": "https://nma.gov.in",
      "documentUrl": "https://nma.gov.in/public/content/act-and-rules",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statutory nationwide heritage protection zones around all 3,690+ Centrally Protected Monuments across India under the Archaeological Survey of India.",
    "keyProvisions": [
      "Prohibited Area (0 to 100 meters in all directions from protected monument boundary): Zero new construction or mining allowed under any circumstance",
      "Regulated Area (100 to 300 meters from protected monument boundary): Strict height, FAR, and architectural scrutiny by National Monuments Authority (NMA)",
      "Automated SMARTEC single-window clearance portal for heritage NOCs",
      "Criminal liability with non-bailable imprisonment for violations in prohibited zone"
]
  },
  {
    "id": "DOC-AUTH-CGWA-WATER-OVERLAY",
    "title": "Central Ground Water Authority (CGWA) Abstraction & RWH Mandate",
    "shortTitle": "CGWA Ground Water Regulatory Code",
    "level": 4,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "special_overlay",
    "documentPriority": "primary",
    "year": "2020",
    "version": "CGWA Guidelines 2020 (Amended 2023)",
    "status": "verified",
    "categories": [
      "special_restrictions",
      "environmental_clearances",
      "fire_life_safety",
      "setbacks"
    ],
    "source": {
      "authority": "Central",
      "officialUrl": "https://cgwa-noc.gov.in",
      "documentUrl": "https://cgwa-noc.gov.in/LandingPage/Guideline.aspx",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statutory pan-India groundwater extraction restrictions, mandatory rainwater harvesting, and water conservation fee schedules in Over-Exploited / Critical assessment units.",
    "keyProvisions": [
      "Mandatory CGWA NOC required for all commercial, industrial, infrastructure, and bulk residential projects extracting groundwater",
      "Complete prohibition on new groundwater extraction for infrastructure projects in 'Over-Exploited' assessment units without STP recycling",
      "Mandatory installation of digital water flow meters with telemetry and automated data logging",
      "Mandatory on-site recharge of at least 100% to 200% of extracted groundwater volume"
]
  },
  {
    "id": "DOC-AUTH-PESO-PETROLEUM-OVERLAY",
    "title": "PESO Fuel Storage, Dispensing & Petroleum Safety Buffer Norms",
    "shortTitle": "PESO Safety & Buffer Code",
    "level": 4,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "special_overlay",
    "documentPriority": "primary",
    "year": "2022",
    "version": "Petroleum Rules 2002 (Amended 2022) / Gas Cylinders Rules 2016",
    "status": "verified",
    "categories": [
      "special_restrictions",
      "environmental_clearances",
      "fire_life_safety",
      "setbacks"
    ],
    "source": {
      "authority": "PESO",
      "officialUrl": "https://peso.gov.in",
      "documentUrl": "https://peso.gov.in/rules-guidelines",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Mandatory safety distances, blast walls, and clearance buffers for fuel retail outlets, LPG storage, and CNG stations relative to adjoining buildings.",
    "keyProvisions": [
      "Fuel retail dispensing unit safety distance from boundary and habitable structures (minimum 3m to 15m)",
      "Underground petroleum tank storage offset and venting safety standards",
      "LPG cylinder and CNG cascade storage separation from public roads and property lines",
      "Mandatory PESO Site Approval prior to municipal layout sanction"
]
  },
  {
    "id": "DOC-AUTH-RAILWAYS-SAFETY-OVERLAY",
    "title": "Indian Railways Track Safety & Setback Distance Regulations",
    "shortTitle": "Railway Safety Setback Code",
    "level": 4,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "special_overlay",
    "documentPriority": "primary",
    "year": "2020",
    "version": "Indian Railways Works Manual / Engineering Code (Amended 2020)",
    "status": "verified",
    "categories": [
      "special_restrictions",
      "environmental_clearances",
      "fire_life_safety",
      "setbacks"
    ],
    "source": {
      "authority": "Indian",
      "officialUrl": "https://indianrailways.gov.in",
      "documentUrl": "https://indianrailways.gov.in/railwayboard/engineering-manual",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Nationwide mandatory setback distances, deep excavation protection, and structural safety clearances for buildings adjoining Indian Railways land.",
    "keyProvisions": [
      "Mandatory 30-meter clearance zone from Railway land boundary for high-rise and deep-basement structures",
      "Prohibition on deep piling or dewatering without railway divisional engineer clearance",
      "Mandatory Railway NOC for any building within 30m of track right-of-way",
      "Overhead high-voltage traction line (25 kV AC) electrical clearance envelopes"
]
  },
  {
    "id": "DOC-AUTH-NHAI-RIBBON-OVERLAY",
    "title": "NHAI Highway Ribbon Development & Access Management Policy",
    "shortTitle": "NHAI Highway Access & Setback Code",
    "level": 4,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "special_overlay",
    "documentPriority": "primary",
    "year": "2020",
    "version": "MoRTH / NHAI Access Management Guidelines 2020",
    "status": "verified",
    "categories": [
      "special_restrictions",
      "environmental_clearances",
      "fire_life_safety",
      "setbacks"
    ],
    "source": {
      "authority": "NHAI",
      "officialUrl": "https://nhai.gov.in",
      "documentUrl": "https://nhai.gov.in/guidelines/access-management",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs building lines, control lines, and direct vehicular access permissions along National Highways across India.",
    "keyProvisions": [
      "Building Line (setback from highway center): 40m (normal) to 75m (arterial/expressway)",
      "Control Line (beyond building line): Additional 15m to 25m restricted buffer",
      "Prohibition of direct vehicular access to National Highway main carriageway; service lane mandatory",
      "Mandatory NHAI / MoRTH Access NOC for all commercial fuel pumps, malls, and logistic hubs"
]
  },
  {
    "id": "DOC-AUTH-METRO-SAFETY-OVERLAY",
    "title": "Metro Rail Structure Protection Corridor & Height Clearances",
    "shortTitle": "Metro Rail Corridor Protection Code",
    "level": 4,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "special_overlay",
    "documentPriority": "primary",
    "year": "2021",
    "version": "Metro Railways (Operation and Maintenance) Act 2002 & Safety Manuals",
    "status": "verified",
    "categories": [
      "special_restrictions",
      "environmental_clearances",
      "fire_life_safety",
      "setbacks"
    ],
    "source": {
      "authority": "Metro",
      "officialUrl": "https://mohua.gov.in",
      "documentUrl": "https://mohua.gov.in/metro-railway-guidelines",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Mandatory safety buffer zones, subterranean tunnel protection envelopes, and vibration monitoring for buildings along metro rail corridors in all Indian metro cities.",
    "keyProvisions": [
      "Metro Protection Zone: 20m on either side of underground tunnel / 10m from viaduct pillar edge",
      "Mandatory Metro Rail Corporation NOC for any construction, piling, or basement within protection zone",
      "Vibration and settlement threshold limits during excavation and pile driving",
      "Overhead high-voltage 25 kV AC / 750V DC traction clearance envelopes"
]
  },
  {
    "id": "DOC-AUTH-HRBC-HIGHRISE-OVERLAY",
    "title": "High-Rise Building Committee (HRBC) Structural & Fire Scrutiny Code",
    "shortTitle": "HRBC High-Rise Committee Scrutiny Code",
    "level": 4,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "special_overlay",
    "documentPriority": "primary",
    "year": "2021",
    "version": "National High-Rise Structural & Safety Standards (NBC 2016 Part 4 & 6)",
    "status": "verified",
    "categories": [
      "special_restrictions",
      "environmental_clearances",
      "fire_life_safety",
      "setbacks"
    ],
    "source": {
      "authority": "High-Rise",
      "officialUrl": "https://bis.gov.in",
      "documentUrl": "https://bis.gov.in/codes-standards/high-rise-committee-guidelines",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Mandatory multidisciplinary expert committee scrutiny for all super-tall buildings exceeding 70 meters (or 21 storeys) across major Indian cities.",
    "keyProvisions": [
      "High-Rise Committee (HRC / HRBC) vetting mandatory for buildings > 70m height",
      "Wind tunnel aerodynamic testing and seismic non-linear response history analysis",
      "Fire safety refuge floors at every 7th floor above 24m and dedicated fire check floors at 70m",
      "Independent third-party peer review by Premier Technical Institutes (IITs/NITs)"
]
  },
  {
    "id": "DOC-AUTH-DUAL-PLUMBING-OVERLAY",
    "title": "MoHUA & CPCB Dual Plumbing & Recycled Water Reuse Mandate",
    "shortTitle": "Dual Plumbing & Wastewater Reuse Code",
    "level": 4,
    "jurisdiction": {
      "country": "India"
    },
    "documentType": "special_overlay",
    "documentPriority": "primary",
    "year": "2021",
    "version": "MoHUA Model Bye-Laws Chapter 10 & CPCB Guidelines 2021",
    "status": "verified",
    "categories": [
      "special_restrictions",
      "environmental_clearances",
      "fire_life_safety",
      "setbacks"
    ],
    "source": {
      "authority": "MoHUA",
      "officialUrl": "https://mohua.gov.in",
      "documentUrl": "https://cpcb.nic.in/wastewater-reuse-guidelines",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Mandatory twin-pipe plumbing system, on-site sewage treatment plants, and zero liquid discharge reuse protocols for large residential and commercial complexes.",
    "keyProvisions": [
      "Mandatory dual piping (potable water line + reclaimed water line) for all developments > 5,000 sq.m BUA",
      "On-site tertiary sewage treatment plant (STP) with MBR / SBR technology",
      "Color-coded piping standards: Blue for Potable, Purple/Lilac for Recycled Treated Water",
      "Mandatory 100% reuse of treated wastewater for toilet flushing, landscape horticulture, and HVAC cooling towers"
]
  }
];

export const AUTHORITY_BYE_LAW_RULES: ByeLawRule[] = [
  {
    "id": "RULE-AUTH-DDA-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Delhi Development Authority (Delhi, Delhi (NCT))",
    "jurisdictionScope": {
      "country": "India",
      "state": "Delhi (NCT)",
      "city": "Delhi",
      "authority": "Delhi Development Authority"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "DDA Building Sanction, Completion Certification & Compoundable Limits",
    "clause": "DDA Building Bye-Laws Regulation 6 & 7",
    "sourceDoc": "DDA Building Sanction, Completion & Layout Scrutiny Guidelines",
    "sourceUrl": "https://dda.gov.in/building-sanction-procedures",
    "documentYear": "2020",
    "version": "DDA Sanction Manual 2020 (Amended 2023)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Governs statutory sanction procedures, layout scrutiny, compoundable deviations, and completion/occupancy certification across all DDA development areas.",
    "parameters": {
      "compoundableDeviations": "Max 5% within permissible coverage/FAR limits with penalty fee",
      "plinthInspection": "Mandatory notice to DDA within 7 days of reaching plinth level",
      "completionValidity": "Building permit valid for 5 years; revalidation up to 1 additional year",
      "sanctionTimeline": "Online sanction within 30 days of complete application"
},
    "detailedRequirements": [
      "Mandatory structural safety certificate signed by licensed structural engineer (Empanelled with DDA)",
      "Notice of commencement must be submitted prior to beginning excavation",
      "Deviation beyond compoundable 5% limit subjects structure to demolition or sealing order under DD Act Section 30/31",
      "Fire NOC from Delhi Fire Services mandatory prior to application for Occupancy Certificate for buildings >15m"
]
  },
  {
    "id": "RULE-AUTH-MCD-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Municipal Corporation of Delhi (Delhi, Delhi (NCT))",
    "jurisdictionScope": {
      "country": "India",
      "state": "Delhi (NCT)",
      "city": "Delhi",
      "authority": "Municipal Corporation of Delhi"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "MCD SARAL Fast-Track Deemed Sanction & OBPAS Scrutiny",
    "clause": "MCD Building Bye-Laws Chapter 2 & SARAL Operating Guidelines",
    "sourceDoc": "MCD Online Building Plan Approval System (OBPAS) & SARAL Scheme",
    "sourceUrl": "https://mcdonline.nic.in/eodb/",
    "documentYear": "2021",
    "version": "MCD OBPAS 2.0 (Amended 2023)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Fast-track risk-based automated building approval scheme for residential plots up to 500 sq.m across all 12 MCD administrative zones.",
    "parameters": {
      "saralPlotThreshold": "Up to 105 sq.m (Self-certification instant sanction)",
      "mediumRiskThreshold": "105 to 500 sq.m (15-day automated sanction)",
      "inspectionStages": "Plinth verification within 8 days; Final inspection within 15 days of completion notice",
      "treePlantingMandate": "1 tree per 100 sq.m plot area mandatory for CC/OC issuance"
},
    "detailedRequirements": [
      "Architect self-certification carries statutory liability under Section 347 of DMC Act 1957",
      "Rainwater harvesting structure verification mandatory for plots >= 100 sq.m before OC",
      "Structural stability and seismic certificate (Zone IV) by registered structural engineer mandatory",
      "No construction permitted beyond building sanction envelope without prior revised sanction"
]
  },
  {
    "id": "RULE-AUTH-NDMC-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "New Delhi Municipal Council & DUAC (Delhi, Delhi (NCT))",
    "jurisdictionScope": {
      "country": "India",
      "state": "Delhi (NCT)",
      "city": "Delhi",
      "authority": "New Delhi Municipal Council & DUAC"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "NDMC LBZ Density, Height Ceiling & DUAC Approval Mandate",
    "clause": "LBZ Boundary Regulations & NDMC Act Section 238",
    "sourceDoc": "NDMC Lutyens Bungalow Zone (LBZ) Guidelines & Heritage Regulations",
    "sourceUrl": "https://ndmc.gov.in/public_notices/lbz_guidelines.aspx",
    "documentYear": "2022",
    "version": "LBZ Guidelines (Sanctioned 2022)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Stringent heritage conservation and low-density development controls applicable strictly within the Lutyens Bungalow Zone boundary.",
    "parameters": {
      "maxHeight": "12.0 meters (Stilt + G + 1 max)",
      "maxGroundCoverage": "20% (Plots > 1 acre) to 25% (Plots <= 1 acre)",
      "farLimit": "FAR 0.30 (30) maximum",
      "heritageClearance": "Mandatory prior approval from DUAC & Heritage Conservation Committee (HCC)"
},
    "detailedRequirements": [
      "No multi-family flatted redevelopment permitted on single residential plots in LBZ",
      "Basement permitted only within building footprint for parking and household storage",
      "Existing mature tree canopy must be preserved in architectural layout",
      "Boundary walls limited to 1.5m solid wall + 0.6m open decorative grill"
]
  },
  {
    "id": "RULE-AUTH-MCGM-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Municipal Corporation of Greater Mumbai (MCGM / BMC) (Mumbai, Maharashtra)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Mumbai",
      "authority": "Municipal Corporation of Greater Mumbai (MCGM / BMC)"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "MCGM AutoDCR Architectural CAD Scrutiny & Concession Rules",
    "clause": "DCPR-2034 Regulation 4, 6 & MCGM Circular CHE/33719/DP",
    "sourceDoc": "MCGM AutoDCR Building Approval Manual & Scrutiny Circulars",
    "sourceUrl": "https://autodcr.mcgm.gov.in",
    "documentYear": "2021",
    "version": "MCGM AutoDCR 3.0 / DCPR-2034 Implementation Manual",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Detailed technical manual for automated architectural scrutiny, concession approvals, and scrutiny fee calculations under DCPR-2034.",
    "parameters": {
      "fungiblePremium": "50% of Ready Reckoner Rate for residential; 60% for commercial",
      "highRiseVettingThreshold": "Buildings > 70m require High Rise Committee (HRC) clearance",
      "fireSanctionTimeline": "30 days for CFO Fire NOC scrutiny",
      "iODValidity": "Intimation of Disapproval (IOD) valid for 1 year; CC issued upon compliance"
},
    "detailedRequirements": [
      "All CAD drawings must strictly adhere to MCGM AutoDCR color-coded layer standards",
      "Zero open space deficiencies permitted without explicit Municipal Commissioner concession under Regulation 6(b)",
      "Debris Management Plan approved by SWM Department mandatory before CC issuance",
      "Environmental Management Cell clearance required for all projects with BUA > 20,000 sq.m"
]
  },
  {
    "id": "RULE-AUTH-CIDCO-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "City and Industrial Development Corporation (CIDCO) (Navi Mumbai, Maharashtra)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Navi Mumbai",
      "authority": "City and Industrial Development Corporation (CIDCO)"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "CIDCO Leasehold Plot Development & NMIA Air Funnel Height Scrutiny",
    "clause": "CIDCO Development Controls & UDCPR 2020 Special Provisions",
    "sourceDoc": "CIDCO Navi Mumbai Development Control & Building Sanction Manual",
    "sourceUrl": "https://cidco.maharashtra.gov.in/town_planning_dcr",
    "documentYear": "2021",
    "version": "CIDCO DCR Manual (Aligned with UDCPR 2020)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Sanction procedures, leasehold plot development conditions, and node-specific infrastructure charges across Navi Mumbai planned nodes.",
    "parameters": {
      "leaseholdCompliance": "100% adherence to CIDCO lease agreement development milestones",
      "nmiaHeightZoning": "Strict adherence to NMIA Colour Coded Zoning Map (CCZM)",
      "crzBuffer": "50m to 100m CRZ buffer in coastal nodes",
      "sanctionTurnaround": "Online BPAMS approval within 30 days"
},
    "detailedRequirements": [
      "CIDCO Estate Department Tripartite Agreement clearance mandatory prior to CC",
      "Colour Coded Zoning Map (CCZM) NOC mandatory for all plots in NMIA influence zone",
      "Sewage Treatment Plant mandatory for residential schemes with >50 tenements",
      "Electric vehicle charging points in minimum 20% of parking spaces"
]
  },
  {
    "id": "RULE-AUTH-TMC-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Thane Municipal Corporation (Thane, Maharashtra)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Thane",
      "authority": "Thane Municipal Corporation"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "TMC Lake Eco-Buffer & Urban Renewal Cluster Redevelopment Norms",
    "clause": "UDCPR Chapter 14 & TMC Special Planning Regulations",
    "sourceDoc": "Thane Municipal Corporation (TMC) Building Permission Guidelines",
    "sourceUrl": "https://thanecity.gov.in/townplanning",
    "documentYear": "2021",
    "version": "TMC BPAMS / UDCPR Thane Guidelines 2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Governs town planning permissions, cluster redevelopment guidelines (URP), and lake buffer regulations across Thane municipal area.",
    "parameters": {
      "lakeBufferDistance": "30.0m no-construction green buffer from lake high-flood edge",
      "clusterMinPlotArea": "4,000 sq.m minimum for URP cluster redevelopment",
      "todFsiIncentive": "Up to 50% additional FSI within 500m of Metro stations",
      "treeReplacementRatio": "1:3 (3 new trees planted per 1 permitted cut tree)"
},
    "detailedRequirements": [
      "No basement or septic tank permitted within 30m of lake boundary lines",
      "Cluster redevelopment schemes require 51% consent of lawful occupants/tenants",
      "Dual piping system for recycled water mandatory for all projects with BUA > 5,000 sq.m",
      "Solar water heating compulsory for minimum 50% of residential top 3 floors"
]
  },
  {
    "id": "RULE-AUTH-PMC-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Pune Municipal Corporation (Pune, Maharashtra)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Pune",
      "authority": "Pune Municipal Corporation"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "PMC Blue/Red Flood Line & Hill-Top/Hill-Slope (HTHS) Protections",
    "clause": "UDCPR Regulation 3.1.3 & PMC Flood Mitigation Directives",
    "sourceDoc": "Pune Municipal Corporation (PMC) Building Sanction Manual",
    "sourceUrl": "https://pmc.gov.in/en/building-permission-department",
    "documentYear": "2021",
    "version": "PMC AutoDCR & UDCPR Implementation Framework",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building scrutiny procedures, Hill-top/Hill-slope (HTHS) protection rules, and Riverfront Development overlays in Pune municipal limits.",
    "parameters": {
      "blueFloodLine": "Prohibitive zone - Zero construction permitted between Blue Lines",
      "redFloodLine": "Restrictive zone - Plinth level must be 0.5m above Red Flood Line",
      "hthsSlopeThreshold": "No construction on hill slopes steeper than 1:5 gradient",
      "ecoHousingDiscount": "Up to 10% discount on development charges for GRIHA/IGBC 4-star ratings"
},
    "detailedRequirements": [
      "Hydrology NOC from Irrigation Department mandatory for plots within 500m of river edge",
      "No excavation or terrain flattening allowed in identified biodiversity corridors",
      "Organic waste composter (OWC) mandatory for all layouts generating >50 kg/day wet waste",
      "Fire check floor required at every 70m height in super-tall buildings"
]
  },
  {
    "id": "RULE-AUTH-PMRDA-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Pune Metropolitan Region Development Authority (Pune, Maharashtra)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Pune",
      "authority": "Pune Metropolitan Region Development Authority"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "PMRDA Peri-Urban Growth Corridor & Ring Road Influence Controls",
    "clause": "PMRDA Special Regulations & UDCPR Chapter 13",
    "sourceDoc": "PMRDA Metropolitan Region Development & Building Regulations",
    "sourceUrl": "https://pmrda.gov.in/town-planning/",
    "documentYear": "2021",
    "version": "PMRDA Building Permission Code (UDCPR Aligned)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Development regulations across Pune fringe peri-urban areas, Ring Road influence zone, and Special Township projects.",
    "parameters": {
      "specialTownshipMinArea": "40 Hectares (100 Acres) minimum contiguous land holding",
      "ringRoadBuffer": "30m building setback from Ring Road right-of-way",
      "infraCharges": "Additional 20% infrastructure development charge in peri-urban belts",
      "agriFarmHouseMaxBUA": "Max 150 sq.m BUA for farm buildings in agricultural zone"
},
    "detailedRequirements": [
      "Self-contained zero-discharge sewage treatment plant mandatory for all schemes outside PMC municipal sewer network",
      "Groundwater extraction NOC from CGWA mandatory prior to commencement",
      "Access road width minimum 12m for any multi-family residential development",
      "Solar street lighting mandatory in 100% of internal layout roads"
]
  },
  {
    "id": "RULE-AUTH-NMC-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Nagpur Municipal Corporation & NIT (Nagpur, Maharashtra)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Nagpur",
      "authority": "Nagpur Municipal Corporation & NIT"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "NMC Nagpur Metro TOD & River Corridor Environmental Protections",
    "clause": "UDCPR Nagpur Chapter & NMC Town Planning Directives",
    "sourceDoc": "Nagpur Municipal Corporation (NMC) Building Permission Manual",
    "sourceUrl": "https://nmcnagpur.gov.in/town-planning",
    "documentYear": "2021",
    "version": "NMC BPAMS UDCPR Code 2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Scrutiny regulations, heritage corridor rules, and Metro corridor TOD incentives across Nagpur city.",
    "parameters": {
      "metroTodFsi": "Up to 4.0 on roads >= 24m within 500m of Metro stations",
      "riverBuffer": "30m green buffer along Nag River and Pili River banks",
      "solarRooftop": "Mandatory solar rooftop PV for all plots > 300 sq.m",
      "sanctionTurnaround": "21 working days for standard residential proposals"
},
    "detailedRequirements": [
      "Nagpur Metro Rail Corporation Limited (Maha Metro) NOC mandatory within 50m of viaduct",
      "Heritage conservation guidelines apply in designated Civil Lines precinct",
      "Rainwater harvesting with recharge well compulsory for all new construction",
      "Fly-ash bricks usage mandatory for at least 50% of masonry work"
]
  },
  {
    "id": "RULE-AUTH-NASHIK-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Nashik Municipal Corporation (Nashik, Maharashtra)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Nashik",
      "authority": "Nashik Municipal Corporation"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "Nashik Godavari Flood Zone & Kumbh Pilgrimage Corridor Buffer Norms",
    "clause": "UDCPR Chapter 3 & Nashik Municipal Resolution 2021",
    "sourceDoc": "Nashik Municipal Corporation Building Sanction Code",
    "sourceUrl": "https://nashikcorporation.in/townplanning",
    "documentYear": "2021",
    "version": "Nashik BPAMS UDCPR 2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building permission norms, Godavari River flood buffer lines, and Agro-processing industrial zone guidelines in Nashik.",
    "parameters": {
      "godavariBlueLineBuffer": "Zero permanent construction in Blue Flood Line",
      "pilgrimageCorridorSetback": "Minimum 9m front setback on designated Kumbh Mela routes",
      "permissibleFsi": "Base FSI 1.10 to 1.50 with premium FSI options under UDCPR",
      "parkingNorms": "1 ECS per 100 sq.m residential carpet area"
},
    "detailedRequirements": [
      "Hydrological survey NOC required for plots within 300m of Godavari river",
      "STP compulsory for all residential complexes having > 20 flats",
      "Rainwater percolation pits mandatory in all side setbacks",
      "Structural safety audit mandatory every 5 years for buildings > 30 years old"
]
  },
  {
    "id": "RULE-AUTH-DTCP-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Department of Town & Country Planning Haryana (DTCP) (Gurugram, Haryana)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Haryana",
      "city": "Gurugram",
      "authority": "Department of Town & Country Planning Haryana (DTCP)"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "DTCP Stilt+4 Floor Norms, Structural Peer Review & Colony Sanctions",
    "clause": "Haryana Building Code 2017 Rules 4.1-4.8 & DTCP CLU Guidelines",
    "sourceDoc": "DTCP Haryana Building Code Sanction, CLU & Scrutiny Framework",
    "sourceUrl": "https://tcpharyana.gov.in/Policy/HBC2017_Amendments.pdf",
    "documentYear": "2021",
    "version": "DTCP Haryana Circulars 2021-2023 (Haryana Building Code 2017)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Comprehensive regulatory instructions governing Change of Land Use (CLU), licensed colony building plan approval, and group housing scrutiny in Haryana NCR.",
    "parameters": {
      "stiltParkingHeight": "2.4m minimum clear height up to 3.0m max under beam soffit",
      "maxBuildingHeight": "15.0m (with stilt) for individual residential plots",
      "cluValidity": "CLU letter of intent valid for 2 years for completing licensing formalities",
      "edcIdcClearance": "100% bank guarantee or milestone payment receipt required for building sanction"
},
    "detailedRequirements": [
      "Structural safety certificate and third-party peer review by IIT/NIT/PEC empanelled structural engineer mandatory for Stilt+4",
      "No encroachment into prescribed light and ventilation shafts or common boundary setbacks",
      "Dedicated dual plumbing line for treated sewage flushing mandatory for all group housing",
      "Fire safety approval from Haryana Fire Service mandatory before OC for buildings >15m"
]
  },
  {
    "id": "RULE-AUTH-GMDA-GGN-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Gurugram Metropolitan Development Authority (Gurugram, Haryana)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Haryana",
      "city": "Gurugram",
      "authority": "Gurugram Metropolitan Development Authority"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "GMDA Zero Peak Stormwater Runoff & Master Drainage Compliance",
    "clause": "GMDA Act Section 23 & Urban Drainage Code Chapter 5",
    "sourceDoc": "GMDA Urban Infrastructure & Water-Discharge Regulatory Guidelines",
    "sourceUrl": "https://gmda.gov.in/policies-guidelines",
    "documentYear": "2022",
    "version": "GMDA Infrastructure Guidelines (2022)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandatory stormwater discharge, zero-runoff groundwater recharge, and master infrastructure connection norms across GMDA notified area.",
    "parameters": {
      "rwhInjectionWell": "Minimum 1 injection well with desilting chamber per 500 sq.m plot area",
      "peakRunoffDetention": "On-site detention pond sized for 50mm/hr rainfall for 2 hours",
      "treatedEffluentQuality": "BOD < 10 mg/L, TSS < 10 mg/L for tertiary treated water reuse",
      "masterDrainSetback": "Minimum 12.0m no-construction green buffer from edge of GMDA master storm drain"
},
    "detailedRequirements": [
      "Direct unmetered connection to master sewer or drainage lines prohibited under penalty",
      "Bulk water connection granted only after verification of functional dual-plumbing system",
      "Basement waterproofing must withstand 100-year water table surge without structural pumping into surface drains",
      "Real-time continuous effluent monitoring sensor installation required for large commercial developments"
]
  },
  {
    "id": "RULE-AUTH-HSVP-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Haryana Shehri Vikas Pradhikaran (HSVP / FMDA) (Faridabad, Haryana)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Haryana",
      "city": "Faridabad",
      "authority": "Haryana Shehri Vikas Pradhikaran (HSVP / FMDA)"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "HSVP Sector Plot Zoning, Basement Protection & Verandah Controls",
    "clause": "HSVP Building Regulations Regulation 12 to 18",
    "sourceDoc": "HSVP (HUDA) Sectoral Plot Sanction & Architectural Control Manual",
    "sourceUrl": "https://hsvphry.org.in/building-regulations",
    "documentYear": "2021",
    "version": "HSVP Architectural Control Book 2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Standard architectural controls, zoning plans, basement permissions, and occupancy certification for HSVP developed sectors in Faridabad & Haryana.",
    "parameters": {
      "basementSetback": "Minimum 1.5m to 2.4m from rear/side boundary to protect adjoining foundations",
      "commercialVerandah": "Minimum 2.44m (8 feet) clear public arcade/verandah in SCO blocks",
      "boundaryWallMaxHeight": "Front 1.2m solid + 0.6m open grill; Side/Rear 1.8m solid wall",
      "plinthHeight": "Minimum 0.45m to maximum 1.2m above crown of road"
},
    "detailedRequirements": [
      "Basement construction requires prior structural indemnity bond and underpinning design to safeguard neighbors",
      "No opening or cantilever projection allowed beyond sanctioned zoning line",
      "Plinth level verification by HSVP Junior Engineer mandatory before casting ground floor slab",
      "Completion Certificate mandatory prior to applying for permanent water and power connections"
]
  },
  {
    "id": "RULE-AUTH-PANCHKULA-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Haryana Shehri Vikas Pradhikaran (HSVP Panchkula) (Panchkula, Haryana)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Haryana",
      "city": "Panchkula",
      "authority": "Haryana Shehri Vikas Pradhikaran (HSVP Panchkula)"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "Panchkula Mansa Devi Complex & Shivalik Hill Slope Building Controls",
    "clause": "HSVP Panchkula Special Zoning Regulations 2021",
    "sourceDoc": "HSVP Panchkula Architectural Control & Shivalik Foothill Guidelines",
    "sourceUrl": "https://hsvphry.org.in/panchkula-zoning",
    "documentYear": "2021",
    "version": "HSVP Panchkula Architectural Controls 2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Architectural controls, hill-slope contouring rules, and seismic design norms for Panchkula urban estate and MDC.",
    "parameters": {
      "mdcHeightLimit": "Max 12m height in Mansa Devi Complex influence zone",
      "retainingWallSlope": "Mandatory RCC retaining wall for cut slopes steeper than 30 degrees",
      "baseFar": "1.45 to 2.0 depending on plot size",
      "seismicCompliance": "IS 1893:2016 Zone IV mandatory compliance"
},
    "detailedRequirements": [
      "Geotechnical stability report required for all foothill sector constructions",
      "Standard red brick/stone cladding architectural palette on designated arterial facades",
      "Basement de-watering must not undermine adjacent hill slope stability",
      "Rainwater harvesting percolation well compulsory for every plot"
]
  },
  {
    "id": "RULE-AUTH-BBMP-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Bruhat Bengaluru Mahanagara Palike (Bengaluru, Karnataka)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Karnataka",
      "city": "Bengaluru",
      "authority": "Bruhat Bengaluru Mahanagara Palike"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "BBMP Suvarna Paravanage & Rajakaluve / Lake Buffer Clearances",
    "clause": "BBMP Building Bye-Laws 2003 Bye-Law 3.2 & NGT O.A. 222/2014 Compliance",
    "sourceDoc": "BBMP Suvarna Paravanage & Automated Building Scrutiny Manual",
    "sourceUrl": "https://bbmp.gov.in/building-sanction/",
    "documentYear": "2021",
    "version": "Suvarna Paravanage 2.0 Scrutiny Manual",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Automated online building plan approval framework, Rajakaluve buffer scrutiny, and lake protection zoning in Bengaluru.",
    "parameters": {
      "suvarnaEligibility": "Plots <= 4,000 sq.ft (371.6 sq.m) with up to 4 units (G+3 max)",
      "lakeBufferZone": "30.0m strict green buffer from lake boundary / water spread",
      "primaryDrainBuffer": "50.0m buffer along primary stormwater drain (Rajakaluve)",
      "secondaryDrainBuffer": "25.0m buffer along secondary stormwater drain"
},
    "detailedRequirements": [
      "Village map (Tippani/Akarband) superimposition mandatory to verify absence of any Rajakaluve encroachment",
      "Zero foundation or compound wall construction permitted within designated SWD or lake buffer zones",
      "BWSSB dual water pipeline NOC mandatory for residential developments with >= 20 apartments",
      "Occupancy Certificate from BBMP mandatory before commercial electricity tariff conversion or resale registration"
]
  },
  {
    "id": "RULE-AUTH-BDA-BLR-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Bangalore Development Authority (Bengaluru, Karnataka)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Karnataka",
      "city": "Bengaluru",
      "authority": "Bangalore Development Authority"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "BDA Layout Open Space Relinquishment, CA Sites & TDR Rules",
    "clause": "BDA Act Section 32 & KTCP Act Section 17",
    "sourceDoc": "BDA Layout Sanction & Group Housing Comprehensive Scrutiny Rules",
    "sourceUrl": "https://bdabangalore.org/planning-guidelines",
    "documentYear": "2020",
    "version": "BDA Layout & Group Housing Code 2020",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Governs statutory layout approvals, CA site relinquishment, arterial road widening setbacks, and Master Plan zoning compliance across Bangalore Metropolitan Area.",
    "parameters": {
      "parkOpenSpaceRelinquish": "15% of total layout land area to be relinquished free of cost",
      "caSiteRelinquish": "10% of total layout land area for Civic Amenities",
      "roadWideningTdr": "TDR credit issued at 1.5x of surrendered land area",
      "masterPlanSetback": "Setback calculated from proposed widened road line under RMP"
},
    "detailedRequirements": [
      "Relinquishment deed must be executed and registered with BDA prior to issue of work order",
      "Underground utility ducts for power, water, gas, and telecom mandatory in all internal layout roads",
      "Affordable housing reservation (15% of units or 10% FAR) mandatory in group housing > 1 acre",
      "Clearance from BDA Town Planning Member required for any land-use interpretation"
]
  },
  {
    "id": "RULE-AUTH-CMDA-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Chennai Metropolitan Development Authority (CMDA / GCC) (Chennai, Tamil Nadu)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Tamil Nadu",
      "city": "Chennai",
      "authority": "Chennai Metropolitan Development Authority (CMDA / GCC)"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "CMDA Single Window Scrutiny, MSB Panel Review & OSR Surrender",
    "clause": "TNCDBR 2019 Rules 35, 41 & CMDA SWS Operations Manual",
    "sourceDoc": "CMDA Single Window Planning Permission Manual & Scrutiny Code",
    "sourceUrl": "https://cmdachennai.gov.in/PlanningPermission.html",
    "documentYear": "2022",
    "version": "CMDA Single Window System (SWS) Manual 2022",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Complete procedure for Non-MSB (Ordinary), High-Rise (MSB), and layout planning permissions across Chennai Metropolitan Area under TNCDBR 2019.",
    "parameters": {
      "osrThreshold": "10% of plot area for land extent > 3,000 sq.m (surrender or cash equivalent)",
      "msbHeightThreshold": "Buildings > 18.30m height require MSB Technical Committee scrutiny",
      "swsTurnaround": "30 days for Non-MSB; 45 days for MSB comprehensive sanction",
      "infrastructureCharges": "Prescribed per sq.m fee under TNCDBR Rule 41"
},
    "detailedRequirements": [
      "Gift Deed for OSR land and road widening strips must be registered before issue of Planning Permit",
      "Structural Design Certificate by registered class-1 structural engineer with peer scrutiny for MSB",
      "Chennai Metro Rail Limited (CMRL) NOC mandatory for developments within 50m of Metro corridor",
      "Compliance certificate from Fire & Rescue Services mandatory before Occupancy Certificate"
]
  },
  {
    "id": "RULE-AUTH-COIMBATORE-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Coimbatore City Municipal Corporation & DTCP Coimbatore (Coimbatore, Tamil Nadu)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Tamil Nadu",
      "city": "Coimbatore",
      "authority": "Coimbatore City Municipal Corporation & DTCP Coimbatore"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "CCMC Noyyal River Buffer & Textile Industrial Layout Sanctions",
    "clause": "TNCDBR 2019 Rules & CCMC Special Water Body Directives",
    "sourceDoc": "Coimbatore City Municipal Corporation Planning Permission Code",
    "sourceUrl": "https://ccmc.gov.in/townplanning",
    "documentYear": "2021",
    "version": "CCMC Town Planning Code (TNCDBR 2019 Aligned)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building sanction rules, industrial-textile corridor setbacks, and Noyyal River catchment protection overlays in Coimbatore.",
    "parameters": {
      "noyyalBuffer": "15m to 30m no-construction green strip along Noyyal river and feeder tanks",
      "maxFar": "1.50 to 2.00 base FAR with premium FAR up to 50%",
      "industrialSetback": "Minimum 7m all around for red/orange category industrial sheds",
      "sanctionTurnaround": "30 days via Tamil Nadu Single Window Portal"
},
    "detailedRequirements": [
      "TNPCB consent to establish required prior to building sanction for industrial units",
      "Zero liquid discharge (ZLD) effluent treatment plant layout approval mandatory for textile units",
      "Solar water heating mandatory for all lodging houses, hospitals, and hostels",
      "Building stability certificate every 5 years for industrial factory buildings"
]
  },
  {
    "id": "RULE-AUTH-MADURAI-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Madurai Corporation & DTCP Madurai (Madurai, Tamil Nadu)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Tamil Nadu",
      "city": "Madurai",
      "authority": "Madurai Corporation & DTCP Madurai"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "Madurai Meenakshi Temple Heritage Height Ceiling & Vaigai Buffer",
    "clause": "Madurai Heritage Conservation Rules & TNCDBR 2019",
    "sourceDoc": "Madurai Municipal Corporation Heritage Precinct & Sanction Manual",
    "sourceUrl": "https://maduraicorporation.co.in/townplanning",
    "documentYear": "2021",
    "version": "Madurai Heritage & Sanction Code 2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building approvals, Meenakshi Temple heritage height ceiling, and Vaigai River flood zone regulations in Madurai.",
    "parameters": {
      "templeZoneHeight": "Max 9.0m within 500m of temple; max 12.0m within 1km radius",
      "vaigaiRiverBuffer": "30m no-construction green belt from Vaigai River banks",
      "residentialFar": "1.50 base FAR with premium FSI options",
      "swsTimeline": "30 days for residential planning permits"
},
    "detailedRequirements": [
      "Heritage Conservation Committee clearance mandatory within 1km of Meenakshi Temple",
      "No glass-facade or reflective cladding permitted in temple precinct",
      "Underground drainage connection mandatory before issue of Occupancy Certificate",
      "Rainwater harvesting sump compulsory for all plot sizes"
]
  },
  {
    "id": "RULE-AUTH-GHMC-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Greater Hyderabad Municipal Corporation (Hyderabad, Telangana)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Telangana",
      "city": "Hyderabad",
      "authority": "Greater Hyderabad Municipal Corporation"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "GHMC TS-bPASS Fast-Track Approval & 10% Mortgage Condition",
    "clause": "TS-bPASS Act 2020 Sections 5, 6 & G.O.Ms.No. 168 (MA&UD)",
    "sourceDoc": "GHMC TS-bPASS Building Approval & Self-Certification Guidelines",
    "sourceUrl": "https://tsbpass.telangana.gov.in/UserManual.aspx",
    "documentYear": "2021",
    "version": "TS-bPASS Operational Guidelines 2021 (Amended 2023)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Online statutory building permission system across Hyderabad, implementing instant registrations, self-certifications, and single-window committee approvals.",
    "parameters": {
      "instantSanctionPlot": "Up to 500 sq.m and height <= 10.0m (Instant deemed approval)",
      "singleWindowTurnaround": "Strict 21 days deemed approval for high-rise/commercial",
      "ghmcMortgageRatio": "10% of total built-up area in upper floors mortgaged to GHMC",
      "postVerificationTimeline": "Post-verification site audit by GHMC task force within 15 days"
},
    "detailedRequirements": [
      "False self-certification under TS-bPASS leads to instant revocation, 3x penalty, and blacklisting of professional",
      "Mortgage deed must be registered with Sub-Registrar before commencement of construction",
      "Mortgage is released only upon post-construction inspection and grant of Occupancy Certificate",
      "Rainwater harvesting recharge pit mandatory; deposit collected and refunded post-verification"
]
  },
  {
    "id": "RULE-AUTH-HMDA-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Hyderabad Metropolitan Development Authority (Hyderabad, Telangana)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Telangana",
      "city": "Hyderabad",
      "authority": "Hyderabad Metropolitan Development Authority"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "HMDA ORR Growth Corridor & High-Rise Wind Aerodynamic Norms",
    "clause": "HMDA Zoning Regulations Regulation 8 & G.O.Ms.No. 168",
    "sourceDoc": "HMDA Layout & High-Rise Building Scrutiny Regulations",
    "sourceUrl": "https://www.hmda.org.in/building-regulations/",
    "documentYear": "2021",
    "version": "HMDA Development Regulations & TS-bPASS Integration",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Governs gated communities, multi-storeyed complexes, Outer Ring Road (ORR) Special Development Zone, and layout scrutinies across HMDA area.",
    "parameters": {
      "orrGrowthCorridorWidth": "1.0 km on either side of Outer Ring Road (Special High Density Zone)",
      "lakeFtlBuffer": "30.0m buffer from Full Tank Level (FTL) for lakes >= 10 hectares",
      "windTunnelThreshold": "Wind tunnel testing mandatory for buildings > 50m height",
      "highRiseFrontSetback": "Minimum 12.0m to 16.0m front setback depending on road width"
},
    "detailedRequirements": [
      "Full Tank Level (FTL) boundary certificate from Irrigation Department mandatory for plots near water bodies",
      "No construction of basement permitted within 30m of lake boundary",
      "Mandatory 10% open space relinquishment in all plotted layout permissions",
      "Fire NOC from Telangana Disaster Response & Fire Services mandatory before OC"
]
  },
  {
    "id": "RULE-AUTH-KMC-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Kolkata Municipal Corporation (Kolkata, West Bengal)",
    "jurisdictionScope": {
      "country": "India",
      "state": "West Bengal",
      "city": "Kolkata",
      "authority": "Kolkata Municipal Corporation"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "KMC Narrow Street Height Ratios & Heritage Graded Controls",
    "clause": "KMC Building Rules 2009 Rule 26, 28 & Chapter IV",
    "sourceDoc": "KMC Building Plan Sanction Manual & Heritage Conservation Rules",
    "sourceUrl": "https://www.kmcgov.in/KMCPortal/jsp/BuildingDepartment.jsp",
    "documentYear": "2020",
    "version": "KMC Building Rules 2009 (Amended to 2023)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building sanctions, heritage building grade regulations (Grade I, IIA, IIB, III), narrow lane height controls, and occupancy certificates in Kolkata.",
    "parameters": {
      "streetWidthHeightCap": "Street < 3.5m: G+1 max (7.0m); Street 3.5-7.0m: G+2/3 max (11.0m to 12.5m)",
      "heritageGrade1Restriction": "Zero structural modification, demolition, or external alteration permitted",
      "structuralPeerReview": "Mandatory for buildings with height > 15.5m or commercial > 500 sq.m",
      "sanctionValidity": "Sanction valid for 5 years; revalidation up to 3 years"
},
    "detailedRequirements": [
      "Soil investigation report signed by empanelled Geo-Technical Engineer mandatory for all multi-storeyed proposals",
      "Heritage Conservation Committee clearance mandatory prior to submitting drawings for adjacent plots within 15m of Grade I structure",
      "Waterbody filling strictly prohibited under West Bengal Inland Fisheries Act Section 17A",
      "Notice of Completion of Plinth Level mandatory prior to casting higher floor slabs"
]
  },
  {
    "id": "RULE-AUTH-AMC-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Ahmedabad Municipal Corporation & AUDA (Ahmedabad, Gujarat)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Gujarat",
      "city": "Ahmedabad",
      "authority": "Ahmedabad Municipal Corporation & AUDA"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "AMC UNESCO Walled City Conservation & Sabarmati Riverfront Norms",
    "clause": "CGDCR 2017 Chapter 16 & AMC Special Heritage Bye-Laws",
    "sourceDoc": "AMC Automated Building Scrutiny Manual & Heritage Precinct Code",
    "sourceUrl": "https://ahmedabadcity.gov.in/portal/jsp/eServices/TownPlanning.jsp",
    "documentYear": "2021",
    "version": "AMC AutoDCR Scrutiny Code (CGDCR 2017 Implementation)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Governs automated architectural scrutiny, UNESCO World Heritage Walled City development controls, and Sabarmati Riverfront special overlays.",
    "parameters": {
      "walledCityHeightLimit": "Max 10.0m to 12.0m in heritage pols (preserving historic street skyline)",
      "srfdclSpecialFar": "FAR up to 4.50 allowed on designated Sabarmati Riverfront parcels",
      "traditionalFacade": "Mandatory retention/restoration of traditional wood-carved otlas and facades in Core Zone",
      "autodcrScrutinyTurnaround": "15 days for compliant residential plans"
},
    "detailedRequirements": [
      "Heritage Cell NOC mandatory for any repair, renovation, or rebuilding within UNESCO World Heritage boundary",
      "No high-rise structure (> 16.5m) permitted in Core Heritage Precinct",
      "Structural safety compliance for Seismic Zone III mandatory with proof checking by SVNIT/LDCE",
      "BU (Building Use) permission mandatory before occupancy or utility connection"
]
  },
  {
    "id": "RULE-AUTH-SMC-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Surat Municipal Corporation & SUDA (Surat, Gujarat)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Gujarat",
      "city": "Surat",
      "authority": "Surat Municipal Corporation & SUDA"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "Surat Tapi River Flood Contour Buffer & Textile Multi-Level Fire Norms",
    "clause": "CGDCR 2017 Surat Schedule & SMC Municipal Directives",
    "sourceDoc": "Surat Municipal Corporation Building Permission & Textile Zone Manual",
    "sourceUrl": "https://suratmunicipal.gov.in/Departments/TownPlanning",
    "documentYear": "2021",
    "version": "SMC AutoDCR / CGDCR 2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building permissions, Tapi River flood protection overlays, and Diamond/Textile park fire safety regulations in Surat.",
    "parameters": {
      "tapiFloodBuffer": "Minimum 30m buffer from Tapi river edge / flood embankment",
      "commercialParkingRatio": "1 ECS per 50 sq.m built-up area for commercial/textile complexes",
      "fireSafetySprinkler": "Mandatory automatic sprinkler systems in all commercial textile markets",
      "baseFar": "1.20 to 1.80 base FAR with paid premium FSI up to 4.0 in high-density corridors"
},
    "detailedRequirements": [
      "Plinth height must be at least 0.6m above nearest road crown and Tapi 2006 flood level benchmark",
      "Fire NOC renewal mandatory every year for commercial and industrial structures",
      "Dedicated solid waste chute and compactor room mandatory in multi-storeyed commercial centers",
      "Building Use (BU) certificate compulsory prior to commencing business operations"
]
  },
  {
    "id": "RULE-AUTH-VMC-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Vadodara Municipal Corporation & VUDA (Vadodara, Gujarat)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Gujarat",
      "city": "Vadodara",
      "authority": "Vadodara Municipal Corporation & VUDA"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "Vadodara Vishwamitri River Buffer & Heritage Palace Precinct Controls",
    "clause": "CGDCR 2017 Vadodara Zone & VMC Special Regulations",
    "sourceDoc": "Vadodara Municipal Corporation Building Sanction Code",
    "sourceUrl": "https://vmc.gov.in/townplanning.aspx",
    "documentYear": "2021",
    "version": "VMC AutoDCR CGDCR Code 2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building scrutiny regulations, Vishwamitri River ecological corridor buffer, and chemical belt safety setbacks in Vadodara.",
    "parameters": {
      "vishwamitriBuffer": "30m strict no-development green corridor along Vishwamitri river banks",
      "palacePrecinctHeight": "Max 15.0m height within 500m of Laxmi Vilas Palace compound",
      "permissibleFar": "1.2 to 2.7 depending on road width",
      "sanctionTurnaround": "21 working days"
},
    "detailedRequirements": [
      "Environmental clearance required for any construction along Vishwamitri flood plains",
      "Groundwater recharge pit mandatory for all plots > 150 sq.m",
      "Structural safety compliance for Seismic Zone III certified by registered engineer",
      "Building Use (BU) permission mandatory before energizing electrical meters"
]
  },
  {
    "id": "RULE-AUTH-RUDA-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Rajkot Urban Development Authority & RMC (Rajkot, Gujarat)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Gujarat",
      "city": "Rajkot",
      "authority": "Rajkot Urban Development Authority & RMC"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "RUDA Aji/Nyari Reservoir Catchment Protections & Ring Road TOD Norms",
    "clause": "CGDCR 2017 Rajkot Chapter & RUDA Directives",
    "sourceDoc": "Rajkot Urban Development Authority Sanction Guidelines",
    "sourceUrl": "https://rajkotuda.com/townplanning",
    "documentYear": "2021",
    "version": "RUDA Building Sanction Code 2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building permission norms, Aji and Nyari lake catchment protection, and engineering industrial layout guidelines in Rajkot.",
    "parameters": {
      "reservoirBuffer": "50m no-construction zone around Aji & Nyari reservoir high flood levels",
      "ringRoadFar": "Up to 3.0 FAR on 36m+ Ring Roads",
      "industrialShedCoverage": "Max 60% ground coverage with 6m side setbacks",
      "sanctionTimeline": "20 days for online approval"
},
    "detailedRequirements": [
      "Zero untreated effluent discharge into public water bodies",
      "Mandatory dual plumbing system for commercial complexes > 2,000 sq.m",
      "Fire NOC mandatory for industrial warehouses and commercial structures",
      "Solar power generation system mandatory for roof area > 200 sq.m"
]
  },
  {
    "id": "RULE-AUTH-JDA-JAI-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Jaipur Development Authority (Jaipur, Rajasthan)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Rajasthan",
      "city": "Jaipur",
      "authority": "Jaipur Development Authority"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "JDA Pink City Heritage Facade Uniformity & Setback Schedules",
    "clause": "Rajasthan Urban Building Bye-Laws 2020 Chapter 4 & JDA Walled City Norms",
    "sourceDoc": "Jaipur Development Authority (JDA) Building Sanction Manual",
    "sourceUrl": "https://jda.urban.rajasthan.gov.in/content/raj/udh/jda---jaipur/en/rules/building-regulations.html",
    "documentYear": "2020",
    "version": "JDA Building Regulations 2020 (Amended 2023)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building permissions, Walled Pink City heritage regulations, standard setbacks, and height controls across Jaipur Metropolitan Region.",
    "parameters": {
      "pinkCityHeightCap": "12.0m maximum building height in Walled City Heritage Precinct",
      "pinkCityFacadeControl": "Mandatory red-ochre (Jaipur Pink) lime plaster facade + Jharokha motifs",
      "residentialBaseFar": "Base FAR 1.20 to 2.25 depending on plot size and road width (12m to 30m+)",
      "bettermentLevy": "Betterment charges payable on purchasable FAR"
},
    "detailedRequirements": [
      "Heritage Cell approval mandatory for any reconstruction or structural modification in the Walled City",
      "No projection of balconies over public streets narrower than 9 meters",
      "Rainwater harvesting structure mandatory for all plots > 225 sq.m before occupancy",
      "Structural safety audit and soil test certificate mandatory for all buildings above 15m height"
]
  },
  {
    "id": "RULE-AUTH-NOIDA-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "New Okhla Industrial Development Authority (Noida, Uttar Pradesh)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Noida",
      "authority": "New Okhla Industrial Development Authority"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "NOIDA Group Housing FAR, Purchasable FSI & ESZ Restrictions",
    "clause": "NOIDA Building Regulations 2010 Clauses 4.1, 7.1 & 24",
    "sourceDoc": "NOIDA Authority Building Regulations & Automated Scrutiny Manual",
    "sourceUrl": "https://noidaauthorityonline.in/en/building-regulations",
    "documentYear": "2020",
    "version": "NOIDA Building Regulations 2010 (Amended to 2023)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Governs group housing, commercial complexes, IT parks, and industrial plot building sanctions, completion certificates, and compoundable limits in Noida.",
    "parameters": {
      "groupHousingMaxFar": "Base 2.75; Purchasable up to 3.50 on roads >= 24m",
      "okhlaEszBuffer": "Special construction conditions within 100m to 1km of Okhla Bird Sanctuary",
      "compoundableLimit": "Maximum 5% within permissible coverage/FAR with penalty charges",
      "completionValidity": "Building permit valid for 5 years; phased completion certificates allowed"
},
    "detailedRequirements": [
      "Third-party structural safety audit from IIT Delhi / CBRI Roorkee mandatory for high-rise buildings > 45m",
      "No ground coverage or structural encroachment permitted in mandatory 15% recreational green",
      "STP of capacity 1.2x estimated peak wastewater generation mandatory for all group housing",
      "Dual water supply line for toilet flushing and landscape irrigation compulsory before CC"
]
  },
  {
    "id": "RULE-AUTH-GNIDA-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Greater Noida Industrial Development Authority (Greater Noida, Uttar Pradesh)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Greater Noida",
      "authority": "Greater Noida Industrial Development Authority"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "GNIDA Knowledge Park & High-Rise Group Housing Sanction Norms",
    "clause": "GNIDA Building Regulations Chapter 4 & 5",
    "sourceDoc": "Greater Noida Authority (GNIDA) Building Sanction & Scrutiny Code",
    "sourceUrl": "https://greaternoidaauthority.in/building-cell",
    "documentYear": "2021",
    "version": "GNIDA Building Regulations (Amended 2021)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building sanctions, institutional mega-projects, industrial parks, and high-rise group housing parameters in Greater Noida.",
    "parameters": {
      "knowledgeParkFar": "FAR 2.0 to 3.0 for educational and research campuses",
      "groupHousingGroundCoverage": "Maximum 30% to 35% to ensure large central green spaces",
      "highRiseFrontSetback": "Minimum 15.0m on roads >= 30m width",
      "completionTurnaround": "30 days post physical inspection"
},
    "detailedRequirements": [
      "Structural proof-check certificate from government engineering institution mandatory for towers > 15 floors",
      "Mandatory functional solar photovoltaic rooftop system of minimum 5% connected load",
      "Automated continuous ambient air quality and noise monitoring during construction phase",
      "Zero treated wastewater discharge into stormwater drains"
]
  },
  {
    "id": "RULE-AUTH-YEIDA-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Yamuna Expressway Industrial Development Authority (YEIDA (Yamuna Expressway), Uttar Pradesh)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "YEIDA (Yamuna Expressway)",
      "authority": "Yamuna Expressway Industrial Development Authority"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "YEIDA Jewar Airport OLS Height Limits & Expressway Buffer Norms",
    "clause": "YEIDA Building Regulations Chapter 3 & Aviation Overlay",
    "sourceDoc": "YEIDA Yamuna Expressway Industrial Development Building Code",
    "sourceUrl": "https://yamunaexpresswayauthority.com/building-regulations",
    "documentYear": "2021",
    "version": "YEIDA Building Regulations 2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building norms, Noida International Airport (Jewar) aviation height envelope, and Electronic City/Logistics hub development regulations along Yamuna Expressway.",
    "parameters": {
      "jewarAirportHeightCap": "Strict OLS CCZM compliance based on distance from runway coordinates",
      "expresswayGreenBuffer": "100.0m mandatory green buffer along Yamuna Expressway main carriage",
      "dataCenterFar": "FAR up to 3.0 with higher power/cooling footprint allowances",
      "industrialGroundCoverage": "Max 55% to 60% with 9m clear fire-tender driveway"
},
    "detailedRequirements": [
      "AAI Jewar Airport NOC mandatory for all structures exceeding permissible OLS envelope",
      "No vehicular access permitted directly onto Yamuna Expressway; service road access mandatory",
      "100% on-site sewage and industrial effluent treatment with zero liquid discharge (ZLD)",
      "Solar rooftop installation mandatory for 100% of roof area in industrial sheds"
]
  },
  {
    "id": "RULE-AUTH-LDA-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Lucknow Development Authority (Lucknow, Uttar Pradesh)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Lucknow",
      "authority": "Lucknow Development Authority"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "LDA Gomti Riverfront Buffer & Heritage Zone Architectural Controls",
    "clause": "UP Model Building Bye-Laws 2021 & LDA Special Regulations",
    "sourceDoc": "Lucknow Development Authority (LDA) Building Sanction Manual",
    "sourceUrl": "https://onlineuplda.com/building-sanction",
    "documentYear": "2021",
    "version": "LDA Building Bye-Laws (UP Model Bye-Laws 2021 Implementation)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Governs town planning permissions, Gomti Riverfront buffer regulations, and Heritage Zone scrutiny across Lucknow.",
    "parameters": {
      "gomtiRiverBuffer": "50.0m strict no-construction green strip from Gomti river embankment",
      "heritageZoneHeight": "Max 12.0m height in notified historic precincts",
      "residentialBaseFar": "1.50 to 2.50 depending on road width",
      "obpasTurnaround": "30 days for complete sanction"
},
    "detailedRequirements": [
      "Heritage Conservation Cell clearance mandatory for structures within 300m of Centrally Protected Monuments",
      "Mandatory soil bearing capacity test for multi-storeyed structures in Gomti alluvial basin",
      "Dual plumbing system mandatory for all group housing > 2,000 sq.m",
      "Fire safety approval from UP Fire Service mandatory before OC for buildings > 15m"
]
  },
  {
    "id": "RULE-AUTH-KDA-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Kanpur Development Authority (Kanpur, Uttar Pradesh)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Kanpur",
      "authority": "Kanpur Development Authority"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "KDA Ganga River Pollution Buffer & Industrial Effluent Controls",
    "clause": "UP Model Bye-Laws 2021 & KDA Ganga Basin Directives",
    "sourceDoc": "Kanpur Development Authority Building Permission Manual",
    "sourceUrl": "https://kdakanpur.up.gov.in/townplanning",
    "documentYear": "2021",
    "version": "KDA Building Code 2021 (UP Bye-Laws Aligned)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building sanctions, Ganga River pollution buffer controls, and leather/textile industrial zone regulations in Kanpur.",
    "parameters": {
      "gangaBuffer": "100m strict no-construction buffer from highest flood line of Ganga",
      "industrialCoverage": "Max 50% ground coverage with 9m internal fire pathways",
      "baseFar": "1.50 to 2.25 based on road width",
      "obpasTimeline": "25 working days"
},
    "detailedRequirements": [
      "NMCG (National Mission for Clean Ganga) clearance for any development near river basin",
      "Zero direct sewage discharge into storm drains; connection to trunk sewer mandatory",
      "Rainwater harvesting with filtration system compulsory for plots > 150 sq.m",
      "Structural safety certificate for Seismic Zone IV certified by registered structural engineer"
]
  },
  {
    "id": "RULE-AUTH-VDA-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Varanasi Development Authority (Varanasi, Uttar Pradesh)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Varanasi",
      "authority": "Varanasi Development Authority"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "VDA Ganga Ghat 200m Prohibited Buffer & Kashi Heritage Controls",
    "clause": "VDA Special Heritage Bye-Laws & UP Model Building Code 2021",
    "sourceDoc": "Varanasi Development Authority Heritage & Sanction Code",
    "sourceUrl": "https://vdavns.up.gov.in/townplanning",
    "documentYear": "2021",
    "version": "VDA Heritage & Building Bye-Laws 2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building approvals, Ganga Ghat 200m prohibited buffer, and Kashi Vishwanath Dham heritage precinct architectural controls.",
    "parameters": {
      "gangaGhatProhibitedBuffer": "200m from Ganga Ghat edge - Zero new construction permitted",
      "heritagePrecinctHeight": "Max 9.0m to 12.0m in old temple city precinct",
      "narrowAlleyCap": "Height limited to 1.5x street width for lanes < 6m",
      "swsTimeline": "30 days for sanction"
},
    "detailedRequirements": [
      "High Court & NGT compliance certificate required for any repair in 200m Ghat zone",
      "Heritage Conservation Committee approval mandatory in designated heritage wards",
      "Mandatory connection to municipal sewer line with anti-backflow valve",
      "Structural stability certificate for all multi-storeyed buildings"
]
  },
  {
    "id": "RULE-AUTH-ADA-AGRA-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Agra Development Authority & TTZ Authority (Agra, Uttar Pradesh)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Agra",
      "authority": "Agra Development Authority & TTZ Authority"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "ADA Taj Trapezium Zone (TTZ) Environmental Restrictions & Height Caps",
    "clause": "Supreme Court TTZ Directives & ADA Special Regulations",
    "sourceDoc": "Agra Development Authority Taj Trapezium Zone (TTZ) Sanction Code",
    "sourceUrl": "https://adaagra.up.gov.in/townplanning",
    "documentYear": "2021",
    "version": "ADA Building Bye-Laws & TTZ Guidelines 2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building sanctions, Supreme Court Taj Trapezium Zone (TTZ) environmental controls, and Taj Mahal visual corridor height restrictions.",
    "parameters": {
      "tajMahalVisualBuffer": "Strict height restriction (max 9m to 12m) within 1.5 km of Taj Mahal",
      "ttzFuelMandate": "100% PNG/electricity mandate for all commercial and industrial kitchens/boilers",
      "asiRegulatedZone": "300m regulated area requires National Monuments Authority (NMA) NOC",
      "baseFar": "1.50 with restricted purchasable FAR in TTZ"
},
    "detailedRequirements": [
      "TTZ Authority clearance mandatory for commercial and industrial projects",
      "Zero tree felling without prior permission from Supreme Court / Central Empowered Committee (CEC)",
      "DG sets prohibited except with ultra-low emission scrubbers and PNG conversion",
      "Mandatory dual plumbing and rainwater recharge systems"
]
  },
  {
    "id": "RULE-AUTH-GDA-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Ghaziabad Development Authority (Ghaziabad, Uttar Pradesh)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Ghaziabad",
      "authority": "Ghaziabad Development Authority"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "GDA RRTS Corridor TOD High-Density Norms & Hindon Eco-Buffer",
    "clause": "UP TOD Policy 2021 & GDA Building Regulations",
    "sourceDoc": "Ghaziabad Development Authority (GDA) Building Sanction Manual",
    "sourceUrl": "https://gdaghaziabad.up.gov.in/townplanning",
    "documentYear": "2021",
    "version": "GDA Building Code 2021 (UP-OBPAS)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building approvals, Hindon River eco-buffer, and Delhi-Meerut RRTS Transit-Oriented Development (TOD) corridor rules in Ghaziabad.",
    "parameters": {
      "rrtsTodFar": "FAR up to 4.0 within 1.5 km of Delhi-Meerut RRTS stations on roads >= 24m",
      "hindonFloodBuffer": "50m green buffer along Hindon River banks",
      "groupHousingCoverage": "Max 35% with 15% mandatory recreational green",
      "sanctionTurnaround": "25 working days via UP-OBPAS"
},
    "detailedRequirements": [
      "National Capital Region Transport Corporation (NCRTC) NOC required within 100m of RRTS viaduct",
      "STP with 100% treated water recycling mandatory for projects > 10,000 sq.m",
      "Structural safety audit certificate for Seismic Zone IV",
      "Fire NOC mandatory prior to occupancy for buildings > 15m"
]
  },
  {
    "id": "RULE-AUTH-GMADA-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Greater Mohali Area Development Authority (Mohali (SAS Nagar), Punjab)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Punjab",
      "city": "Mohali (SAS Nagar)",
      "authority": "Greater Mohali Area Development Authority"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "GMADA Chandigarh Periphery Controls & Aero City Height Clearances",
    "clause": "Punjab Building Rules 2021 & GMADA Special Sector Zoning",
    "sourceDoc": "GMADA SAS Nagar (Mohali) Building Sanction & Architectural Controls",
    "sourceUrl": "https://gmada.gov.in/building-rules",
    "documentYear": "2021",
    "version": "GMADA Architectural Control Book 2021 (PBR-2021 Aligned)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building permissions, Chandigarh periphery controlled area restrictions, and IT City Mohali development standards.",
    "parameters": {
      "peripheryControlBuffer": "Zero unauthorized construction in notified Periphery Controlled Belt",
      "airportHeightZoning": "Strict adherence to IXC Airport CCZM height contours",
      "itCityFar": "FAR up to 3.0 for IT/ITeS campuses on roads >= 30m",
      "eNakshaTimeline": "21 working days for standard sanction"
},
    "detailedRequirements": [
      "AAI / Air Force Station Chandigarh NOC mandatory for structures exceeding CCZM height",
      "Structural safety certificate for Seismic Zone IV certified by empanelled structural engineer",
      "Rainwater harvesting injection pit mandatory for all plots > 200 sq.m",
      "STP mandatory for residential schemes with > 50 dwelling units"
]
  },
  {
    "id": "RULE-AUTH-GLADA-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Greater Ludhiana Area Development Authority & MC Ludhiana (Ludhiana, Punjab)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Punjab",
      "city": "Ludhiana",
      "authority": "Greater Ludhiana Area Development Authority & MC Ludhiana"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "GLADA Buddha Nullah Eco-Buffer & Industrial Focal Point Sanctions",
    "clause": "Punjab Building Rules 2021 & GLADA Industrial Zoning",
    "sourceDoc": "GLADA Ludhiana Building Permission & Industrial Estate Manual",
    "sourceUrl": "https://glada.gov.in/townplanning",
    "documentYear": "2021",
    "version": "GLADA / MC Ludhiana Building Code 2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building sanctions, Buddha Nullah pollution abatement buffer, and industrial focal point building controls in Ludhiana.",
    "parameters": {
      "buddhaNullahBuffer": "25m no-construction green belt along Buddha Nullah banks",
      "industrialCoverage": "Max 60% ground coverage with 6m peripheral fire driveway",
      "residentialFar": "1.50 to 2.25 based on road width",
      "eNakshaTurnaround": "21 working days"
},
    "detailedRequirements": [
      "PPCB (Punjab Pollution Control Board) consent mandatory prior to industrial building sanction",
      "Zero untreated trade effluent discharge into public sewers or storm drains",
      "Solar rooftop installation mandatory for all commercial and industrial buildings > 500 sq.m",
      "Structural safety audit for all factory buildings every 5 years"
]
  },
  {
    "id": "RULE-AUTH-IDA-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Indore Development Authority & IMC (Indore, Madhya Pradesh)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Madhya Pradesh",
      "city": "Indore",
      "authority": "Indore Development Authority & IMC"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "IDA Super Corridor High-Density Norms & Swachh Indore SWM Mandates",
    "clause": "MP Bhumi Vikas Rules 2012 & IDA Special Regulations",
    "sourceDoc": "Indore Development Authority (IDA) Building Sanction Manual",
    "sourceUrl": "https://idaindore.org/townplanning",
    "documentYear": "2021",
    "version": "IDA / IMC Building Permission Code (MP Bhumi Vikas Rules 2012 Aligned)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building permissions, Super Corridor IT hub special zoning, and Khan River rejuvenation buffer rules in Indore.",
    "parameters": {
      "superCorridorFar": "FAR up to 3.50 on 75m Super Corridor road with premium FSI",
      "khanRiverBuffer": "30m green buffer along Khan and Saraswati river banks",
      "swmSegregationChute": "Mandatory 3-bin wet/dry/hazardous garbage chute in buildings > 15m",
      "abpasTurnaround": "15 to 20 working days"
},
    "detailedRequirements": [
      "On-site organic waste converter (OWC) mandatory for all complexes > 50 units or generating > 50 kg/day waste",
      "Zero untreated sewage discharge into Khan river drainage basin",
      "Rainwater harvesting percolation pit inspection compulsory before issuing Occupancy Certificate",
      "Fire safety approval from MP Fire Services mandatory for structures > 12.5m"
]
  },
  {
    "id": "RULE-AUTH-BDA-BHOPAL-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Bhopal Development Authority & BMC (Bhopal, Madhya Pradesh)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Madhya Pradesh",
      "city": "Bhopal",
      "authority": "Bhopal Development Authority & BMC"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "Bhopal Upper Lake Ramsar Wetland Buffer & BRTS Corridor Norms",
    "clause": "MP Bhumi Vikas Rules 2012 & Bhoj Wetland Directives",
    "sourceDoc": "Bhopal Development Authority Building Sanction Code",
    "sourceUrl": "https://bda.mp.gov.in/townplanning",
    "documentYear": "2021",
    "version": "BDA Bhopal Building Code 2021 (MP Bhumi Vikas Rules Aligned)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building approvals, Upper Lake (Bhoj Wetland Ramsar Site) 50m to 100m catchment buffer, and BRTS corridor zoning in Bhopal.",
    "parameters": {
      "upperLakeBuffer": "50m to 100m strict no-construction green belt from Upper Lake FTL",
      "brtsTodFar": "FAR up to 2.50 to 3.00 within 250m of BRTS corridor",
      "residentialBaseFar": "1.25 to 1.75 depending on road width",
      "abpasTimeline": "20 working days"
},
    "detailedRequirements": [
      "EPCO (Environmental Planning & Coordination Organisation) NOC mandatory near Bhoj wetland",
      "No chemical or heavy sewage discharging activities allowed in catchment zones",
      "Rainwater harvesting mandatory for all new constructions on plots > 140 sq.m",
      "Completion-cum-Occupancy certificate mandatory prior to permanent utility connections"
]
  },
  {
    "id": "RULE-AUTH-VMRDA-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Visakhapatnam Metropolitan Region Development Authority & GVMC (Visakhapatnam, Andhra Pradesh)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Andhra Pradesh",
      "city": "Visakhapatnam",
      "authority": "Visakhapatnam Metropolitan Region Development Authority & GVMC"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "VMRDA Coastal Beach Road CRZ Buffers & Cyclone Structural Norms",
    "clause": "AP Building Rules 2017 & VMRDA Special Coastal Norms",
    "sourceDoc": "VMRDA Visakhapatnam Metropolitan Building Sanction Manual",
    "sourceUrl": "https://vmrda.gov.in/townplanning",
    "documentYear": "2021",
    "version": "VMRDA Building Regulations (AP Building Rules 2017 Aligned)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building sanctions, Coastal Regulation Zone (CRZ-II/III) waterfront rules, cyclone-resilient structural norms, and hill-slope protection in Visakhapatnam.",
    "parameters": {
      "crzBeachSetback": "Strict CRZ notification compliance along Beach Road and coastline",
      "cycloneDesignWindSpeed": "50 m/s (180 km/h) design wind speed per IS 875 (Part 3)",
      "hillSlopeRestriction": "No development on natural slopes steeper than 30 degrees",
      "apdpmsTimeline": "21 working days for approval"
},
    "detailedRequirements": [
      "APCZMA (AP Coastal Zone Management Authority) clearance mandatory for plots within 500m of HTL",
      "Structural proof-check certificate for cyclone and seismic resilience by AU Engineering College empanelled consultants",
      "Mandatory dual plumbing and on-site STP for developments with > 20 flats",
      "Fire NOC from AP Disaster Response & Fire Services for buildings > 15m"
]
  },
  {
    "id": "RULE-AUTH-APCRDA-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Andhra Pradesh Capital Region Development Authority & VMC (Vijayawada, Andhra Pradesh)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Andhra Pradesh",
      "city": "Vijayawada",
      "authority": "Andhra Pradesh Capital Region Development Authority & VMC"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "APCRDA Krishna River Flood Buffer & Amaravati Grid Sanctions",
    "clause": "APCRDA Act & AP Building Rules 2017",
    "sourceDoc": "APCRDA Amaravati & Vijayawada Building Sanction Guidelines",
    "sourceUrl": "https://crda.ap.gov.in/townplanning",
    "documentYear": "2021",
    "version": "APCRDA Building Regulations 2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building permissions, Krishna River flood embankment setbacks, and Capital City Amaravati development zoning standards.",
    "parameters": {
      "krishnaRiverBuffer": "50m strict no-development buffer from Krishna river flood bund",
      "amaravatiFar": "FAR up to 3.50 on designated arterial grid corridors",
      "irrigationCanalBuffer": "9m to 15m buffer from irrigation canal banks",
      "dpmsTurnaround": "21 working days"
},
    "detailedRequirements": [
      "Irrigation Department clearance mandatory for developments within 200m of Krishna River bund",
      "Underground utility connection compliance before Occupancy Certificate",
      "Mandatory rainwater percolation pits in all setbacks",
      "Solar rooftop installation mandatory for commercial plots > 300 sq.m"
]
  },
  {
    "id": "RULE-AUTH-BDA-BHUBANESWAR-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Bhubaneswar Development Authority & BMC (Bhubaneswar, Odisha)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Odisha",
      "city": "Bhubaneswar",
      "authority": "Bhubaneswar Development Authority & BMC"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "BDA Lingaraj Temple Heritage Zone & Cyclone Resilient Norms",
    "clause": "Odisha Planning & Building Standard Rules 2020 Chapter 4 & 7",
    "sourceDoc": "Bhubaneswar Development Authority (BDA) Building Sanction Code",
    "sourceUrl": "https://bda.gov.in/building-regulations",
    "documentYear": "2021",
    "version": "BDA Planning & Building Standards Regulations 2020",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building approvals, heritage temple corridor restrictions (Old Town Lingaraj precinct), and cyclone-resilient construction in Bhubaneswar.",
    "parameters": {
      "lingarajHeritageHeight": "Max 12.0m height within 500m of Lingaraj Temple boundary",
      "cyclonicDesignWindSpeed": "50 m/s design wind speed per IS 875",
      "ganguaNallahBuffer": "20m no-construction green strip along drainage channels",
      "eBikashTimeline": "30 days for sanction"
},
    "detailedRequirements": [
      "Heritage Committee & ASI NOC mandatory in notified Ekamra Kshetra precinct",
      "Structural safety certificate for high cyclonic wind and seismic zone III by registered structural engineer",
      "STP compulsory for residential apartments with > 20 dwelling units",
      "Fire safety certificate from Odisha Fire Service mandatory before OC for buildings > 15m"
]
  },
  {
    "id": "RULE-AUTH-CDA-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Cuttack Development Authority & CMC (Cuttack, Odisha)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Odisha",
      "city": "Cuttack",
      "authority": "Cuttack Development Authority & CMC"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "CDA Mahanadi / Kathajodi River Embankment Buffers & Height Caps",
    "clause": "Odisha Planning & Building Standard Rules 2020 & CDA Special Norms",
    "sourceDoc": "Cuttack Development Authority Building Sanction Manual",
    "sourceUrl": "https://cda.odisha.gov.in/townplanning",
    "documentYear": "2021",
    "version": "CDA Building Regulations 2021 (OPBSR Aligned)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building sanctions, Mahanadi and Kathajodi river embankment protection buffers, and silver city narrow lane regulations in Cuttack.",
    "parameters": {
      "riverEmbankmentBuffer": "50m strict no-construction buffer from river protection embankments",
      "narrowStreetHeight": "Building height capped at 1.5x street width in historic core",
      "baseFar": "1.50 to 2.00 depending on road width",
      "sanctionTurnaround": "30 days"
},
    "detailedRequirements": [
      "Water Resources Department NOC required for plots near river ring embankments",
      "Adequate foundation engineering to resist water-logging in low-lying delta areas",
      "STP mandatory for commercial complexes > 1,500 sq.m",
      "Fire safety certificate required for all buildings exceeding 15m"
]
  },
  {
    "id": "RULE-AUTH-PRDA-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Patna Municipal Corporation & PRDA (Patna, Bihar)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Bihar",
      "city": "Patna",
      "authority": "Patna Municipal Corporation & PRDA"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "Patna Ganga River Flood Plain Buffer & Seismic Zone IV Controls",
    "clause": "Bihar Building Bye-Laws 2014 Rule 18, 23 & PMC Directives",
    "sourceDoc": "Patna Municipal Corporation & PRDA Building Sanction Manual",
    "sourceUrl": "https://pmc.bihar.gov.in/townplanning",
    "documentYear": "2021",
    "version": "Bihar Building Bye-Laws 2014 (Amended to 2022) / PMC Manual",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building permissions, Ganga River flood plain restrictions, narrow street height limits, and Seismic Zone IV structural scrutiny in Patna.",
    "parameters": {
      "gangaRiverBuffer": "200m from Ganga river bank / active flood plain - Zero new multi-storey construction",
      "seismicCompliance": "IS 1893:2016 Zone IV mandatory compliance and proof-checking",
      "streetWidthCap": "Road < 6m: Max G+2 (9m height); Road 6-9m: Max G+3 (12m height)",
      "singleWindowTimeline": "30 days for sanction"
},
    "detailedRequirements": [
      "Structural safety peer review certificate by NIT Patna / IIT Patna empanelled structural engineers mandatory for buildings > 15m",
      "No cantilever or balcony projection permitted over public roads narrower than 6m",
      "STP and rainwater harvesting pit mandatory for all multi-family residential complexes > 12 units",
      "Fire NOC from Bihar Fire Services mandatory before Occupancy Certificate"
]
  },
  {
    "id": "RULE-AUTH-RRDA-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Ranchi Regional Development Authority & RMC (Ranchi, Jharkhand)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Jharkhand",
      "city": "Ranchi",
      "authority": "Ranchi Regional Development Authority & RMC"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "RRDA Subarnarekha Eco-Buffer & Plateau Slope Building Norms",
    "clause": "Jharkhand Building Bye-Laws 2016 Chapter 4 & RRDA Regulations",
    "sourceDoc": "Ranchi Regional Development Authority (RRDA) Sanction Manual",
    "sourceUrl": "https://rrda.jharkhand.gov.in/townplanning",
    "documentYear": "2021",
    "version": "Jharkhand Building Bye-Laws 2016 (Amended 2022)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building approvals, Subarnarekha and Harmu River buffer protections, and plateau slope development regulations in Ranchi.",
    "parameters": {
      "riverEcoBuffer": "30m no-construction buffer along Subarnarekha and Harmu rivers",
      "residentialBaseFar": "1.50 to 2.50 depending on road width",
      "rockTerrainRwh": "Mandatory deep recharge borewell with silt filter for plots > 200 sq.m",
      "obpasTimeline": "30 days"
},
    "detailedRequirements": [
      "Forest Department clearance required for plots within 100m of notified forest boundaries",
      "Geotechnical stability report for excavations in hilly/rocky terrain",
      "STP mandatory for residential layouts > 20 flats",
      "Fire safety approval for all commercial buildings > 500 sq.m"
]
  },
  {
    "id": "RULE-AUTH-GMDA-GUWAHATI-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Guwahati Metropolitan Development Authority & GMC (Guwahati, Assam)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Assam",
      "city": "Guwahati",
      "authority": "Guwahati Metropolitan Development Authority & GMC"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "GMDA Hill Cutting Ban, Deepor Beel Buffer & Seismic Zone V Mandate",
    "clause": "Guwahati Building Byelaws 2014 Byelaw 21, 24 & Disaster Mitigation Directives",
    "sourceDoc": "Guwahati Metropolitan Development Authority (GMDA) Sanction Code",
    "sourceUrl": "https://gmda.assam.gov.in/documents-detail/building-byelaws",
    "documentYear": "2021",
    "version": "Guwahati Building Byelaws 2014 (Amended 2022)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building sanctions, Brahmaputra River flood plain restrictions, hill cutting prohibitions, and Seismic Zone V structural scrutiny in Guwahati.",
    "parameters": {
      "hillCuttingBan": "Strict ban on earth cutting / hill slope alteration without GMDA expert committee clearance",
      "deeporBeelBuffer": "100m strict eco-sensitive buffer around Deepor Beel wetland",
      "seismicZone5Compliance": "IS 1893:2016 & IS 13920:2016 Zone V mandatory structural proof-check by IIT Guwahati / AEC",
      "swsTimeline": "30 days for sanction"
},
    "detailedRequirements": [
      "Hill slope stability report and soil soil-mechanics investigation mandatory for any development on contour land",
      "Zero tree felling on hill tracts without Forest Division permission",
      "Mandatory functional rainwater harvesting and retention tank for all plots > 150 sq.m",
      "State Fire Service NOC mandatory prior to construction for buildings > 15m"
]
  },
  {
    "id": "RULE-AUTH-MDDA-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Mussoorie Dehradun Development Authority (Dehradun, Uttarakhand)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Uttarakhand",
      "city": "Dehradun",
      "authority": "Mussoorie Dehradun Development Authority"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "MDDA Doon Valley Eco-Controls & Mussoorie Hill Slope Height Caps",
    "clause": "MDDA Building Bye-Laws 2021 & Doon Valley Notification 1989",
    "sourceDoc": "MDDA Dehradun Building Sanction & Doon Valley Eco-Code",
    "sourceUrl": "https://mddaonline.in/building-bye-laws",
    "documentYear": "2021",
    "version": "MDDA Building Bye-Laws 2021 (Doon Valley Notification Aligned)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building approvals, Doon Valley Eco-Sensitive Zone Notification controls, Rispana/Bindal river buffers, and Seismic Zone IV structural scrutiny in Dehradun.",
    "parameters": {
      "mussoorieHeightCap": "Max 11.0m (2 storeys + attic) on hill slopes in Mussoorie Master Plan area",
      "dehradunBaseFar": "1.50 to 2.25 based on road width",
      "riverBuffer": "15m to 30m no-construction green strip along Rispana and Bindal rivers",
      "obpasTimeline": "25 working days"
},
    "detailedRequirements": [
      "Hill cutting strictly regulated; retaining wall design must be certified by geotechnical engineer",
      "Structural safety certificate for Seismic Zone IV certified by empanelled structural engineer",
      "Rainwater harvesting percolation pit mandatory for 100% of new residential and commercial plots",
      "Uttarakhand Fire Service clearance mandatory for commercial buildings > 500 sq.m"
]
  },
  {
    "id": "RULE-AUTH-SMRDA-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Shimla Municipal Corporation & SMRDA (Shimla, Himachal Pradesh)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Himachal Pradesh",
      "city": "Shimla",
      "authority": "Shimla Municipal Corporation & SMRDA"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "Shimla 17 Green Belts Construction Ban & Heritage Height Caps",
    "clause": "Shimla Master Plan 2041 Regulations & NGT Directives (O.A. 121/2014)",
    "sourceDoc": "Shimla SMRDA Hill Architecture & Green Belt Building Sanction Code",
    "sourceUrl": "https://shimlamc.hp.gov.in/townplanning",
    "documentYear": "2021",
    "version": "Shimla Planning Area Building Regulations 2021 (NGT Aligned)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building permissions, 17 Notified Green Belts complete construction ban, Heritage Core Zone controls, and hill slope stability rules in Shimla.",
    "parameters": {
      "greenBeltBan": "Zero new construction permitted in 17 Notified Green Belts of Shimla",
      "heritageCoreHeightCap": "Max 2 storeys + attic (10.0m height max) in Core/Heritage zone",
      "slopeGradientThreshold": "Zero construction permitted on natural hill slopes > 45 degrees",
      "sanctionTurnaround": "30 days"
},
    "detailedRequirements": [
      "Geotechnical slope stability and bearing capacity report certified by empanelled geologist mandatory",
      "Sloping roof design with dark green/red corrugated sheets mandatory in heritage and visible hill precincts",
      "Rainwater harvesting tank sized for minimum 15 days household consumption mandatory before water connection",
      "Tree cutting prohibited; compensatory planting of 5 indigenous trees for any emergency trimming"
]
  },
  {
    "id": "RULE-AUTH-SDA-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Srinagar Development Authority & SMC (Srinagar, Jammu & Kashmir (UT))",
    "jurisdictionScope": {
      "country": "India",
      "state": "Jammu & Kashmir (UT)",
      "city": "Srinagar",
      "authority": "Srinagar Development Authority & SMC"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "Srinagar Dal Lake 200m Prohibited Buffer & Seismic Zone V Mandates",
    "clause": "J&K Unified Building Bye-Laws 2021 & LCMA Dal Lake Directives",
    "sourceDoc": "Srinagar Development Authority (SDA) Building Sanction Manual",
    "sourceUrl": "https://sdasrinagar.jk.gov.in/townplanning",
    "documentYear": "2021",
    "version": "J&K Unified Building Bye-Laws 2021 (Srinagar Overlay)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building sanctions, Dal Lake 200m prohibited buffer, Jhelum River flood protection zone, and Seismic Zone V structural norms in Srinagar.",
    "parameters": {
      "dalLakeBuffer": "200m from Dal and Nigeen lake shoreline - Zero new construction (LCMA clearance required for minor repair)",
      "jhelumFloodBuffer": "50m buffer along Jhelum River and flood spill channels",
      "seismicZone5Engineering": "Mandatory compliance with IS 1893:2016 Zone V and ductile detailing",
      "swsTurnaround": "21 working days"
},
    "detailedRequirements": [
      "LCMA (Lake Conservation & Management Authority) NOC mandatory for all plots in lake catchment area",
      "Sloping roof with tin/slate covering designed for local snow-load conditions mandatory",
      "Septic tank with soak pit must be positioned at least 30m away from any natural water source",
      "Fire safety approval mandatory for all commercial and institutional structures"
]
  },
  {
    "id": "RULE-AUTH-JDA-JAMMU-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Jammu Development Authority & JMC (Jammu, Jammu & Kashmir (UT))",
    "jurisdictionScope": {
      "country": "India",
      "state": "Jammu & Kashmir (UT)",
      "city": "Jammu",
      "authority": "Jammu Development Authority & JMC"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "Jammu Tawi Riverfront Buffer & Mubarak Mandi Heritage Norms",
    "clause": "J&K Unified Building Bye-Laws 2021 Chapter 3 & JDA Regulations",
    "sourceDoc": "Jammu Development Authority (JDA) Building Sanction Code",
    "sourceUrl": "https://jdajammu.in/townplanning",
    "documentYear": "2021",
    "version": "J&K Unified Building Bye-Laws 2021 (Jammu Overlay)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building approvals, Tawi River flood plain restrictions, and Bahu Fort heritage buffer regulations in Jammu.",
    "parameters": {
      "tawiRiverBuffer": "50m strict green buffer along Tawi River banks",
      "heritagePalaceHeight": "Max 12.0m height within 500m of Mubarak Mandi palace complex",
      "baseFar": "1.50 to 2.25 based on road width",
      "sanctionTimeline": "21 working days"
},
    "detailedRequirements": [
      "Heritage Conservation Committee approval required for developments near historic monuments",
      "Structural safety certificate for Seismic Zone IV certified by registered engineer",
      "Rainwater harvesting percolation pit compulsory for plots > 200 sq.m",
      "Fire NOC mandatory prior to occupancy for buildings > 15m"
]
  },
  {
    "id": "RULE-AUTH-RDA-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Raipur Development Authority & Nava Raipur (NRDA) (Raipur, Chhattisgarh)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Chhattisgarh",
      "city": "Raipur",
      "authority": "Raipur Development Authority & Nava Raipur (NRDA)"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "Nava Raipur Smart Grid Sanctions & Kharun River Eco-Buffer",
    "clause": "Chhattisgarh Bhumi Vikas Niyam 1984 (Amended 2021) & NRDA Regulations",
    "sourceDoc": "Raipur Development Authority & NRDA Nava Raipur Sanction Code",
    "sourceUrl": "https://rdaraipur.com/townplanning",
    "documentYear": "2021",
    "version": "Chhattisgarh Bhumi Vikas Niyam (Amended 2021) / NRDA Code",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building sanctions, Nava Raipur smart city planned grid controls, and Kharun River environmental protection buffer.",
    "parameters": {
      "navaRaipurFar": "FAR up to 3.0 on major grid boulevards in Nava Raipur",
      "kharunRiverBuffer": "30m green buffer along Kharun River banks",
      "solarRooftopMandate": "Mandatory 5 kW solar PV for commercial plots > 500 sq.m",
      "bpamsTurnaround": "20 working days"
},
    "detailedRequirements": [
      "Zero untreated wastewater discharge into public drainage channels",
      "STP mandatory for all residential schemes > 25 units in Nava Raipur",
      "Rainwater harvesting percolation pit inspection compulsory before issuing Occupancy Certificate",
      "Fire safety approval from Chhattisgarh Fire Services for buildings > 12.5m"
]
  },
  {
    "id": "RULE-AUTH-GCDA-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Greater Cochin Development Authority & Kochi Municipal Corporation (Kochi, Kerala)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Kerala",
      "city": "Kochi",
      "authority": "Greater Cochin Development Authority & Kochi Municipal Corporation"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "GCDA Vembanad Backwater CRZ Buffers & Kochi Metro TOD Norms",
    "clause": "Kerala Municipality Building Rules 2019 Rule 26 & CRZ Notification",
    "sourceDoc": "GCDA Kochi & Kochi Municipal Corporation Building Sanction Code",
    "sourceUrl": "https://gcda.kerala.gov.in/townplanning",
    "documentYear": "2021",
    "version": "KMBR 2019 (Kochi Metropolitan Overlay 2021)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building permissions, Vembanad Lake CRZ-II buffer regulations, Kochi Metro TOD corridor, and backwater canal setbacks in Kochi.",
    "parameters": {
      "backwaterCanalBuffer": "50m CRZ buffer from Vembanad backwater high-tide line",
      "metroTodFar": "FAR up to 4.0 within 500m of Kochi Metro line",
      "baseFar": "2.50 to 3.25 under KMBR 2019",
      "sankethamTimeline": "30 days for sanction"
},
    "detailedRequirements": [
      "KCZMA (Kerala Coastal Zone Management Authority) NOC mandatory for waterfront plots",
      "Soil investigation and pile load test mandatory for all structures > 3 storeys",
      "Rainwater harvesting storage tank sized at 50 liters/sq.m of roof area",
      "Fire NOC mandatory prior to occupancy for buildings > 16m"
]
  },
  {
    "id": "RULE-AUTH-TRIDA-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Thiruvananthapuram Regional Development Authority & TMC (Thiruvananthapuram, Kerala)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Kerala",
      "city": "Thiruvananthapuram",
      "authority": "Thiruvananthapuram Regional Development Authority & TMC"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "TRIDA Padmanabhaswamy Temple Heritage Buffer & Karamana River Norms",
    "clause": "KMBR 2019 & TRIDA Heritage Conservation Guidelines",
    "sourceDoc": "TRIDA Thiruvananthapuram Metropolitan Building Sanction Code",
    "sourceUrl": "https://trida.kerala.gov.in/townplanning",
    "documentYear": "2021",
    "version": "KMBR 2019 (TRIDA Master Plan Overlay)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building sanctions, Padmanabhaswamy Temple heritage security zone, and coastal Karamana River buffer regulations in Thiruvananthapuram.",
    "parameters": {
      "templeSecurityZoneHeight": "Max 10.0m height within 500m of Padmanabhaswamy Temple",
      "karamanaRiverBuffer": "15m green buffer along Karamana and Killi rivers",
      "residentialFar": "2.50 base FAR with premium FSI options",
      "sankethamTurnaround": "30 days"
},
    "detailedRequirements": [
      "Heritage & Security Committee clearance required in Fort precinct",
      "Groundwater recharge pit mandatory for all plots > 100 sq.m",
      "STP compulsory for multi-storeyed residential complexes > 20 flats",
      "State Fire Service clearance mandatory before OC for buildings > 16m"
]
  },
  {
    "id": "RULE-AUTH-PDA-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Prayagraj Development Authority (Prayagraj, Uttar Pradesh)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Prayagraj",
      "authority": "Prayagraj Development Authority"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "PDA Sangam Confluence Flood Buffer & Kumbh Corridor Setback Norms",
    "clause": "UP Model Bye-Laws 2021 & PDA Sangam Special Directives",
    "sourceDoc": "Prayagraj Development Authority (PDA) Building Sanction Manual",
    "sourceUrl": "https://pdaprayagraj.in/townplanning",
    "documentYear": "2021",
    "version": "PDA Building Regulations 2021 (UP-OBPAS)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building approvals, Triveni Sangam flood plain 200m buffer, and Maha Kumbh Mela movement corridor regulations in Prayagraj.",
    "parameters": {
      "sangamProhibitedBuffer": "200m from Ganga-Yamuna high flood line - Zero new permanent construction",
      "kumbhCorridorSetback": "Minimum 6m front setback on designated Kumbh Mela arterial routes",
      "baseFar": "1.50 to 2.25 based on road width",
      "obpasTimeline": "25 working days"
},
    "detailedRequirements": [
      "Irrigation Department & NMCG clearance required for plots within 300m of river edge",
      "Structural safety certificate for Seismic Zone IV by registered structural engineer",
      "Dual plumbing system mandatory for group housing > 2,000 sq.m",
      "Fire NOC mandatory prior to occupancy for buildings > 15m"
]
  },
  {
    "id": "RULE-AUTH-ADA-ASR-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "Amritsar Development Authority & Municipal Corporation Amritsar (Amritsar, Punjab)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Punjab",
      "city": "Amritsar",
      "authority": "Amritsar Development Authority & Municipal Corporation Amritsar"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "Amritsar Golden Temple Galliara Heritage Buffer & Facade Norms",
    "clause": "Amritsar Walled City Heritage Act & Punjab Building Rules 2021",
    "sourceDoc": "Amritsar Development Authority & MCA Heritage Sanction Code",
    "sourceUrl": "https://adaamritsar.gov.in/townplanning",
    "documentYear": "2021",
    "version": "Amritsar Walled City Heritage Act & PBR 2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Building sanctions, Golden Temple (Sri Harmandir Sahib) Galliara heritage buffer, and Walled City special building controls in Amritsar.",
    "parameters": {
      "galliaraBufferHeight": "Max 10.0m height within 100m Galliara buffer around Golden Temple",
      "walledCityFacade": "Mandatory Nanak Shahi brick / red sandstone finish in heritage corridor",
      "residentialFar": "1.50 to 2.00 base FAR with e-Naksha fast track",
      "eNakshaTimeline": "21 working days"
},
    "detailedRequirements": [
      "Heritage Conservation Committee approval mandatory within Walled City boundary",
      "Zero cantilever or sign-board encroachment over narrow heritage bazaars",
      "Rainwater harvesting mandatory for all plots > 150 sq.m",
      "Fire safety approval from Punjab Fire Services before OC"
]
  },
  {
    "id": "RULE-AUTH-WBHIDCO-001",
    "tier": "authority_local",
    "level": 4,
    "levelName": "Level 4: Local Authority Building Norms & Circulars",
    "jurisdiction": "West Bengal Housing Infrastructure Development Corporation (WBHIDCO / NKDA) (Kolkata, West Bengal)",
    "jurisdictionScope": {
      "country": "India",
      "state": "West Bengal",
      "city": "Kolkata",
      "authority": "West Bengal Housing Infrastructure Development Corporation (WBHIDCO / NKDA)"
    },
    "category": "approvals_sanctions",
    "categoryName": "Local Authority Sanctions & Scrutiny Code",
    "title": "WBHIDCO New Town IT Hub High FAR & East Kolkata Wetland Buffers",
    "clause": "NKDA Building Rules 2021 & East Kolkata Wetlands (Conservation) Act",
    "sourceDoc": "WBHIDCO New Town Kolkata Smart City Building Regulations",
    "sourceUrl": "https://www.nkdamar.org/BuildingPermission.aspx",
    "documentYear": "2021",
    "version": "New Town Kolkata (NKDA) Building Rules 2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Smart city building sanctions, Eco-Park water body buffer, and high-density financial/IT hub FAR regulations in New Town Kolkata.",
    "parameters": {
      "newTownItFar": "FAR up to 4.0 for IT/ITeS and Financial Hub campuses",
      "wetlandBuffer": "Strict prohibition on any land conversion within East Kolkata Wetlands Ramsar site",
      "mandatoryGreenRating": "Minimum IGBC Silver / GRIHA 3-star rating for plots > 5,000 sq.m",
      "nkdaTimeline": "21 working days for sanction"
},
    "detailedRequirements": [
      "East Kolkata Wetland Management Authority (EKWMA) clearance mandatory near wetland boundary",
      "STP with 100% wastewater reuse for HVAC and horticulture mandatory for all commercial plots",
      "Structural safety certificate for Seismic Zone III and soft alluvial soil by registered Geo-Tech engineer",
      "Occupancy Certificate mandatory before power and water supply activation"
]
  },
  {
    "id": "RULE-AUTH-CRZ-001",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Pan-India Statutory Overlays & Codes",
    "jurisdiction": "National (Pan-India)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "special_restriction",
    "categoryName": "Statutory Environmental & Safety Overlays",
    "title": "CRZ Setback, No Development Zone (NDZ) & High Tide Line Mandates",
    "clause": "CRZ Notification 2019 Paragraph 5 & 8",
    "sourceDoc": "MoEFCC Coastal Regulation Zone (CRZ-I, II, III, IV) Buffer Regulations",
    "sourceUrl": "https://moef.gov.in/en/division/coastal-zone-management/",
    "documentYear": "2019",
    "version": "CRZ Notification 2019 (Amended 2021)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Statutory nationwide coastal setbacks, High Tide Line (HTL) buffers, and No Development Zones (NDZ) applicable across all coastal states and UTs in India.",
    "parameters": {
      "crz1Buffer": "Strictly no permanent development permitted",
      "crz2PermissibleLine": "Only on landward side of existing authorized structures/roads",
      "crz3aNdz": "50 meters No Development Zone from High Tide Line (HTL)",
      "crz3bNdz": "200 meters No Development Zone from High Tide Line (HTL)",
      "creekBuffer": "50m or width of creek (whichever is less) from High Tide Line"
},
    "detailedRequirements": [
      "State Coastal Zone Management Authority (SCZMA) NOC mandatory for all proposals in CRZ boundary",
      "FSI in CRZ-II is frozen to the prevailing local town planning norms as on date of notification",
      "Zero discharge of untreated sewage, solid waste, or industrial effluents into coastal waters",
      "Demolition order without compensation applies to any unauthorized development in CRZ"
]
  },
  {
    "id": "RULE-AUTH-AAI-001",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Pan-India Statutory Overlays & Codes",
    "jurisdiction": "National (Pan-India)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "special_restriction",
    "categoryName": "Statutory Environmental & Safety Overlays",
    "title": "AAI Air Funnel Slope, CCZM Ceiling & NOCAS Height Clearances",
    "clause": "Ministry of Civil Aviation GSR 751(E) Schedule I & II",
    "sourceDoc": "AAI Obstacle Limitation Surfaces (OLS) & Colour Coded Zoning Map (CCZM)",
    "sourceUrl": "https://nocas2.aai.aero/nocas/",
    "documentYear": "2015",
    "version": "MoCA GSR 751(E) / NOCAS 2.0 System",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Pan-India aviation height safety clearance regulations, funnel slope restrictions, and radar clearance criteria around all civil and defense airports.",
    "parameters": {
      "approachFunnelSlope": "1:50 (2%) along aircraft approach path from runway threshold",
      "transitionalSlope": "1:7 (14.3%) perpendicular to runway center line",
      "innerHorizontalSurface": "45m above airport reference point up to 4,000m radius",
      "obstacleLightThreshold": "Mandatory medium-intensity red warning beacon for structures >= 45m AGL"
},
    "detailedRequirements": [
      "WGS-84 coordinates and site elevation AMSL must be certified by Survey of India / DGCA authorized agency",
      "AAI NOC validity: 8 years for buildings; 12 years for transmission lines/chimneys",
      "Shielding benefit claims must be physically inspected and vetted by AAI committee",
      "Any construction exceeding approved AMSL height constitutes a criminal offense under Aircraft Act 1934"
]
  },
  {
    "id": "RULE-AUTH-NMA-001",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Pan-India Statutory Overlays & Codes",
    "jurisdiction": "National (Pan-India)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "special_restriction",
    "categoryName": "Statutory Environmental & Safety Overlays",
    "title": "NMA 100m Prohibited & 300m Regulated Zone Heritage Restrictions",
    "clause": "AMASR Act 1958 Sections 20A, 20B & AMASR Amendment Act 2010",
    "sourceDoc": "ASI & National Monuments Authority Prohibited and Regulated Buffer Code",
    "sourceUrl": "https://nma.gov.in/public/content/act-and-rules",
    "documentYear": "2010",
    "version": "AMASR (Amendment and Validation) Act 2010",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Statutory nationwide heritage protection zones around all 3,690+ Centrally Protected Monuments across India under the Archaeological Survey of India.",
    "parameters": {
      "prohibitedZoneRadius": "100.0m in all directions from protected monument boundary (Zero new construction)",
      "regulatedZoneRadius": "100.0m to 300.0m from protected monument boundary (NMA NOC mandatory)",
      "maxRegulatedHeight": "Subject to Heritage Bye-Law of monument (typically max 9.0m to 12.0m)",
      "nmaSmartecTimeline": "30 days for automated NMA scrutiny"
},
    "detailedRequirements": [
      "Prohibited Area (0-100m) permits only emergency repair/renovation of pre-1958 existing lawful structures with prior ASI Competent Authority permission",
      "Regulated Area (100-300m) application must include 3D visual impact simulation and sightline elevation drawing",
      "Local municipal authority cannot sanction building plans without unconditional NMA NOC",
      "Violation under Section 20A carries up to 2 years imprisonment and \u20b91,00,000 fine"
]
  },
  {
    "id": "RULE-AUTH-CGWA-001",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Pan-India Statutory Overlays & Codes",
    "jurisdiction": "National (Pan-India)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "special_restriction",
    "categoryName": "Statutory Environmental & Safety Overlays",
    "title": "CGWA Groundwater Extraction NOC, Flow Metering & 100% RWH Mandate",
    "clause": "Environment (Protection) Act 1986 Section 5 & CGWA Guidelines 2020",
    "sourceDoc": "Central Ground Water Authority (CGWA) Abstraction & RWH Mandate",
    "sourceUrl": "https://cgwa-noc.gov.in/LandingPage/Guideline.aspx",
    "documentYear": "2020",
    "version": "CGWA Guidelines 2020 (Amended 2023)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Statutory pan-India groundwater extraction restrictions, mandatory rainwater harvesting, and water conservation fee schedules in Over-Exploited / Critical assessment units.",
    "parameters": {
      "digitalFlowMeter": "Mandatory telemetry-enabled ultrasonic/electromagnetic meter connected to CGWA cloud",
      "groundwaterRechargeRatio": "Minimum 100% (Safe blocks) to 200% (Critical/Over-Exploited blocks) of extracted volume",
      "stpRecycleMandate": "100% treated wastewater reuse for flushing and landscaping in projects > 10 KLD",
      "waterConservationFee": "Prescribed slab rates per cubic meter extracted per month"
},
    "detailedRequirements": [
      "NOC is mandatory prior to commencement of civil construction for all commercial/group housing extraction",
      "Piezometer with automatic water level recorder (AWLR) mandatory for projects abstracting > 10 KLD",
      "Water audit by certified water auditor mandatory every 3 years for projects abstracting > 100 KLD",
      "Extraction without valid NOC incurs Environmental Compensation up to \u20b91,00,000/day"
]
  },
  {
    "id": "RULE-AUTH-PESO-001",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Pan-India Statutory Overlays & Codes",
    "jurisdiction": "National (Pan-India)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "special_restriction",
    "categoryName": "Statutory Environmental & Safety Overlays",
    "title": "PESO Fuel Outlet Safety Distances, Vent Buffers & LPG Setback Norms",
    "clause": "Petroleum Act 1934 & Petroleum Rules 2002 Rule 120-135",
    "sourceDoc": "PESO Fuel Storage, Dispensing & Petroleum Safety Buffer Norms",
    "sourceUrl": "https://peso.gov.in/rules-guidelines",
    "documentYear": "2022",
    "version": "Petroleum Rules 2002 (Amended 2022) / Gas Cylinders Rules 2016",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandatory safety distances, blast walls, and clearance buffers for fuel retail outlets, LPG storage, and CNG stations relative to adjoining buildings.",
    "parameters": {
      "fuelDispenserSetback": "Minimum 3.0m to 6.0m clear distance to property boundary",
      "undergroundTankSetback": "Minimum 1.5m to 3.0m from any building foundation",
      "lpgStorageBuffer": "Minimum 3.0m to 15.0m depending on stored gas quantity",
      "cngCascadeDistance": "Minimum 6.0m clear safety distance from boundary wall"
},
    "detailedRequirements": [
      "PESO Site Approval (Prior Approval) and Form VII license mandatory before constructing fuel storage facility",
      "Flame-proof electrical fittings (Zone 1 / Zone 2 compliant) mandatory within hazardous area envelope",
      "Boundary wall adjoining fuel dispensing forecourt must be of RCC/brick masonry min 2.0m height",
      "Automatic shut-off valves and dry chemical powder fire extinguishers mandatory on dispenser islands"
]
  },
  {
    "id": "RULE-AUTH-RAILWAYS-001",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Pan-India Statutory Overlays & Codes",
    "jurisdiction": "National (Pan-India)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "special_restriction",
    "categoryName": "Statutory Environmental & Safety Overlays",
    "title": "Railways 30m Safety Setback, Piling Protection & Traction Clearances",
    "clause": "Railways Act 1989 Section 11 & Indian Railways Engineering Code Para 827",
    "sourceDoc": "Indian Railways Track Safety & Setback Distance Regulations",
    "sourceUrl": "https://indianrailways.gov.in/railwayboard/engineering-manual",
    "documentYear": "2020",
    "version": "Indian Railways Works Manual / Engineering Code (Amended 2020)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Nationwide mandatory setback distances, deep excavation protection, and structural safety clearances for buildings adjoining Indian Railways land.",
    "parameters": {
      "railwayLandSetback": "Minimum 30.0m setback from Railway boundary for structures > 15m or deep basements",
      "lowRiseRailwaySetback": "Minimum 3.0m clear setback from Railway boundary for low-rise residential (<= G+2)",
      "tractionLineVerticalClearance": "Minimum 5.5m clear vertical clearance from 25 kV AC overhead catenary",
      "railwayNocTimeline": "45 days for Railway Divisional Office scrutiny"
},
    "detailedRequirements": [
      "Railway Divisional Engineer (Sr. DEN) NOC mandatory before local municipal sanction for plots within 30m",
      "Deep basement excavation adjacent to track requires diaphragm wall and structural instrumentation monitoring",
      "No stormwater or sewer discharge permitted into railway side drains",
      "Sound attenuation barriers and anti-vibration foundation isolation recommended within 50m of main tracks"
]
  },
  {
    "id": "RULE-AUTH-NHAI-001",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Pan-India Statutory Overlays & Codes",
    "jurisdiction": "National (Pan-India)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "special_restriction",
    "categoryName": "Statutory Environmental & Safety Overlays",
    "title": "NHAI 40m-75m Highway Building Lines & Service Road Access Controls",
    "clause": "Control of National Highways (Land and Traffic) Act 2002 & MoRTH Guidelines",
    "sourceDoc": "NHAI Highway Ribbon Development & Access Management Policy",
    "sourceUrl": "https://nhai.gov.in/guidelines/access-management",
    "documentYear": "2020",
    "version": "MoRTH / NHAI Access Management Guidelines 2020",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Governs building lines, control lines, and direct vehicular access permissions along National Highways across India.",
    "parameters": {
      "nationalHighwayBuildingLine": "40.0m to 75.0m from center line of National Highway carriageway",
      "expresswayBuildingLine": "75.0m from center line or 100.0m right-of-way buffer",
      "serviceRoadWidth": "Minimum 7.0m to 10.0m parallel service road for commercial properties",
      "accelerationDecelerationLane": "Minimum 100m acceleration and 70m deceleration lane design"
},
    "detailedRequirements": [
      "NHAI Regional Office access permission NOC mandatory prior to local municipal sanction",
      "No direct curb cuts or uncontrolled parking allowed on National Highway right-of-way",
      "Drainage layout must ensure zero surface runoff enters highway pavement",
      "Setback buffer between Building Line and highway boundary must be maintained as green landscaped strip"
]
  },
  {
    "id": "RULE-AUTH-METRO-001",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Pan-India Statutory Overlays & Codes",
    "jurisdiction": "National (Pan-India)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "special_restriction",
    "categoryName": "Statutory Environmental & Safety Overlays",
    "title": "Metro 20m Tunnel Protection Envelope & Structural Piling Clearances",
    "clause": "Metro Railways Act 2002 Section 33 & Metro Safety Regulations",
    "sourceDoc": "Metro Rail Structure Protection Corridor & Height Clearances",
    "sourceUrl": "https://mohua.gov.in/metro-railway-guidelines",
    "documentYear": "2021",
    "version": "Metro Railways (Operation and Maintenance) Act 2002 & Safety Manuals",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandatory safety buffer zones, subterranean tunnel protection envelopes, and vibration monitoring for buildings along metro rail corridors in all Indian metro cities.",
    "parameters": {
      "undergroundTunnelZone": "20.0m zone of influence from outer edge of metro tunnel lining",
      "elevatedViaductZone": "10.0m horizontal clearance from outer edge of elevated viaduct/pier",
      "maxGroundSettlement": "Max 5mm differential settlement permitted during basement piling",
      "metroNocTimeline": "30 days for engineering scrutiny"
},
    "detailedRequirements": [
      "Metro Rail Corporation (DMRC, MMRDA, BMRCL, CMRL, HMRL, etc.) NOC mandatory before municipal sanction",
      "Geotechnical finite element simulation showing zero stress surcharge on tunnel lining mandatory for high-rise",
      "Continuous automated tilt-meter and vibration sensor monitoring during foundation construction",
      "Tower crane boom rotation restricted from entering air space over operating metro tracks"
]
  },
  {
    "id": "RULE-AUTH-HRBC-001",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Pan-India Statutory Overlays & Codes",
    "jurisdiction": "National (Pan-India)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "special_restriction",
    "categoryName": "Statutory Environmental & Safety Overlays",
    "title": "HRBC 70m+ Tall Building Structural Proof-Check & Refuge Floor Norms",
    "clause": "NBC 2016 Part 4 Clause 4.4 & Local High Rise Committee Directives",
    "sourceDoc": "High-Rise Building Committee (HRBC) Structural & Fire Scrutiny Code",
    "sourceUrl": "https://bis.gov.in/codes-standards/high-rise-committee-guidelines",
    "documentYear": "2021",
    "version": "National High-Rise Structural & Safety Standards (NBC 2016 Part 4 & 6)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandatory multidisciplinary expert committee scrutiny for all super-tall buildings exceeding 70 meters (or 21 storeys) across major Indian cities.",
    "parameters": {
      "hrcHeightThreshold": "Mandatory committee clearance for buildings exceeding 70.0m (21 floors)",
      "refugeFloorFrequency": "Refuge area at 24m and every 7th floor (approx. 15m to 18m) above 24m",
      "refugeFloorSize": "Minimum 15 sq.m or 0.3 sq.m per occupant of 2 consecutive upper floors",
      "fireTowerEvacuation": "Pressurized fire staircases with 2-hour fire-rated doors"
},
    "detailedRequirements": [
      "Independent structural proof check certificate from IIT/NIT/CBRI mandatory prior to HRC clearance",
      "Helipad or sky-bridge evacuation terrace required for buildings exceeding 150m height",
      "Dedicated fire lifts with fireman communication and 8-hour standby diesel generator backup",
      "Real-time structural health monitoring sensors (accelerometers) installed in super-tall towers (>100m)"
]
  },
  {
    "id": "RULE-AUTH-DUAL-PLUMBING-001",
    "tier": "special_authority",
    "level": 4,
    "levelName": "Level 4: Pan-India Statutory Overlays & Codes",
    "jurisdiction": "National (Pan-India)",
    "jurisdictionScope": {
      "country": "India"
    },
    "category": "special_restriction",
    "categoryName": "Statutory Environmental & Safety Overlays",
    "title": "Dual Plumbing Twin-Piping, STP Effluent Standards & Reuse Mandates",
    "clause": "MoHUA Model Building Bye-Laws Chapter 10 & NBC 2016 Part 9",
    "sourceDoc": "MoHUA & CPCB Dual Plumbing & Recycled Water Reuse Mandate",
    "sourceUrl": "https://cpcb.nic.in/wastewater-reuse-guidelines",
    "documentYear": "2021",
    "version": "MoHUA Model Bye-Laws Chapter 10 & CPCB Guidelines 2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandatory twin-pipe plumbing system, on-site sewage treatment plants, and zero liquid discharge reuse protocols for large residential and commercial complexes.",
    "parameters": {
      "dualPlumbingThreshold": "Mandatory for projects with built-up area >= 5,000 sq.m or >= 20 dwelling units",
      "treatedWaterBOD": "BOD <= 10 mg/L for flush and horticultural reuse",
      "treatedWaterTSS": "TSS <= 10 mg/L and Turbidity < 2 NTU",
      "pipingColorCode": "Purple / Lilac (RAL 4001) for all treated recycled water distribution lines"
},
    "detailedRequirements": [
      "Physical separation: Zero cross-connection between potable water supply and recycled water piping (backflow preventers mandatory)",
      "STP capacity must equal 100% of peak daily wastewater generation + 20% surge capacity",
      "Continuous online monitoring sensors for pH, turbidity, and chlorine residual in treated water sump",
      "Occupancy Certificate withheld if dual plumbing system fails pressure and water quality audit"
]
  }
];
