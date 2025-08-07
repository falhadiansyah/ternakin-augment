# Supabase Setup Guide for Ternakin

This guide will help you set up the Supabase backend for the Ternakin livestock management app.

## Step 1: Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in or create an account
2. Click "New Project"
3. Choose your organization
4. Fill in the project details:
   - **Name**: Ternakin
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the region closest to your users
5. Click "Create new project"
6. Wait for the project to be created (this may take a few minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (something like `https://xxxxx.supabase.co`)
   - **Project API Key** (anon public key)

## Step 3: Update Your App Configuration

1. Open `lib/supabase.ts` in your project
2. Replace the placeholder values:
   ```typescript
   const supabaseUrl = 'YOUR_SUPABASE_URL'; // Replace with your Project URL
   const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your API Key
   ```

## Step 4: Set Up the Database Schema

1. In your Supabase dashboard, go to the **SQL Editor**
2. Copy the contents of `lib/database-schema.sql`
3. Paste it into the SQL Editor and click "Run"
4. This will create all the necessary tables, indexes, and triggers

## Step 5: Apply Row Level Security Policies

1. Still in the SQL Editor, create a new query
2. Copy the contents of `lib/rls-policies.sql`
3. Paste it into the SQL Editor and click "Run"
4. This will set up security policies to ensure users can only access their own data

## Step 6: Configure Authentication

1. Go to **Authentication** > **Settings** in your Supabase dashboard
2. Configure the following settings:
   - **Site URL**: `exp://localhost:19000` (for development)
   - **Redirect URLs**: Add `exp://localhost:19000/auth/callback`

### Google OAuth Setup (Optional but Recommended)

1. Go to **Authentication** > **Providers**
2. Enable **Google** provider
3. You'll need to set up a Google OAuth app:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add your Supabase callback URL: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
4. Copy the Client ID and Client Secret to Supabase
5. Update `lib/auth.ts` with your Google Client ID

## Step 7: Test the Connection

1. Start your Expo development server:
   ```bash
   npm start
   ```
2. The app should now be able to connect to your Supabase backend

## Database Tables Overview

The schema creates the following main tables:

- **profiles**: User profile information
- **farms**: Farm details owned by users
- **livestock_batches**: Groups of animals with tracking info
- **feed_types**: Types of feed (including custom mixes)
- **feed_ingredients**: Available feed ingredients
- **feed_recipes**: Recipes for custom feed mixes
- **feeding_schedules**: Daily feed/water requirements per batch
- **financial_transactions**: Income and expense tracking
- **livestock_activities**: Activity log (purchases, sales, mortality, etc.)

## Security Features

- **Row Level Security (RLS)**: Ensures users can only access their own data
- **Automatic Profile Creation**: Profiles are created automatically when users sign up
- **Data Validation**: Database constraints ensure data integrity
- **Audit Trail**: All tables have created_at and updated_at timestamps

## Next Steps

After completing this setup:

1. Test user registration and login
2. Create a test farm
3. Add some livestock batches
4. Test the various app features

## Troubleshooting

### Common Issues:

1. **Connection Error**: Double-check your URL and API key in `lib/supabase.ts`
2. **RLS Policy Error**: Make sure all RLS policies were applied correctly
3. **Authentication Issues**: Verify your redirect URLs are configured properly

### Useful SQL Queries for Testing:

```sql
-- Check if tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- View sample data
SELECT * FROM profiles LIMIT 5;
SELECT * FROM farms LIMIT 5;
```

## Environment Variables (Optional)

For production, consider using environment variables:

1. Create a `.env` file (add to .gitignore)
2. Add your credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
3. Update `lib/supabase.ts` to use environment variables:
   ```typescript
   const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
   const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
   ```

## Support

If you encounter any issues:
1. Check the Supabase documentation: [docs.supabase.com](https://docs.supabase.com)
2. Review the SQL logs in your Supabase dashboard
3. Check the browser console for any error messages
