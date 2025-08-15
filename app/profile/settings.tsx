import { Header } from '@/components/Header';
import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { Radii, Spacing } from '@/constants/Design';
import { Typography } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const colors = Colors[isDark ? 'dark' : 'light'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={t('settings.title')} showBackButton onBackPress={() => router.back()} />
      <View style={{ padding: Spacing.md }}>
        <TouchableOpacity
          style={[styles.item, { borderColor: colors.border, backgroundColor: colors.card }]}
          onPress={() => router.push('/profile/currency')}
        >
          <View style={styles.left}>
            <Ionicons name="cash-outline" size={20} color={colors.icon} />
            <Text style={[styles.text, { color: colors.text }]}>{t('settings.currency')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.icon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: Radii.md, padding: Spacing.sm },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  text: { fontSize: Typography.body, fontWeight: Typography.weight.medium },
});

