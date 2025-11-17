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
  Info
} from 'lucide-react'

// Demo data - En producción vendría de APIs reales
const getDashboardData = () => {
  return {
    cashFlow: {
      current: 45000000,
      projected30: 38000000,
      projected60: 42000000,
      projected90: 35000000,
      status: 'warning', // healthy, warning, critical
      trend: 'down'
    },
    ivometer: {
      debitoFiscal: 8500000,
      creditoFiscal: 3200000,
      ivaToPay: 5300000,
      status: 'critical', // healthy, warning, critical
      paymentDate: '20 Dic 2024'
    },
    topClients: [
      { name: 'Empresa ABC S.A.', revenue: 15000000, profitability: 85, growth: 12 },
      { name: 'Constructora XYZ', revenue: 12000000, profitability: 78, growth: -5 },
      { name: 'Servicios DEF Ltda.', revenue: 8500000, profitability: 92, growth: 25 },
      { name: 'Comercial GHI', revenue: 7200000, profitability: 67, growth: 8 },
      { name: 'Industrias JKL', revenue: 6800000, profitability: 74, growth: 15 }
    ],
    alerts: {
      tributarias: 2,
      contratos: 3,
      bancarias: 1
    }
  }
}

export default function ExecutiveDashboardPage() {
  const [data, setData] = useState(getDashboardData())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => setLoading(false), 1000)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount)
  }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
                <div className="text-lg font-semibold text-gray-900">{data.alerts.tributarias + data.alerts.contratos + data.alerts.bancarias}</div>
                <div className="text-sm text-gray-600">Alertas Activas</div>
              </div>
              <div className="px-6 py-4 text-center">
                <div className="text-lg font-semibold text-gray-900">Dic 2024</div>
                <div className="text-sm text-gray-600">Período Activo</div>
              </div>
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
                      <div className={`p-2 rounded-lg ${getStatusBg(data.cashFlow.status)}`}>
                        <DollarSign className={`w-5 h-5 ${getStatusColor(data.cashFlow.status)}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Flujo de Caja</h3>
                        <p className="text-sm text-gray-600">¿Tengo suficiente caja para pagar sueldos e IVA?</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {data.cashFlow.trend === 'down' ? (
                        <ArrowDown className="w-4 h-4 text-red-500" />
                      ) : (
                        <ArrowUp className="w-4 h-4 text-green-500" />
                      )}
                      <span className={`text-sm font-medium ${data.cashFlow.trend === 'down' ? 'text-red-600' : 'text-green-600'}`}>
                        {data.cashFlow.trend === 'down' ? 'Descendiendo' : 'Creciendo'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Actual</div>
                      <div className="text-lg font-bold text-gray-900">{formatCurrency(data.cashFlow.current)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">30 días</div>
                      <div className="text-lg font-bold text-yellow-600">{formatCurrency(data.cashFlow.projected30)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">60 días</div>
                      <div className="text-lg font-bold text-blue-600">{formatCurrency(data.cashFlow.projected60)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">90 días</div>
                      <div className="text-lg font-bold text-gray-600">{formatCurrency(data.cashFlow.projected90)}</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Estado del flujo de caja</span>
                      <span className={`font-medium ${getStatusColor(data.cashFlow.status)}`}>
                        {data.cashFlow.status === 'warning' ? 'Requiere Atención' :
                         data.cashFlow.status === 'critical' ? 'Crítico' : 'Saludable'}
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
                    <div className={`p-2 rounded-lg ${getStatusBg(data.ivometer.status)}`}>
                      <Calculator className={`w-5 h-5 ${getStatusColor(data.ivometer.status)}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">IVÓMETRO</h3>
                      <p className="text-sm text-gray-600">¿Estoy en riesgo de multas SII?</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Débito Fiscal</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(data.ivometer.debitoFiscal)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Crédito Fiscal</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(data.ivometer.creditoFiscal)}</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-900">IVA a Pagar</span>
                        <span className="text-lg font-bold text-red-600">{formatCurrency(data.ivometer.ivaToPay)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Vencimiento</span>
                        </div>
                        <span className="text-sm font-medium text-red-600">{data.ivometer.paymentDate}</span>
                      </div>
                    </div>
                    <div className={`mt-4 p-3 rounded-lg ${getStatusBg(data.ivometer.status)}`}>
                      <div className="flex items-center gap-2">
                        {data.ivometer.status === 'critical' ? (
                          <XCircle className="w-4 h-4 text-red-600" />
                        ) : data.ivometer.status === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                        <span className={`text-sm font-medium ${getStatusColor(data.ivometer.status)}`}>
                          {data.ivometer.status === 'critical' ? 'Acción Inmediata' :
                           data.ivometer.status === 'warning' ? 'Revisar Pronto' : 'Todo Correcto'}
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
                  <h3 className="text-lg font-semibold text-gray-900">Top 5 Clientes</h3>
                  <p className="text-sm text-gray-600">¿Qué clientes me generan mayor rentabilidad?</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {data.topClients.map((client, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{client.name}</div>
                        <div className="text-sm text-gray-600">Rentabilidad: {client.profitability}%</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{formatCurrency(client.revenue)}</div>
                      <div className={`text-sm flex items-center gap-1 ${
                        client.growth >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {client.growth >= 0 ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )}
                        {Math.abs(client.growth)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Link href="/accounting/rcv-analysis">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                    Ver Análisis Detallado de Clientes
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