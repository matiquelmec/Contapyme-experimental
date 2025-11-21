/**
 * 🚀 SISTEMA DINÁMICO DE PERFILES DE EMPRESA
 *
 * Este sistema genera perfiles de empresa dinámicamente basado en:
 * 1. Datos reales de base de datos (cuando están disponibles)
 * 2. Algoritmos inteligentes para datos demo realistas
 * 3. Escalabilidad infinita para cualquier número de empresas
 *
 * @author Claude Code - Arquitectura Escalable
 * @version 2.0.0 - Sistema Completamente Dinámico
 */

import type { Company } from '@/contexts/CompanyContext';

// 🎯 INTERFACES PARA PERFILES DINÁMICOS
export interface CompanyProfile {
  id: string;
  name: string;
  scale: number;
  complexity: number;
  activityMultiplier: number;
  riskLevel: number;
  employeeCount: number;
  assetCount: number;
  currentBalance: number;
  ivaAmount: number;
  industry: string;
  size: 'micro' | 'pequeña' | 'mediana' | 'grande';
  characteristics: CompanyCharacteristics;
}

export interface CompanyCharacteristics {
  hasHighVolume: boolean;
  isServiceBased: boolean;
  isManufacturing: boolean;
  hasInternationalOperations: boolean;
  usesAdvancedAccounting: boolean;
  hasMultipleLocations: boolean;
}

// 🏭 TIPOS DE INDUSTRIA CON CARACTERÍSTICAS ESPECÍFICAS
const INDUSTRY_PROFILES = {
  'consultoria': {
    baseScale: 0.7,
    complexity: 0.6,
    riskLevel: 0.1,
    characteristics: { isServiceBased: true, hasHighVolume: false }
  },
  'retail': {
    baseScale: 1.0,
    complexity: 0.8,
    riskLevel: 0.15,
    characteristics: { hasHighVolume: true, isServiceBased: false }
  },
  'manufactura': {
    baseScale: 1.2,
    complexity: 1.0,
    riskLevel: 0.2,
    characteristics: { isManufacturing: true, hasHighVolume: true }
  },
  'tecnologia': {
    baseScale: 0.9,
    complexity: 0.9,
    riskLevel: 0.12,
    characteristics: { isServiceBased: true, usesAdvancedAccounting: true }
  },
  'construccion': {
    baseScale: 1.1,
    complexity: 0.95,
    riskLevel: 0.25,
    characteristics: { hasMultipleLocations: true, isManufacturing: false }
  },
  'servicios': {
    baseScale: 0.8,
    complexity: 0.7,
    riskLevel: 0.08,
    characteristics: { isServiceBased: true, hasHighVolume: false }
  }
} as const;

// 📊 TAMAÑOS DE EMPRESA CON ESCALAS REALISTAS
const COMPANY_SIZES = {
  'micro': { employees: [1, 5], assets: [3, 8], balanceMultiplier: 0.3 },
  'pequeña': { employees: [6, 25], assets: [8, 15], balanceMultiplier: 0.6 },
  'mediana': { employees: [26, 100], assets: [15, 30], balanceMultiplier: 1.0 },
  'grande': { employees: [101, 500], assets: [30, 80], balanceMultiplier: 2.0 }
} as const;

/**
 * 🎯 FUNCIÓN PRINCIPAL: GENERAR PERFIL DINÁMICO DE EMPRESA
 *
 * Esta función crea un perfil único para cualquier empresa basado en:
 * - Su ID único (determinística pero variada)
 * - Datos de contexto real de la empresa
 * - Algoritmos que simulan características realistas
 */
export function generateCompanyProfile(
  companyId: string,
  companyData?: Company
): CompanyProfile {

  // 🎲 ALGORITMO DETERMINÍSTICO BASADO EN COMPANY_ID
  // Esto asegura que la misma empresa siempre tenga el mismo perfil
  const hash = simpleHash(companyId);
  const seedRandom = createSeededRandom(hash);

  // 🏢 DETERMINAR CARACTERÍSTICAS BÁSICAS DE LA EMPRESA
  let industry: keyof typeof INDUSTRY_PROFILES;
  let size: keyof typeof COMPANY_SIZES;

  if (companyData) {
    // 🎯 USAR DATOS REALES SI ESTÁN DISPONIBLES
    industry = inferIndustryFromGiro(companyData.giro);
    size = inferSizeFromPlanTipo(companyData.plan_tipo);
  } else {
    // 🎲 GENERAR BASADO EN ALGORITMO DETERMINÍSTICO
    const industries = Object.keys(INDUSTRY_PROFILES) as Array<keyof typeof INDUSTRY_PROFILES>;
    const sizes = Object.keys(COMPANY_SIZES) as Array<keyof typeof COMPANY_SIZES>;

    industry = industries[Math.floor(seedRandom() * industries.length)];
    size = sizes[Math.floor(seedRandom() * sizes.length)];
  }

  // 📈 OBTENER CONFIGURACIONES BASE
  const industryProfile = INDUSTRY_PROFILES[industry];
  const sizeProfile = COMPANY_SIZES[size];

  // 🔢 CALCULAR MÉTRICAS ESCALADAS
  const baseScale = industryProfile.baseScale * sizeProfile.balanceMultiplier;
  const complexity = industryProfile.complexity;
  const riskLevel = industryProfile.riskLevel;

  // 👥 GENERAR NÚMERO DE EMPLEADOS
  const [minEmp, maxEmp] = sizeProfile.employees;
  const employeeCount = Math.floor(seedRandom() * (maxEmp - minEmp + 1)) + minEmp;

  // 🏗️ GENERAR ACTIVOS FIJOS
  const [minAssets, maxAssets] = sizeProfile.assets;
  const assetCount = Math.floor(seedRandom() * (maxAssets - minAssets + 1)) + minAssets;

  // 💰 GENERAR BALANCE ACTUAL REALISTA
  const baseBalance = 5000000; // 5M CLP base
  const currentBalance = Math.round(
    baseBalance * baseScale * (0.8 + seedRandom() * 0.4) // Variación ±20%
  );

  // 📊 CALCULAR IVA PROPORCIONAL AL TAMAÑO
  const ivaAmount = Math.round(currentBalance * 0.05 * (0.8 + seedRandom() * 0.4));

  // 🏢 CONSTRUIR CARACTERÍSTICAS ESPECÍFICAS
  const characteristics: CompanyCharacteristics = {
    hasHighVolume: industryProfile.characteristics.hasHighVolume || false,
    isServiceBased: industryProfile.characteristics.isServiceBased || false,
    isManufacturing: industryProfile.characteristics.isManufacturing || false,
    hasInternationalOperations: size === 'grande' && seedRandom() > 0.7,
    usesAdvancedAccounting: industryProfile.characteristics.usesAdvancedAccounting || complexity > 0.8,
    hasMultipleLocations: industryProfile.characteristics.hasMultipleLocations || size === 'grande',
  };

  // 🎯 NOMBRE DINÁMICO O DE DATOS REALES
  const name = companyData?.razon_social || generateRealisticCompanyName(industry, size, seedRandom);

  return {
    id: companyId,
    name,
    scale: baseScale,
    complexity,
    activityMultiplier: baseScale * 0.8, // Actividad proporcional al tamaño
    riskLevel,
    employeeCount,
    assetCount,
    currentBalance,
    ivaAmount,
    industry,
    size,
    characteristics,
  };
}

/**
 * 🧠 INFERIR INDUSTRIA DESDE EL GIRO COMERCIAL
 */
function inferIndustryFromGiro(giro: string): keyof typeof INDUSTRY_PROFILES {
  const giroLower = giro.toLowerCase();

  if (giroLower.includes('consultor') || giroLower.includes('asesor')) return 'consultoria';
  if (giroLower.includes('retail') || giroLower.includes('comercio') || giroLower.includes('venta')) return 'retail';
  if (giroLower.includes('manufactura') || giroLower.includes('fabricación') || giroLower.includes('producción')) return 'manufactura';
  if (giroLower.includes('tecnolog') || giroLower.includes('software') || giroLower.includes('sistemas')) return 'tecnologia';
  if (giroLower.includes('construcción') || giroLower.includes('inmobiliaria')) return 'construccion';

  return 'servicios'; // Default
}

/**
 * 📋 INFERIR TAMAÑO DESDE EL PLAN TIPO
 */
function inferSizeFromPlanTipo(planTipo: string): keyof typeof COMPANY_SIZES {
  switch (planTipo) {
    case 'demo': return 'pequeña';
    case 'basico': return 'micro';
    case 'profesional': return 'mediana';
    case 'empresarial': return 'grande';
    default: return 'pequeña';
  }
}

/**
 * 🏭 GENERAR NOMBRE REALISTA DE EMPRESA
 */
function generateRealisticCompanyName(
  industry: keyof typeof INDUSTRY_PROFILES,
  size: keyof typeof COMPANY_SIZES,
  random: () => number
): string {
  const prefixes = {
    consultoria: ['Consultoría', 'Asesoría', 'Servicios', 'Grupo'],
    retail: ['Comercial', 'Distribuidora', 'Retail', 'Tiendas'],
    manufactura: ['Industrias', 'Fabricaciones', 'Manufacturas', 'Productora'],
    tecnologia: ['Tech', 'Digital', 'Innovation', 'Systems'],
    construccion: ['Constructora', 'Inmobiliaria', 'Edificaciones', 'Proyectos'],
    servicios: ['Servicios', 'Soluciones', 'Empresa', 'Corporación'],
  };

  const suffixes = ['SPA', 'Ltda.', 'S.A.', 'EIRL'];
  const names = ['Norte', 'Sur', 'Central', 'Pacifico', 'Andino', 'Imperial', 'Global', 'Pro', 'Elite', 'Prime'];

  const prefixList = prefixes[industry];
  const prefix = prefixList[Math.floor(random() * prefixList.length)];
  const name = names[Math.floor(random() * names.length)];
  const suffix = suffixes[Math.floor(random() * suffixes.length)];

  return `${prefix} ${name} ${suffix}`;
}

/**
 * 🔢 UTILIDADES DE HASH Y RANDOM DETERMINÍSTICO
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function createSeededRandom(seed: number): () => number {
  let current = seed;
  return () => {
    current = (current * 9301 + 49297) % 233280;
    return current / 233280;
  };
}

/**
 * 🎯 FUNCIONES DE ACCESO RÁPIDO PARA APIS
 */
export function getCompanyScale(companyId: string, companyData?: Company): number {
  return generateCompanyProfile(companyId, companyData).scale;
}

export function getCompanyComplexity(companyId: string, companyData?: Company): number {
  return generateCompanyProfile(companyId, companyData).complexity;
}

export function getCompanyActivityLevel(companyId: string, companyData?: Company): number {
  return generateCompanyProfile(companyId, companyData).activityMultiplier;
}

/**
 * 🔍 FUNCIÓN PARA DEBUGGING Y DESARROLLO
 */
export function getCompanyProfileDebug(companyId: string, companyData?: Company) {
  const profile = generateCompanyProfile(companyId, companyData);

  console.log(`🏢 Profile for ${profile.name}:`, {
    id: profile.id,
    industry: profile.industry,
    size: profile.size,
    employees: profile.employeeCount,
    scale: profile.scale,
    complexity: profile.complexity,
    balance: profile.currentBalance.toLocaleString('es-CL'),
    characteristics: profile.characteristics,
  });

  return profile;
}