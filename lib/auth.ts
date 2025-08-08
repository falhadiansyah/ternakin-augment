import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

export const authHelpers = {
  // Sign in with Google OAuth
  async signInWithGoogle() {
    try {
      // Different redirect URI for different platforms
      let redirectTo: string;

      if (Platform.OS === 'web') {
        // For web browser, use the current origin
        redirectTo = `${window.location.origin}/auth/callback`;
      } else {
        // For mobile (iOS/Android), use the app scheme
        redirectTo = makeRedirectUri({
          scheme: 'ternakin',
          path: 'auth/callback',
        });
      }

      console.log('Redirect URI:', redirectTo);
      const redirectUri = makeRedirectUri({
        scheme: 'ternakin',
        path: 'auth/callback'
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google OAuth error:', error);
      }

      return { data, error };
    } catch (error: any) {
      console.error('Google OAuth exception:', error);
      return { data: null, error: error.message };
    }
  },

  // Sign in with email OTP
  async signInWithOTP(email: string) {
    try {
      let redirectTo: string;

      if (Platform.OS === 'web') {
        redirectTo = `${window.location.origin}/auth/callback`;
      } else {
        redirectTo = makeRedirectUri({
          scheme: 'ternakin',
          path: 'auth/callback',
        });
      }

      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      return { data, error };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Verify OTP
  async verifyOTP(email: string, token: string) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });

      return { data, error };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Sign in with email/password (for development)
  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  },

  // Sign up with email/password
  async signUpWithEmail(email: string, password: string, fullName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    return { data, error };
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current session
  async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Reset password
  async resetPassword(email: string) {
    let redirectTo: string;

    if (Platform.OS === 'web') {
      redirectTo = `${window.location.origin}/auth/reset-password`;
    } else {
      redirectTo = 'ternakin://auth/reset-password';
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    return { data, error };
  },

  // Update password
  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    return { data, error };
  },

  // Update user profile
  async updateUserProfile(updates: { full_name?: string; avatar_url?: string }) {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    });

    return { data, error };
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Auth context helpers
export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    authHelpers.getCurrentSession().then(({ session, error }) => {
      if (error) {
        setError(error.message);
      } else {
        setUser(session?.user || null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = authHelpers.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setUser(session?.user || null);
        setLoading(false);
        setError(null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    console.log('Starting Google OAuth...');
    const result = await authHelpers.signInWithGoogle();
    if (result.error) {
      console.error('Google OAuth failed:', result.error);
      setError(result.error.message);
    }
    setLoading(false);
    return result;
  };

  const signInWithOTP = async (email: string) => {
    setLoading(true);
    setError(null);
    const result = await authHelpers.signInWithOTP(email);
    if (result.error) {
      setError(result.error?.message ?? null);
    }
    setLoading(false);
    return result;
  };

  const verifyOTP = async (email: string, token: string) => {
    setLoading(true);
    setError(null);
    const result = await authHelpers.verifyOTP(email, token);
    if (result.error) {
      setError(result.error?.message ?? null);
    }
    setLoading(false);
    return result;
  };

  const signOut = async () => {
    setLoading(true);
    const result = await authHelpers.signOut();
    if (result.error) {
      setError(result.error?.message ?? null);
    }
    setLoading(false);
    return result;
  };

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signInWithOTP,
    verifyOTP,
    signOut,
    isAuthenticated: !!user,
  };
};
