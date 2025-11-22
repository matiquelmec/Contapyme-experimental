'use client';

import { useState } from 'react';

export default function TestAPIPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testSaveEmployee = async () => {
    setLoading(true);
    setResult('');

    try {
      const employeeId = '4882ba38-25d8-4e9d-b11a-882d34d2af1b';
      const companyId = '8033ee69-b420-4d91-ba0e-482f46cd6fce';

      const testData = {
        first_name: 'Matias TEST',
        last_name: 'Riquelme ACTUALIZADO',
        email: 'test@ejemplo.com',
        phone: '+56912345678',
        address: 'Calle Test 123',
        bank_name: 'BANCO_CHILE',
        bank_account_type: 'cuenta_corriente',
        bank_account_number: '987654321',
        base_salary: 2000000,
        position: 'Desarrollador Senior',
        afp_code: 'HABITAT',
        health_institution_code: 'BANMEDICA'
      };

      console.log('🧪 Enviando datos:', testData);

      const response = await fetch(`/api/payroll/employees/${employeeId}?company_id=${companyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      const responseText = await response.text();
      console.log('📥 Respuesta raw:', responseText);

      try {
        const data = JSON.parse(responseText);
        if (response.ok) {
          setResult(`✅ SUCCESS: ${data.message || 'Empleado actualizado'}`);
        } else {
          setResult(`❌ ERROR: ${data.error || 'Error desconocido'}`);
        }
      } catch (parseError) {
        setResult(`❌ PARSE ERROR: Respuesta no es JSON válido.\n\nRespuesta: ${responseText}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setResult(`❌ NETWORK ERROR: ${error instanceof Error ? error.message : 'Error de conexión'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🧪 Test Directo API</h1>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Test PUT Employee Update</h2>
          <p className="text-gray-600 mb-4">
            Prueba directa de la API sin usar componentes complejos
          </p>

          <button
            onClick={testSaveEmployee}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Probando...' : 'Test Actualizar Empleado'}
          </button>
        </div>

        {result && (
          <div className={`p-6 rounded-lg ${
            result.startsWith('✅')
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <h3 className="font-semibold mb-2">Resultado:</h3>
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}