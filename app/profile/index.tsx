import { useAuthContext } from '@/components/AuthProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { user, signOut } = useAuthContext();

  const handleFarmDetails = () => {
    router.push('/profile/farm-details');
  };

  const handleSettings = () => {
    const { router } = require('expo-router');
    router.push('/profile/settings');
  };

  const handleLogout = async () => {
    Alert.alert(
      t('auth.logout'),
      t('profile.confirm_logout'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auth.logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await signOut();
              if (error) throw error;
              router.replace('/auth/login');
            } catch (error: any) {
              Alert.alert(t('common.error'), error?.message || 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{t('nav.profile')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Ionicons name="person" size={40} color="white" />
          </View>
          <Text style={[styles.name, { color: colors.text }]}>
            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
          </Text>
          <Text style={[styles.email, { color: colors.icon }]}>
            {user?.email || 'No email'}
          </Text>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={handleFarmDetails}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="home" size={20} color={colors.icon} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                Farm Details
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.icon} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={handleSettings}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="settings" size={20} color={colors.icon} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                Settings
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.icon} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="notifications" size={20} color={colors.icon} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                Notifications
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.icon} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle" size={20} color={colors.icon} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>
                Help & Support
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.icon} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: 'transparent' }]}
            onPress={handleLogout}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="log-out" size={20} color="#dc2626" />
              <Text style={[styles.menuItemText, { color: '#dc2626' }]}>
                {t('auth.logout')}
              </Text>
            </View>
          </TouchableOpacity>



        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  backButton: {
    padding: 4,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
  },
  menuSection: {
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuItemText: {
    fontSize: 16,
  },
});
