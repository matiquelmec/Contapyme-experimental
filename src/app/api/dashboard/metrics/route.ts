import { NextRequest, NextResponse } from 'next/server'

const DEMO_COMPANY_ID = "123e4567-e89b-12d3-a456-426614174000"

export async function GET(request: NextRequest) {
  try {
    // Simulamos datos reales de la empresa demo
    // En el futuro esto se conectará a la base de datos Supabase real

    // Métricas de contabilidad realistas de empresa demo
    const accountingMetrics = {
      totalF29: 24, // F29 procesados últimos 2 años (12 meses x 2 años)
      avgProcessingTime: 1.2, // Segundos promedio de procesamiento optimizado
      lastProcessed: '2 días', // Último F29 procesado
      totalFixedAssets: 15, // Activos fijos registrados (equipos, muebles, vehículos)
      totalAssetsValue: 12750000, // Valor total de activos en CLP
      depreciation: 185000, // Depreciación mensual calculada
      chartOfAccountsEntries: 127, // Entradas en plan de cuentas IFRS
      journalEntries: 456 // Asientos de diario acumulados
    }

    // Métricas de remuneraciones realistas
    const payrollMetrics = {
      totalEmployees: 12, // Empleados activos en empresa demo (creció)
      totalLiquidations: 144, // Liquidaciones generadas (12 empleados x 12 meses)
      avgSalary: 850000, // Sueldo promedio en CLP (ajustado inflación)
      totalPayrollCost: 10200000, // Costo total mensual de planilla
      lastLiquidationDate: '2024-11-10', // Última liquidación procesada
      activeContracts: 12, // Contratos activos
      pendingLiquidations: 0 // Liquidaciones pendientes (actualizadas)
    }

    // Métricas generales del sistema
    const systemMetrics = {
      totalCompanies: 1, // Solo empresa demo por ahora
      systemUptime: 99.8, // Disponibilidad del sistema
      totalUsers: 3, // Usuarios del sistema demo
      lastUpdated: new Date().toISOString(),
      dataQuality: 95.5, // Calidad de datos procesados
      processingSpeed: 2.1 // Velocidad promedio de procesamiento
    }

    // Métricas específicas por módulo
    const moduleMetrics = {
      f29Analysis: {
        totalProcessed: accountingMetrics.totalF29,
        successRate: 97.8,
        avgProcessingTime: accountingMetrics.avgProcessingTime,
        lastProcessed: accountingMetrics.lastProcessed,
        confidenceScore: 94.2
      },
      fixedAssets: {
        totalAssets: accountingMetrics.totalFixedAssets,
        totalValue: accountingMetrics.totalAssetsValue,
        monthlyDepreciation: accountingMetrics.depreciation,
        activeAssets: 14,
        retiredAssets: 1
      },
      payroll: {
        totalEmployees: payrollMetrics.totalEmployees,
        totalLiquidations: payrollMetrics.totalLiquidations,
        avgSalary: payrollMetrics.avgSalary,
        totalMonthlyCost: payrollMetrics.totalPayrollCost,
        complianceRate: 100
      },
      accounting: {
        chartEntries: accountingMetrics.chartOfAccountsEntries,
        journalEntries: accountingMetrics.journalEntries,
        balanceAccuracy: 99.1,
        lastBalanceGenerated: '2024-11-15T10:30:00Z'
      }
    }

    // Datos en tiempo real simulados
    const liveMetrics = {
      currentActiveUsers: 2,
      systemLoad: 23.5,
      memoryUsage: 45.2,
      responseTime: 185,
      transactionsPerMinute: 12,
      errorRate: 0.02
    }

    return NextResponse.json({
      success: true,
      data: {
        companyId: DEMO_COMPANY_ID,
        companyName: "Empresa Demo ContaPyme",
        accounting: accountingMetrics,
        payroll: payrollMetrics,
        system: systemMetrics,
        modules: moduleMetrics,
        live: liveMetrics,
        timestamp: new Date().toISOString(),
        refreshInterval: 30000 // 30 segundos
      }
    })

  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al obtener métricas del dashboard',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

// Función auxiliar para obtener datos reales de Supabase (para implementar en el futuro)
async function getRealMetricsFromDatabase(companyId: string) {
  // TODO: Implementar conexión real a Supabase
  // const supabase = createClient()
  //
  // Queries para obtener datos reales:
  // - SELECT COUNT(*) FROM fixed_assets WHERE company_id = companyId
  // - SELECT COUNT(*) FROM employees WHERE company_id = companyId AND active = true
  // - SELECT COUNT(*) FROM f29_analysis WHERE company_id = companyId
  // - SELECT AVG(base_salary) FROM employees WHERE company_id = companyId
  // - SELECT SUM(purchase_value) FROM fixed_assets WHERE company_id = companyId

  return null
}