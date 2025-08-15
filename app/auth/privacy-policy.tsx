import { Header } from '@/components/Header';
import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { Spacing, Typography } from '@/constants/Design';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyPolicyScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const colors = Colors[isDark ? 'dark' : 'light'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>      
      <Header title={t('privacy.title')} showBackButton onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: Spacing.md }}>
        <Text style={[styles.h1, { color: colors.text }]}>{t('privacy.title')}</Text>
        <Text style={[styles.p, { color: colors.icon }]}>{t('privacy.updated')}</Text>

        <Text style={[styles.h2, { color: colors.text }]}>{t('privacy.sections.collection.title')}</Text>
        <Text style={[styles.p, { color: colors.text }]}>{t('privacy.sections.collection.content')}</Text>

        <Text style={[styles.h2, { color: colors.text }]}>{t('privacy.sections.usage.title')}</Text>
        <Text style={[styles.p, { color: colors.text }]}>{t('privacy.sections.usage.content')}</Text>

        <Text style={[styles.h2, { color: colors.text }]}>{t('privacy.sections.storage.title')}</Text>
        <Text style={[styles.p, { color: colors.text }]}>{t('privacy.sections.storage.content')}</Text>

        <Text style={[styles.h2, { color: colors.text }]}>{t('privacy.sections.rights.title')}</Text>
        <Text style={[styles.p, { color: colors.text }]}>{t('privacy.sections.rights.content')}</Text>

        <Text style={[styles.h2, { color: colors.text }]}>{t('privacy.sections.contact.title')}</Text>
        <Text style={[styles.p, { color: colors.text }]}>{t('privacy.sections.contact.content')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  h1: { fontSize: Typography.title, fontWeight: Typography.weight.bold, marginBottom: Spacing.sm },
  h2: { fontSize: Typography.body, fontWeight: Typography.weight.bold, marginTop: Spacing.md, marginBottom: Spacing.xs },
  p: { fontSize: Typography.body, lineHeight: 20, marginBottom: Spacing.xs },
});

