# Supabase OAuth Setup Guide - Google Sign-In

## Overview
This guide will help you set up Google OAuth authentication for your Ternakin app using Supabase.

## Prerequisites
- Supabase project already created
- Google Cloud Console access
- Android app package name: `com.ternakin.app`

## Step 1: Google Cloud Console Setup

### 1.1 Create/Select Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Google+ API
   - Google Sign-In API
   - Google Identity Toolkit API

### 1.2 Create OAuth 2.0 Client ID
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Select "Android" as application type
4. Fill in the form:
   - Package name: `com.ternakin.app`
   - SHA-1 certificate fingerprint: (see step 1.3)

### 1.3 Generate SHA-1 Fingerprint

#### For Debug Build:
```bash
cd android
./gradlew signingReport
```

#### For Release Build:
```bash
keytool -list -v -keystore your-release-keystore.jks -alias your-key-alias
```

Copy the SHA-1 fingerprint and paste it into the Google Console.

### 1.4 Get OAuth Credentials
After creating the client ID, you'll get:
- Client ID (e.g., `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
- Client Secret

## Step 2: Supabase Configuration

### 2.1 Enable Google Provider
1. Go to your Supabase dashboard
2. Navigate to "Authentication" → "Providers"
3. Find "Google" and click "Enable"
4. Fill in the form:
   - Client ID: (from Google Console)
   - Client Secret: (from Google Console)
   - Redirect URL: `https://eggmfboszygzbitsjhso.supabase.co/auth/v1/callback`

### 2.2 Add Authorized Redirect URIs
In Google Console, add this redirect URI:
- `https://eggmfboszygzbitsjhso.supabase.co/auth/v1/callback`

## Step 3: Android App Configuration

### 3.1 Update google-services.json
Replace the placeholder values in `android/app/google-services.json`:

```json
{
  "project_info": {
    "project_number": "123456789",
    "project_id": "your-project-id",
    "storage_bucket": "your-project-id.appspot.com"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:123456789:android:abcdef123456",
        "android_client_info": {
          "package_name": "com.ternakin.app"
        }
      },
      "oauth_client": [
        {
          "client_id": "123456789-abcdefghijklmnop.apps.googleusercontent.com",
          "client_type": 3
        }
      ],
      "api_key": [
        {
          "current_key": "your-api-key-here"
        }
      ],
      "services": {
        "appinvite_service": {
          "other_platform_oauth_client": [
            {
              "client_id": "123456789-abcdefghijklmnop.apps.googleusercontent.com",
              "client_type": 3
            }
          ]
        }
      }
    }
  ],
  "configuration_version": "1"
}
```

### 3.2 Build Configuration
The following files have been updated:
- `android/build.gradle` - Added Google Services plugin
- `android/app/build.gradle` - Applied Google Services plugin
- `app.json` - Added deep linking configuration

## Step 4: Testing

### 4.1 Build and Test
1. Clean and rebuild your project:
```bash
npx expo prebuild --clean
npx expo run:android
```

### 4.2 Test Google Sign-In
1. Open the app
2. Go to login screen
3. Tap "Continue with Google"
4. Should open Google Sign-In dialog
5. After successful sign-in, should redirect to dashboard

## Troubleshooting

### Common Issues:

1. **"Continue with Google" button does nothing**
   - Check if Google Services plugin is properly applied
   - Verify google-services.json is in the correct location
   - Check console logs for errors

2. **OAuth redirect fails**
   - Verify redirect URI in Supabase matches Google Console
   - Check if deep linking is properly configured

3. **Build errors**
   - Clean project and rebuild
   - Verify all dependencies are properly added

### Debug Steps:
1. Check console logs for OAuth flow
2. Verify Supabase configuration
3. Test with different Google accounts
4. Check network requests in browser dev tools

## Security Notes

- Never commit real OAuth credentials to version control
- Use environment variables for sensitive data
- Regularly rotate OAuth client secrets
- Monitor OAuth usage in Google Console

## Support

If you encounter issues:
1. Check Supabase logs
2. Verify Google Console configuration
3. Test with minimal configuration first
4. Check Expo and React Native documentation
