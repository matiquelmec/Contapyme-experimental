'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  LogOut,
  HelpCircle,
  Settings,
  ChevronDown,
  Building2,
  Home,
  Calculator,
  Users,
  TrendingUp,
  Menu,
  X,
  UserCircle,
  CreditCard,
} from 'lucide-react'

import { useAuth } from '@/contexts/AuthContext'
import { useCompany } from '@/contexts/CompanyContext'

/**
 * Global Header Unificado
 *
 * Header fijo que aparece en todas las páginas principales de la aplicación.
 * Combina:
 * - Logo y branding de ContaPyme
 * - Navegación principal entre módulos
 * - Búsqueda global
 * - Notificaciones y controles de usuario
 * - Status del sistema
 */
export function GlobalHeader() {
  const { user, signOut } = useAuth() as any
  const { company, switchCompany } = useCompany()
  const pathname = usePathname()
  const [notifications, setNotifications] = useState(3)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isCompanyMenuOpen, setIsCompanyMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Handle hydration
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => { clearInterval(timer); }
  }, [])

  const handleSignOut = async () => {
    await signOut()
  }

  const handleSearch = () => {
    // TODO: Implementar modal de búsqueda
    console.log('Búsqueda global activada')
    // Redirigir temporalmente a página principal como fallback
    // window.location.href = '/portal'
  }

  const handleNotifications = () => {
    // TODO: Implementar panel de notificaciones
    console.log('Panel de notificaciones activado')
    // Reducir contador al hacer clic (simulación)
    if (notifications > 0) {
      setNotifications(prev => prev - 1)
    }
  }

  const handleUserProfile = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  const getUserDisplayName = () => {
    if ((user as any)?.user_metadata?.full_name) {
      return (user as any).user_metadata.full_name
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return 'Usuario'
  }

  const getUserInitials = () => {
    const name = getUserDisplayName()
    return name.charAt(0).toUpperCase()
  }

  // Available demo companies
  const availableCompanies = [
    {
      id: 'demo-1',
      name: 'Empresa Demo S.A.',
      rut: '78.223.873-6'
    },
    {
      id: 'demo-2',
      name: 'Mi Pyme Ltda.',
      rut: '98.765.432-1'
    }
  ]

  const handleCompanySwitch = (companyId: string) => {
    console.log('🔄 Switching to company:', companyId)
    switchCompany(companyId)
    setIsCompanyMenuOpen(false)
  }

  const getCurrentCompanyDisplayId = () => {
    // Map back from database ID to display ID
    if (company.id === '8033ee69-b420-4d91-ba0e-482f46cd6fce') return 'demo-1'
    if (company.id === '9144ff7a-c530-5e82-cb1f-593f57de7fde') return 'demo-2'
    return 'demo-1'
  }

  // Prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-8 w-64 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  // Hide header only on login/register pages
  const shouldShowHeader = !pathname.startsWith('/login') && !pathname.startsWith('/register')

  if (!shouldShowHeader) {
    return null
  }

  // Ensure contexts are loaded
  if (!user || !company) {
    return (
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-8 w-64 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const navigationItems = [
    {
      href: '/portal',
      icon: Home,
      label: 'Portal',
      badge: 'HUB',
      active: pathname.startsWith('/portal') || pathname === '/',
    },
    {
      href: '/accounting',
      icon: Calculator,
      label: 'Contabilidad',
      active: pathname.startsWith('/accounting'),
    },
    {
      href: '/payroll',
      icon: Users,
      label: 'Remuneraciones',
      active: pathname.startsWith('/payroll'),
    },
    {
      href: '/dashboard-new',
      icon: TrendingUp,
      label: 'Dashboard Ejecutivo',
      active: pathname.startsWith('/dashboard-new'),
    },
  ]

  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Left: Logo ContaPyme Oficial */}
          <Link href="/portal" className="flex items-center group">
            <img
              src="/images/logo.png"
              alt="ContaPymePuq"
              className="h-32 w-auto drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Center: Navigation (Desktop) */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    item.active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-xs font-bold text-blue-700 bg-blue-100 rounded">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right: Company Selector + User Controls */}
          <div className="flex items-center space-x-3">
            {/* Company Selector */}
            <div className="relative">
              <button
                onClick={() => setIsCompanyMenuOpen(!isCompanyMenuOpen)}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                title="Cambiar empresa"
              >
                <Building2 className="w-4 h-4 text-gray-600" />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{company.razon_social}</div>
                  <div className="text-xs text-gray-500">{company.rut}</div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isCompanyMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Company Dropdown */}
              {isCompanyMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsCompanyMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="text-sm font-medium text-gray-900">Cambiar Empresa</h3>
                    </div>
                    {availableCompanies.map((comp) => {
                      const isActive = getCurrentCompanyDisplayId() === comp.id
                      return (
                        <button
                          key={comp.id}
                          onClick={() => handleCompanySwitch(comp.id)}
                          className={`flex items-center justify-between w-full px-4 py-3 text-sm transition-colors ${
                            isActive
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="text-left">
                            <div className="font-medium">{comp.name}</div>
                            <div className="text-xs opacity-75">{comp.rut}</div>
                          </div>
                          {isActive && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
            {/* User Menu */}
            <div className="relative flex items-center space-x-2 pl-3 border-l border-gray-200">
              <div className="relative">
                <button
                  onClick={handleUserProfile}
                  className="flex items-center space-x-2 hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors"
                  title="Menú de usuario"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-200 hover:scale-105">
                    <span className="text-white text-sm font-medium">{getUserInitials()}</span>
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-sm font-medium text-gray-700">{getUserDisplayName()}</div>
                    <div className="text-xs text-gray-500">{user?.email}</div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => { setIsUserMenuOpen(false); }}
                    />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 py-2">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">{getUserInitials()}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          href="/profile"
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => { setIsUserMenuOpen(false); }}
                        >
                          <UserCircle className="w-4 h-4" />
                          <span>Mi Perfil</span>
                        </Link>

                        <Link
                          href="/company-settings"
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => { setIsUserMenuOpen(false); }}
                        >
                          <Building2 className="w-4 h-4" />
                          <span>Mi Empresa</span>
                        </Link>

                        <Link
                          href="/account-settings"
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => { setIsUserMenuOpen(false); }}
                        >
                          <Settings className="w-4 h-4" />
                          <span>Configuración</span>
                        </Link>

                        <Link
                          href="/billing"
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => { setIsUserMenuOpen(false); }}
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Facturación</span>
                        </Link>

                        <Link
                          href="/help"
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => { setIsUserMenuOpen(false); }}
                        >
                          <HelpCircle className="w-4 h-4" />
                          <span>Ayuda y Soporte</span>
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 py-2">
                        <button
                          onClick={async () => {
                            setIsUserMenuOpen(false)
                            await handleSignOut()
                          }}
                          className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => { setIsMobileMenuOpen(!isMobileMenuOpen); }}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-3">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => { setIsMobileMenuOpen(false); }}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      item.active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-xs font-bold text-blue-700 bg-blue-100 rounded">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
