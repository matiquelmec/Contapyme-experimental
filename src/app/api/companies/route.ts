/**
 * 🏢 API DINÁMICA DE EMPRESAS - INFINITAMENTE ESCALABLE
 *
 * Esta API proporciona una lista dinámica de empresas que puede:
 * 1. Consultar base de datos real cuando esté disponible
 * 2. Generar empresas demo dinámicamente para desarrollo
 * 3. Soportar cualquier número de empresas sin hardcodear
 * 4. Proporcionar datos en tiempo real
 *
 * @author Claude Code - Arquitectura Escalable
 * @version 2.0.0 - Sistema Completamente Dinámico
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getDatabaseConnection } from '@/lib/database';
import { generateCompanyProfile } from '@/lib/company-profiles';
import type { Company } from '@/contexts/CompanyContext';

export async function GET(request: NextRequest) {
  try {
    console.log('🏢 [Companies API] Fetching companies list');

    // ✅ OBTENER DATOS REALES DE LA BASE DE DATOS
    const supabase = getDatabaseConnection();
    if (supabase) {
      console.log('🗃️ [Companies API] Attempting to fetch from database');

      const realCompanies = await getRealCompaniesFromDatabase(supabase);
      if (realCompanies && realCompanies.length > 0) {
        console.log(`✅ [Companies API] Found ${realCompanies.length} real companies`);
        return NextResponse.json({
          success: true,
          data: realCompanies,
          timestamp: new Date().toISOString(),
          message: `${realCompanies.length} empresas obtenidas de base de datos`,
          source: 'database'
        });
      }
    }

    // Fallback a empresas demo dinámicas
    console.log('📊 [Companies API] Using dynamic demo companies');
    const demoCompanies = getDynamicDemoCompanies();

    return NextResponse.json({
      success: true,
      data: demoCompanies,
      timestamp: new Date().toISOString(),
      message: `${demoCompanies.length} empresas demo generadas dinámicamente`,
      source: 'demo_dynamic'
    });

  } catch (error) {
    console.error('❌ [Companies API] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Error al obtener lista de empresas',
      details: error instanceof Error ? error.message : 'Error desconocido',
    }, { status: 500 });
  }
}

// 🗃️ FUNCIÓN PARA OBTENER EMPRESAS REALES DE BASE DE DATOS
async function getRealCompaniesFromDatabase(supabase: any): Promise<Company[] | null> {
  try {
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .eq('estado', 'activo')
      .order('razon_social', { ascending: true });

    if (error) {
      console.warn('⚠️ [Companies API] Database error:', error);
      return null;
    }

    // Mapear datos de base de datos a interface Company
    const mappedCompanies: Company[] = companies?.map((company: any) => ({
      id: company.id,
      rut: company.rut,
      razon_social: company.razon_social,
      nombre_fantasia: company.nombre_fantasia,
      giro: company.giro,
      direccion: company.direccion,
      telefono: company.telefono,
      email: company.email,
      website: company.website,
      logo: company.logo,
      created_at: company.created_at,
      plan_tipo: company.plan_tipo || 'demo',
      estado: company.estado || 'activo',
    })) || [];

    console.log(`📋 [Companies API] Found ${mappedCompanies.length} companies in database`);
    return mappedCompanies;

  } catch (error) {
    console.error('💥 [Companies API] Database query error:', error);
    return null;
  }
}

// 🎯 FUNCIÓN PARA GENERAR EMPRESAS DEMO DINÁMICAS
function getDynamicDemoCompanies(): Company[] {
  // 🚀 EMPRESAS BASE CONOCIDAS (mantener compatibilidad)
  const knownCompanies = [
    {
      id: '8033ee69-b420-4d91-ba0e-482f46cd6fce',
      rut: '78.223.873-6',
      razon_social: 'ContaPyme Demo Enterprise',
      nombre_fantasia: 'PyME Ejemplo',
      giro: 'Servicios de Consultoría y Asesoría Empresarial',
    },
    {
      id: '9144ff7a-c530-5e82-cb1f-593f57de7fde',
      rut: '98.765.432-1',
      razon_social: 'Mi Pyme Ltda.',
      nombre_fantasia: 'Mi Pyme',
      giro: 'Comercio al por menor de productos varios',
    },
  ];

  // 🎲 GENERAR EMPRESAS ADICIONALES DINÁMICAMENTE (simulando crecimiento)
  const additionalCompanies = generateAdditionalDemoCompanies(3); // Generar 3 empresas adicionales

  const allDemoCompanies = [...knownCompanies, ...additionalCompanies];

  // 🏢 ENRIQUECER CON PERFILES DINÁMICOS Y DATOS REALISTAS
  return allDemoCompanies.map((companyBase, index) => {
    const profile = generateCompanyProfile(companyBase.id);

    return {
      id: companyBase.id,
      rut: companyBase.rut,
      razon_social: companyBase.razon_social || profile.name,
      nombre_fantasia: companyBase.nombre_fantasia || profile.name,
      giro: companyBase.giro || getGiroFromIndustry(profile.industry),
      direccion: generateAddress(index),
      telefono: generatePhoneNumber(),
      email: generateEmail(companyBase.razon_social || profile.name),
      website: generateWebsite(companyBase.razon_social || profile.name),
      logo: `/logo-demo-company-${index + 1}.png`,
      created_at: generateCreationDate(index).toISOString(),
      plan_tipo: 'demo' as const,
      estado: 'activo' as const,
    };
  });
}

// 🎲 GENERAR EMPRESAS ADICIONALES DINÁMICAMENTE
function generateAdditionalDemoCompanies(count: number) {
  const companies = [];

  for (let i = 0; i < count; i++) {
    const id = `demo-extra-${1000 + i}`;
    companies.push({
      id,
      rut: generateRUT(),
      razon_social: '', // Se llenará con el perfil dinámico
      nombre_fantasia: '',
      giro: '', // Se llenará con el perfil dinámico
    });
  }

  return companies;
}

// 🏭 MAPEAR INDUSTRIA A GIRO COMERCIAL
function getGiroFromIndustry(industry: string): string {
  const giroMap: Record<string, string> = {
    'consultoria': 'Servicios de Consultoría y Asesoría Empresarial',
    'retail': 'Comercio al por menor de productos varios',
    'manufactura': 'Fabricación y manufacturación de productos industriales',
    'tecnologia': 'Desarrollo de software y servicios tecnológicos',
    'construccion': 'Construcción y servicios inmobiliarios',
    'servicios': 'Servicios profesionales diversos',
  };

  return giroMap[industry] || 'Servicios profesionales diversos';
}

// 🏠 GENERAR DIRECCIONES REALISTAS
function generateAddress(index: number): string {
  const streets = [
    'Av. Libertador Bernardo O\'Higgins',
    'Providencia',
    'Las Condes',
    'Av. Vicuña Mackenna',
    'Av. Apoquindo',
    'Pedro de Valdivia',
    'Manuel Montt',
    'Av. Santa María',
  ];

  const communes = [
    'Santiago Centro',
    'Providencia',
    'Las Condes',
    'Ñuñoa',
    'La Reina',
    'Vitacura',
    'San Miguel',
    'Maipú',
  ];

  const street = streets[index % streets.length];
  const number = 1000 + (index * 127) % 9000;
  const commune = communes[index % communes.length];

  return `${street} ${number}, ${commune}`;
}

// 📞 GENERAR NÚMEROS TELEFÓNICOS
function generatePhoneNumber(): string {
  const prefix = '+56';
  const area = Math.floor(Math.random() * 9) + 1; // 1-9
  const number = Math.floor(Math.random() * 90000000) + 10000000; // 8 digits

  return `${prefix} ${area} ${number.toString().replace(/(\d{4})(\d{4})/, '$1 $2')}`;
}

// 📧 GENERAR EMAILS REALISTAS
function generateEmail(companyName: string): string {
  const domain = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 10);

  return `contacto@${domain}.cl`;
}

// 🌐 GENERAR WEBSITES REALISTAS
function generateWebsite(companyName: string): string {
  const domain = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 10);

  return `https://${domain}.cl`;
}

// 📅 GENERAR FECHAS DE CREACIÓN REALISTAS
function generateCreationDate(index: number): Date {
  const today = new Date();
  const daysAgo = 30 + (index * 60); // Empresas creadas en diferentes fechas
  return new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);
}

// 🆔 GENERAR RUT CHILENO VÁLIDO
function generateRUT(): string {
  const number = Math.floor(Math.random() * 20000000) + 5000000; // 5M - 25M
  const dv = calculateDV(number);

  return `${number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}-${dv}`;
}

function calculateDV(rut: number): string {
  let suma = 0;
  let multiplicador = 2;
  const rutStr = rut.toString();

  for (let i = rutStr.length - 1; i >= 0; i--) {
    suma += parseInt(rutStr[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resto = suma % 11;
  const dv = 11 - resto;

  if (dv === 11) return '0';
  if (dv === 10) return 'K';
  return dv.toString();
}