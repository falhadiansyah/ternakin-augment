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

**IMPORTANT**: Add these redirect URIs to your Google OAuth client:

#### For Development (Local)
```
http://localhost:8081/auth/callback
http://localhost:8082/auth/callback
http://localhost:19006/auth/callback
```

#### For Production (Web)
```
https://your-domain.com/auth/callback
```

#### For Mobile (iOS/Android)
```
com.ternakin.app://auth/callback
ternakin://auth/callback
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
   - **Cause**: Wrong redirect URI configuration
   - **Solution**: 
     - Check that `http://localhost:19006/auth/callback` is added to Google OAuth
     - Ensure Supabase redirect URI matches exactly
     - Clear browser cache and cookies

2. **Button not working in Android**
   - **Cause**: Expo Go limitations with custom schemes
   - **Solution**: 
     - Use development build instead of Expo Go
     - Or test on web browser first
     - Check console logs for errors

3. **OAuth not completing**
   - **Cause**: Network or configuration issues
   - **Solution**: 
     - Check Supabase configuration
     - Verify Google OAuth setup
     - Check network connectivity
     - Review console logs

4. **"Scheme does not have a registered handler"**
   - **Cause**: App scheme not properly configured
   - **Solution**:
     - Ensure `scheme: "ternakin"` in app.json
     - Add proper bundle identifier
     - Test with development build

### Debugging Steps

1. **Check Console Logs**
   - Open browser developer tools
   - Look for OAuth-related errors
   - Check network requests

2. **Verify Redirect URIs**
   - Ensure exact match in Google Console
   - Check Supabase configuration
   - Test with different ports

3. **Test OAuth Flow**
   - Start with web browser
   - Check if redirect works
   - Verify session creation

### Security Notes

- Never commit OAuth secrets to version control
- Use environment variables for sensitive data
- Regularly rotate OAuth credentials
- Monitor OAuth usage in Google Cloud Console

### Development vs Production

#### Development
- Use localhost URLs
- Test with Expo Go (limited)
- Use development build for full testing

#### Production
- Use HTTPS URLs
- Configure proper domain
- Test with production build
