'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Header } from '@/components/layout';
import EmployeeFormBase, { useEmployeeForm } from '@/components/payroll/EmployeeFormBase';

export default function EditEmployeePage() {
  const params = useParams();
  const router = useRouter();
  const { saveEmployee } = useEmployeeForm();

  const handleSave = async (formData: any) => {
    try {
      await saveEmployee(params.id as string, formData);
      router.push(`/payroll/employees/${params.id}`);
    } catch (error) {
      throw error; // Let EmployeeFormBase handle the error display
    }
  };

  const handleCancel = () => {
    router.push(`/payroll/employees/${params.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header
        title="Editar Empleado"
        subtitle="Actualizar información del empleado"
        showBackButton
        actions={
          <Link href={`/payroll/employees/${params.id}`}>
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span>Volver</span>
            </button>
          </Link>
        }
      />

      <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <EmployeeFormBase
            employeeId={params.id as string}
            onSave={handleSave}
            onCancel={handleCancel}
            submitButtonText="Guardar Cambios"
            showAllSections={true}
            compact={false}
          />
        </div>
      </div>
    </div>
  );
}