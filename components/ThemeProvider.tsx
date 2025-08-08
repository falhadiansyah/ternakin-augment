import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>('system');

  useEffect(() => {
    // Load saved theme from storage
    AsyncStorage.getItem('theme').then((savedTheme) => {
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeState(savedTheme as ThemeMode);
      }
    });
  }, []);

  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    await AsyncStorage.setItem('theme', newTheme);
  };

  const isDark = theme === 'system' 
    ? systemColorScheme === 'dark'
    : theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
