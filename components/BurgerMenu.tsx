import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuthContext } from './AuthProvider';
import { useLanguage } from './LanguageProvider';
import { useTheme } from './ThemeProvider';

interface BurgerMenuProps {
  visible: boolean;
  onClose: () => void;
}

export function BurgerMenu({ visible, onClose }: BurgerMenuProps) {
  const { signOut } = useAuthContext();
  const { theme, setTheme, isDark } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const colors = Colors[isDark ? 'dark' : 'light'];

  const handleLogout = () => {
    onClose();
    signOut().then(() => {
      router.replace('/auth/login');
    });
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  const handleLanguageChange = (newLanguage: 'en' | 'id') => {
    setLanguage(newLanguage);
  };

  const menuItems = [
    {
      id: 'theme',
      title: t('settings.theme'),
      icon: isDark ? 'moon' : 'sunny',
      onPress: () => {},
      hasSubmenu: true,
      submenu: [
        {
          id: 'light',
          title: t('settings.light_mode'),
          icon: 'sunny',
          onPress: () => handleThemeChange('light'),
          selected: theme === 'light',
        },
        {
          id: 'dark',
          title: t('settings.dark_mode'),
          icon: 'moon',
          onPress: () => handleThemeChange('dark'),
          selected: theme === 'dark',
        },
        {
          id: 'system',
          title: t('settings.system'),
          icon: 'settings',
          onPress: () => handleThemeChange('system'),
          selected: theme === 'system',
        },
      ],
    },
    {
      id: 'language',
      title: t('settings.language'),
      icon: 'language',
      onPress: () => handleLanguageChange(language === 'en' ? 'id' : 'en'),
      subtitle: language === 'en' ? t('settings.english') : t('settings.indonesian'),
    },
    {
      id: 'profile',
      title: t('nav.profile'),
      icon: 'person',
      onPress: () => {
        onClose();
        router.push('/profile/index');
      },
    },
    {
      id: 'logout',
      title: t('auth.logout'),
      icon: 'log-out',
      onPress: handleLogout,
      danger: true,
    },
  ];

  const slideX = useRef(new Animated.Value(-300)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideX, { toValue: 0, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    } else {
      Animated.timing(slideX, { toValue: -300, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start();
    }
  }, [visible]);
  const [expandedItem, setExpandedItem] = React.useState<string | null>(null);

  const toggleSubmenu = (itemId: string) => {
    setExpandedItem(prev => (prev === itemId ? null : itemId));
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <Animated.View style={[styles.menuContainer, { backgroundColor: colors.background, transform: [{ translateX: slideX }] }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {t('app.name')}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.menuItems}>
            {menuItems.map((item) => (
              <View key={item.id}>
                <TouchableOpacity
                  style={[
                    styles.menuItem,
                    item.danger && { borderLeftColor: '#dc2626' }
                  ]}
                  onPress={() => {
                    if (item.hasSubmenu) {
                      toggleSubmenu(item.id);
                    } else {
                      item.onPress();
                    }
                  }}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={item.danger ? '#dc2626' : colors.text}
                    />
                    <View style={styles.menuItemText}>
                      <Text style={[
                        styles.menuItemTitle,
                        { color: item.danger ? '#dc2626' : colors.text }
                      ]}>
                        {item.title}
                      </Text>
                      {item.subtitle && (
                        <Text style={[styles.menuItemSubtitle, { color: colors.icon }]}>
                          {item.subtitle}
                        </Text>
                      )}
                    </View>
                  </View>
                  {item.hasSubmenu && (
                    <Ionicons
                      name={expandedItem === item.id ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={colors.icon}
                    />
                  )}
                </TouchableOpacity>

                {item.hasSubmenu && expandedItem === item.id && (
                  <View style={styles.submenu}>
                    {item.submenu?.map((subItem) => (
                      <TouchableOpacity
                        key={subItem.id}
                        style={[
                          styles.submenuItem,
                          subItem.selected && { backgroundColor: colors.primary + '20' }
                        ]}
                        onPress={subItem.onPress}
                      >
                        <Ionicons
                          name={subItem.icon as any}
                          size={16}
                          color={colors.text}
                        />
                        <Text style={[styles.submenuItemText, { color: colors.text }]}>
                          {subItem.title}
                        </Text>
                        {subItem.selected && (
                          <Ionicons name="checkmark" size={16} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    flex: 1,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '80%',
    height: '100%',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    transform: [{ translateX: -300 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  menuItems: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    marginLeft: 16,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuItemSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  submenu: {
    marginLeft: 36,
    marginBottom: 8,
  },
  submenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginBottom: 4,
  },
  submenuItemText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
});
