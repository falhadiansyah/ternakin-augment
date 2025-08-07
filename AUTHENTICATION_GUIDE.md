# Panduan Authentication Ternakin

Aplikasi Ternakin telah dilengkapi dengan sistem authentication yang lengkap menggunakan Supabase. Sistem ini mendukung login dengan email OTP dan Google OAuth.

## 🔐 Fitur Authentication

### 1. **Email OTP Login**
- User memasukkan email
- Sistem mengirim kode OTP 6 digit ke email
- User memasukkan kode OTP untuk verifikasi
- Otomatis login setelah verifikasi berhasil

### 2. **Google OAuth Login**
- Login dengan akun Google
- Proses authentication yang aman melalui Supabase
- Otomatis membuat profil user

### 3. **Session Management**
- Session tersimpan secara otomatis
- Auto-refresh token
- Logout dengan konfirmasi

### 4. **Route Protection**
- Hanya user yang sudah login yang bisa mengakses halaman utama
- Redirect otomatis ke login jika belum authenticated
- AuthGuard melindungi semua tab navigation

## 📱 Cara Menggunakan

### Untuk User:

1. **Buka aplikasi** - Akan otomatis redirect ke halaman login jika belum login
2. **Pilih metode login:**
   - **Email OTP**: Masukkan email → Cek email untuk kode OTP → Masukkan kode
   - **Google**: Klik tombol Google → Login dengan akun Google
3. **Setelah login** - Otomatis masuk ke dashboard
4. **Logout** - Klik profile di dashboard → Logout

### Untuk Developer:

## 🛠️ Setup Authentication

### 1. Konfigurasi Supabase

Ikuti panduan di `SUPABASE_SETUP.md` untuk:
- Membuat project Supabase
- Setup database schema
- Konfigurasi authentication providers

### 2. Environment Variables

Buat file `.env` berdasarkan `.env.example`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### 3. Konfigurasi Google OAuth (Opsional)

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih yang sudah ada
3. Enable Google+ API
4. Buat OAuth 2.0 credentials
5. Tambahkan authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `ternakin://auth/callback` (untuk mobile)
6. Copy Client ID ke environment variables

## 🏗️ Arsitektur Authentication

### Komponen Utama:

1. **AuthProvider** (`components/AuthProvider.tsx`)
   - Context provider untuk state authentication
   - Mengelola user session dan loading state

2. **AuthGuard** (`components/AuthGuard.tsx`)
   - Melindungi route yang memerlukan authentication
   - Redirect ke login jika belum authenticated

3. **Login Screen** (`app/auth/login.tsx`)
   - UI untuk email OTP dan Google login
   - Form validation dan error handling

4. **Auth Helpers** (`lib/auth.ts`)
   - Fungsi-fungsi authentication (login, logout, verify OTP)
   - Session management

### Flow Authentication:

```
App Start → AuthProvider → Check Session
    ↓
Not Authenticated → Redirect to Login
    ↓
Login Success → Update Context → Access Protected Routes
```

## 🔧 Penggunaan dalam Kode

### Menggunakan Auth Context:

```tsx
import { useAuthContext } from '@/components/AuthProvider';

function MyComponent() {
  const { user, isAuthenticated, signOut } = useAuthContext();
  
  if (!isAuthenticated) {
    return <Text>Please login</Text>;
  }
  
  return (
    <View>
      <Text>Welcome, {user.email}</Text>
      <Button title="Logout" onPress={signOut} />
    </View>
  );
}
```

### Melindungi Route:

```tsx
import AuthGuard from '@/components/AuthGuard';

function ProtectedScreen() {
  return (
    <AuthGuard>
      <YourProtectedContent />
    </AuthGuard>
  );
}
```

## 🔒 Keamanan

### Row Level Security (RLS)
- Semua data user terisolasi berdasarkan user ID
- Policy Supabase memastikan user hanya bisa akses data mereka sendiri

### Session Security
- Token disimpan secara aman di AsyncStorage (mobile) atau localStorage (web)
- Auto-refresh token untuk menjaga session tetap aktif
- Logout menghapus semua session data

### Validation
- Email validation di client-side
- OTP validation (6 digit numeric)
- Error handling untuk semua authentication flow

## 🐛 Troubleshooting

### Masalah Umum:

1. **"Invalid OTP"**
   - Pastikan kode OTP benar (6 digit)
   - Cek email spam/junk
   - Coba kirim ulang OTP

2. **Google Login Tidak Berfungsi**
   - Pastikan Google Client ID sudah dikonfigurasi
   - Cek redirect URI di Google Console
   - Pastikan Google provider enabled di Supabase

3. **Session Tidak Tersimpan**
   - Cek konfigurasi AsyncStorage
   - Pastikan Supabase URL dan key benar

4. **Redirect Loop**
   - Cek AuthGuard implementation
   - Pastikan route protection tidak konflik

### Debug Mode:

Untuk debugging, tambahkan log di `lib/auth.ts`:

```tsx
console.log('Auth state:', { user, loading, error });
```

## 📚 Referensi

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Expo AuthSession](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [React Navigation Authentication](https://reactnavigation.org/docs/auth-flow/)

## 🚀 Next Steps

Setelah authentication setup:
1. Test login/logout flow
2. Implementasikan fitur livestock management
3. Tambahkan profile management
4. Setup push notifications
