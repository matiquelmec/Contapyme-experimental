// Servicio de cálculo de nómina
export interface PayrollCalculatorConfig {
  uf: number;
  utm: number;
  minimumWage: number;
  afpRates: Record<string, number>;
  healthRates: Record<string, number>;
}

export class PayrollCalculator {
  constructor(private config: PayrollCalculatorConfig) {}

  calculateGrossAmount(baseSalary: number, bonuses: number = 0): number {
    return baseSalary + bonuses;
  }

  calculateAFP(grossAmount: number, afpRate: number): number {
    return Math.round(grossAmount * afpRate);
  }

  calculateHealth(grossAmount: number, healthRate: number): number {
    return Math.round(grossAmount * healthRate);
  }

  calculateTaxableIncome(grossAmount: number, afp: number, health: number): number {
    return grossAmount - afp - health;
  }

  calculateIncomeTax(taxableIncome: number): number {
    // Tabla de impuesto a la renta simplificada
    const brackets = [
      { min: 0, max: 13.5 * this.config.utm, rate: 0, deduction: 0 },
      { min: 13.5 * this.config.utm, max: 30 * this.config.utm, rate: 0.04, deduction: 0.54 * this.config.utm },
      { min: 30 * this.config.utm, max: 50 * this.config.utm, rate: 0.08, deduction: 1.74 * this.config.utm },
      { min: 50 * this.config.utm, max: 70 * this.config.utm, rate: 0.135, deduction: 4.49 * this.config.utm },
      { min: 70 * this.config.utm, max: 90 * this.config.utm, rate: 0.23, deduction: 11.14 * this.config.utm },
      { min: 90 * this.config.utm, max: 120 * this.config.utm, rate: 0.304, deduction: 17.8 * this.config.utm },
      { min: 120 * this.config.utm, max: Infinity, rate: 0.35, deduction: 23.32 * this.config.utm },
    ];

    const bracket = brackets.find(b => taxableIncome >= b.min && taxableIncome < b.max);
    if (!bracket) return 0;

    return Math.round(taxableIncome * bracket.rate - bracket.deduction);
  }

  calculateNetSalary(grossAmount: number, afp: number, health: number, tax: number, otherDeductions: number = 0): number {
    return grossAmount - afp - health - tax - otherDeductions;
  }
}

export default PayrollCalculator;