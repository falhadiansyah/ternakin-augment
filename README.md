# Ternakin - Livestock Management App

A comprehensive livestock management application built with React Native, Expo, and Supabase.

## Features

- 🐄 Livestock batch management
- 📊 Financial tracking and reporting
- 🥗 Feeding plan management
- 📈 Dashboard with analytics
- 🔐 Secure authentication (Google OAuth + Email OTP)
- 🌙 Dark/Light theme support
- 🌍 Multi-language support (English/Indonesian)

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Google Cloud Console account
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

3. **Configure OAuth (Required for Google Sign-In)**
```bash
# Run the configuration test
chmod +x scripts/test-oauth.sh
./scripts/test-oauth.sh
```

4. **Follow the OAuth setup guide**
See [SUPABASE_OAUTH_SETUP.md](./SUPABASE_OAUTH_SETUP.md) for detailed instructions.

### Development

```bash
# Start development server
npx expo start

# Run on Android
npx expo run:android

# Run on iOS
npx expo run:ios

# Run on web
npx expo start --web
```

## OAuth Configuration

### Google Sign-In Setup

The app requires Google OAuth configuration to enable "Continue with Google" functionality. Follow these steps:

1. **Google Cloud Console Setup**
   - Create OAuth 2.0 Client ID for Android
   - Generate SHA-1 fingerprint
   - Configure package name: `com.ternakin.app`

2. **Supabase Configuration**
   - Enable Google provider
   - Add OAuth credentials
   - Configure redirect URIs

3. **Android App Configuration**
   - Update `google-services.json`
   - Verify build configuration
   - Test deep linking

### Quick OAuth Test

```bash
# Check OAuth configuration
./scripts/test-oauth.sh

# Clean and rebuild
npx expo prebuild --clean
npx expo run:android
```

## Project Structure

```
ternakin/
├── app/                    # App screens and navigation
├── components/            # Reusable UI components
├── lib/                   # API and utility functions
├── constants/             # Design system and constants
├── types/                 # TypeScript type definitions
├── utils/                 # Helper functions
├── android/               # Android-specific configuration
└── supabase/              # Database migrations
```

## Authentication Flow

1. **Google OAuth**: Uses Supabase OAuth with Google provider
2. **Email OTP**: Fallback authentication method
3. **Session Management**: Automatic token refresh and persistence
4. **Deep Linking**: Handles OAuth callbacks on mobile

## Database Schema

The app uses Supabase with the following main tables:
- `profiles` - User profiles
- `farms` - Farm information
- `batches` - Livestock batches
- `recipes` - Feed recipes
- `feeding_plan` - Feeding schedules
- `finance_cashbook` - Financial transactions

## Troubleshooting

### Common Issues

1. **"Continue with Google" button not working**
   - Check OAuth configuration
   - Verify Google Services setup
   - Review console logs

2. **Build errors**
   - Clean project and rebuild
   - Check dependency versions
   - Verify Android configuration

3. **OAuth redirect fails**
   - Check redirect URI configuration
   - Verify Supabase settings
   - Test with different accounts

### Debug Steps

1. Run configuration test: `./scripts/test-oauth.sh`
2. Check console logs for errors
3. Verify Supabase dashboard configuration
4. Test OAuth flow step by step

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For OAuth setup help, see [SUPABASE_OAUTH_SETUP.md](./SUPABASE_OAUTH_SETUP.md).

For general support:
- Check the troubleshooting section
- Review console logs
- Verify configuration files
- Test with minimal setup first
