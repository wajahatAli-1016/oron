import type { CarePlanReportContext } from './carePlanReportData';
import { formatReportDate, formatReportList } from './carePlanReportData';
import { CARE_PLAN_REPORT_PRINT_CSS } from './carePlanReportPrint';

function esc(value: string | number): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cell(value?: string | number | null): string {
  if (value === undefined || value === null || value === '') return '—';
  return esc(value);
}

function emptyBlock(message: string): string {
  return `<p class="cpr-empty">${esc(message)}</p>`;
}

function prefCell(value: string | undefined, isGlobalNa?: boolean): string {
  if (!value && isGlobalNa) return 'N/A';
  return cell(value);
}

function thCell(content: string, width?: string): string {
  const w = width ? ` style="width:${width}"` : '';
  return `<th${w}><div class="cpr-cell">${content}</div></th>`;
}

function tdCell(content: string, colspan?: number): string {
  const col = colspan ? ` colspan="${colspan}"` : '';
  return `<td${col}><div class="cpr-cell">${content}</div></td>`;
}

function kvRow(label: string, value: string): string {
  return `<div class="cpr-kv"><div class="cpr-kv-label">${esc(label)}</div><div class="cpr-kv-value">${value}</div></div>`;
}

function recordBlock(title: string, rows: string): string {
  return `<div class="cpr-record"><div class="cpr-record-title">${title}</div>${rows}</div>`;
}

export async function fetchLogoDataUri(): Promise<string | null> {
  try {
    const res = await fetch('/oron-logo.svg');
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export function buildCarePlanReportBodyHtml(
  data: CarePlanReportContext,
  logoDataUri: string | null,
): string {
  const { residentName, facilityName, branchName, carePlan, sections, generatedAt } = data;
  const logoImg = logoDataUri
    ? `<img class="cpr-logo" src="${logoDataUri}" alt="Oron Care" width="44" height="44" />`
    : '';

  const infoItems = [
    ['Resident', residentName],
    ['Facility', facilityName || '—'],
    ['Branch', branchName || '—'],
    ['Last Review', formatReportDate(carePlan.lastReviewDate)],
    ['Next Review', formatReportDate(carePlan.nextReviewDate)],
    ['Author', carePlan.author || '—'],
  ]
    .map(
      ([label, value]) =>
        `<div class="cpr-info-item"><label>${esc(label)}</label><span>${esc(value)}</span></div>`,
    )
    .join('');

  let clinicalHtml = emptyBlock('No clinical assessment on file.');
  if (sections.clinical) {
    const c = sections.clinical;
    const adlRows = Object.entries(c.adlScores ?? {})
      .map(
        ([key, val]) =>
          `<tr>${thCell(esc(key), '40%').replace('class="cpr-cell"', 'class="cpr-cell cpr-capitalize"')}${tdCell(cell(val))}</tr>`,
      )
      .join('');
    const adlTable =
      adlRows.length > 0
        ? `<div class="cpr-table-wrap"><table class="cpr-table"><thead><tr>${thCell('ADL Activity', '40%')}${thCell('Level of Assistance')}</tr></thead><tbody>${adlRows}</tbody></table></div>`
        : '';
    clinicalHtml = `<div class="cpr-table-wrap"><table class="cpr-table"><tbody>
      <tr>${thCell('Medical Conditions', '28%')}${tdCell(esc(formatReportList(c.conditions)))}</tr>
      <tr>${thCell('Allergies')}${tdCell(esc(formatReportList(c.allergies)))}</tr>
      <tr>${thCell('Mobility')}${tdCell(cell(c.mobility))}</tr>
      <tr>${thCell('Cognitive')}${tdCell(cell(c.cognitive))}</tr>
    </tbody></table></div>${adlTable}`;
  }

  let riskHtml = emptyBlock('No risk & safety profile on file.');
  if (sections.risk) {
    const r = sections.risk;
    riskHtml = `<div class="cpr-table-wrap"><table class="cpr-table"><tbody>
      <tr>${thCell('Fall Risk Score', '28%')}${tdCell(`${esc(r.fallRiskScore)} / 100`)}</tr>
      <tr>${thCell('Mobility Trend')}${tdCell(cell(r.mobilityTrend))}</tr>
      <tr>${thCell('Near-Fall Events (30d)')}${tdCell(r.nearFallEvents)}</tr>
      <tr>${thCell('Vitals Trend')}${tdCell(cell(r.vitalsTrend))}</tr>
      <tr>${thCell('Narrative Interpretation')}${tdCell(cell(r.narrativeInterpretation))}</tr>
    </tbody></table></div>`;
  }

  let goalsHtml = emptyBlock('No goals defined.');
  if (sections.goals.length > 0) {
    goalsHtml = sections.goals
      .map((g, i) =>
        recordBlock(
          `Goal ${i + 1}: ${g.description ? esc(g.description) : '—'}`,
          [
            kvRow('Target Metric', cell(g.targetMetric)),
            kvRow('Timeframe', cell(g.timeframe)),
            kvRow('Responsible', cell(g.responsibleRole)),
            kvRow('Status', cell(g.status)),
          ].join(''),
        ),
      )
      .join('');
  }

  let interventionsHtml = emptyBlock('No planned interventions.');
  if (sections.interventions.length > 0) {
    interventionsHtml = sections.interventions
      .map((item, i) =>
        recordBlock(
          `Intervention ${i + 1}: ${item.description ? esc(item.description) : '—'}`,
          [
            kvRow('Responsible', cell(item.responsibleStaffRole)),
            kvRow('Frequency', cell(item.frequency)),
            kvRow('Trigger Conditions', cell(item.triggerConditions)),
            kvRow('Effectiveness Metric', cell(item.effectivenessMetric)),
          ].join(''),
        ),
      )
      .join('');
  }

  let prefsHtml = emptyBlock('No preferences recorded.');
  if (sections.preference) {
    const p = sections.preference;
    const prefRows = (
      [
        ['Sleep Pattern', p.sleepPattern],
        ['Meal Preferences', p.mealPref],
        ['Communication Needs', p.communication],
        ['Social Preferences', p.socialPref],
        ['Family Engagement', p.familyEngagement],
      ] as const
    )
      .map(([label, value]) => `<tr>${thCell(esc(label), '32%')}${tdCell(prefCell(value, p.isNA))}</tr>`)
      .join('');
    prefsHtml = `<div class="cpr-table-wrap"><table class="cpr-table"><tbody>${prefRows}</tbody></table></div>`;
  }

  const versionLine = carePlan.version ? `<p>Version: v${esc(carePlan.version)}</p>` : '';

  return `<header class="cpr-header">
    <div class="cpr-brand">${logoImg}
      <div>
        <p class="cpr-title">ORON<span> Care</span></p>
        <p class="cpr-subtitle">Resident Care Plan Report</p>
      </div>
    </div>
    <div class="cpr-meta-right">
      <p>${esc(formatReportDate(generatedAt))}</p>${versionLine}
    </div>
  </header>
  <section class="cpr-section"><h2 class="cpr-section-title">Resident Information</h2><div class="cpr-info-grid">${infoItems}</div></section>
  <section class="cpr-section"><h2 class="cpr-section-title">Clinical &amp; Functional Assessment</h2>${clinicalHtml}</section>
  <section class="cpr-section"><h2 class="cpr-section-title">Risk &amp; Safety</h2>${riskHtml}</section>
  <section class="cpr-section"><h2 class="cpr-section-title">Goals of Care</h2>${goalsHtml}</section>
  <section class="cpr-section"><h2 class="cpr-section-title">Planned Interventions</h2>${interventionsHtml}</section>
  <section class="cpr-section"><h2 class="cpr-section-title">Person-Centered Preferences</h2>${prefsHtml}</section>
  <p class="cpr-footer">Confidential — ${esc(residentName)}  Oron Care</p>`;
}

export function carePlanReportFilename(residentName: string): string {
  const safe = residentName.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
  const date = new Date().toISOString().slice(0, 10);
  return `CarePlan-${safe || 'resident'}-${date}.pdf`;
}

async function waitForImages(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll('img'));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }),
    ),
  );
}

/** Render report off-screen and download as PDF (no pop-up). */
export async function downloadCarePlanReportPdf(bodyHtml: string, filename: string): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = 'position:fixed;left:-10000px;top:0;z-index:-1;pointer-events:none;';

  const style = document.createElement('style');
  style.textContent = CARE_PLAN_REPORT_PRINT_CSS;

  const page = document.createElement('div');
  page.className = 'cpr-page';
  page.innerHTML = bodyHtml;

  host.appendChild(style);
  host.appendChild(page);
  document.body.appendChild(host);

  try {
    await waitForImages(page);
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 80)));
    });

    const canvas = await html2canvas(page, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: page.scrollWidth,
      height: page.scrollHeight,
      windowWidth: page.scrollWidth,
      onclone: (clonedDoc) => {
        const clonedPage = clonedDoc.querySelector('.cpr-page');
        if (clonedPage instanceof HTMLElement) {
          clonedPage.style.width = '210mm';
          clonedPage.style.overflow = 'visible';
        }
      },
    });

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    // Slice the canvas per page so content never overlaps at page boundaries.
    const sliceCanvas = document.createElement('canvas');
    const sliceCtx = sliceCanvas.getContext('2d');
    if (!sliceCtx) throw new Error('Could not create PDF render context');

    const pixelsPerPage = Math.floor((canvas.width * pageHeight) / pageWidth);
    let sourceY = 0;
    let pageIndex = 0;

    while (sourceY < canvas.height) {
      const sliceHeight = Math.min(pixelsPerPage, canvas.height - sourceY);
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceHeight;
      sliceCtx.clearRect(0, 0, sliceCanvas.width, sliceCanvas.height);
      sliceCtx.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        sliceHeight,
        0,
        0,
        canvas.width,
        sliceHeight,
      );

      const sliceImg = sliceCanvas.toDataURL('image/png');
      const slicePdfHeight = (sliceHeight * pageWidth) / canvas.width;

      if (pageIndex > 0) pdf.addPage();
      pdf.addImage(sliceImg, 'PNG', 0, 0, pageWidth, slicePdfHeight);

      sourceY += sliceHeight;
      pageIndex += 1;
    }

    pdf.save(filename);
  } finally {
    document.body.removeChild(host);
  }
}

/** Build report and download as PDF only. */
export async function exportCarePlanReport(data: CarePlanReportContext): Promise<void> {
  const logoDataUri = await fetchLogoDataUri();
  const bodyHtml = buildCarePlanReportBodyHtml(data, logoDataUri);
  const filename = carePlanReportFilename(data.residentName);
  await downloadCarePlanReportPdf(bodyHtml, filename);
}
