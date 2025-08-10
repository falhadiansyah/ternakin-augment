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

