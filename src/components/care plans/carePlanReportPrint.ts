/** Styles for care plan report PDF rendering (off-screen DOM). */
export const CARE_PLAN_REPORT_PRINT_CSS = `
  * { box-sizing: border-box; }
  .cpr-page {
    font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    font-size: 10px;
    line-height: 1.35;
    color: #0f172a;
    width: 210mm;
    max-width: 210mm;
    margin: 0 auto;
    padding: 12mm 18mm;
    background: #fff;
  }
  .cpr-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2px solid #0d9488;
    padding-bottom: 10px;
    margin-bottom: 14px;
    gap: 12px;
  }
  .cpr-title span { color: #0d9488; }
  .cpr-brand { display: flex; align-items: center; gap: 10px; }
  .cpr-logo { width: 44px; height: 44px; object-fit: contain; }
  .cpr-title { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; margin: 0; }
  .cpr-subtitle { font-size: 11px; color: #64748b; margin-top: 2px; }
  .cpr-meta-right { text-align: right; font-size: 9px; color: #64748b; }
  .cpr-section { margin-bottom: 12px; page-break-inside: avoid; }
  .cpr-section-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #0f766e;
    padding-bottom: 4px;
    margin-bottom: 6px;
  }
  .cpr-info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px 12px;
    margin-bottom: 12px;
    padding: 8px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
  }
  .cpr-info-item label {
    display: block;
    font-size: 8px;
    font-weight: 600;
    text-transform: uppercase;
    color: #64748b;
    margin-bottom: 1px;
  }
  .cpr-info-item span { font-size: 10px; font-weight: 500; }
  .cpr-table-wrap {
    margin: 0 0 10px 0;
    overflow: visible;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  table.cpr-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    margin: 0;
  }
  table.cpr-table tr {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  table.cpr-table + table.cpr-table { margin-top: 8px; }
  table.cpr-table th,
  table.cpr-table td {
    border: 1px solid #cbd5e1;
    padding: 0;
    text-align: left;
    vertical-align: top;
    background: #fff;
  }
  table.cpr-table th { background: #f1f5f9; width: 30%; }
  .cpr-cell {
    display: block;
    padding: 7px 9px;
    font-size: 9px;
    line-height: 1.5;
    white-space: normal;
    word-break: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
  }
  table.cpr-table th .cpr-cell {
    font-weight: 600;
    color: #334155;
    background: #f1f5f9;
  }
  table.cpr-table .cpr-capitalize { text-transform: capitalize; }
  .cpr-record {
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    margin-bottom: 8px;
    overflow: hidden;
    page-break-inside: avoid;
  }
  .cpr-record-title {
    padding: 6px 9px;
    font-size: 9px;
    font-weight: 700;
    background: #f1f5f9;
    border-bottom: 1px solid #cbd5e1;
    line-height: 1.45;
    word-break: break-word;
  }
  .cpr-kv {
    display: table;
    width: 100%;
    table-layout: fixed;
    border-top: 1px solid #e2e8f0;
  }
  .cpr-kv:first-of-type { border-top: none; }
  .cpr-kv-label,
  .cpr-kv-value {
    display: table-cell;
    vertical-align: top;
    padding: 7px 9px;
    font-size: 9px;
    line-height: 1.5;
    word-break: break-word;
    overflow-wrap: break-word;
  }
  .cpr-kv-label {
    width: 32%;
    font-weight: 600;
    color: #334155;
    background: #f8fafc;
    border-right: 1px solid #e2e8f0;
  }
  .cpr-kv-value { background: #fff; }
  .cpr-empty {
    padding: 6px;
    text-align: center;
    color: #94a3b8;
    font-style: italic;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
  }
  .cpr-footer {
    margin-top: 14px;
    padding-top: 8px;
    border-top: 1px solid #e2e8f0;
    font-size: 8px;
    color: #94a3b8;
    text-align: center;
  }
`;
