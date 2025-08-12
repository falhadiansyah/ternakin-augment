import { Header } from '@/components/Header';
import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { Radii, Shadows, Spacing } from '@/constants/Design';
import { Typography } from '@/constants/Typography';
import { getGrowthRowWithFallback, listBatches, recomputeAndUpdateBatchAges, type BatchRow } from '@/lib/data';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LivestockScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const shadow = Shadows(isDark);

  const [batches, setBatches] = useState<BatchRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [growthByBatch, setGrowthByBatch] = useState<Record<string, { 
    weight_male: number | null; 
    weight_female: number | null;
    temperature?: number | null;
    lighting?: string | null;
    vaccine?: string | null;
  }>>({});

  const load = useCallback(async () => {
    // recompute ages before showing
    await recomputeAndUpdateBatchAges();
    const { data, error } = await listBatches();
    if (error) setError(error.message); else setError(null);
    setBatches(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    // After batches are loaded, fetch expected weights and care data per batch
    (async () => {
      const map: Record<string, { 
        weight_male: number | null; 
        weight_female: number | null;
        temperature?: number | null;
        lighting?: string | null;
        vaccine?: string | null;
      }> = {};
      for (const b of (batches || [])) {
        const { data: g } = await getGrowthRowWithFallback(b.animal, b.breed, b.current_age_weeks || 0);
        map[b.id] = { 
          weight_male: g?.weight_male ?? null, 
          weight_female: g?.weight_female ?? null,
          temperature: g?.temperature ?? null,
          lighting: g?.lightning ?? null,
          vaccine: g?.vaccine ?? null,
        };
      }
      setGrowthByBatch(map);
    })();
  }, [batches]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={t('nav.livestock')} />
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: Spacing.xl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
        <View style={styles.toolbar}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }, shadow]}
            onPress={() => {
              // Navigate to Batch Form
              const { router } = require('expo-router');
              router.push('/batch/form');
            }}>
            <Ionicons name="add" color="#fff" size={16} />
            <Text style={styles.actionBtnText}>Add New Batch</Text>
          </TouchableOpacity>
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
          {(batches || []).map((b) => (
            <View key={b.id} style={[styles.batchCard, { backgroundColor: colors.card, borderColor: colors.border }, shadow]}>
              <View style={styles.batchHeader}>
                <View>
                  <Text style={[styles.batchTitle, { color: colors.text }]}>{b.name}</Text>
                  <Text style={[styles.batchSubtitle, { color: colors.icon }]}>{b.animal}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                  <Text style={[styles.badgeText, { color: '#fff' }]}>{b.breed.toUpperCase().replace('_', ' ')}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={14} color={colors.icon} />
                <Text style={[styles.metaText, { color: colors.icon }]}>Entry: {b.entry_date ?? '-'}</Text>
                <Ionicons name="business-outline" size={14} color={colors.icon} style={{ marginLeft: Spacing.sm }} />
                <Text style={[styles.metaText, { color: colors.icon }]}>Source: {b.source ?? '-'}</Text>
              </View>

              <View style={styles.statsRow}>
                <Stat label="Animals" value={`${b.current_count ?? b.starting_count ?? 0}`} colors={colors} />
                <Stat label="Age" value={`${b.current_age_days}d / ${b.current_age_weeks}w`} colors={colors} />
                <Stat label="Weight M/F" value={`${growthByBatch[b.id]?.weight_male ?? '-'} / ${growthByBatch[b.id]?.weight_female ?? '-'}`} colors={colors} />
              </View>

              {/* Care information row */}
              <View style={styles.careRow}>
                <View style={styles.careItem}>
                  <Ionicons name="thermometer-outline" size={14} color={colors.icon} />
                  <Text style={[styles.careText, { color: colors.icon }]}>
                    {growthByBatch[b.id]?.temperature ? `${growthByBatch[b.id].temperature}°C` : '-'}
                  </Text>
                </View>
                <View style={styles.careItem}>
                  <Ionicons name="sunny-outline" size={14} color={colors.icon} />
                  <Text style={[styles.careText, { color: colors.icon }]}>
                    {growthByBatch[b.id]?.lighting || '-'}
                  </Text>
                </View>
                <View style={styles.careItem}>
                  <Ionicons name="medical-outline" size={14} color={colors.icon} />
                  <Text style={[styles.careText, { color: colors.icon }]}>
                    {growthByBatch[b.id]?.vaccine || '-'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity style={[styles.iconBtn, { borderColor: colors.border }]}
                  onPress={() => { /* future: add history */ }}>
                  <Ionicons name="add" size={18} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value, colors }: { label: string; value: string; colors: typeof Colors.light }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.icon }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  toolbar: { padding: Spacing.md, paddingBottom: 0 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs as any, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: Radii.sm, alignSelf: 'flex-start' },
  actionBtnText: { color: '#fff', fontWeight: Typography.weight.bold, marginLeft: 6 },
  content: { padding: Spacing.md },
  batchCard: { borderWidth: 1, borderRadius: Radii.md, padding: Spacing.md, marginBottom: Spacing.sm },
  batchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  batchTitle: { fontSize: Typography.title, fontWeight: Typography.weight.bold },
  batchSubtitle: { fontSize: Typography.caption },
  badge: { paddingHorizontal: Spacing.xs, paddingVertical: 4, borderRadius: Radii.sm, borderWidth: 1 },
  badgeText: { fontSize: Typography.caption, fontWeight: Typography.weight.medium },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs as any, marginBottom: Spacing.xs },
  metaText: { fontSize: Typography.caption },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.xs as any, marginTop: 6 },
  statBox: { flex: 1, borderWidth: 1, borderColor: 'transparent', paddingVertical: 8 },
  statValue: { fontSize: Typography.title, fontWeight: Typography.weight.bold },
  statLabel: { fontSize: Typography.caption },
  careRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm as any, marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)' },
  careItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs as any },
  careText: { fontSize: Typography.caption, marginLeft: 4 },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.xs as any, marginTop: Spacing.xs },
  iconBtn: { width: 34, height: 34, borderRadius: Radii.sm, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});
