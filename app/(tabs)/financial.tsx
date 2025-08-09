import { Header } from '@/components/Header';
import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { Radii, Shadows, Spacing } from '@/constants/Design';
import { Typography } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FinancialScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const shadow = Shadows(isDark);

  const overview = {
    totalIncome: 3700,
    totalExpenses: 1250,
  };

  const transactions = [
    { title: 'Livestock Sales', amount: 2500, sign: '+', subtitle: 'Sold 25 broiler chickens', date: '2024-05-15' },
    { title: 'Feed Purchase', amount: 450, sign: '-', subtitle: 'Bought 100kg broiler feed', date: '2024-05-12' },
    { title: 'Milk Sales', amount: 1200, sign: '+', subtitle: 'Weekly milk collection', date: '2024-05-10' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={t('nav.financial')} />
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: Spacing.xl }}>
        <View style={styles.content}>
          {/* Overview cards */}
          <View style={[styles.overviewCard, { backgroundColor: colors.card, borderColor: colors.border }, shadow]}>
            <Text style={[styles.overviewLabel, { color: colors.icon }]}>Total Income</Text>
            <Text style={[styles.overviewValue, { color: colors.success }]}>${overview.totalIncome.toLocaleString()}</Text>
          </View>
          <View style={[styles.overviewCard, { backgroundColor: colors.card, borderColor: colors.border }, shadow]}>
            <Text style={[styles.overviewLabel, { color: colors.icon }]}>Total Expenses</Text>
            <Text style={[styles.overviewValue, { color: colors.error }]}>${overview.totalExpenses.toLocaleString()}</Text>
          </View>

          {/* Transactions */}
          <View style={styles.transHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
            <TouchableOpacity activeOpacity={0.8} style={[styles.addBtn, { backgroundColor: colors.primary }, shadow]}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.addBtnText}>Add Transaction</Text>
            </TouchableOpacity>
          </View>

          {transactions.map((tx) => (
            <View key={tx.title+tx.date} style={[styles.txItem, { backgroundColor: colors.card, borderColor: colors.border }, shadow]}>
              <View style={styles.txLeft}>
                <Ionicons name="receipt-outline" size={20} color={colors.icon} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={[styles.txTitle, { color: colors.text }]}>{tx.title}</Text>
                  <Text style={[styles.txSubtitle, { color: colors.icon }]}>{`${tx.subtitle} ${tx.date}`}</Text>
                </View>
              </View>
              <View style={styles.txRight}>
                <Text style={{ color: tx.sign === '+' ? colors.success : colors.error, fontWeight: Typography.weight.bold }}>
                  {tx.sign}${tx.amount.toLocaleString()}
                </Text>
                <Ionicons name="ellipsis-vertical" size={16} color={colors.icon} />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: { padding: Spacing.md },
  overviewCard: { borderWidth: 1, borderRadius: Radii.md, padding: Spacing.md, marginBottom: Spacing.sm },
  overviewLabel: { fontSize: Typography.caption },
  overviewValue: { fontSize: Typography.headline, fontWeight: Typography.weight.extrabold, marginTop: 4 },
  sectionTitle: { fontSize: Typography.title, fontWeight: Typography.weight.bold },
  transHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.xs, marginBottom: Spacing.xs },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs as any, paddingVertical: Spacing.xs, paddingHorizontal: Spacing.sm, borderRadius: Radii.sm },
  addBtnText: { color: '#fff', fontWeight: Typography.weight.bold },
  txItem: { borderWidth: 1, borderRadius: Radii.md, padding: Spacing.sm, marginBottom: Spacing.xs, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  txLeft: { flexDirection: 'row', alignItems: 'center' },
  txTitle: { fontSize: Typography.body, fontWeight: Typography.weight.bold },
  txSubtitle: { fontSize: Typography.caption, marginTop: 2 },
  txRight: { alignItems: 'flex-end', gap: Spacing.xs as any },
});
