import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getDatabaseConnection } from '@/lib/database/databaseSimple';

// DELETE - Eliminar libro de remuneraciones por ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const bookId = params.id;

    if (!bookId) {
      return NextResponse.json(
        { error: 'ID del libro es requerido' },
        { status: 400 },
      );
    }

    console.log('🗑️ Eliminando libro de remuneraciones:', bookId);

    const supabase = getDatabaseConnection();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Error de configuración de base de datos' },
        { status: 503 },
      );
    }

    // Debug: Verificar conexión y configuración
    console.log('🔍 Configuración Supabase:', {
      hasClient: !!supabase,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configurada' : 'no configurada',
      key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'configurada' : 'no configurada',
    });

    // Verificar que el libro existe sin filtro de company_id para debug
    const { data: existingBook, error: checkError } = await supabase
      .from('payroll_books')
      .select('id, period, total_employees, company_id')
      .eq('id', bookId)
      .maybeSingle();

    console.log('🔍 Resultado consulta libro:', {
      data: existingBook,
      error: checkError,
      bookId,
    });

    if (checkError) {
      console.error('❌ Error en consulta de libro:', checkError);
      return NextResponse.json(
        { error: 'Error al consultar libro', details: checkError.message },
        { status: 500 },
      );
    }

    if (!existingBook) {
      console.error('❌ Libro no encontrado para ID:', bookId);
      return NextResponse.json(
        { error: 'Libro no encontrado' },
        { status: 404 },
      );
    }

    console.log('📋 Libro encontrado:', existingBook.period, 'con', existingBook.total_employees, 'empleados');

    // Eliminar detalles del libro primero (foreign key constraint)
    const { error: detailsError } = await supabase
      .from('payroll_book_details')
      .delete()
      .eq('payroll_book_id', bookId);

    if (detailsError) {
      console.error('❌ Error eliminando detalles del libro:', detailsError);
      return NextResponse.json(
        { error: 'Error al eliminar detalles del libro' },
        { status: 500 },
      );
    }

    console.log('✅ Detalles del libro eliminados');

    // Eliminar el libro principal
    const { error: bookError } = await supabase
      .from('payroll_books')
      .delete()
      .eq('id', bookId);

    if (bookError) {
      console.error('❌ Error eliminando libro:', bookError);
      return NextResponse.json(
        { error: 'Error al eliminar libro' },
        { status: 500 },
      );
    }

    console.log('✅ Libro eliminado exitosamente');

    return NextResponse.json({
      success: true,
      message: `Libro de ${existingBook.period} eliminado exitosamente`,
    });

  } catch (error) {
    console.error('Error en DELETE /api/payroll/libro-remuneraciones/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}
