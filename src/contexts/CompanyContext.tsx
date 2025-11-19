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

// Mapeo de empresas demo a IDs de base de datos
export const DEMO_COMPANIES_MAP = {
  'demo-1': {
    id: '8033ee69-b420-4d91-ba0e-482f46cd6fce', // Empresa Demo S.A.
    rut: '78.223.873-6',
    razon_social: 'Empresa Demo S.A.',
    nombre_fantasia: 'Empresa Demo S.A.',
    giro: 'Servicios de Consultoría Contable y Tributaria',
    direccion: 'Santiago, Región Metropolitana, Chile',
    telefono: '+56 9 1234 5678',
    email: 'contacto@empresademo.cl',
    website: 'https://empresademo.cl',
    logo: '/logo-demo-company.png',
    created_at: '2024-01-15T10:00:00Z',
    plan_tipo: 'demo' as const,
    estado: 'activo' as const,
  },
  'demo-2': {
    id: '9144ff7a-c530-5e82-cb1f-593f57de7fde', // Mi Pyme Ltda.
    rut: '98.765.432-1',
    razon_social: 'Mi Pyme Ltda.',
    nombre_fantasia: 'Mi Pyme Ltda.',
    giro: 'Comercio al por menor de productos varios',
    direccion: 'Valparaíso, Región de Valparaíso, Chile',
    telefono: '+56 9 8765 4321',
    email: 'contacto@mipyme.cl',
    website: 'https://mipyme.cl',
    logo: '/logo-demo-company-2.png',
    created_at: '2024-01-15T10:00:00Z',
    plan_tipo: 'demo' as const,
    estado: 'activo' as const,
  },
};

// Empresa demo predeterminada (mantener compatibilidad)
export const DEMO_COMPANY: Company = DEMO_COMPANIES_MAP['demo-1'];

// Context configuration
interface CompanyContextType {
  company: Company;
  isDemoMode: boolean;
  switchCompany?: (companyId: string) => void;
  isLoading: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

// Provider Props
interface CompanyProviderProps {
  children: ReactNode;
  company?: Company;
  demoMode?: boolean;
}

// Function to get company by portal ID
export function getCompanyByPortalId(portalId: string): Company {
  return DEMO_COMPANIES_MAP[portalId as keyof typeof DEMO_COMPANIES_MAP] || DEMO_COMPANIES_MAP['demo-1'];
}

// Provider Component
export function CompanyProvider({
  children,
  company,
  demoMode = true,
}: CompanyProviderProps) {
  const [currentCompany, setCurrentCompany] = useState<Company>(company || DEMO_COMPANY);
  const [isLoading, setIsLoading] = useState(true);

  // Load company from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCompanyId = localStorage.getItem('activeCompanyId');
      if (savedCompanyId && demoMode) {
        const mappedCompany = getCompanyByPortalId(savedCompanyId);
        setCurrentCompany(mappedCompany);
      }
      setIsLoading(false);
    }
  }, [demoMode]);

  const switchCompany = (companyPortalId: string) => {
    console.log('Switching to company:', companyPortalId);
    if (demoMode) {
      const mappedCompany = getCompanyByPortalId(companyPortalId);
      setCurrentCompany(mappedCompany);
      localStorage.setItem('activeCompanyId', companyPortalId);
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

// Función para obtener empresa actual
export function getCurrentCompany(): Company {
  if (DEMO_MODE && typeof window !== 'undefined') {
    const savedCompanyId = localStorage.getItem('activeCompanyId');
    if (savedCompanyId) {
      return getCompanyByPortalId(savedCompanyId);
    }
    return DEMO_COMPANY;
  }

  // En producción: obtener de localStorage, session, etc.
  // Por ahora retorna demo
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

// Función para obtener configuración de empresa
export function getCompanyConfig() {
  const company = getCurrentCompany();
  
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
