import type { Alert } from '../types';

/** Matches combined message from `createFromVitalAbnormalities` (semicolon-separated segments). */
export const VITALS_MESSAGE_PREFIX = ' recorded vitals outside the normal range: ';

/**
 * Each segment looks like: `Systolic BP: high (150 mmHg) (Rule name)` or with `CRITICAL low/high`.
 */
const VITALS_ABNORMALITY_SEGMENT_RE =
  /^(.+?):\s*(?:CRITICAL\s+)?(?:low|high)\s*\(\s*([\d.]+)\s+([^)]+)\)/i;

export type ParsedVitalsAlert = {
  displayTitle: string;
  bullets: string[];
};

export function tryParseVitalsAlert(alert: Alert): ParsedVitalsAlert | null {
  const prefixIdx = alert.message.indexOf(VITALS_MESSAGE_PREFIX);
  if (prefixIdx === -1) {
    return null;
  }

  const residentName = alert.message.slice(0, prefixIdx).trim();
  let remainder = alert.message.slice(prefixIdx + VITALS_MESSAGE_PREFIX.length).trim();
  if (remainder.endsWith('.')) {
    remainder = remainder.slice(0, -1);
  }

  const segments = remainder
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);

  const bullets: string[] = [];
  for (const segment of segments) {
    const m = VITALS_ABNORMALITY_SEGMENT_RE.exec(segment);
    if (m) {
      const label = m[1].trim();
      const value = m[2].trim();
      const unit = m[3].trim();
      bullets.push(`${label}: ${value} ${unit}`);
    } else {
      bullets.push(segment);
    }
  }

  if (bullets.length === 0) {
    return null;
  }

  const displayTitle = residentName
    ? `${residentName} - Vitals Alert`
    : 'Vitals Alert';

  return { displayTitle, bullets };
}
