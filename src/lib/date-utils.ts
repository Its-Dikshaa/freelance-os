/**
 * Utility functions for date parsing, formatting, and overdue state detection.
 */

// Convert any date string (ISO, "20 sept", "Mar 25", etc.) to ISO format YYYY-MM-DD
export function toIsoDate(dateStr?: string): string {
  if (!dateStr || !dateStr.trim()) {
    return new Date().toISOString().slice(0, 10);
  }

  const trimmed = dateStr.trim();

  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Attempt JS Date parse directly
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  // Fallback if format is like "20 sept" or "Mar 25"
  const now = new Date();
  const currentYear = now.getFullYear();
  const fullAttempt = new Date(`${trimmed} ${currentYear}`);
  if (!isNaN(fullAttempt.getTime())) {
    return fullAttempt.toISOString().slice(0, 10);
  }

  return now.toISOString().slice(0, 10);
}

// Format ISO or raw date string to readable label (e.g., "Sep 20, 2026" or "20 Sep")
export function formatDisplayDate(dateStr?: string, includeYear = true): string {
  if (!dateStr || !dateStr.trim()) return 'No date';

  const iso = toIsoDate(dateStr);
  const parts = iso.split('-').map(Number);
  if (parts.length !== 3) return dateStr;

  const [year, monthNum, dayNum] = parts;
  if (!year || !monthNum || !dayNum) return dateStr;

  const dateObj = new Date(year, monthNum - 1, dayNum);
  if (isNaN(dateObj.getTime())) return dateStr;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const mName = monthNames[dateObj.getMonth()];

  const currentYear = new Date().getFullYear();
  if (includeYear && dateObj.getFullYear() !== currentYear) {
    return `${mName} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;
  }
  return `${mName} ${dateObj.getDate()}`;
}

// Check if a date string is strictly prior to today's start of day (midnight)
export function isOverdue(dateStr?: string): boolean {
  if (!dateStr || !dateStr.trim()) return false;

  const iso = toIsoDate(dateStr);
  const parts = iso.split('-').map(Number);
  if (parts.length !== 3) return false;

  const [year, monthNum, dayNum] = parts;
  if (!year || !monthNum || !dayNum) return false;

  const targetDate = new Date(year, monthNum - 1, dayNum);
  targetDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return targetDate.getTime() < today.getTime();
}

// Get day difference from today
export function getDaysDiff(dateStr?: string): { days: number; isPast: boolean } {
  if (!dateStr || !dateStr.trim()) return { days: 0, isPast: false };

  const iso = toIsoDate(dateStr);
  const parts = iso.split('-').map(Number);
  if (parts.length !== 3) return { days: 0, isPast: false };

  const [year, monthNum, dayNum] = parts;
  if (!year || !monthNum || !dayNum) return { days: 0, isPast: false };

  const targetDate = new Date(year, monthNum - 1, dayNum);
  targetDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = targetDate.getTime() - today.getTime();
  const days = Math.round(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
  return {
    days,
    isPast: diffMs < 0
  };
}
