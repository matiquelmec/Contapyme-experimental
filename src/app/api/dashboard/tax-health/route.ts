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

    console.log('🔍 [Tax Health API] Fetching data for company:', companyId);

    // ✅ OBTENER DATOS REALES DE LA BASE DE DATOS
    const supabase = getDatabaseConnection();
    if (!supabase) {
      console.warn('⚠️ [Tax Health API] Database not available, using demo data');
      return getDemoTaxHealthData(companyId);
    }

    // Intentar obtener datos reales de salud tributaria
    const taxHealthData = await getTaxHealthDataFromDatabase(supabase, companyId);
    if (taxHealthData) {
      console.log('✅ [Tax Health API] Using real database data');
      return NextResponse.json({
        success: true,
        data: taxHealthData,
        timestamp: new Date().toISOString(),
        message: 'Salud tributaria obtenida de base de datos',
        source: 'database'
      });
    }

    // Fallback a datos demo diferenciados por empresa
    console.log('📊 [Tax Health API] Using differentiated demo data');
    return getDemoTaxHealthData(companyId);

  } catch (error) {
    console.error('❌ [Tax Health API] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Error al evaluar salud tributaria',
      details: error instanceof Error ? error.message : 'Error desconocido',
    }, { status: 500 });
  }
}

// 🗃️ FUNCIÓN PARA OBTENER DATOS REALES DE BASE DE DATOS
async function getTaxHealthDataFromDatabase(supabase: any, companyId: string) {
  try {
    // TODO: Implementar consulta real a salud tributaria
    // Por ahora retorna null para usar datos demo
    // En el futuro consultar: tax_declarations, compliance_status, etc.

    const { data: taxData, error: taxError } = await supabase
      .from('tax_declarations')
      .select('*')
      .eq('company_id', companyId)
      .limit(1);

    // Si no hay datos reales, usar datos demo
    if (taxError || !taxData || taxData.length === 0) {
      return null;
    }

    // Si hay datos reales, calcularlos (implementación futura)
    // return calculateRealTaxHealthData(taxData, companyId);
    return null; // Por ahora usar datos demo

  } catch (error) {
    console.error('Error querying database for tax health data:', error);
    return null;
  }
}

// 📊 FUNCIÓN PARA GENERAR DATOS DEMO DINÁMICOS POR EMPRESA
function getDemoTaxHealthData(companyId: string) {
  // 🚀 GENERAR PERFIL DINÁMICO DE EMPRESA - INFINITAMENTE ESCALABLE
  const profile = generateCompanyProfile(companyId);
  const { name, scale, complexity, riskLevel, ivaAmount } = profile;

    // Generar alertas realistas de salud tributaria - ESPECÍFICAS POR EMPRESA
    const currentTime = new Date().toISOString()
    const currentDate = new Date()

    // Calcular próximo vencimiento IVA (día 20 del mes siguiente)
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 20)
    const daysToIVA = Math.ceil((nextMonth.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))

    // Entidades no mapeadas específicas por empresa
    const unmappedEntitiesByCompany = {
      '8033ee69-b420-4d91-ba0e-482f46cd6fce': [
        'SERVICIOS TECNOLÓGICOS SPA (76.123.456-7)',
        'COMERCIAL LOS ANDES LTDA (96.987.654-3)',
        'TRANSPORTES RAPID S.A. (87.456.123-9)',
        'CONSULTORA BUSINESS PRO (78.321.654-0)',
        'DISTRIBUIDORA NORTE LTDA (85.147.258-3)',
      ],
      '9144ff7a-c530-5e82-cb1f-593f57de7fde': [
        'PROVEEDOR LOCAL SPA (79.654.321-8)',
        'COMERCIAL MI PYME (88.111.222-3)',
        'SERVICIOS BÁSICOS SA (77.999.888-1)',
      ]
    };

    const unmappedEntities = unmappedEntitiesByCompany[companyId as keyof typeof unmappedEntitiesByCompany] || []

    // Seleccionar entidades aleatorias según el riesgo de la empresa
    const selectedEntities = unmappedEntities
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3 * complexity) + Math.floor(riskLevel * 10))

    const alerts = [
      // Concordancia RCV vs F29 - ESPECÍFICA POR EMPRESA
      {
        id: '1',
        type: 'rcv_f29_mismatch',
        status: Math.random() > (0.2 + riskLevel) ? 'healthy' : 'warning', // Más riesgo en empresas complejas
        title: `Concordancia RCV vs F29 - ${name}`,
        description: Math.random() > (0.2 + riskLevel) ?
          `Los libros RCV de ${name} coinciden con las declaraciones F29 del último período` :
          `Se detectaron diferencias menores entre RCV y F29 en ${name} que requieren revisión`,
        actionRequired: !(Math.random() > (0.2 + riskLevel)),
        actionUrl: Math.random() > (0.2 + riskLevel) ? undefined : '/accounting/f29-analysis',
        actionText: Math.random() > (0.2 + riskLevel) ? undefined : 'Revisar F29',
        lastChecked: currentTime,
        details: Math.random() > (0.2 + riskLevel) ?
          ['Débito Fiscal: Concordancia 100%', 'Crédito Fiscal: Concordancia 100%'] :
          ['Débito Fiscal: Concordancia 98%', `Crédito Fiscal: Diferencia $${Math.floor(125000 * complexity).toLocaleString('es-CL')}`, 'Revisar facturas periodo actual'],
      },

      // Estado SII - ESPECÍFICO POR EMPRESA
      {
        id: '2',
        type: 'sii_observations',
        status: Math.random() > (0.15 + riskLevel) ? 'healthy' : 'warning', // Más riesgo en empresas complejas
        title: `Estado SII - ${name}`,
        description: Math.random() > (0.15 + riskLevel) ?
          `Sin observaciones pendientes del SII para ${name}` :
          `Se detectó 1 observación SII pendiente para ${name}`,
        actionRequired: !(Math.random() > (0.15 + riskLevel)),
        actionUrl: Math.random() > (0.15 + riskLevel) ? undefined : '/compliance/sii-status',
        actionText: Math.random() > (0.15 + riskLevel) ? undefined : 'Ver Observación',
        lastChecked: currentTime,
        details: Math.random() > (0.15 + riskLevel) ?
          ['Última declaración F29: Sin observaciones', `Estado de ${name}: Normal`] :
          ['Observación: Aclaración documentos respaldo', 'Plazo respuesta: 15 días hábiles', 'Estado: Pendiente'],
      },

      // Entidades RCV sin mapear - ESPECÍFICAS POR EMPRESA
      {
        id: '3',
        type: 'unmapped_entities',
        status: selectedEntities.length > 0 ? 'warning' : 'healthy',
        title: `Entidades RCV sin Mapear - ${name}`,
        description: selectedEntities.length > 0 ?
          `${selectedEntities.length} nuevas entidades en ${name} requieren mapeo de cuentas contables` :
          `Todas las entidades RCV de ${name} están correctamente mapeadas`,
        actionRequired: selectedEntities.length > 0,
        actionUrl: selectedEntities.length > 0 ? '/accounting/configuration#rcv-entities' : undefined,
        actionText: selectedEntities.length > 0 ? 'Configurar Entidades' : undefined,
        lastChecked: currentTime,
        details: selectedEntities.length > 0 ? selectedEntities :
          ['Proveedores mapeados: 100%', 'Clientes mapeados: 100%', 'Estado: Completo'],
      },

      // Próximos vencimientos - ESPECÍFICOS POR EMPRESA
      {
        id: '4',
        type: 'deadline_warning',
        status: daysToIVA <= 5 ? 'critical' : daysToIVA <= 10 ? 'warning' : 'healthy',
        title: `Próximos Vencimientos - ${name}`,
        description: daysToIVA <= 0 ?
          `IVA vencido para ${name} - Acercarse al SII inmediatamente` :
          daysToIVA <= 5 ?
          `IVA de ${name} vence en ${daysToIVA} días - CRÍTICO` :
          daysToIVA <= 10 ?
          `IVA de ${name} vence en ${daysToIVA} días` :
          `IVA de ${name} vence en ${daysToIVA} días`,
        actionRequired: daysToIVA <= 10,
        actionUrl: daysToIVA <= 10 ? '/accounting/f29-analysis' : undefined,
        actionText: daysToIVA <= 10 ? 'Ver Proyección IVA' : undefined,
        lastChecked: currentTime,
        details: [
          `Monto proyectado: $${ivaAmount.toLocaleString('es-CL')}`,
          `Fecha límite: ${nextMonth.toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })}`,
          `Empresa: ${name}`,
          ...(daysToIVA <= 5 ? ['Estado: URGENTE - Preparar documentación'] : []),
        ],
      },

      // Backup y seguridad (aparece ocasionalmente) - ESPECÍFICO POR EMPRESA
      ...(Math.random() > 0.7 ? [{
        id: '5',
        type: 'system_health',
        status: 'healthy' as const,
        title: `Respaldo de Información - ${name}`,
        description: `Último backup exitoso para ${name} - Información protegida`,
        actionRequired: false,
        lastChecked: currentTime,
        details: [
          'Backup automático: Exitoso',
          `Última copia: ${new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toLocaleString('es-CL')}`,
          `Empresa: ${name}`,
          'Estado sistemas: Operacional',
        ],
      }] : []),
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

      // Información de empresa
      companyName: name,
      companyId,

      // Estadísticas adicionales para el dashboard - ESPECÍFICAS POR EMPRESA
      statistics: {
        totalChecks: alerts.length,
        healthyChecks: alerts.filter(alert => alert.status === 'healthy').length,
        warningChecks: warningAlerts,
        criticalChecks: criticalAlerts,
        complianceScore: Math.round((alerts.filter(alert => alert.status === 'healthy').length / alerts.length) * 100),
        lastCriticalDate: criticalAlerts > 0 ? currentTime : null,
        riskLevel: riskLevel,
        complexityFactor: complexity,
      },

      // Recomendaciones automáticas - ESPECÍFICAS POR EMPRESA
      recommendations: [
        ...(selectedEntities.length > 0 ? [
          `Configure las cuentas contables para las ${selectedEntities.length} nuevas entidades detectadas en ${name}`,
        ] : []),
        ...(daysToIVA <= 10 ? [
          `Prepare la declaración F29 de ${name} con anticipación para evitar retrasos`,
        ] : []),
        ...(warningAlerts > 0 ? [
          `Revise las alertas pendientes de ${name} para mantener cumplimiento óptimo`,
        ] : [
          `Excelente estado tributario en ${name} - Mantenga las buenas prácticas`,
        ]),
      ],
    }

    return NextResponse.json({
      success: true,
      data: healthData,
      timestamp: new Date().toISOString(),
      message: `Estado de salud tributaria evaluado para ${name}`,
      source: 'demo_differentiated'
    });
}
