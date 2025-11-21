import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseConnection } from '@/lib/database';

// POST - Crear empleados para empresa 2
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Creando empleados para empresa 2...');

    const supabase = getDatabaseConnection();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Error de configuración de base de datos' },
        { status: 503 },
      );
    }

    // Empleados para empresa 2 con RUTs únicos
    const employees = [
      {
        id: '7f8b5c1e-d4e2-4a9b-8c6f-1e2d3c4b5a69',
        company_id: '9144ff7a-c530-5e82-cb1f-593f57de7fde',
        rut: '15.987.654-3',
        first_name: 'Carlos',
        last_name: 'Silva',
        birth_date: '1988-05-15',
        email: 'carlos.silva@mipyme.cl',
        phone: '+56 9 8765 4321',
        address: 'Las Palmas 789, Viña del Mar',
        city: 'Viña del Mar',
        region: 'V',
        status: 'active',
        created_by: '550e8400-e29b-41d4-a716-446655440000'
      },
      {
        id: 'a1b2c3d4-e5f6-4789-b012-3c4d5e6f7890',
        company_id: '9144ff7a-c530-5e82-cb1f-593f57de7fde',
        rut: '18.234.567-8',
        first_name: 'Ana',
        last_name: 'Torres',
        birth_date: '1992-11-03',
        email: 'ana.torres@mipyme.cl',
        phone: '+56 9 7654 3210',
        address: 'Miramar 321, Valparaíso',
        city: 'Valparaíso',
        region: 'V',
        status: 'active',
        created_by: '550e8400-e29b-41d4-a716-446655440000'
      }
    ];

    const results = [];

    for (const emp of employees) {
      console.log(`🔄 Creando empleado: ${emp.first_name} ${emp.last_name}`);

      const { data, error } = await supabase
        .from('employees')
        .insert(emp)
        .select()
        .single();

      if (error) {
        console.error(`❌ Error creando ${emp.first_name}:`, error);
        results.push({
          employee: `${emp.first_name} ${emp.last_name}`,
          success: false,
          error: error.message
        });
      } else {
        console.log(`✅ Empleado creado: ${emp.first_name} ${emp.last_name}`);
        results.push({
          employee: `${emp.first_name} ${emp.last_name}`,
          success: true,
          data: data
        });
      }
    }

    // Verificar empleados creados
    const { data: verifyData, error: verifyError } = await supabase
      .from('employees')
      .select('first_name, last_name, rut, email')
      .eq('company_id', '9144ff7a-c530-5e82-cb1f-593f57de7fde');

    console.log(`🎉 Empleados empresa 2 (${verifyData?.length || 0}):`);
    verifyData?.forEach(emp => {
      console.log(`   • ${emp.first_name} ${emp.last_name} (${emp.rut})`);
    });

    return NextResponse.json({
      success: true,
      data: {
        results: results,
        verification: verifyData || [],
        count: verifyData?.length || 0
      },
      message: 'Proceso de creación de empleados completado'
    });

  } catch (error) {
    console.error('Error creando empleados:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}