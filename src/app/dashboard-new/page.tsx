'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'

import {
  TrendingUp,
  DollarSign,
  Users,
  AlertTriangle,
  Calculator,
  Activity,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react'

import { useSmartIndicators } from '@/hooks/useSmartIndicators'
import { useModulePageWithMetrics } from '@/hooks/useModulePage'

// Interfaces para tipado robusto
interface DashboardData {
  cashFlow: any
  ivometer: any
  taxHealth: any
  liveStats: any
  metrics: any
}

const initialDashboardData: DashboardData = {
  cashFlow: null,
  ivometer: null,
  taxHealth: null,
  liveStats: null,
  metrics: null,
}

export default function ExecutiveDashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialDashboardData)

  // ✅ USAR HOOK CENTRALIZADO PARA MULTI-TENANCY
  const {
    company,
    isLoading,
    error,
    fetchModuleData,
    isReady,
    hasCompanyChanged
  } = useModulePageWithMetrics('Dashboard', initialDashboardData, {
    debugMode: true,
    autoFetchMetrics: false // No queremos el endpoint metrics automático
  })

  // Hook para indicadores económicos
  const {
    indicators,
    loading: indicatorsLoading,
    error: indicatorsError,
    lastUpdate: indicatorsLastUpdate,
    manualRefresh,
    canManualRefresh,
  } = useSmartIndicators({
    cacheTime: 5,
    backgroundRefresh: true,
    autoRefreshInterval: 10,
  })

  // ✅ FUNCIÓN PARA CARGAR TODOS LOS DATOS DEL DASHBOARD
  const loadDashboardData = async () => {
    if (!isReady) return

    try {
      console.log(`🔄 [Dashboard] Loading data for company: ${company.name}`)

      // Cargar todos los APIs en paralelo
      const [
        cashFlowResponse,
        ivometerResponse,
        taxHealthResponse,
        liveStatsResponse,
        metricsResponse
      ] = await Promise.all([
        fetchModuleData('/api/dashboard/cash-flow'),
        fetchModuleData('/api/dashboard/iva-meter'),
        fetchModuleData('/api/dashboard/tax-health'),
        fetchModuleData('/api/dashboard/live-stats'),
        fetchModuleData('/api/dashboard/metrics'),
      ])

      setDashboardData({
        cashFlow: cashFlowResponse?.data || null,
        ivometer: ivometerResponse?.data || null,
        taxHealth: taxHealthResponse?.data || null,
        liveStats: liveStatsResponse?.data || null,
        metrics: metricsResponse?.data || null,
      })

      console.log(`✅ [Dashboard] Data loaded successfully for ${company.name}`)
    } catch (error) {
      console.error('❌ [Dashboard] Error loading dashboard data:', error)
    }
  }

  // ✅ CARGAR DATOS CUANDO LA EMPRESA ESTÉ LISTA O CAMBIE
  useEffect(() => {
    if (isReady) {
      loadDashboardData()
    }
  }, [isReady, hasCompanyChanged])

  // ✅ RECARGAR DATOS CUANDO CAMBIE LA EMPRESA
  useEffect(() => {
    if (hasCompanyChanged && isReady) {
      console.log(`🔄 [Dashboard] Company changed, reloading data...`)
      loadDashboardData()
    }
  }, [hasCompanyChanged, isReady])

  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount)

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'healthy': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusBg = (status: string) => {
    switch(status) {
      case 'healthy': return 'bg-green-100'
      case 'warning': return 'bg-yellow-100'
      case 'critical': return 'bg-red-100'
      default: return 'bg-gray-100'
    }
  }

  // Función para formatear indicadores económicos
  const formatIndicatorValue = (indicator: any): string => {
    if (!indicator) return '-'

    const { value, unit, code } = indicator

    if (code?.toLowerCase() === 'uf' || code?.toLowerCase() === 'utm') {
      return `$${value.toLocaleString('es-CL')} CLP`
    } else if (code?.toLowerCase() === 'dolar' || code?.toLowerCase() === 'euro') {
      return `$${value.toLocaleString('es-CL')} CLP`
    } else if (unit === '%') {
      return `${value.toFixed(2)}%`
    } else if (unit === 'USD') {
      return `US$${value.toLocaleString('en-US')}`
    }

    return value.toLocaleString('es-CL')
  }

  // Obtener indicadores clave para el ticker
  const getKeyIndicators = () => {
    if (!indicators || indicators.length === 0) return []

    const keyIndicators = ['uf', 'utm', 'dolar', 'euro', 'bitcoin']
    return keyIndicators.map(key => {
      const indicator = indicators.find(ind =>
        ind.code?.toLowerCase() === key ||
        ind.code?.toLowerCase() === key.toUpperCase(),
      )
      return indicator ? {
        ...indicator,
        displayName: key.toUpperCase(),
      } : null
    }).filter(Boolean)
  }

  if (isLoading || !isReady || !dashboardData.cashFlow) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                <p className="mt-4 text-gray-600">Cargando dashboard ejecutivo...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Hero Section - Simplified */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">Dashboard Ejecutivo</h1>
                  <p className="text-slate-300 text-sm">
                    Centro de control basado en Jobs-to-be-Done para PyMEs chilenas
                  </p>
                </div>
                <Link href="/portal">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                    <Activity className="w-4 h-4" />
                    <span>Portal Principal</span>
                  </button>
                </Link>
              </div>
            </div>
            {/* Quick Stats */}
            <div className="grid grid-cols-3 divide-x divide-gray-200 bg-gray-50">
              <div className="px-6 py-4 text-center">
                <div className="text-lg font-semibold text-gray-900">Estado General</div>
                <div className="text-sm text-yellow-600">⚠️ Requiere Atención</div>
              </div>
              <div className="px-6 py-4 text-center">
                <div className="text-lg font-semibold text-gray-900">{dashboardData.taxHealth?.alerts?.length || 0}</div>
                <div className="text-sm text-gray-600">Alertas Activas</div>
              </div>
              <div className="px-6 py-4 text-center">
                <div className="text-lg font-semibold text-gray-900">Dic 2024</div>
                <div className="text-sm text-gray-600">Período Activo</div>
              </div>
            </div>
          </div>

          {/* Ticker de Indicadores Económicos Chilenos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Indicadores Económicos Chile</h3>
                    <p className="text-xs text-gray-600">
                      {indicatorsLastUpdate ?
                        `Actualizado: ${indicatorsLastUpdate.toLocaleTimeString('es-CL')}` :
                        'Cargando...'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={manualRefresh}
                    disabled={!canManualRefresh || indicatorsLoading}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    title="Actualizar indicadores"
                  >
                    <RefreshCw className={`w-4 h-4 text-gray-600 ${indicatorsLoading ? 'animate-spin' : ''}`} />
                  </button>
                  <Link href="/accounting/indicators">
                    <button className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">
                      Ver Detalles
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="px-6 py-4">
              {indicatorsLoading && !indicators.length ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                  <span className="ml-3 text-sm text-gray-600">Cargando indicadores...</span>
                </div>
              ) : indicatorsError ? (
                <div className="flex items-center justify-center py-4 text-red-600">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  <span className="text-sm">Error: {indicatorsError}</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {getKeyIndicators().slice(0, 5).map((indicator, index) => (
                    <div key={indicator.code || index} className="text-center">
                      <div className="text-xs font-medium text-gray-600 mb-1">
                        {indicator.displayName}
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        {formatIndicatorValue(indicator)}
                      </div>
                      {indicator.change !== undefined && (
                        <div className={`text-xs flex items-center justify-center gap-1 ${
                          indicator.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {indicator.change >= 0 ? (
                            <ArrowUp className="w-3 h-3" />
                          ) : (
                            <ArrowDown className="w-3 h-3" />
                          )}
                          {Math.abs(indicator.change).toFixed(2)}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tres Widgets Principales - JTBD */}
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {/* JTBD 1: Cash Flow (Supervivencia) */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getStatusBg(dashboardData.cashFlow?.riskLevel || 'healthy')}`}>
                        <DollarSign className={`w-5 h-5 ${getStatusColor(dashboardData.cashFlow?.riskLevel || 'healthy')}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Flujo de Caja - {company.name}</h3>
                        <p className="text-sm text-gray-600">¿Tengo suficiente caja para pagar sueldos e IVA?</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {dashboardData.cashFlow?.trend?.direction === 'negative' ? (
                        <ArrowDown className="w-4 h-4 text-red-500" />
                      ) : (
                        <ArrowUp className="w-4 h-4 text-green-500" />
                      )}
                      <span className={`text-sm font-medium ${dashboardData.cashFlow?.trend?.direction === 'negative' ? 'text-red-600' : 'text-green-600'}`}>
                        {dashboardData.cashFlow?.trend?.description || 'Cargando...'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Actual</div>
                      <div className="text-lg font-bold text-gray-900">{formatCurrency(dashboardData.cashFlow?.currentBalance || 0)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">30 días</div>
                      <div className="text-lg font-bold text-yellow-600">{formatCurrency(dashboardData.cashFlow?.projection30 || 0)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">60 días</div>
                      <div className="text-lg font-bold text-blue-600">{formatCurrency(dashboardData.cashFlow?.projection60 || 0)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">90 días</div>
                      <div className="text-lg font-bold text-gray-600">{formatCurrency(dashboardData.cashFlow?.projection90 || 0)}</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Estado del flujo de caja</span>
                      <span className={`font-medium ${getStatusColor(dashboardData.cashFlow?.riskLevel || 'healthy')}`}>
                        {dashboardData.cashFlow?.riskLevel === 'warning' ? 'Requiere Atención' :
                         dashboardData.cashFlow?.riskLevel === 'critical' ? 'Crítico' : 'Saludable'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* JTBD 2: IVÓMETRO (Cumplimiento) */}
            <div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getStatusBg(dashboardData.ivometer?.estado || 'healthy')}`}>
                      <Calculator className={`w-5 h-5 ${getStatusColor(dashboardData.ivometer?.estado || 'healthy')}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">IVÓMETRO - {company.name}</h3>
                      <p className="text-sm text-gray-600">¿Estoy en riesgo de multas SII?</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Débito Fiscal</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(dashboardData.ivometer?.debitoFiscal || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Crédito Fiscal</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(dashboardData.ivometer?.creditoFiscal || 0)}</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-900">IVA a Pagar</span>
                        <span className="text-lg font-bold text-red-600">{formatCurrency(dashboardData.ivometer?.ivaAPagar || 0)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Vencimiento</span>
                        </div>
                        <span className="text-sm font-medium text-red-600">{dashboardData.ivometer?.fechaVencimiento ? new Date(dashboardData.ivometer.fechaVencimiento).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }) : '20 Dic 2024'}</span>
                      </div>
                    </div>
                    <div className={`mt-4 p-3 rounded-lg ${getStatusBg(dashboardData.ivometer?.estado || 'healthy')}`}>
                      <div className="flex items-center gap-2">
                        {dashboardData.ivometer?.estado === 'critical' ? (
                          <XCircle className="w-4 h-4 text-red-600" />
                        ) : dashboardData.ivometer?.estado === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                        <span className={`text-sm font-medium ${getStatusColor(dashboardData.ivometer?.estado || 'healthy')}`}>
                          {dashboardData.ivometer?.estado === 'critical' ? 'Acción Inmediata' :
                           dashboardData.ivometer?.estado === 'warning' ? 'Revisar Pronto' : 'Todo Correcto'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* JTBD 3: Top 5 Clientes (Crecimiento) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente - {company.name}</h3>
                  <p className="text-sm text-gray-600">¿Qué está pasando en mi empresa ahora mismo?</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {(dashboardData.liveStats?.recentActivity || []).map((activity: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{activity.action}</div>
                        <div className="text-sm text-gray-600">Usuario: {activity.user}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">{activity.timeAgo}</div>
                    </div>
                  </div>
                ))}
                {(!dashboardData.liveStats?.recentActivity || dashboardData.liveStats.recentActivity.length === 0) && (
                  <div className="text-center py-8">
                    <div className="text-gray-500">Cargando actividad reciente...</div>
                  </div>
                )}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={loadDashboardData}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Actualizando...' : 'Refrescar Dashboard'}
                </button>
              </div>
            </div>
          </div>

          {/* Actividad Reciente */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100">
                  <Activity className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
                  <p className="text-sm text-gray-600">Últimas acciones del sistema</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {/* F29 Analysis */}
                <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Análisis F29 procesado</p>
                    <p className="text-sm text-gray-600">IVÓMETRO actualizado con datos de diciembre 2024</p>
                  </div>
                  <span className="text-sm text-gray-500">Hace 2 horas</span>
                </div>

                {/* Indicadores Update */}
                <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Indicadores actualizados</p>
                    <p className="text-sm text-gray-600">
                      {indicatorsLastUpdate ?
                        `UF, UTM y divisas sincronizadas automáticamente (${indicatorsLastUpdate.toLocaleTimeString('es-CL')})` :
                        'UF, UTM y divisas en proceso de sincronización'
                      }
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {indicatorsLastUpdate ? 'Actualizado' : 'Cargando...'}
                  </span>
                </div>

                {/* Top Clients Analysis */}
                <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Análisis de rentabilidad actualizado</p>
                    <p className="text-sm text-gray-600">Top 5 clientes recalculado con datos RCV actuales</p>
                  </div>
                  <span className="text-sm text-gray-500">Hace 6 horas</span>
                </div>

                {/* Cash Flow Projection */}
                <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg">
                  <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Proyección de flujo de caja actualizada</p>
                    <p className="text-sm text-gray-600">Integración automática: nómina + IVA + cuentas por pagar</p>
                  </div>
                  <span className="text-sm text-gray-500">Hace 1 día</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <Link href="/accounting">
                  <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                    <Activity className="w-4 h-4" />
                    Ver Historial Completo
                  </button>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
