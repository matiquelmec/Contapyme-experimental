import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseConnection } from '@/lib/database';

// GET - Investigar estructura de tablas
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Investigando estructura de base de datos...');

    const supabase = getDatabaseConnection();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Error de configuración de base de datos' },
        { status: 503 },
      );
    }

    // Verificar si existe tabla companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .limit(1);

    // Verificar estructura tabla employees para referencia
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*')
      .limit(1);

    const result = {
      companies: {
        exists: !companiesError,
        error: companiesError?.message || null,
        sample_data: companies?.[0] || null,
        columns: companies?.[0] ? Object.keys(companies[0]) : []
      },
      employees: {
        exists: !employeesError,
        error: employeesError?.message || null,
        sample_data: employees?.[0] || null,
        columns: employees?.[0] ? Object.keys(employees[0]) : []
      }
    };

    console.log('📋 Estructura de tablas:', JSON.stringify(result, null, 2));

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Estructura de tablas investigada'
    });

  } catch (error) {
    console.error('Error investigando tablas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}