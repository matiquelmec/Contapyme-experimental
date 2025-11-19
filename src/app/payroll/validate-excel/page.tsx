'use client';

import React, { useState, useRef } from 'react';

import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle, Download, Users, Calculator } from 'lucide-react';

interface ExcelData {
  rut: string;
  name: string;
  total_haberes: number;
  total_descuentos: number;
  total_liquido: number;
}

interface ValidationResult {
  success: boolean;
  validation: {
    is_consistent: boolean;
    period: string;
    totals: {
      system: {
        haberes: number;
        descuentos: number;
        liquido: number;
        employees: number;
      };
      excel: {
        haberes: number;
        descuentos: number;
        liquido: number;
        employees: number;
      };
      differences: {
        haberes: number;
        descuentos: number;
        liquido: number;
      };
      matches: {
        haberes: boolean;
        descuentos: boolean;
        liquido: boolean;
      };
    };
    employees: {
      total_compared: number;
      matches: number;
      discrepancies: number;
      not_found: number;
    };
    recommendations: string[];
  };
  detailed_comparison: {
    employees_with_discrepancies: any[];
    employees_not_found: any[];
  };
}

export default function ValidateExcelPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<ExcelData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<{ year: number; month: number } | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const companyId = '9df50bf1-2c78-4c82-bd6c-8e6b0f74e1e0'; // Hardcoded for demo

  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setParseError(null);
    setValidationResult(null);

    // Simular parseo del CSV/Excel
    // En una implementación real, usarías una librería como papaparse o xlsx
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
          setParseError('El archivo debe tener al menos una fila de datos además del header');
          return;
        }

        // Parsear CSV simple (para demo)
        const headers = lines[0].split(',').map(h => h.trim());
        const data: ExcelData[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length >= 5) {
            data.push({
              rut: values[0] || '',
              name: values[1] || '',
              total_haberes: parseFloat(values[2]) || 0,
              total_descuentos: parseFloat(values[3]) || 0,
              total_liquido: parseFloat(values[4]) || 0,
            });
          }
        }

        if (data.length === 0) {
          setParseError('No se pudieron extraer datos válidos del archivo');
          return;
        }

        setExcelData(data);
        console.log('📊 Excel data parsed:', data);

      } catch (error) {
        console.error('Error parsing file:', error);
        setParseError('Error al procesar el archivo. Verifique el formato.');
      }
    };

    reader.readAsText(file);
  };

  const validateWithSystem = async () => {
    if (!selectedPeriod || excelData.length === 0) {
      alert('Seleccione un período y cargue un archivo Excel válido');
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const response = await fetch('/api/payroll/validate-excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_id: companyId,
          period_year: selectedPeriod.year,
          period_month: selectedPeriod.month,
          excel_data: excelData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error en la validación');
      }

      setValidationResult(result);
      console.log('✅ Validation completed:', result);

    } catch (error) {
      console.error('Error validating:', error);
      alert(`Error al validar con el sistema: ${  (error as Error).message}`);
    } finally {
      setIsValidating(false);
    }
  };

  const downloadExampleTemplate = () => {
    const csvContent = `RUT,Nombre Completo,Total Haberes,Total Descuentos,Total Líquido
18.282.594-8,Raquel Mendoza,832103,141457,690646
16.353.500-9,Juan Pérez,529000,93104,435896`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_validacion_excel.csv';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <Calculator className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Validador Excel vs Sistema
              </h1>
              <p className="text-gray-600 mt-2">
                Compara los cálculos de tu Excel con los del sistema para asegurar coherencia total
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <Upload className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900">1. Cargar Excel</h3>
                  <p className="text-sm text-blue-700">Sube tu archivo CSV/Excel</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-purple-900">2. Seleccionar Período</h3>
                  <p className="text-sm text-purple-700">Elige año y mes a validar</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">3. Validar</h3>
                  <p className="text-sm text-green-700">Compara y obtén resultados</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel Izquierdo - Upload y Configuración */}
          <div className="space-y-6">
            {/* Upload de Archivo */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                Cargar Archivo Excel/CSV
              </h2>

              <div className="space-y-4">
                <div
                  className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <p className="text-gray-700 font-medium">
                    {selectedFile ? selectedFile.name : 'Haz clic para seleccionar archivo'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Formatos soportados: CSV, Excel (.xlsx)
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  onClick={downloadExampleTemplate}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Descargar Template de Ejemplo
                </button>

                {parseError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span className="text-red-700 font-medium">Error al procesar archivo</span>
                    </div>
                    <p className="text-red-600 text-sm mt-1">{parseError}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Selección de Período */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold mb-4">Período a Validar</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
                  <select
                    value={selectedPeriod?.year || ''}
                    onChange={(e) => { setSelectedPeriod(prev => ({ ...prev, year: parseInt(e.target.value), month: prev?.month || 10 })); }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar año</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mes</label>
                  <select
                    value={selectedPeriod?.month || ''}
                    onChange={(e) => { setSelectedPeriod(prev => ({ ...prev, month: parseInt(e.target.value), year: prev?.year || 2025 })); }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar mes</option>
                    <option value="10">Octubre</option>
                    <option value="9">Septiembre</option>
                    <option value="8">Agosto</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Datos del Excel Cargado */}
            {excelData.length > 0 && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-semibold mb-4">Datos Cargados del Excel</h2>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {excelData.map((row, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{row.name}</p>
                          <p className="text-sm text-gray-600">{row.rut}</p>
                        </div>
                        <div className="text-right text-sm">
                          <p><span className="text-gray-600">Haberes:</span> {formatCurrency(row.total_haberes)}</p>
                          <p><span className="text-gray-600">Descuentos:</span> {formatCurrency(row.total_descuentos)}</p>
                          <p><span className="text-gray-600">Líquido:</span> {formatCurrency(row.total_liquido)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Totales Excel</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Haberes:</span>
                      <p className="font-semibold">{formatCurrency(excelData.reduce((sum, row) => sum + row.total_haberes, 0))}</p>
                    </div>
                    <div>
                      <span className="text-blue-700">Descuentos:</span>
                      <p className="font-semibold">{formatCurrency(excelData.reduce((sum, row) => sum + row.total_descuentos, 0))}</p>
                    </div>
                    <div>
                      <span className="text-blue-700">Líquido:</span>
                      <p className="font-semibold">{formatCurrency(excelData.reduce((sum, row) => sum + row.total_liquido, 0))}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Panel Derecho - Resultados */}
          <div className="space-y-6">
            {/* Botón de Validación */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <button
                onClick={validateWithSystem}
                disabled={!selectedPeriod || excelData.length === 0 || isValidating}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isValidating ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Validando...
                  </>
                ) : (
                  <>
                    <Calculator className="h-5 w-5" />
                    Validar con Sistema
                  </>
                )}
              </button>
            </div>

            {/* Resultados de Validación */}
            {validationResult && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  {validationResult.validation.is_consistent ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                  Resultados de Validación
                </h2>

                {/* Status General */}
                <div className={`p-4 rounded-lg mb-4 ${validationResult.validation.is_consistent
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-yellow-50 border border-yellow-200'}`}>
                  <p className={`font-medium ${validationResult.validation.is_consistent
                    ? 'text-green-800'
                    : 'text-yellow-800'}`}>
                    {validationResult.validation.is_consistent
                      ? '✅ Los datos coinciden perfectamente'
                      : '⚠️ Se encontraron diferencias'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Período: {validationResult.validation.period}
                  </p>
                </div>

                {/* Comparación de Totales */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Comparación de Totales</h3>

                  <div className="grid grid-cols-1 gap-3">
                    {/* Haberes */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Haberes</span>
                        {validationResult.validation.totals.matches.haberes ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="text-sm mt-2 grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-gray-600">Sistema:</span>
                          <p className="font-semibold">{formatCurrency(validationResult.validation.totals.system.haberes)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Excel:</span>
                          <p className="font-semibold">{formatCurrency(validationResult.validation.totals.excel.haberes)}</p>
                        </div>
                      </div>
                      {validationResult.validation.totals.differences.haberes !== 0 && (
                        <p className="text-xs text-red-600 mt-1">
                          Diferencia: {formatCurrency(validationResult.validation.totals.differences.haberes)}
                        </p>
                      )}
                    </div>

                    {/* Descuentos */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Descuentos</span>
                        {validationResult.validation.totals.matches.descuentos ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="text-sm mt-2 grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-gray-600">Sistema:</span>
                          <p className="font-semibold">{formatCurrency(validationResult.validation.totals.system.descuentos)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Excel:</span>
                          <p className="font-semibold">{formatCurrency(validationResult.validation.totals.excel.descuentos)}</p>
                        </div>
                      </div>
                      {validationResult.validation.totals.differences.descuentos !== 0 && (
                        <p className="text-xs text-red-600 mt-1">
                          Diferencia: {formatCurrency(validationResult.validation.totals.differences.descuentos)}
                        </p>
                      )}
                    </div>

                    {/* Líquido */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Líquido</span>
                        {validationResult.validation.totals.matches.liquido ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="text-sm mt-2 grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-gray-600">Sistema:</span>
                          <p className="font-semibold">{formatCurrency(validationResult.validation.totals.system.liquido)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Excel:</span>
                          <p className="font-semibold">{formatCurrency(validationResult.validation.totals.excel.liquido)}</p>
                        </div>
                      </div>
                      {validationResult.validation.totals.differences.liquido !== 0 && (
                        <p className="text-xs text-red-600 mt-1">
                          Diferencia: {formatCurrency(validationResult.validation.totals.differences.liquido)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recomendaciones */}
                {validationResult.validation.recommendations.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Recomendaciones</h3>
                    <div className="space-y-2">
                      {validationResult.validation.recommendations.map((rec, index) => (
                        <div key={index} className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-blue-800 text-sm">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Estadísticas de Empleados */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="font-medium text-green-800">Empleados Coinciden</p>
                    <p className="text-2xl font-bold text-green-600">{validationResult.validation.employees.matches}</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="font-medium text-red-800">Con Diferencias</p>
                    <p className="text-2xl font-bold text-red-600">{validationResult.validation.employees.discrepancies + validationResult.validation.employees.not_found}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
