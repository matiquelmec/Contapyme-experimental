'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button, Card } from '@/components/ui'
import { MinimalHeader } from '@/components/layout/MinimalHeader'
import { useCompany } from '@/contexts/CompanyContext'
import {
  Calculator,
  Users,
  TrendingUp,
  FileText,
  Settings,
  Bell,
  ChevronRight,
  Activity,
  DollarSign,
  BarChart3,
  Package,
  Clock,
  AlertCircle,
  Building2,
  ChevronDown,
  Check
} from 'lucide-react'

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
      color: 'blue'
    },
    {
      id: 'demo-2',
      name: 'Mi Pyme Ltda.',
      rut: '98.765.432-1',
      color: 'purple'
    }
  ]

  // Get current active company based on CompanyContext
  const getCurrentPortalCompany = () => {
    const savedCompanyId = localStorage.getItem('activeCompanyId') || 'demo-1';
    return companies.find(c => c.id === savedCompanyId) || companies[0];
  };

  const [activeCompany, setActiveCompany] = useState(getCurrentPortalCompany())
  const [isCompanySelectorOpen, setIsCompanySelectorOpen] = useState(false)

  // Update active company when localStorage changes
  useEffect(() => {
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
          monthlyIVA: 3400000
        },
        payroll: {
          activeEmployees: 12,
          nextPayroll: '2024-11-30',
          monthlyTotal: 8500000
        },
        executive: {
          cashFlow: 45000000,
          efficiency: 87,
          alerts: 5
        }
      },
      'demo-2': { // Mi Pyme Ltda.
        accounting: {
          pendingF29: 1,
          activeAssets: 28,
          monthlyIVA: 1800000
        },
        payroll: {
          activeEmployees: 8,
          nextPayroll: '2024-11-30',
          monthlyTotal: 5200000
        },
        executive: {
          cashFlow: 28000000,
          efficiency: 92,
          alerts: 2
        }
      }
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
        priority: data.accounting.pendingF29 > 2 ? 'high' : data.accounting.pendingF29 > 0 ? 'medium' : 'low'
      },
      payroll: {
        status: data.payroll.monthlyTotal > 10000000 ? 'warning' : 'healthy',
        message: data.payroll.monthlyTotal > 10000000 ? 'Revisar costos laborales' : 'Nómina bajo control',
        priority: data.payroll.monthlyTotal > 10000000 ? 'medium' : 'low'
      },
      financial: {
        status: data.executive.efficiency < 70 ? 'critical' : data.executive.efficiency < 85 ? 'warning' : 'healthy',
        message: data.executive.efficiency < 70 ? 'Eficiencia crítica - revisar operaciones' : data.executive.efficiency < 85 ? 'Oportunidad de mejora detectada' : 'Operación eficiente',
        priority: data.executive.efficiency < 70 ? 'high' : data.executive.efficiency < 85 ? 'medium' : 'low'
      }
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
          value: healthIndicators.accounting.message
        },
        {
          label: 'Próximo F29',
          status: 'info',
          value: '15 días restantes'
        },
        {
          label: 'Cumplimiento',
          status: metrics.accounting.pendingF29 === 0 ? 'healthy' : 'warning',
          value: metrics.accounting.pendingF29 === 0 ? 'Al día' : `${metrics.accounting.pendingF29} pendientes`
        }
      ]
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
          value: healthIndicators.payroll.message
        },
        {
          label: 'Empleados Activos',
          status: 'healthy',
          value: `${metrics.payroll.activeEmployees} personas`
        },
        {
          label: 'Próxima Liquidación',
          status: 'info',
          value: 'En 5 días'
        }
      ]
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
          value: healthIndicators.financial.message
        },
        {
          label: 'Score Empresarial',
          status: metrics.executive.efficiency > 85 ? 'healthy' : 'warning',
          value: `${metrics.executive.efficiency}/100 puntos`
        },
        {
          label: 'Alertas Activas',
          status: metrics.executive.alerts > 3 ? 'warning' : 'healthy',
          value: `${metrics.executive.alerts} alertas`
        }
      ]
    }
  ]

  const recentActivity = [
    { type: 'accounting', message: 'F29 Octubre procesado correctamente', time: '5 min', icon: FileText },
    { type: 'payroll', message: 'Liquidación de María García aprobada', time: '15 min', icon: Users },
    { type: 'executive', message: 'Alerta: Flujo de caja proyectado bajo', time: '1 hora', icon: AlertCircle },
    { type: 'accounting', message: 'Nuevo activo fijo registrado', time: '2 horas', icon: Package }
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
          hover: 'hover:border-blue-300'
        }
      case 'green':
        return {
          bg: 'bg-gradient-to-r from-green-500 to-green-600',
          text: 'text-green-600',
          border: 'border-green-200',
          hover: 'hover:border-green-300'
        }
      case 'purple':
        return {
          bg: 'bg-gradient-to-r from-purple-500 to-purple-600',
          text: 'text-purple-600',
          border: 'border-purple-200',
          hover: 'hover:border-purple-300'
        }
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
          text: 'text-gray-600',
          border: 'border-gray-200',
          hover: 'hover:border-gray-300'
        }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Navigation Header */}
      <MinimalHeader variant="premium" />

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section - Simplified since logo is now in header */}
        <div className="text-center mb-12 pt-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Portal Multi-Empresa</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
            Centro de control empresarial - Sistema Integrado de Gestión
          </p>
          <p className="text-xl text-blue-700 max-w-3xl mx-auto font-bold">
            para <span className="text-blue-800">PyMEs Chilenas</span>
          </p>
        </div>

        {/* Selector de Empresa Activa */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <Card variant="elevated" className="relative inline-block">
              <div className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium text-gray-600">Trabajando con:</div>
                  <div className="relative">
                    <button
                      onClick={() => setIsCompanySelectorOpen(!isCompanySelectorOpen)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg border-2 transition-all duration-200 min-w-64 ${
                        activeCompany.color === 'blue'
                          ? 'border-blue-200 bg-blue-50 hover:border-blue-300'
                          : 'border-purple-200 bg-purple-50 hover:border-purple-300'
                      }`}
                    >
                      <Building2 className={`w-5 h-5 ${
                        activeCompany.color === 'blue' ? 'text-blue-600' : 'text-purple-600'
                      }`} />
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-gray-900">{activeCompany.name}</div>
                        <div className="text-sm text-gray-600">RUT: {activeCompany.rut}</div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                        isCompanySelectorOpen ? 'rotate-180' : ''
                      }`} />
                    </button>

                    {/* Dropdown */}
                    {isCompanySelectorOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsCompanySelectorOpen(false)}
                        />
                        <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-200 z-50 py-2">
                          {companies.map((company) => (
                            <button
                              key={company.id}
                              onClick={() => handleCompanyChange(company)}
                              className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                                activeCompany.id === company.id ? 'bg-blue-50' : ''
                              }`}
                            >
                              <Building2 className={`w-5 h-5 ${
                                company.color === 'blue' ? 'text-blue-600' : 'text-purple-600'
                              }`} />
                              <div className="flex-1 text-left">
                                <div className="font-semibold text-gray-900">{company.name}</div>
                                <div className="text-sm text-gray-600">RUT: {company.rut}</div>
                              </div>
                              {activeCompany.id === company.id && (
                                <Check className="w-4 h-4 text-blue-600" />
                              )}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Gestión de Empresas */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Mis Empresas</h2>
            <Link
              href="/companies/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg hover:shadow-xl"
            >
              + Nueva Empresa
            </Link>
          </div>

          {/* Demo data for multiple companies (premium version) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => {
              const isActive = activeCompany.id === company.id
              const colorClasses = company.color === 'blue'
                ? {
                    border: isActive ? 'border-blue-300 ring-2 ring-blue-100' : 'border-blue-200',
                    icon: 'text-blue-600',
                    badge: 'text-blue-700 bg-blue-100',
                    button: 'bg-blue-600 hover:bg-blue-700'
                  }
                : {
                    border: isActive ? 'border-purple-300 ring-2 ring-purple-100' : 'border-purple-200',
                    icon: 'text-purple-600',
                    badge: 'text-purple-700 bg-purple-100',
                    button: 'bg-purple-600 hover:bg-purple-700'
                  }

              return (
                <Card
                  key={company.id}
                  variant="elevated"
                  className={`group hover:shadow-xl transition-all duration-300 cursor-pointer ${colorClasses.border} hover:border-opacity-60`}
                  onClick={() => handleCompanyChange(company)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Building2 className={`w-8 h-8 ${colorClasses.icon}`} />
                      <div className="flex space-x-2">
                        {isActive && (
                          <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded flex items-center">
                            <Check className="w-3 h-3 mr-1" />
                            ACTIVA
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs font-medium rounded ${colorClasses.badge}`}>
                          {company.color === 'blue' ? 'Principal' : 'Secundaria'}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">{company.name}</h3>
                    <p className="text-gray-600 mb-4">RUT: {company.rut}</p>
                    <div className="space-y-2">
                      <Link
                        href="/dashboard-new"
                        className={`w-full ${colorClasses.button} text-white px-4 py-2 rounded-lg text-center text-sm font-medium inline-block transition-colors`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        🎯 Dashboard Ejecutivo
                      </Link>
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href="/accounting"
                          className="w-full bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-center text-xs font-medium inline-block transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          📊 Contabilidad
                        </Link>
                        <Link
                          href="/payroll"
                          className="w-full bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-center text-xs font-medium inline-block transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          👥 Remuneraciones
                        </Link>
                      </div>
                      {isActive && (
                        <div className="text-xs text-center text-gray-500">
                          Empresa actualmente seleccionada
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}

            <Card variant="bordered" className="group hover:shadow-lg transition-all duration-300 border-dashed border-2 border-gray-300 hover:border-gray-400">
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="font-medium text-gray-700 mb-2">Agregar Empresa</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Gestiona múltiples empresas en una cuenta premium
                </p>
                <Link
                  href="/companies/new"
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium inline-block transition-colors"
                >
                  + Crear Empresa
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* Previsualización de Datos de la Empresa */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Resumen de {activeCompany.name}
          </h2>
          <div className="grid lg:grid-cols-3 gap-8">
            {modules.map((module) => {
              const Icon = module.icon
              const colors = getColorClasses(module.color)

              return (
                <Card
                  key={module.id}
                  variant="elevated"
                  className={`transition-all duration-300 ${colors.border} overflow-hidden`}
                >
                  {/* Header del Módulo */}
                  <div className={`${colors.bg} p-4 text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full transform translate-x-6 -translate-y-6"></div>
                    <div className="relative z-10">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-6 h-6" />
                        <div>
                          <h3 className="text-lg font-bold">{module.title}</h3>
                          <p className="text-blue-100 text-xs">{module.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Indicadores Tipo Semáforo */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 gap-3">
                      {module.statusIndicators.map((indicator, idx) => {
                        const getStatusColor = (status: string) => {
                          switch (status) {
                            case 'critical':
                              return 'text-red-600 bg-red-100'
                            case 'warning':
                              return 'text-yellow-600 bg-yellow-100'
                            case 'healthy':
                              return 'text-green-600 bg-green-100'
                            case 'info':
                              return 'text-blue-600 bg-blue-100'
                            default:
                              return 'text-gray-600 bg-gray-100'
                          }
                        }

                        const getStatusIcon = (status: string) => {
                          switch (status) {
                            case 'critical':
                              return '🔴'
                            case 'warning':
                              return '🟡'
                            case 'healthy':
                              return '🟢'
                            case 'info':
                              return '🔵'
                            default:
                              return '⚪'
                          }
                        }

                        return (
                          <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">{getStatusIcon(indicator.status)}</span>
                              <span className="text-sm text-gray-600">{indicator.label}</span>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(indicator.status)}`}>
                              {indicator.value}
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    {/* Botón de acceso directo al dashboard ejecutivo solo en el módulo ejecutivo */}
                    {module.id === 'executive' && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <Link
                          href="/dashboard-new"
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-center text-sm font-medium inline-block transition-colors"
                        >
                          📊 Ver Análisis Completo
                        </Link>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Actividad Reciente */}
        <Card variant="bordered" className="bg-white/80 backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Actividad Reciente</h2>
              <Button variant="outline" size="sm">
                Ver Todo
              </Button>
            </div>

            <div className="space-y-4">
              {recentActivity.map((activity, idx) => {
                const Icon = activity.icon
                return (
                  <div key={idx} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`p-2 rounded-lg ${getModuleColor(activity.type)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-600">hace {activity.time}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}