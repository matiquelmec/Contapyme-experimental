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

    console.log('🔍 [Live Stats API] Fetching data for company:', companyId);

    // ✅ OBTENER DATOS REALES DE LA BASE DE DATOS
    const supabase = getDatabaseConnection();
    if (!supabase) {
      console.warn('⚠️ [Live Stats API] Database not available, using demo data');
      return getDemoLiveStatsData(companyId);
    }

    // Intentar obtener datos reales de estadísticas en vivo
    const liveStatsData = await getLiveStatsDataFromDatabase(supabase, companyId);
    if (liveStatsData) {
      console.log('✅ [Live Stats API] Using real database data');
      return NextResponse.json({
        success: true,
        data: liveStatsData,
        timestamp: new Date().toISOString(),
        message: 'Estadísticas en vivo obtenidas de base de datos',
        source: 'database'
      });
    }

    // Fallback a datos demo diferenciados por empresa
    console.log('📊 [Live Stats API] Using differentiated demo data');
    return getDemoLiveStatsData(companyId);

  } catch (error) {
    console.error('❌ [Live Stats API] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Error al obtener estadísticas en tiempo real',
      details: error instanceof Error ? error.message : 'Error desconocido',
    }, { status: 500 });
  }
}

// 🗃️ FUNCIÓN PARA OBTENER DATOS REALES DE BASE DE DATOS
async function getLiveStatsDataFromDatabase(supabase: any, companyId: string) {
  try {
    // TODO: Implementar consulta real a estadísticas en vivo
    // Por ahora retorna null para usar datos demo
    // En el futuro consultar: user_sessions, system_logs, processing_queue

    const { data: liveData, error: liveError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('company_id', companyId)
      .limit(1);

    // Si no hay datos reales, usar datos demo
    if (liveError || !liveData || liveData.length === 0) {
      return null;
    }

    // Si hay datos reales, calcularlos (implementación futura)
    // return calculateRealLiveStatsData(liveData, companyId);
    return null; // Por ahora usar datos demo

  } catch (error) {
    console.error('Error querying database for live stats data:', error);
    return null;
  }
}

// 📊 FUNCIÓN PARA GENERAR DATOS DEMO DINÁMICOS POR EMPRESA
function getDemoLiveStatsData(companyId: string) {
  // 🚀 GENERAR PERFIL DINÁMICO DE EMPRESA - INFINITAMENTE ESCALABLE
  const profile = generateCompanyProfile(companyId);
  const { name, scale, activityMultiplier, complexity } = profile;

    // Generar estadísticas en tiempo real simuladas pero realistas - ESCALADAS POR EMPRESA
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const isBusinessHours = currentHour >= 9 && currentHour <= 18

    // Simular actividad basada en la hora del día - ESCALADA POR EMPRESA
    const baseActivity = isBusinessHours ?
      Math.floor((Math.random() * 8 + 3) * activityMultiplier) : // Durante horas laborales
      Math.floor((Math.random() * 3 + 1) * activityMultiplier)   // Fuera de horas laborales

    // Estadísticas en tiempo real - ESCALADAS POR EMPRESA
    const liveStats = {
      currentActiveUsers: baseActivity,
      systemLoad: Number(((Math.random() * 15 + 15) * complexity).toFixed(1)), // Escalado por complejidad
      memoryUsage: Number(((Math.random() * 20 + 35) * scale).toFixed(1)), // Escalado por tamaño
      responseTime: Math.floor((Math.random() * 50 + 120) / complexity), // Mejor respuesta empresa pequeña
      transactionsLastHour: Math.floor((Math.random() * 20 + 5) * scale), // Escalado por actividad
      errorRate: Number((Math.random() * 0.1 * complexity).toFixed(3)), // Menos errores empresa pequeña

      // Estadísticas de uso por módulo - ESCALADAS POR EMPRESA
      moduleUsage: {
        accounting: {
          activeUsers: Math.floor(baseActivity * 0.6),
          processingQueue: Math.floor(Math.random() * 3 * complexity),
          lastActivity: `hace ${Math.floor(Math.random() * 30) + 1} min`,
        },
        payroll: {
          activeUsers: Math.floor(baseActivity * 0.4),
          processingQueue: Math.floor(Math.random() * 2 * complexity),
          lastActivity: `hace ${Math.floor(Math.random() * 45) + 5} min`,
        },
        fixedAssets: {
          activeUsers: Math.floor(baseActivity * 0.2),
          processingQueue: 0,
          lastActivity: `hace ${Math.floor(Math.random() * 120) + 30} min`,
        },
      },

      // Alertas del sistema
      systemAlerts: generateSystemAlerts(currentHour, currentMinute, name),

      // Actividad reciente - ESPECÍFICA POR EMPRESA
      recentActivity: generateRecentActivity(name),

      // Métricas de rendimiento - ESCALADAS POR EMPRESA
      performance: {
        cpuUsage: Number(((Math.random() * 25 + 10) * complexity).toFixed(1)),
        diskUsage: Number(((Math.random() * 10 + 45) * scale).toFixed(1)),
        networkLatency: Math.floor((Math.random() * 20 + 5) / complexity),
        databaseConnections: Math.floor((Math.random() * 5 + 2) * scale),
      },

      // Información de empresa
      companyName: name,
      companyId,
    }

    return NextResponse.json({
      success: true,
      data: {
        ...liveStats,
        timestamp: now.toISOString(),
        serverTime: now.toLocaleTimeString('es-CL'),
        uptime: generateUptime(),
        nextUpdate: new Date(now.getTime() + 30000).toISOString(), // Próxima actualización en 30s
      },
      message: `Estadísticas en vivo para ${name}`,
      source: 'demo_differentiated'
    });
}

function generateSystemAlerts(hour: number, minute: number, companyName: string) {
  const alerts = []

  // Alerta de backup nocturno
  if (hour === 2 && minute < 30) {
    alerts.push({
      type: 'info',
      message: `Backup automático en progreso para ${companyName}`,
      timestamp: new Date().toISOString(),
    })
  }

  // Alerta de alta actividad
  if (hour >= 9 && hour <= 11 && Math.random() > 0.7) {
    alerts.push({
      type: 'success',
      message: `Pico de actividad detectado en ${companyName} - sistema operando normalmente`,
      timestamp: new Date().toISOString(),
    })
  }

  // Alerta de mantenimiento programado
  if (hour === 23 && minute > 45) {
    alerts.push({
      type: 'warning',
      message: 'Mantenimiento programado en 15 minutos',
      timestamp: new Date().toISOString(),
    })
  }

  return alerts
}

function generateRecentActivity(companyName: string) {
  const activities = [
    `F29 procesado exitosamente para ${companyName}`,
    `Liquidación de sueldo generada en ${companyName}`,
    `Activo fijo agregado al inventario de ${companyName}`,
    `Balance de 8 columnas exportado para ${companyName}`,
    `Nuevo empleado registrado en ${companyName}`,
    `Indicadores económicos actualizados para ${companyName}`,
    `Asiento contable creado en ${companyName}`,
    `Reporte de depreciación generado para ${companyName}`,
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
      user: companyName,
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
    percentage: Number((99.5 + Math.random() * 0.48).toFixed(2)), // 99.5-99.98%
  }
}
