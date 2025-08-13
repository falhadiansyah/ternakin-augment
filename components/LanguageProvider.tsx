import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'id';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
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
    'auth.verification_error': 'Verification Error',
    'auth.invalid_otp': 'Invalid OTP',
    'auth.failed_to_send_otp': 'Failed to send OTP',
    'auth.email_required': 'Email is required',
    'auth.valid_email_required': 'Please enter a valid email address',
    'auth.otp_required': 'OTP is required',
    'auth.otp_must_be_6_digits': 'OTP must be 6 digits',

    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.livestock': 'Livestock',
    'nav.feeding': 'Feeding',
    'nav.financial': 'Financial',
    'nav.profile': 'Profile',

    // Dashboard
    'dashboard.total_livestock': 'Total Livestock',
    'dashboard.total_income': 'Total Income',
    'dashboard.total_expenses': 'Total Expenses',
    'dashboard.net_profit': 'Net Profit',
    'dashboard.financial_overview': 'Financial Overview',
    'dashboard.today': 'Today',
    'dashboard.this_month': 'This Month',
    'dashboard.this_year': 'This Year',

    // Livestock
    'livestock.add_new_batch': 'Add New Batch',
    'livestock.current_count': 'Current Count',
    'livestock.starting_count': 'Starting Count',
    'livestock.total_cost': 'Total Cost',
    'livestock.total': 'Total',
    'livestock.days_weeks': 'Days ({days} Weeks)',
    'livestock.temperature': 'Temp',
    'livestock.lighting': 'Lighting',
    'livestock.age_weeks': 'Age (Weeks)',
    'livestock.expected_at_weeks': 'Expected at {weeks} weeks:',
    'livestock.male_weight': 'Male: {weight}g',
    'livestock.female_weight': 'Female: {weight}g',
    'livestock.feed_per_day': 'Feed: {amount}g/day',
    'livestock.add_stock': 'Add Stock',
    'livestock.reduce_stock': 'Reduce Stock',
    'livestock.count_qty': 'Count/Qty',
    'livestock.enter_quantity': 'Enter quantity',
    'livestock.type': 'Type',
    'livestock.sold': 'Sold',
    'livestock.death': 'Death',
    'livestock.purchased': 'Purchased',
    'livestock.other': 'Other',
    'livestock.description': 'Description',
    'livestock.optional_description': 'Optional description',
    'livestock.total_price': 'Total Price (Optional)',
    'livestock.enter_price': 'Enter price if applicable',
    'livestock.cannot_reduce_below_zero': 'Cannot reduce stock below 0',
    'livestock.stock_adjustment_saved': 'Stock adjustment saved successfully',
    'livestock.failed_to_save': 'Failed to save stock adjustment',

    // Feeding
    'feeding.schedule': 'Schedule',
    'feeding.recipes': 'Recipes',
    'feeding.add_transaction': 'Add Transaction',
    'feeding.assign_recipe': 'Assign Recipe to {batch}',
    'feeding.select_recipe': 'Select recipe',
    'feeding.from_week': 'From week',
    'feeding.to_week': 'To week',
    'feeding.overlapping_plan': 'Overlapping feeding plan exists for this batch and weeks',
    'feeding.plan_deleted': 'Feeding plan deleted successfully',
    'feeding.failed_to_delete': 'Failed to delete feeding plan',
    'feeding.confirm_delete': 'Are you sure you want to delete this feeding plan?',
    'feeding.add_row': 'Add Row',
    'feeding.save_all': 'Save All',
    'feeding.saving': 'Saving...',
    'feeding.all_changes_saved': 'All changes saved successfully',
    'feeding.failed_to_save': 'Failed to save changes',
    'feeding.fill_required_fields': 'Please fill in all required fields (Batch and Recipe)',
    'feeding.no_feeding_plans': 'No Feeding Plans',
    'feeding.add_first_plan': 'Add your first feeding plan below',
'feeding.plans_title': 'Feeding Plans',
    'feeding.new_feeding_plan': 'New Feeding Plan',
    'feeding.batch': 'Batch',
    'feeding.recipe': 'Recipe',
    'feeding.from_week_label': 'From Week',
    'feeding.to_week_label': 'To Week',
    'feeding.ingredients': 'Ingredients:',
'feeding.feed_total': 'Feed total',
'feeding.water_total': 'Water total',
'recipe.add_recipe': 'Add Recipe',
    'feeding.more_ingredients': '+{count} more ingredients',
    'feeding.select_recipe_title': 'Select Recipe',

    // Financial
    'financial.total_income': 'Total Income',
    'financial.total_expenses': 'Total Expenses',
    'financial.net_balance': 'Net Balance',
    'financial.recent_transactions': 'Recent Transactions',
    'financial.add_transaction': 'Add Transaction',
    'financial.from_date': 'From Date',
    'financial.to_date': 'To Date',
    'financial.clear': 'Clear',
    'financial.transaction': 'Transaction',

    // Profile
    'profile.farm_details': 'Farm Details',
    'profile.settings': 'Settings',
    'profile.notifications': 'Notifications',
    'profile.help_support': 'Help & Support',
    'profile.confirm_logout': 'Are you sure you want to logout?',
    'profile.farm_information': 'Farm Information',
    'profile.farm_name': 'Farm Name',
    'profile.address': 'Address',
    'profile.phone': 'Phone',
    'profile.email': 'Email',
    'profile.description': 'Description',
    'profile.farm_statistics': 'Farm Statistics',
    'profile.created': 'Created',
    'profile.last_updated': 'Last Updated',
    'profile.actions': 'Actions',
    'profile.edit_farm_details': 'Edit Farm Details',
    'profile.farm_settings': 'Farm Settings',
    'profile.manage_team': 'Manage Team',
    'profile.error_loading_farm': 'Error Loading Farm',
    'profile.retry': 'Retry',
    'profile.no_farm_data': 'No Farm Data',
    'profile.farm_details_error': 'Farm details could not be loaded. Please try again.',
    'profile.loading_farm_details': 'Loading farm details...',
    'profile.farm_management_system': 'Farm Management System',

    // Farm Selection
    'farm.create_new_farm': 'Create New Farm',
    'farm.farm_name': 'Farm Name',
    'farm.address': 'Address',
    'farm.phone': 'Phone',
    'farm.create_farm': 'Create Farm',
    'farm.join_existing_farm': 'Join Existing Farm',
    'farm.farm_id': 'Farm ID',
    'farm.join_farm': 'Join Farm',
    'farm.farm_id_tip': 'Tip: Owners can share Farm ID or a QR code.',
    'farm.select_farm': 'Select Farm',
    'farm.farm_name_required': 'Farm name already in use',
    'farm.failed_to_create': 'Failed to create farm',
    'farm.failed_to_join': 'Failed to join farm',

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
    'common.validation': 'Validation',
    'common.please_select_recipe': 'Please select a recipe',
    'common.enter_valid_week_range': 'Please enter valid week range',
    'common.week_range_invalid': 'Week range is invalid',
    'common.please_enter_valid_quantity': 'Please enter a valid quantity',

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

    // Dashboard
    'dashboard.total_livestock': 'Total Ternak',
    'dashboard.total_income': 'Total Pendapatan',
    'dashboard.total_expenses': 'Total Pengeluaran',
    'dashboard.net_profit': 'Laba Bersih',
    'dashboard.financial_overview': 'Ringkasan Keuangan',
    'dashboard.today': 'Hari Ini',
    'dashboard.this_month': 'Bulan Ini',
    'dashboard.this_year': 'Tahun Ini',

    // Livestock
    'livestock.add_new_batch': 'Tambah Batch Baru',
    'livestock.current_count': 'Jumlah Saat Ini',
    'livestock.starting_count': 'Jumlah Awal',
    'livestock.total_cost': 'Total Biaya',
    'livestock.total': 'Total',
    'livestock.days_weeks': 'Hari ({days} Minggu)',
    'livestock.temperature': 'Suhu',
    'livestock.lighting': 'Pencahayaan',
    'livestock.age_weeks': 'Usia (Minggu)',
    'livestock.expected_at_weeks': 'Perkiraan pada {weeks} minggu:',
    'livestock.male_weight': 'Jantan: {weight}g',
    'livestock.female_weight': 'Betina: {weight}g',
    'livestock.feed_per_day': 'Pakan: {amount}g/hari',
    'livestock.add_stock': 'Tambah Stok',
    'livestock.reduce_stock': 'Kurangi Stok',
    'livestock.count_qty': 'Jumlah/Kuantitas',
    'livestock.enter_quantity': 'Masukkan kuantitas',
    'livestock.type': 'Jenis',
    'livestock.sold': 'Terjual',
    'livestock.death': 'Mati',
    'livestock.purchased': 'Dibeli',
    'livestock.other': 'Lainnya',
    'livestock.description': 'Deskripsi',
    'livestock.optional_description': 'Deskripsi opsional',
    'livestock.total_price': 'Total Harga (Opsional)',
    'livestock.enter_price': 'Masukkan harga jika ada',
    'livestock.cannot_reduce_below_zero': 'Tidak dapat mengurangi stok di bawah 0',
    'livestock.stock_adjustment_saved': 'Penyesuaian stok berhasil disimpan',
    'livestock.failed_to_save': 'Gagal menyimpan penyesuaian stok',

    // Feeding
    'feeding.schedule': 'Jadwal',
    'feeding.recipes': 'Resep',
    'feeding.add_transaction': 'Tambah Transaksi',
    'feeding.assign_recipe': 'Tetapkan Resep ke {batch}',
    'feeding.select_recipe': 'Pilih resep',
    'feeding.from_week': 'Dari minggu',
    'feeding.to_week': 'Sampai minggu',
    'feeding.overlapping_plan': 'Jadwal pakan yang tumpang tindih sudah ada untuk batch dan minggu ini',
    'feeding.plan_deleted': 'Jadwal pakan berhasil dihapus',
    'feeding.failed_to_delete': 'Gagal menghapus jadwal pakan',
    'feeding.confirm_delete': 'Apakah Anda yakin ingin menghapus jadwal pakan ini?',
    'feeding.add_row': 'Tambah Baris',
    'feeding.save_all': 'Simpan Semua',
    'feeding.saving': 'Menyimpan...',
    'feeding.all_changes_saved': 'Semua perubahan berhasil disimpan',
    'feeding.failed_to_save': 'Gagal menyimpan perubahan',
    'feeding.fill_required_fields': 'Silakan isi semua field yang diperlukan (Batch dan Resep)',
    'feeding.no_feeding_plans': 'Tidak Ada Jadwal Pakan',
    'feeding.add_first_plan': 'Tambahkan jadwal pakan pertama Anda di bawah',
    'feeding.new_feeding_plan': 'Jadwal Pakan Baru',
    'feeding.plans_title': 'Rencana Pakan',

    'feeding.batch': 'Batch',
    'feeding.recipe': 'Resep',
    'feeding.from_week_label': 'Dari Minggu',
    'feeding.to_week_label': 'Sampai Minggu',
    'feeding.ingredients': 'Bahan:',
'feeding.feed_total': 'Total pakan',
'feeding.water_total': 'Total air',
'recipe.add_recipe': 'Tambah Resep',
    'feeding.more_ingredients': '+{count} bahan lainnya',
    'feeding.select_recipe_title': 'Pilih Resep',

    // Financial
    'financial.total_income': 'Total Pendapatan',
    'financial.total_expenses': 'Total Pengeluaran',
    'financial.net_balance': 'Saldo Bersih',
    'financial.recent_transactions': 'Transaksi Terbaru',
    'financial.add_transaction': 'Tambah Transaksi',
    'financial.from_date': 'Dari Tanggal',
    'financial.to_date': 'Sampai Tanggal',
    'financial.clear': 'Bersihkan',
    'financial.transaction': 'Transaksi',

    // Profile
    'profile.farm_details': 'Detail Peternakan',
    'profile.settings': 'Pengaturan',
    'profile.notifications': 'Notifikasi',
    'profile.help_support': 'Bantuan & Dukungan',
    'profile.confirm_logout': 'Apakah Anda yakin ingin keluar?',
    'profile.farm_information': 'Informasi Peternakan',
    'profile.farm_name': 'Nama Peternakan',
    'profile.address': 'Alamat',
    'profile.phone': 'Telepon',
    'profile.email': 'Email',
    'profile.description': 'Deskripsi',
    'profile.farm_statistics': 'Statistik Peternakan',
    'profile.created': 'Dibuat',
    'profile.last_updated': 'Terakhir Diperbarui',
    'profile.actions': 'Aksi',
    'profile.edit_farm_details': 'Edit Detail Peternakan',
    'profile.farm_settings': 'Pengaturan Peternakan',
    'profile.manage_team': 'Kelola Tim',
    'profile.error_loading_farm': 'Error Memuat Peternakan',
    'profile.retry': 'Coba Lagi',
    'profile.no_farm_data': 'Tidak Ada Data Peternakan',
    'profile.farm_details_error': 'Detail peternakan tidak dapat dimuat. Silakan coba lagi.',
    'profile.loading_farm_details': 'Memuat detail peternakan...',
    'profile.farm_management_system': 'Sistem Manajemen Peternakan',

    // Farm Selection
    'farm.create_new_farm': 'Buat Peternakan Baru',
    'farm.farm_name': 'Nama Peternakan',
    'farm.address': 'Alamat',
    'farm.phone': 'Telepon',
    'farm.create_farm': 'Buat Peternakan',
    'farm.join_existing_farm': 'Bergabung dengan Peternakan yang Ada',
    'farm.farm_id': 'ID Peternakan',
    'farm.join_farm': 'Bergabung dengan Peternakan',
    'farm.farm_id_tip': 'Tips: Pemilik dapat berbagi ID Peternakan atau kode QR.',
    'farm.select_farm': 'Pilih Peternakan',
    'farm.farm_name_required': 'Nama peternakan sudah digunakan',
    'farm.failed_to_create': 'Gagal membuat peternakan',
    'farm.failed_to_join': 'Gagal bergabung dengan peternakan',

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
    'common.validation': 'Validasi',
    'common.please_select_recipe': 'Silakan pilih resep',
    'common.enter_valid_week_range': 'Silakan masukkan rentang minggu yang valid',
    'common.week_range_invalid': 'Rentang minggu tidak valid',
    'common.please_enter_valid_quantity': 'Silakan masukkan kuantitas yang valid',

    // App
    'app.name': 'Ternakin',
    'app.tagline': 'Simple Livestock Management',
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

  const t = (key: string, params?: Record<string, string | number>): string => {
    let translation = translations[language][key as keyof typeof translations[typeof language]] || key;

    // Handle interpolation for dynamic values
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(new RegExp(`{${param}}`, 'g'), String(value));
      });
    }

    return translation;
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
