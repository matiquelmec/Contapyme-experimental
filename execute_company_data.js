// Script temporal para ejecutar SQL de creación de empresa 2
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://ahtmcevpvqcpzkxqixwk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFodG1jZXZwdnFjcHpreHFpeHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5NjMzMTUsImV4cCI6MjA0NzUzOTMxNX0.FqMsX3vNhjpj5Sxf9VzDL1vTSkm8GKXK5YzFJ0a0FxM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQL() {
  try {
    console.log('🚀 Iniciando creación de datos para empresa 2...');

    // 1. Crear empresa 2
    console.log('📄 Creando empresa Mi Pyme Ltda...');
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .upsert({
        id: '9144ff7a-c530-5e82-cb1f-593f57de7fde',
        user_id: 'demo-user-id',
        rut: '98.765.432-1',
        name: 'Mi Pyme Ltda.',
        legal_name: 'Mi Pyme Limitada',
        business_activity: 'Comercio al por menor de productos varios',
        address: 'Valparaíso, Región de Valparaíso, Chile',
        phone: '+56 9 8765 4321',
        email: 'contacto@mipyme.cl',
        website: 'https://mipyme.cl',
        status: 'active',
        plan_type: 'demo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (companyError) {
      console.error('❌ Error creando empresa:', companyError);
      return;
    }
    console.log('✅ Empresa creada exitosamente');

    // 2. Crear empleados
    console.log('👥 Creando empleados para empresa 2...');
    const employees = [
      {
        id: 'emp2-001-maria-gonzalez',
        company_id: '9144ff7a-c530-5e82-cb1f-593f57de7fde',
        user_id: 'demo-user-id',
        rut: '12.543.876-9',
        first_name: 'María Fernanda',
        last_name: 'González Pérez',
        email: 'maria.gonzalez@mipyme.cl',
        phone: '+56 9 9876 5432',
        address: 'Los Leones 456, Valparaíso',
        birth_date: '1985-03-15',
        hire_date: '2023-01-15',
        position: 'Gerente de Ventas',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'emp2-002-carlos-silva',
        company_id: '9144ff7a-c530-5e82-cb1f-593f57de7fde',
        user_id: 'demo-user-id',
        rut: '15.987.654-3',
        first_name: 'Carlos Alberto',
        last_name: 'Silva Rojas',
        email: 'carlos.silva@mipyme.cl',
        phone: '+56 9 8765 4321',
        address: 'Las Palmas 789, Viña del Mar',
        birth_date: '1988-07-22',
        hire_date: '2023-03-01',
        position: 'Vendedor Senior',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'emp2-003-ana-torres',
        company_id: '9144ff7a-c530-5e82-cb1f-593f57de7fde',
        user_id: 'demo-user-id',
        rut: '18.234.567-8',
        first_name: 'Ana Beatriz',
        last_name: 'Torres Morales',
        email: 'ana.torres@mipyme.cl',
        phone: '+56 9 7654 3210',
        address: 'Miramar 321, Valparaíso',
        birth_date: '1992-11-08',
        hire_date: '2023-06-01',
        position: 'Asistente Comercial',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .upsert(employees);

    if (employeeError) {
      console.error('❌ Error creando empleados:', employeeError);
      return;
    }
    console.log('✅ Empleados creados exitosamente');

    // 3. Crear contratos
    console.log('📋 Creando contratos...');
    const contracts = [
      {
        id: 'contract2-001-maria',
        company_id: '9144ff7a-c530-5e82-cb1f-593f57de7fde',
        employee_id: 'emp2-001-maria-gonzalez',
        position: 'Gerente de Ventas',
        contract_type: 'indefinido',
        start_date: '2023-01-15',
        end_date: null,
        base_salary: 1200000,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'contract2-002-carlos',
        company_id: '9144ff7a-c530-5e82-cb1f-593f57de7fde',
        employee_id: 'emp2-002-carlos-silva',
        position: 'Vendedor Senior',
        contract_type: 'indefinido',
        start_date: '2023-03-01',
        end_date: null,
        base_salary: 800000,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'contract2-003-ana',
        company_id: '9144ff7a-c530-5e82-cb1f-593f57de7fde',
        employee_id: 'emp2-003-ana-torres',
        position: 'Asistente Comercial',
        contract_type: 'indefinido',
        start_date: '2023-06-01',
        end_date: null,
        base_salary: 600000,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const { data: contractData, error: contractError } = await supabase
      .from('employment_contracts')
      .upsert(contracts);

    if (contractError) {
      console.error('❌ Error creando contratos:', contractError);
      return;
    }
    console.log('✅ Contratos creados exitosamente');

    // Verificar que todo se creó correctamente
    const { data: verification, error: verifyError } = await supabase
      .from('employees')
      .select('*')
      .eq('company_id', '9144ff7a-c530-5e82-cb1f-593f57de7fde');

    if (verifyError) {
      console.error('❌ Error verificando:', verifyError);
      return;
    }

    console.log('\n🎉 ¡EMPRESA 2 CREADA EXITOSAMENTE!');
    console.log(`✅ Empresa: Mi Pyme Ltda. (ID: 9144ff7a-c530-5e82-cb1f-593f57de7fde)`);
    console.log(`👥 Empleados creados: ${verification.length}`);
    verification.forEach(emp => {
      console.log(`   • ${emp.first_name} ${emp.last_name} (${emp.rut}) - ${emp.position}`);
    });

  } catch (error) {
    console.error('💥 Error ejecutando script:', error);
  }
}

executeSQL();