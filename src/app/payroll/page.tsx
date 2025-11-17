'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@/components/ui';
import { Users, FileText, Clock, Calendar, BarChart3, Plus, ChevronRight, Settings, FileSpreadsheet, DollarSign, Activity, TrendingUp, ArrowRight, Database, Sparkles, FileX, Calculator, AlertTriangle, Shield } from 'lucide-react';

interface PayrollStats {
  totalEmployees: number;
  activeContracts: number;
  monthlyPayroll: number;
  upcomingEvents: number;
}

export default function PayrollPage() {
  const [stats, setStats] = useState<PayrollStats>({
    totalEmployees: 0,
    activeContracts: 0,
    monthlyPayroll: 0,
    upcomingEvents: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const COMPANY_ID = '8033ee69-b420-4d91-ba0e-482f46cd6fce';

  useEffect(() => {
    fetchStats();
  }, []);

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
          upcomingEvents: 3 // Simulado para demostración
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
    <div className="min-h-screen bg-gray-50">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Hero Section - Simplified */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-8 py-6">
              <h1 className="text-2xl font-bold text-white mb-2">Centro de Control de RRHH</h1>
              <p className="text-slate-300 text-sm">
                Gestión integral de capital humano con normativa chilena actualizada
              </p>
            </div>
            {/* Quick Stats */}
            <div className="grid grid-cols-4 divide-x divide-gray-200 bg-gray-50">
              <div className="px-6 py-4 text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {loadingStats ? (
                    <div className="animate-pulse bg-gray-200 rounded h-5 w-8 mx-auto"></div>
                  ) : (
                    stats.totalEmployees
                  )}
                </div>
                <div className="text-sm text-gray-600">Empleados</div>
              </div>
              <div className="px-6 py-4 text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {loadingStats ? (
                    <div className="animate-pulse bg-gray-200 rounded h-5 w-8 mx-auto"></div>
                  ) : (
                    formatCurrency(stats.monthlyPayroll / 1000000).replace('$', '$') + 'M'
                  )}
                </div>
                <div className="text-sm text-gray-600">Nómina Mensual</div>
              </div>
              <div className="px-6 py-4 text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {loadingStats ? (
                    <div className="animate-pulse bg-gray-200 rounded h-5 w-8 mx-auto"></div>
                  ) : (
                    stats.activeContracts
                  )}
                </div>
                <div className="text-sm text-gray-600">Contratos Activos</div>
              </div>
              <div className="px-6 py-4 text-center">
                <div className="text-lg font-semibold text-red-600">
                  {stats.upcomingEvents}
                </div>
                <div className="text-sm text-gray-600">Alertas Pendientes</div>
              </div>
            </div>
          </div>

          {/* Primary RRHH Tools */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">👥 Gestión de Capital Humano</h2>
              <div className="text-sm text-gray-500">Herramientas principales</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Employee Management */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Gestión de Empleados</h3>
                      <p className="text-blue-100 text-sm">Personal y contratos</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <Link href="/payroll/employees" className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all text-sm border border-blue-200">
                    <Users className="w-4 h-4" />
                    <span>Ver Empleados</span>
                  </Link>
                  <Link href="/payroll/employees/new" className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all text-sm">
                    <Plus className="w-4 h-4" />
                    <span>Nuevo Empleado</span>
                  </Link>
                </div>
              </div>

              {/* Liquidations */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Liquidaciones</h3>
                      <p className="text-green-100 text-sm">Cálculo automático</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <Link href="/payroll/liquidations" className="w-full bg-green-50 hover:bg-green-100 text-green-700 px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all text-sm border border-green-200">
                    <BarChart3 className="w-4 h-4" />
                    <span>Gestionar</span>
                  </Link>
                  <Link href="/payroll/liquidations/generate" className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all text-sm">
                    <Calculator className="w-4 h-4" />
                    <span>Nueva Liquidación</span>
                  </Link>
                </div>
              </div>

              {/* Contract Management - Premium */}
              <div className="bg-white rounded-xl shadow-sm border-2 border-amber-200 hover:shadow-md transition-all duration-200 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-6 text-white">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Contratos Inteligentes</h3>
                      <p className="text-amber-100 text-sm">Alertas automáticas</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <Link href="/payroll/contracts" className="w-full bg-amber-50 hover:bg-amber-100 text-amber-700 px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all text-sm border border-amber-200">
                    <Shield className="w-4 h-4" />
                    <span>Gestionar Contratos</span>
                  </Link>
                  <div className="flex items-center justify-center space-x-2 py-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {stats.upcomingEvents} Alertas
                    </span>
                    <span className="text-xs text-gray-500">Vencimientos próximos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RRHH Compliance & Alerts */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">⚠️ Alertas de Gestión de Contratos</h2>
              <div className="text-sm text-gray-500">Sistema proactivo</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Contract Expiration Alert */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">Contratos por Vencer</h3>
                    <p className="text-gray-500 text-xs">Próximos 30 días</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-red-600 mb-2">3</div>
                <div className="text-xs text-gray-500">Requieren renovación</div>
              </div>

              {/* Trial Periods Ending */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">Períodos de Prueba</h3>
                    <p className="text-gray-500 text-xs">Finalizando</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-yellow-600 mb-2">2</div>
                <div className="text-xs text-gray-500">Evaluaciones pendientes</div>
              </div>

              {/* Contract Modifications */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">Anexos por Generar</h3>
                    <p className="text-gray-500 text-xs">Modificaciones</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-2">1</div>
                <div className="text-xs text-gray-500">Cambio de condiciones</div>
              </div>

              {/* Payroll Cost Trend */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">Costo Mensual</h3>
                    <p className="text-gray-500 text-xs">Tendencia</p>
                  </div>
                </div>
                <div className="text-lg font-bold text-green-600 mb-2">↗ +2.3%</div>
                <div className="text-xs text-gray-500">vs mes anterior</div>
              </div>
            </div>
          </div>

          {/* Libros Oficiales & Reports */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">📋 Reportes y Libros Oficiales</h2>
              <div className="text-sm text-gray-500">Cumplimiento normativo</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Libro Remuneraciones */}
              <Link href="/payroll/libro-remuneraciones" className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-purple-300 transition-all duration-200 p-6">
                <div className="w-12 h-12 bg-purple-500 group-hover:bg-purple-600 rounded-lg mb-4 flex items-center justify-center transition-colors">
                  <FileSpreadsheet className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">Libro de Remuneraciones</h3>
                <p className="text-gray-600 text-sm mb-3">Generación automática mensual con exportación CSV</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">Mensual</span>
                  <span className="text-gray-500">Normativa DT</span>
                </div>
              </Link>

              {/* Configuración */}
              <Link href="/payroll/settings" className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-300 transition-all duration-200 p-6">
                <div className="w-12 h-12 bg-indigo-500 group-hover:bg-indigo-600 rounded-lg mb-4 flex items-center justify-center transition-colors">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">Configuración</h3>
                <p className="text-gray-600 text-sm mb-3">AFP, Isapres y parámetros del sistema</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded font-medium">Sistema</span>
                  <span className="text-gray-500">Actualizado 2025</span>
                </div>
              </Link>

              {/* Integration Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900 text-sm">Sistema Integrado</h3>
                    <p className="text-green-700 text-xs mt-1">
                      Los costos de nómina se integran automáticamente con el flujo de caja proyectado del módulo contable.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}