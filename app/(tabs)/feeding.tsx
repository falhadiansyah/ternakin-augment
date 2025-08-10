import { Header } from '@/components/Header';
import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { Radii, Shadows, Spacing } from '@/constants/Design';
import { Typography } from '@/constants/Typography';
import { getRecipeItems, listFeedingPlan, listRecipes, type FeedingPlanRow, type RecipeItemRow, type RecipeRow } from '@/lib/data';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FeedingScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const shadow = Shadows(isDark);

  const [range, setRange] = useState<'schedule' | 'recipes'>('schedule');
  const [plans, setPlans] = useState<FeedingPlanRow[] | null>(null);
  const [recipes, setRecipes] = useState<RecipeRow[] | null>(null);
  const [recipeItems, setRecipeItems] = useState<Record<string, RecipeItemRow[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [{ data: p, error: pe }, { data: r, error: re }] = await Promise.all([
      listFeedingPlan(),
      listRecipes(),
    ]);
    if (pe) setError(pe.message); else setError(null);
    if (re) setError(re.message);
    setPlans(p || []);
    setRecipes(r || []);
    // load items for each recipe (best-effort)
    const itemsMap: Record<string, RecipeItemRow[]> = {};
    for (const rec of (r || [])) {
      const { data: items } = await getRecipeItems(rec.id);
      itemsMap[rec.id] = items || [];
    }
    setRecipeItems(itemsMap);
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
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: Spacing.xl }}
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

          {range === 'recipes' && (
            <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} activeOpacity={0.8}
              onPress={() => {
                const { router } = require('expo-router');
                router.push('/recipe/form');
              }}>
              <Ionicons name="add" color="#fff" size={16} />
              <Text style={styles.addBtnText}>Add Recipe</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {loading && (
            <View style={{ padding: Spacing.md, alignItems: 'center' }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          )}
          {error && <Text style={{ color: colors.error, marginBottom: Spacing.sm }}>Failed to load: {error}</Text>}

          {range === 'schedule' ? (
            // Schedule list
            <>
              {(plans || []).map((p) => (
                <View key={p.id} style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }, shadow]}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{p.recipes?.name ?? 'Recipe'}</Text>
                  <View style={styles.itemMetaRow}>
                    <Ionicons name="scale-outline" size={14} color={colors.icon} />
                    <Text style={[styles.itemMeta, { color: colors.icon }]}>Age: {p.age_from_week ?? 0}-{p.age_to_week ?? 0} w</Text>
                  </View>
                  <View style={styles.itemActions}>
                    <Ionicons name="trash-outline" size={18} color={colors.icon} />
                  </View>
                </View>
              ))}
            </>
          ) : (
            // Recipes list/detail
            <>
              {(recipes || []).map((r) => (
                <View key={r.id} style={[styles.recipeCard, { backgroundColor: colors.card, borderColor: colors.border }, shadow]}>
                  <View style={styles.recipeHeader}>
                    <Text style={[styles.recipeTitle, { color: colors.text }]}>{r.name}</Text>
                    <TouchableOpacity onPress={() => {
                      const { router } = require('expo-router');
                      router.push({ pathname: '/recipe/form', params: { id: r.id } });
                    }}>
                      <Ionicons name="create-outline" size={18} color={colors.icon} />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.cardSubtitle, { color: colors.icon }]}>Type: {r.type} • Used: {r.used_for}</Text>
                  {r.total_price_kg != null && (
                    <Text style={[styles.cardSubtitle, { color: colors.icon }]}>${r.total_price_kg.toLocaleString()} / kg</Text>
                  )}
                  {/* Ingredients breakdown */}
                  <View style={{ marginTop: 6 }}>
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
  content: { padding: Spacing.md },
  listItem: { borderWidth: 1, borderRadius: Radii.md, padding: Spacing.md, marginBottom: Spacing.sm },
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
