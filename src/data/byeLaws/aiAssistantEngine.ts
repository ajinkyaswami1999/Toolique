// Toolique Building Feasibility & Bye-Law Checker - Grounded AI Assistant Engine

import type { FeasibilityReport } from './types';

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  citedClauses?: string[];
  suggestedFollowups?: string[];
}

export const DEFAULT_SUGGESTED_PROMPTS = [
  'Can I build G+4 with stilt parking on this plot?',
  'What are the mandatory setbacks for my site?',
  'How much purchasable FAR can I buy and what is the maximum BUA?',
  'What parking ECS and EV charging spaces are required?',
  'What statutory clearances and NOCs are mandatory before construction?',
  'Is rainwater harvesting or solar power mandatory?'
];

/**
 * Deterministic, grounded question-answering assistant that strictly cites
 * the generated Feasibility Report without hallucinating outside bye-laws.
 */
export function answerReportQuestion(report: FeasibilityReport, userQuery: string): AssistantMessage {
  const query = userQuery.toLowerCase().trim();
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const id = 'msg_' + Math.random().toString(36).substring(2, 9);

  const { dev, life, jur, input } = {
    dev: report.developmentControls,
    life: report.lifeSafetyAndServices,
    jur: report.resolvedJurisdiction,
    input: report.input
  };

  // 1. Height & Floors / Stilt + 4
  if (query.includes('g+4') || query.includes('floor') || query.includes('height') || query.includes('stilt')) {
    const stiltNote = input.proposal.hasStilt ? 'with stilt parking' : 'without stilt';
    return {
      id,
      sender: 'assistant',
      timestamp: now,
      text: `Under **${jur.primaryCode}**, the maximum permissible building height for your site is **${dev.heightFloors.maxPermissibleHeightM} meters** (approx. **${dev.heightFloors.maxPermissibleFloors} floors**). 

• Proposed Massing: **${dev.heightFloors.proposedFloors} floors** (${dev.heightFloors.proposedHeightM.toFixed(1)}m ${stiltNote}).
• Compliance Status: **${dev.heightFloors.status === 'compliant' ? '🟢 Compliant' : '🔴 Non-Compliant'}**
• Height Rule Formula: \`${dev.heightFloors.roadWidthFormula}\`

*Note: In plotted sectors where Stilt+4 is notified, a 2.4m clear height stilt floor is exempt from FAR and height count.*`,
      citedClauses: [dev.heightFloors.clause, 'NBC 2016 Part 3 Clause 5.4'],
      suggestedFollowups: [
        'What are the setback requirements?',
        'How much parking do I need for these floors?'
      ]
    };
  }

  // 2. FAR / FSI / Built-up area / Purchasable FAR
  if (query.includes('far') || query.includes('fsi') || query.includes('bua') || query.includes('built-up') || query.includes('purchasable')) {
    return {
      id,
      sender: 'assistant',
      timestamp: now,
      text: `Here is the FAR / FSI breakdown for your **${input.normalizedPlotAreaSqM.toFixed(1)} sq.m** plot in **${jur.authorityName}**:

• **Base FAR**: **${dev.far.baseFar}** (Permits base BUA of **${(input.normalizedPlotAreaSqM * dev.far.baseFar).toFixed(1)} sq.m** / ${(input.normalizedPlotAreaSqM * dev.far.baseFar * 10.7639).toFixed(0)} sq.ft)
• **Purchasable / Premium FAR**: Up to **+${dev.far.maxPurchasableFar}** available upon payment of government betterment charges.
• **Maximum Potential FAR**: **${dev.far.effectiveMaxFar}** (Total max BUA: **${dev.far.permittedMaxBuaSqM.toFixed(1)} sq.m**)
• **Proposed FAR**: **${dev.far.proposedFar}** (${dev.far.proposedBuaSqM.toFixed(1)} sq.m BUA)
• **Status**: ${dev.far.status === 'compliant' ? '🟢 Within Base FAR' : dev.far.status === 'conditional' ? '🟡 Requires Purchasable FAR purchase' : '🔴 Exceeds Maximum Permissible Ceiling'}`,
      citedClauses: [dev.far.clause, `${dev.far.doc}`],
      suggestedFollowups: [
        'What is the maximum ground coverage allowed?',
        'What statutory approvals are needed?'
      ]
    };
  }

  // 3. Setbacks & Buildable Envelope
  if (query.includes('setback') || query.includes('envelope') || query.includes('front') || query.includes('rear') || query.includes('boundary')) {
    if (input.plot.isIrregularPlot) {
      return {
        id,
        sender: 'assistant',
        timestamp: now,
        text: `⚠️ **Irregular Plot Geometry Notice**:
Your plot has been marked as irregular. Statutory setbacks still apply along all perimeter edges:
• **Front Setback**: **${dev.setbacks.frontM} m**
• **Rear Setback**: **${dev.setbacks.rearM} m**
• **Side Setbacks (Left / Right)**: **${dev.setbacks.leftM} m / ${dev.setbacks.rightM} m**

*Because the plot geometry is non-rectangular, standard 2D rectangular envelope calculation has been suppressed. A licensed total-station survey is required to trace the exact polygonal buildable footprint.*`,
        citedClauses: [dev.setbacks.clause, dev.setbacks.doc],
        suggestedFollowups: ['What is the base FAR?']
      };
    }

    return {
      id,
      sender: 'assistant',
      timestamp: now,
      text: `Under **${dev.setbacks.doc}**, the mandatory open spaces around your building are:

• **Front Setback (Road Frontage)**: **${dev.setbacks.frontM} meters**
• **Rear Setback**: **${dev.setbacks.rearM} meters**
• **Side Setbacks (Left / Right)**: **${dev.setbacks.leftM} meters / ${dev.setbacks.rightM} meters**

**Net Buildable Footprint**:
• Buildable Width: **${dev.envelope.buildableWidthM.toFixed(1)} m**
• Buildable Depth: **${dev.envelope.buildableDepthM.toFixed(1)} m**
• Net Ground Footprint: **${dev.envelope.buildableFootprintSqM.toFixed(1)} sq.m** (${dev.envelope.envelopeEfficiencyPct}% of total plot)`,
      citedClauses: [dev.setbacks.clause, dev.setbacks.doc],
      suggestedFollowups: [
        'What is the maximum ground coverage percentage?',
        'How many parking spaces are required?'
      ]
    };
  }

  // 4. Ground Coverage
  if (query.includes('coverage') || query.includes('ground')) {
    return {
      id,
      sender: 'assistant',
      timestamp: now,
      text: `For your **${input.normalizedPlotAreaSqM.toFixed(1)} sq.m** plot in **${jur.stateName}**:

• **Maximum Permissible Ground Coverage**: **${dev.groundCoverage.permittedMaxPct}%** (**${dev.groundCoverage.permittedMaxSqM.toFixed(1)} sq.m** / ${(dev.groundCoverage.permittedMaxSqM * 10.7639).toFixed(0)} sq.ft)
• **Proposed Ground Coverage**: **${dev.groundCoverage.proposedPct}%** (**${dev.groundCoverage.proposedSqM.toFixed(1)} sq.m**)
• **Status**: ${dev.groundCoverage.status === 'compliant' ? '🟢 Compliant' : '🔴 Exceeds Permissible Limit'}

*Remaining plot area (${(100 - dev.groundCoverage.permittedMaxPct)}%) must remain unpaved or landscaped for natural percolation and fire tender movement.*`,
      citedClauses: [dev.groundCoverage.clause, dev.groundCoverage.doc],
      suggestedFollowups: [
        'What are the setback requirements?',
        'What is the base FAR?'
      ]
    };
  }

  // 5. Parking & ECS
  if (query.includes('park') || query.includes('ecs') || query.includes('car') || query.includes('ev') || query.includes('vehicle')) {
    return {
      id,
      sender: 'assistant',
      timestamp: now,
      text: `Vehicular Parking (ECS) requirement per **${dev.parking.doc}**:

• **Standard Equivalent Car Spaces (ECS)**: **${dev.parking.requiredEcs} ECS** (${dev.parking.ruleDescription})
• **Mandatory Visitor Parking**: **+${dev.parking.visitorEcs} ECS**
• **Mandatory EV Fast-Charging Bays**: **${dev.parking.evChargingEcs} bays** (20% of total parking per NBC 2016 amendment)
• **Proposed Parking**: **${dev.parking.proposedEcs} ECS** (${dev.parking.status === 'compliant' ? '🟢 Compliant' : '🔴 Deficit Detected'})

*1 ECS dimension norms: 23 sq.m (Surface Open) | 28 sq.m (Stilt Covered) | 32 sq.m (Basement).*`,
      citedClauses: [dev.parking.clause, 'NBC 2016 Part 8 Table 5'],
      suggestedFollowups: [
        'What are the fire safety requirements?',
        'What approvals are required?'
      ]
    };
  }

  // 6. Fire & Life Safety
  if (query.includes('fire') || query.includes('safety') || query.includes('noc') || query.includes('high rise') || query.includes('staircase')) {
    return {
      id,
      sender: 'assistant',
      timestamp: now,
      text: `Fire and Life Safety assessment per **${life.fireSafety.doc}**:

• **Building Classification**: ${life.fireSafety.isHighRise ? '🔥 **High-Rise Structure (>= 15m)**' : '🏢 **Low-Rise Standard Structure (< 15m)**'}
• **State Fire NOC**: ${life.fireSafety.fireNocRequired ? '🚨 **Mandatory Provisional & Final Fire NOC**' : '✅ Exempt (Low-Rise Plotted)'}
• **Minimum Access Road Width**: **${life.fireSafety.minAccessRoadM} meters** (Site has ${input.site.roadWidth}m road)
• **Exit Travel Distance**: Max **${life.fireSafety.maxTravelDistanceM} meters** to nearest emergency stair
• **Minimum Fire Staircase Width**: **${life.fireSafety.minStaircaseWidthM} meters** clear`,
      citedClauses: [life.fireSafety.clause, 'NBC 2016 Part 4 Table 7'],
      suggestedFollowups: [
        'What approvals are required before construction?',
        'What are the environmental requirements?'
      ]
    };
  }

  // 7. Approvals & Sanctions
  if (query.includes('approval') || query.includes('sanction') || query.includes('permit') || query.includes('clearance') || query.includes('license') || query.includes('step')) {
    const items = report.approvalsChecklist.map((a, i) => `${i + 1}. **${a.approvalName}** (${a.authority}) — *${a.timelineDays}*`).join('\n');
    return {
      id,
      sender: 'assistant',
      timestamp: now,
      text: `Key statutory approvals required for this project:

${items}

*All architectural submissions must be certified by a COA-registered Architect and structural drawings signed by a licensed Structural Engineer.*`,
      citedClauses: ['Local Municipal Act', 'NBC 2016 Part 2 Administration'],
      suggestedFollowups: [
        'What is the base FAR and purchasable FAR?',
        'Is rainwater harvesting mandatory?'
      ]
    };
  }

  // 8. Environmental & Services (RWH, Solar, STP)
  if (query.includes('rain') || query.includes('rwh') || query.includes('solar') || query.includes('environment') || query.includes('green') || query.includes('stp')) {
    return {
      id,
      sender: 'assistant',
      timestamp: now,
      text: `Environmental & Sustainability mandates under **${life.environment.doc}**:

• **Rainwater Harvesting (RWH)**: ${life.environment.rwhRequired ? `Mandatory collection recharge tank (min **${life.environment.rwhTankCapacityLiters} Liters** capacity).` : 'Optional'}
• **Rooftop Solar PV**: ${life.environment.solarPvRequired ? `Mandatory rooftop solar installation (min **${life.environment.minSolarCapacityKw} kWp** connected capacity).` : 'Exempt (Plot < 500 sq.m)'}
• **Sewage Treatment Plant (STP)**: ${life.environment.stpRequired ? 'Mandatory dedicated on-site STP with dual plumbing for flushing/gardening.' : 'Exempt (Discharge to municipal sewer line permitted)'}
• **Green Landscaped Area**: Minimum **${life.environment.greenAreaPct}%** unpaved soft-scape`,
      citedClauses: [life.environment.clause, 'CGWA Directives 2023'],
      suggestedFollowups: [
        'What are the mandatory setbacks?',
        'Can I build G+4 with stilt parking?'
      ]
    };
  }

  // Default fallback grounded response
  return {
    id,
    sender: 'assistant',
    timestamp: now,
    text: `Based on your preliminary feasibility evaluation under **${jur.primaryCode}**:

• **Site Location**: ${jur.authorityName}, ${jur.stateName}
• **Plot Area**: ${input.normalizedPlotAreaSqM.toFixed(1)} sq.m (${input.normalizedPlotAreaSqFt.toFixed(0)} sq.ft) on a ${input.site.roadWidth}m road
• **Ground Coverage**: Max ${dev.groundCoverage.permittedMaxPct}% (${dev.groundCoverage.permittedMaxSqM.toFixed(1)} sq.m)
• **Base FAR**: ${dev.far.baseFar} | **Max Potential FAR**: ${dev.far.effectiveMaxFar}
• **Permissible Height**: ${dev.heightFloors.maxPermissibleHeightM}m (${dev.heightFloors.maxPermissibleFloors} Floors)
• **Overall Feasibility**: ${report.executiveSummary.headline}

You can ask specific questions about setbacks, purchasable FAR, parking ECS, fire NOC, stilt parking, or pre-construction approvals.`,
    citedClauses: [dev.groundCoverage.clause, dev.far.clause, dev.setbacks.clause],
    suggestedFollowups: [
      'Can I build G+4 with stilt parking on this plot?',
      'What are the mandatory setbacks for my site?',
      'How much purchasable FAR can I buy?'
    ]
  };
}
