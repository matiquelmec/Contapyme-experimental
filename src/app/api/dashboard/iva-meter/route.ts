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

    console.log('🔍 [IVA Meter API] Fetching data for company:', companyId);

    // ✅ OBTENER DATOS REALES DE LA BASE DE DATOS
    const supabase = getDatabaseConnection();
    if (!supabase) {
      console.warn('⚠️ [IVA Meter API] Database not available, using demo data');
      return getDemoIvaData(companyId);
    }

    // Intentar obtener datos reales de IVA de la base de datos
    const ivaData = await getIvaDataFromDatabase(supabase, companyId);
    if (ivaData) {
      console.log('✅ [IVA Meter API] Using real database data');
      return NextResponse.json({
        success: true,
        data: ivaData,
        timestamp: new Date().toISOString(),
        message: 'Datos de IVA obtenidos de base de datos',
        source: 'database'
      });
    }

    // Fallback a datos demo diferenciados por empresa
    console.log('📊 [IVA Meter API] Using differentiated demo data');
    return getDemoIvaData(companyId);

  } catch (error) {
    console.error('❌ [IVA Meter API] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Error al calcular datos de IVA',
      details: error instanceof Error ? error.message : 'Error desconocido',
    }, { status: 500 });
  }
}

// 🗃️ FUNCIÓN PARA OBTENER DATOS REALES DE BASE DE DATOS
async function getIvaDataFromDatabase(supabase: any, companyId: string) {
  try {
    // TODO: Implementar consulta real a tablas de ventas y compras
    // Por ahora retorna null para usar datos demo
    // En el futuro consultar: sales_book, purchase_book, journal_entries

    const { data: salesData, error: salesError } = await supabase
      .from('sales_book')
      .select('*')
      .eq('company_id', companyId)
      .limit(1);

    // Si no hay datos reales, usar datos demo
    if (salesError || !salesData || salesData.length === 0) {
      return null;
    }

    // Si hay datos reales, calcularlos (implementación futura)
    // return calculateRealIvaData(salesData, companyId);
    return null; // Por ahora usar datos demo

  } catch (error) {
    console.error('Error querying database for IVA data:', error);
    return null;
  }
}

// 📊 FUNCIÓN PARA GENERAR DATOS DEMO DINÁMICOS POR EMPRESA
function getDemoIvaData(companyId: string) {
  // 🚀 GENERAR PERFIL DINÁMICO DE EMPRESA - INFINITAMENTE ESCALABLE
  const profile = generateCompanyProfile(companyId);
  const { name, scale, complexity, ivaAmount } = profile;

  // 💵 CALCULAR DÉBITO Y CRÉDITO FISCAL BASADO EN PERFIL
  const debitoFiscal = Math.round(ivaAmount * (1.2 + complexity * 0.3)); // Débito mayor para empresas complejas
  const creditoFiscal = Math.round(ivaAmount * (0.8 + scale * 0.4)); // Crédito proporcional al tamaño
  const ivaAPagar = debitoFiscal - creditoFiscal;

  const ivaData = {
    debitoFiscal,
    creditoFiscal,
    ivaAPagar,
    porcentaje: Math.min(Math.abs(ivaAPagar) / 10000000 * 100, 100),
    estado: ivaAPagar > 0 ? 'pagar' : ivaAPagar < -50000 ? 'favor' : 'equilibrio',
    fechaCalculo: new Date().toISOString(),
    companyName: name,
    companyId,

    // Datos adicionales para el dashboard
    periodoCalculo: new Date().toISOString().slice(0, 7), // YYYY-MM
    montoTotal: Math.abs(ivaAPagar),
    fechaVencimiento: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 20).toISOString(),

    // Histórico para comparación (diferente por empresa)
    historicoMeses: [
      { mes: '2024-10', monto: Math.round(ivaAPagar * 0.8), estado: 'pagar' },
      { mes: '2024-11', monto: Math.round(ivaAPagar * 0.9), estado: 'pagar' },
      { mes: '2024-12', monto: ivaAPagar, estado: ivaAPagar > 0 ? 'pagar' : 'favor' },
    ],

    // Proyección próximo mes basado en tendencia
    proyeccionProximoMes: {
      estimado: Math.round(ivaAPagar * 1.15), // Incremento estacional 15%
      confianza: 75,
      factores: [
        'Incremento estacional diciembre-enero',
        'Tendencia de ventas últimos 3 meses',
        'Promedio compras vs ventas',
      ],
    },
  };

  return NextResponse.json({
    success: true,
    data: ivaData,
    timestamp: new Date().toISOString(),
    message: `Datos de IVA calculados para ${name}`,
    source: 'demo_differentiated'
  });
}
