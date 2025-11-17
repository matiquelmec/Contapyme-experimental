'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  FileText,
  Upload,
  AlertCircle,
  CheckCircle,
  X,
  BarChart3,
  Download,
  TrendingUp,
  Building2,
  Trash2,
  Play,
  Calculator,
  FileDown,
  Activity,
  DollarSign,
  Users,
  AlertTriangle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import MissingEntitiesManager from '@/components/accounting/MissingEntitiesManager';

interface ProveedorSummary {
  rutProveedor: string;
  razonSocial: string;
  totalTransacciones: number;
  transaccionesSuma: number;
  transaccionesResta: number;
  montoExentoTotal: number;
  montoNetoTotal: number;
  montoIVATotal: number;
  montoCalculado: number;
  porcentajeDelTotal: number;
}

interface RCVAnalysis {
  totalTransacciones: number;
  transaccionesSuma: number;
  transaccionesResta: number;
  montoExentoGlobal: number;
  montoNetoGlobal: number;
  montoIVAGlobal: number;
  montoCalculadoGlobal: number;
  proveedoresPrincipales: ProveedorSummary[];
  periodoInicio: string;
  periodoFin: string;
  confidence: number;
  method: string;
}

interface FileResult {
  file: File;
  result: RCVAnalysis | null;
  error: string | null;
  storageResult: any;
  uploading: boolean;
}

interface JournalEntryLine {
  account_code: string;
  account_name: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
}

interface PreliminaryJournalEntry {
  description: string;
  total_debit: number;
  total_credit: number;
  lines: JournalEntryLine[];
  period: string;
  is_balanced: boolean;
}

export default function RCVAnalysisPage() {
  const [files, setFiles] = useState<FileResult[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [rcvType, setRcvType] = useState<'purchase' | 'sales'>('purchase');
  const [storeInDB, setStoreInDB] = useState(true);
  const [globalUploading, setGlobalUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [showDetailed, setShowDetailed] = useState<number | null>(null);
  const [journalEntry, setJournalEntry] = useState<PreliminaryJournalEntry | null>(null);
  const [generatingJournalEntry, setGeneratingJournalEntry] = useState(false);
  const [postingToJournal, setPostingToJournal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const companyId = '8033ee69-b420-4d91-ba0e-482f46cd6fce';

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const csvFiles = droppedFiles.filter(file => file.name.toLowerCase().endsWith('.csv'));

    if (csvFiles.length === 0) {
      alert('Por favor, selecciona archivos CSV válidos');
      return;
    }

    const newFileResults: FileResult[] = csvFiles.map(file => ({
      file,
      result: null,
      error: null,
      storageResult: null,
      uploading: false
    }));

    setFiles(prev => [...prev, ...newFileResults]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const csvFiles = selectedFiles.filter(file => file.name.toLowerCase().endsWith('.csv'));

    if (csvFiles.length === 0) {
      alert('Por favor, selecciona archivos CSV válidos');
      return;
    }

    const newFileResults: FileResult[] = csvFiles.map(file => ({
      file,
      result: null,
      error: null,
      storageResult: null,
      uploading: false
    }));

    setFiles(prev => [...prev, ...newFileResults]);

    if (e.target) {
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (activeTab >= index && activeTab > 0) {
      setActiveTab(prev => prev - 1);
    }
  };

  const clearAllFiles = () => {
    setFiles([]);
    setActiveTab(0);
    setShowDetailed(null);
  };

  const processFile = async (fileIndex: number): Promise<void> => {
    const fileData = files[fileIndex];
    if (!fileData || fileData.uploading) return;

    setFiles(prev => prev.map((f, i) =>
      i === fileIndex ? { ...f, uploading: true, error: null } : f
    ));

    try {
      const formData = new FormData();
      formData.append('file', fileData.file);
      formData.append('company_id', companyId);
      formData.append('rcv_type', rcvType);
      formData.append('store_in_db', storeInDB.toString());

      const response = await fetch('/api/parse-rcv', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.data) {
        setFiles(prev => prev.map((f, i) =>
          i === fileIndex ? {
            ...f,
            uploading: false,
            result: data.data,
            storageResult: data.storage,
            error: null
          } : f
        ));
      } else {
        setFiles(prev => prev.map((f, i) =>
          i === fileIndex ? {
            ...f,
            uploading: false,
            error: data.error || 'Error al procesar el archivo RCV'
          } : f
        ));
      }
    } catch (err) {
      setFiles(prev => prev.map((f, i) =>
        i === fileIndex ? {
          ...f,
          uploading: false,
          error: 'Error de conexión. Inténtalo nuevamente.'
        } : f
      ));
    }
  };

  const handleBatchAnalysis = async () => {
    if (files.length === 0) return;

    setGlobalUploading(true);

    const batchSize = 3;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = [];
      for (let j = 0; j < batchSize && i + j < files.length; j++) {
        batch.push(processFile(i + j));
      }
      await Promise.all(batch);

      if (i + batchSize < files.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setGlobalUploading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      // Manejar formato ISO (YYYY-MM-DD)
      if (dateStr.includes('-')) {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
      }
      // Manejar formato DD/MM/YYYY
      else if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        return `${day}/${month}/${year}`;
      }
      // Si no reconoce el formato, retornar tal como viene
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const formatPeriod = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      // Manejar formato ISO (YYYY-MM-DD)
      if (dateStr.includes('-')) {
        const [year, month, day] = dateStr.split('-');
        return `${year}${month.padStart(2, '0')}`;
      }
      // Manejar formato DD/MM/YYYY
      else if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        return `${year}${month.padStart(2, '0')}`;
      }
      // Si no reconoce el formato, retornar tal como viene
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const generateJournalEntry = async () => {
    if (!result) return;

    setGeneratingJournalEntry(true);

    try {
      const period = formatPeriod(result.periodoInicio);

      const response = await fetch('/api/accounting/rcv-analysis/journal-entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_id: companyId,
          rcv_analysis: result,
          period: period,
          ledger_id: currentFile?.storageResult?.ledger_id || null
        }),
      });

      const data = await response.json();

      if (data.success) {
        setJournalEntry(data.data);
      } else {
        alert('Error al generar el asiento contable: ' + data.error);
      }
    } catch (error) {
      alert('Error de conexión al generar asiento contable');
    } finally {
      setGeneratingJournalEntry(false);
    }
  };

  const postToJournalBook = async () => {
    if (!result || !journalEntry || !journalEntry.is_balanced) {
      alert('El asiento debe estar balanceado antes de contabilizar');
      return;
    }

    setPostingToJournal(true);
    setShowConfirmDialog(false);

    try {
      const period = formatPeriod(result.periodoInicio);
      const ledger_id = currentFile?.storageResult?.ledger_id || null;

      const response = await fetch('/api/accounting/rcv-analysis/post-to-journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_id: companyId,
          rcv_analysis: result,
          preliminary_entry: journalEntry,
          ledger_id: ledger_id,
          period: period
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Asiento contabilizado exitosamente!\n\n` +
              `Número de Asiento: #${data.data.entry_number}\n` +
              `Líneas Contables: ${data.data.total_lines}\n` +
              `Total Debe: ${formatCurrency(data.data.total_debit)}\n` +
              `Total Haber: ${formatCurrency(data.data.total_credit)}\n\n` +
              `El asiento ha sido creado en el libro diario.`);

        setJournalEntry(null);
      } else {
        alert('Error al contabilizar el asiento: ' + data.error);
      }
    } catch (error) {
      alert('Error de conexión al contabilizar asiento');
    } finally {
      setPostingToJournal(false);
    }
  };

  const getGlobalStats = () => {
    const processed = files.filter(f => f.result && !f.error);
    const totalFiles = files.length;
    const totalProcessed = processed.length;
    const totalTransactions = processed.reduce((sum, f) => sum + (f.result?.totalTransacciones || 0), 0);
    const totalAmount = processed.reduce((sum, f) => sum + (f.result?.montoCalculadoGlobal || 0), 0);
    const totalSuppliers = processed.reduce((sum, f) => sum + (f.result?.proveedoresPrincipales.length || 0), 0);

    return {
      totalFiles,
      totalProcessed,
      totalTransactions,
      totalAmount,
      totalSuppliers,
      hasErrors: files.some(f => f.error),
      isProcessing: files.some(f => f.uploading) || globalUploading
    };
  };

  const currentFile = files[activeTab];
  const result = currentFile?.result;

  const chartData = result ? result.proveedoresPrincipales.slice(0, 10).map(p => ({
    name: p.razonSocial.length > 25 ? p.razonSocial.substring(0, 25) + '...' : p.razonSocial,
    fullName: p.razonSocial,
    monto: Math.abs(p.montoCalculado),
    montoReal: p.montoCalculado,
    transacciones: p.totalTransacciones,
    transaccionesSuma: p.transaccionesSuma,
    transaccionesResta: p.transaccionesResta,
    porcentaje: p.porcentajeDelTotal,
    tipo: p.montoCalculado >= 0 ? 'Compras' : 'Devoluciones'
  })) : [];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'];

  const extractFileInfo = (fileName: string) => {
    const match = fileName.match(/RCV_(?:COMPRA|VENTA)_REGISTRO_(\d{7,8}-[\dkK])_(\d{6})/i);

    if (match) {
      const rut = match[1];
      const yearMonth = match[2];

      const year = yearMonth.substring(0, 4);
      const month = yearMonth.substring(4, 6);
      const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      const monthName = monthNames[parseInt(month) - 1];
      const period = `${monthName} ${year}`;

      return { rut, period, yearMonth };
    }

    return {
      rut: '12.345.678-9',
      period: `${formatDate(result?.periodoInicio || '')} - ${formatDate(result?.periodoFin || '')}`,
      yearMonth: result?.periodoInicio?.replace(/\//g, '') || '010125'
    };
  };

  const exportToPDF = async () => {
    if (!result || !currentFile) return;

    setExportingPDF(true);

    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      let currentY = 0;

      const addPageIfNeeded = (neededHeight: number) => {
        if (currentY + neededHeight > pdfHeight - 20) {
          pdf.addPage();
          currentY = 20;
        }
      };

      const captureElement = async (element: HTMLElement) => {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#FFFFFF'
        });
        return canvas.toDataURL('image/png');
      };

      const headerContainer = document.createElement('div');
      headerContainer.style.cssText = `
        position: absolute; left: -9999px; width: 800px; background: white;
        padding: 40px; font-family: Arial, sans-serif;
      `;

      const fileInfo = extractFileInfo(currentFile.file.name);

      headerContainer.innerHTML = `
        <div style="margin-bottom: 30px; text-align: center; border-bottom: 2px solid #3B82F6; padding-bottom: 20px;">
          <h1 style="color: #1E40AF; margin-bottom: 10px; font-size: 28px; font-weight: bold;">ContaPyme - Análisis RCV</h1>
          <h2 style="color: #374151; margin-bottom: 8px; font-size: 20px;">RUT Empresa: ${fileInfo.rut}</h2>
          <p style="color: #6B7280; margin: 5px 0; font-size: 16px; font-weight: 500;">Período: ${fileInfo.period}</p>
          <p style="color: #6B7280; margin: 0; font-size: 14px;">Generado el ${new Date().toLocaleDateString('es-CL')} a las ${new Date().toLocaleTimeString('es-CL')}</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px; margin-bottom: 30px;">
          <div style="background: linear-gradient(135deg, #F3F4F6, #E5E7EB); padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #D1D5DB;">
            <h3 style="color: #374151; margin-bottom: 15px; font-size: 16px; font-weight: 600;">Total Transacciones</h3>
            <p style="color: #1F2937; font-size: 28px; font-weight: bold; margin: 0;">${result.totalTransacciones.toLocaleString()}</p>
          </div>
          <div style="background: linear-gradient(135deg, #F3F4F6, #E5E7EB); padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #D1D5DB;">
            <h3 style="color: #374151; margin-bottom: 15px; font-size: 16px; font-weight: 600;">Total ${rcvType === 'purchase' ? 'Proveedores' : 'Clientes'}</h3>
            <p style="color: #1F2937; font-size: 28px; font-weight: bold; margin: 0;">${result.proveedoresPrincipales.length}</p>
          </div>
          <div style="background: linear-gradient(135deg, #F3F4F6, #E5E7EB); padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #D1D5DB;">
            <h3 style="color: #374151; margin-bottom: 15px; font-size: 16px; font-weight: 600;">Monto Total Calculado</h3>
            <p style="color: ${result.montoCalculadoGlobal >= 0 ? '#1F2937' : '#DC2626'}; font-size: 28px; font-weight: bold; margin: 0;">${formatCurrency(result.montoCalculadoGlobal)}</p>
          </div>
        </div>
      `;

      document.body.appendChild(headerContainer);
      const headerImg = await captureElement(headerContainer);
      document.body.removeChild(headerContainer);

      const headerHeight = 80;
      pdf.addImage(headerImg, 'PNG', 0, currentY, pdfWidth, headerHeight);
      currentY += headerHeight + 10;

      // Capturar gráfico de barras Top 10 Proveedores
      const barChartContainer = document.querySelector('[data-chart="bar"]') as HTMLElement;
      if (barChartContainer) {
        console.log('📊 Capturando gráfico Top 10 Proveedores...');
        addPageIfNeeded(120);
        const barChartImg = await captureElement(barChartContainer);
        pdf.addImage(barChartImg, 'PNG', 5, currentY, pdfWidth - 10, 110);
        currentY += 120;
      }

      // Capturar gráfico de concentración (pie chart)
      const pieChartContainer = document.querySelector('[data-chart="pie"]') as HTMLElement;
      if (pieChartContainer) {
        console.log('📊 Capturando análisis de concentración...');
        addPageIfNeeded(120);
        const pieChartImg = await captureElement(pieChartContainer);
        pdf.addImage(pieChartImg, 'PNG', 5, currentY, pdfWidth - 10, 110);
        currentY += 120;
      }

      // Agregar sección de tabla detallada con mejor control de páginas
      addPageIfNeeded(40);

      // Título de la sección de tabla
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 64, 175); // Blue-700
      pdf.text(`Detalle Completo - Todos los ${rcvType === 'purchase' ? 'Proveedores' : 'Clientes'} (${result.proveedoresPrincipales.length})`, 20, currentY);
      currentY += 20;

      const startY = currentY;
      const rowHeight = 7;
      const colWidths = [30, 75, 20, 35, 20];
      let currentX = 20;

      // Headers de tabla
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setFillColor(59, 130, 246); // Blue-500
      pdf.setTextColor(255, 255, 255); // White text
      pdf.rect(20, currentY, pdfWidth - 40, rowHeight + 2, 'F');

      const headers = ['RUT', 'Razón Social', 'Trans.', 'Monto Calculado', '% Total'];
      headers.forEach((header, i) => {
        pdf.text(header, currentX + 2, currentY + 6);
        currentX += colWidths[i];
      });

      currentY += rowHeight + 4;

      // Datos de tabla con mejor formatting
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);

      result.proveedoresPrincipales.forEach((proveedor, index) => {
        // Verificar si necesita nueva página
        addPageIfNeeded(rowHeight + 3);

        currentX = 20;

        // Fondo alternado para filas
        if (index % 2 === 0) {
          pdf.setFillColor(248, 250, 252); // Gray-50
          pdf.rect(20, currentY - 1, pdfWidth - 40, rowHeight, 'F');
        }

        // RUT
        pdf.setFontSize(8);
        pdf.text(proveedor.rutProveedor, currentX + 2, currentY + 4);
        currentX += colWidths[0];

        // Razón Social (truncar si es muy largo)
        pdf.setFontSize(9);
        const razonSocial = proveedor.razonSocial.length > 32
          ? proveedor.razonSocial.substring(0, 32) + '...'
          : proveedor.razonSocial;
        pdf.text(razonSocial, currentX + 2, currentY + 4);
        currentX += colWidths[1];

        // Transacciones
        pdf.setFontSize(9);
        pdf.text(proveedor.totalTransacciones.toString(), currentX + 8, currentY + 4);
        currentX += colWidths[2];

        // Monto (con color para negativos)
        pdf.setFontSize(9);
        if (proveedor.montoCalculado < 0) {
          pdf.setTextColor(220, 38, 38); // Red for negative amounts
        } else {
          pdf.setTextColor(0, 0, 0);
        }
        const montoText = formatCurrency(proveedor.montoCalculado).replace(/\s+/g, '');
        pdf.text(montoText, currentX + 2, currentY + 4);
        pdf.setTextColor(0, 0, 0);
        currentX += colWidths[3];

        // Porcentaje
        pdf.setFontSize(9);
        pdf.text(`${proveedor.porcentajeDelTotal.toFixed(2)}%`, currentX + 8, currentY + 4);

        currentY += rowHeight;
      });

      // Footer con mejor espaciado y diseño
      addPageIfNeeded(25);
      currentY += 15;

      // Línea separadora
      pdf.setDrawColor(209, 213, 219); // Gray-300
      pdf.line(20, currentY, pdfWidth - 20, currentY);
      currentY += 10;

      pdf.setFontSize(9);
      pdf.setTextColor(107, 114, 128); // Gray-500
      pdf.text('Análisis generado por ContaPyme - Sistema Contable para PyMEs', 20, currentY);
      currentY += 6;
      pdf.setFontSize(8);
      pdf.text(`© 2025 ContaPyme. Reporte generado automáticamente el ${new Date().toLocaleDateString('es-CL')} a las ${new Date().toLocaleTimeString('es-CL')}`, 20, currentY);

      const fileName = `Analisis_RCV_Completo_${fileInfo.rut.replace('-', '')}_${fileInfo.yearMonth}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      alert('Error al generar el PDF. Inténtalo nuevamente.');
    } finally {
      setExportingPDF(false);
    }
  };

  const handleExportResults = () => {
    if (!result || !currentFile) return;

    const csvData = [
      ['RUT Proveedor', 'Razón Social', 'Total Trans.', 'Compras (33/34)', 'Devoluciones (61)', 'Monto Exento', 'Monto Neto', 'Monto IVA', 'Monto Calculado', 'Porcentaje'],
      ...result.proveedoresPrincipales.map(p => [
        p.rutProveedor,
        p.razonSocial,
        p.totalTransacciones.toString(),
        p.transaccionesSuma.toString(),
        p.transaccionesResta.toString(),
        p.montoExentoTotal.toString(),
        p.montoNetoTotal.toString(),
        p.montoIVATotal.toString(),
        p.montoCalculado.toString(),
        p.porcentajeDelTotal.toFixed(2) + '%'
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `RCV_${currentFile.file.name.replace('.csv', '')}_${result.periodoInicio.replace(/\//g, '')}_${result.periodoFin.replace(/\//g, '')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const stats = getGlobalStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Redesigned */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden mx-4 mt-6 max-w-7xl lg:mx-auto">
        <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Análisis RCV Inteligente</h1>
              <p className="text-slate-300 text-sm">
                Procesa múltiples registros de compras y ventas con análisis automático de proveedores y clientes
              </p>
            </div>
            <Link href="/accounting">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                <Activity className="w-4 h-4" />
                <span>Centro Contable</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        {files.length > 0 && (
          <div className="grid grid-cols-3 divide-x divide-gray-200 bg-gray-50">
            <div className="px-6 py-4 text-center">
              <div className="text-lg font-semibold text-gray-900">{stats.totalProcessed}/{stats.totalFiles}</div>
              <div className="text-sm text-gray-600">Archivos Procesados</div>
            </div>
            <div className="px-6 py-4 text-center">
              <div className="text-lg font-semibold text-gray-900">{stats.totalTransactions.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Transacciones</div>
            </div>
            <div className="px-6 py-4 text-center">
              <div className="text-lg font-semibold text-gray-900">{formatCurrency(stats.totalAmount)}</div>
              <div className="text-sm text-gray-600">Monto Total</div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 space-y-8">

        {/* Upload Section - Simplified */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Cargar Archivos RCV</h3>
                  <p className="text-sm text-gray-600">Arrastra múltiples archivos CSV del SII aquí</p>
                </div>
              </div>
              {files.length > 0 && (
                <button
                  onClick={clearAllFiles}
                  className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Limpiar Todo
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors mb-6 ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Arrastra archivos RCV aquí
              </h4>
              <p className="text-gray-600 mb-4">
                o haz clic para seleccionar archivos CSV
              </p>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                Seleccionar Archivos
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Files List */}
            {files.length > 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Tipo de RCV */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de RCV
                    </label>
                    <select
                      value={rcvType}
                      onChange={(e) => setRcvType(e.target.value as 'purchase' | 'sales')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={globalUploading || files.some(f => f.uploading)}
                    >
                      <option value="purchase">📈 Registro de Compras</option>
                      <option value="sales">💰 Registro de Ventas</option>
                    </select>
                  </div>

                  {/* Almacenar en BD */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Almacenamiento
                    </label>
                    <label className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        checked={storeInDB}
                        onChange={(e) => setStoreInDB(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        disabled={globalUploading || files.some(f => f.uploading)}
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        💾 Guardar en base de datos
                      </span>
                    </label>
                  </div>
                </div>

                {/* Files Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {files.map((fileData, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            fileData.uploading ? 'bg-yellow-500 animate-pulse' :
                            fileData.error ? 'bg-red-500' :
                            fileData.result ? 'bg-green-500' : 'bg-gray-300'
                          }`}></div>
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {fileData.file.name}
                          </span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          disabled={fileData.uploading}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-xs text-gray-500 mb-2">
                        {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                      </div>

                      {fileData.uploading && (
                        <div className="text-xs text-yellow-600 mb-2">
                          🔄 Procesando...
                        </div>
                      )}

                      {fileData.error && (
                        <div className="text-xs text-red-600 mb-2">
                          ❌ {fileData.error}
                        </div>
                      )}

                      {fileData.result && !fileData.error && (
                        <div className="text-xs text-green-600 mb-2">
                          ✅ {fileData.result.totalTransacciones} transacciones
                          {fileData.storageResult && ' • Almacenado'}
                        </div>
                      )}

                      {fileData.result && (
                        <button
                          onClick={() => setActiveTab(index)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-sm font-medium"
                        >
                          Ver Análisis
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Process Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleBatchAnalysis}
                    disabled={globalUploading || files.some(f => f.uploading)}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    {globalUploading ? 'Procesando...' : `Procesar ${files.length} Archivo${files.length !== 1 ? 's' : ''}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        {files.some(f => f.result) && (
          <>
            {/* File Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-4">
                <h3 className="text-xl font-bold text-white">Resultados del Análisis</h3>
                <p className="text-slate-300 text-sm">Análisis inteligente de {rcvType === 'purchase' ? 'compras' : 'ventas'} y gestión automatizada</p>
              </div>

              <div className="border-b border-gray-200 bg-gray-50">
                <div className="flex flex-wrap gap-2 p-4">
                  {files.map((fileData, index) => (
                    fileData.result && (
                      <button
                        key={index}
                        onClick={() => setActiveTab(index)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          activeTab === index
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                        }`}
                      >
                        {fileData.file.name.replace('.csv', '')}
                      </button>
                    )
                  ))}
                </div>
              </div>

              <div className="p-6">

                {/* Current File Results */}
                {currentFile?.result && (
                  <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-600 rounded-lg shadow-sm">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Transacciones</p>
                            <p className="text-2xl font-bold text-blue-900">{result!.totalTransacciones.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-600 rounded-lg shadow-sm">
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-green-700 uppercase tracking-wide">
                              {rcvType === 'purchase' ? 'Proveedores' : 'Clientes'}
                            </p>
                            <p className="text-2xl font-bold text-green-900">{result!.proveedoresPrincipales.length}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-600 rounded-lg shadow-sm">
                            <DollarSign className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">Monto Total</p>
                            <p className={`text-2xl font-bold ${result!.montoCalculadoGlobal >= 0 ? 'text-purple-900' : 'text-red-600'}`}>
                              {formatCurrency(Math.abs(result!.montoCalculadoGlobal / 1000000))}M
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-600 rounded-lg shadow-sm">
                            <BarChart3 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-orange-700 uppercase tracking-wide">Período</p>
                            <p className="text-sm font-bold text-orange-900">
                              {formatDate(result!.periodoInicio)} - {formatDate(result!.periodoFin)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Missing Entities Manager */}
                    <MissingEntitiesManager
                      rcvAnalysis={result}
                      rcvType={rcvType}
                      companyId={companyId}
                      onEntitiesAdded={() => {
                        console.log('🔄 Entidades agregadas');
                      }}
                    />

                    {/* Charts Section - Redesigned */}
                    <div className="space-y-8">
                      {/* Top 10 Ranking - Enhanced */}
                      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow" data-chart="bar">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white rounded-lg">
                                <BarChart3 className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="text-xl font-bold text-white">Top 10 {rcvType === 'purchase' ? 'Proveedores' : 'Clientes'}</h4>
                                <p className="text-blue-100 text-sm">Ranking por volumen de {rcvType === 'purchase' ? 'compras' : 'ventas'} - Análisis de concentración</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-white text-sm opacity-90">Total Analizado</div>
                              <div className="text-white text-lg font-bold">{formatCurrency(result!.montoCalculadoGlobal)}</div>
                            </div>
                          </div>
                        </div>

                        <div className="p-6">
                          {/* Chart Stats */}
                          <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <div className="text-xs font-medium text-blue-700 uppercase tracking-wide">Top 3 Concentración</div>
                              <div className="text-lg font-bold text-blue-900">
                                {chartData.slice(0, 3).reduce((sum, item) => sum + item.porcentaje, 0).toFixed(1)}%
                              </div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="text-xs font-medium text-green-700 uppercase tracking-wide">Mayor {rcvType === 'purchase' ? 'Proveedor' : 'Cliente'}</div>
                              <div className="text-lg font-bold text-green-900">
                                {chartData[0]?.porcentaje?.toFixed(1) || '0'}%
                              </div>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                              <div className="text-xs font-medium text-purple-700 uppercase tracking-wide">Promedio Top 10</div>
                              <div className="text-lg font-bold text-purple-900">
                                {(chartData.reduce((sum, item) => sum + item.porcentaje, 0) / Math.max(chartData.length, 1)).toFixed(1)}%
                              </div>
                            </div>
                          </div>

                          {/* Chart */}
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis
                                  dataKey="name"
                                  angle={-45}
                                  textAnchor="end"
                                  height={80}
                                  fontSize={11}
                                  tick={{ fill: '#64748b' }}
                                />
                                <YAxis
                                  tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                                  tick={{ fill: '#64748b', fontSize: 11 }}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '12px'
                                  }}
                                  formatter={(value: number, name: string) => [formatCurrency(value), 'Monto Total']}
                                  labelFormatter={(label) => {
                                    const item = chartData.find(d => d.name === label);
                                    return item ? `${item.fullName}` : label;
                                  }}
                                />
                                <Bar
                                  dataKey="monto"
                                  fill="url(#blueGradient)"
                                  radius={[4, 4, 0, 0]}
                                />
                                <defs>
                                  <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#1d4ed8" />
                                  </linearGradient>
                                </defs>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      {/* Distribution Analysis */}
                      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow" data-chart="pie">
                        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white rounded-lg">
                                <TrendingUp className="w-6 h-6 text-purple-600" />
                              </div>
                              <div>
                                <h4 className="text-xl font-bold text-white">Análisis de Concentración</h4>
                                <p className="text-purple-100 text-sm">Distribución de riesgo y dependencia por {rcvType === 'purchase' ? 'proveedor' : 'cliente'}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-white text-sm opacity-90">Total Entidades</div>
                              <div className="text-white text-lg font-bold">{result!.proveedoresPrincipales.length}</div>
                            </div>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Pie Chart */}
                            <div>
                              <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={chartData.slice(0, 8).map((item, index) => ({
                                        ...item,
                                        fill: COLORS[index % COLORS.length]
                                      }))}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={60}
                                      outerRadius={120}
                                      paddingAngle={2}
                                      dataKey="porcentaje"
                                      nameKey="name"
                                      label={false}
                                    >
                                      {chartData.slice(0, 8).map((entry, index) => (
                                        <Cell
                                          key={`cell-${index}`}
                                          fill={COLORS[index % COLORS.length]}
                                        />
                                      ))}
                                    </Pie>
                                    <Tooltip
                                      contentStyle={{
                                        backgroundColor: '#0f172a',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: 'white',
                                        fontSize: '12px',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)'
                                      }}
                                      content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                          const data = payload[0].payload;
                                          return (
                                            <div style={{
                                              backgroundColor: '#0f172a',
                                              border: '1px solid #334155',
                                              borderRadius: '8px',
                                              color: 'white',
                                              fontSize: '12px',
                                              padding: '8px 12px',
                                              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)'
                                            }}>
                                              <p style={{ margin: 0, fontWeight: 'bold', marginBottom: '4px' }}>
                                                {data.fullName}
                                              </p>
                                              <p style={{ margin: 0, color: '#94a3b8' }}>
                                                Participación: {Number(data.porcentaje).toFixed(1)}%
                                              </p>
                                            </div>
                                          );
                                        }
                                        return null;
                                      }}
                                    />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                            </div>

                            {/* Legend & Analysis */}
                            <div className="space-y-4">
                              <div>
                                <h5 className="text-sm font-semibold text-gray-900 mb-3">Distribución por Entidad</h5>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                  {chartData.slice(0, 8).map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-3 h-3 rounded-full"
                                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        ></div>
                                        <span className="text-sm font-medium text-gray-700 truncate max-w-32">
                                          {item.fullName}
                                        </span>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-sm font-bold text-gray-900">{item.porcentaje.toFixed(1)}%</div>
                                        <div className="text-xs text-gray-500">{formatCurrency(item.monto / 1000000)}M</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Risk Analysis */}
                              <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                                  <span className="text-sm font-medium text-amber-800">Análisis de Concentración</span>
                                </div>
                                <div className="text-xs text-amber-700 space-y-1">
                                  <div>• Top 3: {chartData.slice(0, 3).reduce((sum, item) => sum + item.porcentaje, 0).toFixed(1)}% del volumen total</div>
                                  <div>• Mayor dependencia: {chartData[0]?.fullName} ({chartData[0]?.porcentaje?.toFixed(1)}%)</div>
                                  <div>• Nivel de riesgo: {chartData[0]?.porcentaje > 30 ? 'Alto' : chartData[0]?.porcentaje > 15 ? 'Medio' : 'Bajo'}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1 bg-blue-600 rounded">
                          <Play className="w-4 h-4 text-white" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">Acciones Disponibles</h4>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <button
                          onClick={handleExportResults}
                          className="bg-white hover:bg-green-50 text-green-700 border border-green-200 px-4 py-3 rounded-lg font-medium flex items-center gap-2 transition-all hover:shadow-sm"
                        >
                          <Download className="w-4 h-4" />
                          Exportar CSV
                        </button>
                        <button
                          onClick={exportToPDF}
                          disabled={exportingPDF}
                          className="bg-white hover:bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-lg font-medium flex items-center gap-2 transition-all hover:shadow-sm disabled:opacity-50"
                        >
                          <FileDown className="w-4 h-4" />
                          {exportingPDF ? 'Generando PDF...' : 'Exportar PDF'}
                        </button>
                        <button
                          onClick={() => setShowDetailed(showDetailed === activeTab ? null : activeTab)}
                          className="bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 px-4 py-3 rounded-lg font-medium flex items-center gap-2 transition-all hover:shadow-sm"
                        >
                          <BarChart3 className="w-4 h-4" />
                          {showDetailed === activeTab ? 'Ocultar Detalle' : 'Ver Detalle'}
                        </button>
                        <button
                          onClick={generateJournalEntry}
                          disabled={generatingJournalEntry}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
                        >
                          <Calculator className="w-4 h-4" />
                          {generatingJournalEntry ? 'Generando...' : 'Generar Asiento'}
                        </button>
                      </div>
                    </div>

                    {/* Detailed Table */}
                    {showDetailed === activeTab && result && (
                      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg">
                              <Users className="w-5 h-5 text-slate-900" />
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-white">Detalle Completo - {currentFile.file.name}</h4>
                              <p className="text-slate-300 text-sm">Lista completa de {rcvType === 'purchase' ? 'proveedores' : 'clientes'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="text-left p-3 font-semibold text-gray-900">RUT</th>
                                <th className="text-left p-3 font-semibold text-gray-900">Razón Social</th>
                                <th className="text-center p-3 font-semibold text-gray-900">Trans.</th>
                                <th className="text-center p-3 font-semibold text-gray-900">Compras/Dev.</th>
                                <th className="text-right p-3 font-semibold text-gray-900">Monto Exento</th>
                                <th className="text-right p-3 font-semibold text-gray-900">Monto Neto</th>
                                <th className="text-right p-3 font-semibold text-gray-900">Monto IVA</th>
                                <th className="text-right p-3 font-semibold text-gray-900">Total</th>
                                <th className="text-center p-3 font-semibold text-gray-900">%</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {result.proveedoresPrincipales.map((proveedor, index) => (
                                <tr key={proveedor.rutProveedor} className="hover:bg-gray-50">
                                  <td className="p-3 font-mono text-sm">{proveedor.rutProveedor}</td>
                                  <td className="p-3">{proveedor.razonSocial}</td>
                                  <td className="p-3 text-center">{proveedor.totalTransacciones}</td>
                                  <td className="p-3 text-center">
                                    <span className="text-green-600 font-medium">{proveedor.transaccionesSuma}</span>
                                    {proveedor.transaccionesResta > 0 && (
                                      <span className="text-red-600 font-medium"> (-{proveedor.transaccionesResta})</span>
                                    )}
                                  </td>
                                  <td className="p-3 text-right">{formatCurrency(proveedor.montoExentoTotal)}</td>
                                  <td className="p-3 text-right">{formatCurrency(proveedor.montoNetoTotal)}</td>
                                  <td className="p-3 text-right">{formatCurrency(proveedor.montoIVATotal)}</td>
                                  <td className={`p-3 text-right font-semibold ${proveedor.montoCalculado >= 0 ? '' : 'text-red-600'}`}>
                                    {formatCurrency(proveedor.montoCalculado)}
                                  </td>
                                  <td className="p-3 text-center">
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      proveedor.porcentajeDelTotal >= 10 ? 'bg-red-100 text-red-800' :
                                      proveedor.porcentajeDelTotal >= 5 ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {proveedor.porcentajeDelTotal.toFixed(2)}%
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Journal Entry Section */}
                    {journalEntry && (
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                          <div className="flex items-center gap-3">
                            <Calculator className="w-5 h-5 text-green-600" />
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">Asiento Contable Preliminar</h4>
                              <p className="text-sm text-gray-600">
                                {journalEntry.description} - Período: {journalEntry.period}
                                {journalEntry.is_balanced ? (
                                  <span className="text-green-600 ml-2">✅ Balanceado</span>
                                ) : (
                                  <span className="text-red-600 ml-2">⚠️ Desbalanceado</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-6">
                          {/* Summary */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <p className="text-sm font-medium text-blue-600">Total Debe</p>
                              <p className="text-xl font-bold text-blue-900">
                                {formatCurrency(journalEntry.total_debit)}
                              </p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                              <p className="text-sm font-medium text-green-600">Total Haber</p>
                              <p className="text-xl font-bold text-green-900">
                                {formatCurrency(journalEntry.total_credit)}
                              </p>
                            </div>
                            <div className={`p-4 rounded-lg ${
                              journalEntry.is_balanced ? 'bg-green-50' : 'bg-red-50'
                            }`}>
                              <p className={`text-sm font-medium ${
                                journalEntry.is_balanced ? 'text-green-600' : 'text-red-600'
                              }`}>Diferencia</p>
                              <p className={`text-xl font-bold ${
                                journalEntry.is_balanced ? 'text-green-900' : 'text-red-900'
                              }`}>
                                {formatCurrency(Math.abs(journalEntry.total_debit - journalEntry.total_credit))}
                              </p>
                            </div>
                          </div>

                          {/* Journal Entry Lines */}
                          <div className="overflow-x-auto mb-6">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="text-left p-3 font-semibold">Código</th>
                                  <th className="text-left p-3 font-semibold">Cuenta</th>
                                  <th className="text-left p-3 font-semibold">Descripción</th>
                                  <th className="text-right p-3 font-semibold">Debe</th>
                                  <th className="text-right p-3 font-semibold">Haber</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {journalEntry.lines.map((line, index) => (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td className="p-3 font-mono text-sm">{line.account_code}</td>
                                    <td className="p-3 font-medium">{line.account_name}</td>
                                    <td className="p-3 text-gray-700">{line.description}</td>
                                    <td className="p-3 text-right font-mono">
                                      {line.debit_amount > 0 ? formatCurrency(line.debit_amount) : '-'}
                                    </td>
                                    <td className="p-3 text-right font-mono">
                                      {line.credit_amount > 0 ? formatCurrency(line.credit_amount) : '-'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr className="border-t-2 bg-gray-50 font-semibold">
                                  <td colSpan={3} className="p-3 text-right">TOTALES:</td>
                                  <td className="p-3 text-right font-mono">
                                    {formatCurrency(journalEntry.total_debit)}
                                  </td>
                                  <td className="p-3 text-right font-mono">
                                    {formatCurrency(journalEntry.total_credit)}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>

                          {/* Action Buttons for Journal Entry */}
                          <div className="flex flex-wrap gap-3 pt-4 border-t">
                            <button
                              disabled={!journalEntry.is_balanced || postingToJournal}
                              onClick={() => {
                                if (journalEntry.is_balanced) {
                                  setShowConfirmDialog(true);
                                } else {
                                  alert('El asiento debe estar balanceado antes de poder crearlo.');
                                }
                              }}
                              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              {postingToJournal ? 'Contabilizando...' :
                               journalEntry.is_balanced ? 'Contabilizar' : 'Desbalanceado'}
                            </button>
                            <button
                              onClick={() => {
                                const csvData = [
                                  ['Código Cuenta', 'Nombre Cuenta', 'Descripción', 'Debe', 'Haber'],
                                  ...journalEntry.lines.map(line => [
                                    line.account_code,
                                    line.account_name,
                                    line.description,
                                    line.debit_amount.toString(),
                                    line.credit_amount.toString()
                                  ]),
                                  ['', '', 'TOTALES:', journalEntry.total_debit.toString(), journalEntry.total_credit.toString()]
                                ];

                                const csvContent = csvData.map(row => row.join(',')).join('\n');
                                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                const link = document.createElement('a');

                                if (link.download !== undefined) {
                                  const url = URL.createObjectURL(blob);
                                  link.setAttribute('href', url);
                                  link.setAttribute('download', `AsientoRCV_${journalEntry.period}.csv`);
                                  link.style.visibility = 'hidden';
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }
                              }}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Exportar CSV
                            </button>
                            <button
                              onClick={() => setJournalEntry(null)}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                            >
                              <X className="w-4 h-4" />
                              Cerrar
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Confirmation Dialog */}
                    {showConfirmDialog && journalEntry && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                          <div className="flex items-center space-x-2 mb-4">
                            <AlertCircle className="w-6 h-6 text-yellow-600" />
                            <h3 className="text-lg font-semibold">Confirmar Contabilización</h3>
                          </div>

                          <div className="mb-6">
                            <p className="text-gray-700 mb-4">
                              ¿Estás seguro de que deseas contabilizar este asiento?
                            </p>

                            <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                              <p><strong>Descripción:</strong> {journalEntry.description}</p>
                              <p><strong>Período:</strong> {journalEntry.period}</p>
                              <p><strong>Líneas:</strong> {journalEntry.lines.length}</p>
                              <p><strong>Total Debe:</strong> {formatCurrency(journalEntry.total_debit)}</p>
                              <p><strong>Total Haber:</strong> {formatCurrency(journalEntry.total_credit)}</p>
                            </div>
                          </div>

                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => setShowConfirmDialog(false)}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={postToJournalBook}
                              disabled={postingToJournal}
                              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Confirmar
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}