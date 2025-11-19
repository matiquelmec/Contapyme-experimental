import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { createClient } from '@supabase/supabase-js';

import { PayrollUnifiedCalculator } from '@/services/PayrollUnifiedCalculator';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * 📊 API PARA VALIDAR COHERENCIA ENTRE EXCEL Y SISTEMA
 * Compara datos del Excel del usuario con cálculos del sistema
 * POST /api/payroll/validate-excel
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      company_id,
      period_year,
      period_month,
      excel_data,
    } = body;

    console.log('🔍 Validating Excel vs System:', {
      company_id,
      period: `${period_year}-${period_month}`,
      excel_entries: excel_data?.length || 0,
    });

    if (!company_id || !period_year || !period_month || !excel_data) {
      return NextResponse.json({
        success: false,
        error: 'Faltan parámetros requeridos: company_id, period_year, period_month, excel_data',
      }, { status: 400 });
    }

    // 📋 Obtener liquidaciones del sistema para el período
    const { data: systemLiquidations, error: systemError } = await supabase
      .from('payroll_liquidations')
      .select(`
        *,
        employees (
          rut,
          first_name,
          last_name
        )
      `)
      .eq('company_id', company_id)
      .eq('period_year', period_year)
      .eq('period_month', period_month);

    if (systemError) {
      console.error('❌ Error fetching system liquidations:', systemError);
      return NextResponse.json({
        success: false,
        error: 'Error al obtener liquidaciones del sistema',
      }, { status: 500 });
    }

    if (!systemLiquidations || systemLiquidations.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No se encontraron liquidaciones en el sistema para el período especificado',
      }, { status: 404 });
    }

    // 🎯 Calcular totales del sistema usando calculadora unificada
    let systemTotalHaberes = 0;
    let systemTotalDescuentos = 0;
    let systemTotalLiquido = 0;

    const systemCalculations = systemLiquidations.map(liq => {
      const unifiedData = {
        employee_rut: liq.employees?.rut || '',
        employee_name: `${liq.employees?.first_name || ''} ${liq.employees?.last_name || ''}`.trim(),
        period_year: liq.period_year,
        period_month: liq.period_month,
        sueldo_base: liq.base_salary || 0,
        sobresueldo: liq.overtime_amount || 0,
        gratificacion: (liq.gratification || 0) + (liq.legal_gratification_art50 || 0),
        bonos: liq.bonuses || 0,
        comisiones: liq.commissions || 0,
        horas_extras: 0,
        other_income: (liq.food_allowance || 0) + (liq.transport_allowance || 0) + (liq.family_allowance || 0),
        afp_amount: liq.afp_amount || 0,
        health_amount: liq.health_amount || 0,
        unemployment_amount: liq.unemployment_amount || 0,
        income_tax_amount: liq.income_tax_amount || 0,
        other_deductions: (liq.loan_deductions || 0) + (liq.advance_payments || 0) + (liq.apv_amount || 0) + (liq.other_deductions || 0),
      };

      const result = PayrollUnifiedCalculator.calculateWithValidation(unifiedData);

      systemTotalHaberes += result.total_haberes;
      systemTotalDescuentos += result.total_descuentos;
      systemTotalLiquido += result.total_liquido;

      return {
        rut: unifiedData.employee_rut,
        name: unifiedData.employee_name,
        calculated: result,
      };
    });

    // Redondear totales del sistema
    systemTotalHaberes = Math.round(systemTotalHaberes * 100) / 100;
    systemTotalDescuentos = Math.round(systemTotalDescuentos * 100) / 100;
    systemTotalLiquido = Math.round(systemTotalLiquido * 100) / 100;

    // 📊 Calcular totales del Excel
    let excelTotalHaberes = 0;
    let excelTotalDescuentos = 0;
    let excelTotalLiquido = 0;

    excel_data.forEach((row: any) => {
      excelTotalHaberes += (row.total_haberes || 0);
      excelTotalDescuentos += (row.total_descuentos || 0);
      excelTotalLiquido += (row.total_liquido || 0);
    });

    // Redondear totales del Excel
    excelTotalHaberes = Math.round(excelTotalHaberes * 100) / 100;
    excelTotalDescuentos = Math.round(excelTotalDescuentos * 100) / 100;
    excelTotalLiquido = Math.round(excelTotalLiquido * 100) / 100;

    // 🔍 Comparar totales
    const tolerance = 1; // Tolerancia de $1 peso chileno
    const haberesMatch = Math.abs(systemTotalHaberes - excelTotalHaberes) <= tolerance;
    const descuentosMatch = Math.abs(systemTotalDescuentos - excelTotalDescuentos) <= tolerance;
    const liquidoMatch = Math.abs(systemTotalLiquido - excelTotalLiquido) <= tolerance;

    const isFullyConsistent = haberesMatch && descuentosMatch && liquidoMatch;

    // 📋 Generar recomendaciones
    const recommendations: string[] = [];

    if (!haberesMatch) {
      const diff = systemTotalHaberes - excelTotalHaberes;
      recommendations.push(
        `Revisar cálculo de haberes: Sistema $${systemTotalHaberes.toLocaleString('es-CL')} vs Excel $${excelTotalHaberes.toLocaleString('es-CL')} (diferencia: $${diff.toLocaleString('es-CL')})`,
      );
    }

    if (!descuentosMatch) {
      const diff = systemTotalDescuentos - excelTotalDescuentos;
      recommendations.push(
        `Revisar cálculo de descuentos: Sistema $${systemTotalDescuentos.toLocaleString('es-CL')} vs Excel $${excelTotalDescuentos.toLocaleString('es-CL')} (diferencia: $${diff.toLocaleString('es-CL')})`,
      );
    }

    if (!liquidoMatch) {
      const diff = systemTotalLiquido - excelTotalLiquido;
      recommendations.push(
        `Revisar cálculo de líquido: Sistema $${systemTotalLiquido.toLocaleString('es-CL')} vs Excel $${excelTotalLiquido.toLocaleString('es-CL')} (diferencia: $${diff.toLocaleString('es-CL')})`,
      );
    }

    if (isFullyConsistent) {
      recommendations.push('✅ Excelente! Los cálculos del sistema coinciden perfectamente con tu Excel');
    }

    // 👥 Comparación detallada por empleado (opcional)
    const employeeComparisons = excel_data.map((excelRow: any) => {
      const systemEmployee = systemCalculations.find(sys =>
        sys.rut === excelRow.rut ||
        sys.name.toLowerCase().includes(excelRow.name?.toLowerCase() || ''),
      );

      if (!systemEmployee) {
        return {
          rut: excelRow.rut,
          name: excelRow.name,
          status: 'not_found_in_system',
          excel: excelRow,
          system: null,
          differences: null,
        };
      }

      const haberesEmployeeDiff = systemEmployee.calculated.total_haberes - (excelRow.total_haberes || 0);
      const descuentosEmployeeDiff = systemEmployee.calculated.total_descuentos - (excelRow.total_descuentos || 0);
      const liquidoEmployeeDiff = systemEmployee.calculated.total_liquido - (excelRow.total_liquido || 0);

      const employeeMatch =
        Math.abs(haberesEmployeeDiff) <= tolerance &&
        Math.abs(descuentosEmployeeDiff) <= tolerance &&
        Math.abs(liquidoEmployeeDiff) <= tolerance;

      return {
        rut: excelRow.rut,
        name: excelRow.name,
        status: employeeMatch ? 'match' : 'discrepancy',
        excel: {
          haberes: excelRow.total_haberes || 0,
          descuentos: excelRow.total_descuentos || 0,
          liquido: excelRow.total_liquido || 0,
        },
        system: {
          haberes: systemEmployee.calculated.total_haberes,
          descuentos: systemEmployee.calculated.total_descuentos,
          liquido: systemEmployee.calculated.total_liquido,
        },
        differences: {
          haberes: haberesEmployeeDiff,
          descuentos: descuentosEmployeeDiff,
          liquido: liquidoEmployeeDiff,
        },
      };
    });

    const employeesWithDiscrepancies = employeeComparisons.filter(comp => comp.status === 'discrepancy');
    const employeesNotFound = employeeComparisons.filter(comp => comp.status === 'not_found_in_system');

    // 📊 Resultado final
    const result = {
      success: true,
      validation: {
        is_consistent: isFullyConsistent,
        period: `${period_year}-${String(period_month).padStart(2, '0')}`,
        totals: {
          system: {
            haberes: systemTotalHaberes,
            descuentos: systemTotalDescuentos,
            liquido: systemTotalLiquido,
            employees: systemLiquidations.length,
          },
          excel: {
            haberes: excelTotalHaberes,
            descuentos: excelTotalDescuentos,
            liquido: excelTotalLiquido,
            employees: excel_data.length,
          },
          differences: {
            haberes: systemTotalHaberes - excelTotalHaberes,
            descuentos: systemTotalDescuentos - excelTotalDescuentos,
            liquido: systemTotalLiquido - excelTotalLiquido,
          },
          matches: {
            haberes: haberesMatch,
            descuentos: descuentosMatch,
            liquido: liquidoMatch,
          },
        },
        employees: {
          total_compared: employeeComparisons.length,
          matches: employeeComparisons.filter(comp => comp.status === 'match').length,
          discrepancies: employeesWithDiscrepancies.length,
          not_found: employeesNotFound.length,
        },
        recommendations,
      },
      detailed_comparison: {
        employees_with_discrepancies: employeesWithDiscrepancies,
        employees_not_found: employeesNotFound,
        tolerance_used: tolerance,
      },
    };

    console.log('✅ Excel validation completed:', {
      consistent: isFullyConsistent,
      total_differences: {
        haberes: result.validation.totals.differences.haberes,
        descuentos: result.validation.totals.differences.descuentos,
        liquido: result.validation.totals.differences.liquido,
      },
      employees_with_issues: employeesWithDiscrepancies.length + employeesNotFound.length,
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Error in Excel validation:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor al validar Excel vs Sistema',
    }, { status: 500 });
  }
}

/**
 * 📋 GET - Obtener historial de validaciones
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id');

    if (!company_id) {
      return NextResponse.json({
        success: false,
        error: 'company_id es requerido',
      }, { status: 400 });
    }

    // Obtener períodos disponibles para validación
    const { data: availablePeriods, error } = await supabase
      .from('payroll_liquidations')
      .select('period_year, period_month')
      .eq('company_id', company_id)
      .order('period_year', { ascending: false })
      .order('period_month', { ascending: false });

    if (error) {
      console.error('❌ Error fetching available periods:', error);
      return NextResponse.json({
        success: false,
        error: 'Error al obtener períodos disponibles',
      }, { status: 500 });
    }

    // Agrupar por período único
    const uniquePeriods = availablePeriods?.reduce((acc: any[], curr) => {
      const periodKey = `${curr.period_year}-${curr.period_month}`;
      if (!acc.find(p => `${p.period_year}-${p.period_month}` === periodKey)) {
        acc.push({
          period_year: curr.period_year,
          period_month: curr.period_month,
          period_label: `${curr.period_year}-${String(curr.period_month).padStart(2, '0')}`,
        });
      }
      return acc;
    }, []) || [];

    return NextResponse.json({
      success: true,
      available_periods: uniquePeriods,
      total_periods: uniquePeriods.length,
    });

  } catch (error) {
    console.error('❌ Error in GET /api/payroll/validate-excel:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
    }, { status: 500 });
  }
}
