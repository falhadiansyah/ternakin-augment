import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Web polyfill for AsyncStorage
const createWebStorage = () => {
  return {
    getItem: (key: string) => {
      if (typeof localStorage === 'undefined') {
        return null;
      }
      return localStorage.getItem(key);
    },
    setItem: (key: string, value: string) => {
      if (typeof localStorage === 'undefined') {
        return;
      }
      localStorage.setItem(key, value);
    },
    removeItem: (key: string) => {
      if (typeof localStorage === 'undefined') {
        return;
      }
      localStorage.removeItem(key);
    },
  };
};

// TODO: Replace with your actual Supabase URL and anon key
// For development, you can use these placeholder values
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://eggmfboszygzbitsjhso.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZ21mYm9zenlnemJpdHNqaHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MzA5MTYsImV4cCI6MjA3MDEwNjkxNn0.roGbFDK6A1SFAFQvzYue6Q8CWbE60hP8XA62w6HoO24';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? createWebStorage() : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});