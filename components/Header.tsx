import { Colors } from '@/constants/Colors';
import { Radii, Shadows, Spacing } from '@/constants/Design';
import { Typography } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BurgerMenu } from './BurgerMenu';
import { useLanguage } from './LanguageProvider';
import { useTheme } from './ThemeProvider';
import Modal from './ui/Modal';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export function Header({ title, showBackButton = false, onBackPress }: HeaderProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [showBurgerMenu, setShowBurgerMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const colors = Colors[isDark ? 'dark' : 'light'];
  const shadow = Shadows(isDark);

  return (
    <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }, shadow]}>
      <View style={styles.leftSection}>
        {showBackButton ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress || (() => router.back())}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.burgerButton}
            onPress={() => setShowBurgerMenu(true)}
          >
            <Ionicons name="menu" size={22} color={colors.text} />
          </TouchableOpacity>
        )}
        {title && (
          <Text style={[styles.title, { color: colors.text }]}>
            {title}
          </Text>
        )}
      </View>

      <View style={styles.rightSection}>
        {/* Notifications */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setShowNotifications(true)}
        >
          <Ionicons name="notifications-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Burger Menu */}
      <BurgerMenu
        visible={showBurgerMenu}
        onClose={() => setShowBurgerMenu(false)}
      />

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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    borderRadius: Radii.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: Spacing.sm,
    padding: 4,
  },
  burgerButton: {
    marginRight: Spacing.sm,
    padding: 4,
  },
  title: {
    fontSize: Typography.headline,
    fontWeight: Typography.weight.bold,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  modalContent: {
    padding: Spacing.md,
  },
  notificationText: {
    textAlign: 'center',
    fontSize: Typography.body,
    fontStyle: 'italic',
  },
});
