import { formatCompactNumber } from './number';

// Simple currency registry with common locales/symbols. Extend as needed.
const CurrencyRegistry: Record<string, { symbol: string; locale: string }> = {
  IDR: { symbol: 'Rp', locale: 'id-ID' },
  USD: { symbol: '$', locale: 'en-US' },
  EUR: { symbol: '€', locale: 'de-DE' },
  GBP: { symbol: '£', locale: 'en-GB' },
  JPY: { symbol: '¥', locale: 'ja-JP' },
  CNY: { symbol: '¥', locale: 'zh-CN' },
  AUD: { symbol: 'A$', locale: 'en-AU' },
  CAD: { symbol: 'C$', locale: 'en-CA' },
  CHF: { symbol: 'CHF', locale: 'de-CH' },
  HKD: { symbol: 'HK$', locale: 'zh-HK' },
  SGD: { symbol: 'S$', locale: 'en-SG' },
  MYR: { symbol: 'RM', locale: 'ms-MY' },
  THB: { symbol: '฿', locale: 'th-TH' },
  PHP: { symbol: '₱', locale: 'en-PH' },
  VND: { symbol: '₫', locale: 'vi-VN' },
  INR: { symbol: '₹', locale: 'en-IN' },
  NZD: { symbol: 'NZ$', locale: 'en-NZ' },
  SEK: { symbol: 'kr', locale: 'sv-SE' },
  NOK: { symbol: 'kr', locale: 'nb-NO' },
  DKK: { symbol: 'kr', locale: 'da-DK' },
  RUB: { symbol: '₽', locale: 'ru-RU' },
  TRY: { symbol: '₺', locale: 'tr-TR' },
  ZAR: { symbol: 'R', locale: 'en-ZA' },
  AED: { symbol: 'د.إ', locale: 'ar-AE' },
  SAR: { symbol: '﷼', locale: 'ar-SA' },
};

let currentCurrencyCode: string = 'IDR';
const listeners = new Set<(code: string) => void>();

export function setCurrentCurrency(code: string) {
  const next = CurrencyRegistry[code] ? code : 'IDR';
  if (next !== currentCurrencyCode) {
    currentCurrencyCode = next;
    // notify subscribers
    listeners.forEach((cb) => {
      try { cb(currentCurrencyCode); } catch {}
    });
  }
}

export function getCurrentCurrency(): string {
  return currentCurrencyCode;
}

export function onCurrencyChange(cb: (code: string) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getLocaleAndSymbol() {
  const cfg = CurrencyRegistry[currentCurrencyCode] || CurrencyRegistry['IDR'];
  return cfg;
}

// General currency formatter respecting selected currency.
export function formatIDR(
  value: number | null | undefined,
  options?: { withPrefix?: boolean; minimumFractionDigits?: number; maximumFractionDigits?: number }
) {
  const n = Number(value || 0);
  const { withPrefix = true, minimumFractionDigits = 0, maximumFractionDigits = 0 } = options || {};
  const { locale } = getLocaleAndSymbol();
  // Use Intl currency formatting with selected code
  const formatted = n.toLocaleString(locale, {
    style: 'currency',
    currency: currentCurrencyCode,
    minimumFractionDigits,
    maximumFractionDigits,
    currencyDisplay: 'symbol',
  });
  if (withPrefix) return formatted;
  // Without symbol: render as plain number with grouping in the same locale
  return n.toLocaleString(locale, { minimumFractionDigits, maximumFractionDigits });
}

export function formatIDRSigned(value: number, positive: boolean) {
  const abs = Math.abs(value);
  const f = formatIDR(abs);
  return `${positive ? '+' : '-'}${f}`;
}

// Compact currency formatter honoring selected currency (keeps name for compatibility)
export function formatCompactIDR(value: number | null | undefined): string {
  const n = Number(value ?? 0);
  const sign = n < 0 ? '-' : '';
  const { symbol } = getLocaleAndSymbol();
  const compact = formatCompactNumber(Math.abs(n));
  return `${sign}${symbol} ${compact}`;
}

