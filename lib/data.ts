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
  const { data, error } = await supabase
    .from('finance_cashbook')
    .select('*')
    .order('transaction_date', { ascending: false })
    .limit(limit);
  return { data: (data || []) as CashbookRow[], error };
}

export async function getBalance() {
  const { data, error } = await supabase
    .from('balance')
    .select('*')
    .limit(1)
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
  const { data, error } = await supabase.from('finance_cashbook').insert({
    farm_id: farmId,
    debit: payload.debit ?? 0,
    credit: payload.credit ?? 0,
    balance: 0,
    transaction_date: payload.transaction_date ?? null,
    type: payload.type ?? null,
    notes: payload.notes ?? null,
    batches_id: payload.batches_id ?? null,
  }).select('*').single();
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
  const { data, error } = await supabase.from('finance_cashbook').update(payload).eq('id', id).select('*').single();
  return { data: data as CashbookRow | null, error };
}

// Recipe items helpers
export async function replaceRecipeItems(parentId: string, items: Array<{ name: string; percentages: number; price_kg: number }>) {
  // delete existing
  const { error: de } = await supabase.from('recipes_items').delete().eq('parent_id', parentId);
  if (de) return { error: de };
  if (!items || items.length === 0) return { error: null };
  const { error } = await supabase.from('recipes_items').insert(
    items.map(i => ({ parent_id: parentId, name: i.name, percentages: i.percentages, price_kg: i.price_kg }))
  );
  return { error };
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
  const { error } = await supabase.from('finance_cashbook').delete().eq('id', id);
  return { error };
}

