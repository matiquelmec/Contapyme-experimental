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

    // Si no hay company_id, obtener el empleado sin filtrar por compañía
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

    // Restructurar la respuesta para el modal
    const contract = employee.employment_contracts?.find((c: any) => c.status === 'active') || employee.employment_contracts?.[0] || null;
    const payrollConfig = employee.payroll_config?.[0] || null;

    // Eliminar las relaciones anidadas del objeto employee para evitar duplicación
    const { employment_contracts, payroll_config, ...employeeData } = employee;

    return NextResponse.json({
      success: true,
      employee: employeeData,
      contract: contract,
      payrollConfig: payrollConfig,
      data: {
        ...employee,
        employment_contracts: employee.employment_contracts || [],
        payroll_config: employee.payroll_config?.[0] || null,
      },
    });

  } catch (error) {
    console.error('Error in GET /api/payroll/employees/[id]:', error);
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

    // Actualizar datos del empleado (TODOS los campos)
    const employeeUpdateData: any = {
      updated_at: new Date().toISOString(),
    };

    // 📝 Campos de información personal
    if (body.first_name !== undefined) employeeUpdateData.first_name = body.first_name;
    if (body.last_name !== undefined) employeeUpdateData.last_name = body.last_name;
    if (body.email !== undefined) employeeUpdateData.email = body.email;
    if (body.phone !== undefined) employeeUpdateData.phone = body.phone;
    if (body.address !== undefined) employeeUpdateData.address = body.address;
    if (body.birth_date !== undefined) employeeUpdateData.birth_date = body.birth_date;
    if (body.status !== undefined) employeeUpdateData.status = body.status;
    // NOTA: hire_date no existe en tabla employees, se maneja en employment_contracts.start_date

    // 💰 Campos bancarios
    if (body.bank_name !== undefined) employeeUpdateData.bank_name = body.bank_name;
    if (body.bank_account_type !== undefined) employeeUpdateData.bank_account_type = body.bank_account_type;
    if (body.bank_account_number !== undefined) employeeUpdateData.bank_account_number = body.bank_account_number;

    console.log('📝 [API] Updating employee with data:', employeeUpdateData);

    const { error: employeeError } = await supabase
      .from('employees')
      .update(employeeUpdateData)
      .eq('id', employeeId);

    if (employeeError) {
      console.error('Error updating employee:', employeeError);
      return NextResponse.json(
        { success: false, error: 'Error al actualizar empleado' },
        { status: 500 },
      );
    }

    // 💼 Actualizar contrato si se proporcionan datos contractuales
    if (body.base_salary !== undefined || body.contract_type || body.position) {
      console.log('💼 [API] Updating contract data for employee:', employeeId);

      // Primero buscar si existe un contrato activo
      const { data: existingContract } = await supabase
        .from('employment_contracts')
        .select('id')
        .eq('employee_id', employeeId)
        .eq('status', 'active')
        .single();

      if (existingContract) {
        // Preparar datos del contrato para actualización
        const contractUpdateData: any = {
          updated_at: new Date().toISOString(),
        };

        if (body.base_salary !== undefined) contractUpdateData.base_salary = body.base_salary;
        if (body.contract_type !== undefined) contractUpdateData.contract_type = body.contract_type;
        if (body.position !== undefined) contractUpdateData.position = body.position;

        console.log('💼 [API] Updating existing contract with:', contractUpdateData);

        // Actualizar contrato existente
        const { error: contractError } = await supabase
          .from('employment_contracts')
          .update(contractUpdateData)
          .eq('id', existingContract.id);

        if (contractError) {
          console.error('❌ [API] Error updating contract:', contractError);
        } else {
          console.log('✅ [API] Contract updated successfully');
        }
      }
    }

    // 🔄 LÓGICA ROBUSTA: Actualizar o crear configuración de nómina
    console.log('📋 [API] Updating payroll config for employee:', employeeId);
    console.log('📋 [API] Received payroll data:', {
      afp_code: body.afp_code,
      health_institution_code: body.health_institution_code,
      legal_gratification_type: body.legal_gratification_type
    });

    // Siempre procesar configuración previsional (más robusto)
    try {
      // Buscar configuración existente sin .single() para evitar errores
      const { data: existingConfigs, error: searchError } = await supabase
        .from('payroll_config')
        .select('id')
        .eq('employee_id', employeeId);

      if (searchError) {
        console.error('❌ [API] Error searching payroll config:', searchError);
        throw searchError;
      }

      const existingConfig = existingConfigs?.[0];
      console.log('🔍 [API] Existing config found:', existingConfig ? 'YES' : 'NO');

      if (existingConfig) {
        // ✅ ACTUALIZAR configuración existente
        const updateData: any = {
          updated_at: new Date().toISOString(),
        };

        // Actualizar TODOS los campos enviados (incluyendo family_allowances)
        if (body.afp_code !== undefined) updateData.afp_code = body.afp_code;
        if (body.health_institution_code !== undefined) updateData.health_institution_code = body.health_institution_code;
        if (body.family_allowances !== undefined) updateData.family_allowances = body.family_allowances;
        if (body.legal_gratification_type !== undefined) updateData.legal_gratification_type = body.legal_gratification_type;

        console.log('📝 [API] Updating existing config with:', updateData);

        const { error: updateError } = await supabase
          .from('payroll_config')
          .update(updateData)
          .eq('id', existingConfig.id);

        if (updateError) {
          console.error('❌ [API] Error updating payroll config:', updateError);
          throw updateError;
        } else {
          console.log('✅ [API] Payroll config updated successfully');
        }
      } else {
        // ✅ CREAR nueva configuración
        const insertData = {
          employee_id: employeeId,
          afp_code: body.afp_code || 'HABITAT',
          health_institution_code: body.health_institution_code || 'FONASA',
          family_allowances: body.family_allowances || 0,
          legal_gratification_type: body.legal_gratification_type || 'none',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        console.log('➕ [API] Creating new config with:', insertData);

        const { error: insertError } = await supabase
          .from('payroll_config')
          .insert(insertData);

        if (insertError) {
          console.error('❌ [API] Error creating payroll config:', insertError);
          throw insertError;
        } else {
          console.log('✅ [API] Payroll config created successfully');
        }
      }
    } catch (payrollError) {
      console.error('❌ [API] Critical error in payroll config operation:', payrollError);
      // No lanzar el error para que no falle toda la actualización
    }

    return NextResponse.json({
      success: true,
      message: 'Empleado actualizado exitosamente',
    });

  } catch (error) {
    console.error('Error in PUT /api/payroll/employees/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
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

    // En lugar de eliminar físicamente, marcamos como inactivo
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

    // También marcamos los contratos como terminados
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
    console.error('Error in DELETE /api/payroll/employees/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}
