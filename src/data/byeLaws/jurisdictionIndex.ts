// Toolique Building Feasibility & Bye-Law Checker - Central India Jurisdiction Index (36 States & UTs)

export type AuthorityType = 
  | 'development_authority'
  | 'municipal_corporation'
  | 'metropolitan_authority'
  | 'special_planning_authority'
  | 'cantonment_board'
  | 'industrial_authority'
  | 'urban_local_body';

export type JurisdictionStatus = 'verified' | 'partially_verified' | 'coming_soon';

export interface JurisdictionAuthority {
  id: string;
  name: string;
  shortName: string;
  type: AuthorityType;
  primaryByeLaw: string;
  jurisdictionDescription: string;
  availableZones: string[];
  defaultRoadWidthM: number;
  bighaInSqFt: number;
  officialUrl?: string;
  status?: JurisdictionStatus;
  documentCount?: number;
}

export interface JurisdictionCity {
  id: string;
  name: string;
  district?: string;
  authorities: JurisdictionAuthority[];
  commonLocalities: string[];
  latRange?: [number, number]; // [minLat, maxLat]
  lonRange?: [number, number]; // [minLon, maxLon]
  status?: JurisdictionStatus;
}

export interface JurisdictionState {
  id: string;
  name: string;
  stateCode: string;
  stateBuildingCode: string;
  status: JurisdictionStatus;
  citiesSupported: number;
  authoritiesSupported: number;
  regulationsAvailable: number;
  cities: JurisdictionCity[];
}

export const JURISDICTION_INDEX: JurisdictionState[] = [
  // ==========================================
  // 1. RAJASTHAN
  // ==========================================
  {
    id: 'rajasthan',
    name: 'Rajasthan',
    stateCode: 'RJ',
    stateBuildingCode: 'Rajasthan Model Building Bye-Laws 2020 (Amended 2023)',
    status: 'verified',
    citiesSupported: 3,
    authoritiesSupported: 4,
    regulationsAvailable: 12,
    cities: [
      {
        id: 'jaipur',
        name: 'Jaipur',
        district: 'Jaipur',
        latRange: [26.7, 27.1],
        lonRange: [75.6, 76.0],
        commonLocalities: ['Mansarovar', 'Vaishali Nagar', 'Malviya Nagar', 'Jagatpura', 'C-Scheme', 'Tonk Road', 'Ajmer Road', 'Sitapura'],
        status: 'verified',
        authorities: [
          {
            id: 'jda_jaipur',
            name: 'Jaipur Development Authority (JDA)',
            shortName: 'JDA',
            type: 'development_authority',
            primaryByeLaw: 'Rajasthan Model Building Regulations 2020 (JDA Chapter 5)',
            jurisdictionDescription: 'Governs planned sectors, institutional zones, arterial road schemes, and development schemes in Jaipur Metropolitan Region.',
            availableZones: ['Residential Plotted', 'Residential Group Housing', 'Commercial Arterial', 'Mixed Land Use', 'Institutional'],
            defaultRoadWidthM: 12.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://urban.rajasthan.gov.in/jda',
            status: 'verified',
            documentCount: 8
          },
          {
            id: 'jmc_jaipur',
            name: 'Jaipur Municipal Corporation (Heritage & Greater JMC)',
            shortName: 'JMC (Municipal)',
            type: 'municipal_corporation',
            primaryByeLaw: 'Rajasthan Municipalities Building Bye-Laws 2020',
            jurisdictionDescription: 'Governs developed urban wards, walled city heritage areas, and municipal core layouts.',
            availableZones: ['Walled City Heritage', 'Commercial Core', 'Residential Urban'],
            defaultRoadWidthM: 9.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://jaipurmc.org',
            status: 'verified',
            documentCount: 4
          }
        ]
      },
      {
        id: 'jodhpur',
        name: 'Jodhpur',
        district: 'Jodhpur',
        latRange: [26.1, 26.5],
        lonRange: [72.8, 73.2],
        commonLocalities: ['Shastri Nagar', 'Ratanada', 'Pal Road', 'Paota', 'Chopasni'],
        status: 'partially_verified',
        authorities: [
          {
            id: 'jda_jodhpur',
            name: 'Jodhpur Development Authority (JDA)',
            shortName: 'Jodhpur DA',
            type: 'development_authority',
            primaryByeLaw: 'Rajasthan Model Building Bye-Laws 2020',
            jurisdictionDescription: 'Governs planned residential and commercial layouts in Jodhpur metropolitan area.',
            availableZones: ['Residential', 'Commercial', 'Industrial (RIICO / JDA)'],
            defaultRoadWidthM: 12.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://urban.rajasthan.gov.in/jodhpur-da',
            status: 'partially_verified',
            documentCount: 2
          }
        ]
      },
      {
        id: 'udaipur',
        name: 'Udaipur',
        district: 'Udaipur',
        latRange: [24.4, 24.8],
        lonRange: [73.5, 73.9],
        commonLocalities: ['Hiran Magri', 'Fatehpura', 'Panchwati', 'Shobhagpura'],
        status: 'partially_verified',
        authorities: [
          {
            id: 'uit_udaipur',
            name: 'Urban Improvement Trust Udaipur (UIT)',
            shortName: 'UIT Udaipur',
            type: 'development_authority',
            primaryByeLaw: 'Rajasthan Model Building Bye-Laws 2020 / Lake Protection Rules',
            jurisdictionDescription: 'Governs urban expansion and lake eco-sensitive periphery zones in Udaipur.',
            availableZones: ['Residential', 'Hospitality / Heritage', 'Commercial'],
            defaultRoadWidthM: 9.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://urban.rajasthan.gov.in/uit-udaipur',
            status: 'partially_verified',
            documentCount: 2
          }
        ]
      }
    ]
  },

  // ==========================================
  // 2. HARYANA
  // ==========================================
  {
    id: 'haryana',
    name: 'Haryana',
    stateCode: 'HR',
    stateBuildingCode: 'Haryana Building Code 2017 (Amended 2023 / Stilt+4)',
    status: 'verified',
    citiesSupported: 3,
    authoritiesSupported: 5,
    regulationsAvailable: 15,
    cities: [
      {
        id: 'gurugram',
        name: 'Gurugram',
        district: 'Gurugram',
        latRange: [28.3, 28.6],
        lonRange: [76.9, 77.2],
        commonLocalities: ['DLF Phase 1-5', 'Sushant Lok', 'Sector 57', 'Sector 48', 'Golf Course Extn', 'Sohna Road', 'Dwarka Expressway', 'Cyber City'],
        status: 'verified',
        authorities: [
          {
            id: 'gmda_gurugram',
            name: 'Gurugram Metropolitan Development Authority (GMDA / DTCP)',
            shortName: 'GMDA / DTCP',
            type: 'metropolitan_authority',
            primaryByeLaw: 'Haryana Building Code 2017 (Rev 2023 / Stilt+4)',
            jurisdictionDescription: 'Governs licensed private developer colonies, sector master plans, and commercial high-rises in Gurugram.',
            availableZones: ['Residential Plotted', 'Residential Group Housing', 'Commercial (SCO / Mall)', 'Transit Oriented Development (TOD)', 'Institutional'],
            defaultRoadWidthM: 12.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://gmda.gov.in',
            status: 'verified',
            documentCount: 8
          },
          {
            id: 'hsvp_gurugram',
            name: 'Haryana Shehri Vikas Pradhikaran (HSVP Gurugram)',
            shortName: 'HSVP (HUDA)',
            type: 'development_authority',
            primaryByeLaw: 'Haryana Building Code 2017',
            jurisdictionDescription: 'Governs HSVP (HUDA) urban estates, plotted sectors, and municipal commercial centers.',
            availableZones: ['Residential Plotted', 'Commercial SCO', 'Institutional'],
            defaultRoadWidthM: 12.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://hsvphry.org.in',
            status: 'verified',
            documentCount: 4
          },
          {
            id: 'mcg_gurugram',
            name: 'Municipal Corporation of Gurugram (MCG)',
            shortName: 'MCG',
            type: 'municipal_corporation',
            primaryByeLaw: 'Haryana Municipal Building Bye-Laws',
            jurisdictionDescription: 'Governs municipal wards, regularized colonies, and village abadi extension areas.',
            availableZones: ['Residential Urban', 'Commercial Street', 'Mixed Use'],
            defaultRoadWidthM: 9.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://mcg.gov.in',
            status: 'verified',
            documentCount: 3
          }
        ]
      },
      {
        id: 'faridabad',
        name: 'Faridabad',
        district: 'Faridabad',
        latRange: [28.2, 28.5],
        lonRange: [77.2, 77.4],
        commonLocalities: ['Sector 15', 'Sector 21', 'Neharpar (Greater Faridabad)', 'NIT Faridabad'],
        status: 'verified',
        authorities: [
          {
            id: 'fmda_faridabad',
            name: 'Faridabad Metropolitan Development Authority (FMDA / HSVP)',
            shortName: 'FMDA / HSVP',
            type: 'metropolitan_authority',
            primaryByeLaw: 'Haryana Building Code 2017',
            jurisdictionDescription: 'Governs master plan sectors and infrastructure corridor in Faridabad.',
            availableZones: ['Residential Plotted', 'Commercial', 'Industrial', 'Institutional'],
            defaultRoadWidthM: 12.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://fmda.haryana.gov.in',
            status: 'verified',
            documentCount: 3
          }
        ]
      },
      {
        id: 'panchkula',
        name: 'Panchkula',
        district: 'Panchkula',
        latRange: [30.6, 30.8],
        lonRange: [76.8, 77.0],
        commonLocalities: ['Sector 4', 'Sector 12', 'Mansa Devi Complex', 'Sector 20'],
        status: 'partially_verified',
        authorities: [
          {
            id: 'hsvp_panchkula',
            name: 'HSVP Panchkula / TCP Haryana',
            shortName: 'HSVP Panchkula',
            type: 'development_authority',
            primaryByeLaw: 'Haryana Building Code 2017',
            jurisdictionDescription: 'Governs planned sectors in Panchkula urban estate.',
            availableZones: ['Residential Plotted', 'Commercial', 'Institutional'],
            defaultRoadWidthM: 9.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://tcpharyana.gov.in',
            status: 'partially_verified',
            documentCount: 2
          }
        ]
      }
    ]
  },

  // ==========================================
  // 3. DELHI (NCT)
  // ==========================================
  {
    id: 'delhi',
    name: 'Delhi (NCT)',
    stateCode: 'DL',
    stateBuildingCode: 'Unified Building Bye-Laws for Delhi 2016 (UBBL-2016)',
    status: 'verified',
    citiesSupported: 1,
    authoritiesSupported: 4,
    regulationsAvailable: 16,
    cities: [
      {
        id: 'delhi',
        name: 'Delhi (All Zones)',
        district: 'National Capital Territory of Delhi',
        latRange: [28.4, 28.9],
        lonRange: [76.9, 77.4],
        commonLocalities: ['Rohini', 'Dwarka', 'Vasant Kunj', 'Lajpat Nagar', 'Pitampura', 'Karol Bagh', 'South Extension', 'Saket', 'Janakpuri', 'Connaught Place'],
        status: 'verified',
        authorities: [
          {
            id: 'dda_delhi',
            name: 'Delhi Development Authority (DDA)',
            shortName: 'DDA',
            type: 'development_authority',
            primaryByeLaw: 'Delhi UBBL 2016 / Master Plan for Delhi (MPD-2021/2041)',
            jurisdictionDescription: 'Governs DDA plotted schemes, group housing societies, institutional pockets, and commercial centers across Delhi.',
            availableZones: ['Residential Plotted', 'Residential (Group Housing)', 'Commercial (District Centre)', 'Mixed Land Use (MLU)', 'Institutional'],
            defaultRoadWidthM: 13.5,
            bighaInSqFt: 9072,
            officialUrl: 'https://dda.gov.in',
            status: 'verified',
            documentCount: 7
          },
          {
            id: 'mcd_delhi',
            name: 'Municipal Corporation of Delhi (MCD)',
            shortName: 'MCD (Unified)',
            type: 'municipal_corporation',
            primaryByeLaw: 'Delhi UBBL 2016 (MCD Building Department)',
            jurisdictionDescription: 'Governs approved residential colonies, special areas, and urban villages in South, North, and East Delhi municipal zones.',
            availableZones: ['Residential Plotted', 'Local Shopping Centre (LSC)', 'Mixed Use Notified Corridors'],
            defaultRoadWidthM: 9.0,
            bighaInSqFt: 9072,
            officialUrl: 'https://mcdonline.nic.in',
            status: 'verified',
            documentCount: 5
          },
          {
            id: 'ndmc_delhi',
            name: 'New Delhi Municipal Council (NDMC)',
            shortName: 'NDMC (Lutyens / Central)',
            type: 'municipal_corporation',
            primaryByeLaw: 'Delhi UBBL 2016 / Lutyens Bungalow Zone (LBZ) Guidelines',
            jurisdictionDescription: 'Governs Lutyens Bungalow Zone (LBZ), Connaught Place, Chanakyapuri, and Central Delhi administrative areas.',
            availableZones: ['LBZ Residential', 'Central Commercial (CP)', 'Government / Institutional'],
            defaultRoadWidthM: 18.0,
            bighaInSqFt: 9072,
            officialUrl: 'https://ndmc.gov.in',
            status: 'verified',
            documentCount: 3
          },
          {
            id: 'cantt_delhi',
            name: 'Delhi Cantonment Board',
            shortName: 'Delhi Cantt Board',
            type: 'cantonment_board',
            primaryByeLaw: 'Cantonments Act 2006 / Delhi Cantt Bye-Laws',
            jurisdictionDescription: 'Governs defense civil areas, Sadar Bazar, and cantonment residential pockets.',
            availableZones: ['Cantonment Civil Area', 'Commercial Ward'],
            defaultRoadWidthM: 12.0,
            bighaInSqFt: 9072,
            officialUrl: 'https://delhi.cantt.gov.in',
            status: 'partially_verified',
            documentCount: 1
          }
        ]
      }
    ]
  },

  // ==========================================
  // 4. MAHARASHTRA
  // ==========================================
  {
    id: 'maharashtra',
    name: 'Maharashtra',
    stateCode: 'MH',
    stateBuildingCode: 'Unified Development Control & Promotion Regulations (UDCPR 2020)',
    status: 'verified',
    citiesSupported: 5,
    authoritiesSupported: 8,
    regulationsAvailable: 22,
    cities: [
      {
        id: 'mumbai',
        name: 'Mumbai',
        district: 'Mumbai City & Suburban',
        latRange: [18.8, 19.3],
        lonRange: [72.7, 73.0],
        commonLocalities: ['Bandra', 'Andheri', 'Worli', 'Juhu', 'Borivali', 'Powai', 'Dadar', 'Goregaon', 'Malad', 'Chembur', 'BKC'],
        status: 'verified',
        authorities: [
          {
            id: 'mcgm_mumbai',
            name: 'Municipal Corporation of Greater Mumbai (MCGM / BMC)',
            shortName: 'MCGM / BMC',
            type: 'municipal_corporation',
            primaryByeLaw: 'Development Control and Promotion Regulations for Greater Mumbai (DCPR-2034)',
            jurisdictionDescription: 'Governs all plotted, high-rise, commercial, and redevelopment projects across Island City and Mumbai Suburbs.',
            availableZones: ['Residential (R-Zone)', 'Commercial (C-Zone)', 'Transit Oriented Development (TOD)', 'CRZ Urban Zone', 'Industrial'],
            defaultRoadWidthM: 12.2,
            bighaInSqFt: 27225,
            officialUrl: 'https://portal.mcgm.gov.in',
            status: 'verified',
            documentCount: 10
          },
          {
            id: 'mmrda_mumbai',
            name: 'Mumbai Metropolitan Region Development Authority (MMRDA / BKC)',
            shortName: 'MMRDA',
            type: 'metropolitan_authority',
            primaryByeLaw: 'MMRDA Special Planning Authority Regulations (BKC / Wadala)',
            jurisdictionDescription: 'Special Planning Authority for Bandra-Kurla Complex (BKC), Oshiwara District Centre, and Wadala Truck Terminal.',
            availableZones: ['BKC International Finance Centre', 'Commercial High Density', 'Mixed Use TOD'],
            defaultRoadWidthM: 24.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://mmrda.maharashtra.gov.in',
            status: 'verified',
            documentCount: 4
          },
          {
            id: 'sra_mumbai',
            name: 'Slum Rehabilitation Authority (SRA Mumbai)',
            shortName: 'SRA',
            type: 'special_planning_authority',
            primaryByeLaw: 'DCPR-2034 Regulation 33(10) Slum Rehabilitation',
            jurisdictionDescription: 'Planning authority for declared slum rehabilitation and urban cluster renewal schemes.',
            availableZones: ['SRA Scheme Layout', 'Rehab + Sale Component'],
            defaultRoadWidthM: 9.15,
            bighaInSqFt: 27225,
            officialUrl: 'https://sra.gov.in',
            status: 'verified',
            documentCount: 2
          }
        ]
      },
      {
        id: 'pune',
        name: 'Pune',
        district: 'Pune',
        latRange: [18.4, 18.7],
        lonRange: [73.7, 74.0],
        commonLocalities: ['Kothrud', 'Baner', 'Wakad', 'Hinjewadi', 'Viman Nagar', 'Kalyani Nagar', 'Hadapsar', 'Aundh'],
        status: 'verified',
        authorities: [
          {
            id: 'pmc_pune',
            name: 'Pune Municipal Corporation (PMC)',
            shortName: 'PMC',
            type: 'municipal_corporation',
            primaryByeLaw: 'Maharashtra UDCPR 2020 / PMC Zonal Regulations',
            jurisdictionDescription: 'Governs municipal corporation boundaries in Pune city.',
            availableZones: ['Residential (R-1 / R-2)', 'Commercial Corridor', 'Mixed Use', 'IT / BT Parks'],
            defaultRoadWidthM: 12.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://pmc.gov.in',
            status: 'verified',
            documentCount: 4
          },
          {
            id: 'pmrda_pune',
            name: 'Pune Metropolitan Region Development Authority (PMRDA)',
            shortName: 'PMRDA',
            type: 'metropolitan_authority',
            primaryByeLaw: 'Maharashtra UDCPR 2020 (PMRDA Metropolitan Region)',
            jurisdictionDescription: 'Governs fringe expansion sectors, Hinjewadi IT corridor, and PMRDA ring road planning nodes.',
            availableZones: ['Residential', 'Hi-Tech IT Park', 'Industrial / Logistics'],
            defaultRoadWidthM: 15.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://pmrda.gov.in',
            status: 'verified',
            documentCount: 3
          }
        ]
      },
      {
        id: 'navi_mumbai',
        name: 'Navi Mumbai',
        district: 'Thane / Raigad',
        latRange: [18.9, 19.2],
        lonRange: [72.9, 73.1],
        commonLocalities: ['Vashi', 'Kharghar', 'Nerul', 'Panvel', 'Belapur', 'Ulwe', 'Seawoods', 'Dronagiri'],
        status: 'verified',
        authorities: [
          {
            id: 'cidco_navimumbai',
            name: 'City and Industrial Development Corporation (CIDCO)',
            shortName: 'CIDCO',
            type: 'development_authority',
            primaryByeLaw: 'Maharashtra UDCPR 2020 / CIDCO General Development Control Regulations',
            jurisdictionDescription: 'Governs planned nodes in Navi Mumbai, Kharghar, Dronagiri, Ulwe, and NAINA airport zone.',
            availableZones: ['Residential Plotted', 'Commercial Node', 'Airport Influence Zone (NAINA)'],
            defaultRoadWidthM: 15.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://cidco.maharashtra.gov.in',
            status: 'verified',
            documentCount: 4
          },
          {
            id: 'nmmc_navimumbai',
            name: 'Navi Mumbai Municipal Corporation (NMMC)',
            shortName: 'NMMC',
            type: 'municipal_corporation',
            primaryByeLaw: 'Maharashtra UDCPR 2020 (NMMC Jurisdiction)',
            jurisdictionDescription: 'Governs developed municipal nodes transferred from CIDCO to NMMC.',
            availableZones: ['Residential', 'Commercial', 'Industrial (TTC)'],
            defaultRoadWidthM: 12.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://nmmc.gov.in',
            status: 'verified',
            documentCount: 2
          }
        ]
      },
      {
        id: 'nagpur',
        name: 'Nagpur',
        district: 'Nagpur',
        latRange: [21.0, 21.3],
        lonRange: [78.9, 79.2],
        commonLocalities: ['Dharampeth', 'Civil Lines', 'Manish Nagar', 'Wardha Road', 'MIHAN'],
        status: 'partially_verified',
        authorities: [
          {
            id: 'nmc_nagpur',
            name: 'Nagpur Municipal Corporation (NMC / NIT)',
            shortName: 'NMC / NIT',
            type: 'municipal_corporation',
            primaryByeLaw: 'Maharashtra UDCPR 2020',
            jurisdictionDescription: 'Governs central Nagpur and NIT layouts.',
            availableZones: ['Residential', 'Commercial', 'Mixed Land Use'],
            defaultRoadWidthM: 9.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://nmcnagpur.gov.in',
            status: 'partially_verified',
            documentCount: 2
          }
        ]
      },
      {
        id: 'thane',
        name: 'Thane',
        district: 'Thane',
        latRange: [19.1, 19.3],
        lonRange: [72.9, 73.1],
        commonLocalities: ['Ghodbunder Road', 'Majiwada', 'Vartak Nagar', 'Naupada', 'Kolshet Road'],
        status: 'verified',
        authorities: [
          {
            id: 'tmc_thane',
            name: 'Thane Municipal Corporation (TMC)',
            shortName: 'TMC Thane',
            type: 'municipal_corporation',
            primaryByeLaw: 'Maharashtra UDCPR 2020',
            jurisdictionDescription: 'Governs Thane city municipal area and Ghodbunder expansion corridor.',
            availableZones: ['Residential High Rise', 'Commercial Node', 'Mixed Land Use'],
            defaultRoadWidthM: 12.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://thanecity.gov.in',
            status: 'verified',
            documentCount: 2
          }
        ]
      }
    ]
  },

  // ==========================================
  // 5. KARNATAKA
  // ==========================================
  {
    id: 'karnataka',
    name: 'Karnataka',
    stateCode: 'KA',
    stateBuildingCode: 'Karnataka Municipal Building Bye-Laws / BBMP Building Bye-Laws',
    status: 'verified',
    citiesSupported: 2,
    authoritiesSupported: 4,
    regulationsAvailable: 14,
    cities: [
      {
        id: 'bengaluru',
        name: 'Bengaluru',
        district: 'Bengaluru Urban',
        latRange: [12.8, 13.2],
        lonRange: [77.4, 77.8],
        commonLocalities: ['Indiranagar', 'Koramangala', 'Whitefield', 'HSR Layout', 'Electronic City', 'Jayanagar', 'Hebbal', 'Yelahanka', 'Sarjapur Road'],
        status: 'verified',
        authorities: [
          {
            id: 'bbmp_bengaluru',
            name: 'Bruhat Bengaluru Mahanagara Palike (BBMP)',
            shortName: 'BBMP',
            type: 'municipal_corporation',
            primaryByeLaw: 'BBMP Building Bye-Laws / BDA Revised Master Plan 2015/2031',
            jurisdictionDescription: 'Governs all residential plotted, commercial, and apartment sanctions across 198 BBMP wards in Greater Bengaluru.',
            availableZones: ['Residential (Main)', 'Residential (Mixed)', 'Commercial (Central)', 'Mutation Corridor (12m+ Road)', 'Industrial (Hi-Tech)'],
            defaultRoadWidthM: 12.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://bbmp.karnataka.gov.in',
            status: 'verified',
            documentCount: 7
          },
          {
            id: 'bda_bengaluru',
            name: 'Bangalore Development Authority (BDA)',
            shortName: 'BDA',
            type: 'development_authority',
            primaryByeLaw: 'BDA Revised Master Plan 2031 Zonal Regulations',
            jurisdictionDescription: 'Governs BDA planned layouts, peripheral ring road corridors, and major greenfield schemes.',
            availableZones: ['Residential BDA Layout', 'Commercial Main', 'Public / Semi-Public'],
            defaultRoadWidthM: 12.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://bdabangalore.org',
            status: 'verified',
            documentCount: 4
          },
          {
            id: 'biaapa_bengaluru',
            name: 'Bangalore International Airport Area Planning Authority (BIAAPA)',
            shortName: 'BIAAPA (Airport)',
            type: 'special_planning_authority',
            primaryByeLaw: 'BIAAPA Master Plan & Airport Height Clearances',
            jurisdictionDescription: 'Special planning authority for Devanahalli and Kempegowda International Airport influence zone.',
            availableZones: ['Airport Mixed Use', 'Aerospace SEZ', 'Residential Plotted'],
            defaultRoadWidthM: 18.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://biaapa.karnataka.gov.in',
            status: 'verified',
            documentCount: 3
          }
        ]
      },
      {
        id: 'mysuru',
        name: 'Mysuru',
        district: 'Mysuru',
        latRange: [12.2, 12.4],
        lonRange: [76.5, 76.8],
        commonLocalities: ['Gokulam', 'Jayalakshmipuram', 'Vijayanagar', 'Kuvempunagar', 'Saraswathipuram'],
        status: 'partially_verified',
        authorities: [
          {
            id: 'muda_mysuru',
            name: 'Mysuru Urban Development Authority (MUDA)',
            shortName: 'MUDA',
            type: 'development_authority',
            primaryByeLaw: 'MUDA Master Plan Zonal Regulations',
            jurisdictionDescription: 'Governs planned layouts and heritage conservation precincts in Mysuru.',
            availableZones: ['Residential', 'Heritage Conservation Zone', 'Commercial'],
            defaultRoadWidthM: 9.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://mudamysuru.co.in',
            status: 'partially_verified',
            documentCount: 2
          }
        ]
      }
    ]
  },

  // ==========================================
  // 6. TAMIL NADU
  // ==========================================
  {
    id: 'tamil_nadu',
    name: 'Tamil Nadu',
    stateCode: 'TN',
    stateBuildingCode: 'Tamil Nadu Combined Development and Building Rules (TNCDBR 2019)',
    status: 'verified',
    citiesSupported: 2,
    authoritiesSupported: 3,
    regulationsAvailable: 12,
    cities: [
      {
        id: 'chennai',
        name: 'Chennai',
        district: 'Chennai & CMA (Kanchipuram / Tiruvallur / Chengalpattu)',
        latRange: [12.8, 13.3],
        lonRange: [80.1, 80.4],
        commonLocalities: ['Anna Nagar', 'T. Nagar', 'Adyar', 'Velachery', 'OMR (IT Corridor)', 'Porur', 'Mylapore', 'ECR (Coastal)', 'Ambattur'],
        status: 'verified',
        authorities: [
          {
            id: 'cmda_chennai',
            name: 'Chennai Metropolitan Development Authority (CMDA)',
            shortName: 'CMDA',
            type: 'metropolitan_authority',
            primaryByeLaw: 'TNCDBR 2019 (G.O. Ms. No. 18 / CMDA Second Master Plan)',
            jurisdictionDescription: 'Governs High-Rise Buildings (> 18.3m), commercial complexes, IT parks, and layouts across Chennai Metropolitan Area (CMA).',
            availableZones: ['Primary Residential', 'Mixed Residential', 'Commercial Use', 'Continuous Building Area (CBA)', 'IT Corridor (OMR)'],
            defaultRoadWidthM: 12.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://cmdachennai.gov.in',
            status: 'verified',
            documentCount: 7
          },
          {
            id: 'gcc_chennai',
            name: 'Greater Chennai Corporation (GCC)',
            shortName: 'GCC (Municipal)',
            type: 'municipal_corporation',
            primaryByeLaw: 'TNCDBR 2019 (Non-High Rise Delegated Powers)',
            jurisdictionDescription: 'Sanctioning authority for Non-High Rise residential/commercial buildings (up to 18.3m height) within GCC municipal zones.',
            availableZones: ['Residential (Ordinary / Non-High Rise)', 'Commercial Ward'],
            defaultRoadWidthM: 9.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://chennaicorporation.gov.in',
            status: 'verified',
            documentCount: 3
          }
        ]
      },
      {
        id: 'coimbatore',
        name: 'Coimbatore',
        district: 'Coimbatore',
        latRange: [10.9, 11.1],
        lonRange: [76.9, 77.1],
        commonLocalities: ['RS Puram', 'Gandhipuram', 'Peelamedu', 'Saravanampatti', 'Saibaba Colony'],
        status: 'partially_verified',
        authorities: [
          {
            id: 'lpa_coimbatore',
            name: 'Coimbatore Local Planning Authority (CCMC / LPA)',
            shortName: 'Coimbatore LPA',
            type: 'development_authority',
            primaryByeLaw: 'TNCDBR 2019 (Coimbatore LPA)',
            jurisdictionDescription: 'Governs urban and industrial planning in Coimbatore district.',
            availableZones: ['Residential', 'Commercial', 'Industrial / Textile'],
            defaultRoadWidthM: 9.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://coimbatore.nic.in',
            status: 'partially_verified',
            documentCount: 2
          }
        ]
      }
    ]
  },

  // ==========================================
  // 7. TELANGANA
  // ==========================================
  {
    id: 'telangana',
    name: 'Telangana',
    stateCode: 'TG',
    stateBuildingCode: 'Telangana Building Rules (G.O. Ms. No. 168 / TG-bPASS)',
    status: 'verified',
    citiesSupported: 1,
    authoritiesSupported: 3,
    regulationsAvailable: 14,
    cities: [
      {
        id: 'hyderabad',
        name: 'Hyderabad',
        district: 'Hyderabad / Ranga Reddy / Medchal',
        latRange: [17.2, 17.6],
        lonRange: [78.2, 78.6],
        commonLocalities: ['Banjara Hills', 'Jubilee Hills', 'HITEC City', 'Gachibowli', 'Kondapur', 'Madhapur', 'Kukatpally', 'Begumpet', 'Secunderabad'],
        status: 'verified',
        authorities: [
          {
            id: 'ghmc_hyderabad',
            name: 'Greater Hyderabad Municipal Corporation (GHMC / TG-bPASS)',
            shortName: 'GHMC',
            type: 'municipal_corporation',
            primaryByeLaw: 'Telangana Building Rules (GO 168 & TG-bPASS Act 2020)',
            jurisdictionDescription: 'Sanctioning authority for residential, commercial, and multi-storey buildings across Greater Hyderabad municipal circles.',
            availableZones: ['Residential Zone', 'Commercial (High Density)', 'Multi-Purpose Mixed Use', 'IT / Financial District (Cyberabad)'],
            defaultRoadWidthM: 12.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://ghmc.gov.in',
            status: 'verified',
            documentCount: 7
          },
          {
            id: 'hmda_hyderabad',
            name: 'Hyderabad Metropolitan Development Authority (HMDA)',
            shortName: 'HMDA',
            type: 'metropolitan_authority',
            primaryByeLaw: 'HMDA Master Plan 2031 / GO 168',
            jurisdictionDescription: 'Governs Outer Ring Road (ORR) growth corridor, master plan layouts, and gated communities in Hyderabad Metropolitan Region.',
            availableZones: ['ORR Growth Corridor (Special FAR)', 'Residential Master Plan', 'Commercial Node'],
            defaultRoadWidthM: 18.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://hmda.telangana.gov.in',
            status: 'verified',
            documentCount: 5
          },
          {
            id: 'cantt_secunderabad',
            name: 'Secunderabad Cantonment Board',
            shortName: 'Secunderabad Cantt',
            type: 'cantonment_board',
            primaryByeLaw: 'Cantonments Act 2006 / Secunderabad Building Bye-Laws',
            jurisdictionDescription: 'Governs civil areas and residential wards within Secunderabad Cantonment.',
            availableZones: ['Cantonment Civil Area', 'Commercial Ward'],
            defaultRoadWidthM: 9.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://secunderabad.cantt.gov.in',
            status: 'partially_verified',
            documentCount: 2
          }
        ]
      }
    ]
  },

  // ==========================================
  // 8. UTTAR PRADESH
  // ==========================================
  {
    id: 'uttar_pradesh',
    name: 'Uttar Pradesh',
    stateCode: 'UP',
    stateBuildingCode: 'UP Urban Planning and Development Bye-Laws / Industrial Development Authority Regulations',
    status: 'verified',
    citiesSupported: 4,
    authoritiesSupported: 6,
    regulationsAvailable: 18,
    cities: [
      {
        id: 'noida',
        name: 'Noida (Gautam Buddha Nagar)',
        district: 'Gautam Buddha Nagar',
        latRange: [28.4, 28.7],
        lonRange: [77.3, 77.5],
        commonLocalities: ['Sector 62', 'Sector 18', 'Sector 150', 'Sector 137', 'Sector 75', 'Noida Expressway'],
        status: 'verified',
        authorities: [
          {
            id: 'noida_authority',
            name: 'New Okhla Industrial Development Authority (NOIDA)',
            shortName: 'NOIDA Authority',
            type: 'industrial_authority',
            primaryByeLaw: 'NOIDA Building Regulations 2020 (Rev 2024)',
            jurisdictionDescription: 'Sole planning and sanctioning authority for all residential, group housing, commercial, and institutional sectors in Noida.',
            availableZones: ['Residential Plotted', 'Group Housing (High-Rise)', 'Commercial Sector', 'IT / ITES Parks', 'Institutional'],
            defaultRoadWidthM: 18.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://noidaauthorityonline.in',
            status: 'verified',
            documentCount: 7
          }
        ]
      },
      {
        id: 'greater_noida',
        name: 'Greater Noida & Yamuna Expressway (YEIDA)',
        district: 'Gautam Buddha Nagar',
        latRange: [28.2, 28.5],
        lonRange: [77.4, 77.7],
        commonLocalities: ['Alpha 1', 'Beta 2', 'Omega', 'Knowledge Park', 'Sector 1', 'Yamuna Expressway (Sector 18-20)'],
        status: 'verified',
        authorities: [
          {
            id: 'gnida_authority',
            name: 'Greater Noida Industrial Development Authority (GNIDA)',
            shortName: 'GNIDA',
            type: 'industrial_authority',
            primaryByeLaw: 'GNIDA Building Regulations 2020',
            jurisdictionDescription: 'Governs planned sectors, knowledge parks, and expressways in Greater Noida (West & East).',
            availableZones: ['Residential Plotted', 'Group Housing', 'Commercial', 'Institutional / Education Hub'],
            defaultRoadWidthM: 18.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://greaternoidaauthority.in',
            status: 'verified',
            documentCount: 4
          },
          {
            id: 'yeida_authority',
            name: 'Yamuna Expressway Industrial Development Authority (YEIDA)',
            shortName: 'YEIDA (Airport Zone)',
            type: 'industrial_authority',
            primaryByeLaw: 'YEIDA Master Plan 2041 / Noida International Airport Zone',
            jurisdictionDescription: 'Governs Jewar Noida International Airport influence corridor, Formula 1 circuit node, and electronic city sectors.',
            availableZones: ['Airport Mixed Use', 'Residential Plotted', 'Industrial / Electronics'],
            defaultRoadWidthM: 24.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://yamunaexpresswayauthority.com',
            status: 'verified',
            documentCount: 3
          }
        ]
      },
      {
        id: 'lucknow',
        name: 'Lucknow',
        district: 'Lucknow',
        latRange: [26.7, 27.0],
        lonRange: [80.8, 81.1],
        commonLocalities: ['Gomti Nagar', 'Gomti Nagar Extension', 'Hazratganj', 'Aliganj', 'Indira Nagar', 'Sushant Golf City', 'Amar Shaheed Path'],
        status: 'verified',
        authorities: [
          {
            id: 'lda_lucknow',
            name: 'Lucknow Development Authority (LDA)',
            shortName: 'LDA Lucknow',
            type: 'development_authority',
            primaryByeLaw: 'UP Model Building Bye-Laws / LDA Master Plan 2031',
            jurisdictionDescription: 'Governs planned residential colonies, development schemes, and commercial nodes in Lucknow.',
            availableZones: ['Residential Plotted', 'Group Housing', 'Commercial Corridor', 'Mixed Land Use'],
            defaultRoadWidthM: 12.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://ldaonline.co.in',
            status: 'verified',
            documentCount: 3
          },
          {
            id: 'lmc_lucknow',
            name: 'Lucknow Municipal Corporation (LMC)',
            shortName: 'LMC (Nagar Nigam)',
            type: 'municipal_corporation',
            primaryByeLaw: 'UP Municipal Building Bye-Laws',
            jurisdictionDescription: 'Governs urban wards and old city commercial precincts in Lucknow.',
            availableZones: ['Residential Urban', 'Commercial Core'],
            defaultRoadWidthM: 9.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://lmc.up.nic.in',
            status: 'partially_verified',
            documentCount: 2
          }
        ]
      },
      {
        id: 'ghaziabad',
        name: 'Ghaziabad',
        district: 'Ghaziabad',
        latRange: [28.6, 28.8],
        lonRange: [77.3, 77.5],
        commonLocalities: ['Indirapuram', 'Vaishali', 'Vasundhara', 'Raj Nagar Extension', 'Crossings Republik'],
        status: 'partially_verified',
        authorities: [
          {
            id: 'gda_ghaziabad',
            name: 'Ghaziabad Development Authority (GDA)',
            shortName: 'GDA Ghaziabad',
            type: 'development_authority',
            primaryByeLaw: 'UP Model Building Bye-Laws / GDA Master Plan 2031',
            jurisdictionDescription: 'Governs planned schemes in Ghaziabad NCR sub-region.',
            availableZones: ['Residential Plotted', 'Group Housing', 'Commercial'],
            defaultRoadWidthM: 12.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://gdaghaziabad.in',
            status: 'partially_verified',
            documentCount: 2
          }
        ]
      }
    ]
  },

  // ==========================================
  // 9. GUJARAT
  // ==========================================
  {
    id: 'gujarat',
    name: 'Gujarat',
    stateCode: 'GJ',
    stateBuildingCode: 'Comprehensive General Development Control Regulations (CGDCR 2017)',
    status: 'verified',
    citiesSupported: 3,
    authoritiesSupported: 5,
    regulationsAvailable: 15,
    cities: [
      {
        id: 'ahmedabad',
        name: 'Ahmedabad',
        district: 'Ahmedabad',
        latRange: [22.9, 23.2],
        lonRange: [72.4, 72.7],
        commonLocalities: ['Bodakdev', 'Satellite', 'SG Highway', 'Vastrapur', 'Prahlad Nagar', 'Navrangpura', 'Bopal', 'Gift City Zone'],
        status: 'verified',
        authorities: [
          {
            id: 'amc_ahmedabad',
            name: 'Ahmedabad Municipal Corporation (AMC)',
            shortName: 'AMC',
            type: 'municipal_corporation',
            primaryByeLaw: 'Gujarat CGDCR 2017 (Amended 2022 / AMC Zonal Regulations)',
            jurisdictionDescription: 'Governs municipal wards, BRTS transit corridors, and central business district in Ahmedabad.',
            availableZones: ['Residential (R-1 / R-2)', 'Commercial CBD', 'Transit Oriented Zone (TOZ)', 'Industrial'],
            defaultRoadWidthM: 12.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://ahmedabadcity.gov.in',
            status: 'verified',
            documentCount: 6
          },
          {
            id: 'auda_ahmedabad',
            name: 'Ahmedabad Urban Development Authority (AUDA)',
            shortName: 'AUDA',
            type: 'development_authority',
            primaryByeLaw: 'AUDA Master Plan 2031 / CGDCR 2017',
            jurisdictionDescription: 'Governs outer peripheral growth ring, SP Ring Road corridor, and Bopal-Ghuma nodes.',
            availableZones: ['Residential R-1', 'Commercial Transit Corridor', 'Agricultural / Green Belt'],
            defaultRoadWidthM: 18.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://auda.org.in',
            status: 'verified',
            documentCount: 4
          }
        ]
      },
      {
        id: 'surat',
        name: 'Surat',
        district: 'Surat',
        latRange: [21.1, 21.3],
        lonRange: [72.7, 73.0],
        commonLocalities: ['Vesu', 'Adajan', 'Varachha', 'Piplod', 'Ghod Dod Road'],
        status: 'verified',
        authorities: [
          {
            id: 'smc_surat',
            name: 'Surat Municipal Corporation (SMC / SUDA)',
            shortName: 'SMC',
            type: 'municipal_corporation',
            primaryByeLaw: 'Gujarat CGDCR 2017',
            jurisdictionDescription: 'Governs textile and diamond capital urban planning in Surat.',
            availableZones: ['Residential', 'Commercial', 'Textile / Diamond Industrial'],
            defaultRoadWidthM: 12.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://suratmunicipal.gov.in',
            status: 'verified',
            documentCount: 3
          }
        ]
      },
      {
        id: 'vadodara',
        name: 'Vadodara',
        district: 'Vadodara',
        latRange: [22.2, 22.4],
        lonRange: [73.1, 73.3],
        commonLocalities: ['Alkapuri', 'Gotri', 'Vasna', 'Manjalpur', 'Karelibaug'],
        status: 'partially_verified',
        authorities: [
          {
            id: 'vmc_vadodara',
            name: 'Vadodara Municipal Corporation (VMC / VUDA)',
            shortName: 'VMC',
            type: 'municipal_corporation',
            primaryByeLaw: 'Gujarat CGDCR 2017',
            jurisdictionDescription: 'Governs municipal wards and urban growth zones in Vadodara.',
            availableZones: ['Residential', 'Commercial', 'Industrial'],
            defaultRoadWidthM: 12.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://vmc.gov.in',
            status: 'partially_verified',
            documentCount: 2
          }
        ]
      }
    ]
  },

  // ==========================================
  // 10. WEST BENGAL
  // ==========================================
  {
    id: 'west_bengal',
    name: 'West Bengal',
    stateCode: 'WB',
    stateBuildingCode: 'Kolkata Municipal Corporation Building Rules 2009 / WB Municipal Building Rules',
    status: 'verified',
    citiesSupported: 1,
    authoritiesSupported: 3,
    regulationsAvailable: 11,
    cities: [
      {
        id: 'kolkata',
        name: 'Kolkata',
        district: 'Kolkata & KMDA Area',
        latRange: [22.4, 22.7],
        lonRange: [88.2, 88.5],
        commonLocalities: ['Salt Lake (Bidhannagar)', 'New Town', 'Ballygunge', 'Alipore', 'Park Street', 'EM Bypass', 'Behala', 'Rajarhat'],
        status: 'verified',
        authorities: [
          {
            id: 'kmc_kolkata',
            name: 'Kolkata Municipal Corporation (KMC)',
            shortName: 'KMC',
            type: 'municipal_corporation',
            primaryByeLaw: 'KMC Building Rules 2009 (Schedule II)',
            jurisdictionDescription: 'Sanctioning authority for core Kolkata municipal boroughs (Boroughs I to XVI).',
            availableZones: ['Residential (Core)', 'Commercial', 'Mixed Commercial', 'Heritage Conservation'],
            defaultRoadWidthM: 9.0,
            bighaInSqFt: 14400,
            officialUrl: 'https://kmcgov.in',
            status: 'verified',
            documentCount: 6
          },
          {
            id: 'wbhira_newtown',
            name: 'New Town Kolkata Development Authority (NKDA / HIDCO)',
            shortName: 'NKDA (New Town)',
            type: 'development_authority',
            primaryByeLaw: 'NKDA Building Regulations & Smart City Guidelines',
            jurisdictionDescription: 'Planning authority for Action Areas I, II, III in New Town and Rajarhat high-tech IT corridor.',
            availableZones: ['Smart City Residential', 'Financial Tech Hub', 'Commercial Node'],
            defaultRoadWidthM: 18.0,
            bighaInSqFt: 14400,
            officialUrl: 'https://nkdamar.org',
            status: 'verified',
            documentCount: 3
          },
          {
            id: 'kmda_kolkata',
            name: 'Kolkata Metropolitan Development Authority (KMDA)',
            shortName: 'KMDA',
            type: 'metropolitan_authority',
            primaryByeLaw: 'WB Municipal Building Rules / KMDA Land Use and Development Control Plan',
            jurisdictionDescription: 'Governs statutory metropolitan planning area surrounding Kolkata.',
            availableZones: ['Metropolitan Residential', 'Industrial Corridor'],
            defaultRoadWidthM: 12.0,
            bighaInSqFt: 14400,
            officialUrl: 'https://kmda.wb.gov.in',
            status: 'partially_verified',
            documentCount: 2
          }
        ]
      }
    ]
  },

  // ==========================================
  // 11. KERALA
  // ==========================================
  {
    id: 'kerala',
    name: 'Kerala',
    stateCode: 'KL',
    stateBuildingCode: 'Kerala Municipality Building Rules (KMBR 2019) / KPBR 2019',
    status: 'verified',
    citiesSupported: 2,
    authoritiesSupported: 2,
    regulationsAvailable: 8,
    cities: [
      {
        id: 'kochi',
        name: 'Kochi (Ernakulam)',
        district: 'Ernakulam',
        latRange: [9.8, 10.1],
        lonRange: [76.2, 76.4],
        commonLocalities: ['Kadavanthra', 'Kaloor', 'Edappally', 'Marine Drive', 'Kakkanad (InfoPark)', 'Panampilly Nagar'],
        status: 'verified',
        authorities: [
          {
            id: 'gcda_kochi',
            name: 'Greater Cochin Development Authority (GCDA / Kochi Corp)',
            shortName: 'GCDA / Kochi Corp',
            type: 'development_authority',
            primaryByeLaw: 'Kerala Municipality Building Rules (KMBR 2019)',
            jurisdictionDescription: 'Governs high-rise residential, IT parks, and coastal urban development in Greater Cochin.',
            availableZones: ['Residential', 'Commercial', 'IT Park (InfoPark)', 'Coastal Regulation Zone (CRZ)'],
            defaultRoadWidthM: 10.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://gcda.kerala.gov.in',
            status: 'verified',
            documentCount: 4
          }
        ]
      },
      {
        id: 'thiruvananthapuram',
        name: 'Thiruvananthapuram',
        district: 'Thiruvananthapuram',
        latRange: [8.4, 8.6],
        lonRange: [76.8, 77.0],
        commonLocalities: ['Kowdiar', 'Vellayambalam', 'Technopark (Kazhakkoottam)', 'Pattom', 'Sasthamangalam'],
        status: 'partially_verified',
        authorities: [
          {
            id: 'trida_tvm',
            name: 'Thiruvananthapuram Development Authority (TRIDA)',
            shortName: 'TRIDA',
            type: 'development_authority',
            primaryByeLaw: 'Kerala Municipality Building Rules (KMBR 2019)',
            jurisdictionDescription: 'Governs urban master plan and development schemes in Kerala capital.',
            availableZones: ['Residential', 'Commercial', 'Technopark IT Zone'],
            defaultRoadWidthM: 10.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://trida.kerala.gov.in',
            status: 'partially_verified',
            documentCount: 2
          }
        ]
      }
    ]
  },

  // ==========================================
  // 12. MADHYA PRADESH
  // ==========================================
  {
    id: 'madhya_pradesh',
    name: 'Madhya Pradesh',
    stateCode: 'MP',
    stateBuildingCode: 'Madhya Pradesh Bhumi Vikas Niyam 2012 (MP Town & Country Planning)',
    status: 'verified',
    citiesSupported: 2,
    authoritiesSupported: 2,
    regulationsAvailable: 8,
    cities: [
      {
        id: 'indore',
        name: 'Indore',
        district: 'Indore',
        latRange: [22.6, 22.8],
        lonRange: [75.7, 76.0],
        commonLocalities: ['Vijay Nagar', 'Super Corridor', 'Palasia', 'AB Road', 'Rau', 'Bhawarkua'],
        status: 'verified',
        authorities: [
          {
            id: 'ida_indore',
            name: 'Indore Development Authority (IDA / IMC)',
            shortName: 'IDA / IMC',
            type: 'development_authority',
            primaryByeLaw: 'MP Bhumi Vikas Niyam 2012 / Indore Master Plan 2021/2035',
            jurisdictionDescription: 'Governs Super Corridor, MR-10 planned schemes, and municipal sanctions in Indore.',
            availableZones: ['Residential Scheme', 'Commercial Super Corridor', 'IT / Educational Hub'],
            defaultRoadWidthM: 12.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://idaindore.org',
            status: 'verified',
            documentCount: 4
          }
        ]
      },
      {
        id: 'bhopal',
        name: 'Bhopal',
        district: 'Bhopal',
        latRange: [23.1, 23.4],
        lonRange: [77.3, 77.6],
        commonLocalities: ['Arera Colony', 'Hoshangabad Road', 'Kolar Road', 'MP Nagar', 'Bittan Market'],
        status: 'partially_verified',
        authorities: [
          {
            id: 'bda_bhopal',
            name: 'Bhopal Development Authority (BDA / BMC)',
            shortName: 'BDA Bhopal',
            type: 'development_authority',
            primaryByeLaw: 'MP Bhumi Vikas Niyam 2012',
            jurisdictionDescription: 'Governs planned sectors and municipal limits in Bhopal.',
            availableZones: ['Residential', 'Commercial MP Nagar', 'Institutional'],
            defaultRoadWidthM: 12.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://bda.mp.gov.in',
            status: 'partially_verified',
            documentCount: 2
          }
        ]
      }
    ]
  },

  // ==========================================
  // 13. PUNJAB
  // ==========================================
  {
    id: 'punjab',
    name: 'Punjab',
    stateCode: 'PB',
    stateBuildingCode: 'Punjab Municipal Building Bye-Laws 2018 / PUDA Regulations',
    status: 'verified',
    citiesSupported: 2,
    authoritiesSupported: 2,
    regulationsAvailable: 8,
    cities: [
      {
        id: 'ludhiana',
        name: 'Ludhiana',
        district: 'Ludhiana',
        latRange: [30.8, 31.0],
        lonRange: [75.7, 76.0],
        commonLocalities: ['Sarabha Nagar', 'Model Town', 'Ferozepur Road', 'Civil Lines'],
        status: 'partially_verified',
        authorities: [
          {
            id: 'glada_ludhiana',
            name: 'Greater Ludhiana Area Development Authority (GLADA / MC Ludhiana)',
            shortName: 'GLADA',
            type: 'development_authority',
            primaryByeLaw: 'Punjab Municipal Building Bye-Laws 2018',
            jurisdictionDescription: 'Governs industrial capital of Punjab urban estate developments.',
            availableZones: ['Residential', 'Commercial', 'Industrial / Focal Point'],
            defaultRoadWidthM: 12.0,
            bighaInSqFt: 9072,
            officialUrl: 'https://glada.gov.in',
            status: 'partially_verified',
            documentCount: 2
          }
        ]
      },
      {
        id: 'mohali',
        name: 'Mohali (SAS Nagar)',
        district: 'SAS Nagar',
        latRange: [30.6, 30.8],
        lonRange: [76.6, 76.8],
        commonLocalities: ['Sector 70', 'Sector 82 (Aerocity)', 'Sector 68', 'Sector 115', 'Kharar'],
        status: 'verified',
        authorities: [
          {
            id: 'gmada_mohali',
            name: 'Greater Mohali Area Development Authority (GMADA)',
            shortName: 'GMADA',
            type: 'development_authority',
            primaryByeLaw: 'Punjab Model Building Bye-Laws / GMADA Regulations',
            jurisdictionDescription: 'Governs IT City, Aerocity, and master plan sectors in SAS Nagar.',
            availableZones: ['Residential Plotted', 'Aerocity Commercial', 'IT City'],
            defaultRoadWidthM: 15.0,
            bighaInSqFt: 9072,
            officialUrl: 'https://gmada.gov.in',
            status: 'verified',
            documentCount: 4
          }
        ]
      }
    ]
  },

  // ==========================================
  // 14. ANDHRA PRADESH
  // ==========================================
  {
    id: 'andhra_pradesh',
    name: 'Andhra Pradesh',
    stateCode: 'AP',
    stateBuildingCode: 'Andhra Pradesh Building Rules 2017 (APBMR 2017 / G.O. Ms. No. 119)',
    status: 'verified',
    citiesSupported: 2,
    authoritiesSupported: 2,
    regulationsAvailable: 8,
    cities: [
      {
        id: 'visakhapatnam',
        name: 'Visakhapatnam (Vizag)',
        district: 'Visakhapatnam',
        latRange: [17.6, 17.9],
        lonRange: [83.2, 83.4],
        commonLocalities: ['Madhurawada', 'MVP Colony', 'Gajuwaka', 'Seethammadhara', 'Beach Road'],
        status: 'verified',
        authorities: [
          {
            id: 'vmrda_vizag',
            name: 'Visakhapatnam Metropolitan Region Development Authority (VMRDA / GVMC)',
            shortName: 'VMRDA',
            type: 'metropolitan_authority',
            primaryByeLaw: 'AP Building Rules 2017 (G.O. Ms. No. 119)',
            jurisdictionDescription: 'Governs high-rise residential, port logistics, and coastal developments in Visakhapatnam.',
            availableZones: ['Residential', 'Commercial', 'IT Corridor (Madhurawada)', 'CRZ Urban'],
            defaultRoadWidthM: 12.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://vmrda.gov.in',
            status: 'verified',
            documentCount: 4
          }
        ]
      },
      {
        id: 'vijayawada',
        name: 'Vijayawada (Amaravati Capital Region)',
        district: 'NTR / Krishna',
        latRange: [16.4, 16.6],
        lonRange: [80.5, 80.8],
        commonLocalities: ['Benz Circle', 'MG Road', 'Bhavanipuram', 'Gannavaram', 'Tadepalli'],
        status: 'partially_verified',
        authorities: [
          {
            id: 'apcrda_vijayawada',
            name: 'Andhra Pradesh Capital Region Development Authority (APCRDA / VMC)',
            shortName: 'APCRDA',
            type: 'development_authority',
            primaryByeLaw: 'APCRDA Master Plan / AP Building Rules 2017',
            jurisdictionDescription: 'Governs Amaravati capital region, Vijayawada municipal area, and highway corridors.',
            availableZones: ['Capital City Zone', 'Commercial Corridor', 'Residential'],
            defaultRoadWidthM: 15.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://crda.ap.gov.in',
            status: 'partially_verified',
            documentCount: 2
          }
        ]
      }
    ]
  },

  // ==========================================
  // 15. CHANDIGARH (UT)
  // ==========================================
  {
    id: 'chandigarh_ut',
    name: 'Chandigarh (UT)',
    stateCode: 'CH',
    stateBuildingCode: 'Chandigarh Master Plan 2031 / Chandigarh Building Rules (Urban) 2017',
    status: 'verified',
    citiesSupported: 1,
    authoritiesSupported: 1,
    regulationsAvailable: 6,
    cities: [
      {
        id: 'chandigarh',
        name: 'Chandigarh (City Beautiful)',
        district: 'Chandigarh',
        latRange: [30.6, 30.8],
        lonRange: [76.7, 76.9],
        commonLocalities: ['Sector 1-30 (Corbusian Heritage Zone)', 'Sector 31-47 (Phase 2)', 'Sector 48-63 (Phase 3)', 'IT Park (Kishangarh)'],
        status: 'verified',
        authorities: [
          {
            id: 'chd_administration',
            name: 'Chandigarh Administration (Department of Urban Planning)',
            shortName: 'Chandigarh Admin',
            type: 'development_authority',
            primaryByeLaw: 'Chandigarh Building Rules (Urban) 2017 / Architectural Control Sheets',
            jurisdictionDescription: 'Strict Le Corbusier grid zoning, architectural control frame rules, and sector facade regulations.',
            availableZones: ['Heritage Corbusier Zone', 'Plotted Residential', 'Commercial Sector 17', 'IT Park'],
            defaultRoadWidthM: 18.0,
            bighaInSqFt: 9072,
            officialUrl: 'https://chandigarh.gov.in',
            status: 'verified',
            documentCount: 6
          }
        ]
      }
    ]
  },

  // ==========================================
  // 16. ODISHA
  // ==========================================
  {
    id: 'odisha',
    name: 'Odisha',
    stateCode: 'OD',
    stateBuildingCode: 'Odisha Development Authorities (Planning and Building Standards) Rules 2020',
    status: 'verified',
    citiesSupported: 1,
    authoritiesSupported: 1,
    regulationsAvailable: 6,
    cities: [
      {
        id: 'bhubaneswar',
        name: 'Bhubaneswar',
        district: 'Khurda',
        latRange: [20.2, 20.4],
        lonRange: [85.7, 85.9],
        commonLocalities: ['Saheed Nagar', 'Patia', 'Jayadev Vihar', 'Chandrasekharpur', 'Khandagiri'],
        status: 'verified',
        authorities: [
          {
            id: 'bda_bhubaneswar',
            name: 'Bhubaneswar Development Authority (BDA / BMC)',
            shortName: 'BDA Bhubaneswar',
            type: 'development_authority',
            primaryByeLaw: 'Odisha Planning and Building Standards Rules 2020',
            jurisdictionDescription: 'Governs planned sectors, InfoCity IT hub, and temple precinct heritage rules in Bhubaneswar.',
            availableZones: ['Residential Plotted', 'InfoCity Commercial', 'Heritage Precinct'],
            defaultRoadWidthM: 12.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://bda.gov.in',
            status: 'verified',
            documentCount: 4
          }
        ]
      }
    ]
  },

  // ==========================================
  // 17. GOA
  // ==========================================
  {
    id: 'goa',
    name: 'Goa',
    stateCode: 'GA',
    stateBuildingCode: 'Goa Land Development and Building Construction Regulations 2010',
    status: 'verified',
    citiesSupported: 2,
    authoritiesSupported: 2,
    regulationsAvailable: 6,
    cities: [
      {
        id: 'panaji',
        name: 'Panaji (North Goa)',
        district: 'North Goa',
        latRange: [15.4, 15.6],
        lonRange: [73.7, 73.9],
        commonLocalities: ['Miramar', 'Campal', 'Fontainhas (Heritage)', 'Dona Paula', 'Porvorim'],
        status: 'verified',
        authorities: [
          {
            id: 'ngpda_panaji',
            name: 'North Goa Planning and Development Authority (NGPDA)',
            shortName: 'NGPDA',
            type: 'development_authority',
            primaryByeLaw: 'Goa Land Development & Building Regulations 2010 / Outline Development Plan (ODP)',
            jurisdictionDescription: 'Governs Panaji city, heritage precincts, and eco-sensitive coastal village panchayats.',
            availableZones: ['Residential (S-1 / S-2)', 'Commercial', 'Heritage Conservation (Fontainhas)', 'CRZ Tourism'],
            defaultRoadWidthM: 8.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://tcp.goa.gov.in',
            status: 'verified',
            documentCount: 4
          }
        ]
      },
      {
        id: 'margao',
        name: 'Margao (South Goa)',
        district: 'South Goa',
        latRange: [15.2, 15.4],
        lonRange: [73.9, 74.1],
        commonLocalities: ['Fatorda', 'Borda', 'Aquem', 'Pajifond'],
        status: 'partially_verified',
        authorities: [
          {
            id: 'sgpda_margao',
            name: 'South Goa Planning and Development Authority (SGPDA)',
            shortName: 'SGPDA',
            type: 'development_authority',
            primaryByeLaw: 'Goa Land Development & Building Regulations 2010',
            jurisdictionDescription: 'Governs planned commercial and residential development in South Goa urban core.',
            availableZones: ['Residential', 'Commercial', 'Mixed Use'],
            defaultRoadWidthM: 9.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://tcp.goa.gov.in',
            status: 'partially_verified',
            documentCount: 2
          }
        ]
      }
    ]
  },

  // ==========================================
  // 18. BIHAR
  // ==========================================
  {
    id: 'bihar',
    name: 'Bihar',
    stateCode: 'BR',
    stateBuildingCode: 'Bihar Building Bye-Laws 2014 (Amended 2022)',
    status: 'partially_verified',
    citiesSupported: 1,
    authoritiesSupported: 1,
    regulationsAvailable: 4,
    cities: [
      {
        id: 'patna',
        name: 'Patna',
        district: 'Patna',
        latRange: [25.5, 25.7],
        lonRange: [85.0, 85.3],
        commonLocalities: ['Boring Road', 'Kankarbagh', 'Bailey Road', 'Patliputra Colony', 'Rajendra Nagar'],
        status: 'partially_verified',
        authorities: [
          {
            id: 'prda_patna',
            name: 'Patna Regional Development Authority (PRDA / PMC Patna)',
            shortName: 'PRDA / PMC',
            type: 'development_authority',
            primaryByeLaw: 'Bihar Building Bye-Laws 2014 (Amended 2022 / Master Plan 2031)',
            jurisdictionDescription: 'Sanctioning authority for Patna metropolitan area and municipal corporation wards.',
            availableZones: ['Residential', 'Commercial Arterial (Bailey Road)', 'Mixed Land Use'],
            defaultRoadWidthM: 9.0,
            bighaInSqFt: 27225,
            officialUrl: 'https://pmc.bihar.gov.in',
            status: 'partially_verified',
            documentCount: 4
          }
        ]
      }
    ]
  },

  // ==========================================
  // 19. ASSAM
  // ==========================================
  {
    id: 'assam',
    name: 'Assam',
    stateCode: 'AS',
    stateBuildingCode: 'Guwahati Building Construction (Regulation) Bye-Laws 2014 / Assam MBBL',
    status: 'partially_verified',
    citiesSupported: 1,
    authoritiesSupported: 1,
    regulationsAvailable: 4,
    cities: [
      {
        id: 'guwahati',
        name: 'Guwahati',
        district: 'Kamrup Metropolitan',
        latRange: [26.1, 26.3],
        lonRange: [91.6, 91.9],
        commonLocalities: ['GS Road', 'Dispur', 'Zoo Road', 'Ulubari', 'Paltan Bazaar'],
        status: 'partially_verified',
        authorities: [
          {
            id: 'gmda_guwahati',
            name: 'Guwahati Metropolitan Development Authority (GMDA / GMC)',
            shortName: 'GMDA Guwahati',
            type: 'development_authority',
            primaryByeLaw: 'Guwahati Building Construction Bye-Laws (Seismic Zone V Provisions)',
            jurisdictionDescription: 'Governs high seismic vulnerability zone planning, hill slope cutting restrictions, and wetlands in Guwahati.',
            availableZones: ['Residential', 'Commercial (GS Road)', 'Hill Slope Eco-Zone'],
            defaultRoadWidthM: 9.0,
            bighaInSqFt: 14400,
            officialUrl: 'https://gmda.assam.gov.in',
            status: 'partially_verified',
            documentCount: 4
          }
        ]
      }
    ]
  },

  // ==========================================
  // 20. UTTARAKHAND
  // ==========================================
  {
    id: 'uttarakhand',
    name: 'Uttarakhand',
    stateCode: 'UK',
    stateBuildingCode: 'Uttarakhand Building Construction and Development Bye-Laws / Regulations',
    status: 'partially_verified',
    citiesSupported: 1,
    authoritiesSupported: 1,
    regulationsAvailable: 4,
    cities: [
      {
        id: 'dehradun',
        name: 'Dehradun',
        district: 'Dehradun',
        latRange: [30.2, 30.5],
        lonRange: [77.9, 78.2],
        commonLocalities: ['Rajpur Road', 'Sahastradhara Road', 'Vasant Vihar', 'Chakrata Road'],
        status: 'partially_verified',
        authorities: [
          {
            id: 'mdda_dehradun',
            name: 'Mussoorie Dehradun Development Authority (MDDA)',
            shortName: 'MDDA',
            type: 'development_authority',
            primaryByeLaw: 'MDDA Building Bye-Laws / Hill Area Building Rules',
            jurisdictionDescription: 'Governs Dehradun valley, Mussoorie hill town, and Doon eco-sensitive protection rules.',
            availableZones: ['Residential Valley', 'Commercial Corridor', 'Hill Area Slopes'],
            defaultRoadWidthM: 9.0,
            bighaInSqFt: 9072,
            officialUrl: 'https://mddaonline.in',
            status: 'partially_verified',
            documentCount: 4
          }
        ]
      }
    ]
  },

  // ==========================================
  // 21. HIMACHAL PRADESH
  // ==========================================
  {
    id: 'himachal_pradesh',
    name: 'Himachal Pradesh',
    stateCode: 'HP',
    stateBuildingCode: 'Himachal Pradesh Town and Country Planning Rules 2014 / Shimla Development Plan',
    status: 'partially_verified',
    citiesSupported: 1,
    authoritiesSupported: 1,
    regulationsAvailable: 3,
    cities: [
      {
        id: 'shimla',
        name: 'Shimla',
        district: 'Shimla',
        latRange: [31.0, 31.2],
        lonRange: [77.1, 77.3],
        commonLocalities: ['The Mall', 'Sanjauli', 'Chotta Shimla', 'Kasumpti', 'New Shimla'],
        status: 'partially_verified',
        authorities: [
          {
            id: 'sda_shimla',
            name: 'Shimla Planning Area / Municipal Corporation Shimla',
            shortName: 'Shimla TCP',
            type: 'development_authority',
            primaryByeLaw: 'Shimla Development Plan (NGT Strict Hill Restrictions & Core Zone Caps)',
            jurisdictionDescription: 'Governs green belt restrictions, heritage core freeze, and 2.5 storey height limitations.',
            availableZones: ['Heritage Core Zone', 'Green Belt Non-Construction', 'Planning Area S-1'],
            defaultRoadWidthM: 6.0,
            bighaInSqFt: 9072,
            officialUrl: 'https://tcp.hp.gov.in',
            status: 'partially_verified',
            documentCount: 3
          }
        ]
      }
    ]
  },

  // ==========================================
  // 22. JHARKHAND
  // ==========================================
  {
    id: 'jharkhand',
    name: 'Jharkhand',
    stateCode: 'JH',
    stateBuildingCode: 'Jharkhand Municipal Building Bye-Laws 2016',
    status: 'coming_soon',
    citiesSupported: 0,
    authoritiesSupported: 0,
    regulationsAvailable: 0,
    cities: []
  },

  // ==========================================
  // 23. CHHATTISGARH
  // ==========================================
  {
    id: 'chhattisgarh',
    name: 'Chhattisgarh',
    stateCode: 'CG',
    stateBuildingCode: 'Chhattisgarh Bhumi Vikas Niyam / Town Planning Rules',
    status: 'coming_soon',
    citiesSupported: 0,
    authoritiesSupported: 0,
    regulationsAvailable: 0,
    cities: []
  },

  // ==========================================
  // 24. JAMMU & KASHMIR (UT)
  // ==========================================
  {
    id: 'jammu_and_kashmir',
    name: 'Jammu & Kashmir (UT)',
    stateCode: 'JK',
    stateBuildingCode: 'J&K Unified Building Bye-Laws 2021',
    status: 'coming_soon',
    citiesSupported: 0,
    authoritiesSupported: 0,
    regulationsAvailable: 0,
    cities: []
  },

  // ==========================================
  // 25. LADAKH (UT)
  // ==========================================
  {
    id: 'ladakh',
    name: 'Ladakh (UT)',
    stateCode: 'LA',
    stateBuildingCode: 'Ladakh Hill Development Council Building Guidelines',
    status: 'coming_soon',
    citiesSupported: 0,
    authoritiesSupported: 0,
    regulationsAvailable: 0,
    cities: []
  },

  // ==========================================
  // 26. PUDUCHERRY (UT)
  // ==========================================
  {
    id: 'puducherry',
    name: 'Puducherry (UT)',
    stateCode: 'PY',
    stateBuildingCode: 'Puducherry Building Bye-Laws and Zoning Regulations',
    status: 'coming_soon',
    citiesSupported: 0,
    authoritiesSupported: 0,
    regulationsAvailable: 0,
    cities: []
  },

  // ==========================================
  // 27. TRIPURA
  // ==========================================
  {
    id: 'tripura',
    name: 'Tripura',
    stateCode: 'TR',
    stateBuildingCode: 'Tripura Building Rules',
    status: 'coming_soon',
    citiesSupported: 0,
    authoritiesSupported: 0,
    regulationsAvailable: 0,
    cities: []
  },

  // ==========================================
  // 28. MEGHALAYA
  // ==========================================
  {
    id: 'meghalaya',
    name: 'Meghalaya',
    stateCode: 'ML',
    stateBuildingCode: 'Meghalaya Building Bye-Laws',
    status: 'coming_soon',
    citiesSupported: 0,
    authoritiesSupported: 0,
    regulationsAvailable: 0,
    cities: []
  },

  // ==========================================
  // 29. MANIPUR
  // ==========================================
  {
    id: 'manipur',
    name: 'Manipur',
    stateCode: 'MN',
    stateBuildingCode: 'Manipur Building Bye-Laws',
    status: 'coming_soon',
    citiesSupported: 0,
    authoritiesSupported: 0,
    regulationsAvailable: 0,
    cities: []
  },

  // ==========================================
  // 30. MIZORAM
  // ==========================================
  {
    id: 'mizoram',
    name: 'Mizoram',
    stateCode: 'MZ',
    stateBuildingCode: 'Mizoram Urban and Regional Planning Rules',
    status: 'coming_soon',
    citiesSupported: 0,
    authoritiesSupported: 0,
    regulationsAvailable: 0,
    cities: []
  },

  // ==========================================
  // 31. NAGALAND
  // ==========================================
  {
    id: 'nagaland',
    name: 'Nagaland',
    stateCode: 'NL',
    stateBuildingCode: 'Nagaland Building Bye-Laws',
    status: 'coming_soon',
    citiesSupported: 0,
    authoritiesSupported: 0,
    regulationsAvailable: 0,
    cities: []
  },

  // ==========================================
  // 32. SIKKIM
  // ==========================================
  {
    id: 'sikkim',
    name: 'Sikkim',
    stateCode: 'SK',
    stateBuildingCode: 'Sikkim Building Construction Regulations',
    status: 'coming_soon',
    citiesSupported: 0,
    authoritiesSupported: 0,
    regulationsAvailable: 0,
    cities: []
  },

  // ==========================================
  // 33. ARUNACHAL PRADESH
  // ==========================================
  {
    id: 'arunachal_pradesh',
    name: 'Arunachal Pradesh',
    stateCode: 'AR',
    stateBuildingCode: 'Arunachal Pradesh Building Bye-Laws',
    status: 'coming_soon',
    citiesSupported: 0,
    authoritiesSupported: 0,
    regulationsAvailable: 0,
    cities: []
  },

  // ==========================================
  // 34. ANDAMAN & NICOBAR ISLANDS (UT)
  // ==========================================
  {
    id: 'andaman_and_nicobar',
    name: 'Andaman & Nicobar Islands (UT)',
    stateCode: 'AN',
    stateBuildingCode: 'Port Blair Municipal Building Bye-Laws & CRZ Guidelines',
    status: 'coming_soon',
    citiesSupported: 0,
    authoritiesSupported: 0,
    regulationsAvailable: 0,
    cities: []
  },

  // ==========================================
  // 35. LAKSHADWEEP (UT)
  // ==========================================
  {
    id: 'lakshadweep',
    name: 'Lakshadweep (UT)',
    stateCode: 'LD',
    stateBuildingCode: 'Lakshadweep Coastal Island Building Guidelines',
    status: 'coming_soon',
    citiesSupported: 0,
    authoritiesSupported: 0,
    regulationsAvailable: 0,
    cities: []
  },

  // ==========================================
  // 36. DADRA & NAGAR HAVELI AND DAMAN & DIU (UT)
  // ==========================================
  {
    id: 'dadra_nagar_haveli_daman_diu',
    name: 'Dadra & Nagar Haveli and Daman & Diu (UT)',
    stateCode: 'DNHDD',
    stateBuildingCode: 'Daman & Diu Municipal Building Regulations',
    status: 'coming_soon',
    citiesSupported: 0,
    authoritiesSupported: 0,
    regulationsAvailable: 0,
    cities: []
  }
];

/**
 * Fast offline coordinate-to-city lookup helper for Indian Geolocation
 */
export function resolveLocationFromCoordinates(lat: number, lon: number): { stateId: string; cityId: string; authorityId: string } | null {
  for (const state of JURISDICTION_INDEX) {
    for (const city of state.cities) {
      if (city.latRange && city.lonRange) {
        const [minLat, maxLat] = city.latRange;
        const [minLon, maxLon] = city.lonRange;
        if (lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon) {
          return {
            stateId: state.id,
            cityId: city.id,
            authorityId: city.authorities[0]?.id || ''
          };
        }
      }
    }
  }
  return null;
}
