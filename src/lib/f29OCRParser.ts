/**
 * F29 OCR Parser - Solución simple y robusta
 * Extrae datos directamente del PDF sin OCR externo
 */
import pdf from 'pdf-parse';

export interface F29Data {
  rut: string;
  periodo: string;
  folio: string;
  razonSocial: string;
  // Códigos principales F29
  codigo062: number; // PPM
  codigo089: number; // IVA Determinado
  codigo110: number; // Cantidad Boletas
  codigo503: number; // Cantidad Facturas Emitidas
  codigo511: number; // Crédito Fiscal
  codigo519: number; // Cantidad Facturas Recibidas
  codigo538: number; // Débito Fiscal
  codigo547: number; // Total Determinado
  codigo562: number; // Compras sin crédito
  codigo563: number; // Ventas Netas
  codigo595: number; // Subtotal
  // Metadatos
  confidence: number;
  method: string;
}

/**
 * Extrae texto del PDF usando pdf-parse
 */
async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    console.log('📄 Extrayendo texto del PDF...');
    const data = await pdf(pdfBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extrayendo texto del PDF:', error);
    throw new Error('No se pudo extraer texto del PDF');
  }
}

/**
 * Función principal para extraer texto (usar PDF directo en lugar de OCR)
 */
async function extractTextWithOCR(pdfBuffer: Buffer): Promise<string> {
  return extractTextFromPDF(pdfBuffer);
}

/**
 * Extrae códigos F29 del texto usando patrones simples
 */
function extractF29Codes(text: string): Partial<F29Data> {
  console.log('🔎 Buscando códigos F29 en texto extraído...');

  const codes: Partial<F29Data> = {
    rut: '',
    periodo: '',
    folio: '',
    razonSocial: '',
    codigo062: 0,
    codigo089: 0,
    codigo110: 0,
    codigo503: 0,
    codigo511: 0,
    codigo519: 0,
    codigo538: 0,
    codigo547: 0,
    codigo562: 0,
    codigo563: 0,
    codigo595: 0,
  };

  // Patrones simples para información básica
  const rutMatch = text.match(/RUT.*?(\d{1,2}\.?\d{3}\.?\d{3}-?[\dkK])/i);
  if (rutMatch) codes.rut = rutMatch[1];

  const periodoMatch = text.match(/PERIODO.*?(\d{6})/i);
  if (periodoMatch) codes.periodo = periodoMatch[1];

  const folioMatch = text.match(/FOLIO.*?(\d+)/i);
  if (folioMatch) codes.folio = folioMatch[1];

  // Buscar razón social
  const razonMatch = text.match(/RAZÓN SOCIAL.*?([A-Z\s]+)/i);
  if (razonMatch) codes.razonSocial = razonMatch[1].trim();

  // Patrones para códigos específicos (más flexible)
  const codePatterns = {
    codigo062: /062.*?PPM.*?(\d{1,3}(?:[.,]\d{3})*)/i,
    codigo089: /089.*?IVA.*?DETERMINADO.*?(\d{1,3}(?:[.,]\d{3})*)/i,
    codigo110: /110.*?BOLETAS.*?(\d{1,3}(?:[.,]\d{3})*)/i,
    codigo503: /503.*?FACTURAS.*?EMITIDAS.*?(\d{1,3}(?:[.,]\d{3})*)/i,
    codigo511: /511.*?CR[EÉ][DÍ].*?(\d{1,3}(?:[.,]\d{3})*)/i,
    codigo519: /519.*?FACTURAS.*?RECIBIDAS.*?(\d{1,3}(?:[.,]\d{3})*)/i,
    codigo538: /538.*?DÉBITO.*?(\d{1,3}(?:[.,]\d{3})*)/i,
    codigo547: /547.*?TOTAL.*?DETERMINADO.*?(\d{1,3}(?:[.,]\d{3})*)/i,
    codigo562: /562.*?SIN.*?DERECHO.*?(\d{1,3}(?:[.,]\d{3})*)/i,
    codigo563: /563.*?VENTAS.*?NETAS.*?(\d{1,3}(?:[.,]\d{3})*)/i,
    codigo595: /595.*?SUBTOTAL.*?(\d{1,3}(?:[.,]\d{3})*)/i,
  };

  // Extraer cada código
  for (const [key, pattern] of Object.entries(codePatterns)) {
    const match = text.match(pattern);
    if (match) {
      const value = parseInt(match[1].replace(/[.,]/g, ''));
      if (!isNaN(value)) {
        (codes as any)[key] = value;
        console.log(`✅ Encontrado ${key}: ${value.toLocaleString()}`);
      }
    }
  }

  return codes;
}

/**
 * Función principal para analizar F29 con OCR
 */
export async function parseF29WithOCR(pdfBuffer: Buffer): Promise<F29Data> {
  console.log('🤖 Iniciando análisis F29 con OCR...');

  try {
    // Extraer texto con OCR
    const text = await extractTextWithOCR(pdfBuffer);
    console.log('📄 Texto extraído con OCR (primeros 500 chars):', text.substring(0, 500));

    // Extraer códigos del texto
    const extractedData = extractF29Codes(text);

    // Verificar que encontramos datos
    const codesFound = Object.values(extractedData).filter(v =>
      typeof v === 'number' && v > 0,
    ).length;

    if (codesFound === 0) {
      throw new Error('No se encontraron códigos F29 válidos');
    }

    console.log(`✅ OCR completado: ${codesFound} códigos encontrados`);

    return {
      ...extractedData,
      confidence: Math.min(90, codesFound * 10), // Más códigos = más confianza
      method: 'PDF Text Extract',
    } as F29Data;

  } catch (error) {
    console.error('❌ Error en análisis OCR:', error);
    throw error;
  }
}
