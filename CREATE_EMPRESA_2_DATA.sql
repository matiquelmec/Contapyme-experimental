-- =========================================================
-- CREAR EMPRESA 2 CON DATOS DISTINTOS PARA TESTING
-- Soluciona problema: frontend muestra mismos datos ambas empresas
-- =========================================================

-- 🏢 INSERTAR SEGUNDA EMPRESA (Mi Pyme Ltda.)
INSERT INTO companies (
  id,
  user_id,
  rut,
  name,
  legal_name,
  business_activity,
  address,
  phone,
  email,
  website,
  status,
  plan_type,
  created_at,
  updated_at
) VALUES (
  '9144ff7a-c530-5e82-cb1f-593f57de7fde', -- ID exacto del CompanyContext demo-2
  'demo-user-id', -- Mismo user_id para demo
  '98.765.432-1',
  'Mi Pyme Ltda.',
  'Mi Pyme Limitada',
  'Comercio al por menor de productos varios',
  'Valparaíso, Región de Valparaíso, Chile',
  '+56 9 8765 4321',
  'contacto@mipyme.cl',
  'https://mipyme.cl',
  'active',
  'demo',
  NOW(),
  NOW()
);

-- 👥 EMPLEADOS EMPRESA 2 - DATOS COMPLETAMENTE DISTINTOS
INSERT INTO employees (
  id,
  company_id,
  user_id,
  rut,
  first_name,
  last_name,
  email,
  phone,
  address,
  birth_date,
  hire_date,
  position,
  status,
  created_at,
  updated_at
) VALUES
-- Empleado 1 - María González
(
  'emp2-001-maria-gonzalez',
  '9144ff7a-c530-5e82-cb1f-593f57de7fde', -- Company ID empresa 2
  'demo-user-id',
  '12.543.876-9',
  'María Fernanda',
  'González Pérez',
  'maria.gonzalez@mipyme.cl',
  '+56 9 9876 5432',
  'Los Leones 456, Valparaíso',
  '1985-03-15',
  '2023-01-15',
  'Gerente de Ventas',
  'active',
  NOW(),
  NOW()
),
-- Empleado 2 - Carlos Silva
(
  'emp2-002-carlos-silva',
  '9144ff7a-c530-5e82-cb1f-593f57de7fde', -- Company ID empresa 2
  'demo-user-id',
  '15.987.654-3',
  'Carlos Alberto',
  'Silva Rojas',
  'carlos.silva@mipyme.cl',
  '+56 9 8765 4321',
  'Las Palmas 789, Viña del Mar',
  '1988-07-22',
  '2023-03-01',
  'Vendedor Senior',
  'active',
  NOW(),
  NOW()
),
-- Empleado 3 - Ana Torres
(
  'emp2-003-ana-torres',
  '9144ff7a-c530-5e82-cb1f-593f57de7fde', -- Company ID empresa 2
  'demo-user-id',
  '18.234.567-8',
  'Ana Beatriz',
  'Torres Morales',
  'ana.torres@mipyme.cl',
  '+56 9 7654 3210',
  'Miramar 321, Valparaíso',
  '1992-11-08',
  '2023-06-01',
  'Asistente Comercial',
  'active',
  NOW(),
  NOW()
);

-- 📋 CONTRATOS EMPRESA 2 - SUELDOS DISTINTOS
INSERT INTO employment_contracts (
  id,
  company_id,
  employee_id,
  position,
  contract_type,
  start_date,
  end_date,
  base_salary,
  status,
  created_at,
  updated_at
) VALUES
-- Contrato María González
(
  'contract2-001-maria',
  '9144ff7a-c530-5e82-cb1f-593f57de7fde',
  'emp2-001-maria-gonzalez',
  'Gerente de Ventas',
  'indefinido',
  '2023-01-15',
  NULL,
  1200000, -- Sueldo distinto a empresa 1
  'active',
  NOW(),
  NOW()
),
-- Contrato Carlos Silva
(
  'contract2-002-carlos',
  '9144ff7a-c530-5e82-cb1f-593f57de7fde',
  'emp2-002-carlos-silva',
  'Vendedor Senior',
  'indefinido',
  '2023-03-01',
  NULL,
  800000, -- Sueldo distinto a empresa 1
  'active',
  NOW(),
  NOW()
),
-- Contrato Ana Torres
(
  'contract2-003-ana',
  '9144ff7a-c530-5e82-cb1f-593f57de7fde',
  'emp2-003-ana-torres',
  'Asistente Comercial',
  'indefinido',
  '2023-06-01',
  NULL,
  600000, -- Sueldo distinto a empresa 1
  'active',
  NOW(),
  NOW()
);

-- 🧾 CUENTAS CONTABLES EMPRESA 2 - DIFERENTES A EMPRESA 1
INSERT INTO accounts (
  id,
  company_id,
  code,
  name,
  account_type,
  parent_id,
  level,
  is_detail,
  is_active,
  created_at,
  updated_at
) VALUES
('account2-001', '9144ff7a-c530-5e82-cb1f-593f57de7fde', '1.1.01.001', 'Caja Empresa 2', 'asset', NULL, 4, true, true, NOW(), NOW()),
('account2-002', '9144ff7a-c530-5e82-cb1f-593f57de7fde', '1.1.02.001', 'Banco Estado Empresa 2', 'asset', NULL, 4, true, true, NOW(), NOW()),
('account2-003', '9144ff7a-c530-5e82-cb1f-593f57de7fde', '5.1.01.001', 'Sueldos y Salarios Empresa 2', 'expense', NULL, 4, true, true, NOW(), NOW());

-- 💰 TRANSACCIONES EMPRESA 2 - MONTOS DIFERENTES
INSERT INTO transactions (
  id,
  company_id,
  description,
  amount,
  transaction_type,
  account_id,
  transaction_date,
  reference,
  created_at,
  updated_at
) VALUES
('tx2-001', '9144ff7a-c530-5e82-cb1f-593f57de7fde', 'Venta productos empresa 2', 250000, 'income', 'account2-001', '2024-11-01', 'VTA-001-E2', NOW(), NOW()),
('tx2-002', '9144ff7a-c530-5e82-cb1f-593f57de7fde', 'Pago sueldo María González', -1200000, 'expense', 'account2-003', '2024-11-15', 'SUELDO-001-E2', NOW(), NOW()),
('tx2-003', '9144ff7a-c530-5e82-cb1f-593f57de7fde', 'Venta servicios empresa 2', 180000, 'income', 'account2-002', '2024-11-10', 'VTA-002-E2', NOW(), NOW());

-- ✅ VERIFICACIÓN: Confirmar que empresa 2 existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM companies
        WHERE id = '9144ff7a-c530-5e82-cb1f-593f57de7fde'
    ) THEN
        RAISE NOTICE '✅ EMPRESA 2 CREADA EXITOSAMENTE: Mi Pyme Ltda.';
        RAISE NOTICE '👥 EMPLEADOS EMPRESA 2: % empleados', (
            SELECT COUNT(*) FROM employees
            WHERE company_id = '9144ff7a-c530-5e82-cb1f-593f57de7fde'
        );
        RAISE NOTICE '💰 TRANSACCIONES EMPRESA 2: % transacciones', (
            SELECT COUNT(*) FROM transactions
            WHERE company_id = '9144ff7a-c530-5e82-cb1f-593f57de7fde'
        );
    ELSE
        RAISE NOTICE '❌ ERROR: No se pudo crear empresa 2';
    END IF;
END
$$;