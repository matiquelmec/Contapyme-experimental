'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import {
  AlertTriangle,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  Bell,
  Eye
} from 'lucide-react'

interface ContractAlert {
  id: string
  type: 'expiring' | 'expired' | 'renewal' | 'review' | 'amendment'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  employeeName: string
  employeeId: string
  contractType: 'indefinido' | 'plazo_fijo' | 'obra' | 'honorarios'
  dueDate: string
  daysRemaining: number
  actionRequired: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
}

interface ContractAlertsData {
  alerts: ContractAlert[]
  totalAlerts: number
  highPriorityCount: number
  expiringSoon: number
  overdue: number
}

export function ContractAlerts() {
  const [data, setData] = useState<ContractAlertsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'high' | 'expiring' | 'overdue'>('all')

  useEffect(() => {
    loadContractAlerts()
  }, [])

  const loadContractAlerts = async () => {
    try {
      // TODO: Replace with real API call
      // const response = await fetch('/api/dashboard/contract-alerts')
      // const data = await response.json()

      // Demo data with realistic contract alert scenarios
      const mockData: ContractAlertsData = {
        totalAlerts: 7,
        highPriorityCount: 3,
        expiringSoon: 4,
        overdue: 1,
        alerts: [
          {
            id: '1',
            type: 'expiring',
            priority: 'high',
            title: 'Contrato próximo a vencer',
            description: 'Contrato plazo fijo termina en 15 días',
            employeeName: 'María García López',
            employeeId: '12.345.678-9',
            contractType: 'plazo_fijo',
            dueDate: '2024-11-30',
            daysRemaining: 15,
            actionRequired: 'Decidir renovación o término',
            status: 'pending'
          },
          {
            id: '2',
            type: 'expired',
            priority: 'high',
            title: 'Contrato vencido',
            description: 'Contrato venció hace 3 días sin renovación',
            employeeName: 'Carlos Rodríguez',
            employeeId: '98.765.432-1',
            contractType: 'plazo_fijo',
            dueDate: '2024-11-12',
            daysRemaining: -3,
            actionRequired: 'Regularizar situación contractual',
            status: 'overdue'
          },
          {
            id: '3',
            type: 'renewal',
            priority: 'medium',
            title: 'Renovación programada',
            description: 'Empleado solicita renovación de contrato',
            employeeName: 'Ana Fernández',
            employeeId: '11.222.333-4',
            contractType: 'plazo_fijo',
            dueDate: '2024-12-15',
            daysRemaining: 30,
            actionRequired: 'Evaluar desempeño y renovar',
            status: 'in_progress'
          },
          {
            id: '4',
            type: 'review',
            priority: 'low',
            title: 'Revisión periódica',
            description: 'Revisión anual de condiciones contractuales',
            employeeName: 'Pedro Martínez',
            employeeId: '55.666.777-8',
            contractType: 'indefinido',
            dueDate: '2024-12-01',
            daysRemaining: 16,
            actionRequired: 'Revisar cláusulas y condiciones',
            status: 'pending'
          },
          {
            id: '5',
            type: 'amendment',
            priority: 'medium',
            title: 'Modificación pendiente',
            description: 'Cambio de jornada laboral aprobado',
            employeeName: 'Laura González',
            employeeId: '77.888.999-0',
            contractType: 'indefinido',
            dueDate: '2024-11-25',
            daysRemaining: 10,
            actionRequired: 'Generar anexo contractual',
            status: 'in_progress'
          },
          {
            id: '6',
            type: 'expiring',
            priority: 'high',
            title: 'Período de prueba',
            description: 'Período de prueba termina pronto',
            employeeName: 'Roberto Silva',
            employeeId: '33.444.555-6',
            contractType: 'indefinido',
            dueDate: '2024-11-28',
            daysRemaining: 13,
            actionRequired: 'Evaluar continuidad laboral',
            status: 'pending'
          },
          {
            id: '7',
            type: 'expiring',
            priority: 'medium',
            title: 'Contrato obra próximo',
            description: 'Contrato por obra terminando',
            employeeName: 'Sofía Herrera',
            employeeId: '99.000.111-2',
            contractType: 'obra',
            dueDate: '2024-12-10',
            daysRemaining: 25,
            actionRequired: 'Verificar avance de obra',
            status: 'pending'
          }
        ]
      }

      setData(mockData)
    } catch (error) {
      console.error('Error loading contract alerts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

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
      case 'expiring':
        return <Clock className="w-4 h-4" />
      case 'expired':
        return <XCircle className="w-4 h-4" />
      case 'renewal':
        return <FileText className="w-4 h-4" />
      case 'review':
        return <Eye className="w-4 h-4" />
      case 'amendment':
        return <FileText className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600'
      case 'in_progress':
        return 'text-blue-600'
      case 'overdue':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getDaysRemainingColor = (days: number) => {
    if (days < 0) return 'text-red-600 font-bold'
    if (days <= 7) return 'text-red-600'
    if (days <= 30) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const getContractTypeLabel = (type: string) => {
    const labels = {
      indefinido: 'Indefinido',
      plazo_fijo: 'Plazo Fijo',
      obra: 'Por Obra',
      honorarios: 'Honorarios'
    }
    return labels[type as keyof typeof labels] || type
  }

  const filteredAlerts = data?.alerts.filter(alert => {
    switch (filter) {
      case 'high':
        return alert.priority === 'high'
      case 'expiring':
        return alert.type === 'expiring' && alert.daysRemaining <= 30
      case 'overdue':
        return alert.status === 'overdue' || alert.daysRemaining < 0
      default:
        return true
    }
  }) || []

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Alertas Contractuales</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || !data.alerts.length) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-gray-500">No hay alertas contractuales</p>
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
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span>Alertas Contractuales</span>
          </div>
          <div className="flex items-center space-x-1">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="text-xs border rounded px-2 py-1"
            >
              <option value="all">Todas ({data.totalAlerts})</option>
              <option value="high">Altas ({data.highPriorityCount})</option>
              <option value="expiring">Vencen ({data.expiringSoon})</option>
              <option value="overdue">Vencidas ({data.overdue})</option>
            </select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 bg-red-50 rounded">
            <div className="font-bold text-red-600">{data.highPriorityCount}</div>
            <div className="text-red-600">Alta prioridad</div>
          </div>
          <div className="p-2 bg-yellow-50 rounded">
            <div className="font-bold text-yellow-600">{data.expiringSoon}</div>
            <div className="text-yellow-600">Próximos</div>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <div className="font-bold text-red-600">{data.overdue}</div>
            <div className="text-gray-600">Vencidos</div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 border rounded-lg ${getPriorityColor(alert.priority)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(alert.type)}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold truncate">{alert.title}</h4>
                    <p className="text-xs text-gray-600 truncate">{alert.employeeName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-bold ${getDaysRemainingColor(alert.daysRemaining)}`}>
                    {alert.daysRemaining < 0
                      ? `${Math.abs(alert.daysRemaining)}d vencido`
                      : alert.daysRemaining === 0
                      ? 'Hoy'
                      : `${alert.daysRemaining}d`
                    }
                  </div>
                  <div className="text-xs text-gray-500">
                    {getContractTypeLabel(alert.contractType)}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-gray-700">{alert.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-600">
                      {formatDate(alert.dueDate)}
                    </span>
                  </div>
                  <span className={`text-xs ${getStatusColor(alert.status)}`}>
                    •
                  </span>
                </div>
                <div className="text-xs text-gray-600 bg-white bg-opacity-50 rounded p-1">
                  <strong>Acción:</strong> {alert.actionRequired}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAlerts.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-500">No hay alertas en esta categoría</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
          <button className="flex items-center justify-center space-x-1 py-2 px-3 bg-red-50 hover:bg-red-100 rounded text-red-600 text-sm font-medium transition-colors">
            <Users className="w-4 h-4" />
            <span>Gestionar</span>
          </button>
          <button className="flex items-center justify-center space-x-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 rounded text-blue-600 text-sm font-medium transition-colors">
            <FileText className="w-4 h-4" />
            <span>Contratos</span>
          </button>
        </div>
      </CardContent>
    </Card>
  )
}