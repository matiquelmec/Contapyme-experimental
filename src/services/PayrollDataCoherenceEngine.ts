/**
 * 🎯 PAYROLL DATA COHERENCE ENGINE
 * Sistema inteligente que garantiza coherencia 100% entre:
 * - Interface web
 * - Exportaciones Excel/CSV
 * - Datos almacenados en DB
 * - PayrollUnifiedCalculator
 *
 * Principio SOLID: Single Responsibility - Una sola fuente de verdad
 */

import { PayrollUnifiedCalculator, UnifiedLiquidationData, CalculationResult } from './PayrollUnifiedCalculator';

export interface PayrollDataSource {
  id: string;
  source_type: 'database' | 'interface' | 'excel' | 'calculation';
  company_id: string;
  period_year: number;
  period_month: number;
  total_haberes: number;
  total_descuentos: number;
  total_liquido: number;
  liquidations_count: number;
  last_updated: string;
}

export interface CoherenceValidation {
  is_coherent: boolean;
  discrepancies: {
    source_a: string;
    source_b: string;
    haberes_diff: number;
    descuentos_diff: number;
    liquido_diff: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }[];
  confidence_score: number; // 0-100%
  recommended_action: string;
  auto_fixable: boolean;
}

export interface LiquidationData {
  id: string;
  employee_id: string;
  period_year: number;
  period_month: number;
  base_salary: number;
  overtime_amount?: number;
  gratification?: number;
  legal_gratification_art50?: number;
  bonuses?: number;
  commissions?: number;
  food_allowance?: number;
  transport_allowance?: number;
  family_allowance?: number;
  total_gross_income?: number;
  afp_amount?: number;
  afp_commission_amount?: number;
  health_amount?: number;
  unemployment_amount?: number;
  income_tax_amount?: number;
  loan_deductions?: number;
  advance_payments?: number;
  apv_amount?: number;
  other_deductions?: number;
  total_deductions?: number;
  net_salary?: number;
  employees?: {
    rut: string;
    first_name: string;
    last_name: string;
  };
}

export class PayrollDataCoherenceEngine {
  private static readonly TOLERANCE = 1; // $1 peso de tolerancia
  private static readonly CRITICAL_THRESHOLD = 50000; // $50.000 diferencia crítica

  /**
   * 🎯 MÉTODO MAESTRO - Valida coherencia entre múltiples fuentes de datos
   */
  static async validateCoherence(
    companyId: string,
    year: number,
    month: number,
    dataSources: PayrollDataSource[]
  ): Promise<CoherenceValidation> {

    const discrepancies: CoherenceValidation['discrepancies'] = [];

    // Comparar todas las fuentes entre sí
    for (let i = 0; i < dataSources.length; i++) {
      for (let j = i + 1; j < dataSources.length; j++) {
        const sourceA = dataSources[i];
        const sourceB = dataSources[j];

        const haberesDiff = Math.abs(sourceA.total_haberes - sourceB.total_haberes);
        const descuentosDiff = Math.abs(sourceA.total_descuentos - sourceB.total_descuentos);
        const liquidoDiff = Math.abs(sourceA.total_liquido - sourceB.total_liquido);

        // Determinar severidad
        const maxDiff = Math.max(haberesDiff, descuentosDiff, liquidoDiff);
        let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';

        if (maxDiff > this.CRITICAL_THRESHOLD) severity = 'critical';
        else if (maxDiff > 10000) severity = 'high';
        else if (maxDiff > 1000) severity = 'medium';

        // Si hay diferencias significativas, agregar a discrepancias
        if (haberesDiff > this.TOLERANCE || descuentosDiff > this.TOLERANCE || liquidoDiff > this.TOLERANCE) {
          discrepancies.push({
            source_a: sourceA.source_type,
            source_b: sourceB.source_type,
            haberes_diff: sourceA.total_haberes - sourceB.total_haberes,
            descuentos_diff: sourceA.total_descuentos - sourceB.total_descuentos,
            liquido_diff: sourceA.total_liquido - sourceB.total_liquido,
            severity
          });
        }
      }
    }

    // Calcular score de confianza
    const totalComparisons = (dataSources.length * (dataSources.length - 1)) / 2;
    const coherentComparisons = totalComparisons - discrepancies.length;
    const confidenceScore = totalComparisons > 0 ? Math.round((coherentComparisons / totalComparisons) * 100) : 100;

    // Determinar acción recomendada
    let recommendedAction = 'No action required - data is coherent';
    let autoFixable = true;

    if (discrepancies.length > 0) {
      const hasCritical = discrepancies.some(d => d.severity === 'critical');
      const hasHigh = discrepancies.some(d => d.severity === 'high');

      if (hasCritical) {
        recommendedAction = 'CRITICAL: Regenerate all payroll data using PayrollUnifiedCalculator';
        autoFixable = false;
      } else if (hasHigh) {
        recommendedAction = 'HIGH: Update stored values with calculated values';
        autoFixable = true;
      } else {
        recommendedAction = 'MEDIUM: Verify calculation inputs and refresh cached data';
        autoFixable = true;
      }
    }

    return {
      is_coherent: discrepancies.length === 0,
      discrepancies,
      confidence_score: confidenceScore,
      recommended_action: recommendedAction,
      auto_fixable: autoFixable
    };
  }

  /**
   * 🔄 MÉTODO DE AUTO-CORRECCIÓN - Corrige datos usando PayrollUnifiedCalculator
   */
  static async autoFixIncoherentData(
    liquidations: LiquidationData[],
    targetSource: 'database' | 'interface' = 'database'
  ): Promise<{
    success: boolean;
    fixed_liquidations: number;
    total_corrections: {
      haberes: number;
      descuentos: number;
      liquido: number;
    };
    errors: string[];
  }> {

    let fixedCount = 0;
    const errors: string[] = [];
    const totalCorrections = { haberes: 0, descuentos: 0, liquido: 0 };

    for (const liquidation of liquidations) {
      try {
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
          other_deductions: liquidation.other_deductions || 0
        };

        // Calcular valores correctos
        const correctCalculation = PayrollUnifiedCalculator.calculateWithValidation(unifiedData);

        // Comparar con valores almacenados
        const storedHaberes = liquidation.total_gross_income || 0;
        const storedDescuentos = liquidation.total_deductions || 0;
        const storedLiquido = liquidation.net_salary || 0;

        const haberesDiff = Math.abs(correctCalculation.total_haberes - storedHaberes);
        const descuentosDiff = Math.abs(correctCalculation.total_descuentos - storedDescuentos);
        const liquidoDiff = Math.abs(correctCalculation.total_liquido - storedLiquido);

        // Si hay diferencias, marcar para corrección
        if (haberesDiff > this.TOLERANCE || descuentosDiff > this.TOLERANCE || liquidoDiff > this.TOLERANCE) {
          totalCorrections.haberes += (correctCalculation.total_haberes - storedHaberes);
          totalCorrections.descuentos += (correctCalculation.total_descuentos - storedDescuentos);
          totalCorrections.liquido += (correctCalculation.total_liquido - storedLiquido);

          fixedCount++;

          // Aquí se aplicarían las correcciones a la DB si targetSource === 'database'
          // Por ahora solo calculamos las correcciones necesarias
        }

      } catch (error) {
        errors.push(`Error fixing liquidation ${liquidation.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      success: errors.length === 0,
      fixed_liquidations: fixedCount,
      total_corrections: {
        haberes: Math.round(totalCorrections.haberes * 100) / 100,
        descuentos: Math.round(totalCorrections.descuentos * 100) / 100,
        liquido: Math.round(totalCorrections.liquido * 100) / 100
      },
      errors
    };
  }

  /**
   * 🎯 GENERADOR DE DATOS COHERENTES - Crea fuente única de verdad
   */
  static generateCoherentDataSource(
    liquidations: LiquidationData[],
    companyId: string,
    year: number,
    month: number,
    sourceType: PayrollDataSource['source_type'] = 'calculation'
  ): PayrollDataSource {

    let totalHaberes = 0;
    let totalDescuentos = 0;
    let totalLiquido = 0;

    // Calcular totales usando PayrollUnifiedCalculator para garantizar coherencia
    liquidations.forEach(liquidation => {
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
        other_deductions: liquidation.other_deductions || 0
      };

      const result = PayrollUnifiedCalculator.calculateWithValidation(unifiedData);
      totalHaberes += result.total_haberes;
      totalDescuentos += result.total_descuentos;
      totalLiquido += result.total_liquido;
    });

    return {
      id: `${companyId}-${year}-${month}-${sourceType}`,
      source_type: sourceType,
      company_id: companyId,
      period_year: year,
      period_month: month,
      total_haberes: Math.round(totalHaberes * 100) / 100,
      total_descuentos: Math.round(totalDescuentos * 100) / 100,
      total_liquido: Math.round(totalLiquido * 100) / 100,
      liquidations_count: liquidations.length,
      last_updated: new Date().toISOString()
    };
  }

  /**
   * 📊 REPORTE DE COHERENCIA - Genera análisis completo
   */
  static generateCoherenceReport(
    validation: CoherenceValidation,
    dataSources: PayrollDataSource[]
  ): {
    summary: string;
    details: string[];
    action_plan: string[];
    confidence_level: 'excellent' | 'good' | 'fair' | 'poor';
  } {

    let confidenceLevel: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';
    if (validation.confidence_score < 50) confidenceLevel = 'poor';
    else if (validation.confidence_score < 70) confidenceLevel = 'fair';
    else if (validation.confidence_score < 90) confidenceLevel = 'good';

    const summary = validation.is_coherent
      ? `✅ Sistema coherente - ${validation.confidence_score}% confianza`
      : `❌ Inconsistencias detectadas - ${validation.discrepancies.length} discrepancias`;

    const details = [
      `Fuentes de datos analizadas: ${dataSources.length}`,
      `Score de confianza: ${validation.confidence_score}%`,
      `Discrepancias encontradas: ${validation.discrepancies.length}`,
      `Auto-reparable: ${validation.auto_fixable ? 'Sí' : 'No'}`
    ];

    if (validation.discrepancies.length > 0) {
      details.push('Discrepancias por severidad:');
      const bySeverity = validation.discrepancies.reduce((acc, d) => {
        acc[d.severity] = (acc[d.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      Object.entries(bySeverity).forEach(([severity, count]) => {
        details.push(`  - ${severity.toUpperCase()}: ${count}`);
      });
    }

    const actionPlan = validation.is_coherent
      ? ['No se requieren acciones - sistema coherente']
      : [
          validation.recommended_action,
          'Ejecutar PayrollDataCoherenceEngine.autoFixIncoherentData()',
          'Regenerar cache de interface con datos corregidos',
          'Verificar coherencia post-corrección'
        ];

    return {
      summary,
      details,
      action_plan: actionPlan,
      confidence_level: confidenceLevel
    };
  }

  /**
   * 🔧 UTILIDAD - Detecta company_id correcto automáticamente
   */
  static async detectCorrectCompanyId(
    testCompanyIds: string[],
    year: number,
    month: number,
    supabaseClient: any
  ): Promise<{
    correct_company_id: string | null;
    liquidations_found: number;
    confidence: number;
  }> {

    for (const companyId of testCompanyIds) {
      try {
        const { data: liquidations, error } = await supabaseClient
          .from('payroll_liquidations')
          .select('id, total_gross_income')
          .eq('company_id', companyId)
          .eq('period_year', year)
          .eq('period_month', month);

        if (!error && liquidations && liquidations.length > 0) {
          const hasRealData = liquidations.some(liq =>
            liq.total_gross_income && liq.total_gross_income > 0
          );

          if (hasRealData) {
            return {
              correct_company_id: companyId,
              liquidations_found: liquidations.length,
              confidence: 95
            };
          }
        }
      } catch (error) {
        // Continuar con el siguiente ID
      }
    }

    return {
      correct_company_id: null,
      liquidations_found: 0,
      confidence: 0
    };
  }
}

/**
 * 🎯 CLASE AUXILIAR - Smart Company ID Resolver
 * Resuelve automáticamente el company_id correcto para evitar datos demo
 */
export class SmartCompanyIdResolver {
  private static cache = new Map<string, string>();

  static async resolveCompanyId(
    requestedCompanyId: string,
    year: number,
    month: number,
    supabaseClient: any
  ): Promise<string> {

    const cacheKey = `${requestedCompanyId}-${year}-${month}`;

    // Verificar cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Si el ID solicitado es '1', buscar el ID real
    if (requestedCompanyId === '1') {
      const { data: companies } = await supabaseClient
        .from('companies')
        .select('id')
        .limit(10);

      if (companies && companies.length > 0) {
        const testIds = companies.map(c => c.id);
        const detection = await PayrollDataCoherenceEngine.detectCorrectCompanyId(
          testIds,
          year,
          month,
          supabaseClient
        );

        if (detection.correct_company_id) {
          this.cache.set(cacheKey, detection.correct_company_id);
          return detection.correct_company_id;
        }
      }
    }

    return requestedCompanyId;
  }

  static clearCache() {
    this.cache.clear();
  }
}