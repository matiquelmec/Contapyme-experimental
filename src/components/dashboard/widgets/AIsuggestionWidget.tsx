'use client'

import { useState, useEffect } from 'react'

import {
  Brain,
  TrendingUp,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Star,
  Target,
  Zap,
  RefreshCw,
  X,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'

interface AISuggestion {
  id: string
  type: 'optimization' | 'alert' | 'opportunity' | 'insight' | 'action'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: string
  confidence: number
  category: 'financial' | 'operational' | 'strategic' | 'compliance' | 'hr'
  actionable: boolean
  estimatedSavings?: number
  implementation: 'immediate' | 'short_term' | 'long_term'
  tags: string[]
  createdAt: string
  status: 'new' | 'viewed' | 'implemented' | 'dismissed'
}

interface AISuggestionsData {
  suggestions: AISuggestion[]
  totalSuggestions: number
  highPriorityCount: number
  potentialSavings: number
  implementationRate: number
}

export function AIsuggestionWidget() {
  const [data, setData] = useState<AISuggestionsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentSuggestion, setCurrentSuggestion] = useState(0)
  const [filter, setFilter] = useState<'all' | 'high' | 'actionable' | 'new'>('all')
  const [showAllModal, setShowAllModal] = useState(false)
  const [isGeneratingMore, setIsGeneratingMore] = useState(false)

  useEffect(() => {
    loadAISuggestions()
  }, [])

  const loadAISuggestions = async () => {
    try {
      // TODO: Replace with real API call
      // const response = await fetch('/api/dashboard/ai-suggestions')
      // const data = await response.json()

      // Demo data with realistic AI suggestions for Chilean PyMEs
      const mockData: AISuggestionsData = {
        totalSuggestions: 8,
        highPriorityCount: 3,
        potentialSavings: 2850000,
        implementationRate: 67.5,
        suggestions: [
          {
            id: '1',
            type: 'optimization',
            priority: 'high',
            title: 'Optimizar gestión de inventario',
            description: 'Detectamos patrones de sobrestock en productos de baja rotación que representan capital inmovilizado.',
            impact: 'Reducción de 15-20% en costos de inventario',
            confidence: 92,
            category: 'operational',
            actionable: true,
            estimatedSavings: 1200000,
            implementation: 'short_term',
            tags: ['inventario', 'costos', 'optimización'],
            createdAt: '2024-11-15T10:30:00Z',
            status: 'new',
          },
          {
            id: '2',
            type: 'opportunity',
            priority: 'high',
            title: 'Aprovechar beneficios tributarios PyME',
            description: 'Existen créditos fiscales y beneficios tributarios específicos para PyMEs que no están siendo aprovechados.',
            impact: 'Ahorro tributario potencial de $800K-1.2M',
            confidence: 88,
            category: 'compliance',
            actionable: true,
            estimatedSavings: 950000,
            implementation: 'immediate',
            tags: ['tributario', 'sii', 'beneficios'],
            createdAt: '2024-11-14T15:45:00Z',
            status: 'new',
          },
          {
            id: '3',
            type: 'alert',
            priority: 'high',
            title: 'Patrón de pagos tardíos detectado',
            description: 'El 23% de los clientes han aumentado sus días de pago promedio en los últimos 3 meses.',
            impact: 'Riesgo de flujo de caja negativo',
            confidence: 94,
            category: 'financial',
            actionable: true,
            implementation: 'immediate',
            tags: ['cobranza', 'flujo-caja', 'clientes'],
            createdAt: '2024-11-13T09:20:00Z',
            status: 'viewed',
          },
          {
            id: '4',
            type: 'insight',
            priority: 'medium',
            title: 'Estacionalidad en ventas identificada',
            description: 'Las ventas muestran un patrón consistente de aumento del 35% entre octubre y diciembre.',
            impact: 'Oportunidad de planificación estratégica',
            confidence: 89,
            category: 'strategic',
            actionable: true,
            implementation: 'long_term',
            tags: ['ventas', 'estacionalidad', 'planificación'],
            createdAt: '2024-11-12T14:15:00Z',
            status: 'viewed',
          },
          {
            id: '5',
            type: 'optimization',
            priority: 'medium',
            title: 'Automatizar reconciliación bancaria',
            description: 'La reconciliación manual toma 4-6 horas mensuales. Automatización podría reducirlo a 30 minutos.',
            impact: 'Ahorro de 5.5 horas mensuales de trabajo',
            confidence: 85,
            category: 'operational',
            actionable: true,
            estimatedSavings: 180000,
            implementation: 'short_term',
            tags: ['automatización', 'banco', 'tiempo'],
            createdAt: '2024-11-11T11:30:00Z',
            status: 'implemented',
          },
        ],
      }

      setData(mockData)
    } catch (error) {
      console.error('Error loading AI suggestions:', error)
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'optimization':
        return <Zap className="w-4 h-4 text-blue-600" />
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case 'opportunity':
        return <Target className="w-4 h-4 text-green-600" />
      case 'insight':
        return <Lightbulb className="w-4 h-4 text-yellow-600" />
      case 'action':
        return <CheckCircle className="w-4 h-4 text-purple-600" />
      default:
        return <Brain className="w-4 h-4 text-gray-600" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'financial':
        return 'text-green-600 bg-green-50'
      case 'operational':
        return 'text-blue-600 bg-blue-50'
      case 'strategic':
        return 'text-purple-600 bg-purple-50'
      case 'compliance':
        return 'text-red-600 bg-red-50'
      case 'hr':
        return 'text-orange-600 bg-orange-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getImplementationLabel = (implementation: string) => {
    switch (implementation) {
      case 'immediate':
        return 'Inmediato'
      case 'short_term':
        return 'Corto plazo'
      case 'long_term':
        return 'Largo plazo'
      default:
        return implementation
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'implemented':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'viewed':
        return <Star className="w-4 h-4 text-yellow-600" />
      case 'dismissed':
        return <AlertCircle className="w-4 h-4 text-gray-600" />
      default:
        return <Zap className="w-4 h-4 text-blue-600" />
    }
  }

  const filteredSuggestions = data?.suggestions.filter(suggestion => {
    switch (filter) {
      case 'high':
        return suggestion.priority === 'high'
      case 'actionable':
        return suggestion.actionable
      case 'new':
        return suggestion.status === 'new'
      default:
        return true
    }
  }) || []

  const handleNextSuggestion = () => {
    if (filteredSuggestions.length > 0) {
      setCurrentSuggestion((prev) => (prev + 1) % filteredSuggestions.length)
    }
  }

  const handlePrevSuggestion = () => {
    if (filteredSuggestions.length > 0) {
      setCurrentSuggestion((prev) => prev === 0 ? filteredSuggestions.length - 1 : prev - 1)
    }
  }

  const handleShowAllSuggestions = () => {
    setShowAllModal(true)
  }

  const handleGenerateMoreSuggestions = async () => {
    setIsGeneratingMore(true)
    try {
      // Simular generación de nuevas sugerencias IA
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Recargar sugerencias después de generar nuevas
      await loadAISuggestions()

      // Mostrar notificación de éxito
      // TODO: Implementar sistema de notificaciones
      console.log('Nuevas sugerencias generadas exitosamente')
    } catch (error) {
      console.error('Error generating more suggestions:', error)
    } finally {
      setIsGeneratingMore(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5" />
            <span>Sugerencias IA</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-gray-200 rounded" />
            <div className="h-8 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data?.suggestions.length) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <Brain className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No hay sugerencias disponibles</p>
            <button
              onClick={loadAISuggestions}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Generar sugerencias
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentItem = filteredSuggestions[currentSuggestion]

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <span>Sugerencias IA</span>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={filter}
              onChange={(e) => { setFilter(e.target.value as typeof filter); }}
              className="text-xs border rounded px-2 py-1"
            >
              <option value="all">Todas ({data.totalSuggestions})</option>
              <option value="high">Alta prioridad ({data.highPriorityCount})</option>
              <option value="actionable">Accionables</option>
              <option value="new">Nuevas</option>
            </select>
            <button
              onClick={loadAISuggestions}
              className="p-1 hover:bg-gray-100 rounded"
              title="Generar nuevas sugerencias"
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <div className="text-sm font-bold text-green-700">
              {formatCurrency(data.potentialSavings)}
            </div>
            <p className="text-xs text-green-600">Ahorro potencial</p>
          </div>
          <div className="text-center p-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
            <div className="flex items-center justify-center space-x-1">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-bold text-purple-700">{data.implementationRate}%</span>
            </div>
            <p className="text-xs text-purple-600">Tasa implementación</p>
          </div>
        </div>

        {/* Current Suggestion */}
        {currentItem && (
          <div className={`p-4 border rounded-lg ${getPriorityColor(currentItem.priority)}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getTypeIcon(currentItem.type)}
                {getStatusIcon(currentItem.status)}
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <span className="text-gray-500">
                  {currentSuggestion + 1}/{filteredSuggestions.length}
                </span>
                <div className="flex space-x-1">
                  <button
                    onClick={handlePrevSuggestion}
                    className="w-6 h-6 flex items-center justify-center hover:bg-white hover:bg-opacity-50 rounded"
                    disabled={filteredSuggestions.length <= 1}
                  >
                    ←
                  </button>
                  <button
                    onClick={handleNextSuggestion}
                    className="w-6 h-6 flex items-center justify-center hover:bg-white hover:bg-opacity-50 rounded"
                    disabled={filteredSuggestions.length <= 1}
                  >
                    →
                  </button>
                </div>
              </div>
            </div>

            <h3 className="font-semibold text-sm mb-1">{currentItem.title}</h3>
            <p className="text-xs text-gray-700 mb-2">{currentItem.description}</p>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">Impacto:</span>
                <span className="text-gray-600">{currentItem.impact}</span>
              </div>
              {currentItem.estimatedSavings && (
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">Ahorro estimado:</span>
                  <span className="text-green-600 font-bold">
                    {formatCurrency(currentItem.estimatedSavings)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">Confianza:</span>
                <div className="flex items-center space-x-1">
                  <div className="w-12 h-1.5 bg-gray-200 rounded-full">
                    <div
                      className="h-1.5 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                      style={{ width: `${currentItem.confidence}%` }}
                     />
                  </div>
                  <span className="text-gray-600">{currentItem.confidence}%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(currentItem.category)}`}>
                  {currentItem.category}
                </span>
                <span className="text-xs text-gray-600">
                  {getImplementationLabel(currentItem.implementation)}
                </span>
              </div>
              {currentItem.actionable && (
                <button className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800">
                  <span>Implementar</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
          <button
            onClick={handleShowAllSuggestions}
            className="flex items-center justify-center space-x-1 py-2 px-3 bg-purple-50 hover:bg-purple-100 rounded text-purple-600 text-sm font-medium transition-colors"
          >
            <Brain className="w-4 h-4" />
            <span>Ver todas</span>
          </button>
          <button
            onClick={handleGenerateMoreSuggestions}
            disabled={isGeneratingMore}
            className="flex items-center justify-center space-x-1 py-2 px-3 bg-green-50 hover:bg-green-100 rounded text-green-600 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingMore ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Lightbulb className="w-4 h-4" />
            )}
            <span>{isGeneratingMore ? 'Generando...' : 'Generar más'}</span>
          </button>
        </div>

        {/* Modal Ver Todas las Sugerencias */}
        {showAllModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden mx-4">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Todas las Sugerencias IA</h2>
                  <button
                    onClick={() => { setShowAllModal(false); }}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <div className="grid gap-4">
                  {data?.suggestions.map((suggestion, index) => (
                    <div key={suggestion.id} className={`p-4 border rounded-lg ${getPriorityColor(suggestion.priority)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(suggestion.type)}
                          {getStatusIcon(suggestion.status)}
                          <h3 className="font-semibold text-sm">{suggestion.title}</h3>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(suggestion.category)}`}>
                          {suggestion.category}
                        </span>
                      </div>

                      <p className="text-xs text-gray-700 mb-2">{suggestion.description}</p>

                      <div className="space-y-1 mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium">Impacto:</span>
                          <span className="text-gray-600">{suggestion.impact}</span>
                        </div>
                        {suggestion.estimatedSavings && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium">Ahorro estimado:</span>
                            <span className="text-green-600 font-bold">
                              {formatCurrency(suggestion.estimatedSavings)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium">Confianza:</span>
                          <div className="flex items-center space-x-1">
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full">
                              <div
                                className="h-1.5 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                                style={{ width: `${suggestion.confidence}%` }}
                               />
                            </div>
                            <span className="text-gray-600">{suggestion.confidence}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">
                          {getImplementationLabel(suggestion.implementation)}
                        </span>
                        {suggestion.actionable && (
                          <button className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors">
                            <span>Implementar</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Total: {data?.suggestions.length} sugerencias |
                    Ahorro potencial: {formatCurrency(data?.potentialSavings || 0)}
                  </div>
                  <button
                    onClick={() => { setShowAllModal(false); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
