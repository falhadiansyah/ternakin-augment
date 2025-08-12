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

      // Only create financial transaction if price is provided and greater than 0
      const price = parseFloat(adjustmentPrice) || 0;
      if (price > 0) {
        // Get the timestamp from the history record for proper audit trail
        const { data: historyData } = await supabase
          .from('batches_history')
          .select('created_at')
          .eq('batches_id', stockModal.batch.id)
          .order('created_at', { ascending: false })
          .limit(1);

        const transactionDate = historyData?.[0]?.created_at || new Date().toISOString();

        // Create financial transaction for stock adjustments
        let transactionType: 'income' | 'expense';
        let amount: number;

        if (stockModal.isIncrease) {
          // Purchasing = expense
          transactionType = 'expense';
          amount = price;
        } else {
          // Selling or death
          if (adjustmentType === 'sold') {
            transactionType = 'income';
            amount = price;
          } else {
            transactionType = 'expense';
            amount = price;
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
      }

      showToast('Stock adjustment saved successfully', 'success');
      setStockModal(null);
      await load(); // Reload data
    } catch (err: any) {
      showToast(err.message || 'Failed to save stock adjustment', 'error');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const formatAge = (days: number, weeks: number) => {
    return `${days}d / ${weeks}w`;
  };

  const formatWeight = (male: number | null, female: number | null) => {
    if (male && female) {
      return `${male} / ${female}`;
    } else if (male) {
      return `${male}`;
    } else if (female) {
      return `${female}`;
    }
    return 'N/A';
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
              {/* Header with title and batch tag */}
              <View style={styles.itemHeader}>
                <View style={styles.titleSection}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{b.name}</Text>
                  <Text style={[styles.itemSubtitle, { color: colors.icon }]}>{b.animal}</Text>
                </View>
                <View style={[styles.batchTag, { backgroundColor: colors.primary }]}>
                  <Text style={styles.batchTagText}>{b.breed}</Text>
                </View>
              </View>
              
              {/* Entry details */}
              <View style={styles.entryDetails}>
                <View style={styles.entryItem}>
                  <Ionicons name="calendar" size={14} color={colors.icon} />
                  <Text style={[styles.entryText, { color: colors.icon }]}>
                    Entry: {formatDate(b.entry_date)}
                  </Text>
                </View>
                <View style={styles.entryItem}>
                  <Ionicons name="business" size={14} color={colors.icon} />
                  <Text style={[styles.entryText, { color: colors.icon }]}>
                    Source: {b.source || 'N/A'}
                  </Text>
                </View>
              </View>
              
              {/* Key metrics - 3 columns */}
              <View style={styles.keyMetrics}>
                <View style={styles.metricColumn}>
                  <Text style={[styles.metricValue, { color: colors.text }]}>
                    {b.current_count || 0} Animals
                  </Text>
                </View>
                <View style={styles.metricColumn}>
                  <Text style={[styles.metricValue, { color: colors.text }]}>
                    {formatAge(b.current_age_days || 0, b.current_age_weeks || 0)} Age
                  </Text>
                </View>
                <View style={styles.metricColumn}>
                  <Text style={[styles.metricValue, { color: colors.text }]}>
                    {formatWeight(growthByBatch[b.id]?.weight_male, growthByBatch[b.id]?.weight_female)} Weight M/F
                  </Text>
                </View>
              </View>

              {/* Additional metrics - 3 columns */}
              <View style={styles.additionalMetrics}>
                <View style={styles.metricColumn}>
                  <View style={styles.metricWithIcon}>
                    <Ionicons name="thermometer" size={14} color={colors.icon} />
                    <Text style={[styles.metricText, { color: colors.icon }]}>
                      {growthByBatch[b.id]?.temperature ? `${growthByBatch[b.id].temperature}°C` : 'N/A'}
                    </Text>
                  </View>
                </View>
                <View style={styles.metricColumn}>
                  <View style={styles.metricWithIcon}>
                    <Ionicons name="sunny" size={14} color={colors.icon} />
                    <Text style={[styles.metricText, { color: colors.icon }]}>
                      {growthByBatch[b.id]?.lighting || 'N/A'}
                    </Text>
                  </View>
                </View>
                <View style={styles.metricColumn}>
                  <View style={styles.metricWithIcon}>
                    <Ionicons name="medical" size={14} color={colors.icon} />
                    <Text style={[styles.metricText, { color: colors.icon }]}>
                      {growthByBatch[b.id]?.vaccine || '-'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action buttons - positioned on the bottom-right */}
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: colors.secondary }]}
                  onPress={() => handleStockAdjustment(b, true)}
                >
                  <Ionicons name="add" size={16} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: colors.secondary }]}
                  onPress={() => handleStockAdjustment(b, false)}
                >
                  <Ionicons name="remove" size={16} color={colors.text} />
                </TouchableOpacity>
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
              <Text style={[styles.modalLabel, { color: colors.icon }]}>Total Price (Optional)</Text>
              <TextInput
                value={adjustmentPrice}
                onChangeText={setAdjustmentPrice}
                keyboardType="numeric"
                style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]}
                placeholder="Enter price (optional - only for financial tracking)"
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  toolbar: { padding: Spacing.md, paddingBottom: 0 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs as any, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: Radii.sm },
  actionBtnText: { color: '#fff', fontWeight: Typography.weight.bold },
  content: { padding: Spacing.md },
  listItem: { 
    borderWidth: 1, 
    borderRadius: Radii.md, 
    padding: Spacing.md, 
    marginBottom: Spacing.sm,
    position: 'relative',
    paddingBottom: Spacing.xl * 2 // Extra space for action buttons
  },
  itemHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: Spacing.sm 
  },
  titleSection: {
    flex: 1,
  },
  itemTitle: { 
    fontSize: Typography.title, 
    fontWeight: Typography.weight.bold,
    marginBottom: 2
  },
  itemSubtitle: { 
    fontSize: Typography.caption,
    textTransform: 'capitalize'
  },
  batchTag: { 
    paddingHorizontal: Spacing.sm, 
    paddingVertical: Spacing.xs, 
    borderRadius: Radii.pill,
    minWidth: 60,
    alignItems: 'center'
  },
  batchTagText: { 
    color: '#fff', 
    fontSize: Typography.caption, 
    fontWeight: Typography.weight.medium 
  },
  entryDetails: { 
    flexDirection: 'row', 
    gap: Spacing.md as any, 
    marginBottom: Spacing.md 
  },
  entryItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: Spacing.xs as any 
  },
  entryText: { 
    fontSize: Typography.caption 
  },
  keyMetrics: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: Spacing.sm 
  },
  additionalMetrics: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  metricColumn: { 
    flex: 1, 
    alignItems: 'center' 
  },
  metricValue: { 
    fontSize: Typography.body, 
    fontWeight: Typography.weight.bold,
    textAlign: 'center'
  },
  metricWithIcon: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: Spacing.xs as any 
  },
  metricText: { 
    fontSize: Typography.caption,
    textAlign: 'center'
  },
  actionButtons: { 
    position: 'absolute', 
    right: Spacing.md, 
    bottom: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.xs as any
  },
  actionButton: { 
    width: 32, 
    height: 32, 
    borderRadius: Radii.sm, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
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
