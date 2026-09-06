// Level 3: City Master Plans & Zonal Development Regulations (50 Indian Metros & Urban Hubs)

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
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Delhi Development Authority",
      "officialUrl": "https://dda.gov.in",
      "documentUrl": "https://dda.gov.in/master-plan-2021",
      "documentType": "Gazette",
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
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Municipal Corporation of Greater Mumbai",
      "officialUrl": "https://www.mcgm.gov.in",
      "documentUrl": "https://autodcr.mcgm.gov.in/DCPR2034.aspx",
      "documentType": "Gazette",
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
    "version": "Master Plan 2031 (Notified 2012, Amended 2024)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "GMDA & DTCP Haryana",
      "officialUrl": "https://gmda.gov.in",
      "documentUrl": "https://tcpharyana.gov.in/Development_Plan/Gurugram.pdf",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statutory regional urban development plan covering 338 sq.km across Sectors 1 to 115 of Gurugram and Manesar, regulating land uses, transport spines, and institutional zones.",
    "keyProvisions": [
      "Sector-wise zoning: Residential (Sectors 1-115), Commercial Belts along NH-48 and SPR/GPR",
      "High Density Residential corridors along Northern Peripheral Road (Dwarka Expressway) & Southern Peripheral Road",
      "Mandatory green buffer zones of 30m to 100m along National Highways, Expressways, and Revenue Rasta",
      "Integration with GMDA Comprehensive Mobility Plan and TOD Policy along Metro lines"
]
  },
  {
    "id": "DOC-PLAN-BLR-RMP-2031",
    "title": "Bengaluru Revised Master Plan 2031 (RMP-2031) / RMP-2015",
    "shortTitle": "Bengaluru RMP-2031",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Karnataka",
      "city": "Bengaluru",
      "authority": "Bangalore Development Authority"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2031",
    "version": "RMP-2015 Enforced (with 2024 Interim RMP-2031 Guidelines)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Bangalore Development Authority",
      "officialUrl": "https://bdabangalore.org",
      "documentUrl": "https://bdabangalore.org/master-plan",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statutory zoning and development code for the Bangalore Metropolitan Area, categorizing Ring I, Ring II, and Ring III planning districts, road width-linked FAR, and lake buffer zones.",
    "keyProvisions": [
      "Zoning classifications: Residential (Main/Mixed), Commercial (Central/Business/Mutation), Industrial, and Valley Zones",
      "National Green Tribunal (NGT) mandated 75m buffer from lake boundary and 50m/25m from primary/secondary Rajakaluves (stormwater drains)",
      "Road-width linked FAR matrix ranging from 1.50 (9m road) up to 3.25 (30m+ road)",
      "Premium FAR (33% over base FAR) notified under Karnataka KTCP Act Section 18B"
]
  },
  {
    "id": "DOC-PLAN-CHN-SMP-2026",
    "title": "Chennai Second Master Plan for CMA 2026 (SMP-2026) & Vision 2046",
    "shortTitle": "Chennai SMP-2026",
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
    "version": "Second Master Plan 2026 (with TNCDBR 2019 Harmonization)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Chennai Metropolitan Development Authority",
      "officialUrl": "https://www.cmdachennai.gov.in",
      "documentUrl": "https://www.cmdachennai.gov.in/smp_2026.html",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master planning instrument governing 1,189 sq.km Chennai Metropolitan Area (CMA), regulating Primary Residential, Mixed Residential, Commercial, IT Corridor, and Coastal Regulation Zones.",
    "keyProvisions": [
      "Zoning categories: Primary Residential (PRZ), Mixed Residential (MRZ), Commercial, Industrial, and Agricultural",
      "Special Economic Zones and IT Corridors along Old Mahabalipuram Road (OMR) and GST Road with Premium FSI incentives",
      "Coastal Regulation Zone (CRZ-II & CRZ-III) restrictions along Marina, Besant Nagar, and ECR coastal stretches",
      "Transit-Oriented Development along Chennai Metro Phase 1 & 2 alignments"
]
  },
  {
    "id": "DOC-PLAN-HYD-MP-2031",
    "title": "Hyderabad Metropolitan Development Authority Master Plan 2031 (HMDA Master Plan)",
    "shortTitle": "Hyderabad HMDA Master Plan 2031",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Telangana",
      "city": "Hyderabad",
      "authority": "Hyderabad Metropolitan Development Authority"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2031",
    "version": "Metropolitan Development Plan 2031 (Sanctioned 2013, Amended 2024)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Hyderabad Metropolitan Development Authority",
      "officialUrl": "https://www.hmda.org.in",
      "documentUrl": "https://www.hmda.org.in/master-plan/",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Comprehensive statutory master plan covering 7,257 sq.km HMDA jurisdiction, Outer Ring Road (ORR) Growth Corridor, HiTec City / Financial District IT zones, and Go-111 catchment areas.",
    "keyProvisions": [
      "Zoning categories: Residential (R1-R4), Commercial, Manufacturing, Peri-Urban, and Conservation Zones",
      "Special Development Zone along 1km belt on either side of 158km Outer Ring Road (ORR Growth Corridor)",
      "Hyderabad unlimited FSI policy governed by Telangana Building Rules G.O. Ms. 168 (road width and setback driven)",
      "Lake protection regulations under Hyderabad Lakes and Water Bodies Management Authority"
]
  },
  {
    "id": "DOC-PLAN-PUNE-DP-2027",
    "title": "Pune Revised Development Plan 2007-2027 (PMC DP & PMRDA DP)",
    "shortTitle": "Pune Development Plan 2027",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Pune",
      "authority": "Pune Municipal Corporation & PMRDA"
    },
    "documentType": "development_control_regulations",
    "documentPriority": "primary",
    "year": "2027",
    "version": "Pune Old Limits & 23 Merged Villages DP (Harmonized under UDCPR)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Pune Municipal Corporation & PMRDA",
      "officialUrl": "https://www.pmc.gov.in",
      "documentUrl": "https://pmc.gov.in/en/development-plan",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Development planning code for the Pune Municipal Corporation and Pune Metropolitan Region, governing gaothan limits, congested/non-congested zones, riverfronts, and Hill Top/Hill Slope zones.",
    "keyProvisions": [
      "Zoning: Congested Area (Gaothan), Non-congested Residential, Commercial, Bio-Diversity Park (BDP), and Hill Top / Hill Slope (HTHS)",
      "Harmonization with Maharashtra UDCPR 2020 for Base FSI, Premium FSI, and TDR calculation",
      "Mutha and Mula River Blue Flood Line (prohibited) and Red Flood Line (restricted) development controls",
      "TOD corridor policy along Pune Metro Line 1, Line 2, and Line 3 granting up to 4.00 FSI"
]
  },
  {
    "id": "DOC-PLAN-KOLKATA-KMDA-2025",
    "title": "Kolkata Metropolitan Area Development Plan (KMDA Master Plan)",
    "shortTitle": "Kolkata KMDA Master Plan",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "West Bengal",
      "city": "Kolkata",
      "authority": "Kolkata Metropolitan Development Authority"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2025",
    "version": "KMDA Master Plan (Harmonized with KMC Building Rules)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Kolkata Metropolitan Development Authority",
      "officialUrl": "https://www.kmda.wb.gov.in",
      "documentUrl": "https://kmda.wb.gov.in/masterplan",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master development plan covering 1,886 sq.km across Kolkata, Howrah, Salt Lake (Bidhannagar), New Town (HIDCO), and peri-urban municipalities along the Hooghly River.",
    "keyProvisions": [
      "Zoning: Urban Core (KMC area), Planned Satellite Townships (Rajarhat New Town, Salt Lake), and Peri-urban zones",
      "East Kolkata Wetlands (Ramsar Site) strict conservation and no-construction moratorium",
      "Metro Corridor FSI incentives along East-West and North-South corridors",
      "Hooghly Riverfront Development and Heritage Conservation precincts"
]
  },
  {
    "id": "DOC-PLAN-AHM-AUDA-2031",
    "title": "AUDA Comprehensive Development Plan 2021-2031 (Second Revised DP)",
    "shortTitle": "Ahmedabad AUDA Master Plan 2031",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Gujarat",
      "city": "Ahmedabad",
      "authority": "AUDA & AMC"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2031",
    "version": "Sanctioned Second Revised Development Plan 2031 (with GDCR)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "AUDA & AMC",
      "officialUrl": "https://www.auda.gov.in",
      "documentUrl": "https://auda.gov.in/cdp-2031/",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statutory development plan covering 1,866 sq.km Ahmedabad Urban Development Area, regulating Sabarmati Riverfront, BRTS/Metro Transit Corridors, and SP Ring Road growth zones.",
    "keyProvisions": [
      "Zoning: R1 (High Density Residential), R2 (Medium Density), R3 (Low Density/Peri-Urban), Commercial, and Logistics Zones",
      "Transit-Oriented Zone (TOZ): 200m on either side of BRTS and Metro corridors with up to 4.00 FSI",
      "Central Business District (CBD) along Ashram Road granting up to 5.40 FSI",
      "Affordable Housing Zone (AHZ) with subsidized chargeable FSI"
]
  },
  {
    "id": "DOC-PLAN-SURAT-SUDA-2035",
    "title": "Surat Comprehensive Development Plan 2035 (SUDA Master Plan 2035)",
    "shortTitle": "Surat SUDA Master Plan 2035",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Gujarat",
      "city": "Surat",
      "authority": "SUDA & Surat Municipal Corporation"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2035",
    "version": "SUDA Revised DP 2035 (Sanctioned 2021)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "SUDA & Surat Municipal Corporation",
      "officialUrl": "https://www.sudaonline.org",
      "documentUrl": "https://sudaonline.org/development-plan/",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master development plan for Surat metropolitan region covering 722 sq.km, diamond & textile industrial clusters, Tapi Riverfront, and Hazira Port industrial belt.",
    "keyProvisions": [
      "Zoning: Residential (R1/R2), Commercial, Industrial (Textile/Diamond Parks), Coastal/Port, and Eco-Agricultural Zones",
      "High-Density Transit Corridors along Surat Metro Rail and BRTS corridors",
      "Tapi River Flood Hazard development control line and embankment setbacks",
      "DREAM City (Diamond Research and Mercantile City) special development regime"
]
  },
  {
    "id": "DOC-PLAN-JAIPUR-JDA-2025",
    "title": "Jaipur Master Development Plan 2025 (JDA Master Plan 2025)",
    "shortTitle": "Jaipur JDA Master Plan 2025",
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
    "version": "Master Development Plan 2025 (Sanctioned 2011, Amended 2024)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Jaipur Development Authority",
      "officialUrl": "https://jda.urban.rajasthan.gov.in",
      "documentUrl": "https://jda.urban.rajasthan.gov.in/content/raj/udh/jda-jaipur/en/citizen-services/master-plan-2025.html",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statutory planning framework for 2,940 sq.km Jaipur Region (U1 to U4 urbanisable areas), Walled City Heritage Precincts, Ring Road Corridor, and ecological zones.",
    "keyProvisions": [
      "Zoning: Urban Area (U1-U4), Rural Ecological Zone, Walled City Special Heritage Zone, and Institutional Hubs",
      "Walled City (UNESCO World Heritage Site) height caps and architectural facade elevation controls",
      "Jaipur Ring Road 360m Transport and Development Corridor granting higher FAR",
      "Rainwater harvesting and desert water conservation mandatory mandates"
]
  },
  {
    "id": "DOC-PLAN-NOIDA-MP-2031",
    "title": "Noida Master Plan 2031 (New Okhla Industrial Development Area)",
    "shortTitle": "Noida Master Plan 2031",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Noida",
      "authority": "New Okhla Industrial Development Authority (NOIDA)"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2031",
    "version": "Noida Master Plan 2031 (Approved & Enforced)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "New Okhla Industrial Development Authority (NOIDA)",
      "officialUrl": "https://noidaauthorityonline.in",
      "documentUrl": "https://noidaauthorityonline.in/en/noida-master-plan",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master plan governing 20,316 hectares across 168 planned sectors, Expressway Commercial Hubs, Institutional belts, and Yamuna River floodplain buffers.",
    "keyProvisions": [
      "Sectoral zoning: Group Housing (Sectors 45, 50, 74-79, 137, 143-168), Institutional, IT/ITES, and Commercial Sectors",
      "Purchasable FAR policy allowing up to 0.75 additional FAR on major arterial roads (24m+ ROW)",
      "Noida-Greater Noida Expressway high-density commercial/IT corridor",
      "Okhla Bird Sanctuary and Yamuna River Eco-Sensitive Zone construction restrictions"
]
  },
  {
    "id": "DOC-PLAN-GRNOIDA-MP-2021-41",
    "title": "Greater Noida Master Plan 2021 & Draft Master Plan 2041",
    "shortTitle": "Greater Noida Master Plan",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Greater Noida",
      "authority": "Greater Noida Industrial Development Authority (GNIDA)"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2041",
    "version": "GNIDA Master Plan 2021 (with Phase-II Master Plan 2041 Extensions)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Greater Noida Industrial Development Authority (GNIDA)",
      "officialUrl": "https://www.greaternoidaauthority.in",
      "documentUrl": "https://www.greaternoidaauthority.in/master-plan",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master development plan governing 38,000 hectares across Greater Noida Phase 1 and Phase 2 (Greater Noida West / Noida Extension), knowledge parks, and industrial corridors.",
    "keyProvisions": [
      "Zoning: Knowledge Parks I-V, Residential Sectors (Alpha-Zeta, Ecotech, Techzone), Commercial, and Logistics hubs",
      "High-density group housing corridors in Greater Noida West (Noida Extension) along 60m and 130m arterial roads",
      "Hindon River and Yamuna River floodplain ecological restrictions",
      "Purchasable FAR and Green Building FAR incentives (5% bonus for IGBC/GRIHA Gold/Platinum)"
]
  },
  {
    "id": "DOC-PLAN-YEIDA-MP-2031",
    "title": "Yamuna Expressway Master Plan 2031 (YEIDA Master Plan 2031)",
    "shortTitle": "YEIDA Master Plan 2031",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Yamuna Expressway",
      "authority": "Yamuna Expressway Industrial Development Authority"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2031",
    "version": "YEIDA Master Plan 2031 (Phase 1 & Noida International Airport Influence Zone)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Yamuna Expressway Industrial Development Authority",
      "officialUrl": "https://yamunaexpresswayauthority.com",
      "documentUrl": "https://yamunaexpresswayauthority.com/master-plan-2031/",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Apex statutory master plan governing 2,688 sq.km across Gautam Buddha Nagar, Bulandshahr, Aligarh, and Mathura, surrounding Noida International Airport (Jewar).",
    "keyProvisions": [
      "Zoning: Noida International Airport Zone (Jewar), Electronic City, Medical Device Park, Film City, and Aerotropolis",
      "Noida International Airport Obstacle Limitation Surfaces (OLS) and Height Zoning limits",
      "High-density commercial and hospitality corridors along the 165km Yamuna Expressway",
      "Integrated Industrial Township (IIT) and Logistics Multi-Modal Hubs"
]
  },
  {
    "id": "DOC-PLAN-LUCKNOW-MP-2031",
    "title": "Lucknow Master Plan 2031 (Mahayojna 2031)",
    "shortTitle": "Lucknow Master Plan 2031",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Lucknow",
      "authority": "Lucknow Development Authority (LDA)"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2031",
    "version": "Lucknow Mahayojna 2031 (Approved & Notified)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Lucknow Development Authority (LDA)",
      "officialUrl": "https://www.ldaonline.co.in",
      "documentUrl": "https://ldaonline.co.in/master-plan/",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master development plan for Uttar Pradesh capital city covering 1,178 sq.km, Gomti Riverfront, Shaheed Path growth corridor, Amar Shaheed Path commercial zones, and heritage zones.",
    "keyProvisions": [
      "Zoning: Old City Heritage Precincts, Gomti Nagar & Gomti Nagar Extension, Shaheed Path, and Outer Ring Road",
      "Gomti Riverfront Development buffer and flood protection zones",
      "Transit-Oriented Development along Lucknow Metro North-South and East-West corridors",
      "Special Development Zones along Sultanpur Road, Raebareli Road, and Kanpur Road"
]
  },
  {
    "id": "DOC-PLAN-KANPUR-MP-2031",
    "title": "Kanpur Master Plan 2031 (Mahayojna 2031)",
    "shortTitle": "Kanpur Master Plan 2031",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Kanpur",
      "authority": "Kanpur Development Authority (KDA)"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2031",
    "version": "Kanpur Mahayojna 2031 (Approved 2022)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Kanpur Development Authority (KDA)",
      "officialUrl": "https://kda.co.in",
      "documentUrl": "https://kda.co.in/master-plan-2031/",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master plan governing 890 sq.km Kanpur metropolitan region, Ganga River pollution buffer zones, Leather Industrial clusters (Jajmau), and Metro Line 1 & 2 corridors.",
    "keyProvisions": [
      "Zoning: Urban Core, Industrial (Tannery/Textile clusters), Ganga Riverfront, and Trans-Ganga City",
      "Ganga River 200m buffer zone development restrictions under NMCG / NGT mandates",
      "TOD corridor policy along Kanpur Metro alignments",
      "Leather cluster pollution containment and zero liquid discharge mandates"
]
  },
  {
    "id": "DOC-PLAN-VARANASI-MP-2031",
    "title": "Varanasi Master Plan 2031 (Mahayojna 2031)",
    "shortTitle": "Varanasi Master Plan 2031",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Varanasi",
      "authority": "Varanasi Development Authority (VDA)"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2031",
    "version": "Varanasi Mahayojna 2031 (Sanctioned & Notified)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Varanasi Development Authority (VDA)",
      "officialUrl": "https://vdavaranasi.com",
      "documentUrl": "https://vdavaranasi.com/master-plan-2031/",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statutory planning framework for the ancient cultural capital covering 502 sq.km, Kashi Vishwanath Special Heritage Zone, Ganga Ghats, Sarnath Heritage Zone, and Ring Road growth corridors.",
    "keyProvisions": [
      "Ganga Ghats Conservation Zone: 200m buffer from riverbank with strict height and construction prohibitions",
      "Kashi Vishwanath and Sarnath Heritage Zones: Strict height limits (max 8.5m to 12.0m) and traditional architectural facade controls",
      "New Varanasi Urban Extension and Ring Road Transport Corridor",
      "Pilgrimage tourism and hospitality infrastructure zones"
]
  },
  {
    "id": "DOC-PLAN-AGRA-MP-2031",
    "title": "Agra Master Plan 2031 & Taj Trapezium Zone (TTZ) Regulations",
    "shortTitle": "Agra Master Plan 2031 (TTZ)",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Agra",
      "authority": "Agra Development Authority (ADA)"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2031",
    "version": "Agra Mahayojna 2031 (Harmonized with TTZ Supreme Court Directives)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Agra Development Authority (ADA)",
      "officialUrl": "https://adaagra.in",
      "documentUrl": "https://adaagra.in/master-plan/",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master plan governing 520 sq.km Agra Urban Area, Taj Mahal 500m security buffer, Taj Trapezium Zone (TTZ) 10,400 sq.km environmental protection limits, and Yamuna Riverfront.",
    "keyProvisions": [
      "Taj Trapezium Zone (TTZ): Complete ban on coal/coke industries, strict air pollution emission caps",
      "Taj Mahal 500m Security Zone: Absolute prohibition of any new commercial or heavy construction",
      "ASI 100m Prohibited / 200m Regulated zones surrounding Agra Fort, Fatehpur Sikri, and Itmad-ud-Daulah",
      "Eco-City corridors along Agra-Lucknow Expressway and Yamuna Expressway"
]
  },
  {
    "id": "DOC-PLAN-PRAYAGRAJ-MP-2031",
    "title": "Prayagraj Master Plan 2031 (Mahayojna 2031)",
    "shortTitle": "Prayagraj Master Plan 2031",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Prayagraj",
      "authority": "Prayagraj Development Authority (PDA)"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2031",
    "version": "Prayagraj Mahayojna 2031 (Approved & Notified)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Prayagraj Development Authority (PDA)",
      "officialUrl": "https://pdaprayagraj.in",
      "documentUrl": "https://pdaprayagraj.in/master-plan-2031/",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master development plan covering 625 sq.km Prayagraj metropolitan area, Sangam Kumbh Mela floodplains, Yamuna & Ganga riverfront buffers, and Naini industrial zones.",
    "keyProvisions": [
      "Triveni Sangam Kumbh Mela Area: Strict seasonal temporary utilization and permanent construction prohibition",
      "Ganga & Yamuna Riverfront 200m buffer zones under National Mission for Clean Ganga (NMCG)",
      "Civil Lines heritage commercial grid development controls",
      "Saraswati Hi-Tech City and Naini Industrial growth corridors"
]
  },
  {
    "id": "DOC-PLAN-GZB-MP-2031",
    "title": "Ghaziabad Master Plan 2031 (GDA Master Plan 2031)",
    "shortTitle": "Ghaziabad Master Plan 2031",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Ghaziabad",
      "authority": "Ghaziabad Development Authority (GDA)"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2031",
    "version": "Ghaziabad Master Plan 2031 (Approved 2023)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Ghaziabad Development Authority (GDA)",
      "officialUrl": "https://gdaghaziabad.in",
      "documentUrl": "https://gdaghaziabad.in/master-plan-2031/",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master plan governing 522 sq.km Ghaziabad NCR region, Delhi-Meerut Expressway corridor, Delhi-Meerut RRTS Transit Influence Zones, and Hindon River buffer.",
    "keyProvisions": [
      "Zoning: Indirapuram, Vaishali, Kaushambi, Crossings Republik, Raj Nagar Extension, and Loni zones",
      "RRTS (Regional Rapid Transit System) Influence Zone: Special TOD regulations with FAR up to 4.00 within 1.5km of RRTS stations",
      "Delhi-Meerut Expressway high-density commercial/logistics belt",
      "Hindon River Floodplain eco-conservation zone"
]
  },
  {
    "id": "DOC-PLAN-FBD-DP-2031",
    "title": "Faridabad Final Development Plan 2031 (Faridabad Master Plan)",
    "shortTitle": "Faridabad Master Plan 2031",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Haryana",
      "city": "Faridabad",
      "authority": "DTCP Haryana & HSVP"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2031",
    "version": "Faridabad Master Plan 2031 (Sanctioned 2014, Amended 2024)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "DTCP Haryana & HSVP",
      "officialUrl": "https://tcpharyana.gov.in",
      "documentUrl": "https://tcpharyana.gov.in/Development_Plan/Faridabad.pdf",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statutory regional urban development plan covering 343 sq.km across Sectors 1 to 150 of Faridabad, Greater Faridabad (Neharpar), and Yamuna River floodplain.",
    "keyProvisions": [
      "Sectoral zoning: Residential (Old Faridabad & Greater Faridabad Neharpar), Industrial, and Commercial belts along Mathura Road (NH-19)",
      "Delhi-Faridabad-Ballabhgarh Metro corridor TOD incentives",
      "Aravalli Hills eco-conservation zone restrictions under Punjab Land Preservation Act (PLPA)",
      "Yamuna River floodplain 500m conservation buffer"
]
  },
  {
    "id": "DOC-PLAN-PANCHKULA-MP-2031",
    "title": "Panchkula Urban Complex Final Development Plan 2031",
    "shortTitle": "Panchkula Master Plan 2031",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Haryana",
      "city": "Panchkula",
      "authority": "DTCP Haryana & HSVP"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2031",
    "version": "Panchkula Master Plan 2031 (Sanctioned & Enforced)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "DTCP Haryana & HSVP",
      "officialUrl": "https://tcpharyana.gov.in",
      "documentUrl": "https://tcpharyana.gov.in/Development_Plan/Panchkula.pdf",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master development plan covering 12,700 hectares across Panchkula, Pinjore-Kalka Urban Complex, Mansa Devi Complex, and Ghaggar River catchment.",
    "keyProvisions": [
      "Zoning: Low-to-Medium density residential sectors, Mansa Devi Shrine Special Area, and IT Park Panchkula",
      "Ghaggar River flood protection buffer and Shivalik Foothills eco-sensitive zone controls",
      "Pinjore-Kalka Heritage and Tourism Special Development Zone",
      "Mansa Devi Complex architectural height caps (max 12m) to protect temple sightlines"
]
  },
  {
    "id": "DOC-PLAN-CHD-CMP-2031",
    "title": "Chandigarh Master Plan 2031 (CMP-2031)",
    "shortTitle": "Chandigarh Master Plan 2031",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Chandigarh",
      "city": "Chandigarh",
      "authority": "Chandigarh Administration"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2031",
    "version": "CMP-2031 (Approved by MHA / UT Administration)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Chandigarh Administration",
      "officialUrl": "https://chandigarh.gov.in",
      "documentUrl": "https://chandigarh.gov.in/master-plan-2031",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master planning document safeguarding Le Corbusier's heritage grid, Capitol Complex UNESCO World Heritage Site, Sukhna Lake catchment, and Sectors 1 to 60.",
    "keyProvisions": [
      "Phase I (Sectors 1-30 Heritage Grid) and Phase II (Sectors 31-47) strict architectural controls",
      "UNESCO World Heritage Buffer: Capitol Complex visual cone protection and ban on high-rises in northern sectors",
      "Sukhna Lake Eco-Sensitive Zone: Ban on construction in catchment area under High Court directives",
      "Prohibition of apartmentalization of plotted residential bungalows in Sectors 1 to 30"
]
  },
  {
    "id": "DOC-PLAN-MOHALI-GMADA-2031",
    "title": "SAS Nagar (Mohali) Master Plan 2031 (GMADA Master Plan)",
    "shortTitle": "Mohali GMADA Master Plan 2031",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Punjab",
      "city": "Mohali (SAS Nagar)",
      "authority": "GMADA & Punjab Housing and Urban Development"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2031",
    "version": "SAS Nagar Master Plan 2031 (Sanctioned & Amended)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "GMADA & Punjab Housing and Urban Development",
      "officialUrl": "https://gmada.gov.in",
      "documentUrl": "https://gmada.gov.in/master-plan-sas-nagar",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master development plan governing 118 planned sectors of SAS Nagar Mohali, Aerocity, IT City, Knowledge City, and Chandigarh International Airport influence zone.",
    "keyProvisions": [
      "Zoning: Sectors 66-82 (IT/Knowledge City), Sectors 83-115 (Residential & Mixed-Use), Aerocity & IT City",
      "Chandigarh International Airport (Shaheed Bhagat Singh Airport) Height Restriction & CCZM Zone",
      "PR-7 (Airport Road) and PR-4 high-density commercial/hospitality growth corridors",
      "Purchasable FAR and Group Housing density norms under Punjab Building Rules"
]
  },
  {
    "id": "DOC-PLAN-LUDHIANA-GLADA-2031",
    "title": "Ludhiana Master Plan 2031 (GLADA Master Plan 2031)",
    "shortTitle": "Ludhiana Master Plan 2031",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Punjab",
      "city": "Ludhiana",
      "authority": "GLADA & Municipal Corporation Ludhiana"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2031",
    "version": "Ludhiana Master Plan 2031 (Sanctioned 2018, Amended)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "GLADA & Municipal Corporation Ludhiana",
      "officialUrl": "https://glada.gov.in",
      "documentUrl": "https://glada.gov.in/master-plan",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master development plan for Punjab industrial hub covering 650 sq.km, Focal Points, Textile/Hosiery industrial zones, Buddha Nullah rejuvenation corridor, and Ferozepur Road commercial belt.",
    "keyProvisions": [
      "Zoning: Industrial Core (Focal Points), Residential Sectors, Mixed-use Commercial along Ferozepur Road (NH-5)",
      "Buddha Nullah Rejuvenation Zone: 50m green buffer and complete ban on industrial effluent dumping",
      "Purchasable FAR on designated arterial corridors (NH-5, Southern Bypass)",
      "Groundwater extraction restrictions in notified Central Ground Water Authority dark zones"
]
  },
  {
    "id": "DOC-PLAN-AMRITSAR-ADA-2031",
    "title": "Amritsar Master Plan 2031 (ADA Master Plan 2031)",
    "shortTitle": "Amritsar Master Plan 2031",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Punjab",
      "city": "Amritsar",
      "authority": "Amritsar Development Authority (ADA)"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2031",
    "version": "Amritsar Master Plan 2031 (Approved & Notified)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Amritsar Development Authority (ADA)",
      "officialUrl": "https://adaamritsar.gov.in",
      "documentUrl": "https://adaamritsar.gov.in/master-plan",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master plan governing 512 sq.km Amritsar metropolitan region, Sri Harmandir Sahib (Golden Temple) Walled City Heritage Precinct, GT Road corridor, and Sri Guru Ram Dass Jee Airport zone.",
    "keyProvisions": [
      "Golden Temple Heritage Precinct: Walled City special development zone with strict height limits (max 11.5m)",
      "Sri Guru Ram Dass Jee International Airport (ATQ) Obstacle Limitation Surfaces (OLS)",
      "GT Road (NH-3) and Amritsar-Attari Bypass high-density commercial/hospitality belts",
      "Pilgrimage tourism and hotel infrastructure zones"
]
  },
  {
    "id": "DOC-PLAN-INDORE-IDA-2021-35",
    "title": "Indore Development Plan 2021 & Draft Master Plan 2035 (IDA Master Plan)",
    "shortTitle": "Indore Development Plan 2035",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Madhya Pradesh",
      "city": "Indore",
      "authority": "Indore Development Authority & T&CP MP"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2035",
    "version": "Indore Development Plan 2021 Enforced (with Draft 2035 Provisions)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Indore Development Authority & T&CP MP",
      "officialUrl": "https://www.idaindore.org",
      "documentUrl": "https://idaindore.org/master-plan/",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master planning framework governing 1,013 sq.km Indore Planning Area, Super Corridor, AB Road BRTS transit spine, Pithampur Industrial Corridor, and Khan Riverfront.",
    "keyProvisions": [
      "Zoning: Residential Schemes (TPS 1-10), Super Corridor IT/Commercial Hub, AB Road Commercial Belt, and Logistics Parks",
      "Super Corridor (75m ROW) granting high FAR up to 3.00 for IT, financial, and educational institutions",
      "Indore BRTS / Metro Transit Corridor TOD incentives",
      "Khan River and Saraswati River rejuvenation green buffer zones"
]
  },
  {
    "id": "DOC-PLAN-BHOPAL-TCP-2031",
    "title": "Bhopal Development Plan 2031 (Master Plan 2031)",
    "shortTitle": "Bhopal Master Plan 2031",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Madhya Pradesh",
      "city": "Bhopal",
      "authority": "Town & Country Planning MP & Bhopal Municipal Corporation"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2031",
    "version": "Bhopal Development Plan 2031 (Sanctioned & Enforced)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Town & Country Planning MP & Bhopal Municipal Corporation",
      "officialUrl": "https://bhopalplan.mp.gov.in",
      "documentUrl": "https://tcp.mp.gov.in/master-plans/bhopal",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master plan governing 813 sq.km Bhopal Capital Region, Upper Lake (Bhoj Wetland Ramsar Site), Kaliasot River, Hoshangabad Road commercial corridor, and Metro Phase 1.",
    "keyProvisions": [
      "Bhoj Wetland (Upper Lake & Lower Lake) Ramsar Site: Strict 50m Full Tank Level (FTL) no-construction buffer",
      "Kaliasot and Kerwa Dam catchment ecological protection zones",
      "Hoshangabad Road (NH-46) high-density commercial/mixed-use corridor",
      "Bhopal Metro Line 1 & 2 Transit-Oriented Development zones"
]
  },
  {
    "id": "DOC-PLAN-KOCHI-GCDA-2040",
    "title": "Kochi City Master Plan 2040 (GCDA Master Plan 2040)",
    "shortTitle": "Kochi Master Plan 2040",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Kerala",
      "city": "Kochi",
      "authority": "Greater Cochin Development Authority (GCDA)"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2040",
    "version": "Kochi Master Plan 2040 (Sanctioned by Kerala Govt 2023)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Greater Cochin Development Authority (GCDA)",
      "officialUrl": "https://gcda.kerala.gov.in",
      "documentUrl": "https://gcda.kerala.gov.in/masterplan",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master development plan covering 369 sq.km Kochi Metropolitan Region, Vembanad Lake CRZ-I/II tidal zones, Kochi Metro TOD corridors, Water Metro terminals, and Kakkanad Infopark IT hub.",
    "keyProvisions": [
      "CRZ-II & CRZ-III Coastal Regulation Zone norms along backwaters, Vembanad Lake, and Arabian Sea",
      "Transit-Oriented Development along Kochi Metro Aluva-Thripunithura corridor and Water Metro routes",
      "Kakkanad IT SEZ / Infopark and SmartCity high-density IT zoning",
      "Mangalavanam Bird Sanctuary eco-sensitive buffer zone"
]
  },
  {
    "id": "DOC-PLAN-TRIVANDRUM-TRIDA-2040",
    "title": "Thiruvananthapuram Master Plan 2040 (TRIDA Master Plan)",
    "shortTitle": "Thiruvananthapuram Master Plan 2040",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Kerala",
      "city": "Thiruvananthapuram",
      "authority": "TRIDA & Town & Country Planning Kerala"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2040",
    "version": "Thiruvananthapuram Master Plan 2040 (Sanctioned 2023)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "TRIDA & Town & Country Planning Kerala",
      "officialUrl": "https://trida.kerala.gov.in",
      "documentUrl": "https://trida.kerala.gov.in/master-plan/",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master plan governing 215 sq.km Kerala State Capital, Technopark IT corridor, Vizhinjam International Seaport hinterland, Sree Padmanabhaswamy Temple Heritage Zone, and coastal belts.",
    "keyProvisions": [
      "Sree Padmanabhaswamy Temple Heritage Precinct: Strict height ceiling (max 10m) within Fort area",
      "Vizhinjam Port Special Logistics & Maritime Development Corridor",
      "Technopark Phase 1-4 IT and high-tech manufacturing zone",
      "Kovalam & Shanghumugham coastal tourism regulation zones"
]
  },
  {
    "id": "DOC-PLAN-VIZAG-VMRDA-2041",
    "title": "Visakhapatnam Metropolitan Region Master Plan 2041 (VMRDA Master Plan)",
    "shortTitle": "Visakhapatnam VMRDA Master Plan 2041",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Andhra Pradesh",
      "city": "Visakhapatnam",
      "authority": "Visakhapatnam Metropolitan Region Development Authority"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2041",
    "version": "VMRDA Master Plan 2041 (Sanctioned 2021)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Visakhapatnam Metropolitan Region Development Authority",
      "officialUrl": "https://vmrda.gov.in",
      "documentUrl": "https://vmrda.gov.in/master-plan-2041/",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master development plan covering 4,873 sq.km Visakhapatnam Metropolitan Region, Beach Road CRZ corridor, Steel Plant / Pharma City industrial belts, and Bhogapuram Airport zone.",
    "keyProvisions": [
      "Zoning: Residential, Commercial, Heavy Industrial (Pharma City / Steel Plant), Coastal Tourism, and Eco-Conservation",
      "Coastal Regulation Zone (CRZ-II & CRZ-III) along 130km coastline from Rushikonda to Bheemunipatnam",
      "Bhogapuram Greenfield International Airport Obstacle Limitation Surfaces (OLS)",
      "Hill slope conservation along Eastern Ghats / Kailasagiri hill ranges"
]
  },
  {
    "id": "DOC-PLAN-VIJAYAWADA-APCRDA-2031",
    "title": "Amaravati & VGTM Master Plan 2031 (APCRDA / VGTMUDA Master Plan)",
    "shortTitle": "Amaravati & Vijayawada APCRDA Master Plan",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Andhra Pradesh",
      "city": "Vijayawada",
      "authority": "APCRDA & VGTMUDA"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2031",
    "version": "Amaravati Capital City Master Plan & VGTM Master Plan",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "APCRDA & VGTMUDA",
      "officialUrl": "https://crda.ap.gov.in",
      "documentUrl": "https://crda.ap.gov.in/master-plan/",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master planning instrument governing 8,603 sq.km Amaravati Capital Region, Vijayawada, Guntur, Tenali, Mangalagiri, and Krishna Riverfront.",
    "keyProvisions": [
      "Amaravati Capital City 9 Theme Cities (Government, Finance, Justice, Knowledge, Health, Sports, Tourism, Media, Electronics)",
      "Krishna Riverfront Floodplain Protection Zone and Blue-Green Grid",
      "Vijayawada-Guntur High-Density Commercial Transport Spine (NH-16)",
      "Gannavaram International Airport Obstacle Limitation Surfaces (OLS)"
]
  },
  {
    "id": "DOC-PLAN-COIMBATORE-LPA-2035",
    "title": "Coimbatore Local Planning Area Master Plan 2035 (Coimbatore Master Plan)",
    "shortTitle": "Coimbatore Master Plan 2035",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Tamil Nadu",
      "city": "Coimbatore",
      "authority": "Coimbatore LPA & DTCP Tamil Nadu"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2035",
    "version": "Coimbatore LPA Master Plan 2035 (Sanctioned & Enforced)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Coimbatore LPA & DTCP Tamil Nadu",
      "officialUrl": "https://coimbatore.nic.in",
      "documentUrl": "https://tcp.tn.gov.in/master-plan-coimbatore",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master development plan governing 1,531 sq.km Coimbatore industrial and textile hub, Avinashi Road IT/Commercial corridor, Western Ghats Hill Conservation, and Noyyal Riverfront.",
    "keyProvisions": [
      "Zoning: Industrial (Textile, Pump & Motor, Foundry clusters), Residential, Commercial, and Hill Area Conservation",
      "Hill Area Conservation Authority (HACA) zone along Western Ghats foothills (Vellingiri / Marudhamalai)",
      "Avinashi Road (NH-544) and Trichy Road high-density mixed-use commercial corridors",
      "Noyyal River 50m pollution containment and rejuvenation buffer"
]
  },
  {
    "id": "DOC-PLAN-MADURAI-LPA-2031",
    "title": "Madurai Local Planning Area Master Plan 2031 (Madurai Master Plan)",
    "shortTitle": "Madurai Master Plan 2031",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Tamil Nadu",
      "city": "Madurai",
      "authority": "Madurai LPA & DTCP Tamil Nadu"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2031",
    "version": "Madurai LPA Master Plan (Sanctioned & Harmonized with TNCDBR)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Madurai LPA & DTCP Tamil Nadu",
      "officialUrl": "https://madurai.nic.in",
      "documentUrl": "https://tcp.tn.gov.in/master-plan-madurai",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master planning instrument governing 780 sq.km Madurai cultural center, Meenakshi Sundareswarar Temple Heritage Precinct, Vaigai Riverfront, and Ring Road growth corridors.",
    "keyProvisions": [
      "Meenakshi Amman Temple Heritage Zone: Strict 9.0m (G+2) building height ceiling within 1km radius of temple towers (Gopurams)",
      "Vaigai Riverfront 50m green buffer and flood containment zone",
      "Madurai Ring Road and Bye-Pass high-density commercial/logistics zones",
      "Madurai Airport (IXM) Obstacle Limitation Surfaces (OLS)"
]
  },
  {
    "id": "DOC-PLAN-NAGPUR-NMRDA-2032",
    "title": "Nagpur Metropolitan Area Development Plan 2032 (NMRDA Master Plan)",
    "shortTitle": "Nagpur NMRDA Master Plan 2032",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Nagpur",
      "authority": "Nagpur Metropolitan Region Development Authority"
    },
    "documentType": "development_control_regulations",
    "documentPriority": "primary",
    "year": "2032",
    "version": "NMRDA Sanctioned DP 2032 (Harmonized with Maharashtra UDCPR)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Nagpur Metropolitan Region Development Authority",
      "officialUrl": "https://www.nmrda.org",
      "documentUrl": "https://nmrda.org/development-plan/",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master development plan governing 3,567 sq.km Nagpur Metropolitan Region, MIHAN (Multi-modal International Cargo Hub and Airport at Nagpur), Wardha Road, and Metro corridors.",
    "keyProvisions": [
      "Zoning: MIHAN SEZ & Non-SEZ, Urbanisable Zone (U1/U2), Logistics Corridors along Samruddhi Mahamarg, and Agriculture",
      "MIHAN Special Economic Zone with high FAR up to 3.50 for aviation, IT, and manufacturing",
      "Nagpur Metro Phase 1 & 2 Transit-Oriented Development corridor (up to 4.00 FSI within 500m)",
      "Nag River and Pili River flood and rejuvenation buffer zones"
]
  },
  {
    "id": "DOC-PLAN-NASHIK-NMC-2036",
    "title": "Nashik Revised Development Plan 2036 (NMC Master Plan)",
    "shortTitle": "Nashik Development Plan 2036",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Nashik",
      "authority": "Nashik Municipal Corporation (NMC)"
    },
    "documentType": "development_control_regulations",
    "documentPriority": "primary",
    "year": "2036",
    "version": "Nashik Revised DP (Sanctioned & Harmonized with UDCPR)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Nashik Municipal Corporation (NMC)",
      "officialUrl": "https://www.nashikcorporation.in",
      "documentUrl": "https://nashikcorporation.in/development-plan/",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master plan governing 259 sq.km Nashik urban area, Godavari Riverfront Kumbh Mela grounds, Gangapur Dam catchment, Ambad/Satpur industrial zones, and Mumbai-Nashik Expressway corridor.",
    "keyProvisions": [
      "Godavari Riverfront Conservation Zone: Blue/Red flood lines and Ramkund Kumbh Mela pilgrimage buffer",
      "Gangapur Dam drinking water reservoir catchment no-construction buffer",
      "Ambad and Satpur MIDC industrial estates and wine tourism hubs",
      "Harmonization with Maharashtra UDCPR 2020 for Base FSI, Premium FSI, and TDR"
]
  },
  {
    "id": "DOC-PLAN-NAVIMUMBAI-CIDCO-2031",
    "title": "Navi Mumbai Development Plan (CIDCO & NMMC Master Plan)",
    "shortTitle": "Navi Mumbai Development Plan",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Navi Mumbai",
      "authority": "CIDCO & Navi Mumbai Municipal Corporation"
    },
    "documentType": "development_control_regulations",
    "documentPriority": "primary",
    "year": "2031",
    "version": "Navi Mumbai Sanctioned DP & Navi Mumbai Airport Influence Notified Area (NAINA)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "CIDCO & Navi Mumbai Municipal Corporation",
      "officialUrl": "https://cidco.maharashtra.gov.in",
      "documentUrl": "https://nmmc.gov.in/navimumbaidp",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master planning instrument governing 343 sq.km Navi Mumbai planned city, NAINA (Navi Mumbai Airport Influence Notified Area), Palm Beach Road, and JNPA Port logistics corridors.",
    "keyProvisions": [
      "Zoning: Planned Nodes (Vashi, Belapur, Kharghar, Ulwe, Dronagiri), NAINA Airport City, and JNPA Port SEZ",
      "Navi Mumbai International Airport (NMIA) Obstacle Limitation Surfaces (OLS) and CCZM Height Restrictions",
      "Palm Beach Road high-density residential/commercial corridor",
      "Mangrove and Coastal Wetland conservation under CRZ-I regulations"
]
  },
  {
    "id": "DOC-PLAN-THANE-TMC-2031",
    "title": "Thane City Revised Development Plan (TMC Master Plan)",
    "shortTitle": "Thane Development Plan",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Thane",
      "authority": "Thane Municipal Corporation (TMC)"
    },
    "documentType": "development_control_regulations",
    "documentPriority": "primary",
    "year": "2031",
    "version": "Thane Revised DP (Sanctioned & Harmonized with UDCPR)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Thane Municipal Corporation (TMC)",
      "officialUrl": "https://thanecity.gov.in",
      "documentUrl": "https://thanecity.gov.in/development-plan/",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master planning framework governing 128 sq.km Thane City, Ghodbunder Road commercial/residential growth corridor, Thane Creek CRZ zone, Sanjay Gandhi National Park buffer, and Cluster Redevelopment.",
    "keyProvisions": [
      "Zoning: Urban Core, Ghodbunder Road Corridor, SGNP Eco-Sensitive Zone, and Thane Creek Flamingo Sanctuary Buffer",
      "Thane Cluster Redevelopment Scheme (UDCPR Regulation 14) granting up to 4.00 FSI for dilapidated structures",
      "Ghodbunder Road (NH-48) high-density residential and commercial towers",
      "Sanjay Gandhi National Park (SGNP) 100m to 4km Eco-Sensitive Zone restrictions"
]
  },
  {
    "id": "DOC-PLAN-VADODARA-VUDA-2031",
    "title": "Vadodara Comprehensive Development Plan 2031 (VUDA Master Plan 2031)",
    "shortTitle": "Vadodara VUDA Master Plan 2031",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Gujarat",
      "city": "Vadodara",
      "authority": "VUDA & Vadodara Municipal Corporation"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2031",
    "version": "VUDA Second Revised DP 2031 (Sanctioned & Enforced)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "VUDA & Vadodara Municipal Corporation",
      "officialUrl": "https://www.vuda.co.in",
      "documentUrl": "https://vuda.co.in/cdp-2031/",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master development plan governing 714 sq.km Vadodara Urban Development Area, Vishwamitri Riverfront, Petrochemical / GIDC industrial belts, and Mumbai-Ahmedabad Bullet Train influence zone.",
    "keyProvisions": [
      "Zoning: Residential (R1/R2), Commercial, Petrochemical Industrial Zone (Nandesari/Koyali), and Green Belts",
      "Vishwamitri River Crocodile Sanctuary & Flood Hazard Buffer: Strict 50m no-development riparian buffer",
      "High Speed Rail (Bullet Train) Vadodara Station Special Transit-Oriented Zone",
      "Chargeable FSI and High-Rise Building regulations under Gujarat CGDCR"
]
  },
  {
    "id": "DOC-PLAN-RAJKOT-RUDA-2031",
    "title": "Rajkot Comprehensive Development Plan 2031 (RUDA Master Plan 2031)",
    "shortTitle": "Rajkot RUDA Master Plan 2031",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Gujarat",
      "city": "Rajkot",
      "authority": "RUDA & Rajkot Municipal Corporation"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2031",
    "version": "RUDA Revised DP 2031 (Approved & Enforced)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "RUDA & Rajkot Municipal Corporation",
      "officialUrl": "https://www.ruda.gov.in",
      "documentUrl": "https://ruda.gov.in/development-plan/",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master plan governing 686 sq.km Saurashtra commercial capital, Hirasar International Airport influence zone, AIIMS Rajkot institutional zone, and Aji / Nyari Dam catchment buffers.",
    "keyProvisions": [
      "Zoning: Residential (R1/R2), Commercial, Engineering & Auto Component Industrial Parks, and Water Catchment",
      "Rajkot International Airport (Hirasar) Obstacle Limitation Surfaces (OLS)",
      "Aji River, Nyari River, and Lalpari Lake drinking water reservoir protection buffers",
      "Ring Road 2 (45m ROW) high-density commercial and residential development corridor"
]
  },
  {
    "id": "DOC-PLAN-BHUBANESWAR-BDA-2030",
    "title": "Bhubaneswar Comprehensive Development Plan 2030 (CDP-2030)",
    "shortTitle": "Bhubaneswar BDA Master Plan 2030",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Odisha",
      "city": "Bhubaneswar",
      "authority": "Bhubaneswar Development Authority (BDA)"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2030",
    "version": "BDA CDP-2030 (Sanctioned & Harmonized with ODA BPAR 2020)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Bhubaneswar Development Authority (BDA)",
      "officialUrl": "https://bda.gov.in",
      "documentUrl": "https://bda.gov.in/comprehensive-development-plan/",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statutory development plan covering 397 sq.km Bhubaneswar Urban Knowledge Hub, Old Town Temple Heritage Precinct, Infocity IT SEZ, and Chandaka Elephant Sanctuary buffer.",
    "keyProvisions": [
      "Old Town Heritage Precinct (Lingaraj Temple / Ekamra Kshetra): Strict 12.0m height ceiling to preserve temple sightlines",
      "Chandaka-Dampara Wildlife Sanctuary 1km Eco-Sensitive Zone construction moratorium",
      "Infocity IT SEZ / Chandrasekharpur high-density institutional and tech hub",
      "Purchasable FAR and Transit-Oriented Development along Biju Patnaik Metro corridor"
]
  },
  {
    "id": "DOC-PLAN-CUTTACK-CDA-2030",
    "title": "Cuttack Comprehensive Development Plan 2030 (CDA Master Plan)",
    "shortTitle": "Cuttack CDA Master Plan 2030",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Odisha",
      "city": "Cuttack",
      "authority": "Cuttack Development Authority (CDA)"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2030",
    "version": "CDA CDP-2030 (Sanctioned & Enforced)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Cuttack Development Authority (CDA)",
      "officialUrl": "https://cda.nic.in",
      "documentUrl": "https://cda.nic.in/master-plan/",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master development plan governing 198 sq.km Millennium City Cuttack, Mahanadi & Kathajodi River island geography, Barabati Fort Heritage Zone, and CDA Satellite Sectors.",
    "keyProvisions": [
      "Mahanadi and Kathajodi River Embankment Flood Protection Zones (Ring Road bunds)",
      "Barabati Fort and historic silver filigree craft precincts conservation controls",
      "CDA Sectors 1-14 planned residential and commercial expansion",
      "Stormwater drainage and floodwater retention basin reservations"
]
  },
  {
    "id": "DOC-PLAN-PATNA-PRDA-2031",
    "title": "Patna Master Plan 2031 (PRDA / BUIDCO Master Plan 2031)",
    "shortTitle": "Patna Master Plan 2031",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Bihar",
      "city": "Patna",
      "authority": "Patna Regional Development Authority & BUIDCO"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2031",
    "version": "Patna Master Plan 2031 (Approved by Bihar Cabinet 2016, Enforced)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Patna Regional Development Authority & BUIDCO",
      "officialUrl": "https://urban.bihar.gov.in",
      "documentUrl": "https://buidco.bihar.gov.in/master-plan-patna",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statutory master plan governing 1,167 sq.km Patna Metropolitan Region, Ganga Riverfront Drive, Bihta Airport / IT Hub, Patna Metro Corridors, and Punpun floodplains.",
    "keyProvisions": [
      "Ganga Riverfront Development: 200m buffer from Ganga river high flood line (Ganga Pathway / Marine Drive)",
      "Patna Metro Line 1 (Danapur-Khemnichak) & Line 2 (Patna Station-ISBT) TOD Corridors",
      "Bihta Satellite Township (Bihta Airport, IIT Patna, NIT Patna, and IT Park)",
      "Purchasable FAR and Mixed-Use Commercial Street notifications under Bihar Building Bye-laws"
]
  },
  {
    "id": "DOC-PLAN-RANCHI-RRDA-2037",
    "title": "Ranchi Master Plan 2037 (RRDA Master Plan 2037)",
    "shortTitle": "Ranchi Master Plan 2037",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Jharkhand",
      "city": "Ranchi",
      "authority": "Ranchi Regional Development Authority (RRDA)"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2037",
    "version": "Ranchi Master Plan 2037 (Approved & Enforced)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Ranchi Regional Development Authority (RRDA)",
      "officialUrl": "https://udhd.jharkhand.gov.in",
      "documentUrl": "https://rrda.jharkhand.gov.in/masterplan",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master development plan governing 652 sq.km Ranchi Capital Region, Core Capital Area (Dhurwa Smart City), Subarnarekha River catchment, and Kanke / Hatia Dam buffers.",
    "keyProvisions": [
      "Core Capital Area (Smart City Ranchi Dhurwa): High-density mixed-use, institutional, and hospitality hub",
      "Subarnarekha River, Kanke Dam, and Hatia Dam drinking water reservoir protection buffers",
      "Birsa Munda Airport (Hinoo) Obstacle Limitation Surfaces (OLS)",
      "Purchasable FAR and Tribal Land Tenure (CNT Act) development restrictions"
]
  },
  {
    "id": "DOC-PLAN-GUWAHATI-GMDA-2025",
    "title": "Guwahati Master Plan 2025 & Draft Master Plan 2045 (GMDA Master Plan)",
    "shortTitle": "Guwahati GMDA Master Plan 2025",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Assam",
      "city": "Guwahati",
      "authority": "Guwahati Metropolitan Development Authority (GMDA)"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2025",
    "version": "Guwahati Master Plan 2025 (with Draft 2045 Regional Plan Extensions)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Guwahati Metropolitan Development Authority (GMDA)",
      "officialUrl": "https://gmda.assam.gov.in",
      "documentUrl": "https://gmda.assam.gov.in/documents-detail/master-plan",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master planning instrument governing 262 sq.km Gateway to Northeast, Deepor Beel Ramsar Site, Brahmaputra Riverfront, Kamakhya Temple Heritage Zone, and Seismic Zone V building controls.",
    "keyProvisions": [
      "Deepor Beel Ramsar Site & Elephant Corridor: Strict eco-sensitive no-construction buffer",
      "Brahmaputra Riverfront Development and flood hazard control zones",
      "Kamakhya Temple Nilachal Hills Special Heritage Precinct (strict height and aesthetic controls)",
      "Mandatory Seismic Zone V structural design compliance and hill slope cutting restrictions"
]
  },
  {
    "id": "DOC-PLAN-DEHRADUN-MDDA-2025",
    "title": "Dehradun Master Plan 2025 & Mussoorie Special Area (MDDA Master Plan)",
    "shortTitle": "Dehradun MDDA Master Plan 2025",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Uttarakhand",
      "city": "Dehradun",
      "authority": "Mussoorie Dehradun Development Authority (MDDA)"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2025",
    "version": "Dehradun Master Plan 2025 (Harmonized with Uttarakhand Building Bye-Laws)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Mussoorie Dehradun Development Authority (MDDA)",
      "officialUrl": "https://mddaonline.in",
      "documentUrl": "https://mddaonline.in/master-plan/",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master development plan governing 312 sq.km Doon Valley Eco-Fragile Zone, Rajpur Road commercial spine, Rispana & Bindal riverfronts, and Mussoorie Hill Station.",
    "keyProvisions": [
      "Doon Valley Eco-Fragile Area Notification (MoEFCC): Strict ban on red-category polluting industries and lime quarries",
      "Mussoorie Hill Station: Strict 11.0m height ceiling and ban on construction on slopes >30 degrees",
      "Rispana and Bindal river rejuvenation green corridors (30m buffer)",
      "Seismic Zone IV ductile detailing and rainwater harvesting mandates"
]
  },
  {
    "id": "DOC-PLAN-SHIMLA-TCP-2041",
    "title": "Shimla Development Plan 2041 (SADA / TCP Himachal Pradesh)",
    "shortTitle": "Shimla Development Plan 2041",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Himachal Pradesh",
      "city": "Shimla",
      "authority": "Town & Country Planning Himachal Pradesh"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2041",
    "version": "Shimla Development Plan 2041 (Sanctioned & Supreme Court Approved 2024)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Town & Country Planning Himachal Pradesh",
      "officialUrl": "https://tcp.hp.gov.in",
      "documentUrl": "https://tcp.hp.gov.in/shimla-plan",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Statutory development plan governing 22,450 hectares Shimla Planning Area, Core Heritage Area, Green / Forest Belts, Sinking / Sliding Zones, and Special Area Development Authorities.",
    "keyProvisions": [
      "Core Heritage Area (Mall Road, Ridge, Vice Regal Lodge): Strict ban on vehicular traffic and new construction height caps",
      "17 Notified Green / Forest Belts: Strict moratorium on new construction to protect deodar/pine forest cover",
      "Sinking & Sliding Zones: Complete ban on construction in geo-dynamically unstable areas",
      "Seismic Zone IV/V structural ductile design and attic roof slope norms"
]
  },
  {
    "id": "DOC-PLAN-SRINAGAR-SDA-2035",
    "title": "Srinagar Master Plan 2035 (SDA Master Plan 2035)",
    "shortTitle": "Srinagar Master Plan 2035",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Jammu & Kashmir",
      "city": "Srinagar",
      "authority": "Srinagar Development Authority (SDA)"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2035",
    "version": "Srinagar Master Plan 2035 (Sanctioned by J&K Govt)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Srinagar Development Authority (SDA)",
      "officialUrl": "https://sdasrinagar.jk.gov.in",
      "documentUrl": "https://sdasrinagar.jk.gov.in/master-plan-2035/",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master development plan covering 766 sq.km Srinagar Metropolitan Region, Dal Lake / Nigeen Lake conservation zones, Jhelum River floodplains, and Seismic Zone V building controls.",
    "keyProvisions": [
      "Dal Lake & Nigeen Lake Conservation Zone: 200m strict no-construction buffer under High Court directives (LCMA)",
      "Jhelum River Spill Channel and Flood Retention Basins: Absolute ban on permanent construction",
      "Downtown Heritage Precinct (Shahar-e-Khas): Traditional Dhajji-Dewari and Khatamband heritage architecture controls",
      "Seismic Zone V earthquake-resistant timber/RCC composite design mandates"
]
  },
  {
    "id": "DOC-PLAN-JAMMU-JDA-2032",
    "title": "Jammu Master Plan 2032 (JDA Master Plan 2032)",
    "shortTitle": "Jammu Master Plan 2032",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Jammu & Kashmir",
      "city": "Jammu",
      "authority": "Jammu Development Authority (JDA)"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2032",
    "version": "Jammu Master Plan 2032 (Sanctioned & Enforced)",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Jammu Development Authority (JDA)",
      "officialUrl": "https://jammuda.jk.gov.in",
      "documentUrl": "https://jammuda.jk.gov.in/master-plan-2032/",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master development plan governing 652 sq.km Jammu Urban Area, Tawi Riverfront, Jammu-Pathankot Highway commercial belt, Bari Brahmana Industrial Zone, and Jammu Airport influence zone.",
    "keyProvisions": [
      "Tawi Riverfront Development & Flood Protection buffer (30m to 50m)",
      "Jammu Civil Enclave / Airport Obstacle Limitation Surfaces (OLS)",
      "Bari Brahmana and Gangyal industrial estates expansion",
      "Purchasable FAR and Mixed-Use Commercial Street notifications"
]
  },
  {
    "id": "DOC-PLAN-RAIPUR-RDA-2031",
    "title": "Raipur Development Plan 2031 & Nava Raipur (NRDA Master Plan)",
    "shortTitle": "Raipur & Nava Raipur Master Plan 2031",
    "level": 3,
    "jurisdiction": {
      "country": "India",
      "state": "Chhattisgarh",
      "city": "Raipur",
      "authority": "Raipur Development Authority & Nava Raipur Development Authority"
    },
    "documentType": "master_plan",
    "documentPriority": "primary",
    "year": "2031",
    "version": "Raipur Development Plan 2031 & Nava Raipur Smart City Master Plan",
    "status": "verified",
    "categories": [
      "far_fsi",
      "ground_coverage",
      "setbacks",
      "height_floors",
      "parking",
      "land_use",
      "zoning",
      "special_restriction"
    ],
    "source": {
      "authority": "Raipur Development Authority & Nava Raipur Development Authority",
      "officialUrl": "https://www.rdaraipur.com",
      "documentUrl": "https://rdaraipur.com/master-plan/",
      "documentType": "Gazette",
      "lastVerified": "15 Jan 2026"
    },
    "summary": "Master planning instrument governing 503 sq.km Raipur Capital Region and Nava Raipur Atal Nagar (India's first planned greenfield smart capital city).",
    "keyProvisions": [
      "Nava Raipur Atal Nagar 40 Planned Sectors (Capital Complex, CBD, Knowledge City, Sports Hub)",
      "Kharun Riverfront Conservation and drinking water reservoir buffer",
      "Swami Vivekananda Airport (Mana) Obstacle Limitation Surfaces (OLS)",
      "High-density commercial transit spines along BRTS Expressways in Nava Raipur"
]
  }
];

export const CITY_MASTER_PLAN_RULES: ByeLawRule[] = [
  {
    "id": "RULE-MP-DELHI-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Delhi (Delhi (NCT))",
    "jurisdictionScope": {
      "country": "India",
      "state": "Delhi (NCT)",
      "city": "Delhi",
      "authority": "Delhi Development Authority"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Delhi MPD-2021 Land Use, Mixed Use & TOD Zoning Regulations",
    "clause": "MPD-2021 Chapter 15 & Chapter 17 Development Code",
    "sourceDoc": "Master Plan for Delhi 2021 (MPD-2021) & Draft MPD-2041",
    "sourceUrl": "https://dda.gov.in/master-plan-2021",
    "documentYear": "2021",
    "version": "MPD-2021 (with 2023 Gazette Modifications)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Apex statutory planning document dictating land use zones, mixed-use commercial notifications, density controls, and redevelopment policies across NCT Delhi.",
    "parameters": {
      "baseFAR": "120 - 350 based on plot size & zone",
      "todFAR": "Up to 400 (Transit-Oriented Development corridor)",
      "mixedUseRoadWidth": "Min 18m road width in notified A/B/C/D colonies; 9m in regularized/unplanned",
      "maxGroundCoverage": "33.3% - 66.6% based on plot category"
},
    "detailedRequirements": [
      "Commercial activities on residential plots allowed only on roads notified by Municipal Corporation/DDA",
      "Mandatory conversion and parking charges to be paid prior to commencement of mixed-use activity",
      "TOD schemes applicable within 500m catchment of operational Metro corridors on minimum 1 Ha plot amalgamation",
      "Mandatory ECS parking standards of 2 to 3 ECS per 100 sq.m built-up area for commercial conversions"
]
  },
  {
    "id": "RULE-MP-MUM-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Mumbai (Maharashtra)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Mumbai",
      "authority": "Municipal Corporation of Greater Mumbai"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Mumbai DCPR-2034 Land Use Zoning, FSI Caps & TDR Regulations",
    "clause": "DCPR-2034 Regulation 30, 31, 32 & 33",
    "sourceDoc": "Development Control and Promotion Regulations for Greater Mumbai 2034 (DCPR-2034)",
    "sourceUrl": "https://autodcr.mcgm.gov.in/DCPR2034.aspx",
    "documentYear": "2034",
    "version": "DCPR-2034 (Sanctioned & Amended up to 2024)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Statutory planning framework for the Island City and Suburbs of Greater Mumbai, regulating base FSI, fungible FSI, TDR utilization, and cluster redevelopment.",
    "parameters": {
      "islandCityBaseFSI": "1.33 (Residential/Commercial)",
      "suburbsBaseFSI": "1.00 (Residential/Commercial)",
      "maxPermissibleFSI": "Up to 3.00 (Suburbs) and 4.05 (Island City) including Premium FSI + TDR",
      "fungibleAncillaryFSI": "60% for residential, 80% for commercial on payment of premium"
},
    "detailedRequirements": [
      "Total built-up potential calculated as: Base FSI + Premium FSI (up to 0.5) + TDR (up to 1.00) based on front road width",
      "Road width less than 9.0m restricts total FSI to base FSI of 1.00 with no TDR or Premium loading permitted",
      "Mandatory 10% to 15% Amenity Space reservation on plots exceeding 4,000 sq.m in industrial/residential zones",
      "Mandatory installation of mechanical/stack parking systems where plot footprint cannot accommodate physical ECS"
]
  },
  {
    "id": "RULE-MP-GGN-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Gurugram (Haryana)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Haryana",
      "city": "Gurugram",
      "authority": "GMDA & DTCP Haryana"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Gurugram Master Plan 2031 Sectoral Zoning & Land Use Controls",
    "clause": "GMUC Development Plan 2031 Zoning Regulations",
    "sourceDoc": "Gurugram-Manesar Urban Complex Final Development Plan 2031 (Master Plan 2031)",
    "sourceUrl": "https://tcpharyana.gov.in/Development_Plan/Gurugram.pdf",
    "documentYear": "2031",
    "version": "Master Plan 2031 (Notified 2012, Amended 2024)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Statutory regional urban development plan covering 338 sq.km across Sectors 1 to 115 of Gurugram and Manesar, regulating land uses, transport spines, and institutional zones.",
    "parameters": {
      "residentialDensity": "300 to 1,000 persons per hectare across designated sectors",
      "expresswayGreenBuffer": "30m to 50m mandatory green belt on Dwarka Expressway & SPR",
      "highwayBuffer": "50m to 100m buffer along NH-48 (Delhi-Jaipur Expressway)",
      "commercialFAR": "1.75 Base FAR expandable up to 3.50 via TOD/Purchasable FAR"
},
    "detailedRequirements": [
      "Development permission requires sector layout compliance approved by DTCP / GMDA",
      "No construction permitted within statutory right-of-way (ROW) and green buffer along notified highways",
      "High-rise group housing developments on 24m+ sector roads eligible for purchasable FAR under Haryana TOD policy",
      "Mandatory integration with GMDA master water supply, master stormwater, and master sewerage trunk networks"
]
  },
  {
    "id": "RULE-MP-BLR-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Bengaluru (Karnataka)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Karnataka",
      "city": "Bengaluru",
      "authority": "Bangalore Development Authority"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Bengaluru RMP Zoning, Rajakaluve/Lake Buffers & FAR Caps",
    "clause": "BDA RMP-2015 Zoning Regulations Chapter 4 & NGT Directives",
    "sourceDoc": "Bengaluru Revised Master Plan 2031 (RMP-2031) / RMP-2015",
    "sourceUrl": "https://bdabangalore.org/master-plan",
    "documentYear": "2031",
    "version": "RMP-2015 Enforced (with 2024 Interim RMP-2031 Guidelines)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Statutory zoning and development code for the Bangalore Metropolitan Area, categorizing Ring I, Ring II, and Ring III planning districts, road width-linked FAR, and lake buffer zones.",
    "parameters": {
      "lakeBufferZone": "75m no-development buffer from highest flood level (HFL) of lake",
      "primaryDrainBuffer": "50m buffer from center/edge of primary stormwater drain (Rajakaluve)",
      "secondaryDrainBuffer": "25m buffer from edge of secondary stormwater drain",
      "baseFAR": "1.50 to 3.25 linked to front road width (9m to 30m+)"
},
    "detailedRequirements": [
      "Strict prohibition of permanent construction inside 75m lake buffer and designated Rajakaluve stormwater buffers",
      "Commercial activities on residential roads permitted only if road width is 12.0m or wider under Mutation Corridor norms",
      "Mandatory 10% Park and Open Space reservation for layout/group housing developments exceeding 4,000 sq.m",
      "Mandatory dual-piping STP recycled water plumbing for developments containing 20+ residential units or >2,000 sq.m BUA"
]
  },
  {
    "id": "RULE-MP-CHN-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Chennai (Tamil Nadu)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Tamil Nadu",
      "city": "Chennai",
      "authority": "Chennai Metropolitan Development Authority"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Chennai SMP-2026 Land Use Zoning & Premium FSI Controls",
    "clause": "Chennai SMP-2026 Development Regulations & TNCDBR Part VI",
    "sourceDoc": "Chennai Second Master Plan for CMA 2026 (SMP-2026) & Vision 2046",
    "sourceUrl": "https://www.cmdachennai.gov.in/smp_2026.html",
    "documentYear": "2026",
    "version": "Second Master Plan 2026 (with TNCDBR 2019 Harmonization)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master planning instrument governing 1,189 sq.km Chennai Metropolitan Area (CMA), regulating Primary Residential, Mixed Residential, Commercial, IT Corridor, and Coastal Regulation Zones.",
    "parameters": {
      "nonHighRiseFSI": "1.50 to 2.00 based on road width (9m - 18m)",
      "highRiseFSI": "2.00 Base FSI expandable up to 3.25 via Premium FSI on 18m+ road",
      "itCorridorFSI": "Up to 3.75 on designated IT / ITES parks along OMR",
      "osrRequirement": "10% Open Space Reservation (OSR) for land extent exceeding 3,000 sq.m"
},
    "detailedRequirements": [
      "Continuous building areas (CBA) within George Town and old municipal limits governed by special setback relaxations",
      "Developments on OMR and GST Road eligible for 50% Premium FSI upon payment of CMDA guideline value charges",
      "Mandatory rainwater harvesting structure design with percolation pits and open well recharge shafts",
      "Buffer zones of 15m along Cooum River, Adyar River, and Buckingham Canal where no construction is permitted"
]
  },
  {
    "id": "RULE-MP-HYD-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Hyderabad (Telangana)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Telangana",
      "city": "Hyderabad",
      "authority": "Hyderabad Metropolitan Development Authority"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "HMDA Master Plan 2031 Zoning, ORR Growth Corridor & Unlimited FSI",
    "clause": "HMDA Master Plan 2031 Zoning Regulations & G.O. Ms. 168",
    "sourceDoc": "Hyderabad Metropolitan Development Authority Master Plan 2031 (HMDA Master Plan)",
    "sourceUrl": "https://www.hmda.org.in/master-plan/",
    "documentYear": "2031",
    "version": "Metropolitan Development Plan 2031 (Sanctioned 2013, Amended 2024)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Comprehensive statutory master plan covering 7,257 sq.km HMDA jurisdiction, Outer Ring Road (ORR) Growth Corridor, HiTec City / Financial District IT zones, and Go-111 catchment areas.",
    "parameters": {
      "permissibleFSI": "Unlimited (governed by front road width, site setbacks, and height clearance)",
      "orrGrowthCorridorBuffer": "1km special development corridor on either side of ORR",
      "minRoadWidthHighRise": "12.0m for buildings up to 18m; 18.0m for buildings up to 30m; 24.0m for >30m",
      "lakeBufferZone": "30m buffer from Full Tank Level (FTL) for lakes >10 Ha; 9m for smaller water bodies"
},
    "detailedRequirements": [
      "Unlimited FSI is available subject to providing full statutory setbacks, fire noc clearances, and road width compliance",
      "Developments in ORR Growth Corridor must pay special impact fees to HMDA for trunk infrastructure creation",
      "Strict prohibition of construction within lake FTL contours and designated surplus course channels (Nalas)",
      "Mandatory 10% open space gift deed to HMDA for plotted layouts and gated communities exceeding 3,000 sq.m"
]
  },
  {
    "id": "RULE-MP-PUN-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Pune (Maharashtra)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Pune",
      "authority": "Pune Municipal Corporation & PMRDA"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Pune DP Land Use Zoning, River Flood Lines & TOD Norms",
    "clause": "Pune DP Regulations & Maharashtra UDCPR Chapter 3 & 11",
    "sourceDoc": "Pune Revised Development Plan 2007-2027 (PMC DP & PMRDA DP)",
    "sourceUrl": "https://pmc.gov.in/en/development-plan",
    "documentYear": "2027",
    "version": "Pune Old Limits & 23 Merged Villages DP (Harmonized under UDCPR)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Development planning code for the Pune Municipal Corporation and Pune Metropolitan Region, governing gaothan limits, congested/non-congested zones, riverfronts, and Hill Top/Hill Slope zones.",
    "parameters": {
      "congestedGaothanFSI": "1.50 to 2.00 Base FSI with relaxed setbacks",
      "nonCongestedBaseFSI": "1.10 Base FSI expandable up to 2.50 - 3.50 via Premium & TDR",
      "metroTodFSI": "Up to 4.00 FSI within 500m of Pune Metro stations on 24m+ roads",
      "riverBlueLine": "Strictly no development within Blue Flood Line (25-year flood mark)"
},
    "detailedRequirements": [
      "Hill Top / Hill Slope (HTHS) and BDP zones strictly restricted with max 0.04 FSI for non-polluting eco-tourism only",
      "Red Flood Line zone permits only single-story plinth elevated structures with zero basement",
      "10% amenity space surrender mandatory for residential/commercial layouts on plots >4,000 sq.m under UDCPR",
      "Mandatory dual water supply and 100% wastewater recycling on all group housing schemes exceeding 5,000 sq.m"
]
  },
  {
    "id": "RULE-MP-KOL-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Kolkata (West Bengal)",
    "jurisdictionScope": {
      "country": "India",
      "state": "West Bengal",
      "city": "Kolkata",
      "authority": "Kolkata Metropolitan Development Authority"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Kolkata KMDA Land Use, East Kolkata Wetlands & Heritage Controls",
    "clause": "KMDA Land Use Regulations & KMC Building Rules Part IV",
    "sourceDoc": "Kolkata Metropolitan Area Development Plan (KMDA Master Plan)",
    "sourceUrl": "https://kmda.wb.gov.in/masterplan",
    "documentYear": "2025",
    "version": "KMDA Master Plan (Harmonized with KMC Building Rules)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master development plan covering 1,886 sq.km across Kolkata, Howrah, Salt Lake (Bidhannagar), New Town (HIDCO), and peri-urban municipalities along the Hooghly River.",
    "parameters": {
      "baseFAR": "1.50 to 2.75 linked to road width (6.0m to 24.0m)",
      "wetlandBuffer": "Strict Zero Development across notified East Kolkata Wetlands Ramsar boundary",
      "metroCorridorFAR": "Additional 20% to 30% purchasable FAR within 500m of Metro stations",
      "maxGroundCoverage": "45% to 65% depending on building height and plot size"
},
    "detailedRequirements": [
      "No change of land use or developmental clearance permitted within East Kolkata Wetlands Ramsar conservation boundary",
      "Heritage buildings listed under Grade I, IIA, IIB require Heritage Conservation Committee sanction for any structural modification",
      "Mandatory front setback surrender for designated street alignment road widening lines without compensation deduction from FAR",
      "Mandatory rooftop solar grid-tie installation for commercial buildings with sanctioned load >50 kW"
]
  },
  {
    "id": "RULE-MP-AHM-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Ahmedabad (Gujarat)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Gujarat",
      "city": "Ahmedabad",
      "authority": "AUDA & AMC"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Ahmedabad AUDA Zoning, TOZ Corridors & Chargeable FSI Norms",
    "clause": "AUDA CDP-2031 Zoning Regulations & Gujarat CGDCR Section D",
    "sourceDoc": "AUDA Comprehensive Development Plan 2021-2031 (Second Revised DP)",
    "sourceUrl": "https://auda.gov.in/cdp-2031/",
    "documentYear": "2031",
    "version": "Sanctioned Second Revised Development Plan 2031 (with GDCR)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Statutory development plan covering 1,866 sq.km Ahmedabad Urban Development Area, regulating Sabarmati Riverfront, BRTS/Metro Transit Corridors, and SP Ring Road growth zones.",
    "parameters": {
      "r1BaseFSI": "1.80 Base FSI expandable up to 2.70 via Chargeable FSI on 12m+ roads",
      "tozCorridorFSI": "Up to 4.00 FSI in 200m Transit Oriented Zone along BRTS/Metro",
      "cbdAshramRoadFSI": "Up to 5.40 FSI on plots fronting Ashram Road 30m+ ROW",
      "r2BaseFSI": "1.20 Base FSI expandable to 1.80 on 12m+ roads"
},
    "detailedRequirements": [
      "Chargeable FSI is purchasable from AUDA/AMC at 40% of Jantri (land revenue) rates",
      "Buildings exceeding 45m height require Special High-Rise Committee clearance and minimum 30m road frontage",
      "Mandatory 10% tree plantation area with min 1 tree per 100 sq.m of plot area",
      "Mandatory percolation well and rainwater harvesting reservoir for all plots exceeding 500 sq.m"
]
  },
  {
    "id": "RULE-MP-SUR-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Surat (Gujarat)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Gujarat",
      "city": "Surat",
      "authority": "SUDA & Surat Municipal Corporation"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Surat SUDA Zoning, Tapi River Flood Buffers & Metro Transit FSI",
    "clause": "SUDA DP-2035 Regulations & Gujarat CGDCR",
    "sourceDoc": "Surat Comprehensive Development Plan 2035 (SUDA Master Plan 2035)",
    "sourceUrl": "https://sudaonline.org/development-plan/",
    "documentYear": "2035",
    "version": "SUDA Revised DP 2035 (Sanctioned 2021)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master development plan for Surat metropolitan region covering 722 sq.km, diamond & textile industrial clusters, Tapi Riverfront, and Hazira Port industrial belt.",
    "parameters": {
      "r1BaseFSI": "1.80 Base FSI (up to 2.70 Chargeable FSI on 18m+ road)",
      "metroCorridorFSI": "Up to 4.00 FSI in 200m Metro Influence Zone",
      "tapiRiverBuffer": "50m no-development buffer from Tapi River high embankment",
      "dreamCityFSI": "Up to 4.50 FSI in designated DREAM City Special Hub"
},
    "detailedRequirements": [
      "Strict structural seismic compliance (Zone III) with ductile detailing mandatory for all multi-story RCC structures",
      "Basement construction prohibited within designated Tapi River high flood zone contours",
      "Industrial textile/dyeing units strictly confined to notified GIDC and SUDA industrial estates with CETP connectivity",
      "Mandatory dual-plumbing STP installation for commercial establishments and group housing >4,000 sq.m"
]
  },
  {
    "id": "RULE-MP-JAI-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Jaipur (Rajasthan)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Rajasthan",
      "city": "Jaipur",
      "authority": "Jaipur Development Authority"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Jaipur JDA Zoning, Walled City Heritage & Ring Road FAR Controls",
    "clause": "Jaipur MDP-2025 Regulations & Rajasthan UBBR Chapter 4",
    "sourceDoc": "Jaipur Master Development Plan 2025 (JDA Master Plan 2025)",
    "sourceUrl": "https://jda.urban.rajasthan.gov.in/content/raj/udh/jda-jaipur/en/citizen-services/master-plan-2025.html",
    "documentYear": "2025",
    "version": "Master Development Plan 2025 (Sanctioned 2011, Amended 2024)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Statutory planning framework for 2,940 sq.km Jaipur Region (U1 to U4 urbanisable areas), Walled City Heritage Precincts, Ring Road Corridor, and ecological zones.",
    "parameters": {
      "walledCityMaxHeight": "12.0m to 15.0m strictly capped to maintain skyline and heritage character",
      "outerUrbanBaseFAR": "1.33 to 2.25 based on road width (9m to 24m+)",
      "bettermentChargeFAR": "Purchasable BAR up to 0.75 on payment of betterment levy",
      "ringRoadCorridorFAR": "Up to 3.00 FAR along 90m+ Ring Road influence zone"
},
    "detailedRequirements": [
      "Walled City constructions must maintain traditional Pink City facade, chhatris, jharokhas, and sandstone finishes",
      "No borewell drilling permitted without prior Central Ground Water Authority (CGWA) and JDA NOC in dark zones",
      "Mandatory rooftop rainwater harvesting with desilting chambers and filtration units for all plots >100 sq.m",
      "Setbacks along national and state highways must adhere to minimum 15m building line setback"
]
  },
  {
    "id": "RULE-MP-NOIDA-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Noida (Uttar Pradesh)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Noida",
      "authority": "New Okhla Industrial Development Authority (NOIDA)"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Noida Master Plan 2031 Zoning, Expressway FAR & Okhla Eco-Buffers",
    "clause": "Noida Master Plan 2031 & Noida Building Regulations 2010 (Amended)",
    "sourceDoc": "Noida Master Plan 2031 (New Okhla Industrial Development Area)",
    "sourceUrl": "https://noidaauthorityonline.in/en/noida-master-plan",
    "documentYear": "2031",
    "version": "Noida Master Plan 2031 (Approved & Enforced)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master plan governing 20,316 hectares across 168 planned sectors, Expressway Commercial Hubs, Institutional belts, and Yamuna River floodplain buffers.",
    "parameters": {
      "groupHousingBaseFAR": "2.75 Base FAR + 0.75 Purchasable FAR (Total 3.50 on 24m+ road)",
      "commercialBaseFAR": "2.00 to 3.00 Base FAR (up to 4.00 on Expressway)",
      "okhlaBirdSanctuaryBuffer": "100m to 1.27km Eco-Sensitive Zone where special NBWL clearance required",
      "maxGroundCoverage": "30% for high-rise group housing; 40% for commercial"
},
    "detailedRequirements": [
      "Purchasable FAR charges payable at standard sector-specific Authority land rates prior to sanction",
      "Projects within notified Okhla Bird Sanctuary ESZ must obtain National Board for Wildlife (NBWL) clearance",
      "Mandatory dual water supply piping and zero-liquid-discharge (ZLD) STP for group housing schemes >20,000 sq.m",
      "Mandatory provision of visitor parking @ 15% of total required ECS in all group housing societies"
]
  },
  {
    "id": "RULE-MP-GRNOIDA-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Greater Noida (Uttar Pradesh)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Greater Noida",
      "authority": "Greater Noida Industrial Development Authority (GNIDA)"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Greater Noida Master Plan Zoning, Green Building FAR & Height Norms",
    "clause": "GNIDA Master Plan Regulations & Building Regulations 2010",
    "sourceDoc": "Greater Noida Master Plan 2021 & Draft Master Plan 2041",
    "sourceUrl": "https://www.greaternoidaauthority.in/master-plan",
    "documentYear": "2041",
    "version": "GNIDA Master Plan 2021 (with Phase-II Master Plan 2041 Extensions)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master development plan governing 38,000 hectares across Greater Noida Phase 1 and Phase 2 (Greater Noida West / Noida Extension), knowledge parks, and industrial corridors.",
    "parameters": {
      "groupHousingBaseFAR": "2.75 Base FAR (up to 3.50 with purchasable FAR on 30m+ roads)",
      "knowledgeParkFAR": "1.50 Base FAR expandable up to 2.50 for universities and tech parks",
      "greenBuildingBonusFAR": "5% additional FAR for 4-Star GRIHA / Gold IGBC certified projects",
      "maxGroundCoverage": "30% to 35% for group housing; 40% for institutional"
},
    "detailedRequirements": [
      "Group housing developments require minimum 24m wide front road for purchasable FAR eligibility",
      "Zero discharge STP with dual plumbing mandatory for all projects having plot area >2,000 sq.m",
      "Green building bonus FAR requires performance bank guarantee and post-construction operational audit",
      "Mandatory solar water heating systems for all residential and institutional hostels"
]
  },
  {
    "id": "RULE-MP-YEIDA-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Yamuna Expressway (Uttar Pradesh)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Yamuna Expressway",
      "authority": "Yamuna Expressway Industrial Development Authority"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "YEIDA Master Plan Zoning, Jewar Airport OLS & Aerotropolis Controls",
    "clause": "YEIDA Master Plan 2031 Building Regulations",
    "sourceDoc": "Yamuna Expressway Master Plan 2031 (YEIDA Master Plan 2031)",
    "sourceUrl": "https://yamunaexpresswayauthority.com/master-plan-2031/",
    "documentYear": "2031",
    "version": "YEIDA Master Plan 2031 (Phase 1 & Noida International Airport Influence Zone)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Apex statutory master plan governing 2,688 sq.km across Gautam Buddha Nagar, Bulandshahr, Aligarh, and Mathura, surrounding Noida International Airport (Jewar).",
    "parameters": {
      "aerotropolisCommercialFAR": "2.50 Base FAR (up to 4.00 on 45m+ Expressway arterial roads)",
      "industrialBaseFAR": "1.50 to 2.00 Base FAR for electronics & clean manufacturing",
      "airportOLSHeightCap": "Strictly regulated based on Jewar Airport Runway elevation & CCZM",
      "expresswayGreenBuffer": "100m mandatory green buffer along Yamuna Expressway ROW"
},
    "detailedRequirements": [
      "Mandatory AAI / Jewar Airport NOC for any structure exceeding 15m height within 20km radius of airport reference point",
      "No construction permitted within 100m green belt on either side of Yamuna Expressway carriageway",
      "Industrial units must achieve Zero Liquid Discharge (ZLD) and provide in-house effluent treatment",
      "Mandatory 20% green landscape cover on all industrial and commercial plotted allotments"
]
  },
  {
    "id": "RULE-MP-LKO-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Lucknow (Uttar Pradesh)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Lucknow",
      "authority": "Lucknow Development Authority (LDA)"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Lucknow Master Plan 2031 Zoning, Gomti River Buffers & TOD Norms",
    "clause": "Lucknow Mahayojna 2031 & UP Model Building Bye-Laws",
    "sourceDoc": "Lucknow Master Plan 2031 (Mahayojna 2031)",
    "sourceUrl": "https://ldaonline.co.in/master-plan/",
    "documentYear": "2031",
    "version": "Lucknow Mahayojna 2031 (Approved & Notified)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master development plan for Uttar Pradesh capital city covering 1,178 sq.km, Gomti Riverfront, Shaheed Path growth corridor, Amar Shaheed Path commercial zones, and heritage zones.",
    "parameters": {
      "baseFAR": "1.50 to 2.50 based on road width (9m to 24m+)",
      "purchasableFAR": "Up to 33% additional FAR on roads >=18m width",
      "gomtiRiverBuffer": "50m to 100m no-construction green belt from Gomti river bank",
      "todCorridorFAR": "Up to 3.50 FAR within 500m of Lucknow Metro stations"
},
    "detailedRequirements": [
      "Developments in Hazratganj and Old City heritage zones must maintain heritage height limits (max 15m) and design guidelines",
      "No construction permitted inside Gomti river embankment buffer zone",
      "Rainwater harvesting mandatory for all residential plots >150 sq.m and all commercial/institutional plots",
      "Mandatory 15% open space reservation for group housing schemes >3,000 sq.m"
]
  },
  {
    "id": "RULE-MP-KNP-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Kanpur (Uttar Pradesh)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Kanpur",
      "authority": "Kanpur Development Authority (KDA)"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Kanpur Master Plan 2031 Zoning, Ganga River Buffer & Metro TOD",
    "clause": "Kanpur Mahayojna 2031 Regulations",
    "sourceDoc": "Kanpur Master Plan 2031 (Mahayojna 2031)",
    "sourceUrl": "https://kda.co.in/master-plan-2031/",
    "documentYear": "2031",
    "version": "Kanpur Mahayojna 2031 (Approved 2022)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master plan governing 890 sq.km Kanpur metropolitan region, Ganga River pollution buffer zones, Leather Industrial clusters (Jajmau), and Metro Line 1 & 2 corridors.",
    "parameters": {
      "gangaRiverBuffer": "200m no-development buffer from Ganga high flood line",
      "baseFAR": "1.50 to 2.25 based on road width (9m to 24m)",
      "metroTODFAR": "Up to 3.00 FAR along Kanpur Metro 500m influence zone",
      "maxGroundCoverage": "35% to 60% based on building use"
},
    "detailedRequirements": [
      "Strict prohibition of industrial or commercial construction within 200m of Ganga River edge",
      "All industrial tanneries and chemical units must be connected to CETP at Jajmau",
      "Rainwater harvesting mandatory for all plotted developments >150 sq.m",
      "Fire NOC mandatory from UP Fire Service for buildings exceeding 15m height"
]
  },
  {
    "id": "RULE-MP-VAR-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Varanasi (Uttar Pradesh)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Varanasi",
      "authority": "Varanasi Development Authority (VDA)"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Varanasi Master Plan Zoning, Ganga Ghats & Sarnath Heritage Buffer",
    "clause": "VDA Mahayojna 2031 Chapter 5 & UP Heritage Regulations",
    "sourceDoc": "Varanasi Master Plan 2031 (Mahayojna 2031)",
    "sourceUrl": "https://vdavaranasi.com/master-plan-2031/",
    "documentYear": "2031",
    "version": "Varanasi Mahayojna 2031 (Sanctioned & Notified)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Statutory planning framework for the ancient cultural capital covering 502 sq.km, Kashi Vishwanath Special Heritage Zone, Ganga Ghats, Sarnath Heritage Zone, and Ring Road growth corridors.",
    "parameters": {
      "gangaGhatBuffer": "200m no-construction buffer from Crescent Ghats / Ganga riverbank",
      "sarnathHeritageBuffer": "300m regulated buffer from ASI protected monuments in Sarnath",
      "heritageZoneMaxHeight": "8.5m (Ghats precinct) to 12.0m (Old City core)",
      "outerRingRoadFAR": "Up to 2.50 FAR on 24m+ arterial roads"
},
    "detailedRequirements": [
      "Zero new construction or structural expansion permitted within 200m of Ganga River bank",
      "All developments within Sarnath and Kashi heritage zones require prior ASI / Heritage Committee NOC",
      "Traditional stone cladding, arches, and ornamental chhatris recommended for commercial hospitality facades",
      "Mandatory rooftop rainwater harvesting with recharge well for all plots exceeding 100 sq.m"
]
  },
  {
    "id": "RULE-MP-AGR-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Agra (Uttar Pradesh)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Agra",
      "authority": "Agra Development Authority (ADA)"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Agra Master Plan Zoning, Taj Mahal 500m Buffer & TTZ Controls",
    "clause": "Agra Mahayojna 2031 & TTZ Authority Directives",
    "sourceDoc": "Agra Master Plan 2031 & Taj Trapezium Zone (TTZ) Regulations",
    "sourceUrl": "https://adaagra.in/master-plan/",
    "documentYear": "2031",
    "version": "Agra Mahayojna 2031 (Harmonized with TTZ Supreme Court Directives)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master plan governing 520 sq.km Agra Urban Area, Taj Mahal 500m security buffer, Taj Trapezium Zone (TTZ) 10,400 sq.km environmental protection limits, and Yamuna Riverfront.",
    "parameters": {
      "tajMahalBuffer": "500m absolute no-construction security and visual protection buffer",
      "ttzIndustryStatus": "100% ban on polluting/fossil-fuel powered industrial units",
      "asiProhibitedZone": "100m from monument boundary (Zero construction)",
      "baseFAR": "1.25 to 2.00 based on road width in non-monument zones"
},
    "detailedRequirements": [
      "Every commercial and industrial project in Agra requires Taj Trapezium Zone (TTZ) Authority environmental clearance",
      "Diesel generator sets strictly regulated with mandatory gas-based backup systems",
      "Height in the vicinity of Taj Mahal sightline strictly restricted to maximum 12m / G+2 floors",
      "Mandatory dual-plumbing STP and 100% rooftop rainwater harvesting across all developments >300 sq.m"
]
  },
  {
    "id": "RULE-MP-PRG-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Prayagraj (Uttar Pradesh)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Prayagraj",
      "authority": "Prayagraj Development Authority (PDA)"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Prayagraj Master Plan Zoning, Sangam Kumbh Plains & River Buffers",
    "clause": "PDA Mahayojna 2031 Chapter 4 & UP Building Rules",
    "sourceDoc": "Prayagraj Master Plan 2031 (Mahayojna 2031)",
    "sourceUrl": "https://pdaprayagraj.in/master-plan-2031/",
    "documentYear": "2031",
    "version": "Prayagraj Mahayojna 2031 (Approved & Notified)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master development plan covering 625 sq.km Prayagraj metropolitan area, Sangam Kumbh Mela floodplains, Yamuna & Ganga riverfront buffers, and Naini industrial zones.",
    "parameters": {
      "sangamPlainsBuffer": "Zero permanent construction in designated Kumbh Mela active floodplain",
      "riverBuffer": "200m no-development buffer from Ganga & Yamuna high flood levels",
      "baseFAR": "1.50 to 2.25 based on road width (9m to 24m)",
      "maxGroundCoverage": "40% to 60% based on occupancy"
},
    "detailedRequirements": [
      "Strict prohibition of permanent RCC structures within Sangam Kumbh Mela active inundation grounds",
      "Effluent discharge into Ganga or Yamuna strictly prohibited; 100% STP recycling mandatory",
      "Civil Lines commercial area requires heritage-compatible signages and setbacks",
      "Mandatory rainwater harvesting with recharge bore for all plots >150 sq.m"
]
  },
  {
    "id": "RULE-MP-GZB-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Ghaziabad (Uttar Pradesh)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Uttar Pradesh",
      "city": "Ghaziabad",
      "authority": "Ghaziabad Development Authority (GDA)"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Ghaziabad Master Plan Zoning, RRTS TOD Corridor & Hindon Buffers",
    "clause": "GDA Master Plan 2031 & UP TOD Policy 2022",
    "sourceDoc": "Ghaziabad Master Plan 2031 (GDA Master Plan 2031)",
    "sourceUrl": "https://gdaghaziabad.in/master-plan-2031/",
    "documentYear": "2031",
    "version": "Ghaziabad Master Plan 2031 (Approved 2023)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master plan governing 522 sq.km Ghaziabad NCR region, Delhi-Meerut Expressway corridor, Delhi-Meerut RRTS Transit Influence Zones, and Hindon River buffer.",
    "parameters": {
      "rrtsTODFAR": "Up to 4.00 FAR within 1.5km RRTS Influence Zone on 24m+ roads",
      "baseFAR": "1.50 to 2.50 in standard residential/commercial sectors",
      "purchasableFAR": "Up to 33% additional FAR on payment of GDA betterment fees",
      "hindonRiverBuffer": "50m to 100m green buffer along Hindon river flood line"
},
    "detailedRequirements": [
      "High-density developments in RRTS corridor eligible for purchasable FAR upon payment of TOD infrastructure charges",
      "Zero construction permitted inside Hindon River active floodplain and bird sanctuary zones",
      "Mandatory dual-plumbing STP and zero waste discharge for group housing projects >5,000 sq.m",
      "Mandatory EV charging infrastructure for minimum 20% of total sanctioned parking ECS"
]
  },
  {
    "id": "RULE-MP-FBD-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Faridabad (Haryana)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Haryana",
      "city": "Faridabad",
      "authority": "DTCP Haryana & HSVP"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Faridabad Master Plan Zoning, Aravalli PLPA & Metro TOD Controls",
    "clause": "Faridabad Development Plan 2031 & Haryana Building Code",
    "sourceDoc": "Faridabad Final Development Plan 2031 (Faridabad Master Plan)",
    "sourceUrl": "https://tcpharyana.gov.in/Development_Plan/Faridabad.pdf",
    "documentYear": "2031",
    "version": "Faridabad Master Plan 2031 (Sanctioned 2014, Amended 2024)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Statutory regional urban development plan covering 343 sq.km across Sectors 1 to 150 of Faridabad, Greater Faridabad (Neharpar), and Yamuna River floodplain.",
    "parameters": {
      "residentialDensity": "300 to 600 persons per hectare in Neharpar sectors",
      "metroTODFAR": "Up to 3.50 FAR within 500m of Violet Line Metro corridor",
      "aravalliPLPABuffer": "Zero non-forest construction in PLPA Section 4 & 5 notified areas",
      "baseFAR": "1.75 Base FAR expandable via Purchasable FAR up to 2.50"
},
    "detailedRequirements": [
      "Strict prohibition of construction in Aravalli plantation and forest areas notified under PLPA without Supreme Court / MoEFCC clearance",
      "Developments on Mathura Road (NH-19) require minimum 30m road setback buffer",
      "Mandatory rooftop rainwater harvesting with desilting tanks for all residential plots >100 sq.m",
      "Integration with HSVP trunk sewerage and stormwater drainage networks mandatory prior to OC"
]
  },
  {
    "id": "RULE-MP-PKL-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Panchkula (Haryana)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Haryana",
      "city": "Panchkula",
      "authority": "DTCP Haryana & HSVP"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Panchkula Master Plan Zoning, Ghaggar River & Mansa Devi Buffers",
    "clause": "Panchkula Master Plan 2031 & Haryana Building Code 2017",
    "sourceDoc": "Panchkula Urban Complex Final Development Plan 2031",
    "sourceUrl": "https://tcpharyana.gov.in/Development_Plan/Panchkula.pdf",
    "documentYear": "2031",
    "version": "Panchkula Master Plan 2031 (Sanctioned & Enforced)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master development plan covering 12,700 hectares across Panchkula, Pinjore-Kalka Urban Complex, Mansa Devi Complex, and Ghaggar River catchment.",
    "parameters": {
      "mansaDeviHeightCap": "12.0m strict height restriction in Mansa Devi Complex",
      "ghaggarRiverBuffer": "100m no-development buffer from Ghaggar river embankment",
      "baseFAR": "1.45 to 1.98 based on plot size",
      "purchasableFAR": "Up to 0.75 additional FAR on 18m+ sector roads"
},
    "detailedRequirements": [
      "No high-rise construction permitted within visual cone of Mansa Devi Temple",
      "Shivalik foothill slopes exceeding 30 degrees strictly prohibited for cut-and-fill construction",
      "Mandatory rainwater harvesting with recharge shaft for all plots exceeding 100 sq.m",
      "Mandatory rooftop solar PV system for all residential plots >500 sq.m and commercial buildings"
]
  },
  {
    "id": "RULE-MP-CHD-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Chandigarh (Chandigarh)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Chandigarh",
      "city": "Chandigarh",
      "authority": "Chandigarh Administration"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Chandigarh CMP-2031 Le Corbusier Heritage, Sukhna Buffer & Height Bans",
    "clause": "Chandigarh Master Plan 2031 Chapter 6 & Chandigarh Building Rules (Urban)",
    "sourceDoc": "Chandigarh Master Plan 2031 (CMP-2031)",
    "sourceUrl": "https://chandigarh.gov.in/master-plan-2031",
    "documentYear": "2031",
    "version": "CMP-2031 (Approved by MHA / UT Administration)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master planning document safeguarding Le Corbusier's heritage grid, Capitol Complex UNESCO World Heritage Site, Sukhna Lake catchment, and Sectors 1 to 60.",
    "parameters": {
      "corbusierHeritageZone": "Sectors 1 to 30 strictly preserved with zero floor/apartment division",
      "sukhnaCatchmentBuffer": "Zero development in notified Sukhna Lake catchment and ESZ",
      "maxBuildingHeight": "3 to 4 storeys (10.6m to 14.0m) in plotted sectors; high-rises banned in Phase 1",
      "baseFAR": "1.00 to 1.50 with strict frame controls"
},
    "detailedRequirements": [
      "Apartmentalization and independent sale of floors in residential plotted houses strictly illegal (Supreme Court 2023)",
      "All structural changes in Sectors 1 to 30 require Chandigarh Heritage Conservation Committee clearance",
      "Standard architectural frame controls (brick/exposed concrete facades) mandatory on notified commercial V4/V2 shopping streets",
      "Mandatory rooftop solar power plant for all residential plots >500 sq.yd (min 1 kWp to 5 kWp)"
]
  },
  {
    "id": "RULE-MP-MOH-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Mohali (SAS Nagar) (Punjab)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Punjab",
      "city": "Mohali (SAS Nagar)",
      "authority": "GMADA & Punjab Housing and Urban Development"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Mohali GMADA Master Plan Zoning, Airport CCZM & Airport Road FAR",
    "clause": "GMADA Master Plan 2031 & Punjab Municipal Building Rules 2018",
    "sourceDoc": "SAS Nagar (Mohali) Master Plan 2031 (GMADA Master Plan)",
    "sourceUrl": "https://gmada.gov.in/master-plan-sas-nagar",
    "documentYear": "2031",
    "version": "SAS Nagar Master Plan 2031 (Sanctioned & Amended)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master development plan governing 118 planned sectors of SAS Nagar Mohali, Aerocity, IT City, Knowledge City, and Chandigarh International Airport influence zone.",
    "parameters": {
      "groupHousingBaseFAR": "1.75 Base FAR (up to 3.00 via Purchasable FAR on 30m+ roads)",
      "itCityBaseFAR": "2.00 Base FAR expandable to 3.00 for IT / ITES complexes",
      "airportHeightLimit": "Governed by AAI Color Coded Zoning Map (CCZM) for IXC Airport",
      "maxGroundCoverage": "35% for group housing; 40% for commercial"
},
    "detailedRequirements": [
      "AAI NOC mandatory for all constructions in Aerocity and IT City sectors falling within airport obstacle cones",
      "Commercial projects on PR-7 Airport Road require minimum 30m frontage road width",
      "Mandatory dual-piping STP recycled water system for group housing developments >3,000 sq.m",
      "Mandatory rooftop rainwater harvesting with desilting tanks and percolation shafts"
]
  },
  {
    "id": "RULE-MP-LDH-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Ludhiana (Punjab)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Punjab",
      "city": "Ludhiana",
      "authority": "GLADA & Municipal Corporation Ludhiana"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Ludhiana Master Plan Zoning, Buddha Nullah Buffer & Industrial Controls",
    "clause": "GLADA Master Plan 2031 & Punjab Building Rules",
    "sourceDoc": "Ludhiana Master Plan 2031 (GLADA Master Plan 2031)",
    "sourceUrl": "https://glada.gov.in/master-plan",
    "documentYear": "2031",
    "version": "Ludhiana Master Plan 2031 (Sanctioned 2018, Amended)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master development plan for Punjab industrial hub covering 650 sq.km, Focal Points, Textile/Hosiery industrial zones, Buddha Nullah rejuvenation corridor, and Ferozepur Road commercial belt.",
    "parameters": {
      "buddhaNullahBuffer": "50m mandatory green buffer along Buddha Nullah banks",
      "baseFAR": "1.50 to 2.00 based on road width (9m to 24m)",
      "commercialFAR": "Up to 3.00 FAR on Ferozepur Road 30m+ ROW",
      "maxGroundCoverage": "40% to 65% based on building use"
},
    "detailedRequirements": [
      "Industrial dyeing and electroplating units must connect to Common Effluent Treatment Plants (CETPs)",
      "Zero construction permitted inside Buddha Nullah 50m rejuvenation green corridor",
      "CGWA NOC mandatory for all industrial borewells in over-exploited Ludhiana blocks",
      "Mandatory rooftop rainwater harvesting with recharge pits for all plots >200 sq.m"
]
  },
  {
    "id": "RULE-MP-ATQ-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Amritsar (Punjab)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Punjab",
      "city": "Amritsar",
      "authority": "Amritsar Development Authority (ADA)"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Amritsar Master Plan Zoning, Golden Temple Heritage & Airport OLS",
    "clause": "Amritsar Master Plan 2031 Regulations",
    "sourceDoc": "Amritsar Master Plan 2031 (ADA Master Plan 2031)",
    "sourceUrl": "https://adaamritsar.gov.in/master-plan",
    "documentYear": "2031",
    "version": "Amritsar Master Plan 2031 (Approved & Notified)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master plan governing 512 sq.km Amritsar metropolitan region, Sri Harmandir Sahib (Golden Temple) Walled City Heritage Precinct, GT Road corridor, and Sri Guru Ram Dass Jee Airport zone.",
    "parameters": {
      "goldenTempleHeritageHeight": "11.5m strict height ceiling in Walled City surrounding Sri Harmandir Sahib",
      "airportOLSZone": "Strict height restriction under AAI CCZM for ATQ Airport",
      "baseFAR": "1.50 to 2.00 in outer urban extensions",
      "commercialFAR": "Up to 2.75 FAR on GT Road (NH-3) 30m+ ROW"
},
    "detailedRequirements": [
      "No multi-story high-rise construction permitted within Walled City heritage area to protect Golden Temple skyline",
      "AAI NOC mandatory for all developments falling in Raja Sansi Airport flight path cones",
      "Mandatory fire safety installations and underground water storage for all hotels and Dharamshalas",
      "Mandatory rooftop rainwater harvesting for all plotted properties >150 sq.m"
]
  },
  {
    "id": "RULE-MP-IDR-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Indore (Madhya Pradesh)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Madhya Pradesh",
      "city": "Indore",
      "authority": "Indore Development Authority & T&CP MP"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Indore Development Plan Zoning, Super Corridor FAR & Khan River Buffer",
    "clause": "Indore Development Plan Regulations & MP Bhumi Vikas Niyam 2012",
    "sourceDoc": "Indore Development Plan 2021 & Draft Master Plan 2035 (IDA Master Plan)",
    "sourceUrl": "https://idaindore.org/master-plan/",
    "documentYear": "2035",
    "version": "Indore Development Plan 2021 Enforced (with Draft 2035 Provisions)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master planning framework governing 1,013 sq.km Indore Planning Area, Super Corridor, AB Road BRTS transit spine, Pithampur Industrial Corridor, and Khan Riverfront.",
    "parameters": {
      "superCorridorFAR": "Up to 3.00 FAR for IT / Institutional / Commercial projects on 75m Super Corridor",
      "metroTODFAR": "Up to 3.00 FAR within 500m of Indore Metro / BRTS corridor",
      "khanRiverBuffer": "30m to 50m green buffer along Khan river banks",
      "baseFAR": "1.25 to 1.75 based on road width (9m to 24m)"
},
    "detailedRequirements": [
      "Super Corridor projects must provide 15% mandatory green landscape cover and architecturally screened parking",
      "Basement construction prohibited within Khan River high flood levels",
      "Mandatory dual-piping STP and zero waste segregation in all group housing schemes >2,000 sq.m",
      "Mandatory solar water heating and rooftop solar PV for commercial/institutional establishments >500 sq.m"
]
  },
  {
    "id": "RULE-MP-BHO-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Bhopal (Madhya Pradesh)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Madhya Pradesh",
      "city": "Bhopal",
      "authority": "Town & Country Planning MP & Bhopal Municipal Corporation"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Bhopal Master Plan Zoning, Upper Lake Ramsar Buffer & Hoshangabad Rd FAR",
    "clause": "Bhopal Development Plan 2031 & MP Bhumi Vikas Niyam",
    "sourceDoc": "Bhopal Development Plan 2031 (Master Plan 2031)",
    "sourceUrl": "https://tcp.mp.gov.in/master-plans/bhopal",
    "documentYear": "2031",
    "version": "Bhopal Development Plan 2031 (Sanctioned & Enforced)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master plan governing 813 sq.km Bhopal Capital Region, Upper Lake (Bhoj Wetland Ramsar Site), Kaliasot River, Hoshangabad Road commercial corridor, and Metro Phase 1.",
    "parameters": {
      "upperLakeRamsarBuffer": "50m strict no-construction buffer from Bhoj Wetland Full Tank Level (FTL)",
      "kaliasotDamBuffer": "33m green buffer along Kaliasot river/dam reservoir",
      "hoshangabadRoadFAR": "Up to 2.50 FAR on 30m+ NH-46 corridor",
      "baseFAR": "1.25 to 1.75 based on road width"
},
    "detailedRequirements": [
      "Zero sewage discharge permitted into Bhoj Wetland; all nearby establishments must have 100% recycling STPs",
      "Construction on hill slopes exceeding 20 degrees prohibited in Shyamla Hills and Arera Hills",
      "Mandatory rainwater harvesting with recharge wells for all plots >100 sq.m",
      "Fire NOC mandatory from MP Fire & Emergency Services for buildings >15m height"
]
  },
  {
    "id": "RULE-MP-COK-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Kochi (Kerala)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Kerala",
      "city": "Kochi",
      "authority": "Greater Cochin Development Authority (GCDA)"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Kochi Master Plan Zoning, CRZ Backwater Buffers & Metro TOD Norms",
    "clause": "Kochi Master Plan 2040 & Kerala Municipality Building Rules (KMBR 2019)",
    "sourceDoc": "Kochi City Master Plan 2040 (GCDA Master Plan 2040)",
    "sourceUrl": "https://gcda.kerala.gov.in/masterplan",
    "documentYear": "2040",
    "version": "Kochi Master Plan 2040 (Sanctioned by Kerala Govt 2023)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master development plan covering 369 sq.km Kochi Metropolitan Region, Vembanad Lake CRZ-I/II tidal zones, Kochi Metro TOD corridors, Water Metro terminals, and Kakkanad Infopark IT hub.",
    "parameters": {
      "backwaterCRZBuffer": "Strictly regulated under CRZ Notification 2019 / KCZMA",
      "metroTODFAR": "Up to 4.00 FAR (Base FAR 2.50 + Purchasable FAR) along Metro corridor",
      "infoparkBaseFAR": "Up to 3.25 for IT / ITES developments on 18m+ road",
      "baseFAR": "1.50 to 2.50 in standard municipal zones"
},
    "detailedRequirements": [
      "CRZ clearance from Kerala Coastal Zone Management Authority (KCZMA) mandatory for waterfront plots",
      "Mangalavanam Bird Sanctuary 100m buffer strictly prohibits high-rises and night illumination",
      "Mandatory rainwater harvesting storage tanks @ 25 liters per sq.m of roof area",
      "Mandatory dual-piping STP for all commercial buildings >1,000 sq.m and residential apartments >10 units"
]
  },
  {
    "id": "RULE-MP-TRV-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Thiruvananthapuram (Kerala)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Kerala",
      "city": "Thiruvananthapuram",
      "authority": "TRIDA & Town & Country Planning Kerala"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Trivandrum Master Plan Zoning, Padmanabhaswamy Temple & Technopark Controls",
    "clause": "TRIDA Master Plan 2040 Regulations & KMBR 2019",
    "sourceDoc": "Thiruvananthapuram Master Plan 2040 (TRIDA Master Plan)",
    "sourceUrl": "https://trida.kerala.gov.in/master-plan/",
    "documentYear": "2040",
    "version": "Thiruvananthapuram Master Plan 2040 (Sanctioned 2023)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master plan governing 215 sq.km Kerala State Capital, Technopark IT corridor, Vizhinjam International Seaport hinterland, Sree Padmanabhaswamy Temple Heritage Zone, and coastal belts.",
    "parameters": {
      "templeHeritageHeight": "10.0m strict height ceiling in East Fort / Temple Precinct",
      "technoparkBaseFAR": "Up to 3.25 FAR on 18m+ road with purchasable FAR up to 4.00",
      "vizhinjamPortBuffer": "Special port logistics zoning with dedicated heavy vehicle ROW",
      "baseFAR": "1.50 to 2.50 based on road width (7m to 18m+)"
},
    "detailedRequirements": [
      "Heritage Conservation Committee NOC mandatory for any construction or renovation within Fort wall precincts",
      "AAI NOC mandatory for structures falling in Trivandrum International Airport (TRV) OLS cones",
      "Mandatory rainwater harvesting system with 25L/sq.m storage reservoir",
      "Mandatory STP and solar power integration for all commercial developments >1,500 sq.m"
]
  },
  {
    "id": "RULE-MP-VTZ-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Visakhapatnam (Andhra Pradesh)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Andhra Pradesh",
      "city": "Visakhapatnam",
      "authority": "Visakhapatnam Metropolitan Region Development Authority"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Visakhapatnam VMRDA Zoning, Beach Road CRZ & Hill Slope Norms",
    "clause": "VMRDA Master Plan 2041 & AP Building Rules 2017 (G.O. Ms. 119)",
    "sourceDoc": "Visakhapatnam Metropolitan Region Master Plan 2041 (VMRDA Master Plan)",
    "sourceUrl": "https://vmrda.gov.in/master-plan-2041/",
    "documentYear": "2041",
    "version": "VMRDA Master Plan 2041 (Sanctioned 2021)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master development plan covering 4,873 sq.km Visakhapatnam Metropolitan Region, Beach Road CRZ corridor, Steel Plant / Pharma City industrial belts, and Bhogapuram Airport zone.",
    "parameters": {
      "beachRoadCRZBuffer": "Strictly regulated under CRZ Notification 2019 / APCZMA",
      "hillSlopeBan": "No construction permitted on slopes exceeding 30 degrees",
      "permissibleFSI": "Non-capped / Unlimited under AP Building Rules based on road width & setbacks",
      "minRoadWidthHighRise": "12.0m for height up to 18m; 18.0m for height up to 30m; 24.0m for >30m"
},
    "detailedRequirements": [
      "Non-capped FSI permitted subject to complete adherence to statutory setbacks and road width criteria",
      "Hill slope development requires geological stability report from IIT / NIT / AU Engineering Department",
      "Coastal plots require prior CRZ clearance from Andhra Pradesh Coastal Zone Management Authority",
      "Mandatory 10% open space gift deed for layout/group housing plots >3,000 sq.m"
]
  },
  {
    "id": "RULE-MP-BZA-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Vijayawada (Andhra Pradesh)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Andhra Pradesh",
      "city": "Vijayawada",
      "authority": "APCRDA & VGTMUDA"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Vijayawada & Amaravati APCRDA Zoning, Krishna River Buffers & FSI Norms",
    "clause": "APCRDA Master Plan Regulations & AP Building Rules",
    "sourceDoc": "Amaravati & VGTM Master Plan 2031 (APCRDA / VGTMUDA Master Plan)",
    "sourceUrl": "https://crda.ap.gov.in/master-plan/",
    "documentYear": "2031",
    "version": "Amaravati Capital City Master Plan & VGTM Master Plan",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master planning instrument governing 8,603 sq.km Amaravati Capital Region, Vijayawada, Guntur, Tenali, Mangalagiri, and Krishna Riverfront.",
    "parameters": {
      "krishnaRiverBuffer": "100m no-development buffer from Krishna River high flood level",
      "permissibleFSI": "Non-capped / Unlimited under AP Building Rules linked to setbacks & road width",
      "amaravatiThemeCityFSI": "Up to 4.00 FSI in Financial & Knowledge Theme Cities",
      "minRoadWidthHighRise": "12.0m to 24.0m based on proposed building height"
},
    "detailedRequirements": [
      "Zero construction permitted inside Krishna River active floodway and flood retention reservoirs",
      "AAI NOC mandatory for all constructions falling under Gannavaram Airport CCZM grid",
      "Mandatory 100% wastewater recycling and dual piping for all commercial and institutional complexes",
      "Mandatory rooftop rainwater harvesting with deep recharge shafts across all plotted developments"
]
  },
  {
    "id": "RULE-MP-CJB-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Coimbatore (Tamil Nadu)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Tamil Nadu",
      "city": "Coimbatore",
      "authority": "Coimbatore LPA & DTCP Tamil Nadu"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Coimbatore Master Plan Zoning, HACA Hill Area & Noyyal Buffers",
    "clause": "Coimbatore LPA Master Plan & TNCDBR 2019",
    "sourceDoc": "Coimbatore Local Planning Area Master Plan 2035 (Coimbatore Master Plan)",
    "sourceUrl": "https://tcp.tn.gov.in/master-plan-coimbatore",
    "documentYear": "2035",
    "version": "Coimbatore LPA Master Plan 2035 (Sanctioned & Enforced)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master development plan governing 1,531 sq.km Coimbatore industrial and textile hub, Avinashi Road IT/Commercial corridor, Western Ghats Hill Conservation, and Noyyal Riverfront.",
    "parameters": {
      "hacaZoneBuffer": "Strict HACA clearance required for Western Ghats foothill panchayats",
      "noyyalRiverBuffer": "50m green buffer along Noyyal river banks",
      "baseFSI": "1.50 to 2.00 (Non-High Rise); 2.00 Base FSI (High Rise)",
      "premiumFSI": "Up to 50% additional FSI on roads >=18.0m width"
},
    "detailedRequirements": [
      "Developments in HACA notified village panchayats require Hill Area Conservation Authority state-level sanction",
      "Foundry and textile dyeing units must be located in designated industrial estates with Zero Liquid Discharge (ZLD)",
      "Mandatory 10% Open Space Reservation (OSR) for land layouts exceeding 3,000 sq.m",
      "Mandatory rooftop rainwater harvesting with percolation pits for all building categories"
]
  },
  {
    "id": "RULE-MP-IXM-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Madurai (Tamil Nadu)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Tamil Nadu",
      "city": "Madurai",
      "authority": "Madurai LPA & DTCP Tamil Nadu"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Madurai Master Plan Zoning, Meenakshi Temple Heritage & Vaigai Buffers",
    "clause": "Madurai LPA Master Plan & TNCDBR 2019 Part VI",
    "sourceDoc": "Madurai Local Planning Area Master Plan 2031 (Madurai Master Plan)",
    "sourceUrl": "https://tcp.tn.gov.in/master-plan-madurai",
    "documentYear": "2031",
    "version": "Madurai LPA Master Plan (Sanctioned & Harmonized with TNCDBR)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master planning instrument governing 780 sq.km Madurai cultural center, Meenakshi Sundareswarar Temple Heritage Precinct, Vaigai Riverfront, and Ring Road growth corridors.",
    "parameters": {
      "meenakshiTempleHeightCap": "9.0m strict height ceiling within 1km of Meenakshi Temple Gopurams",
      "vaigaiRiverBuffer": "50m no-development buffer along Vaigai river banks",
      "baseFSI": "1.50 to 2.00 (Non-High Rise); 2.00 Base FSI (High Rise outside temple zone)",
      "premiumFSI": "Up to 50% additional FSI on 18m+ roads"
},
    "detailedRequirements": [
      "Strict prohibition of high-rise construction within 1km radius of Meenakshi Amman Temple to preserve skyline of Gopurams",
      "All constructions in Walled heritage core require Madurai Heritage Conservation Committee NOC",
      "Mandatory 10% OSR surrender for layouts exceeding 3,000 sq.m",
      "Mandatory rooftop rainwater harvesting with desilting tanks for all plots"
]
  },
  {
    "id": "RULE-MP-NAG-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Nagpur (Maharashtra)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Nagpur",
      "authority": "Nagpur Metropolitan Region Development Authority"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Nagpur NMRDA Master Plan Zoning, MIHAN SEZ & Metro TOD Norms",
    "clause": "NMRDA DP Regulations & Maharashtra UDCPR Chapter 11",
    "sourceDoc": "Nagpur Metropolitan Area Development Plan 2032 (NMRDA Master Plan)",
    "sourceUrl": "https://nmrda.org/development-plan/",
    "documentYear": "2032",
    "version": "NMRDA Sanctioned DP 2032 (Harmonized with Maharashtra UDCPR)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master development plan governing 3,567 sq.km Nagpur Metropolitan Region, MIHAN (Multi-modal International Cargo Hub and Airport at Nagpur), Wardha Road, and Metro corridors.",
    "parameters": {
      "mihanSEZFAR": "Up to 3.50 Base + Additional FSI in MIHAN Special Hub",
      "metroTODFAR": "Up to 4.00 FSI within 500m of Nagpur Metro stations on 24m+ road",
      "nagRiverBuffer": "30m green buffer along Nag river banks",
      "baseFSI": "1.10 Base FSI expandable via Premium & TDR up to 2.50 - 3.50"
},
    "detailedRequirements": [
      "Dr. Babasaheb Ambedkar International Airport (NAG) AAI NOC mandatory for all constructions in MIHAN and Wardha Road",
      "10% amenity space surrender mandatory for residential/commercial layouts on plots >4,000 sq.m under UDCPR",
      "Zero untreated sewage discharge permitted into Nag River or Ambazari Lake catchment",
      "Mandatory dual water supply and 100% wastewater recycling on schemes >5,000 sq.m"
]
  },
  {
    "id": "RULE-MP-NSK-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Nashik (Maharashtra)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Nashik",
      "authority": "Nashik Municipal Corporation (NMC)"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Nashik Development Plan Zoning, Godavari Kumbh Plains & Dam Buffers",
    "clause": "Nashik DP Regulations & Maharashtra UDCPR Chapter 3",
    "sourceDoc": "Nashik Revised Development Plan 2036 (NMC Master Plan)",
    "sourceUrl": "https://nashikcorporation.in/development-plan/",
    "documentYear": "2036",
    "version": "Nashik Revised DP (Sanctioned & Harmonized with UDCPR)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master plan governing 259 sq.km Nashik urban area, Godavari Riverfront Kumbh Mela grounds, Gangapur Dam catchment, Ambad/Satpur industrial zones, and Mumbai-Nashik Expressway corridor.",
    "parameters": {
      "godavariBlueLine": "Strict Zero Development inside Godavari River Blue Flood Line",
      "gangapurDamBuffer": "100m no-development buffer from Gangapur Dam reservoir high flood level",
      "baseFSI": "1.10 Base FSI expandable up to 2.50 via Premium FSI and TDR",
      "kumbhMelaBuffer": "Zero permanent construction in designated Trimbak/Ramkund Kumbh grounds"
},
    "detailedRequirements": [
      "Strict prohibition of permanent RCC structures within Godavari River Blue Flood Line and Kumbh Mela grounds",
      "Industrial units in Ambad/Satpur MIDC must connect to CETP and achieve zero liquid discharge",
      "10% amenity space surrender mandatory for layouts >4,000 sq.m under UDCPR",
      "Mandatory rooftop rainwater harvesting for all plots exceeding 100 sq.m"
]
  },
  {
    "id": "RULE-MP-NMA-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Navi Mumbai (Maharashtra)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Navi Mumbai",
      "authority": "CIDCO & Navi Mumbai Municipal Corporation"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Navi Mumbai DP Zoning, NAINA Airport CCZM & Palm Beach Road FSI",
    "clause": "CIDCO NAINA DCR & Navi Mumbai Building Bye-Laws",
    "sourceDoc": "Navi Mumbai Development Plan (CIDCO & NMMC Master Plan)",
    "sourceUrl": "https://nmmc.gov.in/navimumbaidp",
    "documentYear": "2031",
    "version": "Navi Mumbai Sanctioned DP & Navi Mumbai Airport Influence Notified Area (NAINA)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master planning instrument governing 343 sq.km Navi Mumbai planned city, NAINA (Navi Mumbai Airport Influence Notified Area), Palm Beach Road, and JNPA Port logistics corridors.",
    "parameters": {
      "nainaBaseFSI": "1.00 Base FSI expandable up to 2.50 via Premium FSI & TDR",
      "nmiaAirportOLS": "Strict height restriction governed by NMIA CCZM grid",
      "palmBeachRoadFSI": "Up to 2.50 - 3.00 FSI on designated arterial roads",
      "crzMangroveBuffer": "50m buffer from notified CRZ-I mangrove boundary (zero development)"
},
    "detailedRequirements": [
      "AAI / CIDCO NMIA NOC mandatory for all constructions falling in airport obstacle cones across Ulwe, Dronagiri, Panvel",
      "Strict zero construction within 50m buffer of CRZ-I mangroves under High Court directives",
      "Mandatory dual plumbing STP and rainwater harvesting for all plotted schemes >1,000 sq.m",
      "Mandatory stack/puzzle parking systems where ground plot footprint is constrained"
]
  },
  {
    "id": "RULE-MP-THN-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Thane (Maharashtra)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Maharashtra",
      "city": "Thane",
      "authority": "Thane Municipal Corporation (TMC)"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Thane DP Zoning, Cluster Redevelopment & SGNP Eco-Sensitive Buffers",
    "clause": "Thane DP Regulations & Maharashtra UDCPR Regulation 14",
    "sourceDoc": "Thane City Revised Development Plan (TMC Master Plan)",
    "sourceUrl": "https://thanecity.gov.in/development-plan/",
    "documentYear": "2031",
    "version": "Thane Revised DP (Sanctioned & Harmonized with UDCPR)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master planning framework governing 128 sq.km Thane City, Ghodbunder Road commercial/residential growth corridor, Thane Creek CRZ zone, Sanjay Gandhi National Park buffer, and Cluster Redevelopment.",
    "parameters": {
      "clusterRedevelopmentFSI": "Up to 4.00 FSI for cluster redevelopment of authorized/unauthorized cessed structures",
      "ghodbunderRoadFSI": "Up to 2.50 - 3.50 FSI (Base + Premium + TDR) on 30m+ ROW",
      "sgnpEcoBuffer": "Special NBWL clearance required within notified SGNP Eco-Sensitive Zone",
      "thaneCreekCRZBuffer": "Strict CRZ-I & CRZ-II compliance along Ulhas River and Thane Creek"
},
    "detailedRequirements": [
      "Cluster redevelopment schemes require minimum 10,000 sq.m contiguous land parcel and 70% tenant consent",
      "Developments in SGNP ESZ require Standing Committee of National Board for Wildlife (SC-NBWL) NOC",
      "10% amenity space surrender mandatory for layouts >4,000 sq.m under UDCPR",
      "Mandatory dual-piping STP and 100% wastewater recycling on all group housing schemes >4,000 sq.m"
]
  },
  {
    "id": "RULE-MP-BDQ-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Vadodara (Gujarat)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Gujarat",
      "city": "Vadodara",
      "authority": "VUDA & Vadodara Municipal Corporation"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Vadodara VUDA Zoning, Vishwamitri River Buffer & Bullet Train TOD",
    "clause": "VUDA CDP-2031 Regulations & Gujarat CGDCR",
    "sourceDoc": "Vadodara Comprehensive Development Plan 2031 (VUDA Master Plan 2031)",
    "sourceUrl": "https://vuda.co.in/cdp-2031/",
    "documentYear": "2031",
    "version": "VUDA Second Revised DP 2031 (Sanctioned & Enforced)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master development plan governing 714 sq.km Vadodara Urban Development Area, Vishwamitri Riverfront, Petrochemical / GIDC industrial belts, and Mumbai-Ahmedabad Bullet Train influence zone.",
    "parameters": {
      "vishwamitriRiverBuffer": "50m strict riparian and crocodile habitat protection buffer",
      "bulletTrainTODFAR": "Up to 4.00 FSI in Bullet Train / Railway Station influence zone",
      "r1BaseFSI": "1.80 Base FSI (up to 2.70 Chargeable FSI on 18m+ road)",
      "petrochemicalBuffer": "500m safety buffer from petrochemical refinery and fertilizer complexes"
},
    "detailedRequirements": [
      "Zero construction permitted inside Vishwamitri River high flood line and crocodile breeding zones",
      "Chargeable FSI purchasable at 40% of Jantri value from VUDA / VMC",
      "Mandatory percolation well and rainwater harvesting reservoir for all plots >500 sq.m",
      "Mandatory industrial effluent pre-treatment and connection to CETP in GIDC zones"
]
  },
  {
    "id": "RULE-MP-RAJ-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Rajkot (Gujarat)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Gujarat",
      "city": "Rajkot",
      "authority": "RUDA & Rajkot Municipal Corporation"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Rajkot RUDA Master Plan Zoning, Hirasar Airport CCZM & Dam Buffers",
    "clause": "RUDA DP-2031 Regulations & Gujarat CGDCR",
    "sourceDoc": "Rajkot Comprehensive Development Plan 2031 (RUDA Master Plan 2031)",
    "sourceUrl": "https://ruda.gov.in/development-plan/",
    "documentYear": "2031",
    "version": "RUDA Revised DP 2031 (Approved & Enforced)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master plan governing 686 sq.km Saurashtra commercial capital, Hirasar International Airport influence zone, AIIMS Rajkot institutional zone, and Aji / Nyari Dam catchment buffers.",
    "parameters": {
      "hirasarAirportOLS": "Governed by AAI CCZM grid for Hirasar International Airport",
      "ajiNyariDamBuffer": "100m strict no-development buffer from reservoir high flood levels",
      "r1BaseFSI": "1.80 Base FSI (up to 2.70 via Chargeable FSI on 18m+ road)",
      "ringRoad2FSI": "Up to 3.00 FSI on 45m Ring Road 2 arterial corridor"
},
    "detailedRequirements": [
      "AAI NOC mandatory for all constructions falling in Hirasar Airport flight approach paths",
      "No construction permitted inside drinking water catchment reservoirs of Aji and Nyari dams",
      "Mandatory rainwater harvesting percolation wells for all plots >300 sq.m",
      "Mandatory dual-piping STP for all commercial complexes >2,000 sq.m"
]
  },
  {
    "id": "RULE-MP-BBI-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Bhubaneswar (Odisha)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Odisha",
      "city": "Bhubaneswar",
      "authority": "Bhubaneswar Development Authority (BDA)"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Bhubaneswar CDP Zoning, Lingaraj Heritage & Chandaka Eco-Buffers",
    "clause": "BDA CDP-2030 Regulations & Odisha BPAR 2020",
    "sourceDoc": "Bhubaneswar Comprehensive Development Plan 2030 (CDP-2030)",
    "sourceUrl": "https://bda.gov.in/comprehensive-development-plan/",
    "documentYear": "2030",
    "version": "BDA CDP-2030 (Sanctioned & Harmonized with ODA BPAR 2020)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Statutory development plan covering 397 sq.km Bhubaneswar Urban Knowledge Hub, Old Town Temple Heritage Precinct, Infocity IT SEZ, and Chandaka Elephant Sanctuary buffer.",
    "parameters": {
      "lingarajTempleHeight": "12.0m strict height ceiling in Old Town / Ekamra Kshetra",
      "chandakaESZBuffer": "1km Eco-Sensitive Zone with strict restriction on commercial/industrial construction",
      "baseFAR": "1.50 to 2.75 based on road width (9m to 24m+)",
      "purchasableFAR": "Up to 0.50 additional FAR on payment of BDA bench fees"
},
    "detailedRequirements": [
      "All developments in Old Town Ekamra Kshetra require Heritage Conservation Advisory Committee NOC",
      "Projects in Chandaka Elephant Sanctuary ESZ require State Wildlife Board / NBWL clearance",
      "Mandatory 10% open space gift deed for layout developments exceeding 2,000 sq.m",
      "Mandatory rooftop rainwater harvesting with recharge pit for all plots >100 sq.m"
]
  },
  {
    "id": "RULE-MP-CTC-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Cuttack (Odisha)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Odisha",
      "city": "Cuttack",
      "authority": "Cuttack Development Authority (CDA)"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Cuttack CDA Master Plan Zoning, Mahanadi River Bunds & Heritage Norms",
    "clause": "CDA CDP-2030 Regulations & Odisha BPAR 2020",
    "sourceDoc": "Cuttack Comprehensive Development Plan 2030 (CDA Master Plan)",
    "sourceUrl": "https://cda.nic.in/master-plan/",
    "documentYear": "2030",
    "version": "CDA CDP-2030 (Sanctioned & Enforced)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master development plan governing 198 sq.km Millennium City Cuttack, Mahanadi & Kathajodi River island geography, Barabati Fort Heritage Zone, and CDA Satellite Sectors.",
    "parameters": {
      "riverEmbankmentBuffer": "50m strict no-construction buffer from Mahanadi & Kathajodi Ring Road bunds",
      "barabatiFortBuffer": "100m prohibited / 200m regulated buffer from ASI Barabati Fort moat",
      "baseFAR": "1.50 to 2.50 based on road width (9m to 24m)",
      "maxGroundCoverage": "40% to 65% based on occupancy"
},
    "detailedRequirements": [
      "Zero construction permitted outside the protective river embankment walls in active flood beds",
      "Barabati Fort monument zone requires prior ASI and CDA Heritage Cell sanction",
      "Mandatory rooftop rainwater harvesting with filtration chambers for all plots >100 sq.m",
      "Mandatory dual water supply for group housing schemes >20 residential units"
]
  },
  {
    "id": "RULE-MP-PAT-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Patna (Bihar)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Bihar",
      "city": "Patna",
      "authority": "Patna Regional Development Authority & BUIDCO"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Patna Master Plan 2031 Zoning, Ganga River Buffer & Metro TOD Controls",
    "clause": "Patna Master Plan 2031 & Bihar Building Bye-Laws 2014 (Amended 2022)",
    "sourceDoc": "Patna Master Plan 2031 (PRDA / BUIDCO Master Plan 2031)",
    "sourceUrl": "https://buidco.bihar.gov.in/master-plan-patna",
    "documentYear": "2031",
    "version": "Patna Master Plan 2031 (Approved by Bihar Cabinet 2016, Enforced)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Statutory master plan governing 1,167 sq.km Patna Metropolitan Region, Ganga Riverfront Drive, Bihta Airport / IT Hub, Patna Metro Corridors, and Punpun floodplains.",
    "parameters": {
      "gangaRiverBuffer": "200m no-development buffer from Ganga high flood level",
      "metroTODFAR": "Up to 3.50 FAR within 500m of Patna Metro stations on 24m+ road",
      "baseFAR": "1.50 to 2.50 based on road width (9m to 24m)",
      "bihtaHubFAR": "Up to 3.00 FAR for institutional and tech parks in Bihta"
},
    "detailedRequirements": [
      "Strict prohibition of permanent RCC constructions within 200m of Ganga River edge",
      "Bihta Airport AAI NOC mandatory for all constructions falling under flight approach funnels",
      "Mandatory rooftop rainwater harvesting with recharge well for all plots >100 sq.m",
      "Mandatory STP with zero untreated discharge for group housing >3,000 sq.m"
]
  },
  {
    "id": "RULE-MP-IXR-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Ranchi (Jharkhand)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Jharkhand",
      "city": "Ranchi",
      "authority": "Ranchi Regional Development Authority (RRDA)"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Ranchi Master Plan Zoning, Dhurwa Smart City & Water Reservoir Buffers",
    "clause": "RRDA Master Plan 2037 & Jharkhand Municipal Building Bye-laws",
    "sourceDoc": "Ranchi Master Plan 2037 (RRDA Master Plan 2037)",
    "sourceUrl": "https://rrda.jharkhand.gov.in/masterplan",
    "documentYear": "2037",
    "version": "Ranchi Master Plan 2037 (Approved & Enforced)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master development plan governing 652 sq.km Ranchi Capital Region, Core Capital Area (Dhurwa Smart City), Subarnarekha River catchment, and Kanke / Hatia Dam buffers.",
    "parameters": {
      "dhurwaSmartCityFAR": "Up to 3.50 FAR in designated Ranchi Smart City Knowledge & Commercial Hub",
      "damCatchmentBuffer": "100m strict no-development buffer from Kanke and Hatia dam reservoirs",
      "baseFAR": "1.50 to 2.50 based on road width (9m to 24m)",
      "airportOLSZone": "Governed by AAI CCZM for Birsa Munda Airport Ranchi"
},
    "detailedRequirements": [
      "CNT / SPT Act tribal land transfer restrictions strictly verified prior to building plan sanction",
      "AAI NOC mandatory for all constructions falling in Birsa Munda Airport obstacle surfaces",
      "Zero sewage discharge into Kanke, Hatia, and Getalsud dam reservoirs",
      "Mandatory rooftop rainwater harvesting with percolation pits for all plots >100 sq.m"
]
  },
  {
    "id": "RULE-MP-GAU-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Guwahati (Assam)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Assam",
      "city": "Guwahati",
      "authority": "Guwahati Metropolitan Development Authority (GMDA)"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Guwahati Master Plan Zoning, Deepor Beel Ramsar & Nilachal Hill Buffers",
    "clause": "GMDA Master Plan 2025 & Assam Building Byelaws 2014",
    "sourceDoc": "Guwahati Master Plan 2025 & Draft Master Plan 2045 (GMDA Master Plan)",
    "sourceUrl": "https://gmda.assam.gov.in/documents-detail/master-plan",
    "documentYear": "2025",
    "version": "Guwahati Master Plan 2025 (with Draft 2045 Regional Plan Extensions)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master planning instrument governing 262 sq.km Gateway to Northeast, Deepor Beel Ramsar Site, Brahmaputra Riverfront, Kamakhya Temple Heritage Zone, and Seismic Zone V building controls.",
    "parameters": {
      "deeporBeelBuffer": "Strict Zero Development inside Deepor Beel Ramsar boundary & 500m eco-buffer",
      "nilachalHillsHeight": "8.5m to 11.5m strict height ceiling in Kamakhya Temple precinct",
      "seismicZoneDesign": "Seismic Zone V ductile detailing mandatory for all structures",
      "baseFAR": "1.25 to 2.00 based on road width (6m to 18m+)"
},
    "detailedRequirements": [
      "Deepor Beel Ramsar boundary completely prohibited for any residential, commercial, or industrial development",
      "Hill slope cutting without certified soil retention and drainage plan strictly prohibited under GMDA Act",
      "Structural stability certificate from empanelled IIT/NIT/AEC structural engineer mandatory for G+2 and above",
      "Mandatory rooftop rainwater harvesting with silt trap for all plots >100 sq.m"
]
  },
  {
    "id": "RULE-MP-DED-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Dehradun (Uttarakhand)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Uttarakhand",
      "city": "Dehradun",
      "authority": "Mussoorie Dehradun Development Authority (MDDA)"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Dehradun MDDA Master Plan Zoning, Doon Valley Eco-Zone & Hill Slopes",
    "clause": "MDDA Master Plan 2025 & Uttarakhand Building Byelaws 2011",
    "sourceDoc": "Dehradun Master Plan 2025 & Mussoorie Special Area (MDDA Master Plan)",
    "sourceUrl": "https://mddaonline.in/master-plan/",
    "documentYear": "2025",
    "version": "Dehradun Master Plan 2025 (Harmonized with Uttarakhand Building Bye-Laws)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master development plan governing 312 sq.km Doon Valley Eco-Fragile Zone, Rajpur Road commercial spine, Rispana & Bindal riverfronts, and Mussoorie Hill Station.",
    "parameters": {
      "doonValleyEcoBan": "Strict MoEFCC ban on polluting industries across Doon Valley basin",
      "mussoorieHeightCap": "11.0m strict height ceiling for hill station structures in Mussoorie",
      "hillSlopeBan": "No construction on natural slopes steeper than 30 degrees",
      "baseFAR": "1.20 to 1.75 based on road width"
},
    "detailedRequirements": [
      "Doon Valley Special Notification compliance mandatory; all developments must obtain Uttarakhand PCB NOC",
      "Construction on steep hill slopes requires geo-technical stability vetting from CBRI Roorkee or IIT Roorkee",
      "Mandatory rooftop rainwater harvesting with deep recharge pits for all plots >100 sq.m",
      "Solar water heating system mandatory for all hotels, guest houses, and residential bungalows >300 sq.m"
]
  },
  {
    "id": "RULE-MP-SLV-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Shimla (Himachal Pradesh)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Himachal Pradesh",
      "city": "Shimla",
      "authority": "Town & Country Planning Himachal Pradesh"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Shimla Development Plan 2041 Zoning, Green Belts & Heritage Core Controls",
    "clause": "Shimla Development Plan 2041 & HP TCP Rules 2014",
    "sourceDoc": "Shimla Development Plan 2041 (SADA / TCP Himachal Pradesh)",
    "sourceUrl": "https://tcp.hp.gov.in/shimla-plan",
    "documentYear": "2041",
    "version": "Shimla Development Plan 2041 (Sanctioned & Supreme Court Approved 2024)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Statutory development plan governing 22,450 hectares Shimla Planning Area, Core Heritage Area, Green / Forest Belts, Sinking / Sliding Zones, and Special Area Development Authorities.",
    "parameters": {
      "coreHeritageHeight": "2 storeys + attic (max 10.0m) with traditional sloping pitched roof",
      "greenBeltMoratorium": "Zero new construction in 17 notified green/forest belts",
      "nonCoreHeight": "3 storeys + parking/attic (max 14.5m) based on road width and slope",
      "baseFAR": "1.00 to 1.50 with mandatory sloping roof and stone/wood cladding"
},
    "detailedRequirements": [
      "Supreme Court sanctioned height limits (2 storeys in Core, 3 storeys in Non-Core) strictly enforced",
      "No construction permitted in 17 notified deodar forest belts or sliding/sinking hazard zones",
      "All roofs must have minimum 30 to 45 degree pitched sloping design with green/red CGI sheets or slate",
      "Mandatory rainwater harvesting collection tanks @ 20 liters per sq.m of roof footprint"
]
  },
  {
    "id": "RULE-MP-SXR-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Srinagar (Jammu & Kashmir)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Jammu & Kashmir",
      "city": "Srinagar",
      "authority": "Srinagar Development Authority (SDA)"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Srinagar Master Plan Zoning, Dal Lake LCMA Buffer & Jhelum Plains",
    "clause": "Srinagar Master Plan 2035 & J&K Unified Building Bye-Laws 2021",
    "sourceDoc": "Srinagar Master Plan 2035 (SDA Master Plan 2035)",
    "sourceUrl": "https://sdasrinagar.jk.gov.in/master-plan-2035/",
    "documentYear": "2035",
    "version": "Srinagar Master Plan 2035 (Sanctioned by J&K Govt)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master development plan covering 766 sq.km Srinagar Metropolitan Region, Dal Lake / Nigeen Lake conservation zones, Jhelum River floodplains, and Seismic Zone V building controls.",
    "parameters": {
      "dalLakeLCMABuffer": "200m strict no-construction buffer from Dal Lake & Boulevard Road under LCMA",
      "jhelumFloodwayBuffer": "Strict Zero Development inside Jhelum River active floodway & spill channels",
      "seismicZoneDesign": "Seismic Zone V ductile detailing mandatory for all structural components",
      "baseFAR": "1.20 to 1.80 based on road width"
},
    "detailedRequirements": [
      "J&K Lake Conservation and Management Authority (LCMA) NOC mandatory for all plots within 500m of Dal/Nigeen lakes",
      "No permanent construction permitted inside Jhelum river active floodway and Kandizal retention basin",
      "Traditional Kashmiri architectural elements (pitched roofs, Maharaji bricks, wood carvings) encouraged in heritage cores",
      "Mandatory dual water supply and rooftop rainwater harvesting for all new commercial establishments"
]
  },
  {
    "id": "RULE-MP-IXJ-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Jammu (Jammu & Kashmir)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Jammu & Kashmir",
      "city": "Jammu",
      "authority": "Jammu Development Authority (JDA)"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Jammu Master Plan Zoning, Tawi River Buffers & Industrial Controls",
    "clause": "Jammu Master Plan 2032 & J&K Unified Building Bye-Laws 2021",
    "sourceDoc": "Jammu Master Plan 2032 (JDA Master Plan 2032)",
    "sourceUrl": "https://jammuda.jk.gov.in/master-plan-2032/",
    "documentYear": "2032",
    "version": "Jammu Master Plan 2032 (Sanctioned & Enforced)",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master development plan governing 652 sq.km Jammu Urban Area, Tawi Riverfront, Jammu-Pathankot Highway commercial belt, Bari Brahmana Industrial Zone, and Jammu Airport influence zone.",
    "parameters": {
      "tawiRiverBuffer": "30m to 50m green buffer along Tawi river high flood mark",
      "baseFAR": "1.50 to 2.25 based on road width (9m to 24m)",
      "airportOLSZone": "Governed by AAI CCZM for Jammu Civil Enclave Airport",
      "maxGroundCoverage": "40% to 65% based on occupancy"
},
    "detailedRequirements": [
      "AAI NOC mandatory for all constructions falling in Jammu Airport flight obstacle cones",
      "Zero untreated sewage discharge permitted into Tawi River",
      "Mandatory rooftop rainwater harvesting with recharge pits for all plots >100 sq.m",
      "Fire NOC mandatory from J&K Fire & Emergency Services for buildings >15m height"
]
  },
  {
    "id": "RULE-MP-RPR-001",
    "tier": "city_authority",
    "level": 3,
    "levelName": "Level 3: Master Plan & Zonal Regulations",
    "jurisdiction": "Raipur (Chhattisgarh)",
    "jurisdictionScope": {
      "country": "India",
      "state": "Chhattisgarh",
      "city": "Raipur",
      "authority": "Raipur Development Authority & Nava Raipur Development Authority"
    },
    "category": "far_fsi",
    "categoryName": "Master Plan Land Use, Zoning & FAR Regulations",
    "title": "Raipur & Nava Raipur Master Plan Zoning, Kharun River & CBD Norms",
    "clause": "Raipur Development Plan 2031 & CG Bhumi Vikas Niyam",
    "sourceDoc": "Raipur Development Plan 2031 & Nava Raipur (NRDA Master Plan)",
    "sourceUrl": "https://rdaraipur.com/master-plan/",
    "documentYear": "2031",
    "version": "Raipur Development Plan 2031 & Nava Raipur Smart City Master Plan",
    "lastVerified": "15 Jan 2026",
    "status": "verified",
    "documentPriority": "primary",
    "summary": "Master planning instrument governing 503 sq.km Raipur Capital Region and Nava Raipur Atal Nagar (India's first planned greenfield smart capital city).",
    "parameters": {
      "navaRaipurCBDFAR": "Up to 3.50 FAR in Nava Raipur Central Business District",
      "kharunRiverBuffer": "50m green buffer along Kharun river high flood level",
      "baseFAR": "1.25 to 1.75 in standard Raipur municipal limits",
      "airportOLSZone": "Governed by AAI CCZM for Swami Vivekananda Airport Mana"
},
    "detailedRequirements": [
      "Nava Raipur constructions must follow green building norms (minimum GRIHA 3-Star / IGBC Silver)",
      "AAI NOC mandatory for all constructions falling under Mana Airport flight approach paths",
      "Mandatory dual-piping STP and 100% wastewater recycling for all projects >2,000 sq.m",
      "Mandatory rooftop rainwater harvesting with percolation wells for all plotted developments"
]
  }
];
