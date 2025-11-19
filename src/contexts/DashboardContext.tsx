'use client'

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react'

import type {
  DashboardContextType,
  DashboardState,
  DashboardView,
  DashboardViewConfig,
  UserRole,
  WidgetConfig,
  DashboardLayout } from '@/types/dashboard';

// Predefined dashboard configurations based on blueprint
const DASHBOARD_VIEWS: Record<DashboardView, DashboardViewConfig> = {
  vision_360: {
    view: 'vision_360',
    role: 'general_manager',
    name: 'Visión 360°',
    description: 'Dashboard ejecutivo para toma de decisiones estratégicas',
    highPriorityWidgets: [
      'cash_flow_projection',
      'tax_health_alerts',
      'income_vs_expenses',
      'contract_alerts',
      'top_clients',
    ],
    lowPriorityWidgets: [
      'f29_comparative_analysis',
      'reconciliation_actions',
      'financial_ratios',
    ],
    defaultLayout: [
      // Cash Flow - Position of honor (top left)
      {
        type: 'cash_flow_projection',
        title: 'Flujo de Caja Proyectado',
        description: 'Proyección integrada 30/60/90 días',
        priority: 'high',
        size: 'large',
        position: { x: 0, y: 0, w: 8, h: 4 },
        visible: true,
        refreshInterval: 300,
        status: 'active',
      },
      // Tax Health - Critical for compliance
      {
        type: 'tax_health_alerts',
        title: 'Salud Tributaria',
        description: 'Monitor SII & Cumplimiento',
        priority: 'high',
        size: 'medium',
        position: { x: 8, y: 0, w: 4, h: 4 },
        visible: true,
        refreshInterval: 1800,
        status: 'active',
      },
      // IVA Meter - Chilean specific
      {
        type: 'iva_meter',
        title: 'IVÓMETRO',
        description: 'IVA Proyectado en tiempo real',
        priority: 'high',
        size: 'medium',
        position: { x: 0, y: 4, w: 4, h: 3 },
        visible: true,
        refreshInterval: 600,
        status: 'active',
      },
      // Income vs Expenses
      {
        type: 'income_vs_expenses',
        title: 'Ingresos vs Gastos',
        description: 'Rendimiento operativo mes actual',
        priority: 'high',
        size: 'medium',
        position: { x: 4, y: 4, w: 4, h: 3 },
        visible: true,
        refreshInterval: 900,
        status: 'active',
      },
      // Top Clients
      {
        type: 'top_clients',
        title: 'Top 5 Clientes',
        description: 'Por rentabilidad y volumen',
        priority: 'medium',
        size: 'medium',
        position: { x: 8, y: 4, w: 4, h: 3 },
        visible: true,
        refreshInterval: 1200,
        status: 'active',
      },
    ],
  },

  compliance_cockpit: {
    view: 'compliance_cockpit',
    role: 'accountant',
    name: 'Cockpit de Cumplimiento',
    description: 'Centro de control contable y tributario',
    highPriorityWidgets: [
      'iva_meter',
      'tax_health_alerts',
      'reconciliation_actions',
      'f29_comparative_analysis',
    ],
    lowPriorityWidgets: [
      'top_clients',
      'sales_performance',
      'contract_alerts',
    ],
    defaultLayout: [
      // IVA Meter - Priority for accountants
      {
        type: 'iva_meter',
        title: 'IVÓMETRO',
        description: 'Monitor IVA en tiempo real',
        priority: 'high',
        size: 'medium',
        position: { x: 0, y: 0, w: 4, h: 4 },
        visible: true,
        refreshInterval: 300,
        status: 'active',
      },
      // Tax Health - Detailed view
      {
        type: 'tax_health_alerts',
        title: 'Alertas Salud Tributaria',
        description: 'Monitoreo completo SII',
        priority: 'high',
        size: 'medium',
        position: { x: 4, y: 0, w: 4, h: 4 },
        visible: true,
        refreshInterval: 900,
        status: 'active',
      },
      // Reconciliation - Banking focus
      {
        type: 'reconciliation_actions',
        title: 'Acciones de Conciliación',
        description: 'Tareas bancarias pendientes',
        priority: 'high',
        size: 'medium',
        position: { x: 8, y: 0, w: 4, h: 4 },
        visible: true,
        refreshInterval: 600,
        status: 'active',
      },
      // F29 Analysis - Comparative view
      {
        type: 'f29_comparative_analysis',
        title: 'Análisis F29 Comparativo',
        description: 'Tendencias y patrones 24 meses',
        priority: 'high',
        size: 'large',
        position: { x: 0, y: 4, w: 8, h: 3 },
        visible: true,
        refreshInterval: 3600,
        status: 'active',
      },
    ],
  },

  human_capital: {
    view: 'human_capital',
    role: 'hr_manager',
    name: 'Gestión de Capital Humano',
    description: 'Control integral de recursos humanos',
    highPriorityWidgets: [
      'contract_alerts',
      'payroll_cost',
      'ai_suggestions',
      'headcount_metrics',
    ],
    lowPriorityWidgets: [
      'cash_flow_projection',
      'iva_meter',
      'banking_position',
    ],
    defaultLayout: [
      // Contract Alerts - Critical for HR
      {
        type: 'contract_alerts',
        title: 'Alertas Contractuales',
        description: 'Vencimientos y modificaciones',
        priority: 'high',
        size: 'medium',
        position: { x: 0, y: 0, w: 6, h: 4 },
        visible: true,
        refreshInterval: 3600,
        status: 'active',
      },
      // Payroll Cost
      {
        type: 'payroll_cost',
        title: 'Costo Total Nómina',
        description: 'Análisis integral remuneraciones',
        priority: 'high',
        size: 'medium',
        position: { x: 6, y: 0, w: 6, h: 4 },
        visible: true,
        refreshInterval: 1800,
        status: 'active',
      },
      // AI Suggestions - HR specific
      {
        type: 'ai_suggestions',
        title: 'Sugerencias IA RRHH',
        description: 'Asistente de descriptores y contratos',
        priority: 'high',
        size: 'large',
        position: { x: 0, y: 4, w: 8, h: 3 },
        visible: true,
        refreshInterval: 1800,
        status: 'active',
      },
      // Headcount metrics
      {
        type: 'headcount_metrics',
        title: 'Métricas de Personal',
        description: 'Rotación, productividad, costos',
        priority: 'medium',
        size: 'medium',
        position: { x: 8, y: 4, w: 4, h: 3 },
        visible: true,
        refreshInterval: 3600,
        status: 'active',
      },
    ],
  },
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

interface DashboardProviderProps {
  children: ReactNode
  user?: { id?: string; email?: string } | null
}

export function DashboardProvider({ children, user }: DashboardProviderProps) {

  const [state, setState] = useState<DashboardState>({
    currentView: 'vision_360',
    user: {
      id: user?.id || '',
      email: user?.email || '',
      role: 'general_manager', // Default role
    },
    layouts: [],
    activeLayout: '',
    isCustomizing: false,
    globalFilters: {
      dateRange: {
        start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      },
      companyId: '', // Will be set from company context
    },
  })

  // Initialize default layouts on mount
  useEffect(() => {
    const initializeLayouts = () => {
      const defaultLayouts: DashboardLayout[] = Object.values(DASHBOARD_VIEWS).map(viewConfig => ({
        id: `default_${viewConfig.view}`,
        name: viewConfig.name,
        description: viewConfig.description,
        role: viewConfig.role,
        widgets: viewConfig.defaultLayout.map((widget, index) => ({
          id: `widget_${widget.type}_${index}`,
          ...widget,
          status: 'active' as const,
          lastUpdated: new Date().toISOString(),
        })),
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))

      setState(prev => ({
        ...prev,
        layouts: defaultLayouts,
        activeLayout: defaultLayouts[0]?.id || '',
      }))
    }

    initializeLayouts()
  }, [])

  // Determine user role based on email or other criteria
  useEffect(() => {
    if (user?.email) {
      let userRole: UserRole = 'general_manager' // default

      // Simple role detection logic (can be enhanced)
      if (user.email.includes('contador') || user.email.includes('admin')) {
        userRole = 'accountant'
      } else if (user.email.includes('rrhh') || user.email.includes('hr')) {
        userRole = 'hr_manager'
      }

      setState(prev => ({
        ...prev,
        user: {
          ...prev.user,
          role: userRole,
          preferredView: userRole === 'accountant' ? 'compliance_cockpit' :
                        userRole === 'hr_manager' ? 'human_capital' : 'vision_360',
        },
      }))
    }
  }, [user])

  const switchView = (view: DashboardView) => {
    const targetLayout = state.layouts.find(layout =>
      layout.isDefault && layout.role === DASHBOARD_VIEWS[view].role,
    )

    setState(prev => ({
      ...prev,
      currentView: view,
      activeLayout: targetLayout?.id || prev.activeLayout,
    }))
  }

  const updateWidget = (widgetId: string, updates: Partial<WidgetConfig>) => {
    setState(prev => {
      const layouts = prev.layouts.map(layout => {
        if (layout.id === prev.activeLayout) {
          return {
            ...layout,
            widgets: layout.widgets.map(widget =>
              widget.id === widgetId
                ? { ...widget, ...updates, lastUpdated: new Date().toISOString() }
                : widget,
            ),
            updatedAt: new Date().toISOString(),
          }
        }
        return layout
      })

      return { ...prev, layouts }
    })
  }

  const addWidget = (widget: Omit<WidgetConfig, 'id'>) => {
    const newWidget: WidgetConfig = {
      ...widget,
      id: `widget_${widget.type}_${Date.now()}`,
      status: 'active',
      lastUpdated: new Date().toISOString(),
    }

    setState(prev => {
      const layouts = prev.layouts.map(layout => {
        if (layout.id === prev.activeLayout) {
          return {
            ...layout,
            widgets: [...layout.widgets, newWidget],
            updatedAt: new Date().toISOString(),
          }
        }
        return layout
      })

      return { ...prev, layouts }
    })
  }

  const removeWidget = (widgetId: string) => {
    setState(prev => {
      const layouts = prev.layouts.map(layout => {
        if (layout.id === prev.activeLayout) {
          return {
            ...layout,
            widgets: layout.widgets.filter(widget => widget.id !== widgetId),
            updatedAt: new Date().toISOString(),
          }
        }
        return layout
      })

      return { ...prev, layouts }
    })
  }

  const saveLayout = (layout: Omit<DashboardLayout, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLayout: DashboardLayout = {
      ...layout,
      id: `layout_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setState(prev => ({
      ...prev,
      layouts: [...prev.layouts, newLayout],
    }))
  }

  const loadLayout = (layoutId: string) => {
    setState(prev => ({
      ...prev,
      activeLayout: layoutId,
      isCustomizing: false,
    }))
  }

  const toggleCustomization = () => {
    setState(prev => ({
      ...prev,
      isCustomizing: !prev.isCustomizing,
    }))
  }

  const refreshWidget = async (widgetId: string) => {
    updateWidget(widgetId, {
      status: 'loading',
      lastUpdated: new Date().toISOString(),
    })

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      updateWidget(widgetId, {
        status: 'active',
        lastUpdated: new Date().toISOString(),
      })
    } catch (error) {
      updateWidget(widgetId, {
        status: 'error',
        error: 'Failed to refresh widget',
        lastUpdated: new Date().toISOString(),
      })
    }
  }

  const refreshAllWidgets = () => {
    const activeLayout = state.layouts.find(layout => layout.id === state.activeLayout)
    if (activeLayout) {
      activeLayout.widgets.forEach(widget => {
        if (widget.visible && widget.status === 'active') {
          refreshWidget(widget.id)
        }
      })
    }
  }

  const contextValue: DashboardContextType = {
    state,
    switchView,
    updateWidget,
    addWidget,
    removeWidget,
    saveLayout,
    loadLayout,
    toggleCustomization,
    refreshWidget,
    refreshAllWidgets,
  }

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard(): DashboardContextType {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}
