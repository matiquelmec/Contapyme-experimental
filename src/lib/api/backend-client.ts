/**
 * Cliente API para backend independiente
 * Maneja la comunicación entre frontend Next.js y backend Express
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

/**
 * Cliente API base con manejo de errores y timeouts
 */
class BackendApiClient {
  private readonly baseUrl: string;
  private readonly defaultTimeout: number = 30000; // 30 segundos

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Realizar petición HTTP con timeout y manejo de errores
   */
  private async request<T>(
    endpoint: string,
    options: FetchOptions = {},
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
    } = options;

    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers,
      },
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    try {
      // Implementar timeout manual
      const controller = new AbortController();
      const timeoutId = setTimeout(() => { controller.abort(); }, timeout);
      config.signal = controller.signal;

      console.log(`🔗 API Request: ${method} ${url}`);

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ API Success: ${method} ${endpoint}`);

      return data as ApiResponse<T>;
    } catch (error) {
      console.error(`❌ API Error: ${method} ${endpoint}`, error);

      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout - backend may be unavailable',
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Métodos de conveniencia para diferentes HTTP methods
   */
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  async post<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body, headers });
  }

  async put<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body, headers });
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }

  /**
   * Health check del backend
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health');
      return response.success;
    } catch {
      return false;
    }
  }

  /**
   * Obtener configuración del cliente
   */
  getConfig() {
    return {
      baseUrl: this.baseUrl,
      timeout: this.defaultTimeout,
      available: this.baseUrl !== undefined,
    };
  }
}

// Singleton del cliente API
export const backendApi = new BackendApiClient();

/**
 * Hook para verificar si el backend está disponible
 */
export function useBackendStatus() {
  const [isAvailable, setIsAvailable] = React.useState<boolean | null>(null);
  const [isChecking, setIsChecking] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    const checkBackend = async () => {
      setIsChecking(true);
      const available = await backendApi.healthCheck();

      if (mounted) {
        setIsAvailable(available);
        setIsChecking(false);
      }
    };

    checkBackend();

    // Cleanup
    return () => {
      mounted = false;
    };
  }, []);

  return { isAvailable, isChecking };
}

/**
 * Servicios específicos del dominio
 */
export const accountingApi = {
  /**
   * Obtener indicadores económicos
   */
  async getIndicators() {
    return backendApi.get('/api/accounting/indicators');
  },

  /**
   * Actualizar indicador económico
   */
  async updateIndicator(code: string, value: number, date?: string) {
    return backendApi.post('/api/accounting/indicators', {
      code,
      value,
      date,
    });
  },
};

export const payrollApi = {
  /**
   * Obtener empleados
   */
  async getEmployees(companyId: string, filters?: { searchRut?: string; employeeId?: string }) {
    const params = new URLSearchParams({ company_id: companyId });

    if (filters?.searchRut) {
      params.append('search_rut', filters.searchRut);
    }
    if (filters?.employeeId) {
      params.append('employee_id', filters.employeeId);
    }

    return backendApi.get(`/api/payroll/employees?${params.toString()}`);
  },

  /**
   * Crear empleado
   */
  async createEmployee(employeeData: {
    company_id: string;
    rut: string;
    full_name: string;
    email?: string;
    phone?: string;
    address?: string;
    department?: string;
    position?: string;
    hire_date?: string;
  }) {
    return backendApi.post('/api/payroll/employees', employeeData);
  },

  /**
   * Obtener empleado específico
   */
  async getEmployee(id: string, companyId: string) {
    return backendApi.get(`/api/payroll/employees/${id}?company_id=${companyId}`);
  },
};

// Feature flags para migración gradual
export const BACKEND_FEATURES = {
  USE_NEW_INDICATORS_API: process.env.NEXT_PUBLIC_USE_NEW_INDICATORS === 'true',
  USE_NEW_EMPLOYEES_API: process.env.NEXT_PUBLIC_USE_NEW_EMPLOYEES === 'true',
  USE_NEW_BACKEND: process.env.NEXT_PUBLIC_USE_NEW_BACKEND === 'true',
};

export default backendApi;
