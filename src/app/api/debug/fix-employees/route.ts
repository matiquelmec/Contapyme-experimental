import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId } = body;

    if (!companyId) {
      return NextResponse.json({
        success: false,
        error: 'company_id is required'
      }, { status: 400 });
    }

    console.log('🔧 [FIX] Starting employee data fix for company:', companyId);

    // 1. Obtener todos los empleados de la empresa
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('id, first_name, last_name, email')
      .eq('company_id', companyId);

    if (empError) {
      console.error('❌ [FIX] Error getting employees:', empError);
      throw empError;
    }

    const results = [];

    for (const employee of employees) {
      console.log(`👤 [FIX] Processing ${employee.first_name} ${employee.last_name} (${employee.id})`);

      // 2. Verificar si tiene contrato
      const { data: existingContracts } = await supabase
        .from('employment_contracts')
        .select('id')
        .eq('employee_id', employee.id);

      if (!existingContracts || existingContracts.length === 0) {
        // Crear contrato por defecto
        const { data: newContract, error: contractError } = await supabase
          .from('employment_contracts')
          .insert({
            employee_id: employee.id,
            company_id: companyId,
            position: 'Empleado',
            base_salary: 500000,
            contract_type: 'indefinido',
            status: 'active',
            start_date: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (contractError) {
          console.error(`❌ [FIX] Error creating contract for ${employee.first_name}:`, contractError);
        } else {
          console.log(`✅ [FIX] Contract created for ${employee.first_name}`);
        }
      } else {
        console.log(`ℹ️ [FIX] Contract already exists for ${employee.first_name}`);
      }

      // 3. Verificar si tiene configuración previsional
      const { data: existingPayroll } = await supabase
        .from('payroll_config')
        .select('id')
        .eq('employee_id', employee.id);

      if (!existingPayroll || existingPayroll.length === 0) {
        // Crear configuración previsional por defecto
        const { data: newPayroll, error: payrollError } = await supabase
          .from('payroll_config')
          .insert({
            employee_id: employee.id,
            afp_code: 'HABITAT',
            health_institution_code: 'FONASA',
            legal_gratification_type: 'none',
            family_allowances: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (payrollError) {
          console.error(`❌ [FIX] Error creating payroll config for ${employee.first_name}:`, payrollError);
        } else {
          console.log(`✅ [FIX] Payroll config created for ${employee.first_name}`);
        }
      } else {
        console.log(`ℹ️ [FIX] Payroll config already exists for ${employee.first_name}`);
      }

      results.push({
        employee: `${employee.first_name} ${employee.last_name}`,
        id: employee.id,
        contractCreated: !existingContracts || existingContracts.length === 0,
        payrollCreated: !existingPayroll || existingPayroll.length === 0
      });
    }

    console.log('✅ [FIX] Employee data fix completed');

    return NextResponse.json({
      success: true,
      message: `Fixed data for ${employees.length} employees`,
      employees: results
    });

  } catch (error) {
    console.error('🚨 [FIX] Critical error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}