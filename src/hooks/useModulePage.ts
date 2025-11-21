/**
 * Hook centralizado para páginas principales de módulos
 * Garantiza consistencia en el manejo multi-empresa
 *
 * @author Claude Code - Sistema Multi-Tenancy
 * @version 1.0.0
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { useCompanyAwareState, useCompanyCacheInvalidation } from '@/hooks/useCompanyAwareState';

interface ModulePageOptions {
  moduleName: string;
  cacheKeys?: string[];
  enableMetrics?: boolean;
  debugMode?: boolean;
}

/**
 * Hook unificado para páginas de módulos (Contabilidad, Remuneraciones, etc.)
 * Proporciona gestión automática de empresa, cache y métricas
 */
export function useModulePage(options: ModulePageOptions) {
  const {
    moduleName,
    cacheKeys = [],
    enableMetrics = true,
    debugMode = false
  } = options;

  const { company } = useCompany();

  // Estados que se limpian automáticamente al cambiar empresa
  const [isLoading, setIsLoading] = useCompanyAwareState(false, {
    debugKey: `${moduleName}-loading`
  });

  const [error, setError] = useCompanyAwareState<string | null>(null, {
    debugKey: `${moduleName}-error`
  });

  const [lastCompanyId, setLastCompanyId] = useState<string | null>(null);

  // Invalidación de cache específica del módulo
  useCompanyCacheInvalidation([
    `${moduleName}_cache`,
    `${moduleName}_metrics`,
    ...cacheKeys
  ]);

  // Detectar cambios de empresa
  const hasCompanyChanged = company?.id !== lastCompanyId;

  useEffect(() => {
    if (company?.id && hasCompanyChanged) {
      if (debugMode) {
        console.log(`🔄 [${moduleName}] Company changed: ${lastCompanyId} → ${company.id}`);
        console.log(`🏢 [${moduleName}] Loading data for: ${company.razon_social}`);
      }
      setLastCompanyId(company.id);
    }
  }, [company?.id, moduleName, debugMode, hasCompanyChanged, lastCompanyId]);

  // Función para fetch de datos genérico
  const fetchModuleData = useCallback(async <T>(
    apiEndpoint: string,
    options: RequestInit = {}
  ): Promise<T | null> => {
    if (!company?.id) {
      if (debugMode) console.warn(`⚠️ [${moduleName}] No company ID available for fetch`);
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Construir URL con parámetros de empresa
      const url = new URL(apiEndpoint, window.location.origin);
      url.searchParams.set('company_id', company.id);
      url.searchParams.set('t', Date.now().toString()); // Cache busting

      if (debugMode) {
        console.log(`📡 [${moduleName}] Fetching:`, url.toString());
      }

      const response = await fetch(url.toString(), {
        ...options,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (debugMode) {
        console.log(`✅ [${moduleName}] Data loaded successfully:`, data);
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error cargando datos de ${moduleName}: ${errorMessage}`);

      if (debugMode) {
        console.error(`❌ [${moduleName}] Fetch error:`, err);
      }

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [company?.id, moduleName, debugMode]);

  // Función para métricas rápidas
  const getQuickMetrics = useCallback(async () => {
    if (!enableMetrics || !company?.id) return null;

    return fetchModuleData(`/api/${moduleName.toLowerCase()}/metrics`);
  }, [enableMetrics, company?.id, fetchModuleData, moduleName]);

  // Información de la empresa actual para UI
  const companyInfo = {
    id: company?.id,
    name: company?.razon_social || 'Cargando...',
    rut: company?.rut || '',
    isLoading: !company?.id
  };

  // Función de reset manual
  const resetModuleData = useCallback(() => {
    if (debugMode) {
      console.log(`🔄 [${moduleName}] Manual reset triggered`);
    }
    setIsLoading(false);
    setError(null);
  }, [moduleName, debugMode, setIsLoading, setError]);

  return {
    // Información de empresa
    company: companyInfo,

    // Estado del módulo
    isLoading: isLoading,
    error,

    // Utilidades de datos
    fetchModuleData,
    getQuickMetrics,
    resetModuleData,

    // Flags útiles
    hasCompanyChanged: hasCompanyChanged && lastCompanyId !== null,
    isReady: !!company?.id,

    // Debug info
    debugInfo: debugMode ? {
      moduleName,
      currentCompanyId: company?.id,
      lastCompanyId,
      cacheKeys,
    } : undefined
  };
}

/**
 * Hook específico para páginas de módulo con métricas de dashboard
 */
export function useModulePageWithMetrics<T>(
  moduleName: string,
  initialMetrics: T,
  options: Omit<ModulePageOptions, 'enableMetrics'> & {
    metricsEndpoint?: string;
    refreshInterval?: number;
    autoFetchMetrics?: boolean;
  } = {}
) {
  const {
    metricsEndpoint = `/api/${moduleName.toLowerCase()}/metrics`,
    refreshInterval = 0, // 0 = no auto refresh
    autoFetchMetrics = true, // Por defecto true, pero se puede desactivar
    ...moduleOptions
  } = options;

  const moduleState = useModulePage({
    ...moduleOptions,
    moduleName,
    enableMetrics: true
  });

  const [metrics, setMetrics] = useCompanyAwareState<T>(initialMetrics, {
    debugKey: `${moduleName}-metrics`
  });

  // Fetch de métricas específicas
  const refreshMetrics = useCallback(async () => {
    const data = await moduleState.fetchModuleData<{ data: T }>(metricsEndpoint);
    if (data?.data) {
      setMetrics(data.data);
    }
  }, [moduleState, metricsEndpoint, setMetrics]);

  // Auto-refresh de métricas (solo si está habilitado)
  useEffect(() => {
    if (moduleState.isReady && autoFetchMetrics) {
      refreshMetrics();
    }
  }, [moduleState.isReady, autoFetchMetrics, refreshMetrics]);

  // Auto-refresh interval
  useEffect(() => {
    if (refreshInterval > 0 && moduleState.isReady) {
      const interval = setInterval(refreshMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, moduleState.isReady, refreshMetrics]);

  return {
    ...moduleState,
    metrics,
    setMetrics,
    refreshMetrics
  };
}