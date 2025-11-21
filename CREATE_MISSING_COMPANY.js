// Solución definitiva: Crear empresa 2 que falta en BD
const { createClient } = require('@supabase/supabase-js');

// Config desde variables de entorno del sistema
const supabaseUrl = 'https://ahtmcevpvqcpzkxqixwk.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFodG1jZXZwdnFjcHpreHFpeHdrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTk2MzMxNSwiZXhwIjoyMDQ3NTM5MzE1fQ.bYNOqZYDVfL8QrkQQ-GxHQN0QzJ8tKBYpJyPCWl8b9k';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createMissingCompany() {
  console.log('🎯 Solución definitiva: Crear empresa 2 que falta...');

  try {
    // 1. CREAR EMPRESA 2 que falta en tabla companies
    console.log('🏢 Insertando empresa Mi Pyme Ltda...');

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .upsert({
        id: '9144ff7a-c530-5e82-cb1f-593f57de7fde',
        user_id: 'demo-user-id',
        name: 'Mi Pyme Ltda.',
        legal_name: 'Mi Pyme Limitada',
        business_activity: 'Comercio al por menor',
        rut: '98.765.432-1',
        address: 'Valparaíso, Chile',
        phone: '+56 9 8765 4321',
        email: 'contacto@mipyme.cl',
        website: 'https://mipyme.cl',
        status: 'active',
        plan_type: 'demo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (companyError) {
      console.error('❌ Error creando empresa:', companyError);
      return;
    }

    console.log('✅ Empresa 2 creada exitosamente:', company[0]?.name);

    // 2. CREAR EMPLEADOS para empresa 2
    console.log('👥 Creando empleados para empresa 2...');

    const employees = [
      {
        id: 'emp2-001-maria',
        company_id: '9144ff7a-c530-5e82-cb1f-593f57de7fde',
        user_id: 'demo-user-id',
        rut: '12.543.876-9',
        first_name: 'María',
        last_name: 'González',
        email: 'maria.gonzalez@mipyme.cl',
        phone: '+56 9 9876 5432',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'emp2-002-carlos',
        company_id: '9144ff7a-c530-5e82-cb1f-593f57de7fde',
        user_id: 'demo-user-id',
        rut: '15.987.654-3',
        first_name: 'Carlos',
        last_name: 'Silva',
        email: 'carlos.silva@mipyme.cl',
        phone: '+56 9 8765 4321',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const { data: empData, error: empError } = await supabase
      .from('employees')
      .upsert(employees)
      .select();

    if (empError) {
      console.error('❌ Error creando empleados:', empError);
      return;
    }

    console.log('✅ Empleados creados:', empData.length);

    // 3. VERIFICACIÓN FINAL
    const { data: verification } = await supabase
      .from('employees')
      .select('*')
      .eq('company_id', '9144ff7a-c530-5e82-cb1f-593f57de7fde');

    console.log('\n🎉 ¡ÉXITO TOTAL!');
    console.log('🏢 Empresa 2: Mi Pyme Ltda. creada');
    console.log(`👥 Empleados empresa 2: ${verification.length}`);
    console.log('🔄 Cambio de empresas debería funcionar ahora');

    verification.forEach(emp => {
      console.log(`   • ${emp.first_name} ${emp.last_name} (${emp.rut})`);
    });

  } catch (error) {
    console.error('💥 Error ejecutando solución:', error);
  }
}

createMissingCompany();