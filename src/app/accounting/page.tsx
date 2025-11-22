'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { useModulePageWithMetrics } from '@/hooks/useModulePage';

interface AccountingMetrics {
  currentMonth: string;
  ufValue: number;
  lastF29Status: string;
  companyStatus: string;
}

const initialMetrics: AccountingMetrics = {
  currentMonth: 'Nov 2024',
  ufValue: 36280,
  lastF29Status: '✓ Nov 2024',
  companyStatus: 'Al Día'
};

export default function AccountingPage() {
  // ✅ SOLUCIÓN ROBUSTA: Hook centralizado para gestión multi-empresa
  const {
    company,
    isLoading,
    error,
    fetchModuleData,
    metrics,
    setMetrics,
    refreshMetrics,
    hasCompanyChanged,
    isReady,
    debugInfo
  } = useModulePageWithMetrics('Accounting', initialMetrics, {
    cacheKeys: ['accounting_metrics', 'f29_data', 'indicators'],
    refreshInterval: 0, // Sin auto-refresh
    autoFetchMetrics: false, // No llamar endpoint automáticamente
    debugMode: true
  });

  // Función para cargar métricas específicas de empresa
  const loadAccountingMetrics = async () => {
    if (!isReady) return;

    try {
      // ✅ DATOS DIFERENCIADOS POR EMPRESA USANDO IDS REALES
      const companySpecificMetrics = {
        currentMonth: 'Nov 2024',
        ufValue: 36280,
        // Empresa 1: ContaPyme Demo Enterprise, Empresa 2: Mi Pyme Ltda.
        lastF29Status: company.id === '8033ee69-b420-4d91-ba0e-482f46cd6fce' ? '✓ Nov 2024' : '✓ Oct 2024',
        companyStatus: company.id === '8033ee69-b420-4d91-ba0e-482f46cd6fce' ? 'Al Día' : 'Pendiente F29'
      };

      setMetrics(companySpecificMetrics);
    } catch (err) {
      console.error('❌ [AccountingPage] Error loading metrics:', err);
    }
  };

  // Cargar datos cuando la empresa esté lista
  useEffect(() => {
    if (isReady) {
      console.log('🔄 [AccountingPage] Company ready, loading metrics...');
      loadAccountingMetrics();
    }
  }, [isReady]);

  // Debug info
  useEffect(() => {
    if (debugInfo && hasCompanyChanged) {
      console.log('🔄 [AccountingPage] Company changed, new data:', debugInfo);
    }
  }, [debugInfo, hasCompanyChanged]);

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
                  <h1 className="text-2xl font-bold text-white mb-2">Centro de Control Contable</h1>
                  <p className="text-slate-300 text-sm">
                    Gestión integral financiera con inteligencia artificial para tu empresa
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-white">{company.name}</div>
                  <div className="text-slate-300 text-sm">{company.rut}</div>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      <strong>Error cargando datos contables:</strong> {error}
                    </p>
                    <button
                      onClick={() => loadAccountingMetrics()}
                      className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                    >
                      Intentar de nuevo
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-3 divide-x divide-gray-200 bg-gray-50">
              <div className="px-6 py-4 text-center">
                <div className="text-lg font-semibold text-gray-900">UF Hoy</div>
                <div className="text-sm text-gray-600">
                  {isLoading ? (
                    <div className="animate-pulse bg-gray-200 rounded h-4 w-16 mx-auto" />
                  ) : (
                    `$${metrics.ufValue.toLocaleString('es-CL')}`
                  )}
                </div>
              </div>
              <div className="px-6 py-4 text-center">
                <div className="text-lg font-semibold text-gray-900">F29 Último</div>
                <div className="text-sm text-green-600">
                  {isLoading ? (
                    <div className="animate-pulse bg-gray-200 rounded h-4 w-20 mx-auto" />
                  ) : (
                    metrics.lastF29Status
                  )}
                </div>
              </div>
              <div className="px-6 py-4 text-center">
                <div className="text-lg font-semibold text-gray-900">Estado</div>
                <div className="text-sm text-blue-600">
                  {isLoading ? (
                    <div className="animate-pulse bg-gray-200 rounded h-4 w-12 mx-auto" />
                  ) : (
                    metrics.companyStatus
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Primary Analysis Tools */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">🔍 Análisis Inteligente</h2>
              <div className="text-sm text-gray-500">Herramientas principales</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* F29 Analysis - Primary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">F29 Inteligente</h3>
                      <p className="text-blue-100 text-sm">Análisis fiscal con IA</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <Link href="/accounting/f29-analysis" className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all text-sm border border-blue-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Análisis Individual</span>
                  </Link>
                  <Link href="/accounting/f29-comparative" className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>Comparativo</span>
                  </Link>
                </div>
              </div>

              {/* RCV Analysis */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-6m-4 0H3m2 0h6M7 3h10M9 7h6m-6 4h6m-6 4h6" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">RCV Inteligente</h3>
                      <p className="text-emerald-100 text-sm">Análisis de proveedores</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <Link href="/accounting/rcv-analysis" className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all text-sm border border-emerald-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Analizar RCV</span>
                  </Link>
                  <Link href="/accounting/rcv-history" className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <span>Historial</span>
                  </Link>
                </div>
              </div>

              {/* Executive Dashboard - Premium */}
              <div className="bg-white rounded-xl shadow-sm border-2 border-indigo-200 hover:shadow-md transition-all duration-200 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-white">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Dashboard Ejecutivo</h3>
                      <p className="text-indigo-100 text-sm">Insights con IA</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <Link href="/dashboard-new" className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all text-sm border border-indigo-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Ver Dashboard</span>
                  </Link>
                  <div className="flex items-center justify-center space-x-2 py-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Premium
                    </span>
                    <span className="text-xs text-gray-500">ROI + Correlaciones</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Secondary Analysis Tools */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">📈 Herramientas Avanzadas</h2>
              <div className="text-sm text-gray-500">Especializadas</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Balance Analyzer */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">Balance Analyzer</h3>
                    <p className="text-gray-500 text-xs">PDF → Asientos</p>
                  </div>
                </div>
                <Link href="/accounting/balance-analyzer" className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-2 rounded-lg font-medium flex items-center justify-center text-sm transition-all">
                  Analizar
                </Link>
                <div className="mt-2 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Revolucionario
                  </span>
                </div>
              </div>

              {/* Bank Analysis */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">Cartolas Bancarias</h3>
                    <p className="text-gray-500 text-xs">Flujo de caja</p>
                  </div>
                </div>
                <Link href="/accounting/bank-analysis" className="w-full bg-cyan-50 hover:bg-cyan-100 text-cyan-700 px-3 py-2 rounded-lg font-medium flex items-center justify-center text-sm transition-all">
                  Analizar
                </Link>
                <div className="mt-2 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Nuevo
                  </span>
                </div>
              </div>

              {/* Fixed Assets */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">Activos Fijos</h3>
                    <p className="text-gray-500 text-xs">Depreciación</p>
                  </div>
                </div>
                <Link href="/accounting/fixed-assets" className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-2 rounded-lg font-medium flex items-center justify-center text-sm transition-all">
                  Gestionar
                </Link>
              </div>

              {/* Indicators */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">Indicadores</h3>
                    <p className="text-gray-500 text-xs">UF, UTM, Cripto</p>
                  </div>
                </div>
                <Link href="/accounting/indicators" className="w-full bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-2 rounded-lg font-medium flex items-center justify-center text-sm transition-all">
                  Ver Valores
                </Link>
                <div className="mt-2 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Tiempo Real
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Libros Contables System */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">📋 Libros Contables</h2>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✨ Sistema Integrado
                </span>
                <div className="text-sm text-gray-500">Normativa chilena</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Link href="/accounting/journal-book" className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 p-6">
                <div className="w-12 h-12 bg-blue-500 group-hover:bg-blue-600 rounded-lg mb-4 flex items-center justify-center transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">Libro Diario</h3>
                <p className="text-gray-600 text-sm mb-3">Registro centralizado de todos los asientos contables</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">Automático</span>
                  <span className="text-gray-500">Debe = Haber</span>
                </div>
              </Link>

              <Link href="/accounting/general-ledger" className="group bg-white rounded-lg shadow-sm border-2 border-indigo-200 hover:shadow-md hover:border-indigo-400 transition-all duration-200 p-6">
                <div className="w-12 h-12 bg-indigo-500 group-hover:bg-indigo-600 rounded-lg mb-4 flex items-center justify-center transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">Libro Mayor</h3>
                <p className="text-gray-600 text-sm mb-3">Movimientos y saldos por cuenta contable</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded font-medium">Por Cuenta</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-800">
                    Nuevo
                  </span>
                </div>
              </Link>

              <Link href="/accounting/purchase-book" className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-green-300 transition-all duration-200 p-6">
                <div className="w-12 h-12 bg-green-500 group-hover:bg-green-600 rounded-lg mb-4 flex items-center justify-center transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">Libro de Compras</h3>
                <p className="text-gray-600 text-sm mb-3">Gestión de documentos de compra e IVA crédito fiscal</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-medium">IVA 19%</span>
                  <span className="text-gray-500">Auto-cálculo</span>
                </div>
              </Link>

              <Link href="/accounting/sales-book" className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-purple-300 transition-all duration-200 p-6">
                <div className="w-12 h-12 bg-purple-500 group-hover:bg-purple-600 rounded-lg mb-4 flex items-center justify-center transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">Libro de Ventas</h3>
                <p className="text-gray-600 text-sm mb-3">Gestión de documentos de venta e IVA débito fiscal</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">Facturas/Boletas</span>
                  <span className="text-gray-500">Totales automáticos</span>
                </div>
              </Link>
            </div>

            {/* Sistema Integration Info */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-900">
                    <strong>Sistema Integrado:</strong> Los libros de compra y venta generan automáticamente asientos en el libro diario.
                    Las remuneraciones también se sincronizan. Todo cumple con la normativa contable chilena.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Tools */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">🔧 Configuración y Reportes</h2>
              <div className="text-sm text-gray-500">Herramientas complementarias</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/accounting/configuration" className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-300 transition-all duration-200 p-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Configuración</h3>
                <p className="text-sm text-gray-600">Plan de cuentas IFRS y configuraciones</p>
              </Link>

              <Link href="/accounting/reports" className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-purple-300 transition-all duration-200 p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Reportes Financieros</h3>
                <p className="text-sm text-gray-600">Balance general, estado de resultados y más</p>
              </Link>

              <Link href="/accounting/balance-8-columns" className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-emerald-300 transition-all duration-200 p-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Balance 8 Columnas</h3>
                <p className="text-sm text-gray-600">Hoja de trabajo para estados financieros</p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    Nuevo
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
