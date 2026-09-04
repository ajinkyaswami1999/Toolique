export interface CityZoneRegulation {
  fsi: number;
  authority: string;
  doc: string;
  verified: string;
  notes: string;
}

export interface CityData {
  id: string;
  name: string;
  zones: {
    residential: CityZoneRegulation;
    commercial: CityZoneRegulation;
    mixed_use?: CityZoneRegulation;
    industrial?: CityZoneRegulation;
  };
}

export interface StateData {
  id: string;
  name: string;
  bighaFactor: number; // in sq ft
  cities: CityData[];
}

export const INDIAN_STATES_FSI_DATA: StateData[] = [
  {
    id: "andhra_pradesh",
    name: "Andhra Pradesh",
    bighaFactor: 27225.0,
    cities: [
      {
        id: "visakhapatnam",
        name: "Visakhapatnam (Vizag)",
        zones: {
          residential: { fsi: 2.00, authority: "GVMC / VMRDA", doc: "AP Building Rules 2017 (GO 119)", verified: "15 Jan 2026", notes: "Base FSI 2.0; premium FSI and TDR applicable for road width > 12m." },
          commercial: { fsi: 2.75, authority: "GVMC / VMRDA", doc: "AP Building Rules 2017", verified: "15 Jan 2026", notes: "Higher FSI permissible on commercial corridors fronting 18m+ roads." },
          mixed_use: { fsi: 2.50, authority: "VMRDA", doc: "Master Plan 2030", verified: "15 Jan 2026", notes: "Mixed-use high density development nodes." },
          industrial: { fsi: 1.50, authority: "APIIC / GVMC", doc: "Industrial Zoning Regs", verified: "15 Jan 2026", notes: "Standard manufacturing and logistics parks." }
        }
      },
      {
        id: "vijayawada",
        name: "Vijayawada",
        zones: {
          residential: { fsi: 1.75, authority: "VMC / APCRDA", doc: "AP Building Rules (GO 119)", verified: "18 Jan 2026", notes: "Standard residential plotted and apartment FSI." },
          commercial: { fsi: 2.50, authority: "VMC / APCRDA", doc: "APCRDA Master Plan", verified: "18 Jan 2026", notes: "Central commercial district and arterial road FSI." }
        }
      },
      {
        id: "amaravati",
        name: "Amaravati (Capital City)",
        zones: {
          residential: { fsi: 2.50, authority: "APCRDA", doc: "Amaravati Master Plan 2050", verified: "20 Jan 2026", notes: "High-efficiency green city layout with incentive FSI for green ratings." },
          commercial: { fsi: 3.50, authority: "APCRDA", doc: "Amaravati Master Plan", verified: "20 Jan 2026", notes: "Financial tech and central commercial high-rise zones." }
        }
      },
      {
        id: "guntur",
        name: "Guntur",
        zones: {
          residential: { fsi: 1.75, authority: "GMC / APCRDA", doc: "AP Building Rules", verified: "10 Feb 2026", notes: "Base residential FSI for municipal limits." },
          commercial: { fsi: 2.50, authority: "GMC / APCRDA", doc: "AP Building Rules", verified: "10 Feb 2026", notes: "Core market and wholesale trade corridors." }
        }
      },
      {
        id: "tirupati",
        name: "Tirupati",
        zones: {
          residential: { fsi: 1.50, authority: "TMC / TUDA", doc: "TUDA Master Plan 2031", verified: "12 Feb 2026", notes: "Pilgrimage heritage height restrictions apply near temple corridors." },
          commercial: { fsi: 2.00, authority: "TMC / TUDA", doc: "TUDA Master Plan", verified: "12 Feb 2026", notes: "Hospitality and commercial zones subject to clearance." }
        }
      }
    ]
  },
  {
    id: "arunachal_pradesh",
    name: "Arunachal Pradesh",
    bighaFactor: 27225.0,
    cities: [
      {
        id: "itanagar",
        name: "Itanagar",
        zones: {
          residential: { fsi: 1.50, authority: "IMC / UDHD", doc: "Arunachal Building Bye-Laws", verified: "05 Feb 2026", notes: "Hill slope stability and seismic zone V norms strictly enforced." },
          commercial: { fsi: 2.00, authority: "IMC / UDHD", doc: "Arunachal Building Bye-Laws", verified: "05 Feb 2026", notes: "Restricted building heights for commercial establishments." }
        }
      },
      {
        id: "naharlagun",
        name: "Naharlagun",
        zones: {
          residential: { fsi: 1.50, authority: "UDHD Arunachal", doc: "State Urban Development Rules", verified: "05 Feb 2026", notes: "Standard residential FAR for valley and hill terrain." },
          commercial: { fsi: 1.75, authority: "UDHD Arunachal", doc: "State Urban Development Rules", verified: "05 Feb 2026", notes: "Commercial nodes along NH-415." }
        }
      }
    ]
  },
  {
    id: "assam",
    name: "Assam",
    bighaFactor: 14400.0,
    cities: [
      {
        id: "guwahati",
        name: "Guwahati",
        zones: {
          residential: { fsi: 1.75, authority: "GMC / GMDA", doc: "Guwahati Master Plan 2025", verified: "22 Feb 2026", notes: "Base residential FSI; subject to road width >= 9m." },
          commercial: { fsi: 2.50, authority: "GMDA", doc: "Guwahati Building Bye-Laws", verified: "22 Feb 2026", notes: "GS Road and arterial commercial corridors allow up to 3.0 with premium." },
          mixed_use: { fsi: 2.25, authority: "GMDA", doc: "GMDA Master Plan", verified: "22 Feb 2026", notes: "Zonal mixed commercial-residential nodes." }
        }
      },
      {
        id: "dibrugarh",
        name: "Dibrugarh",
        zones: {
          residential: { fsi: 1.50, authority: "DMC / DDA", doc: "Assam Municipal Building Rules", verified: "10 Feb 2026", notes: "Flood-resilient plinth height requirements apply." },
          commercial: { fsi: 2.00, authority: "DMC", doc: "Assam Municipal Building Rules", verified: "10 Feb 2026", notes: "Market hub development index." }
        }
      },
      {
        id: "silchar",
        name: "Silchar",
        zones: {
          residential: { fsi: 1.50, authority: "SMC / UD Assam", doc: "State Building Regulations", verified: "14 Feb 2026", notes: "Residential plotted standard." },
          commercial: { fsi: 2.00, authority: "SMC", doc: "State Building Regulations", verified: "14 Feb 2026", notes: "Commercial retail nodes." }
        }
      }
    ]
  },
  {
    id: "bihar",
    name: "Bihar",
    bighaFactor: 27220.0,
    cities: [
      {
        id: "patna",
        name: "Patna",
        zones: {
          residential: { fsi: 2.00, authority: "PMC / PRDA", doc: "Bihar Building Bye-Laws 2021", verified: "01 Mar 2026", notes: "Applicable on roads of width 6m and above; higher on 12m+ roads." },
          commercial: { fsi: 2.50, authority: "PMC / PRDA", doc: "Bihar Building Bye-Laws 2021", verified: "01 Mar 2026", notes: "Commercial and office complexes on Bailey Road and Boring Road." },
          mixed_use: { fsi: 2.25, authority: "PMC", doc: "Patna Master Plan 2031", verified: "01 Mar 2026", notes: "Mixed use on designated transit corridors." }
        }
      },
      {
        id: "gaya",
        name: "Gaya",
        zones: {
          residential: { fsi: 1.75, authority: "GMC / UDHD Bihar", doc: "Bihar Building Bye-Laws", verified: "15 Feb 2026", notes: "Heritage conservation guidelines apply in Bodh Gaya zone." },
          commercial: { fsi: 2.25, authority: "GMC", doc: "Bihar Building Bye-Laws", verified: "15 Feb 2026", notes: "Commercial hospitality hubs." }
        }
      },
      {
        id: "muzaffarpur",
        name: "Muzaffarpur",
        zones: {
          residential: { fsi: 1.75, authority: "MMC", doc: "Bihar Building Bye-Laws", verified: "18 Feb 2026", notes: "Plotted residential development." },
          commercial: { fsi: 2.25, authority: "MMC", doc: "Bihar Building Bye-Laws", verified: "18 Feb 2026", notes: "Trade centers and wholesale markets." }
        }
      }
    ]
  },
  {
    id: "chhattisgarh",
    name: "Chhattisgarh",
    bighaFactor: 27225.0,
    cities: [
      {
        id: "raipur",
        name: "Raipur & Nava Raipur (Atal Nagar)",
        zones: {
          residential: { fsi: 1.50, authority: "RMC / NRDA", doc: "CG Bhumi Vikas Niyam / NRDA Master Plan", verified: "12 Feb 2026", notes: "Nava Raipur allows up to 2.50 for high-density smart sectors." },
          commercial: { fsi: 2.50, authority: "RMC / NRDA", doc: "NRDA Master Plan", verified: "12 Feb 2026", notes: "Central Business District and Sector 24 commercial zones." }
        }
      },
      {
        id: "bilaspur",
        name: "Bilaspur",
        zones: {
          residential: { fsi: 1.50, authority: "BMC / T&CP CG", doc: "CG Bhumi Vikas Niyam", verified: "10 Feb 2026", notes: "Standard municipal residential FAR." },
          commercial: { fsi: 2.00, authority: "BMC / T&CP CG", doc: "CG Bhumi Vikas Niyam", verified: "10 Feb 2026", notes: "Vyapar Vihar and Link Road commercial corridors." }
        }
      },
      {
        id: "durg_bhilai",
        name: "Durg - Bhilai",
        zones: {
          residential: { fsi: 1.50, authority: "BMC / Durg MC", doc: "CG Bhumi Vikas Niyam", verified: "10 Feb 2026", notes: "Steel township peripheral and municipal residential." },
          commercial: { fsi: 2.00, authority: "BMC", doc: "CG Bhumi Vikas Niyam", verified: "10 Feb 2026", notes: "Commercial center plazas." }
        }
      }
    ]
  },
  {
    id: "goa",
    name: "Goa",
    bighaFactor: 22500.0,
    cities: [
      {
        id: "panaji",
        name: "Panaji (North Goa)",
        zones: {
          residential: { fsi: 0.80, authority: "CCP / NGPDA / TCP Goa", doc: "Goa Land Dev & Building Regs", verified: "25 Feb 2026", notes: "CRZ constraints and heritage protection zone limit FAR; max 1.00 outside heritage." },
          commercial: { fsi: 1.50, authority: "CCP / NGPDA", doc: "Goa TCP Regulations", verified: "25 Feb 2026", notes: "CBD Patto Plaza and central market zones." }
        }
      },
      {
        id: "margao",
        name: "Margao (South Goa)",
        zones: {
          residential: { fsi: 1.00, authority: "MMC / SGPDA", doc: "Goa TCP Regulations", verified: "20 Feb 2026", notes: "South Goa planning authority residential limit." },
          commercial: { fsi: 1.50, authority: "MMC / SGPDA", doc: "Goa TCP Regulations", verified: "20 Feb 2026", notes: "Commercial town center." }
        }
      },
      {
        id: "vasco_da_gama",
        name: "Vasco da Gama",
        zones: {
          residential: { fsi: 1.00, authority: "MMC Goa", doc: "Goa TCP Regulations", verified: "20 Feb 2026", notes: "Port town residential zone." },
          commercial: { fsi: 1.50, authority: "MMC Goa", doc: "Goa TCP Regulations", verified: "20 Feb 2026", notes: "Commercial & logistics hub." }
        }
      }
    ]
  },
  {
    id: "gujarat",
    name: "Gujarat",
    bighaFactor: 17424.0,
    cities: [
      {
        id: "ahmedabad",
        name: "Ahmedabad",
        zones: {
          residential: { fsi: 1.80, authority: "AMC / AUDA", doc: "Comprehensive GDCR 2025", verified: "28 Feb 2026", notes: "Base FSI 1.8; Chargeable FSI up to 2.70. Transit (BRTS/Metro) corridor FSI up to 4.0." },
          commercial: { fsi: 2.70, authority: "AMC / AUDA", doc: "Comprehensive GDCR 2025", verified: "28 Feb 2026", notes: "SG Highway & Ashram Road high-density commercial allows FSI up to 4.0/5.4 with TDR." },
          mixed_use: { fsi: 3.00, authority: "AUDA", doc: "AUDA Master Plan", verified: "28 Feb 2026", notes: "Transit Oriented Development (TOD) zone." },
          industrial: { fsi: 1.50, authority: "GIDC / AUDA", doc: "GDCR Industrial", verified: "28 Feb 2026", notes: "Sanand & Changodar industrial belt." }
        }
      },
      {
        id: "surat",
        name: "Surat",
        zones: {
          residential: { fsi: 1.80, authority: "SMC / SUDA", doc: "Comprehensive GDCR", verified: "24 Feb 2026", notes: "Base residential FSI 1.8; premium purchasable up to 2.70." },
          commercial: { fsi: 2.70, authority: "SMC / SUDA", doc: "Comprehensive GDCR", verified: "24 Feb 2026", notes: "DREAM City & Ring Road commercial nodes." }
        }
      },
      {
        id: "vadodara",
        name: "Vadodara",
        zones: {
          residential: { fsi: 1.60, authority: "VMC / VUDA", doc: "Comprehensive GDCR", verified: "20 Feb 2026", notes: "Base residential FSI across urban limits." },
          commercial: { fsi: 2.40, authority: "VMC / VUDA", doc: "Comprehensive GDCR", verified: "20 Feb 2026", notes: "OP Road and central trade zone." }
        }
      },
      {
        id: "gandhinagar",
        name: "Gandhinagar (GIFT City)",
        zones: {
          residential: { fsi: 2.00, authority: "GMC / GUDA", doc: "GDCR / GIFT City Regulations", verified: "28 Feb 2026", notes: "GIFT City Special Zone allows high FAR up to 5.0+." },
          commercial: { fsi: 4.00, authority: "GIFT SEZ / GUDA", doc: "GIFT City Master Plan", verified: "28 Feb 2026", notes: "International Financial Services Centre high-rise towers." }
        }
      },
      {
        id: "rajkot",
        name: "Rajkot",
        zones: {
          residential: { fsi: 1.50, authority: "RMC / RUDA", doc: "Comprehensive GDCR", verified: "18 Feb 2026", notes: "Plotted and apartment residential." },
          commercial: { fsi: 2.25, authority: "RMC / RUDA", doc: "Comprehensive GDCR", verified: "18 Feb 2026", notes: "Kalawad Road commercial zone." }
        }
      }
    ]
  },
  {
    id: "haryana",
    name: "Haryana",
    bighaFactor: 9075.0,
    cities: [
      {
        id: "gurugram",
        name: "Gurugram (Gurgaon)",
        zones: {
          residential: { fsi: 1.75, authority: "GMDA / DTCP / MCG", doc: "Haryana Building Code 2017/2023", verified: "02 Mar 2026", notes: "Base FAR 1.75; purchasable FAR up to 2.64 for plotted residential (Stilt + 4 Floors)." },
          commercial: { fsi: 2.50, authority: "GMDA / DTCP", doc: "Haryana Building Code", verified: "02 Mar 2026", notes: "Golf Course Road, Cyber City, and SPR allow FAR up to 3.50+." },
          mixed_use: { fsi: 3.00, authority: "GMDA", doc: "Gurugram Master Plan 2031", verified: "02 Mar 2026", notes: "TOD corridor around Rapid Metro & Dwarka Expressway." }
        }
      },
      {
        id: "faridabad",
        name: "Faridabad",
        zones: {
          residential: { fsi: 1.75, authority: "FMDA / MCF", doc: "Haryana Building Code", verified: "25 Feb 2026", notes: "Base FAR 1.75; purchasable up to 2.64 on eligible roads." },
          commercial: { fsi: 2.25, authority: "FMDA / MCF", doc: "Haryana Building Code", verified: "25 Feb 2026", notes: "Mathura Road commercial belt." }
        }
      },
      {
        id: "panchkula",
        name: "Panchkula",
        zones: {
          residential: { fsi: 1.50, authority: "HSVP / MC Panchkula", doc: "Haryana Building Code", verified: "20 Feb 2026", notes: "Controlled development sectors adjoining Chandigarh." },
          commercial: { fsi: 2.00, authority: "HSVP", doc: "Haryana Building Code", verified: "20 Feb 2026", notes: "MDC & City Centre sectors." }
        }
      },
      {
        id: "panipat",
        name: "Panipat",
        zones: {
          residential: { fsi: 1.50, authority: "MC Panipat / HSVP", doc: "Haryana Building Code", verified: "15 Feb 2026", notes: "Textile industrial hub residential sectors." },
          commercial: { fsi: 2.00, authority: "MC Panipat", doc: "Haryana Building Code", verified: "15 Feb 2026", notes: "GT Road commercial plazas." }
        }
      }
    ]
  },
  {
    id: "himachal_pradesh",
    name: "Himachal Pradesh",
    bighaFactor: 8712.0,
    cities: [
      {
        id: "shimla",
        name: "Shimla",
        zones: {
          residential: { fsi: 1.50, authority: "SMC / TCP Himachal", doc: "Shimla Development Plan 2041", verified: "10 Feb 2026", notes: "Core & Heritage zones have building height caps of 2.5 storeys (max 10m)." },
          commercial: { fsi: 1.75, authority: "SMC / TCP Himachal", doc: "Shimla Development Plan 2041", verified: "10 Feb 2026", notes: "Mall Road green & core zones prohibit heavy commercial FAR." }
        }
      },
      {
        id: "dharamshala",
        name: "Dharamshala",
        zones: {
          residential: { fsi: 1.50, authority: "DMC / TCP Himachal", doc: "HP Town & Country Planning Rules", verified: "12 Feb 2026", notes: "Seismic Zone V guidelines and slope gradient limits." },
          commercial: { fsi: 1.75, authority: "DMC", doc: "HP TCP Rules", verified: "12 Feb 2026", notes: "Hospitality & tourism establishments." }
        }
      },
      {
        id: "solan",
        name: "Solan",
        zones: {
          residential: { fsi: 1.50, authority: "MC Solan / TCP", doc: "HP TCP Rules", verified: "12 Feb 2026", notes: "Valley & terraced plotted zones." },
          commercial: { fsi: 2.00, authority: "MC Solan", doc: "HP TCP Rules", verified: "12 Feb 2026", notes: "NH-5 commercial frontage." }
        }
      }
    ]
  },
  {
    id: "jharkhand",
    name: "Jharkhand",
    bighaFactor: 27225.0,
    cities: [
      {
        id: "ranchi",
        name: "Ranchi",
        zones: {
          residential: { fsi: 2.00, authority: "RMC / RRDA", doc: "Jharkhand Municipal Building Bye-Laws", verified: "18 Feb 2026", notes: "Road width 30ft+ permits 2.0 FSI; 20ft road permits 1.50." },
          commercial: { fsi: 2.50, authority: "RMC / RRDA", doc: "Jharkhand Building Bye-Laws", verified: "18 Feb 2026", notes: "Main Road and Kanke Road commercial zones." }
        }
      },
      {
        id: "jamshedpur",
        name: "Jamshedpur",
        zones: {
          residential: { fsi: 1.75, authority: "JNAC / Tata Steel Land Dept", doc: "Jamshedpur Building Regulations", verified: "15 Feb 2026", notes: "Sublease leasehold and municipal clearance requirements." },
          commercial: { fsi: 2.25, authority: "JNAC", doc: "Jamshedpur Building Regulations", verified: "15 Feb 2026", notes: "Bistupur and Sakchi commercial nodes." }
        }
      },
      {
        id: "dhanbad",
        name: "Dhanbad",
        zones: {
          residential: { fsi: 1.75, authority: "DMC", doc: "Jharkhand Building Bye-Laws", verified: "10 Feb 2026", notes: "Coal belt subsidence safety clearances mandatory." },
          commercial: { fsi: 2.25, authority: "DMC", doc: "Jharkhand Building Bye-Laws", verified: "10 Feb 2026", notes: "Bank More commercial trade hub." }
        }
      }
    ]
  },
  {
    id: "karnataka",
    name: "Karnataka",
    bighaFactor: 27225.0,
    cities: [
      {
        id: "bengaluru",
        name: "Bengaluru (Bangalore)",
        zones: {
          residential: { fsi: 1.75, authority: "BBMP / BDA", doc: "BBMP Building Bye-Laws / BDA Revised Master Plan", verified: "01 Mar 2026", notes: "Road width 9m to 12m: FSI 1.75; 12m to 18m: 2.25; 18m+: up to 3.25 with Premium FSI." },
          commercial: { fsi: 3.25, authority: "BBMP / BDA", doc: "BBMP Building Bye-Laws", verified: "01 Mar 2026", notes: "Outer Ring Road (ORR) and Whitefield commercial tech corridors." },
          mixed_use: { fsi: 2.75, authority: "BBMP", doc: "Master Plan 2031", verified: "01 Mar 2026", notes: "Metro corridor (within 500m of stations) incentive FSI up to 4.0." },
          industrial: { fsi: 1.50, authority: "KIADB / BBMP", doc: "KIADB Zoning Rules", verified: "01 Mar 2026", notes: "Electronics City and Peenya Industrial Estate." }
        }
      },
      {
        id: "mysuru",
        name: "Mysuru (Mysore)",
        zones: {
          residential: { fsi: 1.50, authority: "MCC / MUDA", doc: "Mysuru Master Plan 2031", verified: "20 Feb 2026", notes: "Palace heritage buffer zones enforce strict height restrictions (max 12m)." },
          commercial: { fsi: 2.25, authority: "MCC / MUDA", doc: "MUDA Master Plan", verified: "20 Feb 2026", notes: "Outer Ring Road commercial plots." }
        }
      },
      {
        id: "mangaluru",
        name: "Mangaluru (Mangalore)",
        zones: {
          residential: { fsi: 1.75, authority: "MCC / MUDA Mangalore", doc: "Mangaluru CDP 2021", verified: "18 Feb 2026", notes: "Coastal CRZ regulations apply within designated buffer lines." },
          commercial: { fsi: 2.50, authority: "MCC / MUDA Mangalore", doc: "Mangaluru CDP", verified: "18 Feb 2026", notes: "City center commercial zone." }
        }
      },
      {
        id: "hubballi_dharwad",
        name: "Hubballi - Dharwad",
        zones: {
          residential: { fsi: 1.50, authority: "HDMC / HDUDA", doc: "Comprehensive Development Plan", verified: "15 Feb 2026", notes: "Twin city residential standard." },
          commercial: { fsi: 2.25, authority: "HDMC / HDUDA", doc: "HDUDA Regulations", verified: "15 Feb 2026", notes: "BRTS corridor commercial frontages." }
        }
      },
      {
        id: "belagavi",
        name: "Belagavi (Belgaum)",
        zones: {
          residential: { fsi: 1.50, authority: "CCB / BUDA", doc: "Belagavi Master Plan", verified: "15 Feb 2026", notes: "Plotted residential zones." },
          commercial: { fsi: 2.00, authority: "CCB / BUDA", doc: "Belagavi Master Plan", verified: "15 Feb 2026", notes: "Commercial central market." }
        }
      }
    ]
  },
  {
    id: "kerala",
    name: "Kerala",
    bighaFactor: 27225.0,
    cities: [
      {
        id: "kochi",
        name: "Kochi (Cochin)",
        zones: {
          residential: { fsi: 2.00, authority: "KMC / GCDA", doc: "Kerala Municipality Building Rules (KMBR 2019)", verified: "28 Feb 2026", notes: "Base FSI 2.0; purchasable additional FAR up to 4.0 with prescribed fee." },
          commercial: { fsi: 2.50, authority: "KMC / GCDA", doc: "KMBR 2019", verified: "28 Feb 2026", notes: "MG Road & Marine Drive commercial up to 4.0 with CRZ clearance." },
          mixed_use: { fsi: 3.00, authority: "GCDA", doc: "Kochi Structural Plan", verified: "28 Feb 2026", notes: "Metro corridor TOD areas allow max FSI 4.0." }
        }
      },
      {
        id: "thiruvananthapuram",
        name: "Thiruvananthapuram (Trivandrum)",
        zones: {
          residential: { fsi: 2.00, authority: "TMC / TRIDA", doc: "KMBR 2019", verified: "25 Feb 2026", notes: "Technopark peripheral zones allow higher commercial-residential FAR." },
          commercial: { fsi: 2.50, authority: "TMC / TRIDA", doc: "KMBR 2019", verified: "25 Feb 2026", notes: "MG Road & bypass IT corridor." }
        }
      },
      {
        id: "kozhikode",
        name: "Kozhikode (Calicut)",
        zones: {
          residential: { fsi: 2.00, authority: "KMC Kerala", doc: "KMBR 2019", verified: "20 Feb 2026", notes: "Plotted and group housing." },
          commercial: { fsi: 2.50, authority: "KMC Kerala", doc: "KMBR 2019", verified: "20 Feb 2026", notes: "Mavoor Road trade centers." }
        }
      },
      {
        id: "thrissur",
        name: "Thrissur",
        zones: {
          residential: { fsi: 2.00, authority: "TMC Kerala", doc: "KMBR 2019", verified: "20 Feb 2026", notes: "Swaraj Round temple heritage height limitations." },
          commercial: { fsi: 2.50, authority: "TMC Kerala", doc: "KMBR 2019", verified: "20 Feb 2026", notes: "Commercial banking and retail center." }
        }
      }
    ]
  },
  {
    id: "madhya_pradesh",
    name: "Madhya Pradesh",
    bighaFactor: 13340.0,
    cities: [
      {
        id: "indore",
        name: "Indore",
        zones: {
          residential: { fsi: 1.50, authority: "IMC / IDA", doc: "MP Bhumi Vikas Niyam 2012 / 2024", verified: "01 Mar 2026", notes: "Base FSI 1.50; Super Corridor & AB Road permit FSI up to 2.50 with premium." },
          commercial: { fsi: 2.50, authority: "IMC / IDA", doc: "Indore Master Plan 2035", verified: "01 Mar 2026", notes: "Vijay Nagar and Ring Road commercial complexes." },
          mixed_use: { fsi: 2.25, authority: "IDA", doc: "Indore Master Plan", verified: "01 Mar 2026", notes: "High density commercial-residential mix." }
        }
      },
      {
        id: "bhopal",
        name: "Bhopal",
        zones: {
          residential: { fsi: 1.50, authority: "BMC / BDA", doc: "MP Bhumi Vikas Niyam", verified: "26 Feb 2026", notes: "Hoshangabad Road and Kolar residential corridors." },
          commercial: { fsi: 2.25, authority: "BMC / BDA", doc: "Bhopal Master Plan 2031", verified: "26 Feb 2026", notes: "MP Nagar commercial business center." }
        }
      },
      {
        id: "jabalpur",
        name: "Jabalpur",
        zones: {
          residential: { fsi: 1.50, authority: "JMC / JDA", doc: "MP Bhumi Vikas Niyam", verified: "20 Feb 2026", notes: "Standard municipal limits FAR." },
          commercial: { fsi: 2.00, authority: "JMC / JDA", doc: "MP Bhumi Vikas Niyam", verified: "20 Feb 2026", notes: "Civil Lines & Wright Town commercial." }
        }
      },
      {
        id: "gwalior",
        name: "Gwalior",
        zones: {
          residential: { fsi: 1.50, authority: "GMC / GDA", doc: "MP Bhumi Vikas Niyam", verified: "18 Feb 2026", notes: "Fort area ASI heritage protection limits." },
          commercial: { fsi: 2.00, authority: "GMC / GDA", doc: "MP Bhumi Vikas Niyam", verified: "18 Feb 2026", notes: "City Center commercial zone." }
        }
      },
      {
        id: "ujjain",
        name: "Ujjain",
        zones: {
          residential: { fsi: 1.25, authority: "UMC / UDA", doc: "Ujjain Master Plan", verified: "15 Feb 2026", notes: "Mahakal corridor heritage zone has strict height limits (max 10m)." },
          commercial: { fsi: 1.75, authority: "UMC / UDA", doc: "Ujjain Master Plan", verified: "15 Feb 2026", notes: "Commercial hospitality hubs outside core temple precinct." }
        }
      }
    ]
  },
  {
    id: "maharashtra",
    name: "Maharashtra",
    bighaFactor: 22500.0,
    cities: [
      {
        id: "mumbai",
        name: "Mumbai (MCGM)",
        zones: {
          residential: { fsi: 2.50, authority: "MCGM", doc: "DCPR 2034 (Regulation 30)", verified: "10 Mar 2026", notes: "Suburbs: Base 1.0 + 0.5 Premium + 1.0 TDR = 2.50. Island City base 1.33. Redevelopment (33(7)/33(9)) up to 4.05+." },
          commercial: { fsi: 3.00, authority: "MCGM", doc: "DCPR 2034", verified: "10 Mar 2026", notes: "BKC & Central Commercial nodes allow FSI up to 5.0 with MMRDA clearance." },
          mixed_use: { fsi: 3.00, authority: "MCGM", doc: "DCPR 2034", verified: "10 Mar 2026", notes: "Commercial & residential mix along Western & Eastern Express Highway." },
          industrial: { fsi: 1.50, authority: "MCGM / MIDC", doc: "DCPR 2034", verified: "10 Mar 2026", notes: "Service industries and IT parks permit IT FSI up to 3.0." }
        }
      },
      {
        id: "pune",
        name: "Pune (PMC & PCMC)",
        zones: {
          residential: { fsi: 1.10, authority: "PMC / PCMC", doc: "Maharashtra UDCPR 2020", verified: "01 Mar 2026", notes: "Base FSI 1.10; with Ancillary FSI (60%), Premium FSI (0.50), & TDR (0.60), total maximum FSI reaches 2.80+." },
          commercial: { fsi: 2.50, authority: "PMC / PCMC", doc: "Maharashtra UDCPR 2020", verified: "01 Mar 2026", notes: "Commercial zones on roads > 24m allow total potential FSI up to 4.0+." },
          mixed_use: { fsi: 2.20, authority: "PMC", doc: "Maharashtra UDCPR", verified: "01 Mar 2026", notes: "Kalyani Nagar, Baner, and Hinjewadi corridor." }
        }
      },
      {
        id: "nagpur",
        name: "Nagpur",
        zones: {
          residential: { fsi: 1.25, authority: "NMC / NIT", doc: "Maharashtra UDCPR", verified: "20 Feb 2026", notes: "Base FSI 1.25; total potential up to 2.50 with TDR & Premium." },
          commercial: { fsi: 2.50, authority: "NMC / NIT", doc: "Maharashtra UDCPR", verified: "20 Feb 2026", notes: "MIHAN SEZ and Wardha Road commercial strip." }
        }
      },
      {
        id: "nashik",
        name: "Nashik",
        zones: {
          residential: { fsi: 1.10, authority: "NMC Nashik", doc: "Maharashtra UDCPR", verified: "18 Feb 2026", notes: "Base 1.10; max potential 2.20 on 18m+ roads." },
          commercial: { fsi: 2.25, authority: "NMC Nashik", doc: "Maharashtra UDCPR", verified: "18 Feb 2026", notes: "College Road and Gangapur Road commercial plazas." }
        }
      },
      {
        id: "thane",
        name: "Thane",
        zones: {
          residential: { fsi: 1.50, authority: "TMC Thane", doc: "Maharashtra UDCPR / TMC Bye-Laws", verified: "25 Feb 2026", notes: "Base 1.50; Ghodbunder Road high-density towers allow up to 3.0+." },
          commercial: { fsi: 3.00, authority: "TMC Thane", doc: "Maharashtra UDCPR", verified: "25 Feb 2026", notes: "IT Parks and corporate hubs on Wagle Estate." }
        }
      },
      {
        id: "navi_mumbai",
        name: "Navi Mumbai",
        zones: {
          residential: { fsi: 1.50, authority: "NMMC / CIDCO", doc: "CIDCO GDCR / UDCPR", verified: "28 Feb 2026", notes: "Base 1.50; Transit Oriented Development along Palm Beach & Metro up to 3.0+." },
          commercial: { fsi: 3.00, authority: "NMMC / CIDCO", doc: "CIDCO GDCR", verified: "28 Feb 2026", notes: "Vashi and CBD Belapur commercial business hubs." }
        }
      },
      {
        id: "chhatrapati_sambhajinagar",
        name: "Chhatrapati Sambhajinagar (Aurangabad)",
        zones: {
          residential: { fsi: 1.10, authority: "ASMC / CIDCO", doc: "Maharashtra UDCPR", verified: "15 Feb 2026", notes: "Base 1.10; max 2.20 with TDR loading." },
          commercial: { fsi: 2.00, authority: "ASMC", doc: "Maharashtra UDCPR", verified: "15 Feb 2026", notes: "Jalna Road commercial strip." }
        }
      }
    ]
  },
  {
    id: "manipur",
    name: "Manipur",
    bighaFactor: 27225.0,
    cities: [
      {
        id: "imphal",
        name: "Imphal",
        zones: {
          residential: { fsi: 1.50, authority: "IMC / MAHUD", doc: "Manipur Building Bye-Laws", verified: "10 Feb 2026", notes: "Strict seismic safety norms; max height 15m without special clearance." },
          commercial: { fsi: 2.00, authority: "IMC", doc: "Manipur Building Bye-Laws", verified: "10 Feb 2026", notes: "Thangal & Paona Bazar commercial zone." }
        }
      }
    ]
  },
  {
    id: "meghalaya",
    name: "Meghalaya",
    bighaFactor: 27225.0,
    cities: [
      {
        id: "shillong",
        name: "Shillong",
        zones: {
          residential: { fsi: 1.50, authority: "SMB / MUDA", doc: "Meghalaya Building Bye-Laws 2021", verified: "12 Feb 2026", notes: "Hill slope stability and seismic zone V regulations cap height to G+3 storeys." },
          commercial: { fsi: 1.75, authority: "MUDA", doc: "Meghalaya Building Bye-Laws", verified: "12 Feb 2026", notes: "Police Bazar commercial density limit." }
        }
      }
    ]
  },
  {
    id: "mizoram",
    name: "Mizoram",
    bighaFactor: 27225.0,
    cities: [
      {
        id: "aizawl",
        name: "Aizawl",
        zones: {
          residential: { fsi: 1.50, authority: "AMC (Aizawl MC)", doc: "Aizawl Municipal Building Regs", verified: "10 Feb 2026", notes: "Steep hill terrain requires retaining wall & geotechnical structural clearance." },
          commercial: { fsi: 1.75, authority: "AMC", doc: "Aizawl Municipal Building Regs", verified: "10 Feb 2026", notes: "Bawngkawn & Zarkawt trade zones." }
        }
      }
    ]
  },
  {
    id: "nagaland",
    name: "Nagaland",
    bighaFactor: 27225.0,
    cities: [
      {
        id: "kohima",
        name: "Kohima",
        zones: {
          residential: { fsi: 1.50, authority: "KMC / UD Nagaland", doc: "Nagaland Building Bye-Laws", verified: "08 Feb 2026", notes: "Hill terrain soil conservation guidelines apply." },
          commercial: { fsi: 1.75, authority: "KMC", doc: "Nagaland Building Bye-Laws", verified: "08 Feb 2026", notes: "Main market business center." }
        }
      },
      {
        id: "dimapur",
        name: "Dimapur",
        zones: {
          residential: { fsi: 1.50, authority: "DMC Nagaland", doc: "Nagaland Building Bye-Laws", verified: "08 Feb 2026", notes: "Plain valley zone of Nagaland." },
          commercial: { fsi: 2.00, authority: "DMC Nagaland", doc: "Nagaland Building Bye-Laws", verified: "08 Feb 2026", notes: "Commercial hub of Nagaland." }
        }
      }
    ]
  },
  {
    id: "odisha",
    name: "Odisha",
    bighaFactor: 27225.0,
    cities: [
      {
        id: "bhubaneswar",
        name: "Bhubaneswar",
        zones: {
          residential: { fsi: 2.00, authority: "BDA / BMC", doc: "Odisha Planning & Building Standards (OPBSR 2020)", verified: "26 Feb 2026", notes: "Base FSI 2.0; purchasable FSI up to 3.0 on roads >= 12m wide." },
          commercial: { fsi: 2.75, authority: "BDA / BMC", doc: "OPBSR 2020", verified: "26 Feb 2026", notes: "Janpath & Infocity commercial IT corridor." },
          mixed_use: { fsi: 2.50, authority: "BDA", doc: "Bhubaneswar Master Plan 2030", verified: "26 Feb 2026", notes: "Smart City transit priority corridor." }
        }
      },
      {
        id: "cuttack",
        name: "Cuttack",
        zones: {
          residential: { fsi: 1.75, authority: "CDA / CMC", doc: "OPBSR 2020", verified: "20 Feb 2026", notes: "Heritage city dense plotted development." },
          commercial: { fsi: 2.25, authority: "CDA / CMC", doc: "OPBSR 2020", verified: "20 Feb 2026", notes: "Badambadi commercial transit hub." }
        }
      },
      {
        id: "rourkela",
        name: "Rourkela",
        zones: {
          residential: { fsi: 1.50, authority: "RDA / RMC", doc: "OPBSR 2020", verified: "15 Feb 2026", notes: "Steel city municipal standard." },
          commercial: { fsi: 2.00, authority: "RDA / RMC", doc: "OPBSR 2020", verified: "15 Feb 2026", notes: "Main Market commercial zone." }
        }
      },
      {
        id: "puri",
        name: "Puri",
        zones: {
          residential: { fsi: 1.50, authority: "PKDA / Puri MC", doc: "Puri Special Development Plan", verified: "15 Feb 2026", notes: "Jagannath Temple 75m security buffer & CRZ restrictions apply." },
          commercial: { fsi: 2.00, authority: "PKDA", doc: "Puri Coastal Master Plan", verified: "15 Feb 2026", notes: "VIP Road hospitality zone." }
        }
      }
    ]
  },
  {
    id: "punjab",
    name: "Punjab",
    bighaFactor: 9075.0,
    cities: [
      {
        id: "ludhiana",
        name: "Ludhiana",
        zones: {
          residential: { fsi: 1.75, authority: "MCL / GLADA", doc: "Punjab Municipal Building Bye-Laws 2018", verified: "24 Feb 2026", notes: "Base FAR 1.75; purchasable FAR up to 2.50 on wide roads." },
          commercial: { fsi: 2.50, authority: "MCL / GLADA", doc: "Punjab Building Bye-Laws", verified: "24 Feb 2026", notes: "Ferozepur Road commercial strip." }
        }
      },
      {
        id: "mohali",
        name: "Mohali (SAS Nagar)",
        zones: {
          residential: { fsi: 1.75, authority: "GMADA / MC Mohali", doc: "GMADA Master Plan 2031", verified: "28 Feb 2026", notes: "Plotted residential base 1.75; group housing allows up to 2.50." },
          commercial: { fsi: 2.75, authority: "GMADA", doc: "GMADA Master Plan", verified: "28 Feb 2026", notes: "Sector 62 City Centre & Airport Road commercial." },
          mixed_use: { fsi: 3.00, authority: "GMADA", doc: "GMADA Master Plan", verified: "28 Feb 2026", notes: "IT City & Aerocity commercial mixed nodes." }
        }
      },
      {
        id: "amritsar",
        name: "Amritsar",
        zones: {
          residential: { fsi: 1.50, authority: "MCA / ADA", doc: "Punjab Building Bye-Laws", verified: "20 Feb 2026", notes: "Walled city & Golden Temple corridor height cap (max 11m)." },
          commercial: { fsi: 2.25, authority: "MCA / ADA", doc: "Punjab Building Bye-Laws", verified: "20 Feb 2026", notes: "Ranjit Avenue & Mall Road commercial." }
        }
      },
      {
        id: "jalandhar",
        name: "Jalandhar",
        zones: {
          residential: { fsi: 1.50, authority: "MCJ / JDA", doc: "Punjab Building Bye-Laws", verified: "18 Feb 2026", notes: "Plotted residential sectors." },
          commercial: { fsi: 2.00, authority: "MCJ / JDA", doc: "Punjab Building Bye-Laws", verified: "18 Feb 2026", notes: "Model Town and GT Road commercial." }
        }
      }
    ]
  },
  {
    id: "rajasthan",
    name: "Rajasthan",
    bighaFactor: 27225.0,
    cities: [
      {
        id: "jaipur",
        name: "Jaipur",
        zones: {
          residential: { fsi: 1.80, authority: "JDA / JMC", doc: "Rajasthan Unified Building Regs (UBR 2020)", verified: "01 Mar 2026", notes: "Base FAR 1.80; Betterment/Premium FAR up to 2.40 on roads >= 18m." },
          commercial: { fsi: 2.50, authority: "JDA / JMC", doc: "UBR 2020", verified: "01 Mar 2026", notes: "Tonk Road, JLN Marg, and Sikar Road allow FAR up to 3.0+." },
          mixed_use: { fsi: 2.25, authority: "JDA", doc: "Jaipur Master Plan 2025", verified: "01 Mar 2026", notes: "Metro corridor TOD areas." }
        }
      },
      {
        id: "jodhpur",
        name: "Jodhpur",
        zones: {
          residential: { fsi: 1.50, authority: "JDA Jodhpur / JMC", doc: "Rajasthan UBR 2020", verified: "22 Feb 2026", notes: "Fort heritage view protection zone restricts height in walled city." },
          commercial: { fsi: 2.00, authority: "JDA Jodhpur", doc: "Rajasthan UBR 2020", verified: "22 Feb 2026", notes: "Paota and Shastri Nagar commercial." }
        }
      },
      {
        id: "udaipur",
        name: "Udaipur",
        zones: {
          residential: { fsi: 1.50, authority: "UIT Udaipur / UMC", doc: "Rajasthan UBR 2020", verified: "20 Feb 2026", notes: "Lake Pichola / Fateh Sagar buffer zone enforces 200m no-construction zone." },
          commercial: { fsi: 2.00, authority: "UIT Udaipur", doc: "Rajasthan UBR 2020", verified: "20 Feb 2026", notes: "Hospitality & resort development norms." }
        }
      },
      {
        id: "kota",
        name: "Kota",
        zones: {
          residential: { fsi: 1.50, authority: "KDA / KMC", doc: "Rajasthan UBR 2020", verified: "15 Feb 2026", notes: "Coaching institutional cluster residential hostels." },
          commercial: { fsi: 2.00, authority: "KDA / KMC", doc: "Rajasthan UBR 2020", verified: "15 Feb 2026", notes: "Aerodrome Circle & Jhalawar Road commercial." }
        }
      }
    ]
  },
  {
    id: "sikkim",
    name: "Sikkim",
    bighaFactor: 27225.0,
    cities: [
      {
        id: "gangtok",
        name: "Gangtok",
        zones: {
          residential: { fsi: 1.50, authority: "GMC / UDHD Sikkim", doc: "Sikkim Building Bye-Laws", verified: "10 Feb 2026", notes: "Hill slope stability and green terrace restrictions apply; max 5.5 storeys." },
          commercial: { fsi: 1.75, authority: "GMC / UDHD", doc: "Sikkim Building Bye-Laws", verified: "10 Feb 2026", notes: "MG Marg pedestrian plaza surroundings." }
        }
      }
    ]
  },
  {
    id: "tamil_nadu",
    name: "Tamil Nadu",
    bighaFactor: 27225.0,
    cities: [
      {
        id: "chennai",
        name: "Chennai",
        zones: {
          residential: { fsi: 2.00, authority: "CMDA / GCC", doc: "Tamil Nadu Combined Dev Rules (TNCDBR 2019/2024)", verified: "02 Mar 2026", notes: "Non-High Rise base FSI 2.0. High-Rise (road >= 18m): Premium FSI (up to 50%) allows max 3.25 to 3.50." },
          commercial: { fsi: 2.50, authority: "CMDA / GCC", doc: "TNCDBR 2019", verified: "02 Mar 2026", notes: "Anna Salai, OMR IT Expressway, and Mount Road commercial allow up to 3.50+." },
          mixed_use: { fsi: 2.50, authority: "CMDA", doc: "Chennai Master Plan 2026", verified: "02 Mar 2026", notes: "Designated commercial-residential corridors." },
          industrial: { fsi: 1.50, authority: "SIPCOT / CMDA", doc: "TNCDBR Industrial", verified: "02 Mar 2026", notes: "Sriperumbudur & Oragadam industrial corridors." }
        }
      },
      {
        id: "coimbatore",
        name: "Coimbatore",
        zones: {
          residential: { fsi: 1.75, authority: "CCMC / LPA Coimbatore", doc: "TNCDBR 2019", verified: "25 Feb 2026", notes: "Base FSI 1.75; purchasable premium FSI up to 2.50." },
          commercial: { fsi: 2.25, authority: "CCMC / LPA", doc: "TNCDBR 2019", verified: "25 Feb 2026", notes: "Avinashi Road & Trichy Road commercial corridors." }
        }
      },
      {
        id: "madurai",
        name: "Madurai",
        zones: {
          residential: { fsi: 1.50, authority: "MCC / LPA Madurai", doc: "TNCDBR 2019", verified: "20 Feb 2026", notes: "Meenakshi Amman Temple 1km radius has building height restrictions (max 9m)." },
          commercial: { fsi: 2.00, authority: "MCC / LPA", doc: "TNCDBR 2019", verified: "20 Feb 2026", notes: "Bypass Road and KK Nagar commercial." }
        }
      },
      {
        id: "tiruchirappalli",
        name: "Tiruchirappalli (Trichy)",
        zones: {
          residential: { fsi: 1.50, authority: "TCC / LPA Trichy", doc: "TNCDBR 2019", verified: "18 Feb 2026", notes: "Srirangam heritage precinct height restrictions apply." },
          commercial: { fsi: 2.00, authority: "TCC / LPA", doc: "TNCDBR 2019", verified: "18 Feb 2026", notes: "Thillai Nagar and Cantonment commercial." }
        }
      },
      {
        id: "salem",
        name: "Salem",
        zones: {
          residential: { fsi: 1.50, authority: "SCC / LPA Salem", doc: "TNCDBR 2019", verified: "15 Feb 2026", notes: "Plotted residential zones." },
          commercial: { fsi: 2.00, authority: "SCC / LPA", doc: "TNCDBR 2019", verified: "15 Feb 2026", notes: "Junction Main Road commercial." }
        }
      }
    ]
  },
  {
    id: "telangana",
    name: "Telangana",
    bighaFactor: 27225.0,
    cities: [
      {
        id: "hyderabad",
        name: "Hyderabad (GHMC & HMDA)",
        zones: {
          residential: { fsi: 2.50, authority: "GHMC / HMDA", doc: "Telangana Building Rules (GO 168 / TG-bPASS)", verified: "05 Mar 2026", notes: "Hyderabad has NO MAXIMUM FAR cap for plots on roads > 12m (setbacks & road width govern height)." },
          commercial: { fsi: 3.50, authority: "GHMC / HMDA", doc: "TG-bPASS Regulations", verified: "05 Mar 2026", notes: "HITEC City, Financial District, and Gachibowli allow high FAR (up to 5.0+)." },
          mixed_use: { fsi: 3.00, authority: "HMDA", doc: "Hyderabad Master Plan 2031", verified: "05 Mar 2026", notes: "Outer Ring Road (ORR) growth corridor allows flexible high-density FAR." },
          industrial: { fsi: 1.50, authority: "TSIIC / GHMC", doc: "Industrial Building Rules", verified: "05 Mar 2026", notes: "Genome Valley and Pharma City clusters." }
        }
      },
      {
        id: "warangal",
        name: "Warangal",
        zones: {
          residential: { fsi: 1.75, authority: "GWMC / KUDA", doc: "Telangana Building Rules (GO 168)", verified: "20 Feb 2026", notes: "Kakatiya Urban Development Authority standard." },
          commercial: { fsi: 2.50, authority: "GWMC / KUDA", doc: "KUDA Master Plan", verified: "20 Feb 2026", notes: "Hanamkonda-Kazipet commercial corridor." }
        }
      },
      {
        id: "nizamabad",
        name: "Nizamabad",
        zones: {
          residential: { fsi: 1.50, authority: "NMC / NUDA", doc: "Telangana Building Rules", verified: "15 Feb 2026", notes: "Plotted residential areas." },
          commercial: { fsi: 2.00, authority: "NMC", doc: "Telangana Building Rules", verified: "15 Feb 2026", notes: "Commercial central market." }
        }
      },
      {
        id: "karimnagar",
        name: "Karimnagar",
        zones: {
          residential: { fsi: 1.50, authority: "KMC / KUDA", doc: "Telangana Building Rules", verified: "15 Feb 2026", notes: "Municipal residential standards." },
          commercial: { fsi: 2.00, authority: "KMC", doc: "Telangana Building Rules", verified: "15 Feb 2026", notes: "Collectorate road commercial." }
        }
      }
    ]
  },
  {
    id: "tripura",
    name: "Tripura",
    bighaFactor: 14400.0,
    cities: [
      {
        id: "agartala",
        name: "Agartala",
        zones: {
          residential: { fsi: 1.50, authority: "AMC Tripura / UDHD", doc: "Tripura Building Rules 2017", verified: "10 Feb 2026", notes: "Seismic Zone V compliant RCC framework mandatory." },
          commercial: { fsi: 2.00, authority: "AMC Tripura", doc: "Tripura Building Rules", verified: "10 Feb 2026", notes: "Kaman Chowmuhani and Motor Stand commercial." }
        }
      }
    ]
  },
  {
    id: "uttar_pradesh",
    name: "Uttar Pradesh",
    bighaFactor: 27000.0,
    cities: [
      {
        id: "noida",
        name: "Noida",
        zones: {
          residential: { fsi: 1.80, authority: "NOIDA Authority", doc: "Noida Master Plan 2031", verified: "05 Mar 2026", notes: "Base FAR 1.80 for plotted; purchasable FAR up to 2.75. Group housing FAR up to 3.50 on expressways." },
          commercial: { fsi: 2.75, authority: "NOIDA Authority", doc: "Noida Master Plan 2031", verified: "05 Mar 2026", notes: "Sector 18, 62, and Sector 142 commercial tech zone allows FAR up to 4.0." },
          mixed_use: { fsi: 3.00, authority: "NOIDA Authority", doc: "Noida Master Plan", verified: "05 Mar 2026", notes: "Noida-Greater Noida Expressway mixed corridor." },
          industrial: { fsi: 1.50, authority: "NOIDA Authority", doc: "Noida Industrial Byelaws", verified: "05 Mar 2026", notes: "Phase 2 & IT/ITES sectors allow IT FAR up to 2.50." }
        }
      },
      {
        id: "greater_noida",
        name: "Greater Noida & Yamuna Expressway (YEIDA)",
        zones: {
          residential: { fsi: 2.00, authority: "GNIDA / YEIDA", doc: "Greater Noida Master Plan 2041", verified: "05 Mar 2026", notes: "Base FAR 2.00; purchasable FAR up to 2.75. Jewar Airport vicinity has specific AAI height limits." },
          commercial: { fsi: 3.00, authority: "GNIDA / YEIDA", doc: "GNIDA Master Plan", verified: "05 Mar 2026", notes: "Alpha/Pari Chowk commercial nodes & YEIDA Central CBD." }
        }
      },
      {
        id: "lucknow",
        name: "Lucknow",
        zones: {
          residential: { fsi: 1.75, authority: "LDA / LMC", doc: "UP Model Building Bye-Laws / Lucknow Master Plan", verified: "01 Mar 2026", notes: "Base FAR 1.75; purchasable FAR up to 2.50 on 18m+ roads." },
          commercial: { fsi: 2.50, authority: "LDA / LMC", doc: "Lucknow Master Plan 2031", verified: "01 Mar 2026", notes: "Gomti Nagar, Hazratganj, and Shaheed Path commercial zones." }
        }
      },
      {
        id: "kanpur",
        name: "Kanpur",
        zones: {
          residential: { fsi: 1.75, authority: "KDA / KMC", doc: "UP Building Bye-Laws", verified: "25 Feb 2026", notes: "Base FAR 1.75 in urban planned sectors." },
          commercial: { fsi: 2.25, authority: "KDA / KMC", doc: "Kanpur Master Plan 2031", verified: "25 Feb 2026", notes: "Mall Road & Civil Lines commercial." }
        }
      },
      {
        id: "varanasi",
        name: "Varanasi (Kashi)",
        zones: {
          residential: { fsi: 1.50, authority: "VDA / VNN", doc: "Varanasi Master Plan 2031", verified: "25 Feb 2026", notes: "Ghat buffer zone (200m) strictly prohibits new construction; height caps in old city." },
          commercial: { fsi: 2.00, authority: "VDA", doc: "Varanasi Master Plan", verified: "25 Feb 2026", notes: "Cantonment & Sigra commercial." }
        }
      },
      {
        id: "agra",
        name: "Agra",
        zones: {
          residential: { fsi: 1.50, authority: "ADA / AMC", doc: "Agra Master Plan / TTZ Regs", verified: "20 Feb 2026", notes: "Taj Trapezium Zone (TTZ) environmental & pollution norms strictly limit construction." },
          commercial: { fsi: 2.00, authority: "ADA", doc: "Agra Master Plan", verified: "20 Feb 2026", notes: "Fatehabad Road tourism-commercial strip." }
        }
      },
      {
        id: "ghaziabad",
        name: "Ghaziabad",
        zones: {
          residential: { fsi: 1.75, authority: "GDA / GMC", doc: "UP Building Bye-Laws", verified: "28 Feb 2026", notes: "Indirapuram & Raj Nagar Extension group housing FAR up to 2.50." },
          commercial: { fsi: 2.50, authority: "GDA / GMC", doc: "GDA Master Plan 2031", verified: "28 Feb 2026", notes: "NH-9 & Link Road commercial." }
        }
      },
      {
        id: "prayagraj",
        name: "Prayagraj (Allahabad)",
        zones: {
          residential: { fsi: 1.50, authority: "PDA / PMC", doc: "UP Building Bye-Laws", verified: "20 Feb 2026", notes: "Civil Lines plotted and apartment sectors." },
          commercial: { fsi: 2.00, authority: "PDA / PMC", doc: "Prayagraj Master Plan", verified: "20 Feb 2026", notes: "Civil Lines & Katra trade center." }
        }
      }
    ]
  },
  {
    id: "uttarakhand",
    name: "Uttarakhand",
    bighaFactor: 27000.0,
    cities: [
      {
        id: "dehradun",
        name: "Dehradun",
        zones: {
          residential: { fsi: 1.50, authority: "MDDA / DMC", doc: "Uttarakhand Building Bye-Laws 2020", verified: "24 Feb 2026", notes: "Doone Valley notification limits building heights (max 12m for residential; 15m special)." },
          commercial: { fsi: 2.00, authority: "MDDA", doc: "Dehradun Master Plan 2041", verified: "24 Feb 2026", notes: "Rajpur Road and Saharanpur Road commercial." }
        }
      },
      {
        id: "haridwar",
        name: "Haridwar & Roorkee",
        zones: {
          residential: { fsi: 1.50, authority: "HRDA", doc: "Uttarakhand Building Bye-Laws", verified: "20 Feb 2026", notes: "Ganga River buffer zone restricts construction within 200m of high flood line." },
          commercial: { fsi: 2.00, authority: "HRDA", doc: "Haridwar Master Plan", verified: "20 Feb 2026", notes: "Delhi-Haridwar Highway commercial." }
        }
      },
      {
        id: "haldwani",
        name: "Haldwani - Nainital",
        zones: {
          residential: { fsi: 1.50, authority: "UDA Haldwani / TCP", doc: "Uttarakhand Building Bye-Laws", verified: "18 Feb 2026", notes: "Foothill gateway urban zone; Nainital hill station strictly enforces zero new large FAR." },
          commercial: { fsi: 1.75, authority: "UDA Haldwani", doc: "Uttarakhand Building Bye-Laws", verified: "18 Feb 2026", notes: "Nainital Road commercial." }
        }
      },
      {
        id: "rishikesh",
        name: "Rishikesh",
        zones: {
          residential: { fsi: 1.50, authority: "MDDA Rishikesh", doc: "Uttarakhand Building Bye-Laws", verified: "18 Feb 2026", notes: "Eco-sensitive and spiritual heritage buffer." },
          commercial: { fsi: 1.75, authority: "MDDA Rishikesh", doc: "Uttarakhand Building Bye-Laws", verified: "18 Feb 2026", notes: "Tourism & yoga resort zones." }
        }
      }
    ]
  },
  {
    id: "west_bengal",
    name: "West Bengal",
    bighaFactor: 14400.0,
    cities: [
      {
        id: "kolkata",
        name: "Kolkata (KMC)",
        zones: {
          residential: { fsi: 2.00, authority: "KMC / KMDA", doc: "KMC Building Rules 2009 / 2023", verified: "02 Mar 2026", notes: "Base FSI depends on road width: 1.50 (<9m), 2.00 (9-15m), 2.50 (15-24m), 2.75 (>24m)." },
          commercial: { fsi: 2.75, authority: "KMC / KMDA", doc: "KMC Building Rules", verified: "02 Mar 2026", notes: "BBD Bagh, Park Street, and EM Bypass allow FAR up to 3.50 on wide roads." },
          mixed_use: { fsi: 2.50, authority: "KMDA", doc: "Kolkata Master Plan", verified: "02 Mar 2026", notes: "EM Bypass & Rajarhat New Town connectivity." }
        }
      },
      {
        id: "howrah",
        name: "Howrah",
        zones: {
          residential: { fsi: 1.75, authority: "HMC / KMDA", doc: "Howrah Municipal Building Rules", verified: "22 Feb 2026", notes: "Dense urban heritage fabric." },
          commercial: { fsi: 2.50, authority: "HMC / KMDA", doc: "Howrah Building Rules", verified: "22 Feb 2026", notes: "Kona Expressway commercial corridor." }
        }
      },
      {
        id: "siliguri",
        name: "Siliguri",
        zones: {
          residential: { fsi: 1.75, authority: "SMC / SJDA", doc: "WB Municipal Building Rules", verified: "20 Feb 2026", notes: "North Bengal transit trade hub." },
          commercial: { fsi: 2.50, authority: "SMC / SJDA", doc: "SJDA Master Plan", verified: "20 Feb 2026", notes: "Sevoke Road commercial corridor." }
        }
      },
      {
        id: "durgapur_asansol",
        name: "Durgapur - Asansol",
        zones: {
          residential: { fsi: 1.50, authority: "DMC / ADDA", doc: "ADDA Master Plan", verified: "18 Feb 2026", notes: "Industrial and residential planned sectors." },
          commercial: { fsi: 2.00, authority: "DMC / ADDA", doc: "ADDA Master Plan", verified: "18 Feb 2026", notes: "City Centre Durgapur commercial." }
        }
      }
    ]
  },
  {
    id: "delhi_nct",
    name: "Delhi (NCT)",
    bighaFactor: 27000.0,
    cities: [
      {
        id: "delhi",
        name: "Delhi (All Zones / MCD / DDA)",
        zones: {
          residential: { fsi: 2.00, authority: "DDA / MCD / NDMC", doc: "Master Plan for Delhi (MPD 2021 / MPD 2041)", verified: "05 Mar 2026", notes: "Plotted residential base FAR 2.00 to 3.50 (depending on plot size). Group housing FAR 2.00 (max 3.00 on 30m+ roads)." },
          commercial: { fsi: 3.50, authority: "DDA / NDMC", doc: "MPD 2021/2041", verified: "05 Mar 2026", notes: "Connaught Place, Nehru Place, and District Centres allow FAR 3.00 to 4.00." },
          mixed_use: { fsi: 3.00, authority: "DDA", doc: "MPD 2041 TOD Policy", verified: "05 Mar 2026", notes: "Transit Oriented Development around Metro nodes allows FAR up to 4.0." },
          industrial: { fsi: 1.50, authority: "DSIIDC / DDA", doc: "MPD 2021 Industrial", verified: "05 Mar 2026", notes: "Okhla, Mayapuri & Narela industrial sectors." }
        }
      },
      {
        id: "dwarka",
        name: "Dwarka Sub-City",
        zones: {
          residential: { fsi: 2.00, authority: "DDA", doc: "Dwarka Sub-City Master Plan", verified: "05 Mar 2026", notes: "Planned cooperative group housing sectors (FAR 2.00)." },
          commercial: { fsi: 3.00, authority: "DDA", doc: "Dwarka Sub-City Master Plan", verified: "05 Mar 2026", notes: "Sector 21 & IICC Dwarka commercial convention zones." }
        }
      },
      {
        id: "rohini",
        name: "Rohini Sub-City",
        zones: {
          residential: { fsi: 2.00, authority: "DDA / MCD", doc: "Rohini Sub-City Master Plan", verified: "05 Mar 2026", notes: "Plotted residential and group housing schemes." },
          commercial: { fsi: 2.50, authority: "DDA", doc: "Rohini Master Plan", verified: "05 Mar 2026", notes: "District Centre Sector 10 commercial." }
        }
      }
    ]
  },
  {
    id: "chandigarh_ut",
    name: "Chandigarh (UT)",
    bighaFactor: 9075.0,
    cities: [
      {
        id: "chandigarh",
        name: "Chandigarh",
        zones: {
          residential: { fsi: 1.50, authority: "Chandigarh Administration (Urban Planning)", doc: "Chandigarh Master Plan 2031 & Architectural Controls", verified: "01 Mar 2026", notes: "Le Corbusier heritage architectural controls strictly enforce building frame and height limits." },
          commercial: { fsi: 2.00, authority: "Chandigarh Administration", doc: "Chandigarh Master Plan 2031", verified: "01 Mar 2026", notes: "Sector 17 Central Commercial and Sector 35 / 22 markets." },
          industrial: { fsi: 1.25, authority: "Chandigarh Administration", doc: "Industrial Area Phase I & II Regs", verified: "01 Mar 2026", notes: "Industrial & IT Park conversion." }
        }
      }
    ]
  },
  {
    id: "jammu_kashmir",
    name: "Jammu & Kashmir (UT)",
    bighaFactor: 27225.0,
    cities: [
      {
        id: "srinagar",
        name: "Srinagar",
        zones: {
          residential: { fsi: 1.50, authority: "SDA / SMC", doc: "J&K Unified Building Bye-Laws 2021", verified: "18 Feb 2026", notes: "Dal Lake buffer zone & heritage areas have strict construction controls." },
          commercial: { fsi: 2.00, authority: "SDA / SMC", doc: "Srinagar Master Plan 2035", verified: "18 Feb 2026", notes: "Lal Chowk and Residency Road commercial." }
        }
      },
      {
        id: "jammu",
        name: "Jammu",
        zones: {
          residential: { fsi: 1.75, authority: "JDA / JMC", doc: "J&K Unified Building Bye-Laws", verified: "18 Feb 2026", notes: "Gandhi Nagar and Channi Himmat residential." },
          commercial: { fsi: 2.25, authority: "JDA / JMC", doc: "Jammu Master Plan 2032", verified: "18 Feb 2026", notes: "Bahu Plaza & Narwal commercial trade center." }
        }
      }
    ]
  },
  {
    id: "ladakh_ut",
    name: "Ladakh (UT)",
    bighaFactor: 27225.0,
    cities: [
      {
        id: "leh",
        name: "Leh",
        zones: {
          residential: { fsi: 1.25, authority: "LAHDC / Leh Municipal Committee", doc: "Ladakh Urban Development Regs", verified: "10 Feb 2026", notes: "Passive solar architecture and mud/stone vernacular protection guidelines." },
          commercial: { fsi: 1.50, authority: "LAHDC", doc: "Leh Master Plan", verified: "10 Feb 2026", notes: "Main Market & Airport Road tourism hotels." }
        }
      },
      {
        id: "kargil",
        name: "Kargil",
        zones: {
          residential: { fsi: 1.25, authority: "LAHDC Kargil", doc: "Ladakh Urban Development Regs", verified: "10 Feb 2026", notes: "Cold-climate building envelope standards." },
          commercial: { fsi: 1.50, authority: "LAHDC Kargil", doc: "Kargil Town Planning", verified: "10 Feb 2026", notes: "Suru valley commercial market." }
        }
      }
    ]
  },
  {
    id: "puducherry_ut",
    name: "Puducherry (UT)",
    bighaFactor: 27225.0,
    cities: [
      {
        id: "puducherry",
        name: "Puducherry (Pondicherry)",
        zones: {
          residential: { fsi: 1.80, authority: "PPA (Puducherry Planning Authority)", doc: "Puducherry Building Bye-Laws & Zoning Regs", verified: "20 Feb 2026", notes: "French Quarter (White Town) enforces heritage architectural elevations and height caps." },
          commercial: { fsi: 2.50, authority: "PPA", doc: "Puducherry Master Plan", verified: "20 Feb 2026", notes: "Jawaharlal Nehru Street commercial." }
        }
      }
    ]
  },
  {
    id: "dadra_daman_diu",
    name: "Dadra & Nagar Haveli and Daman & Diu (UT)",
    bighaFactor: 17424.0,
    cities: [
      {
        id: "daman",
        name: "Daman",
        zones: {
          residential: { fsi: 1.50, authority: "DMC / DDA Daman", doc: "DD Planning Regulations", verified: "15 Feb 2026", notes: "Coastal CRZ restrictions apply." },
          commercial: { fsi: 2.00, authority: "DMC", doc: "DD Planning Regulations", verified: "15 Feb 2026", notes: "Nani Daman commercial strip." }
        }
      },
      {
        id: "silvassa",
        name: "Silvassa",
        zones: {
          residential: { fsi: 1.50, authority: "SMC / DNH Planning Authority", doc: "DNH Town Planning Rules", verified: "15 Feb 2026", notes: "Industrial and residential mix." },
          commercial: { fsi: 2.00, authority: "SMC", doc: "DNH Town Planning Rules", verified: "15 Feb 2026", notes: "Central Silvassa market." }
        }
      }
    ]
  },
  {
    id: "andaman_nicobar",
    name: "Andaman & Nicobar Islands (UT)",
    bighaFactor: 27225.0,
    cities: [
      {
        id: "port_blair",
        name: "Port Blair",
        zones: {
          residential: { fsi: 1.25, authority: "PBMC", doc: "Port Blair Municipal Building Bye-Laws", verified: "12 Feb 2026", notes: "Island CRZ & seismic zone V strict limitations." },
          commercial: { fsi: 1.75, authority: "PBMC", doc: "Port Blair Master Plan", verified: "12 Feb 2026", notes: "Aberdeen Bazaar commercial center." }
        }
      }
    ]
  }
];
