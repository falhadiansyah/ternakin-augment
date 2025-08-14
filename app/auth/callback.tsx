import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import { Loading } from '@/components/ui';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';

export default function AuthCallbackScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Handling auth callback...');
        console.log('Callback params:', params);
        
        // Handle OAuth callback parameters
        if (Platform.OS !== 'web' && (params.access_token || params.refresh_token)) {
          console.log('OAuth tokens received, setting session...');
          
          // Set the session manually for mobile OAuth flow
          const { data, error } = await supabase.auth.setSession({
            access_token: params.access_token as string,
            refresh_token: params.refresh_token as string,
          });
          
          if (error) {
            console.error('Error setting session:', error);
            Alert.alert('Error', 'Failed to complete authentication');
            router.replace('/auth/login');
            return;
          }
          
          if (data.session) {
            console.log('Session established successfully');
            router.replace('/(tabs)/dashboard');
            return;
          }
        }
        
        // Fallback: Get the session from storage
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          Alert.alert('Error', 'Authentication failed');
          router.replace('/auth/login');
          return;
        }

        console.log('Session found:', !!session, session?.user?.email);

        if (session) {
          // Successfully authenticated
          console.log('Redirecting to dashboard...');
          router.replace('/(tabs)/dashboard');
        } else {
          // No session found, redirect to login
          console.log('No session found, redirecting to login...');
          router.replace('/auth/login');
        }
      } catch (error) {
        console.error('Auth callback exception:', error);
        Alert.alert('Error', 'Something went wrong during authentication');
        router.replace('/auth/login');
      }
    };

    // Handle the authentication callback
    handleAuthCallback();
  }, [params]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Loading message={t('common.loading')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
