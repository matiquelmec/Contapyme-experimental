'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  TrendingUp,
  DollarSign,
  Zap,
  Users,
  ArrowLeft,
  RefreshCw,
  Clock,
  Activity,
  ArrowUp,
  ArrowDown,
  Info,
  CheckCircle,
  AlertTriangle,
  Calculator,
} from 'lucide-react';

import { useSmartIndicators } from '@/hooks/useSmartIndicators';

export default function ModernIndicatorsPage() {
  const router = useRouter();

  const {
    indicators,
    loading,
    error,
    lastUpdate,
    manualRefresh,
    canManualRefresh,
  } = useSmartIndicators({
    cacheTime: 10, // 10 minutos para la página detallada
    backgroundRefresh: true,
    autoRefreshInterval: 15, // 15 minutos
  });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Funciones de navegación para los botones
  const handleNavigateToF29 = () => {
    router.push('/accounting/f29-analysis');
  };

  const handleNavigateToDashboard = () => {
    router.push('/dashboard-new');
  };

  const handleNavigateToAccounting = () => {
    router.push('/accounting');
  };

  // Organizar indicadores por categoría para mantener compatibilidad
  const safeIndicators = Array.isArray(indicators) ? indicators : [];
  const organizedIndicators = {
    monetary: safeIndicators.filter(ind => ind.category === 'monetary'),
    currency: safeIndicators.filter(ind => ind.category === 'currency'),
    crypto: safeIndicators.filter(ind => ind.category === 'crypto'),
    labor: safeIndicators.filter(ind => ind.category === 'labor'),
  };

  const formatValue = (indicator: any): string => {
    if (!indicator) return '-';

    const { value, format_type, decimal_places, unit, category } = indicator;

    // Verificar primero si es TPM (Tasa de Política Monetaria) - debe ser porcentaje
    if (indicator.code.toLowerCase() === 'tpm' || indicator.code.toLowerCase() === 'ipc' || unit === '%' || format_type === 'percentage') {
      return `${value.toFixed(decimal_places || 2)}%`;
    }

    // Verificar si es Bitcoin o crypto - debe mostrar formato USD
    if (unit === 'USD' || category === 'crypto' || indicator.code.toLowerCase() === 'bitcoin' || indicator.code.toLowerCase() === 'btc') {
      return `US$${value.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;
    }

    if (format_type === 'currency') {
      return `$${value.toLocaleString('es-CL', {
        minimumFractionDigits: decimal_places || 0,
        maximumFractionDigits: decimal_places || 0,
      })} CLP`;
    } else {
      // Para casos donde no hay format_type específico, inferir por categoría
      if (category === 'monetary' || category === 'currency') {
        return `$${value.toLocaleString('es-CL')} CLP`;
      } else {
        return value.toLocaleString('es-CL', {
          minimumFractionDigits: decimal_places || 0,
          maximumFractionDigits: decimal_places || 0,
        });
      }
    }
  };

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case 'monetary':
        return {
          title: 'Indicadores Monetarios',
          subtitle: 'UF, UTM y valores chilenos',
          icon: DollarSign,
          gradient: 'from-blue-500 to-indigo-600',
          bgColor: 'bg-blue-50',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
        };
      case 'currency':
        return {
          title: 'Divisas',
          subtitle: 'Dólar, Euro y otras monedas',
          icon: TrendingUp,
          gradient: 'from-green-500 to-emerald-600',
          bgColor: 'bg-green-50',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
        };
      case 'crypto':
        return {
          title: 'Criptomonedas',
          subtitle: 'Bitcoin, Ethereum y crypto',
          icon: Zap,
          gradient: 'from-orange-500 to-yellow-600',
          bgColor: 'bg-orange-50',
          iconBg: 'bg-orange-100',
          iconColor: 'text-orange-600',
        };
      case 'labor':
        return {
          title: 'Empleo y Salarios',
          subtitle: 'Sueldo mínimo y mercado laboral',
          icon: Users,
          gradient: 'from-purple-500 to-pink-600',
          bgColor: 'bg-purple-50',
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600',
        };
      default:
        return {
          title: 'Otros',
          subtitle: 'Indicadores adicionales',
          icon: Activity,
          gradient: 'from-gray-500 to-gray-600',
          bgColor: 'bg-gray-50',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
        };
    }
  };

  if (loading && !indicators.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Cargando indicadores económicos...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Principal */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Navigation & Title */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Link href="/accounting">
                    <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                      <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                  </Link>
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Indicadores Económicos</h1>
                    <p className="text-slate-300 text-sm">
                      Contexto económico chileno para decisiones empresariales
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={manualRefresh}
                    disabled={!canManualRefresh || loading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>Actualizar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Status Bar */}
            <div className="bg-gray-50 px-8 py-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'} ${loading ? 'animate-pulse' : ''}`} />
                    <span className="text-sm text-gray-600">
                      {error ? 'Error de conexión' : 'Sistema conectado'}
                    </span>
                  </div>
                  {lastUpdate && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Última actualización: {lastUpdate.toLocaleTimeString('es-CL')}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {safeIndicators.length} indicadores
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-900">Error de conexión</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Indicadores por Categoría */}
          <div className="space-y-8">
            {Object.entries(organizedIndicators).map(([category, data]) => {
              if (!data || data.length === 0) return null;

              const config = getCategoryConfig(category);
              const Icon = config.icon;
              const isSelected = selectedCategory === category;
              const isCollapsed = selectedCategory !== null && !isSelected;

              return (
                <div key={category} className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 ${isCollapsed ? 'opacity-50 scale-[0.98]' : ''}`}>
                  <div
                    className={`bg-gradient-to-r ${config.gradient} text-white p-6 cursor-pointer hover:opacity-90 transition-opacity`}
                    onClick={() => { setSelectedCategory(isSelected ? null : category); }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">{config.title}</h2>
                          <p className="text-white/80 text-sm">{config.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                          {data.length} {data.length === 1 ? 'indicador' : 'indicadores'}
                        </span>
                        <div className={`transform transition-transform ${isSelected ? 'rotate-180' : ''}`}>
                          <ArrowDown className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`transition-all duration-300 ${isSelected || selectedCategory === null ? 'max-h-none' : 'max-h-0 overflow-hidden'}`}>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.map((indicator, index) => (
                          <div
                            key={indicator.code || index}
                            className={`${config.bgColor} rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group`}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${config.iconBg}`}>
                                  <Icon className={`w-4 h-4 ${config.iconColor}`} />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900 text-sm">{indicator.name}</h3>
                                  <span className="text-xs text-gray-500 uppercase tracking-wide">
                                    {indicator.code}
                                  </span>
                                </div>
                              </div>
                              <Info className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            <div className="space-y-3">
                              <div className="text-2xl font-bold text-gray-900">
                                {formatValue(indicator)}
                              </div>

                              {indicator.change !== undefined && (
                                <div className={`flex items-center gap-1 text-sm ${
                                  indicator.change >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {indicator.change >= 0 ? (
                                    <ArrowUp className="w-4 h-4" />
                                  ) : (
                                    <ArrowDown className="w-4 h-4" />
                                  )}
                                  <span className="font-medium">
                                    {Math.abs(indicator.change).toFixed(2)}%
                                  </span>
                                </div>
                              )}

                              <div className="text-xs text-gray-500">
                                {indicator.date ? new Date(`${indicator.date  }T12:00:00`).toLocaleDateString('es-CL') : 'Fecha no disponible'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Acciones Rápidas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-8 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Acciones Relacionadas</h3>
              <p className="text-sm text-gray-600 mt-1">Aprovecha estos indicadores en tus análisis</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleNavigateToF29}
                  className="w-full group bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl p-4 text-left transition-all hover:shadow-lg cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                      <Calculator className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-blue-900">Análisis F29</div>
                      <div className="text-sm text-blue-700">Usar UF/UTM en cálculos</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleNavigateToDashboard}
                  className="w-full group bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl p-4 text-left transition-all hover:shadow-lg cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-purple-900">Dashboard</div>
                      <div className="text-sm text-purple-700">Ver en contexto ejecutivo</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleNavigateToAccounting}
                  className="w-full group bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl p-4 text-left transition-all hover:shadow-lg cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-green-900">Contabilidad</div>
                      <div className="text-sm text-green-700">Volver al módulo</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
