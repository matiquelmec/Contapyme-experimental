/**
 * 📊 SERVICIO UNIFICADO DE CÁLCULOS DE NÓMINA
 * Single Source of Truth para todos los cálculos de liquidaciones
 * Garantiza coherencia entre Excel, liquidaciones individuales y libro de remuneraciones
 */

export interface ValidationResult {
  isValid: boolean;
  differences: {
    haberes?: number;
    descuentos?: number;
    liquido?: number;
  };
  errors?: string[];
}

export interface LiquidationData {
  sueldo_base?: number;
  sobresueldo?: number;
  gratificacion?: number;
  bonos?: number;
  comisiones?: number;
  horas_extras?: number;
  other_income?: number;
  afp_amount?: number;
  health_amount?: number;
  unemployment_amount?: number;
  income_tax_amount?: number;
  total_gross_income?: number;
  total_descuentos?: number;
  total_liquido?: number;
}

export class PayrollCalculationService {

  /**
   * 💰 CÁLCULO UNIFICADO DE HABERES TOTALES
   * Replica la metodología del Excel del usuario
   */
  static calculateTotalHaberes(liquidation: LiquidationData): number {
    const components = [
      liquidation.sueldo_base || 0,
      liquidation.sobresueldo || 0,
      liquidation.gratificacion || 0,
      liquidation.bonos || 0,
      liquidation.comisiones || 0,
      liquidation.horas_extras || 0,
      liquidation.other_income || 0,
    ];

    const total = components.reduce((sum, amount) => 
      // Redondear cada componente para evitar errores de punto flotante
       sum + Math.round(amount * 100) / 100
    , 0);

    return Math.round(total * 100) / 100;
  }

  /**
   * 📉 CÁLCULO UNIFICADO DE DESCUENTOS TOTALES
   * Suma AFP + Salud + Cesantía + Impuestos
   */
  static calculateTotalDescuentos(liquidation: LiquidationData): number {
    const afp = liquidation.afp_amount || 0;
    const salud = liquidation.health_amount || 0;
    const cesantia = liquidation.unemployment_amount || 0;
    const impuesto = liquidation.income_tax_amount || 0;

    const total = afp + salud + cesantia + impuesto;
    return Math.round(total * 100) / 100;
  }

  /**
   * 💵 CÁLCULO UNIFICADO DE LÍQUIDO A PAGAR
   * Haberes - Descuentos = Líquido
   */
  static calculateLiquido(liquidation: LiquidationData): number {
    const haberes = this.calculateTotalHaberes(liquidation);
    const descuentos = this.calculateTotalDescuentos(liquidation);
    const liquido = haberes - descuentos;

    return Math.round(liquido * 100) / 100;
  }

  /**
   * ✅ VALIDACIÓN DE COHERENCIA MATEMÁTICA
   * Detecta inconsistencias entre valores calculados y almacenados
   */
  static validateCalculation(liquidation: LiquidationData): ValidationResult {
    const calculatedHaberes = this.calculateTotalHaberes(liquidation);
    const calculatedDescuentos = this.calculateTotalDescuentos(liquidation);
    const calculatedLiquido = this.calculateLiquido(liquidation);

    const storedHaberes = liquidation.total_gross_income || 0;
    const storedDescuentos = liquidation.total_descuentos || 0;
    const storedLiquido = liquidation.total_liquido || 0;

    const tolerance = 0.01; // Tolerancia de 1 centavo para errores de redondeo

    const haberesDiff = Math.abs(calculatedHaberes - storedHaberes);
    const descuentosDiff = Math.abs(calculatedDescuentos - storedDescuentos);
    const liquidoDiff = Math.abs(calculatedLiquido - storedLiquido);

    const errors: string[] = [];

    if (haberesDiff > tolerance) {
      errors.push(`Haberes: calculado $${calculatedHaberes} vs almacenado $${storedHaberes}`);
    }

    if (descuentosDiff > tolerance) {
      errors.push(`Descuentos: calculado $${calculatedDescuentos} vs almacenado $${storedDescuentos}`);
    }

    if (liquidoDiff > tolerance) {
      errors.push(`Líquido: calculado $${calculatedLiquido} vs almacenado $${storedLiquido}`);
    }

    return {
      isValid: errors.length === 0,
      differences: {
        haberes: calculatedHaberes - storedHaberes,
        descuentos: calculatedDescuentos - storedDescuentos,
        liquido: calculatedLiquido - storedLiquido,
      },
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * 🔄 NORMALIZACIÓN DE DATOS DE LIQUIDACIÓN
   * Asegura que todos los valores calculados sean coherentes
   */
  static normalizeLiquidation(liquidation: LiquidationData): LiquidationData {
    return {
      ...liquidation,
      total_gross_income: this.calculateTotalHaberes(liquidation),
      total_descuentos: this.calculateTotalDescuentos(liquidation),
      total_liquido: this.calculateLiquido(liquidation),
    };
  }

  /**
   * 📊 CÁLCULO DE TOTALES PARA LIBRO DE REMUNERACIONES
   * Suma todos los liquidaciones usando la metodología unificada
   */
  static calculateBookTotals(liquidations: LiquidationData[]) {
    const totalHaberes = liquidations.reduce((sum, liq) =>
      sum + this.calculateTotalHaberes(liq), 0);

    const totalDescuentos = liquidations.reduce((sum, liq) =>
      sum + this.calculateTotalDescuentos(liq), 0);

    const totalLiquido = totalHaberes - totalDescuentos;

    return {
      totalHaberes: Math.round(totalHaberes * 100) / 100,
      totalDescuentos: Math.round(totalDescuentos * 100) / 100,
      totalLiquido: Math.round(totalLiquido * 100) / 100,
    };
  }

  /**
   * 🔍 DIAGNÓSTICO COMPLETO DE LIQUIDACIÓN
   * Para debugging y auditoría
   */
  static diagnose(liquidation: LiquidationData) {
    const validation = this.validateCalculation(liquidation);
    const normalized = this.normalizeLiquidation(liquidation);

    return {
      original: liquidation,
      normalized,
      validation,
      components: {
        haberes: {
          sueldo_base: liquidation.sueldo_base || 0,
          sobresueldo: liquidation.sobresueldo || 0,
          gratificacion: liquidation.gratificacion || 0,
          bonos: liquidation.bonos || 0,
          comisiones: liquidation.comisiones || 0,
          horas_extras: liquidation.horas_extras || 0,
          other_income: liquidation.other_income || 0,
          total: this.calculateTotalHaberes(liquidation),
        },
        descuentos: {
          afp: liquidation.afp_amount || 0,
          salud: liquidation.health_amount || 0,
          cesantia: liquidation.unemployment_amount || 0,
          impuesto: liquidation.income_tax_amount || 0,
          total: this.calculateTotalDescuentos(liquidation),
        },
      },
    };
  }
}
