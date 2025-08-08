# Ternakin - Livestock Management App 🐄

A modern livestock management application built with React Native, Expo, and Supabase.

## Features ✨

### Authentication
- **Email OTP Login**: Secure login with email verification
- **Google OAuth**: Sign in with Google account
- **Multi-platform Support**: Works on Web, iOS, and Android

### User Interface
- **Dark/Light Theme**: Toggle between dark and light modes
- **Multi-language Support**: English and Indonesian
- **Responsive Design**: Optimized for all screen sizes

### Navigation
- **Tab-based Navigation**: Easy access to all features
- **Header with Actions**: Logout, theme toggle, language switch, and notifications
- **Profile Management**: User profile and farm details

### Core Features
- **Dashboard**: Overview of livestock metrics
- **Livestock Management**: Track your animals
- **Feeding Schedule**: Manage feeding routines
- **Financial Tracking**: Monitor income and expenses

## Getting Started 🚀

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ternakin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Supabase**
   - Create a new Supabase project
   - Copy your project URL and anon key
   - Update `lib/supabase.ts` with your credentials

4. **Setup OAuth (Optional)**
   - Follow the guide in `SUPABASE_OAUTH_SETUP.md`
   - Configure Google OAuth for enhanced login experience

5. **Start the development server**
   ```bash
   npx expo start
   ```

## Development 🛠️

### Project Structure
```
ternakin/
├── app/                    # App screens and navigation
├── components/             # Reusable components
│   ├── ui/                # UI components
│   ├── AuthProvider.tsx   # Authentication context
│   ├── ThemeProvider.tsx  # Theme management
│   └── LanguageProvider.tsx # Internationalization
├── lib/                   # Utilities and configurations
├── constants/             # App constants
└── types/                 # TypeScript type definitions
```

### Key Components

#### Authentication
- `AuthProvider`: Manages user authentication state
- `AuthGuard`: Protects routes from unauthorized access
- `useAuthContext`: Hook for authentication functions

#### Theme Management
- `ThemeProvider`: Manages dark/light theme
- `useTheme`: Hook for theme state and functions
- Supports system, light, and dark modes

#### Internationalization
- `LanguageProvider`: Manages app language
- `useLanguage`: Hook for translation functions
- Supports English and Indonesian

#### UI Components
- `Header`: Main navigation header with actions
- `Button`, `Input`, `Modal`: Reusable UI components
- Responsive and theme-aware design

### Available Scripts

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web

# Build for production
npm run build
```

## Configuration ⚙️

### Environment Variables
Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Setup
1. Create tables as defined in `lib/database-schema.sql`
2. Apply RLS policies from `lib/rls-policies.sql`
3. Configure authentication providers in Supabase dashboard

## Features in Detail 📋

### Authentication System
- **Email OTP**: Secure one-time password via email
- **Google OAuth**: Social login with Google
- **Session Management**: Automatic session handling
- **Logout**: Secure logout with confirmation

### Theme System
- **Dark Mode**: Eye-friendly dark theme
- **Light Mode**: Clean light theme
- **System Mode**: Follows device settings
- **Persistent**: Remembers user preference

### Language System
- **English**: Default language
- **Indonesian**: Localized content
- **Easy Toggle**: Quick language switch
- **Persistent**: Remembers user preference

### Navigation Features
- **Header Actions**: 
  - Theme toggle (sun/moon icon)
  - Language switch (EN/ID)
  - Notifications (bell icon)
  - Logout (logout icon)
- **Tab Navigation**: Dashboard, Livestock, Feeding, Financial
- **Profile Access**: Quick access to user profile

## Troubleshooting 🔧

### Common Issues

1. **Google OAuth not working**
   - Check `SUPABASE_OAUTH_SETUP.md`
   - Verify redirect URIs configuration
   - Ensure proper Supabase setup

2. **Theme not persisting**
   - Check AsyncStorage permissions
   - Verify ThemeProvider implementation

3. **Language not changing**
   - Check LanguageProvider setup
   - Verify translation keys

4. **Build errors**
   - Clear cache: `npx expo start --clear`
   - Reinstall dependencies: `npm install`

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License 📄

This project is licensed under the MIT License.

## Support 💬

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review troubleshooting guide
