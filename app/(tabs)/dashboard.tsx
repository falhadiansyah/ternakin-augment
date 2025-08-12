import { LineChart } from '@/components/charts';
import { Header } from '@/components/Header';
import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { Radii, Shadows, Spacing } from '@/constants/Design';
import { Typography } from '@/constants/Typography';
import { getBalance, listBatches, listTransactions } from '@/lib/data';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const shadow = Shadows(isDark);

  const [range, setRange] = useState<'today' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    totalLivestock: { value: 0, delta: '0%' },
    totalExpenses: { value: 0, delta: '0%' },
    totalIncome: { value: 0, delta: '0%' },
    netProfit: { value: 0, delta: '0%' },
  });
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [
      { 
        data: [] as number[], 
        color: (opacity: number) => `rgba(34, 197, 94, ${opacity})`, // Green for income
        strokeWidth: 2
      },
      { 
        data: [] as number[], 
        color: (opacity: number) => `rgba(239, 68, 68, ${opacity})`, // Red for expenses
        strokeWidth: 2
      },
    ],
  });

  const loadData = useCallback(async () => {
    try {
      const [{ data: batches }, { data: balance }, { data: transactions }] = await Promise.all([
        listBatches(),
        getBalance(),
        listTransactions(100), // Get more transactions for better calculations
      ]);

      if (batches && balance && transactions) {
        // Calculate total livestock
        const totalLivestock = batches.reduce((sum, batch) => sum + (batch.current_count || 0), 0);

        // Filter transactions by date range
        const now = new Date();
        const filteredTransactions = transactions.filter(tx => {
          if (!tx.transaction_date) return false;
          const txDate = new Date(tx.transaction_date);
          
          switch (range) {
            case 'today':
              return txDate.toDateString() === now.toDateString();
            case 'month':
              return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
            case 'year':
              return txDate.getFullYear() === now.getFullYear();
            default:
              return true;
          }
        });

        // Calculate financial metrics (debit = income, credit = expense)
        const totalIncome = filteredTransactions.reduce((sum, tx) => sum + (tx.debit || 0), 0);
        const totalExpenses = filteredTransactions.reduce((sum, tx) => sum + (tx.credit || 0), 0);
        const netProfit = totalIncome - totalExpenses;

        // Generate chart data - group by week for month view, by month for year view
        const chartLabels: string[] = [];
        const incomeData: number[] = [];
        const expenseData: number[] = [];

        if (range === 'month') {
          // Group by week
          const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
          weeks.forEach((week, index) => {
            chartLabels.push(week);
            const weekStart = new Date(now.getFullYear(), now.getMonth(), index * 7);
            const weekEnd = new Date(now.getFullYear(), now.getMonth(), (index + 1) * 7);
            
            const weekIncome = filteredTransactions
              .filter(tx => {
                if (!tx.transaction_date) return false;
                const txDate = new Date(tx.transaction_date);
                return txDate >= weekStart && txDate < weekEnd;
              })
              .reduce((sum, tx) => sum + (tx.debit || 0), 0);
            
            const weekExpense = filteredTransactions
              .filter(tx => {
                if (!tx.transaction_date) return false;
                const txDate = new Date(tx.transaction_date);
                return txDate >= weekStart && txDate < weekEnd;
              })
              .reduce((sum, tx) => sum + (tx.credit || 0), 0);
            
            incomeData.push(weekIncome);
            expenseData.push(weekExpense);
          });
        } else if (range === 'year') {
          // Group by month
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          months.forEach((month, index) => {
            chartLabels.push(month);
            const monthIncome = filteredTransactions
              .filter(tx => {
                if (!tx.transaction_date) return false;
                const txDate = new Date(tx.transaction_date);
                return txDate.getMonth() === index && txDate.getFullYear() === now.getFullYear();
              })
              .reduce((sum, tx) => sum + (tx.debit || 0), 0);
            
            const monthExpense = filteredTransactions
              .filter(tx => {
                if (!tx.transaction_date) return false;
                const txDate = new Date(tx.transaction_date);
                return txDate.getMonth() === index && txDate.getFullYear() === now.getFullYear();
              })
              .reduce((sum, tx) => sum + (tx.credit || 0), 0);
            
            incomeData.push(monthIncome);
            expenseData.push(monthExpense);
          });
        } else {
          // Today - show hourly data or just today's total
          chartLabels.push('Today');
          incomeData.push(totalIncome);
          expenseData.push(totalExpenses);
        }

        setChartData({
          labels: chartLabels,
          datasets: [
            { 
              data: incomeData, 
              color: (opacity: number) => `rgba(34, 197, 94, ${opacity})`,
              strokeWidth: 2
            },
            { 
              data: expenseData, 
              color: (opacity: number) => `rgba(239, 68, 68, ${opacity})`,
              strokeWidth: 2
            },
          ],
        });

        setMetrics({
          totalLivestock: { value: totalLivestock, delta: '+0%' }, // TODO: Calculate delta
          totalExpenses: { value: totalExpenses, delta: '+0%' },
          totalIncome: { value: totalIncome, delta: '+0%' },
          netProfit: { value: netProfit, delta: netProfit >= 0 ? '+0%' : '-0%' },
        });
      }
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={t('nav.dashboard')} />
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={{ paddingBottom: Spacing.xl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
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
          {loading && (
            <View style={{ padding: Spacing.md, alignItems: 'center' }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          )}
          {error && (
            <Text style={{ color: colors.error, marginBottom: Spacing.sm, textAlign: 'center' }}>
              Failed to load: {error}
            </Text>
          )}
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
            <LineChart data={chartData} height={220} showLegend={false} />
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
