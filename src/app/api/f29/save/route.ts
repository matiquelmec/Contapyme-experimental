// 🔒 F29 SAVE API - VERSIÓN SEGURA
// Guarda análisis de F29 con validación de permisos

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createSupabaseAdminClient } from '@/lib/supabase/client';
import { withValidation, SecurityContext } from '@/lib/api-security';

// 📋 SCHEMA DE VALIDACIÓN PARA F29
const F29SaveSchema = z.object({
  parsedData: z.object({
    // Información básica del F29
    rut: z.string().optional(),
    folio: z.string().optional(),
    periodo: z.string().optional(),
    year: z.number().optional(),
    month: z.number().optional(),

    // Datos financieros principales
    ventasNetas: z.number().optional(),
    comprasNetas: z.number().optional(),
    codigo538: z.number().optional(), // IVA débito
    codigo511: z.number().optional(), // IVA crédito
    codigo563: z.number().optional(), // Ventas netas
    codigo062: z.number().optional(), // PPM
    codigo077: z.number().optional(), // Remanente

    // Campos calculados
    debitoFiscal: z.number().optional(),
    creditoFiscal: z.number().optional(),
    ivaDeterminado: z.number().optional(),
    totalAPagar: z.number().optional(),
    margenBruto: z.number().optional(),

    // Metadatos de procesamiento
    method: z.string().optional(),
    confidence: z.number().min(0).max(100).optional(),
    errors: z.array(z.string()).optional(),
  }),
  fileName: z.string().optional(),
  company_id: z.string().uuid().optional(), // ¡Ahora se valida!
});

// 🔐 HANDLER PRINCIPAL CON SEGURIDAD
async function secureF29SaveHandler(
  request: NextRequest,
  context: SecurityContext,
  validatedData: z.infer<typeof F29SaveSchema>
): Promise<NextResponse> {
  console.log(`💾 F29 Save API: Usuario ${context.user.email} guardando F29 para empresa ${context.companyId}`);

  try {
    const { parsedData, fileName } = validatedData;

    // ✅ USAR CONTEXTO SEGURO (SIN IDS HARDCODEADOS)
    const userId = context.user.id;
    const companyId = context.companyId;

    if (!parsedData) {
      return NextResponse.json({
        success: false,
        error: 'No se proporcionaron datos para guardar',
      }, { status: 400 });
    }

    // Extraer período del F29 (formato YYYYMM)
    let period = parsedData.periodo || '';
    if (!period && parsedData.year && parsedData.month) {
      period = `${parsedData.year}${String(parsedData.month).padStart(2, '0')}`;
    }

    // Validar formato del período
    if (!period || !/^\d{6}$/.test(period)) {
      console.warn('⚠️ Período inválido o no detectado:', period);
      // Intentar generar un período por defecto basado en la fecha actual
      const now = new Date();
      period = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    const year = parseInt(period.substring(0, 4));
    const month = parseInt(period.substring(4, 6));

    // 🔐 USAR CLIENTE ADMIN CON PERMISOS VALIDADOS
    const supabase = createSupabaseAdminClient();

    // Preparar datos para insertar (DATOS SEGUROS)
    const f29Record = {
      user_id: userId, // ✅ Del contexto autenticado
      company_id: companyId, // ✅ Del contexto validado
      period,
      file_name: fileName || 'f29_upload.pdf',
      year,
      month,
      rut: parsedData.rut || '',
      folio: parsedData.folio || '',

      // Datos completos en JSON
      raw_data: parsedData,
      calculated_data: {
        method: parsedData.method || 'unknown',
        confidence: parsedData.confidence || 0,
        processing_time: new Date().toISOString(),
        processed_by: context.user.email, // ✅ Auditoría
      },

      // Campos principales para queries rápidas
      ventas_netas: parsedData.ventasNetas || parsedData.codigo563 || 0,
      compras_netas: parsedData.comprasNetas || 0,
      iva_debito: parsedData.codigo538 || parsedData.debitoFiscal || 0,
      iva_credito: parsedData.codigo511 || parsedData.creditoFiscal || 0,
      iva_determinado: parsedData.ivaDeterminado || 0,
      ppm: parsedData.codigo062 || parsedData.ppm || 0,
      remanente: parsedData.codigo077 || parsedData.remanente || 0,
      total_a_pagar: parsedData.totalAPagar || 0,
      margen_bruto: parsedData.margenBruto || 0,

      // Códigos específicos
      codigo_538: parsedData.codigo538 || 0,
      codigo_511: parsedData.codigo511 || 0,
      codigo_563: parsedData.codigo563 || 0,
      codigo_062: parsedData.codigo062 || 0,
      codigo_077: parsedData.codigo077 || 0,

      // Validación
      confidence_score: parsedData.confidence || 0,
      validation_status: parsedData.confidence > 80 ? 'validated' : 'manual_review',
      validation_errors: parsedData.errors || [],
    };

    console.log(`📝 Usuario ${context.user.email} guardando F29 período ${period} para empresa ${companyId}`);

    // Intentar actualizar si ya existe (upsert) - CON VALIDACIÓN DE EMPRESA
    const { data, error } = await supabase
      .from('f29_forms')
      .upsert(f29Record, {
        onConflict: 'company_id,period',
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error guardando F29:', error);

      // Si es error de constraint único, intentar actualizar
      if (error.code === '23505') {
        console.log('🔄 F29 ya existe para este período, actualizando...');

        const { data: updateData, error: updateError } = await supabase
          .from('f29_forms')
          .update(f29Record)
          .eq('company_id', companyId) // ✅ Solo puede actualizar SU empresa
          .eq('period', period)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        return NextResponse.json({
          success: true,
          message: 'F29 actualizado exitosamente',
          data: updateData,
          action: 'updated',
          security: {
            userId: context.user.id,
            companyId: context.companyId,
            userRole: context.userRole,
            isDemo: context.isDemo
          }
        });
      }

      throw error;
    }

    console.log('✅ F29 guardado exitosamente:', data?.id);

    // Opcional: Limpiar análisis comparativo cacheado - CON VALIDACIÓN
    if (data) {
      await supabase
        .from('f29_comparative_analysis')
        .delete()
        .eq('company_id', companyId) // ✅ Solo puede limpiar SU empresa
        .gte('period_start', period)
        .lte('period_end', period);
    }

    return NextResponse.json({
      success: true,
      message: 'F29 guardado exitosamente en base de datos',
      data,
      action: 'created',
      summary: {
        id: data?.id,
        period,
        ventas: f29Record.ventas_netas,
        confidence: f29Record.confidence_score,
      },
      security: {
        userId: context.user.id,
        companyId: context.companyId,
        userRole: context.userRole,
        isDemo: context.isDemo
      }
    });

  } catch (error) {
    console.error('❌ Error en F29 Save API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error guardando F29',
    }, { status: 500 });
  }
}

// 🔐 HANDLER SEGURO PARA GET - Obtener F29 guardados
async function secureF29GetHandler(
  request: NextRequest,
  context: SecurityContext
): Promise<NextResponse> {
  console.log(`📖 F29 Get API: Usuario ${context.user.email} consultando F29 de empresa ${context.companyId}`);

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period');
    const limit = parseInt(searchParams.get('limit') || '24');

    // ✅ USAR CONTEXTO SEGURO (NO HARDCODED)
    const companyId = context.companyId;
    const supabase = createSupabaseAdminClient();

    let query = supabase
      .from('f29_forms')
      .select('*')
      .eq('company_id', companyId) // ✅ Solo SU empresa
      .order('period', { ascending: false })
      .limit(limit);

    if (period) {
      query = query.eq('period', period);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Agrupar por año para mejor visualización
    const groupedByYear = data?.reduce((acc: any, f29: any) => {
      const year = f29.year || f29.period.substring(0, 4);
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(f29);
      return acc;
    }, {}) || {};

    return NextResponse.json({
      success: true,
      data: data || [],
      grouped: groupedByYear,
      summary: {
        total: data?.length || 0,
        years: Object.keys(groupedByYear),
        latest: data?.[0]?.period,
        oldest: data?.[data.length - 1]?.period,
      },
      security: {
        userId: context.user.id,
        companyId: context.companyId,
        userRole: context.userRole,
        isDemo: context.isDemo
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo F29:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error obteniendo F29',
    }, { status: 500 });
  }
}

// 🚀 EXPORTAR HANDLERS SEGUROS
export const POST = withValidation(
  F29SaveSchema,
  secureF29SaveHandler,
  { requiredPermission: 'write' } // ✅ Requiere permisos de escritura
);

export const GET = withAuth(
  secureF29GetHandler,
  { requiredPermission: 'read' } // ✅ Requiere permisos de lectura
);
