// OCR Parser para PDFs escaneados
// npm install tesseract.js

export async function performOCR(imageData: Blob): Promise<string> {
  // Cargar Tesseract dinámicamente solo cuando se necesite
  try {
    const Tesseract = await import('tesseract.js');

    const result = await Tesseract.recognize(
      imageData,
      'spa', // Español
      {
        logger: (info) => { console.log('OCR Progress:', info); },
      },
    );

    return result.data.text;
  } catch (error) {
    console.warn('Tesseract.js no está disponible. Para usar OCR, instalar: npm install tesseract.js');
    throw new Error('OCR no disponible: tesseract.js no está instalado');
  }
}

// Convertir PDF a imágenes para OCR
export async function pdfToImages(file: File): Promise<Blob[]> {
  // Usar pdf-to-img o similar
  // Por ahora retornamos array vacío
  return [];
}
