import type { Tool } from './types';

export const utilityTools: Tool[] = [
  {
    id: 'AgeCalculator',
    slug: 'age-calculator',
    name: 'Age Calculator',
    category: 'datetime',
    metaTitle: 'Age Calculator – Exact Age, DOB, Birthday Countdown & Vedic Suite',
    shortDescription: 'Calculate your exact age in years, months, weeks, days, hours, and live seconds, compare age differences, and explore Vedic astrology.',
    metaDescription: 'Free online Age Calculator. Calculate your exact chronological age from Date of Birth (DOB) in years, months, weeks, days, hours, and live seconds. Features 2-person age comparison, upcoming birthday countdown, life milestones, and Vedic astrology & numerology.',
    keywords: [
      'Age Calculator',
      'Exact Age Calculator Online',
      'Calculate Age from Date of Birth',
      'DOB Calculator',
      'Age Calculator in Years Months Days',
      'Chronological Age Calculator',
      'How Old Am I Today',
      'Calculate My Age Online Free',
      'Age Difference Calculator',
      'Age Gap Calculator Between 2 People',
      'Age Calculator for Govt Exams',
      'Age Calculator for UPSC SSC IBPS Cut Off',
      'Birthday Countdown Calculator',
      'Next Birthday Day of Week Calculator',
      'Vedic Astrology Age Calculator',
      'Kundali Rashi Calculator by DOB',
      'Moolank and Bhagyank Numerology Calculator',
      'Planetary Age Calculator',
      'Life Milestones 10000 Days Alive',
      '1 Billion Seconds Milestone Calculator',
      'Half Birthday Calculator',
      'Age on Specific Date Calculator',
      'Retirement Age Calculator',
      'Date of Birth to Age Converter'
    ],
    icon: 'Calendar',
    howToUse: [
      'Select your Date of Birth (DOB) using the interactive year, month, and day calendar picker, with optional exact birth time for second-level precision.',
      'Specify the "Calculate Age On Date" field (defaults to today\'s current date, or choose any historical or future cut-off date for exams or admissions).',
      'Instantly view your exact chronological age in Years, Months, Days, and live ticking Seconds alongside cumulative lifetime metrics (total months, weeks, days, hours, minutes, seconds).',
      'Check your Next Birthday Countdown showing exact months, days, hours, and seconds remaining, along with your half-birthday and upcoming birthday weekday schedule.',
      'Switch to "Age Difference (2 People)" to compare two birth dates down to exact days, find who is older, and calculate your exact 2x Double-Age milestone date.',
      'Explore "Life Milestones & Timeline" to track monumental day achievements like 1,000, 5,000, 10,000, and 25,000 days on Earth, 1 Billion seconds alive, and jubilee birthdays.',
      'Open "Planetary Ages & Bio-Stats" to discover your orbital age across Mercury, Venus, Mars, Jupiter, Saturn, Uranus, and Neptune, alongside estimated cumulative heartbeats and breaths.',
      'Navigate to "Vedic Astrology & Numerology" to explore your Nirayana Sidereal Solar Rashi, ruling Graha lord, auspicious gemstone, Graha Beej Mantra with English transliteration, Moolank (Root Number), and Bhagyank (Destiny Number).'
    ],
    faqs: [
      {
        question: 'How does the Age Calculator compute exact years, months, and days?',
        answer: 'The calculator accounts for leap years (including February 29th) and the exact number of days in each calendar month (28, 29, 30, or 31). Rather than assuming a constant 30-day month or 365.25-day year, it borrows exact days from the preceding calendar month when calculating day differences, ensuring 100% mathematical precision.'
      },
      {
        question: 'How do I calculate my age on a specific cut-off date for government exams (UPSC, SSC, Banking)?',
        answer: 'To check eligibility for exams like UPSC Civil Services, SSC CGL, IBPS PO, NDA, CDS, or State PSCs, set the "Calculate Age On Date" field to the official cut-off date specified in the exam notification (e.g. "1st August 2026" or "1st January 2026"). The tool will instantly display your exact age on that date down to years, months, and days.'
      },
      {
        question: 'How does the Age Difference and Double-Age (2x) Milestone work?',
        answer: 'The Age Difference mode compares two birth dates down to exact years, months, and days. The double-age milestone calculates the exact historical or future date when the older person is or was precisely twice as old as the younger person (calculated as the younger person\'s birth date plus the exact difference between the two birth dates).'
      },
      {
        question: 'How does the calculator handle leap years and February 29th birthdays?',
        answer: 'Our mathematical algorithm accounts for standard 4-year leap rules and 400-year century exceptions. For individuals born on February 29th (leap day), the tool calculates their chronological age based on elapsed calendar days, with next birthday anniversaries landing on March 1st in non-leap years and February 29th in leap years.'
      },
      {
        question: 'What is the difference between Chronological Age and Biological Age?',
        answer: 'Chronological age is the exact calendar duration that has elapsed from your birth date to the present moment. Biological (or physiological) age refers to how old your cells, tissues, and organs are based on lifestyle, cardiovascular health, epigenetics, and biological wear-and-tear.'
      },
      {
        question: 'How does the calculator determine my Vedic Solar Rashi and Ruling Planet?',
        answer: 'The calculator uses the Nirayana Sidereal Zodiac system traditional to Indian Vedic Jyotish. Unlike the Western tropical system (which is fixed to the equinoxes), the Vedic system accounts for the astronomical precession of the Earth\'s axis (Ayanamsha, ~24° shift), determining your true celestial solar sign, ruling Graha lord, element, and auspicious gemstone.'
      },
      {
        question: 'What are Moolank and Bhagyank in Vedic Numerology and how are they calculated?',
        answer: 'In Vedic Numerology (Sankhya Shastra), Moolank (Root / Soul Number) is calculated by reducing your birth day to a single digit (e.g., born on the 28th = 2 + 8 = 10 = 1 + 0 = 1, ruled by the Sun). It represents your inborn psychology and instinctive temperament. Bhagyank (Destiny Number) is calculated by summing your full birth date (Day + Month + Year) to a single digit (1-9), representing your life path and karmic destiny.'
      },
      {
        question: 'What are Planetary Ages and how are they calculated?',
        answer: 'Planetary age calculates your age based on each planet\'s orbital period around the Sun. For instance, Mercury completes an orbit in ~87.97 Earth days (making you older in Mercury years), while Mars takes ~686.98 Earth days and Jupiter takes ~4,332.59 Earth days (11.86 Earth years). The tool computes your fractional age and remaining Earth days until your next planetary birthday.'
      },
      {
        question: 'What is a Half-Birthday and how is it determined?',
        answer: 'A half-birthday occurs exactly 6 calendar months after your actual date of birth. It is often celebrated for infants (6-month milestones), school children with summer birthdays, and milestone tracking.'
      },
      {
        question: 'How are total days, hours, and seconds alive calculated?',
        answer: 'The calculator computes the exact millisecond delta between your birth timestamp (including optional birth time) and the target timestamp: Total Days = Difference in ms / (1000 × 60 × 60 × 24); Total Hours = Difference in ms / (1000 × 60 × 60); Total Seconds = Difference in ms / 1000.'
      },
      {
        question: 'Is my birth date and personal data saved or sent to any server?',
        answer: 'No. All calculations are executed 100% locally in your web browser using client-side JavaScript. None of your inputs, dates, names, or personal details are ever uploaded, tracked, or stored on any server, guaranteeing complete privacy.'
      }
    ],
    sections: [
      {
        title: 'The Mathematics of Exact Chronological Age: Month-Borrowing & Calendar Drift',
        content: 'Calculating chronological age with mathematical precision is more complex than simple subtraction due to two fundamental calendar realities:\n1. **Variable Month Lengths**: Calendar months contain 28, 29, 30, or 31 days. When subtracting the birth day from the target calculation day, if the target day is smaller, days must be borrowed from the preceding calendar month using that specific month\'s exact length rather than an arbitrary 30-day average.\n2. **Leap Years & Gregorian Rules**: Every 4 years (except centuries not divisible by 400), February contains 29 days. Chronological age algorithms must accurately traverse leap years without accumulating fractional day drift.\n\nOur computational engine handles all edge cases, including end-of-month births (e.g. January 31st to February 28th), leap-year birthdays (February 29th), and time-zone boundaries with zero mathematical error.'
      },
      {
        title: 'Government Exam & Academic Admission Cut-Off Age Rules in India',
        content: 'Exact chronological age verification is a mandatory statutory requirement across major Indian competitive exams and administrative bodies:\n- **UPSC Civil Services (IAS/IPS/IFS)**: Minimum 21 years and maximum 32 years for General category, measured strictly as on **1st August** of the examination year.\n- **SSC CGL & CHSL**: Age criteria ranging from 18–27, 18–30, or 20–30 years, typically benchmarked against **1st January** or **1st August** cut-off dates.\n- **Banking (IBPS PO/Clerk, SBI PO)**: Age brackets (20–28 or 20–30 years) benchmarked to the notification month.\n- **Defence (NDA, CDS, AFCAT)**: Strict age windows calculated down to the exact day of birth without relaxation.\n- **School Admissions (RTE & State Norms)**: Pre-school, LKG, and Class 1 admissions enforce strict minimum ages (e.g., Class 1 minimum age of 6 years completed as of 31st March or 1st June).\n\nUse our "Calculate Age On Date" feature to verify eligibility against any official cut-off date with total confidence.'
      },
      {
        title: 'Step-by-Step Mathematical Formulas for Chronological Time Units',
        content: 'Given birth timestamp Tb and target timestamp Tt with difference Δt in milliseconds:\n- **Total Days**: `Floor(Δt / 86,400,000)`\n- **Total Weeks**: `Floor(Total Days / 7)`\n- **Total Months**: `(Years × 12) + Months`\n- **Total Hours**: `Floor(Δt / 3,600,000)`\n- **Total Minutes**: `Floor(Δt / 60,000)`\n- **Total Seconds**: `Floor(Δt / 1,000)`\n- **Next Birthday Countdown**: `Target Next Birthday - Current Timestamp`'
      },
      {
        title: 'The Science of Age Gaps & The 2x Double-Age Milestone',
        content: 'When comparing two individuals born at dates T0 (older) and T1 (younger), the age difference is constant: `D = T1 - T0`.\nAs time progresses, the relative ratio of their ages changes continuously. The **Double-Age (2x) Milestone** is the unique point in history when the older person is exactly twice as old as the younger person.\n- **Formula**: When the younger person reaches age `A`, the older person is age `A + D`. For the older person to be twice as old: `A + D = 2A` ⟹ `A = D`.\n- **Conclusion**: The double-age point occurs on the exact date `T1 + D` (the younger person\'s birth date plus the age difference). If that date is in the past, the milestone has already passed; if in the future, it marks an exciting upcoming life event.'
      },
      {
        title: 'Vedic Jyotish vs. Western Tropical Astrology: Nirayana Sidereal System Explained',
        content: 'Traditional Indian Vedic astrology (Jyotish Shastra) is based on the **Nirayana (Sidereal)** zodiac system, which calculates planetary positions relative to the observable, fixed cosmic constellations (Nakshatras). In contrast, Western astrology utilizes the **Sayana (Tropical)** system, which locks 0° Aries to the vernal equinox.\nDue to the **Precession of the Equinoxes (Ayanamsha)**, the tropical and sidereal systems drift by approximately 1 degree every 72 years (currently ~24° difference using the standard Lahiri Ayanamsha). As a result, your Vedic Sun Sign (Rashi) typically falls approximately 23 to 24 days earlier than your Western tropical zodiac sign.'
      },
      {
        title: 'Vedic Numerology (Sankhya Shastra): Moolank (Root) & Bhagyank (Destiny) Mechanics',
        content: 'Vedic Numerology categorizes cosmic vibrational numbers into two primary pillars:\n1. **Moolank (Root / Soul Number)**: The single-digit sum of your birth date (1 to 31). It reveals innate temperament, subconscious desires, mental strengths, and behavioral instincts.\n   - *Planetary Rulerships*: 1 (Surya/Sun), 2 (Chandra/Moon), 3 (Brihaspati/Jupiter), 4 (Rahu), 5 (Budh/Mercury), 6 (Shukra/Venus), 7 (Ketu), 8 (Shani/Saturn), 9 (Mangal/Mars).\n2. **Bhagyank (Destiny / Life Path Number)**: The single-digit sum of your entire date of birth (Day + Month + Year). It represents your life purpose, karmic opportunities, career culmination, and outer worldly success.'
      },
      {
        title: 'Planetary Mechanics: How Orbital Periods Define Your Age in the Solar System',
        content: 'A "year" is scientifically defined as the time taken for a celestial body to complete one full revolution around the Sun. Because orbital distances vary, your chronological age changes dramatically across the solar system:\n- **Mercury**: Orbital period of 87.97 Earth days (you age ~4.15× faster in Mercury years).\n- **Venus**: Orbital period of 224.7 Earth days (you age ~1.62× faster in Venus years).\n- **Mars**: Orbital period of 686.98 Earth days (a Mars year is ~1.88 Earth years).\n- **Jupiter**: Orbital period of 4,332.59 Earth days (~11.86 Earth years).\n- **Saturn**: Orbital period of 10,759.22 Earth days (~29.45 Earth years).\n- **Uranus**: Orbital period of 30,685.4 Earth days (~84.02 Earth years).\n- **Neptune**: Orbital period of 60,189.0 Earth days (~164.8 Earth years).'
      },
      {
        title: 'Life Milestones: 10,000 Days on Earth, 1 Billion Seconds, and Jubilee Celebrations',
        content: 'Life is rich with unique chronological markers beyond standard annual birthdays:\n- **1,000 Days**: Reached at approximately 2 years and 9 months of age.\n- **5,000 Days**: Reached at approximately 13 years and 8 months.\n- **10,000 Days**: Reached at approximately 27 years and 4 months (a major milestone of early adulthood).\n- **1 Billion Seconds Alive**: Reached at 31 years, 251 days, 7 hours, 46 minutes, and 40 seconds.\n- **20,000 Days**: Reached at approximately 54 years and 9 months.\n- **Silver Jubilee (25 Years), Golden Jubilee (50 Years), Diamond (60 Years), and Centenarian (100 Years)** celebrations.'
      }
    ]
  },
  {
    id: 'ExperienceCalculator',
    slug: 'experience-calculator',
    name: 'Experience Calculator',
    category: 'datetime',
    shortDescription: 'Compute your total professional work experience in years, months, and days.',
    metaDescription: 'Calculate exact total work experience between multiple joining and relieving dates. Perfect for creating resumes, job applications, and HR payroll calculations.',
    keywords: ['Work Experience Calculator', 'Job Experience Calculator', 'Resume builder tool', 'Calculate total experience', 'HR tool experience calculator'],
    icon: 'Briefcase',
    howToUse: [
      'Click "Add Employment Period" if you want to compute cumulative experience across multiple jobs.',
      'For each job period, input the Joining Date (Start) and Relieving Date (End). Check "Currently Working Here" for your active job.',
      'The calculator will sum all periods, accounting for standard calendar months, and output your total experience in Years, Months, and Days.'
    ],
    faqs: [
      {
        question: 'Does this calculator support overlapping job periods?',
        answer: 'This calculator sums the durations of each period independently. If your periods overlap, it will add them together rather than merging them, so it is best to enter non-overlapping career intervals.'
      },
      {
        question: 'How is a month defined in experience calculations?',
        answer: 'It calculates months based on standard calendar intervals between dates. If the days exceed the days in the current month, they are converted into a fractional month or added as remaining days.'
      }
    ],
    sections: [
      {
        title: 'Importance of Professional Work Experience Calculation',
        content: 'Accurate experience tracking is vital for several professional milestones:\n- **Resume Building**: Specifying exact experience (e.g., 5 Years, 8 Months) rather than rounding off values.\n- **HR Onboarding**: Human Resource departments use total experience to determine payroll brackets, seniority, and leave balances.\n- **Gratuity Eligibility**: In India, employees are eligible for Gratuity payouts after completing 5 years of continuous service.'
      },
      {
        title: 'How Cumulative Job Periods are Aggregated',
        content: 'The Experience Calculator sums individual start and end dates. Total days are compiled and divided into standardized months (assuming 30 days per month for remainders) and 12-month blocks are rolled over into full years.'
      }
    ]
  },
  {
    id: 'DateCalculator',
    slug: 'date-calculator',
    name: 'Date Calculator',
    category: 'datetime',
    shortDescription: 'Add or subtract years, months, weeks, and days from a given date.',
    metaDescription: 'Perform date calculations online. Add or subtract years, months, and days from any calendar date instantly, accounting for leap years.',
    keywords: ['Date Calculator', 'Add days to date', 'Subtract months from date', 'Date offset tool', 'Calendar math calculator'],
    icon: 'Calendar',
    howToUse: [
      'Select your Start Date using the calendar picker.',
      'Select the operation: "Add Time" or "Subtract Time".',
      'Enter the offsets for Years, Months, Weeks, and Days.',
      'Review the calculated Target Date, Day of the Year, and Leap Year status.'
    ],
    faqs: [
      {
        question: 'How does the Date Calculator handle leap years?',
        answer: 'The calculator uses JavaScript Date objects which automatically adjust for leap years (e.g. adding 1 year to February 28, 2024 results in February 28, 2025).'
      },
      {
        question: 'Can I add weeks and days together?',
        answer: 'Yes! The offsets are accumulated. Entering 1 week and 3 days is treated as adding or subtracting a total of 10 days.'
      }
    ],
    sections: [
      {
        title: 'The Mathematics of Date Offsets',
        content: 'Date addition and subtraction are essential for calculating invoice payment terms (e.g., Net 30), contract milestones, vaccine doses, project sprints, and legal notice timelines.'
      }
    ]
  },
  {
    id: 'CurrencyConverter',
    slug: 'currency-converter',
    name: 'Currency Converter',
    category: 'business',
    shortDescription: 'Convert values between major fiat currencies with live rates, historical trends, forex markups, and travel calculators.',
    metaTitle: 'Currency Converter – Live Exchange Rates & Money Planner',
    metaDescription: 'Convert global currencies with current live exchange rates. Compare rates, analyze historical trends, calculate forex markup fees, and plan travel budgets.',
    keywords: [
      'Currency Converter',
      'live exchange rates',
      'USD to INR',
      'GBP to INR',
      'EUR to INR',
      'AED to INR',
      'forex calculator',
      'money converter'
    ],
    icon: 'Globe',
    howToUse: [
      'Select standard converter, travel budget, forex markup, or salary converter tabs.',
      'Enter the target monetary amount.',
      'Select your starting currency and target currency.',
      'View converted values, reverse rates, historical charts, and provider fees.'
    ],
    faqs: [
      {
        question: 'What is the difference between interbank rates and provider rates?',
        answer: 'Interbank or mid-market rates are the real-time exchange rates at which banks trade currencies between themselves. Consumer providers (like banks, credit cards, or remittance services) usually add a markup or spread to this rate to make a profit.'
      },
      {
        question: 'Does the currency rate include bank markup fees?',
        answer: 'No, default currency exchange rates represent mid-market rates. To calculate actual expenses, use our Forex Markup tab to specify provider commissions, spreads, and fixed fees.'
      },
      {
        question: 'How often are exchange rates updated?',
        answer: 'Our live rates crawl and sync with global markets every few hours using multiple redundant API gateways. If offline, the tool automatically falls back to a safe static market snapshot.'
      },
      {
        question: 'What is a forex markup fee?',
        answer: 'Forex markup is the percentage difference between the rate a provider gives you and the actual mid-market exchange rate. It is a hidden fee added to conversion transactions.'
      },
      {
        question: 'Does this tool support cryptocurrency?',
        answer: 'No. This tool is focused strictly on global fiat currencies (USD, INR, EUR, etc.) to ensure precision, reliability, and clarity for standard travel and business use.'
      }
    ],
    sections: [
      {
        title: 'Understanding Exchange Rates',
        content: 'An exchange rate is the value of one nation\'s currency relative to another. These values fluctuate constantly based on global economic health, inflation, interest rates, trade balances, and geopolitical conditions. Conversions are calculated by multiplying your starting principal by the current conversion ratio.'
      },
      {
        title: 'The Role of Forex Markup Fees',
        content: 'When exchanging money at airports, paying with credit cards abroad, or sending international wire transfers, the effective rate you receive is rarely the mid-market rate. Providers add a markup (typically 1.5% to 5%) and fixed commissions. Understanding these rates allows you to pick cost-effective payment methods while traveling.'
      },
      {
        title: 'Cash vs Digital Currency Conversion',
        content: 'Converting cash physically at a teller counter is generally the most expensive conversion method due to operational overhead. Digital conversion via multi-currency cards or specialized remittance providers offers rates closer to the mid-market standard, saving substantial sums on larger transfers.'
      },
      {
        title: 'Cross-Border Salary & Budget Planning',
        content: 'For remote freelancers and global businesses, currency volatility is a primary risk. Planning salaries or budgets in a stable currency (like USD or EUR) and translating equivalents regularly helps hedge against sudden fluctuations in local currency values.'
      }
    ]
  },
  {
    id: 'UnitConverter',
    slug: 'unit-converter',
    name: 'Unit Converter',
    category: 'unit',
    shortDescription: 'Advanced Multi-Domain Unit Converter for Architecture, Civil, Electrical, Electronics, Metallurgy, and Indian Regional Land units.',
    metaTitle: 'Advanced Unit Converter – Engineering, Architecture, Civil, Electrical & Regional Units',
    metaDescription: 'Free online multi-domain Unit Converter. High-precision conversions for civil stress (MPa/psi), hydraulic cusec, lux lighting, U/R-values, AWG wire sizes, dBm, ASTM E140 hardness (HRC/HV), and Indian revenue land units.',
    keywords: [
      'Unit Converter',
      'Advanced Unit Converter',
      'Engineering unit converter',
      'Civil engineering unit converter',
      'Architecture scale converter',
      'Electrical unit converter',
      'Electronics unit converter',
      'Metallurgy hardness converter',
      'MPa to psi converter',
      'cusec to liters per second',
      'lux to foot candles',
      'AWG to mm2 converter',
      'HRC to HV hardness converter',
      'Bigha to acre converter',
      'Guntha to sq ft converter',
      'U-value to R-value converter',
      'dBm to Watts converter'
    ],
    icon: 'Ruler',
    howToUse: [
      'Select your Engineering Domain (General & Regional, Architecture, Civil, Electrical, Electronics, or Metallurgy).',
      'Choose the measurement dimension or use the smart AI search bar (e.g. "100 psi to mpa", "12 awg to mm2").',
      'Enter the numerical value and select the "From" and "To" units.',
      'Review the instant high-precision result, step-by-step formula derivation, and the complete live comparative matrix of all equivalent units below.',
      'Bookmark frequently used pairs or copy the full equivalent table with one click.'
    ],
    faqs: [
      {
        question: 'How do you convert MPa (Megapascal) to psi in structural engineering?',
        answer: '1 Megapascal (MPa) equals exactly 1 N/mm² or 145.038 pounds per square inch (psi). For example, standard M25 grade concrete with a characteristic compressive strength of 25 MPa equals approximately 3,625.95 psi (or 3.63 ksi).'
      },
      {
        question: 'What is a Cusec and how many Liters per second is 1 Cusec?',
        answer: 'A Cusec (cubic foot per second) is the standard irrigation and canal discharge unit in India. 1 Cusec = 28.3168 Liters/second = 101.94 m³/hour. A discharge of 100 cusecs equals 2,831.68 L/s.'
      },
      {
        question: 'How do you convert Lux to Foot-Candles for architectural lighting?',
        answer: '1 Foot-candle (fc) equals 10.7639 Lux (lx). To convert Lux to Foot-candles, divide the lux value by 10.764. For example, the NBC recommended office desk illuminance of 500 Lux corresponds to approximately 46.45 Foot-candles.'
      },
      {
        question: 'How does American Wire Gauge (AWG) relate to Metric mm² cross-sectional area?',
        answer: 'AWG is logarithmic: as the gauge number increases, the wire diameter and cross-sectional area decrease. For example, 16 AWG corresponds to ~1.31 mm², 14 AWG to ~2.08 mm², 12 AWG to ~3.31 mm², and 10 AWG to ~5.26 mm². In Indian domestic wiring (IS 694), standard 1.5 mm² wire falls between 16 AWG and 15 AWG.'
      },
      {
        question: 'How is Rockwell Hardness (HRC) converted to Vickers (HV) and Tensile Strength?',
        answer: 'Hardness conversions are empirical relationships standardized under ASTM E140 and ISO 18265 for non-austenitic steels. For example, 60 HRC corresponds to approximately 697 HV (Vickers) and ~2,000 MPa Ultimate Tensile Strength (UTS).'
      },
      {
        question: 'What is the difference between U-Value and R-Value in building envelope insulation?',
        answer: 'U-Value measures thermal transmittance (rate of heat transfer), while R-Value measures thermal resistance (insulating power). They are reciprocal: R = 1 / U. In SI units, an RSI of 1 m²·K/W equals a U-value of 1 W/m²·K. In Imperial units, R-10 equals an RSI of ~1.76 m²·K/W.'
      },
      {
        question: 'Why do Indian land measurement units like Bigha and Guntha vary by state?',
        answer: 'Land revenue records in India evolved under regional historical administrations. A standard Pucca Bigha in UP, Punjab, and Haryana equals 27,225 sq ft (3,025 sq yd = 20 Biswa), whereas a Bengal Bigha is 14,400 sq ft (20 Katha), and in Rajasthan it is typically 17,424 sq ft. In Maharashtra and Karnataka, 1 Guntha equals 1,089 sq ft (1/40th of an Acre).'
      }
    ],
    sections: [
      {
        title: 'Multi-Domain Engineering Unit Conversion Architecture',
        content: 'Modern engineering workflows demand precision cross-disciplinary calculations. Civil engineers frequently translate between SI megapascals (MPa) and imperial pounds per square inch (psi) when reviewing international design codes (IS 456 vs ACI 318). Electrical and MEP designers must calculate current carrying capacities across AWG and Metric mm² standards, while architects coordinate illuminance lux levels with HVAC envelope U-values and acoustic sound pressure decibels.'
      },
      {
        title: 'Civil & Structural Engineering Dimensions',
        content: 'Civil engineering modules support concrete compressive strength (M15 to M80 grades), structural loads (kN, kip, MN), distributed uniform line loads (kN/m, klf), bending moments (kN·m, kip·ft), bulk material unit weights (IS 875 Part 1), and hydraulic discharge rates (Cumec, Cusec, MLD, MGD) for water treatment plants and canal networks.'
      },
      {
        title: 'Architecture, Interior & Building Physics',
        content: 'Architectural tools include standard drafting scale multipliers (1:1 to 1:2500 and imperial scales like 1/4"=1\'), illuminance standards compliant with NBC 2016 and IS 3646, thermal insulation parameters (U-value, RSI, R-value, Tog, Clo for green building envelopes), acoustic sound pressure levels (dB SPL ref 20 µPa), and ramp slope gradients (1:12 universal access norms).'
      },
      {
        title: 'Electrical, Electronics & Metallurgy Standards',
        content: 'Specialized scientific dimensions cover real/apparent/reactive power (kW, kVA, kVAR), battery storage equivalents (Ah to Wh @ 3.7V/12V/48V), RF signal power (dBm, dBW, dBµV), RF frequency-to-wavelength (λ = c/f), ASTM E140 metal hardness scales (HRC, HRB, HV, HBW, UTS), linear thermal expansion (CTE), and sheet metal gauges (CRCA steel, GI, SS, and aluminium).'
      },
      {
        title: 'Indian Land Revenue & Regional Real Estate Units',
        content: 'Our land revenue engine incorporates state-specific variations for Bigha, Biswa, Biswansi, Kanal, Marla, Guntha, Ground, Cent, Ankanam, Katha, and Gaj, ensuring accurate legal property documentation and land area translation across Northern, Southern, Eastern, and Western Indian states.'
      }
    ]
  },
  {
    id: 'WordCounter',
    slug: 'word-counter',
    name: 'Word Counter',
    category: 'text',
    shortDescription: 'Count words, characters, sentences, readability scores, and estimate reading/speaking times in real-time.',
    metaDescription: 'Free online Word Counter & Writing Analytics tool. Check real-time word count, character count, Flesch readability grade, keyword density, and social media limits in your browser.',
    keywords: [
      'Word Counter online',
      'Character Counter with spaces',
      'Count words and sentences',
      'Reading time calculator',
      'Speaking time estimator',
      'Flesch Reading Ease calculator',
      'Keyword density analyzer',
      'Social media character counter',
      'Case converter online',
      'Writing goal tracker'
    ],
    icon: 'Type',
    howToUse: [
      'Type or paste your text into the editor canvas, or load a sample article (Blog Post, Essay, Social Post).',
      'Monitor real-time core metrics: word count, characters (with/without spaces), sentences, paragraphs, unique words, and lexical diversity.',
      'Explore the multi-tab intelligence panel to view Flesch Reading Ease & Grade Level, N-gram keyword density, and speaking time estimates.',
      'Track character limits across major platforms (X/Twitter, LinkedIn, Instagram, SEO meta tags) with live progress bars.',
      'Set custom word target goals (e.g. 500-word essay) to track your drafting progress in real-time.',
      'Use the one-click case transformation buttons (Title Case, UPPERCASE, camelCase, snake_case) and text cleaners.',
      'Copy your updated text or export a full writing analysis report with one click.'
    ],
    faqs: [
      {
        question: 'How are reading and speaking times estimated?',
        answer: 'Silent reading time is calculated using an average adult reading speed of 225 words per minute (WPM). Speaking/presentation time is estimated at 130 WPM (standard conversational pace), and handwriting time at 20 WPM.'
      },
      {
        question: 'What do the readability scores (Flesch Reading Ease and Grade Level) mean?',
        answer: 'Flesch Reading Ease scores content from 0 to 100, where higher scores (60-70+) indicate easy-to-read language. The Flesch-Kincaid Grade Level and Gunning Fog Index translate structural complexity (sentence length and multi-syllable words) into US school grade levels needed for comprehension.'
      },
      {
        question: 'How does the Keyword Density analyzer work?',
        answer: 'It extracts 1-word, 2-word (bi-grams), and 3-word (tri-grams) phrases, computes exact occurrence frequencies, and calculates keyword density percentages while allowing you to filter out common English stop words.'
      },
      {
        question: 'Is my written text uploaded or stored on any server?',
        answer: 'No. The entire analysis and case conversion pipeline runs 100% locally in your web browser. Your private essays, draft articles, and confidential notes never leave your computer.'
      },
      {
        question: 'Does this tool count spaces and punctuation accurately?',
        answer: 'Yes. It provides simultaneous counts for characters with spaces, characters without spaces, alphanumeric characters, syllables, lines, and paragraphs.'
      }
    ],
    sections: [
      {
        title: 'Mastering Content Length & Readability',
        content: 'Whether writing technical documentation, academic research papers, social media copy, or search-optimized meta descriptions, maintaining strict word counts and optimal readability scores is essential for maximizing reader engagement and search engine visibility.'
      },
      {
        title: '100% In-Browser Writing Intelligence',
        content: 'Unlike cloud writing assistants that transmit your keystrokes to third-party servers, Toolique calculates all statistics, readability formulas, and keyword matrices entirely in client-side memory with zero network requests.'
      }
    ]
  },
  {
    id: 'DiscountCalculator',
    slug: 'discount-calculator',
    name: 'Discount Calculator',
    category: 'business',
    shortDescription: 'Calculate the final price, savings, and tax allocations for discounted products.',
    metaDescription: 'Free online Discount Calculator. Estimate discount amounts, tax splits, and final billing prices instantly with slider inputs.',
    keywords: ['Discount Calculator', 'Calculate sales discount', 'Percentage off calculator', 'Final price calculator', 'Discount savings calculator'],
    icon: 'Briefcase',
    howToUse: [
      'Enter the original price of the product.',
      'Use the slider to select the discount rate (e.g. 20% OFF).',
      'Add an optional sales tax percentage (e.g. 18% GST).',
      'View the final discounted price, total discount savings, and tax splits.'
    ],
    faqs: [
      {
        question: 'How is the discount calculated with tax?',
        answer: 'The discount is applied first to the original price, and the sales tax is calculated on top of the discounted price.'
      },
      {
        question: 'Can I use this for retail shopping calculations?',
        answer: 'Yes, it is designed for rapid retail math, helping shoppers find out their exact savings and final bills.'
      }
    ],
    sections: [
      {
        title: 'Formula for Discount Calculations',
        content: 'Discount Amount = Original Price * (Discount Rate / 100)\nDiscounted Price = Original Price - Discount Amount\nFinal Price = Discounted Price * (1 + Tax Rate / 100)'
      }
    ]
  },
  {
    id: 'BMICalculator',
    slug: 'bmi-calculator',
    name: 'BMI Calculator',
    category: 'health',
    shortDescription: 'Clinical-grade Body Mass Index (BMI) calculator, WHO & Asian-Pacific classification, body fat estimator, and target weight calorie deficit planner.',
    metaDescription: 'Free online BMI Calculator & Body Composition Studio. Compute Body Mass Index under WHO Global & Asian-Pacific guidelines. Estimate body fat %, BMR, TDEE, ideal body weight (IBW), and safe calorie deficit plans.',
    keywords: [
      'BMI Calculator',
      'Body Mass Index calculator',
      'WHO BMI calculator',
      'Asian BMI cutoffs',
      'healthy weight range calculator',
      'body fat percentage estimator',
      'BMR and TDEE calculator',
      'calorie deficit target weight planner',
      'waist to height ratio WHtR',
      'ideal body weight Devine formula',
      'Ponderal Index calculator'
    ],
    icon: 'Heart',
    howToUse: [
      'Select your preferred measurement units: Metric (kg/cm) or Imperial (lbs/feet/inches).',
      'Choose the classification standard: WHO Global (Normal: 18.5–24.9) or WHO Asian-Pacific / ICMR (Normal: 18.5–22.9).',
      'Enter your biological sex, age, weight, height, and waist circumference.',
      'Explore the 4 specialized modes: Full Body Composition & BMR/TDEE, Target Weight Calorie Deficit Planner, Waist-to-Height Ratio (WHtR), or Height-Weight Reference Matrix.',
      'Copy the comprehensive clinical health report or download the data summary as a CSV file.'
    ],
    faqs: [
      {
        question: 'What is the difference between WHO Global and Asian-Pacific BMI cutoffs?',
        answer: 'The standard WHO Global cutoff defines Normal Weight as 18.5–24.9 kg/m² and Overweight as 25.0–29.9 kg/m². However, extensive epidemiological research (including WHO Western Pacific and Indian Council of Medical Research / ICMR studies) shows that Asian and South Asian populations accumulate higher visceral fat and face heightened risks of cardiovascular disease and Type 2 diabetes at lower BMI levels. Consequently, the Asian standard sets the Overweight threshold at 23.0 kg/m² and Obesity at 25.0 kg/m².'
      },
      {
        question: 'Why is BMI alone not always accurate for athletes and bodybuilders?',
        answer: 'BMI uses only total body mass and height (kg/m²), so it cannot distinguish between dense lean muscle tissue, bone mass, and adipose body fat. Highly conditioned athletes with high muscle mass frequently score in the "Overweight" or "Obese Class I" category despite having exceptionally low body fat percentages (e.g. 8–12%). In such cases, waist circumference and DEXA scans provide a more accurate evaluation.'
      },
      {
        question: 'What is BMI Prime and how is it interpreted?',
        answer: 'BMI Prime is the ratio of an individual\'s actual BMI to the upper limit of normal BMI (25.0 for WHO, 23.0 for Asian). A BMI Prime of exactly 1.0 represents the upper normal boundary. Values less than 0.74 indicate underweight, 0.74–1.00 indicate normal weight, 1.00–1.20 indicate overweight, and values above 1.20 indicate obesity.'
      },
      {
        question: 'What is the Waist-to-Height Ratio (WHtR) and why is it recommended alongside BMI?',
        answer: 'The Waist-to-Height Ratio (WHtR) measures central abdominal adiposity (visceral fat stored around vital organs). The universal Ashwell Shape Chart rule states that your waist circumference should be less than half your height (WHtR < 0.50). WHtR is often a superior predictor of cardiovascular disease and metabolic syndrome compared to BMI alone.'
      },
      {
        question: 'How does this calculator estimate Basal Metabolic Rate (BMR) and TDEE?',
        answer: 'This tool uses the scientifically validated Mifflin-St Jeor Equation to calculate your Basal Metabolic Rate (BMR) based on weight, height, age, and biological sex. Total Daily Energy Expenditure (TDEE) is then computed by multiplying BMR by your physical activity multiplier (1.2 for sedentary up to 1.9 for very active).'
      },
      {
        question: 'What is a safe weekly weight loss pace and calorie deficit?',
        answer: 'Clinical guidelines recommend a moderate, sustainable weight loss pace of 0.5 kg (1.1 lbs) per week, which corresponds to a daily caloric deficit of approximately 500–550 kcal below your maintenance TDEE (since 1 kg of body fat equates to ~7,700 kcal). Daily caloric intake should generally not drop below 1,200 kcal/day for women or 1,500 kcal/day for men without direct medical supervision.'
      }
    ],
    sections: [
      {
        title: 'Formulas for Body Composition and Anthropometric Sizing',
        content: '• Quetelet Body Mass Index (BMI): Weight (kg) / [Height (m)]²\n• Ponderal (Corpulence) Index: Weight (kg) / [Height (m)]³\n• Deurenberg Adult Body Fat %: (1.20 × BMI) + (0.23 × Age) - (10.8 × Sex) - 5.4\n• Mifflin-St Jeor BMR (Male): 10W + 6.25H - 5A + 5\n• Mifflin-St Jeor BMR (Female): 10W + 6.25H - 5A - 161'
      },
      {
        title: 'Ideal Body Weight (IBW) Benchmark Formulations',
        content: 'Clinical pharmacotherapy standards frequently utilize the Devine Equation for dosing hydrophilic medications: Men = 50 kg + 2.3 kg per inch over 5 feet; Women = 45.5 kg + 2.3 kg per inch over 5 feet.'
      }
    ]
  },
  {
    id: 'MileageCalculator',
    slug: 'mileage-calculator',
    name: 'Mileage Calculator',
    category: 'automobile',
    shortDescription: 'Calculate vehicle fuel efficiency (km/L, L/100km, MPG), trip fuel expenses, carpool splits, highway refueling stops, and multi-fuel comparison (Petrol vs Diesel vs CNG vs EV).',
    metaDescription: 'Free online Mileage Calculator & Fuel Cost Planner. Compute fuel economy across km/L, L/100km, and MPG. Compare Petrol, Diesel, CNG, and EV operating costs, plan road trip budgets, and track CO2 emissions.',
    keywords: [
      'Mileage Calculator',
      'Fuel efficiency calculator',
      'km per liter calculator',
      'MPG to km/l converter',
      'petrol vs diesel vs cng vs ev calculator',
      'road trip fuel cost calculator',
      'carpool cost split calculator',
      'vehicle running cost per km',
      'tank to tank mileage calculator',
      'CO2 emissions vehicle calculator'
    ],
    icon: 'Car',
    howToUse: [
      'Select your propulsion fuel type: Petrol, Diesel, CNG (kg), LPG, or Electric Vehicle (kWh).',
      'Enter your journey distance directly or use the Odometer Start/End mode for tank-to-tank precision.',
      'Input the fuel consumed and local fuel price per unit (₹, $, €, £).',
      'Add carpool passengers and toll/parking fees to compute total split budgets.',
      'Switch between the 4 modes: Trip Economy & Cost, Highway Range & Refueling Stops, Multi-Fuel Commute Comparison Matrix, or Green Emissions & Trees Offset.'
    ],
    faqs: [
      {
        question: 'What is the most accurate way to calculate real-world vehicle mileage?',
        answer: 'The tank-to-tank method is the gold standard: 1) Fill your fuel tank to full (auto-cut off) and reset your trip odometer to zero; 2) Drive your regular routine until the fuel gauge drops; 3) Refill the tank to full at the same fuel pump and note the exact liters filled and odometer distance. Formula: Mileage (km/L) = Odometer Distance (km) / Liters Refilled.'
      },
      {
        question: 'How do I convert between km/L, L/100km, US MPG, and UK Imperial MPG?',
        answer: '• To convert km/L to US MPG: Multiply km/L by 2.35215\n• To convert km/L to Imperial UK MPG: Multiply km/L by 2.82481\n• To convert km/L to L/100km: Divide 100 by (km/L)\n• Example: 15 km/L equals 35.28 US MPG, 42.37 UK MPG, and 6.67 L/100km.'
      },
      {
        question: 'How much does running the car Air Conditioning (AC) affect fuel economy?',
        answer: 'In modern combustion engine cars, running the air conditioner increases fuel consumption by approximately 8% to 15% in city traffic and about 4% to 8% at highway cruising speeds. On hot days in urban stop-and-go conditions, the AC compressor load can reduce overall mileage by up to 2.0–2.5 km/L.'
      },
      {
        question: 'What are the typical operating running costs per km across Petrol, Diesel, CNG, and EV in India?',
        answer: 'As of current average rates:\n• Electric Vehicle (EV): ₹1.00 – ₹1.50 per km (@ ₹8/kWh home grid)\n• CNG: ₹2.50 – ₹3.20 per km (@ ₹78/kg)\n• Diesel: ₹4.20 – ₹5.50 per km (@ ₹89/L)\n• Petrol: ₹5.80 – ₹7.50 per km (@ ₹102/L)\nEVs and CNG offer 65%–80% lower running costs for daily commuters.'
      },
      {
        question: 'Why does my vehicle mileage drop significantly during winter or short trips?',
        answer: 'Cold engine oil has higher viscosity, increasing mechanical friction until normal operating temperature (85°C–95°C) is reached. On trips shorter than 5 km, the engine runs in a "rich" fuel-air mixture mode for longer, consuming 20%–30% more fuel.'
      },
      {
        question: 'How much CO2 emissions does a passenger car generate per liter of fuel?',
        answer: 'Combusting 1 liter of Petrol produces approximately 2.31 kg of CO2, while 1 liter of Diesel produces 2.68 kg of CO2 due to higher carbon density. 1 kg of CNG emits about 2.75 kg of CO2. For an average commute of 15,000 km/year, a petrol car emits roughly 2.1 tonnes of CO2 annually.'
      }
    ],
    sections: [
      {
        title: 'Core Vehicle Mileage Formulas',
        content: '• Fuel Efficiency (km/L) = Total Distance (km) / Fuel Consumed (Liters)\n• Cost per km = Total Fuel Cost / Total Distance (km)\n• Fuel Required for Route = Target Distance (km) / Vehicle Mileage (km/L)\n• Total Trip Budget = Fuel Cost + Tolls + Parking'
      },
      {
        title: 'Proven Techniques to Maximize Fuel Efficiency',
        content: '1) Maintain optimal tyre pressure (+2 PSI above recommended for highway runs); 2) Cruise smoothly between 65–85 km/h in top gear; 3) Minimize excessive engine idling (>60 seconds); 4) Clear unnecessary heavy cargo from the boot to reduce vehicular payload.'
      }
    ]
  },
  {
    id: 'CarDepreciationCalculator',
    slug: 'car-depreciation-calculator',
    name: 'Car & Vehicle Depreciation Calculator',
    category: 'automobile',
    shortDescription: 'Calculate vehicle depreciation trajectories, 10-year resale values, used car market appraisals, and total cost of ownership (TCO).',
    metaTitle: 'Car Depreciation Calculator India: Resale Value, IRDAI IDV & Used Car Price',
    metaDescription: 'Free online Car Depreciation Calculator for India. Calculate used car resale value, IRDAI insurance IDV slabs, Income Tax WDV 15% rate & 10-year depreciation schedule for cars, bikes & EVs.',
    keywords: [
      'car depreciation calculator india',
      'car depreciation calculator',
      'used car depreciation calculator',
      'vehicle depreciation calculator irdai',
      'car idv value calculator',
      'car value after 5 years calculator india',
      'income tax wdv car depreciation rate',
      'depreciation rate of car as per companies act',
      'Vehicle Depreciation Calculator',
      'bike depreciation calculator',
      'motorcycle resale value calculator',
      'truck depreciation calculator',
      'commercial vehicle depreciation',
      'used car valuation calculator',
      'IRDAI vehicle depreciation schedule',
      'declining balance vehicle depreciation',
      'total cost of ownership TCO calculator',
      'EV battery depreciation calculator'
    ],
    icon: 'TrendingDown',
    howToUse: [
      'Select your Vehicle Category: Passenger Car, Two-Wheeler / Motorcycle / Scooter, Commercial Truck / LCV / HCV, Commercial Taxi / Fleet Cab, Auto Rickshaw (3-Wheeler), Delivery Van, or Electric Vehicle (EV).',
      'Pick a 1-click preset (e.g. Midsize SUV, Commuter Bike, Commercial LCV, Ola/Uber Taxi Cab, CNG Auto Rickshaw, or EV Fleet) or enter your original purchase price and currency (₹, $, €, £).',
      'Adjust vehicle age (0 to 15 years), odometer reading (km or miles), physical cosmetic condition (Flawless, Good, Fair, Poor), and number of previous owners.',
      'Select your depreciation calculation methodology: Standard Market Curve (IRDAI), Declining Balance Method (DBM), or Straight Line (SLM).',
      'Switch between the 4 dedicated analysis tabs: 10-Year Depreciation Trajectory Schedule, Fair Market Resale Evaluator (Private vs Dealer Trade-In), Total Cost of Ownership (TCO), or New vs 3-Year Certified Pre-Owned Comparison.',
      'Copy the itemized valuation audit report to clipboard or export a full 10-year CSV depreciation schedule with single-click actions.'
    ],
    faqs: [
      {
        question: 'How do depreciation rates differ across Cars, Bikes, Trucks, Taxis, and Auto Rickshaws?',
        answer: 'Depreciation rates vary significantly by vehicle utility and duty cycle: (1) Two-Wheelers / Motorcycles lose ~12%–15% annually due to strong utility resale demand; (2) Passenger Cars lose ~15%–18% annually; (3) Commercial Taxis / Ride-Hail Cabs lose ~22%–28% annually due to severe high-mileage wear (40,000–60,000 km/year); (4) Auto Rickshaws (3-Wheelers) lose ~18%–22% annually from stop-and-go city duty; and (5) Commercial Trucks / LCVs follow a steady 16%–20% curve with a high scrap metal salvage residual value.'
      },
      {
        question: 'What is the standard IRDAI depreciation schedule used for Motor Insurance IDV in India?',
        answer: 'The Insurance Regulatory and Development Authority of India (IRDAI) mandates the following Insured Declared Value (IDV) depreciation scale for all motor vehicles: Up to 6 months: 5%; 6 months to 1 year: 15%; 1 to 2 years: 20%; 2 to 3 years: 30%; 3 to 4 years: 40%; 4 to 5 years: 50%. For vehicles exceeding 5 years of age, IDV is mutually agreed upon based on surveyor inspection and chassis condition.'
      },
      {
        question: 'Why do Electric Vehicles (EVs) depreciate at a different trajectory than IC Engine vehicles?',
        answer: 'Electric Vehicles (EVs) experience higher initial depreciation (18%–22% annually) in their first 3 years due to rapid battery energy density improvements, price reductions on newer EV models, and buyer concerns regarding out-of-warranty battery replacement costs. However, lower routine maintenance and cheaper electricity running costs significantly reduce their operational TCO over time.'
      },
      {
        question: 'How does high mileage and multiple ownership affect fair market resale valuation?',
        answer: 'Standard passenger vehicles are benchmarked at 10,000–12,000 km/year (commercial vehicles at 40,000–60,000 km/year). Vehicles with odometer readings exceeding 40% above benchmark suffer an additional 7%–12% valuation penalty. Second ownership incurs an average 6% deduction, while 3+ owners reduce resale value by 14%–18% due to fragmented service accountability.'
      },
      {
        question: 'Why is buying a 3-year-old certified pre-owned vehicle considered the optimal "sweet spot"?',
        answer: 'A vehicle loses 35%–45% of its original showroom value in the first 36 months. From Year 3 to Year 7, the annual depreciation rate plateaus to just 6%–9% per year. Purchasing a 3-year-old certified vehicle lets you acquire modern mechanical reliability and features while shielding your capital from the steepest depreciation cliff.'
      },
      {
        "question": 'What is Total Cost of Ownership (TCO) and why is depreciation its largest expense?',
        "answer": 'Total Cost of Ownership (TCO) encapsulates all direct and hidden expenses of operating a vehicle: Purchase Depreciation + Fuel/Energy + Insurance Premiums + Periodic Maintenance/Tyres + Road Taxes/Financing. In the first 5 years of vehicle life, depreciation accounts for 40%–50% of the total monthly ownership drain.'
      },
      {
        "question": 'What is the depreciation rate of motor cars under the Indian Income Tax Act?',
        "answer": 'Under Section 32 of the Indian Income Tax Act, depreciation on motor cars is claimed on Written Down Value (WDV): (1) Motor cars used in a business other than running them on hire: 15% per annum; (2) Motor cars used in a business of running them on hire (taxis, tourist cabs, fleet aggregators): 30% per annum; (3) Commercial heavy vehicles (trucks, lorries, buses): 30% per annum. If an asset is purchased and put to use for less than 180 days in a financial year, only 50% of the annual rate is allowable.'
      }
    ],
    sections: [
      {
        title: 'Vehicle Depreciation Formulations & Mathematical Models',
        content: '• Declining Balance Method (DBM): Value(t) = P × (1 - r)^t, where P is original ex-showroom price, r is annual depreciation rate, and t is vehicle age in years.\n• Straight Line Method (SLM): Annual Depreciation = (P - Salvage Value) / Useful Life (years).\n• Sum-of-the-Years-Digits (SYD): Accelerated depreciation model allocating higher fractions to initial years.\n• Retained Equity Ratio = (Current Fair Market Value / Original Invoice Price) × 100%.'
      },
      {
        title: 'Proven Strategies to Maximize Resale Value Across Any Vehicle Type',
        content: '1) Maintain Complete Dealership Service Logs: An unbroken authorized service history increases buyer trust and commands a 5%–10% valuation premium.\n2) Prevent Exterior Paint & Body Degradation: Use covered parking or ceramic coating to protect paint from UV oxidation and rust.\n3) Replace Worn Wear-and-Tear Items Before Sale: Fresh tyres, new wiper blades, and a detailed interior cabin yield a high return on investment at resale.\n4) Preserve All Documentation: Retain original invoice, warranty cards, spare smart keys, valid PUC, and unencumbered NOC/RC.'
      }
    ]
  },
  {
    id: 'ProfitMarginCalculator',
    slug: 'profit-margin-calculator',
    name: 'Profit Margin Calculator',
    category: 'business',
    shortDescription: 'Calculate Gross Profit, Gross Margin, and Markup based on product costs and selling prices.',
    metaDescription: 'Free online Profit Margin Calculator. Estimate gross profit, margin percentages, and markups easily.',
    keywords: ['Profit Margin Calculator', 'Gross profit margin', 'calculate markup percentage', 'margin calculator online', 'sales profit estimator'],
    icon: 'TrendingUp',
    howToUse: [
      'Enter the unit buying cost (buying price).',
      'Enter the selling price or your target margin percentage.',
      'Review computed gross profit, margin ratio, and markup percentages.'
    ],
    faqs: [
      {
        question: 'What is the difference between margin and markup?',
        answer: 'Margin is calculated as profit divided by selling price. Markup is calculated as profit divided by cost price.'
      }
    ],
    sections: [
      {
        title: 'Importance of Margin Planning',
        content: 'Planning margins ensures operational overheads like shipping, storage, and transaction fees are fully covered before final net returns.'
      }
    ]
  },
  {
    id: 'BreakEvenCalculator',
    slug: 'break-even-calculator',
    name: 'Break-even Calculator',
    category: 'business',
    shortDescription: 'Evaluate operational costs and unit sales price to find your break-even volume.',
    metaDescription: 'Free online Break-even Calculator. Determine critical sales volumes and revenue totals required to cover overheads.',
    keywords: ['Break-even Calculator', 'break-even analysis', 'calculate BEP sales', 'contribution margin', 'pricing calculator'],
    icon: 'BarChart3',
    howToUse: [
      'Input your total fixed operating overheads (rent, salaries).',
      'Input the variable cost of producing a single unit.',
      'Input the selling price per unit to see the break-even parameters.'
    ],
    faqs: [
      {
        question: 'Why is contribution margin ratio important?',
        answer: 'It shows the percentage of sales revenue that goes toward covering fixed costs, helping you understand how scaling volume affects profit margins.'
      }
    ],
    sections: [
      {
        title: 'Understanding Fixed vs Variable Costs',
        content: 'Fixed costs remain constant regardless of sales volumes (e.g. office rent). Variable costs scale proportionally with the number of units produced (e.g. packaging).'
      }
    ]
  },
  {
    id: 'ROICalculator',
    slug: 'roi-calculator',
    name: 'ROI Calculator',
    category: 'business',
    shortDescription: 'Evaluate Return on Investment ratios and annualized compounding gains.',
    metaDescription: 'Free online ROI Calculator. Compute absolute profit gains, percentage returns, and annualized growth rates.',
    keywords: ['ROI Calculator', 'return on investment', 'calculate annualized ROI', 'compounding capital gains', 'investment yield'],
    icon: 'TrendingUp',
    howToUse: [
      'Enter the initial investment amount.',
      'Enter the final returned amount (ending value).',
      'Specify the holding duration in months or years to calculate annualized yields.'
    ],
    faqs: [
      {
        question: 'How is annualized ROI different from absolute ROI?',
        answer: 'Absolute ROI shows total gains from start to end, whereas annualized ROI adjusts returns to show geometric average compounding rates per year.'
      }
    ],
    sections: [
      {
        title: 'Analyzing Investment Efficiency',
        content: 'ROI allows businesses to compare the relative efficiency of different capital allocations (e.g., marketing campaigns vs new hardware purchases).'
      }
    ]
  },
  {
    id: 'InvoiceNumberGenerator',
    slug: 'invoice-number-generator',
    name: 'Invoice Number Generator',
    category: 'business',
    shortDescription: 'Generate customized sequential serial numbers for invoices and billing quotes.',
    metaDescription: 'Free online Invoice Number Generator. Customize prefixes, date stamps, and padded counters to build serial runs in bulk.',
    keywords: ['Invoice Number Generator', 'invoice serial builder', 'generate invoice sequence', 'billing counter tool', 'document number maker'],
    icon: 'Hash',
    howToUse: [
      'Input prefix codes (e.g. INV) and choose separators.',
      'Select date stamp inclusion formats and pad digit width.',
      'Set starting numbers and use the slider to generate lists.'
    ],
    faqs: [
      {
        question: 'Can I copy the generated sequence list?',
        answer: 'Yes, click "Copy List" to copy all generated invoice numbers separated by newlines.'
      }
    ],
    sections: [
      {
        title: 'Standardizing Billing Sequences',
        content: 'Unique, sequential numbering is vital for audit tracking, tax filings, and avoiding double billing in account registers.'
      }
    ]
  },
  {
    id: 'BarcodeGenerator',
    slug: 'barcode-generator',
    name: 'Barcode Generator',
    category: 'business',
    shortDescription: 'Generate custom high-resolution Code 128, Code 39, GS1 EAN-13, UPC-A, ITF-14, and QR barcodes. Export as PNG, SVG, JPEG, or print A4 sticker label sheets.',
    metaTitle: 'Free Barcode Generator Online – Code 128, EAN-13, UPC, Code 39 & Label Maker',
    metaDescription: 'Free online Barcode Generator & Label Maker. Create GS1 EAN-13, Code 128, UPC-A, Code 39, ITF-14, and QR barcodes. Customize bar colors, heights, headers & prices. Download vector SVG, PNG, or print Avery A4 / thermal sheets.',
    keywords: [
      'Barcode Generator',
      'Free Barcode Generator Online',
      'Code 128 Barcode Generator',
      'EAN 13 Barcode Generator India',
      'Code 39 Barcode Maker',
      'UPC Barcode Generator',
      'Bulk Barcode Generator',
      'Printable Barcode Label Sheet Maker',
      'GS1 Barcode Generator',
      'Thermal Shipping Barcode 4x6',
      'ITF 14 Carton Barcode',
      'Download Barcode PNG SVG',
      'SKU Barcode Generator',
      'Retail POS Barcode Generator'
    ],
    icon: 'Barcode',
    howToUse: [
      'Choose your desired barcode symbology: Code 128, Code 39, GS1 EAN-13, UPC-A, ITF-14, or QR Code.',
      'Enter your product SKU, serial number, or alphanumeric barcode data into the input field.',
      'Optionally click Auto-Calculate Checksum for EAN-13, UPC-A, and ITF-14 standard numbers.',
      'Customize bar height, bar width density, colors, quiet zones, product header, and retail MRP price footer.',
      'Download your high-resolution barcode as 300 DPI PNG, vector SVG, or JPEG, or copy directly to clipboard.',
      'Switch to Bulk Mode to batch generate up to 100 barcodes into a ZIP archive, or use Label Sheets to print standard A4 sticker layouts.'
    ],
    faqs: [
      {
        question: 'What is the difference between Code 128 and Code 39?',
        answer: 'Code 128 is a compact, modern high-density barcode that supports all 128 standard ASCII characters (numbers, uppercase/lowercase letters, and punctuation). Code 39 is an older industrial standard that only supports uppercase letters, digits, and a few symbols. For new projects, logistics, and warehousing, Code 128 is generally preferred due to its smaller physical footprint and higher scanning reliability.'
      },
      {
        question: 'What barcode format is used for retail products in India and worldwide?',
        answer: 'The international retail standard is EAN-13 (International Article Number). In India, official GS1-registered barcodes start with the 890 country prefix. For North America (US and Canada), the standard 12-digit UPC-A (Universal Product Code) is used. Both can be read by all standard modern retail point-of-sale (POS) barcode scanners.'
      },
      {
        question: 'How is the check digit calculated for EAN-13 and UPC-A barcodes?',
        answer: 'EAN-13 uses a Modulo-10 checksum algorithm. The first 12 digits are multiplied alternatively by 1 and 3, summed together, and the check digit is the number required to round up to the nearest multiple of 10. Our tool features an Auto-Calculate Checksum button that calculates and appends this digit automatically.'
      },
      {
        question: 'Can I generate barcodes in bulk from a list or CSV file?',
        answer: 'Yes. Switch to the "Bulk / Batch Generator" tab, paste your list of SKUs or upload a CSV/TXT file. The tool will render all barcodes concurrently and allow you to download all files bundled inside a single ZIP archive or export a multi-page printable PDF sheet.'
      },
      {
        question: 'What barcode format is required for Amazon FBA & FNSKU labels?',
        answer: 'Amazon FBA FNSKU (Fulfillment Network Stock Keeping Unit) barcode labels typically use standard Code 128 encoding. You can input your Amazon FNSKU code (e.g. X00...) into our Code 128 generator and print it directly onto standard 24-up or 30-up A4 address label sheets.'
      },
      {
        question: 'What is a barcode quiet zone, and why is it critical?',
        answer: 'The quiet zone is the clear, unprinted margin on the left and right sides of a barcode. Optical laser and CCD scanners require this empty margin (typically at least 10 times the width of the narrowest bar) to establish the start and stop boundaries of the code. Without sufficient quiet zones, scanners will fail to decode the barcode.'
      },
      {
        question: 'Can I print barcode labels on standard A4 sticker paper or thermal printers?',
        answer: 'Yes. Open the "Printable Label Sheets" tab to format your barcodes for standard A4 sticker sheets (24 labels, 14 labels, or 65 labels per page), 4" x 6" thermal shipping labels, or 2" x 1" product barcode roll stickers. You can print directly through your browser.'
      },
      {
        question: 'Can I download barcodes in vector SVG format for graphic design & packaging?',
        answer: 'Yes. You can export clean, lossless vector SVG files that can be imported directly into packaging design software such as Adobe Illustrator, CorelDRAW, InDesign, or Figma without any pixelation or loss of edge sharpness.'
      },
      {
        question: 'What is an ITF-14 barcode and when should it be used?',
        answer: 'ITF-14 (Interleaved 2 of 5, 14 digits) is the global GS1 standard for master shipping cartons and outer corrugated boxes. Its thick bars and bearer bars make it easily readable through shrink wrap and rough cardboard packaging from a distance.'
      },
      {
        question: 'Is this barcode generator free and secure?',
        answer: 'Yes. Toolique\'s Barcode Generator runs 100% on the client-side inside your web browser using HTML5 Canvas and SVG. No SKU numbers, proprietary product data, or barcodes are ever transmitted to or stored on our servers.'
      }
    ],
    sections: [
      {
        title: 'What is a Barcode and How Does It Work?',
        content: 'A barcode is a machine-readable optical representation of data. 1D (linear) barcodes represent alphanumeric characters through varying widths of parallel dark bars and light spaces. When an optical scanner or camera illuminates the barcode, a photodiode sensor measures the reflected light intensity, translating the pattern into electrical signals that decode the original numeric or character sequence into inventory software or POS registers.'
      },
      {
        title: 'Comparison of Major 1D & 2D Barcode Symbologies',
        content: 'Different industries rely on specialized barcode standards:\n- **Code 128**: Universal alphanumeric standard for logistics, shipping containers, and Amazon FNSKUs.\n- **Code 39**: Classic industrial and military barcode supporting uppercase letters, numbers, and basic symbols.\n- **EAN-13**: 13-digit GS1 standard for consumer retail products worldwide (prefix 890 for India).\n- **UPC-A**: 12-digit standard retail barcode used throughout North America.\n- **ITF-14**: 14-digit heavy-duty code printed on outer corrugated master cartons.\n- **QR Code**: 2D matrix symbology capable of storing URLs, contact details, payment links, and up to 7,089 characters.'
      },
      {
        title: 'GS1 India & Retail Product Barcode Architecture',
        content: 'GS1 is the international non-profit organization that manages global supply chain standards. In India, retail barcodes adhere to the EAN-13 architecture consisting of:\n1. **Country Prefix (3 Digits)**: 890 designates GS1 India.\n2. **Company Prefix (4 to 6 Digits)**: Unique identifier assigned to the brand or manufacturer.\n3. **Item Reference (3 to 5 Digits)**: Allocated by the manufacturer to identify individual product SKUs.\n4. **Check Digit (1 Digit)**: Calculated automatically using the Modulo-10 checksum formula to detect scan errors.'
      },
      {
        title: 'How to Calculate the Modulo-10 Checksum Digit',
        content: 'For an EAN-13 barcode with 12 initial digits d1 through d12:\n1. Multiply all odd-positioned digits (1st, 3rd, 5th, etc.) by 1.\n2. Multiply all even-positioned digits (2nd, 4th, 6th, etc.) by 3.\n3. Add all products together to find the Total Sum.\n4. Calculate the remainder when dividing the sum by 10 (Sum mod 10).\n5. If the remainder is 0, the check digit is 0. Otherwise, subtract the remainder from 10.\n\n*Example:* For 890103098765, the sum is 126. 126 mod 10 = 6. 10 - 6 = 4. The complete 13-digit EAN is **8901030987654**.'
      },
      {
        title: 'Barcode Label Design: Quiet Zones, Contrast & Resolution',
        content: 'To guarantee 100% first-pass scan success rates across retail checkout scanners and handheld warehouse guns:\n- **Quiet Zone Margin**: Maintain a blank margin of at least 10 times the width of a single narrow bar on both left and right ends.\n- **Color Contrast**: Always use high-contrast combinations. High-contrast dark black bars on a pure white or off-white background provide the highest optical reflectivity delta.\n- **Avoid Warm Bar Colors**: Barcode lasers emit red light (~650 nm). Never use red, orange, or yellow lines, as the red laser cannot distinguish warm inks from a white background.\n- **Bar Height**: Maintain adequate vertical height (at least 15% of the total barcode length) to allow omnidirectional and cross-swiping laser beams to cross the bars.'
      },
      {
        title: 'Thermal Printing vs Laser Printing for Barcode Stickers',
        content: 'When printing production barcode stickers:\n- **Direct Thermal Printers (203 / 300 DPI)**: Ideal for short-term shipping labels, logistics tags, and courier airbills. Heat-sensitive paper eliminates ink ribbons.\n- **Thermal Transfer Printers**: Uses resin or wax ribbons for durable, fade-resistant retail packaging stickers and chemical-resistant asset labels.\n- **Laser / Inkjet Printers on A4 Sticker Sheets**: Cost-effective for small batch runs, inventory cataloging, and office labeling using pre-cut 24-up or 65-up A4 adhesive label sheets.'
      },
      {
        title: 'Batch Barcode Generation for E-commerce & Warehousing',
        content: 'Modern e-commerce brands on Amazon, Flipkart, Shopify, and quick-commerce platforms (Blinkit, Zepto, Instamart) manage hundreds of product SKUs across size and color variants. Our Batch Generator enables warehouse managers and entrepreneurs to upload a CSV inventory manifest and generate high-resolution PNG barcode images in seconds, ready for automated cataloging and packaging production.'
      },
      {
        title: 'Troubleshooting Unscannable Barcodes',
        content: 'If your barcode scanner fails to read a printed label, verify the following common causes:\n1. **Insufficient Quiet Zone**: Ensure the barcode is not cropped too close to the edge of the label.\n2. **Low DPI / Pixelation**: Avoid scaling up low-resolution raster images. Use vector SVG or 300 DPI PNG exports.\n3. **Print Head Smudging**: Check thermal print heads for dust or burnt elements creating voids in the black bars.\n4. **Incorrect Aspect Ratio**: Ensure the barcode width and height were not disproportionately stretched in graphic editors.'
      }
    ]
  },
  {
    id: 'InventoryCalculator',
    slug: 'inventory-calculator',
    name: 'Inventory Calculator',
    category: 'business',
    shortDescription: 'Calculate Cost of Goods Sold (COGS), average inventory valuation, and turnover ratios.',
    metaDescription: 'Free online Inventory Calculator. Evaluate COGS, average inventory values, turnover ratios, and sell-through days.',
    keywords: ['Inventory Calculator', 'calculate COGS', 'inventory turnover ratio', 'average days to sell', 'inventory stock health'],
    icon: 'BarChart2',
    howToUse: [
      'Enter beginning inventory value at the start of your calculation window.',
      'Add the cost of new purchases made.',
      'Subtract ending inventory values to see turnover efficiency.'
    ],
    faqs: [
      {
        question: 'What does a high inventory turnover ratio indicate?',
        answer: 'A higher turnover ratio indicates strong sales velocity and efficient stock management, reducing carrying overheads.'
      }
    ],
    sections: [
      {
        title: 'Managing Inventory Carrying Costs',
        content: 'Holding stock too long ties up working capital and increases warehouse lease costs. Checking average days to sell aids replenishment schedules.'
      }
    ]
  },
  {
    id: 'GSTInvoiceGenerator',
    slug: 'gst-invoice-generator',
    name: 'GST Invoice Generator',
    category: 'business',
    shortDescription: 'Create and download PDF tax invoices with automated GST calculations and state supply choices.',
    metaDescription: 'Free online GST Invoice Generator. Auto-calculate CGST, SGST, and IGST components, and download A4 invoice PDFs.',
    keywords: ['GST Invoice Generator', 'create tax invoice PDF', 'calculate GST invoice', 'same state GST calculator', 'IGST invoice builder'],
    icon: 'FileSpreadsheet',
    howToUse: [
      'Fill in seller details and client details (GSTINs and addresses).',
      'Input invoice metadata, numbers, and specify state supply tax type.',
      'Add line items with quantity, unit rates, and GST percentage tiers, and click Download PDF.'
    ],
    faqs: [
      {
        question: 'Are invoices saved on any server?',
        answer: 'No. All details are processed client-side in browser memory. No data is stored, protecting client privacy.'
      }
    ],
    sections: [
      {
        title: 'Understanding Indian GST Invoice Rules',
        content: 'Same-state transactions must separate tax into CGST (Central) and SGST (State) equally. Inter-state transactions aggregate tax into IGST (Integrated).'
      }
    ]
  }
];
