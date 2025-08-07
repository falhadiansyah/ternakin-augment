import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Web polyfill for AsyncStorage
const createWebStorage = () => {
  return {
    getItem: (key: string) => {
      if (typeof localStorage === 'undefined') {
        return null;
      }
      return localStorage.getItem(key);
    },
    setItem: (key: string, value: string) => {
      if (typeof localStorage === 'undefined') {
        return;
      }
      localStorage.setItem(key, value);
    },
    removeItem: (key: string) => {
      if (typeof localStorage === 'undefined') {
        return;
      }
      localStorage.removeItem(key);
    },
  };
};

// TODO: Replace with your actual Supabase URL and anon key
// For development, you can use these placeholder values
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://eggmfboszygzbitsjhso.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZ21mYm9zenlnemJpdHNqaHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MzA5MTYsImV4cCI6MjA3MDEwNjkxNn0.roGbFDK6A1SFAFQvzYue6Q8CWbE60hP8XA62w6HoO24';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? createWebStorage() : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper functions for common database operations
export const supabaseHelpers = {
  // Profile operations
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    return { data, error };
  },

  async updateProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    return { data, error };
  },

  // Farm operations
  async getFarms(userId: string) {
    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async createFarm(farmData: any) {
    const { data, error } = await supabase
      .from('farms')
      .insert(farmData)
      .select()
      .single();

    return { data, error };
  },

  // Livestock operations
  async getLivestockBatches(farmId: string) {
    const { data, error } = await supabase
      .from('livestock_batches')
      .select('*')
      .eq('farm_id', farmId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async createLivestockBatch(batchData: any) {
    const { data, error } = await supabase
      .from('livestock_batches')
      .insert(batchData)
      .select()
      .single();

    return { data, error };
  },

  async updateLivestockBatch(batchId: string, updates: any) {
    const { data, error } = await supabase
      .from('livestock_batches')
      .update(updates)
      .eq('id', batchId)
      .select()
      .single();

    return { data, error };
  },

  // Financial operations
  async getFinancialTransactions(farmId: string, dateFilter?: any) {
    let query = supabase
      .from('financial_transactions')
      .select('*')
      .eq('farm_id', farmId);

    if (dateFilter?.start_date) {
      query = query.gte('transaction_date', dateFilter.start_date);
    }
    if (dateFilter?.end_date) {
      query = query.lte('transaction_date', dateFilter.end_date);
    }

    const { data, error } = await query.order('transaction_date', { ascending: false });

    return { data, error };
  },

  async createFinancialTransaction(transactionData: any) {
    const { data, error } = await supabase
      .from('financial_transactions')
      .insert(transactionData)
      .select()
      .single();

    return { data, error };
  },

  // Feed operations
  async getFeedTypes(farmId: string) {
    const { data, error } = await supabase
      .from('feed_types')
      .select(`
        *,
        recipes:feed_recipes(
          *,
          ingredient:feed_ingredients(*)
        )
      `)
      .eq('farm_id', farmId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async getFeedingSchedules(farmId: string) {
    const { data, error } = await supabase
      .from('feeding_schedules')
      .select(`
        *,
        batch:livestock_batches(*),
        feed_type:feed_types(*)
      `)
      .eq('batch.farm_id', farmId);

    return { data, error };
  },

  // Dashboard metrics
  async getDashboardMetrics(farmId: string, dateFilter?: any) {
    // This would typically involve multiple queries or a database function
    // For now, we'll implement basic queries

    const livestockQuery = supabase
      .from('livestock_batches')
      .select('current_count')
      .eq('farm_id', farmId);

    const transactionsQuery = supabase
      .from('financial_transactions')
      .select('type, amount')
      .eq('farm_id', farmId);

    if (dateFilter?.start_date) {
      transactionsQuery.gte('transaction_date', dateFilter.start_date);
    }
    if (dateFilter?.end_date) {
      transactionsQuery.lte('transaction_date', dateFilter.end_date);
    }

    const [livestockResult, transactionsResult] = await Promise.all([
      livestockQuery,
      transactionsQuery
    ]);

    if (livestockResult.error || transactionsResult.error) {
      return {
        data: null,
        error: livestockResult.error || transactionsResult.error
      };
    }

    const totalLivestock = livestockResult.data?.reduce(
      (sum, batch) => sum + batch.current_count, 0
    ) || 0;

    const expenses = transactionsResult.data
      ?.filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0) || 0;

    const income = transactionsResult.data
      ?.filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0) || 0;

    return {
      data: {
        total_livestock: totalLivestock,
        total_expenses: expenses,
        total_income: income,
        net_profit: income - expenses,
      },
      error: null
    };
  }
};
