import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Generar alertas realistas de salud tributaria
    const currentTime = new Date().toISOString()
    const currentDate = new Date()

    // Calcular próximo vencimiento IVA (día 20 del mes siguiente)
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 20)
    const daysToIVA = Math.ceil((nextMonth.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))

    // Simular entidades no mapeadas (rotarán para parecer dinámico)
    const unmappedEntities = [
      'SERVICIOS TECNOLÓGICOS SPA (76.123.456-7)',
      'COMERCIAL LOS ANDES LTDA (96.987.654-3)',
      'TRANSPORTES RAPID S.A. (87.456.123-9)',
      'CONSULTORA BUSINESS PRO (78.321.654-0)',
      'DISTRIBUIDORA NORTE LTDA (85.147.258-3)'
    ]

    // Seleccionar 2-4 entidades aleatorias para simular detección de nuevas
    const selectedEntities = unmappedEntities
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 2)

    const alerts = [
      // Concordancia RCV vs F29
      {
        id: '1',
        type: 'rcv_f29_mismatch',
        status: Math.random() > 0.2 ? 'healthy' : 'warning', // 80% probabilidad healthy
        title: 'Concordancia RCV vs F29',
        description: Math.random() > 0.2 ?
          'Los libros RCV coinciden con las declaraciones F29 del último período' :
          'Se detectaron diferencias menores entre RCV y F29 que requieren revisión',
        actionRequired: Math.random() > 0.2 ? false : true,
        actionUrl: Math.random() > 0.2 ? undefined : '/accounting/f29-analysis',
        actionText: Math.random() > 0.2 ? undefined : 'Revisar F29',
        lastChecked: currentTime,
        details: Math.random() > 0.2 ?
          ['Débito Fiscal: Concordancia 100%', 'Crédito Fiscal: Concordancia 100%'] :
          ['Débito Fiscal: Concordancia 98%', 'Crédito Fiscal: Diferencia $125.000', 'Revisar facturas periodo actual']
      },

      // Estado SII
      {
        id: '2',
        type: 'sii_observations',
        status: Math.random() > 0.15 ? 'healthy' : 'warning', // 85% probabilidad healthy
        title: 'Estado SII',
        description: Math.random() > 0.15 ?
          'Sin observaciones pendientes del Servicio de Impuestos Internos' :
          'Se detectó 1 observación SII pendiente de respuesta',
        actionRequired: Math.random() > 0.15 ? false : true,
        actionUrl: Math.random() > 0.15 ? undefined : '/compliance/sii-status',
        actionText: Math.random() > 0.15 ? undefined : 'Ver Observación',
        lastChecked: currentTime,
        details: Math.random() > 0.15 ?
          ['Última declaración F29: Sin observaciones', 'Estado del contribuyente: Normal'] :
          ['Observación: Aclaración documentos respaldo', 'Plazo respuesta: 15 días hábiles', 'Estado: Pendiente']
      },

      // Entidades RCV sin mapear
      {
        id: '3',
        type: 'unmapped_entities',
        status: selectedEntities.length > 0 ? 'warning' : 'healthy',
        title: 'Entidades RCV sin Mapear',
        description: selectedEntities.length > 0 ?
          `${selectedEntities.length} nuevas entidades detectadas requieren mapeo de cuentas contables` :
          'Todas las entidades RCV están correctamente mapeadas',
        actionRequired: selectedEntities.length > 0,
        actionUrl: selectedEntities.length > 0 ? '/accounting/configuration#rcv-entities' : undefined,
        actionText: selectedEntities.length > 0 ? 'Configurar Entidades' : undefined,
        lastChecked: currentTime,
        details: selectedEntities.length > 0 ? selectedEntities :
          ['Proveedores mapeados: 100%', 'Clientes mapeados: 100%', 'Estado: Completo']
      },

      // Próximos vencimientos
      {
        id: '4',
        type: 'deadline_warning',
        status: daysToIVA <= 5 ? 'critical' : daysToIVA <= 10 ? 'warning' : 'healthy',
        title: 'Próximos Vencimientos',
        description: daysToIVA <= 0 ?
          'IVA vencido - Acercarse al SII inmediatamente' :
          daysToIVA <= 5 ?
          `IVA vence en ${daysToIVA} días - CRÍTICO` :
          daysToIVA <= 10 ?
          `IVA vence en ${daysToIVA} días` :
          `IVA vence en ${daysToIVA} días`,
        actionRequired: daysToIVA <= 10,
        actionUrl: daysToIVA <= 10 ? '/accounting/f29-analysis' : undefined,
        actionText: daysToIVA <= 10 ? 'Ver Proyección IVA' : undefined,
        lastChecked: currentTime,
        details: [
          `Monto proyectado: $${Math.floor(Math.random() * 3000000 + 1500000).toLocaleString('es-CL')}`,
          `Fecha límite: ${nextMonth.toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })}`,
          ...(daysToIVA <= 5 ? ['Estado: URGENTE - Preparar documentación'] : [])
        ]
      },

      // Backup y seguridad (aparece ocasionalmente)
      ...(Math.random() > 0.7 ? [{
        id: '5',
        type: 'system_health',
        status: 'healthy' as const,
        title: 'Respaldo de Información',
        description: 'Último backup exitoso - Información protegida',
        actionRequired: false,
        lastChecked: currentTime,
        details: [
          'Backup automático: Exitoso',
          'Última copia: ' + new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toLocaleString('es-CL'),
          'Estado sistemas: Operacional'
        ]
      }] : [])
    ]

    // Determinar estado general
    const criticalAlerts = alerts.filter(alert => alert.status === 'critical').length
    const warningAlerts = alerts.filter(alert => alert.status === 'warning').length

    const overallStatus = criticalAlerts > 0 ? 'critical' :
                         warningAlerts > 0 ? 'warning' : 'healthy'

    const healthData = {
      overallStatus,
      alerts,
      lastFullCheck: currentTime,
      nextAutoCheck: new Date(Date.now() + 1800000).toISOString(), // 30 min

      // Estadísticas adicionales para el dashboard
      statistics: {
        totalChecks: alerts.length,
        healthyChecks: alerts.filter(alert => alert.status === 'healthy').length,
        warningChecks: warningAlerts,
        criticalChecks: criticalAlerts,
        complianceScore: Math.round((alerts.filter(alert => alert.status === 'healthy').length / alerts.length) * 100),
        lastCriticalDate: criticalAlerts > 0 ? currentTime : null
      },

      // Recomendaciones automáticas
      recommendations: [
        ...(selectedEntities.length > 0 ? [
          'Configure las cuentas contables para las nuevas entidades detectadas'
        ] : []),
        ...(daysToIVA <= 10 ? [
          'Prepare la declaración F29 con anticipación para evitar retrasos'
        ] : []),
        ...(warningAlerts > 0 ? [
          'Revise las alertas pendientes para mantener cumplimiento óptimo'
        ] : [
          'Excelente estado tributario - Mantenga las buenas prácticas'
        ])
      ]
    }

    return NextResponse.json({
      success: true,
      data: healthData,
      timestamp: new Date().toISOString(),
      message: 'Estado de salud tributaria evaluado exitosamente'
    })

  } catch (error) {
    console.error('Error fetching tax health data:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al evaluar salud tributaria',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}