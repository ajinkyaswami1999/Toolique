// Toolique Building Feasibility & Bye-Law Checker - Location & Jurisdiction Resolver

export interface PlanningAuthorityInfo {
  id: string;
  name: string;
  shortName: string;
  city: string;
  state: string;
  primaryByeLaw: string;
  docClause: string;
  bighaInSqFt: number; // Regional bigha conversion factor
  defaultRoadWidthM: number;
  availableZones: string[];
}

export interface StateJurisdictionInfo {
  id: string;
  name: string;
  codeName: string;
  authorities: PlanningAuthorityInfo[];
}

export const INDIAN_STATES_AUTHORITIES: StateJurisdictionInfo[] = [
  {
    id: 'haryana',
    name: 'Haryana',
    codeName: 'Haryana Building Code 2017 (Amended 2023)',
    authorities: [
      {
        id: 'gurugram_gmda',
        name: 'Gurugram Metropolitan Development Authority (GMDA / DTCP)',
        shortName: 'GMDA / DTCP',
        city: 'Gurugram',
        state: 'Haryana',
        primaryByeLaw: 'Haryana Building Code 2017 (Rev 2023)',
        docClause: 'HBC 2017 Clause 6.1',
        bighaInSqFt: 27225,
        defaultRoadWidthM: 12.0,
        availableZones: ['Residential (Plotted)', 'Residential (Group Housing)', 'Commercial (SCO / Mall)', 'Mixed Land Use', 'Institutional']
      },
      {
        id: 'faridabad_fmda',
        name: 'Faridabad Metropolitan Development Authority (FMDA / HSVP)',
        shortName: 'FMDA / HSVP',
        city: 'Faridabad',
        state: 'Haryana',
        primaryByeLaw: 'Haryana Building Code 2017',
        docClause: 'HBC 2017 Clause 6.1',
        bighaInSqFt: 27225,
        defaultRoadWidthM: 12.0,
        availableZones: ['Residential (Plotted)', 'Commercial', 'Industrial', 'Institutional']
      },
      {
        id: 'panchkula_hsvp',
        name: 'HSVP Panchkula / TCP Haryana',
        shortName: 'HSVP Panchkula',
        city: 'Panchkula',
        state: 'Haryana',
        primaryByeLaw: 'Haryana Building Code 2017',
        docClause: 'HBC 2017 Clause 6.1',
        bighaInSqFt: 27225,
        defaultRoadWidthM: 9.0,
        availableZones: ['Residential (Plotted)', 'Commercial', 'Institutional']
      }
    ]
  },
  {
    id: 'delhi',
    name: 'Delhi (NCT)',
    codeName: 'Unified Building Bye-Laws for Delhi 2016 (UBBL-2016)',
    authorities: [
      {
        id: 'dda_delhi',
        name: 'Delhi Development Authority (DDA / MCD / NDMC)',
        shortName: 'DDA / MCD',
        city: 'Delhi',
        state: 'Delhi (NCT)',
        primaryByeLaw: 'Delhi UBBL 2016 / MPD-2021',
        docClause: 'UBBL 2016 Chapter 7',
        bighaInSqFt: 9072, // Delhi standard bigha
        defaultRoadWidthM: 13.5,
        availableZones: ['Residential (Plotted)', 'Commercial (Local Shopping)', 'Commercial (District Centre)', 'Mixed Use Corridor', 'Industrial']
      }
    ]
  },
  {
    id: 'maharashtra',
    name: 'Maharashtra',
    codeName: 'Unified Development Control & Promotion Regulations (UDCPR 2020)',
    authorities: [
      {
        id: 'mumbai_mcgm',
        name: 'Municipal Corporation of Greater Mumbai (MCGM / BMC)',
        shortName: 'MCGM / BMC',
        city: 'Mumbai',
        state: 'Maharashtra',
        primaryByeLaw: 'DCPR-2034 Mumbai',
        docClause: 'DCPR 2034 Reg 30 & 33',
        bighaInSqFt: 27225,
        defaultRoadWidthM: 12.2,
        availableZones: ['Residential (R-Zone)', 'Commercial (C-Zone)', 'Transit Oriented Development (TOD)', 'Industrial']
      },
      {
        id: 'pune_pmc',
        name: 'Pune Municipal Corporation (PMC / PMRDA)',
        shortName: 'PMC / PMRDA',
        city: 'Pune',
        state: 'Maharashtra',
        primaryByeLaw: 'Maharashtra UDCPR 2020',
        docClause: 'UDCPR Reg 6.1',
        bighaInSqFt: 27225,
        defaultRoadWidthM: 12.0,
        availableZones: ['Residential (R-1 / R-2)', 'Commercial', 'Mixed Use', 'IT / Biotechnology']
      },
      {
        id: 'navi_mumbai_cidco',
        name: 'City and Industrial Development Corporation (CIDCO / NMMC)',
        shortName: 'CIDCO / NMMC',
        city: 'Navi Mumbai',
        state: 'Maharashtra',
        primaryByeLaw: 'Maharashtra UDCPR 2020 / CIDCO GDCR',
        docClause: 'UDCPR Reg 6.1',
        bighaInSqFt: 27225,
        defaultRoadWidthM: 15.0,
        availableZones: ['Residential', 'Commercial Nodes', 'Industrial']
      },
      {
        id: 'nagpur_nmc',
        name: 'Nagpur Municipal Corporation (NMC / NIT)',
        shortName: 'NMC / NIT',
        city: 'Nagpur',
        state: 'Maharashtra',
        primaryByeLaw: 'Maharashtra UDCPR 2020',
        docClause: 'UDCPR Reg 6.1',
        bighaInSqFt: 27225,
        defaultRoadWidthM: 9.0,
        availableZones: ['Residential', 'Commercial', 'Mixed Use']
      },
      {
        id: 'thane_tmc',
        name: 'Thane Municipal Corporation (TMC)',
        shortName: 'TMC Thane',
        city: 'Thane',
        state: 'Maharashtra',
        primaryByeLaw: 'Maharashtra UDCPR 2020',
        docClause: 'UDCPR Reg 6.1',
        bighaInSqFt: 27225,
        defaultRoadWidthM: 12.0,
        availableZones: ['Residential', 'Commercial', 'Industrial']
      }
    ]
  },
  {
    id: 'karnataka',
    name: 'Karnataka',
    codeName: 'BBMP Building Bye-Laws / BDA Revised Master Plan',
    authorities: [
      {
        id: 'bengaluru_bbmp',
        name: 'Bruhat Bengaluru Mahanagara Palike (BBMP / BDA)',
        shortName: 'BBMP / BDA',
        city: 'Bengaluru',
        state: 'Karnataka',
        primaryByeLaw: 'BBMP Building Bye-Laws / BDA Master Plan 2031',
        docClause: 'Zonal Regs Table 7.1',
        bighaInSqFt: 27225,
        defaultRoadWidthM: 12.0,
        availableZones: ['Residential (Main / Mixed)', 'Commercial (Central / Mutation)', 'Industrial (Hi-tech)']
      },
      {
        id: 'mysuru_muda',
        name: 'Mysuru Urban Development Authority (MUDA)',
        shortName: 'MUDA Mysuru',
        city: 'Mysuru',
        state: 'Karnataka',
        primaryByeLaw: 'Karnataka Planning Authority Rules / MUDA Zonal Regs',
        docClause: 'MUDA Master Plan',
        bighaInSqFt: 27225,
        defaultRoadWidthM: 9.0,
        availableZones: ['Residential', 'Commercial', 'Heritage Zone']
      }
    ]
  },
  {
    id: 'tamil_nadu',
    name: 'Tamil Nadu',
    codeName: 'Tamil Nadu Combined Development & Building Rules (TNCDBR 2019)',
    authorities: [
      {
        id: 'chennai_cmda',
        name: 'Chennai Metropolitan Development Authority (CMDA / GCC)',
        shortName: 'CMDA / GCC',
        city: 'Chennai',
        state: 'Tamil Nadu',
        primaryByeLaw: 'TNCDBR 2019 (G.O. Ms. No. 18)',
        docClause: 'TNCDBR Rule 35 & 36',
        bighaInSqFt: 27225,
        defaultRoadWidthM: 12.0,
        availableZones: ['Primary Residential', 'Mixed Residential', 'Commercial Use', 'Institutional']
      },
      {
        id: 'coimbatore_cpa',
        name: 'Coimbatore Local Planning Authority (CCMC / LPA)',
        shortName: 'Coimbatore LPA',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        primaryByeLaw: 'TNCDBR 2019',
        docClause: 'TNCDBR Rule 35',
        bighaInSqFt: 27225,
        defaultRoadWidthM: 9.0,
        availableZones: ['Residential', 'Commercial', 'Industrial']
      }
    ]
  },
  {
    id: 'telangana',
    name: 'Telangana',
    codeName: 'Telangana Building Rules (G.O. Ms. No. 168 / TG-bPASS)',
    authorities: [
      {
        id: 'hyderabad_ghmc',
        name: 'Greater Hyderabad Municipal Corporation (GHMC / HMDA)',
        shortName: 'GHMC / HMDA',
        city: 'Hyderabad',
        state: 'Telangana',
        primaryByeLaw: 'Telangana Building Rules (GO 168 & TG-bPASS)',
        docClause: 'GO 168 Table III',
        bighaInSqFt: 27225,
        defaultRoadWidthM: 12.0,
        availableZones: ['Residential', 'Commercial (High Density)', 'Mixed Use (Multi-Purpose)', 'IT Corridor']
      }
    ]
  },
  {
    id: 'uttar_pradesh',
    name: 'Uttar Pradesh',
    codeName: 'UP Urban Planning & Development Bye-Laws / Industrial Authority Master Plans',
    authorities: [
      {
        id: 'noida_authority',
        name: 'New Okhla Industrial Development Authority (NOIDA)',
        shortName: 'NOIDA Authority',
        city: 'Noida',
        state: 'Uttar Pradesh',
        primaryByeLaw: 'NOIDA Building Regulations 2020',
        docClause: 'NOIDA Chapter 4',
        bighaInSqFt: 27225,
        defaultRoadWidthM: 18.0,
        availableZones: ['Residential Plotted', 'Group Housing', 'Commercial Sector', 'Institutional / IT']
      },
      {
        id: 'greater_noida_gnida',
        name: 'Greater Noida Industrial Development Authority (GNIDA / YEIDA)',
        shortName: 'GNIDA / YEIDA',
        city: 'Greater Noida',
        state: 'Uttar Pradesh',
        primaryByeLaw: 'GNIDA Building Regulations',
        docClause: 'GNIDA Clause 5.2',
        bighaInSqFt: 27225,
        defaultRoadWidthM: 18.0,
        availableZones: ['Residential Plotted', 'Commercial', 'Institutional', 'Industrial']
      },
      {
        id: 'lucknow_lda',
        name: 'Lucknow Development Authority (LDA / LMC)',
        shortName: 'LDA Lucknow',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        primaryByeLaw: 'UP Model Building Bye-Laws',
        docClause: 'LDA Master Plan 2031',
        bighaInSqFt: 27225,
        defaultRoadWidthM: 9.0,
        availableZones: ['Residential', 'Commercial', 'Mixed Land Use']
      }
    ]
  },
  {
    id: 'rajasthan',
    name: 'Rajasthan',
    codeName: 'Rajasthan Model Building Regulations 2020 / JDA',
    authorities: [
      {
        id: 'jaipur_jda',
        name: 'Jaipur Development Authority (JDA / JMC)',
        shortName: 'JDA / JMC',
        city: 'Jaipur',
        state: 'Rajasthan',
        primaryByeLaw: 'Rajasthan Model Building Bye-Laws 2020',
        docClause: 'Table 5.1 & Chapter 5',
        bighaInSqFt: 27225,
        defaultRoadWidthM: 12.0,
        availableZones: ['Residential Plotted', 'Commercial Corridor', 'Heritage Walled City', 'Mixed Land Use']
      }
    ]
  },
  {
    id: 'gujarat',
    name: 'Gujarat',
    codeName: 'Comprehensive General Development Control Regulations (CGDCR 2017)',
    authorities: [
      {
        id: 'ahmedabad_amc',
        name: 'Ahmedabad Municipal Corporation (AMC / AUDA)',
        shortName: 'AMC / AUDA',
        city: 'Ahmedabad',
        state: 'Gujarat',
        primaryByeLaw: 'Gujarat CGDCR 2017 (Amended 2022)',
        docClause: 'Part II Table 6.1',
        bighaInSqFt: 27225,
        defaultRoadWidthM: 12.0,
        availableZones: ['Residential (R-1 / R-2)', 'Commercial (CBD / Transit)', 'Industrial']
      },
      {
        id: 'surat_smc',
        name: 'Surat Municipal Corporation (SMC / SUDA)',
        shortName: 'SMC / SUDA',
        city: 'Surat',
        state: 'Gujarat',
        primaryByeLaw: 'Gujarat CGDCR 2017',
        docClause: 'Part II Table 6.1',
        bighaInSqFt: 27225,
        defaultRoadWidthM: 12.0,
        availableZones: ['Residential', 'Commercial', 'Textile / Industrial']
      }
    ]
  },
  {
    id: 'west_bengal',
    name: 'West Bengal',
    codeName: 'Kolkata Municipal Corporation (KMC) Building Rules 2009',
    authorities: [
      {
        id: 'kolkata_kmc',
        name: 'Kolkata Municipal Corporation (KMC / KMDA)',
        shortName: 'KMC / KMDA',
        city: 'Kolkata',
        state: 'West Bengal',
        primaryByeLaw: 'KMC Building Rules 2009',
        docClause: 'Rule 61 & Schedule II',
        bighaInSqFt: 14400, // Bengal Katha/Bigha system (1 Bigha = 20 Katha = 14400 sq.ft)
        defaultRoadWidthM: 9.0,
        availableZones: ['Residential', 'Commercial', 'Mixed Commercial', 'Heritage']
      }
    ]
  }
];

export function resolveJurisdiction(stateId: string, authorityId?: string) {
  const state = INDIAN_STATES_AUTHORITIES.find(s => s.id === stateId) || INDIAN_STATES_AUTHORITIES[0];
  const authority = state.authorities.find(a => a.id === authorityId) || state.authorities[0];
  
  return {
    state,
    authority,
    primaryCode: authority ? authority.primaryByeLaw : state.codeName,
    tierHierarchy: [
      authority ? `${authority.name} (${authority.city})` : state.name,
      state.name,
      'National Building Code of India (NBC 2016)',
      'Statutory Authorities (AAI, NHAI, Railways, NGT)'
    ]
  };
}
