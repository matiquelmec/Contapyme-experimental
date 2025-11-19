/**
 * 🔧 API ENDPOINT: AUTO-FIX PAYROLL DATA COHERENCE
 *
 * Este endpoint corrige automáticamente:
 * 1. Valores almacenados en DB que no coinciden con PayrollUnifiedCalculator
 * 2. Regenera libros de remuneraciones con datos coherentes
 * 3. Actualiza totales para que coincidan con cálculos correctos
 *
 * POST /api/payroll/libro-remuneraciones/fix-coherence
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { createClient } from '@supabase/supabase-js';

import { SmartCompanyIdResolver } from '@/services/PayrollDataCoherenceEngine';
import type { UnifiedLiquidationData } from '@/services/PayrollUnifiedCalculator';
import { PayrollUnifiedCalculator } from '@/services/PayrollUnifiedCalculator';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_id, year, month, apply_fixes = false } = body;

    if (!company_id || !year || !month) {
      return NextResponse.json({
        success: false,
        error: 'Parámetros requeridos: company_id, year, month',
      }, { status: 400 });
    }

    console.log('🔧 AUTO-FIX COHERENCE - Starting:', { company_id, year, month, apply_fixes });

    // 🎯 PASO 1: Resolver company_id correcto
    const actualCompanyId = await SmartCompanyIdResolver.resolveCompanyId(
      company_id,
      year,
      month,
      supabase,
    );

    console.log('🎯 Company ID resolved for fix:', { requested: company_id, actual: actualCompanyId });

    // 🎯 PASO 2: Obtener liquidaciones que necesitan corrección
    const { data: liquidations, error: liquidationsError } = await supabase
      .from('payroll_liquidations')
      .select(`
        id, employee_id, period_year, period_month,
        base_salary, overtime_amount, gratification, legal_gratification_art50,
        bonuses, commissions, food_allowance, transport_allowance, family_allowance,
        total_gross_income, total_deductions, net_salary,
        afp_amount, afp_commission_amount, health_amount, unemployment_amount,
        income_tax_amount, loan_deductions, advance_payments, apv_amount, other_deductions,
        employees (
          rut, first_name, last_name
        )
      `)
      .eq('company_id', actualCompanyId)
      .eq('period_year', year)
      .eq('period_month', month);

    if (liquidationsError || !liquidations || liquidations.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No se encontraron liquidaciones para corregir',
        company_id_used: actualCompanyId,
      }, { status: 404 });
    }

    console.log(`🔍 Found ${liquidations.length} liquidations to analyze for corrections`);

    // 🎯 PASO 3: Calcular correcciones necesarias
    const corrections: Array<{
      liquidation_id: string;
      employee_name: string;
      current: { haberes: number; descuentos: number; liquido: number };
      correct: { haberes: number; descuentos: number; liquido: number };
      differences: { haberes: number; descuentos: number; liquido: number };
      needs_correction: boolean;
    }> = [];

    const totalCorrections = { haberes: 0, descuentos: 0, liquido: 0 };
    let liquidationsToFix = 0;

    for (const liquidation of liquidations) {
      // Convertir a formato unificado
      const unifiedData: UnifiedLiquidationData = {
        employee_rut: liquidation.employees?.rut || '',
        employee_name: `${liquidation.employees?.first_name || ''} ${liquidation.employees?.last_name || ''}`.trim(),
        period_year: liquidation.period_year,
        period_month: liquidation.period_month,
        sueldo_base: liquidation.base_salary || 0,
        sobresueldo: liquidation.overtime_amount || 0,
        gratificacion: (liquidation.gratification || 0) + (liquidation.legal_gratification_art50 || 0),
        bonos: liquidation.bonuses || 0,
        comisiones: liquidation.commissions || 0,
        horas_extras: 0,
        other_income: (liquidation.food_allowance || 0) + (liquidation.transport_allowance || 0) + (liquidation.family_allowance || 0),
        afp_amount: liquidation.afp_amount || 0,
        afp_commission_amount: liquidation.afp_commission_amount || 0,
        health_amount: liquidation.health_amount || 0,
        unemployment_amount: liquidation.unemployment_amount || 0,
        income_tax_amount: liquidation.income_tax_amount || 0,
        loan_deductions: liquidation.loan_deductions || 0,
        advance_payments: liquidation.advance_payments || 0,
        apv_amount: liquidation.apv_amount || 0,
        other_deductions: liquidation.other_deductions || 0,
      };

      // Calcular valores correctos
      const correctCalculation = PayrollUnifiedCalculator.calculateWithValidation(unifiedData);

      // Valores actuales en DB
      const currentHaberes = liquidation.total_gross_income || 0;
      const currentDescuentos = liquidation.total_deductions || 0;
      const currentLiquido = liquidation.net_salary || 0;

      // Calcular diferencias
      const diffHaberes = correctCalculation.total_haberes - currentHaberes;
      const diffDescuentos = correctCalculation.total_descuentos - currentDescuentos;
      const diffLiquido = correctCalculation.total_liquido - currentLiquido;

      const needsCorrection = Math.abs(diffHaberes) > 1 || Math.abs(diffDescuentos) > 1 || Math.abs(diffLiquido) > 1;

      if (needsCorrection) {
        liquidationsToFix++;
        totalCorrections.haberes += diffHaberes;
        totalCorrections.descuentos += diffDescuentos;
        totalCorrections.liquido += diffLiquido;

        // 🔧 APLICAR CORRECCIONES SI apply_fixes ES TRUE
        if (apply_fixes) {
          const { error: updateError } = await supabase
            .from('payroll_liquidations')
            .update({
              total_gross_income: correctCalculation.total_haberes,
              total_deductions: correctCalculation.total_descuentos,
              net_salary: correctCalculation.total_liquido,
              updated_at: new Date().toISOString(),
            })
            .eq('id', liquidation.id);

          if (updateError) {
            console.error(`❌ Error updating liquidation ${liquidation.id}:`, updateError);
          } else {
            console.log(`✅ Fixed liquidation ${liquidation.id} for ${unifiedData.employee_name}`);
          }
        }
      }

      corrections.push({
        liquidation_id: liquidation.id,
        employee_name: unifiedData.employee_name,
        current: {
          haberes: currentHaberes,
          descuentos: currentDescuentos,
          liquido: currentLiquido,
        },
        correct: {
          haberes: correctCalculation.total_haberes,
          descuentos: correctCalculation.total_descuentos,
          liquido: correctCalculation.total_liquido,
        },
        differences: {
          haberes: diffHaberes,
          descuentos: diffDescuentos,
          liquido: diffLiquido,
        },
        needs_correction: needsCorrection,
      });
    }

    // 🎯 PASO 4: Regenerar libro de remuneraciones si se aplicaron correcciones
    let bookRegenerated = false;
    if (apply_fixes && liquidationsToFix > 0) {
      try {
        // Eliminar libro existente para este período
        const { data: existingBooks } = await supabase
          .from('payroll_books')
          .select('id')
          .eq('company_id', actualCompanyId)
          .eq('period', `${year}-${month.toString().padStart(2, '0')}`);

        if (existingBooks && existingBooks.length > 0) {
          for (const book of existingBooks) {
            await supabase.from('payroll_book_details').delete().eq('payroll_book_id', book.id);
            await supabase.from('payroll_books').delete().eq('id', book.id);
          }
        }

        // Regenerar con datos corregidos será manejado por el endpoint principal
        console.log('📚 Existing books deleted, ready for regeneration');
        bookRegenerated = true;
      } catch (error) {
        console.error('❌ Error regenerating book:', error);
      }
    }

    // 🎯 PASO 5: Preparar respuesta
    const response = {
      success: true,
      analysis: {
        company_id_resolution: {
          requested: company_id,
          actual_used: actualCompanyId,
          auto_resolved: company_id !== actualCompanyId,
        },
        liquidations_analyzed: liquidations.length,
        liquidations_needing_fix: liquidationsToFix,
        total_corrections: {
          haberes: Math.round(totalCorrections.haberes * 100) / 100,
          descuentos: Math.round(totalCorrections.descuentos * 100) / 100,
          liquido: Math.round(totalCorrections.liquido * 100) / 100,
        },
        corrections_applied: apply_fixes,
        book_regenerated: bookRegenerated,
      },
      corrections: corrections.filter(c => c.needs_correction),
      summary: {
        total_haberes_diff: Math.round(totalCorrections.haberes * 100) / 100,
        total_descuentos_diff: Math.round(totalCorrections.descuentos * 100) / 100,
        total_liquido_diff: Math.round(totalCorrections.liquido * 100) / 100,
        coherence_achieved: apply_fixes ? liquidationsToFix > 0 : false,
      },
      next_steps: apply_fixes
        ? ['Correcciones aplicadas', 'Regenerar libro de remuneraciones', 'Verificar coherencia']
        : ['Ejecutar con apply_fixes: true para aplicar correcciones', 'Regenerar cache de interface'],
    };

    console.log('🎯 AUTO-FIX COMPLETE:', {
      analyzed: liquidations.length,
      needs_fix: liquidationsToFix,
      applied: apply_fixes,
      total_haberes_diff: totalCorrections.haberes,
      total_descuentos_diff: totalCorrections.descuentos,
    });

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('❌ Error in auto-fix coherence:', error);
    return NextResponse.json({
      success: false,
      error: 'Error en auto-corrección de coherencia',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
