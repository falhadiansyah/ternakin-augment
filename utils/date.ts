// Utilities for date handling without timezone surprises.
// The core idea: for date-only fields, operate in local time and store/display as YYYY-MM-DD consistently.

// Convert a Date object to YYYY-MM-DD string using local time, not UTC.
export function toYMDLocal(date: Date): string {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${year}-${month}-${day}`;
}

// Parse a YYYY-MM-DD string as a Date in local time (00:00 local).
export function parseYMDLocal(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map((x) => parseInt(x, 10));
  // y, m-1 (0-based), d; creating Date(year, monthIndex, day) uses local time
  return new Date(y, (m || 1) - 1, d || 1);
}

// Given a Date from the picker, zero out the time part to local midnight for date-only storage.
export function normalizeToLocalDate(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

