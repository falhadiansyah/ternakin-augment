# Supabase OAuth Setup Guide

## Google OAuth Configuration

### 1. Supabase Dashboard Setup

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers**
3. Enable **Google** provider
4. Add your Google OAuth credentials

### 2. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client IDs**
5. Configure OAuth consent screen
6. Create OAuth 2.0 Client ID

### 3. Redirect URIs Configuration

Add these redirect URIs to your Google OAuth client:

#### For Development (Local)
```
http://localhost:8081/auth/callback
http://localhost:19006/auth/callback
```

#### For Production (Web)
```
https://your-domain.com/auth/callback
```

#### For Mobile (iOS/Android)
```
com.ternakin.app://auth/callback
```

### 4. Supabase Environment Variables

Add these to your Supabase project:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 5. App Configuration

The app is already configured to handle different platforms:

- **Web**: Uses `window.location.origin/auth/callback`
- **Mobile**: Uses `ternakin://auth/callback`

### 6. Testing

1. **Web**: Test in browser at `http://localhost:19006`
2. **Android**: Test with Expo Go or build APK
3. **iOS**: Test with Expo Go or build IPA

### Troubleshooting

#### Common Issues:

1. **"Failed to launch" error in browser**
   - Check redirect URI configuration
   - Ensure HTTPS for production

2. **Button not working in Android**
   - Verify app scheme configuration
   - Check Expo Go compatibility

3. **OAuth not completing**
   - Verify Supabase configuration
   - Check network connectivity

### Security Notes

- Never commit OAuth secrets to version control
- Use environment variables for sensitive data
- Regularly rotate OAuth credentials
- Monitor OAuth usage in Google Cloud Console
