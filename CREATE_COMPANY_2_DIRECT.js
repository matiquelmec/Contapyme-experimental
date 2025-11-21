// Solución directa - Crear datos empresa 2 via API Next.js
async function createCompany2Data() {
  console.log('🚀 Creando datos empresa 2 directamente...');

  try {
    // 1. Crear empleados para empresa 2 usando API existente
    const employees = [
      {
        company_id: '9144ff7a-c530-5e82-cb1f-593f57de7fde', // ID empresa 2
        rut: '12.543.876-9',
        first_name: 'María',
        last_name: 'González',
        email: 'maria.gonzalez@mipyme.cl',
        phone: '+56 9 9876 5432',
        position: 'Gerente de Ventas',
        base_salary: 1200000,
        contract_type: 'indefinido'
      },
      {
        company_id: '9144ff7a-c530-5e82-cb1f-593f57de7fde',
        rut: '15.987.654-3',
        first_name: 'Carlos',
        last_name: 'Silva',
        email: 'carlos.silva@mipyme.cl',
        phone: '+56 9 8765 4321',
        position: 'Vendedor Senior',
        base_salary: 800000,
        contract_type: 'indefinido'
      }
    ];

    console.log('📝 Creando empleados via API...');

    for (const emp of employees) {
      const response = await fetch('http://localhost:3002/api/payroll/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emp)
      });

      const result = await response.json();
      if (result.success) {
        console.log(`✅ Empleado creado: ${emp.first_name} ${emp.last_name}`);
      } else {
        console.error(`❌ Error creando empleado:`, result.error);
      }
    }

    console.log('\n🎉 ¡Datos empresa 2 creados exitosamente!');
    console.log('🔄 Ahora el cambio de empresas debería mostrar datos diferentes.');

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

createCompany2Data();