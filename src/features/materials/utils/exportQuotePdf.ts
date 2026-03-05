import brandLogoUrl from '@/assets/brand/marstromlogo.png';
import type { Material } from '@/types/material';
import { formatCurrency } from '@/utils/formatters';

type PdfDocument = import('jspdf').jsPDF;

interface QuotePdfInputs {
  kgPerDetail: number | null;
  quantity: number | null;
  printTimeMinutesPerDetail: number | null;
  setupTimeMinutes: number | null;
  printerCount: number | null;
  detailsPerPrinter: number | null;
  machineHourlyRateEur: number | null;
}

interface QuotePdfResults {
  materialCostPerPart: number | null;
  machineCostPerPart: number | null;
  internalCostPerPart: number | null;
  salesPricePerPart: number | null;
  batchSalesTotal: number | null;
  batchInternalCost: number | null;
  leadTimeMinutes: number | null;
}

export interface QuotePdfPayload {
  material: Material;
  calculationLabel: string;
  inputs: QuotePdfInputs;
  results: QuotePdfResults;
}

function formatNumber(value: number | null, maxFractionDigits = 2) {
  if (value === null || !Number.isFinite(value)) {
    return 'Ej angivet';
  }

  return new Intl.NumberFormat('sv-SE', {
    maximumFractionDigits: maxFractionDigits,
  }).format(value);
}

function formatLeadTime(minutesValue: number | null) {
  if (minutesValue === null || !Number.isFinite(minutesValue)) {
    return 'Ej beräknat';
  }

  const totalMinutes = Math.max(0, Math.round(minutesValue));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${minutes} min`;
}

async function toDataUrl(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Kunde inte läsa logotypfilen för PDF-export.');
  }

  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        resolve(result);
        return;
      }

      reject(new Error('Kunde inte konvertera logotypen till data-URL.'));
    };
    reader.onerror = () => reject(new Error('Kunde inte läsa logotypdata.'));
    reader.readAsDataURL(blob);
  });
}

function drawKeyValueRow(doc: PdfDocument, label: string, value: string, x: number, y: number) {
  doc.setTextColor(91, 106, 117);
  doc.setFontSize(10);
  doc.text(label, x, y);
  doc.setTextColor(18, 34, 49);
  doc.setFontSize(12);
  doc.text(value, x + 190, y);
}

export async function exportQuotePdf(payload: QuotePdfPayload) {
  const { material, calculationLabel, inputs, results } = payload;
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;

  doc.setFillColor(233, 246, 244);
  doc.rect(0, 0, pageWidth, 120, 'F');

  try {
    const logoDataUrl = await toDataUrl(brandLogoUrl);
    doc.addImage(logoDataUrl, 'PNG', pageWidth - margin - 120, 26, 120, 30);
  } catch {
    // PDF export should still succeed even if logo loading fails.
  }

  doc.setTextColor(15, 76, 92);
  doc.setFontSize(14);
  doc.text('PolyFlow', margin, 34);
  doc.setTextColor(18, 34, 49);
  doc.setFontSize(24);
  doc.text('Offert', margin, 62);
  doc.setTextColor(91, 106, 117);
  doc.setFontSize(11);
  doc.text(material.name, margin, 82);
  doc.text(calculationLabel.trim().length > 0 ? calculationLabel : 'Kalkyl', margin, 98);

  const generatedAt = new Intl.DateTimeFormat('sv-SE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date());
  doc.text(`Skapad: ${generatedAt}`, pageWidth - margin - 140, 98);

  doc.setFillColor(22, 128, 122);
  doc.roundedRect(margin, 138, pageWidth - margin * 2, 102, 14, 14, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text('Offertöversikt', margin + 16, 162);
  doc.setFontSize(23);
  doc.text(formatCurrency(results.salesPricePerPart), margin + 16, 194);
  doc.setFontSize(10);
  doc.text('Kundpris per detalj', margin + 16, 212);

  doc.setFontSize(12);
  doc.text(`Totalt kundpris: ${formatCurrency(results.batchSalesTotal)}`, margin + 240, 170);
  doc.text(`Antal detaljer: ${formatNumber(inputs.quantity, 0)} st`, margin + 240, 190);
  doc.text(`Leveranstid: ${formatLeadTime(results.leadTimeMinutes)}`, margin + 240, 210);

  doc.setTextColor(18, 34, 49);
  doc.setFontSize(14);
  doc.text('Beräkningsunderlag', margin, 284);

  let lineY = 312;
  drawKeyValueRow(doc, 'Pris per kg material', formatCurrency(material.pricePerKgEur), margin, lineY);
  lineY += 22;
  drawKeyValueRow(doc, 'Kg per detalj', `${formatNumber(inputs.kgPerDetail, 3)} kg`, margin, lineY);
  lineY += 22;
  drawKeyValueRow(doc, 'Materialkostnad per detalj', formatCurrency(results.materialCostPerPart), margin, lineY);
  lineY += 22;
  drawKeyValueRow(
    doc,
    'Printtid per detalj',
    `${formatNumber(inputs.printTimeMinutesPerDetail, 1)} min`,
    margin,
    lineY,
  );
  lineY += 22;
  drawKeyValueRow(
    doc,
    'Uppstartstid',
    `${formatNumber(inputs.setupTimeMinutes, 1)} min`,
    margin,
    lineY,
  );
  lineY += 22;
  drawKeyValueRow(
    doc,
    'Maskinkostnad per timme',
    formatCurrency(inputs.machineHourlyRateEur),
    margin,
    lineY,
  );
  lineY += 22;
  drawKeyValueRow(doc, 'Antal skrivare', formatNumber(inputs.printerCount, 0), margin, lineY);
  lineY += 22;
  drawKeyValueRow(
    doc,
    'Antal detaljer per skrivare',
    formatNumber(inputs.detailsPerPrinter, 0),
    margin,
    lineY,
  );

  doc.setFontSize(14);
  doc.setTextColor(18, 34, 49);
  doc.text('Kostnadsbild', margin, 530);

  const costBoxY = 548;
  const colWidth = (pageWidth - margin * 2 - 12) / 2;

  doc.setFillColor(250, 252, 251);
  doc.roundedRect(margin, costBoxY, colWidth, 128, 10, 10, 'F');
  doc.roundedRect(margin + colWidth + 12, costBoxY, colWidth, 128, 10, 10, 'F');

  doc.setTextColor(91, 106, 117);
  doc.setFontSize(11);
  doc.text('Per detalj', margin + 14, costBoxY + 22);
  doc.text('Totalt', margin + colWidth + 26, costBoxY + 22);

  doc.setTextColor(18, 34, 49);
  doc.setFontSize(12);
  doc.text(`Material: ${formatCurrency(results.materialCostPerPart)}`, margin + 14, costBoxY + 46);
  doc.text(`Maskin: ${formatCurrency(results.machineCostPerPart)}`, margin + 14, costBoxY + 68);
  doc.text(`Självkostnad: ${formatCurrency(results.internalCostPerPart)}`, margin + 14, costBoxY + 90);
  doc.text(`Kundpris: ${formatCurrency(results.salesPricePerPart)}`, margin + 14, costBoxY + 112);

  doc.text(`Totalkostnad: ${formatCurrency(results.batchInternalCost)}`, margin + colWidth + 26, costBoxY + 46);
  doc.text(`Total offert: ${formatCurrency(results.batchSalesTotal)}`, margin + colWidth + 26, costBoxY + 68);
  doc.text(`Leveranstid: ${formatLeadTime(results.leadTimeMinutes)}`, margin + colWidth + 26, costBoxY + 90);

  doc.setTextColor(120, 132, 140);
  doc.setFontSize(9);
  doc.text(
    'PolyFlow-offert. Värden baseras på inmatad kalkyl och materialdata.',
    margin,
    doc.internal.pageSize.getHeight() - 24,
  );

  const safeMaterialName = material.name.trim().replace(/[^a-z0-9-_]+/gi, '-').toLowerCase() || 'material';
  const safeLabel = calculationLabel.trim().replace(/[^a-z0-9-_]+/gi, '-').toLowerCase() || 'kalkyl';
  doc.save(`offert-${safeMaterialName}-${safeLabel}.pdf`);
}
