// Application-specific types

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

// Navigation types
export type RootStackParamList = {
  '(tabs)': undefined;
  'auth/login': undefined;
  'profile/index': undefined;
  'profile/farm-details': undefined;
};

export type TabParamList = {
  dashboard: undefined;
  livestock: undefined;
  feeding: undefined;
  financial: undefined;
};

// Form types
export interface LivestockBatchForm {
  batch_name: string;
  animal_name: string;
  animal_type: string;
  entry_date: Date;
  initial_count: number;
  source_of_purchase?: string;
  total_purchase_cost: number;
}

export interface FeedTypeForm {
  name: string;
  description?: string;
  is_custom_mix: boolean;
}

export interface FeedRecipeForm {
  ingredient_id: string;
  percentage: number;
  weight_per_unit: number;
}

export interface FinancialTransactionForm {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category?: string;
  transaction_date: Date;
}

export interface FeedingScheduleForm {
  feed_type_id: string;
  daily_feed_requirement: number;
  daily_water_requirement: number;
}

// Chart data types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface LineChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }[];
}

// UI component types
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}

export interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address';
}

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

// Utility types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

// Notification types
export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

// Settings types
export interface AppSettings {
  notifications_enabled: boolean;
  default_currency: string;
  weight_unit: 'kg' | 'lbs';
  theme: 'light' | 'dark' | 'auto';
}
