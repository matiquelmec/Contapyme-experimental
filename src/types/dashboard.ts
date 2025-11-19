// Dashboard modular types based on ContaPyme Blueprint

export type UserRole = 'general_manager' | 'accountant' | 'hr_manager'

export type DashboardView = 'vision_360' | 'compliance_cockpit' | 'human_capital'

export interface DashboardUser {
  id: string
  email: string
  role: UserRole
  preferredView?: DashboardView
  customWidgets?: string[]
}

export type WidgetType =
  // Financial Core
  | 'cash_flow_projection'
  | 'income_vs_expenses'
  | 'profit_margins'
  | 'financial_ratios'

  // Treasury Hub
  | 'banking_position'
  | 'banking_automation'
  | 'reconciliation_actions'

  // SII Compliance Cockpit
  | 'iva_meter'
  | 'f29_comparative_analysis'
  | 'tax_health_alerts'

  // Commercial Engine
  | 'top_clients'
  | 'sales_performance'
  | 'receivables_aging'

  // Human Capital
  | 'payroll_cost'
  | 'contract_alerts'
  | 'headcount_metrics'

  // AI Assistant
  | 'ai_suggestions'
  | 'system_updates'

  // Economic Context
  | 'economic_indicators'

export type WidgetPriority = 'high' | 'medium' | 'low'
export type WidgetSize = 'small' | 'medium' | 'large' | 'xl'
export type WidgetStatus = 'active' | 'loading' | 'error' | 'disabled'

export interface WidgetConfig {
  id: string
  type: WidgetType
  title: string
  description: string
  priority: WidgetPriority
  size: WidgetSize
  position: {
    x: number
    y: number
    w: number
    h: number
  }
  visible: boolean
  refreshInterval?: number // in seconds
  lastUpdated?: string
  status: WidgetStatus
  data?: any
  error?: string
}

export interface DashboardLayout {
  id: string
  name: string
  description: string
  role?: UserRole
  widgets: WidgetConfig[]
  isDefault?: boolean
  createdAt: string
  updatedAt: string
}

// Predefined dashboard views based on blueprint
export interface DashboardViewConfig {
  view: DashboardView
  role: UserRole
  name: string
  description: string
  highPriorityWidgets: WidgetType[]
  lowPriorityWidgets: WidgetType[]
  defaultLayout: Omit<WidgetConfig, 'id' | 'data' | 'lastUpdated' | 'status'>[]
}

// Widget data interfaces
export interface CashFlowData {
  currentBalance: number
  projection30: number
  projection60: number
  projection90: number
  projectedInflows: Array<{
    date: string
    amount: number
    description: string
    source: string
    confidence: number
  }>
  projectedOutflows: Array<{
    date: string
    amount: number
    description: string
    source: string
    confidence: number
  }>
  riskLevel: 'low' | 'medium' | 'high'
  trend: {
    percentage: number
    direction: 'positive' | 'negative'
    description: string
  }
}

export interface BankingPositionData {
  accounts: Array<{
    id: string
    name: string
    bank: string
    accountNumber: string
    bookBalance: number
    availableBalance: number
    lastReconciliation: string
    status: 'synced' | 'pending' | 'error'
  }>
  totalBalance: number
  pendingTransactions: number
  lastSync: string
}

export interface PayrollCostData {
  currentMonth: {
    totalCost: number
    grossSalaries: number
    benefits: number
    taxes: number
    employeeCount: number
  }
  trend: {
    previousMonth: number
    percentage: number
    direction: 'up' | 'down' | 'stable'
  }
  averageCostPerEmployee: number
  projectedNext: number
}

export interface TopClientsData {
  clients: Array<{
    id: string
    name: string
    rut: string
    revenue: number
    profit: number
    profitMargin: number
    transactions: number
    lastTransaction: string
    trend: 'up' | 'down' | 'stable'
  }>
  totalRevenue: number
  averageMargin: number
}

export interface AIsuggestions {
  suggestions: Array<{
    id: string
    type: 'action' | 'insight' | 'optimization'
    context: string
    title: string
    description: string
    action?: {
      label: string
      url: string
      method?: 'GET' | 'POST'
    }
    priority: 'high' | 'medium' | 'low'
    timestamp: string
  }>
  contextualTips: Array<{
    module: string
    tip: string
    benefit: string
  }>
}

// Dashboard state management
export interface DashboardState {
  currentView: DashboardView
  user: DashboardUser
  layouts: DashboardLayout[]
  activeLayout: string
  isCustomizing: boolean
  globalFilters: {
    dateRange: {
      start: string
      end: string
    }
    companyId: string
  }
}

export interface DashboardContextType {
  state: DashboardState
  switchView: (view: DashboardView) => void
  updateWidget: (widgetId: string, updates: Partial<WidgetConfig>) => void
  addWidget: (widget: Omit<WidgetConfig, 'id'>) => void
  removeWidget: (widgetId: string) => void
  saveLayout: (layout: Omit<DashboardLayout, 'id' | 'createdAt' | 'updatedAt'>) => void
  loadLayout: (layoutId: string) => void
  toggleCustomization: () => void
  refreshWidget: (widgetId: string) => void
  refreshAllWidgets: () => void
}
