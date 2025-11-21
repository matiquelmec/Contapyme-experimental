// 🔒 SISTEMA DE AUTENTICACIÓN HÍBRIDO - CLIENTE
// Funciones de autenticación para componentes cliente

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// 🔧 CONFIGURACIÓN DE MODO DE SEGURIDAD
const isDevelopmentMode = process.env.NODE_ENV === 'development'
const enableRealAuth = process.env.NEXT_PUBLIC_ENABLE_REAL_AUTH === 'true'
const useAuthSecurity = enableRealAuth || !isDevelopmentMode

// 🏢 USUARIOS DEMO PARA DESARROLLO
// ✅ SINCRONIZADO CON COMPANY CONTEXT Y AUTH.TS
const DEMO_USERS = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'demo@contapyme.cl',
    name: 'Usuario Demo',
    role: 'owner' as const,
    companies: ['8033ee69-b420-4d91-ba0e-482f46cd6fce', '9144ff7a-c530-5e82-cb1f-593f57de7fde'] // IDs reales de BD
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    email: 'admin@contapyme.cl',
    name: 'Admin Demo',
    role: 'admin' as const,
    companies: ['8033ee69-b420-4d91-ba0e-482f46cd6fce', '9144ff7a-c530-5e82-cb1f-593f57de7fde'] // IDs reales de BD
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

// 📊 ESTADO DE LA CONFIGURACIÓN
export const getAuthConfig = () => ({
  isDevelopmentMode,
  enableRealAuth,
  useAuthSecurity,
  mode: useAuthSecurity ? 'SEGURO' : 'DEMO',
  status: useAuthSecurity ? '🔐 Autenticación Real Activa' : '🎭 Modo Demo Activo'
})