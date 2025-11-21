// 🔒 API SECURITY WRAPPER
// Sistema de validación automática para APIs

import { NextRequest, NextResponse } from 'next/server'
import { getUser, getUserCompanies, verifyCompanyAccess, getAuthConfig } from './auth'
import { z } from 'zod'

// 👤 TIPOS DE USUARIO Y CONTEXTO DE SEGURIDAD
export interface SecurityContext {
  user: {
    id: string
    email: string
    name?: string
    role?: string
  }
  companyId: string
  userRole: 'owner' | 'admin' | 'accountant' | 'viewer'
  permissions: string[]
  isDemo: boolean
}

// 🔑 NIVELES DE PERMISOS
export type Permission = 'read' | 'write' | 'admin' | 'owner'

// 📊 CONFIGURACIÓN DE ROLES Y PERMISOS
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  owner: ['read', 'write', 'admin', 'owner'],
  admin: ['read', 'write', 'admin'],
  accountant: ['read', 'write'],
  viewer: ['read']
}

// ✅ VERIFICAR SI UN ROL TIENE UN PERMISO ESPECÍFICO
function hasPermission(userRole: string, requiredPermission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || []
  return rolePermissions.includes(requiredPermission)
}

// 🔍 EXTRAER COMPANY_ID DEL REQUEST
async function extractCompanyId(request: NextRequest): Promise<string | null> {
  const { searchParams } = new URL(request.url)

  // 1. Buscar en query parameters
  const companyIdFromQuery = searchParams.get('company_id')
  if (companyIdFromQuery) return companyIdFromQuery

  // 2. Buscar en el body (para POST/PUT/PATCH)
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    try {
      const body = await request.json()
      if (body.company_id || body.companyId) {
        return body.company_id || body.companyId
      }
    } catch (error) {
      // Ignorar errores de parsing del body
    }
  }

  // 3. Buscar en path parameters
  const pathMatch = request.url.match(/\/api\/companies\/([a-f0-9-]{36})/)
  if (pathMatch) return pathMatch[1]

  // 4. Default para modo desarrollo
  const authConfig = getAuthConfig()
  if (!authConfig.useAuthSecurity) {
    return '550e8400-e29b-41d4-a716-446655440001' // Demo company
  }

  return null
}

// 📝 LOGGING DE ACTIVIDAD DE APIs
function logApiActivity(type: string, context: Partial<SecurityContext>, details: any = {}) {
  const timestamp = new Date().toISOString()
  console.log(`🔒 [${timestamp}] API_${type}:`, {
    userId: context.user?.id,
    companyId: context.companyId,
    userRole: context.userRole,
    isDemo: context.isDemo,
    ...details
  })

  // TODO: En producción, enviar a sistema de audit logs
}

// 🚀 WRAPPER PRINCIPAL PARA APIS CON AUTENTICACIÓN
export function withAuth(
  handler: (request: NextRequest, context: SecurityContext) => Promise<NextResponse>,
  options: {
    requiredPermission?: Permission
    validateCompany?: boolean
    allowDemo?: boolean
  } = {}
) {
  const { requiredPermission = 'read', validateCompany = true, allowDemo = true } = options

  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now()

    try {
      // 📊 OBTENER CONFIGURACIÓN DE AUTENTICACIÓN
      const authConfig = getAuthConfig()
      const isDemo = !authConfig.useAuthSecurity

      // 🔐 VERIFICAR AUTENTICACIÓN
      const user = await getUser()

      if (!user) {
        if (isDemo && allowDemo) {
          // En modo demo, usar usuario por defecto
          const demoUser = {
            id: '550e8400-e29b-41d4-a716-446655440000',
            email: 'demo@contapyme.cl',
            name: 'Usuario Demo'
          }

          const demoContext: SecurityContext = {
            user: demoUser,
            companyId: '550e8400-e29b-41d4-a716-446655440001',
            userRole: 'owner',
            permissions: ['read', 'write', 'admin', 'owner'],
            isDemo: true
          }

          logApiActivity('DEMO_ACCESS', demoContext, { endpoint: request.url })
          return handler(request, demoContext)
        }

        logApiActivity('UNAUTHORIZED', {}, { endpoint: request.url, ip: request.ip })
        return NextResponse.json(
          { error: 'No autorizado - Se requiere autenticación' },
          { status: 401 }
        )
      }

      // 🏢 OBTENER Y VALIDAR COMPANY_ID
      let companyId: string | null = null
      let userRole: string = 'viewer'
      let permissions: string[] = ['read']

      if (validateCompany) {
        companyId = await extractCompanyId(request)

        if (!companyId) {
          logApiActivity('MISSING_COMPANY', { user }, { endpoint: request.url })
          return NextResponse.json(
            { error: 'Company ID requerido' },
            { status: 400 }
          )
        }

        // Verificar acceso a la empresa
        const hasAccess = await verifyCompanyAccess(user.id, companyId)
        if (!hasAccess && !isDemo) {
          logApiActivity('FORBIDDEN_COMPANY', { user, companyId }, { endpoint: request.url })
          return NextResponse.json(
            { error: 'Acceso denegado - Sin permisos en esta empresa' },
            { status: 403 }
          )
        }

        // Obtener rol y permisos del usuario en la empresa
        const userCompanies = await getUserCompanies(user.id)
        const companyAccess = userCompanies.find(c => c.company_id === companyId)

        if (companyAccess) {
          userRole = companyAccess.role
          permissions = companyAccess.permissions || ROLE_PERMISSIONS[userRole] || ['read']
        }
      }

      // 🔑 VERIFICAR PERMISOS ESPECÍFICOS
      if (!hasPermission(userRole, requiredPermission) && !isDemo) {
        logApiActivity('INSUFFICIENT_PERMISSIONS', {
          user,
          companyId: companyId || 'N/A',
          userRole: userRole as any
        }, {
          required: requiredPermission,
          endpoint: request.url
        })

        return NextResponse.json(
          { error: `Permisos insuficientes - Se requiere permiso: ${requiredPermission}` },
          { status: 403 }
        )
      }

      // ✅ CREAR CONTEXTO DE SEGURIDAD
      const context: SecurityContext = {
        user: {
          id: user.id,
          email: user.email || '',
          name: user.name || user.full_name,
          role: userRole
        },
        companyId: companyId || '',
        userRole: userRole as any,
        permissions,
        isDemo
      }

      logApiActivity('AUTHORIZED', context, {
        endpoint: request.url,
        method: request.method,
        permission: requiredPermission
      })

      // 🚀 EJECUTAR HANDLER PRINCIPAL
      const response = await handler(request, context)

      // 📈 AGREGAR HEADERS DE SEGURIDAD Y MÉTRICAS
      const duration = Date.now() - startTime
      response.headers.set('X-User-Id', context.user.id)
      response.headers.set('X-Company-Id', context.companyId)
      response.headers.set('X-User-Role', context.userRole)
      response.headers.set('X-Security-Mode', isDemo ? 'DEMO' : 'SECURE')
      response.headers.set('X-Processing-Time', `${duration}ms`)

      if (duration > 1000) {
        console.warn(`⚠️ API lenta: ${duration}ms para ${request.url}`)
      }

      logApiActivity('COMPLETED', context, {
        duration,
        status: response.status
      })

      return response

    } catch (error) {
      const duration = Date.now() - startTime

      logApiActivity('ERROR', {}, {
        error: error instanceof Error ? error.message : 'Error desconocido',
        endpoint: request.url,
        duration
      })

      console.error('❌ Error en API Security Wrapper:', error)

      return NextResponse.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
      )
    }
  }
}

// 🚀 WRAPPERS ESPECÍFICOS POR TIPO DE OPERACIÓN
export const withReadAccess = (handler: (request: NextRequest, context: SecurityContext) => Promise<NextResponse>) =>
  withAuth(handler, { requiredPermission: 'read' })

export const withWriteAccess = (handler: (request: NextRequest, context: SecurityContext) => Promise<NextResponse>) =>
  withAuth(handler, { requiredPermission: 'write' })

export const withAdminAccess = (handler: (request: NextRequest, context: SecurityContext) => Promise<NextResponse>) =>
  withAuth(handler, { requiredPermission: 'admin' })

export const withOwnerAccess = (handler: (request: NextRequest, context: SecurityContext) => Promise<NextResponse>) =>
  withAuth(handler, { requiredPermission: 'owner' })

// 📊 WRAPPER PARA APIs PÚBLICAS (CON LOGGING)
export function withPublicAccess(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now()

    try {
      logApiActivity('PUBLIC_ACCESS', {}, {
        endpoint: request.url,
        ip: request.ip,
        userAgent: request.headers.get('user-agent')
      })

      const response = await handler(request)
      const duration = Date.now() - startTime

      response.headers.set('X-Security-Mode', 'PUBLIC')
      response.headers.set('X-Processing-Time', `${duration}ms`)

      return response

    } catch (error) {
      console.error('❌ Error en API pública:', error)
      return NextResponse.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
      )
    }
  }
}

// 🔍 VALIDADOR DE SCHEMAS CON ZOD
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (request: NextRequest, context: SecurityContext, validatedData: T) => Promise<NextResponse>,
  authOptions?: Parameters<typeof withAuth>[1]
) {
  return withAuth(async (request: NextRequest, context: SecurityContext) => {
    try {
      const body = await request.json()
      const validatedData = schema.parse(body)

      return handler(request, context, validatedData)
    } catch (error) {
      if (error instanceof z.ZodError) {
        logApiActivity('VALIDATION_ERROR', context, {
          errors: error.errors,
          endpoint: request.url
        })

        return NextResponse.json(
          {
            error: 'Datos inválidos',
            details: error.errors
          },
          { status: 400 }
        )
      }

      throw error // Re-throw otros errores
    }
  }, authOptions)
}

// 📊 FUNCIONES DE UTILIDAD PARA DESARROLLO
export const getSecurityStatus = () => {
  const authConfig = getAuthConfig()
  return {
    ...authConfig,
    wrapperVersion: '1.0.0',
    features: {
      authentication: true,
      authorization: true,
      companyValidation: true,
      auditLogging: true,
      performanceMetrics: true,
      zodValidation: true
    }
  }
}

// 🧪 MODO DE PRUEBA (DESHABILITA SEGURIDAD TEMPORALMENTE)
export function withTestMode(
  handler: (request: NextRequest, context: SecurityContext) => Promise<NextResponse>
) {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Test mode solo disponible en entorno de testing')
  }

  return async (request: NextRequest): Promise<NextResponse> => {
    const testContext: SecurityContext = {
      user: {
        id: 'test-user-id',
        email: 'test@test.com',
        name: 'Test User'
      },
      companyId: 'test-company-id',
      userRole: 'owner',
      permissions: ['read', 'write', 'admin', 'owner'],
      isDemo: true
    }

    return handler(request, testContext)
  }
}