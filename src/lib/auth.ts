// 🔒 SISTEMA DE AUTENTICACIÓN HÍBRIDO
// Soporta modo desarrollo (mockeado) y producción (real Supabase)

import { createServerComponentClient, createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// 🔧 CONFIGURACIÓN DE MODO DE SEGURIDAD
const isDevelopmentMode = process.env.NODE_ENV === 'development'
const enableRealAuth = process.env.NEXT_PUBLIC_ENABLE_REAL_AUTH === 'true'
// 🎭 Usar auth demo a menos que explícitamente se active auth real
const useAuthSecurity = enableRealAuth

// 🏢 USUARIOS DEMO PARA DESARROLLO
// ✅ SINCRONIZADO CON COMPANY CONTEXT
const DEMO_USERS = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'demo@contapyme.cl',
    name: 'Usuario Demo',
    role: 'owner' as const,
    companies: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'] // Acceso a ambas empresas
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    email: 'admin@contapyme.cl',
    name: 'Admin Demo',
    role: 'admin' as const,
    companies: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'] // Acceso a ambas empresas
  }
]

// 🔐 CLIENTE SUPABASE REAL
function createRealSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('❌ Variables de entorno de Supabase no configuradas')
  }

  return createSupabaseClient(supabaseUrl, supabaseKey)
}

// 🎭 CLIENTE MOCK PARA DESARROLLO
function createMockClient() {
  return {
    auth: {
      getUser: async () => ({
        data: { user: DEMO_USERS[0] },
        error: null
      }),
      getSession: async () => ({
        data: {
          session: {
            user: DEMO_USERS[0],
            access_token: 'mock-token',
            expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24h
          }
        },
        error: null
      }),
      signInWithPassword: async (credentials: any) => {
        const user = DEMO_USERS.find(u => u.email === credentials.email)
        if (user) {
          return { data: { user, session: { user, access_token: 'mock-token' } }, error: null }
        }
        return { data: null, error: { message: 'Credenciales inválidas en modo demo' } }
      },
      signUp: async (credentials: any) => ({
        data: { user: { ...DEMO_USERS[0], email: credentials.email } },
        error: null
      }),
      signOut: async () => ({ error: null })
    },
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: async () => ({ data: null, error: null }),
          order: () => ({
            limit: () => ({ data: [], error: null })
          })
        }),
        order: () => ({ data: [], error: null })
      }),
      insert: () => ({ data: null, error: null }),
      update: () => ({
        eq: () => ({ data: null, error: null })
      }),
      delete: () => ({
        eq: () => ({ data: null, error: null })
      })
    })
  }
}

// 🔄 FUNCIONES PÚBLICAS (AUTO-DETECTAN MODO)
export const getUser = async () => {
  try {
    if (!useAuthSecurity) {
      console.log('🎭 Modo desarrollo: Retornando usuario demo')
      return DEMO_USERS[0]
    }

    const supabase = createServerComponentClient({ cookies })
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('❌ Error obteniendo usuario:', error.message)
      return null
    }

    console.log('🔐 Usuario autenticado:', user?.email)
    return user
  } catch (error) {
    console.error('❌ Error en getUser:', error)
    return useAuthSecurity ? null : DEMO_USERS[0]
  }
}

export const getSession = async () => {
  try {
    if (!useAuthSecurity) {
      console.log('🎭 Modo desarrollo: Retornando sesión demo')
      return {
        user: DEMO_USERS[0],
        access_token: 'mock-token',
        expires_at: Date.now() + (24 * 60 * 60 * 1000)
      }
    }

    const supabase = createServerComponentClient({ cookies })
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('❌ Error obteniendo sesión:', error.message)
      return null
    }

    return session
  } catch (error) {
    console.error('❌ Error en getSession:', error)
    return null
  }
}

export const createClient = () => {
  if (!useAuthSecurity) {
    console.log('🎭 Creando cliente mock para desarrollo')
    return createMockClient()
  }

  console.log('🔐 Creando cliente Supabase real')
  return createRealSupabaseClient()
}

// 🖥️ CLIENTE PARA SERVIDOR
export const createServerClient = () => {
  if (!useAuthSecurity) {
    return createMockClient()
  }

  return createServerComponentClient({ cookies })
}

// 📱 CLIENTE PARA COMPONENTES
export const createBrowserClient = () => {
  if (!useAuthSecurity) {
    return createMockClient()
  }

  return createClientComponentClient()
}

// 👤 OBTENER USUARIO EN CLIENTE (COMPONENTES)
export const getClientUser = async () => {
  try {
    if (!useAuthSecurity) {
      console.log('🎭 Cliente: Retornando usuario demo')
      return DEMO_USERS[0]
    }

    const supabase = createBrowserClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('❌ Error obteniendo usuario en cliente:', error.message)
      return null
    }

    console.log('🔐 Usuario autenticado en cliente:', user?.email)
    return user
  } catch (error) {
    console.error('❌ Error en getClientUser:', error)
    return useAuthSecurity ? null : DEMO_USERS[0]
  }
}

// 🏢 VALIDACIÓN DE EMPRESA
export const getUserCompanies = async (userId: string) => {
  if (!useAuthSecurity) {
    const demoUser = DEMO_USERS.find(u => u.id === userId)
    return demoUser?.companies.map(companyId => ({
      company_id: companyId,
      role: demoUser.role,
      permissions: ['read', 'write', 'admin']
    })) || []
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('user_companies')
    .select('company_id, role, permissions')
    .eq('user_id', userId)

  if (error) {
    console.error('❌ Error obteniendo empresas del usuario:', error)
    return []
  }

  return data || []
}

// 🔍 VERIFICAR ACCESO A EMPRESA
export const verifyCompanyAccess = async (userId: string, companyId: string) => {
  const companies = await getUserCompanies(userId)
  return companies.some(company => company.company_id === companyId)
}

// 📊 ESTADO DE LA CONFIGURACIÓN
export const getAuthConfig = () => ({
  isDevelopmentMode,
  enableRealAuth,
  useAuthSecurity,
  mode: useAuthSecurity ? 'SEGURO' : 'DEMO',
  status: useAuthSecurity ? '🔐 Autenticación Real Activa' : '🎭 Modo Demo Activo'
})

// ⚠️ FUNCIÓN DE TRANSICIÓN GRADUAL
export const enableProductionAuth = () => {
  console.log('🔄 TRANSICIÓN: Habilitando autenticación de producción...')
  console.log('Para habilitar completamente, establecer: NEXT_PUBLIC_ENABLE_REAL_AUTH=true')
}
