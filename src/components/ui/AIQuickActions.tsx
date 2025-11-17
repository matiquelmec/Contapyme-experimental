'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, Badge, Button } from '@/components/ui'
import {
  Zap,
  Brain,
  FileText,
  Calculator,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  AlertCircle,
  Lightbulb,
  Target,
  Clock
} from 'lucide-react'

interface QuickAction {
  id: string
  title: string
  description: string
  url: string
  icon: React.ReactNode
  priority: 'high' | 'medium' | 'low'
  aiConfidence: number
  category: 'analysis' | 'management' | 'insights' | 'efficiency'
  estimatedTime: string
  aiReason: string
}

export function AIQuickActions() {
  const [actions, setActions] = useState<QuickAction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    const generateAIActions = async () => {
      try {
        // Simular análisis IA de acciones recomendadas
        const currentHour = new Date().getHours()
        const isBusinessHours = currentHour >= 9 && currentHour <= 18
        const isMonthEnd = new Date().getDate() > 25

        const aiActions: QuickAction[] = [
          {
            id: 'analyze-f29',
            title: 'Analizar Formulario F29',
            description: 'Procesar y extraer insights de tu último F29',
            url: '/accounting/f29-analysis',
            icon: <FileText className="h-5 w-5" />,
            priority: isMonthEnd ? 'high' : 'medium',
            aiConfidence: 94,
            category: 'analysis',
            estimatedTime: '2-3 min',
            aiReason: isMonthEnd ? 'Fin de mes - momento ideal para análisis' : 'Optimización recomendada para tu flujo de trabajo'
          },
          {
            id: 'payroll-calculation',
            title: 'Calcular Liquidaciones',
            description: 'Generar liquidaciones de sueldo automáticas',
            url: '/payroll/liquidations/generate',
            icon: <Calculator className="h-5 w-5" />,
            priority: isBusinessHours ? 'high' : 'low',
            aiConfidence: 91,
            category: 'management',
            estimatedTime: '5-10 min',
            aiReason: isBusinessHours ? 'Horario laboral - alta productividad' : 'Considera realizar en horario laboral'
          },
          {
            id: 'indicators-review',
            title: 'Revisar Indicadores UF/UTM',
            description: 'Verificar indicadores económicos actualizados',
            url: '/accounting/indicators',
            icon: <TrendingUp className="h-5 w-5" />,
            priority: 'high',
            aiConfidence: 88,
            category: 'insights',
            estimatedTime: '1-2 min',
            aiReason: 'Indicadores actualizados hoy - información fresca disponible'
          },
          {
            id: 'asset-management',
            title: 'Gestionar Activos Fijos',
            description: 'Revisar depreciación y estado de activos',
            url: '/accounting/fixed-assets',
            icon: <BarChart3 className="h-5 w-5" />,
            priority: 'medium',
            aiConfidence: 86,
            category: 'management',
            estimatedTime: '3-5 min',
            aiReason: 'Control mensual recomendado para optimización fiscal'
          },
          {
            id: 'comparative-analysis',
            title: 'Análisis Comparativo F29',
            description: 'Comparar múltiples períodos para insights',
            url: '/accounting/f29-comparative',
            icon: <Brain className="h-5 w-5" />,
            priority: 'medium',
            aiConfidence: 92,
            category: 'insights',
            estimatedTime: '5-8 min',
            aiReason: 'IA detecta patrones estacionales en tus datos'
          },
          {
            id: 'employee-onboarding',
            title: 'Agregar Nuevo Empleado',
            description: 'Onboarding completo con configuración automática',
            url: '/payroll/employees/new',
            icon: <Users className="h-5 w-5" />,
            priority: 'low',
            aiConfidence: 85,
            category: 'efficiency',
            estimatedTime: '8-12 min',
            aiReason: 'Proceso optimizado con validaciones automáticas'
          }
        ]

        setActions(aiActions.sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority] || b.aiConfidence - a.aiConfidence
        }))
      } catch (error) {
        console.error('Error generating AI actions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    generateAIActions()
  }, [])

  const getPriorityColor = (priority: QuickAction['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryActions = () => {
    if (selectedCategory === 'all') return actions
    return actions.filter(action => action.category === selectedCategory)
  }

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-purple-600 animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Acciones Rápidas IA</h3>
          </div>
          <div className="animate-pulse text-gray-400 text-center py-8">
            Analizando tu contexto y generando recomendaciones...
          </div>
        </CardContent>
      </Card>
    )
  }

  const filteredActions = getCategoryActions()

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Acciones Rápidas IA</h3>
              <p className="text-sm text-gray-500">Recomendaciones personalizadas en tiempo real</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="sm" icon={<Lightbulb className="h-3 w-3" />}>
              Inteligente
            </Badge>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {[
            { key: 'all', label: 'Todas' },
            { key: 'analysis', label: 'Análisis' },
            { key: 'management', label: 'Gestión' },
            { key: 'insights', label: 'Insights' },
            { key: 'efficiency', label: 'Eficiencia' }
          ].map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors whitespace-nowrap ${
                selectedCategory === category.key
                  ? 'bg-purple-100 text-purple-700 border-purple-300'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-purple-50'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          {filteredActions.slice(0, 4).map((action) => (
            <Link key={action.id} href={action.url}>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/50 hover:bg-white/80 transition-all cursor-pointer group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      {action.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 text-sm group-hover:text-purple-700 transition-colors">
                          {action.title}
                        </h4>
                        <Badge
                          variant="outline"
                          size="sm"
                          className={getPriorityColor(action.priority)}
                        >
                          {action.priority === 'high' ? 'Alta' : action.priority === 'medium' ? 'Media' : 'Baja'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{action.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{action.estimatedTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          <span>{action.aiConfidence}% IA</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Reason */}
                <div className="mt-3 pt-3 border-t border-purple-200/50">
                  <div className="flex items-center gap-2 text-xs text-purple-600">
                    <Brain className="h-3 w-3" />
                    <span className="italic">{action.aiReason}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-purple-200/50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Recomendaciones actualizadas cada hora</span>
            <span>Powered by ContaPyme IA</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}