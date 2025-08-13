import { LineChart } from '@/components/charts';
import { Header } from '@/components/Header';
import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { Radii, Shadows, Spacing } from '@/constants/Design';
import { Typography } from '@/constants/Typography';
import { getBalance, listBatches, listTransactions } from '@/lib/data';
import { formatIDR } from '@/utils/currency';
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

  const calculateDelta = (current: number, previous: number): string => {
    if (previous === 0) {
      return current > 0 ? '+100%' : '0%';
    }
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  const getDateRange = (period: 'today' | 'month' | 'year', isPrevious: boolean = false) => {
    const now = new Date();
    let start: Date, end: Date;

    if (period === 'today') {
      if (isPrevious) {
        start = new Date(now);
        start.setDate(start.getDate() - 1);
        end = new Date(start);
      } else {
        start = new Date(now);
        end = new Date(now);
      }
    } else if (period === 'month') {
      if (isPrevious) {
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
      } else {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      }
    } else { // year
      if (isPrevious) {
        start = new Date(now.getFullYear() - 1, 0, 1);
        end = new Date(now.getFullYear() - 1, 11, 31);
      } else {
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
      }
    }

    return { start, end };
  };

  const filterTransactionsByDateRange = (transactions: any[], start: Date, end: Date) => {
    return transactions.filter(tx => {
      if (!tx.transaction_date) return false;
      const txDate = new Date(tx.transaction_date);
      return txDate >= start && txDate <= end;
    });
  };

  const loadData = useCallback(async () => {
    try {
      const [{ data: batches }, { data: balance }, { data: transactions }] = await Promise.all([
        listBatches(),
        getBalance(),
        listTransactions(1000), // Get more transactions for better calculations
      ]);

      if (batches && balance && transactions) {
        // Calculate total livestock
        const totalLivestock = batches.reduce((sum, batch) => sum + (batch.current_count || 0), 0);

        // Get current and previous date ranges
        const currentRange = getDateRange(range, false);
        const previousRange = getDateRange(range, true);

        // Filter transactions for current and previous periods
        const currentTransactions = filterTransactionsByDateRange(transactions, currentRange.start, currentRange.end);
        const previousTransactions = filterTransactionsByDateRange(transactions, previousRange.start, previousRange.end);

        // Calculate financial metrics for current period
        const currentIncome = currentTransactions.reduce((sum, tx) => sum + (tx.debit || 0), 0);
        const currentExpenses = currentTransactions.reduce((sum, tx) => sum + (tx.credit || 0), 0);
        const currentNetProfit = currentIncome - currentExpenses;

        // Calculate financial metrics for previous period
        const previousIncome = previousTransactions.reduce((sum, tx) => sum + (tx.debit || 0), 0);
        const previousExpenses = previousTransactions.reduce((sum, tx) => sum + (tx.credit || 0), 0);
        const previousNetProfit = previousIncome - previousExpenses;

        // Calculate deltas
        const incomeDelta = calculateDelta(currentIncome, previousIncome);
        const expensesDelta = calculateDelta(currentExpenses, previousExpenses);
        const profitDelta = calculateDelta(currentNetProfit, previousNetProfit);

        // Generate chart data - group by week for month view, by month for year view
        const chartLabels: string[] = [];
        const incomeData: number[] = [];
        const expenseData: number[] = [];

        if (range === 'month') {
          // Group by week
          const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
          weeks.forEach((week, index) => {
            chartLabels.push(week);
            const weekStart = new Date(currentRange.start.getFullYear(), currentRange.start.getMonth(), index * 7);
            const weekEnd = new Date(currentRange.start.getFullYear(), currentRange.start.getMonth(), (index + 1) * 7);

            const weekIncome = currentTransactions
              .filter(tx => {
                if (!tx.transaction_date) return false;
                const txDate = new Date(tx.transaction_date);
                return txDate >= weekStart && txDate < weekEnd;
              })
              .reduce((sum, tx) => sum + (tx.debit || 0), 0);

            const weekExpense = currentTransactions
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
            const monthIncome = currentTransactions
              .filter(tx => {
                if (!tx.transaction_date) return false;
                const txDate = new Date(tx.transaction_date);
                return txDate.getMonth() === index && txDate.getFullYear() === currentRange.start.getFullYear();
              })
              .reduce((sum, tx) => sum + (tx.debit || 0), 0);

            const monthExpense = currentTransactions
              .filter(tx => {
                if (!tx.transaction_date) return false;
                const txDate = new Date(tx.transaction_date);
                return txDate.getMonth() === index && txDate.getFullYear() === currentRange.start.getFullYear();
              })
              .reduce((sum, tx) => sum + (tx.credit || 0), 0);

            incomeData.push(monthIncome);
            expenseData.push(monthExpense);
          });
        } else {
          // Today - show hourly data or just today's total
          chartLabels.push('Today');
          incomeData.push(currentIncome);
          expenseData.push(currentExpenses);
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
          totalLivestock: { value: totalLivestock, delta: '+0%' }, // TODO: Calculate livestock delta if needed
          totalExpenses: { value: currentExpenses, delta: expensesDelta },
          totalIncome: { value: currentIncome, delta: incomeDelta },
          netProfit: { value: currentNetProfit, delta: profitDelta },
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
              onPress={() => setRange(r)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color: range === r ? '#fff' : colors.text,
                    fontWeight: range === r ? Typography.weight.bold : Typography.weight.medium,
                  },
                ]}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.content}>
          {loading && (
            <View style={{ padding: Spacing.md, alignItems: 'center' }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          )}
          {error && (
            <Text style={{ color: colors.error, marginBottom: Spacing.sm }}>Failed to load: {error}</Text>
          )}

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Livestock"
              value={metrics.totalLivestock.value.toLocaleString()}
              delta={metrics.totalLivestock.delta}
              icon="paw"
              colors={colors}
              shadow={shadow}
            />
            <StatCard
              title="Total Income"
              value={formatIDR(metrics.totalIncome.value)}
              delta={metrics.totalIncome.delta}
              icon="trending-up"
              colors={colors}
              shadow={shadow}
            />
            <StatCard
              title="Total Expenses"
              value={formatIDR(metrics.totalExpenses.value)}
              delta={metrics.totalExpenses.delta}
              icon="trending-down"
              colors={colors}
              shadow={shadow}
            />
            <StatCard
              title="Net Profit"
              value={formatIDR(metrics.netProfit.value)}
              delta={metrics.netProfit.delta}
              icon="wallet"
              colors={colors}
              shadow={shadow}
            />
          </View>

          {/* Chart */}
          <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }, shadow]}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Financial Overview</Text>
            <LineChart data={chartData} height={220} showGrid={true} showLegend={true} />
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
  const isPositive = delta.startsWith('+') && delta !== '+0%';
  const isNegative = delta.startsWith('-');
  const deltaColor = isPositive ? colors.success : isNegative ? colors.error : colors.icon;

  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }, shadow]}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: colors.secondary }]}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <Text style={[styles.statDelta, { color: deltaColor }]}>{delta}</Text>
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: colors.icon }]}>{title}</Text>
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
  filterChipText: {
    fontSize: Typography.caption,
    fontWeight: Typography.weight.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.sm as any,
    marginBottom: Spacing.sm,
  },
  statCard: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    width: '48%', // Two columns
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.xs,
  },
  statDelta: {
    fontSize: Typography.caption,
    fontWeight: Typography.weight.medium,
  },
  statValue: {
    fontSize: Typography.display,
    fontWeight: Typography.weight.extrabold,
    marginBottom: Spacing.xs,
  },
  statTitle: {
    fontSize: Typography.caption,
    textAlign: 'center',
  },
  chartCard: {
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  chartTitle: {
    fontSize: Typography.title,
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.sm,
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
  statRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  deltaRow: { flexDirection: 'row', alignItems: 'center' },
  deltaText: { marginLeft: 4, fontWeight: Typography.weight.medium, fontSize: Typography.caption },
  legendRow: { flexDirection: 'row', gap: Spacing.md as any, marginBottom: Spacing.xs },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: Spacing.xs },
});
