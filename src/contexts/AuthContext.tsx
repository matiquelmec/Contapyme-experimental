'use client'

// Mock simple del AuthContext para resolver dependencias circulares temporalmente
export interface User {
  id?: string
  email?: string
  name?: string
  role?: string
  avatar?: string
  companyId?: string
  preferences?: Record<string, any>
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
  isAuthenticated: boolean
  updateUser: (userData: Partial<User>) => void
}

// Mock simple sin dependencias complejas
export function useAuth(): AuthContextType {
  return {
    user: {
      id: 'demo-user',
      email: 'demo@contapyme.cl',
      name: 'Usuario Demo',
      role: 'admin',
      companyId: 'demo-company',
    },
    login: async () => {},
    logout: async () => {},
    loading: false,
    isAuthenticated: true,
    updateUser: () => {},
  }
}

// Provider simple
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
