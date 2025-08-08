import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'id';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Auth
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'auth.email': 'Email Address',
    'auth.email_placeholder': 'Enter your email',
    'auth.send_otp': 'Send OTP',
    'auth.verify_code': 'Verify Code',
    'auth.otp_placeholder': 'Enter 6-digit code',
    'auth.continue_with_google': 'Continue with Google',
    'auth.back_to_email': 'Back to Email',
    'auth.otp_sent': 'OTP Sent',
    'auth.otp_sent_message': 'Please check your email for the verification code',
    'auth.verify_email': 'Verify Your Email',
    'auth.otp_sent_to': 'We sent a 6-digit code to',
    'auth.terms_disclaimer': 'By continuing, you agree to our Terms of Service and Privacy Policy',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.livestock': 'Livestock',
    'nav.feeding': 'Feeding',
    'nav.financial': 'Financial',
    'nav.profile': 'Profile',
    
    // Settings
    'settings.theme': 'Theme',
    'settings.language': 'Language',
    'settings.dark_mode': 'Dark Mode',
    'settings.light_mode': 'Light Mode',
    'settings.system': 'System',
    'settings.english': 'English',
    'settings.indonesian': 'Indonesian',
    'settings.notifications': 'Notifications',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.ok': 'OK',
    
    // App
    'app.name': 'Ternakin',
    'app.tagline': 'Livestock Management Made Simple',
  },
  id: {
    // Auth
    'auth.login': 'Masuk',
    'auth.logout': 'Keluar',
    'auth.email': 'Alamat Email',
    'auth.email_placeholder': 'Masukkan email Anda',
    'auth.send_otp': 'Kirim OTP',
    'auth.verify_code': 'Verifikasi Kode',
    'auth.otp_placeholder': 'Masukkan kode 6 digit',
    'auth.continue_with_google': 'Lanjutkan dengan Google',
    'auth.back_to_email': 'Kembali ke Email',
    'auth.otp_sent': 'OTP Terkirim',
    'auth.otp_sent_message': 'Silakan cek email Anda untuk kode verifikasi',
    'auth.verify_email': 'Verifikasi Email Anda',
    'auth.otp_sent_to': 'Kami mengirim kode 6 digit ke',
    'auth.terms_disclaimer': 'Dengan melanjutkan, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi kami',
    
    // Navigation
    'nav.dashboard': 'Dasbor',
    'nav.livestock': 'Ternak',
    'nav.feeding': 'Pakan',
    'nav.financial': 'Keuangan',
    'nav.profile': 'Profil',
    
    // Settings
    'settings.theme': 'Tema',
    'settings.language': 'Bahasa',
    'settings.dark_mode': 'Mode Gelap',
    'settings.light_mode': 'Mode Terang',
    'settings.system': 'Sistem',
    'settings.english': 'Bahasa Inggris',
    'settings.indonesian': 'Bahasa Indonesia',
    'settings.notifications': 'Notifikasi',
    
    // Common
    'common.loading': 'Memuat...',
    'common.error': 'Error',
    'common.success': 'Berhasil',
    'common.cancel': 'Batal',
    'common.save': 'Simpan',
    'common.edit': 'Edit',
    'common.delete': 'Hapus',
    'common.yes': 'Ya',
    'common.no': 'Tidak',
    'common.ok': 'OK',
    
    // App
    'app.name': 'Ternakin',
    'app.tagline': 'Manajemen Ternak yang Sederhana',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Load saved language from storage
    AsyncStorage.getItem('language').then((savedLanguage) => {
      if (savedLanguage && ['en', 'id'].includes(savedLanguage)) {
        setLanguageState(savedLanguage as Language);
      }
    });
  }, []);

  const setLanguage = async (newLanguage: Language) => {
    setLanguageState(newLanguage);
    await AsyncStorage.setItem('language', newLanguage);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
