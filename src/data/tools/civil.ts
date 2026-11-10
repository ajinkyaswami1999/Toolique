import type { Tool } from './types';

export const civilTools: Tool[] = [
  {
  "id": "ConstructionCostCalculator",
  "slug": "construction-cost-calculator",
  "name": "Construction Cost Calculator",
  "category": "architecture",
  "subcategory": "Estimation",
  "shortDescription": "Comprehensive construction cost estimator and duration planner. Calculate building budgets, material quantity BOQ, and critical path timeline.",
  "metaTitle": "Construction Cost Calculator | House Construction Cost per Sq Ft",
  "metaDescription": "Free Construction Cost Calculator & Duration Planner. Estimate house building cost per sq ft, raw material quantities, labour man-days, and critical path timeline.",
  "keywords": [
    "construction cost calculator",
    "house construction cost calculator",
    "building construction cost calculator",
    "construction cost per sq ft",
    "house construction cost per sq ft",
    "construction time calculator",
    "building construction estimate",
    "house construction estimate",
    "construction material calculator",
    "Gantt timeline planner",
    "BOQ estimator"
  ],
  "icon": "Hammer",
  "howToUse": [
    "Enter the built-up area in square feet.",
    "Select the construction quality: Economy, Standard, or Premium.",
    "Select the city tier or location multiplier.",
    "View the estimated cost breakdown, including material and labor splits."
  ],
  "faqs": [
    {
      "question": "What is the average construction cost per sq ft in India?",
      "answer": "The average construction cost in India ranges from ₹1,200 to ₹1,800 per sq ft for basic/standard quality, and can exceed ₹2,500 per sq ft for premium quality."
    },
    {
      "question": "What is the standard ratio of material to labor in construction?",
      "answer": "In general, materials constitute 60% of the total budget, while labor makes up the remaining 40%."
    }
  ],
  "sections": [
    {
      "title": "What is Construction Cost?",
      "content": "Construction cost refers to the total expenditure incurred to erect a physical building structure. It includes site preparation, excavation, foundation, brickwork, RCC columns, plastering, wiring, plumbing, and finishing."
    },
    {
      "title": "Material vs Labor cost split",
      "content": "Building materials (cement, steel, bricks, sand, aggregate, wood, tiles) typically make up about 60% to 65% of the construction budget. Onsite labor (masonry, carpentry, electrical, plumbing labor) accounts for 35% to 40%."
    }
  ]
},
  {
  "id": "BOQCalculator",
  "slug": "boq-calculator",
  "name": "BOQ (Bill of Quantities) Calculator",
  "category": "civil",
  "shortDescription": "Generate material quantity estimates for construction projects.",
  "metaTitle": "BOQ Calculator Online: Bill of Quantities & Material Estimator (India)",
  "metaDescription": "Free online BOQ Calculator for Indian construction. Estimate cement bags, steel rebar kg, sand cft, aggregate & bricks from built-up area with standard civil thumb rules & cost breakdown.",
  "keywords": [
    "boq calculator online",
    "boq calculator",
    "civil boq format excel free download",
    "building estimation and costing boq calculator",
    "BOQ Calculator",
    "Bill of Quantities online",
    "material estimator",
    "cement sand steel estimation",
    "civil BOQ tool",
    "civil engineering quantity takeoff",
    "residential building material estimation"
  ],
  "icon": "Hammer",
  "howToUse": [
    "Enter the total proposed built-up area of your building in square feet.",
    "Select a preconfigured property preset (1 BHK, 2 BHK, Duplex Villa) or custom specifications.",
    "Modify the estimated unit rates for cement, steel, sand, aggregate, and bricks according to local market prices.",
    "Review itemized structural material requirements and cost breakdowns instantly.",
    "Copy the material indent summary or launch Advanced BOQ for multi-floor takeoffs and Excel export."
  ],
  "faqs": [
    {
      "question": "What is a Bill of Quantities (BOQ)?",
      "answer": "A BOQ (Bill of Quantities) is a comprehensive construction document that itemizes materials, parts, and labor required for a building project. It establishes an objective baseline for contractor tenders, milestone billing, and site material requisition."
    },
    {
      "question": "What are the standard thumb rules for residential building material estimation in India?",
      "answer": "Standard civil engineering thumb rules for residential construction in India per square foot of built-up area are:\n• Cement: 0.40 to 0.45 Bags (50kg) / sq.ft\n• Reinforcement Steel: 3.5 to 4.5 Kg / sq.ft\n• Fine River/M-Sand: 1.8 to 2.0 cu.ft / sq.ft\n• Coarse Aggregate (10mm/20mm): 1.35 to 1.5 cu.ft / sq.ft\n• Red Bricks (or AAC Blocks): 1.2 to 1.4 Bricks / sq.ft"
    },
    {
      "question": "How much cement and steel is needed for a 1,000 sq ft house?",
      "answer": "For a 1,000 sq ft single-story residential building:\n• Cement: ~400 to 450 bags\n• TMT Steel: ~3,800 to 4,200 kg (3.8 to 4.2 metric tonnes)\n• Sand: ~1,800 cu.ft (18 Brass)\n• Aggregate: ~1,350 cu.ft (13.5 Brass)\n• Bricks: ~1,300 to 1,500 red clay bricks (or equivalent AAC blocks)."
    },
    {
      "question": "How do you convert sand and aggregate from cubic feet (cu.ft) to Brass?",
      "answer": "In Indian civil construction markets (Maharashtra, Gujarat, Karnataka), 1 Brass is equal to exactly 100 cubic feet (cu.ft), which equals approximately 2.83 cubic meters (m\u00b3). For example, 1,800 cu.ft of sand equals 18 Brass."
    },
    {
      "question": "Can I export this BOQ estimate to Excel?",
      "answer": "Yes! You can copy the itemized material summary directly to your clipboard or use our companion Advanced BOQ Calculator India to download a multi-sheet Microsoft Excel (.xlsx) workbook with CPWD DSR rate analysis."
    }
  ],
  "sections": [
    {
      "title": "What is a BOQ (Bill of Quantities)?",
      "content": "A Bill of Quantities is a comprehensive schedule of materials, labor, and equipment needed for a construction contract, allowing builders to estimate accurate tender proposals."
    },
    {
      "title": "BOQ Estimation Thumb-Rule Formula",
      "content": "Our calculator utilizes standard residential material coefficients:\n- Cement: 0.4 Bags per sq ft\n- Steel: 4.0 Kg per sq ft\n- Sand: 1.8 Cubic feet per sq ft\n- Aggregate: 1.35 Cubic feet per sq ft\n- Bricks: 1.4 Bricks per sq ft"
    }
  ]
},
  {
    "id": "ConcreteCalculator",
    "slug": "concrete-calculator",
    "name": "Concrete Calculator",
    "category": "civil",
    "shortDescription": "Calculate concrete volume and ingredient requirements for cement, sand, and aggregate.",
    "metaTitle": "Concrete Calculator | Cement, Sand, Aggregate & Steel BOQ",
    "metaDescription": "Calculate concrete volume, cement bags, sand brass, aggregate tons, and rebar steel for slabs, footings, columns, and beams. Free civil engineering BOQ tool.",
    "keywords": [
      "concrete calculator",
      "concrete mix ratio calculator",
      "cement sand aggregate calculator",
      "dry volume concrete",
      "M20 concrete mix calculator",
      "M25 concrete mix design",
      "concrete volume calculator in brass",
      "concrete slab material calculator",
      "how many cement bags in 1 m3 concrete",
      "rcc concrete estimator",
      "ready mix concrete rmc calculator",
      "concrete footing calculator"
    ],
    "icon": "Hammer",
    "howToUse": [
      "Select your structural member type (Slab, Footing, Rectangular Column, Round Pier, Beam, Wall, Stairs, or Direct Volume).",
      "Enter the dimensions in Feet/Inches or Metric (Meters/Centimeters).",
      "Select the concrete nominal mix grade (M5, M7.5, M10, M15, M20, M25, M30) as per IS 456.",
      "Adjust the wastage buffer percentage (5% to 10% recommended for site pouring).",
      "Toggle Steel Reinforcement (RCC) or Integral Waterproofing Admixture if required.",
      "Review the exact bill of quantities (BOQ) with Cement Bags, Sand Brass, Aggregate Tons, Water Liters, and download a PDF or share on WhatsApp."
    ],
    "faqs": [
      {
        "question": "Why is dry volume 1.54 times wet concrete volume?",
        "answer": "When water is added to dry ingredients (cement, sand, and aggregate), it fills the microscopic air voids between particles, causing the mixture to shrink by approximately 30% to 35%. To produce 1 m³ of compacted wet concrete, approximately 1.52 to 1.57 m³ (standard 1.54 m³) of loose dry ingredients are required."
      },
      {
        "question": "How many bags of cement are required for 1 m³ of M20 concrete?",
        "answer": "For standard M20 concrete (1:1.5:3 ratio by volume with 1.54 dry factor), approximately 8.1 to 8.4 bags (405–420 kg) of cement are required per cubic meter of wet concrete."
      },
      {
        "question": "What is the difference between M20 and M25 concrete?",
        "answer": "M20 concrete (1:1.5:3) achieves a 28-day characteristic compressive strength of 20 N/mm² (MPa) and is the minimum standard for general RCC slabs, beams, and columns. M25 concrete (1:1:2) achieves 25 N/mm² and is required for heavy-load columns, foundations, and water-retaining structures."
      },
      {
        "question": "How much sand and aggregate is needed per bag of cement?",
        "answer": "In an M20 nominal mix (1:1.5:3), for every 1 bag of cement (1.23 cu.ft), you need 1.84 cu.ft of fine sand and 3.68 cu.ft of coarse aggregate."
      },
      {
        "question": "How do you calculate concrete volume in Brass?",
        "answer": "In Indian civil construction, 1 Brass equals 100 cubic feet (cu.ft) or approximately 2.8317 cubic meters (m³). To convert cubic feet to Brass, divide total cubic feet by 100."
      },
      {
        "question": "How many transit mixer trucks are needed for a concrete pour?",
        "answer": "Commercial Ready-Mix Concrete (RMC) transit mixer trucks typically carry 6 m³ or 7 m³ of wet concrete per load. Divide total wet volume (m³) by truck capacity to determine required dispatch trips."
      }
    ],
    "sections": [
      {
        "title": "What is Concrete Volume & Material Estimation?",
        "content": "Concrete material estimation is the civil engineering calculation process that translates the geometric dimensions of structural members (slabs, columns, beams, footings) into exact purchasing quantities of cement bags, fine aggregate (sand), coarse aggregate (gravel), steel rebar, and mixing water."
      },
      {
        "title": "Nominal Concrete Mix Proportions (IS 456 Standards)",
        "content": "• **M5 (1:5:10)**: Non-structural mass bed, sub-base levelling course.\n• **M7.5 (1:4:8)**: Plain mass foundation concrete, kerb backing.\n• **M10 (1:3:6)**: PCC bed under masonry and flooring sub-bases.\n• **M15 (1:2:4)**: Plain flooring, domestic driveways, light load structures.\n• **M20 (1:1.5:3)**: Standard RCC for residential slabs, beams, columns, and lintels (20 MPa).\n• **M25 (1:1:2)**: High-strength RCC for heavy columns, water tanks, and raft footings (25 MPa).\n• **M30 (1:0.75:1.5)**: High-performance structural concrete for multi-storey frames and bridges."
      },
      {
        "title": "Mathematical Formulas Used",
        "content": "• **Wet Volume ($V_{wet}$)** = Length × Width × Thickness (or $\pi r^2 h$ for cylinders)\n• **Gross Wet Volume** = $V_{wet} \times (1 + \text{Wastage } \% / 100)$\n• **Dry Shrinkage Volume ($V_{dry}$)** = Gross Wet Volume × 1.54\n• **Cement Bags** = $\frac{C}{C + S + A} \times V_{dry} \div 0.03472 \text{ m}^3$\n• **Sand Volume ($cu.ft$)** = $\frac{S}{C + S + A} \times V_{dry} \times 35.3147$\n• **Aggregate Volume ($cu.ft$)** = $\frac{A}{C + S + A} \times V_{dry} \times 35.3147$\n• **Water Required (L)** = Cement Bags × Water Ratio (22.5–25 L/bag)"
      },
      {
        "title": "Step-by-Step Real-World Example (RCC Roof Slab)",
        "content": "For a standard residential roof slab measuring 30 ft × 20 ft with a 5-inch thickness in M20 (1:1.5:3) concrete and 5% wastage:\n1. Wet Volume = 30 × 20 × (5/12) = 250 cu.ft = 7.08 m³\n2. With 5% Wastage = 7.08 × 1.05 = 7.43 m³\n3. Dry Volume = 7.43 × 1.54 = 11.44 m³\n4. Total Parts = 1 + 1.5 + 3 = 5.5\n5. Cement Volume = (1 / 5.5) × 11.44 = 2.08 m³ = 60 Bags (50kg)\n6. Sand Volume = (1.5 / 5.5) × 11.44 × 35.3147 = 110.2 cu.ft (1.10 Brass)\n7. Aggregate Volume = (3 / 5.5) × 11.44 × 35.3147 = 220.4 cu.ft (2.20 Brass)\n8. Steel Rebar (~70 kg/m³) = 7.43 × 70 = 520 kg (Fe500)\n9. Water Requirement = 60 × 24 = 1,440 Liters."
      },
      {
        "title": "Practical Site Tips for Concrete Pouring",
        "content": "• **Aggregate Grading**: Always use a blended aggregate mix (60% 20mm down-size + 40% 10mm down-size) to minimize honeycombing and voids around steel reinforcement.\n• **Water-Cement Ratio**: Keep the water-to-cement ratio between 0.45 and 0.50. Excess water reduces 28-day compressive strength and causes shrinkage cracks.\n• **Curing Period**: Maintain continuous ponding or wet burlap curing for at least 7 to 14 days to achieve maximum design strength."
      },
      {
        "title": "Who It Is For",
        "content": "Designed for civil engineers, RCC structural contractors, site supervisors, builders, quantity surveyors, and homeowners looking to audit material consumption and verify material procurement invoices."
      }
    ]
  },
  {
  "id": "BrickCalculator",
  "slug": "brick-calculator",
  "name": "Brick Masonry Calculator & Quantity Estimator India",
  "category": "civil",
  "shortDescription": "Calculate masonry material requirements, mortar ratios (1:3 to 1:8), cement bags, sand cft/brass, AAC blocks, and Laurie Baker Rat-Trap bonds per IS 1077, IS 2212 & CPWD DSR.",
  "metaDescription": "Free online Brick Calculator India for civil engineers & builders. Calculate number of bricks, cement bags, sand brass/cft, AAC block adhesive & cost for 4.5\" partition, 9\" external & Rat-Trap bond walls per IS 1077, IS 1200 Pt-3.",
  "keywords": [
    "brick calculator india",
    "brick masonry calculator",
    "number of bricks in 9 inch wall",
    "cement sand mortar calculator for brickwork",
    "aac block vs red brick calculator",
    "rat trap bond brick calculator",
    "cpwd brick rate analysis",
    "is 1077 modular brick calculation",
    "is 1200 part 3 brickwork deductions",
    "brick wall material takeoff excel",
    "how many bricks in 100 sq ft wall india",
    "4.5 inch partition wall brick calculation",
    "fly ash brick calculator",
    "dry mortar coefficient 1.33 brickwork"
  ],
  "icon": "Hammer",
  "howToUse": [
    "Enter wall dimensions (Length, Height) and select wall thickness (4.5\", 6\", 9\", 13.5\", or 18\").",
    "Choose your masonry unit preset: Modular BIS Brick (IS 1077), Traditional Red Brick, Fly Ash Lime Brick (IS 12894), AAC Blocks (4\"/6\"/8\"), Concrete Blocks, or Custom dimensions.",
    "Select mortar ratio (1:3 to 1:8 or Thin-Bed Polymer Adhesive) and masonry bond pattern (English, Stretcher, Flemish, or Rat-Trap Cavity Bond).",
    "Add door, window, and ventilator openings for automated deduction compliance with IS 1200 Part 3.",
    "Switch between Single Wall, Multi-Wall Building Schedule, AAC vs Clay Benchmark, CPWD Rate Analysis, and 1-Click WhatsApp/Excel/PDF Exports."
  ],
  "faqs": [
    {
      "question": "How many bricks are required in a 100 sq.ft 9-inch wall in India?",
      "answer": "A 100 sq.ft 9-inch wall has a volume of 75 cubic feet (2.124 m³). Using standard country red bricks (228.6 x 114.3 x 76.2 mm) with 10mm mortar joints, it requires approximately 900 to 950 bricks, 4 to 5 bags of cement (in 1:6 ratio), and 24 to 28 cft of river/M-sand."
    },
    {
      "question": "What is the Laurie Baker Rat-Trap Bond and how much does it save?",
      "answer": "Rat-Trap Bond is a cavity wall masonry technique where bricks are placed on edge instead of flat. This creates an internal modular cavity within a 9-inch wall, consuming 24% fewer bricks, 35% less cement mortar, and providing built-in thermal and acoustic insulation."
    },
    {
      "question": "What are the opening deduction rules as per IS 1200 Part 3?",
      "answer": "Under IS 1200 (Part 3), openings less than 0.1 m² (approx 1 sq.ft), ends of beams/lintels up to 500 cm², and wall plates are NOT deducted from brickwork volume. All doors, windows, and openings 0.1 m² or larger are deducted in full."
    },
    {
      "question": "Why is the dry mortar multiplier 1.33 used in brick calculations?",
      "answer": "When water is added to dry cement and sand, the fine particles fill voids in the sand, causing volume shrinkage. To achieve 1 m³ of wet mortar, approximately 1.33 m³ of dry material (cement + sand) is required."
    },
    {
      "question": "How many AAC blocks replace traditional red bricks?",
      "answer": "One standard 600x200x150 mm (6\") AAC block has the volume equivalent of approximately 6 standard red clay bricks. AAC blocks reduce wall dead load by 50% to 60% and use 3mm thin-bed polymer adhesive instead of thick cement mortar."
    }
  ],
  "sections": [
    {
      "title": "IS Code Compliant Masonry Estimation",
      "content": "Masonry takeoff in India follows IS 1077 (Clay Bricks), IS 2212 (Code of Practice for Brickwork), and IS 1200 Part 3 (Method of Measurement). Accurate quantity estimation requires factoring brick dimensions, 10mm mortar joints, frog volume filling, 1.33 dry mortar factor, and standard openings deductions."
    },
    {
      "title": "Masonry Bonds & Material Consumption",
      "content": "- **English Bond**: Alternating header and stretcher courses; maximum structural load-bearing capacity for 9\" and 13.5\" external walls.\n- **Stretcher Bond**: Bricks laid lengthwise with 1/2 brick overlap; standard for 4.5\" internal partition walls (1:4 mortar).\n- **Laurie Baker Rat-Trap Bond**: Bricks laid on edge with internal air cavity; saves 24% bricks, 35% mortar, and lowers building heat gain.\n- **AAC Thin-Bed Blockwork**: 600x200mm blocks joined with 3mm polymer adhesive; eliminates sand and curing water completely."
    }
  ]
},
  {
  "id": "RCCCalculator",
  "slug": "rcc-calculator",
  "name": "RCC Calculator & Reinforcement BOQ",
  "category": "civil",
  "shortDescription": "Calculate reinforced cement concrete quantities including mix design (M20/M25), TMT steel rebar (BBS), and shuttering formwork per IS 456.",
  "metaTitle": "RCC Calculator: Concrete Volume, Rebar Steel (kg) & Shuttering (IS 456)",
  "metaDescription": "Free online RCC Calculator for civil engineers & contractors. Calculate concrete volume (M20/M25), cement bags, sand brass, aggregate, TMT steel rebar weight (D²/162) & shuttering area per IS 456.",
  "keywords": [
    "rcc calculator",
    "rcc material calculator",
    "rcc quantity calculation formula",
    "rcc slab material calculator",
    "rcc steel calculation formula",
    "RCC Calculator",
    "reinforced cement concrete calculator",
    "steel reinforcement calculator in RCC",
    "IS 456 concrete steel ratios",
    "shuttering area calculator for slab",
    "RCC slab steel calculation",
    "column steel rebar weight calculator",
    "RCC beam concrete and steel quantity",
    "footing RCC calculation formula",
    "bar bending schedule BBS calculator",
    "cement sand aggregate ratio in RCC",
    "RCC construction cost calculator India"
  ],
  "icon": "Hammer",
  "howToUse": [
    "Select your RCC structural member: Roof/Floor Slab, Beam, Rectangular/Circular Column, Isolated Footing, Retaining Wall, Staircase, Lintel & Chajja, or Direct Volume.",
    "Pick your concrete grade (M15, M20, M25, M30) and TMT steel grade (Fe 500D, Fe 550D, Fe 600).",
    "Input member dimensions in Metric (meters/mm) or Imperial (feet/inches) and number of units.",
    "Adjust steel reinforcement percentage (e.g. 1.0% for slabs, 1.8% for beams, 2.5% for columns) or use IS 456 standards.",
    "Review the complete material indent: Cement bags, Sand brass, Coarse aggregate tons, TMT rebar by diameter, and Shuttering plywood sheets.",
    "Click 'Add to BOQ Schedule' to build a multi-element project takeoff, download a PDF Requisition, or share directly to WhatsApp."
  ],
  "faqs": [
    {
      "question": "What is Reinforced Cement Concrete (RCC) and why is steel needed?",
      "answer": "RCC is a composite building material combining plain cement concrete (which is very strong in compression but weak in tension) with steel reinforcement bars (TMT rebars, which offer immense tensile strength). Steel rebars absorb bending, shear, and tensile stresses, preventing catastrophic brittle failure."
    },
    {
      "question": "What are the standard steel reinforcement percentages for different RCC structural members under IS 456?",
      "answer": "Under Indian Standard IS 456:2000 rules of thumb: Slabs require 0.7% to 1.2% steel (approx. 55 to 80 kg/m\u00b3), Beams require 1.0% to 2.5% steel (approx. 80 to 160 kg/m\u00b3), Columns require 1.5% to 4.0% steel (approx. 120 to 275 kg/m\u00b3), and Isolated Footings require 0.5% to 1.0% steel (approx. 40 to 65 kg/m\u00b3)."
    },
    {
      "question": "What is the minimum concrete grade for RCC structural work as per IS 456:2000?",
      "answer": "As per IS 456:2000 Clause 6.1.2, the minimum grade of concrete for plain reinforced concrete (RCC) is M20 (nominal mix 1:1.5:3, compressive strength 20 N/mm\u00b2 at 28 days). For post-tensioned pre-stressed concrete, minimum M30 is required; for pre-tensioned, minimum M40 is specified."
    },
    {
      "question": "What is the dry volume conversion factor for concrete batching?",
      "answer": "Dry ingredients shrink by approximately 54% when mixed with water due to the elimination of air voids between aggregate and sand particles. Therefore, a dry volume conversion multiplier of 1.54 is multiplied by wet concrete volume before calculating cement, sand, and aggregate."
    },
    {
      "question": "What are the minimum clear cover requirements for RCC elements as per IS 456?",
      "answer": "Clear cover protects reinforcement from corrosion and fire: Slabs require 20 mm, Beams require 25 mm, Columns require 40 mm (or bar diameter, whichever is greater), Footings touching earth require 50 mm, and Water retaining structures require 25 to 30 mm."
    },
    {
      "question": "What is the formula to calculate TMT rebar steel weight in RCC?",
      "answer": "Steel rebar weight is calculated using the standard formula: Weight (kg/m) = D\u00b2 / 162.28, where D is the nominal diameter in millimeters. For example, 10mm bar = (10 \u00d7 10) / 162.28 = 0.616 kg/m, 12mm bar = 0.888 kg/m, and 16mm bar = 1.578 kg/m. For RCC structural elements, total steel weight is determined by multiplying concrete volume by the reinforcement ratio (e.g., 80 kg/m\u00b3 for slabs, 130 kg/m\u00b3 for beams, 160 kg/m\u00b3 for columns)."
    },
    {
      "question": "How do you calculate cement bags and sand for 1 cubic meter of M20/M25 concrete?",
      "answer": "Applying the IS 456 dry volume expansion factor of 1.54: For M20 concrete (1:1.5:3, total parts = 5.5), 1 m\u00b3 wet concrete requires 1.54 m\u00b3 dry materials. Cement = (1 / 5.5) \u00d7 1.54 \u00d7 1440 = 403 kg \u2248 8.1 bags (50kg). Sand = (1.5 / 5.5) \u00d7 1.54 \u00d7 35.315 \u2248 14.8 cu.ft (0.15 Brass). Aggregate = (3 / 5.5) \u00d7 1.54 \u00d7 35.315 \u2248 29.7 cu.ft (0.30 Brass)."
    },
    {
      "question": "How do you calculate the shuttering (formwork) contact area for beams, columns, and slabs?",
      "answer": "Shuttering contact area is the exposed surface area of wet concrete supported by formwork: Slabs = (Length \u00d7 Width) + 2 \u00d7 (Length + Width) \u00d7 Thickness; Beams = (2 \u00d7 Depth + Width) \u00d7 Length; Columns = 2 \u00d7 (Width + Depth) \u00d7 Height. Standard 8ft \u00d7 4ft plywood sheets cover 32 sq.ft."
    }
  ],
  "sections": [
    {
      "title": "IS 456:2000 Standard RCC Steel Reinforcement Ratios",
      "content": "Reinforcement steel weight in structural concrete is governed by volumetric density (\u03c1 = 7,850 kg/m\u00b3):\n- **Roof & Floor Slabs**: 0.7% to 1.2% of concrete volume (55 \u2013 95 kg/m\u00b3)\n- **Plinth & Floor Beams**: 1.0% to 2.5% of concrete volume (80 \u2013 195 kg/m\u00b3)\n- **Columns & Pedestals**: 1.5% to 4.0% of concrete volume (120 \u2013 314 kg/m\u00b3, max 6% at lap zones)\n- **Foundation Footings & Rafts**: 0.5% to 1.0% of concrete volume (40 \u2013 80 kg/m\u00b3)\n- **Retaining & Shear Walls**: 0.8% to 1.8% of concrete volume (65 \u2013 140 kg/m\u00b3)\n- **RCC Staircases**: 0.9% to 1.5% of concrete volume (70 \u2013 120 kg/m\u00b3)"
    },
    {
      "title": "Concrete Mix Proportions & Dry Compaction Math",
      "content": "To calculate constituent materials for concrete batching:\n1. **Wet to Dry Volume**: `Dry Volume (m\u00b3) = Wet Volume (m\u00b3) \u00d7 1.54`\n2. **Cement Weight**: `Cement (kg) = (Cement Ratio / Total Parts) \u00d7 Dry Volume \u00d7 1440 kg/m\u00b3`\n3. **Cement 50kg Bags**: `Cement Bags = Cement Weight (kg) / 50`\n4. **Fine Sand**: `Sand (cu.ft) = (Sand Ratio / Total Parts) \u00d7 Dry Volume \u00d7 35.3147` (1 Brass = 100 cu.ft)\n5. **Coarse Aggregate**: `Aggregate (cu.ft) = (Aggregate Ratio / Total Parts) \u00d7 Dry Volume \u00d7 35.3147` (Standard split: 60% 20mm + 40% 10mm)\n6. **Water Requirement**: `Water (Liters) = Cement Weight (kg) \u00d7 Water-Cement Ratio (0.45 \u2013 0.55)`"
    },
    {
      "title": "Formwork Striking & De-Shuttering Schedule (IS 456: Clause 11.3)",
      "content": "Striking time for formwork under normal Indian temperature conditions (>16\u00b0C):\n- **Vertical sides of beams, columns, and walls**: 16 to 24 hours\n- **Soffits to slabs (props left under)**: 3 days\n- **Soffits to beams (props left under)**: 7 days\n- **Props to slabs spanning up to 4.5m**: 7 days\n- **Props to slabs spanning over 4.5m**: 14 days\n- **Props to beams & arches spanning up to 6m**: 14 days\n- **Props to beams & arches spanning over 6m**: 21 days"
    },
    {
      "title": "Bar Bending Schedule (BBS) Allowances & Clear Cover",
      "content": "- **Lap Length ($L_d$)**: Typically $50d$ to $60d$ (where $d$ is bar diameter in mm) for tension lap.\n- **Bend Deduction**: Deduct $2d$ for each 90\u00b0 bend, $3d$ for 135\u00b0 bends, and $4d$ for 180\u00b0 hooks.\n- **GI Binding Wire**: 7 to 10 kg of 18-gauge annealed binding wire per 1000 kg of TMT steel rebar.\n- **Cover Blocks**: PVC or concrete cover blocks spaced at approx. 1 meter grid (15 to 20 blocks per m\u00b3 of concrete)."
    }
  ]
},
  {
  "id": "SteelWeightCalculator",
  "slug": "steel-weight-calculator",
  "name": "Steel Weight Calculator & BBS Indent",
  "category": "civil",
  "shortDescription": "Calculate structural steel weights and BBS procurement schedules for TMT rebars (IS 1786), MS plates, ISMC channels, ISMB beams, angles (ISA), hollow tubes (SHS/RHS), and pipes (IS 1239).",
  "metaDescription": "Free Online Steel Weight Calculator for Indian civil engineers and fabricators. Calculate TMT rebars (Fe500D/Fe550), MS plates, ISMC channels, ISMB beams, angles, pipes, bundle counts, and live \u20b9/kg cost.",
  "keywords": [
    "Steel Weight Calculator",
    "TMT bar weight calculator",
    "TMT bar weight formula D2/162",
    "IS 1786 steel weight chart",
    "ISMC channel weight per meter",
    "ISMB beam weight calculator",
    "MS plate weight calculator",
    "steel angle weight calculator ISA",
    "square tube SHS weight calculator",
    "steel pipe weight calculator IS 1239",
    "TMT bundle weight calculator",
    "steel rate per kg India",
    "bar bending schedule BBS weight calculator"
  ],
  "icon": "Hammer",
  "howToUse": [
    "Select your structural steel profile: TMT rebar (IS 1786), MS plate, chequered plate, flat patti, angle (ISA), channel (ISMC), beam (ISMB), hollow section (SHS/RHS), or round pipe.",
    "Choose the metal grade or density (TMT Fe 500D/550D, MS E250, High Tensile E350, SS 304/316, Aluminium, Brass, Copper).",
    "Pick standard BIS presets (e.g. ISMC 100, ISMB 150, ISA 50x50x5, 12mm TMT) or enter custom dimensions.",
    "Specify length (standard 12m TMT or 6m structural section) and piece quantity or full factory bundle count.",
    "Click 'Add to Steel Takeoff' to compile a multi-item Bill of Materials (BOM), download a PDF Cutting Requisition, or share to WhatsApp."
  ],
  "faqs": [
    {
      "question": "How is TMT rebar steel weight calculated per meter using the D\u00b2/162 formula?",
      "answer": "Weight (kg/m) = D\u00b2 / 162.2, where D is the nominal diameter in millimeters. For example, a 12mm bar weighs (12 \u00d7 12) / 162.2 = 0.888 kg/m. A standard 12-meter (40 ft) length of 12mm TMT weighs 0.888 \u00d7 12 = 10.66 kg."
    },
    {
      "question": "How many pieces of TMT steel bars are in one factory bundle?",
      "answer": "In Indian trade practice (Tata Tiscon, Jindal Panther, SAIL, JSW): 8mm has 10 pcs/bundle (~47.4 kg), 10mm has 7 pcs/bundle (~51.8 kg), 12mm has 5 pcs/bundle (~53.3 kg), 16mm has 3 pcs/bundle (~56.8 kg), 20mm has 2 pcs/bundle (~59.2 kg), and 25mm+ bars are bundled as single pieces."
    },
    {
      "question": "What is the standard density of steel and other structural metals?",
      "answer": "Mild steel, TMT rebars, and carbon structural steel have a standardized density of 7,850 kg/m\u00b3 (0.00785 g/mm\u00b3). Stainless steel SS 304 is 7,930 kg/m\u00b3, SS 316 is 8,000 kg/m\u00b3, Aluminium is 2,700 kg/m\u00b3, Copper is 8,960 kg/m\u00b3, and Brass is 8,500 kg/m\u00b3."
    },
    {
      "question": "How do you calculate the weight of Mild Steel (MS) plates and chequered plates?",
      "answer": "Plain plate weight (kg) = Length (m) \u00d7 Width (m) \u00d7 Thickness (mm) \u00d7 7.85. For chequered plates with teardrop/diamond embossing (IS 2062), add +2.1 kg/m\u00b2 to the base plate weight for the raised pattern."
    },
    {
      "question": "What is the difference between Fe 415, Fe 500, Fe 500D, and Fe 550D TMT bars?",
      "answer": "The numbers represent minimum yield strength in MPa (N/mm\u00b2). 'D' stands for Super Ductile, offering higher elongation (\u2265 16% for Fe 500D vs \u2265 12% for Fe 500) and better seismic earthquake resistance as mandated by IS 13920 and IS 1786:2008."
    },
    {
      "question": "How is hollow section (SHS / RHS) pipe weight calculated?",
      "answer": "For Square Hollow Sections (SHS): Weight (kg/m) = 4 \u00d7 (Side - Thickness) \u00d7 Thickness \u00d7 0.00785. For Rectangular Hollow Sections (RHS): Weight (kg/m) = 2 \u00d7 (Width + Height - 2 \u00d7 Thickness) \u00d7 Thickness \u00d7 0.00785."
    }
  ],
  "sections": [
    {
      "title": "Standard Indian Steel Profiles & IS Code Standards",
      "content": "Indian civil and structural fabrication adheres to rigorous Bureau of Indian Standards (BIS) specifications:\n- **IS 1786**: High-strength deformed steel bars and wires for concrete reinforcement (Fe 415, Fe 500, Fe 500D, Fe 550D, Fe 600).\n- **IS 2062**: Hot rolled medium and high tensile structural steel plates, strips, and flats (MS E250 Gr. A/B/C, E350).\n- **IS 808**: Dimensions for hot rolled steel beam, column, channel (ISMC), and angle (ISA) sections.\n- **IS 4923**: Hollow steel sections for structural use (Square Hollow Sections - SHS and Rectangular Hollow Sections - RHS).\n- **IS 1239 / IS 1161**: Mild steel tubes, tubulars, and circular hollow sections across Light (Class A), Medium (Class B), and Heavy (Class C) schedules."
    },
    {
      "title": "Complete TMT Rebar Weight & Bundle Packaging Chart (IS 1786)",
      "content": "| Diameter (mm) | Weight (kg/m) [D\u00b2/162.2] | Weight per 12m Bar (kg) | Standard Pieces / Bundle | Bundle Weight (kg) |\n|---|---|---|---|---|\n| **6 mm** | 0.222 kg/m | 2.66 kg | 20 pcs | 53.28 kg |\n| **8 mm** | 0.395 kg/m | 4.74 kg | 10 pcs | 47.40 kg |\n| **10 mm** | 0.617 kg/m | 7.40 kg | 7 pcs | 51.83 kg |\n| **12 mm** | 0.888 kg/m | 10.66 kg | 5 pcs | 53.28 kg |\n| **16 mm** | 1.578 kg/m | 18.94 kg | 3 pcs | 56.81 kg |\n| **20 mm** | 2.466 kg/m | 29.59 kg | 2 pcs | 59.18 kg |\n| **25 mm** | 3.853 kg/m | 46.24 kg | 1 pc | 46.24 kg |\n| **28 mm** | 4.834 kg/m | 58.01 kg | 1 pc | 58.01 kg |\n| **32 mm** | 6.313 kg/m | 75.76 kg | 1 pc | 75.76 kg |\n| **36 mm** | 7.990 kg/m | 95.88 kg | 1 pc | 95.88 kg |\n| **40 mm** | 9.865 kg/m | 118.38 kg | 1 pc | 118.38 kg |"
    },
    {
      "title": "Structural Steel Mathematical Weight Formulas",
      "content": "All structural profile weights are derived from cross-sectional area and density (\u03c1 = 7,850 kg/m\u00b3):\n- **TMT Rebars**: `W (kg/m) = D\u00b2 / 162.2` (where D is diameter in mm).\n- **Flat Bars (Patti)**: `W (kg/m) = Width (mm) \u00d7 Thickness (mm) \u00d7 0.00785`.\n- **MS Plates**: `Total Weight (kg) = Length (m) \u00d7 Width (m) \u00d7 Thickness (mm) \u00d7 7.85`.\n- **Equal Angles (ISA)**: `W (kg/m) = (2A - t) \u00d7 t \u00d7 0.00785` (where A is leg size, t is thickness).\n- **Unequal Angles**: `W (kg/m) = (A + B - t) \u00d7 t \u00d7 0.00785`.\n- **Square Hollow Section (SHS)**: `W (kg/m) = 4 \u00d7 (Side - t) \u00d7 t \u00d7 0.00785`.\n- **Rectangular Hollow Section (RHS)**: `W (kg/m) = 2 \u00d7 (Width + Height - 2t) \u00d7 t \u00d7 0.00785`.\n- **Circular Pipes**: `W (kg/m) = (OD - t) \u00d7 t \u00d7 0.02466`."
    },
    {
      "title": "TMT Rebar Grades & BIS Applications",
      "content": "- **Fe 415**: Older standard, suitable for small residential single-story homes and non-critical RCC elements.\n- **Fe 500 / Fe 500D**: The standard benchmark in modern Indian construction. 'Fe 500D' provides high ductility (min 16% elongation) engineered to absorb seismic energy during earthquakes (IS 13920 compliant).\n- **Fe 550 / Fe 550D**: High-tensile steel designed for multi-story towers, bridge piers, flyovers, and heavy industrial slabs.\n- **Fe 600**: Ultra-high-strength steel used in large dams, marine retaining walls, expressways, and mega-infrastructure.\n- **CRS (Corrosion Resistant Steel)**: Copper and chromium alloyed rebars suited for coastal areas, ports, and high-salinity groundwater zones."
    }
  ]
},
  {
  "id": "ColumnDesignCalculator",
  "slug": "column-design-calculator",
  "name": "Column Design Calculator",
  "category": "civil",
  "shortDescription": "Estimate concrete volume, main rebar weights, and column casing shuttering area.",
  "metaDescription": "Free online Column Design Calculator. Estimate concrete, vertical steel bars, stirrups, and shuttering area for building columns.",
  "keywords": [
    "Column Design Calculator",
    "column concrete steel calculator",
    "column stirrups estimator",
    "vertical rebar calculator",
    "IS 456 column design"
  ],
  "icon": "Hammer",
  "howToUse": [
    "Enter column width, depth, and height.",
    "Select the vertical rebar count and rebar diameter.",
    "Enter stirrup diameter and tie spacing.",
    "View structural quantities and cost estimates."
  ],
  "faqs": [
    {
      "question": "What is the minimum steel percentage in columns?",
      "answer": "Under IS 456, vertical reinforcement in columns must be at least 0.8% of the total cross-sectional area."
    },
    {
      "question": "What spacing is standard for lateral ties (stirrups)?",
      "answer": "Stirrups are typically spaced at 100mm near beam-column joints, and 150mm in mid-spans."
    }
  ],
  "sections": [
    {
      "title": "Structural Columns Design Criteria",
      "content": "Columns are primary vertical members that transfer compression loads down to footings. Design factors include axial loads, buckling ratios, concrete cover protection (minimum 40mm), and lateral confinement ties."
    },
    {
      "title": "Minimum Rebar Standards",
      "content": "- Rectangular columns require a minimum of 4 longitudinal bars.\n- Circular columns require a minimum of 6 longitudinal bars.\n- Minimum bar diameter should not be less than 12mm."
    }
  ]
},
  {
  "id": "SlabCalculator",
  "slug": "slab-calculator",
  "name": "Slab Calculator",
  "category": "civil",
  "shortDescription": "Calculate concrete volume, reinforcement grids, and estimated billing costs for slabs.",
  "metaDescription": "Online Concrete Slab Calculator. Calculate concrete, reinforcement steel meshes, formwork, and billing for G+0/G+1 slabs.",
  "keywords": [
    "Slab Calculator",
    "roof slab concrete calculator",
    "slab reinforcement steel weight",
    "concrete slab estimator",
    "IS 456 slab cover"
  ],
  "icon": "Hammer",
  "howToUse": [
    "Enter the length, width, and thickness of the slab.",
    "Enter rebar spacing and bar diameter to estimate reinforcement weight.",
    "Input standard material prices to view the billing report."
  ],
  "faqs": [
    {
      "question": "What is the standard thickness of a residential roof slab?",
      "answer": "Residential building slabs are commonly designed with a thickness of 5 inches (125mm) or 6 inches (150mm)."
    },
    {
      "question": "What is clear cover for slabs?",
      "answer": "Standard clear cover for concrete slabs is 15mm to 20mm to protect reinforcement steel mesh from rusting."
    }
  ],
  "sections": [
    {
      "title": "Slab Concrete Volume calculations",
      "content": "Concrete volume is a direct cubic dimension calculation:\nVolume = Length × Width × Thickness\nDry materials are then estimated using the M20 or M25 dry volume coefficient of 1.54."
    },
    {
      "title": "Slab Reinforcement Grid specifications",
      "content": "Main reinforcement bars are laid along the shorter span, while distribution reinforcement is laid along the longer span. Standard residential rebar spacings range from 100mm to 150mm center-to-center."
    }
  ]
},
  {
  "id": "FoundationCalculator",
  "slug": "foundation-calculator",
  "name": "Foundation Calculator",
  "category": "civil",
  "shortDescription": "Calculate excavation soil volumes, PCC mud-mat concrete, and structural RCC footing quantities.",
  "metaDescription": "Free online Foundation Calculator. Calculate soil excavation pit volumes, sand filling, PCC beds, and RCC column footings.",
  "keywords": [
    "Foundation Calculator",
    "footing concrete calculator",
    "soil excavation calculator",
    "PCC mud-mat calculator",
    "isolated footing design"
  ],
  "icon": "Hammer",
  "howToUse": [
    "Enter the footing length, width, and excavation depth.",
    "Specify sand filling thickness and PCC bed thickness.",
    "Input the RCC footing pad dimensions.",
    "Select rebar configurations to view excavation, concrete, and steel results."
  ],
  "faqs": [
    {
      "question": "What is PCC in foundations?",
      "answer": "PCC stands for Plain Cement Concrete. A thin layer of PCC (usually M10 mix, 3-4 inches thick) is laid at the bottom of excavation pits to create a clean base for steel footings."
    },
    {
      "question": "What depth is safe for residential footings?",
      "answer": "Safe isolated footing excavation depths depend on soil bearing capacity, but a minimum of 4 to 5 feet is standard for residential houses."
    }
  ],
  "sections": [
    {
      "title": "Excavation soil volume calculations",
      "content": "Soil excavation volume is computed based on pit footprint dimensions:\nExcavation Volume = Length × Width × Depth\nWe add a 10% volume allowance for manual sloped excavation or machinery errors."
    },
    {
      "title": "PCC Base Foundations & Footings",
      "content": "- **Sand Bedding**: Standard 3-inch thick compacted sand bed is laid first to absorb moisture.\n- **PCC Bed**: 3-inch M10 concrete mix is laid next.\n- **RCC Pad**: The main reinforced footing pad (typically 12\" thickness) is poured on top."
    }
  ]
},
  {
    "id": "FARFSICalculator",
    "slug": "far-fsi-calculator",
    "name": "FAR / FSI Calculator",
    "category": "architecture",
    "subcategory": "Area & Space Planning",
    "shortDescription": "Calculate Floor Area Ratio (FAR) and Floor Space Index (FSI), permissible built-up area, ground coverage limits, and floor plans.",
    "metaTitle": "FSI Calculator India – Pune (PMC/PCMC), Mumbai DCR & Bangalore Built-Up Area",
    "metaDescription": "Free online FSI & FAR Calculator for India. Calculate permissible built-up area, ground coverage, road width rules & setbacks for Pune (PMC/PCMC), Mumbai, Bangalore & Gujarat with instant PDF report.",
    "keywords": [
      "fsi calculator",
      "fsi calculation",
      "fsi calculator pune",
      "how to check fsi online",
      "pcmc fsi calculation pdf",
      "fsi calculation formula",
      "far calculator india",
      "fsi in mumbai",
      "FAR Calculator",
      "FSI Calculator",
      "FAR FSI Calculator",
      "How to calculate FSI",
      "FSI for residential building",
      "Built-up area calculator",
      "Permissible built-up area calculator",
      "Plot area FSI calculator",
      "Floor space index calculator",
      "Pune municipal corporation fsi rules",
      "UDCPR Maharashtra FSI calculation",
      "DCPR 2034 Mumbai FSI"
    ],
    "icon": "Compass",
    "howToUse": [
      "Choose calculation mode: Forward (Max Built-up) or Reverse (Required Plot, actual FSI, coverage).",
      "Select plot units (sq ft, sq m, bigha, cents, guntha, etc.) and enter plot details.",
      "Input permissible FSI/FAR ratio and ground coverage limit.",
      "Optionally toggle Professional Mode to add setbacks (front, rear, side) and road width constraints.",
      "Add floor-wise details in the Floor Area Planner to audit your utilization percentage.",
      "Compare up to 3 building layouts side-by-side or download your planning report as a PDF."
    ],
    "faqs": [
      {
        "question": "What is FSI?",
        "answer": "FSI stands for Floor Space Index. It represents the ratio of the total built-up floor area across all levels of a building to the total area of the plot it stands on."
      },
      {
        "question": "What is FAR?",
        "answer": "FAR stands for Floor Area Ratio. It is mathematically identical to FSI, but is sometimes expressed as a percentage instead of a decimal. For example, an FSI of 2.0 corresponds to a FAR of 200%."
      },
      {
        "question": "What is the difference between FAR and FSI?",
        "answer": "There is no mathematical difference. FSI is widely used in cities like Mumbai, Chennai, and Bengaluru as a decimal ratio (e.g., 2.5), whereas FAR is used in Delhi and northern regions as a percentage (e.g., 250%)."
      },
      {
        "question": "How is FSI calculated?",
        "answer": "FSI is calculated using the formula: FSI = Total Built-up Area / Plot Area. For instance, a 1,000 sq ft building on a 1,000 sq ft plot has an FSI of 1.0."
      },
      {
        "question": "How is FAR calculated?",
        "answer": "FAR is calculated using the formula: FAR = (Total Floor Area / Plot Area) × 100. A 2,000 sq ft building on a 1,000 sq ft plot has a FAR of 200%."
      },
      {
        "question": "How do I calculate permissible built-up area?",
        "answer": "Permissible Built-up Area = Plot Area × Permissible FSI. If your plot is 3,000 sq ft and the FSI is 1.5, you can construct a maximum of 4,500 sq ft gross floor area."
      },
      {
        "question": "How much can I build on a 1,000 sq ft plot?",
        "answer": "It depends on the permissible local FSI. If the FSI is 2.0, you can build up to 2,000 sq ft total floor area, distributed across multiple floors depending on ground coverage and setbacks."
      },
      {
        "question": "Does FSI include all floor areas?",
        "answer": "No. Most municipal bylaws exclude specific areas from FSI calculations, such as basements used for parking, open balconies, lift shafts, staircases, and fire escape pathways."
      },
      {
        "question": "What is the relationship between FSI and ground coverage?",
        "answer": "Ground coverage limits the footprint of the ground floor, while FSI controls the total building volume. For example, on a 2,000 sq ft plot with 50% coverage and FSI 2.0, the ground footprint cannot exceed 1,000 sq ft, and you can build 4 floors of 1,000 sq ft each to reach the 4,000 sq ft limit."
      },
      {
        "question": "Does higher FSI mean more floors?",
        "answer": "Yes, usually. A higher FSI allows you to build more total space, which requires stacking more floors if your ground coverage is limited by setbacks."
      },
      {
        "question": "Does FSI determine building height?",
        "answer": "FSI limits total volume, but building height is also governed by other bylaws, such as the width of the fronting road, set back margins, and airport boundary restrictions."
      },
      {
        "question": "Does road width affect permissible development?",
        "answer": "Yes. Most cities correlate permissible FSI with road width to prevent traffic congestion. Wider roads are generally allowed higher FSI (often through premium purchased FSI)."
      },
      {
        "question": "Does FSI vary by location?",
        "answer": "Yes, FSI varies significantly across cities, states, and zones. Core commercial zones have much higher FSI compared to residential suburbs or heritage zones."
      },
      {
        "question": "Does residential FSI differ from commercial FSI?",
        "answer": "Yes. Commercial buildings typically receive higher FSI allocations because they accommodate higher business densities, though they also require greater parking clearances."
      },
      {
        "question": "How do I calculate FSI in Pune (PMC & PCMC)?",
        "answer": "Under the Maharashtra Unified Development Control and Promotion Regulations (UDCPR), FSI in Pune Municipal Corporation (PMC) and Pimpri-Chinchwad (PCMC) is governed by road width: Road width 9m to 12m allows Base FSI of 1.10 + Premium FSI 0.30 + TDR up to 0.40 (Total max 1.80 to 2.0). Roads 12m to 15m allow total FSI up to 2.20; roads 18m to 24m allow up to 2.60; and roads 30m+ allow up to 3.00 for transit corridors."
      },
      {
        "question": "How to check permissible FSI online in India?",
        "answer": "To check permissible FSI online: 1) Verify your plot's zone (Residential R1/R2, Commercial, Industrial) on your local authority's Development Plan (DP) / Master Plan portal (such as PMC AutoDCR, MCGM DCPR, or BBMP Online); 2) Note the registered road width in front of your property; 3) Use this tool to enter your plot area and road width to compute permissible Base FSI, Premium FSI purchase limits, and maximum buildable area."
      },
      {
        "question": "What is the PCMC FSI calculation formula as per UDCPR?",
        "answer": "In PCMC, Permissible Built-Up Area = Net Plot Area × (Base FSI + Premium FSI + TDR Potential + Ancillary FSI). Base FSI is standard (typically 1.10 for residential non-congested), Premium FSI can be purchased from PCMC at ready reckoner rates, and TDR (Transferable Development Rights) can be loaded onto the plot subject to road width ceilings."
      },
      {
        "question": "What is the difference between Base FSI, Premium FSI, and TDR?",
        "answer": "• Base FSI: The automatic, free entitlement of built-up area granted to the plot.\n• Premium FSI: Additional buildable area purchased directly from the municipal corporation at 35%–50% of the land Ready Reckoner rate.\n• TDR (Transferable Development Rights): Certificates issued to landowners who surrendered land for road widening or public reservations, which can be purchased on the open market and utilized to build additional floors."
      }
    ],
    "sections": [
      {
        "title": "What is Floor Area Ratio (FAR) & Floor Space Index (FSI)?",
        "content": "Floor Area Ratio (FAR) and Floor Space Index (FSI) are town planning density limits that determine the maximum buildable floor area allowed on a piece of land. Mathematically, FSI is a decimal ratio (e.g., 1.5, 2.5) while FAR is represented as a percentage (e.g., 150%, 250%). For example, an FSI of 2.0 (or 200% FAR) on a 2,000 sq ft plot allows you to construct a maximum of 4,000 sq ft of total built-up area across all floor levels combined."
      },
      {
        "title": "FSI & FAR Formula",
        "content": "The mathematical equations governing FSI are simple and direct:\n\n• Floor Space Index (FSI) = Total Built-up Area / Plot Area\n• Floor Area Ratio (FAR) = (Total Built-up Area / Plot Area) × 100\n• Permissible Built-up Area = Plot Area × Permissible FSI\n• Required Plot Area = Desired Floor Area / Permissible FSI"
      },
      {
        "title": "FSI and Ground Coverage Relationship",
        "content": "Ground coverage restricts the horizontal footprint of the building on the soil, while FSI controls the vertical volume. For instance, on a 5,000 sq ft plot with 40% ground coverage (2,000 sq ft maximum footprint) and an FSI of 2.0 (10,000 sq ft total permissible area), the ground floor footprint cannot exceed 2,000 sq ft. To fully utilize the 10,000 sq ft construction potential, you would stack five identical floor levels of 2,000 sq ft each."
      },
      {
        "title": "Step-by-Step FSI Area Calculation Example",
        "content": "Let's calculate the permissible building potential for a typical residential plot in India:\n\n1. Plot Dimensions: 40 ft width by 60 ft depth = 2,400 sq ft plot area.\n2. Permissible FSI: 1.75 (from local municipal bye-laws).\n3. Maximum Ground Coverage: 50% (allows a 1,200 sq ft footprint).\n4. Total Permissible Built-up Area = 2,400 sq ft × 1.75 = 4,200 sq ft.\n5. Floor Plan Strategy:\n   - Ground Floor: 1,200 sq ft (utilizing full coverage)\n   - First Floor: 1,200 sq ft\n   - Second Floor: 1,200 sq ft\n   - Third Floor: 600 sq ft (remaining FSI capacity)\n   - Total Built-up: 4,200 sq ft (Exactly utilizing FSI limit)"
      },
      {
        "title": "FSI Exclusions: What is Exempted from FSI?",
        "content": "Not all constructed spaces count toward your permissible FSI. Under most Indian municipal rules (like MCGM DCPR 2034 or BBMP bye-laws), the following areas are usually 'Free of FSI' (excluded):\n\n• Basement areas used exclusively for car parking or installation of machinery/utilities.\n• Open-to-sky balconies, terraces, and ventilation shafts.\n• Staircase cabins, lift shafts, and common lift lobbies.\n• Stilt parking floors left open to the elements.\n• Fire escape staircases and refuge areas."
      },
      {
        "title": "Gross Plot Area vs. Net Plot Area (Road Widening)",
        "content": "FSI calculations are always based on the Net Plot Area, not the gross land area. If a portion of your plot is zoned for municipal road widening, public amenity reservations, or green belt setback dedication, that area must be deducted first. Permissible built-up area is then calculated using the remaining net plot size, though some authorities offer Compensatory FSI or Transferable Development Rights (TDR) for the surrendered land."
      }
    ]
  },
  {
    "id": "StaircaseCalculator",
    "slug": "staircase-calculator",
    "name": "Staircase Calculator",
    "category": "architecture",
    "subcategory": "Building Design",
    "shortDescription": "Universal Staircase & Structural Studio. Calculate exact risers, treads, total run, pitch slope, headroom clearance, NBC 2016 / IRC compliance, carpenter cut-lists, and RCC/timber material BOQ.",
    "metaTitle": "Staircase Calculator | Riser, Tread, Pitch & BOQ Estimator",
    "metaDescription": "Free online Staircase Calculator & Blueprint Studio. Calculate riser height, tread depth, stair run, pitch angle, headroom, NBC 2016 / IRC code compliance, carpenter cut schedule, and concrete/timber BOQ.",
    "keywords": [
      "staircase calculator",
      "stair riser and tread calculator",
      "stair dimensions calculator",
      "stairs calculator online",
      "comfortable stair riser height",
      "stair angle pitch estimator",
      "stair run calculator",
      "blondel comfort formula calculator",
      "nbc 2016 staircase rules india",
      "irc stair building code calculator",
      "dog legged staircase calculator",
      "spiral staircase calculator",
      "staircase concrete volume calculator",
      "carpenter stair stringer layout calculator"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your unit system: Millimeters (mm), Centimeters (cm), Meters (m), Inches (in), or Feet (ft).",
      "Choose your staircase configuration: Straight Flight, L-Shaped (90° turn), Dog-Legged U-Shape (180° turn), or Spiral Helical Stair.",
      "Input total floor-to-floor rise height, target riser height, and target tread depth.",
      "Specify staircase clear width, floor opening length (well cutout), and slab thickness for live continuous headroom clearance checks.",
      "Inspect the live 2D Architectural SVG Elevation Blueprint with interactive step callouts and pitch angle arcs.",
      "Review the Building Code Compliance Audit against NBC 2016 (India), US IRC/IBC, or UK Part K.",
      "Access the Carpenter Cut-List schedule for stringer layout markings and bottom step drop deductions.",
      "Check the Bill of Quantities (BOQ) for RCC concrete volume, cement bags, rebar steel, formwork, and export to PDF/Excel."
    ],
    "faqs": [
      {
        "question": "What is Blondel's Rule of Comfort for staircases?",
        "answer": "Blondel's ergonomic formula states: 2 × Riser + Tread (2R + T) should equal 600 to 640 mm (24 to 25 inches), with 630 mm (24.5 in) being the ideal walking rhythm for human stride mechanics."
      },
      {
        "question": "What are the NBC 2016 (India) stair dimensions for residential and commercial buildings?",
        "answer": "Under NBC 2016 India: Residential buildings require a maximum riser of 190 mm, minimum tread of 250 mm, minimum clear width of 900 mm, and minimum headroom of 2200 mm. Public/Commercial buildings require a maximum riser of 150 mm, minimum tread of 300 mm, minimum clear width of 1500 mm, and max 12 risers per flight."
      },
      {
        "question": "Why is the bottom riser cut shorter by the tread thickness in timber stringers?",
        "answer": "When framing wood stringers, you must subtract the thickness of the tread plank from the bottom riser cut. This ensures that once the finished tread boards are installed, the first step height from the finished floor exactly matches every subsequent step."
      },
      {
        "question": "How is clear headroom clearance calculated?",
        "answer": "Headroom is the vertical distance measured from the imaginary line connecting stair step nosings up to the underside of the ceiling opening header beam. Building codes require a minimum continuous clearance of 2032 mm (80 inches / 6 ft 8 in) to 2200 mm."
      },
      {
        "question": "How do you calculate concrete volume for an RCC waist slab staircase?",
        "answer": "RCC staircase concrete volume = (Waist slab thickness × Stair Width × Incline Hypotenuse Length) + (Number of Risers × 0.5 × Riser × Tread × Width) + Landing slab volume. For an M20 nominal mix (1:1.5:3), each cubic meter requires approximately 8.4 cement bags (50kg), 0.425 m³ sand, 0.85 m³ 20mm aggregate, and ~105 kg of Fe500 steel rebar."
      }
    ],
    "sections": [
      {
        "title": "Staircase Ergonomics & Blondel's Comfort Formula",
        "content": "A well-designed staircase minimizes physical exertion and eliminates tripping hazards. In 1675, French architect François Blondel established the relationship between step rise (R) and tread going (T) based on the human walking step length (approx. 63 cm / 24.8 in):\n\n2R + T = 600 mm to 640 mm (24\" to 25\")\n\nWhen a staircase follows this ratio, climbing and descending feel natural without breaking human stride rhythm."
      },
      {
        "title": "Comparative Building Codes: NBC 2016 vs US IRC/IBC vs UK Part K",
        "content": "• **NBC 2016 (India Residential)**: Max Riser 190 mm, Min Tread 250 mm, Min Width 900 mm, Min Headroom 2200 mm.\n• **NBC 2016 (India Commercial/Public)**: Max Riser 150 mm, Min Tread 300 mm, Min Width 1500 mm, Max 12 risers per flight.\n• **US IRC 2024 (Residential)**: Max Riser 7 3/4\" (197 mm), Min Tread 10\" (254 mm), Min Width 36\" (914 mm), Min Headroom 80\" (2032 mm).\n• **US IBC 2024 (Commercial)**: Max Riser 7\" (178 mm), Min Tread 11\" (279 mm), Min Width 44\" (1118 mm).\n• **UK Approved Document K**: Private max riser 220 mm, min going 220 mm, max pitch 42°."
      },
      {
        "title": "Carpenter Stringer Framing & Cut-List Guidelines",
        "content": "To frame structural 2x12 lumber stringers:\n1. Lay out the framing square with the riser height on the tongue and tread depth on the body.\n2. Deduct the thickness of the tread material from the bottom of the stringer to prevent a tall first step.\n3. Verify the stringer throat (solid wood remaining under the notch) is at least 3.5 inches (90 mm) to withstand shear load.\n4. Secure top plumb cuts to structural header joists using approved metal joist hangers or bearing ledgers."
      }
    ]
  },
  {
    "id": "RoomAreaCalculator",
    "slug": "room-area-calculator",
    "name": "Room Area Calculator",
    "category": "architecture",
    "subcategory": "Area & Space Planning",
    "shortDescription": "Add multiple rooms to build a layout and calculate usable Carpet Area, Built-up Area, and Super Built-up Area with costs.",
    "metaTitle": "Room Area Calculator | RERA Carpet, Built-up & Super Built-up Studio",
    "metaDescription": "Calculate RERA Net Carpet Area, Built-Up Plinth Area, and Super Built-Up Saleable Area across multi-room apartment layouts. Computes property cost, usable carpet efficiency %, stamp duty, and interior fit-out budgets.",
    "keywords": [
      "room area calculator",
      "calculate room area square feet",
      "RERA carpet area calculator",
      "carpet area vs built up area",
      "super built up area calculator",
      "flat carpet area calculator",
      "2 bhk carpet area calculator",
      "3 bhk floor plan calculator",
      "builder loading percentage calculator",
      "property valuation by carpet area",
      "home interior fit out cost calculator"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your unit system: Feet (ft) or Meters (m).",
      "Choose a standard floor plan preset (1 BHK, 2 BHK, 3 BHK, 4 BHK, Villa) or click 'Add Room' to build a custom room layout.",
      "Assign each room its appropriate architectural classification: Living/Bed/Kitchen (Carpet), Bathroom/Toilet (Carpet), Balcony/Terrace (Built-up), Dry Utility (Built-up), or Passage/Foyer (Carpet).",
      "Enter the length and width dimensions for each room.",
      "Specify external wall thickness (4.5\", 6\", 9\", or 11\") and builder Common Loading Factor (typically 25% to 35%).",
      "Enter prevailing property rate per sq ft, interior fit-out rate, and stamp duty percentage.",
      "Inspect the live 2D Layout Schematic Plan and review the RERA Net Carpet, Plinth Built-Up, and Super Built-Up breakdown.",
      "Click 'Copy' or 'PDF Report' to export a formatted architectural area certificate."
    ],
    "faqs": [
      {
        "question": "What is the exact definition of RERA Carpet Area in India?",
        "answer": "Under the Real Estate (Regulation and Development) Act (RERA) 2016, 'Carpet Area' is defined as the net usable floor area of an apartment, excluding external walls, service shafts, private balconies, and exclusive open terraces, but INCLUDING internal partition walls. Builders in India are legally mandated to quote property prices based on RERA Carpet Area rather than ambiguous Super Built-Up areas."
      },
      {
        "question": "What is the difference between Carpet Area, Built-Up Area, and Super Built-Up Area?",
        "answer": "• Carpet Area: Usable floor space where you can spread a carpet (Bedrooms + Living + Kitchen + Bathrooms + Internal Walls).\n• Built-Up Area (Plinth Area): Carpet Area + External Wall Thickness (9\") + Attached Balconies & Verandahs (typically 10% to 15% larger than carpet area).\n• Super Built-Up Area (Saleable Area): Built-Up Area + Proportionate share of common building amenities (Lobbies, Lift Wells, Staircases, Clubhouse, Corridors, Security Room) via the loading factor (typically 25% to 35% larger than built-up area)."
      },
      {
        "question": "What is the Builder Loading Factor and how is it calculated?",
        "answer": "Loading factor represents the percentage markup added by developers to the built-up area to account for shared common spaces. Formula: Super Built-up Area = Built-up Area × (1 + Loading%/100). For example, if a 2 BHK has a built-up area of 800 sq ft and loading is 30%, the Super Built-Up Area is 800 × 1.30 = 1,040 sq ft."
      },
      {
        "question": "What is Carpet Space Efficiency and what is considered a healthy ratio?",
        "answer": "Carpet Space Efficiency is the ratio of Net Usable Carpet Area to Super Built-Up Area: Efficiency % = (Carpet Area / Super Built-Up Area) × 100. In high-rise residential towers: • 70% to 75% is considered Excellent efficiency. • 65% to 70% is Normal/Average. • Below 60% indicates excessive common loading and wasted saleable cost."
      },
      {
        "question": "Why does Effective Carpet Rate differ from the Builder Quoted Rate?",
        "answer": "Builders quote property prices on Super Built-Up Area (e.g., ₹6,000/sq ft on 1,000 sq ft Super = ₹60 Lakhs). However, if the actual usable carpet area is only 700 sq ft, the true Effective Carpet Rate paid per usable square foot is ₹60 Lakhs / 700 sq ft = ₹8,571/sq ft."
      },
      {
        "question": "Are private balconies and utility areas included in RERA Carpet Area?",
        "answer": "No. Under RERA guidelines, external open balconies, verandahs, dry utility wash yards, and private open terraces are strictly excluded from the Carpet Area calculation and must be disclosed separately under Built-Up / Balcony area in official builder agreement floor plans."
      }
    ],
    "sections": [
      {
        "title": "Architectural Formula Guide: RERA Area Standards & NBC 2016",
        "content": "When auditing real estate floor plans:\n\n• **RERA Net Carpet:** $\\sum (\\text{Length} \\times \\text{Width})_\\text{Habitable} + \\sum (\\text{Length} \\times \\text{Width})_\\text{Toilets} + \\text{Internal Partitions}$\n• **Wall Area Factor:** $(\\text{Perimeter} / 2) \\times \\text{Wall Thickness}$\n• **Built-Up Area:** $\\text{Carpet Area} + \\text{Balconies} + \\text{Utilities} + \\text{Wall Area}$\n• **Super Built-Up Area:** $\\text{Built-Up Area} \\times (1 + \\text{Loading \\%})$\n• **Space Efficiency Index:** $(\\text{Carpet Area} / \\text{Super Built-Up Area}) \\times 100$"
      },
      {
        "title": "Turnkey Interior Fit-out Budgeting Benchmarks",
        "content": "Interior fit-out budgets are always calculated on the Net Usable Carpet Area:\n\n• **Essential / Rental Fit-Out (₹800 - ₹1,000/sq ft):** Basic modular kitchen, laminate wardrobes in bedrooms, basic LED electricals, and paint.\n• **Premium Residential Fit-Out (₹1,300 - ₹1,800/sq ft):** Acrylic/PU modular kitchen, sliding wardrobes with lofts, false ceilings with cove lights, and wallpaper/texture accents.\n• **Luxury Architectural Fit-Out (₹2,200 - ₹3,500/sq ft):** Veneer/Duco carpentry, Italian marble flooring, automated smart home lighting, designer bathrooms, and custom acoustic paneling."
      }
    ]
  },
  {
  "id": "CarpetAreaCalculator",
  "slug": "carpet-area-calculator",
  "name": "Carpet Area Calculator",
  "category": "architecture",
  "subcategory": "Area & Space Planning",
  "shortDescription": "Convert between RERA Carpet, Built-up, and Super Built-up areas using standard ratios, wall thickness, and loading factors.",
  "metaTitle": "Carpet Area Calculator: RERA Carpet, Built-up & Super Built-up Formula",
  "metaDescription": "Calculate RERA Carpet Area, Built-up Area & Super Built-up Area online. Convert flat square feet with standard Indian loading factors (15%-35%), wall thickness, and instant formula breakdown.",
  "keywords": [
    "carpet area calculator",
    "rera carpet area calculator",
    "built up area to carpet area calculator",
    "super built up area calculator",
    "rera carpet area calculation formula",
    "calculate carpet area of flat",
    "apartment loading factor calculator",
    "convert super built up to carpet",
    "built up area to super built up area",
    "rera carpet area definition",
    "loading percentage in flat calculation",
    "carpet area formula india",
    "built up area converter"
  ],
  "icon": "Compass",
  "howToUse": [
    "Select your known starting area parameter: RERA Carpet Area, Plinth Built-Up Area, or Saleable Super Built-Up Area.",
    "Input your apartment floor area in Square Feet (sq ft) or Square Meters (sq m).",
    "Set local builder loading percentage (typically 20% to 35% in Indian metro high-rises).",
    "Configure wall thickness allowance (5% to 8%) and balcony / utility terrace deduction percentage.",
    "Inspect the interactive area distribution pie chart, space efficiency ratio, and true cost per usable carpet square foot.",
    "Download a certified PDF Area Audit Report or copy the breakdown to share with builders or property buyers."
  ],
  "faqs": [
    {
      "question": "What is the difference between RERA Carpet Area, Built-Up Area, and Super Built-Up Area?",
      "answer": "• Carpet Area: Net usable floor area within walls where a carpet can be laid. Under RERA 2016, internal partition walls are included, while external walls, service shafts, and balconies are excluded.\n• Built-Up Area: Carpet Area + External Walls + Attached Balconies and Verandahs (typically 10%–15% larger than carpet area).\n• Super Built-Up Area (Saleable Area): Built-Up Area + Proportionate share of common spaces (lift lobbies, staircases, clubhouse, security cabin) loaded by 20%–35%."
    },
    {
      "question": "How do you calculate RERA Carpet Area from Super Built-up Area?",
      "answer": "To convert Super Built-up to Carpet Area: 1) Divide Super Built-up by (1 + Loading%/100) to obtain Built-Up Area. For example, 1,200 sq ft with 25% loading = 1,200 / 1.25 = 960 sq ft Built-Up. 2) Subtract external walls (~6%) and private balconies (~10%) to find RERA Carpet Area (\u2248 800 sq ft)."
    },
    {
      "question": "What is a normal builder loading factor percentage in Indian apartments?",
      "answer": "In modern Indian residential complexes: Standard standalone apartments typically have 15% to 20% loading; High-rise towers with elevators and fire stairs have 25% to 30% loading; Luxury gated communities with expansive clubhouses, swimming pools, and podium landscapes can reach 30% to 38% loading."
    },
    {
      "question": "Are private balconies and dry utility areas included in RERA Carpet Area?",
      "answer": "No. Under Section 2(k) of the RERA Act 2016, open balconies, dry balconies, utility terraces, and verandahs are explicitly excluded from the Carpet Area definition. Builders must list balcony areas as a distinct, separate item in customer sale agreements."
    },
    {
      "question": "What is Carpet Space Efficiency and what is a healthy ratio?",
      "answer": "Carpet Space Efficiency = (RERA Carpet Area / Super Built-up Area) \u00d7 100. An efficiency of 70% to 75% is considered excellent in Indian high-rises. An efficiency of 65% to 70% is standard. If efficiency is below 60%, the developer is excessively loading common amenity space into the saleable price."
    }
  ],
  "sections": [
    {
      "title": "RERA Carpet Area Legal Definition (Real Estate Act 2016)",
      "content": "Section 2(k) of the Real Estate (Regulation and Development) Act, 2016 defines carpet area as:\n\n> 'The net usable floor area of an apartment, excluding the area covered by the external walls, areas under services shafts, exclusive balcony or verandah area and exclusive open terrace area, but includes the area covered by the internal partition walls of the apartment.'\n\nThis legal standard protects buyers from paying for non-habitable common spaces as private living area."
    },
    {
      "title": "Area Conversion Mathematical Formulas",
      "content": "• **Built-Up Area** = Carpet Area + External Walls + Balconies\n• **Super Built-Up Area** = Built-Up Area \u00d7 (1 + Loading Factor / 100)\n• **Carpet Area from Super Built-Up** \u2248 [Super Built-Up / (1 + Loading% / 100)] \u00d7 0.84\n• **Space Efficiency Index (%)** = (Carpet Area / Super Built-Up Area) \u00d7 100\n• **True Effective Carpet Price** = Total Apartment Cost / Net RERA Carpet Area"
    }
  ]
},
  {
  "id": "FloorTileCalculator",
  "slug": "floor-tile-calculator",
  "name": "Floor Tile Calculator",
  "category": "architecture",
  "subcategory": "Estimation",
  "shortDescription": "Calculate floor tile quantities, tile wastage buffers, and box quantities.",
  "metaDescription": "Online Floor Tile Calculator. Calculate vitrified, ceramic, or wooden floor tile counts, required boxes, and costs based on floor dimensions.",
  "keywords": [
    "Floor Tile Calculator",
    "how many tiles do I need",
    "floor tile box count",
    "vitrified tile count estimator",
    "floor area tiles"
  ],
  "icon": "Compass",
  "howToUse": [
    "Select unit mode: Imperial (ft/in) or Metric (m/cm).",
    "Input floor length and width.",
    "Select a standard tile preset size or set custom dimensions.",
    "Configure wastage buffers and box packing quantities to view material and cost outputs."
  ],
  "faqs": [
    {
      "question": "How many tiles are standard in a box?",
      "answer": "Standard 2x2 feet (60x60 cm) tiles typically come in boxes of 4, while larger 4x2 feet tiles come in boxes of 2."
    },
    {
      "question": "Why do I need a wastage buffer for tiles?",
      "answer": "Cutting tiles for borders, door frames, and corners generates waste. Standard guidelines recommend adding an 8% to 10% wastage buffer."
    }
  ],
  "sections": [
    {
      "title": "Tile count calculation guidelines",
      "content": "First, find the floor area (Length × Width). Then, divide the floor area by the surface area of a single tile. Finally, round up to the next integer and apply wastage buffers."
    },
    {
      "title": "Standard Tile Size references",
      "content": "- **Small Bathroom**: 1x1 ft (30x30 cm)\n- **Living/Bedroom**: 2x2 ft (60x60 cm) or 32x32 in (80x80 cm)\n- **Premium Large Vitrified**: 4x2 ft (120x60 cm)"
    }
  ]
},
  {
  "id": "PaintCalculator",
  "slug": "paint-calculator",
  "name": "Paint Calculator & Indian Brand Price Trends",
  "category": "architecture",
  "subcategory": "Estimation",
  "shortDescription": "Calculate wall and ceiling paint volumes in liters, undercoats BOQ, and track 5-year historical price trends for Asian Paints, Berger, Nerolac, Dulux & Indigo.",
  "metaDescription": "Free Indian Paint Calculator & Material Price Trends Studio. Calculate paint liters, wall putty, primer, can splits, and compare 5-year historical rates across top Indian paint brands.",
  "keywords": [
    "Paint Calculator",
    "Asian Paints price per liter",
    "Berger Paints cost estimator",
    "Nerolac Impressions HD cost",
    "Dulux Velvet Touch calculator",
    "Birla Opus paint price",
    "wall paint liters calculator India",
    "painting contractor BOQ rate",
    "acrylic putty primer calculator",
    "house painting cost per sq ft"
  ],
  "icon": "Compass",
  "howToUse": [
    "Choose your preferred Indian Paint Brand (Asian Paints, Berger, Kansai Nerolac, Dulux, Indigo Paints, Birla Opus) and product tier (Luxury, Mid-Range, Economy, Exterior).",
    "Select the surface preparation process: Fresh Plaster (2 Putty + 1 Primer + 2 Topcoat), Standard Repainting, or Heavy Damp Renovation.",
    "Add multiple rooms (Living Room, Master Bed, Kitchen, etc.) or set custom dimensions with door/window and wardrobe deductions.",
    "Inspect the Packaging Optimizer for exact 20L drum, 10L bucket, 4L can, 1L tin, and putty bag procurement combinations.",
    "Switch tabs to view 2D Room Elevation color swatches, 5-Year Historical Material Price Trends (2022–2026), or download the complete itemized Contractor BOQ PDF."
  ],
  "faqs": [
    {
      "question": "How much wall area does 1 liter of emulsion paint cover in India?",
      "answer": "For 2 coats of application on a primed surface: Luxury Emulsions (Royale, Silk Glamor, Velvet Touch) cover 130 to 140 sq ft/L. Standard/Mid-Range Emulsions (Apcolite, Easy Clean, Beauty Gold) cover 110 to 120 sq ft/L. Economy Distempers/Emulsions (Tractor, Bison, Promise) cover 85 to 95 sq ft/L."
    },
    {
      "question": "How much Wall Putty and Primer is required per square foot?",
      "answer": "For fresh unpainted plaster walls: 1 kg of Acrylic / White Cement Wall Putty covers approximately 12 to 14 sq ft for 2 full coats. 1 liter of Water-Thinnable Wall Primer covers approximately 130 to 145 sq ft for 1 sealing coat."
    },
    {
      "question": "What is the standard water dilution percentage for interior emulsion paints?",
      "answer": "Most standard acrylic and luxury emulsions require dilution of 35% to 40% clean potable water by volume (e.g. 350ml to 400ml water per 1 Liter of paint). Excessive dilution reduces film opacity and scrub resistance."
    },
    {
      "question": "How have Indian paint prices changed over the last 5 years (2022 to 2026)?",
      "answer": "Indian paint prices grew at a 5-year CAGR of 6.4% to 7.2% due to spikes in Titanium Dioxide (TiO₂) and crude-oil-derived monomer feedstock, before stabilizing in 2025–2026 with increased competitive capacity from new entrants like Birla Opus."
    },
    {
      "question": "What is the average painting labor rate per sq ft in Indian metro and Tier-2 cities?",
      "answer": "In 2026, complete fresh painting labor (scraping, 2 coats putty with machine sanding, 1 coat primer, and 2 finish coats) ranges from ₹12 to ₹16 per sq ft. Simple 2-coat repainting labor ranges from ₹8 to ₹11 per sq ft."
    }
  ],
  "sections": [
    {
      "title": "Architectural Paint Surface Area & Deduction Formula",
      "content": "Gross wall surface area for a room is calculated as:\n\n$$\\text{Wall Area} = 2 \\times (\\text{Length} + \\text{Width}) \\times \\text{Height}$$\n\nIf the ceiling is included, add $\\text{Ceiling Area} = \\text{Length} \\times \\text{Width}$. Standard Indian deductions applied:\n- **Standard Door (3 ft × 7 ft)**: $21\\text{ sq ft}$ ($1.95\\text{ m}^2$)\n- **Standard Window (4 ft × 4 ft)**: $16\\text{ sq ft}$ ($1.48\\text{ m}^2$)\n- **Net Paint Area** = $\\text{Gross Area} - \\sum \\text{Deductions}$."
    },
    {
      "title": "Top Indian Paint Brands Benchmark (2026 Rates)",
      "content": "- **Asian Paints**: Royale Luxury (₹630/L), Apcolite Premium (₹375/L), Tractor Emulsion (₹195/L), Apex Ultima (₹480/L)\n- **Berger Paints**: Silk Glamor (₹610/L), Easy Clean (₹365/L), Bison Emulsion (₹188/L), WeatherCoat (₹470/L)\n- **Kansai Nerolac**: Impressions HD (₹595/L), Beauty Gold (₹355/L), Beauty Smooth (₹180/L), Excel Mica (₹460/L)\n- **Dulux (AkzoNobel)**: Velvet Touch (₹620/L), SuperClean 3-in-1 (₹360/L), Promise (₹182/L), Weathershield (₹490/L)\n- **Indigo Paints**: Dirtproof & Waterproof (₹545/L), Bright Ceiling Coat (₹270/L), Acrylic Emulsion (₹190/L)\n- **Birla Opus**: Prime Luxury (₹580/L), One Interior (₹345/L), Style Emulsion (₹175/L)"
    },
    {
      "title": "Can Packaging Split & Procurement Optimization",
      "content": "Paints in India are packaged in 20L drums, 10L buckets, 4L cans, and 1L tins. Buying 20L master containers delivers a 14% to 18% savings compared to purchasing individual 1L or 4L tins. Our calculator automatically solves the most cost-effective packaging combination with a configurable 10% spill and touch-up margin."
    }
  ]
},
  {
  "id": "WallpaperCalculator",
  "slug": "wallpaper-calculator",
  "name": "Wallpaper Calculator",
  "category": "architecture",
  "subcategory": "Estimation",
  "shortDescription": "Calculate wallpaper rolls based on wall area and pattern match repeat margins.",
  "metaDescription": "Free online Wallpaper Calculator. Calculate standard rolls, pattern repeat margins, and total project costs based on wall size.",
  "keywords": [
    "Wallpaper Calculator",
    "wallpaper rolls estimator",
    "wallpaper roll size India",
    "pattern repeat wallpaper calculator",
    "wall decor calculator"
  ],
  "icon": "Compass",
  "howToUse": [
    "Enter wall width and wall height.",
    "Select roll size preset (Standard or Large Roll).",
    "Input the pattern repeat length (set to 0 for solid colors).",
    "View net rolls, wastage allowances, and total rolls needed."
  ],
  "faqs": [
    {
      "question": "What is the size of a standard wallpaper roll?",
      "answer": "A standard wallpaper roll is typically 33 feet (10m) long and 21 inches (53cm) wide, covering 57.42 square feet."
    },
    {
      "question": "What is pattern repeat?",
      "answer": "Pattern repeat is the vertical distance between identical design elements. Matching patterns side-by-side creates waste, requiring extra rolls."
    }
  ],
  "sections": [
    {
      "title": "Wall area measurements for Wallpaper",
      "content": "Measure the height and total horizontal width of the wall you want to paper. Area is calculated as Width × Height. Doors and windows are usually not subtracted because you need full strips to cut around them."
    },
    {
      "title": "Wallpaper roll dimensions reference",
      "content": "- **Standard Roll**: 33 ft × 21 in (10m x 53cm) = 57.4 sq ft / 5.3 sq m\n- **Double/Large Roll**: 33 ft × 41 in (10m x 106cm) = 112.5 sq ft / 10.6 sq m"
    }
  ]
},
  {
    "id": "FlooringCostCalculator",
    "slug": "flooring-cost-calculator",
    "name": "Flooring Cost Calculator",
    "category": "interior",
    "shortDescription": "Estimate material and labor costs for tiles, Indian marble, Italian marble, and wooden flooring.",
    "metaDescription": "Calculate flooring and tiling project costs in India. Estimate budgets for Vitrified tiles, GVT/PGVT, Indian marble, Italian marble, Granite, Hardwood, and SPC vinyl with tile box count, cement mortar, diamond polish, and labor BOQ.",
    "keywords": [
      "Flooring Cost Calculator",
      "flooring cost calculator india",
      "tile flooring cost per sq ft",
      "marble flooring installation cost",
      "italian marble cost per sq ft",
      "vitrified tile price calculator",
      "granite flooring cost",
      "wooden flooring cost india",
      "tile box calculator",
      "marble diamond polishing cost",
      "floor tiling labor rate"
    ],
    "icon": "Palette",
    "howToUse": [
      "Select your measurement unit: Sq. Feet or Sq. Meters.",
      "Choose your input mode: Enter Total Floor Carpet Area directly or use the Room-by-Room breakdown (Living Room, Master Bedroom, Kitchen, etc.).",
      "Pick your Flooring Material: Double-Charged Vitrified (2×2 ft), Large GVT/PGVT (4×2 ft), Ceramic Anti-Skid, Indian Marble, Italian Marble, Granite, Kota Stone, Laminate Wood, Engineered Hardwood, or SPC Vinyl.",
      "Select your Laying Pattern: Straight Grid (7% buffer), Brick Bond (10%), Diagonal 45° Diamond (14%), Herringbone/Chevron (16%), or Bookmatched Vein Slabs (18%).",
      "Toggle Wall Skirting (3 to 6 inches) and optional Old Floor Demolition & Debris Disposal.",
      "Inspect the live 2D Floor Pattern & Texture Visualizer.",
      "Review the Itemized Contractor Bill of Quantities (BOQ): Tile boxes to order, cement bags, adhesive, epoxy grout, laying labor, diamond polishing, and 18% GST.",
      "Click 'Copy' or 'PDF BOQ' to export a formatted project estimate."
    ],
    "faqs": [
      {
        "question": "How many tile boxes do I need to order for my flooring project?",
        "answer": "To calculate tile boxes: 1) Multiply room length by width to get Net Area. 2) Add wall skirting area (Perimeter × Skirting height in feet). 3) Add a cutting wastage buffer (7% to 10% for straight grid, 14% to 16% for diagonal/herringbone). 4) Divide Total Gross Area by the coverage per box (standard 2×2 ft vitrified tile box has 4 tiles = 16 sq ft). Always round up to the nearest whole box to avoid batch shade variations."
      },
      {
        "question": "What is the average flooring cost per square foot in India (Material + Labor)?",
        "answer": "Current 2026 market benchmarks:\n• Ceramic Floor Tiles: ₹70 to ₹90/sq ft\n• Double-Charged Vitrified Tiles (2×2 ft): ₹110 to ₹140/sq ft\n• Large Format Glazed Vitrified Tiles (4×2 ft GVT): ₹160 to ₹220/sq ft\n• Indian Marble (Makrana/Morwad + Polish): ₹220 to ₹320/sq ft\n• Italian Marble (Statuario/Dyna + 8-Stage Diamond Polish): ₹650 to ₹1,200/sq ft\n• Granite Flooring (Flamed/Polished): ₹240 to ₹320/sq ft\n• Laminate Wooden Flooring: ₹130 to ₹170/sq ft\n• Engineered Hardwood / Solid Oak: ₹380 to ₹550/sq ft"
      },
      {
        "question": "Why is Italian marble significantly more expensive to install than Indian marble or tiles?",
        "answer": "Italian marble is a delicate, calcium-rich natural stone prone to micro-fissures. It requires: 1) Reinforcement nylon mesh backing with epoxy resin. 2) Specialized high-grade white cement/mortar bedding to prevent yellowish discoloration. 3) Multi-stage diamond abrasive pad polishing (from 50 grit up to 3000 grit) followed by tin oxide crystallization for high mirror reflection. The specialized labor and polish alone cost ₹140 to ₹200/sq ft."
      },
      {
        "question": "What is the difference between Tile Adhesive and Cement Mortar bedding?",
        "answer": "Cement mortar (1:4 cement:sand mix, 1.5 to 2.0 inches thick) is traditionally used for thick natural stones (marble, granite, kota) to level uneven subfloors. Modern thin-set Tile Adhesive (polymer-modified cement glue, 3mm to 6mm thick) is used for vitrified and ceramic tiles because vitrified tiles have nearly zero porosity (<0.05% water absorption) and will not bond reliably with pure cement slurry."
      },
      {
        "question": "How much wastage should I account for different tile laying patterns?",
        "answer": "• Straight Parallel Grid: 5% to 8% (lowest cutting waste).\n• Brick-Bond / Staggered (Subway): 8% to 10%.\n• Diagonal 45-Degree Diamond Pattern: 12% to 15% (perimeter triangular cuts).\n• Herringbone / Chevron: 15% to 18% (45° mitred corner cuts).\n• Bookmatched Marble Slabs: 15% to 20% (aligning natural geological veins creates discarded slab borders)."
      },
      {
        "question": "How is wall skirting calculated for flooring projects?",
        "answer": "Wall skirting protects plaster walls from mop water and foot scuffs. It is calculated by measuring the total room perimeter in linear feet and multiplying by the skirting height (standard 4 inches = 0.33 ft). Skirting typically adds 10% to 15% extra tile material."
      }
    ],
    "sections": [
      {
        "title": "Comprehensive Material Selection & Durability Benchmark Guide",
        "content": "• **Vitrified Tiles (Double Charged / GVT):** Best choice for high-traffic living rooms and bedrooms. Stain-proof, scratch-resistant, and requires zero post-installation polishing.\n• **Anti-Skid Ceramic Tiles:** Mandatory for bathrooms, shower enclosures, and outdoor balconies (R10 to R11 slip rating).\n• **Indian Natural Marble:** Timeless natural stone that ages gracefully and stays naturally cool in tropical climates. Can be re-polished every 5 to 7 years.\n• **SPC (Stone Plastic Composite) Vinyl:** 100% waterproof rigid flooring with natural wood look, ideal for quick zero-mess renovation over existing old tiles."
      },
      {
        "title": "Civil Construction Consumables & Mortar Quantity Estimation",
        "content": "When planning raw materials for flooring laying:\n\n• **Tile Adhesive:** 1 bag of 20kg polymer adhesive covers approximately 40 to 50 sq ft with a 6mm notched trowel.\n• **Cement Mortar Bed:** For natural stone slabs, approximately 1 bag (50kg) of cement is required for every 35 to 40 sq ft of flooring at 1.5-inch bed depth.\n• **Epoxy Joint Grout:** 1 kg of dual-component epoxy grout fills approximately 80 to 120 sq ft of 2mm to 3mm tile joints."
      }
    ]
  },
  {
  "id": "FalseCeilingCalculator",
  "slug": "false-ceiling-calculator",
  "name": "False Ceiling Calculator & Lighting Studio",
  "category": "interior",
  "shortDescription": "Calculate POP, Gyproc Gypsum board, PVC panels, and WPC wooden louvers costs, cove lights, and labor.",
  "metaTitle": "False Ceiling Calculator: Gypsum & POP Cost, Material BOQ (Per Sq Ft)",
  "metaDescription": "Free online False Ceiling Calculator. Estimate material quantities (Gyproc Gypsum, POP, PVC), GI channel framing BOQ, LED cove lighting & cost per sq ft for Indian homes.",
  "keywords": [
    "false ceiling calculator",
    "false ceiling material calculator",
    "false ceiling cost calculator",
    "gypsum ceiling cost calculator per sq ft",
    "false ceiling channel calculation formula",
    "pop false ceiling calculator",
    "False Ceiling Calculator",
    "POP ceiling cost per sq ft",
    "Gyproc gypsum ceiling price India",
    "PVC ceiling panel calculator",
    "WPC wooden louver ceiling cost",
    "cove lighting cost estimator",
    "false ceiling contractor BOQ rate",
    "Armstrong 2x2 grid ceiling cost",
    "LED downlights false ceiling calculator"
  ],
  "icon": "Palette",
  "howToUse": [
    "Enter ceiling Length and Width dimensions for each room in Feet or Meters.",
    "Select your ceiling system: Saint-Gobain Gyproc Gypsum (12.5mm), Hand-Plastered POP, Waterproof PVC Panels, WPC Wooden Louvers, or Armstrong Grid Tiles.",
    "Choose design complexity: Minimalist Flat, Single Cove Tray (4–6\" drop), Double Floating Island, or Designer CNC Curves.",
    "Configure lighting requirements: LED Cove Strips (Rft), Recessed Downlights, COB Focus Spots, and Magnetic Profile Tracks.",
    "Inspect the 2D Ceiling Blueprint with live lighting simulation, review the Structural GI Hardware BOQ, or export a branded PDF Quote."
  ],
  "faqs": [
    {
      "question": "What is the price per square foot for false ceiling installation in India?",
      "answer": "In 2026, standard rates across Indian metros are: Gyproc Gypsum: ₹95 to ₹135/sq ft; Hand-Plastered POP: ₹115 to ₹165/sq ft; Waterproof PVC Panels: ₹75 to ₹105/sq ft; WPC / Wooden Louvers: ₹240 to ₹340/sq ft; Armstrong Grid: ₹65 to ₹90/sq ft. Step coves and multi-tier floating islands add 15% to 35% in vertical drop fascia."
    },
    {
      "question": "Which is better for home interiors: Gyproc Gypsum or Plaster of Paris (POP)?",
      "answer": "Gyproc Gypsum board (12.5mm) is the industry standard for fast, clean, and lightweight installation with precision seamless joints. POP (Plaster of Paris) is preferred when creating organic 3D curves, circular domes, intricate cornices, or heavy decorative floral moldings."
    },
    {
      "question": "How is LED cove lighting length and driver wattage calculated?",
      "answer": "Cove lighting is measured in Running Feet (Rft) along the perimeter of the dropped ceiling tray. For high-density 240 LED/m strips (~12W/m), a 150W constant-voltage SMPS power driver is required for every 45 to 55 running feet to prevent voltage drop and dimming."
    },
    {
      "question": "What structural GI channels are required for a standard Gypsum false ceiling?",
      "answer": "According to IS 2095 standards, a durable false ceiling requires 0.5mm Perimeter Channels fixed to side walls, 0.5mm Ceiling Sections spaced at 457mm (1.5 ft) center-to-center, 0.9mm Intermediate Channels at 1220mm (4 ft) c/c, and Ceiling Angles suspended from the concrete slab with 8mm metal rawl plugs."
    },
    {
      "question": "How many downlights are recommended for a room?",
      "answer": "A standard ambient illumination density requires 1 recessed LED downlight (9W to 12W) for every 20 to 25 square feet of ceiling area, supplemented by COB spotlights for wall grazing or art highlighting."
    }
  ],
  "sections": [
    {
      "title": "Architectural False Ceiling Dimension & Fascia Area Formulas",
      "content": "For a ceiling with room dimensions $\\text{Length} \\times \\text{Width}$:\n\n$$\\text{Flat Carpet Area} = \\text{Length} \\times \\text{Width}$$\n\n$$\\text{Perimeter} = 2 \\times (\\text{Length} + \\text{Width})$$\n\nVertical drop fascia additions:\n- **Flat Single Level**: $\\text{Effective Area} = \\text{Flat Area} \\times 1.0$\n- **Single Cove Tray (4\"–6\" drop)**: $\\text{Effective Area} = \\text{Flat Area} \\times 1.20$\n- **Floating Island Double Tier**: $\\text{Effective Area} = \\text{Flat Area} \\times 1.35$\n- **Designer CNC / Curves**: $\\text{Effective Area} = \\text{Flat Area} \\times 1.60$"
    },
    {
      "title": "Ceiling Material Systems Comparison (2026 Benchmarks)",
      "content": "- **Gyproc Gypsum Board (12.5mm)**: ₹105/sq ft | 10-Yr Warranty | Smooth seamless joint paste & paper tape\n- **POP Hand-Troweled Plaster**: ₹130/sq ft | 15-Yr Warranty | Chicken mesh & 3-stage hand plaster\n- **Waterproof PVC Panels**: ₹85/sq ft | 10-Yr Warranty | Tongue & groove waterproof planks (Zero paint)\n- **WPC Wooden Louvers**: ₹260/sq ft | 15-Yr Warranty | High-density acoustic luxury woodgrain flutes\n- **Armstrong 2×2 Grid**: ₹75/sq ft | 8-Yr Warranty | T-grid suspension for commercial spaces\n- **Aluminium Linear Baffle**: ₹380/sq ft | 20-Yr Warranty | Powder-coated linear architectural baffles"
    },
    {
      "title": "Structural GI Framing & Suspension Rules (IS 2095 / IS 2542)",
      "content": "To prevent sagging and hairline joint cracks:\n- **Perimeter Channels (0.5mm)** fixed with rawl plugs at 610mm intervals along walls.\n- **Ceiling Sections (0.5mm)** spaced at 457mm c/c.\n- **Intermediate Channels (0.9mm)** spaced at 1220mm c/c.\n- **Connecting Clips & Drywall Screws (25mm/35mm)** spaced at 200mm along board edges.\n- **Joint Compound**: Applied in 3 expanding coats with 50mm fiber/paper joint tape."
    }
  ]
},
  {
    "id": "ModularKitchenCostCalculator",
    "slug": "modular-kitchen-cost-calculator",
    "name": "Modular Kitchen Cost Calculator",
    "category": "interior",
    "shortDescription": "Estimate modular kitchen prices based on layouts, finishes, countertops, and lofts.",
    "metaDescription": "Calculate modular kitchen costs in India (2026). Estimate budgets for L-Shape, Parallel, Straight, U-Shape, and Island layouts with BWP Marine Ply, High-Gloss Acrylic, Quartz Countertops, Hettich/Blum Tandem hardware, smart organizers, and 2D architectural elevation studio.",
    "keywords": [
      "Modular Kitchen Cost Calculator",
      "L shape kitchen cost per sq ft india",
      "acrylic modular kitchen price per running foot",
      "parallel kitchen design cost estimator",
      "BWP marine ply kitchen carcass price",
      "hettich tandem box drawer cost",
      "blum aventos lift up price india",
      "quartz countertop price per sq ft",
      "modular kitchen boq quotation",
      "island kitchen cost calculator india",
      "modular kitchen budget planner"
    ],
    "icon": "Utensils",
    "howToUse": [
      "Select your measurement unit: Feet (ft) or Meters (m).",
      "Choose a quick preset or select your kitchen layout shape: Straight Line, L-Shaped, Parallel (Galley), U-Shaped, or Island Kitchen.",
      "Enter exact counter wall lengths, island dimensions, overhead loft height, and tall pantry tower count (2ft × 7ft).",
      "Choose your Carcass Core Board: BWP Marine Ply (IS:710 100% Waterproof), HDHMR (Action TESA 850+ kg/m³), BWR Ply (IS:303), or SS 304 Stainless Steel.",
      "Select Shutter Facade Finish: Matte Laminate, High-Gloss Acrylic, Anti-Fingerprint Super Matte (FENIX), Seamless Membrane, Natural Veneer + PU, PU Duco Paint, Tinted Fluted Glass, or Sintered Porcelain.",
      "Pick your Countertop Slab: Jet Black Granite, Engineered Quartz (KalingaStone), Nano White G5, Sintered Porcelain Stone (Dekton), or Corian Solid Surface.",
      "Select Motion Hardware Brand: Standard Soft-Close (Ebco/Godrej), Premium German Tandem Box (Hettich InnoTech/Hafele), or Luxury Austrian Motion (Blum LEGRABOX/Aventos).",
      "Configure Smart Internal Organizers: Tandem drawers, bottle spice pullouts, blind corner solutions (LeMans/Magic Corner), tall larder swing-outs, under-sink organizers, and under-cabinet warm LED task lighting.",
      "Add optional Built-in Appliances & Sanitary fixtures (Auto-clean Chimney, Brass Hob, Quartz/SS Sink, Built-in Oven, Dishwasher).",
      "Inspect the live 2D Architectural Elevation Studio with theme customization and LED warm glow simulation, then download your itemized PDF Quote or 1-Click WhatsApp BOQ summary."
    ],
    "faqs": [
      {
        "question": "How is modular kitchen cost calculated per running foot vs square foot in India?",
        "answer": "In India, modular kitchens are quoted either per Running Foot (Rft) or per Square Foot of woodwork surface area:\n• **Running Foot (Rft)**: Measures linear length along the kitchen counter (combining base cabinets, countertop, and standard overhead wall cabinets). Standard laminate packages average ₹1,800 to ₹2,400/Rft, while premium acrylic/quartz packages range from ₹3,200 to ₹5,000/Rft.\n• **Square Foot (Sq Ft)**: Measures actual facade area of carcass boxes (Base Cabinets ~34\" ht + Wall Units ~30\" ht + Lofts ~24\" ht + Tall Towers ~84\" ht). Rates range from ₹1,400 to ₹3,500/sq ft depending on core board and shutter finish."
      },
      {
        "question": "Which carcass plywood is best for modular kitchens: BWP Marine Ply or HDHMR?",
        "answer": "• **BWP Marine Ply (IS:710)**: The ultimate gold standard for Indian wet cooking and washing zones. It is 100% boiling waterproof, chemically treated against borers/termites, and highly recommended for the sink base unit, under-counter drawer boxes, and dishwasher housing.\n• **HDHMR (High-Density High Moisture Resistance)**: Exceptional uniform density (850+ kg/m³), zero core gaps, superior screw holding, and 100% termite proof. It is ideal for dry cooking counters, wall units, and overhead lofts at ~10% to 15% lower cost than BWP ply."
      },
      {
        "question": "What is the difference between Acrylic, High-Pressure Laminate, and PU Duco Paint finishes?",
        "answer": "• **Laminate (1.0mm)**: Highly cost-effective, scratch resistant, heat resistant, and easy to clean. Available in matte, textured, and high-gloss.\n• **High-Gloss Acrylic (1.5mm–2.0mm)**: Ultra-smooth mirror-like reflective finish, UV-stable (never yellows), and provides a high-end European aesthetic.\n• **PU Duco Paint**: 7-layer Italian spray finish with seamless edge-less monolithic beauty in high gloss or satin matte, representing luxury bespoke cabinetry."
      },
      {
        "question": "Which kitchen countertop is best: Granite, Engineered Quartz, or Sintered Porcelain Stone?",
        "answer": "• **Jet Black Granite (18-20mm)**: Indian kitchen workhorse (₹180–₹350/sq ft). Impervious to direct hot kadai flames, lemon/turmeric stains, and harsh scouring.\n• **Engineered Quartz (KalingaStone / Caesarstone)**: Non-porous, antibacterial, uniform luxury veining (₹450–₹850/sq ft). Requires trivets for hot cookware above 150°C.\n• **Sintered Porcelain Stone (Dekton / Neolith)**: Ultra-compact, zero porosity, 100% scratchproof, UV resistant, and can withstand direct blowtorch heat without cracking."
      },
      {
        "question": "Why are Tandem Box drawers better than traditional SS wire baskets?",
        "answer": "Traditional stainless steel wire baskets use basic side-mounted channels that gather dust, accumulate grease in wire corners, and rattle when pushed. Modern Tandem Drawers (Hettich InnoTech / Blum LEGRABOX) feature double-walled sealed metal sides, integrated silent soft-closing runners, dynamic 30kg–65kg load capacity, full extension, and customizable magnetic cutlery/thali dividers."
      },
      {
        "question": "How do corner solutions (LeMans Trays vs Magic Corner) work in L and U-shape kitchens?",
        "answer": "Blind corner cabinets (typically 3ft × 3ft) create inaccessible dead space. Specialized corner mechanisms utilize 100% of this depth:\n• **LeMans S-Corner Pull-Out**: Kidney-shaped dual trays that glide completely out of the cabinet with independent height adjustment.\n• **Universal Magic Corner**: 4 interconnected heavy-duty baskets where opening the front door swings the rear baskets forward into direct reach.\n• **Lazy Susan 360°**: Circular rotating carousels for lightweight spices and dry provisions."
      },
      {
        "question": "What are the standard ergonomic dimensions for an Indian modular kitchen?",
        "answer": "• **Base Cabinet Height**: 32 to 34 inches (81 to 86 cm) including countertop slab & 4-inch water-resistant PVC skirting.\n• **Base Counter Depth**: 24 to 26 inches (60 to 65 cm).\n• **Backsplash Tile Gap**: 20 to 24 inches (50 to 60 cm) between counter and wall units.\n• **Wall Cabinet Depth**: 12 to 14 inches (30 to 35 cm) to avoid bumping your forehead while cooking.\n• **Overhead Loft Depth**: 24 inches (flushed with base counter) or 14 inches (flushed with wall units)."
      }
    ],
    "sections": [
      {
        "title": "Modular Kitchen Carcass & Shutter Material Specifications",
        "content": "| Component | Material Option | IS Standard / Spec | Cost Range (₹/sq ft) | Key Features |\n| :--- | :--- | :--- | :--- | :--- |\n| **Carcass Body** | BWP Marine Plywood | IS:710 Grade | ₹1,450 – ₹1,750 | 100% Boiling Waterproof, 15-Yr Warranty |\n| **Carcass Body** | HDHMR Green Board | 850+ kg/m³ | ₹1,300 – ₹1,550 | Termite proof, zero core voids, high screw holding |\n| **Carcass Body** | SS 304 Stainless Steel | 1.0mm 304 Grade | ₹2,600 – ₹3,200 | Commercial hygiene, fireproof, zero moisture damage |\n| **Shutters** | High-Gloss Acrylic | 1.5mm–2.0mm PMMA | +₹300 – ₹450 | Mirror reflection, non-toxic, UV stable |\n| **Shutters** | Anti-Fingerprint Matte | FENIX NTM / SuperMatte | +₹500 – ₹700 | Soft touch, thermal micro-scratch healing |\n| **Shutters** | PU Duco Italian Paint | 7-Coat Polyurethane | +₹1,100 – ₹1,500 | Seamless jointless bespoke finish |\n| **Shutters** | Fluted Glass Profile | 4mm Toughened in Black Alum | +₹1,200 – ₹1,600 | Contemporary luxury showcase display |"
      },
      {
        "title": "Kitchen Golden Triangle & Layout Optimization",
        "content": "The **Kitchen Work Triangle** connects the three core functional zones: **Hob (Cooking)**, **Sink (Cleaning)**, and **Refrigerator (Storage)**. For optimal ergonomics:\n- The sum of the three triangle sides should be between **13 and 26 feet (4.0m to 7.9m)**.\n- No primary kitchen traffic pathway should cross directly through the work triangle.\n- **L-Shape & U-Shape**: Ideal for triangular workflow with corner pull-out mechanisms.\n- **Parallel / Galley**: Offers the most efficient chef workflow with minimum steps between sink and cooking counter (recommended walkway clearance: 3.5 to 4.5 feet).\n- **Island Layout**: Allows social cooking and breakfast counter seating while maintaining an isolated prep zone."
      }
    ]
  },
  {
    "id": "WardrobeCostCalculator",
    "slug": "wardrobe-cost-calculator",
    "name": "Wardrobe Cost Calculator",
    "category": "interior",
    "shortDescription": "Calculate wardrobe cabinet cost based on sliding or hinged doors, finishes, and loft options.",
    "metaDescription": "Calculate modular wardrobe costs in India. Estimate budgets for sliding (2-track / 3-track) and hinged wardrobes with BWP Marine Ply, Acrylic, Veneer, Fluted Glass, soft-close drawers, and overhead lofts.",
    "keywords": [
      "Wardrobe Cost Calculator",
      "sliding wardrobe cost calculator",
      "wardrobe cost per sq ft india",
      "hinged wardrobe price estimator",
      "modular wardrobe cost calculator",
      "acrylic wardrobe cost per sq ft",
      "veneer wardrobe cost",
      "fluted glass wardrobe cost",
      "bwp marine ply wardrobe cost",
      "hettich wardrobe fittings cost",
      "bedroom wardrobe budget planner"
    ],
    "icon": "Palette",
    "howToUse": [
      "Select your measurement unit: Feet (ft) or Meters (m).",
      "Choose a standard bedroom layout preset or enter custom wardrobe width, height, and depth (inches).",
      "Toggle Overhead Storage Loft if your wardrobe reaches the ceiling, and specify the loft height (standard 2.0 to 2.5 ft).",
      "Select your Core Carcass Board: BWP Marine Ply (IS:710), Commercial MR Ply (IS:303), HDHMR, or Solid Teak Wood.",
      "Pick your Door Mechanism: Standard Hinged, 2-Track Sliding (Space Saver), 3-Track Sliding (Wide Span), Bi-Fold, or Open Walk-In.",
      "Choose your Shutter Finish: Matte Laminate, High-Gloss Acrylic Laminate, 2.0mm Solid Acrylic, Natural Veneer + PU Polish, Tinted Fluted Glass, or PU Duco Paint.",
      "Select your preferred Hardware Fitting Brand: Hettich (German Soft-Close), Hafele/Blum (Luxury Austrian), or Ebco/Ozone.",
      "Customize internal organizer modules: Soft-close drawers, pull-out trouser/saree rack, velvet jewelry tray, hydraulic pull-down lift, and motion-sensor profile LED lights.",
      "Inspect the live 2D Architectural Elevation Preview and review the Itemized Contractor Bill of Quantities (BOQ).",
      "Click 'Copy Quote' or 'PDF Quote' to download an itemized interior estimate."
    ],
    "faqs": [
      {
        "question": "How is wardrobe cost calculated per square foot in India?",
        "answer": "Wardrobes are billed based on front facade area (Width × Height of the carcass in square feet). Total price = (Main Cabinet Area × Main Rate/sq ft) + (Overhead Loft Area × Loft Rate/sq ft) + Internal Hardware & Smart Accessories + 12% Assembly/Installation Charges + 18% GST. Average basic hinged wardrobes start at ₹1,400 to ₹1,700/sq ft, while premium acrylic sliding wardrobes range between ₹2,200 and ₹3,500/sq ft."
      },
      {
        "question": "Which is better and more cost-effective: Sliding or Hinged Wardrobe doors?",
        "answer": "Hinged doors are 20% to 30% more economical because they utilize standard concealed soft-close hinges. However, they require 2 to 3 feet of clear walking space in front of the wardrobe to open. Sliding doors cost more due to heavy-duty top-hung tracks, bottom rollers, and aluminum profile framing (adds ₹400 to ₹700/sq ft), but they require zero front clearance, making them ideal for compact and modern master bedrooms."
      },
      {
        "question": "What is the best plywood/board material for wardrobe construction?",
        "answer": "BWP Marine Ply (IS:710) is the highest recommended material for long-lasting durability, 100% boiling waterproof protection, and termite resistance. For dry bedrooms on a budget, Commercial MR Grade Plywood (IS:303) or HDHMR (High-Density High Moisture Resistance) boards are excellent alternatives. MDF and particle boards should only be used for low-load decorative paneling."
      },
      {
        "question": "What is the standard depth for hinged and sliding wardrobes?",
        "answer": "Hinged wardrobes require a minimum depth of 21 to 24 inches (53 to 60 cm) to accommodate standard coat and blazer hangers on a central rod. Sliding wardrobes require a minimum depth of 24 to 26 inches (60 to 66 cm) because the sliding channel mechanism occupies 2 to 3 inches of internal depth."
      },
      {
        "question": "How much extra does an Overhead Storage Loft cost?",
        "answer": "Overhead lofts generally cost ~70% to 75% of the base wardrobe rate per square foot because they feature simpler single-shelf box cabinetry without complex internal drawers or pull-out fittings. A typical 6ft × 2ft loft adds approximately ₹15,000 to ₹25,000 to the overall wardrobe cost depending on the selected shutter finish."
      },
      {
        "question": "What is the difference between Laminate, Acrylic, Veneer, and Fluted Glass finishes?",
        "answer": "• Matte/Suede Laminate (1.0mm): Budget-friendly, scratch-resistant, and low maintenance.\n• High-Gloss Acrylic (1.5mm–2.0mm): Ultra-reflective mirror finish, seamless modern aesthetics, non-toxic, and UV resistant.\n• Natural Wood Veneer: Thin slices of real timber (Teak, Walnut, Oak) coated with PU melamine polish for a warm, luxury natural wood grain feel.\n• Tinted Fluted Glass: Ultra-modern contemporary luxury shutter with slim aluminum profiles and built-in vertical warm LED profile lighting."
      },
      {
        "question": "Why are soft-close drawers and pull-outs priced separately in modular quotes?",
        "answer": "Standard wardrobe quotes usually include 2 basic drawers with regular telescopic channels and open shelf partitions. Upgrades like soft-close undermount runners, pull-out trouser racks, velvet-lined jewelry trays, and hydraulic pull-down wardrobe lifts use specialized precision hardware mechanisms that are billed as modular add-on accessories."
      }
    ],
    "sections": [
      {
        "title": "Comprehensive Wardrobe Material & Finish Comparison Guide",
        "content": "When designing custom modular wardrobes, selecting the right carcass core and exterior shutter finish is the single biggest factor determining project longevity and cost:\n\n• **Core Carcass Plywood:** Always specify 18mm thickness for vertical gables and horizontal shelves, and at least 8mm to 12mm for the back panel to prevent sagging.\n• **Internal Laminate (Liner):** 0.7mm to 0.8mm off-white or fabric-texture laminate inside the carcass protects clothes from wood splinters and resists moisture.\n• **Shutter Edge Banding:** Machine-pressed 2.0mm PVC edge banding with PUR waterproof glue prevents peeling and gives a seamless factory finish."
      },
      {
        "title": "Standard Ergonomic Dimensions for Bedroom Wardrobe Planning",
        "content": "• **Full Height Wardrobes:** 7.0 ft (84 inches) for main carcass + 2.0 to 3.0 ft for overhead loft.\n• **Long Hanging Section:** 48 to 54 inches vertical height for full-length coats, sarees, and dresses.\n• **Short Hanging Section:** 36 to 40 inches vertical height for shirts, jackets, and folded trousers.\n• **Drawer Depths:** 6 to 8 inches for watches/accessories, 8 to 12 inches for daily clothes and knitwear.\n• **Shoe Rack Bottom Shelf:** 12 to 14 inches with inclined ventilation."
      }
    ]
  },
  {
    id: 'AdvancedBOQCalculatorIndia',
    slug: 'advanced-boq-calculator-india',
    name: 'Advanced BOQ Calculator India',
    category: 'civil',
    subcategory: 'Quantity Takeoff & Cost Estimation',
    hideLayoutHeader: true,
    shortDescription: 'Create detailed construction BOQs with quantities, material estimates, floor-wise costing, and Excel/PDF export.',
    metaTitle: 'Advanced BOQ Calculator India | CPWD Rate Analysis & Construction Estimator',
    metaDescription: 'Free online Indian construction BOQ calculator. Estimate concrete, steel, brickwork, plaster, tiles, and paint quantities with multi-floor takeoff, CPWD DSR rate analysis, and Excel/PDF export.',
    keywords: [
      'boq calculator india',
      'bill of quantities calculator',
      'construction estimation india',
      'cpwd rate analysis calculator',
      'building material estimator',
      'civil quantity takeoff',
      'delhi schedule of rates dsr calculator',
      'rcc concrete steel estimator',
      'multi floor construction cost calculator',
      'boq excel export tool'
    ],
    icon: 'Calculator',
    howToUse: [
      'Initialize Project: Select a pre-configured template (G+0 House, Modular Kitchen) or create a blank project with custom GST, margin, and contingency rates.',
      'Configure Building Floors & Rooms: Add multiple floor levels (Ground, First, Terrace) with floor areas to auto-calculate built-up area and scale standard items.',
      'Enter Quantity Takeoff Dimensions: Add BOQ line items using volume (L × W × H), area (L × W), length (Rmt), or unit count formulas aligned with IS 1200 measurement standards.',
      'Apply CPWD Rate Analysis: Choose from 25+ standard CPWD DSR rate presets or specify material, labor, machinery, transit, wastage %, and contractor margins.',
      'Inspect Rule-of-Thumb Material Quantities: View automated totals for cement bags, sand cft, coarse aggregate cft, TMT rebar kg, brick/block count, tiles, adhesive, and paint volume.',
      'Simulate Market Price Fluctuation: Adjust interactive price deviation sliders for cement, steel, labor wages, or general inflation to stress-test your budget.',
      'Export Professional Deliverables: Download a multi-sheet Microsoft Excel (.xlsx) workbook or a formatted PDF estimation report with line item schedules.'
    ],
    faqs: [
      {
        question: 'What is a Bill of Quantities (BOQ) in Indian civil engineering?',
        answer: 'A Bill of Quantities (BOQ) is a comprehensive engineering schedule that itemizes every individual item of work required for a construction project—including item code, standardized description matching CPWD or State DSR specifications, unit of measurement, net quantity, unit rate, and total amount. It forms the legal and financial backbone for contractor tendering, milestone billing, and material procurement.'
      },
      {
        question: 'How is unit rate analysis calculated in accordance with CPWD DSR?',
        answer: 'In Indian civil estimation, the unit rate of an item is derived from the sum of five base cost components: (1) Primary Materials Cost (including wastage), (2) Skilled & Unskilled Labor Wages (masons, bar benders, carpenters, helpers), (3) Equipment & Shuttering depreciation, (4) Freight & Transit handling, and (5) Other sundries. Contractor profit margin (typically 10% to 15%) and GST (typically 18% on works contracts) are compounded on this base sum.'
      },
      {
        question: 'What are the standard material wastage allowances applied in India?',
        answer: 'Standard civil engineering wastage allowances in India are: Reinforcement TMT Steel: 3%–5% (cutting and laps); Bricks & AAC blocks: 5% (breakage and half-bats); Vitrified & Ceramic floor tiles: 8%–10% (perimeter cutting and layout alignment); Cement & Sand plaster: 8%–10% (rebound and joint filling); Wall Putty & Emulsion Paint: 5% (application and roller absorption).'
      },
      {
        question: 'Which Indian Standard (IS) codes govern construction measurements?',
        answer: 'Civil construction measurements in India follow IS 1200 (Parts 1 to 28), "Method of Measurement of Building and Civil Engineering Works." Key parts include Part 1 (Earthwork in excavation/filling), Part 2 (Concrete works), Part 3 (Brickwork masonry), Part 4 (Stone masonry), Part 5 (Formwork), Part 8 (Steelwork), Part 11 (Plastering & Pointing), Part 12 (Flooring), and Part 13 (Painting & Polishing).'
      },
      {
        question: 'How are dry volume conversion factors applied for concrete and mortar?',
        answer: 'Freshly mixed wet concrete shrinks during compaction and hydration. To calculate raw material quantities (cement, sand, aggregate), a dry volume multiplier of 1.54 is applied to wet concrete volume. For cement-sand plaster and brick mortar, a dry volume factor of 1.33 to 1.35 is used to account for void filling between aggregate particles and drying shrinkage.'
      },
      {
        question: 'How does multi-floor quantity scaling work in this calculator?',
        answer: 'When you add a new floor (e.g. First Floor) to your project, the tool automatically clones typical structural and architectural finishing items from the Ground Floor (excluding foundation-specific items like excavation and PCC) and scales dimensions proportionally based on the new floor area.'
      },
      {
        question: 'What is the difference between Carpet Area, Built-up Area, and Super Built-up Area in BOQ takeoff?',
        answer: 'Carpet Area is the net usable internal floor area excluding wall thickness. Built-up Area is the gross floor plate area including internal/external walls and private balconies. Super Built-up Area (Saleable Area) includes the built-up area plus proportionate common spaces such as lobbies, staircases, lift shafts, and clubhouse facilities.'
      },
      {
        question: 'How can I export and share the final BOQ with clients and contractors?',
        answer: 'Click the "Excel" button to export a complete 3-sheet workbook containing: (1) Project Executive Summary & Cost/Sqft index, (2) Itemized BOQ Schedule with dimensions and rates, and (3) Indian Construction Material Takeoff (cement bags, sand cft, steel kg, bricks, paint). Click the "PDF" button to generate a clean, client-facing PDF quote.'
      }
    ],
    sections: [
      {
        title: 'Method of Measurement according to IS 1200',
        content: 'Indian Standard IS 1200 defines the universal guidelines for measuring civil engineering items. Lengths and breadths are measured to the nearest 0.01 meter (or 0.5 inch), areas to the nearest 0.01 square meter (or 0.1 sq ft), and cubical contents (volumes) to the nearest 0.01 cubic meter (or 0.1 cu ft). Openings in walls smaller than 0.1 sqm for plaster and 0.1 cum for brickwork are not deducted from gross measurements.'
      },
      {
        title: 'Rate Analysis Components & CPWD DSR Structure',
        content: 'The Central Public Works Department (CPWD) Delhi Schedule of Rates (DSR) establishes standardized unit rates for public and private infrastructure across India. Rate analysis combines basic material indices (cement, fine aggregate, coarse aggregate, TMT bars), labor day rates based on Minimum Wages Acts, water/electricity overheads (1%), contractor profit (10%), and GST (18%).'
      },
      {
        title: 'Material Estimation Dry Volume Coefficients',
        content: 'Civil estimation relies on empirical dry volume multipliers. For nominal concrete mixes (M15, M20, M25), dry volume is calculated as Dry Volume = 1.54 × Wet Volume. For masonry and plaster mortars (1:3, 1:4, 1:6), dry volume is Dry Volume = 1.33 × Wet Mortar Volume. 1 standard bag of cement equals 50 kg (0.0347 cubic meters or 1.226 cubic feet).'
      },
      {
        title: 'Best Practices for Civil Tender Preparation & Contractor Quotations',
        content: 'To prevent contractual disputes and scope creep during construction: (1) Clearly demarcate inclusion and exclusion of rebar steel, formwork, and curing in concrete line items, (2) Specify tile brands, grade (double charged vitrified vs ceramic), and tile format dimensions, (3) Fix standard wastage ceilings in contractor agreements, and (4) Maintain a separate contingency reserve (typically 3% to 5%) for unforeseen foundation soil conditions or structural revision notices.'
      }
    ]
  },
  {
    "id": "AreaCalculator",
    "slug": "area-calculator",
    "name": "Area Calculator",
    "category": "architecture",
    "subcategory": "Area & Space Planning",
    "shortDescription": "Calculate the total surface area of regular (square, rectangular, circular) and irregular multi-sided spaces.",
    "metaTitle": "Area Calculator | Land & Room Surface Area Measurement",
    "metaDescription": "Free online Area Calculator. Calculate total area of regular rectangular, triangular, circular, and complex irregular land plots or floor spaces.",
    "keywords": [
      "area calculator",
      "land area calculator",
      "plot area calculator",
      "calculate irregular land area",
      "room area calculator online",
      "square footage calculator",
      "calculate square meters"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Area Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Area Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "BuiltUpAreaCalculator",
    "slug": "built-up-area-calculator",
    "name": "Built-up Area Calculator",
    "category": "architecture",
    "subcategory": "Area & Space Planning",
    "shortDescription": "Calculate total building built-up area incorporating usable carpet space, balconies, and internal/external structural wall widths.",
    "metaTitle": "Built-up Area Calculator – Plinth, Walls & Balconies Estimator",
    "metaDescription": "Calculate gross built-up area (BUA) and plinth footprint from RERA net carpet area, balcony cantilevers, and exterior/interior wall thicknesses. Supports 2D blueprint schematics and PDF export.",
    "keywords": [
      "built up area calculator",
      "calculate built up area",
      "built up area formula",
      "carpet area to built up area",
      "built up area of flat calculator",
      "calculate wall area of flat",
      "plinth area calculator",
      "rera carpet to bua converter",
      "wall thickness calculator civil",
      "super built up area difference"
    ],
    "icon": "Building2",
    "howToUse": [
      "Select your preferred measurement units (Square Feet, Square Meters, or Square Yards) and pick a predefined layout (1 BHK, 2 BHK, 3 BHK, Duplex Villa) or start from scratch.",
      "Choose a Wall Construction preset (Standard Brick, AAC Blocks, Mivan Aluform RCC, or Custom) to configure exterior perimeter and interior partition wall thicknesses.",
      "Add or adjust rooms with custom dimensions (Width × Length) and classify them as Carpet Area, Balconies, Utility Yards, or Terraces.",
      "Configure municipal compliance factors (100% or 50% balcony inclusion) and multi-floor multipliers for multi-storey duplexes or apartment blocks.",
      "Review the live 2D architectural blueprint schematic, floor efficiency rating, structural material estimates (cement, steel, bricks), and export the schedule as a professional PDF certificate or CSV report."
    ],
    "faqs": [
      {
        "question": "What is the difference between Carpet Area and Built-up Area (BUA)?",
        "answer": "Carpet Area (RERA Net Usable Area) is the physical space within the inner walls of an apartment that can be covered by a carpet. Built-up Area (or Plinth Area) equals the Carpet Area PLUS the area occupied by interior partition walls, exterior perimeter envelope walls, private balconies, and utility wash yards."
      },
      {
        "question": "What is the standard formula to calculate Built-up Area?",
        "answer": "Built-up Area (BUA) = Net Carpet Area + Total Internal Partition Wall Area + Exterior Envelope Wall Area + Balconies & Verandahs + Service Shafts/Ducts within Plinth. Typically, Built-up Area is 10% to 20% larger than the net usable carpet area."
      },
      {
        "question": "How do wall thicknesses affect Built-up Area?",
        "answer": "Exterior perimeter walls are typically 9 inches (230 mm) for standard brickwork or 8 inches (200 mm) for AAC blocks, accounting for 7% to 12% of the floor footprint. Interior partition walls are usually 4.5 inches (115 mm) or 4 inches (100 mm), contributing another 3% to 6% of the carpet footprint. Modern Mivan shear walls (160mm exterior / 100mm interior) provide higher spatial efficiency."
      },
      {
        "question": "Are balconies included in Built-up Area under Indian RERA and municipal bylaws?",
        "answer": "Under RERA, private balconies and exclusive terraces are excluded from the 'Carpet Area' definition but are fully part of the 'Built-up Area'. Some municipal corporations (such as BMC Mumbai or BBMP Bengaluru) offer 50% FSI concessions on open cantilevered balconies, while others compute 100% of the covered projection."
      },
      {
        "question": "What is a healthy Floor Efficiency Index (FEI)?",
        "answer": "Floor Efficiency Index (Carpet Area ÷ Built-up Area × 100) measures how efficiently a floor plan utilizes structural space. A rating above 82% is considered excellent architectural efficiency, 78%–82% is standard for residential apartments, and below 75% indicates heavy structural or spatial loading."
      }
    ],
    "sections": [
      {
        "title": "Architectural Principles of Built-up & Plinth Area Measurement",
        "content": "In accordance with IS 3861:2002 (Method of Measurement of Plinth, Carpet and Rentable Areas of Buildings) and the Real Estate (Regulation and Development) Act (RERA) 2016, Built-up Area represents the total covered floor area measured up to the outer finished face of exterior walls at the plinth level. Where walls are shared between adjoining tenements (party walls), half the wall thickness is apportioned to each unit.\n\nKey components of Built-up Area include:\n1. Net Usable Carpet Area across all habitable and sanitary spaces.\n2. Thickness of internal non-structural partition walls.\n3. Full thickness of external envelope and load-bearing walls.\n4. Cantilevered and recessed balconies, verandahs, and service utility yards.\n5. Air conditioning ledges, plumbing pipe ducts, and electrical shafts located within the plinth boundary."
      },
      {
        "title": "Carpet vs. Built-up vs. Super Built-up Comparison Matrix",
        "content": "• Carpet Area: 100% usable room footprint inside walls (Living, Bed, Kitchen, Bathrooms, internal passages).\n• Built-up Area: Carpet Area + 10%–18% (External & Internal Walls + Balconies + Service ducts).\n• Super Built-up Area: Built-up Area + 20%–35% Developer Common Loading (Lift shafts, grand lobbies, stairwells, security gates, transformer rooms).\n\nUnderstanding these ratios prevents real estate buyer deception and ensures precise civil quantity takeoff during structural foundation and brickwork estimation."
      }
    ]
  },
  {
    "id": "SuperBuiltUpAreaCalculator",
    "slug": "super-built-up-area-calculator",
    "name": "Super Built-up Area Calculator",
    "category": "architecture",
    "subcategory": "Area & Space Planning",
    "shortDescription": "Calculate total saleable super built-up area by applying apartment loading factors and common shared areas to the base built-up area.",
    "metaTitle": "Super Built-up Area Calculator | Loading Factor & Common Area Estimator",
    "metaDescription": "Free online Super Built-up Area Calculator. Estimate total saleable property area by adding common lift lobbies, stairs, and developer loading factors.",
    "keywords": [
      "super built up area calculator",
      "loading factor calculator flat",
      "super built up area formula",
      "saleable area calculator",
      "carpet to super built up calculator",
      "apartment common area ratio"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Super Built-up Area Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Super Built-up Area Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "PlotCoverageCalculator",
    "slug": "plot-coverage-calculator",
    "name": "Plot Coverage Calculator",
    "category": "architecture",
    "subcategory": "Area & Space Planning",
    "shortDescription": "Calculate permissible ground footprint area and open space ratios based on local municipal zoning guidelines.",
    "metaTitle": "Plot Coverage Calculator | Permissible Ground Footprint Estimator",
    "metaDescription": "Free online Plot Coverage Calculator. Estimate permissible ground coverage, open space areas, and municipal zoning footprint ratio compliance.",
    "keywords": [
      "plot coverage calculator",
      "ground coverage ratio calculator",
      "permissible footprint calculator",
      "calculate open space ratio",
      "building footprint calculator",
      "municipal plot coverage bylaws"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Plot Coverage Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Plot Coverage Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "SpacePlanningCalculator",
    "slug": "space-planning-calculator",
    "name": "Space Planning Calculator",
    "category": "architecture",
    "subcategory": "Area & Space Planning",
    "shortDescription": "Optimize corporate office floor planning, desk layouts, department spacing, and spatial utilization metrics.",
    "metaTitle": "Space Planning Calculator | Layout Density & Desk Allocation",
    "metaDescription": "Free online Space Planning Calculator. Analyze corporate office desk layouts, department spacing, circular clearances, and floor area utilization density.",
    "keywords": [
      "space planning calculator",
      "office layout space planner",
      "desk area calculator",
      "floor utilization density tool",
      "architectural space program calculator",
      "workspace planner online"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Space Planning Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Space Planning Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "OccupancyLoadCalculator",
    "slug": "occupancy-load-calculator",
    "name": "Occupancy Load Calculator",
    "category": "architecture",
    "subcategory": "Area & Space Planning",
    "shortDescription": "Estimate maximum occupant capacity limits for building safety, egress planning, and IBC code clearances.",
    "metaTitle": "Occupancy Load Calculator | Building Safety & Exit Code Limits",
    "metaDescription": "Free online Occupancy Load Calculator. Calculate maximum permissible occupants for safety clearances based on room function and IBC egress codes.",
    "keywords": [
      "occupancy load calculator",
      "calculate occupant load",
      "IBC occupancy load factor",
      "maximum building occupancy calculator",
      "exit width capacity estimator",
      "fire safety occupancy calculation"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Occupancy Load Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Occupancy Load Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "FloorEfficiencyCalculator",
    "slug": "floor-efficiency-calculator",
    "name": "Floor Efficiency Calculator",
    "category": "architecture",
    "subcategory": "Area & Space Planning",
    "shortDescription": "Analyze floor space efficiency by calculating loss factors and net usable carpet area ratios.",
    "metaTitle": "Floor Efficiency Calculator | Loss Factor & Usable Carpet Ratio",
    "metaDescription": "Free online Floor Efficiency Calculator. Compute building core loss factors and the ratio of net usable carpet space to total gross floor area.",
    "keywords": [
      "floor efficiency calculator",
      "building loss factor calculator",
      "floor efficiency ratio",
      "net to gross area calculator",
      "usable space calculator",
      "commercial floor efficiency ratio"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Floor Efficiency Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Floor Efficiency Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "RampSlopeCalculator",
    "slug": "ramp-slope-calculator",
    "name": "Ramp Slope Calculator",
    "category": "architecture",
    "subcategory": "Building Design",
    "shortDescription": "Compute ramp run lengths, slope gradients, rise heights, and access codes (ADA/NBC) for building clearances.",
    "metaTitle": "Ramp Slope Calculator | Wheelchair & Vehicle Ramp Gradients",
    "metaDescription": "Free online Ramp Slope Calculator. Compute ramp run lengths, slope rise, percentage gradients, ratios, and ADA/NBC accessibility code compliance.",
    "keywords": [
      "ramp slope calculator",
      "wheelchair ramp slope calculator",
      "ADA ramp slope calculator",
      "ramp gradient calculator",
      "calculate ramp length",
      "ramp slope ratio calculator",
      "access ramp slope standards"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Ramp Slope Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Ramp Slope Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "DoorSizeCalculator",
    "slug": "door-size-calculator",
    "name": "Door Size Calculator",
    "category": "architecture",
    "subcategory": "Building Design",
    "shortDescription": "Determine standard door clearances and dimensions based on occupant load.",
    "metaTitle": "Standard Door Size Calculator: Clear Opening, Frame & NBC 2016 Dimensions",
    "metaDescription": "Free architectural Door Size Calculator. Calculate clear openings, frame (chowkhat) thickness, rough masonry dimensions & NBC 2016 egress capacities in feet & mm.",
    "keywords": [
      "door size calculator",
      "standard door size in feet",
      "door opening size calculator",
      "standard door size india",
      "main door size as per vastu",
      "bedroom door size calculator",
      "Door Size Calculator",
      "door clear opening calculator",
      "rough opening door calculator",
      "NBC 2016 egress door width",
      "occupant load exit door capacity",
      "ADA door width requirement",
      "double door dimensions architecture",
      "door frame chowkhat size calculation",
      "architectural door schedule generator",
      "fire exit door size calculator"
    ],
    "icon": "DoorClosed",
    "howToUse": [
      "Select your preferred measurement unit: Millimeters (mm), Centimeters (cm), Inches (in), or Feet (ft).",
      "Choose a standard architectural door preset (e.g. D1-Main Entrance, D2-Bedrooms, D3-Bathrooms, D4-Classroom, D5-Hospital Stretcher) or enter custom dimensions.",
      "Input Clear Usable Opening Width and Height (unobstructed walkthrough dimensions at 90° open position).",
      "Configure Frame (Chowkhat) thickness (50mm–100mm), Shutter stop rebate depth (10mm–15mm), and Masonry shim grout gap (10mm).",
      "Select your Building Occupancy Class per NBC 2016 / IBC (Residential Group A, Educational Group B, Institutional Group C, Assembly Group D, Business Group E, Mercantile Group F, Industrial Group G, Storage Group H).",
      "Enter Design Occupant Load (number of persons) and toggle automatic fire sprinkler coverage to verify life safety egress width.",
      "Choose Door Leaf Style: Single Swing, Double Equal Leaf, 1.5 Unequal Leaf, or Grand Pivot Door.",
      "Select Door Core Material (Solid Teak, Flush Door, Hollow Pressed Metal, Fire-Rated Insulated Steel) to calculate estimated leaf weight and hinge specifications.",
      "Inspect the live 2D Architectural CAD Studio (Elevation View and Floor Plan Swing Clearance with wheelchair turning radius).",
      "Click '+ Add Current Door' to build your multi-door Project Door Schedule and download your certified PDF Schedule Certificate or copy the WhatsApp audit summary."
    ],
    "faqs": [
      {
        "question": "What is the difference between Clear Opening, Shutter Size, Frame Outer, and Rough Masonry Opening?",
        "answer": "• **Clear Opening (Passage Width)**: The net unobstructed walkthrough dimension between frame jambs with the door open at 90°.\n• **Shutter / Leaf Size**: The physical door panel that fits into the frame rebate. (Shutter Width = Clear Width + 2 × Rebate Depth).\n• **Frame Outer Size (Chowkhat Outer)**: The total outer dimension of the door frame box. (Frame Outer Width = Clear Width + 2 × Frame Thickness).\n• **Rough Masonry Opening**: The structural opening constructed by masons from lintel to finished floor. (Rough Width = Frame Outer Width + 2 × Shim Gap [typically 10mm to 15mm for expanding foam/grout alignment])."
      },
      {
        "question": "What are the standard door sizes in Indian residential architecture (NBC 2016)?",
        "answer": "• **Main Entrance Door (D1)**: 1000mm × 2100mm (3'3\" × 7'0\") or 1200mm × 2400mm (4'0\" × 8'0\") for grand villa pivot doors.\n• **Internal Bedroom Doors (D2)**: 900mm × 2100mm (3'0\" × 7'0\") for smooth furniture and mattress transit.\n• **Bathrooms / Toilets / Utility (D3)**: 750mm × 2100mm (2'6\" × 7'0\") or 800mm × 2100mm (2'8\" × 7'0\").\n• **Balcony / French Doors**: 1500mm to 2400mm (5'0\" to 8'0\") 2-track or 3-track sliding UPVC/Aluminium doors."
      },
      {
        "question": "How is required exit door width calculated based on occupant load (NBC 2016 & NFPA 101)?",
        "answer": "Egress width is calculated by multiplying the occupant load by the egress factor:\n• **Non-Sprinklered Buildings**: 5.08 mm (0.2 inches) per occupant. For example, an assembly room with 300 occupants requires $300 \\times 5.08 = 1,524\\text{ mm}$ (1.52m) of aggregate exit width.\n• **Sprinklered Buildings (NFPA 13 / NBC)**: 3.81 mm (0.15 inches) per occupant ($300 \\times 3.81 = 1,143\\text{ mm}$).\nAdditionally, NBC requires minimum doorway units: 1 exit door for $\\le 50$ persons, min 2 separate exit doors for 51–500 persons, 3 exits for 501–1000 persons, and 4 exits for $>1000$ persons."
      },
      {
        "question": "What is the ADA minimum clear door width requirement for wheelchair accessibility?",
        "answer": "Under ADA Standards Section 404 and CPWD Harmonized Guidelines for Barrier-Free Environment, doorways must provide a minimum **Clear Opening Width of 32 inches (813 mm)** measured between the face of the door and the stop with the door leaf open at 90 degrees. Doors on an accessible route should also provide a level threshold ($\le 1/2\"$ / 12.7mm with 1:2 bevel) and minimum 18\" (457mm) latch-side pull clearance."
      },
      {
        "question": "When is a double-leaf door required instead of a single-leaf door?",
        "answer": "A single door leaf should generally not exceed **1050mm to 1100mm (3'6\" to 3'8\")** in width because oversized single leaves put excessive torque on hinges, cause sagging over time, and require excessive swing space. Any opening between **1200mm and 2400mm (4'0\" to 8'0\")** should utilize double equal leaves or a 1.5 unequal leaf (active leaf 800–900mm + passive slave leaf 350–450mm)."
      },
      {
        "question": "When are panic exit hardware (crash bars) mandatory on doors?",
        "answer": "Per NBC 2016 Part 4 and NFPA 101 Life Safety Code, panic exit hardware (crossbar or touchpad crash bar) is mandatory on all exit doors serving **Assembly occupancies (Group D)**, **Educational spaces (Group B)**, and any room or space with an occupant load of **50 persons or more**. Panic doors must unlatch with no more than 67 N (15 lbf) of push force and must swing outward in the direction of escape travel."
      },
      {
        "question": "How many hinges are required based on door leaf height and weight?",
        "answer": "• **3 Hinges (Standard)**: For door leaves up to 2100mm (7'0\") in height and weight up to 45 kg (standard flush and light wood doors).\n• **4 Hinges (Heavy Duty)**: For door leaves exceeding 2100mm (e.g. 2400mm / 8'0\" doors) or heavy solid teak/fire-rated metal leaves weighing 45 kg to 100 kg. Hinges should be Grade 304 Stainless Steel Ball Bearing type (minimum 4\" × 3\" × 3mm or 5\" × 3.5\" × 3.5mm)."
      },
      {
        "question": "What is the recommended main entrance door size as per Vastu Shastra?",
        "answer": "Per Vastu Shastra: 1) The main entrance door (Simhadwara) must be the largest door in the entire house, typically 1000mm × 2100mm (3'3\" × 7'0\") or 1200mm × 2400mm (4'0\" × 8'0\"); 2) The door height should ideally be twice its width (1:2 proportion); 3) It should preferably open inward and clockwise; 4) A solid wood frame (Teak or Honne) with a slight threshold (dehli) is auspicious and prevents positive energy escape."
      }
    ],
    "sections": [
      {
        "title": "NBC 2016 Minimum Doorway Width Standards by Occupancy Group",
        "content": "| Occupancy Group | NBC 2016 Classification | Minimum Clear Width | Typical Door Type | Key Mandatory Requirements |\n| :--- | :--- | :--- | :--- | :--- |\n| **Residential** | Group A (Flats, Dwellings) | 900 mm (Main: 1000 mm) | Single Swing Leaf | Bathrooms allow 750 mm; min height 2000 mm |\n| **Educational** | Group B (Schools, Colleges) | 1,200 mm | 1.5 Leaf or Double Leaf | Swing in exit direction; unhindered student flow |\n| **Institutional** | Group C (Hospitals, Clinics) | 2,000 mm | Double Equal Leaf | Sized for unhindered rolling bed & stretcher passage |\n| **Assembly** | Group D (Auditoriums, Theatres) | 1,500 mm | Double Outward Leaf | Mandatory UL panic crash bars; zero threshold step |\n| **Business** | Group E (Offices, IT Parks) | 1,000 mm | Single / Double Leaf | Standard commercial egress corridors |\n| **Mercantile** | Group F (Shopping Malls, Retail) | 1,200 – 2,000 mm | Double Panic Exit | High traffic customer outward escape flow |\n| **Industrial** | Group G (Factories, Workshops) | 1,500 mm | Heavy Metal Double | Chemical & fire-resistant outward emergency escape |"
      },
      {
        "title": "Door Framing Tolerance & Rough Opening Formula",
        "content": "To calculate the masonry opening for structural lintel casting:\n$$\\text{Rough Opening Width} = \\text{Clear Width} + 2 \\times \\text{Frame Thickness} + 2 \\times \\text{Shim Gap (10mm)}$$\n$$\\text{Rough Opening Height} = \\text{Clear Height} + \\text{Frame Thickness} + \\text{Shim Gap (10mm)}$$\n*Note: Modern interior door frames omit the bottom sill frame to ensure zero trip hazard and ADA wheelchair accessibility.*"
      }
    ]
  },
  {
    "id": "WindowSizeCalculator",
    "slug": "window-size-calculator",
    "name": "Window Size Calculator",
    "category": "architecture",
    "subcategory": "Building Design",
    "shortDescription": "Calculate required window dimensions for daylight and ventilation guidelines.",
    "metaDescription": "Free online Window Size Calculator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Window Size Calculator",
      "Window Size Calculator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Window Size Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Window Size Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "CorridorWidthCalculator",
    "slug": "corridor-width-calculator",
    "name": "Corridor Width Calculator",
    "category": "architecture",
    "subcategory": "Building Design",
    "shortDescription": "Find minimum corridor width clearances according to occupant capacities.",
    "metaDescription": "Free online Corridor Width Calculator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Corridor Width Calculator",
      "Corridor Width Calculator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Corridor Width Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Corridor Width Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "CeilingHeightCalculator",
    "slug": "ceiling-height-calculator",
    "name": "Ceiling Height Calculator",
    "category": "architecture",
    "subcategory": "Building Design",
    "shortDescription": "Compute minimum and recommended room ceiling heights by category.",
    "metaDescription": "Free online Ceiling Height Calculator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Ceiling Height Calculator",
      "Ceiling Height Calculator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Ceiling Height Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Ceiling Height Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "HeadroomCalculator",
    "slug": "headroom-calculator",
    "name": "Headroom Calculator",
    "category": "architecture",
    "subcategory": "Building Design",
    "shortDescription": "Calculate stair and landing headroom clearances for code compliance.",
    "metaDescription": "Free online Headroom Calculator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Headroom Calculator",
      "Headroom Calculator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Headroom Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Headroom Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "ParkingSpaceCalculator",
    "slug": "parking-space-calculator",
    "name": "Parking Space Calculator",
    "category": "architecture",
    "subcategory": "Building Design",
    "shortDescription": "Calculate parking layout dimensions, bays, and turning radii.",
    "metaTitle": "Parking Space Calculator | Layout Dimensions, Bays & Turning Radii",
    "metaDescription": "Free online Parking Space Calculator & CAD Layout Studio. Calculate car bays, aisle widths, turning radii, ADA accessible stalls, and EV charging bays per NBC 2016 and IBC codes.",
    "keywords": [
      "Parking Space Calculator",
      "parking layout dimensions",
      "parking stall size calculator",
      "turning radius parking lot",
      "NBC 2016 parking standards",
      "ADA parking stall requirements",
      "ECS parking calculator",
      "architectural parking blueprint",
      "commercial parking lot layout"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your measurement units (Feet or Meters) and choose a regional standard (NBC 2016 India, IBC/ADA USA, BS 8300 UK, or Custom).",
      "Pick a 1-click project preset (Office Commercial, Retail Mall, Hospital, Residential Stilt, Hotel Valet, or EV Charging Hub) or manually input your lot length and width.",
      "Choose your preferred parking stall angle (90° Perpendicular, 60° Angled, 45° Angled, 30° Angled, or 0° Parallel) and row layout (Double Row with central aisle or Single Row).",
      "Customize stall width, stall depth, and driving aisle dimensions, then adjust the dedicated EV Fast-Charging ratio and Two-Wheeler / Bike bay allocations.",
      "Review the live 2D CAD blueprint simulation (toggle CAD Dark, Blueprint Light, or Asphalt mode) to inspect bay geometries and circulation flow.",
      "Check the Turning Radii & Maneuverability audit badge (1-shot vs multi-point turn status) and copy the complete technical dimension audit or share directly via WhatsApp."
    ],
    "faqs": [
      {
        "question": "What are the standard parking stall dimensions under NBC 2016 (India) vs IBC / ADA (USA)?",
        "answer": "Under NBC 2016 and IRC standards in India, a standard passenger car parking stall is 2.5 m × 5.0 m (8.2 ft × 16.4 ft). Under US IBC and ADA guidelines, standard stalls are typically 9.0 ft × 18.0 ft (2.74 m × 5.49 m) for standard passenger cars or 8.5 ft × 18.0 ft for compact vehicles. British Standard BS 8300 recommends 2.4 m × 4.8 m."
      },
      {
        "question": "What is the difference between 90° perpendicular and 60° / 45° angled parking?",
        "answer": "90° perpendicular parking provides the highest vehicle stall density per linear curb length but requires a wider two-way driving aisle (minimum 6.0 m / 20–24 ft) for 90-degree turning maneuvers. Angled parking (60° or 45°) allows narrower one-way driving aisles (3.5–4.5 m / 12–15 ft), smoother one-shot entry and exit without blind spots, and reduced driver maneuvering friction, making it ideal for retail supermarkets and high-traffic shopping centers."
      },
      {
        "question": "How many Accessible (ADA / Divyangjan) parking spaces are legally mandatory?",
        "answer": "According to NBC 2016 Part 3 (Clause 4.3) and ADA Title III (Table 1106.1): 1–25 total bays require at least 1 accessible stall (minimum 3.6 m wide or 8.0 ft bay + 5.0 ft access aisle); 26–50 bays require 2 accessible stalls; 51–75 bays require 3 stalls; 76–100 bays require 4 stalls; and lots with over 100 bays require 2% of total capacity plus at least 1 van-accessible stall (8.0 ft bay + 8.0 ft access aisle)."
      },
      {
        "question": "What is Equivalent Car Space (ECS) and how is it calculated?",
        "answer": "Equivalent Car Space (ECS) is the standard urban planning metric used by municipal authorities (such as DDA, MCGM, BDA, and DTCP) to quantify parking requirements across mixed vehicle types: 1 Standard Passenger Car = 1.0 ECS (23–28 sq.m in open surface parking or 28–32 sq.m in stilt/basement including circulation); 1 Two-Wheeler (Motorcycle/Scooter) = 0.2 ECS (1.0 m × 2.0 m); 1 Bicycle = 0.1 ECS; and 1 Commercial Bus / Truck = 2.5 to 3.0 ECS."
      },
      {
        "question": "What is the minimum vehicle turning radius and driving aisle clearance for parking lots?",
        "answer": "Standard passenger sedans require a minimum outer turning radius of 5.5 m (18.0 ft) and an inner turning radius of 3.0 m (9.8 ft). Large SUVs and pickup trucks require 6.2 m (20.3 ft) outer turning radius. Two-way aisles must be at least 6.0 m (20 ft) wide, and one-way aisles must be at least 3.5 m (11.5 ft) wide to prevent vehicle corner scraping and ensure effortless one-shot parking maneuvers."
      },
      {
        "question": "What are the EV charging bay infrastructure requirements in modern building bylaws?",
        "answer": "Under the Model Building Bye-Laws (MBBL 2016 amended) and Central Electricity Authority (CEA) guidelines, modern residential and commercial developments must allocate at least 10% to 20% of total parking capacity equipped with EV slow/fast AC/DC charging infrastructure, including dedicated conduit pathways, fire suppression clearances, and electrical load capacity of 3.3 kW to 22 kW per charging stall."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Parking Layouts & Stall Geometry",
        "content": "Designing an efficient parking facility requires balancing maximum vehicular capacity with smooth circulation and safety. Key dimensional standards include:\n\n1. Stall Geometry across Angles:\n- 90° Perpendicular: Stall Width 2.5 m (8.2 ft), Stall Depth 5.0 m (16.4 ft), Two-Way Aisle 6.0 m (19.7 ft). Highest space density.\n- 60° Angled: Stall Width 2.5 m (8.2 ft), Stall Depth 5.4 m (17.7 ft), One-Way Aisle 4.5 m (14.8 ft). Optimal compromise between density and ease of maneuvering.\n- 45° Angled: Stall Width 2.5 m (8.2 ft), Stall Depth 5.2 m (17.1 ft), One-Way Aisle 3.8 m (12.5 ft). Ideal for narrow site depths.\n- 0° Parallel: Stall Width 2.4 m (7.9 ft), Stall Length 6.0 m (19.7 ft), One-Way Aisle 3.5 m (11.5 ft). Used for curbside drop-off and narrow driveways.\n\n2. Accessible (ADA / Divyangjan) Clearances:\nAccessible stalls must be placed on the shortest accessible route of travel to building entrances, with a minimum width of 3.6 m (or 2.4 m stall + 1.2 m painted access transfer aisle) on flat ground not exceeding 1:50 (2%) slope."
      },
      {
        "title": "Vehicle Turning Radii, Swept Path & Ramp Circulation Engineering",
        "content": "Vehicular maneuvering in surface lots, multi-level parking podiums, and basements depends on vehicle turning physics:\n\n1. Turning Radii Equations:\n- Minimum Outer Turning Radius (Ro): 5.5 m (18.0 ft) for standard cars; 6.2 m (20.3 ft) for SUVs.\n- Minimum Inner Turning Radius (Ri): 3.0 m (9.8 ft).\n- Swept Path Width (W_swept): W_swept = √(Ro² - L_wheelbase²) - Ri + W_vehicle, ensuring adequate aisle width for single-movement 90° turning.\n\n2. Ramp Design Specifications:\n- Straight Vehicular Ramps: Maximum slope of 1:8 (12.5%) for private residential or 1:10 (10%) for commercial public parking.\n- Curved / Helical Ramps: Maximum slope of 1:12 (8.33%) with a minimum inner turning radius of 4.5 m (14.8 ft) and outer radius of 9.0 m (29.5 ft).\n- Vertical Headroom Clearance: Minimum 2.4 m (7.9 ft) clear height under structural beams and fire sprinkler pipes (2.75 m for accessible van routes)."
      },
      {
        "title": "Equivalent Car Space (ECS) Planning & Basement Column Grid Optimization",
        "content": "In multi-level basements and stilt floors, structural column grids directly dictate parking yield and efficiency:\n\n1. Recommended Column Spacing for 3-Car Bays:\n- Clear bay between columns: 7.5 m to 8.0 m (24.6 ft to 26.2 ft) clear width fits three standard 2.5 m passenger car stalls comfortably.\n- Column depth: 0.45 m to 0.6 m with wheel stops positioned 0.9 m from end walls.\n\n2. Gross Area Norms per Equivalent Car Space (ECS):\n- Open Surface Lot: 23 to 25 sq.m (250–270 sq.ft) per ECS including driveway aisles.\n- Stilt Floor Level: 28 to 30 sq.m (300–325 sq.ft) per ECS.\n- Multi-Level Basement Parking: 32 to 35 sq.m (345–375 sq.ft) per ECS accounting for structural columns, ramps, shafts, and stair cores."
      }
    ]
  },
  {
    "id": "ElevatorCapacityCalculator",
    "slug": "elevator-capacity-calculator",
    "name": "Elevator Capacity Calculator",
    "category": "architecture",
    "subcategory": "Building Design",
    "shortDescription": "Estimate required elevator size, capacity, and count for buildings.",
    "metaDescription": "Free online Elevator Capacity Calculator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Elevator Capacity Calculator",
      "Elevator Capacity Calculator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Elevator Capacity Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Elevator Capacity Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "FireExitWidthCalculator",
    "slug": "fire-exit-width-calculator",
    "name": "Fire Exit Width Calculator",
    "category": "architecture",
    "subcategory": "Building Design",
    "shortDescription": "Compute exit door widths based on total floor occupancy load limits.",
    "metaDescription": "Free online Fire Exit Width Calculator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Fire Exit Width Calculator",
      "Fire Exit Width Calculator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Fire Exit Width Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Fire Exit Width Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "SiteCoverageCalculator",
    "slug": "site-coverage-calculator",
    "name": "Site Coverage Calculator",
    "category": "architecture",
    "subcategory": "Site Planning",
    "shortDescription": "Calculate building footprint percentage relative to the total site plot.",
    "metaTitle": "Site Coverage Calculator \u2013 Building Footprint & Ground Coverage (GCR %)",
    "metaDescription": "Calculate Site Ground Coverage Ratio (GCR %), open space ratio (OSR), paved hardscape, permeable green area, and municipal zoning bylaw compliance.",
    "keywords": [
        "site coverage calculator",
        "ground coverage ratio calculator",
        "building footprint calculator",
        "open space ratio architecture",
        "impervious surface ratio",
        "zoning bylaw coverage check",
        "permeability stormwater calculator",
        "nbc ground coverage calculator"
    ],
    "icon": "Compass",
    "howToUse": [
        "Select an analytical mode: Standard Coverage & OSR, Zoning Bylaw Compliance, Permeability & Stormwater, or Campus Master Plan.",
        "Choose an architectural typology preset (such as Urban Luxury Villa, Commercial Plaza, Industrial Warehouse, or Multi-Family High-Rise) or enter custom plot dimensions.",
        "Toggle between Imperial (Sq Ft) and Metric (m\u00b2) units.",
        "Enter Total Site Plot Area, Building Ground Footprint (Plinth), Paved Hardscape, and Porous/Turf Paver areas.",
        "Review the real-time Ground Coverage Ratio (GCR %), Open Space Ratio (OSR %), Impervious Cover %, Stormwater Runoff Peak (L/s), 5x5 sensitivity matrix, and export the compliance report."
    ],
    "faqs": [
        {
            "question": "What is Site Ground Coverage Ratio (GCR) and how is it calculated?",
            "answer": "Site Ground Coverage Ratio (GCR %), also termed Maximum Ground Coverage (MGC) or Building Footprint Percentage, represents the proportion of a plot's horizontal land area covered by the ground plinth of all permanent structures. It is calculated as GCR = (Total Building Ground Footprint Area / Total Site Plot Area) \u00d7 100%. The remaining unbuilt land represents the Open Space Ratio (OSR = 100% - GCR)."
        },
        {
            "question": "What is the difference between Ground Coverage Ratio (GCR) and Floor Area Ratio (FAR / FSI)?",
            "answer": "Ground Coverage Ratio (GCR) is a two-dimensional horizontal constraint that measures only the footprint of the building touching the ground. Floor Area Ratio (FAR) or Floor Space Index (FSI) is a three-dimensional volumetric constraint that measures the total gross floor area across all vertical stories combined divided by plot area. A plot with 40% GCR and an FAR of 2.0 can accommodate a 5-story building (5 \u00d7 40% = 200% gross area)."
        },
        {
            "question": "Why do municipal zoning bylaws mandate maximum site coverage limits?",
            "answer": "Municipal development authorities enforce ground coverage ceilings (typically 30% to 65% depending on zoning classification) to ensure adequate natural light, cross ventilation, emergency vehicle fire access lanes, mandatory boundary setbacks, on-site rainwater infiltration, and open recreational green spaces that counteract the urban heat island effect."
        },
        {
            "question": "What qualifies as permeable green space vs. impervious hardscape?",
            "answer": "Impervious surfaces (such as concrete slab foundations, asphalt driveways, and tiled terraces) prevent water infiltration, causing 80\u201395% of rainfall to become surface runoff. Permeable surfaces (such as natural lawns, landscaped planting beds, and gravel/turf grid pavers) allow direct rainwater absorption into the subsoil, reducing stormwater drainage load and recharging local groundwater tables."
        },
        {
            "question": "How does building site coverage impact urban stormwater discharge?",
            "answer": "Using the Rational Method (Q = C \u00b7 I \u00b7 A), peak stormwater discharge is directly proportional to the weighted runoff coefficient (C_comp). High site coverage with paved surfaces yields a high runoff coefficient (C \u2248 0.85\u20130.90), causing flash flooding in municipal storm mains. Lowering coverage and incorporating porous paving lowers C toward 0.30\u20130.45, retaining stormwater on-site."
        }
    ],
    "sections": [
        {
            "title": "Site Planning Principles: Ground Coverage Ratio (GCR) and Open Space Ratios (OSR)",
            "content": "Site planning is the fundamental discipline in architecture and urban design that organizes buildings, vehicular circulation, pedestrian pathways, and natural landscape on a designated parcel of land. The Ground Coverage Ratio (GCR = A_footprint / A_plot \u00d7 100%) establishes the primary horizontal footprint density. Balancing built plinth areas against Open Space Ratios (OSR = 100% - GCR) ensures that development remains environmentally sustainable, aesthetically harmonious, and structurally compliant with municipal master plans."
        },
        {
            "title": "Ground Coverage vs. Floor Area Ratio (FAR): 2D Footprint vs. 3D Volume",
            "content": "A common point of confusion in property development is distinguishing between Ground Coverage and Floor Area Ratio (FAR / FSI). While GCR governs the horizontal land take of the ground floor plinth, FAR dictates total allowable built volume: FAR = Total Gross Built-Up Area / Plot Area. For instance, on a 10,000 sq ft plot with 40% allowable GCR and 2.0 FAR, a developer can build a 4,000 sq ft ground footprint across 5 stories (4,000 \u00d7 5 = 20,000 sq ft total) or a 2,000 sq ft footprint across 10 stories."
        },
        {
            "title": "Municipal Zoning Bylaws and Building Footprint Regulations (NBC & IBC)",
            "content": "Standard building codes\u2014such as the National Building Code of India (NBC), the International Building Code (IBC), and UK Town and Country Planning Acts\u2014prescribe strict maximum permissible ground coverage caps based on land-use typology: (1) Low-density residential villas typically permit 35%\u201345% coverage; (2) Multi-family residential high-rises restrict tower plinths to 25%\u201335% coverage to maximize podium gardens; (3) Commercial retail hubs permit 50%\u201365%; and (4) Industrial logistics warehouses permit up to 60%\u201370% for heavy logistics operations."
        },
        {
            "title": "Permeable Urban Surfaces and Stormwater Runoff Mitigation (Rational Method)",
            "content": "The environmental footprint of a development depends heavily on surface permeability. Civil engineers apply the Rational Method Q = (C \u00b7 I \u00b7 A) / 3.6 to calculate peak stormwater discharge. Weighted runoff coefficients range from C = 0.90 for concrete roof slabs, C = 0.85 for asphalt driveways, down to C = 0.15 for natural softscape lawns. Incorporating semi-permeable grass pavers (C \u2248 0.40) and retention bioswales dramatically reduces stormwater infrastructure sizing requirements and urban flash flood risks."
        },
        {
            "title": "Sustainable Master Planning: LEED Green Factor and Urban Heat Island Reduction",
            "content": "Modern green building rating systems (such as LEED, BREEAM, and IGBC) award significant certification credits for low impervious cover ratios and high Urban Green Factors (UGF). Minimizing hardscape and maximizing shaded vegetative canopies mitigates the Urban Heat Island (UHI) effect, lowering ambient microclimate temperatures by 2\u00b0C to 5\u00b0C, reducing building cooling energy loads, and enhancing urban biodiversity."
        }
    ]
},
  {
    "id": "SetbackCalculator",
    "slug": "setback-calculator",
    "name": "Setback Calculator",
    "category": "architecture",
    "subcategory": "Site Planning",
    "shortDescription": "Determine front, rear, and side setback boundary clearance lines based on building height and road widths.",
    "metaTitle": "Building Setback Calculator | Front, Rear & Side Yards",
    "metaDescription": "Free online Setback Calculator. Determine front yard, rear yard, and side boundary setback requirements based on plot size and building height.",
    "keywords": [
      "setback calculator",
      "building setback calculator",
      "calculate yard setback",
      "front setback calculator",
      "side yard setback calculator",
      "property boundary setback estimator"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Setback Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Setback Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "BuildingHeightCalculator",
    "slug": "building-height-calculator",
    "name": "Building Height Calculator",
    "category": "architecture",
    "subcategory": "Site Planning",
    "shortDescription": "Calculate maximum permissible building height based on adjacent road widths, setbacks, and angular height planes.",
    "metaTitle": "Building Height Calculator | Permissible Height & Setback Angles",
    "metaDescription": "Free online Building Height Calculator. Calculate max permissible building height based on road width, setbacks, angular planes, and local municipal bylaws.",
    "keywords": [
      "building height calculator",
      "calculate max building height",
      "municipal building height limits",
      "building height road width ratio",
      "height clearance calculator",
      "angular height plane bylaws"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Building Height Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Building Height Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "ShadowLengthCalculator",
    "slug": "shadow-length-calculator",
    "name": "Shadow Length Calculator",
    "category": "architecture",
    "subcategory": "Site Planning",
    "shortDescription": "Compute architectural shadow cast lengths based on sun angles.",
    "metaDescription": "Free online Shadow Length Calculator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Shadow Length Calculator",
      "Shadow Length Calculator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Shadow Length Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Shadow Length Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "SunPathCalculator",
    "slug": "sun-path-calculator",
    "name": "Sun Path Calculator",
    "category": "architecture",
    "subcategory": "Site Planning",
    "shortDescription": "Calculate solar angles, azimuth, and elevation for site coordinates.",
    "metaDescription": "Free online Sun Path Calculator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Sun Path Calculator",
      "Sun Path Calculator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Sun Path Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Sun Path Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "SiteOrientationTool",
    "slug": "site-orientation-tool",
    "name": "Site Orientation Tool",
    "category": "architecture",
    "subcategory": "Site Planning",
    "shortDescription": "Analyze building orientation parameters for passive solar design.",
    "metaDescription": "Free online Site Orientation Tool. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Site Orientation Tool",
      "Site Orientation Tool calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Site Orientation Tool?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Site Orientation Tool",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "WindDirectionAnalyzer",
    "slug": "wind-direction-analyzer",
    "name": "Wind Direction Analyzer",
    "category": "architecture",
    "subcategory": "Site Planning",
    "shortDescription": "Evaluate prevailing wind patterns for natural ventilation placement.",
    "metaDescription": "Free online Wind Direction Analyzer. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Wind Direction Analyzer",
      "Wind Direction Analyzer calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Wind Direction Analyzer?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Wind Direction Analyzer",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "SiteSlopeCalculator",
    "slug": "site-slope-calculator",
    "name": "Site Slope Calculator",
    "category": "architecture",
    "subcategory": "Site Planning",
    "shortDescription": "Calculate site terrain slopes and grading rise/run percentages.",
    "metaTitle": "Site Slope Calculator \u2013 Terrain Gradient, Elevation Rise/Run & Grading",
    "metaDescription": "Calculate site slope percentage, elevation rise/run, slope angles (degrees/pitch), 1:N ratios, ADA/driveway compliance, and cut/fill earthwork volume.",
    "keywords": [
        "site slope calculator",
        "slope percentage calculator",
        "rise and run calculator",
        "site grading calculator",
        "elevation slope calculator",
        "terrain slope angle calculator",
        "cut and fill slope calculator",
        "ada ramp slope calculator"
    ],
    "icon": "Mountain",
    "howToUse": [
        "Select your measurement unit system: Feet / Inches (Imperial) or Meters (Metric).",
        "Choose an analytical mode: Elevation Points (Z\u2081\u2013Z\u2082), Rise & Run Direct, Terrain Suitability, Cut & Fill Earthwork, ADA / Road Compliance, or Multi-Segment Transect.",
        "Select a topographical preset (such as Optimal Residential Grading, Steep Driveway, ADA Walkway, or Terraced Villa Pad) or input custom elevations and distances.",
        "Enter Station A Elevation (Z\u2081), Station B Elevation (Z\u2082), and Horizontal Run distance.",
        "Examine the real-time Slope Percentage, Slope Angle (\u03b8\u00b0), 1:N Ratio, Pitch (in/ft), 2D Elevation Profile diagram, and 5x5 sensitivity matrix.",
        "Copy or export the comprehensive civil engineering grading report for architectural site plans."
    ],
    "faqs": [
        {
            "question": "How is site slope percentage calculated from elevation rise and run?",
            "answer": "Site slope percentage is calculated using the fundamental civil engineering gradient formula: Slope % = (Elevation Rise / Horizontal Run) \u00d7 100%, where Elevation Rise is the vertical elevation difference (\u0394Z = Z\u2082 - Z\u2081) and Horizontal Run is the horizontal distance between two survey stations. For example, a 3.5 ft rise over a 100 ft run yields a 3.5% slope (1:28.6 ratio, 2.00\u00b0 angle, 0.42 in/ft pitch)."
        },
        {
            "question": "What are the ideal site slope thresholds for residential and commercial building construction?",
            "answer": "Standard architectural guidelines classify terrain slopes as follows: (1) 0%\u20132%: Flat (drainage ponding hazard; requires min 1.5\u20132% positive grading away from foundations); (2) 2%\u20135%: Gentle (ideal building zone, universal accessibility, positive gravity drainage, minimal earthwork); (3) 5%\u201310%: Moderate (suitable for single-family homes, minor stepped foundations); (4) 10%\u201315%: Steep (requires engineered retaining walls, walk-out basements; max driveway limit); (5) >15%: Severe (high earthwork costs, stepped terraces, pile foundations, severe landslide risk)."
        },
        {
            "question": "What is the maximum permissible driveway slope in municipal building codes?",
            "answer": "Most municipal building codes (such as the International Residential Code and local municipal bylaws) specify an ideal driveway slope of 2% to 10%, with a maximum statutory ceiling of 12% to 15%. Driveways exceeding 10% require transitional blending curves (crest and sag vertical curves of 5%\u20138% for a distance of 10\u201315 feet) at the garage threshold and street apron to prevent vehicular undercarriage bottoming and bumper scraping."
        },
        {
            "question": "How do ADA and NBC accessibility standards define maximum ramp and walkway slopes?",
            "answer": "Under ADA Standards (Section 405) and NBC 2016 / Harmonised Guidelines 2021: (1) Maximum wheelchair ramp slope is 1:12 (8.33% / 4.76\u00b0) for a maximum vertical rise of 30 inches (750 mm) between intermediate level resting landings (60\" \u00d7 60\"); (2) Accessible pedestrian pathways and sidewalks without handrails must not exceed 1:20 (5.00% / 2.86\u00b0); (3) Cross-slopes across pedestrian walkways must not exceed 1:48 (2.08%) to prevent wheelchair veering."
        },
        {
            "question": "How does cut-and-fill grading work on sloped terrain to minimize earthwork costs?",
            "answer": "Cut-and-fill grading levels sloped topography into a flat building pad by excavating earth from the uphill portion (cut) and placing/compacting that soil on the downhill portion (fill). By setting the target finished pad elevation to the natural ground midpoint (Z_pad = (Z\u2081 + Z\u2082)/2), the cut volume approximately equals the fill volume (mass-haul balance). This eliminates the expensive need to import borrow fill or export surplus soil to off-site disposal facilities."
        }
    ],
    "sections": [
        {
            "title": "Topographical Surveying Fundamentals: Spot Elevations, Rise, Run & Gradients",
            "content": "Site surveying establishes the baseline geometrical profile of a land parcel prior to architectural design and engineering. Spot elevations (Z\u2081, Z\u2082) recorded across known horizontal baselines (D) define the slope vector. The vertical elevation difference (Rise \u0394Z = Z\u2082 - Z\u2081) divided by horizontal run yields the dimensionless decimal gradient, converted into percentage (Slope % = Rise/Run \u00d7 100%), angular inclination (\u03b8 = arctan(Rise/Run)), slope ratio (1:N where N = Run/Rise), and architectural pitch (in/ft). The true three-dimensional surface distance along the ground follows the Pythagorean hypotenuse L_slope = \u221a(\u0394Z\u00b2 + D\u00b2)."
        },
        {
            "title": "Site Grading & Terracing Classification for Architectural Planning",
            "content": "A site's natural slope dictates its structural feasibility, foundation typology, and development costs: (1) Flat Terrain (0%\u20132%): Prone to surface water pooling and foundation dampness; requires grading ground at minimum 2% away from exterior walls for 10 feet; (2) Gentle Slopes (2%\u20135%): The global standard for optimal construction, offering natural gravity stormwater shedding without erosion; (3) Moderate Slopes (5%\u201310%): Accommodates stepped footings and daylight basements with manageable driveway approaches; (4) Steep Slopes (10%\u201325%): Demands engineered reinforced concrete retaining walls, soil nailing, and stepped terracing; (5) Mountainous Terrain (>25%): Highly restricted in urban zoning codes due to slope failure and mudslide hazards."
        },
        {
            "title": "Driveway, Roadway, and Universal Access (ADA / NBC) Slope Regulations",
            "content": "Civil infrastructure operates under strict gradient limits to ensure safety and universal accessibility. Wheelchair ramps are legally capped at 1:12 (8.33%) with mandatory dual handrails, continuous edge protection, and slip-resistant tactile paving. General pedestrian walkways are capped at 1:20 (5.0%) to prevent ambulatory fatigue. Parking lot stalls must be maintained between 1.0% and 3.0% (max 5.0%) to prevent vehicle rollaway and car door closure hazards. Residential driveways are limited to 12%\u201315% with smooth vertical transition curves at roadway intersections."
        },
        {
            "title": "Volumetric Earthwork Optimization: Cut-and-Fill Mass Haul Balancing",
            "content": "Grading hillside properties requires precise volumetric calculations to achieve mass-haul equilibrium. Civil engineers model the building pad as prismoidal geometric wedges where Cut Volume V_cut = 0.5 \u00d7 W_pad \u00d7 L_cut \u00d7 \u0394h_cut and Fill Volume V_fill = 0.5 \u00d7 W_pad \u00d7 L_fill \u00d7 \u0394h_fill. Balancing excavation and embankment quantities minimizes diesel machinery operational hours, carbon emissions, and municipal tipping fees. Soil compaction factors (typically 10%\u201315% volume shrinkage upon mechanical vibratory rolling) must be incorporated into earthwork volume scheduling."
        },
        {
            "title": "Surface Hydrology, Erosion Control, and Stormwater Swale Gradients",
            "content": "Slope steepness is the primary driver of urban stormwater runoff velocity. By Manning's equation (v = (1/n) \u00b7 R^(2/3) \u00b7 S^(1/2)), runoff speed increases with the square root of slope. Slopes above 10% generate high-velocity turbulent sheet flow capable of scouring topsoil and undermining structural footings. Civil site plans incorporate vegetated bio-swales graded at 2% to 4% longitudinal slopes with riprap check dams and French drains to slow runoff velocity, promote infiltration, and filter suspended sediments before discharging into municipal storm mains."
        }
    ]
},
  {
    "id": "ContourIntervalCalculator",
    "slug": "contour-interval-calculator",
    "name": "Contour Interval Calculator",
    "category": "architecture",
    "subcategory": "Site Planning",
    "shortDescription": "Determine contour line heights and elevations from site map intervals.",
    "metaDescription": "Free online Contour Interval Calculator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Contour Interval Calculator",
      "Contour Interval Calculator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Contour Interval Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Contour Interval Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "ArchitecturalScaleCalculator",
    "slug": "architectural-scale-calculator",
    "name": "Architectural Scale Calculator",
    "category": "architecture",
    "subcategory": "Drawing & Scale Tools",
    "shortDescription": "Convert physical drawing dimensions to real-world architectural lengths.",
    "metaDescription": "Free online Architectural Scale Calculator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Architectural Scale Calculator",
      "Architectural Scale Calculator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Architectural Scale Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Architectural Scale Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "DrawingScaleConverter",
    "slug": "drawing-scale-converter",
    "name": "Drawing Scale Converter",
    "category": "architecture",
    "subcategory": "Drawing & Scale Tools",
    "shortDescription": "Convert dimensions between metric and imperial scale ratios.",
    "metaDescription": "Free online Drawing Scale Converter. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Drawing Scale Converter",
      "Drawing Scale Converter calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Drawing Scale Converter?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Drawing Scale Converter",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "ScaleFactorCalculator",
    "slug": "scale-factor-calculator",
    "name": "Scale Factor Calculator",
    "category": "architecture",
    "subcategory": "Drawing & Scale Tools",
    "shortDescription": "Calculate conversion multiplier scale factors for CAD and printing.",
    "metaDescription": "Free online Scale Factor Calculator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Scale Factor Calculator",
      "Scale Factor Calculator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Scale Factor Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Scale Factor Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "BlueprintAreaCalculator",
    "slug": "blueprint-area-calculator",
    "name": "Blueprint Area Calculator",
    "category": "architecture",
    "subcategory": "Drawing & Scale Tools",
    "shortDescription": "Estimate actual site and room areas directly from scaled drawings.",
    "metaDescription": "Free online Blueprint Area Calculator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Blueprint Area Calculator",
      "Blueprint Area Calculator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Blueprint Area Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Blueprint Area Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "PDFScaleMeasurementTool",
    "slug": "pdf-scale-measurement-tool",
    "name": "PDF Scale Measurement Tool",
    "category": "architecture",
    "subcategory": "Drawing & Scale Tools",
    "shortDescription": "Calibrate and measure lengths on PDF drawings using dynamic scaling.",
    "metaDescription": "Free online PDF Scale Measurement Tool. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "PDF Scale Measurement Tool",
      "PDF Scale Measurement Tool calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the PDF Scale Measurement Tool?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for PDF Scale Measurement Tool",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "CADScaleConverter",
    "slug": "cad-scale-converter",
    "name": "CAD Scale Converter",
    "category": "architecture",
    "subcategory": "Drawing & Scale Tools",
    "shortDescription": "Calculate model space vs layout space viewport scale factors.",
    "metaDescription": "Free online CAD Scale Converter. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "CAD Scale Converter",
      "CAD Scale Converter calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the CAD Scale Converter?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for CAD Scale Converter",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "PolygonAreaCalculator",
    "slug": "polygon-area-calculator",
    "name": "Polygon Area Calculator",
    "category": "architecture",
    "subcategory": "Geometry",
    "shortDescription": "Calculate the area of regular and irregular multi-sided polygons.",
    "metaDescription": "Free online Polygon Area Calculator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Polygon Area Calculator",
      "Polygon Area Calculator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Polygon Area Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Polygon Area Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "TriangleCalculator",
    "slug": "triangle-calculator",
    "name": "Triangle Calculator",
    "category": "architecture",
    "subcategory": "Geometry",
    "shortDescription": "Compute triangle areas, perimeter, side lengths, and angle values.",
    "metaDescription": "Free online Triangle Calculator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Triangle Calculator",
      "Triangle Calculator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Triangle Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Triangle Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "CircleCalculator",
    "slug": "circle-calculator",
    "name": "Circle Calculator",
    "category": "architecture",
    "subcategory": "Geometry",
    "shortDescription": "Calculate circle area, diameter, circumference, and sectors.",
    "metaDescription": "Free online Circle Calculator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Circle Calculator",
      "Circle Calculator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Circle Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Circle Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "ArcCalculator",
    "slug": "arc-calculator",
    "name": "Arc Calculator",
    "category": "architecture",
    "subcategory": "Geometry",
    "shortDescription": "Compute arch and curved wall lengths, radii, and chord details.",
    "metaDescription": "Free online Arc Calculator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Arc Calculator",
      "Arc Calculator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Arc Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Arc Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "AngleCalculator",
    "slug": "angle-calculator",
    "name": "Angle Calculator",
    "category": "architecture",
    "subcategory": "Geometry",
    "shortDescription": "Determine pitch, slope angles, and trigonometric corner angles.",
    "metaDescription": "Free online Angle Calculator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Angle Calculator",
      "Angle Calculator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Angle Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Angle Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "RadiusDiameterCalculator",
    "slug": "radius-diameter-calculator",
    "name": "Radius & Diameter Calculator",
    "category": "architecture",
    "subcategory": "Geometry",
    "shortDescription": "Convert and calculate circle properties from radius and diameter.",
    "metaDescription": "Free online Radius & Diameter Calculator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Radius & Diameter Calculator",
      "Radius & Diameter Calculator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Radius & Diameter Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Radius & Diameter Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "DaylightFactorCalculator",
    "slug": "daylight-factor-calculator",
    "name": "Daylight Factor Calculator",
    "category": "architecture",
    "subcategory": "Lighting & Environmental",
    "shortDescription": "Calculate indoor daylight factor percentages for spatial illumination.",
    "metaDescription": "Free online Daylight Factor Calculator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Daylight Factor Calculator",
      "Daylight Factor Calculator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Daylight Factor Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Daylight Factor Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "WindowToWallRatioCalculator",
    "slug": "window-to-wall-ratio-calculator",
    "name": "Window-to-Wall Ratio Calculator",
    "category": "architecture",
    "subcategory": "Lighting & Environmental",
    "shortDescription": "Compute WWR percentages for thermal and lighting efficiency compliance.",
    "metaDescription": "Free online Window-to-Wall Ratio Calculator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Window-to-Wall Ratio Calculator",
      "Window-to-Wall Ratio Calculator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Window-to-Wall Ratio Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Window-to-Wall Ratio Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "NaturalLightingCalculator",
    "slug": "natural-lighting-calculator",
    "name": "Natural Lighting Calculator",
    "category": "architecture",
    "subcategory": "Lighting & Environmental",
    "shortDescription": "Estimate solar lux levels inside rooms based on glazing features.",
    "metaDescription": "Free online Natural Lighting Calculator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Natural Lighting Calculator",
      "Natural Lighting Calculator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Natural Lighting Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Natural Lighting Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "SolarExposureCalculator",
    "slug": "solar-exposure-calculator",
    "name": "Solar Exposure Calculator",
    "category": "architecture",
    "subcategory": "Lighting & Environmental",
    "shortDescription": "Evaluate solar radiation exposure on facade surfaces.",
    "metaDescription": "Free online Solar Exposure Calculator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Solar Exposure Calculator",
      "Solar Exposure Calculator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Solar Exposure Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Solar Exposure Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "RoomVentilationCalculator",
    "slug": "room-ventilation-calculator",
    "name": "Room Ventilation Calculator",
    "category": "architecture",
    "subcategory": "Lighting & Environmental",
    "shortDescription": "Calculate air change rates (ACH) and openable window areas.",
    "metaDescription": "Free online Room Ventilation Calculator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Room Ventilation Calculator",
      "Room Ventilation Calculator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Room Ventilation Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Room Ventilation Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "BuildingOrientationCalculator",
    "slug": "building-orientation-calculator",
    "name": "Building Orientation Calculator",
    "category": "architecture",
    "subcategory": "Lighting & Environmental",
    "shortDescription": "Optimize building solar paths for thermal load distributions.",
    "metaDescription": "Free online Building Orientation Calculator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Building Orientation Calculator",
      "Building Orientation Calculator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Building Orientation Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Building Orientation Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "OccupantLoadCalculator",
    "slug": "occupant-load-calculator",
    "name": "Occupant Load Calculator",
    "category": "architecture",
    "subcategory": "Building Code Helpers",
    "shortDescription": "Determine occupant load factor codes for various assembly categories.",
    "metaDescription": "Free online Occupant Load Calculator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Occupant Load Calculator",
      "Occupant Load Calculator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Occupant Load Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Occupant Load Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "ExitCapacityCalculator",
    "slug": "exit-capacity-calculator",
    "name": "Exit Capacity Calculator",
    "category": "architecture",
    "subcategory": "Building Code Helpers",
    "shortDescription": "Compute total escape egress widths for emergency exits.",
    "metaDescription": "Free online Exit Capacity Calculator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Exit Capacity Calculator",
      "Exit Capacity Calculator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Exit Capacity Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Exit Capacity Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "AccessibleRampCalculator",
    "slug": "accessible-ramp-calculator",
    "name": "Accessible Ramp Calculator",
    "category": "architecture",
    "subcategory": "Building Code Helpers",
    "shortDescription": "Calculate disabled-access ramp slopes conforming to ADA/Bylaw standards.",
    "metaDescription": "Calculate wheelchair and disabled-access ramp slopes, runs, landing platforms, CAD blueprints, and RCC BOQ conforming to Harmonised Guidelines 2021, NBC 2016, and ADA.",
    "keywords": [
      "accessible ramp calculator",
      "wheelchair ramp slope calculator",
      "ADA ramp calculator",
      "disabled access ramp design",
      "NBC India ramp slope",
      "harmonised guidelines 2021 ramp",
      "switchback ramp calculator",
      "ramp gradient calculator 1:12 1:15",
      "ramp landing platform dimensions",
      "stretcher ramp slope",
      "dual handrail height ramp",
      "ramp material takeoff calculator"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your accessibility code standard (Harmonised Guidelines 2021, NBC 2016 Part 3, ADA 2010, UK Part M, or Hospital Stretcher).",
      "Choose your layout geometry: Straight Run, L-Shaped (90° Corner Turn), or Switchback (180° Dog-Leg).",
      "Enter your total vertical rise and preferred clear passage width in mm, meters, inches, or feet.",
      "Inspect the live 2D Elevation and Plan View CAD blueprints with wheelchair turning clearances and compliance status badges.",
      "Review the automated RCC concrete takeoff, dual SS 304 handrail quantities, and export professional PDF compliance reports or Excel workbooks."
    ],
    "faqs": [
      {
        "question": "What is the maximum permissible ramp slope for wheelchair access in India?",
        "answer": "Under the CPWD / MoHUA Harmonised Guidelines 2021 and NBC 2016 Part 3, the maximum permissible slope is 1:12 (8.33%) for short vertical rises up to 150 mm. For longer runs and general building entry, a gentler slope of 1:15 (6.67%) to 1:20 (5.0%) is strongly recommended to allow unassisted wheelchair propulsion."
      },
      {
        "question": "When are intermediate resting landings required on an accessible ramp?",
        "answer": "An intermediate level resting landing (minimum 1500 mm × 1500 mm / 60\" × 60\") is mandatory whenever the vertical rise of a single flight reaches 750 mm (30 inches under ADA) or the horizontal run exceeds 9.0 meters (30 feet). Landings must also be provided at every change of direction (90° or 180° turns)."
      },
      {
        "question": "What are the dual handrail height requirements for disabled-access ramps?",
        "answer": "Harmonised Guidelines 2021 and NBC 2016 mandate continuous dual handrails on both sides of the ramp: an upper rail at 900 mm for standing persons and a lower rail at 760 mm for wheelchair users. Handrails must extend at least 300 mm (12 inches) horizontally beyond the top and bottom of the ramp with rounded downward return ends."
      },
      {
        "question": "What is the minimum clear passage width for accessible ramps?",
        "answer": "Under Harmonised Guidelines 2021, the minimum clear width between inner handrails is 1200 mm for residential/internal ramps, 1500 mm for public and commercial buildings to allow two-way passing, and 1800 mm to 2000 mm for hospital stretcher and emergency bed transfer ramps."
      },
      {
        "question": "Why is a switchback (180° U-turn) ramp layout advantageous?",
        "answer": "A switchback ramp divides a long vertical rise into two or more parallel flights connected by a 180° intermediate turning landing. This halves the linear footprint requirement, making it ideal for compact entry plinths and building verandas while maintaining compliant gentle slopes."
      }
    ],
    "sections": [
      {
        "title": "Harmonised Guidelines 2021 & NBC 2016 Accessibility Norms",
        "content": "The Ministry of Housing and Urban Affairs (MoHUA) Harmonised Guidelines and Space Standards for Barrier-Free Built Environment for Persons with Disabilities (2021) specify strict geometric requirements:\n- **Maximum Gradient**: 1:12 for rise ≤150 mm, 1:15 for rise 150–500 mm, 1:20 for rise >500 mm.\n- **Clear Width**: Minimum 1500 mm for public buildings; 1800 mm for hospital stretchers.\n- **Level Landings**: Minimum 1500 × 1500 mm at top, bottom, and every 750 mm vertical rise.\n- **Edge Kerb**: Minimum 75 mm raised edge protection to prevent wheel roll-off.\n- **Tactile Warning (TGSI)**: 300 mm deep hazard warning strip with domed studs set 300 mm before landings."
      },
      {
        "title": "ADA 2010 Standards vs Indian NBC Code Comparison",
        "content": "- **ADA 2010 (Section 405)**: Max slope 1:12 (8.33%), max single rise 30\" (762 mm), min clear width 36\" (915 mm), landings 60\" × 60\" (1525 × 1525 mm), handrail height 34\"–38\" (865–965 mm).\n- **NBC 2016 / Harmonised 2021**: Max slope 1:12 (ideal 1:15–1:20), max single rise 750 mm, min clear width 1200–1500 mm, landings 1500 × 1500 mm, dual handrails at 900 mm and 760 mm."
      }
    ]
  },
  {
    "id": "AccessibleToiletClearanceCalculator",
    "slug": "accessible-toilet-clearance-calculator",
    "name": "Accessible Toilet Clearance Calculator",
    "category": "architecture",
    "subcategory": "Building Code Helpers",
    "shortDescription": "Verify accessible toilet clearances and turning space layouts.",
    "metaDescription": "Free online Accessible Toilet Clearance Calculator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Accessible Toilet Clearance Calculator",
      "Accessible Toilet Clearance Calculator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Accessible Toilet Clearance Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Accessible Toilet Clearance Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "ParkingRequirementCalculator",
    "slug": "parking-requirement-calculator",
    "name": "Parking Requirement Calculator",
    "category": "architecture",
    "subcategory": "Building Code Helpers",
    "shortDescription": "Calculate mandatory parking bays required based on floor area.",
    "metaDescription": "Free online Parking Requirement Calculator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Parking Requirement Calculator",
      "Parking Requirement Calculator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Parking Requirement Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Parking Requirement Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "FireEscapeTravelDistanceCalculator",
    "slug": "fire-escape-travel-distance-calculator",
    "name": "Fire Escape Travel Distance Calculator",
    "category": "architecture",
    "subcategory": "Building Code Helpers",
    "shortDescription": "Verify exit travel path distance compliance limits.",
    "metaDescription": "Free online Fire Escape Travel Distance Calculator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Fire Escape Travel Distance Calculator",
      "Fire Escape Travel Distance Calculator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Fire Escape Travel Distance Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Fire Escape Travel Distance Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "FloorAreaEstimator",
    "slug": "floor-area-estimator",
    "name": "Floor Area Estimator",
    "category": "architecture",
    "subcategory": "Estimation",
    "shortDescription": "Estimate gross and net floor area splits for multi-story buildings.",
    "metaDescription": "Free online Floor Area Estimator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Floor Area Estimator",
      "Floor Area Estimator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Floor Area Estimator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Floor Area Estimator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "BuildingVolumeCalculator",
    "slug": "building-volume-calculator",
    "name": "Building Volume Calculator",
    "category": "architecture",
    "subcategory": "Estimation",
    "shortDescription": "Calculate total building envelope volume for HVAC and cost projections.",
    "metaDescription": "Free online Building Volume Calculator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Building Volume Calculator",
      "Building Volume Calculator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Building Volume Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Building Volume Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "FacadeAreaCalculator",
    "slug": "facade-area-calculator",
    "name": "Facade Area Calculator",
    "category": "architecture",
    "subcategory": "Estimation",
    "shortDescription": "Calculate exterior wall facade surface areas for cladding estimation.",
    "metaDescription": "Free online Facade Area Calculator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Facade Area Calculator",
      "Facade Area Calculator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Facade Area Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Facade Area Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "WallAreaCalculator",
    "slug": "wall-area-calculator",
    "name": "Wall Area Calculator",
    "category": "architecture",
    "subcategory": "Estimation",
    "shortDescription": "Calculate internal wall surface areas subtracting door/window openings.",
    "metaDescription": "Free online Wall Area Calculator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Wall Area Calculator",
      "Wall Area Calculator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Wall Area Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Wall Area Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "GlassAreaCalculator",
    "slug": "glass-area-calculator",
    "name": "Glass Area Calculator",
    "category": "architecture",
    "subcategory": "Estimation",
    "shortDescription": "Estimate structural glass and glazing area weights.",
    "metaDescription": "Free online Glass Area Calculator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Glass Area Calculator",
      "Glass Area Calculator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Glass Area Calculator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Glass Area Calculator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "MaterialQuantityEstimator",
    "slug": "material-quantity-estimator",
    "name": "Material Quantity Estimator",
    "category": "architecture",
    "subcategory": "Estimation",
    "shortDescription": "Determine standard cement, bricks, and concrete quantities for basic modules.",
    "metaDescription": "Free online Material Quantity Estimator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Material Quantity Estimator",
      "Material Quantity Estimator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Material Quantity Estimator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Material Quantity Estimator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "DWGVersionChecker",
    "slug": "dwg-version-checker",
    "name": "DWG Version Checker",
    "category": "architecture",
    "subcategory": "CAD & BIM Utilities",
    "shortDescription": "Identify the release version and format of DWG file drawing headers.",
    "metaDescription": "Free online DWG Version Checker. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "DWG Version Checker",
      "DWG Version Checker calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the DWG Version Checker?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for DWG Version Checker",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "DXFViewer",
    "slug": "dxf-viewer",
    "name": "DXF Viewer",
    "category": "architecture",
    "subcategory": "CAD & BIM Utilities",
    "shortDescription": "Inspect drawing exchanges and vector entities in browser.",
    "metaDescription": "Free online DXF Viewer. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "DXF Viewer",
      "DXF Viewer calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the DXF Viewer?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for DXF Viewer",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "CADLayerCounter",
    "slug": "cad-layer-counter",
    "name": "CAD Layer Counter",
    "category": "architecture",
    "subcategory": "CAD & BIM Utilities",
    "shortDescription": "Count and list layers inside CAD dxf/dwg structural formats.",
    "metaDescription": "Free online CAD Layer Counter. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "CAD Layer Counter",
      "CAD Layer Counter calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the CAD Layer Counter?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for CAD Layer Counter",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "BIMFileInformationViewer",
    "slug": "bim-file-information-viewer",
    "name": "BIM File Information Viewer",
    "category": "architecture",
    "subcategory": "CAD & BIM Utilities",
    "shortDescription": "Read basic metadata from IFC and Revit file formats.",
    "metaDescription": "Free online BIM File Information Viewer. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "BIM File Information Viewer",
      "BIM File Information Viewer calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the BIM File Information Viewer?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for BIM File Information Viewer",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "DrawingRevisionComparator",
    "slug": "drawing-revision-comparator",
    "name": "Drawing Revision Comparator",
    "category": "architecture",
    "subcategory": "CAD & BIM Utilities",
    "shortDescription": "Visually overlay and compare revisions of architectural drawings.",
    "metaDescription": "Free online Drawing Revision Comparator. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "Drawing Revision Comparator",
      "Drawing Revision Comparator calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the Drawing Revision Comparator?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for Drawing Revision Comparator",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "PDFDrawingMerger",
    "slug": "pdf-drawing-merger",
    "name": "PDF Drawing Merger",
    "category": "architecture",
    "subcategory": "CAD & BIM Utilities",
    "shortDescription": "Merge multi-sheet architectural blueprints into a single vector PDF file.",
    "metaDescription": "Free online PDF Drawing Merger. Calculate building dimensions, clearances, and code compliance in browser.",
    "keywords": [
      "PDF Drawing Merger",
      "PDF Drawing Merger calculator",
      "architectural planning",
      "building design"
    ],
    "icon": "Compass",
    "howToUse": [
      "Select your units (Metric or Imperial).",
      "Enter the required spatial and design parameters.",
      "Review the compliance guidelines and results.",
      "Export or copy the calculated parameters for blueprints."
    ],
    "faqs": [
      {
        "question": "What is the purpose of the PDF Drawing Merger?",
        "answer": "This calculator allows architects, engineers, and students to quickly estimate spatial profiles, verify building codes, and generate layout clearance parameters."
      }
    ],
    "sections": [
      {
        "title": "Architectural Guidelines for PDF Drawing Merger",
        "content": "Calculations comply with standard municipal zoning bylaws, building codes, and global design parameters. Double check outputs against local regulations."
      }
    ]
  },
  {
    "id": "CementCalculator",
    "slug": "cement-calculator",
    "name": "Cement Calculator & Bag Estimator India (IS 456 / IS 1661)",
    "category": "civil",
    "shortDescription": "Calculate 50kg cement bags, sand cft/brass, and aggregate required for concrete slabs, columns, beams (M5 to M30), brick masonry, and wall plastering per IS 456 & IS 1661.",
    "metaDescription": "Free Online Cement Calculator India for civil engineers & contractors. Calculate 50kg cement bags, sand, aggregate & costs for RCC slabs, columns, brickwork & plastering per IS 456, IS 1077, IS 1661.",
    "keywords": [
      "cement calculator india",
      "calculate cement bags for slab",
      "cement required for brickwork",
      "plaster cement calculation formula",
      "is 456 cement bag volume",
      "opc 53 vs ppc cement",
      "cement sand ratio calculator",
      "how many cement bags in 100 cu ft concrete",
      "cement bags for 1000 sq ft house",
      "dry volume factor 1.54 concrete",
      "plaster dry mortar multiplier 1.6",
      "is 4082 cement stacking guidelines"
    ],
    "icon": "Layers",
    "howToUse": [
      "Choose your construction discipline: Structural Concrete Elements (Slabs, Beams, Columns, Footings), Brick Masonry Mortar, or Wall/Ceiling Plastering.",
      "Select unit mode (Imperial Feet/Cu.Ft or Metric Meters/m³) and input physical member dimensions.",
      "Select the Concrete Mix Grade (M5 to M30 per IS 456), Brick Mortar Ratio (1:3 to 1:8), or Plastering Coating Specification (6mm, 12mm, 15mm, 20mm per IS 1661).",
      "Review the consolidated bill of materials, including 50kg cement bags, fine sand (CFT/Brass), 20mm coarse aggregate, curing water (Litres), and site storage footprint (IS 4082).",
      "Export estimates instantly via 1-Click WhatsApp Client Quotation, Multi-Sheet Excel (.xlsx), or high-resolution PDF report."
    ],
    "faqs": [
      {
        "question": "How many cement bags are required for 100 cu.ft of M20 concrete slab in India?",
        "answer": "100 cu.ft of wet M20 concrete (1:1.5:3 mix) equals 2.831 m³. With the 1.54x IS 456 dry volume multiplier, dry volume is 4.36 m³. Cement volume is (1 / 5.5) * 4.36 = 0.793 m³. Dividing by 0.0347 m³ per bag yields approximately 23 bags of 50kg cement, along with 35 cft of sand and 70 cft of 20mm aggregate."
      },
      {
        "question": "What is the standard volume and weight of a cement bag in India?",
        "answer": "As per Bureau of Indian Standards (BIS), 1 standard cement bag weighs 50 kg. Given standard loose cement density of 1440 kg/m³, 1 bag occupies 0.0347 cubic meters (34.7 Litres or 1.226 cubic feet). Exactly 28.8 bags equal 1 cubic meter of solid cement."
      },
      {
        "question": "Why is the dry volume multiplier 1.54 for concrete and 1.33 for mortar?",
        "answer": "When water is added to dry materials, the smaller particles of cement and sand settle into voids between coarse aggregates, causing ~54% volumetric shrinkage in concrete (1.54x multiplier). In cement-sand mortar, void shrinkage causes ~33% reduction (1.33x multiplier), while plastering uses 1.60x to account for joint filling and surface roughness."
      },
      {
        "question": "Which cement grade should be used: OPC 53 or PPC?",
        "answer": "OPC 53 Grade (IS 12269) provides high early strength and is ideal for structural RCC slabs, columns, beams, and high-rise casting. PPC (IS 1489) generates lower heat of hydration, resists chemical attack, and is superior for plastering, brickwork, mass concrete, and marine foundations to prevent shrinkage cracks."
      },
      {
        "question": "How should cement bags be stored on site per IS 4082?",
        "answer": "Cement bags must be stacked on a raised timber platform at least 150 mm above ground, kept at least 450 mm away from exterior walls, and covered with waterproof tarpaulins. Stacks should not exceed 10 to 12 bags high to prevent warehouse setting. Cement should be used within 90 days of manufacturing."
      }
    ],
    "sections": [
      {
        "title": "Indian Standard (IS) Concrete & Mortar Multipliers",
        "content": "Civil engineering quantity takeoff in India relies on IS 456:2000 (Concrete), IS 1077 (Bricks), and IS 1661:1972 (Plastering). Dry volume expansion multipliers (1.54x for concrete, 1.33x for masonry, and 1.60x for plaster) ensure that material shrinkage, joint filling, and site drops are fully accounted for during procurement."
      },
      {
        "title": "Cement Grades & Applications Matrix",
        "content": "- **OPC 53 Grade (IS 12269)**: 53 MPa 28-day strength; ideal for heavy structural RCC slabs, columns, beams, and precast elements.\n- **OPC 43 Grade (IS 8112)**: 43 MPa strength; standard for plain cement concrete, pavements, and non-critical casting.\n- **PPC (IS 1489)**: Pozzolanic cement with fly ash; superior plasticity and crack resistance for internal/external wall plastering and brick masonry.\n- **PSC (IS 455)**: Portland Slag Cement; maximum sulfate resistance for coastal and aggressive soil foundations."
      }
    ]
  },
  {
    "id": "SandCalculator",
    "slug": "sand-calculator",
    "name": "Sand Calculator",
    "category": "civil",
    "shortDescription": "Calculate sand volume in cubic feet (CFT), brass, and metric tons for concrete and mortar.",
    "metaDescription": "Calculate fine aggregate and sand requirements in CFT, Brass, and Metric Tonnes for concrete, brick masonry, and plastering per IS 383, IS 2386, and CPWD DSR.",
    "keywords": [
      "sand calculator",
      "sand volume calculator",
      "sand cft calculator",
      "sand brass calculator",
      "sand in metric tonnes",
      "river sand vs m sand",
      "p sand for plastering",
      "sand bulking calculator",
      "sand required for concrete",
      "sand required for brickwork",
      "sand required for plastering",
      "is 383 sand grading zones",
      "tractor trolley brass sand",
      "tipper sand volume",
      "cpwd sand consumption"
    ],
    "icon": "Ruler",
    "howToUse": [
      "Select your construction module: Concrete structural elements (Slabs, Beams, Columns, Footings), Brick Masonry, or Wall Plastering.",
      "Choose your mix design ratio (e.g., M20 1:1.5:3, M25 1:1:2, or Mortar 1:4 / 1:6) or enter custom wet batch volume.",
      "Input structural dimensions in feet or meters with optional opening deductions (doors/windows).",
      "Adjust sand type (River Sand, M-Sand Zone II, P-Sand Zone IV) and bulking percentage (0% to 12% moisture).",
      "Review instant material takeoff in CFT, Brass, and Metric Tonnes with truck logistics and export BOQ to PDF or Excel."
    ],
    "faqs": [
      {
        "question": "What is 1 Brass of sand in CFT and Metric Tonnes?",
        "answer": "In Indian civil engineering, 1 Brass is exactly 100 cubic feet (CFT) or 2.8317 cubic meters (m³). For River Sand with a dry bulk density of 1,600 kg/m³, 1 Brass weighs approximately 4.53 Metric Tonnes. For M-Sand (1,750 kg/m³), 1 Brass weighs approximately 4.95 Metric Tonnes."
      },
      {
        "question": "What is the bulking of sand and how does moisture affect measurement?",
        "answer": "Bulking of sand occurs when moisture forms a surface tension film around sand grains, pushing them apart and artificially increasing sand volume by 15% to 30% at 4% to 6% moisture content per IS 2386 (Part 3). If batching by volume on-site, the sand quantity must be increased by the bulking factor to prevent a cement-rich, under-sanded mortar or concrete."
      },
      {
        "question": "What is the difference between River Sand, M-Sand, and P-Sand?",
        "answer": "River Sand is naturally eroded quartz aggregate (IS 383 Zone II). M-Sand (Manufactured Sand) is crushed granite fine aggregate (Zone II, 0–4.75 mm) engineered for RCC casting with zero silt. P-Sand (Plastering Sand) is ultra-fine crushed sand (IS 1542 Zone IV, 0–2.36 mm) with washed micro-fines designed for crack-free wall plastering."
      },
      {
        "question": "How much sand is required for 100 sq.ft of 12mm wall plastering in 1:4 mix?",
        "answer": "For 100 sq.ft (9.29 m²) of 12mm thick internal plastering in 1:4 cement-sand mix: Wet volume = 0.111 m³. Applying the 1.60x dry volume and joint-filling multiplier yields 0.178 m³ (6.29 CFT or 0.063 Brass) of sand (~293 kg of P-Sand) and 1.27 bags of PPC cement."
      },
      {
        "question": "How many Brass of sand are in a Tractor Trolley, Tipper, and Hyva truck?",
        "answer": "Standard logistics in India: A standard Tractor Trolley carries 1 Brass (100 CFT / ~4.5 Tonnes), a 6-Wheeler Tipper truck carries 2.5 to 3 Brass (250–300 CFT / ~11–13.5 Tonnes), and a 10/12-Wheeler Hyva or Dumper carries 5 to 6 Brass (500–600 CFT / ~22.5–27 Tonnes)."
      }
    ],
    "sections": [
      {
        "title": "IS 383:2016 Sand Grading Zones & Material Density",
        "content": "Fine aggregate grading under IS 383:2016 is categorized into four zones based on sieve analysis:\n- **Zone I**: Coarse sand used for heavy foundation concrete and mass retaining walls.\n- **Zone II**: Medium-coarse sand ideal for RCC slabs, columns, beams, and structural load-bearing members (Bulk density: 1,600 kg/m³ for river sand, 1,750 kg/m³ for M-Sand).\n- **Zone III**: Medium-fine sand used for non-structural casting and brick masonry mortar (Bulk density: 1,550 kg/m³).\n- **Zone IV / IS 1542**: Fine sand with >90% passing 600-micron sieve; mandatory for internal and external wall plastering (P-Sand density: 1,650 kg/m³)."
      },
      {
        "title": "Dry Volume Multipliers & Bulking Correction (CPWD / IS 456)",
        "content": "To convert in-situ compacted volume to procurement dry loose volume:\n- **Concrete**: 1.54x factor accounts for dry void shrinkage among cement, fine, and coarse aggregate particles.\n- **Brick Masonry**: 1.33x factor accounts for mortar drying shrinkage and brick absorption.\n- **Plastering**: 1.60x factor combines 1.33x dry volume expansion plus 20% allowance for wall unevenness, masonry raking joints, and scaffolding drop wastage.\n- **Moisture Bulking**: $V_{corrected} = V_{dry} \\times (1 + \\frac{\\%\\text{Bulking}}{100})$ to guarantee accurate aggregate ratios during field batching."
      }
    ]
  },
  {
    "id": "PlasterCalculator",
    "slug": "plaster-calculator",
    "name": "Wall Plaster Calculator",
    "category": "civil",
    "shortDescription": "Calculate the cement bags and sand volume needed for internal and external wall plastering.",
    "metaDescription": "Calculate cement bags and sand requirements for plastering jobs. Includes wastage and thickness adjustments.",
    "keywords": ["plaster calculator", "wall plaster estimation", "plaster cement sand", "ceiling plaster calculator"],
    "icon": "Layers",
    "howToUse": [
      "Select units (Feet or Meters) and enter the plaster area.",
      "Select plaster thickness (6mm to 20mm) and mix ratio.",
      "Input a wastage factor (standard is 15-20% for uneven walls).",
      "Read the required cement bags, sand volume, and cost estimates."
    ],
    "faqs": [
      {
        "question": "What is the recommended plaster thickness?",
        "answer": "Typically, 6mm is used for ceilings, 12mm for smooth internal brick walls, and 20mm for rough external brick walls."
      }
    ],
    "sections": [
      {
        "title": "Wastage in Wall Plastering",
        "content": "Uneven masonry and joint filling consume extra mortar. Adding 15% to 20% wastage ensures you do not run out of materials on site."
      }
    ]
  },
  {
    "id": "PlotAreaCalculator",
    "slug": "plot-area-calculator",
    "name": "Plot Area Calculator",
    "category": "architecture",
    "shortDescription": "Calculate area of rectangular, triangular or irregular 4-sided plots and convert to land units.",
    "metaDescription": "Calculate land area for rectangular, triangular, trapezoidal, and irregular 4-sided or multi-point plots. Converts directly to Sq. Ft, Sq. M, Gaj (Sq. Yd), Acres, Hectares, Guntha, Cent, Ground, Bigha, Biswa, Kanal, and Marla with stamp duty and fencing estimators.",
    "keywords": [
      "plot area calculator",
      "land area calculator",
      "calculate plot size",
      "irregular plot area calculator",
      "4 sided plot area calculator",
      "bigha calculator",
      "guntha calculator",
      "cent to sq ft calculator",
      "gaj to sq ft",
      "acre to sq ft",
      "land measurement calculator india",
      "plot valuation calculator",
      "heron formula plot area"
    ],
    "icon": "Ruler",
    "howToUse": [
      "Select your plot shape: Rectangle/Square, Triangle (Heron's / Base-Height), Trapezoid (Tapered), 4-Side Irregular (Surveyor Triangulation), Multi-Point Polygon (GPS Coordinates), or Curved/Sector.",
      "Choose your input measurement unit: Feet (ft), Meters (m), or Yards (Gaj).",
      "Select your Indian State reference from the dropdown to automatically apply your local state revenue standard for Bigha, Kattha, and Biswa conversions.",
      "Enter your measured boundary side lengths. For irregular 4-sided plots, enter all 4 perimeter sides plus the corner-to-corner diagonal (AC).",
      "Inspect the live 2D proportional SVG blueprint to visually verify plot geometry, side callouts, and North orientation.",
      "Review the comprehensive Pan-India and Global conversion matrix (Sq. Ft, Sq. M, Gaj, Acres, Hectares, Guntha, Cent, Ground, Bigha, Kanal, Marla).",
      "Optionally enter your local land rate, stamp duty %, and fencing parameters to instantly calculate total market land valuation, acquisition cost, and boundary fencing requirements.",
      "Click 'Copy Report' for text documentation or 'PDF Survey' to download a clean, formatted engineering survey sheet."
    ],
    "faqs": [
      {
        "question": "How do you calculate the area of an irregular 4-sided plot accurately?",
        "answer": "To calculate the area of an irregular 4-sided plot, measure all 4 outer boundary sides (AB, BC, CD, DA) and measure one cross diagonal between opposite corners (AC). The diagonal divides the irregular quadrilateral into two separate triangles (Triangle ABC and Triangle ADC). Heron's Formula is then applied to both triangles individually (Area = √[s(s-a)(s-b)(s-c)], where s is the semi-perimeter). Adding the areas of both triangles gives the exact, mathematically proven plot area."
      },
      {
        "question": "Why is the common method of averaging opposite sides wrong for irregular plots?",
        "answer": "Many people attempt to estimate irregular land by multiplying average length by average width ([AB + CD]/2 × [BC + DA]/2). This formula is mathematically invalid for non-rectangular plots and almost always overestimates the true land area by 5% to 25%. A 4-sided quadrilateral without a fixed diagonal is geometrically flexible (infinite shapes can have the exact same 4 side lengths). Only measuring the diagonal (triangulation) fixes the angles and yields the true area."
      },
      {
        "question": "How many Square Feet are in 1 Guntha, 1 Cent, 1 Ground, and 1 Gaj?",
        "answer": "Standard conversions across Indian land revenue records: 1 Gaj (Square Yard) = 9 Sq. Ft (0.8361 m²); 1 Guntha (Maharashtra, Karnataka, Gujarat) = 1,089 Sq. Ft (33 ft × 33 ft / 121 sq yd); 1 Cent (Tamil Nadu, Kerala, AP) = 435.6 Sq. Ft (1/100th of an Acre); 1 Ground (Tamil Nadu / Chennai) = 2,400 Sq. Ft; 1 Acre = 43,560 Sq. Ft (40 Gunthas / 100 Cents / 4,840 sq yd); 1 Hectare = 107,639 Sq. Ft (2.471 Acres / 10,000 m²)."
      },
      {
        "question": "Why does 1 Bigha have different values in different states of India?",
        "answer": "Bigha is a traditional land measurement unit that was defined by local customary chains (guntas/jars) before national metric standardization. For example: In Uttar Pradesh, Delhi, and Rajasthan, 1 Pucca Bigha = 27,000 to 27,225 Sq. Ft (20 Biswa), while 1 Kachha Bigha = 9,075 Sq. Ft. In West Bengal and Assam, 1 Bigha = 14,400 Sq. Ft (20 Katha). In Gujarat, 1 Vigha = 17,424 Sq. Ft (16 Guntha). In Madhya Pradesh, 1 Bigha = 13,340 Sq. Ft. In Himachal Pradesh, 1 Bigha = 8,712 Sq. Ft. This calculator dynamically updates the Bigha value based on your selected state."
      },
      {
        "question": "What are Kanal and Marla, and where are they used?",
        "answer": "Kanal and Marla are standard land measurement units commonly used in Punjab, Haryana, Himachal Pradesh, Jammu & Kashmir, and parts of Rajasthan. 1 Marla = 272.25 Sq. Ft (9 Sq. Karam / 30.25 sq yd). 1 Kanal = 20 Marlas = 5,445 Sq. Ft (605 sq yd). 8 Kanals make exactly 1 Acre (43,560 Sq. Ft)."
      },
      {
        "question": "How is the total land valuation and acquisition cost calculated?",
        "answer": "Total land value is calculated by multiplying the plot area in your chosen rate unit (per sq ft, per Gaj/sq yd, per Acre, per Guntha, or per Bigha) by the prevailing market or circle rate. Total acquisition cost includes the base land value plus state Stamp Duty (typically 5% to 7% depending on the state and buyer gender) and government Registration Charges (standard 1%)."
      },
      {
        "question": "How does the Boundary Fencing Estimator calculate posts and wire requirements?",
        "answer": "The calculator determines the total perimeter length around all boundary sides. Fence support posts are calculated with standard 8-foot (2.44m) spacing with a corner anchor reinforcement. Total barbed wire length is computed by multiplying the boundary perimeter by the number of wire strands (typically 3, 4, or 5 strands)."
      },
      {
        "question": "How does plot area relate to building construction footprint and FAR/FSI?",
        "answer": "Permissible Ground Coverage % (typically 50% to 65% under municipal bye-laws) dictates the maximum ground-floor footprint of your building. Floor Area Ratio (FAR) or Floor Space Index (FSI) determines the total maximum built-up floor area across all levels (Total Built-Up = Plot Area × FAR). For example, a 2,000 sq ft plot with FAR 2.0 allows up to 4,000 sq ft of total construction."
      }
    ],
    "sections": [
      {
        "title": "Surveyor's Triangulation: Why Measuring the Diagonal is Essential for 4-Sided Plots",
        "content": "Unlike a triangle, which is a rigid geometric polygon (3 fixed sides uniquely define exactly one triangle and one area), a 4-sided quadrilateral is non-rigid. If you have four side lengths of 40 ft, 30 ft, 45 ft, and 35 ft, the plot can be sheared into thousands of different parallelogram or rhomboid angles with widely differing areas. Measuring one internal diagonal (AC) splits the quadrilateral into two rigid triangles. Using Heron's formula on each triangle guarantees 100% mathematical precision and prevents disputes during land registration, property boundary demarcation, and architectural planning."
      },
      {
        "title": "Standard Pan-India Land Measurement Conversion Quick Reference",
        "content": "Use this benchmark guide when converting between national, regional, and international land records:\n\n• **1 Square Yard (Gaj)** = 9 Sq. Ft = 0.8361 Sq. Meters\n• **1 Guntha (Maharashtra / Karnataka / Gujarat)** = 1,089 Sq. Ft = 121 Gaj\n• **1 Cent (Tamil Nadu / Kerala / Andhra Pradesh)** = 435.6 Sq. Ft = 48.4 Gaj\n• **1 Ground (Chennai / Tamil Nadu)** = 2,400 Sq. Ft = 266.67 Gaj = 5.51 Cents\n• **1 Decimal / Dismil (Eastern India)** = 435.6 Sq. Ft = 1 Cent\n• **1 Marla (Punjab / Haryana)** = 272.25 Sq. Ft = 30.25 Gaj\n• **1 Kanal (Punjab / Haryana / J&K)** = 5,445 Sq. Ft = 20 Marlas = 605 Gaj\n• **1 Acre** = 43,560 Sq. Ft = 4,840 Gaj = 40 Gunthas = 100 Cents = 8 Kanals\n• **1 Hectare** = 107,639 Sq. Ft = 2.471 Acres = 10,000 Sq. Meters"
      },
      {
        "title": "How to Use Plot Area for Real Estate Valuation and Construction Approvals",
        "content": "When evaluating land for acquisition or development:\n1. **Verify Official Revenue Records (7/12, Khata, Patta):** Cross-check on-site physical tape measurements against revenue survey maps (Naksha / FMB).\n2. **Calculate Net Buildable Area:** Deduct municipal road-widening setbacks, front/rear clearances, and open green space buffers from the gross plot area.\n3. **Calculate Permissible FSI:** Multiply the net plot area by the zonal Floor Space Index (FSI) to assess development feasibility and project ROI.\n4. **Factor Stamp Duty & Government Charges:** Always allocate 6% to 8% above the transaction value for stamp duty, registration fees, and legal documentation."
      }
    ]
  },
  {
    "id": "BuildingFeasibilityChecker",
    "slug": "building-feasibility-checker",
    "name": "Building Feasibility & Bye-Law Checker",
    "category": "architecture",
    "subcategory": "Statutory Bye-Laws & Planning",
    "shortDescription": "Location-aware architectural and construction feasibility tool. Checks FAR/FSI, setbacks, massing, parking ECS, fire safety, and statutory clearances across 172+ Indian bye-law documents.",
    "metaTitle": "Building Feasibility & Bye-Law Checker – NBC 2016, FAR, Setbacks & State Rules",
    "metaDescription": "Instant architectural feasibility report. Calculate permissible FAR/FSI, ground coverage, setbacks, max height, parking ECS, fire NOC, and approvals for all Indian states.",
    "keywords": [
      "Building Feasibility Checker",
      "Building Bye-Law Checker India",
      "NBC 2016 Building Bye Laws",
      "FAR Calculator India",
      "FSI Calculator India",
      "Setback Calculator India",
      "Haryana Building Code 2017",
      "Haryana Building Code 2023",
      "Delhi UBBL 2016 Calculator",
      "Maharashtra UDCPR 2020 FSI",
      "BBMP Building Bye Laws Bangalore",
      "TNCDBR Tamil Nadu Building Rules",
      "Telangana GO 168 Building Rules",
      "KMBR Kerala Municipal Building Rules",
      "WBBMBL West Bengal Municipal Rules",
      "Gujarat GDCR 2017 Calculator",
      "Rajasthan Building Bye Laws 2020",
      "UP Building Bye Laws 2008",
      "Architectural Feasibility Report",
      "Stilt plus 4 floors rules India",
      "Fire NOC height threshold NBC 2016",
      "Parking ECS calculator",
      "Airport Funnel AAI NOCAS check",
      "Plot buildable envelope calculator",
      "Ground Coverage Calculator"
    ],
    "icon": "Building2",
    "howToUse": [
      "Step 1 (Site Location): Select your State/UT, Planning Authority (e.g. GMDA, DDA, MCGM, BBMP, CMDA, GHMC), Master Plan Zone, and fronting road width.",
      "Step 2 (Plot Dimensions): Enter plot area in your preferred unit (sq.m, sq.ft, Gaj, Guntha, Bigha, Acre). Provide frontage width and depth in Meters or Feet.",
      "Step 3 (Proposed Development): Select building occupancy (Residential Plotted, Commercial, Group Housing, Industrial), proposed floors, stilt, and basement.",
      "Step 4 (Site Conditions & Overlays): Toggle proximity overlays such as Airport funnel (AAI NOCAS), Highway (NHAI), Railway track (30m), Heritage zone (ASI), or Nallah/Lake buffer.",
      "Review Feasibility Report: Analyze the executive traffic light status, development controls comparison table (FAR, coverage, setbacks, height), and 2D buildable envelope diagram.",
      "Export & Grounded AI Assistant: Query statutory clauses using the AI assistant or download a branded architectural feasibility PDF report."
    ],
    "faqs": [
      {
        "question": "What is the Building Feasibility & Bye-Law Checker?",
        "answer": "It is an automated architectural feasibility engine that checks your plot parameters against the National Building Code of India (NBC 2016) and 172+ State/Municipal Building Bye-Laws (such as Haryana Building Code 2017/2023, Delhi UBBL 2016, Maharashtra UDCPR 2020, BBMP Bengaluru, TNCDBR Tamil Nadu, and GHMC Telangana) to determine permissible FAR/FSI, ground coverage, mandatory setbacks, maximum building height, parking ECS, and statutory approvals."
      },
      {
        "question": "How are building setbacks (Front, Rear, Side) determined in India?",
        "answer": "Setbacks are mandatory open spaces surrounding a building determined by the plot area, frontage width, abutting road width, and building height. Front setbacks ensure safe sightlines and future road widening, rear setbacks provide light and ventilation, and side setbacks allow emergency fire access and separation from adjacent plots."
      },
      {
        "question": "How is Permissible Built-Up Area (BUA) calculated from FAR/FSI?",
        "answer": "Permissible Built-Up Area (BUA) is calculated as: Gross BUA = Plot Area × Permissible FAR (or FSI). For example, on a 300 sq.m plot with a permissible FAR of 2.0, the total gross constructed area across all habitable floors cannot exceed 600 sq.m (excluding exempt areas like stilt parking and basement)."
      },
      {
        "question": "What is the difference between Base FAR and Purchasable / Premium FAR?",
        "answer": "Base FAR is the standard floor area ratio permitted by right on the plot without extra government levies. Purchasable FAR (or Premium FSI / TDR) allows developers to construct additional floor area up to a statutory ceiling upon paying prescribed government betterment charges to the municipal planning authority."
      },
      {
        "question": "What are the rules for Stilt + 4 Floors in residential plots?",
        "answer": "Under Haryana Building Code (2024 revised norms) and Delhi UBBL 2016, residential plots fronting roads of 9m/12m or wider may construct stilt parking plus 4 upper floors, provided the stilt floor height (minimum 2.4m clear) is dedicated exclusively to non-habitable vehicular parking, and structural safety certificates from certified structural engineers are submitted."
      },
      {
        "question": "What triggers mandatory Fire NOC in Indian building bye-laws?",
        "answer": "Under NBC 2016 Part 4 and State Fire Prevention Acts, any building with a height of 15.0 meters or above is classified as a High-Rise structure. This mandates provisional and final Fire NOC from the State Fire Services, dual fire-rated escape staircases (minimum 1.5m to 2.0m width), pressurized fire lifts, wet risers, automatic sprinklers, and minimum 6.0m clear perimeter fire tender access roads."
      },
      {
        "question": "How is Parking Equivalent Car Space (ECS) calculated?",
        "answer": "Parking requirements are measured in Equivalent Car Spaces (ECS), where 1 ECS = 23 sq.m for open surface parking, 28 sq.m for ground covered/stilt parking, and 32 sq.m for basement parking. Bye-laws prescribe 1.0 to 2.0 ECS per 100 sq.m of built-up area or per residential dwelling unit depending on plot classification."
      },
      {
        "question": "What are the statutory buffer zones for Highways, Railways, and Water Bodies?",
        "answer": "Statutory overlays enforce no-construction buffers: 1) National Highways (NHAI): 30m to 75m building line; 2) Indian Railways: 30m buffer from railway boundary requiring Railway NOC; 3) Lakes/Nallahs (NGT norms): 30m to 50m green buffer from the defined high flood line (HFL); 4) Heritage Monuments (ASI): 100m prohibited zone and 200m regulated zone."
      },
      {
        "question": "Is Rainwater Harvesting (RWH) mandatory for residential plots in India?",
        "answer": "Yes. Under Central Ground Water Authority (CGWA) guidelines and state municipal bye-laws across India, all plots with an area of 100 sq. meters or greater must incorporate on-site rainwater harvesting recharge structures or storage collection sumps to obtain an Occupancy Certificate (OC)."
      },
      {
        "question": "Does this report constitute a legal building sanction or permit?",
        "answer": "No. This tool generates a preliminary architectural feasibility and conceptual planning assessment for advisory and design purposes. Formal municipal sanctions require structural stability drawings prepared and submitted by a licensed Architect registered with the Council of Architecture (COA) to the competent local municipal authority."
      }
    ],
    "sections": [
      {
        "title": "Hierarchy of Indian Building Regulations",
        "content": "Building development in India is governed by a hierarchical four-tier regulatory framework:\n\n" +
          "1. **Level 1 – National Standards (NBC 2016 & Model Bye-Laws)**: Published by the Bureau of Indian Standards (SP 7: 2016), setting national baseline life safety, structural engineering, accessibility, and environmental norms.\n" +
          "2. **Level 2 – State Acts & Unified Regulations**: Enactments covering all 28 States & 8 UTs (such as Maharashtra UDCPR 2020, Haryana Building Code 2017/2023, Tamil Nadu TNCDBR 2019, Kerala KMBR 2019, Gujarat GDCR 2017).\n" +
          "3. **Level 3 – City Master Plans & Development Authorities**: Comprehensive Development Plans (CDP) and zoning codes issued by regional authorities (e.g., DDA Master Plan 2041, GMDA Gurugram, BBMP Bengaluru, MCGM Mumbai DP 2034, HMDA Hyderabad, CMDA Chennai).\n" +
          "4. **Level 4 – Local Municipal Authorities & Statutory Overlays**: Micro-level bye-laws of municipal corporations combined with Pan-India statutory overlays from AAI (NOCAS airport funnel), NHAI highways, Indian Railways (30m buffer), ASI protected monuments, and NGT environmental buffer zones."
      },
      {
        "title": "Core Architectural Development Controls & Mathematical Formulas",
        "content": "• **Floor Area Ratio (FAR / FSI)**: Ratio of total gross built-up area across all habitable floors to the net plot area:\n" +
          "  $$\\text{FAR} = \\frac{\\text{Gross Built-Up Area (sq.m)}}{\\text{Plot Area (sq.m)}}$$\n\n" +
          "• **Ground Coverage (%)**: Maximum percentage of plot footprint covered by the building structure at ground level:\n" +
          "  $$\\text{Max Ground Footprint} = \\text{Plot Area} \\times \\left(\\frac{\\text{Ground Coverage \\%}}{100}\\right)$$\n\n" +
          "• **Mandatory Setbacks**: Net buildable width and depth after deducting front, rear, left, and right open spaces:\n" +
          "  $$\\text{Buildable Width} = \\text{Frontage Width} - (\\text{Left Setback} + \\text{Right Setback})$$\n" +
          "  $$\\text{Buildable Depth} = \\text{Plot Depth} - (\\text{Front Setback} + \\text{Rear Setback})$$\n\n" +
          "• **Equivalent Car Space (ECS)**: Standard metric for mandatory vehicular parking provisions based on built-up area (1 ECS = 23m² open, 28m² stilt, 32m² basement)."
      },
      {
        "title": "High-Rise Fire Safety Thresholds (NBC 2016 Part 4)",
        "content": "Under NBC 2016 Part 4 and State Fire Safety Rules:\n" +
          "• Buildings **< 15.0 meters**: Low-rise structures requiring standard emergency egress, fire extinguishers, and single staircase (subject to travel distance ≤ 22.5m).\n" +
          "• Buildings **≥ 15.0 meters**: High-rise classification mandating dual fire-rated escape staircases (enclosed with 2-hour fire doors), pressurized fire lifts, wet risers, yard hydrants, automatic sprinkler networks, and minimum 6.0m clear perimeter driveway for emergency fire tender maneuvering.\n" +
          "• Buildings **≥ 24.0 meters**: Extended life safety controls including mandatory refuge areas every 7 floors above 24m, dedicated fire command center, and smoke evacuation shafts."
      }
    ]
  }
];
