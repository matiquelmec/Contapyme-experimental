import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { createClient } from '@supabase/supabase-js';

import { PayrollUnifiedCalculator } from '@/services/PayrollUnifiedCalculator';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');
    const liquidationId = params.id;

    console.log('🔍 GET Liquidation Detail - ID:', liquidationId, 'Company:', companyId);

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'company_id es requerido' },
        { status: 400 },
      );
    }

    if (!liquidationId) {
      return NextResponse.json(
        { success: false, error: 'liquidation_id es requerido' },
        { status: 400 },
      );
    }

    // Obtener liquidación específica con datos del empleado
    const { data: liquidation, error } = await supabase
      .from('payroll_liquidations')
      .select(`
        *,
        employees (
          rut,
          first_name,
          last_name
        )
      `)
      .eq('id', liquidationId)
      .eq('company_id', companyId)
      .single();

    if (error) {
      console.error('❌ Error fetching liquidation detail:', error);
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Liquidación no encontrada' },
          { status: 404 },
        );
      }
      
      return NextResponse.json(
        { success: false, error: 'Error al obtener liquidación' },
        { status: 500 },
      );
    }

    if (!liquidation) {
      return NextResponse.json(
        { success: false, error: 'Liquidación no encontrada' },
        { status: 404 },
      );
    }

    console.log('✅ Liquidation detail found:', (liquidation as any).id);
    console.log('🔍 Raw liquidation data:', {
      legal_gratification_art50: (liquidation as any).legal_gratification_art50,
      total_gross_income: (liquidation as any).total_gross_income,
      total_taxable_income: (liquidation as any).total_taxable_income,
      base_salary: (liquidation as any).base_salary,
      employee: (liquidation as any).employees,
    });

    // ✅ USAR VALORES DE DB TAL COMO VIENEN (sin corrección duplicada)
    console.log('🔍 Raw liquidation data:', {
      legal_gratification_art50: (liquidation as any).legal_gratification_art50,
      total_gross_income: (liquidation as any).total_gross_income,
      total_taxable_income: (liquidation as any).total_taxable_income,
      base_salary: (liquidation as any).base_salary,
    });

    // 🎯 APLICAR CALCULADORA UNIFICADA - SINGLE SOURCE OF TRUTH
    const unifiedData = {
      employee_rut: (liquidation as any).employees?.rut || '',
      employee_name: `${(liquidation as any).employees?.first_name || ''} ${(liquidation as any).employees?.last_name || ''}`.trim(),
      period_year: (liquidation as any).period_year,
      period_month: (liquidation as any).period_month,
      sueldo_base: liquidation.base_salary || 0,
      sobresueldo: (liquidation as any).overtime_amount || 0,
      gratificacion: ((liquidation as any).gratification || 0) + (liquidation.legal_gratification_art50 || 0),
      bonos: (liquidation as any).bonuses || 0,
      comisiones: (liquidation as any).commissions || 0,
      horas_extras: 0, // Se puede derivar de overtime_amount si es necesario
      other_income: ((liquidation as any).food_allowance || 0) + ((liquidation as any).transport_allowance || 0) + ((liquidation as any).family_allowance || 0),
      afp_amount: (liquidation as any).afp_amount || 0,
      afp_commission_amount: (liquidation as any).afp_commission_amount || 0,
      health_amount: (liquidation as any).health_amount || 0,
      unemployment_amount: (liquidation as any).unemployment_amount || 0,
      income_tax_amount: (liquidation as any).income_tax_amount || 0,
      loan_deductions: (liquidation as any).loan_deductions || 0,
      advance_payments: (liquidation as any).advance_payments || 0,
      apv_amount: (liquidation as any).apv_amount || 0,
      other_deductions: (liquidation as any).other_deductions || 0,
    };

    // ✅ CALCULAR TOTALES USANDO CALCULADORA UNIFICADA
    const calculatedResult = PayrollUnifiedCalculator.calculateWithValidation(unifiedData);

    console.log('🎯 Unified Calculator Results:', {
      calculated_haberes: calculatedResult.total_haberes,
      stored_haberes: liquidation.total_gross_income,
      calculated_descuentos: calculatedResult.total_descuentos,
      stored_descuentos: liquidation.total_deductions,
      calculated_liquido: calculatedResult.total_liquido,
      stored_liquido: liquidation.net_salary,
      validation: calculatedResult.validation,
    });

    // Formatear datos para respuesta con cálculos unificados
    const formattedLiquidation = {
      id: liquidation.id,
      employee: {
        rut: (liquidation as any).employees?.rut || '',
        first_name: (liquidation as any).employees?.first_name || '',
        last_name: (liquidation as any).employees?.last_name || '',
      },
      period_year: (liquidation as any).period_year,
      period_month: (liquidation as any).period_month,
      days_worked: liquidation.days_worked || 30,

      // Haberes - Componentes originales
      base_salary: liquidation.base_salary || 0,
      overtime_amount: (liquidation as any).overtime_amount || 0,
      bonuses: (liquidation as any).bonuses || 0,
      commissions: (liquidation as any).commissions || 0,
      gratification: (liquidation as any).gratification || 0,
      legal_gratification_art50: liquidation.legal_gratification_art50 || 0,
      food_allowance: (liquidation as any).food_allowance || 0,
      transport_allowance: (liquidation as any).transport_allowance || 0,
      family_allowance: (liquidation as any).family_allowance || 0,
      total_taxable_income: liquidation.total_taxable_income || 0,
      total_non_taxable_income: liquidation.total_non_taxable_income || 0,

      // Descuentos - Componentes originales
      afp_percentage: liquidation.afp_percentage || 10.0,
      afp_commission_percentage: liquidation.afp_commission_percentage || 0.58,
      afp_amount: (liquidation as any).afp_amount || 0,
      afp_commission_amount: (liquidation as any).afp_commission_amount || 0,
      health_percentage: liquidation.health_percentage || 7.0,
      health_amount: (liquidation as any).health_amount || 0,
      unemployment_percentage: liquidation.unemployment_percentage || 0.6,
      unemployment_amount: (liquidation as any).unemployment_amount || 0,
      income_tax_amount: (liquidation as any).income_tax_amount || 0,

      // Otros descuentos
      loan_deductions: (liquidation as any).loan_deductions || 0,
      advance_payments: (liquidation as any).advance_payments || 0,
      apv_amount: (liquidation as any).apv_amount || 0,
      other_deductions: (liquidation as any).other_deductions || 0,
      total_other_deductions: liquidation.total_other_deductions || 0,

      // 🎯 TOTALES CALCULADOS CON CALCULADORA UNIFICADA
      total_gross_income: calculatedResult.total_haberes,
      total_deductions: calculatedResult.total_descuentos,
      net_salary: calculatedResult.total_liquido,
      
      status: liquidation.status || 'draft',
      created_at: liquidation.created_at,
      updated_at: liquidation.updated_at,
    };

    return NextResponse.json({
      success: true,
      data: formattedLiquidation,
    }, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('❌ Error in GET /api/payroll/liquidations/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');
    const liquidationId = params.id;
    const updateData = await request.json();

    console.log('🔍 PUT Liquidation - ID:', liquidationId, 'Data:', updateData);

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'company_id es requerido' },
        { status: 400 },
      );
    }

    if (!liquidationId) {
      return NextResponse.json(
        { success: false, error: 'liquidation_id es requerido' },
        { status: 400 },
      );
    }

    // Actualizar liquidación
    const { data: updated, error: updateError } = await supabase
      .from('payroll_liquidations')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', liquidationId)
      .eq('company_id', companyId)
      .select(`
        *,
        employees (
          rut,
          first_name,
          last_name
        )
      `)
      .single();

    if (updateError) {
      console.error('❌ Error updating liquidation:', updateError);
      
      if (updateError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Liquidación no encontrada' },
          { status: 404 },
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al actualizar liquidación',
          details: updateError.message, 
        },
        { status: 500 },
      );
    }

    console.log('✅ Liquidation updated:', updated.id);

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Liquidación actualizada exitosamente',
    });

  } catch (error) {
    console.error('❌ Error in PUT /api/payroll/liquidations/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');
    const liquidationId = params.id;

    console.log('🔍 DELETE Liquidation - ID:', liquidationId);

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'company_id es requerido' },
        { status: 400 },
      );
    }

    if (!liquidationId) {
      return NextResponse.json(
        { success: false, error: 'liquidation_id es requerido' },
        { status: 400 },
      );
    }

    // Eliminar liquidación
    const { data: deleted, error: deleteError } = await supabase
      .from('payroll_liquidations')
      .delete()
      .eq('id', liquidationId)
      .eq('company_id', companyId)
      .select()
      .single();

    if (deleteError) {
      console.error('❌ Error deleting liquidation:', deleteError);
      
      if (deleteError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Liquidación no encontrada' },
          { status: 404 },
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al eliminar liquidación',
          details: deleteError.message, 
        },
        { status: 500 },
      );
    }

    console.log('✅ Liquidation deleted:', deleted.id);

    return NextResponse.json({
      success: true,
      data: deleted,
      message: 'Liquidación eliminada exitosamente',
    });

  } catch (error) {
    console.error('❌ Error in DELETE /api/payroll/liquidations/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}
