'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { Plus, Users, Search, Eye, Edit, Trash2, FileText } from 'lucide-react';

import EmployeeEditModal from '@/components/payroll/EmployeeEditModal';
import { useCompany } from '@/contexts/CompanyContext';

interface Employee {
  id: string;
  rut: string;
  first_name: string;
  last_name: string;
  email: string;
  position?: string;
  status: string;
  employment_contracts?: Array<{
    id: string;
    position: string;
    base_salary: number;
    status: string;
    contract_type?: string;
  }>;
}

export default function EmployeesPage() {
  const { company } = useCompany();

  // Estado simple para empleados
  const [employees, setEmployees] = useState<Employee[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data and when company changes
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 [EmployeesPage] Fetching employees for company:', company.id);

        const response = await fetch(`/api/payroll/employees?company_id=${company.id}&t=${Date.now()}`, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al cargar empleados');
        }

        setEmployees(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar empleados');
      } finally {
        setLoading(false);
      }
    };

    // Clear previous data and states
    setEmployees(null);
    setDeleteModal({ show: false, employee: null, permanent: false });
    setEditModal({ show: false, employee: null });
    setDeleting(false);
    setError(null);

    // Fetch data
    fetchEmployees();
  }, [company.id]); // ONLY depend on company.id

  // Estados simples
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; employee: Employee | null; permanent: boolean }>({
    show: false,
    employee: null,
    permanent: false,
  });

  const [deleting, setDeleting] = useState(false);

  const [editModal, setEditModal] = useState<{ show: boolean; employee: Employee | null }>({
    show: false,
    employee: null,
  });

  const handleDeleteClick = (employee: Employee) => {
    setDeleteModal({ show: true, employee, permanent: false });
  };

  // Función optimizada para ver contrato del empleado (sin consultas adicionales)
  const handleViewContract = (employee: Employee) => {
    try {
      if (!employee.employment_contracts || employee.employment_contracts.length === 0) {
        alert('No se encontró contrato para este empleado');
        return;
      }
      
      // Usar el primer contrato activo
      const contract = employee.employment_contracts[0];
      const contractUrl = `/api/payroll/contracts/generate-pdf?contract_id=${contract.id}`;
      
      // Abrir en nueva pestaña
      window.open(contractUrl, '_blank');
      
    } catch (error) {
      console.error('Error al obtener contrato:', error);
      alert('Error al cargar el contrato');
    }
  };

  const confirmDelete = async (permanent: boolean = false) => {
    if (!deleteModal.employee) return;

    try {
      setDeleting(true);
      const url = permanent
        ? `/api/payroll/employees?id=${deleteModal.employee.id}&company_id=${company.id}&permanent=true`
        : `/api/payroll/employees?id=${deleteModal.employee.id}&company_id=${company.id}`;
        
      const response = await fetch(url, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        // Recargar la página para actualizar la lista
        window.location.reload();
      } else {
        alert(`❌ Error: ${data.error || 'No se pudo eliminar el empleado'}`);
      }
    } catch (err) {
      console.error('Error deleting employee:', err);
      alert('❌ Error de conexión al eliminar empleado');
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ show: false, employee: null, permanent: false });
  };

  // Función para limpiar caracteres especiales malformados
  const cleanText = (text: string) => {
    if (!text) return '';
    return text
      .replace(/Ã¡/g, 'á')
      .replace(/Ã©/g, 'é')
      .replace(/Ã­/g, 'í')
      .replace(/Ã³/g, 'ó')
      .replace(/Ãº/g, 'ú')
      .replace(/Ã±/g, 'ñ')
      .replace(/Ã/g, 'Á')
      .replace(/Ã/g, 'É')
      .replace(/Ã/g, 'Í')
      .replace(/Ã/g, 'Ó')
      .replace(/Ã/g, 'Ú')
      .replace(/Ã/g, 'Ñ')
      .replace(/�/g, 'é')
      .trim();
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                <p className="mt-4 text-gray-600">Cargando empleados...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
                  <h1 className="text-2xl font-bold text-white mb-2">Gestión de Empleados</h1>
                  <p className="text-slate-300 text-sm">
                    Administración de capital humano y contratos laborales
                  </p>
                </div>
                <Link href="/payroll/employees/new">
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                    <Plus className="w-4 h-4" />
                    <span>Nuevo Empleado</span>
                  </button>
                </Link>
              </div>
            </div>
            {/* Quick Stats */}
            <div className="grid grid-cols-3 divide-x divide-gray-200 bg-gray-50">
              <div className="px-6 py-4 text-center">
                <div className="text-lg font-semibold text-gray-900">{Array.isArray(employees) ? employees.length : 0}</div>
                <div className="text-sm text-gray-600">Total Empleados</div>
              </div>
              <div className="px-6 py-4 text-center">
                <div className="text-lg font-semibold text-gray-900">{Array.isArray(employees) ? employees.filter(e => e?.status === 'active').length : 0}</div>
                <div className="text-sm text-gray-600">Activos</div>
              </div>
              <div className="px-6 py-4 text-center">
                <div className="text-lg font-semibold text-gray-900">{Array.isArray(employees) ? employees.filter(e => e?.employment_contracts && Array.isArray(e.employment_contracts) && e.employment_contracts.length > 0).length : 0}</div>
                <div className="text-sm text-gray-600">Con Contratos</div>
              </div>
            </div>
          </div>
          {/* Búsqueda - Simplificada */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">📋 Lista de Empleados</h2>
              <div className="text-sm text-gray-500">{Array.isArray(employees) ? employees.length : 0} empleado(s)</div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o RUT..."
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center text-red-700">
                <Users className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Lista de empleados */}
          {!Array.isArray(employees) || employees.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center border border-gray-200 shadow-sm">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay empleados registrados
              </h3>
              <p className="text-gray-600 mb-6">
                Comienza agregando tu primer empleado al sistema
              </p>
              <Link href="/payroll/employees/new">
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                  <Plus className="h-4 w-4" />
                  <span>Agregar Primer Empleado</span>
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {employees.map((employee) => (
                <div key={employee.id} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {cleanText(`${employee.first_name} ${employee.last_name}`)}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>RUT: {employee.rut}</span>
                          {employee.employment_contracts && employee.employment_contracts.length > 0 && (
                            <>
                              <span>•</span>
                              <span>{cleanText(employee.employment_contracts[0].position)}</span>
                              <span>•</span>
                              <span className="text-green-600 font-medium">
                                {formatCurrency(employee.employment_contracts[0].base_salary)}
                              </span>
                            </>
                          )}
                        </div>
                        {employee.email && (
                          <div className="text-sm text-gray-500 mt-1">{employee.email}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        employee.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {employee.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>

                      <div className="flex gap-2">
                        <Link href={`/payroll/employees/${employee.id}`}>
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => { setEditModal({ show: true, employee }); }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { handleViewContract(employee); }}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { handleDeleteClick(employee); }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-gray-200 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Eliminar Empleado
                </h3>
                <p className="text-sm text-gray-600">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
              <p className="text-sm text-red-800 mb-4">
                ¿Qué acción deseas realizar con{' '}
                <strong>
                  {cleanText(`${deleteModal.employee?.first_name} ${deleteModal.employee?.last_name}`)}
                </strong>
                ?
              </p>
              
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="font-medium text-yellow-800 text-sm mb-1">Desactivar (Recomendado)</div>
                  <div className="text-xs text-yellow-700">
                    El empleado se marcará como inactivo pero se conservarán todos sus registros históricos para reportes y auditorías.
                  </div>
                </div>
                
                <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
                  <div className="font-medium text-red-800 text-sm mb-1">Eliminar Permanentemente ⚠️</div>
                  <div className="text-xs text-red-700">
                    Se eliminará completamente del sistema junto con todos sus contratos, liquidaciones y registros. Esta acción NO se puede deshacer.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={cancelDelete}
                disabled={deleting}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 rounded-xl transition-colors duration-200 font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => confirmDelete(false)}
                disabled={deleting}
                className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl transition-colors duration-200 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>Desactivar Empleado</span>
                  </>
                )}
              </button>
              <button
                onClick={() => confirmDelete(true)}
                disabled={deleting}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors duration-200 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar Permanentemente</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición de empleado */}
      {editModal.show && editModal.employee && (
        <EmployeeEditModal
          isOpen={editModal.show}
          onClose={() => { setEditModal({ show: false, employee: null }); }}
          employeeId={editModal.employee.id}
          onSave={() => {
            setEditModal({ show: false, employee: null });
            // Recargar la página para mostrar cambios
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
