'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { ArrowLeft, Edit, Trash2, User, Mail, Phone, MapPin, Briefcase, Calendar, DollarSign, Shield, FileText, TrendingUp, Activity, Clock, Star } from 'lucide-react';

import { Header } from '@/components/layout';
import { Button } from '@/components/ui';
import { formatDate as utilFormatDate } from '@/lib/utils';

interface Employee {
  id: string;
  rut: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  birth_date?: string;
  hire_date?: string;
  status: string;
  employment_contracts?: Array<{
    id: string;
    position: string;
    base_salary: number;
    status: string;
    start_date: string;
    end_date?: string;
    contract_type: string;
    afp_name?: string;
    health_institution?: string;
    isapre_plan?: string;
  }>;
  payroll_config?: {
    id: string;
    afp_code: string;
    health_institution_code: string;
    family_allowances: number;
  };
}

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const COMPANY_ID = '8033ee69-b420-4d91-ba0e-482f46cd6fce';

  useEffect(() => {
    if (params.id) {
      fetchEmployee(params.id as string);
    }
  }, [params.id]);

  const fetchEmployee = async (employeeId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/payroll/employees/${employeeId}?company_id=${COMPANY_ID}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setEmployee(data.data);
      } else {
        setError(data.error || 'Error al cargar empleado');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error fetching employee:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);

  // Obtener contrato activo y su información previsional
  const getActiveContract = (employee: Employee) => employee.employment_contracts?.find(contract => contract.status === 'active');

  const getAfpInfo = (employee: Employee) => {
    const activeContract = getActiveContract(employee);
    // TEMPORAL: Solo usar configuración individual hasta que se ejecute la migración
    return employee.payroll_config?.afp_code || 'No definida';
  };

  const getHealthInfo = (employee: Employee) => {
    const activeContract = getActiveContract(employee);
    // TEMPORAL: Solo usar configuración individual hasta que se ejecute la migración
    return employee.payroll_config?.health_institution_code || 'No definida';
  };

  // Formatear fecha usando utilidad centralizada
  const formatDate = (dateString: string) => utilFormatDate(dateString);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header
          title="Cargando..."
          subtitle="Obteniendo información del empleado"
          showBackButton
        />
        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
              <p className="mt-4 text-gray-600">Cargando empleado...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header
          title="Error"
          subtitle="No se pudo cargar el empleado"
          showBackButton
        />
        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 border-red-200 bg-red-50">
            <div className="pt-6 p-6">
              <div className="text-center py-12">
                <User className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-red-900 mb-2">
                  {error || 'Empleado no encontrado'}
                </h3>
                <Link href="/payroll/employees">
                  <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver a Lista de Empleados
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeContract = employee.employment_contracts?.find(contract => contract.status === 'active');

  // Función para generar initials del nombre
  const getInitials = (firstName: string, lastName: string) => `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header moderno con información del empleado */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            {/* Navegación y acciones */}
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/payroll/employees"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Volver a Empleados</span>
              </Link>

              <div className="flex items-center space-x-3">
                <Link href={`/payroll/employees/${employee.id}/edit`}>
                  <Button variant="outline" size="sm" className="hover:scale-105 transition-transform">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </Link>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </div>

            {/* Hero del empleado */}
            <div className="flex items-start space-x-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-white">
                      {getInitials(employee.first_name, employee.last_name)}
                    </span>
                  </div>
                  {/* Status indicator */}
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-white ${
                    employee.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                  } flex items-center justify-center`}>
                    {employee.status === 'active' && (
                      <Activity className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
              </div>

              {/* Información principal */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {employee.first_name} {employee.last_name}
                    </h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {employee.rut}
                      </span>
                      {employee.email && (
                        <span className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {employee.email}
                        </span>
                      )}
                      {activeContract && (
                        <span className="flex items-center font-medium text-blue-600">
                          <Briefcase className="w-4 h-4 mr-1" />
                          {activeContract.position}
                        </span>
                      )}
                    </div>

                    {/* Status y badges */}
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        employee.status === 'active'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          employee.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                        {employee.status === 'active' ? 'Empleado Activo' : 'Inactivo'}
                      </span>

                      {activeContract && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          <Calendar className="w-3 h-3 mr-1" />
                          Desde {formatDate(activeContract.start_date)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Salario destacado */}
                  {activeContract && (
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">Sueldo Base</div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(activeContract.base_salary)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {activeContract.contract_type}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Información Personal */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 mb-8">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Información Personal</h2>
                      <p className="text-sm text-gray-500">Datos básicos del empleado</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-500">
                      Nombre Completo
                    </label>
                    <p className="text-gray-900 font-medium text-lg">
                      {employee.first_name} {employee.last_name}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-500">
                      RUT
                    </label>
                    <p className="text-gray-900 font-mono">{employee.rut}</p>
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center text-sm font-medium text-gray-500">
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </label>
                    <p className="text-gray-900">{employee.email || 'No registrado'}</p>
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center text-sm font-medium text-gray-500">
                      <Phone className="h-4 w-4 mr-1" />
                      Teléfono
                    </label>
                    <p className="text-gray-900">{employee.phone || 'No registrado'}</p>
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="flex items-center text-sm font-medium text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      Dirección
                    </label>
                    <p className="text-gray-900">{employee.address || 'No registrada'}</p>
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center text-sm font-medium text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      Fecha de Nacimiento
                    </label>
                    <p className="text-gray-900">
                      {employee.birth_date ? formatDate(employee.birth_date) : 'No registrada'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center text-sm font-medium text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      Fecha de Contratación
                    </label>
                    <p className="text-gray-900">
                      {employee.hire_date ? formatDate(employee.hire_date) : 'No registrada'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contrato Activo */}
            {activeContract && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 mb-8">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">Contrato Activo</h2>
                        <p className="text-sm text-gray-500">Información laboral vigente</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                        Vigente
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-500">
                        Cargo
                      </label>
                      <p className="text-gray-900 font-semibold text-lg">{activeContract.position}</p>
                    </div>

                    <div className="space-y-1">
                      <label className="flex items-center text-sm font-medium text-gray-500">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Sueldo Base
                      </label>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(activeContract.base_salary)}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-500">
                        Tipo de Contrato
                      </label>
                      <div className="flex items-center space-x-2">
                        <p className="text-gray-900">{activeContract.contract_type}</p>
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                          {activeContract.contract_type === 'indefinido' ? 'Indefinido' : 'Plazo Fijo'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="flex items-center text-sm font-medium text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        Fecha de Inicio
                      </label>
                      <p className="text-gray-900">{formatDate(activeContract.start_date)}</p>
                    </div>

                    {activeContract.end_date && (
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-500">
                          Fecha de Término
                        </label>
                        <p className="text-gray-900">{formatDate(activeContract.end_date)}</p>
                      </div>
                    )}

                    {/* Información adicional del contrato */}
                    <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-xl">
                          <div className="text-sm font-medium text-gray-500">Duración</div>
                          <div className="text-lg font-semibold text-gray-900 mt-1">
                            {(() => {
                              const startDate = new Date(activeContract.start_date);
                              const endDate = activeContract.end_date ? new Date(activeContract.end_date) : new Date();
                              const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              const months = Math.floor(diffDays / 30);
                              return months > 0 ? `${months} meses` : `${diffDays} días`;
                            })()}
                          </div>
                        </div>

                        <div className="text-center p-3 bg-green-50 rounded-xl">
                          <div className="text-sm font-medium text-gray-500">Sueldo Anual</div>
                          <div className="text-lg font-semibold text-green-600 mt-1">
                            {formatCurrency(activeContract.base_salary * 12)}
                          </div>
                        </div>

                        <div className="text-center p-3 bg-blue-50 rounded-xl">
                          <div className="text-sm font-medium text-gray-500">Estado</div>
                          <div className="text-lg font-semibold text-blue-600 mt-1">
                            Activo
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            {/* Acciones Rápidas */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h2>
                    <p className="text-sm text-gray-500">Operaciones frecuentes</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-3">
                  <Link href={`/payroll/employees/${employee.id}/edit`}>
                    <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-xl transition-colors">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Edit className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Editar Información</div>
                        <div className="text-sm text-gray-500">Modificar datos personales</div>
                      </div>
                    </button>
                  </Link>

                  <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-xl transition-colors opacity-50 cursor-not-allowed">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Ver Liquidaciones</div>
                      <div className="text-sm text-gray-500">Historial de pagos</div>
                    </div>
                  </button>

                  <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-xl transition-colors opacity-50 cursor-not-allowed">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Historial de Asistencia</div>
                      <div className="text-sm text-gray-500">Control de horarios</div>
                    </div>
                  </button>

                  <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-red-50 rounded-xl transition-colors text-red-600">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium">Dar de Baja</div>
                      <div className="text-sm text-red-500">Terminar relación laboral</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Métricas Rápidas */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Resumen</h2>
                    <p className="text-sm text-gray-500">Datos clave</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estado</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    employee.status === 'active'
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      employee.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    {employee.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                {activeContract && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Antiguedad</span>
                      <span className="text-sm font-medium text-gray-900">
                        {(() => {
                          const startDate = new Date(activeContract.start_date);
                          const today = new Date();
                          const diffTime = today.getTime() - startDate.getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          const years = Math.floor(diffDays / 365);
                          const months = Math.floor((diffDays % 365) / 30);

                          if (years > 0) {
                            return `${years}a ${months}m`;
                          } else if (months > 0) {
                            return `${months} meses`;
                          } else {
                            return `${diffDays} días`;
                          }
                        })()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tipo de Contrato</span>
                      <span className="text-sm font-medium text-gray-900">
                        {activeContract.contract_type === 'indefinido' ? 'Indefinido' : 'Plazo Fijo'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Configuración Previsional */}
            {employee.payroll_config && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Configuración Previsional</h2>
                      <p className="text-sm text-gray-500">Datos de AFP y salud</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-500">
                      AFP
                    </label>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900 font-medium">{getAfpInfo(employee)}</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                        Individual
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-500">
                      Institución de Salud
                    </label>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900 font-medium">{getHealthInfo(employee)}</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                        Individual
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-500">
                      Cargas Familiares
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">{employee.payroll_config.family_allowances}</span>
                      </div>
                      <span className="text-gray-900 font-medium">
                        {employee.payroll_config.family_allowances === 0
                          ? 'Sin cargas familiares'
                          : `${employee.payroll_config.family_allowances} carga${employee.payroll_config.family_allowances > 1 ? 's' : ''}`
                        }
                      </span>
                    </div>
                  </div>

                  {/* Nota informativa */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-start space-x-2">
                      <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="text-xs text-gray-600">
                        <p className="font-medium mb-1">Configuración Individual</p>
                        <p>Esta configuración es específica para este empleado y prevalece sobre la configuración general de la empresa.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
