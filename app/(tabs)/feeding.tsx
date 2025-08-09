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

export default function FeedingScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const shadow = Shadows(isDark);

  const [range, setRange] = useState<'schedule' | 'recipes'>('schedule');

  const feedSchedules = [
    { name: 'Broiler Starter Mix', total: '5 kg', feed: 'Daily Feed' },
    { name: 'Cattle Grain Mix', total: '120 L', feed: 'Daily Water' },
  ];

  const recipe = {
    title: 'Broiler Starter Mix',
    total: '100kg',
    ingredients: [
      { name: 'Corn', percent: 50, weight: '50kg' },
      { name: 'Soybean Meal', percent: 30, weight: '30kg' },
      { name: 'Fish Meal', percent: 15, weight: '15kg' },
      { name: 'Vitamins', percent: 5, weight: '5kg' },
    ],
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={t('nav.feeding')} />
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: Spacing.xl }}>
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
            <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} activeOpacity={0.8}>
              <Ionicons name="add" color="#fff" size={16} />
              <Text style={styles.addBtnText}>Add Recipe</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {range === 'schedule' ? (
            // Schedule list
            <>
              {feedSchedules.map((item) => (
                <View key={item.name} style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }, shadow]}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{item.name}</Text>
                  <View style={styles.itemMetaRow}>
                    <Ionicons name="scale-outline" size={14} color={colors.icon} />
                    <Text style={[styles.itemMeta, { color: colors.icon }]}>{item.total}</Text>
                    <Ionicons name="time-outline" size={14} color={colors.icon} style={{ marginLeft: Spacing.sm }} />
                    <Text style={[styles.itemMeta, { color: colors.icon }]}>{item.feed}</Text>
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
              <View style={[styles.recipeCard, { backgroundColor: colors.card, borderColor: colors.border }, shadow]}>
                <View style={styles.recipeHeader}>
                  <Text style={[styles.recipeTitle, { color: colors.text }]}>{recipe.title}</Text>
                  <Text style={[styles.cardSubtitle, { color: colors.icon }]}>Total: {recipe.total}</Text>
                </View>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>Ingredients Breakdown</Text>
                {recipe.ingredients.map((ing) => (
                  <View key={ing.name} style={styles.ingRow}>
                    <Text style={[styles.ingName, { color: colors.text }]}>{ing.name}</Text>
                    <Text style={[styles.ingPercent, { color: colors.icon }]}>{ing.percent}%</Text>
                    <Text style={[styles.ingWeight, { color: colors.icon }]}>{ing.weight}</Text>
                  </View>
                ))}
              </View>

              <View style={[styles.recipeCard, { backgroundColor: colors.card, borderColor: colors.border }, shadow]}>
                <View style={styles.recipeHeader}>
                  <Text style={[styles.recipeTitle, { color: colors.text }]}>Layer Feed Premium</Text>
                  <Text style={[styles.cardSubtitle, { color: colors.icon }]}>Total: 100kg</Text>
                </View>
              </View>
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
