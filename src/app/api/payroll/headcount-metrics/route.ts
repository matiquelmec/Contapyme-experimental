import { NextRequest, NextResponse } from 'next/server'

const COMPANY_ID = '8033ee69-b420-4d91-ba0e-482f46cd6fce'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('company_id') || COMPANY_ID

    // TODO: En producción, aquí haríamos consultas reales a la base de datos
    // Por ahora, generamos datos realistas basados en el estado actual del sistema

    // Simular datos realistas para una PyME chilena
    const currentDate = new Date()
    const currentMonth = currentDate.toLocaleString('es-CL', { month: 'short' })

    const headcountData = {
      totalEmployees: 28,
      activeEmployees: 27,
      newHires: 3,
      departures: 1,
      turnoverRate: 7.8, // Porcentaje anual
      averageSalary: 875000, // CLP
      costPerEmployee: 98500, // CLP - incluye beneficios y cargas sociales
      productivityScore: 89, // Score de 0-100

      // Breakdown por departamento
      departmentBreakdown: [
        {
          name: 'Operaciones',
          count: 14,
          percentage: 50,
          growth: 2 // Crecimiento respecto al mes anterior
        },
        {
          name: 'Ventas & Marketing',
          count: 7,
          percentage: 25,
          growth: 1
        },
        {
          name: 'Administración',
          count: 4,
          percentage: 14,
          growth: 0
        },
        {
          name: 'TI & Soporte',
          count: 3,
          percentage: 11,
          growth: 0
        }
      ],

      // Tendencia de los últimos meses
      monthlyTrend: [
        { month: 'Ago', headcount: 24, cost: 22800000 },
        { month: 'Sep', headcount: 26, cost: 24700000 },
        { month: 'Oct', headcount: 27, cost: 25650000 },
        { month: 'Nov', headcount: 28, cost: 26600000 }
      ],

      // Métricas adicionales
      metrics: {
        averageAge: 32.5,
        genderRatio: { male: 65, female: 35 },
        averageTenure: 2.3, // años
        satisfactionScore: 8.2, // de 10
        trainingHours: 24, // horas por empleado este año
        absenceRate: 3.2 // porcentaje mensual
      },

      lastUpdate: currentDate.toISOString()
    }

    return NextResponse.json({
      success: true,
      data: headcountData,
      message: 'Métricas de capital humano obtenidas exitosamente',
      timestamp: currentDate.toISOString()
    })

  } catch (error) {
    console.error('Error fetching headcount metrics:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudieron obtener las métricas de capital humano'
      },
      { status: 500 }
    )
  }
}

// POST method para futuras actualizaciones manuales
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { companyId, metrics } = body

    // TODO: Aquí se actualizarían las métricas en la base de datos
    // Por ahora, simplemente retornamos éxito

    return NextResponse.json({
      success: true,
      message: 'Métricas de capital humano actualizadas exitosamente',
      data: metrics,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error updating headcount metrics:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudieron actualizar las métricas'
      },
      { status: 500 }
    )
  }
}