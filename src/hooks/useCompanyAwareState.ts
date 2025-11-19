/**
 * Hook que automáticamente limpia estados cuando cambia la empresa
 * Soluciona el problema de estados persistentes entre empresas
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useCompany } from '@/contexts/CompanyContext';

/**
 * Estado que se limpia automáticamente al cambiar empresa
 *
 * @param initialValue - Valor inicial del estado
 * @param options - Opciones de configuración
 * @returns [state, setState, resetState] - Similar a useState pero company-aware
 *
 * @example
 * ```tsx
 * const [employees, setEmployees] = useCompanyAwareState<Employee[]>([]);
 * // employees se limpia automáticamente al cambiar empresa
 * ```
 */
export function useCompanyAwareState<T>(
  initialValue: T,
  options: {
    /** Si debe limpiar automáticamente al cambiar empresa */
    autoClear?: boolean;
    /** Callback ejecutado al limpiar */
    onClear?: () => void;
    /** Clave única para debug */
    debugKey?: string;
  } = {}
) {
  const {
    autoClear = true,
    onClear,
    debugKey = 'unknown'
  } = options;

  const { company } = useCompany();
  const [state, setState] = useState<T>(initialValue);
  const prevCompanyId = useRef<string>(company.id);

  // Reset state cuando cambia la empresa
  useEffect(() => {
    if (autoClear && prevCompanyId.current !== company.id) {
      console.log(`🧹 [useCompanyAwareState:${debugKey}] Auto-clearing state due to company change: ${prevCompanyId.current} → ${company.id}`);

      setState(initialValue);
      onClear?.();
      prevCompanyId.current = company.id;
    } else if (!autoClear) {
      prevCompanyId.current = company.id;
    }
  }, [company.id, initialValue, autoClear, onClear, debugKey]);

  // Función manual para reset
  const resetState = useCallback(() => {
    console.log(`🔄 [useCompanyAwareState:${debugKey}] Manual reset triggered`);
    setState(initialValue);
    onClear?.();
  }, [initialValue, onClear, debugKey]);

  return [state, setState, resetState] as const;
}

/**
 * Hook para datos que se invalidan al cambiar empresa
 * Similar a useSWR pero company-aware
 *
 * @param key - Clave única para el dato
 * @param fetcher - Función que obtiene los datos
 * @param deps - Dependencias adicionales para re-fetch
 *
 * @example
 * ```tsx
 * const { data: employees, isLoading, refresh } = useCompanyAwareData(
 *   'employees',
 *   () => fetchEmployees(company.id),
 *   [company.id]
 * );
 * ```
 */
export function useCompanyAwareData<T>(
  key: string,
  fetcher: () => Promise<T>,
  deps: any[] = []
) {
  const { company } = useCompany();
  const [data, setData] = useCompanyAwareState<T | null>(null, {
    debugKey: `data-${key}`
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log(`📡 [useCompanyAwareData:${key}] Fetching data for company: ${company.id}`);

      const result = await fetcher();
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error(`❌ [useCompanyAwareData:${key}] Fetch error:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, company.id]);

  // Auto-refresh cuando cambia la empresa o dependencias
  useEffect(() => {
    refresh();
  }, [refresh, company.id, ...deps]);

  // Escuchar evento global de cambio de empresa para re-fetch inmediato
  useEffect(() => {
    const handleCompanyChange = (event: CustomEvent) => {
      console.log(`🔄 [useCompanyAwareData:${key}] Company changed event received, re-fetching...`);
      refresh();
    };

    window.addEventListener('companyChanged', handleCompanyChange as EventListener);
    return () => window.removeEventListener('companyChanged', handleCompanyChange as EventListener);
  }, [key, refresh]);

  return { data, isLoading, error, refresh } as const;
}

/**
 * Hook para limpiar cache específico al cambiar empresa
 * Útil para componentes que manejan su propio cache
 */
export function useCompanyCacheInvalidation(keys: string[]) {
  const { company } = useCompany();
  const prevCompanyId = useRef<string>(company.id);

  useEffect(() => {
    if (prevCompanyId.current !== company.id) {
      console.log(`🗑️ [useCompanyCacheInvalidation] Invalidating cache keys:`, keys);

      // Limpiar localStorage
      keys.forEach(key => {
        localStorage.removeItem(key);
        localStorage.removeItem(`${key}_timestamp`);
      });

      prevCompanyId.current = company.id;
    }
  }, [company.id, keys]);
}

/**
 * Hook para detectar cambios de empresa
 * Útil para efectos que deben ejecutarse solo al cambiar empresa
 */
export function useCompanyChange(callback: (newCompany: any, oldCompanyId: string) => void) {
  const { company } = useCompany();
  const prevCompanyId = useRef<string>(company.id);

  useEffect(() => {
    if (prevCompanyId.current !== company.id) {
      callback(company, prevCompanyId.current);
      prevCompanyId.current = company.id;
    }
  }, [company, callback]);
}

/**
 * Hook de conveniencia que combina limpieza de estado y cache
 */
export function useCompanyAwarePage() {
  const { company } = useCompany();

  // Limpiar cache común de páginas
  useCompanyCacheInvalidation([
    'page_cache',
    'table_data',
    'form_data',
    'widget_data'
  ]);

  return {
    companyId: company.id,
    company,
  };
}