-- 🔧 SOLUCIÓN ROBUSTA: Estructura de Base de Datos para Empleados
-- Este script garantiza que todas las columnas necesarias existan

-- =====================================================
-- 1. AGREGAR COLUMNAS FALTANTES A LA TABLA EMPLOYEES
-- =====================================================

-- Columna hire_date (fecha de contratación en la tabla principal)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'employees' AND column_name = 'hire_date'
    ) THEN
        ALTER TABLE employees ADD COLUMN hire_date DATE;
        COMMENT ON COLUMN employees.hire_date IS 'Fecha de contratación del empleado';
    END IF;
END $$;

-- =====================================================
-- 2. VERIFICAR COLUMNAS EXISTENTES VS NECESARIAS
-- =====================================================

-- Columnas que DEBE tener la tabla employees
-- ✅ id, company_id, rut, first_name, last_name, middle_name
-- ✅ email, phone, mobile_phone, address, city, region, postal_code
-- ✅ birth_date, gender, marital_status, nationality
-- ✅ bank_name, bank_account_type, bank_account_number
-- ✅ status, created_at, updated_at, created_by, updated_by
-- ✅ emergency_contact_name, emergency_contact_phone, emergency_contact_relationship
-- ➕ hire_date (agregada arriba)

-- =====================================================
-- 3. VERIFICAR TABLA EMPLOYMENT_CONTRACTS
-- =====================================================

-- Verificar que tenga start_date para manejar fechas de inicio de contrato
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'employment_contracts' AND column_name = 'start_date'
    ) THEN
        ALTER TABLE employment_contracts ADD COLUMN start_date DATE;
        COMMENT ON COLUMN employment_contracts.start_date IS 'Fecha de inicio del contrato específico';
    END IF;
END $$;

-- =====================================================
-- 4. VERIFICAR TABLA PAYROLL_CONFIG
-- =====================================================

-- Verificar que tenga family_allowances
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'payroll_config' AND column_name = 'family_allowances'
    ) THEN
        ALTER TABLE payroll_config ADD COLUMN family_allowances INTEGER DEFAULT 0;
        COMMENT ON COLUMN payroll_config.family_allowances IS 'Número de cargas familiares';
    END IF;
END $$;

-- =====================================================
-- 5. MIGRAR DATOS EXISTENTES (SI NECESARIO)
-- =====================================================

-- Si hay empleados sin hire_date, usar start_date del primer contrato
UPDATE employees
SET hire_date = (
    SELECT MIN(start_date)
    FROM employment_contracts
    WHERE employment_contracts.employee_id = employees.id
)
WHERE hire_date IS NULL
AND EXISTS (
    SELECT 1 FROM employment_contracts
    WHERE employment_contracts.employee_id = employees.id
    AND start_date IS NOT NULL
);

-- =====================================================
-- 6. MOSTRAR RESULTADO FINAL
-- =====================================================

-- Verificar estructura final
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'employees'
ORDER BY ordinal_position;