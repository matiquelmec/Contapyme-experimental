import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');
    const employeeId = params.id;

    console.log('🔍 [DEBUG] Employee ID:', employeeId);
    console.log('🔍 [DEBUG] Company ID:', companyId);

    // 1. Verificar empleado
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employeeId)
      .single();

    console.log('👤 [DEBUG] Employee found:', employee ? 'YES' : 'NO');
    console.log('👤 [DEBUG] Employee data:', employee);
    console.log('❌ [DEBUG] Employee error:', empError);

    // 2. Verificar contratos
    const { data: contracts, error: contractError } = await supabase
      .from('employment_contracts')
      .select('*')
      .eq('employee_id', employeeId);

    console.log('📄 [DEBUG] Contracts found:', contracts?.length || 0);
    console.log('📄 [DEBUG] Contracts data:', contracts);
    console.log('❌ [DEBUG] Contract error:', contractError);

    // 3. Verificar configuración previsional
    const { data: payrollConfigs, error: payrollError } = await supabase
      .from('payroll_config')
      .select('*')
      .eq('employee_id', employeeId);

    console.log('⚙️ [DEBUG] Payroll configs found:', payrollConfigs?.length || 0);
    console.log('⚙️ [DEBUG] Payroll configs data:', payrollConfigs);
    console.log('❌ [DEBUG] Payroll error:', payrollError);

    // 4. Verificar tablas existentes
    const { data: tables, error: tablesError } = await supabase.rpc('get_table_names');
    console.log('🗃️ [DEBUG] Available tables:', tables);

    return NextResponse.json({
      success: true,
      debug: {
        employeeId,
        companyId,
        employee: employee || null,
        contracts: contracts || [],
        payrollConfigs: payrollConfigs || [],
        errors: {
          employee: empError,
          contracts: contractError,
          payroll: payrollError,
          tables: tablesError
        },
        availableTables: tables
      }
    });

  } catch (error) {
    console.error('🚨 [DEBUG] Critical error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    });
  }
}