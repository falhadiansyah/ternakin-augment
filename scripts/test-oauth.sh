#!/bin/bash

echo "🔍 Ternakin OAuth Configuration Test"
echo "====================================="

# Check if required files exist
echo ""
echo "📁 Checking required files..."

if [ -f "android/app/google-services.json" ]; then
    echo "✅ google-services.json exists"
else
    echo "❌ google-services.json missing - please create this file"
fi

if [ -f "android/build.gradle" ]; then
    if grep -q "google-services" android/build.gradle; then
        echo "✅ Google Services plugin added to project build.gradle"
    else
        echo "❌ Google Services plugin missing from project build.gradle"
    fi
else
    echo "❌ android/build.gradle missing"
fi

if [ -f "android/app/build.gradle" ]; then
    if grep -q "google-services" android/app/build.gradle; then
        echo "✅ Google Services plugin applied to app build.gradle"
    else
        echo "❌ Google Services plugin missing from app build.gradle"
    fi
else
    echo "❌ android/app/build.gradle missing"
fi

# Check app.json configuration
echo ""
echo "📱 Checking app.json configuration..."

if [ -f "app.json" ]; then
    if grep -q '"scheme": "ternakin"' app.json; then
        echo "✅ App scheme configured as 'ternakin'"
    else
        echo "❌ App scheme not configured"
    fi
    
    if grep -q "intentFilters" app.json; then
        echo "✅ Deep linking intent filters configured"
    else
        echo "❌ Deep linking intent filters missing"
    fi
else
    echo "❌ app.json missing"
fi

# Check Supabase configuration
echo ""
echo "🔐 Checking Supabase configuration..."

if [ -f "lib/supabase.ts" ]; then
    if grep -q "eggmfboszygzbitsjhso.supabase.co" lib/supabase.ts; then
        echo "✅ Supabase URL configured"
    else
        echo "❌ Supabase URL not configured"
    fi
else
    echo "❌ lib/supabase.ts missing"
fi

# Check OAuth implementation
echo ""
echo "🔑 Checking OAuth implementation..."

if [ -f "lib/auth.ts" ]; then
    if grep -q "signInWithGoogle" lib/auth.ts; then
        echo "✅ Google OAuth function exists"
    else
        echo "❌ Google OAuth function missing"
    fi
else
    echo "❌ lib/auth.ts missing"
fi

if [ -f "app/auth/callback.tsx" ]; then
    echo "✅ OAuth callback handler exists"
else
    echo "❌ OAuth callback handler missing"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Configure Google Cloud Console OAuth credentials"
echo "2. Update google-services.json with real values"
echo "3. Enable Google provider in Supabase dashboard"
echo "4. Test with: npx expo run:android"
echo ""
echo "📚 See SUPABASE_OAUTH_SETUP.md for detailed instructions"
