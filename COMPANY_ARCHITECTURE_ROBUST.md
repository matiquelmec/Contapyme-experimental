# 🏢 ARQUITECTURA ROBUSTA DE EMPRESAS - DISEÑO COMPLETO

## 🎯 PROBLEMAS IDENTIFICADOS

### Actuales (NO ROBUSTO)
❌ CompanyContext fragmentado
❌ Cache sin coordinación
❌ APIs sin company_id obligatorio
❌ Estados no sincronizados
❌ Solo 1 empresa en BD
❌ Webpack errors por dependencias rotas

## 🚀 SOLUCIÓN ROBUSTA

### 1. **Company Context Unificado**
```typescript
interface CompanyContextRobust {
  // Estado principal
  currentCompany: Company;
  availableCompanies: Company[];
  isLoading: boolean;

  // Acciones OBLIGATORIAS
  switchCompany: (companyId: string) => Promise<void>;
  refreshCompanyData: () => Promise<void>;

  // Gestión de cache
  invalidateCache: (scope?: string[]) => void;
  clearAllData: () => void;

  // Eventos
  onCompanyChanged: (callback: CompanyChangeCallback) => void;
}
```

### 2. **Cache Global Coordinado**
```typescript
class CompanyCacheManager {
  private static instance: CompanyCacheManager;

  // Cache por empresa
  private caches: Map<string, CompanyCache> = new Map();

  // Métodos principales
  async switchCompany(companyId: string): Promise<void> {
    // 1. Guardar cache actual
    this.saveCurrentCache();

    // 2. Limpiar estados globales
    this.clearGlobalStates();

    // 3. Cargar cache nueva empresa
    await this.loadCompanyCache(companyId);

    // 4. Notificar componentes
    this.notifyCompanyChange(companyId);
  }

  invalidateCompanyCache(companyId: string, scopes?: string[]): void {
    // Invalidar cache específico
  }

  clearAllCaches(): void {
    // Limpiar todo
  }
}
```

### 3. **APIs Con Company-ID Obligatorio**
```typescript
// API Base con company validation
class CompanyAwareAPI {
  private companyId: string;

  constructor(companyId: string) {
    if (!companyId) throw new Error('Company ID required');
    this.companyId = companyId;
  }

  async request<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    // SIEMPRE incluir company_id
    const url = this.addCompanyId(endpoint);
    return this.fetch<T>(url, options);
  }

  private addCompanyId(endpoint: string): string {
    const separator = endpoint.includes('?') ? '&' : '?';
    return `${endpoint}${separator}company_id=${this.companyId}&t=${Date.now()}`;
  }
}

// Factory para crear APIs company-specific
export const createCompanyAPI = (companyId: string) => ({
  employees: new EmployeesAPI(companyId),
  accounts: new AccountsAPI(companyId),
  transactions: new TransactionsAPI(companyId),
  payroll: new PayrollAPI(companyId),
});
```

### 4. **Hook Universal Company-Aware**
```typescript
export function useCompanyData<T>(
  key: string,
  fetcher: (api: CompanyAPIs) => Promise<T>,
  options: {
    autoRefresh?: boolean;
    cacheTime?: number;
    dependencies?: any[];
  } = {}
) {
  const { currentCompany } = useCompanyContext();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!currentCompany?.id) return;

    try {
      setLoading(true);
      setError(null);

      // API company-specific
      const api = createCompanyAPI(currentCompany.id);
      const result = await fetcher(api);

      setData(result);

      // Cache con company prefix
      CompanyCacheManager.instance.setCache(
        `${currentCompany.id}:${key}`,
        result,
        options.cacheTime
      );

    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [currentCompany?.id, key, fetcher, options.cacheTime]);

  // Auto refresh al cambiar empresa
  useEffect(() => {
    refresh();
  }, [currentCompany?.id, ...(options.dependencies || [])]);

  // Escuchar eventos de cambio
  useEffect(() => {
    const unsubscribe = CompanyCacheManager.instance.onCompanyChanged(
      (newCompanyId) => {
        if (newCompanyId === currentCompany?.id) {
          refresh();
        }
      }
    );
    return unsubscribe;
  }, [currentCompany?.id, refresh]);

  return { data, loading, error, refresh };
}
```

### 5. **Base de Datos Completa**
```sql
-- Empresas demo con datos reales diferentes
INSERT INTO companies (id, rut, name, ...) VALUES
('8033ee69-b420-4d91-ba0e-482f46cd6fce', '78.223.873-6', 'Empresa Demo S.A.', ...),
('9144ff7a-c530-5e82-cb1f-593f57de7fde', '98.765.432-1', 'Mi Pyme Ltda.', ...);

-- Empleados DIFERENTES por empresa
INSERT INTO employees (company_id, rut, name, ...) VALUES
-- Empresa 1: Juan, María, Carlos
('8033ee69-b420-4d91-ba0e-482f46cd6fce', '12.345.678-9', 'Juan Pérez', ...),
-- Empresa 2: Ana, Luis, Sofia
('9144ff7a-c530-5e82-cb1f-593f57de7fde', '15.987.654-3', 'Ana Torres', ...);

-- Datos DIFERENTES por empresa en todas las tablas
```

### 6. **Componentes Auto-Company-Aware**
```typescript
// Componente empleados completamente company-aware
export function EmployeesPage() {
  const { data: employees, loading, error, refresh } = useCompanyData(
    'employees',
    (api) => api.employees.getAll(),
    { autoRefresh: true }
  );

  // NO más company_id manual - ya está integrado

  return (
    <div>
      <CompanySelector /> {/* Cambio automático */}
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage error={error} />}
      {employees?.map(emp => <EmployeeCard key={emp.id} employee={emp} />)}
    </div>
  );
}
```

## 🔄 MIGRACIÓN PASO A PASO

1. **Crear CompanyCacheManager** ✅
2. **Refactor CompanyContext** ✅
3. **Crear APIs Company-Aware** ✅
4. **Migrar hooks a useCompanyData** ✅
5. **Poblar BD con datos empresa 2** ✅
6. **Migrar componentes uno por uno** ✅
7. **Testing completo** ✅

## 🎯 RESULTADO FINAL

✅ **Robustez Total**: Cache coordinado, APIs consistentes
✅ **Performance**: Cache inteligente por empresa
✅ **Mantenibilidad**: Lógica centralizada
✅ **Escalabilidad**: Fácil agregar nuevas empresas
✅ **Testing**: Datos reales diferentes por empresa

## 🚨 URGENCIA

**CRITICAL**: El sistema actual NO es productivo. Necesitamos refactoring completo para:
- Evitar bugs de datos mezclados
- Asegurar performance
- Permitir multi-tenant real
- Facilitar testing y development

¿Procedemos con la refactorización robusta?