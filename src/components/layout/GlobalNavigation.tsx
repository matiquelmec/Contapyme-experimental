'use client'

import { useState } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  LayoutDashboard,
  Calculator,
  Users,
  TrendingUp,
  Menu,
  X,
  Home,
  Settings,
  ChevronRight,
} from 'lucide-react'

export function GlobalNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Only show navigation on main application pages, hide on portal
  const shouldShowNavigation = !pathname.startsWith('/portal') && pathname !== '/'

  if (!shouldShowNavigation) {
    return null
  }

  const navigationItems = [
    {
      href: '/portal',
      icon: Home,
      label: 'Portal',
      badge: 'HUB',
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
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/portal" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors">
              <LayoutDashboard className="w-6 h-6" />
              <span className="font-bold text-lg">ContaPyme</span>
            </Link>

            {/* Navigation Items */}
            <div className="flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      item.active
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
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

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <Link
                href="/accounting/configuration"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Configuración"
              >
                <Settings className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/portal" className="flex items-center space-x-2 text-blue-600">
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-bold">ContaPyme</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => { setIsMobileMenuOpen(!isMobileMenuOpen); }}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="border-t border-gray-200 py-2">
              <div className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => { setIsMobileMenuOpen(false); }}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        item.active
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-xs font-bold text-blue-700 bg-blue-100 rounded">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </Link>
                  )
                })}

                {/* Mobile Quick Actions */}
                <div className="border-t border-gray-100 pt-2 mt-2">
                  <Link
                    href="/accounting/configuration"
                    onClick={() => { setIsMobileMenuOpen(false); }}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Settings className="w-4 h-4" />
                      <span className="font-medium">Configuración</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}
