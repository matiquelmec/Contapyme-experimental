// 🔒 MIDDLEWARE DE SEGURIDAD GRADUAL
// Protege rutas según configuración de seguridad

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// 🔧 CONFIGURACIÓN DE SEGURIDAD
const isDevelopmentMode = process.env.NODE_ENV === 'development'
const enableRealAuth = process.env.NEXT_PUBLIC_ENABLE_REAL_AUTH === 'true'
// 🎭 Usar auth demo a menos que explícitamente se active auth real
const useAuthSecurity = enableRealAuth

// 🏢 USUARIOS DEMO (SINCRONIZADO CON CONTEXTO Y BASE DE DATOS REAL)
const DEMO_USER = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'demo@contapyme.cl',
  companies: ['8033ee69-b420-4d91-ba0e-482f46cd6fce', '9144ff7a-c530-5e82-cb1f-593f57de7fde']
}

// 🛡️ RUTAS PROTEGIDAS
const PROTECTED_ROUTES = [
  '/accounting',
  '/payroll',
  '/dashboard',
  '/fixed-assets',
  '/api/accounting',
  '/api/payroll',
  '/api/companies',
  '/api/f29',
  '/api/rcv',
  '/api/dashboard'
]

// 🌐 RUTAS PÚBLICAS (NO REQUIEREN AUTH)
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/health',
  '/api/public',
  '/_next',
  '/favicon.ico'
]

// 🔍 VERIFICAR SI LA RUTA ESTÁ PROTEGIDA
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route))
}

// 🌐 VERIFICAR SI LA RUTA ES PÚBLICA
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route))
}

// 🏢 EXTRAER COMPANY_ID DE LA URL O QUERY PARAMS
function extractCompanyId(request: NextRequest): string | null {
  const url = new URL(request.url)

  // Buscar en query params
  const companyIdFromQuery = url.searchParams.get('company_id')
  if (companyIdFromQuery) return companyIdFromQuery

  // Buscar en path params para APIs
  const pathMatch = url.pathname.match(/\/api\/companies\/([^\/]+)/)
  if (pathMatch) return pathMatch[1]

  // Default para desarrollo (empresa 1)
  return useAuthSecurity ? null : '8033ee69-b420-4d91-ba0e-482f46cd6fce'
}

// 🔐 OBTENER USUARIO ACTUAL (COMPATIBLE CON MODO HÍBRIDO)
async function getCurrentUser(request: NextRequest) {
  if (!useAuthSecurity) {
    console.log('🎭 Middleware: Modo demo - Usuario automático')
    return DEMO_USER
  }

  try {
    const response = NextResponse.next()
    const supabase = createServerComponentClient({ cookies: () => cookies() })

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      console.log('❌ Middleware: Usuario no autenticado')
      return null
    }

    console.log('🔐 Middleware: Usuario autenticado:', user.email)
    return user
  } catch (error) {
    console.error('❌ Middleware: Error verificando usuario:', error)
    return null
  }
}

// 🏢 VERIFICAR ACCESO A EMPRESA (PLACEHOLDER PARA DESARROLLO)
async function verifyCompanyAccess(userId: string, companyId: string): Promise<boolean> {
  if (!useAuthSecurity) {
    // En modo demo, verificar contra las empresas permitidas del usuario demo
    return DEMO_USER.companies.includes(companyId)
  }

  // TODO: Implementar verificación real en base de datos
  // Por ahora retorna true para evitar romper funcionalidad
  return true
}

// 📊 LOGGING DE SEGURIDAD
function logSecurityEvent(type: string, details: any) {
  const timestamp = new Date().toISOString()
  console.log(`🔒 [${timestamp}] ${type}:`, details)

  // TODO: En producción, enviar a sistema de monitoring
}

// 🚦 MIDDLEWARE PRINCIPAL
export async function middleware(request: NextRequest) {
  const startTime = Date.now()
  const { pathname, search } = request.nextUrl
  const fullPath = pathname + search

  // 📊 LOG DE ENTRADA
  console.log(`🚦 Middleware [v2]: ${request.method} ${fullPath}`)

  // 🌐 PERMITIR RUTAS PÚBLICAS SIN VALIDACIÓN
  if (isPublicRoute(pathname)) {
    console.log('🌐 Ruta pública permitida:', pathname)
    return NextResponse.next()
  }

  // 🛡️ VERIFICAR RUTAS PROTEGIDAS
  if (isProtectedRoute(pathname)) {
    logSecurityEvent('PROTECTED_ROUTE_ACCESS', {
      path: pathname,
      ip: request.ip,
      userAgent: request.headers.get('user-agent')
    })

    // 🔐 OBTENER USUARIO ACTUAL
    const user = await getCurrentUser(request)

    if (!user && useAuthSecurity) {
      logSecurityEvent('UNAUTHORIZED_ACCESS', { path: pathname })

      // Redirigir a login si es una página
      if (!pathname.startsWith('/api')) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', fullPath)
        return NextResponse.redirect(loginUrl)
      }

      // Error 401 si es una API
      return NextResponse.json(
        { error: 'No autorizado - Se requiere autenticación' },
        { status: 401 }
      )
    }

    // 🏢 VERIFICAR ACCESO A EMPRESA SI SE ESPECIFICA
    const companyId = extractCompanyId(request)

    if (companyId && user) {
      const hasCompanyAccess = await verifyCompanyAccess(user.id, companyId)

      if (!hasCompanyAccess) {
        logSecurityEvent('FORBIDDEN_COMPANY_ACCESS', {
          userId: user.id,
          companyId,
          path: pathname
        })

        if (!pathname.startsWith('/api')) {
          return NextResponse.redirect(new URL('/unauthorized', request.url))
        }

        return NextResponse.json(
          { error: 'Acceso denegado - Sin permisos en esta empresa' },
          { status: 403 }
        )
      }
    }

    // ✅ ACCESO AUTORIZADO
    logSecurityEvent('AUTHORIZED_ACCESS', {
      userId: user?.id,
      companyId,
      path: pathname
    })
  }

  // 🔄 CONTINUAR CON LA REQUEST
  const response = NextResponse.next()

  // 📊 HEADERS DE SEGURIDAD
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-Security-Mode', useAuthSecurity ? 'SECURE' : 'DEMO')

  // 📈 MÉTRICAS DE PERFORMANCE
  const duration = Date.now() - startTime
  response.headers.set('X-Middleware-Duration', `${duration}ms`)

  if (duration > 500) {
    console.warn(`⚠️ Middleware lento: ${duration}ms para ${pathname}`)
  }

  return response
}

// ⚙️ CONFIGURACIÓN DE RUTAS A INTERCEPTAR
export const config = {
  matcher: [
    /*
     * Interceptar todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (icono)
     * - archivos públicos sin extensión
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
