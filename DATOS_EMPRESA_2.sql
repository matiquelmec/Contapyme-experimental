-- ========================================================
-- CREAR EMPRESA 2 Y DATOS - SOLUCIÓN DEFINITIVA
-- Ejecutar directamente en Supabase SQL Editor
-- ========================================================

-- 1. CREAR EMPRESA 2 (Mi Pyme Ltda.)
INSERT INTO companies (
  id,
  user_id,
  name,
  legal_name,
  business_activity,
  rut,
  address,
  phone,
  email,
  website,
  status,
  plan_type,
  created_at,
  updated_at
) VALUES (
  '9144ff7a-c530-5e82-cb1f-593f57de7fde',
  'demo-user-id',
  'Mi Pyme Ltda.',
  'Mi Pyme Limitada',
  'Comercio al por menor de productos varios',
  '98.765.432-1',
  'Valparaíso, Región de Valparaíso, Chile',
  '+56 9 8765 4321',
  'contacto@mipyme.cl',
  'https://mipyme.cl',
  'active',
  'demo',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 2. CREAR EMPLEADOS EMPRESA 2 (DIFERENTES A EMPRESA 1)
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
  status,
  created_at,
  updated_at
) VALUES
-- Empleado 1: María González (Gerente de Ventas)
(
  'emp2-001-maria',
  '9144ff7a-c530-5e82-cb1f-593f57de7fde',
  'demo-user-id',
  '12.543.876-9',
  'María',
  'González',
  'maria.gonzalez@mipyme.cl',
  '+56 9 9876 5432',
  'Los Leones 456, Valparaíso',
  'active',
  NOW(),
  NOW()
),
-- Empleado 2: Carlos Silva (Vendedor Senior)
(
  'emp2-002-carlos',
  '9144ff7a-c530-5e82-cb1f-593f57de7fde',
  'demo-user-id',
  '15.987.654-3',
  'Carlos',
  'Silva',
  'carlos.silva@mipyme.cl',
  '+56 9 8765 4321',
  'Las Palmas 789, Viña del Mar',
  'active',
  NOW(),
  NOW()
),
-- Empleado 3: Ana Torres (Asistente)
(
  'emp2-003-ana',
  '9144ff7a-c530-5e82-cb1f-593f57de7fde',
  'demo-user-id',
  '18.234.567-8',
  'Ana',
  'Torres',
  'ana.torres@mipyme.cl',
  '+56 9 7654 3210',
  'Miramar 321, Valparaíso',
  'active',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 3. VERIFICAR CREACIÓN
SELECT
  'companies' as tabla,
  name,
  rut,
  id
FROM companies
WHERE id = '9144ff7a-c530-5e82-cb1f-593f57de7fde'

UNION ALL

SELECT
  'employees' as tabla,
  first_name || ' ' || last_name as name,
  rut,
  id
FROM employees
WHERE company_id = '9144ff7a-c530-5e82-cb1f-593f57de7fde';

-- ✅ RESULTADO ESPERADO:
-- tabla      | name              | rut           | id
-- companies  | Mi Pyme Ltda.     | 98.765.432-1  | 9144ff7a-c530-5e82-cb1f-593f57de7fde
-- employees  | María González    | 12.543.876-9  | emp2-001-maria
-- employees  | Carlos Silva      | 15.987.654-3  | emp2-002-carlos
-- employees  | Ana Torres        | 18.234.567-8  | emp2-003-ana