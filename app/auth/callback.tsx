import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import { Loading } from '@/components/ui';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

export default function AuthCallbackScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const colors = Colors[isDark ? 'dark' : 'light'];

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Handling auth callback...');
        
        // Get the session from the URL or storage
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
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
        router.replace('/auth/login');
      }
    };

    // Handle the authentication callback
    handleAuthCallback();
  }, []);

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
