import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseConnection } from '@/lib/database';

// POST - Crear nueva empresa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('🔍 API POST companies - datos recibidos:', JSON.stringify(body, null, 2));

    // Validaciones básicas
    if (!body.id || !body.name || !body.rut) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: id, name, rut' },
        { status: 400 },
      );
    }

    // ✅ Obtener conexión a Supabase
    const supabase = getDatabaseConnection();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Error de configuración de base de datos', success: false },
        { status: 503 },
      );
    }

    // Crear empresa usando estructura real de la tabla
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        id: body.id,
        name: body.name,
        rut: body.rut,
        razon_social: body.razon_social || body.name,
        nombre_fantasia: body.nombre_fantasia || body.name,
        giro: body.giro || 'Comercio al por menor de productos varios',
        address: body.address || 'Valparaíso, Chile',
        phone: body.phone || '+56 9 8765 4321',
        email: body.email || 'contacto@empresa.cl',
        website: body.website || 'https://empresa.cl',
        estado: body.estado || 'activo',
        plan_tipo: body.plan_tipo || 'demo',
        legal_representative_name: body.legal_representative_name || 'Representante Legal',
        legal_representative_rut: body.legal_representative_rut || '12.345.678-9',
        fiscal_address: body.fiscal_address || body.address || 'Valparaíso, Chile',
        fiscal_city: body.fiscal_city || 'Valparaíso',
        features: body.features || {
          payroll: true,
          f29Analysis: true,
          fixedAssets: true
        },
        limits: body.limits || {
          storage: "500MB",
          employees: 50
        },
        preferences: body.preferences || {}
      })
      .select()
      .single();

    if (companyError) {
      console.error('❌ Error creando empresa:', JSON.stringify(companyError, null, 2));

      if (companyError.code === '23505') {
        return NextResponse.json(
          { error: 'Ya existe una empresa con ese ID o RUT', details: companyError },
          { status: 409 },
        );
      }

      if (companyError.code === '42P01') {
        return NextResponse.json(
          { error: 'Tabla companies no existe en base de datos', details: companyError },
          { status: 500 },
        );
      }

      return NextResponse.json(
        { error: 'Error creando empresa en base de datos', details: companyError },
        { status: 500 },
      );
    }

    console.log('✅ Empresa creada exitosamente:', company);

    return NextResponse.json({
      success: true,
      data: company,
      message: 'Empresa creada exitosamente'
    });

  } catch (error) {
    console.error('Error en POST /api/companies:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}