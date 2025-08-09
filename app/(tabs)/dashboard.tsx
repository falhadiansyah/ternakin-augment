import { BarChart } from '@/components/charts';
import { Header } from '@/components/Header';
import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { Radii, Shadows, Spacing } from '@/constants/Design';
import { Typography } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const shadow = Shadows(isDark);

  // Dummy data
  const [range, setRange] = useState<'today' | 'month' | 'year'>('month');
  const metrics = {
    totalLivestock: { value: 450, delta: '+5%' },
    totalExpenses: { value: 25000, delta: '+2%' },
    totalIncome: { value: 35000, delta: '+8%' },
    netProfit: { value: 10000, delta: '+25%' },
  };

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      { data: [12, 14, 10, 16, 18, 20] }, // Income (k)
      { data: [9, 11, 8, 12, 13, 15] }, // Expenses (k)
    ],
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={t('nav.dashboard')} />
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: Spacing.xl }}>
        {/* Range filter (segmented) */}
        <View style={[styles.filtersRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          {(['today', 'month', 'year'] as const).map((r) => (
            <TouchableOpacity
              key={r}
              style={[
                styles.filterChip,
                {
                  backgroundColor: range === r ? colors.primary : colors.card,
                  borderColor: range === r ? colors.primary : colors.border,
                },
              ]}
              activeOpacity={0.8}
              onPress={() => setRange(r)}
            >
              <Text style={{ color: range === r ? 'white' : colors.text, fontWeight: Typography.weight.medium, fontSize: Typography.caption }}>
                {r === 'today' ? 'Today' : r === 'month' ? 'This Month' : 'This Year'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* KPI Grid */}
        <View style={styles.content}>
          <View style={styles.grid}>
            <StatCard
              title="Total Livestock"
              value={metrics.totalLivestock.value.toString()}
              delta={metrics.totalLivestock.delta}
              icon="paw-outline"
              colors={colors}
              shadow={shadow}
            />
            <StatCard
              title="Total Expenses"
              value={`$${(metrics.totalExpenses.value / 1000).toFixed(1)}k`}
              delta={metrics.totalExpenses.delta}
              icon="card-outline"
              colors={colors}
              shadow={shadow}
            />
            <StatCard
              title="Total Income"
              value={`$${(metrics.totalIncome.value / 1000).toFixed(1)}k`}
              delta={metrics.totalIncome.delta}
              icon="trending-up-outline"
              colors={colors}
              shadow={shadow}
            />
            <StatCard
              title="Net Profit"
              value={`$${(metrics.netProfit.value / 1000).toFixed(1)}k`}
              delta={metrics.netProfit.delta}
              icon="wallet-outline"
              colors={colors}
              shadow={shadow}
            />
          </View>

          {/* Income vs Expenses */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, shadow, { flexBasis: '100%' }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Income vs Expenses</Text>
            <View style={styles.legendRow}>
              <LegendDot color={colors.success} label="Income" textColor={colors.text} />
              <LegendDot color={colors.error} label="Expenses" textColor={colors.text} />
            </View>
            <BarChart data={chartData} height={220} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  title,
  value,
  delta,
  icon,
  colors,
  shadow,
}: {
  title: string;
  value: string;
  delta: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: typeof Colors.light;
  shadow: any;
}) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, shadow]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon} size={18} color={colors.icon} />
        <Text style={[styles.cardSubtitle, { color: colors.icon, marginLeft: Spacing.xs }]}>{title}</Text>
      </View>
      <View style={styles.statRow}>
        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
        <View style={styles.deltaRow}>
          <Ionicons name="arrow-up" size={14} color={colors.success} />
          <Text style={[styles.deltaText, { color: colors.success }]}>{delta}</Text>
        </View>
      </View>
    </View>
  );
}

function LegendDot({ color, label, textColor }: { color: string; label: string; textColor: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={{ color: textColor, fontSize: Typography.caption }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: { padding: Spacing.md },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    borderWidth: 1,
    borderRadius: Radii.pill,
    padding: 4,
    gap: Spacing.xs as any,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radii.pill,
    borderWidth: 1,
    flex: 1,
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm as any,
  },
  card: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    flexBasis: '48%',
  },
  cardTitle: { fontSize: Typography.title, fontWeight: Typography.weight.bold, marginBottom: Spacing.sm },
  cardSubtitle: { fontSize: Typography.caption },
  statHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs },
  statRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  statValue: { fontSize: Typography.display, fontWeight: Typography.weight.extrabold },
  deltaRow: { flexDirection: 'row', alignItems: 'center' },
  deltaText: { marginLeft: 4, fontWeight: Typography.weight.medium, fontSize: Typography.caption },
  legendRow: { flexDirection: 'row', gap: Spacing.md as any, marginBottom: Spacing.xs },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: Spacing.xs },
});
