import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect } from 'react';
import { useAuthContext } from './AuthProvider';
import { getFarmCurrency } from '@/lib/data';
import { setCurrentCurrency } from '@/utils/currency';

export function CurrencyInitializer() {
  const { user, loading } = useAuthContext() as { user: any; loading: boolean };

  useEffect(() => {
    // Apply cached currency immediately to avoid flicker
    (async () => {
      const cached = await AsyncStorage.getItem('currency');
      if (cached) setCurrentCurrency(cached);
    })();
  }, []);

  useEffect(() => {
    // Once we know auth state, if logged in, load farm currency from DB
    if (loading) return;
    if (!user) return;

    (async () => {
      try {
        const { code, error } = await getFarmCurrency();
        if (!error && code) {
          setCurrentCurrency(code);
          await AsyncStorage.setItem('currency', code);
        }
      } catch (_) {
        // ignore; cached currency remains
      }
    })();
  }, [user, loading]);

  return null;
}

