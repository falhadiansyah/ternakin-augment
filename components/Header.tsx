import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuthContext } from './AuthProvider';
import { useLanguage } from './LanguageProvider';
import { useTheme } from './ThemeProvider';
import Modal from './ui/Modal';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export function Header({ title, showBackButton = false, onBackPress }: HeaderProps) {
  const { signOut } = useAuthContext();
  const { theme, setTheme, isDark } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const colors = Colors[isDark ? 'dark' : 'light'];

  const handleLogout = () => {
    Alert.alert(
      t('auth.logout'),
      'Are you sure you want to logout?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auth.logout'),
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  const handleLanguageChange = (newLanguage: 'en' | 'id') => {
    setLanguage(newLanguage);
  };

  return (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress || (() => router.back())}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
        {title && (
          <Text style={[styles.title, { color: colors.text }]}>
            {title}
          </Text>
        )}
      </View>

      <View style={styles.rightSection}>
        {/* Theme Toggle */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setShowSettings(true)}
        >
          <Ionicons 
            name={isDark ? 'moon' : 'sunny'} 
            size={24} 
            color={colors.text} 
          />
        </TouchableOpacity>

        {/* Language Toggle */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleLanguageChange(language === 'en' ? 'id' : 'en')}
        >
          <Text style={[styles.languageText, { color: colors.text }]}>
            {language.toUpperCase()}
          </Text>
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setShowNotifications(true)}
        >
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        title={t('settings.theme')}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={[
              styles.option,
              theme === 'light' && { backgroundColor: colors.primary + '20' }
            ]}
            onPress={() => handleThemeChange('light')}
          >
            <Ionicons name="sunny" size={20} color={colors.text} />
            <Text style={[styles.optionText, { color: colors.text }]}>
              {t('settings.light_mode')}
            </Text>
            {theme === 'light' && (
              <Ionicons name="checkmark" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.option,
              theme === 'dark' && { backgroundColor: colors.primary + '20' }
            ]}
            onPress={() => handleThemeChange('dark')}
          >
            <Ionicons name="moon" size={20} color={colors.text} />
            <Text style={[styles.optionText, { color: colors.text }]}>
              {t('settings.dark_mode')}
            </Text>
            {theme === 'dark' && (
              <Ionicons name="checkmark" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.option,
              theme === 'system' && { backgroundColor: colors.primary + '20' }
            ]}
            onPress={() => handleThemeChange('system')}
          >
            <Ionicons name="settings" size={20} color={colors.text} />
            <Text style={[styles.optionText, { color: colors.text }]}>
              {t('settings.system')}
            </Text>
            {theme === 'system' && (
              <Ionicons name="checkmark" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        title={t('settings.notifications')}
      >
        <View style={styles.modalContent}>
          <Text style={[styles.notificationText, { color: colors.text }]}>
            No notifications yet
          </Text>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  languageText: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 4,
  },
  modalContent: {
    padding: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  optionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  notificationText: {
    textAlign: 'center',
    fontSize: 16,
    fontStyle: 'italic',
  },
});
