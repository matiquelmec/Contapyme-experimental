import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    const query = supabase
      .from('employees')
      .select(`
        *,
        employment_contracts (
          id,
          position,
          base_salary,
          status,
          start_date,
          end_date,
          contract_type
        ),
        payroll_config (
          id,
          afp_code,
          health_institution_code,
          family_allowances,
          legal_gratification_type
        )
      `)
      .eq('id', params.id);

    if (companyId) {
      query.eq('company_id', companyId);
    }

    const { data: employee, error } = await query.single();

    if (error) {
      console.error('Error fetching employee:', error);
      return NextResponse.json(
        { success: false, error: 'Error al obtener empleado' },
        { status: 500 },
      );
    }

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Empleado no encontrado' },
        { status: 404 },
      );
    }

    const contract = employee.employment_contracts?.find((c: any) => c.status === 'active') ||
                    employee.employment_contracts?.[0] || null;
    const payrollConfig = employee.payroll_config || null;
    const { employment_contracts, payroll_config, ...employeeData } = employee;

    return NextResponse.json({
      success: true,
      employee: employeeData,
      contract: contract,
      payrollConfig: payrollConfig,
      data: {
        ...employee,
        employment_contracts: employee.employment_contracts || [],
        payroll_config: employee.payroll_config || null,
      },
    });

  } catch (error) {
    console.error('Error in GET:', error);
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
    const body = await request.json();
    const employeeId = params.id;

    console.log('🔧 [API-FINAL] Actualizando empleado:', employeeId);
    console.log('📥 [API-FINAL] Datos recibidos:', body);

    // Filtrar hire_date del body para evitar errores
    const { hire_date: _, ...bodyWithoutHireDate } = body;

    // =====================================================
    // 1. ACTUALIZAR TABLA EMPLOYEES (SIN hire_date)
    // =====================================================

    const employeeUpdateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Campos que SÍ existen en employees (NO incluir hire_date)
    if (bodyWithoutHireDate.first_name !== undefined) employeeUpdateData.first_name = bodyWithoutHireDate.first_name;
    if (bodyWithoutHireDate.last_name !== undefined) employeeUpdateData.last_name = bodyWithoutHireDate.last_name;
    if (bodyWithoutHireDate.email !== undefined) employeeUpdateData.email = bodyWithoutHireDate.email;
    if (bodyWithoutHireDate.phone !== undefined) employeeUpdateData.phone = bodyWithoutHireDate.phone;
    if (bodyWithoutHireDate.address !== undefined) employeeUpdateData.address = bodyWithoutHireDate.address;
    if (bodyWithoutHireDate.birth_date !== undefined) employeeUpdateData.birth_date = bodyWithoutHireDate.birth_date;
    if (bodyWithoutHireDate.status !== undefined) employeeUpdateData.status = bodyWithoutHireDate.status;
    if (bodyWithoutHireDate.bank_name !== undefined) employeeUpdateData.bank_name = bodyWithoutHireDate.bank_name;
    if (bodyWithoutHireDate.bank_account_type !== undefined) employeeUpdateData.bank_account_type = bodyWithoutHireDate.bank_account_type;
    if (bodyWithoutHireDate.bank_account_number !== undefined) employeeUpdateData.bank_account_number = bodyWithoutHireDate.bank_account_number;

    console.log('📝 [API-FINAL] Actualizando employee con:', employeeUpdateData);

    const { error: employeeError } = await supabase
      .from('employees')
      .update(employeeUpdateData)
      .eq('id', employeeId);

    if (employeeError) {
      console.error('❌ [API-FINAL] Error updating employee:', employeeError);
      return NextResponse.json(
        { success: false, error: 'Error al actualizar empleado: ' + employeeError.message },
        { status: 500 },
      );
    }

    // =====================================================
    // 2. ACTUALIZAR CONTRATO (hire_date -> start_date)
    // =====================================================

    if (body.base_salary !== undefined || body.contract_type || body.position || body.hire_date) {
      console.log('💼 [API-FINAL] Actualizando datos contractuales...');

      const { data: existingContract } = await supabase
        .from('employment_contracts')
        .select('id')
        .eq('employee_id', employeeId)
        .eq('status', 'active')
        .single();

      if (existingContract) {
        const contractUpdateData: any = {
          updated_at: new Date().toISOString(),
        };

        if (body.base_salary !== undefined) contractUpdateData.base_salary = body.base_salary;
        if (body.contract_type !== undefined) contractUpdateData.contract_type = body.contract_type;
        if (body.position !== undefined) contractUpdateData.position = body.position;
        if (body.hire_date !== undefined && body.hire_date !== '') {
          contractUpdateData.start_date = body.hire_date; // MAPEO CORRECTO
        }

        console.log('💼 [API-FINAL] Actualizando contrato con:', contractUpdateData);

        const { error: contractError } = await supabase
          .from('employment_contracts')
          .update(contractUpdateData)
          .eq('id', existingContract.id);

        if (contractError) {
          console.error('❌ [API-FINAL] Error updating contract:', contractError);
        } else {
          console.log('✅ [API-FINAL] Contrato actualizado exitosamente');
        }
      }
    }

    // =====================================================
    // 3. ACTUALIZAR CONFIGURACIÓN PREVISIONAL
    // =====================================================

    if (body.afp_code !== undefined || body.health_institution_code !== undefined ||
        body.family_allowances !== undefined || body.legal_gratification_type !== undefined) {

      console.log('📋 [API-FINAL] Actualizando configuración previsional...');

      const { data: existingConfigs } = await supabase
        .from('payroll_config')
        .select('id')
        .eq('employee_id', employeeId);

      const existingConfig = existingConfigs?.[0];

      if (existingConfig) {
        const updateData: any = {
          updated_at: new Date().toISOString(),
        };

        if (body.afp_code !== undefined) updateData.afp_code = body.afp_code;
        if (body.health_institution_code !== undefined) updateData.health_institution_code = body.health_institution_code;
        if (body.family_allowances !== undefined) updateData.family_allowances = body.family_allowances;
        if (body.legal_gratification_type !== undefined) updateData.legal_gratification_type = body.legal_gratification_type;

        console.log('📝 [API-FINAL] Actualizando config con:', updateData);

        const { error: updateError } = await supabase
          .from('payroll_config')
          .update(updateData)
          .eq('id', existingConfig.id);

        if (updateError) {
          console.error('❌ [API-FINAL] Error actualizando payroll config:', updateError);
        } else {
          console.log('✅ [API-FINAL] Configuración previsional actualizada');
        }
      } else {
        const insertData = {
          employee_id: employeeId,
          afp_code: body.afp_code || 'HABITAT',
          health_institution_code: body.health_institution_code || 'FONASA',
          family_allowances: body.family_allowances || 0,
          legal_gratification_type: body.legal_gratification_type || 'none',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        console.log('➕ [API-FINAL] Creando nueva configuración con:', insertData);

        const { error: insertError } = await supabase
          .from('payroll_config')
          .insert(insertData);

        if (insertError) {
          console.error('❌ [API-FINAL] Error creando payroll config:', insertError);
        } else {
          console.log('✅ [API-FINAL] Nueva configuración previsional creada');
        }
      }
    }

    console.log('🎉 [API-FINAL] EMPLEADO ACTUALIZADO EXITOSAMENTE');

    return NextResponse.json({
      success: true,
      message: 'Empleado actualizado exitosamente',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('💥 [API-FINAL] Error crítico:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor: ' + (error instanceof Error ? error.message : 'Error desconocido') },
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

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'company_id es requerido' },
        { status: 400 },
      );
    }

    const { data: employee, error } = await supabase
      .from('employees')
      .update({
        status: 'inactive',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) {
      console.error('Error deactivating employee:', error);
      return NextResponse.json(
        { success: false, error: 'Error al dar de baja empleado' },
        { status: 500 },
      );
    }

    await supabase
      .from('employment_contracts')
      .update({
        status: 'terminated',
        end_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString(),
      })
      .eq('employee_id', params.id)
      .eq('status', 'active');

    return NextResponse.json({
      success: true,
      data: employee,
      message: 'Empleado dado de baja exitosamente',
    });

  } catch (error) {
    console.error('Error in DELETE:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}