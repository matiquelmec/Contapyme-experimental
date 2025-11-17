'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  BarChart3,
  PieChart,
  FileText,
  Settings
} from 'lucide-react'

// Componente para el ticker de indicadores económicos
const EconomicIndicatorsTicker = () => {
  const [indicators, setIndicators] = useState({
    uf: { value: 39643.59, change: 12.45 },
    utm: { value: 69542.00, change: 0 },
    usd: { value: 953.67, change: -4.23 },
    eur: { value: 1006.45, change: -2.15 }
  })

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-6">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-sm font-medium">Indicadores Económicos - Tiempo Real</div>
        <div className="flex space-x-8 text-sm">
          <div className="flex items-center">
            <span className="font-semibold">UF</span>
            <span className="ml-2">${indicators.uf.value.toLocaleString()}</span>
            <span className={`ml-1 ${indicators.uf.change > 0 ? 'text-green-300' : 'text-red-300'}`}>
              {indicators.uf.change > 0 ? '+' : ''}{indicators.uf.change}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold">USD</span>
            <span className="ml-2">${indicators.usd.value.toLocaleString()}</span>
            <span className={`ml-1 ${indicators.usd.change > 0 ? 'text-green-300' : 'text-red-300'}`}>
              {indicators.usd.change}
            </span>
          </div>
          <div className="flex items-center">
            <span className="font-semibold">UTM</span>
            <span className="ml-2">${indicators.utm.value.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Widget del IVómetro
const IVAMeter = () => {
  const debitoFiscal = 8540000
  const creditoFiscal = 6230000
  const ivaAPagar = debitoFiscal - creditoFiscal
  const porcentaje = Math.round((ivaAPagar / debitoFiscal) * 100)

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">IVómetro</h3>
        <div className="text-xs text-gray-500">Vence día 20</div>
      </div>
      
      {/* Gauge visual simplificado */}
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8"/>
          <circle 
            cx="60" 
            cy="60" 
            r="45" 
            fill="none" 
            stroke={porcentaje > 30 ? "#dc2626" : porcentaje > 15 ? "#f59e0b" : "#16a34a"}
            strokeWidth="8"
            strokeDasharray={`${(porcentaje / 100) * 283} 283`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-gray-900">{porcentaje}%</div>
          <div className="text-xs text-gray-500">intensidad</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">IVA a Pagar</span>
          <span className="font-semibold text-red-600">${ivaAPagar.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Débito: ${debitoFiscal.toLocaleString()}</span>
          <span>Crédito: ${creditoFiscal.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

// Widget de Flujo de Caja
const CashFlowWidget = () => {
  const saldoActual = 25400000
  const proyeccion30 = 43840000
  const riesgo = proyeccion30 < saldoActual * 1.5 ? 'bajo' : 'alto'

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Flujo de Caja</h3>
        <span className={`px-2 py-1 text-xs rounded-full ${
          riesgo === 'bajo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {riesgo === 'bajo' ? 'Bajo Riesgo' : 'Alto Riesgo'}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-xs text-gray-500 mb-1">Saldo Actual</div>
          <div className="text-2xl font-bold text-gray-900">${saldoActual.toLocaleString()}</div>
        </div>
        
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-gray-500">Proyección 30 días</div>
              <div className="text-lg font-semibold text-blue-600">${proyeccion30.toLocaleString()}</div>
            </div>
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 text-xs">
          <div className="flex justify-between mb-1">
            <span>Pago nómina (24 nov)</span>
            <span className="text-red-600">-$10.200.000</span>
          </div>
          <div className="flex justify-between">
            <span>Cobranza ABC S.A. (21 nov)</span>
            <span className="text-green-600">+$8.500.000</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Widget de Alertas Tributarias
const TaxHealthWidget = () => {
  const alertas = [
    { tipo: 'success', mensaje: 'RCV vs F29: Concordancia 100%' },
    { tipo: 'warning', mensaje: '3 entidades RCV sin mapear' },
    { tipo: 'success', mensaje: 'Sin observaciones SII' }
  ]

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Salud Tributaria</h3>
      
      <div className="space-y-3">
        {alertas.map((alerta, index) => (
          <div key={index} className="flex items-center space-x-3">
            {alerta.tipo === 'success' && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />}
            {alerta.tipo === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />}
            {alerta.tipo === 'error' && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
            <span className="text-sm text-gray-700">{alerta.mensaje}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="text-xs text-gray-500">
          Última verificación: {new Date().toLocaleString('es-CL')}
        </div>
      </div>
    </div>
  )
}

// Navegación Contextual
const ContextualNavigation = () => {
  const accionesRecomendadas = [
    {
      title: "Análisis F29",
      description: "Analizar situación fiscal actual",
      icon: FileText,
      href: "/accounting/f29-analysis",
      priority: "high"
    },
    {
      title: "RCV vs Libros",
      description: "Verificar concordancia tributaria",
      icon: BarChart3,
      href: "/accounting/rcv-analysis", 
      priority: "medium"
    },
    {
      title: "Balance 8 Columnas",
      description: "Estados financieros integrados",
      icon: PieChart,
      href: "/accounting/balance-8-columns",
      priority: "low"
    },
    {
      title: "Configuración",
      description: "Plan de cuentas y entidades",
      icon: Settings,
      href: "/accounting/configuration",
      priority: "low"
    }
  ]

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Recomendadas</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {accionesRecomendadas.map((accion, index) => (
          <Link key={index} href={accion.href}>
            <div className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
              accion.priority === 'high' ? 'border-red-200 bg-red-50 hover:border-red-300' :
              accion.priority === 'medium' ? 'border-yellow-200 bg-yellow-50 hover:border-yellow-300' :
              'border-gray-200 bg-gray-50 hover:border-gray-300'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <accion.icon className={`w-5 h-5 ${
                  accion.priority === 'high' ? 'text-red-600' :
                  accion.priority === 'medium' ? 'text-yellow-600' :
                  'text-gray-600'
                }`} />
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
              <h4 className="font-medium text-gray-900 text-sm">{accion.title}</h4>
              <p className="text-xs text-gray-600 mt-1">{accion.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// Componente principal
export default function AccountingRedesigned() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Ticker de Indicadores Económicos */}
      <EconomicIndicatorsTicker />

      {/* Header Principal */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión Contable</h1>
              <p className="text-gray-600 mt-1">Centro de control financiero y tributario</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Última actualización: {new Date().toLocaleString('es-CL')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Zona de Supervivencia (JTBD 1) */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
            Panel de Supervivencia
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CashFlowWidget />
            <IVAMeter />
            <TaxHealthWidget />
          </div>
        </div>

        {/* Zona de Acción Contextual */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 text-green-600 mr-2" />
            Acciones Inteligentes
          </h2>
          <ContextualNavigation />
        </div>

        {/* Enlaces Rápidos a Empresas Demo */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Empresas Demo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/companies/demo-1" className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
              <div>
                <h4 className="font-medium text-gray-900">Empresa Demo S.A.</h4>
                <p className="text-sm text-gray-600">RUT: 12.345.678-9</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </Link>
            
            <Link href="/companies/demo-2" className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
              <div>
                <h4 className="font-medium text-gray-900">Mi Pyme Ltda.</h4>
                <p className="text-sm text-gray-600">RUT: 98.765.432-1</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}