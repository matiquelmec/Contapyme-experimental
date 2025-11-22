'use client';

import { useState } from 'react';
import EmployeeEditModal from '@/components/payroll/EmployeeEditModal';

export default function TestPage() {
  const [showModal, setShowModal] = useState(false);

  const employeeId = '4882ba38-25d8-4e9d-b11a-882d34d2af1b'; // Mati Riquelme

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">🧪 Test Guardar Empleado</h1>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="mb-4">Test para verificar el guardado de empleado "Mati Riquelme"</p>

          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Editar Empleado (Mati)
          </button>

          {showModal && (
            <EmployeeEditModal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              employeeId={employeeId}
              onSave={() => {
                setShowModal(false);
                alert('✅ Empleado guardado exitosamente!');
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}