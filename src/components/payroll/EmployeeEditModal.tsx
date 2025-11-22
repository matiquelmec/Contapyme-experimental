'use client';

import { X } from 'lucide-react';
import EmployeeFormBase, { useEmployeeForm } from './EmployeeFormBase';

interface EmployeeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  onSave: () => void;
}

export default function EmployeeEditModal({ isOpen, onClose, employeeId, onSave }: EmployeeEditModalProps) {
  const { saveEmployee } = useEmployeeForm();

  const handleSave = async (formData: any) => {
    try {
      await saveEmployee(employeeId, formData);
      alert('✅ Datos guardados exitosamente');
      onSave();
      onClose();
    } catch (error) {
      throw error; // Let EmployeeFormBase handle the error display
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Editar Empleado
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          <EmployeeFormBase
            employeeId={employeeId}
            onSave={handleSave}
            onCancel={onClose}
            submitButtonText="Guardar Cambios"
            showAllSections={true}
            compact={true}
          />
        </div>
      </div>
    </div>
  );
}