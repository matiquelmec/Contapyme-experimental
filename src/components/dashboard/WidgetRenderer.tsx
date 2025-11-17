'use client'

import { useState } from 'react'
import { WidgetConfig } from '@/types/dashboard'
import { useDashboard } from '@/contexts/DashboardContext'
import { Card, CardContent, Badge, Button } from '@/components/ui'
import {
  RefreshCw,
  MoreVertical,
  X,
  Settings,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2
} from 'lucide-react'

// Import existing widgets
import { IVAMeter } from './IVAMeter'
import { CashFlowProjection } from './CashFlowProjection'
import { TaxHealthAlerts } from './TaxHealthAlerts'

// Import new widgets (will create these next)
import { IncomeVsExpenses } from './widgets/IncomeVsExpenses'
import { BankingPosition } from './widgets/BankingPosition'
import { TopClients } from './widgets/TopClients'
import { PayrollCostWidget } from './widgets/PayrollCostWidget'
import { ContractAlerts } from './widgets/ContractAlerts'
import { AIsuggestionWidget } from './widgets/AIsuggestionWidget'
import { F29ComparativeAnalysis } from './widgets/F29ComparativeAnalysis'
import { HeadcountMetrics } from './widgets/HeadcountMetrics'

interface WidgetRendererProps {
  widget: WidgetConfig
  isCustomizing: boolean
}

export function WidgetRenderer({ widget, isCustomizing }: WidgetRendererProps) {
  const { updateWidget, removeWidget, refreshWidget } = useDashboard()
  const [isHovered, setIsHovered] = useState(false)

  const handleRefresh = () => {
    refreshWidget(widget.id)
  }

  const handleToggleVisibility = () => {
    updateWidget(widget.id, { visible: !widget.visible })
  }

  const handleRemove = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este widget?')) {
      removeWidget(widget.id)
    }
  }

  const renderWidgetContent = () => {
    switch (widget.type) {
      // Financial Core
      case 'cash_flow_projection':
        return <CashFlowProjection />

      case 'income_vs_expenses':
        return <IncomeVsExpenses />

      case 'profit_margins':
        return <div className="p-6 text-center text-gray-500">Profit Margins Widget - Coming Soon</div>

      case 'financial_ratios':
        return <div className="p-6 text-center text-gray-500">Financial Ratios Widget - Coming Soon</div>

      // Treasury Hub
      case 'banking_position':
        return <BankingPosition />

      case 'banking_automation':
        return <div className="p-6 text-center text-gray-500">Banking Automation Widget - Coming Soon</div>

      case 'reconciliation_actions':
        return <div className="p-6 text-center text-gray-500">Reconciliation Actions Widget - Coming Soon</div>

      // SII Compliance Cockpit
      case 'iva_meter':
        return <IVAMeter />

      case 'f29_comparative_analysis':
        return <F29ComparativeAnalysis />

      case 'tax_health_alerts':
        return <TaxHealthAlerts />

      // Commercial Engine
      case 'top_clients':
        return <TopClients />

      case 'sales_performance':
        return <div className="p-6 text-center text-gray-500">Sales Performance Widget - Coming Soon</div>

      case 'receivables_aging':
        return <div className="p-6 text-center text-gray-500">Receivables Aging Widget - Coming Soon</div>

      // Human Capital
      case 'payroll_cost':
        return <PayrollCostWidget />

      case 'contract_alerts':
        return <ContractAlerts />

      case 'headcount_metrics':
        return <HeadcountMetrics />

      // AI Assistant
      case 'ai_suggestions':
        return <AIsuggestionWidget />

      case 'system_updates':
        return <div className="p-6 text-center text-gray-500">System Updates Widget - Coming Soon</div>

      default:
        return (
          <div className="p-6 text-center">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Widget no disponible</p>
            <p className="text-xs text-gray-400">Tipo: {widget.type}</p>
          </div>
        )
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50'
      case 'medium':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-gray-200 bg-white'
    }
  }

  const getStatusIcon = () => {
    switch (widget.status) {
      case 'loading':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'disabled':
        return <EyeOff className="w-4 h-4 text-gray-400" />
      default:
        return null
    }
  }

  if (!widget.visible && !isCustomizing) {
    return null
  }

  return (
    <div
      className={`relative group ${isCustomizing ? 'cursor-move' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        className={`h-full transition-all duration-200 ${
          isCustomizing
            ? `border-2 border-dashed ${getPriorityColor(widget.priority)} hover:shadow-lg`
            : 'border-gray-200 hover:shadow-xl'
        } ${
          widget.status === 'error' ? 'border-red-300 bg-red-50' :
          widget.status === 'disabled' ? 'opacity-50' : ''
        }`}
      >
        {/* Widget Header (only visible when customizing or on hover) */}
        {(isCustomizing || isHovered) && (
          <div className="absolute top-2 right-2 z-10 flex items-center space-x-1">
            {/* Status indicator */}
            {getStatusIcon()}

            {/* Priority badge */}
            {isCustomizing && (
              <Badge
                variant={widget.priority === 'high' ? 'danger' : widget.priority === 'medium' ? 'warning' : 'outline'}
                className="text-xs px-2 py-1"
              >
                {widget.priority}
              </Badge>
            )}

            {/* Action buttons */}
            <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-sm rounded-md shadow-sm border border-gray-200 px-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={widget.status === 'loading'}
                className="p-1 h-auto hover:bg-gray-100"
                title="Actualizar widget"
              >
                <RefreshCw className={`w-3 h-3 ${widget.status === 'loading' ? 'animate-spin' : ''}`} />
              </Button>

              {isCustomizing && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleVisibility}
                    className="p-1 h-auto hover:bg-gray-100"
                    title={widget.visible ? 'Ocultar widget' : 'Mostrar widget'}
                  >
                    {widget.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    className="p-1 h-auto hover:bg-red-100 hover:text-red-600"
                    title="Eliminar widget"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Customization overlay */}
        {isCustomizing && (
          <div className="absolute inset-0 bg-blue-500/5 border-2 border-blue-300 rounded-lg flex items-center justify-center z-5 pointer-events-none">
            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
              {widget.title}
            </div>
          </div>
        )}

        {/* Widget Content */}
        <CardContent className="p-0 h-full">
          {widget.status === 'error' ? (
            <div className="p-6 text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <h3 className="font-medium text-red-900">Error en Widget</h3>
              <p className="text-sm text-red-700 mt-1">
                {widget.error || 'Error desconocido'}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                className="mt-3 border-red-300 text-red-700 hover:bg-red-50"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Reintentar
              </Button>
            </div>
          ) : widget.status === 'loading' ? (
            <div className="p-6 text-center">
              <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-spin" />
              <p className="text-sm text-gray-600">Cargando datos...</p>
            </div>
          ) : widget.status === 'disabled' ? (
            <div className="p-6 text-center">
              <EyeOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Widget deshabilitado</p>
              {isCustomizing && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleToggleVisibility}
                  className="mt-3"
                >
                  Habilitar
                </Button>
              )}
            </div>
          ) : (
            renderWidgetContent()
          )}
        </CardContent>

        {/* Widget Footer (last updated info) */}
        {widget.lastUpdated && !isCustomizing && (
          <div className="absolute bottom-1 left-2 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded">
            {new Date(widget.lastUpdated).toLocaleTimeString('es-CL', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}
      </Card>
    </div>
  )
}