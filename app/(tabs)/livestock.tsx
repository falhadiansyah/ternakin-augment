import { Header } from '@/components/Header';
import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { Radii, Shadows, Spacing } from '@/constants/Design';
import { Typography } from '@/constants/Typography';
import { createTransaction, getGrowthRowWithFallback, listBatches, recomputeAndUpdateBatchAges, type BatchRow } from '@/lib/data';
import { showToast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface StockAdjustmentModal {
  batch: BatchRow;
  isIncrease: boolean;
}

export default function LivestockScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const shadow = Shadows(isDark);

  const [batches, setBatches] = useState<BatchRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [stockModal, setStockModal] = useState<StockAdjustmentModal | null>(null);
  const [adjustmentCount, setAdjustmentCount] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'sold' | 'death' | 'purchased' | 'other'>('sold');
  const [adjustmentDescription, setAdjustmentDescription] = useState('');
  const [adjustmentPrice, setAdjustmentPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [growthByBatch, setGrowthByBatch] = useState<Record<string, { 
    weight_male: number | null; 
    weight_female: number | null;
    temperature?: number | null;
    lighting?: string | null;
    vaccine?: string | null;
    feed_gr?: number | null;
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
        feed_gr?: number | null;
      }> = {};
      for (const b of (batches || [])) {
        const { data: g } = await getGrowthRowWithFallback(b.animal, b.breed, b.current_age_weeks || 0);
        map[b.id] = { 
          weight_male: g?.weight_male ?? null, 
          weight_female: g?.weight_female ?? null,
          temperature: g?.temperature ?? null,
          lighting: g?.lightning ?? null,
          vaccine: g?.vaccine ?? null,
          feed_gr: g?.feed_gr ?? null,
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

  const handleStockAdjustment = (batch: BatchRow, isIncrease: boolean) => {
    setStockModal({ batch, isIncrease });
    setAdjustmentCount('');
    setAdjustmentType(isIncrease ? 'purchased' : 'sold');
    setAdjustmentDescription('');
    setAdjustmentPrice('');
  };

  const saveStockAdjustment = async () => {
    if (!stockModal) return;

    const count = parseInt(adjustmentCount);
    if (isNaN(count) || count <= 0) {
      showToast('Please enter a valid quantity', 'error');
      return;
    }

    if (!adjustmentPrice || parseFloat(adjustmentPrice) < 0) {
      showToast('Please enter a valid price for financial tracking', 'error');
      return;
    }

    try {
      setSaving(true);

      // Import the required functions
      const { supabase } = await import('@/lib/supabase');
      const { getCurrentFarmId } = await import('@/lib/data');

      const { farmId, error: fe } = await getCurrentFarmId();
      if (fe) throw fe;
      if (!farmId) throw new Error('No farm assigned to your profile');

      // Calculate new count
      const currentCount = stockModal.batch.current_count || 0;
      const newCount = stockModal.isIncrease ? currentCount + count : currentCount - count;

      if (newCount < 0) {
        showToast('Cannot reduce stock below 0', 'error');
        return;
      }

      // Update batch count
      const { error: batchError } = await supabase
        .from('batches')
        .update({ current_count: newCount })
        .eq('id', stockModal.batch.id);

      if (batchError) throw batchError;

      // Insert into batches_history
      const { error: historyError } = await supabase
        .from('batches_history')
        .insert({
          batches_id: stockModal.batch.id,
          type: adjustmentType,
          count: stockModal.isIncrease ? count : -count,
          description: adjustmentDescription || `${adjustmentType} - ${count} ${stockModal.batch.animal}`,
          total_price: parseFloat(adjustmentPrice) || 0,
        });

      if (historyError) throw historyError;

      // Get the timestamp from the history record for proper audit trail
      const { data: historyData } = await supabase
        .from('batches_history')
        .select('created_at')
        .eq('batches_id', stockModal.batch.id)
        .order('created_at', { ascending: false })
        .limit(1);

      const transactionDate = historyData?.[0]?.created_at || new Date().toISOString();

      // Always create a financial transaction for stock adjustments
      let transactionType: 'income' | 'expense';
      let amount: number;

      if (stockModal.isIncrease) {
        // Purchasing = expense
        transactionType = 'expense';
        amount = parseFloat(adjustmentPrice) || 0;
      } else {
        // Selling or death
        if (adjustmentType === 'sold') {
          transactionType = 'income';
          amount = parseFloat(adjustmentPrice) || 0;
        } else {
          transactionType = 'expense';
          amount = parseFloat(adjustmentPrice) || 0;
        }
      }

      const { error: transactionError } = await createTransaction({
        debit: transactionType === 'income' ? amount : 0,
        credit: transactionType === 'expense' ? amount : 0,
        transaction_date: transactionDate,
        type: adjustmentType,
        notes: `${adjustmentType} - ${count} ${stockModal.batch.animal} from ${stockModal.batch.name}`,
        batches_id: stockModal.batch.id,
      });

      if (transactionError) throw transactionError;

      showToast('Stock adjustment saved successfully', 'success');
      setStockModal(null);
      await load(); // Reload data
    } catch (err: any) {
      showToast(err.message || 'Failed to save stock adjustment', 'error');
    } finally {
      setSaving(false);
    }
  };

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
            <View key={b.id} style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }, shadow]}>
              <View style={styles.itemHeader}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>{b.name}</Text>
              </View>
              
              <View style={styles.itemMetaRow}>
                <Text style={[styles.itemMeta, { color: colors.icon }]}>
                  <Ionicons name="paw" size={12} /> {b.animal}
                </Text>
                <Text style={[styles.itemMeta, { color: colors.icon }]}>
                  <Ionicons name="calendar" size={12} /> {b.current_age_weeks}w old
                </Text>
              </View>
              
              <View style={styles.breedRow}>
                <Text style={[styles.breedLabel, { color: colors.icon }]}>
                  Breed: <Text style={[styles.breedValue, { color: colors.text }]}>{b.breed}</Text>
                </Text>
              </View>
              
              <View style={styles.statsRow}>
                <Stat label="Current Count" value={`${b.current_count || 0}`} colors={colors} />
                <Stat label="Starting Count" value={`${b.starting_count || 0}`} colors={colors} />
                <Stat label="Total Cost" value={`$${(b.total_cost || 0).toLocaleString()}`} colors={colors} />
              </View>

              {/* Growth expectations */}
              {growthByBatch[b.id] && (
                <View style={styles.growthSection}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Expected at {b.current_age_weeks} weeks:</Text>
                  <View style={styles.growthStats}>
                    {growthByBatch[b.id].weight_male && (
                      <Text style={[styles.growthText, { color: colors.icon }]}>
                        Male: {growthByBatch[b.id].weight_male}g
                      </Text>
                    )}
                    {growthByBatch[b.id].weight_female && (
                      <Text style={[styles.growthText, { color: colors.icon }]}>
                        Female: {growthByBatch[b.id].weight_female}g
                      </Text>
                    )}
                    {growthByBatch[b.id].feed_gr && (
                      <Text style={[styles.growthText, { color: colors.icon }]}>
                        Feed: {growthByBatch[b.id].feed_gr}g/day
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {/* Care requirements */}
              {growthByBatch[b.id] && (
                <View style={styles.careSection}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Care Requirements:</Text>
                  <View style={styles.careStats}>
                    {growthByBatch[b.id].temperature && (
                      <View style={styles.careItem}>
                        <Ionicons name="thermometer" size={14} color={colors.icon} />
                        <Text style={[styles.careText, { color: colors.icon }]}>
                          {growthByBatch[b.id].temperature}°C
                        </Text>
                      </View>
                    )}
                    {growthByBatch[b.id].lighting && (
                      <View style={styles.careItem}>
                        <Ionicons name="sunny" size={14} color={colors.icon} />
                        <Text style={[styles.careText, { color: colors.icon }]}>
                          {growthByBatch[b.id].lighting}
                        </Text>
                      </View>
                    )}
                    {growthByBatch[b.id].vaccine && (
                      <View style={styles.careItem}>
                        <Ionicons name="medical" size={14} color={colors.icon} />
                        <Text style={[styles.careText, { color: colors.icon }]}>
                          {growthByBatch[b.id].vaccine}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Current count controls */}
              <View style={styles.countControls}>
                <Text style={[styles.countLabel, { color: colors.icon }]}>Current Count:</Text>
                <View style={styles.countButtons}>
                  <TouchableOpacity 
                    style={[styles.countButton, { backgroundColor: colors.error }]}
                    onPress={() => handleStockAdjustment(b, false)}
                  >
                    <Ionicons name="remove" size={16} color="#fff" />
                  </TouchableOpacity>
                  <Text style={[styles.countValue, { color: colors.text }]}>
                    {b.current_count || 0}
                  </Text>
                  <TouchableOpacity 
                    style={[styles.countButton, { backgroundColor: colors.success }]}
                    onPress={() => handleStockAdjustment(b, true)}
                  >
                    <Ionicons name="add" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Stock Adjustment Modal */}
      <Modal visible={!!stockModal} transparent animationType="fade" onRequestClose={() => setStockModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {stockModal?.isIncrease ? 'Add Stock' : 'Reduce Stock'} - {stockModal?.batch.name}
            </Text>
            
            <View style={styles.modalField}>
              <Text style={[styles.modalLabel, { color: colors.icon }]}>Count/Qty</Text>
              <TextInput
                value={adjustmentCount}
                onChangeText={setAdjustmentCount}
                keyboardType="numeric"
                style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]}
                placeholder="Enter quantity"
              />
            </View>

            <View style={styles.modalField}>
              <Text style={[styles.modalLabel, { color: colors.icon }]}>Type</Text>
              <View style={styles.typeButtons}>
                {(['sold', 'death', 'purchased', 'other'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      {
                        backgroundColor: adjustmentType === type ? colors.primary : colors.secondary,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setAdjustmentType(type)}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      { color: adjustmentType === type ? '#fff' : colors.text }
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalField}>
              <Text style={[styles.modalLabel, { color: colors.icon }]}>Description</Text>
              <TextInput
                value={adjustmentDescription}
                onChangeText={setAdjustmentDescription}
                style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]}
                placeholder="Optional description"
                multiline
              />
            </View>

            <View style={styles.modalField}>
              <Text style={[styles.modalLabel, { color: colors.icon }]}>Total Price *</Text>
              <TextInput
                value={adjustmentPrice}
                onChangeText={setAdjustmentPrice}
                keyboardType="numeric"
                style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]}
                placeholder="Enter price (required for financial tracking)"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.secondary }]}
                onPress={() => setStockModal(null)}
                disabled={saving}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={saveStockAdjustment}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={[styles.modalButtonText, { color: '#fff' }]}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Stat({ label, value, colors }: { label: string; value: string; colors: typeof Colors.light }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statLabel, { color: colors.icon }]}>{label}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  toolbar: { padding: Spacing.md, paddingBottom: 0 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs as any, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: Radii.sm },
  actionBtnText: { color: '#fff', fontWeight: Typography.weight.bold },
  content: { padding: Spacing.md },
  listItem: { borderWidth: 1, borderRadius: Radii.md, padding: Spacing.md, marginBottom: Spacing.sm },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  itemTitle: { fontSize: Typography.title, fontWeight: Typography.weight.bold },
  itemMetaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md as any, marginBottom: Spacing.sm },
  itemMeta: { fontSize: Typography.caption, flexDirection: 'row', alignItems: 'center' },
  breedRow: { marginBottom: Spacing.sm },
  breedLabel: { fontSize: Typography.caption },
  breedValue: { fontWeight: Typography.weight.medium },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  stat: { alignItems: 'center' },
  statLabel: { fontSize: Typography.caption, marginBottom: 2 },
  statValue: { fontSize: Typography.body, fontWeight: Typography.weight.bold },
  growthSection: { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)', paddingTop: Spacing.sm },
  sectionTitle: { fontSize: Typography.caption, fontWeight: Typography.weight.medium, marginBottom: Spacing.xs },
  growthStats: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm as any },
  growthText: { fontSize: Typography.caption },
  careSection: { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)', paddingTop: Spacing.sm, marginTop: Spacing.sm },
  careStats: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm as any },
  careItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs as any },
  careText: { fontSize: Typography.caption },
  countControls: { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)', paddingTop: Spacing.sm, marginTop: Spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  countLabel: { fontSize: Typography.caption, fontWeight: Typography.weight.medium },
  countButtons: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm as any },
  countButton: { padding: Spacing.sm, borderRadius: Radii.sm },
  countValue: { fontSize: Typography.body, fontWeight: Typography.weight.bold, minWidth: 40, textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: Radii.md,
    borderWidth: 1,
    padding: Spacing.md,
  },
  modalTitle: {
    fontSize: Typography.title,
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  modalField: {
    marginBottom: Spacing.md,
  },
  modalLabel: {
    fontSize: Typography.caption,
    fontWeight: Typography.weight.medium,
    marginBottom: Spacing.xs,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: Radii.sm,
    padding: Spacing.sm,
    fontSize: Typography.body,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs as any,
  },
  typeButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.sm,
    borderWidth: 1,
  },
  typeButtonText: {
    fontSize: Typography.caption,
    fontWeight: Typography.weight.medium,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.sm,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: Typography.body,
    fontWeight: Typography.weight.medium,
  },
});
