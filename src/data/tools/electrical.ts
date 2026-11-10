import type { Tool } from './types';

export const electricalTools: Tool[] = [
  {
    id: 'VoltageDropCalculator',
    slug: 'voltage-drop-calculator',
    name: 'Voltage Drop Calculator',
    category: 'electrical',
    shortDescription: "Calculate voltage drop percentage, terminal receiving voltage, conductor impedance, power loss, and maximum distance for DC, 1-Phase, and 3-Phase AC circuits.",
    metaDescription: "Free online Voltage Drop Calculator (NEC 210.19, IS 732, BS 7671). Calculate line-to-line and line-to-neutral voltage drop, conductor loop impedance, receiving voltage, solar DC string loss, and motor starting dip.",
    keywords: [
      "voltage drop calculator",
      "calculate voltage drop",
      "single phase voltage drop calculator",
      "3 phase voltage drop formula",
      "dc voltage drop calculator solar",
      "cable voltage loss calculator",
      "nec voltage drop limits",
      "max cable distance voltage drop",
      "motor starting voltage dip calculator",
      "conductor power loss calculator"
    ],
    icon: 'Zap',
    howToUse: [
      "Select your analysis mode: Precision Voltage Drop Calculator, Maximum Distance Lab, Solar PV & DC Battery Feeder, Motor Starting Inrush Dip, or Power Loss & Carbon Waste.",
      "Choose electrical phase (1-Phase AC 230V/120V, 3-Phase AC 415V/480V, or DC Bus) and enter nominal supply voltage.",
      "Input continuous load current in Amps, conductor cross-section (mm² or AWG), and conductor material (Copper or Aluminum).",
      "Specify one-way route length (meters or feet), power factor (cos φ), operating temperature (20°C to 90°C), and cable raceway arrangement.",
      "Review voltage drop (Volts & %), receiving terminal voltage, transmission efficiency, active heat loss (Watts), and copy engineering report or export CSV."
    ],
    faqs: [
      {
        "question": "What are the standard regulatory limits for allowable voltage drop?",
        "answer": "Under National Electrical Code (NEC 210.19(A) & NEC 215.2(A)) and international standards (IS 732, BS 7671): Maximum allowable voltage drop is 3% for branch circuits supplying power to final utilization equipment, and 5% total combined across the entire feeder and branch circuit system. For solar PV string arrays and battery inverter feeds, a stricter limit of 1.0% to 1.5% is recommended to prevent energy yield loss."
      },
      {
        "question": "How do 1-Phase AC, 3-Phase AC, and DC voltage drop formulas differ?",
        "answer": "For DC circuits: ΔV = 2 × I × R (current travels through forward and return conductors). For 1-Phase AC: ΔV = 2 × I × (R cosφ + X sinφ) (accounting for resistance and inductive reactance). For 3-Phase balanced AC: ΔV = √3 × I × (R cosφ + X sinφ) (Line-to-Line voltage drop, where √3 ≈ 1.732 accounts for 120° phase separation)."
      },
      {
        "question": "Why does conductor operating temperature significantly affect voltage drop?",
        "answer": "Metallic conductors have a positive temperature coefficient of resistance (approx +0.393%/°C for copper and +0.403%/°C for aluminum). An XLPE cable operating at full load temperature of 90°C has approximately 27% higher electrical resistance than at 20°C ambient room temperature, directly increasing voltage drop and I²R heat dissipation."
      },
      {
        "question": "What is the effect of power factor (cos φ) on AC voltage drop?",
        "answer": "In AC circuits with magnetic or inductive equipment (motors, transformers, ballasts), total impedance consists of active resistance (R) and inductive reactance (X). A lower power factor (e.g. 0.70 vs 0.95) increases reactive current and expands the (R cosφ + X sinφ) term, producing significantly higher voltage drop for the same active kW workload."
      },
      {
        "question": "Why is voltage drop critical during motor starting (inrush transient)?",
        "answer": "Direct-On-Line (DOL) 3-phase induction motors draw 6.0× to 7.5× their full-load current (FLA) during startup. This surge causes a severe transient voltage drop along feeder cables. If the motor terminal voltage dips below 80% of nominal rating, electromagnetic contactors may chatter or drop out, and the motor may fail to develop sufficient breakaway torque and stall."
      },
      {
        "question": "How does voltage drop cause financial loss through active conductor heat dissipation?",
        "answer": "Every volt dropped across a cable represents active electrical energy dissipated as pure heat (P = n × I² × R Watts). In commercial and industrial facilities operating 24/7, high voltage drop wastes thousands of kilowatt-hours annually in electrical resistance heating, increasing utility power bills and grid carbon emissions."
      }
    ],
    sections: [
      {
        "title": "Mathematical Formulas for Electrical Voltage Drop",
        "content": "Line-to-Line Voltage Drop formulas: 1) DC 2-Wire: ΔV = 2 × I × R_total. 2) 1-Phase AC: ΔV = 2 × I × (R_total cosφ + X_total sinφ). 3) 3-Phase AC: ΔV = √3 × I × (R_total cosφ + X_total sinφ). Percentage Drop: ΔV% = (ΔV / V_source) × 100. Receiving End Terminal Voltage: V_receiving = V_source - ΔV."
      },
      {
        "title": "Conductor Temperature Correction & Reactance Values",
        "content": "Conductor resistance at operating temperature T: R_T = R_20 × [1 + α × (T - 20)], where α = 0.00393 / °C for Copper and α = 0.00403 / °C for Aluminum. Standard inductive reactance X_L at 50/60 Hz: 0.08 Ω/km for multi-core cables in conduit/trays, 0.09 Ω/km for single cores in trefoil, and 0.12 Ω/km for flat spaced runs."
      }
    ]
  },
  {
    id: 'CableSizeCalculator',
    slug: 'cable-size-calculator',
    name: 'Cable Size Calculator',
    category: 'electrical',
    shortDescription: "Determine the minimum required cable conductor size (mm² / AWG) based on load current, installation method, deratings, and voltage drop limits.",
    metaDescription: "Free online Electrical Cable Sizing Calculator (IEC 60364, IS 732, BS 7671, NEC). Calculate required conductor cross-section (mm² & AWG), derated ampacity, voltage drop, motor starting inrush, parallel runs, and conduit fill.",
    keywords: [
      "cable size calculator",
      "electrical wire sizing calculator",
      "cable sizing iec 60364",
      "voltage drop cable calculator",
      "motor feeder cable size calculator",
      "parallel cable sizer",
      "copper vs aluminum cable sizing",
      "conduit wire sizing calculator",
      "3 phase cable size calculator",
      "cable derating factor calculator"
    ],
    icon: 'Zap',
    howToUse: [
      "Select sizing mode: Standard Multi-Constraint Sizer, Voltage Drop & Distance Lab, Motor Feeder & Inrush, Parallel Multi-Runs, or Lifecycle Economics.",
      "Enter connected load (kW, Amps, HP, or kVA), system voltage (230V, 415V, etc.), phase type (1-Ph, 3-Ph, DC), and route distance in meters.",
      "Configure conductor metal (Copper or Aluminum), insulation type (XLPE 90°C, PVC 70°C, LSZH, EPR), and installation method (conduit, ladder tray, buried).",
      "Adjust environmental derating factors (ambient air temp, grouped circuits, soil thermal resistivity, short-circuit kA).",
      "Review the recommended conductor cross-section (mm² & AWG), voltage drop, conduit diameter (Ø mm), and copy engineering spec sheet or export CSV."
    ],
    faqs: [
      {
        "question": "What is the difference between Continuous Ampacity and Voltage Drop in cable sizing?",
        "answer": "Ampacity (Current-Carrying Capacity) is the maximum current a conductor can carry continuously without exceeding its thermal insulation temperature limits (e.g. 70°C for PVC, 90°C for XLPE). Voltage Drop is the decrease in electrical potential over long distances due to conductor resistance and reactance. For short runs (<20m), ampacity usually governs sizing; for long runs (>50m), voltage drop often forces you to select a larger conductor size than ampacity alone requires."
      },
      {
        "question": "How do XLPE and PVC cable insulations compare in current carrying capacity?",
        "answer": "XLPE (Cross-linked Polyethylene) insulation is rated for continuous operation up to 90°C and short-circuit temperatures up to 250°C, compared to PVC which is limited to 70°C continuous and 160°C short-circuit. Consequently, an XLPE insulated cable carries approximately 20% to 25% higher current than an identical size PVC cable, often allowing a smaller cross-section and reduced cable weight."
      },
      {
        "question": "What derating correction factors (k-factors) must be applied when sizing cables?",
        "answer": "Base cable ampacity tables are specified at 30°C in open air or 20°C in ground. Real installations require derating multipliers: k_temp (ambient temperature correction), k_group (grouping or bunching of adjacent loaded circuits), k_soil (soil thermal resistivity for buried cables), and k_depth (burial depth). The effective derated ampacity is Iz = I0 × k_temp × k_group × k_soil × k_depth, which must be greater than or equal to the design load current Ib."
      },
      {
        "question": "Why does a 3-Phase Induction Motor require cable oversizing (125% FLA rule)?",
        "answer": "According to NEC 430.22 and IS 325, branch-circuit conductors supplying a single continuous-duty motor must have an ampacity rating of not less than 125% of the motor Full-Load Amps (FLA). This safety margin accommodates continuous full-load operating heat, mechanical overload margins, and starting inrush cycles without insulation thermal degradation."
      },
      {
        "question": "When and why should parallel multi-run cables be installed instead of a single large cable?",
        "answer": "Single-conductor or multi-core cables larger than 240 mm² or 300 mm² become extremely stiff, heavy, difficult to bend through raceways, and costly to terminate. Running two or more smaller conductors in parallel per phase (e.g. 2 runs of 3.5C 185 mm² instead of 1 run of 400 mm²) improves current sharing, heat dissipation due to larger surface area, flexibility, and installation labor cost."
      },
      {
        "question": "What is the maximum allowable conduit fill percentage for electrical wires?",
        "answer": "According to NEC Chapter 9 Table 1 and IS 732, maximum conduit cross-sectional fill is limited to 53% for 1 conductor, 31% for 2 conductors, and 40% for 3 or more conductors. The remaining 60% free air space is mandatory to allow heat dissipation and prevent mechanical damage during pulling through bends."
      }
    ],
    sections: [
      {
        "title": "Cable Sizing Formulas & Electrical Principles",
        "content": "Conductor selection must satisfy three independent criteria: 1) Thermal Ampacity: Iz = I0 × k_total ≥ Ib (and Iz ≥ In for circuit breaker coordination). 2) Voltage Drop: ΔV = √3 × I × L × (R cosφ + X sinφ) for 3-phase circuits (ΔV% ≤ 3% to 5%). 3) Short-Circuit Thermal Stress: S_min = (I_sc × √t) / k."
      },
      {
        "title": "Copper vs Aluminum Conductor Selection",
        "content": "Copper has lower electrical resistivity (ρ20 ≈ 0.01724 Ω·mm²/m) and higher mechanical ductility, making it the preferred choice for residential wiring, control panels, and compact spaces. Aluminum (ρ20 ≈ 0.02826 Ω·mm²/m) is approximately 3 times lighter and substantially less expensive per meter, making it the industry standard for large utility distribution feeders, industrial bus ducts, and high-power transmission cables."
      }
    ]
  },
  {
    id: 'LoadCalculator',
    slug: 'load-calculator',
    name: 'Electrical Load Calculator',
    category: 'electrical',
    shortDescription: "Calculate connected load and estimated maximum demand currents for residential and commercial circuits.",
    metaDescription: "Free online Connected Load Calculator. Estimate maximum demand using NEC diversity factors for residential and industrial loads.",
    keywords: ["electrical load calculator","connected load calculator","maximum demand calculator","house load estimator","amps load calculator"],
    icon: 'Zap',
    howToUse: [
      "Add appliances or custom loads to the calculator.",
      "Specify quantities and individual watt ratings for each appliance.",
      "Configure system voltage, phase, and power factor parameters.",
      "Check the total connected load versus max demand output."
    ],
    faqs: [
      {
        "question": "What is the difference between connected load and maximum demand?",
        "answer": "Connected load is the sum of power ratings of all installed electrical appliances. Maximum demand is the actual peak load drawn at any given time, which is lower because not all appliances run concurrently (diversity factor)."
      }
    ],
    sections: [
      {
        "title": "Applying Diversity Factors to Electrical Design",
        "content": "Sizing an electrical service panels or generator for the full connected load is uneconomical. Electrical codes apply diversity factors (e.g. 60% for lighting, 50% for standard sockets) to estimate the realistic maximum demand, preventing oversized equipment."
      }
    ]
  },
  {
    id: 'PowerConsumptionCalculator',
    slug: 'power-consumption-calculator',
    name: 'Power Consumption Calculator',
    category: 'electrical',
    shortDescription: "Estimate energy consumption in kWh and monthly electricity costs for home or office appliances.",
    metaDescription: "Free online Power Consumption & Electricity Cost Calculator. Estimate daily, monthly, and yearly kWh units, calculate tiered telescopic slab utility bills, compare 5-star appliance ROI, and simulate rooftop solar PV sizing.",
    keywords: [
      "power consumption calculator",
      "electricity cost calculator",
      "kWh calculator online",
      "appliance wattage calculator",
      "energy bill estimator india",
      "bldc fan power savings calculator",
      "inverter ac power consumption",
      "solar rooftop sizing calculator",
      "electricity bill slab calculator",
      "carbon footprint electricity calculator"
    ],
    icon: 'Zap',
    howToUse: [
      "Select a whole-home preset (2BHK, 3BHK, WFH Studio) or add custom appliances from the 30+ device catalog.",
      "Adjust operating wattage, quantity, daily usage hours, and compressor duty cycle percentages.",
      "Configure your local utility tariff structure (telescopic progressive slab rates or flat per-unit rate) along with fixed meter charges and electricity taxes.",
      "Explore the 5-Star vs Old Device ROI Comparison tab to determine the exact annual financial payback period for energy-saving upgrades.",
      "Simulate rooftop solar PV sizing to calculate the required solar plant capacity (kWp) to offset your monthly grid bill."
    ],
    faqs: [
      {
        question: "What is 1 Unit of electricity and how is it calculated?",
        answer: "One unit of electricity is exactly equal to 1 Kilowatt-hour (kWh). It represents 1,000 Watts of electrical power consumed continuously over 1 hour. The formula is: Energy (kWh) = (Power in Watts × Operating Hours × Quantity) / 1,000."
      },
      {
        question: "What is a Duty Cycle and why is it important for ACs and refrigerators?",
        answer: "Compressor-driven appliances (like inverter air conditioners and refrigerators) do not draw their peak rated wattage constantly. Once the set thermostat temperature is reached, the compressor cycles off or throttles down to maintain temperature. A duty cycle of 60% means the compressor operates at full load for only 60% of the runtime, providing a far more accurate energy forecast."
      },
      {
        question: "How do progressive telescopic slab tariffs work in electricity billing?",
        answer: "Most electric utility boards (like MSEDCL, BESCOM, TANGEDCO, DERC) charge electricity consumption using progressive tiers (slabs). For example, the first 100 units might be billed at ₹4.50/unit, units 101–300 at ₹7.20/unit, and units above 300 at ₹9.80/unit. Higher consumption pushes usage into more expensive brackets."
      },
      {
        question: "How much money and electricity does a BLDC ceiling fan save compared to an induction fan?",
        answer: "A standard conventional induction ceiling fan consumes 75 Watts, whereas a modern BLDC (Brushless DC) motor fan consumes only 28 Watts at peak speed. Running for 12 hours daily, a BLDC fan saves ~206 kWh per year (~₹1,500 annually per fan), recovering its purchase premium within 18 to 24 months."
      },
      {
        question: "How do I calculate the solar rooftop plant capacity (kWp) needed for my house?",
        answer: "In tropical climates, a 1 kWp rooftop solar PV plant generates approximately 4.0 to 4.5 units (kWh) per day (120–135 units per month). To offset a 400-unit monthly electricity bill, you would need roughly a 3.0 to 3.5 kWp rooftop solar installation."
      },
      {
        question: "What is the carbon footprint of home electricity consumption?",
        answer: "On fossil-fuel-dominated national electrical grids (such as India and the US), generating 1 kWh of electricity releases approximately 0.82 kg of CO₂ equivalent emissions. Consuming 500 units/month generates ~4.92 Tonnes of CO₂ per year, requiring around 225 mature trees to sequester."
      }
    ],
    sections: [
      {
        title: "Energy Efficiency Best Practices & Appliance Duty Cycles",
        content: "High-wattage thermal heating and cooling loads (air conditioners, storage water geysers, space heaters, and induction hobs) account for 60% to 75% of residential electricity bills. Upgrading to Bureau of Energy Efficiency (BEE) 5-Star inverter appliances, utilizing programmable smart plugs, and cleaning AC filters regularly can reduce overall monthly consumption by 25% to 40%."
      },
      {
        title: "Understanding Grid Electricity Surcharges & Power Factors",
        content: "In addition to base per-unit energy charges, electricity utility bills include fixed meter charges, electricity duty (state taxes), and Fuel Price and Power Purchase Adjustment Surcharges (FPPPA/FCA). Monitoring connected load ensures you do not exceed sanctioned load limits, avoiding penalty demand charges."
      }
    ]
  },
  {
    id: 'UPSCalculator',
    slug: 'ups-calculator',
    name: 'UPS Capacity Calculator',
    category: 'electrical',
    shortDescription: "Calculate required commercial UPS capacity (VA/kVA), battery bank Ah rating, series-parallel string wiring, and generator pairing ratios.",
    metaDescription: "Free online UPS Capacity & Battery Sizing Calculator. Calculate required UPS rating in VA/kVA, battery bank Ah & kWh with Peukert compensation, series-parallel strings, DC breaker sizing, and data center rack cooling loads.",
    keywords: [
      "ups capacity calculator",
      "ups sizing calculator",
      "battery bank ah calculator for ups",
      "online double conversion ups sizing",
      "line interactive vs online ups",
      "ups battery string series parallel calculator",
      "data center server rack ups sizing",
      "ups generator sizing ratio",
      "va to watts ups calculation",
      "ups runtime calculation formula"
    ],
    icon: 'Zap',
    howToUse: [
      "Select your sizing module: Standard UPS & Battery Sizer, Server Rack / Data Center, Battery String Layout, Connected Load Aggregator, or Generator Pairing.",
      "Input total connected continuous load (Watts) and select your UPS topology (Offline, Line-Interactive AVR, or Online Double-Conversion).",
      "Specify desired runtime backup duration, safety headroom buffer (20%–30%), and battery chemistry (Tubular, AGM, GEL, NMC, or LiFePO4).",
      "Review commercial standard VA/kVA matching, exact battery capacity (Ah/kWh), series/parallel modular battery counts, DC cable gauge (mm²), and generator sizing."
    ],
    faqs: [
      {
        "question": "What is the difference between Watts (W) and Volt-Amperes (VA) in UPS sizing?",
        "answer": "Watts (W) measures true active power consumed and converted into real work or heat by equipment. Volt-Amperes (VA) measures apparent power, which is the product of RMS voltage and RMS current. The ratio between them is the Power Factor (PF = W / VA). For example, a 1000W server load with a 0.8 power factor requires a UPS capacity of at least 1000 / 0.8 = 1250 VA."
      },
      {
        "question": "Which UPS topology should I choose: Offline, Line-Interactive, or Online Double-Conversion?",
        "answer": "Offline/Standby UPS (4–10ms transfer) is suitable only for non-critical home desktop PCs and Wi-Fi routers. Line-Interactive with AVR (2–4ms transfer) is ideal for workstations, POS terminals, and small office network equipment. Online Double-Conversion (0ms transfer, continuous AC-DC-AC conversion) is essential for data center servers, medical diagnostic equipment, and sensitive industrial automation sensitive to harmonic distortion."
      },
      {
        "question": "Why does a backup generator need to be 1.5× to 2.0× larger than the UPS capacity?",
        "answer": "UPS rectifiers and chargers draw non-linear currents that create Total Harmonic Distortion (THD). Smaller or non-inverter generators struggle with frequency fluctuations when loaded with non-linear UPS rectifiers, causing the generator governor to hunt and the UPS to continuously reject generator power and cycle on battery. Sizing the generator at 1.5× to 2.0× the UPS capacity ensures stable frequency and voltage."
      },
      {
        "question": "How do series and parallel battery wiring strings work in UPS battery banks?",
        "answer": "Batteries connected in SERIES add voltages together while keeping Ah capacity unchanged (e.g., four 12V 100Ah batteries in series produce a 48V 100Ah bank). Batteries connected in PARALLEL add capacity together while maintaining voltage (e.g., two 48V 100Ah strings in parallel produce a 48V 200Ah bank). This calculator automatically computes exact series string counts and parallel string counts based on your DC bus voltage."
      },
      {
        "question": "How does Peukert's Law affect high-rate battery backup discharge in UPS systems?",
        "answer": "Peukert's Law demonstrates that discharging a lead-acid battery at high discharge rates (e.g. 15-minute to 30-minute full data center loads) significantly reduces its effective available capacity compared to standard 10-hour or 20-hour (C10/C20) test ratings. Modern LiFePO4 lithium batteries have a Peukert constant close to 1.02, delivering virtually 95%+ of their rated capacity even during rapid discharge."
      },
      {
        "question": "How do you calculate cooling (HVAC BTU / Tons AC) requirements for UPS and server racks?",
        "answer": "Every Watt of electrical energy consumed by enterprise IT hardware and UPS conversion losses is ultimately dissipated into the room as heat. Sizing rule: 1 Watt ≈ 3.41214 BTU/hr, and 1 Ton of refrigeration (TR) = 12,000 BTU/hr (approx. 3.517 kW of cooling capacity). For a 10 kW IT load room, at least 34,121 BTU/hr or approx. 2.85 to 3.5 Tons of HVAC capacity is recommended."
      }
    ],
    sections: [
      {
        "title": "UPS Capacity Sizing Formulas & Mathematics",
        "content": "To accurately size an Uninterruptible Power Supply: Minimum VA = Load Watts / (Power Factor × Inverter Efficiency). Recommended VA = Minimum VA × (1 + Headroom Buffer %). Battery Energy Required (Wh) = (Load Watts × Runtime Hours) / (Inverter Efficiency × Depth of Discharge × Wiring Efficiency). Battery Ah = Battery Wh / DC Bus Voltage."
      },
      {
        "title": "Redundancy Architecture (N, N+1, 2N)",
        "content": "In mission-critical enterprise data centers: N represents the exact baseline capacity needed. N+1 adds one redundant UPS module so maintenance or single module failure causes zero downtime. 2N (or 2N+1) implements two completely independent, mirrored power distribution paths from separate utility/generator feeds to dual-corded server power supplies."
      }
    ]
  },
  {
    id: 'SolarPanelCalculator',
    slug: 'solar-panel-calculator',
    name: 'Solar Panel Calculator',
    category: 'electrical',
    shortDescription: "Estimate required solar PV system capacity, panel counts, and roof space based on monthly bills or kWh consumption.",
    metaDescription: "Free online Solar Panel Calculator. Calculate solar PV system size (kW), required panels count, and roof area needed for home installation.",
    keywords: ["solar panel calculator","solar system sizing","pv array calculator","solar roof area space","solar power calculator"],
    icon: 'Zap',
    howToUse: [
      "Choose to input monthly unit consumption (kWh) or average bill amount.",
      "Configure local peak sun hours and target solar panel wattage.",
      "Adjust system efficiency losses based on your roof tilt and shade.",
      "Review system kW capacity, panel count, and roof space details."
    ],
    faqs: [
      {
        "question": "What are average peak sun hours?",
        "answer": "Peak sun hours represent the average daily solar irradiance equivalent to 1000W/m² of sun intensity. In India, peak sun hours typically range from 4.0 to 5.5 hours per day."
      }
    ],
    sections: [
      {
        "title": "Planning a Roof Solar Installation",
        "content": "When installing solar panels, ensure the roof has shadow-free space facing South (in the northern hemisphere) to maximize sun absorption. A standard 1kW rooftop solar system requires approximately 80 to 100 square feet of area."
      }
    ]
  },
  {
    id: 'BatteryBackupCalculator',
    slug: 'battery-backup-calculator',
    name: 'Battery Backup Calculator',
    category: 'electrical',
    shortDescription: "Calculate battery backup runtime hours or required Ah capacity for a given electrical load.",
    metaDescription: "Free online Battery Backup & Inverter Sizing Calculator. Calculate backup runtime hours, required Ah capacity with Peukert's law, inverter efficiency, solar recharging, and 10-year Lead-Acid vs LiFePO4 TCO.",
    keywords: [
      "battery backup calculator",
      "battery runtime calculator",
      "calculate battery ah for inverter",
      "peukert law calculator",
      "lifepo4 battery sizing",
      "ups battery backup time calculator",
      "tubular battery backup duration",
      "solar battery bank sizing",
      "battery discharge rate calculator",
      "home inverter battery calculator"
    ],
    icon: 'Zap',
    howToUse: [
      "Choose your preferred mode: Runtime Estimator (given battery & load) or Target Ah Sizer (given required backup hours).",
      "Input your continuous running electrical load in Watts or aggregate multiple appliances in the Load Builder tab.",
      "Select your battery chemistry (Tubular Lead-Acid, AGM, GEL, Lithium-Ion NMC, LiFePO4, or Sodium-Ion) to auto-apply realistic Depth of Discharge (DoD) and Peukert constants.",
      "Configure the DC Bus Voltage (12V, 24V, 48V) and inverter/wiring loss efficiency percentages.",
      "Inspect the Charging & Solar Sizing tab for mains charger amps and rooftop solar PV panel recommendations, or compare 10-Year Total Cost of Ownership."
    ],
    faqs: [
      {
        question: "How is battery backup runtime calculated accurately?",
        answer: "Basic runtime is calculated as: Runtime (Hours) = (Battery Ah × Voltage × DoD × Inverter Efficiency) / Load in Watts. When Peukert's Law is enabled, the calculator further accounts for the internal resistance and chemical diffusion limits of lead-acid batteries, which reduce available capacity under high discharge rates."
      },
      {
        question: "What is Depth of Discharge (DoD) and why does it differ across chemistries?",
        answer: "Depth of Discharge (DoD) represents the fraction of total stored energy that can be safely withdrawn without accelerating cell degradation. Flooded Tubular Lead-Acid batteries should not be discharged beyond 50% DoD to preserve cycle life, whereas Lithium Iron Phosphate (LiFePO4) can easily tolerate 90% to 95% DoD daily."
      },
      {
        question: "What is Peukert's Law and how does it affect battery backup time?",
        answer: "Peukert’s Law (t = H × (C / (I × H))^k) models how the effective capacity of a battery decreases when discharged at higher currents. Lead-acid batteries have a high Peukert exponent (k ≈ 1.25), meaning a heavy 1,000W load will deplete the battery much faster than a 100W load. Lithium batteries have k ≈ 1.02, making their capacity virtually independent of discharge current."
      },
      {
        question: "How do I choose between a 12V, 24V, and 48V battery bank?",
        answer: "For loads under 800W, a 12V system (1 battery) is cost-effective. For loads between 800W and 2,000W, a 24V system (2 batteries in series) halves the DC discharge current, reducing wire resistive heat losses. For heavy loads (>2,000W or solar installations), a 48V DC bus (4 batteries in series) is industry standard."
      },
      {
        question: "Why does ambient temperature impact battery capacity?",
        answer: "Electrochemical reactions slow down at lower temperatures. At 0°C (32°F), traditional lead-acid batteries deliver only ~70% of their rated 25°C capacity. LiFePO4 and Sodium-Ion batteries maintain significantly higher cold-weather efficiency, though lithium batteries must not be charged below freezing without low-temp BMS heating."
      },
      {
        question: "Is LiFePO4 cheaper than Tubular Lead-Acid over a 10-year lifespan?",
        answer: "Yes. While LiFePO4 has a higher initial upfront price, its 5,000+ cycle life lasts over 10 to 15 years without replacement. A lead-acid bank must be replaced 2 to 3 times over that same period and requires periodic distilled water maintenance, making LiFePO4 approximately 30% to 40% cheaper on a 10-year Levelized Cost of Storage (LCOS) basis."
      }
    ],
    sections: [
      {
        title: "Battery Chemistry Specifications & Cycle Life Profiles",
        content: "Selecting the correct battery chemistry depends on backup frequency and budget. Tall Tubular lead-acid batteries offer reliable, low-cost storage for regions with occasional grid cuts. In contrast, Lithium Iron Phosphate (LiFePO4) provides maintenance-free operation, fast 2-hour charging, zero acid fumes, high thermal stability, and 5,000+ deep discharge cycles."
      },
      {
        title: "Inverter VA Sizing vs True Wattage & Power Factor",
        content: "Apparent Power (VA) equals Real Power (Watts) divided by the Power Factor (PF ≈ 0.8 to 0.85 for inductive loads like ceiling fans and refrigerator motors). When sizing an inverter, ensure the continuous VA rating accommodates inductive reactive power and transient starting surges."
      }
    ]
  },
  {
    id: 'kWToHPConverter',
    slug: 'kw-hp-converter',
    name: 'kW ↔ HP Converter',
    category: 'electrical',
    shortDescription: "Convert power ratings between Kilowatts (kW) and Horsepower (HP) using electrical, mechanical, or metric standards.",
    metaDescription: "Free online kW to HP Converter. Bi-directionally convert Kilowatts and Horsepower for motor and automotive ratings instantly.",
    keywords: ["kW to HP converter","convert kW to horsepower","HP to kW converter","motor power conversion","electrical horsepower converter"],
    icon: 'Zap',
    howToUse: [
      "Choose the conversion standard (Electrical, Mechanical, or Metric).",
      "Input the value in Kilowatts or Horsepower.",
      "Adjust the sliders to quickly compare power scales.",
      "Copy the converted summary for documentation."
    ],
    faqs: [
      {
        "question": "Why are there different horsepower standards?",
        "answer": "Mechanical HP (745.7W) is used in imperial auto sectors; Metric HP (735.5W / PS) is common in Europe; Electrical HP (746W) is standard for grading electric motors and generators."
      }
    ],
    sections: [
      {
        "title": "Power Ratings in Electrical Equipment",
        "content": "Motor specifications routinely mix power values. Submersible pumps and industrial motors are rated in HP, whereas solar inverters and utility meters track loads in kW. This utility resolves the mathematical relationship between the units."
      }
    ]
  },
  {
    id: 'TransformerCalculator',
    slug: 'transformer-calculator',
    name: 'Transformer Calculator',
    category: 'electrical',
    shortDescription: "Calculate primary/secondary currents, turns ratio, and coil windings for single and three-phase transformers.",
    metaDescription: "Free online Transformer Calculator. Calculate primary and secondary winding full-load currents based on kVA rating.",
    keywords: ["transformer calculator","calculate transformer current","turns ratio calculator","transformer coil winding","kva rating calculator"],
    icon: 'Zap',
    howToUse: [
      "Enter the transformer rating in kVA.",
      "Select single-phase or three-phase winding systems.",
      "Input the primary and secondary voltage levels.",
      "Adjust the turns per volt constant to calculate winding turns."
    ],
    faqs: [
      {
        "question": "How is turns ratio related to voltages?",
        "answer": "The turns ratio (Np / Ns) of a transformer is directly proportional to the primary and secondary voltage ratio (Vp / Vs) under ideal conditions."
      }
    ],
    sections: [
      {
        "title": "Transformer Currents and Sizing Safety",
        "content": "Transformers step voltages up or down while transferring power. Due to energy conservation, the side with higher voltage carries a lower current, and vice versa. Knowing full-load currents is essential to size breakers and isolator cables."
      }
    ]
  },
  {
    id: 'LEDLightingCalculator',
    slug: 'led-lighting-calculator',
    name: 'LED Lighting Calculator',
    category: 'electrical',
    shortDescription: "Calculate the required number of LED bulbs and layout spacing based on room dimensions and Lux targets.",
    metaDescription: "Free online LED Lighting Calculator. Estimate required bulbs count and spacing layout based on room area and target Lux levels.",
    keywords: ["led lighting calculator","lumen calculator","lux to lumens calculator","how many led bulbs needed","room lighting calculator"],
    icon: 'Zap',
    howToUse: [
      "Enter room length, width, and dimensions unit.",
      "Select the room type preset (bedroom, kitchen, office) to set target Lux.",
      "Input the LED bulb lumen rating (usually 800-900lm for 9W bulbs).",
      "Set utilization and maintenance parameters to view the fixture count and grid."
    ],
    faqs: [
      {
        "question": "What is the difference between Lux and Lumens?",
        "answer": "Lumen (lm) measures the total light output emitted by a bulb. Lux (lx) measures the intensity of light falling on a surface area (1 Lux = 1 Lumen per square meter)."
      }
    ],
    sections: [
      {
        "title": "Illuminance Standards for Indoor Spaces",
        "content": "Adequate lighting prevents eye strain. Standards recommend different Lux levels: bedrooms require lower ambient light (100 Lux), kitchens require task lighting (250 Lux), while office desks and drawing boards require high intensity (500 Lux)."
      }
    ]
  }
];
