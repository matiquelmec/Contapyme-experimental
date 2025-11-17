import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseConnection, isSupabaseConfigured } from '@/lib/database/databaseSimple';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');
    const period = searchParams.get('period');

    console.log('📊 EXPORT BATCH - Params:', { companyId, period });

    if (!companyId || !period) {
      return NextResponse.json(
        { success: false, error: 'company_id y period son requeridos' },
        { status: 400 }
      );
    }

    // ✅ Verificar configuración Supabase
    if (!isSupabaseConfigured()) {
      console.error('❌ Supabase no configurado correctamente en export batch');
      return NextResponse.json(
        {
          success: false,
          error: 'Base de datos no configurada. Verifica SUPABASE_SERVICE_ROLE_KEY en variables de entorno.',
          code: 'SUPABASE_NOT_CONFIGURED'
        },
        { status: 503 }
      );
    }

    const supabase = getDatabaseConnection();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Error de configuración de base de datos', code: 'DB_CONNECTION_ERROR' },
        { status: 503 }
      );
    }

    // Extraer año y mes del período
    const [year, month] = period.split('-');
    if (!year || !month) {
      return NextResponse.json(
        { success: false, error: 'Formato de período inválido. Use YYYY-MM' },
        { status: 400 }
      );
    }

    // ✅ OBTENER LIQUIDACIONES DEL PERÍODO
    const { data: liquidations, error: liquidationsError } = await supabase
      .from('payroll_liquidations')
      .select(`
        *,
        employees (
          rut,
          first_name,
          last_name,
          email,
          employment_contracts!inner (
            position,
            department,
            contract_type,
            weekly_hours,
            status
          )
        )
      `)
      .eq('company_id', companyId)
      .eq('period_year', parseInt(year))
      .eq('period_month', parseInt(month))
      .eq('employees.employment_contracts.status', 'active')
      .order('created_at', { ascending: false });

    if (liquidationsError) {
      console.error('❌ Error obteniendo liquidaciones:', liquidationsError);
      return NextResponse.json(
        { success: false, error: 'Error al obtener liquidaciones', details: liquidationsError.message },
        { status: 500 }
      );
    }

    if (!liquidations || liquidations.length === 0) {
      return NextResponse.json(
        { success: false, error: `No se encontraron liquidaciones para el período ${period}` },
        { status: 404 }
      );
    }

    console.log(`✅ Liquidaciones encontradas: ${liquidations.length} para período ${period}`);

    // ✅ OBTENER INFORMACIÓN DE LA EMPRESA
    const { data: company } = await supabase
      .from('companies')
      .select('name, rut')
      .eq('id', companyId)
      .single();

    // ✅ PREPARAR DATOS PARA EXCEL
    const excelData = liquidations.map((liquidation: any) => {
      const employee = liquidation.employees;
      const contract = employee?.employment_contracts?.[0];

      // Función para limpiar caracteres especiales
      const cleanText = (text: string) => {
        if (!text) return '';
        return text
          .replace(/Ã¡/g, 'á').replace(/Ã©/g, 'é').replace(/Ã­/g, 'í')
          .replace(/Ã³/g, 'ó').replace(/Ãº/g, 'ú').replace(/Ã±/g, 'ñ')
          .replace(/�/g, 'é').trim();
      };

      // Calcular totales dinámicamente
      const totalDescuentos = (liquidation.afp_amount || 0) +
                             (liquidation.afp_commission_amount || 0) +
                             (liquidation.health_amount || 0) +
                             (liquidation.unemployment_amount || 0) +
                             (liquidation.income_tax_amount || 0) +
                             (liquidation.loan_deductions || 0) +
                             (liquidation.advance_payments || 0) +
                             (liquidation.apv_amount || 0) +
                             (liquidation.other_deductions || 0);

      const liquidoFinal = liquidation.total_gross_income - totalDescuentos;

      return {
        // Información del Empleado
        'RUT': employee?.rut || '',
        'Nombres': cleanText(employee?.first_name || ''),
        'Apellidos': cleanText(employee?.last_name || ''),
        'Email': employee?.email || '',
        'Cargo': cleanText(contract?.position || ''),
        'Departamento': cleanText(contract?.department || ''),
        'Tipo Contrato': cleanText(contract?.contract_type || ''),
        'Horas Semanales': contract?.weekly_hours || 0,

        // Período
        'Año': liquidation.period_year,
        'Mes': liquidation.period_month,
        'Días Trabajados': liquidation.days_worked || 30,

        // Haberes
        'Sueldo Base': liquidation.base_salary || 0,
        'Gratificación Art. 50': liquidation.legal_gratification_art50 || 0,
        'Horas Extras': liquidation.overtime_amount || 0,
        'Bonos': liquidation.bonuses || 0,
        'Asignación Familiar': liquidation.family_allowance || 0,
        'Colación': liquidation.food_allowance || 0,
        'Movilización': liquidation.transport_allowance || 0,
        'Otros Haberes': liquidation.other_income || 0,
        'Total Haberes': liquidation.total_gross_income || 0,

        // Descuentos Previsionales
        'AFP (10%)': liquidation.afp_amount || 0,
        'Comisión AFP': liquidation.afp_commission_amount || 0,
        'Salud (7%)': liquidation.health_amount || 0,
        'Cesantía (0.6%)': liquidation.unemployment_amount || 0,
        'APV': liquidation.apv_amount || 0,

        // Descuentos Otros
        'Impuesto Único': liquidation.income_tax_amount || 0,
        'Préstamos': liquidation.loan_deductions || 0,
        'Anticipos': liquidation.advance_payments || 0,
        'Otros Descuentos': liquidation.other_deductions || 0,
        'Total Descuentos': totalDescuentos,

        // Resultado Final
        'Líquido a Pagar': liquidoFinal,

        // Estado y Metadatos
        'Estado': liquidation.status === 'draft' ? 'Borrador' :
                 liquidation.status === 'approved' ? 'Aprobada' :
                 liquidation.status === 'paid' ? 'Pagada' : liquidation.status,
        'Fecha Creación': new Date(liquidation.created_at).toLocaleDateString('es-CL'),
        'Última Modificación': new Date(liquidation.updated_at).toLocaleDateString('es-CL'),
        'ID Liquidación': liquidation.id
      };
    });

    // ✅ CREAR WORKBOOK DE EXCEL
    const workbook = XLSX.utils.book_new();

    // Crear hoja principal con liquidaciones
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Configurar anchos de columna
    const columnWidths = [
      { wch: 15 }, // RUT
      { wch: 20 }, // Nombres
      { wch: 25 }, // Apellidos
      { wch: 30 }, // Email
      { wch: 20 }, // Cargo
      { wch: 15 }, // Departamento
      { wch: 12 }, // Tipo Contrato
      { wch: 10 }, // Horas Semanales
      { wch: 8 },  // Año
      { wch: 8 },  // Mes
      { wch: 12 }, // Días Trabajados
      { wch: 15 }, // Sueldo Base
      { wch: 15 }, // Gratificación Art. 50
      { wch: 12 }, // Horas Extras
      { wch: 12 }, // Bonos
      { wch: 15 }, // Asignación Familiar
      { wch: 12 }, // Colación
      { wch: 12 }, // Movilización
      { wch: 12 }, // Otros Haberes
      { wch: 15 }, // Total Haberes
      { wch: 12 }, // AFP
      { wch: 12 }, // Comisión AFP
      { wch: 12 }, // Salud
      { wch: 12 }, // Cesantía
      { wch: 12 }, // APV
      { wch: 12 }, // Impuesto Único
      { wch: 12 }, // Préstamos
      { wch: 12 }, // Anticipos
      { wch: 12 }, // Otros Descuentos
      { wch: 15 }, // Total Descuentos
      { wch: 15 }, // Líquido a Pagar
      { wch: 12 }, // Estado
      { wch: 15 }, // Fecha Creación
      { wch: 18 }, // Última Modificación
      { wch: 40 }  // ID Liquidación
    ];

    worksheet['!cols'] = columnWidths;

    // Agregar hoja al workbook
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const sheetName = `${monthNames[parseInt(month) - 1]} ${year}`;

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // ✅ CREAR HOJA DE RESUMEN
    const totalLiquidaciones = liquidations.length;
    const totalHaberes = excelData.reduce((sum, row) => sum + (row['Total Haberes'] || 0), 0);
    const totalDescuentos = excelData.reduce((sum, row) => sum + (row['Total Descuentos'] || 0), 0);
    const totalLiquido = excelData.reduce((sum, row) => sum + (row['Líquido a Pagar'] || 0), 0);

    const summaryData = [
      { 'Concepto': 'RESUMEN EJECUTIVO', 'Valor': '' },
      { 'Concepto': 'Empresa', 'Valor': company?.name || 'Empresa Demo' },
      { 'Concepto': 'RUT Empresa', 'Valor': company?.rut || '12.345.678-9' },
      { 'Concepto': 'Período', 'Valor': `${monthNames[parseInt(month) - 1]} ${year}` },
      { 'Concepto': 'Fecha Exportación', 'Valor': new Date().toLocaleDateString('es-CL') },
      { 'Concepto': '', 'Valor': '' },
      { 'Concepto': 'TOTALES', 'Valor': '' },
      { 'Concepto': 'Total Empleados', 'Valor': totalLiquidaciones },
      { 'Concepto': 'Total Haberes', 'Valor': totalHaberes },
      { 'Concepto': 'Total Descuentos', 'Valor': totalDescuentos },
      { 'Concepto': 'Total Líquido a Pagar', 'Valor': totalLiquido },
      { 'Concepto': '', 'Valor': '' },
      { 'Concepto': 'ESTADOS', 'Valor': '' },
      { 'Concepto': 'Borradores', 'Valor': excelData.filter(row => row['Estado'] === 'Borrador').length },
      { 'Concepto': 'Aprobadas', 'Valor': excelData.filter(row => row['Estado'] === 'Aprobada').length },
      { 'Concepto': 'Pagadas', 'Valor': excelData.filter(row => row['Estado'] === 'Pagada').length }
    ];

    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    summaryWorksheet['!cols'] = [{ wch: 25 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Resumen');

    // ✅ GENERAR BUFFER DE EXCEL
    const excelBuffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
      compression: true
    });

    console.log(`✅ Excel generado exitosamente: ${totalLiquidaciones} liquidaciones, ${excelBuffer.length} bytes`);

    // ✅ RETORNAR ARCHIVO EXCEL
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="liquidaciones_lote_${period}.xlsx"`,
        'Content-Length': excelBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('❌ Error in GET /api/payroll/liquidations/export-batch:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}