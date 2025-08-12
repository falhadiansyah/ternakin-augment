import { Header } from '@/components/Header';
import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { Radii, Shadows, Spacing } from '@/constants/Design';
import { Typography } from '@/constants/Typography';
import { createFeedingPlan, deleteFeedingPlan, getRecipeItems, listBatches, listFeedingPlan, listRecipes, updateFeedingPlan, type BatchRow, type FeedingPlanRow, type RecipeItemRow, type RecipeRow } from '@/lib/data';
import { showToast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface FeedingPlanForm {
  batches_id: string;
  recipes_id: string;
  age_from_week: number;
  age_to_week: number;
}

export default function FeedingPlanScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const shadow = Shadows(isDark);
  const insets = useSafeAreaInsets();

  // Get batchId from route params for filtering
  const batchId = params.batchId as string;

  const [plans, setPlans] = useState<FeedingPlanRow[]>([]);
  const [batches, setBatches] = useState<BatchRow[] | null>(null);
  const [recipes, setRecipes] = useState<RecipeRow[] | null>(null);
  const [recipeItems, setRecipeItems] = useState<Record<string, RecipeItemRow[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<FeedingPlanRow | null>(null);
  const [formData, setFormData] = useState<FeedingPlanForm>({
    batches_id: batchId || '',
    recipes_id: '',
    age_from_week: 0,
    age_to_week: 0,
  });

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

  const resetForm = () => {
    setFormData({
      batches_id: batchId || '',
      recipes_id: '',
      age_from_week: 0,
      age_to_week: 0,
    });
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (plan: FeedingPlanRow) => {
    setEditingPlan(plan);
    setFormData({
      batches_id: plan.batches_id,
      recipes_id: plan.recipes_id,
      age_from_week: plan.age_from_week || 0,
      age_to_week: plan.age_to_week || 0,
    });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingPlan(null);
    resetForm();
  };

  const validateForm = (): boolean => {
    if (!formData.batches_id) {
      showToast('Please select a batch', 'error');
      return false;
    }
    if (!formData.recipes_id) {
      showToast('Please select a recipe', 'error');
      return false;
    }
    if (formData.age_from_week < 0 || formData.age_to_week < 0) {
      showToast('Week values must be positive', 'error');
      return false;
    }
    if (formData.age_from_week > formData.age_to_week) {
      showToast('From week cannot be greater than to week', 'error');
      return false;
    }

    // Check for overlapping age ranges with existing plans for the same batch
    const existingPlans = plans.filter(plan => 
      plan.batches_id === formData.batches_id && 
      (showEditModal ? plan.id !== editingPlan?.id : true)
    );

    for (const existingPlan of existingPlans) {
      const existingFrom = existingPlan.age_from_week || 0;
      const existingTo = existingPlan.age_to_week || 0;
      
      // Check if the new range overlaps with existing range
      // Overlap occurs when: new_from <= existing_to AND new_to >= existing_from
      if (formData.age_from_week <= existingTo && formData.age_to_week >= existingFrom) {
        showToast(`Age range overlaps with existing plan (Week ${existingFrom}-${existingTo})`, 'error');
        return false;
      }
    }

    return true;
  };

  const savePlan = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      if (showEditModal && editingPlan) {
        // Update existing plan
        const { error } = await updateFeedingPlan(editingPlan.id, {
          recipes_id: formData.recipes_id,
          age_from_week: formData.age_from_week,
          age_to_week: formData.age_to_week,
        });
        
        if (error) throw error;
        showToast('Feeding plan updated successfully', 'success');
      } else {
        // Create new plan
        const { error } = await createFeedingPlan({
          batches_id: formData.batches_id,
          recipes_id: formData.recipes_id,
          age_from_week: formData.age_from_week,
          age_to_week: formData.age_to_week,
        });
        
        if (error) throw error;
        showToast('Feeding plan created successfully', 'success');
      }

      closeModals();
      await load(); // Reload data
    } catch (err: any) {
      showToast(err.message || 'Failed to save feeding plan', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deletePlan = async (plan: FeedingPlanRow) => {
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

  const getBatchName = (batchId: string) => {
    return batches?.find(b => b.id === batchId)?.name || 'Unknown Batch';
  };

  const getRecipeName = (recipeId: string) => {
    return recipes?.find(r => r.id === recipeId)?.name || 'Unknown Recipe';
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
                    {getBatchName(plan.batches_id)}
                  </Text>
                  <View style={styles.planActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: colors.primary }]}
                      onPress={() => openEditModal(plan)}
                    >
                      <Ionicons name="create-outline" size={16} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
                      onPress={() => deletePlan(plan)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.planDetails}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.icon }]}>Recipe:</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {getRecipeName(plan.recipes_id)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.icon }]}>Age Range:</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      Week {plan.age_from_week || 0} - Week {plan.age_to_week || 0}
                    </Text>
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

      {/* Add Button */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={openAddModal}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal visible={showAddModal || showEditModal} transparent animationType="fade" onRequestClose={closeModals}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {showEditModal ? 'Edit Feeding Plan' : 'Add Feeding Plan'}
            </Text>
            
            <View style={styles.formField}>
              <Text style={[styles.fieldLabel, { color: colors.icon }]}>Batch</Text>
              <View style={[styles.pickerContainer, { borderColor: colors.border, backgroundColor: colors.secondary }]}>
                <Text style={[styles.pickerText, { color: colors.text }]}>
                  {getBatchName(formData.batches_id)}
                </Text>
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={[styles.fieldLabel, { color: colors.icon }]}>Recipe</Text>
              <ScrollView style={styles.recipePicker} showsVerticalScrollIndicator={false}>
                {(recipes || []).map((recipe) => (
                  <TouchableOpacity
                    key={recipe.id}
                    style={[
                      styles.recipeOption,
                      {
                        backgroundColor: formData.recipes_id === recipe.id ? colors.primary : colors.secondary,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, recipes_id: recipe.id }))}
                  >
                    <Text style={[
                      styles.recipeOptionText,
                      { color: formData.recipes_id === recipe.id ? '#fff' : colors.text }
                    ]}>
                      {recipe.name}
                    </Text>
                    <Text style={[
                      styles.recipeOptionSubtext,
                      { color: formData.recipes_id === recipe.id ? 'rgba(255,255,255,0.8)' : colors.icon }
                    ]}>
                      {recipe.type} • {recipe.used_for}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: colors.icon }]}>From Week</Text>
                <TextInput
                  value={String(formData.age_from_week)}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, age_from_week: parseInt(text) || 0 }))}
                  keyboardType="numeric"
                  style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
                  placeholder="0"
                />
              </View>
              
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: colors.icon }]}>To Week</Text>
                <TextInput
                  value={String(formData.age_to_week)}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, age_to_week: parseInt(text) || 0 }))}
                  keyboardType="numeric"
                  style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
                  placeholder="0"
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.secondary }]}
                onPress={closeModals}
                disabled={saving}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={savePlan}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                    {showEditModal ? 'Update' : 'Create'}
                  </Text>
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
  planActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  actionButton: {
    padding: Spacing.sm,
    borderRadius: Radii.sm,
  },
  planDetails: {
    marginBottom: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  detailLabel: {
    fontSize: Typography.caption,
    fontWeight: Typography.weight.medium,
  },
  detailValue: {
    fontSize: Typography.body,
    fontWeight: Typography.weight.medium,
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
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: Typography.title,
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  formField: {
    marginBottom: Spacing.md,
  },
  formRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  fieldLabel: {
    fontSize: Typography.caption,
    fontWeight: Typography.weight.medium,
    marginBottom: Spacing.xs,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: Radii.sm,
    padding: Spacing.sm,
  },
  pickerText: {
    fontSize: Typography.body,
  },
  recipePicker: {
    maxHeight: 200,
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
  textInput: {
    borderWidth: 1,
    borderRadius: Radii.sm,
    padding: Spacing.sm,
    fontSize: Typography.body,
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
