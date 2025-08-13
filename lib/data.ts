import { supabase } from './supabase';

export type BatchRow = {
  id: string;
  farm_id: string;
  name: string;
  entry_date: string | null;
  animal: string;
  breed: string;
  starting_count: number | null;
  current_count: number | null;
  source: string | null;
  total_cost: number;
  total_income: number;
  current_age_days: number;
  current_age_weeks: number;
  created_at: string;
  updated_at: string;
};

export async function getMyProfile() {
  const { data: userRes } = await supabase.auth.getUser();
  const uid = userRes.user?.id;
  if (!uid) return { profile: null, error: null };
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', uid)
    .maybeSingle();
  if (error) return { profile: null, error };
  return { profile: (data as { user_id: string; farm_id: string | null }) || null, error: null };
}

export async function getCurrentFarmId(): Promise<{ farmId: string | null; error: any | null }> {
  const { profile, error } = await getMyProfile();
  if (error) return { farmId: null, error };
  return { farmId: profile?.farm_id ?? null, error: null };
}

export async function listBatches() {
  const { data, error } = await supabase
    .from('batches')
    .select('*')
    .order('created_at', { ascending: false });
  return { data: (data || []) as BatchRow[], error };
}

export type FeedingPlanRow = {
  id: string;
  farm_id: string;
  batches_id: string;
  recipes_id: string;
  age_from_week: number | null;
  age_to_week: number | null;
  created_at: string;
  updated_at: string;
  recipes?: { name: string } | null;
};

export async function listFeedingPlan() {
  const { data, error } = await supabase
    .from('feeding_plan')
    .select('id, farm_id, batches_id, recipes_id, age_from_week, age_to_week, created_at, updated_at, recipes:recipes_id(name)')
    .order('created_at', { ascending: false });
  return { data: ((data || []) as unknown) as FeedingPlanRow[], error };
}

export type RecipeRow = {
  id: string;
  farm_id: string;
  name: string;
  type: string;
  used_for: string;
  total_price_kg: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type RecipeItemRow = {
  item_id: string;
  parent_id: string;
  name: string;
  percentages: number;
  price_kg: number;
};

export async function listRecipes() {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false });
  return { data: (data || []) as RecipeRow[], error };
}

export type CashbookRow = {
  id: string;
  farm_id: string;
  debit: number;
  credit: number;
  balance: number;
  transaction_date: string | null;
  type: string | null;
  notes: string | null;
  batches_id: string | null;
  created_at: string;
  updated_at: string;
};

export async function listTransactions(limit = 20) {
  const { farmId, error: fe } = await getCurrentFarmId();
  if (fe) return { data: null, error: fe };
  if (!farmId) return { data: null, error: new Error('No farm assigned to your profile') };
  const { data, error } = await supabase
    .from('finance_cashbook')
    .select('*')
    .eq('farm_id', farmId)
    .order('transaction_date', { ascending: false })
    .limit(limit);
  return { data: (data || []) as CashbookRow[], error };
}

export async function getBalance() {
  const { farmId, error: fe } = await getCurrentFarmId();
  if (fe) return { data: null, error: fe };
  if (!farmId) return { data: null, error: new Error('No farm assigned to your profile') };
  const { data, error } = await supabase
    .from('balance')
    .select('*')
    .eq('farm_id', farmId)
    .single();
  return { data: data as { total_balance: number; total_debit: number; total_credit: number } | null, error };
}

// Fetch single rows
export async function getBatchById(id: string) {
  const { data, error } = await supabase.from('batches').select('*').eq('id', id).single();
  return { data: data as BatchRow | null, error };
}
export async function getRecipeById(id: string) {
  const { data, error } = await supabase.from('recipes').select('*').eq('id', id).single();
  return { data: data as RecipeRow | null, error };
}
export async function getRecipeItems(parentId: string) {
  const { data, error } = await supabase.from('recipes_items').select('*').eq('parent_id', parentId);
  return { data: (data || []) as RecipeItemRow[], error };
}
export async function getTransactionById(id: string) {
  const { data, error } = await supabase.from('finance_cashbook').select('*').eq('id', id).single();
  return { data: data as CashbookRow | null, error };
}

// Create helpers
export async function createBatch(payload: { name: string; entry_date?: string | null; starting_count?: number | null; source?: string | null; animal?: string; breed?: string; }) {
  const { farmId, error: fe } = await getCurrentFarmId();
  if (fe) return { data: null, error: fe };
  if (!farmId) return { data: null, error: new Error('No farm assigned to your profile') };
  const { data, error } = await supabase.from('batches').insert({
    farm_id: farmId,
    name: payload.name,
    entry_date: payload.entry_date ?? null,
    starting_count: payload.starting_count ?? null,
    current_count: payload.starting_count ?? null, // Auto-populate current_count with starting_count
    source: payload.source ?? null,
    animal: payload.animal ?? 'chicken',
    breed: payload.breed ?? 'kub_2',
  }).select('*').single();
  return { data: data as BatchRow | null, error };
}

export async function createRecipe(payload: { name: string; type?: string; used_for?: string; total_price_kg?: number | null; description?: string | null; }) {
  const { farmId, error: fe } = await getCurrentFarmId();
  if (fe) return { data: null, error: fe };
  if (!farmId) return { data: null, error: new Error('No farm assigned to your profile') };
  const { data, error } = await supabase.from('recipes').insert({
    farm_id: farmId,
    name: payload.name,
    type: payload.type ?? 'custom',
    used_for: payload.used_for ?? 'grower',
    total_price_kg: payload.total_price_kg ?? null,
    description: payload.description ?? null,
  }).select('*').single();
  return { data: data as RecipeRow | null, error };
}

export async function createTransaction(payload: { debit?: number; credit?: number; transaction_date?: string | null; type?: string | null; notes?: string | null; batches_id?: string | null; }) {
  const { farmId, error: fe } = await getCurrentFarmId();
  if (fe) return { data: null, error: fe };
  if (!farmId) return { data: null, error: new Error('No farm assigned to your profile') };

  // Get current balance for the farm
  const { data: currentBalance, error: balanceError } = await supabase
    .from('balance')
    .select('total_balance, total_debit, total_credit')
    .eq('farm_id', farmId)
    .single();

  let previousBalance = 0;
  if (currentBalance) {
    previousBalance = currentBalance.total_balance || 0;
  }

  // Calculate new balance
  const debit = payload.debit ?? 0;
  const credit = payload.credit ?? 0;
  const newBalance = previousBalance + debit - credit;

  // Insert transaction with calculated balance
  const { data, error } = await supabase.from('finance_cashbook').insert({
    farm_id: farmId,
    debit: debit,
    credit: credit,
    balance: newBalance,
    transaction_date: payload.transaction_date ?? null,
    type: payload.type ?? null,
    notes: payload.notes ?? null,
    batches_id: payload.batches_id ?? null,
  }).select('*').single();

  if (error) return { data: null, error };

  // Update or create balance record
  const { error: balanceUpdateError } = await supabase
    .from('balance')
    .upsert({
      farm_id: farmId,
      total_debit: (currentBalance?.total_debit || 0) + debit,
      total_credit: (currentBalance?.total_credit || 0) + credit,
      total_balance: newBalance,
    }, {
      onConflict: 'farm_id'
    });

  if (balanceUpdateError) {
    console.error('Failed to update balance:', balanceUpdateError);
  }

  return { data: data as CashbookRow | null, error };
}

// Update helpers
export async function updateBatch(id: string, payload: Partial<Pick<BatchRow, 'name' | 'entry_date' | 'animal' | 'breed' | 'starting_count' | 'source'>>) {
  const { data, error } = await supabase.from('batches').update(payload).eq('id', id).select('*').single();
  return { data: data as BatchRow | null, error };
}
export async function updateRecipe(id: string, payload: Partial<Pick<RecipeRow, 'name' | 'type' | 'used_for' | 'total_price_kg' | 'description'>>) {
  const { data, error } = await supabase.from('recipes').update(payload).eq('id', id).select('*').single();
  return { data: data as RecipeRow | null, error };
}
export async function updateTransaction(id: string, payload: Partial<Pick<CashbookRow, 'debit' | 'credit' | 'transaction_date' | 'type' | 'notes' | 'batches_id'>>) {
  const { farmId, error: fe } = await getCurrentFarmId();
  if (fe) return { data: null, error: fe };
  if (!farmId) return { data: null, error: new Error('No farm assigned to your profile') };

  // Get the original transaction to calculate balance difference
  const { data: originalTransaction, error: originalError } = await supabase
    .from('finance_cashbook')
    .select('debit, credit')
    .eq('id', id)
    .single();

  if (originalError) return { data: null, error: originalError };

  // Get current balance
  const { data: currentBalance, error: balanceError } = await supabase
    .from('balance')
    .select('total_debit, total_credit, total_balance')
    .eq('farm_id', farmId)
    .single();

  if (balanceError) return { data: null, error: balanceError };

  // Calculate balance adjustments
  const oldDebit = originalTransaction.debit || 0;
  const oldCredit = originalTransaction.credit || 0;
  const newDebit = payload.debit ?? oldDebit;
  const newCredit = payload.credit ?? oldCredit;

  const debitDiff = newDebit - oldDebit;
  const creditDiff = newCredit - oldCredit;
  const balanceDiff = debitDiff - creditDiff;

  // Update transaction
  const { data, error } = await supabase
    .from('finance_cashbook')
    .update({
      ...payload,
      balance: (currentBalance?.total_balance || 0) + balanceDiff
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) return { data: null, error };

  // Update balance record
  const { error: balanceUpdateError } = await supabase
    .from('balance')
    .update({
      total_debit: (currentBalance?.total_debit || 0) + debitDiff,
      total_credit: (currentBalance?.total_credit || 0) + creditDiff,
      total_balance: (currentBalance?.total_balance || 0) + balanceDiff,
    })
    .eq('farm_id', farmId);

  if (balanceUpdateError) {
    console.error('Failed to update balance:', balanceUpdateError);
  }

  return { data: data as CashbookRow | null, error };
}

// Recipe items helpers
export async function replaceRecipeItems(parentId: string, items: Array<{ name: string; percentages: number; price_kg: number }>) {
  // delete existing
  const { error: de } = await supabase.from('recipes_items').delete().eq('parent_id', parentId);
  if (de) return { error: de };
  if (!items || items.length === 0) {
    // When no items, clear total_price_kg
    const { error: ue } = await supabase.from('recipes').update({ total_price_kg: null }).eq('id', parentId);
    return { error: ue || null } as { error: any | null };
  }
  const { error } = await supabase.from('recipes_items').insert(
    items.map(i => ({ parent_id: parentId, name: i.name, percentages: i.percentages, price_kg: i.price_kg }))
  );
  if (error) return { error };
  // Recompute and persist total_price_kg after items are replaced
  const { error: re } = await recomputeRecipeTotalPriceKg(parentId);
  return { error: re || null } as { error: any | null };
}

// Recompute total_price_kg for a recipe based on its items
export async function recomputeRecipeTotalPriceKg(parentId: string): Promise<{ value: number | null; error: any | null }> {
  const { data: items, error } = await supabase
    .from('recipes_items')
    .select('percentages, price_kg')
    .eq('parent_id', parentId);
  if (error) return { value: null, error };
  const arr = items || [];
  if (arr.length === 0) {
    const { error: ue } = await supabase.from('recipes').update({ total_price_kg: null }).eq('id', parentId);
    return { value: null, error: ue || null };
  }
  // Only compute when all items have valid numeric values
  const allValid = arr.every((it) => isFinite(Number(it.percentages)) && isFinite(Number(it.price_kg)));
  if (!allValid) {
    const { error: ue } = await supabase.from('recipes').update({ total_price_kg: null }).eq('id', parentId);
    return { value: null, error: ue || null };
  }
  const total = arr.reduce((sum, it: any) => {
    const p = Number(it.percentages) || 0;
    const price = Number(it.price_kg) || 0;
    return sum + (p / 100) * price;
  }, 0);
  const value = Number(total.toFixed(4));
  const { error: ue } = await supabase.from('recipes').update({ total_price_kg: value }).eq('id', parentId);
  return { value, error: ue || null };
}

// Delete helpers
export async function deleteBatch(id: string) {
  const { error } = await supabase.from('batches').delete().eq('id', id);
  return { error };
}
export async function deleteRecipe(id: string) {
  // delete children first
  const { error: de } = await supabase.from('recipes_items').delete().eq('parent_id', id);
  if (de) return { error: de };
  const { error } = await supabase.from('recipes').delete().eq('id', id);
  return { error };
}
export async function deleteTransaction(id: string) {
  const { farmId, error: fe } = await getCurrentFarmId();
  if (fe) return { error: fe };
  if (!farmId) return { error: new Error('No farm assigned to your profile') };

  // Get the transaction to calculate balance adjustment
  const { data: transaction, error: transactionError } = await supabase
    .from('finance_cashbook')
    .select('debit, credit')
    .eq('id', id)
    .single();

  if (transactionError) return { error: transactionError };

  // Get current balance
  const { data: currentBalance, error: balanceError } = await supabase
    .from('balance')
    .select('total_debit, total_credit, total_balance')
    .eq('farm_id', farmId)
    .single();

  if (balanceError) return { error: balanceError };

  // Delete transaction
  const { error } = await supabase.from('finance_cashbook').delete().eq('id', id);
  if (error) return { error };

  // Update balance record
  const debit = transaction.debit || 0;
  const credit = transaction.credit || 0;
  const balanceDiff = debit - credit;

  const { error: balanceUpdateError } = await supabase
    .from('balance')
    .update({
      total_debit: (currentBalance?.total_debit || 0) - debit,
      total_credit: (currentBalance?.total_credit || 0) - credit,
      total_balance: (currentBalance?.total_balance || 0) - balanceDiff,
    })
    .eq('farm_id', farmId);

  if (balanceUpdateError) {
    console.error('Failed to update balance:', balanceUpdateError);
  }

  return { error: null };
}

// Growth/master data types and helpers
export type GrowthRow = {
  id: string;
  animal: string;
  breed: string;
  age_in_week: number | null;
  feed_gr: number | null;
  water_ml: number | null;
  weight_male: number | null;
  weight_female: number | null;
  temperature: number | null;
  lightning: string | null;
  vaccine: string | null;
};

export async function getGrowthRow(animal: string, breed: string, ageInWeek: number) {
  const { data, error } = await supabase
    .from('master_growth')
    .select('id, animal, breed, age_in_week, feed_gr, water_ml, weight_male, weight_female, temperature, lightning, vaccine')
    .eq('animal', animal)
    .eq('breed', breed)
    .eq('age_in_week', ageInWeek)
    .maybeSingle();
  return { data: (data as GrowthRow | null) || null, error };
}

function computeAge(entryDate: string | null): { days: number; weeks: number } {
  if (!entryDate) return { days: 0, weeks: 0 };
  // Parse as UTC midnight to avoid TZ drift
  const start = new Date(entryDate + 'T00:00:00Z');
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  // Entry date counts as day 1
  const rawDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  const days = Math.max(1, rawDays);
  const weeks = Math.max(0, Math.floor(days / 7));
  return { days, weeks };
}

/**
 * Recompute age for all batches and persist only when changed.
 * Intended to be called on entry to Livestock/Feeding pages.
 */
export async function recomputeAndUpdateBatchAges(): Promise<{ updated: number; errors: number }> {
  const { data: batches, error } = await listBatches();
  if (error) return { updated: 0, errors: 1 };
  let updated = 0;
  let errors = 0;
  for (const b of batches) {
    const { days, weeks } = computeAge(b.entry_date);
    if (days !== (b.current_age_days || 0) || weeks !== (b.current_age_weeks || 0)) {
      const { error: ue } = await supabase
        .from('batches')
        .update({ current_age_days: days, current_age_weeks: weeks })
        .eq('id', b.id);
      if (ue) errors += 1; else updated += 1;
    }
  }
  return { updated, errors };
}


// Fallback growth helpers
export async function getMaxGrowthWeek(animal: string, breed: string): Promise<number | null> {
  const { data, error } = await supabase
    .from('master_growth')
    .select('age_in_week')
    .eq('animal', animal)
    .eq('breed', breed)
    .order('age_in_week', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return (data?.age_in_week as number | null) ?? null;
}

export async function getGrowthRowWithFallback(animal: string, breed: string, ageInWeek: number) {
  const targetWeek = ageInWeek < 1 ? 1 : ageInWeek;
  // Try exact first
  const exact = await getGrowthRow(animal, breed, targetWeek);
  if (exact.data) return exact;
  // If above max, fall back to max available
  const maxWeek = await getMaxGrowthWeek(animal, breed);
  if (maxWeek != null) {
    return await getGrowthRow(animal, breed, maxWeek);
  }
  // Nothing available
  return { data: null, error: null };
}

// Feeding plan helpers
export async function createFeedingPlan(payload: { batches_id: string; recipes_id: string; age_from_week?: number | null; age_to_week?: number | null; }) {
  const { farmId, error: fe } = await getCurrentFarmId();
  if (fe) return { data: null, error: fe };
  if (!farmId) return { data: null, error: new Error('No farm assigned to your profile') };
  const { data, error } = await supabase.from('feeding_plan').insert({
    farm_id: farmId,
    batches_id: payload.batches_id,
    recipes_id: payload.recipes_id,
    age_from_week: payload.age_from_week ?? null,
    age_to_week: payload.age_to_week ?? null,
  }).select('*').single();
  return { data: data as FeedingPlanRow | null, error };
}


export async function updateFeedingPlan(id: string, payload: Partial<{ recipes_id: string; age_from_week: number | null; age_to_week: number | null; }>) {
  const { data, error } = await supabase.from('feeding_plan').update(payload).eq('id', id).select('*').single();
  return { data: data as FeedingPlanRow | null, error };
}

export async function deleteFeedingPlan(id: string) {
  const { error } = await supabase.from('feeding_plan').delete().eq('id', id);
  return { error };
}
