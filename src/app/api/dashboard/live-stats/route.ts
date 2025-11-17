import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Generar estadísticas en tiempo real simuladas pero realistas
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const isBusinessHours = currentHour >= 9 && currentHour <= 18

    // Simular actividad basada en la hora del día
    const baseActivity = isBusinessHours ?
      Math.floor(Math.random() * 8) + 3 : // 3-10 durante horas laborales
      Math.floor(Math.random() * 3) + 1   // 1-3 fuera de horas laborales

    // Estadísticas en tiempo real
    const liveStats = {
      currentActiveUsers: baseActivity,
      systemLoad: Number((Math.random() * 15 + 15).toFixed(1)), // 15-30%
      memoryUsage: Number((Math.random() * 20 + 35).toFixed(1)), // 35-55%
      responseTime: Math.floor(Math.random() * 50) + 120, // 120-170ms
      transactionsLastHour: Math.floor(Math.random() * 20) + 5, // 5-25 transacciones
      errorRate: Number((Math.random() * 0.1).toFixed(3)), // 0-0.1%

      // Estadísticas de uso por módulo
      moduleUsage: {
        accounting: {
          activeUsers: Math.floor(baseActivity * 0.6),
          processingQueue: Math.floor(Math.random() * 3),
          lastActivity: `hace ${Math.floor(Math.random() * 30) + 1} min`
        },
        payroll: {
          activeUsers: Math.floor(baseActivity * 0.4),
          processingQueue: Math.floor(Math.random() * 2),
          lastActivity: `hace ${Math.floor(Math.random() * 45) + 5} min`
        },
        fixedAssets: {
          activeUsers: Math.floor(baseActivity * 0.2),
          processingQueue: 0,
          lastActivity: `hace ${Math.floor(Math.random() * 120) + 30} min`
        }
      },

      // Alertas del sistema
      systemAlerts: generateSystemAlerts(currentHour, currentMinute),

      // Actividad reciente
      recentActivity: generateRecentActivity(),

      // Métricas de rendimiento
      performance: {
        cpuUsage: Number((Math.random() * 25 + 10).toFixed(1)),
        diskUsage: Number((Math.random() * 10 + 45).toFixed(1)),
        networkLatency: Math.floor(Math.random() * 20) + 5,
        databaseConnections: Math.floor(Math.random() * 5) + 2
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...liveStats,
        timestamp: now.toISOString(),
        serverTime: now.toLocaleTimeString('es-CL'),
        uptime: generateUptime(),
        nextUpdate: new Date(now.getTime() + 30000).toISOString() // Próxima actualización en 30s
      }
    })

  } catch (error) {
    console.error('Error fetching live stats:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al obtener estadísticas en tiempo real',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

function generateSystemAlerts(hour: number, minute: number) {
  const alerts = []

  // Alerta de backup nocturno
  if (hour === 2 && minute < 30) {
    alerts.push({
      type: 'info',
      message: 'Backup automático en progreso',
      timestamp: new Date().toISOString()
    })
  }

  // Alerta de alta actividad
  if (hour >= 9 && hour <= 11 && Math.random() > 0.7) {
    alerts.push({
      type: 'success',
      message: 'Pico de actividad detectado - sistema operando normalmente',
      timestamp: new Date().toISOString()
    })
  }

  // Alerta de mantenimiento programado
  if (hour === 23 && minute > 45) {
    alerts.push({
      type: 'warning',
      message: 'Mantenimiento programado en 15 minutos',
      timestamp: new Date().toISOString()
    })
  }

  return alerts
}

function generateRecentActivity() {
  const activities = [
    'F29 procesado exitosamente',
    'Liquidación de sueldo generada',
    'Activo fijo agregado al inventario',
    'Balance de 8 columnas exportado',
    'Nuevo empleado registrado',
    'Indicadores económicos actualizados',
    'Asiento contable creado',
    'Reporte de depreciación generado'
  ]

  const recentActivities = []
  const numActivities = Math.floor(Math.random() * 3) + 1 // 1-3 actividades

  for (let i = 0; i < numActivities; i++) {
    const activity = activities[Math.floor(Math.random() * activities.length)]
    const minutesAgo = Math.floor(Math.random() * 60) + 1

    recentActivities.push({
      action: activity,
      timestamp: new Date(Date.now() - minutesAgo * 60 * 1000).toISOString(),
      timeAgo: `hace ${minutesAgo} min`,
      user: 'Empresa Demo'
    })
  }

  return recentActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

function generateUptime() {
  // Simular uptime alto pero realista
  const days = Math.floor(Math.random() * 30) + 15 // 15-45 días
  const hours = Math.floor(Math.random() * 24)
  const minutes = Math.floor(Math.random() * 60)

  return {
    days,
    hours,
    minutes,
    totalHours: days * 24 + hours + (minutes / 60),
    percentage: Number((99.5 + Math.random() * 0.48).toFixed(2)) // 99.5-99.98%
  }
}