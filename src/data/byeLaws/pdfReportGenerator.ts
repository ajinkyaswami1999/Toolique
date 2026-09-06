// Toolique Building Feasibility & Bye-Law Checker - Professional PDF Generator

import { jsPDF } from 'jspdf';
import type { FeasibilityReport } from './types';

export function generateFeasibilityPdf(report: FeasibilityReport): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 18) {
      doc.addPage();
      y = margin;
      drawHeaderFooter();
    }
  };

  const drawHeaderFooter = () => {
    // Top subtle bar
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(margin, 8, contentWidth, 1.5, 'F');

    // Page footer
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Toolique.in | Preliminary Architectural Feasibility & Bye-Law Assessment', margin, pageHeight - 8);
    const pageStr = `Page ${doc.getNumberOfPages()}`;
    doc.text(pageStr, pageWidth - margin - doc.getTextWidth(pageStr), pageHeight - 8);
  };

  // --- PAGE 1: COVER & EXECUTIVE SUMMARY ---
  drawHeaderFooter();

  // Document Title Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('PRELIMINARY BUILDING FEASIBILITY REPORT', margin, y + 6);
  y += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Generated via Toolique.in Feasibility Engine | Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`, margin, y);
  y += 8;

  // Executive Status Banner Box
  const statusColor = report.executiveSummary.status === 'feasible' 
    ? [22, 101, 52] // green-800
    : report.executiveSummary.status === 'conditional'
    ? [133, 77, 14] // amber-800
    : [153, 27, 27]; // red-800

  const statusBg = report.executiveSummary.status === 'feasible'
    ? [240, 253, 244] // green-50
    : report.executiveSummary.status === 'conditional'
    ? [254, 252, 232] // yellow-50
    : [254, 242, 242]; // red-50

  doc.setFillColor(statusBg[0], statusBg[1], statusBg[2]);
  doc.setDrawColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(report.executiveSummary.headline.toUpperCase(), margin + 4, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const summaryLines = doc.splitTextToSize(report.executiveSummary.summaryText, contentWidth - 8);
  doc.text(summaryLines, margin + 4, y + 13);
  y += 28;

  // Section 1: Project & Location Context
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('1. SITE & PLANNING JURISDICTION CONTEXT', margin, y);
  y += 5;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 32, 1.5, 1.5, 'F');

  doc.setFontSize(8.5);
  const col1 = margin + 4;
  const col2 = margin + 96;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('State / UT:', col1, y + 6);
  doc.text('Planning Authority:', col1, y + 12);
  doc.text('Applicable Bye-Law:', col1, y + 18);
  doc.text('Road Frontage Width:', col1, y + 24);

  doc.text('Plot Area (Normalized):', col2, y + 6);
  doc.text('Plot Dimensions:', col2, y + 12);
  doc.text('Proposed Building Use:', col2, y + 18);
  doc.text('Proposed Floors & Massing:', col2, y + 24);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${report.resolvedJurisdiction.stateName}`, col1 + 35, y + 6);
  doc.text(`${report.resolvedJurisdiction.authorityName.substring(0, 32)}`, col1 + 35, y + 12);
  doc.text(`${report.resolvedJurisdiction.primaryCode.substring(0, 32)}`, col1 + 35, y + 18);
  doc.text(`${report.input.site.roadWidth} Meters`, col1 + 35, y + 24);

  doc.text(`${report.input.normalizedPlotAreaSqM.toFixed(1)} sq.m (${report.input.normalizedPlotAreaSqFt.toFixed(0)} sq.ft)`, col2 + 40, y + 6);
  doc.text(`W: ${report.input.plot.frontageWidth}m x D: ${report.input.plot.plotDepth}m`, col2 + 40, y + 12);
  doc.text(`${report.input.proposal.buildingUse.replace(/_/g, ' ').toUpperCase()}`, col2 + 40, y + 18);
  doc.text(`${report.input.proposal.proposedFloors} Floors ${report.input.proposal.hasStilt ? '(Stilt + ' + report.input.proposal.proposedFloors + ')' : ''}`, col2 + 40, y + 24);

  y += 38;

  // Section 2: Development Controls Matrix (FAR, Coverage, Height)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('2. STATUTORY DEVELOPMENT CONTROLS MATRIX', margin, y);
  y += 5;

  // Table Header
  doc.setFillColor(30, 41, 59);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('PARAMETER', margin + 3, y + 5);
  doc.text('STATUTORY PERMISSIBLE', margin + 45, y + 5);
  doc.text('PROPOSED', margin + 105, y + 5);
  doc.text('STATUS & CLAUSE', margin + 145, y + 5);
  y += 7;

  const rows = [
    {
      param: 'Ground Coverage',
      perm: `Max ${report.developmentControls.groundCoverage.permittedMaxPct}% (${report.developmentControls.groundCoverage.permittedMaxSqM.toFixed(1)} m2)`,
      prop: `${report.developmentControls.groundCoverage.proposedPct}% (${report.developmentControls.groundCoverage.proposedSqM.toFixed(1)} m2)`,
      status: report.developmentControls.groundCoverage.status.toUpperCase(),
      clause: report.developmentControls.groundCoverage.clause
    },
    {
      param: 'Floor Area Ratio (FAR)',
      perm: `Base ${report.developmentControls.far.baseFar} | Max ${report.developmentControls.far.effectiveMaxFar} (${report.developmentControls.far.permittedMaxBuaSqM.toFixed(0)} m2)`,
      prop: `FAR ${report.developmentControls.far.proposedFar} (${report.developmentControls.far.proposedBuaSqM.toFixed(0)} m2)`,
      status: report.developmentControls.far.status.toUpperCase(),
      clause: report.developmentControls.far.clause
    },
    {
      param: 'Building Height & Floors',
      perm: `Max ${report.developmentControls.heightFloors.maxPermissibleHeightM}m (${report.developmentControls.heightFloors.maxPermissibleFloors} Floors)`,
      prop: `${report.developmentControls.heightFloors.proposedHeightM.toFixed(1)}m (${report.developmentControls.heightFloors.proposedFloors} Floors)`,
      status: report.developmentControls.heightFloors.status.toUpperCase(),
      clause: report.developmentControls.heightFloors.clause
    },
    {
      param: 'Front Setback',
      perm: `Min ${report.developmentControls.setbacks.frontM} m`,
      prop: `${report.developmentControls.setbacks.frontM} m`,
      status: 'COMPLIANT',
      clause: report.developmentControls.setbacks.clause
    },
    {
      param: 'Rear & Side Setbacks',
      perm: `Rear: ${report.developmentControls.setbacks.rearM}m | Sides: ${report.developmentControls.setbacks.leftM}m`,
      prop: `Rear: ${report.developmentControls.setbacks.rearM}m | Sides: ${report.developmentControls.setbacks.leftM}m`,
      status: 'COMPLIANT',
      clause: report.developmentControls.setbacks.clause
    },
    {
      param: 'Vehicular Parking (ECS)',
      perm: `Min ${report.developmentControls.parking.requiredEcs} ECS (+${report.developmentControls.parking.visitorEcs} Visitor, ${report.developmentControls.parking.evChargingEcs} EV)`,
      prop: `${report.developmentControls.parking.proposedEcs} ECS`,
      status: report.developmentControls.parking.status.toUpperCase(),
      clause: report.developmentControls.parking.clause
    }
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  rows.forEach((r, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setTextColor(15, 23, 42);
    doc.text(r.param, margin + 3, y + 4.8);
    doc.text(r.perm, margin + 45, y + 4.8);
    doc.text(r.prop, margin + 105, y + 4.8);

    doc.setFont('helvetica', 'bold');
    if (r.status.includes('NON') || r.status.includes('EXCEED')) {
      doc.setTextColor(185, 28, 28);
    } else if (r.status.includes('CONDITIONAL')) {
      doc.setTextColor(180, 83, 9);
    } else {
      doc.setTextColor(21, 128, 61);
    }
    doc.text(r.status, margin + 145, y + 4.8);
    doc.setFont('helvetica', 'normal');
    y += 7;
  });

  y += 6;

  // Section 3: Buildable Footprint & Envelope Summary
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('3. NET BUILDABLE FOOTPRINT & ENVELOPE', margin, y);
  y += 5;

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, 'F');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  if (report.input.plot.isIrregularPlot) {
    doc.setTextColor(185, 28, 28);
    doc.text('⚠️ Irregular Plot Geometry: 2D rectangular envelope calculation is suppressed.', margin + 4, y + 6);
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('A licensed land surveyor must establish exact polygonal boundary coordinates before structural footprint drafting.', margin + 4, y + 12);
  } else {
    doc.text(`• Net Buildable Width: ${report.developmentControls.envelope.buildableWidthM.toFixed(1)} m`, margin + 4, y + 6);
    doc.text(`• Net Buildable Depth: ${report.developmentControls.envelope.buildableDepthM.toFixed(1)} m`, margin + 65, y + 6);
    doc.text(`• Buildable Footprint: ${report.developmentControls.envelope.buildableFootprintSqM.toFixed(1)} sq.m (${report.developmentControls.envelope.envelopeEfficiencyPct}% plot efficiency)`, margin + 4, y + 12);
  }
  y += 24;

  // --- PAGE 2: LIFE SAFETY, SPECIAL RESTRICTIONS & APPROVALS ---
  checkPageBreak(80);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('4. LIFE SAFETY, SERVICES & SUSTAINABILITY MANDATES', margin, y);
  y += 5;

  const safetyItems = [
    `• High-Rise Classification: ${report.lifeSafetyAndServices.fireSafety.isHighRise ? 'High-Rise (>= 15m) - Fire NOC & 12m Access Road Mandatory' : 'Low-Rise Standard Structure (< 15m)'}`,
    `• Universal Accessibility: Ramps (1:12 slope), 900mm clear doors ${report.lifeSafetyAndServices.accessibility.liftRequired ? ', Mandatory Passenger Lift' : ''} (Harmonised Guidelines 2021)`,
    `• Rainwater Harvesting (RWH): ${report.lifeSafetyAndServices.environment.rwhRequired ? 'Mandatory - Min ' + report.lifeSafetyAndServices.environment.rwhTankCapacityLiters + 'L Tank Capacity' : 'Optional'}`,
    `• Rooftop Solar PV: ${report.lifeSafetyAndServices.environment.solarPvRequired ? 'Mandatory - Min ' + report.lifeSafetyAndServices.environment.minSolarCapacityKw + ' kWp System' : 'Exempt'}`,
    `• Sewage Treatment Plant (STP): ${report.lifeSafetyAndServices.environment.stpRequired ? 'Mandatory Dedicated On-Site STP' : 'Standard Municipal Connection Permitted'}`
  ];

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 32, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  safetyItems.forEach((item, i) => {
    doc.text(item, margin + 4, y + 6 + i * 5.5);
  });
  y += 38;

  // Section 5: Statutory Approvals Roadmap
  checkPageBreak(50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('5. STATUTORY APPROVALS & SANCTION ROADMAP', margin, y);
  y += 5;

  report.approvalsChecklist.forEach(app => {
    checkPageBreak(12);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentWidth, 10, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`[${app.stage}] ${app.approvalName}`, margin + 3, y + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Authority: ${app.authority} | Timeline: ${app.timelineDays}`, margin + 3, y + 8.5);
    y += 12;
  });

  y += 4;

  // Section 6: Official Audit Trail & Clauses Cited
  checkPageBreak(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('6. REGULATORY AUDIT TRAIL & CLAUSES CITED', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  report.auditTrail.slice(0, 5).forEach(aud => {
    checkPageBreak(8);
    doc.text(`• [${aud.ruleId}] ${aud.title} — Clause: ${aud.clause} (${aud.sourceDoc}) [Verified: ${aud.lastVerified}]`, margin, y);
    y += 4.5;
  });

  y += 6;

  // Statutory Legal Disclaimer Banner
  checkPageBreak(30);
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(239, 68, 68);
  doc.roundedRect(margin, y, contentWidth, 24, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(153, 27, 27);
  doc.text('MANDATORY STATUTORY DISCLAIMER & LIMITATION OF LIABILITY', margin + 3, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(127, 29, 29);
  const disclaimerText = 'This Feasibility Assessment Report is generated for preliminary architectural feasibility and conceptual planning guidance only. It does NOT constitute a statutory sanction, legal opinion, building permit, or title certification. All final designs, FAR calculations, setbacks, and structural submissions must be vetted, signed, and submitted by a licensed Architect registered with the Council of Architecture (COA) and approved by the competent Municipal / Town Planning Authority having local jurisdiction.';
  const disLines = doc.splitTextToSize(disclaimerText, contentWidth - 6);
  doc.text(disLines, margin + 3, y + 10);

  // Save the PDF
  const filename = `Toolique_Feasibility_Report_${report.resolvedJurisdiction.stateName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  doc.save(filename);
}
