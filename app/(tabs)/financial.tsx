import { Header } from '@/components/Header';
import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { Radii, Shadows, Spacing } from '@/constants/Design';
import { Typography } from '@/constants/Typography';
import { getBalance, listTransactions, type CashbookRow } from '@/lib/data';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FinancialScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const shadow = Shadows(isDark);

  const [transactions, setTransactions] = useState<CashbookRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<{ total_balance: number; total_debit: number; total_credit: number } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);

  const load = useCallback(async () => {
    const [{ data: tx, error: te }, { data: bal, error: be }] = await Promise.all([
      listTransactions(100), // Get more transactions for filtering
      getBalance(),
    ]);
    if (te) setError(te.message); else setError(null);
    if (be) setError(be.message);
    setTransactions(tx || []);
    setBalance(bal || null);
    setLoading(false);
  }, []);

  const filteredTransactions = useMemo(() => {
    if (!transactions) return transactions;
    if (!filterDate && !filterEndDate) return transactions;
    
    return transactions.filter(tx => {
      if (!tx.transaction_date) return false;
      const txDate = new Date(tx.transaction_date);
      
      if (filterDate && filterEndDate) {
        // Date range filter - make it inclusive and handle time zones properly
        const startDate = new Date(filterDate);
        startDate.setHours(0, 0, 0, 0); // Start of day
        
        const endDate = new Date(filterEndDate);
        endDate.setHours(23, 59, 59, 999); // End of day
        
        return txDate >= startDate && txDate <= endDate;
      } else if (filterDate) {
        // Single date filter - compare only the date part
        const filterDateOnly = new Date(filterDate);
        filterDateOnly.setHours(0, 0, 0, 0);
        
        const txDateOnly = new Date(txDate);
        txDateOnly.setHours(0, 0, 0, 0);
        
        return txDateOnly.getTime() === filterDateOnly.getTime();
      }
      
      return true;
    });
  }, [transactions, filterDate, filterEndDate]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const overview = useMemo(() => {
    // Calculate from filtered transactions
    const income = (filteredTransactions || []).reduce((acc, t) => acc + (t.debit || 0), 0);
    const expenses = (filteredTransactions || []).reduce((acc, t) => acc + (t.credit || 0), 0);
    const currentBalance = income - expenses;
    return { totalIncome: income, totalExpenses: expenses, currentBalance };
  }, [filteredTransactions]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={t('nav.financial')} />
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: Spacing.xl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
        <View style={styles.content}>
          {/* Overview cards */}
          <View style={styles.overviewGrid}>
            <View style={[styles.overviewCard, { backgroundColor: colors.card, borderColor: colors.border }, shadow]}>
              <View style={styles.overviewIconContainer}>
                <Ionicons name="trending-up" size={24} color={colors.success} />
              </View>
              <Text style={[styles.overviewLabel, { color: colors.icon }]}>Total Income</Text>
              <Text style={[styles.overviewValue, { color: colors.success }]}>${(overview.totalIncome || 0).toLocaleString()}</Text>
            </View>
            <View style={[styles.overviewCard, { backgroundColor: colors.card, borderColor: colors.border }, shadow]}>
              <View style={styles.overviewIconContainer}>
                <Ionicons name="trending-down" size={24} color={colors.error} />
              </View>
              <Text style={[styles.overviewLabel, { color: colors.icon }]}>Total Expenses</Text>
              <Text style={[styles.overviewValue, { color: colors.error }]}>${(overview.totalExpenses || 0).toLocaleString()}</Text>
            </View>
            <View style={[styles.overviewCard, { backgroundColor: colors.card, borderColor: colors.border }, shadow]}>
              <View style={styles.overviewIconContainer}>
                <Ionicons name="wallet" size={24} color={overview.currentBalance >= 0 ? colors.success : colors.error} />
              </View>
              <Text style={[styles.overviewLabel, { color: colors.icon }]}>Net Balance</Text>
              <Text style={[styles.overviewValue, { color: overview.currentBalance >= 0 ? colors.success : colors.error }]}>
                ${(overview.currentBalance || 0).toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Transactions */}
          <View style={styles.transHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
            <TouchableOpacity activeOpacity={0.8} style={[styles.addBtn, { backgroundColor: colors.primary }, shadow]}
              onPress={() => {
                const { router } = require('expo-router');
                router.push('/finance/form');
              }}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.addBtnText}>Add Transaction</Text>
            </TouchableOpacity>
          </View>

          {/* Date Range Filter */}
          <View style={styles.filterRow}>
            <TouchableOpacity 
              style={[styles.filterBtn, { backgroundColor: filterDate ? colors.primary : colors.secondary }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={16} color={filterDate ? '#fff' : colors.text} />
              <Text style={[styles.filterBtnText, { color: filterDate ? '#fff' : colors.text }]}>
                {filterDate ? filterDate.toLocaleDateString() : 'From Date'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterBtn, { backgroundColor: filterEndDate ? colors.primary : colors.secondary }]}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={16} color={filterEndDate ? '#fff' : colors.text} />
              <Text style={[styles.filterBtnText, { color: filterEndDate ? '#fff' : colors.text }]}>
                {filterEndDate ? filterEndDate.toLocaleDateString() : 'To Date'}
              </Text>
            </TouchableOpacity>
            {(filterDate || filterEndDate) && (
              <TouchableOpacity 
                style={[styles.filterBtn, { backgroundColor: colors.error }]}
                onPress={() => {
                  setFilterDate(null);
                  setFilterEndDate(null);
                }}
              >
                <Ionicons name="close" size={16} color="#fff" />
                <Text style={[styles.filterBtnText, { color: '#fff' }]}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={filterDate || new Date()}
              mode="date"
              display="default"
              onChange={(_, date) => {
                setShowDatePicker(false);
                if (date) setFilterDate(date);
              }}
            />
          )}
          
          {showEndDatePicker && (
            <DateTimePicker
              value={filterEndDate || new Date()}
              mode="date"
              display="default"
              onChange={(_, date) => {
                setShowEndDatePicker(false);
                if (date) setFilterEndDate(date);
              }}
            />
          )}

          {loading && (
            <View style={{ padding: Spacing.md, alignItems: 'center' }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          )}
          {error && <Text style={{ color: colors.error, marginBottom: Spacing.sm }}>Failed to load: {error}</Text>}

          {(filteredTransactions || []).map((tx) => (
            <View key={tx.id} style={[styles.txItem, { backgroundColor: colors.card, borderColor: colors.border }, shadow]}>
              <View style={styles.txLeft}>
                <Ionicons name="receipt-outline" size={20} color={colors.icon} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={[styles.txTitle, { color: colors.text }]}>{tx.notes || 'Transaction'}</Text>
                  <Text style={[styles.txSubtitle, { color: colors.icon }]}>{tx.transaction_date || ''}</Text>
                </View>
              </View>
              <View style={styles.txRight}>
                <Text style={{ color: (tx.debit || 0) > 0 ? colors.success : colors.error, fontWeight: Typography.weight.bold }}>
                  {(tx.debit || 0) > 0 ? `+$${tx.debit.toLocaleString()}` : `-$${(tx.credit || 0).toLocaleString()}`}
                </Text>
                <TouchableOpacity onPress={() => {
                  const { router } = require('expo-router');
                  router.push({ pathname: '/finance/form', params: { id: tx.id } });
                }}>
                  <Ionicons name="create-outline" size={18} color={colors.icon} />
                </TouchableOpacity>
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
  overviewGrid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  overviewCard: { flex: 1, borderWidth: 1, borderRadius: Radii.md, padding: Spacing.sm, alignItems: 'center' },
  overviewIconContainer: { marginBottom: Spacing.xs },
  overviewLabel: { fontSize: Typography.caption, textAlign: 'center' },
  overviewValue: { fontSize: Typography.headline, fontWeight: Typography.weight.extrabold, marginTop: 4, textAlign: 'center' },
  sectionTitle: { fontSize: Typography.title, fontWeight: Typography.weight.bold },
  transHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.xs, marginBottom: Spacing.xs },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs as any, paddingVertical: Spacing.xs, paddingHorizontal: Spacing.sm, borderRadius: Radii.sm },
  addBtnText: { color: '#fff', fontWeight: Typography.weight.bold },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs as any, paddingVertical: Spacing.xs, paddingHorizontal: Spacing.sm, borderRadius: Radii.sm },
  filterBtnText: { fontWeight: Typography.weight.medium, fontSize: Typography.caption },
  txItem: { borderWidth: 1, borderRadius: Radii.md, padding: Spacing.sm, marginBottom: Spacing.xs, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  txLeft: { flexDirection: 'row', alignItems: 'center' },
  txTitle: { fontSize: Typography.body, fontWeight: Typography.weight.bold },
  txSubtitle: { fontSize: Typography.caption, marginTop: 2 },
  txRight: { alignItems: 'flex-end', gap: Spacing.xs as any },
});
