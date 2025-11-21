'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';

// Definición de tipos
export interface Company {
  id: string;
  rut: string;
  razon_social: string;
  nombre_fantasia?: string;
  giro: string;
  direccion: string;
  telefono: string;
  email: string;
  website?: string;
  logo?: string;
  created_at: string;
  plan_tipo: 'demo' | 'basico' | 'profesional' | 'empresarial';
  estado: 'activo' | 'suspendido' | 'inactivo';
}

// 🚀 LISTA DINÁMICA DE EMPRESAS - ESCALABILIDAD INFINITA
// ✅ AHORA OBTIENE DATOS DE API DINÁMICA EN LUGAR DE HARDCODEADO
let cachedCompanies: Company[] = [];
let companiesLoaded = false;

// 📡 FUNCIÓN PARA CARGAR EMPRESAS DINÁMICAMENTE
async function loadCompaniesFromAPI(): Promise<Company[]> {
  try {
    if (companiesLoaded) {
      return cachedCompanies;
    }

    console.log('🏢 [CompanyContext] Loading companies from dynamic API...');
    const response = await fetch('/api/companies', {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success && data.data && Array.isArray(data.data)) {
      cachedCompanies = data.data;
      companiesLoaded = true;
      console.log(`✅ [CompanyContext] Loaded ${cachedCompanies.length} companies dynamically`);
      return cachedCompanies;
    }

    throw new Error('Invalid companies data received from API');

  } catch (error) {
    console.error('❌ [CompanyContext] Error loading companies:', error);

    // Fallback a empresa por defecto
    const fallbackCompany: Company = {
      id: '8033ee69-b420-4d91-ba0e-482f46cd6fce',
      rut: '78.223.873-6',
      razon_social: 'ContaPyme Demo Enterprise',
      nombre_fantasia: 'PyME Ejemplo',
      giro: 'Servicios de Consultoría y Asesoría Empresarial',
      direccion: 'Las Malvas 2775, Punta Arenas',
      telefono: '+56 2 2345 6789',
      email: 'contacto@pymeejemplo.cl',
      website: 'https://pymeejemplo.cl',
      logo: '/logo-demo-company.png',
      created_at: '2025-08-05T17:19:11.951641+00:00',
      plan_tipo: 'demo',
      estado: 'activo',
    };

    cachedCompanies = [fallbackCompany];
    return cachedCompanies;
  }
}

// 🎯 FUNCIÓN PARA OBTENER EMPRESA POR ID DINÁMICAMENTE
async function getCompanyById(companyId: string): Promise<Company | null> {
  const companies = await loadCompaniesFromAPI();
  return companies.find(company => company.id === companyId) || null;
}

// Empresa demo predeterminada (mantener compatibilidad)
export const DEMO_COMPANY: Company = {
  id: '8033ee69-b420-4d91-ba0e-482f46cd6fce',
  rut: '78.223.873-6',
  razon_social: 'ContaPyme Demo Enterprise',
  nombre_fantasia: 'PyME Ejemplo',
  giro: 'Servicios de Consultoría y Asesoría Empresarial',
  direccion: 'Las Malvas 2775, Punta Arenas',
  telefono: '+56 2 2345 6789',
  email: 'contacto@pymeejemplo.cl',
  website: 'https://pymeejemplo.cl',
  logo: '/logo-demo-company.png',
  created_at: '2025-08-05T17:19:11.951641+00:00',
  plan_tipo: 'demo',
  estado: 'activo',
};

// Context configuration
interface CompanyContextType {
  company: Company;
  isDemoMode: boolean;
  switchCompany: (companyId: string) => void;
  isLoading: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

// Provider Props
interface CompanyProviderProps {
  children: ReactNode;
  company?: Company;
  demoMode?: boolean;
}

// 🚀 FUNCIÓN DINÁMICA PARA OBTENER EMPRESA POR PORTAL ID
export async function getCompanyByPortalId(portalId: string): Promise<Company> {
  console.log('🔍 [CompanyContext] Getting company for portal ID:', portalId);

  try {
    // Mapeo de portal IDs a company IDs (mantener compatibilidad)
    const portalToCompanyMap: Record<string, string> = {
      'demo-1': '8033ee69-b420-4d91-ba0e-482f46cd6fce',
      'demo-2': '9144ff7a-c530-5e82-cb1f-593f57de7fde',
    };

    const companyId = portalToCompanyMap[portalId];

    if (companyId) {
      const company = await getCompanyById(companyId);
      if (company) {
        console.log(`✅ [CompanyContext] Found company: ${company.razon_social}`);
        return company;
      }
    }

    // Si no se encuentra, intentar usar el portalId directamente como company ID
    const directCompany = await getCompanyById(portalId);
    if (directCompany) {
      console.log(`✅ [CompanyContext] Found company by direct ID: ${directCompany.razon_social}`);
      return directCompany;
    }

    // Si aún no se encuentra, usar la primera empresa disponible
    const companies = await loadCompaniesFromAPI();
    if (companies.length > 0) {
      console.log(`⚠️ [CompanyContext] Using first available company: ${companies[0].razon_social}`);
      return companies[0];
    }

    // Último recurso: empresa por defecto
    console.log('⚠️ [CompanyContext] Using fallback company');
    return DEMO_COMPANY;

  } catch (error) {
    console.error('❌ [CompanyContext] Error in getCompanyByPortalId:', error);
    return DEMO_COMPANY;
  }
}

// 🆕 FUNCIÓN PARA OBTENER LISTA COMPLETA DE EMPRESAS
export async function getAllCompanies(): Promise<Company[]> {
  return loadCompaniesFromAPI();
}

// Provider Component
export function CompanyProvider({
  children,
  company,
  demoMode = true,
}: CompanyProviderProps) {
  const [currentCompany, setCurrentCompany] = useState<Company>(company || DEMO_COMPANY);
  const [isLoading, setIsLoading] = useState(true);

  // 🚀 Load company from localStorage on mount - DINAMICAMENTE
  useEffect(() => {
    async function loadInitialCompany() {
      if (typeof window !== 'undefined' && demoMode) {
        try {
          setIsLoading(true);

          const savedCompanyId = localStorage.getItem('activeCompanyId');
          console.log('🏢 [CompanyContext] Loading initial company, saved ID:', savedCompanyId);

          if (savedCompanyId) {
            const mappedCompany = await getCompanyByPortalId(savedCompanyId);
            setCurrentCompany(mappedCompany);
            console.log(`✅ [CompanyContext] Initial company loaded: ${mappedCompany.razon_social}`);
          } else {
            // Cargar primera empresa disponible
            const companies = await loadCompaniesFromAPI();
            if (companies.length > 0) {
              setCurrentCompany(companies[0]);
              localStorage.setItem('activeCompanyId', 'demo-1'); // Mantener compatibilidad
              console.log(`✅ [CompanyContext] Default company loaded: ${companies[0].razon_social}`);
            }
          }
        } catch (error) {
          console.error('❌ [CompanyContext] Error loading initial company:', error);
          setCurrentCompany(DEMO_COMPANY);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }

    loadInitialCompany();
  }, [demoMode]);

  const switchCompany = async (companyIdOrPortalId: string) => {
    console.log('🔄 [CompanyContext] Switching to company:', companyIdOrPortalId);

    if (demoMode) {
      try {
        setIsLoading(true);

        // 🚀 OBTENER EMPRESA DINÁMICAMENTE - Manejar tanto portal ID como database ID
        let mappedCompany: Company;

        // Primero intentar como portal ID
        mappedCompany = await getCompanyByPortalId(companyIdOrPortalId);

        // Si no se encuentra y parece ser un UUID (database ID), intentar búsqueda directa
        if (mappedCompany.id === DEMO_COMPANY.id && companyIdOrPortalId.includes('-')) {
          const directCompany = await getCompanyById(companyIdOrPortalId);
          if (directCompany) {
            mappedCompany = directCompany;
          }
        }

        // 🚨 CRÍTICO: Invalidar cache y estados antes del cambio
        console.log('🧹 [CompanyContext] Invalidating cache and states for company switch...');

        // Limpiar cache específico de empresa anterior
        if (typeof window !== 'undefined') {
          // Limpiar localStorage relacionado con datos de empresa
          const keysToRemove = [
            'employees_cache',
            'accounts_cache',
            'transactions_cache',
            'payroll_cache',
            'f29_cache',
            'indicators_cache'
          ];
          keysToRemove.forEach(key => localStorage.removeItem(key));

          // Limpiar sessionStorage también
          sessionStorage.clear();
        }

        // Actualizar empresa actual
        setCurrentCompany(mappedCompany);
        // Guardar el ID que funcionó para futuras sesiones
        localStorage.setItem('activeCompanyId', companyIdOrPortalId);

        // 🎯 CRÍTICO: Disparar evento global para invalidar estados
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('companyChanged', {
            detail: {
              newCompanyId: mappedCompany.id,
              newCompanyPortalId: companyIdOrPortalId,
              companyData: mappedCompany
            }
          }));

          console.log(`✅ [CompanyContext] Company switch completed: ${mappedCompany.razon_social}`);
        }

      } catch (error) {
        console.error('❌ [CompanyContext] Error switching company:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // En modo producción: implementar lógica de cambio de empresa
      console.log('Production mode company switching not implemented yet');
    }
  };

  const contextValue: CompanyContextType = {
    company: currentCompany,
    isDemoMode: demoMode,
    isLoading,
    switchCompany,
  };

  return (
    <CompanyContext.Provider value={contextValue}>
      {children}
    </CompanyContext.Provider>
  );
}

// Hook para usar el contexto
export function useCompany() {
  const context = useContext(CompanyContext);
  
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  
  return context;
}

// Hook para datos de empresa
export function useCompanyData() {
  const { company, isDemoMode } = useCompany();
  
  return {
    rut: company.rut,
    razonSocial: company.razon_social,
    nombreFantasia: company.nombre_fantasia,
    giro: company.giro,
    direccion: company.direccion,
    telefono: company.telefono,
    email: company.email,
    website: company.website,
    logo: company.logo,
    planTipo: company.plan_tipo,
    estado: company.estado,
    isDemoMode,
    
    // Métodos de utilidad
    isActive: company.estado === 'activo',
    isPremium: ['profesional', 'empresarial'].includes(company.plan_tipo),
    getDisplayName: () => company.nombre_fantasia || company.razon_social,
    getShortRut: () => company.rut.replace(/\./g, '').replace('-', ''),
    
    // Formatters
    formatRut: () => company.rut,
    formatAddress: () => company.direccion,
    formatPhone: () => company.telefono,
  };
}

// Configuración de modo demo
export const DEMO_MODE = true;

// 🚀 FUNCIÓN DINÁMICA PARA OBTENER EMPRESA ACTUAL
export async function getCurrentCompany(): Promise<Company> {
  if (DEMO_MODE && typeof window !== 'undefined') {
    try {
      const savedCompanyId = localStorage.getItem('activeCompanyId');
      if (savedCompanyId) {
        return await getCompanyByPortalId(savedCompanyId);
      }

      // Si no hay empresa guardada, usar la primera disponible
      const companies = await loadCompaniesFromAPI();
      if (companies.length > 0) {
        return companies[0];
      }
    } catch (error) {
      console.error('❌ [CompanyContext] Error in getCurrentCompany:', error);
    }
  }

  // Fallback a empresa demo
  return DEMO_COMPANY;
}

// Función para verificar si está en modo demo
export function isDemoMode(): boolean {
  return DEMO_MODE;
}

// Hook simplificado para obtener solo el company ID
export function useCompanyId(): string {
  const { company } = useCompany();
  return company.id;
}

// 🚀 FUNCIÓN DINÁMICA PARA OBTENER CONFIGURACIÓN DE EMPRESA
export async function getCompanyConfig() {
  const company = await getCurrentCompany();
  
  return {
    company,
    features: {
      f29Analysis: true,
      f29Comparative: true,
      economicIndicators: true,
      fixedAssets: company.plan_tipo !== 'demo' ? true : true, // En demo también disponible
      payroll: company.plan_tipo !== 'demo' ? true : true,
      reports: company.plan_tipo !== 'demo' ? true : true,
      configuration: true,
    },
    limits: {
      employees: company.plan_tipo === 'demo' ? 10 : company.plan_tipo === 'basico' ? 25 : 100,
      f29Documents: company.plan_tipo === 'demo' ? 24 : 1000,
      storage: company.plan_tipo === 'demo' ? '100MB' : '10GB',
    },
    support: {
      email: company.plan_tipo !== 'demo',
      phone: ['profesional', 'empresarial'].includes(company.plan_tipo),
      whatsapp: company.plan_tipo !== 'demo',
    },
  };
}
