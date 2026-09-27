/**
 * Date formatting utilities for consistent DD-MM-YYYY format across the application.
 */

/**
 * Format any date input (string, Date, number) into DD-MM-YYYY string.
 * Examples:
 *   "2026-09-27" -> "27-09-2026"
 *   "2026-09-27T14:30:00Z" -> "27-09-2026"
 *   "27/09/2026" -> "27-09-2026"
 *   "27-09-2026" -> "27-09-2026"
 *   new Date(2026, 8, 27) -> "27-09-2026"
 */
export const formatDateDDMMYYYY = (
  raw?: string | Date | number | null,
  fallback = ''
): string => {
  if (raw === undefined || raw === null || raw === '') return fallback;

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return fallback;

    // Check if it's already DD-MM-YYYY
    if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
      return trimmed;
    }

    // Check for DD/MM/YYYY or DD.MM.YYYY
    const dmy = trimmed.match(/^(\d{1,2})[/. ](\d{1,2})[/. ](\d{4})/);
    if (dmy) {
      const [, d, m, y] = dmy;
      return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
    }

    // Check for YYYY-MM-DD or YYYY/MM/DD (preserves exact date without UTC timezone shift)
    const ymd = trimmed.match(/^(\d{4})[-/. ](\d{1,2})[-/. ](\d{1,2})/);
    if (ymd) {
      const [, y, m, d] = ymd;
      return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
    }
  }

  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return typeof raw === 'string' ? raw : fallback;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return typeof raw === 'string' ? raw : fallback;
  }
};

/**
 * Format any date input into DD-MM-YYYY hh:mm A.
 */
export const formatDateTimeDDMMYYYY = (
  raw?: string | Date | number | null,
  fallback = ''
): string => {
  if (raw === undefined || raw === null || raw === '') return fallback;
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return formatDateDDMMYYYY(raw, fallback);
    const dateStr = formatDateDDMMYYYY(d);
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 becomes 12
    const hourStr = String(hours).padStart(2, '0');
    return `${dateStr} ${hourStr}:${minutes} ${ampm}`;
  } catch {
    return formatDateDDMMYYYY(raw, fallback);
  }
};

/**
 * Converts a DD-MM-YYYY or any format to YYYY-MM-DD (ISO standard for HTML <input type="date">)
 */
export const toISODate = (raw?: string | Date | number | null): string => {
  if (raw === undefined || raw === null || raw === '') return '';
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    const dmy = trimmed.match(/^(\d{1,2})[-/. ](\d{1,2})[-/. ](\d{4})/);
    if (dmy) {
      const [, d, m, y] = dmy;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
};
