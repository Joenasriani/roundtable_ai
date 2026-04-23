
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RoundtableResponse } from '../types';

export interface ExportOptions {
  selectedExperts: string[];
  includeDebate: boolean;
  includeAgreements: boolean;
  includeConflicts: boolean;
  includeVerdict: boolean;
}

export const generateProfessionalPDF = (
  result: RoundtableResponse, 
  originalQuery: string,
  options: ExportOptions = {
    selectedExperts: result.experts.map(e => e.field),
    includeDebate: true,
    includeAgreements: true,
    includeConflicts: true,
    includeVerdict: true
  }
) => {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();

  // Primary Header
  doc.setFillColor(79, 70, 229); // Indigo-600
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('ROUNDTABLE AI', 20, 22);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Elite Interdisciplinary Reasoning Dossier', 20, 30);
  doc.text(`Generated: ${timestamp}`, 145, 30);

  let cursorY = 55;

  // Query Section
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.setFontSize(9);
  doc.text('ORIGINAL SUBMISSION:', 20, cursorY);
  
  cursorY += 7;
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.setFontSize(11);
  const splitQuery = doc.splitTextToSize(originalQuery, 170);
  doc.text(splitQuery, 20, cursorY);
  cursorY += (splitQuery.length * 6) + 10;

  // Intent Classification
  doc.setTextColor(79, 70, 229);
  doc.setFontSize(10);
  doc.text(`INTENT CLASSIFICATION: ${result.intent.join(' | ')}`, 20, cursorY);
  cursorY += 15;

  // Expert Panel Table
  const filteredExperts = result.experts.filter(e => options.selectedExperts.includes(e.field));
  
  if (filteredExperts.length > 0) {
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.setFontSize(14);
    doc.text('1. THE INTERDISCIPLINARY PANEL', 20, cursorY);
    cursorY += 8;

    const expertData = filteredExperts.map(e => [
      e.field.toUpperCase(),
      e.technicalAnalysis,
      e.keyClaims.map(c => `• ${c.text} [${c.label}]`).join('\n')
    ]);

    autoTable(doc, {
      startY: cursorY,
      head: [['ACADEMIC FIELD', 'STRATEGIC ANALYSIS', 'KEY CLAIMS & EVIDENCE']],
      body: expertData,
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 35, fontStyle: 'bold' },
        1: { cellWidth: 80 },
        2: { cellWidth: 55 }
      },
      margin: { left: 20, right: 20 }
    });
    cursorY = (doc as any).lastAutoTable.finalY + 20;
  }

  // Debate & Conflict
  if (options.includeDebate && (options.includeAgreements || options.includeConflicts)) {
    if (cursorY > 230) {
      doc.addPage();
      cursorY = 30;
    }

    doc.setFontSize(14);
    doc.text('2. THE ROUNDTABLE DEBATE', 20, cursorY);
    cursorY += 10;

    // Agreements
    if (options.includeAgreements && result.debate.agreements.length > 0) {
      doc.setFontSize(10);
      doc.setTextColor(79, 70, 229);
      doc.text('CONSENSUS AGREEEMENTS:', 20, cursorY);
      cursorY += 6;
      doc.setTextColor(30, 41, 59);
      result.debate.agreements.forEach(agreement => {
        const splitText = doc.splitTextToSize(`• ${agreement}`, 170);
        doc.text(splitText, 20, cursorY);
        cursorY += (splitText.length * 5) + 2;
      });
      cursorY += 8;
    }

    // Conflicts Table
    if (options.includeConflicts && result.debate.conflicts.length > 0) {
      doc.setFontSize(10);
      doc.setTextColor(225, 29, 72); // Rose-600
      doc.text('SYNTHESIS CONFLICTS:', 20, cursorY);
      cursorY += 6;

      const conflictData = result.debate.conflicts.map(c => [
        c.description,
        `${(c.evidenceStrength * 100).toFixed(0)}%`,
        `${(c.realWorldImpact * 100).toFixed(0)}%`,
        `${(c.riskIfIncorrect * 100).toFixed(0)}%`
      ]);

      autoTable(doc, {
        startY: cursorY,
        head: [['CONFLICT DESCRIPTION', 'EVIDENCE', 'IMPACT', 'RISK']],
        body: conflictData,
        headStyles: { fillColor: [225, 29, 72] },
        styles: { fontSize: 8 },
        margin: { left: 20, right: 20 }
      });
      cursorY = (doc as any).lastAutoTable.finalY + 20;
    }
  }

  // Final Verdict
  if (options.includeVerdict) {
    if (cursorY > 200) {
      doc.addPage();
      cursorY = 30;
    }

    doc.setFillColor(248, 250, 252); // Slate-50
    doc.rect(20, cursorY, 170, 80, 'F');
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.rect(20, cursorY, 170, 80, 'D');

    cursorY += 12;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(16);
    doc.text('3. FINAL MULTI-LAYER VERDICT', 25, cursorY);
    
    cursorY += 10;
    doc.setFontSize(11);
    doc.text('CORE CONCLUSION:', 25, cursorY);
    cursorY += 6;
    doc.setFontSize(10);
    const coreConclusion = doc.splitTextToSize(result.verdict.coreConclusion, 160);
    doc.text(coreConclusion, 25, cursorY);
    
    cursorY += (coreConclusion.length * 5) + 10;
    doc.setFontSize(11);
    doc.text(`CONFIDENCE LEVEL: ${(result.verdict.confidenceLevel * 100).toFixed(0)}%`, 25, cursorY);
  }
  
  cursorY += 15;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Dossier classification: STRATEGIC / CONFIDENTIAL', 105, (doc as any).internal.pageSize.height - 10, { align: 'center' });

  doc.save(`Roundtable_Dossier_${Date.now()}.pdf`);
};
