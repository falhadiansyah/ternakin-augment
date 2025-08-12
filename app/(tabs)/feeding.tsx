import Picker from '@/components/forms/Picker';
import { Header } from '@/components/Header';
import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { Radii, Shadows, Spacing } from '@/constants/Design';
import { Typography } from '@/constants/Typography';
import { createFeedingPlan, deleteRecipe, getGrowthRowWithFallback, getRecipeItems, listBatches, listFeedingPlan, listRecipes, recomputeAndUpdateBatchAges, type BatchRow, type FeedingPlanRow, type RecipeItemRow, type RecipeRow } from '@/lib/data';
import { showToast } from '@/utils/toast';

import { Ionicons } from '@expo/vector-icons';


import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FeedingScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const shadow = Shadows(isDark);

  const [range, setRange] = useState<'schedule' | 'recipes'>('schedule');
  const [plans, setPlans] = useState<FeedingPlanRow[] | null>(null);
  const [batches, setBatches] = useState<BatchRow[] | null>(null);
  const [growthByBatch, setGrowthByBatch] = useState<Record<string, { feed_gr: number | null; water_ml: number | null }>>({});
  const [assigningFor, setAssigningFor] = useState<BatchRow | null>(null);
  const [assignFromWeek, setAssignFromWeek] = useState<string>('');
  const [assignToWeek, setAssignToWeek] = useState<string>('');
  const [assignRecipeId, setAssignRecipeId] = useState<string>('');
  const [expandedRecipes, setExpandedRecipes] = useState<Record<string, boolean>>({});
  const [expandedBatches, setExpandedBatches] = useState<Record<string, boolean>>({});
  const [plansByBatch, setPlansByBatch] = useState<Record<string, FeedingPlanRow[]>>({});


  const [recipes, setRecipes] = useState<RecipeRow[] | null>(null);
  const [recipeItems, setRecipeItems] = useState<Record<string, RecipeItemRow[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();



  const load = useCallback(async () => {
    // recompute ages first
    await recomputeAndUpdateBatchAges();
    const [{ data: p, error: pe }, { data: r, error: re }, { data: b, error: be }] = await Promise.all([
      listFeedingPlan(),
      listRecipes(),
      listBatches(),
    ]);
    if (pe) setError(pe.message); else setError(null);
    if (re) setError(re.message);
    if (be) setError(be.message);
    setPlans(p || []);
    setRecipes(r || []);
    setBatches(b || []);
    // group plans by batch
    const grouped: Record<string, FeedingPlanRow[]> = {};
    for (const plan of (p || [])) {
      (grouped[plan.batches_id] ||= []).push(plan);
    }
    setPlansByBatch(grouped);
    // load items for each recipe (best-effort)
    const itemsMap: Record<string, RecipeItemRow[]> = {};
    for (const rec of (r || [])) {
      const { data: items } = await getRecipeItems(rec.id);
      itemsMap[rec.id] = items || [];
    }
    setRecipeItems(itemsMap);
    // load growth references for each batch (best-effort)
    const growthMap: Record<string, { feed_gr: number | null; water_ml: number | null }> = {};
    for (const bat of (b || [])) {
      const { data: g } = await getGrowthRowWithFallback(bat.animal, bat.breed, bat.current_age_weeks || 0);
      growthMap[bat.id] = { feed_gr: g?.feed_gr ?? null, water_ml: g?.water_ml ?? null };
    }
    setGrowthByBatch(growthMap);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <Header title={t('nav.feeding')} />
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: Spacing.xl + insets.bottom }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
        {/* Segmented tabs */}
        <View style={[styles.filtersRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          {(['schedule', 'recipes'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.filterChip,
                {
                  backgroundColor: range === tab ? colors.primary : colors.card,
                  borderColor: range === tab ? colors.primary : colors.border,
                },
              ]}
              activeOpacity={0.8}
              onPress={() => setRange(tab)}
            >
              <Text style={{ color: range === tab ? 'white' : colors.text, fontWeight: Typography.weight.medium, fontSize: Typography.caption }}>
                {tab === 'schedule' ? 'Feed Schedule' : 'Feed Recipes'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {loading && (
            <View style={{ padding: Spacing.md, alignItems: 'center' }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          )}
          {error && <Text style={{ color: colors.error, marginBottom: Spacing.sm }}>Failed to load: {error}</Text>}
        {range === 'recipes' && (
          <View style={{ alignItems: 'flex-end', paddingHorizontal: Spacing.md, marginTop: Spacing.sm }}>
            <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} activeOpacity={0.8}
              onPress={() => {
                const { router } = require('expo-router');
                router.push('/recipe/form');
              }}>
              <Ionicons name="add" color="#fff" size={16} />
              <Text style={styles.addBtnText}>Add Recipe</Text>
            </TouchableOpacity>
          </View>
        )}


          {range === 'schedule' ? (
            // Schedule list
            <>
              {/* Per-batch daily requirements */}
              {(batches || []).map((b) => {
                const count = b.current_count ?? b.starting_count ?? 0;
                const per = growthByBatch[b.id] || { feed_gr: null, water_ml: null };
                const totalFeedKg = ((per.feed_gr || 0) * count) / 1000;
                const totalWaterL = ((per.water_ml || 0) * count) / 1000;
                return (
                  <View key={`req-${b.id}`} style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }, shadow]}>
                    <Text style={[styles.itemTitle, { color: colors.text }]}>{b.name}</Text>
                    <View style={styles.itemMetaRow}>
                      <Ionicons name="calendar-outline" size={14} color={colors.icon} />
                      <Text style={[styles.itemMeta, { color: colors.icon }]}>Age: {b.current_age_weeks} w</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.cardSubtitle, { color: colors.icon }]}>Feed total</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Text style={[styles.itemTitle, { color: colors.text }]}>{isFinite(totalFeedKg) ? `${totalFeedKg.toFixed(2)} kg` : '-'}</Text>
                          <Ionicons name="chevron-up" size={16} color={colors.icon} />
                        </View>
                        {per.feed_gr != null && <Text style={[styles.cardSubtitle, { color: colors.icon }]}>{per.feed_gr} g/animal × {count}</Text>}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.cardSubtitle, { color: colors.icon }]}>Water total</Text>
                        <Text style={[styles.itemTitle, { color: colors.text }]}>{isFinite(totalWaterL) ? `${totalWaterL.toFixed(2)} L` : '-'}</Text>
                        {per.water_ml != null && <Text style={[styles.cardSubtitle, { color: colors.icon }]}>{per.water_ml} ml/animal × {count}</Text>}
                      </View>
                    </View>

                    {/* Feeding Plan button - navigate to dedicated page */}
                    <TouchableOpacity style={[styles.smallBtn, { backgroundColor: colors.primary, position: 'absolute', right: 10, bottom: 14 }]} activeOpacity={0.8}
                      onPress={() => {
                        const { router } = require('expo-router');
                        router.push({ pathname: '/feeding-plan', params: { batchId: b.id } });
                      }}>
                      <Ionicons name="nutrition" color="#fff" size={14} />
                      <Text style={styles.smallBtnText}>Plan</Text>
                    </TouchableOpacity>

                    {/* Accordion toggle icon */}
                    <TouchableOpacity style={{ position: 'absolute', right: 10, top: 10, padding: 6 }}
                      onPress={() => setExpandedBatches(prev => ({ ...prev, [b.id]: !prev[b.id] }))}>
                      <Ionicons name={expandedBatches[b.id] ? 'chevron-up' : 'chevron-down'} color={colors.text} size={18} />
                    </TouchableOpacity>

                    {/* Expanded details: show assigned plans and ingredient breakdown */}
                    {expandedBatches[b.id] && (
                      <View style={{ marginTop: 10, width: '100%', paddingBottom: Spacing.lg }}>
                        {(() => {
                          const age = b.current_age_weeks || 0;
                          const plansForBatch = plansByBatch[b.id] || [];
                          if (plansForBatch.length === 0) {
                            return <Text style={{ color: colors.icon }}>No feeding plans yet.</Text>;
                          }
                          const isInRange = (p: FeedingPlanRow) => {
                            const from = p.age_from_week ?? 0;
                            const to = p.age_to_week ?? 9999;
                            return age >= from && age <= to;
                          };
                          return plansForBatch.filter(p => isInRange(p)).map((p) => (
                            <View key={p.id} style={{ marginBottom: 12 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={[styles.cardSubtitle, { color: colors.icon }]}>Plan: {p.age_from_week ?? 0}-{p.age_to_week ?? 0} w</Text>
                              </View>
                              {(recipeItems[p.recipes_id] || []).map((it, idx) => {
                                const grams = (totalFeedKg * 1000) * (it.percentages / 100);
                                return (
                                  <View key={idx} style={{ marginTop: 4, width: '100%' }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                      <Text style={{ color: colors.text }}>{it.name}</Text>
                                      <Text style={{ color: colors.icon }}>{grams.toFixed(0)} g</Text>
                                    </View>
                                    <View style={{ height: 6, backgroundColor: colors.secondary, borderRadius: 999, overflow: 'hidden', marginTop: 2 }}>
                                      <View style={{ width: `${Math.max(0, Math.min(100, it.percentages))}%`, height: '100%', backgroundColor: colors.primary }} />
                                    </View>
                                  </View>
                                );
                              })}
                            </View>
                          ));
                        })()}
                      </View>
                    )}
                  </View>
                );
              })}

              {/* Assign Recipe Modal */}
              <Modal visible={!!assigningFor} transparent animationType="fade" onRequestClose={() => setAssigningFor(null)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', padding: 16 }}>
                  <View style={{ backgroundColor: colors.card, padding: 16, borderRadius: 8 }}>
                    <Text style={[styles.itemTitle, { color: colors.text }]}>Assign Recipe to {assigningFor?.name}</Text>
                    <View style={{ marginTop: 8 }}>
                      <Picker
                        label="Recipe"
                        value={assignRecipeId}
                        options={(recipes || []).map(r => ({ label: r.name, value: r.id }))}
                        onValueChange={setAssignRecipeId}
                        placeholder="Select recipe"
                      />
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.cardSubtitle, { color: colors.icon }]}>From week</Text>
                        <TextInput value={assignFromWeek} onChangeText={setAssignFromWeek} keyboardType="number-pad" style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 6, padding: 8, color: colors.text }} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.cardSubtitle, { color: colors.icon }]}>To week</Text>
                        <TextInput value={assignToWeek} onChangeText={setAssignToWeek} keyboardType="number-pad" style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 6, padding: 8, color: colors.text }} />
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                      <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]} onPress={() => setAssigningFor(null)}>
                        <Text style={[styles.addBtnText, { color: colors.text }]}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={async () => {
                        if (!assigningFor || !assignRecipeId) { Alert.alert('Validation', 'Please select a recipe'); return; }
                        const from = parseInt(assignFromWeek, 10);
                        const to = parseInt(assignToWeek, 10);
                        if (Number.isNaN(from) || Number.isNaN(to)) { Alert.alert('Validation', 'Please enter valid week range'); return; }
                        if (from < 0 || to < 0 || from > to) { Alert.alert('Validation', 'Week range is invalid'); return; }
                        // overlap validation
                        const existing = plansByBatch[assigningFor.id] || [];
                        const overlaps = existing.some(p => {
                          const pf = p.age_from_week ?? 0;
                          const pt = p.age_to_week ?? 9999;
                          return from <= pt && to >= pf;
                        });
                        if (overlaps) { Alert.alert('Validation', 'Overlapping feeding plan exists for this batch and weeks'); return; }
                        await createFeedingPlan({ batches_id: assigningFor.id, recipes_id: assignRecipeId, age_from_week: from, age_to_week: to });
                        setAssigningFor(null);
                        await load();
                      }}>
                        <Text style={styles.addBtnText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>


            </>
          ) : (
            // Recipes list/detail
            <>
              {(recipes || []).map((r) => (
                <View key={r.id} style={[styles.recipeCard, { backgroundColor: colors.card, borderColor: colors.border }, shadow]}>
                  <View style={styles.recipeHeader}>
                    <Text style={[styles.recipeTitle, { color: colors.text }]}>{r.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs as any }}>
                      <TouchableOpacity onPress={() => {
                        const { router } = require('expo-router');
                        router.push({ pathname: '/recipe/form', params: { id: r.id } });
                      }}>
                        <Ionicons name="create-outline" size={18} color={colors.icon} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => {
                        Alert.alert(
                          'Confirm Delete',
                          `Are you sure you want to delete "${r.name}"? This action cannot be undone.`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Delete',
                              style: 'destructive',
                              onPress: async () => {
                                await deleteRecipe(r.id);
                                showToast('Recipe deleted', 'success');
                                await load();
                              },
                            },
                          ],
                        );
                      }}>
                        <Ionicons name="trash-outline" size={18} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={[styles.cardSubtitle, { color: colors.icon }]}>Type: {r.type} • Used: {r.used_for}</Text>
                  {r.total_price_kg != null && (
                    <Text style={[styles.cardSubtitle, { color: colors.icon }]}>${r.total_price_kg.toLocaleString()} / kg</Text>
                  )}
                  {/* Ingredients breakdown */}
                  <View style={{ marginTop: 6, width: '100%' }}>
                    {(recipeItems[r.id] || []).map((it, idx) => (
                      <View key={idx} style={{ marginBottom: 6 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={{ color: colors.text }}>{it.name}</Text>
                          <Text style={{ color: colors.icon }}>{it.percentages}%</Text>
                        </View>
                        <View style={{ height: 6, backgroundColor: colors.secondary, borderRadius: 999, overflow: 'hidden', marginTop: 2 }}>
                          <View style={{ width: `${Math.max(0, Math.min(100, it.percentages))}%`, height: '100%', backgroundColor: colors.primary }} />
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    borderWidth: 1,
    borderRadius: Radii.pill,
    padding: 4,
    gap: Spacing.xs as any,
    alignItems: 'center',
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radii.pill,
    borderWidth: 1,
    flex: 1,
    alignItems: 'center',
  },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs as any, marginLeft: Spacing.xs, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: Radii.sm },
  addBtnText: { color: '#fff', fontWeight: Typography.weight.bold },
  smallBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs as any, paddingVertical: 6, paddingHorizontal: Spacing.sm, borderRadius: Radii.sm },
  smallBtnText: { color: '#fff', fontWeight: Typography.weight.bold, fontSize: Typography.caption },
  content: { padding: Spacing.md },
  listItem: { borderWidth: 1, borderRadius: Radii.md, padding: Spacing.md, paddingBottom: Spacing.xl * 3, marginBottom: Spacing.sm, position: 'relative' },
  itemTitle: { fontSize: Typography.title, fontWeight: Typography.weight.bold },
  itemMetaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs as any, marginTop: 6 },
  itemMeta: { fontSize: Typography.caption },
  itemActions: { position: 'absolute', right: 12, top: 12 },
  recipeCard: { borderWidth: 1, borderRadius: Radii.md, padding: Spacing.md, marginTop: Spacing.xs },
  recipeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xs },
  recipeTitle: { fontSize: Typography.title, fontWeight: Typography.weight.bold },
  sectionTitle: { fontSize: Typography.body, fontWeight: Typography.weight.medium, marginTop: Spacing.xs, marginBottom: Spacing.xs },
  ingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  ingName: { fontSize: Typography.body, fontWeight: Typography.weight.medium },
  ingPercent: { width: 50, textAlign: 'right' as const },
  ingWeight: { width: 60, textAlign: 'right' as const },
  cardSubtitle: { fontSize: Typography.caption },
});
