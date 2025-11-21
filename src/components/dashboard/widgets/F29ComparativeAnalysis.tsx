'use client'

import { useState, useEffect } from 'react'

import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  FileText,
  AlertTriangle,
  CheckCircle,
  Target,
  Calculator,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useCompany } from '@/contexts/CompanyContext'

interface F29Period {
  period: string // YYYYMM format
  month: string
  year: number
  debitoFiscal: number // Código 538
  creditoFiscal: number // Código 511
  ivaResultante: number // 538 - 511
  ppm: number // Código 062
  remanente: number // Código 077
  totalPagar: number
  ventasNetas: number // Código 563
  comprasNetas: number // Calculado
  status: 'processed' | 'pending' | 'reviewed' | 'filed'
}

interface F29AnalysisData {
  periods: F29Period[]
  totalPeriods: number
  averageIVA: number
  trend: 'improving' | 'stable' | 'declining'
  trendPercentage: number
  insights: Array<{
    type: 'positive' | 'warning' | 'info'
    title: string
    description: string
    impact: 'high' | 'medium' | 'low'
  }>
  recommendations: string[]
}

export function F29ComparativeAnalysis() {
  const { company } = useCompany()
  const [data, setData] = useState<F29AnalysisData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriods, setSelectedPeriods] = useState(6) // Show last 6 months by default
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'insights'>('overview')

  useEffect(() => {
    if (company?.id) {
      loadF29Analysis()
    }
  }, [selectedPeriods, company?.id]) // Recargar cuando cambie la empresa

  const loadF29Analysis = async () => {
    try {
      // TODO: Replace with real API call
      // const response = await fetch(`/api/dashboard/f29-analysis?periods=${selectedPeriods}&company_id=${company.id}`)
      // const data = await response.json()

      console.log(`🔄 F29ComparativeAnalysis: Generando datos para empresa ${company.id}`)

      // Generar datos mock diferentes basándose en la empresa para demostrar separación
      const isCompany1 = company.id === '8033ee69-b420-4d91-ba0e-482f46cd6fce'
      const baseData = isCompany1 ? {
        averageIVA: 1450000,
        trend: 'improving' as const,
        trendPercentage: 15.2,
        companyPrefix: 'PyME Ejemplo'
      } : {
        averageIVA: 850000,
        trend: 'stable' as const,
        trendPercentage: 3.1,
        companyPrefix: 'Mi Pyme'
      }

      // Demo data with realistic F29 comparative analysis
      const mockData: F29AnalysisData = {
        totalPeriods: selectedPeriods,
        averageIVA: baseData.averageIVA,
        trend: baseData.trend,
        trendPercentage: baseData.trendPercentage,
        periods: isCompany1 ? [
          // Datos para PyME Ejemplo S.A. (Empresa 1) - Empresa grande con crecimiento
          {
            period: '202405',
            month: 'Mayo 2024',
            year: 2024,
            debitoFiscal: 3200000,
            creditoFiscal: 4100000,
            ivaResultante: -900000,
            ppm: 340000,
            remanente: 900000,
            totalPagar: 340000,
            ventasNetas: 16842105,
            comprasNetas: 21578947,
            status: 'filed',
          },
          {
            period: '202406',
            month: 'Junio 2024',
            year: 2024,
            debitoFiscal: 3600000,
            creditoFiscal: 3800000,
            ivaResultante: -200000,
            ppm: 350000,
            remanente: 200000,
            totalPagar: 350000,
            ventasNetas: 18947368,
            comprasNetas: 20000000,
            status: 'filed',
          },
          {
            period: '202407',
            month: 'Julio 2024',
            year: 2024,
            debitoFiscal: 4200000,
            creditoFiscal: 3500000,
            ivaResultante: 700000,
            ppm: 360000,
            remanente: 0,
            totalPagar: 1060000,
            ventasNetas: 22105263,
            comprasNetas: 18421052,
            status: 'filed',
          },
          {
            period: '202408',
            month: 'Agosto 2024',
            year: 2024,
            debitoFiscal: 4800000,
            creditoFiscal: 3200000,
            ivaResultante: 1600000,
            ppm: 380000,
            remanente: 0,
            totalPagar: 1980000,
            ventasNetas: 25263157,
            comprasNetas: 16842105,
            status: 'filed',
          },
          {
            period: '202409',
            month: 'Septiembre 2024',
            year: 2024,
            debitoFiscal: 5200000,
            creditoFiscal: 2800000,
            ivaResultante: 2400000,
            ppm: 400000,
            remanente: 0,
            totalPagar: 2800000,
            ventasNetas: 27368421,
            comprasNetas: 14736842,
            status: 'filed',
          },
          {
            period: '202410',
            month: 'Octubre 2024',
            year: 2024,
            debitoFiscal: 5600000,
            creditoFiscal: 2600000,
            ivaResultante: 3000000,
            ppm: 420000,
            remanente: 0,
            totalPagar: 3420000,
            ventasNetas: 29473684,
            comprasNetas: 13684210,
            status: 'reviewed',
          },
        ] : [
          // Datos para Mi Pyme Ltda. (Empresa 2) - Empresa menor, más estable
          {
            period: '202405',
            month: 'Mayo 2024',
            year: 2024,
            debitoFiscal: 1800000,
            creditoFiscal: 2200000,
            ivaResultante: -400000,
            ppm: 180000,
            remanente: 400000,
            totalPagar: 180000,
            ventasNetas: 9473684,
            comprasNetas: 11578947,
            status: 'filed',
          },
          {
            period: '202406',
            month: 'Junio 2024',
            year: 2024,
            debitoFiscal: 1900000,
            creditoFiscal: 2100000,
            ivaResultante: -200000,
            ppm: 190000,
            remanente: 200000,
            totalPagar: 190000,
            ventasNetas: 10000000,
            comprasNetas: 11052631,
            status: 'filed',
          },
          {
            period: '202407',
            month: 'Julio 2024',
            year: 2024,
            debitoFiscal: 2100000,
            creditoFiscal: 1900000,
            ivaResultante: 200000,
            ppm: 200000,
            remanente: 0,
            totalPagar: 400000,
            ventasNetas: 11052631,
            comprasNetas: 10000000,
            status: 'filed',
          },
          {
            period: '202408',
            month: 'Agosto 2024',
            year: 2024,
            debitoFiscal: 2200000,
            creditoFiscal: 1800000,
            ivaResultante: 400000,
            ppm: 210000,
            remanente: 0,
            totalPagar: 610000,
            ventasNetas: 11578947,
            comprasNetas: 9473684,
            status: 'filed',
          },
          {
            period: '202409',
            month: 'Septiembre 2024',
            year: 2024,
            debitoFiscal: 2300000,
            creditoFiscal: 1700000,
            ivaResultante: 600000,
            ppm: 220000,
            remanente: 0,
            totalPagar: 820000,
            ventasNetas: 12105263,
            comprasNetas: 8947368,
            status: 'filed',
          },
          {
            period: '202410',
            month: 'Octubre 2024',
            year: 2024,
            debitoFiscal: 2400000,
            creditoFiscal: 1650000,
            ivaResultante: 750000,
            ppm: 230000,
            remanente: 0,
            totalPagar: 980000,
            ventasNetas: 12631578,
            comprasNetas: 8684210,
            status: 'reviewed',
          },
        ],
        insights: isCompany1 ? [
          // Insights para PyME Ejemplo S.A. - empresa en crecimiento
          {
            type: 'positive',
            title: 'Crecimiento sostenido en ventas',
            description: 'Las ventas netas han crecido consistentemente 75% en los últimos 6 meses',
            impact: 'high',
          },
          {
            type: 'warning',
            title: 'Reducción en crédito fiscal',
            description: 'El crédito fiscal ha disminuido 37%, sugiriendo menor actividad de compras',
            impact: 'medium',
          },
          {
            type: 'info',
            title: 'Estabilización de PPM',
            description: 'Los pagos provisionales mensuales muestran crecimiento ordenado',
            impact: 'low',
          },
        ] : [
          // Insights para Mi Pyme Ltda. - empresa estable
          {
            type: 'info',
            title: 'Operación estable y predecible',
            description: 'Los montos de IVA se mantienen consistentes mes a mes con variaciones menores',
            impact: 'medium',
          },
          {
            type: 'positive',
            title: 'Balance equilibrado débito/crédito',
            description: 'Mantiene un balance saludable entre compras y ventas sin fluctuaciones bruscas',
            impact: 'low',
          },
          {
            type: 'warning',
            title: 'Oportunidad de crecimiento',
            description: 'Los números sugieren capacidad para incrementar operaciones sin riesgo',
            impact: 'medium',
          },
        ],
        recommendations: isCompany1 ? [
          // Recomendaciones para empresa en crecimiento
          'Considerar planificación de compras para optimizar crédito fiscal',
          'Evaluar incremento en PPM para evitar diferencias grandes en operación renta',
          'Mantener registro detallado del crecimiento para proyecciones futuras',
        ] : [
          // Recomendaciones para empresa estable
          'Evaluar oportunidades de crecimiento manteniendo la estabilidad actual',
          'Considerar inversión en capital de trabajo para expansion controlada',
          'Mantener la consistencia en los procesos que han generado esta estabilidad',
        ],
      }

      setData(mockData)
    } catch (error) {
      console.error('Error loading F29 analysis:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)

  const formatPeriod = (period: string) => {
    const year = period.substring(0, 4)
    const month = parseInt(period.substring(4, 6))
    const monthNames = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
    ]
    return `${monthNames[month - 1]} ${year}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filed':
        return 'text-green-600 bg-green-50'
      case 'reviewed':
        return 'text-blue-600 bg-blue-50'
      case 'processed':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      filed: 'Presentado',
      reviewed: 'Revisado',
      processed: 'Procesado',
      pending: 'Pendiente',
    }
    return labels[status as keyof typeof labels] || status
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      default:
        return <Target className="w-4 h-4 text-blue-600" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'border-green-200 bg-green-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  const getTrendIcon = () => {
    if (!data) return null
    return data.trend === 'improving' ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : data.trend === 'declining' ? (
      <TrendingDown className="w-4 h-4 text-red-600" />
    ) : (
      <BarChart3 className="w-4 h-4 text-blue-600" />
    )
  }

  const getTrendColor = () => {
    if (!data) return 'text-gray-600'
    return data.trend === 'improving' ? 'text-green-600' :
           data.trend === 'declining' ? 'text-red-600' : 'text-blue-600'
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Análisis F29 Comparativo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-gray-200 rounded" />
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data?.periods.length) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No hay datos F29 para análisis</p>
            <button
              onClick={loadF29Analysis}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Cargar análisis
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <span>Análisis F29 Comparativo</span>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={selectedPeriods}
              onChange={(e) => { setSelectedPeriods(Number(e.target.value)); }}
              className="text-xs border rounded px-2 py-1"
            >
              <option value={3}>3 meses</option>
              <option value={6}>6 meses</option>
              <option value={12}>12 meses</option>
              <option value={24}>24 meses</option>
            </select>
            <div className="flex space-x-1">
              {['overview', 'detailed', 'insights'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => { setViewMode(mode as typeof viewMode); }}
                  className={`px-2 py-1 text-xs rounded ${
                    viewMode === mode
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {mode === 'overview' ? 'Vista' : mode === 'detailed' ? 'Detalle' : 'Insights'}
                </button>
              ))}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {viewMode === 'overview' && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Calculator className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-700">Promedio IVA</span>
                </div>
                <div className="text-lg font-bold text-blue-700">
                  {formatCurrency(data.averageIVA)}
                </div>
                <p className="text-xs text-blue-600">{data.totalPeriods} períodos</p>
              </div>
              <div className="text-center p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  {getTrendIcon()}
                  <span className="text-sm font-semibold text-gray-700">Tendencia</span>
                </div>
                <div className={`text-lg font-bold ${getTrendColor()}`}>
                  {data.trend === 'improving' ? 'Mejorando' :
                   data.trend === 'declining' ? 'Declinando' : 'Estable'}
                </div>
                <p className="text-xs text-gray-600">
                  {data.trendPercentage > 0 ? '+' : ''}{data.trendPercentage}%
                </p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-700">Estado</span>
                </div>
                <div className="text-lg font-bold text-purple-700">
                  {data.periods.filter(p => p.status === 'filed').length}/{data.periods.length}
                </div>
                <p className="text-xs text-purple-600">Presentados</p>
              </div>
            </div>

            {/* Recent Periods */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Últimos Períodos</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {data.periods.slice(-3).reverse().map((period) => (
                  <div key={period.period} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{period.month}</div>
                      <div className="text-xs text-gray-600">
                        IVA: {formatCurrency(period.ivaResultante)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">
                        {formatCurrency(period.totalPagar)}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(period.status)}`}>
                        {getStatusLabel(period.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {viewMode === 'detailed' && (
          <>
            {/* Detailed Period Analysis */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Análisis Detallado por Período</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {data.periods.map((period) => (
                  <div key={period.period} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{period.month}</h5>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(period.status)}`}>
                        {getStatusLabel(period.status)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Débito Fiscal:</span>
                          <span className="font-medium">{formatCurrency(period.debitoFiscal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Crédito Fiscal:</span>
                          <span className="font-medium">{formatCurrency(period.creditoFiscal)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-1">
                          <span className="text-gray-600">IVA Resultante:</span>
                          <span className={`font-bold ${period.ivaResultante >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(period.ivaResultante)}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">PPM:</span>
                          <span className="font-medium">{formatCurrency(period.ppm)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Remanente:</span>
                          <span className="font-medium">{formatCurrency(period.remanente)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-1">
                          <span className="text-gray-600">Total a Pagar:</span>
                          <span className="font-bold text-blue-600">{formatCurrency(period.totalPagar)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {viewMode === 'insights' && (
          <>
            {/* Insights and Recommendations */}
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Insights del Análisis</h4>
                <div className="space-y-2">
                  {data.insights.map((insight, index) => (
                    <div key={index} className={`p-2 border rounded ${getInsightColor(insight.type)}`}>
                      <div className="flex items-start space-x-2">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-gray-900">{insight.title}</h5>
                          <p className="text-xs text-gray-700 mt-1">{insight.description}</p>
                        </div>
                        <span className="text-xs px-1 py-0.5 bg-white bg-opacity-50 rounded">
                          {insight.impact}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recomendaciones</h4>
                <div className="space-y-1">
                  {data.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-2 text-xs">
                      <Target className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
          <button className="flex items-center justify-center space-x-1 py-2 px-3 bg-purple-50 hover:bg-purple-100 rounded text-purple-600 text-sm font-medium transition-colors">
            <FileText className="w-4 h-4" />
            <span>Ver F29s</span>
          </button>
          <button className="flex items-center justify-center space-x-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 rounded text-blue-600 text-sm font-medium transition-colors">
            <BarChart3 className="w-4 h-4" />
            <span>Reportes</span>
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
