'use client'

import { useState, useEffect } from 'react'

import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Target,
  Calculator,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'

interface PayrollBreakdown {
  baseSalaries: number
  socialSecurity: number
  healthInsurance: number
  unemployment: number
  familyAllowance: number
  bonuses: number
  overtime: number
  total: number
}

interface PayrollCostData {
  currentMonth: PayrollBreakdown
  previousMonth: PayrollBreakdown
  averageCostPerEmployee: number
  totalEmployees: number
  monthlyChange: number
  annualProjection: number
  payrollEfficiency: number
  upcomingPayments: Array<{
    description: string
    amount: number
    dueDate: string
    category: 'salary' | 'bonus' | 'social' | 'tax'
  }>
}

export function PayrollCostWidget() {
  const [data, setData] = useState<PayrollCostData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'overview' | 'breakdown' | 'schedule'>('overview')

  useEffect(() => {
    loadPayrollData()
  }, [])

  const loadPayrollData = async () => {
    try {
      // TODO: Replace with real API call
      // const response = await fetch('/api/dashboard/payroll-cost')
      // const data = await response.json()

      // Demo data with realistic Chilean payroll figures
      const mockData: PayrollCostData = {
        totalEmployees: 8,
        averageCostPerEmployee: 892500,
        monthlyChange: -3.2,
        annualProjection: 85680000,
        payrollEfficiency: 87.5,
        currentMonth: {
          baseSalaries: 5200000,
          socialSecurity: 520000, // 10% AFP aproximado
          healthInsurance: 364000, // 7% Fonasa aproximado
          unemployment: 156000, // 3% cesantía
          familyAllowance: 145000, // Asignación familiar
          bonuses: 280000, // Bonos varios
          overtime: 75000, // Horas extras
          total: 6740000,
        },
        previousMonth: {
          baseSalaries: 5200000,
          socialSecurity: 520000,
          healthInsurance: 364000,
          unemployment: 156000,
          familyAllowance: 145000,
          bonuses: 420000,
          overtime: 156000,
          total: 6961000,
        },
        upcomingPayments: [
          {
            description: 'Pago sueldos Noviembre',
            amount: 6740000,
            dueDate: '2024-11-30',
            category: 'salary',
          },
          {
            description: 'Cotizaciones previsionales',
            amount: 1040000,
            dueDate: '2024-12-10',
            category: 'social',
          },
          {
            description: 'Impuesto único trabajadores',
            amount: 285000,
            dueDate: '2024-12-12',
            category: 'tax',
          },
        ],
      }

      setData(mockData)
    } catch (error) {
      console.error('Error loading payroll data:', error)
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

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short',
    })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'salary':
        return 'text-blue-600 bg-blue-50'
      case 'bonus':
        return 'text-green-600 bg-green-50'
      case 'social':
        return 'text-purple-600 bg-purple-50'
      case 'tax':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600'
    if (efficiency >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Costo Total Nómina</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No hay datos de nómina disponibles</p>
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
            <Users className="w-5 h-5 text-green-600" />
            <span>Costo Total Nómina</span>
          </div>
          <div className="flex space-x-1">
            {['overview', 'breakdown', 'schedule'].map((mode) => (
              <button
                key={mode}
                onClick={() => { setViewMode(mode as typeof viewMode); }}
                className={`px-2 py-1 text-xs rounded ${
                  viewMode === mode
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {mode === 'overview' ? 'Vista' : mode === 'breakdown' ? 'Detalle' : 'Agenda'}
              </button>
            ))}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {viewMode === 'overview' && (
          <>
            {/* Total Cost */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.currentMonth.total)}
              </div>
              <div className="flex items-center justify-center space-x-1 mt-1">
                {data.monthlyChange > 0 ? (
                  <TrendingUp className="w-4 h-4 text-red-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-500" />
                )}
                <span className={`text-sm ${data.monthlyChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {Math.abs(data.monthlyChange)}% vs mes anterior
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {data.totalEmployees} empleados • {formatCurrency(data.averageCostPerEmployee)} promedio
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-700">Eficiencia</span>
                </div>
                <div className={`text-lg font-bold ${getEfficiencyColor(data.payrollEfficiency)}`}>
                  {data.payrollEfficiency}%
                </div>
                <p className="text-xs text-blue-600">Productividad nómina</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Calculator className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-700">Proyección</span>
                </div>
                <div className="text-lg font-bold text-green-700">
                  {formatCurrency(data.annualProjection)}
                </div>
                <p className="text-xs text-green-600">Costo anual</p>
              </div>
            </div>
          </>
        )}

        {viewMode === 'breakdown' && (
          <>
            {/* Cost Breakdown */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Desglose de Costos</h4>
              {Object.entries({
                'Sueldos base': data.currentMonth.baseSalaries,
                'Seg. social': data.currentMonth.socialSecurity,
                'Salud': data.currentMonth.healthInsurance,
                'Cesantía': data.currentMonth.unemployment,
                'Asig. familiar': data.currentMonth.familyAllowance,
                'Bonos': data.currentMonth.bonuses,
                'H. extras': data.currentMonth.overtime,
              }).map(([label, amount]) => {
                const percentage = (amount / data.currentMonth.total * 100).toFixed(1)
                return (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: label === 'Sueldos base' ? '#3B82F6' :
                                         label === 'Seg. social' ? '#8B5CF6' :
                                         label === 'Salud' ? '#06B6D4' :
                                         label === 'Cesantía' ? '#F59E0B' :
                                         label === 'Asig. familiar' ? '#10B981' :
                                         label === 'Bonos' ? '#EF4444' : '#6B7280',
                        }}
                       />
                      <span className="text-sm text-gray-700">{label}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(amount)}
                      </div>
                      <div className="text-xs text-gray-500">{percentage}%</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {viewMode === 'schedule' && (
          <>
            {/* Upcoming Payments */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Próximos Pagos</h4>
              {data.upcomingPayments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {payment.description}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          Vence: {formatDate(payment.dueDate)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(payment.category)}`}>
                          {payment.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">
                      {formatCurrency(payment.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
          <button className="flex items-center justify-center space-x-1 py-2 px-3 bg-green-50 hover:bg-green-100 rounded text-green-600 text-sm font-medium transition-colors">
            <DollarSign className="w-4 h-4" />
            <span>Liquidar</span>
          </button>
          <button className="flex items-center justify-center space-x-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 rounded text-blue-600 text-sm font-medium transition-colors">
            <Users className="w-4 h-4" />
            <span>Empleados</span>
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
