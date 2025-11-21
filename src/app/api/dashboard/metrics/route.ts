import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getDatabaseConnection } from '@/lib/database';
import { generateCompanyProfile } from '@/lib/company-profiles';

export async function GET(request: NextRequest) {
  try {
    // ✅ EXTRAER COMPANY_ID DEL QUERY PARAMETER
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');

    if (!companyId) {
      return NextResponse.json({
        success: false,
        error: 'company_id es requerido',
      }, { status: 400 });
    }

    console.log('🔍 [Metrics API] Fetching data for company:', companyId);

    // ✅ OBTENER DATOS REALES DE LA BASE DE DATOS
    const supabase = getDatabaseConnection();
    if (!supabase) {
      console.warn('⚠️ [Metrics API] Database not available, using demo data');
      return getDemoMetricsData(companyId);
    }

    // Intentar obtener datos reales de métricas de la base de datos
    const metricsData = await getMetricsDataFromDatabase(supabase, companyId);
    if (metricsData) {
      console.log('✅ [Metrics API] Using real database data');
      return NextResponse.json({
        success: true,
        data: metricsData,
        timestamp: new Date().toISOString(),
        message: 'Métricas obtenidas de base de datos',
        source: 'database'
      });
    }

    // Fallback a datos demo diferenciados por empresa
    console.log('📊 [Metrics API] Using differentiated demo data');
    return getDemoMetricsData(companyId);

  } catch (error) {
    console.error('❌ [Metrics API] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Error al obtener métricas del dashboard',
      details: error instanceof Error ? error.message : 'Error desconocido',
    }, { status: 500 });
  }
}

// 🗃️ FUNCIÓN PARA OBTENER DATOS REALES DE BASE DE DATOS
async function getMetricsDataFromDatabase(supabase: any, companyId: string) {
  try {
    // TODO: Implementar consulta real a métricas
    // Por ahora retorna null para usar datos demo
    // En el futuro consultar: employees, fixed_assets, journal_entries, etc.

    const { data: metricsData, error: metricsError } = await supabase
      .from('employees')
      .select('*')
      .eq('company_id', companyId)
      .limit(1);

    // Si no hay datos reales, usar datos demo
    if (metricsError || !metricsData || metricsData.length === 0) {
      return null;
    }

    // Si hay datos reales, calcularlos (implementación futura)
    // return calculateRealMetricsData(metricsData, companyId);
    return null; // Por ahora usar datos demo

  } catch (error) {
    console.error('Error querying database for metrics data:', error);
    return null;
  }
}

// 📊 FUNCIÓN PARA GENERAR DATOS DEMO DINÁMICOS POR EMPRESA
function getDemoMetricsData(companyId: string) {
  // 🚀 GENERAR PERFIL DINÁMICO DE EMPRESA - INFINITAMENTE ESCALABLE
  const profile = generateCompanyProfile(companyId);
  const { name, scale, employeeCount: employees, assetCount: assets, complexity } = profile;

    // Métricas de contabilidad realistas - ESCALADAS POR EMPRESA
    const accountingMetrics = {
      totalF29: Math.round(24 * complexity), // F29 procesados últimos 2 años
      avgProcessingTime: 1.2 / complexity, // Más eficiente empresa pequeña
      lastProcessed: '2 días', // Último F29 procesado
      totalFixedAssets: assets, // Activos fijos registrados
      totalAssetsValue: Math.round(12750000 * scale), // Valor total de activos
      depreciation: Math.round(185000 * scale), // Depreciación mensual
      chartOfAccountsEntries: Math.round(127 * complexity), // Plan de cuentas
      journalEntries: Math.round(456 * complexity), // Asientos de diario
    }

    // Métricas de remuneraciones realistas - ESCALADAS POR EMPRESA
    const payrollMetrics = {
      totalEmployees: employees, // Empleados activos
      totalLiquidations: employees * 12, // Liquidaciones anuales
      avgSalary: Math.round(850000 * (0.85 + scale * 0.3)), // Sueldo promedio escalado
      totalPayrollCost: Math.round(employees * 850000 * (0.85 + scale * 0.3)), // Costo total
      lastLiquidationDate: '2024-11-10', // Última liquidación
      activeContracts: employees, // Contratos activos
      pendingLiquidations: 0, // Liquidaciones pendientes
    }

    // Métricas generales del sistema - ESCALADAS POR EMPRESA
    const systemMetrics = {
      totalCompanies: 2, // Total empresas en el sistema
      systemUptime: 99.8, // Disponibilidad del sistema
      totalUsers: Math.round(3 * scale), // Usuarios escalados por empresa
      lastUpdated: new Date().toISOString(),
      dataQuality: 95.5 - (1 - complexity) * 5, // Calidad basada en complejidad
      processingSpeed: 2.1 * complexity, // Velocidad escalada
    }

    // Métricas específicas por módulo - ESCALADAS POR EMPRESA
    const moduleMetrics = {
      f29Analysis: {
        totalProcessed: accountingMetrics.totalF29,
        successRate: 97.8 + (1 - complexity) * 1.5, // Menor complejidad = mayor éxito
        avgProcessingTime: accountingMetrics.avgProcessingTime,
        lastProcessed: accountingMetrics.lastProcessed,
        confidenceScore: 94.2 + (1 - complexity) * 2,
      },
      fixedAssets: {
        totalAssets: accountingMetrics.totalFixedAssets,
        totalValue: accountingMetrics.totalAssetsValue,
        monthlyDepreciation: accountingMetrics.depreciation,
        activeAssets: Math.round(assets * 0.9),
        retiredAssets: Math.round(assets * 0.1),
      },
      payroll: {
        totalEmployees: payrollMetrics.totalEmployees,
        totalLiquidations: payrollMetrics.totalLiquidations,
        avgSalary: payrollMetrics.avgSalary,
        totalMonthlyCost: payrollMetrics.totalPayrollCost,
        complianceRate: 100,
      },
      accounting: {
        chartEntries: accountingMetrics.chartOfAccountsEntries,
        journalEntries: accountingMetrics.journalEntries,
        balanceAccuracy: 99.1 - (1 - complexity) * 0.8,
        lastBalanceGenerated: '2024-11-15T10:30:00Z',
      },
    }

    // Datos en tiempo real simulados - ESCALADOS POR EMPRESA
    const liveMetrics = {
      currentActiveUsers: Math.ceil(2 * scale),
      systemLoad: 23.5 * complexity,
      memoryUsage: 45.2 * scale,
      responseTime: Math.round(185 / complexity), // Mejor respuesta en empresa pequeña
      transactionsPerMinute: Math.round(12 * scale),
      errorRate: 0.02 * complexity,
    }

    return NextResponse.json({
      success: true,
      data: {
        companyId,
        companyName: name,
        accounting: accountingMetrics,
        payroll: payrollMetrics,
        system: systemMetrics,
        modules: moduleMetrics,
        live: liveMetrics,
        timestamp: new Date().toISOString(),
        refreshInterval: 30000, // 30 segundos
      },
      message: `Métricas calculadas para ${name}`,
      source: 'demo_differentiated'
    });
}
