// Script simple para crear empresa 2 usando fetch
const fetch = require('node-fetch');

async function createCompanyData() {
  const baseUrl = 'http://localhost:3000/api';

  try {
    console.log('🚀 Creando datos para empresa 2...');

    // Datos de prueba para insertar directamente en la base de datos
    const companySqlData = `
      -- Insertar empresa 2
      INSERT INTO companies (
        id, user_id, rut, name, legal_name, business_activity,
        address, phone, email, website, status, plan_type,
        created_at, updated_at
      ) VALUES (
        '9144ff7a-c530-5e82-cb1f-593f57de7fde',
        'demo-user-id',
        '98.765.432-1',
        'Mi Pyme Ltda.',
        'Mi Pyme Limitada',
        'Comercio al por menor de productos varios',
        'Valparaíso, Región de Valparaíso, Chile',
        '+56 9 8765 4321',
        'contacto@mipyme.cl',
        'https://mipyme.cl',
        'active',
        'demo',
        NOW(),
        NOW()
      ) ON CONFLICT (id) DO NOTHING;

      -- Insertar empleados empresa 2
      INSERT INTO employees (
        id, company_id, user_id, rut, first_name, last_name,
        email, phone, address, birth_date, hire_date,
        position, status, created_at, updated_at
      ) VALUES
      (
        'emp2-001-maria-gonzalez',
        '9144ff7a-c530-5e82-cb1f-593f57de7fde',
        'demo-user-id',
        '12.543.876-9',
        'María Fernanda',
        'González Pérez',
        'maria.gonzalez@mipyme.cl',
        '+56 9 9876 5432',
        'Los Leones 456, Valparaíso',
        '1985-03-15',
        '2023-01-15',
        'Gerente de Ventas',
        'active',
        NOW(),
        NOW()
      ),
      (
        'emp2-002-carlos-silva',
        '9144ff7a-c530-5e82-cb1f-593f57de7fde',
        'demo-user-id',
        '15.987.654-3',
        'Carlos Alberto',
        'Silva Rojas',
        'carlos.silva@mipyme.cl',
        '+56 9 8765 4321',
        'Las Palmas 789, Viña del Mar',
        '1988-07-22',
        '2023-03-01',
        'Vendedor Senior',
        'active',
        NOW(),
        NOW()
      ),
      (
        'emp2-003-ana-torres',
        '9144ff7a-c530-5e82-cb1f-593f57de7fde',
        'demo-user-id',
        '18.234.567-8',
        'Ana Beatriz',
        'Torres Morales',
        'ana.torres@mipyme.cl',
        '+56 9 7654 3210',
        'Miramar 321, Valparaíso',
        '1992-11-08',
        '2023-06-01',
        'Asistente Comercial',
        'active',
        NOW(),
        NOW()
      ) ON CONFLICT (id) DO NOTHING;
    `;

    console.log('✅ SQL preparado para inserción directa');
    console.log('📋 Datos a crear:');
    console.log('   🏢 Empresa: Mi Pyme Ltda. (98.765.432-1)');
    console.log('   👥 Empleados: 3 (María González, Carlos Silva, Ana Torres)');
    console.log('');
    console.log('⚠️  IMPORTANTE: Ejecutar este SQL manualmente en Supabase Dashboard');
    console.log('');
    console.log(companySqlData);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createCompanyData();