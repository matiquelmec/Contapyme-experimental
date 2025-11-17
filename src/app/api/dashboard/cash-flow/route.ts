import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Datos realistas integrados para PyME chilena
    const today = new Date()
    const currentBalance = 25400000 // Saldo actual de caja

    // Ingresos proyectados (cuentas por cobrar + ventas estimadas)
    const projectedInflows = [
      {
        date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 8500000,
        description: 'Cobranza Cliente ABC S.A.',
        source: 'receivables' as const,
        confidence: 90
      },
      {
        date: new Date(today.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 4200000,
        description: 'Facturación semanal proyectada',
        source: 'sales' as const,
        confidence: 75
      },
      {
        date: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 12000000,
        description: 'Cobranza Cliente XYZ Ltda.',
        source: 'receivables' as const,
        confidence: 85
      },
      {
        date: new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 6800000,
        description: 'Ventas estimadas segunda quincena',
        source: 'sales' as const,
        confidence: 70
      },
      {
        date: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 11500000,
        description: 'Cobranza fin de mes',
        source: 'receivables' as const,
        confidence: 80
      }
    ]

    // Egresos proyectados (nómina, IVA, proveedores)
    const projectedOutflows = [
      {
        date: new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 10200000,
        description: 'Pago nómina mensual (12 empleados)',
        source: 'payroll' as const,
        confidence: 100
      },
      {
        date: new Date(today.getTime() + 18 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 2310000,
        description: 'Pago IVA F29 (fecha límite)',
        source: 'iva' as const,
        confidence: 100
      },
      {
        date: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 3400000,
        description: 'Pago proveedores (Lote 1)',
        source: 'suppliers' as const,
        confidence: 95
      },
      {
        date: new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 6800000,
        description: 'Pago proveedores (Lote 2)',
        source: 'suppliers' as const,
        confidence: 90
      },
      {
        date: new Date(today.getTime() + 22 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 1850000,
        description: 'Gastos operacionales diversos',
        source: 'other' as const,
        confidence: 85
      }
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
                    trend >= -10 ? 'Disminución moderada' : 'Alerta crítica'
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
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]?.date
      },

      // Alertas automáticas
      alerts: [
        ...(projection30 < 10000000 ? [{
          type: 'warning',
          message: 'Proyección de flujo de caja bajo para los próximos 30 días',
          priority: projection30 < 5000000 ? 'high' : 'medium'
        }] : []),
        ...(projectedOutflows.some(item => item.source === 'iva') ? [{
          type: 'info',
          message: `Próximo pago IVA: ${projectedOutflows.find(item => item.source === 'iva')?.description}`,
          priority: 'medium'
        }] : [])
      ]
    }

    return NextResponse.json({
      success: true,
      data: cashFlowData,
      timestamp: new Date().toISOString(),
      message: 'Proyección de flujo de caja calculada exitosamente'
    })

  } catch (error) {
    console.error('Error fetching cash flow data:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al calcular proyección de flujo de caja',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}