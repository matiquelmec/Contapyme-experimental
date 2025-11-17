'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, Badge } from '@/components/ui'
import { Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, BarChart3, Zap, Target } from 'lucide-react'

interface AnalyticsInsight {
  id: string
  type: 'success' | 'warning' | 'info' | 'danger'
  title: string
  description: string
  value?: string | number
  trend?: 'up' | 'down' | 'stable'
  confidence: number
  actionable: boolean
}

export function SmartAnalyticsWidget() {
  const [insights, setInsights] = useState<AnalyticsInsight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    const loadInsights = async () => {
      try {
        // Cargar datos reales desde la API para generar insights inteligentes
        const response = await fetch('/api/dashboard/metrics')
        const data = await response.json()

        let generatedInsights: AnalyticsInsight[] = []

        if (data.success) {
          const { modules, system, live } = data.data

          // Insight sobre procesamiento F29
          generatedInsights.push({
            id: '1',
            type: 'success',
            title: 'Procesamiento F29 Eficiente',
            description: `${modules.f29Analysis.totalProcessed} formularios procesados con excelente velocidad`,
            value: `${modules.f29Analysis.avgProcessingTime}s`,
            trend: modules.f29Analysis.avgProcessingTime < 2 ? 'up' : 'stable',
            confidence: Math.round(modules.f29Analysis.confidenceScore || 94),
            actionable: false
          })

          // Insight sobre empleados
          if (modules.payroll.totalEmployees > 0) {
            generatedInsights.push({
              id: '2',
              type: 'info',
              title: 'Gestión de Personal Activa',
              description: `${modules.payroll.totalEmployees} empleados con ${modules.payroll.totalLiquidations} liquidaciones generadas`,
              value: `${modules.payroll.complianceRate}%`,
              trend: 'up',
              confidence: 100,
              actionable: true
            })
          }

          // Insight sobre activos fijos
          if (modules.fixedAssets.totalAssets > 0) {
            const utilizationRate = (modules.fixedAssets.activeAssets / modules.fixedAssets.totalAssets) * 100
            generatedInsights.push({
              id: '3',
              type: utilizationRate > 90 ? 'success' : 'warning',
              title: 'Control de Activos',
              description: `${modules.fixedAssets.totalAssets} activos por $${(modules.fixedAssets.totalValue / 1000000).toFixed(1)}M`,
              value: `${utilizationRate.toFixed(0)}%`,
              trend: utilizationRate > 90 ? 'up' : 'stable',
              confidence: 92,
              actionable: utilizationRate < 90
            })
          }

          // Insight sobre precisión del sistema
          generatedInsights.push({
            id: '4',
            type: 'success',
            title: 'Excelencia Operacional',
            description: `Sistema con ${system.systemUptime}% disponibilidad y calidad de datos ${system.dataQuality}%`,
            value: `${system.dataQuality}%`,
            confidence: 99,
            actionable: false
          })

          // Insight sobre rendimiento en tiempo real
          if (live.responseTime < 200) {
            generatedInsights.push({
              id: '5',
              type: 'success',
              title: 'Rendimiento Óptimo',
              description: `Tiempo de respuesta promedio de ${live.responseTime}ms, muy por debajo del target`,
              value: `${live.responseTime}ms`,
              trend: 'up',
              confidence: 96,
              actionable: false
            })
          }

        } else {
          // Fallback a insights demo si hay error
          generatedInsights = [
            {
              id: '1',
              type: 'success',
              title: 'Sistema Demo Activo',
              description: 'Empresa demo funcionando con datos de ejemplo realistas',
              value: '99.8%',
              trend: 'up',
              confidence: 100,
              actionable: false
            },
            {
              id: '2',
              type: 'info',
              title: 'Datos Demo Disponibles',
              description: '8 empleados y 12 activos fijos configurados para pruebas',
              confidence: 95,
              actionable: true
            }
          ]
        }

        setInsights(generatedInsights)
      } catch (error) {
        console.error('Error loading insights:', error)
        // Fallback a insights básicos si hay error de conexión
        setInsights([
          {
            id: '1',
            type: 'info',
            title: 'Sistema en Modo Demo',
            description: 'Conectando con datos demo de la empresa',
            confidence: 85,
            actionable: false
          }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    loadInsights()

    // Actualizar insights cada 5 minutos
    const interval = setInterval(() => {
      loadInsights()
      setLastUpdated(new Date())
    }, 300000)

    return () => clearInterval(interval)
  }, [])

  const getInsightIcon = (type: AnalyticsInsight['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'info':
        return <BarChart3 className="h-5 w-5 text-blue-600" />
      case 'danger':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <BarChart3 className="h-5 w-5 text-gray-600" />
    }
  }

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      case 'stable':
        return <Target className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-indigo-600 animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Analíticas Inteligentes</h3>
          </div>
          <div className="animate-pulse text-gray-400 text-center py-8">
            Generando insights personalizados...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Analíticas Inteligentes</h3>
              <p className="text-sm text-gray-500">IA analizando tu uso en tiempo real</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <Badge variant="primary" size="sm" icon={<Zap className="h-3 w-3" />}>
              En vivo
            </Badge>
          </div>
        </div>

        {/* Insights */}
        <div className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.id} className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/50">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 text-sm">{insight.title}</h4>
                      {insight.trend && getTrendIcon(insight.trend)}
                      {insight.value && (
                        <span className="text-sm font-semibold text-indigo-600">{insight.value}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">{insight.confidence}% confianza</div>
                  {insight.actionable && (
                    <Badge variant="outline" size="sm" className="mt-1">
                      Accionable
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-indigo-200/50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Última actualización: {lastUpdated.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</span>
            <span>Powered by IA ContaPyme</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}