'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@/components/ui';
import { Users, FileText, Clock, Calendar, BarChart3, Plus, ChevronRight, Settings, FileSpreadsheet, DollarSign, Activity, TrendingUp, ArrowRight, Database, Sparkles, FileX, Calculator } from 'lucide-react';

interface PayrollStats {
  totalEmployees: number;
  activeContracts: number;
  monthlyPayroll: number;
  upcomingEvents: number;
}

export default function PayrollPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<PayrollStats>({
    totalEmployees: 0,
    activeContracts: 0,
    monthlyPayroll: 0,
    upcomingEvents: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const COMPANY_ID = '8033ee69-b420-4d91-ba0e-482f46cd6fce';

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchStats();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const response = await fetch(`/api/payroll/employees?company_id=${COMPANY_ID}`);
      const data = await response.json();

      if (response.ok && data.success) {
        const employees = data.data || [];
        const activeContracts = employees.reduce((count: number, emp: any) => {
          return count + (emp.employment_contracts?.length || 0);
        }, 0);

        const monthlyPayroll = employees.reduce((total: number, emp: any) => {
          const activeContract = emp.employment_contracts?.find((contract: any) => contract.status === 'active');
          return total + (activeContract?.base_salary || 0);
        }, 0);

        setStats({
          totalEmployees: employees.length,
          activeContracts: activeContracts,
          monthlyPayroll: monthlyPayroll,
          upcomingEvents: 0 // Por ahora 0, futuro desarrollo
        });
      }
    } catch (error) {
      console.error('Error fetching payroll stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section - Consistente con Dashboard Ejecutivo */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">Gestión de Remuneraciones</h1>
                  <p className="text-xl text-blue-100">
                    Sistema Integral de RRHH para PyMEs Chilenas
                  </p>
                </div>
              </div>

              {/* Stats Cards en Hero - Estilo Dashboard Ejecutivo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <Users className="w-6 h-6 text-green-300" />
                    <div>
                      <p className="font-semibold">
                        {loadingStats ? (
                          <div className="animate-pulse bg-white/20 rounded h-5 w-8"></div>
                        ) : (
                          `${stats.totalEmployees} Empleados`
                        )}
                      </p>
                      <p className="text-sm text-blue-100">Personal activo</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 text-yellow-300" />
                    <div>
                      <p className="font-semibold">
                        {loadingStats ? (
                          <div className="animate-pulse bg-white/20 rounded h-5 w-8"></div>
                        ) : (
                          `${stats.activeContracts} Contratos`
                        )}
                      </p>
                      <p className="text-sm text-blue-100">Vigentes</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-6 h-6 text-purple-300" />
                    <div>
                      <p className="font-semibold text-sm">
                        {loadingStats ? (
                          <div className="animate-pulse bg-white/20 rounded h-5 w-20"></div>
                        ) : (
                          formatCurrency(stats.monthlyPayroll).slice(0, 12) + '...'
                        )}
                      </p>
                      <p className="text-sm text-blue-100">Nómina mensual</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/portal"
              className="hidden lg:flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-all backdrop-blur-sm border border-white/20 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Portal Principal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Estilo Dashboard Ejecutivo */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* View Selector */}
            <div className="flex items-center space-x-1">
              {[
                { key: 'overview', label: 'Vista General', icon: BarChart3 },
                { key: 'employees', label: 'Empleados', icon: Users },
                { key: 'contracts', label: 'Contratos', icon: FileText },
                { key: 'liquidations', label: 'Liquidaciones', icon: DollarSign },
                { key: 'libro-remuneraciones', label: 'Libros', icon: FileSpreadsheet },
                { key: 'settings', label: 'Configuración', icon: Settings }
              ].map(({ key, label, icon: Icon }) => {
                const isActive = activeTab === key
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden sm:inline">{label}</span>
                    {isActive && <Sparkles className="w-4 h-4 text-blue-500" />}
                  </button>
                )
              })}
            </div>

            {/* Dashboard Controls */}
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-600 mr-4">
                <span className="font-medium">RRHH</span>
              </div>

              <Link href="/payroll/employees/new">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Empleado</span>
                </Button>
              </Link>

              <Link href="/payroll/liquidations/generate">
                <Button
                  size="sm"
                  className="flex items-center space-x-1 bg-green-600 hover:bg-green-700"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Nueva Liquidación</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Tab Description */}
          <div className="mt-2 flex items-center space-x-3">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {activeTab === 'overview' && 'Vista General del Sistema'}
                {activeTab === 'employees' && 'Gestión de Empleados'}
                {activeTab === 'contracts' && 'Gestión de Contratos'}
                {activeTab === 'liquidations' && 'Liquidaciones de Sueldo'}
                {activeTab === 'libro-remuneraciones' && 'Libro de Remuneraciones'}
                {activeTab === 'settings' && 'Configuración del Sistema'}
              </h1>
              <p className="text-sm text-gray-600">
                {activeTab === 'overview' && 'Dashboard con métricas y accesos rápidos'}
                {activeTab === 'employees' && 'Crear, editar y gestionar empleados'}
                {activeTab === 'contracts' && 'Gestión integral de contratos laborales'}
                {activeTab === 'liquidations' && 'Cálculo automático según normativa chilena'}
                {activeTab === 'libro-remuneraciones' && 'Generación de reportes previsionales'}
                {activeTab === 'settings' && 'Configuración AFP, Salud y parámetros'}
              </p>
            </div>
            <Badge variant="outline" className="ml-auto">
              Sistema Activo
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards Principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-2">Total Empleados</p>
                    <div className="text-3xl font-bold text-gray-900">
                      {loadingStats ? (
                        <div className="animate-pulse bg-gray-200/60 rounded-lg w-12 h-8"></div>
                      ) : (
                        stats.totalEmployees
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Personal activo</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-500/10 to-blue-600/20 rounded-xl">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-2">Contratos Activos</p>
                    <div className="text-3xl font-bold text-gray-900">
                      {loadingStats ? (
                        <div className="animate-pulse bg-gray-200/60 rounded-lg w-12 h-8"></div>
                      ) : (
                        stats.activeContracts
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Vigentes</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-green-500/10 to-green-600/20 rounded-xl">
                    <FileText className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105 col-span-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-600 mb-2">Nómina Mensual</p>
                    <div className="text-2xl font-bold text-gray-900 truncate">
                      {loadingStats ? (
                        <div className="animate-pulse bg-gray-200/60 rounded-lg w-32 h-8"></div>
                      ) : (
                        formatCurrency(stats.monthlyPayroll)
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Sueldos base totales</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-500/10 to-purple-600/20 rounded-xl">
                    <DollarSign className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="group hover:shadow-2xl transition-all duration-300 bg-white/60 backdrop-blur-sm border-2 border-transparent hover:border-blue-200 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl">
                      <Users className="w-8 h-8 text-blue-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Empleados</h3>
                      <p className="text-gray-600 text-sm mb-3">Gestión integral de personal</p>
                      <Link href="/payroll/employees">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                          Ver Lista <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl transition-all duration-300 bg-white/60 backdrop-blur-sm border-2 border-transparent hover:border-green-200 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl">
                      <DollarSign className="w-8 h-8 text-green-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Liquidaciones</h3>
                      <p className="text-gray-600 text-sm mb-3">Cálculo automático normativa 2025</p>
                      <Link href="/payroll/liquidations">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                          Gestionar <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl transition-all duration-300 bg-white/60 backdrop-blur-sm border-2 border-transparent hover:border-purple-200 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl">
                      <FileSpreadsheet className="w-8 h-8 text-purple-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Libros</h3>
                      <p className="text-gray-600 text-sm mb-3">Reportes previsionales oficiales</p>
                      <Link href="/payroll/libro-remuneraciones">
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                          Generar <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Otros tabs mantienen el contenido original */}
        {activeTab === 'employees' && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Users className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Lista Completa de Empleados</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Ve la lista completa de empleados con detalles, búsquedas y filtros avanzados
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/payroll/employees">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <Users className="w-5 h-5 mr-2" />
                  Ir a Lista de Empleados
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'contracts' && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <FileText className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Gestión de Contratos</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Gestiona todos los contratos laborales de la empresa desde aquí
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/payroll/contracts">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <FileText className="w-5 h-5 mr-2" />
                  Ver Todos los Contratos
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'liquidations' && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <DollarSign className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Sistema de Liquidaciones</h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Genera liquidaciones de sueldo con cálculo automático según la normativa chilena 2025
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/payroll/liquidations">
                <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Ver Liquidaciones
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'libro-remuneraciones' && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full mx-auto mb-6 flex items-center justify-center">
              <FileSpreadsheet className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Gestión de Libros de Remuneraciones</h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Genera y gestiona libros de remuneraciones electrónicos con exportación CSV
            </p>
            <Link href="/payroll/libro-remuneraciones">
              <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white">
                <FileSpreadsheet className="w-5 h-5 mr-2" />
                Gestionar Libros
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Settings className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Configuración de Remuneraciones</h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Configura los parámetros del sistema incluyendo AFP, Isapres y topes imponibles
            </p>
            <Link href="/payroll/settings">
              <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                <Settings className="w-5 h-5 mr-2" />
                Ir a Configuración
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}

        {/* System Integration Notice - Estilo Dashboard Ejecutivo */}
        <div className="mt-12 bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 rounded-2xl p-8 border border-indigo-200">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Sparkles className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-indigo-900 mb-2">
                Módulo de Remuneraciones Completamente Integrado
              </h3>
              <p className="text-indigo-700 mb-4">
                Sistema completo de RRHH con cálculos automáticos según normativa chilena 2025.
                Gestión de empleados, contratos, liquidaciones y reportes previsionales en una sola plataforma.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-indigo-800">Cálculos Automáticos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-indigo-800">Normativa 2025</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium text-indigo-800">Reportes Oficiales</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}