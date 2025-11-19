import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { parseF29WithOCR } from '@/lib/f29OCRParser';

/**
 * Endpoint limpio para análisis F29 con OCR
 * POST /api/f29/parse
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Analizando F29 con OCR...');

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No se proporcionó archivo',
      }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({
        success: false,
        error: 'Solo se permiten archivos PDF',
      }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({
        success: false,
        error: 'Archivo muy grande (máximo 10MB)',
      }, { status: 400 });
    }

    // Convertir a buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Analizar con OCR
    const result = await parseF29WithOCR(buffer);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'F29 analizado exitosamente con OCR',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error en análisis F29:', error);

    return NextResponse.json({
      success: false,
      error: 'Error procesando el archivo',
      details: error instanceof Error ? error.message : 'Error desconocido',
    }, { status: 500 });
  }
}

/**
 * GET: Información del endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/f29/parse',
    description: 'Análisis F29 con OCR (Tesseract.js)',
    features: [
      'OCR completo del formulario',
      'Extracción automática de todos los códigos',
      'Sin dependencias de APIs externas',
      'Alta precisión en formularios SII estándar',
    ],
    supported_codes: [
      'PPM (062)',
      'IVA Determinado (089)',
      'Débito Fiscal (538)',
      'Crédito Fiscal (511)',
      'Ventas Netas (563)',
      'Total Determinado (547)',
      'Y más...',
    ],
  });
}
