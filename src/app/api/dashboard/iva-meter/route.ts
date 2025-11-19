import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Simular datos realistas de IVA para PyME chilena
    const debitoFiscal = 8540000  // IVA ventas mes actual
    const creditoFiscal = 6230000  // IVA compras mes actual
    const ivaAPagar = debitoFiscal - creditoFiscal

    const ivaData = {
      debitoFiscal,
      creditoFiscal,
      ivaAPagar,
      porcentaje: Math.min(Math.abs(ivaAPagar) / 10000000 * 100, 100),
      estado: ivaAPagar > 0 ? 'pagar' : ivaAPagar < -50000 ? 'favor' : 'equilibrio',
      fechaCalculo: new Date().toISOString(),

      // Datos adicionales para el dashboard
      periodoCalculo: new Date().toISOString().slice(0, 7), // YYYY-MM
      montoTotal: Math.abs(ivaAPagar),
      fechaVencimiento: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 20).toISOString(),

      // Histórico para comparación (últimos 3 meses)
      historicoMeses: [
        { mes: '2024-10', monto: 1850000, estado: 'pagar' },
        { mes: '2024-11', monto: 2150000, estado: 'pagar' },
        { mes: '2024-12', monto: ivaAPagar, estado: ivaAPagar > 0 ? 'pagar' : 'favor' },
      ],

      // Proyección próximo mes basado en tendencia
      proyeccionProximoMes: {
        estimado: ivaAPagar * 1.15, // Incremento estacional 15%
        confianza: 75,
        factores: [
          'Incremento estacional diciembre-enero',
          'Tendencia de ventas últimos 3 meses',
          'Promedio compras vs ventas',
        ],
      },
    }

    return NextResponse.json({
      success: true,
      data: ivaData,
      timestamp: new Date().toISOString(),
      message: 'Datos de IVA calculados exitosamente',
    })

  } catch (error) {
    console.error('Error fetching IVA data:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al calcular datos de IVA',
      details: error instanceof Error ? error.message : 'Error desconocido',
    }, { status: 500 })
  }
}
