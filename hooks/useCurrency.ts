import { useEffect, useState } from 'react';
import { getCurrentCurrency, onCurrencyChange } from '@/utils/currency';

// Hook to re-render components when currency changes
export function useCurrency(): string {
  const [code, setCode] = useState<string>(getCurrentCurrency());
  useEffect(() => {
    const off = onCurrencyChange((c) => setCode(c));
    return off;
  }, []);
  return code;
}

