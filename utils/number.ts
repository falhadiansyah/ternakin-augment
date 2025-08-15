export type CompactOptions = {
  decimals?: number; // maximum decimals to show, default 1
};

// Format numbers into compact notation: K (thousand), M (million), B (billion)
// Shows up to 1 decimal place when useful, and removes trailing .0
export function formatCompactNumber(value: number | null | undefined, options?: CompactOptions): string {
  const n = Number(value ?? 0);
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  const decimals = options?.decimals ?? 1;

  const format = (v: number, suffix: string) => {
    const rounded = roundTo(v, decimals);
    const str = stripTrailingZero(rounded.toFixed(decimals));
    return `${sign}${str}${suffix}`;
  };

  if (abs >= 1_000_000_000) {
    return format(abs / 1_000_000_000, 'B');
  }
  if (abs >= 1_000_000) {
    return format(abs / 1_000_000, 'M');
  }
  if (abs >= 1_000) {
    return format(abs / 1_000, 'K');
  }

  // < 1000, show as-is without abbreviation (preserve sign)
  // Use no grouping to keep it compact; caller can localize if desired
  return `${n}`;
}

export function formatCompactIDR(value: number | null | undefined, options?: CompactOptions): string {
  const n = Number(value ?? 0);
  const sign = n < 0 ? '-' : '';
  const compact = formatCompactNumber(Math.abs(n), options);
  // compact returns like "1.5K"; ensure we don't duplicate sign
  const unsignedCompact = compact.startsWith('-') ? compact.slice(1) : compact;
  // Follow existing spacing style like "Rp 10.000" -> use "Rp " prefix
  return `${sign}Rp ${unsignedCompact}`;
}

function roundTo(n: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(n * factor) / factor;
}

function stripTrailingZero(s: string): string {
  // remove trailing ".0" or trailing zeros after decimal
  if (!s.includes('.')) return s;
  return s.replace(/\.0+$|\.(\d*?)0+$/, (_, p1) => (p1 ? `.${p1}` : ''));
}

