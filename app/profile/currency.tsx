import { Header } from '@/components/Header';
import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { Radii, Shadows, Spacing } from '@/constants/Design';
import { Typography } from '@/constants/Typography';
import { getFarmCurrency, updateFarmCurrency } from '@/lib/data';
import { setCurrentCurrency } from '@/utils/currency';
import { showToast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ALL_CURRENCIES: Array<{ code: string; name: string; symbol: string }> = [
  { code: 'USD', name: 'United States Dollar', symbol: '$' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'AED', name: 'United Arab Emirates Dirham', symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
];

export default function CurrencySettingsScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const shadow = Shadows(isDark);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string>('IDR');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { code, error } = await getFarmCurrency();
        if (error) {
          setError(error.message);
        }
        if (code) setSelected(code);
      } catch (e: any) {
        setError(e?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_CURRENCIES;
    return ALL_CURRENCIES.filter((c) =>
      c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  }, [query]);

  const save = async () => {
    try {
      setSaving(true);
      const { ok, error } = await updateFarmCurrency(selected);
      if (error || !ok) throw error || new Error('Failed to save currency');
      setCurrentCurrency(selected);
      await AsyncStorage.setItem('currency', selected);
      showToast(t('currency.saved_success'), 'success');
      router.back();
    } catch (e: any) {
      showToast(e?.message || t('currency.save_failed'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={t('currency.title')} showBackButton onBackPress={() => router.back()} />
      <View style={{ padding: Spacing.md }}>
        <View style={[styles.searchRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Ionicons name="search" size={16} color={colors.icon} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('currency.search_placeholder')}
            placeholderTextColor={colors.icon}
            style={{ flex: 1, color: colors.text, marginLeft: 8 }}
          />
        </View>
      </View>

      {loading ? (
        <View style={{ padding: Spacing.md, alignItems: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ padding: Spacing.md }}
          data={filtered}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelected(item.code)}
              style={[styles.row, { borderColor: colors.border, backgroundColor: colors.card }, shadow]}
            >
              <View style={styles.rowLeft}>
                <Text style={[styles.rowCode, { color: colors.text }]}>{item.code}</Text>
                <Text style={[styles.rowName, { color: colors.icon }]}>{item.name}</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={{ color: colors.text, marginRight: 8 }}>{item.symbol}</Text>
                <Ionicons
                  name={selected === item.code ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={selected === item.code ? colors.primary : colors.icon}
                />
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <View style={{ padding: Spacing.md }}>
        <TouchableOpacity
          onPress={save}
          disabled={saving}
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons name={saving ? 'hourglass' : 'save'} size={16} color="#fff" />
          <Text style={styles.saveText}>{t('common.save')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: Radii.sm, paddingHorizontal: Spacing.sm, paddingVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: Radii.md, padding: Spacing.sm, marginBottom: Spacing.xs },
  rowLeft: { flexDirection: 'column' },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  rowCode: { fontSize: Typography.body, fontWeight: Typography.weight.bold },
  rowName: { fontSize: Typography.caption, marginTop: 2 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: Spacing.sm, borderRadius: Radii.sm },
  saveText: { color: '#fff', fontWeight: Typography.weight.bold, marginLeft: 6 },
});

