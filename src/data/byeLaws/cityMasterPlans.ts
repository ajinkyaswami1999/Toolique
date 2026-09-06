// Level 3: City Master Plans & Zonal Development Regulations (25 Indian Metros & Urban Hubs)

import type { ByeLawRule, RegulationDocument } from './types';

export const CITY_MASTER_PLAN_DOCUMENTS: RegulationDocument[] = [
  {
    "id": "DOC-PLAN-DELHI-MPD-2021",
    "title": "Master Plan for Delhi 2021 (MPD-2021) & Draft MPD-2041",
    "shortTitle": "Master Plan for Delhi (MPD-2021)",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Delhi (NCT)",
      "city": "Delhi",
      "authority": "Delhi Development Authority"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2021",
    "version": "MPD-2021 (with 2023 Gazette Modifications)",
    "status": "verified",
    "categories": [
      "land_use",
      "zoning",
      "far_fsi",
      "height_floors",
      "parking",
      "special_restriction"
    ],
    "source": {
      "authority": "Delhi Development Authority (DDA)",
      "officialUrl": "https://dda.gov.in",
      "documentUrl": "https://dda.gov.in/master-plan-2021",
      "documentType": "Gazette",
      "publishedDate": "2007-02-07",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Apex statutory planning document dictating land use zones, mixed-use commercial notifications, density controls, and redevelopment policies across NCT Delhi.",
    "keyProvisions": [
      "Chapter 15: Mixed Use Regulations permitting commercial activity on notified mixed-use streets",
      "Chapter 17: Development Code defining Zone A to Zone P-II land use and FAR envelopes",
      "Transit-Oriented Development (TOD) Policy granting high-density FAR up to 400 within 500m of MRTS stations",
      "Green Development Area (GDA) policy for low-density residential and hospitality clusters"
    ]
  },
  {
    "id": "DOC-PLAN-MUMBAI-DCPR-2034",
    "title": "Development Control and Promotion Regulations for Greater Mumbai 2034 (DCPR-2034)",
    "shortTitle": "Mumbai DCPR-2034",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Mumbai",
      "authority": "Municipal Corporation of Greater Mumbai"
    },
    "documentType": "development_control_regulations",
    "documentPriority": "primary",
    "year": "2034",
    "version": "DCPR-2034 (Sanctioned & Amended up to 2024)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "amenity_space",
      "approvals_sanctions"
    ],
    "source": {
      "authority": "Municipal Corporation of Greater Mumbai (MCGM / BMC)",
      "officialUrl": "https://www.mcgm.gov.in",
      "documentUrl": "https://autodcr.mcgm.gov.in/DCPR2034.aspx",
      "documentType": "Gazette",
      "publishedDate": "2018-05-08",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statutory planning framework for the Island City and Suburbs of Greater Mumbai, regulating base FSI, fungible FSI, TDR utilization, and cluster redevelopment.",
    "keyProvisions": [
      "Regulation 30: Permissible Basic FSI (1.33 Island City, 1.00 Suburbs) + Additional FSI on payment of premium",
      "Regulation 31(1): Ancillary FSI up to 60% for residential and 80% for commercial upon payment of premium",
      "Regulation 33: Special redevelopment schemes (33(7) Cessed buildings, 33(10) Slums, 33(9) Cluster redevelopment)",
      "Regulation 33(20): Transit-Oriented Development (TOD) granting higher FSI within 500m of Suburban Railway & Metro stations"
    ]
  },
  {
    "id": "DOC-PLAN-GGN-MP-2031",
    "title": "Gurugram-Manesar Urban Complex Final Development Plan 2031 (Master Plan 2031)",
    "shortTitle": "Gurugram Master Plan 2031",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Haryana",
      "city": "Gurugram",
      "authority": "GMDA & DTCP Haryana"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2031",
    "version": "GMUC Master Plan 2031 (Amended 2023)",
    "status": "verified",
    "categories": [
      "land_use",
      "zoning",
      "far_fsi",
      "setbacks",
      "parking",
      "special_restriction"
    ],
    "source": {
      "authority": "Department of Town & Country Planning (DTCP) Haryana & GMDA",
      "officialUrl": "https://tcpharyana.gov.in",
      "documentUrl": "https://gmda.gov.in/master-plans",
      "documentType": "Gazette",
      "publishedDate": "2012-11-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statutory master plan dividing Gurugram into 115 urban sectors, establishing sector densities, major arterial Right-of-Way buffers, and open space green corridors.",
    "keyProvisions": [
      "Sector density provisions ranging from 250 to 1125 persons per hectare across Sectors 1 through 115",
      "Mandatory 30m/50m green belt buffer along Dwarka Expressway, Golf Course Extension, and SPR",
      "Commercial and Mixed-Use belt development norms along 60m/150m master plan roads",
      "Integrated infrastructure clearance mandate from Gurugram Metropolitan Development Authority (GMDA)"
    ]
  },
  {
    "id": "DOC-PLAN-BLR-RMP-2015",
    "title": "Bengaluru Revised Master Plan (RMP 2015) & Draft Master Plan 2031",
    "shortTitle": "Bengaluru Master Plan RMP-2015",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Karnataka",
      "city": "Bengaluru",
      "authority": "Bangalore Development Authority"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2015",
    "version": "RMP-2015 (with Active Interim Zonal Regulations)",
    "status": "verified",
    "categories": [
      "land_use",
      "zoning",
      "far_fsi",
      "setbacks",
      "environmental_regulations",
      "special_restriction"
    ],
    "source": {
      "authority": "Bangalore Development Authority (BDA)",
      "officialUrl": "https://bdabangalore.org",
      "documentType": "Gazette",
      "publishedDate": "2007-06-22",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statutory zoning and land use plan regulating development across the Bangalore Metropolitan Area, defining valley zone buffers and road width multipliers.",
    "keyProvisions": [
      "Zonal Regulation 7.2: Valley Zone & Storm Water Drain (SWD) buffers (Primary: 50m, Secondary: 25m, Tertiary: 15m)",
      "Zonal Regulation 4.1: Road width linked FAR and commercial activity permissibility",
      "Lake Buffer Zone: Mandatory 30m no-construction green belt around all notified lake water bodies",
      "Mutation Corridors (100ft+ roads) permitting high-density mixed commercial development"
    ]
  },
  {
    "id": "DOC-PLAN-HYD-HMDA-2031",
    "title": "Hyderabad Metropolitan Development Plan 2031 (HMDA Master Plan 2031)",
    "shortTitle": "Hyderabad HMDA Master Plan 2031",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Telangana",
      "city": "Hyderabad",
      "authority": "HMDA & GHMC"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2031",
    "version": "HMDA 2031 (Amended 2023)",
    "status": "verified",
    "categories": [
      "land_use",
      "zoning",
      "setbacks",
      "environmental_regulations",
      "special_restriction"
    ],
    "source": {
      "authority": "Hyderabad Metropolitan Development Authority (HMDA)",
      "officialUrl": "https://www.hmda.org.in",
      "documentType": "Gazette",
      "publishedDate": "2013-03-30",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master development plan covering 7,257 sq.km of the Hyderabad metropolitan region, establishing Outer Ring Road (ORR) growth corridors and lake protection zones.",
    "keyProvisions": [
      "Outer Ring Road (ORR) Growth Corridor (1km on either side): High-density mixed-use development with special impact fee",
      "Mandatory 30m Full Tank Level (FTL) buffer around all notified lakes and water bodies (GO 168 / Lake Protection)",
      "Radial Road transit corridors permitting intensive commercial and IT/ITES high-rises",
      "Peri-Urban Zone regulations with minimum plot sub-division restrictions"
    ]
  },
  {
    "id": "DOC-PLAN-NOIDA-MP-2031",
    "title": "NOIDA Master Plan 2031 (Land Use & Zonal Development Regulations)",
    "shortTitle": "NOIDA Master Plan 2031",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Noida",
      "authority": "New Okhla Industrial Development Authority"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2031",
    "version": "NOIDA MP-2031 (Amended 2023)",
    "status": "verified",
    "categories": [
      "land_use",
      "zoning",
      "far_fsi",
      "ground_coverage",
      "height_floors"
    ],
    "source": {
      "authority": "New Okhla Industrial Development Authority (NOIDA)",
      "officialUrl": "https://noidaauthorityonline.in",
      "documentType": "Gazette",
      "publishedDate": "2011-09-15",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statutory zonal master plan regulating sector-wise planned developments, expressways, institutional IT parks, and group housing plots in Noida.",
    "keyProvisions": [
      "Group Housing base FAR 2.75 to 3.50 with purchasable FAR up to 4.0 on 24m+ wide sector roads",
      "Commercial sector FAR up to 4.0 along Noida-Greater Noida Expressway corridor",
      "Plotted residential height strictly limited to 15.0m (Ground + 3 storeys)",
      "Mandatory 20% to 30% green landscaping area within all group housing layouts"
    ]
  },
  {
    "id": "DOC-PLAN-GNIDA-MP-2021",
    "title": "Greater Noida Master Plan 2021 / Draft Master Plan 2041",
    "shortTitle": "Greater Noida Master Plan",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Greater Noida",
      "authority": "Greater Noida Industrial Development Authority"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2021",
    "version": "GNIDA Master Plan (Amended 2023)",
    "status": "verified",
    "categories": [
      "land_use",
      "zoning",
      "far_fsi",
      "ground_coverage",
      "height_floors"
    ],
    "source": {
      "authority": "Greater Noida Industrial Development Authority (GNIDA)",
      "officialUrl": "https://www.greaternoidaauthority.in",
      "documentType": "Gazette",
      "publishedDate": "2013-06-20",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs planned industrial, institutional, tech zone, and residential high-rise sectors across Greater Noida and Greater Noida West (Noida Extension).",
    "keyProvisions": [
      "High-rise residential group housing FAR up to 3.50 along 45m/60m wide master plan avenues",
      "Institutional and IT Park ground coverage capped at 30% with FAR 1.50 to 2.50",
      "EcoTech industrial sectors with strict zero effluent discharge compliance",
      "Mandatory integration with Greater Noida Metro corridor transit stations"
    ]
  },
  {
    "id": "DOC-PLAN-YEIDA-MP-2031",
    "title": "Yamuna Expressway Master Development Plan 2031",
    "shortTitle": "YEIDA Master Plan 2031",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Greater Noida",
      "authority": "Yamuna Expressway Industrial Development Authority"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2031",
    "version": "YEIDA 2031 (Amended 2023)",
    "status": "verified",
    "categories": [
      "land_use",
      "zoning",
      "far_fsi",
      "special_restriction"
    ],
    "source": {
      "authority": "Yamuna Expressway Industrial Development Authority (YEIDA)",
      "officialUrl": "https://yamunaexpresswayauthority.com",
      "documentType": "Gazette",
      "publishedDate": "2014-04-18",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Regulates mega industrial, electronic manufacturing cluster, Aerocity, and film city zones abutting the Jewar Noida International Airport.",
    "keyProvisions": [
      "Aviation Obstacle Limitation Surface (OLS) restrictions in Sectors adjacent to Noida International Airport (Jewar)",
      "Aerocity & High-Density Commercial zone FAR up to 3.50",
      "Industrial & Logistics Park ground coverage up to 60% with FAR 1.50",
      "100m green buffer along the Yamuna Expressway main carriage-way"
    ]
  },
  {
    "id": "DOC-PLAN-CHN-SMP-2026",
    "title": "Chennai Second Master Plan 2026 (CMDA SMP 2026)",
    "shortTitle": "Chennai Second Master Plan 2026",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Tamil Nadu",
      "city": "Chennai",
      "authority": "Chennai Metropolitan Development Authority"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2026",
    "version": "SMP 2026 (Amended 2022)",
    "status": "verified",
    "categories": [
      "land_use",
      "zoning",
      "far_fsi",
      "setbacks",
      "special_restriction"
    ],
    "source": {
      "authority": "Chennai Metropolitan Development Authority (CMDA)",
      "officialUrl": "https://cmdachennai.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2008-09-02",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statutory master plan for the Chennai Metropolitan Area (CMA) defining Continuous Building Areas (CBA), Non-CBA zones, and aquifer recharge buffers.",
    "keyProvisions": [
      "Continuous Building Area (CBA) in core historic city with zero side setbacks and high ground coverage",
      "Non-CBA developing zones requiring mandatory peripheral setbacks and 10% OSR surrender",
      "Aquifer Recharge Area along ECR / OMR coastal belt with restricted ground coverage and no basements",
      "Transit-Oriented corridors along Chennai Metro and MRTS with 50% premium FSI"
    ]
  },
  {
    "id": "DOC-PLAN-JPR-MDP-2025",
    "title": "Jaipur Master Development Plan 2025 (JDA MDP 2025)",
    "shortTitle": "Jaipur Master Plan 2025",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Rajasthan",
      "city": "Jaipur",
      "authority": "Jaipur Development Authority"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2025",
    "version": "MDP-2025 (Amended 2023)",
    "status": "verified",
    "categories": [
      "land_use",
      "zoning",
      "far_fsi",
      "setbacks",
      "special_restriction"
    ],
    "source": {
      "authority": "Jaipur Development Authority (JDA)",
      "officialUrl": "https://jda.urban.rajasthan.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2011-09-12",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master development plan governing the Jaipur Region, defining U1 to U3 urbanisable zones, ecological zones, and Walled City heritage restrictions.",
    "keyProvisions": [
      "Walled City (UNESCO World Heritage Site): Strict preservation of pink facade, parapet details, and height limits (12m)",
      "Ecological Zone / Aravalli Plantation Buffer: Prohibits industrial and heavy commercial construction",
      "Betterment FAR permissible along Tonk Road, JLN Marg, and Ring Road growth corridors",
      "Sector road widening setbacks mandatory for all JDA scheme plot approvals"
    ]
  },
  {
    "id": "DOC-PLAN-AHM-CDP-2021",
    "title": "Ahmedabad Comprehensive Development Plan 2021 / Draft Plan 2031 (AUDA CDP)",
    "shortTitle": "Ahmedabad AUDA CDP 2021",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Gujarat",
      "city": "Ahmedabad",
      "authority": "AUDA & AMC"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2021",
    "version": "AUDA CDP 2021 (Amended 2022)",
    "status": "verified",
    "categories": [
      "land_use",
      "zoning",
      "far_fsi",
      "parking",
      "special_restriction"
    ],
    "source": {
      "authority": "Ahmedabad Urban Development Authority (AUDA) & AMC",
      "officialUrl": "https://www.auda.org.in",
      "documentType": "Gazette",
      "publishedDate": "2014-12-18",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Development plan for Ahmedabad metropolitan area, implementing Town Planning Schemes (TPS) and high-density Transit-Oriented Development.",
    "keyProvisions": [
      "Transit-Oriented Development (TOD) Zone (within 200m of BRTS/Metro): Maximum FSI 4.00",
      "R1 Residential Zone Base FSI 1.80 + Chargeable FSI up to 2.70 on 18m+ roads",
      "Heritage Walled City Special Regulations preserving pols, wooden facades, and traditional courtyards",
      "Mandatory 40% deduction in TPS scheme reconstitution for roads, parks, and social infrastructure"
    ]
  },
  {
    "id": "DOC-PLAN-PUNE-PMRDA-2041",
    "title": "Pune Metropolitan Region Master Plan 2041 (PMRDA Plan)",
    "shortTitle": "Pune PMRDA Master Plan 2041",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Pune",
      "authority": "PMRDA & PMC / PCMC"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2041",
    "version": "PMRDA 2041 (Draft/Sanctioned 2023)",
    "status": "verified",
    "categories": [
      "land_use",
      "zoning",
      "far_fsi",
      "setbacks",
      "environmental_regulations"
    ],
    "source": {
      "authority": "Pune Metropolitan Region Development Authority (PMRDA)",
      "officialUrl": "https://pmrda.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2021-08-02",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Metropolitan regional development plan covering 7,256 sq.km around Pune, Pimpri-Chinchwad, Hinjewadi IT corridor, and Ring Road.",
    "keyProvisions": [
      "Pune Ring Road & High Capacity Mass Transit Route (HCMTR) special FSI growth corridors",
      "Hinjewadi IT/BioTech Special Planning Zone: FSI up to 3.0 for eligible technology campuses",
      "Mula-Mutha River floodline buffer (Blue Line: No construction; Red Line: Regulated construction)",
      "Hill top / hill slope zone development strictly prohibited to protect Western Ghats ecology"
    ]
  },
  {
    "id": "DOC-PLAN-LKO-MDP-2031",
    "title": "Lucknow Master Plan 2031 (LDA Maha Yojna 2031)",
    "shortTitle": "Lucknow Master Plan 2031",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Lucknow",
      "authority": "Lucknow Development Authority"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2031",
    "version": "Maha Yojna 2031 (Amended 2023)",
    "status": "verified",
    "categories": [
      "land_use",
      "zoning",
      "far_fsi",
      "setbacks",
      "special_restriction"
    ],
    "source": {
      "authority": "Lucknow Development Authority (LDA)",
      "officialUrl": "https://ldaonline.co.in",
      "documentType": "Gazette",
      "publishedDate": "2016-03-31",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master plan governing Lucknow metropolitan area, Shaheed Path development corridor, Gomti Riverfront, and Old City heritage zones.",
    "keyProvisions": [
      "Amar Shaheed Path & Kisan Path IT/Commercial growth belt FAR up to 3.0",
      "Gomti Riverfront green buffer: Mandatory 50m non-construction green belt from river embankment",
      "Old City Heritage Zone (Husainabad/Chowk): Height capped at 12.5m to safeguard monument vistas",
      "Purchasable FAR permissible along 18m+ wide master plan roads"
    ]
  },
  {
    "id": "DOC-PLAN-SURAT-SMP-2035",
    "title": "Surat Master Plan 2035 (SUDA Master Plan)",
    "shortTitle": "Surat Master Plan 2035",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Gujarat",
      "city": "Surat",
      "authority": "SUDA & SMC"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2035",
    "version": "SUDA 2035 (Amended 2022)",
    "status": "verified",
    "categories": [
      "land_use",
      "zoning",
      "far_fsi",
      "parking",
      "special_restriction"
    ],
    "source": {
      "authority": "Surat Urban Development Authority (SUDA) & SMC",
      "officialUrl": "https://sudaonline.org",
      "documentType": "Gazette",
      "publishedDate": "2017-01-20",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs rapid growth in the Diamond & Textile capital of India, DREAM City (Diamond Research and Mercantile City), and Tapi riverfront.",
    "keyProvisions": [
      "DREAM City Special Planning Area: FSI up to 4.5 for high-density financial and diamond trade towers",
      "Tapi River flood protection buffer and embankment construction controls",
      "Transit-Oriented Development along Surat Metro and BRTS corridors with maximum FSI 4.0",
      "Mandatory industrial effluent pre-treatment connectivity for textile/dyeing units"
    ]
  },
  {
    "id": "DOC-PLAN-INDORE-MDP-2021",
    "title": "Indore Development Plan 2021 / Draft Master Plan 2035 (Indore Master Plan)",
    "shortTitle": "Indore Master Plan",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Madhya Pradesh",
      "city": "Indore",
      "authority": "Indore Development Authority & IMC"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2021",
    "version": "Amended 2022",
    "status": "verified",
    "categories": [
      "land_use",
      "zoning",
      "far_fsi",
      "setbacks",
      "parking"
    ],
    "source": {
      "authority": "Indore Development Authority (IDA) & DTCP MP",
      "officialUrl": "https://idaindore.org",
      "documentType": "Gazette",
      "publishedDate": "2012-04-10",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master plan for Indore commercial capital, regulating Super Corridor IT hubs, AB Road commercial belt, and Ring Road TPS schemes.",
    "keyProvisions": [
      "Super Corridor IT & Commercial Zone: Base FAR 2.0 with premium FAR up to 3.0",
      "AB Road BRTS corridor: High-density mixed commercial development",
      "Town Planning Schemes (TPS 1 through TPS 10) land reconstitution and layout guidelines",
      "Kanh and Saraswati riverfront conservation and drainage buffers"
    ]
  },
  {
    "id": "DOC-PLAN-NAVI-MUM-CIDCO",
    "title": "Navi Mumbai Development Plan (CIDCO Land Use & DCR)",
    "shortTitle": "CIDCO Navi Mumbai Master Plan",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Navi Mumbai",
      "authority": "CIDCO & NMMC"
    },
    "documentType": "development_control_regulations",
    "documentPriority": "primary",
    "year": "2020",
    "version": "Amended 2023",
    "status": "verified",
    "categories": [
      "land_use",
      "zoning",
      "far_fsi",
      "height_floors",
      "special_restriction"
    ],
    "source": {
      "authority": "City and Industrial Development Corporation (CIDCO) & NMMC",
      "officialUrl": "https://cidco.maharashtra.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2015-08-11",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Planned nodal master plan governing Vashi, Nerul, Belapur, Kharghar, Ulwe, Dronagiri, and Navi Mumbai International Airport influence zone (NAINA).",
    "keyProvisions": [
      "NAINA (Navi Mumbai Airport Influence Notified Area): Special FSI incentives for integrated townships",
      "Node-wise commercial FAR 1.50 to 2.50 with Coastal Regulation Zone (CRZ) creek buffers",
      "Kharghar Valley Golf Course and institutional node environmental protection",
      "Mandatory CIDCO development permission and occupancy transfer certificate"
    ]
  },
  {
    "id": "DOC-PLAN-THANE-TMC-DP",
    "title": "Thane City Revised Development Plan (TMC DP)",
    "shortTitle": "Thane City Master Plan",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Thane",
      "authority": "Thane Municipal Corporation"
    },
    "documentType": "development_control_regulations",
    "documentPriority": "primary",
    "year": "2021",
    "version": "TMC DP (Amended 2023)",
    "status": "verified",
    "categories": [
      "land_use",
      "zoning",
      "far_fsi",
      "setbacks",
      "special_restriction"
    ],
    "source": {
      "authority": "Thane Municipal Corporation (TMC)",
      "officialUrl": "https://thanecity.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2016-09-22",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Development plan for Thane city, Ghodbunder Road growth corridor, Yeoor Hills eco-buffer, and Thane Creek waterfront.",
    "keyProvisions": [
      "Ghodbunder Road TOD Corridor: Higher FSI up to 3.00 on access roads >= 24m",
      "Yeoor Hills / Sanjay Gandhi National Park 100m eco-sensitive buffer: Absolute ban on high-rise development",
      "Cluster redevelopment schemes under Regulation 33(9) with incentive FSI up to 4.0",
      "Thane Creek wetland protection zone and CRZ-I buffer demarcations"
    ]
  },
  {
    "id": "DOC-PLAN-CHD-CMP-2031",
    "title": "Chandigarh Master Plan 2031 (CMP 2031 Heritage & Land Use)",
    "shortTitle": "Chandigarh Master Plan 2031",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Chandigarh (UT)",
      "city": "Chandigarh",
      "authority": "Chandigarh Administration"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2031",
    "version": "CMP 2031",
    "status": "verified",
    "categories": [
      "land_use",
      "zoning",
      "height_floors",
      "special_restriction"
    ],
    "source": {
      "authority": "Department of Urban Planning, Chandigarh Administration",
      "officialUrl": "https://urbanplanning.chd.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2015-04-23",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Apex master plan preserving the grid iron sector layout, Sukhna Lake catchment, Capitol Complex UNESCO heritage zone, and Phase I/II sectors.",
    "keyProvisions": [
      "Sukhna Lake Catchment: Eco-sensitive zone with complete prohibition of new construction",
      "Capitol Complex Buffer: Strict vista protection preventing any tall structure obscuring Le Corbusier heritage edifices",
      "Commercial Sector 17 & Sub-City Centre Sector 34 unified architectural controls",
      "Strict preservation of 7V road circulation hierarchy and green lung leisure valley"
    ]
  },
  {
    "id": "DOC-PLAN-KOLKATA-KMDA",
    "title": "Kolkata Metropolitan Area Development Plan (KMDA Master Plan)",
    "shortTitle": "Kolkata KMDA Master Plan",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "West Bengal",
      "city": "Kolkata",
      "authority": "KMDA & KMC"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2025",
    "version": "Amended 2021",
    "status": "verified",
    "categories": [
      "land_use",
      "zoning",
      "far_fsi",
      "special_restriction"
    ],
    "source": {
      "authority": "Kolkata Metropolitan Development Authority (KMDA)",
      "officialUrl": "https://kmda.wb.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2012-07-16",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Metropolitan regional plan governing Kolkata (KMC), Salt Lake (Bidhannagar), New Town (WBHIDCO), and Howrah.",
    "keyProvisions": [
      "EM Bypass and Rajarhat-New Town high-density commercial corridor: FAR up to 3.50",
      "East Kolkata Wetlands (Ramsar Site): Strict statutory prohibition on land conversion or construction",
      "Heritage Conservation Zone in North/Central Kolkata with special advisory committee approval",
      "Hooghly Riverfront development buffer and historical ghat conservation"
    ]
  },
  {
    "id": "DOC-PLAN-FBD-MP-2031",
    "title": "Faridabad Development Plan 2031 (Master Plan 2031)",
    "shortTitle": "Faridabad Master Plan 2031",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Haryana",
      "city": "Faridabad",
      "authority": "DTCP Haryana & MCF"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2031",
    "version": "Amended 2023",
    "status": "verified",
    "categories": [
      "land_use",
      "zoning",
      "far_fsi",
      "setbacks"
    ],
    "source": {
      "authority": "Department of Town & Country Planning (DTCP) Haryana",
      "officialUrl": "https://tcpharyana.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2014-07-14",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master plan governing Greater Faridabad (Neharpar) Sectors 75 to 89, Mathura Road industrial corridor, and Surajkund eco-zone.",
    "keyProvisions": [
      "Neharpar Sectors 75-89 group housing density: Up to 300 persons/acre with FAR 1.75 to 2.25",
      "Surajkund eco-sensitive zone setback: No mining or heavy construction within 5km radius",
      "Agra Canal green buffer: Mandatory 30m non-construction green strip along canal banks",
      "Purchasable FAR permissible on all sector divide roads measuring 24m or more"
    ]
  },
  {
    "id": "DOC-PLAN-GZB-MP-2031",
    "title": "Ghaziabad Master Plan 2031 (GDA Maha Yojna 2031)",
    "shortTitle": "Ghaziabad Master Plan 2031",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Ghaziabad",
      "authority": "Ghaziabad Development Authority"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2031",
    "version": "GDA Maha Yojna 2031 (Amended 2023)",
    "status": "verified",
    "categories": [
      "land_use",
      "zoning",
      "far_fsi",
      "special_restriction"
    ],
    "source": {
      "authority": "Ghaziabad Development Authority (GDA)",
      "officialUrl": "https://gdaonline.in",
      "documentType": "Gazette",
      "publishedDate": "2015-11-20",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master plan governing Indirapuram, Vaishali, Kaushambi, Raj Nagar Extension, and Delhi-Meerut Expressway corridor.",
    "keyProvisions": [
      "Delhi-Meerut RapidX (RRTS) Transit-Oriented Development corridor: Special FAR up to 3.50",
      "Hindon River floodplain buffer: Complete ban on permanent construction within river floodway",
      "Raj Nagar Extension high-density group housing zone norms and mandatory STP recycling",
      "NH-9 / Delhi-Meerut Expressway commercial ribbon development standards"
    ]
  },
  {
    "id": "DOC-PLAN-KOCHI-MP-2040",
    "title": "Kochi Master Plan 2040 (GCDA Master Plan)",
    "shortTitle": "Kochi Master Plan 2040",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Kerala",
      "city": "Kochi",
      "authority": "GCDA & Kochi Corporation"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2040",
    "version": "Kochi 2040 (Sanctioned 2023)",
    "status": "verified",
    "categories": [
      "land_use",
      "zoning",
      "far_fsi",
      "special_restriction"
    ],
    "source": {
      "authority": "Greater Cochin Development Authority (GCDA)",
      "officialUrl": "https://gcda.kerala.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2023-01-10",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master plan for Greater Cochin, Kakkanad Infopark, Marine Drive waterfront, and Fort Kochi heritage zone.",
    "keyProvisions": [
      "Vembanad Backwaters and Tidal Canal buffer: Strict CRZ-I/CRZ-II compliance and 10m-30m setbacks",
      "Kochi Water Metro and Kochi Metro TOD corridors with higher FAR up to 4.0",
      "Fort Kochi / Mattancherry Heritage conservation zone: Maximum building height 9.0m (G+1)",
      "Kakkanad IT Zone: High-density campus development with on-site stormwater retention ponds"
    ]
  },
  {
    "id": "DOC-PLAN-BHOPAL-MP-2031",
    "title": "Bhopal Master Plan 2031 (Bhopal Vikas Yojna 2031)",
    "shortTitle": "Bhopal Master Plan 2031",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Madhya Pradesh",
      "city": "Bhopal",
      "authority": "DTCP MP & BMC Bhopal"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2031",
    "version": "Amended 2022",
    "status": "verified",
    "categories": [
      "land_use",
      "zoning",
      "far_fsi",
      "special_restriction"
    ],
    "source": {
      "authority": "Directorate of Town & Country Planning (DTCP) Madhya Pradesh",
      "officialUrl": "https://mptownplan.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2015-08-25",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master plan for Bhopal capital city, Upper Lake (Bada Talab) catchment protection, and Hoshangabad Road growth corridor.",
    "keyProvisions": [
      "Bhoj Wetland (Upper Lake Ramsar Site): Mandatory 50m to 100m no-construction catchment buffer",
      "Hoshangabad Road & Kolar Road commercial growth corridors FAR up to 2.50",
      "Bhopal Metro TOD influence zone: Higher density mixed-use permissible",
      "Mandatory rainwater harvesting and tree preservation on all plots > 200 sq.m"
    ]
  },
  {
    "id": "DOC-PLAN-VIZAG-VMRDA-2041",
    "title": "Visakhapatnam Metropolitan Region Master Plan 2041 (VMRDA Plan)",
    "shortTitle": "Vizag VMRDA Master Plan 2041",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Andhra Pradesh",
      "city": "Visakhapatnam",
      "authority": "VMRDA & GVMC"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2041",
    "version": "VMRDA 2041 (Amended 2022)",
    "status": "verified",
    "categories": [
      "land_use",
      "zoning",
      "far_fsi",
      "special_restriction"
    ],
    "source": {
      "authority": "Visakhapatnam Metropolitan Region Development Authority (VMRDA)",
      "officialUrl": "https://vmrda.gov.in",
      "documentType": "Gazette",
      "publishedDate": "2021-03-12",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master plan governing Visakhapatnam, Rushikonda IT corridor, Bhogapuram Airport Aerocity, and coastal hillocks.",
    "keyProvisions": [
      "Coastal Beach Road: Mandatory CRZ buffer and cyclone-resilient structural parameters",
      "Rushikonda & Madhurawada IT Park Zone: Permissible FAR up to 3.50",
      "Kambalakonda Wildlife Sanctuary eco-sensitive 1km buffer: Heavy industrial ban",
      "Bhogapuram International Airport growth corridor TOD incentives"
    ]
  },
  {
    "id": "DOC-PLAN-NAGPUR-NMRDA",
    "title": "Nagpur Metropolitan Region Development Plan (NMRDA Plan)",
    "shortTitle": "Nagpur NMRDA Master Plan",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Nagpur",
      "authority": "NMRDA & NMC"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2032",
    "version": "NMRDA Sanctioned Plan (Amended 2023)",
    "status": "verified",
    "categories": [
      "land_use",
      "zoning",
      "far_fsi",
      "special_restriction"
    ],
    "source": {
      "authority": "Nagpur Metropolitan Region Development Authority (NMRDA)",
      "officialUrl": "https://nmrda.org",
      "documentType": "Gazette",
      "publishedDate": "2018-01-05",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Governs the logistics capital of central India, MIHAN SEZ (Multi-modal International Cargo Hub and Airport at Nagpur), and Metro corridors.",
    "keyProvisions": [
      "MIHAN SEZ & Multi-Modal Cargo Hub: Special Industrial and Aviation FAR up to 2.50",
      "Nagpur Metro Transit Corridor: TOD higher FSI up to 4.0 within 500m of metro stations",
      "Gorewada Zoo & International Bio-Park 500m eco-sensitive green buffer",
      "Outer Ring Road Logistics and Warehousing zone development standards"
    ]
  }
];

export const CITY_MASTER_PLAN_RULES: ByeLawRule[] = [
  {
    "id": "L3-DELHI-MPD-ZONE-01",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: City Master Plan (Delhi MPD-2021)",
    "jurisdiction": "Delhi (MPD-2021 Notified Commercial Streets)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Delhi (NCT)",
      "city": "Delhi",
      "authority": "Delhi Development Authority"
    },
    "category": "land_use",
    "categoryName": "Mixed Land Use & Street Notification",
    "title": "Delhi Master Plan MPD-2021 Mixed Land Use (MLU) & Commercial Street Notification",
    "clause": "Chapter 15, Clause 15.3 & Clause 15.7",
    "sourceDoc": "Master Plan for Delhi 2021 (MPD-2021) & Draft MPD-2041",
    "sourceUrl": "https://dda.gov.in",
    "documentYear": "2021",
    "version": "MPD-2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Regulates retail shops, professional offices, and banking activities on notified mixed-use and commercial streets in residential colonies.",
    "parameters": {
      "minRoadWidthMluM": 18.0,
      "minRoadWidthOtherM": 9.0,
      "conversionChargeMandatory": true
    },
    "detailedRequirements": [
      "Commercial/retail activity permitted on ground and upper floors only on streets officially notified by MCD/DDA under Mixed Use Regulations",
      "Minimum Right-of-Way (RoW) of 18 meters required in 'A' and 'B' category colonies; 13.5m in 'C' and 'D' colonies; 9m in 'E', 'F', 'G' colonies",
      "Payment of mandatory Mixed Use Conversion Charges and Parking Development Charges to Municipal Corporation",
      "Prohibited activities: Hazardous trade, polluting workshops, noisy industrial equipment, chemical storage"
    ]
  },
  {
    "id": "L3-MUMBAI-DCPR-TOD-01",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: City Master Plan (Mumbai DCPR-2034)",
    "jurisdiction": "Mumbai (MCGM / BMC)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Mumbai",
      "authority": "Municipal Corporation of Greater Mumbai"
    },
    "category": "far_fsi",
    "categoryName": "Transit Oriented Development (TOD) FSI",
    "title": "Mumbai DCPR-2034 Transit Oriented Development (TOD) Higher FSI within 500m of Metro",
    "clause": "Regulation 33(20)",
    "sourceDoc": "Development Control and Promotion Regulations for Greater Mumbai 2034 (DCPR-2034)",
    "sourceUrl": "https://www.mcgm.gov.in",
    "documentYear": "2034",
    "version": "DCPR-2034",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Incentive FSI permissible for plots located within 500 meters of Suburban Railway and Metro Rail stations on wide roads.",
    "parameters": {
      "todBufferM": 500,
      "minRoadWidthM": 18.0,
      "maxAchievableFsi": 4.0,
      "premiumShareUrbanFundPct": 50
    },
    "detailedRequirements": [
      "Plots within 500m walking radius of operational/under-construction Metro or Suburban Rail stations",
      "Access road width must be minimum 18.0 meters for full TOD FSI entitlement",
      "Maximum permissible FSI: Up to 4.00 for commercial and 3.00 for residential developments",
      "50% of the premium collected from TOD FSI is dedicated to the Mumbai Urban Transport Fund"
    ]
  },
  {
    "id": "L3-GGN-MP-SECTOR-01",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: City Master Plan (Gurugram 2031)",
    "jurisdiction": "Gurugram (GMDA / DTCP Sectors 1-115)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Haryana",
      "city": "Gurugram",
      "authority": "GMDA & DTCP Haryana"
    },
    "category": "setbacks",
    "categoryName": "Green Belt Buffer & Arterial Setbacks",
    "title": "Gurugram Master Plan 2031 Sector-Specific Density & Open Green Belt Setback",
    "clause": "Section 4.2 & Zonal Plan Norms",
    "sourceDoc": "Gurugram-Manesar Urban Complex Final Development Plan 2031 (Master Plan 2031)",
    "sourceUrl": "https://tcpharyana.gov.in",
    "documentYear": "2031",
    "version": "Master Plan 2031",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandatory non-construction green belt buffers along major expressways and arterial sector dividing roads.",
    "parameters": {
      "greenBeltDwarkaExpM": 30.0,
      "greenBeltSprM": 30.0,
      "sectorDivideRoWM": 60.0
    },
    "detailedRequirements": [
      "Dwarka Expressway (Northern Peripheral Road): Mandatory 30-meter non-construction green buffer on both flanks",
      "Southern Peripheral Road (SPR) & Golf Course Ext Road: Mandatory 30-meter to 50-meter green corridor",
      "No permanent building, ramp, or boundary wall permitted inside the statutory master plan green belt",
      "Infrastructure access (culverts, service lane connectivity) strictly governed by GMDA permission"
    ]
  },
  {
    "id": "L3-BLR-RMP-VALLEY-01",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: City Master Plan (Bengaluru RMP-2015)",
    "jurisdiction": "Bengaluru (BDA / BBMP)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Karnataka",
      "city": "Bengaluru",
      "authority": "Bangalore Development Authority"
    },
    "category": "environmental_regulations",
    "categoryName": "Valley Zone & Storm Water Drain (SWD) Buffers",
    "title": "Bengaluru Master Plan RMP-2015 Storm Water Drain (SWD) Primary & Secondary Valley Buffer",
    "clause": "Zonal Regulation 7.2",
    "sourceDoc": "Bengaluru Revised Master Plan (RMP 2015) & Draft Master Plan 2031",
    "sourceUrl": "https://bdabangalore.org",
    "documentYear": "2015",
    "version": "RMP-2015",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Strict environmental buffer zones around natural valleys, primary Rajakaluve drains, and secondary stormwater drains.",
    "parameters": {
      "primarySwdBufferM": 50.0,
      "secondarySwdBufferM": 25.0,
      "tertiarySwdBufferM": 15.0,
      "lakeBufferM": 30.0
    },
    "detailedRequirements": [
      "Primary Rajakaluve / Valley Canal: Minimum 50 meters buffer from center-line of drain where zero construction is permitted",
      "Secondary Stormwater Drain: Minimum 25 meters buffer on either side",
      "Tertiary Drain: Minimum 15 meters buffer",
      "Lake Water Bodies: Mandatory 30 meters all-around buffer from the notified lake boundary"
    ]
  },
  {
    "id": "L3-HYD-HMDA-TOD-01",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: City Master Plan (HMDA 2031)",
    "jurisdiction": "Hyderabad (HMDA / GHMC)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Telangana",
      "city": "Hyderabad",
      "authority": "HMDA & GHMC"
    },
    "category": "far_fsi",
    "categoryName": "Outer Ring Road (ORR) Growth Corridor",
    "title": "Hyderabad HMDA Master Plan Transit-Oriented Development & Radial Road Higher FAR",
    "clause": "Zonal Regulation 9.4",
    "sourceDoc": "Hyderabad Metropolitan Development Plan 2031 (HMDA Master Plan 2031)",
    "sourceUrl": "https://www.hmda.org.in",
    "documentYear": "2031",
    "version": "HMDA 2031",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Special growth corridor incentives and high-density development along the 158km Outer Ring Road (ORR) and radial arterial routes.",
    "parameters": {
      "orrCorridorWidthKm": 1.0,
      "minRoadWidthM": 30.0,
      "specialImpactFeeApplicable": true
    },
    "detailedRequirements": [
      "Plots within 1.0 km belt on either side of Outer Ring Road (ORR) eligible for intensive commercial and mixed-use development",
      "Access road width must be minimum 30.0 meters for mega multi-storey projects",
      "Special Growth Corridor development impact fee payable to HMDA for trunk infrastructure creation",
      "30m Full Tank Level (FTL) buffer strictly enforced for all irrigation tanks and water bodies"
    ]
  },
  {
    "id": "L3-NOIDA-MP-FAR-01",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: City Master Plan (NOIDA 2031)",
    "jurisdiction": "Noida (NOIDA Authority Sectors)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Noida",
      "authority": "New Okhla Industrial Development Authority"
    },
    "category": "far_fsi",
    "categoryName": "Group Housing & Commercial FAR",
    "title": "NOIDA Master Plan 2031 Group Housing & Commercial FAR / Purchasable FAR",
    "clause": "Clause 4.2 & Zonal Plan Slabs",
    "sourceDoc": "NOIDA Master Plan 2031 (Land Use & Zonal Development Regulations)",
    "sourceUrl": "https://noidaauthorityonline.in",
    "documentYear": "2031",
    "version": "NOIDA MP-2031",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Prescribes permissible FAR, purchasable FAR, and ground coverage across group housing and commercial sectors in Noida.",
    "parameters": {
      "groupHousingBaseFar": 2.75,
      "groupHousingPurchasableFar": 0.75,
      "groupHousingMaxFar": 3.5,
      "commercialMaxFar": 4.0,
      "plottedHeightMaxM": 15.0
    },
    "detailedRequirements": [
      "Group Housing Sectors (e.g. Sectors 74-79, 120-168): Base FAR 2.75 + Purchasable FAR 0.75 = Max FAR 3.50",
      "Commercial Sectors along Noida Expressway: Maximum FAR up to 4.00",
      "Plotted residential construction height strictly capped at 15.0m (Ground + 3 floors)",
      "Mandatory 20% to 30% soft green landscaping within the plot perimeter"
    ]
  },
  {
    "id": "L3-GNIDA-MP-FAR-01",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: City Master Plan (Greater Noida)",
    "jurisdiction": "Greater Noida (GNIDA Sectors)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Greater Noida",
      "authority": "Greater Noida Industrial Development Authority"
    },
    "category": "far_fsi",
    "categoryName": "Institutional & Group Housing FAR",
    "title": "Greater Noida Master Plan 2021/2041 Institutional & Residential High-Rise FAR",
    "clause": "Clause 5.1 & Schedule A",
    "sourceDoc": "Greater Noida Master Plan 2021 / Draft Master Plan 2041",
    "sourceUrl": "https://www.greaternoidaauthority.in",
    "documentYear": "2021",
    "version": "GNIDA Master Plan",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Governs group housing, IT tech zones, and university institutional campuses across Greater Noida and Greater Noida West.",
    "parameters": {
      "groupHousingMaxFar": 3.5,
      "institutionalTechFar": 2.0,
      "institutionalGroundCoveragePct": 30.0
    },
    "detailedRequirements": [
      "Group Housing plots on roads >= 24m: Maximum FAR up to 3.50 with purchasable FAR",
      "Institutional and IT Park campuses: Maximum ground coverage 30%, FAR 1.50 to 2.00",
      "Zero ground water extraction without CGWA prior clearance",
      "Mandatory on-site dual plumbing and tertiary STP recycling"
    ]
  },
  {
    "id": "L3-YEIDA-MP-SECTOR-01",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: City Master Plan (YEIDA 2031)",
    "jurisdiction": "Yamuna Expressway (YEIDA Sectors)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Greater Noida",
      "authority": "Yamuna Expressway Industrial Development Authority"
    },
    "category": "special_restriction",
    "categoryName": "Airport Vicinity & Industrial Corridor",
    "title": "Yamuna Expressway Master Plan Aerocity & Industrial Corridor Special FAR",
    "clause": "Clause 6.3 & Table 12",
    "sourceDoc": "Yamuna Expressway Master Development Plan 2031",
    "sourceUrl": "https://yamunaexpresswayauthority.com",
    "documentYear": "2031",
    "version": "YEIDA 2031",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Aviation height clearances and industrial cluster development regulations in the Jewar Airport influence zone.",
    "parameters": {
      "airportProximityCheck": true,
      "industrialGroundCoveragePct": 60.0,
      "industrialMaxFar": 1.5
    },
    "detailedRequirements": [
      "All sectors within 20km of Noida International Airport (Jewar) require AAI CCZM height verification",
      "Electronic Manufacturing Cluster (EMC) & Industrial plots: Ground coverage 60%, FAR 1.50",
      "100m green buffer along both sides of Yamuna Expressway main corridor",
      "Mandatory solar rooftop generation for all industrial and institutional allotments"
    ]
  },
  {
    "id": "L3-CHN-SMP-CMA-01",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: City Master Plan (Chennai SMP 2026)",
    "jurisdiction": "Chennai (CMDA / GCC)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Tamil Nadu",
      "city": "Chennai",
      "authority": "Chennai Metropolitan Development Authority"
    },
    "category": "zoning",
    "categoryName": "Continuous Building Area (CBA) vs Non-CBA",
    "title": "Chennai CMA Second Master Plan Continuous Building Area & Premium FSI",
    "clause": "Annexure XVIII & Rule 26",
    "sourceDoc": "Chennai Second Master Plan 2026 (CMDA SMP 2026)",
    "sourceUrl": "https://cmdachennai.gov.in",
    "documentYear": "2026",
    "version": "SMP 2026",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Distinguishes between historic core CBA areas and developing suburban CMA areas for setbacks and coverage.",
    "parameters": {
      "cbaZeroSideSetbackAllowed": true,
      "nonCbaOsrMandatoryThresholdSqM": 3000,
      "osrSurrenderPct": 10
    },
    "detailedRequirements": [
      "CBA Zones (George Town, Triplicane, Mylapore): Zero side setbacks permitted for non-high rise plots",
      "Non-CBA Developing Zones: Standard setbacks and mandatory 10% Open Space Reservation (OSR) for plots > 3,000 sqm",
      "Aquifer Recharge Area along Coastal ECR: Ground coverage capped at 40%, basements strictly prohibited",
      "Premium FSI up to 50% available on roads measuring 12m or wider"
    ]
  },
  {
    "id": "L3-JPR-MDP-ZONAL-01",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: City Master Plan (Jaipur MDP 2025)",
    "jurisdiction": "Jaipur (JDA Region)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Rajasthan",
      "city": "Jaipur",
      "authority": "Jaipur Development Authority"
    },
    "category": "special_restriction",
    "categoryName": "Eco-Sensitive Zone & Walled City Heritage",
    "title": "Jaipur Master Development Plan 2025 Eco-Sensitive Zone & Ecological Buffer",
    "clause": "MDP Chapter 6, Section 6.2",
    "sourceDoc": "Jaipur Master Development Plan 2025 (JDA MDP 2025)",
    "sourceUrl": "https://jda.urban.rajasthan.gov.in",
    "documentYear": "2025",
    "version": "MDP-2025",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Heritage preservation guidelines for the UNESCO Walled City and Aravalli mountain ecological protection zones.",
    "parameters": {
      "walledCityMaxHeightM": 12.0,
      "aravalliBufferCheck": true,
      "pinkFacadeMandatory": true
    },
    "detailedRequirements": [
      "Walled City Heritage Precinct: Maximum permissible height 12.0m; mandatory pink facade color and traditional jharokha styling",
      "Aravalli Plantation / Ecological Zone: Absolute prohibition on industrial, heavy commercial, or mining activity",
      "Betterment FAR available along JLN Marg, Tonk Road, and Ring Road growth corridors",
      "Mandatory RWH percolation structures for all scheme allotments > 225 sq.m"
    ]
  },
  {
    "id": "L3-AHM-CDP-TOD-01",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: City Master Plan (Ahmedabad AUDA)",
    "jurisdiction": "Ahmedabad (AUDA / AMC)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Gujarat",
      "city": "Ahmedabad",
      "authority": "AUDA & AMC"
    },
    "category": "far_fsi",
    "categoryName": "Transit Oriented Development (TOD) FSI",
    "title": "Ahmedabad AUDA CDP 2021 BRTS / Metro Transit Oriented Zone Maximum FSI 4.0",
    "clause": "AUDA Regulation 7.3",
    "sourceDoc": "Ahmedabad Comprehensive Development Plan 2021 / Draft Plan 2031 (AUDA CDP)",
    "sourceUrl": "https://www.auda.org.in",
    "documentYear": "2021",
    "version": "AUDA CDP 2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Permissible high-density FSI up to 4.00 within 200m of the Janmarg BRTS and Ahmedabad Metro rail corridors.",
    "parameters": {
      "todZoneBufferM": 200,
      "maxTodFsi": 4.0,
      "minRoadWidthM": 18.0
    },
    "detailedRequirements": [
      "Plots within 200 meters of BRTS or Metro corridor eligible for Chargeable FSI up to 4.00",
      "Access road width must be minimum 18.0 meters to avail maximum TOD FSI",
      "Mandatory public pedestrian arcade and 10% visitor parking on ground level",
      "Mandatory TPS (Town Planning Scheme) deduction and final plot sanction"
    ]
  },
  {
    "id": "L3-PUNE-PMRDA-SECTOR-01",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: City Master Plan (Pune PMRDA 2041)",
    "jurisdiction": "Pune (PMRDA / PMC / PCMC)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Pune",
      "authority": "PMRDA & PMC / PCMC"
    },
    "category": "far_fsi",
    "categoryName": "Ring Road Growth Corridor & IT Campuses",
    "title": "PMRDA Pune Ring Road & Growth Corridor Special FSI Provisions",
    "clause": "Zonal Regulation 11.2",
    "sourceDoc": "Pune Metropolitan Region Master Plan 2041 (PMRDA Plan)",
    "sourceUrl": "https://pmrda.gov.in",
    "documentYear": "2041",
    "version": "PMRDA 2041",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Special FSI and zoning regulations along Pune Ring Road, Hinjewadi IT zone, and Mula-Mutha river corridors.",
    "parameters": {
      "itCampusMaxFsi": 3.0,
      "blueFloodLineSetback": "Zero Construction",
      "redFloodLineSetback": "Regulated"
    },
    "detailedRequirements": [
      "Hinjewadi IT / Bio-Tech Parks: Permissible FSI up to 3.00 for eligible software and technology companies",
      "Mula-Mutha River Blue Flood Line: Absolute prohibition on any building construction",
      "Mula-Mutha River Red Flood Line: Construction restricted to non-residential and plinth height above flood level",
      "Western Ghats Hill Top / Hill Slope zones strictly protected as no-development green reserves"
    ]
  },
  {
    "id": "L3-LKO-MDP-HERITAGE-01",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: City Master Plan (Lucknow LDA)",
    "jurisdiction": "Lucknow (LDA Maha Yojna 2031)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Lucknow",
      "authority": "Lucknow Development Authority"
    },
    "category": "special_restriction",
    "categoryName": "Gomti Riverfront & Heritage Controls",
    "title": "Lucknow LDA Master Plan 2031 Heritage Zone Old City Architectural Controls",
    "clause": "Chapter 8, Clause 8.4",
    "sourceDoc": "Lucknow Master Plan 2031 (LDA Maha Yojna 2031)",
    "sourceUrl": "https://ldaonline.co.in",
    "documentYear": "2031",
    "version": "Maha Yojna 2031",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Gomti Riverfront 50m green buffer and monument vista protection in Husainabad and Old Lucknow precincts.",
    "parameters": {
      "gomtiRiverBufferM": 50.0,
      "heritageHeightLimitM": 12.5,
      "shaheedPathMaxFar": 3.0
    },
    "detailedRequirements": [
      "Gomti Riverfront: 50 meters non-construction green belt strictly enforced from the high flood level embankment",
      "Old City Heritage Precinct (Bada Imambara / Chhota Imambara vicinity): Maximum building height capped at 12.5m",
      "Shaheed Path commercial growth corridor: Base FAR 1.50 + Purchasable FAR up to 1.50 = Total 3.00",
      "Mandatory dual plumbing network and STP for all commercial complexes > 5,000 sq.m"
    ]
  },
  {
    "id": "L3-SURAT-SMP-DIAMOND-01",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: City Master Plan (Surat SUDA)",
    "jurisdiction": "Surat (SUDA / SMC)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Gujarat",
      "city": "Surat",
      "authority": "SUDA & SMC"
    },
    "category": "far_fsi",
    "categoryName": "DREAM City & TOD Slabs",
    "title": "Surat Master Plan 2035 High-Density Commercial & TOD Slabs",
    "clause": "SUDA Regulation 5.1",
    "sourceDoc": "Surat Master Plan 2035 (SUDA Master Plan)",
    "sourceUrl": "https://sudaonline.org",
    "documentYear": "2035",
    "version": "SUDA 2035",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "High-density FSI allowances up to 4.5 in Diamond Bourse DREAM city and Surat Metro transit zones.",
    "parameters": {
      "dreamCityMaxFsi": 4.5,
      "metroTodMaxFsi": 4.0,
      "tapiFloodBufferM": 30.0
    },
    "detailedRequirements": [
      "DREAM City (Diamond Research and Mercantile City) Special Zone: Permissible FSI up to 4.50",
      "Surat Metro TOD Corridor: Maximum FSI 4.00 on access roads >= 18m",
      "Tapi Riverfront buffer: Minimum 30 meters non-construction zone from river embankment",
      "Mandatory industrial effluent monitoring for textile processing units"
    ]
  },
  {
    "id": "L3-INDORE-MDP-SUPER-01",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: City Master Plan (Indore IDA)",
    "jurisdiction": "Indore (IDA / IMC)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Madhya Pradesh",
      "city": "Indore",
      "authority": "Indore Development Authority & IMC"
    },
    "category": "far_fsi",
    "categoryName": "Super Corridor IT & Commercial FSI",
    "title": "Indore Master Plan 2021 Super Corridor IT & Commercial FSI Provisions",
    "clause": "Section 5.3",
    "sourceDoc": "Indore Development Plan 2021 / Draft Master Plan 2035 (Indore Master Plan)",
    "sourceUrl": "https://idaindore.org",
    "documentYear": "2021",
    "version": "Indore MP 2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Development regulations governing the 12km Super Corridor connecting Indore Airport to Vijay Nagar and Major Arterial Roads.",
    "parameters": {
      "superCorridorBaseFar": 2.0,
      "superCorridorMaxFar": 3.0,
      "minRoadWidthM": 45.0
    },
    "detailedRequirements": [
      "Super Corridor IT & Mixed-Use plots: Base FAR 2.00 + Premium FAR up to 1.00 = Total 3.00",
      "Access road width must be minimum 45.0 meters (60m Super Corridor RoW)",
      "Mandatory ABPAS online scrutiny and RWH recharge certification",
      "Kanh riverfront rejuvenation green corridor setbacks strictly enforced"
    ]
  },
  {
    "id": "L3-NAVI-MUM-CIDCO-01",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: City Master Plan (CIDCO Navi Mumbai)",
    "jurisdiction": "Navi Mumbai (CIDCO Nodes & NAINA)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Navi Mumbai",
      "authority": "CIDCO & NMMC"
    },
    "category": "far_fsi",
    "categoryName": "Node-wise FAR & Airport Influence",
    "title": "CIDCO Navi Mumbai Master Plan Node-wise FAR and Coastal Margin Norms",
    "clause": "CIDCO DCR 14.2 & NAINA Regulations",
    "sourceDoc": "Navi Mumbai Development Plan (CIDCO Land Use & DCR)",
    "sourceUrl": "https://cidco.maharashtra.gov.in",
    "documentYear": "2020",
    "version": "Amended 2023",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Node-wise commercial and residential FAR, CRZ buffer integration, and NAINA airport influence zone regulations.",
    "parameters": {
      "baseFarCidco": 1.5,
      "maxFarNaina": 2.5,
      "crzClearanceRequired": true
    },
    "detailedRequirements": [
      "Residential nodes (Vashi, Kharghar, Ulwe): Base FAR 1.50 with TDR loading up to 2.00 on 15m+ roads",
      "NAINA Integrated Townships: Higher FSI up to 2.50 along multi-modal corridor",
      "Creek water body setbacks and mangrove 50m buffers strictly enforced",
      "Mandatory CIDCO development permission and occupancy transfer"
    ]
  },
  {
    "id": "L3-THANE-TMC-WATERFRONT-01",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: City Master Plan (Thane TMC)",
    "jurisdiction": "Thane (TMC Municipal Limits)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Thane",
      "authority": "Thane Municipal Corporation"
    },
    "category": "special_restriction",
    "categoryName": "Creek & SGNP Eco-Buffer",
    "title": "Thane City DP Creek & Waterfront Protection Buffer Zone",
    "clause": "TMC DCR Clause 16.3 & Reg 33(9)",
    "sourceDoc": "Thane City Revised Development Plan (TMC DP)",
    "sourceUrl": "https://thanecity.gov.in",
    "documentYear": "2021",
    "version": "TMC DP",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Thane Creek wetland protection zone, Sanjay Gandhi National Park 100m eco-sensitive buffer, and cluster redevelopment FSI.",
    "parameters": {
      "sgnpEcoBufferM": 100,
      "clusterRedevMaxFsi": 4.0,
      "ghodbunderTodFar": 3.0
    },
    "detailedRequirements": [
      "Sanjay Gandhi National Park (SGNP) / Yeoor Hills 100m buffer: Absolute ban on high-rise development",
      "Ghodbunder Road TOD Corridor: Higher FSI up to 3.00 on roads >= 24m",
      "Cluster redevelopment schemes under Regulation 33(9) with incentive FSI up to 4.00",
      "Thane Creek wetland protection and CRZ clearances mandatory"
    ]
  },
  {
    "id": "L3-CHD-CMP-HERITAGE-01",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: City Master Plan (Chandigarh CMP 2031)",
    "jurisdiction": "Chandigarh (Sectors 1-60)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Chandigarh (UT)",
      "city": "Chandigarh",
      "authority": "Chandigarh Administration"
    },
    "category": "special_restriction",
    "categoryName": "Heritage Grid & Sukhna Lake Catchment",
    "title": "Chandigarh Master Plan 2031 Sector 1-30 Strict Heritage Height & Facade Controls",
    "clause": "CMP Volume 1 Chapter 4",
    "sourceDoc": "Chandigarh Master Plan 2031 (CMP 2031 Heritage & Land Use)",
    "sourceUrl": "https://urbanplanning.chd.gov.in",
    "documentYear": "2031",
    "version": "CMP 2031",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Preserves the original Corbusian grid layout, Sukhna Lake eco-catchment, and Capitol Complex UNESCO buffer.",
    "parameters": {
      "sukhnaCatchmentBuffer": "Zero Construction",
      "capitolComplexVistaProtection": true,
      "maxSectorHeightFt": 35.0
    },
    "detailedRequirements": [
      "Sukhna Lake Catchment: Eco-sensitive zone with complete prohibition of new construction",
      "Capitol Complex Buffer: Strict vista protection preventing any tall structure obscuring heritage edifices",
      "Maximum height capped at 35 ft (G+2 storeys) in Phase I sectors (Sectors 1 to 30)",
      "Strict preservation of 7V road circulation hierarchy and green lung leisure valley"
    ]
  },
  {
    "id": "L3-KOLKATA-KMDA-FAR-01",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: City Master Plan (Kolkata KMDA)",
    "jurisdiction": "Kolkata (EM Bypass & New Town)",
    "jurisdictionScope": {
      "country": "India",
      "state": "West Bengal",
      "city": "Kolkata",
      "authority": "KMDA & KMC"
    },
    "category": "far_fsi",
    "categoryName": "High-Density Corridor FAR & Wetland Buffer",
    "title": "Kolkata KMDA Metropolitan Area High-Density Corridor FAR Norms",
    "clause": "KMDA Notification 124/UD",
    "sourceDoc": "Kolkata Metropolitan Area Development Plan (KMDA Master Plan)",
    "sourceUrl": "https://kmda.wb.gov.in",
    "documentYear": "2025",
    "version": "Amended 2021",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "High-density FAR up to 3.50 along EM Bypass and Rajarhat-New Town, East Kolkata Wetlands conservation buffer.",
    "parameters": {
      "emBypassMaxFar": 3.5,
      "wetlandsConversionAllowed": false,
      "fireNocThresholdM": 14.5
    },
    "detailedRequirements": [
      "EM Bypass and Rajarhat-New Town high-density commercial corridor: FAR up to 3.50 on roads >= 24m",
      "East Kolkata Wetlands (Ramsar Site): Strict statutory prohibition on land conversion or construction",
      "Heritage Conservation Zone in North/Central Kolkata with special advisory committee approval",
      "West Bengal Fire & Emergency Services NOC mandatory for buildings > 14.5m height"
    ]
  },
  {
    "id": "L3-FBD-MP-NEHARPAR-01",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: City Master Plan (Faridabad 2031)",
    "jurisdiction": "Faridabad (Neharpar Sectors 75-89)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Haryana",
      "city": "Faridabad",
      "authority": "DTCP Haryana & MCF"
    },
    "category": "far_fsi",
    "categoryName": "Greater Faridabad Density & FAR",
    "title": "Faridabad Master Plan 2031 Greater Faridabad (Neharpar) Sectors Density & FAR",
    "clause": "TCP Haryana Final Development Plan Clause 5.2",
    "sourceDoc": "Faridabad Development Plan 2031 (Master Plan 2031)",
    "sourceUrl": "https://tcpharyana.gov.in",
    "documentYear": "2031",
    "version": "Master Plan 2031",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Sector density controls, purchasable FAR, and Agra Canal green buffer in Greater Faridabad.",
    "parameters": {
      "groupHousingMaxDensity": 300,
      "baseFar": 1.75,
      "agraCanalBufferM": 30.0
    },
    "detailedRequirements": [
      "Neharpar Sectors 75-89 group housing density: Up to 300 persons/acre with FAR 1.75 to 2.25",
      "Agra Canal green buffer: Mandatory 30m non-construction green strip along canal banks",
      "Surajkund eco-sensitive zone setback: No mining or heavy construction within 5km radius",
      "Purchasable FAR permissible on all sector divide roads measuring 24m or more"
    ]
  },
  {
    "id": "L3-GZB-MP-HINDON-01",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: City Master Plan (Ghaziabad GDA)",
    "jurisdiction": "Ghaziabad (GDA Sectors & Indirapuram)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Ghaziabad",
      "authority": "Ghaziabad Development Authority"
    },
    "category": "special_restriction",
    "categoryName": "Hindon Floodplain Buffer & RRTS TOD",
    "title": "Ghaziabad GDA Master Plan 2031 Hindon River Bed Green Belt Prohibitions",
    "clause": "GDA Maha Yojna Clause 9.2",
    "sourceDoc": "Ghaziabad Master Plan 2031 (GDA Maha Yojna 2031)",
    "sourceUrl": "https://gdaonline.in",
    "documentYear": "2031",
    "version": "Maha Yojna 2031",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Hindon River floodplain non-construction green zone, Delhi-Meerut RapidX (RRTS) transit-oriented development FAR.",
    "parameters": {
      "hindonFloodplainBuffer": "Prohibited Zone",
      "rrtsTodMaxFar": 3.5,
      "rajNagarExtStpMandatory": true
    },
    "detailedRequirements": [
      "Hindon River floodplain: Complete ban on permanent construction within river floodway",
      "Delhi-Meerut RapidX (RRTS) Transit-Oriented Development corridor: Special FAR up to 3.50",
      "Raj Nagar Extension high-density group housing zone norms and mandatory STP recycling",
      "NH-9 / Delhi-Meerut Expressway commercial ribbon development standards"
    ]
  },
  {
    "id": "L3-KOCHI-MP-WATER-01",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: City Master Plan (Kochi GCDA)",
    "jurisdiction": "Kochi (GCDA Urban Area)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Kerala",
      "city": "Kochi",
      "authority": "GCDA & Kochi Corporation"
    },
    "category": "environmental_regulations",
    "categoryName": "Backwaters & Canal Buffer Setbacks",
    "title": "Kochi Master Plan 2040 Backwaters, Kayal & Canal 10m-30m Buffer Regulations",
    "clause": "GCDA Chapter 7 & CRZ Norms",
    "sourceDoc": "Kochi Master Plan 2040 (GCDA Master Plan)",
    "sourceUrl": "https://gcda.kerala.gov.in",
    "documentYear": "2040",
    "version": "Kochi 2040",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Water body setbacks along Vembanad Lake, tidal canals, and Water Metro transit corridors.",
    "parameters": {
      "backwaterBufferM": 30.0,
      "tidalCanalBufferM": 10.0,
      "waterMetroTodFar": 4.0
    },
    "detailedRequirements": [
      "Vembanad Backwaters and Tidal Canal buffer: Strict CRZ-I/CRZ-II compliance and 10m-30m setbacks",
      "Kochi Water Metro and Kochi Metro TOD corridors with higher FAR up to 4.00",
      "Fort Kochi / Mattancherry Heritage conservation zone: Maximum building height 9.0m (G+1)",
      "Kakkanad IT Zone: High-density campus development with on-site stormwater retention ponds"
    ]
  },
  {
    "id": "L3-BHOPAL-MP-BADA-TALAB-01",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: City Master Plan (Bhopal Master Plan)",
    "jurisdiction": "Bhopal (Bhoj Wetland Catchment)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Madhya Pradesh",
      "city": "Bhopal",
      "authority": "DTCP MP & BMC Bhopal"
    },
    "category": "environmental_regulations",
    "categoryName": "Upper Lake (Bada Talab) Catchment Buffer",
    "title": "Bhopal Master Plan 2031 Bhoj Wetland Upper Lake Catchment Protection Buffer",
    "clause": "Bhopal Vikas Yojna Chapter 5",
    "sourceDoc": "Bhopal Master Plan 2031 (Bhopal Vikas Yojna 2031)",
    "sourceUrl": "https://mptownplan.gov.in",
    "documentYear": "2031",
    "version": "Amended 2022",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Mandatory 50m to 100m no-construction catchment buffer around the Bhoj Wetland Ramsar site in Bhopal.",
    "parameters": {
      "lakeCatchmentBufferM": 50.0,
      "hoshangabadRoadFar": 2.5
    },
    "detailedRequirements": [
      "Bhoj Wetland (Upper Lake Ramsar Site): Mandatory 50m to 100m no-construction catchment buffer",
      "Hoshangabad Road & Kolar Road commercial growth corridors FAR up to 2.50",
      "Bhopal Metro TOD influence zone: Higher density mixed-use permissible",
      "Mandatory rainwater harvesting and tree preservation on all plots > 200 sq.m"
    ]
  },
  {
    "id": "L3-VIZAG-VMRDA-BEACH-01",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: City Master Plan (Vizag VMRDA)",
    "jurisdiction": "Visakhapatnam (Beach Road & IT Corridor)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Andhra Pradesh",
      "city": "Visakhapatnam",
      "authority": "VMRDA & GVMC"
    },
    "category": "special_restriction",
    "categoryName": "Coastal Beach Road & Rushikonda IT Zone",
    "title": "Visakhapatnam VMRDA Master Plan Beach Road CRZ & Cyclone Resilience",
    "clause": "VMRDA Master Plan Zonal Chapter 8",
    "sourceDoc": "Visakhapatnam Metropolitan Region Master Plan 2041 (VMRDA Plan)",
    "sourceUrl": "https://vmrda.gov.in",
    "documentYear": "2041",
    "version": "VMRDA 2041",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Coastal regulation zone parameters, cyclone-resistant structural requirements, and Rushikonda IT corridor FAR.",
    "parameters": {
      "coastalCrzCheck": true,
      "rushikondaItMaxFar": 3.5,
      "cycloneDesignCode": "IS 875 Part 3"
    },
    "detailedRequirements": [
      "Coastal Beach Road: Mandatory CRZ buffer and cyclone-resilient structural parameters (IS 875 Part 3 design wind speed 50 m/s)",
      "Rushikonda & Madhurawada IT Park Zone: Permissible FAR up to 3.50",
      "Kambalakonda Wildlife Sanctuary eco-sensitive 1km buffer: Heavy industrial ban",
      "Bhogapuram International Airport growth corridor TOD incentives"
    ]
  },
  {
    "id": "L3-NAGPUR-NMRDA-MIHAN-01",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: City Master Plan (Nagpur NMRDA)",
    "jurisdiction": "Nagpur (MIHAN SEZ & Metro Corridor)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Nagpur",
      "authority": "NMRDA & NMC"
    },
    "category": "far_fsi",
    "categoryName": "MIHAN SEZ & Metro TOD Slabs",
    "title": "Nagpur NMRDA Master Plan MIHAN SEZ Cargo Corridor & Metro TOD Slabs",
    "clause": "NMRDA DCR Regulation 9.2",
    "sourceDoc": "Nagpur Metropolitan Region Development Plan (NMRDA Plan)",
    "sourceUrl": "https://nmrda.org",
    "documentYear": "2032",
    "version": "NMRDA Sanctioned Plan",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Development regulations governing MIHAN SEZ cargo hub, Nagpur Metro TOD corridor, and Outer Ring Road logistics.",
    "parameters": {
      "mihanSezMaxFar": 2.5,
      "metroTodMaxFsi": 4.0,
      "gorewadaEcoBufferM": 500
    },
    "detailedRequirements": [
      "MIHAN SEZ & Multi-Modal Cargo Hub: Special Industrial and Aviation FAR up to 2.50",
      "Nagpur Metro Transit Corridor: TOD higher FSI up to 4.00 within 500m of metro stations",
      "Gorewada Zoo & International Bio-Park 500m eco-sensitive green buffer",
      "Outer Ring Road Logistics and Warehousing zone development standards"
    ]
  }
];

export const CITY_BYE_LAW_RULES = CITY_MASTER_PLAN_RULES;
