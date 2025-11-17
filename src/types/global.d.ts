// 🌐 Global type definitions for ContaPyme

declare global {
  // 🔧 Environment variables
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;
    ANTHROPIC_API_KEY?: string;
    NEXT_PUBLIC_APP_URL?: string;
  }

  // 🪟 Window extensions
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    // PDF.js worker
    pdfjsWorker?: any;
    // Anthropic AI SDK
    anthropic?: any;
  }
}

// 📊 F29 Analysis Types
export interface F29Results {
  // Basic identification
  period: string;
  rut: string;
  company_name?: string;

  // Sales and purchases
  ventas_netas?: number;
  compras_netas?: number;

  // IVA calculations
  debito_fiscal?: number;
  credito_fiscal?: number;
  iva_determinado?: number;

  // Payments
  total_a_pagar?: number;

  // Form codes (common ones)
  codigo151?: number; // IVA Débito Fiscal
  codigo152?: number; // IVA Crédito Fiscal
  codigo153?: number; // IVA Determinado
  codigo91?: number;  // Total a pagar

  // Additional data
  confidence?: number;
  processed_at?: string;
  errors?: string[];
  warnings?: string[];
}

// 📄 External Balance Account Type
export interface ExternalBalanceAccount {
  id: string;
  code: string;
  name: string;
  balance: number;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  level: number;
  is_detail: boolean;
  parent_code?: string;
  children?: ExternalBalanceAccount[];
}

// 🏦 Bank Transaction Types
export interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  balance: number;
  reference?: string;
  category?: string;

  // Suggested journal entry
  suggestedEntry?: {
    debit?: {
      account_code: string;
      account_name: string;
      amount: number;
    };
    credit?: {
      account_code: string;
      account_name: string;
      amount: number;
    };
    description: string;
    confidence: number;
  };
}

// 📤 Upload result types
export interface UploadResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
  processed_count?: number;
  file_name?: string;
}

// 🏢 Company Settings Types
export interface CompanySettings {
  id: string;
  company_id: string;

  // Basic info
  phone?: string;
  address?: string;

  // Payroll defaults
  default_working_hours?: number;
  afp_default?: string;
  health_default?: string;

  // Other settings
  created_at: string;
  updated_at: string;
}

// 🎯 Tax Configuration Types
export interface TaxConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  accounts: Account[]; // This was missing
}

// 📊 Chart of Accounts
export interface Account {
  id: string;
  code: string;
  name: string;
  level: number;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  is_detail: boolean;
  is_active: boolean;
  parent_code?: string;
  balance?: number;
  children?: Account[];
}

// 💼 Employee Types
export interface Employee {
  id: string;
  rut: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  position: string;
  salary: number;
  contract_type: 'indefinido' | 'fijo' | 'honorarios';
  start_date: string;
  end_date?: string;
  is_active: boolean;

  // Payroll configuration
  afp_code?: string;
  health_institution_code?: string;
  family_allowances?: number;

  created_at: string;
  updated_at: string;
}

// 📋 Liquidation Types
export interface PayrollLiquidation {
  id: string;
  employee_id: string;
  period: string;

  // Income
  base_salary: number;
  overtime_amount?: number;
  bonuses?: number;
  total_income: number;

  // Deductions
  afp_deduction: number;
  health_deduction: number;
  tax_deduction: number;
  other_deductions?: number;
  total_deductions: number;

  // Final amounts
  net_salary: number;

  // Status
  status: 'draft' | 'calculated' | 'approved' | 'paid';
  calculated_at?: string;
  approved_at?: string;
  paid_at?: string;

  created_at: string;
  updated_at: string;
}

// 📊 Fixed Assets Types
export interface FixedAsset {
  id: string;
  name: string;
  category: string;
  purchase_date: string;
  purchase_value: number;
  useful_life_years: number;
  depreciation_method: 'straight_line' | 'declining_balance' | 'units_of_production';

  // Depreciation
  annual_depreciation: number;
  accumulated_depreciation: number;
  book_value: number;

  // Status
  status: 'active' | 'disposed' | 'fully_depreciated';

  created_at: string;
  updated_at: string;
}

// 🔍 Search and Filter Types
export interface SearchFilters {
  query?: string;
  date_from?: string;
  date_to?: string;
  category?: string;
  status?: string;
  limit?: number;
  offset?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// 📈 Dashboard Widget Types
export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'alert';
  title: string;
  span: number;
  order: number;
  config: Record<string, any>;
  is_visible: boolean;
}

// 🎨 UI Component Types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// 📊 Economic Indicators Types
export interface EconomicIndicator {
  code: string;
  name: string;
  value: number;
  unit: string;
  date: string;
  variation?: number;
  variation_percent?: number;
  source: string;
}

// 🔐 API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// 🎯 Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'date' | 'textarea' | 'checkbox' | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => boolean | string;
  };
}

// 🔄 Loading States
export interface LoadingState {
  loading: boolean;
  error: string | null;
  data: any;
}

// 📱 Responsive Types
export type BreakpointSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ResponsiveValue<T> {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}

export {};