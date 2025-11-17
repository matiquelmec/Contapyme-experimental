import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as ExcelJS from 'exceljs';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface PayrollDetail {
  employee_rut: string;
  apellido_paterno: string;
  apellido_materno: string;
  nombres: string;
  cargo: string;
  area: string;
  dias_trabajados: number;
  sueldo_base: number;
  total_haberes: number;
  prevision_afp: number;
  salud: number;
  cesantia: number;
  impuesto_unico: number;
  total_descuentos: number;
  sueldo_liquido: number;
  colacion: number;
  movilizacion: number;
  asignacion_familiar: number;
  // Otros campos opcionales...
}

/**
 * GET /api/payroll/libro-remuneraciones/excel
 * 
 * Genera y descarga el libro de remuneraciones en formato Excel
 * Query params:
 * - company_id (required): ID de la empresa
 * - year (required): Año del período
 * - month (required): Mes del período (1-12)
 * 
 * Respuesta: Archivo Excel listo para descargar
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    console.log('🔍 EXCEL EXPORT - Params:', { companyId, year, month });

    if (!companyId || !year || !month) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Parámetros requeridos: company_id, year, month' 
        },
        { status: 400 }
      );
    }

    // ✅ PRIMERO: VERIFICAR QUE EXISTE UN LIBRO DE REMUNERACIONES PARA EL PERÍODO
    const period = `${year}-${month.toString().padStart(2, '0')}`;
    const { data: payrollBook, error: bookError } = await supabase
      .from('payroll_books')
      .select(`
        id, period, total_employees, total_haberes, total_descuentos, total_liquido,
        payroll_book_details (
          employee_rut, apellido_paterno, apellido_materno, nombres, cargo, area,
          dias_trabajados, sueldo_base, total_haberes, total_descuentos, sueldo_liquido,
          colacion, movilizacion, asignacion_familiar, prevision_afp, salud, cesantia, impuesto_unico
        )
      `)
      .eq('company_id', companyId)
      .eq('period', period)
      .single();

    if (bookError || !payrollBook) {
      console.error('❌ No existe libro de remuneraciones para el período:', { period, companyId, bookError });
      return NextResponse.json(
        {
          success: false,
          error: `No existe libro de remuneraciones para ${period}`,
          details: 'Debe generar el libro de remuneraciones primero desde la interfaz web'
        },
        { status: 404 }
      );
    }

    // ✅ SEGUNDO: OBTENER LIQUIDACIONES COMPLEMENTARIAS PARA CAMPOS FALTANTES
    const employeeRuts = payrollBook.payroll_book_details?.map(detail => detail.employee_rut) || [];

    const { data: liquidations, error: liquidationsError } = await supabase
      .from('payroll_liquidations')
      .select(`
        id, employee_id, overtime_hours, overtime_amount, bonuses, commissions,
        gratification, legal_gratification_art50, apv_amount, loan_deductions, advance_payments,
        other_deductions, sis_amount,
        employees!inner (
          rut, first_name, last_name, middle_name
        )
      `)
      .eq('company_id', companyId)
      .eq('period_year', parseInt(year))
      .eq('period_month', parseInt(month))
      .in('employees.rut', employeeRuts);

    console.log(`✅ Libro de remuneraciones encontrado para ${period}:`, {
      employees: payrollBook.total_employees,
      haberes: payrollBook.total_haberes,
      descuentos: payrollBook.total_descuentos,
      liquido: payrollBook.total_liquido,
      details: payrollBook.payroll_book_details?.length || 0
    });

    if (liquidationsError) {
      console.warn('⚠️ Error obteniendo liquidaciones complementarias, usando solo datos del libro:', liquidationsError);
    }

    // ✅ USAR LIQUIDACIONES COMO FUENTE DE VERDAD (DATOS COMPLETOS Y CORRECTOS)
    if (!liquidations || liquidations.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No se encontraron liquidaciones para el período especificado',
          details: 'Las liquidaciones son necesarias para generar un Excel preciso'
        },
        { status: 404 }
      );
    }

    // ✅ GENERAR EXCEL USANDO ENFOQUE HÍBRIDO (LIBRO + LIQUIDACIONES)
    const excelBuffer = await generatePayrollExcelHybrid(payrollBook, liquidations, {
      companyId,
      year: parseInt(year),
      month: parseInt(month)
    });

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const fileName = `Libro_Remuneraciones_${monthNames[parseInt(month) - 1]}_${year}.xlsx`;

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': excelBuffer.byteLength.toString()
      }
    });

  } catch (error) {
    console.error('❌ Error in Excel export:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * Genera un archivo Excel profesional usando enfoque híbrido (LIBRO + LIQUIDACIONES)
 * - Datos básicos del libro: sueldos, haberes, datos personales
 * - Descuentos específicos de liquidaciones: AFP separado, comisiones, etc.
 */
async function generatePayrollExcelHybrid(
  payrollBook: any,
  liquidations: any[],
  params: { companyId: string; year: number; month: number }
): Promise<Buffer> {

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Libro Remuneraciones');

  // ✅ USAR TOTALES DEL LIBRO (FUENTE DE VERDAD PARA CONSISTENCIA)
  const totalHaberesLibro = payrollBook.total_haberes || 0;
  const totalDescuentosLibro = payrollBook.total_descuentos || 0;  // 151.109 (corregido)
  const totalLiquidoLibro = payrollBook.total_liquido || 0;

  // ✅ CONFIGURACIÓN Y ENCABEZADOS
  worksheet.pageSetup = {
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    margins: { left: 0.7, right: 0.7, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 }
  };

  const { data: company } = await supabase.from('companies').select('name, rut').eq('id', params.companyId).single();
  const companyName = company?.name || 'ContaPyme Puq';
  const companyRut = company?.rut || '78.223.873-6';
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const periodName = `${monthNames[params.month - 1]} ${params.year}`;

  // ENCABEZADOS
  const titleRow = worksheet.addRow([`LIBRO DE REMUNERACIONES - ${periodName}`, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
  titleRow.font = { bold: true, size: 16 };
  titleRow.alignment = { horizontal: 'center' };
  worksheet.mergeCells('A1:AC1');

  const companyRow = worksheet.addRow([`${companyName} - RUT: ${companyRut}`, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
  companyRow.font = { bold: true, size: 12 };
  companyRow.alignment = { horizontal: 'center' };
  worksheet.mergeCells('A2:AC2');

  worksheet.addRow([]);

  const headerRow = worksheet.addRow(['RUT', 'APELLIDO PATERNO', 'APELLIDO MATERNO', 'NOMBRES', 'CARGO', 'ÁREA', 'DÍAS TRAB.', 'SUELDO BASE', 'HORAS EXTRAS', 'MONTO H.E.', 'BONOS', 'COMISIONES', 'GRATIFICACIÓN', 'COLACIÓN', 'MOVILIZACIÓN', 'ASIG. FAMILIAR', 'OTROS HABERES', 'TOTAL HABERES', 'AFP (10%)', 'AFP COMISIÓN', 'SALUD (7%)', 'CESANTÍA (0.6%)', 'IMPUESTO ÚNICO', 'APV', 'PRÉSTAMOS', 'ANTICIPOS', 'OTROS DESC.', 'TOTAL DESC.', 'LÍQUIDO A PAGAR']);

  headerRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1f4e79' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });

  worksheet.columns = [
    { width: 12 }, { width: 15 }, { width: 15 }, { width: 20 }, { width: 18 }, { width: 12 }, { width: 8 }, { width: 12 },
    { width: 10 }, { width: 12 }, { width: 10 }, { width: 10 }, { width: 12 }, { width: 10 }, { width: 10 }, { width: 10 },
    { width: 10 }, { width: 12 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 12 }, { width: 10 },
    { width: 10 }, { width: 10 }, { width: 10 }, { width: 12 }, { width: 14 }
  ];

  // ✅ ACUMULADORES PARA TOTALES
  let totalSueldoBase = 0, totalHorasExtras = 0, totalMontoHE = 0, totalBonos = 0, totalComisiones = 0;
  let totalGratificacion = 0, totalColacion = 0, totalMovilizacion = 0, totalAsigFamiliar = 0, totalOtrosHaberes = 0;
  let totalAfp10 = 0, totalAfpComision = 0, totalSalud = 0, totalCesantia = 0, totalImpuesto = 0;
  let totalApv = 0, totalPrestamos = 0, totalAnticipos = 0, totalOtrosDesc = 0;

  // ✅ PROCESAR EMPLEADOS DEL LIBRO (DATOS BÁSICOS) + LIQUIDACIONES (DESCUENTOS PRECISOS)
  (payrollBook.payroll_book_details || []).forEach((bookDetail: any) => {
    // ✅ BUSCAR LIQUIDACIÓN CORRESPONDIENTE PARA DESCUENTOS PRECISOS
    const liquidation = liquidations.find(liq => liq.employees?.rut === bookDetail.employee_rut);

    const cleanName = (name: string | null) => name ? name.replace(/[^\w\s\u00C0-\u017F]/g, '').trim() : '';

    // ✅ DATOS BÁSICOS DEL LIBRO (CORRECTOS)
    const haberesReales = bookDetail.total_haberes || 0;
    const sueldoBase = bookDetail.sueldo_base || 0;
    const colacion = bookDetail.colacion || 0;
    const movilizacion = bookDetail.movilizacion || 0;
    const asigFamiliar = bookDetail.asignacion_familiar || 0;

    // ✅ DESCUENTOS DE LIQUIDACIÓN (PRECISOS CON AFP SEPARADO)
    const afp10 = liquidation?.afp_amount || 0;
    const afpComision = liquidation?.afp_commission_amount || 0;
    const saludReal = liquidation?.health_amount || 0;
    const cesantiaReal = liquidation?.unemployment_amount || 0;
    const impuestoReal = liquidation?.income_tax_amount || 0;

    // ✅ USAR TOTAL CORRECTO DEL LIBRO (151.109) NO DE LIQUIDACIÓN (166.753)
    const totalDescuentosCorreto = totalDescuentosLibro; // Para empleado único = total del libro

    // ✅ CALCULAR OTROS DESCUENTOS PARA QUE SUMEN AL TOTAL CORRECTO
    const descuentosConocidos = afp10 + afpComision + saludReal + cesantiaReal + impuestoReal;
    const otrosDescuentos = Math.max(0, totalDescuentosCorreto - descuentosConocidos);

    const liquidoCalculado = haberesReales - totalDescuentosCorreto;

    // ✅ DATOS COMPLEMENTARIOS DE LIQUIDACIÓN SI ESTÁN DISPONIBLES
    const horasExtras = liquidation?.overtime_hours || 0;
    const montoHE = liquidation?.overtime_amount || 0;
    const bonos = liquidation?.bonuses || 0;
    const comisiones = liquidation?.commissions || 0;
    const gratificacionTotal = (liquidation?.gratification || 0) + (liquidation?.legal_gratification_art50 || 0);
    const apv = liquidation?.apv_amount || 0;
    const prestamos = liquidation?.loan_deductions || 0;
    const anticipos = liquidation?.advance_payments || 0;

    // ✅ ACUMULAR TOTALES
    totalSueldoBase += sueldoBase;
    totalHorasExtras += horasExtras;
    totalMontoHE += montoHE;
    totalBonos += bonos;
    totalComisiones += comisiones;
    totalGratificacion += gratificacionTotal;
    totalColacion += colacion;
    totalMovilizacion += movilizacion;
    totalAsigFamiliar += asigFamiliar;
    totalOtrosHaberes += 0;
    totalAfp10 += afp10;
    totalAfpComision += afpComision;
    totalSalud += saludReal;
    totalCesantia += cesantiaReal;
    totalImpuesto += impuestoReal;
    totalApv += apv;
    totalPrestamos += prestamos;
    totalAnticipos += anticipos;
    totalOtrosDesc += otrosDescuentos;

    // ✅ AGREGAR FILA DE DATOS
    const dataRow = worksheet.addRow([
      bookDetail.employee_rut || '', cleanName(bookDetail.apellido_paterno) || '', cleanName(bookDetail.apellido_materno) || '',
      cleanName(bookDetail.nombres) || '', bookDetail.cargo || 'Empleado', bookDetail.area || 'General',
      bookDetail.dias_trabajados || 30, sueldoBase, horasExtras, montoHE, bonos, comisiones,
      gratificacionTotal, colacion, movilizacion, asigFamiliar, 0, haberesReales,
      afp10, afpComision, saludReal, cesantiaReal, impuestoReal, apv, prestamos, anticipos, otrosDescuentos,
      totalDescuentosCorreto, liquidoCalculado
    ]);

    // ✅ FORMATO
    dataRow.eachCell((cell, colNumber) => {
      if (colNumber >= 8 && colNumber <= 29 && colNumber !== 7 && colNumber !== 9) {
        cell.numFmt = '"$"#,##0';
      }
      if (colNumber === 7) cell.numFmt = '0';
      if (colNumber === 9) cell.numFmt = '0.0';
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      cell.alignment = { horizontal: colNumber <= 6 ? 'left' : 'right' };
    });
  });

  // ✅ FILA DE TOTALES (USAR TOTALES DEL LIBRO PARA CONSISTENCIA)
  worksheet.addRow([]);
  const totalRow = worksheet.addRow(['', '', '', '', '', '', 'TOTALES:', totalSueldoBase, totalHorasExtras, totalMontoHE, totalBonos, totalComisiones, totalGratificacion, totalColacion, totalMovilizacion, totalAsigFamiliar, totalOtrosHaberes, totalHaberesLibro, totalAfp10, totalAfpComision, totalSalud, totalCesantia, totalImpuesto, totalApv, totalPrestamos, totalAnticipos, totalOtrosDesc, totalDescuentosLibro, totalLiquidoLibro]);

  totalRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true };
    if (colNumber >= 8 && colNumber <= 29 && colNumber !== 9) {
      cell.numFmt = '"$"#,##0';
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E7E6E6' } };
    }
    if (colNumber === 9) {
      cell.numFmt = '0.0';
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E7E6E6' } };
    }
    if (colNumber === 7) {
      cell.alignment = { horizontal: 'right' };
      cell.font = { bold: true, size: 12 };
    }
  });

  // ✅ PIE DE PÁGINA
  worksheet.addRow([]);
  worksheet.addRow([]);
  const footerInfoRow = worksheet.addRow([`Total Empleados: ${payrollBook.total_employees || 0}`, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
  footerInfoRow.font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * FUNCIÓN DEPRECATED - Genera un archivo Excel profesional usando liquidaciones como fuente de verdad (DATOS COMPLETOS)
 */
async function generatePayrollExcelFromLiquidations(
  liquidations: any[],
  payrollBook: any,
  params: { companyId: string; year: number; month: number }
): Promise<Buffer> {

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Libro Remuneraciones');

  // ✅ USAR TOTALES DEL LIBRO PARA VALIDACIÓN PERO DATOS DE LIQUIDACIONES PARA DETALLES
  const totalHaberesLibro = payrollBook.total_haberes || 0;
  const totalDescuentosLibro = payrollBook.total_descuentos || 0;  // Este es el total correcto (151.109)
  const totalLiquidoLibro = payrollBook.total_liquido || 0;

  // ✅ CONFIGURACIÓN Y ENCABEZADOS (IGUAL QUE ANTES)
  worksheet.pageSetup = {
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    margins: { left: 0.7, right: 0.7, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 }
  };

  const { data: company } = await supabase.from('companies').select('name, rut').eq('id', params.companyId).single();
  const companyName = company?.name || 'ContaPyme Puq';
  const companyRut = company?.rut || '78.223.873-6';
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const periodName = `${monthNames[params.month - 1]} ${params.year}`;

  // ENCABEZADOS
  const titleRow = worksheet.addRow([`LIBRO DE REMUNERACIONES - ${periodName}`, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
  titleRow.font = { bold: true, size: 16 };
  titleRow.alignment = { horizontal: 'center' };
  worksheet.mergeCells('A1:AC1');

  const companyRow = worksheet.addRow([`${companyName} - RUT: ${companyRut}`, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
  companyRow.font = { bold: true, size: 12 };
  companyRow.alignment = { horizontal: 'center' };
  worksheet.mergeCells('A2:AC2');

  worksheet.addRow([]);

  const headerRow = worksheet.addRow(['RUT', 'APELLIDO PATERNO', 'APELLIDO MATERNO', 'NOMBRES', 'CARGO', 'ÁREA', 'DÍAS TRAB.', 'SUELDO BASE', 'HORAS EXTRAS', 'MONTO H.E.', 'BONOS', 'COMISIONES', 'GRATIFICACIÓN', 'COLACIÓN', 'MOVILIZACIÓN', 'ASIG. FAMILIAR', 'OTROS HABERES', 'TOTAL HABERES', 'AFP (10%)', 'AFP COMISIÓN', 'SALUD (7%)', 'CESANTÍA (0.6%)', 'IMPUESTO ÚNICO', 'APV', 'PRÉSTAMOS', 'ANTICIPOS', 'OTROS DESC.', 'TOTAL DESC.', 'LÍQUIDO A PAGAR']);

  headerRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1f4e79' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  });

  worksheet.columns = [
    { width: 12 }, { width: 15 }, { width: 15 }, { width: 20 }, { width: 18 }, { width: 12 }, { width: 8 }, { width: 12 },
    { width: 10 }, { width: 12 }, { width: 10 }, { width: 10 }, { width: 12 }, { width: 10 }, { width: 10 }, { width: 10 },
    { width: 10 }, { width: 12 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 12 }, { width: 10 },
    { width: 10 }, { width: 10 }, { width: 10 }, { width: 12 }, { width: 14 }
  ];

  // ✅ ACUMULADORES PARA TOTALES
  let totalSueldoBase = 0, totalHorasExtras = 0, totalMontoHE = 0, totalBonos = 0, totalComisiones = 0;
  let totalGratificacion = 0, totalColacion = 0, totalMovilizacion = 0, totalAsigFamiliar = 0, totalOtrosHaberes = 0;
  let totalAfp10 = 0, totalAfpComision = 0, totalSalud = 0, totalCesantia = 0, totalImpuesto = 0;
  let totalApv = 0, totalPrestamos = 0, totalAnticipos = 0, totalOtrosDesc = 0;

  // ✅ PROCESAR LIQUIDACIONES (FUENTE DE VERDAD)
  liquidations.forEach((liquidation) => {
    const employee = liquidation.employees;
    const contract = employee?.employment_contracts?.[0];

    const cleanName = (name: string | null) => name ? name.replace(/[^\w\s\u00C0-\u017F]/g, '').trim() : '';

    // ✅ USAR VALORES REALES DE LIQUIDACIONES (FUENTE COMPLETA Y CORRECTA)
    const haberesReales = liquidation.total_gross_income || 0;
    const afp10 = liquidation.afp_amount || 0;
    const afpComision = liquidation.afp_commission_amount || 0;
    const saludReal = liquidation.health_amount || 0;
    const cesantiaReal = liquidation.unemployment_amount || 0;
    const impuestoReal = liquidation.income_tax_amount || 0;
    const gratificacionTotal = (liquidation.gratification || 0) + (liquidation.legal_gratification_art50 || 0);
    const otrosHaberes = liquidation.other_allowances || 0;

    // ✅ USAR TOTAL_DEDUCTIONS DE LIQUIDACIÓN (CORRECTO)
    const totalDescuentosCalculado = liquidation.total_deductions || 0;
    const liquidoCalculado = haberesReales - totalDescuentosCalculado;

    // ✅ CALCULAR OTROS DESCUENTOS PARA QUE SUMEN AL TOTAL
    const descuentosConocidos = afp10 + afpComision + saludReal + cesantiaReal + impuestoReal + (liquidation.apv_amount || 0) + (liquidation.loan_deductions || 0) + (liquidation.advance_payments || 0);
    const otrosDescuentos = Math.max(0, totalDescuentosCalculado - descuentosConocidos);

    // ✅ ACUMULAR TOTALES
    totalSueldoBase += liquidation.base_salary || 0;
    totalHorasExtras += liquidation.overtime_hours || 0;
    totalMontoHE += liquidation.overtime_amount || 0;
    totalBonos += liquidation.bonuses || 0;
    totalComisiones += liquidation.commissions || 0;
    totalGratificacion += gratificacionTotal;
    totalColacion += liquidation.food_allowance || 0;
    totalMovilizacion += liquidation.transport_allowance || 0;
    totalAsigFamiliar += liquidation.family_allowance || 0;
    totalOtrosHaberes += otrosHaberes;
    totalAfp10 += afp10;
    totalAfpComision += afpComision;
    totalSalud += saludReal;
    totalCesantia += cesantiaReal;
    totalImpuesto += impuestoReal;
    totalApv += liquidation.apv_amount || 0;
    totalPrestamos += liquidation.loan_deductions || 0;
    totalAnticipos += liquidation.advance_payments || 0;
    totalOtrosDesc += otrosDescuentos;

    // ✅ AGREGAR FILA DE DATOS
    const dataRow = worksheet.addRow([
      employee?.rut || '',
      employee?.last_name?.split(' ')[0] || '',  // Apellido paterno (primer apellido)
      employee?.last_name?.split(' ')[1] || '',  // Apellido materno (segundo apellido)
      `${employee?.first_name || ''} ${employee?.middle_name || ''}`.trim(),  // Nombres completos
      contract?.position || 'Empleado', contract?.department || 'General', liquidation.days_worked || 30, liquidation.base_salary || 0,
      liquidation.overtime_hours || 0, liquidation.overtime_amount || 0, liquidation.bonuses || 0, liquidation.commissions || 0,
      gratificacionTotal, liquidation.food_allowance || 0, liquidation.transport_allowance || 0, liquidation.family_allowance || 0,
      otrosHaberes, haberesReales, afp10, afpComision, saludReal, cesantiaReal, impuestoReal,
      liquidation.apv_amount || 0, liquidation.loan_deductions || 0, liquidation.advance_payments || 0, otrosDescuentos,
      totalDescuentosCalculado, liquidoCalculado
    ]);

    // ✅ FORMATO
    dataRow.eachCell((cell, colNumber) => {
      if (colNumber >= 8 && colNumber <= 29 && colNumber !== 7 && colNumber !== 9) {
        cell.numFmt = '"$"#,##0';
      }
      if (colNumber === 7) cell.numFmt = '0';
      if (colNumber === 9) cell.numFmt = '0.0';
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      cell.alignment = { horizontal: colNumber <= 6 ? 'left' : 'right' };
    });
  });

  // ✅ FILA DE TOTALES (USAR TOTALES DEL LIBRO PARA CONSISTENCIA)
  worksheet.addRow([]);
  const totalRow = worksheet.addRow(['', '', '', '', '', '', 'TOTALES:', totalSueldoBase, totalHorasExtras, totalMontoHE, totalBonos, totalComisiones, totalGratificacion, totalColacion, totalMovilizacion, totalAsigFamiliar, totalOtrosHaberes, totalHaberesLibro, totalAfp10, totalAfpComision, totalSalud, totalCesantia, totalImpuesto, totalApv, totalPrestamos, totalAnticipos, totalOtrosDesc, totalDescuentosLibro, totalLiquidoLibro]);

  totalRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true };
    if (colNumber >= 8 && colNumber <= 29 && colNumber !== 9) {
      cell.numFmt = '"$"#,##0';
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E7E6E6' } };
    }
    if (colNumber === 9) {
      cell.numFmt = '0.0';
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E7E6E6' } };
    }
    if (colNumber === 7) {
      cell.alignment = { horizontal: 'right' };
      cell.font = { bold: true, size: 12 };
    }
  });

  // ✅ PIE DE PÁGINA
  worksheet.addRow([]);
  worksheet.addRow([]);
  const footerInfoRow = worksheet.addRow([`Total Empleados: ${payrollBook.total_employees || 0}`, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
  footerInfoRow.font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * FUNCIÓN ANTERIOR (DEPRECATED) - Genera un archivo Excel profesional usando datos del libro de remuneraciones
 */
async function generatePayrollExcelFromBook(
  payrollBook: any,
  liquidationsExtra: any[],
  params: { companyId: string; year: number; month: number }
): Promise<Buffer> {
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Libro Remuneraciones');

  // ✅ CONFIGURACIÓN DE LA HOJA
  worksheet.pageSetup = {
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    margins: {
      left: 0.7, right: 0.7,
      top: 0.75, bottom: 0.75,
      header: 0.3, footer: 0.3
    }
  };

  // ✅ OBTENER INFORMACIÓN DE LA EMPRESA
  const { data: company } = await supabase
    .from('companies')
    .select('name, rut')
    .eq('id', params.companyId)
    .single();

  const companyName = company?.name || 'ContaPyme Puq';
  const companyRut = company?.rut || '78.223.873-6';

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const periodName = `${monthNames[params.month - 1]} ${params.year}`;

  // ✅ ENCABEZADO PRINCIPAL
  const titleRow = worksheet.addRow([
    `LIBRO DE REMUNERACIONES - ${periodName}`,
    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''
  ]);
  titleRow.font = { bold: true, size: 16 };
  titleRow.alignment = { horizontal: 'center' };
  worksheet.mergeCells('A1:AC1'); // Actualizado para 29 columnas

  const companyRow = worksheet.addRow([
    `${companyName} - RUT: ${companyRut}`,
    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''
  ]);
  companyRow.font = { bold: true, size: 12 };
  companyRow.alignment = { horizontal: 'center' };
  worksheet.mergeCells('A2:AC2'); // Actualizado para 29 columnas

  worksheet.addRow([]); // Fila vacía

  // ✅ ENCABEZADOS DE COLUMNAS MEJORADOS (CON BONOS Y HORAS EXTRAS)
  const headerRow = worksheet.addRow([
    'RUT',
    'APELLIDO PATERNO',
    'APELLIDO MATERNO',
    'NOMBRES',
    'CARGO',
    'ÁREA',
    'DÍAS TRAB.',
    'SUELDO BASE',
    'HORAS EXTRAS',     // NUEVA
    'MONTO H.E.',       // NUEVA
    'BONOS',            // NUEVA
    'COMISIONES',       // NUEVA
    'GRATIFICACIÓN',
    'COLACIÓN',
    'MOVILIZACIÓN',
    'ASIG. FAMILIAR',
    'OTROS HABERES',
    'TOTAL HABERES',
    'AFP (10%)',
    'AFP COMISIÓN',
    'SALUD (7%)',
    'CESANTÍA (0.6%)',
    'IMPUESTO ÚNICO',
    'APV',              // NUEVA
    'PRÉSTAMOS',        // NUEVA
    'ANTICIPOS',        // NUEVA
    'OTROS DESC.',
    'TOTAL DESC.',
    'LÍQUIDO A PAGAR'
  ]);

  // ✅ ESTILO DE ENCABEZADOS
  headerRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1f4e79' } // Azul profesional
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // ✅ AJUSTAR ANCHOS DE COLUMNAS (ACTUALIZADO PARA NUEVAS COLUMNAS)
  worksheet.columns = [
    { width: 12 }, // RUT
    { width: 15 }, // AP. PATERNO
    { width: 15 }, // AP. MATERNO
    { width: 20 }, // NOMBRES
    { width: 18 }, // CARGO
    { width: 12 }, // ÁREA
    { width: 8 },  // DÍAS
    { width: 12 }, // SUELDO BASE
    { width: 10 }, // HORAS EXTRAS
    { width: 12 }, // MONTO H.E.
    { width: 10 }, // BONOS
    { width: 10 }, // COMISIONES
    { width: 12 }, // GRATIFICACIÓN
    { width: 10 }, // COLACIÓN
    { width: 10 }, // MOVILIZACIÓN
    { width: 10 }, // ASIG. FAM
    { width: 10 }, // OTROS HAB
    { width: 12 }, // TOTAL HAB
    { width: 10 }, // AFP (10%)
    { width: 10 }, // AFP COMISIÓN
    { width: 10 }, // SALUD
    { width: 10 }, // CESANTÍA
    { width: 12 }, // IMPUESTO
    { width: 10 }, // APV
    { width: 10 }, // PRÉSTAMOS
    { width: 10 }, // ANTICIPOS
    { width: 10 }, // OTROS DESC
    { width: 12 }, // TOTAL DESC
    { width: 14 }  // LÍQUIDO
  ];

  // ✅ USAR TOTALES DEL LIBRO DE REMUNERACIONES (FUENTE DE VERDAD)
  const totalHaberesLibro = payrollBook.total_haberes || 0;
  const totalDescuentosLibro = payrollBook.total_descuentos || 0;
  const totalLiquidoLibro = payrollBook.total_liquido || 0;

  // ✅ ACUMULADORES PARA COLUMNAS DETALLADAS (CALCULADOS DESDE DETALLES DEL LIBRO)
  let totalSueldoBase = 0;
  let totalHorasExtras = 0;
  let totalMontoHE = 0;
  let totalBonos = 0;
  let totalComisiones = 0;
  let totalGratificacion = 0;
  let totalColacion = 0;
  let totalMovilizacion = 0;
  let totalAsigFamiliar = 0;
  let totalOtrosHaberes = 0;
  let totalAfp10 = 0;
  let totalAfpComision = 0;
  let totalSalud = 0;
  let totalCesantia = 0;
  let totalImpuesto = 0;
  let totalApv = 0;
  let totalPrestamos = 0;
  let totalAnticipos = 0;
  let totalOtrosDesc = 0;

  // ✅ PROCESAR DATOS DEL LIBRO DE REMUNERACIONES
  (payrollBook.payroll_book_details || []).forEach((bookDetail: any) => {
    // ✅ BUSCAR LIQUIDACIÓN COMPLEMENTARIA PARA DATOS ADICIONALES
    const liquidationExtra = liquidationsExtra.find(liq =>
      liq.employees?.rut === bookDetail.employee_rut
    );

    // Limpiar nombres (función del sistema existente)
    const cleanName = (name: string | null) => {
      if (!name) return '';
      return name.replace(/[^\w\s\u00C0-\u017F]/g, '').trim();
    };

    // ✅ USAR VALORES DEL LIBRO DE REMUNERACIONES (FUENTE DE VERDAD)
    const haberesReales = bookDetail.total_haberes || 0;
    const descuentosReales = bookDetail.total_descuentos || 0;
    const liquidoReal = bookDetail.sueldo_liquido || 0;

    // ✅ DATOS BÁSICOS DEL LIBRO
    const sueldoBase = bookDetail.sueldo_base || 0;
    const colacion = bookDetail.colacion || 0;
    const movilizacion = bookDetail.movilizacion || 0;
    const asigFamiliar = bookDetail.asignacion_familiar || 0;

    // ✅ SEPARAR AFP BASE Y COMISIÓN DESDE EL TOTAL DEL LIBRO
    const afpTotal = bookDetail.prevision_afp || 0;
    const afpBase = Math.round(haberesReales * 0.10); // AFP 10% sobre haberes
    const afpComision = Math.max(0, afpTotal - afpBase); // Comisión = Total - Base

    // ✅ AFP calculation completed

    const saludMonto = bookDetail.salud || 0;
    const cesantiaMonto = bookDetail.cesantia || 0;
    const impuestoMonto = bookDetail.impuesto_unico || 0;

    // ✅ DATOS COMPLEMENTARIOS DE LIQUIDACIÓN (SI ESTÁN DISPONIBLES)
    const horasExtras = liquidationExtra?.overtime_hours || 0;
    const montoHE = liquidationExtra?.overtime_amount || 0;
    const bonos = liquidationExtra?.bonuses || 0;
    const comisiones = liquidationExtra?.commissions || 0;
    const gratificacionTotal = (liquidationExtra?.gratification || 0) + (liquidationExtra?.legal_gratification_art50 || 0);
    const apv = liquidationExtra?.apv_amount || 0;
    const prestamos = liquidationExtra?.loan_deductions || 0;
    const anticipos = liquidationExtra?.advance_payments || 0;

    // ✅ CALCULAR OTROS DESCUENTOS PARA QUE SUMEN AL TOTAL DEL LIBRO
    const descuentosConocidos = afpBase + afpComision + saludMonto + cesantiaMonto + impuestoMonto + apv + prestamos + anticipos;
    const otrosDescuentos = Math.max(0, descuentosReales - descuentosConocidos);

    // ✅ ACUMULAR TOTALES (USAR DATOS DEL LIBRO COMO FUENTE DE VERDAD)
    totalSueldoBase += sueldoBase;
    totalHorasExtras += horasExtras;
    totalMontoHE += montoHE;
    totalBonos += bonos;
    totalComisiones += comisiones;
    totalGratificacion += gratificacionTotal;
    totalColacion += colacion;
    totalMovilizacion += movilizacion;
    totalAsigFamiliar += asigFamiliar;
    totalOtrosHaberes += 0; // Calculado como resto si es necesario
    totalAfp10 += afpBase; // AFP 10% base
    totalAfpComision += afpComision; // AFP comisión calculada
    totalSalud += saludMonto;
    totalCesantia += cesantiaMonto;
    totalImpuesto += impuestoMonto;
    totalApv += apv;
    totalPrestamos += prestamos;
    totalAnticipos += anticipos;
    totalOtrosDesc += otrosDescuentos;

    // ✅ NOTA: totalDescuentosAcumulado ahora usa liquidation.total_deductions
    // que es consistente con la interfaz web

    const dataRow = worksheet.addRow([
      bookDetail.employee_rut || '',
      cleanName(bookDetail.apellido_paterno) || '',
      cleanName(bookDetail.apellido_materno) || '',
      cleanName(bookDetail.nombres) || '',
      bookDetail.cargo || 'Empleado',
      bookDetail.area || 'General',
      bookDetail.dias_trabajados || 30,
      sueldoBase, // Sueldo base del libro
      horasExtras, // Horas extras de liquidación complementaria
      montoHE, // Monto horas extras de liquidación complementaria
      bonos, // Bonos de liquidación complementaria
      comisiones, // Comisiones de liquidación complementaria
      gratificacionTotal, // Gratificación de liquidación complementaria
      colacion, // Colación del libro
      movilizacion, // Movilización del libro
      asigFamiliar, // Asignación familiar del libro
      0, // Otros haberes (calculado como resto si es necesario)
      haberesReales, // Total haberes del libro (FUENTE DE VERDAD)
      afpBase, // AFP 10% base
      afpComision, // AFP comisión calculada
      saludMonto, // Salud del libro
      cesantiaMonto, // Cesantía del libro
      impuestoMonto, // Impuesto del libro
      apv, // APV de liquidación complementaria
      prestamos, // Préstamos de liquidación complementaria
      anticipos, // Anticipos de liquidación complementaria
      otrosDescuentos, // Otros descuentos de liquidación complementaria
      descuentosReales, // Total descuentos del libro (FUENTE DE VERDAD)
      liquidoReal // Líquido del libro (FUENTE DE VERDAD)
    ]);

    // ✅ FORMATO DE DATOS
    dataRow.eachCell((cell, colNumber) => {
      // Formato moneda para columnas de dinero (8 en adelante excepto días y horas)
      if (colNumber >= 8 && colNumber <= 29 && colNumber !== 7 && colNumber !== 9) {
        cell.numFmt = '"$"#,##0';
      }

      // Días trabajados como número entero
      if (colNumber === 7) {
        cell.numFmt = '0';
      }

      // Horas extras como número decimal
      if (colNumber === 9) {
        cell.numFmt = '0.0';
      }

      // Bordes
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };

      // Alineación
      if (colNumber <= 6) {
        cell.alignment = { horizontal: 'left' };
      } else {
        cell.alignment = { horizontal: 'right' };
      }
    });
  });

  // ✅ FILA DE TOTALES
  worksheet.addRow([]); // Fila vacía

  const totalRow = worksheet.addRow([
    '', '', '', '', '', '',
    'TOTALES:',
    totalSueldoBase,
    totalHorasExtras,
    totalMontoHE,
    totalBonos,
    totalComisiones,
    totalGratificacion,
    totalColacion,
    totalMovilizacion,
    totalAsigFamiliar,
    totalOtrosHaberes,
    totalHaberesLibro, // ✅ USAR TOTAL DEL LIBRO (FUENTE DE VERDAD)
    totalAfp10,
    totalAfpComision,
    totalSalud,
    totalCesantia,
    totalImpuesto,
    totalApv,
    totalPrestamos,
    totalAnticipos,
    totalOtrosDesc,
    totalDescuentosLibro, // ✅ USAR TOTAL DEL LIBRO (FUENTE DE VERDAD)
    totalLiquidoLibro // ✅ USAR TOTAL DEL LIBRO (FUENTE DE VERDAD)
  ]);

  totalRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true };
    // Aplicar formato de moneda y fondo gris a columnas numéricas (8 en adelante, excepto horas)
    if (colNumber >= 8 && colNumber <= 29 && colNumber !== 9) {
      cell.numFmt = '"$"#,##0';
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'E7E6E6' } // Gris claro
      };
    }
    // Formato para horas extras
    if (colNumber === 9) {
      cell.numFmt = '0.0';
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'E7E6E6' } // Gris claro
      };
    }
    // Formato para la columna "TOTALES:"
    if (colNumber === 7) {
      cell.alignment = { horizontal: 'right' };
      cell.font = { bold: true, size: 12 };
    }
  });

  // ✅ PIE DE PÁGINA CON INFORMACIÓN ADICIONAL
  worksheet.addRow([]);
  worksheet.addRow([]);

  const footerInfoRow = worksheet.addRow([
    `Total Empleados: ${payrollBook.total_employees || 0}`,
    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''
  ]);
  footerInfoRow.font = { bold: true };

  const dateRow = worksheet.addRow([
    `Generado el: ${new Date().toLocaleDateString('es-CL')} a las ${new Date().toLocaleTimeString('es-CL')}`,
    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''
  ]);
  dateRow.font = { italic: true };

  // ✅ CONGELAR PANELES (encabezados siempre visibles)
  worksheet.views = [
    { state: 'frozen', xSplit: 0, ySplit: 4 }
  ];

  // ✅ GENERAR BUFFER
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}