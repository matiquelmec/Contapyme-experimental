'use client';

import { useState, useEffect } from 'react';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { Calculator, Plus, FileText, Users, Calendar, Filter, Search, Download, Eye, DollarSign, ArrowRight, CheckCircle, AlertTriangle, Trash2, RotateCcw, Clock } from 'lucide-react';

import { PayrollHeader } from '@/components/layout';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';

interface LiquidationSummary {
  id: string;
  employee_name: string;
  employee_rut: string;
  period_year: number;
  period_month: number;
  days_worked: number;
  base_salary: number;
  legal_gratification_art50: number;
  bonuses: number;
  overtime_amount: number;
  net_salary: number;
  total_gross_income: number;
  total_deductions: number;
  
  // ✅ Campos individuales de descuentos para cálculo dinámico
  afp_amount: number;
  afp_commission_amount: number;
  health_amount: number;
  unemployment_amount: number;
  income_tax_amount: number;
  loan_deductions: number;
  advance_payments: number;
  apv_amount: number;
  other_deductions: number;
  
  status: string;
  created_at: string;
  updated_at: string;
}

interface LiquidationStats {
  total_liquidations: number;
  current_month_total: number;
  pending_count: number;
  review_count: number;
  approved_count: number;
  paid_count: number;
}

export default function LiquidationsPage() {
  const searchParams = useSearchParams();
  const [liquidations, setLiquidations] = useState<LiquidationSummary[]>([]);
  const [stats, setStats] = useState<LiquidationStats>({
    total_liquidations: 0,
    current_month_total: 0,
    pending_count: 0,
    review_count: 0,
    approved_count: 0,
    paid_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterPeriod, setFilterPeriod] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRut, setFilterRut] = useState('');
  const [availableRuts, setAvailableRuts] = useState<string[]>([]);
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  
  // ✅ NUEVOS ESTADOS PARA VALIDACIÓN Y ELIMINACIÓN
  const [validatingLiquidations, setValidatingLiquidations] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [selectedLiquidations, setSelectedLiquidations] = useState<string[]>([]);
  const [deletingLiquidations, setDeletingLiquidations] = useState(false);

  const COMPANY_ID = '8033ee69-b420-4d91-ba0e-482f46cd6fce';
  
  // ✅ OBTENER MES Y AÑO ACTUAL POR DEFECTO
  const getCurrentPeriod = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  };

  useEffect(() => {
    fetchLiquidations();

    // ✅ NO ESTABLECER FILTRO POR DEFECTO - Mostrar todas las liquidaciones inicialmente
    // El usuario puede filtrar manualmente si lo desea
    
    // ✅ REFRESH AUTOMÁTICO: Detectar si se guardó una liquidación
    const saved = searchParams?.get('saved');
    if (saved === 'true') {
      setSavedMessage('✅ Liquidación guardada exitosamente');
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => { setSavedMessage(null); }, 5000);
    }
  }, [searchParams]);

  const fetchLiquidations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/payroll/liquidations?company_id=${COMPANY_ID}&t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();

      if (data.success) {
        // ✅ MOSTRAR TODAS LAS LIQUIDACIONES (sin deduplicar)
        // Ordenar por fecha (más reciente primero)
        const sortedLiquidations = (data.data || []).sort((a: LiquidationSummary, b: LiquidationSummary) => {
          // Primero comparar por año y mes
          const periodA = a.period_year * 100 + a.period_month;
          const periodB = b.period_year * 100 + b.period_month;
          if (periodA !== periodB) return periodB - periodA;
          
          // Si el período es el mismo, comparar por fecha de actualización
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });
        
        // Filtrar solo liquidaciones válidas (con RUT)
        const validLiquidations = sortedLiquidations.filter((l: LiquidationSummary) => l.employee_rut);
        
        // Extraer RUTs y períodos únicos para los filtros
        const uniqueRuts = [...new Set(validLiquidations.map((l: LiquidationSummary) => l.employee_rut))];
        const uniquePeriods = [...new Set(validLiquidations.map((l: LiquidationSummary) => 
          `${l.period_year}-${l.period_month.toString().padStart(2, '0')}`,
        ))].sort().reverse();
        
        setAvailableRuts(uniqueRuts as string[]);
        setAvailablePeriods(uniquePeriods as string[]);
        setLiquidations(validLiquidations);
        calculateStats(validLiquidations);
      } else {
        setError(data.error || 'Error al cargar liquidaciones');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error fetching liquidations:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (liquidationsData: LiquidationSummary[]) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const currentMonthLiquidations = liquidationsData.filter(
      liq => liq.period_month === currentMonth && liq.period_year === currentYear,
    );

    const currentMonthTotal = currentMonthLiquidations.reduce(
      (sum, liq) => sum + calculateNetSalary(liq), 0,
    );

    const pendingCount = liquidationsData.filter(liq => liq.status === 'draft').length;
    const reviewCount = liquidationsData.filter(liq => liq.status === 'review').length;
    const approvedCount = liquidationsData.filter(liq => liq.status === 'approved').length;
    const paidCount = liquidationsData.filter(liq => liq.status === 'paid').length;

    setStats({
      total_liquidations: liquidationsData.length,
      current_month_total: currentMonthTotal,
      pending_count: pendingCount,
      review_count: reviewCount,
      approved_count: approvedCount,
      paid_count: paidCount,
    });
  };

  // Función para limpiar caracteres especiales malformados
  const cleanText = (text: string) => {
    if (!text) return '';
    return text
      .replace(/Ã¡/g, 'á')
      .replace(/Ã©/g, 'é')
      .replace(/Ã­/g, 'í')
      .replace(/Ã³/g, 'ó')
      .replace(/Ãº/g, 'ú')
      .replace(/Ã±/g, 'ñ')
      .replace(/Ã/g, 'Á')
      .replace(/Ã/g, 'É')
      .replace(/Ã/g, 'Í')
      .replace(/Ã/g, 'Ó')
      .replace(/Ã/g, 'Ú')
      .replace(/Ã/g, 'Ñ')
      .replace(/�/g, 'é')
      .trim();
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);

  const formatPeriod = (year: number, month: number) => {
    const monthNames = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
    ];
    return `${monthNames[month - 1]} ${year}`;
  };

  // ✅ FUNCIÓN PARA CALCULAR TOTAL DESCUENTOS DINÁMICAMENTE (SIN SIS - correcto según página individual)
  const calculateTotalDeductions = (liq: LiquidationSummary) => (liq.afp_amount || 0) + 
           (liq.afp_commission_amount || 0) +
           (liq.health_amount || 0) + 
           (liq.unemployment_amount || 0) + 
           (liq.income_tax_amount || 0) +
           (liq.loan_deductions || 0) +
           (liq.advance_payments || 0) +
           (liq.apv_amount || 0) +
           (liq.other_deductions || 0);

  // ✅ CALCULAR LÍQUIDO A PAGAR DINÁMICAMENTE (correcto: 507.750)
  const calculateNetSalary = (liq: LiquidationSummary) => liq.total_gross_income - calculateTotalDeductions(liq);

  // ✅ FUNCIÓN PARA APROBAR LIQUIDACIONES MANUALMENTE
  const approveLiquidations = async () => {
    if (!filterPeriod) {
      alert('Selecciona un período para aprobar las liquidaciones');
      return;
    }

    // Filtrar liquidaciones del período seleccionado que están en estado draft
    const [year, month] = filterPeriod.split('-');
    const periodLiquidations = liquidations.filter(liq =>
      liq.period_year === parseInt(year) &&
      liq.period_month === parseInt(month) &&
      liq.status === 'draft',
    );

    if (periodLiquidations.length === 0) {
      alert('No hay liquidaciones en estado borrador para aprobar en este período');
      return;
    }

    const confirmApproval = confirm(
      `🔒 CONFIRMACIÓN DE APROBACIÓN MASIVA\n\n` +
      `Estás a punto de APROBAR ${periodLiquidations.length} liquidaciones del período ${filterPeriod}.\n\n` +
      `⚠️ Esta acción:\n` +
      `• Cambiará el estado de BORRADOR a APROBADA\n` +
      `• Las liquidaciones aprobadas están listas para pago\n` +
      `• Se puede revertir usando el botón "Revertir Aprobaciones"\n\n` +
      `¿Estás seguro de que quieres aprobar estas liquidaciones?`,
    );

    if (!confirmApproval) return;

    setValidatingLiquidations(true);
    console.log('✅ Starting manual approval for period:', filterPeriod);

    try {
      // Actualizar estado de liquidaciones a "approved"
      const response = await fetch(`/api/payroll/liquidations?company_id=${COMPANY_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          liquidation_ids: periodLiquidations.map(liq => liq.id),
          status: 'approved',
        }),
      });

      const result = await response.json();
      console.log('✅ Validation response:', result);

      if (response.ok && result.success) {
        // Calcular estadísticas para mensaje informativo
        const totalEmployees = [...new Set(liquidations.map(liq => (liq as any).employee_id))].length;
        const employeesWithLiquidation = periodLiquidations.length;
        const missingLiquidations = Math.max(0, totalEmployees - employeesWithLiquidation);
        const percentage = Math.round((employeesWithLiquidation/totalEmployees)*100);
        
        const successMessage = `✅ ${periodLiquidations.length} liquidaciones aprobadas manualmente • 📊 ${employeesWithLiquidation} de ${totalEmployees} empleados (${percentage}%)${missingLiquidations > 0 ? ` • ⚠️ Faltan ${missingLiquidations} liquidaciones` : ''}`;
        setValidationMessage(successMessage);
        fetchLiquidations(); // Refrescar lista

        // 🎯 PREGUNTA OPCIONAL PARA GENERAR LIBRO
        setTimeout(() => {
          const shouldGenerateBook = confirm(
            `🎉 Aprobación completada exitosamente!\n\n` +
            `✅ ${periodLiquidations.length} liquidación(es) aprobada(s)\n` +
            `📅 Período: ${(() => {
              const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
              return `${monthNames[parseInt(month) - 1]} ${year}`;
            })()} \n\n` +
            `¿Deseas generar el Libro de Remuneraciones ahora?`,
          );

          if (shouldGenerateBook) {
            // Redirigir al libro de remuneraciones con período seleccionado
            window.location.href = `/payroll/libro-remuneraciones?period=${filterPeriod}&validated=true`;
          }
        }, 2000);
        
        setTimeout(() => { setValidationMessage(null); }, 8000);
      } else {
        const errorMessage = result.error || `Error ${response.status}: ${response.statusText}`;
        console.error('Validation failed:', errorMessage);
        setValidationMessage(`❌ ${errorMessage}`);
        setTimeout(() => { setValidationMessage(null); }, 8000);
      }
    } catch (error) {
      console.error('Error validating liquidations:', error);
      setValidationMessage('❌ Error de conexión al validar liquidaciones');
      setTimeout(() => { setValidationMessage(null); }, 5000);
    } finally {
      setValidatingLiquidations(false);
    }
  };

  // ✅ FUNCIÓN PARA REVERTIR APROBACIONES (APPROVED → DRAFT)
  const revertApprovals = async () => {
    if (!filterPeriod) {
      alert('Selecciona un período para revertir aprobaciones');
      return;
    }

    // Filtrar liquidaciones del período seleccionado que están aprobadas
    const [year, month] = filterPeriod.split('-');
    const approvedLiquidations = liquidations.filter(liq =>
      liq.period_year === parseInt(year) &&
      liq.period_month === parseInt(month) &&
      liq.status === 'approved',
    );

    if (approvedLiquidations.length === 0) {
      alert('No hay liquidaciones aprobadas para revertir en este período');
      return;
    }

    const confirmRevert = confirm(
      `🔄 CONFIRMACIÓN DE REVERSIÓN DE APROBACIONES\n\n` +
      `Estás a punto de REVERTIR ${approvedLiquidations.length} liquidaciones aprobadas del período ${filterPeriod}.\n\n` +
      `⚠️ Esta acción:\n` +
      `• Cambiará el estado de APROBADA a BORRADOR\n` +
      `• Las liquidaciones volverán a estar en edición\n` +
      `• Solo afecta liquidaciones que NO han sido pagadas\n\n` +
      `¿Estás seguro de que quieres revertir estas aprobaciones?`,
    );

    if (!confirmRevert) return;

    setValidatingLiquidations(true);
    console.log('🔄 Starting approval reversion for period:', filterPeriod);

    try {
      // Actualizar estado de liquidaciones a "draft"
      const response = await fetch(`/api/payroll/liquidations?company_id=${COMPANY_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          liquidation_ids: approvedLiquidations.map(liq => liq.id),
          status: 'draft',
        }),
      });

      const result = await response.json();
      console.log('🔄 Reversion response:', result);

      if (response.ok && result.success) {
        const successMessage = `🔄 ${approvedLiquidations.length} aprobaciones revertidas exitosamente • Las liquidaciones volvieron a estado borrador`;
        setValidationMessage(successMessage);
        fetchLiquidations(); // Refrescar lista
        setTimeout(() => { setValidationMessage(null); }, 5000);
      } else {
        const errorMessage = result.error || `Error ${response.status}: ${response.statusText}`;
        console.error('Reversion failed:', errorMessage);
        setValidationMessage(`❌ ${errorMessage}`);
        setTimeout(() => { setValidationMessage(null); }, 8000);
      }
    } catch (error) {
      console.error('Error reverting approvals:', error);
      setValidationMessage('❌ Error de conexión al revertir aprobaciones');
      setTimeout(() => { setValidationMessage(null); }, 5000);
    } finally {
      setValidatingLiquidations(false);
    }
  };

  // ✅ FUNCIÓN PARA APROBAR LIQUIDACIÓN INDIVIDUAL
  const approveSingleLiquidation = async (liquidationId: string, employeeName: string, event?: React.MouseEvent) => {
    // Prevenir propagación del evento para evitar navegación accidental
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const confirmApproval = confirm(
      `🔒 APROBAR LIQUIDACIÓN INDIVIDUAL\n\n` +
      `¿Estás seguro de que quieres aprobar la liquidación de ${employeeName}?\n\n` +
      `Esta acción cambiará el estado de BORRADOR a APROBADA.`,
    );

    if (!confirmApproval) return;

    setValidatingLiquidations(true);
    try {
      const response = await fetch(`/api/payroll/liquidations?company_id=${COMPANY_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          liquidation_ids: [liquidationId],
          status: 'approved',
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setValidationMessage(`✅ Liquidación de ${employeeName} aprobada exitosamente`);
        fetchLiquidations();
        setTimeout(() => { setValidationMessage(null); }, 3000);
      } else {
        setValidationMessage(`❌ Error al aprobar liquidación: ${result.error}`);
        setTimeout(() => { setValidationMessage(null); }, 5000);
      }
    } catch (error) {
      console.error('Error approving single liquidation:', error);
      setValidationMessage('❌ Error de conexión al aprobar liquidación');
      setTimeout(() => { setValidationMessage(null); }, 5000);
    } finally {
      setValidatingLiquidations(false);
    }
  };

  // ✅ FUNCIÓN PARA REVERTIR APROBACIÓN INDIVIDUAL
  const revertSingleApproval = async (liquidationId: string, employeeName: string, event?: React.MouseEvent) => {
    // Prevenir propagación del evento para evitar navegación accidental
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const confirmRevert = confirm(
      `🔄 REVERTIR APROBACIÓN INDIVIDUAL\n\n` +
      `¿Estás seguro de que quieres revertir la aprobación de ${employeeName}?\n\n` +
      `Esta acción cambiará el estado de APROBADA a BORRADOR.`,
    );

    if (!confirmRevert) return;

    setValidatingLiquidations(true);
    try {
      const response = await fetch(`/api/payroll/liquidations?company_id=${COMPANY_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          liquidation_ids: [liquidationId],
          status: 'draft',
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setValidationMessage(`🔄 Aprobación de ${employeeName} revertida exitosamente`);
        fetchLiquidations();
        setTimeout(() => { setValidationMessage(null); }, 3000);
      } else {
        setValidationMessage(`❌ Error al revertir aprobación: ${result.error}`);
        setTimeout(() => { setValidationMessage(null); }, 5000);
      }
    } catch (error) {
      console.error('Error reverting single approval:', error);
      setValidationMessage('❌ Error de conexión al revertir aprobación');
      setTimeout(() => { setValidationMessage(null); }, 5000);
    } finally {
      setValidatingLiquidations(false);
    }
  };

  // ✅ FUNCIÓN PARA EXPORTAR LOTE DE LIQUIDACIONES
  const handleExportBatch = async () => {
    if (!filterPeriod) {
      alert('⚠️ Selecciona un período específico para exportar el lote de liquidaciones');
      return;
    }

    // Obtener liquidaciones del período seleccionado
    const [year, month] = filterPeriod.split('-');
    const periodLiquidations = liquidations.filter(liq =>
      liq.period_year === parseInt(year) &&
      liq.period_month === parseInt(month),
    );

    if (periodLiquidations.length === 0) {
      alert(`❌ No hay liquidaciones para exportar en el período ${(() => {
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
      })()}`);
      return;
    }

    const confirmExport = confirm(
      `📊 EXPORTAR LOTE DE LIQUIDACIONES\n\n` +
      `Período: ${(() => {
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
      })()} \n` +
      `Liquidaciones a exportar: ${periodLiquidations.length}\n` +
      `Empleados: ${[...new Set(periodLiquidations.map(liq => liq.employee_name))].join(', ')}\n\n` +
      `¿Generar archivo Excel con todas las liquidaciones del período?`,
    );

    if (!confirmExport) return;

    try {
      setValidatingLiquidations(true);
      console.log('📊 Exportando lote para período:', filterPeriod);

      const response = await fetch(`/api/payroll/liquidations/export-batch?company_id=${COMPANY_ID}&period=${filterPeriod}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Descargar archivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `liquidaciones_lote_${filterPeriod}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setValidationMessage(`📊 Lote exportado exitosamente • ${periodLiquidations.length} liquidaciones • Archivo: liquidaciones_lote_${filterPeriod}.xlsx`);
      setTimeout(() => { setValidationMessage(null); }, 5000);

    } catch (error) {
      console.error('Error exporting batch:', error);
      setValidationMessage(`❌ Error al exportar lote: ${error.message}`);
      setTimeout(() => { setValidationMessage(null); }, 8000);
    } finally {
      setValidatingLiquidations(false);
    }
  };

  // ✅ FUNCIÓN PARA ELIMINAR LIQUIDACIONES SELECCIONADAS
  const deleteLiquidations = async () => {
    if (selectedLiquidations.length === 0) {
      alert('Selecciona al menos una liquidación para eliminar');
      return;
    }

    const confirmDelete = confirm(
      `¿Estás seguro de que deseas eliminar ${selectedLiquidations.length} liquidación(es)? Esta acción no se puede deshacer.`,
    );

    if (!confirmDelete) return;

    setDeletingLiquidations(true);
    console.log('🗑️ Deleting liquidations:', selectedLiquidations);
    
    try {
      const response = await fetch(`/api/payroll/liquidations?company_id=${COMPANY_ID}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          liquidation_ids: selectedLiquidations,
        }),
      });

      const result = await response.json();
      console.log('🗑️ Delete response:', result);

      if (response.ok && result.success) {
        setValidationMessage(`🗑️ ${result.message || `${selectedLiquidations.length} liquidación(es) eliminada(s) exitosamente`}`);
        setSelectedLiquidations([]);
        fetchLiquidations(); // Refrescar lista
        setTimeout(() => { setValidationMessage(null); }, 5000);
      } else {
        const errorMessage = result.error || `Error ${response.status}: ${response.statusText}`;
        console.error('Delete failed:', errorMessage);
        setValidationMessage(`❌ ${errorMessage}`);
        setTimeout(() => { setValidationMessage(null); }, 8000);
      }
    } catch (error) {
      console.error('Error deleting liquidations:', error);
      setValidationMessage('❌ Error de conexión al eliminar liquidaciones');
      setTimeout(() => { setValidationMessage(null); }, 5000);
    } finally {
      setDeletingLiquidations(false);
    }
  };

  // ✅ NUEVA FUNCIÓN PARA APROBACIÓN RÁPIDA DESDE DASHBOARD
  const handleQuickApprove = async (liquidationId: string, employeeName: string, event?: React.MouseEvent) => {
    // Prevenir propagación del evento para evitar navegación accidental
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const confirmed = confirm(
      `✅ APROBACIÓN RÁPIDA\n\n` +
      `Empleado: ${cleanText(employeeName)}\n` +
      `Esta liquidación será marcada como aprobada y estará lista para el pago.\n\n` +
      `¿Confirmas la aprobación?`,
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/payroll/liquidations/${liquidationId}?company_id=${COMPANY_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'approved',
          updated_at: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Actualizar las liquidaciones en la lista
        setLiquidations(prev =>
          prev.map(liq =>
            liq.id === liquidationId
              ? { ...liq, status: 'approved' }
              : liq,
          ),
        );

        // Mostrar mensaje de éxito
        setSavedMessage(`✅ Liquidación de ${cleanText(employeeName)} aprobada exitosamente`);
        setTimeout(() => { setSavedMessage(null); }, 4000);

        // Actualizar estadísticas
        updateStats(liquidations.map(liq =>
          liq.id === liquidationId
            ? { ...liq, status: 'approved' }
            : liq,
        ));
      } else {
        alert(`Error al aprobar liquidación: ${data.error || 'Error desconocido'}`);
      }
    } catch (err) {
      console.error('Error approving liquidation:', err);
      alert('Error de conexión al aprobar liquidación');
    }
  };

  // ✅ FUNCIÓN PARA ACTUALIZAR ESTADÍSTICAS CON DATOS NUEVOS
  const updateStats = (liquidationsData: LiquidationSummary[]) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const currentMonthLiquidations = liquidationsData.filter(liq =>
      liq.period_year === currentYear && liq.period_month === currentMonth,
    );

    const currentMonthTotal = currentMonthLiquidations.reduce(
      (sum, liq) => sum + calculateNetSalary(liq), 0,
    );

    const pendingCount = liquidationsData.filter(liq => liq.status === 'draft').length;
    const reviewCount = liquidationsData.filter(liq => liq.status === 'review').length;
    const approvedCount = liquidationsData.filter(liq => liq.status === 'approved').length;
    const paidCount = liquidationsData.filter(liq => liq.status === 'paid').length;

    setStats({
      total_liquidations: liquidationsData.length,
      current_month_total: currentMonthTotal,
      pending_count: pendingCount,
      review_count: reviewCount,
      approved_count: approvedCount,
      paid_count: paidCount,
    });
  };

  // ✅ FUNCIÓN PARA SELECCIONAR/DESELECCIONAR LIQUIDACIÓN
  const toggleLiquidationSelection = (liquidationId: string) => {
    setSelectedLiquidations(prev => 
      prev.includes(liquidationId)
        ? prev.filter(id => id !== liquidationId)
        : [...prev, liquidationId],
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Borrador', class: 'bg-gray-100 text-gray-800' },
      approved: { label: 'Aprobada', class: 'bg-green-100 text-green-800' },
      paid: { label: 'Pagada', class: 'bg-blue-100 text-blue-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const filteredLiquidations = liquidations.filter(liquidation => {
    const matchesSearch = searchTerm === '' || 
      liquidation.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      liquidation.employee_rut.includes(searchTerm);
    
    const matchesStatus = filterStatus === '' || liquidation.status === filterStatus;
    
    const matchesPeriod = filterPeriod === '' || 
      `${liquidation.period_year}-${liquidation.period_month.toString().padStart(2, '0')}` === filterPeriod;
    
    const matchesRut = filterRut === '' || liquidation.employee_rut === filterRut;
    
    return matchesSearch && matchesStatus && matchesPeriod && matchesRut;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <PayrollHeader 
          title="Liquidaciones de Sueldo"
          subtitle="Cargando liquidaciones..."
          showBackButton
        />
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
              <p className="mt-4 text-gray-600">Cargando liquidaciones...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <PayrollHeader 
        title="Liquidaciones de Sueldo"
        subtitle="Gestión y seguimiento de liquidaciones"
        showBackButton
      />

      {/* Hero Section con métricas destacadas */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Título y acciones principales */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Panel de Liquidaciones
              </h1>
              <p className="text-blue-100 text-sm sm:text-base">
                Gestión completa de liquidaciones de sueldo para tu empresa
              </p>
            </div>
            
            {/* Acciones principales - responsive */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                data-export-batch
                onClick={handleExportBatch}
                disabled={validatingLiquidations || !filterPeriod}
                className="group relative px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:bg-gray-500/20 border border-white/20 hover:border-white/40 disabled:border-gray-500/30 backdrop-blur-sm transition-all duration-200 flex items-center justify-center gap-2 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {validatingLiquidations ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                )}
                <span className="text-sm">
                  {validatingLiquidations ? 'Exportando...' : 'Exportar Lote'}
                </span>
              </button>
              <Link href="/payroll/liquidations/generate">
                <button className="w-full sm:w-auto group relative px-4 py-2.5 rounded-xl bg-green-500/80 hover:bg-green-500 border border-green-400/50 hover:border-green-400 backdrop-blur-sm transition-all duration-200 flex items-center justify-center gap-2 text-white font-medium">
                  <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm">Nueva Liquidación</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Stats Cards mejoradas para mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-100" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-2xl font-bold truncate">{stats.total_liquidations}</div>
                  <div className="text-xs text-blue-100 truncate">Total</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-100" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm sm:text-lg font-bold break-words">
                    {formatCurrency(stats.current_month_total)}
                  </div>
                  <div className="text-xs text-green-100 truncate">Mes Actual</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-500/20 rounded-lg">
                  <FileText className="w-5 h-5 text-gray-100" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-2xl font-bold truncate">{stats.pending_count}</div>
                  <div className="text-xs text-gray-100 truncate">Borrador</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-100" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-2xl font-bold truncate">{stats.review_count}</div>
                  <div className="text-xs text-yellow-100 truncate">En Revisión</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-purple-100" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-2xl font-bold truncate">{stats.approved_count}</div>
                  <div className="text-xs text-purple-100 truncate">Aprobada</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-emerald-100" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-2xl font-bold truncate">{stats.paid_count}</div>
                  <div className="text-xs text-emerald-100 truncate">Pagada</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        {/* ✅ NUEVA SECCIÓN: Aprobaciones Pendientes */}
        {stats.review_count > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-yellow-900 mb-1">
                      ⚠️ Liquidaciones Pendientes de Aprobación
                    </CardTitle>
                    <CardDescription className="text-yellow-700">
                      {stats.review_count} liquidación{stats.review_count > 1 ? 'es' : ''} esperando aprobación
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilterStatus('review');
                    // Scroll suave hacia la lista de liquidaciones
                    setTimeout(() => {
                      const listSection = document.querySelector('[data-liquidations-list]');
                      if (listSection) {
                        listSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 100);
                  }}
                  className="bg-yellow-500/20 text-yellow-700 border-yellow-300 hover:bg-yellow-500/30"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Todas en Lista
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {liquidations
                  .filter(liq => liq.status === 'review')
                  .slice(0, 3) // Mostrar máximo 3 para no saturar
                  .map((liq) => (
                    <div key={liq.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-yellow-200/50 hover:bg-white/80 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="font-semibold text-gray-900">
                              {cleanText(liq.employee_name)}
                            </div>
                            <span className="text-sm text-gray-500">({liq.employee_rut})</span>
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                              En Revisión
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>📅 {formatPeriod(liq.period_year, liq.period_month)}</span>
                            <span>💰 {formatCurrency(calculateNetSalary(liq))}</span>
                            <span>📊 {liq.days_worked} días trabajados</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Link href={`/payroll/liquidations/${liq.id}`}>
                            <Button variant="outline" size="sm" className="border-yellow-300 text-yellow-700 hover:bg-yellow-50">
                              <Eye className="w-4 h-4 mr-1" />
                              Revisar
                            </Button>
                          </Link>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={(e) => handleQuickApprove(liq.id, liq.employee_name, e)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aprobar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                {stats.review_count > 3 && (
                  <div className="text-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFilterStatus('review');
                        // Scroll suave hacia la lista de liquidaciones
                        setTimeout(() => {
                          const listSection = document.querySelector('[data-liquidations-list]');
                          if (listSection) {
                            listSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }, 100);
                      }}
                      className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                    >
                      Ver {stats.review_count - 3} liquidaciones más en la lista
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ✅ MENSAJE DE ÉXITO AL GUARDAR LIQUIDACIÓN */}
        {savedMessage && (
          <div className="mb-6 bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-green-800 font-medium">{savedMessage}</p>
              <p className="text-green-700 text-sm">La liquidación aparecerá en la lista a continuación</p>
            </div>
          </div>
        )}

        {/* ✅ MENSAJE DE VALIDACIÓN/ELIMINACIÓN */}
        {validationMessage && (
          <div className={`mb-6 backdrop-blur-sm border rounded-2xl p-4 flex items-center gap-3 ${
            validationMessage.includes('✅') || validationMessage.includes('🗑️') 
              ? 'bg-green-50/80 border-green-200' 
              : validationMessage.includes('⚠️')
              ? 'bg-yellow-50/80 border-yellow-200'
              : 'bg-red-50/80 border-red-200'
          }`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              validationMessage.includes('✅') || validationMessage.includes('🗑️')
                ? 'bg-green-500/10'
                : validationMessage.includes('⚠️')
                ? 'bg-yellow-500/10'
                : 'bg-red-500/10'
            }`}>
              {validationMessage.includes('✅') || validationMessage.includes('🗑️') ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : validationMessage.includes('⚠️') ? (
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <p className={`font-medium ${
                validationMessage.includes('✅') || validationMessage.includes('🗑️')
                  ? 'text-green-800'
                  : validationMessage.includes('⚠️')
                  ? 'text-yellow-800'
                  : 'text-red-800'
              }`}>
                {validationMessage}
              </p>
            </div>
          </div>
        )}

        {/* ✅ PANEL DE VALIDACIÓN Y GESTIÓN DE LIQUIDACIONES */}
        <div className="mb-6 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Información del período seleccionado */}
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Gestión de Liquidaciones
              </h3>
              <p className="text-blue-700 text-sm mb-4">
                Período seleccionado: <span className="font-semibold">
                  {filterPeriod ? (() => {
                    const [year, month] = filterPeriod.split('-');
                    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                    return `${monthNames[parseInt(month) - 1]} ${year}`;
                  })() : 'No seleccionado'}
                </span>
              </p>
              
              {/* Estadísticas del período */}
              {filterPeriod && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-600">
                      {filteredLiquidations.length}
                    </div>
                    <div className="text-xs text-blue-700">Liquidaciones</div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-600">
                      {filteredLiquidations.filter(liq => liq.status === 'approved').length}
                    </div>
                    <div className="text-xs text-green-700">Validadas</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:w-64">
              
              {/* Botón Aprobar Liquidaciones */}
              <button
                onClick={approveLiquidations}
                disabled={validatingLiquidations || !filterPeriod || filteredLiquidations.length === 0}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
              >
                {validatingLiquidations ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {validatingLiquidations ? 'Aprobando...' : '🔒 Aprobar Período'}
                </span>
              </button>

              {/* Botón Revertir Aprobaciones */}
              <button
                onClick={revertApprovals}
                disabled={validatingLiquidations || !filterPeriod || filteredLiquidations.length === 0}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
              >
                {validatingLiquidations ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {validatingLiquidations ? 'Revirtiendo...' : '🔄 Revertir Período'}
                </span>
              </button>
              
              {/* Botón Eliminar Seleccionadas */}
              <button
                onClick={deleteLiquidations}
                disabled={deletingLiquidations || selectedLiquidations.length === 0}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
              >
                {deletingLiquidations ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {deletingLiquidations 
                    ? 'Eliminando...' 
                    : selectedLiquidations.length > 0 
                    ? `Eliminar (${selectedLiquidations.length})` 
                    : 'Eliminar Selec.'
                  }
                </span>
              </button>
              
              {/* Botón Generar Libro */}
              <Link href="/payroll/libro-remuneraciones">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">Generar Libro</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50/80 backdrop-blur-sm border border-red-200">
            <div className="flex items-center text-red-700">
              <FileText className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Filtros modernos y responsivos */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20 mb-6">
          <div className="flex flex-col gap-4">
            {/* Búsqueda principal */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o RUT..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); }}
                className="w-full pl-11 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            
            {/* Filtros en fila para desktop, columnas para mobile */}
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={filterPeriod}
                onChange={(e) => { setFilterPeriod(e.target.value); }}
                className="flex-1 px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">Todos los períodos</option>
                {availablePeriods.map(period => {
                  const [year, month] = period.split('-');
                  const monthNames = [
                    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
                  ];
                  return (
                    <option key={period} value={period}>
                      {monthNames[parseInt(month) - 1]} {year}
                    </option>
                  );
                })}
              </select>

              <select
                value={filterRut}
                onChange={(e) => { setFilterRut(e.target.value); }}
                className="flex-1 px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">Todos los empleados</option>
                {availableRuts.map(rut => {
                  const employee = liquidations.find(l => l.employee_rut === rut);
                  return (
                    <option key={rut} value={rut}>
                      {employee ? `${cleanText(employee.employee_name)} - ${rut}` : rut}
                    </option>
                  );
                })}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); }}
                className="flex-1 px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">Todos los estados</option>
                <option value="draft">Borrador</option>
                <option value="review">En Revisión</option>
                <option value="approved">Aprobada</option>
                <option value="paid">Pagada</option>
                <option value="cancelled">Cancelada</option>
              </select>

              <button 
                onClick={() => {
                  setFilterPeriod('');
                  setFilterRut('');
                  setFilterStatus('');
                  setSearchTerm('');
                }}
                className="sm:w-auto px-4 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-200 hover:border-blue-300 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-blue-700 font-medium">
                <Filter className="h-4 w-4" />
                <span>Limpiar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Lista de liquidaciones modernizada */}
        <div data-liquidations-list>

        {/* Indicador de filtro activo */}
        {filterStatus === 'review' && (
          <div className="mb-4 bg-yellow-50/80 backdrop-blur-sm border border-yellow-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <Eye className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-yellow-800 font-medium">Mostrando solo liquidaciones en revisión</p>
              <p className="text-yellow-700 text-sm">Se han filtrado {liquidations.filter(l => l.status !== 'review').length} liquidaciones con otros estados</p>
            </div>
            <button
              onClick={() => { setFilterStatus(''); }}
              className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-300 text-yellow-700 rounded-lg text-sm font-medium transition-all duration-200"
            >
              Mostrar Todas
            </button>
          </div>
        )}
        {filteredLiquidations.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 sm:p-12 border border-white/20 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calculator className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {liquidations.length === 0 ? 'No hay liquidaciones registradas' : 'No se encontraron liquidaciones'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {liquidations.length === 0 
                ? 'Comience generando su primera liquidación de sueldo para gestionar los pagos de su equipo'
                : 'Intente ajustar los filtros de búsqueda para encontrar las liquidaciones que busca'
              }
            </p>
            <Link href="/payroll/liquidations/generate">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105">
                <Plus className="h-4 w-4" />
                Generar Primera Liquidación
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLiquidations.map((liquidation) => (
              <div key={liquidation.id} className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20 hover:bg-white/80 transition-all duration-200 group">
                {/* Vista mobile-first */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Info principal del empleado */}
                  <div className="flex items-center gap-4 flex-1">
                    {/* ✅ CHECKBOX DE SELECCIÓN */}
                    <div 
                      onClick={() => { toggleLiquidationSelection(liquidation.id); }}
                      className="cursor-pointer p-2 hover:bg-blue-100/50 rounded-lg transition-all duration-200"
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                        selectedLiquidations.includes(liquidation.id)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}>
                        {selectedLiquidations.includes(liquidation.id) && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {cleanText(liquidation.employee_name)}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-600">
                        <span className="truncate">RUT: {liquidation.employee_rut}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{formatPeriod(liquidation.period_year, liquidation.period_month)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Métricas y acciones */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                    {/* Métricas financieras - responsive */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 sm:flex sm:gap-4 gap-3">
                      <div className="text-center sm:text-right">
                        <div className="text-xs text-gray-500 mb-1">Sueldo Base</div>
                        <div className="font-bold text-gray-700 text-sm sm:text-base truncate">
                          {formatCurrency(liquidation.base_salary)}
                        </div>
                      </div>
                      {liquidation.legal_gratification_art50 > 0 && (
                        <div className="text-center sm:text-right">
                          <div className="text-xs text-gray-500 mb-1">Grat. Art.50</div>
                          <div className="font-bold text-purple-600 text-sm sm:text-base truncate">
                            {formatCurrency(liquidation.legal_gratification_art50)}
                          </div>
                        </div>
                      )}
                      <div className="text-center sm:text-right">
                        <div className="text-xs text-gray-500 mb-1">Total Haberes</div>
                        <div className="font-bold text-green-600 text-sm sm:text-base truncate">
                          {formatCurrency(liquidation.total_gross_income)}
                        </div>
                      </div>
                      <div className="text-center sm:text-right">
                        <div className="text-xs text-gray-500 mb-1">Descuentos</div>
                        <div className="font-bold text-red-600 text-sm sm:text-base truncate">
                          {formatCurrency(calculateTotalDeductions(liquidation))}
                        </div>
                      </div>
                      <div className="text-center sm:text-right col-span-2 sm:col-span-1">
                        <div className="text-xs text-gray-500 mb-1">Líquido a Pagar</div>
                        <div className="font-bold text-blue-600 text-base sm:text-lg">
                          {formatCurrency(calculateNetSalary(liquidation))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Status y acciones */}
                    <div className="flex flex-col sm:items-end gap-3">
                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        {getStatusBadge(liquidation.status)}
                      </div>

                      {/* Botones de acción individual */}
                      <div className="flex flex-col gap-2 w-full sm:w-auto">
                        {/* Botón Ver Liquidación */}
                        <Link href={`/payroll/liquidations/${liquidation.id}`} className="w-full sm:w-auto">
                          <button className="w-full sm:w-auto group/btn relative px-4 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 backdrop-blur-sm transition-all duration-200 flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
                            <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            <span>Ver Liquidación</span>
                            <ArrowRight className="w-3 h-3 opacity-50 group-hover/btn:translate-x-0.5 transition-transform" />
                          </button>
                        </Link>

                        {/* Botones de aprobación individual */}
                        {liquidation.status === 'draft' && (
                          <button
                            onClick={(e) => approveSingleLiquidation(liquidation.id, liquidation.employee_name, e)}
                            disabled={validatingLiquidations}
                            className="w-full sm:w-auto group/btn relative px-4 py-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 hover:border-green-500/40 backdrop-blur-sm transition-all duration-200 flex items-center justify-center gap-2 text-green-600 hover:text-green-700 font-medium text-sm disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            <span>🔒 Aprobar</span>
                          </button>
                        )}

                        {liquidation.status === 'approved' && (
                          <button
                            onClick={(e) => revertSingleApproval(liquidation.id, liquidation.employee_name, e)}
                            disabled={validatingLiquidations}
                            className="w-full sm:w-auto group/btn relative px-4 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 hover:border-orange-500/40 backdrop-blur-sm transition-all duration-200 flex items-center justify-center gap-2 text-orange-600 hover:text-orange-700 font-medium text-sm disabled:opacity-50"
                          >
                            <RotateCcw className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            <span>🔄 Revertir</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>

        {/* Acciones Rápidas modernizadas */}
        <div className="mt-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Acciones Rápidas</h3>
              <p className="text-gray-600">Herramientas esenciales para gestión eficiente de liquidaciones</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/payroll/liquidations/generate" className="group">
                <div className="p-6 bg-gradient-to-br from-blue-50/80 to-blue-100/80 rounded-xl border border-blue-200/50 hover:border-blue-300 transition-all duration-200 group-hover:shadow-md group-hover:scale-105">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                      <Calculator className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">Generar Liquidación</h4>
                      <p className="text-sm text-gray-600">Crear nueva liquidación individual con cálculos automáticos</p>
                      <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-xs text-blue-700 rounded-full font-medium">✅ Disponible</span>
                    </div>
                  </div>
                </div>
              </Link>
              
              <div className="group cursor-pointer" onClick={() => {
                const exportButton = document.querySelector('[data-export-batch]') as HTMLButtonElement;
                if (exportButton) {
                  exportButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  exportButton.classList.add('ring-4', 'ring-green-300');
                  setTimeout(() => { exportButton.classList.remove('ring-4', 'ring-green-300'); }, 2000);
                }
              }}>
                <div className="p-6 bg-gradient-to-br from-green-50/80 to-green-100/80 rounded-xl border border-green-200/50 hover:border-green-300 transition-all duration-200 group-hover:shadow-md group-hover:scale-105">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">Exportación en Lote</h4>
                      <p className="text-sm text-gray-600">Exportar múltiples liquidaciones por período</p>
                      <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-xs text-green-700 rounded-full font-medium">✅ Disponible</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Link href="/payroll/settings" className="group">
                <div className="p-6 bg-gradient-to-br from-purple-50/80 to-purple-100/80 rounded-xl border border-purple-200/50 hover:border-purple-300 transition-all duration-200 group-hover:shadow-md group-hover:scale-105">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">Configuración</h4>
                      <p className="text-sm text-gray-600">AFP, Salud, Topes e Indicadores del sistema</p>
                      <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-xs text-purple-700 rounded-full font-medium">✅ Disponible</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
