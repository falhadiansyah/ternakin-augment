import { Header } from '@/components/Header';
import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { Spacing, Typography } from '@/constants/Design';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TermsOfServiceScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const colors = Colors[isDark ? 'dark' : 'light'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>      
      <Header title={t('tos.title')} showBackButton onBackPress={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: Spacing.md }}>
        <Text style={[styles.h1, { color: colors.text }]}>{t('tos.title')}</Text>
        <Text style={[styles.p, { color: colors.icon }]}>{t('tos.updated')}</Text>

        <Text style={[styles.h2, { color: colors.text }]}>{t('tos.sections.use.title')}</Text>
        <Text style={[styles.p, { color: colors.text }]}>{t('tos.sections.use.content')}</Text>

        <Text style={[styles.h2, { color: colors.text }]}>{t('tos.sections.account.title')}</Text>
        <Text style={[styles.p, { color: colors.text }]}>{t('tos.sections.account.content')}</Text>

        <Text style={[styles.h2, { color: colors.text }]}>{t('tos.sections.content.title')}</Text>
        <Text style={[styles.p, { color: colors.text }]}>{t('tos.sections.content.content')}</Text>

        <Text style={[styles.h2, { color: colors.text }]}>{t('tos.sections.liability.title')}</Text>
        <Text style={[styles.p, { color: colors.text }]}>{t('tos.sections.liability.content')}</Text>

        <Text style={[styles.h2, { color: colors.text }]}>{t('tos.sections.termination.title')}</Text>
        <Text style={[styles.p, { color: colors.text }]}>{t('tos.sections.termination.content')}</Text>

        <Text style={[styles.h2, { color: colors.text }]}>{t('tos.sections.changes.title')}</Text>
        <Text style={[styles.p, { color: colors.text }]}>{t('tos.sections.changes.content')}</Text>

        <Text style={[styles.h2, { color: colors.text }]}>{t('tos.sections.contact.title')}</Text>
        <Text style={[styles.p, { color: colors.text }]}>{t('tos.sections.contact.content')}</Text>
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

