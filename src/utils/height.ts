/** Parse stored or user-entered height into total inches. */
export function parseHeightToInches(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const feetInches = trimmed.match(/^(\d+)\s*['′]\s*(\d+(?:\.\d+)?)?\s*["″]?$/);
  if (feetInches) {
    const feet = Number(feetInches[1]);
    const inches = feetInches[2] ? Number(feetInches[2]) : 0;
    if (feet >= 0 && inches >= 0) return Math.round(feet * 12 + inches);
  }

  const feetInText = trimmed.match(/^(\d+)\s*ft\s*(\d+(?:\.\d+)?)?\s*in?$/i);
  if (feetInText) {
    const feet = Number(feetInText[1]);
    const inches = feetInText[2] ? Number(feetInText[2]) : 0;
    if (feet >= 0 && inches >= 0) return Math.round(feet * 12 + inches);
  }

  const pair = trimmed.match(/^(\d+)\s*[, ]\s*(\d+(?:\.\d+)?)$/);
  if (pair) {
    const feet = Number(pair[1]);
    const inches = Number(pair[2]);
    if (feet >= 0 && inches >= 0) return Math.round(feet * 12 + inches);
  }

  const num = Number(trimmed);
  if (!Number.isNaN(num) && num >= 0) return Math.round(num);
  return null;
}

/** Format total inches as feet'inches" (e.g. 68 → 5'8"). */
export function formatInchesToFeetInches(totalInches: number): string {
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}"`;
}

export type HeightUnit = 'ft' | 'in';

export function formatHeightDisplay(totalInches: number, unit: HeightUnit): string {
  if (totalInches <= 0) return '';
  return unit === 'ft' ? formatInchesToFeetInches(totalInches) : String(totalInches);
}

/** Parse user input for the active unit; returns total inches or null if invalid. */
export function parseHeightInput(value: string, unit: HeightUnit): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (unit === 'in') {
    const inches = Number(trimmed);
    if (Number.isNaN(inches) || inches < 0) return null;
    return Math.round(inches);
  }

  const fromFeetFormat = parseHeightToInches(trimmed);
  if (fromFeetFormat !== null) return fromFeetFormat;

  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    const feet = Number(trimmed);
    if (feet >= 0) return Math.round(feet * 12);
  }

  return null;
}

/** Normalize ft-mode text on blur (e.g. "5" → 5'0", "5 6" → 5'6"). */
export function normalizeFeetHeightInput(value: string): string {
  const inches = parseHeightInput(value, 'ft');
  if (inches === null) return value.trim();
  return formatInchesToFeetInches(inches);
}

/** Format stored height (inches or legacy ft/in string) for display in centimeters. */
export function formatHeightAsCm(heightValue: string): string | null {
  const inches = parseHeightToInches(heightValue);
  if (inches === null || inches <= 0) return null;
  const cm = Math.round(inches * 2.54 * 10) / 10;
  return `${cm} cm`;
}

export function parseCommaList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
