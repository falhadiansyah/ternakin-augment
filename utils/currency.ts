export function formatIDR(value: number | null | undefined, options?: { withPrefix?: boolean; minimumFractionDigits?: number; maximumFractionDigits?: number }) {
  const n = Number(value || 0);
  const { withPrefix = true, minimumFractionDigits = 0, maximumFractionDigits = 0 } = options || {};
  const formatted = n.toLocaleString('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits,
    maximumFractionDigits,
  });
  // Ensure spacing like "Rp 10.000"
  return withPrefix ? formatted : formatted.replace(/^Rp\s?/, '');
}

export function formatIDRSigned(value: number, positive: boolean) {
  const abs = Math.abs(value);
  const f = formatIDR(abs);
  return `${positive ? '+' : '-'}${f}`;
}

