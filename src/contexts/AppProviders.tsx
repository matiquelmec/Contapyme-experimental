'use client'

import { ReactNode } from 'react'
import { AuthProvider } from './AuthContext'
import { CompanyProvider } from './CompanyContext'
import { DashboardProvider } from './DashboardContext'
import { useAuth } from './AuthContext'

/**
 * Wrapper para DashboardProvider que consume AuthContext de forma segura
 * Evita dependencias circulares al recibir user como prop
 */
function DashboardProviderWrapper({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  return (
    <DashboardProvider user={user}>
      {children}
    </DashboardProvider>
  )
}

/**
 * Provider compuesto que gestiona todos los contexts de la aplicación
 * Estructura jerárquica optimizada para evitar dependencias circulares:
 *
 * AuthProvider (nivel raíz)
 *   └── CompanyProvider (nivel empresa)
 *       └── DashboardProvider (nivel UI/estado)
 *
 * Beneficios:
 * - Eliminación de dependencias circulares
 * - Mejor tree-shaking y optimización del bundle
 * - Chunks más estables y predecibles
 * - Prevención de renders innecesarios por providers duplicados
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CompanyProvider>
        <DashboardProviderWrapper>
          {children}
        </DashboardProviderWrapper>
      </CompanyProvider>
    </AuthProvider>
  )
}

/**
 * Hook de conveniencia para acceder a todos los contexts desde un solo punto
 * Uso recomendado: import { useAppContext } from '@/contexts/AppProviders'
 */
export function useAppContext() {
  const auth = useAuth()

  return {
    auth,
    // Otros contexts se pueden agregar aquí según necesidad
  }
}