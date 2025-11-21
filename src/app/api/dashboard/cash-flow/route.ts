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

    console.log('🔍 [Cash Flow API] Fetching data for company:', companyId);

    // ✅ OBTENER DATOS REALES DE LA BASE DE DATOS
    const supabase = getDatabaseConnection();
    if (!supabase) {
      console.warn('⚠️ [Cash Flow API] Database not available, using demo data');
      return getDemoCashFlowData(companyId);
    }

    // Intentar obtener datos reales de flujo de caja de la base de datos
    const cashFlowData = await getCashFlowDataFromDatabase(supabase, companyId);
    if (cashFlowData) {
      console.log('✅ [Cash Flow API] Using real database data');
      return NextResponse.json({
        success: true,
        data: cashFlowData,
        timestamp: new Date().toISOString(),
        message: 'Datos de flujo de caja obtenidos de base de datos',
        source: 'database'
      });
    }

    // Fallback a datos demo diferenciados por empresa
    console.log('📊 [Cash Flow API] Using differentiated demo data');
    return getDemoCashFlowData(companyId);

  } catch (error) {
    console.error('❌ [Cash Flow API] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Error al calcular datos de flujo de caja',
      details: error instanceof Error ? error.message : 'Error desconocido',
    }, { status: 500 });
  }
}

// 🗃️ FUNCIÓN PARA OBTENER DATOS REALES DE BASE DE DATOS
async function getCashFlowDataFromDatabase(supabase: any, companyId: string) {
  try {
    // TODO: Implementar consulta real a tablas de flujo de caja
    // Por ahora retorna null para usar datos demo
    // En el futuro consultar: journal_entries, accounts_receivable, accounts_payable

    const { data: cashData, error: cashError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('company_id', companyId)
      .limit(1);

    // Si no hay datos reales, usar datos demo
    if (cashError || !cashData || cashData.length === 0) {
      return null;
    }

    // Si hay datos reales, calcularlos (implementación futura)
    // return calculateRealCashFlowData(cashData, companyId);
    return null; // Por ahora usar datos demo

  } catch (error) {
    console.error('Error querying database for cash flow data:', error);
    return null;
  }
}

// 📊 FUNCIÓN PARA GENERAR DATOS DEMO DINÁMICOS POR EMPRESA
function getDemoCashFlowData(companyId: string) {
  // 🚀 GENERAR PERFIL DINÁMICO DE EMPRESA - INFINITAMENTE ESCALABLE
  const profile = generateCompanyProfile(companyId);
  const { currentBalance, name, scale, employeeCount } = profile;

  // Datos realistas integrados para PyME chilena
  const today = new Date()

    // Ingresos proyectados (cuentas por cobrar + ventas estimadas) - ESCALADOS POR EMPRESA
    const projectedInflows = [
      {
        date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        amount: Math.round(8500000 * scale),
        description: `Cobranza Cliente ABC S.A. - ${name}`,
        source: 'receivables' as const,
        confidence: 90,
      },
      {
        date: new Date(today.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        amount: Math.round(4200000 * scale),
        description: 'Facturación semanal proyectada',
        source: 'sales' as const,
        confidence: 75,
      },
      {
        date: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        amount: Math.round(12000000 * scale),
        description: `Cobranza Cliente XYZ Ltda. - ${name}`,
        source: 'receivables' as const,
        confidence: 85,
      },
      {
        date: new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        amount: Math.round(6800000 * scale),
        description: 'Ventas estimadas segunda quincena',
        source: 'sales' as const,
        confidence: 70,
      },
      {
        date: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        amount: Math.round(11500000 * scale),
        description: 'Cobranza fin de mes',
        source: 'receivables' as const,
        confidence: 80,
      },
    ]

    // Egresos proyectados (nómina, IVA, proveedores) - ESCALADOS POR EMPRESA
    const projectedOutflows = [
      {
        date: new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        amount: Math.round(employeeCount * 850000), // 850k por empleado en promedio
        description: `Pago nómina mensual (${employeeCount} empleados) - ${name}`,
        source: 'payroll' as const,
        confidence: 100,
      },
      {
        date: new Date(today.getTime() + 18 * 24 * 60 * 60 * 1000).toISOString(),
        amount: profile.ivaAmount, // IVA dinámico basado en perfil de empresa
        description: 'Pago IVA F29 (fecha límite)',
        source: 'iva' as const,
        confidence: 100,
      },
      {
        date: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        amount: Math.round(3400000 * scale),
        description: 'Pago proveedores (Lote 1)',
        source: 'suppliers' as const,
        confidence: 95,
      },
      {
        date: new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        amount: Math.round(6800000 * scale),
        description: 'Pago proveedores (Lote 2)',
        source: 'suppliers' as const,
        confidence: 90,
      },
      {
        date: new Date(today.getTime() + 22 * 24 * 60 * 60 * 1000).toISOString(),
        amount: Math.round(1850000 * scale),
        description: 'Gastos operacionales diversos',
        source: 'other' as const,
        confidence: 85,
      },
    ]

    // Calcular proyecciones por período
    const calculateProjection = (days: number) => {
      const cutoffDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000)

      const inflows = projectedInflows
        .filter(item => new Date(item.date) <= cutoffDate)
        .reduce((sum, item) => sum + item.amount, 0)

      const outflows = projectedOutflows
        .filter(item => new Date(item.date) <= cutoffDate)
        .reduce((sum, item) => sum + item.amount, 0)

      return currentBalance + inflows - outflows
    }

    const projection30 = calculateProjection(30)
    const projection60 = calculateProjection(60)
    const projection90 = calculateProjection(90)

    // Determinar nivel de riesgo
    const getRiskLevel = (projection: number) => {
      if (projection < 5000000) return 'high'
      if (projection < 15000000) return 'medium'
      return 'low'
    }

    // Calcular tendencia
    const calculateTrend = () => {
      const trend = (projection30 - currentBalance) / currentBalance * 100
      return {
        percentage: Math.round(trend * 100) / 100,
        direction: trend >= 0 ? 'positive' : 'negative',
        description: trend >= 5 ? 'Crecimiento fuerte' :
                    trend >= 0 ? 'Estable' :
                    trend >= -10 ? 'Disminución moderada' : 'Alerta crítica',
      }
    }

    const cashFlowData = {
      currentBalance,
      projection30,
      projection60,
      projection90,
      projectedInflows,
      projectedOutflows,
      riskLevel: getRiskLevel(projection30),
      trend: calculateTrend(),
      lastUpdated: new Date().toISOString(),

      // Información de empresa
      companyName: name,
      companyId,

      // Métricas adicionales del dashboard ejecutivo
      metrics: {
        totalInflowsNext30: projectedInflows
          .filter(item => new Date(item.date) <= new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000))
          .reduce((sum, item) => sum + item.amount, 0),
        totalOutflowsNext30: projectedOutflows
          .filter(item => new Date(item.date) <= new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000))
          .reduce((sum, item) => sum + item.amount, 0),
        netCashFlow30: projection30 - currentBalance,
        averageConfidence: [...projectedInflows, ...projectedOutflows]
          .filter(item => 'confidence' in item)
          .reduce((sum, item) => sum + (item.confidence || 80), 0) /
          [...projectedInflows, ...projectedOutflows].filter(item => 'confidence' in item).length,
        criticalDate: projectedOutflows
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]?.date,
      },

      // Alertas automáticas (adaptadas por empresa)
      alerts: [
        ...(projection30 < (currentBalance * 0.4) ? [{
          type: 'warning' as const,
          message: `Proyección de flujo de caja bajo para ${name} en los próximos 30 días`,
          priority: (projection30 < (currentBalance * 0.2) ? 'high' : 'medium') as const,
        }] : []),
        ...(projectedOutflows.some(item => item.source === 'iva') ? [{
          type: 'info' as const,
          message: `Próximo pago IVA: ${projectedOutflows.find(item => item.source === 'iva')?.description}`,
          priority: 'medium' as const,
        }] : []),
      ],
    }

    return NextResponse.json({
      success: true,
      data: cashFlowData,
      timestamp: new Date().toISOString(),
      message: `Proyección de flujo de caja calculada para ${name}`,
      source: 'demo_differentiated'
    });
}
