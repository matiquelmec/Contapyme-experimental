'use client';

import { useState, useEffect } from 'react';
import { Save, User, Mail, Phone, MapPin, Briefcase, DollarSign, Shield } from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';

// Interfaces unificadas
interface Employee {
  id: string;
  rut: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  birth_date?: string;
  hire_date?: string;
  status: string;
  bank_name?: string;
  bank_account_type?: string;
  bank_account_number?: string;
}

interface Contract {
  id?: string;
  base_salary: number;
  contract_type: string;
  position: string;
}

interface PayrollConfig {
  afp_code: string;
  health_institution_code: string;
  family_allowances: number;
  legal_gratification_type: string;
}

interface EmployeeFormData {
  // Información personal
  first_name: string;
  last_name: string;
  rut: string;
  email: string;
  phone: string;
  address: string;
  birth_date: string;
  hire_date: string;
  status: string;

  // Información bancaria
  bank_name: string;
  bank_account_type: string;
  bank_account_number: string;

  // Información contractual
  base_salary: number;
  contract_type: string;
  position: string;

  // Información previsional
  afp_code: string;
  health_institution_code: string;
  family_allowances: number;
  legal_gratification_type: string;
}

interface EmployeeFormBaseProps {
  employeeId?: string; // undefined = crear nuevo, string = editar existente
  initialData?: Partial<EmployeeFormData>;
  onSave: (data: EmployeeFormData) => Promise<void>;
  onCancel: () => void;
  submitButtonText?: string;
  showAllSections?: boolean;
  compact?: boolean; // true = modal style, false = full page style
}

const defaultFormData: EmployeeFormData = {
  // Información personal
  first_name: '',
  last_name: '',
  rut: '',
  email: '',
  phone: '',
  address: '',
  birth_date: '',
  hire_date: '',
  status: 'active',

  // Información bancaria
  bank_name: '',
  bank_account_type: 'cuenta_vista',
  bank_account_number: '',

  // Información contractual
  base_salary: 0,
  contract_type: 'indefinido',
  position: '',

  // Información previsional
  afp_code: 'HABITAT',
  health_institution_code: 'FONASA',
  family_allowances: 0,
  legal_gratification_type: 'none',
};

export default function EmployeeFormBase({
  employeeId,
  initialData = {},
  onSave,
  onCancel,
  submitButtonText = 'Guardar',
  showAllSections = true,
  compact = false
}: EmployeeFormBaseProps) {
  const { company } = useCompany();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<EmployeeFormData>({
    ...defaultFormData,
    ...initialData
  });

  // Cargar datos del empleado si es edición
  useEffect(() => {
    if (employeeId) {
      loadEmployeeData();
    }
  }, [employeeId]);

  const loadEmployeeData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/payroll/employees/${employeeId}?company_id=${company.id}&t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });

      const data = await response.json();

      if (data.success && data.data) {
        const employee = data.data;
        const contract = employee.employment_contracts?.[0];
        const payrollConfig = employee.payroll_config;

        setFormData({
          // Información personal
          first_name: employee.first_name || '',
          last_name: employee.last_name || '',
          rut: employee.rut || '',
          email: employee.email || '',
          phone: employee.phone || '',
          address: employee.address || '',
          birth_date: employee.birth_date || '',
          hire_date: contract?.start_date || '',
          status: employee.status || 'active',

          // Información bancaria
          bank_name: employee.bank_name || '',
          bank_account_type: employee.bank_account_type || 'cuenta_vista',
          bank_account_number: employee.bank_account_number || '',

          // Información contractual
          base_salary: contract?.base_salary || 0,
          contract_type: contract?.contract_type || 'indefinido',
          position: contract?.position || '',

          // Información previsional
          afp_code: payrollConfig?.afp_code || 'HABITAT',
          health_institution_code: payrollConfig?.health_institution_code || 'FONASA',
          family_allowances: payrollConfig?.family_allowances || 0,
          legal_gratification_type: payrollConfig?.legal_gratification_type || 'none',
        });
      } else {
        setError(data.error || 'Error al cargar datos del empleado');
      }
    } catch (err) {
      setError('Error de conexión al servidor');
      console.error('Error loading employee data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : 0) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setError('Nombre y apellido son obligatorios');
      return;
    }

    if (!formData.rut.trim()) {
      setError('RUT es obligatorio');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const FormSection = ({ title, icon: Icon, children }: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
  }) => (
    <div className={`${compact ? 'border-b pb-4 mb-4 last:border-b-0 last:mb-0' : 'bg-white rounded-xl p-6 border border-gray-200 shadow-sm'}`}>
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <Icon className="h-4 w-4 text-blue-600" />
        </div>
        <h3 className={`font-semibold ${compact ? 'text-base' : 'text-lg'} text-gray-900`}>{title}</h3>
      </div>
      <div className={`grid gap-4 ${compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
        {children}
      </div>
    </div>
  );

  const InputField = ({
    label,
    name,
    type = 'text',
    value,
    required = false,
    disabled = false,
    placeholder = '',
    children = null
  }: {
    label: string;
    name: string;
    type?: string;
    value: string | number;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    children?: React.ReactNode;
  }) => (
    <div className={children ? 'col-span-full' : ''}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children || (
        <input
          type={type}
          name={name}
          value={value}
          onChange={handleInputChange}
          disabled={disabled || loading}
          required={required}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
        />
      )}
    </div>
  );

  const SelectField = ({
    label,
    name,
    value,
    options,
    required = false,
    disabled = false
  }: {
    label: string;
    name: string;
    value: string;
    options: Array<{ value: string; label: string }>;
    required?: boolean;
    disabled?: boolean;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={handleInputChange}
        disabled={disabled || loading}
        required={required}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-2 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-center text-red-700">
            <User className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Información Personal */}
      <FormSection title="Información Personal" icon={User}>
        <InputField
          label="Nombres"
          name="first_name"
          value={formData.first_name}
          required
          placeholder="Ej: Juan Carlos"
        />
        <InputField
          label="Apellidos"
          name="last_name"
          value={formData.last_name}
          required
          placeholder="Ej: González López"
        />
        <InputField
          label="RUT"
          name="rut"
          value={formData.rut}
          required
          disabled={!!employeeId} // No permitir cambiar RUT en edición
          placeholder="12.345.678-9"
        />
        <SelectField
          label="Estado"
          name="status"
          value={formData.status}
          options={[
            { value: 'active', label: 'Activo' },
            { value: 'inactive', label: 'Inactivo' }
          ]}
          required
        />
        <InputField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          placeholder="correo@ejemplo.com"
        />
        <InputField
          label="Teléfono"
          name="phone"
          value={formData.phone}
          placeholder="+56 9 1234 5678"
        />
        <InputField
          label="Dirección"
          name="address"
          value={formData.address}
          placeholder="Calle Ejemplo 123, Comuna, Ciudad"
        >
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            rows={2}
            placeholder="Calle Ejemplo 123, Comuna, Ciudad"
          />
        </InputField>
        <InputField
          label="Fecha de Nacimiento"
          name="birth_date"
          type="date"
          value={formData.birth_date}
        />
        <InputField
          label="Fecha de Contratación"
          name="hire_date"
          type="date"
          value={formData.hire_date}
        />
      </FormSection>

      {/* Información Contractual */}
      {showAllSections && (
        <FormSection title="Información Contractual" icon={Briefcase}>
          <InputField
            label="Cargo/Posición"
            name="position"
            value={formData.position}
            placeholder="Ej: Desarrollador Senior"
          />
          <SelectField
            label="Tipo de Contrato"
            name="contract_type"
            value={formData.contract_type}
            options={[
              { value: 'indefinido', label: 'Indefinido' },
              { value: 'plazo_fijo', label: 'Plazo Fijo' },
              { value: 'por_obra', label: 'Por Obra o Faena' },
              { value: 'part_time', label: 'Part Time' }
            ]}
          />
          <InputField
            label="Sueldo Base"
            name="base_salary"
            type="number"
            value={formData.base_salary}
            placeholder="1500000"
          />
        </FormSection>
      )}

      {/* Información Bancaria */}
      {showAllSections && (
        <FormSection title="Información Bancaria" icon={DollarSign}>
          <SelectField
            label="Banco"
            name="bank_name"
            value={formData.bank_name}
            options={[
              { value: '', label: 'Seleccionar banco...' },
              { value: 'BANCO_CHILE', label: 'Banco de Chile' },
              { value: 'BANCO_ESTADO', label: 'Banco Estado' },
              { value: 'SANTANDER', label: 'Santander' },
              { value: 'BCI', label: 'BCI' },
              { value: 'SCOTIABANK', label: 'Scotiabank' },
              { value: 'ITAU', label: 'Itaú' },
              { value: 'SECURITY', label: 'Security' },
              { value: 'FALABELLA', label: 'Falabella' },
              { value: 'RIPLEY', label: 'Ripley' },
              { value: 'CONSORCIO', label: 'Consorcio' }
            ]}
          />
          <SelectField
            label="Tipo de Cuenta"
            name="bank_account_type"
            value={formData.bank_account_type}
            options={[
              { value: 'cuenta_corriente', label: 'Cuenta Corriente' },
              { value: 'cuenta_vista', label: 'Cuenta Vista' },
              { value: 'cuenta_ahorro', label: 'Cuenta de Ahorro' }
            ]}
          />
          <InputField
            label="Número de Cuenta"
            name="bank_account_number"
            value={formData.bank_account_number}
            placeholder="Número de cuenta bancaria"
          >
            <input
              type="text"
              name="bank_account_number"
              value={formData.bank_account_number}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors col-span-full"
              placeholder="Número de cuenta bancaria"
            />
          </InputField>
        </FormSection>
      )}

      {/* Información Previsional */}
      {showAllSections && (
        <FormSection title="Información Previsional" icon={Shield}>
          <SelectField
            label="AFP"
            name="afp_code"
            value={formData.afp_code}
            options={[
              { value: 'CAPITAL', label: 'Capital' },
              { value: 'CUPRUM', label: 'Cuprum' },
              { value: 'HABITAT', label: 'Habitat' },
              { value: 'PLANVITAL', label: 'PlanVital' },
              { value: 'PROVIDA', label: 'ProVida' },
              { value: 'MODELO', label: 'Modelo' },
              { value: 'UNO', label: 'Uno' }
            ]}
          />
          <SelectField
            label="Institución de Salud"
            name="health_institution_code"
            value={formData.health_institution_code}
            options={[
              { value: 'FONASA', label: 'Fonasa' },
              { value: 'BANMEDICA', label: 'Banmédica' },
              { value: 'CONSALUD', label: 'Consalud' },
              { value: 'CRUZ_BLANCA', label: 'Cruz Blanca' },
              { value: 'VIDA_TRES', label: 'Vida Tres' },
              { value: 'COLMENA', label: 'Colmena' },
              { value: 'MAS_VIDA', label: 'Más Vida' }
            ]}
          />
          <InputField
            label="Cargas Familiares"
            name="family_allowances"
            type="number"
            value={formData.family_allowances}
            placeholder="0"
          />
          <SelectField
            label="Gratificación Legal Art. 50"
            name="legal_gratification_type"
            value={formData.legal_gratification_type}
            options={[
              { value: 'none', label: 'Sin gratificación Art. 50' },
              { value: 'article_50', label: 'Con gratificación Art. 50 (25% con tope)' }
            ]}
          />
        </FormSection>
      )}

      {/* Botones de acción */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving || loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Guardando...' : submitButtonText}</span>
        </button>
      </div>
    </form>
  );
}

// Hook personalizado para manejar empleados
export const useEmployeeForm = () => {
  const { company } = useCompany();

  const saveEmployee = async (employeeId: string | undefined, formData: EmployeeFormData) => {
    const url = employeeId
      ? `/api/payroll/employees/${employeeId}?company_id=${company.id}`
      : `/api/payroll/employees?company_id=${company.id}`;

    const method = employeeId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Error al ${employeeId ? 'actualizar' : 'crear'} empleado`);
    }

    return data;
  };

  return { saveEmployee };
};