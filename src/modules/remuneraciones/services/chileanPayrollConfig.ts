// Configuración específica para nómina chilena
export const CHILEAN_PAYROLL_CONFIG = {
  // Valores UF y UTM (actualizar mensualmente)
  uf: 37739.10,
  utm: 66362,
  
  // Salario mínimo
  minimumWage: 500000,
  
  // Tasas AFP
  afpRates: {
    'CAPITAL': 0.1144,
    'CUPRUM': 0.1144, 
    'HABITAT': 0.1127,
    'MODELO': 0.1058,
    'PLANVITAL': 0.1116,
    'PROVIDA': 0.1145,
    'UNO': 0.1069,
  },
  
  // Tasas de salud
  healthRates: {
    'FONASA': 0.07,
    'BANMEDICA': 0.07,
    'CONSALUD': 0.07,
    'CRUZ BLANCA': 0.07,
    'COLMENA': 0.07,
    'MASVIDA': 0.07,
    'VIDA TRES': 0.07,
  },
  
  // Seguro de cesantía
  unemploymentInsurance: {
    employerRate: 0.024,
    employeeRate: 0.006,
  },
  
  // Topes imponibles
  maxTaxableIncome: 90 * 66362, // 90 UF
  maxHealthIncome: 81.6 * 37739.10, // 81.6 UF
  
  // Asignación familiar
  familyAllowance: {
    tramo1: { max: 429899, amount: 20694 },
    tramo2: { max: 627913, amount: 12680 },
    tramo3: { max: 979330, amount: 4007 },
    tramo4: { max: Infinity, amount: 0 },
  },
  
  // Gratificación legal
  legalBonus: {
    rate: 0.25,
    maxMonthly: 4.75 * 500000 / 12, // 4.75 IMM / 12
  },
  
  // Horas extras
  overtimeRates: {
    normal: 1.5,
    holiday: 2.0,
  },
  
  // Vacaciones
  vacation: {
    daysPerYear: 15,
    progressiveDays: [
      { years: 10, additionalDays: 1 },
      { years: 15, additionalDays: 2 },
      { years: 20, additionalDays: 3 },
    ],
  },
};

export type ChileanPayrollConfig = typeof CHILEAN_PAYROLL_CONFIG;

export default CHILEAN_PAYROLL_CONFIG;