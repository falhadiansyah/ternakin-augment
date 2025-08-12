import { Header } from '@/components/Header';
import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { Radii, Shadows, Spacing } from '@/constants/Design';
import { Typography } from '@/constants/Typography';
import { createFeedingPlan, deleteFeedingPlan, getRecipeItems, listBatches, listFeedingPlan, listRecipes, updateFeedingPlan, type BatchRow, type FeedingPlanRow, type RecipeItemRow, type RecipeRow } from '@/lib/data';
import { showToast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface EditableFeedingPlan extends FeedingPlanRow {
  isNew?: boolean;
  isEditing?: boolean;
}

export default function FeedingPlanScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const shadow = Shadows(isDark);
  const insets = useSafeAreaInsets();

  // Get batchId from route params for filtering
  const batchId = router.params?.batchId as string;

  const [plans, setPlans] = useState<EditableFeedingPlan[]>([]);
  const [batches, setBatches] = useState<BatchRow[] | null>(null);
  const [recipes, setRecipes] = useState<RecipeRow[] | null>(null);
  const [recipeItems, setRecipeItems] = useState<Record<string, RecipeItemRow[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showRecipePicker, setShowRecipePicker] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [{ data: p, error: pe }, { data: r, error: re }, { data: b, error: be }] = await Promise.all([
        listFeedingPlan(),
        listRecipes(),
        listBatches(),
      ]);
      
      if (pe) throw pe;
      if (re) throw re;
      if (be) throw be;

      // Filter plans by batchId if provided
      const filteredPlans = batchId ? (p || []).filter(plan => plan.batches_id === batchId) : (p || []);
      setPlans(filteredPlans);
      setRecipes(r || []);
      setBatches(b || []);
      setError(null);

      // Load recipe items
      const itemsMap: Record<string, RecipeItemRow[]> = {};
      for (const rec of (r || [])) {
        const { data: items } = await getRecipeItems(rec.id);
        itemsMap[rec.id] = items || [];
      }
      setRecipeItems(itemsMap);
    } catch (err: any) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const addNewPlan = () => {
    const newPlan: EditableFeedingPlan = {
      id: `new-${Date.now()}`,
      farm_id: '',
      batches_id: batchId || '', // Auto-set batchId if provided
      recipes_id: '',
      age_from_week: 0,
      age_to_week: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isNew: true,
      isEditing: true,
    };
    setPlans(prev => [...prev, newPlan]);
  };

  const updatePlan = (id: string, updates: Partial<EditableFeedingPlan>) => {
    setPlans(prev => prev.map(plan => 
      plan.id === id ? { ...plan, ...updates } : plan
    ));
  };

  const deletePlan = async (plan: EditableFeedingPlan) => {
    if (plan.isNew) {
      setPlans(prev => prev.filter(p => p.id !== plan.id));
      return;
    }

    Alert.alert(
      'Delete Feeding Plan',
      'Are you sure you want to delete this feeding plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await deleteFeedingPlan(plan.id);
              if (error) throw error;
              showToast('Feeding plan deleted successfully', 'success');
              await load();
            } catch (err: any) {
              showToast(err.message || 'Failed to delete feeding plan', 'error');
            }
          },
        },
      ]
    );
  };

  const saveAllChanges = async () => {
    try {
      setSaving(true);
      
      // Save new plans
      const newPlans = plans.filter(p => p.isNew);
      for (const plan of newPlans) {
        if (!plan.batches_id || !plan.recipes_id) {
          showToast('Please fill in all required fields', 'error');
          return;
        }
        
        const { error } = await createFeedingPlan({
          batches_id: plan.batches_id,
          recipes_id: plan.recipes_id,
          age_from_week: plan.age_from_week || 0,
          age_to_week: plan.age_to_week || 0,
        });
        
        if (error) throw error;
      }

      // Update existing plans
      const existingPlans = plans.filter(p => !p.isNew && p.isEditing);
      for (const plan of existingPlans) {
        const { error } = await updateFeedingPlan(plan.id, {
          recipes_id: plan.recipes_id,
          age_from_week: plan.age_from_week || 0,
          age_to_week: plan.age_to_week || 0,
        });
        
        if (error) throw error;
      }

      showToast('All changes saved successfully', 'success');
      await load();
    } catch (err: any) {
      showToast(err.message || 'Failed to save changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getBatchName = (batchId: string) => {
    return batches?.find(b => b.id === batchId)?.name || 'Select Batch';
  };

  const getRecipeName = (recipeId: string) => {
    return recipes?.find(r => r.id === recipeId)?.name || 'Select Recipe';
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Feeding Plans" showBackButton onBackPress={() => router.back()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Feeding Plans" showBackButton onBackPress={() => router.back()} />
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={{ paddingBottom: Spacing.xl + insets.bottom }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.content}>
          {error && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              Failed to load: {error}
            </Text>
          )}

          {plans.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="nutrition-outline" size={48} color={colors.icon} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Feeding Plans</Text>
              <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
                Add your first feeding plan below
              </Text>
            </View>
          ) : (
            plans.map((plan) => (
              <View key={plan.id} style={[styles.planCard, { backgroundColor: colors.card, borderColor: colors.border }, shadow]}>
                <View style={styles.planHeader}>
                  <Text style={[styles.planTitle, { color: colors.text }]}>
                    {plan.isNew ? 'New Feeding Plan' : getBatchName(plan.batches_id)}
                  </Text>
                  <TouchableOpacity 
                    style={[styles.deleteButton, { backgroundColor: '#ef4444' }]}
                    onPress={() => deletePlan(plan)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>

                                 {/* Inline form fields */}
                 <View style={styles.formFields}>
                   <View style={styles.fieldRow}>
                     <View style={styles.field}>
                       <Text style={[styles.fieldLabel, { color: colors.icon }]}>Batch</Text>
                       <Text style={[styles.pickerText, { color: colors.text, padding: Spacing.sm, backgroundColor: colors.secondary, borderRadius: Radii.sm }]}>
                         {getBatchName(plan.batches_id)}
                       </Text>
                     </View>
                     
                     <View style={styles.field}>
                       <Text style={[styles.fieldLabel, { color: colors.icon }]}>Recipe</Text>
                                                <TouchableOpacity 
                           style={[styles.pickerButton, { borderColor: colors.border, backgroundColor: colors.secondary }]}
                           onPress={() => setShowRecipePicker(plan.id)}
                         >
                         <Text style={[styles.pickerText, { color: colors.text }]}>
                           {getRecipeName(plan.recipes_id)}
                         </Text>
                         <Ionicons name="chevron-down" size={16} color={colors.icon} />
                       </TouchableOpacity>
                     </View>
                   </View>

                  <View style={styles.fieldRow}>
                    <View style={styles.field}>
                      <Text style={[styles.fieldLabel, { color: colors.icon }]}>From Week</Text>
                      <TextInput 
                        value={String(plan.age_from_week || '')}
                        onChangeText={(text) => updatePlan(plan.id, { age_from_week: parseInt(text) || 0 })}
                        keyboardType="numeric"
                        style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
                        placeholder="0"
                      />
                    </View>
                    
                    <View style={styles.field}>
                      <Text style={[styles.fieldLabel, { color: colors.icon }]}>To Week</Text>
                      <TextInput 
                        value={String(plan.age_to_week || '')}
                        onChangeText={(text) => updatePlan(plan.id, { age_to_week: parseInt(text) || 0 })}
                        keyboardType="numeric"
                        style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
                        placeholder="0"
                      />
                    </View>
                  </View>
                </View>

                {/* Recipe ingredients preview */}
                {plan.recipes_id && recipeItems[plan.recipes_id] && (
                  <View style={styles.ingredientsPreview}>
                    <Text style={[styles.ingredientsTitle, { color: colors.icon }]}>Ingredients:</Text>
                    {(recipeItems[plan.recipes_id] || []).slice(0, 3).map((item, idx) => (
                      <View key={idx} style={styles.ingredientItem}>
                        <Text style={[styles.ingredientName, { color: colors.text }]} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={[styles.ingredientPercent, { color: colors.icon }]}>
                          {item.percentages}%
                        </Text>
                      </View>
                    ))}
                    {(recipeItems[plan.recipes_id] || []).length > 3 && (
                      <Text style={[styles.moreIngredients, { color: colors.icon }]}>
                        +{(recipeItems[plan.recipes_id] || []).length - 3} more ingredients
                      </Text>
                    )}
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Bottom action buttons */}
      <View style={[styles.bottomActions, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.secondary, borderColor: colors.border }]}
          onPress={addNewPlan}
        >
          <Ionicons name="add" size={20} color={colors.text} />
          <Text style={[styles.actionButtonText, { color: colors.text }]}>Add Row</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={saveAllChanges}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="save" size={20} color="#fff" />
          )}
          <Text style={[styles.actionButtonText, { color: '#fff' }]}>
            {saving ? 'Saving...' : 'Save All'}
          </Text>
                 </TouchableOpacity>
       </View>

       {/* Recipe Picker Modal */}
       {showRecipePicker && (
         <View style={styles.modalOverlay}>
           <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
             <Text style={[styles.modalTitle, { color: colors.text }]}>Select Recipe</Text>
             <ScrollView style={styles.recipeList}>
               {(recipes || []).map((recipe) => (
                 <TouchableOpacity
                   key={recipe.id}
                   style={[styles.recipeOption, { borderColor: colors.border }]}
                   onPress={() => {
                     updatePlan(showRecipePicker, { recipes_id: recipe.id });
                     setShowRecipePicker(null);
                   }}
                 >
                   <Text style={[styles.recipeOptionText, { color: colors.text }]}>{recipe.name}</Text>
                   <Text style={[styles.recipeOptionSubtext, { color: colors.icon }]}>{recipe.type} • {recipe.used_for}</Text>
                 </TouchableOpacity>
               ))}
             </ScrollView>
             <TouchableOpacity
               style={[styles.modalButton, { backgroundColor: colors.secondary }]}
               onPress={() => setShowRecipePicker(null)}
             >
               <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
             </TouchableOpacity>
           </View>
         </View>
       )}
     </SafeAreaView>
   );
 }

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: { padding: Spacing.md },
  errorText: { marginBottom: Spacing.md, textAlign: 'center' },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: Typography.title,
    fontWeight: Typography.weight.bold,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontSize: Typography.body,
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  planCard: {
    borderWidth: 1,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  planTitle: {
    fontSize: Typography.title,
    fontWeight: Typography.weight.bold,
  },
  deleteButton: {
    padding: Spacing.sm,
    borderRadius: Radii.sm,
  },
  formFields: {
    gap: Spacing.md,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  field: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: Typography.caption,
    marginBottom: Spacing.xs,
    fontWeight: Typography.weight.medium,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.sm,
    borderRadius: Radii.sm,
    borderWidth: 1,
  },
  pickerText: {
    fontSize: Typography.body,
    flex: 1,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: Radii.sm,
    padding: Spacing.sm,
    fontSize: Typography.body,
  },
  ingredientsPreview: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: Spacing.sm,
    marginTop: Spacing.sm,
  },
  ingredientsTitle: {
    fontSize: Typography.caption,
    fontWeight: Typography.weight.medium,
    marginBottom: Spacing.xs,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ingredientName: {
    fontSize: Typography.caption,
    flex: 1,
  },
  ingredientPercent: {
    fontSize: Typography.caption,
    fontWeight: Typography.weight.medium,
  },
  moreIngredients: {
    fontSize: Typography.caption,
    fontStyle: 'italic',
    marginTop: 4,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: Radii.sm,
    borderWidth: 1,
  },
     actionButtonText: {
     fontSize: Typography.body,
     fontWeight: Typography.weight.medium,
   },
   modalOverlay: {
     position: 'absolute',
     top: 0,
     left: 0,
     right: 0,
     bottom: 0,
     backgroundColor: 'rgba(0,0,0,0.5)',
     justifyContent: 'center',
     alignItems: 'center',
     zIndex: 1000,
   },
   modalContent: {
     width: '80%',
     maxHeight: '70%',
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
   recipeList: {
     maxHeight: 300,
   },
   recipeOption: {
     borderWidth: 1,
     borderRadius: Radii.sm,
     padding: Spacing.sm,
     marginBottom: Spacing.xs,
   },
   recipeOptionText: {
     fontSize: Typography.body,
     fontWeight: Typography.weight.medium,
   },
   recipeOptionSubtext: {
     fontSize: Typography.caption,
     marginTop: 2,
   },
   modalButton: {
     padding: Spacing.sm,
     borderRadius: Radii.sm,
     alignItems: 'center',
     marginTop: Spacing.md,
   },
   modalButtonText: {
     fontSize: Typography.body,
     fontWeight: Typography.weight.medium,
   },
 });
