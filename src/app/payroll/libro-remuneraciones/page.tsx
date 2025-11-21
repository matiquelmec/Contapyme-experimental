'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  Download,
  Plus,
  Calendar,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Filter,
  Search,
  X,
  CheckSquare,
  Square,
  Calculator,
  Trash2,
  ArrowLeft,
  RefreshCw,
  TrendingUp,
  Eye
} from 'lucide-react';
import { useModulePageWithMetrics } from '@/hooks/useModulePage';

interface PayrollBook {
  id: string;
  period: string;
  book_number: number;
  company_name: string;
  company_rut: string;
  generation_date: string;
  status: 'draft' | 'approved' | 'locked' | 'archived';
  total_employees: number;
  total_haberes: number;
  total_descuentos: number;
  total_liquido: number;
  payroll_book_details: any[];
}

interface BookStats {
  totalBooks: number;
  totalEmployees: number;
  totalHaberes: number;
  currentMonth: string;
}

const initialStats: BookStats = {
  totalBooks: 0,
  totalEmployees: 0,
  totalHaberes: 0,
  currentMonth: new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long' })
};

export default function LibroRemuneracionesPage() {
  // ✅ SOLUCIÓN ROBUSTA: Hook centralizado para gestión multi-empresa
  const {
    company,
    isLoading: moduleLoading,
    error: moduleError,
    fetchModuleData,
    metrics: stats,
    setMetrics: setStats,
    refreshMetrics,
    hasCompanyChanged,
    isReady,
    debugInfo
  } = useModulePageWithMetrics('payroll/libro-remuneraciones', initialStats, {
    cacheKeys: ['libro_remuneraciones_cache', 'payroll_books_cache'],
    refreshInterval: 0,
    autoFetchMetrics: false,
    debugMode: true
  });

  const [books, setBooks] = useState<PayrollBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingBook, setGeneratingBook] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [periodAvailability, setPeriodAvailability] = useState<any>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Estados para filtros
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');

  // Estados para selección múltiple
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [exportingMultiple, setExportingMultiple] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [deletingBookIds, setDeletingBookIds] = useState<string[]>([]);

  // Función para cargar libros
  const loadBooks = useCallback(async () => {
    if (!isReady) return;

    try {
      setLoading(true);
      console.log('📊 [LibroRemuneraciones] Loading books for company:', company.id);

      const booksData = await fetchModuleData<{ data: PayrollBook[]; success: boolean }>('/api/payroll/libro-remuneraciones');

      if (booksData?.success && booksData.data) {
        const booksArray = booksData.data;
        setBooks(booksArray);

        // Calcular estadísticas
        const newStats = {
          totalBooks: booksArray.length,
          totalEmployees: booksArray.reduce((sum, book) => sum + book.total_employees, 0),
          totalHaberes: booksArray.reduce((sum, book) => sum + book.total_haberes, 0),
          currentMonth: new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long' })
        };

        setStats(newStats);
        console.log('✅ [LibroRemuneraciones] Books loaded:', booksArray.length);
      }
    } catch (err) {
      console.error('❌ [LibroRemuneraciones] Error loading books:', err);
    } finally {
      setLoading(false);
    }
  }, [isReady, company.id, fetchModuleData, setStats]);

  // Cargar datos cuando la empresa esté lista
  useEffect(() => {
    if (isReady) {
      console.log('🔄 [LibroRemuneraciones] Company ready, loading books...');
      loadBooks();
    }
  }, [isReady, loadBooks]);

  // 🚀 CRÍTICO: Recargar datos automáticamente cuando cambie la empresa
  useEffect(() => {
    if (hasCompanyChanged && isReady) {
      console.log('🔄 [LibroRemuneraciones] Company changed - auto-reloading books...');
      loadBooks();
    }
  }, [hasCompanyChanged, isReady, loadBooks]);

  // Debug info
  useEffect(() => {
    if (debugInfo && hasCompanyChanged) {
      console.log('🔄 [LibroRemuneraciones] Company changed, new data:', debugInfo);
    }
  }, [debugInfo, hasCompanyChanged]);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount);

  const formatPeriod = (period: string) => {
    const [year, month] = period.split('-');
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    return `${months[parseInt(month) - 1]} ${year}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'draft':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'locked':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  // 📊 GENERAR NUEVO LIBRO DE REMUNERACIONES
  const generateBook = async () => {
    try {
      setGeneratingBook(true);
      console.log('📊 Generating payroll book for period:', selectedPeriod);

      // Simular generación de libro
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generar datos simulados del libro
      const newBook = {
        id: Date.now().toString(),
        period: selectedPeriod,
        generated_date: new Date().toISOString(),
        total_employees: Math.floor(Math.random() * 20 + 10),
        total_haberes: Math.floor(Math.random() * 50000000 + 20000000),
        total_descuentos: Math.floor(Math.random() * 8000000 + 5000000),
        total_liquido: 0,
        status: 'draft',
        company_id: company.id
      };

      newBook.total_liquido = newBook.total_haberes - newBook.total_descuentos;

      // Actualizar estado
      const updatedBooks = [...books, newBook];
      setBooks(updatedBooks);

      // Actualizar stats
      setStats(prev => ({
        ...prev,
        totalBooks: updatedBooks.length,
        totalEmployees: updatedBooks.reduce((sum, book) => sum + book.total_employees, 0),
        totalHaberes: updatedBooks.reduce((sum, book) => sum + book.total_haberes, 0)
      }));

      console.log('✅ Book generated successfully');
    } catch (error) {
      console.error('❌ Error generating book:', error);
    } finally {
      setGeneratingBook(false);
    }
  };

  // 📥 DESCARGAR LIBRO EN FORMATO EXCEL
  const downloadExcel = async (book: any) => {
    try {
      const [year, month] = book.period.split('-');
      const response = await fetch(
        `/api/payroll/libro-remuneraciones/excel?company_id=${company.id}&year=${year}&month=${month}`,
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const monthNames = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
        ];
        a.download = `Libro_Remuneraciones_${monthNames[parseInt(month) - 1]}_${year}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        alert(`Error descargando Excel: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error descargando Excel:', error);
      alert('Error descargando archivo Excel');
    }
  };

  // 📄 DESCARGAR LIBRO EN FORMATO CSV
  const downloadCSV = async (book: any) => {
    try {
      console.log('🔄 Generando CSV para período:', book.period);

      const response = await fetch(`/api/payroll/libro-remuneraciones/csv-dt?company_id=${company.id}&period=${book.period}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `libro_remuneraciones_${book.period}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        console.log('✅ CSV descargado exitosamente');
      } else {
        const errorData = await response.json();
        console.error('Error en API CSV:', errorData);
        alert(`Error al generar CSV: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Error al descargar CSV');
    }
  };

  // 🏢 DESCARGAR FORMATO PREVIRED
  const downloadPrevired = async (book: any) => {
    try {
      console.log('🔄 Generando archivo Previred para período:', book.period);

      const response = await fetch(`/api/payroll/previred-export?company_id=${company.id}&period=${book.period}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const [year, month] = book.period.split('-');
        a.download = `previred_${month}${year}_${company.rut?.replace(/[.\-]/g, '') || 'empresa'}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        console.log('✅ Archivo Previred descargado exitosamente');
      } else {
        const errorData = await response.json();
        console.error('Error en API Previred:', errorData);
        alert(`Error al generar archivo Previred: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error downloading Previred:', error);
      alert('Error al descargar archivo Previred');
    }
  };

  // 🗑️ ELIMINAR LIBRO
  const deleteBook = async (book: any) => {
    try {
      const confirmed = window.confirm(
        `¿Estás seguro de que deseas eliminar el libro de remuneraciones del período ${book.period}?\n\nEsta acción no se puede deshacer.`
      );

      if (!confirmed) return;

      console.log('🗑️ Deleting book:', book.id);

      // Simular eliminación
      const updatedBooks = books.filter(b => b.id !== book.id);
      setBooks(updatedBooks);

      // Actualizar stats
      setStats(prev => ({
        ...prev,
        totalBooks: updatedBooks.length,
        totalEmployees: updatedBooks.reduce((sum, book) => sum + book.total_employees, 0),
        totalHaberes: updatedBooks.reduce((sum, book) => sum + book.total_haberes, 0)
      }));

      console.log('✅ Book deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting book:', error);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprobado';
      case 'draft': return 'Borrador';
      case 'locked': return 'Bloqueado';
      case 'archived': return 'Archivado';
      default: return status;
    }
  };

  // Filtrar libros
  const filteredBooks = books.filter(book => {
    const matchesSearch = searchTerm === '' ||
      formatPeriod(book.period).toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.book_number.toString().includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || book.status === statusFilter;

    const bookYear = book.period.split('-')[0];
    const matchesYear = yearFilter === 'all' || bookYear === yearFilter;

    return matchesSearch && matchesStatus && matchesYear;
  });

  // Generar opciones de período (últimos 12 meses)
  const generatePeriodOptions = () => {
    const options = [];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const period = `${year}-${month}`;
      const label = formatPeriod(period);

      options.push({ value: period, label });
    }

    return options;
  };

  if (moduleLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                <p className="mt-4 text-gray-600">Cargando libro de remuneraciones...</p>
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

          {/* Header Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-700 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Link
                    href="/payroll"
                    className="mr-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-white" />
                  </Link>
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                      📊 Libro de Remuneraciones
                    </h1>
                    <p className="text-blue-100 text-sm">
                      Gestión centralizada de libros mensuales con exportación automática
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-white">{company.name}</div>
                  <div className="text-blue-100 text-sm">{company.rut}</div>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {moduleError && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      <strong>Error cargando datos:</strong> {moduleError}
                    </p>
                    <button
                      onClick={() => loadBooks()}
                      className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                    >
                      Intentar de nuevo
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-4 divide-x divide-gray-200 bg-gray-50">
              <div className="px-6 py-4 text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 rounded h-5 w-8 mx-auto" />
                  ) : (
                    stats.totalBooks
                  )}
                </div>
                <div className="text-sm text-gray-600">Libros Generados</div>
              </div>
              <div className="px-6 py-4 text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 rounded h-5 w-8 mx-auto" />
                  ) : (
                    stats.totalEmployees
                  )}
                </div>
                <div className="text-sm text-gray-600">Empleados Procesados</div>
              </div>
              <div className="px-6 py-4 text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 rounded h-5 w-12 mx-auto" />
                  ) : (
                    `${formatCurrency(stats.totalHaberes / 1000000).replace('$', '$')}M`
                  )}
                </div>
                <div className="text-sm text-gray-600">Total Haberes</div>
              </div>
              <div className="px-6 py-4 text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {stats.currentMonth}
                </div>
                <div className="text-sm text-gray-600">Período Actual</div>
              </div>
            </div>
          </div>

          {/* Generación de Libro */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Generar Nuevo Libro</h2>
                  <p className="text-sm text-gray-600">
                    Crea un libro de remuneraciones para un período específico
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Período
                  </label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar período</option>
                    {generatePeriodOptions().map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <button
                    onClick={generateBook}
                    disabled={!selectedPeriod || generatingBook}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors flex items-center"
                  >
                    {generatingBook ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    ) : (
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                    )}
                    {generatingBook ? 'Generando...' : 'Generar Libro'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros */}
          {books.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition-colors"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                    </button>
                    {(searchTerm || statusFilter !== 'all' || yearFilter !== 'all') && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('all');
                          setYearFilter('all');
                        }}
                        className="flex items-center px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-md transition-colors"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Limpiar
                      </button>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {filteredBooks.length !== books.length && (
                      <span>Mostrando {filteredBooks.length} de {books.length} libros</span>
                    )}
                  </div>
                </div>

                {showFilters && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Búsqueda */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Buscar
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por período..."
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Filtro por estado */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estado
                        </label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="all">Todos los estados</option>
                          <option value="draft">Borrador</option>
                          <option value="approved">Aprobado</option>
                          <option value="locked">Bloqueado</option>
                          <option value="archived">Archivado</option>
                        </select>
                      </div>

                      {/* Filtro por año */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Año
                        </label>
                        <select
                          value={yearFilter}
                          onChange={(e) => setYearFilter(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="all">Todos los años</option>
                          {[...new Set(books.map(book => book.period.split('-')[0]))].sort((a, b) => b.localeCompare(a)).map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lista de Libros */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Libros Generados</h2>
              </div>
              {books.length > 0 && (
                <div className="bg-gray-100 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-gray-700">
                    {filteredBooks.length} de {books.length} libro{books.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>

            {books.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileSpreadsheet className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No hay libros generados
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Genera tu primer libro de remuneraciones seleccionando un período en el panel superior.
                  </p>
                </div>
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No se encontraron libros
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    No hay libros que coincidan con los filtros aplicados.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredBooks.map((book) => (
                  <div
                    key={book.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="border-b border-gray-200 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                            <Calendar className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {formatPeriod(book.period)}
                            </h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <div className="flex items-center">
                                {getStatusIcon(book.status)}
                                <span className="ml-2 text-sm text-gray-600">{getStatusText(book.status)}</span>
                              </div>
                              <span className="text-sm text-gray-500">
                                Libro #{book.book_number}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            {new Date(book.generation_date).toLocaleDateString('es-CL')}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                              <Users className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Empleados</p>
                              <p className="text-xl font-semibold text-blue-700">
                                {book.total_employees}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                              <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Total Haberes</p>
                              <p className="text-lg font-semibold text-green-700">
                                {formatCurrency(book.total_haberes)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                              <DollarSign className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Descuentos</p>
                              <p className="text-lg font-semibold text-red-700">
                                {formatCurrency(book.total_descuentos)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                              <Calculator className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Líquido a Pagar</p>
                              <p className="text-lg font-semibold text-purple-700">
                                {formatCurrency(book.total_liquido)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Botones de acciones */}
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => downloadExcel(book)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                          Excel
                        </button>

                        <button
                          onClick={() => downloadCSV(book)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          CSV
                        </button>

                        <button
                          onClick={() => downloadPrevired(book)}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          Previred
                        </button>

                        <button
                          onClick={() => deleteBook(book)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}