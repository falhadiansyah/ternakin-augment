// Database types for Supabase tables

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Farm {
  id: string;
  owner_id: string;
  name: string;
  location?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface LivestockBatch {
  id: string;
  farm_id: string;
  batch_name: string;
  animal_name: string;
  animal_type: string;
  entry_date: string;
  initial_count: number;
  current_count: number;
  source_of_purchase?: string;
  total_purchase_cost: number;
  created_at: string;
  updated_at: string;
}

export interface FeedType {
  id: string;
  farm_id: string;
  name: string;
  description?: string;
  is_custom_mix: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeedIngredient {
  id: string;
  name: string;
  description?: string;
  unit: string; // kg, lbs, etc.
}

export interface FeedRecipe {
  id: string;
  feed_type_id: string;
  ingredient_id: string;
  percentage: number;
  weight_per_unit: number;
}

export interface FeedingSchedule {
  id: string;
  batch_id: string;
  feed_type_id: string;
  daily_feed_requirement: number;
  daily_water_requirement: number;
  created_at: string;
  updated_at: string;
}

export interface FinancialTransaction {
  id: string;
  farm_id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category?: string;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export interface LivestockActivity {
  id: string;
  batch_id: string;
  activity_type: 'purchase' | 'sale' | 'mortality' | 'transfer' | 'other';
  count_change: number;
  notes?: string;
  activity_date: string;
  created_at: string;
}

// Joined types for complex queries
export interface LivestockBatchWithFeed extends LivestockBatch {
  feeding_schedule?: FeedingSchedule;
  feed_type?: FeedType;
}

export interface FeedTypeWithRecipes extends FeedType {
  recipes?: (FeedRecipe & { ingredient: FeedIngredient })[];
}

export interface DashboardMetrics {
  total_livestock: number;
  total_expenses: number;
  total_income: number;
  net_profit: number;
  last_activity?: LivestockActivity;
}

// Filter types
export interface DateFilter {
  period: 'today' | 'this_month' | 'this_year';
  start_date?: string;
  end_date?: string;
}
