'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'

import {
  Calculator,
  Users,
  TrendingUp,
  FileText,
  Package,
  AlertCircle,
  Building2,
  Check,
} from 'lucide-react'

import { useCompany } from '@/contexts/CompanyContext'

/**
 * Portal Dashboard (Application Hub) - Modernizado
 *
 * Centro de control empresarial que conecta los tres módulos principales:
 * 1. Módulo de Contabilidad (Operational)
 * 2. Módulo de Remuneraciones (Operational)
 * 3. Dashboard Ejecutivo (Strategic/KPIs)
 *
 * Patrón: Application Shell / Portal Pattern con componentes UI modernos
 */
export default function PortalDashboard() {
  const [notifications] = useState(3)
  const { company, switchCompany } = useCompany()

  // Demo companies for premium version (Portal UI representation)
  const companies = [
    {
      id: 'demo-1',
      name: 'Empresa Demo S.A.',
      rut: '12.345.678-9',
      color: 'blue',
    },
    {
      id: 'demo-2',
      name: 'Mi Pyme Ltda.',
      rut: '98.765.432-1',
      color: 'purple',
    },
  ]

  // Get current active company based on CompanyContext (SSR Safe)
  const getCurrentPortalCompany = () => {
    if (typeof window === 'undefined') return companies[0]; // SSR fallback
    const savedCompanyId = localStorage.getItem('activeCompanyId') || 'demo-1';
    return companies.find(c => c.id === savedCompanyId) || companies[0];
  };

  const [activeCompany, setActiveCompany] = useState(companies[0]) // Initial safe state
  const [isCompanySelectorOpen, setIsCompanySelectorOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Initialize component after mount (client-side only)
  useEffect(() => {
    setMounted(true)
    setActiveCompany(getCurrentPortalCompany())
  }, [])

  // Update active company when localStorage changes
  useEffect(() => {
    if (!mounted) return
    const savedCompanyId = localStorage.getItem('activeCompanyId')
    if (savedCompanyId) {
      const foundCompany = companies.find(c => c.id === savedCompanyId)
      if (foundCompany) {
        setActiveCompany(foundCompany)
      }
    }
  }, [company])

  // Handle company change using CompanyContext
  const handleCompanyChange = (portalCompany: typeof companies[0]) => {
    setActiveCompany(portalCompany)
    setIsCompanySelectorOpen(false)
    // Use CompanyContext to switch company
    if (switchCompany) {
      switchCompany(portalCompany.id)
    }
  }

  // Métricas por empresa (datos dinámicos según empresa seleccionada)
  const getCompanyMetrics = (companyId: string) => {
    const metricsData = {
      'demo-1': { // Empresa Demo S.A.
        accounting: {
          pendingF29: 2,
          activeAssets: 45,
          monthlyIVA: 3400000,
        },
        payroll: {
          activeEmployees: 12,
          nextPayroll: '2024-11-30',
          monthlyTotal: 8500000,
        },
        executive: {
          cashFlow: 45000000,
          efficiency: 87,
          alerts: 5,
        },
      },
      'demo-2': { // Mi Pyme Ltda.
        accounting: {
          pendingF29: 1,
          activeAssets: 28,
          monthlyIVA: 1800000,
        },
        payroll: {
          activeEmployees: 8,
          nextPayroll: '2024-11-30',
          monthlyTotal: 5200000,
        },
        executive: {
          cashFlow: 28000000,
          efficiency: 92,
          alerts: 2,
        },
      },
    }
    return metricsData[companyId as keyof typeof metricsData] || metricsData['demo-1']
  }

  const metrics = getCompanyMetrics(activeCompany.id)

  // Función para generar indicadores tipo semáforo
  const getHealthIndicators = (companyId: string) => {
    const data = getCompanyMetrics(companyId)

    return {
      accounting: {
        status: data.accounting.pendingF29 > 2 ? 'critical' : data.accounting.pendingF29 > 0 ? 'warning' : 'healthy',
        message: data.accounting.pendingF29 > 2 ? 'Revisar F29 urgente' : data.accounting.pendingF29 > 0 ? 'F29 pendientes por revisar' : 'Cumplimiento al día',
        priority: data.accounting.pendingF29 > 2 ? 'high' : data.accounting.pendingF29 > 0 ? 'medium' : 'low',
      },
      payroll: {
        status: data.payroll.monthlyTotal > 10000000 ? 'warning' : 'healthy',
        message: data.payroll.monthlyTotal > 10000000 ? 'Revisar costos laborales' : 'Nómina bajo control',
        priority: data.payroll.monthlyTotal > 10000000 ? 'medium' : 'low',
      },
      financial: {
        status: data.executive.efficiency < 70 ? 'critical' : data.executive.efficiency < 85 ? 'warning' : 'healthy',
        message: data.executive.efficiency < 70 ? 'Eficiencia crítica - revisar operaciones' : data.executive.efficiency < 85 ? 'Oportunidad de mejora detectada' : 'Operación eficiente',
        priority: data.executive.efficiency < 70 ? 'high' : data.executive.efficiency < 85 ? 'medium' : 'low',
      },
    }
  }

  const healthIndicators = getHealthIndicators(activeCompany.id)

  const modules = [
    {
      id: 'accounting',
      title: 'Estado Contable',
      description: 'Cumplimiento y alertas tributarias',
      icon: Calculator,
      color: 'blue',
      href: '/accounting',
      healthStatus: healthIndicators.accounting,
      statusIndicators: [
        {
          label: 'Estado Tributario',
          status: healthIndicators.accounting.status,
          value: healthIndicators.accounting.message,
        },
        {
          label: 'Próximo F29',
          status: 'info',
          value: '15 días restantes',
        },
        {
          label: 'Cumplimiento',
          status: metrics.accounting.pendingF29 === 0 ? 'healthy' : 'warning',
          value: metrics.accounting.pendingF29 === 0 ? 'Al día' : `${metrics.accounting.pendingF29} pendientes`,
        },
      ],
    },
    {
      id: 'payroll',
      title: 'Estado RRHH',
      description: 'Resumen laboral y alertas',
      icon: Users,
      color: 'green',
      href: '/payroll',
      healthStatus: healthIndicators.payroll,
      statusIndicators: [
        {
          label: 'Nómina Mensual',
          status: healthIndicators.payroll.status,
          value: healthIndicators.payroll.message,
        },
        {
          label: 'Empleados Activos',
          status: 'healthy',
          value: `${metrics.payroll.activeEmployees} personas`,
        },
        {
          label: 'Próxima Liquidación',
          status: 'info',
          value: 'En 5 días',
        },
      ],
    },
    {
      id: 'executive',
      title: 'Estado Financiero',
      description: 'Salud empresarial general',
      icon: TrendingUp,
      color: 'purple',
      href: '/dashboard-new',
      healthStatus: healthIndicators.financial,
      statusIndicators: [
        {
          label: 'Salud Financiera',
          status: healthIndicators.financial.status,
          value: healthIndicators.financial.message,
        },
        {
          label: 'Score Empresarial',
          status: metrics.executive.efficiency > 85 ? 'healthy' : 'warning',
          value: `${metrics.executive.efficiency}/100 puntos`,
        },
        {
          label: 'Alertas Activas',
          status: metrics.executive.alerts > 3 ? 'warning' : 'healthy',
          value: `${metrics.executive.alerts} alertas`,
        },
      ],
    },
  ]

  const recentActivity = [
    { type: 'accounting', message: 'F29 Octubre procesado correctamente', time: '5 min', icon: FileText },
    { type: 'payroll', message: 'Liquidación de María García aprobada', time: '15 min', icon: Users },
    { type: 'executive', message: 'Alerta: Flujo de caja proyectado bajo', time: '1 hora', icon: AlertCircle },
    { type: 'accounting', message: 'Nuevo activo fijo registrado', time: '2 horas', icon: Package },
  ]

  const getModuleColor = (type: string) => {
    switch(type) {
      case 'accounting': return 'text-blue-600 bg-blue-50'
      case 'payroll': return 'text-green-600 bg-green-50'
      case 'executive': return 'text-purple-600 bg-purple-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getColorClasses = (color: string) => {
    switch(color) {
      case 'blue':
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
          text: 'text-blue-600',
          border: 'border-blue-200',
          hover: 'hover:border-blue-300',
        }
      case 'green':
        return {
          bg: 'bg-gradient-to-r from-green-500 to-green-600',
          text: 'text-green-600',
          border: 'border-green-200',
          hover: 'hover:border-green-300',
        }
      case 'purple':
        return {
          bg: 'bg-gradient-to-r from-purple-500 to-purple-600',
          text: 'text-purple-600',
          border: 'border-purple-200',
          hover: 'hover:border-purple-300',
        }
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
          text: 'text-gray-600',
          border: 'border-gray-200',
          hover: 'hover:border-gray-300',
        }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Hero Section - Simplified */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-8 py-6">
              <h1 className="text-2xl font-bold text-white mb-2">Centro de Control Empresarial</h1>
              <p className="text-slate-300 text-sm">
                Gestión integral multi-empresa para PyMEs chilenas
              </p>
            </div>
            {/* Quick Stats */}
            <div className="grid grid-cols-3 divide-x divide-gray-200 bg-gray-50">
              <div className="px-6 py-4 text-center">
                <div className="text-lg font-semibold text-gray-900">{activeCompany.name}</div>
                <div className="text-sm text-gray-600">Empresa Activa</div>
              </div>
              <div className="px-6 py-4 text-center">
                <div className="text-lg font-semibold text-gray-900">{companies.length}</div>
                <div className="text-sm text-gray-600">Empresas Registradas</div>
              </div>
              <div className="px-6 py-4 text-center">
                <div className="text-lg font-semibold text-red-600">{metrics.executive.alerts}</div>
                <div className="text-sm text-gray-600">Alertas Activas</div>
              </div>
            </div>
          </div>

          {/* Selector de Empresa - Simplificado */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">🏢 Cambiar Empresa Activa</h2>
              <div className="text-sm text-gray-500">Gestión multi-empresa</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {companies.map((company) => {
                const isActive = activeCompany.id === company.id
                const colorClasses = company.color === 'blue'
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-purple-200 bg-purple-50'

                return (
                  <div
                    key={company.id}
                    onClick={() => { handleCompanyChange(company); }}
                    className={`bg-white rounded-lg shadow-sm border-2 p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isActive ? colorClasses : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <Building2 className={`w-8 h-8 ${
                        company.color === 'blue' ? 'text-blue-600' : 'text-purple-600'
                      }`} />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{company.name}</h3>
                        <p className="text-sm text-gray-600">RUT: {company.rut}</p>
                      </div>
                      {isActive && (
                        <div className="flex items-center space-x-2">
                          <Check className="w-5 h-5 text-green-600" />
                          <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                            ACTIVA
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Dashboard Principal - Navegación Rápida */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">🎯 Acceso Rápido a Módulos</h2>
              <div className="text-sm text-gray-500">Estado general</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Contabilidad */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <Calculator className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Contabilidad</h3>
                      <p className="text-blue-100 text-sm">Estado tributario</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">F29 Pendientes:</span>
                    <span className={`text-sm font-medium ${
                      metrics.accounting.pendingF29 > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {metrics.accounting.pendingF29 > 0 ? `${metrics.accounting.pendingF29} pendientes` : 'Al día'}
                    </span>
                  </div>
                  <Link href="/accounting" className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all text-sm border border-blue-200">
                    <Calculator className="w-4 h-4" />
                    <span>Ir a Contabilidad</span>
                  </Link>
                </div>
              </div>

              {/* Remuneraciones */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Remuneraciones</h3>
                      <p className="text-green-100 text-sm">Gestión RRHH</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Empleados:</span>
                    <span className="text-sm font-medium text-gray-900">{metrics.payroll.activeEmployees}</span>
                  </div>
                  <Link href="/payroll" className="w-full bg-green-50 hover:bg-green-100 text-green-700 px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all text-sm border border-green-200">
                    <Users className="w-4 h-4" />
                    <span>Ir a Remuneraciones</span>
                  </Link>
                </div>
              </div>

              {/* Dashboard Ejecutivo */}
              <div className="bg-white rounded-xl shadow-sm border-2 border-purple-200 hover:shadow-md transition-all duration-200 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Dashboard Ejecutivo</h3>
                      <p className="text-purple-100 text-sm">Insights avanzados</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Eficiencia:</span>
                    <span className={`text-sm font-medium ${
                      metrics.executive.efficiency > 85 ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {metrics.executive.efficiency}%
                    </span>
                  </div>
                  <Link href="/dashboard-new" className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all text-sm border border-purple-200">
                    <TrendingUp className="w-4 h-4" />
                    <span>Ver Dashboard</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Alertas y Notificaciones */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">⚠️ Estado General de {activeCompany.name}</h2>
              <div className="text-sm text-gray-500">Sistema de alertas</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Alerta Contable */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    metrics.accounting.pendingF29 > 0
                      ? 'bg-gradient-to-r from-red-500 to-red-600'
                      : 'bg-gradient-to-r from-green-500 to-green-600'
                  }`}>
                    <Calculator className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">Estado Tributario</h3>
                    <p className="text-gray-500 text-xs">Cumplimiento fiscal</p>
                  </div>
                </div>
                <div className={`text-2xl font-bold mb-2 ${
                  metrics.accounting.pendingF29 > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {metrics.accounting.pendingF29 > 0 ? '⚠️' : '✅'}
                </div>
                <div className="text-xs text-gray-500">
                  {metrics.accounting.pendingF29 > 0
                    ? `${metrics.accounting.pendingF29} F29 pendientes`
                    : 'Todo al día'
                  }
                </div>
              </div>

              {/* Alerta RRHH */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">Gestión RRHH</h3>
                    <p className="text-gray-500 text-xs">Capital humano</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {metrics.payroll.activeEmployees}
                </div>
                <div className="text-xs text-gray-500">Empleados activos</div>
              </div>

              {/* Score Empresarial */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    metrics.executive.efficiency > 85
                      ? 'bg-gradient-to-r from-green-500 to-green-600'
                      : 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                  }`}>
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">Score Empresarial</h3>
                    <p className="text-gray-500 text-xs">Eficiencia general</p>
                  </div>
                </div>
                <div className={`text-2xl font-bold mb-2 ${
                  metrics.executive.efficiency > 85 ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {metrics.executive.efficiency}%
                </div>
                <div className="text-xs text-gray-500">Rendimiento global</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
