export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'CLIENT' | 'ACCOUNTANT'
  createdAt: Date
  updatedAt: Date
}

export interface Company {
  id: string
  name: string
  rut: string
  address?: string
  phone?: string
  email?: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface Account {
  id: string
  code: string
  name: string
  type?: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE'
  account_type?: 'asset' | 'liability' | 'equity' | 'income' | 'expense'
  description?: string
  parentId?: string
  parent_id?: string
  companyId?: string
  company_id?: string
  level: number
  isActive?: boolean
  is_active?: boolean
  isDetail?: boolean
  is_detail?: boolean
  children?: Account[]
  createdAt?: Date
  updatedAt?: Date
}

export interface Transaction {
  id: string
  date: Date
  description: string
  reference?: string
  companyId: string
  createdAt: Date
  updatedAt: Date
  entries: TransactionEntry[]
}

export interface TransactionEntry {
  id: string
  transactionId: string
  accountId: string
  debit: number
  credit: number
  description?: string
}

export interface FinancialReport {
  id: string
  type: 'BALANCE_SHEET' | 'INCOME_STATEMENT' | 'CASH_FLOW'
  companyId: string
  startDate: Date
  endDate: Date
  data: any
  createdAt: Date
}

// ===============================
// TIPOS PARA ACTIVOS FIJOS
// ===============================

export interface FixedAsset {
  id: string
  user_id: string
  
  // Información básica
  name: string
  description?: string
  category: string
  
  // Valores económicos
  purchase_value: number
  residual_value: number
  depreciable_value: number
  
  // Fechas
  purchase_date: string
  start_depreciation_date: string
  
  // Vida útil y depreciación
  useful_life_years: number
  useful_life_months: number
  depreciation_method: 'linear' | 'accelerated' | 'units_production'
  
  // Asociación con plan de cuentas
  asset_account_code?: string
  depreciation_account_code?: string
  expense_account_code?: string
  
  // Estado
  status: 'active' | 'disposed' | 'fully_depreciated'
  disposal_date?: string
  disposal_value?: number
  
  // Información adicional
  serial_number?: string
  brand?: string
  model?: string
  location?: string
  responsible_person?: string
  
  // Metadatos
  created_at: string
  updated_at: string
}

export interface FixedAssetDepreciation {
  id: string
  fixed_asset_id: string
  
  // Período
  period_year: number
  period_month: number
  
  // Valores
  monthly_depreciation: number
  accumulated_depreciation: number
  book_value: number
  
  // Estado
  is_calculated: boolean
  calculation_date: string
}

export interface FixedAssetCategory {
  id: string
  name: string
  description?: string
  default_useful_life_years?: number
  suggested_asset_account?: string
  suggested_depreciation_account?: string
  suggested_expense_account?: string
  created_at: string
}

// Tipos para formularios
export interface CreateFixedAssetData {
  name: string
  description?: string
  category: string
  purchase_value: number
  residual_value: number
  purchase_date: string
  start_depreciation_date: string
  useful_life_years: number
  asset_account_code?: string
  depreciation_account_code?: string
  expense_account_code?: string
  serial_number?: string
  brand?: string
  model?: string
  location?: string
  responsible_person?: string
}

export interface UpdateFixedAssetData extends Partial<CreateFixedAssetData> {
  id: string
}

// Tipos para reportes de activos fijos
export interface FixedAssetReport {
  total_assets: number
  total_purchase_value: number
  total_book_value: number
  total_accumulated_depreciation: number
  assets_by_category: {
    [category: string]: {
      count: number
      purchase_value: number
      book_value: number
      accumulated_depreciation: number
    }
  }
  monthly_depreciation: number
  assets_near_full_depreciation: FixedAsset[]
}

// =============================================
// TIPOS PARA INDICADORES ECONÓMICOS
// =============================================

export interface EconomicIndicator {
  id: string;
  code: string;
  name: string;
  unit: string | null;
  value: number;
  date: string;
  source: string;
  category: 'monetary' | 'currency' | 'crypto' | 'labor';
  created_at: string;
  updated_at: string;
}

export interface IndicatorConfig {
  id: string;
  code: string;
  name: string;
  description: string | null;
  unit: string | null;
  category: 'monetary' | 'currency' | 'crypto' | 'labor';
  api_endpoint: string | null;
  api_enabled: boolean;
  update_frequency: 'daily' | 'weekly' | 'monthly';
  display_order: number;
  is_active: boolean;
  decimal_places: number;
  format_type: 'currency' | 'percentage' | 'number';
  created_at: string;
  updated_at: string;
}

export interface IndicatorValue {
  code: string;
  name: string;
  value: number;
  date: string;
  unit: string | null;
  category: string;
  format_type?: string;
  decimal_places?: number;
  change?: number; // Variación respecto al período anterior
  change_percentage?: number; // Variación porcentual
}

export interface IndicatorHistory {
  code: string;
  name: string;
  unit: string | null;
  values: Array<{
    date: string;
    value: number;
  }>;
}

// API Response types para mindicador.cl
export interface MindicadorResponse {
  version: string;
  autor: string;
  fecha: string;
  [key: string]: any; // Para los indicadores dinámicos
}

export interface MindicadorIndicator {
  codigo: string;
  nombre: string;
  unidad_medida: string;
  fecha: string;
  valor: number;
}

export interface CryptoAPIResponse {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
  };
}

export interface IndicatorsDashboard {
  monetary: IndicatorValue[];
  currency: IndicatorValue[];
  crypto: IndicatorValue[];
  labor: IndicatorValue[];
}

export interface UpdateIndicatorRequest {
  code: string;
  manual_value?: number;
  force_update?: boolean;
}

// =============================================
// RE-EXPORT GLOBAL TYPES
// =============================================

// Re-export all types from global.d.ts for easier imports
export type {
  F29Results,
  ExternalBalanceAccount,
  BankTransaction,
  UploadResult,
  CompanySettings,
  TaxConfigModalProps,
  Employee,
  PayrollLiquidation,
  SearchFilters,
  DashboardWidget,
  ButtonProps,
  ApiResponse,
  PaginatedResponse,
  FormField,
  LoadingState,
  BreakpointSize,
  ResponsiveValue,
} from './global';

// =============================================
// ADDITIONAL SHARED TYPES
// =============================================

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface TableColumn<T = any> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

export interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

// =============================================
// NAVIGATION TYPES
// =============================================

export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ComponentType<any>;
  badge?: string | number;
  children?: NavigationItem[];
  permissions?: string[];
}

// =============================================
// THEME TYPES
// =============================================

export interface ThemeColors {
  primary: Record<number, string>;
  secondary: Record<number, string>;
  success: Record<number, string>;
  warning: Record<number, string>;
  error: Record<number, string>;
  gray: Record<number, string>;
}

export interface Theme {
  colors: ThemeColors;
  spacing: Record<string, string>;
  breakpoints: Record<BreakpointSize, string>;
  shadows: Record<string, string>;
  borderRadius: Record<string, string>;
}

// =============================================
// ERROR HANDLING TYPES
// =============================================

export interface AppError {
  code: string;
  message: string;
  details?: string;
  timestamp: Date;
  userMessage?: string;
  technical?: boolean;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: AppError;
}

// =============================================
// AUDIT TRAIL TYPES
// =============================================

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// =============================================
// EXPORT ALL TYPES FROM MODULES
// =============================================

// This allows for clean imports like: import { User, Company } from '@/types'
export * from './dashboard';
export * from './supabase';